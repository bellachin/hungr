import express from "express";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ========== AUTHENTICATION ROUTES ==========

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ 
      username, 
      email, 
      password,
      displayName: displayName || username
    });
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        friends: user.friends
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user (protected route)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-password')
      .populate('friends', 'username displayName');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// ========== USER MANAGEMENT ROUTES (PROTECTED) ==========

// Get all users (protected - for finding friends)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select('-password')
      .populate("friends", "username displayName");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific user by ID (protected)
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate("friends", "username displayName");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== FRIENDS ROUTES (PROTECTED) ==========

// Add a friend (mutual friendship) - using logged in user
router.post("/friends/:friendId", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    if (userId === friendId) {
      return res.status(400).json({ error: "You cannot friend yourself." });
    }

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ error: "Already friends." });
    }

    // Add mutual friendship
    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friends added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get logged-in user's friends list
router.get("/friends/my-friends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate("friends", "username displayName");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a specific user's friends list (protected)
router.get("/:id/friends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("friends", "username displayName");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a friend (protected)
router.delete("/friends/:friendId", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.params;

    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found." });
    }

    // Remove mutual friendship
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    await user.save();
    await friend.save();

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// ✅ Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, displayName } = req.body;
    const newUser = new User({ username, displayName });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all users (for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate("friends", "username displayName");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a friend (mutual friendship)
router.post("/:id/friends/:friendId", async (req, res) => {
  const { id, friendId } = req.params;

  if (id === friendId) {
    return res.status(400).json({ error: "You cannot friend yourself." });
  }

  const user = await User.findById(id);
  const friend = await User.findById(friendId);

  if (!user || !friend)
    return res.status(404).json({ error: "User not found." });

  if (!user.friends.includes(friendId)) user.friends.push(friendId);
  if (!friend.friends.includes(id)) friend.friends.push(id);

  await user.save();
  await friend.save();

  res.json({ message: "Friends added successfully" });
});

// ✅ Get a user’s friends list
router.get("/:id/friends", async (req, res) => {
  const user = await User.findById(req.params.id).populate("friends", "username displayName");
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json(user.friends);
});

export default router;

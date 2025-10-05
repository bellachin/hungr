import express from "express";
import User from "../models/User.js";

const router = express.Router();

// create a user
router.post("/", async (req, res) => {
  try {
    const { username, displayName } = req.body;
    const user = new User({ username, displayName });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// add a friend (mutual)
router.post("/:id/friends/:friendId", async (req, res) => {
  const { id, friendId } = req.params;
  const user = await User.findById(id);
  const friend = await User.findById(friendId);

  if (!user || !friend)
    return res.status(404).json({ error: "User not found" });

  if (!user.friends.includes(friendId)) user.friends.push(friendId);
  if (!friend.friends.includes(id)) friend.friends.push(id);

  await user.save();
  await friend.save();

  res.json({ message: "Friends added successfully" });
});

// get a user's friends
router.get("/:id/friends", async (req, res) => {
  const user = await User.findById(req.params.id).populate("friends");
  res.json(user.friends);
});

export default router;

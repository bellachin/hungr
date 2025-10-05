// import express from "express";
// import Item from "../models/Item.js";

// const router = express.Router();

// // Get all items
// router.get("/", async (req, res) => {
//   const items = await Item.find();
//   res.json(items);
// });

// // Add new item
// router.post("/", async (req, res) => {
//   const newItem = new Item(req.body);
//   await newItem.save();
//   res.json({ message: "Item added successfully" });
// });

// // Update item
// router.put("/:id", async (req, res) => {
//   await Item.findByIdAndUpdate(req.params.id, req.body);
//   res.json({ message: "Item updated successfully" });
// });

// // Delete item
// router.delete("/:id", async (req, res) => {
//   await Item.findByIdAndDelete(req.params.id);
//   res.json({ message: "Item deleted successfully" });
// });

// export default router;


// backend/routes/itemRoutes.js
import express from "express";
import Item from "../models/Item.js";

const router = express.Router();

// Get all items
router.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Add new item
router.post("/", async (req, res) => {
  const newItem = new Item(req.body);
  await newItem.save();
  res.json({ message: "Item added successfully" });
});

// Update item
router.put("/:id", async (req, res) => {
  await Item.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Item updated successfully" });
});

// Delete item
router.delete("/:id", async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted successfully" });
});

export default router;
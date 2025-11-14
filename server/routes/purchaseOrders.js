const express = require("express");
const router = express.Router();
const PurchaseOrder = require("../models/PurchaseOrder");
const protect = require("../middleware/auth");

// ✅ GET All POs
router.get("/", protect, async (req, res) => {
  try {
    // FIX: Changed req.user.id to req.userId
    const orders = await PurchaseOrder.find({ createdBy: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching POs:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ POST Create PO
router.post("/", protect, async (req, res) => {
  try {
    const { candidateName, positionTitle, department, rate, startDate } = req.body;

    if (!candidateName || !positionTitle || !rate || !startDate) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    // Auto-generate PO Number
    const poNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = new PurchaseOrder({
      poNumber,
      candidateName,
      positionTitle,
      department,
      rate,
      startDate,
      status: "Pending",
      // FIX: Changed req.user.id to req.userId to match auth middleware
      createdBy: req.userId, 
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error creating PO:", err);
    // ✅ FIXED TYPO HERE: Removed 'QH'
    res.status(500).json({ message: "Server Error creating PO: " + err.message });
  }
});

// ✅ PUT Update Status
router.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedPO = await PurchaseOrder.findOneAndUpdate(
      { _id: req.params.id },
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedPO) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }

    res.json(updatedPO);
  } catch (err) {
    console.error("Error updating PO:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ DELETE PO
router.delete("/:id", protect, async (req, res) => {
  try {
    // FIX: Changed req.user.id to req.userId
    const deleted = await PurchaseOrder.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Purchase Order not found" });
    }
    res.json({ message: "Purchase Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting PO:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
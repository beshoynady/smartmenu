const mongoose = require("mongoose");
const ConsumptionModel = require("../models/Consumption.model");

// Create a new kitchen consumption
const createConsumption = async (req, res) => {
  try {
    const {
      section,
      stockItem,
      quantityTransferred,
      quantityConsumed,
      actualBalance,
      adjustment,
      adjustmentReason,
      quantityRemaining,
      carriedForward,
      returnedToStock,
      deliveredBy,
      receivedBy,
      tickets,
      date,
      remarks,
    } = req.body;

    // Validate required fields
    if (!section || !stockItem || !quantityTransferred || !deliveredBy || !receivedBy) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const consumptionData = {
      section,
      stockItem,
      quantityTransferred,
      quantityConsumed: quantityConsumed || 0,
      actualBalance: actualBalance || 0,
      adjustment: adjustment || 0,
      adjustmentReason: adjustmentReason || null,
      quantityRemaining: quantityRemaining || 0,
      carriedForward: carriedForward || 0,
      returnedToStock: returnedToStock || 0,
      deliveredBy,
      receivedBy,
      tickets: tickets || [],
      date: date || Date.now(),
      remarks: remarks || "",
    };

    const newConsumption = await ConsumptionModel.create(consumptionData);
    res.status(201).json({ success: true, data: newConsumption });
  } catch (err) {
    console.error("Error creating consumption:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update kitchen consumption by ID
const updateConsumptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      section,
      stockItem,
      quantityTransferred,
      quantityConsumed,
      actualBalance,
      adjustment,
      adjustmentReason,
      quantityRemaining,
      carriedForward,
      returnedToStock,
      deliveredBy,
      receivedBy,
      ticketId,
      date,
      remarks,
    } = req.body;

    // التحقق من صحة المعرف
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // تحديث البيانات باستخدام $set
    const updatedConsumption = await ConsumptionModel.findByIdAndUpdate(
      id,
      {
        $set: {
          section,
          stockItem,
          quantityTransferred,
          quantityConsumed,
          actualBalance,
          adjustment,
          adjustmentReason,
          quantityRemaining,
          carriedForward,
          returnedToStock,
          deliveredBy,
          receivedBy,
          date,
          remarks,
        },
        $push: {
          tickets: ticketId , 
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedConsumption) {
      return res.status(404).json({
        success: false,
        message: "Consumption record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Consumption record updated successfully",
      data: updatedConsumption,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update consumption record",
      error: error.message,
    });
  }
};


// Get all kitchen consumptions
const getAllConsumptions = async (req, res) => {
  try {
    const consumptions = await ConsumptionModel.find({})
      .populate("section")
      .populate("tickets")
      .populate("stockItem")
      .populate("deliveredBy", "_id fullname username role")
      .populate("receivedBy", "_id fullname username role");

    res.status(200).json({ success: true, data: consumptions });
  } catch (err) {
    console.error("Error fetching consumptions:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get single kitchen consumption by ID
const getConsumptionById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }

    const consumption = await ConsumptionModel.findById(id)
      .populate("section")
      .populate("tickets")
      .populate("stockItem")
      .populate("deliveredBy", "_id fullname username role")
      .populate("receivedBy", "_id fullname username role");

    if (!consumption) {
      return res.status(404).json({ success: false, error: "Consumption record not found" });
    }

    res.status(200).json({ success: true, data: consumption });
  } catch (err) {
    console.error("Error fetching consumption by ID:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete kitchen consumption by ID
const deleteConsumptionById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid ID format" });
    }

    const deletedConsumption = await ConsumptionModel.findByIdAndDelete(id);

    if (!deletedConsumption) {
      return res.status(404).json({ success: false, error: "Consumption record not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error("Error deleting consumption:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  createConsumption,
  updateConsumptionById,
  getAllConsumptions,
  getConsumptionById,
  deleteConsumptionById,
};

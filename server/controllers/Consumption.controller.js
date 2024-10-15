const ConsumptionModel = require("../models/Consumption.model");

// Create a new kitchen consumption
const createConsumption = async (req, res) => {
  try {
    const {
      consumptionSource,
      stockItemId,
      stockItemName,
      quantityTransferred,
      consumptionQuantity,
      unit,
      bookBalance,
      actualBalance,
      adjustment,
      receivedBy,
    } = req.body;

    const newConsumption = await ConsumptionModel.create({
      consumptionSource,
      stockItemId,
      stockItemName,
      quantityTransferred,
      consumptionQuantity,
      unit,
      bookBalance,
      actualBalance,
      adjustment,
      receivedBy,
    });

    res.status(201).json({ newConsumption });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Update kitchen consumption by ID
const updateConsumptionById = async (req, res) => {
  const { id } = req.params;
  const {
    consumptionSource,
    stockItemId,
    stockItemName,
    quantityTransferred,
    consumptionQuantity,
    unit,
    bookBalance,
    actualBalance,
    adjustment,
    receivedBy,
  } = req.body;

  try {
    const updatedConsumption = await ConsumptionModel.findByIdAndUpdate(
      id,
      {
        consumptionSource,
        stockItemId,
        stockItemName,
        quantityTransferred,
        consumptionQuantity,
        unit,
        bookBalance,
        actualBalance,
        adjustment,
        receivedBy,
      },
      { new: true }
    );

    if (!updatedConsumption) {
      return res
        .status(404)
        .json({ success: false, error: "Kitchen consumption not found" });
    }

    res.status(200).json({ updatedConsumption });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all kitchen consumptions
const getAllConsumptions = async (req, res) => {
  try {
    const consumptions = await ConsumptionModel.find({})
      .populate("stockItemId")
      .populate("receivedBy", "_id fullname username role");

    res.status(200).json({ success: true, data: consumptions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single kitchen consumption by ID
const getConsumptionById = async (req, res) => {
  const { id } = req.params;
  try {
    const consumption = await ConsumptionModel.findById(id)
      .populate("stockItemId")
      .populate("receivedBy", "_id fullname username role");

    if (!consumption) {
      return res
        .status(404)
        .json({ success: false, error: "Kitchen consumption not found" });
    }

    res.status(200).json({ success: true, data: consumption });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete kitchen consumption by ID
const deleteConsumptionById = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedConsumption = await ConsumptionModel.findByIdAndDelete(id);

    if (!deletedConsumption) {
      return res
        .status(404)
        .json({ success: false, error: "Kitchen consumption not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = {
  getAllConsumptions,
  getConsumptionById,
  createConsumption,
  updateConsumptionById,
  deleteConsumptionById,
};

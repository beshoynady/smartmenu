const ConsumptionModel = require("../models/Consumption.model");

// Create a new kitchen consumption
const createConsumption = async (req, res) => {
  try {
    // Destructure required fields from the request body
    const {
      section, // The preparation section receiving the items
      stockItem, // The stock item being transferred
      quantityTransferred, // The quantity of the stock item sent
      quantityConsumed, // The actual quantity consumed
      actualBalance, // The actual remaining quantity after consumption
      adjustment, // The difference between theoretical and actual balance
      adjustmentReason, // Reason for discrepancies: waste, loss, or damage
      quantityRemaining, // The quantity remaining at the end of the day
      carriedForward, // The quantity carried forward to the next day
      returnedToStock, // The quantity returned to the stockroom
      deliveredBy, // The employee responsible for delivering the item
      receivedBy, // The employee who received the item in the preparation section
      date, // The date of the record
      remarks, // Additional comments or notes about the record
    } = req.body;

    // Validate that all required fields are provided
    if (
      !section ||
      !stockItem ||
      !quantityTransferred ||
      !deliveredBy ||
      !receivedBy
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    const consumptionData = {
      section,
      stockItem,
      quantityTransferred,
      quantityConsumed,
      actualBalance,
      adjustment,
      adjustmentReason: adjustmentReason || null, // Default to null if not provided
      quantityRemaining: quantityRemaining || 0, // Default to 0 if not provided
      carriedForward: carriedForward || 0, // Default to 0 if not provided
      returnedToStock: returnedToStock || 0, // Default to 0 if not provided
      deliveredBy,
      receivedBy,
      date: date || Date.now(), // If date is not provided, use current date
      remarks: remarks || "", // Default to empty string if not provided
    };

    // Create a new consumption record
    const newConsumption = await ConsumptionModel.create(consumptionData);

    // Return success response with the newly created consumption data
    res.status(201).json({ success: true, data: newConsumption });
  } catch (err) {
    // Handle server error
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Update kitchen consumption by ID
const updateConsumptionById = async (req, res) => {
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
    date,
    remarks,
  } = req.body;

  try {
    // Find and update the consumption record by ID
    const updatedConsumption = await ConsumptionModel.findByIdAndUpdate(
      id,
      {
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
      { new: true } // Ensure the updated document is returned
    );

    // Return error if consumption not found
    if (!updatedConsumption) {
      return res
        .status(404)
        .json({ success: false, error: "Kitchen consumption not found" });
    }

    // Return success response with updated consumption data
    res.status(200).json({ success: true, data: updatedConsumption });
  } catch (err) {
    // Handle server error
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get all kitchen consumptions
const getAllConsumptions = async (req, res) => {
  try {
    // Fetch all consumptions with populated fields
    const consumptions = await ConsumptionModel.find({})
      .populate("section") // Populate section data
      .populate("stockItem") // Populate stock item data
      .populate("deliveredBy", "_id fullname username role") // Populate employee who delivered
      .populate("receivedBy", "_id fullname username role"); // Populate employee who received

    // Return success response with all consumptions
    res.status(200).json({ success: true, data: consumptions });
  } catch (err) {
    // Handle server error
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Get single kitchen consumption by ID
const getConsumptionById = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch consumption by ID with populated fields
    const consumption = await ConsumptionModel.findById(id)
      .populate("section") // Populate section data
      .populate("stockItem") // Populate stock item data
      .populate("deliveredBy", "_id fullname username role") // Populate employee who delivered
      .populate("receivedBy", "_id fullname username role"); // Populate employee who received

    // Return error if consumption not found
    if (!consumption) {
      return res
        .status(404)
        .json({ success: false, error: "Kitchen consumption not found" });
    }

    // Return success response with consumption data
    res.status(200).json({ success: true, data: consumption });
  } catch (err) {
    // Handle server error
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Delete kitchen consumption by ID
const deleteConsumptionById = async (req, res) => {
  const { id } = req.params;
  try {
    // Find and delete consumption by ID
    const deletedConsumption = await ConsumptionModel.findByIdAndDelete(id);

    // Return error if consumption not found
    if (!deletedConsumption) {
      return res
        .status(404)
        .json({ success: false, error: "Kitchen consumption not found" });
    }

    // Return success response with empty data
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    // Handle server error
    console.error(err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = {
  getAllConsumptions,
  getConsumptionById,
  createConsumption,
  updateConsumptionById,
  deleteConsumptionById,
};

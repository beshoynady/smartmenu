const StockMovementModel = require("../models/StockMovement.model");

// Controller function to create a new stock movement action
const createStockAction = async (req, res, next) => {
  try {
    // Destructure the relevant fields from the request body
    const {
      itemId,
      storeId,
      categoryId,
      costMethod,
      source,
      unit,
      inbound = {},
      outbound = {},
      balance,
      remainingQuantity = 0,
      movementDate,
      notes = "",
      expirationDate,
      // sender, // Added sender
      // receiver, // Added receiver
    } = req.body;

    const createdBy = req.employee?.id;
    const receiver = req.employee?.id;
    const sender = req.employee?.id;

    // Validate required fields
    if (
      !itemId ||
      !storeId ||
      !categoryId ||
      !costMethod ||
      !source ||
      !balance ||
      !sender || // Validate sender
      !receiver // Validate receiver
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate cost method
    const validCostMethods = ["FIFO", "LIFO", "Weighted Average"];
    if (!validCostMethods.includes(costMethod)) {
      return res.status(400).json({ message: "Invalid cost method" });
    }

    // Create a new stock movement action using the provided data
    const newStockAction = await StockMovementModel.create({
      itemId,
      storeId,
      categoryId,
      costMethod,
      source,
      unit,
      inbound,
      outbound,
      balance,
      remainingQuantity,
      movementDate,
      createdBy,
      notes,
      expirationDate,
      sender,
      receiver, // Include sender and receiver
    });

    // Respond with the created stock movement action
    res.status(201).json(newStockAction);
  } catch (error) {
    // Log and handle any errors during the creation process
    console.error("Error creating stock movement:", error);
    next(error); // Pass the error to the next middleware (e.g., an error handler)
  }
};

// Controller function to update an existing stock movement action
const updateStockAction = async (req, res, next) => {
  try {
    const {
      itemId,
      storeId,
      categoryId,
      costMethod,
      source,
      unit,
      inbound,
      outbound,
      balance,
      remainingQuantity,
      movementDate,
      notes,
      expirationDate,
      sender, // Added sender
      receiver, // Added receiver
    } = req.body;
    const updatedBy = req.employee.id;
    const actionId = req.params.actionId;

    const findAction = await StockMovementModel.findById(actionId);
    if (!findAction) {
      return res.status(400).json({ message: "Action not found" });
    }

    // Find and update the stock movement action by ID
    const updatedAction = await StockMovementModel.findByIdAndUpdate(
      actionId,
      {
        $set: {
          itemId,
          storeId,
          categoryId,
          costMethod,
          source,
          unit,
          inbound,
          outbound,
          balance,
          remainingQuantity,
          movementDate,
          updatedBy,
          notes,
          expirationDate,
          sender, // Include sender in update
          receiver, // Include receiver in update
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedAction) {
      return res.status(404).json({ message: "Action not found" });
    }

    // Respond with the updated stock movement action
    res.status(200).json(updatedAction);
  } catch (error) {
    // Handle any errors during the update process
    console.error("Error updating stock movement:", error);
    next(error);
  }
};

// Controller function to get all stock movement actions
const getAllStockActions = async (req, res, next) => {
  try {
    const allActions = await StockMovementModel.find({})
      .populate("itemId")
      .populate("storeId")
      .populate("categoryId")
      .populate("createdBy")
      .populate("sender") // Populate sender
      .populate("receiver"); // Populate receiver

    if (allActions.length > 0) {
      res.status(200).json(allActions);
    } else {
      res.status(404).json({ message: "No stock actions found" });
    }
  } catch (error) {
    // Handle any errors during the retrieval process
    console.error("Error retrieving stock movements:", error);
    next(error);
  }
};

// Controller function to get a single stock movement action by ID
const getOneStockAction = async (req, res, next) => {
  try {
    const actionId = req.params.actionId;
    const action = await StockMovementModel.findById(actionId)
      .populate("itemId")
      .populate("storeId")
      .populate("categoryId")
      .populate("createdBy")
      .populate("sender") // Populate sender
      .populate("receiver"); // Populate receiver

    if (!action) {
      return res.status(404).json({ message: "Action not found" });
    }

    res.status(200).json(action);
  } catch (error) {
    // Handle any errors during the retrieval process
    console.error("Error retrieving stock movement:", error);
    next(error);
  }
};

// Controller function to delete a stock movement action by ID
const deleteStockAction = async (req, res, next) => {
  try {
    const actionId = req.params.actionId;
    const deletedAction = await StockMovementModel.findByIdAndDelete(actionId);

    if (!deletedAction) {
      return res.status(404).json({ message: "Action not found" });
    }

    // Respond with the deleted action
    res.status(200).json(deletedAction);
  } catch (error) {
    // Handle any errors during the deletion process
    console.error("Error deleting stock movement:", error);
    next(error);
  }
};

module.exports = {
  createStockAction,
  updateStockAction,
  getOneStockAction,
  getAllStockActions,
  deleteStockAction,
};

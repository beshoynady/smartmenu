const mongoose = require("mongoose");
const StockItemsModel = require("../models/StockItems.model");

// Create a new stock item
const createStockItem = async (req, res) => {
  try {
    const {
      itemCode,
      itemName,
      categoryId,
      stores,
      largeUnit,
      parts,
      smallUnit,
      minThreshold,
      costMethod,
      suppliers,
      isActive,
      notes,
    } = req.body;
    const createdBy = req.employee.id;

    // Check for unique itemCode
    const existingItem = await StockItemsModel.findOne({ itemCode });
    if (existingItem) {
      return res.status(400).json({ error: "Item code already exists" });
    }

    // Create new stock item
    const newStockItem = await StockItemsModel.create({
      itemCode,
      itemName,
      categoryId,
      stores,
      largeUnit,
      parts,
      smallUnit,
      minThreshold,
      costMethod,
      suppliers,
      isActive,
      createdBy,
      notes,
    });

    res.status(201).json(newStockItem);
  } catch (err) {
    res.status(500).json({ error: `Failed to create item: ${err.message}` });
  }
};

// Get all stock items
const getAllStockItems = async (req, res) => {
  try {
    const allItems = await StockItemsModel.find({})
      .populate("categoryId")
      .populate("stores.storeId")
      .populate("createdBy")
      .populate("suppliers");
    res.status(200).json(allItems);
  } catch (err) {
    res.status(500).json({ error: `Failed to retrieve items: ${err.message}` });
  }
};

// Get one stock item by ID
const getOneItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const oneItem = await StockItemsModel.findById(itemId)
      .populate("categoryId")
      .populate("stores.storeId")
      .populate("createdBy")
      .populate("suppliers");
    if (!oneItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(oneItem);
  } catch (err) {
    res.status(500).json({ error: `Failed to retrieve item: ${err.message}` });
  }
};

// Update a stock item by ID
const updateStockItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const updatedData = req.body;
    
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }

    const existingItem = await StockItemsModel.findOne({ itemCode: updatedData.itemCode });
    if (existingItem && existingItem._id.toString() !== itemId) {
      return res.status(400).json({ error: "Item code already exists" });
    }

    // Update the stock item
    const updatedStockItem = await StockItemsModel.findByIdAndUpdate(
      itemId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedStockItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(updatedStockItem);
  } catch (err) {
    res.status(500).json({ error: `Failed to update item: ${err.message}` });
  }
};

// Delete a stock item by ID
const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: "Invalid item ID format" });
    }

    const itemDelete = await StockItemsModel.findByIdAndDelete(itemId);

    if (!itemDelete) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully", itemDelete });
  } catch (err) {
    res.status(500).json({ error: `Failed to delete item: ${err.message}` });
  }
};

module.exports = {
  createStockItem,
  getAllStockItems,
  getOneItem,
  updateStockItem,
  deleteItem,
};

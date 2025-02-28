const productionRecordModel = require("../models/ProductionRecord.model");
const stockItemModel = require("../models/StockItems.model");
const recipeModel = require("../models/Recipe.model");
const productionSectionModel = require("../models/ProductionSection.model");

// Create and Save a new Production Record
const createProductionRecord = async (req, res) => {
  try {
    const {
      stockItem,
      quantity,
      productionSection,
      recipe,
      materialsUsed,
      productionCost,
      productionStartTime,
    } = req.body;

    const createdBy = req.employee._id;

    // Validate request
    if (
      !stockItem ||
      !quantity ||
      !productionSection ||
      !recipe ||
      !materialsUsed ||
      !productionCost
    ) {
      return res.status(400).send({
        message: "All fields are required",
      });
    }
    const stockItemExists = await stockItemModel.findById(stockItem);
    if (!stockItemExists) {
      return res.status(404).send({
        message: "Stock item not found",
      });
    }
    const recipeExists = await recipeModel.findById(recipe);
    if (!recipeExists) {
      return res.status(404).send({
        message: "Recipe not found",
      });
    }
    const productionSectionExists = await productionSectionModel.findById(
      productionSection
    );
    if (!productionSectionExists) {
      return res.status(404).send({
        message: "Production section not found",
      });
    }
    const materialsUsedExists = await stockItemModel.find({
      _id: { $in: materialsUsed.map((m) => m.material) },
    });
    if (materialsUsedExists.length !== materialsUsed.length) {
      return res.status(404).send({
        message: "Material not found",
      });
    }

    // Create a Production Record
    const productionRecord = productionRecordModel.create({
      stockItem,
      quantity,
      productionSection,
      recipe,
      materialsUsed,
      productionCost,
      productionStartTime,
      createdBy,
    });
    res.status(201).send(productionRecord);
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Some error occurred while creating the Production Record.",
    });
  }
};

// Retrieve and return all production records from the database.
const findAllProductionRecords = async (req, res) => {
  try {
    const productionRecords = await productionRecordModel
      .find()
      .populate("stockItem")
      .populate("recipe")
      .populate("productionSection")
      .populate("createdBy", "firstName lastName email");
    res.status(200).send(productionRecords);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving production records.",
    });
  }
};

// Find a single production record with a productionRecordId
const findProductionRecord = async (req, res) => {
  try {
    const productionRecord = await productionRecordModel
      .findById(req.params.productionRecordId)
      .populate("stockItem")
      .populate("recipe")
      .populate("productionSection")
      .populate("createdBy", "firstName lastName email");
    if (!productionRecord) {
      return res.status(404).send({
        message: "Production Record not found",
      });
    }
    res.status(200).send(productionRecord);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while retrieving production record.",
    });
  }
};


// Update a production record identified by the productionRecordId in the request
const updateProductionRecord = async (req, res) => {
  try {
    const {
      stockItem,
      quantity,
      productionSection,
      recipe,
      materialsUsed,
      productionCost,
      productionStartTime,
    } = req.body;

    const updatedBy = req.employee._id;

    // Validate request
    if (
      !stockItem ||
      !quantity ||
      !productionSection ||
      !recipe ||
      !materialsUsed ||
      !productionCost
    ) {
      return res.status(400).send({
        message: "All fields are required",
      });
    }
    const stockItemExists = await stockItemModel.findById(stockItem);
    if (!stockItemExists) {
      return res.status(404).send({
        message: "Stock item not found",
      });
    }
    const recipeExists = await recipeModel.findById(recipe);
    if (!recipeExists) {
      return res.status(404).send({
        message: "Recipe not found",
      });
    }
    const productionSectionExists = await productionSectionModel.findById(
      productionSection
    );
    if (!productionSectionExists) {
      return res.status(404).send({
        message: "Production section not found",
      });
    }
    const materialsUsedExists = await stockItemModel.find({
      _id: { $in: materialsUsed.map((m) => m.material) },
    });
    if (materialsUsedExists.length !== materialsUsed.length) {
      return res.status(404).send({
        message: "Material not found",
      });
    }

    // Find production record and update it with the request body
    const productionRecord = await productionRecordModel.findByIdAndUpdate(
      req.params.productionRecordId,
      {
        stockItem,
        quantity,
        productionSection,
        recipe,
        materialsUsed,
        productionCost,
        productionStartTime,
        updatedBy,
      },
      { new: true }
    );
    if (!productionRecord) {
      return res.status(404).send({
        message: "Production Record not found",
      });
    }
    res.status(200).send(productionRecord);
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while updating the Production Record.",
    });
  }
};

// Delete a production record with the specified productionRecordId in the request
const deleteProductionRecord = async (req, res) => {
  try {
    const productionRecord = await productionRecordModel.findByIdAndRemove(
      req.params.productionRecordId
    );
    if (!productionRecord) {
      return res.status(404).send({
        message: "Production Record not found",
      });
    }
    res.status(200).send({ message: "Production Record deleted successfully!" });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Some error occurred while deleting the Production Record.",
    });
  }
};


module.exports ={
    createProductionRecord,
    findAllProductionRecords,
    findProductionRecord,
    updateProductionRecord,
    deleteProductionRecord
}

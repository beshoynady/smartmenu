const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const StockItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    SKU: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      // A unique identifier for the stock item (SKU - Stock Keeping Unit).
    },
    stores: [
      {
        storeId: {
          type: ObjectId,
          ref: "Store",
          required: true,
        },
      },
    ],
    categoryId: {
      type: ObjectId,
      ref: "CategoryStock",
      required: true,
      // Reference to the category this stock item belongs to.
    },
    storageUnit: {
      type: String,
      required: true,
    },
    parts: {
      type: Number,
      required: true,
    },
    ingredientUnit: {
      type: String,
      required: true,
    },
    minThreshold: {
      type: Number,
      default: 0,
      min: 0,
      // Minimum stock level to trigger a reorder
    },
    maxThreshold: {
      type: Number,
      default: 0,
      min: 0,
      // Maximum stock level to avoid overstocking.
    },
    costMethod: {
      type: String,
      enum: ["FIFO", "LIFO", "Weighted Average"],
      required: true,
    },
    costPerPart: {
      type: Number,
      default: 0,
    },
    suppliers: [
      {
        type: ObjectId,
        ref: "Supplier",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: ObjectId,
      ref: "Employee",
      required: true,
    },
    updatedBy: {
      type: ObjectId,
      ref: "Employee",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StockItemModel = mongoose.model("StockItem", StockItemSchema);
module.exports = StockItemModel;

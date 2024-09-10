const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const StockItemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    itemName: {
      type: String,
      trim: true,
      required: true,
      unique: true,
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
    },
    largeUnit: {
      type: String,
      required: true,
    },
    parts: {
      type: Number,
      required: true,
    },
    smallUnit: {
      type: String,
      required: true,
    },
    minThreshold: {
      type: Number,
      default: 0,
    },
    costMethod: {
      type: String,
      enum: ["FIFO", "LIFO", "Weighted Average"],
      required: true,
    },
    suppliers: [
      {
        type: ObjectId,
        ref: "Supplier",
      },
    ],
    isActive: {
      type: Boolean,
      default: "true",
      required: true,
    },
    createdBy: {
      type: ObjectId,
      ref: "Employee",
      required: true,
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

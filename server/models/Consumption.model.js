const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const ConsumptionSchema = new mongoose.Schema(
  {
    consumptionSource: {
      type: String,
      enum: ["kitchen", "bar", "grill"],
      required: true,
    },
    stockItemId: {
      type: ObjectId,
      ref: "StockItem",
      required: true,
    },
    stockItemName: {
      type: String,
      required: true,
    },
    quantityTransferred: {
      type: Number,
      required: true,
    },
    consumptionQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    bookBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    actualBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    adjustment: {
      type: Number,
      required: true,
      default: 0,
    },
    // productsProduced: [
    //   {
    //     productId: {
    //       type: ObjectId,
    //       ref: "Product",
    //       required: true,
    //     },
    //     sizeId: {
    //       type: ObjectId,
    //       ref: "Product",
    //       default: null,
    //     },
    //     productName: {
    //       type: String,
    //       required: true,
    //     },
    //     sizeName: {
    //       type: String,
    //     },
    //     productionCount: {
    //       type: Number,
    //       required: true,
    //       default: 0,
    //     },
    //   },
    // ],
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
    receivedBy: {
      type: ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConsumptionModel = mongoose.model("Consumption", ConsumptionSchema);

module.exports = ConsumptionModel;

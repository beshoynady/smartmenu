const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const recipeSchema = new mongoose.Schema(
  {
    // productId: {
    //   type: ObjectId,
    //   ref: "Product",
    //   required: true,
    // },
    recipeType: {
      type: String,
      required: true,
      enum: ["finalProduct", "stockItem"],
      default: "finalProduct",
    },
    productId: {
      type: ObjectId,
      ref: "Product",
      required: function() {
        return this.recipeType === "finalProduct";
      },
    },
    stockItemId: {
      type: ObjectId,
      ref: "StockItem",
      required: function() {
        return this.recipeType === "stockItem";
      },
    },
    productName: {
      type: String,
      required: true,
    },
    sizeId: {
      type: ObjectId,
      ref: "Product",
      default: null,
    },
    sizeName: {
      type: String,
      required: true,
      default: "oneSize",
    },
    numberOfMeals: {
      type: Number,
      required: true,
      default: 1,
    },
    preparationTime: {
      type: Number,
      required: true,
      default: 0,
    },
    ingredients: [
      {
        itemId: {
          type: ObjectId,
          ref: "StockItem",
          required: true,
        },
        name: {
          type: String,
          trim: true,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        unit: {
          type: String,
          trim: true,
          required: true,
        },
        wastePercentage: {
          type: Number,
          default: 0,
        },
      },
    ],
    // serviceDetails: {
    //   dineIn: [
    //     {
    //       itemId: {
    //         type: ObjectId,
    //         ref: "StockItem",
    //         required: true,
    //       },
    //       name: {
    //         type: String,
    //         trim: true,
    //         required: true,
    //       },
    //       amount: {
    //         type: Number,
    //         required: true,
    //       },
    //       unit: {
    //         type: String,
    //         trim: true,
    //         required: true,
    //       },
    //       wastePercentage: {
    //         type: Number,
    //         default: 0,
    //       },
    //     },
    //   ],
    //   takeaway: [
    //     {
    //       itemId: {
    //         type: ObjectId,
    //         ref: "StockItem",
    //         required: true,
    //       },
    //       name: {
    //         type: String,
    //         trim: true,
    //         required: true,
    //       },
    //       amount: {
    //         type: Number,
    //         required: true,
    //       },
    //       unit: {
    //         type: String,
    //         trim: true,
    //         required: true,
    //       },
    //       wastePercentage: {
    //         type: Number,
    //         default: 0,
    //       },
    //     },
    //   ],
    //   delivery: [
    //     {
    //       itemId: {
    //         type: ObjectId,
    //         ref: "StockItem",
    //         required: true,
    //       },
    //       name: {
    //         type: String,
    //         trim: true,
    //         required: true,
    //       },
    //       amount: {
    //         type: Number,
    //         required: true,
    //       },
    //       unit: {
    //         type: String,
    //         trim: true,
    //         required: true,
    //       },
    //       wastePercentage: {
    //         type: Number,
    //         default: 0,
    //       },
    //     },
    //   ],
    // },
    serviceDetails: [
      {
        serviceType: {
          type: String,
          required: true,
          enum: ["dineIn", "takeaway", "delivery"],
        },
        items: [
          {
            itemId: { type: ObjectId, ref: "StockItem", required: true },
            name: { type: String, trim: true, required: true },
            amount: { type: Number, required: true, min: 0 },
            unit: { type: String, trim: true, required: true },
            wastePercentage: { type: Number, default: 0, min: 0, max: 100 },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

recipeSchema.index(
  { sizeId: 1 },
  {
    unique: true,
    partialFilterExpression: { sizeId: { $exists: true, $ne: null } },
  }
);

const RecipeModel = mongoose.model("Recipe", recipeSchema);

module.exports = RecipeModel;

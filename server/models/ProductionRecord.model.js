const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema;

const productionRecordSchema = new mongoose.Schema({
    stockItem: {
        type: ObjectId,
        ref: "StockItem",
        required: [true, "Stock item is required"],
    },
    quantity: {
        type: Number,
        required: [true, "Quantity is required"],
    },
    productionDate: {
        type: Date,
        required: [true, "Production date is required"],
    },
    productionNumber: {
        type: Number,
        required: [true, "Production number is required"],
    },
    productionTime: {
        type: Number,
        required: [true, "Production time is required"],
    },
    productionStatus: { // This is the status of the production
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
    },
    productionSection: {    // This is the production section responsible for the production
        type: ObjectId,
        ref: "preparationSection",
        required: [true, "Production section is required"],
    },
    recipe: {
        type: ObjectId,
        ref: "Recipe",
        required: [true, "Recipe is required"],
    },
    materialsUsed: [
        {
            material: {
                type: ObjectId,
                ref: "stockItem",
                required: [true, "Material is required"],
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
            },
        },
    ],
    // This is the cost of the production
    productionCost: { 
        type: Number,
        required: [true, "Production cost is required"],
    },
    
    createdBy: {
        type: ObjectId,
        ref: "Employee",
        required: [true, "Created by is required"],
    },
    updatedBy: {
        type: ObjectId,
        ref: "Employee",
    },

},{
    timestamps: true,
});

module.exports = mongoose.model("ProductionRecord", productionRecordSchema);
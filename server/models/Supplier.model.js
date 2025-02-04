const mongoose = require("mongoose");

const { Schema } = mongoose;

// Supplier Schema
const SupplierSchema = new Schema(
  {
    // Supplier name
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensures no duplicate supplier names
      index: true, // Optimizes search queries
      maxlength: 255,
    },
    // Responsible person
    responsiblePerson: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    // Supplier contact information
    phone: [
      {
        type: String,
        trim: true,
        required: true,
        validate: {
          validator: (v) => /^\+(?:[0-9] ?){6,14}[0-9]$/.test(v),
          message: "Please enter a valid phone number",
        },
      },
    ],
    whatsapp: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || /^\+(?:[0-9] ?){6,14}[0-9]$/.test(v),
        message: "Please enter a valid WhatsApp number",
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => !v || /\S+@\S+\.\S+/.test(v),
        message: "Please enter a valid email address",
      },
    },
    // Supplier address
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    // Items supplied by the supplier
    itemsSupplied: [
      {
        type: Schema.Types.ObjectId,
        ref: "StockItem",
        default: [],
      },
    ],
    // Current balance of the supplier
    currentBalance: {
      type: Number,
      default: 0,
      required: true,
      min: 0,
    },
    // Supplier payment type
    paymentType: {
      type: String,
      enum: ["Cash", "Installments"],
      required: true,
    },
    // Financial information
    financialInfo: [
      {
        paymentMethodName: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        accountNumber: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        currency: {
          type: String,
          trim: true,
          default: "EGP", // Default currency
          enum: ["USD", "EUR", "SAR", "EGP"], // You can extend this list
        },
      },
    ],
    // Additional notes about the supplier
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  { timestamps: true }
);

// Define the Supplier model
const SupplierModel = mongoose.model("Supplier", SupplierSchema);

// Export the Supplier model
module.exports = SupplierModel;

const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const PreparationTicketSchema = new mongoose.Schema(
  {
    order: {
      type: ObjectId,
      ref: "Order",
      required: true,
    },
    preparationSection: {
      type: String,
      required: [true, "Preparation section is required"],
      enum: ["Kitchen", "Bar", "Grill"],
    },
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
    // preparationSection: {
    //   type: ObjectId,
    //   ref: "PreparationSection",
    //   required: true,
    // },
    preparationStatus: {
      type: String,
      default: "Pending",
      required: true,
      enum: [
        "Pending",
        "Preparing",
        "Prepared",
        "On the way",
        "Delivered",
        "Cancelled",
      ],
    },
    responsibleEmployee: {
      type: ObjectId,
      ref: "Employee",
    },
    waiter: {
      type: ObjectId,
      ref: "Employee",
      default: null,
      required: true
    },
    products: [
      {
        productid: {
          type: ObjectId,
          ref: "Product",
          required: true,
        },
        orderProductId: {
          type: ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        sizeId: {
          type: ObjectId,
          ref: "Product",
        },
        size: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          default: 0,
          required: true,
          min: 1,
          max: 1000000,
        },
        notes: {
          type: String,
          default: "",
          trim: true,
        },
        extras: [
          {
            extraDetails: [
              {
                extraId: {
                  type: ObjectId,
                  ref: "Product",
                },
                name: {
                  type: String,
                  required: true,
                  trim: true,
                },
              },
            ],
            isDone: {
              type: Boolean,
              default: false,
              required: true,
            },
          },
        ],
        isDone: {
          type: Boolean,
          default: false,
          required: true,
        },
        isDelivered: {
          type: Boolean,
          default: false,
          required: true,
        },
        isAdd: {
          type: Boolean,
          default: false,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const PreparationTicketModel = mongoose.model(
  "PreparationTicket",
  PreparationTicketSchema
);

module.exports = PreparationTicketModel;

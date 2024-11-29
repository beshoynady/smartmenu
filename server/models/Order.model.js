const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema;

// Define common validation for number fields
const defaultOptions = {
  type: Number,
  default: 0,
  required: true,
  min: 0,
  max: 1000000,
  trim: true,
};

const OrderSchema = new mongoose.Schema({
  // Serial number of the order
  serial: {
    type: String,
    default: '000001',
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{6}$/.test(v);
      },
      message: '{VALUE} is not a valid serial number'
    }
  },
  // Order number
  orderNum: {
    type: Number,
    min: 1,
    max: 1000000,
  },
  // Array of products in the order
  products: [
    {
      productid: {
        type: ObjectId,
        ref: 'Product',
        required: true,
      },
      // Product name
      name: {
        type: String,
        required: true,
        trim: true,
      },
      sizeId: {
        type: ObjectId,
        ref: 'Product',
      },
      size: {
        type: String,
        trim: true,
      },
      // Quantity of the product
      quantity: {
        ...defaultOptions,
        validate: {
          validator: function (v) {
            return v >= 1 && v <= 1000000;
          },
          message: '{VALUE} is not a valid quantity',
        },
      },
      // Notes for the product
      notes: {
        type: String,
        default: "",
        trim: true
      },

      extras: [
        {
          extraDetails: [
            {
              extraId: {
                type: ObjectId,
                ref: 'Product',
              },
              name: {
                type: String,
                required: true,
                trim: true,
              },
              price: {
                ...defaultOptions,
                validate: {
                  validator: function (v) {
                    return v >= 1 && v <= 100000;
                  },
                  message: '{VALUE} is not a valid price',
                },
              },
            }
          ],
          isDone: {
            type: Boolean,
            default: false,
            required: true,
          },
          isPaid: {
            type: Boolean,
            required: true,
            default: false
          },
          totalExtrasPrice: {
            ...defaultOptions,
            validate: {
              validator: function (v) {
                return v >= 1 && v <= 100000;
              },
              message: '{VALUE} is not a valid total price for extras',
            },
          },
        }
      ],
      // Price of the product
      price: {
        ...defaultOptions,
        validate: {
          validator: function (v) {
            return v >= 1 && v <= 1000000;
          },
          message: '{VALUE} is not a valid price',
        },
      },
      priceAfterDiscount: {
        ...defaultOptions,
      },
      // Total price of the product quantity
      totalprice: {
        ...defaultOptions,
      },

      // Indicates if the product is done
      isDone: {
        type: Boolean,
        default: false,
        required: true,
      },
      numOfPaid: {
        ...defaultOptions,
      },
      // Indicates if the product is Deleverd
      isDeleverd: {
        type: Boolean,
        default: false,
        required: true,
      },
      // Indicates if the product is to be added
      isAdd: {
        type: Boolean,
        default: false,
        required: true,
      }
    }
  ],

  subtotalSplitOrder: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function (v) {
        return v >= 0;
      },
      message: '{VALUE} should be greater than zero'
    }
  },

  subTotal: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function (v) {
        return v >= 0;
      },
      message: '{VALUE} should be greater than zero'
    }
  },
  // Tax for the order
  salesTax: {
    type: Number,
    default: 0,
    required: true,
  },
  serviceTax: {
    type: Number,
    default: 0,
    required: true,
  },
  // Delivery cost of the order
  deliveryCost: {
    type: Number,
    default: 0,
    required: true
  },
  // Discount for the product
  discount: {
    type: Number,
    default: 0,
    required: true,
    validate: {
      validator: function (v) {
        return v >= 0 && v <= 1000000;
      },
      message: '{VALUE} is not a valid discount value'
    }
  },
  // Addition for the product
  addition: {
    type: Number,
    default: 0,
    required: true,
    validate: {
      validator: function (v) {
        return v >= 0 && v <= 1000000;
      },
      message: '{VALUE} is not a valid addition value'
    }
  },
  // Total cost of the order
  total: {
    type: Number,
    required: true,
    default: 0,
    validate: {
      validator: function (v) {
        return v >= 0;
      },
      message: '{VALUE} should be greater than zero'
    }
  },
  // Table associated with the order

  table: {
    type: ObjectId,
    ref: 'Table',
    default: null
  },

  // Created by employee
  createdBy: {
    type: ObjectId,
    ref: 'Employee',
    default: null
  },
  // Cashier employee
  cashier: {
    type: ObjectId,
    ref: 'Employee',
    default: null
  },
  // Waiter serving the order
  waiter: {
    type: ObjectId,
    ref: 'Employee',
    default: null
  },
  // Delivery person for the order
  deliveryMan: {
    type: ObjectId,
    ref: 'Employee',
    default: null
  },

  // User associated with the order
  user: {
    type: ObjectId,
    ref: 'User',
    default: null
  },
  // Customer name
  name: {
    type: String,
  },
  // Customer address
  address: {
    type: String,
    default: null,
  },
  // Customer phone number
  phone: {
    type: String,
    default: null,
  },
  // Help status for the order
  help: {
    type: String,
    default: 'Not requested',
    required: true,
    enum: ['Not requested', 'Requests assistance', 'Requests bill'],
  },
  helpStatus: {
    type: String,
    default: 'Not send',
    required: true,
    enum: ['Not send', 'Send waiter', 'On the way', 'Assistance done'],
  },
  // Status of the order
  status: {
    type: String,
    default: 'Pending',
    required: true,
    enum: ['Pending', 'Approved', 'On the way', 'Delivered', 'Cancelled'],
  },

  // preparationStatus of the order
  preparationStatus: {
    Kitchen: {
      type: String,
      default: 'Pending',
      required: true,
      enum: ['Pending', 'Preparing', 'Prepared', 'Cancelled'],
    },
    Bar: {
      type: String,
      default: 'Pending',
      required: true,
      enum: ['Pending', 'Preparing', 'Prepared', 'Cancelled'],
    },
    Grill: {
      type: String,
      default: 'Pending',
      required: true,
      enum: ['Pending', 'Preparing', 'Prepared', 'Cancelled'],
    },
  },

  // Type of order (internal, delivery, takeout)
  orderType: {
    type: String,
    enum: ['Internal', 'Delivery', 'Takeaway'],
    default: 'Internal',
    required: true
  },
  isSplit: {
    type: Boolean,
    required: true,
    default: false,
  },
  // Indicates if the order is active
  isActive: {
    type: Boolean,
    default: true,
    required: true,
  },
  // Payment status of the order
  payment_status: {
    type: String,
    default: 'Pending',
    required: true,
    enum: ['Pending', 'Paid'],
    trim: true,
  },
  // Date of payment
  payment_date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  // Payment method used
  paymentMethod: {
    type: String,
    default: 'Cash',
    required: true,
    trim: true,
  },
}, { timestamps: true });

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;

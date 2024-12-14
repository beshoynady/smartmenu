const OrderModel = require("../models/Order.model");

// Create a new order
const createOrder = async (req, res) => {
  try {
    // Destructure the request body
    const {
      serial,
      orderNum,
      products,
      subTotal,
      salesTax,
      serviceTax,
      addition,
      discount,
      deliveryCost,
      total,
      table,
      user,
      createdBy,
      cashier,
      name,
      address,
      phone,
      waiter,
      deliveryMan,
      help,
      helpStatus,
      status,
      orderType,
      isActive,
      payment_status,
      paymentMethod,
      payment_date,
    } = req.body;

    // Validate required fields
    if (!serial && (!products || !subTotal || !total || (help && table))) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new order
    const newOrder = await OrderModel.create({
      serial,
      orderNum,
      products,
      subTotal,
      salesTax,
      serviceTax,
      addition,
      discount,
      deliveryCost,
      total,
      table,
      user,
      createdBy,
      cashier,
      name,
      address,
      phone,
      waiter,
      deliveryMan,
      help,
      helpStatus,
      status,
      orderType,
      isActive,
      payment_status,
      paymentMethod,
      payment_date,
    });

    // Check if the order was created successfully
    if (newOrder) {
      return res.status(201).json(newOrder);
    } else {
      throw new Error("Failed to create new order");
    }
  } catch (err) {
    // Differentiate between validation errors and other errors
    if (err.name === "ValidationError") {
      return res
        .status(422)
        .json({ error: "Validation error", details: err.errors });
    }

    // General error handling
    res.status(500).json({ error: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await OrderModel.findById(orderId)
      .populate("products.productid", "_id name price preparationSection")
      .populate("products.extras.extraDetails.extraId", "_id name price")
      .populate("table", "_id tableNumber sectionNumber")
      .populate("user", "_id username address deliveryArea phone")
      .populate("createdBy", "_id fullname username role shift sectionNumber")
      .populate("cashier", "_id fullname username role shift sectionNumber")
      .populate("waiter", "_id fullname username role shift sectionNumber")
      .populate("deliveryMan", "_id fullname username role shift ");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("products.productid", "_id name price preparationSection")
      .populate("products.extras.extraDetails.extraId", "_id name price")
      .populate("table", "_id tableNumber sectionNumber")
      .populate("user", "_id username address deliveryArea phone")
      .populate("createdBy", "_id fullname username role shift sectionNumber")
      .populate("cashier", "_id fullname username role shift sectionNumber")
      .populate("waiter", "_id fullname username role shift sectionNumber")
      .populate("deliveryMan", "_id fullname username role shift ");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    if (err.name === "ValidationError") {
      res
        .status(422)
        .json({ error: "Invalid data format", details: err.errors });
    } else {
      res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    }
  }
};

const getLimitOrders = async (req, res) => {
  try {
    const limit = parseInt(req.params.limit, 10) || 10;

    const orders = await OrderModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("products.productid", "_id name price preparationSection")
      .populate("products.extras.extraDetails.extraId", "_id name price")
      .populate("table", "_id tableNumber sectionNumber")
      .populate("user", "_id username address deliveryArea phone")
      .populate("createdBy", "_id fullname username role shift sectionNumber")
      .populate("cashier", "_id fullname username role shift sectionNumber")
      .populate("waiter", "_id fullname username role shift sectionNumber")
      .populate("deliveryMan", "_id fullname username role shift ");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    if (err.name === "ValidationError") {
      res
        .status(422)
        .json({ error: "Invalid data format", details: err.errors });
    } else {
      res
        .status(500)
        .json({ error: "Internal server error", details: err.message });
    }
  }
};

// Update an order by ID
const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: req.body },
      { new: true })
      .populate("products.productid", "_id name price preparationSection")
    .populate("products.extras.extraDetails.extraId", "_id name price")
;
    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete an order by ID
const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await OrderModel.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(deletedOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getOrders,
  getLimitOrders,
  updateOrder,
  deleteOrder,
};

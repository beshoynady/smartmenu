const path = require("path");
const fs = require("fs");
const ProductModel = require("../models/Product.model.js");

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      productname,
      productprice,
      discount,
      priceAfterDiscount,
      productdescription,
      productcategoryid,
      available,
      hasSizes,
      hasExtras,
      isAddon,
      isCombo,
      productRecipe,
    } = req.body;

    const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
    const extras = req.body.extras ? JSON.parse(req.body.extras) : [];
    const comboItems = req.body.comboItems ? JSON.parse(req.body.comboItems) : [];
    const image = req.file ? req.file.filename : null;

    // Check if required fields are provided in the request
    if (!productname || !productcategoryid || productprice === undefined) {
      return res.status(400).json({ error: "Please provide name, price, and category of the product" });
    }

    // Validate 'sizes' array
    if (hasSizes && (!Array.isArray(sizes) || sizes.length === 0)) {
      return res.status(400).json({ error: "Invalid sizes provided" });
    }

    // Validate 'extras' array
    if (hasExtras && (!Array.isArray(extras) || extras.length === 0)) {
      return res.status(400).json({ error: "Invalid extras provided" });
    }

    // Validate 'comboItems' array
    if (isCombo && (!Array.isArray(comboItems) || comboItems.length === 0)) {
      return res.status(400).json({ error: "Invalid combo items provided" });
    }

    // Create the product
    const newProduct = await ProductModel.create({
      name: productname,
      description: productdescription,
      price: productprice,
      discount,
      priceAfterDiscount,
      category: productcategoryid,
      available,
      hasSizes,
      sizes,
      hasExtras,
      isAddon,
      extras,
      isCombo,
      comboItems,
      productRecipe,
      image,
    });

    res.status(201).json(newProduct); // 201 for successful creation
  } catch (error) {
    console.error({ "Error creating product:": error });
    res.status(500).json({ error: "An error occurred while processing the request", error });
  }
};

// Update a product by its ID
const updateProduct = async (req, res) => {
  try {
    const productid = req.params.productid;
    const {
      productname,
      productdescription,
      productcategoryid,
      productprice,
      productdiscount,
      priceAfterDiscount,
      available,
      productRecipe,
      hasSizes,
      sizes,
      hasExtras,
      isAddon,
      extras,
      isCombo,
      comboItems,
    } = req.body;

    // Validate 'sizes' array
    if (hasSizes && (!Array.isArray(sizes) || sizes.length === 0)) {
      return res.status(400).json({ error: "Invalid sizes provided" });
    }

    // Validate 'extras' array
    if (hasExtras && (!Array.isArray(extras) || extras.length === 0)) {
      return res.status(400).json({ error: "Invalid extras provided" });
    }

    // Validate 'comboItems' array
    if (isCombo && (!Array.isArray(comboItems) || comboItems.length === 0)) {
      return res.status(400).json({ error: "Invalid combo items provided" });
    }

    const existingProduct = await ProductModel.findById(productid);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateData = {
      name: productname,
      description: productdescription,
      price: productprice,
      discount: productdiscount,
      priceAfterDiscount,
      category: productcategoryid,
      available,
      productRecipe,
      hasSizes,
      sizes,
      hasExtras,
      isAddon,
      extras,
      isCombo,
      comboItems,
    };

    if (req.file) {
      updateData.image = req.file.filename;
    } else {
      updateData.image = existingProduct.image;
    }

    const updatedProduct = await ProductModel.findByIdAndUpdate(productid, updateData, { new: true });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Retrieve all products
const getAllProducts = async (req, res) => {
  try {
    const allProducts = await ProductModel.find({})
      .populate("category")
      .populate("sizes.sizeRecipe")
      .populate("productRecipe")
      .populate("extras")
      .populate("comboItems.product");

    if (allProducts.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json(allProducts);
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Retrieve products by category
const getProductByCategory = async (req, res) => {
  try {
    const categoryid = req.params.categoryid;
    const products = await ProductModel.find({ category: categoryid })
      .populate("category")
      .populate("sizes.sizeRecipe")
      .populate("productRecipe")
      .populate("extras")
      .populate("comboItems.product");

    res.status(200).json(products);
  } catch (err) {
    res.status(400).json(err);
  }
};

// Retrieve a single product by its ID
const getOneProduct = async (req, res) => {
  try {
    const productid = req.params.productid;
    const product = await ProductModel.findById(productid)
      .populate("category")
      .populate("productRecipe")
      .populate("extras")
      .populate("comboItems.product");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




const getProduct = async (req, res) => {
  try {
    const productid = req.params.productid;
    const product = await ProductModel.findById(productid);

    // Check if product is found
    if (!product) {
      // Return an object with product and an error flag
      return { product: null, error: "Product not found" };
    }

    // Return the product if found
    return { product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { product: null, error: "Internal server error" };
  }
};

// Delete a product by its ID
const deleteProduct = async (req, res) => {
  try {
    const productid = req.params.productid;
    const product = await ProductModel.findById(productid);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.remove();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductByCategory,
  getOneProduct,
  getProduct,
  updateProduct,
  deleteProduct,
};

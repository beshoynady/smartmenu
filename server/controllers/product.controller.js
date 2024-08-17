const path = require("path");
const fs = require("fs");

const ProductModel = require("../models/Product.model.js");

// Create a new product
const createProduct = async (req, res) => {
  try {
    const {
      productname,
      productprice,
      productdescription,
      productcategoryid,
      available,
      hasSizes,
      hasExtras,
      isAddon,
    } = req.body;     
    const sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
    const extras = req.body.extras ? JSON.parse(req.body.extras) : [];

    const image = req.file ? req.file.filename : null;

    // Check if required fields are provided in the request
    if (!productname || !productcategoryid) {
      return res
        .status(400)
        .json({
          error: "Please provide name, price, and category of the product",
        });
    }

    // Validate 'sizes' array
    if (hasSizes && (!Array.isArray(sizes) || sizes.length === 0)) {
      return res.status(400).json({ error: "Invalid sizes provided" });
    }

    // Validate 'extras' array
    if (hasExtras && (!Array.isArray(extras) || extras.length === 0)) {
      return res.status(400).json({ error: "Invalid extras provided" });
    }

    // Create the product
    const newProduct = await ProductModel.create({
      name: productname,
      description: productdescription,
      price: productprice,
      category: productcategoryid,
      available,
      hasSizes,
      sizes,
      hasExtras,
      isAddon,
      extras,
      image,
    });

    res.status(201).json(newProduct); // 201 for successful creation
  } catch (error) {
    // Handle errors
    console.error({ "Error creating product:": error });
    res
      .status(500)
      .json({ error: "An error occurred while processing the request", error });
  }
};

// Retrieve all products
const getAllProducts = async (req, res) => {
  try {
    // Retrieve all products and populate the 'category' and 'extras' fields
    const allProducts = await ProductModel.find({})
      .populate("category")
      .populate("sizes.sizeRecipe")
      .populate("productRecipe")
      .populate("extras");

    // Check if any products are found
    if (allProducts.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    // Respond with the list of products
    res.status(200).json(allProducts);
  } catch (error) {
    // Handle errors
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
      .populate({
        path: "extras",
        model: "Product",
      });
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
      .populate({
        path: "extras",
        model: "Product",
      });

    // Check if product is found
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Respond with the found product
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
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
    } = req.body;

    // Validate 'sizes' array
    if (hasSizes && (!Array.isArray(sizes) || sizes.length === 0)) {
      return res.status(400).json({ error: "Invalid sizes provided" });
    }

    // Validate 'extras' array
    if (hasExtras && (!Array.isArray(extras) || extras.length === 0)) {
      return res.status(400).json({ error: "Invalid extras provided" });
    }

    // Check if the product exists
    const existingProduct = await ProductModel.findById(productid);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prepare the update object
    const updateData = {
      name: productname,
      description: productdescription,
      price: productprice,
      category: productcategoryid,
      discount: productdiscount,
      priceAfterDiscount,
      productRecipe,
      hasSizes,
      sizes,
      hasExtras,
      isAddon,
      extras,
      available,
    };

    // Handle the image update
    if (req.file) {
      // If a new image is uploaded, update the image field
      updateData.image = req.file.filename;
    } else {
      // If no new image is uploaded, retain the old image
      updateData.image = existingProduct.image;
    }

    // Update the product in the database
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productid,
      updateData,
      { new: true } // Return the updated document
    );

    // Return the updated product
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Handle errors
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a product by its ID without changing the image
const updateProductWithoutImage = async (req, res) => {
  try {
    const productid = req.params.productid;
    const {
      productname,
      productprice,
      productdescription,
      productcategoryid,
      productdiscount,
      priceAfterDiscount,
      productRecipe,
      available,
      hasSizes,
      sizes,
      hasExtras,
      isAddon,
      extras,
    } = req.body;

    // Update the product without changing the image
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      { _id: productid },
      {
        name: productname,
        description: productdescription,
        price: productprice,
        category: productcategoryid,
        discount: productdiscount,
        priceAfterDiscount,
        available,
        productRecipe,
        hasSizes,
        sizes,
        hasExtras,
        isAddon,
        extras,
      },
      { new: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    // Handle errors
    console.error("Error updating product without image:", error);
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

    await ProductModel.findByIdAndDelete(productid);
    res
      .status(200)
      .json({
        message: "Product deleted successfully",
        deletedProduct: product,
      });
  } catch (err) {
    console.error("Error deleting product:", err);
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductByCategory,
  getOneProduct,
  getProduct,
  updateProduct,
  updateProductWithoutImage,
  deleteProduct,
};

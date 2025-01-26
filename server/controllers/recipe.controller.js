const RecipeModel = require("../models/Recipe.model");

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const {
      productId,
      productName,
      sizeName,
      sizeId,
      numberOfMeals,
      preparationTime,
      ingredients,
      serviceDetails,
    } = req.body;

    // Check if all required fields are present in the request body
    if (
      !productId ||
      !productName ||
      !numberOfMeals ||
      !preparationTime ||
      !ingredients
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if ingredients is a non-empty array
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ message: "Ingredients must be a non-empty array" });
    }

    // Validate each ingredient
    for (const item of ingredients) {
      if (
        !item.itemId ||
        !item.name ||
        !item.amount ||
        !item.unit ||
        !item.wastePercentage
      ) {
        return res.status(400).json({ message: "Invalid ingredient fields" });
      }
    }

    // Validate serviceDetails
    const validateServiceDetails = (details) => {
      if (details && typeof details === "object") {
        const { dineIn, takeaway, delivery } = details;
        [dineIn, takeaway, delivery].forEach((service) => {
          if (!Array.isArray(service)) {
            throw new Error("Service details must be arrays");
          }
          service.forEach((item) => {
            if (
              !item.itemId ||
              !item.name ||
              !item.amount ||
              !item.unit ||
              typeof item.wastePercentage !== "number"
            ) {
              throw new Error("Invalid service details");
            }
          });
        });
      }
    };

    validateServiceDetails(serviceDetails);

    // Create and save the new recipe
    const newRecipe = await RecipeModel.create({
      productId,
      productName,
      sizeName,
      sizeId,
      numberOfMeals,
      preparationTime,
      ingredients,
      serviceDetails,
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Duplicate sizeId value", error });
    } else {
      res.status(500).json({ message: error.message, error });
    }
  }
};

// Update an existing recipe
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numberOfMeals,
      preparationTime,
      ingredients,
      serviceDetails
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    // Initialize the update object
    const updateFields = {};

    // Conditionally add fields to update object
    if (numberOfMeals) {
      updateFields.numberOfMeals = numberOfMeals;
    }

    if (preparationTime) {
      updateFields.preparationTime = preparationTime;
    }

    if (Array.isArray(ingredients)) {
      // Validate ingredients
      for (const item of ingredients) {
        if (
          item.itemId ||
          item.name ||
          item.amount ||
          item.unit ||
          item.wastePercentage
        ) {
          updateFields.ingredients = ingredients;
        }
      }
    }

    // if (typeof serviceDetails === "object") {
    //   // Validate serviceDetails
    //   validateServiceDetails(serviceDetails);
    // }
      updateFields.serviceDetails = serviceDetails;
    
    // Update the recipe by ID
    const updatedRecipe = await RecipeModel.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message, error });
  }
};


// Get a single recipe by ID
const getOneRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await RecipeModel.findById(id)
      .populate("productId", "_id name")
      .populate(
        "ingredients.itemId",
        "_id itemName costPerPart minThreshold"
      )
      .populate(
        "serviceDetails.dineIn.itemId",
        "_id itemName costPerPart minThreshold"
      )
      .populate(
        "serviceDetails.takeaway.itemId",
        "_id itemName costPerPart minThreshold"
      )
      .populate(
        "serviceDetails.delivery.itemId",
        "_id itemName costPerPart minThreshold"
      );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    res.status(400).json({ message: error.message, error });
  }
};

// Get all recipes
const getAllRecipe = async (req, res) => {
  try {
    const recipes = await RecipeModel.find()
      .populate("productId", "_id name")
      .populate(
        "ingredients.itemId",
        "_id itemName costPerPart minThreshold"
      )
      .populate(
        "serviceDetails.dineIn.itemId",
        "_id itemName costPerPart minThreshold"
      )
      .populate(
        "serviceDetails.takeaway.itemId",
        "_id itemName costPerPart minThreshold"
      )
      .populate(
        "serviceDetails.delivery.itemId",
        "_id itemName costPerPart minThreshold"
      );

    res.status(200).json(recipes);
  } catch (error) {
    res.status(400).json({ message: error.message, error });
  }
};


// Delete a recipe by ID
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecipe = await RecipeModel.findByIdAndDelete(id);

    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message, error });
  }
};

module.exports = {
  createRecipe,
  updateRecipe,
  getOneRecipe,
  getAllRecipe,
  deleteRecipe,
};

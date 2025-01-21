const menuCategoryModel = require('../models/menuCategory.model');

// Create a new menuCategory
const createmenuCategory = async (req, res, next) => {
    try {
        let order;
        const allMenuCategories = await menuCategoryModel.find({}).exec();

        if (allMenuCategories.length === 0) {
            order = 1;
        } else {
            const lastmenuCategory = allMenuCategories[allMenuCategories.length - 1];
            order = lastmenuCategory.order + 1;
        }

        const { name, isMain, status } = req.body;
        const createdBy = req.employee.id;
        const isExist = await menuCategoryModel.findOne({name})
        if(isExist){
            return res.status(400).json({ message: 'Menu category name already exists' });
        }
        const newmenuCategory = await menuCategoryModel.create({ name, isMain, status, order, createdBy });
        res.status(201).json(newmenuCategory);
    } catch (error) {
        console.error('Error creating menuCategory:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'menuCategory name already exists', error });
        }
        // Handle other errors
        res.status(500).json({ message: 'Failed to create menuCategory', error });
        next(error);
    }
};



// Get all Menucategories
const getAllMenuCategories = async (req, res, next) => {
    try {
        const allMenuCategories = await menuCategoryModel.find({}).sort('order').populate('createdBy');

        res.status(200).json(allMenuCategories);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Failed to fetch Menucategories' , error});
        next(error);
    }
};

// Get a single menuCategory by ID
const getOnemenuCategory = async (req, res, next) => {
    const { menuCategoryId } = req.params;
    try {
        const menuCategory = await menuCategoryModel.findById(menuCategoryId).populate('createdBy');
        if (!menuCategory) {
            return res.status(404).json({ message: 'menuCategory not found' });
        }
        res.status(200).json(menuCategory);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Failed to fetch menuCategory' });
        next(error);
    }
};

// Update a menuCategory
const updatemenuCategory = async (req, res, next) => {
    const { menuCategoryId } = req.params;
    const { name, isMain, status , order } = req.body;
    const id = req.employee.id;
    try {
        const updatedmenuCategory = await menuCategoryModel.findByIdAndUpdate(
            menuCategoryId,
            { name, isMain,order, status, createdBy: id },
            { new: true }
        );
        if (!updatedmenuCategory) {
            return res.status(404).json({ message: 'menuCategory not found' });
        }
        res.status(200).json(updatedmenuCategory);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'menuCategory name already exists' });
        }
        // Handle other errors
        res.status(500).json({ message: 'Failed to update menuCategory' ,error});
        next(error);
    }
};

// Delete a menuCategory
const deletemenuCategory = async (req, res, next) => {
    const { menuCategoryId } = req.params;
    try {
        const deletedmenuCategory = await menuCategoryModel.findByIdAndDelete(menuCategoryId);
        if (!deletedmenuCategory) {
            return res.status(404).json({ message: 'menuCategory not found' });
        }
        res.status(200).json(deletedmenuCategory);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Failed to delete menuCategory' });
        next(error);
    }
};

module.exports = {
    createmenuCategory,
    getAllMenuCategories,
    getOnemenuCategory,
    updatemenuCategory,
    deletemenuCategory
};

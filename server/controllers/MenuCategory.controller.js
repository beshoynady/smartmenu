const MenuCategoryModel = require('../models/MenuCategory.model');

// Create a new Menucategory
const createMenuCategory = async (req, res, next) => {
    try {
        let order;
        const allMenuCategories = await MenuCategoryModel.find({}).exec();

        if (allMenuCategories.length === 0) {
            order = 1;
        } else {
            const lastMenuCategory = allMenuCategories[allMenuCategories.length - 1];
            order = lastMenuCategory.order + 1;
        }

        const { name, isMain, status } = req.body;
        const createdBy = req.employee.id;
        const isExist = await MenuCategoryModel.findOne({name})
        if(isExist){
            return res.status(400).json({ message: 'Menu category name already exists' });
        }
        const newMenuCategory = await MenuCategoryModel.create({ name, isMain, status, order, createdBy });
        res.status(201).json(newMenuCategory);
    } catch (error) {
        console.error('Error creating MenuCategory:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'MenuCategory name already exists', error });
        }
        // Handle other errors
        res.status(500).json({ message: 'Failed to create MenuCategory', error });
        next(error);
    }
};



// Get all Menucategories
const getAllMenuCategories = async (req, res, next) => {
    try {
        const allMenuCategories = await MenuCategoryModel.find({}).sort('order').populate('createdBy');

        res.status(200).json(allMenuCategories);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Failed to fetch Menucategories' , error});
        next(error);
    }
};

// Get a single Menucategory by ID
const getOneMenuCategory = async (req, res, next) => {
    const { menuCategoryId } = req.params;
    try {
        const Menucategory = await MenuCategoryModel.findById(menuCategoryId).populate('createdBy');
        if (!Menucategory) {
            return res.status(404).json({ message: 'MenuCategory not found' });
        }
        res.status(200).json(Menucategory);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Failed to fetch Menucategory' });
        next(error);
    }
};

// Update a Menucategory
const updateMenuCategory = async (req, res, next) => {
    const { menuCategoryId } = req.params;
    const { name, isMain, status , order } = req.body;
    const id = req.employee.id;
    try {
        const updatedMenuCategory = await MenuCategoryModel.findByIdAndUpdate(
            menuCategoryId,
            { name, isMain,order, status, createdBy: id },
            { new: true }
        );
        if (!updatedMenuCategory) {
            return res.status(404).json({ message: 'MenuCategory not found' });
        }
        res.status(200).json(updatedMenuCategory);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'MenuCategory name already exists' });
        }
        // Handle other errors
        res.status(500).json({ message: 'Failed to update Menucategory' ,error});
        next(error);
    }
};

// Delete a Menucategory
const deleteMenuCategory = async (req, res, next) => {
    const { menuCategoryId } = req.params;
    try {
        const deletedMenuCategory = await MenuCategoryModel.findByIdAndDelete(menuCategoryId);
        if (!deletedMenuCategory) {
            return res.status(404).json({ message: 'MenuCategory not found' });
        }
        res.status(200).json(deletedMenuCategory);
    } catch (error) {
        // Handle errors
        res.status(500).json({ message: 'Failed to delete Menucategory' });
        next(error);
    }
};

module.exports = {
    createMenuCategory,
    getAllMenuCategories,
    getOneMenuCategory,
    updateMenuCategory,
    deleteMenuCategory
};

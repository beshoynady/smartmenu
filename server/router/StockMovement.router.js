const express = require('express');
const {
    createStockAction,
    updateStockAction,
    getOneStockAction,
    getAllStockActions,
    deleteStockAction,
} = require('../controllers/StockMovement.controller');

const authenticateToken = require('../utlits/authenticate')
const checkSubscription = require('../utlits/checkSubscription')

const router = express.Router();

// Routes for stock actions
router.route('/')
    .post(authenticateToken, checkSubscription, createStockAction) // Create a new stock action
    .get(authenticateToken, checkSubscription, getAllStockActions); // Get all stock actions

router.route('/:actionId')
    .get(authenticateToken, checkSubscription, getOneStockAction) // Get a single stock action by ID
    .put(authenticateToken, checkSubscription, updateStockAction) // Update a stock action by ID
    .delete(authenticateToken, checkSubscription, deleteStockAction); // Delete a stock action by ID

module.exports = router;

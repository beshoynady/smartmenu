const express = require("express");
const {
  createmenuCategory,
  getAllMenuCategories,
  getOnemenuCategory,
  updatemenuCategory,
  deletemenuCategory
} = require("../controllers/menucategory.controller");
const authenticateToken = require('../utlits/authenticate')
const checkSubscription = require('../utlits/checkSubscription')

const router = express.Router();

router.route('/').post(authenticateToken, checkSubscription, createmenuCategory)
  .get(getAllMenuCategories);
router.route('/:menuCategoryId')
  .get(getOnemenuCategory)
  .put(authenticateToken, checkSubscription, updatemenuCategory)
  .delete(authenticateToken, checkSubscription, deletemenuCategory);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  createPreparationTicket,
  getAllPreparationTickets,
  getPreparationTicketById,
  updatePreparationTicket,
  deletePreparationTicket
} = require("../controllers/PreparationTicket.controller");

const authenticateToken = require("../utlits/authenticate");
const checkSubscription = require("../utlits/checkSubscription");

router
  .route("/")
  .post(authenticateToken, checkSubscription, createPreparationTicket)
  .get(authenticateToken, checkSubscription, getAllPreparationTickets);

router
  .route("/:id")

  .get(authenticateToken, checkSubscription, getPreparationTicketById)
  .put(authenticateToken, checkSubscription, updatePreparationTicket)
  .delete(authenticateToken, checkSubscription, deletePreparationTicket);

module.exports = router;

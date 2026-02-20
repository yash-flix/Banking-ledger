const {Router} = require("express");
const transactionRoutes = Router();
const authMiddleware = require("../middleware/auth.middleware.js")
const transactionController = require("../controllers/transaction.contoller.js")
/**
 * -POST /api/transaction
 * -Create a new transaction
 */

transactionRoutes.post("/" ,authMiddleware.authMiddleware ,transactionController.createTransaction )

module.exports = transactionRoutes;
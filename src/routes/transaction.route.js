const {Router} = require("express");
const transactionRoutes = Router();
const authMiddleware = require("../middleware/auth.middleware.js")
const transactionController = require("../controllers/transaction.contoller.js")
/**
 * -POST /api/transaction
 * -Create a new transaction
 */

transactionRoutes.post("/" ,authMiddleware.authMiddleware ,transactionController.createTransaction )

/**
 * -POST /api/transactions/system/initial-funds
 * -Create inital funds transaction from system account to a user account
 */
transactionRoutes.post("/system/initial-fund" , authMiddleware.authSystemUserMiddleware , transactionController.createInitialFundTransaction)

module.exports = transactionRoutes;
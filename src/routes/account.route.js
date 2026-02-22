const express = require("express");
const authMiddleware = require("../middleware/auth.middleware.js");
const accountController = require("../controllers/account.controller.js");


const router = express.Router();

/**
 * POST /api/accounts
 * - create a new account
 * - protected route
 */
router.post("/" , authMiddleware.authMiddleware , accountController.createAccountController);

/**
 * GET /api/accounts
 * - get all accounts
 * - protected route
 */
router.get("/" , authMiddleware.authMiddleware , accountController.getAllAccountsController);

/**
 * GET /api/accounts/balance/:accountId
 * - get balance of a specific account
 * - protected route
 */
router.get("/balance/:accountId" , authMiddleware.authMiddleware , accountController.getAccountBalanceController);

module.exports = router;
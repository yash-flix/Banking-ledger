const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require("../models/ledger.model.js");
const accountModel = require("../models/account.model.js");
const emailService = require("../services/email.service.js");

/** -Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
1. Validate request
2. Validate idempotency key
3. Check account status from ledger
4. Derive sender balance (PENDING)
5. Create DEBIT ledger entry
6. Create CREDIT ledger entry
7. Mark transaction COMPLETED
8. Commit MongoDB session
9. Send email notification
* Mark transfer COMPLETED 
 */

async function createTransaction(req,res)
{
    /**
     *  Validate request
     */
    const {fromAccount , toAccount , amount , idempotencyKey  } = req.body;
    if(!fromAccount || !toAccount || !amount || !idempotencyKey)
    {
        return res.status(400).json({
            message:"fromAccount , toAccount , amount or idempotencyKey is missing"
        })
    }
    const fromUserAccount = await accountModel.findOne({_id : fromAccount});
    const toUserAccount = await accountModel.findOne({_id:toAccount});

    if(!fromUserAccount || !toUserAccount)
    {
        return res.status(400).json({
            message:"invalid fromAccount or toAccount"
        })
    }

        /**
     *  Validate idempotencyKey
     */
const isTransactionAlreadyExists = await transactionModel.findOne({idempotencyKey});

if(isTransactionAlreadyExists.status == "COMPLETED")
{
    res.status(200).json({
        message:"Transaction is successfull",
        transaction : idempotencyKey
    })
}
if(isTransactionAlreadyExists.status == "PENDING")
{
    res.status(200).json({
        message:"Transaction is still processing"
    })
}
if(isTransactionAlreadyExists.status == "FAILED")
{
    res.status(500).json({
        message:"Transaction processing failed , please retry"
    })
}
if(isTransactionAlreadyExists.status == "REVERSED")
{
    res.status(500).json({
        message:"Transaction is reversed , please retry"
    })
}
}
 
module.exports = 
{
    createTransaction   
}
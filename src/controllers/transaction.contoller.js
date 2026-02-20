const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require("../models/ledger.model.js");
const accountModel = require("../models/account.model.js");
const emailService = require("../services/email.service.js");
const mongoose = require("mongoose");

/** -Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
1. Validate request
2. Validate idempotency key
3. Check account status from ledger
4. Derive sender balance (PENDING)
5. create transaction (PENDING) using sessions
6. Create DEBIT ledger entry
7. Create CREDIT ledger entry
8. Mark transaction COMPLETED
9. Commit MongoDB session
10. Send email notification
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

if(isTransactionAlreadyExists)
{
    if(isTransactionAlreadyExists.status == "COMPLETED")
    {
       return res.status(200).json({
            message:"Transaction is successfull",
            transaction : idempotencyKey
        })
    }
    if(isTransactionAlreadyExists.status == "PENDING")
    {
       return res.status(200).json({
            message:"Transaction is still processing"
        })
    }
    if(isTransactionAlreadyExists.status == "FAILED")
    {
       return res.status(500).json({
            message:"Transaction processing failed , please retry"
        })
    }
    if(isTransactionAlreadyExists.status == "REVERSED")
    {
       return res.status(500).json({
            message:"Transaction is reversed , please retry"
        })
    }
}
    /**
     *  check Account status
     */
    if(fromUserAccount.status!= "ACTIVE" || toUserAccount.status != "ACTIVE")
    {
        return res.status(400).json({
            message:"Either fromAccount or toAccount is not active"
        })
    }
    /**
     *  Derive sender balance
     */
    const balance =  await fromUserAccount.getBalance()
    if(balance < amount)
    {
        return res.status(400).json({
            message : `Insufficient balance. Current balance is ${balance}.
            Requested amount is ${amount}`
        })
    }
     /**
     *  create a transaction (PENDING)
     */
    const session = await mongoose.startSession()
    session.startTransaction()
    
    const transaction = await transactionModel.create({
        fromAccount ,
        toAccount , 
        amount,
        idempotencyKey,
        status : "PENDING"
    } , {session})

    const creditLegerEntry = await ledgerModel.create(
        {
            account : fromAccount ,
            amount : amount ,
            transaction : transaction._id , 
            type : "CREDIT"
        } ,
        {session}
    )
    const debitLegerEntry = await ledgerModel.create(
        {
            account : toAccount ,
            amount : amount ,
            transaction : transaction._id , 
            type : "DEBIT"
        } ,
        {session}
    )
    transaction.status = "COMPLETED";
    await transaction.save({session})

    await session.commitTransaction();
    session.endSession();

     /**
     *  send email notification
     */
    await emailService.sendTransactionEmail(req.user.email , req.user.name, amount , toAccount);
    return res.status(201).json({message: "Transacion completed successfully" , transaction : transaction})

}
 
module.exports = 
{
    createTransaction   
}
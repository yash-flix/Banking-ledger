const accountModel = require("../models/account.model");


async function createAccountController(req, res)
{
    const {user} = req.user;

    const account = accountModel.create({
        user : user._id
    })

    res.status(201).json({
        message:"Account created successfully",
        account
    })
}
async function getAllAccountsController(req,res)
{
    const accounts = await accountModel.find({user : req.user._id});

    return res.status(200).json({
        message:"Accounts fetched successfully",
        accounts
    })
}
async function getAccountBalanceController(req,res)
{
    const {accountId} = req.params;

    const account = await accountModel.findOne({
        _id  : accountId , 
        user : req.user._id
    })

    if(!account)
    {
        return res.status(404).json({
            message:"Account not found"
        })
    }

    //using the method creating in the model to get the balane 
    const balance = await account.getBalance();

    return res.status(200).json({
        message: "Account balance fetched successfully", 
        accountId : account._id ,
        balance
    })

    
}

module.exports = {
    createAccountController,
    getAllAccountsController,
    getAccountBalanceController
}
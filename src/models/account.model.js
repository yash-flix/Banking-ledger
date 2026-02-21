const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model.js")

const accountSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        required :[true , "Account must be associated with a user"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["ACTIVE" , "FROZEN" ,"CLOSED"],
            message: "Status can be either ACTIVE , FROZEN or CLOSED",
        },
        default:"ACTIVE"
    },
    currency:{
        type:String,
        requied:[true , "Currency is required for creating an account"],
        default: "INR"
    }
},
{
    timestamps:true
})

accountSchema.methods.getBalance = async function()
{
    const balanceData = await ledgerModel.aggregate([
        //stage1 : filter ledger entries for the given account
        {
            $match : {account: this._id}
        },
        //stage2: group the entries to calculate total credits and debits
        {
            $group:
            {
                _id: null , 
                totalCredits : {
                    $sum : {
                        $cond : [{$eq : ["$type" , "CREDIT"]} , "$amount" , 0]
                    }
                },
                totalDebits:
                {
                    $sum : {
                        $cond : [{$eq:["type" , "DEBIT"]} , "$amount" , 0]
                    }
                }

            }
        },
        //stage3: calculate the balance by subtracting total debits from total credits
        {
            $project : {
                _id : 0,
                balance: { $subtract : ["$totalCredits" , "$totalDebits"]}
            }
        }
    ])
    if(balanceData.length == 0)
    {
    return 0;
    }
    return balanceData[0].balance;
}


accountSchema.index({user:1 , status:1})

const accountModel = mongoose.model("account" , accountSchema);
module.exports = accountModel;
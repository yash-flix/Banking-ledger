const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
    account:
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required : [true , "Ledger must be associated with an account"],
        index:true , 
        immutable:true
    },
    amount:
    {
        type:Number , 
        required : [true , "Amount is required to create a ledger entry"],
        immutable:true
    },
    transaction :
    {
        type : mongoose.Schema.Types.ObjectId,
        ref : "transaction",
        required:[true , "Ledger must be associated with a transaction"],
        index:true,
        immutable:true
    },
    type : 
    {
        type:String ,
        enum : 
        {
            values : ["CREDIT" , "DEBIT"],
            message : "Type can be either CEDIT or DEBIT",
        },
        required:[true , "Ledger type is required"],
        immutable:true
    }
})

function preventLedgerModification()
{
    throw new error("Ledger entries are immuatable and cannot be modified or deleted");
}

ledgerSchema.pre("findOneAndUpdate" , preventLedgerModification);
ledgerSchema.pre("updateOne" , preventLedgerModification);
ledgerSchema.pre("deleteOne" , preventLedgerModification);
ledgerSchema.pre("findOneAndDelete" , preventLedgerModification);
ledgerSchema.pre("deleteMany" , preventLedgerModification);
ledgerSchema.pre("updateMany" ,preventLedgerModification );
ledgerSchema.pre("findOneAndReplace" ,preventLedgerModification );


const ledgerModel = mongoose.model("ledger" , ledgerSchema);
module.exports = ledgerModel;
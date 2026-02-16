const userModel = require("../models/user.model.js")
const jwt = require("jsonwebtoken");
require("dotenv").config();


/** 
 * -user register controller
 * -POST /api/auth/register
*/
async function userRegisterController(req,res)
{

    const {email , password , name} = req.body;
    const isExits = await userModel.findOne({email});

    if(isExits)
    {
        return res.status(422).json({
            message:"User already exists with email.",
            status : "failed"
        })
    }

    const user = await userModel.create({
        email , password , name
})
const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET , {expiresIn:"3d"});

res.cookie("token" , token);
res.status(201).json({
       user:
       {
        _id : user._id,
        email : user.email,
        name : user.name
       } ,
       token
})

}

/** 
 * -user login controller
 * -POST /api/auth/login
*/
async function userLoginController(req,res)
{
    const {email , password} = req.body;

    const user = await userModel.findOne({email}).select("+password");
    if(!user)
    {
        res.status(401).json({
            message:"Email or Pasword is invalid" ,
        })
    }
   const isValidPassword = await user.comparePassword(password);
   if(!isValidPassword)
   {
        res.status(401).json({
         message:"Email or Pasword is invalid" ,
        })
   }

const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET , {expiresIn:"3d"});

res.cookie("token" , token);
res.status(200).json({
       user:
       {
        _id : user._id,
        email : user.email,
        name : user.name
       } ,
       token
})
   

}

module.exports = 
{
    userRegisterController ,
    userLoginController

}
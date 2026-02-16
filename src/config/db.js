require("dotenv").config();
const mongoose  = require('mongoose');

function connectToDB()
{
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{console.log("Server is connected to db")})
    .catch(err=>{console.log(`error connecting to db ${err}` )
        process.exit(1);
    })
}

module.exports = connectToDB;
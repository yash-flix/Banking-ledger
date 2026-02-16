const express = require('express');
const app = express();
const authRoutes = require("./routes/auth.routes.js");
const accountRoutes = require("./routes/account.route.js")
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json());





app.use("/api/auth" , authRoutes);
app.use("/api/accounts" , accountRoutes);
module.exports = app;
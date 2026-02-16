const express = require('express');
const app = express();
const authRoutes = require("./routes/auth.routes.js");
const cookieParser = require("cookie-parser");


app.use(cookieParser());
app.use(express.json());





app.use("/api/auth" , authRoutes);

module.exports = app;
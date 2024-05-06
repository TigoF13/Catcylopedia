const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const StoreMongo = require("connect-mongo");
const passport = require("passport");
const dotenv = require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;
const catController = require("./routers/catController.js");
const userController = require("./routers/userController.js");
const authController = require("./routers/authController.js");
const indexController = require("./routers/indexController.js");

require("./config/passport.js");
const port = process.env.Port;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: StoreMongo.create({
        mongoUrl: process.env.DatabaseURL,
        collectionName: "sessions"
    }),
    cookie:{
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use('/public',express.static('public'));
app.use("/", catController);
app.use("/", userController);
app.use("/", authController);
app.use("/", indexController);

app.listen(port, () => {
    console.log(`Webserver app listening on port ${port}`);
})
const express = require("express");
const app = express();
const { hashSync } = require("bcrypt");
const UserData = require("./database/userdata.js");
const session = require("express-session");
const StoreMongo = require("connect-mongo");
const passport = require("passport");

require("./database/passport.js");
const port = 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: StoreMongo.create({
        mongoUrl: "mongodb://localhost:27017/userdata",
        collectionName: "sessions"
    }),
    cookie:{
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {title : "Catcyclopedia"})
})

app.get("/adopt", (req, res) => {
    res.render("adopt.ejs", {title : "Catcyclopedia"})
})

app.get("/register", (req, res) => {
    res.render("register.ejs", {title : "Catcyclopedia"})
})

app.post("/register", async (req, res) => {
    try {
        const newUser = new UserData({
            username: req.body.username,
            email: req.body.email,
            password: hashSync(req.body.password,15)
        });

        await newUser.save();
        res.render("login.ejs", {title : "Catcyclopedia"});
    } catch (err) {
        console.log(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", {title : "Catcyclopedia"})
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
        res.redirect('/adopt');
});

app.listen(port, () => {
    console.log(`Webserver app listening on port ${port}`);
})
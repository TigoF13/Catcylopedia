const express = require("express");
const app = express();
const { hashSync } = require("bcrypt");
const UserData = require("./database/userdata.js");
const session = require("express-session");
const flash = require("connect-flash");
const StoreMongo = require("connect-mongo");
const passport = require("passport");

require("./database/passport.js");
const port = 3001;

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

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", {title : "Catcyclopedia"})
})

app.get("/adopt", (req, res) => {
    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin})
})

app.get("/about", (req, res) => {
    res.render("about.ejs", {title : "About Cat Protection | Who are Cats Protection",loggedin: req.session.loggedin})
})

app.get("/what-we-do", (req, res) => {
    res.render("whatwedo.ejs", {title : "What we do | Helping Cats and Kitten",loggedin: req.session.loggedin})
})

app.get("/help-and-advice", (req, res) => {
    res.render("help.ejs", {title : "Help and Advice | Expert Cat Care Guide",loggedin: req.session.loggedin})
})

app.get("/find-us", (req, res) => {
    res.render("find.ejs", {title : "Find Us",loggedin: req.session.loggedin})
})

app.get('/myacc', async function(req, res) {
    if (req.user) {
        try {
            const user = await UserData.findOne({ username: req.user.username });
            if (user) {
                res.render('myacc.ejs', {
                    title : "My Account",
                    loggedin: req.session.loggedin,
                    user: user,
                    username: user.username,
                    email: user.email,
                    password: user.password
                });
            } else {
                res.send('No user found with that username');
            }
        } catch (err) {
            console.log(err);
        }
    } else {
        res.send('You are not logged in');
    }
});

app.get("/register", (req, res) => {
    res.render("register.ejs", {title : "Register", loggedin: req.session.loggedin})
})

app.post("/register", async (req, res) => {
    try {
        const newUser = new UserData({
            username: req.body.username,
            email: req.body.email,
            password: hashSync(req.body.password,15)
        });

        await newUser.save();
        res.render("login.ejs", {title : "Login", loggedin: req.session.loggedin,message: "Account created successfully, please login"});
    } catch (err) {
        console.log(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs", {title : "Login", loggedin: req.session.loggedin, message: req.flash('error') })
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login',failureFlash: 'Wrong username/password, please try again'}), function(req, res) {
    req.session.loggedin = true;
    res.redirect('/adopt');
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/adopt');
            req.session.loggedin = false;
        }
    });
});

app.listen(port, () => {
    console.log(`Webserver app listening on port ${port}`);
})
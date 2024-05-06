const express = require("express");
const router = express.Router();
const UserData = require("../database/userdata.js");
const Adopted = require("../database/adopted.js");

router.get("/about", (req, res) => {
    res.render("about.ejs", {title : "About Cat Protection | Who are Cats Protection",loggedin: req.session.loggedin, admin: req.session.admin})
})

router.get("/donate", (req, res) => {
    res.render("donate.ejs", {title : "Donate | Help Cats and Kittens in Care",loggedin: req.session.loggedin, admin: req.session.admin})
})

router.get("/what-we-do", (req, res) => {
    res.render("whatwedo.ejs", {title : "What we do | Helping Cats and Kitten",loggedin: req.session.loggedin, admin: req.session.admin})
})

router.get("/help-and-advice", (req, res) => {
    res.render("help.ejs", {title : "Help and Advice | Expert Cat Care Guide",loggedin: req.session.loggedin, admin: req.session.admin})
})
router.get("/forgot", (req, res) => {
    res.render("forgot.ejs", {title : "Forgot Password",loggedin: req.session.loggedin, admin: req.session.admin, message: req.flash('error') })
})

router.get("/find-us", (req, res) => {
    res.render("find.ejs", {title : "Find Us",loggedin: req.session.loggedin, admin: req.session.admin})
})


router.get("/adm-dashboard", async(req, res) => {
    const adoptedCats = await Adopted.find({}); 
    adoptedCats.forEach(cat => {
        cat.adoptDate = cat.adoptDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    });
    const users = await UserData.find({}); 
    res.render("dashboard.ejs", {title : "Admin Dashboard", loggedin: req.session.loggedin, admin: req.session.admin, adopted: adoptedCats, users: users})
})

module.exports = router;
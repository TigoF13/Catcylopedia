const express = require("express");
const router = express.Router();
const { hashSync } = require("bcrypt");
const multer = require("multer");
const UserData = require("../database/userdata.js");
const passport = require("passport");
const dotenv = require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;
var path = require('path');
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const port = process.env.Port;

require("../config/passport.js");

const sendEmail = (email, link) => {
    const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: true,
    logger: true,
    debug: true,
    secureConnection: "false",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    });

    const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    text: "Please click the following link to reset your password: " + link,
    };

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Email sent: " + info.response);
    }
    });
};

router.post('/forgot', async (req, res) => {
    const {email} = req.body;
    try {
        const user = await UserData.findOne({email});
        if (!user) {
        return res.json({ status: "User Not Exists!!" });
        }
        const secret = process.env.JWT_SECRET + user.password;
        const token = jwt.sign({ email: user.email, id: user._id }, secret, {
        expiresIn: "10m",
        });
        const link = `http://localhost:${port}/reset-password/${user._id}/${token}`;
        sendEmail(email, link);
        req.flash('success', 'Email Sent, Please check your email to reset password');
        res.redirect('/login');
    } catch (error) {
    res.json({ status: error.message });
    }
});

router.get("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    try {
        const user = await UserData.findOne({_id : id});
        const secret = process.env.JWT_SECRET + user.password;
        jwt.verify(token, secret);
        res.render("reset.ejs",{title: 'Adopt a Cat', email: user.email, status: "Verified",message: req.flash('error'), id : id , token : token});
    } catch (error) {
        console.log("Caught error", error);  // New log statement
        res.json({ status: "Not Verified" });
    }
});

router.post("/reset-password/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const password = req.body.newpassword; 
    const confirmPassword = req.body.cnewpassword// Get the confirmed password

    // Check if the new password and the confirmed password match
    if (password !== confirmPassword) {
        req.flash('error', 'New password and confirmed password do not match');
        return res.redirect(`/reset-password/${id}/${token}`);
    }

    try {
        const user = await UserData.findOne({_id : id});
        const secret = process.env.JWT_SECRET + user.password;
        jwt.verify(token, secret);
        const encryptedPassword = await hashSync(password,10);
        await UserData.updateOne(
            { _id: id },
            { $set: { password: encryptedPassword } }
        );
        req.flash('success', 'Successfully reset password');  // Set flash message
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.json({ status: "Something Went Wrong" });
    }
});

router.get("/register", (req, res) => {
    res.render("register.ejs", {title : "Register", loggedin: req.session.loggedin, message: req.flash('error')})
})

router.post("/register", async (req, res) => {
    try {
        const { username, phone, email, password } = req.body;

        // Check if username already exists
        const existingUserByUsername = await UserData.findOne({ username });
        if (existingUserByUsername) {
            req.flash('error', 'The username is already taken, please try another');
            return res.redirect('/register');
        }

        // Check if phone number already exists
        const existingUserByPhone = await UserData.findOne({ phone });
        if (existingUserByPhone) {
            req.flash('error', 'The phone number is already taken, please try another');
            return res.redirect('/register');
        }

        // Check if email already exists
        const existingUserByEmail = await UserData.findOne({ email });
        if (existingUserByEmail) {
            req.flash('error', 'The email is already taken, please try another');
            return res.redirect('/register');
        }

        const newUser = new UserData({
            username,
            phone,
            email,
            password: hashSync(password, 15)
        });

        await newUser.save();
        req.flash('success', 'Account created successfully, please login');
        res.redirect('/login');
    } catch (err) {
        console.log(err);
    }
});

router.get("/login", (req, res) => {
    res.render("login.ejs", {title : "Login", loggedin: req.session.loggedin, admin: req.session.admin, message: req.flash('error'),successMessage: req.flash('success') })
})

router.post('/login', passport.authenticate('local', { failureRedirect: '/login',failureFlash: 'Wrong username/password, please try again'}), function(req, res) {
    // Check if the user's account is enabled
    if (!req.user.isEnabled) {
        req.flash('error', 'Account is disabled');
        return res.redirect('/login');
    }

    req.session.loggedin = true;
    req.session.admin = false;
    req.session.userId = req.user._id;

    if (req.session.userId.toHexString() === '661ff26eae3d330a7d101cd9'){
        req.session.admin = true;
        res.redirect('/adopt');
    } else {
        res.redirect('/adopt');
    }
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/adopt');
        }
    });
});

module.exports = router;
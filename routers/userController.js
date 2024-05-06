const express = require("express");
const router = express.Router();
const UserData = require("../database/userdata.js");
const { hashSync } = require("bcrypt");
const dotenv = require("dotenv").config();

router.get('/myacc', async function(req, res) {
    if (req.user) {
        try {
            const user = await UserData.findOne({ username: req.user.username });
            if (user) {
    
    
                res.render('myacc.ejs', {
                    title : "My Account",
                    loggedin: req.session.loggedin,
                    admin: req.session.admin,
                    user: user,
                    username: user.username,
                    phone: user.phone,
                    email: user.email,
                    password: user.password,
                    adoptedcats: user.adoptedcats
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

router.post('/change-phone', async (req, res) => {
    const { phone: newPhone } = req.body;
    const { _id } = req.user;

    try {
        const user = await UserData.findOne({ _id: _id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.phone = newPhone;
        await user.save();

        res.redirect('/myacc');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.post('/change-password', async (req, res) => {
    const { password: newPassword } = req.body;
    const { _id } = req.user;


    try {
        const user = await UserData.findOne({ _id: _id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.password = hashSync(newPassword,15)
        await user.save();

        res.redirect('/myacc');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.post('/disableUser', async (req, res) => {
    try {
        const user = await UserData.findByIdAndUpdate(req.session.userId, { isEnabled: false }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        } else {
            await new Promise((resolve, reject) => {
                req.session.destroy(function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            return res.redirect('/adopt');
        }
    } catch (err) {
        return res.status(500).json({ error: 'An error occurred' });
    }
});

router.post('/enableUser/:id', async (req, res) => {
    try {
        const user = await UserData.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isEnabled = true;
        await user.save();

        res.redirect('/adm-dashboard'); // Redirect back to the dashboard
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
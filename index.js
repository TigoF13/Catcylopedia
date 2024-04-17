const express = require("express");
const app = express();
const { hashSync } = require("bcrypt");
const UserData = require("./database/userdata.js");
const session = require("express-session");
const flash = require("connect-flash");
const StoreMongo = require("connect-mongo");
const passport = require("passport");
const dotenv = require("dotenv").config();

require("./config/passport.js");
const port = process.env.Port;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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

app.use(express.static("public"));

let cats = [
    { breed: 'Anggora', name: 'Snowball', age: '1 Year 6 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '2/29/2024', image: 'anggora.jpg' },
    { breed: 'Himalaya', name: 'Whiskers', age: '1 Year 1 Months 1 Days', gender: 'Female', color: 'Brown/White', intakeDate: '1/19/2024', image: 'himalaya.jpg' },
    { breed: 'Maine Coon', name: 'Shadow', age: '6 Months 26 Days', gender: 'Female', color: 'Brown', intakeDate: '1/5/2024', image: 'maine coon.png' },
    { breed: 'Munchkin', name: 'Smokey', age: '1 Year 26 Days', gender: 'Male', color: 'Gray', intakeDate: '12/29/2023', image: 'munchkin.jpg' },
    { breed: 'Persia', name: 'Simba', age: '1 Year 2 Months 16 Days', gender: 'Male', color: 'Gray/White', intakeDate: '1/9/2024', image: 'persia.jpg' },
    { breed: 'Ragdoll', name: 'Bella', age: '11 Months 8 Days', gender: 'Female', color: 'White/Brown', intakeDate: '1/18/2024', image: 'ragdoll.jpg' },
    { breed: 'Siamm', name: 'Luna', age: '1 Year 11 Months 8 Days', gender: 'Female', color: 'White/Black', intakeDate: '3/19/2024', image: 'siamm.jpg' },
    { breed: 'Siberian', name: 'Max', age: '10 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '4/19/2024', image: 'siberian.jpg' },
    { breed: 'Anggora', name: 'Snowball', age: '1 Year 6 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '2/29/2024', image: 'anggora.jpg' },
    { breed: 'Himalaya', name: 'Whiskers', age: '1 Year 1 Months 1 Days', gender: 'Female', color: 'Brown/White', intakeDate: '1/19/2024', image: 'himalaya.jpg' },
    { breed: 'Maine Coon', name: 'Shadow', age: '6 Months 26 Days', gender: 'Female', color: 'Brown', intakeDate: '1/5/2024', image: 'maine coon.png' },
    { breed: 'Munchkin', name: 'Smokey', age: '1 Year 26 Days', gender: 'Male', color: 'Gray', intakeDate: '12/29/2023', image: 'munchkin.jpg' },
    { breed: 'Persia', name: 'Simba', age: '1 Year 2 Months 16 Days', gender: 'Male', color: 'Gray/White', intakeDate: '1/9/2024', image: 'persia.jpg' },
    { breed: 'Ragdoll', name: 'Bella', age: '11 Months 8 Days', gender: 'Female', color: 'White/Brown', intakeDate: '1/18/2024', image: 'ragdoll.jpg' },
    { breed: 'Siamm', name: 'Luna', age: '1 Year 11 Months 8 Days', gender: 'Female', color: 'White/Black', intakeDate: '3/19/2024', image: 'siamm.jpg' },
    { breed: 'Siberian', name: 'Max', age: '10 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '4/19/2024', image: 'siberian.jpg' },
];

app.get("/", (req, res) => {
    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, cats: cats})
})

app.get("/adopt", (req, res) => {
    let updatedCats = cats;

    if (req.query.sort === 'age') {
        // Convert age to days for sorting
        updatedCats.forEach(cat => {
            let parts = cat.age.split(' ');
            let years = parts.includes('Year') ? Number(parts[parts.indexOf('Year') - 1]) : 0;
            let months = parts.includes('Months') ? Number(parts[parts.indexOf('Months') - 1]) : 0;
            let days = parts.includes('Days') ? Number(parts[parts.indexOf('Days') - 1]) : 0;
            cat.ageInDays = years * 365 + months * 30 + days;
        });
    
        // Sort cats by age in ascending order
        updatedCats.sort((a, b) => a.ageInDays - b.ageInDays);
    }
    
    if (req.query.sort === 'gender') {
        // Sort cats by gender in ascending order
        updatedCats.sort((a, b) => a.gender.localeCompare(b.gender));
    }
    
    if (req.query.gender && req.query.gender.toLowerCase() === 'male') {
        // Filter cats by male gender
        updatedCats = updatedCats.filter(cat => cat.gender.toLowerCase() === 'male');
    }
    
    if (req.query.gender && req.query.gender.toLowerCase() === 'female') {
        // Filter cats by female gender
        updatedCats = updatedCats.filter(cat => cat.gender.toLowerCase() === 'female');
    }

    if (req.query.breed) {
        // Filter cats by breed
        updatedCats = updatedCats.filter(cat => cat.breed.toLowerCase() === req.query.breed.toLowerCase());
    }

    if (req.query.ageGroup) {
        updatedCats = updatedCats.filter(cat => {
            let parts = cat.age.split(' ');
            let years = parts.includes('Year') ? Number(parts[parts.indexOf('Year') - 1]) : 0;
            let months = parts.includes('Months') ? Number(parts[parts.indexOf('Months') - 1]) : 0;
            let days = parts.includes('Days') ? Number(parts[parts.indexOf('Days') - 1]) : 0;

            let totalDays = years * 365 + months * 30 + days;

            if (req.query.ageGroup === 'adult') {
                // 8 months in days
                return totalDays >= 8 * 30;
            } else if (req.query.ageGroup === 'child') {
                // 7 months 29 days in days
                return totalDays <= 7 * 30 + 29;
            }
        });
    }

    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, cats: updatedCats})
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

app.get('/form', async function(req, res) {
    if (req.user) {
        try {
            const user = await UserData.findOne({ username: req.user.username });
            if (user) {
                res.render('form.ejs', {
                    title : "Form",
                    user: user,
                    loggedin: req.session.loggedin,
                    phone: user.phone,
                    email: user.email,
                    catName: req.query.catName
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
                    phone: user.phone,
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

app.post('/change-username', async (req, res) => {
    const { username: newUsername } = req.body;
    const { _id } = req.user;

    try {
        const user = await UserData.findOne({ _id: _id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.username = newUsername;
        await user.save();

        res.redirect('/myacc');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/change-phone', async (req, res) => {
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

app.post('/change-email', async (req, res) => {
    const { email: newEmail } = req.body;
    const { _id } = req.user;

    try {
        const user = await UserData.findOne({ _id: _id });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.email = newEmail;
        await user.save();

        res.redirect('/myacc');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post('/change-password', async (req, res) => {
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

app.get("/register", (req, res) => {
    res.render("register.ejs", {title : "Register", loggedin: req.session.loggedin})
})

app.post("/register", async (req, res) => {
    try {
        const newUser = new UserData({
            username: req.body.username,
            phone: req.body.phone,
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
    req.session.userId = req.user._id;
    res.redirect('/adopt');
});

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/adopt');
        }
    });
});

app.delete('/deleteUser', async (req, res) => {
    try {
        const user = await UserData.findByIdAndDelete(req.session.userId);

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

app.listen(port, () => {
    console.log(`Webserver app listening on port ${port}`);
})
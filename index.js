const express = require("express");
const app = express();
const { hashSync } = require("bcrypt");
const UserData = require("./database/userdata.js");
const session = require("express-session");
const flash = require("connect-flash");
const StoreMongo = require("connect-mongo");
const passport = require("passport");

require("./config/passport.js");
const port = 3001;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    store: StoreMongo.create({
        mongoUrl: "mongodb+srv://Jason:12345@catcyclopedia.bjdmtgw.mongodb.net/",
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
    let cats = [
        { name: 'Anggora', age: '1 Year 6 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '2/29/2024', image: 'anggora.jpg' },
        { name: 'Himalaya', age: '1 Year 1 Months 1 Days', gender: 'Female', color: 'Brown/White', intakeDate: '1/19/2024', image: 'himalaya.jpg' },
        { name: 'Maine Coon', age: '6 Months 26 Days', gender: 'Female', color: 'Brown', intakeDate: '1/5/2024', image: 'maine coon.png' },
        { name: 'Munchkin', age: '1 Year 26 Days', gender: 'Male', color: 'Gray', intakeDate: '12/29/2023', image: 'munchkin.jpg' },
        { name: 'Persia', age: '1 Year 2 Months 16 Days', gender: 'Male', color: 'Gray/White', intakeDate: '1/9/2024', image: 'persia.jpg' },
        { name: 'Ragdoll', age: '11 Months 8 Days', gender: 'Female', color: 'White/Brown', intakeDate: '1/18/2024', image: 'ragdoll.jpg' },
        { name: 'Siamm', age: '1 Year 11 Months 8 Days', gender: 'Female', color: 'White/Black', intakeDate: '3/19/2024', image: 'siamm.jpg' },
        { name: 'Siberian', age: '10 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '4/19/2024', image: 'siberian.jpg' }
    ];
    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, cats: cats})
})

app.get("/adopt", (req, res) => {
    let cats = [
        { name: 'Anggora', age: '1 Year 6 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '2/29/2024', image: 'anggora.jpg' },
        { name: 'Himalaya', age: '1 Year 1 Months 1 Days', gender: 'Female', color: 'Brown/White', intakeDate: '1/19/2024', image: 'himalaya.jpg' },
        { name: 'Maine Coon', age: '6 Months 26 Days', gender: 'Female', color: 'Brown', intakeDate: '1/5/2024', image: 'maine coon.png' },
        { name: 'Munchkin', age: '1 Year 26 Days', gender: 'Male', color: 'Gray', intakeDate: '12/29/2023', image: 'munchkin.jpg' },
        { name: 'Persia', age: '1 Year 2 Months 16 Days', gender: 'Male', color: 'Gray/White', intakeDate: '1/9/2024', image: 'persia.jpg' },
        { name: 'Ragdoll', age: '11 Months 8 Days', gender: 'Female', color: 'White/Brown', intakeDate: '1/18/2024', image: 'ragdoll.jpg' },
        { name: 'Siamm', age: '1 Year 11 Months 8 Days', gender: 'Female', color: 'White/Black', intakeDate: '3/19/2024', image: 'siamm.jpg' },
        { name: 'Siberian', age: '10 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '4/19/2024', image: 'siberian.jpg' }
    ];

    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, cats: cats})
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
            // req.session.loggedin = false;
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
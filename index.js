const express = require("express");
const app = express();
const { hashSync } = require("bcrypt");
const multer = require("multer");
const UserData = require("./database/userdata.js");
const Adopted = require("./database/adopted.js");
const Cats = require("./database/cats.js");
const session = require("express-session");
const flash = require("connect-flash");
const StoreMongo = require("connect-mongo");
const passport = require("passport");
const dotenv = require("dotenv").config();
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
var path = require('path');
const dirname = path.resolve(__dirname, '../Catcyclopedia');

require("./config/passport.js");
const port = process.env.Port;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Set maximum file size (e.g., 10MB)
});

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


app.get("/", async (req, res) => {
    let query = Cats.find();
    const cats = await query.exec();
    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, admin: req.session.admin, cats: cats})
})

app.get("/adopt", async (req, res) => {
    try {
        console.log(req.query);
        let query = Cats.find();

        if (req.query.gender) {
            query = query.where('gender').regex(new RegExp('^' + req.query.gender, 'i'));
        }

        if (req.query.breed) {
            query = query.where('breed').regex(new RegExp('^' + req.query.breed, 'i'));
        }

        let cats = await query.exec();

        cats = cats.map(cat => {
            const ageParts = cat.age.split(' ');
            let years = 0, months = 0, days = 0;
            for (let i = 0; i < ageParts.length; i++) {
                if (!isNaN(ageParts[i])) {
                    switch (ageParts[i + 1].toLowerCase()) {
                        case 'years':
                        case 'year':
                            years = parseInt(ageParts[i]);
                            break;
                        case 'months':
                        case 'month':
                            months = parseInt(ageParts[i]);
                            break;
                        case 'days':
                        case 'day':
                            days = parseInt(ageParts[i]);
                            break;
                    }
                }
            }
            const totalDays = years * 365 + months * 30 + days;
            return { ...cat._doc, totalDays };
        });

        if (req.query.sort === 'age') {
            cats.sort((a, b) => a.totalDays - b.totalDays);
        }

        if (req.query.ageGroup) {
            cats = cats.filter(cat => {
                if (req.query.ageGroup === 'adult') {
                    return cat.totalDays >= 8 * 30;
                } else if (req.query.ageGroup === 'child') {
                    return cat.totalDays < 8 * 30;
                }
            });
        }

        res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, admin: req.session.admin, cats: cats});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.post("/search", async (req, res) => {
    try {
        const searchTerm = req.body.search;
        const cats = await Cats.find();
        const filteredCats = cats.filter(cat => cat.name.toLowerCase().startsWith(searchTerm.toLowerCase()));

        res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, admin: req.session.admin, cats: filteredCats});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs", {title : "About Cat Protection | Who are Cats Protection",loggedin: req.session.loggedin, admin: req.session.admin})
})

app.get("/donate", (req, res) => {
    res.render("donate.ejs", {title : "Donate | Help Cats and Kittens in Care",loggedin: req.session.loggedin, admin: req.session.admin})
})

app.get("/what-we-do", (req, res) => {
    res.render("whatwedo.ejs", {title : "What we do | Helping Cats and Kitten",loggedin: req.session.loggedin, admin: req.session.admin})
})

app.get("/help-and-advice", (req, res) => {
    res.render("help.ejs", {title : "Help and Advice | Expert Cat Care Guide",loggedin: req.session.loggedin, admin: req.session.admin})
})

app.get("/find-us", (req, res) => {
    res.render("find.ejs", {title : "Find Us",loggedin: req.session.loggedin, admin: req.session.admin})
})

app.get("/addcat", (req, res) => {
    res.render("addcat.ejs", {title : "Add Cat",loggedin: req.session.loggedin, admin: req.session.admin})
})
app.get('/form', async function(req, res) {
    if (req.user) {
        try {
            const user = await UserData.findOne({ username: req.user.username });
            if (user) {
                res.render('form.ejs', {
                    title : "Form",
                    user: user,
                    admin: req.session.admin,
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
                    admin: req.session.admin,
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

app.post('/Add-cat', (req, res, next) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            // An error occurred when uploading
            console.error(err);
            return res.status(400).send('Error uploading file');
        }

        // Everything went fine, proceed with your route handler
        const { name, breed, AgeY, AgeM, AgeD, gender, color, InD, InM, inY } = req.body;
        console.log(req.body.image); // Make sure req.file is logged
        console.log(req.file); // Make sure req.file is logged

        // Check if req.file exists
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).send('No file in request');
        }

        // If req.file exists, proceed with saving the data
        const image = {
            data: req.file.path,
            contentType: req.file.mimetype
        };

        const age = `${AgeY > 0 ? AgeY + ' Years ' : ''}${AgeM > 0 ? AgeM + ' Months ' : ''}${AgeD > 0 ? AgeD + ' Days' : ''}`.trim();  
        const intakeDate = `${InD}/${InM}/${inY}`;

        const Cat = new Cats({ name, breed, age, gender, color, intakeDate, image, adopted: false });

        try {
            await Cat.save();
            console.log(`Saved new cat: ${name}, ${breed}, ${age}, ${gender}, ${color}, ${intakeDate}, ${JSON.stringify(image)}`);
            res.redirect('/adopt');
        } catch (err) {
            console.error(err);
            res.status(500).send('Error saving cat');
        }
    });
});



app.post('/submit-form', async (req, res) => {
    const { firstName, lastName, streetAddress, city, region, postalCode, phone, email, catName } = req.body;
    const { _id } = req.user;

    try {
        const user = await UserData.findOne({ _id: _id });
        if (!user) {
            return res.status(404).send('User not found');
        }
    
        const cat = await Cats.findOne({ name: catName });
        if (cat) {
            cat.adopted = true;
            await cat.save();
        }
    
        const adopted = new Adopted({ firstName, lastName, streetAddress, city, region, postalCode, phone, email, catName, userId: _id });
        user.adoptedcats.push(catName);
        await adopted.save();
        await user.save();
    
        const cats = await Cats.find({}); // Fetch all cats from the database
    
        req.flash('success', 'Thank you for adopting a cat! We will contact you soon.');
        res.render('adopt', { title: 'Adopt a Cat', loggedin: req.session.loggedin, messages: req.flash(), cats: cats, admin: req.session.admin });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
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
    res.render("login.ejs", {title : "Login", loggedin: req.session.loggedin, admin: req.session.admin, message: req.flash('error') })
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login',failureFlash: 'Wrong username/password, please try again'}), function(req, res) {
    req.session.loggedin = true;
    req.session.admin = false;
    req.session.userId = req.user._id;
    console.log(req.session.userId);

    if (req.session.userId.toHexString() === '661ff26eae3d330a7d101cd9'){
        req.session.admin = true;
        res.redirect('/adopt');
    } else {
        res.redirect('/adopt');
    }
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
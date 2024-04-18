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





// let cats = [
//     { breed: 'Anggora', name: 'Snowball', age: '1 Year 6 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '2/29/2024', image: 'anggora.jpg',adopted: false },
//     { breed: 'Himalaya', name: 'Whiskers', age: '1 Year 1 Months 1 Days', gender: 'Female', color: 'Brown/White', intakeDate: '1/19/2024', image: 'himalaya.jpg',adopted: false },
//     { breed: 'Maine Coon', name: 'Shadow', age: '6 Months 26 Days', gender: 'Female', color: 'Brown', intakeDate: '1/5/2024', image: 'maine coon.png', adopted: false  },
//     { breed: 'Munchkin', name: 'Smokey', age: '1 Year 26 Days', gender: 'Male', color: 'Gray', intakeDate: '12/29/2023', image: 'munchkin.jpg', adopted: false  },
//     { breed: 'Persia', name: 'Simba', age: '1 Year 2 Months 16 Days', gender: 'Male', color: 'Gray/White', intakeDate: '1/9/2024', image: 'persia.jpg', adopted: false  },
//     { breed: 'Ragdoll', name: 'Bella', age: '11 Months 8 Days', gender: 'Female', color: 'White/Brown', intakeDate: '1/18/2024', image: 'ragdoll.jpg', adopted: false  },
//     { breed: 'Siamm', name: 'Luna', age: '1 Year 11 Months 8 Days', gender: 'Female', color: 'White/Black', intakeDate: '3/19/2024', image: 'siamm.jpg', adopted: false  },
//     { breed: 'Siberian', name: 'Max', age: '10 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '4/19/2024', image: 'siberian.jpg', adopted: false  },
//     { breed: 'Anggora', name: 'Snowball', age: '1 Year 6 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '2/29/2024', image: 'anggora.jpg',adopted: false },
//     { breed: 'Himalaya', name: 'Whiskers', age: '1 Year 1 Months 1 Days', gender: 'Female', color: 'Brown/White', intakeDate: '1/19/2024', image: 'himalaya.jpg',adopted: false },
//     { breed: 'Maine Coon', name: 'Shadow', age: '6 Months 26 Days', gender: 'Female', color: 'Brown', intakeDate: '1/5/2024', image: 'maine coon.png', adopted: false  },
//     { breed: 'Munchkin', name: 'Smokey', age: '1 Year 26 Days', gender: 'Male', color: 'Gray', intakeDate: '12/29/2023', image: 'munchkin.jpg', adopted: false  },
//     { breed: 'Persia', name: 'Simba', age: '1 Year 2 Months 16 Days', gender: 'Male', color: 'Gray/White', intakeDate: '1/9/2024', image: 'persia.jpg', adopted: false  },
//     { breed: 'Ragdoll', name: 'Bella', age: '11 Months 8 Days', gender: 'Female', color: 'White/Brown', intakeDate: '1/18/2024', image: 'ragdoll.jpg', adopted: false  },
//     { breed: 'Siamm', name: 'Luna', age: '1 Year 11 Months 8 Days', gender: 'Female', color: 'White/Black', intakeDate: '3/19/2024', image: 'siamm.jpg', adopted: false  },
//     { breed: 'Siberian', name: 'Max', age: '10 Months 26 Days', gender: 'Male', color: 'White', intakeDate: '4/19/2024', image: 'siberian.jpg', adopted: false  },
// ];

app.get("/", (req, res) => {
    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, admin: req.session.admin, cats: Cats})
})

app.get("/adopt", async (req, res) => {
    let query = Cats.find();

    if (req.query.sort === 'age') {
        query = query.sort({ ageInDays: 1 }); // assuming ageInDays is a field in your schema
    }

    if (req.query.sort === 'gender') {
        query = query.sort({ gender: 1 });
    }

    if (req.query.gender) {
        query = query.where('gender').equals(req.query.gender.toLowerCase());
    }

    if (req.query.breed) {
        query = query.where('breed').equals(req.query.breed.toLowerCase());
    }

    if (req.query.ageGroup) {
        if (req.query.ageGroup === 'adult') {
            query = query.where('ageInDays').gte(8 * 30); // assuming ageInDays is a field in your schema
        } else if (req.query.ageGroup === 'child') {
            query = query.where('ageInDays').lte(7 * 30 + 29);
        }
    }

    const updatedCats = await query.exec();

    res.render("adopt.ejs", {title : "Adopt a cat | Find a cat to adopt", loggedin: req.session.loggedin, admin: req.session.admin, cats: updatedCats})
});

app.get("/about", (req, res) => {
    res.render("about.ejs", {title : "About Cat Protection | Who are Cats Protection",loggedin: req.session.loggedin, admin: req.session.admin})
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

        const age = `${AgeY} Years ${AgeM} Months ${AgeD} Days`;
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
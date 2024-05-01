// MODULE INITIALIZATION

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../database/userdata.js');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(

    // FUNCTIONS FOR AUTHENTICATION
    function(username, password, done) {
        User.findOne({ username: username })
            .then(user => {
                if (!user) { 
                    return done(null, false, { message: "Wrong username/password, please try again" });
                }

                // Compares the given password with the password stored in the database.
                bcrypt.compare(password, user.password, function(err, result) {
                    if (err) { return done(err); }
                    
                    if (!result) { 
                        return done(null, false, { message: "Wrong username/password, please try again" }); 
                    }

                    return done(null, user);
                });
            })
            .catch(err => done(err));
    }
));

// User serialization for storage in Passport sessions.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// Deserialize users from Passport session storage
passport.deserializeUser(function(id, done) {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});

module.exports = passport;
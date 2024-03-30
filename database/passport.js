const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('./userdata.js');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username })
            .then(user => {
                if (!user) { 
                    return done(null, false, { message: "Incorrect username" });
                }

                bcrypt.compare(password, user.password, function(err, result) {
                    if (err) { return done(err); }
                    
                    if (!result) { 
                        return done(null, false, { message: "Incorrect password" }); 
                    }

                    return done(null, user);
                });
            })
            .catch(err => done(err));
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});
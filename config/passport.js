const LocalStrategies = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const user = require('../models/dog.js');

module.exports = (passport) => {

    passport.use(new LocalStrategies({
        usernameField:'email',
        passwordField:'password'
    }, (username, password, done) => {
        user.findOne({email:username}, (err, user) => {
            if (err) {
                return done(err)
            }
            if (!user) {
                return done(null, false, {message:'No user Found'})
            }

            // Using Bctypt
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    console.log(err);
                }
                if (match) {
                    return done(null, user)
                } else {
                    return done(null, false, {message:'Wrong Password'})
                }
            })
        })
    }));

    // Using session
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        user.findById(id, (err, user) => {
          done(err, user);
        });
      });
 };
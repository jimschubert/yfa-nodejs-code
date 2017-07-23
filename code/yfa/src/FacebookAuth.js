'use strict';
var path = require('path');
var facebook = require(path.join(
    process.env.HOME,
    '.config',
    'yfa-nodejs',
    'facebook.json'));
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('./models/user');

module.exports = exports = function (passport) {
    // Configure the FacebookStrategy
    passport.use(new FacebookStrategy({
            clientID: facebook.app.id,
            clientSecret: facebook.app.secret,
            callbackURL: (facebook.app.host||"") + "/auth/facebook/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            User.fb(profile.id, function (err, existingUser) {
                if (existingUser) {
                    done(null, existingUser);
                } else {
                    var newUser = new User({
                        facebookId: profile.id,
                        registrationDone: false,
                        username: profile.username,
                        first_name: profile.name.givenName,
                        last_name: profile.name.familyName,
                        email: profile.emails[0].value
                    });

                    newUser.save(done);
                }
            });
        }
    ));

    // prepare for user serialize/deserialize
    passport.serializeUser(function (user, done) {
        done(null, user.facebookId);
    });

    passport.deserializeUser(function (id, done) {
        User.fb(id, done);
    });
};

module.exports.login = exports.login = function (req, res) {
    if (req.user.registrationDone) {
        res.redirect('/');
    } else {
        res.redirect('/user/profile');
    }
};

module.exports.logout = exports.logout = function (req, res) {
    req.logout();
    // do any additional Facebook-related cleanup
    // set user to offline
    res.redirect('/login');
};

module.exports.verifyAuth = exports.verifyAuth = function (req, res, next) {
    var authenticated = req.isAuthenticated();
    if (authenticated && !req.user.registrationDone && req.path !== "/user/profile") {
        return res.redirect('/user/profile');
    }

    return authenticated ?
        next() :
        res.redirect('/login');
};

'use strict';
var path = require('path');
var facebook = require(path.join(
    process.env.HOME,
    '.config',
    'yfa-nodejs',
    'facebook.json'));
var FacebookStrategy = require('passport-facebook').Strategy;

module.exports = exports = function (passport) {
    // Configure the FacebookStrategy
    passport.use(new FacebookStrategy({
            clientID: facebook.app.id,
            clientSecret: facebook.app.secret,
            callbackURL: (facebook.app.host||"") + "/auth/facebook/callback"
        },
        function (accessToken, refreshToken, profile, done) {
            return done(null, {
                facebook: profile
            });
        }
    ));

    // prepare for user serialize/deserialize
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });
};

module.exports.login = exports.login = function (req, res) {
    // query user, if exists...
    res.redirect('/');
    // else...  res.redirect('/user/profile');
};

module.exports.logout = exports.logout = function (req, res) {
    req.logout();
    // do any additional Facebook-related cleanup
    // set user to offline
    res.redirect('/login');
};

module.exports.verifyAuth = exports.verifyAuth = function (req, res, next) {
    return req.isAuthenticated() ?
        next() :
        res.redirect('/login');
};

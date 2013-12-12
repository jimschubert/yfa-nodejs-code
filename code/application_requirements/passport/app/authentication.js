var path = require('path'),
    facebook = require(path.join(process.env.HOME, '.config', 'yfa-nodejs', 'facebook.json')),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
        clientID: facebook.app.id,
        clientSecret: facebook.app.secret,
        callbackURL: "http://yfa.dev:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        // Here, query and return our application user instead
        // of returning the facebook profile
        return done(null, {
            facebook: profile
        });
    }
));

// The following two functions allow passport to get/set facebook user on the session
// in a production application, you'd serialize the facebook profile's id, and deserialize
// would query the database by that id and return your application's user object
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

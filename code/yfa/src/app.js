"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    resource = require('./routes/resource'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    FacebookAuth = require('./FacebookAuth'),
    User = require('./models/user');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

// use ejs module for .ejs files and ejs#renderFile for .html files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'SECRET' }));
FacebookAuth(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

if ('test' !== app.get('env')) {
    app.use(express.logger());
}

// development only
if ('development' === app.get('env')) {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
}

var page = function (filename) {
    return function (req, res) {
        res.render(filename);
    };
};

// app.get('/', routes.index);
app.get('/compiled/*?', routes.partial);
app.get('/resources', resource.list);

app.get('/login', page('login.html'));
app.get('/logout', page('logout.html'));
app.get('/authentication', page('authentication.html'));
app.get('/user/profile',
    FacebookAuth.verifyAuth,
    function (req, res) {
        res.render('profile', { user: req.user });
    });

app.post('/user/profile',
    FacebookAuth.verifyAuth,
    function (req, res) {
        var upd = req.body;
        User.fb(req.user.facebookId, function(err, user){
            if (err) { /* handle err */ }

            // only new users can change their usernames
            if (!user.registrationDone) {
                // TODO: Verify username matches rules, then...
                user.username = upd.username;
            }

            user.registrationDone = true;
            user.first_name = upd.first_name || user.first_name;
            user.last_name = upd.last_name || user.last_name;
            user.email = upd.email || user.email;
            user.state = User.States.ONLINE;

            user.save(function(err, user, numAffected) {
                res.render('profile', { user: user });
            });
        });
    });

app.get('/auth/facebook',
    passport.authenticate('facebook', {
            scope: 'email'
        }
    ), function () {});

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/authentication'
    }),
    FacebookAuth.login);
app.get('/auth/logout', FacebookAuth.logout);

// If running from the command line, start the server
if (module === require.main) {
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
} else {
    // file was require()'d, export (if you don't want to unit test this file, you can remove this)
    app.toots = true;
    module.exports = exports = app;
    module.exports.app = exports.app = app;
}

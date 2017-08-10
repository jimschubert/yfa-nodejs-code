"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    users = require('./routes/users'),
    resource = require('./routes/resource'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    FacebookAuth = require('./FacebookAuth.js'),
    User = require('./models/user');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());

// passport init
app.use(express.cookieParser());
app.use(express.session({ secret: 'SECRET' }));
FacebookAuth.call(null, passport);
app.use(passport.initialize());
app.use(passport.session());
// end pasport init

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

// Page helper
var page = function (filename) {
    return function (req, res) {
        res.render(filename);
    };
};

app.get('/auth/facebook',
    passport.authenticate('facebook', {
            scope: 'email'
        }
    ),
    function(){ /* redirected before this executes */ }
);

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/authentication'
    }),
    FacebookAuth.login);

app.get('/auth/logout', FacebookAuth.logout);

app.get('/authentication', page('authentication.html'));
app.get('/login', page('login.html'));
app.get('/logout', page('logout.html'));

app.post('/users', users.create);

app.get('/user/profile',
    FacebookAuth.verifyAuth,
    function (req, res) {
        res.render('profile', { user: req.user });
    });

app.post('/user/profile',
    FacebookAuth.verifyAuth,
    function (req, res, next) {
        var upd = req.body;
        User.fb(req.user.facebookId, function(err, user){
            if (err) { return next(err); }
            if (user === null) {
                // TODO: redirect to an "oops" page. 
                // This would indicate bad data in the database.
                return res.redirect('/user/profile');
            }

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

            user.save(function(err, user /*, numAffected */) {
                // TODO: Handle database errors
                res.render('profile', { user: user });
            });
        });
    });

// app.get('/', routes.index);
app.get('/compiled/*?', routes.partial);
app.get('/resources', resource.list);

// If running from the command line, start the server
if (module === require.main) {
    var connection = require('./db');
    connection().on('connected', function(err){
        if(err){
            process.stderr.write(err);
            process.exit(1);
        }
    });
    http.createServer(app).listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
} else {
    // file was require()'d, export (if you don't want to unit test this file, you can remove this)
    app.toots = true;
    module.exports = exports = app;
    module.exports.app = exports.app = app;
}

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
    FacebookAuth = require('./FacebookAuth.js');

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
    passport.authenticate('facebook'),
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

app.get('/user/profile', FacebookAuth.verifyAuth, page('profile.html'));

// app.get('/', routes.index);
app.get('/compiled/*?', routes.partial);
app.get('/resources', resource.list);

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

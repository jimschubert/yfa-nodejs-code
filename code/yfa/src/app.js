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
    FacebookAuth = require('./FacebookAuth');

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
app.get('/user/profile', FacebookAuth.verifyAuth, page('profile.html'));

app.get('/auth/facebook', passport.authenticate('facebook'), function(){});
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

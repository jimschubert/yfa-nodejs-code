
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');

// separate file for clean inclusion in book text
var authentication = require('./authentication');

var noop = function(){};

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// required for passport storage on request
app.use(express.cookieParser());
app.use(express.session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/user/profile', verifyAuth, user.profile);
app.get('/auth/facebook', passport.authenticate('facebook'), noop);
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

function verifyAuth(req, res, next) {
    return req.isAuthenticated() ?
        next() :
        res.redirect('/login');
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

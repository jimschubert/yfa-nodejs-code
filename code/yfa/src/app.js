"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    users = require('./routes/users'),
    messages = require('./routes/messages'),
    images = require('./routes/images'),
    http = require('http'),
    path = require('path'),
    passport = require('passport'),
    FacebookAuth = require('./FacebookAuth'),
    User = require('./models/user'),
    middleware = require('./middleware');

var app = express();

var server = http.Server(app);
var io = require('socket.io')(server);

// all environments
app.set('port', process.env.PORT || 3000);

// use ejs module for .ejs files and ejs#renderFile for .html files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.favicon());
app.use(express.bodyParser({uploadDir: path.join(__dirname, 'tmp'), keepExtensions:true}));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: 'SECRET' }));
FacebookAuth.call(null, passport);
app.use(passport.initialize());
app.use(passport.session());

/* custom middlware needs to come before router */
app.use(middleware.requestUri);
app.use(middleware.responseProblem);

if ('test' !== app.get('env')) {
    app.use(express.logger());
}

// development only
if ('development' === app.get('env')) {
    app.use(express.logger('dev'));
    app.use(express.errorHandler());
}

// router has to come late if you want to log, for example:
// "POST /api/v1/users 405 3ms - 264b"
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

var page = function (filename) {
    return function (req, res) {
        res.render(filename);
    };
};

/* Users */
var apiBase = '/api/v1';
app.get(apiBase + '/users', middleware.requiresAuth, users.list);
app.post(apiBase + '/users', middleware.requiresAuth, users.create);

app.param('mid', function(req,res,next,mid){
    mid = /^[a-z0-9]+$/.exec(String(mid));
    if (mid) {
        req.params['mid'] = mid[0];
        next();
    } else {
        // next('route') is a special case in Express that passes to the next
        // possible matching route
        next('route');
    }
});

app.get(apiBase + '/users/:mid', middleware.requiresAuth, users.getById);
app.put(apiBase + '/users/:mid', middleware.requiresAuth, middleware.constrainToUserAction, users.update);
app.delete(apiBase + '/users/:mid', middleware.requiresAuth, middleware.constrainToUserAction, users.delete);
app.get(apiBase + '/users/:mid/messages', middleware.requiresAuth, middleware.constrainToUserAction, users.getMessages);
app.get(apiBase + '/users/:mid/cohorts', middleware.requiresAuth, users.getCohortsById);
app.post(apiBase + '/users/:mid/cohorts/:id', middleware.requiresAuth, middleware.constrainToUserAction, users.addCohortForUser);
app.delete(apiBase + '/users/:mid/cohorts/:id', middleware.requiresAuth, middleware.constrainToUserAction, users.removeCohortFromUser);

app.get(apiBase + '/cohorts', middleware.midFromQueryString('user_id'),
    middleware.requiresAuth,
    middleware.constrainToUserAction,
    users.getCohortsById);

app.post(apiBase + '/cohorts/:id', middleware.midFromQueryString('user_id'),
    middleware.requiresAuth,
    middleware.constrainToUserAction,
    users.addCohortForUser);

app.delete(apiBase + '/cohorts/:id', middleware.midFromQueryString('user_id'),
    middleware.requiresAuth,
    middleware.constrainToUserAction,
    users.removeCohortFromUser);

app.post(apiBase + '/messages', middleware.midFromQueryString('user_id'),
    middleware.requiresAuth,
    messages.send);

app.get(apiBase + '/messages/:mid',
    middleware.requiresAuth,
    messages.getById);

app.get(apiBase + '/messages/:mid/attachments',
    middleware.requiresAuth,
    messages.getAttachments);

app.delete(apiBase + '/messages/:mid',
    middleware.requiresAuth,
    messages.delete);

app.get(apiBase + '/images',
    middleware.requiresAuth,
    images.list);

app.post(apiBase + '/images',
    middleware.requiresAuth,
    images.save);

app.get(apiBase + '/images/:mid',
    middleware.requiresAuth,
    images.getById);

app.get('/compiled/*?', routes.partial);

app.get('/', routes.index);
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
            // only new users can change their usernames
            if (!user.registrationDone) {
                // TODO: Verify username matches rules, then...
                user.username = upd.username;
            }

            user.registrationDone = true;
            user.firstName = upd.firstName || user.firstName;
            user.lastName = upd.lastName || user.lastName;
            user.email = upd.email || user.email;
            user.state = User.States.ONLINE;

            user.save(function(err, user, numAffected) {
                console.log('User profile rows affected', numAffected);
                res.render('profile', { user: user });
            });
        });
    });

app.get('/auth/facebook',
    passport.authenticate('facebook', { scope: 'email' } ), function () {});

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/authentication'
    }),
    FacebookAuth.login);

app.get('/auth/logout', FacebookAuth.logout);

io.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

// If running from the command line, start the server
if (module === require.main) {
    var connection = require('./db');
    connection().on('connected', function(err){
        if(err){
            process.stderr.write(err);
            process.exit(1);
        }
    });

    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });

} else {
    // file was require()'d, export (if you don't want to unit test this file, you can remove this)
    app.toots = true;
    module.exports = exports = app;
    module.exports.app = exports.app = app;
}

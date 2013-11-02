"use strict";

/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    resource = require('./routes/resource'),
    http = require('http'),
    path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
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

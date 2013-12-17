"use strict";

var mongoose = require('mongoose');
var assert = require('assert');

var uri = 'mongodb://localhost/yfatest';
var options = {
    db: { native_parser: true },
    server: { poolSize: 5 },
    keepAlive: true
};

module.exports = exports = function () {
    var db = mongoose.connect(uri, options);

    db.connection.on('error', function (err) {
        assert.ok(err);
    });

    return db.connection;
};

module.exports.mongoose = mongoose;
module.exports.uri = uri;



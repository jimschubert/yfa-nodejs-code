"use strict";

var mongoose = require('mongoose');

var uri = 'mongodb://localhost/yfachat';
var options = {
    db: { native_parser: true },
    server: { poolSize: 5 },
    keepAlive: true
};

module.exports = exports = function () {
    var db = mongoose.connect(uri, options);

    db.connection.on('error', function (err) {
        // warn: stderr is blocking
        process.stderr.write(err);

        // can't operate without database.
        process.exit(1);
    });

    return db.connection;
};

module.exports.mongoose = mongoose;
module.exports.uri = uri;



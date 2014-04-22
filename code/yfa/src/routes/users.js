"use strict";

var HttpStatus = require('http-status');

/**
 * Create a user
 * @param req
 * @param res
 */
exports.create = function (req, res) {
    res.problem(HttpStatus.METHOD_NOT_ALLOWED,
        "You're not allowed to create users on this system",
        "Users are created via 3rd party (Facebook) authentication");
};

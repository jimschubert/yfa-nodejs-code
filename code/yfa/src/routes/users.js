"use strict";

var HttpStatus = require('http-status');

/**
 * Create a user
 * @param req
 * @param res
 */
exports.create = function (req, res) {
    res.json(HttpStatus.METHOD_NOT_ALLOWED, { message: "Cannot create users." });
};
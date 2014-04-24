"use strict";

var HttpStatus = require('http-status');
var User = require('../models/user');

/**
 * Create a user
 *
 * @errors (405) You're not allowed to create users on this system
 *
 * @param req An express request object
 * @param res An express res object, expected to contain res.problem middleware
 * @return {problem}
 */
exports.create = function (req, res) {
    return res.problem(HttpStatus.METHOD_NOT_ALLOWED,
        "You're not allowed to create users on this system",
        "Users are created via 3rd party (Facebook) authentication");
};

/**
 * Gets a list of all users
 *
 * @errors (500) Unexpected problem
 *
 * @param req An express request object
 * @param res An express res object, expected to contain res.problem middleware
 * @return {problem|null|object}
 */
exports.list = function (req, res) {
    User.publicList(req.query.skip, req.query.take, function(err, results){
        if(err){
            return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected problem",
                "Could not list users due to internal error");
        }

        if(results === null || results.length === 0){
            return res.json(HttpStatus.NO_CONTENT);
        } else {
            return res.json(HttpStatus.OK, results);
        }
    });
};

'use strict';
var requiresAuth = require('./requiresAuth.js'),
    req_URI = require('./req.URI.js'),
    res_problem = require('./res.problem.js'),
    constrainToUserAction = require('./constrainToUserAction.js');

module.exports = exports = {
    requestUri: req_URI,
    responseProblem: res_problem,
    requiresAuth: requiresAuth,
    constrainToUserAction: constrainToUserAction
}; 
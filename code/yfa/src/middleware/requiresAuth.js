'use strict';
var HttpStatus = require('http-status');

module.exports = exports = function(req,res,next){
    if(req.isAuthenticated()){
        // the request has access, move to next middleware functionality.
        return next();
    } else {
        return res.problem(HttpStatus.UNAUTHORIZED,
            "Action requires user authentication.",
            "Please authenticate and try to access this protected resource again.");
    }
};
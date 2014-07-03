'use strict';
var HttpStatus = require('http-status');
module.exports = exports = function(req,res,next){
    if(req.user._id.toString() !== req.params.mid) {
        return res.problem(
            HttpStatus.FORBIDDEN,
            "You're not allowed to do that!",
            "You can only modify your own user information."
        );
    } else {
        return next();
    }
};
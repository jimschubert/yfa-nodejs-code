'use strict';

module.exports = exports = function(key){
    key = key || 'mid';
    return function(req,res,next){
        var mid = /^[a-z0-9]+$/.exec(String(req.query[key]));
        if(mid){
            req.params.mid = mid[0];
            next();
        } else {
            next('route');
        }
    };
};
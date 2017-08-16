'use strict';

module.exports = exports = function(key, prop){
    key = key || 'mid';
    prop = prop || 'mid';
    return function(req,res,next){
        var mid = req.query[key] && /^[a-z0-9]+$/.exec(String(req.query[key]));
        if(mid){
            req.params[prop] = mid[0];
            next();
        } else {
            next('route');
        }
    };
};

'use strict';

module.exports = exports = function(req,res,next){
    req.baseUri = function(){
        return req.protocol + '://' + req.get('Host');
    }.bind(req);
    req.absoluteUri = function(){
        return req.protocol + '://' + req.get('Host') + req.url;
    }.bind(req);
    next();
};
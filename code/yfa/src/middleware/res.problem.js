'use strict';
var HttpStatus = require('http-status');

module.exports = exports = function(req,res,next){
    res.problem = function(status, title, details, extensions) {
        // default to a 400 Bad Request if we call this incorrectly
        if("number" !== typeof status) {
            status = 400;
        } else if (!(status in HttpStatus)) {
            status = 400;
        }

        var problem = {
            "type": req.baseUri() + "/probs/" + HttpStatus[status].toLowerCase().replace(/\s+/g, '-'),
            "title": title,
            "detail": details,
            "instance": req.absoluteUri(),
            "status": status
        };

        // add any property extensions to 'problem'
        if("object" === typeof extensions) {
            delete extensions['type'];
            delete extensions['instance'];
            delete extensions['status'];

            for(var key in extensions){
                if(extensions.hasOwnProperty(key)) {
                    problem[key] = extensions[key];
                }
            }
        }

        res.set({
            'Content-Type' : 'application/problem+json',
            'Content-Language': 'en'
        });
        res.json(status, problem);
    }.bind(res);
    next();
};

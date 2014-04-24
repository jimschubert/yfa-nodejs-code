'use strict';
var HttpStatus = require('http-status');

module.exports = exports = function(req,res,next){
    res.problem = function(status, title, details, extensions) {
        // default to a 400 Bad Request if we call this incorrectly
        if("number" !== typeof status) {
            console.warn("HTTP Problem status was not a number. It was %j", status);
            status = 400;
        } else if (!(status in HttpStatus)) {
            console.warn("HTTP Problem status was not an http status code. Got %d", status);
            status = 400;
        }

        /**
         @typedef problem
         @type {Object}
         @property {string} type The type of problem.
         @property {string} title A short title explaining what the problem is.
         @property {string} detail A longer description about what happened.
         @property {string} instance The endpoint/instance of the request that caused this problem.
         @property {Number} status The HTTP status code generated by this problem.
         */
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
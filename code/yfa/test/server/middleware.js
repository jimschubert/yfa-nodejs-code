'use strict';

var middleware = require('../../src/middleware');
var assert = require('assert');
var HttpStatus = require('http-status');
require('should'); // this modifies Object.prototype

describe('middleware', function () {
    describe('request middleware', function () {
        describe('req', function () {
            var protocol = 'https';
            var host = "www.example.com:8081";
            var req = {
                "protocol": protocol,
                "get"     : function (key) {
                    assert.equal(key, 'Host', 'we expect the Host key');
                    return host;
                },
                url: '/asdf?jkl'
            };

            it('baseUri should concat protocol and Host header', function (done) {
                middleware.requestUri(req, null, function(){
                    assert.ok("function" === typeof req.baseUri);
                    var actual = req.baseUri();
                    assert.equal(actual, protocol + "://" + host);
                    done();
                });
            });

            it('absoluteUri should concat protocol and Host header with url requested', function (done) {
                middleware.requestUri(req, null, function(){
                    assert.ok("function" === typeof req.absoluteUri);
                    var actual = req.absoluteUri();
                    assert.equal(actual, protocol + "://" + host + req.url);
                    done();
                });
            });
        });
    });

    describe('response middleware', function () {
        describe('res.problem', function () {
            var req = {
                baseUri: function(){ return "https://www.example.com"; },
                absoluteUri: function(){ return req.baseUri() + req.url; },
                url: '/resource1'
            };

            var res = {
                json : function(num, obj) {
                    assert.ok("object" === typeof obj);
                    assert.ok("number" === typeof num);

                    obj.should.eql(res.expected);
                },
                "set": function(headers){
                    (headers||{}).should.eql({
                        'Content-Type' : 'application/problem+json',
                        'Content-Language': 'en'
                    });
                }
            };

            beforeEach(function(){
                res.expected = null;
            });

            it('should default to 400 bad request when non-number provided for status', function(done){
                var title = "You created a bad request";
                var details = "More details about your request here";
                res.expected = {
                    "type": "https://www.example.com/probs/bad-request",
                    "title": title,
                    "detail": details,
                    "instance": req.absoluteUri(),
                    "status": 400
                };

                middleware.responseProblem(req,res, function(){
                    assert.ok("function" === typeof res.problem);
                    res.problem("200", title, details);
                    done();
                });
            });

            it('should default to 400 for non-HTTP number codes', function(done){
                var title = "You created another bad request";
                var details = "More details about your other request here";
                res.expected = {
                    "type": "https://www.example.com/probs/bad-request",
                    "title": title,
                    "detail": details,
                    "instance": req.absoluteUri(),
                    "status": 400
                };

                middleware.responseProblem(req,res, function(){
                    assert.ok("function" === typeof res.problem);
                    res.problem(9999, title, details);
                    done();
                });
            });

            it('should work for valid HTTP number codes', function(done){
                var title = "You can't do that!";
                var details = "More details about your incorrect request here";
                var status = 406; // not acceptable
                res.expected = {
                    "type": "https://www.example.com/probs/not-acceptable",
                    "title": title,
                    "detail": details,
                    "instance": req.absoluteUri(),
                    "status": status
                };

                middleware.responseProblem(req,res, function(){
                    assert.ok("function" === typeof res.problem);
                    res.problem(status, title, details);
                    done();
                });
            });

            it('should allow for the extension of the problem result', function(done){
                var title = "You can't do that!";
                var details = "More details about your incorrect request here";
                var status = 406; // not acceptable
                res.expected = {
                    "type": "https://www.example.com/probs/not-acceptable",
                    "title": title,
                    "detail": details,
                    "instance": req.absoluteUri(),
                    "status": status,
                    "other": "fantastic"
                };

                middleware.responseProblem(req,res, function(){
                    assert.ok("function" === typeof res.problem);
                    res.problem(status, title, details, { other: "fantastic" });
                    done();
                });
            });

            it('should ignore type, instance, and status when extending the problem result', function(done){
                var title = "You can't do that!";
                var details = "More details about your incorrect request here";
                var status = 406; // not acceptable
                res.expected = {
                    "type": "https://www.example.com/probs/not-acceptable",
                    "title": title,
                    "detail": details,
                    "instance": req.absoluteUri(),
                    "status": status,
                    "other": "fantastic"
                };

                middleware.responseProblem(req,res, function(){
                    assert.ok("function" === typeof res.problem);
                    res.problem(status, title, details, {
                        other: "fantastic",
                        type: "puppies",
                        instance: "instance",
                        status: 100
                    });
                    done();
                });
            });
        });
    });
});
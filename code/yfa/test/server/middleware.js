'use strict';

var middleware = require('../../src/middleware');
var assert = require('assert');
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

    describe('requiresAuth middleware', function(){
        it('should pass along to next function when authenticated', function(done){
            var req = {
                isAuthenticated: function(){ return true; }
            };

            var res = {
                problem: function(){ assert.fail("This should not call res.problem"); }
            };

            middleware.requiresAuth(req, res, function(){
                done(); // no assert needed here.
            });
        });

        it('should respond with a problem (HTTP Status 401) when not authenticated', function(done){
            var req = {
                isAuthenticated: function(){ return false; }
            };

            var res = {
                problem: function(status){
                    // no need to assert title and details here.
                    assert.equal(status, 401, "Expected unauthorized status");
                    done();
                }
            };

            middleware.requiresAuth(req, res, function(){
                assert.fail("We shouldn't pass to next function when req is not authenticated");
            });
        });
    });

    describe('midFromQueryString middleware', function(){
        var req;

        beforeEach(function (done) {
            req = {
                query: {},
                params: {}
            };

            done();
        });

        it('should go to next route when no query is provided (default key "mid")', function(done){
            var handler = middleware.midFromQueryString();
            handler(req, null, function(route){
                assert.ok(undefined == req.params.mid);
                assert.equal(route, 'route', 'Expected next("route") to be called');

                done();
            });
        });

        it('should go to next route when invalid query is provided (default key "mid")', function(done){
            var handler = middleware.midFromQueryString();
            req.query.mid = '_________';
            handler(req, null, function(route){
                assert.ok(undefined == req.params.mid);
                assert.equal(route, 'route', 'Expected next("route") to be called');

                done();
            });
        });

        it('should set the contents of a valid req.query.mid to req.params.mid (default key "mid")', function(done){
            var handler = middleware.midFromQueryString();
            req.query.mid = '12345asdf';
            handler(req, null, function(route){
                assert.ok(undefined == route);
                assert.equal(req.params.mid, req.query.mid, 'req.query.mid to be set on req.params.mid');

                done();
            });
        });

        it('should set the contents of a valid req.query.id parameter to req.params.mid (specified key "id")', function(done){
            var handler = middleware.midFromQueryString('id');
            req.query.id = '12345asdf';
            handler(req, null, function(route){
                assert.ok(undefined == route);
                assert.equal(req.params.mid, req.query.id, 'req.query.id to be set on req.params.mid');

                done();
            });
        });

        it('should set the contents of a valid req.query.id parameter to req.params.id (specified key "id", specified prop "id")', function(done){
            var handler = middleware.midFromQueryString('id', 'id');
            req.query.id = '12345asdf';
            handler(req, null, function(route){
                assert.ok(undefined == route);
                assert.equal(req.params.id, req.query.id, 'req.query.id to be set on req.params.mid');

                done();
            });
        });
    });
});

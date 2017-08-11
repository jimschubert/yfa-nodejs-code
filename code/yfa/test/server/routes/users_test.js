/*global describe,beforeEach,afterEach,it,before,after */
'use strict';

var users = require('../../../src/routes/users'),
    middleware = require('../../../src/middleware'),
    connection = require('../../db_common'),
    User = require('../../../src/models/user'),
    assert = require('assert'),
    HttpStatus = require('http-status'),
    async = require('async');

require('should');

describe('users route', function () {
    var req, res, db, userCache;

    function testUser(username, first, last, email, state, done) {
        var user = new User({
            username: username,
            first_name: first,
            last_name: last,
            email: email,
            state: state
        });
        user.save(function(err, doc){
            return done(err, doc);
        });
    }

    before(function(){
        db = connection();
    });

    after(function(done){
        db.close(done);
    });

    beforeEach(function (done) {
        req = {
            url        : '/api/v1/users',
            baseUri    : function () {
                return "https://www.example.com";
            },
            absoluteUri: function () {
                return req.baseUri() + req.url;
            },
            query: {}
        };

        // This is a mock response object that allows us to verify content
        // in an asynchronous way (json -> verify ---> test's done function)
        var newRes = {
            onResponse: function(verify){
                newRes.verify = verify;
            },
            actual: null,
            statusCode: 0,
            json : function (num, obj) {
                newRes.statusCode = num;
                newRes.actual = obj;

                if("function" === typeof newRes.verify){
                    newRes.verify();
                }
            },
            "set": function (headers) {
                (headers || {}).should.eql({
                    'Content-Type'    : 'application/problem+json',
                    'Content-Language': 'en'
                });
            }
        };
        res = newRes;

        middleware.responseProblem(req, res, function(){});

        var tasks = [];
        for(var i = 0; i < 102; i++){
            tasks.push(async.apply(testUser,''+i,'Jim'+i, 'Schubert'+i, i+'@email.com', 'offline'));
        }
        async.parallel(tasks, function(err, results){
            userCache = results;
            done();
        });
    });

    afterEach(function(done){
        userCache = [];
        User.remove({}, done);
    });

    describe('#create', function () {
        it('should return problem response (Method Not Allowed)', function () {
            var expected = {
                "type"    : "https://www.example.com/probs/method-not-allowed",
                "title"   : "You're not allowed to create users on this system",
                "detail"  : "Users are created via 3rd party (Facebook) authentication",
                "instance": req.absoluteUri(),
                "status"  : HttpStatus.METHOD_NOT_ALLOWED
            };

            users.create(req, res);

            assert.equal(res.statusCode, HttpStatus.METHOD_NOT_ALLOWED);

            res.actual.should.eql(expected);
        });
    });

    describe('#list', function () {
        it('should default to 25 results', function (done) {
            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.OK);

                assert.ok(Array.isArray(res.actual));

                assert.equal(res.actual.length, 25);

                done();
            });

            users.list(req, res);
        });

        it('should accept a skip and take query parameter', function (done) {
            // skip 5 users, take the next 20
            // we can't verify against usernames because users are inserted in parallel.
            req.query.skip = '5';
            req.query.take = '20';
            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.OK);

                assert.ok(Array.isArray(res.actual));

                assert.equal(res.actual.length, 20);

                done();
            });

            users.list(req, res);
        });

        it('should return NO CONTENT when there are no results', function (done) {
            User.remove({}, function(){
                res.onResponse(function(){
                    assert.equal(res.statusCode, HttpStatus.NO_CONTENT);

                    done();
                });

                users.list(req, res);
            });
        });
    });
});
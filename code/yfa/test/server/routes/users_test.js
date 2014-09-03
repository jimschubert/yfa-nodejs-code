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
            firstName: first,
            lastName: last,
            email: email,
            state: state,
            registrationDone: false
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
            query: {},
            params: {},
            user: {}
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

    describe('#getById', function(){
        it('should find a user by id (set on req.params.mid)', function(done){
            // Get some test user object
            User.findOne({}, function(err, doc){
                assert.ifError(err);
                assert.ok(doc !== null);

                req.params.mid = doc._id;

                res.onResponse(function(){
                    assert.equal(res.statusCode, HttpStatus.OK);
                    assert.ok(Array.isArray(res.actual) === false);

                    // remember mongoose documents have a .equals helper for assertions
                    assert.ok(doc.equals(res.actual));
                    done();
                });

                users.getById(req, res);
            });
        });

        it('should not find a user by some invalid id', function(done){
            req.params.mid = '00aaa11b23c456d789000000';
            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.NO_CONTENT);
                assert.ok(Array.isArray(res.actual) === false);

                // remember mongoose documents have a .equals helper for assertions
                assert.equal(res.actual, null);
                done();
            });

            users.getById(req, res);
        });

        it('should return an error for database error', function(done){
            var expected = {
                "type"    : "https://www.example.com/probs/internal-server-error",
                "title"   : "Unexpected problem",
                "detail"  : "Could not retrieve user due to internal error",
                "instance": req.absoluteUri(),
                "status"  : HttpStatus.INTERNAL_SERVER_ERROR
            };

            // This is an invalid key to search in for mongodb field _id
            req.params.mid = { 'a': 'b' };

            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.INTERNAL_SERVER_ERROR);

                res.actual.should.eql(expected);
                done();
            });

            users.getById(req, res);
        });
    });

    describe('#update', function(){
        it('should display a message for database failure on retrieve', function(done){
            var expected = {
                "type"    : "https://www.example.com/probs/bad-request",
                "title"   : "Could not save user information",
                "detail"  : "There was an error processing the request to save your information",
                "instance": req.absoluteUri(),
                "status"  : HttpStatus.BAD_REQUEST
            };

            req.user.facebookId = NaN;
            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.BAD_REQUEST);

                res.actual.should.eql(expected);

                done();
            });

            users.update(req, res);
        });

        function buildInvalidUsernameTest(findOptions, username) {

            return function(done){
                var expectedResponse = {
                    "type"    : "https://www.example.com/probs/bad-request",
                    "title"   : "Invalid Username",
                    "detail"  : "User names must be 5-16 characters",
                    "instance": req.absoluteUri(),
                    "status"  : HttpStatus.BAD_REQUEST
                };

                User.findOne(findOptions, function(err, doc){
                    assert.ifError(err);
                    assert.ok(doc !== null);

                    var originalUsername = doc.username;

                    req.params.mid = doc._id;
                    req.body = {
                        username: username
                    };

                    res.onResponse(function(){
                        assert.equal(res.statusCode, HttpStatus.BAD_REQUEST);
                        assert.ok(Array.isArray(res.actual) === false);

                        res.actual.should.eql(expectedResponse);

                        done();
                    });

                    users.update(req, res);
                });
            };
        }

        it('should fail to update invalid usernames: starts with non-letter',
            buildInvalidUsernameTest({firstName: 'Jim52'}, '7nonletter')
        );

        it('should fail to update invalid usernames: invalid characters',
            buildInvalidUsernameTest({firstName: 'Jim53'}, 'invalid char$')
        );

        it('should fail to update invalid usernames: too short',
            buildInvalidUsernameTest({firstName: 'Jim54'}, '123')
        );

        it('should fail to update invalid usernames: too long',
            buildInvalidUsernameTest({firstName: 'Jim24'}, 'abcdefghijklmnopqrstuvwxyz')
        );

        /**
         * Builds out a test to check for a valid username.
         *
         * @param findOptions Query initial document with these parameters before modification
         * @param postData The post body's json object
         * @param verificationFn function(doc)
         *
         * @returns {Function}
         */
        function buildValidUsernameTest(findOptions, postData, verificationFn) {
            return function(done){
                User.findOne(findOptions, function(err, doc){
                    assert.ifError(err);
                    assert.ok(doc !== null);

                    assert.ok(doc.registrationDone === false, 'This data should be stubbed anew in beforeEach');

                    req.params.mid = doc._id;
                    req.body = postData;

                    res.onResponse(function(){

                        verificationFn.call(null, doc);

                        done();
                    });

                    users.update(req, res);
                });
            };
        }

        it('should only update a username whose registration is not completed',
            buildValidUsernameTest({firstName: 'Jim12'}, {
                username: 'FrankSinatra'
            }, function(originalDoc){
                assert.equal(res.statusCode, HttpStatus.OK);
                assert.ok(Array.isArray(res.actual) === false);
                assert.ok(originalDoc.registrationDone === false);

                // remember mongoose documents have a .equals helper for assertions
                assert.ok(!originalDoc.equals(res.actual));

                var actual = res.actual;

                assert.notEqual(actual.username, originalDoc.username);
                assert.equal(actual.username, 'FrankSinatra');

                assert.ok(actual.registrationDone);
            })
        );
    });

    describe('#delete', function() {
        it('should error for invalid user facebook id (not :mid, can only delete own user record)', function(done){
            var expectedResponse = {
                "type"    : "https://www.example.com/probs/bad-request",
                "title"   : "Could not delete user",
                "detail"  : "There was an error processing the request to save your information",
                "instance": req.absoluteUri(),
                "status"  : HttpStatus.BAD_REQUEST
            };

            req.user.facebookId = {};

            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.BAD_REQUEST);
                assert.ok(Array.isArray(res.actual) === false);

                res.actual.should.eql(expectedResponse);

                done();
            });

            users.delete(req, res);
        });

        it('should error if :mid instead of facebookId was supplied', function(done){
            var expectedResponse = {
                "type"    : "https://www.example.com/probs/bad-request",
                "title"   : "Could not delete user",
                "detail"  : "There was an error processing the request to save your information",
                "instance": req.absoluteUri(),
                "status"  : HttpStatus.BAD_REQUEST
            };

            User.findOne({}, function(err, doc) {
                assert.ifError(err);
                assert.ok(doc !== null);

                req.user.facebookId = doc._id;

                res.onResponse(function () {
                    assert.equal(res.statusCode, HttpStatus.BAD_REQUEST);
                    assert.ok(Array.isArray(res.actual) === false);

                    res.actual.should.eql(expectedResponse);

                    done();
                });

                users.delete(req, res);
            });
        });

        it('should delete a user by facebookId', function(done){
            User.findOne({}, function(err, doc) {
                assert.ifError(err);
                assert.ok(doc !== null);

                req.user.facebookId = doc.facebookId;

                res.onResponse(function () {
                    assert.equal(res.statusCode, HttpStatus.OK);
                    assert.ok(Array.isArray(res.actual) === false);

                    assert.ok(doc.equals(res.actual));

                    done();
                });

                users.delete(req, res);
            });
        });
    });

    describe('#getMessages', function(){
        it('should return problem response on error', function(done){

            req.params.mid = 'asdf';

            res.onResponse(function () {
                assert.equal(res.statusCode, HttpStatus.NO_CONTENT);
                assert.ok(Array.isArray(res.actual) === false);

                done();
            });

            users.getMessages(req, res);
        });

        // Skipped: Messages need to be saved through the Messages model
        it.skip('should return an array of messages when more than one message is stored.', function(done){
            var messages = [{first:"asdf"}, {second: "fdas"}];

            User.findOne({}, function(err, doc){
                assert.ifError(err);
                assert.ok(doc !== null);

                req.params.mid = doc._id;

                doc.messages = messages;
                doc.save(function(err,doc){
                    assert.ifError(err);
                    assert.ok(doc !== null);

                    res.onResponse(function(){
                        assert.equal(res.statusCode, HttpStatus.OK);
                        assert.ok(Array.isArray(res.actual) === false);
                        assert.ok(Array.isArray(res.actual.messages));

                        // Note: .slice() here because messages is still a mongoose array-like object
                        assert.deepEqual(res.actual.messages.slice(), messages);

                        done();
                    });

                    users.getMessages(req, res);
                });
            });
        });
    });
});

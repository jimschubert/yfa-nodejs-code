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
        user.save(function (err, doc) {
            return done(err, doc);
        });
    }

    before(function () {
        db = connection();
    });

    after(function (done) {
        db.close(done);
    });

    beforeEach(function (done) {
        req = {
            url: '/api/v1/users',
            baseUri: function () {
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
            onResponse: function (verify) {
                newRes.verify = verify;
            },
            actual: null,
            statusCode: 0,
            json: function (num, obj) {
                newRes.statusCode = num;
                newRes.actual = obj;

                if ("function" === typeof newRes.verify) {
                    newRes.verify();
                }
            },
            "set": function (headers) {
                (headers || {}).should.eql({
                    'Content-Type': 'application/problem+json',
                    'Content-Language': 'en'
                });
            }
        };
        res = newRes;

        middleware.responseProblem(req, res, function () { });

        var tasks = [];
        for (var i = 0; i < 102; i++) {
            tasks.push(async.apply(testUser, '' + i, 'Jim' + i, 'Schubert' + i, i + '@email.com', 'offline'));
        }
        async.parallel(tasks, function (err, results) {
            userCache = results;
            done();
        });
    });

    afterEach(function (done) {
        userCache = [];
        User.remove({}, done);
    });

    describe('#create', function () {
        it('should return problem response (Method Not Allowed)', function () {
            var expected = {
                "type": "https://www.example.com/probs/method-not-allowed",
                "title": "You're not allowed to create users on this system",
                "detail": "Users are created via 3rd party (Facebook) authentication",
                "instance": req.absoluteUri(),
                "status": HttpStatus.METHOD_NOT_ALLOWED
            };

            users.create(req, res);

            assert.equal(res.statusCode, HttpStatus.METHOD_NOT_ALLOWED);

            res.actual.should.eql(expected);
        });
    });

    describe('#list', function () {
        it('should default to 25 results', function (done) {
            res.onResponse(function () {
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
            res.onResponse(function () {
                assert.equal(res.statusCode, HttpStatus.OK);

                assert.ok(Array.isArray(res.actual));

                assert.equal(res.actual.length, 20);

                done();
            });

            users.list(req, res);
        });

        it('should return empty array when there are no results', function (done) {
            User.remove({}, function () {
                res.onResponse(function () {
                    assert.equal(res.statusCode, HttpStatus.OK);
                    assert.ok(Array.isArray(res.actual));
                    assert.equal(res.actual.length, 0);
                    done();
                });

                users.list(req, res);
            });
        });
    });

    describe('#delete', function () {
        it('should error for invalid user facebook id (not :mid, can only delete own user record)', function (done) {
            var expectedResponse = {
                "type": "https://www.example.com/probs/bad-request",
                "title": "Could not delete user",
                "detail": "There was an error processing the request to save your information",
                "instance": req.absoluteUri(),
                "status": HttpStatus.BAD_REQUEST
            };

            req.user.facebookId = {};

            res.onResponse(function () {
                assert.equal(res.statusCode, HttpStatus.BAD_REQUEST);
                assert.ok(Array.isArray(res.actual) === false);

                res.actual.should.eql(expectedResponse);

                done();
            });

            users.delete(req, res);
        });

        it('should error if :mid instead of facebookId was supplied', function (done) {
            var expectedResponse = {
                "type": "https://www.example.com/probs/bad-request",
                "title": "Could not delete user",
                "detail": "There was an error processing the request to save your information",
                "instance": req.absoluteUri(),
                "status": HttpStatus.BAD_REQUEST
            };

            User.findOne({}, function (err, doc) {
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

        it('should delete a user by facebookId', function (done) {
            User.findOne({}, function (err, doc) {
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

    describe('#getCohortsById', function () {
        it('should return empty array for user without friends', function (done) {
            req.params.mid = userCache[0]._id;

            res.onResponse(function () {
                assert.equal(res.statusCode, HttpStatus.OK);
                assert.ok(Array.isArray(res.actual) === false);
                assert.ok(Array.isArray(res.actual.cohorts));
                assert.ok(res.actual.cohorts.length == 0);
                done();
            });
            users.getCohortsById(req, res);
        });

        it('should return cohorts when user has cohorts', function (done) {
            req.params.mid = userCache[0]._id;

            res.onResponse(function () {
                assert.equal(res.statusCode, HttpStatus.OK);
                assert.ok(Array.isArray(res.actual) === false);
                assert.ok(Array.isArray(res.actual.cohorts));
                assert.ok(res.actual.cohorts.length == 2);

                assert.ok(res.actual.cohorts.indexOf(userCache[1]._id) > -1);
                assert.ok(res.actual.cohorts.indexOf(userCache[2]._id) > -1);
                done();
            });

            userCache[0].cohorts.push(userCache[1]._id);
            userCache[0].cohorts.push(userCache[2]._id);

            userCache[0].save(function (err, user) {
                assert.ifError(err);

                // make sure they were saved and a fail isn't because of our route
                assert.equal(user.cohorts.length, 2);

                users.getCohortsById(req, res);
            });
        });
    });

    describe('#addCohortForUser', function () {
        it('should add a cohort to a user', function (done) {
            req.params.mid = userCache[0]._id;
            req.params.id = userCache[1]._id;

            res.onResponse(function () {
                assert.equal(res.statusCode, HttpStatus.OK);
                assert.ok(Array.isArray(res.actual) === false);
                assert.ok(Array.isArray(res.actual.cohorts));
                assert.ok(res.actual.cohorts.length == 1);

                assert.ok(res.actual.cohorts.indexOf(userCache[1]._id) > -1);
                done();
            });
            users.addCohortForUser(req, res);
        });
    });

    describe('#removeCohortFromUser', function () {
        it('should remove a cohort from a user', function (done) {
            userCache[0].cohorts.push(userCache[25]._id);

            userCache[0].save(function (err, user) {
                assert.ifError(err);
                assert.ok(Array.isArray(user.cohorts));
                assert.ok(user.cohorts.length, 1);

                assert.ok(user.cohorts[0] == userCache[25]._id.toString());

                res.onResponse(function () {
                    assert.equal(res.statusCode, HttpStatus.OK);
                    assert.ok(Array.isArray(res.actual) === false);
                    assert.ok(Array.isArray(res.actual.cohorts));

                    assert.equal(res.actual.cohorts.indexOf(userCache[25]._id), -1);
                    assert.equal(res.actual.cohorts.length, 0);
                    done();
                });

                req.params.mid = userCache[0]._id;
                req.params.id = userCache[25]._id;
                users.removeCohortFromUser(req, res);
            });
        });
    });
});
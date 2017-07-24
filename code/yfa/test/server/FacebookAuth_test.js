'use strict';
var FacebookAuth = require('../../src/FacebookAuth.js');
var assert = require('assert');
var connection = require('../db_common');
var User = require('../../src/models/user');

describe('FacebookAuth', function () {
    var db;
    before(function () {
        db = connection();
    });
    after(function (done) {
        db.close(done);
    });

    it('should serialize a user by facebookId', function (done) {
        var user = { facebookId: -987654321 };
        FacebookAuth.authSerialize(user, function (err, userId) {
            assert.equal(err, null);
            assert.equal(userId, user.facebookId, 'userId should match facebookId');
            done();
        });
    });

    it('should fail to deserialize a non-existent user', function (done) {
        var id = -987654321;
        FacebookAuth.authDeserialize(id, function (err, user) {
            // NOTE: there is no user, this is not an error
            assert.equal(user, null);
            assert.equal(err, null);
            done();
        });
    });

    it('should retrieve verified users (existing)', function (done) {
        // facebookId is a string, +new Date() gives
        // relatively safe uniqueness here (clock ticks)
        var profile = { id: +new Date() + "" };

        var user = new User({
            username: "jimschubert",
            first_name: "Jim",
            last_name: "Schubert",
            email: "james.schubert@gmail.com",
            state: "offline",
            facebookId: profile.id
        });
        user.save(function (err, createdUser, ok) {
            assert.ifError(err);
            assert.ok(ok);

            FacebookAuth.authVerification(null, null, profile, function (err, existing) {
                assert.ifError(err);
                assert.ok(existing.equals(createdUser),
                    'Created user must match "authenticated" user');
                done();
            });
        });
    });

    describe('#login', function () {
        var req, res;
        beforeEach(function () {
            req = { user: {} };
            res = {
                redirect: function (location) {
                    res.redirectedTo = location;
                }
            };
        });

        it('should redirect existing login to root', function () {
            // arrange
            req.user.registrationDone = true;

            // act
            FacebookAuth.login(req, res);

            // assert
            assert.equal(res.redirectedTo, "/");
        });

        it('should redirect new login to user profile to complete registration', function () {
            // arrange
            req.user.registrationDone = false;

            // act
            FacebookAuth.login(req, res);

            // assert
            assert.equal(res.redirectedTo, "/user/profile");
        });
    });

    describe('#logout', function () {
        it("should redirect to /login after logging out", function () {
            // arrange
            var req = {
                logout: function () {
                    req.logoutCalled = true;
                }
            };

            var res = {
                redirect: function (location) {
                    res.redirectedTo = location;
                }
            };

            // act
            FacebookAuth.logout(req, res);

            // assert
            assert.ok(req.logoutCalled);
            assert.equal(res.redirectedTo, "/login");
        });
    });

    describe("#verifyAuth", function () {
        var req, res;

        beforeEach(function () {
            req = {
                authenticated: true,
                isAuthenticated: function () { return req.authenticated; },
                user: {
                    registrationDone: true
                },
                path: "/user/profile"
            };

            res = {
                redirect: function (location) {
                    res.redirectedTo = location;
                }
            };
        });

        it('should redirect to /user/profile when authenticated user is not done with registration', function () {
            // arrange
            req.authenticated = true;
            req.user.registrationDone = false;
            req.path = "/somepath";

            // act
            FacebookAuth.verifyAuth(req, res, function () {
                assert.fail("This middleware should not continue with the given conditions.");
            });

            // assert
            assert.equal(res.redirectedTo, "/user/profile");
        });

        it('should redirect to /user/login for unauthenticated users', function () {
            // arrange
            req.authenticated = false;

            // act
            FacebookAuth.verifyAuth(req, res, function () {
                assert.fail("This middleware should not continue with the given conditions.");
            });

            // assert
            assert.equal(res.redirectedTo, "/login");
        });

        it('should pass to next function registered, authenticated users', function () {
            // arrange
            req.authenticated = true;
            req.registrationDone = true;
            req.path = "/some/resource";

            // act
            FacebookAuth.verifyAuth(req, res, function () {
                assert.ok("We expect to continue on with middleware or route processing");
            });

            // assert
            assert.ok(res.redirectedTo === undefined);
        });
    });
});
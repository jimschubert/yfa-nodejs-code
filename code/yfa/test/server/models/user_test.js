"use strict";
var assert = require('assert'),
    connection = require('../../db_common'),
    User = require('../../../src/models/user'),
    async = require('async');
require('should');

describe("User", function(){
    var db;
    before(function(){
        db = connection();
    });

    after(function(done){
        db.close(done);
    });

    describe("schema", function(){
        after(function(done){
            // be sure to clean up everything here so other tests can work on test data
            User.remove({}, done);
        });

        it("should construct a user object", function(done){
            var user = new User({
                username: "jimschubert",
                firstName: "Jim",
                lastName: "Schubert",
                email: "james.schubert@gmail.com",
                state: "offline"
            });
            user.save(function(err, doc, ok){
                assert.ifError(err);
                assert.ok(ok);
                User.findByIdAndRemove(user._id).exec();
                done();
            });
        });
    });

    describe("states", function(){
        it("should contain null and undefined", function(){
            assert.ok(User.States.hasOwnProperty("UNDEFINED"));
            assert.ok(User.States.hasOwnProperty("NULL"));
        });

        it("should contain 'online', 'offline', and 'away' states", function(){
            assert.equal(User.States.ONLINE, 'online');
            assert.equal(User.States.AWAY, 'away');
            assert.equal(User.States.OFFLINE, 'offline');
        });
    });

    describe("static functions", function(){
        var users = [];

        function createTestUser(name, done) {
            var user = new User({
                username: name,
                firstName: name,
                lastName: name,
                email: name + "@example.com",
                state: "offline"
            });
            user.save(function(err, doc){
                return done(err, doc);
            });
        }

        beforeEach(function(done){
            async.parallel([
                async.apply(createTestUser,'jim'),
                async.apply(createTestUser,'crystal'),
                async.apply(createTestUser,'jack'),
                async.apply(createTestUser,'bear'),
                async.apply(createTestUser,'bunny'),
                async.apply(createTestUser,'socks'),
                async.apply(createTestUser,'neville'),
                async.apply(createTestUser,'frank'),
                async.apply(createTestUser,'ronald'),
                async.apply(createTestUser,'ariel'),
                async.apply(createTestUser,'caolan'),
                async.apply(createTestUser,'zane')
            ], function(err, results){
                users = results;
                done();
            });
        });

        afterEach(function(done){
            async.each(users, function(user, next){
                User.findByIdAndRemove(user.id).exec();
                next();
            }, function(err){
                // WARN: swallow exceptions
                users = [];
                done();
            });
        });

        describe('publicList', function(){
            it('should return expected number of results for string parameters', function(done){
                User.publicList('0','5', function(err, results){
                    assert.ifError(err);
                    assert.ok(Array.isArray(results));
                    assert.equal(5, results.length);

                    done();
                });
            });

            it('should return skipped number of results', function(done){
                User.publicList(0,2, function(err, firstSet){
                    // firstSet should be jim, crystal
                    assert.ifError(err);
                    assert.ok(Array.isArray(firstSet));
                    assert.equal(2, firstSet.length);

                    User.publicList(2,2, function(err, secondSet){
                        // second set should be jack, bear
                        assert.ifError(err);
                        assert.ok(Array.isArray(secondSet));
                        assert.equal(2, secondSet.length);

                        firstSet.should.not.eql(secondSet);

                        firstSet[0].username.should.not.equal(secondSet[0].username);
                        firstSet[0].username.should.not.equal(secondSet[1].username);
                        firstSet[1].username.should.not.equal(secondSet[0].username);
                        firstSet[1].username.should.not.equal(secondSet[1].username);

                        done();
                    });
                });
            });

            it('should default to 0-25 for NaN inputs', function(done){
                User.publicList('cats', 'dogs', function(err, results){
                    assert.ifError(err);
                    assert.ok(Array.isArray(results));
                    assert.equal(users.length, results.length);

                    done();
                });
            });
        });

        describe('getCohortsById', function(){
            it('should return empty array of cohorts when user has no cohorts', function(done){
                var target = users[1];
                User.getCohortsById(target._id, function(err, results){
                    assert.ifError(err);

                    // note: results.cohorts is a mongoose array, not a standard array
                    assert.ok(results != null, 'results should not be null');
                    assert.ok(results.cohorts != null, 'results.cohorts should not be null');
                    assert.equal(results.cohorts.length, 0, 'Expected cohorts to be an empty array when user has no cohorts');
                    done();
                });
            });

            it('should return a populated array of cohorts when user has cohorts', function(done){
                var user = users[3];
                user.cohorts.push(users[4]._id);

                user.save(function(err, result){
                   assert.ifError(err);

                    User.getCohortsById(user._id, function(err, results){
                        // note: results.cohorts is a mongoose array, not a standard array
                        assert.ok(results != null, 'results should not be null');
                        assert.ok(results.cohorts != null, 'results.cohorts should not be null');
                        assert.equal(results.cohorts.length, 1, 'Expected cohorts to contain one item');
                        assert.ok(results.cohorts[0].equals(users[4]._id), 'Expected saved cohorts id to match');
                        done();
                    });
                });
            });
        });
    });
});

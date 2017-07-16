"use strict";
var assert = require('assert'),
    connection = require('../../db_common'),
    User = require('../../../src/models/user');

describe("User", function () {
    var db;
    before(function () {
        db = connection();
    });

    after(function (done) {
        db.close(done);
    });

    describe("schema", function () {
        after(function(done){
            // be sure to clean up everything here so other tests can work on test data
            User.remove({}, done);
        });

        it("should construct a user object", function (done) {
            var user = new User({
                username: "jimschubert",
                first_name: "Jim",
                last_name: "Schubert",
                email: "james.schubert@gmail.com",
                state: "offline"
            });
            user.save(function (err, doc, ok) {
                assert.ifError(err);
                assert.ok(ok);
                done();
            });
        });
    });

    describe("states", function () {
        it("should contain null and undefined", function () {
            assert.ok(User.States.hasOwnProperty("UNDEFINED"));
            assert.ok(User.States.hasOwnProperty("NULL"));
        });
        it("should contain 'online', 'offline', and 'away' states", function () {
            assert.equal(User.States.ONLINE, 'online');
            assert.equal(User.States.AWAY, 'away');
            assert.equal(User.States.OFFLINE, 'offline');
        });
    });
});
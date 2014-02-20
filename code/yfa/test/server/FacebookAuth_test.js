'use strict';

var FacebookAuth = require('../../src/FacebookAuth.js');
var assert = require('assert');
var connection = require('../db_common');
var User = require('../../src/models/user');

describe('FacebookAuth', function(){
    var db;
    before(function(){
        db = connection();
    });

    after(function(done){
        db.close(done);
    });

    it('should serialize a user by facebookId', function(done){
        var user = { facebookId: -987654321 };
        FacebookAuth.authSerialize(user, function(err, userId){
            assert.equal(err, null);
            assert.equal(userId, user.facebookId, 'userId should match facebookId');
            done();
        });
    });

    it('should fail to deserialize a non-existent user', function(done){
        var id = -987654321;
        FacebookAuth.authDeserialize(id, function(err, user){
            // NOTE: there is no user, this is not an error
            assert.equal(user, null);
            assert.equal(err, null);
            done();
        });
    });

    it('should retrieve verified users (existing)', function(done){
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
        user.save(function(err, createdUser, ok){
            assert.ifError(err);
            assert.ok(ok);

            FacebookAuth.authVerification(null, null, profile, function(err, existing){
                assert.ifError(err);

                // NOTE: can't use assert.equal on query documents. Use 'equals' helper.
                // documentation: http://mongoosejs.com/docs/api.html#document_Document-equals
                assert.ok(existing.equals(createdUser), 'Created user must match "authenticated" user');
                done();
            });
        });
    });
});

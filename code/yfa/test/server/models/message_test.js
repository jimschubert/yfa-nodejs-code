"use strict";
var assert = require('assert'),
    connection = require('../../db_common'),
    Message = require('../../../src/models/message'),
    User = require('../../../src/models/user'),
    async = require('async');
require('should');

describe("Message", function() {
    var db, users = [];

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

    before(function () {
        db = connection();
    });

    after(function (done) {
        Message.remove({}, function(){
            db.close(done);
        });
    });

    beforeEach(function(done){
        async.parallel([
            async.apply(createTestUser,'jim'),
            async.apply(createTestUser,'crystal')
        ], function(err, results){
            users = results;
            done(err);
        });
    });

    describe('saveMessage', function(){
        it('should save an object without an attachment.', function(done){
            Message.saveMessage({
                to: users[0]._id,
                from: users[1]._id,
                body: 'hello'
            }, function(err, result){
                assert.ifError(err);
                result.should.not.be.null;
                result.should.be.an.object;
                result._id.should.not.be.null;
                result._id.should.not.be.undefined;
                done();
            });
        });

        it('should save an object with an attachment.', function(done){
            var att = { dataURI: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' };
            Message.saveMessage({
                to: users[0]._id,
                from: users[1]._id,
                body: 'hello',
                attachment: att
            }, function(err, result){
                assert.ifError(err);
                result.should.not.be.null;
                result.should.be.an.object;
                result._id.should.not.be.null;
                result._id.should.not.be.undefined;
                result.body.should.equal('hello');
                result.attachment.should.be.an.object;
                (result.attachment.dataURI === undefined).should.be.true;

                done();
            });
        });
    });

    describe('getAttachments', function(){
        it('should retrieve a populated attachment with a valid id', function(done){
            var att = { dataURI: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' };
            Message.saveMessage({
                to: users[0]._id,
                from: users[1]._id,
                body: 'hello',
                attachment: att
            }, function(err, result){
                assert.ifError(err);

                result.should.not.be.null;
                result.should.be.an.object;

                Message.getAttachments(result._id, function(err, result){
                    assert.ifError(err);
                    result.should.be.an.object;
                    result.attachment.should.be.an.object;
                    result.attachment.dataURI.should.equal(att.dataURI);

                    done();
                });
            });
        });

        it('should return null for invalid id', function(done){
            Message.getAttachments('53dd79c1a8328f433a1f5cab', function(err, result){
                assert.ifError(err);
                (result == null).should.be.true;

                done();
            });
        });
    });

    describe('delete', function(){
        var message;
        beforeEach(function(done){
            var att = { dataURI: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' };
            Message.saveMessage({
                to: users[0]._id,
                from: users[1]._id,
                body: 'hello',
                attachment: att
            }, function(err, result){
                assert.ifError(err);
                message = result;

                result.should.not.be.null;
                result.should.be.an.object;

                done();
            });
        });

       it('should delete a message from a user object and from message collection', function(done){
           Message.delete(message._id, function(err, result){
               assert.ifError(err);
               result.messages.should.be.an.array;
               result.messages.length.should.equal(0);

               done();
           });
       });

        it('should return null for invalid message id', function(done){
            var badId = message._id.toString().replace(/[aeiu852]/g, 'o');
            Message.delete(badId, function(err, result){
                assert.ifError(err);
                (result == null).should.be.true;
                done();
            });
        });
    });
});
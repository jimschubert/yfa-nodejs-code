/*global describe,beforeEach,afterEach,it,before,after */
'use strict';

var images = require('../../../src/routes/images'),
    middleware = require('../../../src/middleware'),
    connection = require('../../db_common'),
    User = require('../../../src/models/user'),
    Image = require('../../../src/models/image'),
    assert = require('assert'),
    HttpStatus = require('http-status'),
    async = require('async');

require('should');

describe('images route', function () {
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
            url: '/api/v1/images',
            baseUri: function () {
                return "https://www.example.com";
            },
            absoluteUri: function () {
                return req.baseUri() + req.url;
            },
            query: {},
            params: {}
        };

        // This is a mock response object that allows us to verify content
        // in an asynchronous way (json -> verify ---> test's done function)
        var newRes = {
            onResponse: function (verify) {
                newRes.verify = verify;
            },
            actual: null,
            headers: [],
            statusCode: 0,
            json: function (num, obj) {
                newRes.statusCode = num;
                newRes.actual = obj;

                if ("function" === typeof newRes.verify) {
                    newRes.verify();
                }
            },
            end: function(buffer){
                newRes.buffer = buffer;

                if ("function" === typeof newRes.verify) {
                    newRes.verify();
                }
            },
            setHeader: function(key,val){
                newRes.headers.push(key + ': ' + val);
            }
        };
        res = newRes;

        middleware.responseProblem(req, res, function () {
        });

        var tasks = [];
        for (var i = 0; i < 2; i++) {
            tasks.push(async.apply(testUser, '' + i, 'Jim' + i, 'Schubert' + i, i + '@email.com', 'offline'));
        }
        async.parallel(tasks, function (err, results) {
            userCache = results;
            done();
        });
    });

    afterEach(function (done) {
        userCache = [];
        User.remove({}, function(){
            Image.remove({}, done);
        });
    });

    describe('#list', function(){
        it('should return a listing of user avatars', function(done){
            var img = new Image({ dataURI: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' });
            img.save(function(err, img){
               assert.ifError(err);
                userCache[0].avatar = img._id;
                userCache[1].avatar = img._id;

                async.parallel([
                    function(done){
                        userCache[0].save(done);
                    },
                    function(done){
                        userCache[1].save(done);
                    }
                ], function(err, results){
                    assert.ifError(err);

                    res.onResponse(function(){
                        assert.equal(res.statusCode, HttpStatus.OK);
                        assert.ok("object" === typeof res.actual);
                        assert.ok(Array.isArray(res.actual.images));
                        assert.equal(res.actual.images.length, 2);
                        assert.ok(res.actual.images[0].image.equals(img._id));
                        assert.ok(res.actual.images[0].ref.user_id.equals(userCache[0]._id));
                        assert.ok(res.actual.images[1].image.equals(img._id));
                        assert.ok(res.actual.images[1].ref.user_id.equals(userCache[1]._id));
                        done();
                    });

                    images.list(req, res);
                });
            });
        });

    });
});
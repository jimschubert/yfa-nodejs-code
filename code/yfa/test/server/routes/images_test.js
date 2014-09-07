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

    describe('#getById', function(){
        it('should return no results when invalid id is passed', function(done){
            req.params.mid = '53f401b2e9376594671c2b19';

            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.NO_CONTENT);
                assert.equal(res.actual, null);
                done();
            });

            images.getById(req, res);
        });

        it('should return result when valid id is passed', function(done){
            var img = new Image({ dataURI: 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=' });
            img.save(function(err, img){
                assert.ifError(err);
                req.params.mid = img._id;

                res.onResponse(function(){
                    assert.equal(res.statusCode, HttpStatus.OK);
                    assert.ok(res.actual.equals(img));
                    done();
                });

                images.getById(req, res);
            });
        });

        it('should return a buffer of image when valid id is passed', function(done){
            var base64 = 'R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
            var img = new Image({ dataURI: 'data:image/png;base64,'+base64 });
            img.save(function(err, img){
                assert.ifError(err);
                req.params.mid = img._id;
                req.query.d = 1;

                res.onResponse(function(){
                    // statusCode is set by express.js in this case (which we've mocked out)
                    assert.equal(res.statusCode, 0);
                    assert.ok(res.buffer instanceof Buffer);
                    assert.equal(res.buffer.length, 35);
                    assert.equal(res.buffer.toString('base64'), base64);
                    assert.equal(res.headers.length, 3);
                    assert.ok(res.headers.indexOf('Content-Length: 35') > -1);
                    assert.ok(res.headers.indexOf('Content-Type: image/png') > -1);
                    assert.ok(res.headers.indexOf('Content-Disposition: attachment; filename='+img._id.toString()+'.png') > -1);
                    done();
                });

                images.getById(req, res);
            });
        });
    });

    describe('#list', function(){
        it('should return no content when no users have avatars', function(done){
            res.onResponse(function(){
                assert.equal(res.statusCode, HttpStatus.NO_CONTENT);
                assert.equal(res.actual, null);
                done();
            });

            images.getById(req, res);
        });

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
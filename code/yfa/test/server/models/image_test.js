"use strict";
var assert = require('assert'),
    connection = require('../../db_common'),
    Img = require('../../../src/models/image');
require('should');


describe("Image", function() {
    var db;
    before(function () {
        db = connection();
    });

    after(function (done) {
        Img.remove({}, function(){
            db.close(done);
        });
    });

    describe("static functions", function() {

        describe('getById', function(){
           it('should return a valid instance when one exists', function(done){
               var dataURI = 'data:image/png;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
               var img = new Img({ dataURI: dataURI });
               img.save(function(err, saved){
                   assert.ifError(err);
                   Img.getById(saved._id, function(err, result){
                       assert.ifError(err);

                       assert.ok(result != null, 'result is expected');
                       assert.ok(result.dataURI != null, 'result.dataURI is expected');
                       assert.equal(result.dataURI, saved.dataURI, 'expected saved dataURI to match retrieved.');

                       done();
                   });
               });
           });

           it('should return null when id does not exist', function(done){
               // This id has to be able to be cast to ObjectId. Not just any value will work.
               Img.getById('53dd79c1a8328f433a1f5cab', function(err, result){
                   assert.ok(err == null, 'err is not expected');
                   assert.ok(result == null, 'result is not expected');

                   done();
               });
           });
        });
    });
});

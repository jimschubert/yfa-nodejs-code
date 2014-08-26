'use strict';

var HttpStatus = require('http-status');
var Img = require('../models/image');
var User = require('../models/user');
var fs = require('fs');
var async = require('async');

exports.save = function(req, res){
    if(!req.files.image){
        return res.problem(HttpStatus.BAD_REQUEST,
            "No file provided",
            "Could not save file named 'image'.");
    }

    var header =  "data:" + req.files.image.type + ";base64,";
    var p = req.files.image.path;

    async.waterfall([
        async.apply(fs.readFile, p),

        function(data, done){
            var enc = new Buffer(data,'binary').toString('base64');
            var dataURI = header + enc;
            var img = new Img({ dataURI: dataURI});

            img.save(done);
        },

        function(results, rows, done){
            fs.unlink(p, function(){
               return done(null, results);
            });
        }
    ], function(err, results){
        if(err){
            return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected problem",
                "Could not save image due to internal error");
        }

        return res.json(HttpStatus.OK, results);
    });
};

exports.list = function(req, res){
    User.avatarListing(function(err, results){
        if(err){
            return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected problem",
                "Could not list images due to internal error");
        }

        return res.json(HttpStatus.OK, { images: results });
    });
};
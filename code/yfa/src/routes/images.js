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

exports.getById = function(req, res){
    Img.getById(req.params.mid, function(err, result){
        if(err){
            return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected problem",
                "Could not get image due to internal error");
        }

        if(parseInt(req.query['d'], 10) === 1 && result && result.dataURI) {
            var header = [],
                lastChar = '',
                len = result.dataURI.length;

            for(var i = 0; i < len && lastChar != ','; i++){
                lastChar = result.dataURI[i];
                header.push(lastChar);
            }

            var dataURIHeader = header.join('');
            var mimeType = dataURIHeader.match(/data:([^;]*?);base64,/)[1];

            var buffer = new Buffer(result.dataURI.slice(header.length), 'base64');

            res.setHeader('Content-Type', mimeType);
            res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.mid + '.' + mimeType.split('/')[1]);
            res.setHeader('Content-Length', buffer.length);

            return res.end(buffer);
        } else {
            return res.json(HttpStatus.OK, result);
        }
    });
};
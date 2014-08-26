'use strict';

var HttpStatus = require('http-status');
var Message = require('../models/message');

exports.send = function(req,res){
    var to = req.query["user_id"];
    var from = req.user._id;
    if(from === to){
        return res.problem(
            HttpStatus.BAD_REQUEST,
            "Can't send yourself a message",
            "Can't send yourself a message"
        );
    }

    var message = req.body;
    message.to = to;
    message.from = from;

    Message.saveMessage(message, function(err){
        if(err){
           return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
               "Unexpected problem",
               "Could not send message due to internal error");
        }

        return res.json(HttpStatus.OK, message);
    });
};

exports.getAttachments = function(req, res){
    var id = req.params.mid;
    Message.getAttachments(id, function(err, results){
        if(err){
            return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected problem",
                "Could not get message's attachment(s) due to internal error");
        }

        return res.json(HttpStatus.OK, results);
    });
};

exports.delete = function(req, res){
    var id = req.params.mid;
    Message.delete(id, function(err){
        if(err){
            return res.problem(HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected problem",
                "Could not delete message due to internal error");
        }

        return res.json(HttpStatus.OK, {});
    });
};
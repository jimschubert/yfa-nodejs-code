"use strict";
var mongoose = require('mongoose');
var User = require('./user');

var messageSchema = new mongoose.Schema({
    to: { type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    from: { type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    body: String,
    attachment: { type:mongoose.Schema.Types.ObjectId, ref: 'Image'}
});

messageSchema.static('saveMessage', function(obj, cb){
    var message = new Message(obj);
    return message.save(function(err, message){
        if(err){
           return cb(err, null);
        }

        User.findOneAndUpdate({ _id:message.to }, {
            $addToSet: { messages: message.toObject() }
        }, cb);
    });
});

var Message = mongoose.model('Message', messageSchema);

module.exports = exports = Message;
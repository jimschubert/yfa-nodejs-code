"use strict";
var mongoose = require('mongoose');
var User = require('./user');
var Img = require('./image');

var messageSchema = new mongoose.Schema({
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: String,
    attachment: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }
});

function saveMessage(message, cb) {
    return message.save(function (err, message /*, affected*/) {
        if (err) {
            return cb(err, null);
        }

        User.findOneAndUpdate({ _id: message.to }, {
            $addToSet: { messages: message.toObject() }
        }, cb);
    });
}

messageSchema.static('saveMessage', function (obj, cb) {
    if ("object" === typeof obj.attachment) {
        var img = new Img(obj.attachment);

        img.save(function (err, img) {
            if (err) {
                return cb(err, null);
            }

            obj.attachment = img._id;
            var message = new Message(obj);
            return saveMessage(message, cb);
        });
    } else {
        var message = new Message(obj);
        return saveMessage(message, cb);
    }
});

messageSchema.static('getAttachments', function (id, cb) {
    return this.findOne({ _id: id }, 'attachment')
        .populate({ path: 'attachment' })
        .exec(cb);
});

var Message = mongoose.model('Message', messageSchema);

module.exports = exports = Message;
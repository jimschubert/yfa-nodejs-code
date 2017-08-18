"use strict";
var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    to: { type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    from: { type:mongoose.Schema.Types.ObjectId, ref: 'User'},
    body: String,
    attachment: { type:mongoose.Schema.Types.ObjectId, ref: 'Image'}
});

var Message = mongoose.model('Message', messageSchema);

module.exports = exports = Message;
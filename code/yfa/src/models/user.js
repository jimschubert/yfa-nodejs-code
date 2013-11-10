"use strict";
var mongoose = require('mongoose');

var enumValues = ['online', 'away', 'offline', null, undefined];
var userSchema = new mongoose.Schema({
    username: String,
    first_name: String,
    last_name: String,
    email: String,
    state: { type: String, enum: enumValues },
    cohorts: []
    // TODO: messages
    // TODO: images
}, { collection: 'yfa' });

var User = mongoose.model('User', userSchema);

module.exports = exports = User;

var states = {};
enumValues.forEach(function (val) {
    Object.defineProperty(states,
        (''+val).toUpperCase(),
        {
            enumerable: true,
            configurable: false,
            writable: false,
            value: val
        });
});

module.exports.States = exports.States = states;


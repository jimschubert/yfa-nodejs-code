"use strict";
var mongoose = require('mongoose');

var enumValues = ['online', 'away', 'offline', null, undefined];
var userSchema = new mongoose.Schema({
    facebookId: String,
    registrationDone: Boolean,
    username: String,
    first_name: String,
    last_name: String,
    email: String,
    state: { type: String, enum: enumValues },
    cohorts: []
    // TODO: messages
    // TODO: images
}, { collection: 'yfa' });

userSchema.static('fb',  function (id, cb) {
    return this.findOne({ facebookId: id }, cb);
});

userSchema.static('publicList',  function (skip, take, cb) {
    skip = parseInt(skip, 10);
    take = parseInt(take, 10);

    if(isNaN(skip)){
        skip = 0;
    }

    if(isNaN(take)) {
        take = 25;
    }

    return this.find({}, 'username state', {
        skip: Math.max(0, skip),
        limit: Math.min(Math.max(1, take), 25)
    }, cb);
});

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

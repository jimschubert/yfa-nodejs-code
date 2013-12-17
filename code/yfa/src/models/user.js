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

/**
 * User's activity states
 *
 * @property {String} ONLINE 'online'
 * @property {String} AWAY 'away'
 * @property {String} OFFLINE 'offline'
 * @property {Null} NULL null
 * @property {undefined} UNDEFINED undefined
 */
module.exports.States = exports.States = states;


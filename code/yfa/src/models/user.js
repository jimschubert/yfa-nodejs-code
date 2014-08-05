"use strict";
var mongoose = require('mongoose');

var enumValues = ['online', 'away', 'offline', null, undefined];
var userSchema = new mongoose.Schema({
    facebookId: String,
    registrationDone: Boolean,
    username: String,
    firstName: String,
    lastName: String,
    email: String,
    state: { type: String, enum: enumValues },
    cohorts: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
    messages: []
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

userSchema.static('getMessages', function(id,cb){
    if("function" !== typeof cb){
        cb = function(){};
    }

   return this.findOne({_id: id }, 'messages', null, cb);
});

userSchema.static('getById', function(id, self, cb) {
    if("function" !== typeof cb && "function" === typeof self){
        cb = self;
    }

    var fields = self ?
        null :
        'username state firstName lastName email state cohorts';

    return this.findOne({_id: id }, fields, null, cb);
});

userSchema.static('getCohortsById', function(id, cb) {
	return this.findOne({ _id: id }, 'cohorts', null, cb);
});

userSchema.static('addCohort', function(userId, cohortId, cb){
    return this.findOneAndUpdate({ _id: userId }, {
        $push: { cohorts: cohortId }
    }, cb);
});

userSchema.static('removeCohort', function(userId, cohortId, cb){
    return this.findOneAndUpdate({ _id: userId }, {
        $pull: { cohorts: cohortId }
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


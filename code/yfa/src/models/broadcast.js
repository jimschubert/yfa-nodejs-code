'use strict';
var util = require('util');
var events = require("events");

function Broadcaster(){
    events.EventEmitter.call(this);
}

util.inherits(Broadcaster, events.EventEmitter);

Broadcaster.prototype.message =  function(message){
    this.emit('message.add', message);
};

module.exports = exports = new Broadcaster();

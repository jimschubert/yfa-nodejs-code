"use strict";
var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    dataURI: String
});

imageSchema.static('getById', function(mid, cb){
    return this.findOne({_id: mid}, 'dataURI', cb);
});

var ImageModel = mongoose.model('Image', imageSchema);

module.exports = exports = ImageModel;
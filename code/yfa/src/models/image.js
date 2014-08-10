"use strict";
var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    dataURI: String
});

var Image = mongoose.model('Image', imageSchema);

module.exports = exports = Image;
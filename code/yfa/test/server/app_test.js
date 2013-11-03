'use strict';

var app = require('../../src/app.js').app;
var assert = require('assert');

describe('app', function(){
    it('should contain toots', function(){
        assert.ok(app !== null);
        assert.ok(app.toots);
    });
});

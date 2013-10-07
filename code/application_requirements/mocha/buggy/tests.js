var assert = require('assert');
var UserService = require('./example').UserService;
var Options = require('./example').Options;

describe('UserService', function(){
    describe('with default options', function(){
        var options, service;
        beforeEach(function(){
            options = new Options();
            service = new UserService(options);
        });

        it('should default to https', function(){
            assert.equal('https', service.protocol,
                'Service should default to https');
        });
    });
});

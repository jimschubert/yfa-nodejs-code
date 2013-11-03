'use strict';

var expect = chai.expect;

describe('service', function() {
  beforeEach(module('myApp.services'));


  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).to.equal('0.1');
    }));
  });
});

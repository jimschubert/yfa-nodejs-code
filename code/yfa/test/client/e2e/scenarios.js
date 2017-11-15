'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function () {

    beforeEach(function () {
        browser().navigateTo('/');
    });

    describe('home', function () {
        it('should display yfaChat in title', function(){
            expect(element('a.navbar-brand:first').text()).
                toMatch(/yfaChat/);
        });
    });
});

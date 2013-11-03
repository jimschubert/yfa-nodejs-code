'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function () {

    beforeEach(function () {
        browser().navigateTo('/');
    });

    describe('home', function () {
        it('should display Express in title', function(){
            expect(element('a.brand:first').text()).
                toMatch(/Express/);
        });

        [
            'action',
            'Another%20Action',
            'Something%20else',
            'Separated%20Link',
            'One%20more%20separated%20link'
        ].forEach(function(action){
            it('should render alert when user navigates to /#/?action=' + action, function () {
                browser().navigateTo('#/?action='+action);
                expect(element('div[ng-transclude] span:first').text()).
                    toMatch('Clicked dropdown link: ' + decodeURIComponent(action));
            });
        });
    });
});

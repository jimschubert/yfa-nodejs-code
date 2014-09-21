// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'myApp.compiled','ui.bootstrap', 'ngRoute']).
    config(['$routeProvider', function ($routeProvider) {
        "use strict";

        $routeProvider.when('/', {
            templateUrl: '/partials/index.html',
            controller: 'IndexCtrl'
        });

        $routeProvider.otherwise({ redirectTo: '/' });
    }]);

(function(){
    'use strict';
    // fix the facebook bug which appends #_=_ to the end of the url on auth callback
    if (window.location.hash && window.location.hash === '#_=_') {
        window.location.hash = '';
    }
})();

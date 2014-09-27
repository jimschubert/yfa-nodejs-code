// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'myApp.compiled','ui.bootstrap', 'ngRoute', 'draganddrop']).
    config([
                 '$routeProvider','USER_CONTEXT',
        function ($routeProvider , USER_CONTEXT) {
        "use strict";

        if(!USER_CONTEXT.id) {
            $routeProvider.when('/', {
                templateUrl: '/partials/index.html',
                controller: 'IndexCtrl'
            });
        } else {
            $routeProvider.when('/', {
                templateUrl: '/partials/dashboard.html',
                controller: 'DashboardCtrl'
            });
        }

        $routeProvider.otherwise({ redirectTo: '/' });
    }]);

(function(){
    'use strict';
    // fix the facebook bug which appends #_=_ to the end of the url on auth callback
    if (window.location.hash && window.location.hash === '#_=_') {
        window.location.hash = '';
    }
})();

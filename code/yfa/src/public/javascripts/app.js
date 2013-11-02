// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'myApp.controllers', 'ui.bootstrap']).
    config(['$routeProvider', function ($routeProvider) {
        "use strict";

        $routeProvider.when('/', {
            templateUrl: '/partials/index.html',
            controller: 'IndexCtrl'
        });
        $routeProvider.when('/contact', {
            templateUrl: '/partials/contact.html',
            controller: 'PagesCtrl'
        });
        $routeProvider.when('/about', {
            templateUrl: '/partials/about.html',
            controller: 'PagesCtrl'
        });
    }]);

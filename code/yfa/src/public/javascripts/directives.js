/*jshint unused:false */
(function(angular){
    'use strict';
    angular.module('myApp.directives', []).
        directive('appVersion', ['version', function (version) {
            return function (scope, elm, attrs) {
                elm.text(version);
            };
        }]);
})(angular);

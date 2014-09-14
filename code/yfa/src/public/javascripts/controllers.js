(function(angular){
    'use strict';

    /* Controllers */
    angular.module('myApp.controllers', ['ui.bootstrap'])
        .controller('IndexCtrl', [
                    '$scope',
            function($scope) {
                $scope.alerts = [];
                $scope.closeAlert = function(index) {
                    $scope.alerts.splice(index, 1);
                };
            }
        ])
        .controller('NavigationCtrl', [
                    '$scope','$location',
            function($scope , $location){
                $scope.isCurrent = function (me) {
                    var currentRoute = $location.path() || '/';
                    return me === currentRoute ? 'active' : '';
                };
            }
        ]);
})(angular);
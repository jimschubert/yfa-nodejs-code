(function(angular){
    'use strict';

    /* Controllers */
    angular.module('myApp.controllers', ['myApp.compiled', 'ui.bootstrap'])
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
                    '$scope','$location','USER_CONTEXT',
            function($scope , $location , USER_CONTEXT){
                console.log(USER_CONTEXT);
                $scope.isCurrent = function (me) {
                    var currentRoute = $location.path() || '/';
                    return me === currentRoute ? 'active' : '';
                };
            }
        ]);
})(angular);
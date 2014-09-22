(function(angular){
    'use strict';

    // Node's implementation of util.inherits
    function _extend(ctor, superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
    }

    /**
     * IndexCtrl handles unauthenticated index.
     * @param $scope
     * @constructor
     */
    function IndexCtrl($scope) {
        $scope.alerts = [];
        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }
    IndexCtrl.$inject = ['$scope'];

    /**
     * DashboardCtrl handles authenticated index
     * @param $scope
     * @param Api
     * @constructor
     */
    function DashboardCtrl($scope) {
        IndexCtrl.call(this, $scope);

    }
    DashboardCtrl.$inject = ['$scope'];

    _extend(DashboardCtrl, IndexCtrl);

    /* Controllers */
    angular.module('myApp.controllers', ['myApp.compiled', 'ui.bootstrap'])
        .controller('IndexCtrl', IndexCtrl)
        .controller('DashboardCtrl', DashboardCtrl)
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
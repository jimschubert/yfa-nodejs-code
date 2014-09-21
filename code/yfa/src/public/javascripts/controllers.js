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
    function DashboardCtrl($scope, Api) {
        IndexCtrl.call(this, $scope);

        $scope.page = 0;
        $scope.hasNext = function(){
            return $scope.totalUsers && $scope.totalUsers > (($scope.page + 1)*25);
        };

        Api.users.list().success(function(data){
            $scope.totalUsers = data.meta.total;
            $scope.users = data.results;
        });

        $scope.loadImage = function(user){
            Api.images.getById(user.avatar)
            .success(function(data){
                user.img = data && data.dataURI;
            });
        };

        $scope.next = function(){
            if($scope.hasNext()) {
                $scope.page = $scope.page + 1;
                var options = {
                    skip: $scope.page * 25,
                    take: 25
                };
                Api.users.list(options).success(function (data) {
                    $scope.totalUsers = data.meta.total;
                    $scope.users = data.results;
                });
            }
        };

        $scope.previous = function(){
            if($scope.page > 0) {
                $scope.page = $scope.page - 1;
                var options = {
                    skip: $scope.page * 25,
                    take: 25
                };
                Api.users.list(options).success(function (data) {
                    $scope.totalUsers = data.meta.total;
                    $scope.users = data.results;
                });
            }
        };
    }
    DashboardCtrl.$inject = ['$scope', 'Api'];

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
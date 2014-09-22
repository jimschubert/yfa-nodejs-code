/*jshint unused:false */
(function(angular){
    'use strict';
    angular.module('myApp.directives', []).
        directive('appVersion', [
                     'version',
            function (version) {
                return function (scope, elm, attrs) {
                    elm.text(version);
                };
            }
        ]);

    function UserPagerController($scope, Api){
        $scope.page = 0;
        $scope.hasNext = function(){
            return $scope.totalUsers && $scope.totalUsers > (($scope.page + 1)*25);
        };

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
    UserPagerController.$inject = ['$scope', 'Api'];

    angular.module('myApp.directives')
        .directive('userPager',[
            function(){
                return {
                    restrict: 'E',
                    scope: {
                      users: '=ngModel',
                      totalUsers: '='
                    },
                    controller: UserPagerController,
                    templateUrl: 'partials/user-pager.tpl.html',
                    link: function (scope, element, attrs) {
                    }
                }
            }
        ]);
})(angular);

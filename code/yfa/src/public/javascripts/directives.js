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
            return $scope.totalUsers && $scope.totalUsers > (($scope.page + 1)*$scope.pageSize);
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
                queryUsers();
            }
        };

        $scope.previous = function(){
            if($scope.page > 0) {
                $scope.page = $scope.page - 1;
                queryUsers();
            }
        };

        function queryUsers(){
            var options = {
                skip: $scope.page * $scope.pageSize,
                take: $scope.pageSize
            };
            Api.users.list(options).success(function (data) {
                $scope.totalUsers = data.meta.total;
                $scope.users = data.results;
            });
        }

        $scope.$watch('pageSize', function(newer,older){
            if(!$scope.users || (angular.isDefined(newer) && (newer !== older))){
                queryUsers();
            }
        });

        $scope.initialized = true;
    }
    UserPagerController.$inject = ['$scope', 'Api'];

    angular.module('myApp.directives')
        .directive('userPager',[
                    '$window',
            function($window){
                return {
                    restrict: 'E',
                    controller: UserPagerController,
                    templateUrl: 'partials/user-pager.tpl.html',
                    link: function (scope, element, attrs) {

                        function setUsersResponsive(){
                            var pager,
                                prev,
                                next,
                                userButtonSize = 35;

                            var buttons = element.find('a');

                            pager = angular.element(element.find('div')[0]);
                            prev = angular.element(buttons[0]);
                            next = angular.element(buttons[buttons.length-1]);

                            var availableWidth = pager.width()-prev.innerWidth()-next.innerWidth()-2;
                            scope.pageSize = Math.floor(availableWidth/userButtonSize);
                        }

                        var initialized = scope.$watch('initialized',
                            function(newer){
                            if(angular.isDefined(newer) && newer === true){
                                setUsersResponsive();
                                initialized();
                                delete scope.initialized;
                            }
                        });

                        var windowWidth;
                        angular.element($window).bind('resize', function(){
                            windowWidth = angular.element($window).width();
                            scope.$apply();
                        });

                        scope.$watch(function(){
                            return windowWidth;
                        }, function(newer, older){
                            if(angular.isDefined(newer) && newer !== older){
                                setUsersResponsive();
                            }
                        });

                        // default:
                        scope.page = 0;
                        scope.pageSize = 25;
                    }
                };
            }
        ]);
})(angular);

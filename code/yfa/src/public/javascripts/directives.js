/*jshint unused:false, bitwise:false */
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
                    scope: {
                      selectedUsers: '='
                    },
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

    function CohortsItemController($scope, Api) {
        Api.users.getById($scope.cohortId)
            .success(function (data) {
                $scope.cohort = data;

                if ($scope.cohort.avatar) {
                    Api.images.getById(data.avatar)
                        .success(function (data) {
                            $scope.cohort.img = data && data.dataURI;
                        });
                }
            })
            .error(function () {
                $scope.cohort = {};
            });

        $scope.deleteCohort = function () {
            Api.cohorts.remove($scope.cohortId, $scope.userId)
                .success(function () {
                    $scope.onCohortDeleted({ id: $scope.cohortId });
                    $scope.$destroy();
                });
        };
    }
    CohortsItemController.$inject = ['$scope', 'Api'];

    angular.module('myApp.directives')
        .directive('cohortItem',[
            function(){
                return {
                    restrict: 'E',
                    scope: {
                        userId: '=',
                        cohortId: '=',
                        onCohortDeleted: '&'
                    },
                    controller: CohortsItemController,
                    templateUrl: 'partials/cohort-item.tpl.html',
                    link: function (scope, element, attrs) {
                    }
                };
            }
        ]);

    angular.module('myApp.directives')
        .directive('contenteditable', [
            function(){
                return {
                    require: '^?ngModel',
                    restrict: 'A',
                    scope: {
                        onEnter: '&',
                        model: '=?ngModel'
                    },
                    link: function (scope, element, attrs) {
                        element.bind('keydown', function(e){
                            if(e.keyCode === 13 && !e.shiftKey){
                                e.preventDefault();
                                var text = e.currentTarget.innerText;
                                angular.element(element).html('');

                                if(text){
                                    scope.onEnter({
                                        text: text,
                                        data: scope.model
                                    });
                                    scope.$apply();
                                }
                            }
                        });
                    }
                };
            }
        ]);

    (function(angular){

        function onDrop(e) {
            e.preventDefault();
            var data = e.dataTransfer.getData("json/window-widget");
            if (data && (data = JSON.parse(data)) && data.id) {
                var elem = angular.element('[window-id="'+data.id+'"]').get(0);
                elem.style.top = (e.clientY + data.top) + 'px';
                elem.style.left = (e.clientX + data.left) + 'px';
            }

            return false;
        }

        function onDragOver(event) {
            event.preventDefault();
            return false;
        }

        document.body.addEventListener('drop',onDrop,false);
        document.body.addEventListener('dragover',onDragOver,false);

        angular.module('myApp.directives')
            .directive('messageWindow', [
                function(){
                    return {
                        restrict: 'A',
                        transclude: true,
                        replace: true,
                        scope: {
                            title: '=windowTitle',
                            onClose: '&'
                        },
                        templateUrl: 'partials/window-widget.html',
                        link: function(scope, element, attrs){
                            var id = Math.random();
                            angular.element(element).attr('draggable', true);
                            angular.element(element).attr('window-id', id);

                            function onDrag(e) {
                                var style = window.getComputedStyle(event.target, null);
                                var data = {
                                    id: id,
                                    top: (0|parseInt(style.getPropertyValue("top"),10)) - e.clientY,
                                    left: (0|parseInt(style.getPropertyValue("left"),10)) - e.clientX
                                };

                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData("json/window-widget", JSON.stringify(data));
                            }

                            var elem = angular.element(element).get(0);
                            elem.addEventListener('dragstart',onDrag,false);

                            scope.shaded = false;
                            scope.toggleShade = function(){
                                scope.shaded = !scope.shaded;

                                angular.element(element).css({
                                    'height': scope.shaded ? '30px' : ''
                                });
                            };

                            scope.close = function(){
                                scope.onClose();
                                angular.element(element).remove();
                            };
                        }
                    };
                }
            ]);
    })(angular);
})(angular);

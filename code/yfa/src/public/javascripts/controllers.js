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
     * @param MessageService
     * @param USER_CONTEXT
     * @constructor
     */
    function DashboardCtrl($scope, Api, MessageService, USER_CONTEXT) {
        IndexCtrl.call(this, $scope);

        Api.users.getById(USER_CONTEXT.id)
            .success(function(data){
               $scope.user = data;

                if(angular.isArray(data.messages)){
                    angular.forEach(data.messages, function(value){
                        MessageService.addMessage(value);
                    });
                }
            });

        $scope.removeCohort = function(id){
            if(angular.isArray($scope.user.cohorts)){
                var index = $scope.user.cohorts.indexOf(id);

                if(index > -1) {
                    $scope.user.cohorts.splice(index,1);
                }
            }
        };

        $scope.onDrop = function(data /*, event */){
            var cohort = data['json/user-pager-object'];
            if(cohort){
                Api.cohorts.add(cohort._id, USER_CONTEXT.id)
                    .success(function(){
                        if($scope.user.cohorts.indexOf(cohort._id) === -1)
                        {
                            $scope.user.cohorts.push(cohort._id);
                        }
                    });
            }
        };
    }
    DashboardCtrl.$inject = ['$scope', 'Api', 'MessageService', 'USER_CONTEXT'];

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
        ])
        .controller('MessageCtrl', [
                    '$scope','MessageService',
            function($scope , MessageService){
                function setMessages(){
                    $scope.messages = MessageService.list();
                    console.log($scope.messages);
                }

                $scope.$on('messageAdded', setMessages);
                $scope.$on('messageRemoved', setMessages);
            }
        ]);
})(angular);
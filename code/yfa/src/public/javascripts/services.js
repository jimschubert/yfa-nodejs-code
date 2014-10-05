(function(angular){
    'use strict';

    /* Services */
    angular.module('myApp.services', []).
        value('version', '0.1');

    angular.module('myApp.services')
        .service('Api', [
                    '$http',
            function($http){
                var apiBase = '/api/v1';
                return {
                    users: {
                        getById: function (id){
                            return $http({
                                url: apiBase + '/users/' + id,
                                method: 'GET',
                                cache: false
                            });
                        },
                        list: function (options){
                            return $http({
                                url: apiBase + '/users',
                                params: options,
                                method: 'GET',
                                cache: false
                            });
                        }
                    },
                    cohorts: {
                        remove: function(cohortId, userId){
                            var options = {
                                user_id: userId
                            };
                            return $http({
                                url: apiBase + '/cohorts/'+cohortId,
                                params: options,
                                method: 'DELETE',
                                cache: false
                            });
                        },

                        add: function(cohortId, userId){
                            var options = {
                                user_id: userId
                            };
                            return $http({
                                url: apiBase + '/cohorts/'+cohortId,
                                params: options,
                                method: 'POST',
                                cache: false
                            });
                        }
                    },
                    images: {
                        getById: function(id){
                            return $http({
                                url: apiBase + '/images/' + id,
                                method: 'GET',
                                cache: false
                            });
                        }
                    }
                };
            }
        ]);

    angular.module('myApp.services')
        .service('MessageService', [
                    '$rootScope',
            function($rootScope){
                var service = {}, messages = [];

                service.addMessage = function(id){
                    if(messages.indexOf(id) === -1){
                        messages.push(id);
                        $rootScope.$broadcast('messageAdded', { id: id });
                    }
                };

                service.removeMessage = function(id){
                    var index = messages.indexOf(id);
                    if(index > -1){
                        messages.splice(index, 1);
                        $rootScope.$broadcast('messageRemoved', { id: id });
                    }
                };

                service.list = function(){
                    return angular.copy(messages);
                };

                return service;
            }
        ]);
})(angular);

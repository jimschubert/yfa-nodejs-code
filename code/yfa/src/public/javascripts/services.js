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
})(angular);

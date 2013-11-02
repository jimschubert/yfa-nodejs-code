/* Controllers */
angular.module('myApp.controllers', ['ui.bootstrap']).
    controller('MyCtrl1', [function () {
        "use strict";
        if(console && console.log) {
            console.log('My Controller 1');
        }
    }])
    .controller('MyCtrl2', [function () {
        "use strict";
        if(console && console.log) {
            console.log('My Controller 2');
        }
    }]);

var ButtonsCtrl = function ($scope, $http, $compile) {
    "use strict";

    $scope.singleModel = 1;

    $scope.radioModel = 'Middle';

    $scope.checkModel = {
        left  : false,
        middle: true,
        right : false
    };

    $scope.contents = '';

    $scope.load = function (location) {
        $http.get(location).success(function(data) {
            var elm = angular.element(document.getElementById('contact-contents'));
            elm.html(data);
            $compile(elm)($scope);
        });
    };
};
ButtonsCtrl.$inject = ['$scope', '$http', '$compile'];

var PagesCtrl = function ($scope, $route) {
    "use strict";

    $scope.dynamic = ($route.current !== undefined);
    $scope.static = !$scope.dynamic;
};

PagesCtrl.$inject = ['$scope', '$route'];

var IndexCtrl = function ($scope, $routeParams) {
    "use strict";

    var routed = $routeParams.action;

    // note samples don't appear asynchronously because dropdown links aren't included within this ng-controller
    if(routed) {
        $scope.alerts = [{ type: 'success', msg: 'Clicked dropdown link: ' + routed }];
    } else {
        $scope.alerts = [];
    }

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
};
IndexCtrl.$inject = ['$scope', '$routeParams'];

var NavigationCtrl = function ($scope, $location) {
    "use strict";

    $scope.isCurrent = function (me) {
        var currentRoute = $location.path() || '/';
        return me === currentRoute ? 'active' : '';
    };
};
NavigationCtrl.$inject = ['$scope', '$location'];

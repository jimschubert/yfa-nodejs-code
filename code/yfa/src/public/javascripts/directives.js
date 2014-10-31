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

    function UserPagerController($scope, Api, MessageService){
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

        $scope.openConversation = function(userId, username){
            MessageService.openConversation(userId, username);
        };

        $scope.$watch('pageSize', function(newer,older){
            if(!$scope.users || (angular.isDefined(newer) && (newer !== older))){
                queryUsers();
            }
        });

        $scope.initialized = true;
    }
    UserPagerController.$inject = ['$scope', 'Api', 'MessageService'];

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

    function CohortsItemController($scope, Api, MessageService) {
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

        $scope.openConversation = function(userId, username, $event){
            // Ignore delete button.
            if($event.target.nodeName === "BUTTON") { return; }
            MessageService.openConversation(userId, username);
        };
    }
    CohortsItemController.$inject = ['$scope', 'Api', 'MessageService'];

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
                        controller: function (){},
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

        angular.module('myApp.directives')
            .directive('typingNotification', [
                        'socket',
                function(socket){
                    return {
                        restrict: 'E',
                        require: '^messageWindow',
                        replace: true,
                        template: '<span class="typing-notification" ng-class="{typing: isTyping}">\u2328</span>',
                        scope: {
                            target: '=cohort',
                            sender: '=user'
                        },
                        link: function(scope,element,attr){
                            var lastMessage = 0;
                            element.parent().find('.typing-area').bind('keyup', function(e) {
                                // Notify every two seconds.
                                if(+new Date() - lastMessage > 2000) {
                                    socket.emit('typing', scope.target, scope.sender);
                                    lastMessage = +new Date();
                                }
                            });

                            socket.forward('typing', scope);

                            scope.$on('yfa|typing', function(ev, cohort){
                                if(cohort === scope.target && !scope.isTyping){
                                    scope.isTyping = true;
                                    setTimeout(function(){
                                        scope.isTyping = false;
                                        scope.$apply();
                                    }, 1000);
                                }
                            });
                        }
                    };
                }
            ]);
    })(angular);

    (function(angular){

        // http://stackoverflow.com/a/14930686/151445
        function dataURItoBlob(dataURI) {
            var byteString,
                mimeType;

            if(dataURI.split(',')[0].indexOf('base64') !== -1 ) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = decodeURI(dataURI.split(',')[1]);
            }

            mimeType = dataURI.split(',')[0].split(':')[1].split(';')[0];

            var content = [];
            for (var i = 0; i < byteString.length; i++) {
                content[i] = byteString.charCodeAt(i);
            }

            return new Blob([new Uint8Array(content)], {type: mimeType});
        }

        // see: http://html5demos.com/dnd-upload
        var tests = [
            function fileReaderSupportTest(){
                return !angular.isUndefined(typeof FileReader);
            },
            function formDataSupportTest(){
                return "function" === typeof FormData;
            },
            function canvasSupportTest(){
                return !!document.createElement('canvas').getContext;
            },
            function blobSupportTest(){
                return "function" === typeof Blob;
            },
            function uint8ArraySupportTest(){
                return "function" === typeof Uint8Array;
            }
        ];

        var passes = 0;
        angular.forEach(tests, function(test){
            // Add all passing tests
            var success = test();
            passes += (+success);

            if(!test.name){
                var fun = test.toString();
                fun = fun.substr(9);
                fun = fun.substr(0, fun.indexOf('('));
                test.name = fun;
            }

            if(console && "function" === typeof console.info){
                console.info('%cTest: %s => %s', 'color:blue', test.name, success);
            }
        });

        angular.module('myApp.directives')
            .directive('imgDropUpload', [
                '$log','Api',
                function($log , Api){

                    var types = [
                        "image/png",
                        "image/jpeg",
                        "image/gif"
                    ];

                    function resizeAndUpload(file, maxHeight, maxWidth, cb) {
                        cb = "function" === typeof cb ? cb : function(){
                            $log.warn('No callback to handle image upload!');
                        };

                        var reader = new FileReader();
                        reader.onload = function (event) {
                            // Get Image
                            var img = new Image();

                            img.onload = function () {
                                var canvas = document.createElement('canvas');
                                var ctx = canvas.getContext('2d');

                                // Resize Image to bound size
                                if (img.height > maxHeight) {
                                    img.width *= maxHeight / img.height;
                                    img.height = maxHeight;
                                }

                                if (img.width > maxWidth) {
                                    img.height *= maxWidth / img.width;
                                    img.width = maxWidth;
                                }

                                // Resize canvas to bound size
                                canvas.width = img.width;
                                canvas.height = img.height;

                                $log.info('Uploading image with dimensions: %dh x %dw', img.height, img.width);

                                // Write our resized image to canvas
                                ctx.drawImage(img, 0, 0, img.width, img.height);

                                // Upload Image
                                var dataUri = canvas.toDataURL("image/png");

                                $log.info('Image reduced by %d%', (event.target.result.length/dataUri.length));

                                var formData = new FormData();
                                formData.append('image', dataURItoBlob(dataUri));
                                Api.images.upload(formData)
                                    .success(function (data) {
                                        // Return Image Id
                                        var id = data && data._id;
                                        cb({ image: data });
                                    })
                                    .error(function(data){
                                        $log.error(data);
                                    });
                            };

                            // Original dataURI is event.target.result
                            img.src = event.target.result;
                        };

                        reader.readAsDataURL(file);
                    }

                    if(passes === tests.length) {
                        return {
                            scope: { onImageUploaded: '&' },
                            link: function lnkImgDropUpload(scope, element, attr) {
                                var maxHeight = parseInt(attr['maxHeight'], 10) || 200;
                                var maxWidth = parseInt(attr['maxWidth'], 10) || 300;

                                element.get(0).addEventListener('drop', function (e) {
                                    e.preventDefault();
                                    element.removeClass('droppable');

                                    var files = e.dataTransfer.files||e.target.files||[];
                                    var file = files[0];

                                    // Only accept certain types of files.
                                    if(file && ~types.indexOf(file.type)){
                                        if(file.size < 20000000)
                                        {
                                            resizeAndUpload(file,
                                                maxHeight,
                                                maxWidth,
                                                scope.onImageUploaded
                                            );
                                        } else {
                                            $log.error('File too large');
                                        }
                                    }

                                    return false;
                                }, false);

                                element.get(0).addEventListener('dragover', function (e) {
                                    e.preventDefault();

                                    if(!element.hasClass('droppable') && ~e.dataTransfer.types.indexOf("Files")){
                                        element.addClass('droppable');
                                    }

                                    return false;
                                }, false);

                                element.get(0).addEventListener('dragleave', function (e) {
                                    e.preventDefault();
                                    element.removeClass('droppable');
                                    return false;
                                }, false);
                            }
                        };
                    } else {
                        $log.warn("This browser doesn't support required features for the imgDropUpload directive.");
                        return { };
                    }
                }
            ]);
    })(angular);
})(angular);

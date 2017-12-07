angular.module('main.controller', [])
    .controller('LoginCtrl', function (Backand, $state, $rootScope, $http, $scope, $ionicLoading, $q, $ionicModal, $filter, LoginService) {
       console.log("Login controller.");
    })

    .controller('AppController', function (AppService, $rootScope, $http, $scope, $state, $ionicModal, $ionicPopup, $ionicLoading, $filter, $window, $timeout) {

        var a = [1, 2, 3, 4];
        var b = ['1', '2', '3', '4'];
        console.log(a);
        console.log(b);
        var c = a[0];
        console.log(c);
        var d = a[0].toString();
        console.log(d);

        //AppService.aaa();
        //AppService.aaa().then(function (result) {});
    // -- Variables Declaration
        var admin = $rootScope.admin;
        $scope.logged = false;
        $scope.user = { id: null, email: "", firstName: "", lastName: "", password: "", };
        $rootScope.user = $scope.user;
        $scope.newEvent = {
            img: "img/add.png",
            date: new Date(),
            days: { zero: false, one: false, two: false, three: false, four: false, five: false, six: false, seven: false },
        };

    // -- Functions Declaration
        $scope.registering = false;
        $scope.registerUser = registerUser;
        $scope.loginUser = loginUser;
        $scope.createEvent = createEvent;
        $scope.checkWeek = checkWeek;
        $scope.checkDay = checkDay;
        $scope.confirmDeleteEvent = confirmDeleteEvent;
        $scope.salvarEdit = salvarEdit;
        $scope.goNewEvent = goNewEvent;
    
    // -- Get All Events From API
        $http.get("https://api.backand.com/1/objects/event").success(function(result) {
            for (var i = 0; i < result.data.length; i++) {
                result.data[i].time = toUTCDate(new Date(result.data[i].time));
                result.data[i].date = toUTCDate(new Date(result.data[i].date));
                var week = { one: false, two: false, three: false, four: false, five: false, six: false, seven: false };
                if (result.data[i].days) {
                    if (result.data[i].days.search("Domingo") != -1)
                        week.one = true;
                    if (result.data[i].days.search("Segunda") != -1)
                        week.two = true;
                    if (result.data[i].days.search("Terça") != -1)
                        week.three = true;
                    if (result.data[i].days.search("Quarta") != -1)
                        week.four = true;
                    if (result.data[i].days.search("Quinta") != -1)
                        week.five = true;
                    if (result.data[i].days.search("Sexta") != -1)
                        week.six = true;
                    if (result.data[i].days.search("Sábado") != -1)
                        week.seven = true;
                }
                result.data[i].days = week;
            }
            $scope.events = [];
            $scope.classes = [];
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].class) {
                    $scope.classes.push(result.data[i]);
                } else {
                    $scope.events.push(result.data[i]);
                }
            }
            console.log($scope.events);
            console.log($scope.classes);
        });

        $scope.chooseNewEvent = function () {
            var options = {
                androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
                title: 'Você quer cadastrar um novo evento ou uma nova aula?',
                buttonLabels: ['Cadastrar Evento', 'Cadastrar Aula'],
                androidEnableCancelButton : true,
                winphoneEnableCancelButton : true,
                addCancelButtonWithLabel: 'Cancel',
                position: [20, 40],
                destructiveButtonLast: true
            };
            try {
                window.plugins.actionsheet.show(options, goNewEvent);
            } catch (err) {
                console.log("Action Sheet is undefined.");
            }
        };
        function goNewEvent(index) {
            $scope.modalNewEvent.show();
            if (index == 1) {
                $scope.newEvent.class = false;
            }
            if (index == 2) {
                $scope.newEvent.class = true;
            }
        }

    // -- API Functions
        function registerUser() {
            if ($scope.user.password != $scope.user.confirmPassword) {
                toastMessage("As senhas estão diferentes. Tente de novo.");
            } else {
                var content = '<ion-spinner class="spinner-balanced"></ion-spinner><p>Cadastrando...</p>';
                $ionicLoading.show({ template: content });
                var data = {
                    email: $scope.user.email,
                    firstName: $scope.user.firstName,
                    lastName: $scope.user.lastName,
                    password: $scope.user.password,
                };
                $http.post("https://api.backand.com/1/objects/users", data).then(function(result) {
                    $ionicLoading.hide();
                    if (result.data.__metadata) {
                        $scope.logged = true;
                        $scope.registering = false;
                        $scope.user.id = result.data.__metadata;
                        $rootScope.user = $scope.user;
                        toastMessage("Usuário registrado com sucesso.");
                    } else {
                        toastMessage("Falha ao registrar usuário. Tente novamente.");
                    }
                }, function (error) {
                    console.log(error);
                });
            }
        }
        function loginUser() {
            var content = '<ion-spinner class="spinner-balanced"></ion-spinner><p>Entrando...</p>';
            $ionicLoading.show({ template: content });
            var data = { email: $scope.user.email, password: $scope.user.password };
            $http.post("https://api.backand.com/1/query/data/login", data).success(function(result) {
                $ionicLoading.hide();
                if (result[0]) {
                    $scope.logged = true;
                    $scope.user = result[0];
                    $rootScope.user = $scope.user;
                    toastMessage("Bem vindo, " + $scope.user.firstName);
                } else {
                    toastMessage("Email/Password errado.");
                }
            });
        }
        function createEvent() {
            console.log($scope.newEvent);
            var now = new Date();
            $scope.newEvent.time.setFullYear(now.getFullYear());
            $scope.newEvent.time.setMonth(now.getMonth());
            $scope.newEvent.time.setDate(now.getDate());
            var time = $filter('date')($scope.newEvent.time, 'yyyy-MM-ddTHH:mm:ss');
            var data = {
                user_id: $scope.user.id,
                name: $scope.newEvent.name,
                description: $scope.newEvent.description,
                local: $scope.newEvent.local,
                often: $scope.newEvent.often,
                class: $scope.newEvent.class,
                date: $scope.newEvent.date,
                time: time,
                days: "",
                img: "data:image/jpeg;base64,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",
            };
            if ($scope.newEvent.days.one)
                data.days += "Domingo. "
            if ($scope.newEvent.days.two)
                data.days += "Segunda. "
            if ($scope.newEvent.days.three)
                data.days += "Terça. "
            if ($scope.newEvent.days.four)
                data.days += "Quarta. "
            if ($scope.newEvent.days.five)
                data.days += "Quinta. "
            if ($scope.newEvent.days.six)
                data.days += "Sexta. "
            if ($scope.newEvent.days.seven)
                data.days += "Sábado. "
            if ($scope.newEvent.img != "img/add.png")
                data.img = $scope.newEvent.img;

            $http.post("https://api.backand.com/1/objects/event", data).success(function(result) {
                if (result.__metadata) {
                    toastMessage("Evento criado com sucesso.");
                    data.id = parseInt(result.__metadata.id);
                    data.days = $scope.newEvent.days;
                    if (data.class) {
                        $scope.classes.push(data);
                        var i = $scope.classes.length - 1;
                        $scope.event = $scope.classes[i];
                    } else {
                        $scope.events.push(data);
                        var i = $scope.events.length - 1;
                        $scope.event = $scope.events[i];
                    }
                    $scope.modalNewEvent.hide();
                    $scope.modalEvent.show();
                    $scope.event.i = i;
                    $state.go("tab.dashboard");
                    $scope.newEvent = {
                        img: "img/add.png",
                        date: new Date(),
                        days: { zero: false, one: false, two: false, three: false, four: false, five: false, six: false, seven: false },
                    };
                } else {
                    toastMessage("Algo deu errado. Tente de novo mais tarde.");
                }
            });
        }
        function confirmDeleteEvent() {
            if ($scope.logged) {
                var myPopup = $ionicPopup.show({
                    title: 'Excluir Evento',
                    template: 'Você tem certeza que quer excluir esse evento?',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancelar' },
                        {
                            text: 'Excluir',
                            type: 'button-assertive',
                            onTap: function(e) {
                                var content = '<ion-spinner class="spinner-balanced"></ion-spinner><p>Excluindo...</p>';
                                $ionicLoading.show({ template: content });
                                deleteEvent();
                            }
                        }
                    ]
                });
            } else {
                var myPopup = $ionicPopup.show({
                    title: 'Você não está logado!',
                    template: 'Quer ir fazer o login ou se cadastrar?',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancelar' },
                        {
                            text: 'Quero ir',
                            type: 'button-positive',
                            onTap: function(e) {
                                $state.go("tab.login");
                                $scope.modalEvent.hide();
                            }
                        }
                    ]
                });
            }
        }
        function salvarEdit() {
            var time = $filter('date')($scope.event.time, 'yyyy-MM-ddTHH:mm:ss');
            var data = {
                user_id: $scope.user.id,
                name: $scope.event.name,
                description: $scope.event.description,
                local: $scope.event.local,
                often: $scope.event.often,
                date: $scope.event.date,
                time: time,
                days: "",
                img: "",
            };
            if ($scope.event.days.one)
                data.days += "Domingo. "
            if ($scope.event.days.two)
                data.days += "Segunda. "
            if ($scope.event.days.three)
                data.days += "Terça. "
            if ($scope.event.days.four)
                data.days += "Quarta. "
            if ($scope.event.days.five)
                data.days += "Quinta. "
            if ($scope.event.days.six)
                data.days += "Sexta. "
            if ($scope.event.days.seven)
                data.days += "Sábado. "

            $scope.modalEditEvent.hide();
            $http.put("https://api.backand.com/1/objects/event/" + $scope.event.id, data).success(function(result) {
                $scope.modalEditEvent.hide();
                toastMessage("Evento editado.");
            }, function (error) {
                toastMessage("Algo deu errado. Tente de novo mais tarde.");
            });
        }
        function deleteEvent() {
            $http.delete("https://api.backand.com/1/objects/event/" + $scope.event.id).success(function(result) {
                $ionicLoading.hide();
                if (result.__metadata) {
                    $scope.modalEvent.hide();
                    $scope.events.splice($scope.event.i, 1);
                    toastMessage("Evento excluído.");
                }
            });
        }

    // -- Add Picture -- Take Photo or Choose from Gallery
        $scope.addImage = function(i) {
            var options = {
                androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
                title: 'Tirar uma foto ou escolher uma na sua galeria?',
                buttonLabels: ['Tirar Foto', 'Escolher Foto'],
                androidEnableCancelButton : true,
                winphoneEnableCancelButton : true,
                addCancelButtonWithLabel: 'Cancel',
                position: [20, 40], // for iPad pass in the [x, y] position of the popover
                destructiveButtonLast: true // you can choose where the destructive button is shown
            };
            try {
                window.plugins.actionsheet.show(options, uploadImage);
            } catch (err) {
                console.log("Action Sheet is undefined.");
            }
        }
        function uploadImage(index) {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                correctOrientation: true,
                targetWidth: 500,
                targetHeight: 500,
                allowEdit: true,
            };
            if (index == 2) {
                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
            }
            if (index == 1 || index == 2) {
                navigator.camera.getPicture(function (image) {
                    $timeout( function() {
                        $scope.newEvent.img = "data:image/jpeg;base64," + image;
                    }, 100 );
                }, function (error) {

                }, options);
            }
        };

    // -- 
        function checkWeek(created) {
            if (created) {
                $scope.event.days.two = $scope.newEvent.days.zero;
                $scope.event.days.three = $scope.newEvent.days.zero;
                $scope.event.days.four = $scope.newEvent.days.zero;
                $scope.event.days.five = $scope.newEvent.days.zero;
                $scope.event.days.six = $scope.newEvent.days.zero;
            } else {
                $scope.newEvent.days.two = $scope.newEvent.days.zero;
                $scope.newEvent.days.three = $scope.newEvent.days.zero;
                $scope.newEvent.days.four = $scope.newEvent.days.zero;
                $scope.newEvent.days.five = $scope.newEvent.days.zero;
                $scope.newEvent.days.six = $scope.newEvent.days.zero;
            }
        }
        function checkDay(created) {
            if (created) {
                if ($scope.event.days.two && $scope.event.days.three && $scope.event.days.four && $scope.event.days.five && $scope.event.days.six) {
                    $scope.event.days.zero = true;
                }
                if (!$scope.event.days.two || !$scope.event.days.three || !$scope.event.days.four || !$scope.event.days.five || !$scope.event.days.six) {
                    $scope.event.days.zero = false;
                }
            } else {
                if ($scope.newEvent.days.two && $scope.newEvent.days.three && $scope.newEvent.days.four && $scope.newEvent.days.five && $scope.newEvent.days.six) {
                    $scope.newEvent.days.zero = true;
                }
                if (!$scope.newEvent.days.two || !$scope.newEvent.days.three || !$scope.newEvent.days.four || !$scope.newEvent.days.five || !$scope.newEvent.days.six) {
                    $scope.newEvent.days.zero = false;
                }
            }
        }
    // -- Control Modals and Navigation
        $scope.goRegister = function () {
            $scope.registering = true;
        };
        $scope.goLogin = function () {
            $scope.registering = false;
        };
        $scope.openEvent = function (isClass, i) {
            $scope.modalEvent.show();
            if (isClass) {
                $scope.event = $scope.classes[i];
            } else {
                $scope.event = $scope.events[i];
            }
            $scope.event.i = i;
            $scope.options = [{ name: "Único", id: 1 }, { name: "Diário", id: 2 }, { name: "Semanal", id: 3 }];
            $scope.selected = $scope.options[$scope.event.often-1];
        };
        $scope.goEditEvent = function() {
            if ($scope.logged) {
                $scope.modalEditEvent.show();
            } else {
                var myPopup = $ionicPopup.show({
                    title: 'Você não está logado!',
                    template: 'Quer ir fazer o login ou se cadastrar?',
                    scope: $scope,
                    buttons: [
                        { text: 'Cancelar' },
                        {
                            text: 'Quero ir',
                            type: 'button-positive',
                            onTap: function(e) {
                                $state.go("tab.login");
                                $scope.modalEvent.hide();
                            }
                        }
                    ]
                });
            }
        };

    // -- Modals Decalration
        $ionicModal.fromTemplateUrl('templates/modalEvent.html', {
            scope: $scope }).then(function(modal) { $scope.modalEvent = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalNewEvent.html', {
            scope: $scope }).then(function(modal) { $scope.modalNewEvent = modal;
        });
        $ionicModal.fromTemplateUrl('templates/modalEditEvent.html', {
            scope: $scope }).then(function(modal) { $scope.modalEditEvent = modal;
        });

    // -- Convert a time to the right timezone
        toUTCDate = function (date) {
            try {
                var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                return _utc;
            } catch (err) {
                return date;
            }
        };

    // -- Toast Message Service
        function toastMessage (message) {
            try {
                window.plugins.toast.showLongBottom(message);
                //$cordovaToast.showLongBottom(message);
                //window.plugins.toast.show(message, 'long', 'bottom');
            } catch (err) {
                console.log("Cordova toast is undefined.");
                console.log(message);
                //console.log(err);
            }
        };
    });
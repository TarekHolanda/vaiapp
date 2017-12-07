angular.module('service', [])

    .service('APIInterceptor', function ($rootScope, $q) {
        var service = this;

        service.responseError = function (response) {
            if (response.status === 401) {
                $rootScope.$broadcast('unauthorized');
            }
            return $q.reject(response);
        };
    })

    .service('AppService', function ($http, Backand) {
        return {
            aaa: function () {
                //console.log("oiii");
            },
        }
    })

    .service('LoginService', function (Backand) {
        var service = this;
        
        service.signin = function (email, password, appName) {
            console.log("called.");
            appName = "vaiapp";
            console.log(appName);
            //call Backand for sign in
            return Backand.signin(email, password);
        };
        service.signup = function (firstName, lastName, email, password, again) {
            return Backand.signup(firstName, lastName, email, password, password);
        };
        service.anonymousLogin = function() {
            // don't have to do anything here,
            // because we set app token att app.js
        };
        service.facebookToken = function(token) {
            console.log("facebookToken",token);
            return Backand.socialSignInToken('facebook', token);
        };
        service.signout = function () {
            return Backand.signout();
        };
        service.socialSignUp = function (provider) {
            console.log(provider);
            return Backand.socialSignUp(provider);
        };
        service.socialSignIn = function (provider) {
            return Backand.socialSignIn(provider);
        };
    });

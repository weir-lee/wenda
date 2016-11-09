;(function(){
    'use strict';
    angular.module('xiaohu',['ui.router'])

        .config(['$stateProvider','$urlRouterProvider',
            function($stateProvider,$urlRouterProvider){
                $urlRouterProvider.otherwise('/home');

                $stateProvider
                    .state('home',{
                        url: '/home',
                        templateUrl: '/home.html'
                    })
                    .state('login',{
                        url: '/login',
                        templateUrl: '/login.html'
                    })
                    .state('signup',{
                        url: '/signup',
                        templateUrl: '/signup.html',
                        controller: 'signupController'
                    })

        }])

        .service('signUpService',[function(){
            this.signup_date = {};
            this.gosign = function(){
                console.log(123)
            }
        }])

        .controller('signupController',['$scope',
            'signUpService',
            function($scope,signUpService){
            $scope.user = signUpService;
        }])
})();
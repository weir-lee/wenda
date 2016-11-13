// 注册登录模块
angular.module('app.user',['app.answer','app.question'])

    .service('UserService', ['$http', '$state', 'QuestServ','AnswerService',
        function ($http, $state, QuestServ, AnswerService) {
        var self = this;
        self.signupData = {};

        // 判断用户名是否已经存在
        self.username_exist = function () {
            $http.post('/api/user/exist', {'username': self.signupData.username})
                .then(function (r) {
                    if (r.data.status && r.data.valid) {
                        self.exist = false;
                    }
                    if (r.data.status && !r.data.valid) {
                        self.exist = true;
                    }
                }, function (err) {
                    console.log(err + '请求失败');
                });
        };

        // 注册
        self.gosign = function () {
            $http.post('/api/signup', self.signupData).then(function (result) {
                // 注册成功则跳转到首页
                if (result.data.status) {
                    self.signupData = {};
                    window.location.href = '/';  //强制刷新页面
                    //$state.go('home');
                } else {
                    self.login = false;
                }
            }, function (e) {
                console.log(e + '注册失败');
            });
        };

        // 登陆
        self.loginData = {};
        self.login = function () {
            $http.post('/api/login', self.loginData).then(function (result) {
                if (result.data.status) {
                    self.loginData = {};
                    //登陆成功跳转到首页
                    //$state.go('home');
                    window.location.href = '/';  //强制刷新页面
                } else {
                    self.login_failed = true;
                }
            }, function (err) {
                console.log('登陆失败');
            });
        };

        self.read = function(params){
            QuestServ.read(params).then(function(data){
                console.log(data)
                if(data.status)
                    self.his_questions = data.data;
                if(data.msg=='login required')
                    $state.go('login');

            });
            AnswerService.read(params).then(function(data){
                if(data.status)
                    self.his_answers = data.data;
                if(data.msg=='login required')
                    $state.go('login');
            });
        }

    }])

    .controller('signupController',
    ['$scope',
        'UserService',
        function ($scope, UserService) {
            $scope.User = UserService;

            // 判断用户名是否存在
            // 监视表单，当输入的用户名发生变化时，发送请求
            $scope.$watch(function () {
                return UserService.signupData;
            }, function (n, o) {
                if (n.username != o.username) {
                    UserService.username_exist();
                }
            }, true);

        }
    ])

    .controller('loginController', ['$scope', 'UserService',
        function ($scope, UserService) {
            $scope.User = UserService;
        }
    ])

    .controller('UserController',['$scope',
        '$stateParams',
        'UserService',
        function($scope, $stateParams,UserService){
            $scope.User = UserService;
            UserService.read($stateParams);

    }])
;

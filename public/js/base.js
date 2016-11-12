;
(function () {
    'use strict';
    angular.module('xiaohu', ['ui.router','app.user','app.question','app.answer'])

        .config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) {
                $urlRouterProvider.otherwise('/home');

                $stateProvider
                    .state('home', {
                        url: '/home',
                        templateUrl: '/home.html',
                        controller: 'HomeController'
                    })
                    .state('login', {
                        url: '/login',
                        templateUrl: '/login.html',
                        controller: 'loginController'
                    })
                    .state('signup', {
                        url: '/signup',
                        templateUrl: '/signup.html',
                        controller: 'signupController'
                    })
                    .state('question', {
                        abstract: true,
                        url: '/question',
                        template: '<div ui-view></div>'
                    })
                    .state('question.add', {
                        url: '/add',
                        templateUrl: '/question-add.html',
                        controller: 'QuestionAddController'
                    })

            }])

        // 首页功能
        .service('TimelineService', ['$http','AnswerService', function ($http,AnswerService) {
            var self = this;
            self.data =[];
            self.curPage = 1;
            // 获取时间线数据
            self.getData = function () {
                if(self.pending){
                    return;
                }
                self.pending = true;
                $http.get('/api/timeline?'+'limit=2&page='+self.curPage)
                    .then(function (r) {
                        if(r.data.status){
                            if(r.data.data.length){
                                self.data = self.data.concat(r.data.data);
                                // 统计票数
                                AnswerService.CountVoteForAnswers(self.data);

                                self.curPage++;
                            }else{
                                self.no_more_data = true;
                            }
                        }else{
                            console.log('network error');
                        }
                    }, function (err) {
                        console.log('network error');
                    }).finally(function(){
                        self.pending = false;
                    });
            };

            // 投票
            self.vote = function(voteObj){
                AnswerService.vote(voteObj).then(function(r){
                    if(r){
                        console.log('投票成功');
                        // 投票成功后要更新answer的数据，更新界面
                        AnswerService.updateData(voteObj);
                    }else{
                        console.log('投票失败');
                    }
                },function(err){
                    console.log('network error');
                })

                ;
            }
        }])

        .controller('HomeController', ['$scope', 'TimelineService','AnswerService',
            function ($scope, TimelineService, AnswerService) {
                $scope.Timeline = TimelineService;
                TimelineService.getData();

                // 滚动加载数据
                var $win = $(window);
                var $doc = $(document);
                $win.on('scroll',function(){
                    if(($doc.height() - $win.height() - $win.scrollTop()) < 100){
                        TimelineService.getData();
                    }
                });

                // 监视每个answer数据，若发生变化自动更新界面
                // 对answer投票后该answer的数据会变
                $scope.$watch(function(){
                    return AnswerService.data;
                },function(new_data, old_data){
                    AnswerService.CountVoteForAnswers(AnswerService.data);
                },true);

        }])
})();
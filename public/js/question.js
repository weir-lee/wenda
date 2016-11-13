
// 问题模块
angular.module('app.question',[])

    .service('QuestServ', ['$http', '$state', function ($http, $state) {
        var self = this;
        self.newQuest = {};

        // 跳转到提问页面
        self.goAdd = function () {
            $state.go('question.add');
        };

        // 提问，添加问题
        self.AddQues = function () {
            $http.post('/api/question/add', self.newQuest).then(function (r) {
                if (r.data.status) {
                    self.newQuest = {};
                    //$state.go('home');
                    window.location.href = '/';
                }
            }, function (err) {

            });
        };

        self.read = function(params){
            var url = '/api/question/read?userId='+params.userId;
            return $http.get(url).then(function(r){
                return r.data;
            });
        }
    }])

    .controller('QuestionAddController', ['$scope',
        'QuestServ',
        function ($scope, QuestServ) {
            $scope.QuestServ = QuestServ;
        }
    ])

    .controller('QuestionDetailController',['$scope','$stateParams','QuestServ',
        function($scope,$stateParams,QuestServ){
            console.log($stateParams)
            $scope.Question = QuestServ;

    }])

;
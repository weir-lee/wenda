angular.module('app.answer', [])

.service('AnswerService',['$http', function($http){
        var self = this;
        // data属性用于存放页面上的answers和questions数据
        self.data = {};
        // 统计所有answer的票数
        self.CountVoteForAnswers = function(answers){
            for(var item of answers){

                // 没有questionId说明是问题，无需统计票数
                if(!item.questionId){
                    continue;
                }
                // votes是每个answer的投票信息，数组
                var votes = item.votes;
                // 判断一个answer是否被投票，若没有被投过票，则不统计
                if(!votes.length){
                    continue;
                }
                // 如果一个answer投过票，则统计票数
                //初始化每个answer的票数
                var up_count = 0;
                var down_count = 0;
                for(var vote of votes){
                    if(vote.vote_value == 1){
                        up_count++;
                    }
                    if(vote.vote_value == 2){
                        down_count++;
                    }
                }
                item.up_count = up_count;
                item.down_count = down_count;
            }

            return answers;
        };

        // 对某个answer投票
        self.vote = function(voteObj){
            if(!voteObj.id || !voteObj.vote_value){
                console.log('id and vote_value are required');
                return;
            }
            var url = '/api/vote/add?'+'&vote_value='+voteObj.vote_value+'&answerId='+voteObj.id;
            return $http.get(url).then(function(r){
                return  r.data.status==1;
            },function(){ return false;});
        };

        // 投票后更新对应的answer的数据
        self.updateData = function(voteObj){
            // 发送请求获取最新的answer投票数据,更新AnswerService里对应的那个answer
            $http.get('/api/answer/read?id='+voteObj.id).then(function(r){
                if(r.data.status == 1){
                    self.data = r.data.data;
                }
            },function(err){
                console.log('network error');
            });
        }
    }]);
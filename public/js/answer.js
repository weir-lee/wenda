angular.module('app.answer', [])

.service('AnswerService',[function(){
        var self = this;
        self.CountVoteForAnswers = function(answers){
            //console.log(answers);
            for(var item of answers){

                // 没有questionId说明是问题，无需统计票数
                if(!item.questionId){
                    continue;
                }
                //console.log(item)
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
            //console.log('answers',answers)
        }
    }]);
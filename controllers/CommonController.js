var co = require('co');
var pagination = require('../helper/pagination.js');

var CommonController = {};

// 时间线API：获取question和answer数据，合并到一起
CommonController.timeline = function (req, res, Question, Answer) {
    var skip = pagination(req).skip;
    var limit = pagination(req).limit;
    var resultArr = [];

    co(function *() {
        var questions = yield Question.findAll({
            attributes: ['id', 'title', 'desc', 'userId', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'desc']],
            offset: skip,
            limit: limit
        });

        for(var question of questions){
            var user = yield question.getUser();
            var temp = {};
            temp.id = question.id;
            temp.title = question.title;
            temp.desc = question.desc;
            temp.userId = question.userId;
            temp.createdAt = question.createdAt;
            temp.updatedAt = question.updatedAt;
            temp.username = user.username;
            resultArr.push(temp);
        }

        var answers = yield Answer.findAll({
            attributes: ['id', 'content', 'createdAt', 'updatedAt', 'userId', 'questionId'],
            order: [['createdAt', 'desc']],
            offset: skip,
            limit: limit
        });

        for(var answer of answers){
            var user = yield answer.getUser();
            var temp = {};
            temp.id = answer.id;
            temp.content = answer.content;
            temp.userId = answer.userId;
            temp.questionId = answer.questionId;
            temp.createdAt = answer.createdAt;
            temp.updatedAt = answer.updatedAt;
            temp.username = user.username;

            var votes = yield answer.getVotes();
            temp.votes = votes;
           resultArr.push(temp);
        }

        resultArr.sort(function(a,b){
            return b.createdAt-a.createdAt;
        });

        res.send({status:1, data:resultArr});

    });

};
module.exports = CommonController;


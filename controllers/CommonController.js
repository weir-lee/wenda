var pagination = require('../helper/pagination.js');

var CommonController = {};

// 时间线API：获取question和answer数据，合并到一起
CommonController.timeline = function (req, res, Question, Answer) {
    var skip = pagination(req).skip;
    var limit = pagination(req).limit;
    console.log("===========================");
    console.log(skip);
    console.log(limit);
    console.log("===========================");
    var resultArr = [];
    var qArr = [];
    var aArr = [];
    //var qAttr = ['id', 'title', 'desc', 'userId', 'createdAt', 'updatedAt']; //question的字段
    //var aAttr = ['id', 'content', 'createdAt', 'updatedAt', 'userId', 'questionId']; //answer的字段
    // 获取全部的questions
    Question.findAll({
        attributes: ['id', 'title', 'desc', 'userId', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'desc']],
        offset: skip,
        limit: limit
    }).then(function (questions) {
        var len = questions.length;
        //console.log("获取每页question的数目:");
        //console.log(len);
        (function iterator(i) {
            if (i == len) {

                // 获取全部answer
                Answer.findAll({
                    attributes: ['id', 'content', 'questionId', 'userId', 'createdAt', 'updatedAt'],
                    order: [['createdAt', 'desc']],
                    offset: skip,
                    limit: limit
                }).then(function (answers) {
                    var len = answers.length;

                    if(len == 0){
                        ////resultArr = qArr.concat(aArr);
                        //resultArr.sort(function (a, b) {
                        //    return (b.createdAt - a.createdAt);
                        //});
                        res.send({status: 1, data: qArr});
                        return;
                    }

                    //console.log(len);

                    (function iterator(j) {
                        if (j == len) {
                            resultArr = qArr.concat(aArr);
                            resultArr.sort(function (a, b) {
                                return (b.createdAt - a.createdAt);
                            });
                            res.send({status: 1, data: resultArr});
                            return;

                        }
                        var temp1 = {};
                        temp1.id = answers[j].id;
                        temp1.content = answers[j].content;
                        temp1.questionId = answers[j].questionId;
                        temp1.userId = answers[j].userId;
                        temp1.createdAt = answers[j].createdAt;
                        temp1.updatedAt = answers[j].updatedAt;
                        answers[j].getUser().then(function (user) {
                            temp1.username = user.username;
                            aArr[j] = temp1;
                            iterator(j + 1);
                        });
                    })(0);


                });
            }
            var temp = {};
            temp.id = questions[i].id;
            temp.title = questions[i].title;
            temp.desc = questions[i].desc;
            temp.userId = questions[i].userId;
            temp.createdAt = questions[i].createdAt;
            temp.updatedAt = questions[i].updatedAt;
            questions[i].getUser().then(function (user) {
                temp.username = user.username;
                qArr[i] = temp;
                //console.log(qArr[i]);
                iterator(i + 1);
            });
        })(0);

    });
};
module.exports = CommonController;


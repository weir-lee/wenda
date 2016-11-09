var pagination = require('../helper/pagination.js');

var CommonController = {};

// 时间线API：获取question和answer数据，合并到一起
CommonController.timeline = function(req,res,Question,Answer){
    var skip = pagination(req).skip;
    var limit = pagination(req).limit;
    var resultArr = [];
    // 获取全部的questions
    Question.findAll({
        offset: skip,
        limit: limit,
        attributes: ['id','title','desc','userId','createdAt','updatedAt'],
        order: [['createdAt','desc']]
    }).then(function(questions){
        resultArr = questions;
    });

    // 获取全部answer
    Answer.findAll({
        offset: skip,
        limit: limit,
        order:  [['createdAt','desc']]
    }).then(function(answers){
        resultArr = resultArr.concat(answers);
        resultArr.sort(function(a,b){
            return (b.createdAt - a.createdAt);
        });
        res.send({status:1, data:resultArr});
    }).catch(function(err){
        res.send({status:0, msg:'system err.'});
    });
};

module.exports = CommonController;


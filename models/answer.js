var Answer = require('./models.js').Answer;
var getPost = require('../helper/getPost.js');


/************Answer API 需要重构*******************************/
/************Answer API 需要重构*******************************/
/************Answer API 需要重构*******************************/

/************** Answer API *************************/
Answer.add = function (req, res, Question) {
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login is required'});
        return;
    }
    // 获取post参数
    getPost(req).then(function (fields) {
        // 判断是否传入questionId和content
        if (!fields.questionId || !fields.content) {
            res.send({status: 0, msg: 'questionId and content are required'});
            return;
        }

        // 判断questionId的问题是否存在
        Question.findById(fields.questionId).then(function (question) {
            if (!question) {
                res.send({status: 0, msg: 'question dose not exist'});
                return;
            }
            // 该用户是否回答过该问题
            Answer.findOne({
                where: {
                    questionId: fields.questionId,
                    userId: req.session.user_id
                }
            }).then(function (answer) {
                if (answer) {
                    res.send({status: 0, msg: '您已经回答过该问题'});
                    return;
                }
                // 没有回答过，则存入数据库
                Answer.create({
                    content: fields.content,
                    questionId: fields.questionId,
                    userId: req.session.user_id
                }).then(function (answer) {
                    res.send({status: 1, msg: 'answer inserts into db successfully'});
                }).catch(function (err) {
                    console.log(err);
                    res.send({status: 0, msg: 'answer inserts into db failed'});
                });
            });
        });
    });
};

Answer.change = function (req, res) {
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login is required'});
        return;
    }
    // 获取post参数
    getPost(req).then(function (fields) {
        // 判断是否传入questionId和content
        if (!fields.id || !fields.content) {
            res.send({status: 0, msg: 'id and content are required'});
            return;
        }
        // 找到这条answer
        Answer.findById(fields.id).then(function (answer) {
            if (!answer) {
                res.send({status: 0, msg: 'answer does not exist'});
                return;
            }
            // 判断回答者是否为该登录用户
            if (answer.userId != req.session.user_id) {
                res.send({status: 0, msg: 'permission is denied'});
                return;
            }
            // 更新answer，保存
            answer.update({
                content: fields.content
            }).then(function (result) {
                res.send({status: 1, msg: 'answer updates ok'});
            }).catch(function (err) {
                res.send({status: 0, msg: 'answer updates failed'});
            });
        }).catch(function (err) {
            res.send({status: 0, msg: 'answer updates failed'});
        });
    })
};

// 查看answer API
Answer.read = function (req, res) {
    // 检验是否传入 answerId 或者 questionId
    console.log(req.query.id)
    if (!req.query.id && !req.query.questionId) {
        res.send({status: 0, msg: 'id or questionId is required'});
        return;
    }
    // 如果传入的是id，则查找这条answer
    if (req.query.id) {
        Answer.findById(req.query.id).then(function (answer) {
            if (!answer) {
                res.send({status: 0, msg: 'answer does not exist'});
                return;
            }
            res.send({status: 1, data: answer});
        });
    }
    // 如果传入的是questionId，则查找对应question的所有answer
    if (req.query.questionId) {
        Answer.findAll({where: {questionId: req.query.questionId}}).then(function (answers) {
            res.send({status:1, data:answers});
        })
    }
};

module.exports = Answer;
var Comment = require('./models.js').Comment;

var getPost = require('../helper/getPost.js');

/******************* Comment API *************************/
// 添加评论API
Comment.add = function (req, res, Question, Answer) {
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login is required'});
        return;
    }
    getPost(req).then(function (fields) {
        if (!fields.content) {
            res.send({status: 0, msg: 'content is required'});
            return;
        }

        if ((!fields.questionId && !fields.answerId) ||
            (fields.questionId && fields.answerId)) {
            res.send({status: 0, msg: 'questionId or answerId is required'});
            return;
        }

        // 评论问题
        if (fields.questionId) {
            Question.findById(fields.questionId).then(function (question) {
                if (!question) {
                    res.send({status: 0, msg: 'question does not exist'});
                    return;
                }

                if (fields.commentId) {
                    Comment.findById(fields.commentId).then(function (comment) {
                        if (!comment) {
                            res.send({status: 0, msg: 'target comment does not exist'});
                            return;
                        }
                        // 检查是否在评论自己
                        if (comment.userId == req.session.user_id) {
                            res.send({status: 0, msg: '不能评论自己'});
                            return;
                        }
                        Comment.create({
                            content: fields.content,
                            userId: req.session.user_id,
                            questionId: fields.questionId,
                            commentId: fields.commentId
                        }).then(function (comment) {
                            if (comment) {
                                res.send({status: 1, id: comment.id});
                                return;
                            }
                        }).catch(function (err) {
                            res.send({status: 0, msg: 'comment inserts failed'});
                            return;
                        });
                    })
                } else {
                    Comment.create({
                        content: fields.content,
                        userId: req.session.user_id,
                        questionId: fields.questionId
                    }).then(function (comment) {
                        if (comment) {
                            res.send({status: 1, id: comment.id});
                            return;
                        }
                    }).catch(function (err) {
                        res.send({status: 0, msg: 'comment inserts failed'});
                        return;
                    });
                }
            })
        } else
        // 评论答案
        {
            Answer.findById(fields.answerId).then(function (answer) {
                if (!answer) {
                    res.send({status: 0, msg: 'answer does not exist'});
                    return;
                }

                if (fields.commentId) {
                    // 检查目标评论是否存在
                    Comment.findById(fields.commentId).then(function (comment) {
                        if (!comment) {
                            res.send({status: 0, msg: 'target comment does not exist'});
                            return;
                        }

                        // 检查是否在评论自己
                        if (comment.userId == req.session.user_id) {
                            res.send({status: 0, msg: '不能评论自己'});
                            return;
                        }

                        // 没有评论自己则保存
                        Comment.create({
                            content: fields.content,
                            userId: req.session.user_id,
                            answerId: fields.answerId,
                            commentId: fields.commentId
                        }).then(function (comment) {
                            if (comment) {
                                res.send({status: 1, id: comment.id});
                                return;
                            }
                        }).catch(function (err) {
                            res.send({status: 0, msg: 'comment inserts failed'});
                            return;
                        });
                    });
                } else {
                    Comment.create({
                        content: fields.content,
                        userId: req.session.user_id,
                        answerId: fields.answerId
                    }).then(function (comment) {
                        if (comment) {
                            res.send({status: 1, id: comment.id});
                            return;
                        }
                    }).catch(function (err) {
                        res.send({status: 0, msg: 'comment inserts failed'});
                        return;
                    });
                }
            })
        }

    });
};

// 查看评论API
Comment.read = function(req,res,Question,Answer){
//判断是否传入questionId或者answerId
    if(!req.query.questionId && !req.query.answerId){
        res.send({status: 0, msg: 'questionId or answerId is required'});
        return;
    }

    // 若传入questionId
    if(req.query.questionId){
        // 检验问题是否存在
        Question.findById(req.query.questionId).then(function(question){
            if(!question){
                res.send({status: 0, msg: 'question does not exist'});
                return;
            }
            // 若问题存在,则把返回该问题的所有评论
            Comment.findAll({where:{questionId:req.query.questionId}}).then(function(comments){
                res.send({status:1, data:comments})
            });
        });
    }

    // 若传入answerId
    if(req.query.answerId){
        // 检验answer是否存在
        Answer.findById(req.query.answerId).then(function(answer){
            if(!answer){
                res.send({status: 0, msg: 'answer does not exist'});
                return;
            }
            // 若answer存在,则把返回该answer的所有评论
            Comment.findAll({where:{answerId:req.query.answerId}}).then(function(comments){
                res.send({status:1, data:comments})
            });
        });
    }
};

// 删除评论API
Comment.remove = function(req,res){
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login is required'});
        return;
    }
    // 判断是否传入id
    if(!req.query.id){
        res.send({status: 0, msg: 'id is required'});
        return;
    }
    // 获取该评论
    Comment.findById(req.query.id).then(function(comment){
        // 判断是否有该评论
        if(!comment){
            res.send({status: 0, msg: 'this comment does not exist'});
            return;
        }

        // 判断是否为评论所有者
        if(comment.userId != req.session.user_id){
            res.send({status: 0, msg: 'permission denied'});
            return;
        }

        // 先删除此评论下的所有回复，再删除该评论
        Comment.destroy({
            where: {
                commentId: req.query.id
            }
        }).then(function(){
            comment.destroy().then(function(result){
                res.send({status:1, msg:'remove comment ok'})
            }).catch(function(err){
                res.send({status:0, msg:'db delete failed'})
            })
        });

    });

};


module.exports = Comment;
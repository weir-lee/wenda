var Question = require('./models.js').Question;
var getPost = require('../helper/getPost.js');
var co = require('co');

/************Question API***************/

// 提问
Question.add = function (req, res) {
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login required'});
        return;
    }
    // 若登录，则判断是否有标题
    getPost(req).then(function (fields) {
        if (!fields.title) {
            res.send({status: 0, msg: 'title required'});
            return;
        }
        // 把问题保存到数据库
        Question.create({
            title: fields.title,
            desc: fields.desc,
            userId: req.session.user_id
        }).then(function (result) {
            res.send({status: 1, msg: 'insert question successfully!'});
        }).catch(function (err) {
            console.log(err);
            res.send({status: 0, msg: 'question inserts into db failed'});
        })
    });


};

// 修改问题API
Question.change = function (req, res) {
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login required'});
        return;
    }

    getPost(req).then(function (fields) {
        // 是否传入 questionId
        if (!fields.id) {
            res.send({status: 0, msg: 'id required'});
            return;
        }
        // 是否传入问题标题
        if (!fields.title) {
            res.send({status: 0, msg: 'title required'});
            return;
        }
        // 该问题是否存在
        Question.findOne({
            where: {id: fields.id}
        }).then(function (question) {
            if (!question) {
                res.send({status: 0, msg: '该问题不存在'});
                return;
            }
            // 问题存在则更新数据库
            var item = {};
            item.title = fields.title;
            if (fields.desc) {
                item.desc = fields.desc;
            }
            Question.update(item, {
                where: {
                    id: fields.id
                }
            }).then(function (result) {
                res.send({status:1, msg:'question updates successfully'});
            }).catch(function (err) {
                console.log(err);
                res.send({status:0, msg:'system error! question updates failed'});
                return;
            })
        });

    });

};

// 查看问题API;
Question.read = function(req,res,User){
    co(function *(){
        // 传入的是问题的id
        if(req.query.id){
            var id = parseInt(req.query.id);
            Question.findById(id).then(function(question){
                if(!question){
                    res.send({status:0, msg:'question does not exist'});
                }else{
                    res.send({status:1, data:question});
                }
            });
        }

        // 传入的是userId
        else if(req.query.userId){
            var userId;
            if(req.query.userId == 'self'){
                if(!req.session.login){
                    res.send({status:0, msg:'login required'});
                    return;
                }
                userId = req.session.user_id;
            }else{
                userId = req.query.userId;
            }
            var user = yield User.findById(userId);
            var questions = yield user.getQuestions();
            res.send({status:1, data:questions});
        }

        else{
            // 没有传任何参数
            var limit = req.query.limit ? parseInt(req.query.limit):15;
            var skip = req.query.page ? (req.query.page-1)*limit:0;

            Question.findAll({
                offset: skip,
                limit: limit,
                attributes: ['id','title','desc','userId','createdAt','updatedAt'],
                order:  [['createdAt','desc']]
            }).then(function(result){
                res.send(result);
            }).catch(function (err) {
                console.log(err);
                res.send({status:0, msg:'system error! read question failed'});
            })
        }
    });
};

// 删除问题API
Question.remove = function(req,res){
    // 判断用户是否登陆
    if(!req.session.login){
        res.send({status:0, msg:'login is required'});
        return;
    }

    // 检查是否传入问题id
    if(!req.query.id){
        res.send({status:0, msg:'id is required'});
        return;
    }

    // 检查问题是否存在
    Question.findOne({where:{id:req.query.id}}).then(function(question){
        // 问题不存在
        if(!question){
            res.send({status:0, msg:'question does not exist'});
            return;
        }
        // 检查登陆者是否为问题所有者
        if(req.session.user_id != question.userId){
            res.send({status:0, msg:'perssion is denied'});
            return;
        }

        // 删除问题
        question.destroy().then(function(result){
            if(result){
                res.send({status:1, msg:'delete question successfully'});
                return
            }
        }).catch(function (err) {
            console.log(err);
            res.send({status: 0, msg: ' delete failed'});
            return;
        })
    });
};

Question.test = function(req,res){
    var arr = [];

    Question.findAll().then(function(questions){
        console.log(questions.length);
        for(var i=0; i<questions.length; i++){
            questions[i].getUser().then(function(user){
               // console.log(user);
                var temp = {};
                temp.id = questions[i].id;
                temp.title = questions[i].title;
                temp.desc = questions[i].desc;
                temp.userId = questions[i].userId;
                temp.createdAt = questions[i].createdAt;
                temp.updatedAt = questions[i].updatedAt;
                temp.username = user.username;
                console.log(temp);
                arr.push(temp);
            });
        }
    });

    //console.log(arr);
    res.send(arr)
};

module.exports = Question;
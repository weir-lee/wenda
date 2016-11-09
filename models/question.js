var Question = require('./models.js').Question;
var getPost = require('../helper/getPost.js');

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
Question.read = function(req,res){
    if(req.query.id){
        Question.findById(id).then(function(question){
            res.send({status:1, data:question});
                return;
        });
    }

    var limit = req.query.limit ? parseInt(req.query.limit):15;
    var skip = req.query.page ? (req.query.page-1)*limit:0;
    console.log(limit,skip)
    Question.findAll({
        offset: skip,
        limit: limit,
        attributes: ['id','title','desc','userId','createdAt','updatedAt'],
        order:  [['createdAt','desc']]
        //keyBy: 'id'
    }).then(function(result){
        res.send(result);
        return;
    }).catch(function (err) {
        console.log(err);
        res.send({status:0, msg:'system error! read question failed'});
        return;
    })
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

module.exports = Question;
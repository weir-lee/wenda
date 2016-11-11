var Vote = require('./models.js').Vote;

/***************Vote API**************************/
Vote.add = function (req, res, Answer) {
    // 判断用户是否登录
    if (!req.session.login) {
        res.send({status: 0, msg: 'login required'});
        return;
    }

    // 判断是否传入 answerId 和 vote_value: (对哪个问题投票，投的什么票)
    if (!req.query.answerId || !req.query.vote_value) {
        res.send({status: 0, msg: 'answerId and vote_value are required'});
        return;
    }

    // 判断对应的answer是否存在
    Answer.findById(parseInt(req.query.answerId)).then(function (answer) {
        // answer不存在，则返回提示
        if (!answer) {
            res.send({status: 0, msg: 'The answer does not exist.'});
            return;
        }

        // answer存在，则查该用户是否已经投过票.若没有投过票，则直接插入一条记录。
        // 若投过票，则比较上次的投票和此次是否一致
        // 若一致，则删除数据库的投票记录。
        // （因为一个用户对一个回答只能赞、只能踩或不赞不踩，不能同时赞和踩，若已赞或已踩，再点赞或踩，则取消赞或踩）
        // 若不一致，则更新数据库的投票记录
        Vote.findOne({where:{answerId:req.query.answerId, userId:req.session.user_id}}).then(function (vote) {
            // 没有投过票，则向数据库插入一条记录
            if(!vote){
                Vote.create({
                    answerId: req.query.answerId,
                    userId: req.session.user_id,
                    vote_value: req.query.vote_value
                }).then(function(v){
                    res.send({status:1, msg:'vote successfully'});
                }).catch(function(err){
                    console.log(err);
                    res.send({status:0, msg:'insert db error'});
                });
            }

            // 若投过票，则比较此次投票与上次的是否一样
            if(vote.vote_value == req.query.vote_value){
                // 投票一样，则删除数据库的投票记录
                vote.destroy().then(function(){
                    res.send({status:1, msg:'vote successfully'});
                }).catch(function(err){
                    console.log(err);
                    res.send({status:0, msg:'insert db error'});
                });
            }else{
                // 投票不一样，则修改投票记录
                vote.update({vote_value: req.query.vote_value}).then(function(){
                    res.send({status:1, msg:'vote successfully'});
                }).catch(function(err){
                    console.log(err);
                    res.send({status:0, msg:'insert db error'});
                });
            }
        });
    });

};


module.exports = Vote;
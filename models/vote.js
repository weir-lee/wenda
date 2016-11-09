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

        // answer存在，则查该用户是否已经投过票
        // 若投过票，则删除以前的投票记录，再添加新的投票记录
        // 若没有投过，则直接添加一条投票记录
        // 该操作可以简化为，无论是否投过票，都去数据库删除，再添加新的投票记录。
        // 在没有投票的情况下，去vote表删除不会报错，找不到对应的记录会返回删除0条记录，找不到就不做删除操作。
        Vote.findAll({where: {answerId: req.query.answerId}}).then(function (voteArr) {
            /*var is_voted = false;
            var len = voteArr.length;
            console.log(voteArr)
            for (var i = 0; i < len; i++) {
                // 该用户投过票
                if (voteArr[i].userId == parseInt(req.session.user_id)) {
                    is_voted = true;
                    break;
                }
            }
            console.log('is_voted',is_voted);*/

            Vote.destroy({
                where: {answerId: req.query.answerId, userId: req.session.user_id}})
            .then(function (result) {
                    // 返回的 result 是删除记录的条数
                    Vote.create({
                        userId: req.session.user_id,
                        answerId: req.query.answerId,
                        vote_value: req.query.vote_value
                    }).then(function(vote){
                        res.send({status:1, msg:'vote success'});
                    });
            })
        });
    });

};


module.exports = Vote;
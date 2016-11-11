var User = require('./models.js').User;
var getPost = require('../helper/getPost.js');
/*********User API ---- 分割线********************/
function hasUsernameAndPassword(fields){
    if(!(fields.username && fields.password)){
        return false;
    }
    return {username: fields.username, password: fields.password};
}

// 注册api
User.signup = function (req, res) {
    // 检验是否传入用户名和密码
    var check;
    getPost(req).then(function(fields){
        check = hasUsernameAndPassword(fields);
        if (!check) {
            res.send({status: 0, msg: '用户名或密码不能为空'});
        }else{
            // 检验用户名是否存在
            User.findOne({
                where: {
                    username: check.username
                }
            }).then(function (user) {
                // 如果用户名不存在，则存入数据库
                if (!user) {
                    User.create({username: check.username, password: check.password}).then(function(save){
                        if (save.username) {
                            // 保存成功
                            // 保存session
                            req.session.login = true;
                            req.session.user_id = save.id;
                            req.session.username = save.username;
                            res.send({status: 1, msg: 'signup success'});
                        } else {
                            // 保存失败
                            res.send({status: 0, msg: 'db insert failed'});
                        }
                    });
                } else {
                    // 用户名存在
                    res.send({status: 0, msg: 'username already exists'});
                }
            });
        }
    });
};

// 登录API
User.login = function(req,res){
// 检验是否传入用户名和密码
    var check;
    getPost(req).then(function(fields){
        check = hasUsernameAndPassword(fields);
        if (!check) {
            res.send({status: 0, msg: '用户名或密码不能为空'});
        }else{
            // 检验用户名是否存在
            User.findOne({
                where:{
                    username: check.username
                }
            }).then(function(user){
                // 检验密码是否正确
                if(user){
                    if(user.password == check.password){
                        req.session.login = true;
                        req.session.user_id = user.id;
                        req.session.username = user.username;
                        res.render('');
                    }else{
                        res.send({status:0, msg:'密码错误'});
                    }
                }else{
                    res.send({status:0, msg:'用户名不存在'});
                }
            });
        }
    });
};

// 是否登录
User.is_logged_in = function(req){
    return req.session.login ? req.session.user_id.toString():false;
};

// 用户名是否存在API
User.usernameExist = function(req,res){
    getPost(req).then(function(fields){
        if(!fields.username){
            res.send({status:0, msg:'username is required'});
            return;
        }

        User.findOne({where:{username:fields.username}}).then(function(user){
            if(user){
                res.send({status:1, valid:false ,msg:'用户名已存在'});
                return;
            }
            res.send({status:1, valid:true, msg:'用户名有效'});
        }).catch(function(err){
            res.send({status:0, msg:'system error'});
        });
    });
};

// 登出api
User.logout = function(req,res){
    req.session.login = false;
    req.session.user_id = '';
    req.session.username = '';
    res.redirect('/');
};

// 修改密码API
User.changePassword = function(req,res){
    if(!req.session.login){
        res.send({status:0, msg:'login required'});
        return;
    }
  getPost(req).then(function(fields){
     if(!fields.old_password || !fields.new_password) {
         res.send({status:0, msg:'old password and new password are required'});
         return;
     }

      User.findById(req.session.user_id).then(function(user){
          if(user.password != fields.old_password){
              res.send({status:0, msg:'invalid old password'});
              return;
          }
          user.update({
              password: fields.new_password
          }).then(function(user){
              res.send({status:1, msg:'change password successfully'});
              return;
          }).catch(function(err){
              res.send({status:0, msg:'system error. change password failed.'});
              return;
          });
      });

  });
};

// 通过手机验证码找回密码，下发验证码
User.resetPassword = function(req,res){
    // 判断是否是机器人，是则返回
    if(is_robot(req, 2)){
        res.send({status:0, msg:'max frequency reached'});
        return;
    }

    getPost(req).then(function(fields){
        // 验证是否传入手机号
        if(!fields.phone){
            res.send({status:0, msg:'phone is required'});
            return;
        }

        // 验证手机号是否保存在数据库
        User.findOne({where:{phone:fields.phone}}).then(function(user){
            if(!user){
                res.send({status:0, msg:'invalid phone'});
                return;
            }

            // 手机号存在，则生成验证码
            var phone_capture = generate_capture();
            // 验证码保存到数据库后，使用第三方接口下发验证码
            user.phone_capture = phone_capture;
            user.save().then(function(){
                req.session.last_time = +new Date();
                send_sms(phone_capture);
            }).catch(function(err){
                res.send({status:0, msg:'save db failed'});
                return;
            });
        })
    });

};

function generate_capture(){
    // 生成4位数字验证码
    return parseInt(Math.random()*10000);
}

// 第三方下发验证码的接口
function send_sms(phone_capture){
    return true;
}

// 检验是否是机器人
function is_robot(req, second){
    // 如果session中没有时间记录，说明从未调用过接口
    if(!req.session.last_time){
        return false;
    }
    var cur_time = +new Date();
    // 两次发送的时间小于10秒，则被认为是机器人
    var second = second ? second:10;
    return (cur_time-req.session.last_time) < 1000*second;
}

// 验证验证码，重置密码
User.validate_reset_password = function(req,res){
    // 判断是否是机器人，是则返回
    if(is_robot(req, 10)){
        res.send({status:0, msg:'max frequency reached'});
        return;
    }

    getPost(req).then(function(fields) {
        // 验证是否传入手机号、验证码和新密码
        if (!fields.phone || !fields.phone_capture || !fields.new_password) {
            res.send({status: 0, msg: 'phone, phone_capture and new_password are required'});
            return;
        }

        User.findOne({where: {phone: fields.phone, phone_capture: fields.phone_capture}})
            .then(function (user) {
                if (!user) {
                    res.send({status: 0, msg: 'invalid phone or phone_capture'});
                    return;
                }
                user.update({password: fields.new_passwrod}).then(function (result) {
                    req.session.last_time = +new Date();
                    res.send({status: 1, msg: 'reset password ok'});
                }).catch(function (err) {
                    res.send({status: 0, msg: 'Update new_password failed'});
                });
            }).catch(function (err) {
                res.send({status: 0, msg: 'db failed'});
            });
    });
};

// 获取用户信息API
User.read = function(req, res){
    if(!req.query.id){
        res.send({status: 0, msg: 'id is required'});
        return;
    }
    var data = {};
    User.findOne({
        where:{id:req.query.id},
        attributes: ['id','username','avatar_url']
    }).then(function(user){
        if(!user){
            res.send({status: 0, msg: 'invalid id'});
            return;
        }

        data['id'] = user.id;
        data['username'] = user.username;
        data['avatar_url'] = user.avatar_url;

        user.getQuestions().then(function(questions){
            data.questionsCount = questions.length;

        });

        user.getAnswers().then(function(answers){
            data.answersCount = answers.length;
            res.send({'status':1, 'data':data});
        });
    });

};


module.exports = User;

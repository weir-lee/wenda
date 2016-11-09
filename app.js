var express = require('express');
var app = express();
var session = require('express-session');
var User = require('./models/user.js');
var Question = require('./models/question.js');
var Answer = require('./models/answer.js');
var Comment = require('./models/comment.js');
var Vote = require('./models/vote.js');
var CommonController = require('./controllers/CommonController.js');

//设置后台模板
app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/api/signup', function(req,res){
    User.signup(req,res);
});

app.post('/api/login', function(req,res){
    User.login(req,res);
});

app.get('/api/logout', function(req,res){
    User.logout(req,res);
});

app.post('/api/change_password', function(req,res){
    User.changePassword(req,res);
});

app.post('/api/reset_password', function(req,res){
    User.resetPassword(req,res);
});

app.get('/api/user/read', function(req,res){
    User.read(req,res);
});

app.post('/api/question/add', function(req,res){
    Question.add(req,res);
});

app.post('/api/question/change', function(req,res){
    Question.change(req,res);
});

app.get('/api/question/read', function(req,res){
    Question.read(req,res);
});

app.get('/api/question/remove', function(req,res){
    Question.remove(req,res);
});

app.post('/api/answer/add', function(req,res){
    Answer.add(req,res,Question);
});

app.post('/api/answer/change', function(req,res){
    Answer.change(req,res);
});

app.get('/api/answer/read', function(req,res){
    Answer.read(req,res);
});

app.post('/api/comment/add', function(req,res){
    Comment.add(req,res,Question,Answer);
});

app.get('/api/comment/read', function(req,res){
    Comment.read(req,res,Question,Answer);
});

app.get('/api/comment/remove', function(req,res){
    Comment.remove(req,res,Question,Answer);
});

app.get('/api/vote/add', function(req,res){
    Vote.add(req,res,Answer);
});

app.get('/api/timeline', function(req,res){
    CommonController.timeline(req,res,Question,Answer);
});


app.listen(3000);
'use strict';
var co = require('co');
var Question = require('./models/question.js');
var Answer = require('./models/answer.js');

/*
co(function *(){
    // resolve multiple promises in parallel
    var a = Promise.resolve(1);
    var b = Promise.resolve(2);
    var c = Promise.resolve(3);
    var res = yield [a, b, c];
    console.log(res);
    // => [1, 2, 3]
}).catch(onerror);

function onerror(err) {
    console.error(err.stack);
}
*/

var resultArr = [];

co(function *() {


    var questions = yield Question.findAll({
        attributes: ['id', 'title', 'desc', 'userId', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'desc']]
    });

    for(var question of questions){
        var user = yield question.getUser();
        var temp = {};
        temp.id = question.id;
        temp.title = question.title;
        temp.desc = question.desc;
        temp.userId = question.userId;
        temp.createdAt = question.createdAt;
        temp.updatedAt = question.updatedAt;
        temp.username = user.username;
        resultArr.push(temp);
    }

    var answers = yield Answer.findAll({
        attributes: ['id', 'content', 'createdAt', 'updatedAt', 'userId', 'questionId'],
        order: [['createdAt', 'desc']]
    });

    for(var answer of answers){
        var user = yield answer.getUser();
        var temp = {};
        temp.id = answer.id;
        temp.content = answer.content;
        temp.userId = answer.userId;
        temp.questionId = answer.questionId;
        temp.createdAt = answer.createdAt;
        temp.updatedAt = answer.updatedAt;
        temp.username = user.username;
        resultArr.push(temp);
    }

    resultArr.sort(function(a,b){
        return b.createdAt-a.createdAt;
    });

});



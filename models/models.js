var Sequelize = require('sequelize');
var sequelize = new Sequelize('xiaohu', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql'
});
//==============================================================
//==============================================================
//==============================================================
var User = sequelize.define('user', {
        username: {type: Sequelize.STRING, allowNull: false},
        password: {type: Sequelize.STRING, allowNull: false},
        intro: {type: Sequelize.STRING, allowNull: true},
        email: {type: Sequelize.STRING, allowNull: true},
        phone: {type: Sequelize.STRING, allowNull: true},
        phone_capture: {type: Sequelize.STRING, allowNull: true},
        avatar_url: {type: Sequelize.STRING, allowNull: true}
    }, {
        timestamps: true
    }
);
//==============================================================
//==============================================================
//==============================================================

var Answer = sequelize.define('answer', {
        content: {type: Sequelize.TEXT, allowNull: false}
    }, {timestamps: true}
);
//==============================================================
//==============================================================
//==============================================================

var Comment = sequelize.define('comment', {
        content: {type: Sequelize.TEXT, allowNull: false}
    }, {timestamps: true}
);
//==============================================================
//==============================================================
//==============================================================
var Question = sequelize.define('question', {
        title: {type: Sequelize.STRING, allowNull: false},
        desc: {type: Sequelize.TEXT, allowNull: true},
        status: {type: Sequelize.STRING, defaultValue: 'ok'}
    }, {timestamps: true}
);
//==============================================================
//==============================================================
//==============================================================
var Vote = sequelize.define('vote', {
        vote_value: {type: Sequelize.INTEGER, allowNull: false}
    }, {timestamps: true}
);
//==============================================================
//==============================================================
//==============================================================

//User与Question 1对多
User.hasMany(Question, {as: 'questions'});
Question.belongsTo(User, {as: 'user'});

//User与Answer 1对多
User.hasMany(Answer, {as: 'answers'});
Answer.belongsTo(User,{as: 'user'});

//User与Comment 1对多
User.hasMany(Comment, {as: 'comments'});

// Question 与 Answer 一对多
Question.hasMany(Answer, {as: 'answers'});
Answer.belongsTo(Question, {as: 'question'});

//Question 与 Comment  一对多
Question.hasMany(Comment, {as: 'comments'});

//Answer与Comment 一对多
Answer.hasMany(Comment, {as: 'comments'});

// Comment与Comment 一对多
Comment.hasMany(Comment, {as: 'comments'});

// User与Vote  一对多
User.hasMany(Vote, {as:'votes'});

// Answer与Vote  一对多
Answer.hasMany(Vote, {as:'votes'});

sequelize.sync();


module.exports = {
    'User':User,
    'Question':Question,
    'Answer':Answer,
    'Comment':Comment,
    'Vote':Vote
};


var crypto = require('crypto');

module.exports = function(mingma){
    var md5 = crypto.createHash('md5');
    var mima = md5.update(mingma).digest('base64');
    return mima;
};

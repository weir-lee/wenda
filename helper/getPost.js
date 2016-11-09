var Q = require('q');
var formidable = require('formidable');

// 该模块的功能： 获取post请求，promise方式
function getPost(req){
    var deferred = Q.defer();
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if(err){
            deferred.reject(err);
        }else{

            deferred.resolve(fields);
        }
    });
    return deferred.promise;
}

module.exports = getPost;
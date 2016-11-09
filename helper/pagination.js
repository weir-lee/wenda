
function pagination(req){
    var limit = req.query.limit ? parseInt(req.query.limit):2;
    var skip = req.query.page ? (req.query.page-1)*limit:0;
    return {
        limit: limit,
        skip: skip
    };
}

module.exports = pagination;
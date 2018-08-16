const response = require('../../utils/response');

exports.handle = function (e, ctx, cb) {
    response.end(cb, 200, { e: e, ctx: ctx }, null);
};
const response = require('./response.js');

exports.check_parent_exist = function (parent_id, conn, cb, callback) {
    let sql = `SELECT parent_id FROM Parent WHERE parent_id = '${parent_id}'`;

    conn.query(sql, [], function (err, results, fields) {
        if (err) {
            response.end(cb, 500, err, conn);
            return;
        }

        if (results.length === 0) {
            response.end(cb, 404, null, conn);
        } else {
            callback();
        }
    });
};
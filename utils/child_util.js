const response = require('./response.js');

exports.check_child_exist = function (child_id, conn, cb, callback) {
    let sql = 'SELECT child_id FROM Child WHERE child_id = \'{}\'';
    sql = sql.format(child_id);

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
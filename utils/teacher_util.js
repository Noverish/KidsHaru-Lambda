const response = require('./response.js');

exports.check_teacher_exist = function (teacher_id, conn, cb, callback) {
    let sql = 'SELECT teacher_id FROM Teacher WHERE teacher_id = \'{}\'';
    sql = sql.format(teacher_id);

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
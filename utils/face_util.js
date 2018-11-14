const response = require('./response.js');

exports.check_face_exist = function (face_id, conn, cb, callback) {
    let sql = `SELECT face_id FROM Face WHERE face_id = '${face_id}'`;

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
const response = require('./response.js');

exports.check_face_exist = function (album_id, picture_id, child_id, conn, cb, callback) {
    let sql =
        'SELECT album_id, picture_id, child_id FROM Face ' +
        'WHERE album_id = \'{}\' AND picture_id = \'{}\' AND child_id = \'{}\'';
    sql = sql.format(album_id, picture_id, child_id);

    conn.query(sql, [], function (err, results, fields) {
        if (err) {
            response.end(cb, 500, err, conn);
            return;
        }

        if (results.length === 0) {
            callback(false);
        } else {
            callback(true);
        }
    });
};
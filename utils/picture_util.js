const album_util = require('./album_util.js');
const response = require('./response.js');

exports.process_picture_list = function (picture_list) {
    for (let i = 0; i < picture_list.length; i++) {
        picture_list[i] = exports.process_picture(picture_list[i]);
    }

    return picture_list;
};

exports.process_picture = function (picture) {
    picture.picture_url = album_util.album_bucket_path + '/' + picture['album_id'] + '/' + picture['file_name'];

    delete picture.name;

    return picture;
};

exports.check_picture_exist = function (album_id, picture_id, conn, cb, callback) {
    let sql =
        'SELECT album_id, picture_id FROM Picture ' +
        'WHERE album_id = \'{}\' AND picture_id = \'{}\'';
    sql = sql.format(album_id, picture_id);

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
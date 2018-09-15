const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const picture_util = require('../../utils/picture_util.js');
const teacher_util = require('../../utils/teacher_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['teacher_id']);
    if (params == null)
        return;

    teacher_util.check_teacher_exist(params['teacher_id'], conn, cb, function () {
        get();
    });

    function get() {
        let sql =
            'SELECT Album.* FROM Teacher_Album ' +
            'INNER JOIN Album ON Teacher_Album.album_id = Album.album_id ' +
            'WHERE Teacher_Album.teacher_id = \'{teacher_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let album_list = album_util.process_album_list(results);
            picture_list(album_list);
        });
    }

    function picture_list(album_list) {
        let sql=
            'SELECT Album.album_id, Picture.file_name FROM Teacher_Album ' +
            'INNER JOIN Album ON Teacher_Album.album_id = Album.album_id ' +
            'INNER JOIN Picture ON Album.album_id = Picture.album_id ' +
            'WHERE Teacher_Album.teacher_id = \'{teacher_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let picture_list = picture_util.process_picture_list(results);
            combine(album_list, picture_list);
        });
    }

    function combine(album_list, picture_list) {
        for (let i = 0; i < album_list.length; i++) {
            const album = album_list[i];

            album_list[i]['pictures'] = picture_list
                .filter((value, index, array) => {
                    return value['album_id'] === album['album_id']
                })
                .map((value, index) => {
                    return value['picture_url']
                });
        }

        response.end(cb, 200, album_list, conn);
    }
};
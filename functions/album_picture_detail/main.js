const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const picture_util = require('../../utils/picture_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id', 'picture_id']);
    if (params == null)
        return;

    get_picture();

    function get_picture() {
        let sql = 'SELECT * FROM Picture WHERE album_id = \'{album_id}\' AND picture_id = \'{picture_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let picture = picture_util.process_picture(results[0]);
            get_face_list(picture);
        });
    }

    function get_face_list(picture) {
        let sql = 'SELECT * FROM Face WHERE album_id = \'{album_id}\' AND picture_id = \'{picture_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            picture.faces = results;
            response.end(cb, 200, picture, conn);
        });
    }
};
const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const picture_util = require('../../utils/picture_util.js');
const face_util = require('../../utils/face_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id', 'picture_id', 'child_id', 'rect_x', 'rect_y', 'rect_width', 'rect_height']);
    if (params == null)
        return;

    picture_util.check_picture_exist(params['album_id'], params['picture_id'], conn, cb, function () {
        check();
    });

    function check() {
        face_util.check_face_exist(params['album_id'], params['picture_id'], params['child_id'], conn, cb, function (is_exist) {
            if (is_exist)
                response.end(cb, 409, null, conn);
            else
                insert1();
        });
    }

    function insert1() {
        let sql =
            'INSERT INTO Face (album_id, picture_id, child_id, rect_x, rect_y, rect_width, rect_height) ' +
            'VALUES (\'{album_id}\', \'{picture_id}\', \'{child_id}\', \'{rect_x}\', \'{rect_y}\', \'{rect_width}\', \'{rect_height}\')';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            get_inserted();
        });
    }

    function get_inserted() {
        let sql = 'SELECT * FROM Face WHERE album_id = \'{album_id}\' AND picture_id = \'{picture_id}\' AND child_id = \'{child_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 200, results[0], conn);
        });
    }
};
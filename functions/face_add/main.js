const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const picture_util = require('../../utils/picture_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['picture_id', 'rect_x', 'rect_y', 'rect_width', 'rect_height']);
    if (params == null)
        return;

    if(!params.hasOwnProperty('child_id')) {
        params['child_id'] = 'NULL';
    }

    picture_util.check_picture_exist(params['picture_id'], conn, cb, function () {
        insert1();
    });

    function insert1() {
        let sql =
            'INSERT INTO Face (child_id, rect_x, rect_y, rect_width, rect_height) ' +
            'VALUES ({child_id}, \'{rect_x}\', \'{rect_y}\', \'{rect_width}\', \'{rect_height}\')';
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
        let sql = 'SELECT * FROM Face WHERE face_id = LAST_INSERT_ID()';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            insert2(results[0]);
        });
    }

    function insert2(face) {
        let sql = 'INSERT INTO Picture_Face (picture_id, face_id) VALUES (\'{0.picture_id}\', \'{1.face_id}\')';
        sql = sql.format(params, face);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 200, face, conn);
        });
    }
};
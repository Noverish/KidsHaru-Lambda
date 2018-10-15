const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const face_util = require('../../utils/face_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['face_id']);
    if (params == null)
        return;

    face_util.check_face_exist(params['face_id'], conn, cb, function () {
        update();
    });

    function update() {
        let sql_parts = [];

        if (params.hasOwnProperty('child_id'))
            sql_parts.push('child_id = \'{child_id}\''.format(params));

        if (params.hasOwnProperty('rect_x'))
            sql_parts.push('rect_x = \'{rect_x}\''.format(params));

        if (params.hasOwnProperty('rect_y'))
            sql_parts.push('rect_y = \'{rect_y}\''.format(params));

        if (params.hasOwnProperty('rect_width'))
            sql_parts.push('rect_width = \'{rect_width}\''.format(params));

        if (params.hasOwnProperty('rect_height'))
            sql_parts.push('rect_height = \'{rect_height}\''.format(params));

        if (sql_parts.length === 0) {
            response.end(cb, 204, null, conn);
            return;
        }

        let sql = 'UPDATE Face SET {0} WHERE face_id = \'{1.face_id}\'';
        sql = sql.format(sql_parts.join(), params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 204, null, conn);
        });
    }
};
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
        del1();
    });

    function del1() {
        let sql = 'DELETE FROM Picture_Face WHERE face_id = {face_id}';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            del2();
        });
    }

    function del2() {
        let sql = 'DELETE FROM Face WHERE face_id = {face_id}';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 204, null, conn);
        });
    }
};
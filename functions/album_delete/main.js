const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id']);
    if (params == null)
        return;

    check();

    function check() {
        let sql = 'SELECT album_id FROM Album WHERE album_id = \'{album_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length === 0) {
                response.end(cb, 404, 'There is no album_id which is {album_id} in database'.format(params), conn);
            } else {
                del1();
            }
        });
    }

    function del1() {
        let sql = 'DELETE FROM Teacher_Album WHERE album_id = \'{album_id}\'';
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
        let sql = 'DELETE FROM Album WHERE album_id = \'{album_id}\'';
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
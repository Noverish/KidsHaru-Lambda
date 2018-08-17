const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const child_util = require('../../utils/child_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['child_id']);
    if (params == null)
        return;

    child_util.check_child_exist(params['child_id'], conn, cb, function () {
        del1();
    });

    function del1() {
        let sql = 'DELETE FROM Teacher_Child WHERE child_id = \'{child_id}\'';
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
        let sql = 'DELETE FROM Parent_Child WHERE child_id = \'{child_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            del3();
        });
    }

    function del3() {
        let sql = 'DELETE FROM Child WHERE child_id = \'{child_id}\'';
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
const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const parent_util = require('../../utils/parent_util.js');
const child_util = require('../../utils/child_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['parent_id']);
    if (params == null)
        return;

    parent_util.check_parent_exist(params['parent_id'], conn, cb, function () {
        get();
    });

    function get() {
        let sql =
            'SELECT Child.* FROM Parent_Child ' +
            'INNER JOIN Child ON Parent_Child.child_id = Child.child_id ' +
            'WHERE Parent_Child.parent_id = \'{parent_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let child_list = child_util.process_child_list(results);
            response.end(cb, 200, child_list, conn);
        });
    }
};
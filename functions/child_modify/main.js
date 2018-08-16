const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['child_id']);
    if (params == null)
        return;

    update();

    function update() {
        let sql_parts = [];

        if (params.hasOwnProperty('name'))
            sql_parts.push('name = \'{name}\''.format(params));

        if (params.hasOwnProperty('contact'))
            sql_parts.push('contact = \'{contact}\''.format(params));

        if (sql_parts.length === 0) {
            response.end(cb, 204, null, conn);
            return;
        }

        let sql = 'UPDATE Child SET {0} WHERE child_id = \'{1.child_id}\''.format(sql_parts.join(), params);

        console.log(sql);
        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 204, null, conn);
        });
    }
};
const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id']);
    if (params == null)
        return;

    album_util.check_album_exist(params['album_id'], conn, cb, function() {
        update();
    });

    function update() {
        let sql_parts = [];

        if (params.hasOwnProperty('title'))
            sql_parts.push('title = \'{title}\''.format(params));

        if (params.hasOwnProperty('content'))
            sql_parts.push('content = \'{content}\''.format(params));

        if (params.hasOwnProperty('status'))
            sql_parts.push('status = \'{status}\''.format(params));

        if (sql_parts.length === 0) {
            response.end(cb, 204, null, conn);
            return;
        }

        let sql = 'UPDATE Album SET {0} WHERE album_id = \'{1.album_id}\'';
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
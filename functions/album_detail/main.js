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

    get();

    function get() {
        let sql = 'SELECT * FROM Album WHERE album_id = \'{album_id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length === 0) {
                response.end(cb, 404, null, conn);
            } else {
                let album = album_util.process_album(results[0]);
                response.end(cb, 200, album, conn);
            }
        });
    }
};
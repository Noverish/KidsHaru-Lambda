const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, []);
    if (params == null)
        return;

    get();

    function get() {
        let sql = 'SELECT * FROM Album WHERE status LIKE \'processing\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let album_list = album_util.process_album_list(results);
            response.end(cb, 200, album_list, conn);
        });
    }
};
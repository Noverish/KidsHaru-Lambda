const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const picture_util = require('../../utils/picture_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, []);
    if (params == null)
        return;

    let sql = `
        TRUNCATE Face;
        TRUNCATE Picture_Face;
        TRUNCATE Cluster_Child;
        UPDATE Picture SET status = 'processing';
    `;

    conn.query(sql, [], function (err, results, fields) {
        if (err) {
            response.end(cb, 500, err, conn);
            return;
        }

        response.end(cb, 204, err, conn);
    });
};
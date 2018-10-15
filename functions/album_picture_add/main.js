const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const picture_util = require('../../utils/picture_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id', 'file_name']);
    if (params == null)
        return;

    album_util.check_album_exist(params['album_id'], conn, cb, function () {
        insert1();
    });

    function insert1() {
        let sql = 'INSERT INTO Picture (file_name) VALUES (\'{file_name}\')';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            get_inserted();
        });
    }

    function get_inserted() {
        let sql = 'SELECT * FROM Picture WHERE picture_id = LAST_INSERT_ID()';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            insert2(results[0]);
        });
    }

    function insert2(picture) {
        let sql = 'INSERT INTO Album_Picture (album_id, picture_id) VALUES (\'{0.album_id}\', \'{1.picture_id}\')';
        sql = sql.format(params, picture);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            picture = picture_util.process_picture(picture);
            response.end(cb, 200, picture, conn);
        });
    }
};
const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album = require('../../utils/album.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['teacher_id', 'title', 'content']);
    if (params == null)
        return;

    insert1();

    function insert1() {
        let sql = 'INSERT INTO Album (title, content) VALUES (\'{title}\', \'{content}\')';
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
        let sql = 'SELECT * FROM Album WHERE album_id = LAST_INSERT_ID()';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            insert2(results[0]);
        });
    }

    function insert2(inserted_album) {
        let sql = 'INSERT INTO Teacher_Album (teacher_id, album_id) VALUES (\'{0.teacher_id}\', \'{1.album_id}\')';
        sql = sql.format(params, inserted_album);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            inserted_album = album.process_album(inserted_album);
            response.end(cb, 200, inserted_album, conn);
        });
    }
};
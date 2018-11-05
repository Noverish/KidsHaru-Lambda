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

    let pictureId = null;

    album_util.check_album_exist(params['album_id'], conn, cb, function () {
        insertIntoPicture();
    });

    function insertIntoPicture() {
        let sql = 'INSERT INTO Picture (file_name) VALUES (\'{file_name}\')';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            getPictureId();
        });
    }

    function getPictureId() {
        let sql = 'SELECT LAST_INSERT_ID() AS picture_id';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            pictureId = results[0]['picture_id'];

            insertIntoAlbumPicture();
        });
    }

    function insertIntoAlbumPicture() {
        let sql = `INSERT INTO Album_Picture (album_id, picture_id) VALUES ('${params['album_id']}', '${pictureId}')`;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            returnInserted();
        });
    }

    function returnInserted() {
        let sql = `SELECT * FROM ViewPicture WHERE picture_id = '${pictureId}'`;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            const picture = picture_util.process_picture(results[0]);
            response.end(cb, 200, picture, conn);
        });
    }
};
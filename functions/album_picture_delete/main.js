const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const picture_util = require('../../utils/picture_util.js');
const s3_util = require('../../utils/s3_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['picture_id']);
    if (params == null)
        return;

    const pictureId = params['picture_id'];
    let albumId = null;
    let fileName = null;

    picture_util.check_picture_exist(params['picture_id'], conn, cb, function() {
        getAlbumIdAndFileName();
    });

    function getAlbumIdAndFileName() {
        let sql = `SELECT album_id, file_name FROM ViewPicture WHERE picture_id = '${pictureId}'`;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            albumId = results[0]['album_id'];
            fileName = results[0]['file_name'];
            deleteS3Object();
        });
    }

    function deleteS3Object() {
        s3_util.deletePicture(albumId, fileName, function(err) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            del2();
        })
    }

    function del2() {
        let sql = `
            DELETE FROM Picture_Face WHERE picture_id = '${pictureId}';
            
            DELETE FROM Album_Picture WHERE picture_id = '${pictureId}';
            
            DELETE Face FROM Face
            INNER JOIN Picture_Face ON Picture_Face.face_id = Face.face_id
            WHERE Picture_Face.picture_id = '${pictureId}';
            
            DELETE FROM Picture WHERE picture_id = '${pictureId}';
        `.replace(/\s+/gi, ' ');

        conn.beginTransaction(function (errBegin) {
            if (errBegin) {
                response.end(cb, 500, errBegin, conn);
                return;
            }

            conn.query(sql, [], function (err, results, fields) {
                if (err) {
                    response.end(cb, 500, err, conn);
                    return;
                }

                conn.commit(function (errCommit) {
                    if (errCommit) {
                        response.end(cb, 500, errCommit, conn);
                        return;
                    }

                    response.end(cb, 204, null, conn);
                })
            });
        });
    }
};
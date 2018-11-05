const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const s3_util = require('../../utils/s3_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id']);
    if (params == null)
        return;

    const albumId = params['album_id'];

    album_util.check_album_exist(params['album_id'], conn, cb, function() {
        deleteS3Object();
    });

    function deleteS3Object() {
        s3_util.deleteAlbum(albumId, function(err) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            del1();
        })
    }

    function del1() {
        let sql = `
            DELETE Face FROM Face
            INNER JOIN Picture_Face ON Picture_Face.face_id = Face.face_id
            INNER JOIN Album_Picture ON Album_Picture.picture_id = Picture_Face.picture_id
            WHERE Album_Picture.album_id = '${albumId}';
            
            DELETE Picture_Face FROM Picture_Face
            INNER JOIN Album_Picture ON Album_Picture.picture_id = Picture_Face.picture_id
            WHERE album_id = '${albumId}';
            
            DELETE Picture FROM Picture
            INNER JOIN Album_Picture ON Album_Picture.picture_id = Picture.picture_id
            WHERE Album_Picture.album_id = '${albumId}';
            
            DELETE FROM Album_Picture WHERE album_id = '${albumId}';
            
            DELETE FROM Album WHERE album_id = '${albumId}';
            
            DELETE FROM Teacher_Album WHERE album_id = '${albumId}';
            
            DELETE FROM Parent_Album WHERE album_id = '${albumId}';
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
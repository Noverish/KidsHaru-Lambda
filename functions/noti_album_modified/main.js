const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const album_util = require('../../utils/album_util.js');
const noti_util = require('../../utils/noti_util.js');
const mysql = require('mysql');

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['album_id']);
    if (params == null)
        return;

    const albumId = params['album_id'];
    let album = null;
    let parentTokens = null;
    let teacherTokens = null;

    album_util.check_album_exist(albumId, conn, cb, function () {
        get_album();
    });

    function get_album() {
        let sql = `SELECT * FROM ViewAlbum WHERE album_id = ${albumId}`;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            album = album_util.process_album(results[0]);
            getParentToken();
        });
    }

    function getParentToken() {
        let sql = `
            SELECT token
            FROM Parent_Album
            JOIN ParentFirebaseToken ON ParentFirebaseToken.parent_id = Parent_Album.parent_id
            WHERE Parent_Album.album_id = ${albumId};
        `;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            parentTokens = results;
            getTeacherToken();
        });
    }

    function getTeacherToken() {
        let sql = `
            SELECT token
            FROM Teacher_Album
            JOIN TeacherFirebaseToken ON TeacherFirebaseToken.teacher_id = Teacher_Album.teacher_id
            WHERE Teacher_Album.album_id = ${albumId};
        `;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            teacherTokens = results;
            combine();
        });
    }

    function combine() {
        parentTokens = parentTokens.map(item => item['token']);
        teacherTokens = teacherTokens.map(item => item['token']);
        let tokens = [...new Set([...parentTokens, ...teacherTokens])];

        tokens.forEach(token => {
            noti_util.notify(token, 'album_modified', album, function(err, res) {
                console.log(err);
                console.log(res);
            });
        });

        response.end(cb, 204, tokens, conn);
    }
};
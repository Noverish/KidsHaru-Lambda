const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const child_util = require('../../utils/child_util.js');
const picture_util = require('../../utils/picture_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['child_id']);
    if (params == null)
        return;

    let childId = params['child_id'];

    child_util.check_child_exist(childId, conn, cb, function () {
        get();
    });

    function get() {
        let sql = `
            SELECT ViewPicture.*, Album.date
            FROM ViewPicture
            JOIN Picture_Face ON Picture_Face.picture_id = ViewPicture.picture_id
            JOIN Face ON Face.face_id = Picture_Face.face_id
            JOIN Cluster_Child ON Cluster_Child.cluster_id = Face.cluster_id
            JOIN Album_Picture ON Album_Picture.picture_id = ViewPicture.picture_id
            JOIN Album ON Album.album_id = Album_Picture.album_id
            WHERE Cluster_Child.child_id = ${childId}
        `;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let picture_list = picture_util.process_picture_list(results);
            response.end(cb, 200, picture_list, conn);
        });
    }
};
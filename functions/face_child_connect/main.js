const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const faceUtil = require('../../utils/face_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['face_id', 'child_id']);
    if (params == null)
        return;

    const faceId = params['face_id'];
    const childId = params['child_id'];
    let clusterId = null;
    let teacherId = null;

    // TODO ALL conn.query to custom conn util
    // TODO all sql.format to `${}` format
    // TODO all to camelCase
    faceUtil.check_face_exist(params['face_id'], conn, cb, function () {
        getClusterId();
    });

    function getClusterId() {
        let sql = `SELECT cluster_id FROM Face WHERE face_id = ${faceId};`;

        conn.query(sql, [], (err, results, fields) => {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            clusterId = results[0]['cluster_id'];

            if(clusterId === null) {
                response.end(cb, 500, 'cluster_id is null', conn);
            } else {
                getTeacherId()
            }
        });
    }

    function getTeacherId() {
        let sql = `
            SELECT teacher_id
            FROM Face
            JOIN Picture_Face ON Picture_Face.face_id = Face.face_id
            JOIN Album_Picture ON Album_Picture.picture_id = Picture_Face.picture_id
            JOIN Teacher_Album ON Teacher_Album.album_id = Album_Picture.album_id
            WHERE Face.face_id = ${faceId};
        `;

        conn.query(sql, [], (err, results, fields) => {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            teacherId = results[0]['teacher_id'];

            if(teacherId === null) {
                response.end(cb, 500, 'teacher_id is null', conn);
            } else {
                check()
            }
        });
    }

    function check() {
        let sql = `
            SELECT ViewFace.face_id, Cluster_Child.*
            FROM ViewFace
            JOIN Teacher_Album ON Teacher_Album.album_id = ViewFace.album_id
            JOIN Cluster_Child ON Cluster_Child.cluster_id = ViewFace.cluster_id AND Cluster_Child.teacher_id = Teacher_Album.teacher_id
            WHERE face_id = ${faceId};
        `;

        conn.query(sql, [], (err, results, fields) => {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length > 0) {
                update();
            } else {
                insert();
            }
        });
    }

    function update() {
        let sql = `
            UPDATE Cluster_Child SET child_id = ${childId}
            WHERE teacher_id = ${teacherId} AND cluster_id = ${clusterId};
        `;

        conn.query(sql, [], (err, results, fields) => {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 204, err, conn);
        });
    }

    function insert() {
        let sql = `
            INSERT INTO Cluster_Child (teacher_id, cluster_id, child_id)
            VALUES (${teacherId}, ${clusterId}, ${childId})
        `;

        conn.query(sql, [], (err, results, fields) => {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 204, err, conn);
        });
    }
};
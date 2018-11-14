const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const teacher_util = require('../../utils/teacher_util.js');
const child_util = require('../../utils/child_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['teacher_id']);
    if (params == null)
        return;

    teacher_util.check_teacher_exist(params['teacher_id'], conn, cb, function () {
        get();
    });

    function get() {
        let sql = `SELECT * FROM ViewTeacherChild WHERE teacher_id = ${params.teacher_id}`;

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            let child_list = child_util.process_child_list(results);
            response.end(cb, 200, child_list, conn);
        });
    }
};
const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const teacher_util = require('../../utils/teacher_util.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['teacher_id', 'name', 'contact']);
    if (params == null)
        return;

    teacher_util.check_teacher_exist(params['teacher_id'], conn, cb, function () {
        check_already_exist();
    });

    function check_already_exist() {
        let sql =
            'SELECT child_id FROM Teacher_Child NATURAL JOIN Child ' +
            'WHERE teacher_id = \'{teacher_id}\' AND name LIKE \'{name}\' AND contact LIKE \'{contact}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length === 0) {
                insert1();
            } else {
                response.end(cb, 409, 'Already Exist', conn);
            }
        });
    }

    function insert1() {
        let sql = 'INSERT INTO Child (name, contact) VALUES (\'{name}\', \'{contact}\')';
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
        let sql = 'SELECT * FROM Child WHERE child_id = LAST_INSERT_ID()';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            insert2(results[0]);
        });
    }

    function insert2(child) {
        let sql = 'INSERT INTO Teacher_Child (teacher_id, child_id) VALUES (\'{0.teacher_id}\', \'{1.child_id}\')';
        sql = sql.format(params, child);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            response.end(cb, 200, child, conn);
        });
    }
};
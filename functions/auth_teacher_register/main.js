const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const jwt = require('../../utils/jwt.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['name', 'id', 'password']);
    if (params == null)
        return;

    params['password'] = params['password'].toUpperCase();

    check_already_exist();

    function check_already_exist() {
        let sql = 'SELECT id FROM Teacher WHERE id LIKE \'{id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length === 0) {
                insert();
            } else {
                response.end(cb, 409, null, conn);
            }
        });
    }

    function insert() {
        let sql = 'INSERT INTO Teacher (name, id, password) VALUES (\'{name}\', \'{id}\', \'{password}\')';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            generate_access_token();
        });
    }

    function generate_access_token() {
        let sql = 'SELECT teacher_id FROM Teacher WHERE id LIKE \'{id}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            const teacher_id = results[0]['teacher_id'];
            const access_token = jwt.generate_token({ teacher_id: teacher_id });
            const payload = { access_token: access_token };

            response.end(cb, 200, payload, conn);
        });
    }
};
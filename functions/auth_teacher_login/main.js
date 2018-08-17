const utils = require('../../utils/utils.js');
const response = require('../../utils/response.js');
const jwt = require('../../utils/jwt.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    const conn = mysql.createConnection(utils.mysql_config);
    const params = utils.process_input_event(e, cb, ['id', 'password']);
    if (params == null)
        return;

    check();

    function check() {
        let sql = 'SELECT teacher_id FROM Teacher WHERE id LIKE \'{id}\' AND password LIKE \'{password}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length === 0) {
                response.end(cb, 404, null, conn);
            } else {
                const teacher_id = results[0]['teacher_id'];
                const access_token = jwt.generate_token({ teacher_id: teacher_id });
                const payload = { access_token: access_token };

                response.end(cb, 200, payload, conn);
            }
        });
    }
};
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

    params['password'] = params['password'].toUpperCase();

    check();

    function check() {
        let sql = 'SELECT parent_id FROM Parent WHERE id LIKE \'{id}\' AND password LIKE \'{password}\'';
        sql = sql.format(params);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                response.end(cb, 500, err, conn);
                return;
            }

            if (results.length === 0) {
                response.end(cb, 404, null, conn);
            } else {
                const parent_id = results[0]['parent_id'];
                const access_token = jwt.generate_token({ parent_id: parent_id });
                const payload = { access_token: access_token, parent_id: parent_id };

                response.end(cb, 200, payload, conn);
            }
        });
    }
};
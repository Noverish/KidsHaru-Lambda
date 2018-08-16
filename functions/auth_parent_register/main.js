const utils = require('../../utils.js');
const mysql = require('mysql');
const format = require('string-format');
format.extend(String.prototype);

exports.handle = function (e, ctx, cb) {
    utils.process_input_event(e, function (params, err) {
        if (err) {
            cb(null, err);
            return;
        }

        connect(params);
    });

    function connect(params) {
        const conn = mysql.createConnection(utils.mysql_config);

        let sql = "INSERT INTO Parent (id, password) VALUES ('{id}', '{password}')";
        sql = sql.format(params);
        console.log(sql);

        conn.query(sql, [], function (err, results, fields) {
            if (err) {
                cb(null, utils.create_response(500, err));
                return;
            }

            cb(null, utils.create_response(200, { access_token: '1234' }));
        });

        conn.end();
    }
};
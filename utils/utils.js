const response = require('./response.js');
const credential = require('./credential.js');

exports.mysql_config = {
    host: credential.mysql_host,
    user: credential.mysql_user,
    password: credential.mysql_password,
    database: credential.mysql_database,
    multipleStatements: true,
    typeCast: function (field, next) {
        if (field.type === 'DATETIME' || field.type === 'DATE') {
            return field.string();
        }
        return next();
    }
};

exports.process_input_event = function (e, cb, keys) {
    let params = exports.integrate_params(e);
    if (params == null) {
        response.end(cb, 500, 'Invalid Request', null);
        return null;
    }

    let missing_param = exports.check_missing_param(params, keys);
    if (missing_param != null) {
        response.end(cb, 400, 'There is no ' + missing_param, null);
        return null;
    }

    return params;
};

exports.integrate_params = function (e) {
    let body = JSON.parse(e['body']);
    let query = e['queryStringParameters'];
    let path = e['pathParameters'];

    let params = {};
    try {
        Object.assign(params, body);
        Object.assign(params, query);
        Object.assign(params, path);
        return params;
    } catch (err) {
        return null;
    }
};

exports.check_missing_param = function (params, keys) {
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (!params.hasOwnProperty(key)) {
            return key;
        }
    }
    return null;
};
exports.mysql_config = {
    host: 'kidsharu.c1nddfwgbi25.ap-northeast-2.rds.amazonaws.com',
    user: 'kidsharu',
    password: 'Kidsharu1!',
    database: 'kidsharu',
    typeCast: function (field, next) {
        if (field.type === 'DATETIME' || field.type === 'DATE') {
            return field.string();
        }
        return next();
    }
};

exports.album_bucket_path = 'https://s3.ap-northeast-2.amazonaws.com/kidsharu-album/';

exports.process_input_event = function (e, callback) {
    let params = {};

    try {
        Object.assign(params, JSON.parse(e['body']));
        Object.assign(params, e['queryStringParameters']);
        Object.assign(params, e['pathParameters']);
    } catch (err) {
        callback(null, exports.create_response(500, 'Invalid Request Event'));
    }

    callback(params, null);
};

exports.create_response = function (statusCode, body) {
    const messageMap = {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        409: 'Conflict',
        500: 'Internal Server Error'
    };

    if (statusCode === 200) {
        return {
            statusCode: statusCode,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        };
    } else {
        let tmp = {
            msg: messageMap[statusCode] + ' - ' + body
        };

        return {
            statusCode: statusCode,
            body: JSON.stringify(tmp),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
exports.end = function (cb, statusCode, body, conn) {
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

    // disconnect mysql connection
    if (conn != null) {
        conn.end();
    }

    let response = null;
    if (statusCode === 200) {
        response = {
            statusCode: statusCode,
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        };
    } else {
        let tmp = {
            msg: messageMap[statusCode] + ' - ' + body
        };

        response = {
            statusCode: statusCode,
            body: JSON.stringify(tmp),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    cb(null, response);
};
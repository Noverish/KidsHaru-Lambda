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

    let response = {
        statusCode: statusCode,
        body: null,
        headers: { 'Content-Type': 'application/json' }
    };

    if (statusCode === 200) {
        response.body = JSON.stringify(body);
    } else if (statusCode === 204) {
        response.body = null;
    } else if (statusCode === 404 || statusCode === 409) {
        response.body = JSON.stringify({ msg: messageMap[statusCode] })
    } else {
        response.body = JSON.stringify({ msg: messageMap[statusCode] + ' - ' + body })
    }

    cb(null, response);
};
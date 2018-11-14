const request = require('request');
const {google} = require('googleapis');

const url = 'https://fcm.googleapis.com/v1/projects/kidsharu-75a81/messages:send';
const scope = 'https://www.googleapis.com/auth/firebase.messaging';

exports.getAccessToken = function(callback) {
    let key = require('../service-account.json');

    let jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        scope,
        null
    );

    jwtClient.authorize(function(err, tokens) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, tokens.access_token);
    });
};

exports.notify = function(token, message, data, callback) {
    exports.getAccessToken((err, accessToken) => {
        if (err) {
            callback(err, null);
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
        };

        const body = {
            message: {
                token: token,
                data: {
                    message: message,
                    data: JSON.stringify(data)
                }
            }
        };

        const options = {
            headers: headers,
            uri: url,
            method: 'POST',
            json: true,
            body: body
        };

        request(options, (err, res, body) => {
            if (err) {
                callback(err, null);
                return
            }

            let tmp = {
                res: res,
                body: body
            };

            callback(null, tmp);
        });
    });
};

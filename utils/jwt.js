const utils = require('./utils.js');
const jwt = require('jwt-simple');
const jwt_secret_key = 'zntbffod1!';
const jwt_header = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9';

exports.generate_token = function (payload) {
    const token = jwt.encode(payload, jwt_secret_key);
    const token_header = token.split('.')[0];
    const token_payload = token.split('.')[1];
    const token_signature = token.split('.')[2];
    return token_payload + '.' + token_signature;
};

exports.decode_token = function (token, callback) {
    try {
        const payload = jwt.decode(jwt_header + '.' + token, jwt_secret_key);
        callback(payload, null);
    } catch (err) {
        callback(null, utils.create_response(401, 'Invalid Token'));
    }
};
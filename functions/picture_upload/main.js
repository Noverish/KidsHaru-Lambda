const response = require('../../utils/response.js');
const credential = require('../../utils/credential.js');
const album_util = require('../../utils/album_util.js');
const crypto = require('crypto');
const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: credential.access_key_id,
    secretAccessKey: credential.secret_key_id,
    region: 'ap-northeast-2'
});
const s3 = new aws.S3();

exports.handle = function (e, ctx, cb) {
    const album_id = e['pathParameters']['album_id'];
    const buffer = new Buffer(e['body'], 'base64');
    const hash = crypto.createHash('md5').update(buffer.toString()).digest('hex');

    let param = {
        'Bucket': 'kidsharu-album',
        'Key': album_id + '/' + hash + '.jpg',
        'Body': buffer,
        'ContentType': 'image/jpeg'
    };

    s3.upload(param, function (err, data) {
        if (err) {
            response.end(cb, 500, err, null);
            return;
        }

        const payload = {
            'url': album_util.album_bucket_path + '/' + album_id + '/' + hash + '.jpg'
        };

        response.end(cb, 200, payload, null);
    });
};

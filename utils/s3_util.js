const credential = require('./credential.js');
const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: credential.access_key_id,
    secretAccessKey: credential.secret_key_id,
    region: 'ap-northeast-2'
});
const s3 = new aws.S3();

exports.deletePicture = function (albumId, fileName, callback) {
    const params1 = {
        Bucket: 'kidsharu-album',
        Key: albumId + '/' + fileName
    };

    const params2 = {
        Bucket: 'kidsharu-album-thumbnail',
        Key: albumId + '/' + fileName
    };

    s3.deleteObject(params1, function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        s3.deleteObject(params2, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            callback();
        });
    });
};

exports.deleteAlbum = function (albumId, callback) {
    let keys = null;

    getKeys();

    function getKeys() {
        const params1 = {
            Bucket: 'kidsharu-album',
            Prefix: albumId
        };

        s3.listObjectsV2(params1, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            keys = data['Contents'].map(function (a) {
                return { Key: a['Key'] };
            });

            if (keys.length === 0) {
                callback();
                return;
            }

            deleteObjects();
        });
    }

    function deleteObjects() {
        const params2 = {
            Bucket: 'kidsharu-album',
            Delete: {
                Objects: keys,
                Quiet: false
            }
        };

        s3.deleteObjects(params2, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            deleteThumbnails();
        });
    }

    function deleteThumbnails() {
        const params3 = {
            Bucket: 'kidsharu-album-thumbnail',
            Delete: {
                Objects: keys,
                Quiet: false
            }
        };

        s3.deleteObjects(params3, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            callback();
        });
    }
};
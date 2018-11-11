const credential = require('./credential.js');
const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: credential.access_key_id,
    secretAccessKey: credential.secret_key_id,
    region: 'ap-northeast-2'
});
const s3 = new aws.S3();

exports.bucketName = 'kidsharu';

exports.deletePicture = function (albumId, fileName, callback) {
    const params1 = {
        Bucket: exports.bucketName,
        Key: `album/${albumId}/${fileName}`
    };

    const params2 = {
        Bucket: exports.bucketName,
        Key: `album-thumbnail/${albumId}/${fileName}`
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

    getKeys1();

    function getKeys1() {
        const params1 = {
            Bucket: exports.bucketName,
            Prefix: `album/${albumId}`
        };

        s3.listObjectsV2(params1, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            keys = data['Contents'].map(function (a) {
                return { Key: a['Key'] };
            });

            deleteObjects();
        });
    }

    function deleteObjects() {
        const params2 = {
            Bucket: exports.bucketName,
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

            getKeys2();
        });
    }

    function getKeys2() {
        const params1 = {
            Bucket: exports.bucketName,
            Prefix: `album-thumbnail/${albumId}`
        };

        s3.listObjectsV2(params1, function (err, data) {
            if (err) {
                callback(err);
                return;
            }

            keys = data['Contents'].map(function (a) {
                return { Key: a['Key'] };
            });

            deleteThumbnails();
        });
    }

    function deleteThumbnails() {
        const params3 = {
            Bucket: exports.bucketName,
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
const album_util = require('./album_util.js');

exports.process_picture_list = function (picture_list) {
    for (let i = 0; i < picture_list.length; i++) {
        picture_list[i] = exports.process_picture(picture_list[i]);
    }

    return picture_list;
};

exports.process_picture = function (picture) {
    picture.picture_url = album_util.album_bucket_path + '/' + picture.album_id + '/' + picture.name;

    delete picture.name;

    return picture;
};
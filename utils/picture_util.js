const album_util = require('./album.js');

exports.process_picture = function(picture) {
    picture.picture_url = album_util.album_bucket_path + '/' + picture.album_id + '/' + picture.name;

    delete picture.name;

    return picture;
}
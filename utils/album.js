exports.album_bucket_path = 'https://s3.ap-northeast-2.amazonaws.com/kidsharu-album';
exports.album_noimage_path = 'https://s3.ap-northeast-2.amazonaws.com/kidsharu-album/no-image.png';

exports.process_album_list = function (album_list) {
    for (let i = 0; i < album_list.length; i++) {
        album_list[i] = exports.process_album(album_list[i]);
    }

    return album_list;
};

exports.process_album = function (album) {
    if (album.cover_img == null) {
        album.cover_img = exports.album_noimage_path;
    } else {
        album.cover_img = exports.album_bucket_path + '/' + album.album_id + '/' + album.cover_img;
    }

    return album;
};
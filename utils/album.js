exports.album_bucket_path = 'https://s3.ap-northeast-2.amazonaws.com/kidsharu-album';

exports.process_album_list = function (album_list) {
    for (let i = 0; i < album_list.length; i++) {
        let album = album_list[i];

        album.cover_img = exports.album_bucket_path + '/' + album.album_id + '/' + album.cover_img;
    }

    return album_list;
};
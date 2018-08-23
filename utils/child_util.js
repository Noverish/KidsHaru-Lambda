const response = require('./response.js');

exports.child_bucket_path = 'https://s3.ap-northeast-2.amazonaws.com/kidsharu-child';
exports.child_noprofile_path = 'https://s3.ap-northeast-2.amazonaws.com/kidsharu-child/no-profile.jpg';

exports.process_child_list = function (child_list) {
    for (let i = 0; i < child_list.length; i++) {
        child_list[i] = exports.process_child(child_list[i]);
    }

    return child_list;
};

exports.process_child = function (child) {
    if (child['profile_file_name'] == null) {
        child['profile_img_url'] = exports.child_noprofile_path
    } else {
        child['profile_img_url'] = exports.child_bucket_path + '/' + child['child_id'] + '/' + child['profile_file_name'];
    }

    delete child['profile_file_name'];

    return child;
};

exports.check_child_exist = function (child_id, conn, cb, callback) {
    let sql = 'SELECT child_id FROM Child WHERE child_id = \'{}\'';
    sql = sql.format(child_id);

    conn.query(sql, [], function (err, results, fields) {
        if (err) {
            response.end(cb, 500, err, conn);
            return;
        }

        if (results.length === 0) {
            response.end(cb, 404, null, conn);
        } else {
            callback();
        }
    });
};
// var mysql = require('mysql');

exports.handle = function(e, ctx, cb) {
    // var config = {
    //     host: "kidsharu.c1nddfwgbi25.ap-northeast-2.rds.amazonaws.com",
    //     user: "kidsharu",
    //     password: "Kidsharu1!",
    //     database: "kidsharu"
    // };

    // var conn = mysql.createConnection(config);

    // conn.connect();

    // conn.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    //     if (error) {
    //         cb(null, error);
    //         return;   
    //     }
        
    //     cb(null, 'success');
    //   });

    // conn.end();

    
    cb(null, { e: e, ctx: ctx });
};
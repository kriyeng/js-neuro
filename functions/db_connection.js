
var config = require('../config');

var mysql = require('mysql');

var pool = mysql.createPool({
    host               : config.db.host,
    port               : config.db.port,
    user               : config.db.user,
    password           : config.db.password,
    dateStrings        : true,
    multipleStatements : true,
    database : config.db.database
});

exports.query = function (instruccio, variables, callback) {
    pool.getConnection(function(err, connection){
        if (err){
            callback(err);
            console.log("ERROOR DB: " + err.message);
            return;
        }

        console.log('connected as id ' + connection.threadId);

        connection.query(instruccio, variables, function (err, rows) {
            connection.release();
            connection.destroy();

            if (err) {
                console.log(err.message); // Ha fallat la connexió de dades
                strError = err.message;
                callback(err, null);
            }
            else {
                callback(null, rows);
            }
        });

        connection.on('error', function(err) {
            console.log("Error in connection database: " + err.message);
        });
    });
};

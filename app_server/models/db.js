var mysql = require('mysql');
var gracefulShutdown;
// var dbURI = '192.168.1.7';

// if (process.env.NODE_ENV === 'production') {
//     dbURI = process.env.MONGOLAB_URI;
// }


var cachedConnection;

function returnConnection() {
    cachedConnection = cachedConnection ||
        mysql.createConnection({
            database: 'buchhalter',
            host: 'localhost',
            user: 'root',
            password: '4005221395',
            multipleStatements: true
        });
    return cachedConnection;
}
//
module.exports = {
    mysqlconn: returnConnection
};


//
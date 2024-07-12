var mysql = require('mysql2');
const dbConfig = require('../constants/dbConLotto');
const logError = require('../../unityFunction/functionLogError');
module.exports.db = (callback) => {
    con = mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        connectionLimit: 10
    });
    con.connect(function(err) {
        if (err) {
            console.log(err);
            console.log("Database Fail Connected!");
            callback({
                status: false,
            });
        } else {
            console.log("Database Connected!");
            callback({ status: true });
        }
    });
}
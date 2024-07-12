const mysql = require('mysql2');
const util = require('util');
const dbConfig = require('../constants/dbCon');
const dbConfigLotto = require('../constants/dbConLotto');
const logError = require('../../unityFunction/functionLogError');
const conn = mysql.createPool(`mysql://root:@localhost:3306/weblotto_api_dbx`);
const con = mysql.createPool(`mysql://root:@localhost:3306/webauto_api_dbx`);

// try {
conn.getConnection(function(err) {
    if (err)
    console.log("Database Lotto Connected!",err);
});
// } catch (error) {
//     console.log("🚀 ~ file: db.js:16 ~ error:", error)
// }

// try {
con.getConnection(function(err) {
    if (err)
    console.log("Database AutoWallet Connected!",err);
});
// } catch (error) {
//     console.log("🚀 ~ file: db.js:16 ~ error:", error)
// }


conn.query = util.promisify(conn.query)
con.query = util.promisify(con.query)


module.exports = {
    conn,
   con
    // con = mysql.createConnection(`mysql://user:pass@mysql-server:3306/dbname`);
    // conn = mysql.createConnection(`${process.env.HOST_DB_LOTTO}/${process.env.DB_NAME_LOTTO}`);
    // // con = mysql.createConnection(`mysql://user:pass@mysql-server:3306/dbname`);
    // con = mysql.createConnection(`${process.env.HOST_DB_AUTO}/${process.env.DB_NAME_AUTO}`);



}
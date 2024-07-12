require('dotenv').config()
const mysql = require('./config/mysqlLotto');
const app = require('./config/expressLotto')();
const port = process.env.PORT || 11014;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        console.log('server-Lotto running at port ' + port);
    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-Lotto is error ');
    }
});
require('dotenv').config()
const mysql = require('./config/mysqlLotto');
const app = require('./config/expressLotto')();
const { AutoYiKeeResult } = require('./app/controllers/autoyikee.controller')
const port = process.env.PORT || 11015;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        AutoYiKeeResult
        setInterval(async() => {
            await AutoYiKeeResult();
        }, 1000);
        console.log('server-AutoYikee running at port ' + port);
    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-AutoYikee is error ');
    }
});
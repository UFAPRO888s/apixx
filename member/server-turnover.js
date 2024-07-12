require('dotenv').config()
const mysql = require('./config/mysql');
const app = require('./config/express')();
const { auto_turnover } = require('./app/controllers/turnover.controller')

const port = process.env.PORT || 11012;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        console.log('server-turnover running at port ' + port);
        await auto_turnover();


    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-turnover is error ');
    }
});
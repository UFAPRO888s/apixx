require('dotenv').config()
const mysql = require('./config/mysql');
const app = require('./config/express')();
const { autoTokenUfa } = require('./app/controllers/backend.controller');

const port = process.env.PORT || 11017;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        console.log('server-turnover running at port ' + port);
        setInterval(async() => {
            await autoTokenUfa()
        }, 300000);


    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-turnover is error ');
    }
});
require('dotenv').config()
const mysql = require('./config/mysql');
const app = require('./config/express')();
const { depositAutoTransaction } = require('./app/controllers/wallet.controller');
const { autoTransfer } = require('./app/controllers/wallet.controller');


const port = process.env.PORT || 11019;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        console.log('server-autoTransfer running at port ' + port);
        setInterval(async() => {
            await depositAutoTransaction()
        }, 120000);
        setInterval(async() => {
            await autoTransfer()
        }, 1800000);
        // 120000
    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-autoTransfer is error ');
    }
});
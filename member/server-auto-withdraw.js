require('dotenv').config()
const mysql = require('./config/mysql');
const app = require('./config/express')();
const { auto_deposit } = require('./app/controllers/autowithdraw.controller')
const { depositAutoTransaction } = require('./app/controllers/wallet.controller');
const { autoTransfer } = require('./app/controllers/wallet.controller');
const { autoTokenUfa } = require('./app/controllers/backend.controller');

const port = process.env.PORT || 11011;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        console.log('server-auto-withdraw running at port ' + port);
        await auto_deposit();

    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-auto-withdraw is error ');
    }
});
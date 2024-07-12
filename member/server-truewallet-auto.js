require('dotenv').config()
const mysql = require('./config/mysql');
const app = require('./config/express')();
const { AutoTransactionTruewallet } = require('./app/controllers/truewallet.controller')

const port = process.env.PORT || 11013;
mysql.db(async function(db) {
    if (db) {
        app.listen(port);
        module.exports = app;
        console.log('server-bakcend running at port ' + port);

        setInterval(async() => {
            await AutoTransactionTruewallet();
        }, 10000);
        // 120000
    } else {
        logError.historyLogError(JSON.stringify(db));
        console.log('server-bakcend is error ');
    }
});
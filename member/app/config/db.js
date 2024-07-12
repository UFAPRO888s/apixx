require('dotenv').config();

const db = require('knex')({
    client: 'mysql2',
    connection: "mysql://dadmin:adminx@nook@localhost:3306/webauto_api_dbx",//`${process.env.HOST_DB_AUTO}/${process.env.DB_NAME_AUTO}`,
    pool: { min: 2, max: 10 }
});

db.raw("select version()").then((result) => {
    console.log("🚀 Connected!!")
}).catch((err) => {
    console.log("🚀 ~ err:", err)
});

module.exports = db
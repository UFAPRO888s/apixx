// module.exports = con = {
//     host: "localhost",
//     user: "sql_4uclub_com",
//     password: "bkZkGGHFBEfmBbdM",
//     database: "sql_4uclub_com"
// };


module.exports = con = {
    host: process.env.HOST,
    user: process.env.DB_USER_AUTO,
    password: process.env.DB_PASS_AUTO,
    database: process.env.DB_NAME_AUTO
};
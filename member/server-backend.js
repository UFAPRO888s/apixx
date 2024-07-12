require("dotenv").config();
const libufa = require("./app/library/ufa");
global.ufa = new libufa()
global.ufa.loadAgent();
const app = require("./config/express")();

const port = process.env.PORT || 8099;






app.listen(port);
module.exports = app;
console.log("server-bakcend running at port " + port);
// await ApiqueryTransactionAllCli();
const express = require('express');
const bodyParser = require('body-parser');

function formatDate1(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = '0' + mmm;
    }
    if (dd < 10) {
        dd = '0' + dd;
    }
    let result = yy + "-" + mmm + "-" + dd;
    return result;
}
function formatTime(d) {
    let date = new Date(d);
    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();
    if (hh < 10) {
        hh = '0' + hh;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    if (ss < 10) {
        ss = '0' + ss;
    }
    let result = hh + ":" + mm + ":" + ss;
    return result;
}
module.exports = () => {
    let app = express();
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        app.locals.pretty = true;
        return next();
    });
    app.use(bodyParser.urlencoded({
        extended: true,
        limit: '100mb'
    }));
    app.use(bodyParser.json({
        limit: '100mb'
    }));

    function logRequest(req, res, next) {
        console.log("method : '" + req.method + "' , path : '" + req.url + "' || " + formatDate1(new Date()) + " " + formatTime(new Date()));
        // logger.info(req)
        next()
    }
    app.use(logRequest)
    require('../app/route/lotto.route')(app)
    return app;
}
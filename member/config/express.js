const express = require('express');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit')
const cors = require('cors');

module.exports = () => {
    let app = express();
    app.use(cors())
    const limiter = rateLimit({
        windowMs: 1000, // 15 minutes
        max: 15, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
    app.use(limiter);
    app.use(function(req, res, next) {
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
    require('../app/route/backend.route')(app)
    return app;
}
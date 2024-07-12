const axios = require("axios");
const rateLimit = require("axios-rate-limit");
const axiosRetry = require("axios-retry");

const http = rateLimit(axios.create(), {
    maxRequests: 1000,
    perMilliseconds: 1000,
    maxRPS: 1000,
});

axiosRetry(http, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

module.exports = axios
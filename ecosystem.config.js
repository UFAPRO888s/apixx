require("dotenv").config();
module.exports = {
    apps: [{
        name: `${process.env.WEBNAME}-API-`,
        exec_mode: "cluster",
        instances: "2", // Or a numbder of instances
        script: "member/server-backend.js",
        cron_restart: '2 2 * * *',
        args: '',
        env: {
            NODE_ENV: "production",
            PORT: process.env.NODE_PORT || 8099 // Set Port
        }
    },],
};
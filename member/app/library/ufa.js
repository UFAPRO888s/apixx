const axios = require("./axios/call");
const moment = require('moment')
const { faker, fa } = require('@faker-js/faker');
const settings = require("../models/genaral");


const BaseUrl = process.env.BaseUrlApi || 'https://agufa.mskids.dev/v3'

class Ufa {
    constructor() {
        this.agentUsername = ''
        this.agentPassword = ''
        this.apiKey = ''
    }

    async loadAgent() {
        await settings.getSettingsWithWhereAll({ id: '1' }, async (err, results) => {
            if (err) {
                console.log("🚀 ~ file: ufa.js:19 ~ Ufa ~ awaitsettings.getSettingsWithWhereAll ~ err:", err)
                return false
            }
            if (!results) {
                console.log("🚀 ~ file: ufa.js:22 ~ Ufa ~ awaitsettings.getSettingsWithWhereAll ~ results:", results)
                return false
            }
            this.agentUsername = results.acc_ufa
            this.agentPassword = results.ufa_pass
            this.apiKey = results.apikeyufa
        })
    }

    async agentInfo() {
        if (this.agentUsername == '' || this.agentUsername == '') {
            return false
        }
        var config = {
            method: "post",
            url: `${BaseUrl}/agent/info`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://mskids.dev',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: 'ไม่สามารถเข้าใช้งานได้กรุณาลองใหม่'
            };
        }

        return {
            status: 1,
            data: data.data
        };
    }

    async loginToken(username, password) {
        if (this.agentUsername == '' || this.agentUsername == '') {
            return false
        }
        var config = {
            method: "post",
            url: `${BaseUrl}/auth/login`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://mskids.dev',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword,
                username,
                password,
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: 'ไม่สามารถเข้าใช้งานได้กรุณาลองใหม่'
            };
        }

        return {
            status: 1,
            gameUrl: data.gameUrl
        };
    }

    async regMember() {
        if (this.agentUsername == '' || this.agentUsername == '') {
            return false
        }
        let username = faker.internet.password({ length: 6, memorable: false, pattern: /[a-z0-9]/ })
        let password = faker.internet.password({ length: 8, memorable: false, pattern: /[A-Za-z0-9]/ })

        var config = {
            method: "post",
            url: `${BaseUrl}/addmember`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://mskids.dev',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword,
                username,
                password,
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: data.message,
                errorType: data.errorType
            };
        }

        return {
            status: 1,
            ufa_username: data.ufa_username,
            ufa_password: data.ufa_password,
            method: data.method,
        };
    }

    async addCredit(username, credit) {
        if (this.agentUsername == '' || this.agentUsername == '') {
            console.log(`no agent`)
            return false
        }

        var config = {
            method: "post",
            url: `${BaseUrl}/credit/add`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://mskids.dev',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword,
                username,
                credit,
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: data.message,
                errorType: data.errorType
            };
        }
        return {
            status: 1,
            old_credit: data.old_credit,
            current_credit: data.current_credit,
            method: data.method,
        };
    }

    async delCredit(username, credit) {
        if (this.agentUsername == '' || this.agentUsername == '') {
            return false
        }

        var config = {
            method: "post",
            url: `${BaseUrl}/credit/del`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://mskids.dev',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword,
                username,
                credit,
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: data.message,
                errorType: data.errorType
            };
        }

        return {
            status: 1,
            old_credit: data.before_balance,
            current_credit: data.after_balance,
            method: data.method,
        };
    }
    async checkCredit(username) {
        if (this.agentUsername == '' || this.agentUsername == '') {
            return false
        }

        var config = {
            method: "post",
            url: `${BaseUrl}/getbalance`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword,
                username
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: data.message,
                errorType: data.errorType
            };
        }

        return {
            status: 1,
            current_credit: data.data.current_credit,
            in_game_credit: data.data.in_game_credit
        };
    }
    async checkTurnOverWithUser(user,start, end) {
        if (this.agentUsername == '' || this.agentUsername == '') {
            return false
        }

        var config = {
            method: "post",
            url: `${BaseUrl}/turnover`,
            timeout: 20000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://mskids.dev',
                'apikey': this.apiKey
            },
            data: {
                agentUsername: this.agentUsername,
                agentPassword: this.agentPassword,
                username: user,
                dateTimeFrom: start,
                dateTimeTo: end,
            },
        };

        const { data } = await axios(config);
        if (!data.status) {
            return {
                status: 0,
                message: data.message,
                errorType: data.errorType
            };
        }

        return {
            status: 1,
            data: data.data
        };
    }
}

module.exports = Ufa;
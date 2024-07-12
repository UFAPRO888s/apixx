const axios = require("axios");
const loginConstant = require("./constants/login.constant");
const transConstant = require("../scb/constants/transaction.constant");
const { serviceError, handleError } = require("./helpers/error.helper");
const dayjs = require("dayjs");

const redis = require("redis");
const md5 = require("md5");
const client = redis.createClient({
    url: process.env.HOST_REDIS || null,
});
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

async function checkCache(key) {
    let name = process.env.DB_NAME_AUTO;
    let hashKey = md5(`${name}${key}`);
    // console.log(hashKey)
    const data = await client.get(hashKey, (err, result) => {
        if (err) {
            return false;
        } else {
            return result;
        }
    });
    return JSON.parse(data);
}

async function saveCache(key, value, timeCahche = 45) {
    let name = process.env.DB_NAME_AUTO;
    let hashKey = md5(`${name}${key}`);
    await client.setEx(hashKey, timeCahche, JSON.stringify(value));
    return value;
}
function getProxy() {
    return process.env.PROXY_IP.split(':');
}

/**========================================================== *
const deviceId = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
const pin = "xxxxxx";
const account = "4301171891";
/**========================================================== */
const urlScbEasy = "https://fasteasy.scbeasy.com";
const proxuu = getProxy();
const axiosInsLogin = axios.create({
    baseURL: "https://fasteasy.scbeasy.com:8443/v3",
    timeout: 60000,
    headers: {
        "Accept-Language": "th",
        "scb-channel": "APP",
        "user-agent": "Android/11;FastEasy/3.71.0/7422",
        "Content-Type": "application/json; charset=UTF-8",
        Host: "fasteasy.scbeasy.com:8443",
        Connection: "close",
    },
    proxy: {
        protocol: 'http',
        host: proxuu[0],
        port: proxuu[1],
        auth: {
            username: proxuu[2],
            password: proxuu[3]

        },
    },
});

class Scb {
    constructor(deviceId, pin) {
        if (deviceId) this.deviceId = deviceId;
        if (pin) this.pin = pin;
    }
    loginScbPreloadAndResumeCheck() {
        const deviceId = this.deviceId;
        return axiosInsLogin
            .post("/login/preloadandresumecheck", {
                deviceId,
                jailbreak: "0",
                tilesVersion: "39",
                userMode: "INDIVIDUAL",
            })
            .then((response) => {
                const { code: resCode } = response.data.status;
                if (resCode === 1000) {
                    const { "api-auth": apiAuth } = response.headers;
                    return apiAuth;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch((error) => {
                throw new serviceError(loginConstant[error.message]);
            });
    }

    loginScbPreAuth(apiAuth) {
        return axios
            .post(
                `${urlScbEasy}/isprint/soap/preAuth`, {
                    loginModuleId: "PseudoFE",
                }, {
                    headers: {
                        "Api-Auth": apiAuth,
                        "Content-Type": "application/json",
                    },
                    proxy: {
                        protocol: 'http',
                        host: proxuu[0],
                        port: proxuu[1],
                        auth: {
                            username: proxuu[2],
                            password: proxuu[3]
                
                        },
                    },
                }
            )
            .then((response) => {
                const resData = response.data;
                const { statusdesc: statusDesc } = resData.status;
                if (statusDesc === "success") {
                    return {
                        hashType: resData.e2ee.pseudoOaepHashAlgo,
                        sId: resData.e2ee.pseudoSid,
                        serverRandom: resData.e2ee.pseudoRandom,
                        pubKey: resData.e2ee.pseudoPubKey,
                    };
                } else {
                    throw new Error();
                }
            })
            .catch((error) => {
                throw new serviceError(error);
            });
    }

    loginScbApiPin(preAuth, pin) {
        const params = new URLSearchParams();
        params.append("Sid", preAuth.sId);
        params.append("ServerRandom", preAuth.serverRandom);
        params.append("pubKey", preAuth.pubKey);
        params.append("hashType", preAuth.hashType);
        params.append("pin", pin);
        return axios
            .post("http://scb_all-pin/pin/encrypt", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            })
            .then((response) => {
                const resData = response.data;
                if (resData) {
                    return resData;
                } else {
                    throw new Error();
                }
            })
            .catch((error) => {
                throw new serviceError(error);
            });
    }

    loginScbFasteasy(pseudoPin, preAuth, apiAuth) {
        const params = new URLSearchParams();
        params.append("Sid", preAuth.sId);
        params.append("ServerRandom", preAuth.serverRandom);
        params.append("pubKey", preAuth.pubKey);
        params.append("hashType", preAuth.hashType);
        params.append("pin", this.pin);
        return axios
            .post(
                `${urlScbEasy}/v1/fasteasy-login`, {
                    deviceId: this.deviceId,
                    pseudoPin: pseudoPin,
                    pseudoSid: preAuth.sId,
                }, {
                    headers: {
                        "Api-Auth": apiAuth,
                        "user-agent": "Android/11;FastEasy/3.71.0/7422",
                        Host: "fasteasy.scbeasy.com",
                        "Content-Type": "application/json",
                    },
                    proxy: {
                        protocol: 'http',
                        host: proxuu[0],
                        port: proxuu[1],
                        auth: {
                            username: proxuu[2],
                            password: proxuu[3]
                
                        },
                    },
                }
            )
            .then((response) => {
                const { code: resCode } = response.data.status;

                if (resCode === 1000) {
                    const { "api-auth": apiAuth } = response.headers;
                    return apiAuth;
                } else {
                    console.log(response.data);
                    throw new Error('code_1060');
                }
            })
            .catch((error) => {
                throw new serviceError(loginConstant[error.message]);
            });
    }

    async handleLoginScb() {
        try {
            // Old fastLogin
            // const apiAuth = await this.loginScbPreloadAndResumeCheck();
            // const preAuth = await this.loginScbPreAuth(apiAuth);
            // const apiPin = await this.loginScbApiPin(preAuth, this.pin);
            // const fastLogin = await this.loginScbFasteasy(apiPin, preAuth, apiAuth);
            // return fastLogin;
            let fastLogin = await checkCache(md5('apiAuth'));
            if (!fastLogin) {
                const apiAuth = await this.loginScbPreloadAndResumeCheck();
                const preAuth = await this.loginScbPreAuth(apiAuth);
                const apiPin = await this.loginScbApiPin(preAuth, this.pin);
                fastLogin = await this.loginScbFasteasy(apiPin, preAuth, apiAuth);
                await saveCache(md5('apiAuth'), fastLogin);
                return fastLogin;
            }
            return fastLogin;
        } catch (error) {
            console.log("handleLoginScb", error);
            return handleError(error);
        }
    }

    getTransaction = async(data) => {
        const dataObj = {
            accountNo: data.accountNo,
            startDate: data.startDate || dayjs().date(1).format(),
            endDate: data.endDate || dayjs().format(),
            pageNumber: data.pageNumber || 1,
            pageSize: data.pageSize || 20,
            productType: data.productType || "2",
        };
        const apiAuth = await this.handleLoginScb();
        return axios
            .post(`${urlScbEasy}/v2/deposits/casa/transactions`, dataObj, {
                headers: {
                    "Api-Auth": apiAuth,
                    "Accept-Language": "th",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                proxy: {
                    protocol: 'http',
                    host: proxuu[0],
                    port: proxuu[1],
                    auth: {
                        username: proxuu[2],
                        password: proxuu[3]
            
                    },
                },
            })
            .then((response) => {
                const data = response.data;
                console.log(data);
                const { code: resCode } = data.status;
                if (resCode === 1000) {
                    return data.data;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch((error) => {
                return handleError(new serviceError(transConstant[error.message]));
            });
    };

    tranferTruewallets = async (data) => {
        const dataObj = {
            annotation: '',
            note: 'TOPUP',
            serviceNumber: data.phoneNumber,
            pmtAmt: data.amount,
            billerId: 8,
            depAcctIdFrom: data.accnum,
        };
        const apiAuth = await this.handleLoginScb();
        return axios
            .post(`${urlScbEasy}/v2/topup/billers/8/additionalinfo`, dataObj, {
                headers: {
                    "Api-Auth": apiAuth,
                    "Accept-Language": "th",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                proxy: {
                    protocol: 'http',
                    host: proxuu[0],
                    port: proxuu[1],
                    auth: {
                        username: proxuu[2],
                        password: proxuu[3]
            
                    },
                },
            })
            .then((response) => {
                const data = response.data;
                const { code: resCode } = data.status;
                if (resCode === 1000) {
                    return data.data;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch(async(error) => {
                return handleError(new serviceError(transConstant[error.message]));  
            });
    };
    topUPTruewallets = async (data) => {
        const dataObj = data;
        const apiAuth = await this.handleLoginScb();
        return axios
            .post(`${urlScbEasy}/v2/topup`, dataObj, {
                headers: {
                    "Api-Auth": apiAuth,
                    "Accept-Language": "th",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                proxy: {
                    protocol: 'http',
                    host: proxuu[0],
                    port: proxuu[1],
                    auth: {
                        username: proxuu[2],
                        password: proxuu[3]
            
                    },
                },
            })
            .then((response) => {
                const data = response.data;
                const { code: resCode } = data.status;
                if (resCode === 1000) {
                    return data.data;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch(async(error) => {
                return handleError(new serviceError(transConstant[error.message]));  
            });
    };

    withdrawTransfer = async(data) => {

        const dataObj = {
            accountFrom: data.accountTo,
            accountFromName: data.accountFromName,
            accountFromType: 2,
            accountTo: data.accountTo,
            accountToBankCode: data.accountToBankCode,
            accountToName: data.accountToName,
            amount: data.amount,
            botFee: 0.0,
            channelFee: 0.0,
            fee: 0.0,
            feeType: '',
            pccTraceNo: data.pccTraceNo,
            scbFee: 0.0,
            sequence: data.sequence,
            terminalNo: data.terminalNo,
            transactionToken: data.transactionToken,
            transferType: data.transferType,
        };
        const apiAuth = await this.handleLoginScb();
        return axios
            .post(`${urlScbEasy}/v3/transfer/confirmation`, dataObj, {
                headers: {
                    "Api-Auth": apiAuth,
                    "Accept-Language": "th",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                proxy: {
                    protocol: 'http',
                    host: proxuu[0],
                    port: proxuu[1],
                    auth: {
                        username: proxuu[2],
                        password: proxuu[3]
            
                    },
                },
            })
            .then((response) => {
                const data = response.data;
                const { code: resCode } = data.status;
                if (resCode === 1000) {
                    return data.data;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch((error) => {
                return handleError(new serviceError(transConstant[error.message]));
            });
    };
    verify = async(data) => {

        let transferType = '';
        if (data.accountToBankCode == "014") {
            transferType = "3RD";
        } else {
            transferType = "ORFT";
        }
        const dataObj = {
            accountFrom: data.accnum,
            accountFromType: 2,
            accountTo: data.accountTo,
            accountToBankCode: data.accountToBankCode,
            amount: data.amount,
            annotation: null,
            transferType: transferType,
        };
        const apiAuth = await this.handleLoginScb();
        return axios
            .post(`${urlScbEasy}/v2/transfer/verification`, dataObj, {
                headers: {
                    "Api-Auth": apiAuth,
                    "Accept-Language": "th",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                proxy: {
                    protocol: 'http',
                    host: proxuu[0],
                    port: proxuu[1],
                    auth: {
                        username: proxuu[2],
                        password: proxuu[3]
            
                    },
                },
            })
            .then((response) => {
                const data = response.data;
                const { code: resCode } = data.status;
                if (resCode === 1000) {
                    return data.data;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch((error) => {
                return handleError(new serviceError(transConstant[error.message]));
            });
    };

    checkBalance = async(data) => {
        const dataObj = {
            depositList: [{
                accountNo: data.accountNo
            }],
            numberRecentTxn: 2,
            tilesVersion: 39,
        };
        const apiAuth = await this.handleLoginScb();
        return axios
            .post(`${urlScbEasy}/v2/deposits/summary`, dataObj, {
                headers: {
                    "Api-Auth": apiAuth,
                    "Accept-Language": "th",
                    "Content-Type": "application/json; charset=UTF-8",
                },
                proxy: {
                    protocol: 'http',
                    host: proxuu[0],
                    port: proxuu[1],
                    auth: {
                        username: proxuu[2],
                        password: proxuu[3]
            
                    },
                },
            })
            .then((response) => {
                const data = response.data;
                const { code: resCode } = data.status;
                if (resCode === 1000) {
                    return data.totalAvailableBalance;
                } else {
                    throw new Error(`code_${resCode}`);
                }
            })
            .catch((error) => {
                return handleError(new serviceError(transConstant[error.message]));
            });
    };

}

module.exports = Scb;
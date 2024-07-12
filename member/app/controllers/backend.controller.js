const queryMember = require("../functions/qdmbackend");
const queryTrueWallet = require('../functions/qdmTrueWallet');
const stt = require("../../constants/statusText");
let crypto = require("crypto");
let request = require("request");
let querystring = require("querystring");
const jwt = require("jsonwebtoken");
const util = require("util");
const jwtVerifyAsync = util.promisify(jwt.verify);
const site = require("../../constants/urlsite");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");

const httpStatusCodes = require("../../constants/httpStatusCodes");
const { database } = require("../../constants/dbCon");
const lottoHouse = require("../library/lottoHouse/lottoHouse");
const dayjs = require("dayjs");
// const scb = require("../library/scb/scb");
const truewallet = require("../library/truewallet/truewallet");
const ufa = require("../library/ufa/ufa");
const axios = require("axios");
const wallet = require("./wallet.controller");
const qs = require("qs");
const { query } = require("express");
const { start } = require("repl");
const e = require("express");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const md5 = require("md5");


const exec = util.promisify(require("child_process").exec);

const { upload, space } = require("../functions/file-upload");

const singleupload = upload.single("file");

const logs = require("../library/logs");

// ###########################  Unity Function #########################################
function aes256(password) {
    return new Promise((resolve, reject) => {
        let genpw = password;
        let fp1 = genpw;
        let key = "aPjr2QDDfjmb72Vs";
        let cipher = crypto.createCipher("aes256", key);
        let fp2 = cipher.update(fp1, "base64", "base64") + cipher.final("base64");
        resolve({ genpw: genpw, fp2: fp2 });
    });
}

function formatMoneyNotDecimal(n, c, d, t) {
    var c = isNaN((c = Math.abs(c))) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return (
        s +
        (j ? i.substr(0, j) + t : "") +
        i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t)
    );
}

function formatTime(d) {
    let date = new Date(d);
    let hh = date.getHours();
    let mm = date.getMinutes();
    let ss = date.getSeconds();
    if (hh < 10) {
        hh = "0" + hh;
    }
    if (mm < 10) {
        mm = "0" + mm;
    }
    if (ss < 10) {
        ss = "0" + ss;
    }
    let result = hh + ":" + mm + ":" + ss;
    return result;
}

function formatDate(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = yy + "/" + mmm + "/" + dd;
    return result;
}

function formatDate1(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = yy + "-" + mmm + "-" + dd;
    return result;
}

function formatDateCheck(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = mmm + "/" + dd + "/" + yy;
    return result;
}

function formatDateBase(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = dd + "-" + mmm + "-" + yy;
    return result;
}

function formatDateBaseMonth(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = mmm + "-" + yy;
    return result;
}

function formatDateBaseMonthLotto(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = yy + "-" + mmm;
    return result;
}

function sendMessageLineNotify(token, messageBody) {
    request({
        method: "POST",
        uri: "https://notify-api.line.me/api/notify",
        headers: {
            "Content-Type": "application/json",
        },
        auth: {
            bearer: token,
        },
        form: {
            message: messageBody,
        },
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function delay(ms = 1000) {
    return new Promise((r) => setTimeout(r, ms));
}

async function authenParse(token) {
    try {
        let split = token;
        let parseToken = split.split("Bearer ");
        let result = await parseJwt(parseToken[1]);
        // console.log(parseToken[0]);
        // console.log(parseToken[1]);
        return result;
    } catch (e) {
        return false;
    }
}

function generateAccessToken(params) {
    return new Promise((resolve, reject) => {
        let payload = params;
        let secret = "eyJhbGciOiJIUzI1N";
        var token = jwt.sign(payload, secret, {
            expiresIn: "2h",
        });
        resolve(token);
    });
}

function parseJwt(token) {
    var base64Payload = token.split(".")[1];
    var payload = Buffer.from(base64Payload, "base64");
    return JSON.parse(payload.toString());
}

// ###########################  Unity Function #########################################
// res.setHeader('Content-Type', 'application/json');
// let token = await authenParse(req.headers.authorization);
// res.send({ msg: token });

async function withdrawSCB(data) {
    /**======================api scb============================ */
    const accDeposit = await queryMember.accountWithdrawNew();
    if (accDeposit.result.length !== 1) return false;
    const {
        username: deviceId,
        password: pin,
        accnum: accountNo,
    } = accDeposit.result[0];
    const scbObj = new scb(deviceId, pin);
    let dataWithdraw = {
        accnum: accountNo,
        accountTo: data.accountTo,
        accountToBankCode: data.accountToBankCode,
        amount: data.amount,
    };

    const resTrans = await scbObj.verify(dataWithdraw);
    // console.log(resTrans);
    if (resTrans) {
        let dataTransfer = {
            amount: data.amount,
            totalFee: resTrans.totalFee,
            scbFee: resTrans.scbFee,
            botFee: resTrans.botFee,
            channelFee: resTrans.channelFee,
            accountFromName: resTrans.accountFromName,
            accountTo: resTrans.accountTo,
            accountToName: resTrans.accountToName,
            accountToType: resTrans.accountToType,
            accountToDisplayName: resTrans.accountToDisplayName,
            accountToBankCode: resTrans.accountToBankCode,
            pccTraceNo: resTrans.pccTraceNo,
            transferType: resTrans.transferType,
            feeType: resTrans.feeType,
            terminalNo: resTrans.terminalNo,
            sequence: resTrans.sequence,
            transactionToken: resTrans.transactionToken,
            bankRouting: resTrans.bankRouting,
            fastpayFlag: resTrans.fastpayFlag,
            ctReference: resTrans.ctReference,
        };
        const resWithdraw = await scbObj.withdrawTransfer(dataTransfer);
        return resWithdraw;
    } else {
        return false;
    }
}

async function withdrawTrueWallet(data) {
    const accDeposit = await queryMember.accountWithdrawTruewallet();
    let phone = accDeposit.result[0].accnum;
    let pass = accDeposit.result[0].username;
    let pin = accDeposit.result[0].password;
    let token = accDeposit.result[0].token;
    const trueWalletObj = new truewallet(phone, pass, pin);
    const dataTrans = {
        phone: phone,
        pin: pin,
        pass: pass,
        ref: data.username,
        amount: data.amount,
        type: "P2p",
        token: token
    };
    const resTrans = await trueWalletObj.ApiTransfer(dataTrans);
    if (resTrans.code == "MAS-401" && resTrans.message == "MAS-401 - Data unavailable. Please login again.") {
        let reToken = await LoginRefech()
        if (reToken) {
            const dataTrans = {
                phone: phone,
                pin: pin,
                pass: pass,
                ref: data.username,
                amount: data.amount,
                type: "P2p",
                token: reToken
            };

            const resTrans = await trueWalletObj.ApiTransfer(dataTrans);
            return resTrans;
        }
    }

    return resTrans;
}

async function LoginRefech() {
    const trueWalletObj = new truewallet();
    const resLogin = await trueWalletObj.ApiLogin();
    if (resLogin.code == "MAS-200") {
        let token = resLogin.data.access_token
        await queryMember.accountWithdrawTruewalletUpdateToken(token)
        return token
    } else {
        return false
    }
}

async function checkBalance() {
    /**======================api scb============================ */
    const accDeposit = await queryMember.accountWithdraw("scb");
    // if (accDeposit ? .result.length !== 1) return false;
    if (accDeposit.result.length !== 1) return false;
    const {
        username: deviceId,
        password: pin,
        accnum: accountNo,
    } = accDeposit.result[0];
    const scbObj = new scb(deviceId, pin);
    let dataBalance = {
        accountNo: accountNo,
    };
    const resTrans = await scbObj.checkBalance(dataBalance);
    if (resTrans) {
        return resTrans;
    } else {
        return false;
    }
}

async function checkBalanceWithID(type, id) {
    /**======================api scb============================ */
    let accDeposit = "";
    if (type == 0) {
        accDeposit = await queryMember.accountDepositByID(id);
    } else {
        accDeposit = await queryMember.accountWithdrawByID(id);
    }

    // if (accDeposit ? .result.length !== 1) return false;
    if (accDeposit.result.length !== 1) return false;
    const {
        username: deviceId,
        password: pin,
        accnum: accountNo,
    } = accDeposit.result[0];
    const scbObj = new scb(deviceId, pin);
    let dataBalance = {
        accountNo: accountNo,
    };
    const resTrans = await scbObj.checkBalance(dataBalance);
    if (resTrans) {
        return resTrans;
    } else {
        return false;
    }
}

async function checkboard() {
    // var config = {
    //     method: "post",
    //     url: site.url_auto8483 + "/ApiBoardAnnounce",
    // };

    return {
        "statusCode": 200,
        "statusCodeText": "200",
        "notice": [{
            "id": 12,
            "description": "เทส 1",
            "description_sub": null,
            "cre_date": "2022-10-30T10:09:55.000Z",
            "type": 0
        },
        {
            "id": 2,
            "description": "ธนาคารไทยพาณิชณ์ ปิดปรับปรุง",
            "description_sub": null,
            "cre_date": "2022-09-03T06:17:59.000Z",
            "type": 0
        },
        {
            "id": 1,
            "description": "ธนาคารไทยพาณิชณ์ ปิดปรับปรุง",
            "description_sub": null,
            "cre_date": "2022-09-03T06:15:52.000Z",
            "type": 0
        }
        ],
        "game": [{
            "id": 9,
            "description": "หวย ปิดตอนนี้",
            "description_sub": null,
            "cre_date": "2022-09-03T06:24:59.000Z",
            "type": 2
        },
        {
            "id": 8,
            "description": "ufa ปิดตอนนี้",
            "description_sub": null,
            "cre_date": "2022-09-03T06:23:59.000Z",
            "type": 1
        },
        {
            "id": 7,
            "description": "ufa ปิดตอนนี้",
            "description_sub": null,
            "cre_date": "2022-09-03T06:22:59.000Z",
            "type": 1
        },
        {
            "id": 6,
            "description": "ufa ปิดตอนนี้",
            "description_sub": null,
            "cre_date": "2022-09-03T06:21:59.000Z",
            "type": 1
        },
        {
            "id": 5,
            "description": "ufa ปิดตอนนี้",
            "description_sub": null,
            "cre_date": "2022-09-03T06:20:59.000Z",
            "type": 1
        }
        ]
    };
}

async function agent_info() {
    var config = {
        method: "post",
        url: site.url + "/apibackend/agent_info",
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function checkWinLoss(username, dateS, dateE) {
    let datas = await queryMember.queryFindMemberByMember(username);
    let usernameUFA = datas.result[0].username;
    var data = qs.stringify({
        date: dateS,
        dateEnd: dateE,
        username: usernameUFA,
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/checkWinLossUser",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function LoginLottoByAPI(req) {
    let datas = await queryMember.queryMemberLottoByID(req);
    var data = JSON.stringify({
        username: datas.result[0].username,
        password: datas.result[0].password,
    });
    var config = {
        method: "post",
        url: "https://wallet-keynumber.ddns.net/login-external",
        headers: {
            Authorization: "Bearer " + req.body.token,
            "Content-Type": "application/json",
        },
        data: data,
    };
    return axios(config)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
        });
}

function validateJsonWebhook(request) {
    // calculate the signature
    const expectedSignature = crypto
        .createHmac("sha256", `mskids`)
        .update(JSON.stringify(request.body))
        .digest("hex");
    expectedSignature = `mskids`;

    return expectedSignature;
}

module.exports.upload = async (req, res) => {
    singleupload(req, res, function (err) {
        if (err) {
            return res.status(422).send({
                errors: [{ title: "Image Upload Error", detail: err.message }],
            });
        }
        let cdn = req.file.location.split("sgp1.");
        cdn = cdn[0] + "sgp1.cdn." + cdn[1];
        return res.json({ imageUrl: req.file.location });
    });
};

module.exports.delupload = async (req, res) => {
    var params = { Bucket: 's3auto', Key: 'undefined/xtOgiTgHn-unnamed.png' };

    space.deleteObject(params, function (err, data) {
        if (err) {
            return res.status(422).send({
                errors: err,
            });
        }
        return res.json(`Success : ${data}`);
    });
};

module.exports.Logs = async (req, res) => {
    // console.log(logs);
    let rll = [];
    for (const rr of logs) {
        // console.log(rr, '\n');
        rll.push(rr);
    }
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="refresh" content="20">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logs Pm2</title>
    <style>pre{font-size: 14px}a{text-decoration: none}h4{color:#697f22;}</style>
</head>
<body>
    <pre>${rll.reverse().join("\n")}</pre>
</body>
</html>`);
};

module.exports.testufa = async (req, res) => {
    try {
        let old_credit = await global.ufa.agentInfo()
    console.log("🚀 ~ module.exports.testufa= ~ old_credit:", old_credit)
    } catch (error) {
        console.log("🚀 ~ module.exports.testufa= ~ error:", error)

    }

};

module.exports.gitpull = async (req, res) => {
    // console.log(req.body.secret)
    var expected = req.body.secret;
    // var calculated = validateJsonWebhook(req);

    if ("mskids" !== expected) {
        res.status(400).send(`Invalid sigsnature!`);
    } else {
        const { stdout, stderr } = exec("git stash && git pull && pm2 restart all");
        res.send(`Valid signature!`);
    }
};

module.exports.pm2restart = async (req, res) => {
    const { stdout, stderr } = await exec("pm2 restart all");
    console.log("Logs:", stdout);
    console.log("Error:", stderr);
    res.send({ Logs: stdout, Error: stderr });
};

module.exports.testToken = async (req, res) => {
    let responeData;
    res.setHeader("Content-Type", "application/json");
    var data =
        "username=4ufirework06&password=a1b2c3d4&repassword=a1b2c3d4&email=firework.tn%40gmail.com&phone=0875886231&page=1&totalRecord=0";

    var config = {
        method: "post",
        url: "https://member.dragonica.in.th/api/register2.php",
        headers: {
            "Content-Type": "application/javascript",
        },
        data: data,
    };

    axios(config)
        .then(function (response) {
            res.send(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
};

module.exports.ApiLoginLotto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    let datas = await queryMember.queryMemberLottoByID(req);
    const objLottoHoust = new lottoHouse(
        datas.result[0].username,
        datas.result[0].password
    );
    let token = await objLottoHoust.memberLogin(
        datas.result[0].username,
        datas.result[0].password
    );
    responeData.statusCode = httpStatusCodes.Success.ok.code;
    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
    responeData.token = token;
    res.send({ result: responeData });
};

module.exports.testSMS = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    let data = {
        com: req.body.source,
        action: req.body.action,
        from: req.body.from,
        message: req.body.message,
        send_time: req.body.send_time,
        receive_time: req.body.receive_time,
        sms_central: req.body.sms_central,
    };
    let messageLineNotify = "";
    messageLineNotify += "\n▶SMS OTP◀";
    messageLineNotify += "\nเครื่อง => " + data.com;
    messageLineNotify += "\nเบอร์ => " + data.sms_central;
    messageLineNotify += "\nAPP => " + data.from;
    messageLineNotify += "\nข้อความ => " + data.message;
    messageLineNotify +=
        "\nเวลาส่งขอ OTP => " +
        formatDate1(data.send_time) +
        " " +
        formatTime(data.send_time);
    messageLineNotify +=
        "\nเวลาได้รับ OTP => " +
        formatDate1(data.receive_time) +
        " " +
        formatTime(data.receive_time);
    sendMessageLineNotify(
        "djeVB49Zb1Xo7JzvUL0TyrgU9XyBIFgy7wf8javdB7C",
        messageLineNotify
    );
    res.send({ result: "" });
};
module.exports.createSite = async (req, res) => {
    let responeData = {};
    try {
        res.setHeader("Content-Type", "application/json");
        data = await queryMember.querySettingSystem(req);
        let message =
            "\nWeb =>" +
            data.result[0].name_web +
            "\nIP => " +
            req.body.ipAddress +
            "\nCity => " +
            req.body.city +
            "," +
            req.body.stateProv +
            "\nCountry => " +
            req.body.countryName +
            "\nDate => " +
            formatDate(new Date()) +
            " " +
            formatTime(new Date());
        // sendMessageLineNotify('oW0LayiJM4Wdd6VGd0bswVypLdTQGGqW0FnVEthxMQd', message);
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
    res.send({});
};

async function checkAuth(token_o) {
    let result = {};
    let split_auth = token_o.split(" ");
    let token = split_auth[1];
    let data = await queryMember.queryLogToken(token);
    if (data.status && data.result.length > 0) {
        let decodedToken = await parseJwt(token);
        result.playload = decodedToken;
        var isExpiredToken = false;
        let dateNow = new Date();
        if (decodedToken.exp < dateNow.getTime() / 1000) {
            isExpiredToken = true;
        }
        if (!isExpiredToken) {
            result.status = true;
            result.txt = token;
        } else {
            let id = data.result[0].id;
            result.status = false;
            result.msg = "Token Expired";
            await queryMember.deleteLogToken(id);
        }
    } else {
        result.status = false;
        result.msg = stt.tokenFail.description;
    }
    return result;
}

module.exports.Login = async (req, res) => {
    // const fataBodx = await req.text()
    console.log(req.body)
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // var query = require('url').parse(req.url, true).query;

    let data = await queryMember.queryDataLogin(req);
    if(!data)return
    // console.log(data[0])
    if (data.status && data.result.length > 0) {
        const result = compareSync(req.body.password, data.result[0].password);
        if (result) {
            if (data.result[0].stats == 99 || data.result[0].stats == 109) {
                if (data.result[0].secert_code == req.body.secert) {
                    let dataR = {
                        id: data.result[0].id,
                        username: data.result[0].username,
                        stats: data.result[0].stats,
                        ip: req.body.ip,
                    };
                    let resultJwtData = await generateAccessToken(dataR);
                    responeData.token = resultJwtData;
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.description = "Login Success!";
                    let data_ins = {
                        token: resultJwtData,
                        ip: req.body.ip.ipAddress,
                    };
                    data = await queryMember.querySettingSystem(req);
                    let message =
                        "\nWeb =>" +
                        data.result[0].name_web +
                        "\nสมาชิก => " +
                        req.body.username +
                        "[ " +
                        req.body.secert +
                        " ]\nระบบ => Login Page Success\nIP => " +
                        req.body.ip.ipAddress +
                        "\nCountry => " +
                        req.body.ip.countryName +
                        "\nCity => " +
                        req.body.ip.city +
                        "," +
                        req.body.ip.stateProv +
                        "\nDate => " +
                        formatDate(new Date()) +
                        " " +
                        formatTime(new Date());
                    if (req.body.username != "Firework") {
                        // sendMessageLineNotify('oW0LayiJM4Wdd6VGd0bswVypLdTQGGqW0FnVEthxMQd', message);
                    }
                    await queryMember.insertTokenTodatabase(data_ins);
                    req.body.ip = req.body.ip.ipAddress;
                    req.body.detail = "Login";
                    req.body.module = "Page Login";
                    req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                    await queryMember.insertReportActivity(req);
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.description = "Secert Code Wrong!";
                    data = await queryMember.querySettingSystem(req);
                    let message =
                        "\nWeb =>" +
                        data.result[0].name_web +
                        "\nสมาชิก => " +
                        req.body.username +
                        "[ " +
                        req.body.secert +
                        " ]\nระบบ => Secert Wrong\nIP => " +
                        req.body.ip.ipAddress +
                        "\nCountry => " +
                        req.body.ip.countryName +
                        "\nCity => " +
                        req.body.ip.city +
                        "," +
                        req.body.ip.stateProv +
                        "\nDate => " +
                        formatDate(new Date()) +
                        " " +
                        formatTime(new Date());
                    if (req.body.username != "Firework") {
                        // sendMessageLineNotify('oW0LayiJM4Wdd6VGd0bswVypLdTQGGqW0FnVEthxMQd', message);
                    }
                }
            } else {
                let dataR = {
                    id: data.result[0].id,
                    username: data.result[0].username,
                    stats: data.result[0].stats,
                    category: data.result[0].category,
                    ip: req.body.ip,
                };
                let resultJwtData = await generateAccessToken(dataR);
                responeData.token = resultJwtData;
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.category = data.result[0].category;
                responeData.description = "Login Success!";
                data = await queryMember.querySettingSystem(req);
                let message =
                    "\nWeb =>" +
                    data.result[0].name_web +
                    "\nสมาชิก => " +
                    req.body.username +
                    "[ " +
                    req.body.secert +
                    " ]\nระบบ => Login Page Success\nIP => " +
                    req.body.ip.ipAddress +
                    "\nCountry => " +
                    req.body.countryName +
                    "\nDate => " +
                    formatDate(new Date()) +
                    " " +
                    formatTime(new Date());
                if (req.body.username != "Firework") {
                    // sendMessageLineNotify('oW0LayiJM4Wdd6VGd0bswVypLdTQGGqW0FnVEthxMQd', message);
                }
                let data_ins = {
                    token: resultJwtData,
                    ip: req.body.ip.ipAddress,
                };
                await queryMember.insertTokenTodatabase(data_ins);
                req.body.ip = req.body.ip.ipAddress;
                req.body.detail = "Login";
                req.body.module = "Page Login";
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertReportActivity(req);
            }
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.description = "Username or Password Wrong!";
        }
    } else {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Username or Password Wrong!";
    }
    console.log("cxcxcxc",responeData)
    res.send(responeData);
};

module.exports.Apinav = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.count_withdraw();

            let datawithdraw_managelast = await queryMember.withdraw_managelast();
            responeData.count = data.result.length > 0 ? data.result[0].count : 0;
            responeData.withdraw_managelast =
                datawithdraw_managelast.result.length > 0 ?
                    datawithdraw_managelast.result : [];
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
        res.send(responeData);
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};
module.exports.ApiCheckAllDetail = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        if (req.body.code == "auto8483") {
            let ufa = await agent_info();
            let scb = await checkBalance();
            if (scb.status != 400) {
                responeData.credit = scb;
            } else {
                responeData.credit = "กรุณาลองใหม่อีกครั้ง";
            }
            responeData.ufa = ufa.data;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = "ไม่สามารถเข้าถึงได้";
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingGame = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        if (req.body.code == "auto8483") {
            let data = await queryMember.updateSettingGame(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = "ไม่สามารถเข้าถึงได้";
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.Apidashboard = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            var options = {
                method: "POST",
                url: site.url + "/apibackend/agent_info",
                headers: {
                    Authorization: "Bearer " + auth.txt,
                },
            };
            request(options, async function (error, response) {
                if (error) throw new Error(error);
                let result = {};
                try {
                    result = await JSON.parse(response.body);
                } catch (error) {
                    result.status = false;
                }

                if (result.status) {
                    let deposit = 0;
                    let withdraw = 0;
                    let data_deposit = await queryMember.queryTransactionDepositAll();
                    if (data_deposit.result[0].deposit) {
                        deposit += parseInt(data_deposit.result[0].deposit);
                    }
                    data_deposit = await queryMember.queryTransactionManualDepositAll();
                    if (data_deposit.result[0].deposit) {
                        deposit += parseInt(data_deposit.result[0].deposit);
                    }
                    let data_withdraw = await queryMember.queryTransactionWithdrawAll();
                    if (data_withdraw.result[0].withdraw) {
                        withdraw += parseInt(data_withdraw.result[0].withdraw);
                    }
                    data_withdraw = await queryMember.queryTransactionManualWithdrawAll();
                    if (data_withdraw.result[0].withdraw) {
                        withdraw += parseInt(data_withdraw.result[0].withdraw);
                    }

                    let token = await parseJwt(auth.txt);
                    req.body.username = token.username;
                    req.body.ip = token.ip.ipAddress;
                    req.body.detail = "เปิดหน้า Dashboard";
                    req.body.module = "Admin Page";
                    req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                    await queryMember.insertReportActivity(req);

                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.data = result.data;
                    responeData.depositall = deposit;
                    responeData.withdrawall = withdraw;
                } else {
                    responeData.statusCode =
                        httpStatusCodes.ClientErrors.unauthorized.code;
                    responeData.statusCodeText =
                        httpStatusCodes.ClientErrors.unauthorized.codeText;
                    responeData.description = result.msg;
                }
                res.send(responeData);
            });
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        console.log("Apidashboard", e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiSettingDashboard = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingSystem();
            if (data.status && data.result.length > 0) {
                responeData.token_line = data.result[0].token_line;
                responeData.token_line_game = data.result[0].token_line_game;
                responeData.token_line_depo = data.result[0].token_line_depo;
                responeData.token_line_with = data.result[0].token_line_with;
                responeData.line = data.result[0].line;
                responeData.line_admin = data.result[0].line_admin;
                responeData.name_web = data.result[0].name_web;
                responeData.d_limit = data.result[0].d_limit;
                responeData.w_limit = data.result[0].w_limit;
                responeData.aff_d = data.result[0].aff_d;
                responeData.aff_m = data.result[0].aff_m;
            }
            data = await queryMember.querySettingSystemAuto();
            if (data.status && data.result.length > 0) {
                responeData.credit_min = data.result[0].credit_min;
                responeData.credit_max = data.result[0].credit_max;
                responeData.credit_limit = data.result[0].credit_limit;
                responeData.auto_status = data.result[0].status;
            }
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.Apiquerymember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllMemberAndRef();
            if (data.status && data.result.length > 0) {
                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.ip = token.ip.ipAddress;
                req.body.detail = "เปิดหน้า Member";
                req.body.module = "Admin Page";
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertReportActivity(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = e;
    }
    res.send(responeData);
};

module.exports.ApiquerymemberByUser = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.findMemberIdByUsername(req.body.user);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = true;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryNewmember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllMemberWithDate(req.body.find);
            if (data.status && data.result.length > 0) {
                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.ip = token.ip.ipAddress;
                req.body.detail = "เปิดหน้า NewMember";
                req.body.module = "Admin Page";
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertReportActivity(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiquerymemberWarning = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let token = await parseJwt(auth.txt);
            req.body.username = token.username;
            req.body.ip = token.ip.ipAddress;
            req.body.detail = "เปิดหน้า WaringMember";
            req.body.module = "Admin Page";
            req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
            await queryMember.insertReportActivity(req);
            let data = await queryMember.queryAllMemberWarning(req.body);
            if (data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.data = [];
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryAddWarning = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let token = await parseJwt(auth.txt);
            req.body.username = token.username;
            req.body.ip = token.ip.ipAddress;
            req.body.detail = "เพิ่มข้อมูล WaringMember";
            req.body.module = "Admin Page";
            req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
            await queryMember.insertReportActivity(req);
            let member = await queryMember.findMemberIdByUsername(req.body.user);
            req.body.member_id = member.result[0].id;
            await queryMember.addMemberWarning(req.body);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryUpdateWarning = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let token = await parseJwt(auth.txt);
            req.body.username = token.username;
            req.body.ip = token.ip.ipAddress;
            req.body.detail = "อัพเดทข้อมูล WaringMember";
            req.body.module = "Admin Page";
            req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
            await queryMember.insertReportActivity(req);
            let member = await queryMember.findMemberIdByUsername(req.body.user);
            req.body.member_id = member.result[0].id;
            await queryMember.updateMemberWarning(req.body);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiquerymemberUFA = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllMemberUFA();
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateGeneralSetting = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateGeneralSetting(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateAutoSetting = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateAutoSetting(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateNotifySetting = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateNotifySetting(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            await queryMember.deleteMember(req);
            let data = await queryMember.deleteMemberUFA(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryeMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryMember(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
                data = await queryMember.queryBank();
                responeData.bank = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateMember(req);
            if (data.status) {
                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.detail = "แก้ไขข้อมูลของ คุณ" + req.body.name;
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.createMemberAndPartner = async (req) => {
    req.body.date = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const resultMember = await queryMember.createMember(req);
    const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
    if (resAdmin.status) {
        const { username: usernameRegis } = req.body;
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        await objLottoHoust.registerLottoHouse(usernameRegis);
    }
};

module.exports.ApiregisterMemberManual = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryMemberCheck(req);
            if (!(data.status && data.result.length > 0)) {
                let token = await parseJwt(auth.txt);
                var options = {
                    method: "POST",
                    url: site.url + "/apibackend/register_manual",
                    headers: {
                        Authorization: "Bearer " + auth.txt,
                    },
                    form: {
                        username: req.body.username,
                        password: req.body.password,
                        bank_number: req.body.accnum,
                        fname: req.body.name,
                        line: req.body.line,
                        bank_name: req.body.bank,
                        admin: token.username,
                        ip: token.ip.ipAddress,
                    },
                };

                request(options, async function (error, response) {
                    if (error) throw new Error(error);
                    let result = await JSON.parse(response.body);
                    if (result.status) {
                        responeData.statusCode = httpStatusCodes.Success.ok.code;
                        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                        responeData.description = result.msg;
                    } else {
                        responeData.statusCode =
                            httpStatusCodes.ClientErrors.unauthorized.code;
                        responeData.statusCodeText =
                            httpStatusCodes.ClientErrors.unauthorized.codeText;
                        responeData.description = result.msg;
                    }
                    res.send(responeData);
                });
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "ชื่อ หรือ ผู้ใช้นี้ ถูกใช้งานแล้ว";
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiupdatePlayPowyingshup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updatePlayPowyingshup(req);
            if (data.status) {
                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.detail =
                    "เติมรอบการเล่นเป่ายิ้งฉุบให้ " +
                    req.body.powyingshup_id +
                    " , จำนวน " +
                    req.body.amount_play +
                    " รอบ ,ก่อนหน้า " +
                    req.body.powyingshup_play +
                    " เพิ่มเป็น " +
                    req.body.total +
                    " || ประเภท : Manual";
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiviewCreditUserUFA = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            var options = {
                method: "GET",
                url: site.url + "/apibackend/view_credit/" + req.body.username,
                headers: {
                    Authorization: "Bearer " + auth.txt,
                },
            };
            request(options, async function (error, response) {
                if (error) throw new Error(error);
                let result = await JSON.parse(response.body);
                if (result.status) {
                    let username = req.body.username;
                    let token = await parseJwt(auth.txt);
                    req.body.username = token.username;
                    req.body.detail = "ดูเครดิต UFA ให้กับ " + username;
                    req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                    await queryMember.insertStaffHistory(req);

                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.credit = result.data.balance;
                } else {
                    responeData.statusCode =
                        httpStatusCodes.ClientErrors.unauthorized.code;
                    responeData.statusCodeText =
                        httpStatusCodes.ClientErrors.unauthorized.codeText;
                    responeData.description = result.msg;
                }
                res.send(responeData);
            });
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

async function checkTurnOverUFA(username) {
    let data = await queryMember.queryFindMemberByMember(username);

    let usernameUFA = data.result[0].username;
    var config = {
        method: "post",
        url: site.url + "/apibackend/view_Turnover_ufa/" + usernameUFA,
    };

    return axios(config)
        .then(function (response) {
            return response.data
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function checkWinlossMonth() {
    let date = new Date();
    date.setDate(1);
    var data = qs.stringify({
        date: formatDateCheck(date),
        dateEnd: formatDateCheck(new Date()),
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/check_turnover_user1",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            return response.data.msg;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function checkWinlossDashboard(date) {
    var data = qs.stringify({
        date: formatDateCheck(date),
        dateEnd: formatDateCheck(date),
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/check_turnover_user1",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            return response.data.msg;
        })
        .catch(function (error) {
            console.log(error);
        });
}
async function checkWinlossMemberOnline(type) {
    let now = moment().subtract(8, 'hour').format('YYYY-MM-DD');
    let start = moment(now).format('YYYY-MM-DD');
    let end = moment(now).format('YYYY-MM-DD');
    if (type == 1) {
        start = moment().startOf('month').format('YYYY-MM-DD');
        end = moment().endOf('month').format('YYYY-MM-DD');
    }

    var data = qs.stringify({
        date: start,
        dateEnd: end,
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/check_turnover_user",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            // console.log(response.data)
            return response.data.msg;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function checkDataToday() {
    var data = qs.stringify({
        date: formatDateCheck(new Date()),
        dateEnd: formatDateCheck(new Date()),
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/check_turnover_user_array",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            return response.data.msg;
        })
        .catch(function (error) {
            console.log(error);
        });
}

async function checkDataMonth() {
    let date = new Date();
    date.setDate(1);
    var data = qs.stringify({
        date: formatDateCheck(date),
        dateEnd: formatDateCheck(new Date()),
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/check_turnover_user_array",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            return response.data.msg;
        })
        .catch(function (error) {
            console.log(error);
        });
}

module.exports.ApimanageCredit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let memberId = req.body.id;
            let data = await queryMember.getBalanceWallet(memberId);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
            // var options = {
            //     'method': 'GET',
            //     'url': site.url + '/apibackend/view_Turnover/' + req.body.username,
            //     'headers': {
            //         'Authorization': 'Bearer ' + auth.txt
            //     }
            // };
            // request(options, async function (error, response) {
            //     if (error) throw new Error(error);
            //     let result = await JSON.parse(response.body);
            //     if (result.status) {
            //         responeData.statusCode = httpStatusCodes.Success.ok.code;
            //         responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            //         if (result.data) {
            //             responeData.turnover = result.data.turnover;
            //         } else {
            //             responeData.turnover = 0;
            //         }
            //         let data = await queryMember.queryTurnoverMember(req);
            //         if (data.status && data.result.length > 0) {
            //             responeData.historyturnover = data.result;
            //         }
            //     } else {
            //         responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            //         responeData.statusCodeText = httpStatusCodes.ClientErrors.unauthorized.codeText
            //         responeData.description = result.msg;
            //     }
            //     res.send(responeData);
            // });
            res.send(responeData);
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiaddCredit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataMember = await queryMember.queryMemberBankdetail(req);
            let username = dataMember.result[0].username;
            let memberId = req.body.id;
            let amount = req.body.amount;
            let data = await queryMember.getBalanceWallet(memberId);
            req.body.username = username;
            if (data.status && data.result.length > 0) {
                let balance = parseFloat(data.result[0].balance);
                balance += parseFloat(amount);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                const dataWallet = {
                    memberId: memberId,
                    amount: amount,
                    balance: balance,
                    walletType: "deposit",
                    refTable: "manual",
                    refId: 0,
                    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    sts: "1",
                };
                let walletRes = await queryMember.createWallet(dataWallet);
                let LastWalletID = walletRes.result.insertId;
                const dataTrans = {
                    username: username,
                    type: "1",
                    amount: amount,
                    transaction_date: req.body.days,
                    created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    stats: 0,
                    pro_id: 0,
                    date_new: dayjs().format("YYYY-MM-DD"),
                    response_api: null,
                    admin: req.body.admin,
                };
                let insTransactionWithdraw = await queryMember.createTransWithManual(
                    dataTrans
                );
                let LastTransactionID = insTransactionWithdraw.result.insertId;

                let dataUpdate = {
                    LastWaleltID: LastWalletID,
                    LastPromotionID: LastTransactionID,
                };
                await queryMember.updateRefWalletByMe(dataUpdate);

                const dataFile = {
                    trans_id: LastTransactionID,
                    file_name: req.body.fileName,
                };
                await queryMember.createFileUpload(dataFile);

                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.detail =
                    "เติมเงินให้ " +
                    username +
                    " จำนวน " +
                    amount +
                    " บาท || By " +
                    req.body.username;
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                responeData.username = username;
                res.send(responeData);
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiminusCredit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let memberId = req.body.id;
            let amount = req.body.amount;
            let data = await queryMember.getBalanceWallet(memberId);
            if (data.status && data.result.length > 0) {
                let balance = parseFloat(data.result[0].balance);
                balance -= parseFloat(amount);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                const dataWallet = {
                    memberId: memberId,
                    amount: parseFloat(amount) * -1,
                    balance: balance,
                    walletType: "withdraw",
                    refTable: "manual",
                    refId: 0,
                    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    sts: "1",
                };
                await queryMember.createWallet(dataWallet);
                res.send(responeData);
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiqueryePromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPromotion(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdatePromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updatePromotion(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryePromotionHistory = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPromotionHistory(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryeDepositHistory = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryDepositHistory(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryeUnHistoryDepositHistory = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryUnSuccessDepositHistory(req);
            if (data.status && data.result.length > 0) {
                for (let i = 0; i < data.result.length; i++) {
                    if (data.result[i].remark == "TRUEWALLET") {
                        let response_api = JSON.parse(data.result[i].response_api);
                        data.result[i].name = response_api.sub_title;
                        data.result[i].phone = response_api.transaction_reference_id;
                    }
                }
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiAddCreditUnSuccessDeposit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let token = await parseJwt(auth.txt);
            let data = await queryMember.queryUnSuccessDepositByID(req);
            let MemberUser = await queryMember.queryMember(req);
            if (data.status && data.result.length > 0) {
                let username = MemberUser.result[0].username;
                let amount = data.result[0].amount;
                let admin = token.username;
                let memberId = req.body.id;
                let WalletMember = await queryMember.getBalanceWallet(memberId);
                let balance = parseFloat(WalletMember.result[0].balance);
                balance += parseFloat(amount);
                const dataWallet = {
                    memberId: memberId,
                    amount: parseFloat(amount),
                    balance: balance,
                    walletType: "deposit",
                    refTable: "transaction",
                    refId: req.body.trans_id,
                    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    sts: "1",
                };
                await queryMember.createWallet(dataWallet);

                let dataUpdate = {
                    id: req.body.trans_id,
                    admin: admin,
                    username: username,
                };
                await queryMember.updateTransactionUnSuccess(dataUpdate);

                let detail =
                    "เติมเงินให้ " +
                    username +
                    " จำนวน " +
                    amount +
                    " บาท || Admin Deposit Unsuccess";
                req.body.detail = detail;
                req.body.username = token.username;
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
                responeData.username = username;
                responeData.amount = amount;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryeWithdrawHistory = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryWithdrawHistory(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

async function withdrawTrueWallets(dataWith) {
    /**======================api scb============================ */
    const accWihdraw = await queryMember.accountWithdraw("scb");
    // console.log("🚀 ~ file: backend.controller.js:276 ~ handleGetTransaction ~ accDeposit:", accDeposit)
    // return

    if (accWihdraw.result.length !== 1) {
        return false;
    }
    const {
        username: deviceId,
        password: pin,
        accnum: accountNo,
    } = accWihdraw.result[0];

    const scbObj = await new scb(deviceId, pin);

    let dataWithdraw = {
        accnum: accountNo,
        phoneNumber: dataWith.bankacc,
        amount: dataWith.amount,
    };

    const resTrans = await scbObj.tranferTruewallets(dataWithdraw);
    // console.log("🚀 ~ file: backend.controller.js:596 ~ withdrawTrueWallets ~ resTrans:", resTrans)
    // return
    if (resTrans.transactionToken) {
        let dataTransfer = {
            depAcctIdFrom: accountNo,
            billerId: 8,
            mobileNumber: dataWithdraw.phoneNumber,
            misc2: '',
            note: '',
            pmtAmt: dataWithdraw.amount,
            feeAmt: 0.0,
            misc1: '',
            serviceNumber: dataWithdraw.phoneNumber,
            transactionToken: resTrans.transactionToken,
            billRef1: resTrans.refNo1,
            billRef3: resTrans.refNo3,
            billRef2: resTrans.refNo2,
        };
        const resWithdraw = await scbObj.topUPTruewallets(dataTransfer);
        return resWithdraw;
    } else {
        return false;
    }
}

module.exports.ApiwithdrawUserAuto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryWithdrawUser(req);
            console.log("🚀 ~ file: backend.controller.js:2212 ~ module.exports.ApiwithdrawUserAuto= ~ data:", data)
            if (data.status && data.result.length > 0) {
                let token = await parseJwt(auth.txt);
                let accnum = data.result[0].accnum;
                let bank = data.result[0].code;
                let amount = data.result[0].amount;
                let id = data.result[0].mid;
                let admin = token.username;
                let username = data.result[0].member_username;
                let bankname_eng = data.result[0].bank;
                let bankname = data.result[0].bank_name;
                let memberId = data.result[0].mid;
                let walletMember = await queryMember.getBalanceWallet(memberId);
                let total_balance = walletMember.result[0].balance ?
                    walletMember.result[0].balance :
                    0;

                let name = data.result[0].name;
                let ip = token.ip.ipAddress;

                if (bankname_eng != "truewallet") {
                    let dataSend = {
                        accountTo: accnum,
                        accountToBankCode: bank,
                        amount: amount,
                    };
                    let resultSCB = await withdrawSCB(dataSend);
                    if (resultSCB.status != 400) {
                        console.log("ถอนเงินสำเร็จ :", resultSCB.transactionDateTime);
                        let data_settings = await queryMember.querySettingSystem();
                        req.body.remark = "Admin Auto";
                        req.body.response = JSON.stringify(resultSCB);
                        req.body.transaction_date = moment(resultSCB.transactionDateTime).format("YYYY-MM-DD HH:mm:ss");
                        req.body.createdBy = admin;
                        await queryMember.updateStatusWithdraw(req);
                        let detail =
                            "อนุมัติการถอนเงินให้ " +
                            username +
                            " จำนวน " +
                            data.result[0].amount +
                            " บาท || Admin Auto";
                        req.body.detail = detail;
                        req.body.username = token.username;
                        req.body.date =
                            formatDate(new Date()) + " " + formatTime(new Date());
                        await queryMember.insertStaffHistory(req);
                        let messageLineNotify = "";
                        messageLineNotify += "\n☹▶สมาชิกแจ้งถอนเงิน◀☹";
                        messageLineNotify += "\nสมาชิก => " + username;
                        messageLineNotify += "\nชื่อสมาชิก => " + name;
                        messageLineNotify +=
                            "\nธนาคารลูกค้า => " + bankname + " (" + bankname_eng + ")";
                        messageLineNotify += "\nเลขบัญชี => " + accnum;
                        messageLineNotify += "\nจำนวนเงินที่ถอน => " + amount + " บาท";
                        messageLineNotify +=
                            "\nจำนวนเงินคงเหลือ => " + total_balance + " บาท";
                        messageLineNotify += "\nถอนโดย => " + admin;
                        messageLineNotify += "\nIP => " + ip;
                        messageLineNotify += "\nสถานะ => ถอนสำเร็จแล้ว";
                        messageLineNotify +=
                            "\nเวลา => " +
                            formatDate(new Date()) +
                            " " +
                            formatTime(new Date());
                        messageLineNotify += "\nSystem => Admin Auto";
                        let token_withdraw = data_settings.result[0].token_line_with;
                        sendMessageLineNotify(token_withdraw, messageLineNotify);

                        responeData.statusCode = httpStatusCodes.Success.ok.code;
                        responeData.username = username;
                        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                        responeData.data = resultSCB;
                        responeData.status = true;
                        res.send(responeData);
                    } else {
                        responeData.statusCode = httpStatusCodes.Fail.fail.code;
                        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                        responeData.description =
                            "ไม่สามารถโอนเงินได้ กรุณารอ 1 นาทีแล้วทำรายการใหม่อีกครั้ง";
                        responeData.data = resultSCB;
                        responeData.status = false;
                        res.send(responeData);
                    }
                } else {
                    let dataSend = {
                        bankacc: accnum,
                        amount: amount,
                    };
                    let modd = amount % 10;
                    if (amount >= 100 && modd == 0) {
                        try {
                            const resWithState = await withdrawTrueWallets(dataSend)
                            if (resWithState.paymentId) {
                                let data_settings = await queryMember.querySettingSystem();
                                req.body.remark = "Admin Auto";
                                req.body.createdBy = admin;
                                req.body.response = JSON.stringify(resultSCB);
                                req.body.transaction_date = formatDate(new Date()) + " " + formatTime(new Date());
                                await queryMember.updateStatusWithdraw(req);
                                let detail =
                                    "อนุมัติการถอนเงินให้ " +
                                    username +
                                    " จำนวน " +
                                    data.result[0].amount +
                                    " บาท || Admin Auto";
                                req.body.detail = detail;
                                req.body.username = token.username;
                                req.body.date =
                                    formatDate(new Date()) + " " + formatTime(new Date());
                                await queryMember.insertStaffHistory(req);
                                let messageLineNotify = "";
                                messageLineNotify += "\n☹▶สมาชิกแจ้งถอนเงิน◀☹";
                                messageLineNotify += "\nสมาชิก => " + username;
                                messageLineNotify += "\nชื่อสมาชิก => " + name;
                                messageLineNotify +=
                                    "\nธนาคารลูกค้า => " + bankname + " (" + bankname_eng + ")";
                                messageLineNotify += "\nเลขบัญชี => " + accnum;
                                messageLineNotify += "\nจำนวนเงินที่ถอน => " + amount + " บาท";
                                messageLineNotify +=
                                    "\nจำนวนเงินคงเหลือ => " + total_balance + " บาท";
                                messageLineNotify += "\nถอนโดย => " + admin;
                                messageLineNotify += "\nIP => " + ip;
                                messageLineNotify += "\nสถานะ => ถอนสำเร็จแล้ว";
                                messageLineNotify +=
                                    "\nเวลา => " +
                                    formatDate(new Date()) +
                                    " " +
                                    formatTime(new Date());
                                messageLineNotify += "\nSystem => Admin Auto";
                                let token_withdraw = data_settings.result[0].token_line_with;
                                sendMessageLineNotify(token_withdraw, messageLineNotify);

                                responeData.statusCode = httpStatusCodes.Success.ok.code;
                                responeData.username = username;
                                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                                responeData.data = resWithState.paymentId;
                                responeData.status = true;
                            } else {
                                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                                responeData.description = 'Error code1998'
                            }
                        } catch (error) {
                            console.log("🚀 ~ file: backend.controller.js:1204 ~ module.exports.ApiwithdrawUserAuto= ~ error:", error)
                            responeData.statusCode = httpStatusCodes.Fail.fail.code;
                            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                            responeData.description = 'ไม่สามารถทำรายการได้ในขณะนี้';
                        }
                    } else {
                        responeData.statusCode = httpStatusCodes.Fail.fail.code;
                        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                        responeData.description = 'ยอดเงินไม่ถูกต้อง กรุณายกเลิกแล้วถอนใหม่อีกครั้ง';
                    }
                    res.send(responeData);
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "Can't Find Data";
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        console.log("🚀 ~ file: backend.controller.js:2370 ~ module.exports.ApiwithdrawUserAuto= ~ e:", e)
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Error try";
        res.send(responeData);
    }
};

module.exports.ApiupdateStatusWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let token = await parseJwt(auth.txt);
            let admin = token.username;
            req.body.remark = "Admin Manual";
            req.body.createdBy = admin;
            if (!req.body.transaction_date) {
                req.body.transaction_date = moment().format('YYYY-MM-DD HH:mm:ss');
            }
            let data = await queryMember.updateStatusWithdraw(req);
            if (data.status) {
                data = await queryMember.queryWithdrawUser(req);
                let ip = token.ip.ipAddress;
                let accnum = data.result[0].accnum;
                let bank = data.result[0].code;
                let amount = data.result[0].amount;
                let id = data.result[0].tid;
                let username = data.result[0].member_username;
                let usernameUFA = data.result[0].usernameUFA;
                let bank_name = data.result[0].bank;
                let detail =
                    "อนุมัติการถอนเงินให้ " +
                    data.result[0].username +
                    " จำนวน " +
                    data.result[0].amount +
                    " บาท || Admin Manual";
                req.body.detail = detail;
                req.body.username = token.username;
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                let message =
                    "\nแจ้งเตือนอนุมัติโอนเงิน \nUsername : " +
                    username +
                    "\nเลขบัญชี : " +
                    accnum +
                    "\nธนาคาร : " +
                    bank_name +
                    "\nจำนวน : " +
                    amount +
                    " บาท\nโดย : " +
                    admin +
                    "\nIP => " +
                    ip +
                    "\nเวลา => " +
                    formatDate(new Date()) +
                    " " +
                    formatTime(new Date()) +
                    "\nSystem => Admin Manual";
                data = await queryMember.querySettingSystem(req);
                sendMessageLineNotify(data.result[0].token_line_with, message);
                responeData.username = username;
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg = 'Error';
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.msg = 'Error catch';
    }
    res.send(responeData);
};

module.exports.ApiupdateUnStatusWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {

            let token = await parseJwt(auth.txt);
            let admin = token.username;
            req.body.remark = "Admin Inject";
            req.body.createdBy = admin;
            let data = await queryMember.updateUnStatusWithdraw(req);
            if (data.status) {
                data = await queryMember.queryWithdrawUser(req);
                let ip = token.ip.ipAddress;
                let accnum = data.result[0].accnum;
                let amount = data.result[0].amount;
                let tid = data.result[0].tid;
                let username = data.result[0].member_username;
                let bank_name = data.result[0].bank;
                let memberId = data.result[0].mid;
                console.log("🚀 ~ file: backend.controller.js:2472 ~ module.exports.ApiupdateUnStatusWithdraw=async ~ memberId:", memberId)
                let detail =
                    "ไม่อนุมัติการถอนเงินให้ " +
                    data.result[0].username +
                    " จำนวน " +
                    data.result[0].amount +
                    " บาท";
                req.body.detail = detail;
                req.body.username = token.username;
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                let message =
                    "\n❌แจ้งเตือนยกเลิกโอนเงินให้❌\n \nUsername : " +
                    username +
                    "\nเลขบัญชี : " +
                    accnum +
                    "\nธนาคาร : " +
                    bank_name +
                    "\nจำนวน : " +
                    amount +
                    " บาท\nโดย : " +
                    admin +
                    "\nIP => " +
                    ip +
                    "\nเวลา => " +
                    formatDate(new Date()) +
                    " " +
                    formatTime(new Date());
                data = await queryMember.querySettingSystem(req);
                let walletMember = await queryMember.getBalanceWalletDetail(memberId);
                // console.log("🚀 ~ file: backend.controller.js:2500 ~ module.exports.ApiupdateUnStatusWithdraw=async ~ walletMember:", walletMember)
                let balance = walletMember.result[0].balance;
                let total = parseFloat(balance) + parseFloat(amount);
                const dataWallet = {
                    memberId: memberId,
                    amount: amount,
                    balance: total,
                    walletType: "deposit",
                    refTable: "transaction",
                    refId: tid,
                    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    sts: "1",
                };
                await queryMember.createWallet(dataWallet);
                sendMessageLineNotify(data.result[0].token_line_with, message);
                responeData.username = username;
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        console.log("🚀 ~ file: backend.controller.js:2530 ~ module.exports.ApiupdateUnStatusWithdraw=async ~ e:", e)
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryWithdrawSuccess = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);

        if (auth.status) {
            let data = await queryMember.queryWithdrawSuccess(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryWithdrawUnSuccess = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryWithdrawUnSuccess(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

function formatDate2(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = yy + "-" + mmm;
    return result;
}

function formatDate3(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = "0" + mmm;
    }
    if (dd < 10) {
        dd = "0" + dd;
    }
    let result = yy;
    return result;
}

module.exports.ApiqueryResult = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let date_start = new Date();
            let date_end = new Date();
            date_start.setHours(0);
            date_start.setMinutes(0);
            date_start.setSeconds(0);
            date_end.setHours(23);
            date_end.setMinutes(59);
            date_end.setSeconds(59);
            date_end.setDate(date_end.getDate() + 1);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            req.body.date_start =
                formatDate1(date_start) + " " + formatTime(date_start);
            req.body.date_end = formatDate1(date_end) + " " + formatTime(date_end);
            req.body.type = 1;
            let data = await queryMember.queryResultsDeposit(req);
            responeData.deposit_today = 0;
            responeData.withdraw_today = 0;
            if (data.result[0].amount) {
                responeData.deposit_today += data.result[0].amount;
            } else {
                responeData.deposit_today += 0;
            }

            data = await queryMember.queryResultsWithdraw(req);
            if (data.result[0].amount) {
                responeData.withdraw_today += data.result[0].amount;
            } else {
                responeData.withdraw_today += 0;
            }
            responeData.total_today =
                responeData.deposit_today - responeData.withdraw_today;
            responeData.deposit_month = 0;
            responeData.withdraw_month = 0;
            let date = formatDate2(new Date());
            req.body.date = date;
            data = await queryMember.queryResultsMonthDeposit(req);
            if (data.result[0].amount) {
                responeData.deposit_month += data.result[0].amount;
            } else {
                responeData.deposit_month += 0;
            }

            data = await queryMember.queryResultsMonthWithdraw(req);
            if (data.result[0].amount) {
                responeData.withdraw_month = data.result[0].amount;
            } else {
                responeData.withdraw_month = 0;
            }
            responeData.total_month =
                responeData.deposit_month - responeData.withdraw_month;
            responeData.deposit_year = 0;
            responeData.withdraw_year = 0;
            date = formatDate3(new Date());
            req.body.date = date;
            req.body.type = 1;
            data = await queryMember.queryResultsYearDeposit(req);
            if (data.result[0].amount) {
                responeData.deposit_year = data.result[0].amount;
            } else {
                responeData.deposit_year = 0;
            }

            req.body.type = 0;
            data = await queryMember.queryResultsYearWithdraw(req);
            if (data.result[0].amount) {
                responeData.withdraw_year = data.result[0].amount;
            } else {
                responeData.withdraw_year = 0;
            }

            responeData.total_year =
                responeData.deposit_year - responeData.withdraw_year;

            // data = await queryMember.queryLastDeposit(req);
            // if (data.result.length > 0) {
            //     responeData.last_deposit = data.result;
            // } else {
            //     responeData.last_deposit = [];
            // }

            // data = await queryMember.queryTopDeposit(req);
            // if (data.result.length > 0) {
            //     responeData.top_deposit = data.result;
            // } else {
            //     responeData.top_deposit = [];
            // }

            // data = await queryMember.queryTopWithdraw(req);
            // if (data.result.length > 0) {
            //     responeData.top_withdraw = data.result;
            // } else {
            //     responeData.top_withdraw = [];
            // }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryWithdrawReport = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryReportWithdraw(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryWithdrawAutoReport = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryReportWithdrawAuto(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryDepositReport = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryReportDeposit(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

module.exports.ApiqueryFinanceReport = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let getLastDay = await getDaysInMonth(req.body.year, req.body.month);
            let month = req.body.month;
            let year = req.body.year;
            let start_date = "";
            let end_date = "";

            if (month < 10) {
                month = "0" + month;
            }

            let total = [];
            for (let i = 0; i < getLastDay; i++) {
                let total_deposit = 0;
                let total_withdraw = 0;
                let total_withdraw_cancle = 0;
                if (i < 9) {
                    start_date =
                        year + "-" + month + "-" + "0" + (i + 1) + " " + "00:00:00";
                    end_date =
                        year + "-" + month + "-" + "0" + (i + 1) + " " + "23:59:59";
                } else {
                    start_date = year + "-" + month + "-" + (i + 1) + " " + "00:00:00";
                    end_date = year + "-" + month + "-" + (i + 1) + " " + "23:59:59";
                }

                let deposit = await queryMember.queryDepositSummary(
                    start_date,
                    end_date
                );
                let withdraw = await queryMember.queryWithdrawSummary(
                    start_date,
                    end_date
                );
                let withdrawcancle = await queryMember.queryWithdrawSummaryCancle(
                    start_date,
                    end_date
                );
                if (deposit.result[0].total) {
                    total_deposit += deposit.result[0].total;
                }

                if (withdraw.result[0].total) {
                    total_withdraw += withdraw.result[0].total;
                }

                if (withdrawcancle.result[0].total) {
                    total_withdraw_cancle += withdrawcancle.result[0].total;
                }

                total.push({
                    deposit: total_deposit ? total_deposit : 0,
                    withdraw: total_withdraw ? total_withdraw : 0,
                    withdrawcancle: total_withdraw_cancle ? total_withdraw_cancle : 0,
                });
            }

            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.finance = total;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryTransactionManual = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryTransactionManual(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryStaff = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllStaff();
            if (data.status && data.result.length > 0) {
                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.ip = token.ip.ipAddress;
                req.body.detail = "เปิดหน้า STAFF";
                req.body.module = "Admin Page";
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertReportActivity(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryStaffByID = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllStaffByID(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiaddStaff = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let category = "";
            let dataCategory = "";
            for (let i = 0; i < req.body.permission.length; i++) {
                dataCategory = "";
                let permission = req.body.permission[i];
                let readMenu = permission.view == 1 ? "[R]" : "";
                let editMenu = permission.edit == 1 ? "[E]" : "";
                if (readMenu && editMenu) {
                    dataCategory = `,${permission.name} ${readMenu}${editMenu}`;
                } else if (readMenu && !editMenu) {
                    dataCategory = `,${permission.name} ${readMenu}`;
                } else if (!readMenu && editMenu) {
                    dataCategory = `,${permission.name} ${editMenu}`;
                }
                category += dataCategory;
            }
            const salt = genSaltSync(10);
            req.body.password = hashSync(req.body.password, salt);
            req.body.category = category;
            let data = await queryMember.insertStaff(req);
            if (data.status) {
                data = data.result.insertId;
                for (let i = 0; i < req.body.permission.length; i++) {
                    let permission = req.body.permission[i];
                    let permissionData = {
                        id: data,
                        menuID: permission.id,
                        menuName: permission.name,
                        view: permission.view,
                        edit: permission.edit,
                    };
                    await queryMember.insertPermission(permissionData);
                }
                let token = await parseJwt(auth.txt);
                let username = req.body.username;
                req.body.username = token.username;
                req.body.ip = token.ip.ipAddress;
                req.body.detail = "เพิ่ม STAFF ||" + username;
                req.body.module = "Admin Page";
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertReportActivity(req);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryEditStaff = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataStaff = await queryMember.queryAllStaffByID(req);
            if (dataStaff.status && dataStaff.result.length) {
                let data = await queryMember.queryEditStaff(req);
                if (data.status && data.result.length) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.data = data.result;
                    responeData.username = dataStaff.result[0].username;
                    responeData.password = dataStaff.result[0].password;
                    let lastid = await queryMember.queryLastIDMenu();
                    let arr = [];
                    for (let i = 0; i < lastid.result.length; i++) {
                        arr.push(lastid.result[i].id);
                    }
                    responeData.arrID = arr;
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteStaff = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.deleteStaff(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateStaff = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let category = "";
            let dataCategory = "";
            for (let i = 0; i < req.body.permission.length; i++) {
                dataCategory = "";
                let permission = req.body.permission[i];
                let readMenu = permission.view == 1 ? "[R]" : "";
                let editMenu = permission.edit == 1 ? "[E]" : "";
                if (readMenu && editMenu) {
                    dataCategory = `,${permission.name} ${readMenu}${editMenu}`;
                } else if (readMenu && !editMenu) {
                    dataCategory = `,${permission.name} ${readMenu}`;
                } else if (!readMenu && editMenu) {
                    dataCategory = `,${permission.name} ${editMenu}`;
                }
                category += dataCategory;
            }
            req.body.category = category;
            if (req.body.password != '') {
                const salt = genSaltSync(10);
                req.body.password = hashSync(req.body.password, salt);
            }
            let data = await queryMember.updateStaff(req);
            if (data.status) {
                for (let i = 0; i < req.body.permission.length; i++) {
                    let permission = req.body.permission[i];
                    let permissionData = {
                        menuID: permission.id,
                        view: permission.view,
                        edit: permission.edit,
                    };
                    await queryMember.UpdatePermission(permissionData);
                }
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryeStaffHistory = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryStaffHistory(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryeSettingWheel = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingWheel(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateSetting_w = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateSetting_w(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
module.exports.ApiupdateSettingWheel = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            for (let i = 0; i < req.body.arr.length; i++) {
                await queryMember.updateSettingWheel(req.body.arr[i]);
            }
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingBanner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            await queryMember.updateSettingBanner(req);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQuerySettingBanner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingBanner(req);
            responeData.data = data.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingPopup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            await queryMember.updateSettingPopup(req);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQuerySettingPopup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingPopup(req);
            responeData.data = data.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingVip = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateSettingVip(req);
            responeData.statusCode = data.statusCode;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQuerySettingVip = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingVip(req);
            responeData.data = data.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingDoc = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateSettingDoc(req);
            responeData.statusCode = data.statusCode;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQuerySettingDoc = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingDoc(req);
            responeData.data = data.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
module.exports.ApiDeleteDataImg = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let table = "";
            // console.log(__dirname);
            if (req.body.mode === "banner") {
                req.body.mode = "setting_banner";
            } else if (req.body.mode === "popup") {
                req.body.mode = "setting_popup";
            } else {
                req.body.mode = "";
            }

            if (req.body.mode === "") {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            } else {
                let filePath = await path.resolve(process.cwd() + `/..${req.body.img}`);
                // console.log(filePath)
                try {
                    fs.unlinkSync(filePath);
                    console.log("Delete Img successfully.");
                } catch (error) {
                    console.log(error);
                }

                let data = await queryMember.deleteDataImg(req.body);
                responeData.data = data.result;
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryWheelReport = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryWheelReport(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiquerySettingPowYingShup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingPowYingShup(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdatePowYingShup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updatePowYingShup(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryPowYingShupReport = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPowYingShupReport(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.withdraw = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApicheckStatusSCB = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            // let data = await queryMember.queryCheckBankSCBDetail(req);
            // if (data.status && data.result.length > 0) {
            //     responeData.accnum = data.result[0].accnum;
            //     responeData.name = data.result[0].name;
            // }

            // let result = await checkBalance();
            const settings = await queryMember.querySettingLine();
            const acc_withdraw = await queryMember.accountWithdrawNew();
            var config = {
                method: "post",
                url: `${settings.result[0].cron_internal}/checkbalance`,
                // url: `http://localhost:5002/checkbalance`,
                timeout: 20000,
                data: {
                    mode_cron: "newcron"
                },
            };
            const { data } = await axios(config);
            let bank = {
                name: acc_withdraw.result[0].name,
                accnum: acc_withdraw.result[0].accnum,
            }

            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.credit = data.data;
                responeData.status = true;
                responeData.name = bank.name
                responeData.accnum = bank.accnum
                res.send(responeData);
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = result;
                responeData.status = false;
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = e;
        res.send(responeData);
    }
};

module.exports.ApiaddAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            req.body.date = formatDate1(new Date()) + " " + formatTime(new Date());
            let data = await queryMember.insertAlliance(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "Insert Error";
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Server Error";
    }
    res.send(responeData);
};

module.exports.ApiqueryAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAlliance(req);
            if (data.status && data.result.length > 0) {
                responeData.data = data.result;
                let data_url = await queryMember.querySettingSystem();
                if (data_url.status && data_url.result.length > 0) {
                    responeData.name_web = data_url.result[0].name_web;
                }
                for (let i = 0; i < data.result.length; i++) {
                    let code = data.result[i].code;
                    let deposit = 0;
                    let withdraw = 0;
                    let check_member = await queryMember.queryAllianceMember(code);
                    responeData.data[i].member = check_member.result;
                    responeData.data[i].countmember = check_member.result.length;
                    for (let j = 0; j < check_member.result.length; j++) {
                        let check_deposit_auto = await queryMember.queryCheckDepositAuto(
                            check_member.result[j].username
                        );
                        if (check_deposit_auto.result[0].deposit) {
                            deposit += check_deposit_auto.result[0].deposit;
                        }
                        let check_deposit_manual =
                            await queryMember.queryCheckDepositManual(
                                check_member.result[j].usernameUFA
                            );
                        if (check_deposit_manual.result[0].deposit) {
                            deposit += check_deposit_manual.result[0].deposit;
                        }

                        let check_withdraw_auto = await queryMember.queryCheckWithdrawAuto(
                            check_member.result[j].username
                        );
                        if (check_withdraw_auto.result[0].deposit) {
                            withdraw += check_withdraw_auto.result[0].deposit;
                        }
                        let check_withdraw_manual =
                            await queryMember.queryCheckWithdrawManual(
                                check_member.result[j].usernameUFA
                            );
                        if (check_withdraw_manual.result[0].deposit) {
                            withdraw += check_withdraw_manual.result[0].deposit;
                        }
                    }
                    responeData.data[i].deposit = deposit;
                    responeData.data[i].withdraw = withdraw;
                    responeData.data[i].total = deposit - withdraw;
                    let receive = ((deposit - withdraw) * data.result[i].percent) / 100;
                    responeData.data[i].receive = receive;
                }

                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
            res.send(responeData);
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApideleteMemberAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.deleteMemberAlliance(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryDetailAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let code = req.body.code;
            let data = await queryMember.queryAlliance(req);
            let check_member = await queryMember.queryAllianceMember(code);
            let deposit = 0;
            let withdraw = 0;
            if (check_member.status && check_member.result.length > 0) {
                responeData.data = check_member.result;
                for (let j = 0; j < check_member.result.length; j++) {
                    req.body.username = check_member.result[j].username;
                    req.body.usernameUFA = check_member.result[j].usernameUFA;
                    responeData.data[j].deposit = 0;
                    responeData.data[j].withdraw = 0;

                    let check_deposit_auto = await queryMember.queryCheckDepositAuto1(
                        req
                    );
                    if (check_deposit_auto.result[0].deposit) {
                        deposit += check_deposit_auto.result[0].deposit;
                        responeData.data[j].deposit += check_deposit_auto.result[0].deposit;
                    }
                    let check_deposit_manual = await queryMember.queryCheckDepositManual1(
                        req
                    );
                    if (check_deposit_manual.result[0].deposit) {
                        deposit += check_deposit_manual.result[0].deposit;
                        responeData.data[j].deposit +=
                            check_deposit_manual.result[0].deposit;
                    }

                    let check_withdraw_auto = await queryMember.queryCheckWithdrawAuto1(
                        req
                    );
                    if (check_withdraw_auto.result[0].deposit) {
                        withdraw += check_withdraw_auto.result[0].deposit;
                        responeData.data[j].withdraw +=
                            check_withdraw_auto.result[0].deposit;
                    }

                    let check_withdraw_auto_1 =
                        await queryMember.queryCheckWithdrawAuto1_1(req);
                    if (check_withdraw_auto_1.result[0].deposit) {
                        withdraw += check_withdraw_auto_1.result[0].deposit;
                        responeData.data[j].withdraw +=
                            check_withdraw_auto_1.result[0].deposit;
                    }
                    let check_withdraw_manual =
                        await queryMember.queryCheckWithdrawManual1(req);
                    if (check_withdraw_manual.result[0].deposit) {
                        withdraw += check_withdraw_manual.result[0].deposit;
                        responeData.data[j].withdraw +=
                            check_withdraw_manual.result[0].deposit;
                    }
                }
            }
            responeData.deposit = deposit;
            responeData.username = data.result[0].username;
            responeData.withdraw = withdraw;
            responeData.total = deposit - withdraw;
            let receive = ((deposit - withdraw) * data.result[0].percent) / 100;
            responeData.receive = receive;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            res.send(responeData);
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiaddAllianceLog = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            req.body.date = formatDate1(new Date()) + " " + formatTime(new Date());
            let data = await queryMember.insertAllianceLog(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "Insert Error";
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Server Error";
    }
    res.send(responeData);
};

module.exports.ApiqueryAllianceLog = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllianceLog(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryAllianceByID = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllianceByID(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteMemberAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            await queryMember.deleteMember(req);
            let data = await queryMember.deleteMemberAlliance(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateMemberAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateAllianceMember(req);
            if (data.status) {
                let token = await parseJwt(auth.txt);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryTurnover = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryTurnover(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
                let total = 0;
                for (let i = 0; i < data.result.length; i++) {
                    total += parseFloat(data.result[i].turnover);
                }
                responeData.turnover = total;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.turnover = 0;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.testSCB = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    // SCBLogin().then(token => {
    //     console.log(token);
    // })
    // var config = {
    //     method: 'post',
    //     url: 'https://www.movie788.com/movie-xml.php',
    //     headers: {
    //         'Accept': 'application/xml'
    //     }
    // };

    // return axios(config)
    //     .then(function (response) {
    //         console.log(response);
    //         return response;
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //     });

    var xml = require("fs").readFileSync(
        "https://www.movie788.com/movie-xml.php",
        "utf8"
    );
    var result = convert.xml2json(xml, { compact: true, spaces: 4 });
    console.log(result);
};

module.exports.memberPartner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.insertAndUpdateMemberPartner(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.dataTableMemberPartner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryDataMemberPartner(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.getMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryAllMemberFixColumn(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.getMemberPartnerListOld = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberPartnerList(req);
        let item = [];
        let partner = req.body.partner ? req.body.partner : false;
        let senior = [];
        let master = [];
        let agent = [];
        let sub_agent = [];
        //Casino
        for (let rr of data.result) {
            rr.bet = 0;
            rr.aff = 0;
            rr.wl = 0;

            if (rr.member_type_id === 1) {
                let user = await queryMember.queryMemberWithID(rr.member_id);
                let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                rr.username = user.result.username;
                if (data2.result.length > 0) {
                    for (const rrr of data2.result) {
                        req.body.id = rrr.id;
                        let data3 = await queryMember.queryMemberPartnerTranGame(req);
                        if (data3.result.length > 0) {
                            let data_ref = data3.result[0];
                            rr.bet = rr.bet + data_ref.bet;
                            rr.aff = rr.aff + data_ref.aff;
                            rr.wl = rr.wl + data_ref.wl;
                        }
                    }
                }
                senior.push(rr);
            }
            if (rr.member_type_id === 2) {
                let user = await queryMember.queryMemberWithID(rr.member_id);
                let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                rr.username = user.result.username;
                if (data2.result.length > 0) {
                    for (const rrr of data2.result) {
                        req.body.id = rrr.id;
                        let data3 = await queryMember.queryMemberPartnerTranGame(req);
                        if (data3.result.length > 0) {
                            let data_ref = data3.result[0];
                            rr.bet = rr.bet + data_ref.bet;
                            rr.aff = rr.aff + data_ref.aff;
                            rr.wl = rr.wl + data_ref.wl;
                        }
                    }
                }
                master.push(rr);
            }
            if (rr.member_type_id === 3) {
                let user = await queryMember.queryMemberWithID(rr.member_id);
                let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                rr.username = user.result.username;
                if (data2.result.length > 0) {
                    for (const rrr of data2.result) {
                        req.body.id = rrr.id;
                        let data3 = await queryMember.queryMemberPartnerTranGame(req);
                        if (data3.result.length > 0) {
                            let data_ref = data3.result[0];
                            rr.bet = rr.bet + data_ref.bet;
                            rr.aff = rr.aff + data_ref.aff;
                            rr.wl = rr.wl + data_ref.wl;
                        }
                    }
                }
                agent.push(rr);
            }
            if (rr.member_type_id === 4) {
                let user = await queryMember.queryMemberWithID(rr.member_id);
                let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                rr.username = user.result.username;
                if (data2.result.length > 0) {
                    for (const rrr of data2.result) {
                        req.body.id = rrr.id;
                        let data3 = await queryMember.queryMemberPartnerTranGame(req);
                        if (data3.result.length > 0) {
                            let data_ref = data.result[0];
                            rr.bet = rr.bet + data_ref.bet;
                            rr.aff = rr.aff + data_ref.aff;
                            rr.wl = rr.wl + data_ref.wl;
                        }
                    }
                }
                sub_agent.push(rr);
            }
        }
        // console.log(senior)
        // console.log(master)
        // console.log(agent)
        // console.log(sub_agent)
        // lotto
        let last_data = [];
        for (let rr of senior) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }
        for (let rr of master) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }
        for (let rr of agent) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            // console.log(data_lotto.result)
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }
        for (let rr of sub_agent) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }

        let items = [];
        for (const rrr of last_data) {
            // console.log(rrr);
            if (rrr.member_type_id == partner && partner) {
                // console.log(rrr.bet_lotto, rrr.aff_lotto, rrr.wl_lotto);

                rrr.sum_lotto = rrr.bet_lotto - rrr.aff_lotto + rrr.wl_lotto;
                rrr.sum = rrr.bet - rrr.aff + rrr.wl - rrr.bet;
                let percen_lotto_me = rrr.percent_lotto / 100;
                let percen_game_me = rrr.percent_game / 100;
                let percen_lotto_company = (100 - rrr.percent_lotto) / 100;
                let percen_game_company = (100 - rrr.percent_game) / 100;
                rrr.percent_lotto_com = 100 - rrr.percent_lotto;
                rrr.percent_game_com = 100 - rrr.percent_game;

                ///Company
                rrr.sum_lotto_com = rrr.sum_lotto * percen_lotto_company;
                rrr.bet_lotto_com = rrr.bet_lotto * percen_lotto_company;
                rrr.aff_lotto_com = rrr.aff_lotto * percen_lotto_company;
                rrr.wl_lotto_com = rrr.wl_lotto * percen_lotto_company;
                rrr.sum_com = rrr.sum * percen_game_company;
                rrr.bet_com = rrr.bet * percen_game_company;
                rrr.aff_com = rrr.aff * percen_game_company;
                rrr.wl_com = rrr.wl * percen_game_company;

                ///me
                rrr.sum_lotto = rrr.sum_lotto * percen_lotto_me;
                rrr.bet_lotto = rrr.bet_lotto * percen_lotto_me;
                rrr.aff_lotto = rrr.aff_lotto * percen_lotto_me;
                rrr.wl_lotto = rrr.wl_lotto * percen_lotto_me;

                rrr.sum = rrr.sum * percen_game_me;
                rrr.bet = rrr.bet * percen_game_me;
                rrr.aff = rrr.aff * percen_game_me;
                rrr.wl = rrr.wl * percen_game_me;

                items.push(rrr);
            } else {
                // items.push(rrr);
            }
        }
        // console.log(last_data)
        data.result = items;
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.getMemberPartnerList = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberPartnerListYod(req);
        let item = [];
        let partner_front = req.body.partner_front ? req.body.partner_front : false;
        let app_type = req.body.app_type ? req.body.app_type : false;
        let data_senior = [];
        let data_master = [];
        let data_agent = [];
        let data_sub_agent = [];
        let member_front = 0;

        // if (app_type === 'frontend') {
        //     let get_member_partner = await queryMember.queryMemberPartnerWithFront(partner);
        //     if (get_member_partner.result.length > 0) {
        //         member_front = partner;
        //         partner = get_member_partner.result[0].member_type_id;
        //     } else {
        //         data.result = [];
        //     }
        // }

        let lastdata = [];
        // console.log(`Data partner`, data.result)
        for (const r of data.result) {
            // if (r.member_type_id == 4) {} else if (r.member_type_id == 3) {
            // console.log(`ID:`, r.member_id)

            r.bet_com = 0;
            r.aff_com = 0;
            r.wl_com = 0;
            r.bet_lotto = 0;
            r.aff_lotto = 0;
            r.wl_lotto = 0;
            r.bet_lotto_com = 0;
            r.aff_lotto_com = 0;
            r.wl_lotto_com = 0;
            r.sum = 0;
            r.sum_lotto = 0;
            r.sum_com = 0;
            r.sum_lotto_com = 0;
            r.master_pay = 0;
            r.agent_pay = 0;
            r.agent_pay_senior = 0;
            r.profit = 0;

            // console.log(r)
            //check ref
            req.body.username = r.username;
            let data_lotto_me = await queryMember.queryMemberPartnerListProfitlotto(
                req
            );
            // console.log(data_lotto.result)
            if (data_lotto_me.result.length > 0) {
                let lotto = data_lotto_me.result[0];
                r.bet_lotto = r.bet_lotto + lotto.bet_lotto;
                r.aff_lotto = r.aff_lotto + lotto.aff_lotto;
                r.wl_lotto = r.wl_lotto + lotto.wl_lotto;
                // r.sum_lotto = r.sum_lotto + (lotto.wl_lotto - lotto.aff_lotto)
            }
            let data_ref = await queryMember.queryMemberWithRefID(r.member_id);
            // console.log(`ID :`, req.body.username);
            if (data_ref.result.length > 0) {
                for (const dref of data_ref.result) {
                    // console.log(check_partner.result.length)
                    // console.log(dref.id)
                    // let check_partner = await queryMember.queryMemberPartnerCheck(dref.id);
                    req.body.id = dref.id;
                    // console.log(`ID Ref:`, req.body.id);
                    let data_game = await queryMember.queryMemberPartnerTranGame(req);
                    if (data_game.result.length > 0) {
                        let game = data_game.result[0];
                        r.bet = r.bet + game.bet;
                        r.aff = r.aff + game.aff;
                        r.wl = r.wl + game.wl;
                        // r.sum = r.sum + (game.wl - game.aff)
                    }
                    req.body.username = dref.username;
                    let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    // console.log(data_lotto.result)
                    if (data_lotto.result.length > 0) {
                        let lotto = data_lotto.result[0];
                        r.bet_lotto = r.bet_lotto + lotto.bet_lotto;
                        r.aff_lotto = r.aff_lotto + lotto.aff_lotto;
                        r.wl_lotto = r.wl_lotto + lotto.wl_lotto;
                        // r.sum_lotto = r.sum_lotto + (lotto.wl_lotto - lotto.aff_lotto)
                    }
                }
            }
            // console.log(r)
            // }
            lastdata.push(r);
        }
        // console.log(lastdata)
        for (const rr of lastdata) {
            if (rr.member_type_id == 3) {
                data_agent.push(rr);
            } else if (rr.member_type_id == 2) {
                data_master.push(rr);
            } else if (rr.member_type_id == 1) {
                data_senior.push(rr);
            }
        }

        for (const d_a of data_agent) {
            data_master = data_master.map((ss) => {
                // console.log(ss)
                if (d_a.member_id_partner == ss.member_id) {
                    let per_recive_game = (ss.percent_game - d_a.percent_game) * 0.01;
                    let per_recive_lotto = (ss.percent_lotto - d_a.percent_lotto) * 0.01;
                    ss.agent_pay =
                        (d_a.wl - d_a.aff) * per_recive_game +
                        (d_a.wl_lotto - d_a.aff_lotto) * per_recive_lotto;
                    ss.agent_pay_senior = [
                        d_a.wl - d_a.aff,
                        d_a.wl_lotto - d_a.aff_lotto,
                        d_a.percent_game,
                        d_a.percent_lotto,
                    ];

                    ss.bet = ss.bet + d_a.bet * per_recive_game;
                    ss.wl = ss.wl + d_a.wl * per_recive_game;
                    ss.aff = ss.aff + d_a.aff * per_recive_game;
                    ss.bet_lotto = ss.bet_lotto + d_a.bet_lotto * per_recive_lotto;
                    ss.wl_lotto = ss.wl_lotto + d_a.wl_lotto * per_recive_lotto;
                    ss.aff_lotto = ss.aff_lotto + d_a.aff_lotto * per_recive_lotto;

                    // calculate

                    ss.bet_show = ss.bet * ss.percent_game * 0.01;
                    ss.wl_show = ss.wl * ss.percent_game * 0.01;
                    ss.aff_show = ss.aff * ss.percent_game * 0.01;
                    ss.bet_lotto_show = ss.bet_lotto * ss.percent_lotto * 0.01;
                    ss.wl_lotto_show = ss.wl_lotto * ss.percent_lotto * 0.01;
                    ss.aff_lotto_show = ss.aff_lotto * ss.percent_lotto * 0.01;
                    ss.sum = (ss.wl - ss.aff) * ss.percent_game * 0.01;
                    ss.sum_lotto = (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto * 0.01;
                    ss.profit = ss.agent_pay + ss.sum + ss.sum_lotto;

                    ss.percent_game_com = 100 - ss.percent_game;
                    ss.percent_lotto_com = 100 - ss.percent_lotto;
                    ss.bet_com = ss.bet * ss.percent_game_com * 0.01;
                    ss.wl_com = ss.wl * ss.percent_game_com * 0.01;
                    ss.aff_com = ss.aff * ss.percent_game_com * 0.01;
                    ss.bet_lotto_com = ss.bet_lotto * ss.percent_lotto_com * 0.01;
                    ss.wl_lotto_com = ss.wl_lotto * ss.percent_lotto_com * 0.01;
                    ss.aff_lotto_com = ss.aff_lotto * ss.percent_lotto_com * 0.01;
                    ss.sum_com = (ss.wl - ss.aff) * ss.percent_game_com * 0.01;
                    ss.sum_lotto_com =
                        (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto_com * 0.01;
                    return ss;
                } else {
                    // calculate
                    ss.bet_show = ss.bet * ss.percent_game * 0.01;
                    ss.wl_show = ss.wl * ss.percent_game * 0.01;
                    ss.aff_show = ss.aff * ss.percent_game * 0.01;
                    ss.bet_lotto_show = ss.bet_lotto * ss.percent_lotto * 0.01;
                    ss.wl_lotto_show = ss.wl_lotto * ss.percent_lotto * 0.01;
                    ss.aff_lotto_show = ss.aff_lotto * ss.percent_lotto * 0.01;
                    ss.sum = (ss.wl - ss.aff) * ss.percent_game * 0.01;
                    ss.sum_lotto = (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto * 0.01;
                    ss.profit = ss.sum + ss.sum_lotto;

                    ss.percent_game_com = 100 - ss.percent_game;
                    ss.percent_lotto_com = 100 - ss.percent_lotto;
                    ss.bet_com = ss.bet * ss.percent_game_com * 0.01;
                    ss.wl_com = ss.wl * ss.percent_game_com * 0.01;
                    ss.aff_com = ss.aff * ss.percent_game_com * 0.01;
                    ss.bet_lotto_com = ss.bet_lotto * ss.percent_lotto_com * 0.01;
                    ss.wl_lotto_com = ss.wl_lotto * ss.percent_lotto_com * 0.01;
                    ss.aff_lotto_com = ss.aff_lotto * ss.percent_lotto_com * 0.01;
                    ss.sum_com = (ss.wl - ss.aff) * ss.percent_game_com * 0.01;
                    ss.sum_lotto_com =
                        (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto_com * 0.01;
                    return ss;
                }
            });
        }

        data_agent = data_agent.map((ss) => {
            // calculate
            ss.bet_show = ss.bet * ss.percent_game * 0.01;
            ss.wl_show = ss.wl * ss.percent_game * 0.01;
            ss.aff_show = ss.aff * ss.percent_game * 0.01;
            ss.bet_lotto_show = ss.bet_lotto * ss.percent_lotto * 0.01;
            ss.wl_lotto_show = ss.wl_lotto * ss.percent_lotto * 0.01;
            ss.aff_lotto_show = ss.aff_lotto * ss.percent_lotto * 0.01;
            ss.sum = (ss.wl - ss.aff) * ss.percent_game * 0.01;
            ss.sum_lotto = (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto * 0.01;
            ss.profit = ss.sum + ss.sum_lotto;

            ss.percent_game_com = 100 - ss.percent_game;
            ss.percent_lotto_com = 100 - ss.percent_lotto;
            ss.bet_com = ss.bet * ss.percent_game_com * 0.01;
            ss.wl_com = ss.wl * ss.percent_game_com * 0.01;
            ss.aff_com = ss.aff * ss.percent_game_com * 0.01;
            ss.bet_lotto_com = ss.bet_lotto * ss.percent_lotto_com * 0.01;
            ss.wl_lotto_com = ss.wl_lotto * ss.percent_lotto_com * 0.01;
            ss.aff_lotto_com = ss.aff_lotto * ss.percent_lotto_com * 0.01;
            ss.sum_com = (ss.wl - ss.aff) * ss.percent_game_com * 0.01;
            ss.sum_lotto_com =
                (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto_com * 0.01;
            return ss;
        });

        for (const d_a of data_master) {
            data_senior = data_senior.map((ss) => {
                if (d_a.member_id_partner == ss.member_id) {
                    let per_recive_game = (ss.percent_game - d_a.percent_game) * 0.01;
                    let per_recive_lotto = (ss.percent_lotto - d_a.percent_lotto) * 0.01;
                    ss.master_pay =
                        (d_a.wl - d_a.aff) * per_recive_game +
                        (d_a.wl_lotto - d_a.aff_lotto) * per_recive_lotto;
                    ss.bet = ss.bet + d_a.bet * per_recive_game;
                    ss.wl = ss.wl + d_a.wl * per_recive_game;
                    ss.aff = ss.aff + d_a.aff * per_recive_game;
                    ss.bet_lotto = ss.bet_lotto + d_a.bet_lotto * per_recive_lotto;
                    ss.wl_lotto = ss.wl_lotto + d_a.wl_lotto * per_recive_lotto;
                    ss.aff_lotto = ss.aff_lotto + d_a.aff_lotto * per_recive_lotto;

                    //calculate_pay_senior
                    // console.log(d_a.agent_pay_senior)
                    let ttt = 0;
                    let tttt = 0;
                    if (d_a.agent_pay_senior.length > 0) {
                        ttt = d_a.agent_pay_senior[0] * per_recive_game;
                        tttt = d_a.agent_pay_senior[1] * per_recive_lotto;
                    }

                    // calculate

                    ss.bet_show = ss.bet * ss.percent_game * 0.01;
                    ss.wl_show = ss.wl * ss.percent_game * 0.01;
                    ss.aff_show = ss.aff * ss.percent_game * 0.01;
                    ss.bet_lotto_show = ss.bet_lotto * ss.percent_lotto * 0.01;
                    ss.wl_lotto_show = ss.wl_lotto * ss.percent_lotto * 0.01;
                    ss.aff_lotto_show = ss.aff_lotto * ss.percent_lotto * 0.01;
                    ss.sum = (ss.wl - ss.aff) * ss.percent_game * 0.01;
                    ss.sum_lotto = (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto * 0.01;
                    ss.profit = ss.master_pay + ss.sum + ss.sum_lotto + ttt + tttt;

                    ss.percent_game_com = 100 - ss.percent_game;
                    ss.percent_lotto_com = 100 - ss.percent_lotto;
                    ss.bet_com = ss.bet * ss.percent_game_com * 0.01;
                    ss.wl_com = ss.wl * ss.percent_game_com * 0.01;
                    ss.aff_com = ss.aff * ss.percent_game_com * 0.01;
                    ss.bet_lotto_com = ss.bet_lotto * ss.percent_lotto_com * 0.01;
                    ss.wl_lotto_com = ss.wl_lotto * ss.percent_lotto_com * 0.01;
                    ss.aff_lotto_com = ss.aff_lotto * ss.percent_lotto_com * 0.01;
                    ss.sum_com = (ss.wl - ss.aff) * ss.percent_game_com * 0.01;
                    ss.sum_lotto_com =
                        (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto_com * 0.01;
                    return ss;
                } else {
                    // calculate
                    ss.bet_show = ss.bet * ss.percent_game * 0.01;
                    ss.wl_show = ss.wl * ss.percent_game * 0.01;
                    ss.aff_show = ss.aff * ss.percent_game * 0.01;
                    ss.bet_lotto_show = ss.bet_lotto * ss.percent_lotto * 0.01;
                    ss.wl_lotto_show = ss.wl_lotto * ss.percent_lotto * 0.01;
                    ss.aff_lotto_show = ss.aff_lotto * ss.percent_lotto * 0.01;
                    ss.sum = (ss.wl - ss.aff) * ss.percent_game * 0.01;
                    ss.sum_lotto = (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto * 0.01;
                    ss.profit = ss.sum + ss.sum_lotto;

                    ss.percent_game_com = 100 - ss.percent_game;
                    ss.percent_lotto_com = 100 - ss.percent_lotto;
                    ss.bet_com = ss.bet * ss.percent_game_com * 0.01;
                    ss.wl_com = ss.wl * ss.percent_game_com * 0.01;
                    ss.aff_com = ss.aff * ss.percent_game_com * 0.01;
                    ss.bet_lotto_com = ss.bet_lotto * ss.percent_lotto_com * 0.01;
                    ss.wl_lotto_com = ss.wl_lotto * ss.percent_lotto_com * 0.01;
                    ss.aff_lotto_com = ss.aff_lotto * ss.percent_lotto_com * 0.01;
                    ss.sum_com = (ss.wl - ss.aff) * ss.percent_game_com * 0.01;
                    ss.sum_lotto_com =
                        (ss.wl_lotto - ss.aff_lotto) * ss.percent_lotto_com * 0.01;
                    return ss;
                }
            });
        }

        // data.result.data_agent.push(data_agent);
        // data.result.data_master.push(data_master)
        // data.result.data_senior.push(data_senior);
        data.result = {
            data_senior: data_senior,
            data_master: data_master,
            data_agent: data_agent,
        };

        if (app_type) {
            let get_member_partner = await queryMember.queryMemberPartnerWithFront(
                partner_front
            );
            // console.log(`Checkpartner : `, get_member_partner)
            if (get_member_partner.result.length > 0) {
                let partner = get_member_partner.result[0].member_type_id;

                if (partner == 1) {
                    data.result = data_senior;
                } else if (partner == 2) {
                    data.result = data_master;
                } else if (partner == 3) {
                    data.result = data_agent;
                } else {
                    data.result = data_sub_agent;
                }
            } else {
                data.result = [];
            }
        }

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.getGetRemark = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberRemark(req.body.remark);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.TranferYod = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataMember = await queryMember.findMemberIdByUsername(
                req.body.username
            );
            let memberId = dataMember.result[0].id;
            let amount = parseFloat(req.body.amont);
            let data = await queryMember.getBalanceWallet(memberId);
            if (data.status && data.result.length > 0) {
                let balance = parseFloat(data.result[0].balance);
                let amount_tran = balance + amount;
                let data2 = await queryMember.insertTranferYod(req.body);
                // console.log(data2)
                const dataWallet = {
                    memberId: memberId,
                    amount: parseFloat(amount).toFixed(2),
                    balance: parseFloat(amount_tran).toFixed(2),
                    walletType: "deposit",
                    refTable: "transfer",
                    refId: data2.result.insertId,
                    createdAt: moment().format("YYYY-MM-DD hh:mm:ss"),
                    updatedAt: moment().format("YYYY-MM-DD hh:mm:ss"),
                    sts: "1",
                };
                console.log(dataWallet);
                let walletRes = await queryMember.createWallet(dataWallet);
                let LastWalletID = walletRes.result.insertId;
                if (LastWalletID) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.description = `TranferYod Error createWallet`;
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = `TranferYod Error insert`;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = `TranferYod Catch : ${e}`;
    }
    res.send(responeData);
};

module.exports.getMemberPartnerListYod = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberPartnerListYod(req);
        let item = [];
        let partner = req.body.partner ? req.body.partner : false;
        let app_type = req.body.app_type ? req.body.app_type : false;
        let data_senior = [];
        let data_master = [];
        let data_agent = [];
        let data_sub_agent = [];
        let member_front = 0;
        // console.log(`dd`, data.result)
        let lastdata = [];
        for (const r of data.result) {
            // if (r.member_type_id == 4) {} else if (r.member_type_id == 3) {
            // console.log(`ID:`, r.member_id)
            r.bet_com = 0;
            r.aff_com = 0;
            r.wl_com = 0;
            r.bet_lotto = 0;
            r.aff_lotto = 0;
            r.wl_lotto = 0;
            r.bet_lotto_com = 0;
            r.aff_lotto_com = 0;
            r.wl_lotto_com = 0;
            r.sum = 0;
            r.sum_lotto = 0;
            r.sum_com = 0;
            r.sum_lotto_com = 0;
            // console.log(r)
            //check ref
            req.body.username = r.username;
            let data_lotto_me = await queryMember.queryMemberPartnerListProfitlotto(
                req
            );
            // console.log(data_lotto.result)
            if (data_lotto_me.result.length > 0) {
                let lotto = data_lotto_me.result[0];
                r.bet_lotto = r.bet_lotto + lotto.bet_lotto;
                r.aff_lotto = r.aff_lotto + lotto.aff_lotto;
                r.wl_lotto = r.wl_lotto + lotto.wl_lotto;
                // r.sum_lotto = r.sum_lotto + (lotto.wl_lotto - lotto.aff_lotto)
            }
            let data_ref = await queryMember.queryMemberWithRefID(r.member_id);
            // console.log(`ID :`, req.body.username);
            if (data_ref.result.length > 0) {
                for (const dref of data_ref.result) {
                    // let check_partner = await queryMember.queryMemberPartnerCheck(dref.id);
                    req.body.id = dref.id;
                    // console.log(`ID Ref:`, req.body.id);
                    let data_game = await queryMember.queryMemberPartnerTranGame(req);
                    if (data_game.result.length > 0) {
                        let game = data_game.result[0];
                        r.bet = r.bet + game.bet;
                        r.aff = r.aff + game.aff;
                        r.wl = r.wl + game.wl;
                        // r.sum = r.sum + (game.wl - game.aff)
                    }
                    req.body.username = dref.username;
                    let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    // console.log(data_lotto.result)
                    if (data_lotto.result.length > 0) {
                        let lotto = data_lotto.result[0];
                        r.bet_lotto = r.bet_lotto + lotto.bet_lotto;
                        r.aff_lotto = r.aff_lotto + lotto.aff_lotto;
                        r.wl_lotto = r.wl_lotto + lotto.wl_lotto;
                        // r.sum_lotto = r.sum_lotto + (lotto.wl_lotto - lotto.aff_lotto)
                    }
                }
            }
            // console.log(r)
            // }
            lastdata.push(r);
        }

        // for (const rr of lastdata) {
        //     if (rr.member_type_id == 3) {
        //         rr.bet_com = rr.bet * (1 - (rr.percent_game / 100))
        //         rr.bet = rr.bet * (rr.percent_game / 100)
        //         rr.aff_com = rr.aff * (1 - (rr.percent_game / 100))
        //         rr.aff = rr.aff * (rr.percent_game / 100)
        //         rr.wl_com = rr.wl * (1 - (rr.percent_game / 100))
        //         rr.wl = rr.wl * (rr.percent_game / 100)

        //         rr.bet_lotto_com = rr.bet_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.bet_lotto = rr.bet_lotto * (rr.percent_lotto / 100)
        //         rr.aff_lotto_com = rr.aff_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.aff_lotto = rr.aff_lotto * (rr.percent_lotto / 100)
        //         rr.wl_lotto_com = rr.wl_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.wl_lotto = rr.wl_lotto * (rr.percent_lotto / 100)
        //         data_agent.push(rr);
        //     } else if (rr.member_type_id == 2) {
        //         // rr.bet_com = rr.bet * (1 - (rr.percent_game / 100))
        //         // rr.bet = rr.bet * (rr.percent_game / 100)
        //         // rr.aff_com = rr.aff * (1 - (rr.percent_game / 100))
        //         // rr.aff = rr.aff * (rr.percent_game / 100)
        //         // rr.wl_com = rr.wl * (1 - (rr.percent_game / 100))
        //         // rr.wl = rr.wl * (rr.percent_game / 100)

        //         rr.bet_lotto_com = rr.bet_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.bet_lotto = rr.bet_lotto * (rr.percent_lotto / 100)
        //         rr.aff_lotto_com = rr.aff_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.aff_lotto = rr.aff_lotto * (rr.percent_lotto / 100)
        //         rr.wl_lotto_com = rr.wl_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.wl_lotto = rr.wl_lotto * (rr.percent_lotto / 100)
        //         data_master.push(rr);
        //     } else if (rr.member_type_id == 1) {
        //         rr.bet_com = rr.bet * (1 - (rr.percent_game / 100))
        //         rr.bet = rr.bet * (rr.percent_game / 100)
        //         rr.aff_com = rr.aff * (1 - (rr.percent_game / 100))
        //         rr.aff = rr.aff * (rr.percent_game / 100)
        //         rr.wl_com = rr.wl * (1 - (rr.percent_game / 100))
        //         rr.wl = rr.wl * (rr.percent_game / 100)

        //         rr.bet_lotto_com = rr.bet_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.bet_lotto = rr.bet_lotto * (rr.percent_lotto / 100)
        //         rr.aff_lotto_com = rr.aff_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.aff_lotto = rr.aff_lotto * (rr.percent_lotto / 100)
        //         rr.wl_lotto_com = rr.wl_lotto * (1 - (rr.percent_lotto / 100))
        //         rr.wl_lotto = rr.wl_lotto * (rr.percent_lotto / 100)
        //         data_senior.push(rr);
        //     }
        // }

        for (const rr of lastdata) {
            if (rr.member_type_id == 3) {
                data_agent.push(rr);
            } else if (rr.member_type_id == 2) {
                data_master.push(rr);
            } else if (rr.member_type_id == 1) {
                data_senior.push(rr);
            }
        }

        for (const d_a of data_agent) {
            data_master = data_master.map((ss) => {
                if (d_a.member_id_partner == ss.member_id) {
                    ss.bet = ss.bet + d_a.bet;
                    ss.wl = ss.wl + d_a.wl;
                    ss.aff = ss.aff + d_a.aff;
                    ss.bet_lotto = ss.bet_lotto + d_a.bet_lotto;
                    ss.wl_lotto = ss.wl_lotto + d_a.wl_lotto;
                    ss.aff_lotto = ss.aff_lotto + d_a.aff_lotto;
                    return ss;
                } else {
                    return ss;
                }
            });
        }
        for (const d_a of data_master) {
            data_senior = data_senior.map((ss) => {
                if (d_a.member_id_partner == ss.member_id) {
                    ss.bet = ss.bet + d_a.bet;
                    ss.wl = ss.wl + d_a.wl;
                    ss.aff = ss.aff + d_a.aff;
                    ss.bet_lotto = ss.bet_lotto + d_a.bet_lotto;
                    ss.wl_lotto = ss.wl_lotto + d_a.wl_lotto;
                    ss.aff_lotto = ss.aff_lotto + d_a.aff_lotto;
                    return ss;
                } else {
                    return ss;
                }
            });
        }

        // console.log(data_senior)

        // for (const rr of data.result) {
        //     rr.bet = 0;
        //     rr.aff = 0;
        //     rr.wl = 0;
        //     rr.bet_com = 0;
        //     rr.aff_com = 0;
        //     rr.wl_com = 0;
        //     rr.bet_lotto = 0;
        //     rr.aff_lotto = 0;
        //     rr.wl_lotto = 0;
        //     rr.bet_lotto_com = 0;
        //     rr.aff_lotto_com = 0;
        //     rr.wl_lotto_com = 0;
        //     rr.sum = 0;
        //     rr.sum_lotto = 0;
        //     rr.sum_com = 0;
        //     rr.sum_lotto_com = 0;
        //     rr.username

        //     let get_master = await queryMember.queryMemberPartnerWithFront(rr.member_id);
        //     if (get_master.result.length > 0) {
        //         //Master
        //         for (const master of get_master.result) {
        //             console.log(`ID Master :`, master.member_id)
        //             master.bet = 0;
        //             master.aff = 0;
        //             master.wl = 0;
        //             master.bet_com = 0;
        //             master.aff_com = 0;
        //             master.wl_com = 0;
        //             master.bet_lotto = 0;
        //             master.aff_lotto = 0;
        //             master.wl_lotto = 0;
        //             master.bet_lotto_com = 0;
        //             master.aff_lotto_com = 0;
        //             master.wl_lotto_com = 0;
        //             master.sum = 0;
        //             master.sum_lotto = 0;
        //             master.sum_com = 0;
        //             master.sum_lotto_com = 0;
        //             let get_agent = await queryMember.queryMemberPartnerWithFront(master.member_id);
        //             if (get_agent.result.length > 0) {
        //                 //Agent
        //                 for (const agent of get_agent.result) {
        //                     console.log(`ID Agent :`, agent.member_id)
        //                     agent.bet = 0;
        //                     agent.aff = 0;
        //                     agent.wl = 0;
        //                     agent.bet_com = 0;
        //                     agent.aff_com = 0;
        //                     agent.wl_com = 0;
        //                     agent.bet_lotto = 0;
        //                     agent.aff_lotto = 0;
        //                     agent.wl_lotto = 0;
        //                     agent.bet_lotto_com = 0;
        //                     agent.aff_lotto_com = 0;
        //                     agent.wl_lotto_com = 0;
        //                     agent.sum = 0;
        //                     agent.sum_lotto = 0;
        //                     agent.sum_com = 0;
        //                     agent.sum_lotto_com = 0;
        //                     let get_sub_agent = await queryMember.queryMemberPartnerWithFront(agent.member_id);
        //                     if (get_sub_agent.result.length > 0) {

        //                         //SubAgent
        //                         for (const subagent of get_sub_agent.result) {
        //                             subagent.bet = 0;
        //                             subagent.aff = 0;
        //                             subagent.wl = 0;
        //                             subagent.bet_com = 0;
        //                             subagent.aff_com = 0;
        //                             subagent.wl_com = 0;
        //                             subagent.bet_lotto = 0;
        //                             subagent.aff_lotto = 0;
        //                             subagent.wl_lotto = 0;
        //                             subagent.bet_lotto_com = 0;
        //                             subagent.aff_lotto_com = 0;
        //                             subagent.wl_lotto_com = 0;
        //                             subagent.sum = 0;
        //                             subagent.sum_lotto = 0;
        //                             subagent.sum_com = 0;
        //                             subagent.sum_lotto_com = 0;

        //                         }
        //                     } else {
        //                         req.body.id = agent.member_id;
        //                         let game_agent = await queryMember.queryMemberPartnerTranGame(req);
        //                         if (game_agent.result.length > 0) {
        //                             let data_game_agent = game_agent.result[0];

        //                             // console.log(`percent_game 1`, rr.percent_game)
        //                             // console.log(`percent_game 2`, master.percent_game)
        //                             // console.log(`percent_game 3`, agent.percent_game)
        //                             // console.log(data_senior)

        //                             agent.bet = agent.bet + (data_game_agent.bet * (agent.percent_game / 100))
        //                             agent.aff = agent.aff + (data_game_agent.aff * (agent.percent_game / 100))
        //                             agent.wl = agent.wl + (data_game_agent.wl * (agent.percent_game / 100))

        //                             let percent_agent_com = 100 - agent.percent_game
        //                             agent.bet_com = agent.bet_com + (data_game_agent.bet * (percent_agent_com / 100))
        //                             agent.aff_com = agent.aff_com + (data_game_agent.aff * (percent_agent_com / 100))
        //                             agent.wl_com = agent.wl_com + (data_game_agent.wl * (percent_agent_com / 100))

        //                             agent.sum = agent.wl - agent.aff;
        //                             agent.sum_com = agent.wl_com - agent.aff_com;

        //                             let percent_master = master.percent_game
        //                             master.bet = master.bet + (data_game_agent.bet * (percent_master / 100))
        //                             master.aff = master.aff + (data_game_agent.aff * (percent_master / 100))
        //                             master.wl = master.wl + (data_game_agent.wl * (percent_master / 100))

        //                             let percent_master_com = 100 - master.percent_game
        //                             master.bet_com = master.bet_com + (data_game_agent.bet * (percent_master_com / 100))
        //                             master.aff_com = master.aff_com + (data_game_agent.aff * (percent_master_com / 100))
        //                             master.wl_com = master.wl_com + (data_game_agent.wl * (percent_master_com / 100))

        //                             master.sum = master.wl - master.aff;
        //                             master.sum_com = master.wl_com - master.aff_com;

        //                             let percent_com = 100 - rr.percent_game
        //                             let percent_senior = rr.percent_game
        //                             rr.bet = rr.bet + (data_game_agent.bet * (percent_senior / 100))
        //                             rr.aff = rr.aff + (data_game_agent.aff * (percent_senior / 100))
        //                             rr.wl = rr.wl + (data_game_agent.wl * (percent_senior / 100))
        //                             rr.bet_com = rr.bet_com + (data_game_agent.bet * (percent_com / 100))
        //                             rr.aff_com = rr.aff_com + (data_game_agent.aff * (percent_com / 100))
        //                             rr.wl_com = rr.wl_com + (data_game_agent.wl * (percent_com / 100))
        //                             rr.sum = rr.wl - rr.aff;
        //                             rr.sum_com = rr.wl_com - rr.aff_com;

        //                         }

        //                         req.body.username = agent.username
        //                         let lotto_agent = await queryMember.queryMemberPartnerListProfitlotto(req);
        //                         if (lotto_agent.result.length > 0) {
        //                             let data_lotto_agent = lotto_agent.result[0];
        //                             console.log(`percent_lotto 1`, rr.percent_lotto)
        //                             console.log(`percent_lotto 2`, master.percent_lotto)
        //                             console.log(`percent_lotto 3`, agent.percent_lotto)

        //                             let percent_lotto_comm = 100 - rr.percent_lotto
        //                             let percent_lotto_senior = rr.percent_lotto - master.percent_lotto
        //                             rr.bet_lotto = rr.bet_lotto + (data_lotto_agent.bet_lotto * (percent_lotto_senior / 100))
        //                             rr.aff_lotto = rr.aff_lotto + (data_lotto_agent.aff_lotto * (percent_lotto_senior / 100))
        //                             rr.wl_lotto = rr.wl_lotto + (data_lotto_agent.wl_lotto * (percent_lotto_senior / 100))
        //                             rr.bet_lotto_com = rr.bet_lotto_com + (data_lotto_agent.bet_lotto * (percent_lotto_comm / 100))
        //                             rr.aff_lotto_com = rr.aff_lotto_com + (data_lotto_agent.aff_lotto * (percent_lotto_comm / 100))
        //                             rr.wl_lotto_com = rr.wl_lotto_com + (data_lotto_agent.wl_lotto * (percent_lotto_comm / 100))

        //                             rr.sum_lotto = rr.wl_lotto - rr.aff_lotto
        //                             rr.sum_lotto_com = rr.wl_lotto_com - rr.aff_lotto_com

        //                             let percent_lotto_master = master.percent_lotto - agent.percent_lotto
        //                             master.bet_lotto = master.bet_lotto + (data_lotto_agent.bet_lotto * (percent_lotto_master / 100))
        //                             master.aff_lotto = master.aff_lotto + (data_lotto_agent.aff_lotto * (percent_lotto_master / 100))
        //                             master.wl_lotto = master.wl_lotto + (data_lotto_agent.wl_lotto * (percent_lotto_master / 100))

        //                             let percent_master_lotto_com = 100 - master.percent_lotto
        //                             master.bet_lotto_com = master.bet_lotto_com + (data_lotto_agent.bet_lotto * (percent_master_lotto_com / 100))
        //                             master.aff_lotto_com = master.aff_lotto_com + (data_lotto_agent.aff_lotto * (percent_master_lotto_com / 100))
        //                             master.wl_lotto_com = master.wl_lotto_com + (data_lotto_agent.wl_lotto * (percent_master_lotto_com / 100))

        //                             master.sum_lotto = master.wl_lotto - master.aff_lotto
        //                             master.sum_lotto_com = master.wl_lotto_com - master.aff_lotto_com;

        //                             agent.bet_lotto = agent.bet_lotto + (data_lotto_agent.bet_lotto * (agent.percent_lotto / 100))
        //                             agent.aff_lotto = agent.aff_lotto + (data_lotto_agent.aff_lotto * (agent.percent_lotto / 100))
        //                             agent.wl_lotto = agent.wl_lotto + (data_lotto_agent.wl_lotto * (agent.percent_lotto / 100))

        //                             let percent_agent_lotto_com = 100 - agent.percent_lotto
        //                             agent.bet_lotto_com = agent.bet_lotto_com + (data_lotto_agent.bet_lotto * (percent_agent_lotto_com / 100))
        //                             agent.aff_lotto_com = agent.aff_lotto_com + (data_lotto_agent.aff_lotto * (percent_agent_lotto_com / 100))
        //                             agent.wl_lotto_com = agent.wl_lotto_com + (data_lotto_agent.wl_lotto * (percent_agent_lotto_com / 100))

        //                             agent.sum_lotto = agent.wl_lotto - agent.aff_lotto
        //                             agent.sum_lotto_com = agent.wl_lotto_com - agent.aff_lotto_com;

        //                         }
        //                         // console.log(game_agent.result)

        //                     }
        //                     agent.percent_game_com = 100 - agent.percent_game;
        //                     agent.percent_lotto_com = 100 - agent.percent_lotto;
        //                     data_agent.push(agent)
        //                 }

        //             } else {
        //                 req.body.id = master.member_id;
        //                 let game_master = await queryMember.queryMemberPartnerTranGame(req);
        //                 if (game_master.result.length > 0) {
        //                     let data_game_master = game_master.result[0];
        //                     master.bet = master.bet + (data_game_master.bet * (master.percent_game / 100))
        //                     master.aff = master.aff + (data_game_master.aff * (master.percent_game / 100))
        //                     master.wl = master.wl + (data_game_master.wl * (master.percent_game / 100))

        //                     let percent_master_game_com = 100 - master.percent_game
        //                     master.bet_com = master.bet_com + (data_game_master.bet * (percent_master_game_com / 100))
        //                     master.aff_com = master.aff_com + (data_game_master.aff * (percent_master_game_com / 100))
        //                     master.wl_com = master.wlcom + (data_game_master.wl * (percent_master_game_com / 100))

        //                     master.sum = master.wl - master.aff;
        //                     master.sum_com = master.wl_com - master.aff_com;
        //                 }

        //                 req.body.username = master.username
        //                 let lotto_master = await queryMember.queryMemberPartnerListProfitlotto(req);
        //                 if (lotto_master.result.length > 0) {
        //                     let data_lotto_master = lotto_master.result[0];
        //                     master.bet_lotto = master.bet_lotto + (data_lotto_master.bet_lotto * (master.percent_lotto / 100))
        //                     master.aff_lotto = master.aff_lotto + (data_lotto_master.aff_lotto * (master.percent_lotto / 100))
        //                     master.wl_lotto = master.wl_lotto + (data_lotto_master.wl_lotto * (master.percent_lotto / 100))

        //                     let percent_master_lotto_com = 100 - master.percent_lotto
        //                     master.bet_lotto_com = master.bet_lotto_com + (data_lotto_master.bet_lotto * (percent_master_lotto_com / 100))
        //                     master.aff_lotto_com = master.aff_lotto_com + (data_lotto_master.aff_lotto * (percent_master_lotto_com / 100))
        //                     master.wl_lotto_com = master.wl_lotto_com + (data_lotto_master.wl_lotto * (percent_master_lotto_com / 100))

        //                     master.sum_lotto = master.wl_lotto - master.aff_lotto
        //                     master.sum_lotto_com = master.wl_lotto_com - master.aff_lotto_com
        //                 }

        //             }
        //             master.percent_game_com = 100 - master.percent_game;
        //             master.percent_lotto_com = 100 - master.percent_lotto;
        //             data_master.push(master)
        //         }
        //     } else {
        //         req.body.id = rr.member_id;
        //         let game_rr = await queryMember.queryMemberPartnerTranGame(req);
        //         if (game_rr.result.length > 0) {
        //             let data_game_rr = game_rr.result[0];
        //             rr.bet = rr.bet + (data_game_rr.bet * (rr.percent_game / 100))
        //             rr.aff = rr.aff + (data_game_rr.aff * (rr.percent_game / 100))
        //             rr.wl = rr.wl + (data_game_rr.wl * (rr.percent_game / 100))

        //             let percent_rr_com = 100 - rr.percent_game
        //             rr.bet_com = rr.bet_com + (data_game_rr.bet * (percent_rr_com / 100))
        //             rr.aff_com = rr.aff_com + (data_game_rr.aff * (percent_rr_com / 100))
        //             rr.wl_com = rr.wl_com + (data_game_rr.wl * (percent_rr_com / 100))

        //             rr.sum = rr.wl - rr.aff;
        //             rr.sum_com = rr.wl_com - rr.aff_com;
        //         }

        //         req.body.username = rr.username
        //         let lotto_rr = await queryMember.queryMemberPartnerListProfitlotto(req);
        //         if (lotto_rr.result.length > 0) {
        //             let data_lotto_rr = lotto_rr.result[0];
        //             rr.bet_lotto = rr.bet_lotto + (data_lotto_rr.bet_lotto * (rr.percent_lotto / 100))
        //             rr.aff_lotto = rr.aff_lotto + (data_lotto_rr.aff_lotto * (rr.percent_lotto / 100))
        //             rr.wl_lotto = rr.wl_lotto + (data_lotto_rr.wl_lotto * (rr.percent_lotto / 100))

        //             let percent_rr_lotto_com = 100 - rr.percent_lotto
        //             rr.bet_lotto_com = rr.bet_lotto_com + (data_lotto_rr.bet_lotto * (percent_rr_lotto_com / 100))
        //             rr.aff_lotto_com = rr.aff_lotto_com + (data_lotto_rr.aff_lotto * (percent_rr_lotto_com / 100))
        //             rr.wl_lotto_com = rr.wl_lotto_com + (data_lotto_rr.wl_lotto * (percent_rr_lotto_com / 100))

        //             rr.sum_lotto = rr.wl_lotto - rr.aff_lotto
        //             rr.sum_lotto_com = rr.wl_lotto_com - rr.aff_lotto_com
        //         }
        //     }
        //     rr.percent_game_com = 100 - rr.percent_game;
        //     rr.percent_lotto_com = 100 - rr.percent_lotto;
        //     data_senior.push(rr)

        // }

        if (partner == 1) {
            items = data_senior;
        } else if (partner == 2) {
            items = data_master;
        } else if (partner == 3) {
            items = data_agent;
        } else {
            items = data_sub_agent;
        }

        if (app_type && member_front != 0) {
            let items2 = items;
            let datafront = [];
            for (const rr of items2) {
                if (rr.member_id_partner == member_front) {
                    datafront.push(rr);
                }
            }
            items = datafront;
        }

        data.result = items;
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.getMemberPartnerList2 = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberPartnerList(req);
        let item = [];
        let partner = req.body.partner ? req.body.partner : false;
        let app_type = req.body.app_type ? req.body.app_type : false;
        let senior = [];
        let master = [];
        let agent = [];
        let sub_agent = [];
        let member_front = 0;
        if (app_type === "frontend") {
            let get_member_partner = await queryMember.queryMemberPartnerWithFront(
                partner
            );
            if (get_member_partner.result.length > 0) {
                member_front = partner;
                partner = get_member_partner.result[0].member_type_id;
            } else {
                data.result = [];
            }
        }
        // console.log(`Partner ID :`, partner)
        //Casino
        for (let rr of data.result) {
            rr.bet = 0;
            rr.aff = 0;
            rr.wl = 0;
            if (rr.member_id == 20) {
                if (rr.member_type_id === 1) {
                    let user = await queryMember.queryMemberWithID(rr.member_id);
                    let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                    rr.username = user.result.username;
                    // console.log(`seniorID:`, rr.member_id, rr.username);
                    if (data2.result.length > 0) {
                        for (const rrr of data2.result) {
                            // console.log(`refID in senior:`, rrr.id);
                            //Get Game is partner RefID
                            let partner_ref_in_senior =
                                await queryMember.queryMemberPartnerWithFront(rrr.id);
                            if (partner_ref_in_senior.result.length > 0) {
                                for (const rrrr of partner_ref_in_senior.result) {
                                    // console.log(`partNer in Ref senior:`, rrrr.member_id);
                                    let partner_ref_in_ref_in_senior =
                                        await queryMember.queryMemberPartnerWithFront(
                                            rrrr.member_id
                                        );
                                    if (partner_ref_in_ref_in_senior.result.length > 0) {
                                        console.log(
                                            `partNer in Ref in Ref senior`,
                                            partner_ref_in_ref_in_senior.result
                                        );
                                    } else {
                                        // console.log(partner_ref_in_ref_in_senior.result)
                                        req.body.id = rrrr.member_id;
                                        let game_partner_ref_in_ref_in_senior =
                                            await queryMember.queryMemberPartnerTranGame(req);
                                        if (game_partner_ref_in_ref_in_senior.result.length > 0) {
                                            let data_ref =
                                                game_partner_ref_in_ref_in_senior.result[0];
                                            rr.bet = rr.bet + data_ref.bet;
                                            rr.aff = rr.aff + data_ref.aff;
                                            rr.wl = rr.wl + data_ref.wl;
                                        }
                                    }
                                }
                            }

                            //Get Game only RefID
                            req.body.id = rrr.id;
                            let data3 = await queryMember.queryMemberPartnerTranGame(req);
                            if (data3.result.length > 0) {
                                let data_ref = data3.result[0];
                                rr.bet = rr.bet + data_ref.bet;
                                rr.aff = rr.aff + data_ref.aff;
                                rr.wl = rr.wl + data_ref.wl;
                            }
                        }
                    }
                    senior.push(rr);
                }
                if (rr.member_type_id === 2) {
                    let user = await queryMember.queryMemberWithID(rr.member_id);
                    let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                    rr.username = user.result.username;
                    if (data2.result.length > 0) {
                        for (const rrr of data2.result) {
                            req.body.id = rrr.id;
                            let data3 = await queryMember.queryMemberPartnerTranGame(req);
                            if (data3.result.length > 0) {
                                let data_ref = data3.result[0];
                                rr.bet = rr.bet + data_ref.bet;
                                rr.aff = rr.aff + data_ref.aff;
                                rr.wl = rr.wl + data_ref.wl;
                            }
                        }
                    }
                    master.push(rr);
                }
                if (rr.member_type_id === 3) {
                    let user = await queryMember.queryMemberWithID(rr.member_id);
                    let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                    rr.username = user.result.username;
                    if (data2.result.length > 0) {
                        for (const rrr of data2.result) {
                            req.body.id = rrr.id;
                            let data3 = await queryMember.queryMemberPartnerTranGame(req);
                            if (data3.result.length > 0) {
                                let data_ref = data3.result[0];
                                rr.bet = rr.bet + data_ref.bet;
                                rr.aff = rr.aff + data_ref.aff;
                                rr.wl = rr.wl + data_ref.wl;
                            }
                        }
                    }
                    agent.push(rr);
                }
                if (rr.member_type_id === 4) {
                    let user = await queryMember.queryMemberWithID(rr.member_id);
                    let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
                    rr.username = user.result.username;
                    if (data2.result.length > 0) {
                        for (const rrr of data2.result) {
                            req.body.id = rrr.id;
                            let data3 = await queryMember.queryMemberPartnerTranGame(req);
                            if (data3.result.length > 0) {
                                let data_ref = data.result[0];
                                rr.bet = rr.bet + data_ref.bet;
                                rr.aff = rr.aff + data_ref.aff;
                                rr.wl = rr.wl + data_ref.wl;
                            }
                        }
                    }
                    sub_agent.push(rr);
                }
            }
        }

        let last_data = [];
        for (let rr of senior) {
            // console.log(rr);
            req.body.username = rr.username;

            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    // console.log(`refID is senior:`, rrr.id);
                    //Get Lotto is partner RefIF
                    let get_partner_ref = await queryMember.queryMemberPartnerWithFront(
                        rrr.id
                    );
                    if (get_partner_ref.result.length > 0) {
                        for (const rrrr of get_partner_ref.result) {
                            // console.log(`partNer is RefID:`, rrrr.username);
                            req.body.username = rrrr.username;
                            let data_partner_ref_lotto =
                                await queryMember.queryMemberPartnerListProfitlotto(req);
                            console.log(data_partner_ref_lotto.result);
                        }
                    }

                    //Get Loto only RefID
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );

                    // if (rrr.username === '0931187853') {
                    //     console.log(`senior and refID :`, rrr.username, data_lotto2.result);
                    // }

                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }
        for (let rr of master) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }
        for (let rr of agent) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            // console.log(data_lotto.result)
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }
        for (let rr of sub_agent) {
            // console.log(rr);
            req.body.username = rr.username;
            let data_lotto = await queryMember.queryMemberPartnerListProfitlotto(req);
            rr.bet_lotto = 0;
            rr.aff_lotto = 0;
            rr.wl_lotto = 0;
            if (data_lotto.result.length > 0) {
                let data_lotto_res = data_lotto.result[0];
                rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
            }
            let data2 = await queryMember.queryMemberWithRefID(rr.member_id);
            if (data2.result.length > 0) {
                for (const rrr of data2.result) {
                    req.body.username = rrr.username;
                    let data_lotto2 = await queryMember.queryMemberPartnerListProfitlotto(
                        req
                    );
                    if (data_lotto2.result.length > 0) {
                        let data_lotto_res = data_lotto2.result[0];
                        rr.bet_lotto = rr.bet_lotto + data_lotto_res.bet_lotto;
                        rr.aff_lotto = rr.aff_lotto + data_lotto_res.aff_lotto;
                        rr.wl_lotto = rr.wl_lotto + data_lotto_res.wl_lotto;
                    }
                }
            }
            last_data.push(rr);
        }

        let items = [];
        for (const rrr of last_data) {
            // console.log(rrr);

            if (rrr.member_type_id == partner && partner) {
                // console.log(rrr.bet_lotto, rrr.aff_lotto, rrr.wl_lotto);

                rrr.sum_lotto = rrr.bet_lotto - rrr.aff_lotto + rrr.wl_lotto;
                rrr.sum = rrr.bet - rrr.aff + rrr.wl - rrr.bet;
                let percen_lotto_me = rrr.percent_lotto / 100;
                let percen_game_me = rrr.percent_game / 100;
                let percen_lotto_company = (100 - rrr.percent_lotto) / 100;
                let percen_game_company = (100 - rrr.percent_game) / 100;
                rrr.percent_lotto_com = 100 - rrr.percent_lotto;
                rrr.percent_game_com = 100 - rrr.percent_game;

                ///Company
                rrr.sum_lotto_com = rrr.sum_lotto * percen_lotto_company;
                rrr.bet_lotto_com = rrr.bet_lotto * percen_lotto_company;
                rrr.aff_lotto_com = rrr.aff_lotto * percen_lotto_company;
                rrr.wl_lotto_com = rrr.wl_lotto * percen_lotto_company;
                rrr.sum_com = rrr.sum * percen_game_company;
                rrr.bet_com = rrr.bet * percen_game_company;
                rrr.aff_com = rrr.aff * percen_game_company;
                rrr.wl_com = rrr.wl * percen_game_company;

                ///me
                rrr.sum_lotto = rrr.sum_lotto * percen_lotto_me;
                rrr.bet_lotto = rrr.bet_lotto * percen_lotto_me;
                rrr.aff_lotto = rrr.aff_lotto * percen_lotto_me;
                rrr.wl_lotto = rrr.wl_lotto * percen_lotto_me;

                rrr.sum = rrr.sum * percen_game_me;
                rrr.bet = rrr.bet * percen_game_me;
                rrr.aff = rrr.aff * percen_game_me;
                rrr.wl = rrr.wl * percen_game_me;

                items.push(rrr);
            } else {
                // items.push(rrr);
            }
        }
        if (app_type && member_front != 0) {
            let items2 = items;
            let datafront = [];
            for (const rr of items2) {
                if (rr.member_id_partner == member_front) {
                    datafront.push(rr);
                }
            }

            items = datafront;
        }

        // console.log(last_data)
        data.result = items;
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryPromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPromotionList(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.getChildrenMemberPartner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryChildrenMemberPartner(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.deleteMemberPartner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryDeleteMemberPartner(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

async function SCBLogin() {
    var options = {
        method: "POST",
        url: "https://fasteasy.scbeasy.com:8443/v3/login/preloadandresumecheck",
        headers: {
            "Accept-Language": "th",
            "scb-channel": "APP",
            "user-agent": `Android/11;FastEasy/${process.env.SCB_VERSIONS}` || "Android/11;FastEasy/3.66.2/6960",
            "Content-Type": "application/json; charset=UTF-8",
            Hos: "fasteasy.scbeasy.com:8443",
            Connection: "close",
        },
        body: '{"deviceId": "3273e64b-b329-42f4-9427-f6b176db8d04" ,"jailbreak": "0","tilesVersion": "39","userMode": "INDIVIDUAL"}',
    };

    request(options, async function (error, response) {
        if (error) throw new Error(error);

        let result = await JSON.parse(response.body);
        if (result.status.code == 1000) {
            let auth = response.headers["api-auth"];
            var options = {
                method: "POST",
                url: "https://fasteasy.scbeasy.com/isprint/soap/preAuth",
                headers: {
                    "Api-Auth": auth,
                    "Content-Type": "application/json",
                    // 'Cookie': 'f5avraaaaaaaaaaaaaaaa_session_=CPMDKGABHOENIMIPAPFKIMCMNHOIEDLHJPKPMNFBNKFAPPHANPFPNBBKHEMHHCHLOBODLBGCKCEFHLDNFBEACLBAGDMBNHKGIBPEPEFMOKMNKDACEFACGCMOGIFOLNEE'
                },
                body: JSON.stringify({
                    loginModuleId: "PseudoFE",
                }),
            };
            request(options, async function (error, response) {
                if (error) throw new Error(error);
                let result = await JSON.parse(response.body);
                if (result.status.statusdesc == "success") {
                    let hashType = result.e2ee.pseudoOaepHashAlgo;
                    let Sid = result.e2ee.pseudoSid;
                    let ServerRandom = result.e2ee.pseudoRandom;
                    let pubKey = result.e2ee.pseudoPubKey;

                    var options = {
                        method: "POST",
                        url: "http://scb_all-pin/pin/encrypt",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        form: {
                            Sid: Sid,
                            ServerRandom: ServerRandom,
                            pubKey: pubKey,
                            pin: "125000",
                            hashType: hashType,
                        },
                    };
                    request(options, async function (error, response) {
                        if (error) throw new Error(error);
                        let pseudoPin = response.body;
                        var options = {
                            method: "POST",
                            url: "https://fasteasy.scbeasy.com/v1/fasteasy-login?&=&=&=",
                            headers: {
                                "Api-Auth": auth,
                                "user-agent": `Android/11;FastEasy/${process.env.SCB_VERSIONS}` || "Android/11;FastEasy/3.66.2/6960",
                                Host: "fasteasy.scbeasy.com",
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                deviceId: "3273e64b-b329-42f4-9427-f6b176db8d04",
                                pseudoPin: pseudoPin,
                                pseudoSid: Sid,
                            }),
                        };
                        request(options, async function (error, response) {
                            if (error) throw new Error(error);
                            let result = await JSON.parse(response.body);
                            return response.headers["api-auth"];
                        });
                    });
                }
            });
        }
    });
}

module.exports.ApiqueryPromotionByID = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPromotionListByID(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryPromotionEditByID = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPromotionListByID(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
                data = await queryMember.queryPromotionType(req);
                responeData.promotion = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdatePromotionbyID = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updatePromotionbyID(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideletePromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            await queryMember.deleteMember(req);
            let data = await queryMember.deletePromotion(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiaddPromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // try {
    let auth = await checkAuth(req.headers.authorization);
    if (auth.status) {
        let data = await queryMember.insertPromotion(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.description = "Insert Error";
        }
    } else {
        responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
        responeData.statusCodeText =
            httpStatusCodes.ClientErrors.unauthorized.codeText;
        responeData.description = auth.msg;
    }
    // } catch (e) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    //     responeData.description = 'Server Error';
    // }
    res.send(responeData);
};

module.exports.ApiqueryPromotionType = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryPromotionType(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryAccountDeposit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAccountDeposit(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryAccountWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAccountWithdraw(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateAccountDeposit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateAccountDeposit(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateAccountWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateAccountWithdraw(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateAccountDepositDetail = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateAccountDepositDetail(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiupdateAccountWithdrawDetail = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.updateAccountWithdrawDetail(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteDeopsit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.deleteDeposit(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.deleteWithdraw(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiaddDeposit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.insertDeposit(req);
            console.log("🚀 ~ file: backend.controller.js:6242 ~ module.exports.ApiaddDeposit=async ~ data:", data)
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "Insert Error";
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        console.log("🚀 ~ file: backend.controller.js:6258 ~ module.exports.ApiaddDeposit=async ~ e:", e)
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Server Error";
    }
    res.send(responeData);
};

module.exports.ApiaddWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.insertWithdraw(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "Insert Error";
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Server Error";
    }
    res.send(responeData);
};

// Front End API

module.exports.ApiGetBalanceWallet = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberId = req.body.id;
        let data = await queryMember.getBalanceWallet(memberId);
        if (data.status && data.result.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            const dataWallet = {
                memberId: memberId,
                amount: 0,
                balance: 0,
                walletType: "deposit",
                refTable: "CreateWallet",
                refId: 0,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                sts: "1",
            };
            await queryMember.createWallet(dataWallet);
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
module.exports.ApiGetBalanceWallet2 = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberId = req.body.id;
        let data = await queryMember.getBalanceWallet(1);
        if (data.status && data.result.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            const dataWallet = {
                memberId: memberId,
                amount: 0,
                balance: 0,
                walletType: "deposit",
                refTable: "CreateWallet",
                refId: 0,
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                sts: "1",
            };
            await queryMember.createWallet(dataWallet);
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiExchangeWalletToGame = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    await delay(getRndInteger(500, 1000))
    try {
        let memberId = req.body.id;
        let checkspam = await queryMember.checkSpam(req.body);
        if (!checkspam.status) {
            responeData.data = 'You are spam';
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        } else {
            let data = await queryMember.getBalanceWallet(memberId);
            if (data.status && data.result.length > 0) {
                let pro = await queryMember.findPomotionByIdGame(memberId);
                let amount = data.result[0].balance;
                let pro_amount = 0;
                if (pro.result.length > 0) {
                    let ele = pro.result[0];
                    amount = amount - (ele.pro_amount - ele.wallet_balance);
                    pro_amount = ele.pro_amount - ele.wallet_balance;
                }
                let userUFA = req.body.userUFA;
                // console.log(`amount:Ufa:`, amount)
                if (amount > 0) {
                    const dataWallet = {
                        memberId: memberId,
                        amount: amount * -1,
                        balance: pro_amount,
                        walletType: "withdraw",
                        refTable: "exchange",
                        refId: 0,
                        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        sts: "1",
                    };
                    await queryMember.createWallet(dataWallet);
                    let resUFAMinus = await global.ufa.addCredit(userUFA, parseFloat(amount));
                    if (resUFAMinus.status) {
                        await queryMember.createWallet(dataWallet);
                    }
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                } else {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                }

                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        }

    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiExchangeGameToWalletLotto = async (user, id) => {
    let memberId = id;
    let data = await queryMember.getBalanceWallet(memberId);
    if (data.status && data.result.length > 0) {
        let amount_wallet = data.result[0].balance;
        let userUFA = user;
        let total = amount_wallet;
        var options = {
            method: "POST",
            url: site.url + "/apibackend/view_credit_ufa",
            formData: {
                code: "8483Auto",
                user: userUFA,
            },
        };
        request(options, async function (error, response) {
            if (error) throw new Error(error);
            let result = await JSON.parse(response.body);
            if (result.msg == "Success") {
                let amount_s = result.data.balance;
                let res_amount = amount_s.split(",");
                let amount = parseFloat(res_amount[0] + res_amount[1]);
                if (amount != 0) {
                    total += amount;
                    const dataWallet = {
                        memberId: memberId,
                        amount: amount,
                        balance: total,
                        walletType: "deposit",
                        refTable: "exchange",
                        refId: 0,
                        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        sts: "1",
                    };

                    await queryMember.createWallet(dataWallet);
                    options = {
                        method: "POST",
                        url: site.url + "/apibackend/minus_creditt_ufa",
                        formData: {
                            code: "8483Auto",
                            username: userUFA,
                            amount: amount,
                        },
                    };
                    request(options, async function (error, response) {
                        if (error) throw new Error(error);
                        let results = await JSON.parse(response.body);
                    });
                }
            }
        });
    }
};

module.exports.ApiExchangeGameToWallet = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberId = req.body.id;
        let data = await queryMember.getBalanceWallet(memberId);
        if (data.status && data.result.length > 0) {
            let amount_wallet = data.result[0].balance;
            let userUFA = req.body.userUFA;
            let total = amount_wallet;
            var options = {
                method: "POST",
                url: site.url + "/apibackend/view_credit_ufa",
                formData: {
                    code: "8483Auto",
                    user: userUFA,
                },
            };
            request(options, async function (error, response) {
                if (error) throw new Error(error);
                let result = await JSON.parse(response.body);
                if (result.msg == "Success") {
                    let amount_s = result.data.balance;
                    let res_amount = amount_s.split(",");
                    let amount = parseFloat(res_amount[0] + res_amount[1]);
                    if (amount != 0) {
                        total += amount;
                        const dataWallet = {
                            memberId: memberId,
                            amount: amount,
                            balance: total,
                            walletType: "deposit",
                            refTable: "exchange",
                            refId: 0,
                            createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                            sts: "1",
                        };

                        await queryMember.createWallet(dataWallet);
                        options = {
                            method: "POST",
                            url: site.url + "/apibackend/minus_creditt_ufa",
                            formData: {
                                code: "8483Auto",
                                username: userUFA,
                                amount: amount,
                            },
                        };
                        request(options, async function (error, response) {
                            if (error) throw new Error(error);
                            let results = await JSON.parse(response.body);
                            responeData.balance = total;
                            responeData.statusCode = httpStatusCodes.Success.ok.code;
                            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                            res.send(responeData);
                        });
                    }
                }
            });
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        console.log("Error");
        res.send(responeData);
    }
};

module.exports.ApiUpdateWheelspinUser = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        req.body.date = dayjs().format("YYYY-MM-DD HH:mm:ss");
        let data = await queryMember.updateWheelspinUser(req);
        if (data.status) {
            data = await queryMember.updateDateTimeWheelspinUser(req);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQuerySettingGame = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingGame(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryPromotionUserByID = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // try {
    let data = await queryMember.queryPromotionByID(req);
    if (data.status && data.result.length > 0) {
        responeData.statusCode = httpStatusCodes.Success.ok.code;
        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        responeData.pro_detail = data.result;
        if (data.result[0].pro_type == 1) {
            let data_receive_last_promotion = await queryMember.queryCheckReceivePromotionLast(req);
            if (data_receive_last_promotion.result.length == 0 || data_receive_last_promotion.result[0].promotion_id == req.body.pro_id) {
                let data_check_receive_promotion = await queryMember.queryCheckReceiveRegisterPromotion(req);
                if (data_check_receive_promotion.status && data_check_receive_promotion.result.length > 0) {
                    responeData.msg = "คุณรับโปรโมชั่นนี้ไปแล้ว จำนวน <span>" + data_check_receive_promotion.result[0].amount + "</span> บาท";
                    responeData.status = false;
                } else {
                    let data_receive_promotion_all = await queryMember.queryCheckReceivePromotionAll(req);
                    if (data_receive_promotion_all.status && data_receive_promotion_all.result.length > 0) {
                        responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                        responeData.status = false;
                    } else {
                        let data_check_transaction = await queryMember.queryCheckTransaction(req);
                        // console.log("🚀 ~ file: backend.controller.js:6591 ~ module.exports.ApiQueryPromotionUserByID=async ~ data_check_transaction:", data_check_transaction)
                        if (data_check_transaction.result.length > 1) {
                            responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                            responeData.status = false;
                        } else if (data_check_transaction.result.length == 0) {
                            responeData.msg = "คุณไม่ได้ทำรายการฝากแรกเข้ามา";
                            responeData.status = false;
                        } else {
                            let memberId = req.body.id;
                            let balance_transaction = data_check_transaction.result[0].id;
                            let data_balance_wallet = await queryMember.getBalanceWalletDetail(memberId);
                            let balance_wallet = data_balance_wallet.result[0].balance;
                            let data_check = {
                                balance_transaction: balance_transaction,
                            };
                            let data_check_balance_wallet = await queryMember.queryCheckBalanceWalletByIDRef(data_check);
                            if (data_check_balance_wallet.result[0].balance == balance_wallet) {
                                req.body.stats = 0;
                                let data_check_transactionBYID =
                                    await queryMember.queryCheckTransactionByStats(req);
                                if (data_check_transactionBYID.result.length != 1) {
                                    responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                                    responeData.status = false;
                                } else {
                                    responeData.msg = "สามารถรับโปรโมชั่นนี้ได้";
                                    responeData.status = true;
                                    responeData.ref_trans = data_check_transaction.result[0].id;
                                }
                            } else {
                                responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                                responeData.status = false;
                            }
                        }
                    }
                }
            } else {
                responeData.msg =
                    "ไม่สามารถรับโปรโมชั่นนี้ได้ เนื่องจากติดโปรโมชั่น " +
                    data_receive_last_promotion.result[0].name;
                responeData.status = false;
            }
        } else if (data.result[0].pro_type == 2) {
            let data_receive_last_promotion =
                await queryMember.queryCheckReceivePromotionLast(req);
            if (
                data_receive_last_promotion.result.length == 0 ||
                data_receive_last_promotion.result[0].promotion_id == req.body.pro_id
            ) {
                let data_check_receive_promotion =
                    await queryMember.queryCheckReceiveRegisterPromotion(req);
                if (
                    data_check_receive_promotion.status &&
                    data_check_receive_promotion.result.length > 0
                ) {
                    responeData.msg =
                        "คุณรับโปรโมชั่นนี้ไปแล้ว จำนวน <span>" +
                        data_check_receive_promotion.result[0].amount +
                        "</span> บาท";
                    responeData.status = false;
                } else {
                    let date_start = new Date();
                    let date_end = new Date();
                    date_start.setHours(0);
                    date_start.setMinutes(0);
                    date_start.setSeconds(0);
                    date_end.setHours(23);
                    date_end.setMinutes(59);
                    date_end.setSeconds(59);
                    date_end.setDate(date_end.getDate() + 1);
                    req.body.start =
                        formatDate1(date_start) + " " + formatTime(date_start);
                    req.body.end = formatDate1(date_end) + " " + formatTime(date_end);
                    let data_check_transaction =
                        await queryMember.queryCheckTransactionToday(req);
                    if (data_check_transaction.result.length == 1) {
                        let memberId = req.body.id;
                        let balance_transaction = data_check_transaction.result[0].id;
                        let data_balance_wallet = await queryMember.getBalanceWalletDetail(
                            memberId
                        );
                        let balance_wallet = data_balance_wallet.result[0].balance;
                        let data_check = {
                            balance_transaction: balance_transaction,
                        };
                        let data_check_balance_wallet =
                            await queryMember.queryCheckBalanceWalletByIDRef(data_check);
                        if (data_check_balance_wallet.result[0].balance == balance_wallet) {
                            let data_check_transaction_withdraw =
                                await queryMember.queryCheckTransactionTodayWithdraw(req);
                            if (data_check_transaction_withdraw.result.length == 0) {
                                responeData.msg = "สามารถรับโปรโมชั่นนี้ได้";
                                responeData.status = true;
                                responeData.ref_trans = data_check_transaction.result[0].id;
                            } else {
                                responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                                responeData.status = false;
                            }
                        } else {
                            responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                            responeData.status = false;
                        }
                    } else {
                        responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                        responeData.status = false;
                    }
                }
            } else {
                responeData.msg =
                    "ไม่สามารถรับโปรโมชั่นนี้ได้ เนื่องจากติดโปรโมชั่น " +
                    data_receive_last_promotion.result[0].name;
                responeData.status = false;
            }
        } else if (data.result[0].pro_type == 3) {
            let data_receive_last_promotion = await queryMember.queryCheckReceivePromotionLast(req);
            if (
                data_receive_last_promotion.result.length == 0 ||
                data_receive_last_promotion.result[0].promotion_id == req.body.pro_id
            ) {
                let date_start = new Date();
                let date_end = new Date();
                date_start.setHours(0);
                date_start.setMinutes(0);
                date_start.setSeconds(0);
                date_end.setHours(23);
                date_end.setMinutes(59);
                date_end.setSeconds(59);
                date_end.setDate(date_end.getDate() + 1);
                req.body.start =
                    formatDate1(date_start) + " " + formatTime(date_start);
                req.body.end = formatDate1(date_end) + " " + formatTime(date_end);
                let data_receive_count_promotion = await queryMember.queryCheckReceiveCountPromotion(req);
                if (
                    data_receive_count_promotion.result.length <
                    parseInt(data.result[0].limit_r)
                ) {
                    let data_check_receive_promotion =
                        await queryMember.queryCheckReceiveRegisterPromotion(req);
                    if (
                        data_check_receive_promotion.status &&
                        data_check_receive_promotion.result.length > 0
                    ) {
                        responeData.msg =
                            "คุณรับโปรโมชั่นนี้ไปแล้ว จำนวน <span>" +
                            data_check_receive_promotion.result[0].amount +
                            "</span> บาท";
                        responeData.status = false;
                    } else {
                        // let date_start = new Date();
                        // let date_end = new Date();
                        // date_start.setHours(0);
                        // date_start.setMinutes(0);
                        // date_start.setSeconds(0);
                        // date_end.setHours(23);
                        // date_end.setMinutes(59);
                        // date_end.setSeconds(59);
                        // date_end.setDate(date_end.getDate() + 1);
                        // req.body.start =
                        //     formatDate1(date_start) + " " + formatTime(date_start);
                        // req.body.end = formatDate1(date_end) + " " + formatTime(date_end);

                        let data_check_transaction =
                            await queryMember.queryCheckTransactionTodayLast(req);
                        if (data_check_transaction.result.length > 0) {
                            if (
                                data_check_transaction.result[0].amount ==
                                data.result[0].deposit_u
                            ) {
                                let memberId = req.body.id;
                                let balance_transaction = data_check_transaction.result[0].id;
                                let data_balance_wallet =
                                    await queryMember.getBalanceWalletDetail(memberId);
                                let balance_wallet = data_balance_wallet.result[0].balance;
                                let data_check = {
                                    balance_transaction: balance_transaction,
                                };
                                let data_check_balance_wallet =
                                    await queryMember.queryCheckBalanceWalletByIDRef(data_check);
                                if (
                                    data_check_balance_wallet.result[0].balance == balance_wallet
                                ) {
                                    responeData.msg = "สามารถรับโปรโมชั่นนี้ได้";
                                    responeData.status = true;
                                    responeData.ref_trans = data_check_transaction.result[0].id;
                                } else {
                                    responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                                    responeData.status = false;
                                }
                            } else {
                                responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                                responeData.status = false;
                            }
                        } else {
                            responeData.msg = "คุณไม่อยู่ในเงื่อนไขการรับโปรโมชั่นนี้";
                            responeData.status = false;
                        }
                    }
                } else {
                    responeData.msg = "คุณรับโปรโมชั่นนี้เกินกำหนดแล้ว";
                    responeData.status = false;
                }
            } else {
                responeData.msg =
                    "ไม่สามารถรับโปรโมชั่นนี้ได้ เนื่องจากติดโปรโมชั่น " +
                    data_receive_last_promotion.result[0].name;
                responeData.status = false;
            }
        }
    } else {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }

    // } catch (e) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    // }
    res.send(responeData);
};

module.exports.ApiReceivePromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberId = req.body.id;
        let data = await queryMember.getBalanceWalletDetail(memberId);
        let walletID = data.result[0].id;
        let amount = data.result[0].amount;
        let balance = data.result[0].balance;
        let type = data.result[0].wallet_type;
        let ref_table = data.result[0].ref_table;
        if (
            type == "deposit" &&
            (ref_table == "transaction" || ref_table == "manual")
        ) {
            data = await queryMember.queryPromotionByID(req);
            console.log("🚀 ~ file: backend.controller.js:6724 ~ module.exports.ApiReceivePromotion=async ~ data:", data)
            if (data.result[0].pro_type == 3) {
                let bonus = data.result[0].receive_pro - data.result[0].deposit_u;
                let total = parseFloat(balance) + parseFloat(bonus);
                let turnover = parseFloat(data.result[0].turn) + parseFloat(balance) - parseFloat(data.result[0].deposit_u);
                let percen = parseFloat(data.result[0].turn);
                let x = 0;
                balance -= data.result[0].deposit_u;
                const dataWallet = {
                    memberId: memberId,
                    amount: bonus,
                    balance: total,
                    walletType: "promotion",
                    refTable: "member_promotion",
                    refId: 0,
                    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    sts: "1",
                };
                let insWallet = await queryMember.createWallet(dataWallet);
                let LastWaleltID = insWallet.result.insertId;

                let dataReceive = {
                    member_id: req.body.id,
                    promotion_id: req.body.pro_id,
                    wallet_id: LastWaleltID,
                    wallet_balance: balance,
                    pro_type: "game",
                    pro_percen: percen,
                    pro_amount: total,
                    pro_x_trun: x,
                    pro_trun_amount: turnover,
                    created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    flag: 1,
                };
                let insPromotion = await queryMember.createMemberPromotion(dataReceive);
                let LastPromotionID = insPromotion.result.insertId;

                let dataUpdate = {
                    LastWaleltID: LastWaleltID,
                    LastPromotionID: LastPromotionID,
                };
                await queryMember.updateRefWalletByMe(dataUpdate);
                let dataTransaction = {
                    idPromotion: req.body.pro_id,
                    idTransaction: req.body.trans,
                };
                await queryMember.updateTransPromotion(dataTransaction);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.pro_detail = data.result;
                res.send(responeData);
            } else {
                let percen = data.result[0].percen;
                let x = data.result[0].x;
                let limit_d = data.result[0].limit_d;
                let bonus = (parseFloat(amount) * parseFloat(percen)) / 100;
                let total = parseFloat(balance) + parseFloat(bonus);
                let turnover = (parseFloat(amount) + bonus) * x;
                if (amount <= limit_d) {
                    const dataWallet = {
                        memberId: memberId,
                        amount: bonus,
                        balance: total,
                        walletType: "promotion",
                        refTable: "member_promotion",
                        refId: 0,
                        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        sts: "1",
                    };
                    let insWallet = await queryMember.createWallet(dataWallet);
                    let LastWaleltID = insWallet.result.insertId;

                    let dataReceive = {
                        member_id: req.body.id,
                        promotion_id: req.body.pro_id,
                        wallet_id: LastWaleltID,
                        wallet_balance: balance,
                        pro_type: "game",
                        pro_percen: percen,
                        pro_amount: total,
                        pro_x_trun: x,
                        pro_trun_amount: turnover,
                        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        updated_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        flag: 1,
                    };
                    let insPromotion = await queryMember.createMemberPromotion(
                        dataReceive
                    );
                    let LastPromotionID = insPromotion.result.insertId;

                    let dataUpdate = {
                        LastWaleltID: LastWaleltID,
                        LastPromotionID: LastPromotionID,
                    };
                    await queryMember.updateRefWalletByMe(dataUpdate);
                    let dataTransaction = {
                        idPromotion: req.body.pro_id,
                        idTransaction: req.body.trans,
                    };
                    await queryMember.updateTransPromotion(dataTransaction);
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.pro_detail = data.result;
                    res.send(responeData);
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.msg = "ไม่สามารถรับโปรโมชั่นได้ กรุณาติดต่อ Admin";
                }
            }
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = "ไม่สามารถรับโปรโมชั่นได้ กรุณาติดต่อ Admin2";
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.checkWithdraw = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let money = req.body.money;
        let memberId = req.body.id;
        let username = req.body.username;
        let data_settings = await queryMember.querySettingSystem();
        let withdraw_limit = data_settings.result[0].w_limit;
        let ref_id = 0;
        let ref_table = "transaction";
        let pro_c = false;

        let dataMember = await queryMember.queryMemberBankdetail(req);
        let bankname = dataMember.result[0].bank_name;
        let bankname_eng = dataMember.result[0].bank_id;
        let accnum = dataMember.result[0].accnum;
        let name = dataMember.result[0].name;
        // let user_balance = parseFloat(data.result[0].data.balance).toFixed(2);
        // if (user_balance < money) {
        //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
        //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        //     responeData.msg = 'จำนวนเงินไม่พอกรุณาใส่ให้ถูกต้อง';
        //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
        //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        //     responeData.msg = 'จำนวนเงินไม่เพียงพอต่อการถอน';
        //     res.send(responeData);
        //     res.send(responeData);
        //     return;
        // }
        if (bankname_eng === 'truewallet') {
            withdraw_limit = data_settings.result[0].w_limit_twl;
            let modd = parseFloat(money) % 10;
            if (money < 100) {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg = `ถอนขั้นต่ำ 100บาท`;
                res.send(responeData);
                return
            }
            if (modd != 0) {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg = `จำนวนเงินต้องเป็นหลักสิบ เช่น 100,110,150,160`;
                res.send(responeData);
                return
            }
        }

        if (money >= withdraw_limit) {
            let data = await queryMember.getBalanceWalletDetail(memberId);
            let total = parseFloat(data.result[0].balance) - parseFloat(money);
            let amount = data.result[0].balance;
            console.log(`Total:`, total, `Amout:`, amount, `money:`, money);
            if (total >= 0) {
                // CheckPromotion
                let checkPromotion = false;
                let dataCheckPromotionUser = await queryMember.queryPromotionUser(
                    memberId
                );
                if (dataCheckPromotionUser.result.length == 0) {
                    checkPromotion = true;
                } else {
                    if (
                        dataCheckPromotionUser.result[0].pro_type == 1 ||
                        dataCheckPromotionUser.result[0].pro_type == 2
                    ) {
                        pro_c = true;
                        let resultTurnover = await checkTurnOverUFA(username);
                        let turnOver = resultTurnover.data != null ? resultTurnover.data.turnover : 0;

                        if (turnOver >= dataCheckPromotionUser.result[0].pro_trun_amount) {
                            checkPromotion = true;
                        } else {
                            checkPromotion = false;
                        }
                    } else if (dataCheckPromotionUser.result[0].pro_type == 3) {
                        if (parseFloat(money) <= dataCheckPromotionUser.result[0].wallet_balance) {
                            let wallet_balance = parseFloat(dataCheckPromotionUser.result[0].wallet_balance) - parseFloat(money);
                            let pro_trun_amount = parseFloat(dataCheckPromotionUser.result[0].pro_trun_amount) - parseFloat(money);
                            let dataUpdatePro = {
                                id: dataCheckPromotionUser.result[0].pid,
                                wallet_balance: wallet_balance,
                                pro_trun_amount: pro_trun_amount,
                            };
                            await queryMember.updateMoneyPromotionThree(dataUpdatePro);
                            checkPromotion = true;
                        } else if (parseFloat(money) >= parseFloat(dataCheckPromotionUser.result[0].pro_trun_amount)) {
                            // console.log("🚀 ~ file: backend.controller.js:6915 ~ module.exports.checkWithdraw=async ~ money:", parseFloat(dataCheckPromotionUser.result[0].pro_trun_amount))

                            pro_c = true;
                            let balance_now = parseFloat(dataCheckPromotionUser.result[0].wallet_balance);
                            let balance_pro = parseFloat(dataCheckPromotionUser.result[0].withdraw_u);
                            let total_pro = parseFloat(money) - parseFloat(dataCheckPromotionUser.result[0].pro_percen);
                            let total_balance = balance_now - total_pro;
                            if (total_balance >= 0) {
                                money = total_pro + balance_pro;
                                total = total_balance;
                            } else {
                                money = total_pro + balance_pro;
                                total = 0;
                            }
                            ref_id = dataCheckPromotionUser.result[0].pid;
                            ref_table = "member_promotion";
                            let dataUpdatePro = {
                                id: dataCheckPromotionUser.result[0].pid,
                                flag: 0,
                            };
                            await queryMember.updateFlagPromotion(dataUpdatePro);
                            checkPromotion = true;
                        } else {
                            checkPromotion = false;
                        }
                    }
                }

                if (checkPromotion) {
                    const dataWallet = {
                        memberId: memberId,
                        amount: money * -1,
                        balance: total,
                        walletType: "withdraw",
                        refTable: ref_table,
                        refId: ref_id,
                        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        sts: "1",
                    };
                    let insWallet = await queryMember.createWallet(dataWallet);
                    let LastWaleltID = insWallet.result.insertId;

                    const dataTrans = {
                        username: username,
                        type: "0",
                        amount: money,
                        transaction_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        stats: 1,
                        pro_id: 0,
                        date_new: dayjs().format("YYYY-MM-DD"),
                        response_api: null,
                        remark: "",
                    };
                    let insTransactionWithdraw = await queryMember.createTrans(dataTrans);
                    let LastTransactionID = insTransactionWithdraw.result.insertId;

                    let dataUpdate = {
                        LastWaleltID: LastWaleltID,
                        LastPromotionID: LastTransactionID,
                    };
                    await queryMember.updateRefWalletByMe(dataUpdate);

                    let proccc = pro_c ?
                        dataCheckPromotionUser.result[0].name :
                        "ไม่มีโปรโมชั่น";
                    let messageLineNotify = "";
                    messageLineNotify += "\n☹▶สมาชิกแจ้งถอนเงิน◀☹";
                    messageLineNotify += "\nสมาชิก => " + username;
                    messageLineNotify += "\nชื่อสมาชิก => " + name;
                    messageLineNotify +=
                        "\nธนาคารลูกค้า => " + bankname + " (" + bankname_eng + ")";
                    messageLineNotify += "\nเลขบัญชี => " + accnum;
                    messageLineNotify += "\nยอดก่อนถอน => " + amount + " บาท";
                    messageLineNotify += "\nจำนวนเงินที่ถอน => " + money + " บาท";
                    messageLineNotify +=
                        "\nยอดเงินลูกค้าคงเหลือ => " + total.toFixed(2) + " บาท";
                    messageLineNotify += "\nโปรโมชั่น => " + proccc;
                    messageLineNotify +=
                        "\nเวลา => " +
                        formatDate(new Date()) +
                        " " +
                        formatTime(new Date());
                    messageLineNotify += "\nสถานะ => รอดำเนินการถอน";
                    let token_withdraw = data_settings.result[0].token_line_with;
                    sendMessageLineNotify(token_withdraw, messageLineNotify);

                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    res.send(responeData);
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.msg = "ติดเงื่อนไขโปรโมชั่นอยู่";
                    res.send(responeData);
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg = "จำนวนเงินไม่เพียงพอต่อการถอน";
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = `ถอนขั้นต่ำ ${withdraw_limit}บาท`;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiGetBank = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryGetBank(req);
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiquerymemberSel = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryAllMemberSEL();
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportMemberTopup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let sts = req.body.sts;
            let data = "";
            if (sts == 0) {
                data = await queryMember.queryMemberTopupAll(req);
            } else if (sts == 1) {
                data = await queryMember.queryMemberTopupBank(req);
            } else if (sts == 2) {
                data = await queryMember.queryMemberTopupManual(req);
            }
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportMemberTopupSort = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let sts = req.body.sts;
            let data = "";
            let date = new Date();
            let dateEnd = new Date();
            if (req.body.date == -1) {
                date.setDate(date.getDate() - 1);
                req.body.start = formatDate1(date) + " " + formatTime(date);
                req.body.end = formatDate1(dateEnd) + " " + formatTime(dateEnd);
            } else if (req.body.date == 1) {
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(1);
                req.body.start = formatDate1(date) + " " + formatTime(date);
                req.body.end = formatDate1(dateEnd) + " " + formatTime(dateEnd);
            } else if (req.body.date == 30) {
                date.setDate(1);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(1);
                req.body.start = formatDate1(date) + " " + formatTime(date);
                req.body.end = formatDate1(dateEnd) + " " + formatTime(dateEnd);
            } else if (req.body.date == -30) {
                date.setDate(1);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(1);
                date.setMonth(date.getMonth() - 1);
                dateEnd.setMonth(dateEnd.getMonth() - 1);

                if (date.getMonth() == 0) {
                    dateEnd.setDate(31);
                } else if (date.getMonth() == 1) {
                    dateEnd.setDate(28);
                } else if (date.getMonth() == 2) {
                    dateEnd.setDate(31);
                } else if (date.getMonth() == 3) {
                    dateEnd.setDate(30);
                } else if (date.getMonth() == 4) {
                    dateEnd.setDate(31);
                } else if (date.getMonth() == 5) {
                    dateEnd.setDate(30);
                } else if (date.getMonth() == 6) {
                    dateEnd.setDate(31);
                } else if (date.getMonth() == 7) {
                    dateEnd.setDate(31);
                } else if (date.getMonth() == 8) {
                    dateEnd.setDate(30);
                } else if (date.getMonth() == 9) {
                    dateEnd.setDate(31);
                } else if (date.getMonth() == 10) {
                    dateEnd.setDate(30);
                } else if (date.getMonth() == 11) {
                    dateEnd.setDate(31);
                }
                dateEnd.setHours(23);
                dateEnd.setMinutes(59);
                dateEnd.setSeconds(59);
                req.body.start = formatDate1(date) + " " + formatTime(date);
                req.body.end = formatDate1(dateEnd) + " " + formatTime(dateEnd);
            }
            if (sts == 0) {
                data = await queryMember.queryMemberTopupAll(req);
            } else if (sts == 1) {
                data = await queryMember.queryMemberTopupBank(req);
            } else if (sts == 2) {
                data = await queryMember.queryMemberTopupManual(req);
            }
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateLastLogin = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        req.body.time = dayjs().format("YYYY-MM-DD HH:mm:ss");
        let data = await queryMember.updateLastLogin(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiDashBoardAll = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        const state_web = await queryMember.querySettingGame();
        let state_ufa = await state_web.result.find(ss => ss.game === 'ufa')
        let state_lotto = await state_web.result.find(ss => ss.game === 'lotto')
        req.body.dateMonth = 0;
        if (auth.status) {
            let dayss = req.body.days;
            let date_start = new Date();
            let date_end = new Date();
            if (dayss == 0) {
                date_start.setHours(0);
                date_start.setMinutes(0);
                date_start.setSeconds(0);
                date_end.setHours(23);
                date_end.setMinutes(59);
                date_end.setSeconds(59);
                date_end.setDate(date_end.getDate() + 1);
            } else if (dayss == 31) {
                date_start.setHours(0);
                date_start.setMinutes(0);
                date_start.setSeconds(0);
                date_end.setHours(23);
                date_end.setMinutes(59);
                date_end.setSeconds(59);
                date_end.setDate(date_end.getDate() + 1);
                let date = formatDate2(new Date());
                req.body.dateMonth = date;
            } else {
                date_start.setHours(0);
                date_start.setMinutes(0);
                date_start.setSeconds(0);
                date_end.setHours(23);
                date_end.setMinutes(59);
                date_end.setSeconds(59);
                date_start.setDate(date_start.getDate() - parseInt(dayss));
                date_end.setDate(date_end.getDate() - parseInt(dayss));
            }

            req.body.start = formatDate1(date_start) + " " + formatTime(date_start);
            req.body.end = formatDate1(date_end) + " " + formatTime(date_end);

            // let NewMemberToday = await queryMember.queryNewMemberToday(req);
            let MemberAll = await queryMember.queryMemberAllCount(req);

            // let dateOnlineStart = moment().subtract(2, 'm').format('YYYY-MM-DD HH:mm:ss')
            // let dateOnlineEnd = moment().format('YYYY-MM-DD HH:mm:ss')

            // dateOnlineStart.setMinutes(dateOnlineStart.getMinutes() - 2);

            // dateOnlineStart = formatDate1(dateOnlineStart) + ' ' + formatTime(dateOnlineStart);
            // dateOnlineEnd = formatDate1(dateOnlineEnd) + ' ' + formatTime(dateOnlineEnd);

            // let dataOnline = {
            //     dateOnlineStart: dateOnlineStart,
            //     dateOnlineEnd: dateOnlineEnd
            // };

            // let MemberOnlineNow = await queryMember.queryMemberOnline(dataOnline);
            // let MemberOnlineToday = await queryMember.queryMemberOnlineToday(req);
            let DepositToday;
            let WithdrawToday;
            let ActiveToday;

            if (req.body.dateMonth == 0) {
                DepositToday = await queryMember.queryDepositToday(req);
                WithdrawToday = await queryMember.queryWithdrawToday(req);
                ActiveToday = await queryMember.queryActiveToday(req);

            } else {
                let startDate = moment().startOf("month").format("YYYY-MM-DD");
                let endDate = moment().endOf("month").format("YYYY-MM-DD");
                DepositToday = await queryMember.queryDepositMonth(req);
                WithdrawToday = await queryMember.queryWithdrawMonth(req);
                ActiveToday = await queryMember.queryActiveMonth(startDate, endDate);
            }
            let winloss;

            if (req.body.dateMonth == 0) {
                let date = new Date();
                date.setDate(date.getDate() - parseInt(dayss));
                req.body.startDate = formatDate1(date);
                req.body.endDate = formatDate1(new Date());
                winloss = await queryMember.queryWinLossGame(req);
            } else {
                let date = new Date();
                date.setDate(1);
                req.body.startDate = formatDate1(date);
                req.body.endDate = formatDate1(new Date());
                winloss = await queryMember.queryWinLossGame(req);
            }
            winloss = winloss.result[0].amount ? winloss.result[0].amount : 0;
            if (!winloss) {
                winloss = 0;
            }
            let totalTurnoverAll = "";

            if (req.body.dateMonth == 0) {
                let date = new Date();
                date.setDate(date.getDate() - parseInt(dayss));
                date = formatDateBase(date);
                totalTurnoverAll = await queryMember.queryTurnoverAll(date);
            } else {
                let date = new Date();
                date = formatDateBaseMonth(date);
                totalTurnoverAll = await queryMember.queryTurnoverAllMonth(date);
            }

            let CreditAllMember = await queryMember.sumBalanceWalletAllmember();
            let NewMemberToday = await queryMember.registerMemberTime(req.body);
            let dateOnlineStart = moment().subtract(120, "m").format("YYYY-MM-DD HH:mm:ss");
            let dateOnlineEnd = moment().format("YYYY-MM-DD HH:mm:ss");
            let MemberOnlineNow = await queryMember.onlineMemberNow(dateOnlineStart, dateOnlineEnd);
            // let MemberOnlineToday = [];
            // await MemberAll.result.map(async(ss) => {
            //     let dataWallet = await queryMember.getBalanceWallet(ss.id);
            //     if (dataWallet.result.length > 0) {
            //         CreditAllMember += parseFloat(dataWallet.result[0].balance);
            //     }
            //     //NewMemberToday
            //     if (
            //         moment(ss.cre_date).format("YYYY-MM-DD") ==
            //         moment().format("YYYY-MM-DD")
            //     ) {
            //         NewMemberToday.push(ss);
            //     }
            //     //MemberOnlineNow
            //     let dateOnlineStart = moment()
            //         .subtract(2, "m")
            //         .format("YYYY-MM-DD HH:mm:ss");
            //     let dateOnlineEnd = moment().format("YYYY-MM-DD HH:mm:ss");
            //     let nowLastUpdate = moment(ss.cre_date).format("YYYY-MM-DD HH:mm:ss");
            //     if (
            //         nowLastUpdate >= dateOnlineStart &&
            //         nowLastUpdate <= dateOnlineEnd
            //     ) {
            //         MemberOnlineNow.push(ss);
            //     }
            //     //MemberOnlineToday
            //     // if (
            //     //     moment(ss.LastUpdate).format("YYYY-MM-DD") ==
            //     //     moment().format("YYYY-MM-DD")
            //     // ) {
            //     //     MemberOnlineToday.push(ss);
            //     // }
            //     return ss;
            // });

            if (!totalTurnoverAll.result[0].amount) {
                totalTurnoverAll = 0;
            } else {
                totalTurnoverAll = totalTurnoverAll.result[0].amount;
            }

            let winlossLottoWinner;
            let winlossLotto;
            let winlossLottoAll;
            if (state_lotto.sts) {
                if (req.body.dateMonth == 0) {
                    let date = new Date();
                    date.setDate(date.getDate() - parseInt(dayss));
                    date = formatDate1(date);
                    winlossLotto = await queryMember.queryWinlossLotto(date);
                    winlossLottoWinner = await queryMember.queryWinlossLottoWinner(date);
                } else {
                    let date = new Date();
                    date = formatDateBaseMonthLotto(date);
                    winlossLotto = await queryMember.queryWinlossLotto(date);
                    winlossLottoWinner = await queryMember.queryWinlossLottoWinner(date);
                }
                if (!winlossLotto.result[0].amount) {
                    winlossLotto = 0;
                } else {
                    winlossLotto = winlossLotto.result[0].amount;
                }

                if (!winlossLottoWinner.result[0].amount) {
                    winlossLottoWinner = 0;
                } else {
                    winlossLottoWinner = winlossLottoWinner.result[0].amount;
                }


                // let sql;
                if (req.body.dateMonth == 0) {
                    let date = new Date();
                    date.setDate(date.getDate() - parseInt(dayss));
                    date = formatDate1(date);
                    winlossLottoAll = await queryMember.queryWinlossLottoAll(date);
                    // sql = "SELECT SUM(amount) AS amount FROM tb_lotto_number_data WHERE date_time_add LIKE '" + date + "%'";
                } else {
                    let date = new Date();
                    date = formatDateBaseMonthLotto(date);
                    winlossLottoAll = await queryMember.queryWinlossLottoAll(date);
                    // sql = "SELECT SUM(amount) AS amount FROM tb_lotto_number_data WHERE date_time_add LIKE '" + date + "%'";
                }
                if (!winlossLottoAll.result[0].amount) {
                    winlossLottoAll = 0;
                } else {
                    winlossLottoAll = winlossLottoAll.result[0].amount;
                }
            } else {
                winlossLottoWinner = 0
                winlossLotto = 0
                winlossLottoAll = 0
            }


            let dataAF;
            if (req.body.dateMonth == 0) {
                let date = new Date();
                date.setDate(date.getDate() - parseInt(dayss));
                date = formatDate1(date);
                dataAF = await queryMember.querydataAF(date);
            } else {
                let date = new Date();
                date = formatDateBaseMonthLotto(date);
                dataAF = await queryMember.querydataAF(date);
            }

            if (!dataAF.result[0].amount) {
                dataAF = 0;
            } else {
                dataAF = dataAF.result[0].amount;
            }

            let bet;
            if (req.body.dateMonth == 0) {
                let date = new Date();
                date.setDate(date.getDate() - parseInt(dayss));
                date = formatDate1(date);
                bet = await queryMember.querydataBET(date);
            } else {
                let date = new Date();
                date = formatDateBaseMonthLotto(date);
                bet = await queryMember.querydataBET(date);

            }

            if (bet.result.length > 0) {
                if (!bet.result[0].amount) {
                    bet = 0;
                } else {
                    bet = bet.result[0].amount;
                }
            } else {
                bet = 0
            }


            // let creditAFAll = await queryMember.creditAFAll();
            // responeData.sql = sql;
            responeData.NewMemberToday = NewMemberToday;
            responeData.MemberAll = MemberAll.result.length;
            responeData.MemberOnlineNow = MemberOnlineNow.length;
            responeData.MemberOnlineToday = (ActiveToday.length == 1) ? ActiveToday[0].active : 0;
            responeData.DepositToday = DepositToday.result[0].amount;
            responeData.WithdrawToday = WithdrawToday.result[0].amount;
            responeData.winloss = winloss;
            responeData.winlossLotto2222 = winlossLotto;
            responeData.winlossLottoWinner = winlossLottoWinner;
            responeData.winlossLotto = winlossLotto - winlossLottoWinner;
            responeData.winlossLottoAll = winlossLottoAll;
            responeData.CreditAllMember = CreditAllMember;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.totalTurnoverAll = totalTurnoverAll;
            responeData.dataAff = dataAF;
            responeData.bet = bet;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReceiveBonus = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let settings = await queryMember.querySettingLine();
        let memberId = (req.body.id) ? req.body.id : 0;
        let check_ref_log = await queryMember.queryReflogMemberId(memberId)
        // console.log("🚀 ~ file: backend.controller.js:7780 ~ module.exports.ApiReceiveBonus= ~ check_ref_log:", check_ref_log)
        if (check_ref_log.length > 0) {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = "ไม่สามารถรับโบนัสได้ คุณกดรับไปแล้ว";
            res.send(responeData);
            return
        }
        let check_ref_data_turnover = await queryMember.queryRefWithMemberId(memberId, moment().subtract(1, 'days').format('YYYY-MM-DD'))
        if (check_ref_data_turnover.length < 1) {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = "ไม่ข้อมูลแนะนำเพื่อน";
            res.send(responeData);
            return
        }

        let aff_m = settings.result[0].aff_m / 100
        let bonus = 0

        for (const rr of check_ref_data_turnover) {
            bonus = bonus + (rr.turnover * aff_m)
        }
        // console.log(bonus.toFixed(4))
        if (bonus > 0) {
            const dataRefLog = {
                username: (await queryMember.queryMemberWithID(memberId)).result.username,
                bonus: bonus.toFixed(4),
                date: moment().format("YYYY-MM-DD HH:mm:ss"),
            };
            let insertdataRefLog = await queryMember.createHistoryRefLog(
                dataRefLog
            );
            let LastRefLogID = insertdataRefLog.result.insertId;
            // console.log("🚀 ~ file: backend.controller.js:7814 ~ module.exports.ApiReceiveBonus= ~ LastRefLogID:", LastRefLogID)
            // return
            let Wallet = await queryMember.getBalanceWallet(memberId);
            let balance = Wallet.result[0].balance;
            // console.log("🚀 ~ file: backend.controller.js:7816 ~ module.exports.ApiReceiveBonus= ~ balance:", balance)
            balance = parseFloat(balance) + bonus
            const dataWallet = {
                memberId: memberId,
                amount: bonus.toFixed(4),
                balance: balance.toFixed(2),
                walletType: "bonus",
                refTable: "ref_log",
                refId: LastRefLogID,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
                sts: "1",
            };
            await queryMember.createWallet(dataWallet);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.bonus = bonus.toFixed(4);
            res.send(responeData);
        }
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }

};

module.exports.ApiReceiveBonusWinloss = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let settings = await queryMember.querySettingWinloss();
        let date = new Date();
        let chkDay = settings.result[0].days;
        let memberId = req.body.id;
        let dataWallet = await queryMember.getBalanceWallet(memberId);
        let balance = dataWallet.result[0].balance;
        let username = req.body.username;
        if (settings.result[0].stats == 1) {
            if (date.getDay() == chkDay) {
                let date_start = new Date();
                let date_end = new Date();
                date_start.setHours(0);
                date_start.setMinutes(0);
                date_start.setSeconds(0);
                date_end.setHours(23);
                date_end.setMinutes(59);
                date_end.setSeconds(59);
                let dataChk = {
                    username: username,
                    Dstart: formatDate1(date_start) + " " + formatTime(date_start),
                    Dend: formatDate1(date_end) + " " + formatTime(date_end),
                };
                let chkReceive = await queryMember.queryHistoryWinloss(dataChk);
                if (chkReceive.result.length == 0) {
                    let dateS = new Date();
                    dateS.setDate(dateS.getDate() - 7);
                    let dateE = new Date();
                    dateE.setDate(dateE.getDate() - 1);
                    let result = await checkWinLoss(
                        username,
                        formatDateCheck(dateS),
                        formatDateCheck(dateE)
                    );
                    if (result.data.winloss < 0) {
                        let winloss = parseFloat(result.data.winloss) * -1;
                        let amount =
                            (winloss * parseFloat(settings.result[0].amount)) / 100;
                        balance = parseFloat(balance) + amount;
                        const dataWinloss = {
                            username: username,
                            winloss: winloss,
                            bonus: amount,
                            cr_date: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                        };
                        let insdataWinloss = await queryMember.createHistoryWinloss(
                            dataWinloss
                        );
                        let LastWinlossID = insdataWinloss.result.insertId;

                        const dataWallet = {
                            memberId: memberId,
                            amount: amount,
                            balance: balance,
                            walletType: "bonus",
                            refTable: "history_winloss",
                            refId: LastWinlossID,
                            createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                            updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                            sts: "1",
                        };
                        await queryMember.createWallet(dataWallet);
                        responeData.amount = amount;
                        responeData.winloss = winloss;
                        responeData.statusCode = httpStatusCodes.Success.ok.code;
                        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                        responeData.bonus = amount.toFixed(2);
                    } else {
                        responeData.statusCode = httpStatusCodes.Fail.fail.code;
                        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                        responeData.msg = "ไม่สามารถรับโบนัสได้ คุณไม่มียอดเสีย";
                    }
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.msg = "ไม่สามารถรับโบนัสได้ คุณกดรับไปแล้ว";
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg =
                    "กดรับคืนยอดเสียได้ในวัน" + settings.result[0].days_th + "เท่านั้น";
            }
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = "ระบบคืนยอดเสียปิดใช้งานอยู่ ไม่สามารถรับโบนัสได้";
            responeData.data = settings.result;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiCheckDay = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberId = req.body.id;
        let username = req.body.username;
        let settings = await queryMember.querySettingWinloss();
        let date = new Date();
        let chkDay = settings.result[0].days;
        if (settings.result[0].stats == 1) {
            if (date.getDay() == chkDay) {
                let date_start = new Date();
                let date_end = new Date();
                date_start.setHours(0);
                date_start.setMinutes(0);
                date_start.setSeconds(0);
                date_end.setHours(23);
                date_end.setMinutes(59);
                date_end.setSeconds(59);
                let dataChk = {
                    username: username,
                    Dstart: formatDate1(date_start) + " " + formatTime(date_start),
                    Dend: formatDate1(date_end) + " " + formatTime(date_end),
                };
                let chkReceive = await queryMember.queryHistoryWinloss(dataChk);
                if (chkReceive.result.length == 0) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.data = settings.result;
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.msg =
                        'คุณรับโบนัสไปแล้ว จำนวน <span style="color:red">' +
                        chkReceive.result[0].bonus.toFixed(2) +
                        "</span> บาท";
                    responeData.data = settings.result;
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg =
                    'กดรับคืนยอดเสียได้ใน <span style="color:red">วัน' +
                    settings.result[0].days_th +
                    "</span> เท่านั้น";
                responeData.data = settings.result;
            }
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = "ระบบคืนยอดเสียปิดใช้งานอยู่ ไม่สามารถรับโบนัสได้";
            responeData.data = settings.result;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQuerySettingWeb = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingsWebWinLoss();
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingWinLoss = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        req.body.time = dayjs().format("YYYY-MM-DD HH:mm:ss");
        let data = await queryMember.updateSettingWinLoss(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryMemberOnline = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let date_start = new Date();
            let date_end = new Date();
            date_start.setHours(0);
            date_start.setMinutes(0);
            date_start.setSeconds(0);
            date_end.setHours(23);
            date_end.setMinutes(59);
            date_end.setSeconds(59);
            date_start.setDate(1);
            req.body.start = formatDate1(date_start) + " " + formatTime(date_start);
            req.body.end = formatDate1(date_end) + " " + formatTime(date_end);
            let dateOnlineStart = moment().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
            let dateOnlineEnd = moment().format('YYYY-MM-DD HH:mm:ss');
            let dataOnline = {
                dateOnlineStart: dateOnlineStart,
                dateOnlineEnd: dateOnlineEnd,
            };
            // checkWinloss() 1 = เดือน
            responeData.MemberOnlineNow = [];
            responeData.MemberOnlineMonth = [];

            let MemberOnlineNow = await queryMember.queryMemberOnline(dataOnline);
            let MemberOnlineMonth = await queryMember.queryMemberOnlineToday(req);
            if (MemberOnlineNow.result.length > 0) {
                let winlossToday = await checkWinlossMemberOnline(0);
                for (let i = 0; i < MemberOnlineNow.result.length; i++) {
                    if (winlossToday[MemberOnlineNow.result[i].ufa_user.toLowerCase()]) {
                        MemberOnlineNow.result[i].winloss =
                            winlossToday[
                                MemberOnlineNow.result[i].ufa_user.toLowerCase()
                            ].winloss.toFixed(2);
                    } else {
                        MemberOnlineNow.result[i].winloss = 0;
                    }
                }
                responeData.MemberOnlineNow = MemberOnlineNow.result;
            }

            if (MemberOnlineMonth.result.length > 0) {
                let winlossMonth = await checkWinlossMemberOnline(1);
                for (let i = 0; i < MemberOnlineMonth.result.length; i++) {
                    if (
                        winlossMonth[MemberOnlineMonth.result[i].ufa_user.toLowerCase()]
                    ) {
                        MemberOnlineMonth.result[i].winloss =
                            winlossMonth[
                                MemberOnlineMonth.result[i].ufa_user.toLowerCase()
                            ].winloss.toFixed(2);
                    } else {
                        MemberOnlineMonth.result[i].winloss = 0;
                    }
                }
                responeData.MemberOnlineMonth = MemberOnlineMonth.result;
            }

            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.description = e;
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportWinLost = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        // const resAdmin = await queryMember.getAdminByMappingApi('auth_lottohouse')
        // if (!resAdmin.status) { throw new Error() }
        // const { username, password } = resAdmin.result[0]
        // const objLottoHoust = new lottoHouse(username, password)
        /**================= End Api LottoHouse ================ */
        const reqPost = req.body;
        let dataShow = [];
        let lotto = false;
        let game = false;
        if (reqPost.selectType === "all") {
            lotto = true;
            game = true;
        } else if (reqPost.selectType === "lotto") {
            lotto = true;
        } else {
            game = true;
        }
        let dataLotto = "";
        ///Lotto
        if (lotto) {
            dataLotto = await queryMember.queryHistoryWinlossLotto(reqPost);
            const fetchdata = (dataLotto.result.length > 0) ? dataLotto.result : [];
            let sumyeekee = 0;
            let dataYeekee = {};
            dataYeekee.code = "lotto";
            dataYeekee.lotto_name = "หวยยี่กี";
            dataYeekee.comm = 0;
            dataYeekee.affiliate = 0;
            dataYeekee.amount = 0;
            dataYeekee.winner_amount = 0;
            dataYeekee.net_amount = 0;
            let newData = [];
            fetchdata.forEach((rr) => {
                if (rr.id >= 48 && rr.id <= 135) {
                    let comm = Number(rr.comm);
                    let aff = Number(rr.affiliate);
                    let amount = Number(rr.amount);
                    let winner_amount =
                        Number(rr.winner_amount) === 0 ?
                            Number(rr.amount) :
                            Number(rr.winner_amount) * -1;
                    let net_amount = Number(rr.net_amount) - aff;
                    dataYeekee.code = "lotto";
                    dataYeekee.lotto_name = "หวยยี่กี";
                    dataYeekee.comm = Number(dataYeekee.comm + comm);
                    dataYeekee.affiliate = Number(dataYeekee.affiliate + aff);
                    dataYeekee.amount = Number(dataYeekee.amount + amount);
                    dataYeekee.winner_amount = Number(
                        dataYeekee.winner_amount + winner_amount
                    );
                    dataYeekee.net_amount = Number(dataYeekee.net_amount + net_amount);
                } else {
                    let comm = Number(rr.comm);
                    let aff = Number(rr.affiliate);
                    let amount = Number(rr.amount);
                    let winner_amount =
                        Number(rr.winner_amount) === 0 ?
                            Number(rr.amount) :
                            Number(rr.winner_amount) * -1;
                    let net_amount = Number(rr.net_amount) + aff;
                    rr.comm = comm;
                    rr.aff = aff;
                    rr.amount = amount;
                    rr.winner_amount = winner_amount;
                    rr.net_amount = net_amount - aff * 2;
                    newData.push(rr);
                }
            });
            // for (const rr of fetchdata) {
            //     if (rr.id >= 48 && rr.id <= 135) {
            //         let comm = Number(rr.comm);
            //         let aff = Number(rr.affiliate);
            //         let amount = Number(rr.amount);
            //         let winner_amount = (Number(rr.winner_amount) === 0) ? (Number(rr.amount)) : (Number(rr.winner_amount) * -1);
            //         let net_amount = Number(rr.net_amount) - aff;
            //         dataYeekee.code = 'lotto';
            //         dataYeekee.lotto_name = 'หวยยี่กี';
            //         dataYeekee.comm = Number(dataYeekee.comm + comm);
            //         dataYeekee.affiliate = Number(dataYeekee.affiliate + aff);
            //         dataYeekee.amount = Number(dataYeekee.amount + amount);
            //         dataYeekee.winner_amount = Number(dataYeekee.winner_amount + winner_amount);
            //         dataYeekee.net_amount = Number(dataYeekee.net_amount + net_amount);
            //     } else {
            //         let comm = Number(rr.comm);
            //         let aff = Number(rr.affiliate);
            //         let amount = Number(rr.amount);
            //         let winner_amount = (Number(rr.winner_amount) === 0) ? (Number(rr.amount)) : (Number(rr.winner_amount) * -1);
            //         let net_amount = Number(rr.net_amount) + aff;
            //         rr.comm = comm;
            //         rr.aff = aff;
            //         rr.amount = amount;
            //         rr.winner_amount = winner_amount;
            //         rr.net_amount = net_amount - (aff * 2);
            //         newData.push(rr);
            //     }
            // }
            if (dataYeekee.net_amount > 0) {
                newData.push(dataYeekee);
            }
            if (fetchdata.length > 0) {
                dataShow = dataShow.concat(newData);
            }
        }
        let resCasino = "";

        if (game) {
            /// Casino
            resCasino = await queryMember.queryHistoryWinlossAll(reqPost);
            let gameData = {
                code: "game",
                lotto_name: "Casino & Game",
                comm: 0,
                affiliate: resCasino.result[0].aff,
                amount: resCasino.result[0].bet,
                winner_amount: resCasino.result[0].wl * -1,
                net_amount: resCasino.result[0].aff * -1 + resCasino.result[0].wl * -1,
            };
            if (gameData.net_amount != 0) {
                dataShow = dataShow.concat(gameData);
            }
        }

        if ((resCasino.status && dataLotto.status) || dataShow.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = dataShow;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportPlayer = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        // const resAdmin = await queryMember.getAdminByMappingApi('auth_lottohouse')
        // if (!resAdmin.status) { throw new Error() }
        // const { username, password } = resAdmin.result[0]
        // const objLottoHoust = new lottoHouse(username, password)
        /**================= End Api LottoHouse ================ */
        const data = await queryMember.reportPlayer(req.body);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportLottoSummary = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoSummary(req.body);
        // let lottoGroup = await queryMember.queryLottoGroup();
        // let data = await queryMember.queryLottoGroupAndType();
        const data2 = await queryMember.queryReportLottoSummary(req.body.lottoDate);
        let items = [];
        for (const rr of data.result) {
            let date_detail = [];

            for (const rrr of rr.lotto_detail) {
                let sum_bet = 0;
                // lotto_group_id
                if (rr.lotto_group_id == rrr.lotto_group_id) {
                    let resdata = {
                        id: rrr.id,
                        lottoDate: req.body.lottoDate,
                    };

                    // if (data2.result.length > 0) {
                    //     rrr.detail = data2.result;
                    //     // sum_bet = sum_bet + data2.result
                    //     data2.result.map((ss) => {
                    //         sum_bet = sum_bet + ss.bet
                    //     });
                    //     rrr.total_bet = sum_bet;
                    // } else {
                    //     rrr.detail = null;
                    //     rrr.total_bet = 0;
                    // }
                }
                date_detail.push(rrr);
            }
            rr.lotto_detail = date_detail;
            items.push(rr);
        }
        /// calculate
        for (const ss of items) { }
        data.result = items;
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportLottoSummaryCategory = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const { lottoDate, lottoGroupId, lottoType, modeType, flag } = req.body;
        // const data = await objLottoHoust.reportLottoSummaryCategory(req.body)
        // const data = [];
        const lotto_reward_type = await queryMember.queryLottoRewardType();
        let data = [];
        let items = [];
        // console.log(lottoGroupId);
        for (const rr of lotto_reward_type.result) {
            // console.log(rr);
            let ress = {
                id: rr.id,
                reward_name: rr.reward_name,
                description: rr.description,
                bet: 0,
                aff: 0,
                winner: 0,
                sumall: 0,
            };
            let qeury = {
                id: rr.id,
                lotto_type: lottoType,
                flag: flag,
                lottoDate: lottoDate,
            };
            // console.log(qeury)
            const data2 = await queryMember.queryReportLottoSummaryMember2(qeury);
            for (const rrr of data2.result) {
                // console.log(rrr);
                if (rr.id === rrr.lotto_reward_type) {
                    ress.bet = ress.bet + rrr.bet;
                    ress.aff = ress.aff + rrr.aff_amount * -1;
                    if (rrr.winner_flg == 1) {
                        ress.winner = ress.winner + rrr.win_amt;
                    }
                }
            }
            ress.sumall = ress.winner + ress.aff;
            rr.lotto_detail = ress;
            items.push(rr);
        }
        data = items;
        if (data.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
module.exports.ApiReportLottoSummaryNumber = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        // const resAdmin = await queryMember.getAdminByMappingApi('auth_lottohouse')
        // if (!resAdmin.status) { throw new Error() }
        // const { username, password } = resAdmin.result[0]
        // const objLottoHoust = new lottoHouse(username, password)
        /**================= End Api LottoHouse ================ */
        // const dataMain = await objLottoHoust.reportLottoSummaryNumber(req.body)
        let dataMain = {
            result: [{}],
        };
        // console.log(req.body);
        const { lottoDate, lottoGroupId, lottoType, modeType, flag } = req.body;
        const resRewardLotto = await queryMember.queryLottoRewardTypeByGroup(
            lottoGroupId
        );
        // const data2 = await queryMember.queryReportLottoSummaryMember(qeury);

        // console.log(data.result[0]);

        const lotto_reward_type = await queryMember.queryLottoRewardType();
        let data = [];
        let items = [];
        let numbers = [];
        // console.log(lottoGroupId);
        let lotto_number = [];
        for (const rr of lotto_reward_type.result) {
            lotto_number.push({
                key: rr.reward_name,
                id: rr.id,
                value: [],
            });
            let ress = {
                id: rr.id,
                reward_name: rr.reward_name,
                description: rr.description,
                bet: 0,
                aff: 0,
                winner: 0,
                sumall: 0,
            };
            // let lotto_number = {
            //     tong
            // };
            let qeury = {
                id: rr.id,
                lotto_type: lottoType,
                flag: flag,
                lottoDate: lottoDate,
            };
            const data2 = await queryMember.queryReportLottoSummaryNumber(qeury);

            // console.log(resRewardLotto.result)
            // {numbers: '650', amount: '5.00', numbrt_cnt: 1, winner_amount: '4500.00'}
            for (const rrr of data2.result) {
                // console.log(rrr);

                if (rr.id === rrr.lotto_reward_type) {
                    for (const nn of lotto_number) {
                        if (rr.id === nn.id) {
                            // console.log(nn.key)
                            nn.value.push({
                                numbers: rrr.numbers,
                                amount: rrr.bet,
                                numbrt_cnt: rrr.numbrt_cnt,
                                winner_amount: rrr.win_amt,
                            });
                        }
                    }

                    ress.bet = ress.bet + rrr.bet;
                    ress.aff = ress.aff + rrr.aff_amount * -1;
                    // if (rrr.winner_flg == 1) {
                    ress.winner = ress.winner + rrr.win_amt;
                    // }
                }
            }
            ress.sumall = ress.winner + ress.aff;
            rr.lotto_detail = ress;
            items.push(rr);
        }
        let newnumbers = [];
        for (const nn of lotto_number) {
            if (nn.value.length > 0) {
                nn.value.sort((a, b) => {
                    return b.winner_amount - a.winner_amount;
                });
                newnumbers.push(nn);
            }
        }

        dataMain.result[0].lotto_reward_detail = resRewardLotto.result;
        dataMain.result[0].lotto_detail = items;
        dataMain.result[0].lottoNumber = newnumbers;
        data = dataMain;
        if (items && newnumbers) {
            data.status = true;
        } else {
            data.status = false;
        }

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
module.exports.ApiReportLottoSummaryMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        // const data = await objLottoHoust.reportLottoSummaryMember(req.body)
        const { lottoDate, lottoGroupId, lottoType, modeType, flag } = req.body;
        const lotto_reward_type = await queryMember.queryLottoRewardType();
        let data = [];
        let items = [];
        for (const rr of lotto_reward_type.result) {
            let res = {
                id: rr.id,
                reward_name: rr.reward_name,
                description: rr.description,
                numbrt_cnt: 0,
                bet: 0,
                aff: 0,
                winner: 0,
                sumall: 0,
                partner: "-",
            };
            let qeury = {
                id: rr.id,
                lotto_type: lottoType,
                flag: flag,
            };
            const data2 = await queryMember.queryReportLottoSummaryMember(qeury);

            // console.log(data2)
            for (const rrr of data2.result) {
                if (rr.id === rrr.lotto_reward_type) {
                    // console.log(rrr);
                    rrr.username = rrr.username.replace("anlt01_", "");
                    let username = rrr.username;
                    let partner = await queryMember.queryDataMemberPartnerWithUsername(
                        username
                    );
                    // console.log(partner.result)
                    if (partner.result.length > 0) {
                        rrr.partner = partner.result[0].partner_username;
                    } else {
                        rrr.partner = "-";
                    }
                    // console.log(res.partner)
                    res.bet = res.bet + rrr.bet;
                    res.aff = res.aff + rrr.aff_amount;
                    res.numbrt_cnt = res.numbrt_cnt + rrr.numbrt_cnt;
                    if (rrr.winner_flg == 1) {
                        res.winner = res.winner + rrr.win_amt;
                    }
                    items.push(rrr);
                }
            }
            res.aff = res.aff * -1;
            res.sumall = res.winner + res.aff;
            rr.lotto_detail = res;
            // items.push(rr);
        }
        data.result = items;
        // console.log(data)
        if (data.result) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
module.exports.ApiReportLottoSetting = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoSetting(req.body);

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateLottoSetting = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    let lotto_type = [];
    let lotto_config = [];
    let lotto_limit = [];
    let r = /\d+/;
    let data_lotto_type = {};
    let data_lotto_config = {};
    let data_lotto_limit = {};
    let data_ins_config = [];
    let data_ins_limit = [];

    for (let i = 0; i < req.body.length; i++) {
        let data = req.body[i];
        if (data.name.includes("lotto_type")) {
            if (data.name.includes("id")) {
                data_lotto_type.id = data.value;
            }
            if (data.name.includes("lotto_name")) {
                data_lotto_type.lotto_name = data.value;
            }
            if (data.name.includes("lotto_date_open")) {
                data_lotto_type.lotto_date_open = data.value;
            }
            if (data.name.includes("lotto_date")) {
                data_lotto_type.lotto_date = data.value;
            }
            if (data.name.includes("profit_min")) {
                data_lotto_type.profit_min = data.value;
            }
            if (data.name.includes("profit_max")) {
                data_lotto_type.profit_max = data.value;
            }
        }

        if (data.name.includes("lotto_config")) {
            let idNum = data.name.match(r);
            idNum = idNum[0];
            if (lotto_config.length == 0) {
                lotto_config.push(idNum);
                data_lotto_config.id = idNum;
            } else {
                if (!lotto_config.includes(idNum)) {
                    data_ins_config.push(data_lotto_config);
                    data_lotto_config = {};
                    lotto_config.push(idNum);
                    data_lotto_config.id = idNum;
                } else {
                    if (data.name.includes("use_flag")) {
                        data_lotto_config.use_flag = data.value;
                    }
                    if (data.name.includes("play_min")) {
                        data_lotto_config.play_min = data.value;
                    }
                    if (data.name.includes("play_max")) {
                        data_lotto_config.play_max = data.value;
                    }
                    if (data.name.includes("reward")) {
                        data_lotto_config.reward = data.value;
                    }
                }
            }
        }
        let min = 1;
        if (data.name.includes("lotto_limit")) {
            let idNum = data.name.match(r);
            idNum = idNum[0];
            if (lotto_limit.length == 0) {
                lotto_limit.push(idNum);
                data_lotto_limit.id = idNum;
                min = 1;
            } else {
                if (data.name.includes("max")) {
                    data_lotto_limit.max = data.value;
                    if (data_ins_limit.length == 0) {
                        min = 1;
                    } else {
                        min = parseInt(data_ins_limit[data_ins_limit.length - 1].max) + 1;
                    }
                    if (parseInt(data_lotto_limit.max) < min) {
                        data_lotto_limit.min = 1;
                    } else {
                        data_lotto_limit.min = min;
                    }
                }
                if (data.name.includes("reward")) {
                    data_lotto_limit.reward = data.value;
                }
                if (!lotto_limit.includes(idNum)) {
                    data_ins_limit.push(data_lotto_limit);
                    data_lotto_limit = {};
                    lotto_limit.push(idNum);
                    data_lotto_limit.id = idNum;
                }
            }
        }
    }
    data_ins_config.push(data_lotto_config);
    data_ins_limit.push(data_lotto_limit);

    for (let i = 0; i < data_ins_config.length; i++) {
        let data = {
            id: data_ins_config[i].id,
            play_min: data_ins_config[i].play_min,
            play_max: data_ins_config[i].play_max,
            reward: data_ins_config[i].reward,
        };
        // let ii = await queryMember.queryLottoConfigCustomYeeKeeById(data_ins_config[i].id);
        // data.lotto_reward_type = ii.result[0].lotto_reward_type
        // data.lotto_type = data_lotto_type.id
        // console.log(data)
        const sss = await queryMember.updateLottoConfigAll(data);
        // console.log(sss.result);
    }
    let irr = [];
    // let ddd = await queryMember.queryLottoRewardGroupWhere(reward_group_id);
    // let reward_group = ddd.result.map((ss) => { return ss.id });

    for (let i = 0; i < data_ins_limit.length; i++) {
        let data = {
            id: data_ins_limit[i].id,
            reward: data_ins_limit[i].reward,
            max: data_ins_limit[i].max,
            min: data_ins_limit[i].min,
            lotto_reward_type: data_ins_limit[i].lotto_reward_type,
            index: data_ins_limit[i].index,
        };
        await queryMember.updateLottoConfigLimit(data);
        irr.push(data);
    }

    // try {
    //     /**================= Start Api LottoHouse ================ */
    //     const resAdmin = await queryMember.getAdminByMappingApi('auth_lottohouse')
    //     if (!resAdmin.status) { throw new Error() }
    //     const { username, password } = resAdmin.result[0]
    //     const objLottoHoust = new lottoHouse(username, password)
    //         /**================= End Api LottoHouse ================ */
    //     const data = await objLottoHoust.updateLottoSetting(req.body)
    //     if (data.status) {
    responeData.statusCode = httpStatusCodes.Success.ok.code;
    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
    responeData.status = httpStatusCodes.Success.success.description;
    //     } else {
    //         responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //         responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    //     }

    // } catch (e) {
    //     console.log(e);
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    // }
    res.send(responeData);
};

module.exports.ApiUpdateLottoSettingYeeKee = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    let lotto_type = [];
    let lotto_config = [];
    let lotto_limit = [];
    let r = /\d+/;
    let data_lotto_type = {};
    let data_lotto_config = {};
    let data_lotto_limit = {};
    let data_ins_config = [];
    let data_ins_limit = [];
    let reward_group_id = 2;
    for (let i = 0; i < req.body.length; i++) {
        let data = req.body[i];
        if (data.name.includes("reward_group_id")) {
            reward_group_id = data.value;
        }
        if (data.name.includes("lotto_type")) {
            if (data.name.includes("id")) {
                data_lotto_type.id = data.value;
            }
            if (data.name.includes("lotto_name")) {
                data_lotto_type.lotto_name = data.value;
            }
            if (data.name.includes("lotto_date_open")) {
                data_lotto_type.lotto_date_open = data.value;
            }
            if (data.name.includes("lotto_date")) {
                data_lotto_type.lotto_date = data.value;
            }
            if (data.name.includes("profit_min")) {
                data_lotto_type.profit_min = data.value;
            }
            if (data.name.includes("profit_max")) {
                data_lotto_type.profit_max = data.value;
            }
        }

        if (data.name.includes("lotto_config")) {
            let idNum = data.name.match(r);
            idNum = idNum[0];
            if (lotto_config.length == 0) {
                lotto_config.push(idNum);
                data_lotto_config.id = idNum;
            } else {
                if (!lotto_config.includes(idNum)) {
                    data_ins_config.push(data_lotto_config);
                    data_lotto_config = {};
                    lotto_config.push(idNum);
                    data_lotto_config.id = idNum;
                } else {
                    if (data.name.includes("use_flag")) {
                        data_lotto_config.use_flag = data.value;
                    }
                    if (data.name.includes("play_min")) {
                        data_lotto_config.play_min = data.value;
                    }
                    if (data.name.includes("play_max")) {
                        data_lotto_config.play_max = data.value;
                    }
                    if (data.name.includes("reward")) {
                        data_lotto_config.reward = data.value;
                    }
                }
            }
        }
        let min = 1;
        if (data.name.includes("lotto_limit")) {
            let idNum = data.name.match(r);
            idNum = idNum[0];
            if (lotto_limit.length == 0) {
                lotto_limit.push(idNum);
                data_lotto_limit.id = idNum;
                min = 1;
            } else {
                if (data.name.includes("max")) {
                    data_lotto_limit.max = data.value;
                    if (data_ins_limit.length != 0) {
                        min = parseInt(data_ins_limit[data_ins_limit.length - 1].max) + 1;
                    }

                    data_lotto_limit.min = min;
                }
                if (data.name.includes("reward")) {
                    data_lotto_limit.reward = data.value;
                }
                if (data.name.includes("lotto_reward_type")) {
                    data_lotto_limit.lotto_reward_type = data.value;
                }
                if (data.name.includes("index")) {
                    data_lotto_limit.index = data.value;
                }
                if (!lotto_limit.includes(idNum)) {
                    data_ins_limit.push(data_lotto_limit);
                    data_lotto_limit = {};
                    lotto_limit.push(idNum);
                    data_lotto_limit.id = idNum;
                }
            }
        }
    }
    data_ins_config.push(data_lotto_config);
    data_ins_limit.push(data_lotto_limit);
    for (let i = 0; i < data_ins_config.length; i++) {
        let data = {
            id: data_ins_config[i].id,
            play_min: data_ins_config[i].play_min,
            play_max: data_ins_config[i].play_max,
            reward: data_ins_config[i].reward,
        };
        let ii = await queryMember.queryLottoConfigCustomYeeKeeById(
            data_ins_config[i].id
        );
        data.lotto_reward_type = ii.result[0].lotto_reward_type;
        await queryMember.updateLottoConfig(data);
    }

    let irr = [];
    let ddd = await queryMember.queryLottoRewardGroupWhere(reward_group_id);
    let reward_group = ddd.result.map((ss) => {
        return ss.id;
    });

    for (let i = 0; i < data_ins_limit.length; i++) {
        let data = {
            id: data_ins_limit[i].id,
            reward: data_ins_limit[i].reward,
            max: data_ins_limit[i].max,
            min: data_ins_limit[i].min,
            lotto_reward_type: data_ins_limit[i].lotto_reward_type,
            index: data_ins_limit[i].index,
        };
        await queryMember.updateLottoConfigLimit(data);
        irr.push(data);
    }

    for (let index = 48; index <= 135; index++) {
        for (const gg of reward_group) {
            let resdata = {
                lotto_reward_type: gg,
                lotto_type: index,
            };
            let log_lotto_reward_type =
                await queryMember.queryLottoRewardConfigLimitYeeKee(resdata);

            for (
                let index2 = 0; index2 < log_lotto_reward_type.result.length; index2++
            ) {
                for (const rr of irr) {
                    if (
                        log_lotto_reward_type.result[index2].lotto_reward_type ==
                        rr.lotto_reward_type &&
                        index2 == rr.index
                    ) {
                        let dataa = {
                            id: log_lotto_reward_type.result[index2].id,
                            reward: rr.reward,
                            max: rr.max,
                            min: rr.min,
                        };
                        await queryMember.updateLottoConfigLimit(dataa);
                    }
                }
            }
        }
    }

    await queryMember.updateLottoTypeYeekee(data_lotto_type);

    responeData.statusCode = httpStatusCodes.Success.success.code;
    responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
    responeData.status = httpStatusCodes.Success.success.description;
    res.send(responeData);
};

module.exports.ApiReportLottoSettingSts = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        const update = await queryMember.lottoUpdateSts(req);

        if (update.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportLottoSettingManage = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoSettingManage(req.body);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportLottoSettingManageYeeKee = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await queryMember.queryLottoTypeCustom(req.body);
        const lotto_config = await queryMember.queryLottoConfigCustomYeeKee(
            req.body
        );
        const reward_group = await queryMember.queryLottoRewardGroupWhere(
            data.result[0].reward_group_id
        );
        let items = [];
        for (const rr of lotto_config.result) {
            let item = await queryMember.queryLottoRewardTypeWhere(
                rr.lotto_reward_type
            );
            rr.lotto_reward_type = item.result[0];
            items.push(rr);
        }
        let items2 = [];
        for (const rr of reward_group.result) {
            let item = await queryMember.queryLottoRewardConfigCustomYeeKee(rr.id);
            let dd = {
                lotto_reward_type: rr,
                lotto_config_limit: item.result,
            };
            items2.push(dd);
        }

        data.result = {
            lotto_type: data.result[0],
            lotto_config: items,
            lotto_config_limit: items2,
        };
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiCreditLotto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoSetting(req.body);

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }

    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.checkAddCreditLotto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        const { member: memberUsername, amount } = req.body;
        const resMember = await queryMember.findMemberByUser(
            memberUsername,
            "lottohouse"
        );
        const resWallet = await wallet.createWalletTrasaction(
            resMember.result[0].id,
            "deposit",
            "0",
            "",
            amount,
            1
        );

        if (resWallet) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.description = "add credit success";
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.description = "add credit faild";
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "add credit faild";
    }
    res.send(responeData);
};

module.exports.ApiReportLottoAlliance = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoAlliance(req.body);

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiReportLottoAllianceSettingBonus = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoAllianceSettingBonus(req.body);

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateLottoAllianceSettingBonus = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.updateLottoAllianceSettingBonus(req.body);

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

// End Front End API

//TrueWallet
module.exports.getOTPTruewallet = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    const accDeposit = await queryMember.accountDeposit("truewallet");
    let phone = accDeposit.result[0].accnum;
    let pass = accDeposit.result[0].username;
    let pin = accDeposit.result[0].password;
    const trueWalletObj = new truewallet(phone, pass, pin);
    const data = {
        phone: phone,
        pass: pass,
        pin: pin,
    };
    const resTrans = await trueWalletObj.RequestLoginOTP(data);
    if (resTrans.code != "400") {
        responeData.ref = resTrans.data.otp_reference;
        responeData.status = true;
    } else {
        responeData.status = false;
    }
    res.send({ result: responeData });
};

module.exports.subMitOTPTrueWallet = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    const accDeposit = await queryMember.accountDeposit("truewallet");
    let phone = accDeposit.result[0].accnum;
    let pass = accDeposit.result[0].username;
    let pin = accDeposit.result[0].password;
    const trueWalletObj = new truewallet(phone, pass, pin);
    const data = {
        phone: phone,
        pass: pass,
        pin: pin,
        otp: req.body.otp,
        ref: req.body.ref,
    };
    const resTrans = await trueWalletObj.SubmitOTP(data);
    if (resTrans.data != null) {
        responeData.data = resTrans.data;
        responeData.status = true;
    } else {
        responeData.status = false;
    }
    res.send({ result: responeData });
};

module.exports.TrueWalletWebhook = async (req, res) => {
    const message = req.body.message;
    if (!message) return res.send(400);

    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    let data = {
        type: "truewallet",
    };
    const accDeposit = await queryMember.accountTrueWalletType(data);
    if (accDeposit.result.length > 0) {
        let token = accDeposit.result[0].token;

        // ตรวจสอบข้อมูลtruewallet
        jwt.verify(message, token, async (err, decoded) => {
            if (err || !decoded) {
                console.log('TOKEN TRUEWALLET ไม่ถูกต้อง', new Date().toLocaleString('sv-SE'))
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.data = "Invalid Secret!";

                return res.send(responeData);
            }

            // เครดิตที่ได้รับ
            let amount = (decoded.amount / 100).toFixed(2)

            // ค้นหายูสจากเบอร์
            let dataMember = {
                username: decoded.sender_mobile,
                accnum: decoded.sender_mobile
            }
            let checkMember = await queryTrueWallet.MemberTrueWallet2(dataMember);
            if (checkMember.result.length == 1) {
                let username = checkMember.result[0].username;
                let memberId = checkMember.result[0].id;
                let data = await queryMember.getBalanceWallet(memberId); // ตรวจสอบเครดิต
                let total = parseFloat(data.result[0].balance) + parseFloat(amount)
                console.log(parseFloat(data.result[0].balance), parseFloat(amount))
                console.log(total)

                const dataWallet = {
                    memberId: memberId,
                    amount: amount,
                    balance: total,
                    walletType: 'deposit',
                    refTable: 'transaction',
                    refId: 0,
                    createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    sts: '1'
                }
                let walletRes = await queryMember.createWallet(dataWallet); // เพิ่มประวัติเติมเครดิต
                let LastWalletID = walletRes.result.insertId;

                const dataTrans = {
                    username: username,
                    type: "1",
                    amount: amount,
                    transaction_date: new Date(decoded.received_time).toLocaleString('sv-SE'),
                    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    stats: 0,
                    pro_id: 0,
                    date_new: dayjs().format("YYYY-MM-DD"),
                    response_api: JSON.stringify(decoded),
                    admin: 'Auto',
                    update_by: ''
                };
                let insTransactionWithdraw = await queryMember.createTransWithTrueWallet(dataTrans); // เพิ่มประวัติทรูวอลเล็ต
                let LastTransactionID = insTransactionWithdraw.result.insertId;

                let dataUpdate = {
                    LastWaleltID: LastWalletID,
                    LastPromotionID: LastTransactionID
                };
                await queryMember.updateRefWalletByMe(dataUpdate); // เติมเครดิต
                console.log(
                    `auto deposit amount:${amount} dateTime:${formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format())} remark: TWL ${decoded.sender_mobile} || Success`
                )

                responeData.data = `remark: TWL ${decoded.sender_mobile} (${amount})`;
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;

            } else {
                const dataTrans = {
                    username: '',
                    type: "1",
                    amount: amount,
                    transaction_date: new Date(decoded.received_time).toLocaleString('sv-SE'),
                    created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                    stats: 1,
                    pro_id: 0,
                    date_new: dayjs().format("YYYY-MM-DD"),
                    response_api: JSON.stringify(decoded), // ข้อมูลจาก True Webhook
                    admin: 'Auto',
                    update_by: ''
                };
                console.log('ไม่พบผู้ใช้หรือข้อมูลผู้ใช้มากกว่า 1, TWL WebHook กำลังพักยอดไว้ จำนวนเงิน ' + amount);
                await queryMember.createTransWithTrueWallet(dataTrans);

                responeData.data = `remark: TWL รอแอดมินตรวจสอบ (${amount})`;
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            }
        })

    } else {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.data = "ไม่เปิดระบบการรับฝากเงินผ่าน TWL";
    }

    res.send(responeData);
};

module.exports.TrueWalletAPI = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    let data = {
        type: "truewallet",
        phone: req.body.phone,
    };
    const accDeposit = await queryMember.accountTrueWallet(data);
    if (accDeposit.result.length > 0) {
        let phone = accDeposit.result[0].accnum;
        let pass = accDeposit.result[0].username;
        let pin = accDeposit.result[0].password;
        let token = accDeposit.result[0].token;
        const trueWalletObj = new truewallet(phone, pass, pin);
        let type = req.body.type;
        if (type == "register") {
            const data = {
                phone: phone,
                pin: pin,
                pass: pass,
                ref: req.body.ref,
                otp: req.body.otp,
            };
            const resTrans = await trueWalletObj.SubmitOTP(data);
            responeData.data = resTrans;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            if (resTrans.code == "MAS-200") {
                let data = {
                    otp: JSON.stringify(resTrans.data),
                    accnum: phone,
                };
                await queryMember.updateOTPTruewalletDeposit(data);
                await queryMember.updateOTPTruewalletWithdraw(data);
            }
        } else if (type == "otp") {
            const data = {
                phone: phone,
                pin: pin,
                pass: pass,
            };
            const resTrans = await trueWalletObj.RequestLoginOTP(data);
            responeData.data = resTrans;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else if (
            type == "Profile" ||
            type == "Balance" ||
            type == "Transaction"
        ) {
            const data = {
                phone: phone,
                pin: pin,
                pass: pass,
                type: type,
                token: token
            };
            const resTrans = await trueWalletObj.ApiTruewallet(data);
            responeData.data = resTrans;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else if (type == "checkname") {
            const data = {
                phone: phone,
                pin: pin,
                pass: pass,
                ref: req.body.ref,
                type: "Cp2p",
            };
            const resTrans = await trueWalletObj.ApiCheckName(data);
            responeData.data = resTrans;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else if (type == "transfer") {
            const data = {
                phone: phone,
                pin: pin,
                pass: pass,
                ref: req.body.ref,
                amount: req.body.amount,
                type: "P2p",
                token: token
            };
            const resTrans = await trueWalletObj.ApiTransfer(data);
            responeData.data = resTrans;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        }
    } else {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.data = "ไม่มีเบอร์นี้ในระบบ";
    }

    res.send(responeData);
};

module.exports.checkBank = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        try {
            const { bank_name, bank_number } = req.body
            let code = await queryMember.queryBankWhere(bank_name)

            if (code.result.code) {
                const accDeposit = await queryMember.accountDeposit("scb");
                const {
                    username: deviceId,
                    password: pin,
                    accnum: accountNo,
                } = accDeposit.result[0];
                const scbObj = new scb(deviceId, pin);
                let dataWithdraw = {
                    accnum: accountNo,
                    accountTo: bank_number,
                    accountToBankCode: code.result.code,
                    amount: 0.1
                };
                const resTrans = await scbObj.verify(dataWithdraw);
                if (resTrans && resTrans.accountToName) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.name = resTrans.accountToName;
                    responeData.status = 200;

                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.msg = "No body"
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg = "No 11111"
            }
        } catch (error) {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.msg = "No body"
        }
        res.send(responeData);
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.BankVerify = async (req, res) => {
    let responeData = {};
    res.setHeader('Content-Type', 'application/json');
    try {
        // let auth = await checkAuth(req.headers.authorization);
        // const { token, tobank, bankcode, amount } = req.body
        const { bank_name, bank_number, token } = req.body
        let code = await queryMember.queryBankWhere(bank_name)
        if (token == 'newscb') {
            const settings = await queryMember.querySettingLine();
            var config = {
                method: "post",
                url: `${settings.result[0].cron_internal}/bankverify`,
                // url: `http://localhost:5002/bankverify`,
                timeout: 20000,
                data: {
                    mode_cron: "newcron",
                    tobank: bank_number,
                    bankcode: code.result.code
                },
            };
            const { data } = await axios(config);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.data
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.msg = 0;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText = httpStatusCodes.ClientErrors.unauthorized.codeText
            responeData.description = 'No Token';
        }
    } catch (e) {
        console.log("🚀 ~ file: backend.controller.js:2776 ~ module.exports.BankVerify= ~ e:", e)
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
}

module.exports.ApicheckBalanceBank = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            if (req.body.bank == "scb") {
                if (req.body.type == 0) {
                    let data = await queryMember.queryCheckBankDepositByID(req);
                    if (data.status && data.result.length > 0) {
                        responeData.accnum = data.result[0].accnum;
                        responeData.name = data.result[0].name;
                    }
                } else {
                    let data = await queryMember.queryCheckBankWithdrawByID(req);
                    if (data.status && data.result.length > 0) {
                        responeData.accnum = data.result[0].accnum;
                        responeData.name = data.result[0].name;
                    }
                }
                let result = await checkBalanceWithID(req.body.type, req.body.id);
                if (result.status != 400) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.credit = result;
                    responeData.status = true;
                    res.send(responeData);
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.description = result;
                    responeData.status = false;
                    res.send(responeData);
                }
            } else {
                let data;
                if (req.body.type == 0) {
                    data = await queryMember.queryCheckBankDepositByID(req);
                    if (data.status && data.result.length > 0) {
                        responeData.accnum = data.result[0].accnum;
                        responeData.name = data.result[0].name;
                    }
                } else {
                    data = await queryMember.queryCheckBankWithdrawByID(req);
                    if (data.status && data.result.length > 0) {
                        responeData.accnum = data.result[0].accnum;
                        responeData.name = data.result[0].name;
                        responeData.token = data.result[0].token;
                    }
                }

                let phone = data.result[0].accnum;
                let pass = data.result[0].username;
                let pin = data.result[0].password;
                let token = data.result[0].token
                const trueWalletObj = new truewallet(phone, pass, pin);
                const dataTruewallet = {
                    phone: phone,
                    pin: pin,
                    pass: pass,
                    type: "Balance",
                    token: token
                };
                const resTrans = await trueWalletObj.ApiTruewallet(dataTruewallet);
                responeData.data = resTrans;
                if (resTrans.data) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.credit = resTrans.data.current_balance;
                    responeData.status = true;
                    res.send(responeData);
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.description = result;
                    responeData.status = false;
                    res.send(responeData);
                }
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiQuerySettingTruewallet = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.querySettingTruewallet();
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateSettingTruewallet = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.updateSettingTruewallet(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};


module.exports.ApiExchangeTransfer = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataSend = {
                amount: req.body.amount,
                type: req.body.type,
                deposit: req.body.deposit,
                withdraw: req.body.withdraw,
            };
            let result = await withdrawExchange(dataSend);
            if (result.status != 400) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.credit = result;
                responeData.status = true;
                res.send(responeData);
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = result;
                responeData.status = false;
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

async function withdrawExchange(data) {
    /**======================api scb============================ */
    let accDeposit;
    let dataDepositBank;
    let dataWithdrawBank;
    let deposit_id = data.deposit;
    let withdraw_id = data.withdraw;
    if (data.type == 0) {
        accDeposit = await queryMember.accDepositByID(deposit_id);
        dataWithdrawBank = await queryMember.accWithdrawByID(withdraw_id);
        dataWithdrawBank = dataWithdrawBank.result[0].accnum;
    } else {
        accDeposit = await queryMember.accWithdrawByID(withdraw_id);
        dataDepositBank = await queryMember.accDepositByID(deposit_id);
        dataWithdrawBank = dataDepositBank.result[0].accnum;
    }

    // if (accDeposit ? .result.length !== 1) return false;
    if (accDeposit.result.length !== 1) return false;
    const {
        username: deviceId,
        password: pin,
        accnum: accountNo,
    } = accDeposit.result[0];
    const scbObj = new scb(deviceId, pin);
    let dataWithdraw = {
        accnum: accountNo,
        accountTo: dataWithdrawBank,
        accountToBankCode: "014",
        amount: data.amount,
    };

    const resTrans = await scbObj.verify(dataWithdraw);
    if (resTrans) {
        let dataTransfer = {
            amount: data.amount,
            totalFee: resTrans.totalFee,
            scbFee: resTrans.scbFee,
            botFee: resTrans.botFee,
            channelFee: resTrans.channelFee,
            accountFromName: resTrans.accountFromName,
            accountTo: resTrans.accountTo,
            accountToName: resTrans.accountToName,
            accountToType: resTrans.accountToType,
            accountToDisplayName: resTrans.accountToDisplayName,
            accountToBankCode: resTrans.accountToBankCode,
            pccTraceNo: resTrans.pccTraceNo,
            transferType: resTrans.transferType,
            feeType: resTrans.feeType,
            terminalNo: resTrans.terminalNo,
            sequence: resTrans.sequence,
            transactionToken: resTrans.transactionToken,
            bankRouting: resTrans.bankRouting,
            fastpayFlag: resTrans.fastpayFlag,
            ctReference: resTrans.ctReference,
        };
        const resWithdraw = await scbObj.withdrawTransfer(dataTransfer);
        return resWithdraw;
    } else {
        return false;
    }
}
//Truewallet

module.exports.ApiUpdateGameWebStatus = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let dataUpdate = {};
        dataUpdate.type = "ufa";
        dataUpdate.sts = req.body.ufa;
        await queryMember.updateSettingGameWeb(dataUpdate);

        dataUpdate.type = "lotto";
        dataUpdate.sts = req.body.lotto;
        await queryMember.updateSettingGameWeb(dataUpdate);

        dataUpdate.type = "autotransfer";
        dataUpdate.sts = req.body.autotransfer;
        await queryMember.updateSettingGameWeb(dataUpdate);

        responeData.statusCode = httpStatusCodes.Success.ok.code;
        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.handleAuth = async (req, res, next) => {
    let auth = await checkAuth(req.headers.authorization);
    if (auth.status) {
        next();
    } else {
        let responeData = {};
        responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
        responeData.statusCodeText =
            httpStatusCodes.ClientErrors.unauthorized.codeText;
        responeData.description = auth.msg;
        return res.send(responeData);
    }
};

module.exports.getDataMemberPartnerType = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberPartnerType();
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoType = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.reportLottoSetting(req.body);

        if (data.status) {
            let lottotype = [];
            for (let i = 0; i < data.result.length; i++) {
                for (let j = 0; j < data.result[i].lotto_detail.length; j++) {
                    lottotype.push({
                        id: data.result[i].lotto_detail[j].id,
                        lottoType: data.result[i].lotto_detail[j].lotto_name,
                        lottoGroup: data.result[i].lotto_detail[j].lotto_group_id,
                    });
                }
            }
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lottotype;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoType = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lotto_type = await queryMember.queryLottoType();
        if (lotto_type.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lotto_type.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoDate = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lotto_date = await queryMember.queryLottoDate(req);
        if (lotto_date.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lotto_date.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetDetailLotto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lotto_deprive = await queryMember.queryLottoDeprive(req);
        if (lotto_deprive.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lotto_deprive.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetRewardLotto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lottoReward = await queryMember.queryLottoReward(req);
        if (lottoReward.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lottoReward.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiCreateLottoLimit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let list_number = req.body.number;
        let data = "";
        for (let i = 0; i < list_number.length; i++) {
            let dataIns = {
                number: list_number[i].number,
                lotto_type: req.body.lotto_type,
                id: list_number[i].id,
                reward: req.body.reward,
                lotto_date: req.body.lotto_date,
            };
            data = await queryMember.insertLottoDeprive(dataIns);
        }

        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.data;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateLottoLimit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        const resAdmin = await queryMember.getAdminByMappingApi("auth_lottohouse");
        if (!resAdmin.status) {
            throw new Error();
        }
        const { username, password } = resAdmin.result[0];
        const objLottoHoust = new lottoHouse(username, password);
        /**================= End Api LottoHouse ================ */
        const data = await objLottoHoust.updateLottoDeprive(req.body);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.data;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiDeleteLottoLimit = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        /**================= Start Api LottoHouse ================ */
        // const resAdmin = await queryMember.getAdminByMappingApi('auth_lottohouse')
        // if (!resAdmin.status) { throw new Error() }
        // const { username, password } = resAdmin.result[0]
        // const objLottoHoust = new lottoHouse(username, password)
        /**================= End Api LottoHouse ================ */
        // const data = await objLottoHoust.updateLottoDeprive(req.body);
        const data = await queryMember.deleteLottoDeprive(req.body);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiMemberLoginLotto = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryMemberLottoByID(req);
        if (data.result.length > 0) {
            let username = data.result[0].username;
            let password = data.result[0].password;
            const objLottoHoust = new lottoHouse(username, password);
            let token = await objLottoHoust.memberLogin(username, password);
            responeData.token = token;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiConvertMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryConvertMember(req);

        if (data.result.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiConvertMemberPartner = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryConvertMemberPartner(req);
        if (data.result.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.dataAffCasino = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryAffCasino(req);
        if (data.result.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.setAffCasino = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.setAffCasino(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiMenubar = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // try {
    let auth = await checkAuth(req.headers.authorization);
    if (auth.status) {
        let token = await parseJwt(auth.txt);
        let id = token.id;
        req.body.id = id;
        let dataAdmin = await queryMember.queryAllStaffByID(req);
        dataAdmin = dataAdmin.result[0];

        let SettingGame = await queryMember.querySettingGame(req);
        SettingGame = SettingGame.result;
        if (dataAdmin.stats < 99) {
            let GameSetting = {
                ufa: SettingGame[0].sts,
                lotto: SettingGame[1].sts,
                adminID: id,
            };
            let menuLv1 = await queryMember.queryMenuSTAFFLv1(GameSetting);
            responeData.data = menuLv1.result;
            menuLv1 = menuLv1.result;
            for (let i = 0; i < menuLv1.length; i++) {
                GameSetting.parent_lv1 = menuLv1[i].menu_id;
                let parent_lv1 = await queryMember.queryMenuStaffParent_lv1(
                    GameSetting
                );

                if (parent_lv1.result.length > 0) {
                    responeData.data[i].parent_lv1 = parent_lv1.result;
                }
            }
        } else {
            let GameSetting = {
                ufa: SettingGame[0].sts,
                lotto: SettingGame[1].sts,
            };
            let menuLv1 = await queryMember.queryMenuLv1(GameSetting);
            responeData.data = menuLv1.result;
            menuLv1 = menuLv1.result;
            for (let i = 0; i < menuLv1.length; i++) {
                GameSetting.parent_lv1 = menuLv1[i].id;
                let parent_lv1 = await queryMember.queryMenuParent_lv1(GameSetting);
                if (parent_lv1.result.length > 0) {
                    responeData.data[i].parent_lv1 = parent_lv1.result;
                    for (let j = 0; j < parent_lv1.result.length; j++) {
                        responeData.data[i].parent_lv1[j].menu_edit = 1;
                    }
                }
                responeData.data[i].menu_edit = 1;
            }
        }
        responeData.statusCode = httpStatusCodes.Success.ok.code;
        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
    } else {
        responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
        responeData.statusCodeText =
            httpStatusCodes.ClientErrors.unauthorized.codeText;
        responeData.description = auth.msg;
    }
    // } catch (e) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    // }
    res.send(responeData);
};

module.exports.ApiMenubarStaff = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // try {
    let auth = await checkAuth(req.headers.authorization);
    if (auth.status) {
        let token = await parseJwt(auth.txt);
        let SettingGame = await queryMember.querySettingGame(req);
        SettingGame = SettingGame.result;
        let GameSetting = {
            ufa: SettingGame[0].sts,
            lotto: SettingGame[1].sts,
        };

        let menuLv1 = await queryMember.queryMenuLv1(GameSetting);
        responeData.data = menuLv1.result;
        menuLv1 = menuLv1.result;
        responeData.data = menuLv1;
        for (let i = 0; i < menuLv1.length; i++) {
            GameSetting.parent_lv1 = menuLv1[i].id;
            let parent_lv1 = await queryMember.queryMenuParent_lv1(GameSetting);
            if (parent_lv1.result.length > 0) {
                responeData.data[i].parent_lv1 = parent_lv1.result;
            }
        }
        let lastid = await queryMember.queryLastIDMenu();
        let arr = [];
        for (let i = 0; i < lastid.result.length; i++) {
            arr.push(lastid.result[i].id);
        }
        responeData.arrID = arr;
        responeData.lastid = lastid.result[lastid.result.length - 1].id;
        responeData.statusCode = httpStatusCodes.Success.ok.code;
        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
    } else {
        responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
        responeData.statusCodeText =
            httpStatusCodes.ClientErrors.unauthorized.codeText;
        responeData.description = auth.msg;
    }
    // } catch (e) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    // }
    res.send(responeData);
};

module.exports.ApiBoardAnnounce = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let result = await checkboard();
            responeData = result;

            let registerMember = await queryMember.queryLastRegister();
            responeData.registerMember = registerMember.result;

            let deposit = await queryMember.queryLastDeposit();
            responeData.deposit = deposit.result;

            let withdraw = await queryMember.queryLastWithdraw();
            responeData.withdraw = withdraw.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetTransactionMember = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let start = new Date(req.body.startDate);
        let end = new Date(req.body.endDate);
        start.setHours(0);
        start.setMinutes(0);
        start.setSeconds(0);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        req.body.startDate = formatDate1(start) + " " + formatTime(start);
        req.body.endDate = formatDate1(end) + " " + formatTime(end);
        let data = await queryMember.queryGetTransactionMember(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

// ###################################################################
module.exports.ApiTestQueryLottoType = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.queryLottoType(req);
        if (data.result.length > 0) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = data.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
// ###################################################################
// ###################################################################

module.exports.ApiqueryTransactionAll = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        let infomode = req.body.infomode ? req.body.infomode : false;
        if (auth.status || infomode) {
            let statusSettings = req.body.state ? req.body.state : false;
            let ifUser = req.body.user ? req.body.user : false;
            let ifMode = req.body.mode ? req.body.mode : false;

            let max_date = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD');

            if (moment(req.body.startDate).format('YYYY-MM-DD') < max_date) {
                req.body.startDate = max_date;
            }

            if (moment(req.body.endDate).format('YYYY-MM-DD') < max_date) {
                req.body.endDate = max_date;
            }
            if (infomode || ifMode) {
                req.body.startDate = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
                req.body.endDate = moment().endOf('week').format('YYYY-MM-DD');
                req.body.mode = true
            }

            let dataTransaction = await queryMember.queryTxz(req);
            let data = dataTransaction;
            if (statusSettings || infomode) {

                if (data.length > 0) {
                    // data.sort(function(a, b) {
                    //     return b.date - a.date;
                    // });
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.data = data;
                } else {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.data = [];
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiqueryTransactionAllCli = async (req, res) => {
    try {
        let randdd = getRandomInt(90)
        console.log("🚀 ~ wait to run:", randdd, `sec`)
        await delay(randdd);
        // filterr date
        let req = {
            body: {

                startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                endDate: moment().add(1, 'days').format('YYYY-MM-DD')
            }
        }

        let dataTransaction = await queryMember.queryTransactionAllNocache(req);

        let dataGame = await queryMember.queryTransactionGameNocache(req);
        let dataLotto = await queryMember.queryTransactionLottoNocache(req);
        // let dataUsers = await queryMember.queryMemberAllCustom(req);
        let data = [];


        for (const rr of dataTransaction) {
            //check type transecrion
            if (rr.type === "1") {
                rr.type = "ฝาก";
            } else if (rr.type === "2") {
                rr.type = "ปรับยอด";
            } else {
                rr.type = "ถอน";
            }
            // 0:สำเร็จ,1:กำลังรอ,2:ยกเลิก,3:ออโต้ถอน
            if (rr.state === "1") {
                rr.state = "กำลังรอ";
            } else if (rr.state === "2") {
                rr.state = "ยกเลิก";
            } else if (rr.state === "3") {
                rr.state = "ออโต้ถอน";
            } else {
                rr.state = "สำเร็จ";
            }
            let rrr = {
                txz: md5(`transection-${rr.member_username}-${rr.amount}-${moment(rr.created_at).format("YYYY-MM-DD HH:mm:ss")}`),
                user: rr.member_username,
                type: rr.type,
                amount: rr.amount,
                date: moment(rr.created_at).format("YYYY-MM-DD HH:mm:ss"),
                state: rr.state,
                detail: rr.remark,
                wl: null,
                mode: "transection",
                find: rr.transaction_id,
            };
            data.push(rrr);
        }

        for (const rr of dataGame) {
            //check type transecrion
            if (rr.state === "won") {
                rr.state = "ชนะ";
            } else if (rr.state === "lost") {
                rr.state = "แพ้";
            } else {
                rr.state = "เสมอ";
            }
            let rrr = {
                txz: md5(`game-${rr.member_username}-${rr.bet}-${moment(rr.create_at).format("YYYY-MM-DD HH:mm:ss")}`),
                user: rr.member_username,
                type: "game",
                amount: rr.bet,
                date: moment(rr.create_at).format("YYYY-MM-DD HH:mm:ss"),
                state: rr.state,
                detail: rr.game,
                wl: rr.winloss,
                mode: "game",
                find: rr.refno,
            };
            data.push(rrr);
        }


        for (const rr of dataLotto) {
            //check type transecrion

            if (rr.winner_flg === "0") {
                rr.state = "ชนะ";
            } else {
                rr.state = "แพ้";
            }
            let username = rr.username.substr(7);
            let rrr = {
                txz: md5(`lotto-${username}-${rr.amount}-${rr.date_time_add}`),
                user: username ? username : null,
                type: "lotto",
                amount: rr.amount,
                date: rr.date_time_add,
                state: `${rr.lotto_name}`,
                detail: rr.lotto_name,
                wl: rr.winloss,
                mode: "lotto",
                find: rr.order_id,
            };
            data.push(rrr);
        }

        // let sorted = data.sort((a, b) => a.date.localeCompare(b.date))
        if (data.length > 0) {
            let datas = []
            for (const rrr of data) {
                datas.push([
                    rrr.txz,
                    rrr.user,
                    rrr.type,
                    rrr.amount,
                    rrr.date,
                    rrr.state,
                    rrr.detail,
                    rrr.wl,
                    rrr.mode,
                    rrr.find,
                ])
            }
            const res = await queryMember.insertTxz(datas)
            console.log("🚀 ~ file: backend.controller.js:10271 ~ data.sort ~ data:", res)
        }


    } catch (e) {
        console.log("🚀 ~ file: backend.controller.js:10355 ~ module.exports.ApiqueryTransactionAllCli=async ~ e:", e)
    }
};

module.exports.ApiQueryTransactionWithId = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataTransaction = await queryMember.queryTransactionWithId(
                req.body.transection
            );
            // let data = dataTransaction;
            if (dataTransaction) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = dataTransaction[0];
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryTransactionLottoWithId = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataTransaction = await queryMember.queryTransactionLottoWithId(
                req.body.orderId
            );
            let dataUsers = await queryMember.findMemberIdByUsername(req.body.user);
            let data = dataTransaction;
            // console.log(dataTransaction)
            if (data) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = data;
                responeData.user = dataUsers;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryTransactionGameWithId = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let dataTransaction = await queryMember.queryTransactionGameWithId(
                req.body.refno
            );
            // let data = dataTransaction;
            if (dataTransaction) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = dataTransaction[0];
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiTopRanking = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let date_start = new Date();
            let date_end = new Date();
            date_start.setHours(0);
            date_start.setMinutes(0);
            date_start.setSeconds(0);
            date_end.setHours(23);
            date_end.setMinutes(59);
            date_end.setSeconds(59);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            req.body.date_start =
                formatDate1(date_start) + " " + formatTime(date_start);
            req.body.date_end = formatDate1(date_end) + " " + formatTime(date_end);
            req.body.date = formatDate1(date_end);

            data = await queryMember.queryLastDepositToday(req);
            if (data.result.length > 0) {
                responeData.last_deposit_today = data.result;
            } else {
                responeData.last_deposit_today = [];
            }

            data = await queryMember.queryTopDepositToday(req);
            if (data.result.length > 0) {
                responeData.top_deposit_today = data.result;
            } else {
                responeData.top_deposit_today = [];
            }

            data = await queryMember.queryTopWithdrawToday(req);
            if (data.result.length > 0) {
                responeData.top_withdraw_today = data.result;
            } else {
                responeData.top_withdraw_today = [];
            }

            // GetSortOrderRe = มากไปน้อย
            // GetSortOrder = น้อยไปมาก
            req.body.startDate = formatDate1(new Date());
            req.body.endDate = formatDate1(new Date());
            let turnToday1 = await queryMember.queryHistoryWinlossUser(req);
            turnToday1.result.sort(GetSortOrder("winloss"));
            let turnGameWin = turnToday1.result;
            turnToday1.result.sort(GetSortOrder("winloss"));
            let turnGameLoss = turnToday1.result;
            let winGame = [];
            let lossGame = [];
            for (let i = 0; i < turnGameWin.length; i++) {
                if (turnGameWin[i].winloss >= 0) {
                    if (winGame.length < 10) {
                        winGame.push(turnGameWin[i]);
                    } else {
                        break;
                    }
                }
            }

            for (let i = 0; i < turnGameLoss.length; i++) {
                if (turnGameLoss[i].winloss < 0) {
                    if (lossGame.length < 10) {
                        lossGame.push(turnGameLoss[i]);
                    } else {
                        break;
                    }
                }
            }

            //
            let dataaaaa = {
                start_month: formatDate1(date_start),
                end_month: formatDate1(date_start),
            };
            let lottoWin = await queryMember.lottoWin(req);
            let lottoloss = await queryMember.lottoLoss(req);

            for (let i = 0; i < lottoWin.result.length; i++) {
                let win = await queryMember.lottoLossByID(
                    lottoWin.result[i].username,
                    dataaaaa
                );
                if (win.result[0].amount) {
                    lottoWin.result[i].amount =
                        lottoWin.result[i].amount - win.result[0].amount;
                }
            }

            for (let i = 0; i < lottoloss.result.length; i++) {
                let loss = await queryMember.lottoWinByID(
                    lottoloss.result[i].username,
                    dataaaaa
                );
                if (loss.result[0].amount) {
                    lottoloss.result[i].amount =
                        lottoloss.result[i].amount - loss.result[0].amount;
                }
            }
            lottoWin.result.sort(GetSortOrderRe("amount"));
            lottoloss.result.sort(GetSortOrder("amount"));

            let arrwin1 = [];
            for (let i = 0; i < lottoWin.result.length; i++) {
                if (i < 10) {
                    if (lottoWin.result[i].amount > 0) {
                        arrwin1.push(lottoWin.result[i]);
                    }
                }
            }
            lottoWin = arrwin1;
            let arrloss1 = [];
            for (let i = 0; i < lottoloss.result.length; i++) {
                if (i < 10) {
                    if (lottoloss.result[i].amount < 0) {
                        arrloss1.push(lottoloss.result[i]);
                    }
                }
            }
            lottoloss = arrloss1;

            responeData.lottoWin_today = lottoWin;
            responeData.lottoLoss_today = lottoloss;

            responeData.gameWin_today = winGame;
            responeData.gameLoss_today = lossGame;

            //

            // เดือน
            let start_month = formatDateBaseMonthLotto(new Date());
            let end_month = formatDateBaseMonthLotto(new Date());
            let dataDate = {
                start_month: start_month,
                end_month: end_month,
            };

            data = await queryMember.queryLastDepositMonth(dataDate);
            if (data.result.length > 0) {
                responeData.last_deposit_month = data.result;
            } else {
                responeData.last_deposit_month = [];
            }

            data = await queryMember.queryTopDepositMonth(dataDate);
            if (data.result.length > 0) {
                responeData.top_deposit_month = data.result;
            } else {
                responeData.top_deposit_month = [];
            }

            data = await queryMember.queryTopWithdrawMonth(dataDate);
            if (data.result.length > 0) {
                responeData.top_withdraw_month = data.result;
            } else {
                responeData.top_withdraw_month = [];
            }

            let date_start_month = new Date();
            date_start_month.setDate(1);
            req.body.startDate = formatDateBaseMonthLotto(date_start_month);
            req.body.endDate = formatDateBaseMonthLotto(new Date());
            let turnMonth = await queryMember.queryHistoryWinlossUser(req);
            let turnMonthGameWin = turnMonth.result;
            turnMonth.result.sort(GetSortOrder("winloss"));
            let turnMonthGameLoss = turnMonth.result;
            let winGameMonth = [];
            let lossGameMonth = [];
            for (let i = 0; i < turnMonthGameWin.length; i++) {
                if (turnMonthGameWin[i].winloss >= 0) {
                    // if (winGameMonth.length < 10) {
                    winGameMonth.push(turnMonthGameWin[i]);
                    winGameMonth.sort(GetSortOrderRe("winloss"));
                    // }else{
                    //     break;
                    // }
                }
            }
            for (let i = 0; i < turnMonthGameLoss.length; i++) {
                if (turnMonthGameLoss[i].winloss < 0) {
                    if (lossGameMonth.length < 10) {
                        lossGameMonth.push(turnMonthGameLoss[i]);
                    } else {
                        break;
                    }
                }
            }
            responeData.gameWin_Month = winGameMonth;
            responeData.gameLoss_Month = lossGameMonth;

            let lottoWinMonth = await queryMember.lottoWinMonth(dataDate);
            let lottolossMonth = await queryMember.lottoLossMonth(dataDate);

            for (let i = 0; i < lottoWinMonth.result.length; i++) {
                let win = await queryMember.lottoLossByID(
                    lottoWinMonth.result[i].username,
                    dataDate
                );
                if (win.result[0].amount) {
                    lottoWinMonth.result[i].amount =
                        lottoWinMonth.result[i].amount - win.result[0].amount;
                }
            }

            for (let i = 0; i < lottolossMonth.result.length; i++) {
                let loss = await queryMember.lottoWinByID(
                    lottolossMonth.result[i].username,
                    dataDate
                );
                if (loss.result[0].amount) {
                    lottolossMonth.result[i].amount =
                        lottolossMonth.result[i].amount - loss.result[0].amount;
                }
            }
            lottoWinMonth.result.sort(GetSortOrderRe("amount"));
            lottolossMonth.result.sort(GetSortOrderRe("amount"));

            let arrwin = [];
            if (lottoWinMonth.result.length > 0) {
                for (let i = 0; i < 10; i++) {
                    if (lottoWinMonth.result[i].amount > 0) {
                        arrwin.push(lottoWinMonth.result[i]);
                    }
                }
            }
            lottoWinMonth = arrwin;
            let arrloss = [];
            if (lottolossMonth.result.length > 0) {
                for (let i = 0; i < 10; i++) {
                    if (lottolossMonth.result[i].amount > 0) {
                        arrloss.push(lottolossMonth.result[i]);
                    }
                }
            }
            lottolossMonth = arrloss;

            responeData.lottoWin_month = lottoWinMonth;
            responeData.lottoLoss_month = lottolossMonth;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        console.log(e);
    }
    res.send(responeData);
};

function GetSortOrder(prop) {
    return function (a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    };
}

function GetSortOrderRe(prop) {
    return function (a, b) {
        if (a[prop] < b[prop]) {
            return 1;
        } else if (a[prop] > b[prop]) {
            return -1;
        }
        return 0;
    };
}

module.exports.ApiaddCreditTransaction = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let idMember = await queryMember.findMemberIdByUsername(
                req.body.username
            );
            idMember = idMember.result[0].id;
            req.body.id = idMember;
            let dataMember = await queryMember.queryMemberBankdetail(req);
            let username = dataMember.result[0].username;
            let memberId = req.body.id;
            let amountTrans = await queryMember.queryUnSuccessDepositByID(req);
            let amount = amountTrans.result[0].amount;
            let data = await queryMember.getBalanceWallet(memberId);
            req.body.username = username;
            if (data.status && data.result.length > 0) {
                let balance = parseFloat(data.result[0].balance);
                balance += parseFloat(amount);
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                const dataWallet = {
                    memberId: memberId,
                    amount: amount,
                    balance: balance,
                    walletType: "deposit",
                    refTable: "manual",
                    refId: 0,
                    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    sts: "1",
                };
                let walletRes = await queryMember.createWallet(dataWallet);
                let LastWalletID = walletRes.result.insertId;

                await queryMember.updateTransaction(req);

                let dataUpdate = {
                    LastWaleltID: LastWalletID,
                    LastPromotionID: req.body.trans_id,
                };
                await queryMember.updateRefWalletByMe(dataUpdate);

                let token = await parseJwt(auth.txt);
                req.body.username = token.username;
                req.body.detail =
                    "เติมเงินให้ " +
                    username +
                    " จำนวน " +
                    amount +
                    " บาท || By " +
                    req.body.username;
                req.body.date = formatDate(new Date()) + " " + formatTime(new Date());
                await queryMember.insertStaffHistory(req);
                responeData.username = username;
                res.send(responeData);
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                res.send(responeData);
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
            res.send(responeData);
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        res.send(responeData);
    }
};

module.exports.ApiqueryeBank = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = "";
            let withdraw = "";
            if (req.body.id == 1) {
                data = await queryMember.queryBankDepositTruewallet();
                withdraw = await queryMember.queryBankWithdrawTruewallet();
            } else {
                data = await queryMember.queryBankDepositNoTruewallet();
                withdraw = await queryMember.queryBankWithdrawNoTruewallet();
            }
            if (data.status && data.result.length > 0) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.deposit = data.result;
                responeData.withdraw = withdraw.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoTypeByGroup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lotto_type = await queryMember.queryLottoRewardTypeByGroup();
        if (lotto_type.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lotto_type.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoNumberDetail = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberLotto = await queryMember.queryMemberLottoByID2(req);
        memberLotto = memberLotto.result[0].username;
        let userIDLotto = await queryMember.GetLottoUser(memberLotto);
        userIDLotto = userIDLotto.result[0].id;
        req.body.userid = userIDLotto;
        let lotto_type = await queryMember.queryGetLottoNumberDetail(req);
        if (lotto_type.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lotto_type.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoNumberGroup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberLotto = await queryMember.queryMemberLottoByID2(req);
        let member_username = (memberLotto.result.length > 0) ? memberLotto.result[0].username : 0;
        let userIDLotto = await queryMember.GetLottoUser(member_username);
        let user_id = (userIDLotto.result.length > 0) ? userIDLotto.result[0].id : 0;
        if (user_id == 0 || member_username == 0) {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        } else {
            let lotto_type = await queryMember.queryGetLottoNumberGroup(user_id);
            if (lotto_type.result.length > 0 && lotto_type.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.data = lotto_type.result;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiAddLottoNumber = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let memberLotto = await queryMember.queryMemberLottoByID(req);
        memberLotto = memberLotto.result[0].username;
        let userIDLotto = await queryMember.GetLottoUser(memberLotto);
        userIDLotto = userIDLotto.result[0].id;
        let groupNumber = await queryMember.getLottoNumberGroup(userIDLotto);
        let count = 0;
        if (groupNumber.result.length > 0) {
            count = parseInt(groupNumber.result[0].group_number) + 1;
        } else {
            count = 1;
        }
        let dataLottoNumberGroup = {
            group_name: req.body.name,
            group_number: count,
            cr_date: formatDate1(new Date()) + " " + formatTime(new Date()),
            user_id: userIDLotto,
        };
        await queryMember.addLottoNumberGroup(dataLottoNumberGroup);
        let lotto_type = "";
        for (let i = 0; i < req.body.list.length; i++) {
            let dataIns = {
                group_number: count,
                numbers: req.body.list[i].number,
                lotto_reward_type_name: req.body.list[i].type,
                user_id: userIDLotto,
            };
            lotto_type = await queryMember.addLottoNumberGroupData(dataIns);
        }

        if (lotto_type.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.data = lotto_type.result;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        console.log(e);
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.autoTokenUfa = async () => {
    let res = await axios.get(
        `https://ufalogin.mskids.me/api/ufa/viewstate/digital.isme99.com`
    );
    console.log(`Update Token Ufa Success`);
    await queryMember.updateSettingGameAuto(res.data.data);
};

module.exports.ApiChangePass = async (req, res) => {
    let responeData = {};
    const body = req.body;
    res.setHeader('Content-Type', 'application/json');
    const salt = genSaltSync(10);
    body.newpass = hashSync(body.newpass, salt);

    const data = await queryMember.updatePasswordAdmin(body);
    if (data.status) {
        responeData.statusCode = httpStatusCodes.Success.ok.code;
        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        responeData.data = 'Change Password Success!';
    } else {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.data = 'Change Password Error! Try again.';
    }
    res.send(responeData);

}


// Coupon ZONE
module.exports.ApiQueryCoupon = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryCoupon(req);
            responeData.data = data.result;
            if (data.result.length > 0) {
                for (let i = 0; i < data.result.length; i++) {
                    let count = await queryMember.queryCountCoupon(data.result[i].id);
                    responeData.data[i].count = count.result.length;
                }
            }
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryGroupCoupon = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryGroupCoupon(req);
            responeData.data = data.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiQueryCouponLog = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.queryCouponLog(req);
            responeData.data = data.result;
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiaddCoupon = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            req.body.date = formatDate1(new Date()) + " 00:00:00";
            let token = await parseJwt(auth.txt);
            req.body.cr_by = token.username;
            if (req.body.type == 1) {
                let data = await queryMember.insertCoupon(req);
                if (data.status) {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.data = data.result;
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.description = "Insert Error";
                }
            } else {
                let ins = await queryMember.insertGroupCoupon(req);
                let refIns = ins.result.insertId;
                let coupon = req.body.coupon_code;
                for (let i = 0; i < coupon.length; i++) {
                    req.body.coupon_code = coupon[i];
                    req.body.group = refIns;
                    await queryMember.insertCoupon(req);
                }
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "Server Error";
    }
    res.send(responeData);
};

module.exports.ApiUpdateStatusCouponGroup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        await queryMember.updateStatusCouponGroup1(req);
        let data = await queryMember.updateStatusCouponGroup(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiUpdateStatusCoupon = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let data = await queryMember.updateStatusCoupon(req);
        if (data.status) {
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteCoupon = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let data = await queryMember.deleteCoupon(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

//FrontEnd

module.exports.ApiCoupon = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        // let auth = await checkAuth(req.headers.authorization);
        if ((req.body.path = "frontend")) {
            let coupon = req.body.code;
            let uid = req.body.id;
            let date = formatDate1(new Date()) + " 00:00:00";
            req.body.date = date;
            let dataCoupon = await queryMember.queryCheckDetailCoupon(req);
            // เช็คการเติมซ้ำ
            if (dataCoupon.result.length > 0 && dataCoupon.status) {
                let limit = dataCoupon.result[0].limit_receive;
                let bonus = parseInt(dataCoupon.result[0].coupon_bonus);
                let coupon_name = dataCoupon.result[0].coupon_name;
                let coupon_id = dataCoupon.result[0].id;
                let dataC = await queryMember.queryCheckEverCoupon(req);
                if (dataC.result.length <= 0) {
                    let dataEXP = await queryMember.queryCheckEXPCoupon(req);
                    if (dataEXP.result.length > 0) {
                        let dataCount = await queryMember.queryCheckAmountCoupon(req);
                        if (dataCount.result.length < limit) {
                            let memberId = uid;
                            let dataBalanceWallet = await queryMember.getBalanceWallet(
                                memberId
                            );
                            let balance = parseFloat(dataBalanceWallet.result[0].balance);
                            balance = balance + bonus;
                            let date = formatDate1(new Date()) + " " + formatTime(new Date());
                            let data_ins = {
                                amount: bonus,
                                coupon_id: coupon_id,
                                member_id: uid,
                                cr_date: date,
                            };
                            let ins = await queryMember.insertLogCoupon(data_ins);
                            let refIns = ins.result.insertId;
                            const dataWallet = {
                                memberId: memberId,
                                amount: bonus,
                                balance: balance,
                                walletType: "bonus",
                                refTable: "coupon_vouncher",
                                refId: refIns,
                                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                sts: "1",
                            };
                            await queryMember.createWallet(dataWallet);
                            responeData.amount = bonus;
                            responeData.statusCode = httpStatusCodes.Success.ok.code;
                            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                        } else {
                            responeData.statusCode = httpStatusCodes.Fail.fail.code;
                            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                            responeData.description = "Coupon นี้เต็มแล้ว";
                        }
                    } else {
                        responeData.statusCode = httpStatusCodes.Fail.fail.code;
                        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                        responeData.description = "รหัสนี้หมดอายุแล้ว";
                    }
                } else {
                    responeData.statusCode = httpStatusCodes.Fail.fail.code;
                    responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                    responeData.description = "คุณได้เติมรหัสนี้ไปแล้ว";
                }
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
                responeData.description = "รหัส Coupon ไม่ถูกต้อง";
            }
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.description = "Error API";
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApideleteCouponGroup = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            await queryMember.deleteCouponGroupBy(req);
            let data = await queryMember.deleteCouponGroup(req);
            if (data.status) {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            } else {
                responeData.statusCode = httpStatusCodes.Fail.fail.code;
                responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};




module.exports.ApiExchangePromotion = async (req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let username = req.params.user;
        let amount = req.params.amount;
        let data = await queryMember.findMemberIdByUsername(username);
        let memberId = data.result[0].id;
        if (data.status && data.result.length > 0) {
            const dataWallet = {
                memberId: memberId,
                amount: parseFloat(amount),
                balance: parseFloat(amount),
                walletType: "deposit",
                refTable: "promotion",
                refId: '',
                createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                sts: "1",
            };
            await queryMember.createWallet(dataWallet);

            await queryMember.UpdateStatusPromotion(memberId);
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};
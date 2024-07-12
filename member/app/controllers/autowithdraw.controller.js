const queryMember = require('../functions/qdmWithdraw');
const stt = require('../../constants/statusText');
const http = require('../../constants/httpStatusCodes');
let crypto = require('crypto');
let request = require('request');
let querystring = require('querystring');
const jwt = require('jsonwebtoken');
const httpStatusCodes = require('../../constants/httpStatusCodes');
var CronJob = require('cron').CronJob;
const dayjs = require("dayjs");
const scb = require("../library/scb/scb");
const truewallet = require("../library/truewallet/truewallet");
const { deleteOne } = require('../models/utility.model');

const regex = /([^,]+),([^,]+)/;
let m;
var e2Module;
var e2RsaExponent;


// ###########################  Unity Function #########################################
function aes256(password) {
    return new Promise((resolve, reject) => {
        let genpw = password;
        let fp1 = genpw;
        let key = 'aPjr2QDDfjmb72Vs';
        let cipher = crypto.createCipher('aes256', key);
        let fp2 = cipher.update(fp1, 'base64', 'base64') + cipher.final('base64');
        resolve({ genpw: genpw, fp2: fp2 });
    });
}

function formatMoneyNotDecimal(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
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

function formatDate(d) {
    let date = new Date(d);
    let dd = date.getDate();
    let mmm = date.getMonth() + 1;
    let yy = date.getFullYear();
    if (mmm < 10) {
        mmm = '0' + mmm;
    }
    let result = dd + "/" + mmm + "/" + yy;
    return result;
}

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

function sendMessageLineNotify(token, messageBody) {
    request({
        method: 'POST',
        uri: 'https://notify-api.line.me/api/notify',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            'bearer': token
        },
        form: {
            message: messageBody
        }
    });
}

async function authenParse(token) {
    try {
        let split = token;
        let parseToken = split.split('Bearer ');
        let result = await parseJwt(parseToken[1]);
        console.log(parseToken[0]);
        console.log(parseToken[1]);
        return result;
    } catch (e) {
        return false;
    }

}

function jwtData(params) {
    return new Promise((resolve, reject) => {
        let payload = params;
        let secret = 'eyJhbGciOiJIUzI1N';
        var token = jwt.sign(payload, secret, {
            expiresIn: '16h'
        });
        resolve(token);
    });
}

function parseJwt(token) {
    var base64Payload = token.split('.')[1];
    var payload = Buffer.from(base64Payload, 'base64');
    return JSON.parse(payload.toString());
}


// ###########################  Unity Function #########################################
// res.setHeader('Content-Type', 'application/json');
// let token = await authenParse(req.headers.authorization);
// res.send({ msg: token });
async function withdrawTrueWallet(data) {
    const accDeposit = await queryMember.accountWithdraw('truewallet');
    let phone = accDeposit.result[0].accnum;
    let pass = accDeposit.result[0].username;
    let pin = accDeposit.result[0].password;
    const trueWalletObj = new truewallet(phone, pass, pin);
    const dataTrans = {
        phone: phone,
        pin: pin,
        ref: data.username,
        amount: data.amount,
        type: 'P2p'
    };
    const resTrans = await trueWalletObj.ApiTransfer(dataTrans);
    return resTrans;
}

async function withdrawSCB(data) {
    /**======================api scb============================ */
    const accDeposit = await queryMember.accountWithdraw('scb');
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
        amount: parseFloat(data.amount)
    };
    const resTrans = await scbObj.verify(dataWithdraw);
    if (resTrans) {
        let dataTransfer = {
            amount: parseFloat(data.amount),
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
        }
        const resWithdraw = await scbObj.withdrawTransfer(dataTransfer);
        return resWithdraw;
    } else {
        return false;
    }
}


module.exports.auto_deposit = async(req, res) => {
    var job = new CronJob('0-59/90 * * * * *', async function() {
        let settings = await queryMember.querySetting();
        let data_req = {};
        if (settings.result[0].status == 1) {
            let min = settings.result[0].credit_min;
            let max = settings.result[0].credit_max;
            let limit = parseFloat(settings.result[0].credit_limit);
            data_req.min = min;
            data_req.max = max;
            data_req.date = formatDate1(new Date());
            let data = await queryMember.queryMemberWithdraw(data_req);
            let data_check = await queryMember.queryAmountToday(data_req);
            let amount_now = data_check.result[0].amount ? parseFloat(data_check.result[0].amount) : 0;
            console.log('=============================================================');
            console.log('เครดิตถอนที่่ถอนได้ ' + amount_now + '/' + limit + ' บาท');
            console.log('=============================================================');
            console.log('มี ' + data.result.length + ' ยูสเซอร์ กำลังรอถอน || ' + formatDate(new Date()) + ' ' + formatTime(new Date()));
            if (data.status && data.result.length > 0) {
                let username = data.result[0].member_username;
                let amount = parseFloat(data.result[0].amount);
                let name = data.result[0].name;
                let bank = data.result[0].bank_name;
                let bankcode = data.result[0].code;
                let bankacc = data.result[0].accnum;
                let id = data.result[0].tid;
                let date = formatDate1(new Date()) + ' ' + formatTime(new Date());
                let date_new = formatDate1(new Date());
                let total = parseFloat(data_check.result[0].amount) + amount;
                console.log('=============================================================');
                console.log('กำลังถอนให้ ' + username + '[' + data.result[0].bank + '] จำนวน : ' + amount + ' บาท || ' + formatDate(new Date()) + ' ' + formatTime(new Date()));
                console.log(`Total:`, total)
                console.log(`limit:`, limit)
                if (total <= limit) {
                    data_req.username = username;
                    data_req.name = name;
                    data_req.bank = bank;
                    data_req.amount = amount;
                    data_req.bankacc = bankacc;
                    data_req.date = date;
                    data_req.date_new = date_new;
                    if (data.result[0].bank != 'truewallet') {
                        let dataSend = {
                            accountTo: bankacc.replace(/\s/g, ''),
                            accountToBankCode: bankcode,
                            amount: amount
                        };
                        console.log(`Data:`, dataSend);
                        let result = await withdrawSCB(dataSend);
                        console.log(result);
                        if (result.status != 400) {
                            console.log('=============================================================');
                            console.log('โอนเงินให้ ' + username + ' จำนวน ' + amount + ' บาท สำเร็จ || ' + formatDate(new Date()) + ' ' + formatTime(new Date()));
                            await queryMember.insertLogAutoWithdraw(data_req);
                            let data_res = {
                                id: id,
                                response: JSON.stringify(result),
                                remark: 'SCB'
                            };
                            await queryMember.updateTransaction(data_res);
                            let data_setting = await queryMember.querySettingLine();
                            let token_withdraw = data_setting.result[0].token_line_with;
                            let messageLineNotify = '';
                            messageLineNotify += `\n✔️▶โอนเงินสำเร็จ◀✔️`;
                            messageLineNotify += "\nสมาชิก => " + username;
                            messageLineNotify += "\nชื่อสมาชิก => " + name;
                            messageLineNotify += "\nธนาคารลูกค้า => " + bank;
                            messageLineNotify += "\nเลขบัญชี => " + bankacc;
                            messageLineNotify += "\nจำนวนเงินที่ถอน => " + amount + " บาท";
                            messageLineNotify += "\nสถานะ => ถอนสำเร็จแล้ว";
                            messageLineNotify += "\nเวลา => " + formatDate(new Date()) + " " + formatTime(new Date());
                            messageLineNotify += "\nSystem => System Auto";
                            sendMessageLineNotify(token_withdraw, messageLineNotify);
                        } else {
                            console.log('ถอนเร็วเกินไป');
                        }
                    } else {
                        let dataSend = {
                            username: bankacc,
                            amount: amount
                        };
                        let result = await withdrawTrueWallet(dataSend);

                        bank = data.result[0].bank;
                        if (!result.code || result.code != 'TRC-200') {
                            console.log('ไม่สามารถถอนรายการนี้ได้ ลองใหม่อีกครั้ง');
                        } else {
                            console.log('=============================================================');
                            console.log('โอนเงินให้ ' + username + ' จำนวน ' + amount + ' บาท สำเร็จ || ' + formatDate(new Date()) + ' ' + formatTime(new Date()));
                            await queryMember.insertLogAutoWithdraw(data_req);
                            let data_res = {
                                id: id,
                                response: JSON.stringify(result),
                                remark: 'TRUEWALLET'
                            };
                            await queryMember.updateTransaction(data_res);
                            let data_setting = await queryMember.querySettingLine();
                            let token_withdraw = data_setting.result[0].token_line_with;
                            let messageLineNotify = '';
                            messageLineNotify += "\n✔️▶โอนเงินสำเร็จ◀✔️";
                            messageLineNotify += "\nสมาชิก => " + username;
                            messageLineNotify += "\nชื่อสมาชิก => " + name;
                            messageLineNotify += "\nธนาคารลูกค้า => " + bank;
                            messageLineNotify += "\nเลขบัญชี => " + bankacc;
                            messageLineNotify += "\nจำนวนเงินที่ถอน => " + amount + " บาท";
                            messageLineNotify += "\nสถานะ => ถอนสำเร็จแล้ว";
                            messageLineNotify += "\nเวลา => " + formatDate(new Date()) + " " + formatTime(new Date());
                            messageLineNotify += "\nSystem => System Auto";
                            sendMessageLineNotify(token_withdraw, messageLineNotify);
                        }
                    }
                } else {
                    console.log('=============================================================');
                    console.log('จำนวนเครดิตต่อวันเกินแล้ว ไม่สามารถถอนออโต้ได้');
                }
            }
        } else {
            console.log('=============================================================');
            console.log('ระบบออโต้ปิดทำงาน');
            console.log('=============================================================');
        }
    }, null, true, 'America/Los_Angeles');
}
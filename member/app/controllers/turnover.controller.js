const queryMember = require('../functions/qdmTurnover');
const stt = require('../../constants/statusText');
const http = require('../../constants/httpStatusCodes');
let crypto = require('crypto');
let request = require('request');
let querystring = require('querystring');
const jwt = require('jsonwebtoken');
const httpStatusCodes = require('../../constants/httpStatusCodes');
var CronJob = require('cron').CronJob;
let site = require('../../constants/urlsite');
const { DATETIME } = require('mysql/lib/protocol/constants/types');
const moment = require('moment');


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

function formatDateCheck(d) {
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
    let result = mmm + "/" + dd + "/" + yy;
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

function sendMessageLineNotify(req, messageBody) {
    request({
        method: 'POST',
        uri: 'https://notify-api.line.me/api/notify',
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            'bearer': req.token
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
module.exports.auto_turnover = async(req, res) => {
    var job = new CronJob('0-59/1 * * * * *', async function() {
        if (formatTime(new Date()) == '00:00:00' || formatTime(new Date()) == '01:00:00' || formatTime(new Date()) == '02:00:00' || formatTime(new Date()) == '03:00:00' || formatTime(new Date()) == '04:00:00' || formatTime(new Date()) == '05:00:00' || formatTime(new Date()) == '06:00:00' || formatTime(new Date()) == '07:00:00' || formatTime(new Date()) == '08:00:00' || formatTime(new Date()) == '09:00:00' || formatTime(new Date()) == '10:00:00' || formatTime(new Date()) == '11:00:00' || formatTime(new Date()) == '12:00:00' || formatTime(new Date()) == '13:00:00' || formatTime(new Date()) == '14:00:00' || formatTime(new Date()) == '15:00:00' || formatTime(new Date()) == '16:00:00' || formatTime(new Date()) == '17:00:00' || formatTime(new Date()) == '18:00:00' || formatTime(new Date()) == '19:00:00' || formatTime(new Date()) == '20:00:00' || formatTime(new Date()) == '21:00:00' || formatTime(new Date()) == '22:00:00' || formatTime(new Date()) == '23:00:00') {
            console.log(formatDateCheck(new Date()));
            let date = new Date();
            date.setDate(date.getDate());
            var options = {
                'method': 'POST',
                'url': site.url + '/apibackend/check_turnover_user',
                'headers': {

                },
                formData: {
                    'date': formatDateCheck(date)
                }
            };
            request(options, async function(error, response) {
                if (error) throw new Error(error);
                console.log(response.body)
                let htm = JSON.parse(response.body)
                var res = [];
                if (htm.status) {
                    let obj = htm.msg;
                    for (var i in obj)
                        res.push(obj[i]);
                    htm.msg = res;
                    let data_str = htm.date;
                    let data_split = data_str.split('/');
                    let date = data_split[1] + '-' + data_split[0] + '-' + data_split[2];
                    let newdate = data_split[2] + '-' + data_split[0] + '-' + data_split[1];
                    for (let i = 0; i < htm.msg.length; i++) {
                        let data = {
                            username: htm.msg[i].username,
                            turnover: htm.msg[i].turnover,
                            winloss: htm.msg[i].winloss,
                            date: newdate
                        };
                        let data2 = data;
                        data2.id = (htm.msg[i].member_id) ? htm.msg[i].member_id : 0;
                        // console.log(data);
                        // const check = await queryMember.checkLogTurnover(data);
                        await queryMember.insertLogTurnover(data);
                        await queryMember.insertLogDataAff(data2);
                    }
                }
            });
        }
    }, null, true, 'America/Los_Angeles');
}
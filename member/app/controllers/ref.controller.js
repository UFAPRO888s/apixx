const queryMember = require('../functions/qdmref');
let request = require('request');
const site = require('../../constants/urlsite');
const httpStatusCodes = require('../../constants/httpStatusCodes');
const moment = require('moment');

// ###########################  Unity Function #########################################

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

function formatDate(d) {
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

// ###########################  Unity Function #########################################
// res.setHeader('Content-Type', 'application/json');
// let token = await authenParse(req.headers.authorization);
// res.send({ msg: token });

module.exports.handleAuth = async(req, res, next) => {
    let auth = await checkAuth(req.headers.authorization);
    if (auth.status) {
        next()
    } else {
        let responeData = {};
        responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
        responeData.statusCodeText = httpStatusCodes.ClientErrors.unauthorized.codeText
        responeData.description = auth.msg;
        return res.send(responeData)
    }
}

module.exports.testToken = async(req, res) => {
    let responeData;
    res.setHeader('Content-Type', 'application/json');
    responeData = await testAAA(req);
    res.send({ aaa });
}

module.exports.ApiMemberAff = async(req, res) => {
    let responeData = {};
    res.setHeader('Content-Type', 'application/json');
    try {
        const body = req.body;
        let data_res = [];
        const data = [];
        let type = "all";
        if (body.checkAll) {
            type = 'all';
        } else if (body.checkLotto) {
            type = 'lotto';
        } else if (body.checkGame) {
            type = 'game';
        } else {
            type = 'all';
        }
        let dataa = await queryMember.queryMemberRef(req);
        let users_ref = [];
        let data_users_ref = [];
        for (const user of dataa.result) {
            // console.log(user)
            users_ref.push(user.id);
            data_users_ref[user.id] = user;
        }
        // let start_date = body.startDate;
        // let end_date = body.endDate;
        // console.log(users_ref)
        if (type === 'lotto') {
            let data_number = await queryMember.queryMemberDataAff(req.body);
            const items = data_number.result.map((ss) => {
                // for (const user of dataa.result) {
                //     if (user.id === ss.user_key) {
                //         ss.ref_id = user.ref_id;
                //         ss.ref_name = user.ref_name;
                //         ss.type = "lotto";
                //         ss.sum_aff_amont = ss.sum_aff_amont;
                //         ss.timeRecive = formatDate(ss.lotto_date);
                //         ss.isRef = true;
                //     } else {
                //         ss.isRef = false;
                //     }
                // }
                // return ss;
                if (users_ref.includes(ss.user_key)) {
                    // console.log(ss.id)
                    ss.ref_id = data_users_ref[ss.user_key].ref_id;
                    ss.ref_name = data_users_ref[ss.user_key].ref_name;
                    ss.type = "lotto";
                    ss.username = data_users_ref[ss.user_key].username;
                    ss.sum_aff_amont = ss.sum_aff_amont;
                    ss.timeRecive = moment(ss.lotto_date).format('YYYY-MM-DD');
                    ss.isRef = true;
                } else {
                    ss.isRef = false;
                }
                return ss;
            }).filter((ss) => ss);
            data_res = items;
        } else if (type === 'game') {
            let data_number = await queryMember.queryMemberDataTurnover(req.body);
            const items = data_number.result.map((ss) => {
                // console.log(ss.id)
                if (users_ref.includes(ss.id)) {
                    // console.log(ss.id)
                    ss.ref_id = data_users_ref[ss.id].ref_id;
                    ss.ref_name = data_users_ref[ss.id].ref_name;
                    ss.type = "game";
                    ss.username = data_users_ref[ss.id].username;
                    ss.sum_aff_amont = (ss.turnover * 0.04);
                    ss.timeRecive = moment(ss.date).format('YYYY-MM-DD');
                    ss.isRef = true;
                } else {
                    ss.isRef = false;
                }
                return ss;
            }).filter((ss) => ss);
            data_res = items;
        } else {
            let data_number = await queryMember.queryMemberDataAff(req.body);
            let data_number2 = await queryMember.queryMemberDataTurnover(req.body);
            // console.log(data_number2)
            const items = data_number.result.map((ss) => {
                if (users_ref.includes(ss.user_key)) {
                    // console.log(ss.id)
                    ss.ref_id = data_users_ref[ss.user_key].ref_id;
                    ss.ref_name = data_users_ref[ss.user_key].ref_name;
                    ss.type = "lotto";
                    ss.username = data_users_ref[ss.user_key].username;
                    ss.sum_aff_amont = ss.sum_aff_amont;
                    ss.timeRecive = formatDate(ss.lotto_date);
                    ss.isRef = true;
                } else {
                    ss.isRef = false;
                }
                // console.log(ss)
                return ss;
            }).filter((ss) => ss);
            const items2 = data_number2.result.map((ss) => {
                if (users_ref.includes(ss.id)) {
                    ss.ref_id = data_users_ref[ss.id].ref_id;
                    ss.ref_name = data_users_ref[ss.id].ref_name;
                    ss.type = "game";
                    ss.username = data_users_ref[ss.id].username;
                    ss.sum_aff_amont = (ss.turnover * 0.04);
                    ss.timeRecive = moment(ss.date).format('YYYY-MM-DD');
                    // console.log(ss.timeRecive)
                    ss.isRef = true;
                } else {
                    ss.isRef = false;
                }
                // console.log(ss)
                return ss;
            }).filter((ss) => ss);
            data_res = items;
            data_res = data_res.concat(items2);
        }

        const calLast = data_res.map((ss) => {
            if (ss.isRef = true && ss.ref_name) {
                return ss;
            } else {
                return null;
            }
        }).filter((ss) => ss);
        data.result = calLast;
        // console.log(data_res);
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
}

// #################################################################
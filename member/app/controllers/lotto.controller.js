const queryLotto = require("../functions/qdmLotto");
const stt = require("../../constants/statusText");
let crypto = require("crypto");
let request = require("request");
let querystring = require("querystring");
const jwt = require("jsonwebtoken");
const util = require("util");
const jwtVerifyAsync = util.promisify(jwt.verify);
const site = require("../../constants/urlsite");
const httpStatusCodes = require("../../constants/httpStatusCodes");
const lottoHouse = require("../library/lottoHouse/lottoHouse");
const dayjs = require("dayjs");
const axios = require("axios");
const wallet = require("./wallet.controller");
var qs = require("qs");

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

async function checkAuthBackend(token_o) {
    let result = {};
    let split_auth = token_o.split(" ");
    let token = split_auth[1];
    let data = await queryLotto.queryLogToken(token);
    console.log(data);
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
            await queryLotto.deleteLogToken(id);
        }
    } else {
        result.status = false;
        result.msg = stt.tokenFail.description;
    }
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

async function authenParse(token) {
    try {
        let split = token;
        let parseToken = split.split("Bearer ");
        let result = await parseJwt(parseToken[1]);
        console.log(parseToken[0]);
        console.log(parseToken[1]);
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

async function checkAuth(token_o) {
    let result = {};
    let split_auth = token_o.split(" ");
    let token = split_auth[1];
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
        let id = token.id;
        result.status = false;
        result.msg = "Token Expired";
    }
    let memberInfo = await queryLotto.memberAuth(decodedToken);
    if (memberInfo.result.length > 0) {
        result.status = true;
        result.txt = token;
    } else {
        result.status = false;
        result.msg = "ไม่มีสิทธิ์เข้าถึง กรุณา login ใหม่";
    }

    return result;
}

// ###########################  Unity Function #########################################
// res.setHeader('Content-Type', 'application/json');
// let token = await authenParse(req.headers.authorization);
// res.send({ msg: token });

module.exports.testFunc = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let sum = 0;
        for (let i = 0; i < 10000; i++) {
            sum += i;
        }
        responeData.sum = sum;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiGetStockListLotto = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let lottoType = await queryLotto.findJoinLottoGroupStockList();
            let lottoGroup = await queryLotto.findAll();
            responeData.result = {};
            responeData.result.lottoList = lottoType.result;
            responeData.result.lottoGroup = lottoGroup.result;
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.status =
                httpStatusCodes.ClientErrors.unauthorized.description;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiGetBalanceUser = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            let token = await parseJwt(auth.txt);
            let credit_balance = await queryLotto.findCreditBalance(token.id);
            responeData.result = credit_balance.result[0].credit_balance;
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.status =
                httpStatusCodes.ClientErrors.unauthorized.description;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.memberLogin = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        const { password, username } = req.body;
        const objLottoHoust = new lottoHouse(username, password);
        let token = await objLottoHoust.memberLogin(username, password);
        responeData.token = token;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    }
    res.send(responeData);
};

module.exports.ApiCheckRateNumber = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            console.log("ApiCheckRateNumber");
            let token = await parseJwt(auth.txt);
            let list_number = req.body.listnumber;
            let lotto_id = req.body.lotto_id;
            let bill = await queryLotto.queryBillConfig();
            let rewardGroup = await queryLotto.queryRewardGroupByLottoID(lotto_id);
            rewardGroup = rewardGroup.result[0].reward_group_id;
            let total = 0;
            for (let i = 0; i < list_number.length; i++) {
                let data = list_number[i];
                let count = data.number.length;
                let dataCheck = {};
                dataCheck.rewardGroup = rewardGroup;
                let amount = 0;
                if (count == 1) {
                    if (data.up) {
                        dataCheck.reward_name = "runup";
                        amount = parseInt(data.up);
                    }
                    if (data.down) {
                        dataCheck.reward_name = "rundown";
                        amount = parseInt(data.down);
                    }
                } else if (count == 2) {
                    if (data.up) {
                        dataCheck.reward_name = "2up";
                        amount = parseInt(data.up);
                    }
                    if (data.down) {
                        dataCheck.reward_name = "2down";
                        amount = parseInt(data.down);
                    }
                } else if (count == 3) {
                    if (data.up) {
                        dataCheck.reward_name = "3tong";
                        amount = parseInt(data.up);
                    }
                    if (data.down) {
                        dataCheck.reward_name = "3down";
                        amount = parseInt(data.down);
                    }
                    if (data.tod) {
                        dataCheck.reward_name = "3tod";
                        amount = parseInt(data.tod);
                    }
                }
                data.amount = amount;
                total += parseInt(amount);
                let rewardGroupID = await queryLotto.queryRewardGroupID(dataCheck);
                data.lotto_reward_type = rewardGroupID.result[0].id;

                let dataDeprive = {
                    lotto_type: lotto_id,
                    lotto_reward_type: rewardGroupID.result[0].id,
                    number: data.number,
                    lotto_date: req.body.lotto_date,
                };
                let lottoDeprive = await queryLotto.checkDepriveLotto(dataDeprive);
                if (lottoDeprive.result.length > 0) {
                    data.status = false;
                    data.description = "เลขอั้น";
                } else {
                    let dataLimit = {
                        lotto_type: lotto_id,
                        lotto_reward_type: rewardGroupID.result[0].id,
                    };
                    let sumNumber = await queryLotto.checkSumAmountNumber(dataDeprive);
                    sumNumber = sumNumber.result[0].amount ? parseInt(sumNumber.result[0].amount) + amount : amount;
                    let lottolimitnumber = await queryLotto.checkLottoLimit(dataLimit);
                    let limit = lottolimitnumber.result[0].limit_number;
                    if (sumNumber > parseInt(limit)) {
                        data.status = false;
                        data.description = "เลขเกินลิมิตการซื้อ";
                    } else {
                        let fightMax = await queryLotto.checkFightMax(dataDeprive, sumNumber);
                        // console.log("🚀 ~ file: lotto.controller.js:393 ~ module.exports.ApiCheckRateNumber=async ~ fightMax:", fightMax)
                        // console.log("🚀 ~ file: lotto.controller.js:393 ~ module.exports.ApiCheckRateNumber=async ~ fightMax:", sumNumber)
                        // if (fightMax.result[6].max == 0) {
                        //     fightMax = fightMax.result[5].min;
                        // } else {
                        //     fightMax = fightMax.result[6].max;
                        // }
                        // fightMax = fightMax.result[0].max;
                        console.log(
                            sumNumber +
                            " " +
                            data.number +
                            " " +
                            fightMax.result +
                            " " +
                            dataLimit.lotto_reward_type
                        );
                        if (fightMax.result.length == 0 || sumNumber > fightMax.result[0].max) {
                            data.status = false;
                            data.description = "เลขเกินจำนวนการซื้อ";
                        } else {
                            data.status = true;
                            let dataRatte = {
                                lotto_type: lotto_id,
                                lotto_reward_type: rewardGroupID.result[0].id,
                                sum: sumNumber,
                            };
                            let rate = await queryLotto.checkRatePay(dataRatte);
                            // console.log("🚀 ~ file: lotto.controller.js:419 ~ module.exports.ApiCheckRateNumber=async ~ rate:", rate)
                            if (rate.result.length > 0) {
                                data.rate = rate.result[0].reward;
                            } else {
                                data.status = false;
                                data.description = "ไม่พบเรทจ่าย";
                            }
                        }
                    }
                }
            }
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
            responeData.listnumber = list_number;
            // if ((parseInt(bill.result[0].min) <= total) && (parseInt(bill.result[0].max) >= total)) {
            //     responeData.statusCode = httpStatusCodes.Success.success.code;
            //     responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            //     responeData.status = httpStatusCodes.Success.success.description;
            //     responeData.listnumber = list_number;
            // } else {
            //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
            //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            //     responeData.status = 'จำนวนแทง / โพยเกินลิมิต';
            // }
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.status =
                httpStatusCodes.ClientErrors.unauthorized.description;
            responeData.description = auth.msg;
        }
    } catch (e) {
        console.log("🚀 ~ file: lotto.controller.js:453 ~ module.exports.ApiCheckRateNumber=async ~ e:", e)
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiCheckRateNumberAgain = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // try {
    let auth = await checkAuth(req.headers.authorization);
    if (auth.status) {
        let token = await parseJwt(auth.txt);
        let list_number = req.body.listnumber;
        let lotto_id = req.body.lotto_id;
        responeData.check = true;
        let rewardGroup = await queryLotto.queryRewardGroupByLottoID(lotto_id);
        rewardGroup = rewardGroup.result[0].reward_group_id;
        let data_aff_rate = await queryLotto.queryDataAffLotto(token.id);
        data_aff_rate = data_aff_rate.result;
        for (let i = 0; i < list_number.length; i++) {
            let data = list_number[i];
            let count = data.number.length;

            let dataCheck = {};
            dataCheck.rewardGroup = rewardGroup;
            let amount = 0;
            if (count == 1) {
                if (data.up) {
                    dataCheck.reward_name = "runup";
                    amount = parseInt(data.up);
                }
                if (data.down) {
                    dataCheck.reward_name = "rundown";
                    amount = parseInt(data.down);
                }
            } else if (count == 2) {
                if (data.up) {
                    dataCheck.reward_name = "2up";
                    amount = parseInt(data.up);
                }
                if (data.down) {
                    dataCheck.reward_name = "2down";
                    amount = parseInt(data.down);
                }
            } else if (count == 3) {
                if (data.up) {
                    dataCheck.reward_name = "3tong";
                    amount = parseInt(data.up);
                }
                if (data.down) {
                    dataCheck.reward_name = "3down";
                    amount = parseInt(data.down);
                }
                if (data.tod) {
                    dataCheck.reward_name = "3tod";
                    amount = parseInt(data.tod);
                }
            }
            data.amount = amount;
            let rewardGroupID = await queryLotto.queryRewardGroupID(dataCheck);
            data.lotto_reward_type = rewardGroupID.result[0].id;
            let dataDeprive = {
                lotto_type: lotto_id,
                lotto_reward_type: rewardGroupID.result[0].id,
                number: data.number,
                lotto_date: req.body.lotto_date,
            };
            // console.log("🚀 ~ file: lotto.controller.js:522 ~ module.exports.ApiCheckRateNumberAgain=async ~ dataDeprive:", dataDeprive)
            let lottoDeprive = await queryLotto.checkDepriveLotto(dataDeprive);
            // console.log("🚀 ~ file: lotto.controller.js:523 ~ module.exports.ApiCheckRateNumberAgain=async ~ lottoDeprive:", lottoDeprive)
            if (lottoDeprive.result.length > 0) {
                if (data.status) {
                    data.status = false;
                    data.description = "เลขอั้น";
                    responeData.check = false;
                }
            } else {
                let dataLimit = {
                    lotto_type: lotto_id,
                    lotto_reward_type: rewardGroupID.result[0].id,
                };
                let sumNumber = await queryLotto.checkSumAmountNumber(dataDeprive);
                sumNumber = sumNumber.result[0].amount ? parseInt(sumNumber.result[0].amount) + amount : amount;
                // console.log("🚀 ~ file: lotto.controller.js:539 ~ module.exports.ApiCheckRateNumberAgain=async ~ sumNumber:", parseInt(sumNumber))

                let lottolimitnumber = await queryLotto.checkLottoLimit(dataLimit);
                let limit = lottolimitnumber.result[0].limit_number;
                // console.log("🚀 ~ file: lotto.controller.js:541 ~ module.exports.ApiCheckRateNumberAgain=async ~ limit:", parseInt(sumNumber))
                if (sumNumber > parseInt(limit)) {
                    data.status = false;
                    data.description = "เลขเกินลิมิตการซื้อ";
                } else {
                    let fightMax = await queryLotto.checkFightMax(dataDeprive, sumNumber);
                    // console.log("🚀 ~ file: lotto.controller.js:548 ~ module.exports.ApiCheckRateNumberAgain=async ~ fightMax:", fightMax)
                    // fightMax = fightMax.result[0].min;
                    if (fightMax.result.length == 0 || sumNumber > fightMax.result[0].max) {
                        if (data.status) {
                            data.status = false;
                            data.description = "เลขเกินจำนวนการซื้อ";
                            responeData.check = false;
                        }
                    } else {
                        data.status = true;
                        let dataRatte = {
                            lotto_type: lotto_id,
                            lotto_reward_type: rewardGroupID.result[0].id,
                            sum: sumNumber,
                        };
                        let rate = await queryLotto.checkRatePay(dataRatte);

                        if (data.rate != rate.result[0].reward) {
                            responeData.check = false;
                        }
                        data.rate = rate.result[0].reward;
                    }
                }
            }
        }
        if (responeData.check) {
            let order = await queryLotto.queryCheckOrderNum();
            let order_num;
            if (order.result.length > 0) {
                if (order.result[0].order_num) {
                    order_num = parseInt(order.result[0].order_num) + 1;
                } else {
                    order_num = "10000000000";
                }
            } else {
                order_num = "10000000000";
            }
            let total = 0;
            let balance = 0;
            let dataOrder = {
                order_num: order_num,
                note: token.name,
                user_id: token.id,
                lottery_type: lotto_id,
                lottery_date: req.body.lotto_date,
                datetime_created: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                cr_date: dayjs().format("YYYY-MM-DD"),
            };
            let orderID = await queryLotto.insertOrder(dataOrder);
            orderID = orderID.result.insertId;
            for (let i = 0; i < list_number.length; i++) {
                let data = list_number[i];
                let aff = data_aff_rate.find((ss) => {
                    return ss.lotto_type == lotto_id;
                });
                if (data.status) {
                    total += data.amount;
                    let dataInsert = {
                        user_id: token.id,
                        lotto_reward_type: data.lotto_reward_type,
                        lotto_type: lotto_id,
                        numbers: data.number,
                        amount: data.amount,
                        aff: aff.affiliate_rate * data.amount * 0.01,
                        lotto_date: req.body.lotto_date,
                        reward: data.rate,
                        winner_amount: data.amount * data.rate,
                        orderID: orderID,
                    };
                    let ins = await queryLotto.insertLottoNumber(dataInsert);
                    let InsID = ins.result.insertId;
                    dataInsert.data_id = InsID;
                    await queryLotto.insertLottoNumberDTL(dataInsert);
                }
            }
            let credit_balance = await queryLotto.findCreditBalance(token.id);
            credit_balance = credit_balance.result[0].credit_balance;
            balance = parseFloat(credit_balance) - parseFloat(total);
            await queryLotto.updateCredit({ credit: balance, id: token.id });
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
        } else {
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
            responeData.listnumber = list_number;
        }
    } else {
        responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
        responeData.statusCodeText = httpStatusCodes.ClientErrors.unauthorized.codeText;
        responeData.status = httpStatusCodes.ClientErrors.unauthorized.description;
        responeData.description = auth.msg;
    }
    // } catch (e) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    //     responeData.status = httpStatusCodes.Fail.fail.description;
    // }
    res.send(responeData);
};

module.exports.ApiInsertNumber = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let auth = await checkAuth(req.headers.authorization);
        if (auth.status) {
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
        } else {
            responeData.statusCode = httpStatusCodes.ClientErrors.unauthorized.code;
            responeData.statusCodeText =
                httpStatusCodes.ClientErrors.unauthorized.codeText;
            responeData.status =
                httpStatusCodes.ClientErrors.unauthorized.description;
            responeData.description = auth.msg;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiUpdateLottoSetting = async(req, res) => {
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
                    if (data_ins_limit.length != 0) {
                        min = parseInt(data_ins_limit[data_ins_limit.length - 1].max) + 1;
                    }

                    data_lotto_limit.min = min;
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

        await queryLotto.updateLottoConfig(data);
    }

    for (let i = 0; i < data_ins_limit.length; i++) {
        let data = {
            id: data_ins_limit[i].id,
            reward: data_ins_limit[i].reward,
            max: data_ins_limit[i].max,
            min: data_ins_limit[i].min,
        };
        await queryLotto.updateLottoConfigLimit(data);
    }
    responeData.statusCode = httpStatusCodes.Success.success.code;
    responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
    responeData.status = httpStatusCodes.Success.success.description;
    res.send(responeData);
};

module.exports.ApiQueryLottoGroupType = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lottoGroup = await queryLotto.queryLottoGroup();
        let data = await queryLotto.queryLottoGroupType();
        if (data.status && data.result.length > 0) {
            let dataArr = [];
            responeData.data = lottoGroup.result;
            for (let i = 0; i < lottoGroup.result.length; i++) {
                let lottoGroupArr = lottoGroup.result[i];
                dataArr = [];
                for (let j = 0; j < data.result.length; j++) {
                    let lottoGroupTypeArr = data.result[j];
                    if (
                        lottoGroupArr.lotto_group_id == lottoGroupTypeArr.lotto_group_id
                    ) {
                        let dataQuery = {
                            date: formatDate1(req.body.lottoDate),
                            id: lottoGroupTypeArr.id,
                        };
                        let detail = await queryLotto.queryLottoWinnerFlag(dataQuery);
                        let amount = 0;
                        let aff = 0;
                        let winner = 0;
                        let total = 0;
                        for (let k = 0; k < detail.result.length; k++) {
                            amount += parseFloat(detail.result[k].amount);
                            aff += parseFloat(detail.result[k].aff_amount);
                            winner =
                                detail.result[k].winner_flg == 1 ?
                                winner + parseFloat(detail.result[k].winner_amount) :
                                winner;
                        }
                        total = amount - winner;
                        lottoGroupTypeArr.amount = amount;
                        lottoGroupTypeArr.aff = aff;
                        lottoGroupTypeArr.winner = winner;
                        lottoGroupTypeArr.total = total;
                        dataArr.push(lottoGroupTypeArr);
                    }
                }
                responeData.data[i].lotto_type = dataArr;
            }
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.status = httpStatusCodes.Fail.fail.description;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiQueryLottoGroupTypeWait = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let lottoGroup = await queryLotto.queryLottoGroup();
        let data = await queryLotto.queryLottoGroupType();
        if (data.status && data.result.length > 0) {
            let dataArr = [];
            responeData.data = lottoGroup.result;
            for (let i = 0; i < lottoGroup.result.length; i++) {
                let lottoGroupArr = lottoGroup.result[i];
                dataArr = [];
                for (let j = 0; j < data.result.length; j++) {
                    let lottoGroupTypeArr = data.result[j];
                    if (
                        lottoGroupArr.lotto_group_id == lottoGroupTypeArr.lotto_group_id
                    ) {
                        let dataQuery = {
                            date: formatDate1(req.body.lottoDate),
                            id: lottoGroupTypeArr.id,
                        };
                        let detail = await queryLotto.queryLottoWaitFlag(dataQuery);
                        lottoGroupTypeArr.amount =
                            detail.result[0].amount != null ? detail.result[0].amount : 0;
                        dataArr.push(lottoGroupTypeArr);
                    }
                }
                responeData.data[i].lotto_type = dataArr;
            }
            responeData.statusCode = httpStatusCodes.Success.success.code;
            responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
            responeData.status = httpStatusCodes.Success.success.description;
        } else {
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
            responeData.status = httpStatusCodes.Fail.fail.description;
        }
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiHistoryAward = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let awardTH = await queryLotto.findByLottoTypeTH();
        let awards = await queryLotto.findByDate(req);
        let lottoGroup = await queryLotto.findAll();
        responeData.result = {
            govt: awardTH.result,
            stocks: awards.result,
            group: lottoGroup.result,
        };
        responeData.statusCode = httpStatusCodes.Success.success.code;
        responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
        responeData.status = httpStatusCodes.Success.success.description;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiHistoryBetOrder = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let historyBet = await queryLotto.queryHistoryBet(req);
        if (historyBet.result.length > 0) {
            responeData.result = historyBet.result;
            for (let i = 0; i < historyBet.result.length; i++) {
                req.body.order_id = historyBet.result[i].order_id;
                let historyBet2 = await queryLotto.queryHistoryBetDetail(req);
                let sum = 0;
                for (let j = 0; j < historyBet2.result.length; j++) {
                    if (historyBet2.result[j].winner_flg == 1) {
                        // sum += historyBet2.result[j].winner_amount;
                        sum = parseFloat(sum) + parseFloat(historyBet2.result[j].winner_amount);
                    } else {
                        //Disable customer unknow
                        // sum -= historyBet2.result[j].amount;
                    }
                }
                responeData.result[i].winner = sum;
            }
        }
        responeData.statusCode = httpStatusCodes.Success.success.code;
        responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
        responeData.status = httpStatusCodes.Success.success.description;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};


module.exports.ApiHistoryBetOrderDetail = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    // try {
    let historyBet = await queryLotto.queryHistoryBetByID(req);
    let historyBet2 = await queryLotto.queryHistoryBetDetail(req);
    let dataRes = {
        date: formatDate1(historyBet.result[0].datetime_created),
        lotto_id: historyBet.result[0].id,
    };
    let historyResult = await queryLotto.queryResultLottoByID(dataRes);
    // console.log(historyResult.result);
    responeData.order = historyBet.result;
    responeData.detail = historyBet2.result;
    responeData.result = historyResult.result[0];
    let sum = 0;
    for (let j = 0; j < historyBet2.result.length; j++) {
        if (historyBet2.result[j].winner_flg == 1) {
            // console.log(`looto:`, parseFloat(historyBet2.result[j].winner_amount))
            sum = parseFloat(sum) + parseFloat(historyBet2.result[j].winner_amount);
            // console.log(sum);
        } else {
            // sum -= historyBet2.result[j].amount;
        }
    }
    responeData.winner = sum;
    responeData.statusCode = httpStatusCodes.Success.success.code;
    responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
    responeData.status = httpStatusCodes.Success.success.description;

    // } catch (e) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    //     responeData.status = httpStatusCodes.Fail.fail.description;
    // }
    res.send(responeData);
};

module.exports.ApiQueryLottoLimitMin = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let historyBet = await queryLotto.queryLottoLimitMin(req);
        responeData.statusCode = httpStatusCodes.Success.success.code;
        responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
        responeData.status = httpStatusCodes.Success.success.description;
        responeData.result = historyBet.result;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoNumberGroup = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let userIDLotto = await queryLotto.GetLottoUser(req.body.username);
        userIDLotto = userIDLotto.result[0].id;
        console.log(userIDLotto);
        let historyBet = await queryLotto.queryGetLottoNumberGroup(userIDLotto);
        responeData.statusCode = httpStatusCodes.Success.success.code;
        responeData.statusCodeText = httpStatusCodes.Success.success.codeText;
        responeData.status = httpStatusCodes.Success.success.description;
        responeData.result = historyBet.result;
    } catch (e) {
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.status = httpStatusCodes.Fail.fail.description;
    }
    res.send(responeData);
};

module.exports.ApiGetLottoNumberDetail = async(req, res) => {
    let responeData = {};
    res.setHeader("Content-Type", "application/json");
    try {
        let userIDLotto = await queryLotto.GetLottoUser(req.body.username);
        userIDLotto = userIDLotto.result[0].id;
        req.body.userid = userIDLotto;
        let lotto_type = await queryLotto.queryGetLottoNumberDetail(req);
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
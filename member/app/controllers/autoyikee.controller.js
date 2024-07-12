const queryYikee = require('../functions/qdmYikee');
const stt = require('../../constants/statusText');
let crypto = require('crypto');
let request = require('request');
let querystring = require('querystring');
const jwt = require('jsonwebtoken');
const util = require('util');
const jwtVerifyAsync = util.promisify(jwt.verify);
const site = require('../../constants/urlsite');

const httpStatusCodes = require('../../constants/httpStatusCodes');
const { database } = require('../../constants/dbCon');
const dayjs = require("dayjs");
const truewallet = require("../library/truewallet/truewallet");
const axios = require("axios");
var qs = require('qs');
const { query } = require('express');
const { start } = require('repl');



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

module.exports.testLogsFile = async(req, res) => {
    let rll = []
    for (const rr of logs) {
        rll.push(rr)
    }
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="refresh" content="300">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Logs Pm2</title>
    <style>pre{font-size: 14px}a{text-decoration: none}h4{color:#697f22;}</style>
</head>
<body>
    <pre>${rll.reverse().join("\n")}</pre>
</body>
</html>`);

}

module.exports.AutoYiKeeResult = async() => {
    try {
        let time_now = formatTime(dayjs().subtract(1, 'minute').format());
        // console.log("auto yikee Date : " + formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format()));
        let time = new Date();
        time.setMinutes(time.getMinutes() + 3);
        let dataC = {
            endTime: formatTime(time),
            startTime: time_now
        };
        let dateCheck = await queryYikee.queryDateYikee(dataC);
        if (dateCheck.result.length > 0) {
            for (let i = 0; i < dateCheck.result.length; i++) {
                let data = dateCheck.result[i];
                let total = 0;
                if (data.time_close == time_now) {
                    console.log("auto yikee Date : " + formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format()));
                    let arrDataOne = [];
                    let arrDataThree = [];
                    let arrDataTwo = [];
                    let arrDataOneDown = [];
                    let arrDataTwoDown = [];
                    let random3;
                    let random2;
                    let up = [];
                    let down = [];
                    let lotto_id = data.id;
                    let date = formatDate(dayjs().format());
                    let date_time_closed = date + ' ' + data.time_close;
                    let result_date = date;
                    let time = data.reward_time;
                    let date_time_add = dayjs().format('YYYY-MM-DD HH:mm:ss');
                    let data_ans = {
                        lotto_type: lotto_id,
                        date_time_closed: date_time_closed,
                        result_date: result_date,
                        time: time,
                        date_time_add: date_time_add,
                    };
                    let dataNumber = {
                        lotto_type: lotto_id,
                        lotto_date: date
                    };
                    // console.log('dataNumber', dataNumber);
                    let numberData = await queryYikee.queryNumberData(dataNumber);
                    if (numberData.status && numberData.result.length > 0) {
                        let roundUp = 0;
                        let roundUpT = 0;
                        let roundUpTH = 0;
                        let roundTod = 0;
                        let roundDown = 0;
                        // console.log('numberData.result', numberData.result);
                        for (let i = 0; i < numberData.result.length; i++) {
                            let number = numberData.result[i];
                            let idCheck = [];
                            total += parseFloat(number.amount);
                            if (number.reward_name == '3tong' || number.reward_name == '3tod' || number.reward_name == '2up' || number.reward_name == 'runup') {
                                // เลขบน
                                if (number.reward_name == '3tod') {
                                    let arrTod = [];
                                    arrTod[0] = (number.numbers).slice(0, 1);
                                    arrTod[1] = (number.numbers).slice(1, 2);
                                    arrTod[2] = (number.numbers).slice(2, 3);
                                    let num1 = arrTod[0] + arrTod[1] + arrTod[2];
                                    let num2 = arrTod[0] + arrTod[2] + arrTod[1];
                                    let num3 = arrTod[1] + arrTod[0] + arrTod[2];
                                    let num4 = arrTod[1] + arrTod[2] + arrTod[0];
                                    let num5 = arrTod[2] + arrTod[0] + arrTod[1];
                                    let num6 = arrTod[2] + arrTod[1] + arrTod[0];
                                    arrTod = [];
                                    arrTod.push(num1);
                                    arrTod.push(num2);
                                    arrTod.push(num3);
                                    arrTod.push(num4);
                                    arrTod.push(num5);
                                    arrTod.push(num6);
                                    for (let k = 0; k < arrTod.length; k++) {
                                        if (!(arrDataThree.length == 0)) {
                                            let cTod = false;
                                            let rTod = 0;
                                            for (let q = 0; q < arrDataThree.length; q++) {
                                                if (arrTod[k] == arrDataThree[q].number) {
                                                    cTod = true;
                                                    rTod = k;
                                                }
                                            }
                                            if (cTod) {
                                                arrDataThree[rTod].amount += parseFloat(number.amount);
                                                arrDataThree[rTod].winner += parseFloat(number.winner_amount);
                                            } else {
                                                arrDataThree.push({ id: roundUpTH++, number: arrTod[k], reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                            }
                                        } else {
                                            arrDataThree.push({ id: roundUpTH++, number: arrTod[k], reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        }
                                    }
                                } else {
                                    if ((number.numbers).length == 1) {
                                        if (!(arrDataOne.length == 0)) {
                                            let NumberUp = false;
                                            arrDataOne.map(function(params) {
                                                if ((params.number == number.numbers)) {
                                                    NumberUp = true;
                                                    idCheck.push(params.id);
                                                }
                                            });
                                            if (NumberUp) {
                                                for (let k = 0; k < idCheck.length; k++) {
                                                    arrDataOne[idCheck[k]].amount += parseFloat(number.amount);
                                                    arrDataOne[idCheck[k]].winner += parseFloat(number.winner_amount);
                                                }
                                            } else {
                                                arrDataOne.push({ id: roundUp++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                            }
                                        } else {
                                            arrDataOne.push({ id: roundUp++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        }
                                    } else if ((number.numbers).length == 2) {
                                        if (!(arrDataTwo.length == 0)) {
                                            let NumberUp = false;
                                            arrDataTwo.map(function(params) {
                                                if ((params.number == number.numbers)) {
                                                    NumberUp = true;
                                                    idCheck.push(params.id);
                                                }
                                            });
                                            if (NumberUp) {
                                                for (let k = 0; k < idCheck.length; k++) {
                                                    arrDataTwo[idCheck[k]].amount += parseFloat(number.amount);
                                                    arrDataTwo[idCheck[k]].winner += parseFloat(number.winner_amount);
                                                }
                                            } else {
                                                arrDataTwo.push({ id: roundUpT++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                            }
                                        } else {
                                            arrDataTwo.push({ id: roundUpT++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        }
                                    } else {
                                        if (!(arrDataThree.length == 0)) {
                                            let NumberUp = false;
                                            arrDataThree.map(function(params) {
                                                if ((params.number == number.numbers)) {
                                                    NumberUp = true;
                                                    idCheck.push(params.id);
                                                }
                                            });
                                            if (NumberUp) {
                                                for (let k = 0; k < idCheck.length; k++) {
                                                    arrDataThree[idCheck[k]].amount += parseFloat(number.amount);
                                                    arrDataThree[idCheck[k]].winner += parseFloat(number.winner_amount);
                                                }
                                            } else {
                                                arrDataThree.push({ id: roundUpTH++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                            }
                                        } else {
                                            arrDataThree.push({ id: roundUpTH++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        }
                                    }
                                }
                            } else if (number.reward_name == '2down' || number.reward_name == 'rundown') {
                                //  เลขล่าง
                                if ((number.numbers).length == 1) {
                                    if (!(arrDataOneDown.length == 0)) {
                                        let NumberUp = false;
                                        arrDataOneDown.map(function(params) {
                                            if ((params.number == number.numbers)) {
                                                NumberUp = true;
                                                idCheck.push(params.id);
                                            }
                                        });
                                        if (NumberUp) {
                                            for (let k = 0; k < idCheck.length; k++) {
                                                arrDataOneDown[idCheck[k]].amount += parseFloat(number.amount);
                                                arrDataOneDown[idCheck[k]].winner += parseFloat(number.winner_amount);
                                            }
                                        } else {
                                            arrDataOneDown.push({ id: roundDown++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        }
                                    } else {
                                        arrDataOneDown.push({ id: roundDown++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                    }
                                } else if ((number.numbers).length == 2) {
                                    // console.log('arrDataTwoDown', arrDataTwoDown);
                                    if (!(arrDataTwoDown.length == 0)) {
                                        let NumberUp = false;
                                        arrDataTwoDown.map(function(params) {
                                            if ((params.number == number.numbers)) {
                                                NumberUp = true;
                                                idCheck.push(params.id);
                                            }
                                        });
                                        if (NumberUp) {
                                            for (let k = 0; k < idCheck.length; k++) {
                                                arrDataTwoDown[idCheck[k]].amount += parseFloat(number.amount);
                                                arrDataTwoDown[idCheck[k]].winner += parseFloat(number.winner_amount);
                                            }
                                        } else {
                                            arrDataTwoDown.push({ id: roundDown++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        }
                                    } else {
                                        arrDataTwoDown.push({ id: roundDown++, number: number.numbers, reward_type: number.reward_name, amount: parseFloat(number.amount), winner: parseFloat(number.winner_amount) });
                                        // console.log('arrDataTwoDown1', arrDataTwoDown);
                                    }

                                }
                            }
                        }

                        for (let i = 0; i < arrDataOne.length; i++) {
                            for (let j = 0; j < arrDataThree.length; j++) {
                                if ((arrDataThree[j].number).includes(arrDataOne[i].number)) {
                                    arrDataThree[j].amount += parseFloat(arrDataOne[i].amount);
                                    arrDataThree[j].winner += parseFloat(arrDataOne[i].winner);
                                }
                            }
                        }

                        for (let i = 0; i < arrDataTwo.length; i++) {
                            for (let j = 0; j < arrDataThree.length; j++) {
                                if ((arrDataThree[j].number).slice(1, 2) == (arrDataTwo[i].number)) {
                                    arrDataThree[j].amount += parseFloat(arrDataTwo[i].amount);
                                    arrDataThree[j].winner += parseFloat(arrDataTwo[i].winner);
                                }
                            }
                        }

                        for (let i = 0; i < arrDataOneDown.length; i++) {
                            for (let j = 0; j < arrDataTwoDown.length; j++) {
                                if ((arrDataTwoDown[j].number).includes(arrDataOneDown[i].number)) {
                                    arrDataTwoDown[j].amount += parseFloat(arrDataOneDown[i].amount);
                                    arrDataTwoDown[j].winner += parseFloat(arrDataOneDown[i].winner);
                                }
                            }
                        }
                        arrDataTwoDown.sort(GetSortOrder('winner'));
                        arrDataThree.sort(GetSortOrder('winner'));
                        let chkTotal = 0;
                        let two = arrDataTwoDown.length > 0 ? arrDataTwoDown[0].winner : 0;
                        let three = arrDataThree.length > 0 ? arrDataThree[0].winner : 0
                        chkTotal = two + three;

                        let ansUp = '';
                        let ansDown = '';
                        if (chkTotal > parseFloat(total)) {
                            random3 = await makeid(3);
                            random2 = await makeid(2);
                            for (let i = 0; i < arrDataThree.length; i++) {
                                if ((arrDataThree[i].number).slice(1, 3) == random3.slice(1, 3)) {
                                    random3 = await makeid(3);
                                    i = 0;
                                }
                                if (arrDataThree[i].number == random3) {
                                    random3 = await makeid(3);
                                    i = 0;
                                }
                            }

                            for (let i = 0; i < arrDataTwoDown.length; i++) {
                                if (arrDataTwoDown[i].number == random2) {
                                    random2 = await makeid(2);
                                    i = 0;
                                }
                            }
                        } else {
                            random3 = arrDataThree.length > 0 ? arrDataThree[0].number : await makeid(3);
                            random2 = arrDataTwoDown.length > 0 ? arrDataTwoDown[0].number : await makeid(2);;
                        }

                    } else {
                        //  Random ตัวเลขออก
                        random3 = await makeid(3);
                        random2 = await makeid(2);
                    }
                    let arrThree = [];
                    arrThree[0] = (random3).slice(0, 1);
                    arrThree[1] = (random3).slice(1, 2);
                    arrThree[2] = (random3).slice(2, 3);
                    let numberThree;
                    numberThree = arrThree[0] + arrThree[1] + arrThree[2] + ',';
                    numberThree += arrThree[0] + arrThree[2] + arrThree[1] + ',';
                    numberThree += arrThree[1] + arrThree[0] + arrThree[2] + ',';
                    numberThree += arrThree[1] + arrThree[2] + arrThree[0] + ',';
                    numberThree += arrThree[2] + arrThree[0] + arrThree[1] + ',';
                    numberThree += arrThree[2] + arrThree[1] + arrThree[0];

                    let numberRunUp;
                    if ((arrThree[0] == arrThree[1]) && arrThree[0] == arrThree[2]) {
                        numberRunUp = arrThree[0];
                    } else if ((arrThree[0] == arrThree[1]) && arrThree[0] != arrThree[2]) {
                        numberRunUp = arrThree[0] + ',' + arrThree[2];
                    } else if ((arrThree[0] != arrThree[1]) && arrThree[0] == arrThree[2]) {
                        numberRunUp = arrThree[0] + ',' + arrThree[1];
                    } else {
                        numberRunUp = arrThree[0] + ',' + arrThree[1] + ',' + arrThree[2];
                    }

                    data_ans.three_tod = numberThree;
                    data_ans.three_up = random3;
                    data_ans.two_up = random3.slice(1, 3);
                    data_ans.run_up = numberRunUp;

                    let arrTwo = [];
                    arrTwo[0] = (random2).slice(0, 1);
                    arrTwo[1] = (random2).slice(1, 2);
                    let numberRundown;
                    if ((arrTwo[0] == arrTwo[1])) {
                        numberRundown = arrTwo[0];
                    } else {
                        numberRundown = arrTwo[0] + ',' + arrTwo[1];
                    }
                    data_ans.two_down = random2;
                    data_ans.run_down = numberRundown;

                    await queryYikee.insertResultLottoYikee(data_ans);
                }
            }
        }
    } catch (error) {
        throw new Error(`Error AutoYiKeeResult: ${error}`)
    }

}


async function makeid(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}


function searchNumberArray(arr, check) {
    let data = arr;
    for (let i = 0; i < data.length; i++) {
        if ((data[i].number).includes(check.number)) {
            data[i].amount += parseFloat(check.amount);
            data[i].winner += parseFloat(check.winner);
        }
    }
    return data;
}

function GetSortOrder(prop) {
    return function(a, b) {
        if (a[prop] > b[prop]) {
            return 1;
        } else if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    }
}
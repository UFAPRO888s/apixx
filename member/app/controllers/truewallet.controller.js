const queryTrueWallet = require('../functions/qdmTrueWallet');
const queryMember = require('../functions/qdmbackend');
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
module.exports.AutoTransactionTruewallet = async() => {
    const checkStsTrue = await queryTrueWallet.checkAccTrue('truewallet');
    if (checkStsTrue.result.length == 0) {
        return console.log(`No Acc Truewallet:`, `ไม่มีบัญชีืทรูวอเรท`);
    }
    if (checkStsTrue.result[0].status == 0) {
        return console.log(`Truewallet Maintained:`, `ปิดปรับปรุงบัญชีืทรูวอเรท`);
    }
    console.log("auto check TrueWallet transaction By Firework Date : " + formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format()));
    const accDeposit = await queryMember.accountDeposit('truewallet');
    let phone = accDeposit.result[0].accnum;
    let pass = accDeposit.result[0].username;
    let pin = accDeposit.result[0].password;
    const trueWalletObj = new truewallet(phone, pass, pin);
    const data = {
        phone: phone,
        pin: pin,
        pass: pass,
        type: "Transaction"
    };
    const resTrans = await trueWalletObj.ApiTruewallet(data);
    // console.log(`result`, resTrans.data.activities);
    if (resTrans.data) {
        let data = resTrans.data.activities;
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].product_code == 'P2P' && data[i].original_action == 'creditor') {
                let name_split = data[i].sub_title;
                let name = (name_split.split('*'))[0];
                let amount_split = data[i].amount;
                let amount = parseFloat((amount_split.split('*'))[0]);
                let phone_split = (data[i].transaction_reference_id).split('-');
                let phone = phone_split[0] + phone_split[1] + phone_split[2];
                if (data[i].type == 'p2pw') {
                    phone = data[i].transaction_reference_id;
                    // console.log(`dataTrue:`, data[i]);
                }
                let date_split = (data[i].date_time).split('/');
                let date_split_1 = '20' + ((date_split[2]).split(' '))[0] + '-' + date_split[1] + '-' + date_split[0];
                let time_split = (data[i].date_time).split(' ');
                let time_split_1 = time_split[1] + ':00';
                let date = date_split_1 + ' ' + time_split_1;
                let responseData = data[i];
                if (date_split_1 == formatDate(new Date())) {
                    let dataMember = {
                        name: (name.split(' '))[0],
                        accnum: phone
                    }
                    let checkMember = await queryTrueWallet.MemberTrueWallet(dataMember);

                    if (checkMember.result.length == 1) {
                        let username = checkMember.result[0].username;
                        let dataTransaction = {
                            transaction_date: date,
                            amount: amount,
                            member_username: checkMember.result[0].username,
                        };

                        let checkDataTransaction = await queryTrueWallet.queryTransactionByTrueWallet(dataTransaction);
                        if (!checkDataTransaction) {
                            console.log(
                                `auto check deposit amount:${amount} dateTime:${date} remark:${name}`
                            )
                            let memberId = checkMember.result[0].id;
                            let data = await queryMember.getBalanceWallet(memberId);
                            let total = parseFloat(data.result[0].balance) + amount
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
                            let walletRes = await queryMember.createWallet(dataWallet);
                            let LastWalletID = walletRes.result.insertId;
                            const dataTrans = {
                                username: username,
                                type: "1",
                                amount: amount,
                                transaction_date: date,
                                created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                                stats: 0,
                                pro_id: 0,
                                date_new: dayjs().format("YYYY-MM-DD"),
                                response_api: JSON.stringify(responseData),
                                admin: 'Auto',
                                update_by: ''
                            };
                            let insTransactionWithdraw = await queryMember.createTransWithTrueWallet(dataTrans);
                            let LastTransactionID = insTransactionWithdraw.result.insertId;

                            let dataUpdate = {
                                LastWaleltID: LastWalletID,
                                LastPromotionID: LastTransactionID
                            };
                            await queryMember.updateRefWalletByMe(dataUpdate);
                            console.log(
                                `auto deposit amount:${amount} dateTime:${formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format())} remark:${name} || Success`
                            )
                        }
                    } else {

                        const dataTrans = {
                            username: '',
                            type: "1",
                            amount: amount,
                            transaction_date: date,
                            created_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                            stats: 1,
                            pro_id: 0,
                            date_new: dayjs().format("YYYY-MM-DD"),
                            response_api: JSON.stringify(responseData),
                            admin: 'Auto',
                            update_by: ''
                        };
                        let checkDataTransaction = await queryTrueWallet.queryTransactionByTrueWalletNoUser(dataTrans);
                        if (!checkDataTransaction.result.length > 0) {
                            console.log('ไม่พบผู้ใช้งาน ' + data[i].sub_title + ' กำลังพักยอดไว้ จำนวนเงิน ' + amount);
                            await queryMember.createTransWithTrueWallet(dataTrans);
                        }

                    }
                } else {
                    // console.log('ชื่อ : ' + name + ' โอนเงินจำนวน : ' + amount + ' เบอร์โทรศัพท์ : ' + phone + ' วันที่ : ' + date);
                }
            }
        }
    } else {
        console.log('Error Transaction : ' + resTrans);
    }
    let Exchange = await queryMember.querySettingTruewallet();
    let stats = Exchange.result[0].stats;
    let limit = parseFloat(Exchange.result[0].limit_exchange);
    let ref = Exchange.result[0].accnum;
    if (stats == 1) {
        const data = {
            phone: phone,
            pin: pin,
            pass: pass,
            type: "Balance"
        };
        const resBalance = await trueWalletObj.ApiTruewallet(data);
        if (resBalance.data) {
            let balance = parseFloat(resBalance.data.current_balance);
            console.log(
                `เช็คยอดลิมิตบัญชี ${balance}/${limit} dateTime:${formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format())} `
            )
            if (balance >= limit) {
                console.log(
                    `กำลังโอนยอดไปยัง ${ref} จำนวน ${limit} dateTime:${formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format())} `
                )
                let dataSend = {
                    phone: phone,
                    pin: pin,
                    pass: pass,
                    ref: ref,
                    amount: limit,
                    type: 'P2p'
                };
                let result = await trueWalletObj.ApiTransfer(dataSend);
                if (!result.code || result.code != 'UPC-200') {
                    console.log('ไม่สามารถโยกเงินออกได้ ลองใหม่อีกครั้ง dateTime:' + formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format()));
                } else {
                    console.log(
                        `โอนยอดไปยัง ${ref} จำนวน ${limit} เรียบร้อยแล้ว dateTime:${formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format())} `
                    )
                }
            }
        }

        console.log(
            `เช็คยอดลิมิตบัญชี dateTime:${formatDate(dayjs().format()) + ' ' + formatTime(dayjs().format())} `
        )
    }


}
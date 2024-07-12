// const scb = require("../library/scb/scb");
const dayjs = require("dayjs");
const axios = require("axios");
const httpStatusCodes = require("../../constants/httpStatusCodes");
const lottoHouse = require("../library/lottoHouse/lottoHouse");
let request = require("request");
const backendCon = require("../controllers/backend.controller");
const site = require("../../constants/urlsite");
const qs = require("qs");
const moment = require("moment");
const {
    getAdminByMappingApi,
    queryFindMemberByMember,
    findMemberBank,
    accountDeposit,
    checkDepositTrans,
    createTrans,
    checkWalletTypeTrans,
    getBalanceWallet,
    createWallet,
    findPomotionById,
    findMemberIdByUsername,
    accountWithdraw,
    querySettingGame,
    checkDepositTransWait,
    querySettingLine,
    findPomotionById1,
    checkSpam,
} = require("../functions/qdmbackend");

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

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function delay(ms = 1000) {
    return new Promise((r) => setTimeout(r, ms));
}

async function handleGetTransaction() {
    /**======================api scb============================ */
    const accDeposit = await accountDeposit("scb");

    if (accDeposit.result.length !== 1) {
        return false;
    }
    const {
        username: deviceId,
        password: pin,
        accnum: accountNo,
    } = accDeposit.result[0];
    const scbObj = new scb(deviceId, pin);
    /**======================api scb============================ */
    const dataGetTransaction = {
        accountNo,
        startDate: dayjs().add(-1, "day").format(),
        endDate: dayjs().format(),
    };
    const resTrans = await scbObj.getTransaction(dataGetTransaction);


    if (resTrans.status == 400) {
        console.log(
            `statusCode : ${resTrans.statusCode}, statusText: ${resTrans.statusText
            } || ${dayjs().format()}`
        );
        return { status: false, data: resTrans };
    }

    if (resTrans.txnList.length > 0) {
        return { status: true, data: resTrans };
    } else {
        console.log("auto check transaction is null " + dayjs().format());
        return { status: false, data: resTrans };
    }
}

function getAccountBank(bankCodeLower, txnRemarkArr) {
    switch (bankCodeLower) {
        case "kbank":
            return txnRemarkArr[2].replace(/\/X/gi, "");
        case "scb":
            if (txnRemarkArr[2] === "SCB") {
                return txnRemarkArr[3].replace(/x/gi, "");
            } else {
                return txnRemarkArr[2].replace(/x/gi, "");
            }
        default:
            return txnRemarkArr[2].replace(/\/X/gi, "");
    }
}

function handleLogDepositWallet(resCreateWallet, item) {
    if (resCreateWallet) {
        console.log(
            `auto check deposit amount:${item.txnAmount} dateTime:${item.txnDateTime} remark:${item.txnRemark}`
        );
    }
}

function findBankCodeFromStr(txnRemarkArr) {
    return txnRemarkArr[1] === "from" ?
        txnRemarkArr[2].replace(/[\(|\)]/gi, "") :
        txnRemarkArr[1].replace(/[\(|\)]/gi, "");
}

async function checkBalance() {
    /**======================api scb============================ */
    const accDeposit = await accountDeposit("scb");
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

module.exports.autoTransfer = async () => {
    const resTrans = await checkBalance();
    const resSetting = await querySettingGame();

    console.log(resTrans);
    let sts = resSetting.result[2].sts;
    let amount = resSetting.result[2].value;

    if (sts == 1) {
        if (resTrans > amount) {
            await withdrawExchange();
        }
    }
};

async function withdrawExchange() {
    /**======================api scb============================ */
    let accDeposit;
    let dataDepositBank;
    let dataWithdrawBank;
    if (data.type == 0) {
        accDeposit = await accountDeposit("scb");
        dataWithdrawBank = await accountWithdraw("scb");
        dataWithdrawBank = dataWithdrawBank.result[0].accnum;
    } else {
        accDeposit = await accountWithdraw("scb");
        dataDepositBank = await accountDeposit("scb");
        dataWithdrawBank = dataDepositBank.result[0].accnum;
    }

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

module.exports.depositAutoTransaction = async () => {
    const resTrans = await handleGetTransaction();
    if (resTrans.status) {
        for (const item of resTrans.data.txnList) {
            const { code } = item.txnCode;
            //X1:deposit,X2:withdraw
            if (code === "X1") {
                //txnRemarkArr[0]:name bank,txnRemarkArr[1]:type bank (KBANK),txnRemarkArr[2]: account bank
                const txnRemarkArr = item.txnRemark.split(" ");
                const bankCode = findBankCodeFromStr(txnRemarkArr);
                const bankCodeLower = bankCode.toLowerCase();
                let accountBank = getAccountBank(bankCodeLower, txnRemarkArr);
                console.log(`Bank Code:`, bankCodeLower);
                console.log(`ACCBank:`, accountBank);
                const dataDeposit = {
                    ...item,
                    bankCode: bankCodeLower,
                    accountBank: accountBank,
                };

                const resCheckTransaction = await this.checkAutoTransaction(
                    dataDeposit
                );

                // console.log(resCheckTransaction)
                const { dataDeposit: checkDeposit, dataTransaction } = resCheckTransaction.data;
                // console.log(checkDeposit)
                if (resCheckTransaction.status) {
                    //create new wallet
                    const resCreateWallet = await handleCreateWallet(
                        dataTransaction[0].id,
                        checkDeposit.memberId,
                        dataDeposit.txnAmount
                    );
                    handleLogDepositWallet(resCreateWallet, item);
                } else {
                    //create new wallet and transaction
                    console.log(checkDeposit)
                    const dataTrans = {
                        username: checkDeposit.username,
                        type: "1",
                        amount: parseInt(dataDeposit.txnAmount),
                        transaction_date: moment(dataDeposit.txnDateTime).format(
                            "YYYY-MM-DD HH:mm"
                        ),
                        stats: 0,
                        pro_id: 0,
                        date_new: moment(dataDeposit.txnDateTime).format("YYYY-MM-DD"),
                        response_api: JSON.stringify(dataDeposit),
                        remark: "SCB",
                    };

                    const resCreateTrans = await createTrans(dataTrans);
                    //create wallet
                    if (resCreateTrans.result.insertId) {
                        console.log(`AccBank:`, accountBank);
                        let data_setting = await querySettingLine();
                        let token_deposit = data_setting.result[0].token_line_depo;
                        let messageLineNotify = "";
                        messageLineNotify += `\n😍▶สมาชิกแจ้งฝากเงิน◀😍`;
                        messageLineNotify += "\nสมาชิก => " + dataTrans.username;
                        messageLineNotify += "\nชื่อสมาชิก => " + checkDeposit.fname;
                        messageLineNotify += "\nธนาคารลูกค้า => " + bankCodeLower;
                        messageLineNotify += "\nเลขบัญชี => " + checkDeposit.accnum;
                        messageLineNotify +=
                            "\nจำนวนเงินที่ฝาก => " + dataTrans.amount + " บาท";
                        messageLineNotify += "\nสถานะ => ฝากสำเร็จแล้ว";
                        messageLineNotify += "\nเวลา => " + dataTrans.transaction_date;
                        messageLineNotify += "\nSystem => System Auto";
                        sendMessageLineNotify(token_deposit, messageLineNotify);
                        const resCreateWallet = await handleCreateWallet(
                            resCreateTrans.result.insertId,
                            checkDeposit.memberId,
                            dataDeposit.txnAmount
                        );
                        handleLogDepositWallet(resCreateWallet, item);
                    }
                }
            }
            await delay(500);
        }
    }
};

async function handleCreateWallet(refId, memberId, amount) {
    const statusWallet = await checkWalletTypeTrans(refId);
    if (!statusWallet) {
        const walletBalance = await getBalanceWallet(memberId);
        let balanceMember = 0;
        if (walletBalance.status && walletBalance.result.length > 0) {
            balanceMember = walletBalance.result[0].balance;
        }
        const sumBalance = parseFloat(balanceMember) + parseInt(amount);
        const dataWallet = {
            memberId: memberId,
            amount: parseInt(amount),
            balance: sumBalance,
            walletType: "deposit",
            refTable: "transaction",
            refId: refId,
            createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            sts: "1",
        };
        await createWallet(dataWallet);
        return true;
    } else {
        return false;
    }
}

module.exports.createWalletTrasaction = async (
    memberId,
    walletType = "deposit",
    refId,
    refTable,
    amount,
    sts
) => {
    try {
        const walletBalance = await getBalanceWallet(memberId);
        let balanceMember = 0;
        if (walletBalance.status && walletBalance.result.length > 0) {
            balanceMember = walletBalance.result[0].balance;
        }
        const sumBalance = parseFloat(balanceMember) + parseInt(amount);
        const dataWallet = {
            memberId: memberId,
            amount: parseInt(amount),
            balance: sumBalance,
            walletType,
            refTable: refTable,
            refId: refId,
            createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            updatedAt: sts === 1 ? dayjs().format("YYYY-MM-DD HH:mm:ss") : "",
            sts: sts,
        };

        await createWallet(dataWallet);
        return true;
    } catch (error) {
        return false;
    }
};
module.exports.checkAutoTransaction = async (dataDeposit) => {
    const { bankCode, accountBank } = dataDeposit;
    const findAccountMember = await findMemberBank(bankCode, accountBank);
    if (findAccountMember.status && findAccountMember.result.length === 1) {
        const fname = findAccountMember.result[0].name;
        const accnum = findAccountMember.result[0].accnum;
        const username = findAccountMember.result[0].username;
        const memberId = findAccountMember.result[0].id;
        dataDeposit = {
            ...dataDeposit,
            accnum,
            fname,
            username,
            memberId,
        };
        const dataCheDeposit = {
            username: dataDeposit.username,
            txnDateTime: dayjs(dataDeposit.txnDateTime).format("YYYY-MM-DD HH:mm") + ":00",
            txnAmount: parseInt(dataDeposit.txnAmount),
        };
        // console.log(dataCheDeposit);
        // const dataCheDeposit2 = {
        //     username: dataDeposit.username,
        //     txnDateTime: moment(dataDeposit.txnDateTime).format('YYYY-MM-DD HH:mm:ss'),
        //     txnAmount: dataDeposit.txnAmount,
        // };
        // console.log(dataCheDeposit2);
        const findTrasaction = await checkDepositTrans(dataCheDeposit);
        if (findTrasaction.result.length === 0) {
            return {
                status: false,
                data: {
                    dataDeposit,
                    dataTransaction: null,
                },
            };
        } else {
            return {
                status: true,
                data: {
                    dataDeposit,
                    dataTransaction: findTrasaction.result,
                },
            };
        }
    } else if (findAccountMember.status && findAccountMember.result.length >= 2) {
        let usernameDiff = "";
        let result = false;
        for (let i = 0; i < findAccountMember.result.length; i++) {
            if (usernameDiff == "") {
                usernameDiff += findAccountMember.result[i].username;
            } else {
                usernameDiff += "," + findAccountMember.result[i].username;
            }

            const username = findAccountMember.result[i].username;
            const memberId = findAccountMember.result[i].id;
            dataDeposit = {
                ...dataDeposit,
                username,
                memberId,
            };
            const dataCheDeposit = {
                username: dataDeposit.username,
                txnDateTime: dayjs(dataDeposit.txnDateTime).format("YYYY-MM-DD HH:mm") + ":00",
                txnAmount: parseInt(dataDeposit.txnAmount),
            };
            const findTrasaction = await checkDepositTransWait(dataCheDeposit);
            if (findTrasaction.result.length === 0) {
                result = true;
            }
        }
        if (!result) {
            const username = usernameDiff;
            dataDeposit = {
                ...dataDeposit,
                username,
            };
            const dataCheDeposit = {
                username: dataDeposit.username,
                txnDateTime: dayjs(dataDeposit.txnDateTime).format("YYYY-MM-DD HH:mm") + ":00",
                txnAmount: parseInt(dataDeposit.txnAmount),
            };
            const findTrasactions = await checkDepositTransWait(dataCheDeposit);
            if (findTrasactions.result.length === 0) {
                const dataTrans = {
                    username: usernameDiff,
                    type: "1",
                    amount: dataDeposit.txnAmount,
                    transaction_date: dayjs(dataDeposit.txnDateTime).format(
                        "YYYY-MM-DD HH:mm"
                    ),
                    stats: 1,
                    pro_id: 0,
                    date_new: dayjs(dataDeposit.txnDateTime).format("YYYY-MM-DD"),
                    response_api: JSON.stringify(dataDeposit),
                    remark: "SCB",
                };
                const resCreateTrans = await createTrans(dataTrans);
            }
            //create new wallet and transaction
        }
        return { status: false, data: {} };
    } else {
        return { status: false, data: {} };
    }
};

module.exports.checkPomotion = async (memberId) => {
    const walletBalance = await getBalanceWallet(memberId);
    if (walletBalance.result.length <= 0) {
        return false;
    }
    const resPromotion = await findPomotionById(memberId);
    if (resPromotion.result.length > 0) {
        let sumPromotion = 0;
        resPromotion.result.forEach((ele) => {
            sumPromotion += ele.pro_amount;
        });
        const total = walletBalance - sumPromotion;
        return total > 0;
    } else {
        return true;
    }
};

module.exports.getBalanceAfterCheckPomotion = async (memberId) => {
    const walletBalance = await getBalanceWallet(memberId);
    if (walletBalance.result.length <= 0) {
        return 0;
    }
    const resPromotion = await findPomotionById(memberId);
    if (resPromotion.result.length > 0) {
        let sumPromotion = 0;
        resPromotion.result.forEach((ele) => {
            sumPromotion += ele.pro_amount;
        });
        return walletBalance.result[0].balance - sumPromotion;
    } else {
        return walletBalance.result[0].balance;
    }
};

module.exports.getBalanceAfterCheckPomotion1 = async (memberId) => {
    const walletBalance = await getBalanceWallet(memberId);
    if (walletBalance.result.length <= 0) {
        return 0;
    }
    const resPromotion = await findPomotionById(memberId);
    console.log("resPromotion.result.length", resPromotion.result.length);
    if (resPromotion.result.length > 0) {
        let sumPromotion = 0;
        resPromotion.result.forEach((ele) => {
            sumPromotion += ele.pro_amount;
        });
        return sumPromotion - walletBalance.result[0].balance;
    } else {
        return walletBalance.result[0].balance;
    }
};

module.exports.addCreditLotto = async (req, res) => {
    let responeData = {};
    await delay(getRndInteger(500, 1000))
    try {
        let checkspam = await checkSpam(`${req.body}lotto`);
        if (!checkspam.status) {
            responeData.data = 'You are spam';
            responeData.statusCode = httpStatusCodes.Fail.fail.code;
            responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        } else {
            const { member_id: memberUsername } = req.body;
            const memberId = await findMemberIdByUsername(memberUsername);
            const walletBalance = await this.getBalanceAfterCheckPomotionToLotto(
                memberId.result[0].id
            );

            const resAdmin = await getAdminByMappingApi("auth_lottohouse");

            if (resAdmin.status && walletBalance >= 0) {
                const { username, password } = resAdmin.result[0];
                const objLottoHoust = new lottoHouse(username, password);
                const usernameLotto = await queryFindMemberByMember(
                    memberUsername,
                    "lottohouse"
                );

                const resAddCreditLotto = await objLottoHoust.addCreditLottoHouse(
                    walletBalance,
                    usernameLotto.result[0].username
                );

                if (resAddCreditLotto.data.status) {
                    await this.createWalletTrasaction(
                        memberId.result[0].id,
                        "withdraw",
                        "0",
                        "lotto", -1 * walletBalance,
                        1
                    );
                }

                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.description = "add credit success";
            } else {
                responeData.statusCode = httpStatusCodes.Success.ok.code;
                responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                responeData.description = "add credit fail";
            }
        }

    } catch (error) {
        console.log("🚀 ~ file: wallet.controller.js:576 ~ module.exports.addCreditLotto=async ~ error:", error)
        responeData.statusCode = httpStatusCodes.Fail.fail.code;
        responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
        responeData.description = "add credit faild";
    }

    return res.send(responeData);
};

module.exports.getBalanceAfterCheckPomotionToLotto = async (memberId) => {
    const walletBalance = await getBalanceWallet(memberId);
    if (walletBalance.result.length <= 0) {
        return 0;
    }
    const resPromotion = await findPomotionById1(memberId);
    if (resPromotion.result.length > 0) {
        let sumPromotion = 0;
        resPromotion.result.forEach((ele) => {
            sumPromotion += ele.pro_amount - ele.wallet_balance;
        });
        return walletBalance.result[0].balance - sumPromotion;
    } else {
        return walletBalance.result[0].balance;
    }
};

async function CheckCreditUFA(userUFA) {
    var data = qs.stringify({
        code: "8483Auto",
        user: userUFA,
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/view_credit_ufa",
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

async function MinusCreditUFA(userUFA, amount) {
    var data = qs.stringify({
        code: "8483Auto",
        username: userUFA,
        amount: amount,
    });
    var config = {
        method: "post",
        url: site.url + "/apibackend/minus_creditt_ufa",
        data: data,
    };

    return axios(config)
        .then(function (response) {
            return response;
        })
        .catch(function (error) {
            console.log(error);
        });
}

module.exports.testCredit = async (req, res) => {
    let responeData = {};
    let result = await CheckCreditUFA(req.body.userUFA);
    responeData.data = result;
    res.send(result);
};

module.exports.checkCreditLotto = async (req, res) => {
    let responeData = {};
    // try {
    const { member_id: memberUsername } = req.body;
    const memberId = await findMemberIdByUsername(memberUsername);
    const walletBalance = await this.getBalanceAfterCheckPomotion1(
        memberId.result[0].id
    );

    const resAdmin = await getAdminByMappingApi("auth_lottohouse");
    const state_web = await querySettingGame();
    let state_ufa = await state_web.result.find(ss => ss.game === 'ufa')
    let state_lotto = await state_web.result.find(ss => ss.game === 'lotto')
    // console.log("🚀 ~ file: wallet.controller.js:662 ~ module.exports.checkCreditLotto=async ~ state_ufa:", state_ufa)

    if (resAdmin.status && walletBalance >= 0) {
        // if (state_web.result.length == 1) let [state_ufa, state_lotto] = [state_web.result[0].ufa, state_web.result[0].ufa]

        try {
            if (state_lotto.sts) {
                const { username, password } = resAdmin.result[0];
                const objLottoHoust = new lottoHouse(username, password);
                const usernameLotto = await queryFindMemberByMember(memberUsername, "lottohouse");
                const resCheckCreditLotto = await objLottoHoust.checkCreditLottoHouse(usernameLotto.result[0].username);
                if (resCheckCreditLotto.data.status) {
                    let creditLotto = parseFloat(resCheckCreditLotto.data.result);
                    const resWithdrawCreditLotto =
                        await objLottoHoust.withdrawCreditLottoHouse(
                            creditLotto,
                            usernameLotto.result[0].username
                        );
                    if (resWithdrawCreditLotto.data.status) {
                        await this.createWalletTrasaction(
                            memberId.result[0].id,
                            "deposit",
                            "0",
                            "lotto",
                            creditLotto,
                            1
                        );
                        responeData.lotto = "success";
                    } else {
                        responeData.statusCode = httpStatusCodes.Success.ok.code;
                        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                        responeData.description = "minus credit fail";
                        responeData.lotto = "fail";
                    }
                } else {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.description = "minus credit fail";
                    responeData.lotto = "fail";
                }

            }
        } catch (error) {
            console.log(`minus credit fail 1 ${error}`)
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.description = "minus credit fail";
            responeData.ufa = "fail";
            responeData.lotto = "fail";
        }
        try {
            if (state_ufa.sts) {
                let old_credit = await global.ufa.checkCredit(req.body.userUFA)
                // let resUFA = await CheckCreditUFA(req.body.userUFA);
                // console.log(req.body.userUFA);
                // console.log(resUFA);
                if (old_credit) {
                    if (old_credit.current_credit != 0) {
                        let resUFAMinus = await global.ufa.delCredit(req.body.userUFA, old_credit.current_credit);
                        if (resUFAMinus.status) {
                            await this.createWalletTrasaction(
                                memberId.result[0].id,
                                "deposit",
                                "0",
                                "exchange",
                                old_credit.current_credit,
                                1
                            );
                            responeData.ufa = "success";
                        } else {
                            responeData.statusCode = httpStatusCodes.Success.ok.code;
                            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                            responeData.description = "minus credit fail";
                            responeData.ufa = "fail222";
                        }
                    }
                    
                    
                } else {
                    responeData.statusCode = httpStatusCodes.Success.ok.code;
                    responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
                    responeData.description = "minus credit fail";
                    responeData.ufa = "fail";
                }

            }

            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.description = "minus credit success";
        } catch (error) {
            console.log(`minus credit fail 2${error}`)
            responeData.statusCode = httpStatusCodes.Success.ok.code;
            responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
            responeData.description = "minus credit fail";
            responeData.ufa = "fail";
            responeData.lotto = "fail";
        }


        // if (resCheckCreditLotto.data.status && resUFA.msg == "Success" && resUFA.data != null) {
        //     let creditLotto = parseFloat(resCheckCreditLotto.data.result);
        //     const resWithdrawCreditLotto =
        //         await objLottoHoust.withdrawCreditLottoHouse(
        //             creditLotto,
        //             usernameLotto.result[0].username
        //         );
        //     if (resWithdrawCreditLotto.data.status) {
        //         await this.createWalletTrasaction(
        //             memberId.result[0].id,
        //             "deposit",
        //             "0",
        //             "lotto",
        //             creditLotto,
        //             1
        //         );
        //         responeData.lotto = "success";
        //     } else {
        //         responeData.statusCode = httpStatusCodes.Success.ok.code;
        //         responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        //         responeData.description = "minus credit fail";
        //         responeData.lotto = "fail";
        //     }
        //     // UFA
        //     let amount_s = resUFA.data.balance;
        //     let res_amount = amount_s.split(",");
        //     let amount = parseFloat(res_amount[0] + res_amount[1]);
        //     let resUFAMinus = await MinusCreditUFA(req.body.userUFA, amount);
        //     if (resUFAMinus.data.status) {
        //         if (amount != 0) {
        //             await this.createWalletTrasaction(
        //                 memberId.result[0].id,
        //                 "deposit",
        //                 "0",
        //                 "exchange",
        //                 amount,
        //                 1
        //             );
        //         }
        //         responeData.ufa = "success";
        //     } else {
        //         responeData.statusCode = httpStatusCodes.Success.ok.code;
        //         responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        //         responeData.description = "minus credit fail";
        //         responeData.ufa = "fail";
        //     }
        //     // UFA
        //     responeData.statusCode = httpStatusCodes.Success.ok.code;
        //     responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        //     responeData.description = "minus credit success";
        // } else {
        //     responeData.statusCode = httpStatusCodes.Success.ok.code;
        //     responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        //     responeData.description = "minus credit fail";
        //     responeData.ufa = "fail";
        //     responeData.lotto = "fail";
        // }
    } else {
        responeData.statusCode = httpStatusCodes.Success.ok.code;
        responeData.statusCodeText = httpStatusCodes.Success.ok.codeText;
        responeData.description = "minus credit fail";
    }
    // } catch (error) {
    //     responeData.statusCode = httpStatusCodes.Fail.fail.code;
    //     responeData.statusCodeText = httpStatusCodes.Fail.fail.codeText;
    //     responeData.description = "add credit faild";
    // }

    return res.send(responeData);
};
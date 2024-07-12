const model = require("../models/utility.model");
const httpCode = require("../../constants/httpStatusCodes");


module.exports.MemberTrueWallet = async(data) => {
    // const sql = "SELECT * FROM member WHERE accnum = '" + data.accnum + "' AND name LIKE'" + data.name + "%' AND bank = 'truewallet'"
    const sql = `SELECT * FROM member WHERE (accnum = '${data.accnum}' OR name LIKE '${data.name}%' ) AND bank = 'truewallet'`
    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('MemberTrueWallet have error :', error);
    }
}

module.exports.MemberTrueWallet2 = async(data) => {
    const sql = `SELECT * FROM member WHERE accnum = '${data.accnum}' OR username = '${data.username}'`
    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('MemberTrueWallet2 have error :', error);
    }
}

module.exports.queryTransactionByTrueWallet = async(data) => {
    // console.log(data);
    const sql = "SELECT * FROM transaction WHERE member_username = '" + data.member_username + "' AND type = 1 AND amount = " + data.amount + " AND transaction_date = '" + data.transaction_date + "' AND (stats = 0 OR stats = 1)"
    try {
        const result = await model.insertOne(sql)
        if (result.length == 0) {
            return false;
        } else {
            return true;
        }
        // return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryTransactionByTrueWallet have error :', error);
        return false;
    }
}


module.exports.queryTransactionByTrueWalletNoUser = async(data) => {
    const sql = "SELECT * FROM transaction WHERE member_username = '' AND type = 1 AND amount = " + data.amount + " AND transaction_date = '" + data.transaction_date + "' AND (stats = 0 OR stats = 1)"
    try {
        const result = await model.insertOne(sql)
            // if (result.length == 0) {
            //     return false;
            // } else {
            //     return true;
            // }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryTransactionByTrueWalletNoUser have error :', error);
        return false;
    }
}

module.exports.checkAccTrue = async(data) => {
    const sql = `select type from account_bank where type = 'truewallet' and status = 1`;
    try {
        const result = await model.insertOne(sql)
            // if (result.length > 0) {
            //     return { status: true, statusCode: httpCode.Success.ok.codeText, result: result[0] };
            // } else {
            //     return true;
            // }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryTransactionByTrueWalletNoUser have error :', error);
        return false;
    }
}
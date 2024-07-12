const model = require("../models/utility.model");
const httpCode = require("../../constants/httpStatusCodes");
module.exports.accountWithdraw = async(type) => {
    const sql = `SELECT
                      *
                  FROM
                  acc_withdraw ab
                  WHERE ab.status = '1'  AND ab.type = '${type}'
                 `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountWithdraw have error :", error);
    }
};
module.exports.queryMemberWithdraw = async(req) => {
    const sql = "SELECT *,transaction.id AS tid FROM transaction LEFT JOIN member ON transaction.member_username = member.username LEFT JOIN bank ON member.bank = bank.bank_id WHERE type = 0  AND stats = 1 AND amount >= " + req.min + "  AND amount <= " + req.max + ""
    try {
        const result = await model.queryOne(sql)
        if (result && result.length) {
            return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
        } else {
            return { status: true, statusCode: httpCode.Success.noContent.codeText, result: result }
        }
    } catch (error) {
        console.log('queryMemberWithdraw have error :', error);
        return { status: false, statusCode: httpCode.Fail.serviceUnavailable.codeText, result: [] }
    }
}

module.exports.querySettingLine = async(req) => {
    const sql = "SELECT * FROM seting "
    try {
        const result = await model.queryOne(sql)
        if (result && result.length) {
            return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
        } else {
            return { status: true, statusCode: httpCode.Success.noContent.codeText, result: result }
        }
    } catch (error) {
        console.log('querySettingLine have error :', error);
        return { status: false, statusCode: httpCode.Fail.serviceUnavailable.codeText, result: [] }
    }
}

module.exports.querySetting = async(req) => {
    const sql = "SELECT * FROM setting_auto_withdraw "
    try {
        const result = await model.queryOne(sql)
        if (result && result.length) {
            return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
        } else {
            return { status: true, statusCode: httpCode.Success.noContent.codeText, result: result }
        }
    } catch (error) {
        console.log('queryMemberWithdraw have error :', error);
        return { status: false, statusCode: httpCode.Fail.serviceUnavailable.codeText, result: [] }
    }
}
module.exports.insertLogAutoWithdraw = async(req) => {
    const sql = "INSERT INTO `auto_withdraw`(`id`, `member_username`, `bank_name`, `bank_acc`, `name`, `amount`, `date`,`date_new`)" +
        "VALUES (null,'" + req.username + "','" + req.bank + "','" + req.bankacc + "','" + req.name + "'," + req.amount + ",'" + req.date + "','" + req.date_new + "')"
    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('insertLogAutoWithdraw have error :', error);
    }
}

module.exports.updateTransaction = async(req) => {
    const sql = "UPDATE transaction SET stats = 3 , remark = '" + req.remark + "' ,response_api = '" + req.response + "', created_by = 'Auto' WHERE id = " + req.id
    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('updateTransaction have error :', error);
    }
}

module.exports.queryAmountToday = async(req) => {
    const sql = "SELECT COALESCE(SUM(amount),0) AS amount FROM auto_withdraw WHERE date_new = '" + req.date + "'"
    try {
        const result = await model.queryOne(sql)
        if (result && result.length) {
            return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
        } else {
            return { status: true, statusCode: httpCode.Success.noContent.codeText, result: result }
        }
    } catch (error) {
        console.log('queryMemberWithdraw have error :', error);
        return { status: false, statusCode: httpCode.Fail.serviceUnavailable.codeText, result: [] }
    }
}

module.exports.insertLogTurnover = async(req) => {
    const sql = "INSERT INTO `history_turnover`(`id`, `username`, `turnover`, `winloss`, `date`)" +
        "VALUES (null,'" + req.username + "','" + req.turnover + "','" + req.winloss + "','" + req.date + "')"
    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('insertLogTurnover have error :', error);
    }
}
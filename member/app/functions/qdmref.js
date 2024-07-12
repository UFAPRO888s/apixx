const model = require("../models/utility.model");
const modelLotto = require("../models/utilityLotto.model");
const httpCode = require("../../constants/httpStatusCodes");

// Aff api
module.exports.queryMemberRef = async(req) => {
    const sql = `SELECT member.id,member.username,parent.id AS ref_id,parent.username AS ref_name FROM member AS member left JOIN member AS parent ON member.ref = parent.id WHERE member.ref <> 0`
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoType have error :', error);
    }
}

module.exports.queryMemberDataAff = async(req) => {
    let where = '';
    let startDate = req.startDate ? req.startDate : false;
    let endDate = req.endDate ? req.endDate : false;

    if (startDate && endDate && startDate !== endDate) {
        where = `and lotto_date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (startDate === endDate && startDate !== false) {
        where = `and lotto_date LIKE '${startDate}'`;
    }
    const sql = `SELECT *,SUM(aff) AS sum_aff_amont FROM view_lotto_number_data_V2 WHERE data_flg <> 0 ${where} GROUP BY username, lotto_type ,lotto_date`
    try {
        const result = await modelLotto.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoType have error :', error);
    }
}

module.exports.queryMemberDataTurnovers = async(req) => {
    const sql = `SELECT * FROM history_turnover`
    try {
        const result = await modelLotto.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoType have error :', error);
    }
}

module.exports.queryMemberDataTurnover = async(req) => {
    let where = '';
    let startDate = req.startDate ? req.startDate : false;
    let endDate = req.endDate ? req.endDate : false;

    if (startDate && endDate && startDate !== endDate) {
        where = `WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (startDate === endDate && startDate !== false) {
        where = `WHERE date LIKE '${startDate}'`;
    }
    const sql = `SELECT member.id,member.username,history_turnover.username,history_turnover.turnover,history_turnover.winloss,history_turnover.date FROM ufa_acc JOIN history_turnover ON ufa_acc.username = history_turnover.username JOIN member on ufa_acc.member_username = member.username ${where} order BY history_turnover.date`
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoType have error :', error);
    }
}
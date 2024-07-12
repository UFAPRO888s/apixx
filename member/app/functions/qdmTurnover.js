const model = require("../models/utility.model");
const httpCode = require("../../constants/httpStatusCodes");
module.exports.insertLogTurnover = async(req) => {
    //check empyty or update
    const sqlcheck = `SELECT * FROM history_turnover WHERE username = '${req.username}' AND date = '${req.date}'`;
    // console.log(sql);
    try {
        const result_check = await model.insertOne(sqlcheck)
        let sql = "";
        if (result_check.length == 0) {
            sql = `INSERT INTO history_turnover (username, turnover, winloss, date) VALUES 
			('${req.username}', '${req.turnover}', '${req.winloss}', '${req.date}')`;
        } else {
            sql = `UPDATE history_turnover SET turnover = '${req.turnover}', winloss = '${req.winloss}' WHERE username = '${req.username}' AND date = '${req.date}'`;
        };
        // console.log(sql);
        try {
            const result = await model.insertOne(sql)
            return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
        } catch (error) {
            console.log('insertLogTurnover have error :', error);
        }
    } catch (error) {
        console.log('insertLogTurnover have error :', error);
    }

    // const sql = `INSERT INTO history_turnover (username, turnover, winloss, date) VALUES 
    // ('${req.username}', '${req.turnover}', '${req.winloss}', '${req.date}') ON DUPLICATE KEY UPDATE turnover = (case when username = values(username) then (case date = values(date) then values(turnover) else turnover end) else turnover end)
    // , winloss = (case when username = values(username) then (case date = values(date) then values(winloss) else winloss end) else winloss end)`;
    // // ON DUPLICATE KEY UPDATE date = (case when status = 0 then values(date) else date end), status = (case when status = 0 then values(status) else status end)
    // console.log(sql);

}

module.exports.insertLogDataAff = async(req) => {
    const sqlcheck = `SELECT * FROM data_aff WHERE member_id = '${req.id}' AND date = '${req.date}'`;
    try {
        const result_check = await model.insertOne(sqlcheck)
        let sql = "";
        if (result_check.length == 0) {
            sql = `INSERT INTO data_aff (member_id, date, amount,type) VALUES 
			('${req.id}', '${req.date}', '${req.turnover}', 'game')`;
        } else {
            sql = `UPDATE data_aff SET amount = '${req.turnover}' WHERE member_id = '${req.id}' AND date = '${req.date}'`;
        };
        // console.log(sql);
        try {
            const result = await model.insertOne(sql)
            return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
        } catch (error) {
            console.log('insertLogTurnover have error :', error);
        }
    } catch (error) {
        console.log('insertLogTurnover have error :', error);
    }
}
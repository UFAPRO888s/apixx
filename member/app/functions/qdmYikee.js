const model = require("../models/utilityLotto.model");
const httpCode = require("../../constants/httpStatusCodes");
const md5 = require('md5');
const redis = require('redis');
// const Redis = require("ioredis");

const client = redis.createClient({
    url: process.env.HOST_REDIS || null
});
client.on('error', err => console.log('Redis Client Error', err));
client.connect();

async function checkCache(key) {
    let name = process.env.WEBNAME
    let hashKey = md5(`${name}${key}`);
    // console.log(hashKey)
    const data = await client.get(hashKey, (err, result) => {
        if (err) {
            return false
        } else {
            return result;
        }
    });
    return JSON.parse(data);
}

async function saveCache(key, value, timeCahche = 300) {
    let name = process.env.WEBNAME
    let hashKey = md5(`${name}${key}`);
    await client.setEx(hashKey, timeCahche, JSON.stringify(value));
    return value;
}

module.exports.queryDateYikee = async(data) => {
    const sql = `SELECT * FROM tb_lotto_type WHERE lotto_group_id = 7 AND (time_close BETWEEN '${data.startTime}' AND '${data.endTime}')`;

    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 3600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryDateYikee have error :', error);
    }
}
module.exports.queryNumberData = async(data) => {
    const sql = `SELECT * FROM tb_lotto_number_data INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.id = tb_lotto_number_data.lotto_reward_type WHERE lotto_type = '${data.lotto_type}' AND lotto_date = '${data.lotto_date}'`;

    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryNumberData have error :', error);
    }
}


module.exports.insertResultLottoYikee = async(data) => {
    const sql = `INSERT INTO tb_lotto_result(lotto_type,three_up,three_tod,two_up,two_down,run_up,run_down,label,date_time_closed,result_date,time,date_time_add,user_add,flag)
    VALUE('${data.lotto_type}','${data.three_up}','${data.three_tod}','${data.two_up}','${data.two_down}','${data.run_up}','${data.run_down}','general','${data.date_time_closed}','${data.result_date}','${data.time}','${data.date_time_add}',2,1)`;

    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('insertResultLottoYikee have error :', error);
    }
}
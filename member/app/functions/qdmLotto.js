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
module.exports.deleteLogToken = async(id) => {
    const sql = "DELETE FROM log_token WHERE id = " + id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteLogToken have error :", error);
    }
};
module.exports.queryLogToken = async(token) => {
    const sql = "SELECT * FROM log_token WHERE token = '" + token + "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLogToken have error :", error);
    }
};

module.exports.findJoinLottoGroupStockList = async() => {
    const sql = `SELECT lt.id, lt.lotto_name AS name, CONCAT('/member/bet/', lt.id) AS link, 
                            DATE_FORMAT(lt.lotto_date,'%Y-%m-%d') AS date, 
                            DATE_FORMAT(lt.lotto_date_open, '%H:%i:%s') AS open, lt.time_close AS close,
                            CASE 
                            WHEN DATE_FORMAT(Concat(lotto_date, ' ' , lt.time_close), '%Y-%m-%d %H:%i:%s') < DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s')  THEN
                                        'ยังไม่มีงวดถัดไป'
                                WHEN DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') < lt.lotto_date_open  THEN
                                        'เปิดอีก'
                                ELSE
                                        'ปิดอีก'
                            END AS status,
                            lt.lotto_group_id AS group_id ,
                            lg.group_name AS type,
                            lt.lotto_image AS logo
                    FROM 	tb_lotto_type lt LEFT JOIN tb_lotto_group lg 
                            ON lt.lotto_group_id = lg.lotto_group_id
					WHERE lt.sts = 1`;
    try {
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 1800);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('findJoinLottoGroupStockList have error :', error);
    }

}

module.exports.findAll = async() => {
    const sql = `SELECT * FROM tb_lotto_group`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('findAll have error :', error);
    }

}


module.exports.findCreditBalance = async(id) => {
    const sql = `SELECT credit_balance FROM tb_users WHERE id = ` + id;
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('findCreditBalance have error :', error);
    }

}
module.exports.memberAuth = async(data) => {
    const sql = `SELECT * FROM tb_users INNER JOIN tb_users_type ON tb_users_type.id = tb_users.type_user WHERE tb_users.id = ${data.id} AND tb_users.username = '${data.name}'`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 1800);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('memberAuth have error :', error);
    }

}

module.exports.queryBillConfig = async() => {
    const sql = `SELECT * FROM tb_bill_config`;

    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 3600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryBillConfig have error :', error);
    }
}


module.exports.queryRewardGroupByLottoID = async(data) => {
    const sql = `SELECT * FROM tb_lotto_type WHERE id = ${data}`;

    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryRewardGroupByLottoID have error :', error);
    }
}

module.exports.queryRewardGroupID = async(data) => {
    const sql = `SELECT * FROM tb_lotto_reward_type WHERE reward_name = '${data.reward_name}' AND reward_group_id = ${data.rewardGroup}`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryRewardGroupID have error :', error);
    }

}

module.exports.checkLottoLimit = async(data) => {
    const sql = `SELECT * FROM tb_lotto_reward_config WHERE lotto_type = '${data.lotto_type}' AND lotto_reward_type = '${data.lotto_reward_type}' AND user_id = '2'`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('checkLottoLimit have error :', error);
    }
}


module.exports.checkDepriveLotto = async(data) => {
    const sql = `SELECT * FROM tb_lotto_deprive WHERE lotto_type = '${data.lotto_type}' AND lotto_reward_type = '${data.lotto_reward_type}' AND number = '${data.number}' AND lotto_date = '${data.lotto_date}'`;
    try {
        const result = await model.queryOne(sql)
            // let result = await checkCache(md5(sql))
            // if (!result) {
            //     const data = await model.queryOne(sql)
            //     result = await saveCache(md5(sql), data, 600);
            // }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('checkDepriveLotto have error :', error);
    }
}

module.exports.checkSumAmountNumber = async(data) => {
    const sql = `SELECT COALESCE(SUM(amount),0) AS amount,numbers FROM tb_lotto_number_data WHERE numbers = '${data.number}' AND lotto_type = ${data.lotto_type} AND lotto_reward_type = ${data.lotto_reward_type} AND lotto_date = '${data.lotto_date}'`;
    try {
        const result = await model.queryOne(sql)
            // let result = await checkCache(md5(sql))
            // if (!result) {
            //     const data = await model.queryOne(sql)
            //     result = await saveCache(md5(sql), data, 3600);
            // }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('checkSumAmountNumber have error :', error);
    }
}

module.exports.checkFightMax = async(data, sum) => {
    const sql = `SELECT * FROM tb_lotto_reward_config_limit WHERE lotto_type = '${data.lotto_type}' AND lotto_reward_type = ${data.lotto_reward_type} and min <= ${sum} and max >= ${sum} order by min asc`;
    try {
        const result = await model.queryOne(sql)
            // let result = await checkCache(md5(sql))
            // if (!result) {
            //     const data = await model.queryOne(sql)
            //     result = await saveCache(md5(sql), data, 600);
            // }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('checkFightMax have error :', error);
    }
}


module.exports.checkRatePay = async(data) => {
    const sql = `SELECT * FROM tb_lotto_reward_config_limit WHERE lotto_type = '${data.lotto_type}' AND lotto_reward_type = ${data.lotto_reward_type} AND min <= ${data.sum} AND max >= ${data.sum}`;
    try {
        const result = await model.queryOne(sql)
            // let result = await checkCache(md5(sql))
            // if (!result) {
            //     const data = await model.queryOne(sql)
            //     result = await saveCache(md5(sql), data, 600);
            // }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('checkRatePay have error :', error);
    }
}

module.exports.insertLottoNumber = async(data) => {
    const sql = `INSERT INTO tb_lotto_number_data (user_id, lotto_reward_type, lotto_type, order_id, numbers, amount, lotto_date, reward, comm, winner_amount,aff) 
                 VALUES (${data.user_id}, '${data.lotto_reward_type}', '${data.lotto_type}', '${data.orderID}', '${data.numbers}', '${data.amount}', '${data.lotto_date}', '${data.reward}', 0, '${data.winner_amount}','${data.aff}')`
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('insertLottoNumber have error :', error);
    }
}


module.exports.insertOrder = async(data) => {
    const sql = `INSERT INTO tb_order (order_num,note, user_id, lottery_type, lottery_date, datetime_created,cr_date) 
                 VALUES ('${data.order_num}','${data.note}', '${data.user_id}', '${data.lottery_type}', '${data.lottery_date}', '${data.datetime_created}', '${data.cr_date}')`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('insertOrder have error :', error);
    }
}


module.exports.insertLottoNumberDTL = async(data) => {
    const sql = `INSERT INTO tb_lotto_number_dtl (data_id,user_id, lotto_reward_type, lotto_type, order_id, numbers, amount, lotto_date, reward, comm, winner_amount,aff) 
                 VALUES (${data.data_id},${data.user_id}, '${data.lotto_reward_type}', '${data.lotto_type}', '${data.orderID}', '${data.numbers}', ${data.amount}, '${data.lotto_date}', '${data.reward}', 0, ${data.winner_amount * -1},'${data.aff}')`
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('insertLottoNumberDTL have error :', error);
    }
}


module.exports.updateCredit = async(data) => {
    const sql = `UPDATE tb_users SET credit_balance = ${data.credit} WHERE id = ${data.id}`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('updateCredit have error :', error);
    }
}


module.exports.updateLottoConfig = async(data) => {
    const sql = `UPDATE tb_lotto_reward_config SET play_min = '${data.play_min}',play_max = '${data.play_max}',reward = '${data.reward}' WHERE id = ${data.id}`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('updateLottoConfig have error :', error);
    }
}

module.exports.updateLottoConfigLimit = async(data) => {
    const sql = `UPDATE tb_lotto_reward_config_limit SET reward = '${data.reward}',max = '${data.max}',min = '${data.min}' WHERE id = ${data.id}`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('updateLottoConfigLimit have error :', error);
    }
}

module.exports.queryLottoGroup = async() => {
    const sql = `SELECT * FROM tb_lotto_group`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoGroup have error :', error);
    }
}


module.exports.queryLottoGroupType = async(data) => {
    const sql = `SELECT * FROM tb_lotto_type`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoGroupType have error :', error);
    }
}

module.exports.findByLottoTypeTH = async(data) => {
    const sql = `SELECT r.id, r.three_up AS up3, r.two_up AS up2, r.two_down AS down2, CONCAT(r.three_front,',', r.three_back) AS down3, r.result_date AS date
    FROM tb_lotto_result r 
    WHERE r.lotto_type = 1 -- หวยไทย
    ORDER BY result_date DESC
    LIMIT 5`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 3600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('findByLottoTypeTH have error :', error);
    }
}


module.exports.findByDate = async(req) => {
    const sql = `SELECT 
    t.id AS lotto_id, t.lotto_name AS name, t.lotto_image AS logo, t.lotto_group_id, 
    g.group_name, r.result_date AS date,
    IF( NOW() > CONCAT(result_date, ' ', time), three_up, '-' ) AS up3,
    IF( NOW() > CONCAT(result_date, ' ', time), two_up, '-' ) AS up2,
    IF( NOW() > CONCAT(result_date, ' ', time), two_down, '-' ) AS down2
FROM    tb_lotto_result r LEFT JOIN tb_lotto_type t ON r.lotto_type = t.id
                LEFT JOIN tb_lotto_group g ON t.lotto_group_id = g.lotto_group_id
WHERE r.result_date = '${req.body.date}' AND t.id != 1
GROUP BY r.result_date, t.id
ORDER BY r.result_date`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 3600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('findByDate have error :', error);
    }
}



module.exports.queryHistoryBet = async(data) => {
    const sql = `SELECT SUM(tb_lotto_number_data.amount) AS sum,tb_order.order_num,tb_order.order_id,tb_order.datetime_created,tb_lotto_type.lotto_name,tb_lotto_number_data.lotto_date FROM tb_order INNER JOIN tb_lotto_type ON tb_lotto_type.id = tb_order.lottery_type INNER JOIN tb_lotto_number_data ON tb_lotto_number_data.order_id = tb_order.order_id WHERE tb_order.note = '${data.body.username}' AND (tb_order.cr_date BETWEEN '${data.body.start}' AND '${data.body.end}') AND tb_lotto_number_data.flag = ${data.body.flag} GROUP BY tb_order.datetime_created `;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryHistoryBet have error :', error);
    }
}

module.exports.queryHistoryBetByID = async(data) => {
    const sql = `SELECT SUM(tb_lotto_number_data.amount) AS sum,tb_order.order_num,tb_order.order_id,tb_order.datetime_created,tb_lotto_type.lotto_name,tb_lotto_type.id FROM tb_order INNER JOIN tb_lotto_type ON tb_lotto_type.id = tb_order.lottery_type INNER JOIN tb_lotto_number_data ON tb_lotto_number_data.order_id = tb_order.order_id WHERE tb_lotto_number_data.order_id = '${data.body.order_id}'`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryHistoryBet have error :', error);
    }
}

module.exports.queryHistoryBetDetail = async(data) => {
    const sql = `SELECT * FROM tb_order INNER JOIN tb_lotto_type ON tb_lotto_type.id = tb_order.lottery_type INNER JOIN tb_lotto_number_data ON tb_lotto_number_data.order_id = tb_order.order_id INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.id = tb_lotto_number_data.lotto_reward_type WHERE tb_order.order_id = '${data.body.order_id}'`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryHistoryBetDetail have error :', error);
    }
}

module.exports.queryLottoLimitMin = async(data) => {
    const sql = `SELECT * FROM tb_lotto_reward_config INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.id = tb_lotto_reward_config.lotto_reward_type  WHERE tb_lotto_reward_config.user_id = '2' AND tb_lotto_reward_config.lotto_type =  '${data.body.lotto_type}'`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoLimitMin have error :', error);
    }
}
module.exports.queryGetLottoNumberGroup = async(data) => {
    const sql = `SELECT * FROM tb_lotto_number_group WHERE user_id = ${data}`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data, 3600);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryGetLottoNumberGroup have error :', error);
    }
}


module.exports.GetLottoUser = async(data) => {
    const sql =
        `SELECT * FROM tb_users WHERE username = '${data}'`;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("GetLottoUser have error :", error);
    }
};
module.exports.queryGetLottoNumberDetail = async(req) => {
    const sql = `SELECT * FROM tb_lotto_number_group_data INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.reward_name = tb_lotto_number_group_data.lotto_reward_type_name  WHERE tb_lotto_number_group_data.group_number = ${req.body.id} AND tb_lotto_number_group_data.user_id = ${req.body.userid}`
        // console.log(sql);
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryGetLottoNumberDetail have error :', error);
    }
}


module.exports.queryCheckOrderNum = async(req) => {
    const sql = `SELECT * FROM tb_order ORDER BY order_id DESC LIMIT 1`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryCheckOrderNum have error :', error);
    }
}

module.exports.queryResultLottoByID = async(data) => {
    const sql = `SELECT three_up,three_tong,three_tod,two_down,two_up,run_down,run_up FROM tb_lotto_result WHERE lotto_type = '${data.lotto_id}' AND result_date = '${data.date}'`;
    // console.log(sql);
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryResultLottoByID have error :', error);
    }
}


module.exports.queryLottoWinnerFlag = async(data) => {
    const sql = `SELECT * FROM view_lotto_number_data_V2 WHERE lotto_date = '${data.date}' AND lotto_type = '${data.id}' AND data_flg = 2`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoWinnerFlag have error :', error);
    }
}

module.exports.queryLottoWaitFlag = async(data) => {
    const sql = `SELECT sum(amount) AS amount FROM view_lotto_number_data_V2 WHERE lotto_date = '${data.date}' AND lotto_type = '${data.id}' AND data_flg = 1`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoWaitFlag have error :', error);
    }
}


module.exports.queryLottoLostFlag = async(data) => {
    const sql = `SELECT sum(amount) AS lost FROM tb_lotto_number_data WHERE lotto_date = '${data.date}' AND id = '${data.id}' AND flag = 2 AND winner_flg = 0`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryLottoLostFlag have error :', error);
    }
}

module.exports.queryDataAffLotto = async(data) => {
    const sql = `select user_id,affiliate_rate,lotto_type from tb_lotto_reward_config where user_id = ${data} group by lotto_type`;
    try {
        // const result = await model.queryOne(sql)
        let result = await checkCache(md5(sql))
        if (!result) {
            const data = await model.queryOne(sql)
            result = await saveCache(md5(sql), data);
        }
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('queryDataAffLotto have error :', error);
    }
}

//cronLotto && yeekee

module.exports.queryLogCron = async(data) => {
    const sql = `select * from tb_z_log where crontime like '${data.crontime}%' and cronname ='${data.cronname}'`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, result: result };
    } catch (error) {
        console.log('queryLogCron have error :', error);
    }
}

module.exports.updateCronLotto = async(data) => {
    const sql = `UPDATE tb_lotto_type SET lotto_date = DATE_ADD(lotto_date,INTERVAL 1 DAY),lotto_date_open = DATE_ADD(now(),INTERVAL 1 MINUTE) WHERE auto_result = 0 AND lotto_group_id NOT IN (1,7)`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, result: result };
    } catch (error) {
        console.log('queryLogCron have error :', error);
    }
}

module.exports.updateCronYeekee = async(data) => {
    const sql = `UPDATE tb_lotto_type SET lotto_date = DATE_ADD(lotto_date,INTERVAL 1 DAY),lotto_date_open = now() ,date_updated = now() WHERE lotto_group_id = 7`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, result: result };
    } catch (error) {
        console.log('queryLogCron have error :', error);
    }
}

module.exports.updateLogCron = async(data) => {
    const sql = `INSERT INTO tb_z_log(cronname,crontime) VALUES('${data.cronname}',now())`;
    try {
        const result = await model.queryOne(sql)
        return { status: true, result: result };
    } catch (error) {
        console.log('queryLogCron have error :', error);
    }
}
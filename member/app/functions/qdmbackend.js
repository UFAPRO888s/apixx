const model = require("../models/utility.model");
const modelLotto = require("../models/utilityLotto.model");
const httpCode = require("../../constants/httpStatusCodes");
const md5 = require("md5");
const redis = require("redis");
const moment = require("moment");
// const Redis = require("ioredis");
let crypto = require("crypto");

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


const client = redis.createClient({
    url: process.env.HOST_REDIS || null,
});
client.on("error", (err) => console.log("Redis Client Error", err));
client.connect();

async function checkCache(key) {
    let name = process.env.WEBNAME;
    let hashKey = md5(`${name}${key}`);
    // console.log(hashKey)
    const data = await client.get(hashKey, (err, result) => {
        if (err) {
            return false;
        } else {
            return result;
        }
    });
    return JSON.parse(data);
}

async function saveCache(key, value, timeCahche = 300) {
    let name = process.env.WEBNAME;
    let hashKey = md5(`${name}${key}`);
    await client.setEx(hashKey, timeCahche, JSON.stringify(value));
    return value;
}

module.exports.checkSpam = async(token) => {
    try {

        let result = await checkCache(md5(token));
        if (!result) {
            result = await saveCache(md5(token), md5(token), 5);
            return {
                status: true,
            };
        } else {
            return {
                status: false,
            };
        }
    } catch (error) {
        console.log("checkSpam have error :", error);
    }
};

module.exports.testblob = async(token) => {
    const sql =
        "SELECT LOWER(CONVERT(ssssss USING utf8)) AS url_pic FROM test_sql";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("testblob have error :", error);
    }
};

module.exports.creditAFAll = async(token) => {
    const sql = `SELECT id,SUM(amount)AS sum_amont,state  FROM data_aff
    # WHERE member_id = 1
    # and type = lotto
    # and state = 0 #0=ยังไม่รับยอด,1=รับแล้ว
    # GROUP BY member_id`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("testblob have error :", error);
    }
};

module.exports.deleteWhiteListInDatabase = async(req) => {
    const sql =
        "DELETE FROM azael_dc_whitelisted WHERE identifier = '" +
        req.body.steamHex +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteWhiteListInDatabase have error :", error);
    }
};

module.exports.queryDataLogin = async(req) => {
    const sql = `SELECT * FROM admin WHERE username = '${req.body.username}'`
    try {
        const result = await model.queryOne(sql);
        // console.log(await aes256(result[0].password))
        if(result){
            return {
                status: true,
                statusCode: httpCode.Success.ok.codeText,
                result: result,
            };
        }else{
            return {
                status: false,
                statusCode: httpCode.Success.ok.codeText,
                result: [],
            };
        }

    } catch (error) {
        console.log("queryDataLogin have error :", error);
    }
};


module.exports.getAdminByMappingApi = async(mappingApi) => {
    const sql = `SELECT * FROM admin WHERE mapping_auth_api = '${mappingApi}'`;
    try {
        const result = await model.queryOne(sql);
        // let result = await checkCache(md5(sql))
        // if (!result) {
        //     const data = await model.queryOne(sql)
        //     result = await saveCache(md5(sql), data, 7200);
        // }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("getAdminByMappingApi have error :", error);
    }
};

module.exports.insertTokenTodatabase = async(req) => {
    const sql =
        "INSERT INTO log_token (id,token,ip_address) VALUES (null, '" +
        req.token +
        "','" +
        req.ip +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertTokenTodatabase have error :", error);
    }
};

//######################################## NAV BAR //########################################

module.exports.count_withdraw = async() => {
    const sql =
        "SELECT count(*) AS count FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank WHERE transaction.stats = 1 AND transaction.type = 0";
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("count_withdraw have error :", error);
    }
};

module.exports.withdraw_managelast = async() => {
    const sql =
        "SELECT *,transaction.id as tid FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank WHERE transaction.stats = 1 and transaction.type = 0 limit 5";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("withdraw_managelast have error :", error);
    }
};

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

//######################################## NAV BAR //########################################

//######################################## DASHBOARD ########################################

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

module.exports.queryTransactionDepositAll = async() => {
    const sql =
        "SELECT SUM(amount) AS deposit FROM transaction WHERE type = 1 AND stats = 0";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTransactionDepositAll have error :", error);
    }
};

module.exports.queryTransactionManualDepositAll = async() => {
    const sql =
        "SELECT SUM(credit) AS deposit FROM transaction_manual WHERE module = 'Deposit'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTransactionManualDepositAll have error :", error);
    }
};

module.exports.queryTransactionWithdrawAll = async() => {
    const sql =
        "SELECT SUM(amount) AS withdraw FROM transaction WHERE type = 0 AND stats = 0 OR stats = 3";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTransactionWithdrawAll have error :", error);
    }
};

module.exports.queryTransactionManualWithdrawAll = async() => {
    const sql =
        "SELECT SUM(credit) AS withdraw FROM transaction_manual WHERE module = 'Withdraw'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTransactionManualWithdrawAll have error :", error);
    }
};

module.exports.querySettingSystem = async() => {
    const sql = "SELECT * FROM seting";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingSystem have error :", error);
    }
};

module.exports.updatePasswordAdmin = async(req) => {
    const sql = `UPDATE admin SET password = '${req.newpass}' WHERE id =${req.id}`;
    try {
        const result = await model.insertOne(sql)
        return { status: true, statusCode: httpCode.Success.ok.codeText, result: result };
    } catch (error) {
        console.log('updateGeneralSetting have error :', error);
    }
}

module.exports.querySettingSystemAuto = async() => {
    const sql = "SELECT * FROM setting_auto_withdraw";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingSystemAuto have error :", error);
    }
};

module.exports.updateGeneralSetting = async(req) => {
    let aff = "";
    if (req.body.aff_d && req.body.aff_m) {
        aff = `,aff_d = '${req.body.aff_d}',aff_m = '${req.body.aff_m}'`;
    }
    const sql = `UPDATE seting SET line = '${req.body.line}',line_admin = '${req.body.line_admin}',name_web = '${req.body.name_web}',d_limit = '${req.body.d_limit}',w_limit = '${req.body.w_limit}',w_limit_twl = '${req.body.w_limit_twl ? req.body.w_limit_twl : '1'}'${aff} WHERE id = 1`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateGeneralSetting have error :", error);
    }
};

module.exports.updateAutoSetting = async(req) => {
    const sql =
        "UPDATE setting_auto_withdraw SET credit_min = " +
        req.body.credit_min +
        ", credit_max = " +
        req.body.credit_max +
        ", credit_limit = " +
        req.body.credit_limit +
        ", status = " +
        req.body.status +
        " WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateAutoSetting have error :", error);
    }
};

module.exports.updateNotifySetting = async(req) => {
    const sql =
        "UPDATE seting SET token_line = '" +
        req.body.token_line +
        "', token_line_game = '" +
        req.body.token_line_game +
        "', token_line_depo = '" +
        req.body.token_line_depo +
        "', token_line_with = '" +
        req.body.token_line_with +
        "' WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateNotifySetting have error :", error);
    }
};

//######################################## DASHBOARD ########################################

//######################################## MEMBER ########################################

module.exports.queryAllMember = async() => {
    const sql =
        "SELECT *,member.id FROM `member` LEFT JOIN bank on bank.bank_id = member.bank ORDER BY member.id DESC";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 60);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMember have error :", error);
    }
};

module.exports.queryAllMemberAndRef = async() => {
    const sql =
        "SELECT t1.id,t1.username,t1.name,t1.accnum,t2.bank_name,t1.line,t1.cre_date,t3.username as ref,t1.status FROM `member` t1 LEFT JOIN bank t2 on t2.bank_id = t1.bank LEFT join member t3 on t3.id = t1.ref ORDER BY t1.id DESC";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 30);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMember have error :", error);
    }
};

module.exports.queryAllMemberWithDate = async(req) => {
    const sql = `SELECT *,(SELECT username FROM member WHERE id = t1.ref)as ref_user FROM member t1 LEFT JOIN bank t2 ON t2.bank_id = t1.bank WHERE t1.cre_date LIKE '${req}%' ORDER BY t1.cre_date DESC`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 120);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMember have error :", error);
    }
};

module.exports.queryAllMemberWarning = async(req) => {
    let where = "";
    let startDate = req.startDate ? req.startDate : false;
    let endDate = req.endDate ? req.endDate : false;
    let today = req.today ? req.today : false;
    if (today) {
        where = `WHERE t2.created_at LIKE '${today}%'`;
    }
    if (startDate && endDate && startDate !== endDate) {
        where = `WHERE t2.created_at BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (startDate === endDate && startDate !== false) {
        where = `WHERE t2.created_at LIKE '${startDate}%'`;
    }
    const sql = `SELECT t1.id,t1.username,t2.detail,t2.status,t2.create_by,t2.created_at,t2.updated_at FROM member t1
	JOIN member_warning t2 ON t1.id = t2.member_id
	${where}
	ORDER BY t2.created_at DESC`;
    // console.log(sql);
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMember have error :", error);
    }
};

module.exports.addMemberWarning = async(req) => {
    const sql = `INSERT INTO member_warning (member_id,detail,create_by) VALUES (${req.member_id},'${req.detail_warning}','${req.username}')`;
    const sql2 = `UPDATE member t1 SET t1.status = 2 WHERE id = '${req.member_id}'`;
    try {
        const result = await model.queryOne(sql);
        const result2 = await model.queryOne(sql2);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMember have error :", error);
    }
};

module.exports.updateMemberWarning = async(req) => {
    const sql = `UPDATE member_warning t1 SET t1.detail = '${req.detail_warning}' ,t1.create_by = '${req.username}',t1.status = '${req.update_status}' WHERE t1.member_id = ${req.member_id}`;
    const sql2 = `UPDATE member t1 SET t1.status = ${req.update_status} WHERE id = '${req.member_id}'`;
    try {
        const result = await model.queryOne(sql);
        const result2 = await model.queryOne(sql2);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMember have error :", error);
    }
};

module.exports.queryMemberPartnerList = async(req) => {
    let partner = req.body.partner ? req.body.partner : false;
    let where = "";
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let calldate = "";
    if (false) {
        where = `WHERE t1.member_type_id = ${partner}`;
    } else {
        where = "WHERE t1.member_type_id IN (1)";
    }
    if (startDate === endDate && startDate != false) {
        calldate += ` AND date like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        calldate += ` AND date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    // const sql = `SELECT t1.*,
    // t2.name as name_member,
    // t3.name as name_partner,
    // (SELECT COUNT(*) FROM member_partner WHERE member_id_partner = t1.member_id) as count_member,
    // (SELECT COUNT(*) FROM member_partner WHERE member_id_partner = t1.member_id) as count_amount,
    // (SELECT COUNT(*) FROM member_partner WHERE member_id_partner = t1.member_id) as count_aff,
    // (SELECT COUNT(*) FROM member_partner WHERE member_id_partner = t1.member_id) as count_withdraw,
    // (SELECT COUNT(*) FROM member_partner WHERE member_id_partner = t1.member_id) as count_balance,
    // (SELECT case when TYPE = 'game' then SUM(amount) end FROM data_aff WHERE member_id = t1.member_id${calldate}) as count_aff_game,
    // (SELECT SUM(amount) FROM data_aff WHERE member_id = t1.member_id${calldate}) as count_aff_balance,
    // (SELECT case when state = 1 then SUM(amount) end FROM data_aff WHERE member_id = t1.member_id${calldate}) as aff_withdraw,
    // (SELECT SUM(turnover) FROM history_turnover WHERE username = t4.username${calldate}) as count_turnover_game,
    // (SELECT SUM(winloss) FROM history_turnover WHERE username = t4.username${calldate}) as count_wl_game
    // FROM member_partner t1
    // LEFT JOIN member t2 ON t1.member_id = t2.id
    // LEFT JOIN member t3 ON t1.member_id_partner = t3.id
    // LEFT JOIN ufa_acc t4 ON t2.username = t4.member_username
    // ${where} GROUP BY t1.member_id`;
    const sql = `SELECT t1.*,
	t2.name as name_member,
	t2.username,
	COALESCE((SELECT SUM(bet) FROM history_tran_winloss WHERE username = t4.username),0) as bet,
	COALESCE((SELECT SUM(aff) FROM history_tran_winloss WHERE username = t4.username),0) as aff,
	COALESCE((SELECT SUM(wl) FROM history_tran_winloss WHERE username = t4.username),0) as wl
	FROM member_partner t1
	LEFT JOIN member t2 ON t1.member_id = t2.id
	LEFT JOIN member t3 ON t1.member_id_partner = t3.id
	LEFT JOIN ufa_acc t4 ON t2.username = t4.member_username
	GROUP BY t1.member_id`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};
module.exports.queryMemberPartnerListYod = async(req) => {
    let partner_front = req.body.partner_front ? req.body.partner_front : false;
    let where = "";
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let calldate = "";
    if (partner_front && partner_front != 1) {
        where = `WHERE t1.member_id_partner = ${partner_front}`;
    }
    if (startDate === endDate && startDate != false) {
        calldate += ` AND date like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        calldate += ` AND date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    const sql = `SELECT t1.*,
	t2.name as name_member,
	t2.username,
	COALESCE((SELECT SUM(bet) FROM history_tran_winloss WHERE username = t4.username${calldate}),0) as bet,
	COALESCE((SELECT SUM(aff) FROM history_tran_winloss WHERE username = t4.username${calldate}),0) as aff,
	COALESCE((SELECT SUM(wl) FROM history_tran_winloss WHERE username = t4.username${calldate}) * -1,0) as wl
	FROM member_partner t1
	LEFT JOIN member t2 ON t1.member_id = t2.id
	LEFT JOIN member t3 ON t1.member_id_partner = t3.id
	LEFT JOIN ufa_acc t4 ON t2.username = t4.member_username
	${where} GROUP BY t1.member_id`;
    // console.log(sql)
    try {
        // const result = await model.queryOne(sql);//
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryMemberRemark = async(req) => {
    const sql = `SELECT * FROM transaction WHERE remark = '${req}'`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.insertTranferYod = async(req) => {
    const sql = `INSERT INTO transaction (member_username,type, amount, transaction_date, stats, pro_id, date_new, remark, created_by, update_by) VALUES ('${req.username
        }','2',${parseFloat(req.amont).toFixed(2)},'${req.transaction_date}',0,0,'${req.date_new
        }','${req.remark}','WebAuto','')`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryMemberPartnerWithFront = async(req) => {
    const sql = `SELECT t1.*,t2.username
	FROM member_partner t1
	LEFT JOIN member t2 ON t1.member_id = t2.id
	WHERE t1.member_id_partner = ${req} GROUP BY t1.member_type_id`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryMemberPartnerWithID = async(req) => {
    const sql = `SELECT t1.*,
	t2.name as name_member
	FROM member_partner t1
	LEFT JOIN member t2 ON t1.member_id = t2.id
	LEFT JOIN member t3 ON t1.member_id_partner = t3.id
	LEFT JOIN ufa_acc t4 ON t2.username = t4.member_username
	WHERE t1.member_id_partner = ${req} GROUP BY t1.member_id`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryMemberPartnerTranGame = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = `SELECT t1.id,
	t2.member_username,
	t2.username,
	COALESCE(SUM(t3.bet),0) AS bet,
	COALESCE(SUM(t3.aff),0) AS aff,
	COALESCE(SUM(t3.wl) * -1,0) AS wl
	FROM member t1
	LEFT JOIN ufa_acc t2 ON t1.username = t2.member_username
	LEFT JOIN history_tran_winloss t3 ON t3.username = t2.username
	WHERE t1.id = '${req.body.id}'`;
    if (startDate === endDate && startDate != false) {
        sql += ` AND t3.date like '${startDate}'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` AND t3.date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    sql += ` GROUP BY t2.member_username`;

    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryMemberPartnerTranGameNew = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = `SELECT t1.id,
	t2.member_username,
	t2.username,
	COALESCE(SUM(t3.bet),0) AS bet,
	COALESCE(SUM(t3.aff),0) AS aff,
	COALESCE(SUM(t3.wl) * -1,0) AS wl
	FROM member t1
	LEFT JOIN ufa_acc t2 ON t1.username = t2.member_username
	LEFT JOIN history_tran_winloss t3 ON t3.username = t2.username
	WHERE t1.id = '${req.body.id}'`;
    if (startDate === endDate && startDate != false) {
        sql += ` AND t3.date like '${startDate}'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` AND t3.date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    sql += ` GROUP BY t2.member_username`;

    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryMemberPartnerListProfitlotto = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = `SELECT
	COALESCE(SUM(aff),0) AS aff_lotto,
	COALESCE(SUM(amount),0) AS bet_lotto,
	COALESCE(SUM(CASE WHEN winner_flg = 1 THEN (winner_amount * -1) ELSE amount END),0) AS wl_lotto
	FROM view_lotto_number_data_V2 t1
	LEFT JOIN tb_users t2 ON t1.user_key = t2.id
	WHERE t2.username LIKE '%${req.body.username}'`;
    if (startDate === endDate && startDate != false) {
        sql += ` AND date_time_add like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` AND date_time_add BETWEEN '${startDate}' AND '${endDate}'`;
    }
    sql += ` GROUP BY user_key`;
    // console.log(sql);
    try {
        // const result = await modelLotto.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await modelLotto.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerList have error :", error);
    }
};

module.exports.queryAllMemberFixColumn = async(req) => {
    const { partnerType, mode } = req.body;
    let sql = "";
    if (partnerType && mode == "") {
        sql = `SELECT t2.id,
    t2.username,
    t2.name,
    t2.accnum,
    t1.percent_lotto,
    t1.percent_game,
    t1.partner_type,
    t1.member_type_id,
    t3.bank_name,
    t4.name as type_name
    FROM member_partner t1
    LEFT JOIN member t2 on t2.id = t1.member_id
    LEFT JOIN bank t3 on t3.bank_id = t2.bank
    LEFT JOIN member_partner_type t4 on t1.member_type_id = t4.id
    WHERE t1.member_type_id = '${partnerType}'
    ORDER BY t2.id DESC`;
    } else if (mode === "create") {
        sql = `SELECT member.id,
    member.username,
    member.name,
    member.accnum,
    bank.bank_name
    FROM member
    LEFT JOIN bank on bank.bank_id = member.bank
    WHERE member.id NOT IN (SELECT member_id FROM member_partner)
    ORDER BY member.id DESC`;
    } else if (partnerType && mode === "edit") {
        sql = `SELECT member.id,
    member.username,
    member.name,
    member.accnum,
    bank.bank_name
    FROM member
    LEFT JOIN bank on bank.bank_id = member.bank
    WHERE member.id NOT IN (SELECT member_id FROM member_partner WHERE member_id_partner = 0 AND member_id_partner != '${partnerType}')
    ORDER BY member.id DESC`;
    }

    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMemberFixColumn have error :", error);
    }
};

module.exports.queryAllMemberUFA = async() => {
    const sql = "SELECT * FROM ufa_acc";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMemberUFA have error :", error);
    }
};

module.exports.queryMemberLottoByID = async(req) => {
    const sql =
        "SELECT * FROM ufa_acc WHERE member_username = '" +
        req.body.username +
        "' AND type_api = 'lottohouse'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 3600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberLottoByID have error :", error);
    }
};

module.exports.queryMemberLottoByID2 = async(req) => {
    const sql =
        "SELECT * FROM ufa_acc WHERE username like '%" +
        req.body.username +
        "' AND type_api = 'lottohouse'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 3600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberLottoByID have error :", error);
    }
};

module.exports.queryFindMemberByMember = async(username, type = "ufa") => {
    const sql = `SELECT * FROM ufa_acc WHERE member_username = '${username}' AND type_api  = '${type}'`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data, 3600);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryFindMemberByMember have error :", error);
    }
};

module.exports.findMemberByUser = async(username, type = "ufa") => {
    const sql = `SELECT t2.* FROM ufa_acc t1 JOIN member t2 ON t1.member_username = t2.username WHERE t1.username = '${username}' AND t1.type_api  = '${type}'`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("findMemberByUser have error :", error);
    }
};

module.exports.findMemberIdByUsername = async(username) => {
    const sql = `SELECT * FROM member WHERE username = '${username}'`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("findMemberIdByUsername have error :", error);
    }
};

module.exports.deleteMember = async(req) => {
    const sql = "DELETE FROM member WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteMember have error :", error);
    }
};

module.exports.deleteMemberUFA = async(req) => {
    const sql =
        "DELETE FROM ufa_acc WHERE member_username = '" + req.body.username + "'";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteMemberUFA have error :", error);
    }
};

module.exports.queryMember = async(req) => {
    const sql = "SELECT * FROM member WHERE id = " + req.body.id;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMember have error :", error);
    }
};

module.exports.queryMemberWithRefID = async(req) => {
    const sql = `SELECT * FROM member WHERE ref = ${req}`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMember have error :", error);
    }
};

module.exports.queryMemberCheckPartner = async(req) => {
    const sql = `SELECT * FROM member_partner WHERE member_id = ${req}`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMember have error :", error);
    }
};

module.exports.queryMemberWithID = async(req) => {
    const sql = `SELECT * FROM member WHERE id = ${req}`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result[0],
        };
    } catch (error) {
        console.log("queryMember have error :", error);
    }
};

module.exports.queryMemberCheck = async(req) => {
    const sql =
        "SELECT * FROM member WHERE name = '" +
        req.body.name +
        "' OR username = '" +
        req.body.username +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberCheck have error :", error);
    }
};

module.exports.queryBank = async(req) => {
    const sql = "SELECT * FROM bank";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryBank have error :", error);
    }
};

module.exports.queryBankWhere = async(req) => {
    const sql = `SELECT * FROM bank WHERE bank_id ='${req}'`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result[0],
        };
    } catch (error) {
        console.log("queryBank have error :", error);
    }
};

module.exports.updateMember = async(req) => {
    const sql =
        "UPDATE member SET username = '" +
        req.body.username +
        "', password = '" +
        req.body.password +
        "', name = '" +
        req.body.name +
        "', accnum = '" +
        req.body.accnum +
        "', bank = '" +
        req.body.bank +
        "' WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateMember have error :", error);
    }
};

module.exports.updatePlayPowyingshup = async(req) => {
    const sql =
        "UPDATE member SET powyingshup = '" +
        req.body.total +
        "' WHERE id = '" +
        req.body.id +
        "'";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updatePlayPowyingshup have error :", error);
    }
};
module.exports.queryTurnoverMember = async(req) => {
    const sql =
        "SELECT * FROM history_turnover WHERE username = '" +
        req.body.username +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTurnoverMember have error :", error);
    }
};

//######################################## MEMBER ########################################

//######################################## PROMOTION ########################################
module.exports.queryPromotion = async() => {
    const sql = "SELECT * FROM promotion ";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotion have error :", error);
    }
};

module.exports.updatePromotion = async(req) => {
    const sql =
        "UPDATE promotion SET img_name = '" +
        req.body.url_img +
        "', name =  '" +
        req.body.name +
        "', percen = " +
        req.body.percen +
        ", x = " +
        req.body.x +
        ", limit_d = " +
        req.body.limit +
        ", text = '" +
        req.body.text +
        "', turn = " +
        req.body.turn +
        ", stats = " +
        req.body.stats +
        " WHERE id = " +
        req.body.id_pro;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updatePromotion have error :", error);
    }
};

module.exports.queryPromotionHistory = async() => {
    const sql =
        "SELECT *,member_pomotion.id FROM `member_pomotion` INNER JOIN promotion on promotion.id = member_pomotion.promotion_id INNER JOIN member ON member.id = member_pomotion.member_id ORDER BY member_pomotion.id DESC";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotionHistory have error :", error);
    }
};

module.exports.queryDepositHistory = async() => {
    const sql =
        "SELECT *,transaction.id as tid FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank WHERE   transaction.type = 1 and transaction.stats = 0 ORDER BY transaction.id DESC";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDepositHistory have error :", error);
    }
};

module.exports.queryUnSuccessDepositHistory = async() => {
    const sql = "SELECT * FROM transaction WHERE type = 1 AND stats = 1";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryUnSuccessDepositHistory have error :", error);
    }
};

module.exports.queryUnSuccessDepositByID = async(req) => {
    const sql = "SELECT * FROM transaction WHERE id =" + req.body.trans_id;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryUnSuccessDepositByID have error :", error);
    }
};

//######################################## PROMOTION ########################################

//######################################## DEPOSIT HISTORY ########################################

module.exports.queryDepositHistory = async() => {
    const sql =
        "SELECT *,transaction.id as tid FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank WHERE   transaction.type = 1 and transaction.stats = 0 ORDER BY transaction.id DESC";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDepositHistory have error :", error);
    }
};

//######################################## DEPOSIT HISTORY ########################################

//######################################## WITHDRAW HISTORY ########################################

module.exports.queryWithdrawHistory = async() => {
    const sql =
        "SELECT *,transaction.id as tid FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank  WHERE transaction.stats = 1 and transaction.type = 0";
    try {
        const result = await model.queryOne(sql);
        // let result = await checkCache(md5(sql))
        // if (!result) {
        //     const data = await model.queryOne(sql)
        //     result = await saveCache(md5(sql), data);
        // }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawHistory have error :", error);
    }
};

//######################################## WITHDRAW HISTORY ########################################

//######################################## WITHDRAW ########################################

module.exports.queryWithdrawUser = async(req) => {
    const sql =
        "SELECT *,member.id AS mid,transaction.id as tid, ufa_acc.username as usernameUFA FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank LEFT JOIN ufa_acc on ufa_acc.member_username = member.username WHERE transaction.id = " +
        req.body.id;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawUser have error :", error);
    }
};

module.exports.updateStatusWithdraw = async(req) => {
    // const sql =
    //     "UPDATE transaction SET stats = 0, remark = '" +
    //     req.body.remark +
    //     "', created_by = '" +
    //     req.body.createdBy +
    //     "' WHERE id = " +
    //     req.body.id;
    const sql = `UPDATE transaction SET stats = 0, remark = '${req.body.remark}', response_api = '${req.body.response}', transaction_date = '${req.body.transaction_date}', created_by = '${req.body.createdBy}' WHERE id = ${req.body.id}`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateStatusWithdraw have error :", error);
    }
};

module.exports.updateUnStatusWithdraw = async(req) => {
    const sql =
        "UPDATE transaction SET stats = 2, remark = '" +
        req.body.remark +
        "', created_by = '" +
        req.body.createdBy +
        "' WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateUnStatusWithdraw have error :", error);
    }
};

module.exports.queryWithdrawSuccess = async() => {
    const sql = `SELECT *,transaction.id as tid FROM member  INNER JOIN transaction on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank WHERE   transaction.type = 0 and transaction.stats = 0 and transaction.date_new > '${moment()
        .subtract(90, "days")
        .format("YYYY-MM-DD")}' ORDER BY transaction.id DESC`;
    // console.log(sql)
    try {
        // console.log(sql)
        const result = await model.queryOne(sql);
        // let result = await checkCache(md5(sql))
        // if (!result) {
        //     const data = await model.queryOne(sql)
        //     result = await saveCache(md5(sql), data);
        // }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawSuccess have error :", error);
    }
};

module.exports.queryWithdrawUnSuccess = async() => {
    const sql = `SELECT *,transaction.id as tid FROM member INNER JOIN transaction on member.username = transaction.member_username LEFT JOIN bank on bank.bank_id = member.bank WHERE   transaction.type = 0 and transaction.stats = 2 and transaction.date_new > '${moment()
        .subtract(90, "days")
        .format("YYYY-MM-DD")}' ORDER BY transaction.id DESC`;
    // console.log(sql)
    try {
        // console.log(sql)
        const result = await model.queryOne(sql);

        // let result = await checkCache(md5(sql))
        // if (!result) {
        //     const data = await model.queryOne(sql)
        //     result = await saveCache(md5(sql), data);
        // }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawUnSuccess have error :", error);
    }
};

module.exports.queryCheckBankDepositByID = async(req) => {
    const sql = "SELECT * FROM account_bank WHERE id = " + req.body.id;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckBankDepositByID have error :", error);
    }
};

module.exports.queryCheckBankWithdrawByID = async(req) => {
    const sql = "SELECT * FROM acc_withdraw WHERE id = " + req.body.id;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckBankWithdrawByID have error :", error);
    }
};

module.exports.queryCheckBankSCBDetail = async(req) => {
    const sql = "SELECT * FROM acc_withdraw WHERE status = 1 AND type = 'scb' ";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckBankSCBDetail have error :", error);
    }
};

//######################################## WITHDRAW ########################################

//######################################## RESULT ########################################
module.exports.queryResultsDeposit = async(req) => {
    const sql =
        "SELECT SUM(amount) as amount FROM `transaction` WHERE type = 1 and transaction_date BETWEEN '" +
        req.body.date_start +
        "' and '" +
        req.body.date_end +
        "' and stats = 0";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsDeposit`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsDeposit`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsDeposit have error :", error);
    }
};

module.exports.queryResultsWithdraw = async(req) => {
    const sql =
        "SELECT SUM(amount) as amount FROM `transaction` WHERE type = 0 and transaction_date BETWEEN '" +
        req.body.date_start +
        "' and '" +
        req.body.date_end +
        "' and (stats = 0 OR stats = 3)";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsWithdraw`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsWithdraw`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsWithdraw have error :", error);
    }
};

module.exports.queryResultsYearDeposit = async(req) => {
    const sql =
        "SELECT SUM(amount) as amount FROM `transaction` WHERE type = 1 and transaction_date LIKE '" +
        req.body.date +
        "%' and stats = 0";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsYearDeposit`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsYearDeposit`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsYearDeposit have error :", error);
    }
};

module.exports.queryResultsYearWithdraw = async(req) => {
    const sql =
        "SELECT SUM(amount) as amount FROM `transaction` WHERE type = 0 and transaction_date LIKE '" +
        req.body.date +
        "%' and (stats = 0 OR stats = 3)";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsYearWithdraw`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsYearWithdraw`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsYearWithdraw have error :", error);
    }
};

module.exports.queryResultsMonthDeposit = async(req) => {
    const sql =
        "SELECT SUM(amount) as amount FROM `transaction` WHERE type = 1 and transaction_date LIKE '" +
        req.body.date +
        "%' and stats = 0";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsMonthDeposit`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsMonthDeposit`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsMonthDeposit have error :", error);
    }
};

module.exports.queryResultsMonthWithdraw = async(req) => {
    const sql =
        "SELECT SUM(amount) as amount FROM `transaction` WHERE type = 0 and transaction_date LIKE '" +
        req.body.date +
        "%' and (stats = 0 OR stats = 3)";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsMonthWithdraw`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsMonthWithdraw`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsMonthWithdraw have error :", error);
    }
};

module.exports.queryResultsManualMonth = async(req) => {
    const sql =
        "SELECT SUM(credit) as amount FROM `transaction_manual` WHERE module = '" +
        req.body.type +
        "' and transaction_date LIKE '" +
        req.body.date +
        "%'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(`${sql}queryResultsManualMonth`);
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(`${sql}queryResultsManualMonth`, data, 1800);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryResultsMonth have error :", error);
    }
};

module.exports.queryLastDepositToday = async(req) => {
    const sql = `SELECT * FROM transaction WHERE transaction_date BETWEEN '${req.body.date_start}' AND '${req.body.date_end}' AND type = 1 AND stats = 0 ORDER BY id DESC limit 10`;

    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLastDepositToday have error :", error);
    }
};

module.exports.queryTopDepositToday = async(req) => {
    const sql = `SELECT member_username,SUM(amount) as amount FROM transaction  WHERE transaction_date BETWEEN '${req.body.date_start}' AND '${req.body.date_end}' AND type = 1 AND stats = 0 GROUP BY member_username ORDER BY amount DESC LIMIT 10`;

    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTopDepositToday have error :", error);
    }
};

module.exports.queryTopWithdrawToday = async(req) => {
    const sql = `SELECT member_username,SUM(amount) as amount FROM transaction WHERE transaction_date BETWEEN '${req.body.date_start}' AND '${req.body.date_end}' AND type = 0 and (stats = 0 OR stats = 3) GROUP BY member_username ORDER BY amount DESC limit 10`;

    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTopWithdrawToday have error :", error);
    }
};

//######################################## RESULT ########################################

//######################################## REPORT WITHDRAW ########################################

module.exports.queryReportWithdraw = async(req) => {
    const sql =
        "SELECT *,transaction.id as tid FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username INNER JOIN bank on bank.bank_id = member.bank WHERE transaction.type = 0 and (transaction.stats = 0 OR transaction.stats = 3) AND `transaction_date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryReportWithdraw have error :", error);
    }
};

module.exports.queryReportWithdrawAuto = async(req) => {
    const sql =
        "SELECT * FROM `auto_withdraw` WHERE `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryReportWithdrawAuto have error :", error);
    }
};

//######################################## REPORT WITHDRAW ########################################

//######################################## REPORT DEPOSIT ########################################
module.exports.queryReportDeposit = async(req) => {
    const sql =
        "SELECT *,transaction.id as tid FROM `member` INNER JOIN `transaction` on member.username = transaction.member_username INNER JOIN bank on bank.bank_id = member.bank WHERE transaction.type = 1 and transaction.stats = 0 AND `transaction_date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryReportDeposit have error :", error);
    }
};
//######################################## REPORT DEPOSIT ########################################

//######################################## REPORT FINANCE ########################################

module.exports.queryDepositSummary = async(start, end) => {
    const sql =
        "SELECT SUM(amount) AS total FROM `member`  INNER JOIN `transaction` on member.username = transaction.member_username INNER JOIN bank on bank.bank_id = member.bank WHERE transaction.type = 1 and transaction.stats = 0 AND `transaction_date` BETWEEN '" +
        start +
        "' AND '" +
        end +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDepositSummary have error :", error);
    }
};

module.exports.queryDepositManualSummary = async(start, end) => {
    const sql =
        "SELECT SUM(credit) AS total FROM `transaction_manual` WHERE transaction_manual.module = 'Deposit' AND `date` BETWEEN '" +
        start +
        "' AND '" +
        end +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDepositManualSummary have error :", error);
    }
};

module.exports.queryWithdrawSummary = async(start, end) => {
    const sql =
        "SELECT SUM(amount) AS total FROM `member`  INNER JOIN `transaction` on member.username = transaction.member_username INNER JOIN bank on bank.bank_id = member.bank WHERE transaction.type = 0 and (transaction.stats = 0 OR transaction.stats = 3) AND `transaction_date` BETWEEN '" +
        start +
        "' AND '" +
        end +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawSummary have error :", error);
    }
};

module.exports.queryWithdrawSummaryCancle = async(start, end) => {
    const sql =
        "SELECT SUM(amount) AS total FROM `transaction` WHERE type = 0 and stats in (1,2) AND `transaction_date` BETWEEN '" +
        start +
        "' AND '" +
        end +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawSummary have error :", error);
    }
};

module.exports.queryWithdrawManualSummary = async(start, end) => {
    const sql =
        "SELECT SUM(credit) AS total FROM `transaction_manual` WHERE transaction_manual.module = 'Withdraw' AND `date` BETWEEN '" +
        start +
        "' AND '" +
        end +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querWithdrawManualSummary have error :", error);
    }
};
//######################################## REPORT FINANCE ########################################

//######################################## REPORT TRANSACTION MANUAL ########################################

module.exports.queryTransactionManual = async(req) => {
    const sql =
        "SELECT * FROM transaction_manual WHERE `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTransactionManual have error :", error);
    }
};

//######################################## REPORT TRANSACTION MANUAL ########################################

//######################################## STAFF ########################################
module.exports.queryAllStaffByID = async(req) => {
    const sql = "SELECT * FROM admin  WHERE id = " + req.body.id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllStaffByID have error :", error);
    }
};

module.exports.queryAllStaff = async() => {
    const sql = "SELECT * FROM admin  WHERE stats = 0";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllStaff have error :", error);
    }
};

module.exports.queryEditStaff = async(req) => {
    const sql =
        "SELECT *,tb_menu_permission.id AS perID FROM tb_menu_permission INNER JOIN tb_menu ON tb_menu.id = tb_menu_permission.menu_id WHERE admin_id = " +
        req.body.id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryEditStaff have error :", error);
    }
};

module.exports.insertStaff = async(req) => {
    const sql =
        "INSERT INTO admin (id,username,password,stats,category,secert_code,mapping_auth_api) VALUES (null, '" +
        req.body.username +
        "','" +
        req.body.password +
        "',0,'" +
        req.body.category +
        "','','" +
        req.body.mappingApi +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertStaff have error :", error);
    }
};

module.exports.insertPermission = async(data) => {
    const sql =
        "INSERT INTO tb_menu_permission (id,admin_id,menu_id,menu_name,menu_view,menu_edit) VALUES (null, '" +
        data.id +
        "','" +
        data.menuID +
        "','" +
        data.menuName +
        "','" +
        data.view +
        "','" +
        data.edit +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertPermission have error :", error);
    }
};

module.exports.deleteStaff = async(req) => {
    const sql = "DELETE FROM admin WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteStaff have error :", error);
    }
};

module.exports.updateStaff = async(req) => {
    let sql = `UPDATE admin SET username = '${req.body.username}',category = '${req.body.category}'`
    if (req.body.password != '') {
        sql += `,password ='${req.body.password}' `
    }
    sql += `WHERE id = ${req.body.id}`
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateStaff have error :", error);
    }
};

module.exports.UpdatePermission = async(data) => {
    const sql =
        "UPDATE tb_menu_permission SET menu_view = '" +
        data.view +
        "', menu_edit = '" +
        data.edit +
        "'  WHERE id = " +
        data.menuID;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("UpdatePermission have error :", error);
    }
};
//######################################## STAFF ########################################

//######################################## STAFF HISTORY ########################################
module.exports.queryStaffHistory = async() => {
    const sql = "SELECT * FROM staff_history ORDER BY id DESC";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryStaffHistory have error :", error);
    }
};
//######################################## STAFF HISTORY ########################################

//######################################## SETTING WHEEL HISTORY ########################################
module.exports.querySettingWheel = async() => {
    const sql = "SELECT * FROM setting_wheel";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingWheel have error :", error);
    }
};

module.exports.updateSetting_w = async(req) => {
    const sql =
        "UPDATE setting_wheel SET offset_text = " +
        req.body.offset_text +
        ", text_color = '" +
        req.body.text_color +
        "', text_size = " +
        req.body.text_size +
        ", text_type = '" +
        req.body.text_type +
        "', line_color = '" +
        req.body.line_color +
        "', inner_color = '" +
        req.body.inner_color +
        "', outer_color = '" +
        req.body.outer_color +
        "', center_color = '" +
        req.body.center_color +
        "', center_img = '" +
        req.body.center_img +
        "', status = " +
        req.body.status +
        " WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSetting_w have error :", error);
    }
};

module.exports.updateSettingWheel = async(req) => {
    const sql =
        "UPDATE setting_wheel SET description = '" +
        req.description +
        "', value = '" +
        req.value +
        "', color = '" +
        req.color +
        "'  WHERE id = " +
        req.tid;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingWheel have error :", error);
    }
};
//######################################## SETTING WHEEL HISTORY ########################################

//######################################## REPORT WHEEL ########################################

module.exports.queryWheelReport = async(req) => {
    const sql =
        "SELECT * ,wheel.id as wid FROM `wheel` WHERE  `create_date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWheelReport have error :", error);
    }
};

//######################################## REPORT WHEEL ########################################

//######################################## SETTING POWYINGSHUP ########################################

module.exports.querySettingPowYingShup = async(req) => {
    const sql = "SELECT * FROM setting_powyingshup";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingPowYingShup have error :", error);
    }
};

module.exports.updatePowYingShup = async(req) => {
    const sql =
        "UPDATE setting_powyingshup SET credit_low = " +
        req.body.credit_low +
        ", credit_high = " +
        req.body.credit_high +
        ", credit_prize = " +
        req.body.credit_prize +
        ", round = " +
        req.body.round +
        ", deposit = " +
        req.body.deposit +
        ", play = " +
        req.body.play +
        ", day = " +
        req.body.day +
        ", status = " +
        req.body.status +
        " WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updatePowYingShup have error :", error);
    }
};

//######################################## SETTING POWYINGSHUP ########################################

//######################################## REPORT POWYINGSHUP ########################################
module.exports.queryPowYingShupReport = async(req) => {
    const sql =
        "SELECT * ,powyingshup_log.id as wid FROM `powyingshup_log` WHERE  `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPowYingShupReport have error :", error);
    }
};
//######################################## REPORT POWYINGSHUP ########################################

//######################################## ALLIANCE ########################################
module.exports.insertAlliance = async(req) => {
    const sql =
        "INSERT INTO alliance (id,username,name,accnum,bank_name,percent,code,stats,date) VALUES (null, '" +
        req.body.username +
        "','" +
        req.body.name +
        "','" +
        req.body.accnum +
        "','" +
        req.body.bankname +
        "'," +
        req.body.percent +
        ",'" +
        req.body.code +
        "',1, '" +
        req.body.date +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertAlliance have error :", error);
    }
};

module.exports.queryAlliance = async(req) => {
    const sql =
        "SELECT *, alliance.id AS aid, alliance.code AS code FROM alliance LEFT JOIN bank ON  bank.bank_id = alliance.bank_name";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAlliance have error :", error);
    }
};

module.exports.queryAllianceMember = async(code) => {
    const sql =
        "SELECT member.username , ufa_acc.username AS usernameUFA FROM member LEFT JOIN ufa_acc ON  ufa_acc.member_username = member.username WHERE alliance = '" +
        code +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllianceMember have error :", error);
    }
};

module.exports.queryCheckDepositAuto = async(username) => {
    const sql =
        "SELECT SUM(amount) AS deposit FROM transaction WHERE member_username = '" +
        username +
        "' AND type = 1 AND stats = 0";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckDepositAuto have error :", error);
    }
};

module.exports.queryCheckDepositManual = async(usernameUFA) => {
    const sql =
        "SELECT SUM(credit) AS deposit FROM transaction_manual WHERE member_username = '" +
        usernameUFA +
        "' AND module = 'Deposit'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckDepositManual have error :", error);
    }
};

module.exports.queryCheckWithdrawAuto = async(username) => {
    const sql =
        "SELECT SUM(amount) AS deposit FROM transaction WHERE member_username = '" +
        username +
        "' AND type = 0 AND stats = 0 OR stats = 3";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckWithdrawAuto have error :", error);
    }
};

module.exports.queryCheckWithdrawManual = async(usernameUFA) => {
    const sql =
        "SELECT SUM(credit) AS deposit FROM transaction_manual WHERE member_username = '" +
        usernameUFA +
        "' AND module = 'Withdraw'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckWithdrawManual have error :", error);
    }
};

module.exports.queryAlliance1 = async(req) => {
    const sql =
        "SELECT *, alliance.id AS aid, alliance.code AS code FROM alliance LEFT JOIN bank ON  bank.bank_id = alliance.bank_name WHERE code = '" +
        req.body.code +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAlliance1 have error :", error);
    }
};

module.exports.queryCheckDepositAuto1 = async(req) => {
    const sql =
        "SELECT SUM(amount) AS deposit FROM transaction WHERE member_username = '" +
        req.body.username +
        "' AND type = 1 AND stats = 0  AND `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckDepositAuto1 have error :", error);
    }
};

module.exports.queryCheckDepositManual1 = async(req) => {
    const sql =
        "SELECT SUM(credit) AS deposit FROM transaction_manual WHERE member_username = '" +
        req.body.usernameUFA +
        "' AND module = 'Deposit'  AND `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckDepositManual1 have error :", error);
    }
};

module.exports.queryCheckWithdrawAuto1 = async(req) => {
    const sql =
        "SELECT SUM(amount) AS deposit FROM transaction WHERE member_username = '" +
        req.body.username +
        "' AND type = 0  AND `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "' AND stats = 0";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckWithdrawAuto1 have error :", error);
    }
};

module.exports.queryCheckWithdrawAuto1_1 = async(req) => {
    const sql =
        "SELECT SUM(amount) AS deposit FROM transaction WHERE member_username = '" +
        req.body.username +
        "' AND type = 0  AND `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "' AND stats = 3";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckWithdrawAuto1 have error :", error);
    }
};

module.exports.queryCheckWithdrawManual1 = async(req) => {
    const sql =
        "SELECT SUM(credit) AS deposit FROM transaction_manual WHERE member_username = '" +
        req.body.usernameUFA +
        "' AND module = 'Withdraw'  AND `date` BETWEEN '" +
        req.body.start_date +
        "' AND '" +
        req.body.end_date +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckWithdrawManual1 have error :", error);
    }
};

module.exports.deleteMemberAlliance = async(req) => {
    const sql = "DELETE FROM alliance WHERE id = '" + req.body.id + "'";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteMemberAlliance have error :", error);
    }
};

module.exports.insertAllianceLog = async(req) => {
    const sql =
        "INSERT INTO alliance_log (id,member_username,amount,date) VALUES (null, '" +
        req.body.username +
        "'," +
        req.body.amount +
        ",'" +
        req.body.date +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertAllianceLog have error :", error);
    }
};

module.exports.queryAllianceLog = async(req) => {
    const sql =
        "SELECT *  FROM `alliance_log` WHERE  `member_username` = '" +
        req.body.username +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllianceLog have error :", error);
    }
};

module.exports.queryAllianceByID = async(req) => {
    const sql = "SELECT * FROM alliance WHERE id  = " + req.body.id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllianceByID have error :", error);
    }
};

module.exports.deleteMemberAlliance = async(req) => {
    const sql = "DELETE FROM allian WHERE id = " + req.body.id + "";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteMemberAllian have error :", error);
    }
};

module.exports.updateAllianceMember = async(req) => {
    const sql =
        "UPDATE alliance SET username = '" +
        req.body.username +
        "', name = '" +
        req.body.name +
        "', accnum = '" +
        req.body.accnum +
        "', bank_name = '" +
        req.body.bank +
        "', percent = " +
        req.body.percent +
        ", code = '" +
        req.body.code +
        "' WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateAllianceMember have error :", error);
    }
};
//######################################## ALLIANCE ########################################

module.exports.queryTurnover = async(req) => {
    const sql =
        "SELECT * FROM history_turnover WHERE username  = '" +
        req.body.username +
        "' AND date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTurnover have error :", error);
    }
};

module.exports.insertStaffHistory = async(req) => {
    const sql =
        "INSERT INTO staff_history (id,username,type,detail,date) VALUES (null, '" +
        req.body.username +
        "',0,'" +
        req.body.detail +
        "','" +
        req.body.date +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertStaffHistory have error :", error);
    }
};

module.exports.insertReportActivity = async(req) => {
    const sql =
        "INSERT INTO report_activity (id,user,detail,module,ip_address,create_date) VALUES (null, '" +
        req.body.username +
        "','" +
        req.body.detail +
        "','" +
        req.body.module +
        "','" +
        req.body.ip +
        "','" +
        req.body.date +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertReportActivity have error :", error);
    }
};

module.exports.insertAndUpdateMemberPartner = async(req) => {
    try {
        const { valPartnerId, childPartner } = req.body;

        if (valPartnerId !== 0) {
            const sql = `DELETE FROM member_partner WHERE member_id_partner = ${valPartnerId}`;
            await model.deleteOne(sql);
        }

        childPartner.forEach(async(item) => {
            const sql = `INSERT INTO member_partner
    (member_id_partner,member_type_id,member_id,percent_lotto,percent_game,partner_type,updated_at)
    VALUE(${valPartnerId},'${item.member_type_id}',${item.member_id},${item.percent_lotto},${item.percent_game},'${item.partner_type}',now())`;
            await model.insertOne(sql);

            if (valPartnerId != 0) {
                const sqlDeleteLv = `DELETE FROM member_partner_level WHERE lv_member_id = ${item.member_id}`;
                await model.deleteOne(sqlDeleteLv);

                const sqlLevel = `SELECT * FROM member_partner_level WHERE lv_member_id = ${valPartnerId}`;
                let resFind = await model.queryOne(sqlLevel);
                if (resFind.length > 0) {
                    resFind.forEach(async(item2) => {
                        const sqlInsertLvPartner = `INSERT INTO member_partner_level (lv_member_id,lv_partner_id,lv_partner_type,created_at,updated_at)
            VALUE(${item.member_id},${item2.lv_partner_id},'',now(),now())`;
                        await model.insertOne(sqlInsertLvPartner);
                    });
                }

                const sqlInsertLv = `INSERT INTO member_partner_level (lv_member_id,lv_partner_id,lv_partner_type,created_at,updated_at)
          VALUE(${item.member_id},${valPartnerId},'partner',now(),now())`;
                await model.insertOne(sqlInsertLv);
            }
        });

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: [],
        };
    } catch (error) {
        console.log("insertAndUpdateMemberPartner have error :", error);
    }
};

module.exports.insertAndUpdateMemberPartnerCopy = async(req, authPlayload) => {
    try {
        let {
            id,
            partner_member_id: partnerMemberId,
            member_id: memberId,
            pattner_percent_lotto: pattnerPercentLotto,
            pattner_percent_game: pattnerPercentGame,
            partner_type: partnerType,
            member_type: memberType,
        } = req.body;

        let result;

        if (partnerMemberId === "0" || partnerMemberId === undefined) {
            partnerMemberId = authPlayload.playload.id;
        }

        if (id !== 0) {
            const sql = `DELETE FROM member_partner WHERE member_id_partner = ${partnerMemberId}`;
            await model.deleteOne(sql);
        }

        for (let i = 0; i < memberId.length; i++) {
            const percentLotto = pattnerPercentLotto[i] || 0;
            const percentGame = pattnerPercentGame[i] || 0;
            const memberTypeVal = memberType[i];
            const sql = `INSERT INTO member_partner
                (member_id_partner,member_type,member_id,percent_lotto,percent_game,partner_type,updated_at)
                VALUE(${partnerMemberId},'${memberTypeVal}',${memberId[i]},${percentLotto},${percentGame},'${partnerType[i]}',now())`;
            result = await model.insertOne(sql);
        }

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertReportActivity have error :", error);
    }
};

module.exports.queryDataMemberPartner = async(req) => {
    try {
        const { memberIdPartner } = req.body;
        const sql = `SELECT
                    t1.member_id_partner,
                    t1.member_type_id,
                    t1.member_id,
                    t1.percent_lotto,
                    t1.percent_game,
                    t1.updated_at,
                    ( SELECT count(*) FROM member_partner subt1 WHERE subt1.member_id_partner = t1.member_id) as countmember,
                    t2.*,
                    t3.bank_name,
                    t4.name as type_name
                FROM
                    member_partner t1
                LEFT JOIN member t2 ON
                t1.member_id = t2.id
                LEFT JOIN bank t3 ON t2.bank = t3.bank_id
                LEFT JOIN member_partner_type t4 ON t1.member_type_id = t4.id
                WHERE t1.member_id_partner = ${memberIdPartner}`;

        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDataMemberPartner have error :", error);
    }
};

module.exports.queryDataMemberPartnerWithUsername = async(req) => {
    try {
        const sql = `SELECT
                    t1.member_id_partner,
                    t1.member_type_id,
                    t1.member_id,
					( SELECT username AS partner_username FROM member WHERE id = t1.member_id_partner LIMIT 1) as partner_username,
                    t1.percent_lotto,
                    t1.percent_game,
                    t1.updated_at,
                    ( SELECT count(*) FROM member_partner subt1 WHERE subt1.member_id_partner = t1.member_id) as countmember,
                    t2.*,
                    t3.bank_name,
                    t4.name as type_name
                FROM
                    member_partner t1
                LEFT JOIN member t2 ON
                t1.member_id = t2.id
                LEFT JOIN bank t3 ON t2.bank = t3.bank_id
                LEFT JOIN member_partner_type t4 ON t1.member_type_id = t4.id
                WHERE t2.username = ${req}`;

        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDataMemberPartner have error :", error);
    }
};

module.exports.queryChildrenMemberPartner = async(req) => {
    const { id } = req.body;
    let sql = "";
    if (id) {
        sql = `SELECT
                *
            FROM
                member_partner mp
            LEFT JOIN member m ON mp.member_id = m.id
            WHERE
                mp.member_id_partner = ${id}
            ORDER BY  mp.partner_type DESC`;
    } else {
        sql = `SELECT
                *
            FROM
                member_partner mp
            LEFT JOIN member m ON mp.member_id = m.id
            ORDER BY  mp.partner_type DESC`;
    }

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryChildrenMemberPartner have error :", error);
    }
};

module.exports.queryDeleteMemberPartner = async(req) => {
    const { id } = req.body;
    const sql = "DELETE FROM member_partner WHERE member_id_partner = " + id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDeleteMemberPartner have error :", error);
    }
};

module.exports.queryPromotionList = async() => {
    const sql =
        "SELECT *,promotion_type.id AS protype_id,promotion.id AS pro_id FROM promotion INNER JOIN promotion_type ON promotion_type.id = promotion.pro_type";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotionList have error :", error);
    }
};
module.exports.queryPromotionListByID = async(req) => {
    const sql =
        "SELECT *,promotion_type.id AS protype_id,promotion.id AS pro_id FROM promotion INNER JOIN promotion_type ON promotion_type.id = promotion.pro_type WHERE promotion.id = " +
        req.body.id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotionListByID have error :", error);
    }
};

module.exports.queryPromotionType = async(req) => {
    const sql = "SELECT * FROM promotion_type";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotionType have error :", error);
    }
};

module.exports.updatePromotionbyID = async(req) => {
    const sql =
        "UPDATE promotion SET percen = " +
        req.body.percen +
        ", text = '" +
        req.body.text +
        "', x = " +
        req.body.x +
        ", name = '" +
        req.body.name +
        "', token = '" +
        req.body.token +
        "', img_name = '" +
        req.body.img_name +
        "', limit_d = " +
        req.body.limit_d +
        ",limit_r = " +
        req.body.limit_r +
        ", pro_type = " +
        req.body.pro_type +
        ", deposit_u = " +
        req.body.deposit_u +
        ", receive_pro = " +
        req.body.receive_pro +
        ", withdraw_u = " +
        req.body.withdraw_u +
        ", type = " +
        req.body.type +
        ", stats = " +
        req.body.stats +
        ", turn = " +
        req.body.turn +
        ", type = " +
        req.body.type +
        " WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updatePromotionbyID have error :", error);
    }
};

module.exports.deletePromotion = async(req) => {
    const sql = "DELETE FROM promotion WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deletePromotion have error :", error);
    }
};

module.exports.insertPromotion = async(req) => {
    const sql =
        "INSERT INTO `promotion`(`id`, `percen`, `x`, `exprice`, `text`, `name`, `token`, `img_name`, `limit_d`, `limit_w`,`limit_r`,`deposit_u`, `withdraw_u`, `receive_pro`, `pro_type`,`type`, `stats`, `turn`) VALUES (null," +
        req.body.percen +
        "," +
        req.body.x +
        ",'','" +
        req.body.text +
        "','" +
        req.body.name +
        "','" +
        req.body.token +
        "','" +
        req.body.img_name +
        "'," +
        req.body.limit_d +
        ",0," +
        req.body.limit_r +
        "," +
        req.body.deposit_u +
        "," +
        req.body.withdraw_u +
        "," +
        req.body.receive_pro +
        "," +
        req.body.pro_type +
        "," +
        req.body.type +
        "," +
        req.body.stats +
        "," +
        req.body.turn +
        ")";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertPromotion have error :", error);
    }
};

module.exports.findMemberBank = async(bankCode, accountBank) => {
    let likeAccNum = "";
    switch (bankCode) {
        case "kbank":
            likeAccNum = `m.accnum LIKE '____${accountBank}%'`;
            break;
        case "scb":
            likeAccNum = `m.accnum LIKE '______${accountBank}%'`;
            break;

        default:
            likeAccNum = `m.accnum LIKE '%${accountBank}'`;
            break;
    }
    const sql = `SELECT
                    *
                FROM
                    member m
                WHERE
                    m.bank = '${bankCode}' AND
                    ${likeAccNum}
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("findMemberBank have error :", error);
    }
};

module.exports.accountWithdrawTruewallet = async() => {
    const sql = `SELECT
                    *
                FROM
                acc_withdraw aw
                WHERE aw.status = '1'  AND aw.type = 'truewallet'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountWithdrawTruewallet have error :", error);
    }
};

module.exports.accountWithdrawTruewalletUpdateToken = async(token) => {
    const sql = `UPDATE acc_withdraw SET token = '${token}' WHERE type = 'truewallet'`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountWithdrawTruewalletUpdateToken have error :", error);
    }
};

module.exports.accountWithdrawNew = async() => {
    const sql = `SELECT
                    *
                FROM
                acc_withdraw aw WHERE aw.type='scb' AND aw.status = 1
                LIMIT 1
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountWithdrawNew have error :", error);
    }
};

module.exports.accDepositByID = async(type) => {
    const sql = `SELECT
                    *
                FROM
                account_bank ab
                WHERE ab.id = '${type}'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accDepositByID have error :", error);
    }
};

module.exports.accWithdrawByID = async(type) => {
    const sql = `SELECT
                    *
                FROM
                acc_withdraw aw WHERE aw.id='${type}'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accWithdrawByID have error :", error);
    }
};

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
        console.log("findMemberBank have error :", error);
    }
};

module.exports.accountDeposit = async(type) => {
    const sql = `SELECT
                    *
                FROM
                account_bank ab
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
        console.log("findMemberBank have error :", error);
    }
};

module.exports.accountDepositByID = async(id) => {
    const sql = `SELECT
                    *
                FROM
                account_bank ab
                WHERE ab.id = '${id}'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountDepositByID have error :", error);
    }
};

module.exports.accountWithdrawByID = async(id) => {
    const sql = `SELECT
                    *
                FROM
                acc_withdraw ab
                WHERE ab.id = '${id}'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountWithdrawByID have error :", error);
    }
};

module.exports.accountTrueWallet = async(data) => {
    const sql = `SELECT
                    *
                FROM
                account_bank ab
                WHERE ab.status = '1'  AND ab.type = '${data.type}' AND ab.accnum = '${data.phone}'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountTrueWallet have error :", error);
    }
};

module.exports.accountTrueWalletType = async(data) => {
    const sql = `SELECT
                    *
                FROM
                account_bank ab
                WHERE ab.status = '1'  AND ab.type = '${data.type}'
               `;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("accountTrueWallet have error :", error);
    }
};

module.exports.accountWithdraw = async(type) => {
    const sql = `SELECT
                    *
                FROM
                acc_withdraw aw
                WHERE aw.status = '1'  AND aw.type = '${type}'
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

module.exports.checkDepositTrans = async(data) => {
    const {
        username: memberUsername,
        txnDateTime: dateDeposit,
        txnAmount: amount,
    } = data;
    const sql = `SELECT
                    *
                FROM
                    transaction t
                WHERE
                    t.member_username = '${memberUsername}'
                    AND t.type = '1'
                    AND t.stats = 0
                    AND t.amount = ${amount}
                    AND t.transaction_date = '${dateDeposit}'
                            `;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("checkDepositTrans have error :", error);
    }
};

module.exports.checkDepositTransWait = async(data) => {
    const {
        username: memberUsername,
        txnDateTime: dateDeposit,
        txnAmount: amount,
    } = data;
    const sql = `SELECT
                    *
                FROM
                    transaction t
                WHERE
                    t.member_username = '${memberUsername}'
                    AND t.type = '1'
                    AND t.stats = '1'
                    AND t.amount = ${amount}
                    AND t.transaction_date = '${dateDeposit}'
                            `;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("checkDepositTransWait have error :", error);
    }
};

module.exports.checkDepositTransManual = async(data) => {
    const {
        username: memberUsername,
        txnDateTime: dateDeposit,
        txnAmount: amount,
    } = data;
    const sql = `SELECT
                    *
                FROM
                    transaction t
                WHERE
                    t.member_username = '${memberUsername}'
                    AND t.type = '1'
                    AND t.stats = '1'
                    AND t.amount = ${amount}
                    AND t.transaction_date
                            `;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("checkDepositTrans have error :", error);
    }
};

module.exports.createTrans = async(data) => {
    const sql = `INSERT INTO transaction (member_username,type,amount,transaction_date,stats,pro_id,date_new,response_api,remark,update_by,alert)
    VALUES ('${data.username}','${data.type}','${data.amount}','${data.transaction_date}','${data.stats}','${data.pro_id}','${data.date_new}','${data.response_api}','${data.remark}','',0)`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createTrans have error :", error);
    }
};

module.exports.createTransWithManual = async(data) => {
    const sql = `INSERT INTO transaction (member_username,type,amount,transaction_date,created_at,stats,pro_id,date_new,response_api,remark,created_by,update_by,alert)
    VALUES ('${data.username}','${data.type}','${data.amount}','${data.transaction_date}','${data.created_at}','${data.stats}','${data.pro_id}','${data.date_new}','${data.response_api}','Manual','${data.admin}','',0)`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createTrans have error :", error);
    }
};

module.exports.createTransWithTrueWallet = async(data) => {
    const sql = `INSERT INTO transaction (member_username,type,amount,transaction_date,created_at,stats,pro_id,date_new,response_api,remark,created_by,update_by)
    VALUES ('${data.username}','${data.type}','${data.amount}','${data.transaction_date}','${data.created_at}','${data.stats}','${data.pro_id}','${data.date_new}','${data.response_api}','TRUEWALLET','${data.admin}','${data.update_by}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createTrans have error :", error);
    }
};

module.exports.createFileUpload = async(data) => {
    const sql = `INSERT INTO topup_files (trans_id,file_name)
    VALUES (${data.trans_id},'${data.file_name}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createFileUpload have error :", error);
    }
};

module.exports.checkWalletTypeTrans = async(transId) => {
    const sql = `SELECT COUNT(*) as countRow FROM member_wallet_transaction WHERE (ref_table = 'transaction' OR ref_table = 'manual') AND ref_id = '${transId}'`;
    try {
        const result = await model.queryOne(sql);
        if (result[0].countRow) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("checkWalletTypeTrans have error :", error);
    }
};

module.exports.createWallet = async(data) => {
    const sql = `INSERT INTO member_wallet_transaction (member_id,amount,balance,wallet_type,ref_table,ref_id,created_at,updated_at,sts)
    VALUES ('${data.memberId}','${data.amount}','${data.balance}','${data.walletType}','${data.refTable}','${data.refId}','${data.createdAt}','${data.updatedAt}','${data.sts}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createWallet have error :", error);
    }
};

module.exports.createMember = async(req) => {
    const data = req.body;
    const flagPartner = data.checkPartner ? 1 : 0;
    const percentLotto = data.checkPartner ? data.percentLotto : 0;
    const percentGame = data.checkPartner ? data.percentGame : 0;

    const sql = `INSERT INTO member (
    username,
    password,
    line,
    accnum,
    bank,
    name,
    status,
    IP,
    cre_date,
    LastUpdate,
    powyingshup,
    promotion_id,
    cr_prog,
    partner_flag,
    partner_percen_lotto,
    partner_percen_game)
    VALUES (
      '${data.username}',
      '${data.password}',
      '${data.line}',
      '${data.accnum}',
      '${data.bank}',
      '${data.name}',
      '1',
      '${req.ip}',
      '${req.date}',
      NOW(),
      0,
      0,
      '',
      ${flagPartner},
      ${percentLotto},
      ${percentGame}
      )`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createMember have error :", error);
    }
};

module.exports.getBalanceWallet = async(memberId) => {
    const sql = `SELECT
                  mwt.id,
                  m.username,
                  mwt.balance
                FROM
                member_wallet_transaction mwt
                LEFT JOIN member m ON mwt.member_id = m.id
                WHERE
                mwt.member_id = ${memberId}
                AND mwt.sts = '1'
                ORDER BY
                mwt.id DESC
                LIMIT 1`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("getBalanceWallet have error :", error);
    }
};

module.exports.sumBalanceWalletAllmember = async() => {
    const sql = `SELECT c.id, p.member_id,sum(p.balance)as total FROM member c
    JOIN (SELECT member_id,balance,sts, MAX(id) as MaxPID FROM member_wallet_transaction GROUP BY member_id) pu
    ON c.id = pu.member_id
    JOIN member_wallet_transaction p
    ON p.id = pu.MaxPID
    WHERE pu.sts = '1'`;
    try {
        const result = await model.queryOne(sql);
        return (result.length > 0) ? result[0].total : 0;
    } catch (error) {
        console.log("getBalanceWallet have error :", error);
    }
};

module.exports.registerMemberTime = async(req) => {
    const sql = `SELECT count(id) as total FROM member WHERE cre_date BETWEEN '${req.start}' and '${req.end}'`;
    try {
        const result = await model.queryOne(sql);
        return (result.length > 0) ? result[0].total : 0;
    } catch (error) {
        console.log("getBalanceWallet have error :", error);
    }
};

module.exports.onlineMemberNow = async(start, end) => {
    const sql = `SELECT count(id) as total FROM member WHERE cre_date BETWEEN '${start}' and '${end}' or LastUpdate BETWEEN '${start}' and '${end}'`;
    try {
        const result = await model.queryOne(sql);
        return (result.length > 0) ? result[0].total : 0;
    } catch (error) {
        console.log("getBalanceWallet have error :", error);
    }
};


module.exports.getBalanceWalletDetail = async(memberId) => {
    const sql = `SELECT
                  mwt.id,
                  m.username,
                  mwt.balance,
                  mwt.amount,
                  mwt.wallet_type,
                  mwt.ref_table
                FROM
                member_wallet_transaction mwt
                LEFT JOIN member m ON mwt.member_id = m.id
                WHERE
                mwt.member_id = ${memberId}
                AND mwt.sts = '1'
                ORDER BY
                mwt.id DESC
                LIMIT 1`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("getBalanceWallet have error :", error);
    }
};

module.exports.queryAccountDeposit = async(req) => {
    const sql = "SELECT id,accnum,name,status,type FROM account_bank";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAccountDeposit have error :", error);
    }
};

module.exports.queryAccountWithdraw = async(req) => {
    const sql = "SELECT id,accnum,name,status,type FROM acc_withdraw";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAccountWithdraw have error :", error);
    }
};

module.exports.updateAccountDeposit = async(req) => {
    const sql =
        "UPDATE account_bank SET status = " +
        req.body.status +
        " WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateAccountDeposit have error :", error);
    }
};

module.exports.updateAccountWithdraw = async(req) => {
    const sql =
        "UPDATE acc_withdraw SET status = " +
        req.body.status +
        " WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateAccountWithdraw have error :", error);
    }
};

module.exports.updateAccountDepositDetail = async(req) => {
    const sql =
        "UPDATE account_bank SET username = '" +
        req.body.username +
        "' , password  = '" +
        req.body.password +
        "' , token = '" +
        req.body.token ? req.body.token : '' +
        "' WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateAccountDepositDetail have error :", error);
    }
};

module.exports.updateAccountWithdrawDetail = async(req) => {
    const sql =
        "UPDATE acc_withdraw SET username = '" +
        req.body.username +
        "' , password  = '" +
        req.body.password +
        "' WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateAccounWithdrawDetail have error :", error);
    }
};

module.exports.deleteDeposit = async(req) => {
    const sql = "DELETE FROM account_bank WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteDeposit have error :", error);
    }
};

module.exports.deleteWithdraw = async(req) => {
    const sql = "DELETE FROM acc_withdraw WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteWithdraw have error :", error);
    }
};

module.exports.insertDeposit = async(req) => {
    const sql = `INSERT INTO account_bank (accnum, name, username, password, type, token) VALUES ('${req.body.acc}','${req.body.name}','${req.body.device}','${req.body.pin}','${req.body.type}','${req.body.token ? req.body.token : ''}')`;
    try {
        console.log("🚀 ~ file: qdmbackend.js:3854 ~ module.exports.insertDeposit=async ~ sql:", sql)
        const result = await model.insertOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertPromotion have error :", error);
    }
};

module.exports.insertWithdraw = async(req) => {
    const sql =
        "INSERT INTO `acc_withdraw`(`id`, `accnum`, `name`, `username`, `password`, `status`,`type`) VALUES (null,'" +
        req.body.acc +
        "','" +
        req.body.name +
        "','" +
        req.body.device +
        "','" +
        req.body.pin +
        "',0,'" +
        req.body.type +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertWithdraw have error :", error);
    }
};

module.exports.updateWheelspinUser = async(req) => {
    const sql =
        "UPDATE member_wallet_transaction SET updated_at = '" +
        req.body.date +
        "' , sts  =  1 WHERE member_id = " +
        req.body.id +
        " AND wallet_type = 'bonus' AND ref_table = 'wheelspin' AND sts = 2";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateWheelspinUser have error :", error);
    }
};

module.exports.updateDateTimeWheelspinUser = async(req) => {
    const sql =
        "UPDATE wheel SET create_date = '" +
        req.body.date +
        "', sts = 1 WHERE user = '" +
        req.body.user +
        "'AND sts = 2";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateDateTimeWheelspinUser have error :", error);
    }
};

module.exports.querySettingGame = async(req) => {
    const sql = "SELECT * FROM setting_web";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingGame have error :", error);
    }
};

module.exports.queryPromotionByID = async(req) => {
    const sql = "SELECT * FROM `promotion` where id = " + req.body.pro_id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotionByID have error :", error);
    }
};

module.exports.queryCheckTransaction = async(req) => {
    const sql =
        "SELECT * FROM `transaction` where member_username = '" +
        req.body.username +
        "' AND type = 1 AND pro_id = 0";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckTransaction have error :", error);
    }
};

module.exports.queryCheckTransactionToday = async(req) => {
    const sql =
        "SELECT * FROM `transaction` where member_username = '" +
        req.body.username +
        "' AND type = 1 AND stats = 0 AND pro_id = 0 AND transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckTransactionToday have error :", error);
    }
};

module.exports.queryCheckTransactionTodayLast = async(req) => {
    const sql =
        "SELECT * FROM `transaction` where member_username = '" +
        req.body.username +
        "' AND type = 1 AND stats = 0 AND pro_id = 0 AND transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "' ORDER BY transaction_date DESC LIMIT 1";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckTransactionToday have error :", error);
    }
};

module.exports.queryCheckTransactionTodayWithdraw = async(req) => {
    const sql =
        "SELECT * FROM `transaction` where member_username = '" +
        req.body.username +
        "' AND type = 0 AND (stats = 0 OR stats = 3)  AND transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckTransactionTodayWithdraw have error :", error);
    }
};

module.exports.queryCheckTransactionByStats = async(req) => {
    const sql =
        "SELECT * FROM `transaction` where member_username = '" +
        req.body.username +
        "' AND type = 1 AND pro_id = 0 AND stats = " +
        req.body.stats;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckTransactionByStats have error :", error);
    }
};

module.exports.queryCheckReceiveRegisterPromotion = async(req) => {
    const sql =
        "SELECT * FROM `member_pomotion` INNER JOIN member_wallet_transaction ON member_wallet_transaction.id = member_pomotion.wallet_id where member_pomotion.member_id = " +
        req.body.id +
        " AND member_pomotion.flag = 1 AND member_pomotion.promotion_id = " +
        req.body.pro_id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckReceiveRegisterPromotion have error :", error);
    }
};

module.exports.queryCheckReceivePromotionAll = async(req) => {
    const sql =
        "SELECT * FROM `member_pomotion` INNER JOIN member_wallet_transaction ON member_wallet_transaction.id = member_pomotion.wallet_id where member_pomotion.member_id = " +
        req.body.id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckReceivePromotionAll have error :", error);
    }
};

module.exports.queryCheckReceivePromotionLast = async(req) => {
    const sql =
        "SELECT * FROM `member_pomotion` INNER JOIN promotion ON promotion.id = member_pomotion.promotion_id where member_pomotion.member_id = " +
        req.body.id +
        " AND member_pomotion.flag = 1";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckReceivePromotionLast have error :", error);
    }
};

module.exports.queryCheckReceiveCountPromotion = async(req) => {
    const sql =
        "SELECT * FROM `member_pomotion` WHERE member_id = " +
        req.body.id +
        " AND flag = 0 AND promotion_id = " +
        req.body.pro_id +
        " AND created_at BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckReceiveCountPromotion have error :", error);
    }
};

module.exports.createMemberPromotion = async(data) => {
    const sql = `INSERT INTO member_pomotion (member_id,promotion_id,wallet_id,wallet_balance,pro_type,pro_percen,pro_amount,pro_x_trun,pro_trun_amount,created_at,updated_at,flag)
    VALUES ('${data.member_id}','${data.promotion_id}','${data.wallet_id}','${data.wallet_balance}','${data.pro_type}','${data.pro_percen}','${data.pro_amount}','${data.pro_x_trun}','${data.pro_trun_amount}','${data.created_at}','${data.updated_at}','${data.flag}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createMemberPromotion have error :", error);
    }
};

module.exports.updateRefWallet = async(req) => {
    const sql =
        "UPDATE member_wallet_transaction SET ref_id = " +
        req.LastPromotionID +
        " WHERE id = " +
        req.body.LastWaleltID;

    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateRefWallet have error :", error);
    }
};

module.exports.updateRefWalletByMe = async(req) => {
    const sql =
        "UPDATE member_wallet_transaction SET ref_id = " +
        req.LastPromotionID +
        " WHERE id = " +
        req.LastWaleltID;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateRefWalletByMe have error :", error);
    }
};

module.exports.updateTransPromotion = async(req) => {
    const sql =
        "UPDATE transaction SET pro_id = " +
        req.idPromotion +
        " WHERE id = " +
        req.idTransaction;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateTransPromotion have error :", error);
    }
};

module.exports.queryCheckBalanceWalletByIDRef = async(req) => {
    const sql =
        "SELECT * FROM `member_wallet_transaction` where ref_id = " +
        req.balance_transaction +
        " AND wallet_type = 'deposit' AND (ref_table = 'transaction' OR ref_table = 'manual')";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckBalanceWalletByIDRef have error :", error);
    }
};

module.exports.queryMemberBankdetail = async(req) => {
    const sql =
        "SELECT * FROM member LEFT JOIN bank ON bank.bank_id = member.bank WHERE member.id = " +
        req.body.id;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberBankdetail have error :", error);
    }
};

module.exports.queryGetBank = async(req) => {
    const sql = "SELECT * FROM bank";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryGetBank have error :", error);
    }
};

module.exports.queryAllMemberSEL = async() => {
    const sql =
        "SELECT *,member.id FROM `member` LEFT JOIN bank on bank.bank_id = member.bank ORDER BY member.name ASC";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryAllMemberSEL have error :", error);
    }
};

module.exports.queryMemberTopupAll = async(req) => {
    const sql =
        "SELECT topup_files.file_name,transaction.transaction_date,transaction.created_at,transaction.member_username,transaction.remark,transaction.amount,transaction.created_by,transaction.stats FROM `transaction` LEFT JOIN `topup_files` ON topup_files.trans_id = transaction.id WHERE transaction.type = 1 AND (transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "')";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberTopupAll have error :", error);
    }
};

module.exports.queryMemberTopupBank = async(req) => {
    const sql =
        "SELECT topup_files.file_name,transaction.transaction_date,transaction.created_at,transaction.member_username,transaction.remark,transaction.amount,transaction.created_by,transaction.stats FROM `transaction` LEFT JOIN `topup_files` ON topup_files.trans_id = transaction.id WHERE transaction.type = 1 AND transaction.remark <> 'Manual'  AND (transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "')";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberTopupBank have error :", error);
    }
};

module.exports.queryMemberTopupManual = async(req) => {
    const sql =
        "SELECT topup_files.file_name,transaction.transaction_date,transaction.created_at,transaction.member_username,transaction.remark,transaction.amount,transaction.created_by,transaction.stats FROM `transaction` LEFT JOIN `topup_files` ON topup_files.trans_id = transaction.id WHERE transaction.type = 1 AND transaction.remark = 'Manual'  AND (transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "')";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberTopupManual have error :", error);
    }
};

module.exports.findPomotionById = async(memberId) => {
    const sql = `SELECT * FROM member_pomotion t1
                WHERE t1.member_id=${memberId}
                AND flag = '1'`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("findPomotionById have error :", error);
    }
};

module.exports.findPomotionById1 = async(memberId) => {
    const sql = `SELECT * FROM member_pomotion t1 INNER JOIN promotion ON promotion.id = t1.promotion_id
                WHERE t1.member_id=${memberId}
                AND flag = '1' AND promotion.type = 1`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("findPomotionById1 have error :", error);
    }
};

module.exports.findPomotionByIdGame = async(memberId) => {
    const sql = `SELECT * FROM member_pomotion t1 INNER JOIN promotion ON promotion.id = t1.promotion_id
                WHERE t1.member_id=${memberId}
                AND flag = '1' AND promotion.type = 2`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("findPomotionByIdGame have error :", error);
    }
};

module.exports.updateLastLogin = async(req) => {
    const sql =
        "UPDATE member SET LastUpdate = '" +
        req.body.time +
        "'WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateLastLogin have error :", error);
    }
};
//###

module.exports.queryPromotionUser = async(MemberID) => {
    const sql =
        "SELECT *,promotion.id AS pro_id,member_pomotion.id AS pid FROM member_pomotion INNER JOIN promotion ON promotion.id = member_pomotion.promotion_id WHERE member_id = " +
        MemberID +
        " AND flag = 1";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryPromotionUser have error :", error);
    }
};

module.exports.updateMoneyPromotionThree = async(req) => {
    const sql =
        "UPDATE member_pomotion SET wallet_balance = " +
        req.wallet_balance +
        ", pro_trun_amount = " +
        req.pro_trun_amount +
        " WHERE id = " +
        req.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateMoneyPromotionThree have error :", error);
    }
};

module.exports.updateFlagPromotion = async(req) => {
    const sql =
        "UPDATE member_pomotion SET flag = " + req.flag + " WHERE id = " + req.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateMoneyPromotionThree have error :", error);
    }
};

module.exports.queryNewMemberToday = async(req) => {
    const sql =
        "SELECT * FROM member WHERE cre_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryNewMemberToday have error :", error);
    }
};

module.exports.queryMemberAllCount = async(req) => {
    const sql = "SELECT * FROM member";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberAllCount have error :", error);
    }
};

module.exports.queryMemberOnline = async(req) => {
    const sql =
        "SELECT *,ufa_acc.username AS ufa_user FROM member LEFT JOIN ufa_acc ON ufa_acc.member_username = member.username WHERE ufa_acc.type_api = 'ufa' AND LastUpdate BETWEEN '" +
        req.dateOnlineStart +
        "' AND '" +
        req.dateOnlineEnd +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberOnline have error :", error);
    }
};

module.exports.queryMemberOnlineToday = async(req) => {
    const sql =
        "SELECT *,ufa_acc.username AS ufa_user FROM member LEFT JOIN ufa_acc ON ufa_acc.member_username = member.username WHERE ufa_acc.type_api = 'ufa'AND  LastUpdate BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberOnlineToday have error :", error);
    }
};

module.exports.queryDepositToday = async(req) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM transaction WHERE type = 1 AND stats = 0 AND transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDepositToday have error :", error);
    }
};

module.exports.queryActiveToday = async(req) => {
    const sql =
        `SELECT COUNT(DISTINCT member_username) as active FROM transaction WHERE type <> 2 AND transaction_date BETWEEN '${req.body.start}' and '${req.body.end}'`;
    try {
        const result = await model.queryOne(sql);
        return result;
    } catch (error) {
        console.log("queryDepositToday have error :", error);
    }
};

module.exports.queryActiveMonth = async(start, end) => {
    console.log("🚀 ~ file: qdmbackend.js:4464 ~ module.exports.queryActiveMonth=async ~ end:", end)
    console.log("🚀 ~ file: qdmbackend.js:4464 ~ module.exports.queryActiveMonth=async ~ start:", start)
    const sql =
        `SELECT COUNT(DISTINCT member_username) as active FROM transaction WHERE type <> 2 AND transaction_date BETWEEN '${start}' and '${end}'`;
    try {
        const result = await model.queryOne(sql);
        return result;
    } catch (error) {
        console.log("queryDepositToday have error :", error);
    }
};

module.exports.queryWithdrawToday = async(req) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM transaction WHERE type = 0 AND (stats = 0 OR stats = 3) AND transaction_date BETWEEN '" +
        req.body.start +
        "' AND '" +
        req.body.end +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawToday have error :", error);
    }
};

module.exports.queryDepositMonth = async(req) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM transaction WHERE type = 1 AND stats = 0 AND transaction_date LIKE '" +
        req.body.dateMonth +
        "%'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryDepositMonth have error :", error);
    }
};

module.exports.queryWithdrawMonth = async(req) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM transaction WHERE type = 0 AND (stats = 0 OR stats = 3) AND transaction_date LIKE '" +
        req.body.dateMonth +
        "%'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWithdrawMonth have error :", error);
    }
};
module.exports.querySettingWinloss = async() => {
    const sql = `SELECT * FROM setting_winloss`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingWinloss have error :", error);
    }
};

module.exports.createHistoryWinloss = async(data) => {
    const sql = `INSERT INTO history_winloss (username,winloss,bonus,cr_date)
    VALUES ('${data.username}',${data.winloss},${data.bonus},'${data.cr_date}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createHistoryWinloss have error :", error);
    }
};


module.exports.queryHistoryWinloss = async(req) => {
    const sql = `SELECT * FROM history_winloss WHERE username = '${req.username}' AND cr_date BETWEEN '${req.Dstart}' AND '${req.Dend}'`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryHistoryWinloss have error :", error);
    }
};

module.exports.querySettingsWebWinLoss = async() => {
    const sql = "SELECT * FROM setting_winloss";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingsWebWinLoss have error :", error);
    }
};

module.exports.updateSettingWinLoss = async(req) => {
    const sql =
        "UPDATE setting_winloss SET description = '" +
        req.body.description +
        "', img_name = '" +
        req.body.img_name +
        "', days = " +
        req.body.days +
        ", days_th = '" +
        req.body.days_th +
        "', amount = " +
        req.body.amount +
        ", stats = " +
        req.body.stats +
        " WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingWinLoss have error :", error);
    }
};

module.exports.updateSettingBanner = async(req) => {
    const sql = `INSERT INTO setting_banner (bname,img_name,checkhome,checkuser,border,state) VALUES
	('${req.body.name_banner}','${req.body.img_name}','${req.body.banner_checkhome}','${req.body.banner_checkuser}','${req.body.banner_order}','${req.body.banner_status}');`;
    // "UPDATE setting_winloss SET description = '" +
    // req.body.description +
    // "', img_name = '" + req.body.img_name + "', days = " + req.body.days + ", days_th = '" + req.body.days_th + "', amount = " + req.body.amount + ", stats = " + req.body.stats + " WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingBanner have error :", error);
    }
};

module.exports.querySettingBanner = async(req) => {
    const sql = `SELECT * FROM setting_banner`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingBanner have error :", error);
    }
};

module.exports.updateSettingPopup = async(req) => {
    const sql = `INSERT INTO setting_popup (bname,description,img_name,state) VALUES
	('${req.body.name_popup}','${req.body.des_popup}','${req.body.img_name}','${req.body.popup_status}');`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingPopup have error :", error);
    }
};

module.exports.querySettingPopup = async(req) => {
    const sql = `SELECT * FROM setting_popup`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingPopup have error :", error);
    }
};

module.exports.updateSettingVip = async(req) => {
    console.log(req.body);
    const sql = `UPDATE setting_vipgroup SET line = '${req.body.line_groupvip}',description = '${req.body.text_groupvip}' WHERE id = 1;`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingPopup have error :", error);
    }
};

module.exports.querySettingVip = async(req) => {
    const sql = `SELECT * FROM setting_vipgroup`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingPopup have error :", error);
    }
};

module.exports.updateSettingDoc = async(req) => {
    console.log(req.body);
    const sql = `INSERT INTO setting_doc (bname,link,state) VALUES
	('${req.body.name_doc}','${req.body.url_doc}','${req.body.doc_status}');`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingPopup have error :", error);
    }
};

module.exports.querySettingDoc = async(req) => {
    const sql = `SELECT * FROM setting_doc`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingPopup have error :", error);
    }
};

module.exports.deleteDataImg = async(req) => {
    const sql = `DELETE FROM ${req.mode} WHERE id = ${req.id}`;
    // console.log(sql);
    try {
        const result = await model.deleteOne(sql);
        // console.log(result);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingPopup have error :", error);
    }
};

module.exports.updateTransactionUnSuccess = async(req) => {
    const sql =
        "UPDATE transaction SET stats = 0,update_by = '" +
        req.admin +
        "',member_username = '" +
        req.username +
        "' WHERE id = " +
        req.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateTransactionUnSuccess have error :", error);
    }
};

module.exports.updateOTPTruewalletDeposit = async(req) => {
    const sql =
        "UPDATE account_bank SET otp = '" +
        req.otp +
        "' WHERE accnum = " +
        req.accnum;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateOTPTruewalletDeposit have error :", error);
    }
};

module.exports.updateOTPTruewalletWithdraw = async(req) => {
    const sql =
        "UPDATE acc_withdraw SET otp = '" +
        req.otp +
        "' WHERE accnum = " +
        req.accnum;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateOTPTruewalletWithdraw have error :", error);
    }
};

module.exports.querySettingTruewallet = async() => {
    const sql = "SELECT * FROM setting_truewallet";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querySettingTruewallet have error :", error);
    }
};

module.exports.updateSettingTruewallet = async(req) => {
    const sql =
        "UPDATE setting_truewallet SET limit_exchange = '" +
        req.body.phone +
        "', accnum = '" +
        req.body.accnum +
        "', stats = " +
        req.body.stats +
        " WHERE id = 1";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingTruewallet have error :", error);
    }
};
module.exports.updateSettingGameWeb = async(data) => {
    const sql =
        "UPDATE setting_web SET sts = " +
        data.sts +
        " WHERE game = '" +
        data.type +
        "'";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingGameWeb have error :", error);
    }
};

module.exports.queryMemberPartnerType = async(data) => {
    const sql = `SELECT * FROM member_partner_type WHERE sts = '1'`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMemberPartnerType have error :", error);
    }
};

module.exports.queryConvertMember = async(req) => {
    const { username } = req.body;
    const sql = `SELECT * FROM ufa_acc WHERE username = '${username}'`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryConvertMember have error :", error);
    }
};

module.exports.queryConvertMemberPartner = async(req) => {
    const { username } = req.body;
    const sql = `SELECT t1.*,t3.username,t3.name FROM ufa_acc t1
  LEFT JOIN member_partner t2 ON t1.id = t2.member_id
  LEFT JOIN member t3 ON t2.member_id_partner = t3.id
  WHERE t1.username = '${username}'`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryConvertMemberPartner have error :", error);
    }
};

module.exports.queryAffCasino = async(req) => {
    const sql = `SELECT aff_m FROM seting`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLottoDeprive have error :", error);
    }
};

module.exports.setAffCasino = async(req) => {
    const sql = `UPDATE seting SET aff_m = ${req.body.aff_m}`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("setAffCasino have error :", error);
    }
};

module.exports.queryMenuLv1 = async(GameSetting) => {
    let result = "";
    if (GameSetting.ufa == 1 && GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'ufa' OR type = 'lotto')";
    } else if (GameSetting.ufa == 1) {
        result = " AND (type = 'all' OR type = 'ufa')";
    } else if (GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'lotto')";
    }

    const sql = `SELECT * FROM tb_menu WHERE lv_menu = 'lv1' ${result}  AND sts = 1  ORDER BY order_id ASC`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuLv1 have error :", error);
    }
};

module.exports.queryMenuSTAFFLv1 = async(GameSetting) => {
    let result = "";
    if (GameSetting.ufa == 1 && GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'ufa' OR type = 'lotto')";
    } else if (GameSetting.ufa == 1) {
        result = " AND (type = 'all' OR type = 'ufa')";
    } else if (GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'lotto')";
    }

    const sql = `SELECT * FROM tb_menu INNER JOIN tb_menu_permission ON tb_menu_permission.menu_id = tb_menu.id WHERE lv_menu = 'lv1' AND tb_menu_permission.admin_id = ${GameSetting.adminID} ${result}  AND sts = 1 AND tb_menu_permission.menu_view = 1 ORDER BY order_id ASC`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuSTAFFLv1 have error :", error);
    }
};

module.exports.queryMenuStaffParent_lv1 = async(GameSetting) => {
    let result = "";
    if (GameSetting.ufa == 1 && GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'ufa' OR type = 'lotto')";
    } else if (GameSetting.ufa == 1) {
        result = " AND (type = 'all' OR type = 'ufa')";
    } else if (GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'lotto')";
    }

    const sql = `SELECT * FROM tb_menu INNER JOIN tb_menu_permission ON tb_menu_permission.menu_id = tb_menu.id WHERE tb_menu.lv_menu = 'lv2' AND tb_menu_permission.admin_id = ${GameSetting.adminID} AND tb_menu.parent_lv1 = ${GameSetting.parent_lv1} ${result} AND tb_menu.sts = 1 AND tb_menu_permission.menu_view = 1  ORDER BY order_id ASC`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuStaffParent_lv1 have error :", error);
    }
};

module.exports.queryMenuStaff = async(GameSetting) => {
    let result = "";
    if (GameSetting.ufa == 1 && GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'ufa' OR type = 'lotto')";
    } else if (GameSetting.ufa == 1) {
        result = " AND (type = 'all' OR type = 'ufa')";
    } else if (GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'lotto')";
    }

    const sql = `SELECT * FROM tb_menu WHERE sts = 1  ${result}  ORDER BY order_id ASC`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuStaff have error :", error);
    }
};

module.exports.queryMenuParent_lv1 = async(GameSetting) => {
    let result = "";
    if (GameSetting.ufa == 1 && GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'ufa' OR type = 'lotto')";
    } else if (GameSetting.ufa == 1) {
        result = " AND (type = 'all' OR type = 'ufa')";
    } else if (GameSetting.lotto == 1) {
        result = " AND (type = 'all' OR type = 'lotto')";
    }

    const sql = `SELECT * FROM tb_menu WHERE lv_menu = 'lv2' AND parent_lv1 = ${GameSetting.parent_lv1} ${result} AND sts = 1  ORDER BY order_id ASC`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryReportLottoSummary = async(req) => {
    const sql = `SELECT
	a.username,
	e.order_id AS bill_code,
	e.note AS bill_name,
	c.lotto_group_id,
	f.group_name,
	b.lotto_type,
	c.lotto_name,
	b.lotto_reward_type,
	d.reward_name,
	b.lotto_date,
	count( b.numbers ) numbrt_cnt,#จำนวนไม้่
	sum( b.amount ) AS bet,
	sum(
	b.winner_amount) AS win_amt,#ยอดจ่ายสูงสัด
	b.winner_flg,
	b.flag,
	g.affiliate_rate AS aff_rate,
	sum( round( b.amount * g.affiliate_rate / 100, 2 )*- 1 ) AS aff_amount
FROM
	tb_users AS a
	LEFT JOIN tb_lotto_number_data AS b ON a.id = b.user_id
	INNER JOIN tb_lotto_type AS c ON b.lotto_type = c.id
	INNER JOIN tb_lotto_group AS f ON c.reward_group_id = f.lotto_group_id
	INNER JOIN tb_lotto_reward_type AS d ON b.lotto_reward_type = d.id
	LEFT JOIN tb_order AS e ON b.order_id = e.order_id
	INNER JOIN tb_lotto_reward_config AS g ON b.user_id = g.user_id
	AND b.lotto_type = g.lotto_type
	AND b.lotto_reward_type = g.lotto_reward_type
WHERE
	b.flag = 1
	and b.lotto_date = '${req.lottoDate}'
GROUP BY
	b.user_id,
	c.lotto_group_id,
	b.lotto_type;`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryReportLottoSummaryMember = async(req) => {
    const sql = `SELECT
	a.username,
	a.username,
	e.order_num AS bill_code,
	e.note AS bill_name,
	c.lotto_group_id,
	f.group_name,
	b.lotto_type,
	c.lotto_name,
	b.lotto_reward_type,
	d.reward_name,
	b.lotto_date,
	count( b.numbers ) numbrt_cnt,#จำนวนไม้่
	sum( b.amount ) AS bet,
	sum(
	b.winner_amount) AS win_amt,#ยอดจ่ายสูงสัด
	b.winner_flg,
	b.flag,
	g.affiliate_rate AS aff_rate,
	sum( round( b.amount * g.affiliate_rate / 100, 2 )*- 1 ) AS aff_amount
FROM
	tb_users AS a
	LEFT JOIN tb_lotto_number_data AS b ON a.id = b.user_id
	INNER JOIN tb_lotto_type AS c ON b.lotto_type = c.id
	INNER JOIN tb_lotto_group AS f ON c.reward_group_id = f.lotto_group_id
	INNER JOIN tb_lotto_reward_type AS d ON b.lotto_reward_type = d.id
	LEFT JOIN tb_order AS e ON b.order_id = e.order_id
	INNER JOIN tb_lotto_reward_config AS g ON b.user_id = g.user_id
	AND b.lotto_type = g.lotto_type
	AND b.lotto_reward_type = g.lotto_reward_type
WHERE
	b.flag = ${req.flag} and
	#b.lotto_reward_type = ${req.id} and
	b.lotto_type = ${req.lotto_type}
GROUP BY
b.user_id,
	c.lotto_group_id,
	b.lotto_type;`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryReportLottoSummaryMember2 = async(req) => {
    const sql = `SELECT
	a.username,
	a.username,
	e.order_num AS bill_code,
	e.note AS bill_name,
	c.lotto_group_id,
	f.group_name,
	b.lotto_type,
	c.lotto_name,
	b.lotto_reward_type,
	d.reward_name,
	b.lotto_date,
	count( b.numbers ) numbrt_cnt,#จำนวนไม้่
	sum( b.amount ) AS bet,
	sum(
	b.winner_amount) AS win_amt,#ยอดจ่ายสูงสัด
	b.winner_flg,
	b.flag,
	g.affiliate_rate AS aff_rate,
	sum( round( b.amount * g.affiliate_rate / 100, 2 )*- 1 ) AS aff_amount
FROM
	tb_users AS a
	LEFT JOIN tb_lotto_number_data AS b ON a.id = b.user_id
	INNER JOIN tb_lotto_type AS c ON b.lotto_type = c.id
	INNER JOIN tb_lotto_group AS f ON c.reward_group_id = f.lotto_group_id
	INNER JOIN tb_lotto_reward_type AS d ON b.lotto_reward_type = d.id
	LEFT JOIN tb_order AS e ON b.order_id = e.order_id
	INNER JOIN tb_lotto_reward_config AS g ON b.user_id = g.user_id
	AND b.lotto_type = g.lotto_type
	AND b.lotto_reward_type = g.lotto_reward_type
WHERE
	b.flag = ${req.flag} and
	b.lotto_reward_type = ${req.id} and
	b.lotto_date = '${req.lottoDate}' and
	b.lotto_type = ${req.lotto_type}
GROUP BY
b.user_id,
	c.lotto_group_id,
	b.lotto_type;`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryReportLottoSummaryNumber = async(req) => {
    const sql = `SELECT
	a.username,
	a.username,
	e.order_num AS bill_code,
	e.note AS bill_name,
	c.lotto_group_id,
	f.group_name,
	b.lotto_type,
	c.lotto_name,
	b.lotto_reward_type,
	d.reward_name,
	b.lotto_date,
	b.numbers,
	count( b.numbers ) numbrt_cnt,#จำนวนไม้่
	sum( b.amount ) AS bet,
	sum(b.winner_amount) AS win_amt,#ยอดจ่ายสูงสัด
	b.winner_flg,
	b.flag,
	g.affiliate_rate AS aff_rate,
	sum( round( b.amount * g.affiliate_rate / 100, 2 )*- 1 ) AS aff_amount
FROM
	tb_users AS a
	LEFT JOIN tb_lotto_number_data AS b ON a.id = b.user_id
	INNER JOIN tb_lotto_type AS c ON b.lotto_type = c.id
	INNER JOIN tb_lotto_group AS f ON c.reward_group_id = f.lotto_group_id
	INNER JOIN tb_lotto_reward_type AS d ON b.lotto_reward_type = d.id
	LEFT JOIN tb_order AS e ON b.order_id = e.order_id
	INNER JOIN tb_lotto_reward_config AS g ON b.user_id = g.user_id
	AND b.lotto_type = g.lotto_type
	AND b.lotto_reward_type = g.lotto_reward_type
WHERE
	b.flag = ${req.flag} and
	b.lotto_reward_type = ${req.id} and
	b.lotto_date = '${req.lottoDate}' and
	b.lotto_type = ${req.lotto_type}
GROUP BY
	b.numbers,
	b.lotto_reward_type;`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoRewardType = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_type`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoRewardTypeByGroup = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_type WHERE reward_group_id = ${req}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("reward_group_id have error :", error);
    }
};

module.exports.queryLastIDMenu = async(req) => {
    const sql = `SELECT * FROM tb_menu`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLastIDMenu have error :", error);
    }
};

module.exports.queryLottoTypeCustom = async(req) => {
    const sql = `SELECT * FROM tb_lotto_type_yeekee where id = ${req.lottoType}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoConfigCustomYeeKee = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_config where user_id = 2 and lotto_type = 1359`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoConfigCustomYeeKeeById = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_config where id = ${req}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoRewardTypeWhere = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_type where id = ${req}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoRewardGroupWhere = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_type WHERE reward_group_id = ${req}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoRewardConfigCustomYeeKee = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_config_limit WHERE user_id = 2 AND lotto_type = 1359 AND lotto_reward_type = ${req}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.queryLottoRewardConfigLimitYeeKee = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_config_limit WHERE user_id = 2 AND lotto_reward_type = ${req.lotto_reward_type} AND lotto_type = ${req.lotto_type} ORDER BY lotto_type,lotto_reward_type asc`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryMenuParent_lv1 have error :", error);
    }
};

module.exports.updateLottoConfig = async(data) => {
    const sql = `UPDATE tb_lotto_reward_config SET play_min = '${data.play_min}',play_max = '${data.play_max}',reward = '${data.reward}'
	WHERE lotto_type >= 48 AND lotto_type <= 135 AND lotto_reward_type = ${data.lotto_reward_type} OR lotto_type = 1359 AND lotto_reward_type = ${data.lotto_reward_type}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateLottoConfig have error :", error);
    }
};

module.exports.updateLottoConfigAll = async(data) => {
    const sql = `UPDATE tb_lotto_reward_config SET play_min = '${data.play_min}',play_max = '${data.play_max}',reward = '${data.reward}'
	WHERE id = ${data.id}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateLottoConfig have error :", error);
    }
};

module.exports.updateLottoConfigLimit = async(data) => {
    const sql = `UPDATE tb_lotto_reward_config_limit SET reward = '${data.reward}',max = '${data.max}',min = '${data.min}' WHERE id = ${data.id}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateLottoConfigLimit have error :", error);
    }
};

module.exports.updateLottoTypeYeekee = async(data) => {
    const sql = `UPDATE tb_lotto_type_yeekee SET profit_min = ${data.profit_min},profit_max = ${data.profit_max} WHERE id = 1`;
    const sql2 = `UPDATE tb_lotto_type SET profit_min = ${data.profit_min},profit_max = ${data.profit_max} WHERE id >= 48 AND id <= 135`;
    try {
        const result = await modelLotto.queryOne(sql);
        const result2 = await modelLotto.queryOne(sql2);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateLottoConfigLimit have error :", error);
    }
};

// =====================    Lotto   ===============================
module.exports.queryLottoType = async(req) => {
    const sql = `SELECT * FROM tb_lotto_type`;
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLottoType have error :", error);
    }
};

module.exports.queryLottoDate = async(req) => {
    const sql = `SELECT lotto_date FROM tb_lotto_type WHERE id =  '${req.body.lottoType}'`;
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLottoDate have error :", error);
    }
};
module.exports.queryLottoReward = async(req) => {
    const sql = `SELECT *,tb_lotto_reward_type.id AS rid FROM tb_lotto_type INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.reward_group_id = tb_lotto_type.reward_group_id WHERE tb_lotto_type.id =  '${req.body.lottoType}'`;
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLottoReward have error :", error);
    }
};

module.exports.queryLottoDeprive = async(req) => {
    let wheres = "";
    if (req.body.lottoDate != 0) {
        wheres = " AND lotto_date = '" + req.body.lottoDate + "'";
    }
    const sql = `SELECT *,t1.id as id_number FROM tb_lotto_deprive t1 INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.id = t1.lotto_reward_type WHERE lotto_type =  '${req.body.lottoType}' ${wheres}`;
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLottoDeprive have error :", error);
    }
};

// =====================    Lotto   ===============================

module.exports.queryLastRegister = async(req) => {
    const sql = `SELECT * FROM member INNER JOIN bank ON bank.bank_id = member.bank ORDER BY cre_date DESC LIMIT 5`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLastRegister have error :", error);
    }
};

module.exports.queryLastDeposit = async(req) => {
    const sql = `SELECT * FROM transaction WHERE type = 1 AND stats = 0 ORDER BY transaction_date DESC LIMIT 5`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLastDeposit have error :", error);
    }
};

module.exports.queryLastWithdraw = async(req) => {
    const sql = `SELECT * FROM transaction WHERE type = 0 AND (stats = 0 OR stats = 3) ORDER BY transaction_date DESC LIMIT 5`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLastWithdraw have error :", error);
    }
};

module.exports.queryWinLossGame = async(req) => {
    const { startDate, endDate } = req.body;
    let sql = "";
    if (startDate === endDate) {
        sql = `SELECT COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(wl),0)AS amount,COALESCE(SUM(aff),0)AS aff, ufa_acc.member_username AS member,ufa_acc.username AS username FROM history_tran_winloss INNER JOIN ufa_acc ON ufa_acc.username = history_tran_winloss.username WHERE date like '${startDate}%'`;
    } else {
        sql = `SELECT COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(wl),0)AS amount,COALESCE(SUM(aff),0)AS aff, ufa_acc.member_username AS member,ufa_acc.username AS username FROM history_tran_winloss INNER JOIN ufa_acc ON ufa_acc.username = history_tran_winloss.username WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWinLossGame have error :", error);
    }
};

module.exports.queryTurnoverAll = async(date) => {
    const sql =
        "SELECT SUM(turnover) AS amount FROM history_turnover WHERE date = '" +
        date +
        "'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTurnoverAll have error :", error);
    }
};

module.exports.queryTurnoverAllMonth = async(date) => {
    const sql =
        "SELECT SUM(turnover) AS amount FROM history_turnover WHERE date LIKE '%" +
        date +
        "'";

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTurnoverAllMonth have error :", error);
    }
};

module.exports.queryWinlossLotto = async(date) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM tb_lotto_number_data WHERE date_time_add LIKE '" +
        date +
        "%' AND flag = 2 AND winner_flg = 0";
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWinlossLotto have error :", error);
    }
};

module.exports.queryWinlossLottoWinner = async(date) => {
    const sql =
        "SELECT SUM(winner_amount) AS amount FROM tb_lotto_number_data WHERE date_time_add LIKE '" +
        date +
        "%' AND flag = 2 AND winner_flg = 1";
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWinlossLottoWinner have error :", error);
    }
};

module.exports.queryWinlossLottoAll = async(date) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM tb_lotto_number_data WHERE date_time_add LIKE '" +
        date +
        "%'";
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryWinlossLottoAll have error :", error);
    }
};

module.exports.querydataAF = async(date) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM data_aff WHERE date LIKE '" +
        date +
        "%' AND state = 1";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querydataAF have error :", error);
    }
};

module.exports.querydataBET = async(date) => {
    const sql =
        "SELECT SUM(amount) AS amount FROM tb_lotto_number_data WHERE date_time_add LIKE '" +
        date +
        "%' AND flag = 1";
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("querydataBET have error :", error);
    }
};

module.exports.queryTransactionAll = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = "SELECT * FROM view_member_transaction";
    if (startDate === endDate && startDate != false) {
        sql += ` WHERE created_at like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`;
    }
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            console.log(`newData:`, result);
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:5678 ~ module.exports.queryTransactionAll=async ~ error:", error)
    }
};

module.exports.queryTransactionAllNocache = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = "SELECT * FROM view_member_transaction";
    if (startDate === endDate && startDate != false) {
        sql += ` WHERE created_at like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE created_at BETWEEN '${startDate}' AND '${endDate}'`;
    }
    try {
        const result = await model.queryOne(sql);
        // let result = await checkCache(md5(sql));
        // if (!result) {
        //     console.log(`newData:`, result);
        //     const data = await model.queryOne(sql);
        //     result = await saveCache(md5(sql), data);
        // }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:5702 ~ module.exports.queryTransactionAllNocache=async ~ error:", error)
    }
};

module.exports.queryTransactionGame = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = "SELECT * FROM view_member_history_ufa";

    if (startDate === endDate && startDate != false) {
        sql += ` WHERE date like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    sql += ` order by date desc`;
    try {
        // const result = await model.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:5727 ~ module.exports.queryTransactionGame=async ~ error:", error)
    }
};

module.exports.queryTransactionGameNocache = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = "SELECT * FROM view_member_history_ufa";
    if (startDate === endDate && startDate != false) {
        sql += ` WHERE date like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    sql += ` order by date desc`;
    try {
        const result = await model.queryOne(sql);
        // let result = await checkCache(md5(sql));
        // if (!result) {
        //     const data = await model.queryOne(sql);
        //     result = await saveCache(md5(sql), data);
        // }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:5751 ~ module.exports.queryTransactionGameNocache=async ~ error:", error)
    }
};

module.exports.queryTransactionLotto = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = `SELECT user_key,
    (select username from tb_users where id = user_key) as username,
    lotto_name,
    amount,
    date_time_add,
    winloss,
    amount,
    order_id
    FROM view_history_order_number`;
    if (startDate === endDate && startDate != false) {
        sql += ` WHERE date_time_add like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE date_time_add BETWEEN '${startDate}' AND '${endDate}'`;
    }
    try {
        // const result = await modelLotto.queryOne(sql);
        let result = await checkCache(md5(sql));
        if (!result) {
            const data = await modelLotto.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:5782 ~ module.exports.queryTransactionLotto=async ~ error:", error)
    }
};

module.exports.queryTransactionLottoNocache = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let sql = `SELECT user_key,
    (select username from tb_users where id = user_key) as username,
    lotto_name,
    amount,
    date_time_add,
    winloss,
    amount,
    order_id
    FROM view_history_order_number`;
    if (startDate === endDate && startDate != false) {
        sql += ` WHERE date_time_add like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE date_time_add BETWEEN '${startDate}' AND '${endDate}'`;
    }
    try {
        const result = await modelLotto.queryOne(sql);
        // let result = await checkCache(md5(sql));
        // if (!result) {
        //     const data = await modelLotto.queryOne(sql);
        //     result = await saveCache(md5(sql), data);
        // }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:5813 ~ module.exports.queryTransactionLottoNocache=async ~ error:", error)
    }
};

module.exports.queryMemberAllCustom = async(date) => {
    const sql = "SELECT id,username FROM member";
    try {
        const result = await model.queryOne(sql);
        return result;
    } catch (error) {
        console.log("queryMemberAllCustom have error :", error);
    }
};

module.exports.queryMemberAllCustomLotto = async(date) => {
    const sql = "SELECT id,username FROM tb_users";
    try {
        const result = await modelLotto.queryOne(sql);
        return result;
    } catch (error) {
        console.log("queryMemberAllCustomLotto have error :", error);
    }
};

module.exports.queryTransactionWithId = async(req) => {
    let sql = `SELECT t1.*,t2.created_by,t2.remark,t2.response_api,t3.name FROM view_member_transaction t1 JOIN transaction t2 ON t1.transaction_id = t2.id JOIN member t3 ON t1.member_username = t3.username WHERE t2.id = '${req}'`;
    try {
        const result = await model.queryOne(sql);
        return result;
    } catch (error) {
        console.log("querydataBET have error :", error);
    }
};

module.exports.queryTransactionLottoWithId = async(req) => {
    let sql = `SELECT * from view_lotto_number_data_V2 WHERE order_id = '${req}'`;
    try {
        const result = await modelLotto.queryOne(sql);
        return result;
    } catch (error) {
        console.log("querydataBET have error :", error);
    }
};

module.exports.queryTransactionGameWithId = async(req) => {
    let sql = `SELECT t1.*,t2.name FROM view_member_history_ufa t1 JOIN member t2 ON t1.member_username = t2.username WHERE refno = '${req}'`;
    try {
        const result = await model.queryOne(sql);
        return result;
    } catch (error) {
        console.log("querydataBET have error :", error);
    }
};

module.exports.queryGetTransactionMember = async(req) => {
    let qs = "type = -1";
    let us = "";
    if (req.body.deposit == 1) {
        qs += " OR type = 1";
    }
    if (req.body.withdraw == 1) {
        qs += " OR type = 0";
    }
    if (req.body.pubyod == 1) {
        qs += " OR type = 2";
    }
    if (req.body.username != "") {
        us = "member_username = '" + req.body.username + "' AND";
    }
    const sql = `SELECT transaction.id AS tid,transaction.member_username AS username,transaction.type,transaction.transaction_date,transaction.amount,transaction.stats,member.name,transaction.remark,bank.color FROM transaction LEFT JOIN member ON member.username = transaction.member_username LEFT JOIN bank ON bank.bank_id = LOWER(transaction.remark)  WHERE ${us} transaction_date BETWEEN  '${req.body.startDate}' AND '${req.body.endDate}' AND (${qs}) ORDER BY transaction_date DESC`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryGetTransactionMember have error :", error);
    }
};

module.exports.lottoWin = async(data) => {
    const sql = `SELECT tb_users.username,SUM(tb_lotto_number_data.winner_amount) AS amount FROM tb_lotto_number_data INNER JOIN tb_users ON tb_users.id = tb_lotto_number_data.user_id WHERE date_time_add = '${data.body.date}%' AND tb_lotto_number_data.flag = 2 AND tb_lotto_number_data.winner_flg = 1 GROUP BY tb_users.username`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("lottoWin have error :", error);
    }
};

module.exports.lottoLoss = async(data) => {
    const sql = `SELECT tb_users.username,SUM(tb_lotto_number_data.amount) AS amount FROM tb_lotto_number_data INNER JOIN tb_users ON tb_users.id = tb_lotto_number_data.user_id WHERE date_time_add = '${data.body.date}%' AND tb_lotto_number_data.flag = 2 AND tb_lotto_number_data.winner_flg = 0 GROUP BY tb_users.username`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("lottoLoss have error :", error);
    }
};

module.exports.lottoWinMonth = async(data) => {
    const sql = `SELECT tb_users.username,SUM(tb_lotto_number_data.winner_amount) AS amount FROM tb_lotto_number_data INNER JOIN tb_users ON tb_users.id = tb_lotto_number_data.user_id WHERE date_time_add LIKE '${data.start_month}%' AND tb_lotto_number_data.flag = 2 AND tb_lotto_number_data.winner_flg = 1 GROUP BY tb_users.username`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("lottoWinMonth have error :", error);
    }
};

module.exports.lottoLossMonth = async(data) => {
    const sql = `SELECT tb_users.username,SUM(tb_lotto_number_data.amount) AS amount FROM tb_lotto_number_data INNER JOIN tb_users ON tb_users.id = tb_lotto_number_data.user_id WHERE date_time_add LIKE '${data.start_month}%' AND tb_lotto_number_data.flag = 2 AND tb_lotto_number_data.winner_flg = 0 GROUP BY tb_users.username`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("lottoLossMonth have error :", error);
    }
};

module.exports.queryLastDepositMonth = async(data) => {
    const sql = `SELECT * FROM transaction WHERE transaction_date LIKE '${data.start_month}%' AND type = 1 AND stats = 0 ORDER BY id DESC limit 10`;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLastDepositMonth have error :", error);
    }
};

module.exports.queryTopDepositMonth = async(data) => {
    const sql = `SELECT member_username,SUM(amount) as amount FROM transaction  WHERE transaction_date LIKE '${data.start_month}%' AND type = 1 AND stats = 0 GROUP BY member_username ORDER BY amount DESC LIMIT 10`;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTopDepositMonth have error :", error);
    }
};

module.exports.queryTopWithdrawMonth = async(data) => {
    const sql = `SELECT member_username,SUM(amount) as amount FROM transaction WHERE transaction_date LIKE '${data.start_month}%' AND type = 0 and (stats = 0 OR stats = 3) GROUP BY member_username ORDER BY amount DESC limit 10`;

    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryTopWithdrawMonth have error :", error);
    }
};

module.exports.updateTransaction = async(req) => {
    const sql =
        "UPDATE transaction SET member_username = '" +
        req.body.username +
        "', stats = 0 WHERE id = " +
        req.body.trans_id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateTransaction have error :", error);
    }
};

module.exports.insertLottoDeprive = async(data) => {
    const sql = `INSERT INTO tb_lotto_deprive (id,user_id,lotto_type,lotto_reward_type,number,reward,lotto_date) VALUES (null,2,'${data.lotto_type}','${data.id}','${data.number}',${data.reward},'${data.lotto_date}')`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertLottoDeprive have error :", error);
    }
};

module.exports.deleteLottoDeprive = async(data) => {
    const sql = `DELETE FROM tb_lotto_deprive WHERE id = ${data.id} AND number = '${data.number}'`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
        };
    } catch (error) {
        console.log("insertLottoDeprive have error :", error);
    }
};

module.exports.queryBankDepositTruewallet = async() => {
    const sql = "SELECT * FROM account_bank WHERE type = 'truewallet'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryBankDepositTruewallet have error :", error);
    }
};

module.exports.queryBankWithdrawTruewallet = async() => {
    const sql = "SELECT * FROM acc_withdraw WHERE type = 'truewallet'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryBankWithdrawTruewallet have error :", error);
    }
};

module.exports.queryBankDepositNoTruewallet = async() => {
    const sql = "SELECT * FROM account_bank WHERE type != 'truewallet'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryBankDepositNoTruewallet have error :", error);
    }
};

module.exports.queryBankWithdrawNoTruewallet = async() => {
    const sql = "SELECT * FROM acc_withdraw WHERE type != 'truewallet'";
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryBankWithdrawNoTruewallet have error :", error);
    }
};

module.exports.queryLottoRewardTypeByGroup = async(req) => {
    const sql = `SELECT * FROM tb_lotto_reward_type WHERE reward_group_id = 1`;
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryLottoRewardTypeByGroup have error :", error);
    }
};

module.exports.GetLottoUser = async(data) => {
    const sql = `SELECT * FROM tb_users WHERE username = '${data}'`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("GetLottoUser have error :", error);
    }
};

module.exports.getLottoNumberGroup = async(data) => {
    const sql = `SELECT * FROM tb_lotto_number_group WHERE user_id = ${data} ORDER BY group_number DESC LIMIT 1`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("getLottoNumberGroup have error :", error);
    }
};

module.exports.addLottoNumberGroup = async(data) => {
    const sql = `INSERT INTO tb_lotto_number_group (user_id,group_number,group_name,cr_date) VALUES (${data.user_id},${data.group_number},'${data.group_name}','${data.cr_date}')`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("addLottoNumberGroup have error :", error);
    }
};

module.exports.addLottoNumberGroupData = async(data) => {
    const sql = `INSERT INTO tb_lotto_number_group_data (user_id,group_number,numbers,lotto_reward_type_name) VALUES (${data.user_id},${data.group_number},${data.numbers},'${data.lotto_reward_type_name}')`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("addLottoNumberGroupData have error :", error);
    }
};

module.exports.queryGetLottoNumberGroup = async(userIDLotto) => {
    const sql = `SELECT * FROM tb_lotto_number_group WHERE user_id = ${userIDLotto}`;
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryGetLottoNumberGroup have error :", error);
    }
};

module.exports.queryGetLottoNumberDetail = async(req) => {
    const sql = `SELECT * FROM tb_lotto_number_group_data INNER JOIN tb_lotto_reward_type ON tb_lotto_reward_type.reward_name = tb_lotto_number_group_data.lotto_reward_type_name  WHERE tb_lotto_number_group_data.group_number = ${req.body.id} AND tb_lotto_number_group_data.user_id = ${req.body.userid} AND reward_group_id = 1`;
    console.log(sql);
    try {
        const result = await modelLotto.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryGetLottoNumberDetail have error :", error);
    }
};

module.exports.updateSettingGame = async(req) => {
    const sql = `UPDATE setting_game SET auto_login = '${req.body.auto_login}',VIEWSTATEGENERATOR = '${req.body.VIEWSTATEGENERATOR}',VIEWSTATE = '${req.body.VIEWSTATE}',EVENTVALIDATION = '${req.body.EVENTVALIDATION}' WHERE id = 1`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingGame have error :", error);
    }
};

module.exports.updateSettingGameAuto = async(req) => {
    const sql = `UPDATE setting_game SET VIEWSTATEGENERATOR = '${req.__VIEWSTATEGENERATOR}',VIEWSTATE = '${req.__VIEWSTATE}',EVENTVALIDATION = '${req.__EVENTVALIDATION}' WHERE id = 1`;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingGame have error :", error);
    }
};

module.exports.queryHistoryWinlossAll = async(req) => {
    const { startDate, endDate } = req;
    let sql = "";
    if (startDate === endDate) {
        sql = `SELECT COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(wl),0)AS wl,COALESCE(SUM(aff),0)AS aff FROM history_tran_winloss WHERE date like '${startDate}%'`;
    } else {
        sql = `SELECT COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(wl),0)AS wl,COALESCE(SUM(aff),0)AS aff FROM history_tran_winloss WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingGame have error :", error);
    }
};

module.exports.queryHistoryWinlossLotto = async(req) => {
    const { startDate, endDate } = req;
    // console.log(req)
    let sql = "";
    if (startDate === endDate) {
        sql = `select 'lotto' as code,
		t1.lotto_name,
		t1.lotto_type,
		SUM(t1.aff) as affiliate,
		SUM(t1.amount) as amount,
		SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as winner_amount,
		SUM(t1.amount)-SUM(t1.comm) - SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as net_amount from view_lotto_number_data_V2 t1
		WHERE t1.lotto_date like '${endDate}%'
		group by t1.lotto_type`;
    } else {
        sql = `select 'lotto' as code,
		t1.lotto_name,
		t1.lotto_type,
		SUM(t1.aff) as affiliate,
		SUM(t1.amount) as amount,
		SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as winner_amount,
		SUM(t1.amount)-SUM(t1.comm) - SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as net_amount from view_lotto_number_data_V2 t1
		WHERE t1.lotto_date BETWEEN '${startDate}' AND '${endDate}'
		group by t1.lotto_type`;
    }

    try {
        const result = await modelLotto.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingGame have error :", error);
    }
};

module.exports.reportPlayer = async(req) => {
    const { startDate, endDate } = req;
    // console.log(req)
    let sql = "";
    if (startDate === endDate) {
        sql = `select 'lotto' as code,
		replace(t2.username,"anlt01_","") as username,
		t1.lotto_name,
		t1.lotto_type,
		SUM(t1.aff) as affiliate,
		SUM(t1.amount) as amount,
		SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as winner_amount,
		SUM(t1.amount)-SUM(t1.comm) - SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as net_amount from view_lotto_number_data_V2 t1 left join tb_users t2 on t1.user_key = t2.id
		WHERE t1.lotto_date like '${endDate}%'
		group by t1.lotto_type`;
    } else {
        sql = `select 'lotto' as code,
		replace(t2.username,"anlt01_","") as username,
		t1.lotto_name,
		t1.lotto_type,
		SUM(t1.aff) as affiliate,
		SUM(t1.amount) as amount,
		SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as winner_amount,
		SUM(t1.amount)-SUM(t1.comm) - SUM(IF(t1.winner_flg = 1,t1.winner_amount,0)) as net_amount from view_lotto_number_data_V2 t1 left join tb_users t2 on t1.user_key = t2.id
		WHERE t1.lotto_date BETWEEN '${startDate}' AND '${endDate}'
		group by t1.lotto_type`;
    }

    try {
        const result = await modelLotto.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateSettingGame have error :", error);
    }
};

module.exports.querySettingLine = async(req) => {
    const sql = "SELECT * FROM seting ";
    try {
        const result = await model.queryOne(sql);
        if (result && result.length) {
            return {
                status: true,
                statusCode: httpCode.Success.ok.codeText,
                result: result,
            };
        } else {
            return {
                status: true,
                statusCode: httpCode.Success.noContent.codeText,
                result: result,
            };
        }
    } catch (error) {
        console.log("querySettingLine have error :", error);
        return {
            status: false,
            statusCode: httpCode.Fail.serviceUnavailable.codeText,
            result: [],
        };
    }
};

// Coupon ZONE

module.exports.queryCoupon = async(req) => {
    const sql = `SELECT * FROM coupon_voucher WHERE group_id = ${req.body.group}`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCoupon have error :", error);
    }
};

module.exports.queryCountCoupon = async(id) => {
    const sql = `SELECT * FROM coupon_log WHERE coupon_id = ${id}`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCountCoupon have error :", error);
    }
};

module.exports.queryGroupCoupon = async(req) => {
    const sql = `SELECT * FROM coupon_group`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryGroupCoupon have error :", error);
    }
};

module.exports.queryCouponLog = async(req) => {
    const sql = `SELECT coupon_log.cr_date, coupon_log.amount, coupon_voucher.coupon, coupon_voucher.coupon_name, coupon_voucher.coupon_bonus, member.name, member.username FROM coupon_log INNER JOIN coupon_voucher ON coupon_voucher.id = coupon_log.coupon_id INNER JOIN member ON member.id = coupon_log.member_id ORDER BY coupon_log.id DESC`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCouponLog have error :", error);
    }
};

module.exports.insertCoupon = async(req) => {
    const sql =
        "INSERT INTO `coupon_voucher`(`id`, `coupon_name`, `coupon_bonus`, `coupon`, `limit_receive`, `limit_date`, `cr_date`, `cr_by`, `stats`, `group_id`) VALUES (null,'" +
        req.body.coupon_name +
        "','" +
        req.body.coupon_bonus +
        "','" +
        req.body.coupon_code +
        "','" +
        req.body.coupon_amount +
        "','" +
        req.body.date_exp +
        "','" +
        req.body.date +
        "','" +
        req.body.cr_by +
        "','" +
        req.body.status +
        "','" +
        req.body.group +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertCoupon have error :", error);
    }
};

module.exports.updateStatusCouponGroup = async(req) => {
    const sql =
        "UPDATE coupon_voucher SET stats = " +
        req.body.stats +
        " WHERE group_id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateStatusCouponGroup have error :", error);
    }
};

module.exports.updateStatusCouponGroup1 = async(req) => {
    const sql =
        "UPDATE coupon_group SET stats = " +
        req.body.stats +
        " WHERE id = " +
        req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("updateStatusCouponGroup1 have error :", error);
    }
};

module.exports.deleteCoupon = async(req) => {
    const sql = "DELETE FROM coupon_voucher WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteCoupon have error :", error);
    }
};

module.exports.deleteCouponGroup = async(req) => {
    const sql = "DELETE FROM coupon_voucher WHERE group_id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteCouponGroup have error :", error);
    }
};

module.exports.deleteCouponGroupBy = async(req) => {
    const sql = "DELETE FROM coupon_group WHERE id = " + req.body.id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("deleteCouponGroupBy have error :", error);
    }
};

module.exports.queryCheckEverCoupon = async(req) => {
    const sql = `SELECT * FROM coupon_log INNER JOIN coupon_voucher ON coupon_voucher.id = coupon_log.coupon_id WHERE coupon_voucher.coupon = '${req.body.coupon}' AND coupon_log.member_id = '${req.body.id}'`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckEverCoupon have error :", error);
    }
};

module.exports.queryCheckEXPCoupon = async(req) => {
    const sql = `SELECT * FROM coupon_voucher WHERE coupon = '${req.body.coupon}' AND limit_date >= '${req.body.date}'`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckEXPCoupon have error :", error);
    }
};

module.exports.queryCheckAmountCoupon = async(req) => {
    const sql = `SELECT * FROM coupon_log INNER JOIN coupon_voucher ON coupon_voucher.id = coupon_log.coupon_id WHERE coupon_voucher.coupon = '${req.body.coupon}'`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckAmountCoupon have error :", error);
    }
};

module.exports.queryCheckDetailCoupon = async(req) => {
    const sql = `SELECT * FROM coupon_voucher WHERE coupon = '${req.body.coupon}' AND stats = 1`;
    try {
        const result = await model.queryOne(sql);

        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryCheckDetailCoupon have error :", error);
    }
};

module.exports.insertLogCoupon = async(data) => {
    const sql = `INSERT INTO coupon_log (coupon_id,amount,member_id,cr_date)
    VALUES ('${data.coupon_id}','${data.amount}','${data.member_id}','${data.cr_date}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertLogCoupon have error :", error);
    }
};

module.exports.insertGroupCoupon = async(req) => {
    const sql =
        "INSERT INTO `coupon_group`(`id`, `name`, `cr_date`, `date_exp`, `stats`) VALUES (null,'" +
        req.body.coupon_name +
        "','" +
        req.body.date +
        "','" +
        req.body.date_exp +
        "','" +
        req.body.status +
        "')";
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("insertGroupCoupon have error :", error);
    }
};
// Coupon ZONE

module.exports.lottoWinByID = async(data, date) => {
    const sql = `SELECT tb_users.username,SUM(tb_lotto_number_data.amount) AS amount FROM tb_lotto_number_data INNER JOIN tb_users ON tb_users.id = tb_lotto_number_data.user_id WHERE date_time_add LIKE '${date.start_month}%' AND tb_users.username = '${data}' AND tb_lotto_number_data.flag = 2 AND tb_lotto_number_data.winner_flg = 1`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("lottoWinByID have error :", error);
    }
};

module.exports.lottoLossByID = async(data, date) => {
    const sql = `SELECT tb_users.username,SUM(tb_lotto_number_data.amount) AS amount FROM tb_lotto_number_data INNER JOIN tb_users ON tb_users.id = tb_lotto_number_data.user_id WHERE date_time_add LIKE '${date.start_month}%' AND tb_users.username = '${data}' AND tb_lotto_number_data.flag = 2 AND tb_lotto_number_data.winner_flg = 0`;

    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("lottoWinByID have error :", error);
    }
};

module.exports.lottoUpdateSts = async(data, date) => {
    let sts = data.body.sts == 1 ? 2 : 1;
    const sql = `UPDATE tb_lotto_type SET sts = ${sts} WHERE id = ${data.body.id}`;
    try {
        const result = await modelLotto.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
        };
    } catch (error) {
        console.log("lottoWinByID have error :", error);
    }
};

module.exports.queryHistoryWinlossUser = async(req) => {
    const { startDate, endDate } = req.body;
    let sql = "";
    if (startDate === endDate) {
        sql = `SELECT COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(wl),0)AS winloss,COALESCE(SUM(aff),0)AS aff, ufa_acc.member_username AS member,ufa_acc.username AS username FROM history_tran_winloss INNER JOIN ufa_acc ON ufa_acc.username = history_tran_winloss.username WHERE date like '${startDate}%' GROUP BY history_tran_winloss.username ORDER BY winloss DESC`;
    } else {
        sql = `SELECT COALESCE(SUM(bet),0) AS bet,COALESCE(SUM(wl),0)AS winloss,COALESCE(SUM(aff),0)AS aff, ufa_acc.member_username AS member,ufa_acc.username AS username FROM history_tran_winloss INNER JOIN ufa_acc ON ufa_acc.username = history_tran_winloss.username WHERE date BETWEEN '${startDate}' AND '${endDate}' GROUP BY history_tran_winloss.username ORDER BY winloss DESC`;
    }

    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("queryHistoryWinlossUser have error :", error);
    }
};

module.exports.insertTxz = async(req) => {
    let sql = `INSERT INTO history_transection_all (txz, user, type, amount, date, state, detail, wl, mode, find)  VALUES ?
    ON DUPLICATE KEY UPDATE txz = values(txz)
    , user = values(user)
    , type = values(type)
    , amount = values(amount)
    , date = values(date)
    , state = values(state)
    , detail = values(detail)
    , wl = values(wl)
    , mode = values(mode)
    , find = values(find)`;
    try {
        const result = await model.insertMany(sql, [req]);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:6718 ~ module.exports.insertTxz=async ~ error:", error)
    }
};

module.exports.queryTxz = async(req) => {
    let startDate = req.body.startDate ? req.body.startDate : false;
    let endDate = req.body.endDate ? req.body.endDate : false;
    let isUser = req.body.mode ? req.body.mode : false;
    let sql = "SELECT * FROM history_transection_all";

    if (startDate === endDate && startDate != false) {
        sql += ` WHERE date like '${startDate}%'`;
    }
    if (startDate != false && endDate != false && startDate != endDate) {
        sql += ` WHERE date BETWEEN '${startDate}' AND '${endDate}'`;
    }
    if (isUser != false) {
        sql += ` AND user = '${req.body.user}'`;
    }
    sql += ` order by date desc`;
    try {
        // const result = await model.insertOne(sql);/\`user\`/
        let result = await checkCache(md5(sql));
        if (!result) {
            console.log(`newData:`, result);
            const data = await model.queryOne(sql);
            result = await saveCache(md5(sql), data);
        }
        return result;
    } catch (error) {
        console.log("🚀 ~ file: qdmbackend.js:6738 ~ module.exports.queryTxz=async ~ error:", error)
    }
};


module.exports.UpdateStatusPromotion = async(id) => {
    const sql =
        "UPDATE member_pomotion SET flag = '0' WHERE member_id = " + id;
    try {
        const result = await model.insertOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("UpdateStatusPromotion have error :", error);
    }
};


module.exports.queryReflogMemberId = async(id) => {
    const sql = `select m.id,m.username,r.date,r.bonus,r.date from member m join ref_log r on m.username = r.member_username where m.id = ${id}`;
    try {
        const result = await model.queryOne(sql);
        if(result){
            return result;
        }
        return [];
    } catch (error) {
        console.log("querySettingWinloss have error :", error);
    }
};

module.exports.queryRefWithMemberId = async(id,date) => {
    const sql = `select u.username,uc.username, h.turnover,h.winloss, h.date from member u join ufa_acc uc on uc.member_username = u.username join history_turnover h on h.username = uc.username where u.ref = ${id} and h.date = '${date}'`;
    try {
        const result = await model.queryOne(sql);
        if(result){
            return result;
        }
        return [];
    } catch (error) {
        console.log("querySettingWinloss have error :", error);
    }
};


module.exports.createHistoryRefLog = async(data) => {
    const sql = `INSERT INTO ref_log (member_username,bonus,date)
    VALUES ('${data.username}',${data.bonus},'${data.date}')`;
    try {
        const result = await model.queryOne(sql);
        return {
            status: true,
            statusCode: httpCode.Success.ok.codeText,
            result: result,
        };
    } catch (error) {
        console.log("createHistoryWinloss have error :", error);
    }
};
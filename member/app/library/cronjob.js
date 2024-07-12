const cron = require('node-cron');
const moment = require('moment')
const queryLotto = require("../functions/qdmLotto");
const queryMember = require('../functions/qdmbackend');
const lottoHouse = require('../library/lottoHouse/lottoHouse')

async function runcron() {
    try {
        console.log(`Start Cron Auto Reward Lotto`)

        cron.schedule(`*/5 * * * *`, async() => {
            let datas = await queryMember.getAdminByMappingApi('auth_lottohouse');
            // console.log(datas);
            const objLottoHoust = new lottoHouse(datas.result[0].username, datas.result[0].password);
            let token = await objLottoHoust.apiLottoRewardLottoHouse();
            console.log(`Cron Auto Reward Lotto :${moment(updateLast.result[0].crontime).format('YYYY-MM-DD HH:mm:ss')}`);
            console.log(`result :${token}`);
        });

    } catch (error) {
        console.log(`Error Cron Auto Reward Lotto:`, error);
    }

    try {
        console.log(`Start Cron Update Lotto`);
        cron.schedule(`59 1 * * *`, async() => {
            console.log(`Run Cron Update Lotto 1 ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
            let data = {
                crontime: moment().format('YYYY-MM-DD'),
                cronname: 'uplottodate'
            }
            const updateLast = await queryLotto.queryLogCron(data);
            if (updateLast.result.length > 0) {
                console.log(`Last cron lotto update ${moment(updateLast.result[0].crontime).format('YYYY-MM-DD HH:mm:ss')}`);
            } else {
                const updateNew = await queryLotto.updateCronLotto();
                if (updateNew.result && updateNew.result.changedRows) {
                    await queryLotto.updateLogCron(data);
                    console.log(`New cron lotto update ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                } else {
                    console.log(`New cron lotto update Error : ${updateNew}`);
                }
            }
        });

        cron.schedule(`15 2 * * *`, async() => {
            console.log(`Run Cron Update Lotto 2 ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
            let data = {
                crontime: moment().format('YYYY-MM-DD'),
                cronname: 'uplottodate'
            }
            const updateLast = await queryLotto.queryLogCron(data);
            if (updateLast.result.length > 0) {
                console.log(`Last cron lotto update ${moment(updateLast.result[0].crontime).format('YYYY-MM-DD HH:mm:ss')}`);
            } else {
                const updateNew = await queryLotto.updateCronLotto();
                if (updateNew.result && updateNew.result.changedRows) {
                    await queryLotto.updateLogCron(data);
                    console.log(`New cron lotto update ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                } else {
                    console.log(`New cron lotto update Error : ${updateNew}`);
                }
            }
        });
    } catch (error) {
        console.log(`Error Cron Update Lotto:`, error);
    }

    try {
        console.log(`Start Cron Update Yeekee`);
        cron.schedule(`30 4 * * *`, async() => {
            console.log(`Run Cron Update Yeekee 1 ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
            let data = {
                crontime: moment().format('YYYY-MM-DD'),
                cronname: 'updatayeekee'
            }
            const updateLast = await queryLotto.queryLogCron(data);
            if (updateLast.result.length > 0) {
                console.log(`Last cron Yeekee update ${moment(updateLast.result[0].crontime).format('YYYY-MM-DD HH:mm:ss')}`);
            } else {
                const updateNew = await queryLotto.updateCronYeekee();
                if (updateNew.result && updateNew.result.changedRows) {
                    await queryLotto.updateLogCron(data);
                    console.log(`New cron Yeekee update ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                } else {
                    console.log(`New cron Yeekee update Error : ${updateNew}`);
                }
            }
        });

        cron.schedule(`45 4 * * *`, async() => {
            console.log(`Run Cron Update Yeekee 2 ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
            let data = {
                crontime: moment().format('YYYY-MM-DD'),
                cronname: 'updatayeekee'
            }
            const updateLast = await queryLotto.queryLogCron(data);
            if (updateLast.result.length > 0) {
                console.log(`Last cron Yeekee update ${moment(updateLast.result[0].crontime).format('YYYY-MM-DD HH:mm:ss')}`);
            } else {
                const updateNew = await queryLotto.updateCronYeekee();
                if (updateNew.result && updateNew.result.changedRows) {
                    await queryLotto.updateLogCron(data);
                    console.log(`New cron Yeekee update ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
                } else {
                    console.log(`New cron Yeekee update Error : ${updateNew}`);
                }
            }
        });
    } catch (error) {
        console.log(`Error Cron Update Yeekee:`, error);
    }
}

module.exports = async() => {
    await runcron();
}
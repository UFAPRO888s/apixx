const db = require('../config/db');
const table = 'seting';
module.exports = {
    getAll: async(data, callBack) => {
        return db(table).where(data).first().then((result) => {
            callBack(null, result)
        }).catch((err) => {
            callBack(err)
        });
    },
    getSettingsWithWhere: async(data, callBack) => {
        return db(table).where(data).first().then((result) => {
            callBack(null, result)
        }).catch((err) => {
            callBack(err)
        });
    },
    getSettingsWithWhereAll: async(data, callBack) => {
        return db(table).where(data).first().then((result) => {
            callBack(null, result)
        }).catch((err) => {
            callBack(err)
        });
    },
    updateKeyApiRegister: async(key, value, data, callBack) => {
        return db(table).where(key, value).update(data).then((result) => {
            callBack(null, result)
        }).catch((err) => {
            callBack(err)
        });
    },
}
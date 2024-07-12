const { con, conn } = require('../../config/mysql');
const logError = require('../../../unityFunction/functionLogError');
module.exports = {
    queryOne: (sql) => {
        return new Promise(function(resolve, reject) {
            conn.getConnection((error,connect) => {
                connect.query(sql, function(err, result) {
                    if (!err) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
                conn.releaseConnection(connect);
            })
            

        });
    },
    insertOne: (sql) => {
        return new Promise(function(resolve, reject) {
            conn.getConnection((error,connect) => {
                connect.query(sql, function(err, result) {
                    if (!err) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
                conn.releaseConnection(connect);
            })

        });
    },
    insertMany: (sql, value) => {
        return new Promise(function(resolve, reject) {
            conn.getConnection((error,connect) => {
                connect.query(sql, value, function(err, result) {
                    if (!err) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
                conn.releaseConnection(connect);
            })

        });
    },
    deleteOne: (sql) => {
        return new Promise(function(resolve, reject) {
            conn.getConnection((error,connect) => {
                connect.query(sql, function(err, result) {
                    if (!err) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
                conn.releaseConnection(connect);
            })

        });
    },
    updateOne: (sql) => {
        return new Promise(function(resolve, reject) {
            conn.getConnection((error,connect) => {
                connect.query(sql, function(err, result) {
                    if (!err) {
                        resolve(result);
                    } else {
                        reject(err);
                    }
                });
                conn.releaseConnection(connect);
            })

        });
    },
}
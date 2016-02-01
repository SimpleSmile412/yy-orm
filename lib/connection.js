var common = require("../../yy-common");
var logger = common.logger;
var Promise = require("bluebird");
var mysql = require("mysql");

function Connection(conn) {
    this.conn = conn;
}
module.exports = Connection;

Connection.$proto("query", function(query, values) {
    var sql = mysql.format(query, values);
    logger.info(sql);
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.query(query, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    rows: rows,
                    fields: fields,
                });
            }
        });
    });
});

Connection.$proto("beginTransaction", function() {
    logger.info("START TRANSACTION");
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.beginTransaction(function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

Connection.$proto("commit", function() {
    logger.info("COMMIT");
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.commit(function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

Connection.$proto("rollback", function() {
    logger.info("ROLLBACK");
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.rollback(function() {
            resolve();
        });
    });
});

Connection.$proto("release", function(query) {
    return this.conn.release();
});

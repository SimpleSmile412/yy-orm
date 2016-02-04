var common = require("../../yy-common");
var logger = common.logger;
var Promise = require("bluebird");
var mysql = require("mysql");

function Connection(conn) {
    this.conn = conn;
}
module.exports = Connection;

Connection.prototype.query = function(query, values) {
    var sql = mysql.format(query, values);
    logger.info("[%d] %s", this.conn.$id, sql);
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
}

Connection.prototype.beginTransaction = function() {
    return this.query("BEGIN");
}

Connection.prototype.commit = function() {
    return this.query("COMMIT");
}

Connection.prototype.rollback = function() {
    return this.query("ROLLBACK");
}

Connection.prototype.release = function(query) {
    return this.conn.release();
}

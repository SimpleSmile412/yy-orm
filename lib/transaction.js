var logger = require("yy-logger");

function Transaction(conn, db) {
    this.conn = conn;
    this.db = db;
}

module.exports = Transaction;

Transaction.prototype.query = function(sql) {
    return this.conn.query(sql);
}

Transaction.prototype.commit = function() {
    var that = this;
    return this.conn.commit().finally(function() {
        that.conn.release();
    });
}

Transaction.prototype.rollback = function() {
    var that = this;
    return this.conn.rollback().finally(function() {
        that.conn.release();
    });
}

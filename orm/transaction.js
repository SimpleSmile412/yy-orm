var common = require("../../yy-common");
var logger = common.logger;


function Transaction(conn, db) {
    this.conn = conn;
    this.db = db;
}

module.exports = Transaction;

Transaction.$proto("query", function(sql) {
    return this.conn.query(sql);
});

Transaction.$proto("commit", function() {
    var that = this;
    return this.conn.commit().finally(function() {
        that.conn.release();
    });
});

Transaction.$proto("rollback", function() {
    var that = this;
    return this.conn.rollback().finally(function() {
        that.conn.release();
    });
});

Transaction.$proto("create", function(table, obj) {
    return this.db.create(table, obj, this);
});

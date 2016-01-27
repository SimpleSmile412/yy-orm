var common = require("../../yy-common");
var logger = common.logger;


function Transaction(conn, db) {
    this.conn = conn;
    this.db = db;
}

module.exports = Transaction;

Transaction.$proto("begin", function() {
    var sql = "BEGIN";
    return this.conn.query(sql);
});

Transaction.$proto("query", function(sql) {
    var that = this;
    return this.conn.query(sql);
});

Transaction.$proto("commit", function(sql) {
    var sql = "COMMIT";
    var that = this;
    return this.conn.query(sql).finally(function() {
        that.conn.release();
    });
});

Transaction.$proto("rollback", function(sql) {
    var sql = "ROLLBACK";
    var that = this;
    return this.conn.query(sql).finally(function() {
        that.conn.release();
    });
});

Transaction.$proto("create", function(table, obj) {
    return this.db.create(table, obj, this);
});

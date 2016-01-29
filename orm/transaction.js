var common = require("../../yy-common");
var logger = common.logger;
var Model = require("./model");


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

Transaction.prototype.create = function(table, obj) {
    return this.db.create(table, obj, this);
}

Transaction.prototype.insert = function(table, obj) {
    if (table instanceof Model) {
        return table.insert(obj, this);
    } else {
        return this.db.insert(table, obj, this);
    }
}

Transaction.prototype.get = function(table, obj) {
    if (table instanceof Model) {
        return table.get(obj, this);
    } else {
        return this.db.get(table, obj, this);
    }
}

Transaction.prototype.all = function(table, obj) {
    if (table instanceof Model) {
        return table.all(obj, this);
    } else {
        return this.db.all(table, obj, this);
    }
}

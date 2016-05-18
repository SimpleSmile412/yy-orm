var logger = require("yy-logger");
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

Transaction.prototype.insert = function(table, obj) {
    if (table instanceof Model) {
        return table.insert(obj, this);
    } else {
        return this.db.insert(table, obj, this);
    }
}

Transaction.prototype.update = function(table, obj, c) {
    if (table instanceof Model) {
        return table.update(obj, c, this);
    } else {
        return this.db.update(table, obj, c, this);
    }
}

Transaction.prototype.one = function(table, c) {
    if (table instanceof Model) {
        return table.one(c, this);
    } else {
        return this.db.one(table, c, this);
    }
}

Transaction.prototype.select = function(table, c) {
    if (table instanceof Model) {
        return table.select(c, this);
    } else {
        return this.db.select(table, c, this);
    }
}

Transaction.prototype.delete = function(table, c) {
    if (table instanceof Model) {
        return table.delete(obj, c, this);
    } else {
        return this.db.delete(table, c, this);
    }
}

Transaction.prototype.count = function(table, c) {
    if (table instanceof Model) {
        return table.count(c, this);
    } else {
        return this.db.count(table, c, this);
    }
}

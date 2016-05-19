var logger = require("yy-logger");
var _ = require("lodash");
var assert = require("assert");

var Connection = require("./connection");
var Transaction = require("./transaction");
var Model = require("./model");
var cond = require("./cond");
var condType = cond.type;
var condTool = cond.tool;

var mysql = require("mysql");
var Promise = require("bluebird");
var util = require("util");

function DB(opt) {
    this.pool = mysql.createPool(opt);
    this.models = {};
    this.$counter = 0;
}
module.exports = DB;

DB.prototype.getConnection = function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.pool.getConnection(function(err, conn) {
            if (err) {
                reject(err);
            } else {
                conn.$id = conn.$id || ++that.$counter;
                resolve(new Connection(conn));
            }
        })
    });
}
DB.prototype.close = function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.pool.end(function(err) {
            if (err !== undefined) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

DB.prototype.define = function(table, defBase, defExt) {
    var def = { base: defBase, ext: defExt };
    var ret = new Model(table, def, this);
    this.models[table] = ret;
    return ret;
}

DB.prototype.sync = function() {
    return Promise.each(_(this.models).values(), function(model) {
        return model.sync();
    });
}

DB.prototype.drop = function() {
    return Promise.each(_(this.models).values(), function(model) {
        return model.drop();
    })
}

DB.prototype.rebuild = function() {
    var that = this;
    return this.drop().then(function() {
        return that.sync();
    })
}

DB.prototype.beginTransaction = function() {
    var that = this;
    return this.getConnection().then(function(conn) {
        tx = new Transaction(conn, that);
        return conn.beginTransaction().then(function(res) {
            return tx;
        });
    });
}

DB.prototype.query = function(query, values, tx) {
    var tx_ = _(arguments).filter(item => item instanceof Transaction).nth(0);
    var values_ = _(arguments).filter(item => _.isPlainObject(item) || _.isArray(item)).nth(0);
    if (tx_) {
        return tx_.query(query, values_);
    }
    return this.getConnection().then(function(conn) {
        return conn.query(query, values_).finally(function() {
            conn.release();
        });
    })
}

DB.prototype.insert = function(table, obj, tx) {
    var that = this;
    return Promise.try(function() {
        if (!_.isArray(obj)) {
            obj = [obj];
        }
        var cols = _(obj[0]).keys().value();
        var values = obj.map(function(item) {
            return _(item).values().value();
        })
        var fmt = "INSERT INTO ??(??) VALUES ?";
        var sql = mysql.format(fmt, [table, cols, values]);
        return that.query(sql, tx);
    }).then(function(res) {
        return res.rows;
    });
}

DB.prototype.update = function(table, obj, c, tx) {
    assert(arguments.length >= 2);
    var tx_ = _(arguments).filter(item => item instanceof Transaction).nth(0);
    var c_ = _(arguments).filter(item => item instanceof condType.Cond || _.isPlainObject(item)).nth(0);
    c_ = cond.parse(c_);
    if (c_ === undefined) {
        var fmt = "UPDATE ?? SET ?";
    } else {
        var fmt = "UPDATE ?? SET ? WHERE " + c_.toSql();
    }
    var sql = mysql.format(fmt, [table, obj]);
    return this.query(sql, tx_).then(function(res) {
        return res.rows;
    });
}

//string, [], cond/object/string, transaction
DB.prototype.select = function(table, col, c, tx) {
    var tx_ = _(arguments).filter(item => item instanceof Transaction).nth(0);
    var col_ = _(arguments).filter(_.isArray).nth(0);
    var c_ = _(arguments).slice(1).filter(item => item instanceof condType.Cond || _.isPlainObject(item) || _.isString(item)).nth(0);
    col_ = col_ ? col_.join(", ") : "*";
    c_ = cond.parse(c_);
    var that = this;
    if (c_) {
        var sql = util.format("SELECT %s FROM %s WHERE %s", col_, table, c_.toSql());
    } else {
        var sql = util.format("SELECT %s FROM %s", col_, table);
    }
    return this.query(sql, tx_).then(function(res) {
        return res.rows;
    });
}

//string, string/[], cond/object, transaction
DB.prototype.one = function(table, col, c, tx) {
    var tx_ = _(arguments).filter(item => item instanceof Transaction).nth(0);
    var col_ = _(arguments).filter(_.isArray).nth(0);
    var c_ = _(arguments).slice(1).filter(item => item instanceof condType.Cond || _.isPlainObject(item) || _.isString(item)).nth(0);
    c_ = cond.parse(c_);
    c_ = cond.limit(c_, 1);
    return this.select(table, col_, c_, tx_).then(function(res) {
        return res[0];
    })
}

DB.prototype.delete = function(table, c, tx) {
    var tx_ = _(arguments).filter(item => item instanceof Transaction).nth(0);
    var c_ = _(arguments).filter(item => item instanceof condType.Cond || _.isPlainObject(item)).nth(0);
    c_ = cond.parse(c_);
    var fmt = "DELETE FROM ?? WHERE " + c_.toSql();
    var sql = mysql.format(fmt, table);
    return this.query(sql, tx_).then(function(res) {
        return res.rows;
    });
}
DB.prototype.count = function(table, c, tx) {
    return this.select(table, ["COUNT(1) AS COUNT"], c, tx).then(function(res) {
        return parseInt(res[0]["COUNT"]);
    });
}

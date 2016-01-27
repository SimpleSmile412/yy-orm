var common = require("../../yy-common");
var logger = common.logger;
var Connection = require("./connection");
var Model = require("./model");
var kit = require("./kit");
var mysql = require("mysql");
var Promise = require("bluebird");
var util = require("util");

function DB(opt) {
    this.pool = mysql.createPool(opt);
    this.models = {};
}
module.exports = DB;

DB.$proto("getConnection", function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.pool.getConnection(function(err, conn) {
            if (err) {
                reject(err);
            } else {
                resolve(new Connection(conn));
            }
        })
    });
});

DB.$proto("close", function() {
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
});

DB.$proto("define", function(table, def) {
    var ret = new Model(table, def, this);
    this.models[table] = ret;
    return ret;
});

DB.$proto("sync", function() {
    var result = Promise.resolve();
    for (var table in this.models) {
        var model = this.models[table];
        result = result.then(function() {
            return model.sync();
        });
    }
    return result;
});

DB.$proto("drop", function() {
    var result = Promise.resolve();
    for (var table in this.models) {
        var model = this.models[table];
        result = result.then(function() {
            return model.drop();
        });
    }
    return result;
});

DB.$proto("query", function(query) {
    logger.log(query);
    return this.getConnection().then(function(conn) {
        return conn.query(query).finally(function() {
            conn.release();
        });
    })
});

DB.$proto("select", function(table, cond) {
    var that = this;
    if (cond) {
        cond = cond.replace(/^where /i, '');
        var sql = util.format("SELECT * FROM %s WHERE %s", table, cond);
    } else {
        var sql = "SELECT * FROM " + table;
    }
    return this.query(sql).then(function(res) {
        var model = that.models[table];
        if (!model) {
            return res;
        }
        var rows = res.rows;
        var ret = [];
        for (var i in rows) {
            ret.push(model.toModel(rows[i]));
        }
        return ret;
    });
});

DB.$proto("create", function(table, obj) {
    var that = this;
    return Promise.try(function() {
        var model = that.models[table];
        if (!model) {
            return obj;
        } else {
            return model.toRow(obj);
        }
    }).then(function(obj) {
        var cols = [];
        var values = [];
        for (var col in obj) {
            if (obj.hasOwnProperty(col)) {
                cols.push(col);
                values.push(kit.normalize(obj[col]));
            }
        }
        var col = cols.join(", ");
        var value = values.join(", ");
        var fmt = "INSERT INTO %s(%s) VALUES(%s)";
        var sql = util.format(fmt, table, col, value);
        return that.query(sql);
    })
});

DB.$proto("find", function(table, cond) {
    if (typeof cond !== "object") {
        var key = model.key;
        var cond = util.format("%s = %s", key.col, kit.normalize(cond));
    }
    return this.select(table, cond);
});

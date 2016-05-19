var logger = require("yy-logger");
var _ = require("lodash");
var cond = require("./cond");
var ModelMeta = require("./model-meta");
var ModelObject = require("./model-object");
var Transaction = require("./transaction");
var condType = cond.type;
var condTool = cond.tool;
var util = require("util");
var mysql = require("mysql");

function Model(table, def, db) {
    this.table = table;
    this.meta = new ModelMeta(def);
    this.db = db;
}
module.exports = Model;

function condFilter(item) {
    return item instanceof condType.Cond || _.isPlainObject(item) || _.isString(item)
}

function txFilter(item) {
    return item instanceof Transaction;
}

Model.prototype.toSql = function() {
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    return util.format(fmt, this.table, this.meta.toSql());
}
Model.prototype.toObj = function(row) {
    return this.meta.toObj(row);
}
Model.prototype.toRow = function(obj) {
    return this.meta.toRow(obj);
}
Model.prototype.transformCondition = function(c) {
    var meta = this.meta;
    var mapping = _(meta.fields).mapValues(o => o.column).value();
    return c.transform(mapping);
}
Model.prototype.sync = function() {
    return this.db.query(this.toSql());
}
Model.prototype.drop = function() {
    var sql = "DROP TABLE IF EXISTS " + this.table;
    return this.db.query(sql);
}
Model.prototype.rebuild = function() {
    return this.drop().then(function() {
        return this.sync();
    });
}
Model.prototype.insert = function(obj, tx) {
    var that = this;
    var meta = this.meta;
    var rows = (_.isArray(obj) ? obj : [obj]).map(obj => that.toRow(obj));
    return this.db.insert(this.table, rows, tx).then(function(res) {
        if (!meta.auto) {
            return obj;
        }
        var insertId = res.insertId;
        var affectedRows = res.affectedRows;
        var pkeyName = meta.pkey[0].field;
        if (!_.isArray(obj)) {
            obj[pkeyName] = insertId;
            return new ModelObject(obj, that);
        }
        if (obj.length !== affectedRows) {
            throw new Error("Length !== AffectedRows");
        }
        return obj.map(function(o, i) {
            o[pkeyName] = insertId + i;
            return new ModelObject(o, that);
        })
    })
}
Model.prototype.update = function(obj, tx) {
    var meta = this.meta;
    var row = _.clone(this.toRow(obj));
    var c = _.fromPairs(meta.pkey.map(function(info) {
        delete row[info.column];
        return [info.column, obj[info.field]]
    }));
    return this.db.update(this.table, row, c, tx);
}
Model.prototype.select = function(c, tx) {
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var c_ = cond.parse(_(arguments).filter(condFilter).nth(0));
    var that = this;
    c_ && (c_ = this.transformCondition(c_));
    return this.db.select(this.table, ["*"], c_, tx_).then(function(res) {
        return res.map(item => new ModelObject(that.toObj(item), that));
    });
}
Model.prototype.one = function(c, tx) {
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var c_ = cond.parse(_(arguments).filter(condFilter).nth(0));
    var that = this;
    c_ && (c_ = this.transformCondition(c_));
    return this.db.one(this.table, ["*"], c_, tx_).then(function(res) {
        return new ModelObject(that.toObj(res), that);
    });
}
Model.prototype.delete = function(obj, tx) {
    var meta = this.meta;
    var row = _.clone(this.toRow(obj));
    var c = _.fromPairs(meta.pkey.map(function(info) {
        delete row[info.column];
        return [info.column, obj[info.field]]
    }));
    return this.db.delete(this.table, c, tx);
}
Model.prototype.count = function(c, tx) {
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var c_ = cond.parse(_(arguments).filter(condFilter).nth(0));
    c_ && (c_ = this.transformCondition(c_));
    return this.db.count(this.table, c_, tx_);
}

var logger = require("yy-logger");
var _ = require("lodash");
var cond = require("./cond");
var ModelMeta = require("./model-meta");
var ModelObject = require("./model-object");
var Transaction = require("./transaction");
var util = require("util");
var mysql = require("mysql");

function Model(table, def, db) {
    this.table = table;
    this.db = db;
    this.meta = new ModelMeta(def, this);
}
module.exports = Model;

function condFilter(item) {
    return item instanceof cond.Cond || _.isPlainObject(item) || _.isString(item)
}

function txFilter(item) {
    return item instanceof Transaction;
}

Model.prototype.toSql = function() {
    return this.meta.toSql();
}

Model.prototype.transformCondition = function(c) {
    if (!c) {
        return c;
    }
    var meta = this.meta;
    var mapping = _(meta.fields).mapValues(o => o.column).value();
    return c.transform(mapping);
}
Model.prototype.build = function() {
    return this.db.query(this.toSql());
}
Model.prototype.drop = function() {
    var sql = "DROP TABLE IF EXISTS " + this.table;
    return this.db.query(sql);
}
Model.prototype.rebuild = function() {
    return this.drop().then(function() {
        return this.build();
    });
}
Model.prototype.insert = function(obj, tx) {
    var that = this;
    var meta = this.meta;
    var rows = (_.isArray(obj) ? obj : [obj]).map(obj => meta.toRow(obj));
    return this.db.insert(this.table, rows, tx).then(function(res) {
        if (!meta.auto) {
            return obj;
        }
        var insertId = res.insertId;
        var affectedRows = res.affectedRows;
        var pkeyName = meta.pkey.field;
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
    // var pkey = this.meta.pkey;
    // var c = _({ id: obj[pkey.field] }).mapKeys(key => pkey.column).value();;
    var row = this.meta.toRow(obj);
    var c = this.meta.pkeyCond(obj);
    return this.db.update(this.table, row, c, tx);
}
Model.prototype.select = function(c, tx) {
    var that = this;
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var c_ = _.chain(arguments).filter(condFilter).nth(0).thru(cond.parse).thru(o => that.transformCondition(o)).value();
    return this.db.select(this.table, ["*"], c_, tx_).then(function(res) {
        return res.map(item => new ModelObject(that.meta.toObj(item), that));
    });
}
Model.prototype.one = function(c, tx) {
    var that = this;
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var c_ = _.chain(arguments).filter(condFilter).nth(0).thru(cond.parse).thru(o => that.transformCondition(o)).value();
    return this.db.one(this.table, ["*"], c_, tx_).then(function(res) {
        return res ? new ModelObject(that.meta.toObj(res), that) : undefined;
    });
}
Model.prototype.get = function(id, tx) {
    var that = this;
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var id = _(arguments).filter(item => !txFilter(item)).nth(0);
    var c = _.isArray(id) ? cond.in(this.meta.pkey.column, id) : cond.eq(this.meta.pkey.column, id);
    return this.db.select(this.table, ["*"], c, tx_).then(function(res) {
        if (_.isArray(id)) {
            return res.map(item => new ModelObject(that.meta.toObj(item), that));
        } else {
            return res[0] ? new ModelObject(that.meta.toObj(res[0]), that) : undefined;
        }
    });
}
Model.prototype.sync = function(obj, tx) {
    var that = this;
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var obj = _(arguments).filter(item => !txFilter(item)).nth(0);
    var objs = _([obj]).flatten().value();
    var ids = objs.map(o => o[that.meta.pkey.field]);
    return this.get(ids, tx).then(function(res) {
        return res.map((o, i) => _.merge(objs[i], o));
    })
}
Model.prototype.delete = function(obj, tx) {
    // var pkey = this.meta.pkey;
    // var c = _({ id: obj[pkey.field] }).mapKeys(key => pkey.column).value();
    var c = this.meta.pkeyCond(obj);
    return this.db.delete(this.table, c, tx);
}
Model.prototype.count = function(c, tx) {
    var tx_ = _(arguments).filter(txFilter).nth(0);
    var c_ = cond.parse(_(arguments).filter(condFilter).nth(0));
    c_ && (c_ = this.transformCondition(c_));
    return this.db.count(this.table, c_, tx_);
}
Model.prototype.parse = function(json) {
    var obj = this.meta.parse(json);
    return new ModelObject(obj, this);
}
Model.prototype.stringify = function(obj) {
    return this.meta.stringify(obj);
}

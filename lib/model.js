var logger = require("yy-logger");
var cond = require("./cond");
var ModelMeta = require("./model-meta");
var ModelObject = require("./model_object");
var condType = cond.type;
var condTool = cond.tool;
var util = require("util");
var mysql = require("mysql");

// fields: field -> type(_field, _col)
// cols: col -> type(_field, _col)
function Model(table, def, db) {
    this.table = table;
    this.meta = new ModelMeta(def);
    this.db = db;
}
module.exports = Model;

Model.prototype.toSql = function() {
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    return util.format(fmt, this.table, this.meta.toSql());
}
Model.prototype.toObj = function(row) {
    var fields = this.fields;
    var ret = {};
    for (var field in this.fields) {
        if (row[fields[field]._col] !== undefined) {
            ret[field] = row[fields[field]._col];
        }
    }
    return ret;
}
Model.prototype.toRow = function(obj) {
    var fields = this.fields;
    var ret = {};
    for (var field in this.fields) {
        if (obj[field] !== undefined) {
            ret[fields[field]._col] = obj[field];
        }
    }
    return ret;
}
Model.prototype.transformCondition = function(c) {
    if (c === undefined) {
        return undefined;
    }
    var meta = this.meta;
    var model = this;
    var field = c.col;
    if (c instanceof condType.OpCond) {
        c.col = model.fields[field]._col;
    } else if (c instanceof condType.WrapCondSingle) {
        c.cond = model.transformCondition(c.cond);
    } else if (c instanceof condType.WrapCondMulti) {
        var arr = c.cond;
        for (var i = 0; i < arr.length; i++) {
            c.cond[i] = model.transformCondition(arr[i]);
        }
    }
    return c;
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
    if (Array.isArray(obj)) {
        var row = [];
        for (var i in obj) {
            row.push(this.toRow(obj[i]));
        }
    } else {
        var row = this.toRow(obj);
    }
    var that = this;
    return this.db.insert(this.table, row, tx).then(function(res) {
        if (that.key._auto) {
            obj[that.key._field] = res.insertId;
        }
        return new ModelObject(that, obj);
        // return obj;
    })
}
Model.prototype.update = function(obj, tx) {
    row = obj.toRow();
    var c = {};
    c[obj.schemaKey()] = obj.keyVal();
    delete row[obj.schemaKey()];
    var that = this;
    return this.db.update(this.table, row, c, tx).then(function(res) {
        return obj;
    })
}
Model.prototype.select = function(c, tx) {
    var model = this;
    var c = condTool.parseToCondObj(c);
    c = this.transformCondition(c);
    return this.db.select(this.table, "*", c, tx).then(function(res) {
        var ret = [];
        for (var i in res) {
            // ret.push(model.toObj(res[i]))
            ret.push(ModelObject.fromRow(model, res[i]))
        }
        return ret;
    });
}
Model.prototype.one = function(c, tx) {
    var model = this;
    if (typeof c !== "object") {
        c = cond.eq(model.key._col, c);
    } else {
        c = condTool.parseToCondObj(c);
        c = this.transformCondition(c);
    }
    return this.db.one(this.table, "*", c, tx).then(function(res) {
        // return model.toObj(res);
        return ModelObject.fromRow(model, res);
    });
}
Model.prototype.delete = function(obj, tx) {
    var c = {};
    c[obj.schemaKey()] = obj.keyVal();
    return this.db.delete(this.table, c, tx).then(function(res) {
        return res;
    });
}
Model.prototype.count = function(c, tx) {
    c = condTool.parseToCondObj(c);
    c = this.transformCondition(c);
    return this.db.count(this.table, c, tx);
}

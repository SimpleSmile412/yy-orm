var common = require("../../yy-common");
var logger = common.logger;
var cond = require("./cond");
var ModelObject = require("./model_object");
var condType = cond.type;
var condTool = cond.tool;
var util = require("util");
var mysql = require("mysql");

// fields: field -> type(_field, _col)
// cols: col -> type(_field, _col)
function Model(table, def, db) {
    var parsed = parseDef(def);
    this.table = table;
    this.db = db;
    this.fields = parsed.fields;
    this.cols = parsed.cols;
    this.key = parsed.key;
    this.unique = parsed.unique;
}
module.exports = Model;

function parseDef(fields, ext) {
    ext = ext || {};
    var key = ext.key;
    var cols = {};
    var unique = [];
    for (var field in fields) {
        var col = fields[field]._col || field;
        fields[field]._field = field;
        fields[field]._col = col;
        cols[col] = fields[field];
        if (fields[field]._key === true) {
            key = fields[field];
        }
        if (fields[field]._unique === true) {
            unique.push(fields[field]);
        }
    }
    return {
        key: key,
        unique: unique,
        fields: fields,
        cols: cols,
    }
}

Model.prototype.toSql = function() {
    var table = this.table;
    var fields = this.fields;
    var unique = this.unique;
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    var buf = [];
    for (var field in fields) {
        buf.push(fields[field]._col + " " + fields[field].toSql());
    }
    for (var i in unique) {
        buf.push("UNIQUE(" + unique[i]._col + ")");
    }
    var tableStr = buf.join(", ");
    var sql = util.format(fmt, table, tableStr);
    return sql;
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
Model.prototype.schemizeCondition = function(c) {
    if (c === undefined) {
        return undefined;
    }
    var model = this;
    var field = c.col;
    if (c instanceof condType.OpCond) {
        c.col = model.fields[field]._col;
    } else if (c instanceof condType.WrapCondSingle) {
        c.cond = model.schemizeCondition(c.cond);
    } else if (c instanceof condType.WrapCondMulti) {
        var arr = c.cond;
        for (var i = 0; i < arr.length; i++) {
            c.cond[i] = model.schemizeCondition(arr[i]);
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
Model.prototype.insert = function(obj, tx) {
    var row = this.toRow(obj);
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
    obj = obj.toRow();
    var c = {
        obj[obj.schemaKey()]: obj.key(),
    }
    var that = this;
    return this.db.update(this.table, obj, c, tx).then(function(res) {
        return obj;
    })
}
Model.prototype.one = function(c, tx) {
    var model = this;
    if (typeof c !== "object") {
        c = cond.eq(model.key._col, c);
    } else {
        c = condTool.parseToCondObj(c);
        c = this.schemizeCondition(c);
    }
    return this.db.one(this.table, "*", c, tx).then(function(res) {
        // return model.toObj(res);
        return ModelObject.fromRow(model, res);
    });
}
Model.prototype.select = function(c, tx) {
    var model = this;
    var c = condTool.parseToCondObj(c);
    c = this.schemizeCondition(c);
    return this.db.select(this.table, "*", c, tx).then(function(res) {
        var ret = [];
        for (var i in res) {
            // ret.push(model.toObj(res[i]))
            ret.push(ModelObject.fromRow(model, res[i]))
        }
        return ret;
    });
}

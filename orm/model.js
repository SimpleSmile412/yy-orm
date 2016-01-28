var common = require("../../yy-common");
var logger = common.logger;
var util = require("util");

// def: field -> type(_field, _col)
// rdef: col -> type(_field, _col)
function Model(table, def, db) {
    var parsed = parseDef(def);
    this.table = table;
    this.db = db;
    this.def = parsed.def;
    this.rdef = parsed.rdef;
    this.key = parsed.key;
    this.unique = parsed.unique;
}
module.exports = Model;

function parseDef(def) {
    var key = undefined;
    var rdef = {};
    var unique = [];
    for (var field in def) {
        var col = def[field]._col || field;
        def[field]._field = field;
        def[field]._col = col;
        rdef[col] = def[field];
        if (def[field]._key === true) {
            key = def[field];
        }
        if (def[field]._unique === true) {
            unique.push(def[field]);
        }
    }
    return {
        key: key,
        unique: unique,
        def: def,
        rdef: rdef,
    }
}

Model.$proto("toSql", function() {
    var table = this.table;
    var def = this.def;
    var unique = this.unique;
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    var buf = [];
    for (var field in def) {
        buf.push(def[field]._col + " " + def[field].toSql());
    }
    for (var i in unique) {
        buf.push("UNIQUE(" + unique[i]._col + ")");
    }
    var tableStr = buf.join(", ");
    var sql = util.format(fmt, table, tableStr);
    return sql;
});
Model.$proto("toObj", function(row) {
    var def = this.def;
    var ret = {};
    for (var field in this.def) {
        if (row[def[field]._col] !== undefined) {
            ret[field] = row[def[field]._col];
        }
    }
    return ret;
});
Model.$proto("toRow", function(obj) {
    var def = this.def;
    var ret = {};
    for (var field in this.def) {
        if (obj[field] !== undefined) {
            ret[def[field]._col] = obj[field];
        }
    }
    return ret;
});
Model.$proto("sync", function() {
    return this.db.query(this.toSql());
});
Model.$proto("drop", function() {
    var sql = "DROP TABLE IF EXISTS " + this.table;
    return this.db.query(sql);
});
Model.$proto("create", function(obj, tx) {
    var row = this.toRow(obj);
    var that = this;
    return this.db.create(this.table, row, tx).then(function(res) {
        var ret = that.toObj(row);
        if (that.key._auto) {
            ret[that.key._field] = res.rows.insertId;
        }
        return ret;
    })
});
Model.$proto("find", function(cond, tx) {
    var model = this;

    function filter(cond) {
        if (cond instanceof cond.type.OpCond) {
            cond.col = model.rdef[cond.col]._col;
        } else if (cond instanceof cond.type.WrapCond) {
            var conds = cond.conds;
            for (var i = 0; i < conds.length; i++) {
                cond.conds[i] = filter(conds[i]);
            }
        }
        return cond;
    }
    cond = filter(cond);
    return this.db.find(this.table, cond, tx).then(function(res) {
        logger.log(res);
        return res;
    });
})

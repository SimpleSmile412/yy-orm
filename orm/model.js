var common = require("../../yy-common");
var logger = common.logger;
var util = require("util");

function Model(table, def, db) {
    var parsed = parseDef(def);
    this.table = table;
    this.db = db;
    this.def = parsed.def;
    this.key = parsed.key;
    this.unique = parsed.unique;
}

function parseDef(def) {
    var key = undefined;
    var unique = [];
    for (var field in def) {
        def[field].field = field;
        def[field].col = def[field].col || field;
        if (def[field].key === true) {
            key = def[field];
        }
        if (def[field].unique === true) {
            unique.push(def[field]);
        }
    }
    return {
        key: key,
        unique: unique,
        def: def,
    }
}

Model.$proto("toSql", function() {
    var table = this.table;
    var def = this.def;
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    var buf = [];
    for (var field in def) {
        buf.push(def[field].col + " " + def[field].toSql());
    }
    var cols = buf.join(", ");
    var sql = util.format(fmt, table, cols);
    return sql;
});
Model.$proto("toModel", function(row) {
    var def = this.def;
    var ret = {};
    for (var field in this.def) {
        if (row[def[field].col] !== undefined) {
            ret[field] = row[def[field].col];
        }
    }
    return ret;
});
Model.$proto("toRow", function(obj) {
    var def = this.def;
    var ret = {};
    for (var field in this.def) {
        if (obj[field] !== undefined) {
            ret[def[field].col] = obj[field];
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

module.exports = Model;

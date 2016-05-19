var logger = require("yy-logger");
var util = require("util");
var mysql = require("mysql");
var _ = require("lodash");

module.exports = ModelMeta;

//info:{field, column, type, builder, ref}
//meta:{fields, columns, constraints, pkey, ...}
//def:{field=>builder{_type, ... }}
function ModelMeta(def) {
    this.fields = {};
    this.columns = {};
    this.constraints = { unique: [] };
    this.pkey = [];

    for (var field in def.base) {
        var typeBuilder = def.base[field];
        var column = typeBuilder._on || field;
        var type = typeBuilder._type;
        var builder = typeBuilder;
        var info = { field: field, column: column, type: type, builder: builder };
        this.fields[field] = info;
        this.columns[column] = info;
        if (typeBuilder._unique) {
            this.constraints.unique.push([column]);
        }
        if (typeBuilder._pkey) {
            this.pkey.push(column);
        }
    }
}

ModelMeta.prototype.toSql = function() {
    var buf = [];
    for (var column in this.columns) {
        var info = this.columns[column];
        var sql = util.format("%s %s", column, info.builder.toSql())
        buf.push(sql);
    }
    this.constraints.unique.map(function(cols) {
        var sql = util.format("UNIQUE(%s)", cols.join(", "));
        buf.push(sql);
    })
    return buf.join(", ");
}


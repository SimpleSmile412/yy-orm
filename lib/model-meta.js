var logger = require("yy-logger");
var util = require("util");
var mysql = require("mysql");
var _ = require("lodash");

module.exports = ModelMeta;

//info:{field, column, type, builder}
//meta:{fields, columns, constraints, pkey, // defaultValue, auto}
//def:{field=>builder{_type, ... }}
function ModelMeta(def, model) {
    this.model = model;
    this.fields = {};
    this.columns = {};
    this.constraints = { unique: [] };
    this.pkey = [];

    this.defaultValue = {};
    this.auto = false;

    for (var field in def.base) {
        var typeBuilder = def.base[field];
        var column = typeBuilder._on || field;
        var type = typeBuilder._type;
        var builder = typeBuilder;
        var info = { field: field, column: column, type: type, builder: builder };
        this.fields[field] = info;
        this.columns[column] = info;
        if (typeBuilder._unique) {
            this.constraints.unique.push([info]);
        }
        if (typeBuilder._pkey) {
            this.pkey.push(info);
        }
        this.defaultValue[field] = typeBuilder._default === undefined ? null : typeBuilder._default;
    }
    if (this.pkey.length === 1 && this.pkey[0].builder._auto) {
        this.auto = true;
    }
    if (this.pkey.length === 0) {
        throw new Error("No Primary Key");
    }
}

ModelMeta.prototype.toSql = function() {
    var buf = [];
    for (var column in this.columns) {
        var info = this.columns[column];
        var sql = util.format("%s %s", column, info.builder.toSql())
        buf.push(sql);
    }
    this.constraints.unique.map(function(infos) {
        var sql = util.format("UNIQUE(%s)", infos.map(info => info.column).join(", "));
        buf.push(sql);
    })
    return buf.join(", ");
}

ModelMeta.prototype.toRow = function(obj) {
    var fields = this.fields;
    return _(obj).mapKeys((x, field) => fields[field].column).value();
}

ModelMeta.prototype.toObj = function(row) {
    var columns = this.columns;
    return _(row).mapKeys((x, column) => columns[column].field).value();
}

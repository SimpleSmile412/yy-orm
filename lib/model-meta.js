var logger = require("yy-logger");
var util = require("util");
var mysql = require("mysql");
var _ = require("lodash");
var Big = require("yy-big");
var JSONB = Big.JSON;
var BigNumber = Big.Number;

module.exports = ModelMeta;

//info:{field, column, type, builder}
//meta:{fields, columns, constraints, pkey, // defaultValue, auto}
//def:{field=>builder{_type, ... }}
function ModelMeta(def, model) {
    this.model = model;
    this.fields = {};
    this.columns = {};
    this.constraints = { unique: [] };
    this.pkey = null;

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
        if (typeBuilder._pkey && this.pkey) {
            throw new Error("Primary Key Already Exists");
        }
        if (typeBuilder._pkey && !this.pkey) {
            this.pkey = info;
            this.auto = info.builder._auto;
        }
        this.defaultValue[field] = typeBuilder._default === undefined ? null : typeBuilder._default;
    }
    if (!this.pkey) {
        throw new Error("No Primary Key");
    }
}

ModelMeta.prototype.toSql = function() {
    var buf = [];
    for (var column in this.columns) {
        var info = this.columns[column];
        var sql = util.format("%s %s", column, info.builder.toSql());
        buf.push(sql);
    }
    this.constraints.unique.map(function(infos) {
        var sql = util.format("UNIQUE(%s)", infos.map(info => info.column).join(", "));
        buf.push(sql);
    })
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    return util.format(fmt, this.model.table, buf.join(", "));
}

//bigint must transfer from bignumber to string
ModelMeta.prototype.toRow = function(obj) {
    var fields = this.fields;
    return _(obj).transform((result, value, field) => fields[field].type === "BIGINT" ? (result[fields[field].column] = value.toString()) : (result[fields[field].column] = value), {}).value();
}

//bigint must transfer from string to bignumber
ModelMeta.prototype.toObj = function(row) {
    var columns = this.columns;
    return _(row).transform((result, value, column) => columns[column].type === "BIGINT" ? (result[columns[column].field] = new BigNumber(value)) : (result[columns[column].field] = value), {}).value();
}

ModelMeta.prototype.parse = function(json) {
    var fields = this.fields;
    return _(JSONB.parse(json)).transform((result, value, field) => fields[field].type === "BIGINT" ? (result[field] = new BigNumber(value)) : (result[field] = value), {}).value();
}

ModelMeta.prototype.stringify = function(obj) {
    return JSONB.stringify(obj);
}

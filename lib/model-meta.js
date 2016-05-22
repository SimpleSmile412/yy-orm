var logger = require("yy-logger");
var util = require("util");
var mysql = require("mysql");
var _ = require("lodash");
var Big = require("yy-big");
var JSONB = Big.JSON;
var BigNumber = Big.Number;

module.exports = ModelMeta;

//info:{field, column, type, pkey, builder}
//meta:{fields, columns, relations, unique, pkey, 
//      defaultValue, auto, bigint}
//def:{field=>builder{_type, ... }}
function ModelMeta(def, model) {
    this.model = model;
    this.fields = {};
    this.columns = {};
    this.unique = [];
    this.pkey = null;

    this.defaultValue = {};
    this.auto = false;
    this.bigint = [];

    for (var field in def.base) {
        var typeBuilder = def.base[field];
        var column = typeBuilder._on || field;
        var type = typeBuilder._type;
        var pkey = typeBuilder._pkey;
        var builder = typeBuilder;
        var info = { field: field, column: column, type: type, pkey: pkey, builder: builder };
        this.fields[field] = info;
        this.columns[column] = info;
        if (typeBuilder._unique) {
            this.unique.push([info]);
        }
        if (pkey && this.pkey) {
            throw new Error("Primary Key Already Exists");
        }
        if (pkey && !this.pkey) {
            this.pkey = info;
            this.auto = info.builder._auto;
        }
        this.defaultValue[field] = typeBuilder._default === undefined ? null : typeBuilder._default;
        if (type === "BIGINT") {
            this.bigint.push(info);
        }
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
    this.unique.map(function(infos) {
        var sql = util.format("UNIQUE(%s)", infos.map(info => info.column).join(", "));
        buf.push(sql);
    })
    var fmt = "CREATE TABLE IF NOT EXISTS %s(%s)";
    return util.format(fmt, this.model.table, buf.join(", "));
}

//bigint must transfer from bignumber to string, and do not set id
ModelMeta.prototype.toRow = function(obj, ignoreErr) {
    var that = this;
    var fields = this.fields;
    return _(obj).transform(function(result, value, field) {
        var info = fields[field];
        if (!info) {
            if (ignoreErr) return;
            throw new Error(util.format("Invalide Field [%s] Of [%s]", field, that.model.table));
        }
        if (info.type === "BIGINT") {
            result[info.column] = value.toString();
        } else {
            result[info.column] = value;
        }
    }, {}).value();
}

//bigint must transfer from string to bignumber
ModelMeta.prototype.toObj = function(row, ignoreErr) {
    var that = this;
    var columns = this.columns;
    return _(row).transform(function(result, value, column) {
        var info = columns[column];
        if (!info) {
            if (ignoreErr) return;
            throw new Error(util.format("Invalide Column [%s] Of [%s]", column, that.model.table));
        }
        if (info.type === "BIGINT") {
            result[info.field] = new BigNumber(value);
        } else {
            result[info.field] = value;
        }
    }, {}).value();
}

ModelMeta.prototype.transBigint = function(obj) {
    this.bigint.map(function(info) {
        if (obj[info.field].constructor.name === "BigNumber") return;
        obj[info.field] = new BigNumber(obj[info.field]);
    })
}

ModelMeta.prototype.pkeyCond = function(obj) {
    var ret = {};
    ret[this.pkey.column] = obj[this.pkey.field];
    return ret;
}

ModelMeta.prototype.parse = function(json) {
    var fields = this.fields;
    return _(JSONB.parse(json)).transform((result, value, field) => fields[field].type === "BIGINT" ? (result[field] = new BigNumber(value)) : (result[field] = value), {}).value();
}

ModelMeta.prototype.stringify = function(obj) {
    return JSONB.stringify(obj);
}

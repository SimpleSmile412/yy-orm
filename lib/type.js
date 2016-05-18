var logger = require("yy-logger");
var mysql = require("mysql");
var _ = require("lodash");

function Type(type) {
    this._type = type;
}

var type = {
    integer: integer,
    varchar: varchar,
    datetime: datetime,
    id: id,
}

function integer(def) {
    return new Type("INTEGER").default(def);
}

function varchar(a, b) {
    var def = _(arguments).filter(_.isString).nth(0);
    var len = _(arguments).filter(_.isNumber).nth(0) || 128;
    return new Type("VARCHAR").default(def).len(len);
}

function datetime(def) {
    return new Type("DATETIME").default(def);
}

function id() {
    return integer().key().auto();
}

module.exports = type;

Type.prototype.toSql = function() {
    var buf = [];
    if (this._len > 0) {
        buf.push(this._type + "(" + this._len + ")");
    } else {
        buf.push(this._type);
    }
    if (this._key === true) {
        buf.push("PRIMARY KEY");
    }
    if (this._notNull === true) {
        buf.push("NOT NULL");
    }
    if (this._default !== undefined) {
        buf.push("DEFAULT " + mysql.escape(this._default));
    }
    if (this._auto === true) {
        buf.push("AUTO_INCREMENT");
    }
    return buf.join(" ");
}

Type.prototype.len = function(len) {
    if (len !== undefined) {
        this._len = len;
    }
    return this;
}
Type.prototype.key = function() {
    this._key = true;
    return this;
}
Type.prototype.notNull = function() {
    this._notNull = true;
    return this;
}
Type.prototype.default = function(def) {
    if (def !== undefined) {
        this._default = def;
    }
    return this;
}
Type.prototype.auto = function() {
    this._auto = true;
    return this;
}
Type.prototype.on = function(col) {
    if (col !== undefined) {
        this._col = col;
    }
    return this;
}

Type.prototype.unique = function() {
    this._unique = true;
    return this;
}

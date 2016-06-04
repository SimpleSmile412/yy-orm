var logger = require("yy-logger");
var mysql = require("mysql");
var _ = require("lodash");

function TypeBuilder(type) {
    this._type = type;
}

var type = {
    integer: integer,
    double: double,
    bigint: bigint,
    varchar: varchar,
    datetime: datetime,
    id: id,
}

function integer(def) {
    return new TypeBuilder("INTEGER").default(def);
}

function double(def) {
    return new TypeBuilder("DOUBLE").default(def);
}

function bigint(def) {
    return new TypeBuilder("BIGINT").default(def);
}

function varchar(a, b) {
    var def = _(arguments).filter(_.isString).nth(0);
    var len = _(arguments).filter(_.isNumber).nth(0) || 128;
    return new TypeBuilder("VARCHAR").default(def).length(len);
}

function datetime(def) {
    return new TypeBuilder("DATETIME").default(def);
}

function id() {
    return integer().pkey().auto();
}

module.exports = type;

TypeBuilder.prototype.toSql = function() {
    var buf = [];
    if (this._length > 0) {
        buf.push(this._type + "(" + this._length + ")");
    } else {
        buf.push(this._type);
    }
    if (this._pkey === true) {
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

TypeBuilder.prototype.length = function(len) {
    if (len !== undefined) {
        this._length = len;
    }
    return this;
}
TypeBuilder.prototype.pkey = function() {
    this._pkey = true;
    return this;
}
TypeBuilder.prototype.notNull = function() {
    this._notNull = true;
    return this;
}
TypeBuilder.prototype.default = function(def) {
    if (def !== undefined) {
        this._default = def;
    }
    return this;
}
TypeBuilder.prototype.auto = function() {
    this._auto = true;
    return this;
}

TypeBuilder.prototype.on = function(col) {
    if (col !== undefined) {
        this._on = col;
    }
    return this;
}

TypeBuilder.prototype.unique = function() {
    this._unique = true;
    return this;
}

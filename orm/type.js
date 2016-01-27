var common = require("../../yy-common");
var logger = common.logger;

var kit = require("./kit");

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
    var def = typeof a === "string" ? a : typeof b === "string" ? b : undefined;
    var len = typeof a === "number" ? a : typeof b === "number" ? b : undefined;
    len = len || 128;
    return new Type("VARCHAR").default(def).len(len);
}

function datetime(def) {
    return new Type("DATETIME").default(def);
}

function id() {
    return integer().key().auto();
}

module.exports = type;

Type.$proto("toSql", function() {
    var buf = [];
    if (this._len > 0) {
        buf.push(this._type + "(" + this._len + ")");
    } else {
        buf.push(this._type);
    }
    if (this._key === true) {
        buf.push("PRIMARY KEY");
    }
    if (this._required === true) {
        buf.push("NOT NULL");
    }
    if (this._default !== undefined) {
        buf.push("DEFAULT " + kit.normalize(this._default));
    }
    if (this._auto === true) {
        buf.push("AUTO_INCREMENT");
    }
    return buf.join(" ");
})

Type.$proto("len", function(len) {
    if (len !== undefined) {
        this._len = len;
    }
    return this;
});
Type.$proto("key", function() {
    this._key = true;
    return this;
});
Type.$proto("required", function() {
    this._required = true;
    return this;
});
Type.$proto("default", function(def) {
    if (def !== undefined) {
        this._default = def;
    }
    return this;
});
Type.$proto("auto", function() {
    this._auto = true;
    return this;
});

Type.$proto("unique", function() {
    this._unique = true;
    return this;
});

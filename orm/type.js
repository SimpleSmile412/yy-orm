var common = require("../../yy-common");
var logger = common.logger;

var kit = require("./kit");

function Type(type) {
    this._type = type;
}

function hasLen(type) {
    return type === "VARCHAR";
}

function integer() {
    return new Type("INTEGER");
}

function varchar(len) {
    var ret = new Type("VARCHAR");
    if (typeof len === "number") {
        ret.len(len);
    } else {
        ret.len(128);
    }
    return ret;
}

function id() {
    return integer().key().auto();
}

var type = {
    integer: integer,
    varchar: varchar,
    id: id,
}
module.exports = type;

Type.$proto("toSql", function() {
    var buf = [];
    if (hasLen(this._type) && this._len > 0) {
        buf.push(this._type + "(" + this._len + ")");
    } else {
        buf.push(this._type);
    }
    if (this._key === true) {
        buf.push("PRIMARY KEY");
    }
    if (this._require === true) {
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
    if (hasLen(this._type)) {
        this._len = len;
    }
    return this;
});
Type.$proto("key", function() {
    this._key = true;
    return this;
});
Type.$proto("require", function() {
    this._require = true;
    return this;
});
Type.$proto("default", function(def) {
    this._default = def;
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

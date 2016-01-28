var common = require("../../yy-common");
var logger = common.logger;

var kit = require("./kit");
var util = require("util");

var cond = {
    Cond: Cond,
    Limit: Limit,

    and: and,
    or: or,
    eq: eq,
    ne: ne,
    gt: gt,
    lt: lt,
    gte: gte,
    lte: lte,
    inn: inn,
    nin: nin,
    limit: limit,
}

module.exports = cond;

function Cond() {

}

function OpCond() {

}

function WrapCond(){
    
}

function parse(c) {
    if (c instanceof Cond) {
        return c;
    } else if (typeof c !== "object") {
        return cond.eq("$id", kit.normalize(c));
    } else {
        for (var i in c) {
            var condArr = [];
            if (c.hasOwnProperty(i)) {
                condArr.push(cond.eq(i, kit.normalize(c)));
            }
        }
    }
}

function extend(child, parent) {
    var $ = function() {}
    $.prototype = parent.prototype;
    child.prototype = new $();
    child.prototype.constructor = child;
}

util.inherits(And, Cond);
util.inherits(Or, Cond);
util.inherits(Eq, Cond);
util.inherits(Ne, Cond);
util.inherits(Gt, Cond);
util.inherits(Lt, Cond);
util.inherits(Gte, Cond);
util.inherits(Lte, Cond);
util.inherits(In, Cond);
util.inherits(NotIn, Cond);
util.inherits(Limit, Cond);

function and() {
    return new And(arguments.$array());
};

function or() {
    return new Or(arguments.$array());
}

function eq(col, val) {
    return new Eq(col, val);
}

function ne(col, val) {
    return new Ne(col, val);
}

function gt(col, val) {
    return new Gt(col, val);
}

function lt(col, val) {
    return new Lt(col, val);
}

function gte(col, val) {
    return new Gte(col, val);
}

function lte(col, val) {
    return new Lte(col, val);
}

function inn(col, arr) {
    return new In(col, arr);
}

function nin(col, arr) {
    return new NotIn(col, arr);
}

function limit(c, n, off) {
    return new Limit(c, n, off);
}
////

function And(conds) {
    this.conds = conds;
};
And.prototype.toString = function() {
    var buf = [];
    for (var i in this.conds) {
        buf.push(this.conds[i].toString());
    }
    return "(" + buf.join(" AND ") + ")";
};

function Or(conds) {
    this.conds = conds;
};
Or.prototype.toString = function() {
    var buf = [];
    for (var i in this.conds) {
        buf.push(this.conds[i].toString());
    }
    return "(" + buf.join(" OR ") + ")";
};

function Eq(col, val) {
    this.col = col;
    this.val = val;
}
Eq.prototype.toString = function() {
    return util.format("%s = %s", this.col, kit.normalize(this.val));
}

function Ne(col, val) {
    this.col = col;
    this.val = val;
}
Ne.prototype.toString = function() {
    return util.format("%s <> %s", this.col, kit.normalize(this.val));
}

function Gt(col, val) {
    this.col = col;
    this.val = val;
}
Gt.prototype.toString = function() {
    return util.format("%s > %s", this.col, kit.normalize(this.val));
}

function Lt(col, val) {
    this.col = col;
    this.val = val;
}
Lt.prototype.toString = function() {
    return util.format("%s < %s", this.col, kit.normalize(this.val));
}

function Gte(col, val) {
    this.col = col;
    this.val = val;
}
Gte.prototype.toString = function() {
    return util.format("%s >= %s", this.col, kit.normalize(this.val));
}

function Lte(col, val) {
    this.col = col;
    this.val = val;
}
Lte.prototype.toString = function() {
    return util.format("%s <= %s", this.col, kit.normalize(this.val));
}

function In(v, arr) {
    this.v = v;
    this.arr = arr;
}
Lte.prototype.toString = function() {
    var buf = [];
    for (var i in this.arr) {
        buf.push(kit.normalize(this.arr[i]));
    }
    return util.format("%s IN (%s)", this.v, buf.join(", "));
}

function NotIn(v, arr) {
    this.v = v;
    this.arr = arr;
}
Lte.prototype.toString = function() {
    var buf = [];
    for (var i in this.arr) {
        buf.push(kit.normalize(this.arr[i]));
    }
    return util.format("%s NOT IN (%s)", this.v, buf.join(", "));
}

function Limit(c, n, off) {
    this.c = c;
    this.n = n;
    this.off = off;
}
Limit.prototype.toString = function() {
    if (this.off !== undefined) {
        return util.format("%s LIMIT %d OFFSET %s", this.c, this.n, this.off);
    } else {
        return util.format("%s LIMIT %d", this.c, this.n);
    }
}

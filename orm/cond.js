var common = require("../../yy-common");
var logger = common.logger;

var kit = require("./kit");
var util = require("util");

module.exports = {
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

function Cond() {}

function extend(child, parent) {
    var $ = function() {}
    $.prototype = parent.prototype;
    child.prototype = new $();
    child.prototype.constructor = child;
}

extend(And, Cond);
extend(Or, Cond);
extend(Eq, Cond);
extend(Ne, Cond);
extend(Gt, Cond);
extend(Lt, Cond);
extend(Gte, Cond);
extend(Lte, Cond);
extend(In, Cond);
extend(NotIn, Cond);
extend(Limit, Cond);

function and() {
    return new And(arguments.$array());
};

function or() {
    return new Or(arguments.$array());
}

function eq(c1, c2) {
    return new Eq(c1, c2);
}

function ne(c1, c2) {
    return new Ne(c1, c2);
}

function gt(c1, c2) {
    return new Gt(c1, c2);
}

function lt(c2, c2) {
    return new Lt(c1, c2);
}

function gte(c2, c2) {
    return new Gte(c1, c2);
}

function lte(c2, c2) {
    return new Lte(c1, c2);
}

function inn(v, arr) {
    return new In(v, arr);
}

function nin(v, arr) {
    return new NotIn(v, arr);
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

function Eq(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
}
Eq.prototype.toString = function() {
    return util.format("%s = %s", this.c1, kit.normalize(this.c2));
}

function Ne(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
}
Ne.prototype.toString = function() {
    return util.format("%s <> %s", this.c1, kit.normalize(this.c2));
}

function Gt(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
}
Gt.prototype.toString = function() {
    return util.format("%s > %s", this.c1, kit.normalize(this.c2));
}

function Lt(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
}
Lt.prototype.toString = function() {
    return util.format("%s < %s", this.c1, kit.normalize(this.c2));
}

function Gte(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
}
Gte.prototype.toString = function() {
    return util.format("%s >= %s", this.c1, kit.normalize(this.c2));
}

function Lte(c1, c2) {
    this.c1 = c1;
    this.c2 = c2;
}
Lte.prototype.toString = function() {
    return util.format("%s <= %s", this.c1, kit.normalize(this.c2));
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

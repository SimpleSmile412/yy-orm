var logger = require("yy-logger");

var util = require("util");
var mysql = require("mysql");
var _ = require("lodash");
var assert = require("assert");

var cond = {
    type: {
        Cond: Cond,
        SimpleCond: SimpleCond,
        CombinedCond: CombinedCond,
        DecorateCond: DecorateCond,
        And: And,
        Or: Or,
        Limit: Limit,
    },
    tool: {
        parseToCondObj: parse,
    },

    parse: parse,
    isCond: isCond,

    raw: raw,
    empty: empty,

    eq: eq,
    ne: ne,
    gt: gt,
    lt: lt,
    gte: gte,
    lte: lte,
    in : inn,
    nin: nin,
    between: between,

    and: and,
    or: or,

    limit: limit,
    asc: asc,
    desc: desc,
}

module.exports = cond;

function Cond() {}

function SimpleCond() {}
util.inherits(SimpleCond, Cond);

function DecorateCond() {}
util.inherits(DecorateCond, Cond);

function CombinedCond() {}
util.inherits(CombinedCond, Cond);

util.inherits(Raw, Cond);
util.inherits(Empty, Cond);

util.inherits(And, CombinedCond);
util.inherits(Or, CombinedCond);

util.inherits(Eq, SimpleCond);
util.inherits(Ne, SimpleCond);
util.inherits(Gt, SimpleCond);
util.inherits(Lt, SimpleCond);
util.inherits(Gte, SimpleCond);
util.inherits(Lte, SimpleCond);
util.inherits(In, SimpleCond);
util.inherits(NotIn, SimpleCond);
util.inherits(Between, SimpleCond);

util.inherits(Limit, DecorateCond);
util.inherits(Asc, DecorateCond);
util.inherits(Desc, DecorateCond);

Cond.prototype.and = function(c) {
    return cond.and(this, c);
}
Cond.prototype.or = function(c) {
    return cond.or(this, c);
}
Cond.prototype.limit = function(n, off) {
    return cond.limit(this, n, off);
}
Cond.prototype.asc = function(col) {
    return cond.asc(this, col);
}
Cond.prototype.desc = function(col) {
    return cond.desc(this, col);
}

Cond.prototype.toSql = function() {
    throw new Error("Child Must Implement This Function");
}

Cond.prototype.transform = function(mapping) {
    return;
}

SimpleCond.prototype.transform = function(mapping) {
    this.col = mapping[this.col] || this.col;
}

CombinedCond.prototype.transform = function(mapping) {
    this.conds.map(cond => cond.transform(mapping));
}

DecorateCond.prototype.transform = function(mapping) {
    this.cond.transform(mapping);
}

function parse(c) {
    if (c === undefined) {
        return c;
    } else if (c instanceof Cond) {
        return c;
    } else if (_.isString(c)) {
        return cond.raw(c);
    } else if (_.isPlainObject(c)) {
        var condArr = _(c).keys().map(k => cond.eq(k, c[k])).value();
        return cond.and.apply(null, condArr);
    } else {
        throw new Error("Invalid Cond Param, " + typeof(c));
    }
}

function isCond(cond) {
    return cond instanceof Cond || _.isPlainObject(cond);
}

function raw(cond) {
    return new Raw(cond);
}

function empty() {
    return new Empty();
}

function and() {
    if (arguments.length === 1) {
        return arguments[0];
    }
    return new And(_(arguments).values().value());
};

function or() {
    return new Or(_(arguments).values().value());
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

function inn(col, value) {
    return new In(col, value);
}

function nin(col, value) {
    return new NotIn(col, value);
}

function between(col, s, l) {
    return new Between(col, s, l);
}

function limit(c, n, off) {
    var c_ = parse(_(arguments).filter(isCond).nth(0) || cond.empty());
    var n_ = _(arguments).filter(_.isNumber).nth(0) || 1;
    var off_ = _(arguments).filter(_.isNumber).nth(1) || 0;
    return new Limit(c_, n_, off_);
}

function asc(c, col) {
    var c_ = parse(_(arguments).filter(isCond).nth(0) || cond.empty());
    var col_ = _(arguments).filter(item => _.isString(item) || _.isArray(item)).nth(0);
    return new Asc(c_, col_);
}

function desc(c, col) {
    var c_ = parse(_(arguments).filter(isCond).nth(0) || cond.empty());
    var col_ = _(arguments).filter(item => _.isString(item) || _.isArray(item)).nth(0);
    return new Desc(c_, col_);
}
////


function Raw(cond) {
    this.cond = cond;
}
Raw.prototype.toSql = function() {
    return this.cond;
}

function Empty() {}
Empty.prototype.toSql = function() {
    return "1 = 1";
}

function And(conds) {
    this.conds = conds;
};
And.prototype.toSql = function() {
    var buf = this.conds.map(function(cond) {
        if (cond instanceof SimpleCond) {
            return cond.toSql();
        } else {
            return "(" + cond.toSql() + ")";
        }
    })
    return buf.join(" AND ");
};

function Or(conds) {
    this.conds = conds;
};
Or.prototype.toSql = function() {
    var buf = this.conds.map(function(cond) {
        if (cond instanceof SimpleCond) {
            return cond.toSql();
        } else {
            return "(" + cond.toSql() + ")";
        }
    })
    return buf.join(" OR ");
};

function Eq(col, val) {
    this.col = col;
    this.val = val;
}
Eq.prototype.toSql = function() {
    return mysql.format("?? = ?", [this.col, this.val]);
}

function Ne(col, val) {
    this.col = col;
    this.val = val;
}
Ne.prototype.toSql = function() {
    return mysql.format("?? <> ?", [this.col, this.val]);
}

function Gt(col, val) {
    this.col = col;
    this.val = val;
}
Gt.prototype.toSql = function() {
    return mysql.format("?? > ?", [this.col, this.val]);
}

function Lt(col, val) {
    this.col = col;
    this.val = val;
}
Lt.prototype.toSql = function() {
    return mysql.format("?? < ?", [this.col, this.val]);
}

function Gte(col, val) {
    this.col = col;
    this.val = val;
}
Gte.prototype.toSql = function() {
    return mysql.format("?? >= ?", [this.col, this.val]);
}

function Lte(col, val) {
    this.col = col;
    this.val = val;
}
Lte.prototype.toSql = function() {
    return mysql.format("?? <= ?", [this.col, this.val]);
}

function In(col, val) {
    this.col = col;
    this.val = val;
}
In.prototype.toSql = function() {
    return mysql.format("?? IN (?)", [this.col, this.val]);
}

function NotIn(col, val) {
    this.col = col;
    this.val = val;
}
NotIn.prototype.toSql = function() {
    return mysql.format("?? NOT IN (?)", [this.col, this.val]);
}

function Between(col, s, l) {
    this.col = col;
    this.s = s;
    this.l = l;
}
Between.prototype.toSql = function() {
    return mysql.format("?? BETWEEN ? AND ?", [this.col, this.s, this.l]);
}

function Limit(c, n, off) {
    this.cond = c;
    this.n = n;
    this.off = off;
}
Limit.prototype.toSql = function() {
    var condStr = this.cond.toSql();
    if (this.off !== undefined) {
        return util.format("%s LIMIT %d OFFSET %s", condStr, this.n, this.off);
    } else {
        return util.format("%s LIMIT %d", condStr, this.n);
    }
}

function Asc(c, col) {
    this.cond = c;
    this.col = col;
}
Asc.prototype.toSql = function() {
    var condStr = this.cond.toSql();
    var col = Array.isArray(this.col) ? this.col : [this.col];
    var fmt = util.format("%s ORDER BY ?? ASC", condStr);
    return mysql.format(fmt, [col]);
}

function Desc(c, col) {
    this.cond = c;
    this.col = col;
}
Desc.prototype.toSql = function() {
    var condStr = this.cond.toSql();
    var col = Array.isArray(this.col) ? this.col : [this.col];
    var fmt = util.format("%s ORDER BY ?? DESC", condStr);
    return mysql.format(fmt, [col]);
}

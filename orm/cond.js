var common = require("../../yy-common");
var logger = common.logger;

var kit = require("./kit");
var util = require("util");
var mysql = require("mysql");

var cond = {
    type: {
        Cond: Cond,
        OpCond: OpCond,
        WrapCondSingle: WrapCondSingle,
        WrapCondMulti: WrapCondMulti,
        And: And,
        Or: Or,
        Limit: Limit,
    },
    tool: {
        parseToCondObj: parseToCondObj,
    },

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
    between: between,
    limit: limit,
    asc: asc,
    desc: desc,
}

module.exports = cond;

function Cond() {

}
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

function OpCond() {

}
util.inherits(OpCond, Cond);

function WrapCondSingle() {

}
util.inherits(WrapCondSingle, Cond);

function WrapCondMulti() {

}
util.inherits(WrapCondMulti, Cond);

function parseToCondObj(c) {
    if (c === undefined) {
        return c;
    } else if (c instanceof Cond) {
        return c;
    } else if (typeof c !== "object") {
        return undefined;
    } else {
        var condArr = [];
        for (var i in c) {
            if (c.hasOwnProperty(i)) {
                condArr.push(cond.eq(i, c[i]));
            }
        }
        return cond.and.apply(null, condArr);
    }
}

util.inherits(And, WrapCondMulti);
util.inherits(Or, WrapCondMulti);

util.inherits(Eq, OpCond);
util.inherits(Ne, OpCond);
util.inherits(Gt, OpCond);
util.inherits(Lt, OpCond);
util.inherits(Gte, OpCond);
util.inherits(Lte, OpCond);
util.inherits(In, OpCond);
util.inherits(NotIn, OpCond);

util.inherits(Limit, WrapCondSingle);
util.inherits(Asc, WrapCondSingle);
util.inherits(Desc, WrapCondSingle);

function and() {
    if (arguments.length === 1) {
        return arguments[0];
    }
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

function inn(col, value) {
    return new In(col, value);
}

function nin(col, value) {
    return new NotIn(col, value);
}

function between(col, value) {
    return new Between(col, value);
}

function limit(c, n, off) {
    return new Limit(c, n, off);
}

function asc(c, col) {
    return new Asc(c, col);
}

function desc(c, col) {
    return new Desc(c, col);
}
////

function And(c) {
    this.cond = c;
};
And.prototype.toSql = function() {
    var buf = [];
    for (var i in this.cond) {
        var c = this.cond[i];
        if (c instanceof OpCond === false) {
            buf.push("(" + c.toSql + ")");
        } else {
            buf.push(c.toSql());
        }
    }
    return buf.join(" AND ");
};

function Or(c) {
    this.cond = c;
};
Or.prototype.toSql = function() {
    var buf = [];
    for (var i in this.cond) {
        buf.push(this.cond[i].toSql());
    }
    return "(" + buf.join(" OR ") + ")";
};

function Eq(col, val) {
    this.col = col;
    this.val = val;
}
Eq.prototype.toSql = function() {
    return util.format("%s = %s", this.col, mysql.escape(this.val));
}

function Ne(col, val) {
    this.col = col;
    this.val = val;
}
Ne.prototype.toSql = function() {
    return util.format("%s <> %s", this.col, kit.normalize(this.val));
}

function Gt(col, val) {
    this.col = col;
    this.val = val;
}
Gt.prototype.toSql = function() {
    return util.format("%s > %s", this.col, kit.normalize(this.val));
}

function Lt(col, val) {
    this.col = col;
    this.val = val;
}
Lt.prototype.toSql = function() {
    return util.format("%s < %s", this.col, kit.normalize(this.val));
}

function Gte(col, val) {
    this.col = col;
    this.val = val;
}
Gte.prototype.toSql = function() {
    return util.format("%s >= %s", this.col, kit.normalize(this.val));
}

function Lte(col, val) {
    this.col = col;
    this.val = val;
}
Lte.prototype.toSql = function() {
    return util.format("%s <= %s", this.col, kit.normalize(this.val));
}

function In(col, val) {
    this.col = col;
    this.val = val;
}
Lte.prototype.toSql = function() {
    var buf = [];
    for (var i in this.val) {
        buf.push(kit.normalize(this.val[i]));
    }
    return util.format("%s IN (%s)", this.col, buf.join(", "));
}

function NotIn(col, val) {
    this.col = col;
    this.val = val;
}
Lte.prototype.toSql = function() {
    var buf = [];
    for (var i in this.val) {
        buf.push(kit.normalize(this.val[i]));
    }
    return util.format("%s NOT IN (%s)", this.col, buf.join(", "));
}

function Between(col, val) {
    this.col = col;
    this.val = val;
}
Between.prototype.toSql = function() {
    return util.format("%s BETWEEN %s AND %s", this.col, mysql.escape(this.value[0]), mysql.escape(this.value[1]));
}

function Limit(c, n, off) {
    this.cond = c;
    this.n = n;
    this.off = off;
}
Limit.prototype.toSql = function() {
    if (this.off !== undefined) {
        return util.format("%s LIMIT %d OFFSET %s", this.cond.toSql(), this.n, this.off);
    } else {
        return util.format("%s LIMIT %d", this.cond.toSql(), this.n);
    }
}

function Asc(c, col) {
    this.cond = c;
    this.col = col;
}
Asc.prototype.toSql = function() {
    var col = Array.isArray(this.col) ? this.col : [this.col];
    return mysql.format("?? ORDER BY ?? ASC", [this.cond.toSql(), col]);
}

function Desc(c, col) {
    this.cond = c;
    this.col = col;
}
Desc.prototype.toSql = function() {
    var col = Array.isArray(this.col) ? this.col : [this.col];
    return mysql.format("?? ORDER BY ?? DESC", [this.cond.toSql(), col]);

}

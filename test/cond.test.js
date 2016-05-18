var Promise = require("bluebird");
var should = require("should");

var orm = require("..");
var logger = orm.logger;
var type = orm.type;
var cond = orm.cond;
var condType = cond.type;
var condTool = cond.tool;

describe('Cond', function() {
    it('Simple Cond', function(done) {
        var c = cond.eq("value", 1);
        console.log(c.toSql());
        c.toSql().should.eql("`value` = 1");

        var c = cond.ne("value", "string");
        console.log(c.toSql());
        c.toSql().should.eql("`value` <> 'string'");

        var c = cond.gt("value", 100);
        console.log(c.toSql());
        c.toSql().should.eql("`value` > 100");

        var c = cond.lt("value", -100);
        console.log(c.toSql());
        c.toSql().should.eql("`value` < -100");

        var c = cond.gte("value", 100);
        console.log(c.toSql());
        c.toSql().should.eql("`value` >= 100");

        var c = cond.lte("value", -100);
        console.log(c.toSql());
        c.toSql().should.eql("`value` <= -100");

        var c = cond.in("value", [1, 2, 3]);
        console.log(c.toSql());
        c.toSql().should.eql("`value` IN (1, 2, 3)");

        var c = cond.nin("value", [1, 2, 3]);
        console.log(c.toSql());
        c.toSql().should.eql("`value` NOT IN (1, 2, 3)");

        var c = cond.between("value", 1, 2);
        console.log(c.toSql());
        c.toSql().should.eql("`value` BETWEEN 1 AND 2");

        done();
    });
    it('Combined Cond', function(done) {
        var c1 = cond.eq("a", 1);
        var c2 = cond.ne("b", 2);
        var a1 = cond.and(c1, c2);
        console.log(a1.toSql());
        a1.toSql().should.eql("`a` = 1 AND `b` <> 2");

        var a2 = a1.or(cond.lt("c", 3));
        console.log(a2.toSql());
        a2.toSql().should.eql("(`a` = 1 AND `b` <> 2) OR `c` < 3");

        done();
    });
    it('Decorate Cond', function(done) {
        var c1 = cond.eq("a", 1);
        var c2 = c1.asc("b").limit(10, 5);
        console.log(c2.toSql());
        c2.toSql().should.eql("`a` = 1 ORDER BY `b` ASC LIMIT 10 OFFSET 5");

        var c3 = cond.desc("c").limit(20);
        console.log(c3.toSql());
        c3.toSql().should.eql("1 = 1 ORDER BY `c` DESC LIMIT 20");

        done();
    });
});

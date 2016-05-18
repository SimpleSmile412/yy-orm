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
    // it('Typeof Limit', function(done) {
    //     var eq = cond.eq("value", 1);
    //     var belong = eq instanceof cond.type.Limit;
    //     belong.should.eql(false);
    //     eq = cond.limit(eq, 1);
    //     belong = eq instanceof cond.type.Limit;
    //     belong.should.eql(true);
    //     done();
    // });
    // it('And/Eq', function(done) {
    //     var c = condTool.parseToCondObj({
    //         a: "asdf",
    //     });
    //     var belong = c.cond instanceof condType.OpCond;
    //     belong.should.be.ok;
    //     s = c.toSql();
    //     s.should.eql("`a` = 'asdf'");
    //     done();
    // });
    // it('Parse', function(done) {
    //     var c = condTool.parseToCondObj({
    //         a: "asdf",
    //         b: 1,
    //     });
    //     c.cond.length.should.eql(2);
    //     done();
    // });
    // it('Compose', function(done) {
    //     var c = cond.lt("a", "1").and(cond.eq("b", 2)).asc(["a", "b"]);
    //     c.toSql().should.eql("`a` < '1' AND `b` = 2 ORDER BY `a`, `b` ASC");
    //     done();
    // });
    // it('In', function(done) {
    //     var c = cond.in("i", [1, 2, 3, 4]);
    //     c.toSql().should.eql("`i` IN (1, 2, 3, 4)");
    //     c = cond.in("s", ["a", "b", "c"]);
    //     c.toSql().should.eql("`s` IN ('a', 'b', 'c')");
    //     done();
    // });
    // it('Between', function(done) {
    //     var c = cond.between("i", 1, 3);
    //     c.toSql().should.eql("`i` BETWEEN 1 AND 3");
    //     var c2 = cond.between("i", "1", "3");
    //     c2.toSql().should.eql("`i` BETWEEN '1' AND '3'");
    //     done();
    // });
});

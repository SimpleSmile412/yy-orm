var Promise = require("bluebird");
var should = require("should");

var orm = require("../..");
var logger = orm.logger;
var type = orm.type;
var cond = orm.cond;
var condType = cond.type;
var condTool = cond.tool;

describe('Cond', function() {
    it('Typeof Limit', function(done) {
        var eq = cond.eq("value", 1);
        var belong = eq instanceof cond.type.Limit;
        belong.should.eql(false);
        eq = cond.limit(eq, 1);
        belong = eq instanceof cond.type.Limit;
        belong.should.eql(true);
        done();
    });
    it('And/Eq', function(done) {
        var c = condTool.parseToCondObj({
            a: "asdf",
        });
        var belong = c.cond instanceof condType.OpCond;
        belong.should.be.ok;
        s = c.toSql();
        s.should.eql("`a` = 'asdf'");
        done();
    });
    it('Parse', function(done) {
        var c = condTool.parseToCondObj({
            a: "asdf",
            b: 1,
        });
        c.cond.length.should.eql(2);
        done();
    });
    it('Compose', function(done) {
        var c = cond.lt("a", "1").and(cond.eq("b", 2)).asc(["a", "b"]);
        c.toSql().should.eql("`a` < '1' AND `b` = 2 ORDER BY `a`, `b` ASC");
        done();
    });
    it('In', function(done) {
        var c = cond.in("i", [1, 2, 3, 4]);
        c.toSql().should.eql("`i` IN (1, 2, 3, 4)");
        c = cond.in("s", ["a", "b", "c"]);
        c.toSql().should.eql("`s` IN ('a', 'b', 'c')");
        done();
    });
    it('Between', function(done) {
        var c = cond.between("i", 1, 3);
        c.toSql().should.eql("`i` BETWEEN 1 AND 3");
        var c2 = cond.between("i", "1", "3");
        c2.toSql().should.eql("`i` BETWEEN '1' AND '3'");
        done();
    });
});

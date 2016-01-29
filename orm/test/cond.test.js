var Promise = require("bluebird");
var should = require("should");

var orm = require("../../orm");
var type = orm.type;
var cond = orm.cond;
var condType = cond.type;
var condTool = cond.tool;

var logger = console;

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
        s.should.eql(`a = 'asdf'`);
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
        c.toSql().should.eql("`a < '1' AND b = 2` ORDER BY `a`, `b` ASC");
        done();
    });
});

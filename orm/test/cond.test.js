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
    it('And Eq', function(done) {
        var c = condTool.parseToCondObj({
            a: "asdf",
        });
        var belong = c.cond[0] instanceof condType.OpCond;
        belong.should.be.ok;
        var e = cond.eq("a", "asdf");
        var s = [e.toSql()].join("and");
        logger.log(s);
        s = c.toSql();
        logger.log(s);
        done();
    });
});

var Promise = require("bluebird");
var should = require("should");

var orm = require("../../orm");
var type = orm.type;
var cond = orm.cond;

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
});

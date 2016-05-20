var Promise = require("bluebird");
var should = require("should");

var orm = require("..");
var logger = orm.logger;
var type = orm.type;

describe('Type', function() {
    //integer varchar datetime
    //notNull default length auto
    //pkey unique
    it('Integer', function(done) {
        var t = type.integer();
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER");

        var t = type.integer(10);
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER DEFAULT 10");

        var t = type.integer().default(10);
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER DEFAULT 10");

        var t = type.integer().notNull();
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER NOT NULL");

        var t = type.integer().auto();
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER AUTO_INCREMENT");

        done();
    });
    it('Varchar', function(done) {
        var t = type.varchar();
        console.log(t.toSql());
        t.toSql().should.eql("VARCHAR(128)");

        var t = type.varchar(32, "hi");
        console.log(t.toSql());
        t.toSql().should.eql("VARCHAR(32) DEFAULT 'hi'");

        var t = type.varchar("hi", 32);
        console.log(t.toSql());
        t.toSql().should.eql("VARCHAR(32) DEFAULT 'hi'");

        var t = type.varchar("hi");
        console.log(t.toSql());
        t.toSql().should.eql("VARCHAR(128) DEFAULT 'hi'");

        var t = type.varchar().length(32).default("hi");
        console.log(t.toSql());
        t.toSql().should.eql("VARCHAR(32) DEFAULT 'hi'");

        done();
    });
    it('Datetime', function(done) {
        var dft = new Date(2015, 0, 1);
        var t = type.datetime();
        console.log(t.toSql());
        t.toSql().should.eql("DATETIME");

        var t = type.datetime(dft);
        console.log(t.toSql());
        t.toSql().should.eql("DATETIME DEFAULT '2015-01-01 00:00:00.000'");

        var t = type.datetime().default(dft);
        console.log(t.toSql());
        t.toSql().should.eql("DATETIME DEFAULT '2015-01-01 00:00:00.000'");
        done();
    });
    it('Constraint', function(done) {
        var t = type.integer().pkey();
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER PRIMARY KEY");

        var t = type.id();
        console.log(t.toSql());
        t.toSql().should.eql("INTEGER PRIMARY KEY AUTO_INCREMENT");

        done();
    });
});

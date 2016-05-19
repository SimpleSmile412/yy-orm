var Promise = require("bluebird");
var should = require("should");
var ModelMeta = require("../lib/model-meta");

var orm = require("..");
var type = orm.type;

var defBase = {
    id: type.id(),
    name: type.varchar(32).unique(),
    alias: type.varchar("Rookie"),
    rank: type.integer().default(0),
    registTime: type.datetime().notNull(),
};

describe('ModelMeta', function() {
    it('Base', function(done) {
        var meta = new ModelMeta({ base: defBase });
        console.log(meta.toSql());
        var expect = `id INTEGER PRIMARY KEY AUTO_INCREMENT, name VARCHAR(32), alias VARCHAR(128) DEFAULT 'Rookie', rank INTEGER DEFAULT 0, registTime DATETIME NOT NULL, UNIQUE(name)`;
        meta.toSql().should.eql(expect);
        done();
    })
});

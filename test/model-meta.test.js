var Promise = require("bluebird");
var should = require("should");
var ModelMeta = require("../lib/model-meta");

var orm = require("..");
var type = orm.type;

var defBase = {
    id: type.id(),
    name: type.varchar(32).unique(),
    alias: type.varchar("Rookie"),
    rank: type.integer().default(0).on("page_rank"),
    registTime: type.datetime().notNull().on("regist_time"),
};

describe('ModelMeta', function() {
    it('Base', function(done) {
        var meta = new ModelMeta({ base: defBase }, { table: "user" });
        console.log(meta.toSql());
        var expect = `CREATE TABLE IF NOT EXISTS user(id INTEGER PRIMARY KEY AUTO_INCREMENT, name VARCHAR(32), alias VARCHAR(128) DEFAULT 'Rookie', page_rank INTEGER DEFAULT 0, regist_time DATETIME NOT NULL, UNIQUE(name))`;
        meta.toSql().should.eql(expect);
        done();
    })
    it('Value', function(done) {
        var meta = new ModelMeta({ base: defBase });
        console.log(JSON.stringify(meta.defaultValue));
        meta.defaultValue.should.eql({ "id": null, "name": null, "alias": "Rookie", "rank": 0, "registTime": null });
        done();
    })
    it('toRow', function(done) {
        var meta = new ModelMeta({ base: defBase });
        var obj = { name: "name", alias: "alias", rank: 1, registTime: new Date(2015, 0, 1) };
        var row = meta.toRow(obj);
        var json = JSON.stringify(row);
        console.log(json);
        json.should.eql('{"name":"name","alias":"alias","page_rank":1,"regist_time":"2014-12-31T16:00:00.000Z"}');
        done();
    });
    it('toObj', function(done) {
        var meta = new ModelMeta({ base: defBase });
        var row = { name: "name", alias: "alias", page_rank: 1, regist_time: new Date(2015, 0, 1) };
        var obj = meta.toObj(row);
        var json = JSON.stringify(obj);
        console.log(json);
        json.should.eql('{"name":"name","alias":"alias","rank":1,"registTime":"2014-12-31T16:00:00.000Z"}');
        done();
    });
});

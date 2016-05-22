var Promise = require("bluebird");
var should = require("should");
var co = require("co");
var _ = require("lodash");

var orm = require("..");
var logger = orm.logger;
var type = orm.type;
var cond = orm.cond;

var opt = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
};

var def = {
    id: type.id(),
    name: type.varchar(32).unique(),
    alias: type.varchar("Rookie"),
    rank: type.integer().default(0),
    registTime: type.datetime().notNull(),
};

describe("Connection", function() {
    it('Query', function(done) {
        var db = orm.create(opt);
        var User = db.define("user", def);
        co(function*() {
            yield db.rebuild();
            var conn = yield db.getConnection();
            var res = yield conn.query("select * from User");
            res.rows.length.should.eql(0);
            res.fields.length.should.eql(_(def).keys().value().length);
            var date = new Date();
            date.setMilliseconds(0);
            yield conn.query("insert into User SET ?", { name: "name", registTime: date });
            var res = yield conn.query("select * from User");
            res.rows.length.should.eql(1);
            res.rows[0].should.eql({ id: 1, name: "name", alias: "Rookie", rank: 0, registTime: date });
            done();
        }).catch(function(err) {
            console.log(err.stack);
        })
    });
});

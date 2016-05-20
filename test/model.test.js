var Promise = require("bluebird");
var should = require("should");
var co = require("co");
var _ = require("lodash");

var orm = require("..");
var ModelObject = require("../lib/model-object");
var type = orm.type;
var cond = orm.cond;

var logger = console;

function fail() {
    should(true).eql(false);
}

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
    rank: type.integer().default(0).on("page_rank"),
    registTime: type.datetime().notNull().on("regist_time"),
};

describe('Model', function() {
    it('Transform Condition', function(done) {
        var db = orm.create(opt);
        var User = db.define("user", def);
        var c = cond.and(cond.eq("rank", 100), cond.lt("registTime", new Date(2015, 0, 1))).asc("alias");
        var c = User.transformCondition(c);
        console.log(c.toSql());
        c.toSql().should.eql("`page_rank` = 100 AND `regist_time` < '2015-01-01 00:00:00.000' ORDER BY `alias` ASC");
        done();
    });
    it('Rebuild', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield User.drop();
            try {
                yield db.select("user");
                fail();
            } catch (err) {
                err.message.should.eql("ER_NO_SUCH_TABLE: Table 'test.user' doesn't exist");
            }
            yield User.build();
            yield db.select("user");
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('Insert', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date();
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert(users[0]);
            ret.should.eql({ id: 1, name: "name0", alias: "Rookie", rank: 0, registTime: date });
            var ret = yield User.insert(users.slice(1));
            ret.length.should.eql(2);
            ret[0].id.should.eql(2);
            ret[1].id.should.eql(3);
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('Update', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date();
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert(users);
            ret.length.should.eql(3);
            ret[2].name = "name";
            yield User.update(ret[2]);
            var res = yield db.one("user", { id: ret[2].id });
            res.name.should.eql("name");
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('Select', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date(2015, 0, 1);
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert(users);
            var res = yield User.select();
            should(res[0] instanceof ModelObject).eql(true);
            should(res[0]).eql(ret[0]);
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('One', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date(2015, 0, 1);
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert(users);
            var res = yield User.one({ id: ret[2].id });
            should(res instanceof ModelObject).eql(true);
            should(res).eql(ret[2]);
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('Delete', function(done) {
        this.timeout(3000);
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date(2015, 0, 1);
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert(users);
            var res = yield User.delete(ret[0]);
            res.affectedRows.should.eql(1);
            var res = yield User.delete(ret[0]);
            res.affectedRows.should.eql(0);
            var res = yield User.select({ id: ret[0].id });
            res.length.should.eql(0);
            var res = yield User.delete(ret[1]);
            var res = yield User.delete(ret[2]);
            var res = yield User.select();
            res.length.should.eql(0);

            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('Count', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date(2015, 0, 1);
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert(users);
            var res = yield User.count();
            res.should.eql(3);
            yield User.delete({ id: ret[1].id })
            var res = yield User.count();
            res.should.eql(2);
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
    it('Id', function(done) {
        co(function*() {
            var db = orm.create(opt);
            var User = db.define("user", def);
            yield db.rebuild();
            var date = new Date(2015, 0, 1);
            var users = _.range(3).map(function(i) {
                return { name: "name" + i, registTime: date };
            });
            var ret = yield User.insert({ registTime: date });
            var res = yield User.get(ret.id);
            res.should.eql(ret);
            done();
        }).catch(function(err) {
            console.error(err.stack);
        });
    });
});

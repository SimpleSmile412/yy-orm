var Promise = require("bluebird");
var should = require("should");
var co = require("co");

var orm = require("..");
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
    value: type.integer(),
};

var db = orm.create(opt);
var Page = db.define("page", def);

describe('Transaction', function() {
    it('Rollback Use DB', function(done) {
        co(function*() {
            var conn2 = null;
            yield db.rebuild();
            var conn = yield db.getConnection();
            var res = yield conn.query("begin");
            var res = yield conn.query("insert into page(value) values(100)");
            var conn2 = yield db.getConnection();
            var res = yield conn2.query("select * from page");
            res.rows.length.should.eql(0);
            var res = yield conn.query("select * from page");
            res.rows.length.should.eql(1);
            var res = yield conn.query("rollback");
            var res = yield conn.query("select * from page");
            res.rows.length.should.eql(0);
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    });
    it('Rollback2 Use Conn', function(done) {
        co(function*() {
            yield db.rebuild();
            var conn = yield db.getConnection();
            yield conn.beginTransaction();
            yield conn.query("insert into page(value) values(100)");
            var conn2 = yield db.getConnection();
            var res = yield conn2.query("select * from page");
            res.rows.length.should.eql(0);
            var res = yield conn.query("select * from page");
            res.rows.length.should.eql(1);
            yield conn.rollback();
            var res = yield conn.query("select * from page");
            res.rows.length.should.eql(0);
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    })
    it('Rollback3 Use Tx', function(done) {
        co(function*() {
            yield db.rebuild();
            var tx = yield db.beginTransaction();
            yield tx.query("insert into page(value) values(100)");
            var conn2 = yield db.getConnection();
            var res = yield conn2.query("select * from page");
            res.rows.length.should.eql(0);
            var res = yield tx.query("select * from page");
            res.rows.length.should.eql(1);
            yield tx.rollback();
            var res = yield conn2.query("select * from page");
            res.rows.length.should.eql(0);
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    });
    it('Rollback4', function(done) {
        co(function*() {
            yield db.rebuild();
            var tx = yield db.beginTransaction();
            yield Page.insert({ value: 100, }, tx);
            var res = yield Page.one({ value: 100, })
            should(res).eql(undefined);
            var res = yield Page.select(tx);
            res[0].value.should.eql(100);
            yield tx.rollback();
            var res = yield Page.select();
            res.length.should.eql(0);
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    });
})

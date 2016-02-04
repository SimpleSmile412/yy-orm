var Promise = require("bluebird");
var should = require("should");

var orm = require("../..");
var type = orm.type;
var cond = orm.cond;

var logger = orm.logger;

describe('Transaction', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        v: type.integer(),
    })
    var conn = null;
    var conn2 = null;
    it('Rollback', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return db.getConnection();
        }).then(function(res) {
            conn = res;
            return conn.query("begin");
        }).then(function(res) {
            return conn.query("insert into page(v) values(100)");
        }).then(function(res) {
            return db.getConnection();
        }).then(function(res) {
            conn2 = res;
            return conn2.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(0);
            return conn.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(1);
        }).then(function(res) {
            return conn.query("rollback");
        }).then(function(res) {
            return conn.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(0);
        }).done(function() {
            done();
        });
    });
});
describe('Transaction', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        v: type.integer(),
    })
    var conn = null;
    var conn2 = null;
    it('Rollback2', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return db.getConnection();
        }).then(function(res) {
            conn = res;
            return conn.beginTransaction();
        }).then(function(res) {
            return conn.query("insert into page(v) values(100)");
        }).then(function(res) {
            return db.getConnection();
        }).then(function(res) {
            conn2 = res;
            return conn2.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(0);
            return conn.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(1);
        }).then(function(res) {
            return conn.rollback();
        }).then(function(res) {
            return conn.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(0);
        }).done(function() {
            done();
        });
    });
});
describe('Transaction', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        v: type.integer(),
    })
    var tx = null;
    var conn2 = null;
    it('Rollback3', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return db.beginTransaction();
        }).then(function(res) {
            tx = res;
            return tx.query("insert into page(v) values(100)");
        }).then(function(res) {
            return db.getConnection();
        }).then(function(res) {
            conn2 = res;
            return conn2.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(0);
            return tx.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(1);
        }).then(function(res) {
            return tx.rollback();
        }).then(function(res) {
            return conn2.query("select * from page");
        }).then(function(res) {
            res.rows.length.should.eql(0);
        }).done(function() {
            done();
        });
    });
});
describe('Transaction', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        v: type.integer(),
    })
    var tx = null;
    var conn2 = null;
    it('Rollback4', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return db.beginTransaction();
        }).then(function(res) {
            tx = res;
            return tx.insert(Page, {
                v: 100,
            })
        }).then(function(res) {
            return Page.one({
                v: 100,
            })
        }).then(function(res) {
            should(res).eql(undefined);
            return tx.select(Page);
        }).then(function(res) {
            res[0].v.should.eql(100);
            return tx.rollback();
        }).then(function(res) {
            return Page.select();
        }).then(function(res) {
            res.length.should.eql(0);
        }).done(function() {
            done();
        });
    });
});

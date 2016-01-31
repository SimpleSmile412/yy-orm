var Promise = require("bluebird");
var should = require("should");

var orm = require("../../orm");
var type = orm.type;
var cond = orm.cond;

var logger = console;

describe('Model Insert And Select', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id().on("_id"),
        v: type.varchar("hi", 32).on("_v"),
    })
    it('Insert One(ID) Select', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return Page.insert({
                v: "hello",
            })
        }).then(function(res) {
            res.id.should.eql(1);
            return Page.one({
                v: "hello",
            })
        }).then(function(res) {
            res.id.should.eql(1);
            return Page.insert({
                v: "h2"
            });
        }).then(function(res) {
            res.id.should.eql(2);
            return Page.select();
        }).then(function(res) {
            res.length.should.eql(2);
            res[1].v.should.eql("h2");
            return Page.one(1);
        }).then(function(res) {
            res.v.should.eql("hello");
        }).then(function(res) {

        }).catch(function(err) {
            logger.log(err);
            logger.log(err.stack);
            false.should.be.ok;
        }).done(function() {
            db.close();
            done();
        });
    });
});


describe('Model Insert And Update', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id().on("_id"),
        v: type.varchar("hi", 32).on("_v"),
    })
    it('Insert And Update', function(done) {
        var p = null;
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return Page.insert({
                v: "hello",
            })
        }).then(function(page) {
            p = page;
            page.v = "world";
            return Page.update(page);
        }).then(function(res) {
            return Page.one(p.id);
        }).then(function(res) {
            res.v.should.eql("world");
            return Page.delete(res);
        }).then(function(res) {
            return Page.one(p.id);
        }).then(function(res) {
            should(res).eql(undefined);
        }).done(function() {
            db.close();
            done();
        });
    });
});

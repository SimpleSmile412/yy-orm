var Promise = require("bluebird");
var should = require("should");

var orm = require("../../orm");
var type = orm.type;
var cond = orm.cond;

var logger = console;

describe('DB Transaction', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        value: type.varchar("hi", 32),
        t: type.datetime().unique(),
    })
    it('Transaction Rollback', function(done) {
        Promise.try(function() {
            return db.drop();
        }).then(function() {
            return db.sync();
        }).then(function(res) {
            return db.beginTransaction();
        }).then(function(tx) {
            return tx.create("page", {
                t: new Date(),
            }).then(function(res) {
                return tx.create("page", {
                    t: new Date(),
                });
            }).then(function(res) {
                false.should.be.ok;
                return tx.commit();
            }).catch(function(err) {
                return tx.rollback();
            })
        }).done(function() {
            db.close();
            done();
        });
    });
});

describe('DB Search', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });
    var Page = db.define("page", {
        id: type.id(),
        value: type.varchar("hi", 32),
        t: type.integer(),
    })
    it('Search', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return Page.create({
                value: "asdf",
                t: 1,
            })
        }).then(function(res) {
            return Page.create({
                value: "asdf",
                t: 2,
            })
        }).then(function(res) {
            return Page.create({
                value: "asdf",
                t: 2,
            })
        }).then(function(res) {
            return db.get("page", cond.eq("value", "asdf"));
        }).then(function(res) {
            res.value.should.eql("asdf");
            res.t.should.eql(1);
        }).then(function() {
            return db.all("page", {
                value: "asdf",
                t: 2,
            });
        }).then(function(res) {
            res.length.should.eql(2);
            return db.delete("page", {
                value: "asdf",
            })
        }).then(function(res) {
            res.affectedRows.should.eql(3);
        }).then(function(res) {

        }).catch(function(err) {
            false.should.be.ok;
            logger.error(err);
            logger.error(err.stack);
        }).done(function() {
            db.close();
            done();
        });
    });
});

describe('DB Insert Get All Update', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });
    var Page = db.define("page", {
        id: type.id(),
        value: type.varchar("hi", 32),
        t: type.integer(),
    })
    it('Search', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return db.insert("page", {
                value: "asdf",
                t: 1,
            })
        }).then(function(res) {
            return db.insert("page", {
                value: "asdf",
                t: 2,
            })
        }).then(function(res) {
            return db.get("page", cond.eq("value", "asdf"));
        }).then(function(res) {
            res.value.should.eql("asdf");
            res.t.should.eql(1);
        }).then(function() {
            return db.all("page", cond.eq("value", "asdf"));
        }).then(function(res) {
            res.length.should.eql(2);
            return db.update("page", {
                value: "ok",
            }, {
                t: 2
            });
        }).then(function(res) {
            res.changedRows.should.eql(1);
            res.affectedRows.should.eql(1);
            return db.get("page", {
                t: 2
            });
        }).then(function(res) {
            res.value.should.eql("ok");
        }).catch(function(err) {
            false.should.be.ok;
            logger.error(err);
            logger.error(err.stack);
        }).done(function() {
            db.close();
            done();
        });
    });
});

describe('DB', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("Page", {
        id: type.id(),
        v: type.varchar("hi", 32),
        i: type.integer(10),
    })
    it('Count', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            var pages = [];
            for (var i = 0; i < 2; i++) {
                pages.push({
                    i: i,
                })
            }
            return db.insert("Page", pages);
        }).then(function(res) {
            return db.count("Page");
        }).then(function(res) {
            res.should.eql(2);
        }).then(function(res) {

        }).done(function() {
            db.close().done();
            done();
        })
    })
});

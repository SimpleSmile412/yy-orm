var Promise = require("bluebird");
var should = require("should");

var orm = require("../..");
var logger = orm.logger;
var type = orm.type;
var cond = orm.cond;


describe('DB Transaction', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        v: type.varchar("hi", 32),
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
            return tx.insert("page", {
                t: new Date(),
            }).then(function(res) {
                return tx.insert("page", {
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
        v: type.varchar("hi", 32),
        t: type.integer(),
    })
    it('Search', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return Page.insert({
                v: "asdf",
                t: 1,
            })
        }).then(function(res) {
            return Page.insert({
                v: "asdf",
                t: 2,
            })
        }).then(function(res) {
            return Page.insert({
                v: "asdf",
                t: 2,
            })
        }).then(function(res) {
            return db.one("page", cond.eq("v", "asdf"));
        }).then(function(res) {
            res.v.should.eql("asdf");
            res.t.should.eql(1);
        }).then(function() {
            return db.select("page", {
                v: "asdf",
                t: 2,
            });
        }).then(function(res) {
            res.length.should.eql(2);
            return db.delete("page", {
                v: "asdf",
            })
        }).then(function(res) {
            res.affectedRows.should.eql(3);
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

describe('DB Select', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });
    var Page = db.define("page", {
        id: type.id(),
        v: type.varchar("hi", 32),
        t: type.integer(),
    })
    it('Search', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            var pages = [];
            for (var i = 0; i < 3; i++) {
                pages.push({
                    t: i,
                })
            }
            return db.insert("page", pages);
        }).then(function(res) {
            res.affectedRows.should.eql(3);
            return db.select("page");
        }).then(function(res) {
            res.length.should.eql(3);
            return db.select("page", {
                t: 2
            });
        }).then(function(res) {
            res[0].id.should.eql(3);
            return db.select("page", "id", {
                t: 1,
            });
        }).then(function(res) {
            res[0].id.should.eql(2);
            return db.beginTransaction().then(function(tx) {
                return db.select("page", cond.gt("id", 1), tx);
            }).then(function(res) {
                res.length.should.eql(2);
            }).then(function(res) {
                return tx.commit();
            })
        }).then(function(res) {
            return db.select("page", cond.desc("t").limit(10));
        }).then(function(res) {

        }).then(function(res) {

        }).then(function(res) {
            return db.close();
        }).done(function() {
            done();
        });
    });
});

// describe('DB Insert Get All Update', function() {
//     var db = orm.create({
//         host: 'localhost',
//         user: 'root',
//         password: 'root',
//         database: 'test'
//     });
//     var Page = db.define("page", {
//         id: type.id(),
//         v: type.varchar("hi", 32),
//         t: type.integer(),
//     })
//     it('Search', function(done) {
//         Promise.try(function() {
//             return db.rebuild();
//         }).then(function(res) {
//             return db.insert("page", {
//                 v: "asdf",
//                 t: 1,
//             })
//         }).then(function(res) {
//             return db.insert("page", {
//                 v: "asdf",
//                 t: 2,
//             })
//         }).then(function(res) {
//             return db.one("page", cond.eq("v", "asdf"));
//         }).then(function(res) {
//             res.v.should.eql("asdf");
//             res.t.should.eql(1);
//         }).then(function() {
//             return db.select("page", cond.eq("v", "asdf"));
//         }).then(function(res) {
//             res.length.should.eql(2);
//             return db.update("page", {
//                 v: "ok",
//             }, {
//                 t: 2
//             });
//         }).then(function(res) {
//             res.changedRows.should.eql(1);
//             res.affectedRows.should.eql(1);
//             return db.one("page", {
//                 t: 2
//             });
//         }).then(function(res) {
//             res.v.should.eql("ok");
//         }).catch(function(err) {
//             false.should.be.ok;
//             logger.error(err);
//             logger.error(err.stack);
//         }).done(function() {
//             db.close();
//             done();
//         });
//     });
// });

// describe('DB', function() {
//     var db = orm.create({
//         host: 'localhost',
//         user: 'root',
//         password: 'root',
//         database: 'test'
//     });

//     var Page = db.define("Page", {
//         id: type.id(),
//         v: type.varchar("hi", 32),
//         i: type.integer(10),
//     })
//     it('Count', function(done) {
//         Promise.try(function() {
//             return db.rebuild();
//         }).then(function(res) {
//             var pages = [];
//             for (var i = 0; i < 2; i++) {
//                 pages.push({
//                     i: i,
//                 })
//             }
//             return db.insert("Page", pages);
//         }).then(function(res) {
//             return db.count("Page");
//         }).then(function(res) {
//             res.should.eql(2);
//         }).then(function(res) {

//         }).done(function() {
//             db.close().done();
//             done();
//         })
//     })
// });

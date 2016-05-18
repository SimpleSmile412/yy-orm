var Promise = require("bluebird");
var should = require("should");
var co = require("co");
var _ = require("lodash");

var orm = require("..");
var logger = orm.logger;
var type = orm.type;
var cond = orm.cond;

function fail() {
    should(false).eql(true);
}

var opt = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
}

var def = {
    id: type.id(),
    value: type.varchar("hi", 32),
    time: type.datetime().unique(),
}
var db = orm.create(opt);
var Page = db.define("page", def);

describe('DB', function() {
    it('query', function(done) {
        co(function*() {
            yield db.rebuild();
            yield db.query("insert into page set ?", { value: "1", time: new Date() });
            var res = yield db.select("page");
            res[0].id.should.eql(1);
            res[0].value.should.eql('1');
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })
    it('insert', function(done) {
        co(function*() {
            yield db.rebuild();
            yield db.insert("page", { value: "1", time: new Date() });
            var res = yield db.select("page");
            res[0].id.should.eql(1);
            res[0].value.should.eql('1');
            var values = _.range(2).map(function(item) {
                return { value: item, time: new Date(2015, 1, 1 + item) }
            });
            yield db.insert("page", values);
            var res = yield db.select("page");
            res.length.should.eql(3);
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })
    it('update', function(done) {
        co(function*() {
            yield db.rebuild();
            yield db.insert("page", { value: "1", time: new Date() });
            var res = yield db.select("page");
            res[0].value = "2";
            yield db.update("page", res[0]);
            var res = yield db.select("page");
            res[0].value.should.eql("2");
            res[0].value = "3";
            yield db.update("page", res[0], { id: res[0].id });
            var res = yield db.select("page");
            res[0].value.should.eql("3");
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })


    // it('Transaction Rollback', function(done) {
    //     Promise.try(function() {
    //         return db.drop();
    //     }).then(function() {
    //         return db.sync();
    //     }).then(function(res) {
    //         return db.beginTransaction();
    //     }).then(function(tx) {
    //         return tx.insert("page", {
    //             time: new Date(),
    //         }).then(function(res) {
    //             return tx.insert("page", {
    //                 time: new Date(),
    //             });
    //         }).then(function(res) {
    //             fail();
    //             return tx.commit();
    //         }).catch(function(err) {
    //             return tx.rollback();
    //         })
    //     }).done(function() {
    //         db.close();
    //         done();
    //     });
    // });
});


// describe('DB Search', function() {
//     var db = orm.create(opt);
//     var Page = db.define("page", def)
//     it('Search', function(done) {
//         Promise.try(function() {
//             return db.rebuild();
//         }).then(function(res) {
//             return Page.insert({
//                 value: "asdf",
//                 time: 1,
//             })
//         }).then(function(res) {
//             return Page.insert({
//                 value: "asdf",
//                 time: 2,
//             })
//         }).then(function(res) {
//             return Page.insert({
//                 value: "asdf",
//                 time: 2,
//             })
//         }).then(function(res) {
//             return db.one("page", cond.eq("value", "asdf"));
//         }).then(function(res) {
//             res.value.should.eql("asdf");
//             res.time.should.eql(1);
//         }).then(function() {
//             return db.select("page", {
//                 value: "asdf",
//                 time: 2,
//             });
//         }).then(function(res) {
//             res.length.should.eql(2);
//             return db.delete("page", {
//                 value: "asdf",
//             })
//         }).then(function(res) {
//             res.affectedRows.should.eql(3);
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


// describe('DB Select', function() {
//     var db = orm.create({
//         host: 'localhost',
//         user: 'root',
//         password: 'root',
//         database: 'test'
//     });
//     var Page = db.define("page", {
//         id: type.id(),
//         value: type.varchar("hi", 32),
//         time: type.integer(),
//     })
//     it('Search', function(done) {
//         Promise.try(function() {
//             return db.rebuild();
//         }).then(function(res) {
//             var pages = [];
//             for (var i = 0; i < 3; i++) {
//                 pages.push({
//                     time: i,
//                 })
//             }
//             return db.insert("page", pages);
//         }).then(function(res) {
//             res.affectedRows.should.eql(3);
//             return db.select("page");
//         }).then(function(res) {
//             res.length.should.eql(3);
//             return db.select("page", {
//                 time: 2
//             });
//         }).then(function(res) {
//             res[0].id.should.eql(3);
//             return db.select("page", "id", {
//                 time: 1,
//             });
//         }).then(function(res) {
//             res[0].id.should.eql(2);
//             return db.beginTransaction().then(function(tx) {
//                 return db.select("page", cond.gt("id", 1), tx);
//             }).then(function(res) {
//                 res.length.should.eql(2);
//             }).then(function(res) {
//                 return tx.commit();
//             })
//         }).then(function(res) {
//             return db.select("page", cond.desc("time").limit(10));
//         }).then(function(res) {

//         }).then(function(res) {

//         }).then(function(res) {
//             return db.close();
//         }).done(function() {
//             done();
//         });
//     });
// });

// describe('DB Insert Get All Update', function() {
//     var db = orm.create({
//         host: 'localhost',
//         user: 'root',
//         password: 'root',
//         database: 'test'
//     });
//     var Page = db.define("page", {
//         id: type.id(),
//         value: type.varchar("hi", 32),
//         time: type.integer(),
//     })
//     it('Search', function(done) {
//         Promise.try(function() {
//             return db.rebuild();
//         }).then(function(res) {
//             return db.insert("page", {
//                 value: "asdf",
//                 time: 1,
//             })
//         }).then(function(res) {
//             return db.insert("page", {
//                 value: "asdf",
//                 time: 2,
//             })
//         }).then(function(res) {
//             return db.one("page", cond.eq("value", "asdf"));
//         }).then(function(res) {
//             res.value.should.eql("asdf");
//             res.time.should.eql(1);
//         }).then(function() {
//             return db.select("page", cond.eq("value", "asdf"));
//         }).then(function(res) {
//             res.length.should.eql(2);
//             return db.update("page", {
//                 value: "ok",
//             }, {
//                 time: 2
//             });
//         }).then(function(res) {
//             res.changedRows.should.eql(1);
//             res.affectedRows.should.eql(1);
//             return db.one("page", {
//                 time: 2
//             });
//         }).then(function(res) {
//             res.value.should.eql("ok");
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
//         value: type.varchar("hi", 32),
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

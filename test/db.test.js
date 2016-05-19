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
    it('select', function(done) {
        co(function*() {
            yield db.rebuild();
            var values = _.range(10).map(function(item) {
                return { value: "" + item, time: new Date(2015, 1, 1 + item) }
            })
            var res = yield db.insert("page", values);
            var res = yield db.select("page", ["value", "time"], cond.between("value", 2, 5));
            res.length.should.eql(4);
            res[0].value.should.eql("2");
            res[0].time.should.eql(values[2].time);
            should(res[0].id).eql(undefined);
            var res = yield db.one("page", values[8]);
            delete res.id;
            res.should.eql(values[8]);
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })
    it('delete', function(done) {
        co(function*() {
            yield db.rebuild();
            var res = yield db.insert("page", { value: "1", time: new Date() });
            yield db.delete("page", { id: res.insertId });
            var res = yield db.select("page");
            res.length.should.eql(0);
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })
    it('count', function(done) {
        co(function*() {
            yield db.rebuild();
            var values = _.range(10).map(function(item) {
                return { value: "" + item, time: new Date(2015, 1, 1 + item) }
            })
            var res = yield db.insert("page", values);
            var count = yield db.count("page");
            count.should.eql(10);
            var count = yield db.count("page", cond.gt("id", 3));
            count.should.eql(7);
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })
    it('Transaction Rollback', function(done) {
        var tx = null;
        co(function*() {
            yield db.rebuild();
            tx = yield db.beginTransaction();
            var value = { value: "1", time: new Date() };
            yield db.insert("page", value, tx);
            yield db.insert("page", value, tx);
            yield tx.commit();
        }).catch(function(err) {
            // console.log(err);
            tx.rollback();
            done();
        })
    })
    it('Transaction CURD', function(done) {
        co(function*() {
            yield db.rebuild();
            var tx = yield db.beginTransaction();
            var value = { value: "1", time: new Date() };
            var res = yield db.insert("page", value, tx);
            value.value = "2";
            yield db.update("page", value, { id: res.insertId }, tx);
            var count = yield db.count("page");
            count.should.eql(0);
            var count = yield db.count("page", tx);
            count.should.eql(1);
            var res = yield db.one("page", tx);
            yield db.delete("page", { id: res.id }, tx);
            var res = yield db.select("page", tx);
            res.length.should.eql(0);
            yield tx.commit();
            done();
        }).catch(function(err) {
            console.log(err);
        })
    })
});


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
}
var def = {
    id: type.id().on("_id"),
    value: type.varchar("hi", 32).on("_value"),
};

var db = orm.create(opt);
var Page = db.define("page", def)

describe('ModelObject', function() {
    it('Update/Delete', function(done) {
        co(function*() {
            yield db.rebuild();
            var page = yield Page.insert({ value: "hello", });
            var row = yield db.one("page", { _value: "hello" });
            row.should.eql({ _id: page.id, _value: page.value, });
            page.value = "world";
            yield page.update();
            var page2 = yield Page.one({ id: page.id });
            page2.should.eql(page);
            yield page2.delete();
            var page3 = yield Page.one({ id: page.id });
            should(page3).eql(undefined);
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    });
    it('Sync', function(done) {
        co(function*() {
            yield db.rebuild();
            var page = yield Page.insert({ value: "hello", });
            var res = yield Page.select();
            res[0].should.eql(page);
            res[0].value = "world";
            yield res[0].update();
            yield page.sync();
            yield res[0].delete();
            yield page.sync();
            page.value.should.eql("world");
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    });
    it('Bigint', function(done) {
        co(function*() {
            var def = {
                id: type.bigint().auto().pkey(),
                name: type.varchar(),
            }
            var User = db.define("user", def);
            yield db.rebuild();
            var ret0 = yield User.insert({});
            var ret1 = yield User.insert({});
            var res = yield User.select();
            Number(res[0].id).should.eql(1);
            Number(res[1].id).should.eql(2);
            ret0.name = "name";
            yield ret0.update();
            yield res[0].sync();
            res[0].value.should.eql("value");
            done();
        }).catch(function(err) {
            console.log(err.stack);
        });
    });
});

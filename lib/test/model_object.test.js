var Promise = require("bluebird");
var should = require("should");

var orm = require("../..");
var ModelObject = require("../model_object");
var type = orm.type;
var cond = orm.cond;

var logger = console;

describe('ModelObject', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id().on("_id"),
        value: type.varchar("hi", 32).on("_value"),
    })
    it('Trans To/From Row', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return Page.insert({
                value: "hello",
            });
        }).then(function(res) {
            var page = res;
            var row = {
                _id: page.id,
                _value: page.value,
            }
            var p2 = page.toRow();
            p2.should.eql({
                _id: 1,
                _value: 'hello'
            });
        }).then(function(res) {

        }).then(function(res) {

        }).done(function() {
            db.close();
            done();
        });
    });
});

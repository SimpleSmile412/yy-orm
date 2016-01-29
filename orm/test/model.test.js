var Promise = require("bluebird");
var should = require("should");

var orm = require("../../orm");
var type = orm.type;
var cond = orm.cond;

var logger = console;



describe('Model Insert And Get', function() {
    var db = orm.create({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'test'
    });

    var Page = db.define("page", {
        id: type.id(),
        value: type.varchar("hi", 32),
    })
    it('Transaction Rollback', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return Page.insert({
                value: "hello",
            })
        }).then(function(res) {
            res.id.should.eql(1);
            return Page.get({
                value: "hello",
            })
        }).then(function(res) {
            res.id.should.eql(1);
            return Page.insert({});
        }).then(function(res) {
            res.id.should.eql(2);
            return Page.all();
        }).then(function(res) {
            res.length.should.eql(2);
            res[1].value.should.eql("hi");
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

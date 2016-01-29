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
    it('Insert Get All Get(ID)', function(done) {
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
            return Page.insert({
                value: "h2"
            });
        }).then(function(res) {
            res.id.should.eql(2);
            return Page.all();
        }).then(function(res) {
            res.length.should.eql(2);
            res[1].value.should.eql("h2");
            return Page.get(1);
        }).then(function(res) {
            res.value.should.eql("hello");
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

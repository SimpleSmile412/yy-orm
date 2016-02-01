var Promise = require("bluebird");
var should = require("should");

var orm = require("../..");
var type = orm.type;
var cond = orm.cond;

var logger = console;

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
    it('CURD', function(done) {
        Promise.try(function() {
            return db.rebuild();
        }).then(function(res) {
            return db.beginTransaction();
        }).then(function(res) {
            tx = res;
            return tx.insert(Page, {
                v: 1
            });
        }).then(function(res) {
            res.id.should.eql(1);
            // return tx.update(Page, {
            //     id: 1
            // }, {
            //     v: 2
            // });
        }).then(function(res) {
            
        }).then(function(res) {

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

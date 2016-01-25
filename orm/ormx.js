var common = require("../../yy-common");
var util = require("util");
var orm = require("orm");
var type = require("./type");

var Exception = common.Exception;
var kit = common.kit;
var logger = common.logger;
var fx = common.fx;

function deferize_object(obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            obj[i] = fx.deferize(obj[i]);
        }
    }
}

function ormx() {
    deferize_object(orm);
    orm.connect = fx.decorate(orm.connect, function(opts, $orig) {
        return $orig(opts).then(function(db) {
            deferize_object(db.constructor.prototype);
            db.define = fx.decorate(db.define, function(name, properties, opts, $orig) {
                var model = $orig(name, properties, opts);
                deferize_object(model.constructor.prototype);
                return model;
            });
            return db;
        });
    });
    return orm;
}

module.exports = ormx;

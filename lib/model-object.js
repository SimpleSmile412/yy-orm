var logger = require("yy-logger");
var _ = require("lodash");
var assert = require("assert");

module.exports = ModelObject;

function ModelObject(obj, model) {
    assert(model);
    _.mergeWith(this, obj, model.meta.defaultValue, (obj, src) => obj !== undefined ? obj : src);
    model.meta.transBigint(this);
    Object.defineProperty(this, "$model", {
        enumerable: false,
        writable: false,
        configurable: false,
        value: model
    });
}

ModelObject.prototype.update = function(tx) {
    return this.$model.update(this, tx);
}

ModelObject.prototype.sync = function(tx) {
    return this.$model.sync(this, tx);
}

ModelObject.prototype.delete = function(tx) {
    return this.$model.delete(this, tx);
}

ModelObject.prototype.stringify = function() {
    return this.$model.stringify(this);
}

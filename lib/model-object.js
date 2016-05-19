var logger = require("yy-logger");
var _ = require("lodash");
var assert = require("assert");

module.exports = ModelObject;

function ModelObject(obj, model) {
    assert(model);
    _.merge(this, obj);
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

ModelObject.prototype.delete = function(obj, tx) {
    return this.$model.delete(this, tx);
}

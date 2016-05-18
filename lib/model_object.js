var logger = require("yy-logger");

module.exports = ModelObject;

function ModelObject(model) {
    if (arguments.length === 2) {
        var obj = arguments[1];
        obj.__proto__ = new ModelObject(model);
        return obj;
    } else {
        this.$model = model;
    }
}

ModelObject.fromRow = function(model, row) {
    if (!row) {
        return undefined;
    }
    var fields = model.fields;
    var ret = {};
    for (var field in fields) {
        if (row[fields[field]._col] !== undefined) {
            ret[field] = row[fields[field]._col];
        }
    }
    return new ModelObject(model, ret);
}

ModelObject.prototype.toRow = function() {
    var model = this.$model;
    var fields = model.fields;
    var ret = {};
    for (var field in fields) {
        if (this[field] !== undefined) {
            ret[fields[field]._col] = this[field];
        }
    }
    return ret;
}
ModelObject.prototype.schemaKey = function() {
    return this.$model.key._col;
}
ModelObject.prototype.modelKey = function() {
    return this.$model.key._field;
}
ModelObject.prototype.keyVal = function() {
    return this[this.$model.key._field];
}

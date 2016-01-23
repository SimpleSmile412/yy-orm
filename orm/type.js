// text: A text string;
// number: A floating point number. You can specify size: 2|4|8.
// integer: An integer. You can specify size: 2|4|8.
// boolean: A true/false value;
// date: A date object. You can specify time: true
// enum: A value from a list of possible values;
// object: A JSON object;
// point: A N-dimensional point (not generally supported);
// binary: Binary data.
// serial: Auto-incrementing integer. Used for primary keys.

var type = {};

type.string = function(size, def_val) {
    size = size || 128;
    return new DefinitionType("text", def_val, size);
}
type.number = function(def_val) {
    return new DefinitionType("number", def_val, 8);
}
type.integer = function(def_val) {
    return new DefinitionType("integer", def_val, 4);
}
type.boolean = function(def_val) {
    return new DefinitionType("boolean", def_val);
}
type.date = function(def_val) {
    return new DefinitionType("date", def_val).time(false);
}
type.datetime = function(def_val) {
    return new DefinitionType("date", def_val).time(true);
}
type.enum = function(arr, def_val) {
    return new DefinitionType("enum", def_val).enum(arr);
}
type.object = function(def_val) {
    return new DefinitionType("object", def_val);
}
type.point = function(def_val) {
    return new DefinitionType("point", def_val);
}
type.binary = function(def_val) {
    return new DefinitionType("binary", def_val);
}
type.serial = function() {
    return new DefinitionType("serial");
}

module.exports = type;

function DefinitionType(type, def_val, size) {
    this.type = type;
    def_val && (this.defaultValue = def_val);
    size && (this.size = size);
}

DefinitionType.prototype.key = function() {
    this.key = true;
    return this;
}

DefinitionType.prototype.unique = function() {
    this.unique = true;
    return this;
}

DefinitionType.prototype.on = function(col) {
    this.mapTo = col;
    return this;
}

DefinitionType.prototype.time = function(b) {
    if (this.type === "date") {
        this.time = b;
    }
    return this;
}

DefinitionType.prototype.enum = function(arr) {
    if (this.type === "enum") {
        this.values = arr;
    }
    return this;
}

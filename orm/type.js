// Sequelize.STRING // VARCHAR(255)
// Sequelize.STRING(1234)                // VARCHAR(1234)
// Sequelize.STRING.BINARY               // VARCHAR BINARY
// Sequelize.TEXT                        // TEXT

// Sequelize.INTEGER                     // INTEGER
// Sequelize.BIGINT                      // BIGINT
// Sequelize.BIGINT(11)                  // BIGINT(11)

// Sequelize.FLOAT                       // FLOAT
// Sequelize.FLOAT(11)                   // FLOAT(11)
// Sequelize.FLOAT(11, 12)               // FLOAT(11,12)

// Sequelize.REAL                        // REAL        PostgreSQL only.
// Sequelize.REAL(11)                    // REAL(11)    PostgreSQL only.
// Sequelize.REAL(11, 12)                // REAL(11,12) PostgreSQL only.

// Sequelize.DOUBLE                      // DOUBLE
// Sequelize.DOUBLE(11)                  // DOUBLE(11)
// Sequelize.DOUBLE(11, 12)              // DOUBLE(11,12)

// Sequelize.DECIMAL                     // DECIMAL
// Sequelize.DECIMAL(10, 2)              // DECIMAL(10,2)

// Sequelize.DATE                        // DATETIME for mysql / sqlite, TIMESTAMP WITH TIME ZONE for postgres
// Sequelize.BOOLEAN                     // TINYINT(1)

// Sequelize.ENUM('value 1', 'value 2')  // An ENUM with allowed values 'value 1' and 'value 2'
// Sequelize.ARRAY(Sequelize.TEXT)       // Defines an array. PostgreSQL only.

// Sequelize.JSON                        // JSON column. PostgreSQL only.
// Sequelize.JSONB                       // JSONB column. PostgreSQL only.

// Sequelize.BLOB                        // BLOB (bytea for PostgreSQL)
// Sequelize.BLOB('tiny')                // TINYBLOB (bytea for PostgreSQL. Other options are medium and long)

// Sequelize.UUID                        // UUID datatype for PostgreSQL and SQLite, CHAR(36) BINARY for MySQL (use defaultValue: Sequelize.UUIDV1 or Sequelize.UUIDV4 to make sequelize generate the ids automatically)

// Sequelize.RANGE(Sequelize.INTEGER)    // Defines int4range range. PostgreSQL only.
// Sequelize.RANGE(Sequelize.BIGINT)     // Defined int8range range. PostgreSQL only.
// Sequelize.RANGE(Sequelize.DATE)       // Defines tstzrange range. PostgreSQL only.
// Sequelize.RANGE(Sequelize.DATEONLY)   // Defines daterange range. PostgreSQL only.
// Sequelize.RANGE(Sequelize.DECIMAL)    // Defines numrange range. PostgreSQL only.

// Sequelize.ARRAY(Sequelize.RANGE(Sequelize.DATE)) // Defines array of tstzrange ranges. PostgreSQL only.

var Sequelize = require("sequelize");
var type = {};

type.string = function(size, defVal) {
    size = size || 128;
    return definitionType(Sequelize.STRING, defVal).size(size);
}
type.double = function(defVal) {
    return definitionType(Sequelize.DOUBLE, defVal);
}
type.integer = function(defVal) {
    return definitionType(Sequelize.INTEGER, defVal);
}
type.boolean = function(defVal) {
    return definitionType(Sequelize.BOOLEAN, defVal);
}
type.datetime = function(defVal) {
    return definitionType(Sequelize.DATE, defVal);
}
type.enum = function(arr, defVal) {
    return definitionType(Sequelize.ENUM, defVal).enum(arr);
}
type.binary = function(defVal) {
    return definitionType(Sequelize.STRING.BINARY, defVal);
}
type.id = function() {
    return definitionType(Sequelize.INTEGER).key().auto();
}
module.exports = type;

// var funcs = [
//     "size", "default", "auto", "key", "unique", "required", "enum", "on"
// ]

function definitionType(type, defVal) {
    // var ret = Object.create(typeProto);
    var ret = {};
    ret.type = type;
    defVal && (ret.defaultValue = defVal);
    for (var func in typeProto) {
        Object.defineProperty(ret, func, {
            value: typeProto[func]
        })
    }
    return ret;
}

var typeProto = {};

typeProto.size = function(size) {
    if (this.type === Sequelize.STRING) {
        this.type = Sequelize.STRING(size);
    }
    return this;
}
typeProto.default = function(val) {
    this.defaultValue = val;
    return this;
}
typeProto.auto = function() {
    this.autoIncrement = true;
    return this;
}
typeProto.key = function() {
    this.primaryKey = true;
    return this;
}
typeProto.unique = function() {
    this.unique = true;
    return this;
}
typeProto.required = function() {
    this.allowNull = false;
    return this;
}
typeProto.enum = function(arr) {
    if (this.type === Sequelize.ENUM) {
        this.values = arr;
    }
    return this;
}
typeProto.on = function(col) {
    this.field = col;
    return this;
}

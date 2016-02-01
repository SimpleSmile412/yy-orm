var common = require("../../yy-common");
var mysql = require("mysql");

function normalize(value) {
	return mysql.escape(value);
    // if (value instanceof Date) {
    //     return "'" + value.$format() + "'";
    // } else if (typeof value === "string") {
    //     return "'" + value + "'";
    // } else {
    //     return value;
    // }
}

var kit = {
    normalize: normalize,
}

module.exports = kit;

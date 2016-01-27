var common = require("../../yy-common");

function normalize(value) {
    if (value instanceof Date) {
        return "'" + value.$format() + "'";
    } else if (typeof value === "string") {
        return "'" + value + "'";
    } else {
        return value;
    }
}

var kit = {
    normalize: normalize,
}

module.exports = kit;

var common = require("../../yy-common");


function normalize(value) {
    if (typeof value === "string") {
        return "'" + value + "'";
    } else {
        return value;
    }
}

var kit = {
    normalize: normalize,
}

module.exports = kit;

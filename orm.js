var common = require("../yy-common");

var type = require("./orm/type");
var DB = require("./orm/db");

function ORM() {
    this.create = function(opt) {
        return new DB(opt);
    }
    this.type = type;
}

var orm = new ORM();
module.exports = orm;

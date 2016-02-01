var common = require("../yy-common");

var type = require("./lib/type");
var cond = require("./lib/cond");
var DB = require("./lib/db");

function ORM() {
    this.create = function(opt) {
        return new DB(opt);
    }
    this.type = type;
    this.cond = cond;
    this.logger = common.logger;
}

var orm = new ORM();
module.exports = orm;

var type = require("./lib/type");
var cond = require("./lib/cond");
var DB = require("./lib/db");
var mysql = require("mysql");

function ORM() {
    this.create = function(opt) {
        return new DB(opt);
    }
    this.type = type;
    this.cond = cond;
    this.format = mysql.format;
}

var orm = new ORM();
module.exports = orm;

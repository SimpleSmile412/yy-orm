var common = require("../../yy-common");
var Sequelize = require("sequelize");
var fx = common.fx;


Sequelize.prototype.define = fx.overload(Sequelize.prototype.define, function(modelName, attributes) {
    var options = {
        timestamps: false,
        freezeTableName: true,
    };
    return Sequelize.prototype.define.call(this, modelName, attributes, options);
});
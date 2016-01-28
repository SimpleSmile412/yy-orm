var common = require("../../yy-common");
var logger = common.logger;
var Promise = require("bluebird");

function Connection(conn) {
    this.conn = conn;
}
module.exports = Connection;

Connection.$proto("query", function(query, values) {
    var info = values ? query + " " + JSON.stringify(values) : query;
    logger.log(info);
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.query(query, values, function(err, rows, fields) {
            if (err) {
                reject(err);
            } else {
                resolve({
                    rows: rows,
                    fields: fields,
                });
            }
        });
    });
});

Connection.$proto("beginTransaction", function() {
    logger.log("START TRANSACTION");
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.beginTransaction(function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

Connection.$proto("commit", function() {
    logger.log("COMMIT");
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.commit(function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
});

Connection.$proto("rollback", function() {
    logger.log("ROLLBACK");
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.rollback(function() {
            resolve();
        });
    });
});

Connection.$proto("release", function(query) {
    return this.conn.release();
});

// Connection.$proto("connect", function() {
//     var that = this;
//     if (this.conn.state !== "disconnected") {
//         return Promise.resolve(conn);
//     }
//     return new Promise(function(resolve, reject) {
//         that.conn.connect(function(err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(that);
//             }
//         });
//     });
// })

// Connection.$proto("close", function() {
//     if (this.conn.state === "disconnected") {
//         return Promise.resolve();
//     }
//     var that = this;
//     return new Promise(function(resolve, reject) {
//         that.conn.end(function(err) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve();
//             }
//         });
//     });
// })

// Connection.$proto("destroy", function() {
//     if (this.conn.state !== "disconnected") {
//         this.conn.destroy();
//     }
//     return Promise.resolve();
// })

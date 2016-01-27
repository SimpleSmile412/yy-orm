var common = require("../../yy-common");
var Promise = require("bluebird");

function Connection(conn) {
    this.conn = conn;
}
module.exports = Connection;

Connection.$proto("query", function(query) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.conn.query(query, function(err, rows, fields) {
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

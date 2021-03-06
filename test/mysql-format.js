var mysql = require("mysql");
var BigNumber = require('yy-big').Number;
var JSONB = require("yy-big").JSON;

//?
console.log("Single ?");
console.log("1 			=> " + mysql.format("?", 1));
console.log("'string' 		=> " + mysql.format("?", "string"));
console.log("new Date() 		=> " + mysql.format("?", new Date()));
console.log("{a:1,b:'2'} 		=> " + mysql.format("?", { a: 1, b: '2' }));
console.log("[1,2,3] 		=> " + mysql.format("?", [
    [1, 2, 3]
]));
console.log("['a','b','c'] 		=> " + mysql.format("?", [
    ['a', 'b', 'c']
]));
console.log("[['a',1],['b',2]]	=> " + mysql.format("?", [
    [
        ['a', 1],
        ['b', 2]
    ]
]));


//??
console.log("Double ??");
// console.log("1 			=> " + mysql.format("??", 1));
console.log("'string' 		=> " + mysql.format("??", "string"));
// console.log("new Date() 		=> " + mysql.format("??", new Date()));
// console.log("{a:'a'}			=> " + mysql.format("??", [{ a: 'a' }]));
console.log("['a','b','c'] 		=> " + mysql.format("??", [
    ['a', 'b', 'c']
]));
// console.log("[new Date(),new Date()]	=> " + mysql.format("??", [
//     [new Date(), new Date()]
// ]));

//JSONB
console.log(JSONB.stringify({ bigint: new BigNumber(2).pow(64) }));

//Bigint
console.log("[1,2,2^64,2^64]		=> " + mysql.format("?", [
    [1, 2, Math.pow(2, 64), new BigNumber(2).pow(64)]
]));
console.log(mysql.format("?? = ?", ["value", [new BigNumber(2)]]));

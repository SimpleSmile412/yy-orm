var mysql = require("mysql");

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

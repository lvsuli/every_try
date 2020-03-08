function A () {}
var a = new A();
console.log("---------------------------------------------");
console.log("A.prototype:", A.prototype);
console.log("a.__proto__:", a.__proto__);
console.log("a.constructor:", a.constructor);
console.log(A.prototype === a.__proto__);

function B () {}
var b = new B();
console.log("B.prototype:", B.prototype);
console.log("b.__proto__:", b.__proto__);
console.log("b.constructor:", b.constructor);
console.log(B.prototype === b.__proto__);

B.prototype = a;
console.log("B.prototype:", B.prototype);
console.log("b.__proto__:", b.__proto__);
console.log("b.constructor:", b.constructor);
console.log(B.prototype === b.__proto__);

var bb = new B();
console.log("B.prototype:", B.prototype);
console.log("bb.__proto__:", bb.__proto__);
console.log("bb.constructor:", bb.constructor);
console.log(B.prototype === bb.__proto__);

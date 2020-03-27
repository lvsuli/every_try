console.log("---------------------------------------");

function sum (n) {
    if (n === 1) {
        return n;
    } else {
        return (n + sum(n - 1));
    }
}
console.time("递归求和");
console.log(sum(1));
console.log(sum(2));
console.log(sum(3));
console.log(sum(100));
console.timeEnd("递归求和");

function sum2 (n) {
    var result = 0;
    for (let i = 1; i <= n; i++) {
        result += i;
    }
    return result;
}
console.time("循环求和");
console.log(sum2(1));
console.log(sum2(2));
console.log(sum2(3));
console.log(sum2(100));
console.timeEnd("循环求和");

function factorial (n) {
    if (n === 1) {
        return n;
    } else {
        return (n * factorial(n - 1));
    }
}
console.time("递归阶乘");
console.log(factorial(1));
console.log(factorial(2));
console.log(factorial(3));
console.log(factorial(100));
console.timeEnd("递归阶乘");

function factorial2 (n) {
    var result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}
console.time("循环阶乘");
console.log(factorial2(1));
console.log(factorial2(2));
console.log(factorial2(3));
console.log(factorial2(100));
console.timeEnd("循环阶乘");

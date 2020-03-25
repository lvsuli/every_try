//! fasfafa
// :fasfafaf
// todo:fafafafaf

// Number.prototype.formatNum = function () {
//   var arr = [...this.toString()];
//   for (let i = 0; i < arr.length % 3; i++)
//     arr.unshift('0');
//   console.log(arr);
//   var result = '';
//   arr.forEach((value, index) => {
//     if ((index + 1) % 3)
//       result += value;
//     else
//       result += value + ',';
//   })
//   console.log(result.substr([...this.toString()].length % 3));
// }
// money = 347843632;
// money.formatNum();

// var a1 = [{
//     1: 1,
//     2: 2
//   }, {
//     2: 2,
//     3: 3
//   }],
//   a2 = [3, 4],
//   a3 = a1.concat(a2);
// a4 = [...a1, ...a2]

// a1.pop();
// console.table(a1);
// a2.pop();
// console.table(a2);
// console.table(a3);
// console.table(a4);

// 当初我的脑袋是吞粪了吗... 为什么要用__proto__
Number.prototype.formatNum = function () {
    const str = this.toString();
    const reg = /(?=(\B)(\d{3})+$)/g;
    return str.replace(reg, ",");
};

var num = 1234567;
console.log(num.formatNum());

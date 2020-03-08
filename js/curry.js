Function.prototype.value = 0;

function f (n) {
  f.value += Math.pow(n, 2);
  return f;
}
console.log(f(1)(2)(3)(4).value);

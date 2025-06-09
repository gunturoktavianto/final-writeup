window.eval = new Proxy(eval, {
  apply(target, thisArg, ...args) {
    return [
      Reflect.apply(...arguments),
      //console.log(...args)
    ][0];
  },
});

window.gunturNotes = {};
window.gunturTracking = {};

function hackyTracking(vars) {
  for (var key in vars) {
    if (!gunturTracking[key]) {
      gunturTracking[key] = [];
    }
    let arr = gunturTracking[key];
    let obj = vars[key];

    if (!arr.includes(obj)) {
      arr.push(obj);
    }
  }
}

function pullUnicodeVar(func, index) {
  let idents = func
    .toString()
    .split("")
    .map((x) => x.charCodeAt(0))
    .filter((n) => n >= 128);
  return idents[0];
}

function hackyBreakpoint(func) {
  return func();
}

function func2str(func) {
  return func
    .toString()
    .split("")
    .map((x) => x.charCodeAt(0))
    .map((n) => (n < 128 ? String.fromCharCode(n) : `\\u{${n.toString(16)}}`))
    .join("");
}

function trace_if(condition, ...args) {
  if (condition) {
    console.trace(...args);
  }
}

function trace_passthru(name, single, ...rest) {
  console.trace(name, single, ...rest);
  return single;
}

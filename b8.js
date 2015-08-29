"use strict";
// last touched: 4-2-2015

// html helpers
function elt(t, a) {
  var el = document.createElement(t);
  if (a) {
    for (var attr in a)
      if (a.hasOwnProperty(attr))
        el.setAttribute(attr, a[attr]);
  }
  for (var i = 2; i < arguments.length; ++i) {
    var arg = arguments[i];
    if (typeof arg === "string")
      arg = document.createTextNode(arg);
    el.appendChild(arg);
  }
  return el;
}
// produces an img element from the given canvas
function img(c) { return elt("img", {width:c.width, height:c.height, src:c.toDataURL()}); }
function pixelCanvas(a) {
  var res = elt("canvas", a), ctx = res.getContext("2d");
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  return res;
};

// create a CSS rule string
function css(q, r) {
  var res = [q, "{"];
  for (var key in r)
    res.push(key, ":", r[key], ";");
  res.push("}");
  return res.join("");
}

// css string helpers
function deg(d) { return d + "deg"; }
function px(n) { return n + "px"; }
function per(n) { return n + "%"; }
function rgb(r,g,b) { return ["rgb(", r, ",", g, ",", b, ")"].join(""); }
function rotate(d) { return ["rotate(", d, ")"].join(""); }
function hide(e) { return e.style.display = "none"; }
function show(e) { return e.style.display = ""; }
function flip(e, f) {
  e.style["-webkit-transform"] = (f)? "scale(-1,1)" : "";
  return e.style.transform = (f)? "scale(-1,1)" : "";
}
function center(e) {
  e.style.marginLeft = px(-e.clientWidth/2);
  e.style.marginTop = px(-e.clientHeight/2);
  return e;
}

// math helpers
function rand(low, high) { return low + Math.floor(Math.random() * (high + 1 - low)); }
rand.coin = function () { return (Math.random() < .5); }
rand.float = function(low, high) { return low + Math.random() * (high - low); };
rand.parity = function () { return (Math.random() < .5)? -1: 1; };
rand.percent = function (p) { return (Math.random() < p); };
rand.pick = function (a) { return a[(Math.random() * a.length) | 0]; };
rand.shuffle = function (a) {
  for (var i = 0; i < a.length; ++i) {
    var j = rand(0, a.length - 1);
    var temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a;
};
function range(a, min, max) { return Math.min(Math.max(a, min), max); }

// DOM helpers
function $(q) { return document.querySelector(q); }
function $a(q) { return document.querySelectorAll(q); }
function orphan(node) { node.parentNode.removeChild(node); }

// mouse position helper
function mouse(event, element, scale) {
  scale = scale || 1;
  var rect = element.getBoundingClientRect();
  return {x: Math.floor((event.clientX - rect.left) / scale),
          y: Math.floor((event.clientY - rect.top) / scale)};
}

// array helpers
function each(f, a) {
  if (!a) {
    return function (a) { return each(f, a); };
  } else {
    for (var i = 0, L = a.length; i < L; ++i) { f(a[i], i); }
    return a;
  }
}
function eachObject(f, o) {
  if (!o) {
    return function (o) { return eachObject(f, o); };
  } else {
    for (var k in o) { f(o[k], k); }
    return o;
  }
}
function map(f, a) {
  if (!a) {
    return function (a) { return map(f, a); };
  } else {
    var L = a.length, b = new Array(L);
    for (var i = 0; i < L; ++i) { b[i] = f(a[i], i); }
    return b;
  }
}
function mapObject(f, o) {
  if (!o) {
    return function (o) { return mapObject(f, o); };
  } else {
    var b = {};
    for (var k in o) { b[k] = f(o[k], k); }
    return b;
  }
}
function tab(f, n) {
  if (n === undefined) {
    return function (n) { return tab(f, n); };
  } else {
    var res = new Array(n), i = 0;
    for (i = 0; i < n; ++i) { res[i] = f(i); }
    return res;
  }
}
function tab2d(f, rows, cols) { 
  return tab(function (r) { return tab(function (c) { return f(r, c); }, cols); }, rows);
}

// object helpers
function def(obj, vals) {
  for (var key in vals)
    Object.defineProperty(obj, key, { value : vals[key] });
}
function prop(obj, key, val, str, gtr) {
  if (str) { val = str(val, null); }
  Object.defineProperty(obj, key, {
    get: (gtr)? function () { return gtr(val); }:
                function () { return val; },
    set: (str)? function (v) { return val = str(v, val); }:
                function (v) { return val = v; }
  });
  return obj;
}
function bnd(obj, key, val, elt, disp) {
  disp = disp || function (v) { return v.toString(); };
  if (val === null) { val = obj[key]; }
  elt.textContent = disp(val);
  prop(obj, key, val, function (v) {
    elt.textContent = disp(v);
    return v;
  });
  return elt;
}

// HTTP stuff
function HTTP(method, url, data, callback) {
  var x = new XMLHttpRequest();
  x.onload = (callback && callback.bind(null, x)) || function () {
    alert(x.responseText);
  };
  x.open(method, url, true);
  x.setRequestHeader("Content-Type", "application/json");
  x.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  x.send(JSON.stringify(data));
}
var GET = HTTP.bind(null, "GET"),
    POST = HTTP.bind(null, "POST");

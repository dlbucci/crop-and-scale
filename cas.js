/**
 * Object Helpers
 **/
function o(b) {
  var res = {};
  for (var key in b)
    if (key.substr(0, 2) === "__")
      Object.defineProperty(res, key.substr(2), { value: b[key] });
    else if (key.charAt(0) === "_")
      Object.defineProperty(res, key.substr(1), { value: b[key], writeable: true, configurable: true });
    else
      res[key] = (typeof b[key] === "object")? o(b[key]) : b[key];
  return res;
}
function l(k, d) {
  var res = JSON.parse(localStorage.getItem(k)) || {};
  (function deepSet(t, s) {
    for (var key in s) {
      if (!(key in t)) {
        if (typeof s[key] === "object" && key.charAt(0) !== "_") {
          deepSet(t[key] = {}, s[key]);
        } else {
          t[key] = s[key];
        }
      } else if ((typeof t[key]) === "object" && (typeof s[key]) === "object") {
        deepSet(t[key], s[key]);
      }
    }
  })(res, d);
  return res;
}

/**
 * HTML BULL
 **/
function app(p) { for (var i = 1; i < arguments.length; ++i) p.appendChild(arguments[i]); return p; }
function on(ev, f, el) { el.addEventListener(ev, f); return el; }
var div = elt.bind(this, "div");
var H = {
  Box: function (title) {
    var bax = div({class:"bax"}),
        res = div({class:"box"}, elt("h2", null, title), bax);
    for (var i = 1; i < arguments.length; ++i)
      app(bax, arguments[i]);
    return res;
  },
  
  ImageFileInput: function (img) {
    var res = elt("input", {type:"file"});
    res.onchange = function () {
      var file = res.files[0];
      if (!(/^image\//.test(file.type))) { return; }
      
      var reader = new FileReader();
      reader.onload = function (e) { img.src = e.target.result; };
      reader.readAsDataURL(file);
    }
    return res;
  },
  
  Label: function (label, input) {
    return elt("label", null, label+": ", input);
  },
  
  Link: function (label, href) {
    return elt("a", {href:href,target:"_blank"}, label);
  },
  
  twbool: function (obj, key, onchange) {
    var val = obj[key],
        res = elt("input", {type:"checkbox"});
    res.checked = val;
    prop(obj, key, val, function (v) {
      res.checked = v;
      return v;
    });
    res.onchange = function () {
      obj[key] = res.checked;
      onchange && onchange(obj[key]);
    };
    return res;
  },
  
  twint: function (obj, key, oninput) {
    var val = obj[key],
        res = elt("input", {type:"number", value:val});
    prop(obj, key, val, function (v) {
      res.value = v;
      return v;
    });
    res.oninput = function () {
      obj[key] = parseInt(res.value, 10);
      oninput && oninput(obj[key]);
    };
    return res;
  },
};

/**
 * Application Cord
 **/
function cropAndScale(stort) {
  var ctx = stort.tmpCanvas.getContext("2d"), src = stort.src, dst = stort.dst;
  if (dst.mode === "size") {
    ctx.canvas.width = dst.width;
    ctx.canvas.height = dst.height;
  } else { // if (dst.mode === "zoom") {
    ctx.canvas.width = src.width * dst.zoom;
    ctx.canvas.height = src.height * dst.zoom;
  }
  // need to set this after changing canvas dimensions, apparently
  ctx.mozImageSmoothingEnabled = dst.smoothing;
  ctx.webkitImageSmoothingEnabled = dst.smoothing;
  ctx.msImageSmoothingEnabled = dst.smoothing;
  ctx.imageSmoothingEnabled = dst.smoothing;
  if (src.mode === "size") {
    ctx.drawImage(src.img, src.x, src.y, src.width, src.height,
                           0, 0, ctx.canvas.width, ctx.canvas.height);
    dst.img.src = ctx.canvas.toDataURL();
  } else {
    alert("You should not be seeing this.");
  }
  setTimeout(function saveSettings() {
    localStorage.setItem("cas-settings", JSON.stringify(stort));
  }, 0);
}

function redraw(stort, scale) {
  var src = stort.src, img = src.img, can = stort.selectionCanvas, ctx = can.getContext("2d"),
      scale = scale || (src.img.width / src.img.naturalWidth);
  can.width = img.width;
  can.height = img.height;
  ctx.fillStyle = "rgba(0,0,0,.5)";
  ctx.fillRect(0, 0, can.width, can.height);
  ctx.clearRect(src.x * scale, src.y * scale, src.width * scale, src.height * scale);
}

function onImgLoad(stort) {
  $("#main").classList.add("img-loaded");
  redraw(stort);
  cropAndScale(stort);
}

function setSelection(stort, e) {
  if (!stort.src.img.width) { return; }
  if (!(e.buttons & 1)) { return; }
  
  var pos = mouse(e, stort.selectionCanvas), src = stort.src, scale = src.img.width / src.img.naturalWidth;
  pos.x /= scale;
  pos.y /= scale;
  src.x = Math.min(Math.max(0, Math.round(Math.round(pos.x - src.width / 2) / src.snap) * src.snap), src.img.naturalWidth - src.width);
  src.y = Math.min(Math.max(0, Math.round(Math.round(pos.y - src.height / 2) / src.snap) * src.snap), src.img.naturalHeight - src.height);
  
  redraw(stort, scale);
}

/**
 * Let's do this
 **/
window.onload = function () {
  var stort = o(l("cas-settings", {
        src: {
          mode: "size",
          _x: 0,
          _y: 0,
          width: 150,
          height: 150,
          snap: 2,
          zoom: .5,
          __img: elt("img"),
        },
        dst: {
          mode: "zoom",
          width: 300,
          height: 300,
          zoom: 2,
          smoothing: false,
          __img: elt("img"),
        },
        __main: div({id:"main"}),
        __selectionCanvas: elt("canvas", {id:"selection"}),
        __tmpCanvas: elt("canvas"),
      })),
      crorpAndScorle = cropAndScale.bind(this, stort),
      redrorw = redraw.bind(this, stort),
      wholeShebang = function () { redrorw(); crorpAndScorle(); };
  
  app(document.body,
      div(null,
          elt("h1", null, "Crop And Scale ", elt("span", {class:"subtitle"}, "[\u25A3 + \u00D7]")),
          app(stort.main,
              H.Box("Step 1: Pick Your Image.",
                  H.Label("Source File", H.ImageFileInput(stort.src.img))),
              H.Box("Step 2: Set Your Crop Box.",
                  div({class:"img-wrapper"},
                      on("load", onImgLoad.bind(this, stort), stort.src.img),
                      on("mousedown", setSelection.bind(this, stort),
                          on("mousemove", setSelection.bind(this, stort),
                          on("mouseup", crorpAndScorle,
                          on("touchstart", function (e) { setSelection(stort, e.changedTouches[0]); },
                          on("touchmove", function (e) { setSelection(stort, e.changedTouches[0]); },
                          on("touchend", crorpAndScorle,
                          stort.selectionCanvas))))))),
                  H.Label("Source X", H.twint(stort.src, "x", wholeShebang)),
                  H.Label("Source Y", H.twint(stort.src, "y", wholeShebang)),
                  H.Label("Source Width", H.twint(stort.src, "width", wholeShebang)),
                  H.Label("Source Height", H.twint(stort.src, "height", wholeShebang)),
                  H.Label("Source Snap", H.twint(stort.src, "snap", wholeShebang))),
              H.Box("Step 3: Right Click to Save!",
                  stort.dst.img,
                  H.Label("Smooth Icon", H.twbool(stort.dst, "smoothing", crorpAndScorle)),
                  H.Label("Icon Scale", H.twint(stort.dst, "zoom", crorpAndScorle)))),
          elt("h3", null, "Made by ",
              H.Link("Daniel Bucci", "mailto:dlbucci@superftc.com"), " for his ",
              H.Link("Super FTC", "http://www.superftc.com/comic"), " ",
              H.Link("Tapastic Comic", "http://www.tapastic.com/series/Super-FTC"), ".")));
  
  window.onresize = redrorw;
};

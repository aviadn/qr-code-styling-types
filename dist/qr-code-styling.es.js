import W from "qrcode-generator";
const L = {
  numeric: "Numeric",
  alphanumeric: "Alphanumeric",
  byte: "Byte",
  kanji: "Kanji"
};
function tt(l) {
  switch (!0) {
    case /^[0-9]*$/.test(l):
      return L.numeric;
    case /^[0-9A-Z $%*+\-./:]*$/.test(l):
      return L.alphanumeric;
    default:
      return L.byte;
  }
}
const I = (l) => !!l && typeof l == "object" && !Array.isArray(l);
function k(l, ...e) {
  if (!e.length)
    return l;
  const t = e.shift();
  return t === void 0 || !I(l) || !I(t) ? l : (l = { ...l }, Object.keys(t).forEach((n) => {
    const i = l[n], s = t[n];
    Array.isArray(i) && Array.isArray(s) ? l[n] = s : I(i) && I(s) ? l[n] = k(Object.assign({}, i), s) : l[n] = s;
  }), k(l, ...e));
}
function H(l, e) {
  const t = document.createElement("a");
  t.download = e, t.href = l, document.body.appendChild(t), t.click(), document.body.removeChild(t);
}
function et({
  originalHeight: l,
  originalWidth: e,
  maxHiddenDots: t,
  maxHiddenAxisDots: n,
  dotSize: i
}) {
  const s = { x: 0, y: 0 }, r = { x: 0, y: 0 };
  if (l <= 0 || e <= 0 || t <= 0 || i <= 0)
    return {
      height: 0,
      width: 0,
      hideYDots: 0,
      hideXDots: 0
    };
  const o = l / e;
  return s.x = Math.floor(Math.sqrt(t / o)), s.x <= 0 && (s.x = 1), n && n < s.x && (s.x = n), s.x % 2 === 0 && s.x--, r.x = s.x * i, s.y = 1 + 2 * Math.ceil((s.x * o - 1) / 2), r.y = Math.round(r.x * o), (s.y * s.x > t || n && n < s.y) && (n && n < s.y ? (s.y = n, s.y % 2 === 0 && s.x--) : s.y -= 2, r.y = s.y * i, s.x = 1 + 2 * Math.ceil((s.y / o - 1) / 2), r.x = Math.round(r.y / o)), {
    height: r.y,
    width: r.x,
    hideYDots: s.y,
    hideXDots: s.x
  };
}
async function nt(l) {
  return new Promise((e) => {
    const t = new XMLHttpRequest();
    t.onload = function() {
      const n = new FileReader();
      n.onloadend = function() {
        e(n.result);
      }, n.readAsDataURL(t.response);
    }, t.open("GET", l), t.responseType = "blob", t.send();
  });
}
const it = {
  L: 0.07,
  M: 0.15,
  Q: 0.25,
  H: 0.3
}, A = {
  dots: "dots",
  randomDots: "random-dots",
  rounded: "rounded",
  verticalLines: "vertical-lines",
  horizontalLines: "horizontal-lines",
  classy: "classy",
  classyRounded: "classy-rounded",
  square: "square",
  extraRounded: "extra-rounded"
};
class B {
  constructor({ svg: e, type: t }) {
    this._svg = e, this._type = t;
  }
  draw(e, t, n, i) {
    const s = this._type;
    let r;
    switch (s) {
      case A.dots:
        r = this._drawDot;
        break;
      case A.randomDots:
        r = this._drawRandomDot;
        break;
      case A.classy:
        r = this._drawClassy;
        break;
      case A.classyRounded:
        r = this._drawClassyRounded;
        break;
      case A.rounded:
        r = this._drawRounded;
        break;
      case A.verticalLines:
        r = this._drawVerticalLines;
        break;
      case A.horizontalLines:
        r = this._drawHorizontalLines;
        break;
      case A.extraRounded:
        r = this._drawExtraRounded;
        break;
      case A.square:
      default:
        r = this._drawSquare;
    }
    r.call(this, { x: e, y: t, size: n, getNeighbor: i });
  }
  _rotateFigure({ x: e, y: t, size: n, rotation: i = 0, draw: s }) {
    var a;
    const r = e + n / 2, o = t + n / 2;
    s(), (a = this._element) == null || a.setAttribute("transform", `rotate(${180 * i / Math.PI},${r},${o})`);
  }
  _basicDot(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle"), this._element.setAttribute("cx", String(n + t / 2)), this._element.setAttribute("cy", String(i + t / 2)), this._element.setAttribute("r", String(t / 2));
      }
    });
  }
  _basicSquare(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect"), this._element.setAttribute("x", String(n)), this._element.setAttribute("y", String(i)), this._element.setAttribute("width", String(t)), this._element.setAttribute("height", String(t));
      }
    });
  }
  //if rotation === 0 - right side is rounded
  _basicSideRounded(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute(
          "d",
          `M ${n} ${i}v ${t}h ${t / 2}a ${t / 2} ${t / 2}, 0, 0, 0, 0 ${-t}`
          // draw rounded corner
        );
      }
    });
  }
  //if rotation === 0 - top right corner is rounded
  _basicCornerRounded(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute(
          "d",
          `M ${n} ${i}v ${t}h ${t}v ${-t / 2}a ${t / 2} ${t / 2}, 0, 0, 0, ${-t / 2} ${-t / 2}`
          // draw rounded corner
        );
      }
    });
  }
  //if rotation === 0 - top right corner is rounded
  _basicCornerExtraRounded(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute(
          "d",
          `M ${n} ${i}v ${t}h ${t}a ${t} ${t}, 0, 0, 0, ${-t} ${-t}`
          // draw rounded top right corner
        );
      }
    });
  }
  //if rotation === 0 - left bottom and right top corners are rounded
  _basicCornersRounded(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute(
          "d",
          `M ${n} ${i}v ${t / 2}a ${t / 2} ${t / 2}, 0, 0, 0, ${t / 2} ${t / 2}h ${t / 2}v ${-t / 2}a ${t / 2} ${t / 2}, 0, 0, 0, ${-t / 2} ${-t / 2}`
          // draw rounded right top corner
        );
      }
    });
  }
  _drawDot({ x: e, y: t, size: n }) {
    this._basicDot({ x: e, y: t, size: n, rotation: 0 });
  }
  _drawRandomDot({ x: e, y: t, size: n }) {
    const i = Math.random() * 0.4 + 0.6;
    this._basicDot({ x: e, y: t, size: n * i, rotation: 0 });
  }
  _drawSquare({ x: e, y: t, size: n }) {
    this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
  }
  _drawRounded({ x: e, y: t, size: n, getNeighbor: i }) {
    const s = i ? +i(-1, 0) : 0, r = i ? +i(1, 0) : 0, o = i ? +i(0, -1) : 0, a = i ? +i(0, 1) : 0, d = s + r + o + a;
    if (d === 0) {
      this._basicDot({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (d > 2 || s && r || o && a) {
      this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (d === 2) {
      let h = 0;
      s && o ? h = Math.PI / 2 : o && r ? h = Math.PI : r && a && (h = -Math.PI / 2), this._basicCornerRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
    if (d === 1) {
      let h = 0;
      o ? h = Math.PI / 2 : r ? h = Math.PI : a && (h = -Math.PI / 2), this._basicSideRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
  }
  _drawVerticalLines({ x: e, y: t, size: n, getNeighbor: i }) {
    const s = i ? +i(-1, 0) : 0, r = i ? +i(1, 0) : 0, o = i ? +i(0, -1) : 0, a = i ? +i(0, 1) : 0;
    if (s + r + o + a === 0 || s && !(o || a) || r && !(o || a)) {
      this._basicDot({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (o && a) {
      this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (o && !a) {
      const h = Math.PI / 2;
      this._basicSideRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
    if (a && !o) {
      const h = -Math.PI / 2;
      this._basicSideRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
  }
  _drawHorizontalLines({ x: e, y: t, size: n, getNeighbor: i }) {
    const s = i ? +i(-1, 0) : 0, r = i ? +i(1, 0) : 0, o = i ? +i(0, -1) : 0, a = i ? +i(0, 1) : 0;
    if (s + r + o + a === 0 || o && !(s || r) || a && !(s || r)) {
      this._basicDot({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (s && r) {
      this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (s && !r) {
      this._basicSideRounded({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (r && !s) {
      const h = Math.PI;
      this._basicSideRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
  }
  _drawExtraRounded({ x: e, y: t, size: n, getNeighbor: i }) {
    const s = i ? +i(-1, 0) : 0, r = i ? +i(1, 0) : 0, o = i ? +i(0, -1) : 0, a = i ? +i(0, 1) : 0, d = s + r + o + a;
    if (d === 0) {
      this._basicDot({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (d > 2 || s && r || o && a) {
      this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
      return;
    }
    if (d === 2) {
      let h = 0;
      s && o ? h = Math.PI / 2 : o && r ? h = Math.PI : r && a && (h = -Math.PI / 2), this._basicCornerExtraRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
    if (d === 1) {
      let h = 0;
      o ? h = Math.PI / 2 : r ? h = Math.PI : a && (h = -Math.PI / 2), this._basicSideRounded({ x: e, y: t, size: n, rotation: h });
      return;
    }
  }
  _drawClassy({ x: e, y: t, size: n, getNeighbor: i }) {
    const s = i ? +i(-1, 0) : 0, r = i ? +i(1, 0) : 0, o = i ? +i(0, -1) : 0, a = i ? +i(0, 1) : 0;
    if (s + r + o + a === 0) {
      this._basicCornersRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 });
      return;
    }
    if (!s && !o) {
      this._basicCornerRounded({ x: e, y: t, size: n, rotation: -Math.PI / 2 });
      return;
    }
    if (!r && !a) {
      this._basicCornerRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 });
      return;
    }
    this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
  }
  _drawClassyRounded({ x: e, y: t, size: n, getNeighbor: i }) {
    const s = i ? +i(-1, 0) : 0, r = i ? +i(1, 0) : 0, o = i ? +i(0, -1) : 0, a = i ? +i(0, 1) : 0;
    if (s + r + o + a === 0) {
      this._basicCornersRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 });
      return;
    }
    if (!s && !o) {
      this._basicCornerExtraRounded({ x: e, y: t, size: n, rotation: -Math.PI / 2 });
      return;
    }
    if (!r && !a) {
      this._basicCornerExtraRounded({ x: e, y: t, size: n, rotation: Math.PI / 2 });
      return;
    }
    this._basicSquare({ x: e, y: t, size: n, rotation: 0 });
  }
}
const y = {
  dot: "dot",
  square: "square",
  extraRounded: "extra-rounded",
  flowerIn: "flowerIn",
  flowerOut: "flowerOut",
  marker: "marker",
  oneRounded: "oneRounded"
};
function st(l, e) {
  const t = "http://www.w3.org/2000/svg", n = document.createElementNS(t, "svg");
  n.setAttribute("width", l.toString()), n.setAttribute("height", l.toString()), n.setAttribute("viewBox", "0 0 200 200"), n.setAttribute("fill", e);
  const i = document.createElementNS(t, "path");
  return i.setAttribute(
    "d",
    "M 0 0 L 0 137.146 C 0 171.432 28.572 200.004 62.859 200.004 L 135.717 200.004 C 171.432 200.004 200.004 171.432 200.004 137.146 L 200.004 62.859 C 200.004 28.572 171.432 0 137.146 0 L 0 0 Z M 131.432 171.432 L 68.573 171.432 C 47.144 171.432 28.572 152.861 28.572 131.432 L 28.572 28.572 L 131.432 28.572 C 152.861 28.572 171.432 47.144 171.432 68.573 L 171.432 131.432 C 171.432 152.861 152.861 171.432 131.432 171.432 Z"
  ), n.appendChild(i), n;
}
function rt(l, e) {
  const t = "http://www.w3.org/2000/svg", n = document.createElementNS(t, "svg");
  n.setAttribute("width", l.toString()), n.setAttribute("height", l.toString()), n.setAttribute("viewBox", "0 0 200 200"), n.setAttribute("fill", e);
  const i = document.createElementNS(t, "path");
  return i.setAttribute(
    "d",
    "M0 0v200.004h200.004V0H0zm100.002 171.432c-40.0008 0-71.43-31.4292-71.43-71.43s31.4292-71.43 71.43-71.43 71.43 31.4292 71.43 71.43-31.4292 71.43-71.43 71.43z"
  ), n.appendChild(i), n;
}
function ot(l, e) {
  const t = "http://www.w3.org/2000/svg", n = document.createElementNS(t, "svg");
  n.setAttribute("width", l.toString()), n.setAttribute("height", l.toString()), n.setAttribute("viewBox", "0 0 200 200"), n.setAttribute("fill", e);
  const i = document.createElementNS(t, "path");
  return i.setAttribute(
    "d",
    "M200.06 0H62.88C28.58 0 0 28.58 0 62.88v137.18h200.06V0zM28.58 171.48V68.59c0-21.43 18.58-40.01 40.01-40.01h102.89v142.9H28.58z"
  ), n.appendChild(i), n;
}
class at {
  constructor({ svg: e, type: t, color: n }) {
    this._svg = e, this._type = t, this._color = n;
  }
  draw(e, t, n, i) {
    const s = this._type;
    let r;
    switch (s) {
      case y.square:
        r = this._drawSquare;
        break;
      case y.extraRounded:
        r = this._drawExtraRounded;
        break;
      case y.flowerIn:
        r = this._drawFlowerIn;
        break;
      case y.flowerOut:
        r = this._drawFlowerOut;
        break;
      case y.marker:
        r = this._drawMarker;
        break;
      case y.oneRounded:
        r = this._drawOneRounded;
        break;
      case y.dot:
      default:
        r = this._drawDot;
    }
    r.call(this, { x: e, y: t, size: n, rotation: i });
  }
  _rotateFigure({ x: e, y: t, size: n, rotation: i = 0, draw: s }) {
    var a;
    const r = e + n / 2, o = t + n / 2;
    s(), (a = this._element) == null || a.setAttribute("transform", `rotate(${180 * i / Math.PI},${r},${o})`);
  }
  _basicDot(e) {
    const { size: t, x: n, y: i } = e, s = t / 7;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("clip-rule", "evenodd"), this._element.setAttribute(
          "d",
          `M ${n + t / 2} ${i}a ${t / 2} ${t / 2} 0 1 0 0.1 0zm 0 ${s}a ${t / 2 - s} ${t / 2 - s} 0 1 1 -0.1 0Z`
          // Z // Close the inner ring. Actually will still work without, but inner ring will have one unit missing in stroke
        );
      }
    });
  }
  _basicSquare(e) {
    const { size: t, x: n, y: i } = e, s = t / 7;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("clip-rule", "evenodd"), this._element.setAttribute(
          "d",
          `M ${n} ${i}v ${t}h ${t}v ${-t}zM ${n + s} ${i + s}h ${t - 2 * s}v ${t - 2 * s}h ${-t + 2 * s}z`
        );
      }
    });
  }
  _basicExtraRounded(e) {
    const { size: t, x: n, y: i } = e, s = t / 7;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "path"), this._element.setAttribute("clip-rule", "evenodd"), this._element.setAttribute(
          "d",
          `M ${n} ${i + 2.5 * s}v ${2 * s}a ${2.5 * s} ${2.5 * s}, 0, 0, 0, ${s * 2.5} ${s * 2.5}h ${2 * s}a ${2.5 * s} ${2.5 * s}, 0, 0, 0, ${s * 2.5} ${-s * 2.5}v ${-2 * s}a ${2.5 * s} ${2.5 * s}, 0, 0, 0, ${-s * 2.5} ${-s * 2.5}h ${-2 * s}a ${2.5 * s} ${2.5 * s}, 0, 0, 0, ${-s * 2.5} ${s * 2.5}M ${n + 2.5 * s} ${i + s}h ${2 * s}a ${1.5 * s} ${1.5 * s}, 0, 0, 1, ${s * 1.5} ${s * 1.5}v ${2 * s}a ${1.5 * s} ${1.5 * s}, 0, 0, 1, ${-s * 1.5} ${s * 1.5}h ${-2 * s}a ${1.5 * s} ${1.5 * s}, 0, 0, 1, ${-s * 1.5} ${-s * 1.5}v ${-2 * s}a ${1.5 * s} ${1.5 * s}, 0, 0, 1, ${s * 1.5} ${-s * 1.5}`
        );
      }
    });
  }
  _drawDot({ x: e, y: t, size: n, rotation: i }) {
    this._basicDot({ x: e, y: t, size: n, rotation: i });
  }
  _drawSquare({ x: e, y: t, size: n, rotation: i }) {
    this._basicSquare({ x: e, y: t, size: n, rotation: i });
  }
  _drawExtraRounded({ x: e, y: t, size: n, rotation: i }) {
    this._basicExtraRounded({ x: e, y: t, size: n, rotation: i });
  }
  _basicFlower(e) {
    const { x: t, y: n, size: i, rotation: s } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        const o = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        o.setAttribute("x", String(t)), o.setAttribute("y", String(n)), o.setAttribute("width", String(i)), o.setAttribute("height", String(i));
        const a = s * 180 / Math.PI, d = t + i / 2, h = n + i / 2, u = o.getAttribute("transform") || "";
        o.setAttribute("transform", `${u} rotate(${a},${d},${h})`);
        const c = st(i, this._color ?? "black");
        o.append(c), this._svg.appendChild(o);
      }
    });
  }
  _drawFlowerIn({ x: e, y: t, size: n, rotation: i }) {
    this._basicFlower({
      x: e,
      y: t,
      size: n,
      rotation: i
    });
  }
  _drawFlowerOut({ x: e, y: t, size: n, rotation: i }) {
    this._basicFlower({
      x: e,
      y: t,
      size: n,
      rotation: i + Math.PI
    });
  }
  _basicMarker(e) {
    const { x: t, y: n, size: i, rotation: s } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        const o = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        o.setAttribute("x", String(t)), o.setAttribute("y", String(n)), o.setAttribute("width", String(i)), o.setAttribute("height", String(i));
        const a = rt(i, this._color ?? "black");
        o.append(a), this._svg.appendChild(o);
      }
    });
  }
  _drawMarker({ x: e, y: t, size: n, rotation: i }) {
    this._basicMarker({
      x: e,
      y: t,
      size: n,
      rotation: i
    });
  }
  _basicOneRounded(e) {
    const { x: t, y: n, size: i, rotation: s } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        const o = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        o.setAttribute("x", String(t)), o.setAttribute("y", String(n)), o.setAttribute("width", String(i)), o.setAttribute("height", String(i));
        const a = s * 180 / Math.PI, d = t + i / 2, h = n + i / 2, u = o.getAttribute("transform") || "";
        o.setAttribute("transform", `${u} rotate(${a},${d},${h})`);
        const c = ot(i, this._color ?? "black");
        o.append(c), this._svg.appendChild(o);
      }
    });
  }
  _drawOneRounded({ x: e, y: t, size: n, rotation: i }) {
    this._basicOneRounded({
      x: e,
      y: t,
      size: n,
      rotation: i
    });
  }
}
const M = {
  dot: "dot",
  square: "square",
  heart: "heart",
  star: "star",
  polygon5: "polygon5",
  polygon7: "polygon7",
  bezier: "bezier",
  dropIn: "dropIn",
  dropOut: "dropOut",
  oneRounded: "oneRounded"
};
function ct(l, e) {
  const t = "http://www.w3.org/2000/svg", n = document.createElementNS(t, "svg");
  n.setAttribute("width", l.toString()), n.setAttribute("height", l.toString()), n.setAttribute("viewBox", "0 -960 960 960"), n.setAttribute("fill", e);
  const i = document.createElementNS(t, "path");
  return i.setAttribute(
    "d",
    "m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z"
  ), n.appendChild(i), n;
}
function ht(l, e) {
  const t = "http://www.w3.org/2000/svg", n = document.createElementNS(t, "svg");
  n.setAttribute("width", l.toString()), n.setAttribute("height", l.toString()), n.setAttribute("viewBox", "0 0 500 500"), n.setAttribute("fill", e);
  const i = document.createElementNS(t, "path");
  return i.setAttribute(
    "d",
    "M249.999 499.998C108.3329 499.998 0 391.6651 0 249.999V0h249.999c141.6661 0 249.999 108.3329 249.999 249.999S391.6651 499.998 249.999 499.998z"
  ), n.appendChild(i), n;
}
function dt(l, e) {
  const t = "http://www.w3.org/2000/svg", n = document.createElementNS(t, "svg");
  n.setAttribute("width", l.toString()), n.setAttribute("height", l.toString()), n.setAttribute("viewBox", "0 0 100 100"), n.setAttribute("fill", e);
  const i = document.createElementNS(t, "path");
  return i.setAttribute(
    "d",
    "M71.68 100.02H28.34C13.34 100.02 0 86.68 0 71.68V0h71.68c15 0 28.34 13.34 28.34 28.34v43.34c0 15-13.34 28.34-28.34 28.34z"
  ), n.appendChild(i), n;
}
class lt {
  constructor({ svg: e, type: t, color: n }) {
    this._svg = e, this._type = t, this._color = n;
  }
  draw(e, t, n, i) {
    const s = this._type;
    let r;
    switch (s) {
      case M.square:
        r = this._drawSquare;
        break;
      case M.heart:
        r = this._drawHeart;
        break;
      case M.star:
        r = this._drawStar;
        break;
      case M.polygon5:
        r = this._drawPolygon5;
        break;
      case M.polygon7:
        r = this._drawPolygon7;
        break;
      case M.bezier:
        r = this._draeBezier;
        break;
      case M.dropIn:
        r = this._drawDropIn;
        break;
      case M.dropOut:
        r = this._drawDropOut;
        break;
      case M.oneRounded:
        r = this._drawOneRounded;
        break;
      case M.dot:
      default:
        r = this._drawDot;
    }
    r.call(this, { x: e, y: t, size: n, rotation: i });
  }
  _rotateFigure({ x: e, y: t, size: n, rotation: i = 0, draw: s }) {
    if (s(), this._element) {
      const r = e + n / 2, o = t + n / 2, a = i * 180 / Math.PI, d = this._element.getAttribute("transform") || "";
      this._element.setAttribute("transform", `${d} rotate(${a},${r},${o})`);
    }
  }
  _basicDot(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "circle"), this._element.setAttribute("cx", String(n + t / 2)), this._element.setAttribute("cy", String(i + t / 2)), this._element.setAttribute("r", String(t / 2));
      }
    });
  }
  _basicSquare(e) {
    const { size: t, x: n, y: i } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        this._element = document.createElementNS("http://www.w3.org/2000/svg", "rect"), this._element.setAttribute("x", String(n)), this._element.setAttribute("y", String(i)), this._element.setAttribute("width", String(t)), this._element.setAttribute("height", String(t));
      }
    });
  }
  _basicHeart(e) {
    const { x: t, y: n, size: i, rotation: s } = e;
    this._rotateFigure({
      ...e,
      draw: () => {
        const o = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        o.setAttribute("x", String(t)), o.setAttribute("y", String(n)), o.setAttribute("width", String(i)), o.setAttribute("height", String(i));
        const a = ct(i, this._color ?? "black");
        o.append(a), this._svg.appendChild(o);
      }
    });
  }
  _drawDot({ x: e, y: t, size: n, rotation: i }) {
    this._basicDot({ x: e, y: t, size: n, rotation: i });
  }
  _drawSquare({ x: e, y: t, size: n, rotation: i }) {
    this._basicSquare({ x: e, y: t, size: n, rotation: i });
  }
  _drawHeart({ x: e, y: t, size: n, rotation: i }) {
    this._basicHeart({
      x: e - 0.2 * n / 2,
      y: t - 0.2 * n / 2,
      size: n * (1 + 0.2),
      rotation: i
    });
  }
  _drawStar({ x: e, y: t, size: n, rotation: i }) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "polygon"), o = 1.2;
    n *= o, e -= (n * o - n) / 2, t -= (n * o - n) / 2;
    const a = e + n / 2, d = t + n / 2, h = n / 2, u = h / 2, c = [];
    for (let p = 0; p < 10; p++) {
      const g = p % 2 === 0 ? h : u, b = p * 36 - 90, m = Math.PI / 180 * b, w = a + g * Math.cos(m), _ = d + g * Math.sin(m);
      c.push(`${w},${_}`);
    }
    r.setAttribute("points", c.join(" ")), this._rotateFigure({
      x: e,
      y: t,
      size: n,
      draw: () => {
        this._element = r;
      }
    });
  }
  _drawPolygon7({ x: e, y: t, size: n, rotation: i }) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "polygon"), o = e + n / 2, a = t + n / 2, d = n / 2, h = [];
    for (let u = 0; u < 7; u++) {
      const c = o + d * Math.cos(u * 2 * Math.PI / 7 - Math.PI / 2), p = a + d * Math.sin(u * 2 * Math.PI / 7 - Math.PI / 2);
      h.push(`${c},${p}`);
    }
    r.setAttribute("points", h.join(" ")), this._rotateFigure({
      x: e,
      y: t,
      size: n,
      draw: () => {
        this._element = r;
      }
    });
  }
  _drawPolygon5({ x: e, y: t, size: n, rotation: i }) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "polygon"), o = e + n / 2, a = t + n / 2, d = n / 2, h = [];
    for (let u = 0; u < 5; u++) {
      const c = o + d * Math.cos(u * 2 * Math.PI / 5 - Math.PI / 2), p = a + d * Math.sin(u * 2 * Math.PI / 5 - Math.PI / 2);
      h.push(`${c},${p}`);
    }
    r.setAttribute("points", h.join(" ")), this._rotateFigure({
      x: e,
      y: t,
      size: n,
      draw: () => {
        this._element = r;
      }
    });
  }
  _draeBezier({ x: e, y: t, size: n, rotation: i }) {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "path"), o = n / 6, a = `M${e + 6 * o},${t + 6 * o} C${e + 4.1 * o},${t + 5.4 * o} ${e + 1.9 * o},${t + 5.4 * o} ${e},${t + 6 * o} L${e},${t} C${e + 1.9 * o},${t + 0.6 * o} ${e + 4.1 * o},${t + 0.6 * o} ${e + 6 * o},${t} Z`;
    r.setAttribute("d", a), this._rotateFigure({
      x: e,
      y: t,
      size: n,
      draw: () => {
        this._element = r;
      }
    });
  }
  _basicDrop(e) {
    const { x: t, y: n, size: i, rotation: s } = e;
    this._rotateFigure({
      x: t,
      y: n,
      size: i,
      rotation: s,
      draw: () => {
        const o = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        o.setAttribute("x", String(t)), o.setAttribute("y", String(n)), o.setAttribute("width", String(i)), o.setAttribute("height", String(i));
        const a = s * 180 / Math.PI, d = t + i / 2, h = n + i / 2, u = o.getAttribute("transform") || "";
        o.setAttribute("transform", `${u} rotate(${a},${d},${h})`);
        const c = ht(i, this._color ?? "black");
        o.append(c), this._svg.appendChild(o);
      }
    });
  }
  _drawDropIn({ x: e, y: t, size: n, rotation: i }) {
    this._basicDrop({
      x: e - 5e-4 * n / 2,
      y: t - 5e-4 * n / 2,
      size: n * (1 + 5e-4),
      rotation: i
    });
  }
  _drawDropOut({ x: e, y: t, size: n, rotation: i }) {
    this._basicDrop({
      x: e - 5e-4 * n / 2,
      y: t - 5e-4 * n / 2,
      size: n * (1 + 5e-4),
      rotation: i + Math.PI
    });
  }
  _basicOneRounded(e) {
    const { x: t, y: n, size: i, rotation: s } = e;
    this._rotateFigure({
      x: t,
      y: n,
      size: i,
      rotation: s,
      draw: () => {
        const o = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        o.setAttribute("x", String(t)), o.setAttribute("y", String(n)), o.setAttribute("width", String(i)), o.setAttribute("height", String(i));
        const a = s * 180 / Math.PI, d = t + i / 2, h = n + i / 2, u = o.getAttribute("transform") || "";
        o.setAttribute("transform", `${u} rotate(${a},${d},${h})`);
        const c = dt(i, this._color ?? "black");
        o.append(c), this._svg.appendChild(o);
      }
    });
  }
  _drawOneRounded({ x: e, y: t, size: n, rotation: i }) {
    this._basicOneRounded({
      x: e,
      y: t,
      size: n,
      rotation: i + Math.PI
    });
  }
}
const ut = {
  radial: "radial",
  linear: "linear"
}, P = {
  square: "square",
  circle: "circle"
}, C = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
], O = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0]
];
class pt {
  //TODO don't pass all options to this class
  constructor(e) {
    this._element = document.createElementNS("http://www.w3.org/2000/svg", "svg"), this._element.setAttribute("width", String(e.width)), this._element.setAttribute("height", String(e.height)), this._defs = document.createElementNS("http://www.w3.org/2000/svg", "defs"), this._element.appendChild(this._defs), this._options = e;
  }
  get width() {
    return this._options.width;
  }
  get height() {
    return this._options.height;
  }
  getElement() {
    return this._element;
  }
  async drawQR(e) {
    const t = e.getModuleCount(), n = Math.min(this._options.width, this._options.height) - this._options.margin * 2, i = this._options.shape === P.circle ? n / Math.sqrt(2) : n, s = Math.floor(i / t);
    let r = {
      hideXDots: 0,
      hideYDots: 0,
      width: 0,
      height: 0
    };
    if (this._qr = e, this._options.image) {
      if (await this.loadImage(), !this._image)
        return;
      const { imageOptions: o, qrOptions: a } = this._options, d = o.imageSize * it[a.errorCorrectionLevel], h = Math.floor(d * t * t);
      r = et({
        originalWidth: this._image.width,
        originalHeight: this._image.height,
        maxHiddenDots: h,
        maxHiddenAxisDots: t - 14,
        dotSize: s
      });
    }
    this.drawBackground(), this.drawDots((o, a) => {
      var d, h, u, c, p, g;
      return !(this._options.imageOptions.hideBackgroundDots && o >= (t - r.hideXDots) / 2 && o < (t + r.hideXDots) / 2 && a >= (t - r.hideYDots) / 2 && a < (t + r.hideYDots) / 2 || (d = C[o]) != null && d[a] || (h = C[o - t + 7]) != null && h[a] || (u = C[o]) != null && u[a - t + 7] || (c = O[o]) != null && c[a] || (p = O[o - t + 7]) != null && p[a] || (g = O[o]) != null && g[a - t + 7]);
    }), this.drawCorners(), this._options.image && await this.drawImage({ width: r.width, height: r.height, count: t, dotSize: s });
  }
  drawBackground() {
    var n, i, s;
    const e = this._element, t = this._options;
    if (e) {
      const r = (n = t.backgroundOptions) == null ? void 0 : n.gradient, o = (i = t.backgroundOptions) == null ? void 0 : i.color;
      if ((r || o) && this._createColor({
        options: r,
        color: o,
        additionalRotation: 0,
        x: 0,
        y: 0,
        height: t.height,
        width: t.width,
        name: "background-color"
      }), (s = t.backgroundOptions) != null && s.round) {
        const a = Math.min(t.width, t.height), d = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        this._backgroundClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), this._backgroundClipPath.setAttribute("id", "clip-path-background-color"), this._defs.appendChild(this._backgroundClipPath), d.setAttribute("x", String((t.width - a) / 2)), d.setAttribute("y", String((t.height - a) / 2)), d.setAttribute("width", String(a)), d.setAttribute("height", String(a)), d.setAttribute("rx", String(a / 2 * t.backgroundOptions.round)), this._backgroundClipPath.appendChild(d);
      }
    }
  }
  drawDots(e) {
    var h, u;
    if (!this._qr)
      throw "QR code is not defined";
    const t = this._options, n = this._qr.getModuleCount();
    if (n > t.width || n > t.height)
      throw "The canvas is too small.";
    const i = Math.min(t.width, t.height) - t.margin * 2, s = t.shape === P.circle ? i / Math.sqrt(2) : i, r = Math.floor(s / n), o = Math.floor((t.width - n * r) / 2), a = Math.floor((t.height - n * r) / 2), d = new B({ svg: this._element, type: t.dotsOptions.type });
    this._dotsClipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), this._dotsClipPath.setAttribute("id", "clip-path-dot-color"), this._defs.appendChild(this._dotsClipPath), this._createColor({
      options: (h = t.dotsOptions) == null ? void 0 : h.gradient,
      color: t.dotsOptions.color,
      additionalRotation: 0,
      x: 0,
      y: 0,
      height: t.height,
      width: t.width,
      name: "dot-color"
    });
    for (let c = 0; c < n; c++)
      for (let p = 0; p < n; p++)
        e && !e(c, p) || (u = this._qr) != null && u.isDark(c, p) && (d.draw(
          o + c * r,
          a + p * r,
          r,
          (g, b) => c + g < 0 || p + b < 0 || c + g >= n || p + b >= n || e && !e(c + g, p + b) ? !1 : !!this._qr && this._qr.isDark(c + g, p + b)
        ), d._element && this._dotsClipPath && this._dotsClipPath.appendChild(d._element));
    if (t.shape === P.circle) {
      const c = Math.floor((i / r - n) / 2), p = n + c * 2, g = o - c * r, b = a - c * r, m = [], w = Math.floor(p / 2);
      for (let _ = 0; _ < p; _++) {
        m[_] = [];
        for (let f = 0; f < p; f++) {
          if (_ >= c - 1 && _ <= p - c && f >= c - 1 && f <= p - c) {
            m[_][f] = 0;
            continue;
          }
          if (Math.sqrt((_ - w) * (_ - w) + (f - w) * (f - w)) > w) {
            m[_][f] = 0;
            continue;
          }
          m[_][f] = this._qr.isDark(
            f - 2 * c < 0 ? f : f >= n ? f - 2 * c : f - c,
            _ - 2 * c < 0 ? _ : _ >= n ? _ - 2 * c : _ - c
          ) ? 1 : 0;
        }
      }
      for (let _ = 0; _ < p; _++)
        for (let f = 0; f < p; f++)
          m[_][f] && (d.draw(
            g + _ * r,
            b + f * r,
            r,
            (D, R) => {
              var x;
              return !!((x = m[_ + D]) != null && x[f + R]);
            }
          ), d._element && this._dotsClipPath && this._dotsClipPath.appendChild(d._element));
    }
  }
  drawCorners() {
    if (!this._qr)
      throw "QR code is not defined";
    const e = this._element, t = this._options;
    if (!e)
      throw "Element code is not defined";
    const n = this._qr.getModuleCount(), i = Math.min(t.width, t.height) - t.margin * 2, s = t.shape === P.circle ? i / Math.sqrt(2) : i, r = Math.floor(s / n), o = r * 7, a = r * 3, d = Math.floor((t.width - n * r) / 2), h = Math.floor((t.height - n * r) / 2);
    [
      [0, 0, 0],
      [1, 0, Math.PI / 2],
      [0, 1, -Math.PI / 2]
    ].forEach(([u, c, p]) => {
      var _, f, D, R, x, Q, j, T, V, G, U, X;
      const g = d + u * r * (n - 7), b = h + c * r * (n - 7);
      let m = this._dotsClipPath, w = this._dotsClipPath;
      if (((_ = t.cornersSquareOptions) != null && _.gradient || (f = t.cornersSquareOptions) != null && f.color) && (m = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), m.setAttribute("id", `clip-path-corners-square-color-${u}-${c}`), this._defs.appendChild(m), this._cornersSquareClipPath = this._cornersDotClipPath = w = m, this._createColor({
        options: (D = t.cornersSquareOptions) == null ? void 0 : D.gradient,
        color: (R = t.cornersSquareOptions) == null ? void 0 : R.color,
        additionalRotation: p,
        x: g,
        y: b,
        height: o,
        width: o,
        name: `corners-square-color-${u}-${c}`
      })), (x = t.cornersSquareOptions) != null && x.type) {
        const S = new at({
          svg: this._element,
          type: t.cornersSquareOptions.type,
          color: t.cornersSquareOptions.color ?? t.dotsOptions.color
        });
        S.draw(g, b, o, p), S._element && m && m.appendChild(S._element);
      } else {
        const S = new B({ svg: this._element, type: t.dotsOptions.type });
        for (let $ = 0; $ < C.length; $++)
          for (let v = 0; v < C[$].length; v++)
            (Q = C[$]) != null && Q[v] && (S.draw(
              g + $ * r,
              b + v * r,
              r,
              (F, N) => {
                var q;
                return !!((q = C[$ + F]) != null && q[v + N]);
              }
            ), S._element && m && m.appendChild(S._element));
      }
      if (((j = t.cornersDotOptions) != null && j.gradient || (T = t.cornersDotOptions) != null && T.color) && (w = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"), w.setAttribute("id", `clip-path-corners-dot-color-${u}-${c}`), this._defs.appendChild(w), this._cornersDotClipPath = w, this._createColor({
        options: (V = t.cornersDotOptions) == null ? void 0 : V.gradient,
        color: (G = t.cornersDotOptions) == null ? void 0 : G.color,
        additionalRotation: p,
        x: g + r * 2,
        y: b + r * 2,
        height: a,
        width: a,
        name: `corners-dot-color-${u}-${c}`
      })), (U = t.cornersDotOptions) != null && U.type) {
        const S = new lt({
          svg: this._element,
          type: t.cornersDotOptions.type,
          color: t.cornersDotOptions.color ?? t.dotsOptions.color
        });
        S.draw(g + r * 2, b + r * 2, a, p), S._element && w && w.appendChild(S._element);
      } else {
        const S = new B({ svg: this._element, type: t.dotsOptions.type });
        for (let $ = 0; $ < O.length; $++)
          for (let v = 0; v < O[$].length; v++)
            (X = O[$]) != null && X[v] && (S.draw(
              g + $ * r,
              b + v * r,
              r,
              (F, N) => {
                var q;
                return !!((q = O[$ + F]) != null && q[v + N]);
              }
            ), S._element && w && w.appendChild(S._element));
      }
    });
  }
  loadImage() {
    return new Promise((e, t) => {
      const n = this._options, i = new Image();
      if (!n.image)
        return t("Image is not defined");
      typeof n.imageOptions.crossOrigin == "string" && (i.crossOrigin = n.imageOptions.crossOrigin), this._image = i, i.onload = () => {
        e();
      }, i.src = n.image;
    });
  }
  async drawImage({
    width: e,
    height: t,
    count: n,
    dotSize: i
  }) {
    const s = this._options, r = Math.floor((s.width - n * i) / 2), o = Math.floor((s.height - n * i) / 2), a = r + s.imageOptions.margin + (n * i - e) / 2, d = o + s.imageOptions.margin + (n * i - t) / 2, h = e - s.imageOptions.margin * 2, u = t - s.imageOptions.margin * 2, c = document.createElementNS("http://www.w3.org/2000/svg", "image");
    c.setAttribute("x", String(a)), c.setAttribute("y", String(d)), c.setAttribute("width", `${h}px`), c.setAttribute("height", `${u}px`);
    const p = await nt(s.image || "");
    c.setAttribute("href", p || ""), this._element.appendChild(c);
  }
  _createColor({
    options: e,
    color: t,
    additionalRotation: n,
    x: i,
    y: s,
    height: r,
    width: o,
    name: a
  }) {
    const d = o > r ? o : r, h = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    if (h.setAttribute("x", String(i)), h.setAttribute("y", String(s)), h.setAttribute("height", String(r)), h.setAttribute("width", String(o)), h.setAttribute("clip-path", `url('#clip-path-${a}')`), e) {
      let u;
      if (e.type === ut.radial)
        u = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient"), u.setAttribute("id", a), u.setAttribute("gradientUnits", "userSpaceOnUse"), u.setAttribute("fx", String(i + o / 2)), u.setAttribute("fy", String(s + r / 2)), u.setAttribute("cx", String(i + o / 2)), u.setAttribute("cy", String(s + r / 2)), u.setAttribute("r", String(d / 2));
      else {
        const c = ((e.rotation || 0) + n) % (2 * Math.PI), p = (c + 2 * Math.PI) % (2 * Math.PI);
        let g = i + o / 2, b = s + r / 2, m = i + o / 2, w = s + r / 2;
        p >= 0 && p <= 0.25 * Math.PI || p > 1.75 * Math.PI && p <= 2 * Math.PI ? (g = g - o / 2, b = b - r / 2 * Math.tan(c), m = m + o / 2, w = w + r / 2 * Math.tan(c)) : p > 0.25 * Math.PI && p <= 0.75 * Math.PI ? (b = b - r / 2, g = g - o / 2 / Math.tan(c), w = w + r / 2, m = m + o / 2 / Math.tan(c)) : p > 0.75 * Math.PI && p <= 1.25 * Math.PI ? (g = g + o / 2, b = b + r / 2 * Math.tan(c), m = m - o / 2, w = w - r / 2 * Math.tan(c)) : p > 1.25 * Math.PI && p <= 1.75 * Math.PI && (b = b + r / 2, g = g + o / 2 / Math.tan(c), w = w - r / 2, m = m - o / 2 / Math.tan(c)), u = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient"), u.setAttribute("id", a), u.setAttribute("gradientUnits", "userSpaceOnUse"), u.setAttribute("x1", String(Math.round(g))), u.setAttribute("y1", String(Math.round(b))), u.setAttribute("x2", String(Math.round(m))), u.setAttribute("y2", String(Math.round(w)));
      }
      e.colorStops.forEach(({ offset: c, color: p }) => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        g.setAttribute("offset", `${100 * c}%`), g.setAttribute("stop-color", p), u.appendChild(g);
      }), h.setAttribute("fill", `url('#${a}')`), this._defs.appendChild(u);
    } else
      t && h.setAttribute("fill", t);
    this._element.appendChild(h);
  }
}
const z = {
  canvas: "canvas",
  svg: "svg"
}, K = {};
for (let l = 0; l <= 40; l++)
  K[l] = l;
const gt = {
  L: "L",
  M: "M",
  Q: "Q",
  H: "H"
}, Y = {
  type: z.canvas,
  shape: P.square,
  width: 300,
  height: 300,
  data: "",
  margin: 0,
  qrOptions: {
    typeNumber: K[0],
    mode: void 0,
    errorCorrectionLevel: gt.Q
  },
  imageOptions: {
    hideBackgroundDots: !0,
    imageSize: 0.4,
    crossOrigin: void 0,
    margin: 0
  },
  dotsOptions: {
    type: "square",
    color: "#000"
  },
  backgroundOptions: {
    round: 0,
    color: "#fff"
  }
};
function E(l) {
  const e = { ...l };
  if (!e.colorStops || !e.colorStops.length)
    throw "Field 'colorStops' is required in gradient";
  return e.rotation ? e.rotation = Number(e.rotation) : e.rotation = 0, e.colorStops = e.colorStops.map((t) => ({
    ...t,
    offset: Number(t.offset)
  })), e;
}
function Z(l) {
  const e = { ...l };
  return e.width = Number(e.width), e.height = Number(e.height), e.margin = Number(e.margin), e.imageOptions = {
    ...e.imageOptions,
    hideBackgroundDots: !!e.imageOptions.hideBackgroundDots,
    imageSize: Number(e.imageOptions.imageSize),
    margin: Number(e.imageOptions.margin)
  }, e.margin > Math.min(e.width, e.height) && (e.margin = Math.min(e.width, e.height)), e.dotsOptions = {
    ...e.dotsOptions
  }, e.dotsOptions.gradient && (e.dotsOptions.gradient = E(e.dotsOptions.gradient)), e.cornersSquareOptions && (e.cornersSquareOptions = {
    ...e.cornersSquareOptions
  }, e.cornersSquareOptions.gradient && (e.cornersSquareOptions.gradient = E(e.cornersSquareOptions.gradient))), e.cornersDotOptions && (e.cornersDotOptions = {
    ...e.cornersDotOptions
  }, e.cornersDotOptions.gradient && (e.cornersDotOptions.gradient = E(e.cornersDotOptions.gradient))), e.backgroundOptions && (e.backgroundOptions = {
    ...e.backgroundOptions
  }, e.backgroundOptions.gradient && (e.backgroundOptions.gradient = E(e.backgroundOptions.gradient))), e;
}
class J {
  constructor(e) {
    this._options = e ? Z(k(Y, e)) : Y, this.update();
  }
  static _clearContainer(e) {
    e && (e.innerHTML = "");
  }
  _setupSvg() {
    if (!this._qr)
      return;
    const e = new pt(this._options);
    this._svg = e.getElement(), this._svgDrawingPromise = e.drawQR(this._qr).then(() => {
      var t;
      this._svg && ((t = this._extension) == null || t.call(this, e.getElement(), this._options));
    });
  }
  _setupCanvas() {
    var e;
    this._qr && (this._canvas = document.createElement("canvas"), this._canvas.width = this._options.width, this._canvas.height = this._options.height, this._setupSvg(), this._canvasDrawingPromise = (e = this._svgDrawingPromise) == null ? void 0 : e.then(() => {
      if (!this._svg)
        return;
      const t = this._svg, n = new XMLSerializer().serializeToString(t), s = "data:image/svg+xml;base64," + btoa(n), r = new Image();
      return new Promise((o) => {
        r.onload = () => {
          var a, d;
          (d = (a = this._canvas) == null ? void 0 : a.getContext("2d")) == null || d.drawImage(r, 0, 0), o();
        }, r.src = s;
      });
    }));
  }
  async _getElement(e = "png") {
    if (!this._qr)
      throw "QR code is empty";
    return e.toLowerCase() === "svg" ? ((!this._svg || !this._svgDrawingPromise) && this._setupSvg(), await this._svgDrawingPromise, this._svg) : ((!this._canvas || !this._canvasDrawingPromise) && this._setupCanvas(), await this._canvasDrawingPromise, this._canvas);
  }
  update(e) {
    J._clearContainer(this._container), this._options = e ? Z(k(this._options, e)) : this._options, this._options.data && (this._qr = W(this._options.qrOptions.typeNumber, this._options.qrOptions.errorCorrectionLevel), this._qr.addData(this._options.data, this._options.qrOptions.mode || tt(this._options.data)), this._qr.make(), this._options.type === z.canvas ? this._setupCanvas() : this._setupSvg(), this.append(this._container));
  }
  append(e) {
    if (e) {
      if (typeof e.appendChild != "function")
        throw "Container should be a single DOM node";
      this._options.type === z.canvas ? this._canvas && e.appendChild(this._canvas) : this._svg && e.appendChild(this._svg), this._container = e;
    }
  }
  applyExtension(e) {
    if (!e)
      throw "Extension function should be defined.";
    this._extension = e, this.update();
  }
  deleteExtension() {
    this._extension = void 0, this.update();
  }
  async getRawData(e = "png") {
    if (!this._qr)
      throw "QR code is empty";
    const t = await this._getElement(e);
    if (!t)
      return null;
    if (e.toLowerCase() === "svg") {
      const i = new XMLSerializer().serializeToString(t);
      return new Blob([`<?xml version="1.0" standalone="no"?>\r
` + i], { type: "image/svg+xml" });
    } else
      return new Promise((n) => t.toBlob(n, `image/${e}`, 1));
  }
  async download(e) {
    if (!this._qr)
      throw "QR code is empty";
    let t = "png", n = "qr";
    typeof e == "string" ? (t = e, console.warn(
      "Extension is deprecated as argument for 'download' method, please pass object { name: '...', extension: '...' } as argument"
    )) : typeof e == "object" && e !== null && (e.name && (n = e.name), e.extension && (t = e.extension));
    const i = await this._getElement(t);
    if (i)
      if (t.toLowerCase() === "svg") {
        let r = new XMLSerializer().serializeToString(i);
        r = `<?xml version="1.0" standalone="no"?>\r
` + r;
        const o = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(r);
        H(o, `${n}.svg`);
      } else {
        const s = i.toDataURL(`image/${t}`);
        H(s, `${n}.${t}`);
      }
  }
}
export {
  M as cornerDotTypes,
  y as cornerSquareTypes,
  J as default,
  A as dotTypes,
  z as drawTypes,
  gt as errorCorrectionLevels,
  it as errorCorrectionPercents,
  ut as gradientTypes,
  L as modes,
  K as qrTypes,
  P as shapeTypes
};

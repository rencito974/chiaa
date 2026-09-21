const REDUCIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.add("js");

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const esperar = ms => new Promise(r => setTimeout(r, ms));
const vibrar = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const PETALOS = [
   "M0 0 C -5.4 -4.2 -7.8 -13.2 -3.8 -22.4 C -2.2 -26 2.6 -26.2 4.4 -22.4 C 8.2 -13.8 5.6 -4.6 0 0 Z",
   "M0 0 C -4.2 -5 -5.6 -15 -2.6 -25.6 C -1.6 -29 1.4 -29 2.4 -25.6 C 5.4 -15 4 -5 0 0 Z",
   "M0 0 C -6.6 -4.6 -9 -12.6 -5.6 -20.6 C -4.4 -23.4 -2.4 -22.6 -1.2 -24.8 C -0.2 -22.4 2.4 -23.8 3.8 -21.2 C 7.4 -13.4 5.8 -5 0 0 Z",
   "M0 0 C -7.2 -3.6 -9.6 -11.4 -6.4 -18.8 C -4.2 -23.8 3.2 -24.4 5.8 -19.4 C 9 -13.2 6.6 -4 0 0 Z"
];

const ESPECIES = [
  { k: "margarita", n: [11, 14], esc: [1.00, 1.14], forma: [0, 2], disco: 5.4, puntos: 40, sube: 0 },
  { k: "girasol",   n: [15, 18], esc: [1.18, 1.34], forma: [1, 2], disco: 8.2, puntos: 58, sube: 2 },
  { k: "manzanilla",n: [8, 10],  esc: [0.66, 0.78], forma: [0, 3], disco: 4.6, puntos: 26, sube: -3 },
  { k: "ranunculo", n: [12, 16], esc: [0.74, 0.86], forma: [3, 0], disco: 2.6, puntos: 14, sube: 1 }
];

function corona(rand, esp, cant, escala, color, rot0, dx, dy, claseExtra) {
  let out = "";
  for (let i = 0; i < cant; i++) {
    const a = rot0 + (360 / cant) * i + (rand() - .5) * 13;
    const sx = (0.90 + rand() * 0.22) * escala;
    const sy = (0.86 + rand() * 0.28) * escala;
    const forma = PETALOS[esp.forma[i % esp.forma.length]];
    out += '<g class="pr" style="transform:rotate(' + a.toFixed(1) + 'deg)">' +
             '<g class="pb' + (claseExtra ? ' ' + claseExtra : '') + '" style="--pd:' + (i * 24) + 'ms;transform:scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')">' +
               '<path d="' + forma + '" fill="' + color + '" transform="translate(' + dx + ',' + dy + ')"/>' +
             '</g>' +
           '</g>';
  }
  return out;
}

function disco(rand, esp) {
  let out = '<circle r="' + esp.disco + '" fill="var(--centro)"/>';
  for (let i = 0; i < esp.puntos; i++) {
    const ang = i * 2.39996;
    const rad = (esp.disco * 0.95 / Math.sqrt(esp.puntos)) * Math.sqrt(i);
    const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad;
    const r = 0.62 + rand() * 0.4;
    out += '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + r.toFixed(2) +
           '" fill="' + (i % 2 ? "var(--centro-os)" : "var(--centro-cl)") + '"/>';
  }
  return out;
}

function cabeza(rand, esp, animada) {
  const cant = Math.round(esp.n[0] + rand() * (esp.n[1] - esp.n[0]));
  const escala = esp.esc[0] + rand() * (esp.esc[1] - esp.esc[0]);
  const paso = 360 / cant / 2;
  let out = "";

  out += corona(mulberry(Math.floor(rand() * 1e6)), esp, cant, escala * 0.94, "var(--f-os)", paso, 1.7, 1.3, "");
  out += corona(mulberry(Math.floor(rand() * 1e6)), esp, cant, escala, "var(--f-sol)", 0, 0, 0, "");

  const r3 = mulberry(Math.floor(rand() * 1e6));
  for (let i = 0; i < 4; i++) {
    const a = r3() * 360;
    out += '<g class="pr" style="transform:rotate(' + a.toFixed(1) + 'deg)">' +
             '<g class="pb" style="--pd:' + (220 + i * 24) + 'ms;transform:scale(.62)">' +
               '<path d="' + PETALOS[0] + '" fill="var(--f-cl)"/>' +
             '</g></g>';
  }
  out += '<g class="disco">' + disco(rand, esp) + '</g>';
  return out;
}

function hojaPath(lado) {
  return lado < 0
    ? "M0 0 C -13 -3 -19 -12 -17 -20 C -7 -18 -1 -9 0 0 Z"
    : "M0 0 C 13 -3 19 -12 17 -20 C 7 -18 1 -9 0 0 Z";
}

let el_tinta = ["var(--sol)", "var(--sol-os)", "var(--sol-cl)"];
function crearFlor(o) {
  o = o || {};
  const semilla = o.semilla == null ? Math.floor(Math.random() * 1e6) : o.semilla;
  const rand = mulberry(semilla);
  const esp = ESPECIES[o.especie == null ? Math.floor(rand() * ESPECIES.length) : o.especie % ESPECIES.length];
  const alto = o.alto || 150;
  const planta = o.modo === "planta";

  const esPatito = rand() < (typeof TEXTOS !== "undefined" ? TEXTOS.patito : .45);
  el_tinta = esPatito
    ? ["var(--patito)", "var(--patito-os)", "var(--patito-cl)"]
    : ["var(--sol)", "var(--sol-os)", "var(--sol-cl)"];

  const bend = (rand() - .5) * 11;
  const lean = (rand() - .5) * 7;
  const cy = 44 + esp.sube;
  const tallo = "M32 200 C " + (32 + bend).toFixed(1) + " 150 " + (32 - bend).toFixed(1) + " 96 32 " + (cy + 8);

  const el = document.createElement("div");
  el.className = planta ? "planta" : "flower";
  el.style.width = (alto * 0.42) + "px";
  el.style.height = alto + "px";
  el.style.setProperty("--sway", (5 + rand() * 3.4).toFixed(2) + "s");
  el.style.setProperty("--swayd", (-rand() * 4).toFixed(2) + "s");
  el.dataset.semilla = semilla;
  el.style.setProperty("--f-sol", el_tinta[0]);
  el.style.setProperty("--f-os", el_tinta[1]);
  el.style.setProperty("--f-cl", el_tinta[2]);

  const cuerpo =
    '<path class="tallo" stroke-width="' + (2.4 + rand() * 1.2).toFixed(1) + '" d="' + tallo + '"/>' +
    '<g class="hoja-i" transform="translate(30,' + (128 + rand() * 18).toFixed(0) + ')"><path class="hoja" d="' + hojaPath(-1) + '"/></g>' +
    '<g class="hoja-d" transform="translate(34,' + (96 + rand() * 18).toFixed(0) + ')"><path class="hoja" d="' + hojaPath(1) + '"/></g>';

  const cabezaG =
    '<g transform="translate(32,' + cy + ')">' +
      '<g class="capullo"><path d="M0 6 C -7 2 -8 -8 -4 -14 C -1.4 -17.6 1.4 -17.6 4 -14 C 8 -8 7 2 0 6 Z" fill="var(--pasto-os)"/></g>' +
      '<g class="corola">' + cabeza(rand, esp, planta) + '</g>' +
    '</g>';

  const sombrita = '<ellipse class="sombrita" cx="' + (32 + 9).toFixed(0) + '" cy="198" rx="' + (12 + alto * .03).toFixed(0) + '" ry="2.6"/>';

  if (planta) {
    el.innerHTML =
      '<svg viewBox="0 0 64 200" width="100%" height="100%" aria-hidden="true" style="transform:rotate(' + lean.toFixed(1) + 'deg)">' +
        sombrita +
        '<g class="monton"><path d="M14 200 C 18 190 46 190 50 200 Z" fill="var(--terron)"/></g>' +
        '<g class="brote" transform="translate(32,196)">' +
          '<path d="M0 0 C -1 -6 -1 -10 0 -13" fill="none" stroke="var(--pasto)" stroke-width="2.2" stroke-linecap="round"/>' +
          '<path d="M0 -12 C -8 -13 -10 -20 -3.4 -21.6 C .6 -22.4 1.6 -16 0 -12 Z" fill="var(--pasto-cl)"/>' +
          '<path d="M0 -12 C 8 -13 10 -20 3.4 -21.6 C -.6 -22.4 -1.6 -16 0 -12 Z" fill="var(--pasto)"/>' +
        '</g>' +
        '<g class="cuerpo">' + cuerpo + cabezaG + '</g>' +
        '<circle class="tocar" cx="32" cy="' + cy + '" r="30"/>' +
      '</svg>';
  } else {
    el.innerHTML =
      '<svg viewBox="0 0 64 200" width="100%" height="100%" aria-hidden="true" style="transform:rotate(' + lean.toFixed(1) + 'deg)">' +
        sombrita + cuerpo + cabezaG +
      '</svg>';

    $$(".corola", el).forEach(g => { g.style.transform = "scale(1)"; });
  }
  return el;
}

const esc = t => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

function esElDia(dia) {
  if (!dia) return true;
  const p = String(dia).split("-");
  if (p.length !== 2) return true;
  const h = new Date();
  return (h.getMonth() + 1) === +p[0] && h.getDate() === +p[1];
}

function pintarTextos() {
  const T = TEXTOS;
  const C = T.cuando || {};
  const elDia = esElDia(C.dia);
  const otro = (alterno, normal) => (!elDia && alterno) ? alterno : normal;
  try { document.title = T.pestana; } catch (e) {}

  $("#tag-fecha").textContent = otro(C.p1arriba, T.p1.arriba);
  $("#t-titulo").innerHTML = T.p1.titulo.map(esc).join("<br>");
  const pre = $("#t-prefijo");
  pre.textContent = T.p1.prefijo || "";
  pre.hidden = !T.p1.prefijo;
  $("#nombre").textContent = T.p1.nombre;
  $("#t-tira").textContent = T.p1.tira;
  $("#t-sobre-arriba").textContent = T.p1.sobreArriba;
  $("#t-sobre-titulo").textContent = T.p1.sobreTitulo;
  $("#t-sobre-abajo").textContent = T.p1.sobreAbajo;
  $("#t-sobre-fecha").textContent = T.p1.sobreFecha;
  $("#ir-carta").textContent = T.p1.boton;
  document.querySelector(".sobrecito").setAttribute("aria-label", T.p1.tira);

  $("#carta-fecha").textContent = otro(C.p2fecha, T.p2.fecha);
  const parrafos = T.p2.parrafos.slice();
  if (!elDia && C.p2primerParrafo) parrafos[0] = C.p2primerParrafo;
  $("#carta-cuerpo").innerHTML = parrafos.map(t => "<p>" + esc(t) + "</p>").join("");
  $("#carta-firma").textContent = T.p2.firma;
  $("#ir-ramo").textContent = T.p2.boton;

  $("#t-ramo-arriba").textContent = T.p3.arriba;
  $("#t-ramo-titulo").innerHTML = T.p3.titulo.map(esc).join("<br>");

  $("#t-campo-arriba").textContent = T.p4.arriba;
  $("#t-campo-titulo").textContent = T.p4.titulo;
  $("#lede-campo").innerHTML = T.p4.lede.map(esc).join("<br>");
  $("#t-sc-titulo").textContent = T.p1.sobreTitulo;
  $("#t-etiqueta-1").textContent = T.p4.etiqueta[0];
  $("#etiqueta-firma").textContent = T.p2.firma;
  $("#etiqueta-desde").textContent = T.p4.etiqueta[1];
}

pintarTextos();

(function floresDecorativas() {
  const f1 = crearFlor({ semilla: 7712, alto: 138, especie: 0 });
  $(".sobre-ilu").appendChild(f1);
  const f2 = crearFlor({ semilla: 3391, alto: 152, especie: 1 });
  $("#carta-flor").appendChild(f2);
})();

const cv = $("#petalos"), ctx = cv.getContext("2d");
let W = 0, H = 0, DPR = 1, corriendo = false, ultimo = 0;
const parts = [];
const SPRITES = [];
const TONOS = ["#FFC400", "#FFE04D", "#E28C00"];

function hacerSprites() {
  SPRITES.length = 0;
  for (let i = 0; i < TONOS.length; i++) {
    const s = document.createElement("canvas");
    s.width = 20; s.height = 26;
    const c = s.getContext("2d");
    c.fillStyle = TONOS[i];
    c.beginPath();
    c.moveTo(10, 25);
    c.bezierCurveTo(1, 19, 0, 7, 6, 1);
    c.bezierCurveTo(10, -1, 14, 1, 16, 5);
    c.bezierCurveTo(20, 12, 17, 21, 10, 25);
    c.fill();
    SPRITES.push(s);
  }
}

function medir() {
  DPR = Math.min(window.devicePixelRatio || 1, 1.5);

  W = document.documentElement.clientWidth;
  H = document.documentElement.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function petaloAire(x, y) {
  return { t: 0, x: x, y: y, r: 6 + Math.random() * 5, vy: 16 + Math.random() * 22,
           vx: rnd(-10, 10), rot: rnd(0, 6.28), vr: rnd(-1.2, 1.2),
           fase: rnd(0, 6.28), amp: rnd(6, 20), sp: (Math.random() * SPRITES.length) | 0, a: rnd(.5, .95), g: 0 };
}
function terron(x, y) {
  return { t: 1, x: x, y: y, r: 2 + Math.random() * 2.2, vy: rnd(-46, -14), vx: rnd(-34, 34),
           rot: 0, vr: 0, fase: 0, amp: 0, sp: 0, a: .9, g: 190 };
}

function soltarPetalos(x, y, n) {
  if (REDUCIDO) return;
  for (let i = 0; i < n; i++) parts.push(petaloAire(x + rnd(-14, 14), y + rnd(-10, 10)));
  arrancar();
}
function soltarTierra(x, y, n) {
  if (REDUCIDO) return;
  for (let i = 0; i < n; i++) parts.push(terron(x, y));
  arrancar();
}

function ambiente() {
  if (REDUCIDO) return;
  const n = W < 480 ? 9 : 16;
  for (let i = 0; i < n; i++) {
    const p = petaloAire(rnd(0, W), rnd(-H, H));
    p.a *= .7;
    parts.push(p);
  }
}

function cuadro(t) {
  if (!corriendo) return;
  const dt = Math.min((t - ultimo) / 1000 || 0, .05);
  ultimo = t;
  ctx.clearRect(0, 0, W, H);
  if (!parts.length) { corriendo = false; return; }

  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.vy += p.g * dt;
    p.y += p.vy * dt;
    p.fase += dt * 1.6;
    p.x += (p.vx + Math.sin(p.fase) * p.amp) * dt;
    p.rot += p.vr * dt;
    if (p.g) p.a -= dt * 1.5;

    if (p.y - 20 > H || p.a <= 0) {
      if (p.t === 1 || parts.length > 26) { parts.splice(i, 1); continue; }
      Object.assign(p, petaloAire(rnd(0, W), -20)); p.a *= .7;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, p.a);
    if (p.t === 1) {
      ctx.fillStyle = "#6B4B23";
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
    } else {
      const s = SPRITES[p.sp], k = p.r / 13;
      ctx.drawImage(s, -10 * k, -13 * k, 20 * k, 26 * k);
    }
    ctx.restore();
  }
  requestAnimationFrame(cuadro);
}

function arrancar() {
  if (corriendo || REDUCIDO) return;
  corriendo = true; ultimo = performance.now();
  requestAnimationFrame(cuadro);
}

hacerSprites(); medir(); ambiente(); arrancar();

let tmr, anchoPrev = document.documentElement.clientWidth;
addEventListener("resize", () => {

  const w = document.documentElement.clientWidth;
  if (w === anchoPrev) return;
  anchoPrev = w;
  clearTimeout(tmr);
  tmr = setTimeout(medir, 200);
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) arrancar(); else corriendo = false; });

const sobrecito = $("#sobrecito");
let abierto = false;

function abrirSobre() {
  if (abierto) return;
  abierto = true;
  vibrar(8);
  sobrecito.classList.add("abierto");
  sobrecito.setAttribute("aria-label", "Sobrecito abierto");
  const r = sobrecito.getBoundingClientRect();
  setTimeout(() => {
    soltarTierra(r.left + r.width / 2, r.top + 26, 10);
    soltarPetalos(r.left + r.width / 2, r.top + 30, 9);
  }, 90);
  setTimeout(() => {
    const b = $("#ir-carta");
    b.hidden = false;
    $("#post-sobre").classList.add("on");
  }, 700);
}
sobrecito.addEventListener("click", abrirSobre);

$("#ir-carta").addEventListener("click", () => {
  $("#a2").scrollIntoView({ behavior: REDUCIDO ? "auto" : "smooth", block: "start" });
});
$("#ir-ramo").addEventListener("click", () => {
  $("#a3").scrollIntoView({ behavior: REDUCIDO ? "auto" : "smooth", block: "start" });
});

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(e => {
    if (e[0].isIntersecting) { abrirSobre(); io.disconnect(); }
  }, { threshold: .25 });
  io.observe($("#a2"));
}

const ramo = $("#ramo");
const notitaEl = $("#notita span");
const botonMas = $("#una-mas");
const LLAVE_RAMO = "fa-ramo-v2";
const TOPE_RAMO = 46;

let varas = [];
let mazoNotas = [];
let notasUsadas = 0;
let proximaNota = 3;

for (let b = 0; b < 3; b++) {
  const banda = document.createElement("div");
  banda.className = "banda banda-" + b;
  ramo.appendChild(banda);
}
const bandas = $$(".banda", ramo);

const cinta = document.createElementNS("http://www.w3.org/2000/svg", "svg");
cinta.setAttribute("class", "cinta");
cinta.setAttribute("viewBox", "0 0 108 64");
cinta.setAttribute("aria-hidden", "true");
cinta.innerHTML =
  '<path d="M54 26 C 36 10 12 16 20 30 C 12 44 38 44 54 30 Z" fill="var(--tomate)"/>' +
  '<path d="M54 26 C 72 10 96 16 88 30 C 96 44 70 44 54 30 Z" fill="var(--tomate)"/>' +
  '<path d="M50 32 C 42 44 36 54 30 62" stroke="var(--tomate)" stroke-width="7" fill="none" stroke-linecap="round"/>' +
  '<path d="M58 32 C 66 44 72 54 78 62" stroke="var(--tomate)" stroke-width="7" fill="none" stroke-linecap="round"/>' +
  '<circle cx="54" cy="29" r="7" fill="var(--sol-cl)" stroke="var(--tinta)" stroke-width="1.4"/>';
ramo.appendChild(cinta);

function barajarNotas() {
  mazoNotas = TEXTOS.p3.notas.slice();
  for (let i = mazoNotas.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const t = mazoNotas[i]; mazoNotas[i] = mazoNotas[j]; mazoNotas[j] = t;
  }
}
barajarNotas();

let notaTmr;
function mostrarNota() {
  if (!mazoNotas.length) return;
  const txt = mazoNotas.shift();
  notasUsadas++;
  clearTimeout(notaTmr);
  notitaEl.classList.remove("on");
  setTimeout(() => {
    notitaEl.textContent = txt;
    notitaEl.classList.add("on");
    notaTmr = setTimeout(() => notitaEl.classList.remove("on"), 3400);
  }, 180);
}

function acomodarRamo() {
  const n = varas.length;
  const spread = Math.min(44, 12 + n * 2.6);
  varas.forEach((v, i) => {
    const ang = n === 1 ? 0 : -spread / 2 + spread * (i / (n - 1));
    const rank = i % 4;
    const esc = [1, .90, .81, .74][rank];
    const dy = [0, -12, -22, -30][rank];
    v.style.transform = "translateX(-50%) rotate(" + ang.toFixed(1) + "deg) translateY(" + dy + "px) scale(" + esc + ")";
    v.style.zIndex = String(40 - rank * 8);
  });
  const z = clamp(1 - Math.max(0, n - 24) * 0.009, .6, 1);
  ramo.style.transform = "translateX(-12%) scale(" + z.toFixed(3) + ")";
}

function agregarFlor(semilla, silenciosa) {
  if (varas.length >= TOPE_RAMO) {

    const vieja = varas.shift();
    vieja.remove();
  }
  const s = semilla == null ? Math.floor(Math.random() * 1e6) : semilla;
  const i = varas.length;
  const alto = 300 + (i % 5) * 18;
  const vara = document.createElement("div");
  vara.className = "vara";
  vara.style.width = (alto * .42) + "px";
  vara.appendChild(crearFlor({ semilla: s, alto: alto }));
  bandas[i % 3].appendChild(vara);
  varas.push(vara);
  acomodarRamo();
  requestAnimationFrame(() => vara.classList.add("entrada"));

  if (!silenciosa) {
    guardarRamo();
    if (varas.length >= proximaNota && varas.length >= 3) {
      proximaNota = varas.length + 3 + ((Math.random() * 3) | 0);
      mostrarNota();
    }
  }
  return vara;
}

function guardarRamo() {
  try {
    localStorage.setItem(LLAVE_RAMO, JSON.stringify(varas.map(v => Number($(".flower", v).dataset.semilla))));
  } catch (e) {}
}

(function restaurarRamo() {
  let semillas = null;
  try {
    const raw = localStorage.getItem(LLAVE_RAMO);
    if (raw) semillas = JSON.parse(raw);
  } catch (e) {}
  if (!semillas || !semillas.length) semillas = null;
  const base = semillas || Array.from({ length: 9 }, () => Math.floor(Math.random() * 1e6));
  base.slice(0, TOPE_RAMO).forEach((s, i) => {
    setTimeout(() => agregarFlor(s, true), REDUCIDO ? 0 : i * 55);
  });
  if (!semillas) setTimeout(guardarRamo, 900);
})();

function etiquetaBoton() {
  let t = TEXTOS.p3.boton[0][1];
  for (const [n, s] of TEXTOS.p3.boton) if (varas.length >= n) t = s;
  if (botonMas.firstChild) botonMas.textContent = t;
}

let repite = null, acelera = 420, dedoBoton = null;
function pararRepeticion() { clearTimeout(repite); repite = null; dedoBoton = null; }
function unaMas() {
  const r = botonMas.getBoundingClientRect();
  vibrar(6);
  agregarFlor();
  etiquetaBoton();
  soltarPetalos(r.left + r.width / 2, r.top, 3);
}
botonMas.addEventListener("click", unaMas);
botonMas.addEventListener("pointerdown", ev => {
  if (dedoBoton !== null) return;
  dedoBoton = ev.pointerId;
  clearTimeout(repite);
  acelera = 420;
  repite = setTimeout(function paso() {
    unaMas();
    acelera = Math.max(200, acelera - 40);
    repite = setTimeout(paso, acelera);
  }, 500);
});
["pointerup", "pointerleave", "pointercancel"].forEach(ev =>
  botonMas.addEventListener(ev, pararRepeticion));
addEventListener("blur", pararRepeticion);
document.addEventListener("visibilitychange", () => { if (document.hidden) pararRepeticion(); });

const cantero = $("#cantero");
const tierra = $("#tierra");
const capa = $("#capa-plantas");
const estado = $("#estado");
const LLAVE = "fa-cantero-v2";
const SUELO = 104;
const TOPE_CANTERO = 40;
cantero.style.setProperty("--suelo", SUELO + "px");

const ALA_MARIPOSA =
  '<svg viewBox="-12 -10 24 20" aria-hidden="true">' +
    '<path d="M0 0 C -4 -9 -11 -10 -11 -4 C -11 1 -5 3 0 0 Z" fill="var(--sol)"/>' +
    '<path d="M0 0 C 4 -9 11 -10 11 -4 C 11 1 5 3 0 0 Z" fill="var(--sol)"/>' +
    '<path d="M0 0 C -3 5 -7 6 -8 3 C -8.6 1 -4 -.6 0 0 Z" fill="var(--sol-os)" opacity=".85"/>' +
    '<path d="M0 0 C 3 5 7 6 8 3 C 8.6 1 4 -.6 0 0 Z" fill="var(--sol-os)" opacity=".85"/>' +
    '<ellipse cx="0" cy="-1" rx="1.3" ry="4" fill="var(--tinta)"/>' +
  '</svg>';

let primerToque = true;

function tocarFlor(pl) {
  if (!pl || pl.dataset.tocando === "1") return;
  pl.dataset.tocando = "1";
  vibrar(6);

  pl.classList.remove("sacudida");
  void pl.offsetWidth;
  pl.classList.add("sacudida");

  const c = pl.querySelector(".tocar").getBoundingClientRect();
  soltarPetalos(c.left + c.width / 2, c.top + c.height * .4, 3);

  const merece = primerToque || Math.random() < .28;
  primerToque = false;

  if (!REDUCIDO && merece && !pl.querySelector(".visita")) {
    const m = document.createElement("span");
    m.className = "visita";
    m.innerHTML = ALA_MARIPOSA;
    pl.appendChild(m);
    setTimeout(() => m.remove(), 6400);
  }
  setTimeout(() => { pl.dataset.tocando = ""; }, 760);
}

(function dibujarPaisaje() {
  const r = mulberry(4821);

  function nube(x, y, e) {
    const b = [[0, 0, 22, 11], [16, -4, 17, 9], [-15, -2, 15, 8], [30, 2, 13, 7], [-28, 3, 12, 6]];
    return '<g transform="translate(' + x + ',' + y + ') scale(' + e + ',' + (e * .72) + ')" fill="#FFFDF6" opacity=".92">' +
      b.map(c => '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '"/>').join('') +
      '</g>';
  }

  function arbolLejos(x, y, e, color) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + e + ')" fill="' + color + '">' +
      '<rect x="-1" y="-4" width="2" height="6"/>' +
      '<ellipse cx="0" cy="-8" rx="5.4" ry="6"/>' +
      '<ellipse cx="-3.4" cy="-5" rx="3.6" ry="4"/>' +
      '<ellipse cx="3.4" cy="-5.4" rx="3.4" ry="3.8"/>' +
      '</g>';
  }

  let nubes = nube(74, 34, 1) + nube(268, 22, .78) + nube(352, 52, .62) + nube(168, 62, .5);

  let atras = "";
  for (let i = 0; i < 40; i++) {
    const x = (i / 39) * 400 + (r() - .5) * 11, h = 5 + r() * 8, l = (r() - .5) * 6;
    atras += '<path d="M' + x.toFixed(1) + ' 178 Q ' + (x + l * .5).toFixed(1) + ' ' +
             (178 - h * .7).toFixed(1) + ' ' + (x + l).toFixed(1) + ' ' + (178 - h).toFixed(1) + '"/>';
  }

  $("#paisaje").innerHTML =
    '<defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#B7D8E8"/><stop offset=".62" stop-color="#DCEBEA"/>' +
      '<stop offset="1" stop-color="#EDF3E3"/>' +
    '</linearGradient></defs>' +
    '<rect x="0" y="0" width="400" height="140" fill="url(#cielo)"/>' +
    nubes +

    '<path d="M0 126 C 58 112 104 130 168 122 C 232 114 286 130 400 118 L400 210 L0 210 Z" fill="#B9D883"/>' +

    '<path d="M0 142 C 70 130 128 150 206 141 C 276 133 330 148 400 138 L400 210 L0 210 Z" fill="var(--pasto-cl)"/>' +

    '<path d="M0 166 C 84 155 150 176 240 165 C 310 157 360 170 400 163 L400 210 L0 210 Z" fill="#7CB44B"/>' +
    '<g stroke="var(--pasto)" stroke-width="1.6" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".7">' + atras + '</g>';

  function arbol(tipo, rr) {
    const copasPorTipo = {
      redondo: [[0, -46, 26, 24], [-19, -34, 18, 16], [19, -36, 17, 15], [-7, -60, 17, 14], [10, -58, 15, 13]],
      alto:    [[0, -58, 15, 30], [-8, -34, 13, 18], [9, -38, 12, 16], [0, -80, 11, 13]],
      ancho:   [[0, -38, 32, 17], [-25, -30, 17, 12], [25, -32, 16, 11], [-9, -50, 18, 12], [12, -49, 17, 11]]
    };
    const copas = copasPorTipo[tipo];
    const tronco = tipo === "alto"
      ? '<path d="M-3 0 C -2.4 -22 -2 -40 -1.4 -56 L1.4 -56 C 2 -40 2.4 -22 3 0 Z" fill="#6B4A2C"/>'
      : '<path d="M-4.4 0 C -3.6 -14 -3 -24 -2.6 -34 L2.6 -34 C 3 -24 3.6 -14 4.4 0 Z" fill="#6B4A2C"/>' +
        '<path d="M-2 -26 C -8 -30 -12 -34 -15 -39" stroke="#6B4A2C" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
        '<path d="M2 -29 C 7 -33 11 -36 14 -40" stroke="#6B4A2C" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
    const capa = (dx, dy, fill, op) => '<g transform="translate(' + dx + ',' + dy + ')" fill="' + fill + '"' + (op ? ' opacity="' + op + '"' : '') + '>' +
      copas.map(c => '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '"/>').join('') + '</g>';

    let luz = "";
    for (let i = 0; i < 7; i++) {
      const c = copas[(rr() * copas.length) | 0];
      luz += '<ellipse cx="' + (c[0] + (rr() - .5) * c[2] * 1.1).toFixed(1) + '" cy="' + (c[1] - rr() * c[3] * .7).toFixed(1) +
             '" rx="' + (2 + rr() * 3.4).toFixed(1) + '" ry="' + (1.6 + rr() * 2.4).toFixed(1) + '" fill="var(--pasto-cl)" opacity=".55"/>';
    }
    return tronco + capa(2.4, 2, "var(--pasto-os)") + capa(0, 0, "var(--hoja)") + luz;
  }

  function arbusto(rr) {
    return '<g fill="#4E8340" transform="translate(1.6,1.4)">' +
             '<ellipse cx="0" cy="-11" rx="17" ry="12"/><ellipse cx="-12" cy="-6" rx="11" ry="8"/><ellipse cx="12" cy="-7" rx="10" ry="8"/>' +
           '</g>' +
           '<g fill="#74AE55">' +
             '<ellipse cx="0" cy="-11" rx="17" ry="12"/><ellipse cx="-12" cy="-6" rx="11" ry="8"/><ellipse cx="12" cy="-7" rx="10" ry="8"/>' +
           '</g>' +
           '<ellipse cx="-4" cy="-17" rx="6" ry="4" fill="var(--pasto-cl)" opacity=".75"/>';
  }

  const escena = $("#escena");

  function pieza(left, bottom, alto, ratio, svg, clase) {
    const d = document.createElement("div");
    d.className = "pieza" + (clase ? " " + clase : "");
    d.style.left = left + "%";
    d.style.bottom = bottom + "%";
    d.style.height = alto + "%";
    d.style.aspectRatio = String(ratio);
    d.innerHTML = svg;
    escena.appendChild(d);
    return d;
  }

  pieza(88, 68, 13, 1, '<svg viewBox="-12 -12 24 24" aria-hidden="true"><circle r="10.5" fill="#FFE9A3"/><circle r="7.6" fill="#FFF3C9"/></svg>', "sol");

  [[18, 78, 3.4], [26, 82, 2.6], [33, 76, 2.2]].forEach(p =>
    pieza(p[0], p[1], p[2], 2,
      '<svg viewBox="-10 -5 20 10" aria-hidden="true"><path d="M-9 2 C -5 -3 -2 -3 0 0 C 2 -3 5 -3 9 2" fill="none" stroke="#7E9A86" stroke-width="1.5" stroke-linecap="round"/></svg>'));

  const lejos = [[4, 27, 9], [13, 28, 7], [21, 27, 10], [31, 28.5, 6.5], [39, 27.5, 8.5],
                 [56, 28, 7.5], [65, 27, 9.5], [74, 28.5, 6.8], [84, 27.5, 8.8], [95, 28, 7.2]];
  lejos.forEach(t => pieza(t[0], t[1], t[2], .8,
    '<svg viewBox="-8 -18 16 20" aria-hidden="true">' + arbolLejos(0, 0, 1.4, "#84B25E") + '</svg>'));

  /* [izquierda %, base %, ALTO %, tipo] — el alto manda: en una pantalla ancha
     los árboles no se agigantan, solo se separan */
  [[5, 12, 41, "redondo"], [20, 17, 31, "alto"], [81, 14, 36, "ancho"],
   [96, 10, 46, "redondo"], [44, 19, 26, "alto"], [66, 16, 28, "redondo"]]
    .forEach(a => pieza(a[0], a[1], a[2], .8,
      '<svg viewBox="-40 -96 80 100" aria-hidden="true">' + arbol(a[3], r) + '</svg>'));

  /* arbustos: chicos, claros y afuera de la zona donde ella planta */
  [[7, 8, 9], [29, 7, 7], [73, 7.5, 8], [93, 6.5, 7.5]].forEach(b =>
    pieza(b[0], b[1], b[2], 44 / 28, '<svg viewBox="-22 -26 44 28" aria-hidden="true">' + arbusto(r) + '</svg>'));

  if (!REDUCIDO) {
    [["var(--sol)", 26, 34, "0s"], ["var(--patito)", 68, 45, "-5.4s"]].forEach(m => {
      const d = document.createElement("div");
      d.className = "pieza mariposa";
      d.style.left = m[1] + "%";
      d.style.bottom = m[2] + "%";
      d.style.height = "5%";
      d.style.aspectRatio = "1.2";
      d.style.animationDelay = m[3];
      d.innerHTML = '<svg viewBox="-12 -10 24 20" aria-hidden="true">' +
        '<path d="M0 0 C -4 -9 -11 -10 -11 -4 C -11 1 -5 3 0 0 Z" fill="' + m[0] + '"/>' +
        '<path d="M0 0 C 4 -9 11 -10 11 -4 C 11 1 5 3 0 0 Z" fill="' + m[0] + '"/>' +
        '<path d="M0 0 C -3 5 -7 6 -8 3 C -8.6 1 -4 -.6 0 0 Z" fill="var(--sol-os)" opacity=".85"/>' +
        '<path d="M0 0 C 3 5 7 6 8 3 C 8.6 1 4 -.6 0 0 Z" fill="var(--sol-os)" opacity=".85"/>' +
        '<ellipse cx="0" cy="-1" rx="1.3" ry="4" fill="var(--tinta)"/>' +
        '</svg>';
      escena.appendChild(d);
    });
  }

  let finas = "", llenas = "", tallos = "", florcitas = "";
  for (let i = 0; i < 96; i++) {
    const x = (i / 95) * 400 + (r() - .5) * 8;
    const h = 14 + r() * 30;
    const l = (r() - .5) * 12;
    finas += '<path d="M' + x.toFixed(1) + ' 70 C ' + (x + l * .25).toFixed(1) + ' ' + (70 - h * .5).toFixed(1) +
             ' ' + (x + l * .7).toFixed(1) + ' ' + (70 - h * .8).toFixed(1) + ' ' + (x + l).toFixed(1) + ' ' + (70 - h).toFixed(1) + '"/>';
  }

  for (let i = 0; i < 40; i++) {
    const x = 4 + r() * 392, h = 20 + r() * 34, l = (r() - .5) * 16, an = 1.8 + r() * 1.6;
    llenas += '<path d="M' + (x - an).toFixed(1) + ' 70 C ' + (x - an * .6 + l * .3).toFixed(1) + ' ' + (70 - h * .55).toFixed(1) +
              ' ' + (x - an * .3 + l * .8).toFixed(1) + ' ' + (70 - h * .85).toFixed(1) + ' ' + (x + l).toFixed(1) + ' ' + (70 - h).toFixed(1) +
              ' C ' + (x + an * .4 + l * .8).toFixed(1) + ' ' + (70 - h * .8).toFixed(1) +
              ' ' + (x + an).toFixed(1) + ' ' + (70 - h * .4).toFixed(1) + ' ' + (x + an).toFixed(1) + ' 70 Z"/>';
  }

  for (let i = 0; i < 7; i++) {
    const x = 10 + r() * 380, h = 38 + r() * 20, l = (r() - .5) * 14;
    tallos += '<g><path d="M' + x.toFixed(1) + ' 70 C ' + (x + l * .4).toFixed(1) + ' ' + (70 - h * .6).toFixed(1) +
              ' ' + (x + l * .8).toFixed(1) + ' ' + (70 - h * .9).toFixed(1) + ' ' + (x + l).toFixed(1) + ' ' + (70 - h).toFixed(1) +
              '" stroke="var(--pasto-os)" stroke-width="1.4" fill="none" vector-effect="non-scaling-stroke"/>' +
              '<ellipse cx="' + (x + l).toFixed(1) + '" cy="' + (70 - h - 3).toFixed(1) + '" rx="1.5" ry="5" fill="#B9A876"/></g>';
  }

  for (let i = 0; i < 20; i++) {
    const x = 8 + r() * 384, h = 12 + r() * 16;
    const col = r() < .45 ? "#FFF7D8" : (r() < .5 ? "var(--patito-cl)" : "#F6E9CE");
    florcitas += '<g><path d="M' + x.toFixed(1) + ' 70 L' + x.toFixed(1) + ' ' + (70 - h).toFixed(1) +
                 '" stroke="var(--pasto-os)" stroke-width="1" fill="none" vector-effect="non-scaling-stroke" opacity=".8"/>' +
                 '<circle cx="' + x.toFixed(1) + '" cy="' + (70 - h - 2).toFixed(1) + '" r="3.1" fill="' + col + '"/>' +
                 '<circle cx="' + x.toFixed(1) + '" cy="' + (70 - h - 2).toFixed(1) + '" r=".9" fill="var(--sol-os)"/></g>';
  }

  $("#pastofr").innerHTML =
    '<path d="M0 50 C 70 42 130 58 210 50 C 284 43 340 56 400 48 L400 70 L0 70 Z" fill="var(--pasto)"/>' +
    '<g fill="var(--pasto-os)" opacity=".92">' + llenas + '</g>' +
    '<g stroke="#3B6B31" stroke-width="2.4" fill="none" stroke-linecap="round" vector-effect="non-scaling-stroke">' + finas + '</g>' +
    tallos + florcitas;

  let terrones = "";
  for (let i = 0; i < 20; i++) {
    const x = r() * 400, y = 26 + r() * 78;
    terrones += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (2.2 + r() * 4.4).toFixed(1) +
                '" ry="' + (1.4 + r() * 2.2).toFixed(1) + '" fill="' + (i % 2 ? "var(--tierra-os)" : "var(--terron)") + '" opacity=".5"/>';
  }
  $("#suelo-svg").innerHTML =
    '<path d="M0 14 C 44 7 86 19 148 13 C 208 7 252 20 312 13 C 348 9 378 16 400 12 L400 116 L0 116 Z" fill="var(--tierra)"/>' +
    '<path d="M0 14 C 44 7 86 19 148 13 C 208 7 252 20 312 13 C 348 9 378 16 400 12" fill="none" stroke="var(--tierra-os)" stroke-width="2.4" vector-effect="non-scaling-stroke" opacity=".45"/>' +
    terrones;
})();

let plantadas = [];
try {
  const raw = localStorage.getItem(LLAVE);
  if (raw) plantadas = JSON.parse(raw) || [];
} catch (e) { plantadas = []; }
if (plantadas.length > TOPE_CANTERO) plantadas = plantadas.slice(-TOPE_CANTERO);

let guardaOk = true, avisoDado = false;
function guardarCantero() {
  try { localStorage.setItem(LLAVE, JSON.stringify(plantadas.slice(-TOPE_CANTERO))); }
  catch (e) { guardaOk = false; }
}

function decir(t, trabajando) {
  estado.textContent = t;
  estado.classList.toggle("trabajando", !!trabajando);
}
function decirHito() {
  const n = plantadas.length;
  let t = TEXTOS.p4.estados[0][1];
  for (const [k, txt] of TEXTOS.p4.estados) if (n >= k) t = txt;
  if (!guardaOk && !avisoDado) { avisoDado = true; t = TEXTOS.p4.sinGuardar; }
  decir(t);
}

function alejarCantero() {
  const n = capa.children.length;
  capa.style.transform = "scale(" + clamp(1 - n * 0.013, .52, 1).toFixed(3) + ")";
  cantero.style.setProperty("--luz", (Math.min(1, n / 14) * 0.6).toFixed(3));
}

function ponerPlanta(dato, guardada) {

  while (capa.children.length >= TOPE_CANTERO) capa.removeChild(capa.firstChild);
  const el = crearFlor({ semilla: dato.s, alto: dato.h, modo: "planta" });
  el.style.left = dato.x + "%";
  el.style.zIndex = String(Math.round(dato.h));
  if (guardada) {
    el.classList.add("guardada", "lista");
    el.style.setProperty("--fd", ((capa.children.length % 12) * 0.035).toFixed(3) + "s");
  }
  capa.appendChild(el);
  alejarCantero();
  return el;
}

const DIA = 86400000;
function altoMaduro(d) {
  if (!d.t) return d.h;
  const mad = Math.min(1, Math.max(0, Date.now() - d.t) / (2 * DIA));
  return Math.round(d.h * (1 + 0.12 * mad));
}

const LLAVE_VISITA = "fa-visita", LLAVE_REGALO = "fa-regalo";
let huboRegalo = false;
(function florVoluntaria() {
  let ultima = 0, dadas = 0;
  try {
    ultima = +(localStorage.getItem(LLAVE_VISITA) || 0);
    dadas = +(localStorage.getItem(LLAVE_REGALO) || 0);
    localStorage.setItem(LLAVE_VISITA, String(Date.now()));
  } catch (e) { return; }
  if (plantadas.length < 3 || !ultima || dadas >= 6) return;
  if (Date.now() - ultima < 12 * 3600000) return;
  plantadas.push({ x: Math.round(clamp(rnd(30, 94), 18, 97)), h: Math.round(rnd(190, 262)),
                   s: Math.floor(Math.random() * 1e6), t: Date.now(), r: 1 });
  huboRegalo = true;
  try { localStorage.setItem(LLAVE_REGALO, String(dadas + 1)); } catch (e) {}
  guardarCantero();
})();

(function restaurarCantero() {
  if (!plantadas.length) return;
  const frag = document.createDocumentFragment();
  const real = capa;
  plantadas.forEach(d => {
    const el = crearFlor({ semilla: d.s, alto: altoMaduro(d), modo: "planta" });
    el.style.left = d.x + "%";
    el.style.zIndex = String(Math.round(d.h));
    el.classList.add("guardada", "lista");
    frag.appendChild(el);
  });
  real.appendChild(frag);
  $$(".planta", real).forEach((el, i) => el.style.setProperty("--fd", ((i % 12) * 0.035).toFixed(3) + "s"));
  alejarCantero();
  $("#etiqueta-desde").hidden = false;
  decir(TEXTOS.p4.volvio);
  if (huboRegalo && TEXTOS.p4.regalo) setTimeout(() => decir(TEXTOS.p4.regalo), 2600);
})();
if (!plantadas.length) decirHito();

let creciendo = 0;
let cola = [];

async function sembrar(xPct, yDedo, alturaObjetivo) {
  const rect = cantero.getBoundingClientRect();
  const sueloY = rect.bottom - SUELO + 8;
  const xPx = rect.left + rect.width * (xPct / 100);

  const yStart = clamp(yDedo, rect.top + 20, sueloY - 34);
  const h = Math.max(34, sueloY - yStart);
  const dur = clamp(260 * Math.sqrt(h / 64), 200, 420);
  const sem = document.createElement("span");
  sem.className = "semilla-cae";
  sem.style.left = (xPx - rect.left - 3.5) + "px";
  sem.style.top = (yStart - rect.top - 4) + "px";
  sem.style.transform = "rotate(-20deg)";
  cantero.appendChild(sem);
  sem.getBoundingClientRect();
  sem.style.transition = "transform " + dur + "ms cubic-bezier(.45,0,.75,.35)";
  sem.style.transform = "translateY(" + (sueloY - yStart) + "px) rotate(140deg)";

  await esperar(dur);

  const pv = document.createElement("span");
  pv.className = "polvareda";
  pv.style.left = (xPx - rect.left) + "px";
  pv.style.top = (sueloY - rect.top) + "px";
  pv.style.transition = "opacity .4s cubic-bezier(.16,.84,.44,1),transform .4s cubic-bezier(.16,.84,.44,1)";
  pv.style.opacity = ".9"; pv.style.transform = "scale(.2)";
  cantero.appendChild(pv);
  requestAnimationFrame(() => { pv.style.opacity = "0"; pv.style.transform = "scale(1.7)"; });
  soltarTierra(xPx, sueloY, 5);
  vibrar(10);

  sem.style.transition = "transform .14s ease-in,opacity .14s ease-in";
  sem.style.transform = "translateY(" + (sueloY - yStart + 5) + "px) scaleY(.5)";
  sem.style.opacity = "0";
  setTimeout(() => { sem.remove(); pv.remove(); }, 460);

  const dato = { x: xPct, h: alturaObjetivo, s: Math.floor(Math.random() * 1e6), t: Date.now() };
  const pl = ponerPlanta(dato, false);
  await esperar(80);
  pl.classList.add("e-monton");
  decir(TEXTOS.p4.creciendo.enterrada, true);

  await esperar(REDUCIDO ? 60 : 1100);
  pl.classList.add("e-brote");
  decir(TEXTOS.p4.creciendo.asomo, true);

  await esperar(REDUCIDO ? 40 : 620);
  pl.classList.add("e-derecho");

  await esperar(REDUCIDO ? 40 : 520);
  pl.classList.add("e-tallo");
  decir(TEXTOS.p4.creciendo.subiendo, true);

  await esperar(REDUCIDO ? 40 : 1180);
  pl.classList.add("e-hojas");

  await esperar(REDUCIDO ? 40 : 620);
  pl.classList.add("e-capullo");

  await esperar(REDUCIDO ? 40 : 280);
  pl.classList.add("e-hincha", "latigazo");

  await esperar(REDUCIDO ? 40 : 300);
  pl.classList.add("e-flor");

  await esperar(REDUCIDO ? 40 : 520);
  pl.classList.add("lista");
  const cr = pl.getBoundingClientRect();
  soltarPetalos(cr.left + cr.width / 2, cr.top + 16, 5);

  plantadas.push(dato);
  if (plantadas.length > TOPE_CANTERO) plantadas = plantadas.slice(-TOPE_CANTERO);
  guardarCantero();
  $("#etiqueta-desde").hidden = false;
  decirHito();

  creciendo--;
  if (cola.length && creciendo < 3) { const n = cola.shift(); sembrar(n[0], n[1], n[2]); creciendo++; }
}

function limiteIzq() {
  const c = cantero.getBoundingClientRect();
  const s = $("#cierre");
  if (!s || !c.width) return 17;
  const r = s.getBoundingClientRect();
  return clamp(((r.right - c.left + 12) / c.width) * 100, 6, 44);
}

function elegirX(xPreferida) {
  const min = limiteIzq();
  let x = clamp(xPreferida, min, 97);
  for (let i = 0; i < 4; i++) {
    const choca = plantadas.some(d => Math.abs(d.x - x) < 3);
    if (!choca) break;
    x = clamp(x + rnd(-6, 6), min, 97);
  }
  return x;
}

let apretando = false, t0 = 0, xDown = 0, yDown = 0, movido = false, hold = null;

function alturaPorHold(ms) { return Math.round(178 + (Math.min(ms, 1400) / 1400) * 126); }

tierra.addEventListener("pointerdown", ev => {
  apretando = true; movido = false;
  t0 = performance.now();
  xDown = ev.clientX; yDown = ev.clientY;
  decir(TEXTOS.p4.creciendo.apretando, true);
  try { tierra.setPointerCapture(ev.pointerId); } catch (e) {}
});

function soltar(ev) {
  if (!apretando) return;
  apretando = false;
  clearTimeout(hold);
  const ms = performance.now() - t0;
  const rect = cantero.getBoundingClientRect();
  const x = elegirX(((xDown - rect.left) / rect.width) * 100);
  const alto = alturaPorHold(ms);
  if (creciendo >= 3) { cola.push([x, yDown, alto]); decir(TEXTOS.p4.esperando); return; }
  creciendo++;
  sembrar(x, yDown, alto);
}
capa.addEventListener("pointerdown", ev => {
  const t = ev.target;
  if (!t || !t.classList || !t.classList.contains("tocar")) return;
  const pl = t.closest(".planta");
  if (pl && pl.classList.contains("lista")) tocarFlor(pl);
});

tierra.addEventListener("pointerup", soltar);
tierra.addEventListener("pointercancel", () => { apretando = false; decirHito(); });

tierra.addEventListener("keydown", ev => {
  if (["Enter", "Return", " ", "Spacebar"].indexOf(ev.key) < 0) return;
  ev.preventDefault();
  if (creciendo >= 3) return;
  const rect = cantero.getBoundingClientRect();
  creciendo++;
  sembrar(elegirX(rnd(limiteIzq() + 4, 94)), rect.bottom - SUELO - 40, 230);
});

(function progreso() {
  const linea = $("#progreso .linea");
  const cont = $("#progreso");
  const actos = $$(".acto");
  actos.forEach((a, i) => {
    if (!i) return;
    const h = document.createElement("span");
    h.className = "hojita";
    h.style.top = (i / actos.length * 100) + "%";
    cont.appendChild(h);
  });
  const hojitas = $$(".hojita", cont);
  let pedido = false;
  function pintar() {
    pedido = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
    linea.style.transform = "scaleY(" + p.toFixed(3) + ")";
    hojitas.forEach((h, i) => {
      const umbral = (i + 1) / actos.length;
      h.classList.toggle("on", p >= umbral - .12);
    });
  }
  const bajar = $("#bajar");
  addEventListener("scroll", () => {
    if (bajar && scrollY > 40) bajar.classList.add("ida");
    if (!pedido) { pedido = true; requestAnimationFrame(pintar); }
  }, { passive: true });
  pintar();
})();

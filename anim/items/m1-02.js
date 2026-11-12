// @id m1-02
// @title くり《上|あ》がり・くり《下|さ》がりと ひっ《算|さん》
// @vol 数学1
// @from 数学 1-4・1-5・1-7（ch1-04・ch1-05・ch1-07）／1-8・1-9、巻末の ひっ算 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// ブロック（10の ぼう・ばら）の うごきと、ひっ算の 字を、同じ 時こくで そろえて うごかす。

// ---------- 場所の決まり ----------
const NX = 52, TX0 = 96, TX1 = 330, OX0 = 340, OX1 = 600;
const CUBE = 16, CG = 5, ROD_W = 16, ROD_H = 100;
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const ph = (t, p) => ease((t - p[0]) / (p[1] - p[0]));
const lerp = (a, b, u) => a + (b - a) * u;
const HON = ['ほん', 'ぽん', 'ほん', 'ぼん', 'ほん', 'ほん', 'ぽん', 'ほん', 'ぽん', 'ほん', 'ぽん'];
const hon = n => n + '《本|' + HON[n] + '》';
// 10の ぼうの 場所（k 本め）、ばらの 場所（i こめ。10こずつ 5×2 の わく）
const rodXY = (top, k) => [TX0 + 18 + k * 24, top];
const cubeXY = (top, i) => { const bl = Math.floor(i / 10), j = i % 10; return [OX0 + 14 + bl * 124 + (j % 5) * (CUBE + CG), top + 29 + Math.floor(j / 5) * (CUBE + CG)]; };

function box(cv, x, y, w, h, col, o = {}) {
  const g = cv.g; g.globalAlpha = o.alpha == null ? 1 : o.alpha;
  g.fillStyle = A.color(col); g.fillRect(x, y, w, h);
  g.strokeStyle = A.color('bg'); g.lineWidth = 1.5; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  g.globalAlpha = 1;
}
function rod(cv, x, y, o = {}) { const g = cv.g; box(cv, x, y, ROD_W, ROD_H, o.color || 'a', o); g.globalAlpha = o.alpha == null ? 1 : o.alpha; g.strokeStyle = A.color('bg'); g.lineWidth = 1; for (let k = 1; k < 10; k++) { g.beginPath(); g.moveTo(x, y + k * 10); g.lineTo(x + ROD_W, y + k * 10); g.stroke(); } g.globalAlpha = 1; }
function cube(cv, x, y, o = {}) {
  if (o.diamond) { const g = cv.g, c = CUBE / 2; g.globalAlpha = o.alpha == null ? 1 : o.alpha; g.fillStyle = A.color(o.color || 'b'); g.beginPath(); g.moveTo(x + c, y - 1); g.lineTo(x + CUBE + 1, y + c); g.lineTo(x + c, y + CUBE + 1); g.lineTo(x - 1, y + c); g.closePath(); g.fill(); g.globalAlpha = 1; return; }
  box(cv, x, y, o.w || CUBE, o.h || CUBE, o.color || 'c', o);
}
function cross(cv, x, y, s, col) { cv.line([[x - s, y - s], [x + s, y + s]], { color: col || 'b', width: 3 }); cv.line([[x + s, y - s], [x - s, y + s]], { color: col || 'b', width: 3 }); }
function mat(cv, rows, labels) {
  cv.rect(TX0, 30, TX1 - TX0, 412, { fill: 'a', alpha: 0.07 });
  cv.rect(OX0, 30, OX1 - OX0, 412, { fill: 'c', alpha: 0.08 });
  cv.text('じゅうの くらい', (TX0 + TX1) / 2, 46, { align: 'center', bold: true, color: 'a', size: 16 });
  cv.text('いちの くらい', (OX0 + OX1) / 2, 46, { align: 'center', bold: true, color: 'c', size: 16 });
  rows.forEach((top, k) => {
    if (k) cv.line([[NX - 30, top - 10], [OX1, top - 10]], { color: 'line', style: 'dash', width: 1 });
    if (labels[k] != null) cv.text(labels[k], NX, top + 50, { align: 'center', size: labels[k].length > 3 ? 15 : 26, bold: true });
  });
}

// ---------- ひっ算 ----------
// x：一の くらいの 中心、y：上の 行の 中心
function hissan(cv, o) {
  const s = 42, dx = 34, xo = o.x, xt = o.x - dx, xp = o.x - 2 * dx - 4;
  const yA = o.y, yB = yA + 56, yL = yB + 30, yC = yL + 32;
  if (o.hl) { const xc = o.hl === 'ones' ? xo : xt; cv.rect(xc - dx / 2 + 1, yA - 44, dx - 2, yC - yA + 66, { fill: 'hl', alpha: 1 }); }
  const dig = (v, k) => String(v).padStart(2, ' ')[k];
  const a = String(o.a).padStart(2, ' '), b = String(o.b).padStart(2, ' ');
  [xt, xo].forEach((x, k) => { if (a[k] !== ' ') cv.text(a[k], x, yA, { align: 'center', size: s, color: o.strikeT && k === 0 ? 'sub' : 'ink' }); if (b[k] !== ' ') cv.text(b[k], x, yB, { align: 'center', size: s }); });
  cv.text(o.op, xp, yB, { align: 'center', size: 36 });
  cv.line([[xp - 18, yL], [xo + 22, yL]], { color: 'ink', width: 2.5 });
  if (o.strikeT) cv.line([[xt - 13, yA + 12], [xt + 13, yA - 12]], { color: 'b', width: 3 });
  if (o.smallT != null) cv.text(String(o.smallT), xt + (o.strikeT ? 0 : 0), yA - 33, { align: 'center', size: 20, bold: true, color: 'b' });
  if (o.smallO != null) cv.text(String(o.smallO), xo, yA - 33, { align: 'center', size: 20, bold: true, color: 'b' });
  if (o.ansO != null) cv.text(String(o.ansO), xo, yC, { align: 'center', size: s, bold: true, color: o.ansColor || 'a' });
  if (o.ansT != null && o.ansT !== '0') cv.text(String(o.ansT), xt, yC, { align: 'center', size: s, bold: true, color: o.ansColor || 'a' });
  void dig;
  return { yA, yB, yC, xt, xo };
}

// ---------- ① たし算 ----------
const ADD = { show: [0, 0.6], gather: [0.8, 2.6], ones: [2.8, 3.8], bundle: [4.0, 5.0], carry: [5.2, 6.6], tens: [6.8, 7.8], end: 8.4 };
const AR = [70, 190, 322];
function addBundleBox(st) {
  const a0 = st.a % 10, b0 = st.b % 10;
  if (a0 + b0 < 10 || st.t < ADD.gather[1] || st.t >= ADD.carry[1]) return null;
  if (st.t < ADD.bundle[1] && !st.drag) { const p = cubeXY(AR[2], 0); return [p[0], p[1], 5 * (CUBE + CG), 2 * (CUBE + CG)]; }
  const p = bundlePos(st); return [p[0], p[1], ROD_W, ROD_H];
}
function bundlePos(st) {
  if (st.drag) return [st.drag[0] - ROD_W / 2, st.drag[1] - ROD_H / 2];
  const a1 = Math.floor(st.a / 10), b1 = Math.floor(st.b / 10);
  const from = [OX0 + 60, AR[2]], to = rodXY(AR[2], a1 + b1), q = ph(st.t, ADD.carry);
  return [lerp(from[0], to[0], q), lerp(from[1], to[1], q)];
}
function drawAdd(cv, st) {
  const t = st.t, a1 = Math.floor(st.a / 10), a0 = st.a % 10, b1 = Math.floor(st.b / 10), b0 = st.b % 10;
  const c = a0 + b0 >= 10 ? 1 : 0, s = st.a + st.b;
  mat(cv, AR, [String(st.a), String(st.b), t >= ADD.tens[1] ? String(s) : 'あわせると']);
  const g = ph(t, ADD.gather), m = c ? ph(t, ADD.bundle) : 0, q = c ? ph(t, ADD.carry) : 0;
  // のこる 形（うすく）
  if (g > 0) {
    for (let k = 0; k < a1; k++) { const p = rodXY(AR[0], k); rod(cv, p[0], p[1], { alpha: 0.18 }); }
    for (let k = 0; k < b1; k++) { const p = rodXY(AR[1], k); rod(cv, p[0], p[1], { alpha: 0.18 }); }
    for (let i = 0; i < a0; i++) { const p = cubeXY(AR[0], i); cube(cv, p[0], p[1], { alpha: 0.18 }); }
    for (let i = 0; i < b0; i++) { const p = cubeXY(AR[1], i); cube(cv, p[0], p[1], { alpha: 0.18 }); }
  }
  // ぼう
  for (let k = 0; k < a1; k++) { const p = rodXY(AR[0], k), r = rodXY(AR[2], k); rod(cv, lerp(p[0], r[0], g), lerp(p[1], r[1], g)); }
  for (let k = 0; k < b1; k++) { const p = rodXY(AR[1], k), r = rodXY(AR[2], a1 + k); rod(cv, lerp(p[0], r[0], g), lerp(p[1], r[1], g)); }
  // ばら：あつめた あとの 番号 n
  const all = [];
  for (let i = 0; i < a0; i++) all.push(cubeXY(AR[0], i));
  for (let i = 0; i < b0; i++) all.push(cubeXY(AR[1], i));
  if (c && t >= ADD.ones[0] && t < ADD.bundle[0] + 0.3) { const p = cubeXY(AR[2], 0); cv.rect(p[0] - 5, p[1] - 5, 5 * (CUBE + CG) + 5, 2 * (CUBE + CG) + 5, { color: 'b', style: 'dash', width: 2 }); cv.text('10こ そろった', p[0] + 50, p[1] + 58, { align: 'center', color: 'b', bold: true, size: 15 }); }
  const bp = c ? bundlePos(st) : null, morphed = c && (st.drag || m > 0);
  all.forEach((p0, n) => {
    const p1 = cubeXY(AR[2], n);
    let x = lerp(p0[0], p1[0], g), y = lerp(p0[1], p1[1], g), w = CUBE, h = CUBE;
    if (c && n < 10 && morphed) {
      const mm = st.drag ? 1 : m;
      x = lerp(p1[0], bp[0], mm); y = lerp(p1[1], bp[1] + n * 10, mm); w = CUBE; h = lerp(CUBE, 10, mm);
      if (mm >= 1) return; // ぼうに なった
    } else if (c && n >= 10) { const p2 = cubeXY(AR[2], n - 10); x = lerp(x, p2[0], q); y = lerp(y, p2[1], q); }
    cube(cv, x, y, { w, h });
  });
  if (c && (st.drag || m >= 1)) { rod(cv, bp[0], bp[1]); if (q < 1 && !st.drag) cv.text('ぼう 1ぽん', bp[0] + ROD_W / 2, bp[1] - 14, { align: 'center', size: 15, bold: true, color: 'b', bg: true }); }
  if (c && st.drag) cv.text('じゅうの くらいへ はこぼう', st.drag[0], st.drag[1] - ROD_H / 2 - 14, { align: 'center', size: 15, bold: true, color: 'b', bg: true });
  if (c && t >= ADD.gather[1] && t < ADD.bundle[0] && !st.drag) cv.text('10こを ゆびで うごかせるよ', (OX0 + OX1) / 2, 432, { align: 'center', size: 15, color: 'sub' });
  // ひっ算
  const hl = t >= ADD.ones[0] && t < ADD.carry[1] ? 'ones' : t >= ADD.tens[0] && t < ADD.tens[1] ? 'tens' : null;
  cv.text('ひっさん', 750, 46, { align: 'center', bold: true, size: 16 });
  hissan(cv, { x: 790, y: 150, op: '＋', a: st.a, b: st.b, hl,
    smallT: c && t >= ADD.carry[0] + 0.4 ? 1 : null,
    ansO: t >= ADD.ones[1] ? s % 10 : null, ansT: t >= ADD.tens[1] ? String(Math.floor(s / 10)) : null });
  if (c && t >= ADD.carry[0] + 0.4 && t < ADD.tens[1]) { cv.arrow(700, 92, 744, 112, { color: 'b', width: 2 }); cv.text('ぼう 1ぽん', 690, 86, { align: 'right', size: 15, bold: true, color: 'b' }); }
}
function addStep(st) {
  const t = st.t, a1 = Math.floor(st.a / 10), a0 = st.a % 10, b1 = Math.floor(st.b / 10), b0 = st.b % 10, c = a0 + b0 >= 10 ? 1 : 0;
  if (t < ADD.gather[1]) return `① ${st.a}は ぼう ${hon(a1)}と ばら ${a0}こ。 ${st.b}は ぼう ${hon(b1)}と ばら ${b0}こ。 くらいを たてに そろえる。`;
  if (t < ADD.ones[1] + 0.2) return `② 《一|いち》の くらい。 ${a0} ＋ ${b0} ＝ ${a0 + b0}`;
  if (c && t < ADD.carry[1]) return `③ ${a0 + b0}は 10と ${a0 + b0 - 10}。 ${a0 + b0 - 10}を かき、 10は ぼう 1《本|ぽん》に して 《十|じゅう》の くらいへ。 《小|ちい》さく 1と かく。`;
  if (!c && t < ADD.tens[0]) return `③ 10に ならないので、 くり《上|あ》がりは ありません。`;
  if (t < ADD.tens[1] + 0.2) return `④ 《十|じゅう》の くらい。 ${c ? '1 ＋ ' : ''}${a1} ＋ ${b1} ＝ ${a1 + b1 + c}`;
  return `こたえ：<b>${st.a} ＋ ${st.b} ＝ ${st.a + st.b}</b>（ぼう ${hon(Math.floor((st.a + st.b) / 10))}と ばら ${(st.a + st.b) % 10}こ）`;
}

// ---------- ② ひき算 ----------
const SUB = { show: [0, 0.6], check: [0.8, 1.8], brk: [2.0, 3.8], ones: [4.0, 5.4], tens: [5.6, 7.0], end: 7.6 };
const SR = [80, 300];
function subRodBox(st) {
  const a1 = Math.floor(st.a / 10), a0 = st.a % 10, b0 = st.b % 10;
  if (a0 >= b0 || st.t >= SUB.brk[1] || a1 < 1) return null;
  if (st.drag) return [st.drag[0] - ROD_W / 2, st.drag[1] - ROD_H / 2, ROD_W, ROD_H];
  const p = rodXY(SR[0], a1 - 1); return [p[0], p[1], ROD_W, ROD_H];
}
function drawSub(cv, st) {
  const t = st.t, a1 = Math.floor(st.a / 10), a0 = st.a % 10, b1 = Math.floor(st.b / 10), b0 = st.b % 10;
  const k = a0 < b0 ? 1 : 0, r = st.a - st.b;
  mat(cv, [SR[0], SR[1]], [t >= SUB.tens[1] ? String(r) : String(st.a), 'とる ' + st.b]);
  cv.text(t >= SUB.tens[1] ? 'のこり' : '', NX, SR[0] + 86, { align: 'center', size: 15, color: 'sub' });
  const bk = k ? ph(t, SUB.brk) : 0, qo = ph(t, SUB.ones), qt = ph(t, SUB.tens);
  if (k && t >= SUB.check[0] && t < SUB.brk[0]) { cv.rect(OX0 + 6, SR[0] + 20, OX1 - OX0 - 12, 60, { color: 'b', style: 'dash', width: 2 }); cv.text(`${a0}から ${b0}は とれない`, (OX0 + OX1) / 2, SR[0] + 100, { align: 'center', color: 'b', bold: true, size: 16 }); }
  // ぼう：のこる ぼう（a1−k 本）のうち、うしろの b1 本を とる
  const keep = a1 - k;
  for (let j = 0; j < keep; j++) {
    const p = rodXY(SR[0], j), take = j >= keep - b1, to = rodXY(SR[1], j - (keep - b1));
    if (take) rod(cv, lerp(p[0], to[0], qt), lerp(p[1], to[1], qt)); else rod(cv, p[0], p[1]);
  }
  // くずす ぼう
  if (k) {
    const p = st.drag ? [st.drag[0] - ROD_W / 2, st.drag[1] - ROD_H / 2] : rodXY(SR[0], a1 - 1);
    if (st.drag) { rod(cv, p[0], p[1]); cv.text('いちの くらいへ はこぼう', st.drag[0], st.drag[1] - ROD_H / 2 - 14, { align: 'center', size: 15, bold: true, color: 'b', bg: true }); }
    else if (bk < 0.5) { const u = bk / 0.5, mid = [OX0 + 60, SR[0]]; rod(cv, lerp(p[0], mid[0], u), lerp(p[1], mid[1], u)); }
    else {
      const u = (bk - 0.5) / 0.5, mid = [OX0 + 60, SR[0]];
      for (let j = 0; j < 10; j++) {
        const c0 = cubeXY(SR[0], j), y0 = mid[1] + j * 10;
        let x = lerp(mid[0], c0[0], u), y = lerp(y0, c0[1], u);
        if (j < b0) { const to = cubeXY(SR[1], j); x = lerp(x, to[0], qo); y = lerp(y, to[1], qo); }
        cube(cv, x, y, { diamond: u > 0.3, color: 'b', w: CUBE, h: u > 0.3 ? CUBE : 10 });
      }
    }
    if (!st.drag && t >= SUB.check[1] - 0.3 && t < SUB.brk[0]) cv.text('ぼうを ゆびで うごかせるよ', (TX0 + TX1) / 2, 432, { align: 'center', size: 15, color: 'sub' });
  }
  // もとの ばら
  for (let i = 0; i < a0; i++) {
    const p0 = cubeXY(SR[0], i), p1 = k ? cubeXY(SR[0], 10 + i) : p0;
    let x = lerp(p0[0], p1[0], bk), y = lerp(p0[1], p1[1], bk);
    if (!k && i >= a0 - b0) { const to = cubeXY(SR[1], i - (a0 - b0)); x = lerp(x, to[0], qo); y = lerp(y, to[1], qo); }
    cube(cv, x, y);
  }
  if (k && bk >= 1 && t < SUB.ones[0]) cv.text(`10と ${a0}で ${10 + a0}こ`, (OX0 + OX1) / 2, SR[0] + 100, { align: 'center', color: 'b', bold: true, size: 16 });
  // ひっ算
  const hl = t >= SUB.check[0] && t < SUB.ones[1] ? 'ones' : t >= SUB.tens[0] && t < SUB.tens[1] ? 'tens' : null;
  const lend = k && t >= SUB.brk[0] + 0.6;
  cv.text('ひっさん', 750, 46, { align: 'center', bold: true, size: 16 });
  hissan(cv, { x: 790, y: 150, op: '－', a: st.a, b: st.b, hl, strikeT: lend, smallT: lend ? a1 - 1 : null, smallO: lend ? 10 : null,
    ansO: t >= SUB.ones[1] ? r % 10 : null, ansT: t >= SUB.tens[1] ? String(Math.floor(r / 10)) : null });
}
function subStep(st) {
  const t = st.t, a1 = Math.floor(st.a / 10), a0 = st.a % 10, b1 = Math.floor(st.b / 10), b0 = st.b % 10, k = a0 < b0 ? 1 : 0;
  if (t < SUB.check[0]) return `${st.a}は、 ぼう ${hon(a1)}と ばら ${a0}こ。`;
  if (k && t < SUB.brk[0]) return `① 《一|いち》の くらい。 ${a0}から ${b0}は とれない。`;
  if (k && t < SUB.brk[1] + 0.1) return `② 《十|じゅう》の くらいから 10を もらう。 ${a1}を けして ${a1 - 1}（ぼうが 1《本|ぽん》 へった）、 《一|いち》の くらいの 《上|うえ》に 10。`;
  if (!k && t < SUB.ones[1] + 0.2) return `① 《一|いち》の くらい。 ${a0} － ${b0} ＝ ${a0 - b0}（とれるので、 くり《下|さ》がりは ない）`;
  if (t < SUB.ones[1] + 0.2) return `③ 10と ${a0}で ${10 + a0}。 ${10 + a0} － ${b0} ＝ ${10 + a0 - b0}`;
  if (t < SUB.tens[1] + 0.2) return `④ 《十|じゅう》の くらい。 ${a1 - k} － ${b1} ＝ ${a1 - k - b1}`;
  return `こたえ：<b>${st.a} － ${st.b} ＝ ${st.a - st.b}</b>　（たしかめ：${st.a - st.b} ＋ ${st.b} ＝ ${st.a}）`;
}

// ---------- ③ まちがい ----------
function drawMiss(cv, st) {
  const t = st.t, tasu = st.kind === 'tasu';
  const a = tasu ? 36 : 52, b = 27, wrong = tasu ? '53' : '35', right = tasu ? '63' : '25';
  const op = tasu ? '＋' : '－';
  // ×
  const u1 = Math.min(1, t / 1.6);
  cv.text('まちがい', 150, 40, { align: 'center', bold: true, color: 'b', size: 17 });
  hissan(cv, { x: 190, y: 140, op, a, b, ansColor: 'b', ansO: u1 > 0.4 ? wrong[1] : null, ansT: u1 >= 1 ? wrong[0] : null, hl: u1 < 0.4 ? null : u1 < 1 ? 'ones' : null });
  if (t > 1.9) { cross(cv, 70, 140, 22, 'b'); cv.text(tasu ? '1を わすれた' : 'したから ひいた', 150, 310, { align: 'center', color: 'b', bold: true, size: 16 }); }
  if (!tasu && t > 0.6 && t < 3) cv.arrow(204, 196, 204, 126, { color: 'b', width: 2.5 });
  // ○
  const u2 = A.clamp((t - 3) / 2, 0, 1);
  cv.text('ただしい', 470, 40, { align: 'center', bold: true, color: 'a', size: 17 });
  hissan(cv, { x: 510, y: 140, op, a, b, smallT: u2 > 0 ? (tasu ? 1 : 4) : null, strikeT: !tasu && u2 > 0, smallO: !tasu && u2 > 0 ? 10 : null,
    ansO: u2 > 0.5 ? right[1] : null, ansT: u2 >= 1 ? right[0] : null, hl: u2 > 0 && u2 < 0.5 ? 'ones' : u2 >= 0.5 && u2 < 1 ? 'tens' : null });
  if (t > 5.2) { cv.circle(390, 140, 24, { color: 'a', width: 4 }); cv.text(tasu ? 'ちいさい 1も たす' : '10を もらう', 470, 310, { align: 'center', color: 'a', bold: true, size: 16 }); }
  // ブロックで かぞえる
  cv.line([[620, 30], [620, 430]], { color: 'line', width: 1 });
  cv.text('ブロックで かぞえると', 745, 40, { align: 'center', bold: true, size: 16 });
  const n = tasu ? 63 : 25, r1 = Math.floor(n / 10), r0 = n % 10;
  for (let k = 0; k < r1; k++) rod(cv, 640 + k * 22, 90);
  for (let i = 0; i < r0; i++) cube(cv, 650 + (i % 3) * 21, 210 + Math.floor(i / 3) * 21);
  cv.text(`ぼう ${r1}${HON[r1]}と ばら ${r0}こ`, 745, 300, { align: 'center', size: 15 });
  cv.text(`＝ ${n}`, 745, 335, { align: 'center', size: 30, bold: true, color: 'a' });
}

A.item({
  id: 'm1-02', title: 'くり《上|あ》がり・くり《下|さ》がりと ひっ《算|さん》', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-4・1-5・1-7「ひっ《算|さん》と くり《上|あ》がり」「くり《下|さ》がり」の《図|ず》から（1-8・1-9 でも つかう）',
  W: 880, H: 460,
  state: { a: 36, b: 27, t: 0, kind: 'tasu' },
  scenes: [
    {
      key: 'agaru', label: '① くり《上|あ》がり',
      lead: 'たし《算|ざん》を、 ブロックと ひっ《算|さん》で ならべて 《見|み》よう（はじめは 36 ＋ 27）。 ▶ を おすと うごきます。',
      note: 'ばらが 10こ そろったら、 10の ぼう 1《本|ぽん》と とりかえて、 《十|じゅう》の くらいへ うつします。 これが **くり《上|あ》がり** です。 ひっ《算|さん》の 《小|ちい》さい 1は 「ぼうが 1《本|ぽん》 ふえたよ」の メモです。',
      miss: '《小|ちい》さく かいた 1を わすれて、 《十|じゅう》の くらいを 3 ＋ 2 ＝ 5 と すると、 53に なって しまいます。 《小|ちい》さく かいた 1も、 《十|じゅう》の くらいで たそう。',
      legend: [['10の ぼう（10こ）', { color: 'a', shape: 'square', noline: true }], ['ばら（1こ）', { color: 'c', shape: 'square', noline: true }], ['いま けいさん して いる くらい', { color: 'hl', shape: 'square', noline: true }]],
      controls: [
        { range: 'a', label: 'うえの かず', min: 10, max: 89, step: 1, d: 0, on(st) { if (st.a + st.b > 99) st.b = 99 - st.a; st.t = 0; } },
        { range: 'b', label: 'たす かず', min: 1, max: 89, step: 1, d: 0, on(st) { if (st.a + st.b > 99) st.a = 99 - st.b; st.t = 0; } }
      ],
      init(st) { st.t = 0; st.drag = null; },
      step(st, dt) { if (st.t >= ADD.end) return false; st.t = Math.min(ADD.end, st.t + dt); },
      draw(cv, st) { drawAdd(cv, st); },
      drag: {
        hit(st, x, y) { const r = addBundleBox(st); return r && x >= r[0] - 10 && x <= r[0] + r[2] + 10 && y >= r[1] - 10 && y <= r[1] + r[3] + 10 ? 1 : null; },
        move(st, x, y) { const a0 = st.a % 10, b0 = st.b % 10; if (a0 + b0 < 10) return; st.t = Math.max(st.t, ADD.bundle[1]); st.drag = [x, y]; },
        end(st) { if (st.drag && st.drag[0] < OX0) st.t = ADD.carry[1]; st.drag = null; }
      },
      readout: st => addStep(st)
    },
    {
      key: 'sagaru', label: '② くり《下|さ》がり',
      lead: 'ばらから とれない ひき《算|ざん》は、 どう すれば よいかな（はじめは 52 － 27）。 ▶ を おして 《見|み》よう。',
      note: '1つ 《左|ひだり》の くらいから 10を もらう ことを、 **くり《下|さ》がり** と いいます。 ぼう 1《本|ぽん》を ばら 10こに くずすのと、 ひっ《算|さん》で 5を けして 4に し、 《上|うえ》に 10と かくのは、 《同|おな》じ できごとです。',
      miss: '《上|うえ》の 2から 7は とれないので、 《下|した》の 7から 2を ひいて 「7 － 2 ＝ 5」と して しまう まちがい。 こたえが 35に なります。 《上|うえ》から とれない ときは、 10を もらおう。',
      legend: [['10の ぼう', { color: 'a', shape: 'square', noline: true }], ['ばら', { color: 'c', shape: 'square', noline: true }], ['ぼうを くずした ばら', { color: 'b', shape: 'diamond', noline: true }]],
      state: { a: 52, b: 27 },
      controls: [
        { range: 'a', label: 'ひかれる かず', min: 20, max: 99, step: 1, d: 0, on(st) { if (st.b > st.a) st.b = st.a; st.t = 0; } },
        { range: 'b', label: 'ひく かず', min: 1, max: 99, step: 1, d: 0, on(st) { if (st.b > st.a) st.a = st.b; if (st.a < 20) st.a = 20; st.t = 0; } }
      ],
      init(st) { st.t = 0; st.drag = null; },
      step(st, dt) { if (st.t >= SUB.end) return false; st.t = Math.min(SUB.end, st.t + dt); },
      draw(cv, st) { drawSub(cv, st); },
      drag: {
        hit(st, x, y) { const r = subRodBox(st); return r && x >= r[0] - 12 && x <= r[0] + r[2] + 12 && y >= r[1] - 6 && y <= r[1] + r[3] + 6 ? 1 : null; },
        move(st, x, y) { if (st.a % 10 >= st.b % 10) return; st.t = Math.max(st.t, SUB.check[1]); st.drag = [x, y]; },
        end(st) { if (st.drag && st.drag[0] > OX0) st.t = SUB.brk[1]; st.drag = null; }
      },
      readout: st => subStep(st)
    },
    {
      key: 'machigai', label: '③ まちがえやすい ところ',
      lead: 'ひだりは まちがい（×）、 みぎは ただしい（○）。 ブロックで かぞえた かずと くらべよう。',
      note: 'ひっ《算|さん》は、 ブロックの うごきを すうじで かいた ものです。 こまったら、 ブロックで いくつに なるか かぞえて たしかめよう。',
      miss: '「くり《上|あ》がりの 1を わすれる」「《下|した》の かずから ひいて しまう」。 どちらも、 ブロックで かぞえると ちがう かずに なります。',
      state: { kind: 'tasu' },
      controls: [{ seg: 'kind', label: 'どちらを 《見|み》る？', options: [['tasu', '36 ＋ 27'], ['hiku', '52 － 27']], on(st) { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { if (st.t >= 7) return false; st.t = Math.min(7, st.t + dt); },
      draw(cv, st) { drawMiss(cv, st); },
      readout: st => st.kind === 'tasu'
        ? (st.t < 3 ? '× 53：《一|いち》の くらいの 13の 10を、 《十|じゅう》の くらいへ うつして いない' : '○ 63：《小|ちい》さい 1も たして、 1 ＋ 3 ＋ 2 ＝ 6')
        : (st.t < 3 ? '× 35：《下|した》の 7から 2を ひいて しまった' : '○ 25：10を もらって 12 － 7 ＝ 5、 《十|じゅう》の くらいは 4 － 2 ＝ 2')
    }
  ]
});

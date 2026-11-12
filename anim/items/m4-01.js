// @id m4-01
// @title 行列で方眼と家がゆがむ
// @vol 数学7
// @from 数学 7-2 図5・6（ch7-02:292・359）、7-0 図2（ch7-00:229）、7-4 図2・5・6・7（ch7-04:197・349・396・458）、7-3 図4（ch7-03:308）
'use strict';
// 家の絵は本と同じ型（かど (0,0)(2,0)(2,2)(1,3)(0,2)、右によせた戸）。主役の行列 A=(2 1;1 2)
const HOUSE = [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]], DOOR = [[1.25, 0], [1.75, 0], [1.75, 1], [1.25, 1]];
const SQ = [[0, 0], [1, 0], [1, 1], [0, 1]];
const F_ = [[[0.35, 0.15], [0.35, 0.85], [0.8, 0.85]], [[0.35, 0.5], [0.68, 0.5]]];
const ap = (M, p) => [M[0] * p[0] + M[1] * p[1], M[2] * p[0] + M[3] * p[1]];
const mul = (P, Q) => [P[0] * Q[0] + P[1] * Q[2], P[0] * Q[1] + P[1] * Q[3], P[2] * Q[0] + P[3] * Q[2], P[2] * Q[1] + P[3] * Q[3]];
const det = M => M[0] * M[3] - M[1] * M[2];
const I2 = [1, 0, 0, 1];
const rot = d => { const t = d * Math.PI / 180; return [Math.cos(t), -Math.sin(t), Math.sin(t), Math.cos(t)]; };
// 単位行列から M へ、少しずつ変える（回転は角を少しずつ）
const part = (M, r, t) => r != null ? rot(r * t) : I2.map((v, k) => v + (M[k] - v) * t);
const n1 = v => A.num(v, Math.abs(v - Math.round(v)) < 0.005 ? 0 : 2);
const PRE = {
  A: { M: [2, 1, 1, 2], name: '主役の行列 A', say: 'ななめにのびて、かたむく' },
  S: { M: [2, 0, 0, 1], name: 'S', say: '横に2倍にのびる' },
  F: { M: [1, 0, 0, -1], name: '', say: '上下に裏返る（x 軸で折り返す）' },
  Z: { M: [1, 1, 0, 1], name: '', say: '上ほど右へずれる（ずらし）' },
  R: { M: [0, -1, 1, 0], name: 'R90', say: '左回りに90°回る', r: 90 }
};


let vw1 = null, vw2 = null;
const cur = st => part(st.M, st.r, st.t);
// 列の矢印の先をドラッグ（0.1 刻み。整数の近くでは整数にそろえる）
function colDrag(getV, anim) {
  return {
    hit(st, x, y) {
      const v = getV(); if (!v) return null; const M = anim ? cur(st) : st.M;
      for (const k of [0, 1]) { const p = v.P([M[k], M[k + 2]]); if (A.near(x, y, p[0], p[1], 22)) return k; }
      return null;
    },
    move(st, x, y, api, k) {
      const v = getV(); let [a, b] = v.inv(x, y);
      const sn = u => Math.abs(u - Math.round(u)) < 0.15 ? Math.round(u) : Math.round(u * 10) / 10;
      a = A.clamp(sn(a), -4, 7); b = A.clamp(sn(b), -4, 7);
      if (anim) { st.M = cur(st); st.r = null; st.t = 1; }
      st.M[k] = a; st.M[k + 2] = b; st.pre = '';
    },
    end(st) { if (!anim) st.win = 0; }
  };
}
function grid(v, M, K, o) {
  v.clip(() => { for (let i = -K; i <= K; i++) { v.line([ap(M, [i, -K]), ap(M, [i, K])], o); v.line([ap(M, [-K, i]), ap(M, [K, i])], o); } });
}
function house(v, M, o) {
  v.poly(HOUSE.map(p => ap(M, p)), { fill: o.fill, alpha: o.alpha == null ? 0.25 : o.alpha, color: o.color, width: o.width || 2.5, style: o.style });
  v.poly(DOOR.map(p => ap(M, p)), { fill: o.dfill || null, alpha: 0.9, color: o.color, width: 1.5, style: o.style });
}
function cols(v, M) {
  v.arrow(0, 0, M[0], M[2], { color: 'b', width: 3.5 });
  v.arrow(0, 0, M[1], M[3], { color: 'c', width: 3.5, style: 'dash' });
}
// 行列を、かっこつきでキャンバスに書く
function matrix(cv, x, y, M, o = {}) {
  const w = o.w || 58, h = 30, f = o.fmt || n1;
  cv.line([[x + 6, y - h - 4], [x, y - h - 4], [x, y + h + 4], [x + 6, y + h + 4]], { color: 'ink', width: 1.6 });
  cv.line([[x + 2 * w + 10, y - h - 4], [x + 2 * w + 16, y - h - 4], [x + 2 * w + 16, y + h + 4], [x + 2 * w + 10, y + h + 4]], { color: 'ink', width: 1.6 });
  const C = o.colors ? ['b', 'c'] : ['ink', 'ink'];
  cv.text(f(M[0]), x + 8 + w / 2, y - h / 2, { align: 'center', size: 18, color: C[0], bold: !!o.colors });
  cv.text(f(M[1]), x + 8 + w * 1.5, y - h / 2, { align: 'center', size: 18, color: C[1], bold: !!o.colors });
  cv.text(f(M[2]), x + 8 + w / 2, y + h / 2, { align: 'center', size: 18, color: C[0], bold: !!o.colors });
  cv.text(f(M[3]), x + 8 + w * 1.5, y + h / 2, { align: 'center', size: 18, color: C[1], bold: !!o.colors });
  if (o.name) cv.text(o.name, x - 8, y, { align: 'right', size: 18, math: true, italic: true });
}

function scene1(cv, st) {
  const M = cur(st);
  const v = cv.view({ x0: -4, x1: 8, y0: -4, y1: 8, box: [14, 10, 520, 420], equal: true });
  grid(v, I2, 8, { color: 'grid', width: 1 });
  v.axes({ xt: [-2, 2, 4, 6], yt: [-2, 2, 4, 6], grid: false, xl: 'x', yl: 'y' });
  grid(v, M, 8, { color: 'b', width: 1, alpha: 0.45 });
  // 正方形 → 平行四辺形
  v.poly(SQ.map(p => ap(M, p)), { fill: 'e', alpha: 0.25 });
  house(v, I2, { color: 'sub', style: 'dot', width: 1.5, alpha: 0.06, fill: 'sub' });
  house(v, M, { color: 'b', fill: 'b', alpha: 0.22 });
  cols(v, M);
  // 点 (1,2)
  const q = ap(M, [1, 2]); v.dot(q[0], q[1], { color: 'ink', r: 5, shape: 'diamond' }); v.text('(1, 2) の行き先', q[0] + 0.25, q[1] + 0.3, { size: 14, bg: true });
  for (const k of [0, 1]) { const p = v.P([M[k], M[k + 2]]); cv.circle(p[0], p[1], 9, { color: k ? 'c' : 'b', width: 2 }); }
  // 右の札
  const p = PRE[st.pre];
  cv.text('いまかけている行列', 560, 40, { size: 15, color: 'sub' });
  matrix(cv, 600, 100, M, { colors: true });
  cv.text('1列め', 625, 152, { size: 14, color: 'b', align: 'center' }); cv.text('2列め', 685, 152, { size: 14, color: 'c', align: 'center' });
  if (p && st.t >= 1) { cv.text((p.name ? p.name + '：' : '') + p.say, 560, 200, { size: 16, bold: true }); }
  cv.text('面積の倍率 ad−bc ＝ ' + n1(det(M)), 560, 236, { size: 16 });
  cv.text('▶ で、単位行列（何もしない）から', 560, 290, { size: 14, color: 'sub' });
  cv.text('この行列まで、少しずつ変わります。', 560, 312, { size: 14, color: 'sub' });
  cv.text('矢印の先の ○ をドラッグすると、', 560, 350, { size: 14, color: 'sub' });
  cv.text('行列の列が変わります。', 560, 372, { size: 14, color: 'sub' });
  return v;
}

function scene2(cv, st) {
  const M = st.M, D = det(M);
  if (!st.win) st.win = Math.max(2, Math.hypot(M[0], M[2]) + Math.hypot(M[1], M[3])) + 0.6;
  const w = st.win, v = cv.view({ x0: -w, x1: w, y0: -w, y1: w, box: [14, 10, 520, 420], equal: true });
  const tk = A.range(-Math.floor(w), Math.floor(w), 1).filter(x => x && (w <= 5 || x % 2 === 0));
  grid(v, I2, 8, { color: 'grid', width: 1 });
  v.axes({ xt: tk, yt: tk, grid: false, xl: 'x', yl: 'y' });
  if (Math.abs(D) < 0.05 && Math.hypot(M[0], M[2]) > 0.1) {   // つぶれる：直線
    const L = Math.hypot(M[0], M[2]), u = [M[0] / L, M[2] / L];
    v.clip(() => v.line([[-12 * u[0], -12 * u[1]], [12 * u[0], 12 * u[1]]], { color: 'd', width: 2, style: 'dash' }));
    cv.text('どの点も、この直線（1列めの向き）の上へ', 30, 30, { size: 15, color: 'd', bg: true });
  }
  v.poly(SQ, { color: 'sub', style: 'dot', width: 1.5 });
  F_.forEach(s => v.line(s, { color: 'sub', width: 3, alpha: 0.5 }));
  v.poly(SQ.map(p => ap(M, p)), { fill: D >= 0 ? 'e' : 'd', alpha: 0.28, color: D >= 0 ? 'e' : 'd', width: 2 });
  F_.forEach(s => v.line(s.map(p => ap(M, p)), { color: 'ink', width: 4 }));
  cols(v, M);
  // 1列めから2列めへ回る向き（小さな弧）
  const a1 = Math.atan2(M[2], M[0]); let a2 = Math.atan2(M[3], M[1]); let da = a2 - a1; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
  if (Math.abs(da) > 0.05 && Math.abs(Math.abs(da) - Math.PI) > 0.05) {
    const pts = []; for (let k = 0; k <= 24; k++) { const a = a1 + da * k / 24; pts.push([0.55 * Math.cos(a), 0.55 * Math.sin(a)]); }
    v.line(pts, { color: 'd', width: 2.5, style: 'dot' }); const e = pts[24], e2 = pts[22]; v.arrow(e2[0], e2[1], e[0], e[1], { color: 'd', width: 2.5, head: 11 });
  }
  for (const k of [0, 1]) { const p = v.P([M[k], M[k + 2]]); cv.circle(p[0], p[1], 9, { color: k ? 'c' : 'b', width: 2 }); }
  cv.text('行列', 560, 40, { size: 15, color: 'sub' });
  matrix(cv, 600, 100, M, { colors: true });
  cv.text('det A ＝ ad − bc ＝ ' + n1(D), 560, 180, { size: 18, bold: true });
  const say = Math.abs(D) < 0.05 ? ['0：平らにつぶれる', '面積0、元にもどせない'] : D > 0 ? ['正：向きはそのまま', '1列め→2列めは左回り'] : ['負：裏返し', '1列め→2列めは右回り、F は鏡の形'];
  cv.text(say[0], 560, 222, { size: 17, color: Math.abs(D) < 0.05 ? 'd' : D > 0 ? 'ink' : 'd', bold: true });
  cv.text(say[1], 560, 250, { size: 15 });
  // 符号の数直線
  const nx = x => 600 + (A.clamp(x, -6, 6) + 6) * 20;
  cv.line([[nx(-6), 330], [nx(6), 330]], { color: 'sub', width: 1.5 });
  for (const t of [-6, -3, 0, 3, 6]) { cv.line([[nx(t), 325], [nx(t), 335]], { color: 'sub', width: 1 }); cv.text(A.num(t, 0), nx(t), 350, { size: 14, color: 'sub', align: 'center' }); }
  cv.text('裏返し', nx(-4.5), 310, { size: 14, color: 'd', align: 'center' }); cv.text('そのまま', nx(4.5), 310, { size: 14, align: 'center' });
  cv.dot(nx(D), 330, { color: D >= 0 ? 'e' : 'd', r: 7, shape: 'diamond' });
  cv.text('▶ で2列めが1周します', 560, 395, { size: 14, color: 'sub' });
  return v;
}

const ORD = {
  SR: { first: [0, -1, 1, 0], r1: 90, second: [2, 0, 0, 1], r2: null, txt: '$SR_{90}$', plain: 'S R90', a: '回す R90', b: 'のばす S', box: [-7, 4, -2, 6], obj: 'house' },
  RS: { first: [2, 0, 0, 1], r1: null, second: [0, -1, 1, 0], r2: 90, txt: '$R_{90}S$', plain: 'R90 S', a: 'のばす S', b: '回す R90', box: [-7, 4, -2, 6], obj: 'house' },
  AS: { first: [2, 0, 0, 1], r1: null, second: [2, 1, 1, 2], r2: null, txt: '$AS$', plain: 'A S', a: 'S（面積2倍）', b: 'A（面積3倍）', box: [-1, 7, -1, 5], obj: 'sq' },
  SA: { first: [2, 1, 1, 2], r1: null, second: [2, 0, 0, 1], r2: null, txt: '$SA$', plain: 'S A', a: 'A（面積3倍）', b: 'S（面積2倍）', box: [-1, 7, -1, 5], obj: 'sq' }
};
function scene3(cv, st) {
  const o = ORD[st.ord], t = st.t;
  const M1 = part(o.first, o.r1, Math.min(1, t)), M2 = t > 1 ? mul(part(o.second, o.r2, t - 1), o.first) : null;
  const b = o.box, v = cv.view({ x0: b[0], x1: b[1], y0: b[2], y1: b[3], box: [14, 10, 560, 420], equal: true });
  grid(v, I2, 12, { color: 'grid', width: 1 });
  v.axes({ xt: A.range(Math.ceil(v.x0), Math.floor(v.x1), 1).filter(x => x % 2 === 0 && x), yt: A.range(Math.ceil(v.y0), Math.floor(v.y1), 1).filter(x => x % 2 === 0 && x), grid: false, xl: 'x', yl: 'y' });
  const shape = (M, so) => {
    if (o.obj === 'house') house(v, M, so);
    else { v.poly(SQ.map(p => ap(M, p)), { fill: so.fill, alpha: so.alpha == null ? 0.25 : so.alpha, color: so.color, width: so.width || 2.5, style: so.style }); F_.forEach(s => v.line(s.map(p => ap(M, p)), { color: so.color, width: 3, style: so.style })); }
  };
  shape(I2, { color: 'sub', style: 'dot', width: 1.5, alpha: 0.05, fill: 'sub' });
  if (M2) { shape(o.first, { color: 'd', style: 'dash', width: 2, alpha: 0.06, fill: 'd' }); shape(M2, { color: 'b', fill: 'b', alpha: 0.25 }); }
  else shape(M1, { color: 'd', style: 'dash', width: 2.5, alpha: 0.15, fill: 'd' });
  if (o.obj === 'sq') { const M = M2 || M1; const c = ap(M, [0.5, 0.5]); v.text('面積 ' + n1(Math.abs(det(M))), c[0], c[1] - 0.15, { size: 15, align: 'center', bg: true, bold: true }); }
  // 右の札：手順
  const x = 600;
  cv.text('まず', x, 50, { size: 15, color: 'sub' }); cv.text('① ' + o.a, x + 40, 50, { size: 17, color: t <= 1 ? 'd' : 'ink', bold: t <= 1 });
  cv.text('つぎに', x, 86, { size: 15, color: 'sub' }); cv.text('② ' + o.b, x + 52, 86, { size: 17, color: t > 1 ? 'b' : 'sub', bold: t > 1 });
  cv.text('式は、先のものを右に書く', x, 130, { size: 15, color: 'sub' });
  cv.text(o.plain, x, 168, { size: 22, bold: true, math: true });
  const P = mul(o.second, o.first);
  matrix(cv, x + 50, 250, P);
  cv.text('＝', x + 30, 250, { size: 18 });
  if (st.ord === 'SR' || st.ord === 'RS') cv.text(st.ord === 'SR' ? '横に長い、ねた家' : 'たてに長い、ねた家', x, 330, { size: 16, bold: true });
  else cv.text('面積：' + n1(det(o.first)) + ' × ' + n1(det(o.second)) + ' ＝ ' + n1(det(P)), x, 330, { size: 16, bold: true });
  cv.text('▶ でもう一度', x, 395, { size: 14, color: 'sub' });
}

A.item({
  id: 'm4-01', title: '行列で方眼と家がゆがむ',
  from: '数学 第7巻 7-2「行列×ベクトル」・7-3「行列の積」・7-4「行列式」の図から（7-0・7-8、8-3、物理 力-8・9 でも使う）',
  W: 880, H: 440,
  state: { pre: 'A', M: [2, 1, 1, 2], r: null, t: 0, ord: 'SR' },
  scenes: [
    {
      key: 'hogan', label: '① 4つの数で家がゆがむ',
      lead: '方眼と家の絵に行列をかけます。▶ で、もとの方眼が少しずつ変わっていくようすを見ましょう。2本の矢印の先は、ドラッグで動かせます。',
      note: '行列の**1列め**は、物差しの矢印 $\\vec e_x=(1,\\ 0)$ の行き先、**2列め**は $\\vec e_y=(0,\\ 1)$ の行き先です。方眼の正方形は、この2本がつくる平行四辺形にかわり、家は新しい方眼の上に、同じようにかき直されます。原点は動かず、まっすぐなかべは、まっすぐなままです。',
      legend: [['1列め（横の物差しの行き先）', { color: 'b' }], ['2列め（たての物差しの行き先）', { color: 'c', style: 'dash' }], ['もとの家', { color: 'sub', style: 'dot' }], ['変わった方眼', { color: 'b', style: 'solid' }]],
      controls: [{ seg: 'pre', label: '行列', options: [['A', '$A$'], ['S', '$S$'], ['F', '裏返し'], ['Z', 'ずらし'], ['R', '$R_{90}$']], on: (st) => { const p = PRE[st.pre]; st.M = p.M.slice(); st.r = p.r == null ? null : p.r; st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t = Math.min(1, st.t + dt * 0.5); if (st.t >= 1) return false; },
      drag: colDrag(() => vw1, true),
      draw(cv, st) { vw1 = scene1(cv, st); },
      readout: st => { const M = cur(st); return `いまの行列：1行め $(${n1(M[0])},\\ ${n1(M[1])})$、2行め $(${n1(M[2])},\\ ${n1(M[3])})$　　点 $(1,\\ 2)$ の行き先 $(${n1(ap(M, [1, 2])[0])},\\ ${n1(ap(M, [1, 2])[1])})$`; }
    },
    {
      key: 'det', label: '② 面積の倍率 ad−bc',
      lead: '正方形（面積1）に「F」の字をかいて、行列をかけます。2列めの矢印がぐるっと回ると、面積の倍率 $\\det A=ad-bc$ はどう変わるでしょう。',
      note: '面積の倍率は、行列式 $\\det A=ad-bc$ の大きさです。$\\det A>0$ なら向きはそのまま、$\\det A<0$ なら**裏返し**（「F」が鏡にうつした形になり、1列めから2列めへ回る向きが逆になる）、$\\det A=0$ なら平面全体が1本の直線に**平らにつぶれ**、元にもどせません。',
      miss: '行列式は「たすきにかけてひく」$ad-bc$ です。たてにかけた $ac-bd$ ではありません（主役の行列で $ac-bd=0$ になってしまい、面積3と合いません）。',
      state: { pre: 'A', M: [2, 1, 1, 2], spin: 0, win: 0 },
      legend: [['1列め', { color: 'b' }], ['2列め', { color: 'c', style: 'dash' }], ['1列めから2列めへ回る向き', { color: 'd', style: 'dot' }], ['もとの正方形', { color: 'sub', style: 'dot' }]],
      controls: [{ seg: 'pre', label: '行列', options: [['A', '主役 $A$'], ['F', '裏返し'], ['X', '入れかえ'], ['T', 'つぶれる']], on: st => { st.M = ({ A: [2, 1, 1, 2], F: [1, 0, 0, -1], X: [0, 1, 1, 0], T: [1, 2, 2, 4] })[st.pre].slice(); st.spin = 0; st.win = 0; } }],
      step(st, dt) {
        // 2列めを、長さを変えずに左回りに回す（1周で止める）
        const a = 60 * dt * Math.PI / 180, b = st.M[1], d = st.M[3];
        st.M[1] = b * Math.cos(a) - d * Math.sin(a); st.M[3] = b * Math.sin(a) + d * Math.cos(a); st.spin += 60 * dt;
        if (st.spin >= 360) { st.spin = 0; return false; }
      },
      drag: colDrag(() => vw2, false),
      draw(cv, st) { vw2 = scene2(cv, st); },
      readout: st => { const M = st.M, D = det(M); return `$\\det A=ad-bc=${n1(M[0])}\\times${n1(M[3]).replace('−', '(−') + (M[3] < -0.004 ? ')' : '')}-${n1(M[1]).replace('−', '(−') + (M[1] < -0.004 ? ')' : '')}\\times${n1(M[2])}=$ <b>${n1(D)}</b>　→　${Math.abs(D) < 0.05 ? '平らにつぶれる（元にもどせない）' : D > 0 ? '面積 ' + n1(D) + ' 倍、向きはそのまま' : '面積 ' + n1(-D) + ' 倍、裏返し'}`; }
    },
    {
      key: 'tsunagu', label: '③ つなぐ順番',
      lead: '2つの行列を、順番を変えてつなぎます。▶ で、先の行列 → あとの行列の順に、絵が変わります。',
      note: '先にはたらく行列を**右**に書きます。「まず $S$、つぎに $R_{90}$」は $R_{90}S$ です。行列の積では、ふつう $AB\\neq BA$ で、順番を勝手に入れかえられません。それでも面積の倍率は、つなぐとかけ算になります：$\\det(AS)=\\det A\\times\\det S=3\\times2=6$。',
      miss: '$AS$ は「$A$ が先」ではありません。右の $S$ が先にはたらきます。また $\\det(A+S)$ は $\\det A+\\det S$ になりません（11 と 5）。',
      state: { ord: 'SR', t: 0 },
      legend: [['もとの形', { color: 'sub', style: 'dot' }], ['先の行列のあと', { color: 'd', style: 'dash' }], ['2つめの行列のあと', { color: 'b' }]],
      controls: [{ seg: 'ord', label: '順番', options: [['SR', 'まず回して、のばす $SR_{90}$'], ['RS', 'まずのばして、回す $R_{90}S$'], ['AS', 'まず $S$、つぎに $A$（$AS$）'], ['SA', 'まず $A$、つぎに $S$（$SA$）']], on: st => { st.t = 0; } }],
      step(st, dt) { st.t = Math.min(2, st.t + dt * 0.6); if (st.t >= 2) return false; },
      draw(cv, st) { scene3(cv, st); },
      readout: st => { const o = ORD[st.ord], P = mul(o.second, o.first); return `${o.txt} ＝ 1行め $(${n1(P[0])},\\ ${n1(P[1])})$、2行め $(${n1(P[2])},\\ ${n1(P[3])})$　　面積の倍率 ${n1(det(o.second))}×${n1(det(o.first))}＝<b>${n1(det(P))}</b>`; }
    }
  ]
});

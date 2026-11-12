// @id m1-23
// @title 《天|てん》びんと《等式|とうしき》：《いこう|いこう》
// @vol 数学2
// @from 数学 2-14 等式の性質と式の変形（ch2-14:92-101・116-122・140-160・173-183・278-289）・2-16 1次方程式（ch2-16:214-229・236-251）／1-4・1-9・2-15・3-6・力-5 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。ねんど玉は 8 g、1円玉は 1 g、箱 t は 5（本と同じ答え）

// ---------- 天びん ----------
// items：[{ k:'coin'|'nendo'|'box'|'w', n:数, g:重さ1つ分, label, col }]。左右の皿にのせたものの重さで、うでがかたむく
const CX = 440, PY = 96, HL = 250, HANG = 116, PW = 210;
function weight(items) { return items.reduce((s, it) => s + it.n * it.g, 0); }
function layout(items) {
  // 皿の上の、ものの位置（皿のまん中を 0 にした x、皿の面からの高さ y）を返す
  const out = []; let x = -PW / 2 + 16, y = 0, rowH = 0;
  const put = (w, h, it, j) => { if (x + w > PW / 2 - 8) { x = -PW / 2 + 16; y += rowH + 2; rowH = 0; } out.push({ it, j, x: x + w / 2, y: y + h / 2, w, h }); x += w + 3; rowH = Math.max(rowH, h); };
  for (const it of items) { if (it.col && x > -PW / 2 + 16) { x = -PW / 2 + 16; y += rowH + 4; rowH = 0; } for (let j = 0; j < it.n; j++) {
    if (it.k === 'coin') put(18, 18, it, j); else if (it.k === 'nendo') put(36, 34, it, j); else if (it.k === 'box') put(34, 34, it, j); else put(46, 34, it, j);
  } }
  return out;
}
function balance(cv, L, R, o = {}) {
  const d = weight(L) - weight(R), phi = A.clamp(d * 0.02, -0.22, 0.22) * (o.tiltScale || 1);
  const ex = HL * Math.cos(phi), ey = HL * Math.sin(phi);
  const left = [CX - ex, PY + ey], right = [CX + ex, PY - ey];
  // 台
  cv.poly([[CX, PY], [CX - 40, 300], [CX + 40, 300]], { fill: 'sub', alpha: 0.25, color: 'sub', width: 2 });
  cv.line([[CX - 90, 300], [CX + 90, 300]], { color: 'sub', width: 4 });
  cv.line([left, right], { color: 'ink', width: 6 });
  cv.dot(CX, PY, { color: 'ink', r: 6 });
  // まん中の針（つり合うとまっすぐ）
  cv.line([[CX, PY], [CX + 50 * Math.sin(phi), PY - 50 * Math.cos(phi)]], { color: d === 0 ? 'c' : 'b', width: 3 });
  const pans = [];
  for (const [p, items] of [[left, L], [right, R]]) {
    const py = p[1] + HANG;
    cv.line([[p[0], p[1]], [p[0] - PW / 2, py]], { color: 'sub', width: 1.5 });
    cv.line([[p[0], p[1]], [p[0] + PW / 2, py]], { color: 'sub', width: 1.5 });
    cv.line([[p[0] - PW / 2 - 6, py], [p[0] + PW / 2 + 6, py]], { color: 'ink', width: 5 });
    const pos = layout(items);
    for (const q of pos) {
      const x = p[0] + q.x, y = py - 4 - q.y, it = q.it, a = it.fade != null && q.j >= it.n - it.fadeN ? it.fade : 1;
      if (a <= 0) continue;
      if (it.k === 'coin') { cv.circle(x, y, 8.5, { fill: it.col || 'e', alpha: 0.5 * a, color: it.col || 'e', width: 1.5 }); }
      else if (it.k === 'nendo') { cv.circle(x, y, 16, { fill: 'd', alpha: 0.55 * a, color: 'd', width: 2 }); cv.text(it.label || 'x', x, y, { align: 'center', size: 17, bold: true, italic: true, math: true }); }
      else if (it.k === 'box') { cv.rect(x - 16, y - 16, 32, 32, { fill: 'a', alpha: 0.4 * a, color: 'a', width: 2 }); cv.text('t', x, y, { align: 'center', size: 17, bold: true, italic: true, math: true }); }
      else { cv.poly([[x - 21, y + 16], [x + 21, y + 16], [x + 14, y - 16], [x - 14, y - 16]], { fill: 'sub', alpha: 0.5 * a, color: 'ink', width: 1.5 }); cv.text(String(it.g), x, y + 2, { align: 'center', size: 16, bold: true }); }
      pans.push({ x, y, it, j: q.j, side: p === left ? 0 : 1 });
    }
  }
  return { d, pans };
}
// 式の行（左辺・＝・右辺・メモ）
function rows(cv, R, y0, hl, gap = 30) {
  R.forEach((r, i) => {
    const y = y0 + i * gap, on = i === hl;
    if (on) cv.rect(240, y - 13, 610, 26, { fill: 'hl', alpha: 1 });
    cv.text(r[0], 330, y, { align: 'right', size: 19, math: true, bold: on });
    cv.text(r[1] || '＝', 350, y, { align: 'center', size: 19, color: r[1] ? 'b' : 'ink' });
    cv.text(r[2], 372, y, { size: 19, math: true, bold: on });
    if (r[3]) cv.text(r[3], 520, y, { size: 15, color: 'sub' });
  });
}

// ---------- ① x + 3 = 11 ----------
function s1items(st) {
  return [[{ k: 'nendo', n: 1, g: 8 }, { k: 'coin', n: st.cl, g: 1 }], [{ k: 'coin', n: st.cr, g: 1 }]];
}
function drawHiku(cv, st) {
  const [L, R] = s1items(st), b = balance(cv, L, R);
  st._pans = b.pans;
  const k = 3 - st.cl, kr = 11 - st.cr, ok = b.d === 0;
  const lhs = k ? `x + 3 − ${k}` : 'x + 3', rhs = kr ? `11 − ${kr}` : '11';
  const R2 = [['x + 3', '', '11', 'ねんど玉と1円玉3まい ＝ 1円玉11まい']];
  if (k || kr) R2.push([lhs, ok ? '' : '≠', rhs, ok ? `両方から ${k} まいずつとった` : 'かたほうだけとると、つり合わない']);
  if (ok && k === 3) R2.push(['x', '', '8', 'ねんど玉は 8 g']);
  rows(cv, R2, 330, R2.length - 1, 30);
  if (ok && k === 3) {
    // いこう（本の図）：x ＋3 ＝ 11 の ＋3 が、x ＝ 11 −3 の −3 になる
    const y1 = 345, y2 = 400, f = { size: 19, math: true };
    cv.text('いこう', 30, 318, { size: 16, bold: true, color: 'b' });
    cv.text('x', 40, y1, f); cv.text('＋3', 58, y1, Object.assign({ color: 'b', bold: true }, f)); cv.text('＝ 11', 96, y1, f);
    cv.text('x ＝ 11', 40, y2, f); cv.text('−3', 112, y2, Object.assign({ color: 'b', bold: true }, f));
    const g = cv.g; g.beginPath(); g.strokeStyle = A.color('b'); g.lineWidth = 2.5; g.setLineDash([]);
    g.moveTo(72, y1 + 12); g.bezierCurveTo(78, y1 + 34, 120, y2 - 36, 122, y2 - 18); g.stroke();
    cv.arrow(121, y2 - 26, 122, y2 - 14, { color: 'b', width: 2.5, head: 10 });
  }
}

// ---------- ② 4t = 10 + 2t ----------
function s2items(st) {
  const s = st.s;
  if (s === 0) return [[{ k: 'box', n: 4, g: 5 }], [{ k: 'w', n: 1, g: 10 }, { k: 'box', n: 2, g: 5 }]];
  if (s === 1) return [[{ k: 'box', n: 2, g: 5 }], [{ k: 'w', n: 1, g: 10 }]];
  return [[{ k: 'box', n: 1, g: 5 }], [{ k: 'w', n: 1, g: 5 }]];
}
function drawIkou(cv, st) {
  const [L, R] = s2items(st);
  // うすくして消えていくもの（つぎの段に進むとちゅう）
  const u = st.u;
  if (st.s === 1 && u < 1) { L[0].n = 4; L[0].fade = 1 - u; L[0].fadeN = 2; R.push({ k: 'box', n: 2, g: 5, fade: 1 - u, fadeN: 2 }); }
  balance(cv, L, R, { tiltScale: 0 });
  const all = [['4t', '', '10 + 2t', '']];
  if (st.s >= 1) all.push(['4t − 2t', '', '10 + 2t − 2t', '① 両方から箱を2つずつとる'], ['2t', '', '10', 'まとめる']);
  if (st.s >= 2) all.push(['t', '', '5', '② 両方を2つに分ける']);
  rows(cv, all, 314, all.length - 1, 26);
  if (st.s >= 1) cv.text('いこうで書くと：4t − 2t ＝ 10（右の ＋2t が −2t になって左へ）', 440, 428, { align: 'center', size: 15, color: 'b' });
}

// ---------- ③ 3x = 24 ----------
function drawWaru(cv, st) {
  const s = st.s, cols = ['e', 'c', 'a'];
  let L, R;
  if (s === 0) { L = [{ k: 'nendo', n: 3, g: 8 }]; R = [{ k: 'coin', n: 24, g: 1 }]; }
  else if (s === 1) { L = [{ k: 'nendo', n: 3, g: 8 }]; R = cols.map(c => ({ k: 'coin', n: 8, g: 1, col: c })); }
  else { L = [{ k: 'nendo', n: 1, g: 8 }]; R = [{ k: 'coin', n: 8, g: 1, col: 'e' }]; }
  balance(cv, L, R, { tiltScale: 0 });
  const all = [['3x', '', '24', 'ねんど玉3こ ＝ 1円玉24まい']];
  if (s >= 1) all.push(['3x ÷ 3', '', '24 ÷ 3', '両方を3つに分ける（色で分けた）']);
  if (s >= 2) all.push(['x', '', '8', '1つ分どうしも つり合う']);
  rows(cv, all, 330, all.length - 1);
}

// クリックで1円玉をとる（①）
const pickCoin = {
  hit(st, x, y) { const p = (st._pans || []).filter(q => q.it.k === 'coin').find(q => Math.hypot(q.x - x, q.y - y) < 12); return p ? { side: p.side, done: false } : null; },
  move(st, x, y, api, h) { if (h.done) return; h.done = true; if (h.side === 0 && st.cl > 0) st.cl--; if (h.side === 1 && st.cr > 0) st.cr--; }
};

A.item({
  id: 'm1-23', title: '《天|てん》びんと《等式|とうしき》：《移項|いこう》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-14「《等式|とうしき》の《性質|せいしつ》と《式|しき》の《変形|へんけい》」・2-16「1《次方程式|じほうていしき》」の《図|ず》から（1-4・1-9・2-15・3-6、《物理|ぶつり》 《力|りき》-5 でも《使|つか》う）',
  W: 880, H: 440,
  state: { cl: 3, cr: 11, s: 0, u: 1, w: 0 },
  scenes: [
    {
      key: 'hiku', label: '① 《両方|りょうほう》から《同|おな》じだけとる',
      lead: 'ねんど《玉|だま》（$x$ g）と1《円玉|えんだま》3《枚|まい》が、1《円玉|えんだま》11《枚|まい》とつり《合|あ》っています。▶ で、《両方|りょうほう》の《皿|さら》から1《枚|まい》ずつとります。1《円玉|えんだま》をクリックして、《片方|かたほう》だけとることもできます。',
      note: '《両方|りょうほう》から3《枚|まい》ずつとっても、《天|てん》びんはつり《合|あ》ったまま。《式|しき》では《両辺|りょうへん》から3をひいて、$x+3-3=11-3$、$x=8$。$x+3=11$ と $x=11-3$ をくらべると、《左辺|さへん》の $+3$ が「＝」をこえて、$-3$ になって《右辺|うへん》にうつったように《見|み》えます。これが**《移項|いこう》**。《新|あたら》しいきまりではなく、「《両辺|りょうへん》から《同|おな》じ《数|かず》をひく」ことです。',
      miss: '$x+3=11$ から $x=11+3$ はまちがい（《符号|ふごう》の《変|か》えわすれ）。$x=14$ を《代入|だいにゅう》すると $14+3=17$ で、11にならないので《気|き》づけます。',
      legend: [['ねんど《玉|だま》 $x$ g', { color: 'd', shape: 'circle', noline: true }], ['1《円玉|えんだま》（1 g）', { color: 'e', shape: 'circle', noline: true }], ['《針|はり》（つり《合|あ》うとまっすぐ）', { color: 'c' }]],
      controls: [{ button: '《両方|りょうほう》から1《枚|まい》ずつとる', act(st) { if (st.cl > 0 && st.cr > 0) { st.cl--; st.cr--; } } }],
      init(st) { st.cl = 3; st.cr = 11; st.w = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.1) { st.w = 0; if (st.cl === 0) return false; st.cl--; st.cr--; } },
      drag: pickCoin,
      draw(cv, st) { drawHiku(cv, st); },
      readout: st => { const d = 8 + st.cl - st.cr; return `《左|ひだり》の《皿|さら》 ${8 + st.cl} g、《右|みぎ》の《皿|さら》 ${st.cr} g　→　${d === 0 ? '<b>つり《合|あ》っている</b>' : d > 0 ? '《左|ひだり》が《重|おも》い' : '《右|みぎ》が《重|おも》い'}`; }
    },
    {
      key: 'ikou', label: '② $4t=10+2t$ を《解|と》く',
      lead: '《中|なか》の《数|かず》がわからない《箱|はこ》を $t$ とします。$4t=10+2t$ を《天|てん》びんにして、▶ で1つずつ《操作|そうさ》します。',
      note: '① 《両方|りょうほう》から《箱|はこ》を2つずつとると、《箱|はこ》2つが10とつり《合|あ》う（$2t=10$）。《箱|はこ》を《片方|かたほう》に《集|あつ》めると、《考|かんが》えやすくなります。② 《両方|りょうほう》を2つに《分|わ》けると、《箱|はこ》1つが5とつり《合|あ》う（$t=5$）。**《天|てん》びんでしたことを、《式|しき》で1《行|ぎょう》ずつ《書|か》いたのが、《方程式|ほうていしき》の《解|と》き《方|かた》**です。',
      miss: '$4t=10+2t$ から $4t+2t=10$ はまちがい。《移項|いこう》は「《両辺|りょうへん》から $2t$ をひく」ことなので、$4t-2t=10$ です。',
      legend: [['《箱|はこ》 $t$', { color: 'a', shape: 'square', noline: true }], ['おもり', { color: 'sub', shape: 'tri', noline: true }]],
      controls: [{ button: 'つぎの《操作|そうさ》', act(st) { if (st.s < 2) { st.s++; st.u = 0; } } }],
      init(st) { st.s = 0; st.u = 1; st.w = 0; },
      step(st, dt) { if (st.u < 1) { st.u = Math.min(1, st.u + dt * 1.2); return; } st.w += dt; if (st.w > 1.2) { st.w = 0; if (st.s >= 2) return false; st.s++; st.u = 0; } },
      draw(cv, st) { drawIkou(cv, st); },
      readout: st => ['$4t=10+2t$（《箱|はこ》4つ ＝ おもり10と《箱|はこ》2つ）', '$2t=10$（《箱|はこ》2つ ＝ おもり10）', '$t=5$（《箱|はこ》1つ ＝ 5）　たしかめ：$4\\times5=20$、$10+2\\times5=20$'][st.s]
    },
    {
      key: 'waru', label: '③ 3つに《分|わ》ける',
      lead: 'ねんど《玉|だま》3《個|こ》と1《円玉|えんだま》24《枚|まい》がつり《合|あ》っています（$3x=24$）。▶ で、《両方|りょうほう》を3つに《分|わ》けます。',
      note: '《左|ひだり》を3つに《分|わ》けると1つ《分|ぶん》はねんど《玉|だま》1《個|こ》。《右|みぎ》も3つに《分|わ》けると1つ《分|ぶん》は $24÷3=8$ 《枚|まい》。《同|おな》じ《重|おも》さを《同|おな》じ《数|かず》に《分|わ》けたので、1つ《分|ぶん》どうしも《同|おな》じ《重|おも》さ。**《両辺|りょうへん》を3でわる**と $x=8$ です。',
      legend: [['ねんど《玉|だま》 $x$ g', { color: 'd', shape: 'circle', noline: true }], ['1《円玉|えんだま》（3つに《分|わ》けて《色|いろ》をかえた）', { color: 'e', shape: 'circle', noline: true }]],
      controls: [{ button: 'つぎの《操作|そうさ》', act(st) { if (st.s < 2) st.s++; } }],
      init(st) { st.s = 0; st.w = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.4) { st.w = 0; if (st.s >= 2) return false; st.s++; } },
      draw(cv, st) { drawWaru(cv, st); },
      readout: st => ['$3x=24$', '$\\frac{3x}{3}=\\frac{24}{3}$', '$x=8$（たしかめ：$3\\times8=24$）'][st.s]
    }
  ]
});

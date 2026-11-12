// @id m1-16
// @title マイナスの《数|かず》：たす・ひく・かける
// @vol 数学2
// @from 数学 2-2 マイナスの数と数直線（ch2-02:144-154・242-247・280-285・302-312・348-353・373-381）／1-6・2-3・4-10・6-9・力-1 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける

const sgn = v => v < 0 ? `(${A.num(v, 0)})` : A.num(v, 0);   // 負の数はかっこをつける
// 数直線：lo〜hi、目もりは1ごと、数字は lab ごと。y はキャンバスの高さ
function numline(cv, lo, hi, y, lab) {
  const v = cv.view({ x0: lo - 0.7, x1: hi + 0.9, y0: 0, y1: 1, box: [30, 0, 820, 1] });
  const X = x => v.X(x);
  cv.rect(X(lo - 0.5), y - 4, X(0) - X(lo - 0.5), 8, { fill: 'a', alpha: 0.12 });
  cv.rect(X(0), y - 4, X(hi + 0.5) - X(0), 8, { fill: 'b', alpha: 0.12 });
  cv.arrow(X(lo - 0.6), y, X(hi + 0.8), y, { color: 'ink', width: 2 });
  for (let n = lo; n <= hi; n++) {
    cv.line([[X(n), y - (n ? 7 : 11)], [X(n), y + (n ? 7 : 11)]], { color: 'ink', width: n ? 1.5 : 3 });
    if (n % lab === 0) cv.text(A.num(n, 0), X(n), y + 24, { align: 'center', size: 15 });
  }
  return X;
}
// 数直線の上をすすむ矢印（弧）。from から to へ、高さ h、のびぐあい u（0〜1）
function hop(cv, X, from, to, y, h, u, o) {
  if (u <= 0) return;
  const x1 = X(from), x2 = X(from + (to - from) * u);
  cv.arrow(x1, y - h, x2, y - h, o);
  cv.line([[x1, y - 4], [x1, y - h]], { color: o.color, width: 1.5, style: 'dot' });
  if (u >= 1) cv.line([[x2, y - 4], [x2, y - h]], { color: o.color, width: 1.5, style: 'dot' });
}
const ease = u => A.clamp(u, 0, 1);

// ---------- ① たし算 ----------
function drawTasu(cv, st) {
  const y = 300, X = numline(cv, -10, 10, y, 1);
  const p1 = st.a + st.b, p2 = p1 + st.c, u1 = ease(st.t), u2 = ease(st.t - 1.3);
  cv.dot(X(st.a), y, { color: 'ink', r: 7 });
  cv.text('朝', X(st.a), y - 40, { align: 'center', size: 16, bold: true });
  hop(cv, X, st.a, p1, y, 100, u1, { color: st.b >= 0 ? 'b' : 'a', width: 4, style: st.b >= 0 ? 'solid' : 'dash' });
  if (u1 > 0.3) cv.text(`＋${sgn(st.b)}（${st.b >= 0 ? '右' : '左'}へ${Math.abs(st.b)}）`, (X(st.a) + X(p1)) / 2, y - 122, { align: 'center', size: 16, color: st.b >= 0 ? 'b' : 'a', bold: true });
  if (u1 >= 1) { cv.dot(X(p1), y, { color: 'ink', r: 7, shape: 'square' }); cv.text('昼', X(p1), y - 40, { align: 'center', size: 16, bold: true }); }
  hop(cv, X, p1, p2, y, 190, u2, { color: st.c >= 0 ? 'b' : 'a', width: 4, style: st.c >= 0 ? 'solid' : 'dash' });
  if (u2 > 0.3) cv.text(`＋${sgn(st.c)}（${st.c >= 0 ? '右' : '左'}へ${Math.abs(st.c)}）`, (X(p1) + X(p2)) / 2, y - 212, { align: 'center', size: 16, color: st.c >= 0 ? 'b' : 'a', bold: true });
  if (u2 >= 1) { cv.dot(X(p2), y, { color: 'ink', r: 7, shape: 'tri' }); cv.text('夜', X(p2), y - 60, { align: 'center', size: 16, bold: true }); }
  cv.text('℃', 850, y + 24, { size: 15, color: 'sub' });
}

// ---------- ② ひき算は、反対の数をたす ----------
function drawHiku(cv, st) {
  const y = 340, X = numline(cv, -10, 10, y, 1), b = st.b, nb = -b, res = st.a - b;
  const t = st.t, u1 = ease(t / 0.8), rot = ease((t - 1.1) / 1.0), mv = ease((t - 2.4) / 0.8), go = ease((t - 3.4) / 1.0);
  // 1. ひく数 b を、0 から矢印で
  const y0 = 200, R = Math.abs(X(b) - X(0)), ang = rot * Math.PI;  // 0 を中心に半回転
  if (mv < 1) {
    const ox = A.lerp(X(0), X(st.a), mv);
    const sy = y0 - Math.min(80, R) * Math.sin(ang);
    if (u1 > 0) cv.arrow(ox, y0, ox + (X(b) - X(0)) * Math.cos(ang) * u1, sy, { color: rot < 1 ? 'a' : 'b', width: 4, style: rot < 1 ? 'dash' : 'solid' });
    cv.dot(ox, y0, { color: 'ink', r: 5 });
    if (rot === 0 && u1 > 0.5) cv.text(`ひく数 ${A.num(b, 0)}`, ox + (X(b) - X(0)) / 2, y0 - 22, { align: 'center', size: 16, color: 'a', bold: true });
    if (rot >= 1) cv.text(`反対の数 ${A.num(nb, 0)}`, ox + (X(nb) - X(0)) / 2, y0 - 22, { align: 'center', size: 16, color: 'b', bold: true });
    if (rot > 0 && rot < 1) cv.text('半回転', ox, y0 - 100, { align: 'center', size: 15, color: 'sub' });
    cv.line([[X(0), y0 + 8], [X(0), y - 12]], { color: 'grid', width: 1, style: 'dot' });
  }
  // 2. a から、反対の数だけすすむ
  cv.dot(X(st.a), y, { color: 'ink', r: 7 });
  if (mv >= 1) hop(cv, X, st.a, res, y, 90, go, { color: 'b', width: 4 });
  if (go >= 1) {
    cv.dot(X(res), y, { color: 'b', r: 8, shape: 'diamond' });
    cv.text(`${A.num(st.a, 0)} − ${sgn(b)} ＝ ${A.num(st.a, 0)} ＋ ${sgn(nb)} ＝ ${A.num(res, 0)}`, 440, 40, { align: 'center', size: 20, bold: true });
  }
}

// ---------- ③ かけ算と ×(−1) ----------
function drawKake(cv, st) {
  const y = 360, lo = -16, hi = 16, X = numline(cv, lo, hi, y, 4);
  const L = Math.abs(st.a), M = Math.abs(st.b), neg = (st.a < 0) + (st.b < 0);
  const t = st.t, g = ease(t / 0.8), s = ease((t - 1.0) / 1.0);
  const len = A.lerp(L, L * M, s) * g;
  // ×(−1) の半回転（負の数の数だけ）
  // k 回目の半回転は、上を通って、左右を入れかえる（1回目は左回り、2回目は右回り）
  let ang = 0, far = 0;
  for (let k = 0; k < neg; k++) { const r = ease((t - 2.4 - k * 1.5) / 1.1); ang += (k % 2 ? -1 : 1) * r * Math.PI; if (r > 0) far = Math.max(far, k ? Math.PI : r * Math.PI); }
  const px = len * (X(1) - X(0)), sq = Math.min(1, 230 / Math.max(px, 1));
  const ex = X(0) + px * Math.cos(ang), ey = y - 30 - px * Math.sin(ang) * sq;
  if (far > 0) {
    const pts = []; for (let q = 0; q <= 60; q++) { const a2 = far * q / 60; pts.push([X(0) + px * Math.cos(a2), y - 30 - px * Math.sin(a2) * sq]); }
    cv.line(pts, { color: 'sub', width: 1.5, style: 'dot' });
  }
  const home = Math.abs(Math.sin(ang)) < 1e-6;
  cv.arrow(X(0), y - 30, ex, home ? y - 30 : ey, { color: Math.cos(ang) > 0 ? 'b' : 'a', width: 5, style: Math.cos(ang) > 0 ? 'solid' : 'dash' });
  cv.dot(X(0), y - 30, { color: 'ink', r: 5 });
  // 式
  let done = 0; for (let q = 0; q < neg; q++) if (t >= 2.4 + q * 1.5 + 1.1) done++;
  const parts = [`${L} × ${M} ＝ ${L * M}`];
  for (let q = 0; q < done; q++) parts.push(`×(−1)`);
  cv.text(`${sgn(st.a)} × ${sgn(st.b)}`, 30, 36, { size: 20, bold: true });
  cv.text(parts.join(' ') + (done ? ` → ${A.num(L * M * Math.pow(-1, done), 0)}` : ''), 30, 70, { size: 18 });
  cv.text(`×(−1) は ${neg} 回`, 850, 36, { align: 'right', size: 16, color: 'sub' });
}

A.item({
  id: 'm1-16', title: 'マイナスの《数|かず》：たす・ひく・かける', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-2「マイナスの《数|かず》と《数直線|すうちょくせん》」の《図|ず》から（1-6・2-3・4-10・6-9、《物理|ぶつり》 《力|りき》-1 でも《使|つか》う）',
  W: 880, H: 400,
  state: { a: -3, b: 5, c: -4, t: 0 },
  scenes: [
    {
      key: 'tasu', label: '① たし《算|ざん》は《動|うご》き',
      lead: '《朝|あさ》の《気温|きおん》は −3 ℃。《昼|ひる》までに 5 ℃ 《上|あ》がり、《夜|よる》までに 4 ℃ 《下|さ》がりました。▶ で《数直線|すうちょくせん》の《上|うえ》を《動|うご》きます。',
      note: '《正|せい》の《数|かず》をたすと《右|みぎ》へ、**《負|ふ》の《数|かず》をたすと《左|ひだり》へ**《進|すす》みます。$(-3)+5=2$、$2+(-4)=-2$ で、《昼|ひる》は 2 ℃、《夜|よる》は −2 ℃ です。',
      miss: '$-5$ と $-2$ では、$-5$ のほうが《左|ひだり》にあるので《小|ちい》さい（$-5<-2$）。《負|ふ》の《数|かず》は、0から《遠|とお》いほど《小|ちい》さくなります。',
      legend: [['《正|せい》の《数|かず》をたす（《右|みぎ》へ）', { color: 'b' }], ['《負|ふ》の《数|かず》をたす（《左|ひだり》へ）', { color: 'a', style: 'dash' }], ['《朝|あさ》・《昼|ひる》・《夜|よる》', { color: 'ink', shape: 'square', noline: true }]],
      controls: [{ range: 'a', label: '《朝|あさ》の《気温|きおん》', min: -6, max: 6, step: 1, d: 0, on: re }, { range: 'b', label: '1つめにたす《数|かず》', min: -8, max: 8, step: 1, d: 0, on: re }, { range: 'c', label: '2つめにたす《数|かず》', min: -8, max: 8, step: 1, d: 0, on: re }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; if (st.t > 2.4) { st.t = 2.4; return false; } },
      draw(cv, st) { drawTasu(cv, st); },
      readout: st => { const p1 = st.a + st.b, p2 = p1 + st.c; const ok = Math.abs(p1) <= 10 && Math.abs(p2) <= 10; return ok ? `${sgn(st.a)} ＋ ${sgn(st.b)} ＝ <b>${A.num(p1, 0)}</b>（《昼|ひる》）　　${sgn(p1)} ＋ ${sgn(st.c)} ＝ <b>${A.num(p2, 0)}</b>（《夜|よる》）` : '《数直線|すうちょくせん》の −10〜10 からはみ《出|だ》します。《数|かず》を《小|ちい》さくしてください'; }
    },
    {
      key: 'hiku', label: '② ひく＝《反対|はんたい》の《数|かず》をたす',
      lead: '$4-(-3)$ はいくつでしょう。▶ で、ひく《数|かず》の《矢印|やじるし》を0のまわりに《半回転|はんかいてん》させて、《反対|はんたい》の《数|かず》にしてからたします。',
      note: '「$-3$ をひく」は、「《反対|はんたい》の $+3$ をたす」と《同|おな》じです。$4-(-3)=4+3=7$。$2-6$ も $2+(-6)=-4$ のように、**ひくことは、《反対|はんたい》の《数|かず》をたすこと**です。',
      miss: '$4-(-3)=1$ はまちがい。$4-(-3)=4+3=7$ です。「$-$」が2つ《続|つづ》いたら、《反対|はんたい》の《数|かず》のたし《算|ざん》に《書|か》きなおしてから《計算|けいさん》します。',
      state: { a: 4, b: -3 },
      legend: [['ひく《数|かず》', { color: 'a', style: 'dash' }], ['《反対|はんたい》の《数|かず》（これをたす）', { color: 'b' }], ['《答|こた》え', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'a', label: 'ひかれる《数|かず》', min: -6, max: 6, step: 1, d: 0, on: re }, { range: 'b', label: 'ひく《数|かず》', min: -6, max: 6, step: 1, d: 0, on: re }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; if (st.t > 4.6) { st.t = 4.6; return false; } },
      draw(cv, st) { drawHiku(cv, st); },
      readout: st => `${A.num(st.a, 0)} − ${sgn(st.b)} ＝ ${A.num(st.a, 0)} ＋ ${sgn(-st.b)} ＝ <b>${A.num(st.a - st.b, 0)}</b>`
    },
    {
      key: 'kakeru', label: '③ ×(−1) で《反対|はんたい》《向|む》き',
      lead: '$(-3)\\times(-4)$ を《矢印|やじるし》で《見|み》ます。▶ で、まず $3\\times4=12$ にのばし、《負|ふ》の《数|かず》1つごとに0のまわりで《半回転|はんかいてん》（×(−1)）させます。',
      note: '$-3=3\\times(-1)$、$-4=4\\times(-1)$ なので、$(-3)\\times(-4)=3\\times4\\times(-1)\\times(-1)$。×(−1) は《向|む》きを《反対|はんたい》にするかけ《算|ざん》で、**2《回|かい》でもとの《向|む》きにもどります**。だから $(-3)\\times(-4)=12$。',
      miss: '$(-3)\\times(-4)=-12$ はまちがい（マイナスがあるから − ではない）。たし《算|ざん》の $(-3)+(-4)=-7$ とまぜないようにしよう。',
      state: { a: -3, b: -4 },
      legend: [['《正|せい》の《向|む》き（《右|みぎ》）', { color: 'b' }], ['《負|ふ》の《向|む》き（《左|ひだり》）', { color: 'a', style: 'dash' }], ['《半回転|はんかいてん》したあと', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'a', label: 'かけられる《数|かず》', min: -4, max: 4, step: 1, d: 0, on: re }, { range: 'b', label: 'かける《数|かず》', min: -4, max: 4, step: 1, d: 0, on: re }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; const end = 2.4 + 1.5 * ((st.a < 0) + (st.b < 0)) + 0.3; if (st.t > end) { st.t = end; return false; } },
      draw(cv, st) { drawKake(cv, st); },
      readout: st => { const n = (st.a < 0) + (st.b < 0); return `${sgn(st.a)} × ${sgn(st.b)} ＝ ${Math.abs(st.a)} × ${Math.abs(st.b)}${' × (−1)'.repeat(n)} ＝ <b>${A.num(st.a * st.b, 0)}</b>　（×(−1) が ${n}《回|かい》：${n % 2 ? '《反対|はんたい》の《向|む》き' : 'もとの《向|む》き'}）`; }
    }
  ]
});
function re(st) { st.t = 0; }

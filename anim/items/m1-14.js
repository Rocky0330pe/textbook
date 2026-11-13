// @id m1-14
// @title はっぱの《広|ひろ》さと まわりの《長|なが》さ
// @vol 数学1
// @from 数学 1-21 面積（ch1-21:33-58・122-129・462-467・487-491）／4-5・5-10・2-7 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける（分かち書き）
// ---------- はっぱ（本の図のベジエ曲線。本の 4 mm のマスを 1 cm とした） ----------
const LEAF = (function () {
  const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
  const s = p => [p[0] / 4, p[1] / 4];
  const P = [];
  for (let k = 0; k < 120; k++) P.push(bez(s([0, 10]), s([8, 22]), s([26, 20]), s([36, 10]), k / 120));
  for (let k = 0; k < 120; k++) P.push(bez(s([36, 10]), s([26, 0]), s([8, -2]), s([0, 10]), k / 120));
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; } area = Math.abs(area) / 2;
  // 横の線 y と、はっぱのふちが交わる x（左から順）
  function spans(y) { const xs = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); } return xs.sort((p, q) => p - q); }
  const X0 = -0.75, Y0 = -0.5, X1 = 9.25, Y1 = 5.5; // マスの線の範囲（本の図と同じく、マスの線ははっぱのはしからずらす）
  const cache = {};
  function count(lv) {
    if (cache[lv]) return cache[lv];
    const h = 1 / (1 << lv), nx = Math.round((X1 - X0) / h), ny = Math.round((Y1 - Y0) / h), cells = [];
    let full = 0, part = 0;
    const m = 12;
    for (let j = 0; j < ny; j++) {
      const rows = []; for (let q = 0; q <= m; q++) rows.push(spans(Y0 + j * h + h * (q === 0 ? 1e-6 : q === m ? 1 - 1e-6 : q / m)));
      for (let i = 0; i < nx; i++) {
        const x0 = X0 + i * h, x1 = x0 + h;
        let all = true, any = false;
        for (const xs of rows) {
          let cov = false, touch = false;
          for (let k = 0; k + 1 < xs.length; k += 2) { if (xs[k] <= x0 && xs[k + 1] >= x1) cov = true; if (xs[k + 1] > x0 && xs[k] < x1) touch = true; }
          if (!cov) all = false; if (touch) any = true;
        }
        if (all) { full++; part++; cells.push([x0, Y0 + j * h, 2]); } else if (any) { part++; cells.push([x0, Y0 + j * h, 1]); }
      }
    }
    return (cache[lv] = { full, part, cells, h });
  }
  return { P, area, count, X0, Y0, X1, Y1 };
})();

function drawLeaf(cv, st) {
  const v = cv.view({ x0: LEAF.X0 - 0.2, x1: LEAF.X1 + 0.2, y0: LEAF.Y0 - 0.2, y1: LEAF.Y1 + 0.2, box: [20, 20, 600, 380], equal: true });
  const r = LEAF.count(st.lv), h = r.h;
  // マス
  for (const [x, y, k] of r.cells) {
    if (k === 2) v.poly([[x, y], [x + h, y], [x + h, y + h], [x, y + h]], { fill: 'c', alpha: 0.55 });
    else {
      v.poly([[x, y], [x + h, y], [x + h, y + h], [x, y + h]], { fill: 'b', alpha: 0.12 });
      v.clip(() => { const g = cv.g; g.save(); g.beginPath(); g.rect(v.X(x), v.Y(y + h), h * v.sx, h * v.sy); g.clip(); for (let d = -1; d <= 2; d += 0.25 * Math.max(1, h * 2)) cv.line([[v.X(x + d * h), v.Y(y)], [v.X(x + (d + 1) * h), v.Y(y + h)]], { color: 'b', width: 1.2 }); g.restore(); });
    }
  }
  // マスの線
  const nx = Math.round((LEAF.X1 - LEAF.X0) / h), ny = Math.round((LEAF.Y1 - LEAF.Y0) / h);
  for (let i = 0; i <= nx; i++) { const x = LEAF.X0 + i * h; v.line([[x, LEAF.Y0], [x, LEAF.Y1]], { color: Math.abs((x - LEAF.X0) % 1) < 1e-9 ? 'sub' : 'grid', width: Math.abs((x - LEAF.X0) % 1) < 1e-9 ? 1.2 : 1 }); }
  for (let j = 0; j <= ny; j++) { const y = LEAF.Y0 + j * h; v.line([[LEAF.X0, y], [LEAF.X1, y]], { color: Math.abs((y - LEAF.Y0) % 1) < 1e-9 ? 'sub' : 'grid', width: Math.abs((y - LEAF.Y0) % 1) < 1e-9 ? 1.2 : 1 }); }
  // はっぱ
  v.poly(LEAF.P, { color: 'ink', width: 3 });
  v.line([[-0.75, 2.5], [9, 2.5]], { color: 'ink', width: 1.5, alpha: 0.6 });
  // 1 cm の目じるし
  v.line([[LEAF.X0, LEAF.Y0 - 0.12], [LEAF.X0 + 1, LEAF.Y0 - 0.12]], { color: 'ink', width: 2 });
  cv.text('1 cm', v.X(LEAF.X0 + 0.5), v.Y(LEAF.Y0) + 18, { align: 'center', size: 14, color: 'sub' });
  // 右：広さの数直線（cm²）
  const n = 1 << (2 * st.lv), lo = r.full / n, hi = r.part / n;
  const g = cv.view({ x0: 0, x1: 1, y0: 0, y1: 50, box: [690, 40, 120, 330] });
  g.axes({ yt: [0, 10, 20, 30, 40, 50], grid: true, xlabels: false });
  cv.text('cm²', g.X(0) + 8, g.T - 18, { size: 14, color: 'sub' });
  g.poly([[0.12, lo], [0.88, lo], [0.88, hi], [0.12, hi]], { fill: 'b', alpha: 0.18, color: 'b', style: 'dot', width: 2 });
  g.poly([[0.12, 0], [0.88, 0], [0.88, lo], [0.12, lo]], { fill: 'c', alpha: 0.5 });
  g.line([[0.02, LEAF.area], [0.98, LEAF.area]], { color: 'ink', width: 3 });
  cv.text('ほんとう', g.X(1) + 4, g.Y(LEAF.area), { size: 14 });
  cv.text('ひろさ', g.X(0.5), g.T + g.Hp + 24, { align: 'center', size: 15 });
}

// ---------- A と B（本の「まちがえやすいところ」の図） ----------
const SHAPES = {
  A: { cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], o: [60, 150] },
  B: { cells: [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]], o: [560, 160] }
};
// まわりの辺（マスの辺 1 本ずつ、まわる順に）
function edgesOf(cells) {
  const has = (i, j) => cells.some(c => c[0] === i && c[1] === j), E = [];
  for (const [i, j] of cells) {
    if (!has(i, j - 1)) E.push([[i, j], [i + 1, j]]);
    if (!has(i + 1, j)) E.push([[i + 1, j], [i + 1, j + 1]]);
    if (!has(i, j + 1)) E.push([[i + 1, j + 1], [i, j + 1]]);
    if (!has(i - 1, j)) E.push([[i, j + 1], [i, j]]);
  }
  // つながる順にならべる
  const out = [E.shift()];
  while (E.length) { const end = out[out.length - 1][1]; const k = E.findIndex(e => e[0][0] === end[0] && e[0][1] === end[1]); out.push(E.splice(k < 0 ? 0 : k, 1)[0]); }
  return out;
}
const EA = edgesOf(SHAPES.A.cells), EB = edgesOf(SHAPES.B.cells);
// 時間 t（0〜54）：0〜14 で A のまわり、14〜26 で B のまわり、28〜34 で A のマス、36〜45 で B のマス
function abCount(t) {
  return { pa: Math.min(14, Math.floor(t)), pb: A.clamp(Math.floor(t - 14), 0, 12), sa: A.clamp(Math.floor(t - 28), 0, 6), sb: A.clamp(Math.floor(t - 36), 0, 9) };
}
function drawAB(cv, st) {
  const S = 58, c = abCount(st.t);
  for (const [name, sh, E, np, ns] of [['A', SHAPES.A, EA, c.pa, c.sa], ['B', SHAPES.B, EB, c.pb, c.sb]]) {
    const X = i => sh.o[0] + i * S, Y = j => sh.o[1] + (3 - j) * S - 60;
    sh.cells.forEach(([i, j], k) => {
      cv.rect(X(i), Y(j + 1), S, S, { fill: k < ns ? 'a' : 'grid', alpha: k < ns ? 0.45 : 0.8, color: 'sub', width: 1 });
      if (k < ns) cv.text(String(k + 1), X(i) + S / 2, Y(j + 1) + S / 2, { align: 'center', size: 17, bold: true, color: 'a' });
    });
    E.forEach((e, k) => {
      if (k >= np) return;
      const p = [X(e[0][0]), Y(e[0][1])], q = [X(e[1][0]), Y(e[1][1])];
      cv.line([p, q], { color: 'b', width: 5, style: 'dash' });
      const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = (q[1] - p[1]) / S, ny = -(q[0] - p[0]) / S;
      cv.text(String(k + 1), mx - nx * 17, my - ny * 17, { align: 'center', size: 14, color: 'b', bold: true });
    });
    const tx = sh.o[0] + (name === 'A' ? 3 * S : 1.5 * S);
    cv.text(name, tx, 40, { align: 'center', size: 22, bold: true });
    cv.text(`まわり ${np}こ ぶん`, tx, Y(-1) + 20, { align: 'center', size: 16, color: 'b' });
    cv.text(`ひろさ ${ns}マス`, tx, Y(-1) + 44, { align: 'center', size: 16, color: 'a' });
  }
}

// ---------- ひも 20 cm の長方形 ----------
function drawRope(cv, st) {
  const S = 34, h = st.h, w = 10 - h, x0 = 40, y0 = 30 + (9 - h) * S / 2 + 6;
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) cv.rect(x0 + i * S, y0 + j * S, S, S, { fill: 'a', alpha: 0.3, color: 'sub', width: 1 });
  cv.rect(x0, y0, w * S, h * S, { color: 'b', width: 4, style: 'dash' });
  cv.text(`よこ ${w} cm`, x0 + w * S / 2, y0 + h * S + 18, { align: 'center', size: 16 });
  cv.text(`たて ${h} cm`, x0 + w * S + 10, y0 + h * S / 2, { size: 16 });
  // 右：たてと広さ
  const g = cv.view({ x0: 0, x1: 10, y0: 0, y1: 28, box: [470, 30, 370, 330] });
  g.axes({ xt: A.range(1, 9), yt: [0, 5, 10, 15, 20, 25], xl: 'たて（cm）', yl: 'ひろさ（cm²）' });
  for (let k = 1; k <= 9; k++) if (st.seen[k]) { g.line([[k, 0], [k, k * (10 - k)]], { color: 'c', width: 6, alpha: 0.35 }); g.dot(k, k * (10 - k), { color: 'c', r: 6 }); }
  g.dot(h, h * w, { color: 'b', r: 8, shape: 'diamond' });
  g.text(`${h * w}`, h, h * w + 2, { align: 'center', size: 15, bold: true, color: 'b' });
}

A.item({
  id: 'm1-14', title: 'はっぱの《広|ひろ》さと まわりの《長|なが》さ', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-21「《広|ひろ》さを くらべよう：《面積|めんせき》」の《図|ず》から（4-5・5-10、2-7 でも つかう）',
  W: 880, H: 420,
  state: { lv: 0, t: 0 },
  scenes: [
    {
      key: 'happa', label: '① はっぱを マスで はかる',
      lead: 'まがった はっぱの《広|ひろ》さを、マスで かぞえます。▶ を おすと、マスが だんだん 《小|ちい》さく なります。',
      note: 'みどりの マスは はっぱに ぜんぶ 《入|はい》って いる マス、しまの マスは すこしでも かかって いる マスです。ほんとうの《広|ひろ》さは その あいだ。**マスを《小|ちい》さく するほど、2つが ちかづいて、ほんとうの《広|ひろ》さに《近|ちか》く なります**（《第|だい》5《巻|かん》の「せきぶん」に つながるよ）。',
      miss: 'マスの《大|おお》きさが ちがうと、マスの かずだけでは くらべられません。《小|ちい》さい マスは 4こで、1 cm² の マス 1こ ぶんです。',
      legend: [['ぜんぶ 《入|はい》って いる マス', { color: 'c', shape: 'square', noline: true }], ['すこし かかる マス（しま）', { color: 'b', style: 'dot' }], ['はっぱの ふち', { color: 'ink' }]],
      controls: [{ seg: 'lv', label: '1マスの 《大|おお》きさ', options: [[0, '1 cm²'], [1, '1 cm² を 4つに'], [2, '16こに'], [3, '64こに']], on(st) { st.t = st.lv * 1.6; } }],
      init(st) { st.lv = 0; st.t = 0; },
      step(st, dt) { st.t += dt; st.lv = Math.min(3, Math.floor(st.t / 1.6)); if (st.t > 4 * 1.6) return false; },
      draw(cv, st) { drawLeaf(cv, st); },
      readout: st => { const r = LEAF.count(st.lv), n = 1 << (2 * st.lv); return n === 1 ? `ぜんぶ 《入|はい》る マス <b>${r.full}こ</b>、すこしでも かかる マス <b>${r.part}こ</b>　→　ほんとうの《広|ひろ》さは ${r.full} cm² と ${r.part} cm² の あいだ` : `ぜんぶ 《入|はい》る マス <b>${r.full}こ</b>、かかる マス <b>${r.part}こ</b>（${n}こで 1 cm²）　→　やく ${Math.round(r.full / n)} cm² と やく ${Math.round(r.part / n)} cm² の あいだ`; }
    },
    {
      key: 'mawari', label: '② まわりと 《広|ひろ》さ',
      lead: 'A と B の まわりの《長|なが》さと《広|ひろ》さを、▶ で かぞえて みよう。',
      note: 'まわりは A が 14こ ぶん、B が 12こ ぶん で、A の ほうが《長|なが》い。でも《広|ひろ》さは A が 6マス、B が 9マス で、B の ほうが《広|ひろ》い。**まわりの《長|なが》さと《広|ひろ》さは べつの もの**です。',
      miss: '「まわりが《長|なが》い ほうが《広|ひろ》い」とは かぎりません。《広|ひろ》さは マスの かずで くらべます。',
      legend: [['まわり（マスの 《辺|へん》 1こ ぶんずつ）', { color: 'b', style: 'dash' }], ['《広|ひろ》さ（マス）', { color: 'a', shape: 'square', noline: true }]],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 4; if (st.t > 54) { st.t = 54; return false; } },
      draw(cv, st) { drawAB(cv, st); },
      readout: st => { const c = abCount(st.t); return `A：まわり ${c.pa}こ ぶん、《広|ひろ》さ ${c.sa}マス　　B：まわり ${c.pb}こ ぶん、《広|ひろ》さ ${c.sb}マス`; }
    },
    {
      key: 'himo', label: '③ おなじ まわりで かたちを かえる',
      lead: '《長|なが》さ 20 cm の ひもで 《長方形|ちょうほうけい》を つくります。たてを かえると《広|ひろ》さは どう なるかな？',
      note: 'まわりは いつも 20 cm なのに、《広|ひろ》さは 9 cm² から 25 cm² まで かわります。たてと よこが おなじ 5 cm の 《正方形|せいほうけい》の とき、いちばん《広|ひろ》く なります。《広|ひろ》さは たて × よこ（1-21）。',
      miss: '《長方形|ちょうほうけい》の《広|ひろ》さを たて ＋ よこ で もとめては いけません。たて 3 cm、よこ 7 cm なら 3 × 7 ＝ 21 cm² です。',
      legend: [['ひも（まわり 20 cm）', { color: 'b', style: 'dash' }], ['1 cm² の マス', { color: 'a', shape: 'square', noline: true }], ['いままでの《広|ひろ》さ', { color: 'c', shape: 'circle', noline: true }]],
      state: { h: 1, seen: {} },
      controls: [{ range: 'h', label: 'たて', min: 1, max: 9, step: 1, fmt: v => v + ' cm', on(st) { st.seen[st.h] = 1; st.t = st.h - 1; } }],
      init(st) { st.h = 1; st.t = 0; st.seen = { 1: 1 }; },
      step(st, dt) { st.t += dt * 1.2; if (st.t >= 8) { st.t = 8; st.h = 9; st.seen[9] = 1; return false; } st.h = 1 + Math.floor(st.t); st.seen[st.h] = 1; },
      draw(cv, st) { drawRope(cv, st); },
      readout: st => `たて ${st.h} cm、よこ ${10 - st.h} cm、まわり ${2 * st.h + 2 * (10 - st.h)} cm　→　《広|ひろ》さ ${st.h} × ${10 - st.h} ＝ <b>${st.h * (10 - st.h)} cm²</b>`
    }
  ]
});

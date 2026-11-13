// @id m1-15
// @title 《数直線|すうちょくせん》のズームと《小数|しょうすう》の《位|くらい》
// @vol 数学2
// @from 数学 2-1「かぞえる数」と「はかる数」（ch2-01:99-115・264-279・322-332・363-380）／1-16・2-6・2-7・2-9・2-10 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける（本と同じく、分かち書きはしない）

// ---------- ① 切れ目のない数：ズーム ----------
// ズームの段：0 は 0〜10、1 は 7〜8、2 は 7.3〜7.4（本の図の 7 と 8 のあいだ・7.3）
const ZL = [0, 7, 7.3];
function zoomRange(z) {
  const k = Math.min(1, Math.floor(z)), s = z - k, L0 = ZL[k], L1 = ZL[k + 1], W0 = 10 * Math.pow(10, -k);
  const f = (L1 - 0.1 * L0) / 0.9, r = Math.pow(10, -s);
  const left = f - (f - L0) * r;
  return [left, left + W0 * r];
}
// a〜b の範囲に、見やすい細かさの目もりをかく
function ticks(cv, X, a, b, y, o) {
  const W = X(b) - X(a);
  for (let e = 0; e >= -3; e--) {
    const step = Math.pow(10, e), px = W / ((b - a) / step);
    if (px < 8) break;
    const h = e === 0 ? 14 : e === -1 ? 10 : e === -2 ? 7 : 5, d = Math.max(0, -e);
    for (let n = Math.ceil(a / step - 1e-9); n * step <= b + 1e-9; n++) {
      const x = X(n * step);
      cv.line([[x, y - h], [x, y + h]], { color: 'ink', width: e === 0 ? 2 : 1.2 });
      if (!o.labels) continue;
      const coarse = e < 0 && n % 10 === 0;  // 1つ粗い目もりで、もう数を書いた所
      const show = e === 0 ? px >= 30 || n % 5 === 0 : !coarse && (px >= 46 || (px >= 10 && n % 5 === 0));
      if (show) cv.text(A.num(n * step, d), x, y + 26 + (e < 0 && e < -Math.floor(-Math.log10(b - a)) ? 0 : 0), { align: 'center', size: 15 });
    }
  }
}
function drawKireme(cv, st) {
  const [a, b] = zoomRange(st.z), L = 120, R = 840, X = v => L + (v - a) / (b - a) * (R - L);
  cv.text('本数', 20, 110, { size: 17, bold: true });
  cv.text('長さ', 20, 270, { size: 17, bold: true });
  // 本数：とびとびの点
  cv.line([[L - 10, 110], [R + 10, 110]], { color: 'sub', width: 1.5 });
  for (let n = 0; n <= 10; n++) {
    if (n < a - 1e-9 || n > b + 1e-9) continue;
    cv.dot(X(n), 110, { color: 'b', r: 8 });
    cv.text(String(n), X(n), 140, { align: 'center', size: 15 });
  }
  if (b - a < 1.5) cv.text('このあいだに 本数は ない', (L + R) / 2, 80, { align: 'center', size: 15, color: 'b' });
  // 長さ：切れ目のない線
  cv.g.save(); cv.g.beginPath(); cv.g.rect(L - 12, 150, R - L + 24, 200); cv.g.clip();
  cv.line([[L - 10, 270], [R + 10, 270]], { color: 'a', width: 9 });
  ticks(cv, X, a, b, 270, { labels: true });
  cv.g.restore();
  const W = b - a, step = 720 / (W / 0.1) >= 8 ? (720 / (W / 0.01) >= 8 ? 0.01 : 0.1) : 1;
  cv.text(`1目もり ${A.num(step, step < 1 ? (step < 0.1 ? 2 : 1) : 0)}`, R, 345, { align: 'right', size: 15, color: 'a' });
}

// ---------- ② 1.45 m を読む ----------
function drawYomu(cv, st) {
  const v = st.v, lo1 = 1, hi1 = 2, k = Math.min(9, Math.floor((v - 1) * 10 + 1e-9)), lo2 = 1 + k / 10, hi2 = lo2 + 0.1;
  const L = 60, R = 820, X1 = x => L + (x - lo1) / (hi1 - lo1) * (R - L), X2 = x => L + (x - lo2) / (hi2 - lo2) * (R - L);
  const y1 = 50, y2 = 160, z = A.clamp(st.p, 0, 1);
  // 上の線（0.1 m ごと）
  cv.rect(X1(lo2), y1 - 10, X1(hi2) - X1(lo2), 20, { fill: 'a', alpha: 0.25 });
  cv.line([[L - 10, y1], [R + 10, y1]], { color: 'ink', width: 2 });
  for (let n = 0; n <= 10; n++) { const x = X1(1 + n / 10); cv.line([[x, y1 - 9], [x, y1 + 9]], { color: 'ink', width: n % 10 ? 1.3 : 2 }); if (n % 5 === 0 || n === k || n === k + 1) cv.text(A.num(1 + n / 10, n % 10 ? 1 : 0), x, y1 - 22, { align: 'center', size: 15 }); }
  cv.text('m', R + 18, y1, { size: 15, color: 'sub' });
  // ひろげる（台形）
  cv.poly([[X1(lo2), y1 + 10], [X1(hi2), y1 + 10], [A.lerp(X1(hi2), R, z), A.lerp(y1 + 10, y2 - 10, z)], [A.lerp(X1(lo2), L, z), A.lerp(y1 + 10, y2 - 10, z)]], { fill: 'a', alpha: 0.1 });
  if (z > 0.98) {
    cv.line([[L - 10, y2], [R + 10, y2]], { color: 'ink', width: 2 });
    for (let n = 0; n <= 10; n++) { const x = X2(lo2 + n / 100); cv.line([[x, y2 - 9], [x, y2 + 9]], { color: 'ink', width: n % 10 ? 1.2 : 2 }); }
    cv.text(A.num(lo2, 1), X2(lo2), y2 + 26, { align: 'center', size: 15 });
    cv.text(A.num(hi2, 1), X2(hi2), y2 + 26, { align: 'center', size: 15 });
    cv.text('m', R + 18, y2, { size: 15, color: 'sub' });
    cv.arrow(X2(v), y2 + 52, X2(v), y2 + 12, { color: 'b', width: 3 });
    cv.text(A.num(v, 2) + ' m', X2(v) + 8, y2 + 50, { size: 17, bold: true, color: 'b' });
  }
  cv.dot(X1(v), y1, { color: 'b', r: 6, shape: 'diamond' });
  // 下：1 が1こ・0.1 が○こ・0.01 が○こ（100 ますの正方形で）
  const n100 = Math.round(v * 100), ones = Math.floor(n100 / 100), tenths = Math.floor(n100 / 10) % 10, hund = n100 % 10;
  const S = 12, gx = 60, gy = 238;
  const sq = (x0, f) => { for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) cv.rect(x0 + i * S, gy + j * S, S, S, { fill: f(i, j) || 'bg', alpha: f(i, j) ? 0.55 : 1, color: 'grid', width: 1 }); cv.rect(x0, gy, 10 * S, 10 * S, { color: 'ink', width: 2 }); };
  for (let q = 0; q < ones; q++) sq(gx + q * 145, () => 'a');
  const x2 = gx + ones * 145;
  if (ones < 2) sq(x2, (i, j) => i < tenths ? 'b' : (i === tenths && j < hund ? 'c' : null));
  cv.text(`1 が ${ones}こ`, gx + 60, gy + 136, { align: 'center', size: 15, color: 'a' });
  if (ones < 2) { cv.text(`0.1 が ${tenths}こ`, x2 + 60, gy + 136, { align: 'center', size: 15, color: 'b' }); cv.text(`0.01 が ${hund}こ`, x2 + 60, gy + 158, { align: 'center', size: 15, color: 'c' }); }
  // 位の表
  const tx = 420, ty = 250, cw = 120;
  ['一', '1/10', '1/100'].forEach((h, i) => {
    cv.rect(tx + i * cw, ty, cw, 34, { fill: 'panel', alpha: 1, color: 'line', width: 1 });
    cv.text(h, tx + i * cw + cw / 2, ty + 17, { align: 'center', size: 15, color: 'sub' });
    cv.rect(tx + i * cw, ty + 34, cw, 56, { color: 'line', width: 1 });
    cv.text(String([ones, tenths, hund][i]), tx + i * cw + cw / 2, ty + 62, { align: 'center', size: 30, bold: true, color: ['a', 'b', 'c'][i] });
  });
  cv.dot(tx + cw - 2, ty + 80, { color: 'b', r: 4 });
  cv.text(`${ones} ＋ ${A.num(tenths / 10, 1)} ＋ ${A.num(hund / 100, 2)} ＝ ${A.num(v, 2)}`, tx + 1.5 * cw, ty + 120, { align: 'center', size: 17, bold: true });
}

// ---------- ③ ×10・÷10 で位が動く ----------
const COLS = ['千', '百', '十', '一', '1/10', '1/100', '1/1000'];  // 位（3 から −3）
const toMilli = v => Math.round(v * 1000);
// N（1000 分の 1 を単位にした整数）を、位ごとの数字に。書く数字だけ返す（あいた位の 0 は red）
function digits(N) {
  const out = [];
  let hi = -1, lo = 3;
  for (let p = 3; p >= -3; p--) { const d = Math.floor(N / Math.pow(10, p + 3)) % 10; if (d) { hi = Math.max(hi, p); lo = Math.min(lo, p); } }
  hi = Math.max(hi, 0); lo = Math.min(lo, 0);
  for (let p = hi; p >= lo; p--) { const d = Math.floor(N / Math.pow(10, p + 3)) % 10; out.push({ p, d }); }
  return out;
}
function drawBai(cv, st) {
  if (st.initFor !== st.start) baiInit(st);  // #bai&start=35 のように、リンクで数を決めて開いたとき
  const cw = 76, x0 = 120, y0 = 90, rh = 92, cx = p => x0 + (3 - p) * cw + cw / 2;
  COLS.forEach((h, i) => cv.text(h, x0 + i * cw + cw / 2, y0 - 34, { align: 'center', size: 15, color: 'sub' }));
  const rows = st.rows;
  rows.forEach((N, r) => {
    const y = y0 + r * rh;
    for (let i = 0; i < 7; i++) cv.rect(x0 + i * cw + 4, y - 26, cw - 8, 52, { color: 'line', width: 1.2 });
    cv.dot(x0 + 4 * cw, y + 20, { color: 'b', r: 5 });
    // 動いている行は、前の行の場所からすべらせる
    const anim = r === rows.length - 1 && st.u < 1 && r > 0, dir = anim ? st.ops[r - 1] : 0, u = anim ? (1 - Math.cos(Math.PI * st.u)) / 2 : 1;
    const orig = st.orig;
    for (const { p, d } of digits(N)) {
      const fromP = p - dir, x = anim ? A.lerp(cx(fromP), cx(p), u) : cx(p);
      const added = d === 0 && !orig.has(p - st.shift[r]);
      if (anim && added && u < 0.7) continue;
      if (added) cv.rect(x - cw / 2 + 8, y - 22, cw - 16, 44, { color: 'b', width: 2, style: 'dash' });
      cv.text(String(d), x, y + 2, { align: 'center', size: 32, bold: true, color: added ? 'b' : 'ink' });
    }
    cv.text(A.num(N / 1000, Math.max(0, -Math.min(0, digits(N)[digits(N).length - 1].p))) + (st.unit ? ' ' + st.unit[r] : ''), x0 + 7 * cw + 24, y + 2, { size: 18, bold: true });
    if (r > 0) {
      const ya = y0 + (r - 1) * rh, op = st.ops[r - 1] > 0 ? '×10' : '÷10';
      cv.g.beginPath(); cv.g.strokeStyle = A.color('b'); cv.g.lineWidth = 2; cv.g.arc(x0 - 26, (ya + y) / 2, rh / 2 - 8, -Math.PI / 2, Math.PI / 2, true); cv.g.stroke();
      cv.arrow(x0 - 24, y - 8, x0 - 18, y - 8, { color: 'b', width: 2 });
      cv.text(op, x0 - 74, (ya + y) / 2, { align: 'center', size: 17, bold: true, color: 'b' });
    }
  });
}
function baiInit(st) {
  const v = st.start, N = toMilli(v);
  st.rows = [N]; st.ops = []; st.shift = [0]; st.u = 1; st.t = 0;
  st.orig = new Set(digits(N).filter(x => x.d !== 0 || false).map(x => x.p));
  // 4 → 0.4 のように、もとの数の中の 0（0.4 の一の位）は「書きたした 0」として赤にする。405 の 0 のような中の 0 は黒
  const ds = digits(N); const nz = ds.filter(x => x.d); const hp = nz.length ? nz[0].p : 0, lp = nz.length ? nz[nz.length - 1].p : 0;
  for (const x of ds) if (x.p <= hp && x.p >= lp) st.orig.add(x.p);
  st.unit = null; st.initFor = v;
}
function baiOp(st, dir) {
  const N = st.rows[st.rows.length - 1], M = dir > 0 ? N * 10 : N / 10;
  if (M >= 10000000 || M !== Math.floor(M)) return false;
  if (st.rows.length >= 3) { st.rows = st.rows.slice(-1); st.ops = []; st.shift = [st.shift[st.shift.length - 1]]; }
  st.rows.push(M); st.ops.push(dir); st.shift.push(st.shift[st.shift.length - 1] + dir); st.u = 0;
  return true;
}

A.item({
  id: 'm1-15', title: '《数直線|すうちょくせん》のズームと《小数|しょうすう》の《位|くらい》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-1「かぞえる《数|かず》」と「はかる《数|かず》」の《図|ず》から（1-16・2-6・2-7・2-9・2-10 でも《使|つか》う）',
  W: 880, H: 420,
  state: { z: 0, v: 1.45, p: 0, start: 1.45, rows: [1450], ops: [], u: 1, t: 0 },
  scenes: [
    {
      key: 'kireme', label: '① 《切|き》れ《目|め》のない《数|かず》',
      lead: '▶ で、7と8のあいだを《大|おお》きくしていきます。《本数|ほんすう》と《長|なが》さで、ちがいを《見|み》ましょう。',
      note: '《本数|ほんすう》（かぞえる《数|かず》）は、7と8のあいだに《何|なに》もありません。《長|なが》さ（はかる《数|かず》）は、いくら《大|おお》きくしても《目|め》もりがかけて、7.3、7.35、…と、どこまでも《細|こま》かく《表|あらわ》せます。**はかる《数|かず》には《切|き》れ《目|め》がありません**。',
      legend: [['《本数|ほんすう》：とびとびの《点|てん》', { color: 'b', shape: 'circle', noline: true }], ['《長|なが》さ：《切|き》れ《目|め》のない《線|せん》', { color: 'a' }]],
      controls: [{ range: 'z', label: 'ズーム', min: 0, max: 2, step: 0.01, fmt: v => '×' + Math.round(Math.pow(10, v)) }],
      init(st) { st.z = 0; },
      step(st, dt) { st.z = Math.min(2, st.z + dt * 0.45); if (st.z >= 2) return false; },
      draw(cv, st) { drawKireme(cv, st); },
      readout: st => { const [a, b] = zoomRange(st.z); return `${A.num(a, st.z < 1 ? 1 : 2)} から ${A.num(b, st.z < 1 ? 1 : 2)} まで（ズーム ×${Math.round(Math.pow(10, st.z))}）`; }
    },
    {
      key: 'yomu', label: '② 1.45 m を《読|よ》む',
      lead: '1と2のあいだを10に《分|わ》けた1《目|め》もりが0.1。そのあいだをさらに10に《分|わ》けると0.01です。▶ で《下|した》の《線|せん》に《広|ひろ》げます。',
      note: '1.45 は、1が1こ、0.1が4こ、0.01が5こ。《数字|すうじ》を《書|か》く《場所|ばしょ》（《位|くらい》）で、0.1が《何|なん》こか、0.01が《何|なん》こかを《表|あらわ》しています。ソラの《身長|しんちょう》は 1.45 m です。',
      legend: [['1（1 m が1こ）', { color: 'a', shape: 'square', noline: true }], ['0.1（0.1 m）', { color: 'b', shape: 'square', noline: true }], ['0.01（0.01 m）', { color: 'c', shape: 'square', noline: true }]],
      state: { v: 1.45, p: 0 },
      controls: [{ range: 'v', label: '《身長|しんちょう》', min: 1, max: 1.99, step: 0.01, fmt: v => A.num(v, 2) + ' m', on(st) { st.p = 1; } }],
      init(st) { st.p = 0; },
      step(st, dt) { st.p += dt * 0.7; if (st.p >= 1) { st.p = 1; return false; } },
      draw(cv, st) { drawYomu(cv, st); },
      readout: st => `${A.num(st.v, 2)} m ＝ ${Math.round(st.v * 100)} cm（0.01 m が ${Math.round(st.v * 100)}こ）`
    },
    {
      key: 'bai', label: '③ ×10 と ÷10',
      lead: '×10 をおすと、どの《数字|すうじ》も《位|くらい》が1つ《上|あ》がります（《左|ひだり》へ1つ）。÷10 では1つ《下|さ》がります。',
      note: '10こ《集|あつ》まると、1つ《上|うえ》の《位|くらい》の1こになります。だから10《倍|ばい》すると、《数字|すうじ》のならびはそのままで、《小数点|しょうすうてん》（だいだいの《点|てん》）が《右|みぎ》へ1つ《動|うご》いたように《見|み》えます。100《倍|ばい》は ×10 を2《回|かい》。《数字|すうじ》のない《位|くらい》には0を《書|か》きます（だいだいの0）。',
      miss: '0.4 m ＝ 4 cm はまちがい。cm にするのは100《倍|ばい》なので、《右|みぎ》へ2つ。0.4 → 4 → 40 で、0.4 m ＝ 40 cm です。',
      legend: [['もとの《数字|すうじ》', { color: 'ink', shape: 'square', noline: true }], ['あいた《位|くらい》に《書|か》いた0（《点線|てんせん》のわく）', { color: 'b', style: 'dash' }], ['《小数点|しょうすうてん》', { color: 'b', shape: 'circle', noline: true }]],
      state: { start: 1.45 },
      controls: [
        { seg: 'start', label: 'はじめの《数|かず》', options: [[1.45, '1.45'], [0.4, '0.4'], [35, '35']], on(st) { baiInit(st); } },
        { button: '×10', act(st) { baiOp(st, 1); } },
        { button: '÷10', act(st) { baiOp(st, -1); } }
      ],
      init(st) { baiInit(st); },
      step(st, dt) {
        if (st.u < 1) { st.u = Math.min(1, st.u + dt * 1.6); return; }
        st.t += dt;
        if (st.t > 0.6) { st.t = 0; if (st.rows.length >= 3) return false; baiOp(st, st.start === 35 ? -1 : 1); }
      },
      draw(cv, st) { drawBai(cv, st); },
      readout: st => {
        const r = st.rows, f = N => { const d = digits(N); return A.num(N / 1000, Math.max(0, -d[d.length - 1].p)); };
        let s = f(r[0]); for (let k = 1; k < r.length; k++) s += ` ${st.ops[k - 1] > 0 ? '×' : '÷'} 10 ＝ ${f(r[k])}`;
        return s;
      }
    }
  ]
});

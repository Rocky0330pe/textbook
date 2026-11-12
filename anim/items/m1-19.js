// @id m1-19
// @title 《歯車|はぐるま》の《回転|かいてん》と《比|ひ》
// @vol 数学2
// @from 数学 2-5 比（ch2-05:161-180・467-479）／5-6・2-15・力-6・力-7・電-12 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。歯車の形・歯の数・中心のきょりは本の図と同じ（モジュール 0.7 mm、A 48・B 16・C 8）

// 歯車をかく。c：中心（キャンバス）、z：歯の数、m：モジュール（mm）、s：1 mm の px、ang：回った角（ラジアン、左回りが正）
function gear(cv, c, z, m, s, ang, o) {
  const rp = m * z / 2, rt = (rp + m) * s, rr = (rp - 1.25 * m) * s, p = 2 * Math.PI / z, pts = [];
  for (let k = 0; k < z; k++) {
    const th = ang + k * p;
    for (const [f, r] of [[-0.5, rr], [-0.28, rr], [-0.14, rt], [0.14, rt], [0.28, rr]]) { const a = th + f * p; pts.push([c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]); }
  }
  cv.poly(pts, { fill: o.fill, alpha: 0.28, color: o.fill, width: 1.8 });
  cv.circle(c[0], c[1], Math.max(4, rr * 0.25), { color: o.fill, width: 1.5 });
  // しるしの線（1つの歯に向けて）。回った数をかぞえるため
  cv.line([c, [c[0] + (rt - 4) * Math.cos(ang), c[1] - (rt - 4) * Math.sin(ang)]], { color: 'ink', width: 3 });
  cv.dot(c[0] + (rt - 4) * Math.cos(ang), c[1] - (rt - 4) * Math.sin(ang), { color: 'ink', r: 5, shape: o.shape });
  cv.dot(c[0], c[1], { color: 'ink', r: 3 });
}
// 回る向きの矢印（弧）。dir：+1 左回り、−1 右回り
function turnArrow(cv, c, r, a0, dir, col) {
  const a1 = a0 + dir * 0.9, pts = [];
  for (let q = 0; q <= 20; q++) { const a = a0 + (a1 - a0) * q / 20; pts.push([c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]); }
  cv.line(pts.slice(0, -1), { color: col, width: 2.5 });
  const e = pts[pts.length - 1], tx = -Math.sin(a1) * dir, ty = -Math.cos(a1) * dir;  // 弧の向き（キャンバスの座標）
  cv.arrow(e[0] - 12 * tx, e[1] - 12 * ty, e[0], e[1], { color: col, width: 2.5, head: 12 });
}
// かみ合わせ：となりどうしで「歯の場所のずれ」の和が 1/2 になるように、はじめの角を決める
function phases(zs) {
  const ph = [0];
  for (let i = 1; i < zs.length; i++) {
    const pp = 2 * Math.PI / zs[i - 1], pc = 2 * Math.PI / zs[i];
    const f = (((0 - ph[i - 1]) / pp) % 1 + 1) % 1;          // 前の歯車：右向き（0）での歯のずれ
    const g = ((0.5 - f) % 1 + 1) % 1;
    ph.push(Math.PI - g * pc);                                  // つぎの歯車：左向き（π）で g ずれる
  }
  return ph;
}

const M = 0.7;
function train(cv, st, zs, o) {
  const tot = M * (zs[0] / 2 + zs[zs.length - 1] / 2) + M * zs.slice(0, -1).reduce((a, z, i) => a + (z + zs[i + 1]) / 2, 0);
  const s = Math.min(7, (o.w - 30) / (tot + 2 * M * 2)), cy = 215;
  const x0 = o.center ? (880 - (tot + 2 * M) * s) / 2 : o.x0;
  let x = x0 + (M * zs[0] / 2 + M) * s;
  const ph = phases(zs), names = ['A', 'B', 'C'], fills = ['a', 'b', 'c'], shapes = ['circle', 'square', 'diamond'];
  const al = -st.al;  // A は右回り
  zs.forEach((z, i) => {
    if (i) x += M * (zs[i - 1] + z) / 2 * s;
    const ratio = zs[0] / z * (i % 2 ? -1 : 1), ang = ph[i] + al * ratio;
    gear(cv, [x, cy], z, M, s, ang, { fill: fills[i], shape: shapes[i] });
    const R = (M * z / 2 + M) * s;
    turnArrow(cv, [x, cy], R + 12, Math.PI / 2 + 0.45 * (i % 2 ? -1 : 1), i % 2 ? 1 : -1, 'sub');
    cv.text(names[i], x, cy + R + 30, { align: 'center', size: 18, bold: true });
    cv.text(`歯 ${z}`, x, cy + R + 52, { align: 'center', size: 15, color: 'sub' });
  });
}
// 回転の数の箱（本の図と同じ ×3・×2・×6）
function boxes(cv, st, zs, x0, y0) {
  const turns = zs.map(z => st.al / (2 * Math.PI) * zs[0] / z), fills = ['a', 'b', 'c'];
  zs.forEach((z, i) => {
    const x = x0 + i * 120;
    cv.rect(x, y0, 96, 64, { fill: 'bg', alpha: 1, color: fills[i], width: 2.5 });
    cv.text(['A', 'B', 'C'][i], x + 48, y0 + 18, { align: 'center', size: 16, bold: true });
    cv.text(`${A.num(turns[i], 1)} 回転`, x + 48, y0 + 44, { align: 'center', size: 16 });
    if (i) { cv.arrow(x - 22, y0 + 32, x - 2, y0 + 32, { color: 'sub', width: 2 }); cv.text(`×${fmtR(zs[i - 1] / z)}`, x - 12, y0 - 12, { align: 'center', size: 15, bold: true }); }
  });
  const r = zs[0] / zs[2];
  cv.line([[x0 + 48, y0 + 64], [x0 + 48, y0 + 92], [x0 + 288, y0 + 92]], { color: 'ink', width: 2 });
  cv.arrow(x0 + 288, y0 + 92, x0 + 288, y0 + 66, { color: 'ink', width: 2 });
  cv.text(`×${fmtR(r)}（＝ ×${fmtR(zs[0] / zs[1])} × ${fmtR(zs[1] / zs[2])}）`, x0 + 168, y0 + 112, { align: 'center', size: 16, bold: true });
}
const fmtR = r => Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) : A.num(r, 2).replace(/0$/, '');

// ---------- ③ 自転車のチェーン ----------
function drawChain(cv, st) {
  const s = 10.5, zf = 42, zr = st.zr, m = 0.5, c1 = [200, 200], d = 46, c2 = [c1[0] + d * s, 200];
  const r1 = m * zf / 2, r2 = m * zr / 2, beta = Math.asin((r1 - r2) / d), up = Math.PI / 2 - beta;
  const ang = -st.al;  // 右回り
  gear(cv, c1, zf, m, s, ang, { fill: 'a', shape: 'circle' });
  gear(cv, c2, zr, m, s, ang * zf / zr, { fill: 'b', shape: 'square' });
  // チェーン（ピッチ円の外の接線）
  const P = (c, r, a) => [c[0] + r * s * Math.cos(a), c[1] - r * s * Math.sin(a)];
  cv.line([P(c1, r1, up), P(c2, r2, up)], { color: 'ink', width: 3 });
  cv.line([P(c1, r1, -up), P(c2, r2, -up)], { color: 'ink', width: 3 });
  const arc = (c, r, a0, a1) => { const pts = []; for (let q = 0; q <= 40; q++) pts.push(P(c, r, a0 + (a1 - a0) * q / 40)); cv.line(pts, { color: 'ink', width: 3 }); };
  arc(c1, r1, up, 2 * Math.PI - up); arc(c2, r2, -up, up);
  // チェーンの動き（くさりの目）
  const top = [P(c1, r1, up), P(c2, r2, up)], L = Math.hypot(top[1][0] - top[0][0], top[1][1] - top[0][1]);
  const run = (st.al * r1 * s) % 24;
  for (let u = run; u < L; u += 24) { const f = u / L; cv.dot(A.lerp(top[0][0], top[1][0], f), A.lerp(top[0][1], top[1][1], f), { color: 'e', r: 4, shape: 'square' }); }
  for (let u = run; u < L; u += 24) { const f = 1 - u / L, b = [P(c1, r1, -up), P(c2, r2, -up)]; cv.dot(A.lerp(b[0][0], b[1][0], f), A.lerp(b[0][1], b[1][1], f), { color: 'e', r: 4, shape: 'square' }); }
  // ペダル
  const pe = [c1[0] + 70 * Math.cos(ang + 2.2), c1[1] - 70 * Math.sin(ang + 2.2)];
  cv.line([c1, pe], { color: 'sub', width: 6 });
  cv.rect(pe[0] - 16, pe[1] - 6, 32, 12, { fill: 'sub', alpha: 0.8 });
  cv.text(`前　歯 ${zf}`, c1[0], 345, { align: 'center', size: 16 });
  cv.text(`後ろ　歯 ${zr}`, c2[0], 345, { align: 'center', size: 16 });
  turnArrow(cv, c1, r1 * s + 26, Math.PI / 2 + 0.45, -1, 'sub');
  turnArrow(cv, c2, r2 * s + 22, Math.PI / 2 + 0.45, -1, 'sub');
  const pt = st.al / (2 * Math.PI);
  cv.text(`ペダル ${A.num(pt, 1)} 回転 → 後ろのタイヤ ${A.num(pt * zf / zr, 1)} 回転`, 440, 392, { align: 'center', size: 17, bold: true });
}

A.item({
  id: 'm1-19', title: '《歯車|はぐるま》の《回転|かいてん》と《比|ひ》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-5「《比|ひ》」の《図|ず》から（5-6・2-15、《物理|ぶつり》 《力|りき》-6・《力|りき》-7・《電|でん》-12 でも《使|つか》う）',
  W: 880, H: 420,
  state: { al: 0, zb: 16, zc: 8, zr: 14 },
  scenes: [
    {
      key: 'kaiten', label: '① A:B:C ＝ 1:3:6',
      lead: '《歯|は》の《数|かず》は A 48、B 16、C 8。▶ で A を1《回転|かいてん》させます。B と C は《何回転|なんかいてん》するでしょう。',
      note: 'かみ《合|あ》ったところでは、《歯|は》が《同|おな》じ《数|かず》ずつ《送|おく》られます。A が1《回転|かいてん》で《歯|は》48こ → B は $48÷16=3$ 《回転|かいてん》（×3）、B が1《回転|かいてん》で C は $16÷8=2$ 《回転|かいてん》（×2）。**《比|ひ》はかけ《算|ざん》でつながり**、C は $3\\times2=6$ 《回転|かいてん》。$\\mathrm{A}:\\mathrm{B}:\\mathrm{C}=1:3:6$ です。かみ《合|あ》うとなりどうしは、《逆|ぎゃく》《向|む》きに《回|まわ》ります。',
      miss: '「×3 と ×2 で、たして ×5」ではありません。つなぐときは、かけ《算|ざん》で ×6 です。',
      legend: [['A（しるし ●）', { color: 'a', shape: 'circle', noline: true }], ['B（しるし ■）', { color: 'b', shape: 'square', noline: true }], ['C（しるし ◆）', { color: 'c', shape: 'diamond', noline: true }], ['《回|まわ》る《向|む》き', { color: 'sub' }]],
      init(st) { st.al = 0; },
      step(st, dt) { st.al = Math.min(2 * Math.PI, st.al + dt * 2 * Math.PI / 7); if (st.al >= 2 * Math.PI) return false; },
      controls: [{ range: 'al', label: 'A の《回|まわ》った《量|りょう》', min: 0, max: 2 * Math.PI, step: 0.01, fmt: v => A.num(v / (2 * Math.PI), 2) + ' 《回転|かいてん》' }],
      draw(cv, st) { train(cv, st, [48, 16, 8], { x0: 20, w: 430 }); boxes(cv, st, [48, 16, 8], 520, 140); },
      readout: st => { const a = st.al / (2 * Math.PI); return `A ${A.num(a, 2)} 《回転|かいてん》 → B ${A.num(3 * a, 2)} 《回転|かいてん》 → C ${A.num(6 * a, 2)} 《回転|かいてん》`; }
    },
    {
      key: 'hasuu', label: '② 《歯|は》の《数|かず》を《変|か》える',
      lead: 'B と C の《歯|は》の《数|かず》を《変|か》えて ▶。A（《歯|は》48）が1《回転|かいてん》すると、C は《何回転|なんかいてん》するでしょう。',
      note: 'A → B は ×(48÷B の《歯|は》)、B → C は ×(B の《歯|は》÷C の《歯|は》)。かけると、B の《歯|は》の《数|かず》は《約分|やくぶん》されて、A → C は ×(48÷C の《歯|は》)。**まん《中|なか》の B を《変|か》えても、C の《回転|かいてん》は《変|か》わりません**（《向|む》きは《変|か》わりません）。',
      state: { zb: 16, zc: 8 },
      legend: [['A（しるし ●）', { color: 'a', shape: 'circle', noline: true }], ['B（しるし ■）', { color: 'b', shape: 'square', noline: true }], ['C（しるし ◆）', { color: 'c', shape: 'diamond', noline: true }]],
      controls: [{ range: 'zb', label: 'B の《歯|は》の《数|かず》', min: 8, max: 48, step: 4, d: 0, on: re }, { range: 'zc', label: 'C の《歯|は》の《数|かず》', min: 8, max: 48, step: 4, d: 0, on: re }],
      init(st) { st.al = 0; },
      step(st, dt) { st.al = Math.min(2 * Math.PI, st.al + dt * 2 * Math.PI / 7); if (st.al >= 2 * Math.PI) return false; },
      draw(cv, st) { train(cv, st, [48, st.zb, st.zc], { x0: 20, w: 840, center: true }); },
      readout: st => `A:B ＝ 1:${fmtR(48 / st.zb)}　B:C ＝ 1:${fmtR(st.zb / st.zc)}　→　A:C ＝ 1:${fmtR(48 / st.zb)}×${fmtR(st.zb / st.zc)} ＝ <b>1:${fmtR(48 / st.zc)}</b>　（A ${A.num(st.al / (2 * Math.PI), 2)} 《回転|かいてん》）`
    },
    {
      key: 'jitensha', label: '③ 《自転車|じてんしゃ》のギア',
      lead: '《自転車|じてんしゃ》の《前|まえ》のギアは《歯|は》42。《後|うし》ろのギアを《変|か》えて ▶。ペダル1《回転|かいてん》で、《後|うし》ろのタイヤは《何回転|なんかいてん》するでしょう。',
      note: 'チェーンも、《歯|は》を《同|おな》じ《数|かず》ずつ《送|おく》ります。《後|うし》ろの《歯|は》14なら $42÷14=3$ 《回転|かいてん》、21なら2《回転|かいてん》、28なら1.5《回転|かいてん》。タイヤ1《回転|かいてん》で《約|やく》2 m《進|すす》むので、ペダル1《回転|かいてん》で《約|やく》6 m・4 m・3 m です。チェーンでつなぐと、2つのギアは《同|おな》じ《向|む》きに《回|まわ》ります。',
      state: { zr: 14 },
      legend: [['《前|まえ》のギア（しるし ●）', { color: 'a', shape: 'circle', noline: true }], ['《後|うし》ろのギア（しるし ■）', { color: 'b', shape: 'square', noline: true }], ['チェーン', { color: 'ink' }]],
      controls: [{ seg: 'zr', label: '《後|うし》ろの《歯|は》の《数|かず》', options: [[14, '14'], [21, '21'], [28, '28']], on: re }],
      init(st) { st.al = 0; },
      step(st, dt) { st.al = Math.min(2 * Math.PI, st.al + dt * 2 * Math.PI / 6); if (st.al >= 2 * Math.PI) return false; },
      draw(cv, st) { drawChain(cv, st); },
      readout: st => `${42}÷${st.zr} ＝ <b>${fmtR(42 / st.zr)} 《回転|かいてん》</b>　→　《進|すす》む《道|みち》のり 《約|やく》 ${fmtR(42 / st.zr * 2)} m`
    }
  ]
});
function re(st) { st.al = 0; }

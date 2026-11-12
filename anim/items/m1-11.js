// @id m1-11
// @title 円と 四角を ころがす
// @vol 数学1
// @from 数学 1-19 円と四角（ch1-19）／1-15・2-9・力-7・4-8 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 本の数：半径 5 cm の円、1辺 10 cm の正方形。中心の高さは 円 5 cm、正方形 5 cm〜7 cm ほど（5√2 ＝ 7.07）。

const K = 11;                         // 1 cm を 11 px
const SQ = 10, RC = 5, HD = SQ / Math.SQRT2;
// 正方形を すべらせずに ころがす：s cm すすむ ごとに 90°（10 cm で 1かい）
function squareAt(s) {
  const k = Math.floor(s / SQ), phi = (s - k * SQ) / SQ * Math.PI / 2, px = (k + 1) * SQ;
  const ca = Math.PI * 0.75 - phi, cx = px + HD * Math.cos(ca), cy = HD * Math.sin(ca);
  const pts = [0, 1, 2, 3].map(j => { const a = ca + Math.PI + j * Math.PI / 2; return [cx + HD * Math.cos(a), cy + HD * Math.sin(a)]; });
  const psi = -s / SQ * Math.PI / 2, mark = [cx + HD * Math.cos(-Math.PI / 4 + psi), cy + HD * Math.sin(-Math.PI / 4 + psi)];
  return { cx, cy, pts, mark };
}
const sqH = s => squareAt(s).cy;
function lane(cv, gy, x0, label) {
  cv.line([[x0 - 20, gy], [x0 + 46 * K, gy]], { color: 'ink', width: 3 });
  for (let x = x0 - 20; x < x0 + 46 * K; x += 16) cv.line([[x, gy + 2], [x - 8, gy + 10]], { color: 'line', width: 1.5 });
  cv.text(label, 20, gy - 150, { size: 17, bold: true });
}
function drawRoll(cv, st) {
  const s = st.s, x0 = 60;
  // 円
  const g1 = 200, cX = x => x0 + x * K, cY = (gy, h) => gy - h * K;
  lane(cv, g1, x0, 'えん（はんけい 5cm）');
  cv.line([[cX(RC), cY(g1, RC)], [cX(RC + s), cY(g1, RC)]], { color: 'b', width: 3, style: 'dash' });
  const ccx = cX(RC + s), ccy = cY(g1, RC), ang = s / RC;
  cv.circle(ccx, ccy, RC * K, { fill: 'panel', alpha: 1, color: 'ink', width: 2.5 });
  cv.line([[ccx, ccy], [ccx + RC * K * Math.sin(ang), ccy - RC * K * Math.cos(ang)]], { color: 'a', width: 2.5 });
  cv.line([[ccx, ccy], [ccx, g1]], { color: 'c', width: 2, style: 'dot' });
  cv.dot(ccx, ccy, { r: 6, color: 'b' });
  cv.text('5cm', ccx + 8, (ccy + g1) / 2, { size: 15, color: 'c', bold: true, bg: true });
  // 四角
  const g2 = 420;
  lane(cv, g2, x0, 'しかく（1へん 10cm）');
  const path = []; for (let u = 0; u <= s + 1e-9; u += 0.25) { const q = squareAt(Math.min(u, s)); path.push([cX(q.cx), cY(g2, q.cy)]); }
  cv.line([[cX(SQ / 2), cY(g2, SQ / 2)], [cX(SQ / 2 + 40), cY(g2, SQ / 2)]], { color: 'line', width: 1.5, style: 'dash' });
  if (path.length > 1) cv.line(path, { color: 'b', width: 3 });
  const q = squareAt(s);
  cv.poly(q.pts.map(p => [cX(p[0]), cY(g2, p[1])]), { fill: 'panel', alpha: 1, color: 'ink', width: 2.5 });
  cv.line([[cX(q.cx), cY(g2, q.cy)], [cX(q.mark[0]), cY(g2, q.mark[1])]], { color: 'a', width: 2.5 });
  cv.line([[cX(q.cx), cY(g2, q.cy)], [cX(q.cx), g2]], { color: 'c', width: 2, style: 'dot' });
  cv.dot(cX(q.cx), cY(g2, q.cy), { r: 6, color: 'b', shape: 'square' });
  cv.text(`${A.num(q.cy, 1)}cm`, cX(q.cx) + 8, (cY(g2, q.cy) + g2) / 2, { size: 15, color: 'c', bold: true, bg: true });
}

// ---------- ② くるまの ゆれ ----------
function drawCar(cv, st) {
  const s = st.s, sq = st.tire === 'sq', x0 = 70, gy = 230;
  const KC = 7, h = sq ? sqH(s) : RC, X = x => x0 + x * KC, r = RC * KC;
  cv.line([[20, gy], [860, gy]], { color: 'ink', width: 3 });
  // タイヤ 2つ（ぜんぶ おなじ むき）
  const wheels = [X(s + 5), X(s + 30)], cy = gy - h * KC;
  for (const wx of wheels) {
    if (sq) { const q = squareAt(s); cv.poly(q.pts.map(p => [wx + (p[0] - q.cx) * KC, cy - (p[1] - q.cy) * KC]), { fill: 'ink', alpha: 0.85, color: 'ink', width: 2 }); }
    else { cv.circle(wx, cy, r, { fill: 'ink', alpha: 0.85, color: 'ink', width: 2 }); const a = s / RC; cv.line([[wx, cy], [wx + r * Math.sin(a), cy - r * Math.cos(a)]], { color: 'bg', width: 2 }); }
    cv.dot(wx, cy, { r: 5, color: 'b', shape: sq ? 'square' : 'circle' });
  }
  // 車体（中心の 高さで 上下）
  cv.rect(wheels[0] - 50, cy - 100, wheels[1] - wheels[0] + 100, 52, { fill: sq ? 'b' : 'a', alpha: 0.6, color: 'ink', width: 2 });
  cv.rect(wheels[0] + 10, cy - 142, wheels[1] - wheels[0] - 50, 42, { fill: 'panel', alpha: 1, color: 'ink', width: 2 });
  cv.line([[wheels[0], cy - 48], [wheels[0], cy]], { color: 'ink', width: 3 }); cv.line([[wheels[1], cy - 48], [wheels[1], cy]], { color: 'ink', width: 3 });
  cv.line([[20, gy - 7.07 * KC - 100], [860, gy - 7.07 * KC - 100]], { color: 'line', width: 1, style: 'dot' }); cv.line([[20, gy - 5 * KC - 100], [860, gy - 5 * KC - 100]], { color: 'line', width: 1, style: 'dot' });
  // グラフ：中心の 高さ
  const gx0 = 90, gx1 = 830, gb = 420, gp = 18, GX = v => gx0 + v / 60 * (gx1 - gx0), GY = v => gb - (v - 3) * gp;
  cv.text('ちゅうしんの たかさ（cm）', gx0, gb - 92, { size: 15, color: 'sub' });
  for (const v of [4, 5, 6, 7]) { cv.line([[gx0, GY(v)], [gx1, GY(v)]], { color: 'grid', width: 1 }); cv.text(String(v), gx0 - 8, GY(v), { align: 'right', size: 15 }); }
  cv.line([[gx0, gb], [gx1, gb]], { color: 'ink', width: 1.5 }); cv.line([[gx0, gb], [gx0, GY(7.6)]], { color: 'ink', width: 1.5 });
  for (const v of [0, 10, 20, 30, 40, 50, 60]) cv.text(String(v), GX(v), gb + 14, { align: 'center', size: 14, color: 'sub' });
  cv.text('すすんだ きょり（cm）', gx1, gb + 34, { align: 'right', size: 14, color: 'sub' });
  const ptsC = [], ptsS = [];
  for (let u = 0; u <= s + 1e-9; u += 0.2) { ptsC.push([GX(u), GY(RC)]); ptsS.push([GX(u), GY(sqH(u))]); }
  if (ptsC.length > 1) { cv.line(ptsC, { color: 'a', width: 3 }); cv.line(ptsS, { color: 'b', width: 3, style: 'dash' }); }
}
// ---------- ③ マンホールの ふた ----------
function drawFuta(cv, st) {
  const th = st.th, D = 10, cy = 210;
  const shapes = [['まる（ちょっけい 10cm）', 230, false], ['しかく（1へん 10cm）', 640, true]];
  for (const [nm, cx, sq] of shapes) {
    cv.text(nm, cx, 46, { align: 'center', size: 17, bold: true });
    let w;
    if (sq) {
      const pts = [0, 1, 2, 3].map(j => { const a = th + Math.PI / 4 + j * Math.PI / 2; return [cx + HD * K * 1.15 * Math.cos(a), cy + HD * K * 1.15 * Math.sin(a)]; });
      cv.poly(pts, { fill: 'sub', alpha: 0.35, color: 'ink', width: 2.5 });
      w = SQ * (Math.abs(Math.cos(th)) + Math.abs(Math.sin(th)));
    } else {
      cv.circle(cx, cy, D / 2 * K * 1.15, { fill: 'sub', alpha: 0.35, color: 'ink', width: 2.5 });
      for (let j = 0; j < 6; j++) { const a = th + j * Math.PI / 6; cv.line([[cx - 4 * K * Math.cos(a), cy - 4 * K * Math.sin(a)], [cx + 4 * K * Math.cos(a), cy + 4 * K * Math.sin(a)]], { color: 'line', width: 1 }); }
      w = D;
    }
    // はば（よこの ものさし）
    const half = w / 2 * K * 1.15, yb = cy + 130;
    cv.line([[cx - half, cy - 105], [cx - half, yb]], { color: 'a', width: 2, style: 'dash' });
    cv.line([[cx + half, cy - 105], [cx + half, yb]], { color: 'a', width: 2, style: 'dash' });
    cv.arrow(cx, yb - 8, cx - half, yb - 8, { color: 'a', width: 2 }); cv.arrow(cx, yb - 8, cx + half, yb - 8, { color: 'a', width: 2 });
    cv.text(`はば ${A.num(w, 1)}cm`, cx, yb + 18, { align: 'center', size: 18, bold: true, color: sq && w > 10.05 ? 'b' : 'a' });
  }
  cv.text('ふたを ゆびで まわそう', 440, 410, { align: 'center', size: 15, color: 'sub' });
}

A.item({
  id: 'm1-11', title: '《円|えん》と 《四角|しかく》を ころがす', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-19「《円|えん》と 《四角|しかく》」の《図|ず》から（1-15、 2-9、 《物理|ぶつり》 《力|りき》-7 でも つかう）',
  W: 880, H: 460,
  state: { s: 0, tire: 'sq', th: 0 },
  scenes: [
    {
      key: 'korogaru', label: '① ころがすと',
      lead: '《円|えん》と 《四角|しかく》を ころがして、 《中心|ちゅうしん》（●・■）の とおり《道|みち》を 《見|み》よう。',
      note: '《円|えん》が ころがる とき、 《地面|じめん》から 《中心|ちゅうしん》までは、 いつも 《半径|はんけい》の 《長|なが》さ（5cm）です。 《四角|しかく》は、 《辺|へん》で 《立|た》つ ときは 5cm、 かどで 《立|た》つ ときは 7cm ほど。 《中心|ちゅうしん》が 《上|あ》がったり 《下|さ》がったり します。',
      legend: [['《中心|ちゅうしん》の とおり《道|みち》', { color: 'b' }], ['《地面|じめん》から 《中心|ちゅうしん》まで', { color: 'c', style: 'dot' }], ['《円|えん》の 《中心|ちゅうしん》', { color: 'b', shape: 'circle', noline: true }], ['《四角|しかく》の 《中心|ちゅうしん》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 's', label: 'ころがした きょり', min: 0, max: 40, step: 0.5, d: 1, fmt: v => A.num(v, 0) + 'cm' }],
      init(st) { st.s = 0; },
      step(st, dt) { if (st.s >= 40) return false; st.s = Math.min(40, st.s + dt * 5); },
      draw(cv, st) { drawRoll(cv, st); },
      readout: st => `《中心|ちゅうしん》の 《高|たか》さ：《円|えん》 <b>5cm</b>、 《四角|しかく》 <b>${A.num(sqH(st.s), 1)}cm</b>`
    },
    {
      key: 'kuruma', label: '② 《四角|しかく》い タイヤの 《車|くるま》',
      lead: '《四角|しかく》い タイヤの 《車|くるま》が はしったら、 どう なるかな？ まるい タイヤと くらべよう。',
      note: '《四角|しかく》い タイヤは、 ころがる たびに 《車|くるま》が 5cm と 7cm ほどの 《間|あいだ》を 《上|あ》がったり 《下|さ》がったり します。 だから がたがた ゆれます。 **《円|えん》の 《半径|はんけい》は どこも 《同|おな》じ 《長|なが》さ。 だから、 ころがしても 《中心|ちゅうしん》の 《高|たか》さが かわらない**。',
      legend: [['まるい タイヤの 《中心|ちゅうしん》の 《高|たか》さ', { color: 'a' }], ['《四角|しかく》い タイヤの 《中心|ちゅうしん》の 《高|たか》さ', { color: 'b', style: 'dash' }]],
      state: { tire: 'sq' },
      controls: [{ seg: 'tire', label: 'タイヤ', options: [['sq', '《四角|しかく》'], ['en', 'まる']] }],
      init(st) { st.s = 0; },
      step(st, dt) { if (st.s >= 60) return false; st.s = Math.min(60, st.s + dt * 6); },
      draw(cv, st) { drawCar(cv, st); },
      readout: st => `${st.tire === 'sq' ? '《四角|しかく》い' : 'まるい'} タイヤ：《中心|ちゅうしん》の 《高|たか》さ <b>${A.num(st.tire === 'sq' ? sqH(st.s) : 5, 1)}cm</b>`
    },
    {
      key: 'futa', label: '③ マンホールの ふた',
      lead: 'まるい ふたと 《四角|しかく》い ふたを まわして、 よこの はばを はかって みよう。',
      note: 'まるい ふたは、 どの 《向|む》きでも はばが 《同|おな》じ（《直径|ちょっけい》）。 だから、 あなに おちません。 《四角|しかく》い ふたは、 ななめに すると はばが 14cm ほどに なり、 《向|む》きで はばが かわります。',
      legend: [['よこの はば', { color: 'a', style: 'dash' }]],
      init(st) { st.th = 0; },
      step(st, dt) { st.th += dt * 0.6; if (st.th > Math.PI) { st.th = Math.PI; return false; } },
      draw(cv, st) { drawFuta(cv, st); },
      drag: { hit(st, x, y) { return { x0: x, th0: st.th }; }, move(st, x, y, api, h) { st.th = h.th0 + (x - h.x0) / 120; } },
      readout: st => `まわした ${Math.round(((st.th * 180 / Math.PI) % 360 + 360) % 360)}°：まるい ふた <b>10cm</b>、 《四角|しかく》い ふた <b>${A.num(SQ * (Math.abs(Math.cos(st.th)) + Math.abs(Math.sin(st.th))), 1)}cm</b>`
    }
  ]
});

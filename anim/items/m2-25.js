// @id m2-25
// @title 外積の向きと大きさ：右ねじとトルク
// @vol 数学4
// @uses 3d
// @from 数学 4-14 ②⑤⑦⑧（ch4-14 の外積・トルク）／力-6・電-6・電-12 でも使う
'use strict';
A.item({
  id: 'm2-25', title: '外積の向きと大きさ：右ねじとトルク',
  from: '数学 第4巻 4-14 ②⑤⑦⑧ の図から（物理 力-6・電-6・電-12 でも使う）',
  W: 880, H: 440,
  state: { yaw: -35, pitch: 22, ang: 60, la: 2, lb: 1.5, swap: false, F: 30, phi: 90 },
  scenes: [
    {
      key: 'gaiseki', label: '① a×b は面に垂直',
      lead: '2つの矢印 $\\vec a$・$\\vec b$ のあいだの角を変えてみましょう。図はドラッグで回せます。',
      note: '$\\vec a\\times\\vec b$ は、$\\vec a$ と $\\vec b$ がつくる平行四辺形に**垂直**で、長さは平行四辺形の面積 $|\\vec a||\\vec b|\\sin\\theta$ です。$\\vec a$ から $\\vec b$ へ右ねじを回すと、ねじが進む向きです。',
      miss: '順番を入れかえると、向きが反対になります（$\\vec b\\times\\vec a=-\\vec a\\times\\vec b$）。「順番」のボタンでたしかめましょう。',
      legend: [['$\\vec a$', { color: 'a' }], ['$\\vec b$', { color: 'b', style: 'dash' }], ['$\\vec a\\times\\vec b$（順番を入れかえると反対）', { color: 'c', style: 'long' }], ['平行四辺形（面積＝長さ）', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'ang', label: 'あいだの角 $\\theta$', min: 0, max: 180, step: 1, fmt: v => v + '°' }, { range: 'lb', label: '$|\\vec b|$', min: 0.5, max: 2.5, step: 0.05 }, { seg: 'swap', label: '順番', options: [[false, '$\\vec a\\times\\vec b$'], [true, '$\\vec b\\times\\vec a$']] }],
      drag: A.rotDrag([0, 0, 880, 440]),
      draw(cv, st) { draw3(cv, st, false); },
      readout: st => `面積 ＝ ${A.num(st.la)} × ${A.num(st.lb)} × sin ${st.ang}° ＝ <b>${A.num(st.la * st.lb * Math.sin(st.ang * Math.PI / 180))}</b>（外積の長さ）`
    },
    {
      key: 'torque', label: '② レンチとトルク',
      lead: 'レンチを押す向き（角 $\\varphi$）を変えると、ボルトを回すはたらき（トルク）はどう変わるでしょう。',
      note: '回すのに効くのは、力のうち腕に**垂直な成分** $F\\sin\\varphi$ だけです。トルクの大きさは $rF\\sin\\varphi$ で、向きは $\\vec r\\times\\vec F$ です。',
      miss: '腕にそった成分 $F\\cos\\varphi$ は、ボルトを引っぱるだけで、回しません。cos を使うのはまちがいです。',
      state: { yaw: -60, pitch: 30 },
      legend: [['腕 $\\vec r$', { color: 'a' }], ['力 $\\vec F$', { color: 'b', style: 'dash' }], ['回すのに効く成分 $F\\sin\\varphi$', { color: 'b', style: 'dot' }], ['トルク $\\vec r\\times\\vec F$', { color: 'c', style: 'long' }]],
      controls: [{ range: 'phi', label: '押す角 $\\varphi$', min: 0, max: 180, step: 1, fmt: v => v + '°' }, { range: 'F', label: '力 $F$〔N〕', min: 0, max: 50, step: 1, d: 0 }],
      drag: A.rotDrag([0, 0, 880, 440]),
      draw(cv, st) { draw3(cv, st, true); },
      readout: st => `トルク ＝ 0.20 m × ${st.F} N × sin ${st.phi}° ＝ <b>${A.num(0.2 * st.F * Math.sin(st.phi * Math.PI / 180), 2)} N·m</b>`
    }
  ]
});

function draw3(cv, st, torque) {
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 85, center: [0, 0, 0.6] });
  V.axes3({ len: 2.6 });
  // 床の方眼（xy 平面）
  for (let k = -2; k <= 2; k++) { V.line3([[k, -2, 0], [k, 2, 0]], { color: 'grid', width: 1, zbias: -5 }); V.line3([[-2, k, 0], [2, k, 0]], { color: 'grid', width: 1, zbias: -5 }); }
  if (!torque) {
    const t = st.ang * Math.PI / 180, a = [st.la, 0, 0], b = [st.lb * Math.cos(t), st.lb * Math.sin(t), 0];
    const cr = [0, 0, st.la * st.lb * Math.sin(t) * 0.6 * (st.swap ? -1 : 1)];
    V.poly3([[0, 0, 0], a, [a[0] + b[0], a[1] + b[1], 0], b], { fill: 'c', alpha: 0.15, color: 'c', style: 'dot', width: 1.5 });
    V.arrow3([0, 0, 0], a, { color: 'a', width: 3 }); V.arrow3([0, 0, 0], b, { color: 'b', width: 3, style: 'dash' });
    if (Math.abs(cr[2]) > 0.02) V.arrow3([0, 0, 0], cr, { color: 'c', width: 3.5, style: 'long' });
    V.text3('a', a.map(v => v * 1.08), { math: true, italic: true, bold: true, size: 18, color: 'a' });
    V.text3('b', b.map(v => v * 1.15), { math: true, italic: true, bold: true, size: 18, color: 'b' });
    V.text3(st.swap ? 'b×a' : 'a×b', [0.15, 0, cr[2] + (cr[2] >= 0 ? 0.25 : -0.25)], { math: true, italic: true, bold: true, size: 18, color: 'c' });
    // 右ねじ：回る向きの弧
    const sgn = st.swap ? -1 : 1, arc = [];
    for (let k = 0; k <= 20; k++) { const u = (st.swap ? t * (1 - k / 20) : t * k / 20); arc.push([0.5 * Math.cos(u), 0.5 * Math.sin(u), 0.02]); }
    V.line3(arc, { color: 'ink', width: 2 });
    const e = arc[arc.length - 1], e2 = arc[arc.length - 2]; V.arrow3(e2, e, { color: 'ink', width: 2, head: 10 }); void sgn;
  } else {
    const p = st.phi * Math.PI / 180, r = [2, 0, 0], F = st.F / 25, f = [F * Math.cos(p), F * Math.sin(p), 0];
    V.poly3([[-0.25, -0.12, 0], [2.1, -0.12, 0], [2.1, 0.12, 0], [-0.25, 0.12, 0]], { fill: 'sub', alpha: 0.25, color: 'sub', width: 1 });
    V.line3([[0, 0, -0.3], [0, 0, 0.3]], { color: 'ink', width: 6 });
    V.arrow3([0, 0, 0], r, { color: 'a', width: 3 });
    V.arrow3(r, [r[0] + f[0], f[1], 0], { color: 'b', width: 3, style: 'dash' });
    V.arrow3(r, [r[0], f[1], 0], { color: 'b', width: 3, style: 'dot' });
    const tq = 2 * F * Math.sin(p) * 0.5;
    if (Math.abs(tq) > 0.02) V.arrow3([0, 0, 0], [0, 0, tq], { color: 'c', width: 3.5, style: 'long' });
    V.text3('r', [1, -0.35, 0], { math: true, italic: true, bold: true, size: 18, color: 'a' });
    V.text3('F', [r[0] + f[0] * 1.1, f[1] * 1.1 + 0.15, 0], { math: true, italic: true, bold: true, size: 18, color: 'b' });
  }
  V.flush();
}

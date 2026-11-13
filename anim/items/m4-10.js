// @id m4-10
// @title 同じ山の3つの見方：鳥かん図・等高線・切り口
// @vol 数学8
// @uses 3d
// @from 数学 8-1 図2・3・8（ch8-01:174・193・495）、8-2 図2（ch8-02:195）、8-6 図9（ch8-06:754）
'use strict';
// 主役の山 h=100−0.01x²−0.02y²（x：東へ m、y：北へ m）。3次元の図では 50 m を1目もりにした
const h = (x, y) => 100 - 0.01 * x * x - 0.02 * y * y;
const H0 = (x, y) => Math.max(0, h(x, y));
const S = 50, P3 = (x, y, z) => [x / S, y / S, z / S];
const DG = Math.PI / 180;

function mountain(V, o = {}) {
  // ふもと（h=0）の外は平らな地面。山の面は、だ円の形の網（x=100r cosθ、y=70.7r sinθ、h=100(1−r²)）でかく
  for (let i = -5; i < 5; i++) for (let j = -4; j < 4; j++) V.poly3([P3(i * 22, j * 20, 0), P3(i * 22 + 22, j * 20, 0), P3(i * 22 + 22, j * 20 + 20, 0), P3(i * 22, j * 20 + 20, 0)], { fill: 'grid', alpha: 0.6, color: 'line', width: 0.5, zbias: -50 });
  const nr = 10, nt = 36, Q = (r, t) => P3(100 * r * Math.cos(t), 70.71 * r * Math.sin(t), 100 * (1 - r * r));
  for (let i = 0; i < nr; i++) for (let j = 0; j < nt; j++) {
    const r0 = i / nr, r1 = (i + 1) / nr, t0 = j / nt * 2 * Math.PI, t1 = (j + 1) / nt * 2 * Math.PI;
    V.poly3([Q(r0, t0), Q(r1, t0), Q(r1, t1), Q(r0, t1)], { fill: 'c', alpha: 0.16, color: 'sub', width: 0.5 });
  }
  // 等高線（10 m ごと。短く分けて、奥行きの順にかく）
  if (o.rings !== false) for (let c = 10; c <= 90; c += 10) ring(V, c, c === 80 ? { color: 'b', width: 2.5 } : c === 50 ? { color: 'e', width: 2.2 } : { color: 'c', width: 1.2 });
}
function ring(V, c, o) {
  const a = Math.sqrt((100 - c) / 0.01), b = Math.sqrt((100 - c) / 0.02), N = 60;
  for (let k = 0; k < N; k++) { const t0 = k / N * 2 * Math.PI, t1 = (k + 1) / N * 2 * Math.PI; V.line3([P3(a * Math.cos(t0), b * Math.sin(t0), c + 0.3), P3(a * Math.cos(t1), b * Math.sin(t1), c + 0.3)], Object.assign({ zbias: 0.02 }, o)); }
}
// 右の等高線の地図
function contourMap(cv, box, hl) {
  const v = cv.view({ x0: -100, x1: 100, y0: -75, y1: 75, box, equal: true });
  v.axes({ xt: [-100, -50, 50, 100], yt: [-50, 50], xl: 'x（東）', yl: 'y（北）', grid: false });
  for (let c = 0; c <= 90; c += 10) {
    const a = Math.sqrt((100 - c) / 0.01), b = Math.sqrt((100 - c) / 0.02);
    v.param(t => a * Math.cos(t), t => b * Math.sin(t), 0, 2 * Math.PI, { n: 120, color: c === 80 ? 'b' : c === 50 ? 'e' : 'c', width: c % 50 === 0 || c === 80 ? 2 : 1 });
  }
  v.text('▲100', 0, 0, { size: 14, align: 'center' });
  if (hl != null && hl < 100 && hl >= 0) { const a = Math.sqrt((100 - hl) / 0.01), b = Math.sqrt((100 - hl) / 0.02); v.param(t => a * Math.cos(t), t => b * Math.sin(t), 0, 2 * Math.PI, { n: 120, color: 'd', width: 3.5, style: 'dash' }); }
  return v;
}

function drawChokan(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 540, 440], yaw: st.yaw, pitch: st.pitch, scale: 105, center: [0, 0, 0.75], persp: 0 });
  mountain(V);
  // 水平の板（高さ z）
  const z = st.z, pl = [[-110, -80], [110, -80], [110, 80], [-110, 80]].map(p => P3(p[0], p[1], z));
  V.poly3(pl, { fill: 'd', alpha: 0.12, color: 'd', width: 1, zbias: 0.01 });
  if (z < 100) ring(V, z, { color: 'd', width: 4, style: 'dash', zbias: 0.05 });
  V.text3('▲100 m', P3(0, 0, 106), { size: 14, align: 'center' });
  V.text3('東', P3(115, 0, 0), { size: 15, color: 'sub', align: 'center' }); V.text3('北', P3(0, 85, 0), { size: 15, color: 'sub', align: 'center' });
  V.flush();
  contourMap(cv, [560, 40, 310, 250], z);
  cv.text('上から見た地図（等高線）', 715, 24, { size: 15, bold: true, align: 'center' });
  cv.text('板の高さ ' + Math.round(z) + ' m の切り口', 715, 316, { size: 15, color: 'd', bold: true, align: 'center' });
  if (z < 100) cv.text('＝ 東西の半径 ' + A.num(Math.sqrt((100 - z) / 0.01), 1) + ' m、南北 ' + A.num(Math.sqrt((100 - z) / 0.02), 1) + ' m のだ円', 715, 340, { size: 14, align: 'center' });
  cv.text('図はドラッグで回せます', 20, 420, { size: 14, color: 'sub' });
}

function drawKiru(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 540, 440], yaw: st.yaw, pitch: st.pitch, scale: 105, center: [0, 0, 0.75], persp: 0 });
  mountain(V, { rings: false });
  const x0 = st.x0, y0 = st.y0;
  // 東西の板（y=y0）と南北の板（x=x0）
  V.poly3([P3(-105, y0, 0), P3(105, y0, 0), P3(105, y0, 110), P3(-105, y0, 110)], { fill: 'b', alpha: 0.08, color: 'b', width: 1 });
  V.poly3([P3(x0, -80, 0), P3(x0, 80, 0), P3(x0, 80, 110), P3(x0, -80, 110)], { fill: 'c', alpha: 0.08, color: 'c', width: 1 });
  const seg = (f, a, b, o) => { const N = 40; for (let k = 0; k < N; k++) { const s0 = a + (b - a) * k / N, s1 = a + (b - a) * (k + 1) / N; V.line3([f(s0), f(s1)], o); } };
  const ax = Math.sqrt(Math.max(0, (100 - 0.02 * y0 * y0) / 0.01)), by = Math.sqrt(Math.max(0, (100 - 0.01 * x0 * x0) / 0.02));
  seg(x => P3(x, y0, h(x, y0) + 0.5), -ax, ax, { color: 'b', width: 3.5, zbias: 0.05 });
  seg(y => P3(x0, y, h(x0, y) + 0.5), -by, by, { color: 'c', width: 3.5, style: 'dash', zbias: 0.05 });
  if (h(x0, y0) > 0) { V.dot3(P3(x0, y0, h(x0, y0)), { color: 'd', r: 7, shape: 'diamond', zbias: 1 }); V.text3('P', P3(x0 + 6, y0, h(x0, y0) + 8), { size: 17, bold: true }); }
  V.flush();
  // 右：2つの切り口のグラフ
  const g1 = cv.view({ x0: -100, x1: 100, y0: 0, y1: 110, box: [590, 30, 270, 160] });
  g1.axes({ xt: [-100, -50, 50, 100], yt: [50, 100], xl: 'x', yl: 'h', ay: 0 });
  g1.plot(x => h(x, y0), { color: 'b', width: 2.5 });
  const g2 = cv.view({ x0: -75, x1: 75, y0: 0, y1: 110, box: [590, 250, 270, 160] });
  g2.axes({ xt: [-50, 50], yt: [50, 100], xl: 'y', yl: 'h', ay: 0 });
  g2.plot(y => h(x0, y), { color: 'c', width: 2.5, style: 'dash' });
  const hp = h(x0, y0), sx = -0.02 * x0, sy = -0.04 * y0;
  if (hp > 0) {
    g1.plot(x => hp + sx * (x - x0), { color: 'ink', width: 1.5, style: 'dot', x0: x0 - 25, x1: x0 + 25 }); g1.dot(x0, hp, { color: 'd', r: 6, shape: 'diamond' });
    g2.plot(y => hp + sy * (y - y0), { color: 'ink', width: 1.5, style: 'dot', x0: y0 - 20, x1: y0 + 20 }); g2.dot(y0, hp, { color: 'd', r: 6, shape: 'diamond' });
  }
  cv.text('東西に切る（y ＝ ' + Math.round(y0) + '）：h ＝ ' + A.num(100 - 0.02 * y0 * y0, 0) + ' − 0.01x²', 590, 14, { size: 14, color: 'b', bold: true });
  cv.text('南北に切る（x ＝ ' + Math.round(x0) + '）：h ＝ ' + A.num(100 - 0.01 * x0 * x0, 0) + ' − 0.02y²', 590, 234, { size: 14, color: 'c', bold: true });
}

const VIEWS = { bird: [-35, 30], top: [0, 89.5], south: [0, 2], east: [-90, 2], north: [180, 25] };
function drawMikata(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 125, center: [0, 0, 0.55], persp: 0 });
  mountain(V);
  V.text3('東', P3(118, 0, 0), { size: 16, color: 'sub', align: 'center', bold: true }); V.text3('北', P3(0, 88, 0), { size: 16, color: 'sub', align: 'center', bold: true });
  V.text3('西', P3(-118, 0, 0), { size: 16, color: 'sub', align: 'center' }); V.text3('南', P3(0, -88, 0), { size: 16, color: 'sub', align: 'center' });
  V.flush();
}

A.item({
  id: 'm4-10', title: '同じ山の3つの見方：鳥かん図・等高線・切り口',
  from: '数学 第8巻 8-1「2つの変数の関数」・8-2「偏微分」の図から（8-4・8-6・8-12 でも使う）',
  W: 880, H: 440,
  state: { yaw: -35, pitch: 30, z: 80, x0: 30, y0: 20, v: 'bird' },
  scenes: [
    {
      key: 'chokan', label: '① 鳥かん図と等高線',
      lead: '主役の山 $h=100-0.01x^2-0.02y^2$ を、水平な板（むらさき）で切ります。▶ で板を下から上へ動かしましょう。',
      note: '高さ $z$ の板の切り口が、高さ $z$ の**等高線**です。山の面の上に10 m ごとにかいた輪を、真上から見て紙にうつしたのが、右の地図です。主役の山の等高線は、東西に長いだ円です（80 m なら東西の半径44.72 m、南北31.62 m）。',
      miss: '高さのちがう等高線は、交わりません。1つの場所の高さは1つだけだからです。',
      state: { z: 0 },
      legend: [['10 m ごとの等高線', { color: 'c' }], ['50 m', { color: 'e' }], ['80 m', { color: 'b' }], ['板の切り口', { color: 'd', style: 'dash' }]],
      controls: [{ range: 'z', label: '板の高さ〔m〕', min: 0, max: 100, step: 1, d: 0 }],
      step(st, dt) { st.z = Math.min(100, st.z + 15 * dt); if (st.z >= 100) return false; },
      drag: A.rotDrag([0, 0, 540, 440]),
      draw: drawChokan,
      readout: st => `板の高さ ${Math.round(st.z)} m：$0.01x^2+0.02y^2=${Math.round(100 - st.z)}$ の だ円`
    },
    {
      key: 'kiru', label: '② 東西・南北に切る',
      lead: '点 P $(30,\\ 20)$ を通る、東西の板と南北の板で山を切ります。右は2つの切り口のグラフで、点線は P での接線です。',
      note: '1つの文字を止めると、残りはふつうの関数になります。$y=20$ で東西に切ると $h=92-0.01x^2$、$x=30$ で南北に切ると $h=91-0.02y^2$。どちらも P の上の83 m を通ります。接線の傾き（東の坂 $-0.6$、北の坂 $-0.8$）が、8-2 の**偏微分**です。',
      miss: '$h(20,\\ 30)$ は、東へ20 m・北へ30 m の所です（$100-4-18=78$）。かっこの中は、東（$x$）が先です。',
      state: { x0: 30, y0: 20, yaw: 25, pitch: 25 },
      legend: [['東西の切り口（$y$ を止める）', { color: 'b' }], ['南北の切り口（$x$ を止める）', { color: 'c', style: 'dash' }], ['P での接線', { color: 'ink', style: 'dot' }]],
      controls: [{ range: 'x0', label: 'P の $x$（東へ m）', min: -90, max: 90, step: 1, d: 0 }, { range: 'y0', label: 'P の $y$（北へ m）', min: -65, max: 65, step: 1, d: 0 }],
      drag: A.rotDrag([0, 0, 540, 440]),
      draw: drawKiru,
      readout: st => { const hp = h(st.x0, st.y0); return `P $(${A.num(st.x0, 0)},\\ ${A.num(st.y0, 0)})$ の高さ ${A.num(hp, 1)} m　東の坂 $-0.02x=${A.num(-0.02 * st.x0, 2)}$、北の坂 $-0.04y=${A.num(-0.04 * st.y0, 2)}$`; }
    },
    {
      key: 'mikata', label: '③ 見る向きを変える',
      lead: '同じ山を、見る向きを変えて見ます。▶ で、鳥かん図 → 真上 → 南から → 東から と、カメラが動きます。',
      note: '鳥かん図・等高線の地図・切り口は、**同じ山の3つの見方**です。真上から見ると等高線の地図に、真横から見ると切り口になります。南から見た形（東西の切り口）より、東から見た形（南北の切り口）のほうが、すそが急に下がります。',
      miss: '鳥かん図では、見る向きによって、同じ坂でも急に見えたりゆるやかに見えたりします。本当の急さは、等高線の間かくか式で比べます（主役の山では北と南の坂が急）。',
      state: { v: 'bird', yaw: -35, pitch: 30, t: 0 },
      legend: [['等高線（10 m ごと）', { color: 'c' }], ['50 m', { color: 'e' }], ['80 m', { color: 'b' }]],
      controls: [{ seg: 'v', label: '見る向き', options: [['bird', '鳥かん図'], ['top', '真上'], ['south', '南から'], ['east', '東から']], on: st => { [st.yaw, st.pitch] = VIEWS[st.v]; } }],
      step(st, dt) {
        st.t += dt; const order = ['bird', 'top', 'south', 'east', 'bird'], k = Math.min(3, Math.floor(st.t / 3)), u = A.clamp((st.t - 3 * k) / 2, 0, 1), s = u * u * (3 - 2 * u);
        const a = VIEWS[order[k]], b = VIEWS[order[k + 1]]; st.yaw = a[0] + (b[0] - a[0]) * s; st.pitch = a[1] + (b[1] - a[1]) * s; st.v = s > 0.5 ? order[k + 1] : order[k];
        if (st.t >= 12) { st.t = 0; return false; }
      },
      drag: A.rotDrag([0, 0, 880, 440]),
      draw: drawMikata,
      readout: st => ({ bird: '鳥かん図（南東の空から）', top: '真上から：等高線の地図', south: '南から：東西の切り口の形', east: '東から：南北の切り口の形' })[st.v] || 'ドラッグで回した向き'
    }
  ]
});

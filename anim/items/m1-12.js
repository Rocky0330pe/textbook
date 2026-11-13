// @id m1-12
// @title 三角形は つぶれにくい
// @vol 数学1
// @from 数学 1-19 コラム「三角形は つぶれにくい」（ch1-19）／力-5（トラス）でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// ストローを つないだ 形。辺の 長さは かわらない。四角形は かどを おすと かたむき、三角形は かわらない。

const L = 150;
const DEG = Math.PI / 180;
function straw(cv, p, q, col) { cv.line([p, q], { color: col, width: 9 }); cv.line([p, q], { color: 'bg', width: 2, alpha: 0.5 }); }
function joint(cv, p) { cv.circle(p[0], p[1], 6, { fill: 'ink', alpha: 1 }); }
function ground(cv, x0, x1, y) { cv.line([[x0, y], [x1, y]], { color: 'ink', width: 3 }); for (let x = x0; x < x1; x += 14) cv.line([[x, y + 2], [x - 8, y + 10]], { color: 'line', width: 1.5 }); }
// 四角形（下の 辺は 地面に とめる）。al は かたむき（たての 辺が まっすぐから どれだけ まわったか）
function quad(cv, bx, yb, al, o = {}) {
  const B0 = [bx, yb], B1 = [bx + L, yb], d = [L * Math.sin(al), -L * Math.cos(al)], T0 = [B0[0] + d[0], B0[1] + d[1]], T1 = [B1[0] + d[0], B1[1] + d[1]];
  const col = o.col || 'b';
  straw(cv, B0, B1, col); straw(cv, B1, T1, col); straw(cv, T1, T0, col); straw(cv, T0, B0, col);
  if (o.diag) straw(cv, B0, T1, 'c');
  [B0, B1, T0, T1].forEach(p => joint(cv, p));
  // かどの 角
  const ang = Math.round(90 - al / DEG);
  cv.circle(B0[0], B0[1], 26, { color: 'a', width: 2, a0: -Math.PI / 2 + al, a1: 0, ccw: false });
  cv.text(`${ang}°`, B0[0] + 30, B0[1] - 22, { size: 15, bold: true, color: 'a' });
  return { T0, T1 };
}
function tri(cv, bx, yb, l1, l2, o = {}) {
  const B0 = [bx, yb], B1 = [bx + L, yb];
  const x = (l1 * l1 - l2 * l2 + L * L) / (2 * L), h2 = l1 * l1 - x * x;
  if (h2 <= 0) return null;
  const T = [bx + x, yb - Math.sqrt(h2)], col = o.col || 'c';
  straw(cv, B0, B1, col); straw(cv, B1, T, col); straw(cv, T, B0, col);
  [B0, B1, T].forEach(p => joint(cv, p));
  return { T };
}
function push(cv, p, dir, on) { if (!on) return; cv.arrow(p[0] - dir * 70, p[1], p[0] - dir * 14, p[1], { color: 'd', width: 4 }); cv.text('おす', p[0] - dir * 76, p[1] - 18, { align: 'center', size: 15, bold: true, color: 'd' }); }

// ---------- ① おして みる ----------
function drawOsu(cv, st) {
  const yb = 340;
  ground(cv, 30, 400, yb); ground(cv, 470, 860, yb);
  cv.text('しかくけい（ストロー 4ほん）', 60, 60, { size: 17, bold: true });
  cv.text('さんかくけい（ストロー 3ぼん）', 500, 60, { size: 17, bold: true });
  const q = quad(cv, 120, yb, st.al);
  push(cv, q.T0, Math.sign(st.al) || 1, Math.abs(st.al) > 0.02);
  const t = tri(cv, 590, yb, L, L);
  // さんかくは おしても うごかない（ゆびの 力の やじるしだけ）
  push(cv, t.T, Math.sign(st.al) || 1, Math.abs(st.al) > 0.02);
  cv.text(Math.abs(st.al) > 0.05 ? 'かたむいた！' : '', 195, yb + 40, { align: 'center', size: 18, bold: true, color: 'b' });
  cv.text(Math.abs(st.al) > 0.05 ? 'かわらない' : '', 665, yb + 40, { align: 'center', size: 18, bold: true, color: 'c' });
  cv.text('かどを ゆびで よこに おしてみよう', 440, 410, { align: 'center', size: 15, color: 'sub' });
}
// ---------- ② 辺の長さで 形が きまる ----------
function drawNagasa(cv, st) {
  const yb = 360, bx = 140, B0 = [bx, yb], B1 = [bx + L, yb];
  ground(cv, 60, 400, yb);
  // コンパスの 円（ちょう点の 候補）
  cv.circle(B0[0], B0[1], st.l1, { color: 'a', width: 1.5, style: 'dash', a0: Math.PI, a1: 2 * Math.PI });
  cv.circle(B1[0], B1[1], st.l2, { color: 'd', width: 1.5, style: 'dash', a0: Math.PI, a1: 2 * Math.PI });
  const t = tri(cv, bx, yb, st.l1, st.l2);
  cv.text('さんかくけい', 60, 40, { size: 17, bold: true, color: 'c' });
  if (!t) cv.text('とどかない：さんかくに ならない', 230, 120, { align: 'center', size: 17, bold: true, color: 'b' });
  else cv.text('てっぺんは 1つに きまる', 230, 64, { align: 'center', size: 16, color: 'c' });
  // 四角形：同じ 4本で いろいろな 形
  const qx = 560;
  ground(cv, 470, 860, yb);
  cv.text('しかくけい（おなじ 4ほん）', 480, 40, { size: 17, bold: true, color: 'b' });
  for (const a of [-40, -20, 20, 40]) { const al = a * DEG; const d = [L * Math.sin(al), -L * Math.cos(al)]; cv.poly([[qx, yb], [qx + L, yb], [qx + L + d[0], yb + d[1]], [qx + d[0], yb + d[1]]], { color: 'b', width: 1.5, style: 'dash' }); }
  quad(cv, qx, yb, 0);
  cv.text('かたちは いくつも ある', 660, 64, { align: 'center', size: 16, color: 'b' });
}
// ---------- ③ ななめの ぼう ----------
function drawSujikai(cv, st) {
  const yb = 340, al = st.diag ? 0 : st.al;
  ground(cv, 30, 420, yb);
  const q = quad(cv, 130, yb, al, { diag: st.diag });
  push(cv, q.T0, Math.sign(st.al) || 1, Math.abs(st.al) > 0.02);
  cv.text(st.diag ? 'さんかく 2つに なって、 かたむかない' : 'かたむく', 205, yb + 40, { align: 'center', size: 17, bold: true, color: st.diag ? 'c' : 'b' });
  // てっきょう
  const x0 = 470, y0 = 300, w = 70;
  cv.text('てっきょう', 640, 80, { align: 'center', size: 17, bold: true });
  cv.rect(x0 - 10, y0 + 10, 5 * w + 20, 26, { fill: 'a', alpha: 0.25 });
  cv.line([[x0, y0], [x0 + 5 * w, y0]], { color: 'c', width: 5 });
  cv.line([[x0 + w / 2, y0 - 110], [x0 + 4.5 * w, y0 - 110]], { color: 'c', width: 5 });
  for (let k = 0; k < 5; k++) { cv.line([[x0 + k * w, y0], [x0 + k * w + w / 2, y0 - 110]], { color: 'c', width: 5 }); cv.line([[x0 + k * w + w / 2, y0 - 110], [x0 + (k + 1) * w, y0]], { color: 'c', width: 5 }); }
  cv.text('さんかくの ほねぐみ', 640, y0 + 60, { align: 'center', size: 16, color: 'c' });
}

A.item({
  id: 'm1-12', title: '《三角形|さんかくけい》は つぶれにくい', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-19 コラム「《三角形|さんかくけい》は つぶれにくい」から（《物理|ぶつり》 《力|りき》-5 の トラスでも つかう）',
  W: 880, H: 430,
  state: { al: 0, l1: 150, l2: 150, diag: false, t: 0 },
  scenes: [
    {
      key: 'osu', label: '① かどを おす',
      lead: 'ストローで つくった 《四角形|しかくけい》と 《三角形|さんかくけい》。 かどを よこに おすと、 どう なるかな？',
      note: 'ストローを 4《本|ほん》 つないだ 《四角形|しかくけい》は、 かどを おすと かたむいて、 《形|かたち》が かわって しまいます。 3《本|ぼん》で つないだ 《三角形|さんかくけい》は、 《辺|へん》の 《長|なが》さが かわらない かぎり、 おしても 《形|かたち》が かわりません。',
      legend: [['《四角形|しかくけい》', { color: 'b' }], ['《三角形|さんかくけい》', { color: 'c' }], ['おす 《力|ちから》', { color: 'd' }], ['かどの 《角|かく》', { color: 'a' }]],
      init(st) { st.al = 0; st.t = 0; },
      step(st, dt) { st.t += dt; st.al = 35 * DEG * Math.sin(st.t * 1.2); if (st.t > 2 * Math.PI / 1.2 * 2) { st.al = 0; return false; } },
      draw(cv, st) { drawOsu(cv, st); },
      drag: {
        hit(st, x, y) { return y < 330 ? { x0: x, al0: st.al } : null; },
        move(st, x, y, api, h) { st.al = A.clamp(Math.asin(A.clamp(Math.sin(h.al0) + (x - h.x0) / L, -0.85, 0.85)), -55 * DEG, 55 * DEG); }
      },
      readout: st => `《四角形|しかくけい》の かどの 《角|かく》：<b>${Math.round(90 - st.al / DEG)}°</b>（《辺|へん》の 《長|なが》さは かわらない）`
    },
    {
      key: 'nagasa', label: '② 《辺|へん》の 《長|なが》さで きまる？',
      lead: '《三角形|さんかくけい》の 2つの 《辺|へん》の 《長|なが》さを かえて みよう。 コンパスの まるが まじわる ところが、 てっぺんです。',
      note: '《三角形|さんかくけい》は、 3つの 《辺|へん》の 《長|なが》さを きめると、 てっぺんの ばしょが 1つに きまり、 《形|かたち》も きまります。 《四角形|しかくけい》は、 4つの 《辺|へん》の 《長|なが》さを きめても、 かたむいた 《形|かたち》が いくつも できます。',
      legend: [['《左|ひだり》の 《辺|へん》の コンパス', { color: 'a', style: 'dash' }], ['《右|みぎ》の 《辺|へん》の コンパス', { color: 'd', style: 'dash' }], ['《同|おな》じ 4《本|ほん》で できる 《形|かたち》', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'l1', label: '《左|ひだり》の 《辺|へん》', min: 60, max: 240, step: 1, d: 0, fmt: v => A.num(v / 15, 0) + 'cm' }, { range: 'l2', label: '《右|みぎ》の 《辺|へん》', min: 60, max: 240, step: 1, d: 0, fmt: v => A.num(v / 15, 0) + 'cm' }],
      init(st) { st.l1 = 150; st.l2 = 150; st.t = 0; },
      step(st, dt) { st.t += dt; st.l1 = 150 + 70 * Math.sin(st.t * 0.9); st.l2 = 150 + 50 * Math.sin(st.t * 0.6 + 1); if (st.t > 10) return false; },
      draw(cv, st) { drawNagasa(cv, st); },
      readout: st => `《三角形|さんかくけい》の 《辺|へん》：10cm・${A.num(st.l1 / 15, 0)}cm・${A.num(st.l2 / 15, 0)}cm`
    },
    {
      key: 'sujikai', label: '③ ななめの ぼう',
      lead: '《四角形|しかくけい》に ななめの ストローを 1《本|ぽん》 たすと、 どう なるかな？',
      note: 'ななめの ストローを たすと、 《四角形|しかくけい》は 《三角形|さんかくけい》 2つに なり、 おしても かたむかなく なります。 《三角形|さんかくけい》の ほねぐみは、 おしても つぶれにくい。 はしや タワーを 《強|つよ》く します。',
      legend: [['《四角形|しかくけい》の ストロー', { color: 'b' }], ['ななめの ストロー・《三角形|さんかくけい》の ほねぐみ', { color: 'c' }], ['おす 《力|ちから》', { color: 'd' }]],
      state: { diag: true },
      controls: [{ check: 'diag', label: 'ななめの ぼう', text: 'ななめの ストローを いれる' }],
      init(st) { st.al = 0; st.t = 0; },
      step(st, dt) { st.t += dt; st.al = 35 * DEG * Math.sin(st.t * 1.2); if (st.t > 2 * Math.PI / 1.2 * 2) { st.al = 0; return false; } },
      draw(cv, st) { drawSujikai(cv, st); },
      drag: {
        hit(st, x, y) { return x < 440 && y < 330 ? { x0: x, al0: st.al } : null; },
        move(st, x, y, api, h) { st.al = A.clamp(Math.asin(A.clamp(Math.sin(h.al0) + (x - h.x0) / L, -0.85, 0.85)), -55 * DEG, 55 * DEG); }
      },
      readout: st => st.diag ? 'ななめの ストロー あり：かたむかない' : `ななめの ストロー なし：かどの 《角|かく》 ${Math.round(90 - st.al / DEG)}°`
    }
  ]
});

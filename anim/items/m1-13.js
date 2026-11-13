// @id m1-13
// @title 角は まわった 大きさ
// @vol 数学1
// @from 数学 1-20 角の大きさ（ch1-20）／1-10・1-19・4-2・4-8・力-6・7 でも使う
'use strict';
// 第1巻の読者（小学生）にあわせて、ひらがなを多くし、漢字にはルビをつける。キャンバスの中は ひらがなで書く。
// 角は ひらきぐあい（まわった 大きさ）。1回転＝360°、直角＝90°、半回転＝180°。分度器は 外がわが 右の 0から、内がわが 左の 0から。

const DEG = Math.PI / 180;
const P = (cx, cy, r, a) => [cx + r * Math.cos(-a * DEG), cy + r * Math.sin(-a * DEG)];   // a は 度（反時計回り）
function side(cv, cx, cy, len, a, col, w = 4) { cv.line([[cx, cy], P(cx, cy, len, a)], { color: col, width: w }); }
function rightMark(cv, cx, cy, a0, s = 18) { const p1 = P(cx, cy, s, a0), p2 = P(cx, cy, s, a0 + 90), p3 = [p1[0] + p2[0] - cx, p1[1] + p2[1] - cy]; cv.line([p1, p3, p2], { color: 'a', width: 2 }); }
function wedge(cv, cx, cy, r, a0, a1, col, alpha) { const g = cv.g; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -a0 * DEG, -a1 * DEG, true); g.closePath(); g.fillStyle = A.color(col); g.globalAlpha = alpha; g.fill(); g.globalAlpha = 1; }

// ---------- ① 辺が まわって 角が ひらく ----------
function drawHiraku(cv, st) {
  const cx = 270, cy = 230, R = 170, th = st.th;
  // 10°の かけら
  for (let k = 0; k < 36; k++) {
    const on = (k + 1) * 10 <= th + 1e-6, part = !on && k * 10 < th;
    wedge(cv, cx, cy, R, k * 10, part ? th : (k + 1) * 10, k < 9 ? 'a' : k < 18 ? 'c' : k < 27 ? 'e' : 'd', on || part ? 0.35 : 0.06);
    cv.line([[cx, cy], P(cx, cy, R, k * 10)], { color: 'bg', width: 1.2 });
  }
  cv.circle(cx, cy, R, { color: 'line', width: 1.5 });
  side(cv, cx, cy, R + 20, 0, 'ink', 5);
  side(cv, cx, cy, R + 20, th, 'b', 5);
  cv.dot(...P(cx, cy, R + 20, th), { r: 9, color: 'b' });
  cv.circle(cx, cy, 6, { fill: 'ink', alpha: 1 });
  if (Math.abs(th - 90) < 0.6) rightMark(cv, cx, cy, 0, 22);
  cv.text('ちょうてん', cx - 10, cy + 24, { align: 'right', size: 15, color: 'sub' });
  const x1 = 520, n = Math.floor(th / 10 + 1e-6);
  cv.text(`${Math.round(th)}°`, x1, 70, { size: 40, bold: true, color: 'b' });
  cv.text(`10°の かけら ${n}こ`, x1, 120, { size: 18 });
  const ms = [[90, 'ちょっかく（かけら 9こ）'], [180, 'はんかいてん（まっすぐ）'], [270, 'ちょっかく 3つ'], [360, '1かいてん（かけら 36こ）']];
  ms.forEach(([v, s], i) => cv.text(`${v}°　${s}`, x1, 190 + i * 34, { size: 16, bold: th >= v - 0.5, color: th >= v - 0.5 ? 'ink' : 'sub' }));
  cv.text('●を ゆびで まわそう', x1, 400, { size: 15, color: 'sub' });
}
// ---------- ② 辺の 長さと 角 ----------
function kaku(cv, cx, cy, len, a, col, label) {
  side(cv, cx, cy, len, 0, 'ink', 4); side(cv, cx, cy, len, a, col, 4);
  wedge(cv, cx, cy, 34, 0, a, col, 0.3);
  cv.circle(cx, cy, 34, { color: col, width: 2, a0: -a * DEG, a1: 0 });
  cv.circle(cx, cy, 5, { fill: 'ink', alpha: 1 });
  cv.text(label, cx - 16, cy + 22, { align: 'center', size: 18, bold: true });
}
function drawHen(cv, st) {
  kaku(cv, 260, 340, st.len, st.a, 'b', 'A');
  kaku(cv, 650, 340, 90, 60, 'a', 'B');
  cv.text(`A：${Math.round(st.a)}°（へんの ながさ ${Math.round(st.len / 20)}）`, 260, 400, { size: 16, color: 'b', bold: true });
  cv.text('B：60°（へんの ながさ 4）', 650, 400, { size: 16, color: 'a', bold: true });
  const big = Math.abs(st.a - 60) < 0.5 ? 'A と B は おなじ おおきさ' : st.a > 60 ? 'おおきい かくは A' : 'おおきい かくは B';
  cv.text(big, 700, 60, { align: 'center', size: 20, bold: true });
  cv.text('（ひらきぐあいで くらべる）', 700, 90, { align: 'center', size: 15, color: 'sub' });
}
// ---------- ③ 分度器 ----------
const BD = { cx: 440, cy: 340, R: 250 };
function protractor(cv, st) {
  const { cx, cy, R } = BD, g = cv.g;
  g.beginPath(); g.arc(cx, cy, R, Math.PI, 2 * Math.PI); g.closePath(); g.fillStyle = A.color('panel'); g.fill(); g.strokeStyle = A.color('sub'); g.lineWidth = 2; g.stroke();
  for (let d = 0; d <= 180; d++) { const big = d % 10 === 0, mid = d % 5 === 0; cv.line([P(cx, cy, R, d), P(cx, cy, R - (big ? 18 : mid ? 12 : 7), d)], { color: 'ink', width: big ? 1.6 : 0.8 }); }
  const useOut = st.side === 'R';
  for (let d = 0; d <= 180; d += 10) {
    cv.text(String(d), ...P(cx, cy, R - 34, d), { align: 'center', size: 16, bold: true, color: 'ink' });          // 外がわ：右の 0から
    cv.text(String(180 - d), ...P(cx, cy, R - 62, d), { align: 'center', size: 15, color: 'a' });                  // 内がわ：左の 0から
  }
  cv.circle(cx, cy, R - 48, { color: useOut ? 'line' : 'a', width: useOut ? 1 : 2, a0: Math.PI, a1: 2 * Math.PI, style: 'dot' });
  cv.circle(cx, cy, 5, { fill: 'b', alpha: 1 });
  cv.line([[cx - R, cy], [cx + R, cy]], { color: 'sub', width: 1.5 });
}
function drawBundoki(cv, st) {
  const { cx, cy, R } = BD;
  protractor(cv, st);
  const a = st.ang, base = st.side === 'R' ? 0 : 180, mov = st.side === 'R' ? a : 180 - a;
  side(cv, cx, cy, R + 30, base, 'ink', 4);
  side(cv, cx, cy, R + 30, mov, 'b', 4);
  cv.dot(...P(cx, cy, R + 30, mov), { r: 9, color: 'b' });
  // 0から かぞえる 矢印（よむ 列の 上）
  const rr = st.side === 'R' ? R - 34 : R - 62;
  const steps = Math.max(1, Math.round(a / 10));
  cv.circle(cx, cy, rr + 14, { color: 'c', width: 3, a0: -Math.max(mov, base) * DEG, a1: -Math.min(mov, base) * DEG });
  void steps;
  const right = a < 90;
  cv.text(st.side === 'R' ? 'へんが みぎの 0 → そとがわ（くろ）を よむ' : 'へんが ひだりの 0 → うちがわ（あお）を よむ', cx, 30, { align: 'center', size: 17, bold: true, color: st.side === 'R' ? 'ink' : 'a' });
  cv.text(`${a}°`, ...P(cx, cy, 80, (base + mov) / 2), { align: 'center', size: 22, bold: true, color: 'b', bg: true });
  cv.text(right ? `ちょっかくより ちいさい → ${a}°（${180 - a}°では ない）` : a === 90 ? 'ちょうど ちょっかく → 90°' : `ちょっかくより おおきい → ${a}°（${180 - a}°では ない）`, cx, cy + 34, { align: 'center', size: 16, bold: true, color: 'b' });
  cv.text('ちゅうしんを ちょうてんに あわせる', cx, cy + 62, { align: 'center', size: 15, color: 'sub' });
}

A.item({
  id: 'm1-13', title: '《角|かく》は まわった 《大|おお》きさ', ruby: true,
  from: '《数学|すうがく》 《第|だい》1《巻|かん》 1-20「《角|かく》の 《大|おお》きさ」の《図|ず》から（1-10・1-19、 4-2・4-8 でも つかう）',
  W: 880, H: 440,
  state: { th: 0, a: 30, len: 200, ang: 50, side: 'R' },
  scenes: [
    {
      key: 'hiraku', label: '① 《辺|へん》が まわって ひらく',
      lead: '1つの 《点|てん》から 2《本|ほん》の 《線|せん》が 《出|で》て いる 《形|かたち》が 《角|かく》。 《辺|へん》を まわして、 どれだけ ひらいたかを 《見|み》よう。',
      note: '1《回転|かいてん》を 360に わけた 1つ《分|ぶん》が 1《度|ど》（1°）。 1《回転|かいてん》は 10°の かけらが 36こで 360°。 《直角|ちょっかく》は 1《回転|かいてん》を 4つに わけた 1つで、 かけら 9こ、 90°。 90 ＋ 90 ＋ 90 ＋ 90 ＝ 360 です。',
      legend: [['うごかない 《辺|へん》', { color: 'ink' }], ['まわる 《辺|へん》', { color: 'b', shape: 'circle' }], ['10°の かけら（9こずつ 《色|いろ》を かえる）', { color: 'a', shape: 'square', noline: true }]],
      controls: [{ range: 'th', label: '《角|かく》', min: 0, max: 360, step: 1, d: 0, fmt: v => v + '°' }],
      init(st) { st.th = 0; st.wait = 0; },
      step(st, dt) {
        if (st.th >= 360) return false;
        if (st.wait > 0) { st.wait -= dt; return; }
        const n = Math.min(360, st.th + dt * 40);
        for (const m of [90, 180, 270]) if (st.th < m && n >= m) { st.th = m; st.wait = 0.8; return; }
        st.th = n;
      },
      draw(cv, st) { drawHiraku(cv, st); },
      drag: {
        hit(st, x, y) { return Math.hypot(x - 270, y - 230) < 220 ? 1 : null; },
        move(st, x, y) { let a = Math.atan2(-(y - 230), x - 270) / DEG; if (a < 0) a += 360; let d = a - (st.th % 360); if (d > 180) d -= 360; if (d < -180) d += 360; st.th = A.clamp(Math.round(st.th + d), 0, 360); }
      },
      readout: st => `《角|かく》の 《大|おお》きさ：<b>${Math.round(st.th)}°</b>（10°の かけら ${Math.floor(st.th / 10 + 1e-6)}こ）`
    },
    {
      key: 'hen', label: '② 《辺|へん》の 《長|なが》さと 《角|かく》',
      lead: '《辺|へん》を 《長|なが》く すると、 《角|かく》は 《大|おお》きく なるかな？ A の 《辺|へん》の 《長|なが》さと ひらきを かえて みよう。',
      note: '《角|かく》の 《大|おお》きさは、 《辺|へん》の 《長|なが》さでは きまりません。 **ひらきぐあいで きまります**。 《辺|へん》を のばしても、 ひらきが おなじなら 《角|かく》は おなじです。',
      miss: '《辺|へん》が 《長|なが》い A の ほうが 《大|おお》きい 《角|かく》に みえますが、 A（30°）より B（60°）の ほうが 《大|おお》きい 《角|かく》です。',
      legend: [['A の 《角|かく》', { color: 'b', shape: 'square', noline: true }], ['B の 《角|かく》', { color: 'a', shape: 'square', noline: true }]],
      state: { a: 30, len: 200 },
      controls: [{ range: 'a', label: 'A の ひらき', min: 0, max: 150, step: 1, d: 0, fmt: v => v + '°' }, { range: 'len', label: 'A の 《辺|へん》の 《長|なが》さ', min: 40, max: 280, step: 20, d: 0, fmt: v => String(v / 20) }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; st.len = Math.round((160 + 120 * Math.sin(st.t * 0.9)) / 20) * 20; if (st.t > 7) { st.len = 200; return false; } },
      draw(cv, st) { drawHen(cv, st); },
      readout: st => `A ${Math.round(st.a)}°、 B 60° → ${Math.abs(st.a - 60) < 0.5 ? 'おなじ' : st.a > 60 ? 'A の ほうが 《大|おお》きい' : 'B の ほうが 《大|おお》きい'}`
    },
    {
      key: 'bundoki', label: '③ 《分度器|ぶんどき》の 2れつ',
      lead: '《分度器|ぶんどき》には 《数|かず》が 2れつ。 《辺|へん》が どちらの 0に あって いるかで、 よむ れつが きまります。',
      note: '《外|そと》がわの くろい 《数|かず》は 《右|みぎ》の 0から、 《内|うち》がわの あおい 《数|かず》は 《左|ひだり》の 0から ふえて いきます。 《辺|へん》が 《右|みぎ》の 0に あって いたら 《外|そと》がわ、 《左|ひだり》の 0に あって いたら 《内|うち》がわを よみます。 よむ 《前|まえ》に 「《直角|ちょっかく》より 《小|ちい》さいかな、 《大|おお》きいかな」と 《見|み》て おくと、 まちがえません。',
      miss: '《目|め》もりの よみまちがい：50° の 《角|かく》を 「130°」と よんで しまう。 《辺|へん》が あって いる 0から かぞえよう。',
      legend: [['《外|そと》がわ（《右|みぎ》の 0から）', { color: 'ink', shape: 'square', noline: true }], ['《内|うち》がわ（《左|ひだり》の 0から）', { color: 'a', shape: 'square', noline: true }], ['0から かぞえる', { color: 'c' }], ['はかる 《辺|へん》', { color: 'b', shape: 'circle' }]],
      state: { ang: 50, side: 'R' },
      controls: [{ seg: 'side', label: 'うごかない 《辺|へん》', options: [['R', '《右|みぎ》の 0に あわせる'], ['L', '《左|ひだり》の 0に あわせる']] }, { range: 'ang', label: '《角|かく》', min: 0, max: 180, step: 1, d: 0, fmt: v => v + '°' }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt; st.ang = Math.round(90 + 70 * Math.sin(st.t * 0.6 - 0.6)); if (st.t > 10.5) { st.ang = 50; return false; } },
      draw(cv, st) { drawBundoki(cv, st); },
      drag: {
        hit(st, x, y) { return y < BD.cy + 20 ? 1 : null; },
        move(st, x, y) { let a = Math.atan2(-(y - BD.cy), x - BD.cx) / DEG; if (a < 0) a = x > BD.cx ? 0 : 180; a = A.clamp(Math.round(a), 0, 180); st.ang = st.side === 'R' ? a : 180 - a; }
      },
      readout: st => `${st.side === 'R' ? '《外|そと》がわ' : '《内|うち》がわ'}を よむ：<b>${st.ang}°</b>`
    }
  ]
});

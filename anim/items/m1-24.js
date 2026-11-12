// @id m1-24
// @title ばねののびと《比例|ひれい》・《反比例|はんぴれい》
// @vol 数学2
// @from 数学 2-15 比例と反比例（ch2-15:55-67・82-96・163-187・228-236・291-313・503-506）／波-1・力-8・電-4・3-3・3-7・6-6 でも使う
'use strict';
// 第2巻の読者にあわせて、漢字にはルビをつける。のびの値は本の「やってみよう」の表（ミナさんがはかった値）

const MEAS = [0, 2.0, 4.1, 5.9, 8.0, 10.0];  // おもり 0〜5 個ののび（cm）
const L0 = 12;                               // もとの長さ（本の「まちがえやすいところ」の 12 cm）

// ばね：上のはし (x, y0) から長さ len（px）。巻き数は同じで、のびると間があく
function spring(cv, x, y0, len, col) {
  const n = 12, w = 16, a = 10, b = 8, pts = [[x, y0], [x, y0 + a]];
  for (let k = 0; k < n; k++) { const y = y0 + a + (len - a - b) * (k + 0.5) / n; pts.push([x + (k % 2 ? -w : w), y]); }
  pts.push([x, y0 + len - b], [x, y0 + len]);
  cv.line(pts, { color: col, width: 2.5 });
}
// おもり（50 g）を n 個つるす。下のはしの y を返す
function weights(cv, x, y, n) {
  for (let k = 0; k < n; k++) { const yy = y + k * 24; cv.line([[x, yy], [x, yy + 4]], { color: 'ink', width: 2 }); cv.rect(x - 15, yy + 4, 30, 18, { fill: 'sub', alpha: 0.55, color: 'ink', width: 1.5 }); }
  return y + n * 24;
}
function stand(cv, x, y) { cv.rect(x - 60, y - 10, 120, 10, { fill: 'sub', alpha: 0.5 }); }

// ---------- ① のび・全体の長さ ----------
function drawNobi(cv, st) {
  const S = 10, x = 150, y0 = 34, n = st.n, nobi = MEAS[n], len = (L0 + nobi) * S;
  stand(cv, x, y0);
  // ものさし（cm）
  const rx = x + 60;
  cv.rect(rx, y0, 24, 25 * S, { fill: 'e', alpha: 0.15, color: 'e', width: 1 });
  for (let c = 0; c <= 25; c++) { cv.line([[rx, y0 + c * S], [rx + (c % 5 ? 6 : 12), y0 + c * S]], { color: 'ink', width: 1 }); if (c % 5 === 0) cv.text(String(c), rx + 28, y0 + c * S, { size: 13 }); }
  // もとの長さの線
  cv.line([[x - 40, y0 + L0 * S], [rx, y0 + L0 * S]], { color: 'b', width: 1.5, style: 'dot' });
  spring(cv, x, y0, len, 'a');
  weights(cv, x, y0 + len, n);
  // のびの矢印（もとの長さの下から）
  if (nobi > 0) { cv.arrow(x - 34, y0 + L0 * S, x - 34, y0 + len, { color: 'b', width: 2.5 }); cv.text(`のび ${A.num(nobi, 1)}`, x - 40, y0 + L0 * S + nobi * S / 2, { align: 'right', size: 14, color: 'b', bold: true }); }
  if (st.mode === 'zen') { cv.arrow(x + 40, y0, x + 40, y0 + len, { color: 'd', width: 2.5, style: 'dash' }); }
  // 右：グラフ
  const zen = st.mode === 'zen', f = k => zen ? L0 + MEAS[k] : MEAS[k];
  const g = cv.view({ x0: 0, x1: 5.6, y0: 0, y1: zen ? 25 : 11.5, box: [430, 30, 410, 340] });
  g.axes({ xt: [0, 1, 2, 3, 4, 5], yt: zen ? [0, 5, 10, 15, 20, 25] : [0, 2, 4, 6, 8, 10], xl: 'おもり（こ）', yl: zen ? '全体の長さ（cm）' : 'のび（cm）' });
  g.plot(x => zen ? L0 + 2 * x : 2 * x, { x0: 0, x1: 5.4, color: zen ? 'd' : 'a', width: 2, style: zen ? 'dash' : 'solid' });
  for (let k = 0; k <= n; k++) g.dot(k, f(k), { color: 'ink', r: 5, shape: zen ? 'square' : 'circle' });
  g.dot(0, 0, { color: 'b', r: 7, shape: 'diamond', open: true });
  g.text('原点', 0.12, zen ? 1.2 : 0.6, { size: 14, color: 'b' });
}

// ---------- ② ばね定数 ----------
function drawK(cv, st) {
  const S = 8, n = st.m, F = 0.5 * n;
  const sp = [[180, 25, 'sub', 'dash'], [340, st.k, 'a', 'solid']];
  for (const [x, k, col] of sp) {
    const xm = F / k, len = (L0 + xm * 100) * S, y0 = 34;
    stand(cv, x, y0);
    cv.line([[x - 50, y0 + L0 * S], [x + 50, y0 + L0 * S]], { color: 'b', width: 1.5, style: 'dot' });
    spring(cv, x, y0, len, col);
    weights(cv, x, y0 + len, n);
    cv.text(`k ＝ ${k}`, x, 404, { align: 'center', size: 15, bold: true, color: col });
    if (xm > 0) cv.text(`${A.num(xm * 100, 1)} cm`, x + 34, y0 + (L0 + xm * 50) * S, { size: 14, color: 'b' });
  }
  const g = cv.view({ x0: 0, x1: 0.22, y0: 0, y1: 2.3, box: [470, 30, 370, 340] });
  g.axes({ xt: [0.05, 0.1, 0.15, 0.2], yt: [0.5, 1, 1.5, 2], xl: 'のび x（m）', yl: '力 F（N）', xfmt: v => A.num(v, 2), yfmt: v => A.num(v, 1) });
  g.plot(x => 25 * x, { color: 'sub', width: 2, style: 'dash' });
  g.plot(x => st.k * x, { color: 'a', width: 2.5 });
  for (let j = 1; j <= n; j++) { g.dot(0.5 * j / 25, 0.5 * j, { color: 'sub', r: 4, shape: 'square' }); g.dot(0.5 * j / st.k, 0.5 * j, { color: 'a', r: 5 }); }
}

// ---------- ③ 反比例 ----------
function drawHan(cv, st) {
  const x = st.v, y = 1200 / x;
  const g = cv.view({ x0: 0, x1: 6.6, y0: 0, y1: 1400, box: [80, 30, 470, 350] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [400, 800, 1200], xl: '速さ x（m/s）', yl: '時間 y（秒）' });
  g.poly([[0, 0], [x, 0], [x, y], [0, y]], { fill: 'c', alpha: 0.25, color: 'c', width: 1.5 });
  g.plot(t => 1200 / t, { x0: 0.86, x1: 6.5, color: 'a', width: 2.5 });
  for (let k = 1; k <= 6; k++) g.dot(k, 1200 / k, { color: 'ink', r: 4, shape: 'square' });
  g.dot(x, y, { color: 'b', r: 7, shape: 'diamond' });
  g.text('めんせき x × y ＝ 1200', x / 2, Math.min(y, 1300) / 2, { align: 'center', size: 14, bold: true, bg: true });
  // 右：表
  const tx = 600, ty = 60;
  cv.text('x', tx + 30, ty, { align: 'center', size: 16, italic: true, math: true });
  cv.text('y', tx + 110, ty, { align: 'center', size: 16, italic: true, math: true });
  cv.text('x × y', tx + 200, ty, { align: 'center', size: 16, math: true });
  for (let k = 1; k <= 6; k++) {
    const yy = ty + 34 * k, on = Math.abs(x - k) < 0.05;
    if (on) cv.rect(tx, yy - 15, 250, 30, { fill: 'hl', alpha: 1 });
    cv.text(String(k), tx + 30, yy, { align: 'center', size: 15 });
    cv.text(String(1200 / k), tx + 110, yy, { align: 'center', size: 15 });
    cv.text('1200', tx + 200, yy, { align: 'center', size: 15 });
  }
}

A.item({
  id: 'm1-24', title: 'ばねののびと《比例|ひれい》・《反比例|はんぴれい》', ruby: true,
  from: '《数学|すうがく》 《第|だい》2《巻|かん》 2-15「《比例|ひれい》と《反比例|はんぴれい》」の《図|ず》から（3-3・3-7・6-6、《物理|ぶつり》 《波|なみ》-1・《力|りき》-8・《電|でん》-4 でも《使|つか》う）',
  W: 880, H: 420,
  state: { n: 0, mode: 'nobi', w: 0, k: 25, m: 2, v: 1 },
  scenes: [
    {
      key: 'nobi', label: '① のびは《比例|ひれい》する',
      lead: '1《個|こ》50 g のおもりを、1《個|こ》ずつふやしてつるします。▶ で、のびがどうなるか、グラフにかいていきます。',
      note: 'おもり1《個|こ》で《約|やく》2 cm、2《個|こ》で《約|やく》4 cm。おもりが2《倍|ばい》、3《倍|ばい》になると、のびも2《倍|ばい》、3《倍|ばい》（**《比例|ひれい》**、$y=2x$）。グラフは**《原点|げんてん》を《通|とお》るまっすぐな《線|せん》**です。「《全体|ぜんたい》の《長|なが》さ」に《切|き》りかえると、《原点|げんてん》を《通|とお》りません。',
      miss: '「《増|ふ》えると《増|ふ》える」なら《比例|ひれい》、ではありません。《比例|ひれい》するのは「のび」。《全体|ぜんたい》の《長|なが》さは、もとの《長|なが》さ12 cm なら1《個|こ》で14、2《個|こ》で16 cm。2《倍|ばい》になりません。$y÷ x$ が《一定|いってい》かで《確|たし》かめよう。',
      legend: [['のび（はかった《値|あたい》●）と $y=2x$', { color: 'a', shape: 'circle' }], ['《全体|ぜんたい》の《長|なが》さ（■）', { color: 'd', style: 'dash', shape: 'square' }], ['《原点|げんてん》', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'n', label: 'おもりの《数|かず》', min: 0, max: 5, step: 1, d: 0 }, { seg: 'mode', label: 'グラフにするもの', options: [['nobi', 'のび'], ['zen', '《全体|ぜんたい》の《長|なが》さ']] }],
      init(st) { st.n = 0; st.w = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.1) { st.w = 0; if (st.n >= 5) return false; st.n++; } },
      draw(cv, st) { drawNobi(cv, st); },
      readout: st => { const n = st.n, y = st.mode === 'zen' ? L0 + MEAS[n] : MEAS[n]; return n ? `おもり ${n} 《個|こ》、${st.mode === 'zen' ? '《全体|ぜんたい》の《長|なが》さ' : 'のび'} ${A.num(y, 1)} cm　→　$y÷ x$ ＝ ${A.num(y / n, 2)}${st.mode === 'zen' ? '（《一定|いってい》でない）' : '（《約|やく》2）'}` : 'おもり 0 《個|こ》：のび 0 cm'; }
    },
    {
      key: 'k', label: '② ばね《定数|ていすう》 $k$',
      lead: 'ばね《定数|ていすう》 $k$ を《変|か》えて、25 N/m のばね（《左|ひだり》）とくらべます。おもり1《個|こ》（50 g）で《約|やく》0.5 N の《力|ちから》です。',
      note: '《力|ちから》 $F$ は、のび $x$ に《比例|ひれい》します（$F=kx$）。$k$ は「1 m あたり《何|なん》N いるか」。$k$ が**《大|おお》きいほど《硬|かた》いばね**で、《同|おな》じ《力|ちから》でものびにくく、グラフは《急|きゅう》になります。',
      miss: '0.5 N で 2 cm のびたので $k=0.5÷2=0.25$ N/m、はまちがい。2 cm ＝ 0.02 m なので $k=0.5÷0.02=25$ N/m。cm のままだと100《倍|ばい》ずれます。',
      state: { k: 40, m: 2 },
      legend: [['$k=25$ のばね（くらべる）', { color: 'sub', style: 'dash', shape: 'square' }], ['$k$ を《変|か》えたばね', { color: 'a', shape: 'circle' }]],
      controls: [{ range: 'k', label: 'ばね《定数|ていすう》 $k$', min: 10, max: 50, step: 1, fmt: v => v + ' N/m' }, { range: 'm', label: 'おもりの《数|かず》', min: 0, max: 4, step: 1, d: 0 }],
      init(st) { st.w = 0; st.m = 0; },
      step(st, dt) { st.w += dt; if (st.w > 1.1) { st.w = 0; if (st.m >= 4) return false; st.m++; } },
      draw(cv, st) { drawK(cv, st); },
      readout: st => { const F = 0.5 * st.m, x = F / st.k; return `$F$ ＝ ${A.num(F, 1)} N、のび $x$ ＝ ${A.num(x, 3)} m（${A.num(x * 100, 1)} cm）　→　$F÷ x$ ＝ ${st.m ? st.k : '―'} N/m`; }
    },
    {
      key: 'hanpirei', label: '③ かけると《一定|いってい》：《反比例|はんぴれい》',
      lead: '1200 m の《道|みち》を《行|い》くときの、《速|はや》さ $x$（m/s）とかかる《時間|じかん》 $y$（《秒|びょう》）。▶ で《速|はや》さを《変|か》えます。',
      note: '《速|はや》さが2《倍|ばい》になると、《時間|じかん》は $\\frac{1}{2}$ 《倍|ばい》（**《反比例|はんぴれい》**）。$x\\times y$ はいつも1200（《道|みち》のり）なので、《色|いろ》の《長方形|ちょうほうけい》の《面積|めんせき》は《変|か》わりません。グラフは《右|みぎ》へ《行|い》くほどゆるやかに《下|さ》がる《曲線|きょくせん》で、《横|よこ》の《軸|じく》に《近|ちか》づくけれど、くっつきません。',
      miss: '10 L から $x$ L《使|つか》った《残|のこ》り $y=10-x$ は、《増|ふ》えると《減|へ》るけれど《反比例|はんぴれい》ではありません。$x\\times y$ が《一定|いってい》か、かけて《確|たし》かめよう。',
      state: { v: 1 },
      legend: [['$y=\\frac{1200}{x}$', { color: 'a' }], ['$x\\times y$ の《長方形|ちょうほうけい》（いつも1200）', { color: 'c', shape: 'square', noline: true }], ['いまの《速|はや》さ', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'v', label: '《速|はや》さ $x$', min: 1, max: 6, step: 0.1, fmt: v => A.num(v, 1) + ' m/s', on(st) { st.vf = st.v; } }],
      init(st) { st.v = 1; st.vf = 1; },
      step(st, dt) { st.vf = Math.min(6, (st.vf || st.v) + dt * 0.6); st.v = Math.round(st.vf * 10) / 10; if (st.vf >= 6) return false; },
      draw(cv, st) { drawHan(cv, st); },
      readout: st => `$x$ ＝ ${A.num(st.v, 1)}、$y$ ＝ 1200 ÷ ${A.num(st.v, 1)} ＝ <b>${A.num(1200 / st.v, 1).replace(/\.0$/, '')}</b>　$x\\times y$ ＝ 1200`
    }
  ]
});

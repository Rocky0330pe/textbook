/* 問題集 第5巻『変化をつかむ』　第1部 速さと導関数（わざ 5-01〜5-14、5-91）　組 a
 * 書き方は v5/README.md（第5巻の手引き）と v4/README.md・v2/README.md。文は教科書 第5巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 電卓は使わない（L-4）。近似値は使う値とけたを文に書く（L-3）。数は分数（M.F）で計算してから文字にする（小数のずれを出さない）。
 * 微分の答えには calc（M.calcCheck）をつける。そのほか（接線の式・接点・極限・平均の速さ・換算）は verify(p) で、問題の文の式から別の道すじで計算し直す。
 * 図は 5-02 と 5-07 のステップ3だけ（M.graph。K-2・L-2）。図の点は問題の数から計算する。
 * わなは、このわざ自身では楽にならないもの。答えにはかならず行き先を書く（dest。第36回 N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const fmt = v => String(+(+v).toFixed(9));                          // 0.30000000004 → 0.3
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const close = (x, y, e) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (e || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  const decOK = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const D = t => F.fromDec(String(t));                                // '3.6' → [18, 5]
  const ft = f => (decOK(f[1]) ? fmt(f[0] / f[1]) : F.tex(f));        // 分数を、きりのよい小数か \frac に
  const isDec = (f, k) => decOK(f[1]) && Math.round(f[0] / f[1] * 10 ** k) / 10 ** k === f[0] / f[1];   // 小数第 k 位までで書けるか
  const num = t => M.evalMath(strip(t), {});
  const par = t => (/^-/.test(String(t)) ? `(${t})` : `${t}`);         // マイナスはかっこごと
  const un = (v, u) => `$${v}\\,\\mathrm{${u}}$`;                     // 単位つき
  const P2 = (x, y) => `(${x},\\ ${y})`;                              // 座標
  const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += (s || 1)) o.push(+v.toFixed(6)); return o; };

  // 多項式（係数は分数。低い次から）を TeX に。dec：係数をきりのよい小数で書く（4.9t^2）
  function ptex(a, v, o) {
    v = v || 'x'; o = o || {};
    let s = '';
    for (let k = a.length - 1; k >= 0; k--) {
      const c = a[k]; if (!c || c[0] === 0) continue;
      const neg = c[0] < 0, ab = [Math.abs(c[0]), c[1]], one = ab[0] === 1 && ab[1] === 1;
      const ct = o.dec && decOK(ab[1]) ? fmt(ab[0] / ab[1]) : F.tex(ab);
      const body = k === 0 ? ct : (one ? '' : ct) + (k === 1 ? v : `${v}^{${k}}`);
      s += (s ? (neg ? '-' : '+') : (neg ? '-' : '')) + body;
    }
    return s || '0';
  }
  const PN = (...cs) => cs.map(c => (Array.isArray(c) ? c : D(c)));   // PN(1, -2, 0, 3)：低い次から。小数もよい
  // 直線 Y = m X + k の TeX
  function lineTeX(m, k, X, Y) {
    X = X || 'x'; Y = Y || 'y';
    const mt = m[0] === 0 ? '' : (m[0] === m[1] ? '' : m[0] === -m[1] ? '-' : ft(m)) + X;
    const kt = k[0] === 0 ? (mt ? '' : '0') : (mt && k[0] > 0 ? '+' : '') + ft(k);
    return `${Y}=${mt}${kt}`;
  }

  // ---------------------------------------------------------------- 検算の部品（verify。問題を作った式とは別の道すじ）
  // 式 t（TeX）を、変数 X の関数として数値で微分する（中心差分）
  const ev = (t, X, x, c) => M.evalMath(t, Object.assign({}, c || {}, { [X]: x }));
  const nd = (t, X, x, c) => { const h = 1e-5, u = ev(t, X, x + h, c), w = ev(t, X, x - h, c); return u == null || w == null ? null : (u - w) / (2 * h); };
  // 答えの直線「Y=…」が、関数 f（TeX）の X=a での接線か：接点を通り、傾きが f'(a)
  function tangentOK(ans, f, a, X, Y) {
    X = X || 'x'; Y = Y || 'y';
    const t = strip(ans), i = t.indexOf('=');
    if (i < 0 || t.slice(0, i).trim() !== Y) return `直線の式の形でない（${ans}）`;
    const L = x => ev(t.slice(i + 1), X, x);
    const fa = ev(f, X, a), d = nd(f, X, a), l0 = L(a), sl = L(a + 1) - L(a);
    if (fa == null || d == null || l0 == null) return `式が読めない（${ans} ／ ${f}）`;
    if (!close(l0, fa, 1e-6)) return `接点 (${a}, ${fa}) を通らない（${ans}）`;
    if (!close(sl, d, 1e-5)) return `傾きが f'(${a})=${fmt(d)} でない（${ans}）`;
    return true;
  }
  // 「$(2,\ 8)$ と $(-2,\ -8)$」から点の配列
  function pointsOf(ans) {
    const out = [];
    for (const m of String(ans).matchAll(/\$\(([^$]*)\)\$/g)) {
      const [x, y] = m[1].split(/,\\\s|,/).map(s => M.evalMath(s.trim(), {}));
      out.push([x, y]);
    }
    return out;
  }
  // f'(x)=m となる x を、数値で全部さがす（-12〜12 で符号の変わる所。きざみ 0.17 は、整数の解にちょうど当たらない数）
  // このわざの式は3次までで、解は -4〜4 の整数。解と解のあいだは 2 以上はなれている
  function rootsOfSlope(f, m, X) {
    X = X || 'x';
    const g = x => nd(f, X, x) - m, out = [];
    let px = -12.03, pv = g(px);
    for (let x = px + 0.17; x <= 12.2; x += 0.17) {
      const v = g(x);
      if (Math.abs(v) < 1e-6 && !out.some(r => Math.abs(r - x) < 0.05)) out.push(x);
      else if (pv * v < 0) { let a = px, b = x; for (let k = 0; k < 60; k++) { const c = (a + b) / 2; if (g(a) * g(c) <= 0) b = c; else a = c; } const r = (a + b) / 2; if (!out.some(s => Math.abs(s - r) < 0.05)) out.push(r); }
      px = x; pv = v;
    }
    return out;
  }
  // \frac{…}{…} の中身（かっこの対応を見る）
  function fracParts(t, from) {
    const i = t.indexOf('\\frac', from || 0); if (i < 0) return null;
    const grab = j => { let d = 0, k = j; for (; k < t.length; k++) { if (t[k] === '{') d++; else if (t[k] === '}') { d--; if (!d) break; } } return [t.slice(j + 1, k), k + 1]; };
    const [a, j] = grab(i + 5), [b, k] = grab(j);
    return { num: a, den: b, end: k };
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2、第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざなど、fits では見つからない行き先
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(5).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 1 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 目印の読み方（fits の部品）
  const KMH = /km\/h|時速/, MS = /m\/s|秒速/;
  const ASKD = /\)'|\\\}'|微分|f'\(|y'=|\\dd|v=□|\$v=|傾き|速さ|速度/;          // 導関数・微分係数・速さを聞いている
  const NOTD = /定義|平均|\\lim|接線の式|接線が|接線と|傾きが|平行|通る/;      // 微分のきまりでなく、ほかのわざの目印
  // 関数の式（「$f(x)=…$」「$(…)'$」「$y=…$」「$x=…$」）をとり出す
  function funcOf(q) {
    for (const t of maths(q)) {
      let m;
      if ((m = /^\\\{(.*)\\\}'=□$/.exec(t)) || (m = /^\\left\((.*)\\right\)'=□$/.exec(t)) || (m = /^\((.*)\)'=□$/.exec(t))) return m[1];
      if ((m = /^(?:f\(x\)|y|x|f\(t\))=(.+)$/.exec(t)) && !/□/.test(m[1]) && !/^-?[\d.]+$/.test(m[1])) return m[1];
    }
    return null;
  }
  // 多項式の項（+・- で分ける。かっこの外だけ）
  function termsOf(t) {
    const out = []; let d = 0, cur = '';
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === '{' || c === '(') d++; else if (c === '}' || c === ')') d--;
      if (d === 0 && (c === '+' || c === '-') && cur.trim()) { out.push(cur); cur = c === '-' ? '-' : ''; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur);
    return out;
  }
  const VARS = '[xtr]';
  const MONO = new RegExp(`^-?(?:[\\d.]+)?${VARS}(?:\\^\\{?(\\d+)\\}?)?$`);          // 3x^{2}・x・-t^{3}（係数は整数・小数）
  const CONST = /^-?[\d.]+$/;
  const isPoly = t => termsOf(t).every(s => MONO.test(s.trim()) || CONST.test(s.trim()));

  // ================================================================ 5-01
  // 時速 A km/h ＝ 秒速 v m/s（A = 3.6 v）。v は整数か小数第1位まで、A も小数第1位まで
  const V01 = range(5, 60).concat([2.5, 7.5, 12.5, 17.5, 22.5, 27.5, 32.5]).filter(v => isDec(F.mul(D(v), D('3.6')), 1));
  M.add({
    id: '5-01', part: 1, chap: '5-1④・5-0', stars: 1,
    title: '時速と秒速は「$\\div3.6$」「$\\times3.6$」',
    mark: 'km/h と m/s が両方出る（時速を秒速に、秒速を時速に）。',
    futsu: ['単位つきの式で、$\\times1000\\,\\mathrm{m/km}$ と', '$\\div3600\\,\\mathrm{s/h}$ を1つずつ計算する。'],
    raku: ['$72\\,\\mathrm{km/h}$ → $72\\div3.6=20\\,\\mathrm{m/s}$', '$15\\,\\mathrm{m/s}$ → $15\\times3.6=54\\,\\mathrm{km/h}$'],
    why: '$\\times1000\\div3600$ をまとめると $\\div3.6$（$\\frac{1000}{3600}=\\frac{1}{3.6}$）。だから時速を秒速にするには $\\div3.6$、秒速を時速にするには $\\times3.6$ を1回でよい（5-1④）。',
    caution: '$\\div$ と $\\times$ を逆にしない。秒速の数は時速の数より小さい。迷ったら単位つきの式にもどる。km/min や m/min のときは 3.6 ではない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '15mm', s2: '15mm', s3: '15mm', trap: '15mm' },
    fits(q) { return (KMH.test(q) && MS.test(q) && !/往復|行き|帰り/.test(q)) || (/回転/.test(q) && KMH.test(q)); },
    steps: {
      // 時速 → 秒速（÷3.6）
      s1(r) {
        const v = D(r.pick(V01)), A = F.mul(v, D('3.6'));
        if (F.val(v) === 20) return null;   // 楽な形の例（$72\\,\\mathrm{km/h}$ → 20。O-2）
        return { q: `$${ft(A)}\\,\\mathrm{km/h}=□\\,\\mathrm{m/s}$`, a: `$${ft(v)}$`, easy: `$${ft(A)}\\div3.6=${ft(v)}$`, key: `v${ft(v)}` };
      },
      // 秒速 → 時速（×3.6）。s1 の逆の問題を同じ見開きに出さない（key が同じ。N-2）
      s2(r) {
        const v = D(r.pick(V01)), A = F.mul(v, D('3.6'));
        if (F.val(v) === 15) return null;   // 楽な形の例（$15\\,\\mathrm{m/s}$ → 54。O-2）
        return { q: `$${ft(v)}\\,\\mathrm{m/s}=□\\,\\mathrm{km/h}$`, a: `$${ft(A)}$`, easy: `$${ft(v)}\\times3.6=${ft(A)}$`, key: `v${ft(v)}` };
      },
      // 場面の文で、両向きをまぜる（スピードメーター・新幹線・音・100 m 走・分速）
      s3(r) {
        const k = r.int(0, 4);
        if (k === 0) {
          const v = r.pick([10, 25, 30]), A = 3.6 * v;   // 時速72 km（20）と 54 km（15）は楽な形の例
          return { q: `スピードメーターが時速 $${fmt(A)}\\,\\mathrm{km}$ を指している。この速さのまま1秒に進む距離 $□\\,\\mathrm{m}$`, a: `$${v}$`, easy: `$${fmt(A)}\\div3.6=${v}$`, key: `m${v}` };
        }
        if (k === 1) {
          const L = r.pick([50, 100, 200]), T = r.pick([4, 5, 8, 10, 20, 25, 40]), v = fr(L, T), A = F.mul(v, D('3.6'));
          if (!isDec(v, 1) || !isDec(A, 1) || F.val(v) > 12 || F.val(v) < 2) return null;
          return { q: `$${L}\\,\\mathrm{m}$ を $${T}$ 秒で走った人の平均の速さは、時速 $□\\,\\mathrm{km}$`, a: `$${ft(A)}$`, easy: `$${L}\\div${T}=${ft(v)}$、$${ft(v)}\\times3.6=${ft(A)}$`, easyCheck: 'last', key: `r${L}/${T}` };
        }
        if (k === 2) {
          const [name, v] = r.pick([['音', 340], ['音', 330], ['風', 25], ['ジェット機', 250], ['チーター', 30], ['ツバメ', 50]]), A = F.mul(fr(v), D('3.6'));
          return { q: `秒速 $${v}\\,\\mathrm{m}$ で進む${name}は、時速 $□\\,\\mathrm{km}$`, a: `$${ft(A)}$`, easy: `$${v}\\times3.6=${ft(A)}$`, key: `s${v}` };
        }
        if (k === 3) {   // 小数第1位まで（その下の位が 5 より小さい数だけ。四捨五入でも切り捨てでも同じ）
          const [name, A] = r.pick([['新幹線', 300], ['新幹線', 260], ['特急', 130], ['車', 100], ['車', 80], ['リニアモーターカー', 500], ['飛行機', 800]]);
          const v = A / 3.6, d2 = Math.floor(v * 100) % 10, ans = Math.floor(v * 10) / 10;
          if (Number.isInteger(v * 10) || d2 >= 5) return null;
          return {
            q: `時速 $${A}\\,\\mathrm{km}$ で走る${name}は、秒速 $□\\,\\mathrm{m}$（小数第1位まで）`, a: `$${fmt(ans)}$`, easy: `$${A}\\div3.6=${fmt(Math.floor(v * 100) / 100)}\\cdots$`, easyCheck: false, key: `n${A}`,
            verify: p => (close(num(p.a), Math.round(A * 1000 / 3600 * 10) / 10) && close(num(p.a), Math.floor(A * 1000 / 3600 * 10) / 10)) || '小数第1位までの値がちがう',
          };
        }
        // 分速（km/min）から時速（$\times60$）。教科書 5-1 例題8
        const m = r.int(2, 5), A = r.pick([36, 45, 48, 54, 60, 72, 90]), L = F.mul(fr(A, 60), fr(m));
        if (!isDec(L, 2)) return null;
        return { q: `電車が $${m}$ 分で $${ft(L)}\\,\\mathrm{km}$ 進んだ。時速 $□\\,\\mathrm{km}$`, a: `$${A}$`, easy: `$${ft(L)}\\div${m}=${ft(fr(A, 60))}\\,\\mathrm{km/min}$、$${ft(fr(A, 60))}\\times60=${A}$`, easyCheck: 'last', key: `d${m}/${A}` };
      },
      // わな：km/min・m/min（3.6 ではない。単位つきの式で）
      trap(r) {
        if (r.chance(0.5)) {
          const v = r.pick([5, 10, 15, 20, 25, 30]), K = F.mul(fr(v), fr(6, 100));
          return dest({ q: `$${ft(K)}\\,\\mathrm{km/min}=□\\,\\mathrm{m/s}$`, a: `$${v}$`, verify: p => close(num(p.a), F.val(K) * 1000 / 60) || 'm/s の値がちがう' },
            '5-01', `km/min なので $\\div3.6$ ではない。$${ft(K)}\\times1000\\div60=${v}$ と単位つきの式で`);
        }
        const Mm = r.pick([500, 600, 900, 1000, 1200, 1500]), A = F.mul(fr(Mm), fr(6, 100));
        return dest({ q: `$${Mm}\\,\\mathrm{m/min}=□\\,\\mathrm{km/h}$`, a: `$${ft(A)}$`, verify: p => close(num(p.a), Mm * 60 / 1000) || 'km/h の値がちがう' },
          '5-01', `m/min なので $\\times3.6$ ではない。$${Mm}\\times60\\div1000=${ft(A)}$ と単位つきの式で`);
      },
    },
  });

  // ================================================================ 5-02
  // x-t グラフ（図はステップ3）：曲線か折れ線、2点 A・B、AB を通る直線、目もりへの点線
  function xtFig(f, tEnd, A, B, xTop) {
    const G = M.graph({ x0: 0, x1: tEnd, y0: 0, y1: xTop, w: 9, h: 5 });
    const its = [...G.axes({ xt: [A[0], B[0]], yt: [A[1], B[1]], x: 't', y: 'x' })];
    its.push(...G.plot(f, 0, tEnd - 0.3, { n: 90 }));
    const sl = (B[1] - A[1]) / (B[0] - A[0]), Lx = t => A[1] + sl * (t - A[0]);
    let t0 = Math.max(0, A[0] - 0.8), t1 = Math.min(tEnd - 0.2, B[0] + 0.8);
    const clip = t => Math.min(xTop, Math.max(0, Lx(t)));
    if (Lx(t0) < 0 || Lx(t0) > xTop) t0 = A[0] + (clip(t0) - A[1]) / sl;
    if (Lx(t1) < 0 || Lx(t1) > xTop) t1 = A[0] + (clip(t1) - A[1]) / sl;
    its.push(['seg', G.T(t0, Lx(t0)), G.T(t1, Lx(t1)), { thick: true }]);
    for (const Q of [A, B]) its.push(['seg', G.T(Q[0], 0), G.T(Q[0], Q[1]), { dash: true }], ['seg', G.T(0, Q[1]), G.T(Q[0], Q[1]), { dash: true }], ['dot', G.T(Q[0], Q[1])]);
    its.push(['label', G.T(A[0], A[1]), 'A', sl >= 0 ? 'nw' : 'ne'], ['label', G.T(B[0], B[1]), 'B', sl >= 0 ? 'se' : 'ne']);
    return { s: 5, items: its, G };
  }
  M.add({
    id: '5-02', part: 1, chap: '5-1①②', stars: 1,
    title: '平均の速さは「あと$-$まえ」の比 $\\frac{\\Delta x}{\\Delta t}$（グラフでは2点を結ぶ直線の傾き）',
    mark: '2つの時刻と、そのときの位置（表の2つの列、$x$-$t$ グラフの2点）。',
    futsu: ['進んだ距離とかかった時間を、', '文や表から1つずつ読みとって考える。'],
    raku: ['A（$2\\,\\mathrm{s}$、$6\\,\\mathrm{m}$）、B（$5\\,\\mathrm{s}$、$21\\,\\mathrm{m}$）', '→ $\\frac{21-6}{5-2}=\\frac{15}{3}=5\\,\\mathrm{m/s}$'],
    why: '平均の速さは、進んだ距離 $\\Delta x$（あと$-$まえ）を、かかった時間 $\\Delta t$（あと$-$まえ）でわったもの。$x$-$t$ グラフでは、たての変化量÷横の変化量なので、2点を結ぶ直線の傾きと同じ式になる（5-1①②）。',
    caution: '「まえ」と「あと」を両方とも同じ順でひく。位置がもどる（へる）ときは、平均の速度はマイナス（向きもふくめた速さを速度という）。表は、ほしい2つの時刻の列だけを見る。',
    counts: { s1: 8, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '15mm',
    fits(q) { return (/平均の(?:速さ|速度)/.test(q) && /位置|\$t\$（|2点/.test(q) && !/往復|\+h/.test(q)) || /通る直線の傾き|2点を結ぶ直線の傾き/.test(q); },
    steps: {
      // 2つの時刻と位置
      s1(r) {
        const t1 = r.int(0, 8), dt = r.int(1, 6), v = D(r.pick([1, 2, 3, 4, 5, 6, 7, 8, 1.5, 2.5, 0.5])), x1 = r.int(0, 30);
        const dx = F.mul(v, fr(dt)); if (dx[1] !== 1) return null;
        const t2 = t1 + dt, x2 = x1 + dx[0];
        if (`${t1},${x1},${t2},${x2}` === '2,6,5,21') return null;   // 楽な形の例（左ページ）の数は出さない（O-2）
        const q = r.chance(0.5)
          ? `$x$-$t$ グラフの2点 A（${un(t1, 's')}、${un(x1, 'm')}）、B（${un(t2, 's')}、${un(x2, 'm')}）。AからBの平均の速さ $□\\,\\mathrm{m/s}$`
          : `時刻 ${un(t1, 's')} に位置 ${un(x1, 'm')}、${un(t2, 's')} に位置 ${un(x2, 'm')} にいた。平均の速さ $□\\,\\mathrm{m/s}$`;
        return { q, a: `$${ft(v)}$`, easy: `$\\frac{${x2}-${x1}}{${t2}-${t1}}=\\frac{${dx[0]}}{${dt}}=${ft(v)}$`, key: `${t1},${x1},${t2},${x2}` };
      },
      // 0.5時間ごとの表（ほしい2つの列だけを見る）・もどる動き（マイナス）
      s2(r) {
        if (r.chance(0.35)) {   // 坂を上って下りるボール：もどるとマイナス
          const t1 = r.int(2, 6), dt = r.int(1, 4), v = r.int(1, 4), x2 = r.int(1, 8), x1 = x2 + v * dt;
          return { q: `坂を上ってから下りてきたボールが、時刻 ${un(t1, 's')} に位置 ${un(x1, 'm')}、${un(t1 + dt, 's')} に位置 ${un(x2, 'm')} にいた（坂の上向きが正）。このあいだの平均の速度 $□\\,\\mathrm{m/s}$`,
            a: `$${-v}$`, easy: `$\\frac{${x2}-${x1}}{${t1 + dt}-${t1}}=\\frac{${-v * dt}}{${dt}}=${-v}$`, key: `b${t1},${x1},${dt},${x2}` };
        }
        // 車の記録（km）。どのあいだも平均の速さは 10 の倍数、0〜120 km/h
        const sp = [0, 1, 2, 3].map(() => r.pick([20, 30, 40, 50, 60, 70, 80, 100]));
        const xs = [0]; sp.forEach(s => xs.push(xs[xs.length - 1] + s / 2));
        const i = r.int(0, 3), j = r.int(i + 1, 4);
        if (j - i === 4) return null;
        const ts = ['0', '0.5', '1.0', '1.5', '2.0'], dx = xs[j] - xs[i], dt = fr(j - i, 2), v = F.div(fr(dx), dt);
        if (v[1] !== 1) return null;
        return {
          q: `車の位置の記録。$t$（h）：0、0.5、1.0、1.5、2.0　$x$（km）：${xs.join('、')}。${ts[i]}〜${ts[j]} h の平均の速さ $□\\,\\mathrm{km/h}$`,
          a: `$${ft(v)}$`, easy: `$\\frac{${xs[j]}-${xs[i]}}{${ts[j]}-${ts[i]}}=\\frac{${dx}}{${ft(dt)}}=${ft(v)}$`, key: `car${(i + j) % 2}`,
        };
      },
      // 図の x-t グラフ（曲線 x=ct^2 か折れ線）で、AとBを結ぶ直線の傾き
      s3(r) {
        let f, A, B, tEnd, xTop;
        if (r.chance(0.5)) {
          const c = r.pick([0.5, 1, 2]), t1 = r.int(1, 4), t2 = r.int(t1 + 1, 6);
          f = t => c * t * t; A = [t1, f(t1)]; B = [t2, f(t2)];
          if (!Number.isInteger(A[1]) || !Number.isInteger(B[1]) || B[1] > 40) return null;
          tEnd = t2 + 1; xTop = B[1] * 1.15;
        } else {   // 折れ線：止まる・おそい・はやい所がある（教科書 5-1 のはてな）
          const pts = [[0, 0]]; let x = 0;
          for (let t = 1; t <= 6; t++) { x += r.pick([0, 2, 4, 6, 8]); pts.push([t, x]); }
          const i = r.int(1, 3), j = r.int(i + 2, 6);
          A = pts[i]; B = pts[j];
          if (B[1] === A[1] || x > 40 || (B[1] - A[1]) * 5 < x) return null;
          f = t => { const k = Math.min(5, Math.floor(t)); return pts[k][1] + (pts[k + 1][1] - pts[k][1]) * (t - k); };
          tEnd = 6.6; xTop = x * 1.15 + 1;
        }
        if (Math.abs(B[1] - A[1]) < 0.18 * xTop || A[1] < 0.12 * xTop) return null;   // 目もりの数が、たがいに、また原点の O と重ならないように（Aは原点からはなす）
        const fig = xtFig(f, tEnd, A, B, xTop), v = F.div(D(B[1] - A[1]), D(B[0] - A[0]));
        if (!isDec(v, 2)) return null;
        const G = fig.G; delete fig.G;
        return {
          q: '図は物体の $x$-$t$ グラフ（$t$ は s、$x$ は m）。AからBまでの平均の速さ $□\\,\\mathrm{m/s}$',
          a: `$${ft(v)}$`, easy: `直線ABの傾き $\\frac{${B[1]}-${A[1]}}{${B[0]}-${A[0]}}=${ft(v)}$`, easyCheck: 'last', fig, key: `f${A}:${B}`,
          verify: p => {   // 図の点（dot）の位置から、傾きを読み直す
            const ds = p.fig.items.filter(it => it[0] === 'dot').map(it => [it[1][0] / G.sx, it[1][1] / G.sy]);
            return (ds.length === 2 && close((ds[1][1] - ds[0][1]) / (ds[1][0] - ds[0][0]), num(p.a), 1e-6)) || '図の2点の傾きと答えがちがう';
          },
        };
      },
      // わな：瞬間の速さ（2つの時刻ではない。5-05・5-10）
      trap(r) {
        const c = r.pick([2, 3, 4, 5]), t = r.int(1, 4);
        if (r.chance(0.5)) return dest({ q: `$x=${c}t^{2}$（m）で動く物体の、${t}秒の瞬間の速さ $□\\,\\mathrm{m/s}$`, a: `$${2 * c * t}$`, key: 'trapA', verify: p => close(num(p.a), nd(`${c}t^{2}`, 't', t), 1e-6) || '速さがちがう' },
          '5-02', '2つの時刻の平均ではなく、1つの時刻の瞬間の速さ。$x=at^2$ なら $v=2at$', ['5-05']);
        const b = r.int(2, 6);
        return dest({ q: `$x=${c}t^{2}+${b}t$（m）で動く物体の、${t}秒の瞬間の速さ $□\\,\\mathrm{m/s}$`, a: `$${2 * c * t + b}$`, key: 'trapB', verify: p => close(num(p.a), nd(`${c}t^{2}+${b}t`, 't', t), 1e-6) || '速さがちがう' },
          '5-02', '2つの時刻の平均ではなく、1つの時刻の瞬間の速さ。1項ずつ微分する', ['5-10']);
      },
    },
  });

  // ================================================================ 5-03
  // 往復の平均の速さ 2ab/(a+b)。片道を a と b の公倍数にとる
  const SP03 = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 36, 40, 45, 48, 50, 60, 72, 80, 90, 120];
  const PAIRS03 = [];
  SP03.forEach(a => SP03.forEach(b => { if (a < b && b <= 4 * a && (2 * a * b) % (a + b) === 0 && !(a === 40 && b === 60)) PAIRS03.push([a, b]); }));   // 40 と 60 は楽な形の例（O-2）
  M.add({
    id: '5-03', part: 1, chap: '5-1 例題7', stars: 1,
    title: '同じ道の往復は、片道を2つの速さの公倍数にとって時間を出す',
    mark: '行きと帰りで速さがちがい、片道の距離が同じ（書いていなくてもよい）。',
    futsu: ['片道を $L$ とおき、$\\frac{2L}{\\frac{L}{a}+\\frac{L}{b}}$ を', '文字のまま計算する。'],
    raku: ['時速 $60\\,\\mathrm{km}$ と $40\\,\\mathrm{km}$ → 片道を $120\\,\\mathrm{km}$ とおく', '2時間と3時間 → $\\frac{240}{5}=48\\,\\mathrm{km/h}$'],
    why: '平均の速さは「全部の距離÷全部の時間」（5-1 例題7）。片道の距離はどれでも答えは同じなので、2つの速さでわりきれる数（公倍数）にとると、時間が整数になって計算が楽になる。',
    caution: '$\\frac{60+40}{2}=50$ としない（速さの平均ではない）。おそいほうに長い時間かかるので、平均はおそいほうに引っぱられる。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '15mm',
    fits(q) { return /往復/.test(q) && (q.match(/時速|分速|秒速|km\/h|m\/min/g) || []).length >= 2; },
    steps: {
      s1(r) {
        const [x, y] = r.pick(PAIRS03), sw = r.chance(0.5), a = sw ? y : x, b = sw ? x : y;
        const L = F.lcm(a, b), H = 2 * a * b / (a + b), walk = b <= 6;
        return {
          q: `同じ道を、行きは時速 $${a}\\,\\mathrm{km}$、帰りは時速 $${b}\\,\\mathrm{km}$ で${walk ? '歩いて' : '走って'}往復した。往復の平均の速さ $□\\,\\mathrm{km/h}$`,
          a: `$${H}$`, easy: `片道を $${L}\\,\\mathrm{km}$ とおくと ${L / a}時間と${L / b}時間 → $\\frac{${2 * L}}{${L / a + L / b}}=${H}$`, key: [a, b].sort((m, n) => m - n).join(','),
          verify: p => close(num(p.a), 2 / (1 / a + 1 / b)) || '往復の平均の速さがちがう',
        };
      },
      // 片道が書いてある（時間が小数）。教科書 5-1 の山道
      s2(r) {
        const walk = r.chance(0.5);
        const a = walk ? r.int(2, 8) : r.pick([20, 30, 40, 50, 60, 80]), b = walk ? r.int(2, 8) : r.pick([20, 30, 40, 50, 60, 80]);
        const L = walk ? r.int(2, 12) : r.pick([30, 40, 60, 90, 120]);
        if (a === b) return null;
        const ta = fr(L, a), tb = fr(L, b), H = F.div(fr(2 * L), F.add(ta, tb));
        if (!isDec(ta, 2) || !isDec(tb, 2) || !isDec(H, 2) || (ta[1] === 1 && tb[1] === 1)) return null;
        const [g, k] = walk ? ['山道', ['上り', '下り']] : ['道', ['行き', '帰り']];
        return {
          q: `片道 $${L}\\,\\mathrm{km}$ の${g}を、${k[0]}は時速 $${a}\\,\\mathrm{km}$、${k[1]}は時速 $${b}\\,\\mathrm{km}$ で往復した。往復の平均の速さ $□\\,\\mathrm{km/h}$`,
          a: `$${ft(H)}$`, easy: `${k[0]} ${ft(ta)}時間、${k[1]} ${ft(tb)}時間 → $\\frac{${2 * L}}{${ft(F.add(ta, tb))}}=${ft(H)}$`, key: `${L}:${[a, b].sort((m, n) => m - n)}`,
          verify: p => close(num(p.a), 2 * L / (L / a + L / b)) || '往復の平均の速さがちがう',
        };
      },
      // 帰りの速さを求める（逆）・川を上り下りする船（見かけがちがう）
      s3(r) {
        if (r.chance(0.5)) {
          const [x, y] = r.pick(PAIRS03), sw = r.chance(0.5), a = sw ? y : x, b = sw ? x : y, H = 2 * a * b / (a + b), L = F.lcm(a, b);
          return {
            q: `同じ道を往復する。行きは時速 $${a}\\,\\mathrm{km}$ だった。往復の平均の速さを時速 $${H}\\,\\mathrm{km}$ にするには、帰りは時速 $□\\,\\mathrm{km}$`,
            a: `$${b}$`, easy: `片道を $${L}\\,\\mathrm{km}$ とおくと、往復で $${2 * L}\\div${H}=${2 * L / H}$ 時間、行き ${L / a}時間 → 帰り ${2 * L / H - L / a}時間 → $${L}\\div${2 * L / H - L / a}=${b}$`, easyCheck: 'last', key: `rev${a > b ? 1 : 0}`,
            verify: p => close(2 / (1 / a + 1 / num(p.a)), H) || '往復の平均が合わない',
          };
        }
        const V = r.pick([6, 8, 10, 12, 15, 20, 24]), c = r.pick([2, 3, 4, 5]), up = V - c, dn = V + c;
        if (up <= 1) return null;
        const H = fr(up * dn, V), L = F.lcm(up, dn);
        if (!isDec(H, 2) || L > 60) return null;
        return {
          q: `静水での速さが時速 $${V}\\,\\mathrm{km}$ の船が、時速 $${c}\\,\\mathrm{km}$ で流れる川を、同じ道のりだけ上って下りた（往復）。往復の平均の速さ $□\\,\\mathrm{km/h}$`,
          a: `$${ft(H)}$`, easy: `上り時速 $${up}\\,\\mathrm{km}$、下り時速 $${dn}\\,\\mathrm{km}$。片道を $${L}\\,\\mathrm{km}$ とおくと ${L / up}時間と${L / dn}時間 → $\\frac{${2 * L}}{${L / up + L / dn}}=${ft(H)}$`, key: `w${V},${c}`,
          verify: p => close(num(p.a), 2 / (1 / up + 1 / dn)) || '往復の平均の速さがちがう',
        };
      },
      // わな：時間がわかっている（公倍数はいらない。全部の距離÷全部の時間。5-02）
      trap(r) {
        const t1 = r.int(1, 4), t2 = r.int(1, 5), L = r.pick([30, 60, 90, 120, 150]);
        if (t1 === t2 || (2 * L) % (t1 + t2) !== 0) return null;
        return dest({ q: `片道 $${L}\\,\\mathrm{km}$ の道を、行きは ${t1} 時間、帰りは ${t2} 時間かかって往復した。往復の平均の速さ $□\\,\\mathrm{km/h}$`, a: `$${2 * L / (t1 + t2)}$`,
          verify: p => close(num(p.a) * (t1 + t2), 2 * L) || '平均の速さがちがう' },
        '5-03', `時間がわかっているので、公倍数はいらない。$\\frac{${2 * L}}{${t1}+${t2}}=${2 * L / (t1 + t2)}$`, ['5-02']);
      },
    },
  });

  // ================================================================ 5-04
  // 平均の速さ（平均変化率）が、答えの h の式と同じか（h をいくつか入れる）
  function avgOK(ans, f, X, a) {
    for (const h of [0.3, 0.7, -0.4, 1.9]) {
      const want = (ev(f, X, a + h) - ev(f, X, a)) / h, got = M.evalMath(strip(ans), { h });
      if (got == null || !close(want, got, 1e-9)) return `h=${h} で平均の速さ ${fmt(want)} と答え ${ans} がちがう`;
    }
    return true;
  }
  const cx = (c, v) => `${c === 1 ? '' : c === -1 ? '-' : fmt(c)}${v}`;      // 係数つきの文字（1・−1 は書かない）
  const plusT = (b, v) => (b === 0 ? '' : `${b > 0 ? '+' : '-'}${cx(Math.abs(b), v)}`);
  M.add({
    id: '5-04', part: 1, chap: '5-2②③・5-3③', stars: 1,
    title: '2乗の式の平均の速さ（平均変化率）は $\\frac{(a+h)^2-a^2}{h}=2a+h$ の形',
    mark: '$x=ct^2$（$f(x)=x^2$）で、$a$ から $a+h$ までの平均の速さ。定義からの微分係数。',
    futsu: ['$(a+h)^2$ を展開して $a^2$ をひき、', 'それを $h$ でわる計算を、毎回くり返す。'],
    raku: ['$x=5t^2$、2秒から $2+h$ 秒', '→ $5\\times(2\\times2+h)=20+5h$', '$h$ を0に近づけて 20'],
    why: '$(a+h)^2-a^2=2ah+h^2=h(2a+h)$（3-8）なので、$h$ でわると、いつも $2a+h$ になる。$x=ct^2$ なら $c$ 倍して $c(2a+h)$。1次の項 $bt$ があれば、平均の速さに $b$ がたされる（5-2②③、5-3③）。',
    caution: '$(a+h)^2=a^2+h^2$ としない（$2ah$ を忘れない）。$h$ を0に近づけるのは、$h$ でわってから。前の時刻（$a-h$ から $a$ まで）なら $c(2a-h)$。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '20mm', s2: '20mm', s3: '15mm', trap: '24mm' },
    fits(q) {
      if (/[tx]\^\{3\}/.test(q)) return false;
      if (/\((-?[\d.]+)\+h\)\^\{?2\}?/.test(q)) return true;
      if (/平均の(?:速さ|速度)|平均変化率/.test(q) && /\+h|[\d.]+秒から[\d.]+秒/.test(q) && /[tx]\^\{2\}/.test(q)) return true;
      return /定義から/.test(q) && /x\^\{2\}/.test(q) && /微分係数/.test(q);
    },
    steps: {
      // x=ct^2 の a 秒から a+h 秒まで・f(x)=x^2 の平均変化率
      s1(r) {
        const c = r.pick([1, 2, 3, 4, 5, 10]), a = r.int(1, 4);
        if (c === 5 && a === 2) return null;   // 楽な形の例（$x=5t^2$、2秒から）は出さない（O-2）
        if (c === 1) {
          return { q: `$f(x)=x^{2}$ の、$x=${a}$ から $x=${a}+h$ までの平均変化率　□`, a: `$${2 * a}+h$`, easy: `$2\\times${a}+h=${2 * a}+h$`, key: `f${a}`, verify: p => avgOK(p.a, 'x^{2}', 'x', a) };
        }
        return {
          q: `$x=${c}t^{2}$（m）の、${a}秒から $${a}+h$ 秒までの平均の速さ　□`, a: `$${2 * c * a}+${c}h$`,
          easy: `$${c}\\times(2\\times${a}+h)=${2 * c * a}+${c}h$`, key: `${c}:${a}`, verify: p => avgOK(p.a, `${c}t^{2}`, 't', a),
        };
      },
      // 定義から微分係数（a は負もある）・1次の項のある式
      s2(r) {
        if (r.chance(0.5)) {
          const c = r.pick([1, 1, 2, 3]), a = r.pick([-4, -3, -2, -1, 2, 3, 4, 5]), f = `${cx(c, 'x')}^{2}`;
          return {
            q: `定義から求める。$f(x)=${f}$ の微分係数 $f'(${a})=□$`, a: `$${2 * c * a}$`,
            easy: `$\\frac{f(${a}+h)-f(${a})}{h}=${c === 1 ? '' : `${c}(`}${2 * a}+h${c === 1 ? '' : ')'}$ → $${2 * c * a}$`, easyCheck: 'last', key: `d${c}:${a}`,
            verify: p => close(num(p.a), nd(f, 'x', a), 1e-6) || '微分係数がちがう',
          };
        }
        const c = r.pick([1, 2, 3, 5]), b = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), a = r.int(1, 3), f = `${cx(c, 't')}^{2}${plusT(b, 't')}`;
        const k0 = 2 * c * a + b;
        return {   // 1次の項が負なら、平均は負にもなる（O-3：負になりうる量は「速度」）
          q: `$x=${f}$（m）の、${a}秒から $${a}+h$ 秒までの平均の${b < 0 ? '速度' : '速さ'}　□`, a: `$${k0}+${cx(c, 'h')}$`,
          easy: `$${c === 1 ? '' : `${c}\\times`}(2\\times${a}+h)${b > 0 ? '+' : ''}${b}=${k0}+${cx(c, 'h')}$`, key: `b${c}:${b}:${a}`, verify: p => avgOK(p.a, f, 't', a),
        };
      },
      // h を数で：0.1・0.01 のあいだ（後ろからも前からも）
      s3(r) {
        const c = r.pick([1, 2, 5, 10]), a = r.int(1, 4), h = r.pick(['0.1', '0.01']), back = r.chance(0.35);
        if (c === 5 && a === 2) return null;   // 楽な形の例（O-2）
        const A = D(a), H = D(h), t1 = back ? F.sub(A, H) : A, t2 = back ? A : F.add(A, H);
        const v = F.mul(D(c), F.add(t1, t2));
        if (c === 1 && r.chance(0.5)) {
          return { q: `$f(x)=x^{2}$ の、$x=${ft(t1)}$ から $x=${ft(t2)}$ までの平均変化率　□`, a: `$${ft(v)}$`, easy: `$2\\times${a}${back ? '-' : '+'}${h}=${ft(v)}$`, key: `F${ft(t1)}`,
            verify: p => close(num(p.a), (F.val(t2) ** 2 - F.val(t1) ** 2) / (F.val(t2) - F.val(t1)), 1e-9) || '平均変化率がちがう' };
        }
        return {
          q: `$x=${cx(c, 't')}^{2}$（m）の、${ft(t1)}秒から${ft(t2)}秒までの平均の速さ $□\\,\\mathrm{m/s}$`, a: `$${ft(v)}$`,
          easy: `$${c === 1 ? '' : `${c}\\times`}(2\\times${a}${back ? '-' : '+'}${h})=${ft(v)}$`, key: `${c}:${ft(t1)}`,
          verify: p => close(num(p.a), c * (F.val(t2) ** 2 - F.val(t1) ** 2) / (F.val(t2) - F.val(t1)), 1e-9) || '平均の速さがちがう',
        };
      },
      // わな：3乗（2a+h の形にならない。展開する）
      trap(r) {
        const a = r.int(1, 3);
        return dest({ q: `$x=t^{3}$（m）の、${a}秒から $${a}+h$ 秒までの平均の速さ　□`, a: `$${3 * a * a}+${3 * a}h+h^{2}$`, verify: p => avgOK(p.a, 't^{3}', 't', a) },
          '5-04', `3乗なので $2a+h$ の形ではない。$(${a}+h)^3=${a ** 3}+${3 * a * a}h+${3 * a}h^2+h^3$ と展開して $h$ でわる`);
      },
    },
  });

  // ================================================================ 5-05
  // 楽な形の例の $x=20t^2$（cm）と、ステップ3の落下の $4.9t^2$ は入れない（O-2・R1-22）
  const C05 = [[2, 'm'], [3, 'm'], [4, 'm'], [5, 'm'], [10, 'm'], [30, 'cm'], [1.5, 'm'], [2.5, 'm']];
  M.add({
    id: '5-05', part: 1, chap: '5-2④', stars: 1,
    title: '$x=at^2$ なら $v=2at$（瞬間の速さを定義から出さない）',
    mark: '$x=$ 数 $\\times t^2$ と、「□秒の瞬間の速さ」「速さが□になる時刻」。',
    futsu: ['$t$ 秒から $t+h$ 秒までの', '平均の速さを $h$ の式にして、', '$h$ を0に近づける。'],
    raku: ['$x=20t^2$ → $v=2\\times20\\times t=40t$', '2.5秒では $40\\times2.5=100\\,\\mathrm{cm/s}$'],
    why: '$x=at^2$ の平均の速さは $2at+ah$ になり、$h$ を0に近づけると $ah$ が消えて $v=2at$（5-2④）。2は、$(t+h)^2=t^2+2th+h^2$ の $2th$ の2。一度この式を作れば、どの時刻の速さも、かけ算1回で出る。',
    caution: '$x=5t^2$ の1秒の速さを、$\\frac{5}{1}=5$（0秒から1秒の平均）としない。瞬間の速さは $2\\times5\\times1=10$。1次の項 $bt$ があるときは、$v=2at+b$（1項ずつ微分）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '15mm',
    fits(q) { return /\$x=([\d.]+)?t\^\{2\}\$/.test(q) && /瞬間の速さ|速さが|速さ \$v\$|秒後の速さ/.test(q) && !/平均|\+h/.test(q); },
    steps: {
      s1(r) {
        const [c, u] = r.pick(C05), t = r.pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5]), v = F.mul(F.mul(fr(2), D(c)), D(t)), w = F.mul(fr(2), D(c));
        return { q: `$x=${c}t^{2}$（${u}）の、${t}秒の瞬間の速さ $□\\,\\mathrm{${u}/s}$`, a: `$${ft(v)}$`, easy: `$v=2\\times${c}\\times t=${ft(w)}t$ → $${ft(w)}\\times${t}=${ft(v)}$`, easyCheck: 'last', key: `${c}:${t}`,
          verify: p => close(num(p.a), nd(`${c}t^{2}`, 't', t), 1e-6) || '速さがちがう' };
      },
      // 速さから時刻・位置（s1 の逆の問題とは key で重ならないようにする。N-2）
      s2(r) {
        const [c, u] = r.pick(C05), t = r.pick([1, 2, 3, 4, 5, 6, 0.5, 1.5, 2.5]), w = F.mul(fr(2), D(c)), v = F.mul(w, D(t)), x = F.mul(D(c), F.mul(D(t), D(t)));
        if (!isDec(v, 1) || !isDec(x, 2)) return null;
        if (r.chance(0.6)) return { q: `$x=${c}t^{2}$（${u}）で、速さが $${ft(v)}\\,\\mathrm{${u}/s}$ になるのは □ 秒後`, a: `$${t}$`, easy: `$v=${ft(w)}t$、$${ft(w)}t=${ft(v)}$ → $t=${t}$`, easyCheck: false, key: `${c}:${t}`,
          verify: p => close(nd(`${c}t^{2}`, 't', num(p.a)), F.val(v), 1e-6) || '時刻がちがう' };
        return { q: `$x=${c}t^{2}$（${u}）で、速さが $${ft(v)}\\,\\mathrm{${u}/s}$ になったときの位置 $x=□\\,\\mathrm{${u}}$`, a: `$${ft(x)}$`, easy: `$${ft(w)}t=${ft(v)}$ → $t=${t}$、$${c}\\times${t}^{2}=${ft(x)}$`, easyCheck: 'last', key: `${c}:${t}`,
          verify: p => { const T = F.val(v) / (2 * c); return close(num(p.a), c * T * T, 1e-9) || '位置がちがう'; } };
      },
      // 速さの式・場面（落下、坂のボール、発進する車と時速）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [c, u] = r.pick(C05), w = F.mul(fr(2), D(c));
          return { q: `$x=${c}t^{2}$（${u}）の、$t$ 秒の瞬間の速さ $v$ を $t$ の式で表すと $v=□$`, a: `$${ft(w)}t$`, easy: `$2\\times${c}\\times t=${ft(w)}t$`, key: `e${c}`, calc: { kind: 'diff', f: `${c}t^{2}`, x: 't' } };
        }
        if (k === 1) {
          const t = r.int(1, 4), v = F.mul(D('9.8'), fr(t));
          return { q: `物を落とすと、$t$ 秒で $x=4.9t^{2}$（m）落ちる。${t}秒後の速さ $□\\,\\mathrm{m/s}$`, a: `$${ft(v)}$`, easy: `$v=9.8t$ → $9.8\\times${t}=${ft(v)}$`, easyCheck: 'last', key: 'g',   // 落下（$4.9t^2$）は見開きに1問（R1-22）
            verify: p => close(num(p.a), nd('4.9t^{2}', 't', t), 1e-6) || '速さがちがう' };
        }
        if (k === 2) {   // 楽な形の例（$x=20t^2$）とは別の係数（O-2）。key は s1・s2 と同じ形
          const c = r.pick([10, 15, 25, 30]), T = r.pick([1, 1.5, 2, 2.5, 3, 4]), v = 2 * c * T;
          return { q: `坂をころがるボールの位置は $x=${c}t^{2}$（cm）。速さが $${v}\\,\\mathrm{cm/s}$ になるのは □ 秒後`, a: `$${T}$`, easy: `$v=${2 * c}t$、$${2 * c}t=${v}$ → $t=${T}$`, easyCheck: false, key: `${c}:${T}`,
            verify: p => close(nd(`${c}t^{2}`, 't', num(p.a)), v, 1e-6) || '時刻がちがう' };
        }
        const [c, t] = r.pick([[1.5, 6], [1.5, 4], [2.5, 4], [2.5, 2], [2, 5], [1.25, 8], [1.5, 2]]), v = F.mul(fr(2 * t), D(c)), A = F.mul(v, D('3.6'));
        return { q: `発進した車は、$t$ 秒で $x=${c}t^{2}$（m）進む。${t}秒後の速さは、時速 $□\\,\\mathrm{km}$`, a: `$${ft(A)}$`, easy: `$v=${ft(F.mul(fr(2), D(c)))}t$ → $${ft(v)}\\,\\mathrm{m/s}$、$${ft(v)}\\times3.6=${ft(A)}$`, easyCheck: 'last', key: `c${c}:${t}`,
          verify: p => close(num(p.a), nd(`${c}t^{2}`, 't', t) * 3.6, 1e-6) || '時速がちがう' };
      },
      // わな：1次の項がある（v=2at ではない。1項ずつ微分。5-10）
      trap(r) {
        const c = r.pick([2, 3, 4, 5]), b = r.int(2, 6), t = r.int(1, 4), f = `${c}t^{2}+${b}t`;
        return dest({ q: `$x=${f}$（m）の、${t}秒の瞬間の速さ $□\\,\\mathrm{m/s}$`, a: `$${2 * c * t + b}$`, verify: p => close(num(p.a), nd(f, 't', t), 1e-6) || '速さがちがう' },
          '5-05', `$${b}t$ の項があるので、$v=2at$ だけではない。$v=${2 * c}t+${b}$`, ['5-10']);
      },
    },
  });

  // ================================================================ 5-06
  // h の多項式（係数は h, h^2, h^3 の順）を TeX に（昇べき：8h+2h^{2}。desc で降べき）
  function hpoly(cs, v, desc) {
    v = v || 'h';
    const ts = cs.map((c, i) => [c, i + 1]).filter(([c]) => c !== 0);
    if (desc) ts.reverse();
    return ts.map(([c, k], i) => {
      const vv = k === 1 ? v : (v.length > 1 ? `(${v})^{${k}}` : `${v}^{${k}}`);
      const body = `${Math.abs(c) === 1 ? '' : Math.abs(c)}${vv}`;
      return (c < 0 ? '-' : i ? '+' : '') + body;
    }).join('');
  }
  // lim の答えを、小さい h（Δt）を入れて確かめる
  function limOK(p, vars) {
    const t = maths(p.q).find(m => /\\lim/.test(m)), fp = t && fracParts(t);
    if (!fp) return 'lim の分数が読めない';
    const fix = s => s.replace(/\(\\Delta t\)/g, '(h)').replace(/\\Delta t/g, 'h');
    for (const x of vars ? [0.37, 1.3, -2.1] : [0]) {
      const vs = Object.assign(vars ? { x } : {}, { h: 1e-7 });
      const v = M.evalMath(fix(fp.num), vs) / M.evalMath(fix(fp.den), vs), want = M.evalMath(strip(p.a), vars ? { x } : {});
      if (want == null || !close(v, want, 1e-5)) return `h=0.0000001 で ${fmt(v)}、答え ${p.a} とちがう`;
    }
    return true;
  }
  const LIM = '\\displaystyle\\lim_{h\\to0}';
  M.add({
    id: '5-06', part: 1, chap: '5-3①', stars: 1,
    title: '$\\lim$ は先に $h$ でわる：$\\frac{ah+bh^2}{h}\\to a$（$h$ の1乗の係数を読む）',
    mark: '$\\displaystyle\\lim_{h\\to0}\\frac{\\cdots}{h}$ で、分子のどの項にも $h$ がある。',
    futsu: ['$h$ に 0.1、0.01、0.001 を入れて値を計算し、', '近づく先を表から読む。'],
    raku: ['$\\displaystyle\\lim_{h\\to0}\\frac{8h+2h^2}{h}$', '$=\\displaystyle\\lim_{h\\to0}(8+2h)=8$'],
    why: '$h$ は0ではないので、分子の1つずつを $h$ でわってよい（2-12）。わると $h$ の1乗の項は数だけになり、$h^2$・$h^3$ の項には $h$ が残る。$h$ を0に近づけると $h$ のある項は0に近づくので、残るのは $h$ の1乗の係数（5-3①）。',
    caution: '$h=0$ をいきなり入れると $\\frac{0}{0}$ で計算できない（わってから近づける）。分母が $2h$ なら、係数も2でわる。分子にかっこ（$(3+h)^2$ など）があれば、先に展開する。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '15mm', s2: '13mm', s3: '18mm', trap: '15mm' }, boxh: { s2: '12mm' },
    fits(q) {
      const t = maths(q).find(m => /\\lim/.test(m)), fp = t && fracParts(t);
      if (!fp) return false;
      const n = fp.num.replace(/\(\\Delta t\)/g, 'D').replace(/\\Delta t/g, 'D');
      return !/[()]/.test(n) || /^h\([^()]*\)$/.test(n);
    },
    steps: {
      s1(r) {
        const a = r.pick([-12, -9, -8, -7, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12]), b = r.pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
        if (a === 8 && b === 2) return null;   // 楽な形の例（O-2）
        return { q: `$${LIM}\\frac{${hpoly([a, b])}}{h}$`, a: `$${a}$`, easy: `$${LIM}(${a}${plusT(b, 'h')})=${a}$`, easyCheck: 'last', key: `${a},${b}`, verify: p => limOK(p) };
      },
      // 項が3つ・降べきの順・分母が kh
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick([-6, -5, -3, -2, 2, 3, 4, 5, 6, 9]), b = r.pick([-3, -2, -1, 1, 2, 3]), c = r.pick([-1, 1]);
          if (hpoly([a, b, c]).replace(/\^\{\d\}/g, '2').length > 9) return null;   // 2列に入る長さだけ
          return { q: `$${LIM}\\frac{${hpoly([a, b, c])}}{h}$`, a: `$${a}$`, easy: `$${LIM}(${a}${plusT(b, 'h')}${plusT(c, 'h^{2}')})=${a}$`, easyCheck: 'last', key: `3:${a},${b},${c}`, verify: p => limOK(p) };
        }
        if (k === 1) {
          const a = r.pick([-7, -4, -3, 2, 3, 5, 6, 8, 10]), b = r.pick([-3, -2, -1, 1, 2, 4]);
          return { q: `$${LIM}\\frac{${hpoly([a, b], 'h', true)}}{h}$`, a: `$${a}$`, easy: `$h$ の1乗の係数 → $${a}$`, easyCheck: 'last', key: `d:${a},${b}`, verify: p => limOK(p) };
        }
        const d = r.pick([2, 3, 4]), a = r.pick([-9, -6, -5, -3, 2, 3, 4, 5, 6, 8, 9]), b = r.pick([-2, -1, 1, 2, 3]), L = fr(a, d);
        if (a === 8 && b === 2) return null;   // 分子が楽な形の例と同じ（O-2）
        return { q: `$${LIM}\\frac{${hpoly([a, b])}}{${d}h}$`, a: `$${F.tex(L)}$`, easy: `$${LIM}\\frac{${a}${plusT(b, 'h')}}{${d}}=${F.tex(L)}$`, easyCheck: 'last', key: `k:${a},${b},${d}`, verify: p => limOK(p) };
      },
      // Δt で書いた極限・かけ算の形・x をふくむ（導関数の計算のとちゅう）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick([10, 20, 30, 40]), b = 5;
          return { q: `$\\displaystyle\\lim_{\\Delta t\\to0}\\frac{${hpoly([a, b], '\\Delta t')}}{\\Delta t}$`, a: `$${a}$`, easy: `$\\Delta t$ でわって $${a}+${b}\\Delta t$ → $${a}$`, easyCheck: 'last', key: 'kt', verify: p => limOK(p) };
        }
        if (k === 1) {
          const a = r.pick([-6, -4, 3, 5, 7, 8]), b = r.pick([-2, -1, 1, 2]);
          return { q: `$${LIM}\\frac{h(${a}${plusT(b, 'h')})}{h}$`, a: `$${a}$`, easy: `$h$ を約分して $${LIM}(${a}${plusT(b, 'h')})=${a}$`, easyCheck: 'last', key: 'km', verify: p => limOK(p) };
        }
        const c = r.pick([1, 2, 3, 5]), b = r.pick([0, 0, 1, -3, 4]);
        const n1 = `${2 * c === 1 ? '' : 2 * c}xh`, nb = b ? `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}h` : '';
        const ans = `${2 * c}x${b ? (b > 0 ? '+' : '') + b : ''}`;
        return { q: `$${LIM}\\frac{${n1}+${c === 1 ? '' : c}h^{2}${nb}}{h}$`, a: `$${ans}$`, easy: `$${LIM}(${2 * c}x+${c === 1 ? '' : c}h${b ? (b > 0 ? '+' : '') + b : ''})=${ans}$`, easyCheck: 'last', key: 'kx', verify: p => limOK(p, true) };
      },
      // わな：分子にかっこ（先に展開する。5-04）
      trap(r) {
        const a = r.pick([-3, -2, 2, 3, 4, 5]);
        return dest({ q: `$${LIM}\\frac{(${a}+h)^{2}-${a * a}}{h}$`, a: `$${2 * a}$`, verify: p => limOK(p) },
          '5-06', `分子にかっこがあり、このままでは $h$ の1乗の係数が見えない。$(${a}+h)^2-${a * a}=${2 * a}h+h^2$ と展開してから`, ['5-04']);
      },
    },
  });

  // ================================================================ 5-07
  // 放物線 y=cx^2 と、x=a での接線の図（ステップ3）。Q：接線と y 軸の交わる点
  function tanFig(c, a, withQ) {
    const m = 2 * c * a, k = -c * a * a, xs = [-3.6, 3.6], tl = [m * (a - 0.45) + k, m * (a + 0.45) + k];   // 接線は P の両がわまで見せる（R1-1）
    const ys = [Math.min(0, k, c * 9, ...tl) - 1, Math.max(0, k, c * 9, ...tl) + 0.5];
    const G = M.graph({ x0: xs[0], x1: xs[1], y0: ys[0], y1: ys[1], w: 8, h: 7 });
    const its = [...G.axes({ xt: c > 0 ? [a] : [], x: 'x', y: 'y', o: a < 0 ? 'se' : 'sw' })];
    if (c < 0) its.push(['seg', [a * G.sx, -0.15], [a * G.sx, 0.15]], ['label', [a * G.sx, 0], String(a).replace('-', '−'), 'n']);   // 接点が軸の下のときは、目もりの数を軸の上に
    its.push(...G.plot(x => c * x * x, xs[0], xs[1], { n: 90 }));
    its.push(...G.plot(x => m * x + k, xs[0], xs[1], { n: 4, thick: true }));
    its.push(['seg', G.T(a, 0), G.T(a, c * a * a), { dash: true }], ['dot', G.T(a, c * a * a)], ['label', G.T(a, c * a * a), 'P', (a > 0) === (c > 0) ? 'nw' : 'ne']);
    if (withQ) its.push(['dot', G.T(0, k)], ['label', G.T(0, k), 'Q', a > 0 ? 'w' : 'e']);
    return { s: 5, items: its };
  }
  const QF07 = c => `${cx(c, 'x')}^{2}`;
  M.add({
    id: '5-07', part: 1, chap: '5-3⑤', stars: 1,
    title: '接線は、接点 $(a,\\ f(a))$ と傾き $f\'(a)$ を先に出して $y=f\'(a)(x-a)+f(a)$',
    mark: '「$x=a$ の点での接線の式」。',
    futsu: ['接線を $y=mx+n$ とおいて、', 'グラフとの交わり方から $m$・$n$ を考える。'],
    raku: ['$y=x^2$、$x=2$ → 接点 $(2,\\ 4)$、傾き $2\\times2=4$', '$y=4(x-2)+4=4x-4$'],
    why: '直線の式は、通る1点と傾きで決まる（3-5の $y-y_1=m(x-x_1)$）。接線は接点 $(a,\\ f(a))$ を通り、傾きは微分係数 $f\'(a)$（5-3⑤）。だから、この2つの数を先に出せば、あとは代入して展開するだけ。',
    caution: '$y-6=9(x-3)$ のように、傾きと接点の $y$ 座標を取りちがえない（かっこの前が傾き）。$x$-$t$ グラフなら、$x$ と $t$ で書く（$x=10t-5$）。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '15mm' },
    fits(q) { return /接線の式|接線と\s*\$y\$\s*軸/.test(q) && !/傾きが|平行|通る/.test(q); },
    steps: {
      s1(r) {
        const c = r.pick([1, 1, 1, 2, 3, -1]), a = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), f = QF07(c);
        if (c === 1 && a === 2) return null;   // 楽な形の例（$y=x^2$、$x=2$）は出さない（O-2）
        const m = fr(2 * c * a), k = fr(-c * a * a), fa = c * a * a;
        return { q: `$y=${f}$ のグラフの、$x=${a}$ の点での接線の式　□`, a: `$${lineTeX(m, k)}$`, easy: `接点 $${P2(a, fa)}$、傾き $${2 * c * a}$ → $y=${2 * c * a}(x${a > 0 ? '-' : '+'}${Math.abs(a)})${fa >= 0 ? '+' : ''}${fa}$`, easyCheck: false, key: `${c}:${a}`,
          verify: p => tangentOK(p.a, f, a) };
      },
      // 1次の項のある式・3次の式・x-t グラフ（x=5t^2）
      s2(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const t = r.pick([1, 2, 3, 0.5]), m = D(10 * t), x0 = F.mul(fr(5), F.mul(D(t), D(t))), n = F.sub(x0, F.mul(m, D(t)));
          return { q: `$x=5t^{2}$（m）の $x$-$t$ グラフの、$t=${t}$ の点での接線の式　□`, a: `$${lineTeX(m, n, 't', 'x')}$`, easy: `接点 $${P2(t, ft(x0))}$、傾き $${ft(m)}$`, easyCheck: false, key: `t${t}`,
            verify: p => tangentOK(p.a, '5t^{2}', t, 't', 'x') };
        }
        const cubic = k === 1, b = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), a = r.pick([-2, -1, 1, 2, 3]);
        if (cubic && Math.abs(a) > 2) return null;
        const Pf = cubic ? PN(0, b, 0, 1) : PN(0, b, 1), f = ptex(Pf), m = M.P.at(M.P.diff(Pf), a), fa = M.P.at(Pf, a), n = F.sub(fa, F.mul(m, fr(a)));
        return { q: `$y=${f}$ のグラフの、$x=${a}$ の点での接線の式　□`, a: `$${lineTeX(m, n)}$`, easy: `接点 $${P2(a, ft(fa))}$、傾き $y'=${ptex(M.P.diff(Pf))}$ に $x=${a}$ で $${ft(m)}$`, easyCheck: false, key: `${f}:${a}`,
          verify: p => tangentOK(p.a, f, a) };
      },
      // 図：放物線と接線。接線の式か、接線と y 軸の交わる点Qの y 座標
      s3(r) {
        const c = r.pick([1, 1, 2, -1]), a = r.pick([-2, -1, 1, 2, 3]), f = QF07(c), m = fr(2 * c * a), k = fr(-c * a * a);
        if (Math.abs(c * a * a) > 9 || (c < 0 && Math.abs(a) === 1) || (c === 1 && a === 2)) return null;   // y=-x^2 の x=±1 は、接点が軸に近くてラベルが重なる。$y=x^2$ の $x=2$ は楽な形の例
        // key は s1 と同じ形（同じ式・同じ点を、見開きに2回出さない。O-2・R1-13）
        if (r.chance(0.5)) {
          return { q: `図は $y=${f}$ のグラフと、点P（$x=${a}$）での接線。接線の式　□`, a: `$${lineTeX(m, k)}$`, fig: tanFig(c, a, false), easy: `接点 $${P2(a, c * a * a)}$、傾き $${2 * c * a}$`, easyCheck: false, key: `${c}:${a}`,
            verify: p => tangentOK(p.a, f, a) };
        }
        if (Math.abs(c * a * a) < 3) return null;   // Q が原点に近いと、Q と O の字が重なる
        return { q: `図は $y=${f}$ のグラフと、点P（$x=${a}$）での接線。接線と $y$ 軸が交わる点Qの $y$ 座標　□`, a: `$${ft(k)}$`, fig: tanFig(c, a, true), easy: `$y=${lineTeX(m, k).slice(2)}$ に $x=0$ → $${ft(k)}$`, easyCheck: 'last', key: `${c}:${a}`,
          verify: p => close(num(p.a), ev(f, 'x', a) - nd(f, 'x', a) * a, 1e-6) || 'Q の y 座標がちがう' };
      },
      // わな：2点を通る直線の傾き（接線ではない。平均変化率。5-02）
      trap(r) {
        const x1 = r.int(-2, 2), x2 = r.int(x1 + 1, 4);
        return dest({ q: `$y=x^{2}$ のグラフの上の2点 $${P2(x1, x1 * x1)}$、$${P2(x2, x2 * x2)}$ を通る直線の傾き　□`, a: `$${x1 + x2}$`,
          verify: p => { const ps = [...p.q.matchAll(/\$\((-?\d+),\\ (-?\d+)\)\$/g)].map(m => [+m[1], +m[2]]); return (ps.length === 2 && close((ps[1][1] - ps[0][1]) / (ps[1][0] - ps[0][0]), num(p.a))) || '傾きがちがう'; } },
        '5-07', `接線ではなく、2点を結ぶ直線。$\\frac{${x2 * x2}-${par(x1 * x1)}}{${x2}-${par(x1)}}=${x1 + x2}$`, ['5-02']);
      },
    },
  });

  // ================================================================ 5-08
  // 答えの点が、f の傾き m の接点の全部か
  function contactOK(ans, f, m) {
    const ps = pointsOf(ans), rs = rootsOfSlope(f, m);
    if (!ps.length || ps.some(([x, y]) => x == null || y == null)) return `点が読めない（${ans}）`;
    if (ps.length !== rs.length) return `接点の数が ${rs.length} こ（答えは ${ps.length} こ）`;
    for (const [x, y] of ps) {
      if (!close(y, ev(f, 'x', x), 1e-7)) return `(${x}, ${y}) がグラフの上にない`;
      if (!close(nd(f, 'x', x), m, 1e-5)) return `(${x}, ${y}) の傾きが ${m} でない`;
    }
    return true;
  }
  // 答えの直線（1つか2つ）が、f の接線で、傾き m（m を省くと問わない）、点 Pt を通る（Pt を省くと問わない）
  function linesOK(ans, f, m, Pt) {
    const ls = maths(ans);
    if (!ls.length) return '直線が読めない';
    for (const l of ls) {
      const i = l.indexOf('='); if (i < 0) return `直線の式の形でない（${l}）`;
      const L = x => ev(l.slice(i + 1), 'x', x), sl = L(1) - L(0), n0 = L(0);
      if (sl == null || n0 == null || isNaN(sl)) return `直線が読めない（${l}）`;
      if (m != null && !close(sl, m, 1e-7)) return `傾きが ${m} でない（${l}）`;
      if (Pt && !close(L(Pt[0]), Pt[1], 1e-7)) return `点 (${Pt}) を通らない（${l}）`;
      const as = rootsOfSlope(f, sl).filter(a => close(L(a), ev(f, 'x', a), 1e-5));
      if (!as.length) return `接線でない（${l}）`;
    }
    if (new Set(ls).size !== ls.length) return '同じ直線が2つ';
    return true;
  }
  M.add({
    id: '5-08', part: 1, chap: '5-3⑤・5-4 例題10', stars: 1,
    title: '傾きから接点を探す：$f\'(x)=m$ を先に解く（答えが2つのことも）',
    mark: '「接線の傾きが□になる点」「□に平行な接線」。',
    futsu: ['接点を $(a,\\ f(a))$ とおいて接線の式を作り、', 'その式の傾きと □ をくらべる。'],
    raku: ['$y=x^3$、傾き12 → $3x^2=12$', '$x=2,\\ -2$ → $(2,\\ 8)$ と $(-2,\\ -8)$'],
    why: '接線の傾きは導関数の値 $f\'(x)$（5-3）。だから「傾きが $m$」は、方程式 $f\'(x)=m$ を解けば、接点の $x$ 座標が出る。$y$ 座標は、もとの式 $f(x)$ に入れて出す。平行な直線とは、傾きが同じ直線（5-4 例題10）。',
    caution: '$x^2=4$ の答えは $2$ と $-2$ の2つ（2-8）。接点の $y$ 座標は、$f\'(x)$ ではなく $f(x)$ に入れる。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '36mm', s3: '36mm', trap: '36mm' },
    fits(q) { return /接線|接点/.test(q) && /傾きが|平行/.test(q); },
    steps: {
      s1(r) {
        const c = r.pick([1, 1, 2, 3]), a = r.pick([-4, -3, -2, -1, 1, 2, 3, 4]), m = 2 * c * a, f = QF07(c);
        return { q: `$y=${f}$ で、接線の傾きが $${m}$ になる接点　□`, a: `$${P2(a, c * a * a)}$`, easy: `$${2 * c}x=${m}$ → $x=${a}$、$y=${c * a * a}$`, easyCheck: false, key: `${c}:${m}`,
          verify: p => contactOK(p.a, f, m) };
      },
      // 3次の式（答えが2つ）・1次の項のある式
      s2(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const b = r.pick([-6, -4, -2, 2, 4, 6]), a = r.pick([-3, -2, -1, 1, 2, 3]), Pf = PN(0, b, 1), f = ptex(Pf), m = 2 * a + b;
          return { q: `$y=${f}$ で、接線の傾きが $${m}$ になる接点　□`, a: `$${P2(a, a * a + b * a)}$`, easy: `$y'=2x${b > 0 ? '+' : ''}${b}=${m}$ → $x=${a}$`, easyCheck: false, key: `q${b}:${m}`,
            verify: p => contactOK(p.a, f, m) };
        }
        const b = k === 1 ? r.pick([3, 6, 12]) : 0, s = r.int(1, 3), m = 3 * s * s - b, Pf = PN(0, -b, 0, 1), f = ptex(Pf), y = sv => sv ** 3 - b * sv;
        if (b === 0 && s === 2) return null;   // $y=x^3$、傾き12 は楽な形の例（O-2）
        return { q: `$y=${f}$ で、接線の傾きが $${m}$ になる接点（すべて）　□`, a: `$${P2(s, y(s))}$ と $${P2(-s, y(-s))}$`, easy: `$3x^2${b ? `-${b}` : ''}=${m}$ → $x^2=${s * s}$ → $x=${s},\\ -${s}$`, easyCheck: false, key: `c${b}:${m}`,
          verify: p => contactOK(p.a, f, m) };
      },
      // 平行な接線の式・傾きが決まった接線の式（2つ）
      s3(r) {
        if (r.chance(0.5)) {
          const a = r.pick([-2, -1, 1, 2]), m = 2 * a, d = r.pick([-5, -1, 1, 3, 6]);   // 接点の |a|≦2。わなの接点（|a|≧3）と重ねない（R1-12）
          return { q: `$y=x^{2}$ の接線のうち、直線 $y=${m}x${d > 0 ? '+' : ''}${d}$ に平行なものの式　□`, a: `$${lineTeX(fr(m), fr(-a * a))}$`, easy: `$2x=${m}$ → 接点 $${P2(a, a * a)}$`, easyCheck: false, key: `1:${m}`,
            verify: p => linesOK(p.a, 'x^{2}', m) };
        }
        const s = r.pick([1, 3]), m = 3 * s * s, n = 2 * s ** 3;   // s=2（傾き12）は楽な形の例
        return { q: `$y=x^{3}$ の接線のうち、傾きが $${m}$ のものの式（2つ）　□`, a: `$y=${m}x-${n}$ と $y=${m}x+${n}$`, easy: `$3x^2=${m}$ → 接点 $${P2(s, s ** 3)}$ と $${P2(-s, -(s ** 3))}$`, easyCheck: false, key: `c0:${m}`,
          verify: p => maths(p.a).length !== 2 ? '接線は2つ' : linesOK(p.a, 'x^{3}', m) };
      },
      // わな：グラフの外の点を通る接線（傾きがわからない。接点を (a, a^2) とおく）
      trap(r) {
        const [a1, a2] = r.pick([[-3, 3], [-4, 4], [-5, 5], [-3, 5], [-5, 3]]), px = (a1 + a2) / 2, py = a1 * a2;   // 接点は |a|≧3（ステップ3の接点 |a|≦2 と重ねない。R1-12）
        const L = a => lineTeX(fr(2 * a), fr(-a * a));
        return dest({ q: `$y=x^{2}$ の接線のうち、点 $${P2(px, py)}$ を通るものの式（2つ）　□`, a: `$${L(a2)}$ と $${L(a1)}$`,
          verify: p => maths(p.a).length !== 2 ? '接線は2つ' : linesOK(p.a, 'x^{2}', null, [px, py]) },
        '5-08', `傾きがわからない（点 $${P2(px, py)}$ は接点ではない）。接点を $(a,\\ a^2)$ とおき、接線 $y=2ax-a^2$ がこの点を通る条件 $a^2${px ? `${-2 * px > 0 ? '+' : ''}${-2 * px}a` : ''}${py ? sgn(py) : ''}=0$ から $a=${a2},\\ ${a1}$`);
      },
    },
  });

  // ================================================================ 微分のきまり（5-09〜5-14）の部品
  const askD = q => ASKD.test(q) && !NOTD.test(q);                     // 導関数・微分係数・速さを聞いていて、ほかのわざの目印がない
  const PURE = /^[a-zA-Z](?:\^\{\d+\})?$/;                             // x^{5}・x・t^{3}（係数なし）
  const mono = (c, n, v) => (n === 0 ? fmt(c) : cx(c, v) + (n === 1 ? '' : `^{${n}}`));   // c v^n（n は負でもよい）
  const sgn = b => `${b > 0 ? '+' : ''}${b}`;                          // +3・-3
  const NZ = n => range(-n, n).filter(v => v !== 0);
  // 式の中の \frac をすべてとり出す
  function fracsOf(t) {
    const out = []; let from = 0;
    for (let k = 0; k < 20; k++) { const fp = fracParts(t, from); if (!fp) break; out.push(fp); from = fp.end; }
    return out;
  }
  // 多項式（係数は分数。低い次から）の導関数を、1項ずつの形で書く：3\times3x^{2}-2\times2x+5（dec：係数を小数で）
  function stepTeX(a, v, o) {
    v = v || 'x'; o = o || {};
    let s = '';
    for (let k = a.length - 1; k >= 1; k--) {
      const c = a[k]; if (!c || c[0] === 0) continue;
      const neg = c[0] < 0, ab = [Math.abs(c[0]), c[1]], one = ab[0] === 1 && ab[1] === 1;
      const ct = o.dec && decOK(ab[1]) ? fmt(ab[0] / ab[1]) : F.tex(ab);
      const body = k === 1 ? ct : (one ? '' : ct + '\\times') + mono(k, k - 1, v);
      s += (s ? (neg ? '-' : '+') : (neg ? '-' : '')) + body;
    }
    return s || '0';
  }
  // 1項だけの多項式 c x^n（c は分数）
  const term = (c, n) => Array.from({ length: n + 1 }, (_, k) => (k === n ? c : fr(0)));
  // 答え ans が、式 f（TeX）を文字 X で微分したものか。ほかの文字（定数）には数を入れる。v_{0} は1つの文字として読む
  function diffOK(ans, f, X) {
    const one = s => String(s).replace(/v_\{0\}/g, 'u');
    const A = one(strip(ans)), Fx = one(f), names = M.mathVars(`${A} ${Fx}`, { econst: true }).filter(n => n !== X);
    for (const [k, x] of [0.7, 1.3, 2.1].entries()) {
      const c = Object.fromEntries(names.map((n, j) => [n, 0.9 + 0.37 * j + 0.21 * k]));
      const d = nd(Fx, X, x, c), v = ev(A, X, x, c);
      if (d == null || v == null) return `式が読めない（${ans} ／ ${f}）`;
      if (!close(d, v, 1e-5)) return `${X}=${x} で、微分 ${fmt(d)} と答え ${ans} がちがう`;
    }
    return true;
  }

  // ================================================================ 5-09
  M.add({
    id: '5-09', part: 1, chap: '5-4⑤', stars: 1,
    title: '$(x^n)\'=nx^{n-1}$：指数を前に出して、指数を1へらす（$x$ は1、定数は0）',
    mark: '$x^5$、$x^{10}$、$x$、$7$ のような、$x^n$ だけ・数だけの式の微分。',
    futsu: ['定義にもどって、$\\frac{(x+h)^5-x^5}{h}$ を展開し、', '$h$ を0に近づける。'],
    raku: ['$x^5$ → 5を前に出し、指数を $5-1=4$ に → $5x^4$', '$x$ → $1$　　$7$ → $0$'],
    why: '$(x+h)^n$ を展開すると $x^n+nx^{n-1}h+\\cdots$ で、$h$ の1乗の係数が $nx^{n-1}$。だから平均変化率は、$h$ を0に近づけると $nx^{n-1}$ になる（5-4⑤）。$x=x^1$ は $1\\times x^0=1$（$y=x$ の傾きは、どこでも1）。定数のグラフは横にまっすぐなので、傾きは0。',
    caution: '「前に出す」と「1へらす」はセット（$(x^3)\'$ を $x^2$ や $3x^3$ としない）。$x$ の微分は0ではなく1。0になるのは、$x$ をふくまない定数だけ。',
    counts: { s1: 10, s2: 6, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '15mm', s2: '15mm', s3: '15mm', trap: '24mm' },
    fits(q) {
      if (/\$[A-Z]=[a-z]\^\{\d+\}\$/.test(q) && /で微分/.test(q)) return true;
      const f = funcOf(q);
      if (!f || !askD(q)) return false;
      return PURE.test(f) || CONST.test(f) || /^[a-z]\^\{\d+\}\\(?:times|div) ?[a-z]\^\{\d+\}$/.test(f) || /^\([a-z]\^\{\d+\}\)\^\{\d+\}$/.test(f);
    },
    steps: {
      // x^n・x・定数
      s1(r) {
        const k = r.next();
        if (k < 0.12) return { q: '$(x)\'=□$', a: '$1$', easy: '$x=x^{1}$ なので $1\\times x^{0}=1$', easyCheck: 'last', key: 'p1', calc: { kind: 'diff', f: 'x' } };
        if (k < 0.24) {
          const c = r.pick([3, 5, 7, 10, 12, 100, -3, -8]);
          return { q: `$(${c})'=□$`, a: '$0$', easy: `$${c}$ は定数（グラフは横にまっすぐ）なので $0$`, easyCheck: false, key: 'const', calc: { kind: 'diff', f: `${c}` } };
        }
        const n = r.int(2, 12), v = r.chance(0.8) ? 'x' : 't', ans = mono(n, n - 1, v);
        if (n === 5 && v === 'x') return null;   // 楽な形の例（$x^5$。O-2）
        return { q: `$(${v}^{${n}})'=□$`, a: `$${ans}$`, easy: `指数 ${n} を前に出し、指数を $${n}-1=${n - 1}$ に → $${ans}$`, easyCheck: 'last', key: `p${n}`, calc: { kind: 'diff', f: `${v}^{${n}}`, x: v } };
      },
      // 微分係数・接線の傾き（導関数を作ってから代入）・時間の式
      s2(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const m = r.int(3, 6), ans = mono(m, m - 1, 't');
          return { q: `$x=t^{${m}}$（m）で動く物体の、$t$ 秒の瞬間の速さ $v=□$`, a: `$${ans}$`, easy: `指数 ${m} を前に出し、指数を1へらす → $${ans}$`, easyCheck: 'last', key: `p${m}`, calc: { kind: 'diff', f: `t^{${m}}`, x: 't' } };
        }
        const n = r.int(2, 5), a = r.pick([-3, -2, -1, 1, 2, 3, 4]), val = n * a ** (n - 1), f = `x^{${n}}`;
        if (Math.abs(val) > 150) return null;
        const sub = `$${n}\\times${par(a)}${n === 2 ? '' : `^{${n - 1}}`}=${val}$`;
        return {
          q: k === 0 ? `$f(x)=${f}$ のとき $f'(${a})=□$` : `$y=${f}$ のグラフの、$x=${a}$ の点での接線の傾き　□`,
          a: `$${val}$`, easy: `$${k === 0 ? 'f\'(x)' : 'y\''}=${mono(n, n - 1, 'x')}$ → ${sub}`, easyCheck: 'last', key: `v${n}:${a}`,
          verify: p => close(num(p.a), nd(f, 'x', a), 1e-6) || '微分係数がちがう',
        };
      },
      // 見かけがちがう：指数のきまりで x^n にまとめてから・ほかの文字・逆（key：見開きに1つずつ）
      s3(r) {
        const k = r.int(0, 4);
        if (k === 0) {
          const m = r.int(2, 5), n = r.int(2, 5), f = `x^{${m}}\\times x^{${n}}`, ans = mono(m + n, m + n - 1, 'x');
          return { q: `$(${f})'=□$`, a: `$${ans}$`, easy: `$${f}=x^{${m + n}}$ → $${ans}$`, easyCheck: 'last', key: 'k0', calc: { kind: 'diff', f } };
        }
        if (k === 1) {
          const n = r.int(2, 4), m = n + r.int(2, 5), f = `x^{${m}}\\div x^{${n}}`, ans = mono(m - n, m - n - 1, 'x');
          return { q: `$(${f})'=□$`, a: `$${ans}$`, easy: `$${f}=x^{${m - n}}$ → $${ans}$`, easyCheck: 'last', key: 'k1', calc: { kind: 'diff', f } };
        }
        if (k === 2) {
          const m = r.int(2, 4), n = r.int(2, 4), f = `(x^{${m}})^{${n}}`, ans = mono(m * n, m * n - 1, 'x');
          if (m * n > 12) return null;
          return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, easy: `$${f}=x^{${m * n}}$ → $${ans}$`, easyCheck: 'last', key: 'k2', calc: { kind: 'diff', f } };
        }
        if (k === 3) {
          const [lead, Y, n] = r.pick([['1辺 $a$ の正方形の面積', 'S', 2], ['1辺 $a$ の立方体の体積', 'V', 3]]), ans = mono(n, n - 1, 'a');
          return { q: `${lead} $${Y}=a^{${n}}$ を $a$ で微分すると $\\frac{\\dd ${Y}}{\\dd a}=□$`, a: `$${ans}$`, easy: `指数 ${n} を前に出し、指数を1へらす → $${ans}$`, easyCheck: 'last', key: 'k3', calc: { kind: 'diff', f: `a^{${n}}`, x: 'a' } };
        }
        const n = r.int(3, 12), g = mono(n, n - 1, 'x');
        if (n === 5) return null;   // 楽な形の例（$5x^4$）の逆
        return {
          q: `微分すると $${g}$ になるのは、$x^{n}$ の $n=□$ のとき`, a: `$${n}$`, easy: `前に出た数が指数 → $${n}$（指数は $${n}-1=${n - 1}$ で合う）`, easyCheck: false, key: 'k4',
          verify: p => [0.6, 1.4].every(x => close(nd(`x^{${num(p.a)}}`, 'x', x), ev(g, 'x', x), 1e-6)) || '微分しても、もとの式にならない',
        };
      },
      // わな：かっこの中が x だけでない（x^n の形ではない。展開してから。5-13・5-20）
      trap(r) {
        const a = r.pick([2, 3]), n = r.pick([2, 3]);
        if (r.chance(0.6)) {
          const b = r.pick(NZ(3)), inner = `${a}x${sgn(b)}`, f = `(${inner})^{${n}}`, Pf = M.P.pow(PN(b, a), n);
          if (F.gcd(a, Math.abs(b)) !== 1) return null;
          const ans = n === 2 ? ptex(M.P.diff(Pf)) : `${n * a}(${inner})^{2}`;
          return dest({ q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, key: 'trapA', calc: { kind: 'diff', f } },
            '5-09', `かっこの中が $x$ だけでないので、$${n}(${inner})${n === 2 ? '' : '^{2}'}$ ではない。展開して $${ptex(Pf)}$ にしてから`, ['5-13', '5-20']);
        }
        const f = `(${a}x)^{${n}}`, ans = mono(n * a ** n, n - 1, 'x');
        return dest({ q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, key: 'trapB', calc: { kind: 'diff', f } },
          '5-09', `かっこの中が $x$ だけでないので、$${mono(n, n - 1, `(${a}x)`)}$ ではない。$${f}=${a ** n}x^{${n}}$ としてから`, ['5-13', '5-20']);
      },
    },
  });

  // ================================================================ 5-10
  // 整数の係数の多項式（lo〜hi 項、maxd 次まで）
  function rpoly(r, maxd, lo, hi) {
    const d = r.int(2, maxd), cs = [];
    for (let k = 0; k <= d; k++) cs.push(k === d ? r.pick([1, 1, 2, 3, 4, 5, -1, -2, -3]) : r.chance(k === 0 ? 0.5 : 0.65) ? r.pick(NZ(7)) : 0);
    const nz = cs.filter(c => c !== 0).length;
    return nz >= lo && nz <= hi ? PN(...cs) : null;
  }
  // 位置の式の場面（教科書 5-4 例題4・8、章末）
  const SC10 = [
    r => ({ lead: '投げ下ろしたボールの位置が', P: PN(r.int(0, 3), r.int(1, 6), 4.9) }),
    r => ({ lead: '真上に投げたボールの高さが', P: PN(0, r.pick([10, 20, 30, 40]), -5) }),
    r => ({ lead: '坂を下る台車の位置が', P: PN(0, r.int(1, 5), r.pick([0.5, 1.5, 2, 2.5])) }),
    r => { const c = r.pick([2, 3, 4]); return { lead: '直線の上を動く物体の位置が', P: PN(r.int(1, 6), -c * r.pick([2, 4, 6]), c) }; },
  ];
  M.add({
    id: '5-10', part: 1, chap: '5-4⑥', stars: 1,
    title: '多項式は1項ずつ微分（係数はそのまま、定数は消える）。微分係数は導関数を作ってから代入',
    mark: '項がいくつかある式（$3x^3-2x^2+5x-7$）や、係数のある項（$4x^3$）。$f\'(1)$・$f\'(-1)$ などの微分係数。',
    futsu: ['$f(-1+h)$ を展開して平均変化率を作り、', '$h$ を0に近づける（値ごとに、くり返す）。'],
    raku: ['$3x^3-2x^2+5x-7$', '→ $3\\times3x^2-2\\times2x+5=9x^2-4x+5$', '$f\'(-1)=9+4+5=18$'],
    why: '数をかけた関数は、数をそのままにして残りを微分すればよい（定数倍）。和は、1つずつ微分してたせばよい（5-4⑥）。だから多項式は、1つの項ずつ $(x^n)\'=nx^{n-1}$ を使えば微分できる。導関数を1回作っておけば、どの $x$ の微分係数も、代入するだけで出る。',
    caution: '前にかかっている数を忘れない（$(3x^2)\'$ は $2x$ ではなく $6x$）。たした定数は消える（$(x^2+5)\'=2x$）。$(5x)\'=5$（0ではない）。負の数は、かっこごと代入する。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '15mm', s3: '15mm', trap: '26mm' },
    fits(q) {
      const f = funcOf(q);
      return !!f && askD(q) && isPoly(f) && !PURE.test(f) && !CONST.test(f);
    },
    steps: {
      // 係数のある1項・2項の式
      s1(r) {
        let Pf, one = null;
        if (r.chance(0.4)) { const c = r.pick([2, 3, 4, 5, 6, 8, -2, -3, -4, -5]), n = r.int(1, 5); Pf = term(fr(c), n); if (n === 1) one = c; } else Pf = rpoly(r, 4, 2, 2);
        if (!Pf) return null;
        const f = ptex(Pf), ans = ptex(M.P.diff(Pf)), st = stepTeX(Pf);
        return { q: `$(${f})'=□$`, a: `$${ans}$`, easy: one != null ? `$${one}\\times1=${one}$` : st === ans ? `${Pf[0][0] ? '定数は消えて' : '1項ずつ微分して'} $${ans}$` :`$${st}=${ans}$`, key: f, calc: { kind: 'diff', f } };
      },
      // 3〜4項の式・微分係数（導関数を作ってから代入）
      s2(r) {
        if (r.chance(0.5)) {
          const Pg = rpoly(r, 4, 3, 4); if (!Pg) return null;
          const g = ptex(Pg), ans = ptex(M.P.diff(Pg));
          return { q: `$(${g})'=□$`, a: `$${ans}$`, easy: `$${stepTeX(Pg)}=${ans}$`, key: g, boxw: '30mm', calc: { kind: 'diff', f: g } };
        }
        const Pf = rpoly(r, 3, 2, 4); if (!Pf) return null;
        const a = r.pick([-2, -1, 1, 2, 3]), f = ptex(Pf), dP = M.P.diff(Pf), val = M.P.at(dP, a)[0];
        if (Math.abs(val) > 99) return null;
        return {
          q: r.chance(0.7) ? `$f(x)=${f}$ のとき $f'(${a})=□$` : `$f(x)=${f}$ の、$x=${a}$ での微分係数　□`,
          a: `$${val}$`, easy: `$f'(x)=${ptex(dP)}$ に $x=${a}$ → $${val}$`, easyCheck: 'last', key: `d${f}:${a}`,
          verify: p => close(num(p.a), nd(f, 'x', a), 1e-6) || '微分係数がちがう',
        };
      },
      // 位置の式から速度（式・値・時刻）。速度は負にもなるので「速さ」と書かない（O-3）
      s3(r) {
        const si = r.int(0, SC10.length - 1), sc = SC10[si](r), f = ptex(sc.P, 't', { dec: true }), dP = M.P.diff(sc.P), vt = ptex(dP, 't', { dec: true }), k = r.int(0, 2);
        const head = `${sc.lead} $x=${f}$（m）のとき、`;
        if (k === 0) return { q: `${head}$t$ 秒の瞬間の速度 $v=□$`, a: `$${vt}$`, easy: `$${stepTeX(sc.P, 't', { dec: true })}=${vt}$`, key: `${si}:0`, boxw: '24mm', calc: { kind: 'diff', f, x: 't' } };
        if (k === 1) {
          const T = r.int(1, 4), v = M.P.at(dP, T);
          return { q: `${head}${T}秒の瞬間の速度 $□\\,\\mathrm{m/s}$`, a: `$${ft(v)}$`, easy: `$v=${vt}$ に $t=${T}$ → $${ft(v)}$`, easyCheck: 'last', key: `${si}:1`,
            verify: p => close(num(p.a), nd(f, 't', T), 1e-6) || '速度がちがう' };
        }
        const T = D(r.pick([1, 2, 3, 4, 5, 0.5, 1.5, 2.5])), V = M.P.at(dP, T);
        if (!isDec(V, 1) || V[0] < 0) return null;
        return { q: `${head}速度が $${ft(V)}\\,\\mathrm{m/s}$ になるのは □ 秒後`, a: `$${ft(T)}$`, easy: `$v=${vt}$、$${vt}=${ft(V)}$ → $t=${ft(T)}$`, easyCheck: false, key: `${si}:2`,
          verify: p => close(nd(f, 't', num(p.a)), F.val(V), 1e-6) || '時刻がちがう' };
      },
      // わな：かっこのかけ算（1項ずつにできない。5-13）・平均の速さ（微分しない。5-02・5-04）
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.pick([1, 2, 3, 4]), b = r.pick(NZ(3)), Pf = M.P.mul(PN(a, 0, 1), PN(b, 1)), f = `(x^{2}+${a})(x${sgn(b)})`;
          return dest({ q: `$\\{${f}\\}'=□$`, a: `$${ptex(M.P.diff(Pf))}$`, key: 'trapA', calc: { kind: 'diff', f } },
            '5-10', `かっこのかけ算のままでは、1項ずつ微分できない（微分どうしをかけて $2x\\times1$ としない）。展開して $${ptex(Pf)}$ にしてから`, ['5-13', '5-19']);
        }
        const c = r.pick([2, 3, 4, 5]), b = r.int(2, 6), t1 = r.int(0, 2), t2 = t1 + r.pick([2, 3, 4]), f = `${c}t^{2}+${b}t`, x = t => c * t * t + b * t, v = (x(t2) - x(t1)) / (t2 - t1);
        return dest({ q: `位置が $x=${f}$（m）の物体の、${t1}秒から${t2}秒までの平均の速さ $□\\,\\mathrm{m/s}$`, a: `$${v}$`, key: 'trapB',
          verify: p => close(num(p.a), (ev(f, 't', t2) - ev(f, 't', t1)) / (t2 - t1)) || '平均の速さがちがう' },
        '5-10', `瞬間の速さではないので、微分して代入しない。$\\frac{${x(t2)}-${x(t1)}}{${t2}-${t1}}=${v}$`, ['5-02']);
      },
    },
  });

  // ================================================================ 5-11
  // 指数 n と約分できる分母（微分すると係数が整数になる）
  const Q11 = { 2: [2], 3: [3], 4: [2, 4], 5: [5], 6: [2, 3, 6] };
  // 分数の係数のある多項式（2〜4項。微分すると係数が整数）
  function fpoly(r) {
    const degs = r.shuffle([2, 3, 4]).slice(0, r.int(2, 3)), Pf = PN(0, 0, 0, 0, 0);
    let nf = 0;
    for (const n of degs) {
      if (r.chance(0.75)) {
        const q = r.pick(Q11[n]), p = r.pick([1, 1, 2, 3, 5]) * (r.chance(0.35) ? -1 : 1);
        if (F.gcd(Math.abs(p), q) !== 1) return null;
        Pf[n] = fr(p, q); nf++;
      } else Pf[n] = fr(r.pick(NZ(3)));
    }
    if (!nf) return null;
    if (degs.length === 2 || r.chance(0.4)) { if (r.chance(0.5)) Pf[1] = fr(r.pick([-4, -1, 1, 2, 5])); else Pf[0] = fr(r.pick([-7, -3, 2, 5])); }
    return Pf;
  }
  // \frac{1}{c x^n} とその導関数 -\frac{n}{c x^{n+1}}（約分する）
  function recip(c, n) {
    const g = F.gcd(c, n), nn = n / g, cc = c / g;
    return { f: `\\frac{1}{${mono(c, n, 'x')}}`, ans: `-\\frac{${nn}}{${mono(cc, n + 1, 'x')}}` };
  }
  M.add({
    id: '5-11', part: 1, chap: '5-4 例題3', stars: 1,
    title: '分数の係数は、前に出た指数と先に約分（$\\frac{1}{3}x^3$ → $x^2$）',
    mark: '$\\frac{1}{3}x^3$、$\\frac{2}{3}x^3-\\frac{1}{2}x^2$ のように、係数が分数の項。',
    futsu: ['$\\frac{2}{3}\\times3x^2=\\frac{6}{3}x^2$ のように、', '分子をかけ算してから、あとで約分する。'],
    raku: ['$\\frac{1}{3}x^3$ → $\\frac{1}{3}\\times3x^2=x^2$', '（前に出た3と、分母の3を約分）', '$\\frac{2}{3}x^3-\\frac{1}{2}x^2+x$ → $2x^2-x+1$'],
    why: '分数がかかっていても、定数倍のきまりは同じ（5-4 例題3）。分数はそのままにして $x^n$ を微分すると、前に出た指数 $n$ が分数にかかる。分母が $n$ と約分できる形（$\\frac{1}{2}x^2$、$\\frac{1}{3}x^3$、$\\frac{1}{4}x^4$）が多いので、先に約分すると係数がかんたんになる。',
    caution: '微分する前に分数を消さない（$\\frac{1}{3}x^3$ を $x^3$ にすると、別の関数になる）。$\\frac{1}{3x^3}$ は $x$ が分母にあるので、この形ではない。',
    counts: { s1: 8, s2: 5, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '15mm', s2: '26mm', s3: '20mm', trap: '20mm' },
    fits(q) {
      const f = funcOf(q);
      if (!f || !askD(q) || /[()]/.test(f)) return false;
      const fs = fracsOf(f);
      return fs.length > 0 && fs.every(x => /^\d+$/.test(x.den));
    },
    steps: {
      // 1項：分母が指数と約分できる
      s1(r) {
        const n = r.int(2, 6), q = r.pick(Q11[n]), p = r.pick([1, 1, 2, 3, 4, 5, 7]) * (r.chance(0.2) ? -1 : 1);
        if (F.gcd(Math.abs(p), q) !== 1) return null;
        const Pf = term(fr(p, q), n), f = ptex(Pf), ans = ptex(M.P.diff(Pf));
        return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$${stepTeX(Pf)}=${ans}$`, key: f, calc: { kind: 'diff', f } };
      },
      // 項がいくつかある式
      s2(r) {
        const Pf = fpoly(r); if (!Pf) return null;
        const f = ptex(Pf), ans = ptex(M.P.diff(Pf));
        return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$${stepTeX(Pf)}=${ans}$`, key: f, calc: { kind: 'diff', f } };
      },
      // 分子に x がある書き方・微分係数・位置の式・約分しても分数が残る（key：見開きに1つずつ）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [n1, n2] = r.shuffle([2, 3, 4]).slice(0, 2).sort((x, y) => y - x), Pf = PN(0, 0, 0, 0, 0);
          let f = '';
          for (const n of [n1, n2]) {
            const q = r.pick(Q11[n]), p = r.pick([1, 1, 3, 5]), neg = f ? r.chance(0.5) : false;
            if (F.gcd(p, q) !== 1) return null;
            Pf[n] = fr(neg ? -p : p, q);
            f += `${f ? (neg ? '-' : '+') : ''}\\frac{${mono(p, n, 'x')}}{${q}}`;
          }
          const ans = ptex(M.P.diff(Pf));
          return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$${ptex(Pf)}$ と同じ → $${ans}$`, easyCheck: 'last', key: 'k0', calc: { kind: 'diff', f } };
        }
        if (k === 1) {
          const Pf = fpoly(r); if (!Pf) return null;
          const a = r.pick([-2, -1, 1, 2, 3, 4]), f = ptex(Pf), dP = M.P.diff(Pf), val = M.P.at(dP, a);
          if (Math.abs(val[0]) > 99) return null;
          return { q: `$f(x)=${f}$ のとき $f'(${a})=□$`, a: `$${ft(val)}$`, easy: `$f'(x)=${ptex(dP)}$ に $x=${a}$ → $${ft(val)}$`, easyCheck: 'last', key: 'k1',
            verify: p => close(num(p.a), nd(f, 'x', a), 1e-6) || '微分係数がちがう' };
        }
        if (k === 2) {
          const cubic = r.chance(0.4), b = r.int(1, 5), T = r.int(1, 4), Pf = cubic ? PN(0, b, 0, fr(1, 3)) : PN(0, b, fr(r.pick([1, 3, 5]), 2));
          const f = ptex(Pf, 't'), dP = M.P.diff(Pf), v = M.P.at(dP, T);
          return { q: `$x=${f}$（m）で動く物体の、${T}秒の瞬間の速さ $□\\,\\mathrm{m/s}$`, a: `$${ft(v)}$`, easy: `$v=${ptex(dP, 't')}$ に $t=${T}$ → $${ft(v)}$`, easyCheck: 'last', key: 'k2',
            verify: p => close(num(p.a), nd(f, 't', T), 1e-6) || '速さがちがう' };
        }
        const n = r.int(2, 5), q = r.pick([2, 3, 4, 6]), p = r.pick([1, 1, 3, 5]);
        if (F.gcd(p, q) !== 1 || (p * n) % q === 0) return null;
        const Pf = term(fr(p, q), n), f = ptex(Pf), ans = ptex(M.P.diff(Pf));
        return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$${stepTeX(Pf)}=${ans}$`, key: 'k3', boxh: '12mm', calc: { kind: 'diff', f } };
      },
      // わな：x が分母にある（係数が分数なのではない。x^{-n} にしてから。5-12）
      trap(r) {
        const c = r.pick([2, 3, 4, 5]), n = r.int(1, 4), { f, ans } = recip(c, n);
        return dest({ q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, boxh: '12mm', calc: { kind: 'diff', f } },
          '5-11', `$x$ が分母にあるので、$\\frac{1}{${c}}${mono(1, n, 'x')}$ ではない。$\\frac{1}{${c}}x^{-${n}}$ と書きなおしてから`, ['5-12']);
      },
    },
  });

  // ================================================================ 5-12
  // c/x^n（c は 0 でない整数）の TeX
  const cOverX = (c, n) => `${c < 0 ? '-' : ''}\\frac{${Math.abs(c)}}{${mono(1, n, 'x')}}`;
  M.add({
    id: '5-12', part: 1, chap: '5-4 例題5', stars: 1,
    title: '$\\frac{1}{x^n}$ は $x^{-n}$ にしてから微分（1へらすと $-n-1$）',
    mark: '分母に $x^n$ がある式（$\\frac{1}{x}$、$\\frac{1}{x^2}$、$\\frac{3}{x^2}$）。',
    futsu: ['定義にもどって $\\frac{1}{(x+h)^2}-\\frac{1}{x^2}$ を通分し、', '$h$ でわってから、$h$ を0に近づける。'],
    raku: ['$\\frac{1}{x^2}=x^{-2}$ → $-2x^{-3}=-\\frac{2}{x^3}$', '（$-2$ を前に出し、指数は $-2-1=-3$）', '$\\frac{1}{x}=x^{-1}$ → $-x^{-2}=-\\frac{1}{x^2}$'],
    why: '$\\frac{1}{x^n}=x^{-n}$（2-7）と書きなおすと、$(x^n)\'=nx^{n-1}$ のきまりは、マイナスの指数でもそのまま使える（5-4⑤）。指数 $-n$ を前に出し、指数を1へらして $-n-1$ にする。最後に、分数の形にもどす。',
    caution: '「1へらす」は、1をひくこと。$-2-1=-3$ で、$-1$ ではない（$(x^{-2})\'$ を $-2x^{-1}$ としない）。前に出る指数がマイナスなので、答えの符号が変わる。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '26mm', trap: '24mm' }, boxh: '12mm',
    fits(q) {
      const f = funcOf(q);
      if (!f || !askD(q)) return false;
      if (/^[a-z]\^\{-\d+\}$/.test(f)) return true;
      const fs = fracsOf(f);
      return fs.some(x => /^\d*[a-z](?:\^\{\d+\})?$/.test(x.den)) && fs.every(x => /^\d*[a-z]?(?:\^\{\d+\})?$/.test(x.den));
    },
    steps: {
      // 1/x^n と x^{-n}
      s1(r) {
        const n = r.int(3, 9), d = mono(-n, -n - 1, 'x');   // $\\frac{1}{x}$・$\\frac{1}{x^2}$ は楽な形の例（O-2）
        if (r.chance(0.7)) {
          const ans = `-\\frac{${n}}{x^{${n + 1}}}`;
          return { q: `$\\left(\\frac{1}{${mono(1, n, 'x')}}\\right)'=□$`, a: `$${ans}$`, easy: `$x^{-${n}}$ → $${d}=${ans}$`, easyCheck: 'last', key: `n${n}`, calc: { kind: 'diff', f: `\\frac{1}{x^{${n}}}` } };
        }
        return { q: `$(x^{-${n}})'=□$`, a: `$${d}$`, easy: `指数 $-${n}$ を前に出し、指数を $-${n}-1=-${n + 1}$ に → $${d}$`, easyCheck: 'last', key: `n${n}`, calc: { kind: 'diff', f: `x^{-${n}}` } };
      },
      // 係数つき・微分係数・接線の傾き
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const c = r.pick([2, 3, 4, 5, 6, -1, -2, -3]), n = r.int(1, 4), f = cOverX(c, n), ans = cOverX(-c * n, n + 1);
          return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$${mono(c, -n, 'x')}$ → $${mono(-c * n, -n - 1, 'x')}=${ans}$`, easyCheck: 'last', key: `c${c}:${n}`, calc: { kind: 'diff', f } };
        }
        const c = k === 1 ? 1 : r.pick([2, 3, 4, 6, 12]), n = k === 1 ? r.int(1, 3) : 1, a = r.pick([-3, -2, -1, 1, 2, 3]);
        const f = cOverX(c, n), val = fr(-c * n, a ** (n + 1));
        return {
          q: k === 1 ? `$f(x)=${f}$ のとき $f'(${a})=□$` : `$y=${f}$ のグラフの、$x=${a}$ の点での接線の傾き　□`,
          a: `$${F.tex(val)}$`, easy: `$${k === 1 ? 'f\'(x)' : 'y\''}=${cOverX(-c * n, n + 1)}$ に $x=${a}$ → $${F.tex(val)}$`, easyCheck: 'last', key: `v${c}:${n}:${a}`,
          verify: p => close(num(p.a), nd(f, 'x', a), 1e-6) || '微分係数がちがう',
        };
      },
      // 和・分母に数もある・分けてから・逆（key：見開きに1つずつ）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const c1 = r.pick([1, 1, 2, 3]), k1 = r.int(1, 2), c2 = r.pick([1, 2, 3, 4]), n = r.int(1, 2), neg = r.chance(0.4);
          const f = `${mono(c1, k1, 'x')}${neg ? '-' : '+'}${cOverX(c2, n)}`, ans = `${mono(c1 * k1, k1 - 1, 'x')}${neg ? '+' : '-'}${cOverX(c2 * n, n + 1)}`;
          return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `1項ずつ。$${cOverX(c2, n)}=${mono(c2, -n, 'x')}$ → $${ans}$`, easyCheck: 'last', key: 'k0', calc: { kind: 'diff', f } };
        }
        if (k === 1) {
          const c = r.pick([2, 3, 4, 5]), n = r.int(1, 4), { f, ans } = recip(c, n);
          return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$\\frac{1}{${c}}x^{-${n}}$ → $\\frac{1}{${c}}\\times(-${n})x^{-${n + 1}}=${ans}$`, easyCheck: 'last', key: 'k1', calc: { kind: 'diff', f } };
        }
        if (k === 2) {
          const a = r.pick(NZ(4)), f = `\\frac{x${sgn(a)}}{x^{2}}`, ans = `-\\frac{1}{x^{2}}${a > 0 ? '-' : '+'}\\frac{${2 * Math.abs(a)}}{x^{3}}`;
          return { q: `$\\left(${f}\\right)'=□$`, a: `$${ans}$`, easy: `$\\frac{1}{x}${a > 0 ? '+' : '-'}\\frac{${Math.abs(a)}}{x^{2}}$ に分けてから → $${ans}$`, easyCheck: 'last', key: 'k2', boxw: '34mm', calc: { kind: 'diff', f } };
        }
        const n = r.int(2, 7), g = `-\\frac{${n}}{x^{${n + 1}}}`;
        return {
          q: `微分すると $${g}$ になるのは、$\\frac{1}{x^{n}}$ の $n=□$ のとき`, a: `$${n}$`, easy: `$x^{-n}$ → $-nx^{-n-1}$ なので、前に出た数から $n=${n}$`, easyCheck: false, key: 'k3', boxw: '15mm',
          verify: p => [0.6, 1.4].every(x => close(nd(`\\frac{1}{x^{${num(p.a)}}}`, 'x', x), ev(g, 'x', x), 1e-6)) || '微分しても、もとの式にならない',
        };
      },
      // わな：分母が x^n の形でない（x^{-n} と書けない。5-22）
      trap(r) {
        const a = r.pick([1, 1, 2]), b = r.pick([-3, -2, -1, 1, 2, 3, 4, 5]), inner = `${cx(a, 'x')}${sgn(b)}`, f = `\\frac{1}{${inner}}`;
        if (F.gcd(a, Math.abs(b)) !== 1) return null;
        return dest({ q: `$\\left(${f}\\right)'=□$`, a: `$-\\frac{${a}}{(${inner})^{2}}$`, calc: { kind: 'diff', f } },
          '5-12', `分母が $x^n$ の形でないので、$x^{-n}$ と書けない（$-\\frac{1}{x^{2}}$ としない）。分母を1つのかたまりと見て`, ['5-22']);
      },
    },
  });

  // ================================================================ 5-13
  const br = (a, b) => `(${cx(a, 'x')}${sgn(b)})`;                     // (ax+b)
  M.add({
    id: '5-13', part: 1, chap: '5-4 例題7', stars: 1,
    title: 'かっこのかけ算・2乗は、展開してから微分',
    mark: '$(x+2)(x-3)$、$(2x+1)^2$ のように、かっこのままの式。',
    futsu: ['$f(x+h)-f(x)$ を、かっこのまま計算して', '$h$ でわり、$h$ を0に近づける。'],
    raku: ['$(x+2)(x-3)=x^2-x-6$ → $2x-1$', '$(2x+1)^2=4x^2+4x+1$ → $8x+4$'],
    why: 'かっこのままでは、まだ $(x^n)\'=nx^{n-1}$ のきまりが使えない。展開して $x^n$ の和にすれば、1つの項ずつ微分できる（5-4 例題7。展開は3-8）。',
    caution: '微分どうしをかけない（$\\{(x+2)(x-3)\\}\'$ は $1\\times1$ ではない）。$\\{(2x+1)^2\\}\'$ を $2(2x+1)$ としない（かっこの中が $x$ だけのときのきまり）。3乗より大きいかっこも展開すれば微分できるが、項が多くて長い（かっこを1つの文字と見るきまり 5-20 が速い）。',
    counts: { s1: 10, s2: 8, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '26mm', trap: '26mm' },
    fits(q) {
      const f = funcOf(q);
      if (!f || !askD(q) || /\\frac|\\sqrt/.test(f)) return false;
      const inner = [...f.matchAll(/\(([^()]*)\)/g)].map(m => m[1]);
      if (!inner.length || inner.every(t => PURE.test(t))) return false;         // (x^{2})^{3} は 5-09
      return [...f.matchAll(/\)\^\{(\d+)\}/g)].every(m => +m[1] <= 3);           // 4乗から上は、展開が長い（わな）
    },
    steps: {
      // (x+a)(x+b)
      s1(r) {
        const a = r.pick(NZ(6)), b = r.pick(NZ(6));
        if (a === b) return null;
        const f = br(1, a) + br(1, b), Pf = M.P.mul(PN(a, 1), PN(b, 1)), ans = ptex(M.P.diff(Pf));
        if (a + b === -1 && a * b === -6) return null;   // 楽な形の例（$(x+2)(x-3)$。O-2）
        return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, easy: `$${ptex(Pf)}$ → $${ans}$`, easyCheck: 'last', key: [a, b].sort((x, y) => x - y).join(','), calc: { kind: 'diff', f } };
      },
      // (ax+b)^2・(b-ax)^2
      s2(r) {
        const a = r.pick([1, 1, 2, 2, 3, 4, 5]), b = r.pick(NZ(5)), rev = b > 0 && r.chance(0.2);
        if (F.gcd(a, Math.abs(b)) !== 1 || (a === 2 && b === 1 && !rev)) return null;   // $(2x+1)^2$ は楽な形の例（O-2）
        const f = `${rev ? `(${b}-${cx(a, 'x')})` : br(a, b)}^{2}`, Pf = M.P.pow(PN(b, rev ? -a : a), 2), ans = ptex(M.P.diff(Pf));
        return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, easy: `$${ptex(Pf)}$ → $${ans}$`, easyCheck: 'last', key: `s${rev ? -a : a},${b}`, calc: { kind: 'diff', f } };
      },
      // 係数のあるかっこ・x^n とかっこ・中が2次のかっこ・微分係数（key：見開きに1つずつ）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const a = r.pick([2, 3]), b = r.pick(NZ(3)), c = r.pick([1, 1, 2, 3]), d = r.pick(NZ(4));
          if (F.gcd(a, Math.abs(b)) !== 1 || F.gcd(c, Math.abs(d)) !== 1 || a * d === b * c) return null;
          const f = br(a, b) + br(c, d), Pf = M.P.mul(PN(b, a), PN(d, c)), ans = ptex(M.P.diff(Pf));
          return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, easy: `$${ptex(Pf)}$ → $${ans}$`, easyCheck: 'last', key: 'k0', calc: { kind: 'diff', f } };
        }
        if (k === 1) {
          const b = r.pick(NZ(4)), sq = r.chance(0.4), c = sq ? 1 : r.pick([1, 1, 2, 3]), n = sq ? 1 : r.int(1, 2);
          const f = `${mono(c, n, 'x')}${br(1, b)}${sq ? '^{2}' : ''}`, Pf = M.P.mul(term(fr(c), n), M.P.pow(PN(b, 1), sq ? 2 : 1)), ans = ptex(M.P.diff(Pf));
          return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, easy: `$${ptex(Pf)}$ → $${ans}$`, easyCheck: 'last', key: 'k1', calc: { kind: 'diff', f } };
        }
        if (k === 2) {
          const a = r.pick(NZ(3)), f = `(x^{2}${sgn(a)})^{2}`, Pf = M.P.pow(PN(a, 0, 1), 2), ans = ptex(M.P.diff(Pf));
          return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, easy: `$${ptex(Pf)}$ → $${ans}$`, easyCheck: 'last', key: 'k2', calc: { kind: 'diff', f } };
        }
        const a = r.pick(NZ(5)), b = r.pick(NZ(5)), x0 = r.pick([-2, -1, 1, 2, 3]);
        if (a === b || (a + b === -1 && a * b === -6)) return null;   // $(x+2)(x-3)$ は楽な形の例
        const f = br(1, a) + br(1, b), Pf = M.P.mul(PN(a, 1), PN(b, 1)), dP = M.P.diff(Pf), val = M.P.at(dP, x0)[0];
        return { q: `$f(x)=${f}$ のとき $f'(${x0})=□$`, a: `$${val}$`, easy: `$f(x)=${ptex(Pf)}$、$f'(x)=${ptex(dP)}$ に $x=${x0}$ → $${val}$`, easyCheck: 'last', key: 'k3', boxw: '15mm',
          verify: p => close(num(p.a), nd(f, 'x', x0), 1e-6) || '微分係数がちがう' };
      },
      // わな：かっこが分母にある（展開しても多項式にならないので、1項ずつ微分できない。5-22）
      // （4乗から上のかっこは、長いが展開すれば解けるので、わなにしない。caution に書いた。O-5・R1-9）
      trap(r) {
        if (r.chance(0.5)) {
          const a = r.int(1, 4), b = r.int(a + 1, 6), D2 = ptex(PN(a * b, a + b, 1)), f = `\\frac{1}{${br(1, a)}${br(1, b)}}`;
          return dest({ q: `$\\left(${f}\\right)'=□$`, a: `$-\\frac{${ptex(PN(a + b, 2))}}{(${D2})^{2}}$`, key: `trapA${a}${b}`, calc: { kind: 'diff', f } },
            '5-13', `かっこが分母にある。展開しても $\\frac{1}{${D2}}$ で、多項式にならない。分母を中身と見て、$\\frac{1}{u}$ の微分（中身の微分 $${ptex(PN(a + b, 2))}$ をかける）`, ['5-22']);
        }
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, 5]);
        if (F.gcd(a, b) !== 1 || (a === 2 && b === 1)) return null;   // $(2x+1)$ は楽な形の例のかっこ
        const f = `\\frac{1}{${br(a, b)}^{2}}`;
        return dest({ q: `$\\left(${f}\\right)'=□$`, a: `$-\\frac{${2 * a}}{${br(a, b)}^{3}}$`, key: `trapB${a}${b}`, calc: { kind: 'diff', f } },
          '5-13', `かっこが分母にあるので、展開しても1項ずつ微分できない。$${br(a, b)}^{-2}$ と見て、$-2${br(a, b)}^{-3}\\times${a}$`, ['5-22']);
      },
    },
  });

  // ================================================================ 5-14
  const dd = (Y, X) => `\\frac{\\dd ${Y}}{\\dd ${X}}`;
  // π と文字1つ：[場面, 関数の名前, 式, 答え, 楽な形]
  const S14 = [
    ['半径 $r$ の円の面積', 'S', '\\pi r^{2}', '2\\pi r', '$\\pi\\times2r=2\\pi r$（円周の長さ）'],
    ['半径 $r$ の球の体積', 'V', '\\frac{4}{3}\\pi r^{3}', '4\\pi r^{2}', '$\\frac{4}{3}\\pi\\times3r^{2}=4\\pi r^{2}$（球の表面積）'],
    ['半径 $r$ の球の表面積', 'S', '4\\pi r^{2}', '8\\pi r', '$4\\pi\\times2r=8\\pi r$'],
    ['半径 $r$ の円の円周', 'L', '2\\pi r', '2\\pi', '$2\\pi\\times1=2\\pi$'],
    ['半径 $r$ の半円の面積', 'S', '\\frac{1}{2}\\pi r^{2}', '\\pi r', '$\\frac{1}{2}\\pi\\times2r=\\pi r$'],
    ['半径 $r$ の半球の体積', 'V', '\\frac{2}{3}\\pi r^{3}', '2\\pi r^{2}', '$\\frac{2}{3}\\pi\\times3r^{2}=2\\pi r^{2}$'],
  ];
  // 文字が2つより多い：[場面, 名前, 式, 微分する文字, 定数の文字, 答え]
  const T14 = [
    ['円柱の体積', 'V', '\\pi r^{2}h', 'r', '$h$', '2\\pi rh'],
    ['円柱の体積', 'V', '\\pi r^{2}h', 'h', '$r$', '\\pi r^{2}'],
    ['円すいの体積', 'V', '\\frac{1}{3}\\pi r^{2}h', 'r', '$h$', '\\frac{2}{3}\\pi rh'],
    ['円すいの体積', 'V', '\\frac{1}{3}\\pi r^{2}h', 'h', '$r$', '\\frac{1}{3}\\pi r^{2}'],
    ['', 'y', 'ax^{2}+bx+c', 'x', '$a$、$b$、$c$', '2ax+b'],
    ['', 'y', 'ax^{3}+bx', 'x', '$a$、$b$', '3ax^{2}+b'],
    ['', 'y', 'ax+b', 'x', '$a$、$b$', 'a'],
    ['', 'y', 'ax^{4}', 'x', '$a$', '4ax^{3}'],
    ['', 'y', 'a^{2}x^{2}', 'x', '$a$', '2a^{2}x'],
    ['', 'y', 'a^{2}x+a', 'x', '$a$', 'a^{2}'],
    ['長方形の面積', 'S', 'ab', 'a', '$b$', 'b'],
    ['三角形の面積', 'S', '\\frac{1}{2}ah', 'h', '$a$', '\\frac{1}{2}a'],
  ];
  // 物理の式：[場面, 名前, 式, 微分する文字, 定数の文字, 答え, 答えの名前（v=□ か \frac{\dd …}{\dd …}=□）, 意味]
  const U14 = [
    ['落下の距離', 'x', '\\frac{1}{2}gt^{2}', 't', '$g$', 'gt', 'v', '速度'],
    ['投げ上げの高さ', 'x', 'v_{0}t-\\frac{1}{2}gt^{2}', 't', '$v_{0}$、$g$', 'v_{0}-gt', 'v', '速度'],
    ['加速度 $a$ が一定の運動の位置', 'x', '\\frac{1}{2}at^{2}', 't', '$a$', 'at', 'v', '速度'],
    ['ばねを $x$ だけのばす仕事', 'W', '\\frac{1}{2}kx^{2}', 'x', '$k$', 'kx', null, 'ばねの力の大きさ'],
    ['抵抗 $R$ の電力', 'P', 'RI^{2}', 'I', '$R$', '2RI', null, ''],
  ];
  M.add({
    id: '5-14', part: 1, chap: '5-4 例題11', stars: 1,
    title: '文字の定数はそのまま：$\\pi r^2$ → $2\\pi r$（円周）、$\\frac{4}{3}\\pi r^3$ → $4\\pi r^2$（表面積）',
    mark: '$\\pi$・$g$・$a$ など、文字で書いた定数をふくむ式を、ある文字で微分する。',
    futsu: ['$\\pi$ を 3.14 に直して $3.14r^2$ を微分し、', '$6.28r$ と小数で答える（文字の定数が多いと、できない）。'],
    raku: ['$S=\\pi r^2$ を $r$ で微分 → $\\pi\\times2r=2\\pi r$', '$x=\\frac{1}{2}gt^2$ を $t$ で微分 → $\\frac{1}{2}g\\times2t=gt$'],
    why: '$\\pi$ は 3.14159… という決まった数。$g$ や $a$ も、微分する文字（$r$ や $t$）が変わっても変わらない数なら、定数。文字で書いてあっても、定数倍のきまりで、そのままにしておけばよい（5-4 例題11）。円の面積を半径で微分すると円周、球の体積を半径で微分すると表面積になる。',
    caution: 'どの文字で微分するかを先に見る（「$r$ で微分」なら、$r$ のほかの文字は数と同じ）。$\\pi$ は文字に見えても数。$\\pi^2$ を微分して $2\\pi$ としない（定数なので0）。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '18mm' },
    fits(q) {
      if (!/微分|\\dd/.test(q) || NOTD.test(q) || /\$[a-z]=\d*t(?:[+-]\d+)?\$/.test(q)) return false;   // 時間で変わる（わな）は 5-23
      return maths(q).some(t => {
        const m = /^([A-Za-z])=(.+)$/.exec(t);
        if (!m || /□/.test(m[2])) return false;
        const vs = M.mathVars(m[2].replace(/v_\{0\}/g, 'u'), { econst: true });
        return /\\pi/.test(m[2]) ? vs.length >= 1 : vs.length >= 2;
      });
    },
    steps: {
      // π と文字1つ
      s1(r) {
        const k = r.int(1, 9);   // S14[0]（円の面積 $\\pi r^2$）は楽な形の例なので出さない（O-2）
        let lead, Y, f, ans, easy, X = 'r';
        if (k < 6) [lead, Y, f, ans, easy] = S14[k];
        else if (k < 7) {
          const h = r.pick([2, 3, 5, 6, 10]);
          lead = `高さ ${h} の円柱の体積`; Y = 'V'; f = `${h}\\pi r^{2}`; ans = `${2 * h}\\pi r`; easy = `$${h}\\pi\\times2r=${ans}$`;
        } else {
          const n = r.int(3, 5), c = r.pick([1, 1, 2, 3]);
          lead = ''; Y = 'y'; X = 'x'; f = `${c === 1 ? '' : c}\\pi x^{${n}}`; ans = `${c * n}\\pi x^{${n - 1}}`; easy = `$${c === 1 ? '' : c}\\pi\\times${n}x^{${n - 1}}=${ans}$`;
        }
        return { q: `${lead} $${Y}=${f}$ を、$${X}$ で微分すると $${dd(Y, X)}=□$`.trim(), a: `$${ans}$`, easy, key: f, calc: { kind: 'diff', f, x: X } };
      },
      // どの文字で微分するか（ほかの文字は定数）
      s2(r) {
        const [lead, Y, f, X, cs, ans] = r.pick(T14);
        return {
          q: `${lead} $${Y}=${f}$ を $${X}$ で微分（${cs} は定数）　$${dd(Y, X)}=□$`.trim(), a: `$${ans}$`, easy: `$${X}$ のほかの文字は数と同じ → $${ans}$`, easyCheck: 'last', key: `${f}:${X}`,
          boxh: /\\frac/.test(ans) ? '12mm' : null, verify: p => diffOK(p.a, f, X),
        };
      },
      // 物理の式・ある半径での値
      s3(r) {
        if (r.chance(0.6)) {
          const [lead, Y, f, X, cs, ans, name, mean] = r.pick(U14.slice(1));   // U14[0]（落下 $\\frac{1}{2}gt^2$）は楽な形の例（O-2）
          return {
            q: `${lead} $${Y}=${f}$ を $${X}$ で微分（${cs} は定数）　${name ? `${mean} $${name}=□$` : `$${dd(Y, X)}=□$`}`, a: `$${ans}$`,
            easy: `$${X}$ のほかの文字は数と同じ → $${ans}$${!name && mean ? `（${mean}）` : ''}`, easyCheck: 'last', key: `${f}:${X}`, verify: p => diffOK(p.a, f, X),
          };
        }
        // ある半径での値（$\\pi r^2$ は楽な形の例なのでよける。key は s1 と同じ形：同じ式を見開きに2回出さない。O-2）
        const [lead, Y, f, , ] = r.pick([S14[1], S14[2], S14[4], S14[5]]), a = r.int(2, 6), dv = { '\\frac{4}{3}\\pi r^{3}': 4 * a * a, '4\\pi r^{2}': 8 * a, '\\frac{1}{2}\\pi r^{2}': a, '\\frac{2}{3}\\pi r^{3}': 2 * a * a }[f];
        const d = S14.find(s => s[2] === f)[3];
        return {
          q: `${lead} $${Y}=${f}$ で、$r=${a}$ のときの $${dd(Y, 'r')}$ の値　□`, a: `$${dv === 1 ? '' : dv}\\pi$`, easy: `$${dd(Y, 'r')}=${d}$ に $r=${a}$ → $${dv === 1 ? '' : dv}\\pi$`, easyCheck: 'last', key: f,
          verify: p => close(num(p.a), nd(f, 'r', a), 1e-6) || '値がちがう',
        };
      },
      // わな：微分する文字が、時間で変わる（r は定数でも、微分する文字でもない。5-23）
      trap(r) {
        const k = r.int(2, 4);
        if (r.chance(0.6)) {
          const ans = `${2 * k * k}\\pi t`;
          return dest({ q: `半径が $r=${k}t$（$t$ は時間）の円の面積 $S=\\pi r^{2}$。$${dd('S', 't')}=□$`, a: `$${ans}$`, key: 'trapA', verify: p => diffOK(p.a, `\\pi(${k}t)^{2}`, 't') },
            '5-14', `$r$ ではなく $t$ で微分する（$2\\pi r$ のままでは答えにならない）。$${dd('S', 'r')}\\times${dd('r', 't')}=2\\pi r\\times${k}=${ans}$`, ['5-23']);
        }
        const ans = `${4 * k ** 3}\\pi t^{2}`;
        return dest({ q: `半径が $r=${k}t$（$t$ は時間）の球の体積 $V=\\frac{4}{3}\\pi r^{3}$。$${dd('V', 't')}=□$`, a: `$${ans}$`, key: 'trapB', verify: p => diffOK(p.a, `\\frac{4}{3}\\pi(${k}t)^{3}`, 't') },
          '5-14', `$r$ ではなく $t$ で微分する（$4\\pi r^{2}$ のままでは答えにならない）。$${dd('V', 'r')}\\times${dd('r', 't')}=4\\pi r^{2}\\times${k}=${ans}$`, ['5-23']);
      },
    },
  });

  // ================================================================ 5-91
  // タイヤ：まわりの長さ L（m）、T 秒に N 回転。秒速 v = L N / T
  const L91 = ['1.5', '1.6', '1.8', '2', '2.2', '2.4', '2.5'], T91 = ['0.2', '0.25', '0.4', '0.5', '1', '2'];
  function tire(r) {
    const L = r.pick(L91), T = r.pick(T91), N = r.int(2, 12), dist = F.mul(D(L), fr(N)), v = F.div(dist, D(T));
    if (!isDec(dist, 1) || !isDec(v, 1) || F.val(v) < 8 || F.val(v) > 36) return null;
    if (L === '1.5' && T === '0.25' && N === 4) return null;   // 楽な形の例の数（O-2）
    return { L, T, N, dist, v, head: `まわりの長さ ${un(L, 'm')} のタイヤが、${T}秒に${N}回転した。`, key: `${L},${T},${N}`,
      ok: x => close(x, parseFloat(L) * N / parseFloat(T), 1e-9) };
  }
  M.add({
    id: '5-91', part: 1, chap: '5-1⑤ 例題5', stars: 1,
    title: 'タイヤの回転から速さ：まわりの長さ$\\times$回転数$\\div$時間',
    mark: 'タイヤのまわりの長さ（直径）と、「□秒に□回転」。',
    futsu: ['1回転にかかる時間を先に出して、', 'まわりの長さをその時間でわる（わりきれないことが多い）。'],
    raku: ['まわり $1.5\\,\\mathrm{m}$、0.25秒に4回転', '→ $1.5\\times4=6\\,\\mathrm{m}$、$6\\div0.25=24\\,\\mathrm{m/s}$', '時速は $24\\times3.6=86.4\\,\\mathrm{km/h}$'],
    why: 'タイヤが1回転すると、車はタイヤのまわりの長さだけ進む（5-1⑤）。だから、進んだ距離は「まわりの長さ×回転数」。これを時間でわれば、平均の速さになる。車のスピードメーターは、とても短い時間のこの平均を表示している。',
    caution: '回転数を時間でわるだけでは、速さにならない（まわりの長さをかける）。直径が書いてあるときは、まわりの長さ＝直径$\\times\\pi$ を先に出す。時速にするのは最後（$\\times3.6$）。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: '15mm',
    fits(q) { return /\d\$?\s*回転|1秒に □ 回転/.test(q) && /まわりの長さ|直径/.test(q) && /秒速|時速|m\/s|km\/h/.test(q); },
    steps: {
      // 秒速
      s1(r) {
        const t = tire(r); if (!t) return null;
        return { q: `${t.head}秒速 $□\\,\\mathrm{m}$`, a: `$${ft(t.v)}$`, easy: `$${t.L}\\times${t.N}=${ft(t.dist)}$、$${ft(t.dist)}\\div${t.T}=${ft(t.v)}$`, easyCheck: 'last', key: t.key,
          verify: p => t.ok(num(p.a)) || '秒速がちがう' };
      },
      // 時速（最後に ×3.6）
      s2(r) {
        const t = tire(r); if (!t) return null;
        const A = F.mul(t.v, D('3.6'));
        if (!isDec(A, 1)) return null;
        return { q: `${t.head}時速 $□\\,\\mathrm{km}$`, a: `$${ft(A)}$`, easy: `$${t.L}\\times${t.N}\\div${t.T}=${ft(t.v)}$、$${ft(t.v)}\\times3.6=${ft(A)}$`, easyCheck: 'last', key: t.key,
          verify: p => t.ok(num(p.a) * 1000 / 3600) || '時速がちがう' };
      },
      // 直径から・1分あたりの回転数・速さから回転数（逆）。key：見開きに1つずつ
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const d = r.pick(['0.5', '0.6', '0.7', '0.8']), T = r.pick(['0.5', '1', '2']), N = r.int(2, 10), c = F.div(F.mul(D(d), fr(N)), D(T));
          if (!isDec(c, 1) || F.val(c) > 12) return null;
          const ans = `${c[0] === c[1] ? '' : ft(c)}\\pi`;
          return { q: `直径 ${un(d, 'm')} のタイヤが、${T}秒に${N}回転した。秒速 $□\\,\\mathrm{m}$（$\\pi$ のまま）`, a: `$${ans}$`, easy: `まわりの長さ $${d}\\pi\\,\\mathrm{m}$ → $${d}\\pi\\times${N}\\div${T}=${ans}$`, easyCheck: 'last', key: 'k0',
            verify: p => close(num(p.a), Math.PI * parseFloat(d) * N / parseFloat(T), 1e-9) || '秒速がちがう' };
        }
        if (k === 1) {
          const L = r.pick(L91), N = r.pick([300, 400, 500, 600, 750, 900, 1000, 1200]), v = F.div(F.mul(D(L), fr(N)), fr(60));
          if (!isDec(v, 1) || F.val(v) > 45) return null;
          return { q: `まわりの長さ ${un(L, 'm')} のタイヤが毎分 $${N}$ 回転。秒速 $□\\,\\mathrm{m}$`, a: `$${ft(v)}$`, easy: `$${L}\\times${N}=${ft(F.mul(D(L), fr(N)))}$、1分は60秒なので $${ft(F.mul(D(L), fr(N)))}\\div60=${ft(v)}$`, easyCheck: 'last', key: 'k1',
            verify: p => close(num(p.a) * 60, parseFloat(L) * N, 1e-9) || '秒速がちがう' };
        }
        const L = r.pick(['1.5', '1.6', '1.8', '2', '2.4', '2.5']);
        if (k === 2) {
          const v = r.pick([12, 15, 18, 20, 24, 25, 30]), n = F.div(fr(v), D(L));
          if (!isDec(n, 1) || (n[1] !== 1 && n[1] !== 2)) return null;
          return { q: `秒速 ${un(v, 'm')} の車。まわりの長さ ${un(L, 'm')} のタイヤは1秒に □ 回転`, a: `$${ft(n)}$`, easy: `1秒に $${v}\\,\\mathrm{m}$ 進む → $${v}\\div${L}=${ft(n)}$`, easyCheck: 'last', key: 'k2',
            verify: p => close(num(p.a) * parseFloat(L), v, 1e-9) || '回転数がちがう' };
        }
        const A = r.pick([36, 54, 72, 90, 108]), v = A / 3.6, n = F.div(fr(v), D(L));
        if (!isDec(n, 1) || (n[1] !== 1 && n[1] !== 2)) return null;
        return { q: `時速 ${un(A, 'km')} の車。まわりの長さ ${un(L, 'm')} のタイヤは1秒に □ 回転`, a: `$${ft(n)}$`, easy: `$${A}\\div3.6=${v}\\,\\mathrm{m/s}$ → $${v}\\div${L}=${ft(n)}$`, easyCheck: 'last', key: 'k3',
          verify: p => close(num(p.a) * parseFloat(L) * 3.6, A, 1e-9) || '回転数がちがう' };
      },
      // わな：進んだ距離がわかっている（回転数はいらない）・速さではなく回転数を聞いている
      trap(r) {
        const L = r.pick(['1.5', '2', '2.5']);
        if (r.chance(0.5)) {
          const T = r.pick([4, 5, 8, 10]), v = r.pick([12, 15, 18, 20, 25]);
          return dest({ q: `まわりの長さ ${un(L, 'm')} のタイヤの車が${T}秒で ${un(v * T, 'm')} 進んだ。秒速 $□\\,\\mathrm{m}$`, a: `$${v}$`, key: 'trapA', verify: p => close(num(p.a) * T, v * T) || '秒速がちがう' },
            '5-91', `進んだ距離がわかっているので、まわりの長さは使わない。$${v * T}\\div${T}=${v}$`);
        }
        const n = r.pick([40, 60, 80, 100, 120, 200]), dist = F.mul(D(L), fr(n));
        return dest({ q: `まわりの長さ ${un(L, 'm')} のタイヤの車が ${un(ft(dist), 'm')} 進んだ。タイヤは □ 回転`, a: `$${n}$`, key: 'trapB', verify: p => close(num(p.a) * parseFloat(L), F.val(dist)) || '回転数がちがう' },
          '5-91', `速さではなく回転数を聞いている（時間はいらない）。$${ft(dist)}\\div${L}=${n}$`);
      },
    },
  });
})(globalThis.MONDAI);

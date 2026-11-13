/* 問題集 第9巻　第3部 フーリエ変換とラプラス変換（わざ 9-31〜9-45・9-93）　組 c
 * 書き方は v8/README.md（第8・9巻の手引き）・v6/README.md・v5/README.md。文は教科書 第9巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 9-4・9-5 の数・ことば・記号にそろえる（フーリエ変換 $F(\omega)$、パルス、「それ以外で $f=0$」、はじめて0になる正の $\omega$、面積、
 *   だんだん消える波、両側の指数、ガウスの形・はば $\sigma$、ずらす・$\cos$ をかける（性質の表）、くり返す波の線、DFT の $X_k$、きざみ $\frac{f_{\mathrm s}}{N}$、
 *   振幅 $\frac{2\lvert X_k\rvert}{N}$、サンプリング周波数 $f_{\mathrm s}$、エイリアシング、$\mathcal L[f(t)]$、定義の積分、辞書（表）を引く、線形、
 *   $sF(s)-f(0)$、$s^2F(s)-sf(0)-f'(0)$、小文字は時間の世界・大文字は $s$ の世界、$s=j\omega$）。角周波数 $\omega$ は rad/s、$t$ は s（教科書 9-4 の例題の約束）。
 * 近似値は目録の一覧の4けた（$\sqrt{2\pi}=2.507$、$e^{-1}=0.3679$ など。W-2）を問題の文に書き、答えは「約」と ≈。文の値で計算した答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4）。
 * 検算：$F(\omega)$・$F(s)$・$X(s)$ の式は calc（kind 'fn'。$j$ があれば複素数）、微分方程式の解は calc（'ode'）、
 *   そのほか（値の組・ことばの答え・近似値・DFT・周波数）は verify(p) で、問題を作った式とは別の道すじ（数値積分・定義の和・点の値の比べ）で確かめる。
 * 図は 9-31（パルスと $F(\omega)$）・9-36（もとのパルスとずらしたパルス）・9-40（とった点と2つの $\cos$）・9-93（スペクトルの線）のステップ3だけ（K-2）。
 *   表（p.table）は 9-38 のステップ3、プログラム（p.code）は 9-39 のステップ3だけ（W-7）。見わけようは図・表を出さないので、ステップ1・2 は文だけ。
 * 左ページの「楽な形」と目印・注意の例の数（と、その入れかえ・符号ちがい・何倍か・同じ答え）は、同じ見開きの問題に出さない（O-2・S-2・U-2）。
 *   key は、ステップがちがっても同じ数の組なら同じになる形にする（同じ見開きに同じ問題を出さない）。
 * 1つのステップに同じ答えを3つ以上出さない（S-4・U-3。add の ansOK）。選ぶ答えは回す。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const fmt = v => { const s = String(+(+v).toFixed(10)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const nearC = (x, y, tol) => x && y && Math.hypot(x[0] - y[0], x[1] - y[1]) <= (tol || 1e-9) * Math.max(1, Math.hypot(...x), Math.hypot(...y));
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 問題ができたときだけ進める回し方（選ぶ答えのかたよりをなくす。S-4・U-3）：peek で今の番を見て、問題を返す前に adv で進める
  const peek = (r, key, n) => { const d = r.turns || (r.turns = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return d[key]; };
  const adv = (r, key, n) => { r.turns[key] = (r.turns[key] + 1) % n; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const evc = (t, vars) => M.evalC(String(t), vars || {});
  const maths = t => (String(t).match(/\$[^$]*\$/g) || []).map(s => s.slice(1, -1));
  const noUnit = t => String(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\\mathrm\{[^}]*\}/g, '');
  // 答えの文の k 番めの式の値（単位をのぞき、「＝」の右、≈ があればその右）
  function numOf(t, k, vars) {
    let s = maths(t)[k || 0]; if (s == null) return null;
    s = noUnit(s); if (s.includes('\\approx')) s = s.slice(s.lastIndexOf('\\approx') + 7);
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    return M.evalMath(s.trim(), vars || {});
  }
  function cnumOf(t, k, vars) {
    let s = maths(t)[k || 0]; if (s == null) return null;
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    return M.evalC(s.trim(), vars || {});
  }
  // 分数の TeX（約分。分母1なら整数）。n・d は整数
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return String(n);
    return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
  }
  // 小数を分数に（分母は 1〜1000 の中で）。[分子, 分母]
  function toFr(x) { for (let d = 1; d <= 1000; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) { const g = gcd(n, d) || 1; return [n / g, d / g]; } } return null; }
  const frX = x => { const f = toFr(x); return frac(f[0], f[1]); };
  // 係数×式（1・−1 は書かない）
  const cf = (c, body) => (c === 0 ? '' : body === '' ? fmt(c) : c === 1 ? body : c === -1 ? '-' + body : fmt(c) + body);
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));
  // 「s+a」「s-a」「s」（v は文字、a は数）
  const vpa = (v, a) => (a === 0 ? v : `${v}${a > 0 ? '+' : '-'}${fmt(Math.abs(a))}`);
  // 「a+j\omega」
  const ajw = a => `${fmt(a)}+j\\omega`;
  // (p/q)π の TeX
  function piT(n, d) {
    const g = gcd(n, d) || 1; n /= g; d /= g;
    const top = `${Math.abs(n) === 1 ? '' : Math.abs(n)}\\pi`;
    return (n < 0 ? '-' : '') + (d === 1 ? top : `\\dfrac{${top}}{${d}}`);
  }
  // (p/q)ω の TeX（\sin の中。\frac{\omega}{2}・0.5 ではなく分数）
  function wT(n, d) {
    const g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return n === 1 ? '\\omega' : `${n}\\omega`;
    return `\\frac{${n === 1 ? '' : n}\\omega}{${d}}`;
  }
  // e の肩 -(n/d)ω²（e^{-\omega^2/8}・e^{-2\omega^2}・e^{-9\omega^2/2}）
  function gExp(n, d) { const g = gcd(n, d) || 1; n /= g; d /= g; return `-${n === 1 ? '' : n}\\omega^2${d === 1 ? '' : '/' + d}`; }
  // e^{at} の TeX（a=1 → e^{t}、a=-1 → e^{-t}、a=-0.5 → e^{-0.5t}）
  const eT = (a, v) => `e^{${a === 1 ? '' : a === -1 ? '-' : fmt(a)}${v || 't'}}`;
  const U = (v, u) => `${v}\\,\\mathrm{${u}}`;
  // 図の項目をずらす（2つのグラフを横に並べる）
  function shift(items, dx, dy) {
    const P = p => [p[0] + dx, p[1] + dy];
    return items.map(it => {
      const k = it[0];
      if (k === 'seg') return ['seg', P(it[1]), P(it[2]), it[3]];
      if (k === 'path' || k === 'poly') return [k, it[1].map(P), it[2]];
      if (k === 'dot') return ['dot', P(it[1]), it[2]];
      if (k === 'label') return ['label', P(it[1]), it[2], it[3]];
      if (k === 'circle') return ['circle', P(it[1]), it[2], it[3]];
      return it;
    });
  }
  // 自分でかく座標軸（axes は原点にしか置けないので、右に並べるグラフ用）
  function axesAt(G, o, xname, yname) {
    const A = G.T(o.x0, 0), B = G.T(o.x1, 0), C = G.T(0, o.y0), D = G.T(0, o.y1);
    return [['seg', [A[0], A[1]], [B[0] + 0.6, B[1]], { arrow: true }], ['label', [B[0] + 0.6, B[1]], xname, 'se'],
      ['seg', [C[0], C[1]], [D[0], D[1] + 0.6], { arrow: true }], ['label', [D[0], D[1] + 0.6], yname, 'e']];
  }

  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない（S-4・U-3）。アプリで同じわざを多く出すとき（そのわざで20問をこえたら）は、よけない
  //   key（問題の key）を渡すと、同じ問題（makeStep が同じ key でよける問題）は数えない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  // 同じ見開きの1つのステップで、同じ答えを1回だけにする（答えの種類が少ないステップ用）。アプリで多く出すとき（20問をこえたら）はよけない
  const onceA = (r, key, a) => { const d = r.onceA || (r.onceA = {}), u = d[key] || (d[key] = new Set()); if (u.has(a) && u.size < 20) return false; u.add(a); return true; };
  // わざの登録：1つのステップに同じ答えを3つ出さない（U-3）
  function add(def) {
    for (const k of ['s1', 's2', 's3']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => { const p = f(r); if (!p) return p; return ansOK(r, def.id + k, String(p.a), 2, p.key || p.q) ? p : null; };
    }
    M.add(def);
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く（S-7）。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(9).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 3 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 検算の道具（問題を作った式とは別の道すじ）
  // フーリエ変換の数値積分：∫_{a}^{b} f(t) e^{-jωt} dt（シンプソン）。f は t の関数
  function ftNum(f, a, b, w, n) {
    n = n || 4000; const h = (b - a) / n; let re = 0, im = 0;
    for (let k = 0; k <= n; k++) { const t = a + k * h, c = k === 0 || k === n ? 1 : k % 2 ? 4 : 2, v = f(t); re += c * v * Math.cos(w * t); im -= c * v * Math.sin(w * t); }
    return [re * h / 3, im * h / 3];
  }
  // ラプラス変換の数値積分：∫_0^T f(t) e^{-st} dt（s は実数）
  function ltNum(f, s, T, n) {
    T = T || 60; n = n || 6000; const h = T / n; let v = 0;
    for (let k = 0; k <= n; k++) { const t = k * h, c = k === 0 || k === n ? 1 : k % 2 ? 4 : 2; v += c * f(t) * Math.exp(-s * t); }
    return v * h / 3;
  }

  const FW = '$F(\\omega)$';
  const OTHER0 = (lo, hi) => `$${lo}<t<${hi}$`;

  // ================================================================ 9-31 パルス（場合 A）
  // -a<t<a で h のパルス：F(ω) = 2h sin(aω)/ω、F(0) = 2ah、はじめて0は ω = π/a
  const A31 = [0.5, 1, 1.5, 2.5, 3, 4, 5];   // 例の a=2（と、その何倍か：どの h でも答えが例の何倍か）はよける（O-2）
  const H31 = [0.5, 1, 1.5, 2, 3, 4, 5, 6];
  const pulseF = (a, h) => { const [an, ad] = toFr(a); return `\\dfrac{${cf(2 * h, '\\sin' + wT(an, ad))}}{\\omega}`; };
  const pulseQ = (a, h, lo, hi) => `${OTHER0(lo != null ? fmt(lo) : '-' + fmt(a), hi != null ? fmt(hi) : fmt(a))} で $f=${fmt(h)}$、それ以外で $f=0$ のパルス`;
  const zeroT = a => { const [an, ad] = toFr(a); return piT(ad, an); };   // π/a
  // 9-31 の図：左にパルス、右に F(ω) のグラフ（A：ω=0 の高さ、B：はじめて0の所。数は書かない）
  function fig31(a, h) {
    const L = a * 1.7, G1 = M.graph({ x0: -L, x1: L, y0: 0, y1: h * 1.35, w: 3.6, h: 3.2 });
    const left = [...G1.axes({ xt: [-a, a], x: 't', y: 'f', o: false, xfmt: v => '$' + fmt(v) + '$' }),
      ['path', [G1.T(-L, 0), G1.T(-a, 0), G1.T(-a, h), G1.T(a, h), G1.T(a, 0), G1.T(L, 0)], { thick: true }], ['label', G1.T(a, h), '$' + fmt(h) + '$', 'ne']];
    const z = Math.PI / a, F0 = 2 * a * h, o = { x0: -3.2 * z, x1: 3.2 * z, y0: -0.35 * F0, y1: 1.2 * F0 };
    const G2 = M.graph({ x0: o.x0, x1: o.x1, y0: o.y0, y1: o.y1, w: 5.4, h: 3.6 });
    const g = w => (Math.abs(w) < 1e-9 ? F0 : 2 * h * Math.sin(a * w) / w);
    const right = [...axesAt(G2, o, '$\\omega$', '$F(\\omega)$'), ...G2.plot(g, o.x0, o.x1, { n: 200, thick: true }),
      ['dot', G2.T(0, F0)], ['label', G2.T(0, F0), '$\\mathrm A$', 'ne'], ['dot', G2.T(z, 0)], ['label', G2.T(z, 0), '$\\mathrm B$', 'sw']];
    return { s: 4.3, items: [...left, ...shift(right, 3.6 / 2 + 1.4 + 5.4 / 2, 0.35 * F0 * G2.sy - 0.0)] };
  }
  const fits31 = q => {
    if (!/パルス/.test(q) || /はばを|ずら|\\cos|倍の速さ/.test(q)) return false;
    if (/図の左のパルス/.test(q)) return true;
    if (/はば \$[\d.]+\$、高さ/.test(q) && /\$F\(0\)\$/.test(q)) return true;
    const m = /\$(-?[\d.]+)<t<([\d.]+)\$ で \$f=/.exec(q); if (!m) return false;
    if (+m[1] === -m[2]) return true;
    return /\$F\(0\)\$/.test(q) && !/\$F\(\\omega\)\$/.test(q);   // ずれたパルスでも、F(0) は面積
  };
  add({
    id: '9-31', part: 3, chap: '9-4④ 例題1', stars: 1,
    title: 'パルスの $F(\\omega)$ は、0でない区間だけの定積分',
    mark: '「$-a<t<a$ で $f=h$、それ以外で $f=0$」のパルス（場合 A）。$F(0)$、はじめて0になる $\\omega$。',
    futsu: ['$-\\infty$〜$\\infty$ を3つの区間に分け、', '外の2つが0になることを確かめてから、', '$\\cos\\omega t$ と $\\sin\\omega t$ に分けて積分する'],
    raku: ['$-2<t<2$ で $0.5$', '→ $\\displaystyle\\int_{-2}^{2}0.5e^{-j\\omega t}\\,\\dd t=\\dfrac{\\sin2\\omega}{\\omega}$', '$F(0)=0.5\\times4=2$、はじめて0は $\\omega=\\dfrac{\\pi}{2}$'],
    why: '$f=0$ の所は、$e^{-j\\omega t}$ をかけてたしても0（9-4④）。だから $-\\infty$〜$\\infty$ は、0でない区間だけのふつうの定積分になる。$e^{-j\\omega t}$ の積分を2つの矢印の差にまとめると $\\dfrac{2h\\sin a\\omega}{\\omega}$。$F(0)$ は $e^{0}=1$ をかけてたすだけなので、グラフの面積（高さ×はば）。',
    caution: '$-\\infty$〜$\\infty$ のまま計算しない（はしが決まらない）。$F(0)$ は式に $\\omega=0$ を入れずに、面積で。はじめて0になるのは $\\sin$ の中が $\\pi$ の所（$\\sin2\\omega$ なら $2\\omega=\\pi$）。',
    counts: { s1: 4, s2: 3, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '22mm', s3: '22mm', trap: '26mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits: fits31,
    steps: {
      s1(r) {
        const a = r.pick(A31), h = r.pick(H31);
        return { q: `${pulseQ(a, h)}の ${FW}`, a: `$${pulseF(a, h)}$`, key: `31:${a}:${h}`, easyCheck: false,
          easy: `$\\displaystyle\\int_{-${fmt(a)}}^{${fmt(a)}}${fmt(h) === '1' ? '' : fmt(h)}e^{-j\\omega t}\\,\\dd t$`,
          calc: { kind: 'fn', want: `2*${h}*sin(${a}*omega)/omega`, vars: ['omega'] },
          verify: p => nearC(cnumOf(p.a, 0, { omega: 0.77 }), ftNum(() => h, -a, a, 0.77), 1e-7) || '定積分の値とちがう' };
      },
      s2(r) {
        const a = r.pick(A31), h = r.pick(H31);
        if (turn(r, '31s2', 2) === 0) {
          const F0 = 2 * a * h, z = zeroT(a);
          if (F0 === 2 && a === 2) return null;
          return { q: `${pulseQ(a, h)}の $F(0)$ ＝ □、${FW} がはじめて0になる正の $\\omega$ ＝ □`, a: `$${fmt(F0)}$、$${z}$`, key: `31:${a}:${h}`, easyCheck: false,
            easy: `面積 $${fmt(h)}\\times${fmt(2 * a)}$、$${fmt(a) === '1' ? '' : fmt(a)}\\omega=\\pi$`,
            verify: p => (near(numOf(p.a, 0), ftNum(() => h, -a, a, 0)[0], 1e-7) && near(numOf(p.a, 1), Math.PI / a) && Math.abs(Math.sin(a * numOf(p.a, 1))) < 1e-9) || '面積かはじめて0の所がちがう' };
        }
        // F(π/(2a)) = 4ah/π（sin の中が π/2）
        const n = 4 * a * h; if (Math.abs(n - Math.round(n)) > 1e-9) return null;
        const [an, ad] = toFr(a), wq = piT(ad, 2 * an);
        return { q: `${pulseQ(a, h)}の $F\\Bigl(${wq}\\Bigr)$`, a: `$\\dfrac{${Math.round(n)}}{\\pi}$`, key: `31:${a}:${h}`, easyCheck: false,
          easy: `$\\sin$ の中が $\\dfrac{\\pi}{2}$ で $\\sin=1$`,
          verify: p => near(numOf(p.a), ftNum(() => h, -a, a, Math.PI / (2 * a))[0], 1e-7) || '値がちがう' };
      },
      // 図：パルスと F(ω) のグラフ。A の高さと B の ω
      s3(r) {
        const a = r.pick([0.5, 1, 1.5, 3]), h = r.pick([1, 2, 3, 4]);
        const F0 = 2 * a * h, z = zeroT(a);
        return { q: '図の左のパルスの $F(\\omega)$ が、右のグラフ。A の高さ ＝ □、B の $\\omega$ ＝ □', a: `$${fmt(F0)}$、$${z}$`, key: `31:${a}:${h}`, easyCheck: false, fig: fig31(a, h),
          easy: `A は $F(0)$＝面積、B ははじめて0の所`,
          verify: p => (near(numOf(p.a, 0), 2 * a * h) && near(numOf(p.a, 1), Math.PI / a)) || '値がちがう' };
      },
      // わな：だんだん消える波（0でない所が有限ではない）→ 9-33
      trap(r) {
        const a = r.pick([1, 3, 4, 5, 6]);
        return dest({ q: `$t\\geqq0$ で $f=${eT(-a)}$、$t<0$ で $f=0$ の波の ${FW}`, a: `$\\dfrac{1}{${ajw(a)}}$`, key: `31t:${a}`,
          calc: { kind: 'fn', want: `1/(${a}+j*omega)`, vars: ['omega'] } }, '9-31',
          '0でない所が有限の区間ではない。$\\displaystyle\\int_0^{\\infty}$ の広義積分で $\\dfrac{1}{a+j\\omega}$', ['9-33']);
      },
    },
  });

  // ================================================================ 9-32 ちぢめる（短いほど広い）
  // f(kt) → (1/k) F(ω/k)。例：-1<t<1 で1 → はば半分（k=2）は 2 sin(ω/2)/ω、はじめて0は 2π（O-2：a=1・k=2 はよける）
  const K32 = [[2, 1], [3, 1], [4, 1], [1, 2], [1, 3], [3, 2]];   // k = 分子/分母（はばは 1/k 倍）
  const kT = ([n, d]) => (d === 1 ? String(n) : `\\frac{${n}}{${d}}`);
  const widthWord = ([n, d]) => (d === 1 ? `はばを $\\dfrac{1}{${n}}$ にした` : n === 1 ? `はばを $${d}$ 倍に広げた` : `はばを $\\dfrac{${d}}{${n}}$ 倍にした`);
  // f(kt) の書き方
  // 楽な形：(1/k) F(ω/k) を、k の値で書く（k=3 → 1/3 F(ω/3)、k=1/2 → 2F(2ω)）
  const scaleEasy = ([n, d]) => {
    const c = d === 1 ? `\\dfrac{1}{${n}}` : n === 1 ? String(d) : `\\dfrac{${d}}{${n}}`;
    const w = n === 1 ? `F(${d}\\omega)` : `F\\Bigl(\\dfrac{${d === 1 ? '' : d}\\omega}{${n}}\\Bigr)`;
    return `$${c}${w}$`;
  };
  const fkt = ([n, d]) => (d === 1 ? `f(${n}t)` : n === 1 ? `f\\Bigl(\\dfrac{t}{${d}}\\Bigr)` : `f\\Bigl(\\dfrac{${n}t}{${d}}\\Bigr)`);
  add({
    id: '9-32', part: 3, chap: '9-4②④⑩', stars: 1,
    title: '時間を $\\dfrac{1}{k}$ にちぢめると、スペクトルは $k$ 倍に広がる',
    mark: '「はばを半分に」「$f(2t)$ の変換」「短いほど広い」。',
    futsu: ['ちぢめたパルス（$-\\frac12<t<\\frac12$）の', '定積分を、はじめから', 'やり直す'],
    raku: ['$-1<t<1$ で1：$\\dfrac{2\\sin\\omega}{\\omega}$、0は $\\pi$', 'はば半分 → $\\dfrac12F\\Bigl(\\dfrac{\\omega}{2}\\Bigr)$', '$=\\dfrac{2\\sin\\frac{\\omega}{2}}{\\omega}$、0は $2\\pi$'],
    why: '性質の表のちぢめる行 $f(kt)\\to\\dfrac1kF\\Bigl(\\dfrac{\\omega}{k}\\Bigr)$（9-4⑩）。時間のはばを $\\dfrac1k$ にすると、$F$ のグラフは横に $k$ 倍に広がり、高さ（$F(0)$＝面積）は $\\dfrac1k$ 倍になる。時間でせまいものは周波数で広い（短いほど広い）。',
    caution: '$\\dfrac1k$ をかけ忘れない（$F(0)$ は面積なので、はばが半分なら半分）。$\\omega$ のところは $k\\omega$ ではなく $\\dfrac{\\omega}{k}$。はじめて0になる $\\omega$ は $k$ 倍（小さくならない）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '30mm', s3: '24mm', trap: '16mm' }, boxh: { s1: '12mm', s2: '12mm' },
    fits(q) { return /はばを|\$f\((\d|\\frac)|f\\Bigl\(|倍の速さで|時間のはば .*倍/.test(q) && !/ずら|\\cos/.test(q); },
    steps: {
      // パルスのはばを変える（高さはそのまま）
      s1(r) {
        const a = r.pick([1, 2, 3, 0.5]), k = r.pick(K32), h = 1;
        if (a === 1 && k[0] === 2 && k[1] === 1) return null;   // 例（O-2）
        const [an, ad] = toFr(a), nn = an * k[1], dd = ad * k[0];   // 新しい a' = a/k
        const a2 = nn / dd; if (Math.abs(a2 * 4 - Math.round(a2 * 4)) > 1e-9) return null;
        if (a2 === 0.5) return null;   // 例と同じ答え（2sin(ω/2)/ω、はじめて0は 2π。O-2）
        const old = `\\dfrac{2\\sin${wT(an, ad)}}{\\omega}`, nw = `\\dfrac{2\\sin${wT(nn, dd)}}{\\omega}`;
        if (!onceA(r, '32a', a)) return null;   // 同じパルスばかりにならないように
        if (turn(r, '32s1', 2) === 0)
          return { q: `${pulseQ(a, h)}の $F(\\omega)=${old}$。${widthWord(k)}パルス（高さはそのまま）の ${FW}`, a: `$${nw}$`, key: `32:${a}:${k}`, easyCheck: false,
            easy: scaleEasy(k),
            calc: { kind: 'fn', want: `2*sin(${a2}*omega)/omega`, vars: ['omega'] },
            verify: p => nearC(cnumOf(p.a, 0, { omega: 0.61 }), ftNum(() => 1, -a2, a2, 0.61), 1e-7) || '積分した値とちがう' };
        return { q: `${pulseQ(a, h)}の ${FW} は、$\\omega=${zeroT(a)}$ ではじめて0になる。${widthWord(k)}パルスでは、はじめて0になる正の $\\omega$`, a: `$${zeroT(a2)}$`, key: `32:${a}:${k}`, easyCheck: false,
          easy: `$${zeroT(a)}$ の $${kT(k)}$ 倍`,
          verify: p => (near(numOf(p.a), Math.PI / a2) && Math.abs(ftNum(() => 1, -a2, a2, numOf(p.a))[0]) < 1e-6) || 'はじめて0の所がちがう' };
      },
      // F(ω) がわかっている f(t) の f(kt)
      s2(r) {
        const kind = turn(r, '32s2', 3), k = r.pick(K32.filter(x => x[0] * x[1] <= 6)), kv = k[0] / k[1];
        let F, want, ans;
        if (kind === 0) {   // e^{-a|t|}：2a/(a²+ω²) → f(kt)=e^{-ak|t|} → 2pq/(p²+q²ω²)（ak = p/q）
          const a = r.pick([1, 2]), [p, q] = toFr(a * kv);
          F = `\\dfrac{${2 * a}}{${a * a}+\\omega^2}`;
          ans = q === 1 ? `\\dfrac{${2 * p}}{${p * p}+\\omega^2}` : `\\dfrac{${2 * p * q}}{${p * p}+${q * q}\\omega^2}`;
          want = `(1/${kv})*2*${a}/(${a * a}+(omega/${kv})^2)`;
        } else if (kind === 1) {   // e^{-t²/2}：√(2π)e^{-ω²/2} → (1/k)√(2π)e^{-ω²/(2k²)}
          F = '\\sqrt{2\\pi}\\,e^{-\\omega^2/2}';
          const lead = k[1] === 1 ? `\\dfrac{\\sqrt{2\\pi}}{${k[0]}}` : k[0] === 1 ? `${k[1]}\\sqrt{2\\pi}` : `\\dfrac{${k[1]}\\sqrt{2\\pi}}{${k[0]}}`;
          ans = `${lead}\\,e^{${gExp(k[1] * k[1], 2 * k[0] * k[0])}}`;
          want = `(1/${kv})*sqrt(2*pi)*exp(-(omega/${kv})^2/2)`;
        } else {   // t≥0 の e^{-t}：1/(1+jω) → 1/(k+jω)
          F = '\\dfrac{1}{1+j\\omega}';
          ans = k[1] === 1 ? `\\dfrac{1}{${k[0]}+j\\omega}` : `\\dfrac{${k[1]}}{${k[0]}+${k[1]}j\\omega}`;
          want = `(1/${kv})/(1+j*omega/${kv})`;
        }
        return { q: `$f(t)$ のフーリエ変換が $${F}$ のとき、$${fkt(k)}$ のフーリエ変換`, a: `$${ans}$`, key: `32b:${kind}:${k}`, easyCheck: false,
          easy: scaleEasy(k),
          calc: { kind: 'fn', want, vars: ['omega'] } };
      },
      // 見かけがちがう：倍の速さで再生、ガウスのはば
      s3(r) {
        const kind = peek(r, '32s3', 2), k = r.pick([2, 3, 4, 5]);
        if (kind === 0) {
          const f0 = r.pick([100, 200, 300, 440, 500]);
          adv(r, '32s3', 2);
          return { q: `録音した音 $f(t)$ を $${k}$ 倍の速さで再生する（$f(${k}t)$）。$\\omega=${f0}$ の所にあったスペクトルの山は、$\\omega$ ＝ □ の所に移る`, a: `$${k * f0}$`, key: `32c:${k}:${f0}`, easyCheck: false,
            easy: `$F\\Bigl(\\dfrac{\\omega}{${k}}\\Bigr)$ の山は $\\dfrac{\\omega}{${k}}=${f0}$ の所`,
            verify: p => near(numOf(p.a), k * f0) || '移った所がちがう' };
        }
        const up = r.chance(0.5);
        adv(r, '32s3', 2);
        return { q: `ガウスの形 $e^{-t^2/(2\\sigma^2)}$ で、時間のはば $\\sigma$ を ${up ? `$${k}$ 倍` : `$\\dfrac{1}{${k}}$ `}にすると、周波数の世界のはばは □ 倍、$F(0)$ は □ 倍`,
          a: up ? `$\\dfrac{1}{${k}}$、$${k}$` : `$${k}$、$\\dfrac{1}{${k}}$`, key: `32d:${k}:${up}`, easyCheck: false,
          easy: 'はばは $\\dfrac{1}{\\sigma}$、$F(0)$ は面積',
          verify: p => (up ? near(numOf(p.a, 0), 1 / k) && near(numOf(p.a, 1), k) : near(numOf(p.a, 0), k) && near(numOf(p.a, 1), 1 / k)) || '倍がちがう' };
      },
      // わな：はばと高さだけ → F(0) は面積（9-31）
      trap(r) {
        const w = r.pick([1, 2, 3, 4, 6, 0.5]), h = r.pick([2, 3, 4, 5]);
        if (w * h === 2 || (w === 2 && h === 3)) return null;
        return dest({ q: `はば $${fmt(w)}$、高さ $${h}$ のパルスの $F(0)$`, a: `$${fmt(w * h)}$`, key: `32t:${w}:${h}`,
          verify: p => near(numOf(p.a), ftNum(() => h, 0, w, 0)[0], 1e-7) || '面積とちがう' }, '9-32',
          'ちぢめる前の形がない。$F(0)$ はグラフの面積（高さ×はば）', ['9-31']);
      },
    },
  });

  // ================================================================ 9-33 t≥0 だけの e^{-at}（場合 B）
  // A e^{-at} → A/(a+jω)、|F| = A/√(a²+ω²)。例 a=2（F(2)=(1-j)/4、|F(2)|=1/(2√2)）はよける（O-2）
  const A33 = [1, 3, 4, 5, 6, 0.5];
  const expQ = (A, a, v) => `$t\\geqq0$ で $${v || 'f'}=${cf(A, eT(-a))}$、$t<0$ で $${v || 'f'}=0$`;
  const PY = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5]];
  add({
    id: '9-33', part: 3, chap: '9-4⑧ 例題2', stars: 1,
    title: '$t\\geqq0$ だけの $e^{-at}$ は $\\dfrac{1}{a+j\\omega}$',
    mark: 'だんだん消える波、「$t\\geqq0$ で $e^{-at}$、$t<0$ で $f=0$」（場合 B）。',
    futsu: ['$\\displaystyle\\int_0^{b}e^{-(a+j\\omega)t}\\,\\dd t$ を計算して、', '$b$ を大きくした先を求め、', '$\\omega$ を入れる'],
    raku: ['$e^{-2t}$（$t\\geqq0$）→ $\\dfrac{1}{2+j\\omega}$', '$F(2)=\\dfrac{1}{2+2j}=\\dfrac{1-j}{4}$', '$\\lvert F(2)\\rvert=\\dfrac{1}{2\\sqrt2}$（$\\lvert F(0)\\rvert$ の $\\dfrac{1}{\\sqrt2}$ 倍）'],
    why: '$t<0$ は0なので0から $\\infty$ まで。肩をまとめると $e^{-(a+j\\omega)t}$ で、その広義積分は $\\dfrac{1}{a+j\\omega}$（9-4⑧）。大きさは $\\dfrac{1}{\\lvert a+j\\omega\\rvert}=\\dfrac{1}{\\sqrt{a^2+\\omega^2}}$ で、$\\omega=a$ のとき $\\lvert F(0)\\rvert=\\dfrac1a$ の $\\dfrac{1}{\\sqrt2}$ 倍。',
    caution: '分母は $a+j\\omega$（$a-j\\omega$ ではない）。$F(\\omega)$ の値は分母の共役を分子と分母にかけて $a+bj$ の形に。大きさは $\\sqrt{a^2+\\omega^2}$ でわる（$a+\\omega$ でわらない）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '24mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { return (/t\\geqq0\$ で \$[fv]=[\d.]*e\^\{-[\d.]*t\}\$、\$t<0\$ で/.test(q) || /\$v=[\d.]*e\^\{-[\d.]*t\}\$.*\$t<0\$ で \$v=0\$/.test(q)) && !/\\mathcal|\\sin|\\cos/.test(q); },
    steps: {
      s1(r) {
        const a = r.pick(A33), A = r.pick([1, 1, 2, 3, 5, 10]);
        return { q: `${expQ(A, a)} の波の ${FW}`, a: `$\\dfrac{${A}}{${ajw(a)}}$`, key: `33:${a}:${A}`, easyCheck: false,
          easy: `$\\displaystyle\\int_0^{\\infty}${A === 1 ? '' : A}e^{-(${ajw(a)})t}\\,\\dd t$`,
          calc: { kind: 'fn', want: `${A}/(${a}+j*omega)`, vars: ['omega'] },
          verify: p => nearC(cnumOf(p.a, 0, { omega: 0.9 }), ftNum(t => A * Math.exp(-a * t), 0, 40 / a, 0.9, 20000), 1e-6) || '積分した値とちがう' };
      },
      // 値：F(a)・ピタゴラスの組の F(ω)・大きさ
      s2(r) {
        const kind = turn(r, '33s2', 3);
        if (kind === 0) {   // F(a) = A(1-j)/(2a)
          const a = r.pick([1, 3, 4, 5, 6]), A = r.pick([1, 2, 3]);
          if (2 * A === a) return null;   // 例と同じ答え (1-j)/4（O-2）
          const g = gcd(A, 2 * a), n = A / g, d = 2 * a / g;
          const ans = d === 1 ? `${n}-${n}j` : `\\dfrac{${n === 1 ? '1-j' : `${n}-${n}j`}}{${d}}`;
          return { q: `${expQ(A, a)} の波の $F(${a})$（$a+bj$ の形で）`, a: `$${ans}$`, key: `33:${a}:${A}`, easyCheck: false,
            easy: `$\\dfrac{${A}}{${a}+${a}j}$ の分子と分母に $${a}-${a}j$ をかける`,
            verify: p => nearC(cnumOf(p.a), [A / (2 * a), -A / (2 * a)]) || '値がちがう' };
        }
        const [a, w] = r.pick(PY), A = r.pick([1, 2, 5]), D = a * a + w * w;
        if (kind === 1) {
          const g = gcd(gcd(A * a, A * w), D), ans = D / g === 1 ? `${A * a / g}-${A * w / g}j` : `\\dfrac{${A * a / g}-${A * w / g}j}{${D / g}}`;
          return { q: `${expQ(A, a)} の波の $F(${w})$（$a+bj$ の形で）`, a: `$${ans}$`, key: `33p:${a}:${w}:${A}`, easyCheck: false,
            easy: `$\\dfrac{${A}}{${a}+${w}j}=\\dfrac{${A === 1 ? '' : A}(${a}-${w}j)}{${D}}$`,
            verify: p => nearC(cnumOf(p.a), [A * a / D, -A * w / D]) || '値がちがう' };
        }
        const mag = A / Math.sqrt(D);
        return { q: `${expQ(A, a)} の波の大きさ $\\lvert F(${w})\\rvert$`, a: `$${frac(A, Math.round(Math.sqrt(D)))}$`, key: `33m:${a}:${w}:${A}`, easyCheck: false,
          easy: `$\\dfrac{${A}}{\\sqrt{${a}^2+${w}^2}}$`,
          verify: p => near(numOf(p.a), mag) || '大きさがちがう' };
      },
      // 見かけがちがう：電圧、1/√2 倍になる ω
      s3(r) {
        const kind = peek(r, '33s3', 2);
        if (kind === 0) {
          const a = r.pick([0.1, 0.2, 0.5, 2.5, 10]), A = r.pick([5, 10, 12, 100]);
          adv(r, '33s3', 2);
          return { q: `時刻0にスイッチを入れたあとの電圧が $v=${A}e^{-${fmt(a)}t}$（V）でへっていく（$t<0$ で $v=0$）。この電圧の ${FW}`, a: `$\\dfrac{${A}}{${ajw(a)}}$`, key: `33:${a}:${A}`, easyCheck: false,
            easy: `$${A}\\times\\dfrac{1}{${ajw(a)}}$`,
            calc: { kind: 'fn', want: `${A}/(${a}+j*omega)`, vars: ['omega'] } };
        }
        const a = r.pick([1, 3, 4, 5, 6, 0.5, 10]), A = r.pick([1, 2, 3]);
        adv(r, '33s3', 2);
        return { q: `${expQ(A, a)} の波で、大きさ $\\lvert F(\\omega)\\rvert$ が $\\lvert F(0)\\rvert$ の $\\dfrac{1}{\\sqrt2}$ 倍になる正の $\\omega$`, a: `$${fmt(a)}$`, key: `33h:${a}:${A}`, easyCheck: false,
          easy: `$\\sqrt{${fmt(a)}^2+\\omega^2}=\\sqrt2\\times${fmt(a)}$`,
          verify: p => near(A / Math.hypot(a, numOf(p.a)), A / a / Math.SQRT2) || '倍がちがう' };
      },
      // わな：両側の e^{-a|t|} → 9-34
      trap(r) {
        const a = r.pick([1, 3, 5, 6]);
        return dest({ q: `$f(t)=e^{-${a === 1 ? '' : a}\\lvert t\\rvert}$ の ${FW}`, a: `$\\dfrac{${2 * a}}{${a * a}+\\omega^2}$`, key: `33t:${a}`,
          calc: { kind: 'fn', want: `${2 * a}/(${a * a}+omega^2)`, vars: ['omega'] } }, '9-33',
          '$t<0$ でも0でない（両側）。$t<0$ と $t>0$ に分けて2回たす', ['9-34']);
      },
    },
  });

  // ================================================================ 9-34 両側の e^{-a|t|}（場合 C）
  // A e^{-a|t|} → 2aA/(a²+ω²)。例 a=4（8/(16+ω²)、F(0)=1/2、F(4)=1/4）はよける（O-2）
  const A34 = [1, 2, 3, 5, 6, 0.5];
  const absT = (A, a) => `${cf(A, `e^{-${a === 1 ? '' : fmt(a)}\\lvert t\\rvert}`)}`;
  const F34 = (A, a) => { const n = 2 * a * A, d = a * a; return Number.isInteger(n) && Number.isInteger(d) ? `\\dfrac{${n}}{${d}+\\omega^2}` : `\\dfrac{${fmt(n)}}{${fmt(d)}+\\omega^2}`; };
  const v34 = (A, a, w) => 2 * a * A / (a * a + w * w);
  add({
    id: '9-34', part: 3, chap: '9-4⑨ 例題3', stars: 1,
    title: '両側の $e^{-a\\lvert t\\rvert}$ は2つに分けて $\\dfrac{2a}{a^2+\\omega^2}$',
    mark: '$e^{-a\\lvert t\\rvert}$（$t=0$ で山になり、左右にへる形。場合 C）。',
    futsu: ['$t<0$ と $t>0$ の2つの広義積分を', 'それぞれ計算して、', '通分してたす'],
    raku: ['$e^{-4\\lvert t\\rvert}$ → $\\dfrac{1}{4+j\\omega}+\\dfrac{1}{4-j\\omega}=\\dfrac{8}{16+\\omega^2}$', '$F(0)=\\dfrac{8}{16}=\\dfrac12$、$F(4)=\\dfrac{8}{32}=\\dfrac14$', '（実数になる）'],
    why: '$t>0$ の部分は $e^{-at}$ で、場合 B の $\\dfrac{1}{a+j\\omega}$。$t<0$ の部分は $e^{at}$ で、$\\dfrac{1}{a-j\\omega}$（9-4⑨）。たすと分子の $j\\omega$ が打ち消しあい、$(a+j\\omega)(a-j\\omega)=a^2+\\omega^2$ で $\\dfrac{2a}{a^2+\\omega^2}$。左右対称（偶関数）なので、答えは実数。',
    caution: '分子は $2a$（$a$ でも2でもない）。分母は $a^2+\\omega^2$ で、$(a+\\omega)^2$ ではない。$F(\\omega)$ は実数なので、$j$ は残らない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '24mm', s3: '16mm', trap: '30mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '9mm' },
    fits(q) { return /e\^\{-[\d.a]*\\lvert t\\rvert\}/.test(q) && !/\\cos/.test(q); },
    steps: {
      s1(r) {
        const a = r.pick(A34), A = r.pick([1, 1, 2, 3, 5]);
        return { q: `$f(t)=${absT(A, a)}$ の ${FW}`, a: `$${F34(A, a)}$`, key: `34:${a}:${A}`, easyCheck: false,
          easy: A === 1 ? `$\\dfrac{1}{${ajw(a)}}+\\dfrac{1}{${fmt(a)}-j\\omega}$` : `$${A}\\Bigl(\\dfrac{1}{${ajw(a)}}+\\dfrac{1}{${fmt(a)}-j\\omega}\\Bigr)$`,
          calc: { kind: 'fn', want: `${A}*(1/(${a}+j*omega)+1/(${a}-j*omega))`, vars: ['omega'] },
          verify: p => near(numOf(p.a, 0, { omega: 0.7 }), ftNum(t => A * Math.exp(-a * Math.abs(t)), -40 / a, 40 / a, 0.7, 40000)[0], 1e-6) || '積分した値とちがう' };
      },
      s2(r) {
        const a = r.pick(A34), A = r.pick([1, 2, 3, 4]);
        if (turn(r, '34s2', 2) === 0) {
          const F0 = 2 * A / a, Fa = A / a;
          if (near(F0, 0.5) && near(Fa, 0.25)) return null;   // 例と同じ答えの組（O-2）
          return { q: `$f(t)=${absT(A, a)}$ の $F(0)$ ＝ □、$F(${fmt(a)})$ ＝ □`, a: `$${frX(F0)}$、$${frX(Fa)}$`, key: `34:${a}:${A}`, easyCheck: false,
            easy: `$${F34(A, a)}$ に入れる`,
            verify: p => (near(numOf(p.a, 0), v34(A, a, 0)) && near(numOf(p.a, 1), v34(A, a, a))) || '値がちがう' };
        }
        const w = r.pick([1, 2, 3, 4, 5].filter(x => x !== a));
        const v = v34(A, a, w), f = toFr(v); if (!f || f[1] > 60) return null;
        return { q: `$f(t)=${absT(A, a)}$ の $F(${w})$`, a: `$${frac(f[0], f[1])}$`, key: `34v:${a}:${A}:${w}`, easyCheck: false,
          easy: `$${F34(A, a)}$ に $\\omega=${w}$`,
          verify: p => near(numOf(p.a), v) || '値がちがう' };
      },
      // 見かけがちがう：半分になる ω、F(ω) から a を読む
      s3(r) {
        if (peek(r, '34s3', 2) === 0) {
          const a = r.pick([1, 2, 3, 5, 6, 0.5, 10]), A = r.pick([1, 2, 3]);
          adv(r, '34s3', 2);
          return { q: `$f(t)=${absT(A, a)}$ の ${FW} が、$F(0)$ の半分になる正の $\\omega$`, a: `$${fmt(a)}$`, key: `34h:${a}:${A}`, easyCheck: false,
            easy: `$${fmt(a * a)}+\\omega^2=2\\times${fmt(a * a)}$`,
            verify: p => near(v34(A, a, numOf(p.a)), v34(A, a, 0) / 2) || '半分にならない' };
        }
        const a = r.pick([1, 2, 3, 5, 6, 10]);
        adv(r, '34s3', 2);
        return { q: `フーリエ変換が $${F34(1, a)}$ になる $f(t)=e^{-a\\lvert t\\rvert}$ の $a$`, a: `$a=${a}$`, key: `34a:${a}`, easyCheck: false,
          easy: `分母の $${a * a}=a^2$、分子の $${2 * a}=2a$`,
          verify: p => near(numOf(p.a), a) || '$a$ がちがう' };
      },
      // わな：ガウスの形 → 9-35
      trap(r) {
        const [c, ans] = r.pick([[2, '\\sqrt{2\\pi}\\,e^{-\\omega^2/2}'], [8, '2\\sqrt{2\\pi}\\,e^{-2\\omega^2}'], [18, '3\\sqrt{2\\pi}\\,e^{-9\\omega^2/2}']]);
        const s = Math.sqrt(c / 2);
        return dest({ q: `$f(t)=e^{-t^2/${c}}$ の ${FW}`, a: `$${ans}$`, key: `34t:${c}`,
          calc: { kind: 'fn', want: `${s}*sqrt(2*pi)*exp(-${s * s}*omega^2/2)`, vars: ['omega'] } }, '9-34',
          '肩が $\\lvert t\\rvert$ ではなく $t^2$（ガウスの形）。$\\sigma$ を読んで $\\sigma\\sqrt{2\\pi}\\,e^{-\\sigma^2\\omega^2/2}$', ['9-35']);
      },
    },
  });

  // ================================================================ 9-35 ガウスの形（場合 D）
  // e^{-t²/(2σ²)} → σ√(2π) e^{-σ²ω²/2}。例 σ=4（e^{-t²/32}）はよける（O-2）
  // [肩の分母 c（e^{-t^2/c}、c=1 は e^{-t^2}、c=0.5 は e^{-2t^2}）, σ², 前の数の TeX（σ√(2π)）, 周波数のはば 1/σ の TeX]
  const G35 = [[2, 1, '\\sqrt{2\\pi}', '1'], [8, 4, '2\\sqrt{2\\pi}', '\\dfrac{1}{2}'], [18, 9, '3\\sqrt{2\\pi}', '\\dfrac{1}{3}'], [50, 25, '5\\sqrt{2\\pi}', '\\dfrac{1}{5}'],
    [0.5, 0.25, '0.5\\sqrt{2\\pi}', '2'], [4, 2, '2\\sqrt{\\pi}', '\\dfrac{1}{\\sqrt2}'], [1, 0.5, '\\sqrt{\\pi}', '\\sqrt2']];
  const gT = c => (c === 1 ? 'e^{-t^2}' : c === 0.5 ? 'e^{-2t^2}' : `e^{-t^2/${c}}`);
  const gF = (g, A) => { const [, s2, lead] = g; const L = A === 1 ? lead : /^\d/.test(lead) ? fmt(A * parseFloat(lead)) + lead.replace(/^[\d.]+/, '') : `${A}${lead}`; const [n, d] = toFr(s2); return `${L}\\,e^{${gExp(n, 2 * d)}}`; };
  const gWant = (g, A) => `${A}*sqrt(${g[1]})*sqrt(2*pi)*exp(-${g[1]}*omega^2/2)`;
  const SQ2PI = 2.507;
  add({
    id: '9-35', part: 3, chap: '9-4⑨ 例題4', stars: 1,
    title: 'ガウスの形は $\\sigma\\sqrt{2\\pi}\\,e^{-\\sigma^2\\omega^2/2}$（$\\sigma$ を読むだけ）',
    mark: '$e^{-t^2/\\square}$（つりがねの形。場合 D）。周波数の世界のはば。',
    futsu: ['肩をまとめて $t$ について平方完成し、', '$t$ によらない部分を外に出して、', 'ガウス積分 $\\sqrt\\pi$ を使う'],
    raku: ['$e^{-t^2/32}$：$32=2\\times4^2$ で $\\sigma=4$', '→ $4\\sqrt{2\\pi}\\,e^{-8\\omega^2}$', '周波数のはばは $\\dfrac14$'],
    why: '$e^{-t^2/(2\\sigma^2)}$ を変換すると $\\sigma\\sqrt{2\\pi}\\,e^{-\\sigma^2\\omega^2/2}$（9-4⑨。$t=\\sigma v$ と置けば $e^{-t^2/2}$ の平方完成の計算にもどる）。右の式は $e^{-\\omega^2/(2\\cdot(1/\\sigma)^2)}$ と書けるので、周波数の世界でもガウスの形で、はばは $\\dfrac{1}{\\sigma}$。$F(0)=\\sigma\\sqrt{2\\pi}$ はグラフの面積。',
    caution: '肩の分母は $2\\sigma^2$（$\\sigma^2$ ではない）。$e^{-t^2}$ は $2\\sigma^2=1$ で $\\sigma=\\dfrac{1}{\\sqrt2}$。前の $\\sigma$ を忘れない。$\\sqrt{2\\pi}$ は残した形で答え、約の値は $\\sqrt{2\\pi}=2.507$ を使う。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '22mm', s3: '24mm', trap: '40mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '12mm' },
    fits(q) { return (/e\^\{-[\d.]*t\^2/.test(q) || /ガウスの形/.test(q) && /\\sigma=|になる、ガウスの形/.test(q)) && !/\\cos|\(t[-+]|倍にすると|\\sigma\$ を/.test(q); },
    steps: {
      s1(r) {
        const g = r.pick(G35), A = r.pick([1, 1, 2, 3]);
        return { q: `$f(t)=${cf(A, gT(g[0]))}$ の ${FW}`, a: `$${gF(g, A)}$`, key: `35:${g[0]}:${A}`, easyCheck: false,
          easy: `$${g[0] === 1 ? '1' : g[0] === 0.5 ? '\\dfrac12' : g[0]}=2\\sigma^2$ で $\\sigma^2=${fmt(g[1])}$`,
          calc: { kind: 'fn', want: gWant(g, A), vars: ['omega'] },
          verify: p => near(numOf(p.a, 0, { omega: 0.8 }), ftNum(t => A * Math.exp(-t * t / g[0]), -12 * Math.sqrt(g[1]), 12 * Math.sqrt(g[1]), 0.8, 20000)[0], 1e-6) || '積分した値とちがう' };
      },
      // F(0) と周波数のはば。約の値（√(2π)=2.507）
      s2(r) {
        if (turn(r, '35s2', 2) === 0) {
          const g = r.pick(G35), A = 1, F0 = Math.sqrt(g[1]) * Math.sqrt(2 * Math.PI);
          const F0T = g[2];
          return { q: `$f(t)=${gT(g[0])}$ の $F(0)$ ＝ □、周波数の世界のはば ＝ □`, a: `$${F0T}$、$${g[3]}$`, key: `35:${g[0]}:${A}`, easyCheck: false,
            easy: `$\\sigma=${g[1] === 2 ? '\\sqrt2' : g[1] === 0.5 ? '\\dfrac{1}{\\sqrt2}' : fmt(Math.sqrt(g[1]))}$、はばは $\\dfrac{1}{\\sigma}$`,
            verify: p => (near(numOf(p.a, 0), F0) && near(numOf(p.a, 1), 1 / Math.sqrt(g[1]))) || '値がちがう' };
        }
        // 約の値：σ が整数か 0.5 のもの。小数第2位まで（文の値とほんとうの値で、丸めがくいちがう組はよける。O-4）
        const g = r.pick(G35.filter(x => Number.isInteger(Math.sqrt(x[1])) || x[1] === 0.25)), A = r.pick([1, 2]), s = Math.sqrt(g[1]);
        const byText = A * s * SQ2PI, truth = A * s * Math.sqrt(2 * Math.PI);
        if (byText.toFixed(2) !== truth.toFixed(2)) return null;
        return { q: `$f(t)=${cf(A, gT(g[0]))}$ の $F(0)$ の約の値（$\\sqrt{2\\pi}=${SQ2PI}$、小数第2位まで）`, a: `約 $${byText.toFixed(2)}$`, key: `35:${g[0]}:${A}`, easyCheck: false,
          easy: `$${fmt(A * s)}\\times${SQ2PI}\\approx${byText.toFixed(2)}$`,
          verify: p => near(numOf(p.a), +truth.toFixed(2)) || '約の値がちがう' };
      },
      // 見かけがちがう：σ を文で言う、F(ω) から f(t) を作る
      s3(r) {
        if (peek(r, '35s3', 2) === 0) {
          const s = r.pick([1, 2, 3, 5, 0.5, 6]), g = [2 * s * s, s * s, (s === 1 ? '' : fmt(s)) + '\\sqrt{2\\pi}'];
          adv(r, '35s3', 2);
          return { q: `時間のはばが $\\sigma=${fmt(s)}$ のガウスの形 $e^{-t^2/(2\\sigma^2)}$ の ${FW}`, a: `$${gF(g, 1)}$`, key: `35:${2 * s * s}:1`, easyCheck: false,
            easy: `$\\sigma\\sqrt{2\\pi}\\,e^{-\\sigma^2\\omega^2/2}$ に $\\sigma=${fmt(s)}$`,
            calc: { kind: 'fn', want: gWant(g, 1), vars: ['omega'] } };
        }
        const g = r.pick(G35.filter(x => x[0] >= 2 && Number.isInteger(Math.sqrt(x[1]))));
        adv(r, '35s3', 2);
        return { q: `フーリエ変換が $${gF(g, 1)}$ になる、ガウスの形の $f(t)$`, a: `$f(t)=${gT(g[0])}$`, key: `35i:${g[0]}`, easyCheck: false,
          easy: `$\\sigma=${fmt(Math.sqrt(g[1]))}$ で $2\\sigma^2=${g[0]}$`,
          verify: p => { const m = maths(p.a)[0].split('=').pop(); return [0.3, 1.1, 2.2].every(t => near(ev(m, { t }), Math.exp(-t * t / g[0]))) || '$f(t)$ がちがう'; } };
      },
      // わな：cos をかけたガウスの形 → 9-37
      trap(r) {
        const wc = r.pick([3, 4, 5, 8]);
        return dest({ q: `$f(t)=e^{-t^2/2}\\cos${wc}t$ の ${FW}`, a: `$\\dfrac{\\sqrt{2\\pi}}{2}\\Bigl(e^{-(\\omega-${wc})^2/2}+e^{-(\\omega+${wc})^2/2}\\Bigr)$`, key: `35t:${wc}`,
          calc: { kind: 'fn', want: `sqrt(2*pi)/2*(exp(-(omega-${wc})^2/2)+exp(-(omega+${wc})^2/2))`, vars: ['omega'] } }, '9-35',
          '$\\cos$ がかかっている。スペクトルを $\\pm' + wc + '$ へ半分ずつ移す（性質の表）', ['9-37']);
      },
    },
  });

  // ================================================================ 9-36 ずらす（場合 E）
  // b<t<c で h：まん中 t0=(b+c)/2、はばの半分 a=(c-b)/2 → e^{-jt0ω}·2h sin(aω)/ω。例 2<t<6（t0=4、a=2）はよける（O-2）
  const ejw = t0 => (t0 === 0 ? '' : `e^{${t0 > 0 ? '-' : ''}j${Math.abs(t0) === 1 ? '' : fmt(Math.abs(t0))}\\omega}`);
  const LR = t0 => (t0 > 0 ? `右へ $${fmt(t0)}$ ` : `左へ $${fmt(-t0)}$ `);
  const shiftF = (t0, a, h) => `${ejw(t0)}${pulseF(a, h)}`;
  function pick36(r) {
    for (let k = 0; k < 50; k++) {
      const w = r.pick([1, 2, 3, 4]), b = r.pick([0, 1, 2, 3, 5, -3, -4]), c = b + w, h = r.pick([1, 1, 2, 3]);
      const t0 = (b + c) / 2, a = w / 2;
      if (t0 === 0 || (b === 2 && c === 6) || (t0 === 4 && a === 2) || c === 0) continue;
      return { b, c, h, t0, a };
    }
    return null;
  }
  // 9-36 の図：点線のもとのパルス（-a<t<a）と、実線のずらしたパルス
  function fig36(P) {
    const { b, c, h, a } = P, lo = Math.min(-a, b) - 1, hi = Math.max(a, c) + 1;
    const G = M.graph({ x0: lo, x1: hi, y0: 0, y1: h * 1.4, w: Math.min(9, (hi - lo) * 0.9), h: 3 });
    const xt = [...new Set([-a, a, b, c])].sort((x, y) => x - y);
    return { s: 5, items: [...G.axes({ xt, x: 't', y: 'f', o: false, xfmt: v => '$' + fmt(v) + '$' }), ['label', G.T(c, h), '$' + fmt(h) + '$', 'ne'],
      ['path', [G.T(-a, 0), G.T(-a, h), G.T(a, h), G.T(a, 0)], { dash: true }],
      ['path', [G.T(lo, 0), G.T(b, 0), G.T(b, h), G.T(c, h), G.T(c, 0), G.T(hi, 0)], { thick: true }]] };
  }
  const piOver = (n, a) => { const [an, ad] = toFr(a); return piT(n * ad, an); };   // nπ/a の TeX
  // 4ah/π × (1, -j, -1, j) の TeX
  const unitPi = (n, u) => { const f = `\\dfrac{${n}}{\\pi}`; return [f, `-${f}j`, `-${f}`, `${f}j`][((u % 4) + 4) % 4]; };
  add({
    id: '9-36', part: 3, chap: '9-4⑩ 例題5', stars: 1,
    title: '$t_0$ ずらすと $e^{-j\\omega t_0}$ がかかる（大きさは同じ）',
    mark: 'まん中が0でないパルス、$f(t-t_0)$（場合 E）。',
    futsu: ['$b$ から $c$ までの定積分 $\\displaystyle\\int_b^ce^{-j\\omega t}\\,\\dd t$ を計算し、', '2つの矢印の差を、まん中の矢印で', 'くくってまとめる'],
    raku: ['$2<t<6$ で1 → まん中4、はば4', '→ $e^{-j4\\omega}\\cdot\\dfrac{2\\sin2\\omega}{\\omega}$', '$\\lvert F\\rvert$ は $-2<t<2$ のパルスと同じ'],
    why: '性質の表のずらす行 $f(t-t_0)\\to e^{-j\\omega t_0}F(\\omega)$（9-4⑩。$u=t-t_0$ の置換積分）。まん中が0のパルスの変換に、まん中の時刻 $t_0$ の矢印 $e^{-j\\omega t_0}$ をかけるだけ。$\\lvert e^{-j\\omega t_0}\\rvert=1$ なので大きさは変わらず、角だけ変わる。',
    caution: 'ずらすのは「まん中」の時刻（$2<t<6$ なら $t_0=4$。はしの2ではない）。肩は $-j\\omega t_0$（右へずらすと負）。左へずらしたパルス（$t_0<0$）は $e^{j\\omega\\lvert t_0\\rvert}$。$F(0)$ は面積のまま。',
    counts: { s1: 4, s2: 3, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '34mm', s3: '34mm', trap: '16mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm' },
    fits(q) {
      if (/図の実線のパルス/.test(q)) return true;
      if (/\\lvert t[-+]|\(t[-+][\d.]+\)\^2/.test(q) && !/\\cos/.test(q)) return true;
      const m = /\$(-?[\d.]+)<t<(-?[\d.]+)\$ で \$f=/.exec(q); if (!m || +m[1] === -m[2] || !/パルス/.test(q) || /はばを/.test(q)) return false;
      return !(/\$F\(0\)\$/.test(q) && !/\$F\(\\omega\)\$/.test(q));
    },
    steps: {
      s1(r) {
        const P = pick36(r); if (!P) return null; const { b, c, h, t0, a } = P;
        return { q: `${pulseQ(a, h, b, c)}の ${FW}`, a: `$${shiftF(t0, a, h)}$`, key: `36:${b}:${c}:${h}`, easyCheck: false,
          easy: `まん中 $t_0=${fmt(t0)}$、$-${fmt(a)}<t<${fmt(a)}$ のパルスに $${ejw(t0)}$`,
          calc: { kind: 'fn', want: `exp(-j*${t0}*omega)*2*${h}*sin(${a}*omega)/omega`, vars: ['omega'] },
          verify: p => nearC(cnumOf(p.a, 0, { omega: 0.83 }), ftNum(() => h, b, c, 0.83), 1e-7) || '積分した値とちがう' };
      },
      s2(r) {
        if (turn(r, '36s2', 2) === 0) {
          // F(π/(2a))：t0/a が整数のときだけ（e^{-jt0π/(2a)} が 1・-j・-1・j）
          const P = pick36(r); if (!P) return null; const { b, c, h, t0, a } = P;
          if (!Number.isInteger(t0 / a)) return null;
          const n = 4 * a * h; if (!Number.isInteger(n)) return null;
          const w = Math.PI / (2 * a), wq = piOver(1, 2 * a).replace('\\dfrac', '\\frac');
          return { q: `${pulseQ(a, h, b, c)}の $F\\Bigl(${wq.replace('\\frac', '\\dfrac')}\\Bigr)$`, a: `$${unitPi(n, t0 / a)}$`, key: `36:${b}:${c}:${h}`, easyCheck: false,
            easy: `まん中 $t_0=${fmt(t0)}$ の矢印は $${['1', '-j', '-1', 'j'][(((t0 / a) % 4) + 4) % 4]}$、大きさ $\\dfrac{${n}}{\\pi}$`,
            verify: p => nearC(cnumOf(p.a), ftNum(() => h, b, c, w), 1e-7) || '値がちがう' };
        }
        // 知っている形をずらす：e^{-a|t-t0|}、e^{-(t-t0)²/2}
        const t0 = r.pick([1, 2, 3, 5, -1, -2]), gauss = r.chance(0.5);
        if (gauss) {
          const sh = t0 > 0 ? `t-${t0}` : `t+${-t0}`;
          return { q: `$f(t)=e^{-(${sh})^2/2}$ の ${FW}`, a: `$${ejw(t0)}\\sqrt{2\\pi}\\,e^{-\\omega^2/2}$`, key: `36g:${t0}`, easyCheck: false,
            easy: `$e^{-t^2/2}$ を${LR(t0)}ずらした形`,
            calc: { kind: 'fn', want: `exp(-j*${t0}*omega)*sqrt(2*pi)*exp(-omega^2/2)`, vars: ['omega'] } };
        }
        const a = r.pick([1, 2, 3]), sh = t0 > 0 ? `t-${t0}` : `t+${-t0}`;
        return { q: `$f(t)=e^{-${a === 1 ? '' : a}\\lvert ${sh}\\rvert}$ の ${FW}`, a: `$${ejw(t0)}${F34(1, a)}$`, key: `36e:${t0}:${a}`, easyCheck: false,
          easy: `$e^{-${a === 1 ? '' : a}\\lvert t\\rvert}$ を${LR(t0)}ずらした形`,
          calc: { kind: 'fn', want: `exp(-j*${t0}*omega)*${2 * a}/(${a * a}+omega^2)`, vars: ['omega'] } };
      },
      // 図：点線のもとのパルスと、実線のずらしたパルス
      s3(r) {
        const P = pick36(r); if (!P) return null; const { b, c, h, t0, a } = P;
        if (Math.max(Math.abs(b), Math.abs(c)) > 6) return null;
        if (b < a + 1 && c > -a - 1) return null;   // 図で、もとのパルスと重ならず、目もりの字がぶつからないもの
        if (!Number.isInteger(a)) return null;
        return { q: '図の実線のパルス（点線のパルスをずらしたもの）の $F(\\omega)$', a: `$${shiftF(t0, a, h)}$`, key: `36:${b}:${c}:${h}`, easyCheck: false, fig: fig36(P),
          easy: `点線のパルスを${LR(t0)}ずらした形`,
          calc: { kind: 'fn', want: `exp(-j*${t0}*omega)*2*${h}*sin(${a}*omega)/omega`, vars: ['omega'] } };
      },
      // わな：ずれたパルスの F(0)（面積）→ 9-31
      trap(r) {
        const b = r.pick([0, 1, 2, 3]), w = r.pick([1, 2, 3, 4]), h = r.pick([2, 3, 4]);
        if (b === 2 && w === 4) return null;
        return dest({ q: `${pulseQ(w / 2, h, b, b + w)}の $F(0)$`, a: `$${fmt(w * h)}$`, key: `36t:${b}:${w}:${h}`,
          verify: p => near(numOf(p.a), w * h) || '面積とちがう' }, '9-36',
          '$F(0)$ はずらしても面積のまま。$e^{-j\\omega t_0}$ は $\\omega=0$ で1', ['9-31']);
      },
    },
  });

  // ================================================================ 9-37 cos をかける（変調。場合 E）
  // f(t)cos ωc t → (F(ω-ωc)+F(ω+ωc))/2。例 e^{-t²/2}cos6t（F(6)≈1.253）はよける（O-2）
  // ガウスの形 [c（e^{-t^2/c}）, σ²]
  const G37 = [[2, 1], [8, 4], [0.5, 0.25]];
  function mod37(g, wc) {
    const [c, s2] = g, s = Math.sqrt(s2), lead = s === 1 ? '\\dfrac{\\sqrt{2\\pi}}{2}' : s === 2 ? '\\sqrt{2\\pi}' : '\\dfrac{\\sqrt{2\\pi}}{4}';
    const [n, d] = toFr(s2), ex = sg => (d === 1 ? `-${n === 1 ? '' : n}(\\omega${sg}${wc})^2` : `-${n === 1 ? '' : n}(\\omega${sg}${wc})^2/${2 * d}`).replace(/\/1$/, '');
    const ex2 = sg => { const g2 = gcd(n, 2 * d), nn = n / g2, dd = 2 * d / g2; return `-${nn === 1 ? '' : nn}(\\omega${sg}${wc})^2${dd === 1 ? '' : '/' + dd}`; };
    void ex;
    return { tex: `${lead}\\Bigl(e^{${ex2('-')}}+e^{${ex2('+')}}\\Bigr)`, want: `${s}*sqrt(2*pi)/2*(exp(-${s2}*(omega-${wc})^2/2)+exp(-${s2}*(omega+${wc})^2/2))`, c };
  }
  const E37 = [[0.5, 0.6065, '0.5'], [1, 0.3679, '1'], [2, 0.1353, '2']];   // e^{-x} の値（目録の4けた）
  add({
    id: '9-37', part: 3, chap: '9-4⑩ 例題6', stars: 1,
    title: '$\\cos\\omega_ct$ をかけると、スペクトルは $\\pm\\omega_c$ へ半分ずつ移る',
    mark: '$f(t)\\cos\\omega_ct$（変調。場合 E）。$f$ の変換がわかっている形。',
    futsu: ['$\\cos\\omega_ct$ を2つの矢印に分け、', '$f\\,e^{\\pm j\\omega_ct}$ の積分を', 'それぞれ平方完成からやり直す'],
    raku: ['$e^{-t^2/2}\\cos6t$', '→ $\\dfrac{\\sqrt{2\\pi}}{2}\\bigl(e^{-(\\omega-6)^2/2}+e^{-(\\omega+6)^2/2}\\bigr)$', '$F(6)\\approx\\dfrac{\\sqrt{2\\pi}}{2}\\approx1.253$（$e^{-72}$ はほぼ0）'],
    why: '$\\cos\\omega_ct=\\dfrac{e^{j\\omega_ct}+e^{-j\\omega_ct}}{2}$ なので、$f\\,e^{j\\omega_ct}$ の変換 $F(\\omega-\\omega_c)$ と、$f\\,e^{-j\\omega_ct}$ の変換 $F(\\omega+\\omega_c)$ の和の半分（9-4⑩）。$F$ のグラフを右と左へ $\\omega_c$ ずらして、半分ずつたしたもの（AM ラジオ）。',
    caution: '半分にするのを忘れない（$\\dfrac12$ がつく）。$\\omega-\\omega_c$ と $\\omega+\\omega_c$ の2つの山（片方だけではない）。$\\omega=\\omega_c$ の所では、もう一方の山（$e^{-2\\omega_c^2}$ など）はほぼ0。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '60mm', s2: '30mm', s3: '56mm', trap: '40mm' }, boxh: { s1: '12mm', s2: '9mm', s3: '12mm', trap: '9mm' },
    fits(q) { return (/\\cos[\d.]*t\$ (の|を)/.test(q) && /e\^\{-/.test(q) || /声の波 .*\\cos/.test(q)) && !/\\mathcal/.test(q); },
    steps: {
      s1(r) {
        const g = r.pick(G37), wc = r.pick([3, 4, 5, 6, 8, 10]);
        if (g[0] === 2 && wc === 6) return null;   // 例（O-2）
        const m = mod37(g, wc);
        return { q: `$f(t)=${gT(g[0])}\\cos${wc}t$ の ${FW}`, a: `$${m.tex}$`, key: `37:${g[0]}:${wc}`, easyCheck: false,
          easy: `$${gT(g[0])}$ の変換を $\\pm${wc}$ へずらして半分ずつ`,
          calc: { kind: 'fn', want: m.want, vars: ['omega'] },
          verify: p => near(numOf(p.a, 0, { omega: wc - 0.3 }), ftNum(t => Math.exp(-t * t / g[0]) * Math.cos(wc * t), -12, 12, wc - 0.3, 40000)[0], 1e-6) || '積分した値とちがう' };
      },
      // 約の値：F(ωc) と F(ωc+d)（√(2π)=2.507 と e^{-x} の4けた。小数第2位まで。くいちがう組はよける：O-4）
      s2(r) {
        const g = r.pick(G37), s = Math.sqrt(g[1]), wc = r.pick([3, 4, 5, 8, 10, 20]);
        if (g[0] === 2 && wc === 6) return null;
        if (g[1] * (2 * wc) ** 2 / 2 < 12) return null;   // もう一方の山（ω=-ωc）が答えのけたに効かない ωc だけ
        const [x, ex, xT] = r.pick(E37), d = Math.sqrt(2 * x / g[1]);   // σ²d²/2 = x
        if (!Number.isInteger(d * 2) || d === 0) return null;
        const peakT = s * SQ2PI / 2, sideT = peakT * ex;
        const peak = s * Math.sqrt(2 * Math.PI) / 2, side = peak * Math.exp(-x);
        if (peakT.toFixed(2) !== peak.toFixed(2) || sideT.toFixed(2) !== side.toFixed(2)) return null;
        const w2 = wc + d, aT = `約 $${peakT.toFixed(2)}$、約 $${sideT.toFixed(2)}$`;
        if (!onceA(r, '37s2', aT)) return null;   // 同じ答えの組は1つのステップに1回（S-4）
        return { q: `$f(t)=${gT(g[0])}\\cos${wc}t$ の約の値（$\\sqrt{2\\pi}=${SQ2PI}$、$e^{-${xT}}=${ex}$、小数第2位まで）：$F(${wc})$ ＝ □、$F(${fmt(w2)})$ ＝ □`,
          a: `約 $${peakT.toFixed(2)}$、約 $${sideT.toFixed(2)}$`, key: `37v:${g[0]}:${wc}:${d}`, easyCheck: false,
          easy: `山の高さ $${s === 1 ? '\\dfrac{\\sqrt{2\\pi}}{2}' : s === 2 ? '\\sqrt{2\\pi}' : '\\dfrac{\\sqrt{2\\pi}}{4}'}$、となりは $e^{-${xT === '1' ? '' : xT}}$ 倍`,
          verify: p => { const F = w => ftNum(t => Math.exp(-t * t / g[0]) * Math.cos(wc * t), -14, 14, w, 40000)[0]; return (near(numOf(p.a, 0), +F(wc).toFixed(2), 1e-9) && near(numOf(p.a, 1), +F(w2).toFixed(2), 1e-9)) || '約の値がちがう'; } };
      },
      // 見かけがちがう：両側の指数に cos、F がわかっている声の波
      s3(r) {
        if (peek(r, '37s3', 2) === 0) {
          const a = r.pick([1, 2, 3]), wc = r.pick([5, 10, 20, 50]);
          adv(r, '37s3', 2);
          const ans = `\\dfrac{${a}}{${a * a}+(\\omega-${wc})^2}+\\dfrac{${a}}{${a * a}+(\\omega+${wc})^2}`;
          return { q: `$f(t)=e^{-${a === 1 ? '' : a}\\lvert t\\rvert}\\cos${wc}t$ の ${FW}`, a: `$${ans}$`, key: `37e:${a}:${wc}`, easyCheck: false,
            easy: `$\\dfrac12\\Bigl(\\dfrac{${2 * a}}{${a * a}+(\\omega-${wc})^2}+\\dfrac{${2 * a}}{${a * a}+(\\omega+${wc})^2}\\Bigr)$`,
            calc: { kind: 'fn', want: `${a}/(${a * a}+(omega-${wc})^2)+${a}/(${a * a}+(omega+${wc})^2)`, vars: ['omega'] } };
        }
        const wc = r.pick([100, 200, 500, 1000]), w0 = r.pick([10, 20, 30]);
        adv(r, '37s3', 2);
        return { q: `声の波 $f(t)$ のスペクトルは、$\\omega=\\pm${w0}$ に山がある。$f(t)\\cos${wc}t$ のスペクトルの山の正の $\\omega$（小さいほうから） ＝ □、□`,
          a: `$${wc - w0}$、$${wc + w0}$`, key: `37r:${wc}:${w0}`, easyCheck: false, boxw: '18mm', boxh: '9mm',
          easy: `$\\pm${w0}$ を $\\pm${wc}$ ずらす`,
          verify: p => (near(numOf(p.a, 0), wc - w0) && near(numOf(p.a, 1), wc + w0)) || '山の所がちがう' };
      },
      // わな：ずらしたガウスの形 → 9-36
      trap(r) {
        const t0 = r.pick([1, 2, 3, 4]);
        return dest({ q: `$f(t)=e^{-(t-${t0})^2/2}$ の ${FW}`, a: `$${ejw(t0)}\\sqrt{2\\pi}\\,e^{-\\omega^2/2}$`, key: `37t:${t0}`,
          calc: { kind: 'fn', want: `exp(-j*${t0}*omega)*sqrt(2*pi)*exp(-omega^2/2)`, vars: ['omega'] } }, '9-37',
          `$\\cos$ をかけたのではなく、$t$ を $${t0}$ ずらした形。$e^{-j${t0}\\omega}$ をかける`, ['9-36']);
      },
    },
  });

  // ================================================================ 9-38 8点の DFT（場合 G）
  // X_k = Σ x_m e^{-j2πkm/8}。k=2 の矢印は 1, -j, -1, j のくり返し、k=4 は 1, -1 のくり返し。
  // 例 0,1,0,-1,0,1,0,-1 → X_2=-4j（と、その何倍か・符号ちがい）はよける（O-2）
  const cT = (re, im) => {   // a+bj の TeX
    re = +re.toFixed(10); im = +im.toFixed(10);
    const iT = v => (Math.abs(v) === 1 ? '' : fmt(Math.abs(v))) + 'j';
    if (im === 0) return fmt(re);
    if (re === 0) return (im < 0 ? '-' : '') + iT(im);
    return `${fmt(re)}${im < 0 ? '-' : '+'}${iT(im)}`;
  };
  const dft = (x, k) => x.reduce((s, v, m) => [s[0] + v * Math.cos(2 * Math.PI * k * m / x.length), s[1] - v * Math.sin(2 * Math.PI * k * m / x.length)], [0, 0]);
  const exLike38 = x => { const e = [0, 1, 0, -1, 0, 1, 0, -1], i = x.findIndex(v => v !== 0); if (i < 0 || e[i] === 0) return false; const c = x[i] / e[i]; return x.every((v, m) => v === c * e[m]); };
  const xsT = x => x.map(v => fmt(v)).join(',\\ ');
  // 成分の波：x_m = A cos(πm/2) + B sin(πm/2) + D（D は直流。X_2 には効かない）
  const wave38 = (A, B, D) => [0, 1, 2, 3, 4, 5, 6, 7].map(m => Math.round(A * Math.cos(Math.PI * m / 2) + B * Math.sin(Math.PI * m / 2)) + D);
  const DT38 = [[1, 1000], [0.5, 2000], [2, 500], [0.25, 4000]];   // [Δt（ms）, f_s（Hz）]
  const sqT = v => { const r0 = Math.round(Math.sqrt(v)); if (r0 * r0 === v) return String(r0); for (let k = Math.floor(Math.sqrt(v)); k >= 2; k--) if (v % (k * k) === 0) return `${k}\\sqrt{${v / (k * k)}}`; return `\\sqrt{${v}}`; };
  add({
    id: '9-38', part: 3, chap: '9-4⑫ 例題8', stars: 1,
    title: '8点の DFT の $X_2$：かける矢印は $1,\\ -j,\\ -1,\\ j$ のくり返し',
    mark: '式がなく、とった8つの値だけ。「DFT の $X_2$」（場合 G）。',
    futsu: ['$e^{-j2\\pi\\cdot2m/8}$ を $m=0$〜7 で1つずつ', '$\\cos$ と $\\sin$ に直して計算し、', '値とかけてたす'],
    raku: ['0、1、0、$-1$、0、1、0、$-1$（1 ms ごと）', '→ $X_2=-j-j-j-j=-4j$', '→ 250 Hz（きざみ125 Hz の2倍）、振幅 $\\dfrac{2\\times4}{8}=1$'],
    why: '$k=2$ のとき、かける矢印 $e^{-j2\\pi\\cdot2m/8}=e^{-j\\pi m/2}$ は、$m$ がふえるごとに右回りに90°ずつ回り、$1,\\ -j,\\ -1,\\ j$ をくり返す（9-4⑫）。$k=4$ なら $1,\\ -1$ のくり返し。$X_k$ の周波数は $k\\times\\dfrac{f_{\\mathrm s}}{N}$、振幅は $\\dfrac{2\\lvert X_k\\rvert}{N}$。',
    caution: '矢印は右回り（$1$ の次は $-j$。$j$ ではない）。$x_m$ が0の所はとばしてよい。振幅は $\\lvert X_2\\rvert$ そのものではなく、$\\dfrac{2\\lvert X_2\\rvert}{8}$。',
    counts: { s1: 4, s2: 2, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '16mm' },
    fits(q) { return /DFT の \$X_[24]\$|表の8つの値/.test(q); },
    steps: {
      s1(r) {
        const k = peek(r, '38s1', 3) < 2 ? 2 : 4;
        const x = [0, 1, 2, 3, 4, 5, 6, 7].map(() => r.pick([-2, -1, 0, 0, 1, 1, 2, 3]));
        if (exLike38(x) || x.filter(v => v === 0).length > 4) return null;
        const X = dft(x, k); if (Math.abs(X[0]) < 1e-9 && Math.abs(X[1]) < 1e-9) return null;
        if (Math.abs(X[0]) < 1e-9 && Math.abs(X[1] + 4) < 1e-9) return null;   // 例と同じ答え -4j（O-2）
        adv(r, '38s1', 3);
        return { q: `8つの値 $x_m=${xsT(x)}$（$m=0$〜$7$）の DFT の $X_${k}$`, a: `$${cT(X[0], X[1])}$`, key: `38:${x}:${k}`, easyCheck: false,
          easy: k === 2 ? 'かける矢印 $1,\\ -j,\\ -1,\\ j$ をくり返す' : 'かける数 $1,\\ -1$ をくり返す',
          verify: p => nearC(cnumOf(p.a), x.reduce((s, v, m) => { const z = M.evalC(`e^{-j2\\pi\\cdot${k}\\cdot${m}/8}`, {}); return [s[0] + v * z[0], s[1] + v * z[1]]; }, [0, 0]), 1e-9) || '$X_k$ がちがう' };
      },
      // 周波数と振幅
      s2(r) {
        const [A, B] = r.pick([[1, 1], [2, 0], [0, 2], [3, 0], [0, 3], [1, -1], [-2, 0], [2, 2], [1, 2], [-1, 2]]), D = r.pick([0, 0, 1]);
        const [dt, fs] = r.pick(DT38), x = wave38(A, B, D);
        if (exLike38(x)) return null;
        const X = dft(x, 2), mag2 = Math.round(X[0] ** 2 + X[1] ** 2), f = 2 * fs / 8;
        // 振幅 2|X_2|/8 = |X_2|/4 = √(A²+B²)
        if (f === 250 && A === 0 && B === 1) return null;
        const amp = sqT(A * A + B * B);
        return { q: `$${fmt(dt)}\\,\\mathrm{ms}$ ごとにとった8つの値 $${xsT(x)}$ の DFT の $X_2$ ＝ □、その成分の周波数 ＝ $□\\,\\mathrm{Hz}$、振幅 ＝ □`,
          a: `$${cT(X[0], X[1])}$、$${f}$、$${amp}$`, key: `38:${x}:2`, easyCheck: false,
          easy: `きざみ $\\dfrac{${fs}}{8}$ の2倍、振幅 $\\dfrac{2\\lvert X_2\\rvert}{8}$`,
          verify: p => (nearC(cnumOf(p.a, 0), X) && near(numOf(p.a, 1), 2 / (8 * dt / 1000)) && near(numOf(p.a, 2), 2 * Math.sqrt(mag2) / 8)) || '値がちがう' };
      },
      // 表：8つの値を表で
      s3(r) {
        const [A, B] = r.pick([[1, 1], [2, 0], [0, 2], [1, -1], [2, -2], [-1, 1]]), D = r.pick([0, 1, -1]), [dt, fs] = r.pick(DT38), x = wave38(A, B, D);
        if (exLike38(x)) return null;
        const X = dft(x, 2), f = 2 * fs / 8;
        return { q: `表は $${fmt(dt)}\\,\\mathrm{ms}$ ごとにとった8つの値。DFT の $X_2$ ＝ □、その成分の周波数 ＝ $□\\,\\mathrm{Hz}$`, a: `$${cT(X[0], X[1])}$、$${f}$`, key: `38:${x}:2`, easyCheck: false,
          table: { head: ['$m$', '0', '1', '2', '3', '4', '5', '6', '7'], rows: [['$x_m$', ...x.map(v => `$${fmt(v)}$`)]] },
          easy: `$x_0-x_2+x_4-x_6$ と $-x_1+x_3-x_5+x_7$`,
          verify: p => (nearC(cnumOf(p.a, 0), X) && near(numOf(p.a, 1), 2 * 1000 / (8 * dt))) || '値がちがう' };
      },
      // わな：くり返す値の周期と周波数 → 9-01
      trap(r) {
        const pat = r.pick([[1, 0, -1, 0], [0, 1, 0, -1], [2, 0, -2, 0], [1, 1, -1, -1]]), dt = r.pick([0.5, 1, 2, 2.5, 5]);
        const T = 4 * dt, f = 1000 / T;
        return dest({ q: `$${fmt(dt)}\\,\\mathrm{ms}$ ごとにとった値が $${xsT(pat)}$ をくり返す波の周期 ＝ $□\\,\\mathrm{ms}$、周波数 ＝ $□\\,\\mathrm{Hz}$`, a: `$${fmt(T)}$、$${fmt(f)}$`, key: `38t:${pat}:${dt}`,
          verify: p => (near(numOf(p.a, 0), T) && near(numOf(p.a, 1), f)) || '周期か周波数がちがう' }, '9-38',
          `DFT ではなく、くり返す長さを見る。4つで1周期、$1000\\div${fmt(T)}$`, ['9-01']);
      },
    },
  });

  // ================================================================ 9-39 FFT の結果を読む（場合 G）
  // N = f_s × 秒、きざみ f_s/N、振幅 2|X_k|/N、上限 f_s/2。例 f_s=1000・2秒（N=2000、0.5 Hz、500 Hz、|X_k|=500 → 0.5）はよける（O-2）
  const HZ = v => `$${fmt(v)}\\,\\mathrm{Hz}$`;
  const FS39 = [2000, 4000, 8000, 16000, 44100, 48000, 1000];
  const T39 = [0.5, 1, 2, 4, 0.25];
  const AMP39 = [0.1, 0.2, 0.25, 0.4, 0.5, 1, 1.5, 2, 3];
  const ok39 = (fs, T) => Number.isInteger(fs * T) && !(fs === 1000 && T === 2);
  add({
    id: '9-39', part: 3, chap: '9-4⑫⑬ 例題9', stars: 1,
    title: 'FFT の結果は、きざみ $\\dfrac{f_{\\mathrm s}}{N}$、振幅 $\\dfrac{2\\lvert X_k\\rvert}{N}$、上限 $\\dfrac{f_{\\mathrm s}}{2}$',
    mark: '「1秒に □ 回、□ 秒間とった」「$\\lvert X_k\\rvert$ が □」「FFT」。',
    futsu: ['DFT の式 $X_k=\\sum x_me^{-j2\\pi km/N}$ から、', '$X_k$ を $c_k$ にもどす関係と、', '$k$ 番めの周波数を1つずつ導く'],
    raku: ['$f_{\\mathrm s}=1000\\,\\mathrm{Hz}$ で2秒 → $N=2000$', 'きざみ $0.5\\,\\mathrm{Hz}$、上限 $500\\,\\mathrm{Hz}$', '$\\lvert X_k\\rvert=500$ → 振幅 $\\dfrac{2\\times500}{2000}=0.5$'],
    why: '$X_k$ は $N$ 個の値の和で、$Nc_k$ に近い（9-4⑫）。だから $N$ でわると $c_k$、負の周波数の分の2をかけると振幅。$k$ 番めの周波数は $k\\times\\dfrac{f_{\\mathrm s}}{N}$ で、きざみはとった時間の逆数 $\\dfrac{1}{\\text{秒}}$。正しく調べられるのは $\\dfrac{f_{\\mathrm s}}{2}$ まで（9-4⑭）。',
    caution: '$\\lvert X_k\\rvert$ をそのまま振幅にしない（$N$ でわって2倍）。点の数 $N$ は $f_{\\mathrm s}\\times$秒（$f_{\\mathrm s}$ ではない）。きざみは $\\dfrac{f_{\\mathrm s}}{N}$ で、秒が長いほど細かい。',
    counts: { s1: 4, s2: 2, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { return /FFT|rfft|次のプログラム/.test(q) && /点の数|きざみ|振幅|いちばん高い周波数|番めの成分|成分の周波数/.test(q); },
    steps: {
      s1(r) {
        const fs = r.pick(FS39), T = r.pick(T39); if (!ok39(fs, T)) return null;
        const N = fs * T, st = 1 / T;
        return { q: `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ で $${fmt(T)}$ 秒間とった音を FFT する。点の数 $N$ ＝ □、周波数のきざみ ＝ $□\\,\\mathrm{Hz}$`, a: `$${N}$、$${fmt(st)}$`, key: `39:${fs}:${T}`, easyCheck: false,
          easy: `$N=${fs}\\times${fmt(T)}$、きざみ $\\dfrac{${fs}}{${N}}$`,
          verify: p => (near(numOf(p.a, 0), fs * T) && near(numOf(p.a, 1), fs / (fs * T))) || '値がちがう' };
      },
      s2(r) {
        const fs = r.pick(FS39), T = r.pick(T39); if (!ok39(fs, T)) return null;
        const N = fs * T, amp = r.pick(AMP39), X = amp * N / 2; if (!Number.isInteger(X)) return null;
        if (turn(r, '39s2', 2) === 0)
          return { q: `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ で $${fmt(T)}$ 秒間とった音を FFT すると、ある成分の $\\lvert X_k\\rvert$ が $${X}$ だった。この成分の振幅 ＝ □、正しく調べられるいちばん高い周波数 ＝ $□\\,\\mathrm{Hz}$`,
            a: `$${fmt(amp)}$、$${fmt(fs / 2)}$`, key: `39:${fs}:${T}`, easyCheck: false,
            easy: `$\\dfrac{2\\times${X}}{${N}}$、$\\dfrac{${fs}}{2}$`,
            verify: p => (near(numOf(p.a, 0), 2 * X / (fs * T)) && near(numOf(p.a, 1), fs / 2)) || '値がちがう' };
        const k = r.pick([50, 100, 220, 440, 880, 1000]) * T; if (k * fs / N > fs / 2) return null;
        return { q: `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ で $${fmt(T)}$ 秒間とった音を FFT した。$${k}$ 番めの成分の周波数 ＝ $□\\,\\mathrm{Hz}$、その $\\lvert X_k\\rvert$ が $${X}$ のときの振幅 ＝ □`,
          a: `$${fmt(k * fs / N)}$、$${fmt(amp)}$`, key: `39:${fs}:${T}`, easyCheck: false,
          easy: `$${k}\\times\\dfrac{${fs}}{${N}}$、$\\dfrac{2\\times${X}}{${N}}$`,
          verify: p => (near(numOf(p.a, 0), k / T) && near(numOf(p.a, 1), 2 * X / N)) || '値がちがう' };
      },
      // プログラム：rfft の表示を読む（W-7。ステップ3だけ）
      s3(r) {
        const fs = r.pick([2000, 4000, 8000]), T = r.pick([1, 2, 0.5]), N = fs * T, f0 = r.pick([100, 220, 440, 500, 880]), k = f0 * T;
        if (f0 >= fs / 2) return null;
        const amp = r.pick([0.2, 0.25, 0.5, 1, 2]), X = amp * N / 2; if (!Number.isInteger(X) || X === N) return null;
        const code = `import numpy as np\nfs = ${fs}\nx = np.loadtxt('oto.csv')\nX = np.fft.rfft(x)\nprint(len(x))\nprint(np.abs(X[${k}]))`;
        return { q: `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ でとった音のデータ（oto.csv）で次のプログラムを実行し、\`${N}\` と \`${X}.0\` が表示されたとします。\`X[${k}]\` の成分の周波数 ＝ $□\\,\\mathrm{Hz}$、振幅 ＝ □`,
          a: `$${fmt(f0)}$、$${fmt(amp)}$`, key: `39p:${fs}:${T}:${k}`, easyCheck: false, code,
          easy: `$N=${N}$、$${k}\\times\\dfrac{${fs}}{${N}}$、$\\dfrac{2\\times${X}}{${N}}$`,
          verify: p => (near(numOf(p.a, 0), k * fs / N) && near(numOf(p.a, 1), 2 * X / N)) || '値がちがう' };
      },
      // わな：f_s/2 より高い音がどこに出るか → 9-40
      trap(r) {
        const fs = r.pick([1000, 2000, 4000, 8000]), f = r.pick([0.6, 0.7, 0.8, 0.9]) * fs;
        return dest({ q: `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ でとった ${HZ(f)} の $\\cos$ の音は、FFT の結果では何 Hz の所に出るか`, a: `$${fmt(fs - f)}\\,\\mathrm{Hz}$`, key: `39t:${fs}:${f}`,
          verify: p => near(numOf(p.a), fs - f) || '周波数がちがう' }, '9-39',
          `${HZ(f)} は上限 ${HZ(fs / 2)} より高いので、そのままの所には出ない。$${fs}-${fmt(f)}$ に化ける`, ['9-40']);
      },
    },
  });

  // ================================================================ 9-40 エイリアシング
  // f_s/2 < f < f_s → f_s - f、f_s < f < 3f_s/2 → f - f_s に化ける。正しくとるには f_s > 2f。例 f_s=6000（5000・7000 → 1000、14000）はよける（O-2）
  const FS40 = [1000, 2000, 4000, 8000, 10000, 44100];
  const alias = (fs, f) => { const r0 = ((f % fs) + fs) % fs; return Math.min(r0, fs - r0); };
  const qFsF = (fs, f) => `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ でとるとき、${HZ(f)} の $\\cos$ の音と同じ点になる、$\\dfrac{f_{\\mathrm s}}{2}$ より低い音`;
  // 9-40 の図：とった点（黒丸）、高い音の cos（細い線）、低い音の cos（破線）。時間の目もりは書かない（答えになるので）
  function fig40(n, up) {   // 低い音の1周期に n 点。高い音は n±1 回（up：f_s+f）
    const G = M.graph({ x0: 0, x1: n, y0: -1.25, y1: 1.25, w: 8.4, h: 3.2 }), hi = up ? n + 1 : n - 1;
    return { s: 5, items: [...G.axes({ x: 't', y: 'x', o: false }),
      ...G.plot(t => Math.cos(2 * Math.PI * hi * t / n), 0, n, { n: 400 }),
      ...G.plot(t => Math.cos(2 * Math.PI * t / n), 0, n, { n: 120, dash: true, thick: true }),
      ...Array.from({ length: n + 1 }, (_, m) => ['dot', G.T(m, Math.cos(2 * Math.PI * m / n))])] };
  }
  const fits40 = q => {
    const s = /f_\{\\mathrm s\}=(\d+)\\,\\mathrm\{Hz\}/.exec(q), f = /\$(\d+)\\,\\mathrm\{Hz\}\$ の \$\\cos\$/.exec(q);
    if (/図は/.test(q) && /破線/.test(q)) return true;
    if (/正しくとる/.test(q)) return true;
    if (!s || !f) return false;
    return +f[1] > +s[1] / 2;
  };
  add({
    id: '9-40', part: 3, chap: '9-4⑭ 例題10', stars: 1,
    title: '$f_{\\mathrm s}$ でとると $f_{\\mathrm s}-f$ の音と同じ点（正しくは $f_{\\mathrm s}>2f$）',
    mark: 'エイリアシング、$\\dfrac{f_{\\mathrm s}}{2}$ より高い音、「何 Hz の音と同じ点」。',
    futsu: ['とった時刻 $\\dfrac{m}{f_{\\mathrm s}}$ を $\\cos$ に入れて、', '$m=0,\\ 1,\\ 2$ と順に値を1つずつ計算し、', '同じ値になる低い音をさがす'],
    raku: ['$f_{\\mathrm s}=6000\\,\\mathrm{Hz}$ で $5000\\,\\mathrm{Hz}$ → $6000-5000=1000\\,\\mathrm{Hz}$', '$7000\\,\\mathrm{Hz}$ → $7000-6000=1000\\,\\mathrm{Hz}$', '$7000\\,\\mathrm{Hz}$ までとるなら $f_{\\mathrm s}>14000\\,\\mathrm{Hz}$'],
    why: 'とった時刻 $\\dfrac{m}{f_{\\mathrm s}}$ では、$\\cos$ の肩が $2\\pi m$（何周しても同じ）だけちがう音は同じ値になる（9-4⑭）。だから $f$ と $f_{\\mathrm s}-f$（$f-f_{\\mathrm s}$）の音は同じ点を通る。いちばん高い周波数の2倍より大きい $f_{\\mathrm s}$ でとれば、とりちがえる相手は $\\dfrac{f_{\\mathrm s}}{2}$ より上だけになる（サンプリング定理）。',
    caution: '$\\dfrac{f_{\\mathrm s}}{2}$ より低い音は、そのままの周波数（化けない）。$f_{\\mathrm s}$ より高い音は $f-f_{\\mathrm s}$（ひく向きに注意）。正しくとる $f_{\\mathrm s}$ は、いちばん高い音の2倍「より大きい」。',
    counts: { s1: 4, s2: 3, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits: fits40,
    steps: {
      s1(r) {
        const fs = r.pick(FS40), up = turn(r, '40s1', 2) === 1, g = r.pick([0.1, 0.2, 0.3, 0.4]) * fs;
        if (!Number.isInteger(g)) return null;
        const f = up ? fs + g : fs - g;
        return { q: qFsF(fs, f), a: `$${fmt(g)}\\,\\mathrm{Hz}$`, key: `40:${fs}:${f}`, easyCheck: false,
          easy: up ? `$${fmt(f)}-${fs}$` : `$${fs}-${fmt(f)}$`,
          verify: p => (near(numOf(p.a), alias(fs, f)) && [0, 1, 2, 3, 5].every(m => near(Math.cos(2 * Math.PI * f * m / fs), Math.cos(2 * Math.PI * numOf(p.a) * m / fs), 1e-6))) || '同じ点にならない' };
      },
      s2(r) {
        if (turn(r, '40s2', 2) === 0) {
          const fmax = r.pick([3000, 4000, 5000, 9000, 12000, 15000, 20000, 24000]);
          if (fmax === 7000) return null;
          return { q: `${HZ(fmax)} までの音を正しくとるには、$f_{\\mathrm s}$ を何 Hz より大きくすればよいか`, a: `$${2 * fmax}\\,\\mathrm{Hz}$`, key: `40m:${fmax}`, easyCheck: false,
            easy: `$${fmax}\\times2$`, verify: p => near(numOf(p.a), 2 * fmax) || '値がちがう' };
        }
        const fs = r.pick(FS40.filter(v => v <= 10000)), g = r.pick([0.1, 0.2, 0.25, 0.3, 0.4]) * fs;
        if (!Number.isInteger(g)) return null;
        return { q: `$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ でとるとき、${HZ(fs - g)} と ${HZ(fs + g)} の $\\cos$ の音は、それぞれ何 Hz の音と同じ点になるか`, a: `どちらも $${fmt(g)}\\,\\mathrm{Hz}$`, key: `40b:${fs}:${g}`, easyCheck: false,
          easy: `$${fs}-${fmt(fs - g)}$、$${fmt(fs + g)}-${fs}$`,
          verify: p => (/どちらも/.test(p.a) && near(numOf(p.a), alias(fs, fs - g)) && near(numOf(p.a), alias(fs, fs + g))) || '値がちがう' };
      },
      // 図：とった点と2つの cos
      s3(r) {
        const n = r.pick([6, 8, 10]), fl = r.pick([500, 1000, 2000]), fs = n * fl, up = r.chance(0.5), f = up ? fs + fl : fs - fl;
        if (fs === 6000) return null;   // 例（O-2）
        return { q: `図は、$f_{\\mathrm s}=${fs}\\,\\mathrm{Hz}$ でとった点（黒丸）と、${HZ(f)} の $\\cos$（細い線）。同じ点を通る破線の低い音 ＝ $□\\,\\mathrm{Hz}$`, a: `$${fl}$`, key: `40:${fs}:${f}`, easyCheck: false, fig: fig40(n, up),
          easy: up ? `$${f}-${fs}$` : `$${fs}-${f}$`,
          verify: p => near(numOf(p.a), alias(fs, f)) || '値がちがう' };
      },
      // わな：f_s/2 より低い音（化けない）→ わざなし
      trap(r) {
        const fs = r.pick([2000, 4000, 8000, 10000]), f = r.pick([0.1, 0.2, 0.3, 0.375, 0.4]) * fs;
        if (!Number.isInteger(f)) return null;
        return dest({ q: qFsF(fs, f), a: `$${fmt(f)}\\,\\mathrm{Hz}$（そのまま）`, key: `40t:${fs}:${f}`,
          verify: p => near(numOf(p.a), f) || '値がちがう' }, '9-40',
          `${HZ(f)} は $\\dfrac{f_{\\mathrm s}}{2}=${fs / 2}\\,\\mathrm{Hz}$ より低いので、化けない`);
      },
    },
  });

  // ---------------------------------------------------------------- ラプラス変換の部品
  // c/(den) の項（符号を前に）。den は 's'・'s+3'・'s^2'
  const ft = (c, den) => (c < 0 ? `-\\dfrac{${fmt(-c)}}{${den}}` : `\\dfrac{${fmt(c)}}{${den}}`);
  const sumF = ts => ts.map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('');
  const sa = a => vpa('s', -a);   // e^{at} の分母 s-a
  const LL = f => `\\mathcal L[${f}]`;
  // 時間の世界の項：c、c e^{at}、c t
  const termT = (kind, c, a) => (kind === 'c' ? fmt(c) : kind === 'e' ? cf(c, eT(a)) : cf(c, 't'));
  const termS = (kind, c, a) => (kind === 'c' ? ft(c, 's') : kind === 'e' ? ft(c, sa(a)) : ft(c, 's^2'));
  const termW = (kind, c, a) => (kind === 'c' ? `${c}/s` : kind === 'e' ? `${c}/(s-(${a}))` : `${c}/s^2`);
  const termF = (kind, c, a) => (kind === 'c' ? () => c : kind === 'e' ? t => c * Math.exp(a * t) : t => c * t);
  const condT = a => `$s>${fmt(a)}$`;

  // ================================================================ 9-41 定義の積分で表の行を作る（場合 A）
  // L[e^{at}] = 1/(s-a)（s>a）、L[t] = 1/s²、L[c] = c/s（s>0）。例 L[e^{-5t}]・L[6t] はよける（O-2）
  const A41 = [-1, -2, -3, -4, 1, 2, 3, 4, -0.5, 0.5, -10];
  add({
    id: '9-41', part: 3, chap: '9-5⑤ 例題1', stars: 1,
    title: '表の行は定義の積分で1回だけ作る：$\\mathcal L[e^{at}]=\\dfrac{1}{s-a}$',
    mark: '「定義の積分で求めよう」「どんな $s$ で使えるか」（場合 A）。',
    futsu: ['$e^{-st}$ をかけた式を', '台形の和で細かく分けてたし、', '$s$ をいくつか変えて形をさがす'],
    raku: ['$\\mathcal L[e^{-5t}]=\\displaystyle\\int_0^{\\infty}e^{-(s+5)t}\\,\\dd t=\\dfrac{1}{s+5}$（$s>-5$）', '$\\mathcal L[6t]=\\dfrac{6}{s^2}$（部分積分。はしの項は0）'],
    why: '$\\mathcal L[f(t)]=\\displaystyle\\int_0^{\\infty}f(t)e^{-st}\\,\\dd t$（9-5③）。$e^{at}e^{-st}=e^{-(s-a)t}$ なので、0から $b$ までの定積分は $\\dfrac{1}{s-a}\\bigl(1-e^{-(s-a)b}\\bigr)$。$s>a$ なら $b$ を大きくすると $\\dfrac{1}{s-a}$。$t$ の行は部分積分で、はしの項 $\\Bigl[-\\dfrac{t}{s}e^{-st}\\Bigr]_0^{\\infty}$ が0。',
    caution: '分母は $s-a$（$e^{-3t}$ なら $s+3$）。使える $s$ は「$s>a$」（$s$ が小さいと積分が有限にならない）。$\\mathcal L[t]$ は $\\dfrac{1}{s}$ ではなく $\\dfrac{1}{s^2}$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { return (/定義の積分/.test(q) || /\\int_0\^\{\\infty\}.*e\^\{-st\}|\\int_0\^\{\\infty\}e\^\{-\(s/.test(q)) && !/\\sin|\\cos|te\^/.test(q); },
    steps: {
      s1(r) {
        const a = r.pick(A41), c = r.pick([1, 1, 1, 2, 3, 5]);
        if (a === -5) return null;
        const f = cf(c, eT(a));
        return { q: `定義の積分で求めた $${LL(f)}$ と、使える $s$ の範囲`, a: `$${ft(c, sa(a))}$（${condT(a)}）`, key: `41:e:${a}:${c}`, easyCheck: false,
          easy: `$\\displaystyle${c === 1 ? '' : c}\\int_0^{\\infty}e^{-(${sa(a)})t}\\,\\dd t$`,
          calc: { kind: 'fn', want: termW('e', c, a), vars: ['s'], ans: ft(c, sa(a)) },
          verify: p => (p.a.includes(condT(a)) && near(numOf(p.a, 0, { s: a + 1.3 }), ltNum(termF('e', c, a), a + 1.3), 1e-6)) || '値か $s$ の範囲がちがう' };
      },
      s2(r) {
        const c = r.pick([1, 2, 3, 4, 5, 7, 10, 0.5]), lin = turn(r, '41s2', 2) === 0;
        if (lin && c === 6) return null;
        const f = lin ? cf(c, 't') : fmt(c), F = lin ? ft(c, 's^2') : ft(c, 's');
        return { q: `定義の積分で求めた $${LL(f)}$ と、使える $s$ の範囲`, a: `$${F}$（$s>0$）`, key: `41:${lin ? 't' : 'c'}:${c}`, easyCheck: false,
          easy: lin ? `部分積分。はしの項 $\\Bigl[-\\dfrac{${c === 1 ? '' : fmt(c)}t}{s}e^{-st}\\Bigr]_0^{\\infty}=0$` : `$\\displaystyle\\int_0^{\\infty}${fmt(c)}e^{-st}\\,\\dd t$`,
          calc: { kind: 'fn', want: termW(lin ? 't' : 'c', c, 0), vars: ['s'], ans: F },
          verify: p => (p.a.includes('$s>0$') && near(numOf(p.a, 0, { s: 1.7 }), ltNum(termF(lin ? 't' : 'c', c, 0), 1.7), 1e-6)) || '値か $s$ の範囲がちがう' };
      },
      // 見かけがちがう：積分の形のまま、s の値を入れた値
      s3(r) {
        if (peek(r, '41s3', 2) === 0) {
          const a = r.pick(A41.filter(v => Number.isInteger(v) && v !== -5));
          adv(r, '41s3', 2);
          return { q: `$\\displaystyle\\int_0^{\\infty}${eT(a)}e^{-st}\\,\\dd t$ と、それが有限になる $s$ の範囲`, a: `$${ft(1, sa(a))}$（${condT(a)}）`, key: `41:e:${a}:1`, easyCheck: false,
            easy: `肩をまとめて $e^{-(${sa(a)})t}$`,
            calc: { kind: 'fn', want: termW('e', 1, a), vars: ['s'], ans: ft(1, sa(a)) },
            verify: p => p.a.includes(condT(a)) || '$s$ の範囲がちがう' };
        }
        const c = r.pick([2, 3, 4, 5, 8]), s = r.pick([1, 2, 4, 0.5]), v = c / (s * s), lin = r.chance(0.6);
        const vv = lin ? v : c / s, fr0 = toFr(vv);
        if (!fr0 || fr0[1] > 64 || c === 6) return null;
        adv(r, '41s3', 2);
        return { q: `$s=${fmt(s)}$ のときの $\\displaystyle\\int_0^{\\infty}${lin ? (c === 1 ? '' : c) + 't' : c}\\,e^{-st}\\,\\dd t$ の値`, a: `$${frac(fr0[0], fr0[1])}$`, key: `41v:${lin}:${c}:${s}`, easyCheck: false,
          easy: lin ? `$\\mathcal L[${c}t]=\\dfrac{${c}}{s^2}$ に $s=${fmt(s)}$` : `$\\mathcal L[${c}]=\\dfrac{${c}}{s}$ に $s=${fmt(s)}$`,
          verify: p => near(numOf(p.a), ltNum(lin ? t => c * t : () => c, s, 80 / s, 20000), 1e-6) || '積分の値とちがう' };
      },
      // わな：e^{-at}sin bt（s のずらし）→ 9-47
      trap(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3]);
        return dest({ q: `$${LL(`${eT(-a)}\\sin${b === 1 ? ' ' : b}t`)}$`, a: `$\\dfrac{${b}}{(s+${a})^2+${b * b}}$`, key: `41t:${a}:${b}`,
          calc: { kind: 'fn', want: `${b}/((s+${a})^2+${b * b})`, vars: ['s'] } }, '9-41',
          '$e^{-at}$ と $\\sin$ のかけ算。表の $\\sin$ の行の $s$ を $s+a$ にずらす（第4部）', ['9-47']);
      },
    },
  });

  // ================================================================ 9-42 項の和は項ごとに表を引く（線形。場合 B）
  // 例 L[4-3e^{2t}+5t]（と、その何倍か）はよける（O-2）
  const EX42 = [4, -3, 2, 5];
  function gen42(r, kinds) {
    const ts = kinds.map(k => [k, r.pick(k === 'c' ? [1, 2, 3, 5, 6, 10, -2] : k === 'e' ? [1, 2, 3, 4, -1, -2, -3, -5] : [1, 2, 3, 4, -1, -2, -4]), k === 'e' ? r.pick([1, 2, 3, -1, -2, -3, -4, 0.5, -0.5]) : 0]);
    if (ts.filter(t => t[0] === 'e').length === 2 && ts[0][2] === ts[1][2]) return null;
    // 例の何倍か
    const c = ts.find(t => t[0] === 'c'), e = ts.find(t => t[0] === 'e'), l = ts.find(t => t[0] === 't');
    if (c && e && l && e[2] === 2 && c[1] * EX42[1] === e[1] * EX42[0] && c[1] * EX42[3] === l[1] * EX42[0]) return null;
    return ts;
  }
  const fT = ts => sum(ts.map(t => termT(...t)));
  const fS = ts => sumF(ts.map(t => termS(...t)));
  const fW = ts => ts.map(t => `(${termW(...t)})`).join('+');
  const fN = ts => tt => ts.reduce((s, t) => s + termF(...t)(tt), 0);
  add({
    id: '9-42', part: 3, chap: '9-5⑨ 例題7', stars: 1,
    title: '項の和は項ごとに表を引く（線形）。定数 $c$ は $\\dfrac{c}{s}$',
    mark: 'いくつかの項の和（定数・$e^{at}$・$t$）（場合 B）。',
    futsu: ['$e^{-st}$ をかけた和を', '0から $\\infty$ まで項ごとに積分して', '（$t$ の項は部分積分）、たし合わせる'],
    raku: ['$\\mathcal L[4-3e^{2t}+5t]$', '$=\\dfrac{4}{s}-\\dfrac{3}{s-2}+\\dfrac{5}{s^2}$', '（積分しない）'],
    why: 'ラプラス変換は積分なので、たし算と定数倍はそのまま通る：$\\mathcal L[af+bg]=aF+bG$（9-5⑨）。だから項ごとに表（$1\\to\\dfrac1s$、$e^{at}\\to\\dfrac{1}{s-a}$、$t\\to\\dfrac{1}{s^2}$）を引いて、係数をかけてたせばよい。',
    caution: '定数は定数のままにしない（$\\mathcal L[4]=\\dfrac4s$。$4$ ではない）。ひく項の符号を落とさない。かけ算（$te^{-t}$ など）は項ごとにならない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '40mm', s3: '36mm', trap: '20mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) {
      if (/定義の積分|te\^|\\sin|\\cos|\\dot|\\int/.test(q)) return false;
      const m = /\\mathcal L\[([^\]]*)\]/.exec(q); if (m) return /.[+-]/.test(m[1]);
      return /翻訳|ラプラス変換した/.test(q) && /\$[A-Za-z]=[^$]*[+-][^$]*e\^/.test(q);
    },
    steps: {
      s1(r) {
        const ts = gen42(r, r.shuffle(['c', 'e', 't'])); if (!ts) return null;
        return { q: `$${LL(fT(ts))}$`, a: `$${fS(ts)}$`, key: `42:${fT(ts)}`, easyCheck: false,
          easy: '項ごとに $\\dfrac{c}{s}$、$\\dfrac{c}{s-a}$、$\\dfrac{c}{s^2}$',
          calc: { kind: 'fn', want: fW(ts), vars: ['s'] },
          verify: p => near(numOf(p.a, 0, { s: 6.3 }), ltNum(fN(ts), 6.3), 1e-6) || '積分の値とちがう' };
      },
      s2(r) {
        const kind = turn(r, '42s2', 2);
        if (kind === 0) {   // 2つの e と定数・t
          const ts = gen42(r, r.shuffle(['e', 'e', r.pick(['c', 't'])])); if (!ts) return null;
          return { q: `$${LL(fT(ts))}$`, a: `$${fS(ts)}$`, key: `42:${fT(ts)}`, easyCheck: false,
            easy: '項ごとに表を引いてたす',
            calc: { kind: 'fn', want: fW(ts), vars: ['s'] } };
        }
        // 定数倍のかっこ：k(c - e^{at})
        const k = r.pick([2, 3, 4, 5, 10]), c = r.pick([1, 2, 3]), a = r.pick([-1, -2, -3, -0.5, 2]);
        const inner = `${c}-${eT(a)}`, ts = [['c', k * c, 0], ['e', -k, a]];
        return { q: `$${LL(`${k}(${inner})`)}$`, a: `$${fS(ts)}$`, key: `42k:${k}:${c}:${a}`, easyCheck: false,
          easy: `$${k}\\Bigl(${ft(c, 's')}-${ft(1, sa(a))}\\Bigr)$`,
          calc: { kind: 'fn', want: fW(ts), vars: ['s'] } };
      },
      // 見かけがちがう：電圧・温度の式を s の世界に翻訳
      s3(r) {
        if (peek(r, '42s3', 2) === 0) {
          const E = r.pick([5, 10, 12, 6]), tau = r.pick([0.5, 2, 4, 0.2]), a = -1 / tau, ts = [['c', E, 0], ['e', -E, a]];
          adv(r, '42s3', 2);
          return { q: `コンデンサーの電圧 $v=${fT(ts)}$（V）をラプラス変換した $V(s)$`, a: `$${fS(ts)}$`, key: `42v:${E}:${tau}`, easyCheck: false,
            easy: `$${E}$ は $${ft(E, 's')}$、$${eT(a)}$ は $${ft(1, sa(a))}$`,
            calc: { kind: 'fn', want: fW(ts), vars: ['s'] } };
        }
        const Ta = r.pick([15, 20, 25]), d = r.pick([40, 50, 60, 70]), k = r.pick([0.02, 0.04, 0.05, 0.1, 0.2]), ts = [['c', Ta, 0], ['e', d, -k]];
        if (Ta === 20 && d === 60 && k === 0.05) return null;
        adv(r, '42s3', 2);
        return { q: `お湯の温度 $T=${fT(ts)}$（℃、$t$ は分）をラプラス変換した $T(s)$`, a: `$${fS(ts)}$`, key: `42T:${Ta}:${d}:${k}`, easyCheck: false,
          easy: '項ごとに表を引く',
          calc: { kind: 'fn', want: fW(ts), vars: ['s'] } };
      },
      // わな：かけ算 t e^{-at} → 9-47
      trap(r) {
        const a = r.pick([1, 2, 3, 4]), c = r.pick([1, 1, 2, 3]);
        return dest({ q: `$${LL(`${c === 1 ? '' : c}t${eT(-a)}`)}$`, a: `$\\dfrac{${c}}{(s+${a})^2}$`, key: `42t:${a}:${c}`,
          calc: { kind: 'fn', want: `${c}/(s+${a})^2`, vars: ['s'] } }, '9-42',
          `$t$ と $${eT(-a)}$ のかけ算は、項ごとにならない（$\\dfrac{1}{s^2}\\times\\dfrac{1}{s+${a}}$ ではない）。$\\dfrac{1}{s^2}$ の $s$ を $s+${a}$ にずらす`, ['9-47']);
      },
    },
  });

  // ================================================================ 9-43 微分は「s をかけて、はじめの値をひく」（場合 E）
  // ẍ+bẋ+cx=0（b=p+q、c=pq）、x(0)=x0、ẋ(0)=v0 → X = (x0 s + v0 + b x0)/(s²+bs+c)。例 ẍ+4ẋ+3x=0、x(0)=3、ẋ(0)=0 はよける（O-2）
  const PQ43 = [[1, 2], [1, 3], [1, 4], [2, 3], [1, 5], [2, 4], [2, 5], [3, 4], [1, 6]];
  const odeT = (b, c, v) => `\\ddot ${v || 'x'}+${b === 1 ? '' : b}\\dot ${v || 'x'}+${c}${v || 'x'}=0`;
  const poly2 = (b, c) => `s^2+${b === 1 ? '' : b}s+${c}`;
  const numer = (x0, k) => sum([cf(x0, 's'), k === 0 ? '' : fmt(k)]);   // x0 s + k
  const X43 = (b, c, x0, v0) => `\\dfrac{${numer(x0, v0 + b * x0)}}{${poly2(b, c)}}`;
  const W43 = (b, c, x0, v0) => `(${x0}*s+${v0 + b * x0})/(s^2+${b}*s+${c})`;
  const init43 = (x0, v0) => `$x(0)=${x0}$、$\\dot x(0)=${v0}$`;
  const ex43 = (b, c, x0, v0) => b === 4 && c === 3 && v0 === 0;   // x0 がちがっても、答えは例の何倍か
  add({
    id: '9-43', part: 3, chap: '9-5⑥⑦ 例題5', stars: 1,
    title: '微分は「$s$ をかけて、はじめの値をひく」：$sF-f(0)$',
    mark: '微分方程式とはじめの値。「$X(s)$ を求めよう」（場合 E）。',
    futsu: ['6-12 のように $e^{st}$ を入れて特性方程式を解き、', '$x=Ae^{-pt}+Be^{-qt}$ の $A$・$B$ をはじめの値から決め、', 'その $x$ を表で変換する'],
    raku: ['$\\ddot x+4\\dot x+3x=0$、$x(0)=3$、$\\dot x(0)=0$', '→ $(s^2X-3s)+4(sX-3)+3X=0$', '→ $X=\\dfrac{3s+12}{s^2+4s+3}$'],
    why: '部分積分で $\\mathcal L[f\']=sF(s)-f(0)$（はしの項がはじめの値。9-5⑥）。2回使うと $\\mathcal L[f\'\']=s^2F-sf(0)-f\'(0)$（9-5⑦）。1項ずつ辞書で書きかえ、$X$ の項を左に集めてわると、はじめの値が入った $X(s)$ が1回で出る。分母は 6-12 の特性方程式の左辺。',
    caution: '$-f(0)$ を忘れない。2回微分の $-sf(0)$ は $x(0)$ に $s$ をかける（$x(0)=3$ なら $-3s$）。$\\dot x$ の項の係数をはじめの値にもかける（$4(sX-3)$ の $-12$）。小文字 $x$ と大文字 $X$ をまぜない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '26mm', s3: '26mm', trap: '34mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm' },
    fits(q) { return /\\ddot x/.test(q) && /X\(s\)|\\mathcal L|分母が0/.test(q); },
    steps: {
      s1(r) {
        const [p, q] = r.pick(PQ43), b = p + q, c = p * q, x0 = r.pick([1, 2, 3, 4, 5]);
        if (ex43(b, c, x0, 0)) return null;
        return { q: `$${odeT(b, c)}$、${init43(x0, 0)} を変換した $X(s)$`, a: `$${X43(b, c, x0, 0)}$`, key: `43:${b}:${c}:${x0}:0`, easyCheck: false,
          easy: `$(s^2X-${x0 === 1 ? '' : x0}s)+${b}(sX-${x0})+${c}X=0$`,
          calc: { kind: 'fn', want: W43(b, c, x0, 0), vars: ['s'] },
          verify: p0 => near(numOf(p0.a, 0, { s: 2.3 }), ltNum(t => (x0 * q * Math.exp(-p * t) - x0 * p * Math.exp(-q * t)) / (q - p), 2.3), 1e-6) || '解を変換した値とちがう' };
      },
      s2(r) {
        if (turn(r, '43s2', 2) === 0) {
          const [p, q] = r.pick(PQ43), b = p + q, c = p * q, x0 = r.pick([0, 1, 2, 3]), v0 = r.pick([1, 2, 3, -1, -2, 4]);
          return { q: `$${odeT(b, c)}$、${init43(x0, v0)} を変換した $X(s)$`, a: `$${X43(b, c, x0, v0)}$`, key: `43:${b}:${c}:${x0}:${v0}`, easyCheck: false,
            easy: `$(${sum(['s^2X', cf(-x0, 's'), fmt(-v0)])})+${b}(sX${x0 === 0 ? '' : '-' + x0})+${c}X=0$`,
            calc: { kind: 'fn', want: W43(b, c, x0, v0), vars: ['s'] } };
        }
        // L[ẍ] を X で
        const x0 = r.pick([1, 2, 3, 4, -1, -2]), v0 = r.pick([0, 1, 2, -1, -3, 5]);
        if (x0 === 3 && v0 === 0) return null;
        const ans = sum(['s^2X', cf(-x0, 's'), v0 === 0 ? '' : fmt(-v0)]);
        return { q: `$x(0)=${x0}$、$\\dot x(0)=${v0}$ のとき、$${LL('\\ddot x')}$ を $X$（$x$ の変換）で表した式`, a: `$${ans}$`, key: `43d:${x0}:${v0}`, easyCheck: false,
          easy: '$s^2X-sx(0)-\\dot x(0)$',
          calc: { kind: 'fn', want: `s^2*X-${x0}*s-(${v0})`, vars: ['s', 'X'] } };
      },
      // 見かけがちがう：おもりを引いてはなす、分母が0になる s
      s3(r) {
        const [p, q] = r.pick(PQ43), b = p + q, c = p * q, x0 = r.pick([1, 2, 3, 4, 5]);
        if (ex43(b, c, x0, 0)) return null;
        if (peek(r, '43s3', 2) === 0) {
          adv(r, '43s3', 2);
          return { q: `ばねにつけたおもりを $${x0}\\,\\mathrm{cm}$ 引いて、静かにはなした（$\\dot x(0)=0$）。動きの式は $${odeT(b, c)}$。$X(s)$`, a: `$${X43(b, c, x0, 0)}$`, key: `43:${b}:${c}:${x0}:0`, easyCheck: false,
            easy: `$x(0)=${x0}$、$\\dot x(0)=0$`,
            calc: { kind: 'fn', want: W43(b, c, x0, 0), vars: ['s'] } };
        }
        adv(r, '43s3', 2);
        return { q: `$${odeT(b, c)}$、${init43(x0, 0)} を変換した $X(s)$ の、分母が0になる $s$`, a: `$s=${-p}$、$${-q}$`, key: `43:${b}:${c}:${x0}:0`, easyCheck: false,
          easy: `分母 $${poly2(b, c)}=(s+${p})(s+${q})$`,
          verify: p0 => { const v = maths(p0.a).map(t => +t.replace(/^s=/, '')); return (v.length === 2 && v.every(s => near(s * s + b * s + c, 0)) && v[0] !== v[1]) || '分母が0にならない'; } };
      },
      // わな：X(s) を時間の関数にもどす → 9-54
      trap(r) {
        const [p, q] = r.pick(PQ43.filter(([u, v]) => v - u <= 3 && !(u === 1 && v === 3))), b = p + q, c = p * q, x0 = (q - p) * r.pick([1, 2]);
        const A = x0 * q / (q - p), B = -x0 * p / (q - p);
        return dest({ q: `$X=\\dfrac{${numer(x0, b * x0)}}{(s+${p})(s+${q})}$ を時間の関数 $x$ にもどした式`, a: `$x=${sum([cf(A, eT(-p)), cf(B, eT(-q))])}$`, key: `43t:${p}:${q}:${x0}`,
          calc: { kind: 'ode', x: 't', coef: [1, b, c], init: [[0, x0], [0, 0, 1]] } }, '9-43',
          '変換ではなく、もどす（逆変換）。かくす方法で部分分数に分けて表を逆に引く（第4部）', ['9-54']);
      },
    },
  });

  // ================================================================ 9-44 1階の式は「変換 → (s+a) でわる → A/s + B/(s+a)」
  // お湯：dT/dt = -k(T-Ta)、T(0)=T0 → T(s)=Ta/s+(T0-Ta)/(s+k)。RC：τV'+V=E、V(0)=0。RL：Li'+Ri=E、i(0)=0
  // 例 k=0.1、Ta=30、T0=90（10分後 約52.1℃）はよける（O-2）
  const E44 = { 1: '0.3679', 2: '0.1353', 0.5: '0.6065', 3: '0.0498' };
  function scene44(r, kind) {
    if (kind === 0) {   // お湯（分）
      const k = r.pick([0.05, 0.1, 0.2, 0.04, 0.02, 0.5]), Ta = r.pick([20, 25, 15, 30]), T0 = r.pick([60, 70, 80, 90, 95]);
      if (k === 0.1 && Ta === 30 && T0 === 90) return null;
      const x = r.pick([0.5, 1, 2]), t = x / k; if (!Number.isInteger(t)) return null;
      return { v: 'T', V: 'T(s)', eq: `\\dfrac{\\dd T}{\\dd t}=-${fmt(k)}(T-${Ta})`, init: `T(0)=${T0}`, A: Ta, B: T0 - Ta, a: k, coef: [1, k], rhs: String(k * Ta), y0: T0,
        when: `${t}分後`, t, x, unit: '℃', dig: 1, key: `44o:${k}:${Ta}:${T0}`, word: `$${T0}$℃のお湯を $${Ta}$℃の部屋に置く（$t$ は分）` };
    }
    if (kind === 1) {   // RC（秒）
      const tau = r.pick([0.5, 1, 2, 4, 5]), E = r.pick([5, 6, 10, 12]);
      const x = r.pick([0.5, 1, 2, 3]), t = x * tau;
      return { v: 'V', V: 'V(s)', eq: `${tau === 1 ? '' : fmt(tau)}\\dfrac{\\dd V}{\\dd t}+V=${E}`, init: 'V(0)=0', A: E, B: -E, a: 1 / tau, coef: [tau, 1], rhs: String(E), y0: 0,
        when: `${fmt(t)}秒後`, t, x, unit: 'V', dig: 2, key: `44c:${tau}:${E}`, word: `RC 回路（時定数 $${U(fmt(tau), 's')}$、電池 $${U(E, 'V')}$）のコンデンサーの電圧 $V$〔V〕` };
    }
    // RL（秒）
    const [L, R] = r.pick([[0.5, 10], [0.2, 4], [0.3, 3], [0.1, 10], [1, 5], [0.5, 5]]), E = r.pick([6, 10, 12, 20]);
    const a = R / L, I = E / R; if (!Number.isInteger(a) || Math.abs(I * 100 - Math.round(I * 100)) > 1e-9) return null;
    const x = r.pick([0.5, 1, 2]), t = x / a; if (Math.abs(t * 1000 - Math.round(t * 1000)) > 1e-9) return null;
    return { v: 'i', V: 'I(s)', eq: `${fmt(L)}\\dfrac{\\dd i}{\\dd t}+${R}i=${E}`, init: 'i(0)=0', A: I, B: -I, a, coef: [L, R], rhs: String(E), y0: 0,
      when: `${fmt(t)}秒後`, t, x, unit: 'A', dig: 2, key: `44l:${L}:${R}:${E}`, word: `RL 回路（$R=${U(R, '\\Omega')}$、$L=${U(fmt(L), 'H')}$、電池 $${U(E, 'V')}$）の電流 $i$〔A〕` };
  }
  const S44 = g => sumF([ft(g.A, 's'), ft(g.B, vpa('s', g.a))]);
  const T44 = g => `${g.v}=${sum([fmt(g.A), cf(g.B, eT(-g.a))])}`;
  const W44 = g => `${g.A}/s+(${g.B})/(s+${g.a})`;
  add({
    id: '9-44', part: 3, chap: '9-5 例題2〜4', stars: 1,
    title: '1階の式は「変換 → $(s+a)$ でわる → $\\dfrac{A}{s}+\\dfrac{B}{s+a}$」',
    mark: '冷めるお湯・RC・RL の充電。1回微分の式とはじめの値。',
    futsu: ['6-4 のように変数を分けて両辺を積分し、', '$\\ln$ をはずして、はじめの値から', '定数を決める'],
    raku: ['$\\dfrac{\\dd T}{\\dd t}=-0.1(T-30)$、$T(0)=90$', '→ $sT-90=-0.1T+\\dfrac3s$ → $T(s)=\\dfrac{30}{s}+\\dfrac{60}{s+0.1}$', '→ $T=30+60e^{-0.1t}$、10分後 約52.1℃（$e^{-1}=0.3679$）'],
    why: '辞書で1項ずつ書きかえる（微分は $sT(s)-T(0)$、定数 $c$ は $\\dfrac cs$。9-5 のやってみよう）。$T(s)$ の項を左に集めて $(s+a)$ でわり、$\\dfrac{c}{s(s+a)}$ を部分分数 $\\dfrac{A}{s}+\\dfrac{B}{s+a}$ に分ける（$s=0$、$s=-a$ を入れて係数を出す）。辞書を逆に引くと $A+Be^{-at}$。',
    caution: '右辺のかっこを外す（$-0.1(T-30)=-0.1T+3$。定数3は $\\dfrac3s$）。はじめの値 $T(0)$ をひき忘れない。係数のついた微分（$2\\dfrac{\\dd V}{\\dd t}$）は $2(sV-V(0))$。$e^{-1}$ などの値は文の4けたを使う。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '32mm', s2: '30mm', s3: '30mm', trap: '26mm' }, boxh: { s1: '12mm', s2: '9mm', s3: '9mm', trap: '12mm' },
    fits(q) { return (/\\dfrac\{\\dd [TVi]\}\{\\dd t\}/.test(q) || /RC 回路|RL 回路/.test(q)) && !/\\ddot/.test(q); },
    steps: {
      // T(s) を部分分数に分けた形
      s1(r) {
        const g = scene44(r, turn(r, '44s1', 3)); if (!g) return null;
        return { q: `$${g.eq}$、$${g.init}$ を変換し、部分分数に分けた $${g.V}$`, a: `$${S44(g)}$`, key: g.key, easyCheck: false,
          easy: `$s=0$、$s=${fmt(-g.a)}$ を入れて係数`,
          calc: { kind: 'fn', want: W44(g), vars: ['s'] } };
      },
      // 時間の世界の式と、ある時刻の約の値（4けたの e の値。くいちがう組はよける：O-4）
      s2(r) {
        const g = scene44(r, turn(r, '44s2', 3)); if (!g) return null;
        const ev0 = +E44[g.x], byText = g.A + g.B * ev0, truth = g.A + g.B * Math.exp(-g.x);
        if (byText.toFixed(g.dig) !== truth.toFixed(g.dig)) return null;
        if (g.key === '44o:0.1:30:90') return null;
        return { q: `$${g.eq}$、$${g.init}$ をラプラス変換で解いた $${g.v}$ ＝ □、${g.when}の値 ＝ 約 ${g.unit === '℃' ? '□℃' : `$□\\,\\mathrm{${g.unit}}$`}（$e^{-${fmt(g.x)}}=${E44[g.x]}$、小数第${g.dig}位まで）`,
          a: `$${T44(g)}$、約 $${byText.toFixed(g.dig)}$`, key: g.key, easyCheck: false,
          easy: `$${S44(g)}$ をもどす`,
          calc: { kind: 'ode', x: 't', coef: g.coef, rhs: g.rhs, init: [[0, g.y0]], ans: T44(g).split('=')[1] },
          verify: p => near(numOf(p.a, 1), +truth.toFixed(g.dig)) || '約の値がちがう' };
      },
      // 見かけがちがう：回路の部品から式を作る
      s3(r) {
        const g = scene44(r, peek(r, '44s3', 2) + 1); if (!g) return null;
        adv(r, '44s3', 2);
        return { q: `${g.word}は、はじめ0。ラプラス変換で求めた $${g.v}$`, a: `$${T44(g)}$`, key: g.key, easyCheck: false,
          easy: `$${g.eq}$ を変換：$${g.V}=${S44(g)}$`,
          calc: { kind: 'ode', x: 't', coef: g.coef, rhs: g.rhs, init: [[0, g.y0]] } };
      },
      // わな：2階の式の X(s) → 9-43
      trap(r) {
        const [p, q] = r.pick(PQ43), b = p + q, c = p * q, x0 = r.pick([1, 2]);
        return dest({ q: `$${odeT(b, c)}$、${init43(x0, 0)} を変換した $X(s)$`, a: `$${X43(b, c, x0, 0)}$`, key: `44t:${b}:${c}:${x0}`,
          calc: { kind: 'fn', want: W43(b, c, x0, 0), vars: ['s'] } }, '9-44',
          '2回微分の式。$\\ddot x$ は $s^2X-sx(0)-\\dot x(0)$（1階の形ではない）', ['9-43']);
      },
    },
  });

  // ================================================================ 9-45 フーリエ変換は L の s を jω にした所
  // f が t<0 で0、だんだん消える形のとき F(ω) = F(s)|_{s=jω}。例 L[e^{-3t}]=1/(s+3) → 1/(3+jω)、F(1)=(3-j)/10 はよける（O-2）
  const COND45 = '（$f$ は $t<0$ で0、だんだん消える形）';
  add({
    id: '9-45', part: 3, chap: '9-5⑧・9-6（もっと）', stars: 1,
    title: 'フーリエ変換は $\\mathcal L$ の $s$ を $j\\omega$ にした所',
    mark: '$\\mathcal L$ がわかっている形の $F(\\omega)$（$t<0$ で0、だんだん消える）。',
    futsu: ['$\\mathcal L$ から $f(t)$ にもどしてから、', '$-\\infty$〜$\\infty$ のフーリエ変換の積分を', 'やり直す'],
    raku: ['$\\mathcal L[e^{-3t}]=\\dfrac{1}{s+3}$', '→ $F(\\omega)=\\dfrac{1}{3+j\\omega}$', '$F(1)=\\dfrac{1}{3+j}=\\dfrac{3-j}{10}$'],
    why: '$f$ が $t<0$ で0なら、フーリエ変換の積分は0から $\\infty$ までになり、$e^{-j\\omega t}$ は $e^{-st}$ の $s$ を $j\\omega$ にしたもの（9-5⑧）。だんだん消える形なら $s=j\\omega$ でも積分が有限なので、$F(\\omega)$ は $\\mathcal L$ の式に $s=j\\omega$ を入れるだけ。$F(0)$ は $s=0$ を入れた値。',
    caution: '$t<0$ でも0でない形（$e^{-a\\lvert t\\rvert}$）や、ふえ続ける形（$e^{2t}$）には使えない。$s^2$ は $(j\\omega)^2=-\\omega^2$。値は分母の共役をかけて $a+bj$ の形に。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '28mm', s3: '24mm', trap: '28mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm' },
    fits(q) { return (/\\mathcal L\[f\]=|\\mathcal L\[e\^/.test(q) && /フーリエ変換|F\(\\omega\)|F\([\d.]+\)/.test(q) || /フーリエ変換が \$F\(\\omega\)=.*\\mathcal L\[f\]\$/.test(q)) && !/定義の積分/.test(q); },
    steps: {
      s1(r) {
        const a = r.pick([1, 2, 4, 5, 0.5, 10]), c = r.pick([1, 1, 2, 3, 5]);
        return { q: `$\\mathcal L[f]=${ft(c, `s+${fmt(a)}`)}$${COND45}のとき、フーリエ変換 $F(\\omega)$`, a: `$${ft(c, ajw(a))}$`, key: `45:${a}:${c}`, easyCheck: false,
          easy: '$s$ を $j\\omega$ に', calc: { kind: 'fn', want: `${c}/(${a}+j*omega)`, vars: ['omega'] },
          verify: p => nearC(cnumOf(p.a, 0, { omega: 0.9 }), ftNum(t => c * Math.exp(-a * t), 0, 40 / a, 0.9, 20000), 1e-6) || '積分した値とちがう' };
      },
      s2(r) {
        const kind = turn(r, '45s2', 2);
        if (kind === 0) {   // 2次の分母：(s+k)/((s+p)(s+q))
          const [p, q] = r.pick(PQ43), k = r.pick([0, 1, 2, 3, 4, 5].filter(v => v !== p && v !== q)), m = r.pick([1, 2]);
          const num = k === 0 ? cf(m, 's') : `${cf(m, 's')}+${m * k}`, numJ = k === 0 ? cf(m, 'j\\omega') : `${m * k}+${cf(m, 'j\\omega')}`;
          return { q: `$\\mathcal L[f]=\\dfrac{${num}}{${poly2(p + q, p * q)}}$${COND45}のとき、フーリエ変換 $F(\\omega)$`, a: `$\\dfrac{${numJ}}{${p * q}-\\omega^2+${p + q}j\\omega}$`, key: `45b:${p}:${q}:${k}:${m}`, easyCheck: false,
            easy: '$s=j\\omega$、$(j\\omega)^2=-\\omega^2$',
            calc: { kind: 'fn', want: `(${m}*j*omega+${m * k})/((j*omega)^2+${p + q}*j*omega+${p * q})`, vars: ['omega'] } };
        }
        // 値：F(ω0) を a+bj の形で
        const [a, w] = r.pick([...PY, [1, 1], [2, 2], [4, 4], [1, 2], [2, 1]]), c = r.pick([1, 2, 5, 10]);
        if (a === 3) return null;   // 例の 1/(s+3)（O-2）
        const D = a * a + w * w, g = gcd(gcd(c * a, c * w), D), ans = D / g === 1 ? cT(c * a / g, -c * w / g) :`\\dfrac{${c * a / g}-${c * w / g === 1 ? '' : c * w / g}j}{${D / g}}`;
        return { q: `$\\mathcal L[f]=${ft(c, `s+${a}`)}$${COND45}のとき、$F(${w})$（$a+bj$ の形で）`, a: `$${ans}$`, key: `45v:${a}:${w}:${c}`, easyCheck: false,
          easy: `$\\dfrac{${c}}{${a}+${w === 1 ? '' : w}j}$ の分子と分母に $${a}-${w === 1 ? '' : w}j$ をかける`,
          verify: p => nearC(cnumOf(p.a), [c * a / D, -c * w / D]) || '値がちがう' };
      },
      // 見かけがちがう：F(0)、F(ω) から L へもどす
      s3(r) {
        if (peek(r, '45s3', 2) === 0) {
          const [p, q] = r.pick(PQ43), m = r.pick([1, 2, 3, 6, 12]), v = m / (p * q), f0 = toFr(v);
          adv(r, '45s3', 2);
          return { q: `$\\mathcal L[f]=\\dfrac{${m}}{(s+${p})(s+${q})}$${COND45}のとき、$F(0)$`, a: `$${frac(f0[0], f0[1])}$`, key: `45z:${p}:${q}:${m}`, easyCheck: false,
            easy: '$s=j\\omega$ で $\\omega=0$、つまり $s=0$ を入れる',
            verify: p0 => near(numOf(p0.a), ftNum(t => m * (Math.exp(-p * t) - Math.exp(-q * t)) / (q - p), 0, 60, 0, 30000)[0], 1e-6) || '面積とちがう' };
        }
        const a = r.pick([1, 2, 4, 5, 6]), c = r.pick([1, 2, 3, 4]);
        adv(r, '45s3', 2);
        return { q: `$t<0$ で0の、だんだん消える $f$ のフーリエ変換が $F(\\omega)=${ft(c, ajw(a))}$ のとき、$\\mathcal L[f]$`, a: `$${ft(c, `s+${a}`)}$`, key: `45i:${a}:${c}`, easyCheck: false,
          easy: '$j\\omega$ を $s$ にもどす', calc: { kind: 'fn', want: `${c}/(s+${a})`, vars: ['s'] } };
      },
      // わな：ふえ続ける形 → わざなし
      trap(r) {
        const a = r.pick([1, 2, 3, 0.5]);
        return dest({ q: `$t\\geqq0$ で $f=${eT(a)}$、$t<0$ で $f=0$ の波のフーリエ変換 $F(\\omega)$`, a: '求められない（積分が有限にならない）', key: `45t:${a}`,
          verify: p => /求められない/.test(p.a) || 'ことばがちがう' }, '9-45',
          `ふえ続ける形。$\\mathcal L[${eT(a)}]=\\dfrac{1}{s-${fmt(a)}}$ は $s>${fmt(a)}$ でしか使えないので、$s=j\\omega$ を入れてはいけない`);
      },
    },
  });

  // ================================================================ 9-93 くり返す波の F(ω) は ±nω0 の線
  // f = C + A cos ω1 t + B sin ω2 t → 線は ω=0 に C、±ω1 に A/2、±ω2 に B/2（sin の c は ω2 で -jB/2、-ω2 で jB/2）
  // 例 4cos100t+2sin300t（±100 に2、±300 に1）はよける（O-2）
  const W93 = [[50, 150], [100, 200], [10, 30], [20, 40], [200, 600], [50, 250], [100, 500], [30, 90]];
  function gen93(r, withC) {
    const [w1, w2] = r.pick(W93), A = r.pick([2, 3, 4, 6, 8, 10, 1]), B = r.pick([2, 4, 5, 6, 1, 3]), C = withC ? r.pick([1, 2, 3, 5]) : 0;
    if (w1 === 100 && w2 === 300) return null;
    if (A / 2 === 2 && B / 2 === 1) return null;   // 例と同じ高さの組
    const tx = sum([C ? fmt(C) : '', cf(A, `\\cos${w1}t`), cf(B, `\\sin${w2}t`)]);
    return { w1, w2, A, B, C, tx };
  }
  add({
    id: '9-93', part: 3, chap: '9-4⑪ 例題7', stars: 1,
    title: 'くり返す波の $F(\\omega)$ は、$\\pm n\\omega_0$ に立つ線（高さは $\\lvert c_n\\rvert$）',
    mark: 'いつまでもくり返す波（$\\cos$・$\\sin$ の和）の「スペクトルの線」（場合 F）。',
    futsu: ['$-\\infty$〜$\\infty$ のフーリエ変換の積分を', '有限の長さで切って計算し、', '長さをのばした先を調べる'],
    raku: ['$4\\cos100t+2\\sin300t$', '→ $\\omega=\\pm100$ に高さ2、$\\pm300$ に高さ1', '（$c_{\\pm1}=2$、$c_3=-j$、$c_{-3}=j$）'],
    why: 'くり返す波は、$-\\infty$〜$\\infty$ でたしても値が決まらない（9-4⑪）。9-3 の $c_n$ で表し、スペクトルは $\\pm n\\omega_0$ に立つ線。$a\\cos\\omega t$ は $\\pm\\omega$ に $\\dfrac a2$ ずつ、$b\\sin\\omega t$ は $\\omega$ に $-\\dfrac{b}{2}j$、$-\\omega$ に $\\dfrac b2j$（高さはどちらも $\\dfrac b2$）。定数は $\\omega=0$ の線。',
    caution: '線の高さは振幅の半分（正と負の周波数に分かれる）。$\\sin$ の $c$ は $-\\dfrac b2j$（$\\dfrac b2$ ではない）が、高さ（大きさ）は $\\dfrac b2$。定数の線は半分にしない。',
    counts: { s1: 4, s2: 3, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '28mm' }, boxh: { trap: '12mm' },
    fits(q) { return /両側スペクトル|線の高さ|の所の線/.test(q) && /\\cos|\\sin/.test(q) && !/e\^/.test(q); },
    steps: {
      s1(r) {
        const g = gen93(r, false); if (!g || !onceA(r, '93w', g.w1)) return null;   // 同じ角周波数ばかりにならないように
        return { q: `$f(t)=${g.tx}$ の両側スペクトルの線の高さ：$\\omega=\\pm${g.w1}$ ＝ □、$\\omega=\\pm${g.w2}$ ＝ □`, a: `$${fmt(g.A / 2)}$、$${fmt(g.B / 2)}$`, key: `93:${g.tx}`, easyCheck: false,
          easy: `振幅の半分：$\\dfrac{${g.A}}{2}$、$\\dfrac{${g.B}}{2}$`,
          verify: p => (near(numOf(p.a, 0), cAt(g, g.w1)[2]) && near(numOf(p.a, 1), cAt(g, g.w2)[2])) || '高さがちがう' };
      },
      s2(r) {
        const g = gen93(r, r.chance(0.5)); if (!g) return null;
        const at = r.pick([g.w2, -g.w2, g.w1, -g.w1, ...(g.C ? [0] : [])]), c = cAt(g, at);
        return { q: `$f(t)=${g.tx}$ の、$\\omega=${at}$ の所の線の値 $c$（複素数）`, a: `$${cT(c[0], c[1])}$`, key: `93:${g.tx}`, easyCheck: false,
          easy: at === 0 ? '定数はそのまま' : Math.abs(at) === g.w1 ? `$\\cos$ は $\\dfrac{${g.A}}{2}$` : `$\\sin$ は $${at > 0 ? '-' : ''}\\dfrac{${g.B}}{2}j$`,
          verify: p => nearC(cnumOf(p.a), [c[0], c[1]]) || '値がちがう' };
      },
      // 図：両側スペクトルの線（高さは文字）
      s3(r) {
        const g = gen93(r, false); if (!g || g.w2 > 3 * g.w1) return null;   // 図のはばが 60 mm に入るもの
        const fig = { s: g.w2 === 2 * g.w1 ? 4.4 : 5, items: M.stem([[-g.w2, g.B / 2, '$\\mathrm B$'], [-g.w1, g.A / 2, '$\\mathrm A$'], [g.w1, g.A / 2, '$\\mathrm A$'], [g.w2, g.B / 2, '$\\mathrm B$']], { x: '\\omega', h: 2.5, dx: 1.9 }) };
        return { q: `図は $f(t)=${g.tx}$ の両側スペクトル。線の高さ A ＝ □、B ＝ □`, a: `$${fmt(g.A / 2)}$、$${fmt(g.B / 2)}$`, key: `93:${g.tx}`, easyCheck: false, fig,
          easy: '振幅の半分',
          verify: p => (near(numOf(p.a, 0), g.A / 2) && near(numOf(p.a, 1), g.B / 2)) || '高さがちがう' };
      },
      // わな：1回だけのパルス（くり返さない）→ 9-31
      trap(r) {
        const a = r.pick([0.5, 1, 1.5, 3]), h = r.pick([1, 2, 3]);
        return dest({ q: `${pulseQ(a, h)}（1回だけ）の ${FW}`, a: `$${pulseF(a, h)}$`, key: `93t:${a}:${h}`,
          calc: { kind: 'fn', want: `2*${h}*sin(${a}*omega)/omega`, vars: ['omega'] } }, '9-93',
          'くり返さないので、線ではなく、すきまのない曲線のスペクトル。0でない区間の定積分', ['9-31']);
      },
    },
  });
  // 9-93 の検算：f を1周期で平均して c を出す（別の道すじ）。[実部, 虚部, 大きさ]
  function cAt(g, w) {
    const T = 2 * Math.PI / g.w1, n = 4000; let re = 0, im = 0;
    for (let k = 0; k < n; k++) { const t = T * k / n, f = g.C + g.A * Math.cos(g.w1 * t) + g.B * Math.sin(g.w2 * t); re += f * Math.cos(w * t); im -= f * Math.sin(w * t); }
    re /= n; im /= n; return [Math.abs(re) < 1e-9 ? 0 : re, Math.abs(im) < 1e-9 ? 0 : im, Math.hypot(re, im)];
  }
})(globalThis.MONDAI);

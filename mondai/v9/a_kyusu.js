/* 問題集 第9巻　第1部 波をたし合わせる：フーリエ級数（わざ 9-01〜9-15）　組 a
 * 書き方は v8/README.md（第8・9巻の手引き）→ v6/README.md・v5/README.md。文は教科書 第9巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 9-0・9-1 の数・ことば・記号にそろえる（周期・周波数〔Hz〕・角周波数〔rad/s〕、基本角周波数 $\omega_0=\dfrac{2\pi}{T}$（$\omega_n$ と書かない）、
 *   方形波・のこぎり波、係数 $a_n$・$b_n$・$\dfrac{a_0}{2}$（平均）、「かけて平均の2倍」、とびの所は左右の値の平均、熱の棒（$L=0.1\,\mathrm{m}$、
 *   $\alpha(\frac{\pi}{L})^2=0.0987$）、弦の $f_n=\dfrac{nc}{2L}$）。用字は「おそい」「はかる」（W-13）。
 * 答え：$\pi$ を残した形（$\dfrac{12}{n\pi}$）。係数は「奇数なら □、偶数なら □」の2つの欄（W-3）。近似の答えは「約」と ≈、使う値とけたを文に（W-2：教科書の4けた）。
 * 検算：定積分は calc（defint）、係数の式は verify(p) で $n=1$〜6 の値をくらべる（問題を作った式とは別の道すじ：区間ごとの数の積分）。近似の値は agree（O-4）。
 * 図はステップ3だけ（K-2）：9-07 は0と $A$ の方形の信号、9-08 はとびのある波形（G.pw）。表は 9-02 のステップ3（表計算の画面）。
 * 左ページの「楽な形」の例の数・答えは、同じ見開きの問題に出さない（O-2・S-2・U-2。EXANS と各ステップのよけ）。1つのステップに同じ答えを3つ以上出さない（U-3。add）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7・U-4）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const r9 = v => Math.round(v * 1e9) / 1e9;
  const nf = v => { const s = String(+(+r9(v)).toFixed(9)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const par = v => (String(v).startsWith('-') ? `(${v})` : String(v));
  const pn = v => par(nf(v));
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const decs = v => { const s = nf(v); return s.includes('.') ? s.split('.')[1].length : 0; };
  const PI = Math.PI;
  // 小数第 k 位で四捨五入した文字
  const rd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-9) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  // 文の値で計算した値 a と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4・S-3）。ちがえば null。けたの境（…5）に近いものも出さない
  const agree = (a, v, k) => { const s = rd(a, k); if (s !== rd(v, k)) return null; const w = Math.abs(a) * 10 ** k, u = Math.abs(v) * 10 ** k; if (Math.abs(w - Math.floor(w) - 0.5) < 0.03 || Math.abs(u - Math.floor(u) - 0.5) < 0.03) return null; return s; };
  // 分数 n/d（約分）。d は正
  const red = (n, d) => { const g = gcd(n, d); return [n / g * Math.sign(d), Math.abs(d) / g]; };
  // c/(d·X) の TeX（X は '\\pi'・'n\\pi'・'n' など。c・d は整数）。c=0 なら 0
  function fracX(c, d, X) {
    if (c === 0) return '0';
    const [n0, d0] = red(c, d), sg = n0 < 0 ? '-' : '', a = Math.abs(n0);
    const den = (d0 === 1 ? '' : d0) + (X || '');
    if (!den) return sg + a;
    return `${sg}\\dfrac{${a}}{${den}}`;
  }
  // 有理数 q（[n, d]）× X の TeX（X が分子：'\\pi' なら 3\pi・\dfrac{3\pi}{4}）
  function fracNum(n, d, X) {
    if (n === 0) return '0';
    const [n0, d0] = red(n, d), sg = n0 < 0 ? '-' : '', a = Math.abs(n0), num = (a === 1 && X ? '' : a) + (X || '');
    return d0 === 1 ? sg + num : `${sg}\\dfrac{${num}}{${d0}}`;
  }
  // 小数 v を分数に（分母は 2・5 のべきと、1000 まで）
  function toFr(v) { for (let d = 1; d <= 2000; d++) { const n = Math.round(v * d); if (Math.abs(n - v * d) < 1e-9) return red(n, d); } return null; }

  // ---------------------------------------------------------------- 答えの読み方と検算の部品
  const nums = (a, vars) => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, ''), vars));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol || 1e-9)) || `答え ${p.a} が ${nf(v)} でない`; };
  // 「奇数 $…$、偶数 $…$」の答え（n の式）を、正しい関数 g(n) と n=1〜6 でくらべる
  const oddEvenIs = (p, g, tol) => {
    const m = String(p.a).match(/奇数\s*(\$[^$]*\$).*偶数\s*(\$[^$]*\$)/);
    if (!m) return `答え ${p.a} が「奇数 …、偶数 …」の形でない`;
    for (let n = 1; n <= 6; n++) { const v = ev(strip(m[n % 2 ? 1 : 2]), { n }), w = g(n); if (!(near(v, w, tol || 1e-7) || (Math.abs(w) < 1e-7 && Math.abs(v) < 1e-12))) return `n=${n} で ${v} と ${w} がちがう`; }
    return true;
  };
  // n の式の答え（1つ）を、g(n) と n=1〜6 でくらべる
  const nExprIs = (p, g, tol) => { for (let n = 1; n <= 6; n++) { const v = nums(p.a, { n })[0], w = g(n); if (!(near(v, w, tol || 1e-7) || (Math.abs(w) < 1e-7 && Math.abs(v) < 1e-12))) return `n=${n} で ${v} と ${w} がちがう`; } return true; };
  // 数の積分（シンプソン。区間をこまかく）：問題を作った式とは別の道すじの検算
  function integ(f, a, b, N) { N = N || 2000; const h = (b - a) / N; let s = f(a) + f(b); for (let k = 1; k < N; k++) s += (k % 2 ? 4 : 2) * f(a + k * h); return s * h / 3; }
  // 周期 2π の区間ごとの関数 pieces = [[a, b, f(t)], …] の係数（数の積分で）
  const bnNum = (pcs, n) => pcs.reduce((s, [a, b, f]) => s + integ(t => f(t) * Math.sin(n * t), a, b, 2000), 0) / PI;
  const anNum = (pcs, n) => pcs.reduce((s, [a, b, f]) => s + integ(t => f(t) * Math.cos(n * t), a, b, 2000), 0) / PI;
  // 区間ごとの関数（周期 2π）の値と、係数を数の積分で出した級数の和（N 項まで）：とびの所の値の検算
  const fAt = (pcs, t) => { const u = ((t % (2 * PI)) + 2 * PI) % (2 * PI), lo = Math.min(...pcs.map(x => x[0])); const v = u < lo ? u + 2 * PI : u >= lo + 2 * PI ? u - 2 * PI : u; const pc = pcs.find(([a, b]) => v > a && v < b); return pc ? pc[2](v) : NaN; };
  // 係数の式（区間ごとに積分して出した形）から級数を N 項たした値：とびの所・なめらかな所の値の検算（左右の平均とは別の道すじ）
  const fsCF = (c0, an, bn, t, N) => { let s = c0; for (let n = 1; n <= (N || 20000); n++) s += an(n) * Math.cos(n * t) + bn(n) * Math.sin(n * t); return s; };
  const sq1 = (A, B) => n => (n % 2 ? 2 * (A - B) / (n * PI) : 0);   // 前半 A・後半 B の b_n
  const z0 = () => 0;

  // ---------------------------------------------------------------- 同じ答えを出しすぎない（U-3）・左ページの例をよける（O-2）
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  const normA = a => String(a).replace(/\s|\\,|\\ |\\mathrm\{[^}]*\}/g, '').replace(/\\dfrac/g, '\\frac');
  const exNorm = s => normA(String(s).replace(/^約\s*/, '').replace(/\$/g, ''));
  // 左ページの例（楽な形）の答え。ステップ1〜3の答えに出さない
  const EXANS = {
    '9-01': ['4', '1.36', '20', '250', '50'],
    '9-02': ['1.384', '0.707', '45', '90', '135'],
    '9-03': ['200\\pi', '300', '600\\pi', '180', '100'],
    '9-04': ['\\frac{52}{15\\pi}', '1.103', '\\frac{13}{15}'],
    '9-05': ['100', '100n\\pi', '1'],
    '9-06': ['\\frac{12}{n\\pi}'],
    '9-07': ['2', '4', '\\frac{8}{n\\pi}'],
    '9-08': ['3'],
    '9-09': ['\\frac{2\\pi(-1)^{n+1}}{n}', '\\frac{2(-1)^{n+1}}{n}'],
    '9-10': ['3\\pi', '-\\frac{6}{n}', '\\pi', '-\\frac{2}{n}'],
    '9-11': ['3', '3.82', '1.27', '\\frac{12}{\\pi}'],
    '9-12': ['\\frac{\\pi}{4}'],
    '9-13': ['0.78', '0.28', '28', '7'],
    '9-14': ['23.7', '\\frac{200}{\\pi}', '63.66'],
    '9-15': ['200', '600', '400'],
  };
  function add(def) {
    const ex = new Set((EXANS[def.id] || []).map(exNorm));
    for (const k of ['s1', 's2', 's3', 'trap']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => {
        const p = f(r); if (!p) return p;
        if (k !== 'trap' && (ex.has(exNorm(p.a)) || (p.exKeys || []).some(x => ex.has(exNorm(x))))) return null;
        return ansOK(r, def.id + k, normA(p.ans || p.a), 2, p.key || p.q) ? p : null;
      };
    }
    M.add(def);
  }

  // ---------------------------------------------------------------- わなの行き先（N-3・S-7・U-4）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(9).filter(id => {
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

  // ================================================================ 9-01
  // 周期（ms）が短い小数になる周波数（例の 250 Hz・50 Hz はよける）
  const FQ01 = [10, 20, 25, 40, 80, 100, 125, 160, 200, 320, 400, 500, 625, 800, 1000, 1250, 2000, 2500];
  // 音の速さ 340 m/s で波長が短い小数になる周波数、水の中 1500 m/s
  const AIR01 = [100, 125, 170, 200, 340, 400, 425, 500, 680, 800, 850, 1000, 1700, 2000];
  const WAT01 = [300, 500, 750, 1000, 1500, 2000, 3000, 6000];
  add({
    id: '9-01', part: 1, chap: '9-0①③', stars: 1,
    title: '周期は「1000÷周波数」ms、波長は「速さ×周期」',
    mark: '周波数（Hz）と周期、音の波長。',
    futsu: ['周期 $\\dfrac{1}{250}$ s を小数 0.004 s に', 'してから1000倍して ms に直す。', '波長は $340\\times\\dfrac{1}{250}$ を', '分数のまま計算する。'],
    raku: ['$250\\,\\mathrm{Hz}$ → $1000\\div250=4$（ms）', '波長 $340\\times0.004=1.36$（m）', '$50\\,\\mathrm{Hz}$ の交流 → $1000\\div50=20$（ms）'],
    why: '周波数は1秒にふるえる回数なので、1回分の時間（周期）は「1÷周波数」秒。1秒は $1000\\,\\mathrm{ms}$ だから、ms では「1000÷周波数」になる。1周期の間に、波は「速さ×周期」だけ進む。これが波長（こい所から次のこい所まで。9-0①）。',
    caution: 'ms のまま速さ（m/s）にかけない（$340\\times4$ は1000倍ちがう）。秒に直してから（$4\\,\\mathrm{ms}=0.004\\,\\mathrm{s}$）。1秒に進む角（角周波数 $2\\pi f$〔rad/s〕）は、周期とは別のもの（わざ 9-03）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /(周期（ms）|波長（m）|の周波数（Hz）|周期は)/.test(q) && !/成分|番め|角周波数|倍音|弦|方形波|rad/.test(q); },
    steps: {
      s1(r) {
        const f = r.pick(FQ01), T = 1000 / f;
        if (turn(r, '01s1', 2) === 0) return { q: `${U(f, 'Hz')} の音の周期（ms）`, a: `$${nf(T)}$`, key: `f|${f}`, easy: `$1000\\div${f}=${nf(T)}$`, verify: p => valIs(p, 1 / f * 1000) };
        return { q: `周期 ${U(nf(T), 'ms')} の音の周波数（Hz）`, a: `$${f}$`, key: `f|${f}`, easy: `$1000\\div${nf(T)}=${f}$`, verify: p => valIs(p, 1 / (T / 1000)) };
      },
      s2(r) {
        const k = turn(r, '01s2', 3);
        if (k === 0) {
          const f = r.pick(AIR01), T = 1000 / f, lam = r9(340 * T / 1000);
          if (decs(T) > 3) return null;
          return { q: `${U(f, 'Hz')} の音（速さ ${U(340, 'm/s')}）の波長（m）`, a: `$${nf(lam)}$`, key: `air|${f}`,
            easy: `周期 $1000\\div${f}=${nf(T)}$ ms。$340\\times${nf(T / 1000)}=${nf(lam)}$`, easyCheck: 'last', verify: p => valIs(p, 340 / f) };
        }
        if (k === 1) {
          const f = r.pick(WAT01), T = 1000 / f, lam = r9(1500 * T / 1000);
          if (decs(T) > 3) return null;
          return { q: `水の中を速さ ${U(1500, 'm/s')} で進む ${U(f, 'Hz')} の音の波長（m）`, a: `$${nf(lam)}$`, key: `wat|${f}`,
            easy: `周期 $1000\\div${f}=${nf(T)}$ ms。$1500\\times${nf(T / 1000)}=${nf(lam)}$`, easyCheck: 'last', verify: p => valIs(p, 1500 / f) };
        }
        const f = r.pick(AIR01.filter(x => x !== 250)), lam = r9(340 / f), T = 1000 / f;
        if (decs(T) > 3) return null;
        return { q: `速さ ${U(340, 'm/s')}、波長 ${U(nf(lam), 'm')} の音の周波数（Hz）`, a: `$${f}$`, key: `air|${f}`,
          easy: `周期は $${nf(lam)}\\div340=${nf(T / 1000)}$ s $=${nf(T)}$ ms。$1000\\div${nf(T)}=${f}$`, easyCheck: 'last', verify: p => valIs(p, 340 / lam) };
      },
      // 見かけがちがう：kHz・MHz（電波）
      s3(r) {
        if (turn(r, '01s3', 2) === 0) {
          const fk = r.pick([2, 4, 5, 8, 10, 16, 20, 1.25, 2.5]), T = 1 / fk;
          return { q: `${U(nf(fk), 'kHz')} の音の周期（ms）`, a: `$${nf(T)}$`, key: `f|${fk * 1000}`, easy: `$${nf(fk)}\\,\\mathrm{kHz}=${nf(fk * 1000)}\\,\\mathrm{Hz}$。$1000\\div${nf(fk * 1000)}=${nf(T)}$`, easyCheck: 'last', verify: p => valIs(p, 1000 / (fk * 1000)) };
        }
        const fm = r.pick([50, 60, 75, 80, 100, 120, 150, 300, 600]), lam = r9(300 / fm);
        return { q: `${U(fm, 'MHz')} の電波（速さ ${U('3.0\\times10^8', 'm/s')}）の波長（m）`, a: `$${nf(lam)}$`, key: `M|${fm}`,
          easy: `周期 $\\dfrac{1}{${fm}\\times10^6}$ s。$3.0\\times10^8\\div(${fm}\\times10^6)=${nf(lam)}$`, easyCheck: 'last', verify: p => valIs(p, 3e8 / (fm * 1e6)) };
      },
      // わな：角周波数（9-03）
      trap(r) {
        const f = r.pick([440, 500, 200, 400, 1000, 60, 800]);
        return dest({ q: `${U(f, 'Hz')} の音の角周波数（rad/s）`, a: `$${2 * f}\\pi$`, key: `w|${f}`, verify: p => valIs(p, 2 * PI * f) }, '9-01',
          `周期ではなく、1秒に進む角を聞いている。1回で $2\\pi$ 進むので $2\\pi\\times${f}=${2 * f}\\pi$`, ['9-03']);
      },
    },
  });

  // ================================================================ 9-02
  const S02 = { 0: '0', 30: '0.5', 45: '0.707', 60: '0.866', 90: '1', 120: '0.866', 135: '0.707', 150: '0.5', 180: '0', 210: '-0.5', 225: '-0.707', 240: '-0.866', 270: '-1', 300: '-0.866', 315: '-0.707', 330: '-0.5' };
  const sinD = d => Math.sin(d * PI / 180);
  const need02 = d => ({ 45: 45, 135: 45, 225: 45, 315: 45, 60: 60, 120: 60, 240: 60, 300: 60 }[((d % 360) + 360) % 360]);
  const sv02 = d => +S02[((d % 360) + 360) % 360];
  // 周波数 f の成分が、時刻 t（ms）に進む角（度）。t は短い小数になる時刻だけ
  function pickT02(r, f, angs) {
    const T = 1000 / f, d = r.pick(angs), t = r9(T * d / 360);
    return decs(t) <= 3 && t > 0 ? [t, d] : null;
  }
  const valTxt = d => `$\\sin${d}^{\\circ}=${S02[d]}$`;
  const EX02 = new Set(['500|0.25', '1000|0.25', '1500|0.25']);
  add({
    id: '9-02', part: 1, chap: '9-0②', stars: 1,
    title: '成分の値は「時刻が周期の何分のいくつか」で角を出す',
    mark: '表計算の式 `=B$2*SIN(2*PI()*B$1*$A3/1000)`、時刻（ms）と成分。',
    futsu: ['$2\\pi ft$ をラジアンのまま計算し', '（$2\\times3.14\\times500\\times0.00025$）、', 'その $\\sin$ を電卓で出す。'],
    raku: ['$t=0.25\\,\\mathrm{ms}$、500・1000・1500 Hz', '（周期 2・1・0.667 ms、大きさ 1・0.5・0.25）', '→ $\\dfrac18$・$\\dfrac14$・$\\dfrac38$ 周で $45^{\\circ}$・$90^{\\circ}$・$135^{\\circ}$', '→ $0.707+0.5+0.25\\times0.707\\approx1.384$'],
    why: '1周期で角は $360^{\\circ}$（$2\\pi$）進む。だから、時刻 $t$ が周期の $\\dfrac{t}{T}$ にあたるなら、角は $360^{\\circ}\\times\\dfrac{t}{T}$。表計算の `2*PI()*B$1*$A3/1000` も、この角をラジアンで出しているだけ（9-0②）。成分の値は「大きさ×$\\sin$（角）」で、たし合わせた音は、その和。',
    caution: '時刻の ms を秒に直し忘れない（周期も ms でそろえれば、わり算だけでよい）。2倍・3倍の周波数の成分は、同じ時刻で角も2倍・3倍。$360^{\\circ}$ をこえたら $360^{\\circ}$ をひく。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '16mm', s3: '16mm', trap: '14mm' },
    fits(q) { return /時刻.*(進む角|での値)|SIN\(|の和の、時刻/.test(q) && !/周期（ms）|級数|方形波|まん中/.test(q); },
    steps: {
      s1(r) {
        const f = r.pick([125, 250, 500, 750, 1000, 1500, 2000]);
        if (turn(r, '02s1', 2) === 0) {
          const g = pickT02(r, f, [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]); if (!g) return null;
          const [t, d] = g; if (EX02.has(`${f}|${t}`)) return null;
          return { q: `${U(f, 'Hz')} の $\\sin$ の成分が、時刻 ${U(nf(t), 'ms')} までに進む角（°）`, a: `$${d}$`, key: `ft|${f}|${t}`,
            easy: `周期 $${nf(1000 / f)}$ ms の $\\dfrac{${red(Math.round(d), 360)[0]}}{${red(Math.round(d), 360)[1]}}$。$360\\times${nf(t)}\\div${nf(1000 / f)}=${d}$`, easyCheck: 'last',
            verify: p => valIs(p, 2 * PI * f * t / 1000 * 180 / PI, 1e-9) };
        }
        const g = pickT02(r, f, [30, 90, 150, 210, 270, 330]); if (!g) return null;
        const [t, d] = g, A = r.pick([2, 3, 4, 0.5, 0.25, 5]), v = r9(A * sv02(d));
        if (EX02.has(`${f}|${t}`)) return null;
        return { q: `大きさ $${nf(A)}$、${U(f, 'Hz')} の $\\sin$ の成分の、時刻 ${U(nf(t), 'ms')} での値`, a: `$${nf(v)}$`, key: `ft|${f}|${t}`,
          easy: `角は $${d}^{\\circ}$。$${nf(A)}\\times${pn(sv02(d))}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, A * Math.sin(2 * PI * f * t / 1000)) };
      },
      // 2つの成分の和（基本と2倍・3倍）
      s2(r) {
        const f1 = r.pick([125, 250, 500, 1000]), m = r.pick([2, 3]), f2 = m * f1;
        const g = pickT02(r, f1, [30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330]); if (!g) return null;
        const [t, d1] = g, d2 = (m * d1) % 360, A1 = r.pick([1, 2]), A2 = r.pick([0.5, 1, 0.25]);
        if (EX02.has(`${f1}|${t}`) || d2 === 0 || d2 === 180) return null;
        const needs = [...new Set([need02(d1), need02(d2)].filter(Boolean))];
        const sum = A1 * sv02(d1) + A2 * sv02(d2), tru = A1 * sinD(d1) + A2 * sinD(d2);
        let a, ap = false;
        if (!needs.length) a = nf(sum);
        else { a = agree(sum, tru, 3); if (a == null) return null; ap = true; }
        const hint = needs.length ? `（${needs.map(valTxt).join('、')}。小数第3位まで）` : '';
        return { q: `大きさ $${A1}$ の ${U(f1, 'Hz')} と、大きさ $${nf(A2)}$ の ${U(f2, 'Hz')} の $\\sin$ の成分の和の、時刻 ${U(nf(t), 'ms')} での値${hint}`, a: ap ? `約 $${a}$` : `$${a}$`, key: `sum|${d1}|${d2}|${A1}|${A2}`,
          easy: `角は $${d1}^{\\circ}$ と $${d2}^{\\circ}$。$${nf(A1)}\\times${pn(sv02(d1))}+${nf(A2)}\\times${pn(sv02(d2))}${ap ? '\\approx' : '='}${a}$`, easyCheck: false,
          verify: p => valIs(p, ap ? +rd(tru, 3) : tru, 1e-9) };
      },
      // 見かけがちがう：表計算の画面（3つの成分）・ラジアンの式の成分
      s3(r) {
        if (turn(r, '02s3', 2) === 1) {
          const f = r.pick([125, 250, 500, 1000]), g = pickT02(r, f, [30, 90, 150, 210, 270, 330]); if (!g) return null;
          const [t, d] = g, A = r.pick([2, 3, 4, 10]), v = r9(A * sv02(d));
          if (EX02.has(`${f}|${t}`)) return null;
          return { q: `成分 $${A}\\sin${2 * f}\\pi t$（$t$ は秒）の、時刻 ${U(nf(t), 'ms')} での値`, a: `$${nf(v)}$`, key: `ft|${f}|${t}`,
            easy: `${U(f, 'Hz')}、周期 $${nf(1000 / f)}$ ms の成分。角は $${d}^{\\circ}$。$${A}\\times${pn(sv02(d))}=${nf(v)}$`, easyCheck: 'last',
            verify: p => valIs(p, A * Math.sin(2 * f * PI * t / 1000)) };
        }
        const f1 = r.pick([125, 250, 500, 1000]), As = [1, r.pick([0.5, 1]), r.pick([0.25, 0.5])];
        const g = pickT02(r, f1, [30, 45, 60, 90, 120, 135, 150, 210, 240, 270, 300, 330]); if (!g) return null;
        const [t, d1] = g; if (EX02.has(`${f1}|${t}`)) return null;
        const ds = [d1, (2 * d1) % 360, (3 * d1) % 360], needs = [...new Set(ds.map(need02).filter(Boolean))];
        if (needs.length > 2) return null;
        const sum = ds.reduce((s, d, k) => s + As[k] * sv02(d), 0), tru = ds.reduce((s, d, k) => s + As[k] * sinD(d), 0);
        let a, ap = false;
        if (!needs.length) a = nf(sum); else { a = agree(sum, tru, 3); if (a == null) return null; ap = true; }
        if (a === '1.384') return null;
        const hint = needs.length ? `（${needs.map(valTxt).join('、')}。小数第3位まで）` : '';
        return { q: `表計算で、B3 に \`=B$2*SIN(2*PI()*B$1*$A3/1000)\` を入れて D3 までコピーし、E3 に3つの和を出した。E3 の（ア）${hint}`, a: ap ? `約 $${a}$` : `$${a}$`, key: `tab|${f1}|${t}`,
          table: { sheet: true, rows: [['$t$＼Hz', String(f1), String(2 * f1), String(3 * f1), '合計'], ['大きさ', ...As.map(nf), ''], [nf(t), '', '', '', '（ア）']] },
          easy: `角は $${ds.map(d => d + '^{\\circ}').join('$、$')}$。$${ds.map((d, k) => `${nf(As[k])}\\times${pn(sv02(d))}`).join('+')}${ap ? '\\approx' : '='}${a}$`, easyCheck: false,
          verify: p => valIs(p, ap ? +rd(tru, 3) : tru, 1e-9) };
      },
      // わな：たした音の周期（9-01）
      trap(r) {
        const f0 = r.pick([125, 200, 250, 400, 500]);
        return dest({ q: `${f0}・${2 * f0}・${3 * f0} Hz の3つの $\\sin$ の成分をたした音の周期（ms）`, a: `$${nf(1000 / f0)}$`, key: `per|${f0}`, verify: p => valIs(p, 1000 / f0) }, '9-02',
          `時刻の値ではなく、くり返す時間を聞いている。2倍・3倍の成分は基本の1周期にちょうど2回・3回くり返すので、周期は基本の $1000\\div${f0}=${nf(1000 / f0)}$`, ['9-01']);
      },
    },
  });

  // ================================================================ 9-03
  const T03 = [0.001, 0.002, 0.004, 0.005, 0.02, 0.025, 0.04, 0.05, 0.1, 0.2, 0.5];
  const piTxt = k => `${k === 1 ? '' : nf(k)}\\pi`;
  add({
    id: '9-03', part: 1, chap: '9-1④', stars: 1,
    title: '基本角周波数 $\\omega_0=\\dfrac{2\\pi}{T}$、$n$ 番めの成分は $n\\omega_0$',
    mark: '周期 $T$・Hz、「3番めの成分」。',
    futsu: ['$n$ 番めの成分の式 $\\sin n\\omega_0t$ を', '書き出してから、$\\omega_0$ を出し直し、', '$2\\pi$ でわって周波数にもどす。'],
    raku: ['周期 $T=0.01\\,\\mathrm{s}$（100 Hz）→ $\\omega_0=200\\pi$', '3番め → 300 Hz、$600\\pi$ rad/s', '（$\\omega_3$ とは書かない）', '60 Hz の方形波 → 180 Hz・300 Hz の成分'],
    why: '1周期 $T$ のあいだに角がちょうど $2\\pi$ 進むように、1秒に進む角を $\\omega_0=\\dfrac{2\\pi}{T}$ とする（基本角周波数。9-1④）。$n$ 番めの成分 $\\sin n\\omega_0t$ は、角周波数も周波数も基本の $n$ 倍。周波数（Hz）と角周波数（rad/s）は $2\\pi$ 倍ちがう。',
    caution: '$n$ 番めの角周波数を $\\omega_n$ と書かない（$\\omega_{\\mathrm n}$ はばねの固有角振動数で別のもの）。Hz と rad/s のどちらを聞いているかを見る。方形波には奇数番の成分だけがある（偶数番は0）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '18mm',
    fits(q) { return /角周波数|番めの成分の周波数|何番めの成分|成分のうち/.test(q) && !/大きさ|係数|\$[ab]_|半分|温度|弦|倍音|消える/.test(q); },
    steps: {
      s1(r) {
        if (turn(r, '03s1', 2) === 0) {
          const T = r.pick(T03), w = r9(2 / T);
          return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波の基本角周波数 $\\omega_0$（rad/s）`, a: `$${piTxt(w)}$`, key: `T|${T}`,
            easy: `$\\dfrac{2\\pi}{${nf(T)}}=${piTxt(w)}$`, verify: p => valIs(p, 2 * PI / T) };
        }
        const f = r.pick([25, 40, 50, 120, 200, 250, 400, 500, 1000]);
        return { q: `${U(f, 'Hz')} でくり返す波の基本角周波数 $\\omega_0$（rad/s）`, a: `$${piTxt(2 * f)}$`, key: `f|${f}`,
          easy: `周期 $\\dfrac{1}{${f}}$ s。$2\\pi\\div\\dfrac{1}{${f}}=${piTxt(2 * f)}$`, easyCheck: 'last', verify: p => valIs(p, 2 * PI * f) };
      },
      s2(r) {
        const k = turn(r, '03s2', 3), n = r.int(2, 7);
        if (k === 0) {
          const T = r.pick(T03), f = r9(n / T);
          return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波の、${n}番めの成分の周波数（Hz）`, a: `$${nf(f)}$`, key: `Tf|${T}|${n}`,
            easy: `基本は $1\\div${nf(T)}=${nf(1 / T)}$ Hz。その ${n} 倍で $${nf(f)}$`, easyCheck: 'last', verify: p => valIs(p, n / T) };
        }
        if (k === 1) {
          const T = r.pick(T03), w = r9(2 * n / T);
          return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波の、${n}番めの成分の角周波数（rad/s）`, a: `$${piTxt(w)}$`, key: `Tw|${T}|${n}`,
            easy: `$\\omega_0=${piTxt(r9(2 / T))}$。$${n}\\omega_0=${piTxt(w)}$`, easyCheck: 'last', verify: p => valIs(p, n * 2 * PI / T) };
        }
        const w0 = r.pick([20, 40, 100, 120, 400, 1000]), f = r9(n * w0 / 2);
        return { q: `基本角周波数 $\\omega_0=${w0}\\pi\\,\\mathrm{rad/s}$ の波の、${n}番めの成分の周波数（Hz）`, a: `$${nf(f)}$`, key: `wf|${w0}|${n}`,
          easy: `$${n}\\omega_0=${n * w0}\\pi$ を $2\\pi$ でわって $${nf(f)}$`, easyCheck: 'last', verify: p => valIs(p, n * w0 * PI / (2 * PI)) };
      },
      // 見かけがちがう：式の中の角周波数から番号・周期、方形波の成分
      s3(r) {
        const k = turn(r, '03s3', 3);
        if (k === 0) {
          const f = r.pick([25, 50, 100, 200, 250]), n = r.int(3, 9), w = 2 * n * f;
          return { q: `${U(f, 'Hz')} でくり返す波の成分 $\\sin${w}\\pi t$ は、何番めの成分か`, a: `$${n}$`, key: `n|${f}|${n}`,
            easy: `$\\omega_0=${2 * f}\\pi$。$${w}\\pi\\div${2 * f}\\pi=${n}$`, easyCheck: 'last', verify: p => valIs(p, w * PI / (2 * PI * f)) };
        }
        if (k === 1) {
          const w0 = r.pick([40, 50, 100, 250, 400, 500, 1000, 2000]), T = r9(2000 / w0);
          return { q: `基本角周波数 $\\omega_0=${w0}\\pi\\,\\mathrm{rad/s}$ の波の周期（ms）`, a: `$${nf(T)}$`, key: `T|${nf(2 / w0)}`,
            easy: `$T=\\dfrac{2\\pi}{${w0}\\pi}=${nf(2 / w0)}$ s $=${nf(T)}$ ms`, easyCheck: 'last', verify: p => valIs(p, 2 * PI / (w0 * PI) * 1000) };
        }
        const f = r.pick([40, 50, 120, 200, 400, 500, 1000]), which = r.pick([2, 3]), fz = (2 * which - 1) * f;
        return { q: `${U(f, 'Hz')} の方形波にふくまれる成分のうち、${which}番めに低い周波数（Hz）`, a: `$${fz}$`, key: `sq|${f}|${which}`,
          easy: `方形波は奇数番だけ。${2 * which - 1}番めで $${2 * which - 1}\\times${f}=${fz}$`, easyCheck: 'last', verify: p => valIs(p, (2 * which - 1) * f) };
      },
      // わな：方形波の係数（9-06）
      trap(r) {
        const f = r.pick([50, 100, 200, 500]), h = r.pick([1, 2, 3, 5]), n = r.pick([3, 5]);
        return dest({ q: `${U(f, 'Hz')}、高さ $${h}$ の方形波の、${n}番めの成分の大きさ（係数）`, a: `$${fracX(4 * h, n, '\\pi')}$`, key: `b|${f}|${h}|${n}`, verify: p => valIs(p, 4 * h / (n * PI)) }, '9-03',
          `周波数ではなく、成分の大きさを聞いている。方形波の係数 $\\dfrac{4h}{n\\pi}$ は周期によらないので、$${fracX(4 * h, n, '\\pi')}$`, ['9-06']);
      },
    },
  });

  // ================================================================ 9-04
  // 有理数の和（分数 [n, d]）
  const fAdd = (x, y) => red(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
  const fMul = (x, y) => red(x[0] * y[0], x[1] * y[1]);
  // 方形波の級数の N こめまでの「かっこの中」を、t（π の何倍か：[p, q] で t=pπ/q）で：∑ sin((2k+1)t)/(2k+1)。sin は 0・±1/2・±1 だけ
  function sqSum(N, tp, tq) {
    let s = [0, 1];
    for (let k = 0; k < N; k++) {
      const n = 2 * k + 1, ang = ((n * tp) % (2 * tq) + 2 * tq) % (2 * tq), x = Math.sin(ang * PI / tq), v = Math.round(x * 2) / 2;
      if (Math.abs(x - v) > 1e-9) return null;
      s = fAdd(s, red(Math.round(v * 2), 2 * n));
    }
    return s;
  }
  const SQ = h => `\\tfrac{${4 * h}}{\\pi}\\bigl(\\sin t+\\tfrac13\\sin3t+\\tfrac15\\sin5t+\\cdots\\bigr)`;
    const tTxt = (tp, tq) => (tp === 1 && tq === 1 ? '\\pi' : `\\dfrac{${tp === 1 ? '' : tp}\\pi}{${tq}}`);
  // 和 (4h/π)·S（S は分数）の TeX
  const sqVal = (h, S) => { const v = red(4 * h * S[0], S[1]); return fracX(v[0], v[1], '\\pi'); };
  const directSq = (h, N, t) => { let s = 0; for (let k = 0; k < N; k++) s += Math.sin((2 * k + 1) * t) / (2 * k + 1); return 4 * h / PI * s; };
  const H04 = [1, 2, 3, 5, 0.5, 1.5];
  const hOK = h => Number.isInteger(4 * h);
  add({
    id: '9-04', part: 1, chap: '9-1① 例題1', stars: 1,
    title: '方形波の部分和は、$t=\\dfrac{\\pi}{2}$ で $\\sin nt$ が $1,\\ -1,\\ 1,\\ \\cdots$ と交互',
    mark: '「3つめの項まででやめて」「$t=\\dfrac{\\pi}{2}$ での値」。',
    futsu: ['$\\sin\\dfrac{\\pi}{2}$、$\\sin\\dfrac{3\\pi}{2}$、$\\sin\\dfrac{5\\pi}{2}$ を', '1つずつ単位円で求めてから、', '$\\dfrac13$、$\\dfrac15$ をかけてたす。'],
    raku: ['$\\dfrac{4}{\\pi}\\Bigl(\\sin t+\\dfrac13\\sin3t+\\dfrac15\\sin5t\\Bigr)$ の $t=\\dfrac{\\pi}{2}$', '→ $1-\\dfrac13+\\dfrac15=\\dfrac{13}{15}$', '→ $\\dfrac{4}{\\pi}\\times\\dfrac{13}{15}=\\dfrac{52}{15\\pi}$（$\\dfrac{4}{\\pi}=1.273$ なら約1.103）'],
    why: '$t=\\dfrac{\\pi}{2}$ では、$\\sin nt$ の角は $90^{\\circ}$、$270^{\\circ}$、$450^{\\circ}$、…と $180^{\\circ}$ ずつ進むので、奇数番の $\\sin$ は $1,\\ -1,\\ 1,\\ \\cdots$ と交互になる。だから「かっこの中」は $1-\\dfrac13+\\dfrac15-\\cdots$ のように、係数に＋と－を交互につけてたすだけ（9-1①）。$t=\\dfrac{\\pi}{6}$ なら $\\dfrac12,\\ 1,\\ \\dfrac12,\\ -\\dfrac12,\\ -1,\\ \\cdots$ のくり返し。',
    caution: '「3つめの項まで」は $\\sin5t$ まで（$\\sin3t$ ではない）。偶数番の項はもともとない。$t=\\dfrac{3\\pi}{2}$ では符号がすべて逆になる。$\\dfrac{4}{\\pi}$ をかけ忘れない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '18mm', boxh: '9mm',
    fits(q) { return /まででやめ/.test(q) && /方形波|\\sin t\+\\[dt]frac13\\sin3t|\\sin\\omega_0t\+/.test(q) && !/\\sqrt|\\frac\{\\pi\}\{4\}|0\.7071/.test(q); },
    steps: {
      // t = π/2（ほかの数の項まで・高さ）
      s1(r) {
        const h = H04[turn(r, '04h1', H04.length)], N = [2, 4, 5][turn(r, '04n1', 3)];
        const S = sqSum(N, 1, 2);
        return { q: `高さ $${nf(h)}$ の方形波の級数 $${SQ(h)}$ を ${N}つめの項まででやめた和の、$t=\\dfrac{\\pi}{2}$ での値`, a: `$${sqVal(h, S)}$`, key: `${h}|${N}|1/2`,
          easy: `かっこの中は $${Array.from({ length: N }, (_, k) => (k ? (k % 2 ? '-' : '+') : '') + (k ? `\\dfrac{1}{${2 * k + 1}}` : '1')).join('')}=${fracNum(S[0], S[1])}$。$\\dfrac{${4 * h}}{\\pi}\\times${fracNum(S[0], S[1])}=${sqVal(h, S)}$`, easyCheck: 'last',
          verify: p => valIs(p, directSq(h, N, PI / 2)) };
      },
      // ほかの t（π/6・5π/6・3π/2・7π/6）
      s2(r) {
        const h = H04[turn(r, '04h2', H04.length)], N = [2, 3, 4][turn(r, '04n2', 3)], [tp, tq] = [[1, 6], [5, 6], [3, 2], [7, 6]][turn(r, '04t2', 4)];
        const S = sqSum(N, tp, tq); if (!S || S[0] === 0) return null;
        if (tp === 3 && tq === 2 && N === 3) return null;   // 例の符号を変えただけ（S-2）
        const sins = Array.from({ length: N }, (_, k) => { const x = Math.round(2 * Math.sin((2 * k + 1) * tp * PI / tq)) / 2; return nf(x); });
        return { q: `高さ $${nf(h)}$ の方形波の級数 $${SQ(h)}$ を ${N}つめの項まででやめた和の、$t=${tTxt(tp, tq)}$ での値`, a: `$${sqVal(h, S)}$`, key: `${h}|${N}|${tp}/${tq}`,
          easy: `$\\sin t,\\ \\sin3t,\\ \\cdots$ は $${sins.join(',\\ ')}$。かっこの中は $${fracNum(S[0], S[1])}$。$\\dfrac{${4 * h}}{\\pi}\\times${par(fracNum(S[0], S[1]))}=${sqVal(h, S)}$`, easyCheck: 'last',
          verify: p => valIs(p, directSq(h, N, tp * PI / tq)) };
      },
      // 見かけがちがう：周期 T の方形波（ω0 t = π/2）、0 と A の信号（平均つき）
      s3(r) {
        if (turn(r, '04s3', 2) === 0) {
          const T = r.pick([0.02, 0.004, 0.01, 0.002, 0.04]), w = r9(2 / T), h = r.pick([1, 2, 3]), N = r.pick([2, 4]);   // 3つめまでは例（13/15）の何倍か（S-2）
          const S = sqSum(N, 1, 2), t = r9(T / 4);
          return { q: `周期 ${U(nf(T), 's')}、高さ $${h}$ の方形波 $\\tfrac{${4 * h}}{\\pi}\\bigl(\\sin\\omega_0t+\\tfrac13\\sin3\\omega_0t+\\cdots\\bigr)$（$\\omega_0=${w}\\pi$）を ${N}つめの項まででやめた和の、$t=${nf(t)}$ での値`, a: `$${sqVal(h, S)}$`, key: `${h}|${N}|1/2`,
            easy: `$\\omega_0t=${w}\\pi\\times${nf(t)}=\\dfrac{\\pi}{2}$。かっこの中は $${fracNum(S[0], S[1])}$。$${sqVal(h, S)}$`, easyCheck: 'last',
            verify: p => valIs(p, directSq(h, N, w * PI * t)) };
        }
        const A = r.pick([2, 4, 6, 10]), N = r.pick([2, 4, 5]), S = sqSum(N, 1, 2);
        const tail = red(2 * A * S[0], S[1]), aTex = `${nf(A / 2)}+${fracX(tail[0], tail[1], '\\pi')}`;
        return { q: `前半 $${A}$・後半 $0$ の信号の級数 $${nf(A / 2)}+\\tfrac{${2 * A}}{\\pi}\\bigl(\\sin t+\\tfrac13\\sin3t+\\cdots\\bigr)$ を、かっこの中の ${N}つめの項まででやめた和の、$t=\\dfrac{\\pi}{2}$ での値`, a: `$${aTex}$`, key: `A|${A}|${N}`,
          easy: `かっこの中は $${fracNum(S[0], S[1])}$。$${nf(A / 2)}+\\dfrac{${2 * A}}{\\pi}\\times${fracNum(S[0], S[1])}=${aTex}$`, easyCheck: 'last',
          verify: p => { let s = 0; for (let k = 0; k < N; k++) s += Math.sin((2 * k + 1) * PI / 2) / (2 * k + 1); return valIs(p, A / 2 + 2 * A / PI * s); } };
      },
      // わな：t = π/4（交互にならない）
      trap(r) {
        const h = r.pick([1, 2, 3]), N = r.pick([2, 3, 4]);
        let c = [0, 1]; for (let k = 0; k < N; k++) { const n = 2 * k + 1, sg = Math.sign(Math.round(Math.sin(n * PI / 4) * 1e6)); c = fAdd(c, red(sg, n)); }
        const v = red(4 * h * c[0], 2 * c[1]), at = fracX(v[0], v[1], '\\pi').replace(/\\dfrac\{(\d+)\}/, (m, a) => `\\dfrac{${a === '1' ? '' : a}\\sqrt2}`);
        return dest({ q: `高さ $${h}$ の方形波の級数 $${SQ(h)}$ を ${N}つめの項まででやめた和の、$t=\\dfrac{\\pi}{4}$ での値（$\\sqrt{\\phantom{2}}$ と $\\pi$ を残した形で）`, a: `$${at}$`, key: `q|${h}|${N}`,
          verify: p => valIs(p, directSq(h, N, PI / 4)) }, '9-04',
          `$t=\\dfrac{\\pi}{4}$ では $\\sin nt$ が $\\dfrac{\\sqrt2}{2},\\ \\dfrac{\\sqrt2}{2},\\ -\\dfrac{\\sqrt2}{2},\\ -\\dfrac{\\sqrt2}{2},\\ \\cdots$ で、交互にならない。1つずつ出してたす`);
      },
    },
  });

  // ================================================================ 9-05
  const T05 = [0.001, 0.002, 0.004, 0.005, 0.01, 0.025, 0.04, 0.05, 0.1, 0.2, 0.5, 1, 2, 4];
  const nw = w => `${nf(w) === '1' ? '' : nf(w)}n\\pi`;
  add({
    id: '9-05', part: 1, chap: '9-1⑤⑥', stars: 1,
    title: '係数は「かけて平均の2倍」：$b_n=\\dfrac{2}{T}\\displaystyle\\int_0^Tf\\sin n\\omega_0t\\,\\dd t$',
    mark: '「$b_n$ を積分の式で書こう」、周期と角周波数。',
    futsu: ['「$\\sin n\\omega_0t$ をかけて平均の2倍」を、', '平均の式 $\\dfrac{1}{T}\\displaystyle\\int_0^T$ から書き直し、', '$\\omega_0=\\dfrac{2\\pi}{T}$ を出して入れる。'],
    raku: ['周期 $T=0.02\\,\\mathrm{s}$ → $\\dfrac{2}{T}=100$、$\\omega_0=100\\pi$', '→ $b_n=100\\displaystyle\\int_0^{0.02}f\\sin100n\\pi t\\,\\dd t$', '$f=\\sin t$ なら $\\sin^2t$ の平均 $\\dfrac12$ の2倍で', '$b_1=1$'],
    why: '$b_n$ は「$f$ に $\\sin n\\omega_0t$ をかけて、1周期で平均し、2倍する」という操作の名前（9-1⑤）。平均は $\\dfrac{1}{T}\\displaystyle\\int_0^T$ なので、その2倍で前の数は $\\dfrac{2}{T}$（$T=2\\pi$ なら $\\dfrac{1}{\\pi}$）。$a_n$ は $\\sin$ を $\\cos$ にかえるだけ。平均（直流分）$\\dfrac{a_0}{2}$ は $\\dfrac{1}{T}\\displaystyle\\int_0^Tf\\,\\dd t$（9-1⑥）。',
    caution: '前の数は $\\dfrac{1}{T}$ ではなく $\\dfrac{2}{T}$（平均の2倍）。ただし平均 $\\dfrac{a_0}{2}$ は $\\dfrac{1}{T}$。積分は長さ $T$ の区間なら、どこからでもよい（$-\\dfrac{T}{2}$ から $\\dfrac{T}{2}$ でも）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '13mm', s2: '13mm', s3: '13mm', trap: '16mm' }, boxh: { trap: '9mm' },
    fits(q) { return (/□\\displaystyle\\int|□\\,t\)|\(□/.test(q) || /をかけた積の、1周期の平均|1周期で積分すると/.test(q)) && !/方形波|のこぎり/.test(q); },
    steps: {
      s1(r) {
        const T = r.pick(T05), c = r9(2 / T), w = r9(2 / T), sc = r.pick(['b', 'a']);
        if (T === 0.02) return null;
        const fn = sc === 'b' ? '\\sin' : '\\cos';
        return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波の係数を、$${sc}_n=□\\displaystyle\\int_0^{${nf(T)}}f(t)${fn}(□\\,t)\\,\\dd t$ と書く`, a: `$${nf(c)}$、$${nw(w)}$`, key: `T|${T}|${sc}`,
          easy: `$\\dfrac{2}{T}=\\dfrac{2}{${nf(T)}}=${nf(c)}$、$n\\omega_0=n\\times\\dfrac{2\\pi}{${nf(T)}}=${nw(w)}$`, easyCheck: false, exKeys: [nf(c)],
          verify: p => { const m = String(p.a).match(/\$[^$]*\$/g); if (!m || m.length !== 2) return '答えが2つでない'; if (!near(ev(strip(m[0])), 2 / T)) return '前の数がちがう'; for (const n of [1, 2, 3]) if (!near(ev(strip(m[1]), { n }), n * 2 * PI / T)) return '角周波数がちがう'; return true; } };
      },
      s2(r) {
        const k = turn(r, '05s2', 3);
        if (k === 0) {
          const f = r.pick([10, 25, 100, 200, 250, 500, 1000]), T = r9(1 / f), c = 2 * f, sc = r.pick(['b', 'a']), fn = sc === 'b' ? '\\sin' : '\\cos';
          return { q: `${U(f, 'Hz')} でくり返す波の係数を、$${sc}_n=□\\displaystyle\\int_0^{${nf(T)}}f(t)${fn}(□\\,t)\\,\\dd t$ と書く`, a: `$${c}$、$${nw(2 * f)}$`, key: `T|${nf(T)}|${sc}`,
            easy: `周期 $T=${nf(T)}$。$\\dfrac{2}{T}=${c}$、$n\\omega_0=${nw(2 * f)}$`, easyCheck: false, exKeys: [String(c)],
            verify: p => { const m = String(p.a).match(/\$[^$]*\$/g); if (!m || m.length !== 2) return '答えが2つでない'; if (!near(ev(strip(m[0])), 2 * f)) return '前の数がちがう'; for (const n of [1, 2, 3]) if (!near(ev(strip(m[1]), { n }), 2 * PI * f * n)) return '角周波数がちがう'; return true; } };
        }
        if (k === 1) {
          const T = r.pick(T05.filter(x => x !== 0.02)), c = r9(1 / T);
          return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波の平均（直流分）を、$\\dfrac{a_0}{2}=□\\displaystyle\\int_0^{${nf(T)}}f(t)\\,\\dd t$ と書く`, a: `$${nf(c)}$`, key: `a0|${T}`,
            easy: `平均は $\\dfrac{1}{T}\\displaystyle\\int_0^T$ で、$\\dfrac{1}{${nf(T)}}=${nf(c)}$（2倍しない）`, easyCheck: 'last', verify: p => valIs(p, 1 / T) };
        }
        const n = r.int(1, 5), m = r.pick([0.1, 0.15, 0.2, 0.3, 0.4, 0.6, 0.75, 1.2, 1.5, -0.2, -0.35]), sc = r.pick(['\\sin', '\\cos']), nm = sc === '\\sin' ? 'b' : 'a';
        return { q: `ある波 $f$ に $${sc}${n === 1 ? '' : n}\\omega_0t$ をかけた積の、1周期の平均が $${nf(m)}$ だった。$${nm}_${n}$`, a: `$${nf(2 * m)}$`, key: `avg|${n}|${m}|${nm}`,
          easy: `平均の2倍で $2\\times${pn(m)}=${nf(2 * m)}$`, easyCheck: 'last', verify: p => valIs(p, m * 2) };
      },
      // 見かけがちがう：まん中から積分する形、積分の値から係数
      s3(r) {
        if (turn(r, '05s3', 2) === 0) {
          const T = r.pick([0.04, 0.01, 0.004, 0.2, 2, 0.1]), h = r9(T / 2), c = r9(2 / T);
          return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波の係数を、$b_n=□\\displaystyle\\int_{-${nf(h)}}^{${nf(h)}}f(t)\\sin(□\\,t)\\,\\dd t$ と書く`, a: `$${nf(c)}$、$${nw(c)}$`, key: `T|${T}|b`,
            easy: `長さ $T$ の区間なら、どこからでもよい。$\\dfrac{2}{T}=${nf(c)}$、$n\\omega_0=${nw(c)}$`, easyCheck: false, exKeys: [nf(c)],
            verify: p => { const m = String(p.a).match(/\$[^$]*\$/g); if (!m || m.length !== 2) return '答えが2つでない'; if (!near(ev(strip(m[0])), 2 / T)) return '前の数がちがう'; for (const n of [1, 2, 3]) if (!near(ev(strip(m[1]), { n }), n * 2 * PI / T)) return '角周波数がちがう'; return true; } };
        }
        const T = r.pick([0.02, 0.04, 0.05, 0.1, 0.2]), n = r.int(1, 4), I = r.pick([0.003, 0.004, 0.005, 0.006, 0.01, 0.015, -0.002, -0.005]), v = r9(2 / T * I), sc = r.pick(['\\sin', '\\cos']), nm = sc === '\\sin' ? 'b' : 'a';
        if (decs(v) > 2 || v === 0) return null;
        return { q: `周期 $T=${nf(T)}\\,\\mathrm{s}$ の波 $f$ に $${sc}${n === 1 ? '' : n}\\omega_0t$ をかけて、1周期で積分すると $${nf(I)}$ だった。$${nm}_${n}$`, a: `$${nf(v)}$`, key: `I|${T}|${n}|${I}|${nm}`,
          easy: `$\\dfrac{2}{T}\\times(\\text{積分})=${nf(2 / T)}\\times${pn(I)}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, 2 * I / T) };
      },
      // わな：方形波の係数の値（9-06）
      trap(r) {
        const h = r.pick([1, 2, 5]), n = r.pick([1, 3, 5]);
        return dest({ q: `$0<t<\\pi$ で $${h}$、$\\pi<t<2\\pi$ で $-${h}$ をくり返す方形波の $b_${n}$ の値`, a: `$${fracX(4 * h, n, '\\pi')}$`, key: `sq|${h}|${n}`,
          verify: p => valIs(p, bnNum([[0, PI, () => h], [PI, 2 * PI, () => -h]], n), 1e-7) }, '9-05',
          `式を書くだけでなく、値を聞いている。区間に分けて定積分し、$\\cos n\\pi=(-1)^n$ で $\\dfrac{${4 * h}}{n\\pi}$（奇数）。$n=${n}$ で $${fracX(4 * h, n, '\\pi')}$`, ['9-06']);
      },
    },
  });

  // ================================================================ 9-06
  const A06 = [1, 2, 4, 5, 6, 0.5, 1.5, 2.5, 10];
  const sqPcs = a => [[0, PI, () => a], [PI, 2 * PI, () => -a]];
  const oe = (odd, even) => `奇数 $${odd}$、偶数 $${even}$`;
  const sqTxt = (a, b) => `$0<t<\\pi$ で $${a}$、$\\pi<t<2\\pi$ で $${b}$`;
  add({
    id: '9-06', part: 1, chap: '9-1⑤ 例題2', stars: 1,
    title: '区間ごとに一定なら区間に分け、$\\cos n\\pi=(-1)^n$ で分ける',
    mark: '方形波（$0<t<\\pi$ で $a$、$\\pi<t<2\\pi$ で $-a$）。',
    futsu: ['$n=1,\\ 2,\\ 3,\\ \\cdots$ と1つずつ', '$\\cos n\\pi$ を出して、$b_1$、$b_2$、$b_3$、…を', '別々に計算する。'],
    raku: ['高さ3の方形波', '→ $b_n=\\dfrac{3}{\\pi}\\cdot\\dfrac{2(1-\\cos n\\pi)}{n}$', '→ 奇数 $\\dfrac{12}{n\\pi}$、偶数 $0$', '$a_n=0$'],
    why: '1つの式で書けないので、積分を $0$〜$\\pi$ と $\\pi$〜$2\\pi$ に分ける（9-1⑤）。$\\displaystyle\\int_0^{\\pi}\\sin nt\\,\\dd t=\\dfrac{1-\\cos n\\pi}{n}$、$\\displaystyle\\int_{\\pi}^{2\\pi}\\sin nt\\,\\dd t=\\dfrac{\\cos n\\pi-1}{n}$ なので、$b_n=\\dfrac{2a(1-\\cos n\\pi)}{n\\pi}$。$\\cos n\\pi=(-1)^n$ は奇数なら $-1$、偶数なら1なので、奇数は $\\dfrac{4a}{n\\pi}$、偶数は0。',
    caution: '$\\cos n\\pi$ をいつも $-1$ にしない（偶数なら1）。$-\\cos nt$ の $\\dfrac1n$ を忘れない。前半が $-a$ なら符号が逆になる。$a_n$ はどれも0（$\\sin n\\pi=0$）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '13mm', s2: '16mm', s3: '16mm', trap: '13mm' }, boxh: '9mm',
    fits(q) { return /方形波/.test(q) && /\$b_n\$|\$b_\d\$|□\\bigl\(\\sin t/.test(q) && !/項まで|周期 \$T|Hz|kHz|まん中|棒/.test(q); },
    steps: {
      s1(r) {
        const a = r.pick(A06); if (a === 3) return null;
        return { q: `${sqTxt(nf(a), nf(-a))} をくり返す方形波（周期 $2\\pi$）の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(4 * a * 2, 2, 'n\\pi'), '0'), key: `a|${a}`,
          easy: `$b_n=\\dfrac{2\\times${nf(a)}(1-\\cos n\\pi)}{n\\pi}$`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(sqPcs(a), n)) };
      },
      s2(r) {
        const k = turn(r, '06s2', 3), a = r.pick(A06); if (a === 3) return null;
        if (k === 0) {
          return { q: `${sqTxt(nf(-a), nf(a))} をくり返す方形波（周期 $2\\pi$）の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(-4 * a * 2, 2, 'n\\pi'), '0'), key: `r|${a}`,
            easy: '前半が負なので、符号が逆になる', easyCheck: false, verify: p => oddEvenIs(p, n => bnNum([[0, PI, () => -a], [PI, 2 * PI, () => a]], n)) };
        }
        if (k === 1) {
          return { q: `$-\\pi<t<0$ で $${nf(-a)}$、$0<t<\\pi$ で $${nf(a)}$ をくり返す方形波の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(4 * a * 2, 2, 'n\\pi'), '0'), key: `a|${a}`,
            easy: '1周期なら、どこからでもよい。$0<t<2\\pi$ の方形波と同じ', easyCheck: false, verify: p => oddEvenIs(p, n => bnNum([[-PI, 0, () => -a], [0, PI, () => a]], n)) };
        }
        const n = r.pick([1, 3, 5, 7]);
        return { q: `${sqTxt(nf(a), nf(-a))} をくり返す方形波の $b_${n}$`, a: `$${fracX(4 * a * 2, 2 * n, '\\pi')}$`, key: `n|${a}|${n}`,
          easy: `$${n}$ は奇数なので $\\dfrac{4\\times${nf(a)}}{${n}\\pi}=${fracX(4 * a * 2, 2 * n, '\\pi')}$`, easyCheck: 'last', verify: p => valIs(p, bnNum(sqPcs(a), n), 1e-7) };
      },
      // 見かけがちがう：級数の前の数・周期が 2π でない方形波
      s3(r) {
        const a = r.pick(A06.filter(x => x !== 3));
        if (turn(r, '06s3', 2) === 0) {
          return { q: `${sqTxt(nf(a), nf(-a))} をくり返す方形波を $f(t)=□\\bigl(\\sin t+\\tfrac13\\sin3t+\\tfrac15\\sin5t+\\cdots\\bigr)$ と書く`, a: `$${fracX(4 * a * 2, 2, '\\pi')}$`, key: `a|${a}`,
            easy: `$b_1=\\dfrac{${nf(4 * a)}}{\\pi}$ をくくり出す。$b_n=\\dfrac{b_1}{n}$（奇数）`, easyCheck: false, verify: p => valIs(p, bnNum(sqPcs(a), 1), 1e-7) };
        }
        const T = r.pick([0.02, 0.01, 0.002, 0.004]);
        return { q: `周期 ${U(nf(T), 's')} で、前半 $${nf(a)}$・後半 $${nf(-a)}$ をくり返す方形波の、$\\sin n\\omega_0t$ の係数 $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(4 * a * 2, 2, 'n\\pi'), '0'), key: `a|${a}`,
          easy: `$\\theta=\\omega_0t$ とおくと周期 $2\\pi$ の方形波と同じ（わざ 9-11）`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(sqPcs(a), n)) };
      },
      // わな：区間の中が1次式（9-09）
      trap(r) {
        const k = r.pick([1, 2, 3, 4]);
        return dest({ q: `$0<t<\\pi$ で $${k === 1 ? '' : k}t$、$\\pi<t<2\\pi$ で $0$ をくり返す信号の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(k, 1, 'n'), fracX(-k, 1, 'n')), key: `t|${k}`,
          verify: p => oddEvenIs(p, n => bnNum([[0, PI, t => k * t], [PI, 2 * PI, () => 0]], n)) }, '9-06',
          `区間の中が一定でなく $t$ の1次式なので、$\\displaystyle\\int_0^{\\pi}t\\sin nt\\,\\dd t=\\dfrac{\\pi(-1)^{n+1}}{n}$ を部分積分で出す。$b_n=\\dfrac{${k}(-1)^{n+1}}{n}$`, ['9-09']);
      },
    },
  });

  // ================================================================ 9-07
  // 「前半 A・後半 B」の信号（周期 2π）
  const abTxt = (A, B) => `$0<t<\\pi$ で $${nf(A)}$、$\\pi<t<2\\pi$ で $${nf(B)}$ をくり返す信号（周期 $2\\pi$）`;
  const abPcs = (A, B) => [[0, PI, () => A], [PI, 2 * PI, () => B]];
  const meanNum = pcs => pcs.reduce((s, [a, b, f]) => s + integ(f, a, b, 400), 0) / (2 * PI);
  // 横軸の目もり（π の倍数）
  const piTick = k => `$${k === 1 ? '' : k === -1 ? '-' : k}\\pi$`;
  // 区間ごとの波形の図（2周期）。pieces は周期 2π の1周期ぶん [[a, b, f(t)], …]、yt は目もり、t0 は聞く時刻（点線）
  function figWave(pcs, o) {
    o = o || {};
    const lo = o.x0 != null ? o.x0 : 0, per = 2 * PI, n = o.periods || 2, vals = [];
    pcs.forEach(([a, b, f]) => { for (let k = 0; k <= 20; k++) vals.push(f(a + (b - a) * k / 20)); });
    const ymin = Math.min(0, ...vals), ymax = Math.max(0, ...vals), span = ymax - ymin || 1;
    const G = M.graph({ x0: lo - 0.3, x1: lo + n * per + 0.9, y0: ymin - 0.12 * span, y1: ymax + 0.15 * span, w: 8.4, h: o.h || 3.4 });
    const pieces = [];
    for (let k = 0; k < n; k++) pcs.forEach(([a, b, f]) => pieces.push({ f: t => f(t - k * per), a: a + k * per, b: b + k * per, ends: o.ends || '' }));
    const xk = []; for (let k = Math.ceil(lo / PI + 1e-9); k * PI <= lo + n * per + 1e-9; k++) if (k !== 0) xk.push(k);
    const its = [...G.axes({ xt: xk.map(k => k * PI), xfmt: t => piTick(Math.round(t / PI)), yt: o.yt || [], yfmt: o.yfmt, x: 't', y: 'f' }),
      ...G.pw(pieces.map(pc => Object.assign({}, pc, { ends: pc.ends || '[)' })), { vline: !o.noV, dots: !!o.ends, thick: true })];
    if (o.t0 != null) its.push(['seg', G.T(o.t0, ymin - 0.1 * span), G.T(o.t0, ymax + 0.1 * span), { dash: true }]);
    return { s: 5, items: its };
  }
  const A07 = [1, 2, 3, 5, 6, 8, 10, 12];
  add({
    id: '9-07', part: 1, chap: '9-1⑥ 例題2', stars: 1,
    title: '0 と $A$ をくり返す信号は「平均 $\\dfrac A2$ ＋高さ $\\dfrac A2$ の方形波」',
    mark: '「0 V と□V を交互に」、デジタルの信号。',
    futsu: ['$a_0$、$a_n$、$b_n$ を、それぞれ', '$0$〜$\\pi$ の定積分から計算し直す', '（$\\pi$〜$2\\pi$ は $f=0$）。'],
    raku: ['前半4・後半0（周期 $2\\pi$）', '→ 平均 $\\dfrac{a_0}{2}=2$（$a_0$ は4）', '→ 高さ2の方形波：$b_n=2\\times\\dfrac{4}{n\\pi}=\\dfrac{8}{n\\pi}$（奇数）', '$a_n=0$'],
    why: '前半 $A$・後半0 の信号から平均 $\\dfrac A2$ をひくと、前半 $\\dfrac A2$・後半 $-\\dfrac A2$ の方形波になる。方形波の係数は高さ1で $\\dfrac{4}{n\\pi}$（奇数）なので、高さ $\\dfrac A2$ なら $\\dfrac{2A}{n\\pi}$。平均は定数の項 $\\dfrac{a_0}{2}$ になる（9-1⑥）。前半 $A$・後半 $B$ なら、平均 $\\dfrac{A+B}{2}$ と高さ $\\dfrac{A-B}{2}$ の方形波。',
    caution: '定数の項は $a_0$ ではなく $\\dfrac{a_0}{2}$（$a_0$ は平均の2倍）。偶数番の $b_n$ と、$a_n$ はどれも0。前半が0なら、方形波の符号が逆になる。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '13mm', trap: '13mm' }, boxh: '9mm',
    fits(q) { return /\$0<t<\\pi\$ で \$-?[\d.]+\$、\$\\pi<t<2\\pi\$ で \$-?[\d.]+\$ をくり返す信号|図の信号/.test(q) && !/での値|項まで|を入れて/.test(q); },
    steps: {
      s1(r) {
        const A = r.pick(A07);
        if (turn(r, '07s1', 2) === 0) return { q: `${abTxt(A, 0)}の平均 $\\dfrac{a_0}{2}$`, a: `$${nf(A / 2)}$`, key: `A|${A}`, easy: `$\\dfrac{${A}+0}{2}=${nf(A / 2)}$`, easyCheck: 'last', verify: p => valIs(p, meanNum(abPcs(A, 0)), 1e-7) };
        return { q: `${abTxt(A, 0)}の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(2 * A, 1, 'n\\pi'), '0'), key: `A|${A}`,
          easy: `高さ $${nf(A / 2)}$ の方形波：$${nf(A / 2)}\\times\\dfrac{4}{n\\pi}$`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(abPcs(A, 0), n)) };
      },
      s2(r) {
        const k = turn(r, '07s2', 3);
        if (k === 0) {
          const A = r.pick(A07);
          return { q: `${abTxt(A, 0)}の $a_0$`, a: `$${A}$`, key: `A|${A}`, easy: `平均は $${nf(A / 2)}$。$a_0$ はその2倍`, easyCheck: false, verify: p => valIs(p, 2 * meanNum(abPcs(A, 0)), 1e-7) };
        }
        if (k === 1) {
          const A = r.pick(A07);
          return { q: `${abTxt(0, A)}の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(-2 * A, 1, 'n\\pi'), '0'), key: `A|${A}`,
            easy: `平均 $${nf(A / 2)}$ をひくと、前半 $${nf(-A / 2)}$ の方形波（符号が逆）`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(abPcs(0, A), n)) };
        }
        const A = r.pick([3, 4, 5, 6, 7, 8, 10]), B = r.pick([-4, -2, -1, 1, 2, 3].filter(x => x < A && x !== -A));
        if (turn(r, '07s2b', 2) === 0) return { q: `${abTxt(A, B)}の平均 $\\dfrac{a_0}{2}$`, a: `$${nf((A + B) / 2)}$`, key: `ab|${A}|${B}`, easy: `$\\dfrac{${A}+${par(B)}}{2}=${nf((A + B) / 2)}$`, easyCheck: 'last', verify: p => valIs(p, meanNum(abPcs(A, B)), 1e-7) };
        return { q: `${abTxt(A, B)}の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(2 * (A - B), 1, 'n\\pi'), '0'), key: `ab|${A}|${B}`,
          easy: `平均 $${nf((A + B) / 2)}$ と、高さ $\\dfrac{${A}-${par(B)}}{2}=${nf((A - B) / 2)}$ の方形波`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(abPcs(A, B), n)) };
      },
      // 見かけがちがう：図の信号の級数
      s3(r) {
        const A = r.pick([2, 3, 5, 6, 8, 10]), B = r.pick([0, 0, -2, 1, 2].filter(x => x < A && x !== -A));
        const mean = (A + B) / 2, c = 2 * (A - B), aTex = `$${nf(mean)}$、$${fracX(c, 1, '\\pi')}$`;
        if (mean === 2 || c === 8) return null;
        return { q: '図の信号（周期 $2\\pi$）を $f(t)=P+Q\\bigl(\\sin t+\\tfrac13\\sin3t+\\cdots\\bigr)$ と書く。$P$ ＝ □、$Q$ ＝ □', a: aTex, key: B === 0 ? `A|${A}` : `ab|${A}|${B}`,
          fig: figWave(abPcs(A, B), { yt: [A, B].filter(y => y !== 0) }),
          easy: `平均 $\\dfrac{${A}+${par(B)}}{2}=${nf(mean)}$、高さ $${nf((A - B) / 2)}$ の方形波で $${nf((A - B) / 2)}\\times\\dfrac{4}{\\pi}$`, easyCheck: false,
          verify: p => { const m = nums(p.a); return (m.length === 2 && near(m[0], meanNum(abPcs(A, B)), 1e-7) && near(m[1], bnNum(abPcs(A, B), 1), 1e-7) && near(bnNum(abPcs(A, B), 3) * 3, m[1], 1e-6)) || '級数がちがう'; } };
      },
      // わな：前半の4分の1だけ A（平均＋方形波にならない。9-06）
      trap(r) {
        const A = r.pick([2, 4, 6, 3]), n = 2;
        return dest({ q: `$0<t<\\dfrac{\\pi}{2}$ で $${A}$、$\\dfrac{\\pi}{2}<t<2\\pi$ で $0$ をくり返す信号の $b_${n}$`, a: `$${fracX(A, 1, '\\pi')}$`, key: `q|${A}`,
          verify: p => valIs(p, bnNum([[0, PI / 2, () => A], [PI / 2, 2 * PI, () => 0]], n), 1e-7) }, '9-07',
          `$${A}$ の時間が周期の半分でないので、平均をひいても方形波にならない。区間に分けて $\\dfrac{1}{\\pi}\\displaystyle\\int_0^{\\pi/2}${A}\\sin2t\\,\\dd t=${fracX(A, 1, '\\pi')}$`, ['9-06']);
      },
    },
  });

  // ================================================================ 9-08
  // 文の区間の式と、聞く時刻から、とびの所かどうかを決める（fits 用）
  function atJump(q) {
    const m = q.match(/\$t=([^$]*)\$ での値/); if (!m) return false;
    const tv = ev(m[1].replace(/\\dfrac/g, '\\frac')); if (tv == null) return false;
    const ends = []; for (const x of q.matchAll(/\$(-?[^$<]*)<t<([^$<]*)\$/g)) { const a = ev(x[1].replace(/\\dfrac/g, '\\frac')), b = ev(x[2].replace(/\\dfrac/g, '\\frac')); if (a != null) ends.push(a); if (b != null) ends.push(b); }
    if (!ends.length) return false;
    const lo = Math.min(...ends), per = Math.max(...ends) - lo;
    return ends.some(e => { const d = ((tv - e) % per + per) % per; return d < 1e-9 || per - d < 1e-9; });
  }
  add({
    id: '9-08', part: 1, chap: '9-1⑦', stars: 1,
    title: 'とびの所では、級数は左右の値の平均を通る',
    mark: '「$t=\\pi$ での級数の値」、方形波・のこぎり波のとび。',
    futsu: ['係数を求めて級数を書き、', '$t=\\pi$ を入れて項を1つずつ計算する', '（$\\sin n\\pi=0$ などを確かめる）。'],
    raku: ['前半6・後半0 の信号の級数の $t=\\pi$', '→ 項を計算せずに $\\dfrac{6+0}{2}=3$', '$-\\pi<t<\\pi$ で $f=t$ ののこぎり波の $t=\\pi$', '→ $\\dfrac{\\pi+(-\\pi)}{2}=0$'],
    why: 'フーリエ級数は、なめらかな所では $f(t)$ の値に、とびの所では、とびの上と下（左右の値）のまん中に近づく（9-1⑦）。方形波の $t=\\pi$ では $\\sin n\\pi=0$ で、平均の項だけが残るので、級数の値は左右の値の平均になる。のこぎり波の $t=\\pi$ でも同じ。',
    caution: 'とびでない所の値は、$f$ の値そのもの（平均にしない）。とびの所の左右の値は、1周期のはしどうし（$t=0$ の左は $t=2\\pi$ の手前の値）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm', boxh: { s2: '9mm' },
    fits(q) { return /での値/.test(q) && !/項まで|やめた/.test(q) && (/図の波/.test(q) || atJump(q)); },
    steps: {
      s1(r) {
        const A = r.pick([2, 4, 5, 8, 10, 1, 7]), B = r.pick([0, -2, 1, 3, -1, 2].filter(x => x !== A)), tt = [['\\pi', PI], ['0', 0], ['2\\pi', 2 * PI], ['-\\pi', -PI], ['3\\pi', 3 * PI]][turn(r, '08s1', 5)];
        const v = (A + B) / 2;
        return { q: `${abTxt(A, B)}のフーリエ級数の、$t=${tt[0]}$ での値`, a: `$${nf(v)}$`, key: `${A}|${B}`,
          easy: `$t=${tt[0]}$ はとび。$\\dfrac{${A}+${par(B)}}{2}=${nf(v)}$`, easyCheck: 'last',
          verify: p => valIs(p, fsCF((A + B) / 2, z0, sq1(A, B), tt[1]), 1e-6) };
      },
      // のこぎり波・1次式の区間
      s2(r) {
        const k = turn(r, '08s2', 3), c = r.pick([1, 2, 3, 4, 0.5]);
        if (k === 0) {
          const b = r.pick([1, 2, -1, 3, -2]);
          return { q: `$-\\pi<t<\\pi$ で $f(t)=${c === 1 ? '' : nf(c)}t${b < 0 ? '' : '+'}${b}$ をくり返すのこぎり波の、フーリエ級数の $t=\\pi$ での値`, a: `$${b}$`, key: `s|${c}|${b}`,
            easy: `$\\dfrac{(${nf(c)}\\pi${b < 0 ? '' : '+'}${b})+(-${nf(c)}\\pi${b < 0 ? '' : '+'}${b})}{2}=${b}$`, easyCheck: 'last', verify: p => valIs(p, fsCF(b, z0, n => 2 * c * (n % 2 ? 1 : -1) / n, PI), 1e-6) };
        }
        if (k === 1) {
          const tt = r.pick([['0', 0], ['2\\pi', 2]]);
          return { q: `$0<t<2\\pi$ で $f(t)=${c === 1 ? '' : nf(c)}t$ をくり返すのこぎり波の、フーリエ級数の $t=${tt[0]}$ での値`, a: `$${fracNum(...toFr(c), '\\pi')}$`, key: `z|${c}`,
            easy: `左右の値は $${fracNum(...toFr(2 * c), '\\pi')}$ と $0$。平均 $${fracNum(...toFr(c), '\\pi')}$`, easyCheck: 'last', verify: p => valIs(p, fsCF(c * PI, z0, n => -2 * c / n, 0), 1e-6) };
        }
        return { q: `$0<t<\\pi$ で $${c === 1 ? '' : nf(c)}t$、$\\pi<t<2\\pi$ で $0$ をくり返す信号の、フーリエ級数の $t=\\pi$ での値`, a: `$${fracNum(...toFr(c / 2), '\\pi')}$`, key: `h|${c}`,
          easy: `左右の値は $${fracNum(...toFr(c), '\\pi')}$ と $0$。平均 $${fracNum(...toFr(c / 2), '\\pi')}$`, easyCheck: 'last', verify: p => valIs(p, fsCF(c * PI / 4, n => (n % 2 ? -2 * c / (PI * n * n) : 0), n => c * (n % 2 ? 1 : -1) / n, PI), 1e-4) };
      },
      // 見かけがちがう：図の波（2周期）
      s3(r) {
        if (turn(r, '08s3', 2) === 0) {
          const A = r.pick([4, 5, 8, 10]), B = r.pick([-2, 0, 1, 2]), k = r.pick([2, 3, 4]);
          return { q: `図の波のフーリエ級数の、$t=${k}\\pi$ での値`, a: `$${nf((A + B) / 2)}$`, key: `${A}|${B}`, fig: figWave(abPcs(A, B), { yt: [A, B].filter(y => y !== 0), t0: k * PI }),
            easy: `$t=${k}\\pi$ はとび。$\\dfrac{${A}+${par(B)}}{2}=${nf((A + B) / 2)}$`, easyCheck: 'last', verify: p => valIs(p, fsCF((A + B) / 2, z0, sq1(A, B), k * PI), 1e-6) };
        }
        const H = r.pick([2, 3, 4, 6]), k = r.pick([2, 4]);
        return { q: `図ののこぎり波（$0<t<2\\pi$ で $0$ から $${H}$ まで上がる）のフーリエ級数の、$t=${k}\\pi$ での値`, a: `$${nf(H / 2)}$`, key: `w|${H}|${k}`,
          fig: figWave([[0, 2 * PI, t => H * t / (2 * PI)]], { yt: [H], t0: k * PI }),
          easy: `$t=${k}\\pi$ はとび。$\\dfrac{${H}+0}{2}=${nf(H / 2)}$`, easyCheck: 'last', verify: p => valIs(p, fsCF(H / 2, z0, n => -H / (PI * n), k * PI), 1e-6) };
      },
      // わな：とびでない所（f の値そのもの。わざなし）
      trap(r) {
        const A = r.pick([4, 6, 8, 10]), tt = r.pick([['\\dfrac{\\pi}{2}', A], ['\\dfrac{3\\pi}{2}', 0]]);
        return dest({ q: `${abTxt(A, 0)}のフーリエ級数の、$t=${tt[0]}$ での値`, a: `$${tt[1]}$`, key: `n|${A}|${tt[0]}`, verify: p => valIs(p, fsCF(A / 2, z0, sq1(A, 0), tt[0].includes('3') ? 1.5 * PI : 0.5 * PI), 1e-3) }, '9-08',
          `$t=${tt[0]}$ はとびの所ではない。なめらかな所では、級数は $f$ の値そのもので $${tt[1]}$`);
      },
    },
  });

  // ================================================================ 9-09
  const kT = k => (k === 1 ? '' : k === -1 ? '-' : nf(k));
  const sgn1 = n => (n % 2 ? 1 : -1);   // (-1)^{n+1}
  const pfr = (top, n) => (n === 1 ? top : `\\dfrac{${top}}{${n}}`);   // n=1 なら分母を書かない
  add({
    id: '9-09', part: 1, chap: '9-1⑦ 例題3', stars: 1,
    title: 'のこぎり波は部分積分：微分すると簡単になる $t$ を $f$ に',
    mark: '$t\\sin nt$・$t\\cos nt$ の積分。',
    futsu: ['$t\\sin nt$ を積和の式や', '置きかえで変形しようとして、', '形が変わらずに行きづまる。'],
    raku: ['$\\displaystyle\\int_{-\\pi}^{\\pi}t\\sin nt\\,\\dd t=\\Bigl[-\\dfrac{t\\cos nt}{n}\\Bigr]_{-\\pi}^{\\pi}$', '$\\qquad+\\dfrac1n\\displaystyle\\int_{-\\pi}^{\\pi}\\cos nt\\,\\dd t=\\dfrac{2\\pi(-1)^{n+1}}{n}$', '（あとの積分は1周期で0）', '→ $b_n=\\dfrac{2(-1)^{n+1}}{n}$、$a_n=0$'],
    why: '部分積分 $\\displaystyle\\int fg\'\\,\\dd t=\\bigl[fg\\bigr]-\\int f\'g\\,\\dd t$ で、$t$ を $f$（微分すると1）、$\\sin nt$ を $g\'$（$g=-\\dfrac{\\cos nt}{n}$）にする（5-16・9-1⑦）。あとの積分は $\\cos nt$ の1周期ぶんで0なので、はしの値だけが残る。$\\cos(\\pm n\\pi)=(-1)^n$。',
    caution: '$\\sin nt$ を $f$ にすると、$t$ が $\\dfrac{t^2}{2}$ になって、かえって重くなる。はしの値は、上のはしから下のはしをひく（$-\\pi$ の所の符号に注意）。$\\displaystyle\\int_{-\\pi}^{\\pi}t\\cos nt\\,\\dd t$ は0。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '13mm' }, boxh: '9mm',
    fits(q) { return /\\int[^$]*\\(sin|cos)\s*\d*t\\,\\dd t/.test(q) || (/\$0<t<\\pi\$ で \$[\d.]*t\$、/.test(q) && /b_/.test(q)) || (/-\\pi<t<\\pi\$ で \$f\(t\)=[\d.]*t[+-]/.test(q) && /b_n/.test(q)); },
    steps: {
      // ∫_{-π}^{π} k t sin nt dt
      s1(r) {
        const k = r.pick([1, 2, 3, 4, 0.5]), n = r.int(1, 6), q = red(Math.round(4 * k) * sgn1(n), 2 * n);   // 2kπ(-1)^{n+1}/n
        return { q: `$\\displaystyle\\int_{-\\pi}^{\\pi}${kT(k)}t\\sin${n === 1 ? ' ' : n}t\\,\\dd t$`, a: `$${fracNum(q[0], q[1], '\\pi')}$`, key: `${k}|${n}`,
          calc: { kind: 'defint', f: `${k}t\\sin(${n}t)`, x: 't', a: '-\\pi', b: '\\pi' },
          easy: `$\\Bigl[-${pfr(`${kT(k)}t\\cos${n === 1 ? ' ' : n}t`, n)}\\Bigr]_{-\\pi}^{\\pi}+0=${fracNum(q[0], q[1], '\\pi')}$`, easyCheck: 'last' };
      },
      // 0〜π・0〜2π、t cos nt
      s2(r) {
        const kk = [0, 1, 0, 2][turn(r, '09s2', 4)], k = r.pick([1, 2, 3, 4, 6]), n = r.int(1, 5);
        if (kk === 0) {
          const q = red(k * sgn1(n), n);
          return { q: `$\\displaystyle\\int_0^{\\pi}${kT(k)}t\\sin${n === 1 ? ' ' : n}t\\,\\dd t$`, a: `$${fracNum(q[0], q[1], '\\pi')}$`, key: `h|${k}|${n}`,
            calc: { kind: 'defint', f: `${k}t\\sin(${n}t)`, x: 't', a: 0, b: '\\pi' },
            easy: `はしの値 $-${pfr(`${kT(k)}\\pi\\cos${n === 1 ? '' : n}\\pi`, n)}$ だけが残る（あとの積分 $\\displaystyle\\int_0^{\\pi}\\cos${n === 1 ? ' ' : n}t\\,\\dd t=0$）`, easyCheck: false };
        }
        if (kk === 1) {
          const q = red(-2 * k, n);
          return { q: `$\\displaystyle\\int_0^{2\\pi}${kT(k)}t\\sin${n === 1 ? ' ' : n}t\\,\\dd t$`, a: `$${fracNum(q[0], q[1], '\\pi')}$`, key: `w|${k}|${n}`,
            calc: { kind: 'defint', f: `${k}t\\sin(${n}t)`, x: 't', a: 0, b: '2\\pi' },
            easy: `$\\Bigl[-${pfr(`${kT(k)}t\\cos${n === 1 ? ' ' : n}t`, n)}\\Bigr]_0^{2\\pi}=${fracNum(q[0], q[1], '\\pi')}$（$\\cos${2 * n}\\pi=1$）`, easyCheck: false };
        }
        const m = r.int(2, 5);
        return { q: `$\\displaystyle\\int_{-\\pi}^{\\pi}${kT(k)}t\\cos${m}t\\,\\dd t$`, a: '$0$', key: `c|${k}|${m}`, calc: { kind: 'defint', f: `${k}t\\cos(${m}t)`, x: 't', a: '-\\pi', b: '\\pi' },
          easy: `$\\Bigl[\\dfrac{${kT(k)}t\\sin${m}t}{${m}}\\Bigr]_{-\\pi}^{\\pi}=0$、あとの積分も $\\displaystyle\\int\\sin${m}t=0$`, easyCheck: false };
      },
      // 見かけがちがう：1次式に定数がつく
      s3(r) {
        const k = r.pick([2, 3, 4, 0.5]), c = r.pick([1, 2, 3, -1, -2, 5]);
        if (turn(r, '09s3', 2) === 0) {
          const n = r.int(1, 4), q = red(Math.round(4 * k) * sgn1(n), 2 * n);
          return { q: `$\\displaystyle\\int_{-\\pi}^{\\pi}(${kT(k)}t${c < 0 ? '' : '+'}${c})\\sin${n === 1 ? ' ' : n}t\\,\\dd t$`, a: `$${fracNum(q[0], q[1], '\\pi')}$`, key: `${k}|${n}`,
            calc: { kind: 'defint', f: `(${k}t+(${c}))\\sin(${n}t)`, x: 't', a: '-\\pi', b: '\\pi' },
            easy: `定数の部分は $\\displaystyle\\int_{-\\pi}^{\\pi}${c}\\sin${n === 1 ? ' ' : n}t\\,\\dd t=0$。残りは部分積分で $${fracNum(q[0], q[1], '\\pi')}$`, easyCheck: false };
        }
        const [u, d] = toFr(2 * k);
        return { q: `$-\\pi<t<\\pi$ で $f(t)=${kT(k)}t${c < 0 ? '' : '+'}${c}$ をくり返す波の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(u, d, 'n'), fracX(-u, d, 'n')),
          key: `b|${k}|${c}`, easy: `$\\dfrac{1}{\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}${kT(k)}t\\sin nt\\,\\dd t$（定数の部分は0）`, easyCheck: false,
          verify: p => oddEvenIs(p, n => bnNum([[-PI, PI, t => k * t + c]], n)) };
      },
      // わな：偶関数（9-19）
      trap(r) {
        const k = r.pick([1, 2, 3]), w = r.pick(['abs', 'sq']);
        const ft = w === 'abs' ? `${kT(k)}\\lvert t\\rvert` : `${kT(k)}t^2`;
        return dest({ q: `$-\\pi<t<\\pi$ で $f(t)=${ft}$ をくり返す波の $b_n$`, a: '$0$', key: `e|${k}|${w}`,
          verify: p => valIs(p, bnNum([[-PI, PI, t => (w === 'abs' ? k * Math.abs(t) : k * t * t)]], 3), 1e-6) }, '9-09',
          `$t$ を $-t$ にしても値が変わらない形（偶関数）なので、$f\\sin nt$ は左右で打ち消して、部分積分しなくても $b_n=0$`, ['9-19']);
      },
    },
  });

  // ================================================================ 9-10
  const sawTxt = (k, c) => `$0<t<2\\pi$ で $f(t)=${c ? `${nf(c)}${k < 0 ? '-' : '+'}${kT(Math.abs(k))}t` : `${kT(k)}t`}$ をくり返すのこぎり波`;
  const K10 = [2, 4, 5, 6, 0.5, 1.5, 10];
  const nFr = (num, X) => { const [u, d] = toFr(num); return fracX(u, d, X); };      // num/X（num は小数でもよい）
  const pFr = (num, X) => { const [u, d] = toFr(num); return fracNum(u, d, X); };    // num·X
  add({
    id: '9-10', part: 1, chap: '9-1 例題3', stars: 1,
    title: 'のこぎり波の係数は、覚えた形の何倍か（$f=kt$ なら $k$ 倍）',
    mark: '「$f(t)=3t$」「$\\dfrac t2$」。',
    futsu: ['$f=3t$ のまま、$a_0$・$a_n$・$b_n$ を', 'それぞれ部分積分で', '計算し直す。'],
    raku: ['$0<t<2\\pi$ で $f=t$ は $\\dfrac{a_0}{2}=\\pi$、$b_n=-\\dfrac2n$', '→ $f=3t$ なら $\\dfrac{a_0}{2}=3\\pi$、$b_n=-\\dfrac6n$', '$a_n=0$（部分積分をやり直さない）'],
    why: '係数は「$f$ に $\\cos nt$・$\\sin nt$ をかけて積分」なので、$f$ を $k$ 倍すれば係数もそのまま $k$ 倍になる（積分は何倍かを外に出せる。5-11）。定数 $c$ をたすと、平均 $\\dfrac{a_0}{2}$ だけが $c$ ふえる（定数に $\\sin nt$・$\\cos nt$ をかけた積分は0）。だから、$f=t$ の係数だけ覚えておけばよい。',
    caution: '区間で形がちがう：$0<t<2\\pi$ で $f=t$ は $b_n=-\\dfrac2n$、$-\\pi<t<\\pi$ で $f=t$ は $b_n=\\dfrac{2(-1)^{n+1}}{n}$（平均も $\\pi$ と0）。かならず区間を見る。$-kt$ なら符号が逆。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '13mm', s3: '14mm', trap: '13mm' }, boxh: '9mm',
    fits(q) { return /のこぎり波/.test(q) && /f\(t\)=/.test(q) && /\$\\dfrac\{a_0\}\{2\}\$|\$[ab]_n\$|\$b_\d\$/.test(q) && !/\\int|での値|項まで/.test(q); },
    steps: {
      s1(r) {
        const k = r.pick(K10), kind = [0, 1, 0, 1, 2][turn(r, '10s1', 5)], pcs = [[0, 2 * PI, t => k * t]];
        if (kind === 0) return { q: `${sawTxt(k)}の平均 $\\dfrac{a_0}{2}$`, a: `$${pFr(k, '\\pi')}$`, key: `k|${k}`, easy: `$f=t$ の $\\pi$ の $${nf(k)}$ 倍`, easyCheck: false, verify: p => valIs(p, meanNum(pcs), 1e-7) };
        if (kind === 1) return { q: `${sawTxt(k)}の $b_n$`, a: `$${nFr(-2 * k, 'n')}$`, key: `k|${k}`, easy: `$-\\dfrac2n$ の $${nf(k)}$ 倍`, easyCheck: false, verify: p => nExprIs(p, n => bnNum(pcs, n)) };
        return { q: `${sawTxt(k)}の $a_n$`, a: '$0$', key: `k|${k}`, easy: `$f=t$ の $a_n=0$ の $${nf(k)}$ 倍`, easyCheck: false, verify: p => nExprIs(p, n => anNum(pcs, n)) };
      },
      // −π<t<π の形
      s2(r) {
        const k = r.pick([2, 3, 4, 5, 0.5, 1.5, -1, -2]), pcs = [[-PI, PI, t => k * t]], [u, d] = toFr(2 * k);
        if (turn(r, '10s2', 4) === 3) {
          const n = r.int(1, 5), [u2, d2] = toFr(2 * k * sgn1(n));
          return { q: `$-\\pi<t<\\pi$ で $f(t)=${kT(k)}t$ をくり返すのこぎり波の $b_${n}$`, a: `$${fracX(u2, d2 * n, '')}$`, key: `m|${k}`, easy: `$\\dfrac{2(-1)^{n+1}}{n}$ の $${nf(k)}$ 倍で、$n=${n}$`, easyCheck: false, verify: p => valIs(p, bnNum(pcs, n), 1e-7) };
        }
        return { q: `$-\\pi<t<\\pi$ で $f(t)=${kT(k)}t$ をくり返すのこぎり波の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(u, d, 'n'), fracX(-u, d, 'n')), key: `m|${k}`,
          easy: `$\\dfrac{2(-1)^{n+1}}{n}$ の $${nf(k)}$ 倍`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(pcs, n)) };
      },
      // 見かけがちがう：定数がつく・下がるのこぎり波
      s3(r) {
        const k = r.pick([1, 2, 3, 0.5]), c = r.pick([1, 2, 3, 5, 10]), down = turn(r, '10s3', 2) === 1, kk = down ? -k : k, pcs = [[0, 2 * PI, t => c + kk * t]];
        if (turn(r, '10s3b', 2) === 0) {
          const a = `${nf(c)}${kk < 0 ? '-' : '+'}${pFr(Math.abs(kk), '\\pi')}`;
          return { q: `${sawTxt(kk, c)}の平均 $\\dfrac{a_0}{2}$`, a: `$${a}$`, key: `${kk}|${c}`, easy: `$${nf(c)}$ に、$f=t$ の平均 $\\pi$ の $${nf(kk)}$ 倍をたす`, easyCheck: false, verify: p => valIs(p, meanNum(pcs), 1e-7) };
        }
        return { q: `${sawTxt(kk, c)}の $b_n$`, a: `$${nFr(-2 * kk, 'n')}$`, key: `${kk}|${c}`, easy: `定数 $${nf(c)}$ は $b_n$ に効かない。$-\\dfrac2n$ の $${nf(kk)}$ 倍`, easyCheck: false, verify: p => nExprIs(p, n => bnNum(pcs, n)) };
      },
      // わな：半分だけ 1次式（覚えた形の何倍かにならない。9-09）
      trap(r) {
        const k = r.pick([2, 4, 6]), n = r.pick([1, 2]), v = n === 1 ? k : -k / 2;
        return dest({ q: `$0<t<\\pi$ で $${k}t$、$\\pi<t<2\\pi$ で $0$ をくり返す信号の $b_${n}$`, a: `$${nf(v)}$`, key: `h|${k}|${n}`,
          verify: p => valIs(p, bnNum([[0, PI, t => k * t], [PI, 2 * PI, () => 0]], n), 1e-7) }, '9-10',
          `のこぎり波を何倍かした形ではない。$\\dfrac{1}{\\pi}\\displaystyle\\int_0^{\\pi}${k}t\\sin${n === 1 ? ' ' : n}t\\,\\dd t$ を部分積分して $${nf(v)}$`, ['9-09']);
      },
    },
  });

  // ================================================================ 9-11
  const V11 = [2, 4, 5, 8, 10, 12, 1.5, 3];
  const F11 = [50, 60, 100, 200, 500, 1000, 2000];
  const sigTxt = (V, f, first0) => `0 V と ${U(nf(V), 'V')} を、1秒に ${f} 回（${U(f, 'Hz')}）同じ時間ずつ交互に出す信号（前半が ${first0 ? U(0, 'V') : U(nf(V), 'V')}）`;
  add({
    id: '9-11', part: 1, chap: '9-1④ 例題4', stars: 1,
    title: '周期が $2\\pi$ でない信号は $\\theta=\\omega_0t$ で周期 $2\\pi$ にもどす',
    mark: '「1秒に500回」「1 kHz」の方形の信号。',
    futsu: ['$T=\\dfrac{1}{500}$ として、', '$\\dfrac{2}{T}\\displaystyle\\int_0^Tf\\sin n\\omega_0t\\,\\dd t$ を', '$t$ のまま定積分する。'],
    raku: ['0 V と6 V を1秒に500回（前半6 V）', '→ $\\theta$ で見ると $0<\\theta<\\pi$ で6', '→ 平均3 V、$b_n=\\dfrac{12}{n\\pi}$（$\\dfrac1\\pi=0.318$）', '→ 500 Hz の成分は約3.82 V', '　1500 Hz の成分は約1.27 V'],
    why: '$\\theta=\\omega_0t$（$\\omega_0=\\dfrac{2\\pi}{T}$）とおくと、$t$ が0から $T$ まで進むとき $\\theta$ は0から $2\\pi$ まで進む。$\\dd t=\\dfrac{\\dd\\theta}{\\omega_0}$ で、$\\dfrac{2}{T}\\displaystyle\\int_0^T\\cdots\\dd t=\\dfrac{1}{\\pi}\\displaystyle\\int_0^{2\\pi}\\cdots\\dd\\theta$ になり、周期 $2\\pi$ のときと同じ係数が出る（9-1④）。$n$ 番めの係数は、周波数 $n$ 倍の成分の大きさ。',
    caution: '係数は周期によらない（1 kHz でも50 Hz でも、前半 $V$・後半0 なら $b_n=\\dfrac{2V}{n\\pi}$）。周波数の偶数倍（2 kHz など）の成分は0。前半が0 V なら $b_n$ の符号が逆。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm', boxh: '9mm',
    fits(q) { return /1秒に .* 回|周期 \$[\d.]+\\,\\mathrm\{ms\}\$/.test(q) && /信号/.test(q) && /成分の大きさ|平均|\$b_/.test(q) && !/角周波数/.test(q); },
    steps: {
      s1(r) {
        const V = r.pick(V11), f = r.pick(F11), kind = turn(r, '11s1', 3);
        if (V === 6 && f === 500) return null;
        if (kind === 0) return { q: `${sigTxt(V, f)}の平均（V）`, a: `$${nf(V / 2)}$`, key: `${V}|${f}`, easy: `$\\dfrac{${nf(V)}+0}{2}=${nf(V / 2)}$`, easyCheck: 'last', verify: p => valIs(p, meanNum(abPcs(V, 0)), 1e-7) };
        const n = kind === 1 ? 1 : 3;
        return { q: `${sigTxt(V, f)}の、${U(n * f, 'Hz')} の成分の大きさ（係数）`, a: `$${fracX(2 * V, n, '\\pi')}$`, key: `${V}|${f}`,
          easy: `$\\theta$ で見ると周期 $2\\pi$。$b_n=\\dfrac{${nf(2 * V)}}{n\\pi}$ で $n=${n}$`, easyCheck: false, verify: p => valIs(p, bnNum(abPcs(V, 0), n), 1e-7) };
      },
      // 約の値（1/π = 0.318 を文に）、偶数倍は0
      s2(r) {
        const V = r.pick(V11), f = r.pick(F11), n = [1, 3, 5, 2][turn(r, '11s2', 4)];
        if (V === 6 && f === 500) return null;
        if (n === 2) return { q: `${sigTxt(V, f)}の、${U(2 * f, 'Hz')} の成分の大きさ`, a: '$0$', key: `${V}|${f}`, easy: `${U(2 * f, 'Hz')} は2番め（偶数番）なので0`, easyCheck: false, verify: p => valIs(p, Math.abs(bnNum(abPcs(V, 0), 2)) < 1e-9 ? 0 : 1) };
        const ap = 2 * V * 0.318 / n, a = agree(ap, 2 * V / (n * PI), 2); if (a == null) return null;
        return { q: `${sigTxt(V, f)}の、${U(n * f, 'Hz')} の成分の大きさ（V。$\\dfrac{1}{\\pi}=0.318$、小数第2位まで）`, a: `約 $${a}$`, key: `${V}|${f}`,
          easy: `$b_${n}=\\dfrac{${nf(2 * V)}}{${n === 1 ? '' : n}\\pi}=${nf(2 * V)}\\times0.318${n === 1 ? '' : `\\div${n}`}\\approx${a}$`, easyCheck: false, verify: p => valIs(p, +rd(bnNum(abPcs(V, 0), n), 2), 1e-9) };
      },
      // 見かけがちがう：+V と −V・前半が 0 V・周期を ms で
      s3(r) {
        const V = r.pick([2, 3, 5, 10]), f = r.pick([50, 100, 500, 1000]), kind = turn(r, '11s3', 2);
        if (kind === 0) {
          const T = r9(1000 / f);
          return { q: `周期 ${U(nf(T), 'ms')} で、${U(nf(V), 'V')} と ${U(-V, 'V')} を同じ時間ずつ交互に出す信号（前半が ${U(nf(V), 'V')}）の $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(4 * V, 1, 'n\\pi'), '0'), key: `pm|${V}|${f}`,
            easy: `$\\theta=\\omega_0t$ で、高さ $${V}$ の方形波（わざ 9-06）`, easyCheck: false, verify: p => oddEvenIs(p, n => bnNum(abPcs(V, -V), n)) };
        }
        return { q: `${sigTxt(V, f, true)}の、$\\sin\\omega_0t$ の係数 $b_1$`, a: `$${nFr(-2 * V, '\\pi')}$`, key: `z|${V}|${f}`,
          easy: '前半が0なので、前半が $V$ のときと符号が逆', easyCheck: false, verify: p => valIs(p, bnNum(abPcs(0, V), 1), 1e-7) };
      },
      // わな：周期と基本角周波数（9-03）
      trap(r) {
        const fk = r.pick([1, 2, 5, 0.5]), f = fk * 1000;
        return dest({ q: `${U(nf(fk), 'kHz')} でくり返す信号の基本角周波数 $\\omega_0$（rad/s）`, a: `$${2 * f}\\pi$`, key: `w|${fk}`, verify: p => valIs(p, 2 * PI * f) }, '9-11',
          `成分の大きさではなく、1秒に進む角を聞いている。$\\omega_0=2\\pi\\times${f}=${2 * f}\\pi$`, ['9-03']);
      },
    },
  });

  // ================================================================ 9-12
  // 「m − m/3 + m/5 − …」「m + m/9 + m/25 + …」の文
  // 項 m/d を約分して書く（3−1+3/5−3/7+… のように）
  const termTx = (m, d) => { const [u, v] = toFr(m), [a, b] = red(u, v * d); return b === 1 ? String(a) : `\\tfrac{${a}}{${b}}`; };
  const leib = m => [1, 3, 5, 7].map((d, k) => (k ? (k % 2 ? '-' : '+') : '') + termTx(m, d)).join('') + '+\\cdots';
  const odd2 = m => [1, 9, 25].map((d, k) => (k ? '+' : '') + termTx(m, d)).join('') + '+\\cdots';
  // 検算：たしていく（交互の和は、となりどうしの平均。2乗の和は残りを見積もってたす）
  const leibNum = m => { let s = 0, s0 = 0; const N = 20000; for (let k = 0; k <= N; k++) { s0 = s; s += (k % 2 ? -1 : 1) / (2 * k + 1); } return m * (s + s0) / 2; };
  const odd2Num = m => { let s = 0; const N = 20000; for (let k = 0; k < N; k++) s += 1 / ((2 * k + 1) ** 2); return m * (s + 1 / (4 * N)); };
  const M12 = [2, 3, 4, 5, 6, 8, 0.5];
  add({
    id: '9-12', part: 1, chap: '9-1⑦ 例題9', stars: 1,
    title: '値のわかる点を入れて級数の和を出す（定数の項は先にひく）',
    mark: '「$1-\\dfrac13+\\dfrac15-\\cdots$ の値」。',
    futsu: ['$1,\\ 1-\\dfrac13,\\ 1-\\dfrac13+\\dfrac15,\\ \\cdots$ と', 'たし続けて、近づく先を', '表で見当をつける。'],
    raku: ['$t=2\\Bigl(\\sin t-\\dfrac{\\sin2t}{2}+\\dfrac{\\sin3t}{3}-\\cdots\\Bigr)$ に $t=\\dfrac{\\pi}{2}$', '→ $\\dfrac{\\pi}{2}=2\\Bigl(1-\\dfrac13+\\dfrac15-\\cdots\\Bigr)$ → $\\dfrac{\\pi}{4}$', '$\\dfrac12+\\dfrac{2}{\\pi}(\\cdots)=1$ なら、先に $\\dfrac12$ をひく'],
    why: 'フーリエ級数は、なめらかな所では $f(t)$ の値そのもの。だから、左辺の値がわかっている点 $t$ を入れると、右辺の無限の和が1つの式に入り、その値が決まる（9-1⑦）。$t=\\dfrac{\\pi}{2}$ では $\\sin nt$ が $1,\\ 0,\\ -1,\\ 0,\\ \\cdots$ となり、$1-\\dfrac13+\\dfrac15-\\cdots$ が出てくる。定数の項があれば、先に両辺からひいてから、かっこの前の数でわる。',
    caution: 'とびの所（方形波の $t=0$、のこぎり波の $t=\\pi$）を入れない（級数は左右の平均で、$f$ の値ではない）。聞かれている和が $1-\\dfrac13+\\cdots$ の何倍かを見て、最後にかける。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm', boxh: '9mm',
    fits(q) { return /を入れて/.test(q) && /\\cdots\$ の値/.test(q); },
    steps: {
      s1(r) {
        const m = r.pick(M12), kind = turn(r, '12s1', 2);
        const src = kind === 0 ? (h => `高さ $${h}$ の方形波の級数 $\\tfrac{${4 * h}}{\\pi}\\bigl(\\sin t+\\tfrac13\\sin3t+\\tfrac15\\sin5t+\\cdots\\bigr)$ は、$0<t<\\pi$ で $${h}$`)(r.pick([1, 2, 3, 5]))
          : '$-\\pi<t<\\pi$ で $t=2\\bigl(\\sin t-\\tfrac{\\sin2t}{2}+\\tfrac{\\sin3t}{3}-\\cdots\\bigr)$';
        return { q: `${src}。$t=\\dfrac{\\pi}{2}$ を入れて、$${leib(m)}$ の値`, a: `$${pFr(m / 4, '\\pi')}$`, key: `L|${m}`,
          easy: `$1-\\dfrac13+\\dfrac15-\\cdots=\\dfrac{\\pi}{4}$。その $${m}$ 倍で $${pFr(m / 4, '\\pi')}$`, easyCheck: 'last', verify: p => valIs(p, leibNum(m), 1e-7) };
      },
      // 定数の項がある（先にひく）
      s2(r) {
        const kind = turn(r, '12s2', 3), m = r.pick(M12);
        if (kind === 0) {
          const A = r.pick([2, 4, 6, 10]);
          return { q: `前半 $${A}$・後半 $0$ の信号の級数 $${nf(A / 2)}+\\tfrac{${2 * A}}{\\pi}\\bigl(\\sin t+\\tfrac13\\sin3t+\\cdots\\bigr)$ は、$0<t<\\pi$ で $${A}$。$t=\\tfrac{\\pi}{2}$ を入れて、$${leib(m)}$ の値`, a: `$${pFr(m / 4, '\\pi')}$`, key: `A|${A}|${m}`,
            easy: `先に $${nf(A / 2)}$ をひく：$${nf(A / 2)}=\\dfrac{${2 * A}}{\\pi}(\\cdots)$。かっこの中は $\\dfrac{\\pi}{4}$、その $${m}$ 倍`, easyCheck: false, verify: p => valIs(p, leibNum(m), 1e-7) };
        }
        if (kind === 1) {
          return { q: `$0<t<2\\pi$ で $t=\\pi-2\\bigl(\\sin t+\\tfrac{\\sin2t}{2}+\\tfrac{\\sin3t}{3}+\\cdots\\bigr)$。$t=\\tfrac{\\pi}{2}$ を入れて、$${leib(m)}$ の値`, a: `$${pFr(m / 4, '\\pi')}$`, key: `S|${m}`,
            easy: `$\\dfrac{\\pi}{2}=\\pi-2(\\cdots)$。先に $\\pi$ をひいて $(\\cdots)=\\dfrac{\\pi}{4}$、その $${m}$ 倍`, easyCheck: false, verify: p => valIs(p, leibNum(m), 1e-7) };
        }
        return { q: `$-\\pi\\leqq t\\leqq\\pi$ で $\\lvert t\\rvert=\\tfrac{\\pi}{2}-\\tfrac{4}{\\pi}\\bigl(\\cos t+\\tfrac{\\cos3t}{9}+\\tfrac{\\cos5t}{25}+\\cdots\\bigr)$。$t=0$ を入れて、$${odd2(m)}$ の値`, a: `$${pFr(m / 8, '\\pi^2')}$`, key: `T|${m}`,
          easy: `$0=\\dfrac{\\pi}{2}-\\dfrac{4}{\\pi}(\\cdots)$ から $(\\cdots)=\\dfrac{\\pi^2}{8}$、その $${m}$ 倍`, easyCheck: false, verify: p => valIs(p, odd2Num(m), 1e-7) };
      },
      // 見かけがちがう：熱の棒の答え、三角波の t = π
      s3(r) {
        const m = r.pick(M12);
        if (turn(r, '12s3', 2) === 0) {
          const Ut = r.pick([20, 40, 60, 80]);
          return { q: `はじめどこも $${Ut}$ ℃の棒の答え $T=\\displaystyle\\sum_{n=1,3,5,\\cdots}\\dfrac{${4 * Ut}}{n\\pi}e^{-\\alpha(n\\pi/L)^2t}\\sin\\dfrac{n\\pi x}{L}$ に、$t=0$、$x=\\dfrac{L}{2}$ を入れて、$${leib(m)}$ の値`, a: `$${pFr(m / 4, '\\pi')}$`, key: `U|${Ut}|${m}`,
            easy: `$${Ut}=\\dfrac{${4 * Ut}}{\\pi}\\Bigl(1-\\dfrac13+\\dfrac15-\\cdots\\Bigr)$。かっこの中は $\\dfrac{\\pi}{4}$、その $${m}$ 倍`, easyCheck: false, verify: p => valIs(p, leibNum(m), 1e-7) };
        }
        return { q: `$-\\pi\\leqq t\\leqq\\pi$ で $\\lvert t\\rvert=\\tfrac{\\pi}{2}-\\tfrac{4}{\\pi}\\bigl(\\cos t+\\tfrac{\\cos3t}{9}+\\tfrac{\\cos5t}{25}+\\cdots\\bigr)$。$t=\\pi$ を入れて、$${odd2(m)}$ の値`, a: `$${pFr(m / 8, '\\pi^2')}$`, key: `Tp|${m}`,
          easy: `$\\cos n\\pi=-1$（奇数）。$\\pi=\\dfrac{\\pi}{2}+\\dfrac{4}{\\pi}(\\cdots)$ から $(\\cdots)=\\dfrac{\\pi^2}{8}$、その $${m}$ 倍`, easyCheck: false, verify: p => valIs(p, odd2Num(m), 1e-7) };
      },
      // わな：2乗の逆数の和を、方形波だけから（パーセバル。9-24）
      trap(r) {
        const m = r.pick([1, 2, 4]);
        return dest({ q: `高さ1の方形波 $\\tfrac{4}{\\pi}\\bigl(\\sin t+\\tfrac13\\sin3t+\\tfrac15\\sin5t+\\cdots\\bigr)$ を使って、$${odd2(m)}$ の値（方形波の2乗の平均は1）`, a: `$${pFr(m / 8, '\\pi^2')}$`, key: `P|${m}`,
          verify: p => valIs(p, odd2Num(m), 1e-7) }, '9-12',
          `点を入れても $\\dfrac{1}{n^2}$ の和は出てこない。2乗の平均（パーセバル）$1=\\dfrac12\\sum\\dfrac{16}{n^2\\pi^2}$ から $\\dfrac{\\pi^2}{8}$${m === 1 ? '' : `、その $${m}$ 倍`}`, ['9-24']);
      },
    },
  });

  // ================================================================ 9-13
  const ROD = '両はしを0 ℃に保った棒';
  const TAU13 = [8, 9, 12, 16, 18, 20, 25, 36, 45, 50, 72, 100];
  add({
    id: '9-13', part: 1, chap: '9-1⑧', stars: 1,
    title: '熱の $n$ 番めの成分は $n^2$ 倍速く消える（長さ2倍で4倍おそい）',
    mark: '$e^{-\\alpha(n\\pi/L)^2t}$、「3番めが半分になる時間」。',
    futsu: ['$\\alpha\\Bigl(\\dfrac{3\\pi}{L}\\Bigr)^2$ を数で出し直し、', '$e^{-kt}=\\dfrac12$ を $\\ln$ で解いて、', '半分になる時間を求める。'],
    raku: ['$n=1$ が7.0秒で半分', '→ $n=3$ は $\\dfrac{7.0}{9}\\approx0.78$ 秒、$n=5$ は $\\dfrac{7.0}{25}=0.28$ 秒', '長さ $0.2\\,\\mathrm{m}$ の棒なら、$n=1$ は $7.0\\times4=28$ 秒'],
    why: '$n$ 番めの成分は $e^{-\\alpha(n\\pi/L)^2t}$ の割合で小さくなる（9-1⑧）。肩の $\\alpha\\Bigl(\\dfrac{n\\pi}{L}\\Bigr)^2$ は $n=1$ の $n^2$ 倍なので、同じだけ小さくなる時間は $\\dfrac{1}{n^2}$。棒の長さ $L$ を $k$ 倍にすると肩は $\\dfrac{1}{k^2}$ 倍で、時間は $k^2$ 倍。熱拡散率 $\\alpha$ が $k$ 倍なら、時間は $\\dfrac1k$。',
    caution: '$n$ 倍ではなく $n^2$ 倍（でこぼこが $n$ 倍細かいと、$n^2$ 倍速く消える）。長さも2乗で効く。半分になる時間そのもの（$\\dfrac{\\ln2}{k}$）は、このわざでは出せない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /棒/.test(q) && /半分になる|何倍の速さ|\\alpha\\bigl\(\\tfrac\{\d+\\pi\}\{L\}\\bigr\)\^2/.test(q) && !/\\ln|はじめどこも|\\sin\\dfrac\{\\pi x\}/.test(q); },
    steps: {
      s1(r) {
        const tau = TAU13[turn(r, '13t', TAU13.length)], n = r.int(2, 5), v = r9(tau / (n * n));
        if (decs(v) > 2) return null;
        return { q: `${ROD}の温度で、1番めの成分（$n=1$）が $${tau}$ 秒で半分になる。${n}番めの成分が半分になる時間（秒）`, a: `$${nf(v)}$`, key: `${tau}|${n}`,
          easy: `$${n}^2=${n * n}$ 倍速いので、$${tau}\\div${n * n}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, Math.log(2) / (Math.log(2) / tau * n * n)) };
      },
      s2(r) {
        const kind = turn(r, '13s2', 3);
        if (kind === 0) {
          const tau = r.pick([6, 5, 8, 10, 12, 4]), [L2, k2] = r.pick([[0.3, 9], [0.05, 0.25], [0.2, 4], [0.15, 2.25]]), v = r9(tau * k2);
          return { q: `長さ ${U(0.1, 'm')} の棒（${ROD.slice(0, -1)}）では、1番めの成分が $${tau}$ 秒で半分になる。同じ材料で長さ ${U(L2, 'm')} の棒では何秒か`, a: `$${nf(v)}$`, key: `L|${tau}|${L2}`,
            easy: `長さが $${nf(L2 / 0.1)}$ 倍で、時間は $${nf(L2 / 0.1)}^2=${nf(k2)}$ 倍。$${tau}\\times${nf(k2)}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, tau * (L2 / 0.1) ** 2, 1e-9) };
        }
        if (kind === 1) {
          const n = r.int(2, 5), v = r9(0.0987 * n * n);
          return { q: `${ROD}で、1番めの成分の肩の数が $\\alpha\\bigl(\\tfrac{\\pi}{L}\\bigr)^2=0.0987$（1/s）のとき、$\\alpha\\bigl(\\tfrac{${n}\\pi}{L}\\bigr)^2$`, a: `$${nf(v)}$`, key: `k|${n}`,
            easy: `$${n}^2$ 倍：$0.0987\\times${n * n}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, 0.0987 / (PI * PI) * (n * PI) ** 2, 1e-9) };
        }
        const n = r.int(2, 6);
        return { q: `${ROD}の温度の ${n}番めの成分は、1番めの成分の何倍の速さで小さくなるか（肩の数の比）`, a: `$${n * n}$`, key: `x|${n}`,
          easy: `$\\Bigl(\\dfrac{${n}\\pi}{L}\\Bigr)^2\\div\\Bigl(\\dfrac{\\pi}{L}\\Bigr)^2=${n * n}$`, easyCheck: 'last', verify: p => valIs(p, (n * PI) ** 2 / PI ** 2, 1e-9) };
      },
      // 見かけがちがう：材料（α）がちがう・逆に1番めを出す
      s3(r) {
        if (turn(r, '13s3', 2) === 0) {
          const tau = r.pick([12, 18, 24, 30, 36]), k = r.pick([2, 3, 4, 1.5]), n = r.pick([1, 2, 3]), v = r9(tau / k / (n * n));
          if (decs(v) > 2) return null;
          return { q: `${ROD}で、1番めの成分が $${tau}$ 秒で半分になる。熱拡散率 $\\alpha$ が $${nf(k)}$ 倍の材料で同じ形の棒を作ると、${n === 1 ? '1番め' : `${n}番め`}の成分が半分になる時間（秒）`, a: `$${nf(v)}$`, key: `a|${tau}|${k}|${n}`,
            easy: `$\\alpha$ が $${nf(k)}$ 倍で時間は $\\dfrac{1}{${nf(k)}}$${n > 1 ? `、${n}番めでさらに $\\dfrac{1}{${n * n}}$` : ''}。$${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, tau / k / (n * n), 1e-9) };
        }
        const n = r.int(2, 4), tn = r.pick([0.5, 1, 1.5, 2, 2.5, 4]), v = r9(tn * n * n);
        return { q: `${ROD}で、${n}番めの成分が $${nf(tn)}$ 秒で半分になった。1番めの成分が半分になる時間（秒）`, a: `$${nf(v)}$`, key: `${nf(tn * n * n)}|${n}`,
          easy: `1番めは $${n * n}$ 倍おそい。$${nf(tn)}\\times${n * n}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, tn * n * n, 1e-9) };
      },
      // わな：半分になる時間そのもの（ln2 ÷ k。わざなし）
      trap(r) {
        const k = r.pick([0.0987, 0.0693, 0.0462, 0.1386, 0.0231]), a = agree(0.693 / k, Math.LN2 / k, 1);
        if (a == null) return null;
        return dest({ q: `${ROD}の温度が、はじめ $\\sin\\tfrac{\\pi x}{L}$ の形だった。$\\alpha\\bigl(\\tfrac{\\pi}{L}\\bigr)^2=${k}$（1/s）のとき、半分になる時間（秒。$\\ln2=0.693$、小数第1位まで）`, a: `約 $${a}$`, key: `h|${k}`,
          verify: p => valIs(p, +rd(Math.LN2 / k, 1)) }, '9-13',
          `何倍かではなく、時間そのものを聞いている。$e^{-${k}t}=\\dfrac12$ から $t=\\dfrac{\\ln2}{${k}}\\approx${a}$（6-4 の「半分になる時間」）`);
      },
    },
  });

  // ================================================================ 9-14
  const U14 = [10, 20, 25, 30, 40, 60, 80, 100];
  const rodTxt = Ut => `はじめどこも $${Ut}$ ℃の棒（両はし0 ℃）`;
  // 熱の棒の係数（検算：0〜L の一定の温度を、半回転して広げた方形波として数で積分）
  const rodBn = (Ut, n) => 2 * integ(x => Ut * Math.sin(n * PI * x), 0, 1, 2000);
  const E14 = { 5: 0.6105, 10: 0.3727, 15: 0.2275, 20: 0.1389, 25: 0.0848, 30: 0.0518 };
  add({
    id: '9-14', part: 1, chap: '9-1⑧ 例題6・7', stars: 1,
    title: 'どこも $U$ ℃の棒は $b_n=\\dfrac{4U}{n\\pi}$（奇数）。数秒で1項めだけ',
    mark: '両はし0 ℃、まん中の温度、「1項めだけで」。',
    futsu: ['$b_n=\\dfrac{2}{L}\\displaystyle\\int_0^LU\\sin\\dfrac{n\\pi x}{L}\\,\\dd x$ を', '定積分し、級数の項を', 'いくつもたして温度を出す。'],
    raku: ['$U=50$、$\\alpha\\Bigl(\\dfrac{\\pi}{L}\\Bigr)^2=0.0987$', '→ まん中 $\\approx\\dfrac{200}{\\pi}e^{-0.0987t}$', '10秒後 $63.66\\times0.3727\\approx23.7$ ℃', '（$e^{-0.987}=0.3727$。$n=3$ の項は $e^{-8.88}$ でほぼ0）'],
    why: '0から $L$ だけの温度を、原点で半回転して外側へ広げると、周期 $2L$、高さ $U$ の方形波になる（9-1⑧）。方形波の係数は $\\dfrac{4U}{n\\pi}$（奇数）、偶数は0。まん中 $x=\\dfrac L2$ では $\\sin\\dfrac{n\\pi}{2}$ が $1,\\ -1,\\ 1,\\ \\cdots$。2項めからは $e^{-9\\times0.0987t}$ 以下で、数秒でほぼ0になるので、1項めだけで十分。',
    caution: 'はじめ（$t$ が0に近い）は1項めだけでは足りない（$t=0$ で $\\dfrac{4U}{\\pi}$ は $U$ より大きい）。この節の $T$ は温度で、周期ではない。$\\cos$ の項は使わない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '13mm', s2: '14mm', s3: '14mm', trap: '13mm' }, boxh: '9mm',
    fits(q) { return /はじめどこも/.test(q) && /℃/.test(q) && /\$b_n\$|まん中|1項め|x=\\dfrac\{L\}\{6\}/.test(q) && !/を入れて/.test(q); },
    steps: {
      s1(r) {
        const Ut = r.pick(U14);
        return { q: `${rodTxt(Ut)}の温度の、$\\sin\\dfrac{n\\pi x}{L}$ の係数 $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(4 * Ut, 1, 'n\\pi'), '0'), key: `${Ut}`,
          easy: `高さ $${Ut}$ の方形波：$${Ut}\\times\\dfrac{4}{n\\pi}$`, easyCheck: false, verify: p => oddEvenIs(p, n => rodBn(Ut, n)) };
      },
      s2(r) {
        const Ut = r.pick(U14), kind = turn(r, '14s2', 3);
        if (kind === 0) return { q: `${rodTxt(Ut)}のまん中の温度を、1項めだけで $□\\,e^{-0.0987t}$ と書く（$\\alpha(\\frac{\\pi}{L})^2=0.0987$）`, a: `$${fracX(4 * Ut, 1, '\\pi')}$`, key: `m|${Ut}`,
          easy: `$b_1\\sin\\dfrac{\\pi}{2}=\\dfrac{${4 * Ut}}{\\pi}\\times1$`, easyCheck: 'last', verify: p => valIs(p, rodBn(Ut, 1) * Math.sin(PI / 2), 1e-7) };
        if (kind === 1) return { q: `${rodTxt(Ut)}のまん中の温度の、2項め（$n=3$）を $□\\,e^{-9\\times0.0987t}$ と書く（符号もつけて）`, a: `$${fracX(-4 * Ut, 3, '\\pi')}$`, key: `3|${Ut}`,
          easy: `$b_3\\sin\\dfrac{3\\pi}{2}=\\dfrac{${4 * Ut}}{3\\pi}\\times(-1)$`, easyCheck: false, verify: p => valIs(p, rodBn(Ut, 3) * Math.sin(3 * PI / 2), 1e-7) };
        return { q: `${rodTxt(Ut)}の、$x=\\dfrac{L}{6}$ の温度を、1項めだけで $□\\,e^{-0.0987t}$ と書く`, a: `$${fracX(2 * Ut, 1, '\\pi')}$`, key: `6|${Ut}`,
          easy: `$b_1\\sin\\dfrac{\\pi}{6}=\\dfrac{${4 * Ut}}{\\pi}\\times\\dfrac12$`, easyCheck: false, verify: p => valIs(p, rodBn(Ut, 1) * Math.sin(PI / 6), 1e-7) };
      },
      // 見かけがちがう：数を入れた温度・ある温度になる時刻
      s3(r) {
        const Ut = r.pick([20, 30, 40, 60, 80, 100]);
        if (turn(r, '14s3', 2) === 0) {
          const t = r.pick([5, 10, 15, 20, 25, 30]), e = E14[t];
          if (Ut === 50 && t === 10) return null;
          const ap = Ut * 1.273 * e, a = agree(ap, 4 * Ut / PI * Math.exp(-0.0987 * t), 1); if (a == null) return null;
          return { q: `${rodTxt(Ut)}のまん中の、${t}秒後の温度（℃）を1項めだけで（$\\alpha(\\frac{\\pi}{L})^2=0.0987$、$\\dfrac{4}{\\pi}=1.273$、$e^{-${nf(0.0987 * t)}}=${e}$。小数第1位まで）`, a: `約 $${a}$`, key: `T|${Ut}|${t}`,
            easy: `$${Ut}\\times1.273\\times${e}\\approx${a}$`, easyCheck: false, verify: p => valIs(p, +rd(rodBn(Ut, 1) * Math.exp(-0.0987 * t), 1)) };
        }
        const C = 4 * Ut / PI, Cs = (Math.round(C * 100) / 100).toFixed(2), Tm = r.pick([10, 15, 20, 25, 30, 40, 50].filter(x => x < 0.8 * Ut));
        if (!Tm) return null;
        const L = Math.log(Tm / +Cs), Ls = (Math.round(L * 1000) / 1000).toFixed(3), tt = -(+Ls) / 0.0987, tr = -Math.log(Tm / C) / 0.0987;
        if (tr < 5) return null;
        const a = agree(tt, tr, 1); if (a == null) return null;
        return { q: `${rodTxt(Ut)}のまん中が $${Tm}$ ℃になる時刻（秒）を1項めだけで（$\\alpha(\\frac{\\pi}{L})^2=0.0987$、$\\dfrac{${4 * Ut}}{\\pi}=${Cs}$、$\\ln\\dfrac{${Tm}}{${Cs}}=${Ls}$。小数第1位まで）`, a: `約 $${a}$`, key: `t|${Ut}|${Tm}`,
          easy: `$${Cs}e^{-0.0987t}=${Tm}$、$-0.0987t=${Ls}$、$t=${nf(-(+Ls))}\\div0.0987\\approx${a}$`, easyCheck: false, verify: p => valIs(p, +rd(-Math.log(Tm / rodBn(Ut, 1)) / 0.0987, 1)) };
      },
      // わな：はじめが直線の棒（半区間の展開。9-21）
      trap(r) {
        const k = r.pick([30, 60, 100, 50]);
        return dest({ q: `長さ $L$ の棒の、はじめの温度が $${k}\\dfrac{x}{L}$ ℃（両はしは0 ℃に保つ）。$\\sin\\dfrac{n\\pi x}{L}$ の係数 $b_n$：$n$ が奇数なら □、偶数なら □`, a: oe(fracX(2 * k, 1, 'n\\pi'), fracX(-2 * k, 1, 'n\\pi')), key: `l|${k}`,
          verify: p => oddEvenIs(p, n => 2 * integ(x => k * x * Math.sin(n * PI * x), 0, 1, 2000)) }, '9-14',
          `はじめがどこも同じ温度ではないので、方形波にならない。$b_n=\\dfrac{2}{L}\\displaystyle\\int_0^L${k}\\dfrac{x}{L}\\sin\\dfrac{n\\pi x}{L}\\,\\dd x=\\dfrac{${2 * k}(-1)^{n+1}}{n\\pi}$`, ['9-21']);
      },
    },
  });

  // ================================================================ 9-15
  const L15 = [0.25, 0.3, 0.4, 0.6, 0.65, 0.75, 0.8, 1.2];
  const F15 = [100, 110, 150, 200, 220, 250, 300, 440];
  add({
    id: '9-15', part: 1, chap: '9-1⑨ 例題8', stars: 1,
    title: '弦の $n$ 番めは $f_n=\\dfrac{nc}{2L}$：$c=2Lf_1$、長さ半分で2倍',
    mark: '弦の長さ・基本の周波数・倍音。',
    futsu: ['毎回 $f_n=\\dfrac{nc}{2L}$ に戻り、', 'まず $c$ を出してから', '$n$ と $L$ を入れ直す。'],
    raku: ['長さ $0.5\\,\\mathrm{m}$、基本200 Hz', '→ $c=2\\times0.5\\times200=200$（m/s）', '3番めの倍音は $3\\times200=600$ Hz（$c$ を出さなくてよい）', '長さ $0.25\\,\\mathrm{m}$ なら400 Hz'],
    why: '両はしを止めた弦の $n$ 番めのゆれは、周波数 $f_n=\\dfrac{nc}{2L}$ でゆれる（波動方程式を変数分離。9-1⑨）。$f_1=\\dfrac{c}{2L}$ なので $c=2Lf_1$、$f_n=nf_1$（基本の整数倍＝倍音）。同じ弦（同じ $c$）で長さを $\\dfrac12$ にすると、周波数は2倍（1オクターブ上）。',
    caution: '$f_n$ の $f$ は周波数（Hz）で、関数の $f$ ではない。$2L$ の2を忘れない（$c=Lf_1$ ではない）。長さと周波数は反比例（長いほど低い）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /弦/.test(q) && !/つまんで|出ない/.test(q); },
    steps: {
      s1(r) {
        const L = r.pick(L15), f1 = r.pick(F15);
        if (L === 0.5 && f1 === 200) return null;
        if (turn(r, '15s1', 2) === 0) {
          const c = r9(2 * L * f1); if (decs(c) > 1) return null;
          return { q: `長さ ${U(nf(L), 'm')}、基本の周波数 ${U(f1, 'Hz')} の弦を伝わる波の速さ $c$（m/s）`, a: `$${nf(c)}$`, key: `${L}|${f1}`, easy: `$2\\times${nf(L)}\\times${f1}=${nf(c)}$`, easyCheck: 'last', verify: p => valIs(p, f1 * 2 * L) };
        }
        const n = r.int(2, 5);
        return { q: `長さ ${U(nf(L), 'm')}、基本の周波数 ${U(f1, 'Hz')} の弦の、${n}番めの成分の周波数（Hz）`, a: `$${n * f1}$`, key: `${L}|${f1}`, easy: `$c$ を出さずに $${n}\\times${f1}=${n * f1}$`, easyCheck: 'last', verify: p => valIs(p, n * (2 * L * f1) / (2 * L)) };
      },
      s2(r) {
        const kind = turn(r, '15s2', 2);
        if (kind === 0) {
          const L = r.pick([0.4, 0.5, 0.6, 0.8, 1]), f1 = r.pick([100, 125, 150, 200, 250]), c = r9(2 * L * f1), n = r.int(1, 4), v = n * f1;
          if (L === 0.5 && f1 === 200) return null;   // 左ページの例の弦（O-2）
          return { q: `長さ ${U(nf(L), 'm')} の弦を伝わる波の速さが ${U(nf(c), 'm/s')} のとき、${n === 1 ? '基本' : `${n}番めの成分`}の周波数（Hz）`, a: `$${v}$`, key: `${L}|${f1}`,
            easy: `$\\dfrac{${n === 1 ? '' : n}${n === 1 ? '' : '\\times'}${nf(c)}}{2\\times${nf(L)}}=${v}$`, easyCheck: 'last', verify: p => valIs(p, n * c / (2 * L)) };
        }
        const f1 = r.pick([110, 150, 200, 220, 300, 330]), [num, den, txt] = r.pick([[1, 2, '半分'], [2, 3, '$\\dfrac23$'], [3, 4, '$\\dfrac34$'], [2, 1, '2倍'], [1, 3, '$\\dfrac13$']]), v = r9(f1 * den / num);
        if (decs(v) > 0) return null;
        return { q: `基本の周波数 ${U(f1, 'Hz')} の弦をおさえて、ゆれる長さを${txt}にした。基本の周波数（Hz）`, a: `$${nf(v)}$`, key: `l|${f1}|${num}/${den}`,
          easy: `長さと周波数は反比例。$${f1}\\times${num === 1 ? den : `\\dfrac{${den}}{${num}}`}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, f1 / (num / den)) };
      },
      // 見かけがちがう：倍音から基本・ちょうど1オクターブ上の長さ
      s3(r) {
        if (turn(r, '15s3', 2) === 0) {
          const f1 = r.pick([130, 165, 147, 196, 175]), n = r.int(3, 5);
          return { q: `ギターの弦の ${n}番めの倍音（成分）が ${U(n * f1, 'Hz')} だった。この弦の基本の周波数（Hz）`, a: `$${f1}$`, key: `o|${f1}|${n}`, easy: `$${n * f1}\\div${n}=${f1}$`, easyCheck: 'last', verify: p => valIs(p, n * f1 / n) };
        }
        const [L, k] = r.pick([[0.6, 2], [0.65, 2], [0.7, 2], [0.64, 2], [0.6, 3], [0.66, 3], [0.75, 3], [0.9, 3]]), v = r9(L / k);
        return { q: `長さ ${U(nf(L), 'm')} の弦（同じ $c$）で、基本の周波数を${k}倍にするには、ゆれる長さを何 m にすればよいか`, a: `$${nf(v)}$`, key: `p|${L}|${k}`, easy: `$f_1=\\dfrac{c}{2L}$ は長さに反比例。$${nf(L)}\\div${k}=${nf(v)}$`, easyCheck: 'last', verify: p => valIs(p, L / k) };
      },
      // わな：まん中ではじいた弦の、出ない倍音（9-91）
      trap(r) {
        const f1 = r.pick([110, 200, 220, 150]);
        return dest({ q: `基本の周波数 ${U(f1, 'Hz')} の弦のまん中をつまんで、はじいた。出ない成分のうち、いちばん低いものの周波数（Hz）`, a: `$${2 * f1}$`, key: `m|${f1}`,
          verify: p => { const bn = n => 2 * integ(x => (x < 0.5 ? x : 1 - x) * Math.sin(n * PI * x), 0, 1, 2000); let n = 1; while (n < 10 && Math.abs(bn(n)) > 1e-9) n++; return valIs(p, n * f1); } }, '9-15',
          `どの倍音が出るかは、はじいた形の係数 $b_n$ で決まる。まん中ではじくと $b_n$ の偶数番が0。いちばん低いのは2番めで $2\\times${f1}=${2 * f1}$`, ['9-91']);
      },
    },
  });
})(globalThis.MONDAI);

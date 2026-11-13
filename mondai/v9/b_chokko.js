/* 問題集 第9巻　第2部 成分の取り出し方：直交性と複素数の係数（わざ 9-16〜9-30、9-91・9-92）　組 b
 * 書き方は v8/README.md（第8・9巻の手引き）→ v6/README.md・v5/README.md。文は教科書 第9巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 9-2・9-3 の数・ことば・記号にそろえる（直交・直交性、内積、長さの2乗、$\dfrac{a_0}{2}$、場合分けの表9-2 の A〜J、偶関数・奇関数、半区間の展開、
 *   整流（半波整流・全波整流）、パーセバルの等式、ひずみ率、複素フーリエ係数 $c_n$、$c_{-n}=\overline{c_n}$、両側スペクトル、倍率 $\dfrac{1}{1+jn\omega_0\tau}$、輪の熱）。
 *   用字は「おそい」「はかる」（W-13）。虚数単位は $j$。$\dfrac{1}{j}=-j$。
 * 答え：$\pi$・$\sqrt{\phantom{2}}$ を残した形（$\dfrac{4}{3\pi}$）。複素数は $a+bj$ の形（$-\dfrac{3}{\pi}j$）。係数の式は「奇数なら □、偶数なら □」の2つの欄（W-3）。
 *   約の値は、使う値とけたを文に書いたときだけ（W-2・O-4。文の値で計算した答えと、ほんとうの値を丸めた答えがくいちがう組は出さない：agree）。
 * 検算：定積分は calc（defint）、式は calc（fn）、そのほかは verify(p) で、問題を作った計算とは別の道すじ（数値積分・複素数の計算）で確かめる。
 * 図はステップ3だけ（K-2）：9-18 は整流した波、9-19 は区間ごとに一定の波（G.pw）、9-21 は 0〜$L$ の形と半回転して広げた形、9-26 は両側スペクトルの棒（M.stem）。
 *   表は 9-23（はかった値。p.table）。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2・S-2・U-2。EXANS と、わざごとのよけ方）。1つのステップに同じ答えを3つ以上出さない（U-3。add）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7・U-4）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F;
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const evc = (t, vars) => M.evalC(String(t), vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const r9 = v => Math.round(v * 1e9) / 1e9;
  const nf = v => { const s = String(+(+r9(v)).toFixed(9)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const par = v => (String(v).startsWith('-') ? `(${v})` : String(v));
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  // 分数 f（M.F）×π^e の TeX。e は π のべき（-2〜2）
  function pq(f, e) {
    e = e || 0;
    const [n, d] = f; if (n === 0) return '0';
    const sg = n < 0 ? '-' : '', a = Math.abs(n), P = e === 0 ? '' : '\\pi' + (Math.abs(e) === 2 ? '^2' : '');
    if (e >= 0) { const top = (a === 1 && P ? '' : String(a)) + P; return sg + (d === 1 ? top : `\\dfrac{${top}}{${d}}`); }
    return sg + `\\dfrac{${a}}{${d === 1 ? '' : d}${P}}`;
  }
  const pv = (f, e) => f[0] / f[1] * Math.PI ** (e || 0);
  // 複素数 re + im j の TeX（re・im は [分数, π のべき]）
  function cx(re, im) {
    const R = re && re[0][0] !== 0 ? pq(re[0], re[1]) : '', I0 = im && im[0][0] !== 0 ? im : null;
    if (!I0) return R || '0';
    let I = (I0[1] === 0 && Math.abs(I0[0][0]) === 1 && I0[0][1] === 1) ? (I0[0][0] < 0 ? '-' : '') + 'j' : pq(I0[0], I0[1]) + 'j';
    if (R && !I.startsWith('-')) I = '+' + I;
    return R + I;
  }
  const cxv = (re, im) => [re ? pv(re[0], re[1]) : 0, im ? pv(im[0], im[1]) : 0];
  // 文の値で計算した答え a（小数）と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4）。ちがえば null。けたの境（…5）にごく近いときも出さない
  const rd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-9) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  const agree = (a, v, k) => { const s = rd(a, k); if (s !== rd(v, k)) return null; for (const w of [a, v]) { const x = Math.abs(w) * 10 ** k; if (Math.abs(x - Math.floor(x) - 0.5) < 0.02) return null; } return s; };
  // 数値積分（シンプソン。検算用：問題を作った式とは別の道すじ）
  function simpson(f, a, b, n) { n = n || 2000; const h = (b - a) / n; let s = f(a) + f(b); for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h); return s * h / 3; }
  const csimpson = (f, a, b, n) => [simpson(t => f(t)[0], a, b, n), simpson(t => f(t)[1], a, b, n)];
  // 1周期 T の波 f の c_n（数値積分）
  const cnNum = (f, T, n, a0) => { const w = 2 * Math.PI / T, a = a0 || 0; const c = csimpson(t => { const v = f(t); return [v * Math.cos(n * w * t), -v * Math.sin(n * w * t)]; }, a, a + T, 4000); return [c[0] / T, c[1] / T]; };
  const anNum = (f, T, n, a0) => 2 / T * simpson(t => f(t) * Math.cos(n * 2 * Math.PI / T * t), a0 || 0, (a0 || 0) + T, 4000);
  const bnNum = (f, T, n, a0) => 2 / T * simpson(t => f(t) * Math.sin(n * 2 * Math.PI / T * t), a0 || 0, (a0 || 0) + T, 4000);
  const meanNum = (f, T, a0) => simpson(f, a0 || 0, (a0 || 0) + T, 4000) / T;
  // とびのある波：cuts（とびの時刻）で区切って積分する
  const cutInt = (f, a, b, cuts) => { const xs = [a, ...(cuts || []).filter(c => c > a && c < b).sort((x, y) => x - y), b]; let s = 0; const e = (b - a) * 1e-11; for (let k = 1; k < xs.length; k++) s += simpson(f, xs[k - 1] + e, xs[k] - e, 800); return s; };

  // ---------------------------------------------------------------- 答えの読み方と検算の部品
  const mathsOf = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, ''));
  const nums = a => mathsOf(a).map(t => ev(t));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol || 1e-9)) || `答え ${p.a} が ${nf(v)} でない`; };
  const valsAre = (p, vs, tol) => { const n = nums(p.a); return (n.length === vs.length && n.every((x, i) => near(x, vs[i], tol || 1e-9))) || `答え ${p.a} が ${vs.map(nf).join('、')} でない`; };
  // 答え（複素数1つ）が w = [re, im] か
  const cvalIs = (p, w, tol) => { const m = mathsOf(p.a); const g = m.length === 1 ? evc(m[0]) : null; return (g && Math.hypot(g[0] - w[0], g[1] - w[1]) <= (tol || 1e-9) * Math.max(1, Math.hypot(...w))) || `答え ${p.a} が ${nf(w[0])}+${nf(w[1])}j でない`; };
  // 答えの式（文字 n をふくむ）が、n=1〜6 のうち ns で want(n) と同じか（複素数も）
  const fnIs = (p, want, ns, k) => { const m = mathsOf(p.a)[k || 0]; if (m == null) return `答え ${p.a} が読めない`; for (const n of ns) { const g = evc(m, { n }), w = want(n); const W = Array.isArray(w) ? w : [w, 0]; if (!g || Math.hypot(g[0] - W[0], g[1] - W[1]) > 1e-7 * Math.max(1, Math.hypot(...W))) return `答え ${p.a} が n=${n} でちがう`; } return true; };
  // 「奇数なら □、偶数なら □」の2つの欄（W-3）：coef(n) は正しい値（数か [re, im]）
  const oeIs = (p, coef) => { const m = mathsOf(p.a); if (m.length !== 2) return `答え ${p.a} の欄が2つでない`; const r1 = fnIs({ a: '$' + m[0] + '$' }, coef, [1, 3, 5]); return r1 !== true ? r1 : fnIs({ a: '$' + m[1] + '$' }, coef, [2, 4, 6]); };
  const OE = '$n$ が奇数なら □、偶数なら □';

  // ---------------------------------------------------------------- 同じ答えを出しすぎない（U-3・第41回）
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  const normA = a => String(a).replace(/\s|\\,|\\ /g, '').replace(/\\dfrac|\\tfrac/g, '\\frac');
  // EX：左ページの例（楽な形）と同じ答え。ステップ1〜3に出さない（O-2・U-2）
  const exNorm = s => normA(String(s).replace(/^約\s*/, '').replace(/\$/g, ''));
  const EXANS = {
    '9-16': ['2\\pi'], '9-17': ['\\dfrac{1}{2}', '-\\dfrac{1}{2}', '-\\dfrac{1}{4}'], '9-18': ['100'],
    '9-19': ['\\dfrac{4\\sin\\frac{n\\pi}{2}}{n\\pi}'], '9-20': ['\\dfrac{3\\pi}{2}', '奇数 -\\dfrac{12}{\\pi n^2}、偶数 0'], '9-21': ['\\dfrac{60(-1)^{n+1}}{n\\pi}', '19.1', '-9.55'],
    '9-22': ['-\\dfrac{4}{3\\pi}'], '9-24': ['16.5', '\\dfrac{\\pi^2}{8}'], '9-25': ['20', '48.3'], '9-26': ['2', '3', '4', '-4j', '4j'], '9-27': ['4\\cos t-6\\sin t'],
    '9-28': ['3', '奇数 \\dfrac{6}{jn\\pi}、偶数 0'], '9-29': ['0.90', '0.13', '\\dfrac{1}{\\sqrt2}', '\\dfrac{1}{\\sqrt{10}}'], '9-30': ['50', '69', '69.3', '7.7'],
    '9-91': ['0.811', '\\dfrac{8}{\\pi^2}'], '9-92': ['\\dfrac{j(-1)^n}{n}'],
  };
  function add(def) {
    const ex = new Set((EXANS[def.id] || []).map(exNorm));
    for (const k of ['s1', 's2', 's3', 'trap']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => { const p = f(r); if (!p) return p; if (k !== 'trap' && ex.has(exNorm(p.a))) return null; return ansOK(r, def.id + k, normA(p.ans || p.a), 2, p.key || p.q) ? p : null; };
    }
    M.add(def);
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部・巻のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(9).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 2 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // 三角関数の字：tf('sin', 3) → \sin3t、tf('cos', 1) → \cos t。w は t の前の文字（\omega_0 など）
  const tf = (k, m, w) => `\\${k}${m === 1 ? (w ? '' : ' ') : m}${w || ''}t`;
  const tf2 = (k, m) => `\\${k}^2${m === 1 ? '' : m}t`;            // \sin^2 3t
  const cf = (k, m) => `\\${k}(${m}t)`;                             // 検算の式
  const INT2PI = '\\displaystyle\\int_0^{2\\pi}';
  const coefT = (c, first) => (c === 1 ? (first ? '' : '+') : c === -1 ? '-' : (c > 0 && !first ? '+' : '') + nf(c));
  // a\sin pt+b\cos qt+… の TeX（terms = [[係数, 'sin'|'cos'|'1', 番号], …]）
  const sumTeX = (terms, w) => terms.filter(t => t[0] !== 0).map((t, i) => (t[1] === '1' ? ((t[0] > 0 && i ? '+' : '') + nf(t[0])) : coefT(t[0], i === 0) + tf(t[1], t[2], w))).join('') || '0';
  const sumVal = (terms, t, w) => terms.reduce((s, [c, k, m]) => s + c * (k === '1' ? 1 : Math[k](m * (w || 1) * t)), 0);

  // ================================================================ 9-16
  // 左ページの例：∫ sin3t sin5t、∫ cos^2 4t、∫ sin2t cos2t、(3 sin t + 2 sin 4t) sin 4t
  const EX16 = new Set(['ss|3,5', 'cc|4,4', 'sc|2,2']);
  add({
    id: '9-16', part: 2, chap: '9-2①②④', stars: 1,
    title: '直交性：ちがう番号の積は1周期で0、同じものは $\\pi$',
    mark: '$\\int_0^{2\\pi}\\sin mt\\sin nt\\,\\dd t$、和の波に $\\sin nt$ をかけて積分。',
    futsu: ['積和の式で和に直し', '（$\\sin mt\\sin nt=\\frac12\\{\\cos(m-n)t$', '$-\\cos(m+n)t\\}$）、1つずつ積分して、', '$2\\pi$ と0を入れる。'],
    raku: ['$\\int_0^{2\\pi}\\sin3t\\sin5t\\,\\dd t=0$（番号がちがう）', '$\\int_0^{2\\pi}\\cos^24t\\,\\dd t=\\pi$（同じもの）', '$\\int_0^{2\\pi}\\sin2t\\cos2t\\,\\dd t=0$（$\\sin$ と $\\cos$）', '$\\int_0^{2\\pi}(3\\sin t+2\\sin4t)\\sin4t\\,\\dd t$', '$=2\\times\\pi=2\\pi$（$\\sin4t$ の項だけ残る）'],
    why: 'ちがう番号の $\\sin$・$\\cos$ をかけて1周期で積分すると、上と下の面積が打ち消して0になる（直交性。9-2②③）。同じ番号の $\\sin$ どうし・$\\cos$ どうしだけが残り、$\\sin^2$ の平均は $\\frac12$ なので、1周期 $2\\pi$ では $\\pi$（長さの2乗）。周期 $T$ の波なら $\\frac{T}{2}$。だから、和の波に $\\sin nt$ をかけて積分すると、その番号の項だけが「係数×$\\pi$」で残る（9-2④）。',
    caution: '$\\sin$ と $\\cos$ は、同じ番号でも0（$\\sin2t\\cos2t$）。1周期でなく半周期（0から $\\pi$）の積分では、0にならないことがある（わざ 9-22）。周期 $T$ の形では、同じものどうしは $\\pi$ でなく $\\frac{T}{2}$。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '16mm', s3: '16mm', trap: '14mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /\\int_0\^\{(2\\pi|T|0\.\d+)\}/.test(q) && /\\(sin|cos)/.test(q) && !/e\^\{|\\lvert/.test(q); },
    steps: {
      // 1周期 0〜2π：0 か π
      s1(r) {
        const same = turn(r, '16s1', 2) === 0;
        let kind, m, n;
        if (same) { kind = r.pick(['ss', 'cc']); m = n = r.int(1, 6); }
        else { kind = r.pick(['ss', 'cc', 'sc', 'sc']); m = r.int(1, 6); n = r.int(1, 6); if (kind !== 'sc' && m === n) return null; if (kind !== 'sc' && m > n) [m, n] = [n, m]; }
        const key = `${kind}|${m},${n}`;
        if (EX16.has(key)) return null;   // 左ページの例（O-2）
        const [k1, k2] = kind === 'ss' ? ['sin', 'sin'] : kind === 'cc' ? ['cos', 'cos'] : ['sin', 'cos'];
        const body = m === n && kind !== 'sc' ? tf2(k1, m) : tf(k1, m) + tf(k2, n);
        const v = m === n && kind !== 'sc' ? Math.PI : 0;
        return { q: `$${INT2PI}${body}\\,\\dd t$`, a: v ? '$\\pi$' : '$0$', key,
          easy: v ? '同じ番号の同じ種類なので、長さの2乗 $\\pi$' : (kind === 'sc' ? '$\\sin$ と $\\cos$ の積は、いつも0' : '番号がちがうので0'), easyCheck: false,
          calc: { kind: 'defint', f: `${cf(k1, m)}${cf(k2, n)}`, x: 't', a: 0, b: '2\\pi' } };
      },
      // 周期 T の形：同じものは T/2
      s2(r) {
        const k = turn(r, '16s2', 4);
        if (k === 3) {   // 文字の T
          const same = r.chance(0.6), m = r.int(1, 5), n = same ? m : r.intNot(1, 5, x => x === m), kd = r.pick(['sin', 'cos']);
          const body = same ? `\\${kd}^2${m === 1 ? '' : m}\\omega_0t` : `\\sin${m === 1 ? '' : m}\\omega_0t\\,\\cos${n === 1 ? '' : n}\\omega_0t`;
          return { q: `周期 $T$、$\\omega_0=\\dfrac{2\\pi}{T}$ のとき、$\\displaystyle\\int_0^{T}${body}\\,\\dd t$`, a: same ? '$\\dfrac{T}{2}$' : '$0$', key: `T|${same}|${kd}|${m},${n}`, easyCheck: false,
            easy: same ? '長さの2乗は周期の半分' : '$\\sin$ と $\\cos$ の積は1周期で0',
            verify: p => { const T = 0.73, w = 2 * Math.PI / T, I = simpson(t => same ? Math[kd](m * w * t) ** 2 : Math.sin(m * w * t) * Math.cos(n * w * t), 0, T); const g = ev(mathsOf(p.a)[0], { T }); return near(g, I, 1e-7) || `答え ${p.a} がちがう`; } };
        }
        const f0 = r.pick([50, 100, 200, 250, 500]), T = 1 / f0, same = k !== 1;
        const m = r.int(1, 3), n = same ? m : r.intNot(1, 3, x => x === m), k1 = r.pick(['sin', 'cos']), k2 = same ? k1 : r.pick(['sin', 'cos']);
        if (f0 === 50 && m === 1 && same) return null;   // 目録の例（$\int_0^{0.02}\sin^2(100\pi t)\,\dd t=0.01$）
        const W = j => `${2 * j * f0}\\pi t`;
        const body = same ? `\\${k1}^2(${W(m)})` : `\\${k1}(${W(m)})\\${k2}(${W(n)})`;
        const v = same ? T / 2 : 0;
        return { q: `$\\displaystyle\\int_0^{${nf(T)}}${body}\\,\\dd t$`, a: `$${nf(v)}$`, key: `F|${f0}|${k1}${m},${k2}${n}`, easyCheck: false,
          easy: same ? `周期 $${nf(T)}$ の何周かぶん。同じものどうしは周期の半分 $\\dfrac{${nf(T)}}{2}$` : `周期 $${nf(T)}$ で番号がちがうので0`,
          calc: { kind: 'defint', f: same ? `(\\${k1}(${W(m)}))^2` : `\\${k1}(${W(m)})\\${k2}(${W(n)})`, x: 't', a: 0, b: nf(T) } };
      },
      // 和の波に sin・cos をかけて積分：その項だけが残る
      s3(r) {
        if (turn(r, '16s3', 2) === 0) {
          const ks = r.shuffle([1, 2, 3, 4, 5]).slice(0, 3), cs = ks.map(() => r.pick([-4, -3, -2, 2, 3, 4, 5, 6]));
          const terms = [[cs[0], 'sin', ks[0]], [cs[1], 'cos', ks[1]], [cs[2], 'sin', ks[2]]];
          const j = r.int(0, 2), [c, kd, m] = terms[j];
          if (r.chance(0.3)) terms.unshift([r.pick([1, 2, 3]), '1', 0]);
          return { q: `$f(t)=${sumTeX(terms)}$ のとき、$${INT2PI}f(t)${tf(kd, m)}\\,\\dd t$`, a: `$${pq(fr(c), 1)}$`, key: `sum|${JSON.stringify(terms)}|${j}`, easyCheck: false,
            easy: `$${tf(kd, m)}$ の項だけが残る。$${par(c)}\\times\\pi$`,
            calc: { kind: 'defint', f: terms.map(([cc, kk, mm]) => (kk === '1' ? `(${cc})` : `(${cc})${cf(kk, mm)}`)).join('+').replace(/^/, '(') + `)${cf(kd, m)}`, x: 't', a: 0, b: '2\\pi' } };
        }
        // 周期 T（教科書 9-2④ のド・ミ・ソの形）：その周波数の sin をかけて積分すると「係数×T/2」
        const f0 = r.pick([50, 100]), T = 1 / f0, ms = r.pick([[4, 5, 6], [2, 3, 4], [3, 4, 5], [2, 4, 6]]), cs = ms.map(() => r.pick([0.2, 0.4, 0.5, 0.8, 1, 2, 3]));
        const j = r.int(0, 2), W = j2 => `${2 * j2 * f0}\\pi t`;
        if (f0 === 50 && ms.join() === '4,5,6' && cs[1] === 0.6) return null;
        const terms = ms.map((m, i) => `${cs[i] === 1 ? '' : nf(cs[i])}\\sin(${W(m)})`).join('+');
        const v = cs[j] * T / 2;
        return { q: `$f(t)=${terms}$（周期 $${nf(T)}\\,\\mathrm{s}$）のとき、$\\displaystyle\\int_0^{${nf(T)}}f(t)\\sin(${W(ms[j])})\\,\\dd t$`, a: `$${nf(v)}$`, key: `F|${f0}|${ms}|${cs}|${j}`, easyCheck: false, boxw: '20mm',
          easy: `$\\sin(${W(ms[j])})$ の項だけ残る。$${nf(cs[j])}\\times\\dfrac{${nf(T)}}{2}$`,
          calc: { kind: 'defint', f: `(${ms.map((m, i) => `${nf(cs[i])}\\sin(${W(m)})`).join('+')})\\sin(${W(ms[j])})`, x: 't', a: 0, b: nf(T) } };
      },
      // わな：半周期の積分（直交性は使えない。積和の式で定積分。9-22）
      trap(r) {
        const m = r.int(1, 4), n = r.intNot(1, 4, x => x === m || (x + m) % 2 === 0);
        const v = fr(2 * m, m * m - n * n);
        return dest({ q: `$\\displaystyle\\int_0^{\\pi}${tf('sin', m)}${tf('cos', n)}\\,\\dd t$`, a: `$${pq(v)}$`, key: `half|${m},${n}`,
          calc: { kind: 'defint', f: `${cf('sin', m)}${cf('cos', n)}`, x: 't', a: 0, b: '\\pi' } }, '9-16',
          `0から $\\pi$ は半周期なので、直交性では0にならない。積和の式で和に直して定積分`, ['9-22']);
      },
    },
  });

  // ================================================================ 9-17
  // 係数の名前（a_n・b_n・定数の項）
  const sb = n => (String(n).length > 1 ? `{${n}}` : String(n));   // 下つき：2けた・負の数は { }
  const coefName = (k, n) => (k === 'c0' ? '\\dfrac{a_0}{2}' : `${k}_${sb(n)}`);
  const AA = [2, 3, 4, 5, 6, 8];
  // 和に直した形：{ c0, a: {n: 値}, b: {n: 値} }（値は M.F の分数）
  function exp17(kind, A, m, n) {
    const h = fr(A, 2), q = fr(A, 4), o = { c0: fr(0), a: {}, b: {} }, addA = (k, v) => { o.a[k] = F.add(o.a[k] || fr(0), v); }, addB = (k, v) => { o.b[k] = F.add(o.b[k] || fr(0), v); };
    if (kind === 'cc2') { o.c0 = h; addA(2 * m, h); }
    else if (kind === 'ss2') { o.c0 = h; addA(2 * m, F.mul(h, fr(-1))); }
    else if (kind === 'sc1') addB(2 * m, h);
    else if (kind === 'sc') { addB(m + n, h); if (m !== n) addB(Math.abs(m - n), m > n ? h : F.mul(h, fr(-1))); }
    else if (kind === 'cc') { addA(m + n, h); addA(Math.abs(m - n), h); }
    else if (kind === 'ss') { addA(m + n, F.mul(h, fr(-1))); addA(Math.abs(m - n), h); }
    else if (kind === 'c3') { addA(1, F.mul(q, fr(3))); addA(3, q); }
    else if (kind === 's3') { addB(1, F.mul(q, fr(3))); addB(3, F.mul(q, fr(-1))); }
    else if (kind === 'scc') { addB(1, q); addB(3, q); }
    return o;
  }
  const AT = A => (A === 1 ? '' : String(A));
  function tex17(kind, A, m, n) {
    return ({ cc2: `${AT(A)}${tf2('cos', m)}`, ss2: `${AT(A)}${tf2('sin', m)}`, sc1: `${AT(A)}${tf('sin', m)}${tf('cos', m)}`, sc: `${AT(A)}${tf('sin', m)}${tf('cos', n)}`,
      cc: `${AT(A)}${tf('cos', m)}${tf('cos', n)}`, ss: `${AT(A)}${tf('sin', m)}${tf('sin', n)}`, c3: `${AT(A)}\\cos^3t`, s3: `${AT(A)}\\sin^3t`, scc: `${AT(A)}\\sin t\\cos^2t` })[kind];
  }
  const fn17 = (kind, A, m, n) => t => A * ({ cc2: Math.cos(m * t) ** 2, ss2: Math.sin(m * t) ** 2, sc1: Math.sin(m * t) * Math.cos(m * t), sc: Math.sin(m * t) * Math.cos(n * t), cc: Math.cos(m * t) * Math.cos(n * t),
    ss: Math.sin(m * t) * Math.sin(n * t), c3: Math.cos(t) ** 3, s3: Math.sin(t) ** 3, scc: Math.sin(t) * Math.cos(t) ** 2 })[kind];
  // 0 でない係数の一覧 [[名前の種類, 番号, 値], …]
  const list17 = o => [...(o.c0[0] ? [['c0', 0, o.c0]] : []), ...Object.keys(o.a).filter(k => o.a[k][0]).map(k => ['a', +k, o.a[k]]), ...Object.keys(o.b).filter(k => o.b[k][0]).map(k => ['b', +k, o.b[k]])];
  const sumOf17 = o => list17(o).map(([k, n, v], i) => { const t = F.tex(v).replace(/\\frac/g, '\\dfrac'); const s = k === 'c0' ? t : (Math.abs(v[0]) === 1 && v[1] === 1 ? (v[0] < 0 ? '-' : '') : t) + tf(k === 'a' ? 'cos' : 'sin', n); return (i && !s.startsWith('-') ? '+' : '') + s; }).join('');
  add({
    id: '9-17', part: 2, chap: '9-2⑦ 例題1・9-3 例題3', stars: 1,
    title: '$\\sin$・$\\cos$ の積・累乗は、和に直して係数を読む',
    mark: '$\\sin^2t$、$\\cos^3t$、$\\sin t\\cos t$ の係数（場合 A）。',
    futsu: ['$a_n=\\frac{1}{\\pi}\\int_0^{2\\pi}f\\cos nt\\,\\dd t$ の式に', '入れて、番号ごとに', '定積分する。'],
    raku: ['$\\sin^2t=\\frac12-\\frac12\\cos2t$', '→ $\\frac{a_0}{2}=\\frac12$、$a_2=-\\frac12$', '$\\sin t\\cos t=\\frac12\\sin2t$ → $b_2=\\frac12$', '$c_n$ なら $\\sin^2t=-\\frac{e^{j2t}-2+e^{-j2t}}{4}$', '→ $c_0=\\frac12$、$c_{\\pm2}=-\\frac14$'],
    why: 'フーリエ級数の書き方は1通りしかない（9-2 せいかくに言うと）ので、$\\sin$・$\\cos$ の和に直した式の係数が、そのままフーリエ係数（場合 A）。2倍角の式・積和の式（4-9）で直せば、積分はいらない。$c_n$ なら、オイラーの公式 $\\cos t=\\frac{e^{jt}+e^{-jt}}{2}$、$\\sin t=\\frac{e^{jt}-e^{-jt}}{2j}$ で $e$ の式に直し、$e^{jnt}$ の前の数を読む（9-3 例題3）。',
    caution: '$\\cos^2$ は $+\\frac12\\cos2t$、$\\sin^2$ は $-\\frac12\\cos2t$。定数の項は $\\frac{a_0}{2}$（$a_0$ はその2倍）。$\\sin mt\\cos nt$ で $m<n$ なら、$\\sin(m-n)t=-\\sin(n-m)t$ でマイナスがつく。$c_n$ では $\\frac{1}{j}=-j$。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '14mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /\\(sin|cos)\^[23]|\\(sin|cos) ?\d*t\\(sin|cos)/.test(q) && /の \$(a_|b_|c_|\\dfrac\{a_0\})/.test(q) && !/\\int|\\lvert|整流/.test(q); },
    steps: {
      // 2倍角の式1回
      s1(r) {
        const kind = r.pick(['cc2', 'ss2', 'sc1']), A = r.pick(AA), m = r.int(1, 3), o = exp17(kind, A, m);
        const L = list17(o), [k, n, v] = r.pick(L);
        return { q: `$f(t)=${tex17(kind, A, m)}$ の $${coefName(k, n)}$`, a: `$${pq(v)}$`, key: `${kind}|${A},${m}|${k}${n}`, easyCheck: false,
          easy: `$${tex17(kind, A, m)}=${sumOf17(o)}$`,
          verify: p => { const f = fn17(kind, A, m), T = 2 * Math.PI; const w = k === 'c0' ? meanNum(f, T) : k === 'a' ? anNum(f, T, n) : bnNum(f, T, n); return valIs(p, w, 1e-7); } };
      },
      // 番号のちがう積・3乗
      s2(r) {
        const kind = r.pick(['sc', 'cc', 'ss', 'sc', 'c3', 's3', 'scc']), A = r.pick([1, 2, 4, 6, 8]);
        let m = r.int(1, 4), n = r.int(1, 4);
        if (['sc', 'cc', 'ss'].includes(kind)) { if (m === n) return null; if (kind !== 'sc' && m < n) [m, n] = [n, m]; }
        if (A === 1 && ['sc', 'cc', 'ss'].includes(kind)) return null;
        const o = exp17(kind, A, m, n), L = list17(o), [k, nn, v] = r.pick(L);
        return { q: `$f(t)=${tex17(kind, A, m, n)}$ の $${coefName(k, nn)}$`, a: `$${pq(v)}$`, key: `${kind}|${A},${m},${n}|${k}${nn}`, easyCheck: false,
          easy: `$${tex17(kind, A, m, n)}=${sumOf17(o)}$`,
          verify: p => { const f = fn17(kind, A, m, n), T = 2 * Math.PI; const w = k === 'a' ? anNum(f, T, nn) : bnNum(f, T, nn); return valIs(p, w, 1e-7); } };
      },
      // 複素数の係数 c_n（オイラーの公式で）
      s3(r) {
        const kind = r.pick(['cc2', 'ss2', 'sc1', 'c3', 's3']), A = kind === 'c3' || kind === 's3' ? r.pick([1, 2, 4, 8]) : r.pick([2, 4, 6, 8]), m = kind.length === 3 ? r.int(1, 3) : 1;
        // c_n の一覧（[n, re, im]）
        const h = fr(A, 2), q = fr(A, 4), e = fr(A, 8), neg = x => F.mul(x, fr(-1)), z = fr(0);
        const C = { cc2: [[0, h, z], [2 * m, q, z], [-2 * m, q, z]], ss2: [[0, h, z], [2 * m, neg(q), z], [-2 * m, neg(q), z]], sc1: [[2 * m, z, neg(q)], [-2 * m, z, q]],
          c3: [[1, F.mul(e, fr(3)), z], [-1, F.mul(e, fr(3)), z], [3, e, z], [-3, e, z]], s3: [[1, z, neg(F.mul(e, fr(3)))], [-1, z, F.mul(e, fr(3))], [3, z, e], [-3, z, neg(e)]] }[kind];
        const [n, re, im] = r.pick(C);
        const ans = cx([re, 0], [im, 0]);
        const sub = n < 0 ? `{${n}}` : (n > 9 ? `{${n}}` : n);
        return { q: `$f(t)=${tex17(kind, A, m)}$ の $c_${sub}$`, a: `$${ans}$`, key: `c|${kind}|${A},${m}|${n}`, easyCheck: false,
          // sc1 は聞いた番号まで書く（$c_{-4}$ なら $\overline{c_4}$ まで。Y-11・R1-18）。係数の1は書かない（Y-6）
          easy: kind === 'sc1' ? `$${tex17(kind, A, m)}=${A === 2 ? '' : pq(h)}\\sin${2 * m}t$。$c_{${2 * m}}=\\dfrac{0-j${A === 2 ? '' : `\\times${pq(h)}`}}{2}=${cx(0, [neg(q), 0])}$${n < 0 ? `、$c_{${n}}=\\overline{c_{${2 * m}}}=${ans}$` : ''}` :(n === 0 ? 'オイラーの公式で $e$ の式に直し、定数の項を読む' : `オイラーの公式で $e$ の式に直し、$e^{${n < 0 ? '-' : ''}j${Math.abs(n) === 1 ? '' : Math.abs(n)}t}$ の前の数を読む`),
          verify: p => cvalIs(p, cnNum(fn17(kind, A, m), 2 * Math.PI, n), 1e-7) };
      },
      // わな：全波整流・半波整流の平均（公式で和に直せない。面積÷周期。9-18）
      trap(r) {
        const A = r.pick([2, 3, 4, 5, 6]), full = r.chance(0.6);
        return dest({ q: full ? `$f(t)=\\lvert${AT(A)}\\sin t\\rvert$ の平均 $\\dfrac{a_0}{2}$` : `$f(t)=${AT(A)}\\sin t$ の負の部分を0にした波（半波整流）の平均 $\\dfrac{a_0}{2}$`,
          a: `$${pq(fr(full ? 2 * A : A), -1)}$`, key: `abs|${A}|${full}`, verify: p => valIs(p, meanNum(t => full ? Math.abs(A * Math.sin(t)) : Math.max(0, A * Math.sin(t)), 2 * Math.PI), 1e-7) }, '9-17',
          `${full ? '絶対値' : '負の部分を0にした形'}は、公式で $\\sin$・$\\cos$ の和に直せない。山1つの面積 $${2 * A}$ を使って、面積÷周期`, ['9-18']);
      },
    },
  });

  // ================================================================ 9-18
  // 整流した波の図（最大 A。答えの平均は図にかかない）
  function rectFig(full, lab) {
    const G = M.graph({ x0: 0, x1: 4 * Math.PI + 0.3, y0: 0, y1: 1.3, w: 8.5, h: 2.6 }), PI = ['$\\pi$', '$2\\pi$', '$3\\pi$', '$4\\pi$'];
    return { s: 5, items: [...G.axes({ xt: [1, 2, 3].map(k => k * Math.PI), xfmt: t => PI[Math.round(t / Math.PI) - 1], yt: [1], yfmt: () => lab, x: 't', y: 'v' }),
      ...G.plot(t => (full ? Math.abs(Math.sin(t)) : Math.max(0, Math.sin(t))), 0, 4 * Math.PI, { n: 200, thick: true })] };
  }
  // パルス：周期 2π で 0<t<w だけ A
  const W18 = [[fr(1, 2), '\\dfrac{\\pi}{2}'], [fr(1, 3), '\\dfrac{\\pi}{3}'], [fr(1, 4), '\\dfrac{\\pi}{4}'], [fr(2, 3), '\\dfrac{2\\pi}{3}'], [fr(1, 6), '\\dfrac{\\pi}{6}']];
  add({
    id: '9-18', part: 2, chap: '9-2⑦ 例題7・9-3 例題4', stars: 1,
    title: '平均（直流分）だけなら、1周期の面積÷周期',
    mark: '「平均の電圧」「整流」、$\\frac{a_0}{2}$・$c_0$ だけ（場合 G）。',
    futsu: ['$\\frac{a_0}{2}=\\frac{1}{2\\pi}\\int_0^{2\\pi}f\\,\\dd t$ を、', '区間に分けて', '積分する。'],
    raku: ['最大 $V_0$ の半波整流', '→ 山1つの面積 $2V_0$、周期 $2\\pi$', '→ 平均 $\\frac{V_0}{\\pi}$', '最大 $314\\,\\mathrm{V}$ なら $100\\,\\mathrm{V}$（$\\pi=3.14$）', '全波整流は山が2つで $\\frac{2V_0}{\\pi}$'],
    why: '平均（直流分）$\\frac{a_0}{2}$・$c_0$ は、1周期の積分÷周期、つまり「1周期のグラフの面積÷周期」（9-1⑥、場合 G）。$\\sin$ の山1つ（0から $\\pi$）の面積は $\\int_0^{\\pi}\\sin t\\,\\dd t=2$ なので、最大 $V_0$ の山1つは $2V_0$。区間ごとに一定の波も、長方形の面積でよい。',
    caution: '全波整流は1周期 $2\\pi$ に山が2つ（周期 $\\pi$ に山1つと見ても同じ）。平均を $a_0$ と書かない（$a_0$ は平均の2倍）。約の値は、文にある $\\pi$ の値で。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '16mm' }, boxh: { s1: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /平均/.test(q) && !/2乗の平均|平均の電力|輪|表/.test(q); },
    steps: {
      // 整流した電圧（π を残す）と、パルス
      s1(r) {
        if (turn(r, '18s1', 2) === 0) {
          const V = r.pick([50, 60, 120, 150, 200, 240, 300]), full = r.chance(0.5);
          const v = fr(full ? 2 * V : V);
          return { q: `最大 ${U(V, 'V')} の交流を${full ? '全波' : '半波'}整流した電圧の平均（V。$\\pi$ を残す）`, a: `$${pq(v, -1)}$`, key: `rect|${full ? 2 * V : V}`, easyCheck: false,
            easy: `山${full ? '2つ' : '1つ'}の面積 $${full ? `2\\times2\\times${V}` : `2\\times${V}`}$ を周期 $2\\pi$ でわる`,
            verify: p => valIs(p, meanNum(t => (full ? Math.abs(V * Math.sin(t)) : Math.max(0, V * Math.sin(t))), 2 * Math.PI), 1e-7) };
        }
        const A = r.pick([2, 3, 4, 6, 8, 12]), [w, wt] = r.pick(W18), v = F.mul(fr(A), F.mul(w, fr(1, 2)));
        return { q: `周期 $2\\pi$ で、$0<t<${wt}$ で $${A}$、$${wt}<t<2\\pi$ で $0$ の波の平均`, a: `$${pq(v)}$`, key: `pulse|${A}|${wt}`, easyCheck: false,
          easy: `面積 $${A}\\times${wt}$ を $2\\pi$ でわる`, verify: p => valIs(p, cutInt(t => (t < pv(w, 1) ? A : 0), 0, 2 * Math.PI, [pv(w, 1)]) / (2 * Math.PI), 1e-7) };
      },
      // 数で（π=3.14）、周期 T の信号
      s2(r) {
        if (turn(r, '18s2', 2) === 0) {
          const m = r.pick([50, 150, 200, 250, 300]), full = r.chance(0.5), V0 = r9(3.14 * m), a = full ? 2 * m : m;
          const s = agree(a, (full ? 2 : 1) * V0 / Math.PI, 0);
          if (!s) return null;
          return { q: `最大 ${U(nf(V0), 'V')} の交流を${full ? '全波' : '半波'}整流した電圧の平均（V。$\\pi=3.14$、整数で）`, a: `約 $${s}$`, key: `n|${m}|${full}`, easyCheck: false,
            easy: `$${full ? '2\\times' : ''}${nf(V0)}\\div3.14=${a}$`, verify: p => valIs(p, Math.round((full ? 2 : 1) * V0 / Math.PI), 1e-9) };
        }
        const T = r.pick([0.01, 0.02, 0.004, 0.005]), on = r9(T * r.pick([0.1, 0.2, 0.25, 0.4])), V = r.pick([3, 5, 6, 10, 12]), tri = r.chance(0.35);
        const v = r9((tri ? V * on / 2 : V * on) / T);
        return { q: `周期 ${U(nf(T), 's')} で、はじめの ${U(nf(on), 's')} だけ${tri ? `高さ ${U(V, 'V')} の三角形の形（二等辺三角形）` : ` ${U(V, 'V')}`}、のこりは ${U(0, 'V')} の電圧の平均（V）`, a: `$${nf(v)}$`, key: `T|${T}|${on}|${V}|${tri}`, easyCheck: false,
          easy: `面積 $${tri ? `\\dfrac12\\times${V}\\times${nf(on)}` : `${V}\\times${nf(on)}`}$ を周期 $${nf(T)}$ でわる`,
          verify: p => valIs(p, cutInt(t => (t < on ? (tri ? V * (1 - Math.abs(2 * t / on - 1)) : V) : 0), 0, T, [on / 2, on]) / T, 1e-7) };
      },
      // 図：整流した波
      s3(r) {
        const full = turn(r, '18s3', 2) === 0, V = r.pick([20, 30, 50, 90, 120, 180]);
        const v = fr(full ? 2 * V : V);
        return { q: `図は、最大 ${U(V, 'V')} の交流を${full ? '全波' : '半波'}整流した電圧 $v$ のグラフ。$v$ の平均（V。$\\pi$ を残す）`, a: `$${pq(v, -1)}$`, key: `fig|${V}|${full}`, easyCheck: false,
          easy: `1周期 $2\\pi$ に山${full ? '2つ' : '1つ'}。面積 $${full ? 4 * V : 2 * V}$ を $2\\pi$ でわる`, fig: rectFig(full, `$${V}$`),
          verify: p => valIs(p, meanNum(t => (full ? Math.abs(V * Math.sin(t)) : Math.max(0, V * Math.sin(t))), 2 * Math.PI), 1e-7) };
      },
      // わな：半波整流の a_n（平均ではない。積和の式で定積分。9-22）
      trap(r) {
        const A = r.pick([1, 2, 3, 4, 6]), n = r.pick([2, 4, 6]), v = fr(-2 * A, n * n - 1);
        return dest({ q: `最大 $${A}$ の半波整流した波（$0<t<\\pi$ で $${AT(A)}\\sin t$、$\\pi<t<2\\pi$ で $0$）の $a_${n}$`, a: `$${pq(v, -1)}$`, key: `a|${A}|${n}`,
          verify: p => valIs(p, anNum(t => Math.max(0, A * Math.sin(t)), 2 * Math.PI, n), 1e-7) }, '9-18',
          `平均ではなく $\\cos${n}t$ の係数。$\\sin t\\cos${n}t$ を積和の式で和に直して、0から $\\pi$ で定積分`, ['9-22']);
      },
    },
  });

  // ================================================================ 9-19
  const SYM = '$-\\pi<t<\\pi$ で';
  const EV19 = [['t^2', t => t * t], ['t\\sin t', t => t * Math.sin(t)], ['\\pi^2-t^2', t => Math.PI ** 2 - t * t], ['t^4', t => t ** 4], ['\\cos2t+t^2', t => Math.cos(2 * t) + t * t], ['t^2\\cos t', t => t * t * Math.cos(t)]];
  const OD19 = [['t^3', t => t ** 3], ['t\\cos t', t => t * Math.cos(t)], ['t^3-\\pi^2t', t => t ** 3 - Math.PI ** 2 * t], ['\\sin t+t^3', t => Math.sin(t) + t ** 3], ['t^5', t => t ** 5], ['t+\\sin2t', t => t + Math.sin(2 * t)]];
  // 区間ごとに一定の波（−π〜π）：kind 'P1'（|t|<w で A、ほかで0。偶）・'P2'（|t|<π/2 で A、ほかで −A。偶）・'Q2'（0<t<w で A、−w<t<0 で −A、ほかで0。奇）
  //   w は π の何倍か（分数）。値の関数・とびの所・文
  const W19 = [[fr(1, 2), '\\dfrac{\\pi}{2}'], [fr(1, 3), '\\dfrac{\\pi}{3}'], [fr(2, 3), '\\dfrac{2\\pi}{3}']];
  function wave19(kind, A, wi) {
    const [w, wt] = W19[wi], wv = pv(w, 1), h = Math.PI / 2;
    if (kind === 'P1') return { f: t => (Math.abs(t) < wv ? A : 0), cuts: [-wv, wv], txt: `$\\lvert t\\rvert<${wt}$ なら $${A}$、ほかは $0$`, even: true };
    if (kind === 'P2') return { f: t => (Math.abs(t) < h ? A : -A), cuts: [-h, h], txt: `$\\lvert t\\rvert<\\dfrac{\\pi}{2}$ なら $${A}$、ほかは $${-A}$`, even: true };
    return { f: t => (t > 0 && t < wv ? A : t < 0 && t > -wv ? -A : 0), cuts: [-wv, 0, wv], txt: `$0<t<${wt}$ なら $${A}$、$-${wt}<t<0$ なら $${-A}$、ほかは $0$`, even: false };
  }
  // 係数（数値：区間で分けて積分）
  const co19 = (W, k, n) => (k === 'c0' ? cutInt(W.f, -Math.PI, Math.PI, W.cuts) / (2 * Math.PI) : cutInt(t => W.f(t) * Math[k === 'a' ? 'cos' : 'sin'](n * t), -Math.PI, Math.PI, W.cuts) / Math.PI);
  // 正しい値の TeX：a_n = 2A sin(nw)/(nπ)（P1）、4A sin(nπ/2)/(nπ)（P2）、b_n = 2A(1−cos nw)/(nπ)（Q2）。w は π/2・π/3・2π/3 なので分数で書ける
  const SIN = { 2: [fr(1), fr(0), fr(-1), fr(0)], 3: null };
  function val19(kind, A, wi, k, n) {
    const [w] = W19[wi], ang = j => F.mul(w, fr(j));   // nw は π の何倍か
    const cosv = x => { const c = Math.cos(Math.PI * x[0] / x[1]), h = Math.round(2 * c); return Math.abs(2 * c - h) < 1e-9 ? fr(h, 2) : null; };
    if (k === 'c0') return kind === 'P1' ? [F.mul(fr(A), w), 0] : [fr(0), 0];
    if (kind === 'P2') { const s = SIN[2][(n - 1) % 4]; return [F.mul(fr(4 * A, n), s), -1]; }
    if (kind === 'P1') { if (w[1] !== 2) return null; const s = SIN[2][(n - 1) % 4]; return [F.mul(fr(2 * A, n), s), -1]; }
    const c = cosv(ang(n)); if (!c) return null;
    return [F.mul(fr(2 * A, n), F.sub(fr(1), c)), -1];
  }
  function fig19(W, A, wi) {
    const X = 1.3 * Math.PI, G = M.graph({ x0: -X, x1: X, y0: -1.5 * A, y1: 1.9 * A, w: 10, h: 3.8 }), P = 2 * Math.PI;
    const cuts = [...new Set([-1, 0, 1].flatMap(k => W.cuts.map(c => c + k * P)).concat([-Math.PI, Math.PI]))].filter(c => c > -X && c < X).sort((a, b) => a - b);
    const xs = [-X, ...cuts, X], g = t => W.f(((t + Math.PI) % P + P) % P - Math.PI);
    const pcs = []; for (let k = 1; k < xs.length; k++) { const m = (xs[k - 1] + xs[k]) / 2; pcs.push({ f: g(m), a: xs[k - 1], b: xs[k], ends: '()' }); }
    const lab = { [-Math.PI]: '$-\\pi$', [Math.PI]: '$\\pi$' }, wl = W19[wi][1].replace('\\dfrac', '\\frac');
    const xt = [-Math.PI, Math.PI].concat(W.cuts.filter(c => c !== 0 && c > 0)), xf = t => lab[t] || `$${wl}$`;
    // 高さのラベルは、たて軸でなく線分の上（下）に。−π〜π の中の区間で
    const levels = new Map(); pcs.filter(pc => pc.f !== 0 && pc.a >= -Math.PI - 1e-9 && pc.b <= Math.PI + 1e-9).forEach(pc => { if (!levels.has(pc.f)) levels.set(pc.f, (pc.a + pc.b) / 2); });
    const labs = [...levels].map(([v, m]) => ['label', G.T(m, v), `$${v}$`, v > 0 ? 'n' : 's']);
    return { s: 5, items: [...G.axes({ xt, xfmt: xf, x: 't', y: 'f' }), ...G.pw(pcs, { thick: true, vline: true, dots: false }), ...labs] };
  }
  add({
    id: '9-19', part: 2, chap: '9-2⑧ 例題2・例題6', stars: 1,
    title: '偶関数なら $b_n=0$、奇関数なら $a_n=0$。残りは半周期の2倍',
    mark: 'たて軸で折り返して重なる・原点で半回転して重なる波（場合 D）。',
    futsu: ['$a_n=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}f\\cos nt\\,\\dd t$ と', '$b_n$ の両方を、$-\\pi$ から $\\pi$ まで', '区間に分けて全部', '計算する。'],
    raku: ['$\\lvert t\\rvert<\\frac{\\pi}{2}$ で2、ほかで0（偶関数）', '→ $b_n=0$', '$a_n=\\frac{2}{\\pi}\\int_0^{\\pi/2}2\\cos nt\\,\\dd t$', '$=\\frac{4\\sin\\frac{n\\pi}{2}}{n\\pi}$、$\\frac{a_0}{2}=1$'],
    why: '$f(-t)=f(t)$ の偶関数に奇関数 $\\sin nt$ をかけると奇関数になり、$-\\pi$ から $\\pi$ の積分は左右で打ち消して0（$b_n=0$）。$\\cos nt$ をかけた偶関数は、0から $\\pi$ の積分の2倍（9-2⑧の表）。奇関数 $f(-t)=-f(t)$ なら逆に $a_n=0$ で、$b_n=\\frac{2}{\\pi}\\int_0^{\\pi}f\\sin nt\\,\\dd t$。周期 $T$ なら $\\frac{4}{T}\\int_0^{T/2}$。',
    caution: '半分の区間にしたら2倍を忘れない（$\\frac{2}{\\pi}$）。偶奇は $f(-t)$ を計算して確かめる。同じ方形波でも、原点の置き方で偶にも奇にもなる。0と $A$ をくり返す信号は、偶でも奇でもない（わざ 9-07）。$\\sin\\frac{n\\pi}{2}$ は $1,\\ 0,\\ -1,\\ 0,\\ \\cdots$。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '16mm', s3: '16mm', trap: '16mm' }, boxh: { s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return (/\$-\\pi<t<\\pi\$/.test(q) || /^図の波/.test(q)) && /a_|b_/.test(q) && !/c_|平均/.test(q); },
    steps: {
      // どちらの係数がすべて0か
      s1(r) {
        const ev0 = turn(r, '19s1', 2) === 0, [tex, f] = r.pick(ev0 ? EV19 : OD19);
        return { q: `${SYM} $f(t)=${tex}$ をくり返す波で、すべて0になる係数（$a_n$ か $b_n$）`, a: ev0 ? '$b_n$' : '$a_n$', key: `s1|${tex}`, easyCheck: false,
          easy: ev0 ? `$f(-t)=f(t)$ の偶関数なので、$\\sin nt$ の係数` : `$f(-t)=-f(t)$ の奇関数なので、$\\cos nt$ の係数`,
          verify: p => { const T = 2 * Math.PI, z = [1, 2, 3].map(n => (ev0 ? bnNum : anNum)(f, T, n, -Math.PI)), nz = [1, 2, 3].map(n => (ev0 ? anNum : bnNum)(f, T, n, -Math.PI));
            return (strip(p.a) === (ev0 ? 'b_n' : 'a_n') && z.every(v => Math.abs(v) < 1e-6) && nz.some(v => Math.abs(v) > 1e-3)) || `答え ${p.a} がちがう`; } };
      },
      // 区間ごとに一定の偶関数・奇関数の係数
      s2(r) {
        const k = turn(r, '19s2', 4), A = r.pick([1, 2, 3, 4, 5, 6]);
        if (k === 2) {   // 式で
          const kind = r.pick(['P1', 'P2']), c = kind === 'P1' ? 2 * A : 4 * A;
          if (c === 4) return null;   // 左ページの例と同じ答え（O-2）
          const W = wave19(kind, A, 0);
          return { q: `${SYM}、${W.txt} をくり返す波の $a_n$（$n$ の式で）`, a: `$\\dfrac{${c}\\sin\\frac{n\\pi}{2}}{n\\pi}$`, key: `f|${kind}|${A}`, easyCheck: false, boxw: '26mm',
            easy: `偶関数。$a_n=\\dfrac{2}{\\pi}\\displaystyle\\int_0^{\\pi}f\\cos nt\\,\\dd t$`, verify: p => fnIs(p, n => co19(W, 'a', n), [1, 2, 3, 4, 5]) };
        }
        const kind = k === 1 ? 'Q2' : k === 3 ? 'P2' : 'P1', wi = kind === 'Q2' ? r.int(0, 2) : 0;
        if (kind === 'P1' && A === 2) return null;   // 左ページの例
        const W = wave19(kind, A, wi), ck = kind === 'Q2' ? 'b' : (r.chance(0.2) && kind === 'P1' ? 'c0' : 'a'), n = ck === 'c0' ? 0 : r.pick([1, 2, 3]);
        const v = val19(kind, A, wi, ck, n); if (!v || v[0][0] === 0) return null;
        return { q: `${SYM}、${W.txt} をくり返す波の $${coefName(ck, n)}$`, a: `$${pq(v[0], v[1])}$`, key: `${kind}|${A}|${wi}|${ck}${n}`, easyCheck: false,
          easy: W.even ? `偶関数。$\\dfrac{2}{\\pi}\\displaystyle\\int_0^{\\pi}f${tf('cos', n)}\\,\\dd t$` : `奇関数。$\\dfrac{2}{\\pi}\\displaystyle\\int_0^{\\pi}f${tf('sin', n)}\\,\\dd t$`,
          verify: p => valIs(p, co19(W, ck, n), 1e-7) };
      },
      // 図
      s3(r) {
        const odd = turn(r, '19s3', 2) === 0, A = r.pick([2, 3, 4, 5]), kind = odd ? 'Q2' : r.pick(['P1', 'P2']), wi = odd ? r.int(0, 2) : 0;
        if (kind === 'P1' && A === 2) return null;
        const W = wave19(kind, A, wi), ck = odd ? 'b' : 'a', n = r.pick([1, 2, 3]);
        const v = val19(kind, A, wi, ck, n); if (!v || v[0][0] === 0) return null;
        return { q: `図の波（周期 $2\\pi$）の $${coefName(ck, n)}$`, a: `$${pq(v[0], v[1])}$`, key: `${kind}|${A}|${wi}|${ck}${n}`, easyCheck: false, fig: fig19(W, A, wi),
          easy: odd ? `原点で半回転して重なる奇関数。$\\dfrac{2}{\\pi}\\displaystyle\\int_0^{\\pi}f${tf('sin', n)}\\,\\dd t$` : `たて軸で折り返して重なる偶関数。$\\dfrac{2}{\\pi}\\displaystyle\\int_0^{\\pi}f${tf('cos', n)}\\,\\dd t$`,
          verify: p => valIs(p, co19(W, ck, n), 1e-7) };
      },
      // わな：0 と A をくり返す信号（偶でも奇でもない。平均＋方形波。9-07）
      trap(r) {
        const A = r.pick([2, 3, 5, 6, 8, 10]);
        return dest({ q: `$0<t<\\pi$ で $${A}$、$\\pi<t<2\\pi$ で $0$ をくり返す信号の $b_n$（$n$ が奇数のとき）`, a: `$\\dfrac{${2 * A}}{n\\pi}$`, key: `t|${A}`,
          verify: p => fnIs(p, n => cutInt(t => (t < Math.PI ? A : 0) * Math.sin(n * t), 0, 2 * Math.PI, [Math.PI]) / Math.PI, [1, 3, 5]) }, '9-19',
          `偶関数でも奇関数でもない。平均 $${pq(fr(A, 2))}$ と、高さ $${pq(fr(A, 2))}$ の方形波（$b_n=\\dfrac{4}{n\\pi}\\times${pq(fr(A, 2))}$）に分ける`, ['9-07']);
      },
    },
  });

  // ================================================================ 9-20
  // 三角波：f = c + s·k|t|（−π<t<π）。a_n = s·2k((−1)^n−1)/(πn^2)
  const dfn = (num, den) => (num < 0 ? '-' : '') + `\\dfrac{${Math.abs(num)}}{${den}}`;
  function tri20(form, k, c) {
    if (form === 'k') return { tex: `${AT(k)}\\lvert t\\rvert`, f: t => k * Math.abs(t), s: 1, avg: [fr(k, 2), 1] };
    if (form === 'pi') return { tex: k === 1 ? '\\pi-\\lvert t\\rvert' : `${k}(\\pi-\\lvert t\\rvert)`, f: t => k * (Math.PI - Math.abs(t)), s: -1, avg: [fr(k, 2), 1] };
    if (form === 'zero') return { tex: `${pq(fr(k, 2), 1)}-${AT(k)}\\lvert t\\rvert`, f: t => k * (Math.PI / 2 - Math.abs(t)), s: -1, avg: [fr(0), 0] };
    return { tex: `${AT(k)}\\lvert t\\rvert+${c}`, f: t => k * Math.abs(t) + c, s: 1, avg: null, avgTeX: `${c}+${pq(fr(k, 2), 1)}`, avgV: c + k * Math.PI / 2 };
  }
  add({
    id: '9-20', part: 2, chap: '9-2⑨ 例題3', stars: 1,
    title: '三角波は偶関数。$t\\cos nt$ の積分をくり返し使う',
    mark: '$\\lvert t\\rvert$・$\\pi-\\lvert t\\rvert$ の形（場合 D・C）。',
    futsu: ['$-\\pi$ から $0$ と $0$ から $\\pi$ に分け、', '$a_n$ と $b_n$ のそれぞれで', '部分積分を2回ずつする。'],
    raku: ['$f=3\\lvert t\\rvert$（$-\\pi<t<\\pi$）', '→ 平均は面積÷$2\\pi$ で $\\frac{3\\pi}{2}$', '$a_n=\\frac{6}{\\pi}\\cdot\\frac{(-1)^n-1}{n^2}$', '→ 奇数 $-\\frac{12}{\\pi n^2}$、偶数0、$b_n=0$'],
    why: '$\\lvert t\\rvert$ は偶関数なので $b_n=0$、$a_n=\\frac{2}{\\pi}\\int_0^{\\pi}f\\cos nt\\,\\dd t$（場合 D）。0から $\\pi$ では $\\lvert t\\rvert=t$ なので、部分積分（場合 C）の結果 $\\int_0^{\\pi}t\\cos nt\\,\\dd t=\\frac{(-1)^n-1}{n^2}$ を何倍かして使える。定数の項は $\\int_0^{\\pi}\\cos nt\\,\\dd t=0$ で消える。平均は、三角形の面積÷周期（場合 G）。',
    caution: '奇数番は $(-1)^n-1=-2$、偶数番は0。$\\pi-\\lvert t\\rvert$ の形は、$-\\lvert t\\rvert$ の分で符号が逆。定数の項は $\\frac{a_0}{2}$（$a_0$ ではない）。周期 $2L$ の三角波は $\\cos\\frac{n\\pi t}{L}$ で、係数に $\\pi^2$ が出る。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '12mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /\\lvert t\\rvert(?!\s*<)/.test(q) && /a_|平均/.test(q) && !/c_|\\sin/.test(q); },
    steps: {
      // f = k|t|
      s1(r) {
        const k = r.pick([1, 2, 4, 5, 6]), T = tri20('k', k), j = turn(r, '20s1', 3);
        if (j === 0) return { q: `${SYM} $f(t)=${T.tex}$ の平均 $\\dfrac{a_0}{2}$`, a: `$${pq(...T.avg)}$`, key: `k|${k}|avg`, easyCheck: false,
          easy: `三角形の面積 $${pq(fr(k), 2)}$ を $2\\pi$ でわる`, verify: p => valIs(p, meanNum(T.f, 2 * Math.PI, -Math.PI), 1e-7) };
        if (j === 1) return { q: `${SYM} $f(t)=${T.tex}$ の $a_n$：${OE}`, a: `奇数 $-\\dfrac{${4 * k}}{\\pi n^2}$、偶数 $0$`, key: `k|${k}|an`, easyCheck: false, boxw: '20mm',
          easy: `$a_n=\\dfrac{${2 * k}}{\\pi}\\cdot\\dfrac{(-1)^n-1}{n^2}$`, verify: p => oeIs(p, n => anNum(T.f, 2 * Math.PI, n, -Math.PI)) };
        const n = r.pick([1, 3, 5]);
        return { q: `${SYM} $f(t)=${T.tex}$ の $a_${n}$`, a: `$${pq(fr(-4 * k, n * n), -1)}$`, key: `k|${k}|a${n}`, easyCheck: false,
          easy: `$\\dfrac{${2 * k}}{\\pi}\\cdot${n === 1 ? '(-2)' : `\\dfrac{-2}{${n * n}}`}$`, verify: p => valIs(p, anNum(T.f, 2 * Math.PI, n, -Math.PI), 1e-7) };
      },
      // π−|t|、定数をたした形
      s2(r) {
        const form = r.pick(['pi', 'zero', 'c', 'pi']), k = r.pick([1, 2, 3, 4, 6]), c = r.int(1, 5), T = tri20(form, k, c), j = turn(r, '20s2', 2);
        if (j === 0) {
          if (form === 'zero') return null;
          return { q: `${SYM} $f(t)=${T.tex}$ の平均 $\\dfrac{a_0}{2}$`, a: `$${T.avg ? pq(...T.avg) : T.avgTeX}$`, key: `${form}|${k},${c}|avg`, easyCheck: false,
            easy: form === 'c' ? `$${AT(k)}\\lvert t\\rvert$ の平均 $${pq(fr(k, 2), 1)}$ に $${c}$ をたす` : `三角形の面積 $${pq(fr(k), 2)}$ を $2\\pi$ でわる`,
            verify: p => valIs(p, meanNum(T.f, 2 * Math.PI, -Math.PI), 1e-7) };
        }
        const num = -T.s * 4 * k;
        return { q: `${SYM} $f(t)=${T.tex}$ の $a_n$：${OE}`, a: `奇数 $${dfn(num, '\\pi n^2')}$、偶数 $0$`, key: `${form}|${k},${c}|an`, easyCheck: false, boxw: '20mm',
          easy: `${T.s < 0 ? '$-\\lvert t\\rvert$ の分で符号が逆。' : '定数は $a_n$ に効かない。'}$a_n=${T.s < 0 ? '-' : ''}\\dfrac{${2 * k}}{\\pi}\\cdot\\dfrac{(-1)^n-1}{n^2}$`,
          verify: p => oeIs(p, n => anNum(T.f, 2 * Math.PI, n, -Math.PI)) };
      },
      // 周期 2L の三角波
      s3(r) {
        const L = r.pick([1, 2]), k = r.pick([1, 2, 3, 4]), f = t => k * Math.abs(t), j = turn(r, '20s3', 2);
        const LT = nf(L), per = nf(2 * L);
        if (j === 0) {
          const n = r.pick([1, 3]), v = F.mul(fr(-4 * k, n * n), F.fromDec(String(L)));
          return { q: `$-${LT}<t<${LT}$ で $f(t)=${AT(k)}\\lvert t\\rvert$ をくり返す波（周期 $${per}$）の $a_${n}$（$${L === 1 ? `\\cos${n === 1 ? '' : n}\\pi t` : `\\cos\\dfrac{${n === 1 ? '' : n}\\pi t}{2}`}$ の係数）`, a: `$${pq(v, -2)}$`, key: `L|${L}|${k}|a${n}`, easyCheck: false,
            easy: `偶関数。$a_${n}=${L === 1 ? '2' : ''}\\displaystyle\\int_0^{${LT}}${AT(k)}t\\cos${L === 1 ? `${n === 1 ? '' : n}\\pi t` : `\\frac{${n === 1 ? '' : n}\\pi t}{2}`}\\,\\dd t$`,
            verify: p => valIs(p, 2 / L * simpson(t => f(t) * Math.cos(n * Math.PI * t / L), 0, L), 1e-7) };
        }
        const v = F.mul(fr(k, 2), F.fromDec(String(L)));
        return { q: `$-${LT}<t<${LT}$ で $f(t)=${AT(k)}\\lvert t\\rvert$ をくり返す波（周期 $${per}$）の平均 $\\dfrac{a_0}{2}$`, a: `$${pq(v)}$`, key: `L|${L}|${k}|avg`, easyCheck: false,
          easy: `三角形の面積 $${nf(k * L * L)}$ を周期 $${per}$ でわる`, verify: p => valIs(p, simpson(f, -L, L) / (2 * L), 1e-7) };
      },
      // わな：のこぎり波 f = kt の a_n（奇関数なので0。9-19）
      trap(r) {
        const k = r.pick([2, 3, 4, 5]);
        return dest({ q: `${SYM} $f(t)=${k}t$ をくり返す波の $a_n$`, a: '$0$', key: `t|${k}`,
          verify: p => (valsAre(p, [0]) === true && [1, 2, 3].every(n => Math.abs(anNum(t => k * t, 2 * Math.PI, n, -Math.PI)) < 1e-6)) || `答え ${p.a} がちがう` }, '9-20',
          `三角波ではなく、原点で半回転して重なる奇関数（のこぎり波）。$a_n$ はすべて0`, ['9-19']);
      },
    },
  });

  // ================================================================ 9-21
  // 0〜L の形：'up'（kx/L）、'down'（k(1−x/L)）、'lin'（左 b から右 a へ直線）
  function shape21(kind, a, b) {
    if (kind === 'up') return { f: x => a * x, txt: `$f(x)=${a}\\dfrac{x}{L}$`, bn: n => 2 * a * (n % 2 ? 1 : -1) / (n * Math.PI), tex: `\\dfrac{${2 * a}(-1)^{n+1}}{n\\pi}`, val: n => fr(2 * a * (n % 2 ? 1 : -1), n) };
    if (kind === 'down') return { f: x => a * (1 - x), txt: `$f(x)=${a}\\Bigl(1-\\dfrac{x}{L}\\Bigr)$`, bn: n => 2 * a / (n * Math.PI), tex: `\\dfrac{${2 * a}}{n\\pi}`, val: n => fr(2 * a, n) };
    return { f: x => b + (a - b) * x, txt: `左はしの $${b}$ ℃から右はしの $${a}$ ℃まで直線で変わる`, bn: n => 2 * (b + a * (n % 2 ? 1 : -1)) / (n * Math.PI), tex: null, val: n => fr(2 * (b + a * (n % 2 ? 1 : -1)), n) };
  }
  // 数値の b_n（検算：問題を作った式とは別の道すじ。L=1 として 2∫_0^1 f sin nπx dx）
  const bn21 = (f, n) => 2 * simpson(x => f(x) * Math.sin(n * Math.PI * x), 0, 1);
  function fig21(S, top) {
    const G = M.graph({ x0: -1.25, x1: 1.35, y0: -1.3, y1: 1.3, w: 7.5, h: 4 }), g = x => S.f(x) / top;
    return { s: 5, items: [...G.axes({ xt: [-1, 1], xfmt: t => (t > 0 ? '$L$' : '$-L$'), yt: [1], yfmt: () => `$${top}$`, x: 'x', y: 'f' }),
      ...G.plot(g, 0, 1, { thick: true }), ...G.plot(x => -g(-x), -1, 0, { dash: true }),
      ...(Math.abs(g(0)) > 1e-9 ? [['seg', G.T(0, g(0)), G.T(0, -g(0)), { dash: true }]] : [])] };
  }
  const ROD = 'はじめの温度が';
  const ROD2 = '棒（両はし $0$ ℃）の';
  // 「はじめの温度が $f(x)=…$ の棒（両はし $0$ ℃）の」
  // 直線は「はじめの温度が左はしの … まで直線で変わる棒（そのあと両はしを $0$ ℃に保つ）の」（はじめの温度と、はしの温度を読みまちがえないように。R1-8）
  const rod21 = S => (S.txt.startsWith('$') ? `${ROD} ${S.txt} の${ROD2}` : `${ROD}${S.txt}棒（そのあと両はしを $0$ ℃に保つ）の`);
  add({
    id: '9-21', part: 2, chap: '9-2⑩ 例題4', stars: 1,
    title: '0から $L$ だけの形は、半回転して広げて $\\sin$ だけに',
    mark: '棒のはじめの温度・弦のはじめの形（場合 E）。',
    futsu: ['$-L$ から $L$ までの周期 $2L$ の', '波を自分で作って、$a_n$ と $b_n$ を', 'すべて計算する。'],
    raku: ['$f=30\\frac{x}{L}$ → $\\int_0^Lx\\sin\\frac{n\\pi x}{L}\\,\\dd x$', '$=\\frac{L^2(-1)^{n+1}}{n\\pi}$ を使って', '$b_n=\\frac{60(-1)^{n+1}}{n\\pi}$', '（$b_1\\approx19.1$、$b_2\\approx-9.55$）'],
    why: '0から $L$ だけで決まる形は、原点で半回転した形に広げると、周期 $2L$ の奇関数になる。奇関数なので $a_n=0$、$b_n$ は半周期の積分の2倍で、$\\frac{4}{2L}\\int_0^L=\\frac{2}{L}\\int_0^L$（場合 E。9-2⑩）。$\\sin\\frac{n\\pi x}{L}$ はどれも両はしで0なので、両はしを0 ℃に保つ棒・両はしを止めた弦に合う。',
    caution: '$\\cos$ は使わない（広げた形は奇関数）。$\\frac{2}{L}$ を忘れない。$\\sin\\frac{n\\pi x}{L}$ は両はしで0なので、両はしが0でない棒には使えない。はじめどこも同じ温度なら、わざ 9-14。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '16mm', s3: '16mm', trap: '12mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /b_/.test(q) && /棒|弦/.test(q) && /直線|\\dfrac\{x\}\{L\}|半回転/.test(q); },
    steps: {
      // f = kx/L
      s1(r) {
        const a = r.pick([10, 20, 40, 50, 60, 80]), S = shape21('up', a), j = turn(r, '21s1', 2);
        if (j === 0) return { q: `${rod21(S)} $b_n$（$n$ の式で）`, a: `$${S.tex}$`, key: `up|${a}`, easyCheck: false,
          easy: `$b_n=\\dfrac{2}{L}\\cdot\\dfrac{${a}}{L}\\cdot\\dfrac{L^2(-1)^{n+1}}{n\\pi}$`, verify: p => fnIs(p, n => bn21(S.f, n), [1, 2, 3, 4]) };
        const n = r.pick([1, 2, 3]);
        return { q: `${rod21(S)} $b_${n}$`, a: `$${pq(S.val(n), -1)}$`, key: `up|${a}`, easyCheck: false,
          easy: `$b_n=\\dfrac{${2 * a}(-1)^{n+1}}{n\\pi}$ に $n=${n}$`, verify: p => valIs(p, bn21(S.f, n), 1e-7) };
      },
      // 右はしが0の直線、両方のはしが0でない直線
      s2(r) {
        const lin = turn(r, '21s2', 2) === 0, a = r.pick([20, 40, 50, 60, 80, 100]), b = r.pick([20, 30, 40, 60]);
        if (lin && a === b) return null;   // どこも同じ温度（わざ 9-14）
        const S = shape21(lin ? 'lin' : 'down', a, b);
        if (!lin && r.chance(0.4)) return { q: `${rod21(S)} $b_n$（$n$ の式で）`, a: `$${S.tex}$`, key: `down|${a}`, easyCheck: false,
          easy: `$\\dfrac{2}{L}\\displaystyle\\int_0^L${a}\\Bigl(1-\\dfrac{x}{L}\\Bigr)\\sin\\dfrac{n\\pi x}{L}\\,\\dd x$`, verify: p => fnIs(p, n => bn21(S.f, n), [1, 2, 3, 4]) };
        const n = r.pick([1, 2, 3]), v = S.val(n);
        if (!v[0]) return null;
        return { q: `${rod21(S)} $b_${n}$`, a: `$${pq(v, -1)}$`, key: `${lin ? 'lin' : 'down'}|${a},${b}|b${n}`, easyCheck: false,
          easy: lin ? `$${b}\\Bigl(1-\\dfrac{x}{L}\\Bigr)$ と $${a}\\dfrac{x}{L}$ に分けて、$\\dfrac{${2 * b}}{n\\pi}+\\dfrac{${2 * a}(-1)^{n+1}}{n\\pi}$` : `$b_n=\\dfrac{${2 * a}}{n\\pi}$ に $n=${n}$`,
          verify: p => valIs(p, bn21(S.f, n), 1e-7) };
      },
      // 図：0〜L の形（実線）と、半回転して広げた形（点線）
      s3(r) {
        const kind = r.pick(['up', 'down', 'lin']), a = r.pick([20, 40, 60, 80]), b = r.pick([20, 40, 50]);
        if (kind === 'lin' && a === b) return null;
        if (kind === 'up' && a === 30) return null;
        const S = shape21(kind, a, b), n = r.pick([1, 2, 3]), v = S.val(n);
        if (!v[0]) return null;
        const top = Math.max(a, kind === 'lin' ? b : 0);
        // 直線は両はしの値を文に書く（左はしの値は目もりにないので。Y-1・R1-2）
        return { q: `${kind === 'lin' ? `図の実線は、両はしを $0$ ℃に保つ棒のはじめの温度（℃。左はし $${b}$ ℃から右はし $${a}$ ℃までの直線）` : '図の実線は棒（両はし $0$ ℃）のはじめの温度（℃）'}、点線は原点で半回転して広げた形。$b_${n}$`, a: `$${pq(v, -1)}$`, key: `${kind}|${a}|${kind === 'lin' ? b : ''}`, easyCheck: false,
          easy: `$b_${n}=\\dfrac{2}{L}\\displaystyle\\int_0^Lf\\sin\\dfrac{${n === 1 ? '' : n}\\pi x}{L}\\,\\dd x$`, fig: fig21(S, top),
          verify: p => valIs(p, bn21(S.f, n), 1e-7) };
      },
      // わな：両はしの温度が0でない棒（sin だけのたし算にならない。わざなし）
      trap(r) {
        const U0 = r.pick([20, 40, 60, 80, 100]), lft = r.pick([0, 10, 20]);
        const v = (U0 + lft) / 2;
        return dest({ q: `長さ $L$ の棒の左はしを $${lft}$ ℃、右はしを $${U0}$ ℃に保つ。十分に時間がたったあとの、棒のまん中の温度（℃）`, a: `$${nf(v)}$`, key: `t|${U0}|${lft}`,
          verify: p => valIs(p, lft + (U0 - lft) * 0.5) }, '9-21',
          `両はしが $0$ ℃でないので、$\\sin\\frac{n\\pi x}{L}$ だけのたし算にならない。最後は両はしを結ぶ直線になり、まん中は $\\dfrac{${lft}+${U0}}{2}$`);
      },
    },
  });

  // ================================================================ 9-22
  // 整流した波の a_n（n は偶数）：半波 −2A/(π(n²−1))、全波 −4A/(π(n²−1))
  const rectF = (full, A) => t => (full ? Math.abs(A * Math.sin(t)) : Math.max(0, A * Math.sin(t)));
  const HALF = A => `$0<t<\\pi$ で $${AT(A)}\\sin t$、$\\pi<t<2\\pi$ で $0$`;
  add({
    id: '9-22', part: 2, chap: '9-2⑨ 例題8', stars: 1,
    title: '整流した波の係数は、積和の式で和に直して定積分',
    mark: '「整流した波の $a_2$」、$\\int_0^{\\pi}\\sin t\\cos nt\\,\\dd t$（場合 H）。',
    futsu: ['$\\sin t\\cos2t$ を部分積分で', '2回積分して、もとの積分に', 'もどった式を解く。'],
    raku: ['全波整流 $\\lvert\\sin t\\rvert$（周期 $2\\pi$ と見る）の $a_2$', '→ 偶関数で $\\frac{2}{\\pi}\\int_0^{\\pi}\\sin t\\cos2t\\,\\dd t$', '$\\sin t\\cos2t=\\frac12(\\sin3t-\\sin t)$', '→ $\\frac{1}{\\pi}\\bigl(\\frac23-2\\bigr)=-\\frac{4}{3\\pi}$'],
    why: '区間の中が $\\sin t$ の形なら、係数の積分は $\\int\\sin t\\cos nt\\,\\dd t$ の形。4-9 の積和の式 $\\sin t\\cos nt=\\frac12\\{\\sin(1+n)t+\\sin(1-n)t\\}$ で和に直せば、$\\int_0^{\\pi}\\sin kt\\,\\dd t=\\frac{1-(-1)^k}{k}$ だけで計算できる（場合 H。9-2⑨）。半周期の積分なので、直交性では0にならない。',
    caution: '$\\sin(1-n)t=-\\sin(n-1)t$ の符号に注意。$\\int_0^{\\pi}\\sin kt\\,\\dd t$ は、$k$ が奇数なら $\\frac2k$、偶数なら0。半波整流は0から $\\pi$ だけ（$\\frac{1}{\\pi}$）、全波整流は偶関数で $\\frac{2}{\\pi}\\int_0^{\\pi}$。$b_1$ は $\\sin^2t$ の積分（平均 $\\frac12$×長さ）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '16mm', s3: '16mm', trap: '12mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return ((/\\int_0\^\{\\pi\}/.test(q) && /\\sin/.test(q) && /\\cos/.test(q)) || (/整流/.test(q) && /a_|b_|成分/.test(q))) && !/平均/.test(q); },
    steps: {
      // ∫_0^π sin mt cos nt
      s1(r) {
        const m = r.int(1, 4), n = r.intNot(1, 5, x => x === m || (x + m) % 2 === 0), A = r.pick([1, 1, 2, 3]);
        if (m === 1 && n === 2) return null;   // 左ページの例
        const v = F.mul(fr(A), fr(2 * m, m * m - n * n));
        return { q: `$\\displaystyle\\int_0^{\\pi}${AT(A)}${tf('sin', m)}${tf('cos', n)}\\,\\dd t$`, a: `$${pq(v)}$`, key: `i|${m},${n},${A}`, easyCheck: false,
          easy: `$${tf('sin', m)}${tf('cos', n)}=\\dfrac12\\{\\sin${m + n}t${m - n > 0 ? '+' : '-'}${tf('sin', Math.abs(m - n))}\\}$`,
          calc: { kind: 'defint', f: `${A}${cf('sin', m)}${cf('cos', n)}`, x: 't', a: 0, b: '\\pi' } };
      },
      // 半波整流・全波整流の a_n
      s2(r) {
        const full = turn(r, '22s2', 2) === 0, A = r.pick([1, 2, 3, 4, 5, 6]), n = r.pick([2, 4, 6]);
        if (full && A === 1 && n === 2) return null;   // 左ページの例
        const v = fr((full ? -4 : -2) * A, n * n - 1);
        return { q: full ? `$f(t)=\\lvert${AT(A)}\\sin t\\rvert$（全波整流。周期 $2\\pi$ と見る）の $a_${n}$` : `半波整流した波（${HALF(A)}）の $a_${n}$`, a: `$${pq(v, -1)}$`, key: `${full}|${A}|${n}`, easyCheck: false,
          easy: `${full ? `偶関数で $\\dfrac{2}{\\pi}\\displaystyle\\int_0^{\\pi}` : `$\\dfrac{1}{\\pi}\\displaystyle\\int_0^{\\pi}`}${AT(A)}\\sin t\\cos${n}t\\,\\dd t$、$\\sin t\\cos${n}t=\\dfrac12(\\sin${n + 1}t-${tf('sin', n - 1)})$`,
          verify: p => valIs(p, anNum(rectF(full, A), 2 * Math.PI, n), 1e-7) };
      },
      // 周波数の文で：50 Hz の交流を整流した電圧の成分
      s3(r) {
        const full = turn(r, '22s3', 2) === 0, V = r.pick([10, 20, 30, 60, 90, 120]), f0 = r.pick([50, 60]);
        if (full) {
          const n = r.pick([2, 4]), fq = n * f0, v = fr(4 * V, n * n - 1);
          return { q: `最大 ${U(V, 'V')}、${f0} Hz の交流を全波整流した電圧の、${fq} Hz の成分の大きさ（V。$\\pi$ を残す）`, a: `$${pq(v, -1)}$`, key: `f|${V}|${f0}|${n}`, easyCheck: false,
            easy: `${fq} Hz は周期 $2\\pi$ で見た $\\cos${n}t$。$\\lvert a_${n}\\rvert=\\dfrac{2}{\\pi}\\cdot${V}\\Bigl\\lvert\\displaystyle\\int_0^{\\pi}\\sin t\\cos${n}t\\,\\dd t\\Bigr\\rvert$`,
            verify: p => valIs(p, Math.abs(anNum(rectF(true, V), 2 * Math.PI, n)), 1e-7) };
        }
        const one = r.chance(0.5), n = one ? 1 : 2, fq = n * f0;
        const v = one ? fr(V, 2) : fr(2 * V, 3);
        return { q: `最大 ${U(V, 'V')}、${f0} Hz の交流を半波整流した電圧の、${fq} Hz の成分の大きさ（V${one ? '' : '。$\\pi$ を残す'}）`, a: `$${pq(v, one ? 0 : -1)}$`, key: `h|${V}|${f0}|${n}`, easyCheck: false,
          easy: one ? `$b_1=\\dfrac{1}{\\pi}\\displaystyle\\int_0^{\\pi}${V}\\sin^2t\\,\\dd t$（$\\sin^2$ の平均 $\\frac12$×長さ $\\pi$）` : `$\\lvert a_2\\rvert=\\dfrac{${V}}{\\pi}\\Bigl\\lvert\\displaystyle\\int_0^{\\pi}\\sin t\\cos2t\\,\\dd t\\Bigr\\rvert$`,
          verify: p => valIs(p, one ? bnNum(rectF(false, V), 2 * Math.PI, 1) : Math.abs(anNum(rectF(false, V), 2 * Math.PI, 2)), 1e-7) };
      },
      // わな：cos^2 の a_2（式で書けるので、積分しない。9-17）
      trap(r) {
        const A = r.pick([2, 3, 4, 6, 8]), sn = r.chance(0.5), m = r.pick([1, 2, 3]), v = fr(sn ? -A : A, 2);
        return dest({ q: `$f(t)=${AT(A)}${tf2(sn ? 'sin' : 'cos', m)}$ の $a_${2 * m}$`, a: `$${pq(v)}$`, key: `t|${A}|${sn}|${m}`,
          verify: p => valIs(p, anNum(t => A * Math[sn ? 'sin' : 'cos'](m * t) ** 2, 2 * Math.PI, 2 * m), 1e-7) }, '9-22',
          `区間ごとの形ではなく、2倍角の式で $${pq(fr(A, 2))}${sn ? '-' : '+'}${A === 2 ? '' : pq(fr(A, 2))}${tf('cos', 2 * m)}$ と書き直せる`, ['9-17']);
      },
    },
  });

  // ================================================================ 9-23
  const DEG = k => `${k}`;
  const f1d = v => rd(v, 1);   // 10進で丸める（2進のずれで下に丸めない。Y-2）
  // 表（N 点。1行に入りきらないときは2段）
  function dataTable(fs, step, split) {
    const ts = fs.map((_, k) => DEG(k * step)), cell = v => `$${typeof v === 'string' ? v : nf(v)}$`;
    if (!split) return { head: ['$t$（度）', ...ts], rows: [['$f$', ...fs.map(cell)]] };
    const h = fs.length / 2;
    return { rows: [['$t$（度）', ...ts.slice(0, h)], ['$f$', ...fs.slice(0, h).map(cell)], ['$t$（度）', ...ts.slice(h)], ['$f$', ...fs.slice(h).map(cell)]] };
  }
  // データの係数（はかった値 fs、ほんとうの sin・cos）
  const dataCoef = (fs, kind, n) => { const N = fs.length; return kind === 'm' ? fs.reduce((s, v) => s + +v, 0) / N : 2 / N * fs.reduce((s, v, k) => s + +v * Math[kind === 'a' ? 'cos' : 'sin'](2 * Math.PI * n * k / N), 0); };
  const DNAME = { a: n => `$a_${n}$`, b: n => `$b_${n}$`, m: () => '平均 $\\dfrac{a_0}{2}$' };
  add({
    id: '9-23', part: 2, chap: '9-1 例題5・9-2⑦ 例題9', stars: 1,
    title: 'データだけなら、「値×$\\sin$」の平均の2倍',
    mark: 'はかった値の表、式がない（場合 I）。',
    futsu: ['はかった点を線でつないだ', '折れ線の式を区間ごとに書いて、', '$\\sin nt$ をかけて', '積分する。'],
    raku: ['0°・90°・180°・270° の値 1、3、1、$-1$', '→ $b_1\\approx\\frac24(1\\times0+3\\times1+1\\times0$', '$+(-1)\\times(-1))=2$', '$a_1\\approx\\frac24(1-1)=0$、平均1'],
    why: '式がなく、1周期の中で等間かくに $N$ か所ではかった値しかないときは、積分のかわりに和を使う：$b_n\\approx\\frac{2}{N}\\sum f_k\\sin n\\omega_0t_k$、$a_n\\approx\\frac{2}{N}\\sum f_k\\cos n\\omega_0t_k$（「値×$\\sin$」の平均の2倍。場合 I）。等間かくの点でも、直交性はぴったりなり立つ（9-2⑦）。平均（$\\frac{a_0}{2}$）は値の平均。',
    caution: '$\\frac{2}{N}$ を $\\frac{1}{N}$ にしない（平均の2倍）。平均 $\\frac{a_0}{2}$ だけは $\\frac{1}{N}\\sum f_k$。$\\sin nt_k$ の $n$ を忘れない（$b_2$ なら角を2倍）。式がわかっているなら、和にしなくてよい（わざ 9-17 など）。',
    counts: { s1: 4, s2: 2, s3: 1, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '14mm', s3: '14mm', trap: '12mm' },
    fits(q) { return /はかった値/.test(q) && /表|ごとに/.test(q); },
    steps: {
      // 4点（90° ごと）
      s1(r) {
        const fs = [0, 1, 2, 3].map(() => r.int(-3, 6)), kind = r.pick(['b', 'b', 'a', 'm']);
        if (fs.join() === '1,3,1,-1') return null;   // 左ページの例
        const v = dataCoef(fs, kind, 1);
        if (Math.abs(v) < 1e-9 && kind !== 'm') return null;
        return { q: `1周期の中で $90^{\\circ}$ ごとにはかった値が、$0^{\\circ}$ から順に ${fs.map(v => `$${v}$`).join('、')}。${DNAME[kind](1)}（データの和で）`, a: `$${nf(v)}$`, key: `4|${fs}|${kind}`, easyCheck: false,
          easy: kind === 'm' ? `$\\dfrac{${fs.map(par).join('+')}}{4}$` : `$\\dfrac{2}{4}(${kind === 'b' ? `${par(fs[1])}-${par(fs[3])}` : `${par(fs[0])}-${par(fs[2])}`})$`,
          verify: p => valIs(p, kind === 'm' ? fs.reduce((s, x) => s + x, 0) / 4 : 0.5 * (kind === 'b' ? fs[1] - fs[3] : fs[0] - fs[2]), 1e-9) };
      },
      // 8点（45° ごと）
      s2(r) {
        const fs = [0, 1, 2, 3, 4, 5, 6, 7].map(() => r.int(-4, 6)), kind = turn(r, '23s2', 3);
        if (kind === 2) {   // b_1（sin45° を文に）
          const S1 = fs[1] + fs[3] - fs[5] - fs[7], S2 = fs[2] - fs[6];
          if (!S1) return null;
          const txt = (0.7071 * S1 + S2) / 4, s = agree(txt, dataCoef(fs, 'b', 1), 2);
          if (!s) return null;
          return { q: `表は、1周期の中で $45^{\\circ}$ ごとにはかった値。$b_1$（データの和で。$\\sin45^{\\circ}=0.7071$、小数第2位まで）`, a: `約 $${s}$`, key: `8|${fs}|b1`, easyCheck: false,
            table: dataTable(fs, 45), easy: `$\\dfrac{2}{8}\\{0.7071\\times(${S1})+(${S2})\\}$`, verify: p => valIs(p, +s) };
        }
        const k = kind === 0 ? 'b' : 'a', v = dataCoef(fs, k, 2);
        if (Math.abs(v) < 1e-9) return null;
        return { q: `表は、1周期の中で $45^{\\circ}$ ごとにはかった値。$${k}_2$（データの和で）`, a: `$${nf(v)}$`, key: `8|${fs}|${k}2`, easyCheck: false,
          table: dataTable(fs, 45),
          easy: k === 'b' ? `$\\sin2t_k$ は $0,\\ 1,\\ 0,\\ -1,\\ \\cdots$。$\\dfrac{2}{8}(${par(fs[1])}-${par(fs[3])}+${par(fs[5])}-${par(fs[7])})$` : `$\\cos2t_k$ は $1,\\ 0,\\ -1,\\ 0,\\ \\cdots$。$\\dfrac{2}{8}(${par(fs[0])}-${par(fs[2])}+${par(fs[4])}-${par(fs[6])})$`,
          verify: p => valIs(p, (k === 'b' ? fs[1] - fs[3] + fs[5] - fs[7] : fs[0] - fs[2] + fs[4] - fs[6]) / 4, 1e-9) };
      },
      // 12点（30° ごと。教科書と同じ形）
      s3(r) {
        const c = r.pick([0, 0.5, 1]), B1 = r.pick([1, 2, 3, -2]), A1 = r.pick([0, 0.5, 1, -1]), B2 = r.pick([0, 0.5, -0.5]), B3 = r.pick([0.5, 1, -1]);
        const fs = Array.from({ length: 12 }, (_, k) => { const t = k * Math.PI / 6; return f1d(c + B1 * Math.sin(t) + A1 * Math.cos(t) + B2 * Math.sin(2 * t) + B3 * Math.sin(3 * t)); }).map(v => (v === '-0.0' ? '0.0' : v));
        const fv = fs.map(Number);
        if (turn(r, '23s3', 2) === 0) {
          const S = fv[1] - fv[3] + fv[5] - fv[7] + fv[9] - fv[11], s = agree(S / 6, dataCoef(fv, 'b', 3), 2);
          if (!s) return null;
          return { q: `表は、機械の振動を1周期の中で $30^{\\circ}$ ごとにはかった値。$b_3$（データの和で。小数第2位まで）`, a: `約 $${s}$`, key: `12|${fs}|b3`, easyCheck: false,
            table: dataTable(fs, 30, true), easy: `$\\sin3t_k$ は $0,\\ 1,\\ 0,\\ -1,\\ \\cdots$。$\\dfrac{2}{12}\\times(${nf(S)})$`, verify: p => valIs(p, +s) };
        }
        const SN = [0, 0.5, 0.866, 1, 0.866, 0.5, 0, -0.5, -0.866, -1, -0.866, -0.5], txt = fv.reduce((s, v, k) => s + v * SN[k], 0) / 6, s = agree(txt, dataCoef(fv, 'b', 1), 2);
        if (!s) return null;
        return { q: `表は、機械の振動を1周期の中で $30^{\\circ}$ ごとにはかった値。$b_1$（データの和で。$\\sin30^{\\circ}=0.5$、$\\sin60^{\\circ}=0.866$、小数第2位まで）`, a: `約 $${s}$`, key: `12|${fs}|b1`, easyCheck: false,
          table: dataTable(fs, 30, true), easy: `$\\dfrac{2}{12}\\sum f_k\\sin t_k=\\dfrac{${nf(r9(txt * 6))}}{6}$`, easyCheck: false, verify: p => valIs(p, +s) };
      },
      // わな：式がわかっている（積和の式で読む。9-17）
      trap(r) {
        const A = r.pick([2, 4, 6, 8, 10]), m = r.pick([1, 2]);
        return dest({ q: `式 $f(t)=${A}${tf('sin', m)}${tf('cos', m)}$ で表される波の $b_${2 * m}$`, a: `$${nf(A / 2)}$`, key: `t|${A}|${m}`,
          verify: p => valIs(p, bnNum(t => A * Math.sin(m * t) * Math.cos(m * t), 2 * Math.PI, 2 * m), 1e-7) }, '9-23',
          `式があるなら、データの和にしなくてよい。2倍角の式で $${A === 2 ? '' : nf(A / 2)}${tf('sin', 2 * m)}$`, ['9-17']);
      },
    },
  });

  // ================================================================ 9-24
  // 2乗の平均：c + Σ(a cos + b sin) → c^2 + Σ(a^2+b^2)/2
  add({
    id: '9-24', part: 2, chap: '9-2⑪・9-3⑨ 例題9', stars: 1,
    title: 'パーセバルの等式：2乗の平均は、成分の2乗の平均の和',
    mark: '「電力」「2乗の平均」、無限に続く和。',
    futsu: ['$f$ を2乗して展開し、', '1周期で積分する', '（かけ算の項がたくさん出る）。'],
    raku: ['$f=2+3\\cos t+4\\sin2t$ の2乗の平均', '→ $4+\\frac12(9+16)=16.5$', '高さ1の方形波（2乗の平均1）', '→ $1=\\frac12\\sum\\frac{16}{n^2\\pi^2}$', '→ $1+\\frac19+\\frac{1}{25}+\\cdots=\\frac{\\pi^2}{8}$'],
    why: '$f$ を2乗すると、ちがう成分どうしの積は1周期の平均で0になり（直交性）、同じ成分の2乗だけが残る。$\\cos^2$・$\\sin^2$ の平均は $\\frac12$ なので、2乗の平均$=\\bigl(\\frac{a_0}{2}\\bigr)^2+\\frac12\\sum(a_n^2+b_n^2)$（パーセバルの等式。9-2⑪）。$c_n$ では $\\sum\\lvert c_n\\rvert^2$（正と負の $n$ の両方。9-3⑨）。全体の電力は、成分ごとの電力の和。',
    caution: '直流分は2乗そのまま（$\\frac12$ をつけない）。$c_n$ では $n$ と $-n$ の両方をたす（$2\\lvert c_1\\rvert^2$）。電力は「2乗の平均÷抵抗」。2乗の平均は、最大値の2乗ではない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '12mm' }, boxh: { s3: '11mm' },
    fits(q) { return /2乗の平均|平均の電力|全体の電力|\\cdots/.test(q) && !/ひずみ/.test(q); },
    steps: {
      // 実数の係数
      s1(r) {
        const n = r.pick([2, 3, 3]), ks = r.shuffle([1, 2, 3, 4]).slice(0, n - 1), terms = [];
        const c = r.pick([0, 1, 2, 3, -1]); if (c) terms.push([c, '1', 0]);
        ks.forEach(k => terms.push([r.pick([1, 2, 3, 4, 5, -2, -3]), r.pick(['sin', 'cos']), k]));
        if (terms.length < 2) terms.push([r.pick([2, 4, 6]), 'sin', 5]);
        const ms = terms.reduce((s, [a, kd]) => s + (kd === '1' ? a * a : a * a / 2), 0);
        return { q: `$f(t)=${sumTeX(terms)}$ の2乗の平均（1周期）`, a: `$${nf(ms)}$`, key: `s1|${JSON.stringify(terms)}`, easyCheck: false,
          easy: `$${terms.map(([a, kd]) => (kd === '1' ? `${par(a)}^2` : `\\dfrac{${par(a)}^2}{2}`)).join('+')}=${nf(ms)}$`,
          verify: p => valIs(p, meanNum(t => sumVal(terms, t) ** 2, 2 * Math.PI), 1e-7) };
      },
      // c_n の和・抵抗の電力
      s2(r) {
        if (turn(r, '24s2', 2) === 0) {
          const c0 = r.pick([0, 1, 2, 3]), a1 = r.pick([1, 2, 3]), b1 = r.pick([1, 2, 4]), k2 = r.pick([2, 3]), d2 = r.pick([1, 2, 3]), im2 = r.chance(0.5);
          const ms = c0 * c0 + 2 * (a1 * a1 + b1 * b1) + 2 * d2 * d2;
          const t = [c0 ? `$c_0=${c0}$` : '', `$c_{\\pm1}=${a1}\\mp${b1 === 1 ? ' ' : b1}j$`, `$c_{\\pm${k2}}=${im2 ? `\\pm${d2 === 1 ? ' ' : d2}j` : d2}$`].filter(Boolean);
          return { q: `${t.join('、')}、ほかの $c_n$ は0の波の2乗の平均`, a: `$${nf(ms)}$`, key: `cn|${c0},${a1},${b1},${k2},${d2},${im2}`, easyCheck: false,
            easy: `$\\sum\\lvert c_n\\rvert^2=${c0 ? `${c0}^2+` : ''}2\\times(${a1}^2+${b1}^2)+2\\times${d2}^2$`,
            verify: p => valIs(p, meanNum(t2 => { let v = c0; v += 2 * (a1 * Math.cos(t2) + b1 * Math.sin(t2)); v += 2 * (im2 ? -d2 * Math.sin(k2 * t2) : d2 * Math.cos(k2 * t2)); return v * v; }, 2 * Math.PI), 1e-7) };
        }
        const c = r.pick([0, 2, 4, 6]), a = r.pick([2, 4, 6, 8, 10]), b = r.pick([0, 2, 4]), R = r.pick([2, 4, 5, 10]), w = r.pick([100, 120]);
        const terms = [[c, '1', 0], [a, 'sin', 1], [b, 'sin', 3]].filter(t => t[0]);
        const ms = terms.reduce((s, [x, kd]) => s + (kd === '1' ? x * x : x * x / 2), 0), P = ms / R;
        if (String(nf(P)).length > 5 || terms.length < 2) return null;
        const vt = terms.map(([x, kd, m], i) => (kd === '1' ? String(x) : `${i ? '+' : ''}${x}\\sin${w * m}\\pi t`)).join('');
        return { q: `電圧 $v=${vt}$（V）を ${U(R, '\\Omega')} の抵抗にかけたときの平均の電力（W）`, a: `$${nf(P)}$`, key: `R|${c},${a},${b},${R}`, easyCheck: false,
          easy: `2乗の平均 $${nf(ms)}$ を $${R}$ でわる`, verify: p => valIs(p, meanNum(t => sumVal(terms, t) ** 2, 2 * Math.PI) / R, 1e-7) };
      },
      // 無限に続く和（パーセバルの等式から）
      s3(r) {
        const k = turn(r, '24s3', 3);
        if (k === 0) {   // のこぎり波 → Σ1/n^2 = π^2/6
          const s = r.pick([1, 4, 9]);
          const series = s === 1 ? '1+\\dfrac14+\\dfrac19+\\dfrac{1}{16}+\\cdots' : s === 4 ? '4+1+\\dfrac49+\\dfrac{1}{4}+\\cdots' : '9+\\dfrac94+1+\\dfrac{9}{16}+\\cdots';
          return { q: `$-\\pi<t<\\pi$ で $f=t$ の波（2乗の平均 $\\dfrac{\\pi^2}{3}$、$b_n=\\dfrac{2(-1)^{n+1}}{n}$）から、$${series}$ の値`, a: `$${pq(fr(s, 6), 2)}$`, key: `saw|${s}`, easyCheck: false,
            easy: `$\\dfrac{\\pi^2}{3}=\\dfrac12\\sum\\dfrac{4}{n^2}$ から $\\sum\\dfrac{1}{n^2}=\\dfrac{\\pi^2}{6}$。その $${s}$ 倍`,
            verify: p => { let S = 0; for (let n = 1; n < 200000; n++) S += s / (n * n); return valIs(p, S + s / 200000, 1e-8); } };
        }
        if (k === 1) {   // 三角波 → Σ(奇数) 1/n^4 = π^4/96
          return { q: `$-\\pi<t<\\pi$ で $f=\\lvert t\\rvert-\\dfrac{\\pi}{2}$ の波（2乗の平均 $\\dfrac{\\pi^2}{12}$、奇数番だけ $a_n=-\\dfrac{4}{\\pi n^2}$）から、$1+\\dfrac{1}{81}+\\dfrac{1}{625}+\\cdots$（奇数の4乗の逆数の和）の値`,
            a: '$\\dfrac{\\pi^4}{96}$', key: 'tri', easyCheck: false, boxw: '18mm',
            easy: '$\\dfrac{\\pi^2}{12}=\\dfrac12\\sum\\dfrac{16}{\\pi^2n^4}$ から $\\sum\\dfrac{1}{n^4}=\\dfrac{\\pi^4}{96}$',
            verify: p => { let S = 0; for (let n = 1; n < 2000; n += 2) S += 1 / n ** 4; return valIs(p, S, 1e-9); } };
        }
        const A = r.pick([2, 3, 5]);   // 方形波の基本波の電力の割合
        return { q: `高さ $${A}$ の方形波（2乗の平均 $${A * A}$、奇数番だけ $b_n=\\dfrac{${4 * A}}{n\\pi}$）で、基本波の電力は全体の電力の何倍か`, a: '$\\dfrac{8}{\\pi^2}$', key: `sq|${A}`, easyCheck: false,
          easy: `$\\dfrac12\\Bigl(\\dfrac{${4 * A}}{\\pi}\\Bigr)^2\\div${A * A}=\\dfrac{8}{\\pi^2}$（高さによらない）`, verify: p => valIs(p, 0.5 * (4 * A / Math.PI) ** 2 / (A * A), 1e-9) };
      },
      // わな：最大値（2乗の平均ではない。合成。わざなし）
      trap(r) {
        const [a, b, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5]]);
        return dest({ q: `$f(t)=${a}\\sin t+${b}\\cos t$ の最大値`, a: `$${c}$`, key: `t|${a},${b}`,
          verify: p => { let mx = -Infinity; for (let k = 0; k < 20000; k++) mx = Math.max(mx, a * Math.sin(k * 2 * Math.PI / 20000) + b * Math.cos(k * 2 * Math.PI / 20000)); return valIs(p, mx, 1e-6); } }, '9-24',
          `2乗の平均（$\\frac{${a}^2+${b}^2}{2}$）ではなく、最大値。1つの $\\sin$ にまとめると振幅 $\\sqrt{${a}^2+${b}^2}=${c}$`, ['4-59']);
      },
    },
  });

  // ================================================================ 9-25
  // ひずみ率（％）＝√(高調波の電力÷基本波の電力)×100。答えが割り切れる組だけ
  const R25 = [5, 10, 15, 30, 40, 50, 60];
  const PY = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10], [4, 3, 5]];
  add({
    id: '9-25', part: 2, chap: '9-2⑪ 例題10', stars: 1,
    title: 'ひずみ率は、全体の電力から基本波の電力をひいて求める',
    mark: '「ひずみ率」、成分の電力は係数の2乗の $\\frac12$。',
    futsu: ['高調波の係数 $b_3$、$b_5$、…を', '1つずつ計算して2乗し、', '無限にたし続ける。'],
    raku: ['2乗の平均（直流分なし）0.52、$b_1=1$', '→ 基本波 $\\frac12$、高調波 $0.52-0.5=0.02$', '→ $\\sqrt{0.04}=0.2$ で20 %', '方形波は $\\frac{8}{\\pi^2}\\approx0.811$ と $0.189$', '→ $\\sqrt{0.233}=0.483$ で約48.3 %'],
    why: 'ひずみ率$=\\sqrt{\\dfrac{\\text{高調波の電力の合計}}{\\text{基本波の電力}}}$。パーセバルの等式から、全体の電力（2乗の平均）は成分の電力の和なので、高調波の電力の合計は「全体－基本波（－直流分）」で、高調波を1つずつたさなくてよい（9-2⑪ 例題10）。成分の電力は係数の2乗の $\\frac12$。係数がわかっていれば $\\dfrac{\\sqrt{b_2^2+b_3^2+\\cdots}}{b_1}$。',
    caution: '基本波の電力は $b_1^2$ でなく $\\frac12b_1^2$。直流分 $\\bigl(\\frac{a_0}{2}\\bigr)^2$ は、高調波にも基本波にも入れない。平方根をとるのを忘れない。％にするなら100倍。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '14mm' }, boxh: { trap: '11mm' },
    fits(q) { return /ひずみ率/.test(q); },
    steps: {
      // 2乗の平均と b_1 から
      s1(r) {
        const b1 = r.pick([1, 2, 4, 0.5, 3]), R = r.pick(R25), fund = b1 * b1 / 2, Mv = r9(fund * (1 + (R / 100) ** 2));
        if (String(nf(Mv)).replace('.', '').length > 6) return null;
        return { q: `2乗の平均が $${nf(Mv)}$（直流分なし）、基本波の振幅 $b_1=${nf(b1)}$ の波のひずみ率（％）`, a: `$${R}$`, key: `s1|${b1}|${R}`, easyCheck: false,
          easy: `基本波 $${nf(fund)}$、高調波 $${nf(Mv)}-${nf(fund)}=${nf(r9(Mv - fund))}$。$\\sqrt{${nf(r9((Mv - fund) / fund))}}=${nf(R / 100)}$`,
          verify: p => valIs(p, 100 * Math.sqrt((Mv - fund) / fund), 1e-9) };
      },
      // 係数がわかっている波
      s2(r) {
        const b1 = r.pick([2, 4, 5, 10, 20]), sc = r.pick([0.1, 0.2, 0.05, 0.5]), [x, y, h] = r.pick(PY).map(v => r9(v * sc)), one = r.chance(0.25);
        const ks = r.pick([[3, 5], [2, 3], [3, 7]]), kinds = [r.pick(['sin', 'cos']), r.pick(['sin', 'cos'])];
        const terms = [[b1, 'sin', 1], ...(one ? [[h, kinds[0], ks[0]]] : [[x, kinds[0], ks[0]], [y, kinds[1], ks[1]]])];
        const R = r9(100 * h / b1);
        if (String(nf(R)).length > 4 || R > 80) return null;
        return { q: `$f(t)=${sumTeX(terms)}$ のひずみ率（％）`, a: `$${nf(R)}$`, key: `s2|${JSON.stringify(terms)}`, easyCheck: false,
          easy: one ? `$\\dfrac{${nf(h)}}{${b1}}=${nf(R / 100)}$` : `$\\dfrac{\\sqrt{${nf(x)}^2+${nf(y)}^2}}{${b1}}=\\dfrac{${nf(h)}}{${b1}}$`,
          verify: p => { const T = 2 * Math.PI, f = t => sumVal(terms, t), M2 = meanNum(t => f(t) ** 2, T), B1 = bnNum(f, T, 1), A1 = anNum(f, T, 1), F1 = (A1 * A1 + B1 * B1) / 2; return valIs(p, 100 * Math.sqrt((M2 - F1) / F1), 1e-6); } };
      },
      // 直流分のある波
      s3(r) {
        const c = r.pick([1, 2, 3, 0.5]), b1 = r.pick([2, 4, 10]), R = r.pick(R25), fund = b1 * b1 / 2, Mv = r9(c * c + fund * (1 + (R / 100) ** 2));
        if (String(nf(Mv)).replace('.', '').length > 6) return null;
        return { q: `平均が $${nf(c)}$、2乗の平均が $${nf(Mv)}$、基本波の振幅 $b_1=${b1}$（$a_1=0$）の波のひずみ率（％）`, a: `$${R}$`, key: `s3|${c}|${b1}|${R}`, easyCheck: false,
          easy: `直流分 $${nf(c)}^2$ と基本波 $${nf(fund)}$ をひく。高調波 $${nf(r9(Mv - c * c - fund))}$、$\\sqrt{${nf(r9((Mv - c * c - fund) / fund))}}=${nf(R / 100)}$`,
          verify: p => valIs(p, 100 * Math.sqrt((Mv - c * c - fund) / fund), 1e-9) };
      },
      // わな：方形波の n 番めの成分の電力（ひずみ率ではない。係数は 9-06）
      trap(r) {
        const A = r.pick([1, 2, 3]), n = r.pick([3, 5, 7]);
        return dest({ q: `高さ $${A}$ の方形波（$0<t<\\pi$ で $${A}$、$\\pi<t<2\\pi$ で $${-A}$）の、${n}番めの成分の電力（係数の2乗の $\\frac12$）`, a: `$${pq(fr(8 * A * A, n * n), -2)}$`, key: `t|${A}|${n}`,
          verify: p => valIs(p, 0.5 * bnNum(t => (t < Math.PI ? A : -A), 2 * Math.PI, n) ** 2, 1e-6) }, '9-25',
          `ひずみ率ではなく、1つの成分の電力。$b_${n}=\\dfrac{${4 * A}}{${n}\\pi}$ の2乗の $\\frac12$`, ['9-06']);
      },
    },
  });

  // ================================================================ 9-26
  // c_n の一覧（f = c + a cos pt + b sin qt …）：[[n, [re, im]]]
  function cnList(terms) {
    const m = new Map(), addc = (n, re, im) => { const o = m.get(n) || [0, 0]; m.set(n, [r9(o[0] + re), r9(o[1] + im)]); };
    for (const [c, kd, k] of terms) { if (kd === '1') addc(0, c, 0); else if (kd === 'cos') { addc(k, c / 2, 0); addc(-k, c / 2, 0); } else { addc(k, 0, -c / 2); addc(-k, 0, c / 2); } }
    return m;
  }
  const cnum = ([re, im]) => cx([F.fromDec(nf(re)), 0], [F.fromDec(nf(im)), 0]).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/g, (s0, a, b) => s0);
  const cnSub = n => (n < 0 || n > 9 ? `{${n}}` : String(n));
  add({
    id: '9-26', part: 2, chap: '9-3③④ 例題2', stars: 1,
    title: '$c_n=\\frac{a_n-jb_n}{2}$。両側スペクトルの高さは振幅の半分',
    mark: '$\\cos$・$\\sin$ の和で書いた波の $c_n$（場合 J$\'$）。',
    futsu: ['$c_n=\\frac{1}{2\\pi}\\int_0^{2\\pi}f\\,e^{-jnt}\\,\\dd t$ に', '入れて、番号ごとに', '複素数の定積分をする。'],
    raku: ['$f=2+6\\cos t+8\\sin2t$', '→ $c_0=2$、$c_{\\pm1}=3$', '$c_2=\\frac{0-8j}{2}=-4j$、$c_{-2}=4j$', '棒の高さ $\\lvert c_{\\pm2}\\rvert=4$（振幅8の半分）'],
    why: '$a_n\\cos n\\omega_0t+b_n\\sin n\\omega_0t$ をオイラーの公式で回る矢印に書きかえると、$\\frac{a_n-jb_n}{2}e^{jn\\omega_0t}+\\frac{a_n+jb_n}{2}e^{-jn\\omega_0t}$。だから $c_n=\\frac{a_n-jb_n}{2}$、$c_{-n}=\\overline{c_n}$（共役）、$c_0=\\frac{a_0}{2}$（場合 J$\'$。9-3③）。振幅は左回りと右回りの2本に半分ずつ分かれるので、両側スペクトルの棒の高さ $\\lvert c_n\\rvert$ は振幅の半分（9-3④）。',
    caution: '$\\sin$ の係数には $-j$ がつく（$\\frac{1}{j}=-j$）。$c_{-n}$ は $-c_n$ でなく共役 $\\overline{c_n}$（虚部の符号だけ変える）。振幅は $2\\lvert c_n\\rvert$。$\\cos$ と $\\sin$ が同じ番号にあれば、まとめて $\\frac{a_n-jb_n}{2}$。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '18mm', s3: '14mm', trap: '28mm' }, boxh: { s1: '11mm', s2: '11mm' },
    fits(q) { return (/c_/.test(q) && /f\(t\)=/.test(q) && /\\(cos|sin)/.test(q) && !/\^[23]|\\(sin|cos) ?\d*t\\(sin|cos)|\\int|e\^\{|\\lvert|<t</.test(q)) || /両側スペクトル/.test(q); },
    steps: {
      // cos・sin の番号がちがう
      s1(r) {
        const p0 = r.int(1, 4), q0 = r.intNot(1, 4, x => x === p0), c = r.pick([0, 1, 3, 5, -1]), a = r.pick([2, 4, 6, -2, 5, 3]), b = r.pick([2, 4, 6, -4, 3, 10]);
        const terms = [[c, '1', 0], [a, 'cos', p0], [b, 'sin', q0]].filter(t => t[0]);
        if (c === 2 && a === 6 && b === 8) return null;
        const L = cnList(terms), ns = [...L.keys()].filter(x => x !== 0 || r.chance(0.25)), n = r.pick(ns.length ? ns : [...L.keys()]), v = L.get(n);
        return { q: `$f(t)=${sumTeX(terms)}$ の $c_${cnSub(n)}$`, a: `$${cnum(v)}$`, key: `s1|${JSON.stringify(terms)}|${n}`, easyCheck: false,
          easy: n === 0 ? '$c_0=\\dfrac{a_0}{2}$（定数の項）' : `$\\dfrac{a_${Math.abs(n)}-jb_${Math.abs(n)}}{2}$${n < 0 ? 'の共役' : ''}`,
          verify: p => cvalIs(p, cnNum(t => sumVal(terms, t), 2 * Math.PI, n), 1e-7) };
      },
      // 同じ番号に cos と sin、棒の高さ、周期 T の形
      s2(r) {
        const j = turn(r, '26s2', 3), [x, y, h] = r.pick(PY.filter(t => t[2] !== 10)), k = r.int(1, 3), sg = r.pick([1, -1]);
        if (j === 2) {   // 周期 T の形（ω0 = 100π）
          const w = r.pick([100, 120]), a = r.pick([2, 4, 6]), b = r.pick([2, 6, -4, 8]), c = r.pick([1, 2, 3]), n = r.pick([1, 2, -2]);
          if (a === 6 && b === 8) return null;   // 左ページの例の数
          const terms = [[c, '1', 0], [a, 'cos', 1], [b, 'sin', 2]];
          const vt = `${c}+${a}\\cos${w}\\pi t${b < 0 ? '' : '+'}${b}\\sin${2 * w}\\pi t`, v = cnList(terms).get(n);
          return { q: `$f(t)=${vt}$（$\\omega_0=${w}\\pi\\,\\mathrm{rad/s}$）の $c_${cnSub(n)}$`, a: `$${cnum(v)}$`, key: `w|${w}|${a},${b},${c}|${n}`, easyCheck: false,
            easy: `$${2 * w}\\pi=2\\omega_0$ なので $\\sin2\\omega_0t$ の係数 $b_2=${b}$。$c_${cnSub(n)}=${Math.abs(n) === 1 ? `\\dfrac{${a}}{2}` : `${n < 0 ? '\\overline{c_2}' : `\\dfrac{0-${par(b)}j}{2}`}`}$`,
            verify: p => cvalIs(p, cnNum(t => sumVal(terms, t), 2 * Math.PI, n), 1e-7) };
        }
        const terms = [[x, 'cos', k], [sg * y, 'sin', k]];
        if (j === 1) return { q: `$f(t)=${sumTeX(terms)}$ の両側スペクトルの棒の高さ $\\lvert c_{${k}}\\rvert$`, a: `$${nf(h / 2)}$`, key: `h|${x},${y},${k},${sg}`, easyCheck: false,
          easy: `$\\dfrac{\\sqrt{${x}^2+${y}^2}}{2}$（振幅 $${h}$ の半分）`, verify: p => { const c = cnNum(t => sumVal(terms, t), 2 * Math.PI, k); return valIs(p, Math.hypot(...c), 1e-7); } };
        const n = r.pick([k, -k]), v = cnList(terms).get(n);
        return { q: `$f(t)=${sumTeX(terms)}$ の $c_${cnSub(n)}$`, a: `$${cnum(v)}$`, key: `c|${x},${y},${k},${sg}|${n}`, easyCheck: false,
          easy: `$\\dfrac{${x}-${par(sg * y)}j}{2}$${n < 0 ? 'の共役' : ''}`, verify: p => cvalIs(p, cnNum(t => sumVal(terms, t), 2 * Math.PI, n), 1e-7) };
      },
      // 図：両側スペクトル（高さ |c_n|）から振幅・平均
      s3(r) {
        const p0 = r.int(1, 3), q0 = r.intNot(1, 3, x => x === p0), c = r.pick([1, 2, 3]), a = r.pick([2, 3, 5, 6]), b = r.pick([1, 4, 5, 8]);
        const terms = [[c, '1', 0], [a, 'cos', p0], [b, 'sin', q0]], L = cnList(terms);
        const pts = [-3, -2, -1, 0, 1, 2, 3].map(n => { const v = L.get(n) || [0, 0], m = Math.hypot(...v); return [n, m, m ? `$${nf(m)}$` : false]; });
        const ask = r.pick([p0, q0]), amp = 2 * Math.hypot(...L.get(ask));
        if (a === 6 && b === 8) return null;
        return { q: `図は、周期 $2\\pi$ のある波の両側スペクトル（棒の高さは $\\lvert c_n\\rvert$）。${ask}番めの成分（$${tf('cos', ask)}$・$${tf('sin', ask)}$ の部分）の振幅`, a: `$${nf(amp)}$`, key: `fig|${c},${a},${b},${p0},${q0}|${ask}`, easyCheck: false,
          fig: { s: 5, items: M.stem(pts, { h: 2.2 }) }, easy: `$n=\\pm${ask}$ の2本をあわせて1つの波。$2\\times${nf(amp / 2)}$`,
          verify: p => { const cc = cnNum(t => sumVal(terms, t), 2 * Math.PI, ask); return valIs(p, 2 * Math.hypot(...cc), 1e-7); } };
      },
      // わな：c_{±1} から実数の式へ（逆向き。9-27）
      trap(r) {
        const a = r.pick([1, 2, 3, -1]), b = r.pick([1, 2, 3, 4]), k = r.pick([1, 2]);
        const ans = sumTeX([[2 * a, 'cos', k], [-2 * b, 'sin', k]]);
        return dest({ q: `$c_{\\pm${k}}=${a}\\pm${b === 1 ? ' ' : b < 0 ? `(${b})` : b}j$、ほかの $c_n$ は0の波を、$\\cos$・$\\sin$ の実数の式に`, a: `$${ans}$`, key: `t|${a},${b},${k}`,
          verify: p => { const m = mathsOf(p.a)[0]; for (const t of [0.37, 1.21, 2.9]) { const w = 2 * (a * Math.cos(k * t) - b * Math.sin(k * t)); if (!near(ev(m, { t }), w, 1e-9)) return `答え ${p.a} がちがう`; } return true; } }, '9-26',
          `$c_n$ から $a_n$・$b_n$ へ（逆向き）。$a_${k}=c_${k}+c_{-${k}}=${2 * a}$、$b_${k}=j(c_${k}-c_{-${k}})=${-2 * b}$`, ['9-27']);
      },
    },
  });

  // ================================================================ 9-27
  // (a+bj)e^{jkt}+(a−bj)e^{−jkt} = 2a cos kt − 2b sin kt
  const cTeX = (a, b) => cx([fr(a), 0], [fr(b), 0]);
  const eArg = (k, sg, w) => `e^{${sg < 0 ? '-' : ''}j${w ? w : (k === 1 ? '' : k)}t}`;
  const pairTeX = (a, b, k, w) => { const wrap = c => (c === '1' ? '' : c === '-1' ? '-' : /[+-]/.test(c.slice(1)) ? `(${c})` : c), c1 = wrap(cTeX(a, b)), c2 = wrap(cTeX(a, -b)); return `${c1}${eArg(k, 1, w)}${c2.startsWith('-') ? '' : '+'}${c2}${eArg(k, -1, w)}`; };
  const wantOf = t => t.replace(/(\d)e\^/g, '$1\\cdot e^');   // 検算の式：2e^{jt} を 2・e^{jt} と読ませる
  add({
    id: '9-27', part: 2, chap: '9-3③ 例題1', stars: 1,
    title: '共役な組の和は、$c_n+c_{-n}$ と $j(c_n-c_{-n})$ で実数の式に',
    mark: '回る矢印の和 $ce^{jnt}+\\bar ce^{-jnt}$ を、実数の式に。',
    futsu: ['オイラーの公式で', '$e^{jt}=\\cos t+j\\sin t$ を入れて', '2つとも展開し、', '$j^2=-1$ で整理する。'],
    raku: ['$(2+3j)e^{jt}+(2-3j)e^{-jt}$', '→ $a_1=(2+3j)+(2-3j)=4$', '$b_1=j\\bigl((2+3j)-(2-3j)\\bigr)=j\\cdot6j=-6$', '→ $4\\cos t-6\\sin t$'],
    why: '$c_n=\\frac{a_n-jb_n}{2}$、$c_{-n}=\\frac{a_n+jb_n}{2}$ をたすと $a_n=c_n+c_{-n}$、ひいて $j$ をかけると $b_n=j(c_n-c_{-n})$（9-3③）。共役な2本の矢印は横の軸について折り返した位置にあるので、和は実数になり、$c_n$ の実部の2倍が $\\cos$ の係数、虚部の $-2$ 倍が $\\sin$ の係数。',
    caution: '$b_n$ は $j(c_n-c_{-n})$ で、$j\\times j=-1$ に注意（符号が逆になりやすい）。$c_n$ の虚部が正なら $\\sin$ の係数は負。共役でない組（虚部の符号が同じ）は、実数の波にならない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '30mm', s3: '30mm', trap: '12mm' },
    fits(q) { return ((/e\^\{j/.test(q) && /e\^\{-j/.test(q)) || /c_\{\\pm/.test(q)) && /実数の式|の \$[ab]_/.test(q) && !/積/.test(q); },
    steps: {
      // 1組
      s1(r) {
        const k = r.int(1, 3), kind = r.pick(['g', 'g', 'g', 're', 'im']), a = kind === 'im' ? 0 : r.pick([1, 2, 3, 4, -1, -2]), b = kind === 're' ? 0 : r.pick([1, 2, 3, 4, -1, -3]);
        if (k === 1 && a === 2 && b === 3) return null;   // 左ページの例
        const orig = pairTeX(a, b, k), ans = sumTeX([[2 * a, 'cos', k], [-2 * b, 'sin', k]]);
        return { q: `$${orig}$ を実数の式に`, a: `$${ans}$`, key: `s1|${a},${b},${k}`, easyCheck: false,
          easy: `$a_${k}=${2 * a}$、$b_${k}=j\\bigl((${cTeX(a, b)})-(${cTeX(a, -b)})\\bigr)=${-2 * b}$`, calc: { kind: 'fn', complex: true, want: wantOf(orig), vars: ['t'] } };
      },
      // 定数と2組・係数だけ
      s2(r) {
        if (turn(r, '27s2', 2) === 0) {
          const c = r.pick([1, 2, 3, -1]), a1 = r.pick([1, 2, -1]), b1 = r.pick([1, 2, -2]), a2 = r.pick([1, 3, 0]), b2 = r.pick([1, -1, 2]), k2 = r.pick([2, 3]);
          const orig = `${c}+${pairTeX(a1, b1, 1)}+${pairTeX(a2, b2, k2)}`.replace(/\+-/g, '-');
          const ans = sumTeX([[c, '1', 0], [2 * a1, 'cos', 1], [-2 * b1, 'sin', 1], [2 * a2, 'cos', k2], [-2 * b2, 'sin', k2]]);
          return { q: `$${orig}$ を実数の式に`, a: `$${ans}$`, key: `s2|${c},${a1},${b1},${a2},${b2},${k2}`, easyCheck: false, boxw: '44mm',
            easy: '組ごとに $a_n=c_n+c_{-n}$、$b_n=j(c_n-c_{-n})$', calc: { kind: 'fn', complex: true, want: wantOf(orig), vars: ['t'] } };
        }
        const a = r.pick([1, 2, 3, -2, 5]), b = r.pick([1, 2, 4, -1, -3]), k = r.int(1, 3), ab = r.pick(['a', 'b']);
        if (k === 1 && a === 2 && b === 3) return null;
        const v = ab === 'a' ? 2 * a : -2 * b;
        return { q: `$${pairTeX(a, b, k)}=a_${k}\\cos${k === 1 ? ' ' : k}t+b_${k}\\sin${k === 1 ? ' ' : k}t$ のときの $${ab}_${k}$`, a: `$${v}$`, key: `ab|${a},${b},${k}|${ab}`, easyCheck: false, boxw: '12mm',
          easy: ab === 'a' ? `$(${cTeX(a, b)})+(${cTeX(a, -b)})=${v}$` : `$j\\times${b * 2 === 1 ? '' : par(2 * b)}j=${v}$`,
          verify: p => { const c = evc(wantOf(pairTeX(a, b, k)), { t: 0.7 }), w = ab === 'a' ? null : null; const t1 = 0.7, A = 2 * a, B = -2 * b; return (near(c[0], A * Math.cos(k * t1) + B * Math.sin(k * t1), 1e-9) && valIs(p, ab === 'a' ? A : B) === true) || `答え ${p.a} がちがう`; } };
      },
      // 周期 T の形、c_{-1} を共役で書いた形
      s3(r) {
        if (turn(r, '27s3', 2) === 0) {
          const w = r.pick([100, 120, 200]), a = r.pick([1, 2, 3, -1]), b = r.pick([1, 2, -2, 3]);
          const wt = `${w}\\pi `, orig = pairTeX(a, b, 1, wt), ans = sumTeX([[2 * a, 'cos', 1], [-2 * b, 'sin', 1]], `${w}\\pi `);
          return { q: `$${orig}$ を実数の式に`, a: `$${ans}$`, key: `w|${w}|${a},${b}`, easyCheck: false,
            easy: `$a_1=${2 * a}$、$b_1=${-2 * b}$（$\\omega_0=${w}\\pi$）`, calc: { kind: 'fn', complex: true, want: wantOf(orig), vars: ['t'], pts: [0.0013, 0.0037, 0.0051, 0.0083] } };
        }
        const a = r.pick([3, 1, 2, 5, -2]), b = r.pick([4, 2, -1, -3, 1]), k = r.int(1, 2);
        const c1 = cTeX(a, b), ans = sumTeX([[2 * a, 'cos', k], [-2 * b, 'sin', k]]);
        return { q: `$c_${k}=${c1}$、$c_{-${k}}=\\overline{c_${k}}$ のとき、$c_${k}e^{j${k === 1 ? '' : k}t}+c_{-${k}}e^{-j${k === 1 ? '' : k}t}$ を実数の式に`, a: `$${ans}$`, key: `bar|${a},${b},${k}`, easyCheck: false,
          easy: `$c_{-${k}}=${cTeX(a, -b)}$。実部の2倍 $${2 * a}$ が $\\cos$、虚部の $-2$ 倍 $${-2 * b}$ が $\\sin$ の係数`, calc: { kind: 'fn', complex: true, want: wantOf(pairTeX(a, b, k)), vars: ['t'] } };
      },
      // わな：2つの矢印の積（和ではない。肩のたし算で1本に。わざなし）
      trap(r) {
        const [a, b, h] = r.pick([[2, 3, 13], [1, 2, 5], [3, 4, 25], [1, 3, 10], [2, 1, 5]]), k = r.pick([1, 2]);
        return dest({ q: `$(${cTeX(a, b)})${eArg(k, 1)}$ と $(${cTeX(a, -b)})${eArg(k, -1)}$ の積`, a: `$${h}$`, key: `t|${a},${b},${k}`,
          verify: p => { const v = evc(`(${cTeX(a, b)})${eArg(k, 1)}(${cTeX(a, -b)})${eArg(k, -1)}`, { t: 0.83 }); return (Math.abs(v[1]) < 1e-9 && valIs(p, v[0]) === true) || `答え ${p.a} がちがう`; } }, '9-27',
          `和ではなく積。肩のたし算で $e^{0}=1$ になり、$(${cTeX(a, b)})(${cTeX(a, -b)})=${a}^2+${b}^2$`);
      },
    },
  });

  // ================================================================ 9-28
  // 前半 A・後半 B（周期 2π）：c_0 = (A+B)/2、c_n = (A−B)/(jnπ)（奇数）、0（偶数）
  const HB = (A, B) => `$0<t<\\pi$ で $${A}$、$\\pi<t<2\\pi$ で $${B}$`;
  const cnPw = (A, B, n) => cnPwExact(t => (t < Math.PI ? A : B), [Math.PI], n);
  // とびのある波の c_n（数値積分。とびの所で区切る）
  const cnCut = (f, T, n, cuts) => { const w = 2 * Math.PI / T; return [cutInt(t => f(t) * Math.cos(n * w * t), 0, T, cuts) / T, -cutInt(t => f(t) * Math.sin(n * w * t), 0, T, cuts) / T]; };
  const cnPwExact = (f, cuts, n) => { const c = [0, 0]; const xs = [0, ...cuts, 2 * Math.PI]; for (let k = 1; k < xs.length; k++) { const a = xs[k - 1], b = xs[k], v = f((a + b) / 2); if (n === 0) { c[0] += v * (b - a); continue; } c[0] += v * (Math.sin(n * b) - Math.sin(n * a)) / n; c[1] += v * (Math.cos(n * b) - Math.cos(n * a)) / n; } return [c[0] / (2 * Math.PI), c[1] / (2 * Math.PI)]; };
  // −(A−B)/(nπ) j の TeX（n は数）
  const cnOdd = (D, n) => cx(null, [fr(-D, n), -1]);
  const jn = n => `${n < 0 ? '-' : ''}${Math.abs(n) === 1 ? '' : Math.abs(n)}j`;   // jn の字（n=−1 なら −j）
  const ejn = n => `e^{${n > 0 ? '-' : ''}j${Math.abs(n) === 1 ? '' : Math.abs(n)}t}`;   // e^{−jnt}
  add({
    id: '9-28', part: 2, chap: '9-3⑤ 例題5', stars: 1,
    title: '$c_n$ は $e^{-jn\\omega_0t}$ をかけて平均（区間ごとに一定）',
    mark: '区間ごとに一定の波の $c_n$（場合 J）。',
    futsu: ['$a_n$ と $b_n$ を、$\\cos$ と $\\sin$ の', '2種類の定積分で別々に求めてから、', '$c_n=\\frac{a_n-jb_n}{2}$ にする。'],
    raku: ['前半6・後半0（周期 $2\\pi$）→ $c_0=3$', '$c_n=\\frac{6}{2\\pi}\\cdot\\frac{1-(-1)^n}{jn}$', '→ 奇数 $\\frac{6}{jn\\pi}$、偶数0', '（$a_n$・$b_n$ から作ったものと同じ）'],
    why: '$c_n$ は「$f$ に右回りの矢印 $e^{-jn\\omega_0t}$ をかけて1周期で平均」したもの（$\\frac{1}{T}$、肩はマイナス。9-3⑤）。区間ごとに一定なら、$\\int e^{-jnt}\\,\\dd t=\\frac{e^{-jnt}}{-jn}$ の1種類の積分ですみ、はしで $e^{-jn\\pi}=(-1)^n$、$e^{-j2n\\pi}=1$ を使う。$c_0$ は平均（面積÷周期）として別に出す。',
    caution: '$\\frac{2}{T}$ でなく $\\frac{1}{T}$。肩のマイナスを忘れると $c_{-n}$ が出る。$n=0$ は式に入れられない（0でわる）ので別に。$\\frac{1}{j}=-j$ なので $\\frac{6}{j\\pi}=-\\frac{6}{\\pi}j$。周期 $T$ でも、形が同じなら $c_n$ は同じ。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '24mm', trap: '12mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return /c_/.test(q) && /<t<|前の半分/.test(q) && !/f\(t\)=|\\lvert/.test(q); },
    steps: {
      // 前半 A・後半 0
      s1(r) {
        const A = r.pick([2, 4, 5, 8, 10, 12]), j = turn(r, '28s1', 4);
        if (j === 0) return { q: `${HB(A, 0)} をくり返す波の $c_0$`, a: `$${pq(fr(A, 2))}$`, key: `c0|${A}`, easyCheck: false, easy: `平均（面積 $${A}\\pi$ ÷ $2\\pi$）`, verify: p => valIs(p, cnPw(A, 0, 0)[0], 1e-7) };
        if (j === 1) return { q: `${HB(A, 0)} をくり返す波の $c_n$（$n\\neq0$）：${OE}`, a: `奇数 $\\dfrac{${A}}{jn\\pi}$、偶数 $0$`, key: `cn|${A}`, easyCheck: false, boxw: '20mm',
          easy: `$\\dfrac{${A}}{2\\pi}\\cdot\\dfrac{1-(-1)^n}{jn}$`, verify: p => oeIs(p, n => cnPw(A, 0, n)) };
        const n = r.pick([1, -1, 3, -3]);
        return { q: `${HB(A, 0)} をくり返す波の $c_${cnSub(n)}$`, a: `$${cnOdd(A, n)}$`, key: `c|${A}|${n}`, easyCheck: false,
          easy: `$\\dfrac{${A}}{${jn(n)}\\pi}$。$\\dfrac{1}{j}=-j$`, verify: p => cvalIs(p, cnPw(A, 0, n), 1e-7) };
      },
      // 前半 A・後半 B
      s2(r) {
        const A = r.pick([1, 2, 3, 4, 5, 6]), B = r.pick([-1, -2, -3, -4, 1, 2]), j = turn(r, '28s2', 3);
        if (A === B) return null;
        if (j === 0) return { q: `${HB(A, B)} をくり返す波の $c_0$`, a: `$${pq(fr(A + B, 2))}$`, key: `c0|${A},${B}`, easyCheck: false, easy: `平均 $\\dfrac{${A}+${par(B)}}{2}$`, verify: p => valIs(p, cnPw(A, B, 0)[0], 1e-7) };
        if (j === 1) return { q: `${HB(A, B)} をくり返す波の $c_n$（$n\\neq0$）：${OE}`, a: `奇数 $\\dfrac{${A - B}}{jn\\pi}$、偶数 $0$`, key: `cn|${A},${B}`, easyCheck: false, boxw: '20mm',
          easy: `$\\dfrac{1}{2\\pi}\\cdot\\dfrac{(${A}-${par(B)})(1-(-1)^n)}{jn}$`, verify: p => oeIs(p, n => cnPw(A, B, n)) };
        const n = r.pick([1, -1, 3]);
        return { q: `${HB(A, B)} をくり返す波の $c_${cnSub(n)}$`, a: `$${cnOdd(A - B, n)}$`, key: `c|${A},${B}|${n}`, easyCheck: false,
          easy: `$\\dfrac{${A}-${par(B)}}{${jn(n)}\\pi}$`, verify: p => cvalIs(p, cnPw(A, B, n), 1e-7) };
      },
      // 区間が半分でない・周期 T
      s3(r) {
        if (turn(r, '28s3', 2) === 0) {
          const A = r.pick([2, 4, 6, 8]), n = r.pick([1, -1, 2, 3]);
          // 0<t<π/2 で A：c_n = (A/2π)(1−e^{−jnπ/2})/(jn)
          const v = cnPwExact(t => (t < Math.PI / 2 ? A : 0), [Math.PI / 2], n);
          const T = { 1: [[fr(A, 2), -1], [fr(-A, 2), -1]], [-1]: [[fr(A, 2), -1], [fr(A, 2), -1]], 2: [null, [fr(-A, 2), -1]], 3: [[fr(-A, 6), -1], [fr(-A, 6), -1]] }[n];
          return { q: `$0<t<\\dfrac{\\pi}{2}$ で $${A}$、$\\dfrac{\\pi}{2}<t<2\\pi$ で $0$ をくり返す波の $c_${cnSub(n)}$`, a: `$${cx(T[0], T[1])}$`, key: `q|${A}|${n}`, easyCheck: false,
            easy: `$\\dfrac{1}{2\\pi}\\displaystyle\\int_0^{\\pi/2}${A}${ejn(n)}\\,\\dd t$`,
            verify: p => cvalIs(p, v, 1e-9) };
        }
        const A = r.pick([2, 4, 5, 10]), T0 = r.pick([0.01, 0.02, 0.001]), n = r.pick([1, 3, -1]);
        return { q: `周期 ${U(nf(T0), 's')} で、前の半分が $${A}$、後ろの半分が $0$ の波の $c_${cnSub(n)}$（$\\omega_0=\\dfrac{2\\pi}{${nf(T0)}}$）`, a: `$${cnOdd(A, n)}$`, key: `T|${A}|${T0}|${n}`, easyCheck: false,
          easy: `$\\theta=\\omega_0t$ と置けば周期 $2\\pi$ の形と同じ。$\\dfrac{${A}}{${jn(n)}\\pi}$`, verify: p => cvalIs(p, cnCut(t => (t < T0 / 2 ? A : 0), T0, n, [T0 / 2]), 1e-7) };
      },
      // わな：cos の式（積分しない。9-26）
      trap(r) {
        const A = r.pick([2, 4, 8, 10]), k = r.int(2, 4), sn = r.chance(0.4), n = r.pick([k, -k]);
        const v = sn ? cx(null, [fr(n > 0 ? -A : A, 2), 0]) : pq(fr(A, 2));
        return dest({ q: `$f(t)=${A}${tf(sn ? 'sin' : 'cos', k)}$ の $c_${cnSub(n)}$`, a: `$${v}$`, key: `t|${A}|${k}|${sn}|${n}`,
          verify: p => cvalIs(p, cnNum(t => A * Math[sn ? 'sin' : 'cos'](k * t), 2 * Math.PI, n), 1e-7) }, '9-28',
          `区間ごとに一定ではなく、$${sn ? '\\sin' : '\\cos'}$ の式。積分しないで $\\dfrac{a_n-jb_n}{2}$ から`, ['9-26']);
      },
    },
  });

  // ================================================================ 9-29
  // 倍率 1/(1+jx) の大きさ：x と、きれいな値
  const X29 = [[fr(3, 4), fr(4, 5), null], [fr(4, 3), fr(3, 5), null], [fr(5, 12), fr(12, 13), null], [fr(12, 5), fr(5, 13), null], [fr(2), null, '\\dfrac{1}{\\sqrt5}'], [fr(4), null, '\\dfrac{1}{\\sqrt{17}}'], [fr(1, 2), null, '\\dfrac{2}{\\sqrt5}']];
  const magH = x => 1 / Math.hypot(1, x);
  add({
    id: '9-29', part: 2, chap: '9-3⑧ 例題7', stars: 1,
    title: '回路に通すと、出てくる $c_n$＝入る $c_n$×その周波数の倍率',
    mark: '周期の波をローパスフィルターに通す（折れ点）。',
    futsu: ['微分方程式 $\\tau\\dot v+v=v_{\\mathrm{in}}$ を', '方形波の区間ごとに解いて、', 'つなぎ合わせる。'],
    raku: ['高さ1の方形波、$\\omega_0\\tau=1$', '→ 基本の倍率 $\\frac{1}{\\lvert1+j\\rvert}=\\frac{1}{\\sqrt2}$、3番め $\\frac{1}{\\sqrt{10}}$', '→ 出てくる振幅は約0.90 と約0.13', '（$\\frac4\\pi=1.273$、$\\frac{1}{\\sqrt2}=0.707$、$\\frac{1}{\\sqrt{10}}=0.316$）'],
    why: '回る矢印 $e^{j\\omega t}$ をローパスフィルター（$\\tau\\dot v+v=v_{\\mathrm{in}}$）に入れると、$\\frac{1}{1+j\\omega\\tau}$ 倍になって出てくる（微分は $j\\omega$ をかけること）。式は線形なので、周期の波なら $n$ 番めの矢印ごとに $\\frac{1}{1+jn\\omega_0\\tau}$ 倍（9-3⑧）。高い周波数ほど小さくなる。',
    caution: '大きさは $\\frac{1}{\\sqrt{1+x^2}}$（$x=n\\omega_0\\tau$）で、$\\frac{1}{1+x}$ ではない。$n$ をかけ忘れない。折れ点 $f_{\\mathrm c}$ なら $x=\\frac{f}{f_{\\mathrm c}}$。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '16mm', s3: '14mm', trap: '14mm' }, boxh: { s1: '11mm', s2: '11mm' },
    fits(q) { return /ローパス|倍率/.test(q); },
    steps: {
      // 倍率の大きさ
      s1(r) {
        const [x, m, mt] = r.pick(X29), byF = turn(r, '29s1', 2) === 0;
        let txt;
        if (byF) { const fc = r.pick([100, 120, 300, 600, 1200]), f = fc * x[0] / x[1]; if (!Number.isInteger(f)) return null; txt = `折れ点 ${fc} Hz のローパスフィルターでの、${f} Hz の成分の倍率の大きさ`; }
        else { const tau = r.pick([0.01, 0.02, 0.005, 0.001]), w = r9(x[0] / x[1] / tau); if (!Number.isInteger(w)) return null; txt = `$\\tau=${nf(tau)}\\,\\mathrm{s}$ のローパスフィルターでの、角周波数 $${w}\\,\\mathrm{rad/s}$ の倍率の大きさ`; }
        return { q: txt, a: `$${m ? pq(m) : mt}$`, key: `s1|${txt}`, easyCheck: false,
          easy: `$\\omega\\tau=${pq(x)}$。$\\dfrac{1}{\\sqrt{1+${x[1] === 1 ? x[0] : `(${pq(x).replace('\\dfrac', '\\frac')})`}^2}}$`, verify: p => valIs(p, magH(x[0] / x[1]), 1e-9) };
      },
      // 出てくる c_n（複素数）・出てくる振幅
      s2(r) {
        if (turn(r, '29s2', 2) === 0) {
          const a = r.pick([1, 2, -1, 3]), b = r.pick([-1, -2, 1, 0, -3]), x = r.pick([1, 2, 3]), n = r.pick([1, 2, 3]);
          const ci = [a - b * x, a * x + b];   // (a+bj)(1+jx)
          if ((!ci[0] && !ci[1]) || (a === 1 && b === 0)) return null;
          const nw = `${n === 1 ? '' : n}\\omega_0\\tau`;
          const cin = cx([fr(ci[0]), 0], [fr(ci[1]), 0]), out = cx([fr(a), 0], [fr(b), 0]);
          return { q: `$c_${n}=${cin}$ の成分を、倍率 $\\frac{1}{1+j${nw}}$（$${nw}=${x}$）の回路に通したあとの $c_${n}$`, a: `$${out}$`, key: `c|${ci}|${x}|${n}`, easyCheck: false,
            easy: `$\\dfrac{${cin}}{1+${x === 1 ? '' : x}j}$。分母と分子に $1-${x === 1 ? '' : x}j$ をかける`, verify: p => { const w = evc(`(${cin})/(1+${x}j)`); return cvalIs(p, w, 1e-9); } };
        }
        const [x, m] = r.pick(X29.slice(0, 4)), A = r.pick([5, 10, 13, 15, 20, 26]);
        const v = F.mul(fr(A), m); if (v[1] !== 1) return null;
        return { q: `振幅 $${A}$ の $\\sin$ の波を、$\\omega\\tau=${pq(x).replace('\\dfrac', '\\frac')}$ のローパスフィルターに通したときの振幅`, a: `$${v[0]}$`, key: `A|${A}|${x}`, easyCheck: false,
          easy: `倍率の大きさ $${pq(m)}$ をかける`, verify: p => valIs(p, A * magH(x[0] / x[1]), 1e-9) };
      },
      // 方形波をローパスフィルターに（4/π を文に）
      s3(r) {
        const [x, m] = r.pick(X29.slice(0, 2)), fc = r.pick([100, 150, 300, 600]), n = r.pick([1, 3, 5]), A = r.pick([1, 2, 5]);
        const f0 = fc * x[0] / x[1] / n;
        if (!Number.isInteger(f0)) return null;
        const txt = 1.273 * A / n * m[0] / m[1], s = agree(txt, 4 * A / (n * Math.PI) * m[0] / m[1], 2);
        if (!s) return null;
        return { q: `高さ $${A}$、${f0} Hz の方形波（振幅 $\\frac{${4 * A}}{n\\pi}$）を折れ点 ${fc} Hz のローパスフィルターに通したときの、${n * f0} Hz の振幅（$\\frac{4}{\\pi}=1.273$、小数第2位まで）`, a: `約 $${s}$`, key: `sq|${A}|${f0}|${fc}|${n}`, easyCheck: false,
          easy: `${n === 1 ? '基本' : `${n}番め`}の倍率の大きさ $\\dfrac{1}{\\sqrt{1+(${pq(x).replace('\\dfrac', '\\frac')})^2}}=${pq(m)}$。$${A === 1 ? '' : A + '\\times'}1.273${n === 1 ? '' : `\\div${n}`}\\times${nf(m[0] / m[1])}$`,
          verify: p => valIs(p, +s) };
      },
      // わな：基本波にある電力の割合（回路を通さない。パーセバル。9-24）
      trap(r) {
        const two = r.chance(0.5), txt = two ? 0.811 * (1 + 1 / 9) : 0.811, s = agree(100 * txt, 100 * 8 / Math.PI ** 2 * (two ? 10 / 9 : 1), 1);
        return dest({ q: `高さ $1$ の方形波（2乗の平均 $1$、奇数番だけ $c_n=\\dfrac{2}{jn\\pi}$）で、$n=\\pm1$${two ? '・$\\pm3$' : ''} の成分の電力は、全体の電力の約何％か（$\\dfrac{8}{\\pi^2}=0.811$、小数第1位まで）`, a: `約 $${s}$`, key: `t|${two}`,
          verify: p => valIs(p, +s) }, '9-29', `回路は通さない。全体の電力 $1$ のうち、$2\\lvert c_1\\rvert^2=\\dfrac{8}{\\pi^2}$${two ? '、$2\\lvert c_3\\rvert^2=\\dfrac{8}{9\\pi^2}$' : ''}（パーセバルの等式）`, ['9-24']);
      },
    },
  });

  // ================================================================ 9-30
  const RING = R => `半径 ${U(R, 'cm')} の輪（$\\alpha=1\\times10^{-4}\\,\\mathrm{m^2/s}$）`;
  const KR = { 5: 0.04, 2: 0.25, 4: 0.0625, 10: 0.01, 20: 0.0025 };
  add({
    id: '9-30', part: 2, chap: '9-3⑩ 例題8', stars: 1,
    title: '輪の熱：$c_n$ に $e^{-\\alpha n^2t/R^2}$ をかける。最後は平均',
    mark: '輪の形の針金、上半分と下半分の温度。',
    futsu: ['輪を細かく区切って、', 'となりとの熱のやりとりを', '1秒ずつくり返し計算する。'],
    raku: ['半径10 cm（$\\frac{\\alpha}{R^2}=0.01$）、上半分80 ℃・下半分20 ℃', '→ 最後は平均50 ℃', '$n=\\pm1$ の項は $\\frac{0.693}{0.01}\\approx69$ 秒で半分', '$n=\\pm3$ は9倍速く、約7.7秒'],
    why: '輪の上の温度は角 $\\theta$ について周期 $2\\pi$ なので、$T=\\sum c_n(t)e^{jn\\theta}$ と書ける。熱方程式 $\\frac{\\partial T}{\\partial t}=\\frac{\\alpha}{R^2}\\frac{\\partial^2T}{\\partial\\theta^2}$ に入れると、$c_n(t)=c_n(0)e^{-\\alpha n^2t/R^2}$（9-3⑩）。$n=\\pm3$ の項は $n=\\pm1$ の9倍速く消える。$n=0$ の項 $c_0$（平均）だけは変わらないので、最後は輪全体が平均の温度になる（熱が逃げないから）。',
    caution: '$\\frac{\\alpha}{R^2}$ の $R$ は m で（10 cm は0.1 m）。半径が2倍なら4倍おそい。両はしを0 ℃に保つ棒（最後は0 ℃）とはちがう。半分になる時間は $\\frac{\\ln2}{\\alpha n^2/R^2}$。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '12mm', s2: '14mm', s3: '14mm', trap: '14mm' },
    fits(q) { return /輪/.test(q); },
    steps: {
      // 最後の温度（平均）
      s1(r) {
        const kind = r.pick(['half', 'half', 'q']), A = r.pick([40, 60, 70, 90, 100]), B = r.pick([0, 10, 20, 30]);
        if (A === 80 && B === 20) return null;
        const v = kind === 'half' ? (A + B) / 2 : (A + 3 * B) / 4;
        return { q: `熱が逃げない輪の${kind === 'half' ? '上半分' : '4分の1の部分'}を ${A} ℃、${kind === 'half' ? '下半分' : 'のこり'}を ${B} ℃にして始める。十分に時間がたったあとの温度（℃）`, a: `$${nf(v)}$`, key: `s1|${kind}|${A},${B}`, easyCheck: false,
          easy: `$c_0$（平均）だけが残る。${kind === 'half' ? `$\\dfrac{${A}+${B}}{2}$` : `$\\dfrac{${A}\\times1+${B}\\times3}{4}$`}`, verify: p => valIs(p, cnPwExact(th => (th < (kind === "half" ? Math.PI : Math.PI / 2) ? A : B), [kind === "half" ? Math.PI : Math.PI / 2], 0)[0], 1e-9) };
      },
      // 消える速さ・半分になる時間
      s2(r) {
        const R = r.pick([2, 4, 5, 20]), k = KR[R], j = turn(r, '30s2', 2);
        if (j === 0) return { q: `${RING(R)}で、$n=\\pm1$ の項が $e^{-kt}$ でへるときの $k$（/s）`, a: `$${nf(k)}$`, key: `k|${R}`, easyCheck: false,
          easy: `$\\dfrac{\\alpha}{R^2}=\\dfrac{1\\times10^{-4}}{${nf(R / 100)}^2}$`, verify: p => valIs(p, 1e-4 / (R / 100) ** 2, 1e-9) };
        const n = r.pick([1, 3]), rate = k * n * n, txt = 0.693 / rate, s = agree(txt, Math.LN2 / rate, 1);
        if (!s || +s >= 1000) return null;
        return { q: `${RING(R)}で、$n=\\pm${n}$ の項が半分になる時間（秒。$\\ln2=0.693$、小数第1位まで）`, a: `約 $${s}$`, key: `h|${R}|${n}`, easyCheck: false,
          easy: `$\\dfrac{\\alpha}{R^2}=${nf(k)}$${n === 3 ? '、$n^2=9$ 倍' : ''}。$\\dfrac{0.693}{${nf(rate)}}$`, verify: p => valIs(p, +s) };
      },
      // 上半分のまん中の温度（n=±1 の項だけ）
      s3(r) {
        const A = r.pick([60, 80, 100, 120]), B = r.pick([0, 20, 40]), kt = r.pick([1, 2]), E = kt === 1 ? 0.3679 : 0.1353, R = r.pick([5, 2]), k = KR[R];
        const tt = kt / k, txt = (A + B) / 2 + 0.637 * (A - B) * E, s = agree(txt, (A + B) / 2 + 2 * (A - B) / Math.PI * Math.exp(-kt), 1);
        if (!s || A - B < 40) return null;
        return { q: `${RING(R)}で、上半分 ${A} ℃・下半分 ${B} ℃から始める。$${nf(tt)}$ 秒後の $\\theta=\\dfrac{\\pi}{2}$（上半分のまん中）の温度（℃。$n=\\pm1$ の項だけ。$\\dfrac{2}{\\pi}=0.637$、$e^{-${kt}}=${E}$、小数第1位まで）`,
          a: `約 $${s}$`, key: `s3|${A},${B}|${R}|${kt}`, easyCheck: false, boxw: '16mm',
          easy: `$${(A + B) / 2}+\\dfrac{2(${A}-${B})}{\\pi}e^{-${nf(k)}\\times${nf(tt)}}=${(A + B) / 2}+0.637\\times${A - B}\\times${E}$`, verify: p => valIs(p, +s) };
      },
      // わな：両はしを0 ℃に保つ棒（輪ではない。9-14）
      trap(r) {
        const U0 = r.pick([40, 60, 80, 100]), txt = 1.273 * U0 * 0.3727, s = agree(txt, 4 * U0 / Math.PI * Math.exp(-0.987), 1);
        if (!s) return null;
        return dest({ q: `両はしを $0$ ℃に保つ長さ ${U(0.1, 'm')} の棒（はじめどこも $${U0}$ ℃、$\\alpha\\bigl(\\frac{\\pi}{L}\\bigr)^2=0.0987$）の10秒後のまん中の温度（℃。1項めだけ。$\\dfrac{4}{\\pi}=1.273$、$e^{-0.987}=0.3727$、小数第1位まで）`, a: `約 $${s}$`, key: `t|${U0}`,
          verify: p => valIs(p, +s) }, '9-30', `輪ではなく両はしのある棒。$\\sin\\frac{n\\pi x}{L}$ の展開で、1項めは $\\dfrac{4\\times${U0}}{\\pi}e^{-0.0987t}$`, ['9-14']);
      },
    },
  });

  // ================================================================ 9-91
  // はしから a（a = L/k）の所を高さ h つまんだ弦の形（L=1 として）
  const pluck = (a, h) => x => (x < a ? h * x / a : h * (1 - x) / (1 - a));
  const bnPluck = (a, h, n) => 2 * cutInt(x => pluck(a, h)(x) * Math.sin(n * Math.PI * x), 0, 1, [a]);
  add({
    id: '9-91', part: 2, chap: '9-2⑩ 例題5', stars: 1,
    title: 'まん中ではじいた弦は、偶数番の倍音が出ない',
    mark: '弦のまん中をつまんではなす、出ない倍音（場合 E・C）。',
    futsu: ['左半分と右半分の式を書き、', 'それぞれ $x\\sin\\frac{n\\pi x}{L}$ を', '部分積分して、$n$ ごとに', 'たし合わせる。'],
    raku: ['$b_n=\\frac{8h}{n^2\\pi^2}\\sin\\frac{n\\pi}{2}$', '$h=1$ → $b_1=\\frac{8}{\\pi^2}\\approx0.811$', '$b_2=0$（$\\sin\\pi=0$）', '偶数番はみな0'],
    why: 'まん中を高さ $h$ だけつまんだ形は、左半分と右半分が $x=\\frac{L}{2}$ で折り返した形。$\\sin\\frac{n\\pi x}{L}$ も、$n$ が偶数なら $\\frac{L}{2}$ のまわりで半回転して重なるので、左と右の積分が打ち消して $b_n=0$。奇数なら同じになり、半区間の展開の計算で $b_n=\\frac{8h}{n^2\\pi^2}\\sin\\frac{n\\pi}{2}$（9-2⑩ 例題5）。まん中は偶数番のゆれでは動かない点（節）なので、その倍音は出ない。',
    caution: '$\\sin\\frac{n\\pi}{2}$ は奇数番で $1,\\ -1,\\ 1,\\ \\cdots$ と符号が変わる（$b_3$ は負）。係数は $\\frac{1}{n^2}$ で小さくなる（方形波の $\\frac1n$ より速い）。はしから $\\frac{L}{k}$ の所ではじくと、$k$ 番め・$2k$ 番め…が出ない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '16mm', s3: '16mm', trap: '14mm' }, boxh: { s1: '11mm', s2: '11mm' },
    fits(q) { return /弦/.test(q) && /つまん/.test(q) && !/直線/.test(q); },
    steps: {
      // b_n の値（π を残す）
      s1(r) {
        const h = r.pick([2, 3, 4, 5, 6, 10]), u = r.pick(['mm', 'cm']), j = turn(r, '91s1', 4);
        if (j === 3) return { q: `長さ $L$ の弦のまん中を高さ ${U(h, u)} つまんではなす。はじめの形の $b_n$：${OE}`, a: `奇数 $\\dfrac{${8 * h}\\sin\\frac{n\\pi}{2}}{n^2\\pi^2}$、偶数 $0$`, key: `f|${h}|${u}`, easyCheck: false, boxw: '26mm',
          easy: `$\\dfrac{8h}{n^2\\pi^2}\\sin\\dfrac{n\\pi}{2}$ に $h=${h}$`, verify: p => oeIs(p, n => bnPluck(0.5, h, n)) };
        const n = [1, 3, 5][j], v = fr(8 * h * (n % 4 === 1 ? 1 : -1), n * n);
        return { q: `長さ $L$ の弦のまん中を高さ ${U(h, u)} つまんではなす。はじめの形の $b_${n}$（${u}）`, a: `$${pq(v, -2)}$`, key: `b|${h}|${u}|${n}`, easyCheck: false,
          easy: `$\\dfrac{8\\times${h}}{${n === 1 ? '' : n * n}\\pi^2}\\sin\\dfrac{${n === 1 ? '' : n}\\pi}{2}$`, verify: p => valIs(p, bnPluck(0.5, h, n), 1e-7) };
      },
      // 出ない倍音・係数の比
      s2(r) {
        if (turn(r, '91s2', 2) === 0) {
          const f1 = r.pick([110, 130, 196, 220, 247, 262, 330]);
          if (f1 === 220) return null;   // 教科書の例（220 Hz・440 Hz）
          return { q: `基本の周波数が ${f1} Hz の弦のまん中をつまんではじく。出ない倍音のうち、いちばん低い周波数（Hz）`, a: `$${2 * f1}$`, key: `f|${f1}`, easyCheck: false,
            easy: `偶数番が出ない。2番めの $2\\times${f1}$`, verify: p => valIs(p, 2 * f1) };
        }
        const n = r.pick([3, 5, 7]), v = fr(n % 4 === 1 ? 1 : -1, n * n);
        return { q: `まん中をつまんではじいた弦で、$b_${n}$ は $b_1$ の何倍か`, a: `$${pq(v)}$`, key: `r|${n}`, easyCheck: false,
          easy: `$\\dfrac{\\sin\\frac{${n}\\pi}{2}}{${n}^2}\\div\\dfrac{\\sin\\frac{\\pi}{2}}{1}$`, verify: p => valIs(p, bnPluck(0.5, 1, n) / bnPluck(0.5, 1, 1), 1e-7) };
      },
      // はしから L/k ではじく、約の値（8/π² を文に）
      s3(r) {
        if (turn(r, '91s3', 2) === 0) {
          const k = r.pick([3, 4, 5, 6]), f1 = r.pick([100, 110, 196, 262]);
          return { q: `基本の周波数が ${f1} Hz の弦を、はしから $\\dfrac{L}{${k}}$ の所でつまんではじく。出ない倍音のうち、いちばん低い周波数（Hz）`, a: `$${k * f1}$`, key: `k|${k}|${f1}`, easyCheck: false,
            easy: `$b_n$ は $\\sin\\dfrac{n\\pi}{${k}}$ に比例し、$n=${k}$ で0。$${k}\\times${f1}$`,
            verify: p => (Math.abs(bnPluck(1 / k, 1, k)) < 1e-9 && [...Array(k - 1)].every((_, i) => Math.abs(bnPluck(1 / k, 1, i + 1)) > 1e-3) && valIs(p, k * f1) === true) || `答え ${p.a} がちがう` };
        }
        const h = r.pick([2, 3, 4, 5, 6, 7]), u = r.pick(['mm', 'cm']), txt = 0.811 * h, s = agree(txt, 8 * h / Math.PI ** 2, 1);
        if (!s) return null;
        return { q: `長さ $L$ の弦のまん中を高さ ${U(h, u)} つまんではなす。基本の成分の大きさ $b_1$（${u}。$\\dfrac{8}{\\pi^2}=0.811$、小数第1位まで）`, a: `約 $${s}$`, key: `n|${h}|${u}`, easyCheck: false,
          easy: `$\\dfrac{8\\times${h}}{\\pi^2}=0.811\\times${h}$`, verify: p => valIs(p, +s) };
      },
      // わな：倍音の周波数（係数ではない。9-15）
      trap(r) {
        const L = r.pick([0.5, 0.6, 0.4, 0.8]), c = r.pick([200, 240, 320, 400]), n = r.pick([2, 3, 4]);
        const v = n * c / (2 * L);
        if (!Number.isInteger(v)) return null;
        return dest({ q: `長さ ${U(nf(L), 'm')}、波の速さ ${U(c, 'm/s')} の弦の、${n}番めの倍音の周波数（Hz）`, a: `$${v}$`, key: `t|${L}|${c}|${n}`,
          verify: p => valIs(p, n * c / (2 * L)) }, '9-91', `係数ではなく周波数。$f_n=\\dfrac{nc}{2L}=\\dfrac{${n}\\times${c}}{2\\times${nf(L)}}$`, ['9-15']);
      },
    },
  });

  // ================================================================ 9-92
  // のこぎり波：−π<t<π で kt → c_n = kj(−1)^n/n。0<t<2π で kt → c_n = kj/n、c_0 = kπ
  const sawN = (k, n, full) => cnNum(t => k * t, 2 * Math.PI, n, full ? 0 : -Math.PI);
  const kj = k => (k === 1 ? 'j' : k === -1 ? '-j' : `${k}j`);
  add({
    id: '9-92', part: 2, chap: '9-3⑦ 例題6', stars: 1,
    title: 'のこぎり波の $c_n$ は、$te^{at}$ の部分積分1回',
    mark: '区間の中で1次式（のこぎり波）の $c_n$（場合 J）。',
    futsu: ['$a_n$ と $b_n$ を、$t\\cos nt$ と $t\\sin nt$ の', '2つの部分積分で別々に求めてから、', '$c_n=\\frac{a_n-jb_n}{2}$ にする。'],
    raku: ['$f=t$（$-\\pi<t<\\pi$）、$a=-jn$', '$\\int_{-\\pi}^{\\pi}te^{-jnt}\\,\\dd t=\\frac{2j\\pi(-1)^n}{n}$', '→ $c_n=\\frac{j(-1)^n}{n}$'],
    why: '$e^{at}$ の形なら、部分積分は1回ですむ：$\\int te^{at}\\,\\dd t=\\bigl(\\frac{t}{a}-\\frac{1}{a^2}\\bigr)e^{at}$（9-3⑦）。$a=-jn$ のとき $\\frac{1}{a}=\\frac{j}{n}$、$\\frac{1}{a^2}=-\\frac{1}{n^2}$。はしで $e^{\\mp jn\\pi}=(-1)^n$ を使うと、$-\\pi<t<\\pi$ の $f=t$ は $c_n=\\frac{j(-1)^n}{n}$（例題6）。$f=kt$ なら $k$ 倍。',
    caution: '$\\frac{1}{-jn}=\\frac{j}{n}$（$\\frac{1}{j}=-j$）。区間が $0<t<2\\pi$ なら $c_n=\\frac{j}{n}$、$c_0=\\pi$ で、$-\\pi<t<\\pi$ とはちがう。$c_0$（平均）は別に出す。$b_n=j(c_n-c_{-n})$ で確かめられる。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '16mm', s3: '22mm', trap: '16mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /c_/.test(q) && /f\(t\)=-?\d*t\$/.test(q); },
    steps: {
      // −π<t<π で kt
      s1(r) {
        const k = r.pick([2, 3, 4, 5, 6]), j = turn(r, '92s1', 2);
        if (j === 0) return { q: `${SYM} $f(t)=${k === -1 ? '-' : k}t$ をくり返す波の $c_n$（$n\\neq0$。$n$ の式で）`, a: `$\\dfrac{${kj(k)}(-1)^n}{n}$`, key: `f|${k}`, easyCheck: false,
          easy: `$\\dfrac{1}{2\\pi}\\displaystyle\\int_{-\\pi}^{\\pi}${k === -1 ? '-' : k}te^{-jnt}\\,\\dd t$、$a=-jn$`, verify: p => fnIs(p, n => sawN(k, n), [1, 2, 3, 4]) };
        const n = r.pick([1, 2, -1, 3, -2]), v = fr(k * (n % 2 ? -1 : 1), n);
        return { q: `${SYM} $f(t)=${k === -1 ? '-' : k}t$ をくり返す波の $c_${cnSub(n)}$`, a: `$${cx(null, [v, 0])}$`, key: `c|${k}|${n}`, easyCheck: false,
          easy: `$c_n=\\dfrac{${kj(k)}(-1)^n}{n}$ に $n=${n}$`, verify: p => cvalIs(p, sawN(k, n), 1e-7) };
      },
      // 0<t<2π で kt
      s2(r) {
        const k = r.pick([1, 2, 3, 4, 6]), j = turn(r, '92s2', 3);
        const Q = `$0<t<2\\pi$ で $f(t)=${k === 1 ? '' : k}t$ をくり返す波の`;
        if (j === 0) return { q: `${Q} $c_n$（$n\\neq0$。$n$ の式で）`, a: `$\\dfrac{${kj(k)}}{n}$`, key: `f|${k}`, easyCheck: false,
          easy: `$\\dfrac{1}{2\\pi}\\Bigl[\\Bigl(\\dfrac{jt}{n}+\\dfrac{1}{n^2}\\Bigr)${k === 1 ? '' : k}e^{-jnt}\\Bigr]_0^{2\\pi}$`, verify: p => fnIs(p, n => sawN(k, n, true), [1, 2, 3, 4]) };
        if (j === 1) return { q: `${Q} $c_0$`, a: `$${pq(fr(k), 1)}$`, key: `c0|${k}`, easyCheck: false, easy: `平均（三角形の面積 $${pq(fr(2 * k), 2)}$ を $2\\pi$ でわる）`, verify: p => valIs(p, sawN(k, 0, true)[0], 1e-7) };
        const n = r.pick([1, 2, 3, -1]);
        return { q: `${Q} $c_${cnSub(n)}$`, a: `$${cx(null, [fr(k, n), 0])}$`, key: `c|${k}|${n}`, easyCheck: false,
          easy: `$c_n=\\dfrac{${kj(k)}}{n}$ に $n=${n}$`, verify: p => cvalIs(p, sawN(k, n, true), 1e-7) };
      },
      // 周期 2L のこぎり波・c_n から b_n
      s3(r) {
        if (turn(r, '92s3', 2) === 0) {
          const L = r.pick([1, 2, 3]), k = r.pick([1, 2, 3, 5]), m = k * L;
          return { q: `$-${L}<t<${L}$ で $f(t)=${k === 1 ? '' : k}t$ をくり返す波（周期 $${2 * L}$、$\\omega_0=${L === 1 ? '\\pi' : `\\dfrac{\\pi}{${L}}`}$）の $c_n$（$n\\neq0$。$n$ の式で）`, a: `$\\dfrac{${kj(m)}(-1)^n}{n\\pi}$`, key: `L|${L}|${k}`, easyCheck: false,
            easy: `$\\theta=\\omega_0t$ と置くと $f=\\dfrac{${m}}{\\pi}\\theta$（$-\\pi<\\theta<\\pi$）。$\\dfrac{${m}}{\\pi}\\times\\dfrac{j(-1)^n}{n}$`,
            verify: p => fnIs(p, n => cnNum(t => k * t, 2 * L, n, -L), [1, 2, 3, 4]) };
        }
        const k = r.pick([2, 3, 4, 6]);
        return { q: `${SYM} $f(t)=${k}t$ をくり返す波の $c_n=\\dfrac{${kj(k)}(-1)^n}{n}$ から、$b_n=j(c_n-c_{-n})$（$n$ の式で）`, a: `$\\dfrac{${2 * k}(-1)^{n+1}}{n}$`, key: `b|${k}`, easyCheck: false,
          easy: `$c_{-n}=-\\dfrac{${kj(k)}(-1)^n}{n}$。$j\\times\\dfrac{${2 * k}j(-1)^n}{n}$`, verify: p => fnIs(p, n => bnNum(t => k * t, 2 * Math.PI, n, -Math.PI), [1, 2, 3, 4]) };
      },
      // わな：区間ごとに一定（1次式でない。部分積分はいらない。9-28）
      trap(r) {
        const A = r.pick([2, 4, 6, 8]), n = r.pick([1, 3]);
        return dest({ q: `${HB(A, 0)} をくり返す波の $c_${n}$`, a: `$${cnOdd(A, n)}$`, key: `t|${A}|${n}`,
          verify: p => cvalIs(p, cnPw(A, 0, n), 1e-9) }, '9-92', `区間の中は1次式でなく一定。部分積分はいらない。$\\dfrac{${A}}{2\\pi}\\cdot\\dfrac{1-(-1)^n}{jn}$`, ['9-28']);
      },
    },
  });
})(globalThis.MONDAI);

/* 問題集 第5巻　第5部 e と sin・cos（わざ 5-61〜5-75、5-95・5-96）　組 e
 * 書き方は v5/README.md（第5巻の手引き）、v4/README.md、v2/README.md。文は教科書 第5巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * e はネイピア数（定数）。e を変数の名前に使わない。三角関数は rad で、π/6 の仲間だけ。電卓は使わない：e^{0.2}・1.01^{12} などの値は問題の文に書く（L-4）。
 * 近似値は、使う値とけたを文に書く：e^{-1}=0.368、e^{-2}=0.135、ln2=0.693、ln10=2.30、π=3.14（L-3）。答えは e・ln・π・√ を残した形が正。
 * 微分の答えは calc（kind 'diff'）、不定積分は calc（'int'。+C がいる）、定積分は calc（'defint'）で確かめる。近似値・ことば・k や ω の値は verify(p) で、別の道すじで計算し直す。
 * わなは、そのわざ自身で解けない問題にして、答えにかならず行き先（わざの番号か「わざなし」）を書く（第36回 N-3。dest）。
 * 同じ見開きで、入れかえただけの問題・逆の問題（s1 の答えを s2 で問う）は key でよける（N-2）。図はない。
 * わなが2種類あるわざは、種類ごとに key を1つにして（'5-61trapA'・'5-61trapB'）、見開きに1種類ずつ出す。
 * 問題の文（q）の大きいかっこは \Bigl( \Bigr) で書く（\left( は、欄の前の「＝」が出なくなる。エンジンの withBox が \le と読むため）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(8));                       // 0.30000000004 → 0.3
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const fv = f => f[0] / f[1];
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const numOf = t => M.evalMath(strip(t), {});
  const close = (x, y, tol) => x != null && y != null && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  // 係数 × 式（係数は数か分数 [n, d]）：cT(3, 'e^{2x}') → 3e^{2x}、cT([-1, 2], '\\cos2t') → -\frac{1}{2}\cos2t
  function cT(f, body) {
    if (!Array.isArray(f)) f = fr(f);
    const [n, d] = f, s = n < 0 ? '-' : '', a = Math.abs(n);
    if (n === 0) return '0';
    if (d === 1) return s + (a === 1 && body ? '' : a) + body;
    return `${s}\\frac{${a}}{${d}}${body}`;
  }
  // 小数の係数 × 式：dT(0.4, '\\cos4t') → 0.4\cos4t
  const dT = (v, body) => (v === 1 ? body : v === -1 ? '-' + body : fmt(v) + body);
  // 分数の係数を分子に入れる：fB([3, 2], 't') → \frac{3t}{2}、fB([1, 4], '\\sin2t') → \frac{\sin2t}{4}
  function fB(f, body) {
    if (!Array.isArray(f)) f = fr(f);
    const [n, d] = f, s = n < 0 ? '-' : '', a = Math.abs(n);
    if (n === 0) return '0';
    const top = (a === 1 ? '' : a) + body;
    return d === 1 ? s + top : `${s}\\frac{${top}}{${d}}`;
  }
  const join = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' + t : t)).join('') || '0';
  // π の分数倍：piT([1, 2]) → \frac{\pi}{2}、piT([3, 1]) → 3\pi
  function piT(f) {
    if (!Array.isArray(f)) f = fr(f);
    const [n, d] = f, s = n < 0 ? '-' : '', a = Math.abs(n);
    if (n === 0) return '0';
    if (d === 1) return s + (a === 1 ? '' : a) + '\\pi';
    return `${s}\\frac{${a === 1 ? '' : a}\\pi}{${d}}`;
  }
  const ex = (a, v) => (a === 1 ? v : a === -1 ? '-' + v : fmt(a) + v);   // 指数の中：2x、-x、0.1t
  const E = (a, v) => `e^{${ex(a, v || 'x')}}`;
  const W = w => (w === 1 ? ' ' : String(w));                               // \sin t・\sin2t
  const lin = (a, b, v) => `${ex(a, v || 'x')}${b > 0 ? '+' : ''}${b}`;     // 2x+1、3x-2
  // 四捨五入（小数第 k 位まで）。与えた値（0.693 など）で丸めた答えと、ほんとうの値で丸めた答えが同じときだけ使う（ちがえば null）
  const rd = (v, k) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-7) / 10 ** k).toFixed(k);
  const apx = (vGiven, vTrue, k) => { const a = rd(vGiven, k); return a === rd(vTrue, k) ? a : null; };
  const exactDec = (v, k) => Math.abs(v * 10 ** k - Math.round(v * 10 ** k)) < 1e-7;
  // 文で与えた値（0.693・0.368 など）で出した答え vG。ほんとうの値 vT を同じけたで丸めた値と同じになる、いちばん細かいけた（小数第 kmax 位〜第1位）で答える。
  // vG がそのけたでちょうどなら note は ''、丸めるなら「、小数第□位まで」。どのけたでも合わなければ null（その数は出さない）
  //   ちょうどのときも、そのけたまで書く（$\ln10=2.30$ なら答えも 2.30。文に書いた値のけたを落とさない。O-4・R2-7）
  function gv(vG, vT, kmax) {
    for (let k = kmax == null ? 3 : kmax; k >= 1; k--) {
      if (rd(vG, k) !== rd(vT, k)) continue;
      return exactDec(vG, k) ? { ans: rd(vG, k), note: '' } : { ans: rd(vG, k), note: `、小数第${k}位まで` };
    }
    return null;
  }
  // 楽な形の終わり：ちょうどなら「式=答え」、丸めるなら「式=与えた値での数≈答え」。
  //   expr は、与えた値（0.693 など）を入れた式。ほんとうの値の式から与えた値に移る所は、呼ぶ側で「\approx」にする
  const gE = (g, expr, vG) => (g.note ? `$${expr}=${fmt(vG)}\\approx${g.ans}$` : `$${expr}=${g.ans}$`);
  const LN2 = 0.693, EM1 = 0.368, EM2 = 0.135;
  const ln2T = '$\\ln2=0.693$', em1T = '$e^{-1}=0.368$';
  const PER = { 2: '半年ごと（1年に2回）', 3: '4か月ごと（1年に3回）', 4: '3か月ごと（1年に4回）', 12: '毎月（1年に12回）' };

  // ---------------------------------------------------------------- 検算の部品
  // 答え（数）が v か
  const valIs = (ans, v, tol) => (close(numOf(ans), v, tol) || `答え ${ans} の値が ${v} でない`);
  // 近似の答え：ほんとうの値 vT を、答えのけたで丸めると答えになるか
  function nearTrue(ans, vT) {
    const t = strip(ans), d = (t.split('.')[1] || '').length;
    return Math.abs(numOf(t) - vT) <= 0.5 * 10 ** -d + 1e-9 || `答え ${t} が、ほんとうの値 ${vT} を丸めた数でない`;
  }
  // 関数 f（t の式の TeX）の2回微分が、k 倍の f になるか（数値で）
  function d2ratio(f, t) {
    const ev = s => M.evalMath(f, { t: s }), h = 1e-3;
    const d2 = (ev(t + h) - 2 * ev(t) + ev(t - h)) / (h * h);
    return d2 / ev(t);
  }

  // ---------------------------------------------------------------- 見わけようの判定の部品
  const DIFF = /\)'|\}'|微分|y'/;                                      // 微分の印
  const TRIG = /\\(sin|cos)/;
  // ∫ の下端・上端（数）。なければ null
  function readArg(s, i) {
    if (s[i] === '{') { let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) break; } } return [s.slice(i + 1, j), j + 1]; }
    if (s[i] === '\\') { const m = /^\\[a-zA-Z]+/.exec(s.slice(i)); return [m[0], i + m[0].length]; }
    return [s[i], i + 1];
  }
  function bounds(q) {
    const i = q.indexOf('\\int_');
    if (i < 0) return null;
    const [lo, j] = readArg(q, i + 5);
    if (q[j] !== '^') return null;
    const [hi] = readArg(q, j + 1);
    const a = M.evalMath(lo, {}), b = M.evalMath(hi, {});
    return a == null || b == null ? null : [a, b];
  }
  // sin・cos の角速度と、2乗かどうか（\sin2t、\cos t、\sin^{2}3t、\sin\frac{t}{2}、\sin100\pi t、\sin(3t+1)）
  function trigs(q) {
    const out = [];
    const re = /\\(sin|cos)(\^\{2\})?\s*(?:\\frac\{t\}\{(\d+)\}|\(([^()]*)\)|((?:\d+(?:\.\d+)?)?(?:\\pi)?)\s*t)/g;
    for (const m of q.matchAll(re)) {
      let w;
      if (m[3]) w = 1 / +m[3];
      else if (m[4] != null) { const f = s => M.evalMath(m[4], { t: s }); w = f(1) - f(0); }
      else w = m[5] ? M.evalMath(m[5], {}) : 1;
      out.push({ fn: m[1], sq: !!m[2], w });
    }
    return out;
  }
  const isMult = (L, P) => { const k = L / P; return k > 0.5 && Math.abs(k - Math.round(k)) < 1e-7; };
  const isMult0 = (L, P) => { const k = L / P; return Math.abs(k - Math.round(k)) < 1e-7; };   // 0 もふくむ
  // 「t と sin・cos のかけ算」（t\sin t、x\cos x）。\int のすぐあとの \sin は数えない
  const TPROD = { test: q => /[xt]\\(sin|cos)/.test(String(q).replace(/\\int(?![a-zA-Z])/g, '∫')) };

  // ---------------------------------------------------------------- わなの行き先（第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(5).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 5 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 5-61
  M.add({
    id: '5-61', part: 5, chap: '5-14①②・例題13', stars: 1,
    title: '利息を $n$ 回に分けたら、1回の利率を $n$ 回かける（100%なら $\\Bigl(1+\\dfrac{1}{n}\\Bigr)^n$ → $e$）',
    mark: '「1年あたり□%」の利率を、半年ごと・3か月ごとに分ける。',
    futsu: ['半年めは50%、次は100%……と、', '1回ごとの利息を1つずつ足す。'],
    raku: ['100%を3か月ごと → 1回分は25%', '1.25倍を4回 → $1.25^{4}\\approx2.44$', 'たえずふえるなら $y_0e^{rt}$'],
    why: '「1年あたり」の利率は時速と同じで、時間が $\\frac{1}{n}$ 年なら利息の割合も $\\frac{1}{n}$。利息にも利息がつく（複利）ので、1回ごとに $\\Bigl(1+\\frac{1}{n}\\Bigr)$ 倍を $n$ 回かける（5-14①②）。$n$ を大きくすると $e=2.718\\cdots$ に近づき、いつも少しずつふえる量は $y_0e^{rt}$ になる。',
    caution: '2回めだけ100%にしない（$1.5\\times2=3$ は×）。毎回、1年の $\\frac{1}{n}$ の利率。利息を預けたお金にたさない（利息に利息がつかない）ときは、かけ算にならない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '22mm', s3: '22mm', trap: '18mm' },
    fits(q) { return /利率|利息|たえずふえる|1年あたり\d+%を/.test(q) && !/2倍|たさない/.test(q); },
    steps: {
      // 1年あたり100%：1回分の利率、1回ごとに何倍、1年後のお金
      s1(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.pick([2, 5, 10, 20]);
          return { q: `1年あたり100%を1年に${n}回に分けると、1回分の利率は □ %`, a: `$${100 / n}$`, easy: `$100\\times\\frac{1}{${n}}=${100 / n}$`, key: `p${n}` };
        }
        if (k === 1) {
          const n = r.pick([2, 5, 10, 20]);
          return { q: `1年あたり100%を1年に${n}回に分けると、お金は1回ごとに □ 倍`, a: `$${fmt(1 + 1 / n)}$`, easy: `1回分 ${100 / n}% → $1+${fmt(1 / n)}=${fmt(1 + 1 / n)}$`, easyCheck: 'last', key: `b${n}` };
        }
        const n = r.pick([2, 3]), P = r.pick([1, 2, 4, 10]);
        let f = fr(1); for (let i = 0; i < n; i++) f = F.mul(f, fr(n + 1, n));
        const v = P * fv(f), ok = exactDec(v, 2), ans = ok ? fmt(v) : rd(v, 2);
        const step = n === 3 ? `$\\left(\\frac{4}{3}\\right)^{3}=\\frac{64}{27}$` : `$${fmt(1 + 1 / n)}^{${n}}=${fmt(fv(f))}$`;
        return {
          q: `1年あたり100%の利率で${P}万円を預け、利息を${PER[n]}に計算してもらう。1年後のお金は${ok ? '' : '約'} □ 万円${ok ? '' : '（小数第2位まで）'}`,
          a: `$${ans}$`, easyCheck: false, key: `m${n}`,   // 2行になる問題は2問まで（左ページに入るように）
          easy: `1回分 $\\frac{1}{${n}}$、${step} 倍 → ${P === 1 ? '' : `$${P}\\times$ で `}$${ans}$`,
          verify: p => { let m = P; for (let i = 0; i < n; i++) m *= 1 + 1 / n; return (ok ? close(numOf(p.a), m) : strip(p.a) === m.toFixed(2)) || `${m} とちがう`; },
        };
      },
      // ふつうの利率：1回分が10%・20%・50%。2年後も
      s2(r) {
        const [n, per] = r.pick([[2, 10], [2, 20], [2, 50], [3, 10], [3, 20], [4, 10], [4, 20]]);
        const y = n === 2 ? r.pick([1, 2]) : 1, P = r.pick([10000, 20000, 50000, 100000]);
        const b = 1 + per / 100, N = n * y, ans = Math.round(P * b ** N);
        return {
          q: `1年あたり${n * per}%の利率で${P}円を預け、利息を${PER[n]}に計算してもらう。${y}年後のお金 □ 円`,
          a: `$${ans}$`, easyCheck: 'last', key: `${n}${per}${y}`,
          easy: `1回分 ${per}%、${N}回 → $${P}\\times${fmt(b)}^{${N}}=${ans}$`,
          verify: p => { let m = P; for (let i = 0; i < N; i++) m = m * (100 + per) / 100; return valIs(p.a, m) ; },
        };
      },
      // たえずふえる y0 e^{rt}（e の値は文で）、毎月（12回。累乗の値は文で）
      s3(r) {
        if (r.chance(0.6)) {
          const [rr, t, rt, val] = r.pick([[0.02, 10, '0.2', 1.2214], [0.03, 10, '0.3', 1.3499], [0.05, 10, '0.5', 1.6487], [0.01, 10, '0.1', 1.1052], [0.04, 10, '0.4', 1.4918], [0.06, 1, '0.06', 1.06184], [0.1, 2, '0.2', 1.2214], [0.1, 5, '0.5', 1.6487], [0.05, 4, '0.2', 1.2214], [0.02, 5, '0.1', 1.1052]]);
          const P = r.pick([100, 10, 1000]), ans = fmt(P * val);
          return {
            q: `${P}万円が、1年あたり $r=${rr}$ でたえずふえる（$y=y_0e^{rt}$）。${t}年後は約 □ 万円（$e^{${rt}}=${val}$）`,
            a: `$${ans}$`, easy: `$${P}e^{${rr}\\times${t}}\\approx${P}\\times${val}=${ans}$`, easyCheck: 'last', key: `c${rr}${t}`,
            verify: p => (close(rr * t, +rt) && Math.abs(Math.exp(+rt) - val) < 1e-4 && valIs(p.a, P * val)) || 'e の値か答えがちがう',
          };
        }
        const [R, b, val] = r.pick([[6, 1.005, 1.06168], [12, 1.01, 1.12683], [24, 1.02, 1.26824]]);
        const P = r.pick([100, 10, 1000]), ans = fmt(P * val);
        return {
          q: `1年あたり${R}%の利率で${P}万円を預け、利息を毎月（1年に12回）計算してもらう。1年後は約 □ 万円（$${b}^{12}=${val}$）`,
          a: `$${ans}$`, easy: `1回分 $${R}\\%\\times\\frac{1}{12}=${R / 12}\\%$ → $${P}\\times${b}^{12}\\approx${P}\\times${val}=${ans}$`, easyCheck: 'last', key: `d${R}${P}`,
          verify: p => (close(b, 1 + R / 1200) && Math.abs(b ** 12 - val) < 1e-5 && valIs(p.a, P * val)) || '累乗の値か答えがちがう',
        };
      },
      // わな：利息を預けたお金にたさない（利息に利息がつかない）、たえずふえるお金が2倍になる時間（5-68）
      trap(r) {
        if (r.chance(0.5)) {
          const n = r.pick([2, 12]), P = r.pick([1, 2, 10]);
          return dest({ key: '5-61trapA', q: `1年あたり100%の利率で${P}万円を預ける。利息は${PER[n]}に受けとって、預けたお金にはたさない。1年で受けとる利息の合計 □ 万円`, a: `$${P}$`,
            verify: p => valIs(p.a, P * (1 / n) * n) }, '5-61', `預けたお金にたさないので、利息に利息はつかない。${P}万円の $\\frac{1}{${n}}$ が${n}回で ${P}万円`);
        }
        const rr = r.pick([0.07, 0.03, 0.05, 0.1, 0.02, 0.04]);
        const ans = apx(LN2 / rr, Math.LN2 / rr, 1);
        if (ans == null) return null;
        return dest({ key: '5-61trapB', q: `1年あたり${fmt(rr * 100)}%の利率で、お金がたえずふえる（$y=y_0e^{${rr}t}$）。2倍になるのは約 □ 年後（${ln2T}、小数第1位まで）`, a: `$${ans}$`,
          verify: p => strip(p.a) === (Math.log(2) / rr).toFixed(1) || 'ちがう' }, '5-61', `何回かに分ける利息ではなく、2倍になる時間。$e^{${rr}t}=2$ から $t=\\frac{0.693}{${rr}}$`, ['5-68']);
      },
    },
  });

  // ================================================================ 5-62
  M.add({
    id: '5-62', part: 5, chap: '5-14④⑤', stars: 1,
    title: '$(e^{ax})\'=ae^{ax}$、$e^{\\text{中身}}$ は中身の微分をかける',
    mark: '$e$ の右肩に $x$ の式（$e^{4x}$、$3e^{-x}$、$e^{x^2}$、$e^{3x+2}$）。',
    futsu: ['$\\dfrac{e^{4(x+h)}-e^{4x}}{h}$ を作って、', '$h$ を小さくしていく。'],
    raku: ['$e^{4x}$ → 中身 $4x$ の微分は $4$ → $4e^{4x}$', '$3e^{-x}$ → $3\\times(-1)e^{-x}=-3e^{-x}$', '$e^{x^{2}}$ → $2xe^{x^{2}}$'],
    why: '$e^x$ は微分しても変わらない（5-14④）。中身があるときは合成関数の微分（5-6）で、外側 $e^u$ の微分 $e^u$ に、中身の微分をかける（5-14⑤）。$e$ の右肩はそのまま残る。',
    caution: '$(e^x)\'=xe^{x-1}$ としない（$x^n$ の微分とはちがう）。底が $e$ でない $2^x$ は $2^x\\ln2$（わざ 5-65）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: '24mm',
    fits(q) { return /e\^\{[^}]*[xt]/.test(q) && (DIFF.test(q) || /\\ddot/.test(q)) && !/\\int|\\ln|\\sin|\\cos|速さ/.test(q); },
    steps: {
      // c e^{ax}
      s1(r) {
        const a = r.pick([2, 3, 4, 5, 6, -1, -2, -3, -4, -5, 1]), c = r.pick([1, 1, 2, 3, 4, 5, -1, -2]);
        if ((a === 1 && c === 1) || (a === 4 && c === 1) || (a === -1 && c === 3)) return null;   // 楽な形の例（e^{4x}・3e^{-x}）は出さない（O-2）
        const f = cT(c, E(a)), ans = cT(c * a, E(a));
        return { q: `$(${f})'$`, a: `$${ans}$`, easy: `中身 $${ex(a, 'x')}$ の微分 $${a}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `a${a}` };   // 右肩の数が同じものは1問だけ（R2-18）
      },
      // e^{ax+b}・e^{kx^2}・e^{x^3}
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick([1, 2, 3, 4, -1, -2]), b = r.pick([1, 2, 3, 5, -1, -2]), c = r.pick([1, 1, 2, 3, -1]);
          const e = `e^{${lin(a, b)}}`, f = cT(c, e), ans = cT(c * a, e);
          return { q: `$(${f})'$`, a: `$${ans}$`, easy: `中身 $${lin(a, b)}$ の微分 $${a}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `l${a},${b}` };
        }
        const n = k === 1 ? 2 : 3, m = r.pick(n === 2 ? [1, -1, 2, -2, 3] : [1, -1]), c = r.pick([1, 1, 2, -1]);
        if (n === 2 && m === 1 && c === 1) return null;   // 楽な形の例 e^{x^2}
        const e = `e^{${ex(m, `x^{${n}}`)}}`, f = cT(c, e), ans = cT(c * m * n, (n === 2 ? 'x' : 'x^{2}') + e);
        return { q: `$(${f})'$`, a: `$${ans}$`, easy: `中身 $${ex(m, `x^{${n}}`)}$ の微分 $${cT(m * n, n === 2 ? 'x' : 'x^{2}')}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `p${n},${m}` };
      },
      // 見かけがちがう：1/e^{ax}、e^{ax}×e^{bx}、(e^{ax})^2、e^{ax}/e^{bx}、たし算、√
      s3(r) {
        const k = r.int(0, 5);
        let f, g, ans, easy;
        if (k === 0) { const a = r.pick([1, 2, 3, 4]); f = `\\frac{1}{${E(a)}}`; g = -a; easy = `$\\frac{1}{${E(a)}}=${E(-a)}$ → `; }
        else if (k === 1) { const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, -1]); if (a + b === 0) return null; f = `${E(a)}\\times ${E(b)}`; g = a + b; easy = `$${E(a)}\\times ${E(b)}=${E(a + b)}$ → `; }
        else if (k === 2) { const a = r.pick([1, 2, 3, -1]); f = `(${E(a)})^{2}`; g = 2 * a; easy = `$(${E(a)})^{2}=${E(2 * a)}$ → `; }
        else if (k === 3) { const a = r.pick([3, 4, 5]), b = r.pick([1, 2]); f = `\\frac{${E(a)}}{${E(b)}}`; g = a - b; easy = `$\\frac{${E(a)}}{${E(b)}}=${E(a - b)}$ → `; }
        else if (k === 4) { const a = 2 * r.pick([1, 2]); f = `\\sqrt{${E(a)}}`; g = a / 2; easy = `$\\sqrt{${E(a)}}=${E(a / 2)}$ → `; }
        else {
          const a = r.pick([2, 3]), b = r.pick([-1, -2]), c1 = r.pick([1, 2]), c2 = r.pick([1, 3]);
          f = join([cT(c1, E(a)), cT(c2, E(b))]); ans = join([cT(c1 * a, E(a)), cT(c2 * b, E(b))]);
          return { q: `$(${f})'$`, a: `$${ans}$`, easy: `1項ずつ → $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `s${a}${b}${c1}${c2}` };
        }
        ans = cT(g, E(g));
        const fq = k === 0 || k === 3 ? `\\Bigl(${f}\\Bigr)` : k === 2 ? `\\{${f}\\}` : `(${f})`;
        return { q: `$${fq}'$`, a: `$${ans}$`, easy: `${easy}$${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `r${k}${f}` };
      },
      // わな：底が e でない（a^x → 5-65）、e^{数}（定数 → 0）
      trap(r) {
        if (r.chance(0.6)) {
          const b = r.pick([2, 3, 5, 10]);
          return dest({ key: '5-62trapA', q: `$(${b}^{x})'$`, a: `$${b}^{x}\\ln${b}$`, calc: { kind: 'diff', f: `${b}^{x}` } }, '5-62', `底が $e$ でない。$${b}^{x}=e^{x\\ln${b}}$ と見る`);
        }
        const n = r.pick([2, 3, 5]);
        return dest({ key: '5-62trapB', q: `$(e^{${n}})'$`, a: '$0$', calc: { kind: 'diff', f: `e^{${n}}` } }, '5-62', `$e^{${n}}$ は $x$ をふくまない定数なので、微分すると0`, ['5-09']);
      },
    },
  });

  // ================================================================ 5-63
  const UNITS = [['g', '時間'], ['mg', '日'], ['g', '年']];
  M.add({
    id: '5-63', part: 5, chap: '5-14③・例題3・11', stars: 1,
    title: '自分に比例：$N=N_0e^{-kt}$ のへる速さは「いまの量×$k$」',
    mark: '$N=1000e^{-0.1t}$ のような量の「へる速さ」「ふえる速さ」。',
    futsu: ['$\\dfrac{\\dd N}{\\dd t}=1000\\times(-0.1)e^{-0.1t}$ を作って、', '$t$ を入れて $e$ の値を計算する。'],
    raku: ['$\\dfrac{\\dd N}{\\dd t}=-0.1N$（いまの量の0.1倍でへる）', '$t=0$ なら $N=1000$ → $1000\\times0.1=100$', 'いまの量がわかれば、$t$ はいらない'],
    why: '$(e^{ax})\'=ae^{ax}$ なので、$N=N_0e^{-kt}$ の微分は $-kN_0e^{-kt}$、つまり $-kN$。へる速さは、いまの量 $N$ の $k$ 倍（5-14③）。$t=0$ では $e^0=1$ なので $N=N_0$。',
    caution: '$N=1000-100t$ のように、まっすぐへる量は、いまの量に比例しない（へる速さは100のまま）。$e^{-t/\\tau}$ なら $k=\\frac{1}{\\tau}$。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },   // 文が2行の問題が多いので、右ページに入る数に
    cols: 1,
    boxw: '18mm',
    fits(q) { return /e\^\{/.test(q) && /速さ|\\dd N/.test(q) && !/1-e\^/.test(q) && !TRIG.test(q); },
    steps: {
      // t=0 のへる速さ
      s1(r) {
        const N0 = r.pick([1000, 500, 800, 200, 2000, 400, 600]), k = r.pick([0.1, 0.2, 0.05, 0.3, 0.02, 0.5]), [u, tu] = r.pick(UNITS);
        if (N0 === 1000 && k === 0.1) return null;   // 楽な形の例（1000 の 0.1 倍）は出さない（O-2）
        const ans = fmt(N0 * k);
        return { q: `ある物質の量が $N=${N0}${E(-k, 't')}$（${u}、$t$ は${tu}）でへっていく。$t=0$ でのへる速さは、1${tu}あたり □ ${u}`, a: `$${ans}$`, easy: `$${N0}\\times${k}=${ans}$`, key: `${N0},${k}` };
      },
      // ふえる量・いまの量からへる速さ・dN/dt=□N
      s2(r) {
        const k = r.int(0, 2), N0 = r.pick([1000, 500, 800, 200, 400]), kk = r.pick([0.1, 0.2, 0.05, 0.3, 0.5]);
        if (N0 === 1000 && kk === 0.1) return null;   // 楽な形の例（O-2）
        if (k === 0) {
          const ans = fmt(N0 * kk);
          return { q: `細菌の数が $N=${N0}${E(kk, 't')}$（$t$ は時間）でふえる。$t=0$ でのふえる速さは、1時間あたり □`, a: `$${ans}$`, easy: `$${N0}\\times${kk}=${ans}$`, key: `${N0},${kk}` };
        }
        if (k === 1) {
          const Mv = N0 * r.pick([0.5, 0.25, 0.2, 0.6, 0.4]), ans = fmt(Mv * kk);
          if (!Number.isInteger(Mv)) return null;
          return { q: `ある物質の量が $N=${N0}${E(-kk, 't')}$（g、$t$ は時間）でへっていく。$N$ が $${Mv}\\,\\mathrm{g}$ になったときのへる速さは、1時間あたり □ g`, a: `$${ans}$`, easy: `いまの量 × $${kk}$：$${Mv}\\times${kk}=${ans}$`, easyCheck: 'last', key: `${N0},${kk}` };
        }
        const sg = r.chance(0.5) ? -1 : 1;
        if (sg < 0 && kk === 0.1) return null;   // 楽な形の例 dN/dt=-0.1N（O-2）
        return {
          q: `$N=${N0}${E(sg * kk, 't')}$ のとき、$\\dfrac{\\dd N}{\\dd t}=□N$`, a: `$${fmt(sg * kk)}$`, key: `${N0},${kk}`, easyCheck: false,
          easy: `$\\dfrac{\\dd N}{\\dd t}=${fmt(N0 * sg * kk)}${E(sg * kk, 't')}=${fmt(sg * kk)}N$`,
          verify: p => { const t = 1.7, h = 1e-5, Nf = s => N0 * Math.exp(sg * kk * s); return close((Nf(t + h) - Nf(t - h)) / (2 * h) / Nf(t), numOf(p.a), 1e-6) || 'ちがう'; },
        };
      },
      // コーヒーの温度差・e^{-t/τ}・細菌の数がいくつになったとき
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const A = r.pick([60, 50, 70, 80]), kk = r.pick([0.05, 0.1, 0.02]), d = r.pick([10, 20, 30, 40]);
          if (d >= A) return null;
          const ans = fmt(kk * d);
          return { q: `コーヒーと部屋の温度差が $\\theta=${A}${E(-kk, 't')}$（℃、$t$ は分）でへっていく。温度差が${d}℃のとき、温度差のへる速さは1分あたり □ ℃`, a: `$${ans}$`, easy: `いまの温度差 × $${kk}$：$${d}\\times${kk}=${ans}$`, easyCheck: 'last', key: 'c' };   // s3 は3つの形が1問ずつ（同じ形をならべない。R2-18）
        }
        if (k === 1) {
          const tau = r.pick([2, 4, 5, 10]), N0 = tau * r.pick([20, 50, 100, 30]);
          return { q: `ある物質の量が $N=${N0}e^{-t/${tau}}$（g、$t$ は時間）でへっていく。$t=0$ でのへる速さは、1時間あたり □ g`, a: `$${N0 / tau}$`, easy: `$k=\\frac{1}{${tau}}$ → $${N0}\\div${tau}=${N0 / tau}$`, easyCheck: 'last', key: 't' };
        }
        const N0 = r.pick([100, 200, 50]), kk = r.pick([0.2, 0.3, 0.5, 0.7]), Mv = N0 * r.pick([5, 10, 20]), ans = fmt(Mv * kk);
        return { q: `細菌の数が $N=${N0}${E(kk, 't')}$（$t$ は時間）でふえる。数が${Mv}になったときのふえる速さは、1時間あたり □`, a: `$${ans}$`, easy: `いまの数 × $${kk}$：$${Mv}\\times${kk}=${ans}$`, easyCheck: 'last', key: 'b' };
      },
      // わな：まっすぐへる（5-10）、底が2（5-65）
      trap(r) {
        if (r.chance(0.5)) {
          const N0 = r.pick([1000, 800, 500]), c = r.pick([20, 40, 50, 100]), t0 = r.pick([2, 3, 5]);
          if (N0 - c * t0 <= 0) return null;   // その時刻に、物質がまだ残っていること
          return dest({ key: '5-63trapA', q: `ある物質の量が $N=${N0}-${c}t$（g、$t$ は時間）でへっていく。$t=${t0}$ でのへる速さは、1時間あたり □ g`, a: `$${c}$`,
            verify: p => valIs(p.a, c) }, '5-63', 'まっすぐへる量で、いまの量に比例しない。へる速さは $t$ の係数のまま', ['5-10']);
        }
        const N0 = r.pick([100, 200, 20, 50, 10]), g = gv(N0 * LN2, N0 * Math.LN2);
        if (!g) return null;
        return dest({ key: '5-63trapB', q: `ある物質の量が $N=${N0}\\times2^{-t}$（g、$t$ は時間）でへっていく。$t=0$ でのへる速さは、1時間あたり約 □ g（${ln2T}${g.note}）`, a: `$${g.ans}$`,
          verify: p => nearTrue(p.a, N0 * Math.log(2)) }, '5-63', `底が2。$2^{-t}=e^{-t\\ln2}$ と見るので、へる速さは $${N0}\\times\\ln2$`);
      },
    },
  });

  // ================================================================ 5-64
  M.add({
    id: '5-64', part: 5, chap: '5-14⑦', stars: 1,
    title: '$\\ln$ は「中身の微分÷中身」（$\\ln(ax)$ は $\\dfrac{1}{x}$）',
    mark: '$\\ln$ の中に $x$ の式（$\\ln(2x+1)$、$\\ln(3x)$、$\\ln(x^2+4)$）。',
    futsu: ['$x=e^y$ に直して、', 'グラフを折り返して傾きを考える。'],
    raku: ['$\\ln(2x+1)$ → $\\dfrac{(2x+1)\'}{2x+1}=\\dfrac{2}{2x+1}$', '$\\ln(3x)$ → $\\dfrac{3}{3x}=\\dfrac{1}{x}$', '$\\ln(x^{2}+4)$ → $\\dfrac{2x}{x^{2}+4}$'],
    why: '$(\\ln u)\'=\\frac{1}{u}$（5-14⑦）に、合成関数の微分（5-6）で中身の微分をかけると $\\frac{u\'}{u}$。$\\ln(3x)=\\ln3+\\ln x$ で、$\\ln3$ は定数なので、微分すると $\\frac{1}{x}$ だけが残る。',
    caution: '$\\ln(a+b)=\\ln a+\\ln b$ としない（和になるのはかけ算のとき）。$(\\ln x)^2$ は $\\ln$ の2乗なので、2乗の微分（わざ 5-21）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: '22mm', boxh: '11mm',
    fits(q) { return /\\ln/.test(q) && DIFF.test(q) && !/\\int|\(\\ln[^()]*\)\^|[a-z]\\ln/.test(q); },
    steps: {
      // ln(ax+b)・ln(ax)
      s1(r) {
        if (r.chance(0.25)) {   // 答えがどれも 1/x になるので、1つの見開きに1問だけ（R2-18）。ln(3x) は楽な形の例なので出さない（O-2）
          const a = r.pick([2, 4, 5]);
          return { q: `$\\{\\ln(${a}x)\\}'$`, a: '$\\frac{1}{x}$', easy: `$\\frac{${a}}{${a}x}=\\frac{1}{x}$`, calc: { kind: 'diff', f: `\\ln(${a}x)` }, key: 'ax' };
        }
        const a = r.pick([1, 2, 3, 4, 5]), b = r.pick([1, 2, 3, 5, -1, -2, -3]);
        if (F.gcd(a, Math.abs(b)) !== 1 || (a === 2 && b === 1)) return null;   // ln(2x+1) は楽な形の例（O-2）
        const u = lin(a, b), ans = `\\frac{${a}}{${u}}`, x0 = Math.max(0, -b / a);
        return { q: `$\\{\\ln(${u})\\}'$`, a: `$${ans}$`, easy: `中身の微分 $${a}$ ÷ 中身 → $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln(${u})`, pts: [x0 + 0.37, x0 + 0.83, x0 + 1.29] }, key: `${a},${b}` };
      },
      // ln(x^2+c)・k ln(ax+b)・ln(x^3+c)
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const c = r.intNot(1, 9, x => x === 4), u = `x^{2}+${c}`, ans = `\\frac{2x}{${u}}`;   // ln(x^2+4) は楽な形の例（O-2）
          return { q: `$\\{\\ln(${u})\\}'$`, a: `$${ans}$`, easy: `中身の微分 $2x$ ÷ 中身 → $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln(${u})` }, key: `q${c}` };
        }
        if (k === 1) {
          const m = r.pick([2, 3, 4]), a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, -1]);
          if (F.gcd(a, Math.abs(b)) !== 1 || (a === 2 && b === 1)) return null;
          const u = lin(a, b), ans = `\\frac{${m * a}}{${u}}`, x0 = Math.max(0, -b / a);
          return { q: `$\\{${m}\\ln(${u})\\}'$`, a: `$${ans}$`, easy: `$${m}\\times\\frac{${a}}{${u}}=${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f: `${m}\\ln(${u})`, pts: [x0 + 0.37, x0 + 0.83, x0 + 1.29] }, key: `${a},${b}` };   // 中身が s1 と同じものは出さない
        }
        const c = r.int(1, 5), u = `x^{3}+${c}`, ans = `\\frac{3x^{2}}{${u}}`;
        return { q: `$\\{\\ln(${u})\\}'$`, a: `$${ans}$`, easy: `中身の微分 $3x^{2}$ ÷ 中身 → $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln(${u})` }, key: `c${c}` };
      },
      // 見かけがちがう：ln x^n、ln√x、ln e^{kx}、ln(1/x)、ln(2x+1)^3
      s3(r) {
        const k = r.int(0, 4);
        if (k === 0) { const n = r.int(2, 5); return { q: `$(\\ln x^{${n}})'$`, a: `$\\frac{${n}}{x}$`, easy: `$\\ln x^{${n}}=${n}\\ln x$ → $\\frac{${n}}{x}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln x^{${n}}` }, key: 'n' }; }
        if (k === 1) return { q: '$(\\ln\\sqrt{x})\'$', a: '$\\frac{1}{2x}$', easy: '$\\ln\\sqrt{x}=\\frac{1}{2}\\ln x$ → $\\frac{1}{2x}$', easyCheck: 'last', calc: { kind: 'diff', f: '\\ln\\sqrt{x}' }, key: 'sq' };
        if (k === 2) { const m = r.pick([2, 3, 4, 5, -2, -3]); return { q: `$(\\ln ${E(m)})'$`, a: `$${m}$`, easy: `$\\ln ${E(m)}=${ex(m, 'x')}$ → $${m}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln ${E(m)}` }, key: `e${m}` }; }
        if (k === 3) { const n = r.pick([1, 2, 3]); const xn = n === 1 ? 'x' : `x^{${n}}`; return { q: `$\\Bigl(\\ln\\frac{1}{${xn}}\\Bigr)'$`, a: `$-\\frac{${n}}{x}$`, easy: `$\\ln\\frac{1}{${xn}}=-${n === 1 ? '' : n}\\ln x$ → $-\\frac{${n}}{x}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln\\frac{1}{${xn}}` }, key: `i${n}` }; }
        const a = r.pick([2, 3]), b = r.pick([1, -1]), n = r.pick([2, 3]), u = lin(a, b), x0 = Math.max(0, -b / a);
        if (a === 2 && b === 1) return null;   // 2x+1 は楽な形の例（O-2）
        // ln の中身が (2x-1)^3。$\ln\{(2x-1)^{3}\}$ と書く（(\ln(2x-1))^3 と読まれないように。R2-19）。key は s1 と同じ形（同じ中身の ln を2回出さない。O-2）
        return { q: `$\\Bigl(\\ln\\{(${u})^{${n}}\\}\\Bigr)'$`, a: `$\\frac{${n * a}}{${u}}$`, easy: `$\\ln\\{(${u})^{${n}}\\}=${n}\\ln(${u})$ → $\\frac{${n * a}}{${u}}$`, easyCheck: 'last', calc: { kind: 'diff', f: `\\ln((${u})^{${n}})`, pts: [x0 + 0.37, x0 + 0.83, x0 + 1.29] }, key: `${a},${b}` };
      },
      // わな：(ln x)^2（5-21）、x ln x（5-19）
      trap(r) {
        if (r.chance(0.5)) {
          const n = r.pick([2, 3]);
          return dest({ key: '5-64trapA', q: `$\\{(\\ln x)^{${n}}\\}'$`, a: `$\\frac{${n === 2 ? 2 : 3}${n === 2 ? '\\ln x' : '(\\ln x)^{2}'}}{x}$`, calc: { kind: 'diff', f: `(\\ln x)^{${n}}`, pts: [1.37, 1.83, 2.29] } },
            '5-64', `$\\ln$ の${n}乗。中身が $\\ln x$ の${n}乗の微分で、$${n}${n === 2 ? '\\ln x' : '(\\ln x)^{2}'}\\times\\frac{1}{x}$`, ['5-21']);
        }
        return dest({ key: '5-64trapB', q: '$(x\\ln x)\'$', a: '$\\ln x+1$', calc: { kind: 'diff', f: 'x\\ln x' } }, '5-64', '$x$ と $\\ln x$ のかけ算。積の微分で $1\\times\\ln x+x\\times\\frac{1}{x}$', ['5-19']);
      },
    },
  });

  // ================================================================ 5-65
  M.add({
    id: '5-65', part: 5, chap: '5-14⑥', stars: 1,
    title: '$a^x$ は $e^{x\\ln a}$ と見て、$(a^x)\'=a^x\\ln a$',
    mark: '底が2・3・10 などの指数関数（$2^x$、$3^x$、$10^x$）の微分・傾き。',
    futsu: ['$\\dfrac{2^{x+h}-2^x}{h}=2^x\\times\\dfrac{2^h-1}{h}$ を作って、', '$h=0.0001$ などで計算する。'],
    raku: ['$2^{x}=e^{x\\ln2}$ と見る', '$(2^{x})\'=2^{x}\\ln2\\approx0.693\\times2^{x}$', '$x=0$ の傾きは $\\ln2$'],
    why: '$a=e^{\\ln a}$ なので $a^x=e^{x\\ln a}$（5-14⑥）。$(e^{kx})\'=ke^{kx}$ の $k$ が $\\ln a$ なので、$(a^x)\'=a^x\\ln a$。教科書の表の $k_2=0.693$、$k_3=1.099$ は $\\ln2$、$\\ln3$ だった。',
    caution: '$(2^x)\'=x\\cdot2^{x-1}$ としない（$x^n$ の微分とはちがう）。$x^2$ のように底が $x$ なら $(x^n)\'=nx^{n-1}$（わざ 5-09）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '20mm', s3: '30mm', trap: '20mm' },
    fits(q) { return /(\d|\))\^\{[^}]*[xt][^}]*\}/.test(q) && (DIFF.test(q) || /傾き|速さ/.test(q)) && !/\\int/.test(q); },
    steps: {
      // a^x・c a^x
      s1(r) {
        const b = r.pick([2, 3, 5, 7, 10, 4]), c = r.pick([1, 1, 2, 3, 5]);
        if (b === 2 && c === 1) return null;   // 楽な形の例 (2^x)'（O-2）
        const f = c === 1 ? `${b}^{x}` : `${c}\\cdot${b}^{x}`, ans = `${f}\\ln${b}`;
        return { q: `$(${f})'$`, a: `$${ans}$`, easy: `$${b}^{x}=e^{x\\ln${b}}$ → $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `${b},${c}` };
      },
      // 傾き（x=0、x=n）、近似値
      s2(r) {
        // 2^x は、約の値を出す問題（1つの見開きに1問）だけにする。x=0 の傾き ln2 は楽な形の例（O-2）。同じ式がならばないように（R2-18）
        const k = r.int(0, 2), b = r.pick([3, 5, 10]);
        if (k === 0) return { q: `$y=${b}^{x}$ の、$x=0$ での接線の傾き`, a: `$\\ln${b}$`, easy: `$${b}^{0}\\ln${b}=\\ln${b}$`, key: `${b},0` };
        const n = r.pick([1, 2, 3]);
        if (k === 1) return { q: `$y=${b}^{x}$ の、$x=${n}$ での接線の傾き`, a: `$${b ** n}\\ln${b}$`, easy: `$${b}^{${n}}\\ln${b}=${b ** n}\\ln${b}$`, key: `${b},${n}` };
        const m = r.int(1, 4), g = gv(2 ** m * LN2, 2 ** m * Math.LN2);
        if (!g) return null;
        return {
          q: `$y=2^{x}$ の、$x=${m}$ での接線の傾きは約 □（${ln2T}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: 'a2',
          easy: gE(g, `2^{${m}}\\ln2\\approx${2 ** m}\\times0.693`, 2 ** m * LN2), verify: p => nearTrue(p.a, 2 ** m * Math.log(2)),
        };
      },
      // 見かけがちがう：a^{kx}、(1/a)^x、a^{x+1}、細菌が2倍ずつ
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) { const b = r.pick([2, 3]), m = r.pick([2, 3]); const f = `${b}^{${m}x}`; return { q: `$(${f})'$`, a: `$${m}\\cdot${f}\\ln${b}$`, easy: `$${f}=e^{${m}x\\ln${b}}$ → $${m}\\cdot${f}\\ln${b}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `k${b}${m}` }; }
        if (k === 1) { const b = r.pick([2, 3, 10]); const f = `\\left(\\frac{1}{${b}}\\right)^{x}`; return { q: `$\\Bigl\\{\\Bigl(\\frac{1}{${b}}\\Bigr)^{x}\\Bigr\\}'$`, a: `$-${f}\\ln${b}$`, easy: `$\\ln\\frac{1}{${b}}=-\\ln${b}$ → $-${f}\\ln${b}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `i${b}` }; }
        if (k === 2) { const b = r.pick([2, 3, 5]), c = r.pick([1, 2, -1]); const f = `${b}^{x${c > 0 ? '+' : ''}${c}}`; return { q: `$(${f})'$`, a: `$${f}\\ln${b}$`, easy: `$${f}=e^{(x${c > 0 ? '+' : ''}${c})\\ln${b}}$ → $${f}\\ln${b}$`, easyCheck: 'last', calc: { kind: 'diff', f }, key: `s${b}${c}` }; }
        const N0 = r.pick([100, 200, 50, 20]), g = gv(N0 * LN2, N0 * Math.LN2);
        if (!g) return null;
        return {
          q: `細菌の数が1時間ごとに2倍になり、$N=${N0}\\cdot2^{t}$（$t$ は時間）でふえる。$t=0$ でのふえる速さは、1時間あたり約 □（${ln2T}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: 'b',   // 細菌の問題は1問だけ（R2-18）
          easy: gE(g, `${N0}\\cdot2^{0}\\ln2\\approx${N0}\\times0.693`, N0 * LN2), verify: p => nearTrue(p.a, N0 * Math.log(2)),
        };
      },
      // わな：底が x（x^n → 5-09）
      trap(r) {
        const n = r.pick([2, 3, 4, 5, 6, 10]);
        return dest({ q: `$(x^{${n}})'$`, a: `$${n}x^{${n - 1 === 1 ? '' : n - 1}}$`.replace('x^{}', 'x'), calc: { kind: 'diff', f: `x^{${n}}` } },
          '5-65', `底が $x$ で、指数が数。$(x^n)'=nx^{n-1}$`, ['5-09']);
      },
    },
  });

  // ================================================================ 5-66
  M.add({
    id: '5-66', part: 5, chap: '5-14⑨', stars: 1,
    title: '$\\displaystyle\\int e^{ax}\\,\\dd x=\\frac{1}{a}e^{ax}+C$（$a$ でわる。$a=-1$ なら $-e^{-x}$）',
    mark: '$e^{ax}$ の積分（不定積分・定積分）。',
    futsu: ['微分の表を見て、', '微分すると $e^{2x}$ になる式を、', '係数を変えながら探す。'],
    raku: ['$\\displaystyle\\int e^{2x}\\,\\dd x=\\frac{1}{2}e^{2x}+C$', '$\\displaystyle\\int_0^1e^{-x}\\,\\dd x=1-e^{-1}$', '$\\displaystyle\\int_0^{\\ln2}e^{x}\\,\\dd x=2-1=1$'],
    why: '$e^{ax}$ を微分すると $a$ 倍になるので、はじめに $\\frac{1}{a}$ をかけておけば、微分したときちょうどもとにもどる（5-14⑨）。定積分は、上端の値から下端の値をひく（5-11）。$e^{\\ln k}=k$。',
    caution: '$\\frac{1}{a}$ をかけわすれない（$\\int e^{2x}\\,\\dd x=2e^{2x}+C$ は×）。$a=-1$ のときは $-e^{-x}$。不定積分には $+C$。$xe^x$ は部分積分（わざ 5-81）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '26mm', s2: '22mm', s3: '24mm', trap: '28mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) {
      if (!/e\^\{/.test(q) || /[xt](\^\{\d\})?e\^|e\^\{[^}]*\^|\\frac\{\d*\}\{[xt]\}/.test(q) || TRIG.test(q)) return false;
      return /\\int/.test(q) || (/までに/.test(q) && /電気の量|へった量/.test(q));
    },
    steps: {
      // 不定積分
      s1(r) {
        const a = r.pick([2, 3, 4, 5, -1, -2, -3]), c = r.pick([1, 1, 2, 3, 4, 6, -1]), v = r.chance(0.3) ? 't' : 'x';
        if (a === 2 && c === 1) return null;   // 楽な形の例 ∫e^{2x}（O-2）
        const f = cT(c, E(a, v)), ans = cT(fr(c, a), E(a, v));
        return { q: `$\\displaystyle\\int ${c < 0 ? `(${f})` : f}\\,\\dd ${v}$`, a: `$${ans}+C$`, easy: `$${a}$ でわって $${ans}+C$`, easyCheck: 'last', calc: { kind: 'int', f, x: v }, key: `${c},${a}` };
      },
      // 定積分：0〜b、0〜ln k、-1〜1
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick([1, -1, 2, -2, 3]), b = r.pick([1, 2]), ab = Math.abs(a * b);
          if (a === -1 && b === 1) return null;   // 楽な形の例 ∫_0^1 e^{-x}（O-2）
          const eT = n => (n === 1 ? 'e' : `e^{${n}}`);
          let ans;
          if (a > 0) ans = a === 1 ? `${eT(ab)}-1` : `\\frac{${eT(ab)}-1}{${a}}`;
          else ans = a === -1 ? `1-e^{-${ab}}` : `\\frac{1-e^{-${ab}}}{${-a}}`;
          const prim = cT(fr(1, a), E(a));
          return { q: `$\\displaystyle\\int_0^{${b}}${E(a)}\\,\\dd x$`, a: `$${ans}$`, easy: `$\\Bigl[\\,${prim}\\,\\Bigr]_0^{${b}}=${ans}$`, easyCheck: 'last', calc: { kind: 'defint', f: E(a), a: 0, b }, key: `${a},${b}` };
        }
        if (k === 1) {
          const a = r.pick([1, 2, 3]), K = r.pick([2, 3, 4, 5]);
          if ((a === 3 && K > 3) || (a === 1 && K === 2)) return null;   // ∫_0^{ln2} e^x は楽な形の例（O-2）
          const val = fr(K ** a - 1, a), prim = cT(fr(1, a), E(a));
          return { q: `$\\displaystyle\\int_0^{\\ln${K}}${E(a)}\\,\\dd x$`, a: `$${F.tex(val)}$`, easy: `$\\Bigl[\\,${prim}\\,\\Bigr]_0^{\\ln${K}}$、$e^{${a === 1 ? '' : a}\\ln${K}}=${K ** a}$ → $${F.tex(val)}$`, easyCheck: 'last', calc: { kind: 'defint', f: E(a), a: 0, b: `\\ln${K}` }, key: `l${a},${K}` };
        }
        return { q: '$\\displaystyle\\int_{-1}^{1}e^{x}\\,\\dd x$', a: '$e-e^{-1}$', easy: '$\\Bigl[\\,e^{x}\\,\\Bigr]_{-1}^{1}=e-e^{-1}$', easyCheck: 'last', calc: { kind: 'defint', f: 'e^{x}', a: -1, b: 1 }, key: 'm1' };
      },
      // 見かけがちがう：電流から電気の量、へる割合からへった量、e^{x/n}
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0 || k === 3) {
          const I0 = r.pick([2, 3, 5, 10]), tau = r.pick([2, 3, 4, 5]), two = k === 3;
          const T = two ? 2 * tau : tau, vG = I0 * tau * (two ? 1 - EM2 : 1 - EM1), vT = I0 * tau * (1 - Math.exp(-T / tau)), g = gv(vG, vT);
          if (!g) return null;
          return {
            q: `コンデンサーから流れる電流が $I=${I0}e^{-t/${tau}}$（A、$t$ は秒）。0秒から${T}秒までに流れる電気の量は約 □ C（$e^{${two ? -2 : -1}}=${two ? EM2 : EM1}$${g.note}）`,
            a: `$${g.ans}$`, easyCheck: false, key: `i${two}`,
            easy: `$\\Bigl[\\,-${I0 * tau}e^{-t/${tau}}\\,\\Bigr]_0^{${T}}=${I0 * tau}(1-e^{${two ? -2 : -1}})$、` + gE(g, `${I0 * tau}\\times${fmt(two ? 1 - EM2 : 1 - EM1)}`, vG),
            verify: p => nearTrue(p.a, vT),
          };
        }
        if (k === 1) {
          const kk = r.pick([0.1, 0.2, 0.5, 0.05]), R0 = r.pick([10, 20, 50, 100]), T = 1 / kk, vG = R0 * T * (1 - EM1), vT = R0 / kk * (1 - Math.exp(-1)), g = gv(vG, vT);
          if (!g) return null;
          return {
            q: `物質が、1時間あたり $${R0}${E(-kk, 't')}$ g の割合でへっていく（$t$ は時間）。0時間から${fmt(T)}時間までにへった量は約 □ g（${em1T}${g.note}）`,
            a: `$${g.ans}$`, easyCheck: false, key: 'r',
            easy: `$\\Bigl[\\,-${fmt(R0 * T)}${E(-kk, 't')}\\,\\Bigr]_0^{${fmt(T)}}=${fmt(R0 * T)}(1-e^{-1})$、` + gE(g, `${fmt(R0 * T)}\\times0.632`, vG),
            verify: p => nearTrue(p.a, vT),
          };
        }
        const n = r.pick([2, 3, 4]), sg = r.pick([1, -1]), v = sg > 0 ? 'x' : 't';
        const f = `e^{${sg < 0 ? '-' : ''}\\frac{${v}}{${n}}}`, ans = `${sg < 0 ? '-' : ''}${n}${f}`;
        return { q: `$\\displaystyle\\int ${f}\\,\\dd ${v}$`, a: `$${ans}+C$`, easy: `$a=${sg < 0 ? '-' : ''}\\frac{1}{${n}}$ でわる → $${ans}+C$`, easyCheck: 'last', calc: { kind: 'int', f, x: v }, key: `f${n}${sg}` };
      },
      // わな：xe^x（5-81）、2xe^{x^2}（5-76）
      trap(r) {
        if (r.chance(0.5)) {
          const s = r.pick([1, -1]);
          return dest({ key: '5-66trapA', q: `$\\displaystyle\\int x${E(s)}\\,\\dd x$`, a: s > 0 ? '$xe^{x}-e^{x}+C$' : '$-xe^{-x}-e^{-x}+C$', calc: { kind: 'int', f: `x${E(s)}` } },
            '5-66', `$x$ と $${E(s)}$ のかけ算。部分積分で、$x$ を微分する側に`, ['5-81']);
        }
        const n = r.pick([2, 3]);
        return dest({ key: '5-66trapB', q: `$\\displaystyle\\int ${n}x${n === 2 ? '' : '^{2}'}e^{x^{${n}}}\\,\\dd x$`, a: `$e^{x^{${n}}}+C$`, calc: { kind: 'int', f: `${n}x${n === 2 ? '' : '^{2}'}e^{x^{${n}}}` } },
          '5-66', `右肩が $x^{${n}}$ で、$ax$ の形ではない。中身 $x^{${n}}$ の微分がかかっているので、中身ごと積分（置換）`, ['5-76']);
      },
    },
  });

  // ================================================================ 5-67
  M.add({
    id: '5-67', part: 5, chap: '5-14⑨・例題12', stars: 1,
    title: '$\\displaystyle\\int_a^b\\frac{1}{x}\\,\\dd x=\\ln b-\\ln a=\\ln\\frac{b}{a}$（わり算1つ）',
    mark: '$\\dfrac{1}{x}$ の定積分。$y=\\dfrac{1}{x}$ の下の面積。',
    futsu: ['$\\ln6-\\ln2$ を、', '電卓で $1.79-0.69$ のように', '1つずつ計算してからひく。'],
    raku: ['$\\displaystyle\\int_2^6\\frac{1}{x}\\,\\dd x=\\ln\\frac{6}{2}=\\ln3$', '$\\displaystyle\\int_1^e\\frac{1}{x}\\,\\dd x=\\ln e=1$', '上端÷下端の $\\ln$ を1つ'],
    why: '$(\\ln x)\'=\\frac{1}{x}$ なので、原始関数は $\\ln x$（5-14⑨）。対数のきまり $\\ln b-\\ln a=\\ln\\frac{b}{a}$（3-12）で、ひき算がわり算1つになる。',
    caution: '$\\displaystyle\\int\\frac{1}{x}\\,\\dd x$ を $\\frac{x^0}{0}$ としない（$n=-1$ は $x^n$ の積分が使えない）。$\\frac{1}{x^2}=x^{-2}$ は $x^n$ の積分（わざ 5-46）。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '20mm', s3: '18mm', trap: '20mm' }, boxh: '11mm',
    fits(q) { return /\\frac\{\d*\}\{[xt]\}/.test(q) && (/\\int/.test(q) || /面積/.test(q)); },
    steps: {
      // b/a が整数
      s1(r) {
        const a = r.int(1, 6), m = r.pick([2, 3, 4, 5]), b = a * m;
        if (a === 2 && m === 3) return null;   // 楽な形の例 ∫_2^6（O-2）
        const easy = a === 1 ? `$\\ln${b}-\\ln1=\\ln${b}$` : `$\\ln${b}-\\ln${a}=\\ln\\frac{${b}}{${a}}=\\ln${m}$`;
        return { q: `$\\displaystyle\\int_{${a}}^{${b}}\\frac{1}{x}\\,\\dd x$`, a: `$\\ln${m}$`, easy, calc: { kind: 'defint', f: '\\frac{1}{x}', a, b }, key: `${a},${b}` };
      },
      // b/a が分数、e のはし、係数、t
      s2(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const a = r.pick([2, 3, 4, 5]), b = a + r.pick([1, 2, 3]);
          if (b % a === 0) return null;
          const f = fr(b, a);
          return { q: `$\\displaystyle\\int_{${a}}^{${b}}\\frac{1}{x}\\,\\dd x$`, a: `$\\ln${F.tex(f)}$`, easy: `$\\ln${b}-\\ln${a}=\\ln${F.tex(f)}$`, calc: { kind: 'defint', f: '\\frac{1}{x}', a, b }, key: `${a},${b}` };
        }
        if (k === 1) {
          const lo = r.pick([0, 1]), n = r.pick([2, 3]);
          const loT = lo ? 'e' : '1', ans = n - lo;
          return { q: `$\\displaystyle\\int_{${loT}}^{e^{${n}}}\\frac{1}{x}\\,\\dd x$`, a: `$${ans}$`, easy: `$\\ln e^{${n}}-\\ln ${loT}=${n}-${lo}=${ans}$`, calc: { kind: 'defint', f: '\\frac{1}{x}', a: loT, b: `e^{${n}}` }, key: `e${lo},${n}` };
        }
        if (k === 2) {
          const c = r.pick([2, 3, 5]), a = r.pick([1, 2, 3]), m = r.pick([2, 3, 4]), b = a * m;
          return { q: `$\\displaystyle\\int_{${a}}^{${b}}\\frac{${c}}{x}\\,\\dd x$`, a: `$${c}\\ln${m}$`, easy: `$${c}\\times\\ln\\frac{${b}}{${a}}=${c}\\ln${m}$`, easyCheck: 'last', calc: { kind: 'defint', f: `\\frac{${c}}{x}`, a, b }, key: `c${c},${a},${b}` };
        }
        const a = r.pick([3, 4, 5, 10]), m = r.pick([2, 3, 4]), b = a * m;
        return { q: `$\\displaystyle\\int_{${a}}^{${b}}\\frac{1}{t}\\,\\dd t$`, a: `$\\ln${m}$`, easy: `$\\ln\\frac{${b}}{${a}}=\\ln${m}$`, calc: { kind: 'defint', f: '\\frac{1}{t}', a, b, x: 't' }, key: `${a},${b}` };
      },
      // 面積を近似値で（ln2=0.693、ln10=2.30）
      s3(r) {
        const ten = r.chance(0.3), a = r.pick([1, 2, 3, 5]);
        const m = ten ? 10 : r.pick([2, 4, 8]), n = ten ? 1 : Math.round(Math.log2(m)), b = a * m, g = gv(ten ? 2.30 : n * LN2, Math.log(m));
        if (!g) return null;
        const given = ten ? '$\\ln10=2.30$' : ln2T;
        return {
          q: `曲線 $y=\\frac{1}{x}$ と $x$ 軸、2直線 $x=${a}$、$x=${b}$ で囲まれた部分の面積は約 □（${given}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `${a},${b}`,
          easy: ten || n === 1 ? `$\\ln\\frac{${b}}{${a}}=\\ln${m}\\approx${g.ans}$` : gE(g, `\\ln\\frac{${b}}{${a}}=\\ln${m}=${n}\\ln2\\approx${n}\\times0.693`, n * LN2),
          verify: p => nearTrue(p.a, Math.log(b / a)),
        };
      },
      // わな：1/x^2（5-46）、x/(x^2+1)（5-78）
      trap(r) {
        if (r.chance(0.5)) {
          const b = r.pick([2, 3, 4, 5]);
          return dest({ key: '5-67trapA', q: `$\\displaystyle\\int_1^{${b}}\\frac{1}{x^{2}}\\,\\dd x$`, a: `$\\frac{${b - 1}}{${b}}$`, calc: { kind: 'defint', f: '\\frac{1}{x^{2}}', a: 1, b } },
            '5-67', `$\\frac{1}{x^{2}}=x^{-2}$。$\\ln$ にはならない。$\\Bigl[\\,-\\frac{1}{x}\\,\\Bigr]_1^{${b}}$`, ['5-46']);
        }
        const c = r.pick([1, 2]);
        return dest({ key: '5-67trapB', q: `$\\displaystyle\\int_0^{1}\\frac{${c === 1 ? '' : c}x}{x^{2}+1}\\,\\dd x$`, a: c === 1 ? '$\\frac{1}{2}\\ln2$' : '$\\ln2$', calc: { kind: 'defint', f: `\\frac{${c}x}{x^{2}+1}`, a: 0, b: 1 } },
          '5-67', '分母が $x$ ではない。分子が分母の微分（の数倍）なので、$\\ln(x^{2}+1)$ を使う', ['5-78']);
      },
    },
  });

  // ================================================================ 5-68
  const TU = ['時間', '年', '日', '分'];
  // mult×ln2/k を、ln2=0.693 で（小数第2位か第1位まで。0.693 で出した数が、ほんとうの値を丸めた数と同じになるけたで）
  const halfAns = (k, mult) => gv(mult * LN2 / k, mult * Math.LN2 / k, 2);
  M.add({
    id: '5-68', part: 5, chap: '5-14⑪・例題7・8・11', stars: 1,
    title: '半減期・倍加時間は $\\dfrac{\\ln2}{k}\\approx\\dfrac{0.693}{k}$（時定数 $\\tau$ なら $\\tau\\ln2$）',
    mark: '$e^{-kt}$・$e^{kt}$・$e^{-t/\\tau}$ と、半分になる時間（半減期）・2倍になる時間（倍加時間）。',
    futsu: ['$t$ に1、2、3……を入れて $e^{-0.1t}$ を計算し、', '0.5 に近くなる $t$ を探す。'],
    raku: ['$e^{-0.1T}=\\frac{1}{2}$ → $0.1T=\\ln2$', '$T=\\frac{0.693}{0.1}=6.93$', '$e^{-t/2}$ なら $2\\times0.693\\approx1.4$'],
    why: '半分になる時間 $T$ は $e^{-kT}=\\frac{1}{2}$。両辺の自然対数をとると $-kT=-\\ln2$ なので $T=\\frac{\\ln2}{k}$（5-14⑪）。2倍も同じ。$e^{-t/\\tau}$ は $k=\\frac{1}{\\tau}$ なので $T=\\tau\\ln2$。はじめの量 $N_0$ に関係しない。',
    caution: '時定数 $\\tau$（約37%になる時間）と半減期（50%になる時間）はちがう量。$\\frac{1}{4}$ になるのは半減期の2倍の時間。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return (/e\^\{/.test(q) && /半分|半減期|2倍|倍加|\\frac\{1\}\{[48]\}/.test(q)) || (/たえず/.test(q) && /2倍/.test(q)); },
    steps: {
      // e^{-kt} の半減期
      s1(r) {
        const k = r.pick([0.2, 0.3, 0.05, 0.07, 0.03, 0.15, 0.5, 0.7, 0.02]), u = r.pick(TU), h = halfAns(k, 1);   // 0.1 は楽な形の例（O-2）
        if (!h) return null;
        return {
          q: `$N=N_0${E(-k, 't')}$（$t$ は${u}）の半減期は約 □ ${u}（${ln2T}${h.note}）`, a: `$${h.ans}$`, easyCheck: false, key: `k${k}`,
          easy: gE(h, `\\frac{0.693}{${k}}`, LN2 / k), verify: p => nearTrue(p.a, Math.LN2 / k),
        };
      },
      // 倍加時間、時定数 τ のとき
      s2(r) {
        if (r.chance(0.5)) {
          const k = r.pick([0.2, 0.3, 0.05, 0.07, 0.35, 0.7, 0.21, 0.33, 0.63]), N0 = r.pick([50, 100, 200, 500]), u = r.pick(['時間', '日', '年']), h = halfAns(k, 1);
          if (!h) return null;
          return {
            q: `$N=${N0}${E(k, 't')}$（$t$ は${u}）の倍加時間は約 □ ${u}（${ln2T}${h.note}）`, a: `$${h.ans}$`, easyCheck: false, key: `k${k}`,
            easy: `$e^{${k}T}=2$ → ` + gE(h, `\\frac{0.693}{${k}}`, LN2 / k), verify: p => nearTrue(p.a, Math.LN2 / k),
          };
        }
        const tau = r.pick([3, 4, 5, 6, 8, 10, 20]), ans = apx(tau * LN2, tau * Math.LN2, 1);   // τ=2 は楽な形の例（O-2）
        if (ans == null) return null;
        return {
          q: `電気の量 $Q=Q_0e^{-t/${tau}}$（$t$ は秒）が半分になるまでの時間は約 □ 秒（${ln2T}、小数第1位まで）`, a: `$${ans}$`, easyCheck: false, key: `t${tau % 2}`,   // 2行になる時定数の問題は2問まで（右ページに入るように）
          easy: `時定数${tau}秒 → $${tau}\\times0.693=${fmt(tau * LN2)}\\approx${ans}$`, verify: p => strip(p.a) === (tau * Math.LN2).toFixed(1) || 'ちがう',
        };
      },
      // 見かけがちがう：半減期から k、4分の1・8分の1、人口が2倍
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [T, kk] = r.pick([[13.86, 0.05], [2.31, 0.3], [9.9, 0.07], [1.386, 0.5], [34.65, 0.02], [23.1, 0.03], [69.3, 0.01]]);
          return { q: `$N=N_0e^{-kt}$（$t$ は年）でへる物質の半減期が約${T}年のとき、$k=□$（${ln2T}）`, a: `$${kk}$`, easy: `$\\frac{0.693}{${T}}=${kk}$`, key: `k${kk}`,
            verify: p => close(LN2 / T, numOf(p.a)) || 'ちがう' };
        }
        if (k === 1) {
          const kk = r.pick([0.2, 0.3, 0.05, 0.07]), m = r.pick([2, 3]), u = r.pick(TU), h = halfAns(kk, m);
          if (!h) return null;
          return {
            q: `$N=N_0${E(-kk, 't')}$（$t$ は${u}）でへる物質が、はじめの $\\frac{1}{${2 ** m}}$ になるまでの時間は約 □ ${u}（${ln2T}${h.note}）`, a: `$${h.ans}$`, easyCheck: false, key: 'q',   // 1/4・1/8 は1問だけ
            easy: `半減期の${m}倍：` + gE(h, `${m}\\times\\frac{0.693}{${kk}}`, m * LN2 / kk), verify: p => nearTrue(p.a, m * Math.LN2 / kk),
          };
        }
        const pc = r.pick([1, 2, 3, 5, 7]), rr = pc / 100, ans = apx(LN2 / rr, Math.LN2 / rr, 1);
        if (ans == null) return null;
        return {
          q: `ある町の人口が、1年あたり${pc}%でたえずふえる（$y=y_0e^{${rr}t}$）。人口が2倍になるのは約 □ 年後（${ln2T}、小数第1位まで）`, a: `$${ans}$`, easyCheck: false, key: `p${pc}`,
          easy: `$\\frac{0.693}{${rr}}=${fmt(LN2 / rr)}\\approx${ans}$`, verify: p => strip(p.a) === (Math.LN2 / rr).toFixed(1) || 'ちがう',
        };
      },
      // わな：e^{-1}（約37%）になる時間（時定数）、まっすぐへる量が半分
      trap(r) {
        if (r.chance(0.5)) {
          const k = r.pick([0.1, 0.2, 0.5, 0.05, 0.25]);
          return dest({ key: '5-68trapA', q: `$N=N_0${E(-k, 't')}$（$t$ は時間）が、はじめの $e^{-1}$ 倍（約37%）になるまでの時間 □ 時間`, a: `$${fmt(1 / k)}$`,
            verify: p => close(Math.exp(-k * numOf(p.a)), Math.exp(-1)) || 'ちがう' }, '5-68', `半分ではない。指数が $-1$ になる時間で、$${k}t=1$ から（時定数）`);
        }
        const c = r.pick([10, 20, 25, 40, 50]), N0 = c * r.pick([10, 20, 40]);
        return dest({ key: '5-68trapB', q: `ある物質の量が $N=${N0}-${c}t$（g、$t$ は時間）でへっていく。はじめの半分になるのは □ 時間後`, a: `$${N0 / 2 / c}$`,
          verify: p => close(N0 - c * numOf(p.a), N0 / 2) || 'ちがう' }, '5-68', `まっすぐへる量で、$e$ の式ではない。$${N0}-${c}t=${N0 / 2}$ を解く`);
      },
    },
  });

  // ================================================================ 5-69
  M.add({
    id: '5-69', part: 5, chap: '5-14・例題10', stars: 1,
    title: '$1-e^{-t/\\tau}$ でふえる量：$t=\\tau$ で最後の値の約63%、はじめのふえる速さは「最後の値÷$\\tau$」',
    mark: '$V=10(1-e^{-t/2})$ のように、最後の値に近づいていく量。',
    futsu: ['$V$ を微分して $5e^{-t/2}$ を作り、', '$t$ を入れて計算する。', '2秒後は $e^{-1}$ を入れて計算する。'],
    raku: ['$t=\\tau=2$ 秒 → $10\\times(1-0.368)=6.32$', '$t=0$ のふえる速さ → $\\frac{10}{2}=5$', '時定数を読んで、最後の値に $0.632$、$\\frac{1}{\\tau}$ をかける'],
    why: '$1-e^{-t/\\tau}$ は「1から、へっていく量をひいた」形。$t=\\tau$ では $e^{-1}=0.368$ がへった分なので、最後の値の $1-0.368=0.632$（約63%）。微分すると $\\frac{V_0}{\\tau}e^{-t/\\tau}$ で、$t=0$ では $\\frac{V_0}{\\tau}$（例題10）。',
    caution: '$V=10e^{-t/2}$（$1-$ がない）はへっていく形で、2秒後は $10\\times0.368$。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },   // 文が2行の問題なので、右ページに入る数に
    cols: 1,
    boxw: '16mm',
    fits(q) { return /1-e\^\{/.test(q) && !/半分|2倍/.test(q); },
    steps: {
      // t=τ の値
      s1(r) {
        // 10 V は楽な形の例（6.32。O-2）
        const V0 = r.pick([12, 5, 20, 6, 9, 15, 25]), tau = r.pick([2, 3, 4, 5, 10]), vG = V0 * (1 - EM1), vT = V0 * (1 - Math.exp(-1)), g = gv(vG, vT);
        if (!g) return null;
        return { q: `コンデンサーの電圧が $V=${V0}(1-e^{-t/${tau}})$（V、$t$ は秒）でふえていく。${tau}秒後の電圧は約 □ V（${em1T}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `V${V0}`,
          easy: gE(g, `${V0}\\times(1-0.368)`, vG), verify: p => nearTrue(p.a, vT) };
      },
      // t=0 のふえる速さ
      s2(r) {
        const tau = r.pick([2, 3, 4, 5, 10]), V0 = tau === 3 ? r.pick([6, 9, 12, 15]) : r.pick([10, 12, 5, 20, 6, 9, 15]);
        if (V0 === 10 && tau === 2) return null;   // 楽な形の例（O-2）
        const ans = fmt(V0 / tau);
        return { q: `コンデンサーの電圧が $V=${V0}(1-e^{-t/${tau}})$（V、$t$ は秒）でふえていく。$t=0$ での電圧のふえる速さは、毎秒 □ V`, a: `$${ans}$`, easy: `$\\frac{${V0}}{${tau}}=${ans}$`, key: `${V0},${tau}` };
      },
      // 見かけがちがう：2τ、温度、t=τ でのふえる速さ、何%
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const V0 = r.pick([10, 20, 5, 12]), tau = r.pick([2, 3, 5]), vG = V0 * (1 - EM2), vT = V0 * (1 - Math.exp(-2)), g = gv(vG, vT);
          if (!g || (V0 === 10 && tau === 2)) return null;   // 楽な形の例の式（O-2）
          return { q: `コンデンサーの電圧が $V=${V0}(1-e^{-t/${tau}})$（V、$t$ は秒）でふえていく。${2 * tau}秒後の電圧は約 □ V（$e^{-2}=0.135$${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `w${V0},${tau}`,
            easy: gE(g, `${V0}\\times(1-0.135)`, vG), verify: p => nearTrue(p.a, vT) };
        }
        if (k === 1) {
          const A = r.pick([50, 60, 70, 80]), tau = r.pick([5, 10, 20]), vG = 20 + A * (1 - EM1), vT = 20 + A * (1 - Math.exp(-1)), g = gv(vG, vT);
          if (!g) return null;
          return { q: `電気ポットの水の温度が $T=20+${A}(1-e^{-t/${tau}})$（℃、$t$ は分）で上がっていく。${tau}分後の温度は約 □ ℃（${em1T}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `T${A},${tau}`,
            easy: gE(g, `20+${A}\\times0.632`, vG), verify: p => nearTrue(p.a, vT) };
        }
        if (k === 2) {
          const tau = r.pick([2, 4, 5, 10]), V0 = r.pick([10, 20, 40]), vG = V0 / tau * EM1, vT = V0 / tau * Math.exp(-1), g = gv(vG, vT);
          if (!g || (V0 === 10 && tau === 2)) return null;   // 楽な形の例の式（O-2）
          return { q: `コンデンサーの電圧が $V=${V0}(1-e^{-t/${tau}})$（V、$t$ は秒）でふえていく。$t=${tau}$ での電圧のふえる速さは、毎秒約 □ V（${em1T}${g.note}）`, a: `$${g.ans}$`, easyCheck: false, key: `r${V0},${tau}`,
            easy: `はじめの $\\frac{${V0}}{${tau}}$ の $e^{-1}$ 倍：` + gE(g, `${fmt(V0 / tau)}\\times0.368`, vG), verify: p => nearTrue(p.a, vT) };
        }
        return { q: `$V=V_0(1-e^{-t/\\tau})$ でふえる電圧は、$t=\\tau$ のとき、最後の値 $V_0$ の約 □ %（${em1T}）`, a: '$63.2$', easy: '$(1-0.368)\\times100=63.2$', key: 'pc',
          verify: p => nearTrue(p.a, 100 * (1 - Math.exp(-1))) };
      },
      // わな：へっていく e^{-t/τ}、最後の値の半分（5-68）
      trap(r) {
        const V0 = r.pick([10, 12, 20, 5]), tau = r.pick([2, 4, 5, 10]);
        if (V0 === 10 && tau === 2) return null;   // 楽な形の例の式（O-2）
        if (r.chance(0.5)) {
          const g = gv(V0 * EM1, V0 * Math.exp(-1));
          if (!g) return null;
          return dest({ key: '5-69trapA', q: `コンデンサーの電圧が $V=${V0}e^{-t/${tau}}$（V、$t$ は秒）でへっていく。${tau}秒後の電圧は約 □ V（${em1T}${g.note}）`, a: `$${g.ans}$`,
            verify: p => nearTrue(p.a, V0 * Math.exp(-1)) }, '5-69', `$1-$ のない、へっていく形。$${V0}\\times e^{-1}\\approx${V0}\\times0.368$`);
        }
        const ans = apx(tau * LN2, tau * Math.LN2, 1);
        if (ans == null) return null;
        return dest({ key: '5-69trapB', q: `コンデンサーの電圧が $V=${V0}(1-e^{-t/${tau}})$（V、$t$ は秒）でふえていく。最後の値の半分（$${fmt(V0 / 2)}\\,\\mathrm{V}$）になるのは約 □ 秒後（${ln2T}、小数第1位まで）`, a: `$${ans}$`,
          verify: p => strip(p.a) === (tau * Math.LN2).toFixed(1) || 'ちがう' }, '5-69', `$e^{-t/${tau}}=\\frac{1}{2}$ になる時間。$${tau}\\ln2$`);
      },
    },
  });

  // ================================================================ 5-70
  const trigT = (A, fn, w) => cT(A, `\\${fn}${W(w)}t`);
  M.add({
    id: '5-70', part: 5, chap: '5-15④⑤', stars: 1,
    title: '$(\\sin\\omega t)\'=\\omega\\cos\\omega t$、$(\\cos\\omega t)\'=-\\omega\\sin\\omega t$（中身があれば中身の微分）',
    mark: '$\\sin$・$\\cos$ の中に $\\omega t$・$3t+1$・$t^2$。',
    futsu: ['$\\dfrac{\\sin2(t+h)-\\sin2t}{h}$ を、', '$h=0.001$ などで計算して、', '形を予想する。'],
    raku: ['$3\\sin2t$ → $3\\times2\\cos2t=6\\cos2t$', '$-\\cos5t$ → $-(-5\\sin5t)=5\\sin5t$', '$\\sin(3t+1)$ → $3\\cos(3t+1)$'],
    why: '$(\\sin t)\'=\\cos t$、$(\\cos t)\'=-\\sin t$（5-15③）。中身 $\\omega t$ は合成関数の微分（5-6）で、中身の微分 $\\omega$ が前に出る（5-15⑤）。前の数（定数倍）はそのまま残る。',
    caution: '$\\cos$ の微分の $-$ をわすれない。$\\sin^2t$ は $(\\sin t)^2$ で、2乗の微分（わざ 5-21）。$t\\sin t$ は積の微分（わざ 5-19）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '26mm', s3: '30mm', trap: '26mm' },
    fits(q) { return TRIG.test(q) && (DIFF.test(q) || (/速度/.test(q) && !/距離|進んだ/.test(q))) && !/\\int|最大|\\ddot|\\(sin|cos)\^|t\\(sin|cos)/.test(q); },
    steps: {
      // A sin ωt・A cos ωt
      s1(r) {
        const A = r.pick([1, 2, 3, 4, 5, -1, -2, -3]), w = r.pick([1, 2, 3, 4, 5, 6]), fn = r.pick(['sin', 'cos']);
        if ((A === 1 && w === 1) || (A === 3 && w === 2 && fn === 'sin') || (A === -1 && w === 5 && fn === 'cos')) return null;   // 楽な形の例（O-2）
        const f = trigT(A, fn, w), ans = fn === 'sin' ? trigT(A * w, 'cos', w) : trigT(-A * w, 'sin', w);
        return { q: `$(${f})'$`, a: `$${ans}$`, easy: `中身の微分 $${w}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `${A},${fn},${w}` };
      },
      // sin(ωt+b)・sin t^2・sin(t/n)
      s2(r) {
        const k = r.int(0, 2), fn = r.pick(['sin', 'cos']), other = fn === 'sin' ? 'cos' : 'sin', sg = fn === 'sin' ? 1 : -1;
        if (k === 0) {
          const w = r.pick([2, 3, 4, 5]), b = r.pick([1, 2, 3, -1, -2]), A = r.pick([1, 1, 2, -1]);
          if (w === 3 && b === 1 && A === 1 && fn === 'sin') return null;   // 楽な形の例 sin(3t+1)（O-2）
          const u = `(${lin(w, b, 't')})`, f = cT(A, `\\${fn}${u}`), ans = cT(sg * A * w, `\\${other}${u}`);
          return { q: `$\\{${f}\\}'$`, a: `$${ans}$`, easy: `中身 $${lin(w, b, 't')}$ の微分 $${w}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `l${fn}${w}${b}${A}` };
        }
        if (k === 1) {
          const f = `\\${fn} t^{2}`, ans = cT(2 * sg, `t\\${other} t^{2}`);
          return { q: `$(${f})'$`, a: `$${ans}$`, easy: `中身 $t^{2}$ の微分 $2t$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `q${fn}` };
        }
        const n = r.pick([2, 3, 4]), A = r.pick([1, n]), u = `\\frac{t}{${n}}`, f = cT(A, `\\${fn}${u}`), ans = cT(fr(sg * A, n), `\\${other}${u}`);
        return { q: `$\\Bigl(${f}\\Bigr)'$`, a: `$${ans}$`, easy: `中身の微分 $\\frac{1}{${n}}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `f${fn}${n}${A}` };
      },
      // 見かけがちがう：たし算、sin πt、ばねの速度
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const w = r.pick([2, 3, 4]), A = r.pick([1, 2, 3]), B = r.pick([1, 2, 4, -1]);
          const f = join([trigT(A, 'sin', w), trigT(B, 'cos', w)]), ans = join([trigT(A * w, 'cos', w), trigT(-B * w, 'sin', w)]);
          return { q: `$(${f})'$`, a: `$${ans}$`, easy: `1項ずつ → $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `s${w}${A}${B}` };
        }
        if (k === 1) {
          const m = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']), mp = m === 1 ? '\\pi' : `${m}\\pi`;
          const f = `\\${fn}${mp} t`, ans = fn === 'sin' ? `${mp}\\cos${mp} t` : `-${mp}\\sin${mp} t`;
          return { q: `$(${f})'$`, a: `$${ans}$`, easy: `中身の微分 $${mp}$ をかけて $${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `p${m}${fn}` };
        }
        const A = r.pick([0.1, 0.2, 0.05, 0.3, 2]), w = r.pick([2, 3, 4, 5, 10]), fn = r.pick(['sin', 'cos']);
        const f = dT(A, `\\${fn}${w}t`), ans = fn === 'sin' ? dT(A * w, `\\cos${w}t`) : dT(-A * w, `\\sin${w}t`);
        return { q: `ばねのおもりの位置が $x=${f}$（m、$t$ は秒）。速度 $v$（m/s）`, a: `$${ans}$`, easy: `$v=${ans}$`, easyCheck: 'last', calc: { kind: 'diff', f, x: 't' }, key: `v${A}${w}${fn}` };
      },
      // わな：sin^2 t（5-21）、t sin t（5-19）
      trap(r) {
        const fn = r.pick(['sin', 'cos']);
        if (r.chance(0.5)) {
          return dest({ key: '5-70trapA', q: `$(\\${fn}^{2}t)'$`, a: fn === 'sin' ? '$2\\sin t\\cos t$' : '$-2\\sin t\\cos t$', calc: { kind: 'diff', f: `\\${fn}^{2}t`, x: 't' } },
            '5-70', `$\\${fn}^{2}t$ は $(\\${fn} t)^{2}$（$\\${fn}$ の2乗）。2乗の微分で $2\\${fn} t\\times(\\${fn} t)'$`, ['5-21']);
        }
        return dest({ key: '5-70trapB', q: `$(t\\${fn} t)'$`, a: fn === 'sin' ? '$\\sin t+t\\cos t$' : '$\\cos t-t\\sin t$', calc: { kind: 'diff', f: `t\\${fn} t`, x: 't' } },
          '5-70', `$t$ と $\\${fn} t$ のかけ算。積の微分`, ['5-19']);
      },
    },
  });

  // ================================================================ 5-71
  M.add({
    id: '5-71', part: 5, chap: '5-15⑥・例題2・3・6', stars: 1,
    title: '単振動 $x=A\\sin\\omega t$：速さの最大は $A\\omega$（中心で）、加速度の大きさの最大は $A\\omega^2$（はしで）',
    mark: 'ばねのおもり、観覧車の高さ、円運動の $x$ 座標の、速さや加速度の最大値。',
    futsu: ['$v=0.4\\cos4t$、$a=-1.6\\sin4t$ を作り、', '$t$ にいろいろな値を入れて、', 'いちばん大きくなる所を探す。'],
    raku: ['$x=0.1\\sin4t$', '速さの最大 → $0.1\\times4=0.4$', '加速度の最大 → $0.1\\times4^{2}=1.6$'],
    why: '1回微分すると $A\\omega\\cos\\omega t$、2回で $-A\\omega^2\\sin\\omega t$（5-15⑥）。$\\sin$・$\\cos$ の大きさの最大は1なので、前の数がそのまま最大値。$\\cos\\omega t=\\pm1$ のとき $\\sin\\omega t=0$（中心）、$\\sin\\omega t=\\pm1$ のとき はし。',
    caution: '1周の時間（周期）が文にあるときは、$\\omega=\\frac{2\\pi}{\\text{周期}}$ に直してから（秒にそろえる）。周期そのものは $\\frac{2\\pi}{\\omega}$ で、速さの最大ではない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '16mm', s3: '18mm', trap: '14mm' }, boxh: { s3: '11mm', trap: '11mm' },
    fits(q) { return (TRIG.test(q) || /単振動/.test(q)) && /最大/.test(q) && /速さ|加速度/.test(q) && !/\\int/.test(q); },
    steps: {
      // 速さの最大
      s1(r) {
        const A = r.pick([0.1, 0.2, 0.05, 0.3, 0.5, 2, 3]), w = r.pick([2, 3, 4, 5, 10]), fn = r.pick(['sin', 'sin', 'cos']), ans = fmt(A * w);
        if (A === 0.1 && w === 4) return null;   // 楽な形の例 x=0.1sin4t（O-2）
        return { q: `おもりの位置が $x=${dT(A, `\\${fn}${w}t`)}$（m、$t$ は秒）。速さの最大値は □ m/s`, a: `$${ans}$`, easy: `$${A}\\times${w}=${ans}$`, key: `${A},${w}` };
      },
      // 加速度の大きさの最大
      s2(r) {
        const A = r.pick([0.1, 0.2, 0.05, 0.3, 0.5, 2]), w = r.pick([2, 3, 4, 5, 10]), fn = r.pick(['sin', 'cos']), ans = fmt(A * w * w);
        if (A === 0.1 && w === 4) return null;   // 楽な形の例（O-2）
        return { q: `ばねのおもりの位置が $x=${dT(A, `\\${fn}${w}t`)}$（m、$t$ は秒）。加速度の大きさの最大値は □ $\\mathrm{m/s^2}$`, a: `$${ans}$`, easy: `$${A}\\times${w}^{2}=${ans}$`, key: `${A},${w}` };
      },
      // 見かけがちがう：観覧車（周期から ω）、ばね定数と質量
      s3(r) {
        if (r.chance(0.6)) {
          const R = r.pick([30, 40, 50, 60]), T = r.pick([10, 12, 15, 16, 20]), v = fr(R, 30 * T), ans = piT(v);
          return {
            q: `半径 $${R}\\,\\mathrm{m}$、1周${T}分の観覧車の高さは $y=${R}-${R}\\cos\\omega t$（m、$t$ は秒）。上がる速さの最大値は □ m/s（$\\pi$ を残して）`,
            a: `$${ans}$`, easyCheck: 'last', key: `f${R},${T}`,
            easy: `$\\omega=\\frac{2\\pi}{${60 * T}}$ → $${R}\\omega=${ans}$`, verify: p => valIs(p.a, R * 2 * Math.PI / (60 * T)),
          };
        }
        const [m, k] = r.pick([[0.5, 8], [2, 18], [0.2, 5], [1, 4], [0.5, 2], [2, 8], [0.1, 10]]), A = r.pick([0.1, 0.05, 0.2]), w = Math.sqrt(k / m), ans = fmt(A * w);
        if (A === 0.1 && w === 4) return null;   // 楽な形の例と同じ動き（O-2）
        return {
          q: `質量 $${m}\\,\\mathrm{kg}$ のおもりを、ばね定数 $${k}\\,\\mathrm{N/m}$ のばねにつなぎ、振幅 $${A}\\,\\mathrm{m}$ で単振動させる（$\\omega^{2}=\\frac{k}{m}$）。速さの最大値は □ m/s`,
          a: `$${ans}$`, easyCheck: 'last', key: `s${m},${k},${A}`,
          easy: `$\\omega=\\sqrt{\\frac{${k}}{${m}}}=${fmt(w)}$ → $${A}\\times${fmt(w)}=${ans}$`, verify: p => valIs(p.a, A * Math.sqrt(k / m)),
        };
      },
      // わな：周期（2π/ω）
      trap(r) {
        const A = r.pick([0.1, 0.2, 2]), w = r.pick([2, 3, 4, 5, 10]);
        if (A === 0.1 && w === 4) return null;   // 楽な形の例（O-2）
        return dest({ q: `おもりの位置が $x=${dT(A, `\\sin${w}t`)}$（m、$t$ は秒）。ゆれの周期は □ 秒`, a: `$${piT(fr(2, w))}$`, key: `T${w}`,
          verify: p => (close(Math.sin(w * numOf(p.a) + 0.3), Math.sin(0.3)) && numOf(p.a) > 0 && close(numOf(p.a), 2 * Math.PI / w)) || '周期がちがう' },
          '5-71', `速さの最大ではなく周期。$${w}t$ が $2\\pi$ ふえる時間で $\\frac{2\\pi}{${w}}$`);
      },
    },
  });

  // ================================================================ 5-72
  // ∫_0^b の b：ωb が π の p/q 倍
  const bOf = (p, q, w) => piT(fr(p, q * w));
  M.add({
    id: '5-72', part: 5, chap: '5-15⑦', stars: 1,
    title: '$\\displaystyle\\int\\sin\\omega t\\,\\dd t=-\\frac{1}{\\omega}\\cos\\omega t+C$（積分は $\\omega$ でわる）',
    mark: '$\\sin$・$\\cos$ の積分（不定積分・定積分）。',
    futsu: ['微分すると $\\cos3t$ になる式を、', '$\\sin3t$、$3\\sin3t$……と', '1つずつ微分して探す。'],
    raku: ['$\\displaystyle\\int\\cos3t\\,\\dd t=\\frac{1}{3}\\sin3t+C$', '$\\displaystyle\\int_0^{\\pi}\\sin t\\,\\dd t=\\Bigl[\\,-\\cos t\\,\\Bigr]_0^{\\pi}=2$', '微分では $\\omega$ をかけ、積分では $\\omega$ でわる'],
    why: '微分の式を逆に読む（5-11）。$\\cos\\omega t$ を微分すると $-\\omega\\sin\\omega t$ なので、$-\\frac{1}{\\omega}$ をかけておけば、微分してちょうど $\\sin\\omega t$ にもどる（5-15⑦）。',
    caution: '$\\int\\cos3t\\,\\dd t=3\\sin3t+C$ は×（積分では $\\omega$ でわる）。$\\sin$ の積分は $-\\cos$。$\\sin^2t$ は2倍角にしてから（わざ 5-96）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '25mm', s2: '16mm', s3: '30mm', trap: '30mm' }, boxh: '11mm',
    fits(q) {
      if (!TRIG.test(q) || /\\(sin|cos)\^|\)\^\{2\}/.test(q) || TPROD.test(q)) return false;
      return /\\int/.test(q) || /進んだ距離|電気の量/.test(q);
    },
    steps: {
      // 不定積分
      s1(r) {
        const A = r.pick([1, 2, 3, 4, 6, -2]), w = r.pick([1, 2, 3, 4, 5]), fn = r.pick(['sin', 'cos']);
        if (A === 1 && w === 1 && r.chance(0.5)) return null;
        if (A === 1 && w === 3 && fn === 'cos') return null;   // 楽な形の例 ∫cos3t（O-2）
        const f = trigT(A, fn, w), ans = fn === 'sin' ? trigT(fr(-A, w), 'cos', w) : trigT(fr(A, w), 'sin', w);
        const how = w === 1 ? (fn === 'sin' ? '$\\sin$ の積分は $-\\cos$ →' : '$\\cos$ の積分は $\\sin$ →') : `$${w}$ でわって`;
        return { q: `$\\displaystyle\\int ${A < 0 ? `(${f})` : f}\\,\\dd t$`, a: `$${ans}+C$`, easy: `${how} $${ans}+C$`, easyCheck: 'last', calc: { kind: 'int', f, x: 't' }, key: `${A},${fn},${w}` };
      },
      // 定積分（区間の長さが1周期の整数倍でない）
      s2(r) {
        const fn = r.pick(['sin', 'cos']), w = r.pick([1, 2, 3]), A = r.pick([1, 1, 2, 3, 4, 6]);
        const [p, q, base] = fn === 'sin' ? r.pick([[1, 3, fr(1, 2)], [1, 2, fr(1)], [2, 3, fr(3, 2)], [1, 1, fr(2)]]) : r.pick([[1, 6, fr(1, 2)], [1, 2, fr(1)], [5, 6, fr(1, 2)]]);
        if (fn === 'sin' && w === 1 && A === 1 && p === 1 && q === 1) return null;   // 楽な形の例 ∫_0^π sin t（O-2）
        const f = trigT(A, fn, w), b = bOf(p, q, w), val = F.mul(fr(A, w), base);
        const prim = fn === 'sin' ? trigT(fr(-A, w), 'cos', w) : trigT(fr(A, w), 'sin', w);
        return { q: `$\\displaystyle\\int_0^{${b}}${f}\\,\\dd t$`, a: `$${F.tex(val)}$`, easy: `$\\Bigl[\\,${prim}\\,\\Bigr]_0^{${b}}=${F.tex(val)}$`, easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b, x: 't' }, key: `${fn}${w}${A}${p}${q}` };
      },
      // 見かけがちがう：sin(t/n)、たし算、速度から進んだ距離
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const n = r.pick([2, 3, 4]), fn = r.pick(['sin', 'cos']), u = `\\frac{t}{${n}}`;
          const f = `\\${fn}${u}`, ans = fn === 'sin' ? `-${n}\\cos${u}` : `${n}\\sin${u}`;
          return { q: `$\\displaystyle\\int ${f}\\,\\dd t$`, a: `$${ans}+C$`, easy: `$\\omega=\\frac{1}{${n}}$ でわる（${n}倍）→ $${ans}+C$`, easyCheck: 'last', calc: { kind: 'int', f, x: 't' }, key: `n${n}${fn}` };
        }
        if (k === 1) {
          const w = r.pick([2, 3]), A = r.pick([1, 2]), B = r.pick([1, 3]);
          const f = `(${join([trigT(A, 'sin', w), trigT(B, 'cos', w)])})`, ans = join([trigT(fr(-A, w), 'cos', w), trigT(fr(B, w), 'sin', w)]);
          return { q: `$\\displaystyle\\int ${f}\\,\\dd t$`, a: `$${ans}+C$`, easy: `1項ずつ → $${ans}+C$`, easyCheck: 'last', calc: { kind: 'int', f: f.slice(1, -1), x: 't' }, key: `s${w}${A}${B}` };
        }
        const fn = r.pick(['sin', 'cos']), w = r.pick([1, 2, 4]), A = r.pick([2, 4, 6, 8]);
        const [p, q, base] = fn === 'sin' ? r.pick([[1, 2, fr(1)], [1, 1, fr(2)], [1, 3, fr(1, 2)]]) : r.pick([[1, 2, fr(1)], [1, 6, fr(1, 2)]]);
        const b = bOf(p, q, w), val = F.mul(fr(A, w), base), f = trigT(A, fn, w);
        return {
          q: `速度が $v=${f}$（m/s、$t$ は秒）で動く物が、$t=0$ から $t=${b}$ までに進んだ距離は □ m`, a: `$${F.tex(val)}$`, easyCheck: 'last', key: `v${fn}${w}${A}${p}${q}`,
          easy: `$v\\geqq0$ なので $\\displaystyle\\int_0^{${b}}${f}\\,\\dd t=${F.tex(val)}$`, calc: { kind: 'defint', f, a: 0, b, x: 't' },
        };
      },
      // わな：sin^2 t（5-96）、t cos t（5-81）
      trap(r) {
        const fn = r.pick(['sin', 'cos']);
        if (r.chance(0.5)) {
          return dest({ key: '5-72trapA', q: `$\\displaystyle\\int\\${fn}^{2}t\\,\\dd t$`, a: fn === 'sin' ? '$\\frac{t}{2}-\\frac{\\sin2t}{4}+C$' : '$\\frac{t}{2}+\\frac{\\sin2t}{4}+C$', calc: { kind: 'int', f: `\\${fn}^{2}t`, x: 't' } },
            '5-72', `$\\${fn}$ の2乗。2倍角で $\\frac{1${fn === 'sin' ? '-' : '+'}\\cos2t}{2}$ にしてから`);
        }
        return dest({ key: '5-72trapB', q: `$\\displaystyle\\int t\\${fn} t\\,\\dd t$`, a: fn === 'cos' ? '$t\\sin t+\\cos t+C$' : '$-t\\cos t+\\sin t+C$', calc: { kind: 'int', f: `t\\${fn} t`, x: 't' } },
          '5-72', `$t$ と $\\${fn} t$ のかけ算。部分積分で、$t$ を微分する側に`, ['5-81']);
      },
    },
  });

  // ================================================================ 5-73
  M.add({
    id: '5-73', part: 5, chap: '5-15⑦・例題4', stars: 1,
    title: '1周期（の整数倍）の $\\sin$・$\\cos$ の定積分は0',
    mark: '積分の区間の長さが、周期 $\\dfrac{2\\pi}{\\omega}$ の整数倍（どこから始まっても）。',
    futsu: ['原始関数を作り、', '上端と下端の $\\cos$ の値を', '1つずつ出してひく。'],
    raku: ['$\\displaystyle\\int_0^{\\pi}\\sin2t\\,\\dd t$ → 周期は $\\frac{2\\pi}{2}=\\pi$', 'ちょうど1周期 → 0', '定数の項があれば、その項だけが残る'],
    why: '1周期のあいだ、横軸より上の山と下の谷の面積が同じで、打ち消しあう（5-15 例題4）。原始関数 $-\\frac{1}{\\omega}\\cos\\omega t$ も1周期でもとの値にもどるので、上端の値と下端の値の差は0。',
    caution: '半周期（$\\int_0^{\\pi}\\sin t\\,\\dd t=2$）は0にならない。$\\sin^2t$ は負にならないので、1周期でも0にならない（わざ 5-74）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '18mm', s3: '16mm', trap: '16mm' }, boxh: '11mm',
    fits(q) {
      if (!/\\int/.test(q)) return false;
      const b = bounds(q), ts = trigs(q);
      if (!b || !ts.length || ts.some(t => t.sq) || TPROD.test(q) || /\)\^/.test(q)) return false;
      return ts.every(t => isMult((b[1] - b[0]) * t.w, 2 * Math.PI));
    },
    steps: {
      // 0 から 1周期・2周期
      s1(r) {
        const w = r.pick([1, 2, 3, 4]), k = r.pick([1, 1, 2]), fn = r.pick(['sin', 'cos']), A = r.pick([1, 1, 2, 3, 5]);
        if (w === 1 && k === 1 && r.chance(0.5)) return null;
        if (w === 2 && k === 1 && fn === 'sin' && A === 1) return null;   // 楽な形の例 ∫_0^π sin2t（O-2）
        const b = piT(fr(2 * k, w)), f = trigT(A, fn, w);
        // 前の数だけがちがう同じ積分は、1つの見開きに1問（key に前の数を入れない）
        return { q: `$\\displaystyle\\int_0^{${b}}${f}\\,\\dd t$`, a: '$0$', easy: `周期 $${piT(fr(2, w))}$ の${k === 1 ? 'ちょうど1' : k}周期 → $0$`, easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b, x: 't' }, key: `${w},${k},${fn}` };
      },
      // 0 から始まらない、定数の項がある
      s2(r) {
        if (r.chance(0.5)) {
          const w = r.pick([1, 2]), fn = r.pick(['sin', 'cos']), [p, q] = r.pick([[1, 6], [1, 4], [1, 3], [1, 2]]);
          const a = fr(p, q), bb = F.add(a, fr(2, w)), lo = piT(a), hi = piT(bb), f = trigT(1, fn, w);
          return { q: `$\\displaystyle\\int_{${lo}}^{${hi}}${f}\\,\\dd t$`, a: '$0$', easy: `区間の長さが $${piT(fr(2, w))}$（1周期）→ $0$`, easyCheck: 'last', calc: { kind: 'defint', f, a: lo, b: hi, x: 't' }, key: `h${w}${fn}${p}${q}` };
        }
        const w = r.pick([1, 2]), fn = r.pick(['sin', 'cos']), A = r.pick([2, 3, 5]), c = r.pick([1, 2, 3]), L = fr(2, w);
        const f = `${trigT(A, fn, w)}+${c}`, ans = piT(F.mul(L, fr(c)));
        return { q: `$\\displaystyle\\int_0^{${piT(L)}}(${f})\\,\\dd t$`, a: `$${ans}$`, easy: `$\\${fn}$ の項は1周期で0。のこりは $${c}\\times${piT(L)}=${ans}$`, easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b: piT(L), x: 't' }, key: `c${w}${fn}${A}${c}` };
      },
      // 見かけがちがう：交流の電気の量、sin と cos のたし算
      s3(r) {
        if (r.chance(0.6)) {
          const I0 = r.pick([2, 3, 5, 10]), [wT, T, k] = r.pick([['100\\pi', 0.02, 1], ['100\\pi', 0.04, 2], ['120\\pi', fr(1, 60), 1]]);
          const TT = Array.isArray(T) ? F.tex(T) : fmt(T);
          return { q: `交流の電流が $I=${I0}\\sin${wT} t$（A、$t$ は秒）。電気の量 $\\displaystyle\\int_0^{${TT}}I\\,\\dd t$ は □ C`, a: '$0$', easyCheck: 'last', key: `i${I0}${wT}${k}`,
            easy: `周期 $\\frac{2\\pi}{${wT}}$ の${k === 1 ? 'ちょうど1' : k}周期 → $0$`, calc: { kind: 'defint', f: `${I0}\\sin${wT} t`, a: 0, b: TT, x: 't' } };
        }
        const w = r.pick([1, 2, 3]), A = r.pick([1, 2]), B = r.pick([1, 3, -1]), f = join([trigT(A, 'sin', w), trigT(B, 'cos', w)]), b = piT(fr(2, w));
        return { q: `$\\displaystyle\\int_0^{${b}}(${f})\\,\\dd t$`, a: '$0$', easy: 'どちらの項も1周期 → $0$', easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b, x: 't' }, key: `s${w}${A}${B}` };
      },
      // わな：sin^2 の1周期（5-74）、半周期（5-72）
      trap(r) {
        const fn = r.pick(['sin', 'cos']);
        if (r.chance(0.5)) {
          const w = r.pick([1, 2]), b = piT(fr(2, w)), f = `\\${fn}^{2}${W(w)}t`, val = piT(fr(1, w));
          return dest({ key: '5-73trapA', q: `$\\displaystyle\\int_0^{${b}}${f}\\,\\dd t$`, a: `$${val}$`, calc: { kind: 'defint', f, a: 0, b, x: 't' } },
            '5-73', `$\\${fn}^{2}$ は負にならないので、0にならない。平均 $\\frac{1}{2}$ × 区間の長さ $${b}$`);
        }
        const w = r.pick([1, 2, 3]), A = r.pick([1, 2, 3]), b = piT(fr(1, w)), f = trigT(A, 'sin', w), val = F.tex(fr(2 * A, w));
        return dest({ key: '5-73trapB', q: `$\\displaystyle\\int_0^{${b}}${f}\\,\\dd t$`, a: `$${val}$`, calc: { kind: 'defint', f, a: 0, b, x: 't' } },
          '5-73', `区間の長さは周期 $${piT(fr(2, w))}$ の半分（山1つ）で、0にならない`);
      },
    },
  });

  // ================================================================ 5-74
  M.add({
    id: '5-74', part: 5, chap: '5-15⑨・例題7・8', stars: 1,
    title: '$\\sin^2$・$\\cos^2$ の1周期（半周期）の平均は $\\dfrac{1}{2}$：積分は「区間の長さ÷2」（実効値は $\\dfrac{V_0}{\\sqrt2}$）',
    mark: '0から始まる $\\sin^2\\omega t$・$\\cos^2\\omega t$ の定積分で、区間の長さが $\\dfrac{\\pi}{2\\omega}$ の整数倍。交流の実効値・平均の電力。',
    futsu: ['2倍角の式で $\\frac{1-\\cos2t}{2}$ に直し、', '原始関数 $\\frac{t}{2}-\\frac{\\sin2t}{4}$ に', '上端と下端を入れてひく。'],
    raku: ['$\\displaystyle\\int_0^{\\pi}\\sin^{2}t\\,\\dd t$ → 平均 $\\frac{1}{2}$', '区間の長さ $\\pi$ の半分 → $\\frac{\\pi}{2}$', '実効値 $100\\,\\mathrm{V}$ → $V_0=100\\sqrt{2}$'],
    why: '$\\sin^2t=\\frac{1-\\cos2t}{2}$（5-15⑨）。$\\cos2t$ の部分は、区間の長さが $\\pi$ の整数倍なら（0から始まる区間なら $\\frac{\\pi}{2}$ の整数倍でも）積分が0になり、$\\frac{1}{2}$ の部分だけが残る。だから平均は $\\frac{1}{2}$。交流の平均の電力 $\\frac{V_0^2}{2R}$ を直流とくらべたのが実効値 $\\frac{V_0}{\\sqrt2}$。',
    caution: '区間が半端なとき（$\\int_0^{\\frac{\\pi}{4}}\\sin^2t\\,\\dd t$ や、0から始まらない $\\int_{\\frac{\\pi}{4}}^{\\frac{3\\pi}{4}}\\sin^2t\\,\\dd t$）は、2倍角にして計算する（わざ 5-96）。$\\sin t$ の1周期は0（わざ 5-73）。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '20mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) {
      if (/実効値|平均の電力/.test(q)) return true;
      const ts = trigs(q);
      if (/平均の値/.test(q)) return ts.length > 0 && ts.every(t => t.sq);
      if (!/\\int/.test(q)) return false;
      const b = bounds(q);
      if (!b || !ts.length || ts.some(t => !t.sq) || /\^\{2\}\s*\d*t\s*\\(sin|cos)/.test(q)) return false;
      // 長さが半周期 π/ω の整数倍か、0（π/2ω の整数倍）から始まって長さが π/2ω の整数倍
      return ts.every(t => isMult((b[1] - b[0]) * t.w, Math.PI) || (isMult((b[1] - b[0]) * t.w, Math.PI / 2) && isMult0(b[0] * t.w, Math.PI / 2)));
    },
    steps: {
      // 1周期・半周期（区間の長さ π/ω の整数倍）
      s1(r) {
        const w = r.pick([1, 1, 2, 3]), k = r.pick([1, 2]), fn = r.pick(['sin', 'cos']), A = r.pick([1, 1, 2, 4]);
        if (w === 1 && k === 1 && fn === 'sin' && A === 1) return null;   // 楽な形の例 ∫_0^π sin^2 t（O-2）
        const L = fr(k, w), f = cT(A, `\\${fn}^{2}${W(w)}t`), val = piT(F.mul(L, fr(A, 2)));
        // 前の数だけがちがう同じ積分は、1つの見開きに1問（key に前の数を入れない）
        return { q: `$\\displaystyle\\int_0^{${piT(L)}}${f}\\,\\dd t$`, a: `$${val}$`, easy: `平均 $${F.tex(fr(A, 2))}$ × 長さ $${piT(L)}$ → $${val}$`, easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b: piT(L), x: 't' }, key: `${w},${k},${fn}` };
      },
      // 長さが π/(2ω)（4分の1周期）、平均
      s2(r) {
        if (r.chance(0.6)) {
          const w = r.pick([1, 2]), m = r.pick([1, 3]), fn = r.pick(['sin', 'cos']), A = r.pick([1, 2]);
          const L = fr(m, 2 * w), f = cT(A, `\\${fn}^{2}${W(w)}t`), val = piT(F.mul(L, fr(A, 2)));
          return { q: `$\\displaystyle\\int_0^{${piT(L)}}${f}\\,\\dd t$`, a: `$${val}$`, easy: `0から $\\frac{\\pi}{${2 * w}}$${m === 1 ? '' : ` の${m}倍`}まで → 平均 $${F.tex(fr(A, 2))}$ × 長さ $${piT(L)}$ → $${val}$`, easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b: piT(L), x: 't' }, key: `q${w},${m},${fn},${A}` };
        }
        const A = r.pick([2, 4, 6, 10]), w = r.pick([1, 2, 3]), fn = r.pick(['sin', 'cos']), L = fr(2, w);
        return { q: `$y=${A}\\${fn}^{2}${W(w)}t$ の、$t=0$ から $t=${piT(L)}$ までの平均の値`, a: `$${A / 2}$`, easy: `$${A}\\times\\frac{1}{2}=${A / 2}$`, key: `a${A},${w},${fn}`,
          verify: p => { let s = 0; const n = 4000, Lv = 2 * Math.PI / w; for (let i = 0; i < n; i++) { const t = (i + 0.5) * Lv / n; s += A * Math[fn](w * t) ** 2; } return valIs(p.a, s / n, 1e-6); } };
      },
      // 実効値・平均の電力
      s3(r) {
        const k = r.int(0, 3);
        // 楽な形の例（実効値 100 V → 100√2）と同じ数は出さない（O-2）：最大値 200 V、実効値 100 V
        if (k === 0) { const V0 = r.pick([100, 140, 280, 50]); return { q: `電圧の最大値が $${V0}\\,\\mathrm{V}$ の交流の、実効値は □ V（$\\sqrt{2}$ を残して）`, a: `$${V0 / 2}\\sqrt{2}$`, easy: `$\\frac{${V0}}{\\sqrt{2}}=${V0 / 2}\\sqrt{2}$`, key: `v${V0}` }; }
        if (k === 1) { const Ve = r.pick([200, 50, 70]); return { q: `実効値が $${Ve}\\,\\mathrm{V}$ の交流の、電圧の最大値は □ V（$\\sqrt{2}$ を残して）`, a: `$${Ve}\\sqrt{2}$`, easy: `$\\sqrt{2}\\times${Ve}=${Ve}\\sqrt{2}$`, key: `v${2 * Ve}` }; }
        if (k === 2) {
          const [Ve, R] = r.pick([[100, 20], [100, 50], [100, 25], [200, 40], [200, 100], [100, 10]]);
          return { q: `実効値 $${Ve}\\,\\mathrm{V}$ のコンセントに、$${R}\\,\\Omega$ の抵抗をつなぐ。平均の電力は □ W`, a: `$${Ve * Ve / R}$`, easy: `$\\frac{${Ve}^{2}}{${R}}=${Ve * Ve / R}$`, key: `p${Ve},${R}`,
            verify: p => { const V0 = Ve * Math.SQRT2; return valIs(p.a, V0 * V0 / (2 * R)); } };
        }
        const [V0, R] = r.pick([[100, 50], [200, 100], [100, 10], [20, 4], [10, 5]]);
        return { q: `電圧 $V=${V0}\\sin\\omega t$（V）を、$${R}\\,\\Omega$ の抵抗にかける。平均の電力は □ W`, a: `$${V0 * V0 / (2 * R)}$`, easy: `$\\frac{${V0}^{2}}{${R}}\\times\\frac{1}{2}=${V0 * V0 / (2 * R)}$`, key: `d${V0},${R}`,
          verify: p => { let s = 0; const n = 4000; for (let i = 0; i < n; i++) { const th = (i + 0.5) * 2 * Math.PI / n; s += (V0 * Math.sin(th)) ** 2 / R; } return valIs(p.a, s / n, 1e-6); } };
      },
      // わな：区間の長さが π/2 の整数倍でない、長さは π/2 でも0から始まらない（5-96）
      trap(r) {
        const fn = r.pick(['sin', 'cos']);
        if (r.chance(0.3)) {
          const f = `\\${fn}^{2}t`, val = fn === 'sin' ? '\\frac{\\pi}{4}+\\frac{1}{2}' : '\\frac{\\pi}{4}-\\frac{1}{2}';
          return dest({ key: '5-74trapA', q: `$\\displaystyle\\int_{\\frac{\\pi}{4}}^{\\frac{3\\pi}{4}}${f}\\,\\dd t$`, a: `$${val}$`, calc: { kind: 'defint', f, a: '\\frac{\\pi}{4}', b: '\\frac{3\\pi}{4}', x: 't' } },
            '5-74', '区間の長さは $\\frac{\\pi}{2}$ でも、0から始まらないので、平均 $\\frac{1}{2}$ は使えない（$\\cos2t$ の部分が0にならない）。2倍角にして計算する');
        }
        const [p, q] = r.pick([[1, 2], [3, 2], [1, 3], [2, 3], [4, 3], [5, 3]]);
        const { val, f, b } = sqDef(fn, 1, p, q);
        return dest({ key: '5-74trapB', q: `$\\displaystyle\\int_0^{${b}}${f}\\,\\dd t$`, a: `$${val}$`, calc: { kind: 'defint', f, a: 0, b, x: 't' } },
          '5-74', `区間の長さ $${b}$ が $\\frac{\\pi}{2}$ の整数倍でないので、平均 $\\frac{1}{2}$ は使えない。2倍角にして計算する`);
      },
    },
  });
  // ∫_0^b sin^2 ωt（cos^2）で、2ωb が π の p/q 倍：b/2 ∓ sin(2ωb)/(4ω)
  // sin(π p/q) を「分数 × √n」で：[分数, n]
  const SINPI = { '1/6': [fr(1, 2), 1], '1/4': [fr(1, 2), 2], '1/3': [fr(1, 2), 3], '1/2': [fr(1), 1], '2/3': [fr(1, 2), 3], '3/4': [fr(1, 2), 2], '5/6': [fr(1, 2), 1], '4/3': [fr(-1, 2), 3], '3/2': [fr(-1), 1], '5/3': [fr(-1, 2), 3] };
  function sqDef(fn, w, p, q) {
    const th = fr(p, q), bF = F.div(th, fr(2 * w)), b = piT(bF), f = `\\${fn}^{2}${W(w)}t`;
    const [c, n] = SINPI[`${th[0]}/${th[1]}`];
    const k = F.mul(c, fr(fn === 'sin' ? -1 : 1, 4 * w)), a = Math.abs(k[0]);         // ∓sin(2ωb)/(4ω) の、√ の前の分数
    const term = n === 1 ? F.tex([a, k[1]]) : `\\frac{${a === 1 ? '' : a}\\sqrt{${n}}}{${k[1]}}`;
    return { val: `${piT(F.div(bF, fr(2)))}${k[0] < 0 ? '-' : '+'}${term}`, f, b };
  }

  // ================================================================ 5-75
  M.add({
    id: '5-75', part: 5, chap: '5-15⑥・例題5', stars: 1,
    title: '$\\ddot{x}=-\\omega^2x$ をみたすのは $\\sin\\omega t$・$\\cos\\omega t$（$\\omega$ は $\\sqrt{\\phantom{k}}$ をとる）',
    mark: '$x=2\\sin6t$ と $\\ddot{x}=-kx$。$\\ddot{x}=-9x$ の $\\omega$。',
    futsu: ['$x$ を1回微分し、もう1回微分して、', '$x$ の何倍になっているかを調べる。'],
    raku: ['$x=2\\sin6t$ → $\\ddot{x}=-6^{2}x=-36x$、$k=36$', '$\\ddot{x}=-9x$ → $\\omega=\\sqrt{9}=3$', '前の数（振幅）は $k$ に関係しない'],
    why: '$\\sin\\omega t$・$\\cos\\omega t$ を2回微分すると、$\\omega$ が2回かかって $-$ が1つつき、もとの $-\\omega^2$ 倍になる（5-15⑥）。だから $\\ddot{x}=-kx$ なら $\\omega^2=k$、$\\omega=\\sqrt{k}$。たし算 $A\\sin\\omega t+B\\cos\\omega t$ でも同じ。',
    caution: '$\\ddot{x}=-9x$ を $\\sin9t$ としない（$\\omega$ は $\\sqrt{9}=3$）。$e^{at}$ は2回微分で $+a^2$ 倍（符号が＋）で、ゆれない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '16mm', boxh: '11mm',
    fits(q) { return /\\ddot/.test(q) && !/e\^/.test(q); },
    steps: {
      // x から k
      s1(r) {
        // ω=6（k=36）と ω=3（k=9）は楽な形の例なので出さない（O-2）
        const A = r.pick([1, 2, 3, 5, 4, 0.5]), w = r.pick([2, 4, 5, 7, 8, 9, 10]), fn = r.pick(['sin', 'cos']), k = w * w, f = dT(A, `\\${fn}${w}t`);
        return { q: `$x=${f}$ は $\\ddot{x}=-kx$ をみたす。$k$`, a: `$${k}$`, easy: `$\\omega=${w}$ → $k=${w}^{2}=${k}$`, easyCheck: 'last', key: `k${k}`,
          verify: p => close(d2ratio(f, 0.37), -numOf(p.a), 1e-4) || 'k がちがう' };
      },
      // k から ω、ばね
      s2(r) {
        if (r.chance(0.7)) {
          const k = r.pick([4, 16, 25, 49, 64, 81, 100, 2, 3, 5, 8, 12, 18, 20]), s = Math.sqrt(k);   // 9・36 は楽な形の例（O-2）
          const ans = Number.isInteger(s) ? `${s}` : { 8: '2\\sqrt{2}', 12: '2\\sqrt{3}', 18: '3\\sqrt{2}', 20: '2\\sqrt{5}' }[k] || `\\sqrt{${k}}`;
          return { q: `$x=A\\sin\\omega t$（$\\omega>0$）が $\\ddot{x}=-${k}x$ をみたす。$\\omega$`, a: `$${ans}$`, easy: `$\\omega^{2}=${k}$ → $\\omega=${ans}$`, easyCheck: 'last', key: `k${k}`,
            verify: p => (close(numOf(p.a) ** 2, k) && numOf(p.a) > 0) || 'ω がちがう' };
        }
        const [m, kk] = r.pick([[0.5, 8], [0.2, 5], [1, 4], [0.1, 10], [4, 16], [2, 50]]), w = Math.sqrt(kk / m);
        return { q: `ばね定数 $${kk}\\,\\mathrm{N/m}$ のばねにつないだ、質量 $${m}\\,\\mathrm{kg}$ のおもりの位置は $${m}\\ddot{x}=-${kk}x$ をみたす。$x=A\\sin\\omega t$ の $\\omega$（$\\omega>0$）`, a: `$${fmt(w)}$`, easy: `$\\omega^{2}=\\frac{${kk}}{${m}}=${fmt(w * w)}$ → $${fmt(w)}$`, easyCheck: 'last', key: `k${fmt(kk / m)}`,
          verify: p => close(numOf(p.a) ** 2 * m, kk) || 'ω がちがう' };
      },
      // 見かけがちがう：たし算、中身に定数、t/n、□x の形
      s3(r) {
        const k = r.int(0, 3);
        let f, ans, easy, key;
        // ω は、楽な形の例（3・6）とわなの数（2・4）をよける（O-2）
        if (k === 0) { const w = r.pick([5, 7]), A = r.pick([1, 2, 3]), B = r.pick([1, 4, 5]); f = join([trigT(A, 'sin', w), trigT(B, 'cos', w)]); ans = w * w; easy = `どちらの項も $\\omega=${w}$ → $k=${ans}$`; key = `s${w}${A}${B}`; }
        else if (k === 1) { const w = r.pick([5, 7]), c = r.pick([1, 2]), A = r.pick([2, 3]); f = cT(A, `\\cos(${w}t+${c})`); ans = w * w; easy = `中身の $t$ の係数 $${w}$ → $k=${ans}$`; key = `c${w}${c}${A}`; }
        else if (k === 2) { const n = r.pick([2, 3]), A = r.pick([1, 4]); f = cT(A, `\\sin\\frac{t}{${n}}`); ans = `\\frac{1}{${n * n}}`; easy = `$\\omega=\\frac{1}{${n}}$ → $k=${ans}$`; key = `f${n}${A}`; }
        else {
          const w = r.pick([5, 7, 8]), A = r.pick([2, 3, 0.5]), fn = r.pick(['sin', 'cos']); f = dT(A, `\\${fn}${w}t`);
          return { q: `$x=${f}$ のとき、$\\ddot{x}=□x$`, a: `$-${w * w}$`, easy: `$-\\omega^{2}=-${w * w}$`, easyCheck: 'last', key: `k${w * w}`,
            verify: p => close(d2ratio(f, 0.37), numOf(p.a), 1e-4) || 'ちがう' };
        }
        return { q: `$x=${f}$ は $\\ddot{x}=-kx$ をみたす。$k$`, a: `$${ans}$`, easy, easyCheck: 'last', key,
          verify: p => close(d2ratio(f, 0.37), -numOf(p.a), 1e-4) || 'k がちがう' };
      },
      // わな：e^{ωt}（符号が＋。5-62）
      trap(r) {
        const w = r.pick([2, 4]), s = r.pick([1, -1]), A = r.pick([1, 2, 3]), f = cT(A, `e^{${s < 0 ? '-' : ''}${w}t}`);   // ω=3 は楽な形の例（9）
        return dest({ q: `$x=${f}$ は $\\ddot{x}=□x$ をみたす`, a: `$${w * w}$`, key: `E${w}`, verify: p => close(d2ratio(f, 0.37), numOf(p.a), 1e-4) || 'ちがう' },
          '5-75', `$\\sin$・$\\cos$ ではない。$e$ の式は2回微分で $(${s < 0 ? '-' : ''}${w})^{2}=${w * w}$ 倍（符号が＋）`);
      },
    },
  });

  // ================================================================ 5-95
  M.add({
    id: '5-95', part: 5, chap: '5-15①⑤・例題3', stars: 1,
    title: '円運動は $\\omega=2\\pi f$、$v=r\\omega$、$a=r\\omega^2$',
    mark: '「毎秒□回転」「1分間に□回転」「1周□秒」の等速円運動の、角速度・速さ・加速度。',
    futsu: ['$x=r\\cos\\omega t$、$y=r\\sin\\omega t$ を', '2回微分して、成分から', '速度と加速度の大きさを出す。'],
    raku: ['毎秒5回転 → $\\omega=5\\times2\\pi=10\\pi$', '半径 $0.2\\,\\mathrm{m}$ → $v=0.2\\times10\\pi=2\\pi$', '$a=0.2\\times(10\\pi)^{2}=20\\pi^{2}$'],
    why: '1回転は $2\\pi\\,\\mathrm{rad}$ なので、毎秒 $f$ 回転なら角速度 $\\omega=2\\pi f$。1秒に進む弧の長さは「半径×角」で $r\\omega$（5-15⑤）。座標を2回微分すると $-\\omega^2$ 倍なので、加速度の大きさは $r\\omega^2$（5-15⑥、例題3）。',
    caution: '回転数 $f$ をそのまま $\\omega$ にしない（$2\\pi$ をかける）。「1分間に」は60でわって毎秒にする。回る速さが変わるとき（$\\theta=2t^2$）は、$\\theta$ を微分する。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /回転|角速度|円運動|1周|円の上を/.test(q) && !/\\sin|\\cos|t\^\{2\}|観覧車/.test(q); },
    steps: {
      // ω=2πf、v=rω、a=rω²（数で）
      s1(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const f = r.pick([1, 2, 3, 10, 0.5, 4, 50]);   // 毎秒5回転は楽な形の例（O-2）
          return { q: `毎秒${f}回転する円運動の角速度 $\\omega$ は □ rad/s`, a: `$${f === 0.5 ? '' : fmt(2 * f)}\\pi$`, easy: `$${f}\\times2\\pi=${f === 0.5 ? '' : fmt(2 * f)}\\pi$`, key: `f${f}` };
        }
        // 数と単位は $0.2\,\mathrm{m}$ の形（行で分かれない。N-7・R2-12）
        const rr = r.pick([0.2, 0.5, 0.1, 2, 3, 0.3]), w = r.pick([2, 3, 4, 5, 10]);
        if (k === 1) return { q: `半径 $${rr}\\,\\mathrm{m}$ の円の上を、角速度 $${w}\\,\\mathrm{rad/s}$ で回る点の速さは □ m/s`, a: `$${fmt(rr * w)}$`, easy: `$${rr}\\times${w}=${fmt(rr * w)}$`, key: `v${rr},${w}` };
        return { q: `半径 $${rr}\\,\\mathrm{m}$ の円の上を、角速度 $${w}\\,\\mathrm{rad/s}$ で回る点の加速度の大きさは □ $\\mathrm{m/s^2}$`, a: `$${fmt(rr * w * w)}$`, easy: `$${rr}\\times${w}^{2}=${fmt(rr * w * w)}$`, key: `v${rr},${w}` };
      },
      // 半径と回転数から、速さ・加速度（π を残して）
      s2(r) {
        const rr = r.pick([0.2, 0.5, 0.1, 0.3, 2, 0.4]), f = r.pick([1, 2, 3, 5, 10]), w = 2 * f;
        if (rr === 0.2 && f === 5) return null;   // 楽な形の例（O-2）
        if (r.chance(0.5)) return { q: `半径 $${rr}\\,\\mathrm{m}$、毎秒${f}回転の円運動の速さは □ m/s（$\\pi$ を残して）`, a: `$${dT(rr * w, '\\pi')}$`, easy: `$\\omega=${w}\\pi$ → $${rr}\\times${w}\\pi=${dT(rr * w, '\\pi')}$`, easyCheck: 'last', key: `${rr},${f}`,
          verify: p => valIs(p.a, rr * 2 * Math.PI * f) };
        return { q: `半径 $${rr}\\,\\mathrm{m}$、毎秒${f}回転の円運動の加速度の大きさは □ $\\mathrm{m/s^2}$（$\\pi$ を残して）`, a: `$${dT(rr * w * w, '\\pi^{2}')}$`, easy: `$${rr}\\times(${w}\\pi)^{2}=${dT(rr * w * w, '\\pi^{2}')}$`, easyCheck: 'last', key: `${rr},${f}`,
          verify: p => valIs(p.a, rr * (2 * Math.PI * f) ** 2) };
      },
      // 見かけがちがう：1分間に□回転、1周□秒、速さと半径から加速度、π=3.14
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const N = r.pick([60, 120, 300, 600, 900]), rr = r.pick([0.1, 0.2, 0.05, 0.3]), f = N / 60, ans = dT(rr * 2 * f, '\\pi');
          return { q: `扇風機の羽根が1分間に${N}回転している。中心から $${rr}\\,\\mathrm{m}$ の点の速さは □ m/s（$\\pi$ を残して）`, a: `$${ans}$`, easy: `毎秒${f}回転 → $${rr}\\times${2 * f}\\pi=${ans}$`, easyCheck: 'last', key: `m${N},${rr}`,
            verify: p => valIs(p.a, rr * 2 * Math.PI * N / 60) };
        }
        if (k === 1) {
          const T = r.pick([2, 4, 5, 10, 3, 8]);
          return { q: `1周${T}秒で、同じ速さで円の上を回る点の角速度は □ rad/s`, a: `$${piT(fr(2, T))}$`, easy: `$\\frac{2\\pi}{${T}}=${piT(fr(2, T))}$`, key: `T${T}`, verify: p => valIs(p.a, 2 * Math.PI / T) };
        }
        if (k === 2) {
          const [v, rr] = r.pick([[2, 0.5], [3, 0.5], [4, 2], [10, 5], [6, 3], [2, 0.4], [20, 50]]);
          return { q: `半径 $${rr}\\,\\mathrm{m}$ の円の上を、速さ $${v}\\,\\mathrm{m/s}$ で回る点の加速度の大きさは □ $\\mathrm{m/s^2}$`, a: `$${fmt(v * v / rr)}$`, easy: `$\\omega=\\frac{${v}}{${rr}}=${fmt(v / rr)}$ → $${rr}\\times${fmt(v / rr)}^{2}=${fmt(v * v / rr)}$`, easyCheck: 'last', key: `a${v},${rr}`,
            verify: p => valIs(p.a, v * v / rr) };
        }
        const rr = r.pick([0.5, 0.2, 1, 0.25]), f = r.pick([1, 2, 4]), vG = 2 * 3.14 * rr * f, ans = apx(vG, 2 * Math.PI * rr * f, 1);
        if (ans == null) return null;
        return { q: `半径 $${rr}\\,\\mathrm{m}$ の円の上を、毎秒${f}回転する点の速さは約 □ m/s（$\\pi=3.14$、小数第1位まで）`, a: `$${ans}$`, easyCheck: false, key: `${rr},${f}`,
          easy: `$${rr}\\times2\\times3.14\\times${f}=${fmt(vG)}${fmt(vG) === ans ? '' : `\\approx${ans}`}$`, verify: p => strip(p.a) === (2 * Math.PI * rr * f).toFixed(1) || 'ちがう' };
      },
      // わな：x 方向の速度（5-70）、回る速さが変わる（5-05）
      trap(r) {
        if (r.chance(0.5)) {
          const R = r.pick([0.2, 0.3, 0.5, 2]), w = r.pick([2, 3, 4, 5]), [m, s] = r.pick([[6, 0.5], [2, 1]]);
          const t0 = piT(fr(1, m * w)), ans = fmt(-R * w * s);
          return dest({ key: '5-95trapA', q: `円運動する点の $x$ 座標が $x=${dT(R, `\\cos${w}t`)}$（m、$t$ は秒）。$t=${t0}$ での $x$ 方向の速度は □ m/s`, a: `$${ans}$`,
            verify: p => valIs(p.a, -R * w * Math.sin(w * Math.PI / (m * w))) }, '5-95', `速さ $r\\omega$ ではなく、$x$ 方向の成分。$x$ を微分して $t=${t0}$ を入れる`);
        }
        const c = r.pick([2, 3, 0.5]), t0 = r.pick([1, 2, 3]);
        return dest({ key: '5-95trapB', q: `回りはじめた円板の角が $\\theta=${fmt(c)}t^{2}$（rad、$t$ は秒）。$t=${t0}$ での角速度は □ rad/s`, a: `$${fmt(2 * c * t0)}$`,
          verify: p => valIs(p.a, ((c * (t0 + 1e-6) ** 2) - c * (t0 - 1e-6) ** 2) / 2e-6, 1e-5) }, '5-95', `回る速さが変わるので、$2\\pi f$ は使えない。$\\theta$ を $t$ で微分して $${dT(2 * c, 't')}$`, ['5-05']);   // 係数が1なら $t$（R2-13）
      },
    },
  });

  // ================================================================ 5-96
  M.add({
    id: '5-96', part: 5, chap: '5-15⑨', stars: 1,
    title: '$\\sin^2$ は2倍角で $\\dfrac{1-\\cos2t}{2}$ にしてから積分',
    mark: '$\\sin^2$・$\\cos^2$・$\\sin t\\cos t$ の積分。とくに、区間が $\\dfrac{\\pi}{2}$ の整数倍でないとき。',
    futsu: ['$\\sin^2t$ の原始関数を、', '$\\frac{\\sin^3t}{3}$ のように', '2乗の積分と同じに考えてしまう（×）。'],
    raku: ['$\\sin^{2}t=\\frac{1-\\cos2t}{2}=\\frac{1}{2}-\\frac{1}{2}\\cos2t$', '$\\displaystyle\\int\\sin^{2}t\\,\\dd t=\\frac{t}{2}-\\frac{\\sin2t}{4}+C$', '$\\displaystyle\\int_0^{\\frac{\\pi}{4}}\\sin^{2}t\\,\\dd t=\\frac{\\pi}{8}-\\frac{1}{4}$'],
    why: '2倍角の式 $\\cos2t=1-2\\sin^2t=2\\cos^2t-1$（5-15⑨）で、2乗を1次の $\\cos2t$ に直すと、$\\frac{1}{2}$ と $\\cos2t$ に分けて積分できる。$\\sin t\\cos t=\\frac{\\sin2t}{2}$ も2倍角。',
    caution: '$\\int\\sin^2t\\,\\dd t=\\frac{\\sin^3t}{3}+C$ は×（微分すると $\\sin^2t\\cos t$）。$\\cos2t$ の積分は $\\frac{1}{2}\\sin2t$（2でわる）。区間が半周期の整数倍なら「長さ÷2」が早い（わざ 5-74）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '34mm', s2: '26mm', s3: '30mm', trap: '30mm' }, boxh: '11mm',
    fits(q) {
      if (!/\\int/.test(q) || /\^\{2\}\s*\d*t\s*\\(sin|cos)/.test(q)) return false;
      return /\\(sin|cos)\^\{2\}/.test(q) || /\\sin\s*t\s*\\cos\s*t/.test(q) || /\(\\sin t\+\\cos t\)\^\{2\}/.test(q) || /\\cos\^\{2\}t-\\sin\^\{2\}t/.test(q);
    },
    steps: {
      // 不定積分
      s1(r) {
        const fn = r.pick(['sin', 'cos']), w = r.pick([1, 1, 2, 3]), A = r.pick([1, 1, 2, 4]);
        if (fn === 'sin' && w === 1 && A === 1) return null;   // 楽な形の例 ∫sin^2 t（O-2）
        const f = cT(A, `\\${fn}^{2}${W(w)}t`), sg = fn === 'sin' ? -1 : 1;
        const ans = join([fB(fr(A, 2), 't'), fB(fr(sg * A, 4 * w), `\\sin${2 * w}t`)]);
        const in2 = `1${sg < 0 ? '-' : '+'}\\cos${2 * w}t`, dbl = A === 1 ? `\\frac{${in2}}{2}` : A === 2 ? in2 : `${A / 2}(${in2})`;
        return { q: `$\\displaystyle\\int ${f}\\,\\dd t$`, a: `$${ans}+C$`, easy: `$${f}=${dbl}$ → $${ans}+C$`, easyCheck: 'last', calc: { kind: 'int', f, x: 't' }, key: `${fn}${w}${A}` };
      },
      // 定積分（区間が π/2 の整数倍でない）
      s2(r) {
        const fn = r.pick(['sin', 'cos']), w = r.pick([1, 1, 2]), [p, q] = r.pick(w === 1 ? [[1, 2], [3, 2], [1, 3], [2, 3], [4, 3], [5, 3]] : [[1, 2], [2, 3], [4, 3], [1, 3]]);
        if (fn === 'sin' && w === 1 && p === 1 && q === 2) return null;   // 楽な形の例 ∫_0^{π/4} sin^2 t（O-2）
        const { val, f, b } = sqDef(fn, w, p, q);
        return { q: `$\\displaystyle\\int_0^{${b}}${f}\\,\\dd t$`, a: `$${val}$`, easy: `$\\Bigl[\\,\\frac{t}{2}${fn === 'sin' ? '-' : '+'}\\frac{\\sin${2 * w}t}{${4 * w}}\\,\\Bigr]_0^{${b}}=${val}$`, easyCheck: 'last', calc: { kind: 'defint', f, a: 0, b, x: 't' }, key: `${fn}${w}${p}${q}` };
      },
      // 見かけがちがう：sin t cos t、(sin t+cos t)^2、cos^2-sin^2
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) return { q: '$\\displaystyle\\int\\sin t\\cos t\\,\\dd t$', a: '$-\\frac{\\cos2t}{4}+C$', easy: '$\\sin t\\cos t=\\frac{\\sin2t}{2}$ → $-\\frac{\\cos2t}{4}+C$', easyCheck: 'last', calc: { kind: 'int', f: '\\sin t\\cos t', x: 't' }, key: 'sc' };
        if (k === 1) return { q: '$\\displaystyle\\int(\\sin t+\\cos t)^{2}\\,\\dd t$', a: '$t-\\frac{\\cos2t}{2}+C$', easy: '$1+2\\sin t\\cos t=1+\\sin2t$ → $t-\\frac{\\cos2t}{2}+C$', easyCheck: 'last', calc: { kind: 'int', f: '(\\sin t+\\cos t)^{2}', x: 't' }, key: 'sq' };
        if (k === 2) return { q: '$\\displaystyle\\int(\\cos^{2}t-\\sin^{2}t)\\,\\dd t$', a: '$\\frac{\\sin2t}{2}+C$', easy: '$\\cos^{2}t-\\sin^{2}t=\\cos2t$ → $\\frac{\\sin2t}{2}+C$', easyCheck: 'last', calc: { kind: 'int', f: '\\cos^{2}t-\\sin^{2}t', x: 't' }, key: 'df' };
        const [b, val] = r.pick([['\\frac{\\pi}{4}', '\\frac{1}{4}'], ['\\frac{\\pi}{2}', '\\frac{1}{2}'], ['\\frac{\\pi}{6}', '\\frac{1}{8}']]);
        return { q: `$\\displaystyle\\int_0^{${b}}\\sin t\\cos t\\,\\dd t$`, a: `$${val}$`, easy: `$\\Bigl[\\,-\\frac{\\cos2t}{4}\\,\\Bigr]_0^{${b}}=${val}$`, easyCheck: 'last', calc: { kind: 'defint', f: '\\sin t\\cos t', a: 0, b, x: 't' }, key: `d${b}` };
      },
      // わな：sin^2 t cos t（5-76）、sin 2t（2乗でない。5-72）
      trap(r) {
        if (r.chance(0.5)) {
          const s = r.chance(0.5);
          return dest({ key: '5-96trapA', q: s ? '$\\displaystyle\\int\\sin^{2}t\\cos t\\,\\dd t$' : '$\\displaystyle\\int\\cos^{2}t\\sin t\\,\\dd t$', a: s ? '$\\frac{\\sin^{3}t}{3}+C$' : '$-\\frac{\\cos^{3}t}{3}+C$',
            calc: { kind: 'int', f: s ? '\\sin^{2}t\\cos t' : '\\cos^{2}t\\sin t', x: 't' } },
            '5-96', `中身 $\\${s ? 'sin' : 'cos'} t$ の微分がかかっているので、2倍角にしないで、中身ごと積分（置換）`, ['5-76']);
        }
        const fn = r.pick(['sin', 'cos']), w = r.pick([2, 4]);
        return dest({ key: '5-96trapB', q: `$\\displaystyle\\int\\${fn}${w}t\\,\\dd t$`, a: fn === 'sin' ? `$-\\frac{1}{${w}}\\cos${w}t+C$` : `$\\frac{1}{${w}}\\sin${w}t+C$`, calc: { kind: 'int', f: `\\${fn}${w}t`, x: 't' } },
          '5-96', `2乗ではない。$\\${fn}\\omega t$ の積分で、$${w}$ でわる`);
      },
    },
  });
})(globalThis.MONDAI);

/* 問題集 第8巻『空間に広がる量』　第4部 線積分と面積分（わざ 8-45〜8-59・8-93・8-94）　組 d
 * 書き方は v8/README.md（第8・9巻の手引き）・v6/README.md・v5/README.md。文は教科書 第8巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 8-7（線積分）・8-8（面積分）の数・ことば・記号にそろえる（道A・道B、$\vec F_1=(y,\ x)$（$U=-xy$）・$\vec F_2=(-y,\ x)$、
 *   $\int_C\vec F\cdot\dd\vec r$・$\oint_C$・$\int_C\lambda\,\dd s$、動摩擦係数 $\mu'$、$p$-$V$ 図、網・屋根・窓・ドーム・箱、$\vec n\,\dd S$・$\oiint_S$、立体角・川の流量）。
 *   場合分けの表の記号（場合 A〜K）は書かず、ことばで書く（V-5）。用字は「距離」「ななめ」「はかる」「はば」（V-11）。
 * 答え：線積分・面積分は分数と $\pi$ を残した形（V-2）。ベクトル（面積ベクトル）は $(a,\ b,\ c)$ と横に。仕事は J、流量は $\mathrm{m^3/s}$。
 *   近似は値とけたを文に書いたときだけ（$\cos30^{\circ}=0.866$、$\cos45^{\circ}=0.707$、$g=9.8$、$\varepsilon_0=8.85\times10^{-12}$、$\pi=3.14$。V-4・O-4・S-3）。
 * 検算：線積分は calc line（折れ線 path か、道の式 r と t）、面積分は calc defint2・polar（面を2つの数で表した積分）、
 *   閉じた箱は箱の中の発散の3重積分（calc defint2。面ごとにたすのとは別の道すじ）、面積ベクトルは calc vec、
 *   摩擦・保存力・$p$-$V$ 図・一様な流れ・立体角・川の流量は verify(p)（問題を作った式とは別の計算）。
 * 図は 8-45（方眼と折れ線の道）・8-54（3本の軸と三角形。M.proj3）・8-59（立方体の箱。M.proj3）のステップ3だけ（K-2）。表は 8-94 のステップ3だけ。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2・S-2・U-2：入れかえ・符号ちがい・何倍か・例と同じ答えも）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3・U-4）。
 * 1つのステップに同じ答えを3つ以上出さない（cap。S-4・U-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const fmt = v => String(+(+v).toFixed(10));
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 小数を分数に（分母 maxD まで）。[分子, 分母]。なければ null
  function frac(x, maxD) {
    for (let d = 1; d <= (maxD || 240); d++) { const n = Math.round(x * d); if (Math.abs(n - x * d) < 1e-7 * d) { const g = gcd(n, d) || 1; return [n / g, d / g]; } }
    return null;
  }
  // 数の TeX（整数・有限小数はそのまま、ほかは分数 \dfrac）
  function numT(x) {
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    if (String(fmt(x)).length <= 6) return fmt(x);
    const f = frac(x, 60);
    return f ? `${f[0] < 0 ? '-' : ''}\\dfrac{${Math.abs(f[0])}}{${f[1]}}` : fmt(x);
  }
  // 分数で書く（線積分の答え。0.5 も \dfrac{1}{2}）
  function fracT(x) {
    if (Math.abs(x - Math.round(x)) < 1e-9) return String(Math.round(x));
    const f = frac(x); if (!f) return fmt(x);
    return `${f[0] < 0 ? '-' : ''}\\dfrac{${Math.abs(f[0])}}{${f[1]}}`;
  }
  // π の何倍か（c は π の係数）：18\pi、\dfrac{9\pi}{2}、-\dfrac{\pi}{2}
  function piT(c) {
    if (Math.abs(c) < 1e-12) return '0';
    const f = frac(c); if (!f) return fmt(c) + '\\pi';
    const s = f[0] < 0 ? '-' : '', n = Math.abs(f[0]), nn = n === 1 ? '' : String(n);
    return f[1] === 1 ? `${s}${nn}\\pi` : `${s}\\dfrac{${nn}\\pi}{${f[1]}}`;
  }
  // 小数で π の何倍か（7.2\pi）
  const piD = c => (Math.abs(c - 1) < 1e-12 ? '\\pi' : Math.abs(c + 1) < 1e-12 ? '-\\pi' : fmt(c) + '\\pi');
  const pt = (...v) => `(${v.map(numT).join(',\\ ')})`;
  const chain = ps => ps.map(p => pt(...p)).join('\\to');
  const U = (v, u) => `${v}\\,\\mathrm{${u}}`;
  // 係数 × 文字（1・−1 は書かない）と、項の和
  const cf = (c, body) => (c === 0 ? '' : !body ? fmt(c) : c === 1 ? body : c === -1 ? '-' + body : fmt(c) + body);
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  // 多項式の項 [c, i, j, k]（c x^i y^j z^k）
  const mono = (i, j, k) => [['x', i], ['y', j], ['z', k || 0]].map(([n, e]) => (e === 0 ? '' : e === 1 ? n : `${n}^${e}`)).join('');
  const polyT = ts => sum(ts.map(([c, i, j, k]) => cf(c, mono(i, j, k))));
  const polyC = ts => ts.length ? ts.map(([c, i, j, k]) => [`(${c})`].concat([['x', i], ['y', j], ['z', k || 0]].filter(([, e]) => e).map(([n, e]) => (e === 1 ? n : `${n}^${e}`))).join('*')).join('+') : '0';
  const polyV = (ts, x, y, z) => ts.reduce((s, [c, i, j, k]) => s + c * x ** i * y ** j * (z || 0) ** (k || 0), 0);
  const vecT = comps => `(${comps.map(polyT).join(',\\ ')})`;
  // シンプソン法（多項式・三角関数の道。分数に直すので細かく）
  function simp(g, a, b, n) {
    n = n || 2000; const h = (b - a) / n; let s = g(a) + g(b);
    for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * g(a + k * h);
    return s * h / 3;
  }
  // 折れ線の道の線積分（場 F = [P, Q] の多項式の項）。問題の数を作るため（検算は calc line）
  function lineInt(F, pts) {
    let tot = 0;
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], dx = x1 - x0, dy = y1 - y0;
      tot += simp(t => polyV(F[0], x0 + dx * t, y0 + dy * t) * dx + polyV(F[1], x0 + dx * t, y0 + dy * t) * dy, 0, 1, 200);
    }
    return tot;
  }
  // 1つのステップに同じ答えを3つ以上出さない（S-4・U-3）。ans がもう n 回出ていれば true
  function cap(r, tag, ans, n) {
    const d = r.caps || (r.caps = {}), m = d[tag] || (d[tag] = new Map()), c = m.get(ans) || 0;
    if (c >= (n || 2)) return true;
    m.set(ans, c + 1); return false;
  }
  // 数の組が、例の数の組と同じか、入れかえ・符号ちがい・何倍か（S-2・U-2）
  const absSort = v => v.map(Math.abs).sort((x, y) => x - y);
  function likeEx(v, w) {
    if (v.length !== w.length) return false;
    const a = absSort(v), b = absSort(w), ma = a[a.length - 1], mb = b[b.length - 1];
    if (!ma || !mb) return false;
    return a.every((x, i) => Math.abs(x - ma / mb * b[i]) < 1e-9 * Math.max(1, ma));
  }

  // ---------------------------------------------------------------- 検算の部品
  // calc（線積分・面積分の数値積分）は1問 0.1〜0.2 秒かかる。check.js は種を200とおり回すので、わざごとに、ちがう calc を
  //   budget こまで（はじめに作る本の見開きの問題が先に入る）。同じ calc は core の中で1回だけ計算される。
  //   calc をつけない問題も、verify（ガウス・ルジャンドルの数値積分など、問題を作った計算とは別の道すじ）でかならず確かめる。
  //   種を数百とおり変えた全部の問題の calc は、組の確かめの計算（scratchpad）で回した。
  const CALCED = {};
  const BUDGET = { '8-48': 20, '8-54': 10, '8-55': 24, '8-57': 10, '8-58': 8, '8-59': 12 };   // 重い calc のわざ（check.js が1わざ10秒をこえないように）
  function withCalc(id, p, calc, budget) {
    const s = CALCED[id] || (CALCED[id] = new Set()), k = JSON.stringify(calc), n = Math.min(budget || 36, BUDGET[id] || 99);
    if (M.D8_ALLCALC || s.has(k) || s.size < n) { s.add(k); p.calc = calc; }   // D8_ALLCALC：組の確かめの計算で全部に calc をつける
    // 答えに単位・「約」があるときは、くらべる式（ans）を書く
    if (p.calc && /\\mathrm|約/.test(p.a)) {
      const ms = maths(p.a); let t = ms[ms.length - 1].replace(/\\,\\mathrm\{[^}]*\}/g, '').trim();
      if (/^\(.*\)$/.test(t)) t = t.slice(1, -1);
      p.calc = Object.assign({}, calc, { ans: t });
    }
    return p;
  }
  // ガウス・ルジャンドル（10点。多項式なら19次まで、ぴったり）
  const GLX = [0.1488743389816312, 0.4333953941292472, 0.6794095682990244, 0.8650633666889845, 0.9739065285171717];
  const GLW = [0.2955242247147529, 0.2692667193099963, 0.2190863625159820, 0.1494513491505806, 0.0666713443086881];
  function gl(g, a, b) {
    const m = (a + b) / 2, h = (b - a) / 2; let s = 0;
    for (let k = 0; k < 5; k++) s += GLW[k] * (g(m + h * GLX[k]) + g(m - h * GLX[k]));
    return s * h;
  }
  // 区間を n に分けたガウス・ルジャンドル（三角関数の道）
  const gln = (g, a, b, n) => { let s = 0; for (let k = 0; k < n; k++) s += gl(g, a + (b - a) * k / n, a + (b - a) * (k + 1) / n); return s; };
  // 答えの文の数（「約」・単位・≈ のあと）。読めなければ null
  function ansNum(a) {
    const ms = maths(a); if (!ms.length) return null;
    let s = ms[ms.length - 1].replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\\left|\\right/g, '');
    if (s.includes('\\approx')) s = s.slice(s.lastIndexOf('\\approx') + 7);
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    return M.evalMath(s.trim(), {});
  }
  const vNear = (p, want, tol) => near(ansNum(p.a), want, tol || 1e-9) || `答え ${p.a} が ${want} でない`;
  // 折れ線の道の線積分を、ガウス・ルジャンドルで（検算用。場は JS の関数 (x, y) → [P, Q]）
  function lineGL(Ff, pts) {
    let tot = 0;
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1], [x1, y1] = pts[k], dx = x1 - x0, dy = y1 - y0;
      tot += gl(t => { const f = Ff(x0 + dx * t, y0 + dy * t); return f[0] * dx + f[1] * dy; }, 0, 1);
    }
    return tot;
  }
  const Ffun = F => (x, y) => [polyV(F[0], x, y), polyV(F[1], x, y)];

  // ---------------------------------------------------------------- 文の読みとり（見わけようの目印 fits）
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  // 文の中の点の並び $(0,\ 0)\to(1,\ 0)\to…$（2つ以上の点）。数の配列の配列
  function chainsIn(q) {
    const out = [];
    for (const s of maths(q)) {
      if (!/\\to/.test(s)) continue;
      const ps = s.split('\\to').map(t => { const m = /^\s*\((-?[\d.]+),\\?\s*(-?[\d.]+)\)\s*$/.exec(t); return m ? [+m[1], +m[2]] : null; });
      if (ps.length >= 2 && ps.every(Boolean)) out.push(ps);
    }
    return out;
  }
  const hasF = q => /\\vec F\s*=|\\vec F_[12]\s*=|\\vec v\s*=/.test(q);
  const closed = ps => ps.length >= 3 && ps[0][0] === ps[ps.length - 1][0] && ps[0][1] === ps[ps.length - 1][1];
  const axisPar = ps => ps.slice(1).every((p, k) => p[0] === ps[k][0] || p[1] === ps[k][1]);

  // ---------------------------------------------------------------- わなの行き先（N-3・S-7・U-4）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(8).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 4 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }
  // exAns：左ページの例の答え。同じ見開きの問題（どのステップも）に、例と同じ答えを出さない（O-2・U-2）
  const ansKey = a => maths(a).map(t => t.replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^\((.*)\)$/, '$1').trim()).join('|');
  const add = def => {
    if (def.exAns) {
      const ex = new Set(def.exAns);
      for (const s of Object.keys(def.steps)) {
        const fn = def.steps[s];
        def.steps[s] = r => { const p = fn(r); return p && ex.has(ansKey(p.a)) ? null : p; };
      }
    }
    M.add(Object.assign({ part: 4, stars: 1 }, def));
  };

  // ---------------------------------------------------------------- 線積分の場（2つの成分）の部品
  // (a y, b x)・(a x, b y) の形
  const Fyx = (a, b) => [[[a, 0, 1]], [[b, 1, 0]]];
  const Fxy = (a, b) => [[[a, 1, 0]], [[b, 0, 1]]];
  const Fc = F => F.map(polyC);
  const PA = [[0, 0], [1, 0], [1, 1]], PB = [[0, 0], [0, 1], [1, 1]];
  const PAT = `道A $${chain(PA)}$`, PBT = `道B $${chain(PB)}$`;
  const lineQ = (F, path) => `$\\vec F=${vecT(F)}$、${path} の線積分`;
  // 折れ線の道の線積分の問題に、verify（ガウス・ルジャンドル）と calc line（budget まで）をつける
  const lineP = (id, p, F, path) => { p.verify = q => vNear(q, lineGL(Ffun(F), path)); return withCalc(id, p, { kind: 'line', path, F: Fc(F) }); };

  // ================================================================ 8-45
  // 例（左ページ）：(3y, x) の道A 1・道B 3。教科書の F1・F2 も左ページだけ（O-2）。(ay, bx) で |a|=|b|、3倍の組をよける
  const bad45 = (a, b) => { const A = Math.abs(a), B = Math.abs(b); return A === B || A === 3 * B || B === 3 * A; };
  add({
    id: '8-45', chap: '8-7④ 例題1',
    exAns: ['1', '3'],   // 左ページの例の答え（O-2）
    title: '軸に平行な道：横の区間は $F_x\\,\\dd x$（$y$ は止めた数）、たての区間は $F_y\\,\\dd y$（$x$ は止めた数）',
    mark: '道が横とたての線分だけの折れ線（道A・道B など）で、力 $\\vec F$ の線積分。',
    futsu: ['道を区間ごとに $\\vec r(t)$ で表し、', '$\\vec r\\,\'(t)$ を出して内積を作り、', '$t$ で積分する'],
    raku: ['$\\vec F=(3y,\\ x)$、道A：右へ（$y=0$）$0$、', '上へ（$x=1$）$\\int_0^1 1\\,\\dd y=1$、合計 $1$', '道B：上へ $0$、右へ（$y=1$）$\\int_0^1 3\\,\\dd x=3$'],
    why: '横の区間では $y$ が変わらず $\\dd y=0$ なので、内積 $F_x\\,\\dd x+F_y\\,\\dd y$ のうち $F_x\\,\\dd x$ だけが残る。$F_x$ の $y$ には、その区間の止めた数を入れる。たての区間は $F_y\\,\\dd y$ だけで、$x$ が止めた数（8-7④）。区間ごとにふつうの定積分にして、たす。',
    caution: '左や下へ進む区間は、はしを逆に $\\int_1^0$ とする（符号が変わる）。止めた数を入れ忘れて、$y$ を残したまま積分しない。同じ点から同じ点への道でも、道AとBで答えがちがうことがある。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      if (/道[AB]|図の折れ線/.test(q) && hasF(q) && !/U\s*=|\\oint/.test(q)) return true;
      if (!hasF(q) || /円|まっすぐ|にそって|U\s*=/.test(q)) return false;
      const ch = chainsIn(q);
      return ch.length > 0 && ch.every(ps => ps.length >= 3 && axisPar(ps) && !closed(ps));
    },
    steps: {
      // (a y, b x)・(a x, b y) で、道Aか道B
      s1(r) {
        const kind = turn(r, '45s1k', 2), onA = turn(r, '45s1p', 2) === 0;
        const a = r.pick([-3, -2, -1, 1, 2, 4, 5]), b = r.pick([-3, -2, -1, 1, 2, 4, 5]);
        if (kind === 0 && bad45(a, b)) return null;
        if (kind === 1 && (a === b || a + b === 0)) return null;
        const F = kind === 0 ? Fyx(a, b) : Fxy(a, b), path = onA ? PA : PB, v = lineInt(F, path), ans = fracT(v);
        if (cap(r, '45s1', ans)) return null;
        const e1 = onA ? `右へ（$y=0$）$${fracT(lineInt(F, PA.slice(0, 2)))}$、上へ（$x=1$）$${fracT(lineInt(F, PA.slice(1)))}$`
          : `上へ（$x=0$）$${fracT(lineInt(F, PB.slice(0, 2)))}$、右へ（$y=1$）$${fracT(lineInt(F, PB.slice(1)))}$`;
        return lineP('8-45', { q: lineQ(F, onA ? PAT : PBT), a: `$${ans}$`, key: `45:${kind}:${a},${b}:${onA}`, easy: e1, easyCheck: false }, F, path);
      },
      // 長方形の L字の道（はじめの点・長さ・順を変える）と、2つの項の場
      s2(r) {
        const x0 = r.pick([0, 0, 1, -1]), y0 = r.pick([0, 0, 1]), p = r.pick([2, 3, 1]), q = r.pick([1, 2, 3]);
        if (p === 1 && q === 1 && x0 === 0 && y0 === 0) return null;
        const hv = r.chance(0.5), mid = hv ? [x0 + p, y0] : [x0, y0 + q], path = [[x0, y0], mid, [x0 + p, y0 + q]];
        const c = () => r.pick([-2, -1, 1, 2, 3]);
        const tpl = turn(r, '45s2', 4);
        const F = tpl === 0 ? [[[c(), 0, 1]], [[c(), 2, 0]]] : tpl === 1 ? [[[c(), 1, 1]], [[c(), 1, 0]]] : tpl === 2 ? [[[c(), 0, 2]], [[c(), 1, 1]]] : [[[c(), 1, 0], [c(), 0, 1]], [[c(), 1, 0]]];
        const v = lineInt(F, path), ans = fracT(v);
        if (cap(r, '45s2', ans)) return null;
        const seg = k => fracT(lineInt(F, path.slice(k, k + 2)));
        return lineP('8-45', { q: lineQ(F, `道 $${chain(path)}$ `), a: `$${ans}$`, key: `45b:${JSON.stringify(F)}:${chain(path)}`,
          easy: `${hv ? `横（$y=${y0}$）` : `たて（$x=${x0}$）`}$${seg(0)}$、${hv ? `たて（$x=${x0 + p}$）` : `横（$y=${y0 + q}$）`}$${seg(1)}$`, easyCheck: false }, F, path);
      },
      // 見かけがちがう：方眼の図の階段の道（左や下へもどる区間もある）
      s3(r) {
        for (let k = 0; k < 60; k++) {
          const n = r.pick([3, 4]), path = [[0, 0]];
          let horiz = r.chance(0.5);
          for (let i = 0; i < n; i++) {
            const [x, y] = path[path.length - 1];
            const step = horiz ? r.pick([1, 2, 1, -1]) : r.pick([1, 2, 1]);
            const nx = horiz ? x + step : x, ny = horiz ? y : y + step;
            if (nx < 0 || nx > 4 || ny < 0 || ny > 3) break;
            path.push([nx, ny]); horiz = !horiz;
          }
          if (path.length < 4) continue;
          if (path.some((p, i) => path.findIndex(w => w[0] === p[0] && w[1] === p[1]) !== i)) continue;
          const a = r.pick([-2, -1, 1, 2, 3]), b = r.pick([-2, -1, 1, 2, 3]), c0 = r.pick([0, 0, 1, -1]);
          if (a === b) continue;
          const F = [[[a, 0, 1]], [[b, 1, 0]].concat(c0 ? [[c0, 0, 0]] : [])];
          const v = lineInt(F, path), ans = fracT(v);
          if (cap(r, '45s3', ans, 1)) return null;
          const G = M.graph({ x0: 0, x1: 4, y0: 0, y1: 3, w: 4, h: 3 });
          const its = [['grid', 0, 0, 4, 3], ...G.axes({ xt: [1, 2, 3, 4], yt: [1, 2, 3] })];
          for (let i = 1; i < path.length; i++) its.push(['seg', G.T(...path[i - 1]), G.T(...path[i]), { arrow: true, thick: true }]);
          its.push(['dot', G.T(...path[path.length - 1])], ['label', G.T(...path[path.length - 1]), 'Q', 'ne']);
          return lineP('8-45', { q: `図の折れ線の道（原点 O から Q へ、矢印の向きに進む）で、$\\vec F=${vecT(F)}$ の線積分`, a: `$${ans}$`, key: `45c:${chain(path)}:${a},${b},${c0}`,
            fig: { s: 6, items: its }, easy: `区間ごとに：${path.slice(1).map((p, i) => fracT(lineInt(F, path.slice(i, i + 2)))).map(x => `$${x}$`).join('、')}`, easyCheck: false }, F, path);
        }
        return null;
      },
      // わな：まっすぐなななめの道 → 8-46
      trap(r) {
        const a = r.pick([1, 2, 3, -1]), b = r.pick([1, 2, 3, -2]), p = r.pick([1, 2, 3]), q = r.pick([1, 2]);
        if (p === 1 && q === 1 && a === b) return null;
        const F = Fyx(a, b), path = [[0, 0], [p, q]];
        return dest(lineP('8-45', { q: `$\\vec F=${vecT(F)}$、原点から点 $${pt(p, q)}$ へまっすぐ進む道の線積分`, a: `$${fracT(lineInt(F, path))}$`, key: `45t:${a},${b},${p},${q}` }, F, path), '8-45', 'ななめの道は軸に平行でない。$\\vec r=t\\,(' + p + ',\\ ' + q + ')$ と1つの数で表す');
      },
    },
  });

  // ================================================================ 8-46
  // 道の式 $\vec r(t)$ の TeX（成分は x0 + d t）
  const rT = (P, d, v) => `(${P.map((x0, k) => sum([cf(x0, ''), cf(d[k], v || 't')])).join(',\\ ')})`;
  // 曲線の道の線積分（x を道の数に：y = c x^n、0〜X。rev で逆向き。swap で x = c y^n（y を道の数に））
  function curveInt(Ff, c, n, X, rev, swap) {
    const g = u => { const w = c * u ** n, dw = c * n * u ** (n - 1), [x, y, dx, dy] = swap ? [w, u, dw, 1] : [u, w, 1, dw], f = Ff(x, y); return f[0] * dx + f[1] * dy; };
    return (rev ? -1 : 1) * gln(g, 0, X, 4);
  }
  const curveT = (c, n, sw) => `${sw ? 'x' : 'y'}=${cf(c, sw ? (n === 1 ? 'y' : `y^${n}`) : (n === 1 ? 'x' : `x^${n}`))}`;
  const EXA46 = ['\\dfrac{3}{2}', '\\dfrac{5}{3}'];   // 左ページの例の答え（O-2）
  // 場：0 (a y, b x)、1 (a x, b y)、2 (a y + c, b x)、3 (a, b x)
  function F46(r, t) {
    const c = () => r.pick([-2, -1, 1, 2, 3]);
    return t === 0 ? Fyx(c(), c()) : t === 1 ? Fxy(c(), c()) : t === 2 ? [[[c(), 0, 1], [c(), 0, 0]], [[c(), 1, 0]]] : [[[c(), 0, 0]], [[c(), 1, 0]]];
  }
  add({
    id: '8-46', chap: '8-7⑥ 例題2・例題3',
    exAns: ['\\dfrac{3}{2}', '\\dfrac{5}{3}'],   // 左ページの例の答え（O-2）
    title: '道を1つの数で表す：まっすぐな道は $\\vec A+t(\\vec B-\\vec A)$、$y=g(x)$ の道は $x$ を使い $y$ に $g(x)$ を入れる',
    mark: 'ななめにまっすぐ進む道や、放物線 $y=x^2$ などにそって進む道の線積分。',
    futsu: ['道を細かい線分に分け、', '1本ずつ力と線分の矢印の', '内積を計算してたす'],
    raku: ['$\\vec F=(y,\\ 2x)$、$(0,\\ 0)\\to(1,\\ 1)$ まっすぐ：', '$\\vec r=(t,\\ t)$、内積 $t+2t=3t$ → $\\dfrac32$', '$y=x^2$：$(x^2,\\ 2x)\\cdot(1,\\ 2x)=5x^2$ → $\\dfrac53$'],
    why: '道の上の場所を1つの数で表すと、$x$ も $y$ もその数の式になり、$\\vec F\\cdot\\dd\\vec r$ が「その数の式×$\\dd t$」になる。点Aから点Bへのまっすぐな道は $\\vec r=\\vec A+t(\\vec B-\\vec A)$（$0\\leqq t\\leqq1$）、$\\dd\\vec r=(\\vec B-\\vec A)\\,\\dd t$。$y=g(x)$ の道は $x$ を道の数にして $\\dd\\vec r=(1,\\ g\'(x))\\,\\dd x$（8-7⑥）。',
    caution: '$y=g(x)$ の道では、積分する前に $y$ を $g(x)$ に置きかえる（$y$ を残さない）。はじめの点が下のはし、おわりの点が上のはし。逆向きに進むときは、$\\vec r=\\vec B+t(\\vec A-\\vec B)$ にするか、はしを逆にする（符号が変わる）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      if (!hasF(q) || /円|針金|U\s*=|\\oint|図/.test(q)) return false;
      return /まっすぐ|にそって/.test(q) && !chainsIn(q).some(ps => ps.length >= 3);
    },
    steps: {
      // まっすぐなななめの道（はじめの点も原点でないことがある）
      s1(r) {
        const P = [r.pick([0, 0, 1, -1, 2]), r.pick([0, 0, 1, -1])], d = [r.pick([1, 2, 3, -1, -2]), r.pick([1, 2, 3, -1])], Q = [P[0] + d[0], P[1] + d[1]];
        if (P[0] === 0 && P[1] === 0 && Q[0] === 1 && Q[1] === 1) return null;
        const F = F46(r, turn(r, '46s1', 3)), path = [P, Q], ans = fracT(lineInt(F, path));
        if (EXA46.includes(ans) || cap(r, '46s1', ans)) return null;
        return lineP('8-46', { q: `$\\vec F=${vecT(F)}$、点 $${pt(...P)}$ から点 $${pt(...Q)}$ へまっすぐ進む道の線積分`, a: `$${ans}$`, key: `46:${JSON.stringify(F)}:${P},${Q}`,
          easy: `$\\vec r=${rT(P, d)}$、$\\dd\\vec r=${pt(...d)}\\,\\dd t$、$0\\leqq t\\leqq1$`, easyCheck: false }, F, path);
      },
      // 曲線 y = c x^n にそって、原点から
      s2(r) {
        const [c, n, X] = r.pick([[1, 2, 1], [1, 2, 1], [1, 2, 2], [1, 3, 1], [2, 2, 1], [1, 3, 1]]);
        const t = turn(r, '46s2', 4), F = F46(r, t);
        if (c === 1 && n === 2 && X === 1 && t === 0) { const A = Math.abs(F[0][0][0]), B = Math.abs(F[1][0][0]); if (A === B || A === 2 * B || B === 2 * A) return null; }   // 例・教科書の数をよける
        if (n === 3 && X === 1 && t === 0 && Math.abs(F[0][0][0]) === Math.abs(F[1][0][0])) return null;
        const Ff = Ffun(F), v = curveInt(Ff, c, n, X), ans = fracT(v);
        if (EXA46.includes(ans) || cap(r, '46s2', ans)) return null;
        const end = [X, c * X ** n];
        return withCalc('8-46', { q: `$\\vec F=${vecT(F)}$、原点から点 $${pt(...end)}$ へ、曲線 $${curveT(c, n)}$ にそって進む道の線積分`, a: `$${ans}$`, key: `46b:${JSON.stringify(F)}:${c},${n},${X}`,
          easy: `$y$ に $${cf(c, n === 1 ? 'x' : `x^${n}`)}$ を入れ、$\\dd\\vec r=(1,\\ ${cf(c * n, n - 1 === 1 ? 'x' : `x^${n - 1}`)})\\,\\dd x$`, easyCheck: false,
          verify: p => vNear(p, curveInt(Ff, c, n, X)) }, { kind: 'line', r: ['t', `${c}*t^${n}`], t: [0, X], F: Fc(F) });
      },
      // 見かけがちがう：逆向きに進む道（まっすぐ・曲線）、x = y^2 の道
      s3(r) {
        const kind = turn(r, '46s3', 3), F = F46(r, r.int(0, 3)), Ff = Ffun(F);
        if (kind === 0) {
          const Q = [r.pick([0, 1, 2]), r.pick([0, 1, 2])], P = [Q[0] + r.pick([1, 2, 3]), Q[1] + r.pick([1, 2, -1])];
          if (P[1] === Q[1]) return null;
          const path = [P, Q], d = [Q[0] - P[0], Q[1] - P[1]], ans = fracT(lineInt(F, path));
          if (EXA46.includes(ans) || cap(r, '46s3', ans, 1)) return null;
          return lineP('8-46', { q: `$\\vec F=${vecT(F)}$、点 $${pt(...P)}$ から点 $${pt(...Q)}$ へ、まっすぐもどる道の線積分`, a: `$${ans}$`, key: `46c:${JSON.stringify(F)}:${P},${Q}`,
            easy: `はじめが $${pt(...P)}$：$\\vec r=${rT(P, d)}$、$0\\leqq t\\leqq1$`, easyCheck: false }, F, path);
        }
        const sw = kind === 2, [c, n, X] = sw ? r.pick([[1, 2, 1], [1, 2, 2]]) : r.pick([[1, 2, 1], [1, 2, 2], [1, 3, 1]]);
        const rev = !sw, v = curveInt(Ff, c, n, X, rev, sw), ans = fracT(v);
        if (EXA46.includes(ans) || cap(r, '46s3', ans, 1)) return null;
        const end = sw ? [c * X ** n, X] : [X, c * X ** n];
        const q = sw ? `$\\vec F=${vecT(F)}$、原点から点 $${pt(...end)}$ へ、曲線 $${curveT(c, n, true)}$ にそって進む道の線積分`
          : `$\\vec F=${vecT(F)}$、点 $${pt(...end)}$ から原点へ、曲線 $${curveT(c, n)}$ にそってもどる道の線積分`;
        const calc = sw ? { kind: 'line', r: [`${c}*t^${n}`, 't'], t: [0, X], F: Fc(F) } : { kind: 'line', r: ['t', `${c}*t^${n}`], t: [X, 0], F: Fc(F) };
        return withCalc('8-46', { q, a: `$${ans}$`, key: `46d:${JSON.stringify(F)}:${c},${n},${X},${sw}`,
          easy: sw ? `$y$ を道の数に：$\\vec r=(${cf(c, n === 1 ? 'y' : `y^${n}`)},\\ y)$、$y$ は $0$ から $${X}$` : `$x$ を道の数に、$x$ は $${X}$ から $0$ まで（はしを逆に）`, easyCheck: false,
          verify: p => vNear(p, curveInt(Ff, c, n, X, rev, sw)) }, calc);
      },
      // わな：円を1周する道 → 8-47
      trap(r) {
        const a = r.pick([1, 2, 3]), R = r.pick([1, 2, 4]);
        const F = [[[-a, 0, 1]], [[a, 1, 0]]], Ff = Ffun(F);
        return dest(withCalc('8-46', { q: `$\\vec F=${vecT(F)}$、原点が中心で半径 $${R}$ の円を、点 $${pt(R, 0)}$ から左回りに1周する道の線積分`, a: `$${piT(2 * a * R * R)}$`, key: `46t:${a},${R}`,
          verify: p => vNear(p, gln(t => { const f = Ff(R * Math.cos(t), R * Math.sin(t)); return -f[0] * R * Math.sin(t) + f[1] * R * Math.cos(t); }, 0, 2 * Math.PI, 8)) },
        { kind: 'line', r: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, '2*pi'], F: Fc(F) }), '8-46', '円の道は角 $\\theta$ を道の数にする（まっすぐでも $y=g(x)$ でもない）');
      },
    },
  });

  // ================================================================ 8-47
  // 円の道（中心は原点、半径 R）の線積分：角 th0 から th1 まで（th1 < th0 なら右回り）
  function circInt(Ff, R, th0, th1) {
    return gln(t => { const f = Ff(R * Math.cos(t), R * Math.sin(t)); return -f[0] * R * Math.sin(t) + f[1] * R * Math.cos(t); }, th0, th1, 8);
  }
  const piC = th => { const f = frac(th / Math.PI); return f[0] === 0 ? 0 : `${f[0]}*pi/${f[1]}`; };
  const circCalc = (F, R, th0, th1) => ({ kind: 'line', r: [`${R}*cos(t)`, `${R}*sin(t)`], t: [piC(th0), piC(th1)], F: Fc(F) });
  const SPAN = { 2: '1周', 1: '半周', 0.5: '4分の1周', 1.5: '4分の3周' };
  const axP = (R, k) => [[R, 0], [0, R], [-R, 0], [0, -R]][((k % 4) + 4) % 4];   // 角 kπ/2 の点
  const circP = (id, p, F, R, th0, th1) => { const Ff = Ffun(F); p.verify = q => vNear(q, circInt(Ff, R, th0, th1)); return withCalc(id, p, circCalc(F, R, th0, th1)); };
  const Fw = (a, b) => [[[-a, 0, 1]], [[b, 1, 0]]];   // (−a y, b x)
  add({
    id: '8-47', chap: '8-7⑥ 例題4',
    exAns: ['18\\pi', '\\dfrac{9\\pi}{2}'],   // 左ページの例の答え（O-2）
    title: '円にそう道：$(R\\cos\\theta,\\ R\\sin\\theta)$、1歩は $(-R\\sin\\theta,\\ R\\cos\\theta)\\,\\dd\\theta$。$(-y,\\ x)$ なら内積は $R^2$ で一定',
    mark: '原点が中心の円・半円・4分の1円にそって進む道の線積分。',
    futsu: ['$x=\\sqrt{R^2-y^2}$ などと', '上半分・下半分に分けて', '$y$ で積分する'],
    raku: ['$(-y,\\ x)$、半径3の円を1周：', '内積 $9\\sin^2\\theta+9\\cos^2\\theta=9$ →', '$9\\times2\\pi=18\\pi$。4分の1周 → $\\dfrac{9\\pi}{2}$'],
    why: '円の上の場所は角 $\\theta$ で $\\vec r=(R\\cos\\theta,\\ R\\sin\\theta)$ と表せ、1歩は $\\dd\\vec r=$ $(-R\\sin\\theta,\\ R\\cos\\theta)\\,\\dd\\theta$（8-7⑥）。$(-y,\\ x)$ は $(-R\\sin\\theta,\\ R\\cos\\theta)$ で、1歩と同じ向き。内積は $R^2$ で一定なので、$R^2\\times$（回る角）。1周なら $2\\pi R^2$、円の面積の2倍（8-11 のグリーンの定理につながる）。',
    caution: '左回りは $\\theta$ がふえる向き、右回りは $\\theta$ がへる向き（符号が変わる）。半径が $R$ なら内積は $R^2$（$R$ ではない）。$(-ay,\\ bx)$ のように係数がちがうと内積は一定でないが、4分の1周の倍数なら $\\sin^2$ と $\\cos^2$ の積分は同じで、どちらも回る角の半分。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { return hasF(q) && /円/.test(q) && /半径/.test(q) && !/針金|球|円柱/.test(q); },
    steps: {
      // (−y, x)、(R, 0) から左回りに 1周・半周・4分の1周・4分の3周
      s1(r) {
        const R = r.pick([1, 2, 4, 5]), k = r.pick([2, 1, 0.5, 1.5]), ans = piT(R * R * k);
        if (cap(r, '47s1', ans, 1)) return null;
        const F = Fw(1, 1);
        return circP('8-47', { q: `$\\vec F=(-y,\\ x)$、原点が中心で半径 $${R}$ の円を、点 $${pt(R, 0)}$ から左回りに${SPAN[k]}する道の線積分`, a: `$${ans}$`, key: `47:${R},${k}`,
          easy: `内積は $${R * R}$ で一定、回る角 $${piT(k)}$`, easyCheck: false }, F, R, 0, k * Math.PI);
      },
      // 係数がちがう (−a y, b x)・右回り
      s2(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, 4]), R = r.pick([1, 2, 3]), k = r.pick([2, 1, 0.5]), cw = turn(r, '47s2', 2) === 1;
        if (a === 1 && b === 1 && !cw) return null;
        if (R === 3 && a === b) return null;   // 例の何倍か（O-2）
        const c = (a + b) / 2 * R * R * k * (cw ? -1 : 1), ans = piT(c);
        if (cap(r, '47s2', ans, 1)) return null;
        const F = Fw(a, b);
        return circP('8-47', { q: `$\\vec F=${vecT(F)}$、原点が中心で半径 $${R}$ の円を、点 $${pt(R, 0)}$ から${cw ? '右' : '左'}回りに${SPAN[k]}する道の線積分`, a: `$${ans}$`, key: `47b:${a},${b},${R},${k},${cw}`,
          easy: a === b ? `内積は $${a * R * R}$ で一定${cw ? '、右回りは $\\theta$ がへる' : ''}` : `$${R * R === 1 ? '' : R * R}(${sum([cf(a, '\\sin^2\\theta'), cf(b, '\\cos^2\\theta')])})$、$\\sin^2$・$\\cos^2$ の積分はどちらも $${piT(k / 2)}$${cw ? '。右回りで符号が逆' : ''}`, easyCheck: false }, F, R, 0, (cw ? -1 : 1) * k * Math.PI);
      },
      // 見かけがちがう：はじめの点が軸の上のほかの点、おわりの点で道を書く
      s3(r) {
        const R = r.pick([1, 2, 3]), s0 = r.int(1, 3), n = r.pick([1, 2, 3]), cw = r.chance(0.4), a = r.pick([1, 1, 2, 3]), b = r.pick([1, 2, 3]);
        if (R === 3 && a === b) return null;
        let t0 = s0, t1 = cw ? s0 - n : s0 + n;   // 角（π/2 の何倍か）。4 をこえるときは −2π して、-π/2 から π のように書く
        if (t1 > 4) { t0 -= 4; t1 -= 4; }
        const P = axP(R, t0), Q = axP(R, t1), F = Fw(a, b);
        const c = (a + b) / 2 * R * R * n / 2 * (cw ? -1 : 1), ans = piT(c);
        if (cap(r, '47s3', ans, 1)) return null;
        return circP('8-47', { q: `$\\vec F=${vecT(F)}$、原点が中心で半径 $${R}$ の円にそって、点 $${pt(...P)}$ から点 $${pt(...Q)}$ まで${cw ? '右' : '左'}回りに進む道の線積分`, a: `$${ans}$`, key: `47c:${a},${b},${R},${s0},${n},${cw}`,
          easy: `$\\theta$ は $${piT(t0 / 2)}$ から $${piT(t1 / 2)}$ まで（${SPAN[n / 2]}）`, easyCheck: false }, F, R, t0 * Math.PI / 2, t1 * Math.PI / 2);
      },
      // わな：円の針金の質量（長さでたす。向きのない量）→ 8-51
      trap(r) {
        const R = r.pick([1, 2, 3, 0.5]), c = r.pick([2, 3, 4, 5]);
        const want = 2 * Math.PI * R * c;
        return dest({ q: `半径 $${U(R, 'm')}$ の円の形の針金（1 m あたりの質量 $${U(c, 'kg/m')}$）の質量`, a: `$${U(piT(2 * R * c), 'kg')}$`, key: `47t:${R},${c}`,
          verify: p => vNear(p, want) }, '8-47', '力と1歩の内積ではなく、長さ $\\dd s=R\\,\\dd\\theta$ でたす（向きのない量）');
      },
    },
  });

  // ================================================================ 8-48
  // 例（左ページ）：(3y, x) の三角形の道（道A → もどる）−1。(a y, b x) は bad45 でよける
  const TRI_A = [[0, 0], [1, 0], [1, 1], [0, 0]], TRI_B = [[0, 0], [0, 1], [1, 1], [0, 0]];
  const SQ = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]];
  // 場（2つの項まで）
  function F48(r, t) {
    const c = () => r.pick([-2, -1, 1, 2, 3]);
    return t === 0 ? [[[c(), 0, 1]], [[c(), 1, 0]]] : t === 1 ? [[[c(), 0, 1], [c(), 1, 0]], [[c(), 1, 0]]] : t === 2 ? [[[c(), 0, 2]], [[c(), 1, 0]]] : [[[c(), 1, 1]], [[c(), 1, 0], [c(), 0, 1]]];
  }
  add({
    id: '8-48', chap: '8-7⑦ 例題5・例題8',
    exAns: ['-1', '2'],   // 左ページの例の答え（O-2）
    title: '逆向きに進むと符号が変わる：折れ線・閉じた道は区間ごとに出してたす',
    mark: '三角形・正方形を1周する道、来た道を逆にたどる道、「もどる」区間のある道の線積分。',
    futsu: ['閉じた道全体を1つの式 $\\vec r(t)$ で', '表そうとして、区間ごとに', '場合分けした式を作る'],
    raku: ['$\\vec F=(3y,\\ x)$、$(0,\\ 0)\\to(1,\\ 0)\\to(1,\\ 1)\\to(0,\\ 0)$：', '道Aの部分 $1$、もどる区間は', 'まっすぐな道 $\\int_0^1 4t\\,\\dd t=2$ の逆で $-2$、合計 $-1$'],
    why: '同じ道を逆向きに進むと、どの1歩 $\\dd\\vec r$ も向きが反対になり、内積の符号が全部変わる。だから逆向きの線積分は、もとの道の値の符号を変えたもの（8-7⑦）。折れ線や閉じた道は、区間ごとに直して（軸に平行・まっすぐ・曲線）、たせばよい。出した区間の値は、逆向きの区間にそのまま使える。',
    caution: '閉じた道でも、答えが0とはかぎらない（0になるのは保存力のとき。8-50）。$\\oint$ の◯は「閉じた道」の印で、円の道という意味ではない。もどる区間を、はじめから $\\int_0^1$ で計算するなら、はじめの点・おわりの点を入れかえずに $\\vec r$ を作る。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      if (!hasF(q) || /U\s*=|円|針金/.test(q)) return false;
      return /\\oint|逆にたど/.test(q) || chainsIn(q).some(closed);
    },
    steps: {
      // (a y, b x) で、単位の正方形の中の三角形・正方形を1周
      s1(r) {
        const a = r.pick([-3, -2, -1, 1, 2, 4]), b = r.pick([-3, -2, -1, 1, 2, 4]);
        if (bad45(a, b)) return null;
        const kind = turn(r, '48s1', 4), path = [TRI_A, TRI_B, SQ, SQ.slice().reverse()][kind], F = Fyx(a, b);
        const ans = fracT(lineInt(F, path));
        if (ans === '-1' || cap(r, '48s1', ans)) return null;   // 例の答え −1 をよける（O-2）
        const back = fracT(-lineInt(F, [[0, 0], [1, 1]]));
        const easy = kind === 0 ? `道Aの部分 $${b}$、もどる区間は $${back}$` : kind === 1 ? `道Bの部分 $${a}$、もどる区間は $${back}$`
          : `4つの辺：${path.slice(1).map((P, i) => `$${fracT(lineInt(F, path.slice(i, i + 2)))}$`).join('、')}`;
        return lineP('8-48', { q: `$\\vec F=${vecT(F)}$、閉じた道 $${chain(path)}$ の線積分`, a: `$${ans}$`, key: `48:${a},${b},${kind}`, easy, easyCheck: false }, F, path);
      },
      // 足の長さを変えた三角形・長方形を1周（左回り・右回り）、2つの項の場
      s2(r) {
        const p = r.pick([1, 2, 3]), q = r.pick([1, 2, 3]);
        if (p === 1 && q === 1) return null;
        const kind = turn(r, '48s2', 3), F = F48(r, r.int(0, 3));
        const path = kind === 0 ? [[0, 0], [p, 0], [p, q], [0, 0]] : kind === 1 ? [[0, 0], [0, q], [p, q], [0, 0]] : (r.chance(0.5) ? [[0, 0], [p, 0], [p, q], [0, q], [0, 0]] : [[0, 0], [0, q], [p, q], [p, 0], [0, 0]]);
        const ans = fracT(lineInt(F, path));
        if (cap(r, '48s2', ans)) return null;
        return lineP('8-48', { q: `$\\vec F=${vecT(F)}$、閉じた道 $${chain(path)}$ の線積分`, a: `$${ans}$`, key: `48b:${JSON.stringify(F)}:${chain(path)}`,
          easy: `区間ごとに：${path.slice(1).map((P, i) => `$${fracT(lineInt(F, path.slice(i, i + 2)))}$`).join('、')}`, easyCheck: false }, F, path);
      },
      // 見かけがちがう：道Bで行って道Aを逆にもどる（ことばの道）、∮ と斜辺のある三角形
      s3(r) {
        const F = F48(r, r.int(0, 3));
        if (turn(r, '48s3', 2) === 0) {
          const path = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]], vB = lineInt(F, PB), vA = lineInt(F, PA), ans = fracT(vB - vA);
          if (cap(r, '48s3', ans, 1)) return null;
          return lineP('8-48', { q: `$\\vec F=${vecT(F)}$ で、道B $${chain(PB)}$ で進み、道Aを逆にたどって原点へもどる道の線積分`, a: `$${ans}$`, key: `48c:${JSON.stringify(F)}`,
            easy: `道B $${fracT(vB)}$、道A $${fracT(vA)}$ の逆 $${fracT(-vA)}$`, easyCheck: false }, F, path);
        }
        const p = r.pick([1, 2, 3]), q = r.pick([1, 2]), path = [[0, 0], [p, 0], [0, q], [0, 0]], ans = fracT(lineInt(F, path));
        if (cap(r, '48s3', ans, 1)) return null;
        return lineP('8-48', { q: `$\\oint_C\\vec F\\cdot\\dd\\vec r$（$\\vec F=${vecT(F)}$、$C$ は三角形の道 $${chain(path)}$）`, a: `$${ans}$`, key: `48d:${JSON.stringify(F)}:${p},${q}`,
          easy: `区間ごとに：${path.slice(1).map((P, i) => `$${fracT(lineInt(F, path.slice(i, i + 2)))}$`).join('、')}`, easyCheck: false }, F, path);
      },
      // わな：U のわかる保存力（道がわからない）→ 8-50
      trap(r) {
        const a = r.pick([1, 2, 3]), P = [r.int(0, 3), r.int(1, 3)], Q = [r.int(1, 3), r.int(0, 3)];
        if (P[0] === Q[0] && P[1] === Q[1]) return null;
        if (a === 1 && ((P + '' === '1,2' && Q + '' === '3,1') || (P + '' === '2,1' && Q + '' === '1,4') || (P + '' === '0,2' && Q + '' === '2,3'))) return null;
        const Uf = (x, y) => -a * x * y, W = Uf(...P) - Uf(...Q);
        return dest({ q: `$\\vec F=${vecT(Fyx(a, a))}$（$U=${cf(-a, 'xy')}$）が、点 $${pt(...P)}$ から点 $${pt(...Q)}$ まで、どんな道で動かしてもする仕事`, a: `$${W}$`, key: `48t:${a}:${P}:${Q}`,
          verify: p => vNear(p, lineGL(Ffun(Fyx(a, a)), [P, [Q[0], P[1]], Q])) }, '8-48', '道が決まっていない。$U$ のわかる保存力なので $U(\\text{はじめ})-U(\\text{おわり})$');
      },
    },
  });

  // ================================================================ 8-49
  const G98 = 9.8, gT = '$g=9.8\\,\\mathrm{m/s^2}$';
  // 動摩擦力 μ' m g（小数のけたをそろえる）。左ページの例 5 kg・0.2、教科書の 10 kg・0.3、20 kg・0.25、5 kg・0.4 をよける（O-2）
  const EX49 = ['5,0.2', '10,0.3', '20,0.25', '5,0.4'];
  const dec = x => +(+x).toFixed(6);
  const fewDec = (x, n) => Math.abs(x * 10 ** (n || 2) - Math.round(x * 10 ** (n || 2))) < 1e-6;
  function fric(r) {
    for (let k = 0; k < 30; k++) {
      const m = r.pick([2, 4, 5, 8, 10, 20, 25, 50]), mu = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]);
      if (EX49.includes(m + ',' + mu)) continue;
      const f = dec(mu * m * G98);
      if (!fewDec(f, 1)) continue;
      return { m, mu, f };
    }
    return null;
  }
  const boxT = (m, mu) => `質量 $${U(m, 'kg')}$ の箱を、動摩擦係数 $\\mu'=${mu}$ の床の上で`;
  add({
    id: '8-49', chap: '8-7⑨ 例題6',
    exAns: ['-49', '-68.6', '9.8'],   // 左ページの例の答え（O-2）
    title: '摩擦の仕事：力がいつも道と反対で大きさ一定なら、$-$（力の大きさ）×（道のり）。積分しない',
    mark: '床の上で箱をすべらせて動かすときの、動摩擦力の仕事。「いつも進む向き」「いつも道と直角」の力も。',
    futsu: ['道を $\\vec r(t)$ で表し、摩擦力を', '$-\\mu\'mg\\dfrac{\\vec r\\,\'}{|\\vec r\\,\'|}$ と書いて', '内積を積分する'],
    raku: ['5 kg、$\\mu\'=0.2$ → 摩擦力 $0.2\\times5\\times9.8=9.8$ N', 'まっすぐ 5 m → $-9.8\\times5=-49$ J', '横 3 m・たて 4 m の L字 → $-9.8\\times7=-68.6$ J'],
    why: '動摩擦力は、いつも動く向きと反対で、大きさは $\\mu\'N$（床の上なら $N=mg$）で一定。1歩ごとの内積は $-$（力の大きさ）×（1歩の長さ）なので、たすと $-$（力の大きさ）×（道のり）になる（8-7⑨）。道の形は道のりだけに効く。いつも進む向きなら $+$、いつも道と直角なら内積が0で、仕事も0。',
    caution: '摩擦力は保存力ではない。遠回りするほど、行って帰るほど、仕事は大きく負になる（行って帰っても0にならない）。道のりは、はじめとおわりの点の距離ではなく、通った道の長さ。',
    counts: { s1: 3, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '20mm' },
    fits(q) { return /動摩擦|いつも(進む向き|道と直角|動く向きと反対)/.test(q); },
    steps: {
      // まっすぐ d m
      s1(r) {
        const fr = fric(r); if (!fr) return null;
        const d = r.pick([2, 3, 4, 5, 6, 8, 10]), W = dec(-fr.f * d);
        if (!fewDec(W, 1) || [-49, -68.6].includes(W) || cap(r, '49s1', W)) return null;
        return { q: `${boxT(fr.m, fr.mu)}、まっすぐ $${U(d, 'm')}$ すべらせて動かすとき、動摩擦力がする仕事（${gT}）`, a: `$${U(fmt(W), 'J')}$`, key: `49:${fr.m},${fr.mu},${d}`,
          easy: `摩擦力 $${fmt(fr.f)}$ N、$-${fmt(fr.f)}\\times${d}$`, easyCheck: false, verify: p => vNear(p, -fr.mu * fr.m * 9.8 * d, 1e-6) };
      },
      // L字・コの字・行って帰る
      s2(r) {
        const fr = fric(r); if (!fr) return null;
        const kind = turn(r, '49s2', 3), a = r.pick([2, 3, 4, 5, 6]), b = r.pick([1, 2, 3, 4]);
        const L = kind === 0 ? a + b : kind === 1 ? 2 * a + b : 2 * a;
        const how = kind === 0 ? `横に $${U(a, 'm')}$、たてに $${U(b, 'm')}$ の L字の道ですべらせて動かす` : kind === 1 ? `たてに $${U(a, 'm')}$、横に $${U(b, 'm')}$、たてに $${U(a, 'm')}$ もどるコの字の道ですべらせて動かす`
          : `まっすぐ $${U(a, 'm')}$ すべらせてから、同じ道でもとの場所までもどす`;
        const W = dec(-fr.f * L);
        if (!fewDec(W, 1) || W === -68.6 || cap(r, '49s2', W)) return null;
        return { q: `${boxT(fr.m, fr.mu)}、${how}とき、動摩擦力がする仕事（${gT}）`, a: `$${U(fmt(W), 'J')}$`, key: `49b:${fr.m},${fr.mu},${kind},${a},${b}`,
          easy: `道のり $${L}$ m、$-${fmt(fr.f)}\\times${L}$${kind === 2 ? '（もどっても0にならない）' : ''}`, easyCheck: false, verify: p => vNear(p, -fr.mu * fr.m * 9.8 * L, 1e-6) };
      },
      // 見かけがちがう：半円の道（π を残す）、いつも進む向きの力、いつも道と直角な力
      s3(r) {
        const kind = turn(r, '49s3', 3);
        if (kind === 0) {
          const fr = fric(r); if (!fr) return null;
          const R = r.pick([1, 2, 3, 5]);
          return { q: `${boxT(fr.m, fr.mu)}、半径 $${U(R, 'm')}$ の半円の道ですべらせて動かすとき、動摩擦力がする仕事（${gT}）`, a: `$${U(piD(-dec(fr.f * R)), 'J')}$`, key: `49c:${fr.m},${fr.mu},${R}`,
            easy: `道のり $${piD(R)}$ m（半円の長さ）`, easyCheck: false, verify: p => vNear(p, -fr.mu * fr.m * 9.8 * Math.PI * R, 1e-6) };
        }
        if (kind === 1) {
          const F = r.pick([5, 8, 10, 12, 15, 20]), L = r.pick([3, 4, 6, 8, 12, 15]);
          return { q: `ひもで、いつも進む向きに大きさ $${U(F, 'N')}$ の力で引き、曲がった道を $${U(L, 'm')}$ 動かすとき、ひもの力がする仕事`, a: `$${U(F * L, 'J')}$`, key: `49d:${F},${L}`,
            easy: `いつも同じ向きなので $+${F}\\times${L}$`, easyCheck: false, verify: p => vNear(p, F * L) };
        }
        const F = r.pick([3, 5, 8, 10]), R = r.pick([1, 2, 3]);
        if (cap(r, '49s3z', 0, 1)) return null;
        return { q: `ひもの先の玉が半径 $${U(R, 'm')}$ の円を1周するあいだ、いつも道と直角に中心へ向かう大きさ $${U(F, 'N')}$ のひもの力がする仕事`, a: `$${U(0, 'J')}$`, key: `49e:${F},${R}`,
          easy: '内積がいつも0', easyCheck: false, verify: p => vNear(p, 0) };
      },
      // わな：重力（保存力）が、曲がった坂を下る玉にする仕事 → 8-50
      trap(r) {
        const m = r.pick([1, 2, 3, 4, 5]), h = r.pick([2, 3, 4, 5, 10]);
        if (m === 2 && h === 5) return null;   // 教科書の数
        const W = dec(m * 9.8 * h);
        if (cap(r, '49t', W, 1)) return null;
        return dest({ q: `質量 $${U(m, 'kg')}$ の玉が、高さ $${U(h, 'm')}$ の所から曲がった坂をころがって地面まで下るとき、重力がする仕事（${gT}）`, a: `$${U(fmt(W), 'J')}$`, key: `49t:${m},${h}`,
          verify: p => vNear(p, m * 9.8 * h, 1e-6) }, '8-49', '重力は道と反対向きではなく、大きさ一定の下向き。保存力なので高さの差だけで決まる');
      },
    },
  });

  // ================================================================ 8-50
  // 例（左ページ）：40 kg が 25 m 登る −9800 J、$\vec F_1$ で (2, 1)→(1, 4) は 2。教科書の 50 kg・(30, 20)、(1, 2)→(3, 1)、(0, 2)→(2, 3) もよける（O-2）
  const h50 = (x, y) => 100 - 0.01 * x * x - 0.02 * y * y;
  const EXP50 = ['2,1>1,4', '1,2>3,1', '0,2>2,3'];
  // U の候補：[U の TeX, U(x, y), 場の項]
  const U50 = [
    a => [cf(-a, 'xy'), (x, y) => -a * x * y, Fyx(a, a)],
    a => [sum([cf(a, 'x^2'), cf(a, 'y^2')]), (x, y) => a * (x * x + y * y), [[[-2 * a, 1, 0]], [[-2 * a, 0, 1]]]],
    a => [cf(-a, 'x^2y'), (x, y) => -a * x * x * y, [[[2 * a, 1, 1]], [[a, 2, 0]]]],
    a => [sum([cf(a, 'x'), cf(-a, 'y^2')]), (x, y) => a * x - a * y * y, [[[-a, 0, 0]], [[2 * a, 0, 1]]]],
  ];
  add({
    id: '8-50', chap: '8-7⑨ 例題7・例題8',
    exAns: ['-9800', '2'],   // 左ページの例の答え（O-2）
    title: '保存力の仕事は $U(\\text{はじめ})-U(\\text{おわり})$：道によらない。閉じた道の1周は0',
    mark: '重力、$U$ が書いてある力（$\\vec F_1=(y,\\ x)$ と $U=-xy$ など）、「どんな道でも」。',
    futsu: ['道を1つ決めて $\\vec r(t)$ で表し、', '力と1歩の内積を作って', '定積分する'],
    raku: ['40 kg の人が 25 m 登る：重力の仕事', '$-40\\times9.8\\times25=-9800$ J', '$\\vec F_1$ で $(2,\\ 1)\\to(1,\\ 4)$：$U$ は $-2$ から $-4$、$-2-(-4)=2$'],
    why: '$\\vec F=-\\mathrm{grad}\\,U$ と書ける力（保存力）では、1歩の仕事 $\\vec F\\cdot\\dd\\vec r$ が $-\\dd U$（$U$ のへった分）になる。たすと、はじめとおわりの $U$ の差だけが残り、途中の道によらない（8-7⑨）。重力は $U=mgz$（$z$ は高さ）で、仕事は $mg\\times$（下がった高さ）。もとの点にもどれば $U$ の差は0。',
    caution: '引くのは「はじめ−おわり」（おわり−はじめではない）。登るときの重力の仕事は負、人がする仕事は正。$U$ が使えるのは保存力だけで、$\\vec F_2=(-y,\\ x)$ や摩擦力には使えない（道ごとに計算する）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '16mm', s3: '20mm', trap: '16mm' },
    fits(q) { return /U\s*=/.test(q) || (/重力/.test(q) && /高さ|登|下る/.test(q)) || /主役の山/.test(q); },
    steps: {
      // 重力（登る・下る）と、$\vec F_1=(y,\ x)$（$U=-xy$）
      s1(r) {
        if (turn(r, '50s1', 2) === 0) {
          const m = r.pick([2, 5, 10, 20, 30, 45, 50, 60]), h = r.pick([2, 3, 5, 10, 12, 20, 30]), up = r.chance(0.6);
          if (m === 40 && h === 25) return null;
          const W = dec((up ? -1 : 1) * m * 9.8 * h);
          if (cap(r, '50s1', W)) return null;
          const q = up ? `質量 $${U(m, 'kg')}$ の荷物を、地面から高さ $${U(h, 'm')}$ の所まで、どんな道で持ち上げても、重力がする仕事（${gT}）`
            : `質量 $${U(m, 'kg')}$ の荷物が、高さ $${U(h, 'm')}$ の所から地面まで、どんな道で下りても、重力がする仕事（${gT}）`;
          return { q, a: `$${U(fmt(W), 'J')}$`, key: `50:${m},${h},${up}`, easy: `$U=mgz$、$${up ? `0-${m}\\times9.8\\times${h}` : `${m}\\times9.8\\times${h}-0`}$`, easyCheck: false,
            verify: p => vNear(p, (up ? -1 : 1) * m * 9.8 * h, 1e-6) };
        }
        const P = [r.int(0, 3), r.int(0, 4)], Q = [r.int(0, 4), r.int(0, 3)];
        if (P + '' === Q + '' || EXP50.includes(P + '>' + Q)) return null;
        const W = -P[0] * P[1] + Q[0] * Q[1];
        if (W === 2 || cap(r, '50s1', W)) return null;
        return { q: `$\\vec F_1=(y,\\ x)$（$U=-xy$）が、点 $${pt(...P)}$ から点 $${pt(...Q)}$ まで、どんな道で動かしてもする仕事`, a: `$${W}$`, key: `50b:${P}:${Q}`,
          easy: `$U(${P.join(',\\ ')})-U(${Q.join(',\\ ')})=${-P[0] * P[1]}-(${-Q[0] * Q[1]})$`, easyCheck: false,
          verify: p => vNear(p, lineGL(Ffun(Fyx(1, 1)), [P, [P[0], Q[1]], Q])) };
      },
      // ほかの U（$\vec F=-\mathrm{grad}\,U$ と U を書く）
      s2(r) {
        const a = r.pick([1, 2, 3]), [UT, Uf, F] = U50[turn(r, '50s2', 4)](a);
        const P = [r.int(-1, 3), r.int(-1, 3)], Q = [r.int(-1, 3), r.int(-1, 3)];
        if (P + '' === Q + '') return null;
        const W = Uf(...P) - Uf(...Q);
        if (cap(r, '50s2', W, 1)) return null;
        return { q: `$\\vec F=${vecT(F)}$（$U=${UT}$）が、点 $${pt(...P)}$ から点 $${pt(...Q)}$ まで、どんな道で動かしてもする仕事`, a: `$${W}$`, key: `50c:${UT}:${P}:${Q}`,
          easy: `$U(\\text{はじめ})=${Uf(...P)}$、$U(\\text{おわり})=${Uf(...Q)}$`, easyCheck: false,
          verify: p => vNear(p, lineGL(Ffun(F), [P, [Q[0], P[1]], Q])) };
      },
      // 見かけがちがう：主役の山を登る人、もとの点にもどる道
      s3(r) {
        if (turn(r, '50s3', 3) < 2) {
          const x = r.pick([10, 20, 30, 40, 50]), y = r.pick([0, 10, 20, 30]), m = r.pick([40, 45, 50, 55, 60]), h = h50(x, y);
          if (h <= 0 || (x === 30 && y === 20) || (x === 40 && y === 10)) return null;
          const who = r.chance(0.5), W = dec((who ? 1 : -1) * m * 9.8 * (100 - h));
          return { q: `質量 $${U(m, 'kg')}$ の人が、主役の山 $h=100-0.01x^2-0.02y^2$〔m〕の点 $${pt(x, y)}$ から頂上まで、ゆっくり登るとき、${who ? '人' : '重力'}がする仕事（${gT}）`,
            a: `$${U(fmt(W), 'J')}$`, key: `50d:${x},${y},${m},${who}`, easy: `$h(${x},\\ ${y})=${fmt(h)}$、$${m}\\times9.8\\times${fmt(100 - h)}$${who ? '' : ' の負'}`, easyCheck: false,
            verify: p => vNear(p, (who ? 1 : -1) * m * 9.8 * (100 - (100 - 0.01 * x * x - 0.02 * y * y)), 1e-6) };
        }
        const a = r.pick([1, 2, 3]), [UT, , F] = U50[r.int(0, 3)](a), P = [r.int(1, 3), r.int(1, 3)];
        return { q: `$\\vec F=${vecT(F)}$（$U=${UT}$）が、点 $${pt(...P)}$ を出て、どんな道を通っても、もとの点 $${pt(...P)}$ にもどるまでにする仕事`, a: '$0$', key: `50e:${UT}:${P}`,
          easy: 'はじめとおわりの $U$ が同じ', easyCheck: false, verify: p => vNear(p, 0) };
      },
      // わな：保存力でない力（U がない）の道Aの仕事 → 8-45
      trap(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, 4]), onA = r.chance(0.5);
        if (a === 1 && b === 1) return null;   // 教科書の F2 の例
        const F = Fw(a, b), path = onA ? PA : PB;
        return dest(lineP('8-50', { q: `$\\vec F=${vecT(F)}$ が、${onA ? PAT : PBT} でする仕事`, a: `$${fracT(lineInt(F, path))}$`, key: `50t:${a},${b},${onA}` }, F, path), '8-50',
          '$(-ay,\\ bx)$ は保存力でない（$U$ がない）。道ごとに計算する');
      },
    },
  });

  // ================================================================ 8-51
  // 針金の質量 ∫λ ds（円弧は ds = R dθ）。答えは「π の項＋数の項」
  const lamT = (a, b, fn) => sum([fmt(a), cf(b, `\\${fn}\\theta`)]);
  function mixT(cpi, c0) {   // cpi π + c0
    const p = Math.abs(cpi) < 1e-12 ? '' : piT(cpi), z = Math.abs(c0) < 1e-12 ? '' : fracT(c0);
    return sum([p, z]);
  }
  const kgT = t => (/[+-]/.test(t.slice(1)) ? `$(${t})\\,\\mathrm{kg}$` : `$${U(t, 'kg')}$`);
  const EX51 = ['2\\pi+4'];   // 左ページの例の答え（O-2）
  // 円弧の針金：θ は th0〜th1、λ = a + b sinθ（fn 'sin'）か a + b cosθ
  const arcMass = (R, a, b, fn, th0, th1) => gln(t => (a + b * Math[fn](t)) * R, Math.min(th0, th1), Math.max(th0, th1), 8);
  add({
    id: '8-51', chap: '8-7⑧ 例題9',
    exAns: ['2\\pi+4'],   // 左ページの例の答え（O-2）
    title: '長さでたす $\\int_C\\lambda\\,\\dd s$：円なら $\\dd s=R\\,\\dd\\theta$。向きによらない',
    mark: '針金の質量（1 m あたりの質量 $\\lambda$ が場所で変わる）。',
    futsu: ['針金を細かく切って、', '1本ずつ「長さ×その所の $\\lambda$」を', '計算して、たす'],
    raku: ['半径 2 m の半円、$\\lambda=1+\\sin\\theta$：', '$\\int_0^{\\pi}(1+\\sin\\theta)\\times2\\,\\dd\\theta$', '$=2(\\pi+2)=2\\pi+4$'],
    why: '針金にそって「$\\lambda$×1歩の長さ $\\dd s$」をたす（8-7⑧）。$\\dd s=|\\vec r\\,\'(t)|\\,\\dd t$ で、円なら $|(-R\\sin\\theta,\\ R\\cos\\theta)|=R$ なので $\\dd s=R\\,\\dd\\theta$。まっすぐな針金は、長さ $L$ の線分なら $\\dd s=L\\,\\dd t$（三平方）。質量には向きがないので、どちら向きにたどっても同じ値。',
    caution: '$\\dd s$ の $R$ を忘れない（$\\dd\\theta$ は長さではない）。逆向きにたどっても、はしを逆にせず、小さいほうから大きいほうへ積分する（$\\dd s$ はいつも正）。半円では $\\int_0^{\\pi}\\cos\\theta\\,\\dd\\theta=0$、$\\int_0^{\\pi}\\sin\\theta\\,\\dd\\theta=2$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '16mm' },
    fits(q) { return /針金/.test(q); },
    steps: {
      // 半円・4分の1円、λ = a + b sinθ・a + b cosθ
      s1(r) {
        const R = r.pick([1, 2, 3, 4, 0.5]), half = turn(r, '51s1', 2) === 0, fn = r.pick(['sin', 'cos']), a = r.pick([1, 2, 3, 4]), b = r.pick([1, 2, 3]);
        const span = half ? Math.PI : Math.PI / 2, S = half ? (fn === 'sin' ? 2 : 0) : 1;
        if (half && fn === 'cos' && cap(r, '51cos', 1, 1)) return null;   // 半円の cos は 0 になる（1問まで）
        const ans = mixT(R * a * span / Math.PI, R * b * S);
        if (EX51.includes(ans) || cap(r, '51s1', ans, 1)) return null;
        return withCalc('8-51', { q: `半径 $${U(R, 'm')}$ の${half ? '半円' : '4分の1円'}の形の針金（$\\theta$ が $0$ から $${half ? '\\pi' : '\\frac{\\pi}{2}'}$）、1 m あたりの質量 $\\lambda=${lamT(a, b, fn)}$〔kg/m〕の質量`,
          a: kgT(ans), key: `51:${R},${half},${fn},${a},${b}`, easy: `$\\dd s=${R === 1 ? '' : fmt(R) + '\\,'}\\dd\\theta$、$\\int_0^{${half ? '\\pi' : '\\pi/2'}}(${lamT(a, b, fn)})\\times${fmt(R)}\\,\\dd\\theta$`, easyCheck: false,
          verify: p => vNear(p, arcMass(R, a, b, fn, 0, span)) },
        { kind: 'line', r: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, half ? 'pi' : 'pi/2'], f: `${a}+${b}*${fn}(t)`, ds: true });
      },
      // まっすぐな針金（λ = a + b x）、円1周（λ = a + b cosθ）
      s2(r) {
        if (turn(r, '51s2', 3) < 2) {
          const L = r.pick([1, 2, 3, 4]), a = r.pick([0.5, 1, 2, 3]), b = r.pick([0.5, 1, 2, 3]), v = a * L + b * L * L / 2;
          if (cap(r, '51s2', v, 1)) return null;
          return withCalc('8-51', { q: `$x$ 軸の上の、$x=0$ から $x=${L}$〔m〕までのまっすぐな針金、1 m あたりの質量 $\\lambda=${sum([fmt(a), cf(b, 'x')])}$〔kg/m〕の質量`,
            a: kgT(numT(v)), key: `51b:${L},${a},${b}`, easy: `$\\dd s=\\dd x$、$\\int_0^{${L}}(${sum([fmt(a), cf(b, 'x')])})\\,\\dd x$`, easyCheck: false,
            verify: p => vNear(p, gl(x => a + b * x, 0, L)) }, { kind: 'line', r: ['t', '0'], t: [0, L], f: `${a}+${b}*x`, ds: true });
        }
        const R = r.pick([1, 2, 3, 0.5]), a = r.pick([1, 2, 3, 4]), b = r.pick([1, 2]), fn = r.pick(['sin', 'cos']), ans = piT(2 * R * a);
        if (cap(r, '51s2', ans, 1)) return null;
        return withCalc('8-51', { q: `半径 $${U(R, 'm')}$ の円の形の針金（1周）、角 $\\theta$ の所の1 m あたりの質量 $\\lambda=${lamT(a, b, fn)}$〔kg/m〕の質量`,
          a: kgT(ans), key: `51c:${R},${a},${b},${fn}`, easy: `$\\int_0^{2\\pi}\\${fn}\\theta\\,\\dd\\theta=0$ なので $${fmt(a)}\\times2\\pi\\times${fmt(R)}$`, easyCheck: false,
          verify: p => vNear(p, arcMass(R, a, b, fn, 0, 2 * Math.PI)) }, { kind: 'line', r: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, '2*pi'], f: `${a}+${b}*${fn}(t)`, ds: true });
      },
      // 見かけがちがう：ななめの針金（三平方）、逆向きにたどる半円
      s3(r) {
        if (turn(r, '51s3', 2) === 0) {
          const [p, q, L] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [8, 6, 10]]), a = r.pick([1, 2, 3]), b = r.pick([0.5, 1, 2]);
          const v = L * (a + b * p / 2), back = r.chance(0.5);
          const P = back ? [p, q] : [0, 0], Q = back ? [0, 0] : [p, q];
          return withCalc('8-51', { q: `点 $${pt(...P)}$ から点 $${pt(...Q)}$ までのまっすぐな針金（長さの単位は m）、1 m あたりの質量 $\\lambda=${sum([fmt(a), cf(b, 'x')])}$〔kg/m〕の質量`,
            a: kgT(numT(v)), key: `51d:${p},${q},${a},${b},${back}`, easy: `$\\vec r=(${p}t,\\ ${q}t)$、$\\dd s=${L}\\,\\dd t$、$\\int_0^1(${sum([fmt(a), cf(b * p, 't')])})\\times${L}\\,\\dd t$`, easyCheck: false,
            verify: p2 => vNear(p2, gl(t => (a + b * p * t) * L, 0, 1)) }, { kind: 'line', path: [P, Q], f: `${a}+${b}*x`, ds: true });
        }
        const R = r.pick([1, 2, 3]), a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3]), ans = mixT(R * a, 2 * R * b);
        if (EX51.includes(ans)) return null;
        return withCalc('8-51', { q: `半径 $${U(R, 'm')}$ の半円の形の針金を、点 $${pt(-R, 0)}$ から点 $${pt(R, 0)}$ まで右回りにたどる。角 $\\theta$ の所の1 m あたりの質量 $\\lambda=${lamT(a, b, 'sin')}$〔kg/m〕で、針金の質量`,
          a: kgT(ans), key: `51e:${R},${a},${b}`, easy: '向きによらない。$\\theta$ は $0$ から $\\pi$ で積分', easyCheck: false,
          verify: p => vNear(p, arcMass(R, a, b, 'sin', Math.PI, 0)) }, { kind: 'line', r: [`${R}*cos(t)`, `${R}*sin(t)`], t: [0, 'pi'], f: `${a}+${b}*sin(t)`, ds: true });   // core の ds は t を逆に回すと負になるので、小さいほうから（エンジンへの要望に書いた）
      },
      // わな：半円の道で力がする仕事（向きのある量）→ 8-47
      trap(r) {
        const a = r.pick([1, 2, 3]), R = r.pick([1, 2, 3]), F = Fw(a, a);
        if (a === 1 && R === 2) return null;   // 教科書の数
        return dest(circP('8-51', { q: `$\\vec F=${vecT(F)}$ の力が、原点が中心で半径 $${R}$ の円の上半分を、点 $${pt(R, 0)}$ から点 $${pt(-R, 0)}$ まで左回りに進む道でする仕事`, a: `$${piT(a * R * R)}$`, key: `51t:${a},${R}` }, F, R, 0, Math.PI),
          '8-51', '長さでたす量ではなく、力と1歩の内積をたす（向きのある量）');
      },
    },
  });

  // ================================================================ 8-52
  // p-V 図の仕事（kPa × L ＝ J）。例（左ページ）：1 L・300 kPa → 3 L・100 kPa の 600・200・400 J。教科書の (1, 200)→(3, 100)、(2, 300)→(5, 100)、(1, 400)→(4, 100) もよける
  const EX52 = ['1,300,3,100', '1,200,3,100', '2,300,5,100', '1,400,4,100'];
  const LkPa = (V, p) => `$${U(V, 'L')}$・$${U(p, 'kPa')}$`;
  add({
    id: '8-52', chap: '8-7⑩ 例題11',
    exAns: ['600', '200', '400'],   // 左ページの例の答え（O-2）
    title: '$p$-$V$ 図の仕事：体積が変わらない区間は0、圧力一定の区間は $p\\times$（体積の変化）、まっすぐな区間は台形。kPa×L＝J',
    mark: '$p$-$V$ 図の上の道で、気体がする仕事 $\\int p\\,\\dd V$。',
    futsu: ['道を $V$ の式 $p(V)$ で表し、', '$\\int p(V)\\,\\dd V$ を、単位を', 'Pa と m$^3$ に直して計算する'],
    raku: ['1 L・300 kPa → 3 L・100 kPa', '300 kPa のままふくらむ道：$300\\times2=600$ J', 'まっすぐ：$\\dfrac{300+100}{2}\\times2=400$ J'],
    why: '気体がする仕事は、$p$-$V$ 図の道にそって $p\\times\\dd V$ をたしたもの（8-7⑩）。体積が変わらない区間は $\\dd V=0$ で0。圧力が一定の区間は長方形の面積 $p\\times\\Delta V$、まっすぐな区間は台形の面積。$1\\,\\mathrm{kPa}\\times1\\,\\mathrm L=10^3\\times10^{-3}=1\\,\\mathrm J$ なので、kPa と L のまま計算すれば J になる。',
    caution: '同じはじめとおわりでも、道で仕事が変わる（保存力の $U$ のような差では書けない）。体積がへる（ちぢむ）区間の仕事は負。1周する道（閉じた道）の仕事は、道がかこむ面積（右回りなら正）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '16mm' },
    fits(q) { return /kPa/.test(q) && /\\mathrm\{L\}/.test(q); },
    steps: {
      // 圧力一定（ふくらむ・ちぢむ）
      s1(r) {
        const p = r.pick([100, 150, 200, 250, 300, 400, 500]), V1 = r.int(1, 5), V2 = r.intNot(1, 6, v => v === V1), W = p * (V2 - V1);
        if ([600, 200, 400].includes(W) || cap(r, '52s1', W)) return null;
        return { q: `圧力 $${U(p, 'kPa')}$ のまま、気体の体積が $${U(V1, 'L')}$ から $${U(V2, 'L')}$ まで変わるとき、気体がする仕事`, a: `$${U(W, 'J')}$`, key: `52:${p},${V1},${V2}`,
          easy: `$${p}\\times(${V2}-${V1})$${V2 < V1 ? '（ちぢむので負）' : ''}`, easyCheck: false, verify: q => vNear(q, gl(() => p * 1e3, V1 * 1e-3, V2 * 1e-3)) };
      },
      // はじめとおわりが同じ3つの道（どれか1つ）
      s2(r) {
        const V1 = r.int(1, 3), V2 = V1 + r.int(1, 3), p1 = r.pick([200, 300, 400, 500]), p2 = r.pick([100, 200, 300]);
        if (p2 >= p1 || EX52.includes([V1, p1, V2, p2].join(','))) return null;
        const kind = turn(r, '52s2', 3), dV = V2 - V1, W = [p1 * dV, p2 * dV, (p1 + p2) / 2 * dV][kind];
        if ([600, 200, 400].includes(W) || cap(r, '52s2', W, 1)) return null;
        const how = ['圧力を変えずにふくらんでから、体積を変えずに圧力が下がる道', '体積を変えずに圧力が下がってから、圧力を変えずにふくらむ道', '$p$-$V$ 図でまっすぐな道'][kind];
        return { q: `${LkPa(V1, p1)} の状態から ${LkPa(V2, p2)} の状態へ、${how}で変わるとき、気体がする仕事`, a: `$${U(W, 'J')}$`, key: `52b:${V1},${p1},${V2},${p2},${kind}`,
          easy: [`$${p1}\\times${dV}+0$`, `$0+${p2}\\times${dV}$`, `台形 $\\dfrac{${p1}+${p2}}{2}\\times${dV}$`][kind], easyCheck: false,
          verify: q => vNear(q, gl(V => [p1, p2, p1 + (p2 - p1) * (V - V1) / dV][kind], V1, V2)) };
      },
      // 見かけがちがう：1周する道（長方形）、まっすぐにちぢむ道
      s3(r) {
        const V1 = r.int(1, 3), V2 = V1 + r.int(1, 3), pH = r.pick([200, 300, 400, 500]), pL = r.pick([100, 150, 200]);
        if (pL >= pH) return null;
        const dV = V2 - V1;
        if (turn(r, '52s3', 2) === 0) {
          const cw = r.chance(0.6), W = (cw ? 1 : -1) * (pH - pL) * dV;
          const path = cw ? `圧力 $${U(pH, 'kPa')}$ のまま $${U(V2, 'L')}$ までふくらみ、体積を変えずに $${U(pL, 'kPa')}$ まで下がり、圧力を変えずに $${U(V1, 'L')}$ までちぢみ、体積を変えずにもとにもどる`
            : `体積を変えずに $${U(pL, 'kPa')}$ まで下がり、圧力を変えずに $${U(V2, 'L')}$ までふくらみ、体積を変えずに $${U(pH, 'kPa')}$ まで上がり、圧力を変えずにもとの $${U(V1, 'L')}$ までちぢむ`;
          return { q: `気体が ${LkPa(V1, pH)} の状態から、${path}。この1周で気体がする仕事`, a: `$${U(W, 'J')}$`, key: `52c:${V1},${V2},${pH},${pL},${cw}`,
            easy: `${cw ? '右回り' : '左回り'}：かこむ長方形 $${pH - pL}\\times${dV}$${cw ? '' : ' の負'}`, easyCheck: false,
            verify: q => vNear(q, cw ? pH * dV + 0 - pL * dV + 0 : 0 + pL * dV + 0 - pH * dV) };
        }
        const W = -(pH + pL) / 2 * dV;
        return { q: `${LkPa(V2, pL)} の状態から ${LkPa(V1, pH)} の状態へ、$p$-$V$ 図でまっすぐな道でちぢむとき、気体がする仕事`, a: `$${U(fmt(W), 'J')}$`, key: `52d:${V1},${V2},${pH},${pL}`,
          easy: `台形 $\\dfrac{${pL}+${pH}}{2}\\times${dV}$ の負（体積がへる）`, easyCheck: false,
          verify: q => vNear(q, gl(V => pL + (pH - pL) * (V2 - V) / dV, V2, V1)) };
      },
      // わな：シリンダーの体積のずれ（誤差の割合）→ 8-17
      trap(r) {
        const a = r.pick([1, 2, 3]), b = r.pick([1, 2, 3, 4]);
        if (a === 1 && b === 3) return null;   // 8-17 の例
        return dest({ q: `円柱のシリンダーの体積 $V=\\pi r^2h$ で、半径 $r$ を${a}％、高さ $h$ を${b}％ 大きくはかったとき、$V$ は何％大きくなるか`, a: `約${2 * a + b}％`, key: `52t:${a},${b}`,
          verify: p => (p.a === `約${2 * a + b}％` && Math.abs(((1 + a / 100) ** 2 * (1 + b / 100) - 1) * 100 - (2 * a + b)) < 0.5) || '割合がちがう' }, '8-52',
        '仕事ではなく、はかった値のずれの割合（全微分）。$r$ は2乗なので2倍してたす', ['8-17']);
      },
    },
  });

  // ================================================================ 8-53
  // 一様な流れが平らな面を通る量 vA cosθ。例（左ページ）：2 m/s・0.5 m²・60° → 0.5、屋根 10 m×6 m・5 mm → 0.3。教科書の 1.5・0.4、3・0.2 もよける
  const COS = { 0: [1, '1'], 60: [0.5, '0.5'], 90: [0, '0'], 30: [0.866, '0.866'], 45: [0.707, '0.707'] };
  const deg = d => `${d}^{\\circ}`;
  const round = (x, n) => Math.round(x * 10 ** n + 1e-9) / 10 ** n;
  // O-4：文の値で計算した答えと、ほんとうの値を丸めた答えが同じか
  const o4 = (vA, d, n) => round(vA * COS[d][0], n) === round(vA * Math.cos(d * Math.PI / 180), n);
  add({
    id: '8-53', chap: '8-8①④ 例題1・例題3',
    exAns: ['0.5', '0.3'],   // 左ページの例の答え（O-2）
    title: '一様な流れが平らな面を通る量は $vA\\cos\\theta$：流れに直角な影の面積で決まる',
    mark: 'どこでも同じ流れが、網・屋根などの平らな面を通る量（「□° かたむいた」）。',
    futsu: ['面を小さなタイルに分け、', 'タイルごとに $\\vec v\\cdot\\vec n\\times$（面積）を', '計算してたす（面積分）'],
    raku: ['2 m/s、網 0.5 m²、$\\vec n$ と流れが $60^{\\circ}$', '→ $2\\times0.5\\times0.5=0.5$ m³/s（$90^{\\circ}$ なら0）', '屋根：上から 10 m×6 m、雨 5 mm → $0.005\\times60=0.3$ m³'],
    why: '面を通りぬけるのは、流れの面に直角な成分 $\\vec v\\cdot\\vec n=v\\cos\\theta$ だけ（$\\theta$ は面に直角な向き $\\vec n$ と流れの角。8-8①）。流れも面の向きもどこでも同じなら、タイルごとの値がみな同じなので、積分しないで $vA\\cos\\theta$。$A\\cos\\theta$ は、流れに直角な面への影の面積。真下に降る雨なら、上から見た面積だけで決まる（8-8④）。',
    caution: '$\\theta$ は「面と流れ」の角ではなく「面に直角な向きと流れ」の角。面と流れが $30^{\\circ}$ なら、$\\vec n$ と流れは $60^{\\circ}$。かたむいた屋根の本当の面積は大きいが、受ける雨の量は上から見た面積で決まる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '24mm' },
    fits(q) { return /網|屋根|パネル|穴/.test(q) && /どこでも|雨|光/.test(q) && !/窓|v=.*[xz]|立体角|円すい/.test(q); },
    steps: {
      // 角 0°・60°・90°
      s1(r) {
        const v = r.pick([1, 2, 2.5, 3, 4, 5]), A = r.pick([0.2, 0.4, 0.5, 0.6, 0.8, 1.2]), d = r.pick([0, 60, 60, 90]);
        if ((v === 2 && A === 0.5) || (v === 1.5 && A === 0.4) || (v === 3 && A === 0.2)) return null;
        const Q = dec(v * A * COS[d][0]);
        if (cap(r, '53s1', Q, d === 90 ? 1 : 2) || (d === 90 && cap(r, '53s1z', 0, 1))) return null;
        return { q: `どこでも $${U(v, 'm/s')}$ で流れる水が、面積 $${U(A, 'm^2')}$ の網を1秒間に通る量（網に直角な向きと流れの角は $${deg(d)}$）`, a: `$${U(fmt(Q), 'm^3/s')}$`, key: `53:${v},${A},${d}`,
          easy: `$${fmt(v)}\\times${fmt(A)}\\times\\cos${deg(d)}=${fmt(v)}\\times${fmt(A)}\\times${COS[d][1]}$`, easyCheck: false,
          verify: p => vNear(p, v * A * Math.cos(d * Math.PI / 180), 1e-9) };
      },
      // 角 30°・45°（値を文に）、屋根の雨
      s2(r) {
        if (turn(r, '53s2', 3) < 2) {
          const v = r.pick([1, 2, 3, 4, 5]), A = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8]), d = r.pick([30, 45]);
          if ((v === 3 && A === 0.2) || !o4(v * A, d, 2)) return null;
          const Q = round(v * A * COS[d][0], 2);
          if (cap(r, '53s2', Q)) return null;
          return { q: `どこでも $${U(v, 'm/s')}$ で流れる水が、面積 $${U(A, 'm^2')}$ の網を1秒間に通る量（網に直角な向きと流れの角は $${deg(d)}$。$\\cos${deg(d)}=${COS[d][1]}$ として、小数第2位まで）`,
            a: `約 $${U(Q.toFixed(2), 'm^3/s')}$`, key: `53b:${v},${A},${d}`, easy: `$${v}\\times${fmt(A)}\\times${COS[d][1]}\\approx${Q.toFixed(2)}$`, easyCheck: false,
            verify: p => (p.a.startsWith('約') && near(ansNum(p.a), Math.round(v * A * Math.cos(d * Math.PI / 180) * 100) / 100)) || '近似の答えがちがう' };
        }
        const a = r.pick([4, 5, 6, 8, 10, 12]), b = r.pick([3, 4, 5, 6]), mm = r.pick([2, 3, 4, 5, 6, 10]), d = r.pick([20, 30, 40, 45]);
        if ((a === 10 && b === 6 && mm === 5) || (a === 8 && b === 5) || (a === 12 && b === 5)) return null;
        const V = dec(mm / 1000 * a * b);
        if (cap(r, '53s2', V)) return null;
        return { q: `上から見ると $${U(a, 'm')}$×$${U(b, 'm')}$ の長方形で、$${deg(d)}$ かたむいた屋根に、雨が真下に1時間に $${U(mm, 'mm')}$ の強さで降る。1時間に屋根が受ける雨水の量`,
          a: `$${U(fmt(V), 'm^3')}$`, key: `53c:${a},${b},${mm},${d}`, easy: `上から見た面積 $${a * b}$ m² だけで決まる。$${fmt(mm / 1000)}\\times${a * b}$`, easyCheck: false,
          verify: p => vNear(p, (mm / 1000) * (a * b / Math.cos(d * Math.PI / 180)) * Math.cos(d * Math.PI / 180), 1e-9) };
      },
      // 見かけがちがう：「面と流れの角」で書く、太陽電池パネル
      s3(r) {
        if (turn(r, '53s3', 2) === 0) {
          const v = r.pick([1, 2, 3, 4]), A = r.pick([0.2, 0.4, 0.5, 0.6, 1.5]), ph = r.pick([30, 90, 60]);
          const d = 90 - ph;
          if (d === 30 && !o4(v * A, 30, 2)) return null;
          const Q = d === 30 ? round(v * A * 0.866, 2) : dec(v * A * COS[d][0]);
          return { q: `どこでも $${U(v, 'm/s')}$ で流れる水の中に、面積 $${U(A, 'm^2')}$ の網を、網の面と流れの角が $${deg(ph)}$ になるように入れた。1秒間に網を通る量${d === 30 ? '（$\\cos30^{\\circ}=0.866$ として、小数第2位まで）' : ''}`,
            a: d === 30 ? `約 $${U(Q.toFixed(2), 'm^3/s')}$` : `$${U(fmt(Q), 'm^3/s')}$`, key: `53d:${v},${A},${ph}`, easy: `$\\vec n$ と流れの角は $${deg(d)}$`, easyCheck: false,
            verify: p => near(ansNum(p.a), d === 30 ? Math.round(v * A * Math.cos(Math.PI / 6) * 100) / 100 : v * A * Math.cos(d * Math.PI / 180)) || '答えがちがう' };
        }
        const I = r.pick([800, 1000]), A = r.pick([1, 1.2, 1.5, 2.4]), d = r.pick([0, 60]), W = dec(I * A * COS[d][0]);
        if (W === I) return null;   // かっこの値がそのまま答えにならないように（S-4）
        return { q: `$1\\,\\mathrm{m^2}$ あたり $${U(I, 'W')}$ の太陽の光（どこでも同じ向き）が、面積 $${U(A, 'm^2')}$ のパネルに当たる。パネルに直角な向きと光の角が $${deg(d)}$ のとき、パネルが受ける光の量`,
          a: `$${U(fmt(W), 'W')}$`, key: `53e:${I},${A},${d}`, easy: `$${I}\\times${fmt(A)}\\times${COS[d][1]}$`, easyCheck: false, verify: p => vNear(p, I * A * Math.cos(d * Math.PI / 180), 1e-9) };
      },
      // わな：高さで強さが変わる風が窓を通る量 → 8-55
      trap(r) {
        const w = r.pick([1, 2, 3]), H = r.pick([1, 2]), a = r.pick([0.5, 1, 1.5]), b = r.pick([0.2, 0.4, 0.5, 1]);
        const Q = dec((a + b * H / 2) * w * H);
        if (EX55.includes([w, H, a, b].join(','))) return null;
        return dest({ q: `${winT(w, H)}を直角に通りぬける風の量（1秒間）。下の辺から高さ $z$〔m〕の所の速さは $v=${sum([fmt(a), cf(b, 'z')])}$〔m/s〕`,
          a: `$${U(fmt(Q), 'm^3/s')}$`, key: `53t:${w},${H},${a},${b}`, verify: p => vNear(p, gl(z => (a + b * z) * w, 0, H), 1e-9) }, '8-53', '風が場所（高さ）で変わるので、一様な流れではない。ふつうの定積分に直す');
      },
    },
  });

  // ================================================================ 8-54
  // 座標軸と p・q・r で交わる平面 x/p + y/q + z/r = 1 の三角形。A n = (qr, rp, pq)/2
  const lcm = (a, b) => a / gcd(a, b) * b;
  function planeT(p, q, r) {
    const L = lcm(lcm(p, q), r), c = [L / p, L / q, L / r], g = gcd(gcd(gcd(c[0], c[1]), c[2]), L);
    return `${sum([cf(c[0] / g, 'x'), cf(c[1] / g, 'y'), cf(c[2] / g, 'z')])}=${L / g}`;
  }
  const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
  // 頂点から外積で（検算。問題を作った (qr, rp, pq)/2 とは別の道すじ）
  const An = (p, q, r) => cross([-p, q, 0], [-p, 0, r]).map(x => x / 2);
  const EX54 = [[2, 4, 2], [4, 2, 2], [2, 3, 6], [3, 6, 3]];   // 左ページの例・教科書の三角形（入れかえ・何倍かもよける。O-2）
  // 3つの切片（どの2つの積も偶数で、A n が整数）
  function pqr54(r) {
    for (let k = 0; k < 40; k++) {
      const v = [r.pick([1, 2, 3, 4, 6]), r.pick([1, 2, 3, 4, 6]), r.pick([1, 2, 3, 4, 6])];
      if ((v[1] * v[2]) % 2 || (v[0] * v[2]) % 2 || (v[0] * v[1]) % 2) continue;
      if (EX54.some(e => likeEx(v, e))) continue;
      return v;
    }
    return null;
  }
  function sqrtT(N) {   // √N を外に出せる数を出した形に
    let out = 1, inn = N;
    for (let f = 2; f * f <= inn; f++) while (inn % (f * f) === 0) { inn /= f * f; out *= f; }
    return inn === 1 ? String(out) : `${out === 1 ? '' : out}\\sqrt{${inn}}`;
  }
  const v3 = v => `(${v.map(fmt).join(',\\ ')})`;
  const triQ = (p, q, r) => `平面 $${planeT(p, q, r)}$ の、座標軸で切りとられた三角形`;
  const flow54 = r => [r.pick([1, 2, 3]), r.pick([0, 1, 2, -1]), r.pick([1, 2, 1, 3])];
  add({
    id: '8-54', chap: '8-8④ 例題2',
    exAns: ['(4,\\ 2,\\ 4)', '6', '10'],   // 左ページの例の答え（O-2）
    title: 'ななめの三角形：2つの辺の外積の半分が $A\\vec n$（面積と向きが一度に出る）',
    mark: '平面 $ax+by+cz=d$ の、座標軸で切りとられた三角形の面積ベクトル・面積・流れが通る量。',
    futsu: ['3つの辺の長さを三平方で出し、', 'ヘロンの公式などで面積を出し、', '法線の向きは別に求める'],
    raku: ['$2x+y+2z=4$ → 頂点 $(2,\\ 0,\\ 0)$、$(0,\\ 4,\\ 0)$、$(0,\\ 0,\\ 2)$', '辺 $(-2,\\ 4,\\ 0)$ と $(-2,\\ 0,\\ 2)$ の外積 $(8,\\ 4,\\ 8)$', 'の半分 $A\\vec n=(4,\\ 2,\\ 4)$、面積6。$(1,\\ 1,\\ 1)$ なら $10$'],
    why: '2つの辺のベクトルの外積は、長さが平行四辺形の面積、向きが面に直角（4-14）。その半分が三角形の面積ベクトル $A\\vec n$ で、長さが面積、向きが $\\vec n$（8-8④）。どこでも同じ流れなら、通る量は $\\vec F\\cdot(A\\vec n)$ で、面積も角度も別に求めなくてよい。切片が $p$・$q$・$r$ なら $A\\vec n=\\frac12(qr,\\ rp,\\ pq)$。',
    caution: '外積の向きは辺の順で変わる。原点から遠ざかる向き（どの成分も正）になっているか確かめる。面積は $A\\vec n$ の長さ（成分をたしたものではない）。平面の式の係数 $(a,\\ b,\\ c)$ は $\\vec n$ と同じ向きだが、長さは面積ではない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '20mm', s3: '20mm', trap: '20mm' },
    fits(q) {
      if (!/三角形/.test(q) || /球|おわん|ドーム/.test(q)) return false;
      const F = /\\vec F=\(([^)]*)\)/.exec(q);
      if (F && /[xyz]/.test(F[1])) return false;
      return /平面 \$[^$]*x[^$]*y[^$]*z=\d+\$|図の三角形/.test(q);
    },
    steps: {
      // 面積ベクトル
      s1(r) {
        const v = pqr54(r); if (!v) return null;
        const [p, q, z] = v, A = [q * z / 2, z * p / 2, p * q / 2];
        if (cap(r, '54s1', A.join(','), 1)) return null;
        return { q: `${triQ(p, q, z)}の面積ベクトル $A\\vec n$（原点から遠ざかる向き）`, a: `$${v3(A)}$`, key: `54:${v}`,
          easy: `頂点 $(${p},\\ 0,\\ 0)$、$(0,\\ ${q},\\ 0)$、$(0,\\ 0,\\ ${z})$。$\\frac12(${-p},\\ ${q},\\ 0)\\times(${-p},\\ 0,\\ ${z})$`, easyCheck: false,
          calc: { kind: 'vec', want: An(p, q, z) } };
      },
      // どこでも同じ流れが通る量・面積
      s2(r) {
        const v = pqr54(r); if (!v) return null;
        const [p, q, z] = v, A = An(p, q, z);
        if (turn(r, '54s2', 3) < 2) {
          const F = flow54(r), Q = dot(F, A);
          if (Q === 10 || cap(r, '54s2', Q)) return null;
          return { q: `どこでも同じ流れ $\\vec F=${v3(F)}$ が、${triQ(p, q, z)}を、原点から遠ざかる向きに通りぬける量`, a: `$${fmt(Q)}$`, key: `54b:${v}:${F}`,
            easy: `$A\\vec n=${v3(A)}$、内積 $${v3(F)}\\cdot${v3(A)}$`, easyCheck: false, verify: pp => vNear(pp, dot(F, [q * z / 2, z * p / 2, p * q / 2])) };
        }
        const N = dot(A, A);
        if (!Number.isInteger(N) || N === 36) return null;
        return { q: `${triQ(p, q, z)}の面積`, a: `$${sqrtT(N)}$`, key: `54c:${v}`, easy: `$A\\vec n=${v3(A)}$ の長さ $\\sqrt{${N}}$`, easyCheck: false,
          verify: pp => vNear(pp, Math.sqrt(dot(A, A))) };
      },
      // 見かけがちがう：立体の図（3本の軸と三角形）
      s3(r) {
        const v = pqr54(r); if (!v || Math.max(...v) > 2 * Math.min(...v)) return null;   // 図で三角形がつぶれないように、切片の比は2まで
        const [p, q, z] = v, A = An(p, q, z), F = flow54(r), Q = dot(F, A);
        if (Q === 10 || cap(r, '54s3', Q, 1)) return null;
        // x 軸を左下（手前）、y 軸を右、z 軸を上にかく（斜投影。M.proj3 に (y, x, z) を入れて、x の向きを 210°に）
        const s = 2.6 / Math.max(p * 0.8, q, z), P3 = ([x, y, zz]) => M.proj3([y, x, zz], 0.8, 210), X = [p * s, 0, 0], Y = [0, q * s, 0], Z = [0, 0, z * s];
        const its = [['poly', [P3(X), P3(Y), P3(Z)], { fill: true }]];
        [['x', [p * s + 1.2, 0, 0], 'w'], ['y', [0, q * s + 0.9, 0], 'e'], ['z', [0, 0, z * s + 0.8], 'n']].forEach(([n, e, d]) => its.push(['seg', P3([0, 0, 0]), P3(e), { arrow: true }], ['label', P3(e), `$${n}$`, d]));
        its.push(['label', P3(X), `$${p}$`, 'se'], ['label', P3(Y), `$${q}$`, 's'], ['label', P3(Z), `$${z}$`, 'w'], ['label', P3([0, 0, 0]), 'O', 'ne']);
        return { q: `図の三角形（3つの頂点は座標軸の上。数は原点からの距離）を、どこでも同じ流れ $\\vec F=${v3(F)}$ が、原点から遠ざかる向きに通りぬける量`, a: `$${fmt(Q)}$`, key: `54d:${v}:${F}`,
          fig: { s: 5, items: its }, easy: `$A\\vec n=${v3(A)}$`, easyCheck: false, verify: pp => vNear(pp, dot(F, [q * z / 2, z * p / 2, p * q / 2])) };
      },
      // わな：場所で変わる場 (0, 0, cz) が上向きに通る量 → 8-57（面を z = g(x, y) と見る）
      trap(r) {
        const v = pqr54(r); if (!v) return null;
        const [p, q, z] = v, c = r.pick([1, 2, 3]), val = c * p * q * z / 6;
        return dest(withCalc('8-54', { q: `場所で変わる流れ $\\vec F=(0,\\ 0,\\ ${cf(c, 'z')})$ が、${triQ(p, q, z)}を上向きに通りぬける量`, a: `$${fracT(val)}$`, key: `54t:${v}:${c}`,
          verify: pp => vNear(pp, gl(x => gl(y => c * z * (1 - x / p - y / q), 0, q * (1 - x / p)), 0, p)) },
        { kind: 'defint2', f: `${c}*${z}*(1-x/${p}-y/${q})`, ranges: [['x', 0, p], ['y', 0, `${q}*(1-x/${p})`]] }), '8-54',
        '場がどこでも同じではないので、$\\vec F\\cdot(A\\vec n)$ は使えない。面を $z=g(x,\\ y)$ のグラフと見て、影の三角形で積分する', ['8-57']);
      },
    },
  });

  // ================================================================ 8-55
  // 平らな面で場所によって変わる流れ。例（左ページ）：2 m×2 m、v = 0.5 + 0.3z → 3.2。教科書の窓（2×1.5、0.8+0.4z）・（1.5×2、0.5+0.5z）・（2×1、1+0.5z）もよける
  const EX55 = ['2,2,0.5,0.3', '2,1.5,0.8,0.4', '1.5,2,0.5,0.5', '2,1,1,0.5'];
  const winT = (w, H) => `はば $${U(fmt(w), 'm')}$、高さ $${U(fmt(H), 'm')}$ の窓`;
  add({
    id: '8-55', chap: '8-8⑤ 例題4',
    exAns: ['3.2', '\\dfrac{16}{15}'],   // 左ページの例の答え（O-2）
    title: '場所で変わる流れと窓：ふつうの定積分に直す（1次式なら、まん中の値×面積）',
    mark: '「高さで強さが変わる風」が窓を通る量、場所で変わる流れが平らな板を通る量。',
    futsu: ['窓を小さな長方形のタイルに分け、', 'タイルごとに速さ×面積を', '計算してたす'],
    raku: ['はば 2 m、高さ 2 m の窓、$v=0.5+0.3z$', '→ まん中 $z=1$ の $0.8$ に面積4で $3.2$ m³/s', '$v=0.2z^2$ なら $\\int_0^2 2\\times0.2z^2\\,\\dd z=\\dfrac{16}{15}$'],
    why: '窓は軸に直角な平らな面なので、$\\vec n$ は軸の向きで、$\\dd S=\\dd x\\,\\dd z$（8-8⑤）。$\\vec v\\cdot\\vec n$ が高さ $z$ だけで決まるなら、横の積分ははばをかけるだけで、$\\int_0^H w\\,v(z)\\,\\dd z$ のふつうの定積分1回になる。$v$ が1次式なら、平均はまん中の値なので、まん中の値×面積。',
    caution: '「場×面積」でよいのは場がどこでも同じときだけ。$v$ が $z^2$ をふくむときは、まん中の値×面積にならない（積分する）。高さは窓の下の辺から（$z=0$ が下の辺）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' },
    fits(q) {
      if (/球|三角形|おわん|ドーム|円/.test(q)) return false;
      return /窓|水路/.test(q) && /v=|\\vec v=/.test(q) || (/板/.test(q) && /\\vec F=\([^)]*[xy][^)]*\)/.test(q));
    },
    steps: {
      // 窓、v = a + b z
      s1(r) {
        const w = r.pick([1, 1.5, 2, 3, 4]), H = r.pick([1, 1.5, 2, 3]), a = r.pick([0.2, 0.5, 0.8, 1, 1.5]), b = r.pick([0.2, 0.4, 0.5, 1]);
        if (EX55.includes([w, H, a, b].join(','))) return null;
        const Q = dec((a + b * H / 2) * w * H);
        if (!fewDec(Q, 2) || Q === 3.2 || cap(r, '55s1', Q)) return null;
        return withCalc('8-55', { q: `${winT(w, H)}を直角に通りぬける風の量（1秒間）。下の辺から高さ $z$〔m〕の所の速さは $v=${sum([fmt(a), cf(b, 'z')])}$〔m/s〕`,
          a: `$${U(fmt(Q), 'm^3/s')}$`, key: `55:${w},${H},${a},${b}`, easy: `まん中 $z=${fmt(H / 2)}$ の $${fmt(a + b * H / 2)}$ に面積 $${fmt(w * H)}$`, easyCheck: false,
          verify: p => vNear(p, gl(z => (a + b * z) * w, 0, H), 1e-9) }, { kind: 'defint2', f: `${a}+${b}*z`, ranges: [['z', 0, H], ['x', 0, w]] });
      },
      // v = c z^2、横の位置 x で変わる、両方で変わる
      s2(r) {
        const kind = turn(r, '55s2', 3), w = r.pick([1, 2, 3]), H = r.pick([1, 2, 3]);
        let vT, vf, cs;
        if (kind === 0) { const c = r.pick([0.1, 0.2, 0.3, 0.6]); if (c === 0.2 && w === 2 && H === 2) return null; vT = cf(c, 'z^2'); vf = (x, z) => c * z * z; cs = `${c}*z^2`; }
        else if (kind === 1) { const a = r.pick([0.5, 1, 2]), b = r.pick([0.2, 0.5, 1]); vT = sum([fmt(a), cf(b, 'x')]); vf = x => a + b * x; cs = `${a}+${b}*x`; }
        else { const a = r.pick([0.5, 1]), b = r.pick([0.2, 0.5]), c = r.pick([0.2, 0.4, 1]); vT = sum([fmt(a), cf(b, 'x'), cf(c, 'z')]); vf = (x, z) => a + b * x + c * z; cs = `${a}+${b}*x+${c}*z`; }
        const Q = gl(x => gl(z => vf(x, z), 0, H), 0, w), ans = numT(Q);
        if (cap(r, '55s2', ans, 1)) return null;
        const where = kind === 0 ? '下の辺から高さ $z$〔m〕の所' : kind === 1 ? '左の辺から $x$〔m〕の所' : '左下の角から右へ $x$〔m〕、上へ $z$〔m〕の所';
        return withCalc('8-55', { q: `${winT(w, H)}を直角に通りぬける風の量（1秒間）。${where}の速さは $v=${vT}$〔m/s〕`,
          a: `$${U(ans, 'm^3/s')}$`, key: `55b:${kind},${w},${H},${vT}`, easy: `$\\int_0^{${H}}\\!\\Bigl(\\int_0^{${w}}(${vT})\\,\\dd x\\Bigr)\\dd z$`, easyCheck: false,
          verify: p => vNear(p, Q) }, { kind: 'defint2', f: cs, ranges: [['z', 0, H], ['x', 0, w]] });
      },
      // 見かけがちがう：水平な板を、場所で変わる流れ（3つの成分）が上向きに通る量（直角な成分だけ）
      s3(r) {
        const p = r.pick([1, 2, 3]), q = r.pick([1, 2]), u = r.pick([1, 2, 3]), a = r.pick([1, 2]), b = r.pick([1, 2, 3]), kind = r.int(0, 1);
        const wT = kind === 0 ? sum([fmt(a), cf(b, 'xy')]) : sum([fmt(a), cf(b, 'x'), cf(1, 'y^2')]);
        const wf = kind === 0 ? (x, y) => a + b * x * y : (x, y) => a + b * x + y * y;
        const Q = gl(x => gl(y => wf(x, y), 0, q), 0, p), ans = fracT(Q);
        if (cap(r, '55s3', ans, 1)) return null;
        return withCalc('8-55', { q: `水平な板 $0\\leqq x\\leqq${p}$、$0\\leqq y\\leqq${q}$（$z=0$）を、流れ $\\vec F=(${u},\\ ${u},\\ ${wT})$ が上向きに通りぬける量`, a: `$${ans}$`, key: `55c:${p},${q},${u},${wT}`,
          easy: `$\\vec n=(0,\\ 0,\\ 1)$ なので $z$ 成分だけ：$\\int_0^{${q}}\\!\\int_0^{${p}}(${wT})\\,\\dd x\\,\\dd y$`, easyCheck: false, verify: pp => vNear(pp, Q) },
        { kind: 'defint2', f: kind === 0 ? `${a}+${b}*x*y` : `${a}+${b}*x+y^2`, ranges: [['x', 0, p], ['y', 0, q]] });
      },
      // わな：どこでも同じ流れが、ななめの平面の三角形を通る量 → 8-54
      trap(r) {
        const v = pqr54(r); if (!v) return null;
        const [p, q, z] = v, F = flow54(r), Q = dot(F, An(p, q, z));
        return dest({ q: `どこでも同じ流れ $\\vec F=${v3(F)}$ が、${triQ(p, q, z)}を、原点から遠ざかる向きに通りぬける量`, a: `$${fmt(Q)}$`, key: `55t:${v}:${F}`,
          verify: pp => vNear(pp, dot(F, [q * z / 2, z * p / 2, p * q / 2])) }, '8-55', '流れはどこでも同じで、面がななめ（軸に直角でない）。面積ベクトル $A\\vec n$ を外積で出して内積');
      },
    },
  });

  // ================================================================ 8-56
  // 球面の上で場が面に直角で大きさ一定。例（左ページ）：(x, y, z)・半径3 → 108π、(x, y, z)/r^3 → 4π。教科書の半径2（32π）もよける
  const EPS = 8.85e-12;
  const rT3 = '（$r=\\sqrt{x^2+y^2+z^2}$）';
  const sph = R => `原点が中心で半径 $${R}$ の球面`;
  add({
    id: '8-56', chap: '8-8⑩ 例題6',
    exAns: ['108\\pi', '4\\pi'],   // 左ページの例の答え（O-2）
    title: '球面の上で一定な場：$(\\vec F\\cdot\\vec n)\\times4\\pi R^2$。点電荷の場は半径によらない',
    mark: '原点が中心の球面を、$(x,\\ y,\\ z)$・$\\dfrac{(x,\\ y,\\ z)}{r^3}$・点電荷の場が外へ通りぬける量。',
    futsu: ['球面を角 $\\theta$・$\\varphi$ のタイルに分け、', '$\\vec F\\cdot\\vec n\\,R^2\\sin\\theta$ を', '2回積分する'],
    raku: ['$(x,\\ y,\\ z)$、半径3の球面：$\\vec F\\cdot\\vec n=3$', '→ $3\\times4\\pi\\times9=108\\pi$', '$\\dfrac{(x,\\ y,\\ z)}{r^3}$ → $\\dfrac{1}{R^2}\\times4\\pi R^2=4\\pi$'],
    why: '原点が中心の球面では、外向きの $\\vec n$ は $\\dfrac{(x,\\ y,\\ z)}{R}$。原点から外向きの場なら $\\vec F\\cdot\\vec n$ は場の大きさで、球面の上でどこでも同じ。一定の値は積分の外に出せるので、（一定の値）×（球面の面積 $4\\pi R^2$）（8-8⑩）。$\\dfrac{(x,\\ y,\\ z)}{r^3}$ は大きさ $\\dfrac{1}{R^2}$ で、$4\\pi R^2$ と消えて半径によらない。点電荷の場では $\\dfrac{Q}{\\varepsilon_0}$。',
    caution: '$\\vec F\\cdot\\vec n$ が一定になるのは、球の中心が場の中心（原点）と同じで、場が中心から外向きのとき。$(2x,\\ 3y,\\ z)$ のように成分ごとに係数がちがう場や、上半分の球面（ドーム）では、そのまま使えない。$(x,\\ y,\\ z)$ の大きさは $r$ で、球面の上では $R$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '28mm', trap: '20mm' },
    fits(q) {
      if (/点電荷|電球/.test(q) && !/円すい/.test(q)) return true;
      if (!/球面/.test(q) || /上半分|半球|ドーム|立方体|球面のうち/.test(q)) return false;
      if (/外向きで、?大きさ/.test(q)) return true;
      const m = /\\vec F=(?:\\dfrac\{)?([\d.]*)\(x,\\ y,\\ z\)/.exec(q);
      return !!m;
    },
    steps: {
      // k (x, y, z)
      s1(r) {
        const k = r.pick([1, 2, 3, 0.5]), R = r.pick([1, 2, 3, 4, 5]);
        if (R === 3 && k === 1) return null;
        if (R === 2 && k === 1) return null;
        const c = 4 * k * R ** 3, ans = piT(c);
        if (cap(r, '56s1', ans, 1)) return null;
        return { q: `$\\vec F=${k === 1 ? '' : fmt(k)}(x,\\ y,\\ z)$ が、${sph(R)}を外へ通りぬける量`, a: `$${ans}$`, key: `56:${k},${R}`,
          easy: `$\\vec F\\cdot\\vec n=${fmt(k * R)}$、$${fmt(k * R)}\\times4\\pi\\times${R * R}$`, easyCheck: false,
          verify: p => vNear(p, sphFlux((x, y, z) => [k * x, k * y, k * z], R, 0, Math.PI)) };
      },
      // (x, y, z)/r^3（半径によらない）・(x, y, z)/r・中心から外向きで大きさ一定
      s2(r) {
        const kind = turn(r, '56s2', 3), k = r.pick([1, 2, 3, 5]), R = r.pick([1, 2, 3, 4, 5, 10]);
        let q, c, Ff, e;
        if (kind === 0) {
          if (k === 1) return null;
          q = `$\\vec F=\\dfrac{${k}(x,\\ y,\\ z)}{r^3}$${rT3}が、${sph(R)}を外へ通りぬける量`; c = 4 * k; e = `$\\dfrac{${k}}{R^2}\\times4\\pi R^2$`;
          Ff = (x, y, z) => { const rr = Math.hypot(x, y, z) ** 3; return [k * x / rr, k * y / rr, k * z / rr]; };
        } else if (kind === 1) {
          q = `$\\vec F=\\dfrac{${k === 1 ? '' : k}(x,\\ y,\\ z)}{r}$${rT3}が、${sph(R)}を外へ通りぬける量`; c = 4 * k * R * R; e = `大きさ $${k}$ で一定、$${k}\\times4\\pi\\times${R * R}$`;
          Ff = (x, y, z) => { const rr = Math.hypot(x, y, z); return [k * x / rr, k * y / rr, k * z / rr]; };
        } else {
          q = `原点から外向きで、大きさがどこでも $${k}$ の場が、${sph(R)}から出ていく量`; c = 4 * k * R * R; e = `$${k}\\times4\\pi\\times${R * R}$`;
          Ff = (x, y, z) => { const rr = Math.hypot(x, y, z); return [k * x / rr, k * y / rr, k * z / rr]; };
        }
        const ans = piT(c);
        if (cap(r, '56s2', ans, 1)) return null;
        return { q, a: `$${ans}$`, key: `56b:${kind},${k},${R}`, easy: e, easyCheck: false, verify: p => vNear(p, sphFlux(Ff, R, 0, Math.PI)) };
      },
      // 見かけがちがう：点電荷（ε0 の値を文に）、電球の光
      s3(r) {
        if (turn(r, '56s3', 2) === 0) {
          const n = r.pick([3, 4, 5, 6]), R = r.pick([0.1, 0.2, 0.5, 1, 2]), val = Math.round(n * 1e-9 / EPS);
          if (val !== Math.round(n * 1e-9 / 8.8541878128e-12)) return null;   // O-4
          return { q: `$Q=${n}.0\\times10^{-9}\\,\\mathrm{C}$ の点電荷を中心に置いた、半径 $${U(R, 'm')}$ の球面を通りぬける電場の流束（$\\varepsilon_0=8.85\\times10^{-12}\\,\\mathrm{F/m}$ として、整数で）`,
            a: `約 $${U(val, 'N\\cdot m^2/C')}$`, key: `56c:${n},${R}`, easy: `$\\dfrac{Q}{\\varepsilon_0}=\\dfrac{${n}.0\\times10^{-9}}{8.85\\times10^{-12}}\\approx${val}$（半径によらない）`, easyCheck: false,
            verify: p => {   // 点電荷の電場 kQ/r^2（k = 1/(4π ε0)）を球面のタイルでたし、ほんとうの ε0 でも同じ整数か
              const fl = e0 => sphFlux((x, y, z) => { const rr = Math.hypot(x, y, z) ** 3, k = n * 1e-9 / (4 * Math.PI * e0); return [k * x / rr, k * y / rr, k * z / rr]; }, R, 0, Math.PI);
              return (p.a.startsWith('約') && near(ansNum(p.a), Math.round(fl(8.85e-12))) && Math.round(fl(8.8541878128e-12)) === Math.round(fl(8.85e-12))) || '流束がちがう';
            } };
        }
        const I = r.pick([2, 3, 5, 10]), R = r.pick([1, 2, 3, 5]), c = 4 * I * R * R;
        return { q: `小さな電球が、どの向きにも同じ強さで光を出している。電球から $${U(R, 'm')}$ の所で、光に直角な面 $1\\,\\mathrm{m^2}$ あたり $${U(I, 'W')}$ の光が通る。電球が出す光の全部`,
          a: `$${U(piT(c), 'W')}$`, key: `56d:${I},${R}`, easy: `半径 $${R}$ の球面で一定：$${I}\\times4\\pi\\times${R * R}$`, easyCheck: false,
          verify: p => vNear(p, sphFlux((x, y, z) => { const rr = Math.hypot(x, y, z); return [I * x / rr, I * y / rr, I * z / rr]; }, R, 0, Math.PI)) };
      },
      // わな：(0, 0, z) が上半分の球面を通る量 → 8-58（面の上で一定でない）
      trap(r) {
        const R = r.pick([1, 2, 3, 4]), c = r.pick([1, 2, 3]);
        if (R === 2 && c === 1) return null;   // 教科書の例
        const val = 2 * c * R ** 3 / 3;
        return dest({ q: `$\\vec F=(0,\\ 0,\\ ${cf(c, 'z')})$ が、原点が中心で半径 $${R}$ の上半分の球面を外へ通りぬける量`, a: `$${piT(val)}$`, key: `56t:${R},${c}`,
          verify: p => vNear(p, sphFlux((x, y, z) => [0, 0, c * z], R, 0, Math.PI / 2)) }, '8-56', '$\\vec F\\cdot\\vec n=cR\\cos^2\\theta$ は場所で変わり、面も球面全体でない。球面のタイルで積分する');
      },
    },
  });
  // ================================================================ 8-57
  // z = g(x, y) の面（上向き）：n dS = (−g_x, −g_y, 1) dx dy。場の成分は x・y・z の式（calc の文字列と JS の関数）
  // 極座標の calc の式：x → r cosθ、y → r sinθ、z → g
  const toPolar = (s, g) => s.replace(/x/g, '(r*cos(theta))').replace(/y/g, '(r*sin(theta))').replace(/z/g, `(${g})`);
  // 影が半径 R の円の、上向きの流束（検算：極座標の2重のガウス・ルジャンドル）
  function graphFlux(Ff, g, gx, gy, R) {
    return gln(th => gln(rr => { const x = rr * Math.cos(th), y = rr * Math.sin(th), F = Ff(x, y, g(x, y)); return (-F[0] * gx(x, y) - F[1] * gy(x, y) + F[2]) * rr; }, 0, R, 2), 0, 2 * Math.PI, 4);
  }
  // 場の候補：[TeX, calc の3成分, JS]
  const F57 = [
    k => [`(${cf(k, 'x')},\\ ${cf(k, 'y')},\\ 0)`, [`${k}*x`, `${k}*y`, '0'], (x, y) => [k * x, k * y, 0]],
    k => [`(0,\\ 0,\\ ${fmt(k)})`, ['0', '0', `${k}`], () => [0, 0, k]],
    k => [`(0,\\ 0,\\ ${cf(k, 'z')})`, ['0', '0', `${k}*z`], (x, y, z) => [0, 0, k * z]],
    k => [`(${cf(k, 'x')},\\ ${cf(k, 'y')},\\ ${cf(k, 'z')})`, [`${k}*x`, `${k}*y`, `${k}*z`], (x, y, z) => [k * x, k * y, k * z]],
  ];
  const BUDS = 12;   // 面積分の calc は重い（1問 0.3〜0.6 秒）ので、わざごとに12こまで
  const EX57 = ['16\\pi', '\\dfrac{3\\pi}{2}', '8\\pi'];   // 左ページの例と教科書の答え（O-2）
  add({
    id: '8-57', chap: '8-8⑧ 例題7',
    exAns: ['16\\pi'],   // 左ページの例の答え（O-2）
    title: 'グラフの形の面 $z=g(x,\\ y)$：タイルを偏微分で作り、影の範囲で積分する（円なら極座標）',
    mark: 'おわんを伏せた面 $z=a-x^2-y^2$ などのグラフの面を、場が「上向きに通りぬける量」。',
    futsu: ['面を小さな三角形に分け、', '1つずつ外積で面積ベクトルを出して', '場との内積をたす'],
    raku: ['$z=4-x^2-y^2$、$\\vec F=(x,\\ y,\\ 0)$：', '$(x,\\ y,\\ 0)\\cdot(2x,\\ 2y,\\ 1)=2r^2$、影は $r\\leqq2$', '$\\int_0^{2\\pi}\\!\\int_0^2 2r^2\\cdot r\\,\\dd r\\,\\dd\\theta=16\\pi$'],
    why: '面 $z=g(x,\\ y)$ の上のタイルは $\\vec n\\,\\dd S=\\Bigl(-\\dfrac{\\partial g}{\\partial x},\\ -\\dfrac{\\partial g}{\\partial y},\\ 1\\Bigr)\\dd x\\,\\dd y$（上向き。8-8⑧）。場との内積を作り、$z$ に $g$ を入れると $x$・$y$ だけの式になる。それを床に落とした影の範囲で重積分する。影が円なら極座標 $r\\,\\dd r\\,\\dd\\theta$（8-6）。',
    caution: '$\\dd S$ を $\\dd x\\,\\dd y$ のままにしない（かたむいた所のタイルは影より大きい）。$-\\dfrac{\\partial g}{\\partial x}$ の符号に気をつける（$g=4-x^2-y^2$ なら $2x$）。$z$ を残したまま積分しない。おわんの形 $z=x^2+y^2$ では、上向きのタイルの $x$・$y$ 成分は負。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '20mm' },
    fits(q) {
      if (/球|ドーム|立方体|箱/.test(q)) return false;
      if (/面 \$z=[^$]*(x\^2|xy|y\^2)|屋根 \$z=/.test(q)) return true;
      return /平面/.test(q) && /三角形/.test(q) && /\\vec F=\([^)]*[xyz][^)]*\)/.test(q);
    },
    steps: {
      // z = R^2 − x^2 − y^2（z ≥ 0）
      s1(r) {
        const R = r.pick([1, 2, 3]), t = turn(r, '57s1', 4), k = t === 1 ? r.pick([1, 2, 3, 5]) : r.pick([1, 2, 3]);
        const [FT, FC, Ff] = F57[t](k), g = `${R * R}-r^2`;
        const val = graphFlux(Ff, (x, y) => R * R - x * x - y * y, x => -2 * x, (x, y) => -2 * y, R), ans = piT(val / Math.PI);
        if (EX57.includes(ans) || cap(r, '57s1', ans, 1)) return null;
        return withCalc('8-57', { q: `面 $z=${R * R}-x^2-y^2$（$z\\geqq0$ の部分）を、$\\vec F=${FT}$ が上向きに通りぬける量`, a: `$${ans}$`, key: `57:${R},${t},${k}`,
          easy: `$\\vec n\\,\\dd S=(2x,\\ 2y,\\ 1)\\,\\dd x\\,\\dd y$、影は $r\\leqq${R}$`, easyCheck: false, verify: p => vNear(p, val, 1e-8) },
        { kind: 'polar', f: toPolar(`(${FC[0]})*(2*x)+(${FC[1]})*(2*y)+(${FC[2]})`, g), r: [0, R], theta: [0, '2*pi'] }, BUDS);
      },
      // おわんの形 z = x^2 + y^2（r ≦ R）、正方形の影の z = xy
      s2(r) {
        if (turn(r, '57s2', 2) === 0) {
          const R = r.pick([1, 2, 3]), t = r.int(0, 3), k = r.pick([1, 2, 3]), [FT, FC, Ff] = F57[t](k);
          const val = graphFlux(Ff, (x, y) => x * x + y * y, x => 2 * x, (x, y) => 2 * y, R), ans = piT(val / Math.PI);
          if (EX57.includes(ans) || cap(r, '57s2', ans, 1)) return null;
          return withCalc('8-57', { q: `面 $z=x^2+y^2$（$z\\leqq${R * R}$ の部分）を、$\\vec F=${FT}$ が上向きに通りぬける量`, a: `$${ans}$`, key: `57b:${R},${t},${k}`,
            easy: `$\\vec n\\,\\dd S=(-2x,\\ -2y,\\ 1)\\,\\dd x\\,\\dd y$、影は $r\\leqq${R}$`, easyCheck: false, verify: p => vNear(p, val, 1e-8) },
          { kind: 'polar', f: toPolar(`(${FC[0]})*(-2*x)+(${FC[1]})*(-2*y)+(${FC[2]})`, 'r^2'), r: [0, R], theta: [0, '2*pi'] }, BUDS);
        }
        const p = r.pick([1, 2]), q = r.pick([1, 2, 3]), kind = r.int(0, 2);
        const [FT, FC, Ff] = [[`(x,\\ 0,\\ 0)`, ['x', '0', '0'], x => [x, 0, 0]], [`(0,\\ 0,\\ z)`, ['0', '0', 'z'], (x, y, z) => [0, 0, z]], [`(1,\\ 1,\\ 1)`, ['1', '1', '1'], () => [1, 1, 1]]][kind];
        const val = gl(x => gl(y => { const F = Ff(x, y, x * y); return -F[0] * y - F[1] * x + F[2]; }, 0, q), 0, p), ans = fracT(val);
        if (cap(r, '57s2', ans, 1)) return null;
        return withCalc('8-57', { q: `面 $z=xy$（$0\\leqq x\\leqq${p}$、$0\\leqq y\\leqq${q}$ の上の部分）を、$\\vec F=${FT}$ が上向きに通りぬける量`, a: `$${ans}$`, key: `57c:${p},${q},${kind}`,
          easy: `$\\vec n\\,\\dd S=(-y,\\ -x,\\ 1)\\,\\dd x\\,\\dd y$、影は長方形`, easyCheck: false, verify: pp => vNear(pp, val, 1e-9) },
        { kind: 'defint2', f: `(${FC[0]})*(-y)+(${FC[1]})*(-x)+(${FC[2].replace('z', '(x*y)')})`, ranges: [['x', 0, p], ['y', 0, q]] }, BUDS);
      },
      // 見かけがちがう：下向きに通りぬける量（雨）、ななめの平面 z = c − x で場所で変わる場
      s3(r) {
        if (turn(r, '57s3', 2) === 0) {
          const R = r.pick([1, 2, 3]), w = r.pick([2, 3, 5]);
          return { q: `面 $z=${R * R}-x^2-y^2$（$z\\geqq0$ の部分）を、真下に向かう流れ $\\vec v=(0,\\ 0,\\ -${w})$ が、上から下へ通りぬける量`, a: `$${piT(w * R * R)}$`, key: `57d:${R},${w}`,
            easy: `下向きの $\\vec n\\,\\dd S=(-2x,\\ -2y,\\ -1)\\,\\dd x\\,\\dd y$、内積は $${w}$ で一定、影の面積 $${piT(R * R)}$`, easyCheck: false,
            verify: p => vNear(p, -graphFlux(() => [0, 0, -w], (x, y) => R * R - x * x - y * y, x => -2 * x, (x, y) => -2 * y, R), 1e-8) };
        }
        const c = r.pick([2, 3, 4]), p = r.pick([1, 2]), q = r.pick([1, 2, 3]), k = r.pick([1, 2, 3]);
        if (p >= c) return null;
        const val = gl(x => gl(y => k * x * 1 + (c - x), 0, q), 0, p), ans = fracT(val);
        return withCalc('8-57', { q: `ななめの屋根 $z=${c}-x$（$0\\leqq x\\leqq${p}$、$0\\leqq y\\leqq${q}$ の上の部分）を、場所で変わる流れ $\\vec F=(${cf(k, 'x')},\\ 0,\\ z)$ が上向きに通りぬける量`, a: `$${ans}$`, key: `57e:${c},${p},${q},${k}`,
          easy: `$\\vec n\\,\\dd S=(1,\\ 0,\\ 1)\\,\\dd x\\,\\dd y$、内積 $${cf(k, 'x')}+(${c}-x)$`, easyCheck: false, verify: pp => vNear(pp, gl(x => gl(() => k * x - (-1) * 0 + (c - x), 0, q), 0, p), 1e-9) },
        { kind: 'defint2', f: `(${k}*x)*1+(${c}-x)`, ranges: [['x', 0, p], ['y', 0, q]] }, BUDS);
      },
      // わな：ドームの面積（球面）→ 8-58
      trap(r) {
        const R = r.pick([1, 2, 3, 5]);
        return dest({ q: `原点が中心で半径 $${U(R, 'm')}$ のドーム（上半分の球面）の面積`, a: `$${U(piT(2 * R * R), 'm^2')}$`, key: `57t:${R}`,
          verify: p => vNear(p, sphFlux((x, y, z) => [x / R, y / R, z / R], R, 0, Math.PI / 2)) }, '8-57', '面が $z=g(x,\\ y)$ の形に書いていない（ふちで傾きが無限に大きい）。球面のタイル $R^2\\sin\\theta\\,\\dd\\theta\\,\\dd\\varphi$ で');
      },
    },
  });

  // ================================================================ 8-58
  // 球面のタイル R^2 sinθ dθ dφ。例（左ページ）：ドームの面積 2πR^2、半径 6 m・0.1 L → 7.2π L、(0, 0, z) → 2πR^3/3。教科書の 10 m・0.2 L もよける
  const sphStr = (FC, R) => {   // 球面の上の F·n R^2 sinθ（calc の式。θ・φ）
    const sub = s => s.replace(/x/g, `(${R}*sin(theta)*cos(varphi))`).replace(/y/g, `(${R}*sin(theta)*sin(varphi))`).replace(/z/g, `(${R}*cos(theta))`);
    return `((${sub(FC[0])})*sin(theta)*cos(varphi)+(${sub(FC[1])})*sin(theta)*sin(varphi)+(${sub(FC[2])})*cos(theta))*${R * R}*sin(theta)`;
  };
  const sphCalc = (FC, R, th1) => ({ kind: 'defint2', f: sphStr(FC, R), ranges: [['varphi', 0, '2*pi'], ['theta', 0, th1]] });
  // 円柱面（半径 R、0 ≦ z ≦ L、外向き）の流束（検算）
  const cylFlux = (Ff, R, L) => gln(th => gl(z => { const F = Ff(R * Math.cos(th), R * Math.sin(th), z); return (F[0] * Math.cos(th) + F[1] * Math.sin(th)) * R; }, 0, L), 0, 2 * Math.PI, 4);
  add({
    id: '8-58', chap: '8-8⑨ 例題8・例題9',
    exAns: ['7.2\\pi', '\\dfrac{2\\pi R^3}{3}'],   // 左ページの例の答え（O-2）
    title: '球面のタイル：$R^2\\sin\\theta\\,\\dd\\theta\\,\\dd\\varphi$。上半分は $\\theta$ が0〜$\\dfrac{\\pi}{2}$、ドームの面積は床の2倍',
    mark: 'ドーム（半球の面）の面積・ペンキ、場がドームを通る量、円柱の側面を通る量。',
    futsu: ['ドームを $z=\\sqrt{R^2-x^2-y^2}$ のグラフと見て', '偏微分でタイルを作り、', '影の円で積分する（ふちで $\\sqrt{\\phantom{2}}$ の分母が0）'],
    raku: ['半径 $R$ のドームの面積 $2\\pi R^2$（床 $\\pi R^2$ の2倍）', '半径 6 m、1 m² に 0.1 L → $7.2\\pi$ L', '$(0,\\ 0,\\ z)$ → $2\\pi R^3\\int_0^{\\pi/2}\\cos^2\\theta\\sin\\theta\\,\\dd\\theta=\\dfrac{2\\pi R^3}{3}$'],
    why: '球面の上の場所は、真上からの角 $\\theta$ と、まわりの角 $\\varphi$ で表せる。タイルの辺は $R\\,\\dd\\theta$ と $R\\sin\\theta\\,\\dd\\varphi$ なので $\\dd S=R^2\\sin\\theta\\,\\dd\\theta\\,\\dd\\varphi$、外向きの $\\vec n$ は $\\vec e_r$（8-8⑨）。上半分は $\\theta$ が0〜$\\dfrac{\\pi}{2}$。面積は $2\\pi R^2\\bigl[-\\cos\\theta\\bigr]_0^{\\pi/2}=2\\pi R^2$。円柱の側面は $\\dd S=R\\,\\dd\\theta\\,\\dd z$。',
    caution: '$\\sin\\theta$ を忘れない（角は長さではない）。$\\theta$ は真上（$z$ 軸）からの角で、上半分は $\\pi$ までではない。面の上では $z=R\\cos\\theta$、$\\vec e_r$ の $z$ 成分は $\\cos\\theta$。ドームのふちの円（床）は、ドームの面に入らない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '20mm' },
    fits(q) { return /ドーム|半球|上半分の球面|円柱の側面|球面のうち/.test(q) && !/立方体|箱/.test(q); },
    steps: {
      // ドームの面積・ペンキ
      s1(r) {
        const R = r.pick([2, 3, 4, 5, 8, 10]), qq = r.pick([0.1, 0.2, 0.3, 0.5]), paint = turn(r, '58s1', 3) > 0;
        if ((R === 6 && qq === 0.1) || (R === 10 && qq === 0.2)) return null;
        const c = paint ? dec(2 * R * R * qq) : 2 * R * R, ans = paint ? piD(c) : piT(c);
        if (cap(r, '58s1', ans, 1)) return null;
        return withCalc('8-58', { q: paint ? `半径 $${U(R, 'm')}$ の半球のドームの屋根の外側を、$1\\,\\mathrm{m^2}$ あたり $${U(qq, 'L')}$ のペンキでぬるとき、要るペンキの量` : `半径 $${U(R, 'm')}$ の半球のドーム（上半分の球面）の面積`,
          a: `$${U(ans, paint ? 'L' : 'm^2')}$`, key: `58:${R},${qq},${paint}`, easy: `面積 $2\\pi\\times${R * R}$${paint ? `、$\\times${fmt(qq)}$` : ''}`, easyCheck: false,
          verify: p => vNear(p, (paint ? qq : 1) * sphFlux((x, y, z) => [x / R, y / R, z / R], R, 0, Math.PI / 2), 1e-8) },
        sphCalc([`${paint ? qq : 1}*x/${R}`, `${paint ? qq : 1}*y/${R}`, `${paint ? qq : 1}*z/${R}`], R, 'pi/2'), 4);
      },
      // 場がドームを通る量：(0, 0, cz)・(0, 0, c)、真上から 60° までの部分の面積
      s2(r) {
        const kind = turn(r, '58s2', 3), R = r.pick([1, 2, 3, 4]), c = r.pick([1, 2, 3]);
        let q, val, FC, Ff, th1 = 'pi/2', t1 = Math.PI / 2, e;
        if (kind === 0) { if (c === 1) return null; q = `$\\vec F=(0,\\ 0,\\ ${cf(c, 'z')})$ が、原点が中心で半径 $${R}$ の上半分の球面を外へ通りぬける量`; val = 2 * c * R ** 3 / 3; FC = ['0', '0', `${c}*z`]; Ff = (x, y, z) => [0, 0, c * z]; e = `$\\vec F\\cdot\\vec n=${c * R}\\cos^2\\theta$`; }
        else if (kind === 1) { q = `$\\vec F=(0,\\ 0,\\ ${c})$ が、原点が中心で半径 $${R}$ の上半分の球面を外へ通りぬける量`; val = c * R * R; FC = ['0', '0', `${c}`]; Ff = () => [0, 0, c]; e = `$\\int_0^{\\pi/2}\\cos\\theta\\sin\\theta\\,\\dd\\theta=\\dfrac12$`; }
        else { q = `原点が中心で半径 $${R}$ の球面のうち、真上から $60^{\\circ}$（$\\theta$ が0から $\\dfrac{\\pi}{3}$）までの部分の面積`; val = 2 * R * R * (1 - 0.5); FC = [`x/${R}`, `y/${R}`, `z/${R}`]; Ff = (x, y, z) => [x / R, y / R, z / R]; th1 = 'pi/3'; t1 = Math.PI / 3; e = `$2\\pi R^2\\bigl[-\\cos\\theta\\bigr]_0^{\\pi/3}$`; }
        const ans = piT(val);
        if (cap(r, '58s2', ans, 1)) return null;
        return withCalc('8-58', { q, a: `$${ans}$`, key: `58b:${kind},${R},${c}`, easy: e, easyCheck: false, verify: p => vNear(p, sphFlux(Ff, R, 0, t1), 1e-8) }, sphCalc(FC, R, th1), 4);   // 球面の calc は1問 0.8 秒ほど
      },
      // 見かけがちがう：円柱の側面（R dθ dz）
      s3(r) {
        const R = r.pick([1, 2, 3]), L = r.pick([1, 2, 3, 4]), kind = turn(r, '58s3', 3), k = r.pick([1, 2, 3]);
        const [FT, FC, Ff] = [[`(${cf(k, 'x')},\\ ${cf(k, 'y')},\\ 0)`, [`${k}*x`, `${k}*y`, '0'], (x, y) => [k * x, k * y, 0]], [`(${cf(k, 'x')},\\ 0,\\ 0)`, [`${k}*x`, '0', '0'], x => [k * x, 0, 0]], [`(${cf(k, 'x')},\\ ${cf(k, 'y')},\\ z)`, [`${k}*x`, `${k}*y`, 'z'], (x, y) => [k * x, k * y, 0]]][kind];
        const val = cylFlux(Ff, R, L), ans = piT(val / Math.PI);
        if (cap(r, '58s3', ans, 1)) return null;
        return withCalc('8-58', { q: `$\\vec F=${FT}$ が、$z$ 軸が中心で半径 $${R}$、$0\\leqq z\\leqq${L}$ の円柱の側面（上と下のふたはのぞく）を外へ通りぬける量`, a: `$${ans}$`, key: `58c:${R},${L},${kind},${k}`,
          easy: `$\\vec n=(\\cos\\theta,\\ \\sin\\theta,\\ 0)$、$\\dd S=${R === 1 ? '' : R}\\,\\dd\\theta\\,\\dd z$`, easyCheck: false, verify: p => vNear(p, val, 1e-8) },
        { kind: 'defint2', f: `((${FC[0].replace(/x/g, `(${R}*cos(theta))`).replace(/y/g, `(${R}*sin(theta))`)})*cos(theta)+(${FC[1].replace(/x/g, `(${R}*cos(theta))`).replace(/y/g, `(${R}*sin(theta))`)})*sin(theta))*${R}`, ranges: [['z', 0, L], ['theta', 0, '2*pi']] }, BUDS);
      },
      // わな：立方体の箱から出る量（6つの平らな面）→ 8-59（第6部 8-75 でも）
      trap(r) {
        const a = r.pick([1, 2, 3]), k = r.pick([1, 2]);
        return dest({ q: `$\\vec F=(${cf(k, 'x')},\\ ${cf(k, 'y')},\\ ${cf(k, 'z')})$ が、1辺 $${a}$ の立方体の箱 $0\\leqq x,\\ y,\\ z\\leqq${a}$ から外へ出る量`, a: `$${3 * k * a ** 3}$`, key: `58t:${a},${k}`,
          verify: p => vNear(p, 3 * k * a * a * a) }, '8-58', '曲がった面ではなく、6つの平らな面。面ごとに分けてたす', ['8-75']);
      },
    },
  });

  // ================================================================ 8-59
  // 立方体の箱 0 ≦ x, y, z ≦ a。場の成分は多項式の項 [c, i, j, k]。面ごとに外向き（原点側の面は符号を変える）
  function boxFaces(F, a) {   // [x=a, x=0, y=a, y=0, z=a, z=0] の面から外へ出る量
    const f2 = g => gl(u => gl(v => g(u, v), 0, a), 0, a);
    return [
      f2((y, z) => polyV(F[0], a, y, z)), f2((y, z) => -polyV(F[0], 0, y, z)),
      f2((x, z) => polyV(F[1], x, a, z)), f2((x, z) => -polyV(F[1], x, 0, z)),
      f2((x, y) => polyV(F[2], x, y, a)), f2((x, y) => -polyV(F[2], x, y, 0)),
    ];
  }
  const FACE = ['x=a', 'x=0', 'y=a', 'y=0', 'z=a', 'z=0'];
  const faceT = (k, a) => FACE[k].replace('a', a);
  // 発散（検算の calc：箱の中の3重積分。ガウスの定理で、面ごとにたすのとは別の道すじ）
  const dterm = (t, v) => (t[v + 1] ? [[t[0] * t[v + 1], ...t.slice(1).map((e, j) => (j === v ? e - 1 : e))]] : []);
  const divC = F => polyC([...F[0].flatMap(t => dterm(t.length > 3 ? t : [...t, 0], 0)), ...F[1].flatMap(t => dterm(t.length > 3 ? t : [...t, 0], 1)), ...F[2].flatMap(t => dterm(t.length > 3 ? t : [...t, 0], 2))]);
  const boxCalc = (F, a) => ({ kind: 'defint2', f: divC(F), ranges: [['x', 0, a], ['y', 0, a], ['z', 0, a]] });
  const boxQ = a => `立方体の箱 $0\\leqq x,\\ y,\\ z\\leqq${a}$ `;
  const T3 = (c, i, j, k) => [c, i, j, k];
  // 1つの変数だけの成分（s1）：c v、c v^2、c v + d、c
  function comp1(r, v) {
    const c = r.pick([1, 2, 3, -1]), e = [0, 0, 0]; const kind = r.int(0, 3);
    if (kind === 3) return [T3(c, 0, 0, 0)];
    e[v] = kind === 1 ? 2 : 1;
    const t = [T3(c, ...e)];
    if (kind === 2) t.push(T3(r.pick([1, 2, -1]), 0, 0, 0));
    return t;
  }
  // まざった成分（s2・s3）：x・y・z・x^2・xy・yz・zx などから1つか2つ
  const MONO = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [2, 0, 0], [0, 2, 0], [0, 0, 2], [1, 1, 0], [0, 1, 1], [1, 0, 1], [0, 0, 0]];
  const compM = r => { const n = r.int(1, 2), out = []; for (let k = 0; k < n; k++) { const m = r.pick(MONO); if (!out.some(t => t[1] === m[0] && t[2] === m[1] && t[3] === m[2])) out.push(T3(r.pick([1, 2, 3, -1]), ...m)); } return out; };
  const EX59 = '[[[1,2,0,0]],[[2,0,1,0]],[[1,0,0,1]]]';   // 左ページの例 (x^2, 2y, z)
  const box3 = (q, F, a, p) => withCalc('8-59', Object.assign({ q, verify: pp => vNear(pp, boxFaces(F, a).reduce((s, x) => s + x, 0), 1e-9) }, p), boxCalc(F, a), 16);
  // 立方体の図：y 軸を左上へ（斜投影の角 150°）。見える3つの面（y=0・x=0・z=a）に外向きの矢印とラベル、見えない3本の辺は点線。
  //   軸は箱の辺の先へのばす（箱の中に軸のラベルが入らないように）
  function cubeFig(a) {
    const s = 3 / a, V = (x, y, z) => M.proj3([x * s, y * s, z * s], 0.45, 150);
    const its = [];
    const E = [[[0, 0, 0], [a, 0, 0]], [[a, 0, 0], [a, 0, a]], [[a, 0, a], [0, 0, a]], [[0, 0, a], [0, 0, 0]],   // 前の面 y=0
      [[0, 0, 0], [0, a, 0]], [[0, a, 0], [0, a, a]], [[0, a, a], [0, 0, a]], [[0, a, a], [a, a, a]], [[a, a, a], [a, 0, a]]];   // 左の面 x=0・上の面 z=a
    E.forEach(([A, B]) => its.push(['seg', V(...A), V(...B), { thick: true }]));
    [[[a, a, 0], [a, 0, 0]], [[a, a, 0], [0, a, 0]], [[a, a, 0], [a, a, a]]].forEach(([A, B]) => its.push(['seg', V(...A), V(...B), { dash: true }]));
    its.push(['seg', V(a, 0, 0), V(1.45 * a, 0, 0), { arrow: true }], ['label', V(1.45 * a, 0, 0), '$x$', 'e'],
      ['seg', V(0, a, 0), V(0, 1.6 * a, 0), { arrow: true }], ['label', V(0, 1.6 * a, 0), '$y$', 'w'],
      ['seg', V(0, 0, a), V(0, 0, 1.45 * a), { arrow: true }], ['label', V(0, 0, 1.45 * a), '$z$', 'w'], ['label', V(0, 0, 0), 'O', 's']);
    const ar = (C, d, L, lab, dir) => { const A = V(...C), B = V(C[0] + d[0] * L * a, C[1] + d[1] * L * a, C[2] + d[2] * L * a); its.push(['dot', A], ['seg', A, B, { arrow: true }], ['label', B, lab, dir]); };
    ar([0, a / 2, 0.75 * a], [-1, 0, 0], 0.55, '$x=0$', 'w');
    ar([a / 2, a / 2, a], [0, 0, 1], 0.45, `$z=${a}$`, 'e');
    ar([0.15 * a, 0, 0.62 * a], [0, -1, 0], 0.45, '$y=0$', 's');   // 手前へ出る矢印（前の面のまん中より左上。点線の辺とはなす）
    return { s: 5, items: its };
  }
  add({
    id: '8-59', chap: '8-8⑪ 例題10',
    exAns: ['4'],   // 左ページの例の答え（O-2）
    title: '閉じた箱は6つの面に分ける：どの面も外向き（原点側の面は成分の符号を変える）',
    mark: '立方体の箱から場が外へ出る量 $\\oiint_S\\vec F\\cdot\\vec n\\,\\dd S$。',
    futsu: ['箱の表面全体を1つの式で表そうとして、', '角や辺でつまる'],
    raku: ['$0\\leqq x,\\ y,\\ z\\leqq1$、$\\vec F=(x^2,\\ 2y,\\ z)$', '$x=1$ の面 $1$、$x=0$ の面 $0$、$y=1$ の面 $2$、', '$y=0$ の面 $0$、$z=1$ の面 $1$、$z=0$ の面 $0$ → $4$'],
    why: '箱の表面は、軸に直角な6つの平らな面に分けられる（8-8⑪）。$x=a$ の面の外向きの $\\vec n$ は $(1,\\ 0,\\ 0)$ で、$\\vec F\\cdot\\vec n=F_x$。原点側の $x=0$ の面は $(-1,\\ 0,\\ 0)$ で、$-F_x$。1つずつは、窓と同じ長方形の上の重積分（$\\dd S=\\dd y\\,\\dd z$ など）。6つをたしたものが箱から出る量。',
    caution: '原点側の面（$x=0$・$y=0$・$z=0$）の $\\vec n$ は外向き（負の向き）。入ってくる量は負で数える。面の上では止めた文字に面の値（$x=1$ など）を入れる。場が $x$ だけの成分 $F_x(x)$ なら、$x$ の2つの面の和は $\\bigl(F_x(a)-F_x(0)\\bigr)\\times a^2$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '20mm' },
    fits(q) { return /立方体|箱/.test(q) && /0\\leqq x|図の立方体/.test(q); },
    steps: {
      // 1辺1、成分がそれぞれ自分の文字だけ
      s1(r) {
        const F = [comp1(r, 0), comp1(r, 1), comp1(r, 2)];
        if (JSON.stringify(F) === EX59 || F.every(c => c.length === 1 && c[0].slice(1).every(e => e === 0))) return null;
        const fs = boxFaces(F, 1), tot = fs.reduce((s, x) => s + x, 0), ans = fracT(tot);
        if (ans === '4' || cap(r, '59s1', ans)) return null;
        return box3(`$\\vec F=${vecT(F)}$ が、${boxQ(1)}から外へ出る量`, F, 1, { a: `$${ans}$`, key: `59:${JSON.stringify(F)}`,
          easy: `6つの面：${fs.map(fracT).map(x => `$${x}$`).join('、')}`, easyCheck: false });
      },
      // まざった成分、1辺2、1つの面から出る量
      s2(r) {
        const a = r.pick([1, 1, 2]), F = [compM(r), compM(r), compM(r)], fs = boxFaces(F, a);
        if (turn(r, '59s2', 3) === 2) {
          const k = r.pick([1, 3, 5]), ans = fracT(fs[k]);
          if (fs[k] === 0 || cap(r, '59s2', ans, 1)) return null;
          return withCalc('8-59', { q: `$\\vec F=${vecT(F)}$ が、${boxQ(a)}の $${faceT(k, a)}$ の面から外へ出る量`, a: `$${ans}$`, key: `59c:${JSON.stringify(F)}:${a}:${k}`,
            easy: `外向きは負の向き：$\\vec F\\cdot\\vec n=-F_${'xyz'[k >> 1]}$`, easyCheck: false, verify: pp => vNear(pp, fs[k]) },
          { kind: 'defint2', f: `-(${polyC(F[k >> 1])})`.replace(new RegExp('xyz'[k >> 1], 'g'), '(0)'), ranges: [0, 1, 2].filter(j => j !== k >> 1).map(j => ['xyz'[j], 0, a]) }, 16);
        }
        const tot = fs.reduce((s, x) => s + x, 0), ans = fracT(tot);
        if (ans === '4' || cap(r, '59s2', ans, 1)) return null;
        return box3(`$\\vec F=${vecT(F)}$ が、${boxQ(a)}から外へ出る量`, F, a, { a: `$${ans}$`, key: `59b:${JSON.stringify(F)}:${a}`,
          easy: `6つの面：${fs.map(fracT).map(x => `$${x}$`).join('、')}`, easyCheck: false });
      },
      // 見かけがちがう：立方体の図と $\oiint$
      s3(r) {
        const a = r.pick([1, 2]), F = [compM(r), compM(r), compM(r)], fs = boxFaces(F, a), ans = fracT(fs.reduce((s, x) => s + x, 0));
        if (ans === '4' || cap(r, '59s3', ans, 1)) return null;
        return box3(`図の立方体の箱の表面 $S$（外向き）で、$\\vec F=${vecT(F)}$ の $\\oiint_S\\vec F\\cdot\\vec n\\,\\dd S$`, F, a, { a: `$${ans}$`, key: `59d:${JSON.stringify(F)}:${a}`,
          fig: cubeFig(a), easy: `$x=${a}$、$x=0$、$y=${a}$、$y=0$、$z=${a}$、$z=0$ の面：${fs.map(fracT).map(x => `$${x}$`).join('、')}`, easyCheck: false });
      },
      // わな：成分ごとに係数がちがう場が球面から出る量 → 8-75（第6部。発散×体積）
      trap(r) {
        const c = [r.pick([1, 2, 3]), r.pick([1, 2, 3]), r.pick([1, 2, 3])], R = r.pick([1, 2]);
        if (c[0] === c[1] && c[1] === c[2]) return null;
        const val = (c[0] + c[1] + c[2]) * 4 * R ** 3 / 3;
        return dest({ q: `$\\vec F=(${cf(c[0], 'x')},\\ ${cf(c[1], 'y')},\\ ${cf(c[2], 'z')})$ が、原点が中心で半径 $${R}$ の球面から外へ出る量`, a: `$${piT(val)}$`, key: `59t:${c}:${R}`,
          verify: p => vNear(p, sphFlux((x, y, z) => [c[0] * x, c[1] * y, c[2] * z], R, 0, Math.PI), 1e-8) }, '8-59',
        '箱ではなく球面で、場は面に直角でも一定でもない。発散が一定なので「発散×体積」', ['8-75']);
      },
    },
  });

  // ================================================================ 8-93
  // 立体角 2π(1 − cos α)。例（左ページ）：半分の角 90° → 2π、全体の 1/2
  const COSA = { 60: [0.5, '\\dfrac12'], 90: [0, '0'], 120: [-0.5, '-\\dfrac12'], 180: [-1, '-1'], 30: [0.866, '0.866'], 45: [0.707, '0.707'], 135: [-0.707, '-0.707'], 150: [-0.866, '-0.866'] };
  add({
    id: '8-93', chap: '8-8⑬ 例題12',
    exAns: ['2\\pi', '\\dfrac{1}{2}'],   // 左ページの例の答え（O-2）
    title: '円すいの立体角：$2\\pi(1-\\cos\\alpha)$（$\\alpha$ は円すいの半分の角）。まわり全体は $4\\pi$',
    mark: '点から見た面の見かけの大きさ（立体角）、円すいの形の穴・ライトの光が届く広がり。',
    futsu: ['半径1の球面のうち、円すいの中の部分を', '$\\int_0^{2\\pi}\\!\\int_0^{\\alpha}\\sin\\theta\\,\\dd\\theta\\,\\dd\\varphi$ と', '毎回積分する'],
    raku: ['半分の角 $90^{\\circ}$（半球）', '→ $2\\pi(1-\\cos90^{\\circ})=2\\pi$', '全体 $4\\pi$ の $\\dfrac12$'],
    why: '立体角は、点を中心とする半径1の球面の上で、その面が占める面積（8-8⑬）。円すいなら、球面のタイル $\\sin\\theta\\,\\dd\\theta\\,\\dd\\varphi$ を $\\theta$ が0から $\\alpha$ までたして $2\\pi\\bigl[-\\cos\\theta\\bigr]_0^{\\alpha}=2\\pi(1-\\cos\\alpha)$。$\\alpha=180^{\\circ}$ でまわり全体の $4\\pi$。どの向きにも同じに出る光なら、穴から出る光は全体の $\\dfrac{\\Omega}{4\\pi}$。',
    caution: '$\\alpha$ は円すいの「半分の角」（頂点の角の半分）。立体角の単位は sr（ステラジアン）。半径1でない球面の面積は $R^2\\Omega$（立体角そのものは半径によらない）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '24mm', s3: '20mm', trap: '20mm' },
    fits(q) { return /立体角|円すい|見かけの大きさ/.test(q); },
    steps: {
      // α = 60°・120°・180°（90° は例）。立体角・全体の何倍・穴から出る光
      s1(r) {
        const al = r.pick([60, 90, 120, 180]), kind = turn(r, '93s1', 3), P = r.pick([2, 4, 8, 12, 20]);
        if (al === 90 && kind < 2) return null;
        const fr = (1 - COSA[al][0]) / 2, Om = 2 * (1 - COSA[al][0]);
        const ans = kind === 0 ? `$${U(piT(Om), 'sr')}$` : kind === 1 ? `$${fracT(fr)}$` : `$${U(fmt(dec(P * fr)), 'W')}$`;
        if (kind === 2 && al === 180) return null;
        if (cap(r, '93s1', ans, 1)) return null;
        const q = kind === 0 ? `半分の角が $${deg(al)}$ の円すいの立体角` : kind === 1 ? `半分の角が $${deg(al)}$ の円すいの立体角は、まわり全体の何倍か`
          : `どの向きにも同じ強さで、全部で $${U(P, 'W')}$ の光を出す小さな電球を、半分の角が $${deg(al)}$ の円すいの形の穴の頂点に置いた。穴から出ていく光`;
        return { q, a: ans, key: `93:${al},${kind},${kind === 2 ? P : ''}`, easy: `$2\\pi(1-\\cos${deg(al)})=2\\pi${COSA[al][0] < 0 ? `\\Bigl(1-\\bigl(${COSA[al][1]}\\bigr)\\Bigr)` : `\\Bigl(1-${COSA[al][1]}\\Bigr)`}$${kind ? `、$4\\pi$ の $${fracT(fr)}$` : ''}`, easyCheck: false,
          verify: p => vNear(p, [2 * Math.PI * (1 - Math.cos(al * Math.PI / 180)), (1 - Math.cos(al * Math.PI / 180)) / 2, P * (1 - Math.cos(al * Math.PI / 180)) / 2][kind], 1e-9) };
      },
      // 30°・45°・135°・150°（値を文に、約）
      s2(r) {
        const al = r.pick([30, 45, 135, 150]), c = COSA[al][0], est = 2 * 3.14 * (1 - c), truth = 2 * Math.PI * (1 - Math.cos(al * Math.PI / 180));
        if (round(est, 2) !== round(truth, 2)) return null;   // O-4
        if (cap(r, '93s2', al, 1)) return null;
        return { q: `半分の角が $${deg(al)}$ の円すいの立体角（$\\cos${deg(al)}=${COSA[al][1]}$、$\\pi=3.14$ として、小数第2位まで）`, a: `約 $${U(round(est, 2).toFixed(2), 'sr')}$`, key: `93b:${al}`,
          easy: `$2\\times3.14\\times(1-${c < 0 ? `(${COSA[al][1]})` : COSA[al][1]})\\approx${round(est, 2).toFixed(2)}$`, easyCheck: false,
          verify: p => (p.a.startsWith('約') && near(ansNum(p.a), round(gl(t => Math.sin(t), 0, al * Math.PI / 180) * 2 * Math.PI, 2))) || '近似の答えがちがう' };
      },
      // 見かけがちがう：点から見た円板（三平方の数）
      s3(r) {
        const [h, a, c] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 6, 10], [6, 8, 10]]);
        const Om = 2 * (1 - h / c), ans = piT(Om);
        if (cap(r, '93s3', ans, 1)) return null;
        return { q: `半径 $${a}$ の円板を、円板のまん中から真上に $${h}$ はなれた点から見た立体角`, a: `$${U(ans, 'sr')}$`, key: `93c:${h},${a}`,
          easy: `ふちまでの距離 $${c}$、$\\cos\\alpha=\\dfrac{${h}}{${c}}$、$2\\pi\\Bigl(1-\\dfrac{${h}}{${c}}\\Bigr)$`, easyCheck: false,
          verify: p => vNear(p, 2 * Math.PI * gl(t => Math.sin(t), 0, Math.atan2(a, h)), 1e-9) };
      },
      // わな：一様な流れが円の穴を通る量 → 8-53
      trap(r) {
        const v = r.pick([1, 2, 3]), a = r.pick([0.1, 0.2, 0.5, 1]), val = dec(v * a * a);
        return dest({ q: `どこでも $${U(v, 'm/s')}$ の流れが、流れに直角に置いた半径 $${U(a, 'm')}$ の円の穴を1秒間に通る量`, a: `$${U(piD(val), 'm^3/s')}$`, key: `93t:${v},${a}`,
          verify: p => vNear(p, v * Math.PI * a * a, 1e-9) }, '8-93', '見かけの大きさではなく、一様な流れが平らな面を通る量。$v\\times$（面積）');
      },
    },
  });

  // ================================================================ 8-94
  // データから川の流量：区間ごとに「速さ×深さ×はば」をたす。例（左ページ）：2 m ずつ、深さ 0.5・1.0・0.5 m、速さ 0.4・0.8・0.4 m/s → 2.4
  const f1 = x => (+x).toFixed(1);   // 深さ・速さは小数第1位まで（1.0 も 1.0 と書く）
  const mU = (xs, u) => xs.map(x => `$${f1(x)}$`).join('・') + ` ${u}`;
  function river(r, n) {
    const D = [0.2, 0.4, 0.5, 0.6, 0.8, 1.0, 1.2, 1.5], V = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];
    const mid = Math.floor(n / 2), d = [], v = [];
    for (let k = 0; k < n; k++) { const e = Math.min(k, n - 1 - k); d.push(D[Math.min(D.length - 1, r.int(0, 2) + 2 * e)]); v.push(V[Math.min(V.length - 1, r.int(0, 2) + 2 * e)]); }
    void mid;
    return { d, v };
  }
  const flowSum = (w, d, v) => dec(d.reduce((s, x, k) => s + (Array.isArray(w) ? w[k] : w) * x * v[k], 0));
  add({
    id: '8-94', chap: '8-8⑭ 例題13',
    exAns: ['2.4'],   // 左ページの例の答え（O-2）
    title: 'データから川の流量：区間ごとに「速さ×深さ×はば」をたす',
    mark: '川のはばを区間に分けてはかった深さと速さから、1秒間に流れる水の量（流量）。',
    futsu: ['深さと速さを $x$ の式で表し、', '断面の上で $\\iint\\vec v\\cdot\\vec n\\,\\dd S$ を', '積分しようとする（式がない）'],
    raku: ['2 m ずつ、深さ 0.5・1.0・0.5 m', '速さ 0.4・0.8・0.4 m/s', '→ $2\\times(0.2+0.8+0.2)=2.4$ m³/s'],
    why: '流量は川の断面を通る水の量で、面積分 $\\iint_S\\vec v\\cdot\\vec n\\,\\dd S$（8-8⑭）。式がなくても、断面を区間（タイル）に分け、区間ごとに「直角な成分（速さ）×面積（深さ×はば）」をたせば近い値になる。区間を細かくするほど本当の値に近づく。はばがどの区間も同じなら、最後にまとめてかける。',
    caution: '速さどうし・深さどうしを先に平均してかけると、ずれる（区間ごとにかけてからたす）。はばがちがう区間は、それぞれのはばをかける。平均の速さは、流量÷断面積。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '24mm' },
    fits(q, p) { return /川/.test(q) && (/深さ/.test(q) || !!(p && p.table)); },
    steps: {
      // 同じはばの3つ・4つの区間
      s1(r) {
        const n = r.pick([3, 3, 4]), w = r.pick([1, 2, 3]), { d, v } = river(r, n), Q = flowSum(w, d, v);
        if ([2.4, 3.6].includes(Q) || !fewDec(Q, 3) || cap(r, '94s1', Q, 1)) return null;
        return { q: `はば $${U(n * w, 'm')}$ の川を、$${U(w, 'm')}$ ずつ${n}つの区間に分けてはかった。深さは岸から順に ${mU(d, 'm')}、平均の速さは ${mU(v, 'm/s')}。川の流量`,
          a: `$${U(fmt(Q), 'm^3/s')}$`, key: `94:${w}:${d}:${v}`, easy: `$${w}\\times(${d.map((x, k) => `${fmt(x)}\\times${fmt(v[k])}`).join('+')})$`, easyCheck: false,
          verify: p => vNear(p, d.map((x, k) => x * v[k] * w).reduce((s, x) => s + x, 0), 1e-9) };
      },
      // はばがちがう区間、平均の速さ
      s2(r) {
        const n = 3, { d, v } = river(r, n);
        if (turn(r, '94s2', 2) === 0) {
          const w = [r.pick([1, 2]), r.pick([2, 3, 4]), r.pick([1, 2])], Q = flowSum(w, d, v);
          if (!fewDec(Q, 3) || cap(r, '94s2', Q, 1)) return null;
          return { q: `川の断面を、岸から順にはば ${w.map(x => `$${x}$`).join('・')} m の3つの区間に分けてはかった。深さは ${mU(d, 'm')}、平均の速さは ${mU(v, 'm/s')}。川の流量`,
            a: `$${U(fmt(Q), 'm^3/s')}$`, key: `94b:${w}:${d}:${v}`, easy: `$${d.map((x, k) => `${fmt(w[k])}\\times${fmt(x)}\\times${fmt(v[k])}`).join('+')}$`, easyCheck: false,
            verify: p => vNear(p, d.map((x, k) => x * v[k] * w[k]).reduce((s, x) => s + x, 0), 1e-9) };
        }
        const w = r.pick([1, 2]), Q = flowSum(w, d, v), A = dec(w * d.reduce((s, x) => s + x, 0)), u = Q / A;
        if (!fewDec(u, 3) || cap(r, '94s2', u, 1)) return null;
        return { q: `はば $${U(3 * w, 'm')}$ の川を、$${U(w, 'm')}$ ずつ3つの区間に分けてはかった。深さは岸から順に ${mU(d, 'm')}、平均の速さは ${mU(v, 'm/s')}。断面全体の平均の速さ（流量÷断面積）`,
          a: `$${U(fmt(dec(u)), 'm/s')}$`, key: `94c:${w}:${d}:${v}`, easy: `流量 $${fmt(Q)}$、断面積 $${fmt(A)}$`, easyCheck: false,
          verify: p => vNear(p, d.map((x, k) => x * v[k]).reduce((s, x) => s + x, 0) / d.reduce((s, x) => s + x, 0), 1e-9) };
      },
      // 見かけがちがう：はかった値の表（5つの区間）
      s3(r) {
        const n = 5, w = r.pick([1, 2]), { d, v } = river(r, n), Q = flowSum(w, d, v);
        if (!fewDec(Q, 3) || cap(r, '94s3', Q, 1)) return null;
        return { q: `$${U(w, 'm')}$ ずつの区間ではかった川の深さと速さ（下の表）から、川の流量`,
          a: `$${U(fmt(Q), 'm^3/s')}$`, key: `94d:${w}:${d}:${v}`, table: { head: ['区間', ...d.map((x, k) => String(k + 1))], rows: [['深さ（m）', ...d.map(f1)], ['速さ（m/s）', ...v.map(f1)]] },
          easy: `$${w}\\times(${d.map((x, k) => fmt(dec(x * v[k]))).join('+')})$`, easyCheck: false, verify: p => vNear(p, d.map((x, k) => x * v[k] * w).reduce((s, x) => s + x, 0), 1e-9) };
      },
      // わな：速さが式で書いてある長方形の水路 → 8-55
      trap(r) {
        const w = r.pick([1, 2, 3]), H = r.pick([0.5, 1, 2]), a = r.pick([0.2, 0.5, 1]), b = r.pick([0.2, 0.4, 0.5]), Q = dec((a + b * H / 2) * w * H);
        if (!fewDec(Q, 2)) return null;
        return dest({ q: `はば $${U(w, 'm')}$、深さ $${U(H, 'm')}$ の長方形の水路の流量（底から高さ $z$〔m〕の所の速さ $v=${sum([fmt(a), cf(b, 'z')])}$〔m/s〕）`,
          a: `$${U(fmt(Q), 'm^3/s')}$`, key: `94t:${w},${H},${a},${b}`, verify: p => vNear(p, gl(z => (a + b * z) * w, 0, H), 1e-9) }, '8-94', 'データではなく速さが式で書いてある。ふつうの定積分に直す');
      },
    },
  });

  // 球面（中心は原点、半径 R）の θ0〜θ1 の部分の流束（外向き）。検算用：θ・φ の2重のガウス・ルジャンドル
  function sphFlux(Ff, R, th0, th1) {
    return gln(th => gln(ph => {
      const n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], F = Ff(R * n[0], R * n[1], R * n[2]);
      return dot(F, n) * R * R * Math.sin(th);
    }, 0, 2 * Math.PI, 4), th0, th1, 4);
  }
})(globalThis.MONDAI);

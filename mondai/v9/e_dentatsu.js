/* 問題集 第9巻　第5部 伝達関数と極（わざ 9-61〜9-75・9-96・9-97）　組 e
 * 書き方は v8/README.md（第8・9巻の手引き）・v6/README.md・v5/README.md。文は教科書 第9巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 9-8（伝達関数）・9-9（極と安定）の数・ことば・記号にそろえる（伝達関数 $G(s)=\dfrac{Y}{U}$、はじめの値を0、定常のゲイン $G(0)$、直列・並列、
 *   フィードバック $\dfrac{G_1}{1+G_1G_2}$（引いてもどす）、インパルス応答・ステップ応答、周波数応答 $s=j\omega$、倍率・おくれ、dB は $20\log_{10}\lvert G\rvert$、
 *   1次おくれ $\dfrac{K}{\tau s+1}$（63.2 %・95 %）、極（×）・零点（○）、ゆれずに落ち着く・ゆれながら落ち着く・ゆれ続ける・どんどん大きくなる、
 *   2次おくれ $\omega_{\mathrm n}$・$\zeta$・行きすぎ・最初の山、安定（すべての極の実部が負）、2次・3次の判定 $a_2a_1>a_0$、比例制御 $K_{\mathrm p}$・残るずれ、
 *   ずれの積分 $K_{\mathrm i}$、ロボットの腕、電気炉、エアコン、モーター、サスペンション）。$H$ はステップ関数だけに使う（W-14）。用字は「おそい」「はかる」（W-13）。
 * 近似値は目録の一覧の4けた（$e^{-1}=0.3679$、$\log_{10}2=0.301$ など。W-2）を問題の文に書き、答えは「約」。文の値で計算した答えと、ほんとうの値を丸めた答えが
 *   くいちがう組は出さない（O-4）。
 * 検算：伝達関数（$s$ の式）は calc（kind 'fn'）か verify（数でくらべる）、時間の動きは calc（'ode'）、極は verify（デュラン・カーナー法で分母の根を数値で出してくらべる）、
 *   安定・$K$ の範囲は verify（範囲のはしの内と外で極の実部の符号を見る）、そのほかも verify(p) で、問題を作った式とは別の道すじで確かめる。
 * 図は 9-62（直列・並列）・9-63（フィードバック）のブロック線図と、9-68 の $s$ の平面の ×（どれもステップ3だけ。K-2）。表（p.table）は 9-67 のステップ3だけ。
 *   見わけようは図・表を出さないので、ステップ1・2 は文だけ。
 * 左ページの「楽な形」と目印・注意の例の数（と、その入れかえ・符号ちがい・何倍か・同じ答え）は、同じ見開きの問題に出さない（O-2・S-2・U-2）。
 *   key は伝達関数（分母の最高次の係数を1にした係数の組）などで作り、ステップがちがっても同じ箱なら同じ key にする（同じ見開きに同じ問題を出さない）。
 * 1つのステップに同じ答えを3つ以上出さない（S-4・U-3。add の ansOK）。選ぶ答え（動き・安定）は回す。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const fmt = v => { const s = String(+(+v).toFixed(10)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const nearC = (x, y, tol) => !!x && !!y && Math.hypot(x[0] - y[0], x[1] - y[1]) <= (tol || 1e-9) * Math.max(1, Math.hypot(...x), Math.hypot(...y));
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 問題ができたときだけ進める回し方（選ぶ答えのかたよりをなくす。S-4・U-3）：peek で今の番を見て、問題を返す前に adv で進める
  const peek = (r, key, n) => { const d = r.turns || (r.turns = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return d[key]; };
  const adv = (r, key, n) => { r.turns[key] = (r.turns[key] + 1) % n; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
  const maths = t => (String(t).match(/\$[^$]*\$/g) || []).map(s => s.slice(1, -1));
  const noUnit = t => String(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\\mathrm\{[^}]*\}/g, '');
  // 答えの文の k 番めの式の値（単位をのぞき、「＝」の右、≈ があればその右）
  function numOf(t, k, vars) {
    let s = maths(t)[k || 0]; if (s == null) return null;
    s = noUnit(s); if (s.includes('\\approx')) s = s.slice(s.lastIndexOf('\\approx') + 7);
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    return M.evalMath(s.trim(), vars || {});
  }
  // 小数を分数に（分母は 1〜1000 の中で）。[分子, 分母]
  function toFr(x) { for (let d = 1; d <= 1000; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < 1e-9) { const g = gcd(n, d) || 1; return [n / g, d / g]; } } return null; }
  // 分数の TeX（約分。分母1なら整数）
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return String(n);
    return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
  }
  // 小数 x の TeX：整数・小数第2位までの小数はそのまま、ほかは分数（1/3 → \dfrac13）
  const numT = x => { if (Math.abs(x * 100 - Math.round(x * 100)) < 1e-9) return fmt(x); const f = toFr(x); return f ? frac(f[0], f[1]) : fmt(x); };
  const frT = x => { const f = toFr(x); return f ? frac(f[0], f[1]) : fmt(x); };     // いつも分数（0.25 → \dfrac14）
  // 係数×式（1・−1 は書かない）
  const cf = (c, body) => (c === 0 ? '' : body === '' ? fmt(c) : c === 1 ? body : c === -1 ? '-' + body : fmt(c) + body);
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));
  const U = (v, u) => `${v}\\,\\mathrm{${u}}`;
  // 多項式（係数は高い次から）の TeX：[1, 3, 2] → s^2+3s+2
  function polyT(cs, v) {
    v = v || 's'; const n = cs.length - 1;
    return sum(cs.map((c, i) => { const d = n - i; return d === 0 ? fmt(c) : cf(c, d === 1 ? v : `${v}^${d}`); }));
  }
  // (s+p) のかっこ（p=0 なら s）
  const fac = p => (p === 0 ? 's' : `(s${p > 0 ? '+' : '-'}${fmt(Math.abs(p))})`);
  // (s+σ)^2+ω^2（σ=0 なら s^2+ω^2）
  const sqT = (sg, w) => `${sg === 0 ? 's^2' : `${fac(sg)}^2`}+${fmt(w)}^2`;
  // σ±ωj（ω は数か TeX の文字）
  const pmT = (sg, w) => `${sg === 0 ? '' : fmt(sg)}\\pm${typeof w === 'string' ? w : (w === 1 ? ' ' : fmt(w))}j`;
  // e^{kt} の TeX（k=-2 → e^{-2t}、k=-1/30 → e^{-t/30}、k=-0.05 → e^{-0.05t}）
  function eT(k) {
    if (k === -1) return 'e^{-t}';
    const inv = -1 / k;
    if (k < 0 && Number.isInteger(+inv.toFixed(9)) && !Number.isInteger(k)) return `e^{-t/${fmt(inv)}}`;
    return `e^{${fmt(k)}t}`;
  }
  const fracT = (n, d) => `\\dfrac{${n}}{${d}}`;
  // 多項式の計算（係数は高い次から）
  const trim0 = v => +(+v).toFixed(10);
  const pmul = (a, b) => { const o = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { o[i + j] += x * y; })); return o.map(trim0); };
  const padd = (a, b) => { const n = Math.max(a.length, b.length), A = Array(n - a.length).fill(0).concat(a), B = Array(n - b.length).fill(0).concat(b); return A.map((x, i) => trim0(x + B[i])); };
  const pscale = (a, c) => a.map(x => trim0(x * c));
  // 伝達関数の key：分母の最高次の係数で分母・分子をわった係数の組
  const gkey = (num, den) => `G:${pscale(num, 1 / den[0]).map(fmt).join(',')}/${pscale(den, 1 / den[0]).map(fmt).join(',')}`;
  // 例の数の組とくらべる（入れかえ・符号を変えただけ・何倍かも同じとみる。S-2・U-2）
  const absSort = a => a.map(x => Math.abs(x)).sort((x, y) => x - y);
  function exLike(a, b) {
    if (a.length !== b.length) return false;
    const A = absSort(a), B = absSort(b), ma = A[A.length - 1], mb = B[B.length - 1];
    if (!ma || !mb) return false;
    return A.every((x, i) => Math.abs(x - ma / mb * B[i]) < 1e-9 * Math.max(1, ma));
  }

  // ---------------------------------------------------------------- 検算の部品（問題を作った式とは別の道すじ）
  const cm = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]];
  const cdv = (x, y) => { const d = y[0] * y[0] + y[1] * y[1]; return [(x[0] * y[0] + x[1] * y[1]) / d, (x[1] * y[0] - x[0] * y[1]) / d]; };
  // 多項式の値（複素数 z。ホーナー法）
  const pv = (cs, z) => cs.reduce((acc, c) => { const t = cm(acc, z); return [t[0] + c, t[1]]; }, [0, 0]);
  // 多項式のすべての根（デュラン・カーナー法。数値で）。複素数 [実, 虚] の配列
  function roots(cs) {
    const n = cs.length - 1; if (n < 1) return [];
    const a = cs.map(c => c / cs[0]), R = 1 + Math.max(...a.slice(1).map(Math.abs));
    let z = Array.from({ length: n }, (_, k) => { const t = 0.4 + 2 * Math.PI * k / n; return [R * 0.8 * Math.cos(t), R * 0.8 * Math.sin(t)]; });
    for (let it = 0; it < 3000; it++) {
      let mv = 0;
      z = z.map((zi, i) => {
        let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cm(den, [zi[0] - zj[0], zi[1] - zj[1]]); });
        const d = cdv(pv(a, zi), den); mv = Math.max(mv, Math.hypot(...d)); return [zi[0] - d[0], zi[1] - d[1]];
      });
      if (mv < 1e-15) break;
    }
    return z;
  }
  const maxRe = cs => Math.max(...roots(cs).map(z => z[0]));
  // 数の組が、順を問わず同じか（重なりもふくめて）
  function sameSet(got, want, tol) {
    if (!got || got.length !== want.length || got.some(g => !g)) return false;
    const used = want.map(() => false);
    return got.every(g => { const k = want.findIndex((w, i) => !used[i] && nearC(g, w, tol || 1e-6)); if (k < 0) return false; used[k] = true; return true; });
  }
  // 答えの文の数（$…$ ごと。± は2つに。「＝」の左はとる。単位はのぞく）。複素数 [実, 虚] の配列
  function valsOf(t) {
    const out = [];
    for (let s of maths(t)) {
      s = noUnit(s);
      if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
      if (s.includes('\\pm')) { const [L, R] = s.split('\\pm'); const l = L.trim() || '0'; out.push(M.evalC(`(${l})+(${R})`, {}), M.evalC(`(${l})-(${R})`, {})); }
      else out.push(M.evalC(s, {}));
    }
    return out;
  }
  // 答えの k 番めの式（$s$ の式）が、関数 f(s)（実数）と数でくらべて同じか
  function fnSame(t, k, f) {
    let s = maths(t)[k || 0]; if (s == null) return false;
    if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
    return [0.37, 1.29, 2.71, 4.13].every(x => near(M.evalMath(s, { s: x }), f(x), 1e-8));
  }
  // いくつかの確かめを順に（はじめのまちがいの文を返す。どれもよければ true）
  const chk = (...xs) => { for (const x of xs) if (x !== true) return x || 'ちがう'; return true; };
  // 伝達関数の値（分子・分母の係数から）
  const gv = (num, den) => x => pv(num, [x, 0])[0] / pv(den, [x, 0])[0];
  // 1次・2次の線形の式を、ルンゲ・クッタ法でたどる（はじめは0。u(t) を入れる）。cs は左辺の係数（高い次から）、bs は右辺の u の係数
  function simulate(cs, uf, T, n) {
    n = n || 4000; const h = T / n, ord = cs.length - 1;
    const f = (t, y) => ord === 1 ? [(uf(t) - cs[1] * y[0]) / cs[0]] : [y[1], (uf(t) - cs[1] * y[1] - cs[2] * y[0]) / cs[0]];
    let y = Array(ord).fill(0), t = 0;
    for (let k = 0; k < n; k++) {
      const k1 = f(t, y), k2 = f(t + h / 2, y.map((v, i) => v + h / 2 * k1[i])), k3 = f(t + h / 2, y.map((v, i) => v + h / 2 * k2[i])), k4 = f(t + h, y.map((v, i) => v + h * k3[i]));
      y = y.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); t += h;
    }
    return y[0];
  }

  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない（S-4・U-3）。アプリで同じわざを多く出すとき（そのわざで20問をこえたら）は、よけない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
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

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  // 文の中の、はじめの \dfrac{分子}{分母}（かっこの数をかぞえて取り出す）。なければ null
  function dfracIn(q, from) {
    const k = String(q).indexOf('\\dfrac{', from || 0); if (k < 0) return null;
    const grab = i => { let dep = 0; for (let j = i; j < q.length; j++) { if (q[j] === '{') dep++; else if (q[j] === '}') { dep--; if (dep === 0) return [q.slice(i + 1, j), j + 1]; } } return null; };
    const a = grab(k + 6); if (!a) return null; const b = grab(a[1]); if (!b) return null;
    return { num: a[0], den: b[0], end: b[1] };
  }
  // 分母が「(s±a)・(s±σ)^2+ω^2・s^2+ω^2・s」のかけ算だけでできているか（分かれた形。9-68・9-71）。かっこの数を返す（ちがえば 0）
  function splitDen(den) {
    let t = String(den).replace(/\s+/g, '').replace(/\\\{/g, '[').replace(/\\\}/g, ']'), n = 0;
    if (/^s\^2\+[\d.]+(\^2)?$/.test(t) || /^\(s[+-][\d.]+\)\^2\+[\d.]+(\^2)?$/.test(t)) return 2;
    while (t.length) {
      let m;
      if ((m = /^\[(\(s[+-][\d.]+\)\^2|s\^2)\+[\d.]+(\^2)?\]/.exec(t)) || (m = /^\((\(s[+-][\d.]+\)\^2|s\^2)\+[\d.]+(\^2)?\)/.exec(t))) { n += 2; t = t.slice(m[0].length); continue; }
      if ((m = /^\(s[+-][\d.]+\)(\^[23])?/.exec(t))) { n += m[1] ? +m[1][1] : 1; t = t.slice(m[0].length); continue; }
      if ((m = /^s(?![\^\d])/.exec(t))) { n += 1; t = t.slice(1); continue; }
      return 0;
    }
    return n;
  }
  // 分母が展開した多項式（s^3+4s^2+…）か。次数を返す（ちがえば 0）
  function expDeg(den) {
    const t = String(den).replace(/\s+/g, '');
    if (!/^[\d.]*s(\^[234])?([+-][\d.]*s(\^[234])?)*([+-][\d.]+(\+K)?)?$/.test(t) && !/^[\d.]*s(\^[234])?([+-][\d.]*s(\^[234])?)*[+-]\([\d.]+\+[\d.]*K\)$/.test(t)) return 0;
    const m = t.match(/s\^([234])/g); return m ? Math.max(...m.map(x => +x[2])) : (/s/.test(t) ? 1 : 0);
  }
  const hasODE = q => /\\d?dot [a-z]|\\ddot [a-z]|\\dot [a-z]/.test(q);

  // ================================================================ 9-61 微分方程式から伝達関数
  // a_n y^{(n)} + … + a_0 y = b u → G = b / (a_n s^n + … + a_0)。G(0) = b / a_0。例 5ẏ+y=3u・2ẍ+ẋ+8x=f はよける（O-2）
  const EX61 = [[5, 1, 3], [2, 1, 8, 1]];
  const bad61 = v => EX61.some(e => exLike(v, e));
  // 左辺の式（y の微分。cs は高い次から）
  const dT = (cs, y) => { const n = cs.length - 1; return sum(cs.map((c, i) => { const d = n - i; return cf(c, d === 2 ? `\\ddot ${y}` : d === 1 ? `\\dot ${y}` : y); })); };
  const QG = '$G(s)=\\dfrac{Y}{U}$';
  add({
    id: '9-61', part: 5, chap: '9-8②③ 例題1', stars: 1,
    title: '伝達関数は $\\dot y\\to sY$、$\\ddot y\\to s^2Y$ として $\\dfrac YU$',
    mark: '微分方程式と「入れるもの $u$・出てくるもの $y$」。伝達関数 $G(s)$ と $G(0)$。',
    futsu: ['はじめの値も残して全体を変換し、', '$Y$ について解いてから、', 'はじめの値の項を0にして $U$ でわる'],
    raku: ['$5\\dot y+y=3u$ → $5sY+Y=3U$ → $G=\\dfrac{3}{5s+1}$、$G(0)=3$', '$2\\ddot x+\\dot x+8x=f$ → $G=\\dfrac{1}{2s^2+s+8}$', '$G(0)=\\dfrac18$（1 N で $\\dfrac18$ m のびる）'],
    why: '伝達関数は「はじめの値をすべて0にしたときの、出てくるもの÷入れるもの」（9-8②）。9-5 の微分の行で $\\dot y\\to sY$、$\\ddot y\\to s^2Y$、$u\\to U$ と置きかえ、$Y$ でくくって $\\dfrac YU$ にする（9-8③）。分母は 6-12 の特性方程式の左辺と同じ。$G(0)$ は $s=0$ を入れた値で、ゆっくり変えたときの倍率（定常のゲイン）。',
    caution: 'はじめの値（$y(0)$ など）は入れない（9-8 のまちがえやすいところ①）。入れるものの側に微分（$\\dot u$）があれば、$\\dot u\\to sU$ で分子が $s$ の式になる。$G(0)$ は分子と分母の定数の項どうしの比。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '34mm', s3: '34mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '9mm' },
    fits(q) {
      if (/路面|もど|フィードバック|直列|並列|ゆす|\\sin|\\cos|状態|y\(0\)=[1-9]|x\(0\)=[1-9]/.test(q)) return false;
      return (hasODE(q) || /台車.*ダンパー/.test(q)) && /伝達関数|G\(s\)|G\(0\)/.test(q);
    },
    steps: {
      // 1階の式
      s1(r) {
        const a = r.pick([2, 3, 4, 6, 8, 10, 20, 0.5, 0.2, 1.5]), c = r.pick([1, 1, 1, 2, 4, 5]), b = r.pick([1, 2, 3, 4, 5, 10, 0.5]);
        if (bad61([a, c, b]) || a === c) return null;
        const num = [b], den = [a, c];
        return { q: `$${dT([a, c], 'y')}=${cf(b, 'u')}$ の ${QG}`, a: `$${fracT(fmt(b), polyT(den))}$`, key: gkey(num, den), easyCheck: false,
          easy: `$${fmt(a)}sY+${c === 1 ? '' : fmt(c)}Y=${cf(b, 'U')}$ で $Y$ でくくる`,
          calc: { kind: 'fn', want: `${b}/(${a}*s+${c})`, vars: ['s'] } };
      },
      // 2階の式と G(0)
      s2(r) {
        const a = r.pick([1, 1, 2, 0.5, 4]), b = r.pick([1, 2, 3, 4, 5, 6, 0.4]), c = r.pick([1, 2, 4, 5, 8, 10, 16, 20, 25]), d = r.pick([1, 1, 2, 3, 5, 10]);
        if (bad61([a, b, c, d]) || d === c) return null;
        const num = [d], den = [a, b, c], y = r.pick(['y', 'x']), u = y === 'x' ? 'f' : 'u';
        return { q: `$${dT(den, y)}=${cf(d, u)}$（入れるもの $${u}$、出てくるもの $${y}$）の $G(s)$ ＝ □、$G(0)$ ＝ □`,
          a: `$${fracT(fmt(d), polyT(den))}$、$${numT(d / c)}$`, key: gkey(num, den), easyCheck: false,
          easy: `$(${polyT(den)})${y.toUpperCase()}=${cf(d, u.toUpperCase())}$、$G(0)$ は $s=0$ を入れる`,
          verify: p => chk(fnSame(p.a, 0, gv(num, den)) || '伝達関数がちがう', near(numOf(p.a, 1), d / c) || '$G(0)$ がちがう') };
      },
      // 見かけがちがう：移項した形・入れるものの微分・台車のことば
      s3(r) {
        const kind = turn(r, '61s3', 3);
        if (kind === 0) {   // ẏ = −p y + q u
          const p = r.pick([0.5, 2, 3, 4, 5, 0.1, 0.2]), q = r.pick([1, 2, 3, 4, 6, 10]);
          if (bad61([1, p, q])) return null;
          const num = [q], den = [1, p];
          return { q: `$\\dot y=${cf(-p, 'y')}+${cf(q, 'u')}$ の ${QG}`, a: `$${fracT(fmt(q), polyT(den))}$`, key: gkey(num, den), easyCheck: false,
            easy: `$${cf(p, 'y')}$ を左へ：$\\dot y+${cf(p, 'y')}=${cf(q, 'u')}$`,
            verify: p0 => fnSame(p0.a, 0, gv(num, den)) || '伝達関数がちがう' };
        }
        if (kind === 1) {   // ÿ + b ẏ + c y = u̇ + z u
          const pr = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [2, 5], [1, 5], [3, 4]]), b = pr[0] + pr[1], c = pr[0] * pr[1], z = r.pick([1, 2, 3, 4, 5, 6].filter(v => !pr.includes(v)));
          const num = [1, z], den = [1, b, c];
          return { q: `$\\ddot y+${b}\\dot y+${c}y=\\dot u+${z}u$ の ${QG}`, a: `$${fracT(`s+${z}`, polyT(den))}$`, key: gkey(num, den), easyCheck: false,
            easy: `右辺も $\\dot u\\to sU$ と置きかえ、$(s+${z})U$ でくくる`,
            verify: p0 => fnSame(p0.a, 0, gv(num, den)) || '伝達関数がちがう' };
        }
        const m = r.pick([1, 2, 4, 0.5]), c = r.pick([2, 3, 4, 6, 10]), k = r.pick([5, 10, 20, 25, 40, 50, 100]);
        if (bad61([m, c, k, 1])) return null;
        const num = [1], den = [m, c, k];
        return { q: `質量 $${U(fmt(m), 'kg')}$ の台車を、ダンパー $${U(c, 'N\\cdot s/m')}$ とばね $${U(k, 'N/m')}$ でかべにつなぐ。力 $f$ を入れ、位置 $x$ が出てくるときの $G(s)$ ＝ □、$G(0)$ ＝ □`,
          a: `$${fracT(1, polyT(den))}$、$${frac(1, k)}$`, key: gkey(num, den), easyCheck: false,
          easy: `$${dT(den, 'x')}=f$ を変換`,
          verify: p0 => chk(fnSame(p0.a, 0, gv(num, den)) || '伝達関数がちがう', near(numOf(p0.a, 1), 1 / k) || '$G(0)$ がちがう') };
      },
      // わな：はじめの値があり、入れるものが0 → 9-44（1階の式を変換して解く）
      trap(r) {
        const a = r.pick([2, 4, 10, 0.5, 0.25]), y0 = r.pick([3, 4, 5, 10, 20]);
        return dest({ q: `$${dT([a, 1], 'y')}=u$ で、$y(0)=${y0}$、$u=0$ のときの $y(t)$`, a: `$y=${y0}${eT(-1 / a)}$`, key: `61t:${a}:${y0}`,
          calc: { kind: 'ode', x: 't', coef: [a, 1], rhs: '0', init: [[0, y0]] } }, '9-61',
          'はじめの値がある動き。伝達関数（はじめの値0）ではなく、1階の式を変換して $Y(s)$ を出し、もどす', ['9-44']);
      },
    },
  });

  // ================================================================ 9-62 直列はかけ算、並列はたし算
  // 例：直列 2/(s+1)・5/(s+4)=10/((s+1)(s+4))、G(0)=2.5。並列 1/(s+1)+1/(s+4)=(2s+5)/((s+1)(s+4))（O-2）
  const bad62 = (a, p, b, q) => exLike([a, p, b, q], [2, 1, 5, 4]) || exLike([a, p, b, q], [1, 1, 1, 4]) || (exLike([p, q], [1, 4]) && a === b);
  const firstT = (a, p) => fracT(fmt(a), p === 0 ? 's' : `s+${fmt(p)}`);
  const tauT = (a, t) => fracT(fmt(a), polyT([t, 1]));
  // ブロック線図：直列（U → G1 → G2 → Y）
  function figSeries(t1, t2) {
    // 箱のはばは、アプリで分数が「20/(0.5s+1)」の1行（字の高さ 3.4 mm）になっても入るように 4.4（図のはばは 56 mm）
    return { s: 5, items: [...M.blkArrow([[0, 0], [0.8, 0]]), ...M.blkBox([3.0, 0], 4.4, 1.5, t1), ...M.blkArrow([[5.2, 0], [6.0, 0]]), ...M.blkBox([8.2, 0], 4.4, 1.5, t2),
      ...M.blkArrow([[10.4, 0], [11.2, 0]]), ['label', [0, 0], '$U$', 'w'], ['label', [11.2, 0], '$Y$', 'e']] };
  }
  // ブロック線図：並列（U が分かれて G1・G2 に入り、加え合わせ点でたす）
  function figParallel(t1, t2) {
    return { s: 5, items: [['seg', [0, 0], [1.2, 0]], ...M.blkBranch([1.2, 0]), ...M.blkArrow([[1.2, 0], [1.2, 1.1], [2.2, 1.1]]), ...M.blkArrow([[1.2, 0], [1.2, -1.1], [2.2, -1.1]]),
      ...M.blkBox([3.6, 1.1], 2.8, 1.5, t1), ...M.blkBox([3.6, -1.1], 2.8, 1.5, t2),
      ...M.blkArrow([[5.0, 1.1], [6.3, 1.1], [6.3, 0.35]]), ...M.blkArrow([[5.0, -1.1], [6.3, -1.1], [6.3, -0.35]]), ...M.blkSum([6.3, 0], { n: '+', s: '+' }),
      ...M.blkArrow([[6.65, 0], [7.9, 0]]), ['label', [0, 0], '$U$', 'w'], ['label', [7.9, 0], '$Y$', 'e']] };
  }
  const P62 = [0.5, 1, 2, 3, 4, 5, 10];
  add({
    id: '9-62', part: 5, chap: '9-8⑤ 例題2・3', stars: 1,
    title: '直列はかけ算、並列はたし算（通分して1つの分数に）',
    mark: '箱を1列につなぐ。同じものを2つの箱に分けて入れ、出たものをたす。',
    futsu: ['1つめの箱から出たものを時間の世界にもどし、', '2つめの箱の微分方程式に入れて解いてから、', 'もう一度変換して $\\dfrac YU$ を作る'],
    raku: ['直列 $\\dfrac{2}{s+1}\\cdot\\dfrac{5}{s+4}=\\dfrac{10}{(s+1)(s+4)}$', '$G(0)=\\dfrac{10}{1\\times4}=2.5$', '並列 $\\dfrac{1}{s+1}+\\dfrac{1}{s+4}=\\dfrac{2s+5}{(s+1)(s+4)}$'],
    why: '直列は、前の箱から出た $G_1U$ を次の箱に入れるので $Y=G_2G_1U$（9-8⑤）。伝達関数はただの分数の式なので、順番を入れかえてもよい。並列は、同じ $U$ が2つの箱に入り、出たものをたすので $Y=(G_1+G_2)U$。通分して1つの分数にする。',
    caution: '並列は分母をそろえてから分子をたす（分母どうし・分子どうしをたさない）。直列の $G(0)$ は $G_1(0)\\times G_2(0)$。出口をはかって入口へもどす線があれば、フィードバック（わざ 9-63）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '26mm', s3: '26mm', trap: '20mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return (/直列|並列|出たものをたす|出たものを.*箱に入れ/.test(q) || /図の全体の \$G\(s\)/.test(q)) && !/もど|フィードバック|比例|dB/.test(q); },
    steps: {
      // 直列（伝達関数か G(0)）
      s1(r) {
        const a = r.pick([1, 2, 3, 4, 6, 8, 10]), b = r.pick([1, 2, 3, 5, 6, 10]), [p, q] = r.shuffle(P62).slice(0, 2).sort((x, y) => x - y);
        if (bad62(a, p, b, q)) return null;
        const num = [a * b], den = pmul([1, p], [1, q]), g0 = a * b / (p * q);
        if (peek(r, '62s1', 2) === 0) {
          adv(r, '62s1', 2);
          return { q: `$${firstT(a, p)}$ と $${firstT(b, q)}$ を直列につないだ全体の $G(s)$`, a: `$${fracT(fmt(a * b), `${fac(p)}${fac(q)}`)}$`, key: gkey(num, den), easyCheck: false,
            easy: '分子どうし・分母どうしをかける', verify: p0 => fnSame(p0.a, 0, x => a / (x + p) * b / (x + q)) || 'かけ算とちがう' };
        }
        if (near(g0, 2.5)) return null;
        adv(r, '62s1', 2);
        return { q: `$${firstT(a, p)}$ と $${firstT(b, q)}$ を直列につないだ全体の $G(0)$`, a: `$${numT(g0)}$`, key: gkey(num, den), easyCheck: false,
          easy: `$G_1(0)\\times G_2(0)=${numT(a / p)}\\times${numT(b / q)}$`, verify: p0 => near(numOf(p0.a), (a / p) * (b / q)) || '定常のゲインがちがう' };
      },
      // 並列（1つの分数に）
      s2(r) {
        if (turn(r, '62s2', 3) === 2) {   // 定数の箱（そのまま通す線）と1次の箱
          const c = r.pick([1, 2, 3]), b = r.pick([1, 2, 4, 5, 6]), q = r.pick([1, 2, 3, 5, 10]);
          if (b === q) return null;
          const num = [c, c * q + b], den = [1, q];
          return { q: `$${c}$ 倍する箱と $${firstT(b, q)}$ を並列につないだ全体の $G(s)$`, a: `$${fracT(polyT(num), `s+${q}`)}$`, key: gkey(num, den), easyCheck: false,
            easy: `$${c}=\\dfrac{${c === 1 ? '' : c}(s+${q})}{s+${q}}$ と通分`, verify: p0 => fnSame(p0.a, 0, x => c + b / (x + q)) || 'たし算とちがう' };
        }
        const a = r.pick([1, 2, 3, 4, 5]), b = r.pick([1, 2, 3, 4, 6]), [p, q] = r.shuffle(P62).slice(0, 2).sort((x, y) => x - y);
        if (bad62(a, p, b, q) || exLike([a, p, b, q], [2, 1, 3, 2])) return null;
        const num = [a + b, a * q + b * p], den = pmul([1, p], [1, q]);
        return { q: `$${firstT(a, p)}$ と $${firstT(b, q)}$ を並列につないだ全体の $G(s)$`, a: `$${fracT(polyT(num), `${fac(p)}${fac(q)}`)}$`, key: gkey(num, den), easyCheck: false,
          easy: `分子 $${a}${fac(q)}+${b}${fac(p)}$`, verify: p0 => fnSame(p0.a, 0, x => a / (x + p) + b / (x + q)) || 'たし算とちがう' };
      },
      // 見かけがちがう：ブロック線図（直列は τ の形と最後の値、並列は1つの分数）
      s3(r) {
        if (turn(r, '62s3', 2) === 0) {
          const t1 = r.pick([0.1, 0.2, 0.5, 2]), t2 = r.pick([5, 10, 20, 50]), a = r.pick([2, 4, 5, 10, 20, 50]), b = r.pick([0.1, 0.2, 0.5, 2, 3]), u0 = r.pick([2, 3, 5, 10]);
          const g0 = a * b; if (!Number.isInteger(+(g0 * u0).toFixed(6)) || near(g0, 2.5)) return null;
          const num = [a * b], den = pmul([t1, 1], [t2, 1]);
          return { q: `図の全体の $G(s)$ ＝ □、$u=${u0}$ を入れ続けた最後の $y$ ＝ □`, a: `$${fracT(fmt(a * b), `(${polyT([t1, 1])})(${polyT([t2, 1])})`)}$、$${fmt(g0 * u0)}$`, key: gkey(num, den), easyCheck: false,
            easy: `直列はかけ算。$G(0)=${fmt(a)}\\times${fmt(b)}$`, fig: figSeries(`$\\frac{${fmt(a)}}{${polyT([t1, 1])}}$`, `$\\frac{${fmt(b)}}{${polyT([t2, 1])}}$`),
            verify: p0 => chk(fnSame(p0.a, 0, x => a / (t1 * x + 1) * b / (t2 * x + 1)) || '直列の伝達関数がちがう', near(numOf(p0.a, 1), simulate(den, () => a * b * u0, 25 * t2, Math.ceil(25 * t2 / (0.2 * t1))), 1e-6) || '最後の値がちがう') };
        }
        const a = r.pick([1, 2, 3, 4]), b = r.pick([1, 2, 3, 5]), [p, q] = r.shuffle([1, 2, 3, 4, 5]).slice(0, 2).sort((x, y) => x - y);
        if (bad62(a, p, b, q) || exLike([a, p, b, q], [2, 1, 3, 2])) return null;
        const num = [a + b, a * q + b * p], den = pmul([1, p], [1, q]);
        return { q: '図の全体の $G(s)=\\dfrac{Y}{U}$', a: `$${fracT(polyT(num), `${fac(p)}${fac(q)}`)}$`, key: gkey(num, den), easyCheck: false,
          easy: '同じ $U$ が2つに分かれ、○でたす：並列のたし算', fig: figParallel(`$\\frac{${a}}{s+${p}}$`, `$\\frac{${b}}{s+${q}}$`),
          verify: p0 => fnSame(p0.a, 0, x => a / (x + p) + b / (x + q)) || 'たし算とちがう' };
      },
      // わな：出口をはかってもどす → 9-63
      trap(r) {
        const a = r.pick([2, 3, 5, 6, 8]), p = r.pick([1, 2, 3, 4]);
        if (a === 4 && p === 1) return null;
        return dest({ q: `箱 $${firstT(a, p)}$ の出口をはかり、ずれ（目標－出口）を入口へもどした全体の伝達関数`, a: `$${firstT(a, p + a)}$`, key: gkey([a], [1, p + a]),
          verify: p0 => fnSame(p0.a, 0, x => (a / (x + p)) / (1 + a / (x + p))) || 'フィードバックの式とちがう' }, '9-62',
          'もどす線がある。直列・並列ではなく、フィードバックの $\\dfrac{G_1}{1+G_1G_2}$', ['9-63']);
      },
    },
  });

  // ================================================================ 9-63 フィードバック G1/(1+G1G2)
  // 例：G1=4/(s+1)、G2=1 → 4/(s+5)、定常のゲイン 4/5、ずれ20 %（O-2）
  // ブロック線図：R → ○（＋・−）→ [箱1] → [箱2] → Y、出口から分かれて（[G2] を通って）○へもどす
  function figFeedback(boxes, g2, minus) {
    const its = [...M.blkArrow([[-1.3, 0], [-0.35, 0]]), ...M.blkSum([0, 0], { w: '+', s: minus === false ? '+' : '-' })];
    let x = 0.35;
    boxes.forEach((t, i) => { const w = i === boxes.length - 1 ? 4.2 : 1.6; its.push(...M.blkArrow([[x, 0], [x + 0.9, 0]]), ...M.blkBox([x + 0.9 + w / 2, 0], w, 1.5, t)); x += 0.9 + w; });
    const xb = x + 0.8, xe = x + 1.7;
    its.push(...M.blkArrow([[x, 0], [xe, 0]]), ...M.blkBranch([xb, 0]), ['label', [-1.3, 0], '$R$', 'w'], ['label', [xe, 0], '$Y$', 'e']);
    if (g2) its.push(...M.blkArrow([[xb, 0], [xb, -2], [xb / 2 + 1.4, -2]]), ...M.blkBox([xb / 2, -2], 2.8, 1.4, g2), ...M.blkArrow([[xb / 2 - 1.4, -2], [0, -2], [0, -0.35]]));
    else its.push(...M.blkArrow([[xb, 0], [xb, -1.6], [0, -1.6], [0, -0.35]]));
    return { s: 5, items: its };
  }
  add({
    id: '9-63', part: 5, chap: '9-8⑦ 例題4・5', stars: 1,
    title: '引いてもどすフィードバックは $\\dfrac{G_1}{1+G_1G_2}$',
    mark: '出口をはかって、入れる側へ引いてもどす線。全体の伝達関数。',
    futsu: ['$G_1=\\dfrac{4}{s+1}$ を分数のまま', '$\\dfrac{G_1}{1+G_1G_2}$ に入れ、分母の $1+\\dfrac{4}{s+1}$ を', '通分してから、分数を分数でわる'],
    raku: ['$G_1=\\dfrac{4}{s+1}$、$G_2=1$', '分母・分子に $s+1$ をかけて $\\dfrac{4}{s+1+4}=\\dfrac{4}{s+5}$', '定常のゲイン $\\dfrac45$、ずれ20 %'],
    why: '1周の式 $Y=G_1(R-G_2Y)$ を $Y$ について解くと $\\dfrac YR=\\dfrac{G_1}{1+G_1G_2}$（9-8⑦）。$G_1=\\dfrac ND$ なら、分母・分子に $D$ をかけて $\\dfrac{N}{D+NG_2}$。$G_2=1$ なら「分母に分子をたす」だけ。',
    caution: '引いてもどす（加え合わせ点が $-$）なら $1+G_1G_2$。たしてもどすときだけ $1-G_1G_2$（9-8 のまちがえやすいところ②）。$K_{\\mathrm p}$ 倍してから箱に入れるときは、$G_1$ は直列のかけ算 $K_{\\mathrm p}\\times G$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '24mm', s3: '22mm', trap: '24mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /もど|フィードバック/.test(q) && /伝達関数|G\(s\)|全体/.test(q) && !/極|ずれの積分|K_\{\\mathrm i\}|時定数|残る|範囲/.test(q); },
    steps: {
      // G2 = 1
      s1(r) {
        const a = r.pick([1, 2, 3, 5, 6, 8, 9, 10]);
        if (turn(r, '63s1', 2) === 0) {
          const p = r.pick([0.5, 1, 2, 3, 4, 5]); if (exLike([a, p], [4, 1])) return null;
          return { q: `$G_1=${firstT(a, p)}$ を $G_2=1$ で引いてもどした全体`, a: `$${firstT(a, p + a)}$`, key: gkey([a], [1, p + a]), easyCheck: false,
            easy: `分母・分子に $s+${fmt(p)}$ をかけ、分母に分子 $${a}$ をたす`, verify: p0 => fnSame(p0.a, 0, x => (a / (x + p)) / (1 + a / (x + p))) || '式とちがう' };
        }
        const t = r.pick([0.5, 2, 4, 5, 10, 0.2]); if (exLike([a, t], [4, 1])) return null;
        return { q: `$G_1=${tauT(a, t)}$ を $G_2=1$ で引いてもどした全体`, a: `$${fracT(fmt(a), polyT([t, 1 + a]))}$`, key: gkey([a], [t, 1 + a]), easyCheck: false,
          easy: `分母・分子に $${polyT([t, 1])}$ をかける`, verify: p0 => fnSame(p0.a, 0, x => (a / (t * x + 1)) / (1 + a / (t * x + 1))) || '式とちがう' };
      },
      // G2 が1でない（はかる箱の倍率・1次おくれ）
      s2(r) {
        const a = r.pick([1, 2, 3, 4, 5, 6]), p = r.pick([1, 2, 3, 4]);
        if (turn(r, '63s2', 2) === 0) {
          const b = r.pick([0.5, 2, 3, 4]); if (exLike([a, p], [4, 1]) && b === 1) return null;
          return { q: `$G_1=${firstT(a, p)}$、$G_2=${fmt(b)}$ で引いてもどした全体`, a: `$${firstT(a, p + a * b)}$`, key: gkey([a], [1, p + a * b]), easyCheck: false,
            easy: `分母・分子に $s+${p}$ をかけて、分母に $${a}\\times${fmt(b)}$ をたす`, verify: p0 => fnSame(p0.a, 0, x => (a / (x + p)) / (1 + a * b / (x + p))) || '式とちがう' };
        }
        const b = r.pick([1, 2, 3]), q = r.pick([1, 2, 5, 10].filter(v => v !== p));
        const num = [a, a * q], den = padd(pmul([1, p], [1, q]), [a * b]);
        return { q: `$G_1=${firstT(a, p)}$、$G_2=${firstT(b, q)}$ で引いてもどした全体`, a: `$${fracT(a === 1 ? `s+${q}` : `${a}(s+${q})`, polyT(den))}$`, key: gkey(num, den), easyCheck: false,
          easy: `分母・分子に $(s+${p})(s+${q})$ をかける`, verify: p0 => fnSame(p0.a, 0, x => (a / (x + p)) / (1 + a / (x + p) * b / (x + q))) || '式とちがう' };
      },
      // 見かけがちがう：ブロック線図（比例の強さ K_p をかけてから箱・たしてもどす）
      s3(r) {
        if (turn(r, '63s3', 2) === 0) {
          const a = r.pick([2, 5, 10, 20]), t = r.pick([0.5, 2, 4, 5]), kp = r.pick([0.1, 0.2, 0.5, 2, 3]), g = trim0(a * kp);
          if (!Number.isInteger(g) || exLike([g, t], [4, 1])) return null;
          return { q: `$K_{\\mathrm p}=${fmt(kp)}$ をかけてから箱に入れ、引いてもどす図の全体 $\\dfrac YR$`, a: `$${fracT(fmt(g), polyT([t, 1 + g]))}$`, key: gkey([g], [t, 1 + g]), easyCheck: false,
            easy: `$G_1=${fmt(kp)}\\times${tauT(a, t)}=${tauT(g, t)}$`, fig: figFeedback(['$K_{\\mathrm p}$', `$\\frac{${a}}{${polyT([t, 1])}}$`], null),
            verify: p0 => fnSame(p0.a, 0, x => (kp * a / (t * x + 1)) / (1 + kp * a / (t * x + 1))) || '式とちがう' };
        }
        const a = r.pick([1, 2, 3]), p = r.pick([4, 5, 6, 8, 10]);
        return { q: '出口を○へ「たして」もどす（符号が $+$）図の全体 $\\dfrac YR$', a: `$${firstT(a, p - a)}$`, key: gkey([a], [1, p - a]), easyCheck: false,
          easy: `たしてもどすので $\\dfrac{G_1}{1-G_1}$。分母は $s+${p}-${a}$`, fig: figFeedback([`$\\frac{${a}}{s+${p}}$`], null, false),
          verify: p0 => fnSame(p0.a, 0, x => (a / (x + p)) / (1 - a / (x + p))) || '式とちがう' };
      },
      // わな：直列 → 9-62
      trap(r) {
        const a = r.pick([2, 3, 4, 5]), b = r.pick([1, 2, 3]), p = r.pick([1, 2]), q = r.pick([3, 4, 5]);
        return dest({ q: `$${firstT(a, p)}$ の箱から出たものを $${firstT(b, q)}$ の箱に入れた全体`, a: `$${fracT(fmt(a * b), `${fac(p)}${fac(q)}`)}$`, key: gkey([a * b], pmul([1, p], [1, q])),
          verify: p0 => fnSame(p0.a, 0, x => a / (x + p) * b / (x + q)) || 'かけ算とちがう' }, '9-63',
          'もどす線がない。1列につないだ直列なので、かけ算', ['9-62']);
      },
    },
  });

  // ================================================================ 9-64 ステップ応答は G/s、インパルス応答は G
  // 例：G=3/(s+3) に大きさ4のステップ → 4−4e^{−3t}、インパルス → 3e^{−3t}（O-2）
  const bad64 = (a, p) => exLike([a, p], [3, 3]) && a === p;
  add({
    id: '9-64', part: 5, chap: '9-8④ 例題7・9-6⑦ 例題6', stars: 1,
    title: 'ステップ応答は $\\dfrac Gs$、インパルス応答は $G$ そのものを表でもどす',
    mark: '「入れ続けたとき」「ポンとたたいたとき」の出てくるもの $y(t)$。',
    futsu: ['伝達関数を微分方程式にもどし、', '右辺に入れたものを書いて、', '6-4・6-12 の方法で解く'],
    raku: ['$G=\\dfrac{3}{s+3}$ に大きさ4のステップ', '→ $\\dfrac{12}{s(s+3)}=\\dfrac4s-\\dfrac{4}{s+3}$ → $4-4e^{-3t}$', 'インパルス → $3e^{-3t}$（$\\delta\\to1$）'],
    why: '$Y=GU$ なので、大きさ $h$ のステップは $U=\\dfrac hs$、インパルスは $U=1$（9-6 の $\\delta(t)\\to1$）。$G\\times\\dfrac hs$ や $G$ を部分分数に分けて、表を逆に引く（9-7）。はじめの値は0のまま。',
    caution: '$G(s)$ の $s$ に時刻を入れない（$s$ は時刻ではない。9-8 のまちがえやすいところ⑥）。$\\dfrac{a}{\\tau s+1}$ は $\\dfrac{a/\\tau}{s+1/\\tau}$ に直してからもどす。ステップの答えは $t=0$ で0、最後は $hG(0)$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '30mm', s3: '42mm', trap: '20mm' },
    fits(q) { return /ステップ|インパルス|入れ続け|たたいた|力積/.test(q) && !/\\sin|\\cos|表|63\.2|最後の値が|最後の値の|行きすぎ|最初の山|極|動き|直列|図/.test(q); },
    steps: {
      // 1次の箱：ステップ応答・インパルス応答
      s1(r) {
        const p = r.pick([1, 2, 4, 5, 0.5, 0.2, 10]);
        if (peek(r, '64s1', 2) === 0) {
          const c = r.pick([1, 2, 3, 5, 6, 10]), h = r.pick([1, 2, 3, 5]), a = trim0(c * p / h);
          if (!Number.isInteger(a * 10) || bad64(a, p) || a > 50) return null;
          adv(r, '64s1', 2);
          return { q: `$G=${firstT(a, p)}$ に、大きさ $${h}$ のステップを入れたときの $y(t)$`, a: `$y=${c}-${c}${eT(-p)}$`, key: gkey([a], [1, p]) + `:h${h}`, easyCheck: false,
            easy: `$\\dfrac{${fmt(a * h)}}{s(s+${fmt(p)})}=\\dfrac{${c}}{s}-\\dfrac{${c}}{s+${fmt(p)}}$`,
            calc: { kind: 'ode', x: 't', coef: [1, p], rhs: String(a * h), init: [[0, 0]] } };
        }
        const a = r.pick([2, 3, 4, 5, 6, 10, 0.5]); if (bad64(a, p)) return null;
        adv(r, '64s1', 2);
        return { q: `$G=${firstT(a, p)}$ のインパルス応答 $y(t)$`, a: `$y=${fmt(a)}${eT(-p)}$`, key: gkey([a], [1, p]) + ':i', easyCheck: false,
          easy: '$U=1$ なので $G$ そのものをもどす', calc: { kind: 'ode', x: 't', coef: [1, p], rhs: '0', init: [[0, a]] } };
      },
      // 2次の箱のインパルス応答・τ の形のステップ応答
      s2(r) {
        if (turn(r, '64s2', 2) === 0) {
          const [p, q] = r.pick([[1, 2], [1, 3], [2, 3], [1, 4], [2, 4], [1, 5], [2, 5], [3, 5]]), c = r.pick([1, 2, 3, 4]), a = c * (q - p);
          return { q: `$G=${fracT(a, `${fac(p)}${fac(q)}`)}$ のインパルス応答 $y(t)$`, a: `$y=${c === 1 ? '' : c}${eT(-p)}-${c === 1 ? '' : c}${eT(-q)}$`, key: gkey([a], pmul([1, p], [1, q])) + ':i', easyCheck: false,
            easy: `かくす方法で $\\dfrac{${c}}{s+${p}}-\\dfrac{${c}}{s+${q}}$`, calc: { kind: 'ode', x: 't', coef: [1, p + q, p * q], rhs: '0', init: [[0, 0], [0, a, 1]] } };
        }
        const t = r.pick([2, 4, 5, 10, 20, 30]), a = r.pick([1, 2, 3, 5]), h = r.pick([2, 3, 4, 10]), c = a * h;
        return { q: `$G=${tauT(a, t)}$ に、大きさ $${h}$ のステップを入れたときの $y(t)$`, a: `$y=${c}-${c}${eT(-1 / t)}$`, key: gkey([a], [t, 1]) + `:h${h}`, easyCheck: false,
          easy: `$\\dfrac{${a}}{${t}s+1}\\cdot\\dfrac{${h}}{s}=${c}\\Bigl(\\dfrac1s-\\dfrac{1}{s+1/${t}}\\Bigr)$`,
          calc: { kind: 'ode', x: 't', coef: [t, 1], rhs: String(c), init: [[0, 0]] } };
      },
      // 見かけがちがう：車のからだ（力を入れ続ける・力積でおす）と、時定数の時刻の値
      s3(r) {
        const [m, c] = r.pick([[800, 40], [1200, 60], [1200, 40], [1500, 50], [2000, 100], [2000, 80], [1000, 40], [900, 30]]), tau = m / c;
        if (peek(r, '64s3', 2) === 0) {
          const F = r.pick([200, 240, 300, 400, 600, 800]), vf = F / c;
          if (!Number.isInteger(vf * 10)) return null;
          const byText = vf * (1 - 0.3679), truth = vf * (1 - Math.exp(-1));
          if (byText.toFixed(2) !== truth.toFixed(2)) return null;
          adv(r, '64s3', 2);
          return { q: `車のからだ $G=${fracT(1, `${m}s+${c}`)}$（力→速さ）に、$${U(F, 'N')}$ の力を入れ続けた。速さ $v$ ＝ □、$${tau}$ 秒後の速さ ＝ 約 $□\\,\\mathrm{m/s}$（$e^{-1}=0.3679$、小数第2位まで）`,
            a: `$v=${fmt(vf)}-${fmt(vf)}${eT(-c / m)}$、約 $${byText.toFixed(2)}$`, key: gkey([1], [m, c]) + `:F${F}`, easyCheck: false,
            easy: `$\\dfrac{${F}}{s(${m}s+${c})}$ を部分分数に`,
            calc: { kind: 'ode', x: 't', coef: [m, c], rhs: String(F), init: [[0, 0]], ans: `${fmt(vf)}-${fmt(vf)}${eT(-c / m)}` },
            verify: p0 => near(numOf(p0.a, 1), +truth.toFixed(2)) || '約の値がちがう' };
        }
        const J = r.pick([400, 600, 800, 1200, 1600, 2000, 3000]), v0 = J / m;
        if (!Number.isInteger(v0 * 10)) return null;
        const byText = v0 * 0.3679, truth = v0 * Math.exp(-1);
        if (byText.toFixed(2) !== truth.toFixed(2)) return null;
        adv(r, '64s3', 2);
        return { q: `止まった車（$G=${fracT(1, `${m}s+${c}`)}$、力→速さ）を、力積 $${U(J, 'N\\cdot s')}$ で後ろからおした（インパルス）。速さ $v$ ＝ □、$${tau}$ 秒後の速さ ＝ 約 $□\\,\\mathrm{m/s}$（$e^{-1}=0.3679$、小数第2位まで）`,
          a: `$v=${fmt(v0)}${eT(-c / m)}$、約 $${byText.toFixed(2)}$`, key: gkey([1], [m, c]) + `:J${J}`, easyCheck: false,
          easy: `$V=\\dfrac{${J}}{${m}s+${c}}=\\dfrac{${fmt(v0)}}{s+${fmt(c / m)}}$`,
          calc: { kind: 'ode', x: 't', coef: [m, c], rhs: '0', init: [[0, v0]], ans: `${fmt(v0)}${eT(-c / m)}` },
          verify: p0 => near(numOf(p0.a, 1), +truth.toFixed(2)) || '約の値がちがう' };
      },
      // わな：sin を入れて落ち着いたときの倍率 → 9-65
      trap(r) {
        const [p, w, h] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]]), a = r.pick([2, 3, 4, 5, 10]);
        return dest({ q: `$G=${firstT(a, p)}$ に $\\sin${w}t$ を入れ続けて落ち着いたときの、ゆれの大きさの倍率`, a: `$${frac(a, h)}$`, key: `64t:${a}:${p}:${w}`,
          verify: p0 => near(numOf(p0.a), Math.hypot(...cdv([a, 0], [p, w]))) || '倍率がちがう' }, '9-64',
          '$\\sin$ を入れて落ち着いた倍率は、もどさなくても $s=j\\omega$ を入れるだけ', ['9-65']);
      },
    },
  });
  // ================================================================ 9-65 周波数応答は s=jω を入れるだけ
  // 例：G=1/(s^2+s+4)、ω=2 → 分母 2j → 倍率 1/2、おくれ90°（O-2）。分母が実数か純虚数になる ω を先に選ぶ（W-6）
  const bad65 = (K, b, c) => exLike([K, b, c], [1, 1, 4]);
  const TRI = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15]];
  // r/√2 を √2 の形に（2/√2 → √2、3/√2 → 3√2/2）
  function s2T(rr) {
    const f = toFr(rr / 2); if (!f) return null; const [n, d] = f;
    const top = `${n === 1 ? '' : n}\\sqrt2`;
    return d === 1 ? top : `\\dfrac{${top}}{${d}}`;
  }
  const absG = (num, den, w) => Math.hypot(...cdv(pv(num, [0, w]), pv(den, [0, w])));
  const lagG = (num, den, w) => { const z = cdv(pv(num, [0, w]), pv(den, [0, w])); let a = -Math.atan2(z[1], z[0]) * 180 / Math.PI; if (a < -1e-9) a += 360; return a; };
  const DEG = '°';
  const sinT = w => (w === 1 ? '\\sin t' : `\\sin${w}t`);
  const jT = v => (v === 1 ? 'j' : `${fmt(v)}j`);
  add({
    id: '9-65', part: 5, chap: '9-8⑧ 例題8', stars: 1,
    title: '周波数応答は $s=j\\omega$ を入れるだけ（倍率は $\\lvert G(j\\omega)\\rvert$）',
    mark: '「$\\sin$ でゆすったときの、落ち着いたゆれの倍率・おくれ」。',
    futsu: ['$U=\\mathcal L[\\sin\\omega t]=\\dfrac{\\omega}{s^2+\\omega^2}$ を $G$ にかけ、', '部分分数に分けて時間の世界にもどし、', '消えない $\\sin$ と $\\cos$ の項をまとめる'],
    raku: ['$G=\\dfrac{1}{s^2+s+4}$、$\\omega=2$ → $s=2j$', '分母 $-4+2j+4=2j$（純虚数）', '倍率 $\\dfrac12$、おくれ90°（変換も逆変換もしない）'],
    why: '$\\sin\\omega t$ を入れ続けると、出てくるものも同じ $\\omega$ の $\\sin$ になり、変わるのは大きさとおくれだけ（9-8⑧）。その倍率が $\\lvert G(j\\omega)\\rvert$、おくれが $G(j\\omega)$ の角の大きさ。$G=\\dfrac{K}{\\text{分母}}$ なら、分母に $s=j\\omega$ を入れた点の大きさでわり、その点の角がおくれ。$s^2=(j\\omega)^2=-\\omega^2$。',
    caution: '分母の点が右上なら角は $\\tan^{-1}$、左上なら $180^{\\circ}$ から引く。分母が正の実数ならおくれ0°、負の実数なら180°、$j$ の正の数倍なら90°。$G(0)$ は $\\omega=0$（ゆっくり）のときの倍率。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '24mm', trap: '16mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) { return /\\sin|\\cos|ゆす/.test(q) && /倍率|おくれ|ゆれの大きさ/.test(q) && !/dB|\\log/.test(q); },
    steps: {
      // 倍率だけ（2次の分母で ω^2=定数の項、1次の分母で三平方の数）
      s1(r) {
        if (turn(r, '65s1', 2) === 0) {
          const w = r.pick([1, 2, 3, 4, 5, 10]), b = r.pick([0.5, 1, 2, 3, 4, 5]), K = r.pick([1, 2, 3, 4, 5, 10, 20]), c = w * w;
          if (bad65(K, b, c)) return null;
          const num = [K], den = [1, b, c], g = K / (b * w);
          return { q: `$G=${fracT(K, polyT(den))}$ に $${sinT(w)}$ を入れ続けたときの、落ち着いたゆれの倍率`, a: `$${frT(g)}$`, key: gkey(num, den) + `:w${w}`, easyCheck: false,
            easy: `分母 $${polyT([1, b, c], `(${jT(w)})`)}=${jT(b * w)}$`, verify: p => near(numOf(p.a), absG(num, den, w)) || '倍率がちがう' };
        }
        const [a, w, h] = r.pick(TRI), K = r.pick([1, 2, 3, 5, 10, 13, 15, 20, 30]);
        const num = [K], den = [1, a];
        return { q: `$G=${firstT(K, a)}$ に $\\sin${w}t$ を入れ続けたときの、落ち着いたゆれの倍率`, a: `$${frac(K, h)}$`, key: `65t:${K}:${Math.min(a, w)}:${Math.max(a, w)}`, easyCheck: false,   // a と ω を入れかえただけの組は同じ key（U-2）
          easy: `分母 $${a}+${w}j$ の大きさ $\\sqrt{${a}^2+${w}^2}=${h}$`, verify: p => near(numOf(p.a), absG(num, den, w)) || '倍率がちがう' };
      },
      // 倍率とおくれ（90°・45°・0°・180° を回す）
      s2(r) {
        const kind = peek(r, '65s2', 4);
        let num, den, w, gT, lag, ez;
        if (kind === 0) {
          w = r.pick([1, 2, 3, 4, 5]); const b = r.pick([1, 2, 4, 0.5]), K = r.pick([1, 2, 3, 6, 8, 10]); if (bad65(K, b, w * w)) return null;
          num = [K]; den = [1, b, w * w]; gT = frT(K / (b * w)); lag = 90; ez = `分母 $${jT(b * w)}$（純虚数）`;
        } else if (kind === 1) {
          const a = r.pick([1, 2, 3, 4, 5, 10]), K = r.pick([1, 2, 3, 4, 6, 10]); w = a;
          num = [K]; den = [1, a]; gT = s2T(K / a); lag = 45; ez = `分母 $${a}+${a}j$：大きさ $${a === 1 ? '' : a}\\sqrt2$、角45°`;
        } else {
          const c = r.pick([4, 9, 16, 25, 36]), K = r.pick([1, 2, 3, 4, 5, 6, 10]);
          w = kind === 2 ? r.pick([1, 2, 3, 4, 5].filter(v => v * v < c)) : r.pick([2, 3, 4, 5, 6, 7, 8].filter(v => v * v > c));
          num = [K]; den = [1, 0, c]; gT = frac(K, Math.abs(c - w * w)); lag = kind === 2 ? 0 : 180;
          ez = `分母 $${c}-${w * w}=${c - w * w}$（${kind === 2 ? '正' : '負'}の実数）`;
        }
        if (!gT) return null;
        adv(r, '65s2', 4);
        return { q: `$G=${fracT(num[0], polyT(den))}$ に $${sinT(w)}$ を入れ続けた。落ち着いたゆれの倍率 ＝ □、おくれ ＝ □${DEG}`, a: `$${gT}$、$${lag}$${DEG}`, key: gkey(num, den) + `:w${w}`, easyCheck: false,
          easy: ez, verify: p => chk(near(numOf(p.a, 0), absG(num, den, w)) || '倍率がちがう', near(numOf(p.a, 1), lagG(num, den, w), 1e-7) || 'おくれがちがう') };
      },
      // 見かけがちがう：ばねをゆする・ローパスフィルターに sin の電圧
      s3(r) {
        if (turn(r, '65s3', 2) === 0) {
          const m = r.pick([0.5, 1, 2]), w = r.pick([2, 3, 4, 5, 10]), c = r.pick([0.5, 1, 2, 4]), F0 = r.pick([1, 2, 4, 10]), k = m * w * w;
          const amp = F0 / (c * w); if (!toFr(amp) || bad65(1, c / m, w * w)) return null;
          const num = [1], den = [m, c, k];
          return { q: `質量 $${U(fmt(m), 'kg')}$、ダンパー $${U(fmt(c), 'N\\cdot s/m')}$、ばね $${U(fmt(k), 'N/m')}$ のおもりを、力 $${F0}\\cos${w}t$〔N〕でゆすり続けた。落ち着いたゆれの大きさ ＝ □ m、おくれ ＝ □${DEG}`,
            a: `$${frT(amp)}$、$90$${DEG}`, key: gkey(num, den) + `:w${w}`, easyCheck: false,
            easy: `$G=${fracT(1, polyT(den))}$、分母 $${fmt(k)}-${fmt(m * w * w)}+${fmt(c * w)}j=${fmt(c * w)}j$`,
            verify: p => chk(near(numOf(p.a, 0), F0 * absG(num, den, w)) || 'ゆれの大きさがちがう', near(numOf(p.a, 1), lagG(num, den, w), 1e-7) || 'おくれがちがう') };
        }
        const [x, y, h] = r.pick([[1, 1, 0], [3, 4, 5], [12, 5, 13]]), t = r.pick([0.01, 0.02, 0.05, 0.1, 0.25, 0.5]), w = trim0(x / y / t), V0 = r.pick([1, 2, 3, 5, 10]);
        if (!Number.isInteger(w)) return null;
        const num = [1], den = [t, 1], amp = h ? V0 * y / h : V0 / Math.SQRT2;
        const aT = h ? frT(amp) : s2T(V0);
        return { q: `ローパスフィルター $G=${tauT(1, t)}$ に、電圧 $${V0}\\sin${w}t$〔V〕を入れ続けた。落ち着いた出口の電圧のゆれの大きさ〔V〕`, a: `$${aT}$`, key: gkey(num, den) + `:w${w}`, easyCheck: false,
          easy: `分母 $1+${fmt(t * w)}j$ の大きさ ${h ? `$\\sqrt{1+${fmt(t * w)}^2}=${fmt(h / y)}$` : '$\\sqrt2$'}`,
          verify: p => near(numOf(p.a), V0 * absG(num, den, w)) || 'ゆれの大きさがちがう' };
      },
      // わな：ステップを入れた最後の値 → 9-61（G(0)）
      trap(r) {
        const a = r.pick([2, 3, 6, 8, 10]), p = r.pick([1, 2, 4, 5]), h = r.pick([1, 2, 3]);
        if (a === p && h === 1) return null;
        return dest({ q: `$G=${firstT(a, p)}$ に大きさ $${h}$ のステップを入れ続けた。最後の $y$`, a: `$${frT(a * h / p)}$`, key: `65t:${a}:${p}:${h}`,
          verify: p0 => near(numOf(p0.a), simulate([1, p], () => a * h, 40 / p)) || '最後の値がちがう' }, '9-65',
          '$\\sin$ ではなく、一定の大きさを入れ続けた。最後の値は $h\\times G(0)$', ['9-61']);
      },
    },
  });

  // ================================================================ 9-66 dB は 20log10|G|、直列は dB のたし算
  // 例：|G|=1/10 → −20 dB、2段 → −40 dB（1/100）。1/√2 → −3.01 dB、3段 → −9.03 dB（O-2）
  const L2 = 0.301, LG = { 2: L2, 4: 2 * L2, 5: 1 - L2, 8: 3 * L2, 20: 1 + L2, 10: 1, 100: 2, 1000: 3 };
  const QL2 = '（$\\log_{10}2=0.301$）';
  const dbT = v => `${fmt(v)}\\,\\mathrm{dB}`;
  // 文の値で計算した dB（2けた）と、ほんとうの値を丸めた dB がくいちがわないか（O-4）
  const dbOK = (byText, truth) => byText.toFixed(2) === truth.toFixed(2);
  add({
    id: '9-66', part: 5, chap: '9-8⑨ 例題9', stars: 1,
    title: '倍率の dB は $20\\log_{10}\\lvert G\\rvert$。直列は dB のたし算',
    mark: '「何 dB」「2段つなぐと」「何 dB は何倍」。',
    futsu: ['2段の伝達関数 $G\\times G$ を通分して作り、', '$s=j\\omega$ を入れて倍率をかけ算で出してから、', '$20\\log_{10}$ を計算する'],
    raku: ['$\\lvert G\\rvert=\\dfrac{1}{10}$ → $-20$ dB、2段 → $-40$ dB（$\\dfrac{1}{100}$ 倍）', '$\\dfrac{1}{\\sqrt2}$ → $-3.01$ dB、3段 → $-9.03$ dB', '（$\\log_{10}2=0.301$）'],
    why: '倍率（振幅の比）を $20\\log_{10}\\lvert G\\rvert$ で表したものが dB（3-12・9-8⑨）。直列では倍率がかけ算 $\\lvert G_1\\rvert\\lvert G_2\\rvert$ になり、$\\log(ab)=\\log a+\\log b$ なので dB はたし算。同じ箱 $n$ 段なら、1段の dB の $n$ 倍。$\\dfrac{1}{\\sqrt a}$ は $-10\\log_{10}a$。',
    caution: '振幅（電圧・ゆれ）の倍率は $20\\log_{10}$。$10\\log_{10}$ は電力の倍率のとき（9-8 のまちがえやすいところ③）。1より小さい倍率は負の dB。dB から倍率へは $10^{\\text{dB}/20}$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' },
    fits(q) { return /dB|\\log_\{10\}/.test(q) && !/電力/.test(q); },
    steps: {
      // 倍率 → dB（1段）
      s1(r) {
        const g = r.pick([2, 4, 8, 5, 20, 100, 1000]), inv = r.chance(0.5), n = g;
        if (inv && g === 100) return null;
        const exact = Math.log10(n) * 20, byText = LG[n] * 20, sg = inv ? -1 : 1;
        if (!dbOK(byText, exact)) return null;
        const pow10 = [10, 100, 1000].includes(n);
        return { q: `倍率 $\\lvert G\\rvert=${inv ? frac(1, n) : n}$ は何 dB か${pow10 ? '' : QL2}`, a: `${pow10 ? '' : '約 '}$${dbT(sg * +byText.toFixed(2))}$`, key: `66:${sg * n}`, easyCheck: false,
          easy: `$20\\log_{10}${inv ? frac(1, n) : n}=${sg < 0 ? '-' : ''}20\\times${fmt(LG[n])}$`, verify: p => near(numOf(p.a), +(sg * exact).toFixed(2)) || 'dB がちがう' };
      },
      // 何段か・dB から倍率
      s2(r) {
        const kind = turn(r, '66s2', 3);
        if (kind === 0) {
          const x = r.pick([-3, -6, -8, -12, -15, 5, 10, 6]), n = r.pick([2, 3, 4]);
          if (x === -3 && n === 3) return null;
          return { q: `1段で $${dbT(x)}$ の箱を、$${n}$ 段直列につないだ全体は何 dB か`, a: `$${dbT(x * n)}$`, key: `66n:${x}:${n}`, easyCheck: false,
            easy: `dB はたし算：$${x}\\times${n}$`, verify: p => near(numOf(p.a), 20 * n * Math.log10(10 ** (x / 20))) || 'dB がちがう' };
        }
        if (kind === 1) {
          const d = r.pick([-60, -80, 20, 40, 60]);
          return { q: `全体で $${dbT(d)}$ になる箱の倍率 $\\lvert G\\rvert$`, a: `$${d < 0 ? frac(1, 10 ** (-d / 20)) : 10 ** (d / 20)}$`, key: `66:${d < 0 ? -(10 ** (-d / 20)) : 10 ** (d / 20)}`, easyCheck: false,
            easy: `$20\\log_{10}\\lvert G\\rvert=${d}$ → $\\log_{10}\\lvert G\\rvert=${d / 20}$`, verify: p => near(20 * Math.log10(numOf(p.a)), d) || '倍率がちがう' };
        }
        const [g, n] = r.pick([[2, 3], [4, 2], [5, 2], [2, 4], [8, 2], [5, 3]]), inv = r.chance(0.6), sg = inv ? -1 : 1;
        const exact = 20 * n * Math.log10(g), byText = 20 * n * LG[g];
        if (!dbOK(byText, exact)) return null;
        return { q: `1段の倍率が $${inv ? frac(1, g) : g}$ の箱を $${n}$ 段直列につないだ全体は何 dB か${QL2}`, a: `約 $${dbT(sg * +byText.toFixed(2))}$`, key: `66g:${sg * g}:${n}`, easyCheck: false,
          easy: `1段 $${fmt(sg * +(20 * LG[g]).toFixed(2))}$ dB の $${n}$ 倍`, verify: p => near(numOf(p.a), +(sg * exact).toFixed(2)) || 'dB がちがう' };
      },
      // 見かけがちがう：ローパスフィルターを何段か（ωτ=f/fc）
      s3(r) {
        const [x, n] = r.pick([[1, 4], [2, 2], [2, 3], [3, 3], [3, 4], [7, 2], [7, 3]]), fc = r.pick([100, 200, 500, 1000]), f = x * fc;
        const v = 1 + x * x, byText = -10 * n * { 2: L2, 5: 1 - L2, 10: 1, 50: 2 - L2 }[v], exact = -10 * n * Math.log10(v);
        if (!dbOK(byText, exact)) return null;
        return { q: `$${fc}\\,\\mathrm{Hz}$ で折れるローパスフィルター $\\dfrac{1}{\\tau s+1}$（$\\omega\\tau=\\dfrac{f}{${fc}}$）を、バッファーをはさんで $${n}$ 段つなぐ。$${f}\\,\\mathrm{Hz}$ の信号は何 dB か${v === 10 ? '' : QL2}`,
          a: `${v === 10 ? '' : '約 '}$${dbT(+byText.toFixed(2))}$`, key: `66f:${x}:${n}`, easyCheck: false,
          easy: `$\\omega\\tau=${x}$、1段 $-10\\log_{10}${v}$ dB の $${n}$ 倍`,
          verify: p => near(numOf(p.a), +(20 * n * Math.log10(absG([1], [1, 1], x))).toFixed(2)) || 'dB がちがう' };
      },
      // わな：電力の倍率 → わざなし（10log10）
      trap(r) {
        const g = r.pick([10, 100, 1000]), inv = r.chance(0.7);
        return dest({ q: `電力の倍率 $${inv ? frac(1, g) : g}$ は何 dB か`, a: `$${dbT((inv ? -10 : 10) * Math.log10(g))}$`, key: `66t:${inv ? -g : g}`,
          verify: p => near(numOf(p.a), (inv ? -10 : 10) * Math.log10(g)) || 'dB がちがう' }, '9-66',
          '電力は振幅の2乗なので $10\\log_{10}$（$20\\log_{10}$ ではない）');
      },
    },
  });

  // ================================================================ 9-67 データから1次おくれ：最後の値÷入れた大きさで K、63.2 % の時刻で τ
  // 例：2 V を入れて最後が40、25.3 に着くのが0.8秒 → K=20、τ=0.8（O-2）
  const bad67 = (u0, Y, t) => exLike([u0, Y, t], [2, 40, 0.8]) || near(Y / u0, 20) && near(t, 0.8);
  const r632 = Y => fmt(+(0.632 * Y).toFixed(3));
  add({
    id: '9-67', part: 5, chap: '9-8⑪ 例題10', stars: 1,
    title: 'データから1次おくれ：$K$ は最後の値÷入れた大きさ、$\\tau$ は63.2 % の時刻',
    mark: 'ステップを入れた記録（表）。1次おくれ $\\dfrac{K}{\\tau s+1}$ として $K$・$\\tau$ を決める。',
    futsu: ['表の2つの時刻の値を $y=KU(1-e^{-t/\\tau})$ に入れ、', '2つの式から $K$ と $\\tau$ の連立方程式を作り、', '対数を使って解く'],
    raku: ['2 V を入れて最後が40 → $K=40\\div2=20$', '$40\\times0.632=25.3$ に着くのが0.8秒 → $\\tau=0.8$', '→ $G=\\dfrac{20}{0.8s+1}$'],
    why: '1次おくれのステップ応答は $y=K\\times(\\text{入れた大きさ})\\times(1-e^{-t/\\tau})$（9-8⑪）。$t\\to\\infty$ で $e^{-t/\\tau}\\to0$ なので、最後の値÷入れた大きさが $K$。$t=\\tau$ では $1-e^{-1}=0.632$ なので、最後の値の63.2 % に着く時刻が $\\tau$。',
    caution: '最後の値は、入れた大きさでわってから $K$ にする。はじめの値が0でないときは、変わった分（最後−はじめ）で考える。行きすぎてからもどるデータは1次おくれではない。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '16mm', s3: '20mm', trap: '44mm' }, boxh: { s1: '11mm', s2: null, s3: '11mm', trap: null },
    fits(q) { return (/63\.2|表は/.test(q) || /温度計を/.test(q)) && /伝達関数|\$K\$|\$\\tau\$/.test(q) && !/行きすぎ|G=\\dfrac/.test(q); },
    steps: {
      // 文の値から G
      s1(r) {
        const u0 = r.pick([1, 2, 4, 5, 10]), K = r.pick([2, 3, 5, 6, 8, 12, 15, 25]), t = r.pick([0.2, 0.4, 0.5, 2, 3, 4, 10]), Y = u0 * K;
        if (bad67(u0, Y, t) || Y > 120 || Y % 5) return null;   // 63.2 % の値が小数第2位までになるように
        return { q: `1次おくれの箱に $${U(u0, 'V')}$ を入れ続けると、最後の値が $${Y}$、その63.2 % の $${r632(Y)}$ に着くのが $${fmt(t)}$ 秒。伝達関数`,
          a: `$${tauT(K, t)}$`, key: `67:${K}:${t}`, easyCheck: false, easy: `$K=${Y}\\div${u0}=${K}$、$\\tau=${fmt(t)}$`,
          calc: { kind: 'fn', want: `${K}/(${t}*s+1)`, vars: ['s'] } };
      },
      // K と τ を別々に（はじめの値が0でない・分の単位）
      s2(r) {
        if (turn(r, '67s2', 2) === 0) {   // ヒーター：外より何℃高いか
          const P = r.pick([500, 1000, 2000]), Y = r.pick([5, 8, 10, 12, 15]), t = r.pick([20, 30, 40, 60]), K = Y / P;
          return { q: `ヒーターに $${U(P, 'W')}$ を入れ続けると、部屋は外より最後に $${Y}$ ℃高くなり、その63.2 % の $${r632(Y)}$ ℃に着くのが $${t}$ 分。$K$ ＝ □ ℃/W、$\\tau$ ＝ □ 分`,
            a: `$${fmt(K)}$、$${t}$`, key: `67h:${P}:${Y}:${t}`, easyCheck: false, easy: `$K=${Y}\\div${P}$`,
            verify: p => chk(near(numOf(p.a, 0), K) || 'K がちがう', near(numOf(p.a, 1), t) || 'τ がちがう') };
        }
        const T0 = r.pick([10, 15, 20, 25]), T1 = r.pick([60, 70, 80, 90]), t = r.pick([5, 8, 12, 15, 20, 25]), d = T1 - T0, y1 = +(T0 + 0.632 * d).toFixed(2);
        if (d === 60 && t === 30) return null;
        return { q: `$${T0}$ ℃の温度計を $${T1}$ ℃のお湯に入れると、読みは $${t}$ 秒後に $${fmt(y1)}$ ℃、やがて $${T1}$ ℃。上がり分を入れたものとして $K$ ＝ □、$\\tau$ ＝ □ s`,
          a: `$1$、$${t}$`, key: `67t:${T0}:${T1}`, easyCheck: false, easy: `上がり分 $${d}$ ℃、その63.2 % は $${fmt(+(0.632 * d).toFixed(2))}$ ℃`,
          verify: p => chk(near(numOf(p.a, 0), 1) || 'K がちがう', near(numOf(p.a, 1), t) || 'τ がちがう') };
      },
      // 見かけがちがう：ステップ応答の表
      s3(r) {
        const u0 = r.pick([1, 2, 5]), K = r.pick([2, 3, 5, 10, 15, 25]), t = r.pick([0.2, 0.4, 0.5, 2, 4, 5, 10]), Y = u0 * K;
        if (bad67(u0, Y, t) || Y > 80 || exLike([u0, Y, t], [1, 10, 0.5])) return null;
        const ts = [0, t / 2, t, 2 * t, 4 * t, 10 * t], dig = Y < 20 ? 2 : 1;
        const ys = ts.map(x => (Y * (1 - Math.exp(-x / t))).toFixed(dig));
        if (Math.abs(+ys[2] - 0.632 * Y) > 0.051 || +ys[5] !== Y) return null;
        return { q: `表は、$t=0$ から $${U(u0, 'V')}$ を入れ続けたときの出てくるもの $y$。1次おくれとして伝達関数`, a: `$${tauT(K, t)}$`, key: `67:${K}:${t}`, easyCheck: false,
          easy: `最後の値 $${Y}$、$K=${Y}\\div${u0}$。$${r632(Y)}$ に着くのが $${fmt(t)}$ 秒`,
          table: { head: ['$t$（s）', ...ts.map(x => fmt(x))], rows: [['$y$', ...ys.map(v => (v === '0.00' || v === '0.0') ? '0' : v)]] },
          verify: p => fnSame(p.a, 0, x => K / (t * x + 1)) || '伝達関数がちがう' };
      },
      // わな：行きすぎてからもどる → わざなし
      trap(r) {
        const Y = r.pick([10, 20, 40, 50]), ov = r.pick([1.1, 1.16, 1.3]), u0 = r.pick([1, 2]);
        return dest({ q: `$${U(u0, 'V')}$ を入れ続けると、出てくるものが $${fmt(+(Y * ov).toFixed(1))}$ まで行きすぎてから $${Y}$ に落ち着いた。1次おくれ $\\dfrac{K}{\\tau s+1}$ として $K$ と $\\tau$`,
          a: '求められない（1次おくれは行きすぎない）', key: `67t:${Y}:${ov}:${u0}`,
          verify: p => /求められない/.test(p.a) || 'ことばがちがう' }, '9-67',
          '1次おくれのステップ応答 $K(1-e^{-t/\\tau})$ は行きすぎない。行きすぎるのは2次おくれ（$\\zeta<1$）など');
      },
    },
  });
  // ---------------------------------------------------------------- 極と動き（9-68〜9-71）
  // 根の表し方：実数 p は (s-p)、複素数 a±bj は (s-a)^2+b^2（a=0 なら s^2+b^2）
  const rootFac = p => (p === 0 ? 's' : `(s${p < 0 ? '+' : '-'}${fmt(Math.abs(p))})`);
  const cplxFac = (a, b) => `${a === 0 ? 's^2' : `${rootFac(a)}^2`}+${b === 1 ? '1' : `${fmt(b)}^2`}`;
  // 因数の列 [{ r: p } | { a, b }] → 分母の TeX（2つ以上で複素数の因数は \{ \} でかこむ）と係数
  function denOf(fs) {
    const many = fs.length > 1;
    const tex = fs.map(f => (f.r != null ? rootFac(f.r) : many ? (f.a === 0 ? `(${cplxFac(f.a, f.b)})` : `\\{${cplxFac(f.a, f.b)}\\}`) : cplxFac(f.a, f.b))).join('');
    const cs = fs.reduce((acc, f) => pmul(acc, f.r != null ? [1, -f.r] : [1, -2 * f.a, f.a * f.a + f.b * f.b]), [1]);
    return { tex, cs };
  }
  const polesOf = fs => fs.flatMap(f => (f.r != null ? [[f.r, 0]] : [[f.a, f.b], [f.a, -f.b]]));
  const poleTeX = fs => fs.map(f => (f.r != null ? fmt(f.r) : pmT(f.a, f.b))).map(t => `$${t}$`).join('、');
  const MOVE = ['ゆれずに落ち着く', 'ゆれながら落ち着く', 'ゆれ続ける', 'どんどん大きくなる'];
  // 極の組（数値）から動き（問題を作った因数とは別に、根の数値から決める）
  function moveOf(ps) {
    if (ps.some(z => z[0] > 1e-7)) return MOVE[3];
    if (ps.some(z => Math.abs(z[0]) <= 1e-7)) return MOVE[2];
    if (ps.some(z => Math.abs(z[1]) > 1e-7)) return MOVE[1];
    return MOVE[0];
  }
  const QMOVE = '（ゆれずに落ち着く・ゆれながら落ち着く・ゆれ続ける・どんどん大きくなる）';
  // s の平面に極（×）と零点（○）を打った図（目もりの数は書かない。K-2）
  function figPoles(ps, zs) {
    const xs = ps.concat(zs || []).map(z => z[0]), ys = ps.concat(zs || []).map(z => Math.abs(z[1]));
    const x0 = Math.min(-1, ...xs) - 1.2, x1 = Math.max(0.8, ...xs) + 1.6, y1 = Math.max(1, ...ys) * 1.3 + 0.8;   // × がぬりのはし・Re の字に重ならないように
    const W = 5.2, sc = W / (x1 - x0), H = Math.min(4.2, Math.max(2.6, 2 * y1 * sc));
    const P = M.cplane({ x0, x1, y0: -y1, y1, w: W, h: H });
    return { s: 5, items: [...P.shadeLeft(), ...P.axes({ xt: [], yt: [] }), ...ps.flatMap(z => P.mark(z[0], z[1], 'x', 0.22)), ...(zs || []).flatMap(z => P.mark(z[0], z[1], 'o', 0.22))] };
  }

  // ================================================================ 9-68 極は分母＝0 の s：実部の符号で落ち着くか、虚部でゆれ
  // 例：1/((s+1)^2+3^2) → −1±3j。1/((s−2)(s+4)) → 2・−4。1/(s^2+3^2) → ±3j（O-2）
  const bad68 = fs => fs.some(f => (f.r == null && (exLike([f.a, f.b], [1, 3]) || (f.a === 0 && f.b === 3))));
  const badPair68 = (p, q) => exLike([p, q], [2, 4]);
  // 動き k の分母（2次）を作る
  function den2(r, k) {
    const a = r.pick([1, 2, 3, 4, 5, 6]), b = r.pick([1, 2, 3, 4, 5, 6, 7, 8]);
    if (k === 0) { const [p, q] = r.shuffle([1, 2, 3, 4, 5, 6, 0.5]).slice(0, 2).sort((x, y) => x - y); if (badPair68(p, q)) return null; return [{ r: -p }, { r: -q }]; }
    if (k === 1) return bad68([{ a: -a, b }]) || a === b ? null : [{ a: -a, b }];
    if (k === 2) return b === 3 || b === 1 ? null : [{ a: 0, b }];
    if (r.chance(0.5)) { const p = r.pick([1, 2, 3, 0.5]), q = r.pick([1, 2, 3, 4, 5, 6]); if (badPair68(p, q) || p === q) return null; return r.shuffle([{ r: p }, { r: -q }]); }
    return bad68([{ a, b }]) || a === b ? null : [{ a, b }];
  }
  add({
    id: '9-68', part: 5, chap: '9-9①②③ 例題1・9-0⑥', stars: 1,
    title: '極は分母＝0 の $s$：実部と虚部で動きを読む',
    mark: '分母が $(s-p)$ や $(s+\\sigma)^2+\\omega^2$ のかけ算の形。「極」「動き方」。',
    futsu: ['分母を展開して $s^2+2s+10=0$ のような式にし、', '解の公式で解いてから、', '9-7 のように部分分数でもどして動きを見る'],
    raku: ['分母 $(s+1)^2+3^2$ → $-1\\pm3j$：ゆれながら落ち着く', '分母 $(s-2)(s+4)$ → $2$ が右半分：大きくなる', '分母 $s^2+3^2$ → $\\pm3j$：ゆれ続ける'],
    why: '極 $p$ が1つあると、動きの中に $e^{pt}$ が1つ入る（9-9②）。$p=\\sigma+j\\omega$ なら $e^{\\sigma t}(\\cos\\omega t+j\\sin\\omega t)$ なので、実部 $\\sigma$ が負なら小さくなって落ち着き、正なら大きくなり、0なら大きさが変わらない。虚部 $\\omega$ があればゆれる（9-9③の極の地図）。かっこごとに0と置けば、解かずに読める。',
    caution: '$(s+1)^2+3^2=0$ は $s+1=\\pm3j$ で、極は $-1\\pm3j$（$+1$ ではない）。$(s-2)$ の極は $+2$。極が1つでも右半分にあれば「どんどん大きくなる」。虚部が大きくても、実部が負なら落ち着く。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '34mm', s3: '50mm', trap: '20mm' },
    fits(q) {
      if (/安定|零点|行きすぎ|\\zeta|もど|K/.test(q)) return false;
      const d = dfracIn(q); return !!d && splitDen(d.den) >= 2 && /極|動き/.test(q);
    },
    steps: {
      // 極を読む（実数の組・σ±ωj・±ωj を回す）
      s1(r) {
        const k = turn(r, '68s1', 3), fs = den2(r, [0, 1, 2][k] === 0 ? (r.chance(0.6) ? 0 : 3) : k);
        if (!fs || (k === 0 && fs.some(f => f.r == null))) return null;
        const D = denOf(fs), N = r.pick([1, 1, 2, 3, 5, 10]);
        return { q: `$${fracT(N, D.tex)}$ の極`, a: poleTeX(fs), key: gkey([N], D.cs), easyCheck: false,
          easy: 'かっこごとに0と置く', verify: p => sameSet(valsOf(p.a), roots(D.cs)) || '極がちがう' };
      },
      // 動き（4つを回す）
      s2(r) {
        const k = peek(r, '68s2', 4), fs = den2(r, k); if (!fs) return null;
        const D = denOf(fs), N = r.pick([1, 2, 3, 4, 5]), ps = polesOf(fs);
        adv(r, '68s2', 4);
        return { q: `$${fracT(N, D.tex)}$ をポンとたたいたときの動き${QMOVE}`, a: MOVE[k], key: gkey([N], D.cs), easyCheck: false,
          easy: `極 ${poleTeX(fs)}`, verify: p => p.a === moveOf(roots(D.cs)) || '動きがちがう' };
      },
      // 見かけがちがう：3次の分母（図に極の ×）
      s3(r) {
        const k = peek(r, '68s3', 4), a = r.pick([1, 2, 3, 4, 5]);
        let fs;
        if (k === 0) { const [p, q, c] = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 3).sort((x, y) => x - y); fs = [{ r: -p }, { r: -q }, { r: -c }]; }
        else if (k === 1) { const c = den2(r, 1); if (!c) return null; fs = [{ r: -a }, c[0]]; }
        else if (k === 2) { const c = den2(r, 2); if (!c) return null; fs = [{ r: -a }, c[0]]; }
        else { const c = den2(r, 1); if (!c) return null; fs = [{ r: r.pick([1, 2, 0.5]) }, c[0]]; }
        const D = denOf(fs), ps = polesOf(fs);
        adv(r, '68s3', 4);
        return { q: `$${fracT(1, D.tex)}$ の極（図の ×）と、ポンとたたいたときの動き${QMOVE}`, a: `${poleTeX(fs)}：${MOVE[k]}`, key: gkey([1], D.cs), easyCheck: false,
          easy: 'かっこごとに0と置き、いちばん右の極を見る', fig: figPoles(ps),
          verify: p => chk(sameSet(valsOf(p.a), roots(D.cs)) || '極がちがう', p.a.endsWith(moveOf(roots(D.cs))) || '動きがちがう') };
      },
      // わな：展開してある2次式 → 9-70（解の公式）
      trap(r) {
        const a = r.pick([1, 2, 3, 4]), b = r.pick([1, 2, 4, 5, 6]);
        if (exLike([a, b], [1, 3]) || a === b) return null;
        const cs = [1, 2 * a, a * a + b * b];
        return dest({ q: `$${fracT(1, polyT(cs))}$ の極`, a: `$${pmT(-a, b)}$`, key: gkey([1], cs),
          verify: p => sameSet(valsOf(p.a), roots(cs)) || '極がちがう' }, '9-68',
          '分母が展開してあり、かっこの形ではない。解の公式（または2次おくれの形とくらべる）', ['9-70']);
      },
    },
  });

  // ================================================================ 9-69 1次おくれ K/(τs+1)：極 −1/τ、τ で63.2 %、3τ で95 %
  // 例：4/(10s+1) → 極 −0.1、時定数10 s、95 % は30 s、最後の変化4（O-2）
  const bad69 = (K, t) => exLike([K, t], [4, 10]) || t === 10;
  const EN = { 0.5: '0.6065', 1: '0.3679', 2: '0.1353', 3: '0.0498' };
  add({
    id: '9-69', part: 5, chap: '9-9④ 例題2', stars: 1,
    title: '1次おくれ $\\dfrac{K}{\\tau s+1}$ の極は $-\\dfrac1\\tau$：$\\tau$ で63.2 %、$3\\tau$ で95 %',
    mark: '$\\dfrac{\\square}{\\square s+1}$ の形。極・時定数・95 % に着く時刻・最後の変化。',
    futsu: ['ステップを入れた $\\dfrac{K}{s(\\tau s+1)}$ を部分分数に分け、', '$K(1-e^{-t/\\tau})$ にもどしてから、', '$1-e^{-t/\\tau}=0.95$ を対数で解く'],
    raku: ['$\\dfrac{4}{10s+1}$ → 極 $-\\dfrac{1}{10}=-0.1$、時定数10 s', '95 % は $3\\tau=30$ s', '最後の変化は4（入れたものを1上げたとき）'],
    why: '$\\tau\\dot y+y=Ku$ の伝達関数が $\\dfrac{K}{\\tau s+1}$（9-9④）。分母 $\\tau s+1=0$ から極は $-\\dfrac1\\tau$。ステップの答え $K(1-e^{-t/\\tau})$ は、$t=\\tau$ で $1-e^{-1}=63.2$ %、$t=3\\tau$ で $1-e^{-3}=95.0$ %。最後の値は $K$（入れたものを1上げたとき）。',
    caution: '分母の定数の項が1でないとき（$\\dfrac{6}{2s+3}$）は、分母・分子を3でわって $\\dfrac{2}{\\frac23s+1}$ にしてから読む（$\\tau=\\dfrac23$、$K=2$）。$\\dfrac{a}{s+p}$ なら $\\tau=\\dfrac1p$、$K=\\dfrac ap$。極は $G(0)$ ではない。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '18mm', trap: '50mm' }, boxh: { s1: '10mm' },
    fits(q) {
      if (/もど|比例|K_\{\\mathrm/.test(q)) return false;
      const d = dfracIn(q); if (!d || !/極|時定数|63\.2|95|最後の変化|センサー/.test(q) || /車|力積/.test(q)) return false;
      return /^[\d.]*s[+-][\d.]+$|^s[+-][\d.]+$/.test(d.den.replace(/\s/g, ''));
    },
    steps: {
      // 極
      s1(r) {
        const t = r.pick([2, 4, 5, 8, 20, 25, 50, 0.5, 0.2, 0.25]), K = r.pick([1, 2, 3, 5, 6, 8]);
        if (bad69(K, t)) return null;
        return { q: `$G=${tauT(K, t)}$ の極`, a: `$${frT(-1 / t)}$`, key: gkey([K], [t, 1]), easyCheck: false,
          easy: `$${polyT([t, 1])}=0$`, verify: p => sameSet(valsOf(p.a), roots([t, 1])) || '極がちがう' };
      },
      // 時定数と95 % の時刻（τs+1・s+p・bs+c の形）
      s2(r) {
        const kind = turn(r, '69s2', 3);
        let num, den, tau;
        if (kind === 0) { tau = r.pick([2, 4, 5, 6, 12, 20, 40]); const K = r.pick([1, 2, 3, 5]); if (bad69(K, tau)) return null; num = [K]; den = [tau, 1]; }
        else if (kind === 1) { const p = r.pick([0.1, 0.2, 0.25, 0.5, 2, 4, 5]); tau = 1 / p; num = [r.pick([1, 2, 3, 4])]; den = [1, p]; }
        else { const [b, c] = r.pick([[2, 4], [3, 6], [6, 2], [8, 4], [12, 3], [5, 10], [9, 3]]); tau = b / c; num = [r.pick([2, 3, 6])]; den = [b, c]; }
        if (near(tau, 10)) return null;
        const Gt = kind === 0 ? tauT(num[0], tau) : fracT(num[0], polyT(den));
        return { q: `$G=${Gt}$（$s$ の単位は1/秒）の時定数 ＝ □ s、95 % に着く時刻 ＝ □ s`, a: `$${numT(tau)}$、$${numT(3 * tau)}$`, key: gkey(num, den), easyCheck: false,
          easy: kind === 0 ? `$\\tau=${fmt(tau)}$、$3\\tau$` : `$\\tau s+1$ の形に直す：$\\tau=${frT(tau)}$`,
          verify: p => chk(near(numOf(p.a, 0), -1 / roots(den)[0][0]) || '時定数がちがう', near(numOf(p.a, 1), -3 / roots(den)[0][0]) || '95 % の時刻がちがう') };
      },
      // 見かけがちがう：入れたものを h 上げた最後の変化・ある時刻の変化（e の値は文に）
      s3(r) {
        const [b, c] = r.pick([[12, 2], [20, 4], [6, 3], [30, 5], [8, 2], [15, 3], [40, 8], [4, 2]]), a = r.pick([2, 4, 6, 10]), h = r.pick([1, 2, 5]);
        const tau = b / c, K = a / c, num = [a], den = [b, c];
        if (!toFr(K) || near(tau, 10)) return null;
        if (peek(r, '69s3', 2) === 0) {
          adv(r, '69s3', 2);
          return { q: `センサー $G=${fracT(a, polyT(den))}$（$s$ の単位は1/秒）の、入れたものを $${h}$ 上げたときの最後の変化 ＝ □、その63.2 % に着く時刻 ＝ □ s`, a: `$${numT(K * h)}$、$${numT(tau)}$`, key: gkey(num, den) + `:h${h}`, easyCheck: false,
            easy: `分母・分子を $${c}$ でわる：$${fracT(numT(K), polyT([tau, 1]))}$`,
            verify: p => chk(near(numOf(p.a, 0), h * pv(num, [0, 0])[0] / pv(den, [0, 0])[0]) || '最後の変化がちがう', near(numOf(p.a, 1), -1 / roots(den)[0][0]) || '時刻がちがう') };
        }
        const n = r.pick([0.5, 1, 2, 3]), tt = n * tau, byText = K * h * (1 - +EN[n]), truth = K * h * (1 - Math.exp(-n));
        if (!Number.isInteger(+(tt * 100).toFixed(6)) || byText.toFixed(2) !== truth.toFixed(2)) return null;
        adv(r, '69s3', 2);
        return { q: `センサー $G=${fracT(a, polyT(den))}$（$s$ の単位は1/秒）に、入れたものを $t=0$ に $${h}$ 上げた。$${fmt(tt)}$ 秒後の変化 ＝ 約 □（$e^{-${fmt(n)}}=${EN[n]}$、小数第2位まで）`,
          a: `約 $${byText.toFixed(2)}$`, key: gkey(num, den) + `:h${h}`, easyCheck: false,
          easy: `$K=${numT(K)}$、$\\tau=${numT(tau)}$。$${numT(K * h)}(1-e^{-${fmt(n)}})$`,
          verify: p => near(numOf(p.a), +simulate([b, c], () => a * h, tt, 4000).toFixed(2)) || '約の値がちがう' };
      },
      // わな：1次おくれが2つ（2次の分母）→ わざなし
      trap(r) {
        const t1 = r.pick([5, 10, 20]), t2 = r.pick([1, 2]), K = r.pick([2, 3, 4]);
        return dest({ q: `$G=${fracT(K, `(${polyT([t1, 1])})(${polyT([t2, 1])})`)}$ で、最後の変化の95 % に着く時刻`, a: '$3\\tau$ では出せない（1次おくれではない）', key: `69t:${t1}:${t2}:${K}`,
          verify: p => /出せない/.test(p.a) || 'ことばがちがう' }, '9-69',
          '1次おくれが2つかけてある（2次の分母）。$3\\tau$ で95 % は1次おくれだけの決まり。ステップの答えを部分分数でもどし、数値で解く');
      },
    },
  });

  // ================================================================ 9-70 2次おくれ：定数の項＝ω_n^2、s の係数＝2ζω_n
  // 例：100/(s^2+12s+100) → ω_n=10、ζ=0.6、極 −6±8j、最初の山 π/8、行きすぎ約9.5 %（O-2）
  const bad70 = (wn, z) => wn === 10 && z === 0.6;
  const OVS = { 0.5: '16.3', 0.6: '9.5', 0.7: '4.6' }, QOV = '（$\\zeta=0.5$ で16.3 %、0.6 で9.5 %、0.7 で4.6 %）';
  const WN = '\\omega_{\\mathrm n}';
  // 展開した2次式の係数（s=0・1・−1 の値から）。読めなければ null
  function quadOf(den) {
    const f = x => M.evalMath(den, { s: x }); const c = f(0), p = f(1), m = f(-1);
    if ([c, p, m].some(v => v == null || !isFinite(v))) return null;
    const a = (p + m) / 2 - c, b = (p - m) / 2; return [a, b, c];
  }
  // ζ と ω_n から、極がきれいな数になる組（[ζ, ω_n, 極の TeX, 最初の山の TeX]）
  function nice70(r) {
    const z = r.pick([0.6, 0.8, 0.5]);
    if (z === 0.5) { const k = r.pick([1, 2, 3, 4, 5]); return [z, 2 * k, pmT(-k, `${k === 1 ? '' : k}\\sqrt3\\,`), `\\dfrac{\\pi}{${k === 1 ? '' : k}\\sqrt3}`]; }
    const k = r.pick([1, 2, 3, 4]), wn = 5 * k, [s, w] = z === 0.6 ? [3 * k, 4 * k] : [4 * k, 3 * k];
    return [z, wn, pmT(-s, w), `\\dfrac{\\pi}{${w}}`];
  }
  add({
    id: '9-70', part: 5, chap: '9-9⑤ 例題3', stars: 1,
    title: '2次おくれは「定数の項＝$\\omega_{\\mathrm n}^2$、$s$ の係数＝$2\\zeta\\omega_{\\mathrm n}$」',
    mark: '$\\dfrac{\\omega_{\\mathrm n}^2}{s^2+\\cdots}$ の形（分母が展開した2次式）。$\\omega_{\\mathrm n}$・$\\zeta$・極・行きすぎ・最初の山。',
    futsu: ['ステップを入れた $\\dfrac{G}{s}$ を平方完成で分けてもどし、', '$y(t)$ を微分して0になる時刻をさがし、', 'その時刻の $y$ から行きすぎを出す'],
    raku: ['$\\dfrac{100}{s^2+12s+100}$ → $\\omega_{\\mathrm n}=10$、$2\\zeta\\times10=12$ で $\\zeta=0.6$', '極 $-6\\pm8j$、最初の山 $\\dfrac{\\pi}{8}$ s', '行きすぎ $e^{-0.75\\pi}\\approx9.5$ %（$e^{-2.356}=0.0948$）'],
    why: '分母を $s^2+2\\zeta\\omega_{\\mathrm n}s+\\omega_{\\mathrm n}^2$ とくらべると、定数の項から $\\omega_{\\mathrm n}$、$s$ の係数から $\\zeta$（9-9⑤）。$\\zeta<1$ なら極は $-\\zeta\\omega_{\\mathrm n}\\pm j\\omega_{\\mathrm n}\\sqrt{1-\\zeta^2}=-\\sigma\\pm j\\omega_{\\mathrm d}$。行きすぎは $e^{-\\pi\\zeta/\\sqrt{1-\\zeta^2}}$ で $\\zeta$ だけで決まり、最初の山は $\\dfrac{\\pi}{\\omega_{\\mathrm d}}$（極の虚部）。',
    caution: '$s^2$ の係数が1でないときは、全体をその係数でわってからくらべる。$\\zeta\\geqq1$（極が実数）なら行きすぎない。最初の山は $\\dfrac{\\pi}{\\omega_{\\mathrm n}}$ ではなく $\\dfrac{\\pi}{\\omega_{\\mathrm d}}$。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '14mm', trap: '40mm' },
    fits(q) {
      if (/もど|比例|K_\{\\mathrm|路面|安定/.test(q)) return false;
      if (/ダンパー/.test(q) && /行きすぎ/.test(q)) return true;
      const d = dfracIn(q); if (!d || expDeg(d.den) !== 2 || !/極|行きすぎ|最初の山|\\omega_\{\\mathrm n\}|\\zeta/.test(q)) return false;
      const c = quadOf(d.den); return !!c && c[1] > 0 && c[1] * c[1] - 4 * c[0] * c[2] < 0;
    },
    steps: {
      // ω_n と ζ
      s1(r) {
        const wn = r.pick([2, 3, 4, 5, 6, 8, 12, 20]), z = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8]), b = trim0(2 * z * wn);
        if (bad70(wn, z) || z === 0.6 || !Number.isInteger(b * 10)) return null;
        const den = [1, b, wn * wn];
        return { q: `$G=${fracT(wn * wn, polyT(den))}$ の $${WN}$ ＝ □、$\\zeta$ ＝ □`, a: `$${wn}$、$${fmt(z)}$`, key: gkey([wn * wn], den), easyCheck: false,
          easy: `$${WN}^2=${wn * wn}$、$2\\zeta\\times${wn}=${fmt(b)}$`,
          verify: p => { const ps = roots(den), w = Math.hypot(...ps[0]); return chk(near(numOf(p.a, 0), w) || '$\\omega_{\\mathrm n}$ がちがう', near(numOf(p.a, 1), -ps[0][0] / w) || '$\\zeta$ がちがう'); } };
      },
      // 極と最初の山
      s2(r) {
        const [z, wn, pT, tT] = nice70(r); if (bad70(wn, z)) return null;
        const den = [1, trim0(2 * z * wn), wn * wn];
        return { q: `$G=${fracT(wn * wn, polyT(den))}$ の極 ＝ □、ステップの答えの最初の山の時刻 ＝ □ s`, a: `$${pT}$、$${tT}$`, key: gkey([wn * wn], den), easyCheck: false,
          easy: `$${WN}=${wn}$、$\\zeta=${fmt(z)}$`,
          verify: p => { const ps = roots(den), wd = Math.abs(ps[0][1]); return chk(sameSet(valsOf(p.a).slice(0, 2), ps) || '極がちがう', near(numOf(p.a, 1), Math.PI / wd) || '最初の山がちがう'); } };
      },
      // 見かけがちがう：ばね・ダンパーや、係数が1でない分母の行きすぎ
      s3(r) {
        const z = [0.5, 0.7][peek(r, '70s3', 2)];   // 0.6（9.5 %）は例と同じ答えなので出さない（U-2）
        let q, den, key, ez;
        const kind70 = peek(r, '70s3k', 2);
        if (kind70 === 0) {
          const [m, k] = r.pick([[1, 4], [1, 9], [1, 16], [1, 25], [1, 100], [2, 8], [2, 18], [2, 50], [0.5, 2], [0.5, 8], [0.5, 18], [4, 1], [4, 25]]), c = trim0(2 * z * Math.sqrt(m * k));
          if (!Number.isInteger(c * 10)) return null;
          den = [m, c, k]; key = gkey([1], den);
          q = `質量 $${U(fmt(m), 'kg')}$、ばね $${U(fmt(k), 'N/m')}$、ダンパー $${U(fmt(c), 'N\\cdot s/m')}$ のおもりに一定の力を入れ続けた。行きすぎ ＝ 約 □ %${QOV}`;
          ez = `$\\zeta=\\dfrac{${fmt(c)}}{2\\sqrt{${fmt(m)}\\times${fmt(k)}}}=${fmt(z)}$`;
        } else {
          const a = r.pick([2, 3, 4, 5]), wn = r.pick([2, 4, 5, 10]), b = trim0(2 * z * wn * a);
          if (!Number.isInteger(b) || bad70(wn, z)) return null;
          den = [a, b, a * wn * wn]; key = gkey([a * wn * wn], den);
          q = `$G=${fracT(a * wn * wn, polyT(den))}$ のステップの答えの行きすぎ ＝ 約 □ %${QOV}`;
          ez = `$${a}$ でわる：$s^2+${fmt(b / a)}s+${wn * wn}$、$\\zeta=${fmt(z)}$`;
        }
        adv(r, '70s3', 2); adv(r, '70s3k', 2);
        return { q, a: `約${OVS[z]} %`, key, easyCheck: false, easy: ez,
          verify: p => { const ps = roots(den), w = Math.hypot(...ps[0]), zz = -ps[0][0] / w; return near(+(/[\d.]+/.exec(p.a) || [])[0], +(100 * Math.exp(-Math.PI * zz / Math.sqrt(1 - zz * zz))).toFixed(1)) || '行きすぎがちがう'; } };
      },
      // わな：極が実数（ζ>1）→ 9-68（かっこに分けて極を読む）
      trap(r) {
        const [p, q] = r.pick([[1, 4], [1, 3], [2, 3], [1, 5], [2, 5], [1, 6]]), K = p * q;
        const den = [1, p + q, p * q];
        return dest({ q: `$G=${fracT(K, polyT(den))}$ のステップの答えの行きすぎ`, a: `行きすぎない（極 $${-p}$、$${-q}$）`, key: gkey([K], den),
          verify: p0 => chk(/行きすぎない/.test(p0.a) || 'ことばがちがう', sameSet(valsOf(p0.a), roots(den)) || '極がちがう') }, '9-70',
          `分母は $${fac(p)}${fac(q)}$ と分かれ、極が実数（$\\zeta>1$）。ゆれずに落ち着くので行きすぎない`, ['9-68']);
      },
    },
  });
  // ================================================================ 9-71 安定かどうかは極の実部だけで決まる
  // 例：(s−3)/((s+1)(s+4)) → 零点3が右半分でも、極 −1・−4 で安定。極 −1±10j も安定（O-2）
  const ST = ['安定', '不安定'];
  const stab = cs => (maxRe(cs) < -1e-7 ? '安定' : '不安定');
  const zeroT = zs => zs.map(z => rootFac(z)).join('');
  add({
    id: '9-71', part: 5, chap: '9-9②⑦ 例題4', stars: 1,
    title: '安定かどうかは極の実部だけで決まる（零点・虚部は関係しない）',
    mark: '分子にも $s$ がある（零点）・虚部の大きい極。「安定か」。',
    futsu: ['ステップを入れて部分分数に分け、', '時間の世界にもどしてから、', '$t$ を大きくして落ち着くかを見る'],
    raku: ['$\\dfrac{s-3}{(s+1)(s+4)}$：零点3は右半分でも', '極 $-1$・$-4$ が左半分なので安定', '極 $-1\\pm10j$ も実部が負なので安定（速くゆれながら落ち着く）'],
    why: '極 $p$ ごとに動きの中に $e^{pt}$ が入るので、すべての極の実部が負なら、どの項も0に近づいて落ち着く（安定。9-9⑦）。零点（分子＝0 の $s$）は動きの形を変えるが、どの $e^{pt}$ が入るかは変えない。虚部はゆれの速さで、大きさが変わるかは実部だけで決まる。',
    caution: '零点 $3$ を極とまちがえない（9-9 のまちがえやすいところ②）。極が1つでも右半分なら不安定。実部が0の極（たての軸の上）は安定とはいわない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '40mm', trap: '40mm' },
    fits(q) {
      if (!/安定/.test(q) || /K|範囲|np\.roots/.test(q)) return false;
      if (/極が/.test(q)) return true;
      const d = dfracIn(q); return !!d && splitDen(d.den) >= 2;
    },
    steps: {
      // 実数の極と零点（安定・不安定を回す）
      s1(r) {
        const yes = peek(r, '71s1', 2) === 0, [p, q] = r.shuffle([1, 2, 3, 4, 5, 6]).slice(0, 2).sort((x, y) => x - y), z = r.pick([1, 2, 3, 5, 6, 7]);
        const ps = yes ? [-p, -q] : r.shuffle([p, -q]), zz = yes ? z : -z;   // 安定なら零点を右半分に、不安定なら左半分に
        if (exLike([z, p, q], [3, 1, 4]) || ps.includes(zz)) return null;
        const D = denOf(ps.map(v => ({ r: v })));
        adv(r, '71s1', 2);
        return { q: `$${fracT(rootFac(zz).replace(/^\(|\)$/g, ''), D.tex)}$ の極と、安定かどうか`, a: `${poleTeX(ps.map(v => ({ r: v })))}：${ST[yes ? 0 : 1]}`, key: gkey([1, -zz], D.cs), easyCheck: false,
          easy: `零点 $${zz}$ は関係しない`, verify: p0 => chk(sameSet(valsOf(p0.a), roots(D.cs)) || '極がちがう', p0.a.endsWith(stab(D.cs)) || '安定かどうかがちがう') };
      },
      // 虚部の大きい極（安定・不安定を回す）
      s2(r) {
        const yes = peek(r, '71s2', 2) === 0, sg = r.pick([1, 2, 0.5, 3]), w = r.pick([6, 8, 9, 10, 12, 15, 20]), z = r.pick([1, 2, 4, 5]);
        if (exLike([sg, w], [1, 10])) return null;
        const a = yes ? -sg : sg, fs = [{ a, b: w }], D = denOf(fs), num = r.chance(0.5) ? [1, -z] : [1, z];
        adv(r, '71s2', 2);
        return { q: `$${fracT(polyT(num), D.tex)}$ の極と、安定かどうか`, a: `$${pmT(a, w)}$：${ST[yes ? 0 : 1]}`, key: gkey(num, D.cs), easyCheck: false,
          easy: `実部 $${fmt(a)}$ だけを見る（虚部 $${w}$ は関係しない）`, verify: p0 => chk(sameSet(valsOf(p0.a), roots(D.cs)) || '極がちがう', p0.a.endsWith(stab(D.cs)) || '安定かどうかがちがう') };
      },
      // 見かけがちがう：3次の分母と2つの零点・ことばで書いた極と零点
      s3(r) {
        const yes = peek(r, '71s3', 2) === 0, c = r.pick([1, 2, 3, 5]), sg = r.pick([1, 2, 3]), w = r.pick([2, 3, 4, 5, 6]), [z1, z2] = r.shuffle([1, 2, 3, 4, 5]).slice(0, 2).sort((x, y) => x - y);
        const fs = yes ? [{ r: -c }, { a: -sg, b: w }] : [{ r: c }, { a: -sg, b: w }], D = denOf(fs);
        if (!yes && (z1 === c || z2 === c)) return null;   // 零点と極が重なると約分で消える
        if (exLike([sg, w], [1, 10])) return null;
        adv(r, '71s3', 2);
        if (turn(r, '71s3k', 2) === 0) {
          return { q: `$G=${fracT(zeroT([z1, z2]), D.tex)}$ の極と、安定かどうか`, a: `${poleTeX(fs)}：${ST[yes ? 0 : 1]}`, key: gkey(pmul([1, -z1], [1, -z2]), D.cs), easyCheck: false,
            easy: `零点 $${z1}$・$${z2}$ は右半分でも関係しない`, verify: p0 => chk(sameSet(valsOf(p0.a), roots(D.cs)) || '極がちがう', p0.a.endsWith(stab(D.cs)) || '安定かどうかがちがう') };
        }
        return { q: `極が ${poleTeX(fs)}、零点が $${z1}$・$${z2}$ の箱は安定か`, a: ST[yes ? 0 : 1], key: gkey(pmul([1, -z1], [1, -z2]), D.cs), easyCheck: false,
          easy: yes ? '極の実部がどれも負（零点は関係しない）' : `極 $${c}$ が右半分`, verify: p0 => p0.a === stab(D.cs) || '安定かどうかがちがう' };
      },
      // わな：展開した3次の分母 → 9-72（3次の判定）
      trap(r) {
        const yes = r.chance(0.5);
        for (let k = 0; k < 50; k++) {
          const a2 = r.int(1, 6), a1 = r.int(1, 8), a0 = r.int(1, 30);
          if ((a2 * a1 > a0) !== yes || a2 * a1 === a0) continue;
          const cs = [1, a2, a1, a0];
          return dest({ q: `分母が $${polyT(cs)}$ の箱は安定か`, a: `${ST[yes ? 0 : 1]}（$${a2}\\times${a1}${yes ? '>' : '<'}${a0}$）`, key: `71t:${cs}`,
            verify: p0 => p0.a.startsWith(stab(cs)) || '安定かどうかがちがう' }, '9-71',
            '分母が展開した3次式で、かっこに分かれていない。極を読めないので、3次の判定 $a_2a_1>a_0$', ['9-72']);
        }
        return null;
      },
    },
  });

  // ================================================================ 9-72 分母の係数で判定：2次は係数がすべて正、3次はさらに a2a1>a0
  // 例：s^3+4s^2+5s+(2+K) → 4×5>2+K で 0<K<18。s^2+3s−2 は係数に負があり不安定（O-2）
  const why72 = cs => {
    if (cs.some(c => c <= 0)) return '不安定（係数に負か0がある）';
    if (cs.length === 3) return '安定（係数がすべて正）';
    const [, a2, a1, a0] = cs; return a2 * a1 > a0 ? `安定（$${a2}\\times${a1}>${a0}$）` : `不安定（$${a2}\\times${a1}${a2 * a1 === a0 ? '=' : '<'}${a0}$）`;
  };
  const Kc = (c, b) => `(${c}+${b === 1 ? '' : b}K)`;
  // K の範囲の確かめ：上のはしの少し内では極がすべて左半分、少し外では右半分に出る
  const rangeOK = (csOfK, hi) => maxRe(csOfK(hi * 0.98)) < 0 && maxRe(csOfK(hi * 1.02)) > 0 && maxRe(csOfK(hi * 0.02)) < 0;
  const hiOf = t => { const m = /K<(.+)$/.exec(maths(t).join(' ').replace(/\s/g, '')); return m ? M.evalMath(m[1], {}) : null; };
  add({
    id: '9-72', part: 5, chap: '9-9⑦⑩ 例題9', stars: 1,
    title: '分母の係数で判定：2次は係数が正、3次はさらに $a_2a_1>a_0$',
    mark: '展開した2次・3次の分母。「安定か」「$K$ の範囲」。',
    futsu: ['3次方程式の解をさがし（組立除法・解の公式）、', '因数分解してから極を求め、', '実部の符号を1つずつ見る'],
    raku: ['$s^3+4s^2+5s+(2+K)$：係数が正で $4\\times5>2+K$', '→ $0<K<18$', '$s^2+3s-2$ は係数に負があり不安定'],
    why: '2次 $s^2+a_1s+a_0$ は、解と係数の関係から、極がどちらも左半分になるのは、ちょうど $a_1>0$ かつ $a_0>0$ のとき（9-9⑦）。3次 $s^3+a_2s^2+a_1s+a_0$ は、係数がすべて正で、さらに $a_2a_1>a_0$ のとき安定（9-9⑩のせいかくに言うと）。$a_2a_1=a_0$ がたての軸に極が来る境め。',
    caution: '$s^3$ の係数が1でないときは、全体をその係数でわってから見る（$a_2a_1>a_0$ はくらべる2つが同じ倍になるので、わらなくても同じ）。4次以上は「係数がすべて正」でも決まらない（Python で極を出す）。最終値の定理は、安定を確かめてから使う。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '22mm', s3: '22mm', trap: '20mm' },
    fits(q) {
      if (!/安定/.test(q) || /np\.roots|s\^4|極が/.test(q)) return false;
      if (/K\$? の範囲/.test(q)) return !/\\zeta/.test(q);
      return /分母が \$[^$]*s\^[23][^$]*\$/.test(q);
    },
    steps: {
      // 数の分母（2次・3次。安定・不安定を回す）
      s1(r) {
        const yes = peek(r, '72s1', 2) === 0;
        let cs = null;
        for (let k = 0; k < 60 && !cs; k++) {
          if (r.chance(0.25)) {   // 2次
            const a = r.int(1, 6), b = r.int(1, 9), c = yes ? [1, a, b] : r.chance(0.5) ? [1, -a, b] : [1, a, -b];
            if (!exLike(c, [1, 3, 2])) cs = c;
          } else {
            const a2 = r.int(1, 6), a1 = r.int(1, 9), a0 = r.int(1, 40);
            if (a2 * a1 === a0 || exLike([a2, a1], [4, 5])) continue;
            if (!yes && r.chance(0.3)) { cs = [1, a2, -a1, a0]; break; }
            if ((a2 * a1 > a0) === yes) cs = [1, a2, a1, a0];
          }
        }
        if (!cs || why72(cs).startsWith('安定') !== yes) return null;
        adv(r, '72s1', 2);
        return { q: `分母が $${polyT(cs)}$ の箱は安定か`, a: why72(cs), key: `72:${cs}`, easyCheck: false,
          easy: cs.length === 3 ? '2次の判定：係数がすべて正か' : '3次の判定：係数が正で $a_2a_1>a_0$ か', verify: p0 => p0.a.startsWith(stab(cs)) || '安定かどうかがちがう' };
      },
      // K の範囲（(s+a)^3+bK を展開した形・ふつうの3次）
      s2(r) {
        if (turn(r, '72s2', 2) === 0) {
          const a = r.pick([1, 2, 3, 4, 0.5]), b = r.pick([1, 1, 2, 4, 8]), hi = 8 * a ** 3 / b;
          if (!Number.isInteger(hi) || (a === 2 && b === 8)) return null;
          const f = K => [1, 3 * a, 3 * a * a, a ** 3 + b * K];
          return { q: `分母が $s^3+${fmt(3 * a)}s^2+${fmt(3 * a * a)}s+${Kc(fmt(a ** 3), b)}$ の箱が安定になる $K$ の範囲（$K>0$）`, a: `$0<K<${hi}$`, key: `72k:${f(0)}:${b}`, easyCheck: false,
            easy: `$${fmt(3 * a)}\\times${fmt(3 * a * a)}>${fmt(a ** 3)}+${b === 1 ? '' : b}K$`, verify: p0 => (near(hiOf(p0.a), hi) && rangeOK(f, hiOf(p0.a))) || '範囲がちがう' };
        }
        const a2 = r.int(2, 6), a1 = r.int(2, 9), c = r.int(1, 6), hi = a2 * a1 - c;
        if (hi <= 2 || exLike([a2, a1, c], [4, 5, 2])) return null;
        const f = K => [1, a2, a1, c + K];
        return { q: `分母が $s^3+${a2}s^2+${a1}s+${Kc(c, 1)}$ の箱が安定になる $K$ の範囲（$K>0$）`, a: `$0<K<${hi}$`, key: `72k:${f(0)}:1`, easyCheck: false,
          easy: `$${a2}\\times${a1}>${c}+K$`, verify: p0 => (near(hiOf(p0.a), hi) && rangeOK(f, hiOf(p0.a))) || '範囲がちがう' };
      },
      // 見かけがちがう：3つの1次おくれを比例の強さ K でもどす
      s3(r) {
        const [p, q, s] = r.pick([[1, 2, 3], [1, 1, 2], [1, 2, 4], [1, 3, 5], [2, 3, 4], [1, 1, 3], [2, 2, 3], [1, 2, 2]]);
        const base = pmul(pmul([1, p], [1, q]), [1, s]), hi = base[1] * base[2] - base[3];
        const f = K => padd(base, [K]);
        const ft = [p, q, s].filter((v, i, A) => A.indexOf(v) === i).map(v => { const n = [p, q, s].filter(x => x === v).length; return n > 1 ? `${fac(v)}^${n}` : fac(v); }).join('');
        return { q: `箱 $${fracT(1, ft)}$ に、ずれの $K$ 倍を入れて引いてもどす（$G_2=1$）。全体が安定になる $K$ の範囲（$K>0$）`, a: `$0<K<${hi}$`, key: `72k:${f(0)}:1`, easyCheck: false,
          easy: `全体の分母 $${polyT(base.slice(0, 3).concat([0]))}+(${base[3]}+K)$`, verify: p0 => (near(hiOf(p0.a), hi) && rangeOK(f, hiOf(p0.a))) || '範囲がちがう' };
      },
      // わな：4次の分母 → わざなし（Python で極）
      trap(r) {
        for (let k = 0; k < 80; k++) {
          const yes = r.chance(0.5), a = yes ? r.pick([1, 2, 3]) : r.pick([-1, -0.5]), b = r.pick([1, 2, 4, 5]), c = r.pick([2, 3, 4, 5, 6]), d = r.pick([2, 3, 4, 6, 8]);
          const cs = pmul([1, a, b], [1, c, d]);
          if (cs.some(v => v <= 0) || !cs.every(v => Number.isInteger(v * 10))) continue;
          return dest({ q: `分母が $${polyT(cs)}$ の箱は安定か`, a: ST[yes ? 0 : 1], key: `72t:${cs}`,
            verify: p0 => p0.a.startsWith(stab(cs)) || '安定かどうかがちがう' }, '9-72',
            `4次は係数がすべて正でも決まらない。Python で極を出し、実部の符号を見る（$(${polyT([1, a, b])})(${polyT([1, c, d])})$ に分かれる）`);
        }
        return null;
      },
    },
  });

  // ================================================================ 9-73 フィードバックの極と、比例だけで残るずれ 1/(1+G(0))
  // 例：G=5/(2s+1)、K_p=3 → 全体 15/(2s+16)、極 −8、残るずれ 1/16（6.25 %）（O-2）
  const KP = 'K_{\\mathrm p}';
  const bad73 = (a, t, kp) => (a === 5 && t === 2 && kp === 3) || near(1 / (1 + a * kp), 1 / 16);
  add({
    id: '9-73', part: 5, chap: '9-9⑨⑪ 例題6・7', stars: 1,
    title: '比例のフィードバック：極は全体の分母から、ずれは $\\dfrac{1}{1+G_1(0)}$',
    mark: '比例の強さ $K_{\\mathrm p}$ で、はかって引いてもどす。全体の極・時定数・残るずれ。',
    futsu: ['ステップの目標を入れた全体の $Y$ を部分分数に分け、', '時間の世界にもどして $y(t)$ を出し、', '$t$ を大きくした値を目標からひく'],
    raku: ['$G=\\dfrac{5}{2s+1}$、$K_{\\mathrm p}=3$ → 全体 $\\dfrac{15}{2s+1+15}=\\dfrac{15}{2s+16}$', '極 $-8$', '残るずれ $\\dfrac{1}{1+15}=\\dfrac{1}{16}$（6.25 %）'],
    why: '全体は $\\dfrac{G_1}{1+G_1}$（$G_1=K_{\\mathrm p}G$、$G_2=1$）。分母・分子に $G$ の分母をかけると、全体の分母は「$G$ の分母＋$G_1$ の分子」で、その0になる $s$ が全体の極（9-9⑨）。極が左半分なら最終値の定理が使えて、最後の値は $\\dfrac{G_1(0)}{1+G_1(0)}$、残るずれは $\\dfrac{1}{1+G_1(0)}$（9-9⑪）。',
    caution: '最終値の定理は、極が左半分（安定）のときだけ使う。$G_1(0)$ は $K_{\\mathrm p}$ と箱の定常のゲインのかけ算。比例を強くすると極は左へ動き、ずれは小さくなるが0にはならない（0にするのはずれの積分。わざ 9-75）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' }, boxh: { s1: '10mm', s2: '10mm' },
    fits(q) { return /比例|K_\{\\mathrm p\}/.test(q) && /極|ずれ|時定数|落ち着く温度/.test(q) && !/K_\{\\mathrm i\}|積分|\\zeta|範囲|伝達関数|限界|\^3/.test(q); },
    steps: {
      // 全体の極
      s1(r) {
        const a = r.pick([2, 4, 5, 10, 20]), t = r.pick([0.5, 1, 2, 4, 5, 10]), kp = r.pick([0.1, 0.2, 0.5, 1, 2, 3, 4]), g = trim0(a * kp);
        if (!Number.isInteger(g) || bad73(a, t, kp)) return null;
        const den = [t, 1 + g], pole = -(1 + g) / t;
        return { q: `$G=${t === 1 ? firstT(a, 1) : tauT(a, t)}$ を $${KP}=${fmt(kp)}$ で比例制御した全体の極`, a: `$${numT(pole)}$`, key: gkey([g], den), easyCheck: false,
          easy: `全体の分母 $${polyT([t, 1])}+${g}=0$`, verify: p0 => near(numOf(p0.a), roots(padd([t, 1], [a * kp]))[0][0]) || '極がちがう' };
      },
      // 残るずれ（分数で）
      s2(r) {
        const a = r.pick([2, 4, 5, 10, 20]), t = r.pick([0.5, 1, 2, 4, 5, 10]), kp = r.pick([0.1, 0.2, 0.5, 1, 2, 3, 4, 9]), g = trim0(a * kp);
        if (!Number.isInteger(g) || bad73(a, t, kp)) return null;
        return { q: `$G=${t === 1 ? firstT(a, 1) : tauT(a, t)}$ を $${KP}=${fmt(kp)}$ で比例制御したとき、残るずれ（目標に対する割合を分数で）`, a: `$${frac(1, 1 + g)}$`, key: gkey([g], [t, 1 + g]), easyCheck: false,
          easy: `$G_1(0)=${g}$、$\\dfrac{1}{1+${g}}$`, verify: p0 => near(numOf(p0.a), 1 - simulate([t, 1 + g], () => g, 30 * t / (1 + g))) || 'ずれがちがう' };
      },
      // 見かけがちがう：エアコン（落ち着く温度と時定数）
      s3(r) {
        const To = r.pick([32, 33, 34, 35, 36]), Ts = r.pick([24, 25, 26, 27, 28]), RC = r.pick([30, 40, 60, 90, 120]), k = r.pick([1, 2, 3, 4, 5, 9, 11, 14, 19]);
        const T = (To + k * Ts) / (1 + k), tc = RC / (1 + k);
        if (!Number.isInteger(+(T * 100).toFixed(6)) || !Number.isInteger(+(tc * 10).toFixed(6))) return null;
        return { q: `外 $${To}$ ℃、設定 $${Ts}$ ℃、$RC=${RC}$ 分のエアコンを $RK_{\\mathrm p}=${k}$ で比例制御。落ち着く温度 ＝ □ ℃、時定数 ＝ □ 分`,
          a: `$${fmt(T)}$、$${fmt(tc)}$`, key: `73a:${To}:${Ts}:${RC}:${k}`, easyCheck: false,
          easy: `$${RC}\\dot T=(${To}-T)-${k}(T-${Ts})$ で $\\dot T=0$`,
          verify: p0 => chk(near(numOf(p0.a, 0), +simulate([RC, 1 + k], () => To + k * Ts, 40 * tc).toFixed(6)) || '温度がちがう', near(numOf(p0.a, 1), -1 / roots([RC, 1 + k])[0][0]) || '時定数がちがう') };
      },
      // わな：ずれの積分を足す → 9-75
      trap(r) {
        const a = r.pick([2, 5, 10]), t = r.pick([0.5, 2]), kp = r.pick([1, 2]), ki = r.pick([2, 4, 5]);
        return dest({ q: `$G=${tauT(a, t)}$ を、$${KP}=${kp}$ にずれの積分 $K_{\\mathrm i}=${ki}$ を足して制御したとき、残るずれ`, a: '$0$', key: `73t:${a}:${t}:${kp}:${ki}`,
          verify: p0 => near(numOf(p0.a), 0) || 'ずれがちがう' }, '9-73',
          'ずれの積分 $\\dfrac{K_{\\mathrm i}}{s}$ がある（PI 制御）。$s\\to0$ で1周の倍率がかぎりなく大きくなり、ずれは0', ['9-75']);
      },
    },
  });
  // ================================================================ 9-74 ζ を選ぶ：s(s+a)+K を s^2+2ζω_n s+ω_n^2 とくらべる
  // 例：1/(s(s+8))、ζ=0.5 → ω_n=8、K=64、極 −4±4√3j（O-2）
  const bad74 = (a, z) => (a === 8 && z === 0.5);
  const armQ = (a, b) => `腕 $${fracT(b == null || b === 1 ? 1 : b, `s(s+${fmt(a)})`)}$ の比例制御（$K$）`;
  // a√3（√3 の前の数。分数なら \dfrac{n\sqrt3}{d}）
  function r3T(a) { const f = toFr(a); if (!f) return null; const [n, d] = f; const top = `${n === 1 ? '' : n}\\sqrt3`; return d === 1 ? top : `\\dfrac{${top}}{${d}}`; }
  add({
    id: '9-74', part: 5, chap: '9-9⑨ 例題8', stars: 1,
    title: '$\\zeta$ を選ぶ：$s(s+a)+K$ とくらべて $\\omega_{\\mathrm n}=\\dfrac{a}{2\\zeta}$、$K=\\omega_{\\mathrm n}^2$',
    mark: 'ロボットの腕 $\\dfrac{1}{s(s+a)}$ の角度制御。「$\\zeta$ を □ にする $K$」。',
    futsu: ['$s^2+8s+K=0$ を解の公式で解き、', '$K$ をいろいろ変えて極を出してから、', '$\\cos\\theta=\\zeta$ になる $K$ をさがす'],
    raku: ['$\\dfrac{1}{s(s+8)}$、$\\zeta=0.5$', '$2\\times0.5\\times\\omega_{\\mathrm n}=8$ で $\\omega_{\\mathrm n}=8$、$K=64$', '極 $-4\\pm4\\sqrt3\\,j$'],
    why: '全体の分母は $s(s+a)+K=s^2+as+K$（9-9⑨）。2次おくれの形 $s^2+2\\zeta\\omega_{\\mathrm n}s+\\omega_{\\mathrm n}^2$ とくらべると、$s$ の係数から $2\\zeta\\omega_{\\mathrm n}=a$、定数の項から $\\omega_{\\mathrm n}^2=K$。だから $\\omega_{\\mathrm n}=\\dfrac{a}{2\\zeta}$、$K=\\omega_{\\mathrm n}^2$。極は $-\\dfrac a2\\pm j\\sqrt{K-\\dfrac{a^2}{4}}$（実部は $K$ で変わらない）。',
    caution: '$K$ を大きくしても実部 $-\\dfrac a2$ は変わらず、$\\zeta$ が小さくなって行きすぎが大きくなる。箱の分子が1でない（$\\dfrac{b}{s(s+a)}$）ときは、$\\omega_{\\mathrm n}^2=bK$。3つ以上の箱をつなぐと分母が3次になり、この方法は使えない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 2, trap: 1 },
    boxw: { s1: '14mm', s2: '24mm', s3: '14mm', trap: '20mm' },
    fits(q) { return /\\zeta/.test(q) && /s\(s\+[\d.]+\)/.test(q) && /K/.test(q); },
    steps: {
      // ζ にする K
      s1(r) {
        const a = r.pick([2, 3, 4, 5, 6, 10, 12, 16, 20]), z = r.pick([0.5, 1, 0.25, 0.8, 0.6]), wn = a / (2 * z), K = trim0(wn * wn);
        if (bad74(a, z) || K === 64 || !Number.isInteger(wn * 2)) return null;
        return { q: `${armQ(a)}で $\\zeta=${fmt(z)}$ にする $K$`, a: `$${fmt(K)}$`, key: `74:${a}:${K}`, easyCheck: false,
          easy: `$2\\times${fmt(z)}\\times${WN}=${a}$ で $${WN}=${fmt(wn)}$`,
          verify: p0 => { const ps = roots([1, a, numOf(p0.a)]), w = Math.hypot(...ps[0]); return near(-ps[0][0] / w, z, 1e-6) || '$\\zeta$ にならない'; } };
      },
      // K とそのときの極
      s2(r) {
        const z = r.pick([0.6, 0.8, 0.5]);
        let a, K, pT;
        if (z === 0.5) { const k = r.pick([1, 2, 3, 5, 6]); a = 2 * k; K = 4 * k * k; pT = pmT(-k, `${k === 1 ? '' : k}\\sqrt3\\,`); }
        else { const k = r.pick([1, 2, 3]); const wn = 5 * k; a = 2 * z * wn; K = wn * wn; pT = z === 0.6 ? pmT(-3 * k, 4 * k) : pmT(-4 * k, 3 * k); }
        if (bad74(a, z) || a === 8) return null;
        return { q: `${armQ(a)}で $\\zeta=${fmt(z)}$ にする $K$ ＝ □、そのときの極 ＝ □`, a: `$${K}$、$${pT}$`, key: `74:${a}:${K}`, easyCheck: false,
          easy: `$${WN}=\\dfrac{${a}}{2\\times${fmt(z)}}=${fmt(a / (2 * z))}$、分母 $s^2+${a}s+${K}$`,
          verify: p0 => chk(near(numOf(p0.a, 0), K) || '$K$ がちがう', sameSet(valsOf(p0.a).slice(1), roots([1, a, K])) || '極がちがう') };
      },
      // 見かけがちがう：分子が1でない腕・K から ζ
      s3(r) {
        if (turn(r, '74s3', 2) === 0) {
          const b = r.pick([2, 4, 5, 10]), a = r.pick([2, 4, 6, 10, 20]), z = r.pick([0.5, 1, 0.25]), wn = a / (2 * z), K = trim0(wn * wn / b);
          if (!Number.isInteger(K * 100)) return null;
          return { q: `${armQ(a, b)}で $\\zeta=${fmt(z)}$ にする $K$`, a: `$${fmt(K)}$`, key: `74b:${a}:${b}:${K}`, easyCheck: false,
            easy: `分母 $s^2+${a}s+${b}K$、$${WN}^2=${b}K=${fmt(wn * wn)}$`,
            verify: p0 => { const ps = roots([1, a, b * numOf(p0.a)]), w = Math.hypot(...ps[0]); return near(-ps[0][0] / w, z, 1e-6) || '$\\zeta$ にならない'; } };
        }
        const a = r.pick([2, 4, 6, 8, 10]), K = r.pick([1, 4, 9, 16, 25, 36, 100]), z = a / (2 * Math.sqrt(K));
        if (!Number.isInteger(z * 100) || z >= 1.5 || bad74(a, z)) return null;
        return { q: `${armQ(a)}で $K=${K}$ のときの $\\zeta$`, a: `$${fmt(z)}$`, key: `74:${a}:${K}`, easyCheck: false,
          easy: `$${WN}=\\sqrt{${K}}=${fmt(Math.sqrt(K))}$、$2\\zeta\\times${fmt(Math.sqrt(K))}=${a}$`,
          verify: p0 => { const D = a * a - 4 * K; const want = D >= 0 ? a / (2 * Math.sqrt(K)) : -roots([1, a, K])[0][0] / Math.sqrt(K); return near(numOf(p0.a), want) || '$\\zeta$ がちがう'; } };
      },
      // わな：3つの1次おくれ（分母が3次）→ 9-72
      trap(r) {
        const [p, q, s] = r.pick([[1, 2, 3], [1, 3, 4], [2, 3, 5], [1, 2, 5], [1, 4, 5]]);
        const base = pmul(pmul([1, p], [1, q]), [1, s]), hi = base[1] * base[2] - base[3];
        return dest({ q: `箱 $${fracT(1, `${fac(p)}${fac(q)}${fac(s)}`)}$ を比例の強さ $K$ でもどす。安定になる $K$ の範囲（$K>0$）`, a: `$0<K<${hi}$`, key: `74t:${p}:${q}:${s}`,
          verify: p0 => (near(hiOf(p0.a), hi) && rangeOK(K => padd(base, [K]), hi)) || '範囲がちがう' }, '9-74',
          '分母が3次式で、$s^2+2\\zeta\\omega_{\\mathrm n}s+\\omega_{\\mathrm n}^2$ とくらべられない。3次の判定 $a_2a_1>a_0$', ['9-72']);
      },
    },
  });

  // ================================================================ 9-75 ずれの積分を足す（K_p+K_i/s）と、安定なら残るずれは0
  // 例：G=1/(s+1)、K_p=4、K_i=6 → 分母 s^2+5s+6、極 −2・−3 → ずれ0（O-2）
  const KI = 'K_{\\mathrm i}';
  const piQ = (Gt, kp, ki) => `箱 $G=${Gt}$ を、PI 制御 $${KP}+\\dfrac{${KI}}{s}$（$${KP}=${fmt(kp)}$、$${KI}=${fmt(ki)}$、$G_2=1$）で動かす`;
  // a/(s+p) の箱で、全体の極が −r1・−r2 になる K_p・K_i（なければ null）
  function pi75(r) {
    const a = r.pick([1, 2, 4, 5, 10]), p = r.pick([1, 2, 3, 0.5]), [r1, r2] = r.shuffle([1, 2, 3, 4, 5, 6, 8, 10]).slice(0, 2).sort((x, y) => x - y);
    const kp = trim0((r1 + r2 - p) / a), ki = trim0(r1 * r2 / a);
    if (kp <= 0 || !Number.isInteger(kp * 10) || !Number.isInteger(ki * 10) || (r1 === 2 && r2 === 3) || (a === 1 && p === 1 && kp === 4)) return null;
    if (near(ki / kp, p)) return null;   // PI の零点 −K_i/K_p が箱の極と重なると約分で消えるので出さない
    return { a, p, r1, r2, kp, ki, den: padd(pmul([1, 0], [1, p]), [a * kp, a * ki]) };
  }
  add({
    id: '9-75', part: 5, chap: '9-9⑪（もっと）・9-12⑦', stars: 1,
    title: 'ずれの積分（$K_{\\mathrm p}+\\dfrac{K_{\\mathrm i}}{s}$）で残るずれは0',
    mark: 'PI 制御・「ずれの積分」「ずれを0に」。全体の分母・極・残るずれ。',
    futsu: ['全体の伝達関数にステップ $\\dfrac1s$ をかけて部分分数に分け、', '時間の世界にもどして $y(t)$ を出し、', '$t$ を大きくして目標とくらべる'],
    raku: ['$G=\\dfrac{1}{s+1}$、$K_{\\mathrm p}=4$、$K_{\\mathrm i}=6$', '分母 $s(s+1)+(4s+6)=s^2+5s+6$、極 $-2$・$-3$（左半分）', '→ 最終値の定理でずれ0'],
    why: '制御の箱は $K_{\\mathrm p}+\\dfrac{K_{\\mathrm i}}{s}=\\dfrac{K_{\\mathrm p}s+K_{\\mathrm i}}{s}$（積分は $\\dfrac1s$ のかけ算。9-6）。$G=\\dfrac{a}{s+p}$ なら、全体の分母は $s(s+p)+a(K_{\\mathrm p}s+K_{\\mathrm i})$。極が左半分なら最終値の定理が使え、$s\\to0$ で1周の倍率がかぎりなく大きくなるので、ずれ $\\dfrac{1}{1+(\\text{1周の倍率})}$ は0になる（9-9⑪のもっと知りたい）。',
    caution: '先に極が左半分か（安定か）を確かめる。積分を足すと極が1つふえる（分母が1次から2次に）。$\\dfrac{a}{\\tau s+1}$ の形なら、分母は $s(\\tau s+1)+a(K_{\\mathrm p}s+K_{\\mathrm i})$ で、$s^2$ の係数が $\\tau$。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '20mm', s3: '30mm', trap: '16mm' },
    fits(q) { return /K_\{\\mathrm i\}|PI 制御|ずれの積分/.test(q) && !/積分なし|K_\{\\mathrm i\}=0\$/.test(q); },
    steps: {
      // 全体の分母
      s1(r) {
        const g = pi75(r); if (!g) return null;
        return { q: `${piQ(firstT(g.a, g.p), g.kp, g.ki)}。全体の分母（$s^2$ の係数を1に）`, a: `$${polyT(g.den)}$`, key: gkey([1], g.den), easyCheck: false,
          easy: `$s(s+${fmt(g.p)})+${g.a === 1 ? '' : g.a}(${polyT([g.kp, g.ki])})$`,
          verify: p0 => { const m = maths(p0.a)[0]; return [0.37, 1.29, -2.3].every(x => near(M.evalMath(m, { s: x }), x * (x + g.p) + g.a * (g.kp * x + g.ki))) || '分母がちがう'; } };
      },
      // 全体の極
      s2(r) {
        const g = pi75(r); if (!g) return null;
        return { q: `${piQ(firstT(g.a, g.p), g.kp, g.ki)}。全体の極`, a: `$${-g.r1}$、$${-g.r2}$`, key: gkey([1], g.den), easyCheck: false,
          easy: `分母 $${polyT(g.den)}=(s+${g.r1})(s+${g.r2})$`,
          verify: p0 => sameSet(valsOf(p0.a), roots([1, g.p + g.a * g.kp, g.a * g.ki])) || '極がちがう' };
      },
      // 見かけがちがう：τ の形のモーター（極と残るずれ）
      s3(r) {
        const t = r.pick([0.5, 0.25, 0.2, 0.1]), a = r.pick([2, 4, 5, 10, 20]), [r1, r2] = r.shuffle([1, 2, 4, 5, 6, 8, 10, 20]).slice(0, 2).sort((x, y) => x - y);
        const kp = trim0(((r1 + r2) * t - 1) / a), ki = trim0(r1 * r2 * t / a);
        if (kp <= 0 || !Number.isInteger(kp * 100) || !Number.isInteger(ki * 100) || (a === 10 && t === 0.5 && kp === 1 && ki === 2) || near(ki / kp, 1 / t)) return null;
        const den = [t, 1 + a * kp, a * ki];
        return { q: `${piQ(tauT(a, t), kp, ki)}。全体の極 ＝ □、目標を1にしたとき残るずれ ＝ □`, a: `$${-r1}$、$${-r2}$、$0$`, key: gkey([1], den), easyCheck: false,
          easy: `分母 $s(${polyT([t, 1])})+${a}(${polyT([kp, ki])})=${polyT(den)}$、$${fmt(t)}$ でわる`,
          verify: p0 => { const v = valsOf(p0.a); return chk(sameSet(v.slice(0, 2), roots(den)) || '極がちがう', (v.length === 3 && near(v[2][0], 0)) || 'ずれがちがう'); } };
      },
      // わな：比例だけ → 9-73
      trap(r) {
        const a = r.pick([1, 2, 4, 5]), p = r.pick([1, 2, 4]), kp = r.pick([1, 2, 3, 4]), g0 = a * kp / p;
        if (a === 1 && p === 1 && kp === 4) return null;
        return dest({ q: `箱 $G=${firstT(a, p)}$ を、ずれの積分なし（$${KP}=${kp}$、$${KI}=0$）で動かす。目標を1にしたとき残るずれ`, a: `$${frT(1 / (1 + g0))}$`, key: `75t:${a}:${p}:${kp}`,
          verify: p0 => near(numOf(p0.a), 1 - simulate([1, p + a * kp], () => a * kp, 40 / (p + a * kp))) || 'ずれがちがう' }, '9-75',
          `ずれの積分がない比例だけの制御。ずれは $\\dfrac{1}{1+G_1(0)}$ で、0にならない`, ['9-73']);
      },
    },
  });

  // ================================================================ 9-96 路面から車体への伝達関数 (cs+k)/(ms^2+cs+k)
  // 例：m=250、c=2000、k=16000 → 極 −4±4√3j、零点 −8（O-2）
  const bad96 = (m, c, k) => exLike([m, c, k], [250, 2000, 16000]);
  const carQ = (m, c, k) => `車体 $${U(m, 'kg')}$、ばね $${U(k, 'N/m')}$、ダンパー $${U(c, 'N\\cdot s/m')}$`;
  add({
    id: '9-96', part: 5, chap: '9-8（もっと）・9-9⑥', stars: 1,
    title: '路面から車体へは $\\dfrac{cs+k}{ms^2+cs+k}$（零点はダンパーから）',
    mark: '「路面の高さ $x_{\\mathrm r}$ → 車体の高さ $x$」。サスペンションの伝達関数・零点・極。',
    futsu: ['$m\\ddot x=-k(x-x_{\\mathrm r})-c(\\dot x-\\dot x_{\\mathrm r})$ に段差 $x_{\\mathrm r}=hH(t)$ を入れ、', '9-7 のように解いて $x(t)$ を出してから、', '動きを見る'],
    raku: ['$m=250$、$c=2000$、$k=16000$', '→ $\\dfrac{2000s+16000}{250s^2+2000s+16000}$', '零点 $-8$、極 $-4\\pm4\\sqrt3\\,j$'],
    why: 'ばねとダンパーは、車体と路面の差 $x-x_{\\mathrm r}$ でのび縮みする。はじめの値を0にして変換すると $(ms^2+cs+k)X=(cs+k)X_{\\mathrm r}$（9-8 のもっと知りたい）。分子の $cs$ は、ダンパーが路面の上がる速さも車体に伝える分で、零点 $-\\dfrac kc$ を作る。極は分母 $ms^2+cs+k=0$ の解（9-9⑥）。',
    caution: '力 $f$ を車体に加えるとき（$m\\ddot x+c\\dot x+kx=f$）は、分子は1（わざ 9-61）。零点は動きの形（行きすぎ）を変えるが、落ち着くかどうかは極だけで決まる。$G(0)=1$：段差の高さに落ち着く。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '22mm', s3: '16mm', trap: '30mm' }, boxh: { s1: '11mm', trap: '11mm' },
    fits(q) { return /路面/.test(q); },
    steps: {
      // 伝達関数
      s1(r) {
        const m = r.pick([100, 200, 300, 400, 500]), c = r.pick([500, 800, 1000, 1500, 1200, 3000]), k = r.pick([5000, 8000, 10000, 12000, 20000, 30000]);
        if (bad96(m, c, k)) return null;
        const num = [c, k], den = [m, c, k];
        return { q: `${carQ(m, c, k)}の、路面の高さ $x_{\\mathrm r}$ から車体の高さ $x$ への伝達関数`, a: `$${fracT(polyT(num), polyT(den))}$`, key: gkey(num, den), easyCheck: false,
          easy: `$(${polyT(den)})X=(${polyT(num)})X_{\\mathrm r}$`,
          verify: p0 => fnSame(p0.a, 0, x => (c * x + k) / (m * x * x + c * x + k)) || '伝達関数がちがう' };
      },
      // 零点と極
      s2(r) {
        const [sg, w] = r.pick([[2, 4], [3, 3], [5, 5], [1, 3], [4, 8], [2, 6], [3, 9], [4, 2], [5, 10], [1, 2], [3, 6]]), m = r.pick([100, 200, 250, 400, 500]);
        const c = 2 * sg * m, k = (sg * sg + w * w) * m, z = -k / c;
        if (bad96(m, c, k)) return null;
        return { q: `${carQ(m, c, k)}の、路面から車体への伝達関数の零点 ＝ □、極 ＝ □`, a: `$${numT(z)}$、$${pmT(-sg, w)}$`, key: gkey([c, k], [m, c, k]), easyCheck: false,
          easy: `零点 $-\\dfrac{k}{c}$、極は $${m}s^2+${c}s+${k}=0$`,
          verify: p0 => chk(near(numOf(p0.a, 0), roots([c, k])[0][0]) || '零点がちがう', sameSet(valsOf(p0.a).slice(1), roots([m, c, k])) || '極がちがう') };
      },
      // 見かけがちがう：伝達関数の数から c と k
      s3(r) {
        const a = r.pick([4, 6, 8, 10, 12]), b = r.pick([25, 36, 49, 64, 100]), m = r.pick([200, 250, 300, 400]);
        if (bad96(m, a * m, b * m) || a * a >= 4 * b) return null;
        return { q: `車体 $${U(m, 'kg')}$ の1輪分の、路面から車体への伝達関数が $${fracT(`${a}s+${b}`, `s^2+${a}s+${b}`)}$ だった。ダンパー $c$ ＝ □ $\\mathrm{N\\cdot s/m}$、ばね $k$ ＝ □ $\\mathrm{N/m}$`,
          a: `$${a * m}$、$${b * m}$`, key: gkey([a, b], [1, a, b]), easyCheck: false,
          easy: `$\\dfrac{cs+k}{ms^2+cs+k}$ の分母・分子を $m=${m}$ でわった形`,
          verify: p0 => { const cc = numOf(p0.a, 0), kk = numOf(p0.a, 1); return fnSame(`$${fracT(`${cc}s+${kk}`, `${m}s^2+${cc}s+${kk}`)}$`, 0, x => (a * x + b) / (x * x + a * x + b)) || 'c・k がちがう'; } };
      },
      // わな：車体に力を加える → 9-61
      trap(r) {
        const m = r.pick([200, 300, 500]), c = r.pick([1000, 1500, 2500]), k = r.pick([10000, 20000, 25000]);
        return dest({ q: `車体（$${U(m, 'kg')}$）をばね $${U(k, 'N/m')}$ とダンパー $${U(c, 'N\\cdot s/m')}$ で動かない台にのせ、車体に上から力 $f$ を加える。$${m}\\ddot x+${c}\\dot x+${k}x=f$ の伝達関数 $\\dfrac XF$`,
          a: `$${fracT(1, polyT([m, c, k]))}$`, key: gkey([1], [m, c, k]),
          verify: p0 => fnSame(p0.a, 0, x => 1 / (m * x * x + c * x + k)) || '伝達関数がちがう' }, '9-96',
          '入れるものは路面の高さではなく、車体に加える力。分子に $cs+k$ は出ない（はじめの値0で $\\dot x\\to sX$）', ['9-61']);
      },
    },
  });

  // ================================================================ 9-97 3次の限界の極は3乗根：(s+a)^3=−K と、ゆれの周期
  // 例：(s+2)^3+8K、K=8 → 極 −6、±2√3j、周期 π/√3（O-2）
  // 限界は (s+a)^3=-8a^3 のとき：s+a=-2a、a(1±√3j) → 極 −3a、±a√3 j。周期 2π/(a√3)
  const per97 = a => { const [n, d] = toFr(2 / a); return `\\dfrac{${n === 1 ? '' : n}\\pi}{${d === 1 ? '' : d}\\sqrt3}`; };
  const pol97 = a => `$${fmt(-3 * a)}$、$${pmT(0, r3T(a) + '\\,')}$`;
  const bad97 = (a, b) => a === 2 || near(8 * a ** 3 / b, 8);
  add({
    id: '9-97', part: 5, chap: '9-9⑩ 例題9', stars: 1,
    title: '3次の限界の極は3乗根：$-3a$ と $\\pm\\sqrt3\\,a\\,j$',
    mark: '分母が $(s+a)^3+K$ の形（電気炉）。「安定の限界の $K$」「そのときの極・ゆれの周期」。',
    futsu: ['分母を展開して3次の判定で限界の $K$ を出し、', 'その $K$ の3次方程式を組立除法で因数分解して、', '2次の部分を解の公式で解く'],
    raku: ['$(s+2)^3+8K$：限界は $(s+2)^3=-64$', '$s+2=-4$、$2\\pm2\\sqrt3\\,j$ → 極 $-6$、$\\pm2\\sqrt3\\,j$（$K=8$）', 'ゆれの周期 $\\dfrac{2\\pi}{2\\sqrt3}=\\dfrac{\\pi}{\\sqrt3}$'],
    why: '$w=s+a$ と置くと $w^3=-K$ で、3つの解は原点を中心とする正三角形の頂点（6-9・9-9⑩）。上下の2つ $w=K^{1/3}\\bigl(\\frac12\\pm\\frac{\\sqrt3}{2}j\\bigr)$ の実部 $-a+\\frac{K^{1/3}}{2}$ が0になるのが限界で、$K^{1/3}=2a$、$K=8a^3$。そのとき $w=-2a$、$a\\pm\\sqrt3\\,a\\,j$ なので、極は $-3a$ と $\\pm\\sqrt3\\,a\\,j$。ゆれの角周波数は $\\sqrt3\\,a$、周期は $\\dfrac{2\\pi}{\\sqrt3\\,a}$。',
    caution: '$(s+a)^3+bK$ なら限界は $bK=8a^3$。$\\dfrac{1}{\\tau s+1}$ を3つなら $(s+\\frac1\\tau)^3$ の形に直す（$a=\\frac1\\tau$）。ゆれの周期は $\\dfrac{2\\pi}{\\text{虚部}}$（虚部そのものではない）。$(s+1)(s+2)(s+3)+K$ のように3つがちがうと、3乗根では解けない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '22mm', s3: '30mm', trap: '30mm' }, boxh: { s2: '11mm' },
    fits(q) { return /限界/.test(q) && /\^3|3つ/.test(q) && !/\(s\+[\d.]+\)\(s\+[\d.]+\)\(s\+[\d.]+\)/.test(q); },
    steps: {
      // 限界の極
      s1(r) {
        const a = r.pick([1, 3, 4, 5, 0.5, 6, 1.5, 10]), b = r.pick([1, 1, 2, 4, 8]);
        if (bad97(a, b)) return null;
        return { q: `分母が $(s+${fmt(a)})^3+${b === 1 ? '' : b}K$ の箱で、安定の限界の $K$ での極`, a: pol97(a), key: `97:${a}`, easyCheck: false,
          easy: `$(s+${fmt(a)})^3=${fmt(-8 * a ** 3)}$ の3乗根：$s+${fmt(a)}=${fmt(-2 * a)}$、$${fmt(a)}\\pm${r3T(a)}\\,j$`,
          verify: p0 => sameSet(valsOf(p0.a), roots([1, 3 * a, 3 * a * a, 9 * a ** 3])) || '極がちがう' };
      },
      // 限界の K とゆれの周期
      s2(r) {
        const a = r.pick([1, 3, 4, 0.5, 5, 6, 1.5, 10]), b = r.pick([1, 2, 4, 8]), K = 8 * a ** 3 / b;
        if (bad97(a, b) || !Number.isInteger(K)) return null;
        return { q: `分母が $(s+${fmt(a)})^3+${b === 1 ? '' : b}K$ の電気炉（時間の単位は分）で、安定の限界の $K$ ＝ □、そのときのゆれの周期 ＝ □ 分`, a: `$${K}$、$${per97(a)}$`, key: `97:${a}`, easyCheck: false,
          easy: `$${b === 1 ? '' : b}K=8\\times${fmt(a)}^3$、極の虚部 $${r3T(a)}$`,
          verify: p0 => { const K0 = numOf(p0.a, 0), cs = [1, 3 * a, 3 * a * a, a ** 3 + b * K0], im = Math.max(...roots(cs).map(z => Math.abs(z[1]))); return chk(near(maxRe(cs), 0, 1e-6) || '限界の $K$ がちがう', near(numOf(p0.a, 1), 2 * Math.PI / im, 1e-6) || '周期がちがう'); } };
      },
      // 見かけがちがう：1次おくれ τ を3つ・倍率 b
      s3(r) {
        const t = r.pick([0.25, 0.5, 2, 4, 5, 0.2]), b = r.pick([2, 4, 5, 10]), a = 1 / t, K = 8 / b;   // b=1 は限界が例と同じ K=8 になるので出さない
        if (bad97(a, 1) && t === 0.5) return null;
        return { q: `時定数 $${fmt(t)}$ 分の1次おくれ $${fracT(1, polyT([t, 1]))}$ を3つつなぎ、ヒーターの倍率 $${b}$ と比例の強さ $K$ でもどす（全体の分母 $(${polyT([t, 1])})^3+${b === 1 ? '' : b}K$）。安定の限界の $K$ ＝ □、そのときの極 ＝ □`,
          a: `$${numT(K)}$、${pol97(a)}`, key: `97t:${t}:${b}`, easyCheck: false,
          easy: `$${polyT([t, 1])}=${fmt(t)}(s+${fmt(a)})$ なので $(s+${fmt(a)})^3$ の形に直す`,
          verify: p0 => { const K0 = numOf(p0.a, 0), cs = padd(pmul(pmul([t, 1], [t, 1]), [t, 1]), [b * K0]); return chk(near(maxRe(cs), 0, 1e-6) || '限界の $K$ がちがう', sameSet(valsOf(p0.a).slice(1), roots(cs), 1e-5) || '極がちがう'); } };
      },
      // わな：3つがちがう1次おくれ → 9-72（限界では (s+a2)(s^2+a1) に分かれる）
      trap(r) {
        const [p, q, s] = r.pick([[1, 2, 3], [1, 2, 5], [1, 3, 4], [2, 3, 5]]), base = pmul(pmul([1, p], [1, q]), [1, s]), hi = base[1] * base[2] - base[3];
        const cs = padd(base, [hi]);
        return dest({ q: `分母が $${fac(p)}${fac(q)}${fac(s)}+K$ の箱で、安定の限界の $K$ での極`, a: `$${-base[1]}$、$\\pm\\sqrt{${base[2]}}\\,j$`, key: `97t:${p}:${q}:${s}`,
          verify: p0 => sameSet(valsOf(p0.a), roots(cs), 1e-6) || '極がちがう' }, '9-97',
          `3つのかっこがちがうので3乗根の形にならない。展開して3次の判定で限界 $K=${hi}$ を出すと、分母は $(s+${base[1]})(s^2+${base[2]})$ に分かれる`, ['9-72']);
      },
    },
  });
})(globalThis.MONDAI);

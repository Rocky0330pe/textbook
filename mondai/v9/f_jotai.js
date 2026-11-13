/* 問題集 第9巻　第6部 状態方程式と行列の指数関数（わざ 9-76〜9-90、9-98・9-99）　組 f
 * 書き方は v8/README.md（第8・9巻の手引き）→ v6/README.md・v5/README.md。文は教科書 第9巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 9-10（状態方程式）・9-11（行列の指数関数）・9-12③（ノイズキャンセリング）・9-13⑯⑱（専門書の式）の数・ことば・記号にそろえる
 *   （状態 $\vec x$、入れるもの $u$、はかるもの $y=C\vec x$、$\dot{\vec x}=A\vec x+Bu$、状態フィードバック $u=-K\vec x$、$A-BK$、$A_{\mathrm d}=I+(A-BK)\Delta t$ と固有値 $\mu$、
 *   $G(s)=C(sI-A)^{-1}B$、$e^{At}=Pe^{Dt}P^{-1}$、$N=A-\sigma I$、倒立振子・線形化・車A・水そう・RLC・送電線・可制御）。用字は「おそい」「はかる」（W-13）。$H$ はステップ関数だけ（W-14。水位は $h$）。
 * 行列は pmatrix（W-11）。$e^{At}$ は外に出した $e^{-4t}$・$\frac12$ の形を本の答えにし、中に入れた形も正（calc の mat は前の数も読む）。固有値の順は問わない（Q-3）。
 * 検算：行列は calc（kind 'mat'。$t$ の式の行列は vars ['t']）と、verify(p) で別の道すじ（$e^{At}$ は数のテイラー展開と2乗のくり返し、$A$・$B$ はもとの式に数を入れる、
 *   $G(s)$ は $(sI-A)^{-1}$ を数で作る、固有値は解の公式、$x(t)$ はルンゲ・クッタ法で式をたどる）。近似の値は agree（O-4。W-2：教科書の4けた）。
 * 図は 9-78 のステップ3だけ（台車の上に立てた棒。K-2）。表・プログラムはない。
 * 左ページの「楽な形」と目印・注意の例の数は、同じ見開きの問題に出さない（O-2）。例の行列の入れかえ・符号を変えただけ・転置・何倍かも出さない（exLike。S-2・U-2）。
 *   1つのステップに同じ答えを3つ以上出さない（U-3。add）。「落ち着く・落ち着かない」「可制御か」は両方出るように回す（peek・adv）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7・U-4）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const r9 = v => Math.round(v * 1e9) / 1e9;
  const nf = v => { const s = String(+(+r9(v)).toFixed(9)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 問題ができたときだけ進める回し方（答えのかたよりをなくす。S-4・U-3）：peek で今の番を見て、問題を返す前に adv で進める
  const peek = (r, key, n) => { const d = r.turns || (r.turns = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return d[key]; };
  const adv = (r, key, n) => { r.turns[key] = (r.turns[key] + 1) % n; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const decs = v => { const s = nf(v); return s.includes('.') ? s.split('.')[1].length : 0; };
  const isInt = v => Math.abs(v - Math.round(v)) < 1e-9;
  const isSq = n => isInt(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === Math.round(n);
  const U = (v, u) => `${v}\\,\\mathrm{${u}}`;   // $…$ の中で使う
  // 大きな数（$10^4$・$2\times10^4$）。教科書 9-10 の書き方
  function big(v) {
    if (Math.abs(v) < 1e4 || !isInt(v)) return nf(v);
    const sg = v < 0 ? '-' : '', a = Math.abs(v), k = Math.floor(Math.log10(a) + 1e-9), m = a / 10 ** k;
    return isInt(m) ? `${sg}${m === 1 ? '' : m + '\\times'}10^${k > 9 ? `{${k}}` : k}` : nf(v);
  }
  const cell = c => (typeof c === 'string' ? c : big(c));
  const pm = A => `\\begin{pmatrix}${A.map(row => row.map(cell).join('&')).join('\\\\')}\\end{pmatrix}`;   // 行列
  const cv = v => pm(v.map(x => [x]));        // たてのベクトル
  const rv = v => pm([v]);                    // 横の1行
  const vt = v => `(${v.map(cell).join(',\\ ')})`;   // 文の中のベクトル (1,\ -2)
  const kA = A => A.flat().map(nf).join(',');
  // 例の行列 B と、数の大きさの組が同じか、何倍かになっている（入れかえ・符号を変えただけ・転置・何倍か。S-2・U-2）
  const absSort = A => A.flat().map(x => Math.abs(x)).sort((x, y) => x - y);
  function exLike(A, B) {
    if (A.flat().length !== B.flat().length) return false;
    const a = absSort(A), b = absSort(B), ma = a[a.length - 1], mb = b[b.length - 1];
    if (!ma || !mb) return false;
    return a.every((x, i) => Math.abs(x - ma / mb * b[i]) < 1e-9 * Math.max(1, ma));
  }
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  const cf = (c, body) => (c === 0 ? '' : c === 1 ? body : c === -1 ? '-' + body : nf(c) + body);   // 係数 × 式（1・−1 は書かない）
  // 有理数 [n, d]（分母は正、約分ずみ）
  const Q = (n, d) => { d = d == null ? 1 : d; if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); return [n / g, d / g]; };
  const toQ = v => { for (let d = 1; d <= 5000; d++) { const n = Math.round(v * d); if (Math.abs(n - v * d) < 1e-7 * Math.max(1, Math.abs(v * d))) return Q(n, d); } return null; };
  const qv = q => q[0] / q[1];
  // 係数 q（有理数）× 式 body の TeX。1・−1 は書かない。分数は \frac（行列の中でも高くならない）
  function qTeX(q, body, small) {
    if (!q || q[0] === 0) return '';
    const sg = q[0] < 0 ? '-' : '', a = Math.abs(q[0]), d = q[1];
    if (d === 1) return sg + (a === 1 && body ? '' : a) + (body || '');
    return `${sg}\\${small ? 'tfrac' : 'frac'}{${a}}{${d}}${body || ''}`;
  }
  // 行列の成分の和（分数は \tfrac）
  const linS = ts => sum(ts.map(([q, b]) => qTeX(q, b, true)));
  // e^{at} の TeX（a=0 なら ''）
  const ex = a => (a === 0 ? '' : `e^{${a === 1 ? '' : a === -1 ? '-' : nf(a)}t}`);
  // 式の和 [[係数（有理数）, 本体（TeX）], …]
  const lin = ts => sum(ts.map(([q, b]) => qTeX(q, b)));
  // √N を外に出せる数を出した形に（50 → 5\sqrt{2}）。N は整数
  function sqrtTeX(N) {
    let out = 1, inn = N;
    for (let f = 2; f * f <= inn; f++) while (inn % (f * f) === 0) { inn /= f * f; out *= f; }
    return inn === 1 ? String(out) : `${out === 1 ? '' : out}\\sqrt{${inn}}`;
  }
  // 小数第 k 位で四捨五入した文字
  const rd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-9) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  // 文の値で計算した値 a と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4・S-3）。ちがえば null。けたの境（…5）に近いものも出さない
  const agree = (a, v, k) => { const s = rd(a, k); if (s !== rd(v, k)) return null; const w = Math.abs(a) * 10 ** k, u = Math.abs(v) * 10 ** k; if (Math.abs(w - Math.floor(w) - 0.5) < 0.03 || Math.abs(u - Math.floor(u) - 0.5) < 0.03) return null; return s; };

  // ---------------------------------------------------------------- 固有値（2×2）
  const tr2 = A => A[0][0] + A[1][1];
  const det2 = A => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  // 特性方程式を解の公式で（複素数 [実, 虚] の組）
  function roots2(A) {
    const tr = tr2(A), det = det2(A), D = tr * tr - 4 * det;
    if (D >= -1e-12) { const s = Math.sqrt(Math.max(D, 0)); return [[(tr + s) / 2, 0], [(tr - s) / 2, 0]]; }
    return [[tr / 2, Math.sqrt(-D) / 2], [tr / 2, -Math.sqrt(-D) / 2]];
  }
  // λ^2-(tr)λ+det=0 の解の TeX（読みやすい形のときだけ。だめなら null）：「$-1$、$-3$」「$-2$（重解）」「$-1\pm2j$」「$\pm\sqrt{10}$」
  function eigTeX(tr, det) {
    const D = r9(tr * tr - 4 * det);
    if (Math.abs(D) < 1e-9) return `$${nf(tr / 2)}$（重解）`;
    if (D > 0) {
      if (isSq(D)) { const s = Math.sqrt(D), l1 = (tr + s) / 2, l2 = (tr - s) / 2; return `$${nf(l1)}$、$${nf(l2)}$`; }
      if (tr === 0 && isInt(D / 4)) return `$\\pm${sqrtTeX(D / 4)}$`;
      return null;
    }
    const w2 = -D / 4, s = tr / 2;
    let w;
    if (isSq(w2)) w = `${Math.round(Math.sqrt(w2)) === 1 ? '' : Math.round(Math.sqrt(w2))}j`;
    else if (isInt(w2)) w = `${sqrtTeX(w2)}\\,j`;
    else return null;
    return `$${s === 0 ? '' : nf(s)}\\pm${/^j/.test(w) ? ' ' : ''}${w}$`;
  }
  const stableOf = A => roots2(A).every(z => z[0] < -1e-12);
  // 答えの文の数（$…$ ごと。ベクトル・行列はのぞく。± は2つに。「＝」の左はとる。「重解」なら2つに）。複素数 [実, 虚] の配列
  const maths = t => (String(t).match(/\$[^$]*\$/g) || []).map(strip);
  function valsOf(t) {
    const out = [];
    for (let s of maths(t)) {
      if (/pmatrix|^\(.*,.*\)$/.test(s)) continue;
      s = s.replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/\\,/g, ' ');
      if (s.includes('=')) s = s.slice(s.lastIndexOf('=') + 1);
      if (s.includes('\\pm')) { const [L, R] = s.split('\\pm'); const l = L.trim() || '0'; out.push(M.evalC(`(${l})+(${R})`, {}), M.evalC(`(${l})-(${R})`, {})); }
      else out.push(M.evalC(s, {}));
    }
    if (out.length === 1 && /重解/.test(t)) out.push(out[0]);
    return out;
  }
  const cnear = (x, y) => x && y && Math.hypot(x[0] - y[0], x[1] - y[1]) <= 1e-7 * Math.max(1, Math.hypot(...y));
  // 数の組が、順を問わず同じか（重なりもふくめて）
  function sameSet(got, want) {
    if (!got || got.length !== want.length || got.some(g => !g)) return false;
    const used = want.map(() => false);
    return got.every(g => { const k = want.findIndex((w, i) => !used[i] && cnear(g, w)); if (k < 0) return false; used[k] = true; return true; });
  }
  // 「固有値と、落ち着くか」の答えを確かめる（固有値は解の公式で、ことばは実部の符号で）
  function eigStableCheck(p, A) {
    const v = valsOf(p.a.replace(/、?(落ち着く|落ち着かない).*$/, ''));
    if (!sameSet(v, roots2(A))) return `固有値 ${p.a} がちがう`;
    const st = stableOf(A), say = /落ち着かない/.test(p.a) ? false : /落ち着く/.test(p.a) ? true : null;
    return say === st || `落ち着くか（${p.a}）がちがう`;
  }

  // ---------------------------------------------------------------- 行列の数の計算（検算の部品：問題を作った式とは別の道すじ）
  const mmul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
  const madd = (A, B) => A.map((r, i) => r.map((x, j) => x + B[i][j]));
  const mscale = (A, c) => A.map(r => r.map(x => x * c));
  const eye = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  const mulv = (A, v) => A.map(row => row.reduce((s, x, j) => s + x * v[j], 0));
  // e^{At} を数で：2乗をくり返す方法（At を 2^k でわってテイラー展開 20 項、k 回2乗）
  function expmNum(A, t) {
    const n = A.length, nrm = Math.max(...A.map(r => r.reduce((s, x) => s + Math.abs(x), 0))) * Math.abs(t);
    let k = 0; while (nrm / 2 ** k > 0.25) k++;
    const X = mscale(A, t / 2 ** k);
    let S = eye(n), T = eye(n);
    for (let j = 1; j <= 20; j++) { T = mscale(mmul(T, X), 1 / j); S = madd(S, T); }
    for (let j = 0; j < k; j++) S = mmul(S, S);
    return S;
  }
  // 答えの行列（$t$ の式でもよい）を、t の値ごとに数の行列（実部）で
  function matOfAns(a, vars) { const m = M.readMat(a, vars); return m ? m.map(r => r.map(c => (Math.abs(c[1]) < 1e-9 ? c[0] : NaN))) : null; }
  // 答えの文の中の行列（pmatrix）を全部（$A=…$、$B=…$ の2つなど）。数の2重の配列
  const matsOfAns = (a, vars) => maths(a).filter(s => /pmatrix/.test(s)).map(s => matOfAns(`$${s}$`, vars));
  const matNear = (X, Y, tol) => !!X && !!Y && X.length === Y.length && X.every((r, i) => r.length === Y[i].length && r.every((x, j) => near(x, Y[i][j], tol || 1e-7)));
  // e^{At} の答えを、数の e^{At} と t=0・0.37・1.13 でくらべる
  function expmCheck(p, A, col) {
    for (const t of [0, 0.37, 1.13]) { const g = matOfAns(p.a, { t }), E = expmNum(A, t); if (!matNear(g, col != null ? E.map(r => [r[col]]) : E, 1e-7)) return `t=${t} で $e^{At}$ とちがう（${JSON.stringify(g)}）`; }
    return true;
  }
  // 答えの式（$t$ の式。「＝」の右）を値で
  const exprAt = (a, t) => { const s = maths(a); if (s.length !== 1) return null; let e = s[0]; if (e.includes('=')) e = e.slice(e.lastIndexOf('=') + 1); return M.evalMath(e, { t }); };
  // 答えのベクトル（$(…,\ …)$。成分は $t$ の式でもよい）を値で
  function vecAt(a, vars) {
    const s = maths(a).find(x => /^\(.*,.*\)$/.test(x.replace(/^.*?=/, '').trim())); if (!s) return null;
    const b = s.replace(/^[^(]*=/, '').trim().slice(1, -1);
    let depth = 0, cur = '', parts = [];
    for (const ch of b) { if (ch === '{' || ch === '(') depth++; if (ch === '}' || ch === ')') depth--; if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += ch; }
    parts.push(cur);
    return parts.map(x => M.evalMath(x.replace(/\\ /g, '').trim(), vars || {}));
  }
  // ルンゲ・クッタ法で $\dot{\vec x}=A\vec x+Bu$（u は一定）をたどる
  function rk4(A, B, u, x0, T) {
    const f = x => mulv(A, x).map((v, i) => v + (B ? B[i] * u : 0));
    const n = Math.max(200, Math.ceil(T * 400)), h = T / n;
    let x = x0.slice();
    for (let k = 0; k < n; k++) {
      const k1 = f(x), k2 = f(x.map((v, i) => v + h / 2 * k1[i])), k3 = f(x.map((v, i) => v + h / 2 * k2[i])), k4 = f(x.map((v, i) => v + h * k3[i]));
      x = x.map((v, i) => v + h / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    }
    return x;
  }

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  // 文の中の行列（pmatrix）。数の2重の配列（文字や複素数があれば null）
  const matsIn = q => (String(q).match(/\\begin\{pmatrix\}[\s\S]*?\\end\{pmatrix\}/g) || []).map(t => { const m = M.readMat(t); return m && m.every(r => r.every(c => c && Math.abs(c[1]) < 1e-12)) ? m.map(r => r.map(c => c[0])) : null; }).filter(Boolean);
  const is22 = A => !!A && A.length === 2 && A.every(r => r.length === 2);
  const firstA = q => matsIn(q).find(is22) || null;
  const D2 = A => tr2(A) ** 2 - 4 * det2(A);
  const isDiag = A => is22(A) && A[0][1] === 0 && A[1][0] === 0;
  const tail = q => { const s = String(q); const k = s.lastIndexOf('$'); return k >= 0 ? s.slice(k + 1) : s; };

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
  // 左ページの例（楽な形）の答え。ステップ1〜3の答えに出さない（行列は exLike で、問題の数の側でよける）
  const EXANS = {
    '9-79': ['-1\\pm\\sqrt{7}\\,j、落ち着く', '1、-3、落ち着かない'],
    '9-80': ['k_1=34、k_2=10'],
    '9-81': ['0<\\Delta t<0.4', '\\mu=0.5、落ち着く'],
    '9-82': ['G(s)=\\frac{1}{s^2+5s+6}', 'G(s)=\\frac{s}{s^2+5s+6}'],
    '9-88': ['x(t)=1-\\frac{3}{2}e^{-t}+\\frac{1}{2}e^{-3t}'],
    '9-89': ['36', '7.2', '0.62', '0.13'],
    '9-90': ['i(t)=2e^{-t/0.6}', '2、0.6'],
    '9-98': ['-1、可制御', '0、可制御でない'],
    '9-99': ['1', 'e^{-3t}'],
  };
  function add(def) {
    const exs = new Set((EXANS[def.id] || []).map(exNorm));
    for (const k of ['s1', 's2', 's3', 'trap']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => {
        const p = f(r); if (!p) return p;
        if (k !== 'trap' && (exs.has(exNorm(p.a)) || (p.exKeys || []).some(x => exs.has(exNorm(x))))) return null;
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
      if (id === self || d.part !== 6 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 状態方程式の部品（9-76〜9-78）
  // a x'' + b x' + c x の左辺の TeX（変数 v）
  const ode2 = (a, b, c, v) => sum([cf(a, `\\ddot ${v}`), cf(b, `\\dot ${v}`), cf(c, v)]);
  // 「$A=…$、$B=…$」の答え
  const ansAB = (A, B) => `$A=${pm(A)}$、$B=${cv(B)}$`;
  // A・B の答えを、もとの式（f(x) が [x の変わる速さの組]）に数を入れて確かめる
  function abCheck(p, f) {
    const ms = matsOfAns(p.a); if (ms.length !== 2 || !is22(ms[0]) || ms[1].length !== 2 || ms[1][0].length !== 1) return `答え ${p.a} が $A$ と $B$ の形でない`;
    const [A, B] = ms;
    for (const [x1, x2, u] of [[0.37, -1.21, 0.83], [-2.3, 0.71, -1.7], [1.13, 2.9, 0.41]]) {
      const got = mulv(A, [x1, x2]).map((v, i) => v + B[i][0] * u), want = f(x1, x2, u);
      if (!got.every((v, i) => near(v, want[i], 1e-9))) return `$A\\vec x+Bu$ がもとの式と合わない（${JSON.stringify(got)} と ${JSON.stringify(want)}）`;
    }
    return true;
  }
  // 「固有値と、落ち着くか」の文（eigTeX が読めないときは null）
  const eigAns = A => { const e = eigTeX(tr2(A), det2(A)); return e && `${e}、${stableOf(A) ? '落ち着く' : '落ち着かない'}`; };
  // 2次式 λ^2+bλ+c の解がきれいになる (b, c)：kind 0 ちがう負の整数、1 複素数（実部が負）、2 正の解をふくむ、3 純虚数、4 複素数（実部が正）、5 重解（負）
  function pickBC(r, kind) {
    for (let k = 0; k < 200; k++) {
      let b, c;
      if (kind === 0) { const p = r.int(1, 6), q = r.int(1, 7); if (p === q) continue; b = p + q; c = p * q; }
      else if (kind === 1) { const s = r.int(1, 3), w2 = r.pick([1, 2, 3, 4, 5, 6, 7, 9, 16]); b = 2 * s; c = s * s + w2; }
      else if (kind === 2) { const p = r.int(1, 5), q = r.int(1, 6); if (p === q) continue; b = q - p; c = -p * q; if (b === 0) continue; }
      else if (kind === 3) { b = 0; c = r.pick([1, 2, 4, 5, 9, 10, 16, 25]); }
      else if (kind === 4) { const s = r.int(1, 2), w = r.int(1, 3); b = -2 * s; c = s * s + w * w; }
      else { const p = r.int(1, 5); b = 2 * p; c = p * p; }
      return [b, c];
    }
    return null;
  }

  // ================================================================ 9-76
  const EX76 = [[0, 1], [-5, -3]];
  add({
    id: '9-76', part: 6, chap: '9-10③ 例題1', stars: 1,
    title: '2階の式は $x_1=x$、$x_2=\\dot x$：$\\ddot x$ について解いた式が $A$ の2行め、$u$ の係数が $B$',
    mark: '2階の微分方程式と入れる力 $F$。「状態方程式の $A$ と $B$」（場合 A）。',
    futsu: ['$x_1=x$、$x_2=\\dot x$ の2つの1階の式を', '書き、それぞれの右辺を $x_1$・$x_2$・$u$ で', '書き直してから、行列のかけ算の形に', '1つずつ合わせていく'],
    raku: ['$2\\ddot x+6\\dot x+10x=F$ を $\\ddot x$ について解く', '→ $\\ddot x=-5x-3\\dot x+0.5F$', '→ $A=\\begin{pmatrix}0&1\\\\-5&-3\\end{pmatrix}$、$B=\\begin{pmatrix}0\\\\0.5\\end{pmatrix}$'],
    why: '状態は位置と速度の2つ（9-10①）。1行めは「位置の変わる速さは速度」$\\dot x_1=x_2$ なので、いつも $(0,\\ 1)$。2行めは $\\dot x_2=\\ddot x$ なので、もとの式を $\\ddot x$ について解いた右辺の $x$・$\\dot x$ の係数がそのまま並ぶ。$u$ が入るのは2行めだけで、$B$ は「$u$ がどの式に何倍で入るか」を表す1列（9-10③）。',
    caution: '$\\ddot x$ の係数（質量）でわるのを忘れない（$B$ の0.5は、2でわったから）。移すと符号が変わる：$2\\ddot x+6\\dot x+10x=F$ の $+10x$ は、$A$ では $-5$。$B$ は数ではなく1列の行列で、1行めは0（まちがえやすいところ②）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '46mm', s2: '46mm', s3: '46mm', trap: '40mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm' },
    fits(q) { return (/\\ddot/.test(q) || /ダンパー/.test(q)) && /\$A\$ と \$B\$/.test(q) && !/\\theta|\\sin|回路|水そう/.test(q); },
    steps: {
      // x'' の係数が1、入れるものは u
      s1(r) {
        const b = r.int(0, 8), c = r.int(1, 20);
        const A = [[0, 1], [-c, -b]], B = [0, 1];
        if (exLike(A, EX76)) return null;
        return { q: `$${ode2(1, b, c, 'x')}=u$（状態 $(x,\\ \\dot x)$）の $A$ と $B$`, a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
          easy: `$\\ddot x=${sum([cf(-c, 'x'), cf(-b, '\\dot x'), 'u'])}$`,
          verify: p => abCheck(p, (x, v, u) => [v, u - b * v - c * x]) };
      },
      // x'' に係数（質量）。移項した形もまぜる
      s2(r) {
        const m = r.pick([2, 4, 5, 10, 0.5]), bp = r.pick([0, 0.4, 0.5, 0.8, 1, 2, 3, 4, 6]), cp = r.pick([1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 0.5, 2.5]);
        const b = r9(bp * m), c = r9(cp * m);
        if (decs(b) > 1 || decs(c) > 1) return null;
        const A = [[0, 1], [-cp, -bp]], B = [0, r9(1 / m)];
        if (exLike(A, EX76) || (bp === 3 && cp === 5)) return null;
        const form = turn(r, '76s2', 3);
        const q0 = form === 0 ? `$${ode2(m, b, c, 'x')}=F$` : form === 1 ? `$${nf(m)}\\ddot x=${sum(['F', cf(-c, 'x'), cf(-b, '\\dot x')])}$` : `$${sum([cf(m, '\\ddot x'), cf(c, 'x')])}=${sum(['F', cf(-b, '\\dot x')])}$`;
        return { q: `${q0}（状態 $(x,\\ \\dot x)$、$u=F$）の $A$ と $B$`, a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
          easy: `$\\ddot x=${sum([cf(-cp, 'x'), cf(-bp, '\\dot x'), cf(r9(1 / m), 'F')])}$（${nf(m)} でわる）`,
          verify: p => abCheck(p, (x, v, u) => [v, (u - b * v - c * x) / m]) };
      },
      // 見かけがちがう：ばね・おもり・ダンパーのことば、ちがう文字と右辺の係数
      s3(r) {
        if (turn(r, '76s3', 2) === 0) {
          const m = r.pick([0.5, 2, 4, 5, 10]), kp = r.pick([2, 4, 5, 8, 10, 16, 20, 25]), cp = r.pick([0.2, 0.4, 0.5, 0.8, 1, 2, 4]);
          const k = r9(kp * m), c = r9(cp * m);
          if (decs(k) > 1 || decs(c) > 1) return null;
          const A = [[0, 1], [-kp, -cp]], B = [0, r9(1 / m)];
          if (exLike(A, EX76)) return null;
          return { q: `質量 $${U(nf(m), 'kg')}$ のおもりに、ばね定数 $${U(nf(k), 'N/m')}$ のばねと $${U(nf(c), 'N\\cdot s/m')}$ のダンパーがついている。外から力 $F$〔N〕を加える（状態 $(x,\\ \\dot x)$、$u=F$）。$A$ と $B$`,
            a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
            easy: `$${ode2(m, c, k, 'x')}=F$ を $\\ddot x$ について解く`,
            verify: p => abCheck(p, (x, v, u) => [v, (u - c * v - k * x) / m]) };
        }
        const b = r.int(1, 8), c = r.int(2, 20), beta = r.pick([2, 3, 4, 5, 0.5]);
        const A = [[0, 1], [-c, -b]], B = [0, beta];
        if (exLike(A, EX76)) return null;
        return { q: `$\\ddot y=${sum([cf(beta, 'u'), cf(-b, '\\dot y'), cf(-c, 'y')])}$（状態 $(y,\\ \\dot y)$）の $A$ と $B$`, a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
          easy: '$y_1=y$、$y_2=\\dot y$。右辺の $y$・$\\dot y$・$u$ の係数を並べる',
          verify: p => abCheck(p, (x, v, u) => [v, beta * u - b * v - c * x]) };
      },
      // わな：A の固有値と落ち着くか（9-79）
      trap(r) {
        const bc = pickBC(r, r.pick([0, 0, 1, 2])); if (!bc) return null;
        const [b, c] = bc, A = [[0, 1], [-c, -b]], a = eigAns(A); if (!a || exLike(A, EX76)) return null;
        return dest({ q: `$${ode2(1, b, c, 'x')}=u$ の状態方程式の $A$ の固有値と、$u=0$ で落ち着くか`, a, key: kA(A) + '|eig', verify: p => eigStableCheck(p, A) }, '9-76',
          `$A$ を立てるだけでなく、固有値を聞いている。$${sum(['\\lambda^2', cf(b, '\\lambda'), nf(c)])}=0$ を解き、実部の符号を見る`, ['9-79']);
      },
    },
  });

  // ================================================================ 9-77
  const EX77 = [[0, 1e4], [-2, -20]];
  // 「-0.1(h_1-h_2)+0.01q」の形
  const flowTeX = (k, a, b) => `${k === 1 ? '' : k === -1 ? '-' : nf(k)}(${a}-${b})`;
  // L（H）の文：0.1 より小さいときは mH で
  const LTeX = L => (L < 0.1 ? U(nf(L * 1000), 'mH') : U(nf(L), 'H'));
  const RLC77 = { L: [0.1, 0.2, 0.5, 1, 2, 0.05, 0.01, 0.02], C: [1, 10, 20, 50, 100, 200, 500, 1000], R: [5, 10, 20, 40, 50, 100, 200] };
  function rlc77(r) {
    for (let k = 0; k < 60; k++) {
      const L = r.pick(RLC77.L), Cu = r.pick(RLC77.C), R = r.pick(RLC77.R), iC = r9(1e6 / Cu), iL = r9(1 / L), RL = r9(R / L);
      if (decs(iL) > 1 || decs(RL) > 1 || RL > 20000 || iC < 1000) continue;
      if (L === 0.5 && Cu === 100 && R === 10) continue;   // 左ページの例
      return { L, Cu, R, iC, iL, RL };
    }
    return null;
  }
  const rlcText = g => `$L=${LTeX(g.L)}$、$C=${U(g.Cu, '\\mu F')}$、$R=${U(g.R, '\\Omega')}$ を直列にして電圧 $v$ を加える回路`;
  add({
    id: '9-77', part: 6, chap: '9-10④ 例題2・3', stars: 1,
    title: '1階の式・電気回路は、量（水位、$v_C$ と $i$）をそのまま状態にして並べる',
    mark: '水そう・部屋の温度の1階の式が2つ、コイルとコンデンサーの回路の「$A$ と $B$」（場合 B・C）。',
    futsu: ['回路の微分方程式を1つの2階の式', '（$LC\\ddot v_C+RC\\dot v_C+v_C=v$）にまとめてから、', '位置と速度のように', '$x_1=v_C$、$x_2=\\dot v_C$ と置き直す'],
    raku: ['$L=0.5\\,\\mathrm{H}$、$C=100\\,\\mathrm{\\mu F}$、$R=10\\,\\mathrm{\\Omega}$', '$\\dot v_C=10^4i$、$\\dot i=2(v-10i-v_C)$', '→ $A=\\begin{pmatrix}0&10^4\\\\-2&-20\\end{pmatrix}$、$B=\\begin{pmatrix}0\\\\2\\end{pmatrix}$'],
    why: '1階の式がいくつかあるときは、もう「量の変わる速さ＝量の式」の形なので、かっこをはずして係数を並べるだけ（9-10④）。回路では、急に変われないコンデンサーの電圧 $v_C$ とコイルの電流 $i$ が状態。$C\\dot v_C=i$、$L\\dot i=v-Ri-v_C$ を $C$・$L$ でわれば、そのまま2行になる（場合 C）。',
    caution: '$-0.1(h_1-h_2)$ は $-0.1h_1+0.1h_2$（$h_2$ の係数は正）。$\\mathrm{\\mu F}$ は $10^{-6}\\,\\mathrm F$、$\\mathrm{mH}$ は $10^{-3}\\,\\mathrm H$ に直してからわる。状態の並べ方（$(v_C,\\ i)$ か $(i,\\ v_C)$ か）で $A$ の形が変わるので、文の順に並べる（固有値は同じ）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '48mm', s2: '48mm', s3: '48mm', trap: '30mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '11mm', trap: '11mm' },
    fits(q) { return /\$A\$ と \$B\$/.test(q) && !/\\ddot/.test(q) && /回路|水そう|\\dot h_1|\\dot T_1/.test(q); },
    steps: {
      // 1階の式が2つ（水そう・部屋の温度）
      s1(r) {
        const room = turn(r, '77s1', 2) === 1, v = room ? 'T' : 'h', uu = room ? 'u' : 'q';
        const p = r.pick([0.1, 0.2, 0.3, 0.05, 0.4]), q2 = r.pick([0.1, 0.2, 0.05, 0.3]), e = r.pick([0, 0, 0.1, 0.05]), j = r.int(0, 1);
        const beta = room ? r.pick([0.5, 0.2, 0.1, 2]) : r.pick([0.01, 0.02, 0.005, 0.05]);
        const A = [[-p, p], [q2, r9(-q2 - e)]], B = j === 0 ? [beta, 0] : [0, beta];
        const e1 = sum([`-${flowTeX(p, `${v}_1`, `${v}_2`)}`, j === 0 ? cf(beta, uu) : '']);
        const e2 = sum([flowTeX(q2, `${v}_1`, `${v}_2`), cf(-e, `${v}_2`), j === 1 ? cf(beta, uu) : '']);
        return { q: `$\\dot ${v}_1=${e1}$、$\\dot ${v}_2=${e2}$（状態 $(${v}_1,\\ ${v}_2)$、${room ? '入れるもの $u$' : '$u=q$'}）の $A$ と $B$`, a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
          easy: 'かっこをはずして、$' + v + '_1$・$' + v + '_2$・$' + uu + '$ の係数を並べる',
          verify: pp => abCheck(pp, (x1, x2, u) => [-p * (x1 - x2) + (j === 0 ? beta * u : 0), q2 * (x1 - x2) - e * x2 + (j === 1 ? beta * u : 0)]) };
      },
      // RLC の回路（状態 (v_C, i)）
      s2(r) {
        const g = rlc77(r); if (!g) return null;
        const A = [[0, g.iC], [-g.iL, -g.RL]], B = [0, g.iL];
        if (exLike(A, EX77)) return null;
        return { q: `${rlcText(g)}（状態 $(v_C,\\ i)$、$u=v$）の $A$ と $B$`, a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
          easy: `$\\dot v_C=${big(g.iC)}i$、$\\dot i=${flowTeX(g.iL, 'v-' + g.R + 'i', 'v_C')}$`,
          verify: p => abCheck(p, (vc, i, u) => [i / (g.Cu * 1e-6), (u - g.R * i - vc) / g.L]) };
      },
      // 見かけがちがう：底面積のちがう水そうをことばで、状態の順が (i, v_C) の回路
      s3(r) {
        if (turn(r, '77s3', 2) === 0) {
          const S1 = r.pick([50, 100, 200, 250, 500]), S2 = r.pick([50, 100, 200, 250, 500]), k = r.pick([5, 10, 20, 25, 50]), j = r.int(0, 1);
          const a1 = r9(k / S1), a2 = r9(k / S2);
          if (decs(a1) > 3 || decs(a2) > 3 || S1 === S2 || a1 >= 1 || a2 >= 1) return null;
          const A = [[-a1, a1], [a2, -a2]], B = j === 0 ? [r9(1 / S1), 0] : [0, r9(1 / S2)];
          return { q: `底面積 $${U(S1, 'cm^2')}$ の水そう1と $${U(S2, 'cm^2')}$ の水そう2を、1分に $${k}(h_1-h_2)\\,\\mathrm{cm^3}$ の水が流れる管でつなぎ、水そう${j + 1}に1分に $q\\,\\mathrm{cm^3}$ の水を入れる（状態 $(h_1,\\ h_2)$、$u=q$、分と cm）。$A$ と $B$`,
            a: ansAB(A, B), key: kA(A) + '|' + B, easyCheck: false,
            easy: `$\\dot h_1=${sum([`-${flowTeX(a1, 'h_1', 'h_2')}`, j === 0 ? cf(r9(1 / S1), 'q') : ''])}$、$\\dot h_2=${sum([flowTeX(a2, 'h_1', 'h_2'), j === 1 ? cf(r9(1 / S2), 'q') : ''])}$（流れる水を底面積でわる）`,
            verify: p => abCheck(p, (h1, h2, u) => [(-k * (h1 - h2) + (j === 0 ? u : 0)) / S1, (k * (h1 - h2) + (j === 1 ? u : 0)) / S2]) };
        }
        const g = rlc77(r); if (!g) return null;
        const A = [[-g.RL, -g.iL], [g.iC, 0]], B = [g.iL, 0];
        if (exLike(A, EX77)) return null;
        return { q: `${rlcText(g)}で、状態を $(i,\\ v_C)$ の順にとる（$u=v$）。$A$ と $B$`, a: ansAB(A, B), key: kA([[0, g.iC], [-g.iL, -g.RL]]) + '|' + [0, g.iL], easyCheck: false,
          easy: `1行めが $\\dot i=${flowTeX(g.iL, 'v-' + g.R + 'i', 'v_C')}$、2行めが $\\dot v_C=${big(g.iC)}i$`,
          verify: p => abCheck(p, (i, vc, u) => [(u - g.R * i - vc) / g.L, i / (g.Cu * 1e-6)]) };
      },
      // わな：sin が入る振り子（9-78。先に線形化）
      trap(r) {
        const [ell, k] = r.pick([[0.98, 10], [1.96, 5], [2.45, 4], [4.9, 2], [0.245, 40], [0.392, 25]]), hang = r.chance(0.5);
        const A = [[0, 1], [hang ? -k : k, 0]];
        return dest({ q: `長さ $\\ell=${U(nf(ell), 'm')}$ の${hang ? 'ぶら下がった振り子' : '手のひらに立てた棒'} $\\ddot\\theta=${hang ? '-' : ''}\\dfrac{g}{\\ell}\\sin\\theta$（$g=${U(9.8, 'm/s^2')}$）を、状態 $(\\theta,\\ \\dot\\theta)$ の $\\dot{\\vec x}=A\\vec x$ に。$A$`,
          a: `$${pm(A)}$`, key: `pend|${ell}|${hang}`, calc: { kind: 'mat', want: A } }, '9-77',
          `$\\sin\\theta$ があるので、係数を並べられない。先に $\\sin\\theta\\approx\\theta$ と線形化し、$\\dfrac{g}{\\ell}=${k}$`, ['9-78']);
      },
    },
  });

  // ================================================================ 9-78
  // 長さ ℓ（m）と g/ℓ（g=9.8）。g/ℓ=20（左ページの例 ℓ=0.49）はよける
  const L78 = [[0.98, 10], [1.96, 5], [2.45, 4], [4.9, 2], [9.8, 1], [0.196, 50], [0.245, 40], [0.392, 25], [0.28, 35], [0.35, 28], [0.7, 14], [1.4, 7], [1.225, 8], [0.6125, 16], [0.2, 49], [0.56, 17.5]];
  // 一様な棒：3g/(2ℓ)
  const L78u = [[0.98, 15], [1.47, 10], [2.94, 5], [0.49, 30], [0.294, 50], [0.588, 25], [3.675, 4], [1.96, 7.5], [4.9, 3], [0.245, 60]];
  // 台車の上に立てた棒の図（K-2：問題の数どおり。答えの g/ℓ は書かない）
  function fig78(ell, uniform) {
    const th = 16 * Math.PI / 180, Lf = 3.4, P = [0, 1.25], T = [P[0] + Lf * Math.sin(th), P[1] + Lf * Math.cos(th)];
    const its = [
      ['seg', [-2.4, -0.35], [2.6, -0.35]],
      ['poly', [[-1.5, 0.35], [1.5, 0.35], [1.5, 1.25], [-1.5, 1.25]], { fill: true }],
      ['circle', [-0.9, 0], 0.35], ['circle', [0.9, 0], 0.35],
      ['seg', [0, 1.25], [0, Lf + 1.7], { dash: true }],
      ['seg', P, T, { thick: true }],
      ['angle', [0, 4], P, T, '$\\theta$', 1.1],
      ['label', [P[0] + 0.55 * Lf * Math.sin(th) + 0.25, P[1] + 0.55 * Lf * Math.cos(th) - 0.1], `$${U(nf(ell), 'm')}$`, 'e'],
      ['seg', [1.8, 0.8], [2.9, 0.8], { arrow: true }], ['label', [2.9, 0.8], '$a$', 'e'],
      ['label', [0, 0.8], '台車', 'c'],
    ];
    if (!uniform) its.push(['circle', T, 0.3, { fill: true }]);
    return { s: 5, items: its };
  }
  add({
    id: '9-78', part: 6, chap: '9-10④ 例題4', stars: 1,
    title: '$\\sin\\theta\\approx\\theta$、$\\cos\\theta\\approx1$ で線形化し、$\\dfrac{g}{\\ell}$ を出す',
    mark: '倒立振子・振り子の式に $\\sin\\theta$・$\\cos\\theta$。「線形化した $A$」「固有値」（場合 D）。',
    futsu: ['$\\sin\\theta$ のまま $A$ に並べようとして', '行きづまるので、$\\theta$ の値ごとに', '$\\sin\\theta$ の表を見て、', '近い直線を作る'],
    raku: ['$\\ell=0.49\\,\\mathrm m$ → $\\dfrac{9.8}{0.49}=20$', '→ $\\ddot\\theta=20\\theta+u$', '→ $A=\\begin{pmatrix}0&1\\\\20&0\\end{pmatrix}$、固有値 $\\pm2\\sqrt5$'],
    why: '行列で書けるのは $\\theta$・$\\dot\\theta$ の1次の式だけ。棒がほとんど立っている（$\\theta$ が小さい）ときは $\\sin\\theta\\approx\\theta$、$\\cos\\theta\\approx1$ なので、$\\ddot\\theta=\\dfrac{g}{\\ell}\\theta-\\dfrac{a}{\\ell}=\\dfrac{g}{\\ell}\\theta+u$（9-10④）。あとは2階の式として $A$ の2行めに $\\dfrac{g}{\\ell}$ を置く（場合 A）。固有値は $\\lambda^2=\\dfrac{g}{\\ell}$ から $\\pm\\sqrt{g/\\ell}$。',
    caution: '線形化した式は $\\theta$ が小さいとき（0.1 rad ほどまで）だけ使う（まちがえやすいところ⑤）。ぶら下がった振り子は $-\\dfrac{g}{\\ell}\\sin\\theta$ なので、$A$ の左下は負で、固有値は $\\pm\\sqrt{g/\\ell}\\,j$（ゆれ続ける）。一様な棒なら $\\dfrac{g}{\\ell}$ が $\\dfrac{3g}{2\\ell}$ に変わる。',
    counts: { s1: 3, s2: 3, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' }, boxh: { s1: '11mm', s3: '11mm' },
    fits(q) { return (/\\ell=|振り子|台車/.test(q)) && /線形化|\\sin\\theta/.test(q) && /\$A\$|固有値/.test(q) && !/k_1|\\Delta t|角加速度|\$B\$/.test(q); },
    steps: {
      // 立てた棒の A
      s1(r) {
        const [ell, k] = r.pick(L78), A = [[0, 1], [k, 0]];
        return { q: `長さ $\\ell=${U(nf(ell), 'm')}$ の軽い棒の先におもりをつけ、手のひらに立てる。線形化した状態方程式の $A$（$g=${U(9.8, 'm/s^2')}$）`,
          a: `$${pm(A)}$`, key: `L|${ell}`, easyCheck: false, easy: `$\\dfrac{g}{\\ell}=\\dfrac{9.8}{${nf(ell)}}=${nf(k)}$`, calc: { kind: 'mat', want: A },
          verify: p => matNear(matOfAns(p.a), [[0, 1], [9.8 / ell, 0]], 1e-9) || 'A がちがう' };
      },
      // 固有値（立てた棒と、ぶら下がった振り子をかわるがわる）
      s2(r) {
        const hang = peek(r, '78s2', 2) === 1;
        const [ell, k] = r.pick(L78.filter(x => isInt(x[1]) || isSq(x[1] * 4)));
        const kk = isInt(k) ? sqrtTeX(k) : nf(Math.sqrt(k));
        const A = [[0, 1], [hang ? -k : k, 0]];
        adv(r, '78s2', 2);
        const q = hang ? `長さ $\\ell=${U(nf(ell), 'm')}$ のぶら下がった振り子 $\\ddot\\theta=-\\dfrac{g}{\\ell}\\sin\\theta$ を線形化した $A$ の固有値（$g=${U(9.8, 'm/s^2')}$）`
          : `長さ $\\ell=${U(nf(ell), 'm')}$ の棒を手のひらに立てる。線形化した $A$ の、何も入れないときの固有値（$g=${U(9.8, 'm/s^2')}$）`;
        return { q, a: `$\\pm${kk === '1' && hang ? ' ' : kk}${hang ? (kk.includes('sqrt') ? '\\,j' : 'j') : ''}$`, key: `L|${ell}`, easyCheck: false,
          easy: `$\\lambda^2=${hang ? '-' : ''}${nf(k)}$`, verify: p => sameSet(valsOf(p.a), roots2(A)) || '固有値がちがう' };
      },
      // 見かけがちがう：台車の上の棒の図。一様な棒（3g/2ℓ）もまぜる
      s3(r) {
        const uni = turn(r, '78s3', 2) === 1, [ell, k] = r.pick(uni ? L78u : L78), A = [[0, 1], [k, 0]];
        const q = uni ? `図の台車の上に立てた一様な棒（$\\ddot\\theta=\\dfrac{3g}{2\\ell}\\sin\\theta-\\dfrac{3a}{2\\ell}\\cos\\theta$、$g=${U(9.8, 'm/s^2')}$）を線形化した状態方程式の $A$`
          : `図の台車の上に立てた軽い棒（先におもり、$g=${U(9.8, 'm/s^2')}$）を、$u=-\\dfrac{a}{\\ell}$ として線形化した状態方程式の $A$`;
        return { q, a: `$${pm(A)}$`, key: `${uni ? 'U' : 'L'}|${ell}`, easyCheck: false, fig: fig78(ell, uni),
          easy: uni ? `$\\dfrac{3g}{2\\ell}=\\dfrac{3\\times9.8}{2\\times${nf(ell)}}=${nf(k)}$` : `$\\dfrac{g}{\\ell}=\\dfrac{9.8}{${nf(ell)}}=${nf(k)}$`, calc: { kind: 'mat', want: A },
          verify: p => matNear(matOfAns(p.a), [[0, 1], [(uni ? 1.5 : 1) * 9.8 / ell, 0]], 1e-9) || 'A がちがう' };
      },
      // わな：大きくかたむいたとき（線形化は使えない。わざなし）
      trap(r) {
        const [th, sv] = r.pick([[1, 0.8415], [0.8, 0.7174], [1.2, 0.9320], [0.6, 0.5646]].map(([a, b]) => [a, b.toFixed(4)])), [ell, k] = r.pick([[0.98, 10], [1.96, 5], [2.45, 4], [4.9, 2], [0.392, 25]]);
        const s = agree(k * sv, k * Math.sin(th), 1); if (s == null) return null;
        return dest({ q: `長さ $\\ell=${U(nf(ell), 'm')}$ の棒が $${U(nf(th), 'rad')}$ かたむいて止まった瞬間の角加速度 $\\ddot\\theta=\\dfrac{g}{\\ell}\\sin\\theta$（rad/s²。$u=0$、$g=${U(9.8, 'm/s^2')}$、$\\sin${nf(th)}=${sv}$、小数第1位まで）`,
          a: `約 $${s}$`, key: `big|${th}|${ell}`, verify: p => near(valsOf(p.a)[0][0], +s, 1e-9) || '値がちがう' }, '9-78',
          `$${nf(th)}\\,\\mathrm{rad}$ は大きく、$\\sin\\theta\\approx\\theta$ は使えない。$${nf(k)}\\times${sv}\\approx${s}$（線形化すると $${nf(k * th)}$ で、まちがい）`);
      },
    },
  });

  // ================================================================ 9-79
  const EX79 = [[[0, 1], [-8, -2]], [[0, 1], [3, -2]]];
  const bad79 = A => EX79.some(B => exLike(A, B));
  // 固有値の型から (tr, det)：0 ちがう負の整数、1 複素数（実部負）、2 正をふくむ実数、3 純虚数、4 複素数（実部正）、5 重解（負）
  function trDet(r, kind) {
    const bc = pickBC(r, kind); if (!bc) return null;
    return [-bc[0], bc[1]];
  }
  // (tr, det) をもつ、整数の一般の 2×2（2階の式から作った形でない。右上・左下とも0でない）
  function genTD(r, tr, det) {
    for (let k = 0; k < 80; k++) {
      const a = r.int(-6, 4), d = tr - a, bc = a * d - det;
      if (bc === 0) continue;
      const divs = []; for (let b = -6; b <= 6; b++) if (b && bc % b === 0 && Math.abs(bc / b) <= 9) divs.push(b);
      if (!divs.length) continue;
      const b = r.pick(divs), c = bc / b, A = [[a, b], [c, d]];
      if ((a === 0 && b === 1) || bad79(A)) continue;
      return A;
    }
    return null;
  }
  const stKinds = [0, 1, 5], unKinds = [2, 3, 4];
  const chq = td => `$${sum(['\\lambda^2', cf(-td[0], '\\lambda'), nf(td[1])])}=0$`;
  add({
    id: '9-79', part: 6, chap: '9-10⑤ 例題5・9-11⑦ 例題10', stars: 1,
    title: '落ち着くかは固有値の実部：2×2 は $\\lambda^2-(a+d)\\lambda+(ad-bc)=0$',
    mark: '$\\dot{\\vec x}=A\\vec x$ は「落ち着くか」。固有値も（場合 E・9-11 の I）。',
    futsu: ['$e^{At}$ を求めて、$t$ を大きくしたとき', '4つの成分がどれも0に近づくかを', '1つずつ調べる'],
    raku: ['$\\begin{pmatrix}0&1\\\\-8&-2\\end{pmatrix}$ → $\\lambda^2+2\\lambda+8=0$', '→ $-1\\pm\\sqrt7\\,j$、実部が負で落ち着く', '$\\begin{pmatrix}0&1\\\\3&-2\\end{pmatrix}$ → $1$・$-3$、落ち着かない'],
    why: '$\\dot{\\vec x}=A\\vec x$ の答えは、固有値 $\\lambda$ ごとの $e^{\\lambda t}$ の和で、$\\lambda=\\sigma+j\\omega$ なら大きさは $e^{\\sigma t}$（9-11⑦）。だから実部がすべて負なら落ち着き、1つでも0以上なら落ち着かない。$e^{At}$ を作らなくても、特性方程式を解くだけでわかる（場合 I）。2×2 の特性方程式は、ななめの和 $a+d$ と行列式 $ad-bc$ で書ける。',
    caution: '$A$ の成分の符号だけでは決まらない（ななめの $-2$ が負でも、固有値1があれば落ち着かない。まちがえやすいところ⑦）。実部が0（$\\pm2j$）はゆれ続けるので、落ち着かない。固有値の順は問わない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '40mm', s2: '40mm', s3: '40mm', trap: '30mm' },
    fits(q) { return /落ち着くか/.test(q) && !/\\Delta t|k_1/.test(q); },
    steps: {
      // 2階の式から作った形の A
      s1(r) {
        const st = peek(r, '79s1', 2) === 0, td = trDet(r, r.pick(st ? stKinds : unKinds)); if (!td) return null;
        const A = [[0, 1], [-td[1], td[0]]], a = eigAns(A);
        if (!a || bad79(A)) return null;
        adv(r, '79s1', 2);
        return { q: `$A=${pm(A)}$ の固有値と、落ち着くか`, a, key: kA(A), easyCheck: false, easy: chq(td), verify: p => eigStableCheck(p, A) };
      },
      // 一般の 2×2
      s2(r) {
        const st = peek(r, '79s2', 2) === 0, td = trDet(r, r.pick(st ? stKinds : unKinds)); if (!td) return null;
        const A = genTD(r, td[0], td[1]); if (!A) return null;
        const a = eigAns(A); if (!a) return null;
        adv(r, '79s2', 2);
        return { q: `$A=${pm(A)}$ の固有値と、落ち着くか`, a, key: kA(A), easyCheck: false,
          easy: `$a+d=${td[0]}$、$ad-bc=${td[1]}$ → ${chq(td)}`, verify: p => eigStableCheck(p, A) };
      },
      // 見かけがちがう：連立の式、2階の式から
      s3(r) {
        const st = peek(r, '79s3', 2) === 0, td = trDet(r, r.pick(st ? stKinds : unKinds)); if (!td) return null;
        if (turn(r, '79s3k', 2) === 0) {
          const A = genTD(r, td[0], td[1]); if (!A) return null;
          const a = eigAns(A); if (!a) return null;
          adv(r, '79s3', 2);
          const eq = (k, n) => `\\dot x_${n}=${sum([cf(A[k][0], 'x_1'), cf(A[k][1], 'x_2')])}`;
          return { q: `$${eq(0, 1)}$、$${eq(1, 2)}$ は落ち着くか（固有値も）`, a, key: kA(A), easyCheck: false,
            easy: `$A=${pm(A)}$。${chq(td)}`, verify: p => eigStableCheck(p, A) };
        }
        const A = [[0, 1], [-td[1], td[0]]], a = eigAns(A); if (!a || bad79(A)) return null;
        adv(r, '79s3', 2);
        return { q: `$${ode2(1, -td[0], td[1], 'x')}=0$ を、状態 $(x,\\ \\dot x)$ の $\\dot{\\vec x}=A\\vec x$ にした。固有値と、落ち着くか`, a, key: kA(A), easyCheck: false,
          easy: `$A=${pm(A)}$。${chq(td)}`, verify: p => eigStableCheck(p, A) };
      },
      // わな：立たせる K を決める（9-80）
      trap(r) {
        const a = r.pick([1, 2, 3, 4, 5, 6, 10, 12]), p = r.pick([1, 2, 3, 4, 6]), A = [[0, 1], [a, 0]], k1 = p * p + a, k2 = 2 * p;
        return dest({ q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ の棒を、$u=-(k_1\\theta+k_2\\dot\\theta)$ で立たせる。$A-BK$ の固有値を2つとも $${-p}$ にする $k_1$・$k_2$`,
          a: `$k_1=${k1}$、$k_2=${k2}$`, key: `K|${a}|${p}`, verify: p2 => kCheck(p2, A, [0, 1], [[-p, 0], [-p, 0]]) }, '9-79',
          `落ち着くかを見るのではなく、固有値を選んで入れ方を決める。$\\lambda^2+k_2\\lambda+(k_1-${a})$ を $(\\lambda+${p})^2$ とくらべる`, ['9-80']);
      },
    },
  });

  // ================================================================ 9-80
  const EX80 = [[0, 1], [9, 0]];
  // 答えの「$k_1=…$、$k_2=…$」を読んで、A−BK の固有値が want になるか確かめる
  function kCheck(p, A, B, want) {
    const m1 = /k_1=([^$]*)\$/.exec(p.a), m2 = /k_2=([^$]*)\$/.exec(p.a);
    if (!m1 || !m2) return `答え ${p.a} に k_1・k_2 がない`;
    const k1 = M.evalMath(m1[1], {}), k2 = M.evalMath(m2[1], {});
    const ABK = A.map((row, i) => [row[0] - B[i] * k1, row[1] - B[i] * k2]);
    return sameSet(roots2(ABK), want) || `$A-BK$ の固有値が ${JSON.stringify(roots2(ABK))}`;
  }
  // 特性方程式 (λ+p)^2・(λ+p)(λ+q)・(λ+σ)^2+ω^2 の [λ の係数 S, 定数 P]、固有値の文、固有値（数）
  function target80(r, kind) {
    if (kind === 0) { const p = r.pick([1, 2, 3, 4, 6, 8, 10]); return { S: 2 * p, P: p * p, txt: `2つとも $${-p}$`, ev: [[-p, 0], [-p, 0]], f: `(\\lambda+${p})^2` }; }
    if (kind === 1) { let p = r.int(1, 6), q = r.int(1, 8); if (p === q) return null; if (p > q) [p, q] = [q, p]; return { S: p + q, P: p * q, txt: `$${-p}$ と $${-q}$`, ev: [[-p, 0], [-q, 0]], f: `(\\lambda+${p})(\\lambda+${q})` }; }
    const s = r.pick([1, 2, 3]), w = r.pick([1, 2, 3, 4]);
    return { S: 2 * s, P: s * s + w * w, txt: `$${-s}\\pm${w === 1 ? ' ' : w}j$`, ev: [[-s, w], [-s, -w]], f: `(\\lambda+${s})^2+${w * w}` };
  }
  add({
    id: '9-80', part: 6, chap: '9-10⑦ 例題6', stars: 1,
    title: '状態フィードバック $u=-K\\vec x$：$A-BK$ の特性方程式を、選んだ固有値の式とくらべる',
    mark: '「$A-BK$ の固有値を□にする $k_1$・$k_2$」（場合 F）。',
    futsu: ['$k_1$・$k_2$ に数を入れては', '$A-BK$ の固有値を解の公式で求め、', '目当ての固有値になるまで', 'ためしていく'],
    raku: ['$A=\\begin{pmatrix}0&1\\\\9&0\\end{pmatrix}$、固有値 $-5$・$-5$', '→ $\\lambda^2+k_2\\lambda+(k_1-9)$ と $(\\lambda+5)^2$', '→ $k_2=10$、$k_1-9=25$ で $k_1=34$'],
    why: '$u=-K\\vec x$ を入れると $\\dot{\\vec x}=(A-BK)\\vec x$（9-10⑦）。$B=\\begin{pmatrix}0\\\\1\\end{pmatrix}$ なら $BK$ は2行めだけ $(k_1,\\ k_2)$ で、$A-BK$ は2行めから $k_1$・$k_2$ をひいた行列。その特性方程式 $\\lambda^2+k_2\\lambda+(k_1-a)$ が、選んだ固有値の式（$-p$ の重解なら $(\\lambda+p)^2$）と同じになるように、係数をくらべる（3-8 の係数比べ）。',
    caution: '$A+BK$ にしない（まちがえやすいところ③）。$A$ の2行め2列めが0でないときは、$\\lambda$ の係数は $k_2-a_{22}$。$B$ の2行めが1でないときは、$BK$ の2行めは $(bk_1,\\ bk_2)$。$k_2=0$（かたむきだけ見る）では落ち着かない（まちがえやすいところ⑥）。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '34mm' },
    fits(q) { return /k_1/.test(q) && /固有値/.test(q) && !/\\Delta t/.test(q); },
    steps: {
      // 立てた棒 A=(0 1; a 0)、重解
      s1(r) {
        const a = r.pick([1, 2, 3, 4, 5, 6, 10, 12, 16, 20, 25]), t = target80(r, 0);
        const A = [[0, 1], [a, 0]], k1 = t.P + a, k2 = t.S;
        if (exLike(A, EX80) || t.S === 10) return null;
        return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、$A-BK$ の固有値を${t.txt} にする $k_1$・$k_2$`, a: `$k_1=${k1}$、$k_2=${k2}$`, key: `${a}|0`, easyCheck: false,
          easy: `$\\lambda^2+k_2\\lambda+(k_1-${a})$ と $${t.f}$ をくらべる`, verify: p => kCheck(p, A, [0, 1], t.ev) };
      },
      // ちがう固有値・A の2行め2列めが0でない
      s2(r) {
        const k = turn(r, '80s2', 2), t = target80(r, k === 0 ? 1 : 0); if (!t) return null;
        const a = r.pick([-6, -4, -2, 1, 2, 3, 4, 5, 6, 8, 10]), b = k === 0 ? 0 : r.pick([-3, -2, -1, 1, 2]);
        const A = [[0, 1], [a, b]], k1 = t.P + a, k2 = t.S + b;
        if (exLike(A, EX80) || k2 === 0 || k1 === 0 || t.S === 10) return null;
        const sg = v => (v > 0 ? `-${v}` : `+${-v}`);
        return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、$A-BK$ の固有値を${t.txt} にする $k_1$・$k_2$`, a: `$k_1=${k1}$、$k_2=${k2}$`, key: `${a}|${b}`, easyCheck: false,
          easy: `$\\lambda^2+${b ? `(k_2${sg(b)})` : 'k_2'}\\lambda+(k_1${sg(a)})$ と $${t.f}$ をくらべる`, verify: p => kCheck(p, A, [0, 1], t.ev) };
      },
      // 見かけがちがう：棒の長さから、B の2行めが1でない、複素数の固有値
      s3(r) {
        const k = turn(r, '80s3', 3);
        if (k === 0) {
          const [ell, a] = r.pick(L78.filter(x => isInt(x[1]) && x[1] !== 9)), t = target80(r, 0), A = [[0, 1], [a, 0]];
          if (t.S === 10) return null;
          return { q: `長さ $\\ell=${U(nf(ell), 'm')}$ の棒（線形化して $\\ddot\\theta=\\dfrac{g}{\\ell}\\theta+u$、$g=${U(9.8, 'm/s^2')}$）を、$u=-(k_1\\theta+k_2\\dot\\theta)$ で立たせる。固有値を${t.txt} にする $k_1$・$k_2$`,
            a: `$k_1=${t.P + a}$、$k_2=${t.S}$`, key: `${a}|0`, easyCheck: false,
            easy: `$\\dfrac{g}{\\ell}=${a}$。$\\lambda^2+k_2\\lambda+(k_1-${a})$ と $${t.f}$`, verify: p => kCheck(p, A, [0, 1], t.ev) };
        }
        if (k === 1) {
          const beta = r.pick([2, 4, 5, 0.5]), a = r.pick([1, 2, 3, 4, 5, 6, 10]), t = target80(r, r.int(0, 1)); if (!t || t.S === 10) return null;
          const k1 = r9((t.P + a) / beta), k2 = r9(t.S / beta), A = [[0, 1], [a, 0]];
          if (decs(k1) > 2 || decs(k2) > 2) return null;
          return { q: `$A=${pm(A)}$、$B=${cv([0, beta])}$ で、$A-BK$ の固有値を${t.txt} にする $k_1$・$k_2$`, a: `$k_1=${nf(k1)}$、$k_2=${nf(k2)}$`, key: `${a}|0`, easyCheck: false,
            easy: `$\\lambda^2+${nf(beta)}k_2\\lambda+(${nf(beta)}k_1-${a})$ と $${t.f}$`, verify: p => kCheck(p, A, [0, beta], t.ev) };
        }
        const a = r.pick([1, 2, 3, 4, 5, 6, 10, 12]), t = target80(r, 2), A = [[0, 1], [a, 0]];
        return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、$A-BK$ の固有値を${t.txt} にする $k_1$・$k_2$`, a: `$k_1=${t.P + a}$、$k_2=${t.S}$`, key: `${a}|0`, easyCheck: false,
          easy: `$${t.f}=${sum(['\\lambda^2', cf(t.S, '\\lambda'), nf(t.P)])}$ とくらべる`, verify: p => kCheck(p, A, [0, 1], t.ev) };
      },
      // わな：Δt ごとのくり返しで落ち着くか（9-81）
      trap(r) {
        const a = r.pick([1, 2, 4, 5, 10]), p = r.pick([1, 2, 3, 4, 6]), dt = r.pick([0.05, 0.1, 0.2, 0.25, 0.5]), mu = r9(1 - p * dt);
        if (Math.abs(Math.abs(mu) - 1) < 1e-9 || decs(mu) > 2) return null;
        const A = [[0, 1], [a, 0]], k1 = p * p + a, k2 = 2 * p, st = Math.abs(mu) < 1;
        return dest({ q: `$A=${pm(A)}$、$B=${cv([0, 1])}$、$u=-(${k1}\\theta+${k2}\\dot\\theta)$ を、$\\Delta t=${U(nf(dt), 's')}$ ごとにくり返す。$\\mu$ と、落ち着くか`,
          a: `$\\mu=${nf(mu)}$、${st ? '落ち着く' : '落ち着かない'}`, key: `dt|${a}|${p}|${dt}`, verify: p2 => muCheck(p2, [[0, 1], [a - k1, -k2]], dt) }, '9-80',
          `$K$ はもう決まっている。$A-BK$ の固有値 $${-p}$（重解）から $\\mu=1+(${-p})\\times${nf(dt)}=${nf(mu)}$`, ['9-81']);
      },
    },
  });

  // ================================================================ 9-81
  // 答えの「$\mu=…$、落ち着く」を、A_d=I+MΔt の固有値（解の公式）で確かめる
  function muCheck(p, Mx, dt) {
    const Ad = madd(eye(2), mscale(Mx, dt)), ev = roots2(Ad), v = valsOf(p.a.replace(/、?(落ち着く|落ち着かない).*$/, ''));
    const want = ev[0][1] === 0 && near(ev[0][0], ev[1][0], 1e-7) ? [ev[0]] : ev;
    if (!sameSet(v, want)) return `μ ${p.a} がちがう（${JSON.stringify(ev)}）`;
    const st = ev.every(z => Math.hypot(...z) < 1 - 1e-12), say = /落ち着かない/.test(p.a) ? false : /落ち着く/.test(p.a) ? true : null;
    return say === st || '落ち着くかがちがう';
  }
  // 「$0<\Delta t<□$」の答えを、□の少し下と上で A_d の固有値の大きさを見て確かめる
  function rangeCheck(p, Mx) {
    const s = maths(p.a).find(x => /\\Delta t/.test(x)); if (!s) return `答え ${p.a} が範囲の形でない`;
    const b = M.evalMath(s.slice(s.lastIndexOf('<') + 1), {});
    const ok = dt => roots2(madd(eye(2), mscale(Mx, dt))).every(z => Math.hypot(...z) < 1 - 1e-12);
    return (ok(b * 0.999) && !ok(b * 1.001) && ok(b * 0.01)) || `範囲のはし ${b} がちがう`;
  }
  const DT81 = [0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1.2];
  add({
    id: '9-81', part: 6, chap: '9-10⑨ 例題7', stars: 1,
    title: 'くり返しは $\\mu=1+\\lambda\\Delta t$ の大きさが1より小さいか（$\\lambda$ は $A-BK$ の固有値）',
    mark: 'コンピュータで $\\Delta t$ ごとにくり返す。「$\\mu$」「$\\Delta t$ が何秒より小さいとき」（場合 G）。',
    futsu: ['$A_{\\mathrm d}=I+(A-BK)\\Delta t$ の成分を', '計算して、$\\det(A_{\\mathrm d}-\\mu I)=0$ を', '展開して解く'],
    raku: ['$A-BK$ の固有値 $-5$（重解）→ $\\mu=1-5\\Delta t$', '$-1<1-5\\Delta t<1$ → $0<\\Delta t<0.4$ 秒', '$\\Delta t=0.1$ なら $\\mu=0.5$'],
    why: '1歩の行列 $I+M\\Delta t$ の固有値は、$M$ の固有値を $\\lambda$ として $1+\\lambda\\Delta t$（7-10。固有ベクトルが同じなので）。くり返し $\\vec x_{k+1}=A_{\\mathrm d}\\vec x_k$ が落ち着くのは、$A_{\\mathrm d}$ の固有値の大きさがすべて1より小さいとき（単位円の中。9-10⑨）。',
    caution: '連続の式は「実部が負」、くり返しは「大きさが1より小さい」で見る（取りちがえない。まちがえやすいところ④）。$\\mu=0.8$ は正でも、大きさが1より小さいので落ち着く。$\\Delta t$ が大きすぎると $\\mu<-1$ になり、符号を変えながら大きくなる。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '34mm', s2: '30mm', s3: '34mm', trap: '34mm' },
    fits(q) { return /\\Delta t/.test(q); },
    steps: {
      // A−BK の固有値（重解）と Δt から μ
      s1(r) {
        const st = peek(r, '81s1', 2) === 0, p = r.pick([1, 2, 3, 4, 6, 8, 10]), dt = r.pick(DT81), mu = r9(1 - p * dt);
        if ((Math.abs(mu) < 1) !== st || Math.abs(Math.abs(mu) - 1) < 1e-9 || decs(mu) > 2) return null;
        adv(r, '81s1', 2);
        const Mx = [[0, 1], [-p * p, -2 * p]];
        return { q: `$A-BK$ の固有値が $${-p}$（重解）、$\\Delta t=${U(nf(dt), 's')}$ のくり返しの $A_{\\mathrm d}$ の固有値 $\\mu$ と、落ち着くか`,
          a: `$\\mu=${nf(mu)}$、${st ? '落ち着く' : '落ち着かない'}`, key: `${p}|${dt}`, easyCheck: false, easy: `$\\mu=1+(${-p})\\times${nf(dt)}=${nf(mu)}$`, verify: pp => muCheck(pp, Mx, dt) };
      },
      // 落ち着く Δt の範囲（重解・ちがう2つ）
      s2(r) {
        const two = turn(r, '81s2', 2) === 1;
        let p = r.pick([1, 2, 3, 4, 6, 8, 10, 20]), q = p;
        if (two) { q = r.pick([1, 2, 3, 4, 6, 8, 10]); if (q === p) return null; if (p > q) [p, q] = [q, p]; }
        if (q === 5) return null;
        const bq = Q(2, q), Mx = [[0, 1], [-p * q, -(p + q)]];
        const bTeX = bq[1] === 1 || [2, 4, 5, 10, 20].includes(bq[1]) ? nf(qv(bq)) : qTeX(bq);
        return { q: `$A-BK$ の固有値が ${two ? `$${-p}$ と $${-q}$` : `$${-p}$（重解）`} のとき、くり返しが落ち着く $\\Delta t$〔s〕の範囲`,
          a: `$0<\\Delta t<${bTeX}$`, key: `R|${p}|${q}`, easyCheck: false,
          easy: two ? `$\\mu=1-${p}\\Delta t$ と $1-${q}\\Delta t$。きびしいのは $${-q}$ のほう` : `$-1<1-${p}\\Delta t<1$`, verify: pp => rangeCheck(pp, Mx) };
      },
      // 見かけがちがう：A と K が書いてある（A−BK の固有値を先に出す）
      s3(r) {
        const st = peek(r, '81s3', 2) === 0, a = r.pick([1, 2, 4, 5, 10]), p = r.pick([1, 2, 3, 4, 6]), dt = r.pick(DT81), mu = r9(1 - p * dt);
        if ((Math.abs(mu) < 1) !== st || Math.abs(Math.abs(mu) - 1) < 1e-9 || decs(mu) > 2) return null;
        adv(r, '81s3', 2);
        const A = [[0, 1], [a, 0]], k1 = p * p + a, k2 = 2 * p, Mx = [[0, 1], [a - k1, -k2]];
        return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$、$u=-(${k1}\\theta+${k2}\\dot\\theta)$ を、$\\Delta t=${U(nf(dt), 's')}$ ごとのくり返しで計算する。$A_{\\mathrm d}$ の固有値 $\\mu$ と、落ち着くか`,
          a: `$\\mu=${nf(mu)}$、${st ? '落ち着く' : '落ち着かない'}`, key: `K|${a}|${p}`, easyCheck: false,
          easy: `$A-BK=${pm(Mx)}$ の固有値は $${-p}$（重解）。$\\mu=1-${p}\\times${nf(dt)}$`, verify: pp => muCheck(pp, Mx, dt) };
      },
      // わな：くり返しでない、連続の式（9-79）
      trap(r) {
        const td = trDet(r, r.pick([5, 5, 1, 2])); if (!td) return null;
        const Mx = [[0, 1], [-td[1], td[0]]], a = eigAns(Mx); if (!a) return null;
        return dest({ q: `くり返しでなく、連続の $\\dot{\\vec x}=(A-BK)\\vec x$（$A-BK=${pm(Mx)}$）は落ち着くか（固有値も）`, a, key: `C|${kA(Mx)}`, verify: p => eigStableCheck(p, Mx) }, '9-81',
          '連続の式なので、$\\mu$ の大きさではなく、$A-BK$ の固有値の実部の符号で見る', ['9-79']);
      },
    },
  });

  // ---------------------------------------------------------------- e^{At} の部品（9-82〜9-88）
  // t の式の行列の答え（前の数 fac：'' か 'e^{-2t}'・'\\frac{1}{2}'）
  const ansMat = (cells, fac) => `$${fac || ''}${pm(cells)}$`;
  // e^{At}（固有値が σ±ωj）：e^{σt}(cos ωt I + sin ωt/ω N)、N=A−σI。ω が整数でなければ null
  function eAtC(A, col) {
    const s = tr2(A) / 2, w2 = det2(A) - s * s;
    if (w2 <= 0 || !isSq(w2) || !isInt(s)) return null;
    const w = Math.round(Math.sqrt(w2)), N = [[A[0][0] - s, A[0][1]], [A[1][0], A[1][1] - s]];
    const cosT = w === 1 ? '\\cos t' : `\\cos${w}t`, sinT = w === 1 ? '\\sin t' : `\\sin${w}t`;
    const cells = N.map((row, i) => row.map((n, j) => sum([i === j ? cosT : '', qTeX(Q(n, w), sinT, true)])));
    const want = N.map((row, i) => row.map((n, j) => `exp(${s}*t)*(${i === j ? 1 : 0}*cos(${w}*t)+(${n}/${w})*sin(${w}*t))`));
    if (col != null) return { tex: ansMat(cells.map(r => [r[col]]), s === 0 ? '' : ex(s)), want: want.map(r => [r[col]]), s, w, N };
    return { tex: ansMat(cells, s === 0 ? '' : ex(s)), want, s, w, N };
  }
  // 2つの実数の固有値 λ1・λ2 と、固有ベクトルの行列 P（列が固有ベクトル）から e^{At}=Pe^{Dt}P^{-1}
  function eAtP(l1, l2, P, col) {
    const dl = P[0][0] * P[1][1] - P[0][1] * P[1][0], adj = [[P[1][1], -P[0][1]], [-P[1][0], P[0][0]]];
    // (i, j) の e^{λk t} の係数 = P_ik adj_kj / dl（有理数）
    const co = [0, 1].map(i => (col != null ? [col] : [0, 1]).map(j => [0, 1].map(k => Q(P[i][k] * adj[k][j], dl))));
    // 前に 1/|dl| を出す（分母がそろうとき）
    const den = Math.abs(dl), allInt = co.flat(2).every(q => q[1] === 1);
    const fac = !allInt && den > 1 && co.flat(2).every(q => den % q[1] === 0) ? den : 1;
    const cells = co.map(row => row.map(cs => linS(cs.map((q, k) => [Q(q[0] * fac, q[1]), ex(k ? l2 : l1)])) || '0'));
    const want = co.map(row => row.map(cs => cs.map((q, k) => `(${q[0]}/${q[1]})*exp(${k ? l2 : l1}*t)`).join('+')));
    return { tex: ansMat(cells, fac > 1 ? `\\frac{1}{${fac}}` : ''), want };
  }
  // 多項式 s^2+c1 s+c0 の TeX
  const den2 = (c1, c0) => sum(['s^2', cf(r9(c1), 's'), nf(r9(c0))]);

  // ================================================================ 9-82
  const EX82 = [[0, 1], [-6, -5]];
  // G(s)=C(sI−A)^{-1}B の分子 n1 s+n0、分母 s^2−(a+d)s+(ad−bc)
  function gOf(A, B, C) {
    const [[a, b], [c, d]] = A, [b1, b2] = B, [g1, g2] = C;
    return { n1: r9(g1 * b1 + g2 * b2), n0: r9(g1 * (-d * b1 + b * b2) + g2 * (c * b1 - a * b2)), c1: r9(-(a + d)), c0: r9(a * d - b * c) };
  }
  const gTeX = g => `$G(s)=\\dfrac{${sum([cf(g.n1, 's'), nf(g.n0)])}}{${den2(g.c1, g.c0)}}$`;
  const gWant = g => `(${g.n1}*s+(${g.n0}))/(s^2+(${g.c1})*s+(${g.c0}))`;
  // 答えの G(s) を、(sI−A)^{-1} を数で作ってくらべる
  function gCheck(p, A, B, C) {
    const s0 = maths(p.a)[0]; if (!s0) return '答えがない';
    const rhs = s0.slice(s0.lastIndexOf('=') + 1);
    for (const s of [0.37, 1.29, 2.71]) {
      const Ms = [[s - A[0][0], -A[0][1]], [-A[1][0], s - A[1][1]]], dt = det2(Ms);
      if (Math.abs(dt) < 1e-6) continue;
      const inv = [[Ms[1][1] / dt, -Ms[0][1] / dt], [-Ms[1][0] / dt, Ms[0][0] / dt]], v = mulv(inv, B), want = C[0] * v[0] + C[1] * v[1];
      if (!near(M.evalMath(rhs, { s }), want, 1e-8)) return `s=${s} で ${want} にならない`;
    }
    return true;
  }
  const gq = (A, B, C) => `$A=${pm(A)}$、$B=${cv(B)}$、$C=${rv(C)}$ の $G(s)$`;
  function gProb(A, B, C, key, easy) {
    const g = gOf(A, B, C); if (g.n1 === 0 && g.n0 === 0) return null;
    return { q: gq(A, B, C), a: gTeX(g), key, easyCheck: false, easy, calc: { kind: 'fn', want: gWant(g), vars: ['s'] }, verify: p => gCheck(p, A, B, C) };
  }
  add({
    id: '9-82', part: 6, chap: '9-10⑩ 例題8・9-8⑩ 例題6', stars: 1,
    title: '$G=C(sI-A)^{-1}B$ は、逆行列の成分を1つだけ出す（$B$ で列、$C$ で行を選ぶ）',
    mark: '$A$・$B$・$C$ から伝達関数 $G(s)$（9-10 の H・9-8 の E）。',
    futsu: ['$(sI-A)^{-1}$ の4つの成分を', 'すべて求めてから、右から $B$、', '左から $C$ を、行列のかけ算で', '順にかける'],
    raku: ['$A=\\begin{pmatrix}0&1\\\\-6&-5\\end{pmatrix}$、$\\det(sI-A)=s^2+5s+6$', '1行め2列めだけ → $G=\\dfrac{1}{s^2+5s+6}$', '速度をはかる $C$ なら2行め → $\\dfrac{s}{s^2+5s+6}$'],
    why: '$(sI-A)^{-1}=\\dfrac{1}{\\det(sI-A)}\\begin{pmatrix}s-d&b\\\\c&s-a\\end{pmatrix}$（7-5）。$B$ が $(0,\\ 1)$ のたて書きなら、かけると2列めだけが残り、$C$ が $(1,\\ 0)$ の1行なら1行めだけが残る。だから、ほしいのは逆行列の1行め2列めの1つだけ（9-10⑩）。分母の $\\det(sI-A)$ は $A$ の特性方程式と同じ形（極＝固有値）。',
    caution: '$sI-A$ は対角に $s$、ほかは $A$ の符号を変える（$\\begin{pmatrix}s&-1\\\\6&s+5\\end{pmatrix}$）。逆行列は $a$ と $d$ を入れかえ、$b$・$c$ の符号を変える。$B$ の2行めが1でないときはその数をかけ、$C=\\begin{pmatrix}0&1\\end{pmatrix}$ なら2行め（$s$ がかかる）。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '26mm', s2: '26mm', s3: '26mm', trap: '30mm' },
    fits(q) { return /\$C=/.test(q) && /G\(s\)/.test(q); },
    steps: {
      // 2階の式の形の A、B=(0,1)、C=(1,0)
      s1(r) {
        const b = r.int(1, 9), c = r.int(1, 20), A = [[0, 1], [-c, -b]];
        if (exLike(A, EX82)) return null;
        return gProb(A, [0, 1], [1, 0], kA(A), `$\\det(sI-A)=${den2(b, c)}$、逆行列の1行め2列めの分子は1`);
      },
      // 速度をはかる・B の2行めが1でない・C が2つとも0でない
      s2(r) {
        const b = r.int(1, 9), c = r.int(1, 20), A = [[0, 1], [-c, -b]], k = turn(r, '82s2', 3);
        if (exLike(A, EX82)) return null;
        if (k === 0) return gProb(A, [0, 1], [0, 1], kA(A), '2行め2列めの分子は $s$（$C$ で2行めが残る）');
        if (k === 1) { const be = r.pick([2, 3, 4, 5, 0.5, 10]); return gProb(A, [0, be], [1, 0], kA(A), `1行め2列めの $${nf(be)}$ 倍`); }
        const g1 = r.pick([1, 2, 3, 4]), g2 = r.pick([1, 2, -1]);
        return gProb(A, [0, 1], [g1, g2], kA(A), `2列め $\\begin{pmatrix}1\\\\s\\end{pmatrix}$ に $C$ をかけて $${sum([cf(g2, 's'), nf(g1)])}$`);
      },
      // 見かけがちがう：水そう、一般の A
      s3(r) {
        if (turn(r, '82s3', 2) === 0) {
          const p = r.pick([0.1, 0.2, 0.05, 0.3]), q = r.pick([0.1, 0.2, 0.05]), A = [[-p, p], [q, -q]], j = r.int(0, 1), be = r.pick([0.01, 0.02, 0.1]);
          const B = j ? [0, be] : [be, 0], C = r.chance(0.5) ? [1, 0] : [0, 1];
          const P = gProb(A, B, C, kA(A), `$\\det(sI-A)=${den2(r9(p + q), 0)}$`);
          return P && Object.assign(P, { q: `水そう（分と cm）の $${P.q.slice(1)}` });
        }
        for (let k = 0; k < 40; k++) {
          const A = [[r.int(-5, 2), r.pick([-3, -2, -1, 1, 2, 3])], [r.pick([-4, -2, -1, 1, 2, 3]), r.int(-5, 1)]], B = r.pick([[1, 0], [1, 1], [0, 2]]), C = r.pick([[1, 0], [0, 1]]);
          if (det2(A) === 0 || (A[0][0] === 0 && A[0][1] === 1) || exLike(A, EX82)) continue;
          const g = gOf(A, B, C); if (g.n1 === 0 && g.n0 === 0) continue;
          return gProb(A, B, C, kA(A), `$\\det(sI-A)=${den2(g.c1, g.c0)}$。$(sI-A)^{-1}B$ を作ってから $C$`);
        }
        return null;
      },
      // わな：e^{At} の成分（9-87）
      trap(r) {
        const p = r.pick([1, 2, 3, 5, 6]), A = [[0, 1], [-p * p, -2 * p]];
        return dest({ q: `$A=${pm(A)}$ の $e^{At}$ の1行め1列め`, a: `$(1+${p === 1 ? '' : p}t)e^{${-p === -1 ? '-' : -p}t}$`, key: `e|${p}`,
          calc: { kind: 'fn', want: `(1+${p}*t)*exp(${-p}*t)`, vars: ['t'] }, verify: pp => near(exprAt(pp.a, 0.83), expmNum(A, 0.83)[0][0], 1e-8) || 'e^{At} の成分とちがう' }, '9-82',
          `伝達関数ではなく $e^{At}$。$(sI-A)^{-1}$ の1行め1列め $\\dfrac{s+${2 * p}}{(s+${p})^2}$ を部分分数にしてもどす`, ['9-87']);
      },
    },
  });

  // ================================================================ 9-83
  const EX83 = [[-2, 0], [0, -0.5]];
  const DG83 = [-0.1, -0.2, -0.5, -1, -2, -3, -4, -5, 1, 2, 0.5, -0.25];
  // 対角の連立の式か（$\dot x_1=…$ に x_2 がなく、$\dot x_2=…$ に x_1 がない）
  function diagEqs(q) {
    const m1 = /\\dot x_1=([^$]*)\$/.exec(q), m2 = /\\dot x_2=([^$]*)\$/.exec(q);
    return !!m1 && !!m2 && !/x_2/.test(m1[1]) && !/x_1/.test(m2[1]);
  }
  const vecAns = cs => `$(${cs.join(',\\ ')})$`;
  const colAns = cs => `$${pm(cs.map(c => [c]))}$`;   // たてに（答えの節ではみ出さないように）
  // ベクトルの答え（t の式）を、数の e^{At} x0 とくらべる
  function vecCheck(p, A, x0, ts) {
    for (const t of ts || [0, 0.37, 1.13]) { const m = /pmatrix/.test(p.a) ? matOfAns(p.a, { t }) : null, g = m ? m.map(r => r[0]) : vecAt(p.a, { t }), w = mulv(expmNum(A, t), x0); if (!g || !g.every((v, i) => near(v, w[i], 1e-7))) return `t=${t} で ${JSON.stringify(w)} にならない`; }
    return true;
  }
  add({
    id: '9-83', part: 6, chap: '9-11④ 例題1', stars: 1,
    title: '対角の $A$ は成分ごとに $e^{\\lambda t}$',
    mark: 'つながっていない式（$A$ が対角）の $e^{At}$・$\\vec x(t)$（場合 A）。',
    futsu: ['$e^{At}=I+At+\\dfrac{(At)^2}{2!}+\\cdots$ の', '項を1つずつ計算して、', '成分ごとのたし算が何になるかを', '見きわめる'],
    raku: ['$\\dot x_1=-2x_1$、$\\dot x_2=-0.5x_2$', '→ $e^{At}=\\begin{pmatrix}e^{-2t}&0\\\\0&e^{-0.5t}\\end{pmatrix}$', 'はじめ $(1,\\ 4)$、$t=2$ → $(e^{-4},\\ 4e^{-1})$'],
    why: '対角の行列は何乗しても対角のままで、ななめの数がそれぞれ何乗かになるだけ。だから $I+At+\\frac{(At)^2}{2!}+\\cdots$ のななめには $1+\\lambda t+\\frac{(\\lambda t)^2}{2!}+\\cdots=e^{\\lambda t}$ が並ぶ（9-11④）。式がつながっていないので、それぞれが 6-4 の冷め方と同じ形で、答えも別々。',
    caution: '成分ごとに $e$ にしてよいのは、$A$ が対角のときだけ（まちがえやすいところ①）。右上か左下に0でない数があれば、対角化（わざ 9-84）か $(sI-A)^{-1}$（わざ 9-87）。ななめでない所は $e^0=1$ ではなく0。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '34mm', s2: '34mm', s3: '40mm', trap: '50mm' }, boxh: { s1: '11mm', s3: '13mm', trap: '11mm' },
    fits(q) {
      if (!/e\^\{At\}|\\vec x\(t\)|分後|秒後/.test(q)) return false;
      const A = matsIn(q)[0];
      if (A) return A.every((row, i) => row.every((x, j) => i === j || x === 0)) && /e\^\{At\}/.test(q);
      return diagEqs(q);
    },
    steps: {
      // 対角の A の e^{At}
      s1(r) {
        const a = r.pick(DG83), d = r.pick(DG83), A = [[a, 0], [0, d]];
        if (a === d || exLike(A, EX83)) return null;
        return { q: `$A=${pm(A)}$ の $e^{At}$`, a: ansMat([[ex(a), 0], [0, ex(d)]]), key: kA(A), easyCheck: false, easy: '対角なので、ななめに $e^{\\lambda t}$ を並べる',
          calc: { kind: 'mat', vars: ['t'], want: [[`exp(${a}*t)`, 0], [0, `exp(${d}*t)`]] }, verify: p => expmCheck(p, A) };
      },
      // 連立の式とはじめの状態から x(t)
      s2(r) {
        const a = r.pick(DG83), d = r.pick(DG83), A = [[a, 0], [0, d]], x0 = [r.pick([1, 2, 3, 5, 10, 20]), r.pick([1, 2, 4, 6, 10, 30])];
        if (a === d || exLike(A, EX83)) return null;
        return { q: `$\\dot x_1=${cf(a, 'x_1')}$、$\\dot x_2=${cf(d, 'x_2')}$、はじめ $${vt(x0)}$ の $\\vec x(t)$`, a: vecAns([qTeX(Q(x0[0]), ex(a)), qTeX(Q(x0[1]), ex(d))]), key: kA(A), easyCheck: false,
          easy: '$\\vec x=e^{At}\\vec x_0$：それぞれ $e^{\\lambda t}$ 倍', verify: p => vecCheck(p, A, x0) };
      },
      // 見かけがちがう：3×3、冷めるカップの時刻の値（e を残した形）
      s3(r) {
        if (turn(r, '83s3', 2) === 0) {
          const ls = r.shuffle([-1, -2, -3, -0.5, -4, 1, -0.1].slice()).slice(0, 3), A = [0, 1, 2].map(i => [0, 1, 2].map(j => (i === j ? ls[i] : 0)));
          return { q: `$A=${pm(A)}$ の $e^{At}$`, a: ansMat(A.map((row, i) => row.map((x, j) => (i === j ? ex(x) : 0)))), key: kA(A), easyCheck: false, easy: '3×3 でも、対角ならななめに $e^{\\lambda t}$',
            calc: { kind: 'mat', vars: ['t'], want: A.map((row, i) => row.map((x, j) => (i === j ? `exp(${x}*t)` : 0))) }, verify: p => expmCheck(p, A) };
        }
        const [a, d, T] = r.pick([[-0.1, -0.05, 10], [-0.1, -0.2, 10], [-0.2, -0.1, 5], [-0.05, -0.1, 20], [-0.1, -0.3, 10], [-0.04, -0.1, 25], [-0.2, -0.05, 10]]);
        const x0 = [r.pick([40, 50, 60, 70, 80]), r.pick([20, 30, 40, 50])], A = [[a, 0], [0, d]], e1 = r9(a * T), e2 = r9(d * T);
        const et = v => `e^{${nf(v)}}`;
        return { q: `2つのカップの温度と部屋の温度の差 $x_1$・$x_2$〔℃〕が、$\\dot x_1=${cf(a, 'x_1')}$、$\\dot x_2=${cf(d, 'x_2')}$（$t$ は分）にしたがう。はじめ $${vt(x0)}$ の${T}分後の $(x_1,\\ x_2)$（$e$ を残した形で）`,
          a: `$(${x0[0]}${et(e1)},\\ ${x0[1]}${et(e2)})$`, key: kA(A) + '|' + T, easyCheck: false, easy: `$(${x0[0]}e^{${nf(a)}\\times${T}},\\ ${x0[1]}e^{${nf(d)}\\times${T}})$`,
          verify: p => { const g = vecAt(p.a), w = mulv(expmNum(A, T), x0); return (g && g.every((v, i) => near(v, w[i], 1e-7))) || `${JSON.stringify(w)} にならない`; } };
      },
      // わな：対角でない（右上に数）→ 9-87
      trap(r) {
        const a = r.pick([-1, -2, -3, -4]), d = r.pick([-1, -2, -3, -5, -6]); if (a === d) return null;
        const b = (a - d) * r.pick([1, 2, -1, 3]), A = [[a, b], [0, d]], k = b / (a - d);
        const cells = [[ex(a), lin([[Q(k), ex(a)], [Q(-k), ex(d)]])], [0, ex(d)]];
        return dest({ q: `$A=${pm(A)}$ の $e^{At}$`, a: ansMat(cells), key: kA(A), calc: { kind: 'mat', vars: ['t'], want: [[`exp(${a}*t)`, `${k}*(exp(${a}*t)-exp(${d}*t))`], [0, `exp(${d}*t)`]] }, verify: p => expmCheck(p, A) }, '9-83',
          `右上が $${b}$ で対角でないので、成分ごとに $e$ にできない。$(sI-A)^{-1}$ の成分を部分分数でもどす`, ['9-87']);
      },
    },
  });

  // ================================================================ 9-84
  const EX84 = [[-2, 1], [1, -2]];
  const LS84 = [-1, -2, -3, -4, -5, -6, 1, 2];
  // 固有値 l1・l2、固有ベクトル v1・v2（小さい整数、det P が ±1〜±3）で、A が整数になるもの
  function gen84(r) {
    for (let k = 0; k < 200; k++) {
      let l1 = r.pick(LS84), l2 = r.pick(LS84); if (l1 === l2) continue;
      if (l1 < l2) [l1, l2] = [l2, l1];   // おそいほう（大きい固有値）を先に
      const nv = v => { const g = gcd(v[0], v[1]); return v[0] < 0 || (v[0] === 0 && v[1] < 0) ? [-v[0] / g, -v[1] / g] : [v[0] / g, v[1] / g]; };
      const v1 = nv([r.pick([1, 1, 2]), r.int(-3, 3)]), v2 = nv([r.pick([1, 1, 0, 2]), r.int(-3, 3)]);
      if (!v2[0] && !v2[1]) continue;
      const P = [[v1[0], v2[0]], [v1[1], v2[1]]], dl = det2(P);
      if (!dl || Math.abs(dl) > 3) continue;
      const adj = [[P[1][1], -P[0][1]], [-P[1][0], P[0][0]]];
      const A = [0, 1].map(i => [0, 1].map(j => (l1 * P[i][0] * adj[0][j] + l2 * P[i][1] * adj[1][j]) / dl));
      if (!A.flat().every(isInt) || A.flat().some(x => Math.abs(x) > 12) || A[0][1] === 0 || A[1][0] === 0 || exLike(A, EX84)) continue;
      return { l1, l2, v1, v2, P, A };
    }
    return null;
  }
  const evTxt = g => `固有値 $${g.l1}$：$${vt(g.v1)}$、$${g.l2}$：$${vt(g.v2)}$`;
  add({
    id: '9-84', part: 6, chap: '9-11⑤ 例題2', stars: 1,
    title: '対角化 $e^{At}=Pe^{Dt}P^{-1}$：$P$ の列に $e^{\\lambda t}$ をかけ、右から $P^{-1}$',
    mark: '固有値がちがう実数で、固有ベクトルがわかっている $A$ の $e^{At}$・$\\vec x(t)$（場合 B）。',
    futsu: ['$P^{-1}$・$e^{Dt}$・$P$ を作り、', '$P^{-1}e^{Dt}$ を先に計算して', 'から $P$ を左にかける', '（3つの行列のかけ算を2回）'],
    raku: ['$A=\\begin{pmatrix}-2&1\\\\1&-2\\end{pmatrix}$（$-1$：$(1,\\ 1)$、$-3$：$(1,\\ -1)$）', '$Pe^{Dt}=\\begin{pmatrix}e^{-t}&e^{-3t}\\\\e^{-t}&-e^{-3t}\\end{pmatrix}$、右から $P^{-1}$', '→ $\\frac12\\begin{pmatrix}e^{-t}+e^{-3t}&e^{-t}-e^{-3t}\\\\e^{-t}-e^{-3t}&e^{-t}+e^{-3t}\\end{pmatrix}$'],
    why: '$A=PDP^{-1}$ なら $(At)^n=P(Dt)^nP^{-1}$ で、たし算のどの項も $P(\\cdots)P^{-1}$ の形なので、$e^{At}=Pe^{Dt}P^{-1}$（9-11⑤）。$Pe^{Dt}$ は、$P$ の1列めに $e^{\\lambda_1t}$、2列めに $e^{\\lambda_2t}$ をかけるだけ。あとは右から $P^{-1}$（2×2 の逆行列。7-5）をかける。',
    caution: '順番を逆にしない（$P^{-1}e^{Dt}P$ はまちがい。まちがえやすいところ②）。$t=0$ を入れて $I$ になるかで確かめる。はじめの状態 $\\vec x_0$ が固有ベクトルの和 $c_1\\vec v_1+c_2\\vec v_2$ なら、$\\vec x(t)=c_1e^{\\lambda_1t}\\vec v_1+c_2e^{\\lambda_2t}\\vec v_2$ で、$e^{At}$ を全部作らなくてよい。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 1 },
    cols: 1,
    boxw: { s1: '40mm', s2: '56mm', s3: '40mm', trap: '50mm' }, boxh: { s1: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { return /e\^\{At\}|\\vec x\(t\)/.test(q) && /固有値 \$[^$]*\$：\$\(/.test(q); },
    steps: {
      // e^{At}
      s1(r) {
        const g = gen84(r); if (!g) return null;
        const e = eAtP(g.l1, g.l2, g.P, 0);
        return { q: `$A=${pm(g.A)}$（${evTxt(g)}）の $e^{At}$ の1列め`, a: e.tex, key: kA(g.A), easyCheck: false,
          easy: `$P=${pm(g.P)}$、$Pe^{Dt}=${pm([[qTeX(Q(g.P[0][0]), ex(g.l1)) || 0, qTeX(Q(g.P[0][1]), ex(g.l2)) || 0], [qTeX(Q(g.P[1][0]), ex(g.l1)) || 0, qTeX(Q(g.P[1][1]), ex(g.l2)) || 0]])}$、右から $P^{-1}$`,
          calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: p => expmCheck(p, g.A, 0) };
      },
      // はじめの状態から x(t)（固有ベクトルの和に分ける）
      s2(r) {
        const g = gen84(r); if (!g) return null;
        const only = turn(r, '84s2', 3) === 0, c1 = only ? r.pick([1, 2, 3]) : r.pick([1, 2, -1, 3]), c2 = only ? 0 : r.pick([1, -1, 2, -2]);
        const x0 = [c1 * g.v1[0] + c2 * g.v2[0], c1 * g.v1[1] + c2 * g.v2[1]];
        if (x0.every(v => v === 0)) return null;
        const comp = i => lin([[Q(c1 * g.v1[i]), ex(g.l1)], [Q(c2 * g.v2[i]), ex(g.l2)]]) || '0';
        if ((comp(0) + comp(1)).replace(/[{}^]/g, '').length > 30) return null;   // 横に長い答えは、答えの節ではみ出す
        return { q: `$A=${pm(g.A)}$（${evTxt(g)}）で、はじめ $${vt(x0)}$ の $\\vec x(t)$`, a: vecAns([comp(0), comp(1)]), key: kA(g.A), easyCheck: false,
          easy: `$\\vec x_0=${sum([qTeX(Q(c1), vt(g.v1)), qTeX(Q(c2), vt(g.v2))])}$ → それぞれ $e^{\\lambda t}$ 倍`, verify: p => vecCheck(p, g.A, x0) };
      },
      // 見かけがちがう：となり合う部屋の温度（小数）、2階の式の形の A
      s3(r) {
        if (turn(r, '84s3', 2) === 0) {
          const c = r.pick([0.1, 0.2, 0.3]), e = r.pick([0.1, 0.2, 0.05]); if (c === e) return null;
          const A = [[r9(-(c + e)), c], [c, r9(-(c + e))]], X = r.pick([10, 20, 30, 40]), l1 = r9(-e), l2 = r9(-(2 * c + e));
          if (exLike(A, EX84)) return null;
          const h = Q(X, 2);
          return { q: `となり合う2つの部屋の温度（外との差。℃）が $\\dot{\\vec x}=A\\vec x$、$A=${pm(A)}$（分。固有値 $${nf(l1)}$：$(1,\\ 1)$、$${nf(l2)}$：$(1,\\ -1)$）にしたがう。はじめ $(${X},\\ 0)$ の $\\vec x(t)$`,
            a: colAns([lin([[h, ex(l1)], [h, ex(l2)]]), lin([[h, ex(l1)], [Q(-X, 2), ex(l2)]])]), key: kA(A), easyCheck: false,
            easy: `$(${X},\\ 0)=${nf(X / 2)}(1,\\ 1)+${nf(X / 2)}(1,\\ -1)$`, verify: p => vecCheck(p, A, [X, 0]) };
        }
        let p = r.pick([1, 2, 3]), q = r.pick([2, 3, 4]); if (p >= q) return null;
        const A = [[0, 1], [-p * q, -(p + q)]], P = [[1, 1], [-p, -q]], e = eAtP(-p, -q, P, 1);
        if (exLike(A, EX84)) return null;
        return { q: `$${ode2(1, p + q, p * q, 'x')}=0$ の $A=${pm(A)}$（固有値 $${-p}$：$(1,\\ ${-p})$、$${-q}$：$(1,\\ ${-q})$）の $e^{At}$ の2列め`, a: e.tex, key: kA(A), easyCheck: false,
          easy: `$P=${pm(P)}$、$\\det P=${p - q}$`, calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: pp => expmCheck(pp, A, 1) };
      },
      // わな：固有値が複素数（9-85）
      trap(r) {
        const s = r.pick([0, 0, -1, -2]), w = r.pick([1, 2, 3]), A = [[0, 1], [-(s * s + w * w), 2 * s]], e = eAtC(A, 0); if (!e) return null;
        return dest({ q: `$A=${pm(A)}$（固有値 $${s ? s : ''}\\pm${w === 1 ? ' ' : w}j$）の $e^{At}$ の1列め`, a: e.tex, key: kA(A), calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: p => expmCheck(p, A, 0) }, '9-84',
          `固有値が複素数なので、実数の $P$ で対角化できない。$N=A${s ? `+${-s === 1 ? '' : -s}I` : ''}$、$N^2=${w === 1 ? '-' : -w * w}I$ で $${s ? ex(s) : ''}\\bigl(\\cos${w === 1 ? ' ' : w}t\\,I+${w === 1 ? '\\sin t' : `\\frac{\\sin${w}t}{${w}}`}N\\bigr)$`, ['9-85']);
      },
    },
  });

  // ---------------------------------------------------------------- 9-85〜9-87 の部品
  // 2乗が0の、0でない 2×2（(a b; c −a)、a^2+bc=0）。a=0 なら右上か左下だけ
  function nil2(r, allowZeroA) {
    for (let k = 0; k < 60; k++) {
      const a = allowZeroA && r.chance(0.3) ? 0 : r.pick([1, 2, 3, -1, -2]);
      if (a === 0) { const b = r.pick([1, 2, 3, -1, -2, 4]); return r.chance(0.5) ? [[0, b], [0, 0]] : [[0, 0], [b, 0]]; }
      const bs = [1, 2, 3, 4, 6, 9].flatMap(x => [x, -x]).filter(b => (a * a) % b === 0), b = r.pick(bs), c = -(a * a) / b;
      if (Math.abs(c) > 9) continue;
      return [[a, b], [c, -a]];
    }
    return null;
  }
  // 2階の式 a x'' + b x' + c x = 0 の係数（文の中の式から。なければ null）
  function odeIn(q) {
    const m = /\$\\ddot x([^$=]*)=0\$/.exec(q); if (!m) return null;
    const s = m[1].replace(/\\dot\s*x/g, 'D').replace(/\s/g, ''), mb = /([+-]\d*\.?\d*)D/.exec(s), mc = /([+-]\d*\.?\d*)x(?![_\w])/.exec(s.replace(/[+-]\d*\.?\d*D/, ''));
    const num = t => (t === '+' ? 1 : t === '-' ? -1 : +t);
    return [1, mb ? num(mb[1]) : 0, mc ? num(mc[1]) : 0];
  }
  const isPowI = A => { const S = mmul(A, A); return near(S[0][1], 0) && near(S[1][0], 0) && near(S[0][0], S[1][1]); };

  // ================================================================ 9-85
  const EX85 = [[0, 1], [-4, 0]];
  // σI＋N（N=(a b; c −a)、a^2+bc=−ω^2）の整数の A
  function genC(r, s, a0) {
    for (let k = 0; k < 80; k++) {
      const w = r.pick([1, 2, 3, 4]), a = a0 ? 0 : r.pick([0, 1, -1, 2, -2]), bc = -(w * w) - a * a;
      const bs = [1, 2, 3, 4, 5, 6, 8, 9, 10].flatMap(x => [x, -x]).filter(b => bc % b === 0 && Math.abs(bc / b) <= 10);
      const b = r.pick(bs), c = bc / b, A = [[s + a, b], [c, s - a]];
      if (exLike(A, EX85) || (s + a === 0 && b === 1)) continue;
      return A;
    }
    return null;
  }
  const trigBody = w => (w === 1 ? ['\\cos t', '\\sin t'] : [`\\cos${w}t`, `\\sin${w}t`]);
  add({
    id: '9-85', part: 6, chap: '9-11⑧ 例題3', stars: 1,
    title: '固有値が $\\sigma\\pm j\\omega$ なら $N=A-\\sigma I$、$N^2=-\\omega^2I$ で $\\cos$・$\\sin$ に分ける',
    mark: 'ゆれる $A$（固有値が複素数）の $e^{At}$・$x(t)$（場合 C）。',
    futsu: ['複素数の固有ベクトルで $P$ を作り、', '$Pe^{Dt}P^{-1}$ を複素数のまま計算して、', 'オイラーの公式で $\\cos$・$\\sin$ に', 'まとめ直す'],
    raku: ['$A=\\begin{pmatrix}0&1\\\\-4&0\\end{pmatrix}$（$\\pm2j$、$\\sigma=0$）→ $N=A$', '$N^2=-4I$ → $e^{At}=\\cos2t\\,I+\\dfrac{\\sin2t}{2}A$', '$=\\begin{pmatrix}\\cos2t&\\frac12\\sin2t\\\\-2\\sin2t&\\cos2t\\end{pmatrix}$'],
    why: '2×2 で固有値が $\\sigma\\pm j\\omega$ なら、$N=A-\\sigma I$ は $N^2=-\\omega^2I$ になる。$N$ の累乗は $I$、$N$、$-\\omega^2I$、$-\\omega^2N$、…とくり返すので、たし算を偶数番めと奇数番めに分けると $\\cos\\omega t\\,I+\\dfrac{\\sin\\omega t}{\\omega}N$。$\\sigma I$ はどの行列とも順番を入れかえてよいので、$e^{At}=e^{\\sigma t}e^{Nt}$（9-11⑧）。',
    caution: '$\\sin$ の係数は $\\dfrac{1}{\\omega}$（$\\omega$ でわるのを忘れない）。$N$ は対角から $\\sigma$ をひく（$\\sigma=-1$ なら1をたす）。$t=0$ で $I$ になるかで確かめる。$x(t)$ は $e^{At}\\vec x_0$ の1行め（はじめ $(1,\\ 0)$ なら1行め1列め）。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '50mm', s2: '50mm', s3: '64mm', trap: '40mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '11mm' },
    fits(q) {
      if (/入れ続け|\\det/.test(q)) return false;
      const A = firstA(q); if (A && /e\^\{At\}/.test(q)) return D2(A) < 0;
      const o = odeIn(q); return !!o && /x\(t\)/.test(q) && o[1] * o[1] - 4 * o[2] < 0;
    },
    steps: {
      // σ=0（ななめの和が0）
      s1(r) {
        const A = genC(r, 0, true); if (!A) return null;
        const e = eAtC(A); if (!e) return null;
        return { q: `$A=${pm(A)}$ の $e^{At}$`, a: e.tex, key: kA(A), easyCheck: false,
          easy: `$${sum(['\\lambda^2', nf(det2(A))])}=0$ で $\\pm${e.w === 1 ? ' ' : e.w}j$。$N=A$`, calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: p => expmCheck(p, A) };
      },
      // σ≠0：2階の式の形の A
      s2(r) {
        const s = r.pick([-1, -2, -3]), w = r.pick([1, 2, 3, 4]), A = [[0, 1], [-(s * s + w * w), 2 * s]];
        if (exLike(A, EX85)) return null;
        const e = eAtC(A, 0);
        return { q: `$A=${pm(A)}$ の $e^{At}$ の1列め`, a: e.tex, key: kA(A), easyCheck: false,
          easy: `$${s}\\pm${w === 1 ? ' ' : w}j$、$N=A+${-s === 1 ? '' : -s}I=${pm(e.N)}$`, calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: p => expmCheck(p, A, 0) };
      },
      // 見かけがちがう：2階の式の x(t)、一般の A
      s3(r) {
        if (turn(r, '85s3', 2) === 0) {
          const s = r.pick([-1, -2, -3]), w = r.pick([1, 2, 3, 4]), b = -2 * s, c = s * s + w * w, A = [[0, 1], [-c, b * -1]];
          const v0 = r.pick([0, 0, 1]), x0 = v0 ? 0 : 1, [cT, sT] = trigBody(w);
          // x0=1, v0=0：e^{σt}(cos ωt − σ/ω sin ωt)。x0=0, v0=1：e^{σt} sin ωt / ω
          const body = x0 ? sum([cT, qTeX(Q(-s, w), sT)]) : qTeX(Q(1, w), sT);
          return { q: `$${ode2(1, b, c, 'x')}=0$、はじめ $x=${x0}$、$\\dot x=${v0}$ の $x(t)$（$e^{At}$ を使って）`, a: `$x(t)=${ex(s)}${x0 ? `(${body})` : body}$`, key: kA(A) + `|${x0}${v0}`, easyCheck: false,
            easy: `$${s}\\pm${w === 1 ? ' ' : w}j$。$e^{At}$ の${x0 ? '1行め1列め' : '1行め2列め'}`, calc: { kind: 'ode', x: 't', coef: [1, b, c], init: [[0, x0], [0, v0, 1]] },
            verify: p => near(exprAt(p.a, 0.83), mulv(expmNum(A, 0.83), [x0, v0])[0], 1e-8) || 'x(t) がちがう' };
        }
        const A = genC(r, r.pick([-1, -2])); if (!A) return null;
        const e = eAtC(A, 0); if (!e) return null;
        return { q: `$A=${pm(A)}$ の $e^{At}$ の1列め`, a: e.tex, key: kA(A), easyCheck: false,
          easy: `$${e.s}\\pm${e.w === 1 ? ' ' : e.w}j$、$N=${pm(e.N)}$、$N^2=${-e.w * e.w}I$`, calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: p => expmCheck(p, A, 0) };
      },
      // わな：A^2=O（9-86）
      trap(r) {
        const Nn = nil2(r, true); if (!Nn) return null;
        const cells = [[sum(['1', cf(Nn[0][0], 't')]), cf(Nn[0][1], 't') || 0], [cf(Nn[1][0], 't') || 0, sum(['1', cf(Nn[1][1], 't')])]];
        return dest({ q: `$A=${pm(Nn)}$ の $e^{At}$`, a: ansMat(cells), key: kA(Nn), calc: { kind: 'mat', vars: ['t'], want: Nn.map((row, i) => row.map((x, j) => `${i === j ? 1 : 0}+${x}*t`)) }, verify: p => expmCheck(p, Nn) }, '9-85',
          '固有値は0の重解で、ゆれない。$A^2=O$ なので、たし算は2項で切れて $I+At$', ['9-86']);
      },
    },
  });

  // ================================================================ 9-86
  const EX86 = [[[0, 2], [0, 0]], [[0, 1], [4, 0]]];
  const bad86 = A => EX86.some(B => exLike(A, B));
  // M^2=γ^2 I（(a b; c −a)、a^2+bc=γ^2）
  function genH(r) {
    for (let k = 0; k < 80; k++) {
      const g = r.pick([1, 2, 3]), a = 0, bc = g * g - a * a;
      if (bc === 0) continue;
      const bs = [1, 2, 3, 4, 5, 6, 8, 9].flatMap(x => [x, -x]).filter(b => bc % b === 0 && Math.abs(bc / b) <= 9);
      if (!bs.length) continue;
      const b = r.pick(bs), c = bc / b, A = [[a, b], [c, -a]];
      if (bad86(A)) continue;
      return { A, g };
    }
    return null;
  }
  const CSH = { 1: ['1.543', '1.175'], 2: ['3.762', '3.627'] };
  add({
    id: '9-86', part: 6, chap: '9-11⑨ 例題4・5', stars: 1,
    title: '$A^2=O$ なら $I+At$、$M^2=\\gamma^2I$ なら $\\cosh$・$\\sinh$ に分かれる',
    mark: '$A^2$ を先に計算してみる：$O$ か、単位行列の何倍か（場合 D）。',
    futsu: ['特性方程式・固有ベクトル・$P^{-1}$ を', '求めて対角化しようとし、', '（$A^2=O$ では対角化できず）', '$(sI-A)^{-1}$ の部分分数にまわる'],
    raku: ['$A=\\begin{pmatrix}0&2\\\\0&0\\end{pmatrix}$、$A^2=O$ → $e^{At}=I+At$', '$M=\\begin{pmatrix}0&1\\\\4&0\\end{pmatrix}$ → $M^2=4I$', '→ $e^{M\\ell}=\\cosh2\\ell\\,I+\\frac12\\sinh2\\ell\\,M$'],
    why: '$A^2=O$ なら $A^3$ から先もすべて $O$ なので、$e^{At}=I+At$（9-11⑨）。$M^2=\\gamma^2I$ なら累乗は $I$、$M$、$\\gamma^2I$、$\\gamma^2M$、…で、偶数番めと奇数番めに分けると、6-11 の $\\cosh$・$\\sinh$ のたし算の形になる。ばね（$A^2=-I$）なら $\\cos$・$\\sin$ になる（わざ 9-85 と同じ考え）。',
    caution: '$\\sinh$ の係数は $\\dfrac{1}{\\gamma}$。$A^2=O$ になるのは右上だけの行列とは限らない（$\\begin{pmatrix}2&-4\\\\1&-2\\end{pmatrix}$ も）。ななめの和が0で $ad-bc$ が負なら $M^2=\\gamma^2I$。送電線では $\\frac{z}{\\gamma}=Z_0$（特性インピーダンス）。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '40mm', s2: '60mm', s3: '46mm', trap: '40mm' }, boxh: { s1: '11mm', s2: '12mm', s3: '11mm', trap: '11mm' },
    fits(q) {
      if (/送電線/.test(q)) return true;
      const A = firstA(q);
      return !!A && !isDiag(A) && isPowI(A) && /e\^\{At\}|\\vec x|状態/.test(q) && !/落ち着くか|\\det/.test(q);
    },
    steps: {
      // A^2=O（右上だけでない形）
      s1(r) {
        const Nn = nil2(r, false); if (!Nn || bad86(Nn)) return null;
        const cells = [[sum(['1', cf(Nn[0][0], 't')]), cf(Nn[0][1], 't') || 0], [cf(Nn[1][0], 't') || 0, sum(['1', cf(Nn[1][1], 't')])]];
        return { q: `$A=${pm(Nn)}$ の $e^{At}$`, a: ansMat(cells), key: kA(Nn), easyCheck: false, easy: '$A^2=O$ なので $e^{At}=I+At$',
          calc: { kind: 'mat', vars: ['t'], want: Nn.map((row, i) => row.map((x, j) => `${i === j ? 1 : 0}+${x}*t`)) }, verify: p => expmCheck(p, Nn) };
      },
      // M^2=γ^2 I
      s2(r) {
        const h = genH(r); if (!h) return null;
        const { A, g } = h, cT = g === 1 ? '\\cosh t' : `\\cosh${g}t`, sT = g === 1 ? '\\sinh t' : `\\sinh${g}t`;
        const cells = A.map((row, i) => row.map((x, j) => sum([i === j ? cT : '', qTeX(Q(x, g), sT, true)]) || '0'));
        return { q: `$A=${pm(A)}$ の $e^{At}$`, a: ansMat(cells), key: kA(A), easyCheck: false, easy: `$A^2=${g * g === 1 ? '' : g * g}I$ → $${cT}\\,I+${g === 1 ? sT : `\\frac{${sT}}{${g}}`}A$`,
          calc: { kind: 'mat', vars: ['t'], want: A.map((row, i) => row.map((x, j) => `${i === j ? 1 : 0}*cosh(${g}*t)+(${x}/${g})*sinh(${g}*t)`)) }, verify: p => expmCheck(p, A) };
      },
      // 見かけがちがう：送電線の数、A^2=O の状態
      s3(r) {
        if (turn(r, '86s3', 2) === 0) {
          const [z, y] = r.pick([[1, 1], [9, 1], [4, 4], [16, 1], [2, 8], [8, 2], [1, 16], [4, 9], [9, 4]]), g = Math.sqrt(z * y), Z0 = Math.sqrt(z / y);
          const n = r.pick([1, 2]), ell = r9(n / g); if (decs(ell) > 2) return null;
          const [ch, sh] = CSH[n], v = [[+ch, Z0 * sh], [sh / Z0, +ch]], tv = [[Math.cosh(n), Z0 * Math.sinh(n)], [Math.sinh(n) / Z0, Math.cosh(n)]];
          const cells = v.map((row, i) => row.map((x, j) => agree(x, tv[i][j], 3)));
          if (cells.flat().some(c => c == null)) return null;
          const M = [[0, z], [y, 0]];
          return { q: `送電線（直列 $z=${U(z, '\\Omega/km')}$、並列 $y=${U(y, 'S/km')}$）の長さ $\\ell=${U(nf(ell), 'km')}$ の行列 $e^{M\\ell}$（$M=${pm(M)}$、$\\cosh${n}=${ch}$、$\\sinh${n}=${sh}$、小数第3位まで）`,
            a: `$${pm(cells)}$`, key: kA(M), easyCheck: false, easy: `$\\gamma=\\sqrt{zy}=${g}$、$Z_0=\\sqrt{\\frac zy}=${nf(Z0)}$、$\\gamma\\ell=${n}$`,
            verify: p => matNear(matOfAns(p.a), tv.map(row => row.map(x => +rd(x, 3))), 1e-9) || '行列がちがう' };
        }
        const Nn = nil2(r, false); if (!Nn || bad86(Nn)) return null;
        const x0 = [r.pick([1, 2, 3, -1]), r.pick([1, 2, -1, 0])], T = r.pick([2, 3, 4, 5]), w = mulv(madd(eye(2), mscale(Nn, T)), x0);
        return { q: `$\\dot{\\vec x}=A\\vec x$、$A=${pm(Nn)}$、はじめ $${vt(x0)}$ の、$t=${T}$ の状態`, a: `$${vt(w)}$`, key: kA(Nn), easyCheck: false,
          easy: `$A^2=O$。$\\vec x=(I+${T}A)\\vec x_0$`, verify: p => { const g = vecAt(p.a), e = mulv(expmNum(Nn, T), x0); return (g && g.every((v, i) => near(v, e[i], 1e-7))) || `${JSON.stringify(e)} でない`; } };
      },
      // わな：対角（9-83）
      trap(r) {
        const a = r.pick([-1, -2, -3, -4, -0.5, 1]), d = r.pick([-1, -3, -5, -0.2, 2]); if (a === d) return null;
        const A = [[a, 0], [0, d]];
        return dest({ q: `$A=${pm(A)}$ の $e^{At}$`, a: ansMat([[ex(a), 0], [0, ex(d)]]), key: kA(A), calc: { kind: 'mat', vars: ['t'], want: [[`exp(${a}*t)`, 0], [0, `exp(${d}*t)`]] }, verify: p => expmCheck(p, A) }, '9-86',
          `$A^2$ は $O$ でも単位行列の何倍でもない（ななめが $${nf(a * a)}$ と $${nf(d * d)}$）。対角なので成分ごとに $e$`, ['9-83']);
      },
    },
  });

  // ================================================================ 9-87
  const EX87 = [[0, 1], [-16, -8]];
  // e^{λt}(I+Nt) の答え
  const eAtN = (l, Nn) => ({ tex: ansMat([[sum(['1', cf(Nn[0][0], 't')]), cf(Nn[0][1], 't') || 0], [cf(Nn[1][0], 't') || 0, sum(['1', cf(Nn[1][1], 't')])]], ex(l)),
    want: Nn.map((row, i) => row.map((x, j) => `exp(${l}*t)*(${i === j ? 1 : 0}+${x}*t)`)) });
  add({
    id: '9-87', part: 6, chap: '9-11⑩ 例題6・7', stars: 1,
    title: '$(sI-A)^{-1}$ を成分ごとに部分分数でもどす（重解は $te^{-at}$）。$t=0$ で $I$ になるかで確かめる',
    mark: '固有値が重なる（重解）$A$ の $e^{At}$・$x(t)$。$(sI-A)^{-1}$ から（場合 E・F）。',
    futsu: ['固有ベクトルを2本さがして', '対角化しようとする（重解では', '1本しかなく、行きづまる）'],
    raku: ['$A=\\begin{pmatrix}0&1\\\\-16&-8\\end{pmatrix}$ → $\\dfrac{1}{(s+4)^2}\\begin{pmatrix}s+8&1\\\\-16&s\\end{pmatrix}$', '$\\dfrac{s+8}{(s+4)^2}=\\dfrac{1}{s+4}+\\dfrac{4}{(s+4)^2}$ → $(1+4t)e^{-4t}$', '→ $e^{At}=e^{-4t}\\begin{pmatrix}1+4t&t\\\\-16t&1-4t\\end{pmatrix}$'],
    why: '$\\dot{\\vec x}=A\\vec x$ をラプラス変換すると $\\vec X=(sI-A)^{-1}\\vec x_0$ なので、$e^{At}$ は $(sI-A)^{-1}$ を成分ごとに逆変換したもの（9-11⑩）。分母が $(s+a)^2$ のときは、表9-7のC で $\\dfrac{1}{(s+a)^2}\\to te^{-at}$ が出る。固有値がちがう実数のときも同じ方法で求められ、対角化の確かめになる（場合 F）。',
    caution: '重解で $te^{\\lambda t}$ を忘れない（まちがえやすいところ⑤）。分子の $s+8$ は、$(s+4)+4$ のように $s+a$ と定数に分ける。答えに $t=0$ を入れて、$I$ になるか（$x(0)$ がはじめの値になるか）を確かめる。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '52mm', s2: '52mm', s3: '64mm', trap: '30mm' }, boxh: { s1: '11mm', s2: '11mm', s3: '12mm' },
    fits(q) {
      if (/入れ続け|伝達関数|落ち着くか|\\det/.test(q)) return false;
      if (/\(sI-A\)\^\{-1\}/.test(q) && /e\^\{At\}/.test(q)) return true;
      const A = firstA(q); if (A && /e\^\{At\}/.test(q)) return Math.abs(D2(A)) < 1e-9 && !isDiag(A);
      const o = odeIn(q); return !!o && /x\(t\)/.test(q) && Math.abs(o[1] * o[1] - 4 * o[2]) < 1e-9;
    },
    steps: {
      // 2階の式の形、重解
      s1(r) {
        const p = r.pick([1, 2, 3, 5, 6]), A = [[0, 1], [-p * p, -2 * p]], Nn = [[p, 1], [-p * p, -p]], e = eAtN(-p, Nn);
        return { q: `$A=${pm(A)}$ の $e^{At}$`, a: e.tex, key: kA(A), easyCheck: false, easy: `$\\det(sI-A)=(s+${p})^2$。$\\dfrac{s+${2 * p}}{(s+${p})^2}=\\dfrac{1}{s+${p}}+\\dfrac{${p}}{(s+${p})^2}$`,
          calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: pp => expmCheck(pp, A) };
      },
      // 一般の重解の A（λI＋2乗が0の行列）
      s2(r) {
        const l = r.pick([-1, -2, -3, -4, -5, 1]), Nn = nil2(r, true); if (!Nn) return null;
        const A = madd(mscale(eye(2), l), Nn); if (exLike(A, EX87)) return null;
        const e = eAtN(l, Nn);
        return { q: `$A=${pm(A)}$ の $e^{At}$`, a: e.tex, key: kA(A), easyCheck: false, easy: `$\\det(sI-A)=(s${l < 0 ? '+' + -l : '-' + l})^2$。成分ごとに部分分数`,
          calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: pp => expmCheck(pp, A) };
      },
      // 見かけがちがう：ちょうどゆれない動きの x(t)、固有値がちがう実数を (sI−A)^{-1} で
      s3(r) {
        if (turn(r, '87s3', 2) === 0) {
          const p = r.pick([1, 2, 3, 5]), x0 = r.pick([1, 2, 3]), v0 = r.pick([0, 0, 1, -1, 2]), A = [[0, 1], [-p * p, -2 * p]], k = v0 + p * x0;
          return { q: `$${ode2(1, 2 * p, p * p, 'x')}=0$、はじめ $x=${x0}$、$\\dot x=${v0}$ の $x(t)$（$(sI-A)^{-1}$ を使って）`, a: `$x(t)=(${sum([nf(x0), cf(k, 't')])})${ex(-p)}$`, key: kA(A) + `|${x0}|${v0}`, easyCheck: false,
            easy: `$X=\\dfrac{${sum([cf(x0, 's'), nf(v0 + 2 * p * x0)])}}{(s+${p})^2}$`, calc: { kind: 'ode', x: 't', coef: [1, 2 * p, p * p], init: [[0, x0], [0, v0, 1]] },
            verify: pp => near(exprAt(pp.a, 0.83), mulv(expmNum(A, 0.83), [x0, v0])[0], 1e-8) || 'x(t) がちがう' };
        }
        let p = r.pick([1, 2, 3, 4]), q = r.pick([2, 3, 4, 5, 6]); if (p >= q) return null;
        const A = [[0, 1], [-p * q, -(p + q)]], e = eAtP(-p, -q, [[1, 1], [-p, -q]], 0);
        return { q: `$A=${pm(A)}$ の $e^{At}$ の1列めを、$(sI-A)^{-1}$ を逆変換して`, a: e.tex, key: kA(A), easyCheck: false, easy: `$(sI-A)^{-1}=\\dfrac{1}{(s+${p})(s+${q})}${pm([[`s+${p + q}`, 1], [-p * q, 's']])}$。かくす方法`,
          calc: { kind: 'mat', vars: ['t'], want: e.want }, verify: pp => expmCheck(pp, A, 0) };
      },
      // わな：落ち着くかだけ（9-79）
      trap(r) {
        const p = r.pick([1, 2, 3, 4, 5, 6]), sg = r.chance(0.7) ? 1 : -1, A = [[0, 1], [-p * p, -2 * p * sg]];
        if (exLike(A, EX87)) return null;
        return dest({ q: `$A=${pm(A)}$ の $\\dot{\\vec x}=A\\vec x$ は落ち着くか（固有値も）`, a: eigAns(A), key: kA(A), verify: pp => eigStableCheck(pp, A) }, '9-87',
          '落ち着くかだけなら、$e^{At}$ を作らずに固有値の実部を見る', ['9-79']);
      },
    },
  });

  // ================================================================ 9-88
  const EX88 = [[0, 1], [-3, -4]];
  // はじめ (X, V)、一定の入力 U、固有値 −p・−q（p<q）の x(t) の係数：[定数, e^{-pt}, e^{-qt}]（有理数）
  function step88(p, q, U, X, V) {
    const c0 = Q(U, p * q), d = q - p;
    // 斉次の部分：x(0)=X、x'(0)=V → ((qX+V) e^{-pt} − (pX+V) e^{-qt})/(q−p)。入力の部分：U/(pq) − U/(p(q−p)) e^{-pt} + U/(q(q−p)) e^{-qt}
    const cp = Q((q * X + V) * p * q - U * q, p * q * d), cq = Q(-(p * X + V) * p * q + U * p, p * q * d);
    return [c0, cp, cq];
  }
  const xTeX = (cs, p, q) => lin([[cs[0], ''], [cs[1], ex(-p)], [cs[2], ex(-q)]]);
  // ルンゲ・クッタ法でたどった x(t)（i 番めの成分）とくらべる
  function rkCheck(p, A, B, u, x0, i) {
    for (const t of [0.43, 1.37]) { const w = rk4(A, B, u, x0, t)[i || 0], g = exprAt(p.a, t); if (!near(g, w, 1e-6)) return `t=${t} で ${w} にならない（${g}）`; }
    return true;
  }
  const pq88 = r => { let p = r.int(1, 5), q = r.int(2, 6); if (p >= q || (p === 1 && q === 3)) return null; return [p, q]; };
  add({
    id: '9-88', part: 6, chap: '9-11⑪ 例題8', stars: 1,
    title: '入れるものがあるときは $(sI-A)^{-1}(\\vec x_0+BU)$ をもどす（ほしい成分の1行だけでよい）',
    mark: '一定の入力 $u$ を入れ続ける。はじめ止まっている（場合 G）。',
    futsu: ['$e^{At}$ を4つの成分ともすべて求め、', 'たたみこみの積分', '$\\int_0^te^{A(t-t_1)}Bu\\,\\dd t_1$ を', '成分ごとに計算する'],
    raku: ['$A=\\begin{pmatrix}0&1\\\\-3&-4\\end{pmatrix}$、$B=\\begin{pmatrix}0\\\\1\\end{pmatrix}$、$u=3$', '$X=\\dfrac{3}{s(s+1)(s+3)}$ をかくす方法で分ける', '→ $x=1-1.5e^{-t}+0.5e^{-3t}$、最後は1'],
    why: '$\\dot{\\vec x}=A\\vec x+Bu$ をラプラス変換すると $s\\vec X-\\vec x_0=A\\vec X+BU$ なので、$\\vec X=(sI-A)^{-1}(\\vec x_0+BU)$（9-11⑪）。$u$ が一定なら $U=\\dfrac us$（9-6）。ほしいのが位置だけなら、その1行だけを部分分数にして表を逆に引けばよい（かくす方法）。はじめの状態の分と、入れたものの分の和になる（線形）。',
    caution: '$U=\\dfrac{u}{s}$ の $\\dfrac1s$ を忘れない（分母に $s$ がふえる）。$B=\\begin{pmatrix}0\\\\1\\end{pmatrix}$ なら $(sI-A)^{-1}$ の2列めだけを使う。最後の値は $\\dfrac1s$ の係数（最終値の定理）で、$t=0$ で $x=0$ になるかも確かめる。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '50mm', s2: '50mm', s3: '50mm', trap: '50mm' },
    fits(q) { return /入れ続け/.test(q); },
    steps: {
      // 位置 x(t)
      s1(r) {
        const pq = pq88(r); if (!pq) return null;
        const [p, q] = pq, U = r.pick([1, 2, 3, 4, 6, 12]), A = [[0, 1], [-p * q, -(p + q)]], cs = step88(p, q, U, 0, 0);
        return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、はじめ止まっている状態に $u=${U}$ を入れ続ける。位置 $x(t)$`, a: `$x(t)=${xTeX(cs, p, q)}$`, key: kA(A), easyCheck: false,
          easy: `$X=\\dfrac{${U}}{s(s+${p})(s+${q})}$ をかくす方法で分ける`, calc: { kind: 'ode', x: 't', coef: [1, p + q, p * q], rhs: String(U), init: [[0, 0], [0, 0, 1]] },
          verify: pp => rkCheck(pp, A, [0, 1], U, [0, 0], 0) };
      },
      // 速度（2行め）、B の2行めが1でない
      s2(r) {
        const pq = pq88(r); if (!pq) return null;
        const [p, q] = pq, U = r.pick([1, 2, 3, 4, 6]), A = [[0, 1], [-p * q, -(p + q)]];
        if (turn(r, '88s2', 2) === 0) {
          const c = Q(U, q - p), v = lin([[c, ex(-p)], [Q(-c[0], c[1]), ex(-q)]]);
          return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、はじめ止まっている状態に $u=${U}$ を入れ続ける。速度 $\\dot x(t)$（2行め）`, a: `$\\dot x(t)=${v}$`, key: kA(A), easyCheck: false,
            easy: `2行めは $\\dfrac{${cf(U, 's')}}{s(s+${p})(s+${q})}=\\dfrac{${U}}{(s+${p})(s+${q})}$`, calc: { kind: 'ode', x: 't', coef: [1, p + q, p * q], rhs: '0', init: [[0, 0], [0, U, 1]] },
            verify: pp => rkCheck(pp, A, [0, 1], U, [0, 0], 1) };
        }
        const be = r.pick([2, 3, 4, 5, 10]), cs = step88(p, q, U * be, 0, 0);
        return { q: `$A=${pm(A)}$、$B=${cv([0, be])}$ で、はじめ止まっている状態に $u=${U}$ を入れ続ける。位置 $x(t)$`, a: `$x(t)=${xTeX(cs, p, q)}$`, key: kA(A), easyCheck: false,
          easy: `$BU$ の2行めは $\\dfrac{${U * be}}{s}$ → $X=\\dfrac{${U * be}}{s(s+${p})(s+${q})}$`, calc: { kind: 'ode', x: 't', coef: [1, p + q, p * q], rhs: String(U * be), init: [[0, 0], [0, 0, 1]] },
          verify: pp => rkCheck(pp, A, [0, be], U, [0, 0], 0) };
      },
      // 見かけがちがう：はじめの状態もある、重解
      s3(r) {
        if (turn(r, '88s3', 2) === 0) {
          const pq = pq88(r); if (!pq) return null;
          const [p, q] = pq, kk = r.pick([1, 2, 3]), X = r.pick([1, 2, 3, -1]), U = kk * p * q, A = [[0, 1], [-p * q, -(p + q)]], cs = step88(p, q, U, X, 0);
          if (X === kk) return null;
          return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、はじめ $\\vec x_0=${vt([X, 0])}$ から $u=${U}$ を入れ続ける。位置 $x(t)$`, a: `$x(t)=${xTeX(cs, p, q)}$`, key: kA(A), easyCheck: false,
            easy: `$\\vec x_0+BU$ は $${vt([X, `\\frac{${U}}{s}`])}$。1行めは $\\dfrac{${X}(s+${p + q})+\\frac{${U}}{s}}{(s+${p})(s+${q})}$`, calc: { kind: 'ode', x: 't', coef: [1, p + q, p * q], rhs: String(U), init: [[0, X], [0, 0, 1]] },
            verify: pp => rkCheck(pp, A, [0, 1], U, [X, 0], 0) };
        }
        const p = r.pick([1, 2, 3, 4]), U = r.pick([1, 2, 4, 8, 9, 16]), A = [[0, 1], [-p * p, -2 * p]];
        const x = lin([[Q(U, p * p), ''], [Q(-U, p * p), ex(-p)], [Q(-U, p), 't' + ex(-p)]]);
        return { q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、はじめ止まっている状態に $u=${U}$ を入れ続ける。位置 $x(t)$`, a: `$x(t)=${x}$`, key: kA(A), easyCheck: false,
          easy: `$X=\\dfrac{${U}}{s(s+${p})^2}$。$\\dfrac{1}{(s+${p})^2}$ の項から $te^{${-p}t}$`, calc: { kind: 'ode', x: 't', coef: [1, 2 * p, p * p], rhs: String(U), init: [[0, 0], [0, 0, 1]] },
          verify: pp => rkCheck(pp, A, [0, 1], U, [0, 0], 0) };
      },
      // わな：入れるものがない（9-87）
      trap(r) {
        const dbl = r.chance(0.4);
        if (dbl) {
          const p = r.pick([1, 2, 3, 5]), A = [[0, 1], [-p * p, -2 * p]];
          return dest({ q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、何も入れず（$u=0$）、はじめ $(1,\\ 0)$ の位置 $x(t)$`, a: `$x(t)=(1+${p === 1 ? '' : p}t)${ex(-p)}$`, key: kA(A),
            calc: { kind: 'ode', x: 't', coef: [1, 2 * p, p * p], init: [[0, 1], [0, 0, 1]] }, verify: pp => rkCheck(pp, A, null, 0, [1, 0], 0) }, '9-88',
            '入れるものがないので、$BU$ の分はない。$e^{At}$ の1行め1列め（重解）', ['9-87']);
        }
        const pq = pq88(r); if (!pq) return null;
        const [p, q] = pq, A = [[0, 1], [-p * q, -(p + q)]], cs = step88(p, q, 0, 1, 0);
        return dest({ q: `$A=${pm(A)}$、$B=${cv([0, 1])}$ で、何も入れず（$u=0$）、はじめ $(1,\\ 0)$ の位置 $x(t)$`, a: `$x(t)=${xTeX(cs, p, q)}$`, key: kA(A),
          calc: { kind: 'ode', x: 't', coef: [1, p + q, p * q], init: [[0, 1], [0, 0, 1]] }, verify: pp => rkCheck(pp, A, null, 0, [1, 0], 0) }, '9-88',
          '入れるものがないので、$BU$ の分はない。$e^{At}$ の1行め1列めを $(sI-A)^{-1}$ からもどす', ['9-87']);
      },
    },
  });

  // ================================================================ 9-89
  const s4 = d => Math.sin(d * Math.PI / 180).toFixed(4);   // 教科書の4けた（W-2）
  const F89 = [100, 200, 250, 300, 400, 500, 600, 750, 800, 1000, 1200, 1250, 1500, 2000, 2500, 3000];
  const TAU89 = [0.05, 0.1, 0.2, 0.25, 0.5];
  // 消し残り 2 sin(θ/2)：ちょうどの値（θ=60・90・120・180）なら TeX、ほかは「約」と sin の値
  function rem89(th) {
    const ex0 = { 60: '1', 90: '\\sqrt{2}', 120: '\\sqrt{3}', 180: '2' }[th];
    if (ex0) return { a: `$${ex0}$`, given: '', v: 2 * Math.sin(th * Math.PI / 360) };
    const h = r9(th / 2), sv = s4(h), k = 2 * sv < 0.1 ? 3 : 2, s = agree(2 * sv, 2 * Math.sin(h * Math.PI / 180), k);
    if (s == null || +sv === 0) return null;
    return { a: `約 $${s}$`, given: `$\\sin${nf(h)}^{\\circ}=${sv}$、小数第${k}位まで`, v: +s };
  }
  const remCheck = (p, v) => near(valsOf(p.a)[0][0], v, 1e-9) || `消し残り ${p.a} が ${v} でない`;
  add({
    id: '9-89', part: 6, chap: '9-12③', stars: 1,
    title: 'ノイズキャンセリングの消し残りは $\\lvert1-e^{-j\\theta}\\rvert=2\\sin\\frac{\\theta}{2}$、$\\theta=360^{\\circ}\\times$周波数$\\times$おくれ',
    mark: 'おくれて出す反対の音。「おくれの角」「消し残り」。',
    futsu: ['もとの音 $\\sin\\omega t$ とおくれた音を', '時刻ごとにたした表を作り、', 'いちばん大きい値をさがす'],
    raku: ['おくれ $0.1\\,\\mathrm{ms}$、$1000\\,\\mathrm{Hz}$ → $\\theta=36^{\\circ}$', '消し残り $2\\sin18^{\\circ}\\approx0.62$（$\\sin18^{\\circ}=0.309$）', '$200\\,\\mathrm{Hz}$ なら $\\theta=7.2^{\\circ}$、約0.13'],
    why: '反対の音がおくれ $L$ だけおくれると、回る矢印で $1-e^{-j\\theta}$（$\\theta=\\omega L$）が残る（6-10・9-12③）。2つの長さ1の矢印の差なので、頂角 $\\theta$ の二等辺三角形の底辺で、長さは $2\\sin\\frac{\\theta}{2}$。$\\theta$ は「1秒に回る回数×おくれの時間×$360^{\\circ}$」。',
    caution: 'ms は $\\frac{1}{1000}$ 秒に直してからかける（$1000\\times0.0001=0.1$ 周）。同じおくれでも、高い音ほど $\\theta$ が大きく、消し残りがふえる（低い音ほど消える）。$\\theta=60^{\\circ}$ で消し残り1（もとと同じ大きさ）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '20mm', s3: '20mm', trap: '20mm' },
    fits(q) { return /ノイズキャンセリング|雑音/.test(q) && !/dB/.test(q); },
    steps: {
      // おくれの角
      s1(r) {
        const f = r.pick(F89), tau = r.pick(TAU89), th = r9(360 * f * tau / 1000);
        if (th > 180 || decs(th) > 1 || th === 36 || th === 7.2) return null;
        return { q: `おくれ $${U(nf(tau), 'ms')}$ で反対の音を出すノイズキャンセリング。$${U(f, 'Hz')}$ の雑音でのおくれの角 $\\theta$（°）`, a: `$${nf(th)}$`, key: `${f}|${tau}`, easyCheck: false,
          easy: `$360\\times${f}\\times${nf(tau / 1000)}=${nf(th)}$`, verify: p => near(valsOf(p.a)[0][0], 360 * f * tau / 1000) || '角がちがう' };
      },
      // 消し残り
      s2(r) {
        const f = r.pick(F89), tau = r.pick(TAU89), th = r9(360 * f * tau / 1000);
        if (th > 180 || decs(th) > 1 || th === 36 || th === 7.2) return null;
        const m = rem89(th); if (!m) return null;
        return { q: `おくれ $${U(nf(tau), 'ms')}$ のノイズキャンセリングで、$${U(f, 'Hz')}$ の雑音の消し残り（もとの雑音を1として${m.given ? '。' + m.given : ''}）`, a: m.a, key: `${f}|${tau}`, easyCheck: false,
          easy: `$\\theta=${nf(th)}^{\\circ}$、$2\\sin${nf(th / 2)}^{\\circ}$`, verify: p => remCheck(p, m.v) };
      },
      // 見かけがちがう：おくれをマイクまでの距離から、周波数を周期で
      s3(r) {
        if (turn(r, '89s3', 2) === 0) {
          const d = r.pick([1.7, 3.4, 6.8, 8.5, 17]), tau = r9(d / 34), f = r.pick(F89), th = r9(360 * f * tau / 1000);
          if (th > 180 || decs(th) > 1 || th === 36) return null;
          const m = rem89(th); if (!m) return null;
          return { q: `雑音を拾うマイクから耳までの $${U(nf(d), 'cm')}$ を音（$${U(340, 'm/s')}$）が進む時間だけ、反対の音がおくれる。$${U(f, 'Hz')}$ の雑音の消し残り（もとを1として${m.given ? '。' + m.given : ''}）`,
            a: m.a, key: `${f}|${tau}`, easyCheck: false, easy: `おくれ $${nf(d / 100)}\\div340=${nf(tau / 1000)}$ s、$\\theta=${nf(th)}^{\\circ}$`, verify: p => remCheck(p, m.v) };
        }
        const T = r.pick([0.5, 1, 2, 4, 5, 10]), tau = r.pick(TAU89), th = r9(360 * tau / T);
        if (th > 180 || decs(th) > 1 || th === 36 || th === 7.2) return null;
        return { q: `周期 $${U(nf(T), 'ms')}$ の雑音を、おくれ $${U(nf(tau), 'ms')}$ の反対の音で消す。おくれの角 $\\theta$（°）`, a: `$${nf(th)}$`, key: `${r9(1000 / T)}|${tau}`, easyCheck: false,
          easy: `おくれは周期の $${nf(tau / T)}$ 倍。$360\\times${nf(tau / T)}=${nf(th)}$`, verify: p => near(valsOf(p.a)[0][0], 360 * tau / T) || '角がちがう' };
      },
      // わな：何 dB か（9-66）
      trap(r) {
        const [x, lg] = r.pick([['0.62', '-0.2076'], ['0.31', '-0.5086'], ['0.5', '-0.3010'], ['0.25', '-0.6021'], ['0.1', ''], ['0.063', '-1.2007']]);
        const v = lg ? 20 * +lg : -20, s = lg ? agree(v, 20 * Math.log10(+x), 1) : '-20'; if (s == null) return null;
        return dest({ q: `ノイズキャンセリングで、雑音の大きさが $${x}$ 倍になった。何 dB か${lg ? `（$\\log_{10}${x}=${lg}$、小数第1位まで）` : ''}`, a: lg ? `約 $${s}$` : '$-20$', key: `dB|${x}`,
          verify: p => near(valsOf(p.a)[0][0], +s, 1e-9) || 'dB がちがう' }, '9-89',
          `消し残りではなく、倍率の dB。$20\\log_{10}${x}${lg ? `=20\\times(${lg})` : ''}$`, ['9-66']);
      },
    },
  });

  // ================================================================ 9-90
  const E90 = [5, 6, 9, 10, 12, 20, 24], R90 = [1, 2, 2.5, 4, 5, 10, 20], C90 = [50, 100, 200, 250, 400, 500, 1000];
  // t/τ の e（1/τ が整数なら e^{-kt}、ほかは e^{-t/τ}）
  const eTau = tau => (isInt(1 / tau) ? ex(-r9(1 / tau)) : `e^{-t/${nf(tau)}}`);
  function rc90(r) {
    for (let k = 0; k < 60; k++) {
      const E = r.pick(E90), R = r.pick(R90), C = r.pick(C90), I0 = r9(E / R), tau = r9(R * C / 1000);
      if (decs(I0) > 2 || decs(tau) > 2 || (E === 6 && R === 3 && C === 200) || tau === 0.6) continue;
      return { E, R, C, I0, tau };
    }
    return null;
  }
  const BOOK90 = '$\\dfrac{E}{s}=\\Bigl(R+\\dfrac{1}{sC}\\Bigr)I(s)$';
  const rcTxt = g => `$E=${U(g.E, 'V')}$、$R=${U(nf(g.R), 'k\\Omega')}$、$C=${U(g.C, '\\mu F')}$`;
  add({
    id: '9-90', part: 6, chap: '9-13⑯⑱', stars: 1,
    title: '専門書の式は「名前の段 → 記号を訳す → 実際の操作 → 数で確かめる」の4つの手順で',
    mark: '$\\dfrac{E}{s}=\\Bigl(R+\\dfrac{1}{sC}\\Bigr)I(s)$ のような専門書の式。',
    futsu: ['回路の微分方程式を自分で立て直し、', '$\\dfrac{\\dd i}{\\dd t}$ の式を変数分離で解いて、', 'はじめの値から定数を決める'],
    raku: ['$E=6\\,\\mathrm V$、$R=3\\,\\mathrm{k\\Omega}$、$C=200\\,\\mathrm{\\mu F}$', '$I(s)=\\dfrac ER\\cdot\\dfrac{1}{s+\\frac{1}{RC}}$', '→ $i=2e^{-t/0.6}$ mA（$t=0$ で $2\\,\\mathrm{mA}$、時定数 $0.6\\,\\mathrm s$）'],
    why: '名前の段：大文字の $I(s)$ は電流 $i(t)$ のラプラス変換、$\\dfrac Es$ はずっと $E$ の電圧、$\\dfrac{1}{sC}I(s)$ はコンデンサーの電圧（積分は $s$ でわる）。実際の操作は、わり算で $I(s)$ を出し、$\\dfrac{1}{s+a}\\to e^{-at}$ の表を引くだけ（9-13⑯⑱）。数で確かめる：$t=0$ の値 $\\dfrac ER$ と時定数 $RC$。',
    caution: '$\\mathrm{k\\Omega}$ と $\\mathrm{\\mu F}$ の時定数は、$R\\,\\mathrm{k\\Omega}\\times C\\,\\mathrm{\\mu F}=RC\\times10^{-3}$ 秒。電流は $\\dfrac{E}{R\\,\\mathrm{k\\Omega}}$ なので mA。コイルの式（$R+sL$）では、電流は0から $\\dfrac ER$ に向かってふえる形（$1-e^{-t/\\tau}$）になる。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '34mm', s2: '34mm', s3: '40mm', trap: '20mm' }, boxh: { trap: '11mm' },
    fits(q) { return /I\(s\)/.test(q) && /i\(t\)|v_C\(t\)|時定数|はじめの電流|秒後/.test(q) && !/j\\omega|倍率/.test(q); },
    steps: {
      // 電流 i(t)
      s1(r) {
        const g = rc90(r); if (!g) return null;
        return { q: `${BOOK90} で、${rcTxt(g)} のときの電流 $i(t)$〔mA〕`, a: `$i(t)=${g.I0 === 1 ? '' : nf(g.I0)}${eTau(g.tau)}$`, key: `${g.E}|${g.R}|${g.C}`, easyCheck: false,
          easy: `$I(s)=${nf(g.I0)}\\cdot\\dfrac{1}{s+${nf(r9(1 / g.tau))}}$`, calc: { kind: 'ode', x: 't', coef: [1, r9(1 / g.tau)], init: [[0, g.I0]] } };
      },
      // はじめの電流と時定数・時定数の時刻の電流
      s2(r) {
        const g = rc90(r); if (!g) return null;
        if (turn(r, '90s2', 2) === 0) {
          return { q: `${BOOK90} で、${rcTxt(g)} のときの、はじめの電流（mA）と時定数（s）`, a: `$${U(nf(g.I0), 'mA')}$、$${U(nf(g.tau), 's')}$`, key: `${g.E}|${g.R}|${g.C}`, easyCheck: false,
            easy: `$\\dfrac ER=${nf(g.I0)}$、$RC=${nf(g.tau)}$`, verify: p => { const v = valsOf(p.a); return (v.length === 2 && near(v[0][0], g.E / g.R) && near(v[1][0], g.R * g.C / 1000)) || '値がちがう'; } };
        }
        const k = r.pick([1, 2]), ev = k === 1 ? '0.3679' : '0.1353', s = agree(g.I0 * ev, g.I0 * Math.exp(-k), 3); if (s == null) return null;
        return { q: `${BOOK90} で、${rcTxt(g)} のとき、$${nf(k * g.tau)}$ 秒後の電流（mA。$e^{-${k}}=${ev}$、小数第3位まで）`, a: `約 $${s}$`, key: `${g.E}|${g.R}|${g.C}`, easyCheck: false,
          easy: `$i=${nf(g.I0)}${eTau(g.tau)}$、時定数の${k}倍で $e^{-${k}}$ 倍`, verify: p => near(valsOf(p.a)[0][0], +s, 1e-9) || '値がちがう' };
      },
      // 見かけがちがう：コイルの式、コンデンサーの電圧
      s3(r) {
        if (turn(r, '90s3', 2) === 0) {
          const E = r.pick([5, 6, 10, 12, 20]), R = r.pick([2, 4, 5, 10, 20]), L = r.pick([0.1, 0.2, 0.5, 1, 2]), a = r9(R / L), I = r9(E / R);
          if (!isInt(a) || decs(I) > 2) return null;
          return { q: `$\\dfrac{E}{s}=(R+sL)I(s)$ で、$E=${U(E, 'V')}$、$R=${U(R, '\\Omega')}$、$L=${U(nf(L), 'H')}$ のときの電流 $i(t)$〔A〕`, a: `$i(t)=${nf(I)}(1-${ex(-a)})$`, key: `RL|${E}|${R}|${L}`, easyCheck: false,
            easy: `$I(s)=\\dfrac{E}{s(R+sL)}=${nf(I)}\\Bigl(\\dfrac1s-\\dfrac{1}{s+${a}}\\Bigr)$`, calc: { kind: 'ode', x: 't', coef: [1, a], rhs: String(r9(E / L)), init: [[0, 0]] } };
        }
        const g = rc90(r); if (!g) return null;
        return { q: `${BOOK90} と $V_C(s)=\\dfrac{1}{sC}I(s)$ で、${rcTxt(g)} のときのコンデンサーの電圧 $v_C(t)$〔V〕`, a: `$v_C(t)=${g.E}(1-${eTau(g.tau)})$`, key: `${g.E}|${g.R}|${g.C}|V`, easyCheck: false,
          easy: `$V_C(s)=\\dfrac{E}{s(sRC+1)}=${g.E}\\Bigl(\\dfrac1s-\\dfrac{1}{s+${nf(r9(1 / g.tau))}}\\Bigr)$`, calc: { kind: 'ode', x: 't', coef: [1, r9(1 / g.tau)], rhs: String(r9(g.E / g.tau)), init: [[0, 0]] } };
      },
      // わな：s=jω を入れた倍率（9-65）
      trap(r) {
        const [R, L] = r.pick([[3, 14], [3, 6], [6, 18], [6, 2], [8, 16], [8, 4], [5, 22], [4, 13], [12, 15]]), X = L - 10, Z = Math.hypot(R, X);
        return dest({ q: `専門書の式 $V(s)=\\Bigl(R+sL+\\dfrac{1}{sC}\\Bigr)I(s)$ に $s=j\\omega$ を入れる。$R=${U(R, '\\Omega')}$、$L=${U(L, 'mH')}$、$C=${U(100, '\\mu F')}$、$\\omega=${U(1000, 'rad/s')}$ での電流の倍率 $\\Bigl\\lvert\\dfrac IV\\Bigr\\rvert$〔A/V〕`,
          a: `$\\dfrac{1}{${Z}}$`, key: `jw|${R}|${L}`, verify: p => { const z = [R, 1000 * L / 1000 - 1 / (1000 * 100e-6)]; return near(valsOf(p.a)[0][0], 1 / Math.hypot(...z)) || '倍率がちがう'; } }, '9-90',
          `逆変換ではなく、$s=j\\omega$ を入れた倍率。$R+j\\bigl(\\omega L-\\frac{1}{\\omega C}\\bigr)=${R}${X < 0 ? '-' : '+'}${Math.abs(X)}j$、大きさ $${Z}$`, ['9-65']);
      },
    },
  });

  // ================================================================ 9-98
  const EX98 = [[[0, 1], [4, 0]], [[-0.1, 0], [0, -0.2]]];
  const bad98 = A => EX98.some(B => exLike(A, B));
  const detBAB = (A, B) => { const AB = mulv(A, B); return r9(B[0] * AB[1] - AB[0] * B[1]); };
  // 可制御でない組：B が A の固有ベクトル（AB=λB）。B=(1, m)
  function unctrl(r) {
    for (let k = 0; k < 60; k++) {
      const m = r.pick([0, 1, -1, 2, -2]), B = [1, m], a = r.int(-4, 3), b = r.pick([-2, -1, 1, 2, 3]), l = a + b * m, d = r.int(-4, 3), c = l * m - d * m;
      const A = [[a, b], [c, d]];
      if (Math.abs(c) > 9 || (c === 0 && b === 0) || bad98(A)) continue;
      return { A, B };
    }
    return null;
  }
  function ctrl(r) {
    for (let k = 0; k < 60; k++) {
      const A = [[r.int(-4, 2), r.pick([-2, -1, 1, 2, 3])], [r.pick([-3, -2, -1, 0, 1, 2]), r.int(-4, 2)]], B = r.pick([[0, 1], [1, 0], [1, 1], [1, -1], [2, 1]]);
      if (detBAB(A, B) === 0 || bad98(A)) continue;
      return { A, B };
    }
    return null;
  }
  const ctlAns = (A, B) => `$${nf(detBAB(A, B))}$、${detBAB(A, B) !== 0 ? '可制御' : '可制御でない'}`;
  // 答えの行列式とことばを、(B AB) を作り直して確かめる
  function ctlCheck(p, A, B) {
    const AB = mulv(A, B), M2 = [[B[0], AB[0]], [B[1], AB[1]]], d = det2(M2), v = valsOf(p.a.replace(/、?可制御.*$/, ''));
    if (v.length && !near(v[0][0], d, 1e-9)) return `行列式が ${d} でない`;
    const say = /可制御でない/.test(p.a) ? false : /可制御/.test(p.a) ? true : null;
    return say === (Math.abs(d) > 1e-12) || '可制御かがちがう';
  }
  const eqU = (A, B, uu) => [0, 1].map(i => `$\\dot x_${i + 1}=${sum([cf(A[i][0], 'x_1'), cf(A[i][1], 'x_2'), cf(B[i], uu)])}$`).join('、');
  add({
    id: '9-98', part: 6, chap: '9-10⑧（せいかく）', stars: 1,
    title: '可制御性：$B$ と $AB$ を並べた行列の行列式が0でない',
    mark: '入れるもの $u$ で、どの状態にも動かせるか（可制御か）。',
    futsu: ['$k_1$・$k_2$ をいろいろ変えて $A-BK$ の', '固有値を計算し、好きな場所に', '置けるかどうかをためす'],
    raku: ['倒立振子 $A=\\begin{pmatrix}0&1\\\\4&0\\end{pmatrix}$、$B=\\begin{pmatrix}0\\\\1\\end{pmatrix}$', '→ $AB=\\begin{pmatrix}1\\\\0\\end{pmatrix}$、$\\det\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}=-1$ で可制御', 'つながっていない2つの部屋、ヒーター1つ → $\\det=0$'],
    why: '$u$ がどの式にも直接・間接に入って、状態を好きな向きに動かせることを可制御という（9-10⑧）。2×2 では、$B$ と、それが1歩で動く向き $AB$ が平行でなければ（並べた行列の行列式が0でなければ）、2つの向きを組み合わせてどこへでも動かせる。可制御なら、$A-BK$ の固有値を好きな場所に置ける（極配置）。',
    caution: '$\\begin{pmatrix}B&AB\\end{pmatrix}$ は、1列めが $B$、2列めが $AB$（$BA$ ではない。$B$ は1列なので $BA$ は計算できない）。$B$ が $A$ の固有ベクトルなら $AB=\\lambda B$ で平行になり、可制御でない。',
    counts: { s1: 2, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '30mm', s2: '30mm', s3: '24mm', trap: '34mm' },
    fits(q) { return /可制御/.test(q); },
    steps: {
      // A と B が書いてある
      s1(r) {
        const yes = peek(r, '98s1', 2) === 0, g = yes ? ctrl(r) : unctrl(r); if (!g) return null;
        adv(r, '98s1', 2);
        return { q: `$A=${pm(g.A)}$、$B=${cv(g.B)}$ は可制御か（$B$・$AB$ の行列式も）`, a: ctlAns(g.A, g.B), key: kA(g.A), easyCheck: false,
          easy: `$AB=${cv(mulv(g.A, g.B))}$`, verify: p => ctlCheck(p, g.A, g.B) };
      },
      // 式で書いてある（連立の式・2階の式）
      s2(r) {
        const yes = peek(r, '98s2', 2) === 0;
        if (yes && turn(r, '98s2k', 2) === 0) {
          const b = r.int(1, 8), c = r.int(1, 12), be = r.pick([1, 2, 3, 0.5]), A = [[0, 1], [-c, -b]], B = [0, be];
          adv(r, '98s2', 2);
          return { q: `$${ode2(1, b, c, 'x')}=${cf(be, 'u')}$（状態 $(x,\\ \\dot x)$）は可制御か（$B$・$AB$ の行列式も）`, a: ctlAns(A, B), key: kA(A) + '|' + B, easyCheck: false,
            easy: `$B=${cv(B)}$、$AB=${cv(mulv(A, B))}$`, verify: p => ctlCheck(p, A, B) };
        }
        const g = yes ? ctrl(r) : unctrl(r); if (!g) return null;
        adv(r, '98s2', 2);
        return { q: `${eqU(g.A, g.B, 'u')} は可制御か（$B$・$AB$ の行列式も）`, a: ctlAns(g.A, g.B), key: kA(g.A) + '|' + g.B, easyCheck: false,
          easy: `$A=${pm(g.A)}$、$B=${cv(g.B)}$、$AB=${cv(mulv(g.A, g.B))}$`, verify: p => ctlCheck(p, g.A, g.B) };
      },
      // 見かけがちがう：水そう・部屋の場面（可制御かだけ）
      s3(r) {
        const yes = peek(r, '98s3', 2) === 0, k = turn(r, '98s3k', 2);
        let A, B, q;
        if (k === 0) {
          const c = r.pick([0.1, 0.2, 0.05]); A = [[-c, c], [c, -c]];
          B = yes ? [0.01, 0] : [0.01, 0.01];
          q = `同じ形の2つの水そうを管でつないだ式 $\\dot h_1=-${nf(c)}(h_1-h_2)${yes ? '+0.01q' : '+0.01q'}$、$\\dot h_2=${nf(c)}(h_1-h_2)${yes ? '' : '+0.01q'}$（$u=q$。${yes ? '左の水そうだけに入れる' : '両方に同じだけ入れる'}）は、可制御か`;
        } else {
          const p1 = r.pick([0.1, 0.2, 0.3]), p2 = r.pick([0.1, 0.2, 0.4]), cc = r.pick([0.1, 0.05]);
          A = yes ? [[r9(-p1 - cc), cc], [cc, r9(-p2 - cc)]] : [[-p1, 0], [0, -p2]]; B = [1, 0];
          if (!yes && p1 === p2) return null;
          q = `${yes ? 'かべでつながった' : 'つながっていない'}2つの部屋の温度の式 ${eqU(A, B, 'u')}（ヒーター $u$ は部屋1だけ）は、可制御か`;
        }
        if (bad98(A)) return null;
        adv(r, '98s3', 2);
        return { q, a: yes ? '可制御' : '可制御でない', key: kA(A) + '|' + B, easyCheck: false,
          easy: `$AB=${cv(mulv(A, B).map(r9))}$、$\\det\\begin{pmatrix}B&AB\\end{pmatrix}=${nf(detBAB(A, B))}$`, verify: p => ctlCheck(p, A, B) };
      },
      // わな：何も入れないとき落ち着くか（9-79）
      trap(r) {
        const g = r.chance(0.5) ? ctrl(r) : unctrl(r); if (!g) return null;
        const a = eigAns(g.A); if (!a) return null;
        return dest({ q: `$A=${pm(g.A)}$、$B=${cv(g.B)}$ の状態方程式で、何も入れないとき（$u=0$）$\\dot{\\vec x}=A\\vec x$ は落ち着くか（固有値も）`, a, key: kA(g.A) + '|' + g.B, verify: p => eigStableCheck(p, g.A) }, '9-98',
          '入れるもので動かせるかではなく、何もしないときの動き。$B$ は使わず、$A$ の固有値の実部を見る', ['9-79']);
      },
    },
  });

  // ================================================================ 9-99
  const EX99 = [[[0, 1], [-1, 0]], [[0, 1], [-2, -3]]];
  const bad99 = A => EX99.some(B => exLike(A, B));
  // 答え（t の式でも数でもよい）を、数の det e^{At} とくらべる
  function detCheck(p, A, ts) {
    // 大きな t では打ち消しあいで数がくずれるので、t/n の行列式の n 乗にする（det e^{At}=(det e^{At/n})^n）
    for (const t of ts || [0.37, 1.13]) { const n = Math.max(1, Math.ceil(Math.abs(t) * 20)), w = det2(expmNum(A, t / n)) ** n, g = exprAt(p.a, t); if (!near(g, w, 1e-7)) return `t=${t} で ${w} にならない`; }
    return true;
  }
  add({
    id: '9-99', part: 6, chap: '9-11⑫（もっと）', stars: 1,
    title: '$\\det e^{At}=e^{(a+d)t}$（ななめの和で、面積の倍率）',
    mark: '$e^{At}$ の行列式、状態の広がり（面積）が何倍になるか。',
    futsu: ['$e^{At}$ の4つの成分を求めてから、', '$ad-bc$ を計算して、', '$e$ の積をまとめる'],
    raku: ['回転（ばね）$\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$：$a+d=0$ → $1$', '車A $\\begin{pmatrix}0&1\\\\-2&-3\\end{pmatrix}$：$a+d=-3$ → $e^{-3t}$', '（$e^{At}$ を作らなくてよい）'],
    why: '対角化すると $\\det e^{At}=\\det e^{Dt}=e^{\\lambda_1t}e^{\\lambda_2t}=e^{(\\lambda_1+\\lambda_2)t}$。特性方程式 $\\lambda^2-(a+d)\\lambda+(ad-bc)=0$ の2つの解の和は $a+d$ なので、$\\det e^{At}=e^{(a+d)t}$（9-11 もっと知りたい）。行列式は「面積が何倍になるか」（7-4）なので、ななめの和が負なら、状態の広がりは小さくなる。',
    caution: '$e^{\\det A\\cdot t}$ ではない（使うのは、ななめの和 $a+d$）。$e^{At}$ の対角の和（トレース）は $e^{\\lambda_1t}+e^{\\lambda_2t}$ で、これとは別のもの。ばね・送電線のように $a+d=0$ なら、いつも1（$\\cos^2t+\\sin^2t=1$、$\\cosh^2-\\sinh^2=1$）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '20mm', trap: '30mm' },
    fits(q) { return /\\det e\^\{At\}|面積.*何倍/.test(q); },
    steps: {
      // A の det e^{At}
      s1(r) {
        for (let k = 0; k < 30; k++) {
          const A = [[r.int(-6, 3), r.pick([-3, -2, -1, 1, 2, 4])], [r.pick([-5, -2, -1, 1, 3]), r.int(-6, 2)]], tr = tr2(A);
          if (tr === 0 || tr === -3 || bad99(A)) continue;
          return { q: `$A=${pm(A)}$ の $\\det e^{At}$`, a: `$${ex(tr)}$`, key: kA(A), easyCheck: false, easy: `$a+d=${tr}$`,
            calc: { kind: 'fn', want: `exp(${tr}*t)`, vars: ['t'] }, verify: p => detCheck(p, A) };
        }
        return null;
      },
      // 時刻を決めた値、2階の式から
      s2(r) {
        if (turn(r, '99s2', 2) === 0) {
          const A = [[r.int(-4, 1), r.pick([-2, -1, 1, 3])], [r.pick([-3, -1, 2]), r.int(-4, 1)]], tr = tr2(A), T = r.pick([0.5, 1, 2, 3, 5]);
          if (tr === 0 || tr === -3 || bad99(A) || decs(tr * T) > 1 || Math.abs(tr * T) > 8) return null;
          return { q: `$A=${pm(A)}$ の、$t=${nf(T)}$ での $\\det e^{At}$（$e$ を残した形で）`, a: `$e^{${nf(r9(tr * T))}}$`, key: kA(A) + '|' + T, easyCheck: false, easy: `$e^{(a+d)t}=e^{${tr}\\times${nf(T)}}$`,
            verify: p => detCheck(p, A, [T]) };
        }
        const b = r.pick([1, 2, 4, 5, 6, 0.5]), c = r.int(1, 10), A = [[0, 1], [-c, -b]];
        if (bad99(A)) return null;
        return { q: `$${ode2(1, b, c, 'x')}=0$ を、状態 $(x,\\ \\dot x)$ の $\\dot{\\vec x}=A\\vec x$ にした。$\\det e^{At}$`, a: `$${ex(-b)}$`, key: kA(A), easyCheck: false, easy: `$A=${pm(A)}$、$a+d=${-b}$`,
          calc: { kind: 'fn', want: `exp(${-b}*t)`, vars: ['t'] }, verify: p => detCheck(p, A) };
      },
      // 見かけがちがう：水そう・回路の状態の広がり（面積）
      s3(r) {
        if (turn(r, '99s3', 2) === 0) {
          const p = r.pick([0.1, 0.2, 0.05]), q = r.pick([0.1, 0.05, 0.3]), A = [[-p, p], [q, -q]], T = r.pick([5, 10, 20]), e = r9(-(p + q) * T);
          if (decs(e) > 1) return null;
          return { q: `水そうの式 $\\dot h_1=-${nf(p)}(h_1-h_2)$、$\\dot h_2=${nf(q)}(h_1-h_2)$（分）で、状態の点 $(h_1,\\ h_2)$ の集まりが作る形の面積は、${T}分後に何倍か`, a: `$e^{${nf(e)}}$`, key: kA(A) + '|' + T, easyCheck: false,
            easy: `$a+d=${nf(r9(-p - q))}$、$e^{${nf(r9(-p - q))}\\times${T}}$`, verify: pp => detCheck(pp, A, [T]) };
        }
        const L = r.pick([0.1, 0.2, 0.5, 1]), R = r.pick([5, 10, 20, 50]), Cu = r.pick([100, 200, 500]), a = r9(R / L);
        if (!isInt(a)) return null;
        const A = [[0, 1e6 / Cu], [-1 / L, -a]];
        return { q: `$L=${LTeX(L)}$、$C=${U(Cu, '\\mu F')}$、$R=${U(R, '\\Omega')}$ の直列の回路（状態 $(v_C,\\ i)$）で、何も入れないときの状態の広がり（面積）が $t$ 秒で何倍になるか（$\\det e^{At}$）`, a: `$${ex(-a)}$`, key: kA(A), easyCheck: false,
          easy: `$A$ のななめは $0$ と $-\\dfrac RL=${-a}$`, calc: { kind: 'fn', want: `exp(${-a}*t)`, vars: ['t'] }, verify: p => detCheck(p, A, [0.001, 0.003]) };
      },
      // わな：対角の和（9-83）
      trap(r) {
        const a = r.pick([-1, -2, -3, -0.5]), d = r.pick([-1, -4, -5, -0.2, 1]); if (a === d) return null;
        const A = [[a, 0], [0, d]];
        return dest({ q: `$A=${pm(A)}$ の $e^{At}$ の、ななめの成分の和（行列式ではない）`, a: `$${ex(a)}+${ex(d)}$`, key: kA(A), calc: { kind: 'fn', want: `exp(${a}*t)+exp(${d}*t)`, vars: ['t'] },
          verify: p => near(exprAt(p.a, 0.7), expmNum(A, 0.7)[0][0] + expmNum(A, 0.7)[1][1], 1e-8) || 'ちがう' }, '9-99',
          `行列式ではなく、ななめの和。対角なので $e^{At}$ のななめは $${ex(a)}$ と $${ex(d)}$`, ['9-83']);
      },
    },
  });

})(globalThis.MONDAI);

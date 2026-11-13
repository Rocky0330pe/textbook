/* 問題集 第9巻　第4部 変換表と逆変換（わざ 9-46〜9-60、9-94・9-95）　組 d
 * 書き方は v8/README.md（第8・9巻）→ v6/README.md・v5/README.md。文は教科書 第9巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 9-6・9-7 の数・ことば・記号にそろえる（$\mathcal L[f(t)]$、$\mathcal L^{-1}[F(s)]$、変換表の行、$s$ のずらし、時間のずらし、ステップ関数 $H(t-t_0)$、
 *   デルタ関数 $\delta(t)$、パルス、たたみこみ $f*g$、初期値の定理・最終値の定理、部分分数、かくす方法、重解、平方完成、分けられない2次式、
 *   分母が0になる $s$、実部の2倍、熱電対のおくれ、2つの水そう）。$H$ はステップ関数だけ（W-14。水位は $h$、変換は $\mathcal L[h_1]$）。
 * 逆変換の答えは $t\geqq0$ の式（$H(t)$ はつけない）。おくれて始まる答え（9-58）は「$t<t_0$ で □、$t\geqq t_0$ で □」の2つの欄（W-4）。
 * 検算：変換の式・もどした式は calc（kind 'fn'。$s$ か $t$ のいくつかの値でくらべる）。want は、問題を作った数とは別の道すじで書く
 *   （変換は表の一般の式 $\frac{n!}{s^{n+1}}$・$\frac{2\omega s}{(s^2+\omega^2)^2}$ に数を入れた形、もどした式は分子・分母の多項式から
 *   「留数」（$\frac{N(p)}{D'(p)}$、重解は微分）を複素数で計算した和）。微分方程式から解く問題は calc（kind 'ode'）。
 *   $\delta(t)$ をふくむ答え（9-59）・2つの欄（9-58）・近似の答え・ことばの答えは verify(p)。
 * 図は 9-49 のステップ3だけ（パルス・階段のグラフ。G.pw。K-2）。プログラムの表示（p.code）は 9-60 のステップ2・3（U-5「表示されたとします」）。
 * 左ページの「楽な形」と目印の例の数（入れかえ・何倍かも）と、教科書 9-6・9-7 の例題・じぶんでとこう・章末問題の式は、同じ見開きの問題に出さない（O-2・S-2・U-2。BAN）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。
 * 見わけようの目印（fits）は、問題の式（p.L に置いた時間の式・$s$ の式・微分方程式。なければ文）を読んで、分母が0になる $s$（重なり・複素数）、
 *   分子の次数、$e^{-st_0}$ を数で調べて決める（教科書の場合分けの表9-6・9-7 と流れ図と同じ問い）。
 * 近似値は目録の一覧の値（$e^{-1}=0.3679$、$e^{-2}=0.1353$、$e^{-3}=0.0498$、$e^{-0.5}=0.6065$。W-2）を文に書き、くいちがう組は出さない（O-4・S-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F, P = M.P;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                         // 0.30000000004 → 0.3
  // 形を順に回す（出せたときだけ次へ進める）：const [k, ok] = alt(r, 'key', 2); … return ok({ … })
  function alt(r, key, n) { const d = r.alts || (r.alts = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return [d[key] % n, p => { if (p) d[key]++; return p; }]; }
  const fq = f => F.tex(f);
  const gcd = (a, b) => F.gcd(Math.abs(a), Math.abs(b));
  const FACT = [1, 1, 2, 6, 24, 120, 720, 5040];
  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない（U-3）。アプリで同じわざを多く出すとき（20問をこえたら）は、よけない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  // わざの登録：1つのステップに同じ答えを3つ出さない（U-3）。楽な形は、ことわりがなければ値をくらべない（途中の式を書くので）
  //   ことばの答え（「ない」など）も数える（「ある・ない」が両方出るように、ステップ3で回す）
  // ステップ1・2 で出した key（ステップ3 で同じ式を見かけだけかえて出さないように。U-2）
  const usedKey = (r, id, key) => !!(r.usedKeys && r.usedKeys.has(id + '|' + key));
  function add(def) {
    for (const k of ['s1', 's2', 's3', 'trap']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => {
        const p = f(r); if (!p) return p;
        if (p.easyCheck == null) p.easyCheck = false;
        if (!ansOK(r, def.id + k, String(p.a), 2, p.key || p.q)) return null;
        // spread：見開き全体（ステップをまたいで）同じ答えの数を spread こまでにする（9-52。R2-13・Y-4）。もう出した key（makeStep が同じ問題としてよける）は数えない
        if (def.spread && k !== 'trap' && !usedKey(r, def.id, p.key || p.q)) {
          const n = nums(p.a), av = n.length === 1 && n[0] != null ? fmt(n[0]) : String(p.a);
          if (!ansOK(r, def.id + 'all', av, def.spread, p.key || p.q)) return null;
        }
        (r.usedKeys || (r.usedKeys = new Set())).add(def.id + '|' + (p.key || p.q));
        return p;
      };
    }
    M.add(def);
  }

  // ---- 文字の式（TeX）
  const sgnJoin = (o, t) => (!o ? t : t.startsWith('-') ? o + t : o + '+' + t);
  // 係数（数か分数 [n, d]）× 本体（'' は定数）の項。first でなければ符号つき
  function cterm(c, body) {
    const v = Array.isArray(c) ? F.val(c) : c;
    if (v === 0) return '';
    const neg = v < 0, a = Array.isArray(c) ? [Math.abs(c[0]), c[1]] : Math.abs(c);
    let cs;
    if (Array.isArray(a)) {
      if (a[1] === 1) cs = String(a[0]);
      else if (body && /^t(?![a-z^_{])/.test(body) && a[0] === 1) return (neg ? '-' : '') + `\\frac{t}{${a[1]}}` + body.slice(1);   // \frac{t}{4}\sin2t

      else cs = `\\frac{${a[0]}}{${a[1]}}`;
    } else cs = fmt(a);
    const one = cs === '1';
    return (neg ? '-' : '') + (body ? (one ? '' : cs) + body : cs);
  }
  // 項の和：[[係数, 本体], …]
  const sumT = terms => terms.reduce((o, [c, b]) => { const t = cterm(c, b); return t ? sgnJoin(o, t) : o; }, '') || '0';
  // e^{-a t}（a は数か分数。shift で t を (t-t0) に）。a=0 なら ''
  function expT(a, t0) {
    const v = Array.isArray(a) ? F.val(a) : a; if (v === 0) return '';
    const arg = t0 ? `(t-${t0})` : 't', av = Math.abs(v), sg = v > 0 ? '-' : '';
    if (Array.isArray(a) && a[1] !== 1) return `e^{${sg}${t0 ? `${a[0] === 1 ? '' : a[0]}(t-${t0})` : (a[0] === 1 ? '' : a[0]) + 't'}/${a[1]}}`;
    return `e^{${sg}${av === 1 ? '' : fmt(av)}${arg}}`;
  }
  const trig = (fn, w, t0) => (t0 ? (w === 1 ? `\\${fn}(t-${t0})` : `\\${fn}\\bigl(${w}(t-${t0})\\bigr)`) : `\\${fn}${w === 1 ? ' t' : w + 't'}`);
  // s の1次式 s+a（a=0 なら s）
  const lin = a => (a === 0 ? 's' : a > 0 ? `s+${fmt(a)}` : `s-${fmt(-a)}`);
  const plin = a => (a === 0 ? 's' : `(${lin(a)})`);
  // s の多項式（係数は数。低い次から）を TeX に
  const polyT = (cs, v) => P.tex(cs.map(c => (Array.isArray(c) ? c : F.fromDec(fmt(c)))), v || 's');
  // 分数 \frac{N}{D}。N が負の定数なら、マイナスを前に
  function frac(N, D) { if (/^-\d+(\.\d+)?$/.test(N)) return `-\\frac{${N.slice(1)}}{${D}}`; return `\\frac{${N}}{${D}}`; }
  const dfrac = (N, D) => frac(N, D).replace('\\frac', '\\dfrac');
  const Linv = X => `$\\mathcal L^{-1}\\left[${X}\\right]$`;
  const Lf = X => `$\\mathcal L[${X}]$`;
  // 多項式（数の配列。低い次から）のかけ算・値
  const pmul = (a, b) => { const o = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { o[i + j] += x * y; })); return o; };
  const padd = (a, b) => Array.from({ length: Math.max(a.length, b.length) }, (_, k) => (a[k] || 0) + (b[k] || 0));
  const pscale = (a, c) => a.map(x => x * c);
  const ptrim = a => { const o = a.slice(); while (o.length > 1 && Math.abs(o[o.length - 1]) < 1e-12) o.pop(); return o; };
  const pval = (a, x) => a.reduceRight((acc, c) => acc * x + c, 0);
  const pclean = a => a.map(x => +x.toFixed(9));
  // 複素数
  const C = (re, im) => [re, im || 0];
  const cadd = (a, b) => C(a[0] + b[0], a[1] + b[1]), cmul = (a, b) => C(a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]);
  const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return C((a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d); };
  const cpval = (a, z) => a.reduceRight((acc, c) => cadd(cmul(acc, z), C(c)), C(0));
  const pder = a => a.slice(1).map((c, k) => c * (k + 1));
  // 留数で、もどした式（calc の want）を作る：N・D は数の多項式（低い次から）、roots は D が0になる s（[re, im, 重なり]）
  //   1回の s=p：N(p)/D'(p) e^{pt}。2回の s=p：D = (s-p)^2 Q として、t の係数 N(p)/Q(p)、e^{pt} の係数 (N/Q)'(p)
  //   答えは複素数の式の文字（j をふくむ）。問題を作った係数（A、B）とは別の道すじ
  function residueWant(N, D, roots) {
    const parts = [];
    const c2 = z => `(${fmt(z[0])}${z[1] >= 0 ? '+' : '-'}${fmt(Math.abs(z[1]))}j)`;
    for (const [re, im, mlt] of roots) {
      const p = C(re, im);
      // Q = D / (s-p)^m（複素数の多項式のわり算）
      let Q = D.map(c => C(c));
      for (let k = 0; k < mlt; k++) { const n = Q.length - 1, o = Array(n).fill(C(0)); let carry = C(0); for (let i = n; i >= 1; i--) { carry = cadd(Q[i], cmul(carry, p)); o[i - 1] = carry; } Q = o; }
      const Qv = z => Q.reduceRight((acc, c) => cadd(cmul(acc, z), c), C(0));
      const Qd = z => Q.slice(1).reduceRight((acc, c, k) => cadd(cmul(acc, z), cmul(c, C(k + 1))), C(0));
      const ex = `e^{${c2(p)}t}`;
      if (mlt === 1) parts.push(`${c2(cdiv(cpval(N, p), Qv(p)))}${ex}`);
      else if (mlt === 2) {
        const Nv = cpval(N, p), Nd = cpval(pder(N), p), q = Qv(p), qd = Qd(p);
        const b = cdiv(Nv, q), a = cdiv(cadd(cmul(Nd, q), cmul(C(-1), cmul(Nv, qd))), cmul(q, q));
        parts.push(`${c2(a)}${ex}`, `${c2(b)}t${ex}`);
      } else throw new Error('3回の重なりは使わない');
    }
    return parts.join('+');
  }

  // ---------------------------------------------------------------- 式を読む部品（見わけようの目印・検算）
  // {…} の中身（i は '{' の位置）
  function brace(s, i) { let d = 0; for (let k = i; k < s.length; k++) { if (s[k] === '{') d++; else if (s[k] === '}' && --d === 0) return [s.slice(i + 1, k), k + 1]; } return null; }
  // 文の中の \mathcal L^{-1}\left[ … \right] の中身。なければ null
  function invInner(q) {
    const i = q.indexOf('\\mathcal L^{-1}'); if (i < 0) return null;
    const j = q.indexOf('\\left[', i); if (j < 0) return null;
    const k = q.indexOf('\\right]', j); if (k < 0) return null;
    return q.slice(j + 6, k);
  }
  // 文の中の \mathcal L[ … ]（逆変換でないもの）の中身
  function fwdInner(q) {
    const m = /\\mathcal L\[/.exec(q); if (!m) return null;
    let d = 0;
    for (let k = m.index + m[0].length - 1; k < q.length; k++) { if (q[k] === '[') d++; else if (q[k] === ']' && --d === 0) return q.slice(m.index + m[0].length, k); }
    return null;
  }
  // s の式（\frac{N}{D} と e^{-ks} の積）を読む：{ t0, N, D }（N・D は数の多項式。低い次から）。読めなければ null
  const POLYCACHE = new Map();
  function polyFit(tex) {
    if (POLYCACHE.has(tex)) return POLYCACHE.get(tex);
    const xs = [0.5, 1.25, 2, 2.75, 3.5, 4.25, 5, 5.75, 6.5], ys = xs.map(x => ev(tex, { s: x }));
    let out = null;
    if (ys.every(y => y != null && isFinite(y))) {
      const n = xs.length, A = xs.map((x, i) => xs.map((_, k) => Math.pow(x, k)).concat(ys[i]));
      for (let c = 0; c < n; c++) {
        let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
        [A[p], A[c]] = [A[c], A[p]];
        for (let i = 0; i < n; i++) if (i !== c) { const f = A[i][c] / A[c][c]; for (let j = c; j <= n; j++) A[i][j] -= f * A[c][j]; }
      }
      const cs = A.map((r, i) => r[n] / r[i]).map(v => (Math.abs(v) < 1e-6 ? 0 : +v.toFixed(6)));
      out = ptrim(cs);
    }
    if (POLYCACHE.size > 3000) POLYCACHE.clear();
    POLYCACHE.set(tex, out);
    return out;
  }
  function ratOf(X) {
    if (!X) return null;
    let t0 = 0;
    X = X.replace(/e\^\{-(\d*)s\}/g, (m, k) => { t0 += k ? +k : 1; return ' '; }).replace(/\\times|\\cdot/g, ' ');
    const i = X.search(/\\d?frac\{/);
    if (i < 0) { const N = polyFit(X.trim() || '1'); return N ? { t0, N, D: [1] } : null; }
    const a = brace(X, X.indexOf('{', i)); if (!a) return null;
    const b = brace(X, a[1]); if (!b) return null;
    const pre = X.slice(0, i).trim(), post = X.slice(b[1]).trim();
    if (post) return null;
    let N = polyFit(a[0].trim() || '1'); const D = polyFit(b[0]);
    if (!N || !D) return null;
    if (pre && pre !== '-') { const k = ev(pre); if (k == null) return null; N = pscale(N, k); } else if (pre === '-') N = pscale(N, -1);
    return { t0, N, D };
  }
  // 多項式の根（デュラン・カーナー法）。[re, im, 重なり] の配列
  function rootsOf(D) {
    const n = D.length - 1; if (n < 1) return [];
    const lc = D[n], a = D.map(c => c / lc);
    let z = Array.from({ length: n }, (_, k) => cmul(C(0.4, 0.9), [Math.cos(2.1 * k), Math.sin(2.1 * k)]).map(v => v * (1 + k)));
    for (let it = 0; it < 500; it++) {
      let mv = 0;
      z = z.map((zi, i) => {
        let den = C(1); z.forEach((zj, j) => { if (j !== i) den = cmul(den, cadd(zi, C(-zj[0], -zj[1]))); });
        const d = cdiv(cpval(a, zi), den); mv = Math.max(mv, Math.hypot(...d));
        return cadd(zi, C(-d[0], -d[1]));
      });
      if (mv < 1e-13) break;
    }
    const out = [];
    for (const r of z) {
      const re = Math.abs(r[0]) < 1e-3 ? 0 : r[0], im = Math.abs(r[1]) < 1e-3 ? 0 : r[1];
      const g = out.find(o => Math.hypot(o[0] - re, o[1] - im) < 5e-3);

      if (g) g[2]++; else out.push([re, im, 1]);
    }
    return out;
  }
  // 逆変換の場合（教科書の場合分けの表9-7）：'A'〜'I' と、分母が0になる s の形。読めなければ null
  //   A：表の形そのもの（定数倍をのぞく）、B：ちがう1次式のかけ算、C：重解、D：分けられない2次式1つだけ、E：2次式とほかの因数、F：e^{-st_0}、G：分子の次数が同じ、X：分子の次数が大きい
  function invCase(R) {
    if (!R) return null;
    if (R.t0 > 0) return 'F';
    const dn = R.N.length - 1, dd = R.D.length - 1;
    if (dd < 1) return dn >= 0 && R.N.some(c => c) ? 'X' : null;
    if (dn > dd) return 'X';
    if (dn === dd) return 'G';
    const rs = rootsOf(R.D), cx = rs.filter(r => r[1] !== 0), rl = rs.filter(r => r[1] === 0);
    const Nconst = dn === 0, Ns = dn === 1 && Math.abs(R.N[0]) < 1e-9;
    // 表の形：1つの実数の s（何回でも）で分子が定数。s^2+\omega^2（分子が定数か s だけ）。(s^2+\omega^2)^2 で分子が s だけ
    if (rs.length === 1 && rl.length === 1 && Nconst) return 'A';
    if (cx.length === 2 && rl.length === 0 && cx[0][0] === 0 && cx[0][2] === 1 && (Nconst || Ns)) return 'A';
    if (cx.length === 2 && rl.length === 0 && cx[0][0] === 0 && cx[0][2] === 2 && Ns) return 'A';
    if (!cx.length) return rs.some(r => r[2] > 1) ? 'C' : 'B';
    if (cx.length === 2 && !rl.length && cx[0][2] === 1) return 'D';
    return 'E';
  }
  // 微分方程式の文（$\ddot x+4\dot x+3x=0$、$c\dot v+v=10$ など）を読む：{ coef: [高い階から], rhs: 'const'|'cos'|'t'|'0', c } 。なければ null
  function odeOf(q) {
    for (const m of String(q).matchAll(/\$([^$]*\\dot\s*[a-z][^$]*=[^$]*)\$/g)) {
      const [L, R] = m[1].split('=');
      if (/_\{?\d/.test(L)) return null;   // 連立の式（\dot h_1 など）は読まない
      const two = /\\ddot/.test(L), v = (/\\d?dot\{?\s*([a-z])/.exec(L) || [])[1];
      if (!v) continue;
      const body = L.replace(/\\ddot\{?\s*[a-z]\}?/, 'D').replace(/\\dot\{?\s*[a-z]\}?/, 'E');
      const vars = { D: 0, E: 0, [v]: 0 }, f = o => ev(body, Object.assign({}, vars, o));
      const c0 = f({}), cD = two ? f({ D: 1 }) - c0 : 0, cE = f({ E: 1 }) - c0, cX = f({ [v]: 1 }) - c0;
      if ([c0, cD, cE, cX].some(x => x == null || !isFinite(x))) continue;
      const coef = two ? [cD, cE, cX] : [cE, cX];
      const rhs = /\\cos|\\sin/.test(R) ? 'trig' : /t/.test(R) ? 't' : ev(R) === 0 ? '0' : ev(R) != null ? 'const' : null;
      if (!rhs) continue;
      return { coef, rhs };
    }
    return null;
  }
  // 微分方程式をラプラス変換して解くときの場合（分母＝特性方程式×入れたものの分母）
  function odeCase(o) {
    if (!o) return null;
    let D = o.coef.slice().reverse();          // 低い次から
    if (o.rhs === 'const') D = pmul(D, [0, 1]);
    else if (o.rhs === 't') D = pmul(D, [0, 0, 1]);
    else if (o.rhs === 'trig') D = pmul(D, [1, 0, 1]);
    return invCase({ t0: 0, N: [1, 1], D });   // 分子はふつう1次（はじめの値・入れたもの）。B〜E を見る
  }

  // ---------------------------------------------------------------- 時間の式（変換する前）を読む：場合分けの表9-6
  //   'tbl'（表の1つの項：t^n・sin・cos）、'shift'（e^{-at} とのかけ算）、'delay'（H(t-t0)・δ(t-t0) の1つの項）、'pulse'（ステップの和）、
  //   'tmul'（t と sin・cos のかけ算）、'conv'（たたみこみ）、'sum'（いくつかの項の和）、null
  function fwdCase(f) {
    if (f == null) return null;
    const s = String(f).replace(/\\,|\\left|\\right|\\bigl|\\bigr|\\Bigl|\\Bigr|\\cdot|\s/g, '');
    if (/\*/.test(s)) return 'conv';
    const nH = (s.match(/H\(/g) || []).length, nd = (s.match(/\\delta\(/g) || []).length;
    // 項に分ける（かっこの外の + −）
    const terms = []; let d = 0, k0 = 0;
    for (let k = 0; k < s.length; k++) { const ch = s[k]; if ('({['.includes(ch)) d++; else if (')}]'.includes(ch)) d--; else if ((ch === '+' || ch === '-') && d === 0 && k > k0) { terms.push(s.slice(k0, k)); k0 = k; } }
    terms.push(s.slice(k0));
    if (nH + nd >= 2) return 'pulse';
    if (nH + nd === 1) return terms.length === 1 ? 'delay' : 'sum';
    if (terms.length > 1) return /e\^\{-?\(t/.test(s) ? null : 'sum';
    const t = terms[0].replace(/^[-+]/, '');
    if (/e\^\{[^}]*\(t-/.test(t)) return null;                         // e^{-(t-1)}（H なし）：表の形ではない
    if (/^[\d.]*(\\frac\{[^}]*\}\{[^}]*\})?t\\(sin|cos)/.test(t) || /^[\d.]*\\frac\{t\}\{\d+\}\\(sin|cos)/.test(t)) return 'tmul';
    if (/e\^\{/.test(t) && /\\(sin|cos)|t(\^|\\|e|$)|^[\d.]*t/.test(t.replace(/e\^\{[^}]*\}/, 'E'))) return 'shift';
    if (/e\^\{/.test(t) && /^[\d.]*\\frac\{\\(sin|cos)[^}]*\}\{e\^\{\d*t\}\}$/.test(t)) return 'shift';
    if (/e\^\{/.test(t)) return null;
    if (/^[\d.]*(\\frac\{\d+\}\{\d+\})?(t(\^\{?\d+\}?)?|\\(sin|cos)(\d*t|\\frac\{t\}\{\d+\}|t))$/.test(t)) return 'tbl';
    if (/^\\frac\{t(\^\{?\d+\}?)?\}\{\d+\}$/.test(t)) return 'tbl';
    return null;
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部・巻のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(9).filter(id => {
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
  // 見わけようの目印で読む式：p.L（問題を作ったときに置いた式）があればそれ、なければ文から
  const fwdOf = (q, p) => (p && p.L && p.L.f != null ? p.L.f : fwdInner(q));
  const invOf = (q, p) => (p && p.L && p.L.F != null ? p.L.F : invInner(q));
  const isWords = (q, re) => re.test(q);
  // 答えの数を取り出す（単位 \,\mathrm{…} は除く。「＝」の左は除く）
  const unitless = t => strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '');
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(unitless(t)));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol)) || `答え ${p.a} が ${fmt(v)} でない`; };
  // 「約 $1.90$」の形の答えが、正しい値 v を k けたに丸めた値か（O-4：文に書いた値で計算した値 w も、同じ丸めになること）
  // 10進で丸める（toFixed は 3.9349999…（2進のずれ）を 3.93 にするので、1e-9 を足してから。Y-2・O-4）。tie：文の値で計算するとちょうど5になる組（よける）
  const rd = (x, k) => Math.round(x * 10 ** k + 1e-9) / 10 ** k;
  const fx = (x, k) => rd(x, k).toFixed(k);
  const tie = (x, k) => { const y = x * 10 ** k; return Math.abs(y - Math.floor(y) - 0.5) < 1e-6; };
  function approxIs(p, v, w, k) {
    const n = nums(p.a); if (n.length !== 1) return `答え ${p.a} が読めない`;
    const rv = rd(v, k), rw = rd(w, k);
    if (rv !== rw) return `ほんとうの値 ${v} と文の値 ${w} の丸めがちがう（O-4）`;
    return (near(n[0], rv, 1e-12) && /約/.test(p.a)) || `答え ${p.a} が 約${rv} でない`;
  }
  const EXPV = { 1: 0.3679, 2: 0.1353, 3: 0.0498, 0.5: 0.6065 };   // e^{-k} の文の値（目録の一覧。4けた。W-2）
  const expNote = k => `$e^{-${k === 1 ? 1 : fmt(k)}}=${EXPV[k]}$`;

  // ================================================================ 9-46
  // 時間の式 [種類, 係数, n か ω]：'t'（t^n）・'sin'・'cos'。key は 'tbl|種類|n'（係数は何倍かなので key に入れず、例の何倍かをよける）
  //   BAN：左ページの例（t^4・sin5t・cos2t。何倍かも）。教科書の例題1・じぶんでとこう・章末問題1（係数1のもの）
  const BAN46 = new Set(['t|4', 'sin|5', 'cos|2', 'cos|5']);   // cos5t も例の sin5t と同じ分母なのでよける（R2-14）
  const TEXT46 = new Set(['t|3', 'sin|3', 'cos|3', 't|2', 'sin|5', 'cos|2', 't|4', 'sin|4', 'cos|1']);
  const bad46 = (kind, n, c) => BAN46.has(`${kind}|${n}`) || (c === 1 && TEXT46.has(`${kind}|${n}`));
  const tpow = n => (n === 1 ? 't' : `t^{${n}}`);
  const spow = n => (n === 1 ? 's' : `s^{${n}}`);
  function tab46(kind, c, n) {
    if (kind === 't') {
      const v = c * FACT[n];
      return { f: cterm(c, tpow(n)), F: `\\frac{${v}}{${spow(n + 1)}}`, want: `${c}*${n}!/s^(${n + 1})`, easy: `表の $\\frac{n!}{s^{n+1}}$ で $n=${n}$：$${n}!=${FACT[n]}$${c !== 1 ? `、${c}倍して${v}` : ''}` };
    }
    const w2 = n * n;
    if (kind === 'sin') return { f: cterm(c, trig('sin', n)), F: `\\frac{${c * n}}{s^2+${w2}}`, want: `${c}*${n}/(s^2+${n}^2)`, easy: `$\\frac{\\omega}{s^2+\\omega^2}$ で $\\omega=${n}$。分子は $\\omega$${c !== 1 ? `の${c}倍` : ''}` };
    return { f: cterm(c, trig('cos', n)), F: `\\frac{${c === 1 ? '' : c}s}{s^2+${w2}}`, want: `${c}*s/(s^2+${n}^2)`, easy: `$\\frac{s}{s^2+\\omega^2}$ で $\\omega=${n}$。分子は $s$${c !== 1 ? `の${c}倍` : ''}` };
  }
  add({
    id: '9-46', part: 4, chap: '9-6②③ 例題1', stars: 1,
    title: '表を引く：$t^n$・$\\sin\\omega t$・$\\cos\\omega t$ の行（分子に注意）',
    mark: '$t^n$・$\\sin\\omega t$・$\\cos\\omega t$ の1つの項（場合 A）。「$\\mathcal L[\\ ]$ を求めよう」。',
    futsu: ['定義の積分 $\\int_0^{\\infty}f(t)e^{-st}\\,\\dd t$ を', '書き、$t^n$ なら部分積分を $n$ 回', 'くり返す。$\\sin$・$\\cos$ は', '部分積分を2回して、もとの形にもどす。'],
    raku: ['$\\mathcal L[t^4]=\\frac{4!}{s^5}=\\frac{24}{s^5}$', '$\\mathcal L[\\sin5t]=\\frac{5}{s^2+25}$', '$\\mathcal L[3\\cos2t]=\\frac{3s}{s^2+4}$', '（積分しない。表を引く）'],
    why: '表の行は、9-6 で一度だけ作ってある。$t^n$ は部分積分をくり返すと、分子に $n\\times(n-1)\\times\\cdots\\times1=n!$ がたまる。$\\sin\\omega t$・$\\cos\\omega t$ はオイラーの公式で $\\mathcal L[e^{j\\omega t}]=\\frac{1}{s-j\\omega}$ の実部と虚部に分けると出る（9-6②③）。定数倍は前に出せる（線形）。',
    caution: '$\\sin\\omega t$ の分子は $\\omega$、$\\cos\\omega t$ の分子は $s$。$\\frac{1}{s^2+\\omega^2}$ ではない。$t^n$ の分母は $s^{n+1}$（1つ多い）。$e^{-at}$ がかかっていたら $s$ のずらし（わざ 9-47）、$t$ がかかっていたら $t$ をかける行（わざ 9-50）。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '18mm', s3: '22mm', trap: '24mm' },
    boxh: '10mm',
    fits(q, p) {
      if (/\\int_0\^\{\\infty\}/.test(q) && /e\^\{-st\}/.test(q)) { const m = /\\int_0\^\{\\infty\}(.*?)e\^\{-st\}/.exec(q); return !!m && fwdCase(m[1]) === 'tbl'; }
      return fwdCase(fwdOf(q, p)) === 'tbl';
    },
    steps: {
      // 係数1：t^n・sin・cos
      s1(r) {
        const kind = r.pick(['t', 'sin', 'cos']), n = kind === 't' ? r.pick([1, 2, 3, 5, 6]) : r.int(1, 9);
        if (bad46(kind, n, 1)) return null;
        const T = tab46(kind, 1, n);
        return { q: Lf(T.f), a: `$${T.F}$`, easy: T.easy, key: `tbl|${kind}|${n}`, L: { f: T.f }, calc: { kind: 'fn', vars: ['s'], want: T.want } };
      },
      // 係数がつく（定数倍は前に出す）・$\frac{t^n}{n!}$
      s2(r) {
        const [k, ok] = alt(r, '46s2', 2);
        const kind = k ? r.pick(['sin', 'cos']) : 't', n = kind === 't' ? r.int(1, 5) : r.int(1, 8);
        if (k === 0 && r.chance(0.35) && n >= 2) {
          // t^n/n! → 1/s^{n+1}
          if (bad46('t', n, 2)) return null;
          const f = `\\frac{${tpow(n)}}{${FACT[n]}}`;
          return ok({ q: Lf(f), a: `$\\frac{1}{${spow(n + 1)}}$`, key: `tbl|t|${n}`, L: { f }, easy: `$\\frac{1}{${FACT[n]}}\\times\\frac{${n}!}{${spow(n + 1)}}$。$${n}!=${FACT[n]}$ が消える`, calc: { kind: 'fn', vars: ['s'], want: `1/${n}!*${n}!/s^(${n + 1})` } });
        }
        const c = r.int(2, 9);
        if (bad46(kind, n, c)) return null;
        const T = tab46(kind, c, n);
        return ok({ q: Lf(T.f), a: `$${T.F}$`, easy: T.easy, key: `tbl|${kind}|${n}`, L: { f: T.f }, calc: { kind: 'fn', vars: ['s'], want: T.want } });
      },
      // 見かけがちがう：定義の積分の形・場面（電圧の式）
      s3(r) {
        const [k, ok] = alt(r, '46s3', 2);
        if (k === 0) {
          const kind = r.pick(['t', 't', 'sin', 'cos']), n = kind === 't' ? r.int(2, 5) : r.int(2, 9);
          if (bad46(kind, n, 1)) return null;
          if (usedKey(r, '9-46', `tbl|${kind}|${n}`)) return null;
          const T = tab46(kind, 1, n), g = kind === 't' ? tpow(n) : T.f;
          return ok({ q: `$\\displaystyle\\int_0^{\\infty}${g}\\,e^{-st}\\,\\dd t$`, a: `$${T.F}$`, key: `tbl|${kind}|${n}`, L: { f: T.f },
            easy: `定義の積分そのもの。部分積分をせず、表の行で：${T.easy}`, calc: { kind: 'fn', vars: ['s'], want: T.want } });
        }
        const kind = r.pick(['sin', 'cos']), w = r.pick([50, 100, 120, 200]), V = r.pick([2, 5, 10, 20]);
        const T = tab46(kind, V, w), Fs = kind === 'sin' ? `\\frac{${V * w}}{s^2+${w * w}}` : `\\frac{${V}s}{s^2+${w * w}}`;
        return ok({ q: `時刻 $t$〔s〕の電圧 $v=${T.f}$〔V〕の変換 $\\mathcal L[v]$`, a: `$${Fs}$`, key: `tbl|${kind}|${w}`, L: { f: T.f },
          easy: `${kind === 'sin' ? '$\\sin$' : '$\\cos$'} の行で $\\omega=${w}$（$\\omega^2=${w * w}$）。${V}倍`, calc: { kind: 'fn', vars: ['s'], want: T.want }, boxw: '28mm' });
      },
      // わな：e^{-at} がかかる（9-47）、t がかかる（9-50）
      trap(r) {
        const [k, ok] = alt(r, '46t', 2);
        const w = r.int(1, 5), a = r.int(1, 4), fn = r.pick(['sin', 'cos']);
        if (k === 0) {
          const f = `${expT(a)}${trig(fn, w)}`, den = polyT([a * a + w * w, 2 * a, 1]);
          if ((a === 1 && w === 4) || (w === 2 && fn === 'cos') || (w === 5 && fn === 'sin')) return null;   // 例の cos2t・sin5t は出さない（U-2）
          const Fs = fn === 'sin' ? `\\frac{${w}}{${den}}` : `\\frac{${lin(a)}}{${den}}`;
          return ok(dest({ q: Lf(f), a: `$${Fs}$`, key: `t46|${f}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: fn === 'sin' ? `${w}/((s+${a})^2+${w}^2)` : `(s+${a})/((s+${a})^2+${w}^2)` } },
            '9-46', `$e^{-${a === 1 ? '' : a}t}$ がかかっている。表の行をそのまま引かず、$s$ を $s+${a}$ にずらす`, ['9-47']));
        }
        const wt = fn === 'cos' ? r.pick([3, 4, 6]) : r.pick([6, 7]);   // cos5t も例の sin5t と同じ分母なのでよける（R2-14）
        const f = `t${trig(fn, wt)}`, S = wt * wt;
        const Fs = fn === 'sin' ? `\\frac{${2 * wt}s}{(s^2+${S})^2}` : `\\frac{s^2-${S}}{(s^2+${S})^2}`;
        return ok(dest({ q: Lf(f), a: `$${Fs}$`, key: `t46|${f}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: fn === 'sin' ? `2*${wt}*s/(s^2+${wt}^2)^2` : `(s^2-${wt}^2)/(s^2+${wt}^2)^2` } },
          '9-46', `$t$ と $\\${fn}${wt === 1 ? ' t' : wt + 't'}$ のかけ算は、表の1つの行ではない。$-\\frac{\\dd F}{\\dd s}$`, ['9-50']));
      },
    },
  });

  // ================================================================ 9-47
  // e^{-at} sin・cos・t^n。BAN：例（e^{-3t}cos2t・te^{-2t}。何倍かも）、教科書（e^{-t}sin2t・e^{-t}cos2t・e^{-2t}sin3t・e^{-2t}cos3t・e^{-3t}sin t・e^{-3t}cos t・e^{-2t}sin4t、見わけようの e^{-t}sin4t）
  const BAN47 = new Set(['cos|3|2', 't1|2|0']);
  const TEXT47 = new Set(['sin|1|2', 'cos|1|2', 'sin|2|3', 'cos|2|3', 'sin|3|1', 'cos|3|1', 'sin|2|4', 'sin|1|4']);
  const bad47 = (kind, a, w, c) => BAN47.has(`${kind}|${a}|${w}`) || (c === 1 && TEXT47.has(`${kind}|${a}|${w}`));
  // e^{-at}（a は負もある：ふえる e^{2t}）× sin・cos・t^n の変換
  function sh47(kind, c, a, w) {
    const den2 = polyT([a * a + w * w, 2 * a, 1]);
    if (kind === 'sin') return { F: frac(String(c * w), den2), want: `${c}*${w}/((s+(${a}))^2+${w}^2)`, row: '$\\frac{\\omega}{s^2+\\omega^2}$' };
    if (kind === 'cos') return { F: frac(c === 1 ? lin(a) : `${c}${plin(a)}`, den2), want: `${c}*(s+(${a}))/((s+(${a}))^2+${w}^2)`, row: '$\\frac{s}{s^2+\\omega^2}$' };
    const n = w, v = c * FACT[n];   // t^n e^{-at}
    return { F: frac(String(v), n === 1 ? `${plin(a)}^2` : `${plin(a)}^{${n + 1}}`), want: `${c}*${n}!/(s+(${a}))^(${n + 1})`, row: `$\\frac{${FACT[n]}}{${spow(n + 1)}}$` };
  }
  const f47 = (kind, c, a, w) => cterm(c, kind === 'sin' || kind === 'cos' ? `${expT(a)}${trig(kind, w)}` : `${tpow(w)}${expT(a)}`);
  const sz = a => (a > 0 ? `s+${a}` : `s-${-a}`);
  add({
    id: '9-47', part: 4, chap: '9-6④ 例題3', stars: 1,
    title: '$s$ のずらし：$e^{-at}$ がかかったら $s$ を $s+a$ に（分子の $s$ も）',
    mark: '$e^{-at}\\sin\\omega t$・$e^{-at}\\cos\\omega t$・$t^ne^{-at}$（場合 C）。「ゆれながら止まる」形。',
    futsu: ['定義の積分に $e^{-at}$ と $e^{-st}$ を', '入れ、$e^{-(s+a)t}$ にまとめてから、', '$\\sin$・$\\cos$ なら部分積分を2回して', 'もとの形にもどす。'],
    raku: ['$\\mathcal L[e^{-3t}\\cos2t]=\\frac{s+3}{(s+3)^2+4}$', '$=\\frac{s+3}{s^2+6s+13}$', '$\\mathcal L[te^{-2t}]=\\frac{1}{(s+2)^2}$', '（$e^{-at}$ をとった行の $s$ を $s+a$ に）'],
    why: '定義の積分の中で $e^{-at}e^{-st}=e^{-(s+a)t}$ と肩をたすと、$e^{-at}$ がないときの積分の $s$ が $s+a$ に変わっただけになる。だから $\\mathcal L[e^{-at}f(t)]=F(s+a)$（9-6④）。分母が0になる点が、左へ $a$ だけずれる。',
    caution: '$e^{-at}$（へる）なら $s+a$、$e^{at}$（ふえる）なら $s-a$。$\\cos$ の分子の $s$ も $s+a$ にする。おくれて始まる $e^{-a(t-t_0)}H(t-t_0)$ は時間のずらし（わざ 9-48）で、$e^{-st_0}$ がかかる。分母は $(s+a)^2+\\omega^2$ のままでも、展開してもよい。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '24mm', s3: '26mm', trap: '20mm' },
    boxh: '10mm',
    fits(q, p) { return fwdCase(fwdOf(q, p)) === 'shift'; },
    steps: {
      // e^{-at} sin・cos（係数1）
      s1(r) {
        const kind = r.pick(['sin', 'cos']), a = r.int(1, 5), w = r.int(1, 5);
        if (bad47(kind, a, w, 1)) return null;
        const T = sh47(kind, 1, a, w), f = f47(kind, 1, a, w);
        return { q: Lf(f), a: `$${T.F}$`, key: `sh|${kind}|${a}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
          easy: `${T.row} で $\\omega=${w}$、$s$ を $s+${a}$ に：$(s+${a})^2+${w * w}=${polyT([a * a + w * w, 2 * a, 1])}$` };
      },
      // t^n e^{-at}・係数つき・ふえる e^{at}
      s2(r) {
        const [k, ok] = alt(r, '47s2', 3);
        if (k === 0) {
          const n = r.int(1, 3), a = r.int(1, 6), c = r.pick([1, 1, 2, 3, 5]);
          if (bad47(`t${n}`, a, 0, c) || BAN47.has(`t${n}|${a}|0`)) return null;
          const T = sh47('t', c, a, n), f = f47('t', c, a, n);
          return ok({ q: Lf(f), a: `$${T.F}$`, key: `sh|t${n}|${a}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want }, easy: `${T.row} の $s$ を $s+${a}$ に${c !== 1 ? `、${c}倍` : ''}` });
        }
        if (k === 1) {
          const kind = r.pick(['sin', 'cos']), a = -r.int(1, 4), w = r.int(1, 5);
          const T = sh47(kind, 1, a, w), f = f47(kind, 1, a, w);
          return ok({ q: Lf(f), a: `$${T.F}$`, key: `sh|${kind}|${a}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
            easy: `$${expT(a)}$（ふえる）なので $s$ を $${sz(a)}$ に：$(${sz(a)})^2+${w * w}$` });
        }
        const kind = r.pick(['sin', 'cos']), a = r.int(1, 5), w = r.int(1, 5), c = r.int(2, 6);
        if (bad47(kind, a, w, c)) return null;
        const T = sh47(kind, c, a, w), f = f47(kind, c, a, w);
        return ok({ q: Lf(f), a: `$${T.F}$`, key: `sh|${kind}|${a}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want }, easy: `${T.row} で $\\omega=${w}$、$s$ を $s+${a}$ に、${c}倍` });
      },
      // 見かけがちがう：場面（ゆれながら止まる電流）・わり算の形 \frac{\cos2t}{e^{3t}}
      s3(r) {
        const [k, ok] = alt(r, '47s3', 2);
        const kind = r.pick(['sin', 'cos']), a = r.int(1, 5), w = r.int(2, 6);
        if (usedKey(r, '9-47', `sh|${kind}|${a}|${w}`)) return null;
        if (k === 0) {
          const c = r.int(2, 6);
          if (bad47(kind, a, w, c)) return null;
          const T = sh47(kind, c, a, w), f = f47(kind, c, a, w);
          return ok({ q: `ゆれながら止まる電流 $i=${f}$〔A〕（$t$ は秒）の変換 $\\mathcal L[i]$`, a: `$${T.F}$`, key: `sh|${kind}|${a}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
            easy: `${T.row} で $\\omega=${w}$、$s$ を $s+${a}$ に、${c}倍` });
        }
        if (bad47(kind, a, w, 1)) return null;
        const T = sh47(kind, 1, a, w), f = f47(kind, 1, a, w), g = `\\dfrac{\\${kind}${w}t}{${a === 1 ? 'e^{t}' : `e^{${a}t}`}}`;
        return ok({ q: Lf(g), a: `$${T.F}$`, key: `sh|${kind}|${a}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
          easy: `$e^{${a === 1 ? '' : a}t}$ でわるのは $${expT(a)}$ をかけること。${T.row} の $s$ を $s+${a}$ に` });
      },
      // わな：おくれて始まる e^{-a(t-t0)}H(t-t0)（時間のずらし。9-48）
      trap(r) {
        const a = r.int(1, 4), t0 = r.int(1, 5);
        if (a === 2 && t0 === 1) return null;   // 9-48 の例
        const f = `${expT(a, t0)}H(t-${t0})`;
        return dest({ q: Lf(f), a: `$\\frac{e^{-${t0 === 1 ? '' : t0}s}}{s+${a}}$`, key: `t47|${a}|${t0}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: `exp(-${t0}*s)/(s+${a})` } },
          '9-47', `$${expT(a)}$ がかかったのではなく、$${expT(a)}$ が${t0}秒おくれて始まる形。$s$ はずらさず、$\\frac{1}{s+${a}}$ に $e^{-${t0 === 1 ? '' : t0}s}$ をかける`);
      },
    },
  });

  // ================================================================ 9-48
  // H(t-t0)・e^{-a(t-t0)}H(t-t0)・δ(t-t0)。BAN：例（6H(t-4)・e^{-2(t-1)}H(t-1)・3δ(t-2)。何倍かも）、教科書（10H(t-2)・e^{-(t-1)}H(t-1)・5δ(t-3)・5H(t-3)・sin(t-2)H(t-2)・2δ(t-1)・12H(t-3)・2H(t-5)・3δ(t-2)、見わけようの 2H(t-3)）
  const BAN48 = new Set(['H|4', 'E|1|2', 'd|2']);
  const TEXT48 = new Set(['H|2|10', 'E|1|1|1', 'd|3|5', 'H|3|5', 'sin|2|1', 'd|1|2', 'H|3|12', 'H|5|2', 'H|3|2']);
  const es = t0 => `e^{-${t0 === 1 ? '' : t0}s}`;
  function dl48(kind, c, t0, a) {
    if (kind === 'H') return { f: cterm(c, `H(t-${t0})`), F: `\\frac{${c === 1 ? '' : c}${es(t0)}}{s}`, want: `${c}*exp(-${t0}*s)/s`, ex: `${c === 1 ? 1 : c}`, exF: `\\frac{${c}}{s}` };
    if (kind === 'd') return { f: cterm(c, `\\delta(t-${t0})`), F: `${c === 1 ? '' : c}${es(t0)}`, want: `${c}*exp(-${t0}*s)`, ex: cterm(c, '\\delta(t)'), exF: `${c}` };
    if (kind === 'E') return { f: cterm(c, `${expT(a, t0)}H(t-${t0})`), F: `\\frac{${c === 1 ? '' : c}${es(t0)}}{s+${a}}`, want: `${c}*exp(-${t0}*s)/(s+${a})`, ex: cterm(c, expT(a)), exF: `\\frac{${c}}{s+${a}}` };
    if (kind === 'ramp') return { f: cterm(c, `(t-${t0})H(t-${t0})`), F: `\\frac{${c === 1 ? '' : c}${es(t0)}}{s^2}`, want: `${c}*exp(-${t0}*s)/s^2`, ex: cterm(c, 't'), exF: `\\frac{${c}}{s^2}` };
    const w = a;   // sin・cos
    return { f: cterm(c, `${trig(kind, w, t0)}H(t-${t0})`), F: kind === 'sin' ? `\\frac{${c * w === 1 ? '' : c * w}${es(t0)}}{s^2+${w * w}}` : `\\frac{${c === 1 ? '' : c}s${es(t0)}}{s^2+${w * w}}`,
      want: kind === 'sin' ? `${c}*${w}*exp(-${t0}*s)/(s^2+${w}^2)` : `${c}*s*exp(-${t0}*s)/(s^2+${w}^2)`, ex: cterm(c, trig(kind, w)), exF: kind === 'sin' ? `\\frac{${c * w}}{s^2+${w * w}}` : `\\frac{${c === 1 ? '' : c}s}{s^2+${w * w}}` };
  }
  const bad48 = (kind, c, t0, a) => BAN48.has(kind === 'E' ? `E|${t0}|${a}` : `${kind}|${t0}`) || TEXT48.has(kind === 'E' ? `E|${t0}|${a}|${c}` : kind === 'sin' || kind === 'cos' ? `${kind}|${t0}|${a}` : `${kind}|${t0}|${c}`);
  add({
    id: '9-48', part: 4, chap: '9-6⑤⑦ 例題4', stars: 1,
    title: '時間のずらし：おくれて始まる形は $e^{-st_0}$ をかける',
    mark: '$H(t-t_0)$、$\\delta(t-t_0)$、「□秒後にスイッチを入れる」「□秒後にたたく」（場合 D）。',
    futsu: ['$t<t_0$ では0なので、定義の積分を', '$t_0$ から $\\infty$ までにし、', '$u=t-t_0$ と置いて置換積分をして、', '$e^{-st_0}$ を積分の外に出す。'],
    raku: ['$6H(t-4)\\to\\frac{6e^{-4s}}{s}$', '$e^{-2(t-1)}H(t-1)\\to\\frac{e^{-s}}{s+2}$', '$3\\delta(t-2)\\to3e^{-2s}$', '（おくれをとった形の行 × $e^{-st_0}$）'],
    why: '$f(t-t_0)H(t-t_0)$ の変換は、$t<t_0$ では0なので積分は $t_0$ から。$u=t-t_0$ と置くと $e^{-st}=e^{-st_0}e^{-su}$ で、$e^{-st_0}$ を外に出すと $e^{-st_0}F(s)$（9-6⑤）。$t_0$ おくれることは、$s$ の世界では $e^{-st_0}$ をかけること。$\\mathcal L[\\delta(t)]=1$ なので $\\mathcal L[\\delta(t-t_0)]=e^{-st_0}$（9-6⑦）。',
    caution: '$H$ がないと、$t<t_0$ でも式が生きている（$e^{-(t-1)}=e\\cdot e^{-t}$ で、変換は $\\frac{e}{s+1}$）。$e^{-at}$ を「かける」のは $s$ のずらし（わざ 9-47）。$\\delta(t)$ は高さ1ではなく、面積（力積）が1。',
    counts: { s1: 8, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '24mm', s3: '22mm', trap: '18mm' },
    boxh: '10mm',
    fits(q, p) {
      if (/秒後に(スイッチを入れ|力積)/.test(q)) return true;
      return fwdCase(fwdOf(q, p)) === 'delay';
    },
    steps: {
      // H(t-t0)・δ(t-t0)・e^{-a(t-t0)}H(t-t0)
      s1(r) {
        const kind = r.pick(['H', 'd', 'E']), c = r.pick([1, 2, 3, 4, 5, 7, 8]), t0 = r.int(1, 6), a = r.int(1, 4);
        if (bad48(kind, c, t0, a)) return null;
        const T = dl48(kind, c, t0, a);
        return { q: Lf(T.f), a: `$${T.F}$`, key: `dl|${kind}|${t0}|${kind === 'E' ? a : ''}`, L: { f: T.f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
          easy: `おくれをとった $${T.ex}$ の変換 $${T.exF}$ に $${es(t0)}$ をかける` };
      },
      // (t-t0)H・sin・cos のおくれ
      s2(r) {
        const kind = r.pick(['ramp', 'sin', 'cos']), c = r.pick([1, 1, 2, 3]), t0 = r.int(1, 5), w = r.int(1, 4);
        if (bad48(kind, c, t0, w)) return null;
        const T = dl48(kind, c, t0, w);
        return { q: Lf(T.f), a: `$${T.F}$`, key: `dl|${kind}|${t0}|${kind === 'ramp' ? '' : w}`, L: { f: T.f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
          easy: `おくれをとった $${T.ex}$ の変換 $${T.exF}$ に $${es(t0)}$ をかける` };
      },
      // 見かけがちがう：ことばの場面（スイッチ・たたく力）。key は s1 と同じ形（U-2）
      s3(r) {
        const [k, ok] = alt(r, '48s3', 2);
        const t0 = r.int(1, 6);
        if (k === 0) {
          const V = r.pick([3, 6, 9, 12, 24]);
          if (bad48('H', V, t0) || usedKey(r, '9-48', `dl|H|${t0}|`)) return null;
          const T = dl48('H', V, t0);
          return ok({ q: `${t0}秒後にスイッチを入れて、$${V}\\,\\mathrm V$ の電池をつなぐ電圧（それまでは $0\\,\\mathrm V$）の変換`, a: `$${T.F}$`, key: `dl|H|${t0}|`, L: { f: T.f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
            easy: `$${V}H(t-${t0})$。$\\frac{${V}}{s}$ に $${es(t0)}$ をかける` });
        }
        const Pw = r.pick([2, 3, 4, 6, 8]);
        if (bad48('d', Pw, t0) || usedKey(r, '9-48', `dl|d|${t0}|`)) return null;
        const T = dl48('d', Pw, t0);
        return ok({ q: `${t0}秒後に、力積 $${Pw}\\,\\mathrm{N\\cdot s}$ でハンマーでたたく力の変換`, a: `$${T.F}$`, key: `dl|d|${t0}|`, L: { f: T.f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
          easy: `$${Pw}\\delta(t-${t0})$。$\\mathcal L[\\delta(t)]=1$ に $${es(t0)}$ をかけて${Pw}倍` });
      },
      // わな：H のない e^{-a(t-t0)}（$e^{at_0}e^{-at}$ の定数倍。9-42）
      trap(r) {
        const a = r.int(1, 3), t0 = r.int(1, 3);
        if ((a === 1 && t0 === 1) || (a === 2 && t0 === 1)) return null;   // 教科書のまちがえやすいところ③・左ページの例の式
        const f = expT(a, t0), E = `e^{${fmt(a * t0)}}`;
        return dest({ q: Lf(f), a: `$\\frac{${E}}{s+${a}}$`, key: `t48|${a}|${t0}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: `exp(${a * t0})/(s+${a})` } },
          '9-48', `$H(t-${t0})$ がないので、$t<${t0}$ でも式が生きている。$${f}=${E}\\,${expT(a)}$ は定数倍で、$\\frac{${E}}{s+${a}}$`, ['9-42']);
      },
    },
  });

  // ================================================================ 9-49
  // ステップの和：[[時刻, とびの大きさ], …] → F(s) の TeX と want。BAN：例（2秒から5秒。高さはどれでも）、教科書（0〜2 秒 3 V・1〜3 秒 5 V・0〜1 秒 4 V・2〜5 秒 1 V）
  const BAN49 = new Set(['2|5']);
  const TEXT49 = new Set(['0|2|3', '1|3|5', '0|1|4', '2|5|1']);
  const Es = t => (t === 0 ? '' : es(t));
  function stepsF(list) {
    let num;
    if (list.length === 2 && list[0][1] === -list[1][1]) {
      const V = list[0][1], inner = `${list[0][0] === 0 ? '1' : es(list[0][0])}-${es(list[1][0])}`;
      num = V === 1 ? inner : V === -1 ? `${es(list[1][0])}-${list[0][0] === 0 ? '1' : es(list[0][0])}` : `${V}(${inner})`;
    } else num = sumT(list.map(([t, d]) => [d, Es(t)]));
    return { F: `\\frac{${num}}{s}`, want: list.map(([t, d]) => `(${d})*exp(-${t}*s)/s`).join('+'), H: sumT(list.map(([t, d]) => [d, t === 0 ? 'H(t)' : `H(t-${t})`])) };
  }
  // 階段・パルスのグラフ（とびの所はたての点線、白丸・黒丸）
  function fig49(levels, tEnd) {
    // levels：[[はじめ, おわり, 高さ], …]（つながっている）
    const vs = levels.map(l => l[2]), hi = Math.max(0, ...vs), lo = Math.min(0, ...vs), T = tEnd + 1.2;
    const G = M.graph({ x0: 0, x1: T, y0: lo - (lo < 0 ? 1 : 0), y1: hi + 1, w: 8, h: Math.max(2.8, Math.min(3.8, 0.5 * (hi - lo + 1.5))) });
    const ticks = [...new Set(levels.flatMap(l => [l[0], l[1]]).filter(t => t > 0))].sort((a, b) => a - b);
    // はじめの区間が0なら、t=0 に丸をかかない。おわりの0の区間は、はじめだけ黒丸（右はしに丸をかかない）
    const pcs = levels.map(([a, b, v], i) => ({ f: v, a, b, ends: i === 0 && v === 0 ? '' : '[)' })).concat([{ f: 0, a: tEnd, b: T - 0.2, ends: '[' }]);
    const z0 = levels[0][2] === 0 ? [['dot', G.T(levels[0][1], 0), { open: true }], ['seg', G.T(levels[0][1], 0), G.T(levels[0][1], levels[1][2]), { dash: true }]] : [];
    return { s: 5, items: [...G.axes({ xt: ticks, yt: [...new Set(vs.filter(v => v !== 0))], x: 't', y: 'v' }), ...G.pw(pcs, { vline: true, thick: true }), ...z0] };
  }
  add({
    id: '9-49', part: 4, chap: '9-6⑤ 例題7', stars: 1,
    title: 'パルス・階段は「足す時刻と引く時刻」のステップの和に直す',
    mark: '「□秒から□秒までだけ」「はじめの□秒間だけ」、区間ごとに一定の電圧（場合 F）。',
    futsu: ['区間ごとに式が変わるので、', '定義の積分を区間に分け、', '$\\int_a^bVe^{-st}\\,\\dd t$ を', '区間の数だけ計算してたす。'],
    raku: ['2秒から5秒まで $4\\,\\mathrm V$', '$=4H(t-2)-4H(t-5)$', '$\\to\\frac{4e^{-2s}}{s}-\\frac{4e^{-5s}}{s}=\\frac{4(e^{-2s}-e^{-5s})}{s}$', '（定義の積分をしない）'],
    why: '「時刻 $a$ に $V$ を足し、時刻 $b$ に $V$ をひく」と見ると、パルスはおくれたステップ関数2つの和 $VH(t-a)-VH(t-b)$ になる（9-6⑤）。あとは項ごとに、時間のずらし $\\mathcal L[H(t-t_0)]=\\frac{e^{-st_0}}{s}$ で変換すればよい（線形）。階段も、とびの所ごとにステップを足す。',
    caution: '足す・引く大きさは、とびの大きさ（その時刻の前と後の差）。はじめから始まるときは $H(t)$ で、変換は $\\frac{1}{s}$（$e^{-0s}=1$）。ひくステップを忘れると、ずっと続く電圧になる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '30mm', s3: '30mm', trap: '14mm' },
    boxh: '10mm',
    fits(q, p) {
      if (/秒から.*秒まで|秒間だけ|秒までは/.test(q) && /\\mathrm V|電圧/.test(q) && !/近づく|最後/.test(q)) return true;
      if (p && p.fig && /図の電圧/.test(q)) return true;
      return fwdCase(fwdOf(q, p)) === 'pulse';
    },
    steps: {
      // はじめの b 秒間・a 秒から b 秒まで
      s1(r) {
        const a = r.chance(0.4) ? 0 : r.int(1, 4), b = a + r.int(1, 4), V = r.pick([1, 2, 3, 5, 6, 8, 10]);
        if (BAN49.has(`${a}|${b}`) || TEXT49.has(`${a}|${b}|${V}`)) return null;
        const S = stepsF([[a, V], [b, -V]]);
        const q = a === 0 ? `はじめの${b}秒間だけ $${V}\\,\\mathrm V$（そのあと $0\\,\\mathrm V$）の電圧の変換` : `${a}秒から${b}秒までだけ $${V}\\,\\mathrm V$（ほかは $0\\,\\mathrm V$）の電圧の変換`;
        return { q, a: `$${S.F}$`, key: `pl|${a}|${b}`, L: { f: S.H }, calc: { kind: 'fn', vars: ['s'], want: S.want },
          easy: `$${S.H}$。項ごとに $\\frac{e^{-st_0}}{s}$` };
      },
      // ステップの和の式・2段の階段（ことば）
      s2(r) {
        const [k, ok] = alt(r, '49s2', 2);
        if (k === 0) {
          const a = r.int(1, 4), b = a + r.int(1, 3), V = r.pick([2, 3, 4, 5, 7]);
          if (BAN49.has(`${a}|${b}`) || TEXT49.has(`${a}|${b}|${V}`)) return null;
          const S = stepsF([[a, V], [b, -V]]);
          return ok({ q: Lf(S.H), a: `$${S.F}$`, key: `pl|${a}|${b}`, L: { f: S.H }, calc: { kind: 'fn', vars: ['s'], want: S.want }, easy: `項ごとに時間のずらし：$\\frac{${V}${es(a)}}{s}-\\frac{${V}${es(b)}}{s}$` });
        }
        const t1 = r.int(1, 3), t2 = t1 + r.int(1, 3), v1 = r.int(1, 6), v2 = r.intNot(1, 8, v => v === v1);
        if (BAN49.has(`${t1}|${t2}`)) return null;
        const S = stepsF([[0, v1], [t1, v2 - v1], [t2, -v2]]);
        return ok({ q: `はじめの${t1}秒間は $${v1}\\,\\mathrm V$、${t2}秒までは $${v2}\\,\\mathrm V$、そのあと $0\\,\\mathrm V$ の電圧の変換`, a: `$${S.F}$`, key: `st|${t1}|${t2}|${fmt(v2 / v1)}`, L: { f: S.H }, calc: { kind: 'fn', vars: ['s'], want: S.want },
          easy: `とびの所でステップを足す：$${S.H}$` });
      },
      // 図：パルス・階段のグラフ（ステップ1・2 と同じ形の key。U-2）
      s3(r) {
        const [k, ok] = alt(r, '49s3', 2);
        if (k === 0) {
          const a = r.int(1, 3), b = a + r.int(1, 3), V = r.pick([2, 3, 4, 5, 6]);
          if (BAN49.has(`${a}|${b}`) || TEXT49.has(`${a}|${b}|${V}`) || usedKey(r, '9-49', `pl|${a}|${b}`)) return null;
          const S = stepsF([[a, V], [b, -V]]);
          return ok({ q: '図の電圧 $v$〔V〕（$t$ は秒）の変換 $\\mathcal L[v]$', a: `$${S.F}$`, key: `pl|${a}|${b}`, L: { f: S.H }, calc: { kind: 'fn', vars: ['s'], want: S.want },
            fig: fig49([[0, a, 0], [a, b, V]], b), easy: `$${S.H}$` });
        }
        const t1 = r.int(1, 2), t2 = t1 + r.int(1, 2), v1 = r.int(1, 5), v2 = r.intNot(1, 6, v => v === v1);
        if (usedKey(r, '9-49', `st|${t1}|${t2}|${fmt(v2 / v1)}`)) return null;
        const S = stepsF([[0, v1], [t1, v2 - v1], [t2, -v2]]);
        return ok({ q: '図の電圧 $v$〔V〕（$t$ は秒）の変換 $\\mathcal L[v]$', a: `$${S.F}$`, key: `st|${t1}|${t2}|${fmt(v2 / v1)}`, L: { f: S.H }, calc: { kind: 'fn', vars: ['s'], want: S.want },
          fig: fig49([[0, t1, v1], [t1, t2, v2]], t2), easy: `とびの所でステップを足す：$${S.H}$` });
      },
      // わな：変換の式から最後の値（もどさない。9-52）
      trap(r) {
        const [k, ok] = alt(r, '49t', 2), V = r.pick([2, 3, 4, 5, 6]), b = r.int(1, 4);
        if (k === 0) {
          const F = `\\dfrac{${V}(1-${es(b)})}{s}`;
          return ok(dest({ q: `$F(s)=${F}$ のもとの関数の最後の値`, a: '$0$', key: `t49|0|${b}|${V}`, verify: p => valIs(p, 0) },
            '9-49', `変換するのではなく、最後の値。$sF(s)=${V}(1-${es(b)})$ で $s\\to0$ として $0$`));
        }
        const F = `\\dfrac{${V}${es(b)}}{s}`;
        return ok(dest({ q: `$F(s)=${F}$ のもとの関数の最後の値`, a: `$${V}$`, key: `t49|1|${b}|${V}`, verify: p => valIs(p, V) },
          '9-49', `変換するのではなく、最後の値。$sF(s)=${V}${es(b)}$ で $s\\to0$ として $${V}$`));
      },
    },
  });

  // ================================================================ 9-50
  // t sin ωt・t cos ωt。BAN：例（t cos t。何倍かも）、教科書（t sin2t・t sin t・t sin3t・t sin4t、見わけようの t sin3t）
  const bad50 = (kind, w, c) => (kind === 'cos' && w === 1) || (c === 1 && kind === 'sin' && w <= 4);
  function tm50(kind, c, w) {
    const S = w * w;
    if (kind === 'sin') {
      const n = F.mul(c, fr(2 * w)), num = n[1] === 1 ? `${n[0]}s` : `${n[0]}s`;
      return { F: n[1] === 1 ? `\\frac{${num}}{(s^2+${S})^2}` : `\\frac{${n[0]}s}{${n[1]}(s^2+${S})^2}`, want: `(${F.val(c)})*2*${w}*s/(s^2+${w}^2)^2`, dF: `\\frac{${w}}{s^2+${S}}` };
    }
    const cv = F.val(c);
    return { F: cv === 1 ? `\\frac{s^2-${S}}{(s^2+${S})^2}` : `\\frac{${fq(c)}(s^2-${S})}{(s^2+${S})^2}`, want: `(${cv})*(s^2-${w}^2)/(s^2+${w}^2)^2`, dF: `\\frac{s}{s^2+${S}}` };
  }
  add({
    id: '9-50', part: 4, chap: '9-6⑥ 例題8', stars: 1,
    title: '$t$ がかかったら $-\\frac{\\dd F}{\\dd s}$（$\\mathcal L[t]\\times\\mathcal L[\\ ]$ ではない）',
    mark: '$t\\sin\\omega t$・$t\\cos\\omega t$（場合 G）。$t$ とほかの関数のかけ算。',
    futsu: ['定義の積分 $\\int_0^{\\infty}t\\sin\\omega t\\,e^{-st}\\,\\dd t$ を書き、', '部分積分で $t$ を微分して消し、', '残った $\\sin$・$\\cos$ と $e^{-st}$ の積分を', 'さらに部分積分で計算する。'],
    raku: ['$\\mathcal L[t\\cos t]=-\\frac{\\dd}{\\dd s}\\frac{s}{s^2+1}$', '$=-\\frac{(s^2+1)-s\\cdot2s}{(s^2+1)^2}$', '$=\\frac{s^2-1}{(s^2+1)^2}$', '（$t$ をとった行を $s$ で微分して $-1$ 倍）'],
    why: '$F(s)=\\int_0^{\\infty}f(t)e^{-st}\\,\\dd t$ を $s$ で微分すると、積分の中の $e^{-st}$ が $-te^{-st}$ になる（$t$ は止めておく）。だから $\\mathcal L[tf(t)]=-\\frac{\\dd F}{\\dd s}$（9-6⑥）。$\\sin\\omega t$ なら $-\\frac{\\dd}{\\dd s}\\frac{\\omega}{s^2+\\omega^2}=\\frac{2\\omega s}{(s^2+\\omega^2)^2}$。',
    caution: '$\\mathcal L[t\\sin2t]$ は $\\mathcal L[t]\\times\\mathcal L[\\sin2t]$ ではない（$\\mathcal L$ は「かける数」ではなく操作の名前）。マイナスを忘れない。$t$ と $\\sin$ の「和」なら、項ごとに表を引く（わざ 9-42）。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '26mm', s3: '24mm', trap: '24mm' },
    boxh: '11mm',
    fits(q, p) {
      if (/\\int_0\^\{\\infty\}t\\(sin|cos)/.test(q)) return true;
      return fwdCase(fwdOf(q, p)) === 'tmul';
    },
    steps: {
      s1(r) {
        const kind = r.pick(['sin', 'cos']), w = r.int(1, 8);
        if (bad50(kind, w, 1)) return null;
        const T = tm50(kind, fr(1), w), f = `t${trig(kind, w)}`;
        return { q: Lf(f), a: `$${T.F}$`, key: `tm|${kind}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want }, easy: `$-\\frac{\\dd}{\\dd s}${T.dF}$` };
      },
      // 係数つき
      s2(r) {
        const kind = r.pick(['sin', 'cos']), w = r.int(1, 6), c = r.int(2, 6);
        if (kind === 'cos' && w === 1) return null;
        const T = tm50(kind, fr(c), w), f = `${c}t${trig(kind, w)}`;
        return { q: Lf(f), a: `$${T.F}$`, key: `tm|${kind}|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want }, easy: `$-${c}\\frac{\\dd}{\\dd s}${T.dF}$` };
      },
      // 見かけがちがう：ゆれのはばが大きくなる動き $\frac{t}{k}\sin\omega t$・定義の積分の形
      s3(r) {
        const [k, ok] = alt(r, '50s3', 2);
        const kind = k === 0 ? 'sin' : r.pick(['sin', 'cos']), w = r.int(2, 8);
        if (usedKey(r, '9-50', `tm|${kind}|${w}`) || (k === 1 && bad50(kind, w, 1)) || (k === 0 && w === 2)) return null;
        if (k === 0) {
          const kk = r.pick([2, 3, 4, 5]), c = fr(1, kk), T = tm50('sin', c, w), f = `\\frac{t}{${kk}}\\sin${w}t`;
          return ok({ q: `ゆれのはばが時間とともに大きくなる動き $x=${f}$ の変換 $\\mathcal L[x]$`, a: `$${T.F}$`, key: `tm|sin|${w}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: T.want },
            easy: `$\\frac{1}{${kk}}\\times\\frac{${2 * w}s}{(s^2+${w * w})^2}$` });
        }
        const T = tm50(kind, fr(1), w);
        return ok({ q: `$\\displaystyle\\int_0^{\\infty}t\\${kind}${w}t\\,e^{-st}\\,\\dd t$`, a: `$${T.F}$`, key: `tm|${kind}|${w}`, L: { f: `t${trig(kind, w)}` }, calc: { kind: 'fn', vars: ['s'], want: T.want },
          easy: `$\\mathcal L[t\\${kind}${w}t]$ のこと。$-\\frac{\\dd}{\\dd s}${T.dF}$` });
      },
      // わな：t と sin・cos の「和」（項ごとに表。9-42・9-46）
      trap(r) {
        const n = r.int(1, 3), kind = r.pick(['sin', 'cos']), w = r.int(2, 5), c = r.int(2, 6), sg = r.pick([1, -1]);
        const f = `${tpow(n)}${sg > 0 ? '+' : '-'}${c}${trig(kind, w)}`;
        const T2 = kind === 'sin' ? `\\frac{${c * w}}{s^2+${w * w}}` : `\\frac{${c}s}{s^2+${w * w}}`;
        return dest({ q: Lf(f), a: `$\\frac{${FACT[n]}}{${spow(n + 1)}}${sg > 0 ? '+' : '-'}${T2}$`, key: `t50|${f}`, L: { f },
          calc: { kind: 'fn', vars: ['s'], want: `${n}!/s^(${n + 1})+(${sg})*${kind === 'sin' ? `${c}*${w}` : `${c}*s`}/(s^2+${w}^2)` } },
          '9-50', `$t$ がかかったのではなく、$${tpow(n)}$ と $${c}\\${kind}${w}t$ の和。項ごとに表を引く`, ['9-42', '9-46']);
      },
    },
  });

  // ================================================================ 9-51
  // たたみこみ。組 [a, b]（a<b、a=0 は 1）。BAN：例 {2,3}、教科書 {1,2}・{0,3}・{1,3}・{0,1}・見わけようの {0,2}
  const BAN51 = new Set(['2|3', '1|2', '0|3', '1|3', '0|1', '0|2']);
  const eT = a => (a === 0 ? '1' : expT(a));
  function cv51(a, b) {   // e^{-at}*e^{-bt}（a<b）
    const d = b - a, num = `${eT(a)}-${expT(b)}`;
    return { f: `${eT(a)}*${expT(b)}`, F: `\\frac{1}{${plin(a)}${plin(b)}}`, y: d === 1 ? num : `\\frac{${num}}{${d}}`,
      want: residueWant([1], [a * b, a + b, 1], [[-a, 0, 1], [-b, 0, 1]]), wantF: `1/((s+${a})*(s+${b}))` };
  }
  add({
    id: '9-51', part: 4, chap: '9-6⑧ 例題10', stars: 1,
    title: 'たたみこみは $s$ の世界のかけ算：$\\mathcal L[f*g]=F(s)G(s)$',
    mark: '$f*g$、$\\int_0^tg(t-t_1)u(t_1)\\,\\dd t_1$、「インパルス応答が□の機械に□を入れた出力」（場合 I）。',
    futsu: ['たたみこみの積分 $\\int_0^tg(t-t_1)u(t_1)\\,\\dd t_1$ を書き、', '$t_1$ に関係しない $e^{-at}$ を外に出して、', '$t_1$ で定積分する。', '変換は、その答えを項ごとに変換する。'],
    raku: ['$e^{-2t}*e^{-3t}\\to\\frac{1}{(s+2)(s+3)}$', '$=\\frac{1}{s+2}-\\frac{1}{s+3}$', '$\\to e^{-2t}-e^{-3t}$', '（$e^{-5t}$ ではない）'],
    why: '入力を細い柱に分け、柱ごとの出力（おくれたインパルス応答）をたした先が、たたみこみ $g*u$（9-6⑧）。その変換は、三角形の範囲の重積分の順番を入れかえると、2つの変換のかけ算 $G(s)U(s)$ に分かれる。めんどうな積分が、$s$ の世界ではかけ算1回になる。',
    caution: '$s$ の世界でかけ算になるのは、たたみこみのほう。ふつうのかけ算 $e^{-2t}\\cdot e^{-3t}=e^{-5t}$ の変換は $\\frac{1}{s+5}$（わざ 9-41）で、$\\frac{1}{(s+2)(s+3)}$ ではない。$1*e^{-at}$ の1 は、ずらしても1。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' },
    boxh: '10mm',
    fits(q, p) {
      if (/インパルス応答/.test(q) && /入れた/.test(q)) return true;
      if (/\\int_0\^t/.test(q) && /t_1/.test(q)) return true;
      return fwdCase(fwdOf(q, p)) === 'conv' || /\$[^$]*\*[^$]*\$/.test(q);
    },
    steps: {
      // 変換（かけ算）
      s1(r) {
        const [k, ok] = alt(r, '51s1', 3);
        if (k < 2) {
          const a = k === 0 ? r.int(1, 4) : 0, b = a + r.int(1, 4);
          if (BAN51.has(`${a}|${b}`)) return null;
          const C = cv51(a, b);
          return ok({ q: Lf(C.f), a: `$${C.F}$`, key: `cv|${a}|${b}`, L: { f: C.f }, calc: { kind: 'fn', vars: ['s'], want: C.wantF }, easy: `$${a === 0 ? '\\frac{1}{s}' : `\\frac{1}{s+${a}}`}\\times\\frac{1}{s+${b}}$` });
        }
        const w = r.int(1, 4), a = r.int(1, 4), kind = r.pick(['sin', 'cos']), f = `${trig(kind, w)}*${expT(a)}`;
        const F1 = kind === 'sin' ? `${w}` : 's';
        return ok({ q: Lf(f), a: `$\\frac{${F1}}{(s^2+${w * w})(s+${a})}$`, key: `cvt|${kind}|${w}|${a}`, L: { f }, calc: { kind: 'fn', vars: ['s'], want: `${kind === 'sin' ? w : 's'}/((s^2+${w * w})*(s+${a}))` },
          easy: `$\\frac{${F1}}{s^2+${w * w}}\\times\\frac{1}{s+${a}}$` });
      },
      // たたみこみそのもの（時間の関数）
      s2(r) {
        const a = r.chance(0.4) ? 0 : r.int(1, 4), b = a + r.int(1, 4);
        if (BAN51.has(`${a}|${b}`)) return null;
        const C = cv51(a, b);
        return { q: `$${C.f}$`, a: `$${C.y}$`, key: `cv|${a}|${b}`, L: { f: C.f }, calc: { kind: 'fn', vars: ['t'], want: C.want },
          easy: `$${C.F}=${b - a === 1 ? '' : `\\frac{1}{${b - a}}\\Bigl(`}${a === 0 ? '\\frac{1}{s}' : `\\frac{1}{s+${a}}`}-\\frac{1}{s+${b}}${b - a === 1 ? '' : '\\Bigr)'}$ をもどす` };
      },
      // 見かけがちがう：積分の形・インパルス応答の場面（key は s1・s2 と同じ形。U-2）
      s3(r) {
        const [k, ok] = alt(r, '51s3', 2);
        if (k === 0) {
          const a = r.int(1, 4), b = r.intNot(1, 6, v => v === a), lo = Math.min(a, b), hi = Math.max(a, b);
          if (BAN51.has(`${lo}|${hi}`) || usedKey(r, '9-51', `cv|${lo}|${hi}`)) return null;
          const C = cv51(lo, hi);
          return ok({ q: `$\\displaystyle\\int_0^t${expT(a, 't_1')}e^{-${b === 1 ? '' : b}t_1}\\,\\dd t_1$`, a: `$${C.y}$`, key: `cv|${lo}|${hi}`, L: { f: `${expT(a)}*${expT(b)}` }, calc: { kind: 'fn', vars: ['t'], want: C.want },
            easy: `$${expT(a)}*${expT(b)}$ のこと。$s$ の世界で $${C.F}$ にして、もどす` });
        }
        const a = r.int(1, 5), V = r.pick([2, 3, 4, 6, 10]);
        if (BAN51.has(`0|${a}`) || usedKey(r, '9-51', `cv|0|${a}`)) return null;
        const y = V % a === 0 ? (V / a === 1 ? `1-${expT(a)}` : `${V / a}-${V / a}${expT(a)}`) : `\\frac{${V}(1-${expT(a)})}{${a}}`;
        return ok({ q: `インパルス応答が $g=${expT(a)}$ の機械に、スイッチを入れたまま $u=${V}$ を入れたときの出力 $y=g*u$`, a: `$${y}$`, key: `cv|0|${a}`, L: { f: `${expT(a)}*${V}` },
          calc: { kind: 'fn', vars: ['t'], want: `${V}*(${residueWant([1], [0, a, 1], [[0, 0, 1], [-a, 0, 1]])})` }, easy: `$\\frac{1}{s+${a}}\\times\\frac{${V}}{s}=\\frac{${V}}{s(s+${a})}$ をもどす` });
      },
      // わな：ふつうのかけ算（9-41）
      trap(r) {
        const a = r.int(1, 4), b = r.intNot(1, 5, v => v === a);
        if ((a === 2 && b === 3) || (a === 3 && b === 2)) return null;
        const f = `${expT(a)}\\cdot ${expT(b)}`;
        return dest({ q: `${Lf(f)}（ふつうのかけ算）`, a: `$\\frac{1}{s+${a + b}}$`, key: `t51|${Math.min(a, b)}|${Math.max(a, b)}`, calc: { kind: 'fn', vars: ['s'], want: `1/(s+${a}+${b})` } },
          '9-51', `たたみこみではなく、ふつうのかけ算。$${f}=${expT(a + b)}$ を変換する（$\\frac{1}{(s+${a})(s+${b})}$ ではない）`, ['9-41']);
      },
    },
  });

  // ================================================================ 9-52
  // はじめの値・最後の値。BAN：例（6/(s(s+3)) と何倍か、答え2、1/(s^2+1)）、教科書（1/(s(s+1)(s+2))・2/(s(s^2+4))・6/(s(s+2)(s+3))・3/(s(s^2+9))・10/(s(s+1)(s+5))・5/(s(s^2+25))・2/(s(s+2))・20/(s(s+4))、見わけようの 10/(s(s+5))）
  const TEXT52 = new Set(['1|1|2', '6|2|3', '10|1|5', '2|2', '20|4', '10|5', '2|4q', '3|9q', '5|25q']);
  const fval = f => (f[1] === 1 ? String(f[0]) : F.tex(f));
  add({
    id: '9-52', part: 4, chap: '9-6⑨・9-7⑪ 例題12', stars: 1,
    title: 'はじめと最後の値は、もどさずに $sF(s)$ で（最後は落ち着くときだけ）',
    mark: '「はじめの値」「最後の値」「時間がたつと近づく値」（9-7 の場合 H）。',
    futsu: ['部分分数に分けて表を逆に引き、', '時間の関数にもどしてから、', '$t=0$ を入れてはじめの値、', '$t\\to\\infty$ で最後の値を出す。'],
    raku: ['$F=\\frac{6}{s(s+3)}$ → $sF=\\frac{6}{s+3}$', '$s\\to\\infty$ ではじめ0、$s\\to0$ で最後2', '$\\frac{1}{s^2+1}$（$\\sin t$）は $\\pm j$ の実部が0', '→ 最後の値はない'],
    why: '微分の行 $\\int_0^{\\infty}f\'(t)e^{-st}\\,\\dd t=sF(s)-f(0)$ で $s\\to0$ とすると、左辺は「最後－はじめ」になり、$\\lim_{t\\to\\infty}f(t)=\\lim_{s\\to0}sF(s)$（最終値の定理）。$s\\to\\infty$ では左辺が0になり、$f(0)=\\lim_{s\\to\\infty}sF(s)$（初期値の定理。9-6⑨）。',
    caution: '最終値の定理は、落ち着くときだけ使える：$sF(s)$ の分母が0になる $s$ が、すべて実部が負（左半分）のとき。$\\pm j\\omega$（実部0）があればゆれ続け、正の $s$ があればふえ続ける。$s$ をかけ忘れて $F(s)$ の極限をとらない。',
    counts: { s1: 6, s2: 3, s3: 3, trap: 2 },
    spread: 2,   // 見開き全体で同じ答えは2つまで（R2-13）
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '16mm' },
    fits(q) { return /最後の値|はじめの値|近づく値|初期値|最終値|(はじめ|最後)の(温度|電圧)/.test(q) && !/秒後の|での値|おくれ/.test(q); },

    steps: {
      // 最後の値：K/(s(s+a))・K/(s(s+a)(s+b))
      s1(r) {
        const [k, ok] = alt(r, '52s1', 2);
        if (k === 0) {
          const a = r.intNot(1, 6, v => v === 3), K = r.chance(0.7) ? a * r.int(1, 5) : r.int(1, 9);
          if (TEXT52.has(`${K}|${a}`)) return null;
          const v = fr(K, a);
          if (F.val(v) === 2) return null;
          (r.e52 || (r.e52 = new Set())).add(`${K}|${a}`);   // わなで同じ式を出さない（R2-13）
          return ok({ q: `$F(s)=\\dfrac{${K}}{s(s+${a})}$ のもとの関数の、最後の値`, a: `$${fval(v)}$`, key: `fin|${a}`, verify: p => valIs(p, K / a),
            easy: `$sF=\\frac{${K}}{s+${a}}$ で $s\\to0$。分母が0になる $-${a}$ は左半分` });
        }
        const a = r.int(1, 3), b = a + r.int(1, 3), K = a * b * r.int(1, 3);
        if (TEXT52.has(`${K}|${a}|${b}`)) return null;
        const v = fr(K, a * b);
        if (F.val(v) === 2) return null;
        return ok({ q: `$F(s)=\\dfrac{${K}}{s(s+${a})(s+${b})}$ のもとの関数の、最後の値`, a: `$${fval(v)}$`, key: `fin|${a}|${b}`, verify: p => valIs(p, K / (a * b)),
          easy: `$sF=\\frac{${K}}{(s+${a})(s+${b})}$ で $s\\to0$：$\\frac{${K}}{${a}\\times${b}}$` });
      },
      // はじめの値・2つの項の和
      s2(r) {
        const [k, ok] = alt(r, '52s2', 3);
        if (k === 0) {
          const p0 = r.intNot(1, 6, v => v === 2), q0 = r.int(1, 9), a = r.int(1, 3), b = a + r.int(1, 3);   // 例の答え（はじめ0・最後2）と同じ答えは出さない
          if (q0 === p0 * a || q0 === p0 * b) return null;   // 約分できる（分子と分母に同じ1次式。Y-7）
          return ok({ q: `$F(s)=\\dfrac{${p0 === 1 ? '' : p0}s+${q0}}{(s+${a})(s+${b})}$ のもとの関数の、はじめの値 $f(0)$`, a: `$${p0}$`, key: `ini|${p0}|${q0}|${a}|${b}`, verify: p => valIs(p, p0),
            easy: `$sF=\\frac{${p0 === 1 ? '' : p0}s^2+${q0 === 1 ? '' : q0}s}{s^2+${a + b}s+${a * b}}$ で $s\\to\\infty$：$s^2$ の係数の比` });
        }
        // お湯：最後（部屋）は 10〜30 ℃、はじめは 100 ℃以下（R2-3・O-6）
        const c = r.int(1, 3) * 10, d = r.int(3, (100 - c) / 10) * 10, a = r.pick([0.05, 0.1, 0.2, 0.5, 2]), first = k === 1;
        if (c === 20 && d === 60) return null;
        return ok({ q: `お湯の温度の変換 $T(s)=\\dfrac{${c}}{s}+\\dfrac{${d}}{s+${a}}$ の、${first ? 'はじめの温度' : '最後の温度'}（℃）`, a: `$${first ? c + d : c}$`, key: `sum|${c}|${d}|${a}|${first}`, verify: p => valIs(p, first ? c + d : c),
          easy: `$sT=${c}+\\frac{${d}s}{s+${a}}$ で ${first ? `$s\\to\\infty$：$${c}+${d}$` : `$s\\to0$：$${c}$`}` });
      },
      // 落ち着くか（「ある・ない」を交互に。U-3）
      s3(r) {
        const st = r.s52 || (r.s52 = { n: r.int(0, 1) }), yes = st.n % 2 === 0;
        let q, a, easy, key, v = null;
        if (yes) {
          const [k] = [r.int(0, 1)];
          if (k === 0) {
            const aa = r.int(1, 3), w = r.int(1, 3), b = aa * aa + w * w, K = b * r.pick([1, 3, 4, 5, 6, 7, 8]);
            if (TEXT52.has(`${K}|${aa}|${w}c`)) return null;
            q = `$F(s)=\\dfrac{${K}}{s(${polyT([b, 2 * aa, 1])})}$`; v = K / b; key = `s3|${K}|${aa}|${w}`;
            easy = `$sF$ の分母が0になる $s=-${aa}\\pm ${w === 1 ? '' : w}j$ は左半分。$s\\to0$ で $\\frac{${K}}{${b}}$`;
          } else {
            const aa = r.int(1, 3), K = aa * aa * r.pick([1, 3, 4, 5, 6, 7, 8]);
            q = `$F(s)=\\dfrac{${K}}{s(s+${aa})^2}$`; v = K / (aa * aa); key = `s3r|${K}|${aa}`;
            easy = `$sF$ の分母が0になる $s=-${aa}$（2回）は左半分。$s\\to0$ で $\\frac{${K}}{${aa * aa}}$`;
          }
          if (v === 2) return null;
          a = `$${fmt(v)}$`;
        } else {
          const k = r.int(0, 2), K = r.int(1, 9);
          if (k === 0) { const w = r.int(2, 5); if (TEXT52.has(`${K}|${w * w}q`)) return null; q = `$F(s)=\\dfrac{${K}}{s(s^2+${w * w})}$`; key = `s3q|${K}|${w}`; easy = `$sF$ の分母が0になる $\\pm ${w}j$ は実部が0。ゆれ続けて落ち着かない`; }

          else if (k === 1) { const aa = r.int(1, 4); q = `$F(s)=\\dfrac{${K}}{s(s-${aa})}$`; key = `s3p|${K}|${aa}`; easy = `$sF$ の分母が0になる $${aa}$ は右半分（正）。ふえ続けて落ち着かない`; }
          else { const aa = r.int(1, 4); q = `$F(s)=\\dfrac{${K}}{s^2(s+${aa})}$`; key = `s3s|${K}|${aa}`; easy = `$sF=\\frac{${K}}{s(s+${aa})}$ の分母が0になる $0$ は左半分でない。$t$ に比例してふえ続ける`; }
          a = 'ない';
        }
        st.n++;
        return { q: `${q} のもとの関数の最後の値（ないときは「ない」）`, a, key, easy, verify: p => (v == null ? p.a === 'ない' || '答え' : valIs(p, v)) };
      },
      // わな：決まった時刻の値（もどしてから t を入れる。9-54）
      trap(r) {
        const a = r.intNot(1, 4, v => v === 3), m = r.int(2, 9), ts = [[1, 1], [2, 2], [3, 3]].concat(a % 2 === 0 ? [[0.5, 0.5]] : []), [x] = r.pick(ts), t = x / a, K = m * a;
        if (!Number.isInteger(t * 2) && t !== 0.25 && t !== 0.75) return null;
        if (r.e52 && r.e52.has(`${K}|${a}`)) return null;   // ステップ1と同じ式にしない（R2-13）
        const v = m * (1 - Math.exp(-x)), w = m * (1 - EXPV[x]);
        if (tie(w, 2) || rd(v, 2) !== rd(w, 2)) return null;
        return dest({ q: `$F(s)=\\dfrac{${K}}{s(s+${a})}$ のもとの関数の $t=${fmt(t)}$ での値（${expNote(x)}、小数第2位まで）`, a: `約 $${fx(w, 2)}$`, key: `t52|${a}`,
          verify: p => approxIs(p, v, w, 2) },
        '9-52', `はじめでも最後でもない時刻の値。もどして $${m}-${m}${expT(a)}$ に $t=${fmt(t)}$ を入れる`, ['9-54']);
      },
    },
  });

  // ---------------------------------------------------------------- 逆変換の問題の部品
  // 分母（1次式の積）の TeX と多項式：as = [a1, a2, …]（s+a の a。0 は s）
  const dTeX = as => { const f = as.slice().sort((x, y) => x - y); return f.length === 1 ? lin(f[0]) : f.map(plin).join(''); };
  const dPoly = as => as.reduce((acc, a) => pmul(acc, [a, 1]), [1]);
  const quadP = (a, w) => [a * a + w * w, 2 * a, 1];                 // (s+a)^2+w^2
  const quadT = (a, w) => polyT(quadP(a, w));
  // 逆変換の問題：N・D は数の多項式（低い次から）、roots は D の根（[re, im, 重なり]）。Fx は F(s) の TeX
  function invP(N, D, roots, Fx, ans, o) {
    return Object.assign({ q: Linv(Fx), a: `$${ans}$`, L: { F: Fx }, calc: o && o.calc ? o.calc : { kind: 'fn', vars: ['t'], want: residueWant(N, D, roots) } }, o || {});
  }
  const invFits = (q, p) => { const o = p && p.L && p.L.ode ? p.L.ode : (invOf(q, p) == null ? odeOf(q) : null); return o ? odeCase(o) : invCase(ratOf(invOf(q, p))); };
  // e^{-at}（P cos ωt + Q sin ωt）の TeX
  function dampT(a, w, Pc, Qc) {
    const inner = sumT([[Pc, trig('cos', w)], [Qc, trig('sin', w)]]), ex = expT(a);
    const v = x => F.val(Array.isArray(x) ? x : fr(x)), zp = v(Pc) === 0, zq = v(Qc) === 0;
    if (zp !== zq) return zp ? cterm(Qc, `${ex}${trig('sin', w)}`) : cterm(Pc, `${ex}${trig('cos', w)}`);
    return ex ? `${ex}\\left(${inner}\\right)` : inner;
  }
  // 微分方程式の文：coef（高い階から）、右辺、はじめの値
  function odeT(coef, rhs, x0, v0, v) {
    v = v || 'x';
    const L = coef.length === 3 ? sumT([[coef[0], `\\ddot ${v}`], [coef[1], `\\dot ${v}`], [coef[2], v]]) : sumT([[coef[0], `\\dot ${v}`], [coef[1], v]]);
    const init = coef.length === 3 ? `$${v}(0)=${x0}$、$\\dot ${v}(0)=${v0}$` : `$${v}(0)=${x0}$`;
    return `$${L}=${rhs}$、${init}`;
  }

  // ================================================================ 9-53
  // BAN：例（ω=3 の sin（何倍も）、1/(3s+6)（何倍も）、row9 の ω=1（何倍も））、教科書（5/(s+2)・3/(s+4)・4/(s+3)・6/(s^2+9)・10/(s^2+25)・12/(s^2+16)・3s/(s^2+4)・2s/(s^2+16)・5s/(s^2+1)・6s/(s^2+9)^2・8s/(s^2+16)^2・s/(s^2+4)^2、見わけようの 6/(s^2+4)）
  const TEXT53 = new Set(['e|2|5', 'e|4|3', 'e|3|4', 'sin|5|2', 'sin|4|3', 'sin|2|3', 'cos|2|3', 'cos|4|2', 'cos|1|5', 'r9|3|1', 'r9|4|1', 'r9|2|4']);
  add({
    id: '9-53', part: 4, chap: '9-7⑦ 例題1・9', stars: 1,
    title: '表の形にそろえて引く（定数倍を外に出す）',
    mark: '1つの項の $F(s)$。分母が $s+a$・$s^n$・$s^2+\\omega^2$（表の形そのもの。場合 A）。',
    futsu: ['$F(s)$ と同じになる $f(t)$ の形を', '$Ae^{-at}$・$A\\sin\\omega t$ などと置き、', 'それを変換して $F(s)$ とくらべ、', '$A$ を決める。'],
    raku: ['$\\frac{12}{s^2+9}=4\\times\\frac{3}{s^2+3^2}\\to4\\sin3t$', '$\\frac{1}{3s+6}=\\frac13\\times\\frac{1}{s+2}\\to\\frac13e^{-2t}$', '$\\frac{s}{(s^2+1)^2}=\\frac12\\times\\frac{2s}{(s^2+1)^2}$', '$\\to\\frac t2\\sin t$'],
    why: '逆に引く表（9-7）は、分子もふくめて形がぴったり合うときだけ引ける。合わないときは、定数倍を外に出してそろえる（線形だから、$\\mathcal L^{-1}[cF]=c\\,\\mathcal L^{-1}[F]$）。$\\sin\\omega t$ の行の分子は $\\omega$、$e^{-at}$ の行は $s$ の係数が1。',
    caution: '$\\frac{6}{s^2+9}$ を $6\\sin3t$ としない（分子を3にそろえて $2\\sin3t$）。$\\frac{1}{2s+1}$ は先に2でくくって $\\frac12\\cdot\\frac{1}{s+0.5}$。分母が2つの因数のかけ算なら、部分分数（わざ 9-54）。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '20mm', s3: '22mm', trap: '22mm' },
    boxh: '9mm',
    fits(q, p) {
      const X = invOf(q, p), c = invCase(ratOf(X));
      if (c === 'A') return true;
      // 平方完成した形 (s+a)^2+\omega^2 のままで、分子が定数か (s+a) の定数倍（表の行7・行8 そのもの）
      return c === 'D' && /\(s\+\d+\)\^2\+\d+\}/.test(X || '') && /\\dfrac\{(\d*|\d*\(s\+\d+\)|s\+\d+)\}/.test(X || '');
    },
    steps: {
      s1(r) {
        const kind = r.pick(['e', 'sin', 'cos', 'tn']), k = r.int(1, 6);
        if (kind === 'e') {
          const a = r.int(1, 6), c = r.int(2, 9);
          if (TEXT53.has(`e|${a}|${c}`)) return null;
          return invP([c], [a, 1], [[-a, 0, 1]], `\\dfrac{${c}}{s+${a}}`, cterm(c, expT(a)), { key: `A|e|${a}`, easy: `行3（$a=${a}$）の${c}倍` });
        }
        if (kind === 'sin' || kind === 'cos') {
          const w = r.intNot(1, 6, v => v === 3);
          if (TEXT53.has(`${kind}|${w}|${k}`)) return null;
          const N = kind === 'sin' ? [k * w] : [0, k];
          return invP(N, [w * w, 0, 1], [[0, w, 1], [0, -w, 1]], `\\dfrac{${kind === 'sin' ? k * w : (k === 1 ? '' : k) + 's'}}{s^2+${w * w}}`, cterm(k, trig(kind, w)),
            { key: `A|${kind}|${w}`, easy: kind === 'sin' ? `$${k}\\times\\frac{${w}}{s^2+${w}^2}$（行5、分子を${w}にそろえる）` : `行6（$\\omega=${w}$）${k === 1 ? 'そのもの' : `の${k}倍`}` });
        }
        const n = r.int(1, 4), c = k * FACT[n];
        return invP([c], Array(n + 1).fill(0).concat([1]), [[0, 0, n + 1]].map(x => x), `\\dfrac{${c}}{${spow(n + 1)}}`, cterm(k, tpow(n)), { key: `A|t|${n}`, easy: `$${k}\\times\\frac{${n}!}{${spow(n + 1)}}$（$${n}!=${FACT[n]}$）`, calc: { kind: 'fn', vars: ['t'], want: `${k}*t^${n}` } });
      },
      // 分子・分母の数をそろえる（分数の係数・s の係数が1でない・重なった1次式）
      s2(r) {
        const [k, ok] = alt(r, '53s2', 4);
        if (k === 0) {
          const w = r.pick([2, 4, 5, 6]), c = r.intNot(1, 9, v => v % w === 0), co = fr(c, w);
          if (c === 6 && w === 4) return null;
          return ok(invP([c], [w * w, 0, 1], [[0, w, 1], [0, -w, 1]], `\\dfrac{${c}}{s^2+${w * w}}`, cterm(co, trig('sin', w)), { key: `A2|sin|${w}`, easy: `$\\frac{${c}}{${w}}\\times\\frac{${w}}{s^2+${w}^2}$（行5）` }));
        }
        if (k === 1) {
          const kk = r.pick([2, 3, 4, 5]), a = r.int(1, 4), c = r.int(1, 6), m = kk * a, co = fr(c, kk);
          if (kk === 3 && a === 2) return null;
          return ok(invP([c], [m, kk], [[-a, 0, 1]], `\\dfrac{${c}}{${kk}s+${m}}`, cterm(co, expT(a)), { key: `A2|e|${a}`, easy: `$\\frac{${c}}{${kk}}\\times\\frac{1}{s+${a}}$（${kk}でくくる）` }));
        }
        if (k === 2) {
          const a = r.int(1, 5), c = r.int(2, 8), two = r.chance(0.35);
          if (two) {
            const co = fr(c, 2);
            return ok(invP([c], dPoly([a, a, a]), [[-a, 0, 3]].map(x => x), `\\dfrac{${c}}{(s+${a})^3}`, cterm(co, `t^{2}${expT(a)}`), { key: `A2|t2e|${a}`, easy: `$\\frac{2}{s^3}$ の $s$ を $s+${a}$ に（行2・$t^2$ の形）：$\\frac{${c}}{2}\\times\\frac{2}{(s+${a})^3}$`, calc: { kind: 'fn', vars: ['t'], want: `${c}/2*t^2*exp(-${a}*t)` } }));
          }
          return ok(invP([c], dPoly([a, a]), [[-a, 0, 2]], `\\dfrac{${c}}{(s+${a})^2}`, cterm(c, `t${expT(a)}`), { key: `A2|te|${a}`, easy: `行4（$a=${a}$）の${c}倍` }));
        }
        const n = r.int(2, 4), c = r.intNot(1, 9, v => v % FACT[n] === 0), co = fr(c, FACT[n]);
        return ok(invP([c], Array(n + 1).fill(0).concat([1]), [], `\\dfrac{${c}}{${spow(n + 1)}}`, cterm(co, tpow(n)), { key: `A2|t|${n}`, easy: `$${fq(co)}\\times\\frac{${n}!}{${spow(n + 1)}}$（$${n}!=${FACT[n]}$）`, calc: { kind: 'fn', vars: ['t'], want: `${c}/${n}!*t^${n}` } }));

      },
      // 見かけがちがう：行9（$t\sin\omega t$）・平方完成した形（行7・行8）
      s3(r) {
        const [k, ok] = alt(r, '53s3', 2);
        if (k === 0) {
          const w = r.int(2, 5), m = r.int(1, 8), co = fr(m, 2 * w);   // m s/(s^2+w^2)^2 = (m/2w) * 2ws/(...)^2
          if (TEXT53.has(`r9|${w}|${F.val(co)}`) || (w === 2 && m === 1) || (w === 3 && m === 6) || (w === 4 && m === 8)) return null;
          const D = pmul([w * w, 0, 1], [w * w, 0, 1]);
          return ok(invP([0, m], D, [[0, w, 2], [0, -w, 2]], `\\dfrac{${m === 1 ? '' : m}s}{(s^2+${w * w})^2}`, cterm(co, `t${trig('sin', w)}`),
            { key: `A|r9|${w}`, easy: `行9 $\\frac{2\\omega s}{(s^2+\\omega^2)^2}$（$\\omega=${w}$）にそろえる：$\\frac{${m}}{${2 * w}}\\times\\frac{${2 * w}s}{(s^2+${w * w})^2}$` }));
        }
        const a = r.int(1, 4), w = r.int(1, 4), c = r.int(1, 5), kind = r.pick(['sin', 'cos']);
        const N = kind === 'sin' ? [c * w] : [c * a, c], num = kind === 'sin' ? `${c * w}` : (c === 1 ? `s+${a}` : `${c}(s+${a})`);
        return ok(invP(N, quadP(a, w), [[-a, w, 1], [-a, -w, 1]], `\\dfrac{${num}}{(s+${a})^2+${w * w}}`, cterm(c, `${expT(a)}${trig(kind, w)}`),
          { key: `A|${kind}7|${a}|${w}`, easy: `行${kind === 'sin' ? 7 : 8}（$a=${a}$、$\\omega=${w}$）そのもの${c !== 1 ? `の${c}倍` : ''}` }));
      },
      // わな：1次式2つのかけ算（部分分数。9-54）
      trap(r) {
        const a = r.int(1, 4), b = a + r.int(1, 3), c = (b - a) * r.int(1, 3);
        if (a === 1 && b === 4 && c === 3) return null;
        const A = c / (b - a);
        return dest(invP([c], dPoly([a, b]), [[-a, 0, 1], [-b, 0, 1]], `\\dfrac{${c}}{${dTeX([a, b])}}`, sumT([[A, expT(a)], [-A, expT(b)]]), { key: `t53|${a}|${b}` }),
          '9-53', '分母が1次式2つのかけ算で、表の形そのものではない。部分分数に分けてから引く');
      },
    },
  });

  // ================================================================ 9-54
  // かくす方法。組 [[a, A], [b, B], …]（s+a の係数 A）。BAN：例（{1:2, 3:-1} と何倍か）、教科書の例題・じぶんでとこう・章末問題・見わけよう
  const canon54 = prs => prs.slice().sort((x, y) => x[0] - y[0]).map(x => x.join(':')).join('|');
  const ratio54 = prs => { const s2 = prs.slice().sort((x, y) => x[0] - y[0]); return s2.map(x => x[0]).join(',') + '/' + s2.map(x => fmt(x[1] / s2[0][1])).join(','); };
  const BAN54R = new Set([ratio54([[1, 2], [3, -1]])]);
  const TEXT54 = new Set([[[1, 3], [3, -1]], [[2, 3], [3, -2]], [[1, 2], [2, -1]], [[2, 2], [4, -1]], [[1, 2], [2, -2]], [[1, 1], [4, -1]], [[0, 6], [2, -6]], [[0, 1], [1, -1]]].map(canon54));
  const bad54 = prs => BAN54R.has(ratio54(prs)) || TEXT54.has(canon54(prs));
  // 組から N（分子）・D・答え
  function pf54(prs) {
    const as = prs.map(x => x[0]), D = dPoly(as);
    let N = [0];
    prs.forEach(([a, A], i) => { N = padd(N, pscale(dPoly(as.filter((_, j) => j !== i)), A)); });
    N = ptrim(pclean(N));
    const ans = sumT(prs.slice().sort((x, y) => x[0] - y[0]).map(([a, A]) => [A, a === 0 ? '' : expT(a)]));
    return { N, D, Fx: `\\dfrac{${polyT(N)}}{${dTeX(as)}}`, ans, roots: as.map(a => [-a, 0, 1]) };
  }
  const cover54 = prs => prs.slice().sort((x, y) => x[0] - y[0]).map(([a, A], i) => `$s=${-a}$ で $${'ABC'[i]}=${A}$`).join('、');
  add({
    id: '9-54', part: 4, chap: '9-7③④ 例題2・3', stars: 1,
    title: 'ちがう1次式のかけ算は「かくす方法」',
    mark: '分母が $(s+a)(s+b)$・$s(s+a)$ のような、ちがう1次式のかけ算（場合 B）。',
    futsu: ['$\\frac{A}{s+a}+\\frac{B}{s+b}$ と置いて通分し、', '分子の $s$ の係数と定数の項を', 'くらべて、$A$・$B$ の連立方程式を', '解く（3-8）。'],
    raku: ['$\\frac{s+5}{(s+1)(s+3)}=\\frac{A}{s+1}+\\frac{B}{s+3}$', '$A=\\frac{-1+5}{-1+3}=2$（$s+1$ をかくして $s=-1$）', '$B=\\frac{-3+5}{-3+1}=-1$', '→ $2e^{-t}-e^{-3t}$'],
    why: '両辺に $(s+a)$ をかけると、左辺は $(s+a)$ が消えた分数、右辺は $A+(s+a)\\times$（ほかの項）。ここで $s=-a$ を入れると、ほかの項が0になって $A$ だけが残る（9-7③）。あとは1つずつ行3 $\\frac{1}{s+a}\\to e^{-at}$ でもどす。',
    caution: '入れるのは、かくした1次式が0になる $s$（$s+1$ なら $s=-1$。符号に注意）。$\\frac{1}{s}$ の項は定数（行1）。$s$ の係数が1でない $2s+1$ は、先に2でくくる。同じ1次式が2回なら重解（わざ 9-55）。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '30mm', s3: '30mm', trap: '24mm' },
    boxh: '9mm',
    fits(q, p) { return invFits(q, p) === 'B'; },
    steps: {
      s1(r) {
        const a = r.int(1, 5), b = r.intNot(1, 6, v => v <= a), A = r.intNot(-4, 5, v => v === 0), B = r.intNot(-4, 5, v => v === 0), prs = [[a, A], [b, B]];
        if (bad54(prs)) return null;
        const T = pf54(prs);
        return invP(T.N, T.D, T.roots, T.Fx, T.ans, { key: `B|${ratio54(prs)}`, easy: `かくす方法：${cover54(prs)}` });
      },
      // s のある分母・3つの1次式
      s2(r) {
        const [k, ok] = alt(r, '54s2', 2);
        const as = k === 0 ? [0, r.int(1, 5)] : r.chance(0.5) ? [0, ...r.shuffle([1, 2, 3, 4]).slice(0, 2)] : r.shuffle([1, 2, 3, 4, 5]).slice(0, 3);
        const prs = as.map(a => [a, r.intNot(-3, 4, v => v === 0)]);
        if (bad54(prs) || prs.some(x => x[1] === 0)) return null;
        const T = pf54(prs);
        if (T.N.length > 2 && k === 1 && T.N[T.N.length - 1] === 0) return null;
        return ok(invP(T.N, T.D, T.roots, T.Fx, T.ans, { key: `B|${ratio54(prs)}`, easy: `かくす方法：${cover54(prs)}` }));
      },
      // 見かけがちがう：微分方程式をラプラス変換で解く
      s3(r) {
        const [k, ok] = alt(r, '54s3', 2);
        if (k === 0) {
          const a = r.int(1, 3), b = a + r.int(1, 3), A = r.intNot(-2, 4, v => v === 0), B = r.intNot(-3, 3, v => v === 0), prs = [[a, A], [b, B]];
          const x0 = A + B, v0 = -a * A - b * B;
          if (bad54(prs) || usedKey(r, '9-54', `B|${ratio54(prs)}`) || x0 < 0) return null;
          const T = pf54(prs), coef = [1, a + b, a * b];
          return ok({ q: `${odeT(coef, 0, x0, v0)} を、ラプラス変換で解いた $x$`, a: `$${T.ans}$`, key: `B|${ratio54(prs)}`, L: { ode: { coef, rhs: '0' } },
            calc: { kind: 'ode', x: 't', coef, rhs: '0', init: [[0, x0], [0, v0, 1]] },
            easy: `$X=${T.Fx.replace('\\dfrac', '\\frac')}$。${cover54(prs)}` });
        }
        const a = r.int(2, 6), m = r.int(2, 6), V = a * m;
        if (usedKey(r, '9-54', `B|${ratio54([[0, m], [a, -m]])}`) || bad54([[0, m], [a, -m]])) return null;
        const ans = sumT([[m, ''], [-m, expT(a)]]);
        return ok({ q: `$\\dot v+${a}v=${V}$、$v(0)=0$ を、ラプラス変換で解いた $v$`, a: `$${ans}$`, key: `B|${ratio54([[0, m], [a, -m]])}`, L: { ode: { coef: [1, a], rhs: 'const' } },
          calc: { kind: 'ode', x: 't', coef: [1, a], rhs: String(V), init: [[0, 0]] },
          easy: `$V=\\frac{${V}}{s(s+${a})}$。$s=0$ で $A=${m}$、$s=-${a}$ で $B=-${m}$` });
      },
      // わな：重解（9-55）・分けられない2次式（9-56）
      trap(r) {
        const [k, ok] = alt(r, '54t', 2), a = r.int(1, 4);
        if (k === 0) {
          const P0 = r.int(1, 3), R = r.intNot(-3, 4, v => v === 0), N = [P0 * a + R, P0];
          return ok(dest(invP(N, dPoly([a, a]), [[-a, 0, 2]], `\\dfrac{${polyT(N)}}{(s+${a})^2}`, `\\left(${sumT([[P0, ''], [R, 't']])}\\right)${expT(a)}`, { key: `t54|${a}` }),
            '9-54', `同じ1次式 $s+${a}$ が2回。$\\frac{A}{s+${a}}+\\frac{B}{s+${a}}$ では分けられない`));
        }
        const w = r.int(1, 3), N = [a + r.int(1, 4), 1], R = N[0] - a;
        return ok(dest(invP(N, quadP(a, w), [[-a, w, 1], [-a, -w, 1]], `\\dfrac{${polyT(N)}}{${quadT(a, w)}}`, dampT(a, w, 1, fr(R, w)), { key: `t54q|${a}|${w}` }),
          '9-54', `分母 $${quadT(a, w)}$ は判別式が負で、1次式に分けられない`));
      },
    },
  });

  // ================================================================ 9-55
  // 重解：(ps+q)/(s+a)^2 = P e^{-at} + R t e^{-at}（R=q-Pa）。BAN：例（a=2、R/P=3/2）、教科書（a=1:1,2・a=2:1,2・a=3:1,3・見わけよう a=3:1,1）
  const TEXT55 = new Set(['1|1|2', '2|1|2', '3|1|3', '3|1|1']);
  const bad55 = (a, P0, R) => (a === 2 && R * 2 === P0 * 3) || TEXT55.has(`${a}|${P0}|${R}`);
  const rep55 = (P0, R) => `\\left(${sumT([[P0, ''], [R, 't']])}\\right)`;
  add({
    id: '9-55', part: 4, chap: '9-7⑧ 例題4', stars: 1,
    title: '重解は $\\frac{A}{s+a}+\\frac{B}{(s+a)^2}$（$te^{-at}$ が出る）',
    mark: '分母に $(s+a)^2$。同じ1次式が2回（場合 C）。臨界減衰。',
    futsu: ['$\\frac{A}{s+a}+\\frac{B}{(s+a)^2}$ を通分して、', '分子を展開し、$s$ の係数と', '定数の項をくらべて、', '$A$・$B$ の連立方程式を解く。'],
    raku: ['$\\frac{2s+7}{(s+2)^2}$：$2s+7=A(s+2)+B$', '$s=-2$ で $B=3$、$s$ の係数で $A=2$', '→ $2e^{-2t}+3te^{-2t}$', '$=(2+3t)e^{-2t}$'],
    why: '$\\frac{A}{s+a}+\\frac{B}{s+a}$ では分母が1回の式しか作れないので、2乗の項 $\\frac{B}{(s+a)^2}$ を置く（9-7⑧）。両辺に $(s+a)^2$ をかけた $N(s)=A(s+a)+B$ で、$s=-a$ を入れると $B$、$s$ の係数をくらべると $A$。$\\frac{1}{(s+a)^2}$ は行4で $te^{-at}$。',
    caution: '$\\frac{B}{(s+a)^2}$ を忘れない。もどすと $te^{-at}$ が出る（6-12 の重解 $(A+Bt)e^{st}$ と同じ形）。分子が定数だけなら、表の形そのもの（わざ 9-53）。分母が分けられない2次式なら平方完成（わざ 9-56）。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '26mm', s3: '30mm', trap: '30mm' },
    boxh: '9mm',
    fits(q, p) { return invFits(q, p) === 'C'; },
    steps: {
      s1(r) {
        const a = r.int(1, 5), P0 = r.pick([1, 1, 2, 3, -1]), R = r.intNot(-4, 5, v => v === 0);
        if (bad55(a, P0, R)) return null;
        const N = [P0 * a + R, P0];
        return invP(N, dPoly([a, a]), [[-a, 0, 2]], `\\dfrac{${polyT(N)}}{(s+${a})^2}`, `${rep55(P0, R)}${expT(a)}`,
          { key: `C|${a}|${fmt(R / P0)}`, easy: `$${polyT(N)}=A(s+${a})+B$。$s=${-a}$ で $B=${R}$、$s$ の係数で $A=${P0}$` });
      },
      // 臨界減衰の微分方程式
      s2(r) {
        const a = r.int(1, 4), x0 = r.int(1, 3), v0 = r.int(-3, 3), R = v0 + a * x0;
        if (R === 0 || bad55(a, x0, R)) return null;
        const coef = [1, 2 * a, a * a];
        return { q: `${odeT(coef, 0, x0, v0)} を、ラプラス変換で解いた $x$`, a: `$${rep55(x0, R)}${expT(a)}$`, key: `C|${a}|${fmt(R / x0)}`, L: { ode: { coef, rhs: '0' } },
          calc: { kind: 'ode', x: 't', coef, rhs: '0', init: [[0, x0], [0, v0, 1]] },
          easy: `$X=\\frac{${polyT([x0 * 2 * a + v0, x0])}}{(s+${a})^2}$。$B=${R}$、$A=${x0}$` };
      },
      // 見かけがちがう：s と重解 K/(s(s+a)^2)
      s3(r) {
        const a = r.int(1, 4), m = r.int(1, 4), K = m * a * a;
        return { q: Linv(`\\dfrac{${K}}{s(s+${a})^2}`), a: `$${sumT([[m, ''], [-m, expT(a)], [-m * a, `t${expT(a)}`]])}$`, key: `C3|${a}`, L: { F: `\\dfrac{${K}}{s(s+${a})^2}` },
          calc: { kind: 'fn', vars: ['t'], want: residueWant([K], pmul([0, 1], dPoly([a, a])), [[0, 0, 1], [-a, 0, 2]]) },
          easy: `$\\frac{A}{s}+\\frac{B}{s+${a}}+\\frac{C}{(s+${a})^2}$。$A=${m}$、$C=${-m * a}$（かくす方法）、$s^2$ の係数で $B=${-m}$` };
      },
      // わな：分けられない2次式（9-56）
      trap(r) {
        const a = r.int(1, 3), w = r.int(1, 3), R = r.intNot(1, 5, v => v === w * 0), N = [a + R, 1];
        if ((a === 1 && w === 2 && R === 1) || (a === 2 && w === 1 && R === 1) || (a === 1 && w === 2 && R === 2)) return null;
        return dest(invP(N, quadP(a, w), [[-a, w, 1], [-a, -w, 1]], `\\dfrac{${polyT(N)}}{${quadT(a, w)}}`, dampT(a, w, 1, fr(R, w)), { key: `t55|${a}|${w}` }),
          '9-55', `分母 $${quadT(a, w)}$ は2乗の形 $(s+a)^2$ ではない。判別式が負で、平方完成する`);
      },
    },
  });

  // ================================================================ 9-56
  // 平方完成：N = P(s+a) + R、分母 (s+a)^2+ω^2 → e^{-at}(P cos ωt + (R/ω) sin ωt)
  //   BAN：例（a=1、ω=3、R/P=4）、教科書（1,2,1,1・2,3,1,2・3,1,1,3・1,3,1,1・見わけよう 2,1,1,1・目録のわな 1,2,1,2）
  const TEXT56 = new Set(['1|2|1|1', '2|3|1|2', '3|1|1|3', '1|3|1|1', '2|1|1|1', '1|2|1|2']);
  const bad56 = (a, w, P0, R) => (a === 1 && w === 3 && R === 4 * P0) || TEXT56.has(`${a}|${w}|${P0}|${R}`);
  function sq56(a, w, P0, R) {
    const N = ptrim([P0 * a + R, P0]);
    return { N, Fx: `\\dfrac{${polyT(N)}}{${quadT(a, w)}}`, ans: dampT(a, w, P0, fr(R, w)), roots: [[-a, w, 1], [-a, -w, 1]],
      easy: `$${quadT(a, w)}=(s+${a})^2+${w}^2$、分子 $=${P0 === 0 ? '' : sumT([[P0, `(s+${a})`]])}${R ? (R > 0 && P0 ? '+' : '') + R : ''}$` };
  }
  add({
    id: '9-56', part: 4, chap: '9-7⑨ 例題6', stars: 1,
    title: '分けられない2次式は平方完成し、分子を $(s+a)$ と定数に分ける',
    mark: '分母が、判別式が負の2次式1つだけ（場合 D）。ゆれながらもどる動き。',
    futsu: ['分母を複素数の1次式 $(s-p)(s-\\bar p)$ に分け、', 'かくす方法で複素数の係数を出し、', '$Ae^{pt}+\\bar Ae^{\\bar pt}$ を', 'オイラーの公式で実数の形に直す。'],
    raku: ['$\\frac{s+5}{s^2+2s+10}$：$(s+1)^2+3^2$', '$=\\frac{s+1}{(s+1)^2+3^2}+\\frac43\\cdot\\frac{3}{(s+1)^2+3^2}$', '→ $e^{-t}\\left(\\cos3t+\\frac43\\sin3t\\right)$', '（行8と行7）'],
    why: '分母を $(s+a)^2+\\omega^2$ にすると、表の行8 $\\frac{s+a}{(s+a)^2+\\omega^2}$（$e^{-at}\\cos\\omega t$）と行7 $\\frac{\\omega}{(s+a)^2+\\omega^2}$（$e^{-at}\\sin\\omega t$）の形が見える（9-7⑨）。分子を「$(s+a)$ の何倍＋定数」に直し、定数は $\\omega$ の何倍かにそろえる。分母が0になる $s=-a\\pm\\omega j$ の実部が「へる速さ」、虚部が「ゆれの速さ」。',
    caution: '平方完成は $s$ の係数の半分を使う（$s^2+2s+5=(s+1)^2+4$。$(s+2)^2+1$ ではない）。分子の $s$ は $(s+a)-a$ と直す。定数の項は $\\omega$ でわる。ほかに $s$ などの因数があれば、場合 E（わざ 9-57）。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '36mm', s3: '36mm', trap: '36mm' },
    boxh: '9mm',
    fits(q, p) { return invFits(q, p) === 'D'; },
    steps: {
      s1(r) {
        const a = r.int(1, 4), w = r.int(1, 4), P0 = r.pick([1, 1, 1, 2, 3]), R = r.intNot(-4, 8, v => v === 0);
        if (bad56(a, w, P0, R)) return null;
        const T = sq56(a, w, P0, R);
        return invP(T.N, quadP(a, w), T.roots, T.Fx, T.ans, { key: `D|${a}|${w}`, easy: T.easy });
      },
      // ゆれながらもどる微分方程式
      s2(r) {
        const a = r.int(1, 3), w = r.int(1, 4), x0 = r.int(1, 3), v0 = r.int(-2, 4), R = v0 + a * x0;
        if (bad56(a, w, x0, R)) return null;
        const coef = [1, 2 * a, a * a + w * w], T = sq56(a, w, x0, R);
        return { q: `${odeT(coef, 0, x0, v0)} を、ラプラス変換で解いた $x$`, a: `$${T.ans}$`, key: `D|${a}|${w}`, L: { ode: { coef, rhs: '0' } },
          calc: { kind: 'ode', x: 't', coef, rhs: '0', init: [[0, x0], [0, v0, 1]] }, easy: `$X=${T.Fx.replace('\\dfrac', '\\frac')}$。${T.easy}` };
      },
      // 見かけがちがう：分子が定数だけ・s だけ
      s3(r) {
        const [k, ok] = alt(r, '56s3', 2), a = r.int(1, 4), w = r.int(1, 4);
        if (k === 0) {
          const c = r.int(1, 9), T = sq56(a, w, 0, c);
          if (usedKey(r, '9-56', `D|${a}|${w}`)) return null;
          return ok(invP(T.N, quadP(a, w), T.roots, T.Fx, T.ans, { key: `D|${a}|${w}`, easy: `$(s+${a})^2+${w}^2$。$\\frac{${c}}{${w}}\\times\\frac{${w}}{(s+${a})^2+${w}^2}$（行7）` }));
        }
        const P0 = r.int(1, 3), T = sq56(a, w, P0, -P0 * a);
        if (usedKey(r, '9-56', `D|${a}|${w}`)) return null;
        return ok(invP(T.N, quadP(a, w), T.roots, T.Fx, T.ans, { key: `D|${a}|${w}`, easy: `分子 $${P0 === 1 ? '' : P0}s=${P0 === 1 ? '' : P0}(s+${a})-${P0 * a}$。${T.easy.split('、')[0]}` }));
      },
      // わな：2次式のほかに s がある（9-57）
      trap(r) {
        const a = r.int(1, 3), w = r.int(1, 3), b = a * a + w * w, m = r.int(1, 3), K = m * b;
        if ((a === 1 && w === 2) || (a === 2 && w === 2) || (a === 2 && w === 3) || (a === 1 && w === 3)) return null;
        const N = [K], D = pmul([0, 1], quadP(a, w));
        return dest(invP(N, D, [[0, 0, 1], [-a, w, 1], [-a, -w, 1]], `\\dfrac{${K}}{s(${quadT(a, w)})}`, `${m}-${m === 1 ? '' : m}${dampT(a, w, 1, fr(a, w))}`, { key: `t56|${a}|${w}` }),
          '9-56', `分母に2次式のほかに $s$ がある。$\\frac{A}{s}+\\frac{Bs+C}{${quadT(a, w)}}$ に分けてから`);
      },
    },
  });

  // ================================================================ 9-57
  // 2次式とほかの因数。BAN：例（a=2、ω=2）、教科書（1,2・2,3・1,3、見わけよう 1,2、(s+c)(s^2+ω^2) の形はなし）
  const TEXT57 = new Set(['1|2', '2|3', '1|3', '2|2']);
  add({
    id: '9-57', part: 4, chap: '9-7⑩ 例題7・8', stars: 1,
    title: '2次式とほかの因数がまざるとき、2次式の分子は $Bs+C$',
    mark: '$\\frac{\\cdots}{s(s^2+\\cdots)}$、一定の力・ゆすりのある式（場合 E）。',
    futsu: ['$\\frac{A}{s}+\\frac{Bs+C}{s^2+\\cdots}$ を通分して', '分子を展開し、$s^2$・$s$・定数の', '3つの係数をくらべて、', '3つの連立方程式を解く。'],
    raku: ['$\\frac{8}{s(s^2+4s+8)}$：$A=\\frac{8}{8}=1$（かくす方法）', '$8=(s^2+4s+8)+(Bs+C)s$ で $B=-1$、$C=-4$', '$\\frac1s-\\frac{(s+2)+2}{(s+2)^2+2^2}$', '→ $1-e^{-2t}(\\cos2t+\\sin2t)$'],
    why: '1次式の因数の係数 $A$ は、かくす方法で先に出す。2次式の分子は、定数だけでは係数が合わないので $Bs+C$ と置く（9-7⑩）。$A$ を入れて分母をはらい、$s^2$ と $s$ の係数をくらべれば $B$・$C$ が出る。2次式の項は、平方完成して行7・行8 でもどす（わざ 9-56）。',
    caution: '2次式の分子を定数 $B$ だけにしない。$\\frac{A}{s}$ の $A$ が、最後に落ち着く値（最終値の定理と同じ）。分けられない2次式が2つのときも同じく、どちらの分子も1次式。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '40mm', s3: '40mm', trap: '30mm' },
    boxh: '9mm',
    fits(q, p) { return invFits(q, p) === 'E'; },
    steps: {
      s1(r) {
        const a = r.int(1, 3), w = r.int(1, 3), b = a * a + w * w, m = r.int(1, 4), K = m * b;
        if (TEXT57.has(`${a}|${w}`) && (m === 1 || (a === 2 && w === 2))) return null;
        const D = pmul([0, 1], quadP(a, w));
        return invP([K], D, [[0, 0, 1], [-a, w, 1], [-a, -w, 1]], `\\dfrac{${K}}{s(${quadT(a, w)})}`, `${m}-${m === 1 ? '' : m}${dampT(a, w, 1, fr(a, w))}`,
          { key: `E|${a}|${w}`, easy: `$A=\\frac{${K}}{${b}}=${m}$。$${K}=${m === 1 ? '' : m}(${quadT(a, w)})+(Bs+C)s$ で $B=${-m}$、$C=${-2 * a * m}$` });
      },
      // 一定の力をかけ続ける微分方程式
      s2(r) {
        const a = r.int(1, 3), w = r.int(1, 3), b = a * a + w * w, m = r.int(1, 3), K = m * b;
        if (TEXT57.has(`${a}|${w}`) && (m === 1 || (a === 2 && w === 2))) return null;
        const coef = [1, 2 * a, b];
        return { q: `${odeT(coef, K, 0, 0)} を、ラプラス変換で解いた $x$`, a: `$${m}-${m === 1 ? '' : m}${dampT(a, w, 1, fr(a, w))}$`, key: `E|${a}|${w}`, L: { ode: { coef, rhs: 'const' } },
          calc: { kind: 'ode', x: 't', coef, rhs: String(K), init: [[0, 0], [0, 0, 1]] },
          easy: `$X=\\frac{${K}}{s(${quadT(a, w)})}$。$A=${m}$、$B=${-m}$、$C=${-2 * a * m}$` };
      },
      // 見かけがちがう：1次式 s+c と s^2+ω^2（ゆすりの分母）
      s3(r) {
        const c = r.int(1, 3), w = r.int(1, 3), A = r.intNot(-2, 3, v => v === 0), K = A * (c * c + w * w);
        const D = pmul([c, 1], [w * w, 0, 1]), ans = sumT([[A, expT(c)], [-A, trig('cos', w)], [fr(A * c, w), trig('sin', w)]]);
        return { q: Linv(`\\dfrac{${K}}{(s+${c})(s^2+${w * w})}`), a: `$${ans}$`, key: `E3|${c}|${w}`, L: { F: `\\dfrac{${K}}{(s+${c})(s^2+${w * w})}` },
          calc: { kind: 'fn', vars: ['t'], want: residueWant([K], D, [[-c, 0, 1], [0, w, 1], [0, -w, 1]]) },
          easy: `$\\frac{A}{s+${c}}+\\frac{Bs+C}{s^2+${w * w}}$。$A=\\frac{${K}}{${c * c + w * w}}=${A}$、係数をくらべて $B=${-A}$、$C=${A * c}$` };
      },
      // わな：1次式だけ（9-54）
      trap(r) {
        const a = r.int(1, 2), b = a + r.int(1, 3), m = r.int(1, 3), K = m * a * b;
        if ((a === 1 && b === 2 && m === 1) || (a === 2 && b === 3 && m === 1)) return null;
        const prs = [[0, m], [a, -m * b / (b - a)], [b, m * a / (b - a)]];
        if (!prs.every(x => Number.isInteger(x[1] * 2))) return null;
        const T = pf54(prs);
        return dest(invP(T.N, T.D, T.roots, T.Fx, sumT([[m, ''], [fr(-m * b, b - a), expT(a)], [fr(m * a, b - a), expT(b)]]), { key: `t57|${a}|${b}` }),
          '9-57', '分母は1次式だけ（2次式がない）。かくす方法だけで分けられる');
      },
    },
  });

  // ================================================================ 9-58
  // e^{-st0} × 分数。答えは「$t<t_0$ で □、$t\geqq t_0$ で □」の2つの欄（W-4）。検算は verify（1つめが0、2つめを $t\geqq t_0$ の点で、留数の式とくらべる）
  //   BAN：例（t0=3、a=2 の K/(s(s+2))。何倍も）、教科書（e^{-2s}・10/(s(2s+1))、e^{-s}・6/(s(0.5s+1))=12/(s(s+2))、e^{-3s}/(s+1)、見わけようの e^{-2s}/(s+1)）
  const TEXT58 = new Set(['e|3|1|1', 'e|2|1|1', 'B|1|2|6']);
  function twoIs(p, t0, want) {
    const parts = (String(p.a).match(/\$[^$]*\$/g) || []).map(strip);
    if (parts.length !== 2) return `答え ${p.a} の欄が2つでない`;
    if (ev(parts[0]) !== 0) return `答え ${p.a} の1つめ（$t<${t0}$）が0でない`;
    for (const d of [0.37, 1.13, 2.29]) {
      const t = t0 + d, g = M.evalC(parts[1], { t }), w = M.evalC(want, { t });
      if (!g || !w || Math.hypot(g[0] - w[0], g[1] - w[1]) > 1e-8 * Math.max(1, Math.hypot(...w))) return `答え ${p.a} の2つめが $t=${fmt(t)}$ でちがう`;
    }
    return true;
  }
  const shiftT = (want, t0) => want.replace(/t/g, `(t-${t0})`);
  function del58(N, D, roots, Fx, t0, ansT, o) {
    const want = shiftT(residueWant(N, D, roots), t0), Fd = `${es(t0)}${Fx}`;
    return Object.assign({ q: `${Linv(Fd)} は、$t<${t0}$ で □、$t\\geqq${t0}$ で □`, a: `$0$、$${ansT}$`, L: { F: Fd }, verify: p => twoIs(p, t0, want), boxw: '26mm' }, o || {});
  }
  add({
    id: '9-58', part: 4, chap: '9-7⑪ 例題10', stars: 1,
    title: '$e^{-st_0}$ は外してもどし、$t_0$ だけ右へずらす',
    mark: '$e^{-st_0}\\times$（分数）。スイッチをおくれて入れた（場合 F）。',
    futsu: ['$e^{-st_0}$ をかけたまま、', '時間の世界の関数を $f(t-t_0)H(t-t_0)$ と置いて', '変換し、$F(s)$ とくらべて', '$f$ を決める。'],
    raku: ['$e^{-3s}\\cdot\\frac{2}{s(s+2)}$：$\\frac{2}{s(s+2)}=\\frac1s-\\frac{1}{s+2}$', '$\\to1-e^{-2t}$', '$t<3$ で0、$t\\geqq3$ で $1-e^{-2(t-3)}$', '（$t$ を $t-3$ に）'],
    why: '時間のずらし $\\mathcal L[f(t-t_0)H(t-t_0)]=e^{-st_0}F(s)$ を逆に使う（9-7⑪、表の行11）。$e^{-st_0}$ は $s$ の多項式ではないので部分分数の中に入れず、残りの $F(s)$ だけをもどし、答えの $t$ を $t-t_0$ に書きかえる。$t<t_0$ では0。',
    caution: '$e^{-st_0}$ を分子に入れて $A=10e^{-2s}$ などとしない。ずらすのは $t$ だけ（$e^{-2t}$ の2は変えずに $e^{-2(t-3)}$）。$e^{-2}$ のように $s$ をふくまない数は、ただの定数倍（ずらさない）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '26mm', s3: '16mm', trap: '22mm' },
    boxh: '9mm',
    fits(q, p) { return invCase(ratOf(invOf(q, p))) === 'F'; },
    steps: {
      // e^{-t0 s} × 表の形
      s1(r) {
        const kind = r.pick(['e', 'e', 't', 'sin']), t0 = r.int(1, 5), c = r.int(1, 5);
        if (kind === 'e') {
          const a = r.int(1, 4);
          if (TEXT58.has(`e|${t0}|${a}|${c}`)) return null;
          return del58([c], [a, 1], [[-a, 0, 1]], `\\dfrac{${c === 1 ? '' : c}}{s+${a}}`.replace('\\dfrac{}', '\\dfrac{1}'), t0, cterm(c, expT(a, t0)), { key: `F|e|${t0}|${a}`, easy: `$\\frac{${c}}{s+${a}}\\to ${cterm(c, expT(a))}$ を${t0}だけずらす` });
        }
        if (kind === 't') return del58([c], [0, 0, 1], [], `\\dfrac{${c}}{s^2}`, t0, cterm(c, `(t-${t0})`), { key: `F|t|${t0}`, easy: `$\\frac{${c}}{s^2}\\to ${cterm(c, 't')}$ を${t0}だけずらす`, verify: p => twoIs(p, t0, `${c}*(t-${t0})`) });
        const w = r.int(1, 4);
        return del58([c * w], [w * w, 0, 1], [[0, w, 1], [0, -w, 1]], `\\dfrac{${c * w}}{s^2+${w * w}}`, t0, cterm(c, trig('sin', w, t0)), { key: `F|sin|${t0}|${w}`, easy: `$\\frac{${c * w}}{s^2+${w * w}}\\to ${cterm(c, trig('sin', w))}$ を${t0}だけずらす` });
      },
      // e^{-t0 s} × K/(s(s+a))（RC 回路をおくれて入れた形）
      s2(r) {
        const t0 = r.int(1, 5), a = r.int(1, 5), m = r.int(1, 6), K = m * a;
        if ((t0 === 3 && a === 2) || TEXT58.has(`B|${t0}|${a}|${K}`)) return null;
        return del58([K], [0, a, 1], [[0, 0, 1], [-a, 0, 1]], `\\dfrac{${K}}{s(s+${a})}`, t0, sumT([[m, ''], [-m, expT(a, t0)]]),
          { key: `F|B|${t0}|${a}`, easy: `$\\frac{${K}}{s(s+${a})}=\\frac{${m}}{s}-\\frac{${m}}{s+${a}}\\to ${m}-${m === 1 ? '' : m}${expT(a)}$ を${t0}だけずらす` });
      },
      // 見かけがちがう：おくれて入れた RC 回路の、決まった時刻の電圧（ずらす前の時刻なら0）
      s3(r) {
        const st = r.s58 || (r.s58 = { n: r.int(0, 2) }), t0 = r.int(1, 4), a = r.pick([1, 2, 4]), m = r.pick([2, 3, 5, 6, 10, 12]), K = m * a;
        if ((t0 === 3 && a === 2) || usedKey(r, '9-58', `F|B|${t0}|${a}`)) return null;
        const Vs = `V(s)=${es(t0)}\\times\\dfrac{${K}}{s(s+${a})}`, L = { F: `${es(t0)}\\dfrac{${K}}{s(s+${a})}` };
        if (st.n % 3 === 2) {
          const T = r.int(0, t0 - 1) + 0.5 * r.int(0, 1);
          if (T >= t0 || T === 0) return null;
          st.n++;
          return { q: `スイッチをおくれて入れた回路のコンデンサーの電圧の変換が $${Vs}$ のとき、${fmt(T)}秒後の電圧（V）`, a: '$0$', key: `F|B|${t0}|${a}`, L,
            easy: `$t<${t0}$ ではまだ0（もどすと $t\\geqq${t0}$ で $${m}-${m}${expT(a, t0)}$）`, verify: p => valIs(p, 0) };
        }
        const x = r.pick(a === 1 ? [1, 2, 3] : a === 2 ? [1, 2, 3] : [1, 2]), T = t0 + x / a;
        const v = m * (1 - Math.exp(-x)), w = m * (1 - EXPV[x]);
        if (tie(w, 2) || rd(v, 2) !== rd(w, 2)) return null;
        st.n++;
        return { q: `スイッチをおくれて入れた回路のコンデンサーの電圧の変換が $${Vs}$ のとき、${fmt(T)}秒後の電圧（V。${expNote(x)}、小数第2位まで）`, a: `約 $${fx(w, 2)}$`, key: `F|B|${t0}|${a}`, L,
          easy: `もどしてずらすと $${m}-${m}${expT(a, t0)}$。$t=${fmt(T)}$ で $${m}-${m}e^{-${x}}$`, verify: p => approxIs(p, v, w, 2) };
      },
      // わな：$s$ をふくまない $e^{-k}$（ただの定数倍。ずらさない。9-53）
      trap(r) {
        const k = r.int(1, 3), a = r.int(1, 4), kind = r.pick(['e', 't']), E = `e^{-${k}}`;
        if (kind === 'e') {
          return dest({ q: Linv(`\\dfrac{${E}}{s+${a}}`), a: `$e^{-${a === 1 ? '' : a}t-${k}}$`, key: `t58|e|${k}|${a}`, L: { F: `\\dfrac{${E}}{s+${a}}` }, calc: { kind: 'fn', vars: ['t'], want: `exp(-${k})*exp(-${a}*t)` } },   // 答えは $e^{-1}e^{-4t}$ ではなく $e^{-4t-1}$（Y-6）
            '9-58', `$${E}$ には $s$ がないので、ただの定数倍。ずらさずに、表の行3の${E}倍`.replace(`の${E}倍`, `の $${E}$ 倍`));
        }
        return dest({ q: Linv(`\\dfrac{${E}}{s^2}`), a: `$${E}t$`, key: `t58|t|${k}`, L: { F: `\\dfrac{${E}}{s^2}` }, calc: { kind: 'fn', vars: ['t'], want: `exp(-${k})*t` } },
          '9-58', `$${E}$ には $s$ がないので、ただの定数倍。ずらさずに、表の行2の $${E}$ 倍`);
      },
    },
  });

  // ================================================================ 9-59
  // 分子の次数が分母と同じ：(ps+q)/(s+c) = p + R/(s+c) → pδ(t) + R e^{-ct}。BAN：例（p=3、c=2、R/p=1/3）、教科書（2,2,1・3,1,1・4,2,1・見わけよう 2,1,3）
  const TEXT59 = new Set(['2|2|1', '3|1|1', '4|2|1', '2|1|3']);
  function deltaIs(p, dc, want) {
    const t = strip(p.a), m = /([+-]?\d*)\\delta\(t\)/.exec(t);
    if (!m) return `答え ${p.a} に $\\delta(t)$ がない`;
    const c = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : +m[1];
    if (c !== dc) return `答え ${p.a} の $\\delta(t)$ の係数が ${dc} でない`;
    let rest = (t.slice(0, m.index) + t.slice(m.index + m[0].length)).trim();
    if (rest.startsWith('+')) rest = rest.slice(1);
    for (const x of [0.37, 1.13, 2.29]) {
      const g = ev(rest, { t: x }), w = M.evalC(want, { t: x });
      if (g == null || !w || Math.abs(g - w[0]) > 1e-8 * Math.max(1, Math.abs(w[0]))) return `答え ${p.a} の $\\delta$ のほかの部分が $t=${x}$ でちがう`;
    }
    return true;
  }
  add({
    id: '9-59', part: 4, chap: '9-7⑪ 例題11', stars: 1,
    title: '分子の次数が分母と同じなら先にわり算（商は $\\delta(t)$）',
    mark: '$\\frac{as+b}{s+c}$ のように、分子と分母の次数が同じ（場合 G）。',
    futsu: ['$A+\\frac{B}{s+c}$ と置いて通分し、', '分子の $s$ の係数と定数の項を', 'くらべて $A$・$B$ を出す。', '定数 $A$ は表の行10 で $\\delta(t)$。'],
    raku: ['$\\frac{3s+7}{s+2}$：$3s+7=3(s+2)+1$', '$=3+\\frac{1}{s+2}$', '$\\to3\\delta(t)+e^{-2t}$', '（商は $\\delta$、余りは表で）'],
    why: '表のどの行も、分子の次数が分母より小さい（行10 の $1\\to\\delta(t)$ だけが例外）。そこで分子を「分母×商＋余り」に直し（3-8 の係数くらべ）、商の定数を $\\delta(t)$、余りの分数をふつうにもどす（9-7⑪）。',
    caution: '商の定数を「定数の関数」と読まない（定数 $c$ の変換は $\\frac cs$。$c$ そのものは $c\\,\\delta(t)$ の変換）。余りの分数は、流れ図の次の問いへもどって、表の形・部分分数でもどす。分子の次数が分母より大きいときは、この巻ではあつかわない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '22mm', s3: '30mm', trap: '22mm' },
    boxh: '9mm',
    fits(q, p) { return invCase(ratOf(invOf(q, p))) === 'G'; },
    steps: {
      s1(r) {
        const p0 = r.int(1, 5), c = r.int(1, 5), R = r.intNot(1, 6, v => v === 0);
        if ((c === 2 && 3 * R === p0) || TEXT59.has(`${p0}|${c}|${R}`)) return null;
        const N = [p0 * c + R, p0], want = residueWant([R], [c, 1], [[-c, 0, 1]]);
        return { q: Linv(`\\dfrac{${polyT(N)}}{s+${c}}`), a: `$${cterm(p0, '\\delta(t)')}+${cterm(R, expT(c))}$`, key: `G|${c}|${fmt(R / p0)}`, L: { F: `\\dfrac{${polyT(N)}}{s+${c}}` },
          verify: p => deltaIs(p, p0, want), easy: `$${polyT(N)}=${p0 === 1 ? '' : p0}(s+${c})+${R}$。$${p0}+\\frac{${R}}{s+${c}}$` };
      },
      // 余りが負・分子が s だけ
      s2(r) {
        const [k, ok] = alt(r, '54s2b', 2), p0 = r.int(1, 4), c = r.int(1, 5), R = k === 0 ? -p0 * c : -r.int(1, 6);
        if (k === 1 && p0 * c + R <= 0) return null;
        const N = ptrim([p0 * c + R, p0]), want = residueWant([R], [c, 1], [[-c, 0, 1]]);
        return ok({ q: Linv(`\\dfrac{${polyT(N)}}{s+${c}}`), a: `$${cterm(p0, '\\delta(t)')}${cterm(R, expT(c))}$`, key: `G|${c}|${fmt(R / p0)}`, L: { F: `\\dfrac{${polyT(N)}}{s+${c}}` },
          verify: p => deltaIs(p, p0, want), easy: `$${polyT(N)}=${p0 === 1 ? '' : p0}(s+${c})${R}$。$${p0}-\\frac{${-R}}{s+${c}}$` });
      },
      // 見かけがちがう：2次式÷2次式（わったあとは部分分数）
      s3(r) {
        const a = r.int(1, 3), b = a + r.int(1, 3), A = r.intNot(-2, 4, v => v === 0), B = r.intNot(-3, 3, v => v === 0);
        const D = dPoly([a, b]), rem = padd(pscale([b, 1], A), pscale([a, 1], B)), N = padd(D, rem);
        if (N[2] !== 1 || ptrim(rem).length < 1) return null;
        const want = residueWant(rem, D, [[-a, 0, 1], [-b, 0, 1]]);
        return { q: Linv(`\\dfrac{${polyT(N)}}{${dTeX([a, b])}}`), a: `$\\delta(t)${sumT([[A, expT(a)], [B, expT(b)]]).replace(/^(?!-)/, '+')}$`, key: `G2|${a}|${b}|${fmt(B / A)}`, L: { F: `\\dfrac{${polyT(N)}}{${dTeX([a, b])}}` },
          verify: p => deltaIs(p, 1, want), easy: `$1+\\frac{${polyT(ptrim(rem))}}{${dTeX([a, b])}}$。余りはかくす方法で $A=${A}$、$B=${B}$` };
      },
      // わな：分子の次数が大きい（この巻ではあつかわない。わざなし）
      trap(r) {
        const c = r.int(1, 3), k = r.int(1, 4), N = [k, 0, 1];
        return dest({ q: Linv(`\\dfrac{${polyT(N)}}{s+${c}}`), a: 'この巻ではあつかわない', key: `t59|${c}|${k}`, L: { F: `\\dfrac{${polyT(N)}}{s+${c}}` } },
          '9-59', '分子が2次で、分母（1次）より次数が大きい。わると商に $s$ が残り、$\\delta(t)$ の微分が出る');
      },
    },
  });

  // ================================================================ 9-60
  // Python（scipy の signal.residue）の表示を読む。共役な組は実部の2倍。表示は numpy の形（「表示されたとします」。U-5）
  //   BAN：例（分母が0になる $-1\pm2j$ で、係数 $0.5\mp0.25j$ と何倍か）
  function npNum(x) { let s = String(+(+x).toFixed(6)); if (s === '-0') s = '0'; if (!s.includes('.')) s += '.'; return s; }
  function npC(arr) {
    const re = arr.map(z => npNum(z[0])), im = arr.map(z => npNum(Math.abs(z[1])));
    const ip = s => s.split('.')[0], fp = s => s.split('.')[1];
    const L = Math.max(...re.map(s => ip(s).length)), FR = Math.max(...re.map(s => fp(s).length)), FI = Math.max(...im.map(s => fp(s).length));
    return '[' + arr.map((z, k) => ip(re[k]).padStart(L) + '.' + fp(re[k]).padEnd(FR) + (z[1] < 0 ? '-' : '+') + im[k] + 'j' + ' '.repeat(FI - fp(im[k]).length)).join(' ') + ']';
  }
  const cz = z => `(${fmt(z[0])}${z[1] < 0 ? '-' : '+'}${fmt(Math.abs(z[1]))}j)`;
  // 組：[α, β, c, d]（分母が0になる -α±βj、係数 c∓dj）→ e^{-αt}(2c cos βt + 2d sin βt)
  function pair60(r, neg) {
    const al = r.pick([0.5, 1, 1, 1.5, 2, 3]), be = r.pick([1, 2, 2, 3, 0.5, 1.5]), c = r.pick(neg ? [-0.25, -0.5, -0.75, -1, -1.5] : [0.25, 0.5, 0.75, 1, -0.5, -0.25, 1.5]), d = r.pick([0.25, 0.5, -0.25, -0.5, 0.75, 1, -1]);
    if (al === 1 && be === 2) return null;   // 例の分母が0になる s（$-1\pm2j$）は出さない
    return { al, be, c, d, poles: [[-al, be], [-al, -be]], res: [[c, -d], [c, d]], T: dampT(al, be, 2 * c, 2 * d).replace(/e\^\{-1t\}/, 'e^{-t}'),
      want: `${cz([c, -d])}e^{${cz([-al, be])}t}+${cz([c, d])}e^{${cz([-al, -be])}t}` };
  }
  const PYQ = '`residue` の表示（上の行が分母が0になる $s$、下の行が係数）が次のようになったとします。';
  add({
    id: '9-60', part: 4, chap: '9-7⑪ 例題13', stars: 1,
    title: '分けきれない分母は Python の residue。共役な組は「実部の2倍」',
    mark: '`signal.residue` の表示（上の行が分母が0になる $s$、下の行が係数。場合 I）。',
    futsu: ['表示された $s$ と係数の組を', '1つずつ $Ae^{pt}$ の形で書き、', '共役な2つの項を、オイラーの', '公式で展開してたし合わせる。'],
    raku: ['$s=-1\\pm2j$、係数 $0.5\\mp0.25j$', '$\\to2e^{-t}(0.5\\cos2t+0.25\\sin2t)$', '$=e^{-t}(\\cos2t+0.5\\sin2t)$', '（片方の組だけ読まない）'],
    why: '分母が0になる $s=p$ と係数 $A$ の組は、$\\frac{A}{s-p}\\to Ae^{pt}$（9-7⑪）。$p=-\\alpha\\pm\\beta j$ の共役な組は係数も共役なので、2つの和は $Ae^{pt}$ の実部の2倍：$c-dj$ なら $2e^{-\\alpha t}(c\\cos\\beta t+d\\sin\\beta t)$。実数の $s$ はそのまま $Ae^{pt}$、$s=0$ は定数（最後の値）。',
    caution: '共役な組の片方だけを読まない（$t=0$ の値が合わなくなる）。$\\sin$ の符号は、虚部が $+\\beta j$ の $s$ の係数 $c-dj$ の $-d$ の反対で $+d$。表示の順は、プログラムによってちがうことがある。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '40mm', s3: '40mm', trap: '24mm' },
    fits(q) { return /residue|分母が0になる \$s\$ (が|を)/.test(q) && /係数/.test(q) && !/使わずに/.test(q); },
    steps: {
      // 組の数を文で
      s1(r) {
        const P0 = pair60(r); if (!P0) return null;
        const { al, be, c, d } = P0;
        const jT = v => `${v === 1 ? '' : fmt(v)}j`;   // 係数の1は書かない（Y-6）
        return { q: `Python の \`signal.residue\` で、分母が0になる $s$ が $${fmt(-al)}\\pm ${jT(be)}$、係数が $${fmt(c)}${d < 0 ? '\\pm' : '\\mp'} ${jT(Math.abs(d))}$（同じ順）と出たとき、もどした関数`,
          a: `$${P0.T}$`, key: `I|${al}|${be}|${c}|${d}`, calc: { kind: 'fn', vars: ['t'], want: P0.want },
          easy: `実部の2倍：$2${expT(al)}(${sumT([[c, trig('cos', be)], [d, trig('sin', be)]])})$` };
      },
      // 共役な組と実数の s（表示）
      s2(r) {
        const P0 = pair60(r); if (!P0) return null;
        const g = r.pick([0.5, 2, 3, 4]), rho = r.pick([-2, -1, -0.5, 0.5, 1, 2]);
        if (g === P0.al) return null;
        const poles = [...P0.poles, [-g, 0]], res = [...P0.res, [rho, 0]];
        return { q: `${PYQ}もどした関数 $y$`, code: `${npC(poles)}\n${npC(res)}`, a: `$${cterm(rho, expT(g))}${P0.T.startsWith('-') ? '' : '+'}${P0.T}$`, key: `I2|${P0.al}|${P0.be}|${P0.c}|${P0.d}|${g}|${rho}`,
          calc: { kind: 'fn', vars: ['t'], want: `${P0.want}+(${rho})e^{-${g}t}` }, easy: `実数の $s=${fmt(-g)}$ は $${cterm(rho, expT(g))}$。共役な組は実部の2倍` };
      },
      // 見かけがちがう：ステップ応答（s=0 の組がある。t=0 で0になる）
      s3(r) {
        const P0 = pair60(r, true); if (!P0) return null;
        const r0 = -2 * P0.c;
        if (r0 === 0) return null;
        const poles = [[0, 0], ...P0.poles], res = [[r0, 0], ...P0.res];
        return { q: `ステップ応答 $Y(s)$ の${PYQ}$y$`, code: `${npC(poles)}\n${npC(res)}`, a: `$${fmt(r0)}${P0.T.startsWith('-') ? '' : '+'}${P0.T}$`, key: `I3|${P0.al}|${P0.be}|${P0.c}|${P0.d}`,
          calc: { kind: 'fn', vars: ['t'], want: `${P0.want}+(${r0})` }, easy: `$s=0$ の係数 $${fmt(r0)}$ が最後の値。共役な組は実部の2倍（$t=0$ で $${fmt(r0)}+${fmt(2 * P0.c)}=0$）`.replace('+-', '-') };

      },
      // わな：分母が2次で手で分けられる（9-54）
      trap(r) {
        const a = r.int(1, 3), b = a + r.int(1, 3), A = r.intNot(-3, 4, v => v === 0), B = r.intNot(-3, 3, v => v === 0), prs = [[a, A], [b, B]];
        if (bad54(prs)) return null;
        const T = pf54(prs);
        return dest(invP(T.N, T.D, T.roots, T.Fx, T.ans, { q: `Python を使わずに：${Linv(T.Fx)}`, key: `t60|${canon54(prs)}` }),
          '9-60', '分母は2次で、1次式2つに分けられる。かくす方法で手で分ける');
      },
    },
  });

  // ================================================================ 9-94
  // 熱電対のおくれ：τ y' + y = r t、y(0)=0 → Y = r/(s^2(τs+1)) → y = r(t-τ+τe^{-t/τ})、おくれ rτ(1-e^{-t/τ})
  //   BAN：例（τ=10 と何倍か）、教科書（τ=30・r=1/30、τ=20・r=0.2）
  const TAU = [2, 4, 5, 8, 20, 25, 40, 50];
  const eTau = tau => `e^{-t/${tau}}`;
  add({
    id: '9-94', part: 4, chap: '9-7⑧ 例題5', stars: 1,
    title: '熱電対のおくれ：$\\frac{r}{s^2(\\tau s+1)}$ を分けて $r\\tau(1-e^{-t/\\tau})$',
    mark: '「温度が1秒に□℃ずつ上がり続ける」「時定数 $\\tau$ の温度計」。$s$ が2回（重解）。',
    futsu: ['答えを $y=At+B+Ce^{-t/\\tau}$ と', '予想して式に入れ、$t$ の係数と', '定数をくらべて、$y(0)=0$ で', '$C$ を決める（6-4 のやり方）。'],
    raku: ['$\\tau=10$、$r=0.5$：$Y=\\frac{0.5}{s^2(10s+1)}$', '$\\frac{1}{s^2(10s+1)}=-\\frac{10}{s}+\\frac{1}{s^2}+\\frac{10}{s+0.1}$', '$y=0.5(t-10+10e^{-t/10})$', 'おくれ $5(1-e^{-t/10})$、最後5℃'],
    why: '$rt$ の変換 $\\frac{r}{s^2}$ が入るので、分母は $s$ が2回（重解）と $\\tau s+1$。$\\frac{1}{s^2(\\tau s+1)}=\\frac As+\\frac{B}{s^2}+\\frac{C}{\\tau s+1}$ で、$s=0$ を入れて $B=1$、$s=-\\frac1\\tau$ で $C=\\tau^2$、$s^2$ の係数で $A=-\\tau$（9-7⑧）。本当の上がり分 $rt$ からひくと、おくれ $r\\tau(1-e^{-t/\\tau})$ は $r\\tau$ に近づく。',
    caution: '$\\frac{\\tau^2}{\\tau s+1}=\\frac{\\tau}{s+1/\\tau}$ と $s$ の係数を1にしてから行3 でもどす（$e^{-t/\\tau}$）。おくれは「本当の上がり分 $rt$ － 計器の値 $y$」。温度がいきなり上がるときは $\\frac{1}{s(\\tau s+1)}$ で重解ではない（わざ 9-54）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '34mm', s3: '16mm', trap: '26mm' },
    boxh: '9mm',
    fits(q, p) {
      if (/上がり続け/.test(q) && /温度計|熱電対/.test(q)) return true;
      const o = p && p.L && p.L.ode ? p.L.ode : odeOf(q);
      if (o) return o.coef.length === 2 && o.rhs === 't';
      const R = ratOf(invOf(q, p)); if (!R || R.t0 || R.N.length !== 1) return false;
      const rs = rootsOf(R.D);
      return rs.length === 2 && rs.some(x => x[0] === 0 && x[1] === 0 && x[2] === 2) && rs.some(x => x[0] < 0 && x[1] === 0 && x[2] === 1);
    },
    steps: {
      s1(r) {
        const tau = r.pick(TAU), D = pmul([0, 0, 1], [1, tau]);
        return { q: Linv(`\\dfrac{1}{s^2(${tau}s+1)}`), a: `$t-${tau}+${tau}${eTau(tau)}$`, key: `TC|${tau}`, L: { F: `\\dfrac{1}{s^2(${tau}s+1)}` },
          calc: { kind: 'fn', vars: ['t'], want: residueWant([1], D, [[0, 0, 2], [-1 / tau, 0, 1]]) },
          easy: `$-\\frac{${tau}}{s}+\\frac{1}{s^2}+\\frac{${tau * tau}}{${tau}s+1}$、$\\frac{${tau * tau}}{${tau}s+1}=\\frac{${tau}}{s+${fmt(1 / tau)}}$` };
      },
      // 微分方程式から
      s2(r) {
        const tau = r.pick(TAU), rr = r.pick([0.1, 0.2, 0.4, 0.5, 1, 2, 3]);
        if (tau === 20 && rr === 0.2) return null;
        const rt = rr * tau, ans = sumT([[rr, 't'], [-rt, ''], [rt, eTau(tau)]]);
        return { q: `時定数 $${tau}\\,\\mathrm s$ の温度計の値の上がり分 $y$〔℃〕が $${tau}\\dot y+y=${rr === 1 ? '' : fmt(rr)}t$、$y(0)=0$ にしたがうとき、$y$`, a: `$${ans}$`, key: `TC|${tau}`,
          L: { ode: { coef: [tau, 1], rhs: 't' } }, calc: { kind: 'ode', x: 't', coef: [tau, 1], rhs: `${rr}*t`, init: [[0, 0]] },
          easy: `$Y=\\frac{${fmt(rr)}}{s^2(${tau}s+1)}$。$\\frac{1}{s^2(${tau}s+1)}=-\\frac{${tau}}{s}+\\frac{1}{s^2}+\\frac{${tau}}{s+${fmt(1 / tau)}}$` };
      },
      // 見かけがちがう：決まった時刻のおくれ（e の値を文に）・やがて一定になるおくれ
      s3(r) {
        const [k, ok] = alt(r, '94s3', 2), tau = r.pick(TAU), rr = r.pick([0.1, 0.2, 0.4, 0.5, 1]);
        if (tau === 20 && rr === 0.2) return null;
        const R = rr * tau, head = `時定数 $${tau}\\,\\mathrm s$ の温度計で、温度が1秒に $${fmt(rr)}$℃ずつ上がり続けます（はじめは計器と同じ）。`;
        if (k === 1) {
          return ok({ q: `${head}やがて一定になる、計器のおくれ（℃）`, a: `$${fmt(R)}$℃`, key: `TC3|${tau}|${rr}`, verify: p => valIs(p, R), easy: `おくれ $${R === 1 ? '' : fmt(R)}(1-${eTau(tau)})$ は $r\\tau=${fmt(rr)}\\times${tau}=${fmt(R)}$ に近づく` });
        }
        const x = r.pick([1, 2, 3, 0.5]), T = x * tau, v = R * (1 - Math.exp(-x)), w = R * (1 - EXPV[x]);
        if (tie(w, 2) || rd(v, 2) !== rd(w, 2)) return null;
        return ok({ q: `${head}${fmt(T)}秒後の、計器のおくれ（℃。${expNote(x)}、小数第2位まで）`, a: `約 $${fx(w, 2)}$℃`, key: `TC3|${tau}|${rr}`, verify: p => approxIs(p, v, w, 2),
          easy: `おくれ $rt-y=${R === 1 ? '' : fmt(R)}(1-${eTau(tau)})$ に $t=${fmt(T)}$` });
      },
      // わな：温度がいきなり上がる（ステップ。重解でない。9-54）
      trap(r) {
        const tau = r.pick([2, 4, 5]), dT = r.pick([5, 10, 20, 30]);
        const coef = [tau, 1];
        return dest({ q: `時定数 $${tau}\\,\\mathrm s$ の温度計を、${dT}℃高い湯にいきなり入れた。計器の値の上がり分 $y$ が $${tau}\\dot y+y=${dT}$、$y(0)=0$ にしたがうとき、$y$`, a: `$${dT}-${dT}${eTau(tau)}$`, key: `t94|${tau}|${dT}`,
          L: { ode: { coef, rhs: 'const' } }, calc: { kind: 'ode', x: 't', coef, rhs: String(dT), init: [[0, 0]] } },
          '9-94', `温度は上がり続けるのではなく、いきなり上がって一定。$Y=\\frac{${dT}}{s(${tau}s+1)}$ で、$s$ は1回（重解でない）`);
      },
    },
  });

  // ================================================================ 9-95
  // 連立の微分方程式：x' = -k(x-y)、y' = k(x-y) → 和は一定、差は e^{-2kt}。s の世界では和と差の連立1次方程式
  //   BAN：例（k=0.1、h_2(0)=0 と何倍か。教科書の 6-14 と同じ）
  const K95 = [0.05, 0.1, 0.2, 0.25, 0.5, 1];
  function sys95(k, A, B, v) {
    v = v || ['h', 'h'];
    const [x, y] = [`${v[0]}_1`, `${v[1]}_2`], kk = k === 1 ? '' : fmt(k);   // 係数の1は書かない（Y-6）
    return `$\\dot ${x}=-${kk}(${x}-${y})$、$\\dot ${y}=${kk}(${x}-${y})$、$${x}(0)=${A}$、$${y}(0)=${B}$`;
  }
  const h95 = (k, A, B, one) => sumT([[(A + B) / 2, ''], [(one ? 1 : -1) * (A - B) / 2, expT(2 * k)]]);
  add({
    id: '9-95', part: 4, chap: '9-7⑤（もっと）', stars: 1,
    title: '連立の微分方程式は、$s$ の世界では連立1次方程式',
    mark: '2つの水そう・2つの物体の温度。$\\dot h_1=-k(h_1-h_2)$、$\\dot h_2=k(h_1-h_2)$。',
    futsu: ['1つめの式から $h_2$ を $h_1$ と $\\dot h_1$ で表し、', '2つめの式に入れて $h_1$ だけの', '2階の微分方程式にしてから、', '特性方程式で解く。'],
    raku: ['$h_1(0)=20$、$h_2(0)=0$、$k=0.1$：変換した2式を', 'たして $\\mathcal L[h_1]+\\mathcal L[h_2]=\\frac{20}{s}$', 'ひいて $\\mathcal L[h_1]-\\mathcal L[h_2]=\\frac{20}{s+0.2}$', '$\\mathcal L[h_1]=\\frac{10}{s}+\\frac{10}{s+0.2}$'],
    why: '両方の式を変換すると、$\\mathcal L[h_1]$ と $\\mathcal L[h_2]$ のふつうの連立1次方程式になる（9-7 のもっと知りたい）。2つの式をたすと右辺が消えて、$s(\\mathcal L[h_1]+\\mathcal L[h_2])$ $=h_1(0)+h_2(0)$。ひくと $(s+2k)(\\mathcal L[h_1]-\\mathcal L[h_2])$ $=h_1(0)-h_2(0)$。和と差から1つずつ求めて、表でもどす（6-14 の和と差と同じ）。',
    caution: '差の式の分母は $s+2k$（$k$ ではない：2つの式の両方から $k$ ずつ）。和は一定で、最後は2つとも平均 $\\frac{h_1(0)+h_2(0)}{2}$ になる。$h_2$ がいつも一定なら、1つの1次の式（わざ 9-44）。',
    counts: { s1: 2, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '26mm', s2: '30mm', s3: '18mm', trap: '26mm' },
    boxh: '9mm',
    fits(q) { return /\\dot [a-zA-Z]_1/.test(q) && /\\dot [a-zA-Z]_2/.test(q); },
    steps: {
      // s の世界の和・差
      s1(r) {
        const [k, ok] = alt(r, '95s1', 2), kk = r.pick(K95), A = 2 * r.int(5, 20), B = 2 * r.int(0, 9);
        if (B >= A || (kk === 0.1 && B === 0)) return null;
        const sum = k === 0, F0 = sum ? `\\frac{${A + B}}{s}` : `\\frac{${A - B}}{s+${fmt(2 * kk)}}`;
        return ok({ q: `2つの水そうの水位が ${sys95(kk, A, B)} のとき、$\\mathcal L[h_1]${sum ? '+' : '-'}\\mathcal L[h_2]$`, a: `$${F0}$`, key: `S|${kk}|${fmt(B / A)}|${sum}`,
          calc: { kind: 'fn', vars: ['s'], want: sum ? `${A + B}/s` : `${A - B}/(s+2*${kk})` },
          easy: `2つの変換した式を${sum ? `たす：$s(\\mathcal L[h_1]+\\mathcal L[h_2])=${A + B}$` : `ひく：$(s+${fmt(2 * kk)})(\\mathcal L[h_1]-\\mathcal L[h_2])=${A - B}$`}` });
      },
      // 水位そのもの
      s2(r) {
        const kk = r.pick(K95), A = 2 * r.int(5, 20), B = 2 * r.int(0, 9), one = r.chance(0.5);
        if (B >= A || (kk === 0.1 && B === 0)) return null;
        const v = one ? 'h_1' : 'h_2', N = one ? [kk * (A + B), A] : [kk * (A + B), B];
        return { q: `2つの水そうの水位が ${sys95(kk, A, B)} のとき、$${v}$`, a: `$${h95(kk, A, B, one)}$`, key: `S2|${kk}|${fmt(B / A)}|${one}`,
          calc: { kind: 'fn', vars: ['t'], want: residueWant(pclean(N), [0, 2 * kk, 1], [[0, 0, 1], [-2 * kk, 0, 1]]) },
          easy: `和 $\\frac{${A + B}}{s}$ と差 $\\frac{${A - B}}{s+${fmt(2 * kk)}}$ を${one ? 'たして' : 'ひいて'}2でわり、もどす` };
      },
      // 見かけがちがう：2つの物体の温度（決まった時刻の値。e の値を文に）
      s3(r) {
        const kk = r.pick([0.05, 0.1, 0.25, 0.5]), A = r.pick([60, 70, 80, 90]), B = r.pick([10, 20, 30]), x = r.pick([1, 2, 0.5]), T = x / (2 * kk), one = r.chance(0.5);
        const v = (A + B) / 2 + (one ? 1 : -1) * (A - B) / 2 * Math.exp(-x), w = (A + B) / 2 + (one ? 1 : -1) * (A - B) / 2 * EXPV[x];
        if (tie(w, 1) || rd(v, 1) !== rd(w, 1)) return null;
        return { q: `ふれ合った2つの物体の温度〔℃〕が ${sys95(kk, A, B, ['T', 'T'])}（$t$ は分）のとき、${fmt(T)}分後の $T_${one ? 1 : 2}$（${expNote(x)}、小数第1位まで）`,
          a: `約 $${fx(w, 1)}$℃`, key: `S3|${kk}|${A}|${B}|${x}|${one}`, verify: p => approxIs(p, v, w, 1),
          easy: `和は一定 ${A + B}、差は $${A - B}${expT(2 * kk)}$。$T_${one ? 1 : 2}=${h95(kk, A, B, one)}$ に $t=${fmt(T)}$` };
      },
      // わな：相手の水位が一定（1つの1次の式。9-44）
      trap(r) {
        const kk = r.pick([0.1, 0.2, 0.5]), c = r.pick([5, 10, 15]), A = c + 2 * r.int(2, 10);
        return dest({ q: `となりの水位がいつも $${c}\\,\\mathrm{cm}$ で、$\\dot h_1=-${fmt(kk)}(h_1-${c})$、$h_1(0)=${A}$ のとき、$h_1$`, a: `$${c}+${A - c}${expT(kk)}$`, key: `t95|${kk}|${c}|${A}`,

          calc: { kind: 'fn', vars: ['t'], want: `${c}+${A - c}*exp(-${kk}*t)` } },
          '9-95', `相手の水位が一定なので、連立ではなく1つの1次の式。$s\\mathcal L[h_1]-${A}=-${fmt(kk)}\\mathcal L[h_1]+\\frac{${fmt(kk * c)}}{s}$`, ['9-44']);
      },
    },
  });
})(globalThis.MONDAI);

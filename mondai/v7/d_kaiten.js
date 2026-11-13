/* 問題集 第7巻　第4部 回転と座標の変換（わざ 7-47〜7-61、7-96〜7-98）　組 d
 * 書き方は v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第7巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 7-6・7-7 の数・ことば・記号にそろえる（$R(\theta)$・$R_{90}$・$R_x(\phi)$・$R_y(\theta)$・$R_z(\psi)$・$\vec e_x$・$A(\theta,\ L)$・
 *   ロール $\phi$・ピッチ $\theta$・ヨー $\psi$・同次座標・同次変換行列・機体の座標・地面の座標）。点を回すときは「原点のまわりに左回りに60°」。
 * 角は 0°・30°・45°・60°・90° の仲間だけ（Q-5）。答えは √ を残した形（Q-4）。約の値を聞くときは、文に $\cos30^{\circ}=0.866$・$\cos45^{\circ}=0.707$ と
 *   けたを書き、その値で計算して丸めた答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4。apx()）。近似の答えは「約」と ≈。
 * 数は「p+q√s」（S。p、q は M.F の分数）で計算し、問題と答えを同じ数から書く。行列は M.Mat と同じ形の2重の配列。
 * 検算：行列の答えは calc（kind 'mat'）。複素数（7-96）は、式だけの問題を check.js が j を虚数単位として自動でくらべる。
 *   点・ベクトル・角・ことばの答えは verify(p) で、問題の文の数を読みなおし、別の道すじ（cos と sin を小数で計算して行列をかける・
 *   回した点を逆に回してもどす・成分の式で計算する）で確かめる。
 * 図は 7-48・7-54・7-55 のステップ3（平面）と 7-56 のステップ3（立体。M.proj3）だけ（K-2）。答えの点（回した点・手の位置）には座標を書かない。
 * 左ページの「楽な形」の例の数は、同じ見開きの問題に出さない（O-2）。わなは、そのわざ自身で解けないもの。答えにはかならず行き先（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の部品
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(strip);
  const close = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const D = x => (Array.isArray(x) ? x : F.fromDec(String(x)));        // 0.15 → [3, 20]
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 同じ見開き（同じ乱数の物 r）で、同じ答えを2回出さない
  const seenAns = (r, k, a) => { const d = r.seenA || (r.seenA = {}), s = d[k] || (d[k] = new Set()); if (s.has(a)) return true; s.add(a); return false; };
  const RAD = Math.PI / 180;
  const decOK = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const fdec = f => (decOK(f[1]) ? String(+(f[0] / f[1]).toFixed(10)) : null);   // 正確な小数（分母が 2・5 だけ）か null
  function sqf(n) { let k = 1, m = n; for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; } return [k, m]; }
  const rt = m => `\\sqrt${m < 10 ? m : `{${m}}`}`;

  // ---- p+q√s の数（S）。p、q は分数、s は平方因子のない整数（s=1 なら √ なし）。第6巻 組 d と同じ形
  const toF = v => (Array.isArray(v) ? v : D(v));
  function S(p, q, s) {
    p = toF(p); q = toF(q == null ? 0 : q); s = s || 1;
    if (s === 1) return { p: F.add(p, q), q: fr(0), s: 1 };
    if (q[0] === 0) return { p, q, s: 1 };
    return { p, q, s };
  }
  const sv = x => (x && x.p ? x : S(x));                              // 数・分数・S を S に
  const sZero = x => x.p[0] === 0 && x.q[0] === 0;
  const sNeg = x => S(F.mul(x.p, fr(-1)), F.mul(x.q, fr(-1)), x.s);
  function sAdd(x, y) {
    x = sv(x); y = sv(y);
    if (x.q[0] && y.q[0] && x.s !== y.s) throw new Error('sAdd: √ の中がちがう');
    return S(F.add(x.p, y.p), F.add(x.q, y.q), x.q[0] ? x.s : y.s);
  }
  const sSub = (x, y) => sAdd(x, sNeg(sv(y)));
  function sMul(x, y) {
    x = sv(x); y = sv(y);
    if (!x.q[0]) return S(F.mul(x.p, y.p), F.mul(x.p, y.q), y.s);
    if (!y.q[0]) return S(F.mul(y.p, x.p), F.mul(y.p, x.q), x.s);
    if (x.s === y.s) return S(F.add(F.mul(x.p, y.p), F.mul(F.mul(x.q, y.q), fr(x.s))), F.add(F.mul(x.p, y.q), F.mul(x.q, y.p)), x.s);
    throw new Error('sMul: √ の中がちがう');
  }
  const sVal = x => F.val(x.p) + F.val(x.q) * Math.sqrt(x.s);
  const sEq = (x, y) => Math.abs(sVal(sv(x)) - sVal(sv(y))) < 1e-12;
  const surd = (c, s) => { const [n, d] = c, body = `${n === 1 ? '' : n}${rt(s)}`; return d === 1 ? body : `\\frac{${body}}{${d}}`; };
  // S の TeX：3、\frac{1}{2}、2\sqrt3、-\frac{\sqrt3}{2}、\frac{3-\sqrt3}{2}、\frac{3\sqrt3+1}{2}
  function stex(x) {
    x = sv(x);
    if (!x.q[0]) return F.tex(x.p);
    const neg = x.q[0] < 0, aq = [Math.abs(x.q[0]), x.q[1]];
    if (!x.p[0]) return (neg ? '-' : '') + surd(aq, x.s);
    const L = F.lcm(x.p[1], x.q[1]), P = x.p[0] * L / x.p[1], Q = x.q[0] * L / x.q[1];
    const sd = `${Math.abs(Q) === 1 ? '' : Math.abs(Q)}${rt(x.s)}`;
    if (Q < 0 && P < 0) return L === 1 ? `${P}-${sd}` : `-\\frac{${sd}+${-P}}{${L}}`;   // -\frac{3\sqrt3+4}{2}
    const body = Q > 0 ? `${sd}${P > 0 ? '+' : '-'}${Math.abs(P)}` : `${P}-${sd}`;
    return L === 1 ? body : `\\frac{${body}}{${L}}`;
  }
  // 小数の積の和の式：x=0.866\times3-0.5\times1（[係数の分数, 数] の組）
  const prodT = terms => terms.map(([c, x], i) => { const sg = Math.sign(F.val(c)) * Math.sign(F.val(toF(x))); const t = `${fdec([Math.abs(c[0]), c[1]])}\\times${Math.abs(F.val(toF(x)))}`; return (sg < 0 ? '-' : i ? '+' : '') + t; }).join('');
  // 長さ（m）など、小数で書く S：0.15\sqrt3、0.4、0.2+0.15\sqrt3。小数で書けなければ stex
  function stexD(x) {
    x = sv(x);
    const pd = fdec(x.p);
    if (!x.q[0]) return pd != null ? pd : F.tex(x.p);
    const qd = fdec([Math.abs(x.q[0]), x.q[1]]);
    if (pd == null || qd == null) return stex(x);
    const qs = (qd === '1' ? '' : qd) + rt(x.s);
    if (!x.p[0]) return (x.q[0] < 0 ? '-' : '') + qs;
    return `${pd}${x.q[0] < 0 ? '-' : '+'}${qs}`;
  }
  const hasFrac = t => /\\frac/.test(t);
  // 点・ベクトルの TeX：(1,\ \sqrt3)、分数があれば \left( \right)
  function ptT(xs, o) {
    const ts = xs.map(x => (o && o.dec ? stexD(x) : stex(x)));
    const body = ts.join(',\\ ');
    return ts.some(hasFrac) ? `\\left(${body}\\right)` : `(${body})`;
  }
  // 行列の TeX（成分は S か TeX の文字）。分数があれば行のあいだを少しあける。
  // 成分の分数は \tfrac（本の組み方は \frac を \dfrac にするので、行列が高くなりすぎる。教科書の行列の中の分数も小さい分数）
  function matT(rows, o) {
    const ts = rows.map(r => r.map(x => (typeof x === 'string' ? x : (o && o.dec ? stexD(x) : stex(x))).replace(/\\frac/g, '\\tfrac')));
    const sep = ts.flat().some(hasFrac) ? '\\\\[2pt]' : '\\\\';
    return `\\begin{pmatrix}${ts.map(r => r.join('&')).join(sep)}\\end{pmatrix}`;
  }
  const matV = rows => rows.map(r => r.map(x => (typeof x === 'number' ? x : sVal(sv(x)))));   // calc の want（小数の値）
  const dg = d => `${d}^{\\circ}`;
  const dgp = d => (d < 0 ? `(${dg(d)})` : dg(d));                     // \cos(-30^{\circ})
  const sgn = n => (n < 0 ? `(${n})` : String(n));
  // 角の言い方：左回りに60°、右回りに30°
  const turnT = d => (d < 0 ? `右回りに${-d}°` : `左回りに${d}°`);

  // ---- 角（度）。cos d と sin d（30°・45° の倍数だけ。ほかは null）を S で
  function cs(d) {
    const t = ((d % 360) + 360) % 360, q = Math.floor(t / 90), u = t - 90 * q;
    const H = S(fr(1, 2)), R3 = S(0, fr(1, 2), 3), R2 = S(0, fr(1, 2), 2);
    const B = { 0: [S(1), S(0)], 30: [R3, H], 45: [R2, R2], 60: [H, R3] }[u];
    if (!B) return null;
    let [c, s] = B;
    for (let k = 0; k < q; k++) [c, s] = [sNeg(s), c];
    return [c, s];
  }
  const fam = d => { const t = ((d % 90) + 90) % 90; return t === 0 ? 0 : t === 45 ? 2 : (t === 30 || t === 60) ? 3 : -1; };   // 0：90°の倍数、2：45°の仲間、3：30°の仲間
  const famOK = (...ds) => { const f = ds.map(fam); if (f.includes(-1)) return false; const g = f.filter(x => x); return g.every(x => x === g[0]); };
  // 文に書く cos・sin の小数（教科書の巻末の値。Q-4）
  function gcs(d) {
    const t = ((d % 360) + 360) % 360, q = Math.floor(t / 90), u = t - 90 * q;
    const B = { 0: [fr(1), fr(0)], 30: [D('0.866'), fr(1, 2)], 45: [D('0.707'), D('0.707')], 60: [fr(1, 2), D('0.866')] }[u];
    if (!B) return null;
    let [c, s] = B;
    for (let k = 0; k < q; k++) [c, s] = [F.mul(s, fr(-1)), c];
    return [c, s];
  }
  // 文に書く値の説明：（$\cos30^{\circ}=0.866$、$\sin30^{\circ}=0.5$）
  function givenT(...ds) {
    const out = [];
    for (const d of [...new Set(ds)]) {
      if (fam(d) === 0) continue;
      const [c, s] = gcs(d), ft = f => fdec(f);
      if (fam(d) === 2 && F.eq(c, s) && d > 0) out.push(`$\\cos${dgp(d)}=\\sin${dgp(d)}=${ft(c)}$`);
      else out.push(`$\\cos${dgp(d)}=${ft(c)}$`, `$\\sin${dgp(d)}=${ft(s)}$`);
    }
    return out.join('、');
  }
  // 回す：R(d)(x, y)
  const rot = (d, x, y) => { const [c, s] = cs(d); x = sv(x); y = sv(y); return [sSub(sMul(c, x), sMul(s, y)), sAdd(sMul(s, x), sMul(c, y))]; };
  const Rm = d => { const [c, s] = cs(d); return [[c, sNeg(s)], [s, c]]; };
  // 小数で回す（文に書いた値で。分数で正確に）
  const rotG = (d, x, y) => { const [c, s] = gcs(d); x = toF(x); y = toF(y); return [F.sub(F.mul(c, x), F.mul(s, y)), F.add(F.mul(s, x), F.mul(c, y))]; };
  // ---- 近似の値（O-4）：文に書いた値で計算した分数 g を小数第 k 位に丸めた文字。ほんとうの値 t（S）を丸めたものとくいちがえば null。
  //   t が √ をふくまない（正確な小数）ときは、正確な小数をそのまま書く
  function roundF(f, k) {
    const sg = f[0] < 0 ? -1 : 1, p = Math.pow(10, k), N = Math.abs(f[0]) * p, d = f[1];
    const q = Math.floor((2 * N + d) / (2 * d));
    if (q === 0) return (0).toFixed(k);
    return (sg * q / p).toFixed(k);
  }
  function apx(g, t, k) {
    t = sv(t);
    if (!t.q[0]) { const e = fdec(t.p); return e != null && F.eq(g, t.p) ? e : (e != null && Math.abs(F.val(g) - F.val(t.p)) < 0.5 * Math.pow(10, -k) ? e : null); }
    const tv = sVal(t) * Math.pow(10, k), fl = Math.floor(tv);
    if (Math.abs(tv - fl - 0.5) < 1e-6) return null;                  // ほんとうの値が丸めの境目に近い
    const tr = ((Math.round(tv)) / Math.pow(10, k)).toFixed(k), gr = roundF(g, k);
    return tr === gr || (Math.abs(+tr) === 0 && Math.abs(+gr) === 0) ? (+gr === 0 ? (0).toFixed(k) : gr) : null;
  }

  // ---- 答えを読む（verify 用）
  const ev = t => M.evalMath(String(t).replace(/\\left|\\right/g, ''), {});
  // 「約 $(2.464,\ 3.732)$（m）」→ [2.464, 3.732]。読めなければ null
  function vecRead(a, k) {
    const m = maths(a)[k || 0]; if (m == null) return null;
    let t = m.replace(/\\left|\\right/g, '').replace(/\\approx/g, '').trim();
    const mm = /^\((.*)\)$/.exec(t); if (!mm) return null;
    const parts = []; let dep = 0, k0 = 0, s = mm[1];
    for (let i = 0; i < s.length; i++) { const c = s[i]; if (c === '{' || c === '(') dep++; else if (c === '}' || c === ')') dep--; else if (c === ',' && dep === 0 && s[i - 1] !== '\\') { parts.push(s.slice(k0, i)); k0 = i + 1; } }
    parts.push(s.slice(k0));
    const v = parts.map(x => M.evalMath(x.replace(/\\ /g, ' ').trim(), {}));
    return v.some(x => x == null) ? null : v;
  }
  const vecIs = (a, want, tol) => { const g = vecRead(a); if (!g) return `答え ${a} が読めない`; if (g.length !== want.length || g.some((x, i) => !close(x, want[i], tol))) return `答え ${a} が (${want.map(x => +x.toFixed(6)).join(', ')}) でない`; return true; };
  const angRead = a => { const m = /(-?\d+(?:\.\d+)?)\^\{\\circ\}/.exec(maths(a).join(' ')); return m ? +m[1] : null; };
  const mod360 = d => ((d % 360) + 360) % 360;
  // 小数の cos・sin で行列を作ってかける（別の道すじ）
  const Rf = d => [[Math.cos(d * RAD), -Math.sin(d * RAD)], [Math.sin(d * RAD), Math.cos(d * RAD)]];
  const mulf = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
  const mvf = (A, v) => A.map(r => r.reduce((s, x, k) => s + x * v[k], 0));
  const Rxf = d => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
  const Ryf = d => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
  const Rzf = d => { const c = Math.cos(d * RAD), s = Math.sin(d * RAD); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
  const RAX = { x: Rxf, y: Ryf, z: Rzf };
  // 文の中の (a,\ b) の点（数だけ）をすべて
  const ptsInQ = q => maths(q).map(m => { const v = vecRead(`$${m.replace(/^[^(]*?(?=\()/, '')}$`); return v; }).filter(Boolean);

  // ---- 見わけようの目印の部品
  const angs = q => [...q.matchAll(/(-?\d+)(?:\^\{\\circ\}|°)/g)].map(m => +m[1]);
  const has = (q, re) => re.test(q);

  // ---------------------------------------------------------------- わなの行き先（第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざで楽になるときの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(7).filter(id => {
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

  // ---------------------------------------------------------------- 図の部品
  // わざの登録：同じ見開き（同じ乱数の物 r）の中で、同じ答え（式の答え）を2回出さない（O-2。$R(210^{\circ})$ と $R(-150^{\circ})$ など）。
  //   ことばだけの答え（「回転行列」「同じ向き」）と、def.dupOK のステップは除く（7-57 のステップ1は答えが $\pm\vec e$ の6とおりしかない）
  function add(def) {
    const st = def.steps, dup = def.dupOK || [];
    for (const k of Object.keys(st)) {
      const f = st[k];
      if (dup.includes(k)) continue;
      st[k] = r => { const p = f(r); if (!p || /^(回転行列|ちがう|同じ向き|ちがう向き|ならない|前の|後ろの)/.test(String(p.a))) return p; return seenAns(r, 'A' + def.id, String(p.a).replace(/^約 /, '').replace(/（(m|N|m\/s)）$/, '')) ? null : p; };
    }
    M.add(def);
  }
  // 弧の矢印（中心 C、半径 r、角 d0 から d1 へ。右回りでも向きどおりに矢じりをつける）
  const arcPath = (C, r, d0, d1, st) => { const n = Math.max(6, Math.ceil(Math.abs(d1 - d0) / 6)), pts = []; for (let k = 0; k <= n; k++) { const t = (d0 + (d1 - d0) * k / n) * RAD; pts.push([C[0] + r * Math.cos(t), C[1] + r * Math.sin(t)]); } return ['path', pts, Object.assign({ arrow: true }, st || {})]; };

  // ================================================================ 7-47
  const P47 = [30, 45, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, -30, -45, -90, -120, -135, -150];   // 60° は楽な形の例なので出さない（O-2）
  add({
    id: '7-47', part: 4, chap: '7-6①', stars: 1,
    title: '回転行列は「1列め $(\\cos\\theta,\\ \\sin\\theta)$、2列めはそれを90°回したもの」',
    mark: '$R(\\theta)$ を成分で書く。$-\\sin\\theta$ をどこに置くか迷う。',
    futsu: ['点 $(x,\\ y)$ を回した点の式', '$x\\cos\\theta-y\\sin\\theta$、', '$x\\sin\\theta+y\\cos\\theta$ を作り、', '$x$・$y$ の係数を行列に並べる。'],
    raku: ['1列め：$\\vec e_x$ の行き先 $\\left(\\frac12,\\ \\frac{\\sqrt3}{2}\\right)$', '2列め：それを90°回す $\\left(-\\frac{\\sqrt3}{2},\\ \\frac12\\right)$', '$R(60^{\\circ})=\\begin{pmatrix}\\tfrac12&-\\tfrac{\\sqrt3}{2}\\\\[2pt]\\tfrac{\\sqrt3}{2}&\\tfrac12\\end{pmatrix}$'],
    why: '行列の列は「物差しの矢印の行き先」（7-2）。$\\vec e_x=(1,\\ 0)$ は単位円の上を $\\theta$ 回って $(\\cos\\theta,\\ \\sin\\theta)$ へ行き、$\\vec e_y$ はいつもその90°先にあるので、$(x,\\ y)\\to(-y,\\ x)$ で $(-\\sin\\theta,\\ \\cos\\theta)$ へ行く（7-6①）。',
    caution: '1行めを $(\\cos\\theta,\\ \\sin\\theta)$ と書くと $R(-\\theta)$（右回り）になる。迷ったら $\\theta=90^{\\circ}$ を入れて、$(1,\\ 0)$ が $(0,\\ 1)$ へ行くか確かめる。$x$ 軸で折り返す行列のような、回転でない行列には使えない。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: { s1: '30mm', s2: '24mm', s3: '30mm', trap: '20mm' }, boxh: { s1: '14mm', s2: '10mm', s3: '12mm', trap: '12mm' },
    fits(q) {
      if (/\^\{-1\}|\\mathsf|R_|ですか|回した|もとの点|\)\^\{?\d|かけ|\+R|微分/.test(q)) return false;
      const n = (q.match(/R\(/g) || []).length;
      if (n === 1 && /R\((-?\d+\^\{\\circ\}|\\theta)\)/.test(q) && /成分で書いた|行め|列め|小数で書いた/.test(q)) return true;
      return /回転行列 \$R\(\\theta\)\$ になる|回転行列 \$R\(\\theta\)\$ です/.test(q);
    },
    steps: {
      // R(θ) を成分で
      s1(r) {
        const d = r.pick(P47), R = Rm(d);
        return { q: `$R(${dg(d)})$ を成分で書いた行列`, a: `$${matT(R)}$`, key: `47:${d}`, calc: { kind: 'mat', want: matV(R) },
          easy: `1列め $${ptT([R[0][0], R[1][0]])}$、2列めはそれを90°回した $${ptT([R[0][1], R[1][1]])}$`, easyCheck: false };
      },
      // 行列から角・1行めだけ
      s2(r) {
        const d = r.pick(P47.filter(x => x > -180 && x <= 180)), R = Rm(d);
        if (turn(r, '47s2', 2)) {
          return { q: `$${matT(R)}$ は回転行列 $R(\\theta)$ です。$\\theta$（$-180^{\\circ}<\\theta\\le180^{\\circ}$）`, a: `$${dg(d)}$`, key: `47:${d}`,
            easy: `1列め $${ptT([R[0][0], R[1][0]])}=(\\cos\\theta,\\ \\sin\\theta)$ の角`, easyCheck: false,
            verify: p => { const t = angRead(p.a); if (t == null || !(t > -180 && t <= 180)) return `角 ${p.a} が読めない`; return (close(Math.cos(t * RAD), sVal(R[0][0])) && close(Math.sin(t * RAD), sVal(R[1][0])) && close(-Math.sin(t * RAD), sVal(R[0][1]))) || `${p.a} の cos・sin が行列と合わない`; } };
        }
        const row = r.int(0, 1), v = R[row];
        return { q: `回転行列 $R(${dg(d)})$ の${row + 1}行め`, a: `$${ptT(v)}$`, key: `47:${d}:${row}`,
          easy: row ? `$(\\sin\\theta,\\ \\cos\\theta)$ に $\\theta=${dg(d)}$` : `$(\\cos\\theta,\\ -\\sin\\theta)$ に $\\theta=${dg(d)}$`, easyCheck: false,
          verify: p => vecIs(p.a, Rf(d)[row]) };
      },
      // 小数の値で書く・あいている成分をうめる
      s3(r) {
        if (turn(r, '47s3', 2)) {
          const d = r.pick([30, -30, 45, -45, 120, 135, 150, -120, -135, -150, 210, 315]), [c, s] = gcs(d), G = [[c, F.mul(s, fr(-1))], [s, c]];
          const gt = G.map(row => row.map(f => fdec(f)));
          return { q: `${givenT(d)} を使って、$R(${dg(d)})$ を小数で書いた行列`, a: `$\\begin{pmatrix}${gt.map(x => x.join('&')).join('\\\\')}\\end{pmatrix}$`, key: `47:${d}`,
            calc: { kind: 'mat', want: G }, easy: `1列めは $(\\cos${dgp(d)},\\ \\sin${dgp(d)})$`, easyCheck: false };
        }
        const d = r.pick(P47.filter(x => fam(x))), R = Rm(d), i = r.int(0, 1), j = r.int(0, 1);
        const rows = R.map((row, a) => row.map((x, b) => (a === i && b === j ? '□' : stex(x))));
        return { q: `$${matT(rows)}$ が回転行列 $R(\\theta)$ になるように、行列の中の空いている所に入る数`, boxw: "12mm", boxh: "8mm", a: `$${stex(R[i][j])}$`, key: `47:${d}`,
          easy: i === j ? '対角の2つは同じ $\\cos\\theta$' : '右上と左下は、符号だけがちがう（右上が $-\\sin\\theta$）', easyCheck: false,
          verify: p => close(ev(maths(p.a)[0]), [[Math.cos(d * RAD), -Math.sin(d * RAD)], [Math.sin(d * RAD), Math.cos(d * RAD)]][i][j]) || `□ の数 ${p.a} がちがう` };
      },
      // わな：回転ではない行列（折り返し・のばす）→ 7-17
      trap(r) {
        const L = [['$x$ 軸について折り返す行列', [[1, 0], [0, -1]]], ['$y$ 軸について折り返す行列', [[-1, 0], [0, 1]]], ['直線 $y=x$ について折り返す行列', [[0, 1], [1, 0]]],
          ['直線 $y=-x$ について折り返す行列', [[0, -1], [-1, 0]]], ['横に2倍にのばす行列', [[2, 0], [0, 1]]], ['たてに3倍にのばす行列', [[1, 0], [0, 3]]]];
        const [t, A] = r.pick(L);
        return dest({ q: t, a: `$${matT(A.map(x => x.map(v => S(v))))}$`, key: `47t:${t}`, calc: { kind: 'mat', want: A } }, '7-47',
          '回転ではないので $R(\\theta)$ の形にならない。$\\vec e_x$、$\\vec e_y$ の行き先を列に並べる', ['7-17']);
      },
    },
  });

  // ================================================================ 7-48
  const sq = (a, b) => [a, b].map(Math.abs).sort((x, y) => x - y).join(',');
  const bad48 = (a, b) => sq(a, b) === '3,5' || (a === 0 && b === 0);         // (3, 5) は楽な形の例（O-2）
  const R90 = (d, x, y) => rot(d, x, y).map(v => F.val(v.p));                  // 90° の倍数で回す（整数）
  // 方眼の家（教科書 7-0〜7-2 と同じ。かど5つ）と三角形
  const HOUSE = [[0, 0], [2, 0], [2, 2], [1, 3], [0, 2]];
  add({
    id: '7-48', part: 4, chap: '7-6①・7-0①', stars: 1,
    title: '90°・180°・270°の回転は入れかえと符号だけ：$(x,\\ y)\\to(-y,\\ x)$、$(-x,\\ -y)$、$(y,\\ -x)$',
    mark: '90°の倍数だけ回す。図形の頂点をまとめて回す。',
    futsu: ['$R(90^{\\circ})=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$ を', '書いて、点の座標の', 'ベクトルにかけ、', '行と列の内積を計算する。'],
    raku: ['$(3,\\ 5)$ を左回りに90°：$(-5,\\ 3)$', '180°：$(-3,\\ -5)$', '右回りに90°：$(5,\\ -3)$'],
    why: '$R(90^{\\circ})$ の成分は0と $\\pm1$ だけなので、かけると座標が入れかわり、符号が変わるだけになる（7-6①、4-8）。180°は90°を2回（$R_{90}R_{90}=-I$）、右回りに90°は左回りに270°と同じ。',
    caution: '左回りの90°は $(-y,\\ x)$、右回りの90°は $(y,\\ -x)$。どちらの符号かは、$(1,\\ 0)$ が $(0,\\ 1)$ へ行くか（左回り）で確かめる。30°・45°・60°や、原点ではない点のまわりの回転には使えない。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '40mm', s3: '22mm', trap: '34mm' }, boxh: { trap: '12mm' },
    fits(q) {
      if (/軸|R_|\(-?\d+,\\ -?\d+,\\ -?\d+\)|\\mathsf|\^\{-1\}|もとの|の色/.test(q)) return false;
      if (!/原点のまわり/.test(q) || !/回し|回した/.test(q)) return false;
      const a = angs(q); return a.length > 0 && a.every(d => d % 90 === 0);
    },
    steps: {
      // 1つの点を 90°・180°・270°
      s1(r) {
        const a = r.int(-6, 6), b = r.int(-6, 6), d = r.pick([90, 90, 180, 270, -90]);
        if (bad48(a, b) || a === 0 || b === 0 && r.chance(0.6)) return null;
        const P = R90(d, a, b), how = d === 180 ? '180°' : turnT(d);
        return { q: `点 $(${a},\\ ${b})$ を、原点のまわりに${how}回した点`, a: `$(${P[0]},\\ ${P[1]})$`, key: `48:${a},${b},${mod360(d)}`,
          easy: { 90: '$(x,\\ y)\\to(-y,\\ x)$', 180: '$(x,\\ y)\\to(-x,\\ -y)$', 270: '$(x,\\ y)\\to(y,\\ -x)$' }[mod360(d)], easyCheck: false,
          verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) };
      },
      // 2回つづけて回す・線分の両はし・三角形の頂点
      s2(r) {
        const k = turn(r, '48s2', 2);
        if (k === 0) {
          const a = r.int(-5, 5), b = r.int(-5, 5), d1 = r.pick([90, 180, -90]), d2 = r.pick([90, 180, -90]);
          if (bad48(a, b) || a === 0 || b === 0 || mod360(d1 + d2) === 0) return null;
          const P = R90(d1 + d2, a, b);
          return { q: `点 $(${a},\\ ${b})$ を、原点のまわりに${d1 === 180 ? '180°' : turnT(d1)}回し、さらに${d2 === 180 ? '180°' : turnT(d2)}回した点`, a: `$(${P[0]},\\ ${P[1]})$`, key: `48:${a},${b},${mod360(d1 + d2)}`,
            easy: `合わせて${turnT(d1 + d2 > 180 ? d1 + d2 - 360 : d1 + d2)}回すのと同じ`, easyCheck: false,
            verify: p => vecIs(p.a, mvf(Rf(d2), mvf(Rf(d1), [a, b]))) };
        }
        const a = r.int(-4, 4), b = r.int(-4, 4), c = r.int(-4, 4), e = r.int(-4, 4), d = r.pick([90, 180, -90]);
        if (bad48(a, b) || bad48(c, e) || (a === c && b === e) || !a || !b || !c || !e) return null;
        const P = R90(d, a, b), Q = R90(d, c, e);
        return { q: `A$(${a},\\ ${b})$、B$(${c},\\ ${e})$ を両はしとする線分を、原点のまわりに${d === 180 ? '180°' : turnT(d)}回した線分の両はし A$'$、B$'$`,
          a: `A$'(${P[0]},\\ ${P[1]})$、B$'(${Q[0]},\\ ${Q[1]})$`, key: `48:${[a, b, c, e].join(',')},${mod360(d)}`,
          easy: '点を1つずつ、入れかえと符号で', easyCheck: false,
          verify: p => { const m = maths(p.a); if (m.length < 2) return '答えが読めない'; const u = vecRead(`$${m[0].replace(/^'/, '')}$`), v = vecRead(`$${m[1].replace(/^'/, '')}$`); return (u && v && [...u, ...v].every((x, i) => close(x, [...mvf(Rf(d), [a, b]), ...mvf(Rf(d), [c, e])][i]))) || `答え ${p.a} がちがう`; } };
      },
      // 図：方眼の家・三角形を回す
      s3(r) {
        const house = turn(r, '48s3', 2) === 0;
        const sx = r.int(0, 2), sy = r.int(0, 2), d = r.pick([90, 180, -90]);
        const shape = house ? HOUSE.map(([x, y]) => [x + sx, y + sy]) : [[sx + 1, sy], [sx + 3, sy], [sx + 3, sy + 2]];
        const k = r.int(1, shape.length - 1), [a, b] = shape[k];
        if (bad48(a, b) || a === 0 && b === 0) return null;
        const P = R90(d, a, b), rotd = shape.map(([x, y]) => R90(d, x, y));
        const all = shape.concat(rotd), xs = all.map(v => v[0]).concat(0), ys = all.map(v => v[1]).concat(0);
        const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, y0 = Math.min(...ys) - 1, y1 = Math.max(...ys) + 1;
        const ang = Math.atan2(b, a) / RAD, rr = Math.hypot(a, b);
        const fig = { s: Math.min(4, 48 / (x1 - x0 + 2)), items: [
          ['grid', x0, y0, x1, y1],
          ['axes', x0 - 0.3, x1 + 0.6, y0 - 0.3, y1 + 0.6, { o: 'sw' }],
          ['poly', shape, { dash: true }],
          ['poly', rotd, { fill: true, thick: true }],
          arcPath([0, 0], rr, ang + (d > 0 ? 8 : -8), ang + d + (d > 0 ? -8 : 8), { dash: true }),
          ['dot', [a, b]], ['label', [a, b], `P(${a}, ${b})`, a >= 0 ? 'ne' : 'nw'],
          ['dot', P], ['label', P, "P$'$", P[0] >= 0 ? 'se' : 'sw'],
        ] };
        return { q: `図の${house ? '家' : '三角形'}（点線）を、原点のまわりに${d === 180 ? '180°' : turnT(d)}回しました（色のついた図形）。かど P$(${a},\\ ${b})$ が移った点 P$'$ の座標`, a: `$(${P[0]},\\ ${P[1]})$`, fig,
          key: `48:${a},${b},${mod360(d)}`, easy: { 90: '$(x,\\ y)\\to(-y,\\ x)$', 180: '$(x,\\ y)\\to(-x,\\ -y)$', 270: '$(x,\\ y)\\to(y,\\ -x)$' }[mod360(d)], easyCheck: false,
          verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) };
      },
      // わな：30°・45°・60° → 7-49
      trap(r) {
        const a = r.int(1, 4), b = r.int(1, 4), d = r.pick([30, 45, 60]);
        if (bad48(a, b) || (a === 3 && b === 1) || (a === 2 && b === 0)) return null;
        const P = rot(d, a, b);
        return dest({ q: `点 $(${a},\\ ${b})$ を、原点のまわりに左回りに${d}°回した点`, a: `$${ptT(P)}$`, key: `48t:${a},${b},${d}`,
          verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) }, '7-48', `${d}°は90°の倍数ではないので、入れかえと符号だけではできない`);
      },
    },
  });

  // ================================================================ 7-49
  const P49 = [30, 45, 60, 120, 135, 150, -30, -45, -60];
  // 楽な形の例 (2, 0)・(3, 1) と、その答え (1, √3)・((3−√3)/2, (3√3+1)/2) は出さない（O-2）
  const RAKU49 = [[S(1), S(0, 1, 3)], [S(fr(3, 2), fr(-1, 2), 3), S(fr(1, 2), fr(3, 2), 3)]];
  const bad49 = (a, b, d) => (a === 2 && b === 0) || (a === 3 && b === 1) || (fam(d) > 0 && RAKU49.some(([x, y]) => { const P = rot(d, a, b); return sEq(P[0], x) && sEq(P[1], y); }));
  const coefT = n => (n === 1 ? '' : n === -1 ? '-' : String(n));
  add({
    id: '7-49', part: 4, chap: '7-6① 例題1', stars: 1,
    title: '30°・45°・60°の回転は「$x$×1列め＋$y$×2列め」（$(L,\\ 0)$ なら1列めの $L$ 倍だけ）',
    mark: '点を30°・45°・60°などだけ回す。',
    futsu: ['回転行列 $R(\\theta)$ と', '点のベクトルの積を、', '1行めとの内積、2行めとの', '内積で1つずつ計算する。'],
    raku: ['$(2,\\ 0)$ を60°：$2\\left(\\frac12,\\ \\frac{\\sqrt3}{2}\\right)=(1,\\ \\sqrt3)$', '$(3,\\ 1)$ を60°：$3\\left(\\frac12,\\ \\frac{\\sqrt3}{2}\\right)+\\left(-\\frac{\\sqrt3}{2},\\ \\frac12\\right)$', '$=\\left(\\frac{3-\\sqrt3}{2},\\ \\frac{3\\sqrt3+1}{2}\\right)$', '$\\approx(0.634,\\ 3.098)$'],
    why: '点 $(x,\\ y)$ は「$\\vec e_x$ の向きに $x$ 歩、$\\vec e_y$ の向きに $y$ 歩」。方眼ごと回しても歩数は変わらないので、回した点は「1列め（$\\vec e_x$ の行き先）の $x$ 倍＋2列め（$\\vec e_y$ の行き先）の $y$ 倍」（7-6①）。$y=0$ なら1列めだけでよい。',
    caution: '1列めは $(\\cos\\theta,\\ \\sin\\theta)$、2列めは $(-\\sin\\theta,\\ \\cos\\theta)$。2列めの $-$ を忘れない。原点ではない点のまわりに回すときは、そのままでは使えない（ずらしてから回し、もどす）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '30mm', s2: '42mm', s3: '42mm', trap: '20mm' }, boxh: { s1: '10mm', s2: '12mm', s3: '12mm' },
    fits(q) {
      if (/軸|R_|\(-?\d+,\\ -?\d+,\\ -?\d+\)|もとの|\\mathsf|の色|複素数|j\$|j\)/.test(q)) return false;
      if (/点 C|のまわりに左回りに90/.test(q) && !/原点のまわり/.test(q)) return false;
      const a = angs(q);
      if (/原点のまわり/.test(q) && /回した/.test(q) && a.length && a.every(d => fam(d) > 0)) return true;
      return /R\(-?\d+\^\{\\circ\}\)\\begin\{pmatrix\}/.test(q) && a.every(d => fam(d) > 0);
    },
    steps: {
      // (L, 0)・(0, L) を回す：1列め（2列め）の L 倍
      s1(r) {
        const L = r.int(2, 6), d = r.pick(P49), onX = r.chance(0.7), a = onX ? L : 0, b = onX ? 0 : L;
        if (bad49(a, b, d)) return null;
        const P = rot(d, a, b);
        return { q: `点 $(${a},\\ ${b})$ を、原点のまわりに${turnT(d)}回した点`, a: `$${ptT(P)}$`, key: `49:${a},${b},${d}`,
          easy: onX ? `1列めの ${L} 倍` : `2列めの ${L} 倍`, easyCheck: false, verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) };
      },
      // ふつうの点
      s2(r) {
        const a = r.int(-4, 4), b = r.int(-4, 4), d = r.pick(P49);
        if (!a || !b || bad49(a, b, d)) return null;
        const P = rot(d, a, b), C = Rm(d);
        return { q: `点 $(${a},\\ ${b})$ を、原点のまわりに${turnT(d)}回した点`, a: `$${ptT(P)}$`, key: `49:${a},${b},${d}`,
          easy: `$${coefT(a)}${ptT([C[0][0], C[1][0]])}${b < 0 ? '' : '+'}${coefT(b)}${ptT([C[0][1], C[1][1]])}$`, easyCheck: false, verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) };
      },
      // 小数で（教科書の例題の形）・点を列に並べた行列
      s3(r) {
        const d = r.pick([30, 60, 45, -30, 120, 135, 150]);
        if (turn(r, '49s3', 2)) {
          const a = r.int(-4, 5), b = r.int(-4, 5);
          if (!a && !b || bad49(a, b, d) || (!a || !b) && r.chance(0.7)) return null;
          const T = rot(d, a, b), G = rotG(d, a, b), ap = T.map((t, i) => apx(G[i], t, 3));
          if (ap.includes(null)) return null;
          return { q: `点 $(${a},\\ ${b})$ を、原点のまわりに${turnT(d)}回した点（${givenT(d)} を使い、小数第3位まで）`, a: `約 $(${ap.join(',\\ ')})$`, key: `49:${a},${b},${d}`,
            easy: `$x=${prodT([[gcs(d)[0], a], [F.mul(gcs(d)[1], fr(-1)), b]].filter(t => t[1] && t[0][0]))}$、$y=${prodT([[gcs(d)[1], a], [gcs(d)[0], b]].filter(t => t[1] && t[0][0]))}$`, easyCheck: false,
            verify: p => vecIs(p.a, mvf(Rf(d), [a, b]), 1e-3) };
        }
        const a = r.int(2, 4), b = r.int(1, 4), c = r.int(1, 4);
        const pts = [[0, 0], [a, 0], [b, c]], G = pts.map(([x, y]) => rotG(d, x, y)), T = pts.map(([x, y]) => rot(d, x, y));
        const ap = T.map((t, i) => t.map((u, j) => apx(G[i][j], u, 3)));
        if (ap.flat().includes(null) || bad49(b, c, d)) return null;
        return { q: `3点 O$(0,\\ 0)$、A$(${a},\\ 0)$、B$(${b},\\ ${c})$ を列に並べた行列に、左から $R(${dg(d)})$ をかけた行列（${givenT(d)} を使い、小数第3位まで）`,
          a: `約 $\\begin{pmatrix}${[0, 1].map(j => ap.map(v => v[j]).join('&')).join('\\\\')}\\end{pmatrix}$`, key: `49m:${a},${b},${c},${d}`, boxw: '46mm', boxh: '12mm',
          calc: { kind: 'mat', ans: `\\begin{pmatrix}${[0, 1].map(j => ap.map(v => v[j]).join('&')).join('\\\\')}\\end{pmatrix}`, want: [0, 1].map(j => pts.map(([x, y]) => mvf(Rf(d), [x, y])[j])).map(row => row.map(v => +v.toFixed(3))) },
          easy: '列ごとに、点を1つずつ回す（O は動かない）', easyCheck: false };
      },
      // わな：原点ではない点のまわりに90° → 7-48
      trap(r) {
        const c1 = r.int(-2, 3), c2 = r.int(-2, 3), a = r.int(-3, 5), b = r.int(-3, 5);
        if ((!c1 && !c2) || (a === c1 && b === c2) || bad49(c1, c2, 0) || bad49(a, b, 0)) return null;   // 楽な形の例の点 (2, 0)・(3, 1) は中心にも使わない
        const d = r.pick([90, -90, 180]), P = R90(d, a - c1, b - c2);
        return dest({ q: `点 $(${a},\\ ${b})$ を、点 C$(${c1},\\ ${c2})$ のまわりに${d === 180 ? '180°' : turnT(d)}回した点`, a: `$(${P[0] + c1},\\ ${P[1] + c2})$`, key: `49t:${a},${b},${c1},${c2},${d}`,
          verify: p => vecIs(p.a, mvf(Rf(d), [a - c1, b - c2]).map((v, i) => v + [c1, c2][i])) }, '7-49',
          '回す中心が原点ではない。C を引いてから90°の倍数で回し、C をたしてもどす', ['7-48']);
      },
    },
  });

  // ================================================================ 7-50
  // 楽な形の例：R(30°)R(45°)、R(20°)R(40°)=R(60°)（成分）、R(150°)R(−60°)（O-2）
  const RAKU50 = ['30,45', '20,40', '-60,150'];
  const bad50 = (...ds) => ds.length === 2 && RAKU50.includes(ds.slice().sort((x, y) => x - y).join(','));
  const prodR = ds => ds.map(d => `R(${dg(d)})`).join('');
  add({
    id: '7-50', part: 4, chap: '7-6④ 例題2', stars: 1,
    title: '回転をつなぐと角はたし算：$R(\\alpha)R(\\beta)=R(\\alpha+\\beta)$（積を成分で計算しない）',
    mark: '回転行列どうしの積。$R(25^{\\circ})R(35^{\\circ})$ など。',
    futsu: ['2つの回転行列を成分で書き、', '左の行の4つと右の列の', '内積を1つずつ計算して、', '何°の回転か見くらべる。'],
    raku: ['$R(30^{\\circ})R(45^{\\circ})=R(75^{\\circ})$', '$R(20^{\\circ})R(40^{\\circ})=R(60^{\\circ})=\\begin{pmatrix}\\tfrac12&-\\tfrac{\\sqrt3}{2}\\\\[2pt]\\tfrac{\\sqrt3}{2}&\\tfrac12\\end{pmatrix}$', '$R(150^{\\circ})R(-60^{\\circ})=R(90^{\\circ})$'],
    why: '$\\beta$ 回してから $\\alpha$ 回すと、全部で $\\alpha+\\beta$ 回る。成分で計算すると、中から加法定理（4-9）が出てきて、たしかに $R(\\alpha+\\beta)$ になる（7-6④）。だから $\\cos20^{\\circ}$ のような値を知らなくても、たした角が30°・45°・60°などなら成分が書ける。',
    caution: '回転行列の積だけに使える（$R(\\alpha)+R(\\beta)$ のたし算は $R(\\alpha+\\beta)$ にならない）。平面の回転どうしは順番を変えてもよいが、3次元の回転（7-7）では順番で答えが変わる。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: { s1: '16mm', s2: '30mm', s3: '16mm', trap: '40mm' }, boxh: { s2: '14mm', trap: '14mm' },
    fits(q) {
      if (/\+R|R_|\)\^\{?\d|\^\{-1\}|\\mathsf|A\(/.test(q)) return false;
      if ((q.match(/R\((?:□|-?\d+\^\{\\circ\})\)/g) || []).length >= 2) return true;
      return /先に.*回し.*次に.*回した|回してから.*回した/.test(q) && !/軸/.test(q);
    },
    steps: {
      // 何°の回転か（角だけ）
      s1(r) {
        const n = r.chance(0.25) ? 3 : 2, ds = [];
        for (let k = 0; k < n; k++) ds.push(r.pick(n === 3 ? [5, 10, 15, 20, 25, 35, 40, 50, 55, 65, 70, 80] : [5, 10, 15, 20, 25, 35, 40, 50, 55, 65, 70, 80, 100, 110, 130, 140, -10, -15, -20, -25, -40, -50]));
        const T = ds.reduce((x, y) => x + y, 0);
        if (T <= -180 || T > 360 || T === 0 || bad50(...ds) || new Set(ds).size < n) return null;
        return { q: `$${prodR(ds)}=R(\\theta)$ の $\\theta$`, a: `$${dg(T)}$`, key: `50:${ds.slice().sort((x, y) => x - y).join(',')}`, easy: `$${ds.map(d => sgn(d)).join('+')}=${T}$`, easyCheck: false,
          verify: p => { const t = angRead(p.a); if (t == null) return '角が読めない'; const A = ds.reduce((M0, d) => mulf(M0, Rf(d)), [[1, 0], [0, 1]]); return (close(A[0][0], Math.cos(t * RAD)) && close(A[1][0], Math.sin(t * RAD))) || `積が R(${t}°) にならない`; } };
      },
      // 値を知らない角の積を成分で（たすと30°・45°・90°などになる）
      s2(r) {
        const T = r.pick([30, 45, 90, 120, 135, 150, 180, -30, -45, -90, -120]), a = r.pick([5, 10, 20, 25, 35, 40, 50, 55, 70, 80, 100, -10, -20, -25, -35, -40, -50]), b = T - a;
        if (b % 15 === 0 || Math.abs(b) > 200 || b === 0 || bad50(a, b)) return null;
        const R = Rm(T);
        return { q: `$${prodR([a, b])}$ を成分で書いた行列`, a: `$${matT(R)}$`, key: `50m:${[a, b].sort((x, y) => x - y).join(',')}`, calc: { kind: 'mat', want: matV(R) },
          easy: `$${a}+${sgn(b)}=${T}$ なので $R(${dg(T)})$`, easyCheck: false };
      },
      // □ の角・ことばで（絵を回す）
      s3(r) {
        if (turn(r, '50s3', 2)) {
          const T = r.pick([30, 45, 60, 90, 120, 180, 150]), b = r.pick([10, 15, 20, 25, 35, 40, 50, 70, -10, -20, -30]), a = T - b;
          if (a === 0 || a === b || bad50(a, b)) return null;
          return { q: `$R(\\alpha)R(${dg(b)})=R(${dg(T)})$ の $\\alpha$`, a: `$${dg(a)}$`, key: `50:${[a, b].sort((x, y) => x - y).join(',')}`, easy: `$${T}-${sgn(b)}=${a}$`, easyCheck: false,
            verify: p => { const t = angRead(p.a); return (t != null && mod360(t + b - T) === 0) || `${p.a} がちがう`; } };
        }
        const a = r.pick([20, 25, 35, 40, 50, 70, 80]), b = r.pick([15, 30, 45, 60, 10, 20]), sg = r.chance(0.5) ? 1 : -1;
        const T = a + sg * b;
        if (T === 0 || (sg > 0 && bad50(a, b)) || (sg < 0 && bad50(a, -b))) return null;
        return { q: `画面の絵を、原点のまわりに左回りに${a}°回してから、${sg > 0 ? '左' : '右'}回りに${b}°回しました。この2つの回転をつないだ回転行列 $R(\\theta)$ の $\\theta$`, a: `$${dg(T)}$`,
          key: `50:${[a, sg * b].sort((x, y) => x - y).join(',')}`, easy: `$R(${dg(sg * b)})R(${dg(a)})=R(${dg(T)})$（あとの回転が左）`, easyCheck: false,
          verify: p => { const t = angRead(p.a); return (t != null && mod360(t - a - sg * b) === 0) || `${p.a} がちがう`; } };
      },
      // わな：回転行列のたし算 → 楽な形なし
      trap(r) {
        const pairs = [[30, 60], [45, 90], [90, 180], [45, 135], [60, 120], [60, 90], [30, 90], [30, 120]];   // たして0になる組・回転行列になる組（30°と150°）は出さない
        const [a, b] = r.pick(pairs), A = Rm(a), B = Rm(b), C = A.map((row, i) => row.map((x, j) => sAdd(x, B[i][j])));
        return dest({ q: `$R(${dg(a)})+R(${dg(b)})$ を成分で書いた行列`, a: `$${matT(C)}$`, key: `50t:${a},${b}`, calc: { kind: 'mat', want: matV(C) } }, '7-50',
          `たし算は回転をつなぐことではないので、$R(${dg(a + b)})$ にはならない。成分ごとにたす`);
      },
    },
  });

  // ================================================================ 7-51
  // 楽な形の例：R(45°)^2・R(45°)^4・8回、R(30°) は12回、R(6°)^60（O-2）
  const bad51 = (t, n) => ['45:2', '45:4', '45:8', '30:12', '6:60'].includes(`${t}:${n}`);
  const firstI = t => 360 / F.gcd(((t % 360) + 360) % 360 || 360, 360);
  add({
    id: '7-51', part: 4, chap: '7-6④ 例題3', stars: 1,
    title: '$R(\\theta)^n=R(n\\theta)$：$I$ にもどるのは $n\\theta$ が360°の倍数のとき',
    mark: '$R(\\theta)$ の $n$ 乗。「何回かけると $I$ になるか」。',
    futsu: ['$R(\\theta)$ を成分で書き、', '行列を1回ずつかけていって、', '$I$ になるまで', 'くり返す。'],
    raku: ['$R(45^{\\circ})^2=R(90^{\\circ})$', '$R(45^{\\circ})^4=R(180^{\\circ})=-I$、8回で $I$', '$R(30^{\\circ})$ は12回、$R(6^{\\circ})^{60}=I$'],
    why: '$R(\\theta)$ を $n$ 回かけると、角は $\\theta$ が $n$ 個たされて $n\\theta$（7-6④）。360°回すと1周してもとにもどるので、$n\\theta$ が360°の倍数になれば $I$、180°なら $-I$。',
    caution: '回転行列の $n$ 乗だけに使える。$\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$ のような、回転でない行列は何回かけても $I$ にならないことがある。「はじめて」$I$ になる回数は、$n\\theta$ がいちばん小さい360°の倍数になる $n$。',
    counts: { s1: 8, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '20mm', s3: '16mm', trap: '40mm' }, boxh: { s2: '12mm' },
    fits(q) {
      if (/R_|\\mathsf|\^\{-1\}/.test(q)) return false;
      if (/R\(-?\d+\^\{\\circ\}\)\^\{?\d/.test(q)) return true;
      if (/R\(-?\d+\^\{\\circ\}\)/.test(q) && /何回|回めの|はじめて/.test(q) && !/begin\{pmatrix\}1/.test(q)) return true;
      return false;
    },
    steps: {
      // R(θ)^n = R(□)
      s1(r) {
        const t = r.pick([10, 15, 20, 25, 30, 40, 45, 50, 60, 70, 80, 90, 120]), n = r.int(2, 6);
        if (t * n > 360 || bad51(t, n)) return null;
        return { q: `$R(${dg(t)})^{${n}}=R(□)$`, a: `$${dg(t * n)}$`, key: `51:${t}:${n}`, easy: `$${t}\\times${n}=${t * n}$`, easyCheck: false,
          verify: p => { const u = angRead(p.a); let A = [[1, 0], [0, 1]]; for (let k = 0; k < n; k++) A = mulf(A, Rf(t)); return (u != null && close(A[0][0], Math.cos(u * RAD)) && close(A[1][0], Math.sin(u * RAD))) || `${p.a} がちがう`; } };
      },
      // 何回で I ・ n 乗を成分で（±I・±R90）
      s2(r) {
        if (turn(r, '51s2', 2)) {
          const t = r.pick([60, 90, 120, 72, 40, 20, 36, 15, 10, 135, 150, 80, 100, 24, 18, 12, 9, 144, 108, 160, -90, -60]), n = firstI(t);
          if (bad51(Math.abs(t), n)) return null;
          return { q: `$R(${dg(t)})$ を何回かけると、はじめて $I$ になるか`, a: `${n}回`, key: `51i:${t}`, easy: `$${Math.abs(t)}\\times n$ が360の倍数になるいちばん小さい $n$`, easyCheck: false,
            verify: p => { const m = +(/(\d+)/.exec(p.a) || [])[1]; let A = [[1, 0], [0, 1]], k = 0; do { A = mulf(A, Rf(t)); k++; } while (!(close(A[0][0], 1, 1e-7) && Math.abs(A[1][0]) < 1e-7) && k < 400); return m === k || `${k}回のはず`; } };
        }
        const t = r.pick([30, 60, 90, 120, 135, 150, 15, 22.5].filter(Number.isInteger)), n = r.int(2, 8), T = mod360(t * n);
        if (T % 90 || bad51(t, n) || t * n > 720) return null;
        const R = Rm(T);
        return { q: `$R(${dg(t)})^{${n}}$ を成分で書いた行列`, a: `$${matT(R)}$`, key: `51m:${t}:${n}`, calc: { kind: 'mat', want: matV(R) },
          easy: `$R(${dg(t * n)})${T === t * n ? '' : `=R(${dg(T)})`}$${T === 180 ? '$=-I$' : T === 0 ? '$=I$' : ''}`, easyCheck: false };
      },
      // ゲームの画面・-I になる回数
      s3(r) {
        const k = turn(r, '51s3', 3);
        if (k === 0) {
          const t = r.pick([2, 3, 4, 5, 8, 9, 10, 12, 15, 18, 20, 24]), n = 360 / t;
          return { q: `ゲームの画面で、キャラクターの絵のすべての頂点に、1回のかきかえごとに $R(${dg(t)})$ をかけます。はじめてもとの向きにもどるのは、何回めのかきかえのあとか`, a: `${n}回め`, key: `51i:${t}`,
            easy: `$R(${dg(t)})^{n}=R(${t}n^{\\circ})=I$ より $${t}n=360$`, easyCheck: false, verify: p => +(/(\d+)/.exec(p.a) || [])[1] * t === 360 || 'ちがう' };
        }
        if (k === 1) {
          const [f, sec, turns] = r.pick([[60, 3, 1], [30, 1, 1], [24, 1, 1], [60, 2, 1], [30, 2, 1], [60, 1, 2], [20, 1, 1], [40, 1, 1]]), t = 360 * turns / (f * sec);
          if (!Number.isInteger(t * 10) || t === 6) return null;
          return { q: `画面を1秒に${f}回かきかえるゲームで、キャラクターを${sec}秒で${turns === 1 ? 'ちょうど1回転' : `ちょうど${turns}回転`}させたい。かきかえ1回ごとにかける回転行列 $R(\\theta)$ の $\\theta$`, a: `$${dg(t)}$`, key: `51g:${f}:${sec}:${turns}`,
            easy: `$R(\\theta)^{${f * sec}}=R(${360 * turns}^{\\circ})$ より $\\theta=${360 * turns}\\div${f * sec}$`, easyCheck: false, verify: p => close(angRead(p.a) * f * sec, 360 * turns) || 'ちがう' };
        }
        const t = r.pick([10, 15, 20, 30, 36, 60, 90, 18, 12, 40, 4, 5]), n = 180 / t;
        if (!Number.isInteger(n) || bad51(t, n)) return null;
        return { q: `$R(${dg(t)})$ を何回かけると、はじめて $-I$（すべての点が原点について反対側）になるか`, a: `${n}回`, key: `51h:${t}`, easy: `$${t}n=180$`, easyCheck: false,
          verify: p => { const m = +(/(\d+)/.exec(p.a) || [])[1]; let A = [[1, 0], [0, 1]], c = 0; do { A = mulf(A, Rf(t)); c++; } while (!close(A[0][0], -1, 1e-7) && c < 400); return m === c || `${c}回のはず`; } };
      },
      // わな：回転でない行列（ずらし）→ 7-26
      trap(r) {
        const [A, t] = r.pick([[[1, 1], [0, 1]], [[1, 0], [1, 1]], [[1, 2], [0, 1]], [[1, 0], [-1, 1]], [[1, -1], [0, 1]], [[1, 0], [3, 1]]].map(A => [A, matT(A.map(x => x.map(v => S(v))))]));
        const up = A[0][1] !== 0, c = up ? A[0][1] : A[1][0];
        return dest({ q: `$${t}$ を何回かけると、はじめて $I$ になるか`, a: `ならない（$n$ 回かけると $${up ? `\\begin{pmatrix}1&${c === 1 ? '' : c === -1 ? '-' : c}n\\\\0&1\\end{pmatrix}` : `\\begin{pmatrix}1&0\\\\${c === 1 ? '' : c === -1 ? '-' : c}n&1\\end{pmatrix}`}$）`, key: `51t:${t}`,
          verify: () => { let B = A, ok = true; for (let k = 1; k < 30; k++) { if (B[0][0] === 1 && B[1][1] === 1 && !B[0][1] && !B[1][0]) ok = false; B = [[B[0][0] * A[0][0] + B[0][1] * A[1][0], B[0][0] * A[0][1] + B[0][1] * A[1][1]], [B[1][0] * A[0][0] + B[1][1] * A[1][0], B[1][0] * A[0][1] + B[1][1] * A[1][1]]]; } return ok || 'I になる'; } },
          '7-51', '回転行列ではない（ずらしの行列）。かけるたびに右上（左下）の数がふえるだけ', ['7-26']);
      },
    },
  });

  // ================================================================ 7-52
  add({
    id: '7-52', part: 4, chap: '7-6⑤ 例題5', stars: 1,
    title: '回転の逆行列は転置：$R(\\theta)^{-1}=R(\\theta)^{\\mathsf T}=R(-\\theta)$（行列式を出してわらない）',
    mark: '「回したら□になった。もとの点は」。$R(\\theta)^{-1}$。',
    futsu: ['逆行列の公式で、行列式を', '計算してから、対角を入れかえ、', '符号を変えて、行列式でわる', '（7-5）。'],
    raku: ['$R(90^{\\circ})$ で回したら $(-3,\\ 5)$', '$R(90^{\\circ})^{\\mathsf T}=\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$ をかけて $(5,\\ 3)$', '$R(60^{\\circ})$ で $(0.634,\\ 3.098)$ → $(3,\\ 1)$'],
    why: '回したものをもとにもどすには、反対に $-\\theta$ 回せばよい。$R(\\theta)$ の行列式は $\\cos^2\\theta+\\sin^2\\theta=1$ で、逆行列の公式で作ると、たてとよこを入れかえた転置と同じ形になる（7-6⑤）。',
    caution: '回転行列（列の長さが1で直角、行列式1）だけに使える。$\\begin{pmatrix}2&1\\\\1&2\\end{pmatrix}$ のような行列は、転置しても逆行列にならない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '30mm', s2: '20mm', s3: '22mm', trap: '34mm' }, boxh: { s1: '14mm', trap: '14mm' },
    fits(q) {
      if (/R_/.test(q)) return false;
      if (/R\(-?\d+\^\{\\circ\}\)\^\{-1\}/.test(q)) return true;
      return /R\(-?\d+\^\{\\circ\}\)\$ で回したら/.test(q) || (/回す前の写真|もとの写真/.test(q));
    },
    steps: {
      // R(θ)^{-1} を成分で
      s1(r) {
        const d = r.pick([30, 45, 120, 135, 150, 180, -30, -45, -60, -90, -120, 210, 270, 300]), R = Rm(-d);
        return { q: `$R(${dg(d)})^{-1}$ を成分で書いた行列`, a: `$${matT(R)}$`, key: `52:${d}`, calc: { kind: 'mat', want: matV(R) },
          easy: `$R(${dg(d)})$ のたてとよこを入れかえる（$=R(${dg(-d)})$）`, easyCheck: false };
      },
      // 回した点から、もとの点へ
      s2(r) {
        const d = r.pick([90, 180, -90, 270, 30, 45, 60, 120, 135, -30, -45, -60]), a = r.int(-4, 5), b = r.int(-4, 5);
        if (!a || !b || (d === 90 && a === 5 && b === 3) || (d === 60 && a === 3 && b === 1)) return null;
        const P = rot(d, a, b);
        return { q: `ある点を $R(${dg(d)})$ で回したら $${ptT(P)}$ になった。もとの点`, a: `$(${a},\\ ${b})$`, key: `52:${d}:${a},${b}`,
          easy: `$R(${dg(d)})^{\\mathsf T}=R(${dg(-d)})$ をかける`, easyCheck: false,
          verify: p => { const v = vecRead(`$${maths(p.q)[1]}$`); return v ? vecIs(p.a, mvf(Rf(-d), v)) : '回した点が読めない'; } };
      },
      // 小数で（教科書の例題）・写真を回すアプリ
      s3(r) {
        if (turn(r, '52s3', 2)) {
          const d = r.pick([30, 60, -30, -60, 45, -45]), a = r.int(1, 5), b = r.int(-3, 4);
          if (!b || (d === 60 && a === 3 && b === 1)) return null;
          const T = rot(d, a, b), G = rotG(d, a, b), ap = T.map((t, i) => apx(G[i], t, 3));
          if (ap.includes(null)) return null;
          const [c, s] = gcs(-d), back = [F.add(F.mul(c, D(ap[0])), F.mul(F.mul(s, fr(-1)), D(ap[1]))), F.add(F.mul(s, D(ap[0])), F.mul(c, D(ap[1])))];
          if (Math.abs(F.val(back[0]) - a) >= 0.0005 || Math.abs(F.val(back[1]) - b) >= 0.0005) return null;   // 小数第3位まで計算して、もとの整数にもどる
          return { q: `ある点を $R(${dg(d)})$ で回したら $(${ap.join(',\\ ')})$ になった。もとの点（${givenT(d)} を使い、小数第3位まで計算して整数に）`, a: `$(${a},\\ ${b})$`, key: `52:${d}:${a},${b}`,
            easy: `$R(${dg(d)})^{\\mathsf T}$ の1行め $(${fdec(c)},\\ ${fdec(F.mul(s, fr(-1)))})$、2行め $(${fdec(s)},\\ ${fdec(c)})$ をかけて $(${roundF(back[0], 3)},\\ ${roundF(back[1], 3)})$`, easyCheck: false,
            verify: p => { const v = vecRead(`$${maths(p.q)[1]}$`); return v ? vecIs(p.a, mvf(Rf(-d), v), 1e-3) : '読めない'; } };
        }
        const d = r.pick([90, 180, -90, 30, 60, 45, -30, -45]), a = r.int(-5, 6), b = r.int(-4, 6);
        if (!a || !b || (d === 60 && a === 3 && b === 1) || (d === 90 && a === 5 && b === 3)) return null;
        const P = rot(d, a, b);
        return { q: `写真を原点のまわりに${d === 180 ? '180°' : turnT(d)}回すアプリがあります。回した後の画面の点 $${ptT(P)}$ の色は、回す前の写真のどの点の色か`, a: `$(${a},\\ ${b})$`, key: `52:${d}:${a},${b}`,
          easy: `$R(${dg(d)})^{-1}=R(${dg(d)})^{\\mathsf T}$ をかけて、回す前にもどす`, easyCheck: false,
          verify: p => { const v = vecRead(`$${maths(p.q)[0]}$`); return v ? vecIs(p.a, mvf(Rf(-d), v)) : '読めない'; } };
      },
      // わな：回転でない行列の逆行列 → 7-39
      trap(r) {
        const A = r.pick([[[2, 1], [1, 2]], [[3, 1], [2, 1]], [[4, 1], [3, 1]], [[2, -1], [1, 1]], [[1, 1], [-1, 1]], [[1, 2], [1, 3]], [[2, 0], [0, 4]]]), Am = M.Mat.make(A), I = M.Mat.inv(Am);
        return dest({ q: `$${matT(A.map(x => x.map(v => S(v))))}^{-1}$`, a: `$${M.Mat.tex(I, { factor: true })}$`, key: `52t:${A.flat().join(',')}`, calc: { kind: 'mat', want: I } }, '7-52',
          '回転行列ではない（列の長さが1でない、または直角でない）ので、転置は逆行列にならない', ['7-39']);
      },
    },
  });

  // ================================================================ 7-53
  // ピタゴラス数で作る回転行列（成分は小数か分数）。楽な形の例の3つは出さない（O-2）
  const TRIP = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25]];
  const trT = (n, h) => { const f = fr(n, h); return fdec(f) != null && h !== 17 && h !== 13 ? fdec(f) : F.tex(f); };   // 0.6、0.28、\frac{5}{13}
  const RAKU53 = ['0.6,-0.8,0.8,0.6', '0.6,0.8,0.8,-0.6', '1,-1,1,1'];
  function kind53(A) {   // 回転行列か（列の長さ・内積・行列式で）。ことばで
    const c1 = A[0][0] ** 2 + A[1][0] ** 2, c2 = A[0][1] ** 2 + A[1][1] ** 2, ip = A[0][0] * A[0][1] + A[1][0] * A[1][1], dt = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    if (!close(c1, 1) || !close(c2, 1)) return 'ちがう（列の長さが1でない）';
    if (!close(ip, 0)) return 'ちがう（列の内積が0でない）';
    if (close(dt, -1)) return 'ちがう（行列式が $-1$）';
    return '回転行列';
  }
  add({
    id: '7-53', part: 4, chap: '7-6⑤ 例題6', stars: 1,
    title: '回転行列かどうかは「列の長さが1・列の内積が0・行列式が1」（行列式 $-1$ なら裏返しがまざる）',
    mark: '「回転行列ですか」。成分が0.6・0.8 や分数の行列。',
    futsu: ['$\\cos\\theta=0.6$ になる角を', 'さがし、その角の $\\sin\\theta$ と', '4つの成分をくらべて、', '$R(\\theta)$ の形か調べる。'],
    raku: ['$\\begin{pmatrix}0.6&-0.8\\\\0.8&0.6\\end{pmatrix}$：1・0・1 で回転', '$\\begin{pmatrix}0.6&0.8\\\\0.8&-0.6\\end{pmatrix}$：行列式 $-1$ でちがう', '$\\begin{pmatrix}1&-1\\\\1&1\\end{pmatrix}$：長さ $\\sqrt2$ でちがう'],
    why: '回転した $\\vec e_x$、$\\vec e_y$ は、長さ1のまま直角（7-6⑤ の直交行列）。だから列の長さが1で、列の内積が0。そのうえ、裏返しがまざらなければ行列式は1（7-4）。角の値を知らなくても、かけ算とたし算だけで決まる。',
    caution: '列の長さが1で直角でも、行列式が $-1$ なら回転と裏返しの組み合わせ（7-2 の折り返しのなかま）。3つのうち1つでも合わなければ回転行列ではない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '46mm', s2: '24mm', s3: '46mm', trap: '20mm' }, boxh: { s2: '12mm', trap: '12mm' },
    fits(q) { return /回転行列ですか|回転行列になる|回転行列 \$R\$ の1列め|回転行列 \$R\$ の2列め/.test(q) && !/R\(/.test(q); },
    steps: {
      // 回転行列ですか（2×2）
      s1(r) {
        const k = r.int(0, 4), [a, b, h] = r.pick(TRIP), sa = r.pick([1, -1]), sb = r.pick([1, -1]);
        const c = sa * a / h, s = sb * b / h, cT = (sa < 0 ? '-' : '') + trT(a, h), sT = (sb < 0 ? '-' : '') + trT(b, h), nsT = (sb < 0 ? '' : '-') + trT(b, h), ncT = (sa < 0 ? '' : '-') + trT(a, h);
        let A, T;
        if (k <= 1) { A = [[c, -s], [s, c]]; T = [[cT, nsT], [sT, cT]]; }
        else if (k === 2) { A = [[c, s], [s, -c]]; T = [[cT, sT], [sT, ncT]]; }
        else if (k === 3) { A = [[c, s], [s, c]]; T = [[cT, sT], [sT, cT]]; }
        else { const m = r.int(1, 3), n = r.int(1, 3); A = [[m, -n], [n, m]]; T = [[String(m), String(-n)], [String(n), String(m)]]; }
        if (RAKU53.includes(T.flat().map(x => String(+(ev(x).toFixed(6)))).join(','))) return null;
        const ans = kind53(A);
        return { q: `次の行列は回転行列ですか。$${matT(T)}$　□`, a: ans, key: `53:${T.flat().join(',')}`,
          easy: `列の長さの2乗 $${+(A[0][0] ** 2 + A[1][0] ** 2).toFixed(6)}$・$${+(A[0][1] ** 2 + A[1][1] ** 2).toFixed(6)}$、内積 $${+(A[0][0] * A[0][1] + A[1][0] * A[1][1]).toFixed(6)}$、行列式 $${+(A[0][0] * A[1][1] - A[0][1] * A[1][0]).toFixed(6)}$`, easyCheck: false,
          verify: p => { const B = T.map(row => row.map(ev)); return p.a === kind53(B) || `${kind53(B)} のはず`; } };
      },
      // 1列めから2列め・あいている成分
      s2(r) {
        const [a, b, h] = r.pick(TRIP), sa = r.pick([1, -1]), sb = r.pick([1, -1]);
        const cT = (sa < 0 ? '-' : '') + trT(a, h), sT = (sb < 0 ? '-' : '') + trT(b, h), nsT = (sb < 0 ? '' : '-') + trT(b, h);
        if (RAKU53.includes([sa * a / h, -sb * b / h, sb * b / h, sa * a / h].map(x => String(+x.toFixed(6))).join(','))) return null;
        const pa = x => (hasFrac(x) ? `\\left(${x}\\right)` : `(${x})`);
        if (turn(r, '53s2', 2)) {
          return { q: `回転行列 $R$ の1列めが $${pa(`${cT},\\ ${sT}`)}$ のとき、2列め`, a: `$${pa(`${nsT},\\ ${cT}`)}$`, key: `53:${cT},${sT}`, easy: '1列めを90°回す：$(x,\\ y)\\to(-y,\\ x)$', easyCheck: false,
            verify: p => vecIs(p.a, [-sb * b / h, sa * a / h]) };
        }
        return { q: `$${matT([[cT, 'a'], [sT, cT]])}$ が回転行列になる $a$`, a: `$${nsT}$`, key: `53:${cT},${sT}`, easy: '右上は左下の符号を変えた数（2列めは1列めを90°回したもの）', easyCheck: false,
          verify: p => close(ev(maths(p.a)[0]), -sb * b / h) || 'ちがう' };
      },
      // 3×3 の行列・大きい分数
      s3(r) {
        const L = [
          [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
          [[1, 0, 0], [0, 0, -1], [0, 1, 0]], [[1, 0, 0], [0, 0, 1], [0, 1, 0]], [[-1, 0, 0], [0, -1, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
          [[1, 0, 0], [0, 0.6, -0.8], [0, 0.8, 0.6]], [[1, 0, 0], [0, 0.6, 0.8], [0, 0.8, -0.6]], [[2, 0, 0], [0, 1, 0], [0, 0, 1]], [[0.8, 0, 0.6], [0, 1, 0], [-0.6, 0, 0.8]]];
        const A = r.pick(L), T = A.map(row => row.map(String)), At = A[0].map((_, j) => A.map(row => row[j]));
        const ok = At.every(c => close(c.reduce((s, x) => s + x * x, 0), 1)) && [[0, 1], [0, 2], [1, 2]].every(([i, j]) => close(At[i].reduce((s, x, k) => s + x * At[j][k], 0), 0));
        const dt = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
        const ans = !ok ? (At.every(c => close(c.reduce((s, x) => s + x * x, 0), 1)) ? 'ちがう（列の内積が0でない）' : 'ちがう（列の長さが1でない）') : close(dt, 1) ? '回転行列' : 'ちがう（行列式が $-1$）';
        return { q: `次の3×3の行列は回転行列ですか。$${matT(T)}$　□`, a: ans, key: `53:${T.flat().join(',')}`, easy: `3本の列の長さ・3組の内積・行列式（$${+dt.toFixed(6)}$）を調べる`, easyCheck: false,
          verify: p => { const B = T.map(row => row.map(ev)); const d2 = B[0][0] * (B[1][1] * B[2][2] - B[1][2] * B[2][1]) - B[0][1] * (B[1][0] * B[2][2] - B[1][2] * B[2][0]) + B[0][2] * (B[1][0] * B[2][1] - B[1][1] * B[2][0]); const bt = mulf(B[0].map((_, j) => B.map(row => row[j])), B); const orth = bt.every((row, i) => row.every((x, j) => close(x, i === j ? 1 : 0))); return (orth && close(d2, 1)) === (p.a === '回転行列') || '判定がちがう'; } };
      },
      // わな：回転行列で点を動かす → 7-16
      trap(r) {
        const [a, b, h] = r.pick(TRIP.filter(t => t[2] !== 17 && t[2] !== 13)), L = r.pick([h, 2 * h]), onX = r.chance(0.6);
        const cT = trT(a, h), sT = trT(b, h);
        if (cT === '0.6' && sT === '0.8') return null;
        const P = onX ? [a * L / h, b * L / h] : [-b * L / h, a * L / h];
        return dest({ q: `回転行列 $${matT([[cT, '-' + sT], [sT, cT]])}$ で、点 $(${onX ? L : 0},\\ ${onX ? 0 : L})$ はどこへ行くか`, a: `$(${P.map(v => +v.toFixed(6)).join(',\\ ')})$`, key: `53t:${cT}:${L}:${onX}`,
          verify: p => vecIs(p.a, P) }, '7-53', `回転行列かどうかではなく、点の行き先を聞いている。${onX ? '1' : '2'}列めの ${L} 倍`, ['7-16']);
      },
    },
  });

  // ================================================================ 7-54
  // 楽な形の例：P(2, 4) を軸30°で (√3+2, 2√3−1)、1.0 kg・30°の坂（O-2）
  const RAKU54 = [S(2, 1, 3), S(-1, 2, 3)];
  const bad54 = (a, b, d) => (a === 2 && b === 4) || (fam(d) >= 0 && (() => { const P = rot(-d, a, b); return sEq(P[0], RAKU54[0]) && sEq(P[1], RAKU54[1]); })());
  const axisT = d => `$x$ 軸・$y$ 軸を${turnT(d)}回した $x'$ 軸・$y'$ 軸`;
  // 坂の図：坂（三角形）、荷物（四角）、x' 軸と y' 軸、重力の矢印、坂の角
  function slopeFig(th) {
    const W = { 30: 9, 45: 7, 60: 5 }[th], H = W * Math.tan(th * RAD), c = Math.cos(th * RAD), s = Math.sin(th * RAD);
    const t = W / c * 0.55, C = [t * c, t * s], u = [c, s], n = [-s, c], w = 0.8, h = 1.1;
    const P = (a, b) => [C[0] + u[0] * a + n[0] * b, C[1] + u[1] * a + n[1] * b], G = P(0, h / 2);
    return { s: 5, items: [
      ['poly', [[0, 0], [W, 0], [W, H]], { fill: true }],
      ['poly', [P(-w, 0), P(w, 0), P(w, h), P(-w, h)], { thick: true }],
      ['seg', G, [G[0] + u[0] * 3.2, G[1] + u[1] * 3.2], { arrow: true }], ['label', [G[0] + u[0] * 3.3, G[1] + u[1] * 3.3], "$x'$", 'e'],
      ['seg', G, [G[0] + n[0] * 3, G[1] + n[1] * 3], { arrow: true }], ['label', [G[0] + n[0] * 3.1, G[1] + n[1] * 3.1], "$y'$", 'n'],
      ['seg', G, [G[0], G[1] - 3], { arrow: true, thick: true }], ['label', [G[0], G[1] - 3], '重力', 's'],
      ['angle', [W, 0], [0, 0], [W, H], `${th}°`, 1.4],
    ] };
  }
  add({
    id: '7-54', part: 4, chap: '7-6⑥ 例題8', stars: 1,
    title: '軸を $\\theta$ 回して見た座標は $R(\\theta)^{\\mathsf T}\\vec x$（点を $-\\theta$ 回すのと同じ）。坂にそった重力は $(-mg\\sin\\theta,\\ -mg\\cos\\theta)$',
    mark: '「軸を左回りに□°回した座標」「坂にそった成分と坂に垂直な成分」。',
    futsu: ['新しい $x\'$ 軸・$y\'$ 軸の向きの', '長さ1の矢印を作り、', '点との内積で、それぞれの', '軸の向きに何歩分かを求める。'],
    raku: ['P$(2,\\ 4)$、軸を30°：$R(30^{\\circ})^{\\mathsf T}$ をかけて', '$(\\sqrt3+2,\\ 2\\sqrt3-1)\\approx(3.732,\\ 2.464)$', '1.0 kg、30°の坂：$(-4.9,\\ -4.9\\sqrt3)$ N'],
    why: '軸が左に $\\theta$ 回ると、軸から見て点は右に $\\theta$ 回ったように見える（7-6⑥）。だから $R(-\\theta)=R(\\theta)^{\\mathsf T}$ をかける。$R(\\theta)^{\\mathsf T}$ の1行め・2行めは、新しい軸の向きの矢印そのもの。坂の軸は、$x$ 軸・$y$ 軸を坂の角だけ回したもの。',
    caution: '軸を回すときは $R(\\theta)$ ではなく $R(\\theta)^{\\mathsf T}$（点を回す 7-49 と角の向きが反対）。軸ではなく点を回す問題には使えない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '30mm', s2: '40mm', s3: '36mm', trap: '30mm' }, boxh: { s1: '12mm', trap: '12mm' },
    fits(q) { return /軸を.*回した \$x'\$ 軸|坂に(そって|垂直)/.test(q) && !/z/.test(q); },
    steps: {
      // 点を、軸を回した座標で
      s1(r) {
        const a = r.int(-4, 5), b = r.int(-4, 5), d = r.pick([90, -90, 180, 30, 45, 60, -30, -45, -60]);
        if (!a || !b || bad54(a, b, d)) return null;
        const P = rot(-d, a, b);
        return { q: `点 P$(${a},\\ ${b})$ を、${axisT(d)}で表した座標`, a: `$${ptT(P)}$`, key: `54:${a},${b},${d}`, easy: `$R(${dg(d)})^{\\mathsf T}=R(${dg(-d)})$ をかける`, easyCheck: false,
          verify: p => vecIs(p.a, mvf(Rf(d)[0].map((_, j) => Rf(d).map(row => row[j])), [a, b])) };
      },
      // 坂の荷物の重力（√ を残した形）
      s2(r) {
        const m = r.pick(['0.5', '1.0', '2.0', '3.0', '4.0', '5.0']), th = r.pick([30, 45, 60]);
        if (m === '1.0' && th === 30) return null;
        const mg = F.mul(D('9.8'), D(m)), [c, s] = cs(th), Fx = sMul(sNeg(S(mg)), s), Fy = sMul(sNeg(S(mg)), c);
        return { q: `質量 $${m}\\,\\mathrm{kg}$ の荷物が、${th}°の坂にのっています。荷物にはたらく重力 $(0,\\ -${fdec(mg)})$（N）を、坂にそって上向きの $x'$ 軸と、坂に垂直で上向きの $y'$ 軸の成分で表した力`,
          a: `$${ptT([Fx, Fy], { dec: true })}$（N）`, key: `54g:${m}:${th}`, easy: `$R(${dg(th)})^{\\mathsf T}$ をかける。$(-mg\\sin${dg(th)},\\ -mg\\cos${dg(th)})$`, easyCheck: false,
          verify: p => vecIs(p.a, [-9.8 * +m * Math.sin(th * RAD), -9.8 * +m * Math.cos(th * RAD)]) };
      },
      // 図：坂の荷物（小数）・点（小数）
      s3(r) {
        if (turn(r, '54s3', 2)) {
          const m = r.pick(['0.5', '1.0', '2.0', '3.0', '4.0', '1.5', '2.5']), th = r.pick([30, 45, 60]);
          if (m === '1.0' && th === 30) return null;
          const mg = F.mul(D('9.8'), D(m)), [c, s] = cs(th), [gc, gs] = gcs(th), mmg = F.mul(mg, fr(-1));
          const ap = [apx(F.mul(mmg, gs), sMul(S(mmg), s), 2), apx(F.mul(mmg, gc), sMul(S(mmg), c), 2)];
          if (ap.includes(null)) return null;
          return { q: `図のように、質量 $${m}\\,\\mathrm{kg}$ の荷物が${th}°の坂にのっています。重力 $(0,\\ -${fdec(mg)})$（N）を、坂にそって上向きの $x'$ 軸と、坂に垂直で上向きの $y'$ 軸の成分で表した力（${givenT(th)} を使い、小数第2位まで）`,
            a: `約 $(${ap.join(',\\ ')})$（N）`, key: `54g:${m}:${th}`, fig: slopeFig(th), easy: `$x'$：$${fdec(gs)}\\times(-${fdec(mg)})$、$y'$：$${fdec(gc)}\\times(-${fdec(mg)})$`, easyCheck: false,
            verify: p => vecIs(p.a, [-9.8 * +m * Math.sin(th * RAD), -9.8 * +m * Math.cos(th * RAD)], 2e-3) };
        }
        const a = r.int(1, 5), b = r.int(-3, 5), d = r.pick([30, 60, 45, -30]);
        if (!b || bad54(a, b, d)) return null;
        const T = rot(-d, a, b), G = rotG(-d, a, b), ap = T.map((t, i) => apx(G[i], t, 3));
        if (ap.includes(null)) return null;
        return { q: `点 P$(${a},\\ ${b})$ を、${axisT(d)}で表した座標（${givenT(d)} を使い、小数第3位まで）`, a: `約 $(${ap.join(',\\ ')})$`, key: `54:${a},${b},${d}`,
          easy: `$R(${dg(d)})^{\\mathsf T}$ の1行め $(\\cos${dgp(d)},\\ \\sin${dgp(d)})$、2行め $(-\\sin${dgp(d)},\\ \\cos${dgp(d)})$ との内積`, easyCheck: false,
          verify: p => vecIs(p.a, [a * Math.cos(d * RAD) + b * Math.sin(d * RAD), -a * Math.sin(d * RAD) + b * Math.cos(d * RAD)], 1e-3) };
      },
      // わな：軸ではなく点を回す → 7-49・7-48
      trap(r) {
        const a = r.int(1, 4), b = r.int(1, 5), d = r.pick([30, 45, 60, 90]);
        if (bad54(a, b, d) || (a === 2 && b === 4)) return null;
        const P = rot(d, a, b);
        return dest({ q: `点 P$(${a},\\ ${b})$ を、原点のまわりに左回りに${d}°回した点`, a: `$${ptT(P)}$`, key: `54t:${a},${b},${d}`, verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) }, '7-54',
          '軸ではなく点を回すので、$R(\\theta)^{\\mathsf T}$ ではなく $R(\\theta)$ をかける');
      },
    },
  });

  // ================================================================ 7-55
  const LEN = ['0.20', '0.25', '0.30', '0.40', '0.50'];
  const hand = (L1, L2, t1, t2) => { const [c1, s1] = cs(t1), [c2, s2] = cs(t1 + t2), a = S(D(L1)), b = S(D(L2)); return [sAdd(sMul(a, c1), sMul(b, c2)), sAdd(sMul(a, s1), sMul(b, s2))]; };
  const handf = (L1, L2, t1, t2) => [+L1 * Math.cos(t1 * RAD) + +L2 * Math.cos((t1 + t2) * RAD), +L1 * Math.sin(t1 * RAD) + +L2 * Math.sin((t1 + t2) * RAD)];
  const armQ = (L1, L2, t1, t2) => `2本の腕の長さが $L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$ のロボットで、肩の角が $\\theta_1=${dg(t1)}$、ひじの角が $\\theta_2=${dg(t2)}$ のときの手の位置`;
  // ひじのラベルの向き：肩・手・のばした線の3本の向きから、いちばん離れた向き（8方向）
  function elbowDir(E, P, X) {
    const u = A => { const d = Math.hypot(A[0] - E[0], A[1] - E[1]) || 1; return [(A[0] - E[0]) / d, (A[1] - E[1]) / d]; };
    const vs = [u([0, 0]), u(P), u(X)], dirs = { n: 90, ne: 45, e: 0, se: -45, s: -90, sw: -135, w: 180, nw: 135 };
    let best = 's', bv = -9;
    for (const [k, a] of Object.entries(dirs)) { const c = [Math.cos(a * RAD), Math.sin(a * RAD)], m = Math.min(...vs.map(v => 1 - (v[0] * c[0] + v[1] * c[1]))); if (m > bv) { bv = m; best = k; } }
    return best;
  }
  // 2本の腕の図：肩・ひじ・手、関節の角のしるし、長さのラベル（手の点に座標は書かない）
  function armFig(L1, L2, t1, t2) {
    const k = 7 / (+L1 + +L2), E = [k * +L1 * Math.cos(t1 * RAD), k * +L1 * Math.sin(t1 * RAD)], P = [E[0] + k * +L2 * Math.cos((t1 + t2) * RAD), E[1] + k * +L2 * Math.sin((t1 + t2) * RAD)];
    const ext = [E[0] + 2.2 * Math.cos(t1 * RAD), E[1] + 2.2 * Math.sin(t1 * RAD)];
    const xs = [0, E[0], P[0], ext[0]], ys = [0, E[1], P[1], ext[1]];
    const x0 = Math.min(...xs, 0) - 0.8, x1 = Math.max(...xs, 2) + 1, y0 = Math.min(...ys, 0) - 0.8, y1 = Math.max(...ys) + 1;
    const mid = (A, B) => [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    const lab = (A, B, t) => { const m = mid(A, B), d = Math.atan2(B[1] - A[1], B[0] - A[0]), n = [-Math.sin(d), Math.cos(d)]; return ['label', [m[0] + n[0] * 0.5, m[1] + n[1] * 0.5], t, n[1] > 0.3 ? 'n' : n[1] < -0.3 ? 's' : n[0] > 0 ? 'e' : 'w']; };
    const its = [['axes', x0, x1, y0, y1, { o: 'sw' }], ['seg', [0, 0], E, { thick: true }], ['seg', E, P, { thick: true }], ['seg', E, ext, { dash: true }],
      ['circle', [0, 0], 0.25], ['circle', E, 0.25], ['dot', P], ['label', P, '手', P[1] >= E[1] ? 'n' : 's'], ['label', E, 'ひじ', elbowDir(E, P, ext)],
      lab([0, 0], E, '$L_1$'), lab(E, P, '$L_2$')];
    if (t1) its.push(['angle', [2, 0], [0, 0], E, '$\\theta_1$', 1.2]);
    if (t2) its.push(['angle', ext, E, P, '$\\theta_2$', 0.9]);
    return { s: 4, items: its };
  }
  add({
    id: '7-55', part: 4, chap: '7-6⑦ 例題7', stars: 1,
    title: '2本の腕の手の位置は「$(L_1,\\ 0)$ を $\\theta_1$、$(L_2,\\ 0)$ を $\\theta_1+\\theta_2$ 回してたす」（ひじの角だけで回さない）',
    mark: '腕の長さと関節の角から、手の位置を求める。',
    futsu: ['ひじの位置を三角比で求め、', 'ひじから手への矢印の角を', '図から考えて、もう一度', '三角比で求めてたす（4-7）。'],
    raku: ['$L_1=0.40$、$L_2=0.30$、$30^{\\circ}$・$60^{\\circ}$', '上の腕：$0.40\\left(\\frac{\\sqrt3}{2},\\ \\frac12\\right)=(0.2\\sqrt3,\\ 0.2)$', '下の腕：$30+60=90$°回して $(0,\\ 0.30)$', '手：$\\approx(0.346,\\ 0.500)$ m'],
    why: '上の腕は $(L_1,\\ 0)$ を $\\theta_1$ 回した矢印。下の腕は、上の腕から見ると $(L_2,\\ 0)$ を $\\theta_2$ 回した矢印で、上の腕といっしょにさらに $\\theta_1$ 回っているので $R(\\theta_1)R(\\theta_2)=R(\\theta_1+\\theta_2)$（7-6⑦）。$(L,\\ 0)$ にかけると1列めの $L$ 倍だけが残る。',
    caution: '下の腕を $R(\\theta_2)$ だけで回さない（$\\theta_2$ は上の腕からはかった角）。手首の先の道具は $\\theta_1+\\theta_2+\\theta_3$ 回す。反対に、手の位置から関節の角を求める（逆運動学）には使えない。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '34mm', s2: '40mm', s3: '30mm', trap: '50mm' }, boxh: { s1: '9mm' },
    fits(q) { return /腕/.test(q) && /手の位置|道具の先/.test(q) && !/A\(|台|z|pmatrix|同次/.test(q); },
    steps: {
      // たして0°・90°・180°になる角
      s1(r) {
        const L1 = r.pick(LEN), L2 = r.pick(LEN), t1 = r.pick([0, 30, 45, 60, 90, 30, 60]), T = r.pick([0, 90, 180, -90, 90]), t2 = T - t1;
        if (!t2 || t2 <= -180 || t2 > 180 || (L1 === '0.40' && L2 === '0.30' && t1 === 30 && t2 === 60)) return null;
        const H = hand(L1, L2, t1, t2);
        return { q: armQ(L1, L2, t1, t2), a: `$${ptT(H, { dec: true })}$（m）`, key: `55:${L1},${L2},${t1},${t2}`,
          easy: `$${L1}(\\cos${dgp(t1)},\\ \\sin${dgp(t1)})+${L2}(\\cos${dgp(T)},\\ \\sin${dgp(T)})$`, easyCheck: false, verify: p => vecIs(p.a, handf(L1, L2, t1, t2)) };
      },
      // ふつうの角・手首の先の道具
      s2(r) {
        if (turn(r, '55s2', 3)) {
          const L1 = r.pick(LEN), L2 = r.pick(LEN), t1 = r.pick([0, 30, 45, 60, 90, 120]), t2 = r.pick([30, 45, 60, -30, -45, -60, 90, -90, 120]), T = t1 + t2;
          if (!famOK(t1, T) || T % 90 === 0 || (L1 === '0.40' && L2 === '0.30' && t1 === 30 && t2 === 60)) return null;
          const H = hand(L1, L2, t1, t2);
          return { q: armQ(L1, L2, t1, t2), a: `$${ptT(H, { dec: true })}$（m）`, key: `55:${L1},${L2},${t1},${t2}`,
            easy: `下の腕は $${t1}+${sgn(t2)}=${T}$°回す`, easyCheck: false, verify: p => vecIs(p.a, handf(L1, L2, t1, t2)) };
        }
        const L1 = r.pick(LEN), L2 = r.pick(LEN), L3 = r.pick(['0.10', '0.05', '0.20']), t1 = r.pick([0, 90, 30, 60]), t2 = r.pick([90, -90, 60, -60, 30, -30]), U = r.pick([0, 90, 180, -90]), t3 = U - t1 - t2;
        if (!t3 || Math.abs(t3) > 180 || !famOK(t1, t1 + t2) || (t1 + t2) % 90 !== 0 && fam(t1) === 0 && fam(t1 + t2) === 0) return null;
        const H = hand(L1, L2, t1, t2), [cu, su] = cs(U), Tp = [sAdd(H[0], sMul(S(D(L3)), cu)), sAdd(H[1], sMul(S(D(L3)), su))];
        return { q: `2本の腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$、$\\theta_1=${dg(t1)}$、$\\theta_2=${dg(t2)}$）の先に、長さ $${L3}\\,\\mathrm{m}$ の道具をつけ、手首を $\\theta_3=${dg(t3)}$ 曲げました。道具の先の位置`,
          a: `$${ptT(Tp, { dec: true })}$（m）`, key: `55u:${L1},${L2},${L3},${t1},${t2},${t3}`, easy: `道具は $R(${dg(t1)}${t2 < 0 ? "" : "+"}${dg(t2)}${t3 < 0 ? "" : "+"}${dg(t3)})=R(${dg(U)})$ で回す`, easyCheck: false,
          verify: p => { const h = handf(L1, L2, t1, t2); return vecIs(p.a, [h[0] + +L3 * Math.cos(U * RAD), h[1] + +L3 * Math.sin(U * RAD)]); } };
      },
      // 図：小数で（小数第3位まで）
      s3(r) {
        const L1 = r.pick(LEN), L2 = r.pick(LEN), t1 = r.pick([30, 45, 60, 0, 90]), t2 = r.pick([30, 45, 60, 90, -30, -45, -60, 120, -90]), T = t1 + t2;
        if (!famOK(t1, T) || (fam(t1) === 0 && fam(T) === 0) || T <= -90 || T > 180 || (L1 === '0.40' && L2 === '0.30' && t1 === 30 && t2 === 60)) return null;
        const [g1c, g1s] = gcs(t1), [gTc, gTs] = gcs(T), H = hand(L1, L2, t1, t2);
        const G = [F.add(F.mul(D(L1), g1c), F.mul(D(L2), gTc)), F.add(F.mul(D(L1), g1s), F.mul(D(L2), gTs))], ap = G.map((g, i) => apx(g, H[i], 3));
        if (ap.includes(null)) return null;
        return { q: `図の2本の腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$、$\\theta_1=${dg(t1)}$、$\\theta_2=${dg(t2)}$）の手の位置（${givenT(t1, T)} を使い、小数第3位まで）`,
          a: `約 $(${ap.join(',\\ ')})$（m）`, key: `55:${L1},${L2},${t1},${t2}`, fig: armFig(L1, L2, t1, t2), easy: `下の腕は $${t1}+${sgn(t2)}=${T}$°回す`, easyCheck: false,
          verify: p => vecIs(p.a, handf(L1, L2, t1, t2), 2e-3) };
      },
      // わな：手の位置から関節の角（逆運動学）→ 7-89
      trap(r) {
        const L = r.pick(LEN), t1 = r.pick([0, 30, 60, 90, 45]), t2 = r.pick([60, 90, 120]);
        if (!famOK(t1, t1 + t2) || t1 + t2 > 180 || (fam(t1) && fam(t1 + t2))) return null;   // 手の点の成分が長くならないように
        const H = hand(L, L, t1, t2), A2 = [t1 + t2, -t2];
        return dest({ q: `$L_1=L_2=${L}\\,\\mathrm{m}$ の腕で、手を点 $${ptT(H, { dec: true })}$（m）に持っていく関節の角（$\\theta_2>0$ のほう）`,
          a: `$\\theta_1=${dg(t1)}$、$\\theta_2=${dg(t2)}$`, key: `55t:${L},${t1},${t2}`,
          verify: p => { const m = maths(p.a).map(x => +(/=(-?\d+)/.exec(x) || [])[1]); const g = handf(L, L, m[0], m[1]), w = handf(L, L, t1, t2); return (m[1] > 0 && close(g[0], w[0]) && close(g[1], w[1])) || `角 ${p.a} で手が届かない`; } }, '7-55',
          `手の位置から関節の角を求める（逆運動学）。ひじを反対に曲げた組 $\\theta_1=${dg(A2[0])}$、$\\theta_2=${dg(A2[1])}$ もある`, ['7-89']);
      },
    },
  });

  // ================================================================ 7-56
  // 楽な形の例：(2, 1, 3) → (−1, 2, 3)・(3, 1, −2)、(1, 2, 4) → (1, −4, 2)（O-2）
  const RAKU56 = ['2,1,3', '1,2,4', '-1,2,3', '3,1,-2', '1,-4,2'];
  const r3 = (ax, d, v) => mvf(RAX[ax](d), v).map(x => Math.round(x * 1e9) / 1e9 + 0);
  const p3 = v => `(${v.join(',\\ ')})`;
  const AXN = { x: '$x$ 軸', y: '$y$ 軸', z: '$z$ 軸' };
  const R3T = (ax, d) => `R_${ax}(${dg(d)})`;
  // 立体の図：3本の軸、点 P と原点からの点線、回す軸のまわりの矢印（右ねじ）
  function axis3Fig(ax, v) {
    const Q = p => M.proj3(p), L = 4.2, its = [];
    [['x', [L, 0, 0]], ['y', [0, L + 1.5, 0]], ['z', [0, 0, L]]].forEach(([n, e]) => { its.push(['seg', Q([0, 0, 0]), Q(e), { arrow: true }], ['label', Q(e), `$${n}$`, n === 'z' ? 'n' : 'e']); });
    const [a, b, c] = v;
    its.push(['path', [Q([a, 0, 0]), Q([a, b, 0]), Q([0, b, 0])], { dash: true }], ['seg', Q([a, b, 0]), Q([a, b, c]), { dash: true }], ['dot', Q(v)], ['label', Q(v), `P(${v.join(', ')})`, 'e']);
    const R = 0.7, h = 3.2, pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = (-40 + 280 * k / 24) * RAD, u = R * Math.cos(t), w = R * Math.sin(t);
      pts.push(Q(ax === 'z' ? [u, w, h] : ax === 'x' ? [h, u, w] : [w, h, u]));   // x：y→z、y：z→x、z：x→y の向きが＋
    }
    its.push(['path', pts, { arrow: true, thick: true }]);
    return { s: 4.5, items: its };
  }
  add({
    id: '7-56', part: 4, chap: '7-7④⑤⑥ 例題1', stars: 1,
    title: '3次元の90°回転は、軸の座標はそのまま、残り2つを平面の90°のように：$R_z$ は $(x,\\ y)\\to(-y,\\ x)$、$R_x$ は $(y,\\ z)\\to(-z,\\ y)$、$R_y$ は $(z,\\ x)\\to(-x,\\ z)$',
    mark: '点を $x$ 軸・$y$ 軸・$z$ 軸のまわりに90°回す。',
    futsu: ['$R_x(90^{\\circ})$ などの3×3の', '行列を書き、点のベクトルに', 'かけて、3つの行と', '内積を1つずつ計算する。'],
    raku: ['$(2,\\ 1,\\ 3)$ を $z$ 軸で90°：$(-1,\\ 2,\\ 3)$', '$y$ 軸で90°：$(3,\\ 1,\\ -2)$（$z$ を $x$ のほうへ）', '$(1,\\ 2,\\ 4)$ を $x$ 軸で90°：$(1,\\ -4,\\ 2)$'],
    why: '回す軸の座標は変わらず、残りの2つが平面の回転と同じに回る（7-7④⑤⑥）。＋の向きは右ねじで、$x\\to y\\to z\\to x$ の順に「前の軸を次の軸のほうへ」。$z$ 軸は $x\\to y$、$x$ 軸は $y\\to z$、$y$ 軸は $z\\to x$ なので、平面の $(x,\\ y)\\to(-y,\\ x)$ に $(z,\\ x)$ の順で入れる。',
    caution: '$R_y$ だけは「$x$ を $z$ のほうへ」ではない（$z$ を $x$ のほうへ）。$\\vec e_z$ が $\\vec e_x$ へ行くかで確かめる。90°の倍数でない角は、残りの2つを 7-49 のように回す。',
    counts: { s1: 6, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '34mm' }, boxh: { s2: '16mm', trap: '12mm' },
    fits(q) {
      if (/^\$R_[xyz]\((-?90|180)\^\{\\circ\}\)\$ を成分で/.test(q)) return true;
      if (!/軸のまわりに/.test(q) || /R_[xyz]\(-?\d+\^\{\\circ\}\)R_|かけ|機首|ドローン|スマホ/.test(q)) return false;
      const a = angs(q); return a.length > 0 && a.every(d => d % 90 === 0) && /\(-?\d+,\\ -?\d+,\\ -?\d+\)|R_[xyz]\(/.test(q);
    },
    steps: {
      // z 軸・x 軸のまわりに90°
      s1(r) {
        const ax = r.pick(['z', 'z', 'x']), v = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
        if (v.some(x => !x) || RAKU56.includes(v.join(','))) return null;
        const w = r3(ax, 90, v);
        if (RAKU56.includes(w.join(','))) return null;
        return { q: `点 $${p3(v)}$ を、${AXN[ax]}のまわりに90°回した点`, a: `$${p3(w)}$`, key: `56:${v.join(',')}:${ax}90`,
          easy: ax === 'z' ? '$z$ はそのまま、$(x,\\ y)\\to(-y,\\ x)$' : '$x$ はそのまま、$(y,\\ z)\\to(-z,\\ y)$', easyCheck: false, verify: p => vecIs(p.a, mvf(RAX[ax](90), v)) };
      },
      // y 軸・−90°・180°・行列で
      s2(r) {
        const k = turn(r, '56s2', 3);
        if (k < 2) {
          const ax = k === 0 ? 'y' : r.pick(['x', 'y', 'z']), d = k === 0 ? 90 : r.pick([-90, 180]), v = [r.int(-4, 4), r.int(-4, 4), r.int(-4, 4)];
          if (v.some(x => !x) || RAKU56.includes(v.join(','))) return null;
          const w = r3(ax, d, v);
          if (RAKU56.includes(w.join(','))) return null;
          return { q: `点 $${p3(v)}$ を、${AXN[ax]}のまわりに${d === 180 ? '180°' : d < 0 ? '$-90^{\\circ}$' : '90°'}回した点`, a: `$${p3(w)}$`, key: `56:${v.join(',')}:${ax}${d}`,
            easy: ax === 'y' && d === 90 ? '$y$ はそのまま、$z$ を $x$ のほうへ：$(z,\\ x)\\to(-x,\\ z)$' : d === 180 ? `${AXN[ax]}の座標はそのまま、残りの2つの符号を変える` : `90°の反対：${AXN[ax]}の座標はそのまま`, easyCheck: false,
            verify: p => vecIs(p.a, mvf(RAX[ax](d), v)) };
        }
        const ax = r.pick(['x', 'y', 'z']), d = r.pick([90, -90]), A = RAX[ax](d).map(row => row.map(x => Math.round(x) + 0));
        return { q: `$${R3T(ax, d)}$ を成分で書いた行列`, a: `$${matT(A.map(row => row.map(x => S(x))))}$`, key: `56m:${ax}${d}`, calc: { kind: 'mat', want: A },
          easy: `列は $\\vec e_x$、$\\vec e_y$、$\\vec e_z$ の行き先。${AXN[ax]}の列と行は「1と0」`, easyCheck: false };
      },
      // 図（立体）
      s3(r) {
        const ax = r.pick(['x', 'y', 'z']), v = [r.int(1, 3), r.int(1, 3), r.int(1, 3)];
        if (RAKU56.includes(v.join(','))) return null;
        const w = r3(ax, 90, v);
        if (RAKU56.includes(w.join(','))) return null;
        return { q: `図の点 P$${p3(v)}$ を、${AXN[ax]}のまわりに、矢印の向き（右ねじ）に90°回した点`, a: `$${p3(w)}$`, key: `56:${v.join(',')}:${ax}90`, fig: axis3Fig(ax, v),
          easy: { z: '$z$ はそのまま、$(x,\\ y)\\to(-y,\\ x)$', x: '$x$ はそのまま、$(y,\\ z)\\to(-z,\\ y)$', y: '$y$ はそのまま、$(z,\\ x)\\to(-x,\\ z)$' }[ax], easyCheck: false,
          verify: p => vecIs(p.a, mvf(RAX[ax](90), v)) };
      },
      // わな：z 軸のまわりに30°・45°・60° → 7-49
      trap(r) {
        const v = [r.int(1, 4), r.int(-2, 4), r.int(1, 5)], d = r.pick([30, 45, 60]);
        if (!v[1] || RAKU56.includes(v.join(','))) return null;
        const P = rot(d, v[0], v[1]);
        return dest({ q: `点 $${p3(v)}$ を、$z$ 軸のまわりに${d}°回した点`, a: `$${ptT([P[0], P[1], S(v[2])])}$`, key: `56t:${v.join(',')}:${d}`, verify: p => vecIs(p.a, mvf(Rzf(d), v)) }, '7-56',
          `${d}°は90°の倍数ではない。$z$ はそのまま、$(x,\\ y)$ を平面で${d}°回す`, ['7-49']);
      },
    },
  });

  // ================================================================ 7-57
  const EV = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
  const RAKU57 = ['z90y90x', 'y90z90x'];
  const r3s = (steps, v) => steps.reduceRight((w, [ax, d]) => r3(ax, d, w), v);   // 右から1つずつ
  add({
    id: '7-57', part: 4, chap: '7-7③⑦ 例題2', stars: 1, dupOK: ['s1'],
    title: '回転の順番は右から1つずつ（ベクトルに近い行列が先）。空間では入れかえると行き先が変わる',
    mark: '$R_zR_y\\vec e_x$ と $R_yR_z\\vec e_x$ のように、ちがう軸の回転をつなぐ。',
    futsu: ['2つの3×3の回転行列の', '積（9つの成分）を先に計算し、', 'それをベクトルにかける。'],
    raku: ['$R_z(90^{\\circ})R_y(90^{\\circ})\\vec e_x$：$R_y$ で $(0,\\ 0,\\ -1)$', '$R_z$ ではそのまま → $(0,\\ 0,\\ -1)$', '$R_y(90^{\\circ})R_z(90^{\\circ})\\vec e_x$：$(0,\\ 1,\\ 0)$（ちがう）'],
    why: '行列は右にあるものが先にはたらく（7-3）。ベクトルに右から1つずつかければ、どれも「90°回す」だけで、9つの成分の積を作らなくてよい（7-7⑦）。回す軸がちがう回転は、順番を変えると行き先が変わる（7-7③）。',
    caution: '左の行列から先に回さない。同じ軸の回転どうし（$R_z(30^{\\circ})R_z(60^{\\circ})$）なら、平面と同じく角をたせばよい（順番を変えてもよい）。',
    counts: { s1: 8, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' },
    fits(q) {
      if (/機首|ドローン/.test(q)) return false;
      const m = [...q.matchAll(/R_([xyz])\(/g)].map(x => x[1]);
      if (m.length >= 2) return new Set(m).size >= 2;
      return /スマホ/.test(q) && /回してから/.test(q);
    },
    steps: {
      // R_a(90°)R_b(90°) e_c
      s1(r) {
        const a = r.pick(['x', 'y', 'z']), b = r.pick(['x', 'y', 'z'].filter(t => t !== a)), c = r.pick(['x', 'y', 'z']);
        if (RAKU57.includes(`${a}90${b}90${c}`)) return null;
        const w = r3s([[a, 90], [b, 90]], EV[c]), m = r3(b, 90, EV[c]);
        return { q: `$${R3T(a, 90)}${R3T(b, 90)}\\vec e_${c}$`, a: `$${p3(w)}$`, key: `57:${a}${b}${c}`, easy: `先に $${R3T(b, 90)}$ で $${p3(m)}$、次に $${R3T(a, 90)}$ で $${p3(w)}$`, easyCheck: false,
          verify: p => vecIs(p.a, mvf(RAX[a](90), mvf(RAX[b](90), EV[c]))) };
      },
      // 点に、−90° もまぜて
      s2(r) {
        const a = r.pick(['x', 'y', 'z']), b = r.pick(['x', 'y', 'z'].filter(t => t !== a)), d1 = r.pick([90, -90]), d2 = r.pick([90, -90, 180]), v = [r.int(-3, 4), r.int(-3, 4), r.int(-3, 4)];
        if (v.some(x => !x)) return null;
        const m = r3(b, d2, v), w = r3(a, d1, m);
        return { q: `点 $${p3(v)}$ に、$${R3T(a, d1)}${R3T(b, d2)}$ をかけた点`, a: `$${p3(w)}$`, key: `57p:${v.join(',')}:${a}${d1}${b}${d2}`, easy: `先に $${R3T(b, d2)}$ で $${p3(m)}$、次に $${R3T(a, d1)}$`, easyCheck: false,
          verify: p => vecIs(p.a, mvf(RAX[a](d1), mvf(RAX[b](d2), v))) };
      },
      // スマホ（教科書 7-7③ の場面）
      s3(r) {
        const first = r.pick(['x', 'y', 'z']), second = r.pick(['x', 'y', 'z'].filter(t => t !== first)), part = r.pick([['上のはし', 'x'], ['画面', 'z'], ['左のはし', 'y']]);
        const w = r3s([[second, 90], [first, 90]], EV[part[1]]);
        return { q: `机の上にスマホを置き、上のはしを $x$ の向き、左のはしを $y$ の向き、画面を $z$ の向きにしました。スマホを、${AXN[first]}のまわりに90°回してから、${AXN[second]}のまわりに90°回します（どちらも動かない軸のまわり）。${part[0]}の向きの矢印（成分）`,
          a: `$${p3(w)}$`, key: `57s:${first}${second}${part[1]}`, easy: `$${R3T(second, 90)}${R3T(first, 90)}\\vec e_${part[1]}$ を右から1つずつ`, easyCheck: false,
          verify: p => vecIs(p.a, mvf(RAX[second](90), mvf(RAX[first](90), EV[part[1]]))) };
      },
      // わな：同じ軸の回転 → 7-50
      trap(r) {
        const ax = r.pick(['x', 'y', 'z']), a = r.pick([30, 45, 60, 20, 10, 50]), b = r.pick([60, 45, 30, 70, 40, 80]);
        if (a === b) return null;
        return dest({ q: `$${R3T(ax, a)}${R3T(ax, b)}$ を1つの回転行列で`, a: `$${R3T(ax, a + b)}$`, key: `57t:${ax}:${[a, b].sort().join(',')}`,
          verify: p => { const t = angRead(p.a); return (t === a + b && new RegExp(`R_${ax}`).test(p.a)) || 'ちがう'; } }, '7-57',
          '同じ軸のまわりの回転なので、平面の回転と同じく角のたし算（順番を変えてもよい）', ['7-50']);
      },
    },
  });

  // ================================================================ 7-58
  // 機首の向き (cosψcosθ, sinψcosθ, −sinθ)。楽な形の例：ψ=60°・θ=−30°、ピッチ −90° のヨー30°・ロール0° と ヨー0°・ロール30°（O-2）
  const nose = (ps, th) => { const [cp, sp] = cs(ps), [ct, st] = cs(th); return [sMul(cp, ct), sMul(sp, ct), sNeg(st)]; };
  const nosef = (ps, th, ph) => mvf(mulf(mulf(Rzf(ps), Ryf(th)), Rxf(ph)), [1, 0, 0]);
  const attT = (ps, th, ph) => `ヨー $\\psi=${dg(ps)}$、ピッチ $\\theta=${dg(th)}$、ロール $\\phi=${dg(ph)}$`;
  const Rfull = (ps, th, ph) => mulf(mulf(Rzf(ps), Ryf(th)), Rxf(ph));
  add({
    id: '7-58', part: 4, chap: '7-7⑧⑨ 例題3・4', stars: 1,
    title: '機首の向きは $(\\cos\\psi\\cos\\theta,\\ \\sin\\psi\\cos\\theta,\\ -\\sin\\theta)$（ロールは関係しない）。ピッチ $-90^{\\circ}$ なら、向きは $\\psi+\\phi$ だけで決まる（ジンバルロック）',
    mark: 'ヨー・ピッチ・ロールの3つの角。機首の向き、同じ向きか。',
    futsu: ['$R=R_z(\\psi)R_y(\\theta)R_x(\\phi)$ の', '3つの行列の積を', '9つの成分まで計算し、', '1列めを読む。'],
    raku: ['$\\psi=60^{\\circ}$、$\\theta=-30^{\\circ}$：', '$\\left(\\frac{\\sqrt3}{4},\\ \\frac34,\\ \\frac12\\right)\\approx(0.433,\\ 0.750,\\ 0.5)$', 'ピッチ $-90^{\\circ}$：ヨー30°・ロール0° と', 'ヨー0°・ロール30° は、どちらも30°で同じ向き'],
    why: '機首は機体の座標で $(1,\\ 0,\\ 0)$ なので、地面の向きは $R$ の1列め。右から1つずつかけると、ロール $R_x$ では機首は動かず、ピッチ、ヨーの順に回る（7-7⑧）。ピッチ $-90^{\\circ}$ では、ロールの軸とヨーの軸が重なり、行列が $\\psi+\\phi$ だけで書ける（7-7⑨）。',
    caution: 'ピッチの＋は「機首が下がる向き」なので、機首を上げると $\\theta$ は負、$z$ 成分 $-\\sin\\theta$ は正。ピッチが $+90^{\\circ}$ のときは $\\psi-\\phi$ で決まる。機首以外の向き（つばさの向き）には使えない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '24mm', s3: '40mm', trap: '40mm' }, boxh: { s1: '10mm' },
    fits(q) { return (/機首の向き/.test(q) || (/ピッチ/.test(q) && /同じ向き|と同じ向きになる/.test(q))) && !/カメラ|つばさ/.test(q); },
    steps: {
      // 機首の向き（√ を残した形）
      s1(r) {
        const ps = r.pick([0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90]), th = r.pick([0, -30, -45, -60, 30, 45, 60, -90]), ph = r.pick([0, 10, 20, 30, 40, -20, 45]);
        if (!famOK(ps, th) || (ps === 60 && th === -30) || (ps % 90 === 0 && th % 90 === 0)) return null;
        const N = nose(ps, th);
        return { q: `ドローンが、${attT(ps, th, ph)} の姿勢です。地面の座標で、機首の向き`, a: `$${ptT(N)}$`, key: `58:${ps},${th}`,
          easy: `$x=\\cos${dgp(ps)}\\cos${dgp(th)}$、$y=\\sin${dgp(ps)}\\cos${dgp(th)}$、$z=-\\sin${dgp(th)}$。ロールは関係しない`, easyCheck: false, verify: p => vecIs(p.a, nosef(ps, th, ph)) };
      },
      // ジンバルロック
      s2(r) {
        if (turn(r, '58s2', 2)) {
          const th = r.pick([-90, -90, 90]), f = (a, b) => (th < 0 ? a + b : a - b);
          const p1 = r.pick([0, 10, 20, 30, 40, 50, 60, 70]), f1 = r.pick([0, 10, 20, -10, -20, 30]), same = r.chance(0.5);
          let p2 = r.pick([0, 10, 20, 30, 40, 50, 60, 70, 80]), f2 = same ? (th < 0 ? f(p1, f1) - p2 : p2 - f(p1, f1)) : r.pick([0, 10, 20, -10, 30, 40]);
          if (p1 === p2 || Math.abs(f2) > 90 || (!same && f(p1, f1) === f(p2, f2)) || [`${p1},${f1}`, `${p2},${f2}`].sort().join('|') === '0,30|30,0') return null;
          const ok = f(p1, f1) === f(p2, f2);
          return { q: `ピッチ $\\theta=${dg(th)}$ のとき、「ヨー${p1}°・ロール $${dg(f1)}$」と「ヨー${p2}°・ロール $${dg(f2)}$」は同じ向きか`, a: ok ? '同じ向き' : 'ちがう向き', key: `58g:${th}:${[`${p1},${f1}`, `${p2},${f2}`].sort().join('|')}`,
            easy: `$${th < 0 ? '\\psi+\\phi' : '\\psi-\\phi'}$ が $${dg(f(p1, f1))}$ と $${dg(f(p2, f2))}$`, easyCheck: false,
            verify: p => { const A = Rfull(p1, th, f1), B = Rfull(p2, th, f2), eq = A.every((row, i) => row.every((x, j) => Math.abs(x - B[i][j]) < 1e-9)); return (p.a === (eq ? '同じ向き' : 'ちがう向き')) || '判定がちがう'; } };
        }
        const p1 = r.pick([10, 20, 40, 50, 60, 70]), f1 = r.pick([10, 20, -10, -20, 30, 40]), p2 = r.pick([0, 10, 30, 50, 80]);
        if (p1 === p2 || Math.abs(p1 + f1 - p2) > 90 || (p1 === 30 && f1 === 0)) return null;
        return { q: `ピッチ $\\theta=-90^{\\circ}$ のとき、「ヨー${p1}°・ロール $${dg(f1)}$」と同じ向きになる、ヨー${p2}°のときのロール`, a: `$${dg(p1 + f1 - p2)}$`, key: `58r:${p1},${f1},${p2}`,
          easy: `$\\psi+\\phi=${p1 + f1}^{\\circ}$ が同じになればよい`, easyCheck: false,
          verify: p => { const t = angRead(p.a), A = Rfull(p1, -90, f1), B = Rfull(p2, -90, t); return A.every((row, i) => row.every((x, j) => Math.abs(x - B[i][j]) < 1e-9)) || 'ちがう'; } };
      },
      // 小数で（教科書の例題の形）
      s3(r) {
        const ps = r.pick([30, 45, 60, 120, 135, -30, -45, -60, 90]), th = r.pick([-30, -45, -60, 30, 45]), ph = r.pick([10, 20, 30, 50, -20]);
        if (!famOK(ps, th) || (ps === 60 && th === -30)) return null;
        const [gcp, gsp] = gcs(ps), [gct, gst] = gcs(th), N = nose(ps, th), G = [F.mul(gcp, gct), F.mul(gsp, gct), F.mul(gst, fr(-1))], ap = G.map((g, i) => apx(g, N[i], 3));
        if (ap.includes(null)) return null;
        return { q: `ドローンが、${attT(ps, th, ph)} の姿勢です。地面の座標で、機首の向き（${givenT(ps, th)} を使い、小数第3位まで）`, a: `約 $(${ap.join(',\\ ')})$`, key: `58:${ps},${th}`,
          easy: `$x$：$${fdec(gcp)}\\times${fdec(gct)}$、$y$：$${fdec(gsp)}\\times${fdec(gct)}$、$z$：$-(${fdec(gst)})$`, easyCheck: false, verify: p => vecIs(p.a, nosef(ps, th, ph), 2e-3) };
      },
      // わな：右のつばさの向き → 楽な形なし
      trap(r) {
        const ps = r.pick([30, 45, 60, 90, 120, 135, 150, -30, -60]), th = r.pick([-30, -45, 30, 0]);
        const [c, s] = cs(ps), W = [s, sNeg(c), S(0)];
        return dest({ q: `ドローンが、${attT(ps, th, 0)} の姿勢です。地面の座標で、右のつばさの向き（機体の座標で $(0,\\ -1,\\ 0)$）`, a: `$${ptT(W)}$`, key: `58t:${ps},${th}`,
          verify: p => vecIs(p.a, mvf(Rfull(ps, th, 0), [0, -1, 0])) }, '7-58',
          '機首の向きの式は $R$ の1列めだけ。右のつばさは2列めの $-1$ 倍で、右から1つずつかけて求める');
      },
    },
  });

  // ================================================================ 7-59
  const shiftQ = (a, b) => `$x$ に $${a}$、$y$ に $${b}$ ずらす同次座標の行列`;
  const col = v => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
  add({
    id: '7-59', part: 4, chap: '7-7⑩ 例題5', stars: 1,
    title: '同次座標は「点に1、向きに0」：右の列のずらしは、点だけにたされる',
    mark: 'ずらす行列（3×3）を、点や向きの矢印にかける。',
    futsu: ['3×3の行列と、3つの数の', 'ベクトルの積を、', '3つの行との内積で', '1つずつ計算する。'],
    raku: ['$x$ に3・$y$ に2ずらす行列', '点 $(1,\\ 1)$ → $(1,\\ 1,\\ 1)$ にかけて $(4,\\ 3)$', '向き $(1,\\ 1)$ → $(1,\\ 1,\\ 0)$ にかけて、そのまま'],
    why: '3つめの数1が、右の列のずらす量を「たし算」として取り出す（7-7⑩）。向きの矢印は3つめが0なので、ずらす量に0がかかり、向きは変わらない（向きは、場所を移しても変わらない）。',
    caution: '速度などの向きの矢印に1をつけると、向きまでずれてしまう。左上の2×2が回転なら、点も向きも回ってから、点だけがずれる。',
    counts: { s1: 8, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '16mm', s3: '24mm', trap: '24mm' }, boxh: { s2: '16mm', trap: '16mm' },
    fits(q) {
      if (/A\(|4×4|\$z\$ に/.test(q)) return false;
      if (/ずらす同次座標の行列を、/.test(q) || /同次座標/.test(q) && /荷物|台車/.test(q)) return true;
      return /\\\\0&0&1\\end\{pmatrix\}\\begin\{pmatrix\}-?\d+\\\\-?\d+\\\\[01]\\end\{pmatrix\}\$$/.test(q);
    },
    steps: {
      // 点・向きの矢印にかける
      s1(r) {
        const a = r.int(-4, 5), b = r.int(-4, 5), p = r.int(-3, 5), q = r.int(-3, 5), dir = r.chance(0.35);
        if (!a || !b || (a === 3 && b === 2) || (p === 1 && q === 1)) return null;
        const w = dir ? [p, q] : [p + a, q + b];
        return { q: `${shiftQ(a, b)}を、${dir ? '向きの矢印' : '点'} $(${p},\\ ${q})$ にかけた${dir ? '向き' : '点'}`, a: `$(${w.join(',\\ ')})$`, key: `59:${a},${b}:${p},${q}:${dir}`,
          easy: dir ? `$(${p},\\ ${q},\\ 0)$ にかけるので、ずれない` : `$(${p},\\ ${q},\\ 1)$ にかけて $(${w.join(',\\ ')},\\ 1)$`, easyCheck: false,
          verify: pp => vecIs(pp.a, mvf([[1, 0, a], [0, 1, b], [0, 0, 1]], [p, q, dir ? 0 : 1]).slice(0, 2)) };
      },
      // 行列のまま（回転つきも）
      s2(r) {
        const a = r.int(-4, 5), b = r.int(-4, 5), p = r.int(-3, 4), q = r.int(-3, 4), w3 = r.pick([1, 1, 0]), rt90 = r.pick([0, 0, 90, 180, -90]);
        if (!a || !b || (a === 3 && b === 2)) return null;
        const Rr = rt90 ? Rf(rt90).map(row => row.map(x => Math.round(x) + 0)) : [[1, 0], [0, 1]];
        const A = [[Rr[0][0], Rr[0][1], a], [Rr[1][0], Rr[1][1], b], [0, 0, 1]], w = mvf(A, [p, q, w3]).map(x => x + 0);
        return { q: `$${matT(A.map(row => row.map(x => S(x))))}${col([p, q, w3])}$`, a: `$${col(w)}$`, key: `59m:${A.flat().join(',')}:${p},${q},${w3}`, calc: { kind: 'mat', want: w.map(x => [x]) },
          easy: w3 ? '3つめが1なので、右の列がたされる' : '3つめが0なので、右の列はたされない', easyCheck: false };
      },
      // 台車の上の荷物・向き（ことばで）
      s3(r) {
        const a = r.int(-4, 6), b = r.int(-3, 6), p = r.int(0, 4), q = r.int(0, 4), dir = r.chance(0.4), u = r.int(-2, 3), v = r.int(-2, 3);
        if (!a || !b || (a === 3 && b === 2) || (dir && !u && !v)) return null;
        const t = dir ? `荷物が台車にのったまま動く速度の矢印は、はじめ $(${u},\\ ${v})$（m/s）でした。動いた後の、この速度の矢印` : `台車の上の荷物は、はじめ地面の点 $(${p},\\ ${q})$（m）にありました。動いた後の荷物の位置`;
        return { q: `台車が、向きを変えずに $x$ の向きに $${a}\\,\\mathrm{m}$、$y$ の向きに $${b}\\,\\mathrm{m}$ 動きました。この動きを同次座標の行列で表します。${t}`, a: dir ? `$(${u},\\ ${v})$（m/s）` : `$(${p + a},\\ ${q + b})$（m）`,
          key: `59s:${a},${b}:${dir ? `v${u},${v}` : `${p},${q}`}`, easy: dir ? '向きの矢印は3つめが0。ずらしても変わらない' : '点は3つめが1。右の列がたされる', easyCheck: false,
          verify: pp => vecIs(pp.a, dir ? [u, v] : [p + a, q + b]) };
      },
      // わな：ずらす行列を2つかけた行列 → 7-10
      trap(r) {
        const a = r.int(-3, 4), b = r.int(-3, 4), c = r.int(-3, 4), d = r.int(-3, 4);
        if (!a || !b || !c || !d || (a === 3 && b === 2) || (c === 3 && d === 2)) return null;
        const A = [[1, 0, a], [0, 1, b], [0, 0, 1]], B = [[1, 0, c], [0, 1, d], [0, 0, 1]], C = mulf(A, B);
        return dest({ q: `$${matT(A.map(row => row.map(x => S(x))))}${matT(B.map(row => row.map(x => S(x))))}$`, a: `$${matT(C.map(row => row.map(x => S(x))))}$`, key: `59t:${[a, b, c, d].join(',')}`, calc: { kind: 'mat', want: C } }, '7-59',
          '点や向きにかけるのではなく、行列どうしの積。右の列は $(' + (a + c) + ',\\ ' + (b + d) + ')$ で、ずらす量のたし算になる', ['7-10']);
      },
    },
  });

  // ================================================================ 7-60
  const AT = (t, L) => `A(${dg(t)},\\ ${L})`;
  const Amat = (t, L) => { const [c, s] = cs(t), Ls = S(D(L)); return [[c, sNeg(s), sMul(Ls, c)], [s, c, sMul(Ls, s)], [S(0), S(0), S(1)]]; };
  const Af = (t, L) => [[Math.cos(t * RAD), -Math.sin(t * RAD), +L * Math.cos(t * RAD)], [Math.sin(t * RAD), Math.cos(t * RAD), +L * Math.sin(t * RAD)], [0, 0, 1]];
  const r0 = x => Math.round(x * 1e9) / 1e9 + 0;
  add({
    id: '7-60', part: 4, chap: '7-7⑪ 例題6', stars: 1,
    title: '同次変換行列の積 $A(\\theta_1,\\ L_1)A(\\theta_2,\\ L_2)$ は、右の列だけ計算すれば手の位置（根もとの行列が左）',
    mark: '2つの同次変換行列 $A(\\theta,\\ L)$ の積と、手の位置。',
    futsu: ['2つの3×3の行列の積を、', '9つの成分すべて', '行と列の内積で計算してから、', '右の列を読む。'],
    raku: ['$A(90^{\\circ},\\ 0.40)A(-90^{\\circ},\\ 0.30)$', '1行め $(0,\\ -1,\\ 0)$ と右の列 $(0,\\ -0.30,\\ 1)$ で 0.30', '2行め $(1,\\ 0,\\ 0.40)$ で 0.40 → 手 $(0.30,\\ 0.40)$ m'],
    why: '手は、手の軸で見ると原点 $(0,\\ 0,\\ 1)$。$T$ にかけると右の列だけが残るので、$T$ の右の列の上の2つが手の位置（7-7⑪）。積の右の列は「左の行列の行」と「右の行列の右の列」の内積だけで出る。',
    caution: 'かける順番は根もと（肩）の行列が左：$A(\\theta_1,\\ L_1)A(\\theta_2,\\ L_2)$。逆にすると、ちがう腕の位置になる。手の向きは右の列ではなく、左上の2×2。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '44mm', s3: '30mm', trap: '30mm' }, boxh: { s2: '16mm', trap: '14mm' },
    fits(q) { if (/左上/.test(q)) return false; return /A\(-?\d+\^\{\\circ\},/.test(q) || (/手の位置/.test(q) && /\\end\{pmatrix\}\\begin\{pmatrix\}/.test(q)); },
    steps: {
      // 90°の倍数の2本の腕
      s1(r) {
        const t1 = r.pick([0, 90, -90, 180, 90]), t2 = r.pick([90, -90, 180, 0]), L1 = r.pick(LEN), L2 = r.pick(LEN);
        if ((!t1 && !t2) || (t1 === 90 && t2 === -90 && L1 === '0.40' && L2 === '0.30')) return null;
        const H = hand(L1, L2, t1, t2);
        return { q: `2本の腕の手の位置を、$T=${AT(t1, L1)}${AT(t2, L2)}$ の右の列から求めた座標`, a: `$${ptT(H, { dec: true })}$（m）`, key: `60:${t1},${L1},${t2},${L2}`,
          easy: `$${AT(t1, L1)}$ の1行め・2行めと、$${AT(t2, L2)}$ の右の列 $(${stexD(sMul(S(D(L2)), cs(t2)[0]))},\\ ${stexD(sMul(S(D(L2)), cs(t2)[1]))},\\ 1)$ の内積`, easyCheck: false,
          verify: p => { const T = mulf(Af(t1, L1), Af(t2, L2)); return vecIs(p.a, [T[0][2], T[1][2]]); } };
      },
      // A(θ, L) を成分で・30°45°60° の腕
      s2(r) {
        if (turn(r, '60s2', 2)) {
          const t = r.pick([30, 45, 60, 90, 120, -30, -45, -60, 180, -90]), L = r.pick(LEN), A = Amat(t, L);
          return { q: `$${AT(t, L)}$ を成分で書いた行列`, a: `$${matT(A, { dec: true })}$`, key: `60m:${t},${L}`, calc: { kind: 'mat', want: matV(A) },
            easy: `左上の2×2は $R(${dg(t)})$、右の列は $(${L}\\cos${dgp(t)},\\ ${L}\\sin${dgp(t)},\\ 1)$`, easyCheck: false };
        }
        const t1 = r.pick([0, 30, 45, 60, 90]), t2 = r.pick([30, 45, 60, -30, -45, -60, 90, -90]), L1 = r.pick(LEN), L2 = r.pick(LEN);
        if (!famOK(t1, t1 + t2) || (fam(t1) === 0 && fam(t1 + t2) === 0)) return null;
        const H = hand(L1, L2, t1, t2);
        return { q: `2本の腕の手の位置を、$T=${AT(t1, L1)}${AT(t2, L2)}$ の右の列から求めた座標`, a: `$${ptT(H, { dec: true })}$（m）`, key: `60:${t1},${L1},${t2},${L2}`,
          easy: `$x=${L1}\\cos${dgp(t1)}+${L2}\\cos${dgp(t1 + t2)}$ と同じ形になる`, easyCheck: false,
          verify: p => { const T = mulf(Af(t1, L1), Af(t2, L2)); return vecIs(p.a, [T[0][2], T[1][2]]); } };
      },
      // 行列のまま・3本の腕
      s3(r) {
        if (turn(r, '60s3', 2)) {
          const t1 = r.pick([0, 90, -90, 180]), t2 = r.pick([90, -90, 180]), L1 = r.pick(LEN), L2 = r.pick(LEN);
          if (t1 === 90 && t2 === -90 && L1 === '0.40' && L2 === '0.30') return null;
          const A = Amat(t1, L1), B = Amat(t2, L2), T = mulf(Af(t1, L1), Af(t2, L2));
          return { q: `2本の腕の同次変換行列が $${matT(A, { dec: true })}$ と $${matT(B, { dec: true })}$ です。手の位置（積の右の列の上の2つ）`, a: `$(${r0(T[0][2])},\\ ${r0(T[1][2])})$（m）`, key: `60:${t1},${L1},${t2},${L2}`,
            easy: '左の行列の1行め・2行めと、右の行列の右の列の内積', easyCheck: false, verify: p => vecIs(p.a, [T[0][2], T[1][2]]) };
        }
        const t1 = r.pick([0, 90, -90]), t2 = r.pick([90, -90, 0]), t3 = r.pick([90, -90, 180]), L1 = r.pick(LEN), L2 = r.pick(LEN), L3 = r.pick(['0.10', '0.20', '0.15']);
        const T = mulf(mulf(Af(t1, L1), Af(t2, L2)), Af(t3, L3));
        return { q: `関節が3つの腕の、道具の先の位置を、$T=${AT(t1, L1)}${AT(t2, L2)}${AT(t3, L3)}$ の右の列から求めた座標`, a: `$(${r0(T[0][2])},\\ ${r0(T[1][2])})$（m）`, key: `60u:${t1},${L1},${t2},${L2},${t3},${L3}`,
          easy: `3本の腕の矢印の和：向きは ${t1}°、${t1 + t2}°、${t1 + t2 + t3}°`, easyCheck: false,
          verify: p => { const h = handf(L1, L2, t1, t2); return vecIs(p.a, [h[0] + +L3 * Math.cos((t1 + t2 + t3) * RAD), h[1] + +L3 * Math.sin((t1 + t2 + t3) * RAD)]); } };
      },
      // わな：T の左上の2×2（手の向き）→ 7-50
      trap(r) {
        const t1 = r.pick([30, 45, 60, 90, 20, 40, 10]), t2 = r.pick([60, 45, 30, 50, 70, 80, -30]), T = t1 + t2, L1 = r.pick(LEN), L2 = r.pick(LEN);
        if (!cs(T) || T % 90 === 0 && r.chance(0.5)) return null;
        const R = Rm(T);
        return dest({ q: `$T=${AT(t1, L1)}${AT(t2, L2)}$ の左上の2×2（手の向き）`, a: `$${matT(R)}$`, key: `60t:${t1},${t2}`, calc: { kind: 'mat', want: matV(R) } }, '7-60',
          `手の位置ではなく手の向き。左上の2×2は $R(${dg(t1)})R(${dg(t2)})=R(${dg(T)})$`, ['7-50']);
      },
    },
  });

  // ================================================================ 7-61
  // 楽な形の例：d=(0, 0, 30)・ヨー90°・機体 (10, 5, −30) → (−5, 10, 0)、地面 (10, 10, 0) → (10, −10, −30)（O-2）
  const droneQ = (d, ps) => `ドローンが地面の点 $${p3(d)}$（m）にいて、ロール0°・ピッチ0°・ヨー${ps}°の姿勢です`;
  const bad61 = (d, ps, v) => d.join(',') === '0,0,30' && ps === 90 && ['10,5,-30', '10,10,0', '-5,10,0', '10,-10,-30'].includes(v.join(','));
  add({
    id: '7-61', part: 4, chap: '7-7⑬ 例題7', stars: 1,
    title: 'カメラで見た位置を地面の座標に：$R\\vec p+\\vec d$。反対は $R^{\\mathsf T}(\\vec p-\\vec d)$',
    mark: 'ドローンの位置・ヨーと「機体の座標で」見た物の位置。',
    futsu: ['ドローンのまわりに、機首の', '向きと左の向きの図をかき、', '物が前に何 m、左に何 m かを', '地面の向きに分けてたす。'],
    raku: ['$\\vec d=(0,\\ 0,\\ 30)$、ヨー90°、機体で $(10,\\ 5,\\ -30)$', '$R_z(90^{\\circ})$ で $(-5,\\ 10,\\ -30)$、$\\vec d$ をたして $(-5,\\ 10,\\ 0)$', '地面の $(10,\\ 10,\\ 0)$ → $R^{\\mathsf T}(10,\\ 10,\\ -30)=(10,\\ -10,\\ -30)$'],
    why: 'ドローンから物への矢印は、機体の座標で書かれているので、$R$ で地面の向きに直し（7-6⑥ の $\\vec x=R\\vec x\\,\'$）、ドローンの位置 $\\vec d$ をたす（7-7⑬）。反対は、$\\vec d$ をひいてから $R^{-1}=R^{\\mathsf T}$ をかける。',
    caution: '反対に直すときは、ひいてから回す（回してからひかない）。$R^{\\mathsf T}$ は $R$ の逆（転置）。ヨーだけの姿勢なら $R=R_z(\\psi)$ で、$z$ はそのまま。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '40mm' }, boxh: { trap: '10mm' },
    fits(q) { return /機体の座標/.test(q) && /ドローンが地面の点/.test(q); },
    steps: {
      // 機体の座標 → 地面の座標
      s1(r) {
        const ps = r.pick([90, 180, -90, 0, 90]), h = r.pick([10, 15, 20, 25, 30]), d = [r.int(-10, 20), r.int(-10, 20), h], v = [r.int(-15, 15), r.int(-15, 15), -h];
        if (!v[0] || !v[1] || bad61(d, ps, v)) return null;
        const w = r3('z', ps, v), g = [w[0] + d[0], w[1] + d[1], 0];
        return { q: `${droneQ(d, ps)}。カメラで見た物の位置が、機体の座標で $${p3(v)}$ でした。地面の座標で、物の位置`, a: `$${p3(g)}$（m）`, key: `61:${d.join(',')}:${ps}:${v.join(',')}`,
          easy: `$R_z(${dg(ps)})$ で $${p3(w)}$、$\\vec d$ をたす`, easyCheck: false, verify: p => vecIs(p.a, mvf(Rzf(ps), v).map((x, i) => x + d[i])) };
      },
      // 地面の座標 → 機体の座標
      s2(r) {
        const ps = r.pick([90, 180, -90]), h = r.pick([10, 15, 20, 25, 30]), d = [r.int(-10, 20), r.int(-10, 20), h], g = [r.int(-10, 30), r.int(-10, 30), 0];
        const w = r3('z', -ps, [g[0] - d[0], g[1] - d[1], -h]);
        if (bad61(d, ps, g) || (g[0] === d[0] && g[1] === d[1])) return null;
        return { q: `${droneQ(d, ps)}。地面の点 $${p3(g)}$ は、機体の座標ではどこか`, a: `$${p3(w)}$（m）`, key: `61r:${d.join(',')}:${ps}:${g.join(',')}`,
          easy: `$\\vec p-\\vec d=${p3([g[0] - d[0], g[1] - d[1], -h])}$ に $R_z(${dg(ps)})^{\\mathsf T}$ をかける`, easyCheck: false,
          verify: p => { const v = vecRead(p.a); if (!v) return '読めない'; return vecIs(`$(${mvf(Rzf(ps), v).map((x, i) => r0(x + d[i])).join(',\\ ')})$`, g); } };
      },
      // 小数（ヨー30°など）・前後左右
      s3(r) {
        if (turn(r, '61s3', 2)) {
          const ps = r.pick([30, 60, -30, -60, 45, 120]), h = r.pick([10, 15, 20, 25]), d = [r.int(0, 20), r.int(0, 20), h], u = r.int(2, 12), v = r.int(-6, 6);
          if (d[0] === 10 && d[1] === 5 && h === 20) return null;   // 教科書の例題7と同じ場所は使わない
          const T = rot(ps, u, v), G = rotG(ps, u, v), ap = [0, 1].map(i => apx(F.add(G[i], fr(d[i])), sAdd(T[i], S(d[i])), 2));
          if (ap.includes(null)) return null;
          return { q: `${droneQ(d, ps)}（${givenT(ps)}）。カメラで見た物の位置が、機体の座標で $${p3([u, v, -h])}$ でした。地面の座標で、物の位置（小数第2位まで）`, a: `約 $(${ap.join(',\\ ')},\\ 0)$（m）`,
            key: `61:${d.join(',')}:${ps}:${u},${v}`, easy: `$R_z(${dg(ps)})$ をかけて、$\\vec d$ をたす`, easyCheck: false,
            verify: p => vecIs(p.a, mvf(Rzf(ps), [u, v, -h]).map((x, i) => x + d[i]), 6e-3) };
        }
        const ps = r.pick([90, 180, -90, 0]), h = r.pick([10, 20, 30]), d = [r.int(-10, 10), r.int(-10, 10), h], g = [r.int(-15, 15), r.int(-15, 15), 0];
        const w = r3('z', -ps, [g[0] - d[0], g[1] - d[1], -h]);
        if (!w[0] || !w[1] || bad61(d, ps, g)) return null;
        const side = `${w[0] > 0 ? '前' : '後ろ'}の${w[1] > 0 ? '左' : '右'}側`;
        return { q: `${droneQ(d, ps)}。地面の点 $${p3(g)}$ は、ドローンから見て、前・後ろ・左・右のどちらの側か（「前の左側」のように）`, a: side, key: `61r:${d.join(',')}:${ps}:${g.join(',')}`,
          easy: `機体の座標で $${p3(w)}$。$x$ が${w[0] > 0 ? '正' : '負'}、$y$ が${w[1] > 0 ? '正' : '負'}`, easyCheck: false,
          verify: p => { const v = mvf(Rzf(-ps), [g[0] - d[0], g[1] - d[1], -h]); return p.a === `${v[0] > 0 ? '前' : '後ろ'}の${v[1] > 0 ? '左' : '右'}側` || 'ちがう'; } };
      },
      // わな：機首の向き → 7-58
      trap(r) {
        const ps = r.pick([30, 60, 90, 120, 45, -30]), th = r.pick([-90, -30, -60, -45]), ph = r.pick([0, 10, 20]);
        if (!famOK(ps, th)) return null;
        const N = nose(ps, th);
        return dest({ q: `ドローンが、${attT(ps, th, ph)} の姿勢です。地面の座標で、機首の向き`, a: `$${ptT(N)}$`, key: `61t:${ps},${th}`, verify: p => vecIs(p.a, nosef(ps, th, ph)) }, '7-61',
          '物の位置ではなく、機首の向き（$R$ の1列め）。ドローンの位置は関係しない');
      },
    },
  });

  // ================================================================ 7-96
  // 複素数 x+yj の TeX（x、y は S）
  function ztex(re, im) {
    re = sv(re); im = sv(im);
    if (sZero(im)) return stex(re);
    let it;
    if (im.p[0] && im.q[0]) { const t = stex(im); it = /^-?\\frac/.test(t) ? `${t}j` : `(${t})j`; }
    else { const neg = sVal(im) < 0, m = neg ? sNeg(im) : im; let t; if (!m.q[0]) { const [n, d] = m.p; t = d === 1 ? (n === 1 ? 'j' : `${n}j`) : `\\frac{${n}}{${d}}j`; } else { const u = surd(m.q, m.s); t = /^\\frac/.test(u) ? `${u}j` : `${u}\\,j`; } it = (neg ? '-' : '') + t; }
    if (sZero(re)) return it;
    const rtx = stex(re);
    return `${rtx}${it[0] === '-' ? '' : '+'}${it}`;
  }
  const zt = (a, b) => ztex(S(a), S(b));
  const cisT = d => (d < 0 ? `\\cos(${dg(d)})+j\\sin(${dg(d)})` : `\\cos${dg(d)}+j\\sin${dg(d)}`);
  add({
    id: '7-96', part: 4, chap: '7-6②', stars: 1,
    title: '複素数で回す：$x+yj$ に $\\cos\\theta+j\\sin\\theta$ をかける（実部が回した点の $x$ 座標、虚部が $y$ 座標）',
    mark: '点を複素数 $x+yj$ と見て、$\\theta$ 回す。',
    futsu: ['回転行列 $R(\\theta)$ を書いて、', '点のベクトルにかけ、', '1行め・2行めとの内積を', '計算する（7-6①）。'],
    raku: ['$3+j$ を60°：$(3+j)\\left(\\frac12+\\frac{\\sqrt3}{2}j\\right)$', '$=\\frac{3-\\sqrt3}{2}+\\frac{3\\sqrt3+1}{2}j$', '$\\approx0.634+3.098j$'],
    why: '$(x+yj)(\\cos\\theta+j\\sin\\theta)$ を分配法則で展開し、$j^2=-1$ を使うと、実部が $x\\cos\\theta-y\\sin\\theta$、虚部が $x\\sin\\theta+y\\cos\\theta$ になる。これは $R(\\theta)$ をかけた点の成分そのもの（7-6②）。90°なら $j$ をかけるだけ。',
    caution: '回せるのは平面の点だけ（3次元の回転は行列で）。折り返し（$x$ 軸についての対称）はかけ算では書けない（共役 $\\bar z$）。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '40mm', s3: '30mm', trap: '20mm' }, boxh: { s1: '10mm', s2: '12mm' },
    fits(q) { return /\\cos.*\+j\\sin/.test(q) && !/折り返/.test(q); },
    steps: {
      // 90°の倍数・実数（純虚数）を回す
      s1(r) {
        const d = r.pick([90, 180, -90, 90, 30, 45, 60, 120, -30, 135]), real = fam(d) ? r.chance(0.6) : false;
        let a = r.int(-5, 5), b = r.int(-5, 5);
        if (fam(d)) { if (real) b = 0; else a = 0; }
        if ((!a && !b) || (fam(d) === 0 && (!a || !b)) || (a === 3 && b === 1)) return null;
        const P = rot(d, a, b);
        if (seenAns(r, "96", ztex(P[0], P[1]))) return null;
        return { q: `$${a && b ? `(${zt(a, b)})` : zt(a, b)}(${cisT(d)})$`, a: `$${ztex(P[0], P[1])}$`, key: `96:${a},${b},${d}`,
          easy: d === 90 ? '$j$ をかける' : d === -90 ? '$-j$ をかける' : d === 180 ? '$-1$ をかける' : `$\\cos${dgp(d)}+j\\sin${dgp(d)}=${ztex(...cs(d))}$ をかける`, easyCheck: false };
      },
      // ふつうの複素数を30°・45°・60°
      s2(r) {
        const d = r.pick([30, 45, 60, -30, -45, -60, 120, 150, 135]), a = r.int(-4, 4), b = r.int(-4, 4);
        if (!a || !b || bad49(a, b, d)) return null;
        const P = rot(d, a, b), [c, s] = cs(d);
        if (seenAns(r, '96', ztex(P[0], P[1]))) return null;   // 同じ答えを2つ出さない（$(1-3j)$ を60°と $(-3-j)$ を150°など）
        return { q: `$(${zt(a, b)})(${cisT(d)})$`, a: `$${ztex(P[0], P[1])}$`, key: `96:${a},${b},${d}`, easy: `$(${zt(a, b)})(${ztex(c, s)})$ を展開して $j^2=-1$`, easyCheck: false };
      },
      // 小数・座標で・回す前の数
      s3(r) {
        const k = turn(r, '96s3', 3);
        if (k === 0) {
          const d = r.pick([30, 60, 45, -30, 120]), a = r.int(1, 5), b = r.int(-3, 4);
          if (!b || bad49(a, b, d)) return null;
          const T = rot(d, a, b), G = rotG(d, a, b), ap = T.map((t, i) => apx(G[i], t, 3));
          if (ap.includes(null)) return null;
          return { q: `複素数 $${zt(a, b)}$ に $${cisT(d)}$ をかけた数（${givenT(d)} を使い、小数第3位まで）`, a: `約 $${ap[0]}${ap[1][0] === '-' ? '' : '+'}${ap[1]}j$`, key: `96:${a},${b},${d}`,
            easy: `実部 $${a}\\cos${dgp(d)}-${sgn(b)}\\sin${dgp(d)}$、虚部 $${a}\\sin${dgp(d)}+${sgn(b)}\\cos${dgp(d)}$`, easyCheck: false,
            verify: p => { const v = M.evalC(strip(maths(p.a)[0]), {}), w = M.evalC(`(${zt(a, b)})(${cisT(d)})`, {}); return (v && Math.hypot(v[0] - w[0], v[1] - w[1]) < 1e-3) || 'ちがう'; } };
        }
        if (k === 1) {
          const d = r.pick([90, 180, -90, 30, 60, 45]), a = r.int(-4, 5), b = r.int(-4, 5);
          if (!a || !b || bad49(a, b, d)) return null;
          const P = rot(d, a, b);
          return { q: `点 $(${a},\\ ${b})$ を複素数 $${zt(a, b)}$ と見て、$${cisT(d)}$ をかけました。回した点の座標`, a: `$${ptT(P)}$`, key: `96:${a},${b},${d}`,
            easy: '実部が $x$ 座標、虚部が $y$ 座標', easyCheck: false, verify: p => vecIs(p.a, mvf(Rf(d), [a, b])) };
        }
        const d = r.pick([90, -90, 180, 30, 60, 45, -45]), a = r.int(-4, 5), b = r.int(-4, 5);
        if (!a || !b || bad49(a, b, d)) return null;
        const P = rot(d, a, b);
        return { q: `ある複素数 $z$ に $${cisT(d)}$ をかけたら、$${ztex(P[0], P[1])}$ になりました。$z$`, a: `$${zt(a, b)}$`, key: `96:${a},${b},${d}`,
          easy: `反対に回す：$${cisT(-d)}$ をかける`, easyCheck: false,
          verify: p => { const v = M.evalC(strip(maths(p.a)[0]), {}), w = M.evalC(`(${ztex(P[0], P[1])})(${cisT(-d)})`, {}); return (v && Math.hypot(v[0] - w[0], v[1] - w[1]) < 1e-9) || 'ちがう'; } };
      },
      // わな：実軸・虚軸について折り返す → わざなし（共役）
      trap(r) {
        const a = r.int(-4, 5), b = r.int(-4, 5), re = r.chance(0.6);
        if (!a || !b || (a === 3 && b === 1)) return null;
        return dest({ q: `複素数 $${zt(a, b)}$ の点を、${re ? '実軸' : '虚軸'}について折り返した点の複素数`, a: `$${re ? zt(a, -b) : zt(-a, b)}$`, key: `96t:${a},${b},${re}`,
          verify: p => { const v = M.evalC(strip(maths(p.a)[0]), {}); return (v && close(v[0], re ? a : -a) && close(v[1], re ? -b : b)) || 'ちがう'; } }, '7-96',
          `回転ではなく折り返し（裏返し）なので、$\\cos\\theta+j\\sin\\theta$ をかけても作れない。${re ? '虚部' : '実部'}の符号を変える`);
      },
    },
  });

  // ================================================================ 7-97
  // 楽な形の例：r=(2, 0)、ω=3 → (0, 6)（O-2）
  const piT = (x, k) => {   // (x/k)π の TeX（x は1項の S、k は整数）
    const v = sMul(sv(x), S(fr(1, k))), neg = sVal(v) < 0, m = neg ? sNeg(v) : v;
    if (sZero(m)) return '0';
    let num, den;
    if (!m.q[0]) { num = (m.p[0] === 1 ? '' : m.p[0]) + '\\pi'; den = m.p[1]; } else { num = (m.q[0] === 1 ? '' : m.q[0]) + rt(m.s) + '\\,\\pi'; den = m.q[1]; }
    return (neg ? '-' : '') + (den === 1 ? num : `\\frac{${num}}{${den}}`);
  };
  add({
    id: '7-97', part: 4, chap: '7-6 もっと知りたい⑤', stars: 1,
    title: '回転行列の微分：$\\dfrac{\\dd R}{\\dd\\theta}=R(\\theta)R_{90}$。回る点の速度は、位置を90°回して $\\omega$ 倍',
    mark: '角速度 $\\omega$ で原点のまわりを回る点の速度。',
    futsu: ['位置を $(r\\cos\\omega t,\\ r\\sin\\omega t)$', 'の形に書き、成分ごとに', '$t$ で微分して、', 'その時刻の値を入れる。'],
    raku: ['$\\vec r=(2,\\ 0)$、$\\omega=3$：', '位置を90°回して $(0,\\ 2)$', '3倍して、速度 $(0,\\ 6)$'],
    why: '$R(\\theta)$ を成分ごとに微分すると $R(\\theta)R_{90}=R(\\theta+90^{\\circ})$ になる（7-6 もっと知りたい⑤）。$\\vec r=R(\\omega t)\\vec r_0$ を合成関数の微分で微分すると $\\omega R_{90}\\vec r$：速度は位置の矢印を90°回して $\\omega$ 倍したもの。大きさは $r\\omega$、向きは円の接線。',
    caution: '右回りなら $\\omega$ が負（$-90^{\\circ}$ 回す向きになる）。原点のまわりの円の上を回るときだけ使える（だ円の上を回る点や、まっすぐ進む点には使えない）。',
    counts: { s1: 6, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '30mm', s3: '36mm', trap: '24mm' }, boxh: { s2: '14mm', s3: '12mm' },
    fits(q) { return (/角速度|周期/.test(q) && /回って|回る/.test(q) && /速度|速さ/.test(q)) || /で微分した行列/.test(q); },
    steps: {
      // 左回り：ω(-y, x)
      s1(r) {
        const w = r.pick(['1', '2', '3', '4', '5', '0.5']), a = r.int(-4, 5), b = r.int(-4, 5);
        if ((!a && !b) || (a === 2 && b === 0 && w === '3') || (a === 0 && b === 6)) return null;
        const v = [-b * +w, a * +w].map(r0);
        return { q: `原点のまわりを、角速度 $${w}\\,\\mathrm{rad/s}$ で左回りに回っている点の位置が $(${a},\\ ${b})$（m）のときの速度`, a: `$(${v.join(',\\ ')})$（m/s）`, key: `97:${w}:${a},${b}`,
          easy: `90°回して $(${-b + 0},\\ ${a})$、${w}倍`, easyCheck: false, verify: p => { const h = 1e-6, P = t => mvf(Rf(+w * t / RAD), [a, b]); return vecIs(p.a, [0, 1].map(i => (P(h)[i] - P(-h)[i]) / (2 * h)), 1e-6); } };
      },
      // 右回り・速さ・dR/dθ
      s2(r) {
        const k = turn(r, '97s2', 3);
        if (k === 0) {
          const w = r.pick(['1', '2', '3', '4', '0.5']), a = r.int(-4, 5), b = r.int(-4, 5);
          if (!a && !b) return null;
          const v = [b * +w, -a * +w].map(r0);
          return { q: `原点のまわりを、角速度の大きさ $${w}\\,\\mathrm{rad/s}$ で右回りに回っている点の位置が $(${a},\\ ${b})$（m）のときの速度`, a: `$(${v.join(',\\ ')})$（m/s）`, key: `97r:${w}:${a},${b}`,
            easy: `右回りなので $-90^{\\circ}$ 回して $(${b},\\ ${-a + 0})$、${w}倍`, easyCheck: false, verify: p => vecIs(p.a, [b * +w, -a * +w]) };
        }
        if (k === 1) {
          const [a, b, h] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13], [0, 3, 3], [2, 0, 2]]), sa = r.pick([1, -1]), w = r.pick([2, 3, 4, 5]);
          return { q: `原点のまわりを、角速度 $${w}\\,\\mathrm{rad/s}$ で回っている点の位置が $(${sa * a + 0},\\ ${b})$（m）のときの速さ`, a: `$${h * w}\\,\\mathrm{m/s}$`, key: `97s:${w}:${a},${b}`,
            easy: `速さは $r\\omega=${h}\\times${w}$`, easyCheck: false, verify: p => close(ev(maths(p.a)[0].replace(/\\,\\mathrm\{[^}]*\}/, '')), Math.hypot(a, b) * w) || 'ちがう' };
        }
        const d = r.pick([0, 30, 45, 60, 90, 120, 180, -30, -45, -60]), D2 = Rm(d + 90);
        return { q: `回転行列 $R(\\theta)$ を $\\theta$ で微分した行列の、$\\theta=${dg(d)}$ での値`, a: `$${matT(D2)}$`, key: `97m:${d}`, calc: { kind: 'mat', want: matV(D2) },
          easy: `$R(\\theta)R_{90}=R(\\theta+90^{\\circ})$ なので $R(${dg(d + 90)})$`, easyCheck: false };
      },
      // π をふくむ角速度（時刻 t・周期）
      s3(r) {
        if (turn(r, '97s3', 2)) {
          const k = r.pick([2, 3, 4, 6]), t = r.pick([1, 2]), a = r.pick([2, 4, 6, 3]), onX = r.chance(0.6), d = 180 * t / k;
          if (!cs(d) || d % 360 === 0) return null;
          const P = rot(d, onX ? a : 0, onX ? 0 : a), V = [sNeg(P[1]), P[0]];
          return { q: `点が、はじめ $(${onX ? a : 0},\\ ${onX ? 0 : a})$（m）にあり、原点のまわりを角速度 $\\frac{\\pi}{${k}}\\,\\mathrm{rad/s}$ で左回りに回っています。$t=${t}$ 秒の速度`,
            a: `$\\left(${piT(V[0], k)},\\ ${piT(V[1], k)}\\right)$（m/s）`, key: `97t:${k},${t},${a},${onX}`, easy: `位置は $R(${dg(d)})$ をかけて $${ptT(P)}$。90°回して $\\frac{\\pi}{${k}}$ 倍`, easyCheck: false,
            verify: p => { const w = Math.PI / k, h = 1e-6, X = s => mvf(Rf(w * s / RAD), [onX ? a : 0, onX ? 0 : a]); return vecIs(p.a, [0, 1].map(i => (X(t + h)[i] - X(t - h)[i]) / (2 * h)), 1e-6); } };
        }
        const T = r.pick([2, 4, 6, 8, 10, 12]), a = r.int(-3, 4), b = r.int(-3, 4);
        if (!a || !b) return null;
        const V = [S(-b), S(a)].map(x => sMul(x, S(2)));
        return { q: `原点のまわりを、周期 $${T}\\,\\mathrm{s}$ で左回りに回っている点の位置が $(${a},\\ ${b})$（m）のときの速度`, a: `$\\left(${piT(V[0], T)},\\ ${piT(V[1], T)}\\right)$（m/s）`, key: `97T:${T}:${a},${b}`,
          easy: `$\\omega=\\frac{2\\pi}{${T}}$。90°回して $(${-b},\\ ${a})$、$\\omega$ 倍`, easyCheck: false, verify: p => vecIs(p.a, [-b * 2 * Math.PI / T, a * 2 * Math.PI / T]) };
      },
      // わな：だ円の上を回る点 → わざなし（成分ごとに微分）
      trap(r) {
        const a = r.int(2, 5), b = r.int(1, 5), t0 = r.pick(['0', '\\frac{\\pi}{2}']);
        if (a === b) return null;
        const v = t0 === '0' ? [0, b] : [-a, 0];
        return dest({ q: `時刻 $t$（s）の位置が $(${a}\\cos t,\\ ${coefT(b)}\\sin t)$（m）で、だ円の上を回っている点の、$t=${t0}$ での速度`, a: `$(${v.join(',\\ ')})$（m/s）`, key: `97u:${a},${b},${t0}`,
          verify: p => { const tt = M.evalMath(t0, {}), h = 1e-6, X = s => [a * Math.cos(s), b * Math.sin(s)]; return vecIs(p.a, [0, 1].map(i => (X(tt + h)[i] - X(tt - h)[i]) / (2 * h)), 1e-6); } }, '7-97',
          '原点からの距離が変わるので、位置を90°回して何倍かにはならない。成分ごとに $t$ で微分する');
      },
    },
  });

  // ================================================================ 7-98
  // 楽な形の例：手 (0.325, 0.391, 0)、台 0.10 m → (0.325, 0.391, 0.10)（O-2）
  const shift4 = (a, b, c) => [[1, 0, 0, a], [0, 1, 0, b], [0, 0, 1, c], [0, 0, 0, 1]];
  add({
    id: '7-98', part: 4, chap: '7-7⑫', stars: 1,
    title: '4×4の同次変換：台の高さだけ上げる行列をかけると、手の位置の $z$ に高さがたされる（右の列が移動、左上の3×3が回転）',
    mark: '4×4の同次変換行列。腕を台にのせる。',
    futsu: ['4×4の行列と、4つの数の', 'ベクトルの積を、4つの行との', '内積で1つずつ計算する。'],
    raku: ['床の上の腕の手 $(0.325,\\ 0.391,\\ 0)$', '高さ0.10 m の台にのせる', '$z$ に0.10をたして $(0.325,\\ 0.391,\\ 0.10)$'],
    why: '空間の点 $(x,\\ y,\\ z)$ に1をつけた $(x,\\ y,\\ z,\\ 1)$ にかけると、平面の同次座標と同じく、右の列の上の3つがたされる（7-7⑫）。左上の3×3が回転なら、先に回してからたす。向きの矢印は4つめが0なので、たされない。',
    caution: '台の行列は腕の行列の左（根もとの側）にかける。4つめの数は、点なら1、向きなら0。左上が $I$ でないときは、回してからたす。',
    counts: { s1: 6, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '30mm', s2: '16mm', s3: '36mm', trap: '24mm' }, boxh: { s2: '20mm' },
    fits(q) { if (/のびちぢみ/.test(q)) return false; return /4×4|台の上|高さ.*の台|\\\\0&0&0&1\\end\{pmatrix\}\\begin\{pmatrix\}/.test(q); },
    steps: {
      // 4×4 のずらす行列を点・向きにかける
      s1(r) {
        const a = r.int(-3, 5), b = r.int(-3, 5), c = r.int(1, 5), v = [r.int(-3, 4), r.int(-3, 4), r.int(0, 4)], dir = r.chance(0.3);
        if (!a || !b) return null;
        const w = dir ? v : [v[0] + a, v[1] + b, v[2] + c];
        return { q: `$x$ に $${a}$、$y$ に $${b}$、$z$ に $${c}$ ずらす4×4の同次変換行列を、${dir ? '向きの矢印' : '点'} $${p3(v)}$ にかけた${dir ? '向き' : '点'}`, a: `$${p3(w)}$`, key: `98:${a},${b},${c}:${v.join(',')}:${dir}`,
          easy: dir ? `4つめが0なので、ずれない` : `$${p3([...v, 1])}$ にかけて、$(${a},\\ ${b},\\ ${c})$ がたされる`, easyCheck: false,
          verify: p => vecIs(p.a, mvf(shift4(a, b, c), [...v, dir ? 0 : 1]).slice(0, 3)) };
      },
      // 行列のまま（回転つき）・台の行列を書く
      s2(r) {
        if (turn(r, '98s2', 2)) {
          const d = r.pick([90, -90, 180, 0]), a = r.int(-3, 4), b = r.int(-3, 4), c = r.int(0, 3), v = [r.int(-3, 3), r.int(-3, 3), r.int(0, 3)], w4 = r.pick([1, 1, 0]);
          const Rz = Rzf(d).map(row => row.map(x => Math.round(x) + 0)), A = [[...Rz[0], a], [...Rz[1], b], [...Rz[2], c], [0, 0, 0, 1]], w = mvf(A, [...v, w4]).map(x => x + 0);
          return { q: `$${matT(A.map(row => row.map(x => S(x))))}${col([...v, w4])}$`, a: `$${col(w)}$`, key: `98m:${A.flat().join(',')}:${v.join(',')},${w4}`, calc: { kind: 'mat', want: w.map(x => [x]) },
            easy: `${d ? `左上の3×3（$R_z(${dg(d)})$）で回して、` : '左上は $I$ なので回さず、'}${w4 ? '右の列をたす' : '4つめが0なので右の列はたさない'}`, easyCheck: false };
        }
        const h = r.pick(['0.20', '0.30', '0.50', '0.15', '0.25', '1.2', '0.80']), A = shift4(0, 0, +h);
        return { q: `腕を高さ $${h}\\,\\mathrm{m}$ の台にのせるときにかける、4×4の同次変換行列`, a: `$${matT(A.map(row => row.map(x => S(D(String(x))))), { dec: true })}$`, key: `98h:${h}`, calc: { kind: 'mat', want: A },
          easy: `回さない（左上は $I$）。右の列の $z$ に ${h}`, easyCheck: false, boxw: '28mm' };
      },
      // 台の上の2本の腕
      s3(r) {
        const t1 = r.pick([0, 90, 30, 60, 45]), t2 = r.pick([90, -90, 60, -60, 30, 45, -45]), L1 = r.pick(LEN), L2 = r.pick(LEN), h = r.pick(['0.20', '0.30', '0.50', '0.15', '0.25']);
        if (!famOK(t1, t1 + t2) || (fam(t1) && fam(t1 + t2))) return null;   // 答えの成分が長くならないように、どちらかの腕は90°の倍数の向き
        const H = hand(L1, L2, t1, t2);
        return { q: `高さ $${h}\\,\\mathrm{m}$ の台の上に、2本の腕（$L_1=${L1}\\,\\mathrm{m}$、$L_2=${L2}\\,\\mathrm{m}$、$\\theta_1=${dg(t1)}$、$\\theta_2=${dg(t2)}$。腕は床に平行な平面の中で動く）を置きました。台の下の床の点を原点とする、手の位置`,
          a: `$${ptT([...H, S(D(h))], { dec: true })}$（m）`, key: `98a:${t1},${t2},${L1},${L2},${h}`, easy: `床の上の手の位置の $z$ に ${h} をたす`, easyCheck: false,
          verify: p => vecIs(p.a, [...handf(L1, L2, t1, t2), +h]) };
      },
      // わな：のびちぢみの4×4（対角）→ 7-12
      trap(r) {
        const a = r.pick([2, 3, -1, 0.5]), b = r.pick([2, 1, 3, -1]), c = r.pick([2, 1, 0.5, 3]), v = [r.int(1, 4), r.int(-2, 4), r.int(1, 4)];
        if (a === 1 && b === 1 && c === 1) return null;
        const A = [[a, 0, 0, 0], [0, b, 0, 0], [0, 0, c, 0], [0, 0, 0, 1]], w = [a * v[0], b * v[1], c * v[2]].map(r0);
        return dest({ q: `$${matT(A.map(row => row.map(x => S(D(String(x))))), { dec: true })}$ を、点 $${p3(v)}$ にかけた点（のびちぢみの行列）`, a: `$${p3(w)}$`, key: `98t:${a},${b},${c}:${v.join(',')}`,
          verify: p => vecIs(p.a, mvf(A, [...v, 1]).slice(0, 3)) }, '7-98', '右の列は0で、ずらしも回転もない。対角の数をそれぞれの成分にかける（のびちぢみ）', ['7-12']);
      },
    },
  });

})(globalThis.MONDAI);

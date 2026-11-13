/* 問題集 第6巻　第4部 虚数と複素平面（わざ 6-46〜6-60）　組 d
 * 書き方は v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第6巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 虚数単位は j（教科書と同じ。P-5）。答えは a+bj の形（P-7）。極形式を聞くときは r(\cos\theta+j\sin\theta) の形で、偏角は度で -180°<θ≦180°（6-9。P-7）。
 * 数は、答えを先に決めて逆に作る。√ のある数は「p+q√s」（S。p、q は M.F の分数）で計算し、問題と答えを同じ数から書く。
 * 検算：式だけの問題は check.js が j を虚数単位として複素数でくらべる（M.evalC）。点の座標・2つの答え・極形式・方程式の解は verify で、
 *   問題の文の数を読みなおして、別の道すじ（evalC で計算しなおす・解を方程式に入れる・cos と sin の式で回す）で確かめる。
 * 図は 6-47・6-55・6-56・6-60 のステップ3だけ（M.cplane。K-2・P-2）。目もりは書かない（数は文とラベルにある。図を読んで答えを出さない）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」）を書く（dest。第36回 N-3）。
 * 左ページの「ふつうに解くと」「楽な形にすると」の例の数は、同じ見開きの問題に出さない（O-2）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の部品
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(strip);
  const lastMath = q => { const m = maths(q); return m.length ? m[m.length - 1] : ''; };
  const hasM = (q, re) => maths(q).some(m => re.test(m.replace(/\s/g, '')));   // 文の中に、re に合う式があるか
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const close = (x, y) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  const cclose = (u, v) => !!u && !!v && Math.hypot(u[0] - v[0], u[1] - v[1]) <= 1e-9 * Math.max(1, Math.hypot(u[0], u[1]), Math.hypot(v[0], v[1]));
  // 複素数の値（\{ \} はかっことして読む）
  const evC = (t, v) => M.evalC(String(t).replace(/\\\{/g, '(').replace(/\\\}/g, ')'), v || {});
  const cmul = (u, v) => [u[0] * v[0] - u[1] * v[1], u[0] * v[1] + u[1] * v[0]];
  const cdiv = (u, v) => { const d = v[0] * v[0] + v[1] * v[1]; return [(u[0] * v[0] + u[1] * v[1]) / d, (u[1] * v[0] - u[0] * v[1]) / d]; };
  const sgn = n => (n < 0 ? `(${n})` : String(n));   // マイナスの数はかっこごと
  // 同じステップの中で、問題の形を順番に回す（第5巻 組 d と同じ）
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };

  // 整数の a+bj の TeX
  function zt(a, b) {
    if (b === 0) return String(a);
    const im = b === 1 ? 'j' : b === -1 ? '-j' : `${b}j`;
    if (a === 0) return im;
    return `${a}${b > 0 ? '+' : ''}${im}`;
  }
  const zmul = (u, v) => [u[0] * v[0] - u[1] * v[1], u[0] * v[1] + u[1] * v[0]];
  const zpow = (u, n) => { let o = [1, 0]; for (let k = 0; k < n; k++) o = zmul(o, u); return o; };
  // n=k^2 m（m は平方因子なし）
  function sqf(n) { let k = 1, m = n; for (let d = 2; d * d <= m; d++) while (m % (d * d) === 0) { m /= d * d; k *= d; } return [k, m]; }
  const rt = m => `\\sqrt${m < 10 ? m : `{${m}}`}`;
  const sqrtT = n => { const [k, m] = sqf(n); return m === 1 ? String(k) : `${k === 1 ? '' : k}${rt(m)}`; };     // √n を簡単に（2\sqrt5）
  const imT = n => { const [k, m] = sqf(n); return m === 1 ? (k === 1 ? 'j' : `${k}j`) : `${sqrtT(n)}\\,j`; };  // √n j

  // ---- p+q√s の数（S）。p、q は分数、s は平方因子のない整数（s=1 なら √ なし）
  const toF = v => (Array.isArray(v) ? v : fr(v));
  function S(p, q, s) {
    p = toF(p); q = toF(q == null ? 0 : q); s = s || 1;
    if (s === 1) return { p: F.add(p, q), q: fr(0), s: 1 };
    if (q[0] === 0) return { p, q, s: 1 };
    return { p, q, s };
  }
  const sZero = x => x.p[0] === 0 && x.q[0] === 0;
  const sNeg = x => S(F.mul(x.p, fr(-1)), F.mul(x.q, fr(-1)), x.s);
  function sAdd(x, y) {
    if (x.q[0] && y.q[0] && x.s !== y.s) throw new Error('sAdd: √ の中がちがう');
    return S(F.add(x.p, y.p), F.add(x.q, y.q), x.q[0] ? x.s : y.s);
  }
  const sSub = (x, y) => sAdd(x, sNeg(y));
  function sMul(x, y) {
    if (!x.q[0]) return S(F.mul(x.p, y.p), F.mul(x.p, y.q), y.s);
    if (!y.q[0]) return S(F.mul(y.p, x.p), F.mul(y.p, x.q), x.s);
    if (x.s === y.s) return S(F.add(F.mul(x.p, y.p), F.mul(F.mul(x.q, y.q), fr(x.s))), F.add(F.mul(x.p, y.q), F.mul(x.q, y.p)), x.s);
    if (!x.p[0] && !y.p[0]) { const [k, m] = sqf(x.s * y.s); return S(0, F.mul(F.mul(x.q, y.q), fr(k)), m); }
    throw new Error('sMul: √ の中がちがう2項の数');
  }
  function sInv(x) {   // 1項の数だけ
    if (!x.q[0]) return S(F.div(fr(1), x.p));
    if (!x.p[0]) return S(0, F.div(fr(1), F.mul(x.q, fr(x.s))), x.s);
    throw new Error('sInv: 2項の数');
  }
  const sVal = x => F.val(x.p) + F.val(x.q) * Math.sqrt(x.s);
  const sRoot = n => { const [k, m] = sqf(n); return S(0, k, m); };   // √n
  const sPow = (x, n) => { let o = S(1); for (let k = 0; k < n; k++) o = sMul(o, x); return o; };
  const surd = (c, s) => { const [n, d] = c, body = `${n === 1 ? '' : n}${rt(s)}`; return d === 1 ? body : `\\frac{${body}}{${d}}`; };
  // S の TeX：3、\frac{1}{2}、2\sqrt3、-\frac{\sqrt3}{2}、\sqrt3-1、-1-\sqrt3、\frac{3-\sqrt3}{2}
  function stex(x) {
    if (!x.q[0]) return F.tex(x.p);
    const neg = x.q[0] < 0, aq = [Math.abs(x.q[0]), x.q[1]];
    if (!x.p[0]) return (neg ? '-' : '') + surd(aq, x.s);
    const L = F.lcm(x.p[1], x.q[1]), P = x.p[0] * L / x.p[1], Q = x.q[0] * L / x.q[1];
    const sd = `${Math.abs(Q) === 1 ? '' : Math.abs(Q)}${rt(x.s)}`;
    const body = Q > 0 ? `${sd}${P > 0 ? '+' : '-'}${Math.abs(P)}` : `${P}-${sd}`;
    return L === 1 ? body : `\\frac{${body}}{${L}}`;
  }
  // 虚部の項（正の大きさ）：j、3j、\frac{1}{2}j、\sqrt3\,j、\frac{\sqrt3}{2}j、(\sqrt3+1)j
  function jterm(x) {
    if (x.p[0] && x.q[0]) { const t = stex(x); return /^\\frac/.test(t) ? `${t}j` : `(${t})j`; }
    if (!x.q[0]) { const [n, d] = x.p; return d === 1 ? (n === 1 ? 'j' : `${n}j`) : `\\frac{${n}}{${d}}j`; }
    const t = surd(x.q, x.s); return /^\\frac/.test(t) ? `${t}j` : `${t}\\,j`;
  }
  // 複素数 {re, im}（どちらも S）
  const Z = (a, b) => ({ re: S(a), im: S(b) });
  const zA = (u, v) => ({ re: sAdd(u.re, v.re), im: sAdd(u.im, v.im) });
  const zM = (u, v) => ({ re: sSub(sMul(u.re, v.re), sMul(u.im, v.im)), im: sAdd(sMul(u.re, v.im), sMul(u.im, v.re)) });
  const zSc = (k, u) => ({ re: sMul(k, u.re), im: sMul(k, u.im) });
  const zP = (u, n) => { let o = Z(1, 0); for (let k = 0; k < n; k++) o = zM(o, u); return o; };
  const zVal = u => [sVal(u.re), sVal(u.im)];
  function ztex(z) {
    const re = z.re, im = z.im;
    if (sZero(im)) return stex(re);
    const two = im.p[0] && im.q[0];
    let neg = false, mag = im;
    if (!two && sVal(im) < 0) { neg = true; mag = sNeg(im); }
    const it = jterm(mag);
    if (sZero(re)) return (neg ? '-' : '') + it;
    let rtx = stex(re); if (re.p[0] && re.q[0] && !/^\\frac/.test(rtx)) rtx = `(${rtx})`;
    return `${rtx}${neg ? '-' : '+'}${it}`;
  }
  const ptT = z => `(${stex(z.re)},\\ ${stex(z.im)})`;   // 点の座標

  // ---- 角（度）
  const nd = d => { d = ((d % 360) + 360) % 360; return d > 180 ? d - 360 : d; };   // -180<d≦180 に
  const dg = d => `${d}^{\\circ}`;
  // cos d と sin d（特別な角だけ。ほかは null）を {re, im} で
  function cs(d) {
    const t = ((d % 360) + 360) % 360, q = Math.floor(t / 90), u = t - 90 * q;
    const H = S(fr(1, 2)), R3 = S(0, fr(1, 2), 3), R2 = S(0, fr(1, 2), 2);
    const B = { 0: [S(1), S(0)], 30: [R3, H], 45: [R2, R2], 60: [H, R3] }[u];
    if (!B) return null;
    let [c, s] = B;
    for (let k = 0; k < q; k++) [c, s] = [sNeg(s), c];
    return { re: c, im: s };
  }
  const special = d => cs(d) != null;
  // 極形式の TeX：2(\cos30^{\circ}+j\sin30^{\circ})、4\{\cos(-60^{\circ})+j\sin(-60^{\circ})\}。r が 1 なら r を書かない
  function polT(rT, d) {
    const c = d < 0 ? `\\cos(${dg(d)})+j\\sin(${dg(d)})` : `\\cos${dg(d)}+j\\sin${dg(d)}`;
    if (rT === '' || rT === '1') return c;
    return d < 0 ? `${rT}\\{${c}\\}` : `${rT}(${c})`;
  }
  // 極形式の答えを読む：{ r, d }（形がちがえば null）
  function polRead(t) {
    t = String(t).trim();
    const i = t.indexOf('\\cos'); if (i < 0) return null;
    const pre = t.slice(0, i).replace(/(\(|\\\{)\s*$/, '').trim();
    const mc = /\\cos\(?(-?[\d.]+)\^\{\\circ\}/.exec(t), ms = /\\sin\(?(-?[\d.]+)\^\{\\circ\}/.exec(t);
    if (!mc || !ms || mc[1] !== ms[1]) return null;
    const r = pre === '' ? 1 : M.evalMath(pre, {});
    return r == null ? null : { r, d: +mc[1] };
  }
  // 極形式の答えが、値 v に等しく、r>0、-180<θ≦180 の形か
  function polOK(a, v) {
    const P = polRead(a); if (!P) return `答え ${a} が極形式の形でない`;
    if (!(P.r > 0)) return `答え ${a} の絶対値が正でない`;
    if (!(P.d > -180 && P.d <= 180)) return `答え ${a} の偏角が -180°<θ≦180° でない`;
    return cclose(evC(a), v) || `答え ${a} の値が ${v.map(x => +x.toFixed(6)).join(', ')} でない`;
  }

  // 問題の文の「名前=値」（$z=3+4j$ など）
  function defs(q) {
    const o = {};
    for (const m of maths(q)) { const k = /^\s*([a-zA-Z](?:_\{?\d\}?)?|[a-z][+-][a-z])\s*=(.*)$/.exec(m); if (k) o[k[1].replace(/[{}]/g, '')] = k[2]; }
    return o;
  }
  // 点の座標の答え (x,\ y) を読む
  function ptRead(a) {
    const m = /^\(\s*(.*?)\s*,(?:\\ )?\s*(.*)\)$/.exec(maths(a)[0] || ''); if (!m) return null;
    const x = M.evalMath(m[1], {}), y = M.evalMath(m[2], {});
    return x == null || y == null ? null : [x, y];
  }

  // ---- 図（M.cplane）
  const dirOf = (x, y) => (y >= 0 ? (x >= 0 ? 'ne' : 'nw') : (x >= 0 ? 'se' : 'sw'));
  // pts（と原点）が入る複素平面。たてと横は同じ倍率
  function plane(pts) {
    const xs = pts.map(p => p[0]).concat(0), ys = pts.map(p => p[1]).concat(0);
    const x0 = Math.min(...xs) - 1.2, x1 = Math.max(...xs) + 1.2, y0 = Math.min(...ys) - 1.2, y1 = Math.max(...ys) + 1.2;
    const k = Math.min(1, 9 / (x1 - x0), 8 / (y1 - y0));
    return M.cplane({ x0, x1, y0, y1, w: (x1 - x0) * k, h: (y1 - y0) * k });
  }
  // 原点のまわりの角の弧（0°から d° へ、向きつき）と、角の文字
  function angArc(d, rad, lab, d0) {
    d0 = d0 || 0;
    const its = [], R = Math.PI / 180;
    if (d >= d0) its.push(['arc', [0, 0], rad, d0, d, { arrow: true }]);
    else { its.push(['arc', [0, 0], rad, d, d0]); its.push(['seg', [rad * Math.cos((d + 7) * R), rad * Math.sin((d + 7) * R)], [rad * Math.cos(d * R), rad * Math.sin(d * R)], { arrow: true }]); }
    if (lab) {
      const m = (d + d0) / 2 * R, L = rad + 0.6, c = Math.cos(m), s = Math.sin(m);
      // 軸の近くなら、軸の線にかからないように横（たて）へずらす
      const dx = Math.abs(c) < 0.25 ? (c < 0 ? -0.45 : 0.45) : 0, dy = Math.abs(s) < 0.25 ? (s < 0 ? -0.3 : 0.3) : 0;
      its.push(['label', [L * c + dx, L * s + dy], lab, 'c']);
    }
    return its;
  }

  // ---- 見わけようの目印（fits）の部品
  // 2次方程式（$…=…$ の形。文字は s か x）の係数 a、b、c と判別式。なければ null
  function quad(q) {
    for (const m of maths(q)) {
      const sides = m.split('='); if (sides.length !== 2) continue;
      const v = /(?:^|[^a-zA-Z\\])([sx])(?![a-zA-Z])/.exec(m.replace(/\\[a-zA-Z]+/g, ' ')); if (!v) continue;
      const f = x => { const a = M.evalMath(sides[0], { [v[1]]: x }), b = M.evalMath(sides[1], { [v[1]]: x }); return a == null || b == null ? null : a - b; };
      const f0 = f(0), f1 = f(1), fm = f(-1), f2 = f(2);
      if ([f0, f1, fm, f2].some(t => t == null)) continue;
      const a = (f1 + fm) / 2 - f0, b = (f1 - fm) / 2, c = f0;
      if (Math.abs(a) < 1e-12 || Math.abs(f2 - (4 * a + 2 * b + c)) > 1e-9) continue;
      return { a, b, c, D: b * b - 4 * a * c, v: v[1] };
    }
    return null;
  }
  // (A)(B) のかけ算の、2つのかっこの中身
  const pairOf = m => { const k = /\(([^()]*)\)\s*\(([^()]*)\)/.exec(m); return k ? [k[1], k[2]] : null; };
  // かっこの数の累乗 (…)^{n} の、中身の値と n
  function powOf(m) {
    const k = /\(([^()]*)\)\^\{?(\d+)\}?/.exec(m) || /\\Bigl\((.*)\\Bigr\)\^\{?(\d+)\}?/.exec(m); if (!k) return null;
    const v = evC(k[1]); return v ? { v, n: +k[2], t: k[1] } : null;
  }
  const isSpecialArg = v => { const a = Math.atan2(v[1], v[0]) * 180 / Math.PI; return Math.abs(a / 15 - Math.round(a / 15)) < 1e-9; };

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：fits では見つからない行き先
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(6).filter(id => {
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

  // ================================================================ 6-46
  const JZ = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const jp = n => JZ[((n % 4) + 4) % 4];          // j^n（整数の組）
  const jpT = n => zt(...jp(n));
  M.add({
    id: '6-46', part: 4, chap: '6-8④ 例題1', stars: 1,
    title: '$j$ の累乗は、指数を4でわったあまりで決める（1→$j$、2→$-1$、3→$-j$、0→1）',
    mark: '指数の大きい $j$ の累乗（$j^{\\square}$）。',
    futsu: ['$j^{13}=j\\times j\\times\\cdots\\times j$ と、', '$j$ を1つずつかけて、', '$j^2=-1$ を何回も使う。'],
    raku: ['$13=4\\times3+1$（あまり1）', '$j^4=1$ なので、4こずつの組は1', '$j^{13}=j^1=j$'],
    why: '$j$ をかけるたびに、点は原点のまわりに90°ずつ回る（6-8②④）。4回で360°回って、もとの1にもどるので $j^4=1$。だから、4こずつの組はどれも1になり、あまりの回数だけ $j$ をかけた数が残る。',
    caution: 'あまりが0のときは1（$j^4=1$）。あまり2は $-1$、あまり3は $-j$ で、符号をまちがえない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: { s1: '16mm', s2: '22mm', s3: '22mm', trap: '22mm' },
    fits(q) { return maths(q).some(m => /(^|[^a-zA-Z)}\\])j\^/.test(m) || /\(-j\)\^/.test(m)); },
    steps: {
      // j^n（n は5〜39。13 は左ページの例なので出さない。O-2）
      s1(r) {
        const n = r.int(5, 39); if (n === 13) return null;
        const k = Math.floor(n / 4), m = n % 4, A = jpT(n);
        return { q: `$j^{${n}}$`, a: `$${A}$`, key: `p${n}`, easy: `$${n}=4\\times${k}${m ? `+${m}` : ''}$（あまり${m}）。$j^{${n}}=${A}$`, easyCheck: 'last' };
      },
      // (-j)^n・j^a×j^b・j^a+j^b
      s2(r) {
        const t = turn(r, '46s2', 3);
        if (t === 0) {
          const n = r.int(3, 12); if (n === 13) return null;
          const v = jp(n).map(x => (n % 2 ? -x : x)) , A = zt(...v);
          return { q: `$(-j)^{${n}}$`, a: `$${A}$`, key: `m${n}`, easy: `$(-j)^{${n}}=(-1)^{${n}}\\times j^{${n}}=${A}$` };
        }
        const a = r.int(3, 15), b = r.int(3, 15);
        if (a === b || a === 13 || b === 13) return null;
        if (t === 1) {
          const A = jpT(a + b);
          return { q: `$j^{${a}}\\times j^{${b}}$`, a: `$${A}$`, key: `x${Math.min(a, b)},${Math.max(a, b)}`, easy: `$j^{${a}}\\times j^{${b}}=j^{${a + b}}=${A}$` };
        }
        const u = jp(a), w = jp(b), s = [u[0] + w[0], u[1] + w[1]];
        if (s[0] === 0 && s[1] === 0) return null;
        const A = zt(...s);
        return { q: `$j^{${a}}+j^{${b}}$`, a: `$${A}$`, key: `s${Math.min(a, b)},${Math.max(a, b)}`, easy: `$j^{${a}}+j^{${b}}=(${jpT(a)})+(${jpT(b)})=${A}$` };
      },
      // 和 j+j^2+…+j^n・1/j^n・(j^a)^b・大きい指数
      s3(r) {
        const t = turn(r, '46s3', 4);
        if (t === 0) {
          const n = r.int(6, 15); if (n === 13) return null;
          const s = [0, 0]; for (let k = 1; k <= n; k++) { s[0] += jp(k)[0]; s[1] += jp(k)[1]; }
          const A = zt(...s), g = Math.floor(n / 4), rest = [];
          for (let k = 4 * g + 1; k <= n; k++) rest.push(`j^{${k}}`);
          return {
            q: `$j+j^{2}+j^{3}+\\cdots+j^{${n}}$`, a: `$${A}$`, key: `w${n}`,
            easy: `4こずつの和は $j-1-j+1=0$（${g}組）。${rest.length ? `のこりは $${rest.join('+')}=${A}$` : `のこりはなく $${A}$`}`, easyCheck: 'last',
            verify: p => { let v = [0, 0]; for (let k = 1; k <= n; k++) { const w = evC(`j^{${k}}`); v = [v[0] + w[0], v[1] + w[1]]; } return cclose(v, evC(strip(p.a))) || `和が ${p.a} にならない`; },
          };
        }
        if (t === 1) {
          const n = r.int(3, 12); if (n === 13) return null;
          const A = jpT(-n);
          return { q: `$\\frac{1}{j^{${n}}}$`, a: `$${A}$`, key: `i${n}`, easy: `$j^{${n}}=${jpT(n)}$ なので、$\\frac{1}{${jpT(n)}}=${A}$`, easyCheck: 'last' };
        }
        if (t === 2) {
          const a = r.int(2, 7), b = r.int(3, 9); if (a * b === 13) return null;
          const A = jpT(a * b);
          return { q: `$(j^{${a}})^{${b}}$`, a: `$${A}$`, key: `e${a},${b}`, easy: `$(j^{${a}})^{${b}}=j^{${a * b}}=${A}$` };
        }
        const n = r.int(100, 2030), k = Math.floor(n / 4), m = n % 4, A = jpT(n);
        return { q: `$j^{${n}}$`, a: `$${A}$`, key: `b${n}`, easy: `$${n}=4\\times${k}${m ? `+${m}` : ''}$（あまり${m}）。$j^{${n}}=${A}$`, easyCheck: 'last' };
      },
      // わな：(a±j)^2・(1±j)^3（j だけの累乗でない。6-48）
      trap(r) {
        const a = r.int(1, 3), b = r.pick([1, -1]), n = r.pick([2, 2, 3]); if (n === 3 && a > 1) return null;
        const A = zt(...zpow([a, b], n));
        return dest({ q: `$(${zt(a, b)})^{${n}}$`, a: `$${A}$`, key: `t${a},${b},${n}` }, '6-46', `$j$ だけの累乗ではなく、$${zt(a, b)}$ の${n}乗。展開して $j^2=-1$ を使う`);
      },
    },
  });

  // ================================================================ 6-47
  // 左ページの例：z=3+4j、w=1-2j（O-2。この2つがそろう問題は出さない）
  const ex47 = (u, v) => [u, v].some(x => x[0] === 3 && x[1] === 4) && [u, v].some(x => x[0] === 1 && x[1] === -2);
  const cT = (k, v) => (k === 1 ? v : k === -1 ? `-${v}` : `${k}${v}`);
  const lin = (k, m) => `${cT(k, 'z')}${m > 0 ? '+' : '-'}${Math.abs(m) === 1 ? '' : Math.abs(m)}w`;
  const keyPM = (op, u, v) => (op === '+' ? `+|${[zt(...u), zt(...v)].sort().join('|')}` : `-|${zt(...u)}|${zt(...v)}`);
  M.add({
    id: '6-47', part: 4, chap: '6-8⑤・6-9② 例題2', stars: 1,
    title: 'たし算・ひき算・実数倍は、実部どうし・虚部どうし（複素平面では矢印をつなぐ）',
    mark: '$z=a+bj$、$w=c+dj$ の和・差や、$2z-3w$ のような式。',
    futsu: ['$2(3+4j)-3(1-2j)$ と書き写し、', 'かっこを1つずつはずして', '$6+8j-3+6j$ にしてから、', '同じ種類の項をさがして集める。'],
    raku: ['$z=3+4j$、$w=1-2j$ の $2z-3w$', '実部：$2\\times3-3\\times1=3$', '虚部：$2\\times4-3\\times(-2)=14$', '$2z-3w=3+14j$'],
    why: '$j$ を文字 $x$ と同じように考えると、実部は数の項、虚部は $x$ の項（同類項。6-8⑤）。複素平面では、$a+bj$ は点 $(a,\\ b)$ への矢印なので、たし算は矢印をつなぐこと、実数倍は矢印をのばすこと（4-11のベクトルの成分ごとの計算と同じ。6-9②）。',
    caution: 'かっこの前の $-$ は、かっこの中の両方の項につく：$(5+2j)-(1-3j)$ は $4+5j$（$4-j$ ではない）。虚部の符号に気をつける。',
    counts: { s1: 8, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '20mm', s2: '22mm', s3: '22mm', trap: '20mm' },
    fits(q) {
      if (/距離|絶対値|偏角|回した/.test(q)) return false;
      if (/矢印/.test(q)) return true;
      if (/のとき/.test(q) && hasM(q, /^-?\d*[zw](?:[+-]\d*[zw])*$/)) return true;          // 2z-3w、z+w
      return maths(q).some(m => /^-?\d*\([^()]*j[^()]*\)(?:[+-]\d*\([^()]*j[^()]*\))+$/.test(m.replace(/\s/g, '')));   // (3+4j)-(1-2j)
    },
    steps: {
      // (a+bj)±(c+dj)
      s1(r) {
        const u = [r.int(-6, 6), r.intNot(-6, 6, v => v === 0)], v = [r.int(-6, 6), r.intNot(-6, 6, v => v === 0)], op = r.pick(['+', '-']);
        if (ex47(u, v) || (u[0] === 0 && v[0] === 0)) return null;
        const s = op === '+' ? [u[0] + v[0], u[1] + v[1]] : [u[0] - v[0], u[1] - v[1]];
        if (s[0] === 0 && s[1] === 0) return null;
        const A = zt(...s);
        return { q: `$(${zt(...u)})${op}(${zt(...v)})$`, a: `$${A}$`, key: keyPM(op, u, v), easy: `$(${u[0]}${op}${sgn(v[0])})+(${u[1]}${op}${sgn(v[1])})j=${A}$` };
      },
      // kz+mw（z、w の式と、かっこの式）
      s2(r) {
        const k = r.intNot(-4, 4, v => v === 0), m = r.intNot(-4, 4, v => v === 0);
        if (Math.abs(k) === 1 && Math.abs(m) === 1) return null;
        const u = [r.int(-5, 5), r.intNot(-5, 5, v => v === 0)], v = [r.int(-5, 5), r.intNot(-5, 5, v => v === 0)];
        if (ex47(u, v)) return null;
        const s = [k * u[0] + m * v[0], k * u[1] + m * v[1]]; if (s[0] === 0 && s[1] === 0) return null;
        const A = zt(...s), mm = Math.abs(m), op = m > 0 ? '+' : '-';
        const easy = `$(${k}\\times${sgn(u[0])}${op}${mm}\\times${sgn(v[0])})+(${k}\\times${sgn(u[1])}${op}${mm}\\times${sgn(v[1])})j=${A}$`;
        const key = `L|${k}|${m}|${zt(...u)}|${zt(...v)}`;
        if (turn(r, '47s2', 2)) {
          return {
            q: `$z=${zt(...u)}$、$w=${zt(...v)}$ のとき、$${lin(k, m)}$`, a: `$${A}$`, key, easy,
            verify: p => { const D = defs(p.q), z = evC(D.z), w = evC(D.w); return cclose(evC(lastMath(p.q), { z, w }), evC(strip(p.a))) || `${lastMath(p.q)} が ${p.a} にならない`; },
          };
        }
        return { q: `$${k === 1 ? '' : k === -1 ? '-' : k}(${zt(...u)})${op}${mm === 1 ? '' : mm}(${zt(...v)})$`, a: `$${A}$`, key, easy };
      },
      // 図（矢印をつなぐ・w から z への矢印）、z+w や z-w がわかっているときのもう1つの数
      s3(r) {
        const t = turn(r, '47s3', 4);
        const u = [r.intNot(-3, 3, v => v === 0), r.int(-3, 3)], v = [r.int(-3, 3), r.intNot(-3, 3, v => v === 0)];
        if (ex47(u, v) || u[0] * v[1] - u[1] * v[0] === 0) return null;   // 同じ向き・反対向きの矢印は図がつぶれる
        const sum = [u[0] + v[0], u[1] + v[1]], dif = [u[0] - v[0], u[1] - v[1]];
        if ((t === 0 || t === 2) && sum[0] === 0 && sum[1] === 0) return null;
        const zT = zt(...u), wT = zt(...v);
        if (t === 0) {
          const G = plane([u, v, sum]), O = G.T(0, 0), Pz = G.T(...u), Pw = G.T(...v), Ps = G.T(...sum);
          const fig = { s: 5, items: [...G.axes({}),
            ['seg', O, Pz, { arrow: true, thick: true }], ['seg', O, Pw, { arrow: true }], ['seg', Pz, Ps, { arrow: true, thick: true }], ['seg', Pw, Ps, { dash: true }],
            ['label', Pz, '$z$', dirOf(u[0] - v[0], u[1] - v[1])], ['label', Pw, '$w$', dirOf(v[0] - u[0], v[1] - u[1])], ['dot', Ps], ['label', Ps, '$z+w$', dirOf(...sum)]] };
          return {
            q: `図のように、$z=${zT}$ の矢印の先に、$w=${wT}$ の矢印をつないだ。行き着いた点が表す複素数 $z+w$`, a: `$${zt(...sum)}$`, fig, key: keyPM('+', u, v),
            easy: `$(${u[0]}+${sgn(v[0])})+(${u[1]}+${sgn(v[1])})j=${zt(...sum)}$`,
            verify: p => { const D = defs(p.q); return cclose(evC(`(${D.z})+(${D.w})`), evC(strip(p.a))) || 'z+w がちがう'; },
          };
        }
        if (t === 1) {
          const G = plane([u, v]), O = G.T(0, 0), Pz = G.T(...u), Pw = G.T(...v);
          const fig = { s: 5, items: [...G.axes({}),
            ['seg', O, Pz, { arrow: true }], ['seg', O, Pw, { arrow: true }], ['seg', Pw, Pz, { arrow: true, thick: true }],
            ['label', Pz, '$z$', dirOf(...u)], ['label', Pw, '$w$', dirOf(...v)]] };
          return {
            q: `図の、点 $w=${wT}$ から点 $z=${zT}$ へ向かう矢印が表す複素数 $z-w$`, a: `$${zt(...dif)}$`, fig, key: keyPM('-', u, v),
            easy: `$(${u[0]}-${sgn(v[0])})+(${u[1]}-${sgn(v[1])})j=${zt(...dif)}$`,
            verify: p => { const D = defs(p.q); return cclose(evC(`(${D.z})-(${D.w})`), evC(strip(p.a))) || 'z-w がちがう'; },
          };
        }
        if (t === 2) {   // z+w と z から w（逆の問題なので、和の問題と同じ key。O-2）
          return {
            q: `$z+w=${zt(...sum)}$、$z=${zT}$ のとき、$w$`, a: `$${wT}$`, key: keyPM('+', u, v),
            easy: `$w=(z+w)-z$。$(${sum[0]}-${sgn(u[0])})+(${sum[1]}-${sgn(u[1])})j=${wT}$`, easyCheck: 'last',
            verify: p => { const D = defs(p.q); return cclose(evC(`(${D['z+w']})-(${D.z})`), evC(strip(p.a))) || 'w がちがう'; },
          };
        }
        return {
          q: `$z-w=${zt(...dif)}$、$w=${wT}$ のとき、$z$`, a: `$${zT}$`, key: keyPM('-', u, v),
          easy: `$z=(z-w)+w$。$(${dif[0]}+${sgn(v[0])})+(${dif[1]}+${sgn(v[1])})j=${zT}$`, easyCheck: 'last',
          verify: p => { const D = defs(p.q); return cclose(evC(`(${D['z-w']})+(${D.w})`), evC(strip(p.a))) || 'z がちがう'; },
        };
      },
      // わな：かけ算（6-48）
      trap(r) {
        const u = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)], v = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)];
        if (u[0] === v[0] && u[1] === -v[1]) return null;   // 共役な組は 6-49
        return dest({ q: `$(${zt(...u)})(${zt(...v)})$`, a: `$${zt(...zmul(u, v))}$`, key: `t|${[zt(...u), zt(...v)].sort().join('|')}` }, '6-47', 'たし算ではなく、かけ算。展開して $j^2=-1$ を使う');
      },
    },
  });

  // ================================================================ 6-48
  // 4つの積を並べた式：3-12j+2j-8j^{2}
  function terms4(u, v) {
    const c = [u[0] * v[0], u[0] * v[1], u[1] * v[0], u[1] * v[1]], tail = ['', 'j', 'j', 'j^{2}'];
    return c.map((x, i) => (x === 0 ? '' : (i && x > 0 ? '+' : '') + (x === -1 && i ? '-' : x === 1 && i ? '' : x) + tail[i])).join('').replace(/^\+/, '') || '0';
  }
  const ex48 = (u, v) => { const k = [zt(...u), zt(...v)].sort().join('|'); return k === ['3+2j', '1-4j'].sort().join('|'); };
  M.add({
    id: '6-48', part: 4, chap: '6-8⑥ 例題3', stars: 1,
    title: 'かけ算は展開して、$j^2$ はすぐ $-1$（$j$ をかけると90°回る）',
    mark: '$(a+bj)(c+dj)$、$(a+bj)^2$、$j(a+bj)$ のようなかけ算。',
    futsu: ['$(3+2j)(1-4j)$ を', '$3\\times1+3\\times(-4j)+2j\\times1+\\cdots$ と', '4つの積に分けて書き、', '$j^2$ は最後にまとめて直す。'],
    raku: ['$3-12j+2j-8j^2$（$j^2$ はすぐ $-1$）', '$=3+8-10j=11-10j$', '$j(2+5j)=2j-5$：90°回る'],
    why: '$j$ を文字のように考えて展開し（3-8）、$j^2$ が出たらすぐ $-1$ にする（6-8⑥）。$j$ をかけると、点 $(a,\\ b)$ は原点のまわりに90°回って $(-b,\\ a)$ になる（4-8）。',
    caution: '$(2j)^2=4j^2=-4$（$+4$ ではない）。$(a+bj)^2$ のまん中の項 $2abj$ を忘れない。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '22mm', s2: '22mm', s3: '22mm', trap: '20mm' },
    fits(q) {
      if (/\\cos|回した|\\frac|たすと|極形式|絶対値|偏角|距離/.test(q)) return false;
      if (/のとき/.test(q) && hasM(q, /^zw$/)) return true;
      return maths(q).some(m => {
        if (/\)\s*\(/.test(m) && /j/.test(m)) return true;
        const e = /\(([^()]*j[^()]*)\)\^\{?(\d+)\}?/.exec(m); if (e && +e[2] <= 3) return true;
        return /(^|[^a-zA-Z{\\])-?\d*j(\^\{?\d+\}?)?\s*\(/.test(m);   // j(2+5j)、j^{3}(…)
      });
    },
    steps: {
      // (a+bj)(c+dj)（共役でない組）
      s1(r) {
        const u = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], v = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)];
        if ((u[0] === v[0] && u[1] === -v[1]) || (u[0] === v[0] && u[1] === v[1]) || ex48(u, v)) return null;
        const A = zt(...zmul(u, v));
        return { q: `$(${zt(...u)})(${zt(...v)})$`, a: `$${A}$`, key: `m|${[zt(...u), zt(...v)].sort().join('|')}`, easy: `$${terms4(u, v)}=${A}$` };
      },
      // 2乗・j をかける
      s2(r) {
        const u = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)];
        if (turn(r, '48s2', 2)) {
          const A = zt(...zmul(u, u));
          return { q: `$(${zt(...u)})^{2}$`, a: `$${A}$`, key: `q|${zt(...u)}`, easy: `$${u[0] * u[0]}${u[0] * u[1] > 0 ? '+' : '-'}${Math.abs(2 * u[0] * u[1])}j+${u[1] * u[1]}j^{2}=${A}$` };
        }
        const k = r.pick([1, 1, -1]);
        if (k === 1 && u[0] === 2 && u[1] === 5) return null;   // 左ページの例（O-2）
        const A = zt(...zmul([0, k], u)), c1 = k * u[0], c2 = k * u[1];
        return { q: `$${k === 1 ? '' : '-'}j(${zt(...u)})$`, a: `$${A}$`, key: `j|${k}|${zt(...u)}`, easy: `$${c1 === 1 ? '' : c1 === -1 ? '-' : c1}j${c2 > 0 ? '+' : '-'}${Math.abs(c2) === 1 ? '' : Math.abs(c2)}j^{2}=${A}$` };
      },
      // z、w の文字で・3乗・j^n をかける
      s3(r) {
        const t = turn(r, '48s3', 3);
        if (t === 0) {
          const u = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], v = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)];
          if ((u[0] === v[0] && u[1] === -v[1]) || (u[0] === v[0] && u[1] === v[1]) || ex48(u, v)) return null;
          const A = zt(...zmul(u, v));
          return {
            q: `$z=${zt(...u)}$、$w=${zt(...v)}$ のとき、$zw$`, a: `$${A}$`, key: `m|${[zt(...u), zt(...v)].sort().join('|')}`, easy: `$${terms4(u, v)}=${A}$`,
            verify: p => { const D = defs(p.q); return cclose(cmul(evC(D.z), evC(D.w)), evC(strip(p.a))) || 'zw がちがう'; },
          };
        }
        if (t === 1) {
          const u = [r.pick([1, 2, -1, -2]), r.pick([1, 2, -1, -2])]; if (Math.abs(u[0]) === 2 && Math.abs(u[1]) === 2) return null;
          const sq = zmul(u, u), A = zt(...zmul(sq, u));
          return { q: `$(${zt(...u)})^{3}$`, a: `$${A}$`, key: `c|${zt(...u)}`, easy: `$(${zt(...u)})^{2}=${zt(...sq)}$。$(${zt(...sq)})(${zt(...u)})=${A}$`, easyCheck: 'last' };
        }
        const n = r.pick([3, 5, 6, 7]), u = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], A = zt(...zmul(jp(n), u));
        return { q: `$j^{${n}}(${zt(...u)})$`, a: `$${A}$`, key: `n|${n}|${zt(...u)}`, easy: `$j^{${n}}=${jpT(n)}$ なので $${jpT(n)}(${zt(...u)})=${A}$`, easyCheck: 'last' };
      },
      // わな：わり算（6-50）
      trap(r) {
        const u = [r.int(1, 4), r.intNot(-4, 4, v => v === 0)], k = r.pick([1, 2, -1]), N = k * (u[0] * u[0] + u[1] * u[1]);
        if (N === 5 && u[0] === 1 && u[1] === 2) return null;
        return dest({ q: `$\\frac{${N}}{${zt(...u)}}$`, a: `$${zt(k * u[0], -k * u[1])}$`, key: `t|${N}|${zt(...u)}`, boxh: '12mm' }, '6-48', 'かけ算ではなく、わり算（分母に $j$ がある）。分母と共役な数を、分母と分子にかける');
      },
    },
  });

  // ================================================================ 6-49
  M.add({
    id: '6-49', part: 4, chap: '6-8⑦ 例題4', stars: 1,
    title: '共役な数との積は、展開しないで $a^2+b^2$',
    mark: '$(a+bj)(a-bj)$、$z\\bar z$（実部が同じで、虚部の符号だけが反対の2つの積）。',
    futsu: ['$(2+5j)(2-5j)$ を4つの積に', '展開し、$-10j+10j$ が消えることと、', '$-25j^2=+25$ を', '1つずつ確かめる。'],
    raku: ['$a=2$、$b=5$ を見るだけ', '$(2+5j)(2-5j)=2^2+5^2$', '$=4+25=29$'],
    why: '和と差の積 $(A+B)(A-B)=A^2-B^2$（3-8）で $B=bj$ とすると、$B^2=b^2j^2=-b^2$。だから $(a+bj)(a-bj)=a^2-(-b^2)=a^2+b^2$ で、$j$ が消えて実数になる（6-8⑦）。',
    caution: '$a$・$b$ が負の数でも、2乗するので答えは正（$(-3-j)(-3+j)$ は $9+1=10$）。$a^2-b^2$ としない。共役でない組（$(2+5j)(5-2j)$ など）には使えない。',
    counts: { s1: 8, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 2 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '20mm' },
    fits(q) {
      if (/\\bar\s*z/.test(q) && /のとき/.test(q) && !/\\cos/.test(q)) return true;
      return maths(q).some(m => {
        const P = pairOf(m); if (!P) return false;
        const u = evC(P[0]), v = evC(P[1]);
        return !!u && !!v && Math.abs(u[1]) > 1e-9 && close(u[0], v[0]) && close(u[1], -v[1]);
      });
    },
    steps: {
      // (a+bj)(a-bj)（a、b は正）
      s1(r) {
        const a = r.int(1, 9), b = r.int(1, 9); if (a === 2 && b === 5) return null;   // 左ページの例（O-2）
        const f = r.chance(0.5), P = [zt(a, b), zt(a, -b)], A = a * a + b * b;
        return { q: `$(${P[f ? 0 : 1]})(${P[f ? 1 : 0]})$`, a: `$${A}$`, key: `c|${a}|${b}`, easy: `$${a}^{2}+${b}^{2}=${a * a}+${b * b}=${A}$` };
      },
      // a か b が負・z\bar z
      s2(r) {
        const a = r.int(1, 8), b = r.int(1, 8); if (a === 2 && b === 5) return null;
        const sa = r.pick([1, -1]), sb = r.pick([1, -1]), A = a * a + b * b;
        if (turn(r, '49s2', 2)) {
          return {
            q: `$z=${zt(sa * a, sb * b)}$ のとき、$z\\bar z$`, a: `$${A}$`, key: `c|${a}|${b}`, easy: `$${sgn(sa * a)}^{2}+${sgn(sb * b)}^{2}=${A}$`,
            verify: p => { const D = defs(p.q), z = evC(D.z); return cclose(evC('z\\bar z', { z }), evC(strip(p.a))) || 'z\\bar z がちがう'; },
          };
        }
        if (sa > 0) return null;
        const P = [zt(-a, sb * b), zt(-a, -sb * b)];
        return { q: `$(${P[0]})(${P[1]})$`, a: `$${A}$`, key: `c|${a}|${b}`, easy: `$(-${a})^{2}+${b}^{2}=${A}$` };
      },
      // √ のある組・順番が入れかわった組
      s3(r) {
        if (turn(r, '49s3', 2)) {
          const s = r.pick([2, 3, 5, 6, 7]), b = r.int(1, 4);
          if (r.chance(0.5)) return { q: `$(${rt(s)}+${b === 1 ? '' : b}j)(${rt(s)}-${b === 1 ? '' : b}j)$`, a: `$${s + b * b}$`, key: `r|${s}|${b}`, easy: `$(${rt(s)})^{2}+${b}^{2}=${s}+${b * b}=${s + b * b}$` };
          return { q: `$(${b}+${rt(s)}\\,j)(${b}-${rt(s)}\\,j)$`, a: `$${s + b * b}$`, key: `R|${s}|${b}`, easy: `$${b}^{2}+(${rt(s)})^{2}=${b * b}+${s}=${s + b * b}$` };
        }
        const a = r.int(1, 9), b = r.int(1, 9); if (a === 2 && b === 5) return null;
        const B = b === 1 ? '' : b;
        return { q: `$(${B}j+${a})(${a}-${B}j)$`, a: `$${a * a + b * b}$`, key: `c|${a}|${b}`, easy: `$(${a}+${B}j)(${a}-${B}j)=${a}^{2}+${b}^{2}=${a * a + b * b}$` };
      },
      // わな：2乗・実部と虚部が入れかわった組（共役でない。6-48）
      trap(r) {
        const a = r.int(1, 6), b = r.int(1, 6);
        if (turn(r, '49tr', 2)) {
          return dest({ q: `$(${zt(a, b)})^{2}$`, a: `$${zt(...zmul([a, b], [a, b]))}$`, key: `t|q|${a}|${b}` }, '6-49', `$(${zt(a, b)})(${zt(a, b)})$ で、共役な組ではない。展開して $j^2=-1$ を使う`);
        }
        if (a === b) return null;
        return dest({ q: `$(${zt(a, b)})(${zt(b, -a)})$`, a: `$${zt(...zmul([a, b], [b, -a]))}$`, key: `t|s|${a}|${b}` }, '6-49', '実部と虚部が入れかわっていて、共役な組ではない。展開して $j^2=-1$ を使う');
      },
    },
  });

  // ================================================================ 6-50
  M.add({
    id: '6-50', part: 4, chap: '6-8⑧ 例題5', stars: 1,
    title: 'わり算は、分母と共役な数を分母・分子にかける（分母は $a^2+b^2$ の実数。$\\frac1j=-j$）',
    mark: '分母に $j$ がある分数。',
    futsu: ['答えを $x+yj$ とおいて、', '$(1+2j)(x+yj)=5$ を展開し、', '実部と虚部の連立方程式を', '解いて $x$、$y$ を求める。'],
    raku: ['$\\frac{5}{1+2j}$ の分母と分子に $1-2j$', '分母は $1^2+2^2=5$（実数）', '$\\frac{5(1-2j)}{5}=1-2j$'],
    why: '分母と分子に同じ数をかけても、分数の大きさは変わらない（2-4。3-10の有理化と同じ考え）。分母と共役な数をかけると、分母は $(a+bj)(a-bj)=a^2+b^2$ の実数になる（6-8⑦⑧）。$\\frac1j$ は、分母と分子に $-j$ をかけて $\\frac{-j}{-j^2}=-j$。',
    caution: '分子だけにかけない（分母と分子の両方にかける）。答えは、分母をかけて分子にもどるかで確かめる。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '24mm', trap: '40mm' }, boxh: '12mm',
    fits(q) {
      if (/\\cos/.test(q)) return false;
      if (/\)\s*x\s*=/.test(q)) return true;
      if (/のとき/.test(q) && hasM(q, /^\\frac\{[zw]\}\{[zw]\}$/)) return true;
      return maths(q).some(m => { const f = /\\frac\{([^{}]*)\}\{([^{}]*)\}/.exec(m); return !!f && /j/.test(f[2]) && !/j\^/.test(f[2]); });
    },
    steps: {
      // 実数 ÷ (a+bj)・実数 ÷ j
      s1(r) {
        if (turn(r, '50s1', 3) === 0) {
          const N = r.intNot(-9, 9, v => Math.abs(v) < 2), A = zt(0, -N);
          return { q: `$\\frac{${N}}{j}$`, a: `$${A}$`, key: `j|${N}`, easy: `$\\frac{${N}\\times(-j)}{j\\times(-j)}=${A}$` };
        }
        const u = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)], k = r.pick([1, 1, 2, 3, -1, -2]), D = u[0] * u[0] + u[1] * u[1], N = k * D;
        if (N === 5 && u[0] === 1 && u[1] === 2) return null;   // 左ページの例（O-2）
        const A = zt(k * u[0], -k * u[1]);
        return { q: `$\\frac{${N}}{${zt(...u)}}$`, a: `$${A}$`, key: `${N}|${zt(...u)}`, easy: `$\\frac{${N}(${zt(u[0], -u[1])})}{${u[0] * u[0]}+${u[1] * u[1]}}=${A}$` };
      },
      // (c+dj) ÷ (a+bj)（答えは整数の a+bj）
      s2(r) {
        const u = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)], x = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)];
        if (turn(r, '50s2', 4) === 0) {
          const n = zmul(x, [0, 1]);
          return { q: `$\\frac{${zt(...n)}}{j}$`, a: `$${zt(...x)}$`, key: `${zt(...n)}|j`, easy: `$\\frac{(${zt(...n)})\\times(-j)}{j\\times(-j)}=${zt(...x)}$` };
        }
        const n = zmul(u, x), D = u[0] * u[0] + u[1] * u[1], pr = zmul(n, [u[0], -u[1]]);
        return { q: `$\\frac{${zt(...n)}}{${zt(...u)}}$`, a: `$${zt(...x)}$`, key: `${zt(...n)}|${zt(...u)}`, easy: `$\\frac{(${zt(...n)})(${zt(u[0], -u[1])})}{${u[0] * u[0]}+${u[1] * u[1]}}=\\frac{${zt(...pr)}}{${D}}=${zt(...x)}$` };
      },
      // 答えが分数になるもの・(a+bj)x=… の x・z/w
      s3(r) {
        const t = turn(r, '50s3', 3), u = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)], D = u[0] * u[0] + u[1] * u[1];
        if (t === 0) {
          const c = r.pick([1, 1, 2, 3, -1]);
          if ((c * u[0]) % D === 0 && (c * u[1]) % D === 0) return null;   // 整数になるものはステップ1
          const A = ztex({ re: S(fr(c * u[0], D)), im: S(fr(-c * u[1], D)) });
          return { q: `$\\frac{${c}}{${zt(...u)}}$`, a: `$${A}$`, key: `f|${c}|${zt(...u)}`, easy: `$\\frac{${c}(${zt(u[0], -u[1])})}{${D}}=${A}$` };
        }
        const x = [r.intNot(-4, 4, v => v === 0), r.intNot(-4, 4, v => v === 0)], n = zmul(u, x), pr = zmul(n, [u[0], -u[1]]);
        const easy = `$\\frac{(${zt(...n)})(${zt(u[0], -u[1])})}{${D}}=\\frac{${zt(...pr)}}{${D}}=${zt(...x)}$`;
        if (t === 1) {
          return {
            q: `$(${zt(...u)})x=${zt(...n)}$ をみたす $x$`, a: `$${zt(...x)}$`, key: `${zt(...n)}|${zt(...u)}`, easy: `$x=\\frac{${zt(...n)}}{${zt(...u)}}$。${easy}`, easyCheck: 'last',
            verify: p => cclose(cmul(evC(strip(p.a)), evC(zt(...u))), evC(zt(...n))) || '答えに分母をかけても右辺にならない',
          };
        }
        return {
          q: `$z=${zt(...n)}$、$w=${zt(...u)}$ のとき、$\\frac{z}{w}$`, a: `$${zt(...x)}$`, key: `${zt(...n)}|${zt(...u)}`, easy,
          verify: p => { const D2 = defs(p.q); return cclose(cdiv(evC(D2.z), evC(D2.w)), evC(strip(p.a))) || 'z/w がちがう'; },
        };
      },
      // わな：極形式のわり算（6-58）
      trap(r) {
        const r2 = r.int(1, 3), k = r.int(2, 4), al = 10 * r.int(2, 17), be = 10 * r.int(1, 8); if (al === be) return null;
        const A = polT(String(k), nd(al - be));
        return dest({
          q: `$z=${polT(String(k * r2), al)}$、$w=${polT(String(r2), be)}$ のとき、$\\frac{z}{w}$（極形式で）`, a: `$${A}$`, key: `t|${k}|${r2}|${al}|${be}`,
          verify: p => { const D = defs(p.q); return polOK(strip(p.a), cdiv(evC(D.z), evC(D.w))); },
        }, '6-50', '極形式の数のわり算。共役な数をかけると長くなる。絶対値をわって、偏角をひく');
      },
    },
  });

  // ---------------------------------------------------------------- 方程式の解の部品
  // 答えの解を読む（$x=p\pm q$、$s=-2$、$-3$。$D=…$ は飛ばす）
  function rootsFrom(a) {
    const segs = maths(a).filter(t => !/^\s*D\s*=/.test(t));
    if (!segs.length) return [];
    if (segs[0].includes('\\pm')) { const [u, w] = segs[0].replace(/^\s*[sx]\s*=/, '').split('\\pm'); const b = u.trim() || '0'; return [evC(`${b}+(${w})`), evC(`${b}-(${w})`)]; }
    return segs.map(t => evC(t.replace(/^\s*[sx]\s*=/, '')));
  }
  // 問題の文の方程式に、答えの解を入れて確かめる（want：解の数）
  function eqVerify(p, want) {
    const eq = maths(p.q).find(t => t.split('=').length === 2 && /[sx]/.test(t.replace(/\\[a-zA-Z]+/g, '')));
    if (!eq) return '方程式が読めない';
    const v = /[sx]/.exec(eq.replace(/\\[a-zA-Z]+/g, ''))[0], [L, R] = eq.split('=');
    const rs = rootsFrom(p.a);
    if (rs.length !== want || rs.some(x => !x)) return `解の数が ${want} でない（${p.a}）`;
    for (const x of rs) { const u = evC(L, { [v]: x }), w = evC(R, { [v]: x }); if (!u || !w || Math.hypot(u[0] - w[0], u[1] - w[1]) > 1e-9) return `${p.a} を入れても成り立たない`; }
    if (want === 2 && cclose(rs[0], rs[1])) return '2つの解が同じ';
    return true;
  }
  // 2次式の TeX：2s^{2}-3s+1
  function qT(a, b, c, v) {
    v = v || 's';
    return `${a === 1 ? '' : a === -1 ? '-' : a}${v}^{2}` + (b ? `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}${v}` : '') + (c ? `${c > 0 ? '+' : '-'}${Math.abs(c)}` : '');
  }
  // a s^2+b s+c=0 の解の TeX と種類
  function solveQ(a, b, c, v) {
    v = v || 's';
    const D = b * b - 4 * a * c, re = fr(-b, 2 * a), reT = re[0] ? F.tex(re) : '';
    if (D === 0) return { D, kind: '実数の解1つ', tex: `$${v}=${F.tex(re)}$`, n: 1 };
    const [k, m] = sqf(Math.abs(D)), mag = S(0, fr(k, 2 * a), m);
    if (D > 0 && m === 1) { const r1 = F.add(re, fr(k, 2 * a)), r2 = F.sub(re, fr(k, 2 * a)); return { D, kind: '実数の解2つ', tex: `$${v}=${F.tex(r1)}$、$${F.tex(r2)}$`, n: 2 }; }
    if (D > 0) return { D, kind: '実数の解2つ', tex: `$${v}=${reT}\\pm ${stex(mag)}$`, n: 2 };
    return { D, kind: '虚数の解2つ', tex: `$${v}=${reT}\\pm ${jterm(mag)}$`, n: 2 };
  }
  const dT = (a, b, c) => { const f = 4 * a * c; return `$D=${b * b}${f >= 0 ? '-' : '+'}${Math.abs(f)}=${b * b - f}$`; };
  // 「たすと p、かけると q」の答え（2つの数）を確かめる
  function pairVerify(p) {
    const qs = maths(p.q).slice(0, 2).map(t => M.evalMath(t.replace(/^.*=/, ''), {})), xs = maths(p.a).map(t => evC(t));
    if (xs.length !== 2 || xs.some(x => !x) || qs.some(x => x == null)) return '答えが読めない';
    if (!cclose([xs[0][0] + xs[1][0], xs[0][1] + xs[1][1]], [qs[0], 0])) return '和がちがう';
    if (!cclose(cmul(xs[0], xs[1]), [qs[1], 0])) return '積がちがう';
    return true;
  }

  // ================================================================ 6-51
  const A51 = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 16, 18, 20, 25, 27, 36, 49, 64, 81, 100];   // 9 は左ページの例（O-2）
  M.add({
    id: '6-51', part: 4, chap: '6-8⑨ 例題6', stars: 1,
    title: 'マイナスの数の $\\sqrt{\\phantom{a}}$ は、先に $j$ に直す（$x^2=-a$ は $x=\\pm\\sqrt a\\,j$）',
    mark: '$x^2+\\square=0$、$x^2=-\\square$ や、$\\sqrt{-\\square}$ のかけ算・わり算。',
    futsu: ['$x^2+9=0$ を、解の公式で', '$x=\\frac{0\\pm\\sqrt{0-36}}{2}$ として、', '$\\sqrt{-36}$ をあとから直す。'],
    raku: ['$x^2=-9$ と移す', '2乗して $-9$ になるのは $\\pm3j$', '$\\sqrt{-4}\\times\\sqrt{-9}=2j\\times3j=-6$'],
    why: '$(\\sqrt a\\,j)^2=a\\times j^2=-a$、$(-\\sqrt a\\,j)^2=-a$ なので、2乗して $-a$ になる数は $\\pm\\sqrt a\\,j$（6-8⑨）。そこで $a>0$ のとき $\\sqrt{-a}=\\sqrt a\\,j$ と決める。',
    caution: '$\\sqrt{-4}\\times\\sqrt{-9}=\\sqrt{36}=6$ はまちがい。$\\sqrt a\\sqrt b=\\sqrt{ab}$ は $a$、$b$ が正の数のときのきまり（2-8）なので、先に $j$ の形に直す。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '20mm', s3: '30mm', trap: '30mm' }, boxh: { s2: '12mm' },
    fits(q) {
      if (/\\sqrt\{-/.test(q)) return true;
      if (/\([sx][-+]\d+\)\^\{2\}=-/.test(q)) return true;
      const Q = quad(q); return !!Q && Math.abs(Q.b) < 1e-12 && Q.c / Q.a > 0;
    },
    steps: {
      // x^2+a=0・x^2=-a
      s1(r) {
        const a = r.pick(A51), t = turn(r, '51s1', 2);
        return { q: t ? `$x^{2}=-${a}$` : `$x^{2}+${a}=0$`, a: `$x=\\pm ${imT(a)}$`, key: `a${a}`, easy: `$x^{2}=-${a}$。2乗して $-${a}$ になる数は $\\pm ${imT(a)}$`, easyCheck: false, verify: p => eqVerify(p, 2) };
      },
      // √(-a)×√(-b)・√(-a)×√b・√(-a)÷√(-b)
      s2(r) {
        const t = turn(r, '51s2', 3);
        if (t === 2) {
          const [a, b] = r.pick([[12, 3], [8, 2], [18, 2], [20, 5], [27, 3], [16, 4], [48, 3], [50, 2], [45, 5], [28, 7], [36, 4], [32, 2]]), k = Math.round(Math.sqrt(a / b));
          return { q: `$\\frac{\\sqrt{-${a}}}{\\sqrt{-${b}}}$`, a: `$${k}$`, key: `d|${a}|${b}`, easy: `$\\frac{\\sqrt{${a}}\\,j}{\\sqrt{${b}}\\,j}=\\sqrt{\\frac{${a}}{${b}}}=${k}$` };
        }
        let [a, b] = r.pick(t === 0 ? [[1, 4], [1, 16], [2, 8], [3, 12], [2, 18], [3, 27], [4, 16], [5, 20], [9, 16], [4, 25], [6, 24], [8, 18], [1, 25], [9, 25], [2, 3], [2, 5], [3, 5]] : [[6, 6], [2, 8], [3, 12], [4, 25], [2, 3], [5, 20], [16, 25], [3, 27]]);
        if (r.chance(0.5)) [a, b] = [b, a];
        if (t === 0) {
          if ((a === 4 && b === 9) || (a === 9 && b === 4)) return null;   // 左ページの例（O-2）
          const A = `-${sqrtT(a * b)}`;
          return { q: `$\\sqrt{-${a}}\\times\\sqrt{-${b}}$`, a: `$${A}$`, key: `m|${Math.min(a, b)}|${Math.max(a, b)}`, easy: `$\\sqrt{${a}}\\,j\\times\\sqrt{${b}}\\,j=\\sqrt{${a * b}}\\,j^{2}=${A}$` };
        }
        const A = imT(a * b);
        return { q: `$\\sqrt{-${a}}\\times\\sqrt{${b}}$`, a: `$${A}$`, key: `n|${a}|${b}`, easy: `$\\sqrt{${a}}\\,j\\times\\sqrt{${b}}=\\sqrt{${a * b}}\\,j=${A}$` };
      },
      // kx^2+ka=0・x^2+c=d・(x-p)^2=-a
      s3(r) {
        const t = turn(r, '51s3', 3), a = r.pick(A51.filter(x => x <= 25));
        if (t === 0) {
          const k = r.int(2, 5);
          return { q: `$${k}x^{2}+${k * a}=0$`, a: `$x=\\pm ${imT(a)}$`, key: `a${a}`, easy: `両辺を${k}でわって $x^{2}=-${a}$`, easyCheck: false, verify: p => eqVerify(p, 2) };
        }
        if (t === 1) {
          const d = r.int(1, 9), c = a + d;
          return { q: `$x^{2}+${c}=${d}$`, a: `$x=\\pm ${imT(a)}$`, key: `a${a}`, easy: `$x^{2}=${d}-${c}=-${a}$`, easyCheck: false, verify: p => eqVerify(p, 2) };
        }
        const pp = r.intNot(-4, 4, v => v === 0);
        return { q: `$(x${pp > 0 ? '-' : '+'}${Math.abs(pp)})^{2}=-${a}$`, a: `$x=${pp}\\pm ${imT(a)}$`, key: `s|${pp}|${a}`, easy: `$x${pp > 0 ? '-' : '+'}${Math.abs(pp)}=\\pm ${imT(a)}$`, easyCheck: false, verify: p => eqVerify(p, 2) };
      },
      // わな：x の1次の項がある2次方程式（6-52）
      trap(r) {
        const h = r.intNot(-4, 4, v => v === 0), m = r.int(1, 5), b = 2 * h, c = h * h + m * m;
        return dest({ q: `$${qT(1, b, c, 'x')}=0$`, a: solveQ(1, b, c, 'x').tex, key: `t|${b}|${c}`, verify: p => eqVerify(p, 2) }, '6-51', `$x$ の1次の項（$${b > 0 ? '' : '-'}${Math.abs(b)}x$）があるので、$x^2=-a$ の形ではない`);
      },
    },
  });

  // ================================================================ 6-52
  M.add({
    id: '6-52', part: 4, chap: '6-8⑨ 例題7', stars: 1,
    title: '$s^2+bs+c=0$（$D<0$）の解は $-\\frac b2\\pm\\sqrt{c-\\bigl(\\frac b2\\bigr)^2}\\,j$（和 $-b$、積 $c$ で確かめる）',
    mark: '$s^2$ の係数が1で、判別式が負の2次方程式。',
    futsu: ['解の公式に $a=1$、$b=6$、$c=13$ を入れ、', '$s=\\frac{-6\\pm\\sqrt{36-52}}{2}$', '$=\\frac{-6\\pm\\sqrt{-16}}{2}=\\frac{-6\\pm4j}{2}$', 'と計算して、分子を2でわる。'],
    raku: ['実部：$-\\frac62=-3$', '虚部：$\\sqrt{13-3^2}=\\sqrt4=2$', '$s=-3\\pm2j$（和 $-6$、積 $9+4=13$）'],
    why: '平方完成（3-8）で $s^2+bs+c=\\bigl(s+\\frac b2\\bigr)^2+c-\\bigl(\\frac b2\\bigr)^2$。$D<0$ なら $c-\\bigl(\\frac b2\\bigr)^2$ は正なので、$s+\\frac b2=\\pm\\sqrt{c-\\bigl(\\frac b2\\bigr)^2}\\,j$（6-8⑨の方法2）。2つの解は共役な組で、和は $-b$、積は $c$。',
    caution: '実部は $-\\frac b2$（$b$ の符号を変えて半分）：$s^2-4s+13=0$ なら実部は $+2$。$\\sqrt{\\phantom{a}}$ の中は $c-\\bigl(\\frac b2\\bigr)^2$ で、$\\bigl(\\frac b2\\bigr)^2-c$ ではない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '34mm', s3: '60mm', trap: '30mm' }, boxh: { s2: '12mm' },
    fits(q) {
      if (/判別式|種類|たすと|かけると/.test(q)) return false;
      const Q = quad(q); return !!Q && Math.abs(Q.b) > 1e-12 && Q.D < 0;
    },
    steps: {
      // b が偶数、虚部が整数
      s1(r) {
        const h = r.intNot(-5, 5, v => v === 0), m = r.int(1, 6), b = 2 * h, c = h * h + m * m;
        if (b === 6 && c === 13) return null;   // 左ページの例（O-2）
        return { q: `$${qT(1, b, c)}=0$`, a: solveQ(1, b, c).tex, key: `${b}|${c}`, easy: `実部 $${-h}$、虚部 $\\sqrt{${c}-${h * h}}=${m}$`, easyCheck: false, verify: p => eqVerify(p, 2) };
      },
      // b が奇数（分数）・虚部が √
      s2(r) {
        let b, c;
        if (turn(r, '52s2', 2)) { b = r.pick([1, 3, 5, -1, -3, -5]); c = Math.ceil((b * b + 1) / 4) + r.int(0, 5); }
        else { const h = r.intNot(-4, 4, v => v === 0); b = 2 * h; c = h * h + r.pick([2, 3, 5, 6, 7, 8, 10, 12]); }
        const Sq = solveQ(1, b, c), [k, m] = sqf(4 * c - b * b), im = stex(S(0, fr(k, 2), m));
        const easy = b % 2 ? `実部 $${F.tex(fr(-b, 2))}$、虚部 $\\sqrt{${c}-\\frac{${b * b}}{4}}=${im}$` : `実部 $${-b / 2}$、虚部 $\\sqrt{${c}-${b * b / 4}}=${im}$`;
        return { q: `$${qT(1, b, c)}=0$`, a: Sq.tex, key: `${b}|${c}`, easy, easyCheck: false, verify: p => eqVerify(p, 2) };
      },
      // s^2 の係数が1でない・和と積も・移項してある
      s3(r) {
        const t = turn(r, '52s3', 3), h = r.intNot(-4, 4, v => v === 0), m = r.int(1, 5), b = 2 * h, c = h * h + m * m;
        if (b === 6 && c === 13) return null;
        const Sq = solveQ(1, b, c);
        if (t === 0) {
          const k = r.int(2, 3);
          return { q: `$${qT(k, k * b, k * c)}=0$`, a: Sq.tex, key: `${b}|${c}`, easy: `両辺を${k}でわって $${qT(1, b, c)}=0$`, easyCheck: false, verify: p => eqVerify(p, 2) };
        }
        if (t === 1) {
          return {
            q: `$${qT(1, b, c)}=0$ の解と、2つの解の和・積`, a: `${Sq.tex}、和 $${-b}$、積 $${c}$`, key: `${b}|${c}`, easy: `和は $s$ の係数の符号を変えた $${-b}$、積は $${c}$`, easyCheck: false,
            verify: p => { const e = eqVerify({ q: p.q, a: maths(p.a)[0] ? `$${maths(p.a)[0]}$` : '' }, 2); if (e !== true) return e; const rs = rootsFrom(`$${maths(p.a)[0]}$`), n = maths(p.a).slice(1).map(x => M.evalMath(x, {})); return (close(rs[0][0] + rs[1][0], n[0]) && close(cmul(rs[0], rs[1])[0], n[1])) || '和・積がちがう'; },
          };
        }
        return { q: `$s^{2}${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}s=-${c}$`, a: Sq.tex, key: `${b}|${c}`, easy: `移項して $${qT(1, b, c)}=0$`, easyCheck: false, verify: p => eqVerify(p, 2) };
      },
      // わな：D>0（実数の解。6-53）
      trap(r) {
        const r1 = r.intNot(-6, 3, v => v === 0), r2 = r.intNot(-6, 3, v => v === 0); if (r1 === r2 || r1 + r2 === 0) return null;
        const b = -(r1 + r2), c = r1 * r2, D = b * b - 4 * c;
        return dest({ q: `$${qT(1, b, c)}=0$`, a: solveQ(1, b, c).tex, key: `t|${b}|${c}`, verify: p => eqVerify(p, 2) }, '6-52', `判別式 $D=${D}$ が正なので、$\\sqrt{\\phantom{D}}$ の中が負にならない（実数の解が2つ）`);
      },
    },
  });

  // ================================================================ 6-53
  // 答え：$D=…$、種類、解
  const ans53 = (a, b, c) => { const Sq = solveQ(a, b, c); return `$D=${Sq.D}$、${Sq.kind}、${Sq.tex}`; };
  function verify53(p) {
    const Q = quad(p.q); if (!Q) return '方程式が読めない';
    const ms = maths(p.a), d = /^D=(.*)$/.exec(ms[0] || ''); if (!d || !close(M.evalMath(d[1], {}), Q.D)) return '判別式がちがう';
    const kind = Q.D > 0 ? '実数の解2つ' : Q.D === 0 ? '実数の解1つ' : '虚数の解2つ';
    if (!p.a.includes(kind)) return `解の種類が「${kind}」でない`;
    return eqVerify(p, Q.D === 0 ? 1 : 2);
  }
  M.add({
    id: '6-53', part: 4, chap: '6-8⑨ 例題8', stars: 1,
    title: '判別式の符号で、解の種類が先にわかる（$D>0$ 実数の解2つ、$D=0$ 1つ、$D<0$ 虚数の解2つ）',
    mark: '「判別式を求め、解の種類を答えてから解く」2次方程式。',
    futsu: ['いきなり解の公式に入れて、', '$\\sqrt{\\phantom{D}}$ の中を計算してから、', '実数か虚数かを考え、', '因数分解できたかも見なおす。'],
    raku: ['先に $D=b^2-4ac$ の符号を見る', '$D>0$：因数分解か解の公式で2つ', '$D=0$：$\\bigl(s+\\frac{b}{2a}\\bigr)^2=0$ で1つ', '$D<0$：$-\\frac{b}{2a}\\pm\\square j$ の2つ'],
    why: '解の公式 $\\frac{-b\\pm\\sqrt D}{2a}$ の $\\sqrt D$ が、$D>0$ なら実数で解は2つ、$D=0$ なら0で解は1つ（重なった解）、$D<0$ なら純虚数 $\\sqrt{-D}\\,j$ で、解は共役な組の2つ（6-8⑨の表）。',
    caution: '$D=b^2-4ac$ の $4ac$ を忘れない（$c$ が負なら $D$ はふえる）。$D=0$ の解は1つ（2つ書かない）。$D>0$ でも、因数分解できないときは $\\sqrt{\\phantom{D}}$ が残る。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '72mm', s2: '72mm', s3: '72mm', trap: '40mm' }, boxh: '12mm',
    fits(q) { const Q = quad(q); return !!Q && (/判別式|種類/.test(q) || Q.D >= 0); },
    steps: {
      // s^2 の係数が1：実数の解2つ・1つ・虚数の解2つ
      s1(r) {
        const t = turn(r, '53s1', 3); let b, c;
        if (t === 0) { const r1 = r.intNot(-6, 4, v => v === 0), r2 = r.intNot(-6, 4, v => v === 0); if (r1 === r2 || r1 + r2 === 0) return null; b = -(r1 + r2); c = r1 * r2; }
        else if (t === 1) { const k = r.intNot(-6, 6, v => v === 0); b = -2 * k; c = k * k; }
        else { const h = r.intNot(-5, 5, v => v === 0), m = r.int(1, 5); b = 2 * h; c = h * h + m * m; }
        return { q: `$${qT(1, b, c)}=0$ の $D$、解の種類、解`, a: ans53(1, b, c), key: `1|${b}|${c}`, easy: dT(1, b, c), easyCheck: false, verify: verify53 };
      },
      // s^2 の係数が1でない・√ が残る
      s2(r) {
        const t = turn(r, '53s2', 4); let a, b, c;
        if (t === 0) {
          const p1 = r.int(1, 3), p2 = r.int(1, 3), q1 = r.intNot(-4, 4, v => v === 0), q2 = r.intNot(-4, 4, v => v === 0);
          if (p1 * p2 === 1 || p1 * q2 === p2 * q1) return null;
          a = p1 * p2; b = p1 * q2 + q1 * p2; c = q1 * q2;
        } else if (t === 1) { const p1 = r.int(2, 3), q1 = r.intNot(-3, 3, v => v === 0); if (gcd(p1, q1) !== 1) return null; a = p1 * p1; b = 2 * p1 * q1; c = q1 * q1; }
        else if (t === 2) { a = r.int(2, 4); b = r.intNot(-6, 6, v => v === 0); c = r.int(1, 6); if (b * b - 4 * a * c >= 0) return null; }
        else { a = 1; b = r.intNot(-6, 6, v => v === 0); c = r.intNot(-5, 5, v => v === 0); const D = b * b - 4 * c; if (D <= 0 || Number.isInteger(Math.sqrt(D))) return null; }
        if (gcd(gcd(a, b), c) !== 1) return null;
        return { q: `$${qT(a, b, c)}=0$ の $D$、解の種類、解`, a: ans53(a, b, c), key: `${a}|${b}|${c}`, easy: dT(a, b, c), easyCheck: false, verify: verify53 };
      },
      // 移項してある・かっこがある形
      s3(r) {
        const t = turn(r, '53s3', 3), k = r.int(0, 2); let b, c;
        if (k === 0) { const r1 = r.intNot(-5, 4, v => v === 0), r2 = r.intNot(-5, 4, v => v === 0); if (r1 === r2 || r1 + r2 === 0) return null; b = -(r1 + r2); c = r1 * r2; }
        else if (k === 1) { const h = r.intNot(-5, 5, v => v === 0); b = -2 * h; c = h * h; }
        else { const h = r.intNot(-4, 4, v => v === 0), m = r.int(1, 4); b = 2 * h; c = h * h + m * m; }
        const cT = x => (x > 0 ? `+${x}` : x < 0 ? `-${-x}` : '');
        const sT = x => (x === 1 ? 's' : x === -1 ? '-s' : `${x}s`);
        let q;
        if (t === 0) { if (!c) return null; q = `$s^{2}${cT(c)}=${sT(-b)}$`; }
        else if (t === 1) q = `$s(s${b > 0 ? '+' : '-'}${Math.abs(b)})=${-c}$`;
        else { if (!c) return null; q = `$s^{2}=${sT(-b)}${cT(-c)}$`; }
        return { q: `${q} の $D$、解の種類、解`, a: ans53(1, b, c), key: `1|${b}|${c}`, easy: `移項して $${qT(1, b, c)}=0$。${dT(1, b, c)}`, easyCheck: false, verify: verify53 };
      },
      // わな：方程式ではなく「たすと…、かけると…になる2つの数」（6-54）
      trap(r) {
        const k = r.int(1, 4), m = r.int(1, 4), p = 2 * k, q = k * k + m * m;
        if (p === 6 && q === 13) return null;
        return dest({ q: `たすと $${p}$、かけると $${q}$ になる2つの数`, a: `$${zt(k, m)}$ と $${zt(k, -m)}$`, key: `t|${p}|${q}`, verify: pairVerify }, '6-53', '2次方程式が書かれていない。2つの数をさがす問題');
      },
    },
  });

  // ================================================================ 6-54
  const ab54 = (re, im) => [ztex({ re, im }), ztex({ re, im: sNeg(im) })];
  M.add({
    id: '6-54', part: 4, chap: '6-8⑨ 例題9', stars: 1,
    title: '和と積から2つの数：たすと $p$、かけると $q$ なら $x^2-px+q=0$ を解く',
    mark: '「たすと□、かけると□になる2つの数」。',
    futsu: ['1つの数を $x$、もう1つを $6-x$ として、', '$x(6-x)=13$ を展開し、', '移項して2次方程式の形にしてから', '解の公式で解く。'],
    raku: ['和6、積13 → $x^2-6x+13=0$', '$x=3\\pm\\sqrt{13-9}\\,j=3\\pm2j$', '2つの数は $3+2j$ と $3-2j$'],
    why: '2つの数を $\\alpha$、$\\beta$ とすると、$(x-\\alpha)(x-\\beta)=x^2-(\\alpha+\\beta)x+\\alpha\\beta$ なので、$\\alpha$、$\\beta$ は $x^2-(\\alpha+\\beta)x+\\alpha\\beta=0$ の解（3-10・6-8⑨）。和と積がわかれば、すぐにこの2次方程式が書ける。',
    caution: '$x$ の係数は、和の符号を変えたもの（和が6なら $-6x$）。答えは2つの数を両方書き、和と積で確かめる。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '48mm', s3: '48mm', trap: '30mm' }, boxh: { s2: '12mm' },
    fits(q) { return (/たすと/.test(q) && /かけると/.test(q)) || (/\\alpha\+\\beta=/.test(q) && /\\alpha\\beta=/.test(q)); },
    steps: {
      s1(r) {
        const k = r.int(1, 6), m = r.int(1, 6), p = 2 * k, q = k * k + m * m;
        if (p === 6 && q === 13) return null;   // 左ページの例（O-2）
        const [u, v] = ab54(S(k), S(m));
        return { q: `たすと $${p}$、かけると $${q}$ になる2つの数`, a: `$${u}$ と $${v}$`, key: `${p}|${q}`, easy: `$x^{2}-${p}x+${q}=0$ の解。$x=${k}\\pm ${jterm(S(m))}$`, easyCheck: false, verify: pairVerify };
      },
      // 実数の2つ・√ が残る・和が奇数
      s2(r) {
        const t = turn(r, '54s2', 3); let p, q, a;
        if (t === 0) { const x = r.int(1, 9), y = r.int(1, 9); if (x >= y) return null; p = x + y; q = x * y; a = `$${x}$ と $${y}$`; }
        else if (t === 1) { const k = r.int(1, 6); p = 2 * k; const m = r.pick([2, 3, 5, 6, 7, 10, 11, 15]); q = k * k + m; const [u, v] = ab54(S(k), sRoot(m)); a = `$${u}$ と $${v}$`; }
        else { p = r.pick([1, 3, 5, 7, 9]); q = Math.ceil((p * p + 1) / 4) + r.int(0, 4); const [kk, mm] = sqf(4 * q - p * p), [u, v] = ab54(S(fr(p, 2)), S(0, fr(kk, 2), mm)); a = `$${u}$ と $${v}$`; }
        return { q: `たすと $${p}$、かけると $${q}$ になる2つの数`, a, key: `${p}|${q}`, easy: `$${qT(1, -p, q, 'x')}=0$ を解く`, easyCheck: false, verify: pairVerify };
      },
      // 和が負・α、β の式で
      s3(r) {
        const k = r.intNot(-5, 5, v => v === 0), m = r.int(1, 5), p = 2 * k, q = k * k + m * m;
        if (p === 6 && q === 13) return null;
        const [u, v] = ab54(S(k), S(m));
        if (turn(r, '54s3', 2)) {
          if (p > 0) return null;
          return { q: `たすと $${p}$、かけると $${q}$ になる2つの数`, a: `$${u}$ と $${v}$`, key: `${p}|${q}`, easy: `$x^{2}+${-p}x+${q}=0$ の解（和が負なので $+${-p}x$）`, easyCheck: false, verify: pairVerify };
        }
        return { q: `$\\alpha+\\beta=${p}$、$\\alpha\\beta=${q}$ をみたす2つの数 $\\alpha$、$\\beta$`, a: `$${u}$ と $${v}$`, key: `${p}|${q}`, easy: `$${qT(1, -p, q, 'x')}=0$ の解`, easyCheck: false, verify: pairVerify };
      },
      // わな：積ではなく差（わざなし）
      trap(r) {
        const x = r.int(2, 9), y = r.int(1, 8); if (x <= y) return null;
        return dest({
          q: `たすと $${x + y}$、ひくと $${x - y}$ になる2つの数`, a: `$${x}$ と $${y}$`, key: `t|${x}|${y}`,
          verify: p => { const n = maths(p.q).map(Number), a = maths(p.a).map(Number); return (a[0] + a[1] === n[0] && a[0] - a[1] === n[1]) || '和・差がちがう'; },
        }, '6-54', `積ではなく差。$x+y=${x + y}$、$x-y=${x - y}$ の連立方程式で解く`);
      },
    },
  });

  // ================================================================ 6-55
  // 特別な角の点：{ z, rS, d }
  function spPoint(r) {
    const t = r.int(0, 3); let d, rS;
    if (t === 0) { d = r.pick([90, -90, 180]); rS = S(r.int(1, 6)); }
    else if (t === 1) { d = r.pick([45, 135, -45, -135]); rS = S(0, r.int(1, 4), 2); }
    else { d = r.pick(t === 2 ? [60, 120, -60, -120] : [30, 150, -30, -150]); rS = S(2 * r.int(1, 3)); }
    return { z: zSc(rS, cs(d)), rS, d };
  }
  // 偏角の求め方（楽な形の文）
  function argHow(d) {
    if (d === 90) return '虚軸の上（上向き）なので $90^{\\circ}$';
    if (d === -90) return '虚軸の上（下向き）なので $-90^{\\circ}$';
    if (d === 180) return '負の実数なので $180^{\\circ}$';
    if (d === 0) return '正の実数なので $0^{\\circ}$';
    if (Math.abs(d) < 90) return `右${d > 0 ? '上' : '下'}なので $\\tan^{-1}$ のまま $${dg(d)}$`;
    return d > 0 ? `左上なので $${dg(d - 180)}+180^{\\circ}=${dg(d)}$` : `左下なので $${dg(d + 180)}-180^{\\circ}=${dg(d)}$`;
  }
  const absHow = z => `$\\sqrt{${stex(sMul(z.re, z.re))}+${stex(sMul(z.im, z.im))}}=${stex(sAdd(sMul(z.re, z.re), sMul(z.im, z.im)).p[1] === 1 ? sRoot(F.val(sAdd(sMul(z.re, z.re), sMul(z.im, z.im)).p)) : S(0))}$`;
  // 絶対値と偏角の答え（$r$、$θ^{\circ}$。約がつけば小数第1位まで）が、値 v に合うか
  function absArgOK(a, v, only) {
    const ms = maths(a), m = /(-?[\d.]+)\^\{\\circ\}/.exec(ms[ms.length - 1] || ''); if (!m) return `答え ${a} の偏角が読めない`;
    if (!only) { const r = M.evalMath(ms[0], {}); if (!close(r, Math.hypot(v[0], v[1]))) return `絶対値 ${ms[0]} がちがう`; }
    const tru = Math.atan2(v[1], v[0]) * 180 / Math.PI, d = +m[1];
    if (!(d > -180 && d <= 180)) return '偏角が -180°<θ≦180° でない';
    if (/約/.test(a)) return Math.abs(Math.round(tru * 10) / 10 - d) < 1e-9 || `偏角 ${d} が ${tru.toFixed(3)} を丸めた値でない`;
    return close(d, tru) || `偏角 ${d} が ${tru} でない`;
  }
  // 偏角の問題（tan^{-1} の値を文に書く。左ページの例とちがう数）
  const ARGP = [[3, 4], [4, 3], [5, 12], [12, 5], [6, 8], [8, 6], [8, 15], [15, 8], [1, 2], [2, 1], [1, 3], [3, 1]];
  const f1 = v => v.toFixed(1);
  function argProb(r) {
    const [pp, qq] = r.pick(ARGP), sa = r.pick([1, -1]), sb = r.pick([1, -1]), a = sa * pp, b = sb * qq;
    const t1 = Math.round(Math.atan(b / a) * 1800 / Math.PI) / 10;
    let ans = a > 0 ? t1 : b > 0 ? t1 + 180 : t1 - 180; ans = Math.round(ans * 10) / 10;
    if (Math.abs(ans - Math.round(Math.atan2(b, a) * 1800 / Math.PI) / 10) > 1e-9) return null;   // 文の値で計算した答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4）
    const g = gcd(pp, qq), nn = qq / g, dd = pp / g, ft = dd === 1 ? `${nn}` : `\\frac{${nn}}{${dd}}`;
    const inT = sa * sb < 0 ? (dd === 1 ? `(-${nn})` : `\\Bigl(-${ft}\\Bigr)`) : ft;
    const where = a > 0 ? `右${b > 0 ? '上' : '下'}なので、そのまま` : `左${b > 0 ? '上' : '下'}なので、$${f1(t1)}^{\\circ}${b > 0 ? '+' : '-'}180^{\\circ}$`;
    return { a, b, given: `$\\tan^{-1}${inT}\\approx${f1(t1)}^{\\circ}$`, ans: f1(ans), rT: sqrtT(pp * pp + qq * qq), where, absT: `$\\sqrt{${pp * pp}+${qq * qq}}=${sqrtT(pp * pp + qq * qq)}$` };
  }
  // 2つの点の距離（差がピタゴラス数）
  const TRI = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13]];
  function distVerify(p) {
    const ms = maths(p.q).map(t => t.replace(/^[a-z](_\{?\d\}?)?=/, '')), u = evC(ms[0]), v = evC(ms[1]);
    if (!u || !v) return '2つの数が読めない';
    return close(M.evalMath(maths(p.a)[0], {}), Math.hypot(u[0] - v[0], u[1] - v[1])) || '距離がちがう';
  }
  // 原点・点・矢印・角の弧の図
  function argFig(z, d) {
    const v = zVal(z), G = plane([v]), P = G.T(...v), L = Math.hypot(...P);
    return { s: 5, items: [...G.axes({}), ['seg', [0, 0], P, { arrow: true, thick: true }], ['dot', P], ['label', P, `$${ztex(z)}$`, dirOf(...v)], ...angArc(d, Math.min(0.9, 0.45 * L), '$\\theta$')] };
  }
  M.add({
    id: '6-55', part: 4, chap: '6-9③④ 例題1', stars: 1,
    title: '絶対値と偏角：区画を見てから $\\tan^{-1}$ を直す（左上は $+180^{\\circ}$、左下は $-180^{\\circ}$）',
    mark: '「絶対値と偏角」（偏角は $-180^{\\circ}<\\theta\\leqq180^{\\circ}$）。',
    futsu: ['$\\cos\\theta=\\frac ar$、$\\sin\\theta=\\frac br$ の', '両方をみたす角を、', '$-180^{\\circ}$ から $180^{\\circ}$ まで', '1つずつさがす。'],
    raku: ['$-1+\\sqrt3\\,j$：$\\sqrt{1+3}=2$', '左上。$\\tan^{-1}(-\\sqrt3)=-60^{\\circ}$', '$-60^{\\circ}+180^{\\circ}=120^{\\circ}$'],
    why: '絶対値は原点からの距離なので、三平方の定理で $\\sqrt{a^2+b^2}$（6-9③）。$\\tan^{-1}$ は右半分（$-90^{\\circ}$〜$90^{\\circ}$）の角しか答えないので、左半分の点は180°ずらす（6-9④の表）。',
    caution: '$-1-j$ の偏角は45°ではなく $-135^{\\circ}$。絶対値に $j$ を入れない（$\\sqrt{9+(4j)^2}$ はまちがい）。虚軸の上の点（$a=0$）は90°か $-90^{\\circ}$。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '30mm', s3: '28mm', trap: '16mm' },
    fits(q) { return /絶対値|偏角/.test(q) && !/距離|回した|極形式|\\cos/.test(q); },
    steps: {
      // 特別な角の点
      s1(r) {
        const P = spPoint(r), rT = stex(P.rS); if (rT === '2' && P.d === 120) return null;   // 左ページの例（O-2）
        return {
          q: `$${ztex(P.z)}$ の絶対値と偏角`, a: `$${rT}$、$${dg(P.d)}$`, key: `${rT}|${P.d}`, easy: `${absHow(P.z)}。${argHow(P.d)}`, easyCheck: false,
          verify: p => absArgOK(p.a, evC(maths(p.q)[0])),
        };
      },
      // tan^{-1} の値を文に書く点（約 □°）
      s2(r) {
        const A = argProb(r); if (!A) return null;
        return {
          q: `$${zt(A.a, A.b)}$ の絶対値と偏角（${A.given} を使い、偏角は小数第1位まで）`, a: `$${A.rT}$、約 $${A.ans}^{\\circ}$`, key: `${A.a}|${A.b}`,
          easy: `${A.absT}。${A.where}`, easyCheck: false, verify: p => absArgOK(p.a, evC(maths(p.q)[0])),
        };
      },
      // 図の点・-z と \bar z
      s3(r) {
        const P = spPoint(r);
        if (turn(r, '55s3', 2)) {
          const rT = stex(P.rS); if (rT === '2' && P.d === 120) return null;
          return {
            q: `図の点 $z=${ztex(P.z)}$ の絶対値と偏角 $\\theta$`, a: `$${rT}$、$${dg(P.d)}$`, fig: argFig(P.z, P.d), key: `${rT}|${P.d}`, easy: `${absHow(P.z)}。${argHow(P.d)}`, easyCheck: false,
            verify: p => absArgOK(p.a, evC(defs(p.q).z)),
          };
        }
        const bar = r.chance(0.5), w = bar ? { re: P.z.re, im: sNeg(P.z.im) } : zSc(S(-1), P.z), d = bar ? nd(-P.d) : nd(P.d + 180), rT = stex(P.rS);
        if (rT === '2' && d === 120) return null;
        if (bar ? P.d <= 0 || P.d === 180 : Math.abs(P.d) >= 90) return null;   // z と答えの数を入れかえた問題が、同じ見開きに出ないように（-z は右半分の z、\bar z は上半分の z だけ）
        const op = bar ? '\\bar z' : '-z';
        return {
          q: `$z=${ztex(P.z)}$ のとき、$${op}$ の絶対値と偏角`, a: `$${rT}$、$${dg(d)}$`, key: `${rT}|${d}`, easy: `$${op}=${ztex(w)}$。${argHow(d)}`, easyCheck: false,
          verify: p => absArgOK(p.a, evC(op, { z: evC(defs(p.q).z) })),
        };
      },
      // わな：2つの点の距離（6-56）
      trap(r) {
        const [dx, dy, L] = r.pick(TRI), u = [r.int(-4, 4), r.int(-4, 4)], v = [u[0] + r.pick([1, -1]) * dx, u[1] + r.pick([1, -1]) * dy];
        if ((u[0] === 0 && u[1] === 0) || Math.abs(v[0]) > 12 || Math.abs(v[1]) > 12) return null;
        return dest({ q: `$${zt(...u)}$ と $${zt(...v)}$ の2つの点の距離`, a: `$${L}$`, key: `t|${[zt(...u), zt(...v)].sort().join('|')}`, verify: distVerify }, '6-55', '1つの数の絶対値・偏角ではなく、2つの点の距離（差の絶対値）');
      },
    },
  });

  // ================================================================ 6-56
  // 左ページの例：1+j と 4+5j（O-2）
  const key56 = (u, v) => [zt(...u), zt(...v)].sort().join('|');   // 2つの点は入れかえても同じ問題（N-2）
  const ex56 = (u, v) => key56(u, v) === key56([1, 1], [4, 5]);
  const TRI56 = TRI.concat([[9, 12, 15], [12, 9, 15], [8, 15, 17], [15, 8, 17]]);
  // 2つの点（整数）。tri なら差がピタゴラス数（距離が整数）、そうでなければ √ が残る
  function pts56(r, tri) {
    let d;
    if (tri) { const [dx, dy] = r.pick(TRI56); d =[r.pick([1, -1]) * dx, r.pick([1, -1]) * dy]; }
    else { d = [r.intNot(-6, 6, v => v === 0), r.intNot(-6, 6, v => v === 0)]; if (Number.isInteger(Math.sqrt(d[0] * d[0] + d[1] * d[1]))) return null; }
    const u = [r.int(-5, 5), r.int(-5, 5)], v = [u[0] + d[0], u[1] + d[1]];
    if (Math.abs(v[0]) > 12 || Math.abs(v[1]) > 12) return null;
    if ((u[0] === 0 && u[1] === 0) || (v[0] === 0 && v[1] === 0) || ex56(u, v)) return null;   // 原点があると、絶対値の問題になる
    return { u, v, d, L2: d[0] * d[0] + d[1] * d[1] };
  }
  const rootHow = d => `$\\sqrt{${d[0] * d[0]}+${d[1] * d[1]}}=${sqrtT(d[0] * d[0] + d[1] * d[1])}$`;
  // 2つの点と、点 z_1 から点 z_2 への矢印の図
  function distFig(u, v) {
    const G = plane([u, v]), A = G.T(...u), B = G.T(...v);
    return { s: 5, items: [...G.axes({}), ['seg', A, B, { arrow: true, thick: true }], ['dot', A], ['dot', B],
      ['label', A, '$z_1$', dirOf(u[0] - v[0], u[1] - v[1])], ['label', B, '$z_2$', dirOf(v[0] - u[0], v[1] - u[1])]] };
  }
  M.add({
    id: '6-56', part: 4, chap: '6-9②③ 例題2', stars: 1,
    title: '2つの点の距離は、差の絶対値 $\\lvert z_2-z_1\\rvert$',
    mark: '2つの複素数と「2つの点の距離」。',
    futsu: ['2つの点 $(1,\\ 1)$ と $(4,\\ 5)$ を', '方眼にかいて、直角三角形を作り、', '横とたての長さを数えてから', '三平方の定理を使う。'],
    raku: ['$1+j$ と $4+5j$', '差 $(4+5j)-(1+j)=3+4j$', '距離 $\\lvert3+4j\\rvert=\\sqrt{9+16}=5$'],
    why: '$z_2-z_1$ は「$z_1$ に何をたすと $z_2$ になるか」なので、点 $z_1$ から点 $z_2$ へ向かう矢印（6-9②）。その長さが2つの点の距離で、長さは絶対値 $\\sqrt{a^2+b^2}$（6-9③）。どちらからどちらをひいても、長さは同じ。',
    caution: '差の実部・虚部が負の数でも、2乗するので正（$\\lvert-3-4j\\rvert=5$）。$\\lvert z_2\\rvert-\\lvert z_1\\rvert$（原点からの距離の差）とはちがう。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '20mm', s3: '24mm', trap: '24mm' },
    fits(q) {
      if (/距離/.test(q)) return !/回した|回すと|折り返/.test(q);
      return maths(q).some(m => /\\lvert\s*[zw](_\{?\d\}?)?\s*-\s*[zw]/.test(m));
    },
    steps: {
      // 距離が整数
      s1(r) {
        const P = pts56(r, true); if (!P) return null;
        return {
          q: `$${zt(...P.u)}$ と $${zt(...P.v)}$ の2つの点の距離`, a: `$${sqrtT(P.L2)}$`, key: key56(P.u, P.v),
          easy: `差は $${zt(...P.d)}$。${rootHow(P.d)}`, easyCheck: 'last', verify: distVerify,
        };
      },
      // √ が残る・|z-w| の形
      s2(r) {
        const P = pts56(r, false); if (!P) return null;
        if (turn(r, '56s2', 2)) {
          return {
            q: `$z=${zt(...P.v)}$、$w=${zt(...P.u)}$ のとき、$\\lvert z-w\\rvert$`, a: `$${sqrtT(P.L2)}$`, key: key56(P.u, P.v),
            easy: `$z-w=${zt(...P.d)}$。${rootHow(P.d)}`, easyCheck: 'last', verify: distVerify,
          };
        }
        return {
          q: `$${zt(...P.u)}$ と $${zt(...P.v)}$ の2つの点の距離`, a: `$${sqrtT(P.L2)}$`, key: key56(P.u, P.v),
          easy: `差は $${zt(...P.d)}$。${rootHow(P.d)}`, easyCheck: 'last', verify: distVerify,
        };
      },
      // 図・和と差と距離（例題2の形）・z と jz、-z の距離
      s3(r) {
        const t = turn(r, '56s3', 3);
        if (t === 0) {
          // 図の問題は、ここで数を選びなおす（null を返すと turn が次の形に進み、図の問題が出なくなる）
          let P = null; for (let k = 0; k < 40 && !(P && P.L2 <= 100); k++) P = pts56(r, true);
          if (!P || P.L2 > 100) return null;
          return {
            q: `図の2つの点 $z_1=${zt(...P.u)}$、$z_2=${zt(...P.v)}$ の距離`, a: `$${sqrtT(P.L2)}$`, fig: distFig(P.u, P.v), key: key56(P.u, P.v),
            easy: `$z_2-z_1=${zt(...P.d)}$。${rootHow(P.d)}`, easyCheck: 'last', verify: distVerify,
          };
        }
        if (t === 1) {
          const P = pts56(r, r.chance(0.6)); if (!P) return null;
          const s = [P.u[0] + P.v[0], P.u[1] + P.v[1]]; if (s[0] === 0 && s[1] === 0) return null;
          return {
            q: `$z_1=${zt(...P.u)}$、$z_2=${zt(...P.v)}$ のとき、$z_1+z_2$、$z_2-z_1$、2つの点の距離（順に）`,
            a: `$${zt(...s)}$、$${zt(...P.d)}$、$${sqrtT(P.L2)}$`, key: key56(P.u, P.v),   // 答えの欄からはみ出さないように、値だけを順に
            easy: `距離は ${rootHow(P.d)}`, easyCheck: false,
            verify: p => {
              const D = defs(p.q), u = evC(D.z_1), v = evC(D.z_2), ms = maths(p.a).map(x => x.replace(/^.*=/, ''));
              if (!u || !v || ms.length !== 3) return '答えが読めない';
              if (!cclose(evC(ms[0]), [u[0] + v[0], u[1] + v[1]])) return '和がちがう';
              if (!cclose(evC(ms[1]), [v[0] - u[0], v[1] - u[1]])) return '差がちがう';
              return close(M.evalMath(ms[2], {}), Math.hypot(v[0] - u[0], v[1] - u[1])) || '距離がちがう';
            },
          };
        }
        const z = [r.intNot(-5, 5, v => v === 0), r.intNot(-5, 5, v => v === 0)], op = r.pick(['jz', '-z', '-jz']);
        const w = op === 'jz' ? zmul([0, 1], z) : op === '-z' ? [-z[0], -z[1]] : zmul([0, -1], z), d = [w[0] - z[0], w[1] - z[1]];
        return {
          q: `$z=${zt(...z)}$ のとき、点 $z$ と点 $${op}$ の距離`, a: `$${sqrtT(d[0] * d[0] + d[1] * d[1])}$`, key: `o|${op}|${zt(...z)}`,
          easy: `$${op}=${zt(...w)}$。差は $${zt(...d)}$。${rootHow(d)}`, easyCheck: 'last',
          verify: p => { const zz = evC(defs(p.q).z), ww = evC(op, { z: zz }); return close(M.evalMath(maths(p.a)[0], {}), Math.hypot(ww[0] - zz[0], ww[1] - zz[1])) || '距離がちがう'; },
        };
      },
      // わな：1つの数の偏角（6-55）
      trap(r) {
        if (turn(r, '56tr', 2)) {
          const P = spPoint(r); if (P.d === 90 || P.d === -90 || P.d === 180) return null;
          return dest({ q: `$${ztex(P.z)}$ の偏角`, a: `$${dg(P.d)}$`, key: `t|${ztex(P.z)}`, verify: p => absArgOK(p.a, evC(maths(p.q)[0]), true) },
            '6-56', '2つの点の距離ではなく、1つの数の偏角。区画を見て $\\tan^{-1}$ を直す');
        }
        const A = argProb(r); if (!A) return null;
        return dest({
          q: `$${zt(A.a, A.b)}$ の偏角（${A.given} を使い、小数第1位まで）`, a: `約 $${A.ans}^{\\circ}$`, key: `t|${zt(A.a, A.b)}`,
          verify: p => absArgOK(p.a, evC(maths(p.q)[0]), true),
        }, '6-56', '2つの点の距離ではなく、1つの数の偏角。区画を見て $\\tan^{-1}$ を直す');
      },
    },
  });

  // 偏角が特別な角で、絶対値が √2 か 2 の数（6-57 のわな・6-58・6-59）
  const R3 = S(0, 1, 3);
  const B59 = [[S(1), S(1), 45], [S(1), S(-1), -45], [S(-1), S(1), 135], [S(-1), S(-1), -135]].map(([a, b, d]) => ({ z: { re: a, im: b }, rS: S(0, 1, 2), rT: '\\sqrt2', d }))
    .concat([[S(1), R3, 60], [S(1), sNeg(R3), -60], [S(-1), R3, 120], [S(-1), sNeg(R3), -120], [R3, S(1), 30], [R3, S(-1), -30], [sNeg(R3), S(1), 150], [sNeg(R3), S(-1), -150]]
      .map(([a, b, d]) => ({ z: { re: a, im: b }, rS: S(2), rT: '2', d })));

  // ================================================================ 6-57
  const dgp = d => (d < 0 ? `(${dg(d)})` : dg(d));   // cos(-60°) のかっこ
  // 極形式の点：{ z, rS, rT, d }。a+bj がきれいになる r（30°の仲間は偶数、45°の仲間は √2 の倍数か偶数）
  const ANG = [30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90, -120, -135, -150];
  function polPoint(r, set) {
    const d = r.pick(set || ANG), u = ((d % 90) + 90) % 90;
    let rS;
    if (u === 45) rS = r.chance(0.5) ? S(0, r.int(1, 4), 2) : S(2 * r.int(1, 3));
    else if (u === 0) rS = S(r.int(1, 8));
    else rS = S(2 * r.int(1, 4));
    return { z: zSc(rS, cs(d)), rS, rT: stex(rS), d };
  }
  // 左ページの例：2(cos150°+j sin150°)=-√3+j、1+j=√2(cos45°+j sin45°)（O-2。どちら向きの問題にも出さない）
  const ex57 = (rT, d) => (rT === '2' && d === 150) || (rT === '\\sqrt2' && d === 45);
  M.add({
    id: '6-57', part: 4, chap: '6-9④ 例題3', stars: 1,
    title: '極形式 ⇄ $a+bj$：$a=r\\cos\\theta$、$b=r\\sin\\theta$（反対は、絶対値と偏角を求めて入れる）',
    mark: '$r(\\cos\\theta+j\\sin\\theta)$ と $a+bj$ の書きかえ。',
    futsu: ['$2(\\cos150^{\\circ}+j\\sin150^{\\circ})$ の点を', '複素平面にかいて、', '直角三角形の辺の長さを', '図から読みとる。'],
    raku: ['$\\cos150^{\\circ}=-\\frac{\\sqrt3}{2}$、$\\sin150^{\\circ}=\\frac12$', '$2\\Bigl(-\\frac{\\sqrt3}{2}+\\frac12j\\Bigr)=-\\sqrt3+j$', '反対：$1+j$ は $\\sqrt2$、$45^{\\circ}$', '$1+j=\\sqrt2(\\cos45^{\\circ}+j\\sin45^{\\circ})$'],
    why: '絶対値 $r$、偏角 $\\theta$ の点は、4-15の極座標と同じで $a=r\\cos\\theta$、$b=r\\sin\\theta$（6-9④）。だから $a+bj=r\\cos\\theta+jr\\sin\\theta=r(\\cos\\theta+j\\sin\\theta)$。反対に直すときは、$r=\\sqrt{a^2+b^2}$ と、区画を見て決めた偏角を入れる。',
    caution: '極形式の $r$ は正の数、偏角は $-180^{\\circ}<\\theta\\leqq180^{\\circ}$ で書く。$-3$ は $3(\\cos180^{\\circ}+j\\sin180^{\\circ})$ で、$-3(\\cos0^{\\circ}+j\\sin0^{\\circ})$ とは書かない。偏角が負なら $4\\{\\cos(-60^{\\circ})+j\\sin(-60^{\\circ})\\}$ のようにかっこをつける。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '30mm', s2: '50mm', s3: '50mm', trap: '24mm' },
    fits(q) {
      if (/のとき|回した|うで|\^\{?\d|\^\{?n/.test(q.replace(/\^\{\\circ\}/g, ''))) return false;
      return /\$a\+bj\$ の形に|極形式に/.test(q) || (/\\lvert z\\rvert=/.test(q) && /\\arg z=/.test(q));
    },
    steps: {
      // 極形式 → a+bj
      s1(r) {
        const P = polPoint(r); if (ex57(P.rT, P.d)) return null;
        return {
          q: `$${polT(P.rT, P.d)}$ を $a+bj$ の形に`, a: `$${ztex(P.z)}$`, key: `${P.rT}|${P.d}`,
          easy: `$${P.rT === '1' ? '' : P.rT}\\Bigl(${ztex(cs(P.d))}\\Bigr)=${ztex(P.z)}$`,
          verify: p => cclose(evC(maths(p.q)[0]), evC(strip(p.a))) || 'a+bj がちがう',
        };
      },
      // a+bj → 極形式
      s2(r) {
        const P = polPoint(r); if (ex57(P.rT, P.d)) return null;
        return {
          q: `$${ztex(P.z)}$ を極形式に`, a: `$${polT(P.rT, P.d)}$`, key: `${P.rT}|${P.d}`,
          easy: `${absHow(P.z)}。${argHow(P.d)}`, easyCheck: false, verify: p => polOK(strip(p.a), evC(maths(p.q)[0])),
        };
      },
      // |z| と arg z から・偏角を範囲に直す・cos−j sin の形
      s3(r) {
        const t = turn(r, '57s3', 3);
        if (t === 0) {
          const P = polPoint(r); if (ex57(P.rT, P.d)) return null;
          return {
            q: `$\\lvert z\\rvert=${P.rT}$、$\\arg z=${dg(P.d)}$ の複素数 $z$ を $a+bj$ の形に`, a: `$${ztex(P.z)}$`, key: `${P.rT}|${P.d}`,
            easy: `$z=${polT(P.rT, P.d)}=${ztex(P.z)}$`, easyCheck: 'last',
            verify: p => { const ms = maths(p.q), rr = M.evalMath(ms[0].replace(/^.*=/, ''), {}), dd = +/(-?\d+)\^/.exec(ms[1])[1] * Math.PI / 180; return cclose([rr * Math.cos(dd), rr * Math.sin(dd)], evC(strip(p.a))) || 'z がちがう'; },
          };
        }
        if (t === 1) {   // 偏角が 180° をこえる極形式を、範囲の中に
          const P = polPoint(r, [-30, -45, -60, -90, -120, -135, -150]); if (ex57(P.rT, P.d)) return null;
          const d2 = P.d + 360;
          return {
            q: `$${polT(P.rT, d2)}$ を、偏角が $-180^{\\circ}<\\theta\\leqq180^{\\circ}$ の極形式に`, a: `$${polT(P.rT, P.d)}$`, key: `${P.rT}|${P.d}`,
            easy: `$${dg(d2)}-360^{\\circ}=${dg(P.d)}$（同じ向き）`, easyCheck: false,
            verify: p => polOK(strip(p.a), evC(maths(p.q)[0])),
          };
        }
        // r(cos θ − j sin θ) は、偏角 −θ の極形式
        const d = r.pick([30, 45, 60, 90, 120, 135, 150]), k = r.int(1, 4), kT = k === 1 ? '' : String(k);
        if (k === 2 && d === 150) return null;   // 左ページの例と同じ数
        return {
          q: `$${kT ? `${kT}(` : ''}\\cos${dg(d)}-j\\sin${dg(d)}${kT ? ')' : ''}$ を極形式に`, a: `$${polT(String(k), -d)}$`, key: `${k}|${-d}`,   // 答えが同じ極形式の問題と同じ key（O-2）
          easy: `$\\cos(-\\theta)=\\cos\\theta$、$\\sin(-\\theta)=-\\sin\\theta$ なので、偏角は $${dg(-d)}$`, easyCheck: false,
          verify: p => polOK(strip(p.a), evC(maths(p.q)[0])),
        };
      },
      // わな：n 乗（6-59）
      trap(r) {
        const B = r.pick(B59), n = r.int(4, B.rT === '2' ? 6 : 8);
        return dest({ q: `$(${ztex(B.z)})^{${n}}$`, a: `$${ztex(zP(B.z, n))}$`, key: `t|${ztex(B.z)}|${n}` }, '6-57', `書きかえだけでなく、${n}乗する。展開すると長い`);
      },
    },
  });

  // ================================================================ 6-58
  // 左ページの例：z=2(cos30°+j sin30°)、w=3(cos60°+j sin60°)（O-2。この2つの組は出さない）
  const ex58 = (a, b) => { const k = [a.join(','), b.join(',')].sort().join('|'); return k === ['2,30', '3,60'].sort().join('|'); };
  const polQ = (r1, a1, r2, a2) => `$z=${polT(String(r1), a1)}$、$w=${polT(String(r2), a2)}$ のとき、`;
  const key58 = (op, r1, a1, r2, a2) => (op === 'm' ? `m|${[`${r1},${a1}`, `${r2},${a2}`].sort().join('|')}` : `d|${r1},${a1}|${r2},${a2}`);
  const v58 = (op, check) => p => { const D = defs(p.q), z = evC(D.z), w = evC(D.w); return check(strip(p.a), op === 'm' ? cmul(z, w) : cdiv(z, w)); };
  const cOK = (a, v) => cclose(evC(a), v) || `答え ${a} の値がちがう`;
  M.add({
    id: '6-58', part: 4, chap: '6-9⑤⑦ 例題4・5', stars: 1,
    title: '極形式のかけ算・わり算は、絶対値をかけて（わって）、偏角をたす（ひく）',
    mark: '極形式の2つの数の積・商。展開が長くなるかけ算を、極形式で答えるとき。',
    futsu: ['$z$、$w$ を $a+bj$ の形に直してから', '$(\\sqrt3+j)\\Bigl(\\frac32+\\frac{3\\sqrt3}{2}j\\Bigr)$ を', '展開し、$j^2=-1$ を使ってから、', 'もう一度、極形式に直す。'],
    raku: ['$z=2(\\cos30^{\\circ}+j\\sin30^{\\circ})$', '$w=3(\\cos60^{\\circ}+j\\sin60^{\\circ})$', '$zw=6(\\cos90^{\\circ}+j\\sin90^{\\circ})=6j$', '$\\frac wz=\\frac32(\\cos30^{\\circ}+j\\sin30^{\\circ})$'],
    why: 'かけ算は、大きさはかけ算、角はたし算（6-9⑤）。加法定理で $(\\cos\\alpha+j\\sin\\alpha)(\\cos\\beta+j\\sin\\beta)=\\cos(\\alpha+\\beta)+j\\sin(\\alpha+\\beta)$ になるから。わり算はかけ算の逆なので、大きさはわり算、角はひき算（6-9⑦）。',
    caution: '偏角はかけない（$30^{\\circ}\\times60^{\\circ}$ ではなく $30^{\\circ}+60^{\\circ}$）。たした角が $180^{\\circ}$ をこえたら $360^{\\circ}$ をひく（$220^{\\circ}$ は $-140^{\\circ}$）。たし算・ひき算は、極形式では楽にならない。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '46mm', s3: '46mm', trap: '30mm' }, boxh: { s2: '12mm' },
    fits(q) {
      if (/回した|うで/.test(q)) return false;
      if (/のとき/.test(q) && /\\cos/.test(q) && hasM(q, /^(zw|\\frac\{[zw]\}\{[zw]\})$/)) return true;
      if (/極形式で/.test(q)) return maths(q).some(m => { const P = pairOf(m); if (!P) return false; const u = evC(P[0]), v = evC(P[1]); return !!u && !!v && isSpecialArg(u) && isSpecialArg(v); });
      return false;
    },
    steps: {
      // zw（偏角の和が範囲の中）
      s1(r) {
        const r1 = r.int(2, 5), r2 = r.int(2, 5), a1 = 10 * r.intNot(-15, 15, v => v === 0), a2 = 10 * r.intNot(-15, 15, v => v === 0), s = a1 + a2;
        if (s <= -180 || s > 180 || s === 0 || ex58([r1, a1], [r2, a2])) return null;
        return {
          q: `${polQ(r1, a1, r2, a2)}$zw$（極形式で）`, a: `$${polT(String(r1 * r2), s)}$`, key: key58('m', r1, a1, r2, a2),
          easy: `絶対値 $${r1}\\times${r2}=${r1 * r2}$、偏角 $${dg(a1)}+${dgp(a2)}=${dg(s)}$`, easyCheck: false, verify: v58('m', polOK),
        };
      },
      // z/w（絶対値が分数になるものも）
      s2(r) {
        const r2 = r.int(1, 4), r1 = r.chance(0.6) ? r2 * r.int(2, 3) : r.int(1, 9), a1 = 10 * r.intNot(-15, 15, v => v === 0), a2 = 10 * r.intNot(-15, 15, v => v === 0), s = a1 - a2;
        if (r1 === r2 || s <= -180 || s > 180 || s === 0 || ex58([r1, a1], [r2, a2])) return null;
        const rT = F.tex(fr(r1, r2));
        return {
          q: `${polQ(r1, a1, r2, a2)}$\\frac{z}{w}$（極形式で）`, a: `$${polT(rT, s)}$`, key: key58('d', r1, a1, r2, a2),
          easy: `絶対値 $\\frac{${r1}}{${r2}}${rT === `\\frac{${r1}}{${r2}}` ? '' : `=${rT}`}$、偏角 $${dg(a1)}-${dgp(a2)}=${dg(s)}$`, easyCheck: false, verify: v58('d', polOK),
        };
      },
      // 偏角を範囲に直す・a+bj の形で・a+bj の2数の積を極形式で
      s3(r) {
        const t = turn(r, '58s3', 3);
        if (t === 0) {
          const op = r.pick(['m', 'd']), r2 = r.int(2, 4), r1 = op === 'm' ? r.int(2, 4) : r2 * r.int(2, 3);
          const sg = r.pick([1, -1]), a1 = sg * 10 * r.int(6, 17), a2 = (op === 'm' ? sg : -sg) * 10 * r.int(6, 17), s = op === 'm' ? a1 + a2 : a1 - a2;
          if (Math.abs(s) <= 180 || Math.abs(s) >= 360 || a1 === 180 || a2 === 180 || ex58([r1, a1], [r2, a2])) return null;
          const R = op === 'm' ? String(r1 * r2) : String(r1 / r2);
          return {
            q: `${polQ(r1, a1, r2, a2)}${op === 'm' ? '$zw$' : '$\\frac{z}{w}$'}（極形式で）`, a: `$${polT(R, nd(s))}$`, key: key58(op, r1, a1, r2, a2),
            easy: `偏角 $${dg(a1)}${op === 'm' ? '+' : '-'}${dgp(a2)}=${dg(s)}$ は、$${dg(nd(s))}$ と同じ向き`, easyCheck: false, verify: v58(op, polOK),
          };
        }
        if (t === 1) {   // zw を a+bj の形で（たした角が特別な角）
          const T = r.pick([30, 60, 90, 120, 150, 180, -30, -60, -90, -120, -150]), a1 = 10 * r.intNot(-15, 15, v => v === 0), a2 = T - a1;
          if (a2 === 0 || a2 <= -180 || a2 > 180 || special(a1)) return null;
          const r1 = r.int(1, 5), r2 = r.int(2, 5); if (T % 90 !== 0 && (r1 * r2) % 2) return null;
          if (ex58([r1, a1], [r2, a2])) return null;
          const A = ztex(zSc(S(r1 * r2), cs(T)));
          return {
            q: `${polQ(r1, a1, r2, a2)}$zw$ を $a+bj$ の形で`, a: `$${A}$`, key: key58('m', r1, a1, r2, a2),
            easy: `$zw=${polT(String(r1 * r2), T)}=${A}$`, easyCheck: 'last', verify: v58('m', cOK),
          };
        }
        const A = r.pick(B59), B = r.pick(B59);
        if (A === B || nd(A.d + B.d) === 0 || (A.d === 45 && B.d === 30) || (A.d === 30 && B.d === 45)) return null;   // 共役な組（6-49）と、教科書の例題5
        const rS = sMul(A.rS, B.rS), d = nd(A.d + B.d);
        return {
          q: `$(${ztex(A.z)})(${ztex(B.z)})$ を極形式で`, a: `$${polT(stex(rS), d)}$`, key: `b|${[ztex(A.z), ztex(B.z)].sort().join('|')}`,
          easy: `絶対値 $${A.rT}\\times${B.rT}=${stex(rS)}$、偏角 $${dg(A.d)}+${dgp(B.d)}=${dg(A.d + B.d)}$${A.d + B.d === d ? '' : `（$${dg(d)}$ と同じ向き）`}`, easyCheck: false,
          verify: p => { const P = pairOf(maths(p.q)[0]); return polOK(strip(p.a), cmul(evC(P[0]), evC(P[1]))); },
        };
      },
      // わな：極形式の2つの数のたし算（6-47・6-57）
      trap(r) {
        const set = [30, 60, 90, 120, 150, 180, -30, -60, -90, -120, -150], A = polPoint(r, set), B = polPoint(r, set);
        if (A.d === B.d) return null;
        const s = zA(A.z, B.z);
        if ((s.re.p[0] && s.re.q[0]) || (s.im.p[0] && s.im.q[0]) || (sZero(s.re) && sZero(s.im))) return null;   // 実部・虚部が1つの項になる組だけ
        return dest({
          q: `$z=${polT(A.rT, A.d)}$、$w=${polT(B.rT, B.d)}$ のとき、$z+w$`, a: `$${ztex(s)}$`, key: `t|${[`${A.rT},${A.d}`, `${B.rT},${B.d}`].sort().join('|')}`,
          verify: p => { const D = defs(p.q); return cclose(evC(`(${D.z})+(${D.w})`), evC(strip(p.a))) || 'z+w がちがう'; },
        }, '6-58', 'かけ算・わり算ではなく、たし算。極形式では楽にならないので、$a+bj$ の形に直して、実部どうし・虚部どうしをたす', ['6-57']);
      },
    },
  });

  // ================================================================ 6-59
  // 左ページの例：(1+j)^8=16、(1+√3 j)^4=-8-8√3 j（O-2）
  const ex59 = (rT, d, n) => (rT === '\\sqrt2' && d === 45 && n === 8) || (rT === '2' && d === 60 && n === 4);
  const NS = [10, 20, 40, 50, 70, 80, 100, 110, 130, 140, 160, 170];   // 特別でない角
  // 偏角 d の n 乗が、範囲の中ではどの角か
  const turnHow = (d, n) => `$${dgp(d)}\\times${n}=${dg(d * n)}$${nd(d * n) === d * n ? '' : `（$${dg(nd(d * n))}$ と同じ向き）`}`;
  M.add({
    id: '6-59', part: 4, chap: '6-9⑧ 例題6', stars: 1,
    title: '$n$ 乗は、絶対値を $n$ 乗、偏角を $n$ 倍（ド・モアブル。$180^{\\circ}$ をこえたら $360^{\\circ}$ をひく）',
    mark: '$(1+j)^n$、$(1+\\sqrt3\\,j)^n$ のような、偏角が特別な角の数の $n$ 乗（$n$ が大きい）。',
    futsu: ['$(1+j)^8$ を、$(1+j)^2=2j$、', '$(2j)^2=-4$、$(-4)^2=16$ と、', '1回ずつ展開して', 'かけ算をくり返す。'],
    raku: ['$1+j$ は $\\sqrt2$、$45^{\\circ}$', '$(\\sqrt2)^8=16$、$45^{\\circ}\\times8=360^{\\circ}$ → 16', '$(1+\\sqrt3\\,j)^4$：$2^4=16$、$240^{\\circ}$ は $-120^{\\circ}$', '→ $-8-8\\sqrt3\\,j$'],
    why: 'かけ算は、大きさはかけ算、角はたし算（6-9⑤）なので、同じ数を $n$ 回かけると、大きさは $r^n$、角は $n\\theta$（6-9⑧）。$\\{r(\\cos\\theta+j\\sin\\theta)\\}^n=r^n(\\cos n\\theta+j\\sin n\\theta)$。',
    caution: '絶対値の $n$ 乗を忘れない（$(1+j)^8$ は1ではなく16）。$n\\theta$ が $180^{\\circ}$ をこえたら、$360^{\\circ}$ の倍数をひいて同じ向きの角に直す。偏角が特別な角でない数（$1+2j$ など）は、展開する。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '30mm', s3: '46mm', trap: '20mm' },
    fits(q) {
      if (/回した|うで/.test(q)) return false;
      // 軸の上の数（$(-j)^n$ など）は 6-46 の形なので入れない
      if (maths(q).some(m => { const P = powOf(m); return !!P && P.n >= 4 && Math.abs(P.v[0]) > 1e-9 && Math.abs(P.v[1]) > 1e-9 && isSpecialArg(P.v); })) return true;
      if (/\\\}\^\{?\d/.test(q) || /\\sin[^$]*\)\^\{?\d/.test(q)) return true;    // {r(cos θ+j sin θ)}^n、(cos θ+j sin θ)^n
      if (/\\arg z=/.test(q) && hasM(q, /^z\^\{?\d+\}?$/)) return true;
      return /正の実数|負の実数/.test(q) && /\^\{?n\}?/.test(q);
    },
    steps: {
      // (a+bj)^n（偏角が特別な角）
      s1(r) {
        const B = r.pick(B59), n = r.int(4, B.rT === '2' ? 6 : 10); if (ex59(B.rT, B.d, n)) return null;
        const rn = stex(sPow(B.rS, n));
        return {
          q: `$(${ztex(B.z)})^{${n}}$`, a: `$${ztex(zP(B.z, n))}$`, key: `${B.rT}|${B.d}|${n}`,
          easy: `$${B.rT}$、$${dg(B.d)}$。$(${B.rT})^{${n}}=${rn}$、${turnHow(B.d, n)}`, easyCheck: false,
        };
      },
      // {r(cos θ+j sin θ)}^n・|z| と arg z から z^n
      s2(r) {
        if (turn(r, '59s2', 2)) {
          const th = r.pick(NS), n = r.int(3, 6), T = nd(th * n), k = r.pick([1, 1, 2]);
          if (!special(T) || (k === 2 && n > 5)) return null;
          const A = ztex(zSc(S(k ** n), cs(T)));
          const q = k === 1 ? `(\\cos${dg(th)}+j\\sin${dg(th)})^{${n}}` : `\\{${polT(String(k), th)}\\}^{${n}}`;
          return {
            q: `$${q}$`, a: `$${A}$`, key: `${k}|${th}|${n}`,
            easy: `${k === 1 ? '' : `$${k}^{${n}}=${k ** n}$、`}${turnHow(th, n)}。$${polT(String(k ** n), T)}=${A}$`, easyCheck: false,
            verify: p => cclose(evC(maths(p.q)[0]), evC(strip(p.a))) || 'n 乗がちがう',
          };
        }
        const th = r.pick([15, 30, 45, 60, 20, 40, -15, -30, -45, -60]), n = r.int(2, 6), T = nd(th * n), k = r.int(2, 3);
        if (!special(T) || T === 0 || k ** n > 81 || (special(th) && n === 2)) return null;
        const A = ztex(zSc(S(k ** n), cs(T)));
        return {
          q: `$\\lvert z\\rvert=${k}$、$\\arg z=${dg(th)}$ のとき、$z^{${n}}$ を $a+bj$ の形で`, a: `$${A}$`, key: `${k}|${th}|${n}`,
          easy: `$${k}^{${n}}=${k ** n}$、${turnHow(th, n)}。$${polT(String(k ** n), T)}=${A}$`, easyCheck: false,
          verify: p => { const ms = maths(p.q), kk = M.evalMath(ms[0].replace(/^.*=/, ''), {}), dd = +/(-?\d+)\^/.exec(ms[1])[1] * Math.PI / 180, nn = +/\^\{(\d+)\}/.exec(ms[2])[1]; return cclose([kk ** nn * Math.cos(nn * dd), kk ** nn * Math.sin(nn * dd)], evC(strip(p.a))) || 'z^n がちがう'; },
        };
      },
      // 極形式で答える（範囲に直す）・正の実数／負の実数になる n
      s3(r) {
        if (turn(r, '59s3', 2) === 0) {
          const th = r.pick(NS.concat([25, 35, 55, 65])), n = r.int(3, 7), T = nd(th * n), k = r.pick([1, 1, 2]);
          if (special(T) || th * n <= 180 || (k === 2 && n > 5)) return null;
          const q = k === 1 ? `(\\cos${dg(th)}+j\\sin${dg(th)})^{${n}}` : `\\{${polT(String(k), th)}\\}^{${n}}`;
          return {
            q: `$${q}$ を極形式で`, a: `$${polT(String(k ** n), T)}$`, key: `${k}|${th}|${n}`,
            easy: `${k === 1 ? '' : `$${k}^{${n}}=${k ** n}$、`}${turnHow(th, n)}`, easyCheck: false,
            verify: p => polOK(strip(p.a), evC(maths(p.q)[0])),
          };
        }
        const B = r.pick(B59), pos = r.chance(0.5), want = pos ? 0 : 180;
        let n = 0; for (let k = 1; k <= 24; k++) if (nd(B.d * k) === want) { n = k; break; }
        if (!n) return null;
        return {
          q: `$(${ztex(B.z)})^{n}$ が${pos ? '正' : '負'}の実数になる、いちばん小さい正の整数 $n$`, a: `$${n}$`, key: `p|${B.rT}|${B.d}|${pos}`,
          easy: `偏角は $${dg(B.d)}$。$${n}$ 倍すると ${pos ? '$360^{\\circ}$ の倍数' : '$180^{\\circ}$ と同じ向き'}`, easyCheck: false,
          verify: p => { const z = evC(maths(p.q)[0].replace(/\^\{n\}$/, '').replace(/^\(|\)$/g, '')), m = +strip(p.a); let w = [1, 0]; for (let k = 1; k <= m; k++) { w = cmul(w, z); const ok = Math.abs(w[1]) < 1e-9 * Math.hypot(...w) && (pos ? w[0] > 0 : w[0] < 0); if (ok !== (k === m)) return `n=${k} で${ok ? 'もう' : 'まだ'}${pos ? '正' : '負'}の実数${ok ? 'になる' : 'でない'}`; } return true; },
        };
      },
      // わな：偏角が特別な角でない数の2乗・3乗（6-48）
      trap(r) {
        const a = r.intNot(-3, 3, v => v === 0), b = r.intNot(-3, 3, v => v === 0), n = r.pick([2, 3]);
        if (Math.abs(a) === Math.abs(b) || (n === 3 && Math.abs(a) + Math.abs(b) > 4)) return null;
        return dest({ q: `$(${zt(a, b)})^{${n}}$`, a: `$${zt(...zpow([a, b], n))}$`, key: `t|${zt(a, b)}|${n}` }, '6-59', `$${zt(a, b)}$ の偏角は特別な角ではない。展開して $j^2=-1$ を使う`);
      },
    },
  });

  // ================================================================ 6-60
  // 左ページの例：(4, 2) を 90°、(2, 2) を 30°、うで 40・30 cm、30°・60°（O-2）
  const ex60 = (x, y) => (x === 4 && y === 2) || (x === 2 && y === 2);   // 例の点は、どの角でも出さない
  const rotT = th => (th < 0 ? `右回りに $${-th}^{\\circ}$` : `左回りに $${th}^{\\circ}$`);
  const ptS = z => `(${stex(z.re)},\\ ${stex(z.im)})`;
  const rot = (x, y, th) => zM(Z(x, y), cs(th));
  // 問題の文から、点と回す角を読んで回しなおす（別の道すじ：cos・sin の式）
  function rotVerify(p, inv) {
    const P = ptRead(`$${maths(p.q)[0]}$`), m = /(左|右)回りに \$(\d+)\^\{\\circ\}\$/.exec(p.q), A = ptRead(p.a);
    if (!P || !m || !A) return '点か角が読めない';
    const th = (m[1] === '右' ? -1 : 1) * (+m[2]) * Math.PI / 180 * (inv ? -1 : 1);
    const want = [P[0] * Math.cos(th) - P[1] * Math.sin(th), P[0] * Math.sin(th) + P[1] * Math.cos(th)];
    return cclose(want, A) || `回した点が ${want.map(v => +v.toFixed(6)).join(', ')} でない`;
  }
  // もとの点 P・回した点 Q・角の弧の図
  function rotFig(P, Qv, th) {
    const G = plane([P, Qv]), A = G.T(...P), B = G.T(...Qv), d0 = Math.atan2(P[1], P[0]) * 180 / Math.PI, L = Math.min(Math.hypot(...A), Math.hypot(...B));
    return { s: 5, items: [...G.axes({}), ['seg', [0, 0], A], ['seg', [0, 0], B, { dash: true }], ['dot', A], ['dot', B],
      ['label', A, '$\\mathrm{P}$', dirOf(...P)], ['label', B, '$\\mathrm{Q}$', dirOf(...Qv)], ...angArc(d0 + th, Math.min(1, 0.45 * L), `$${th}^{\\circ}$`, d0)] };
  }
  M.add({
    id: '6-60', part: 4, chap: '6-9⑨ 例題7・8', stars: 1,
    title: '点を回す：$90^{\\circ}$ は $j$ をかける、$\\theta$ は $\\cos\\theta+j\\sin\\theta$ をかける（2リンクのうでは $u_1(L_1+L_2u_2)$）',
    mark: '「原点のまわりに左回りに□°回した点」、ロボットのうでの手の位置。',
    futsu: ['点 $(4,\\ 2)$ と原点を結ぶ線の', '長さと角を、$\\tan^{-1}$ で求めて、', '角に90°をたしてから、', '$\\cos$・$\\sin$ で座標にもどす。'],
    raku: ['$(4,\\ 2)$ を90°：$j(4+2j)=-2+4j$', '回した点は $(-2,\\ 4)$', '$(2,\\ 2)$ を30°：$\\cos30^{\\circ}+j\\sin30^{\\circ}$ をかける', 'うで：手$=u_1(L_1+L_2u_2)$'],
    why: '$\\cos\\theta+j\\sin\\theta$ は絶対値1、偏角 $\\theta$ の数なので、かけると大きさは変わらず、角だけ $\\theta$ ふえる（6-9⑥⑨）。$90^{\\circ}$ なら $j$、右回りの $90^{\\circ}$ なら $-j$、$180^{\\circ}$ なら $-1$。うでは、ひじから先を $\\theta_2$ 回し（$L_1+L_2u_2$）、全体を $\\theta_1$ 回す（$u_1$ をかける）。',
    caution: '右回りは角を負にする（右回りに30°なら $\\cos(-30^{\\circ})+j\\sin(-30^{\\circ})$）。答えは点の座標 $(x,\\ y)$ で、実部が $x$、虚部が $y$。ひじの角 $\\theta_2$ は上のうでからはかった角なので、下のうでの向きは $\\theta_1+\\theta_2$。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '34mm', s3: '34mm', trap: '24mm' },
    fits(q) { return /回した|回すと|うで/.test(q); },
    steps: {
      // 90°・右回り90°・180°
      s1(r) {
        const x = r.int(-6, 6), y = r.int(-6, 6), th = [90, -90, 90, 180][turn(r, '60s1', 4)]; if (!x || !y || ex60(x, y, th)) return null;
        const Q = rot(x, y, th), m = th === 90 ? 'j' : th === -90 ? '-j' : '-';
        return {
          q: `点 $(${x},\\ ${y})$ を、原点のまわりに${rotT(th)}回した点`, a: `$${ptS(Q)}$`, key: `${x},${y}|${th}`,
          easy: `$${m}(${zt(x, y)})=${ztex(Q)}$`, easyCheck: false, verify: p => rotVerify(p),
        };
      },
      // 30°・45°・60°・120° など（√ が残る）
      s2(r) {
        const th = r.pick([30, 45, 60, 120, 135, 150, -30, -45, -60]), u = ((th % 90) + 90) % 90;
        let x, y;
        if (u === 45) { x = r.intNot(-4, 4, v => v === 0); y = r.intNot(-4, 4, v => v === 0); if ((x - y) % 2) return null; }
        else { x = 2 * r.intNot(-3, 3, v => v === 0); y = 2 * r.int(-3, 3); }
        if (ex60(x, y, th)) return null;
        const Q = rot(x, y, th);
        return {
          q: `点 $(${x},\\ ${y})$ を、原点のまわりに${rotT(th)}回した点`, a: `$${ptS(Q)}$`, key: `${x},${y}|${th}`,
          easy: `$(${zt(x, y)})\\Bigl(${ztex(cs(th))}\\Bigr)=${ztex(Q)}$`, easyCheck: false, verify: p => rotVerify(p),
        };
      },
      // 図・うで・回したあとの点からもとの点
      s3(r) {
        const t = turn(r, '60s3', 3);
        if (t === 0) {
          // 図の問題は、ここで数を選びなおす（null を返すと turn が次の形に進み、図の問題が出なくなる）
          let x, y, th;
          for (let k = 0; k < 40; k++) {
            th = r.pick([90, 60, 30, 45, 120]);
            if (th === 45) { x = r.int(1, 4); y = r.int(-3, 3); } else { x = 2 * r.int(1, 2); y = 2 * r.int(-1, 2); }
            if (!(th === 45 && (x - y) % 2) && !ex60(x, y, th)) break;
          }
          if ((th === 45 && (x - y) % 2) || ex60(x, y, th)) return null;
          const Q = rot(x, y, th);
          return {
            q: `図の点 $\\mathrm{P}(${x},\\ ${y})$ を、原点のまわりに${rotT(th)}回した点 $\\mathrm{Q}$ の座標`, a: `$${ptS(Q)}$`, fig: rotFig([x, y], zVal(Q), th), key: `${x},${y}|${th}`,
            easy: `$(${zt(x, y)})${th === 90 ? 'j' : `\\Bigl(${ztex(cs(th))}\\Bigr)`}=${ztex(Q)}$`, easyCheck: false,
            verify: p => rotVerify({ q: p.q.replace(/\\mathrm\{P\}/, ''), a: p.a }),
          };
        }
        if (t === 1) {   // 2リンクのうで（角は30°の倍数）
          const L1 = 10 * r.int(2, 6), L2 = 10 * r.int(2, 5), t1 = r.pick([30, 60, 90, 120]), t2 = r.pick([30, 60, 90, -30, -60, -90, 120]);
          if ((L1 === 40 && L2 === 30 && ((t1 === 30 && t2 === 60) || (t1 === 60 && t2 === 30) || (t1 === 90 && t2 === -90))) || L1 === L2) return null;
          const H = zA(zSc(S(L1), cs(t1)), zSc(S(L2), cs(nd(t1 + t2))));
          if (sZero(H.re) && sZero(H.im)) return null;
          return {
            q: `2リンクのうで（上のうで $L_1=${L1}\\,\\mathrm{cm}$、下のうで $L_2=${L2}\\,\\mathrm{cm}$、肩の角 $\\theta_1=${dg(t1)}$、ひじの角 $\\theta_2=${dg(t2)}$）の手の位置（cm）`,
            a: `$${ptS(H)}$`, key: `u|${L1}|${L2}|${t1}|${t2}`,
            easy: `$${L1}+${L2}u_2=${ztex(zA(Z(L1, 0), zSc(S(L2), cs(t2))))}$ に $u_1$ をかける`, easyCheck: false,
            verify: p => {
              const n = k => +new RegExp(`${k}=(-?\\d+)`).exec(p.q)[1], a1 = n('\\\\theta_1') * Math.PI / 180, a2 = n('\\\\theta_2') * Math.PI / 180, l1 = n('L_1'), l2 = n('L_2'), A = ptRead(p.a);
              return cclose([l1 * Math.cos(a1) + l2 * Math.cos(a1 + a2), l1 * Math.sin(a1) + l2 * Math.sin(a1 + a2)], A) || '手の位置がちがう';
            },
          };
        }
        // 回したあとの点から、もとの点（逆の問題。もとの問題と同じ key。O-2）
        const th = r.pick([90, -90, 60, 30]); let x, y;
        if (th % 90) { x = 2 * r.intNot(-3, 3, v => v === 0); y = 2 * r.int(-3, 3); } else { x = r.intNot(-6, 6, v => v === 0); y = r.intNot(-6, 6, v => v === 0); }
        if (ex60(x, y, th)) return null;
        const Q = rot(x, y, th), qv = zVal(Q);
        if (ex60(Math.round(qv[0] * 1e9) / 1e9, Math.round(qv[1] * 1e9) / 1e9)) return null;   // 文に出る点も、例の点にしない
        return {
          q: `ある点を、原点のまわりに${rotT(th)}回すと、点 $${ptS(Q)}$ になった。もとの点`, a: `$(${x},\\ ${y})$`, key: `${x},${y}|${th}`,
          easy: `反対に${rotT(-th)}回す`, easyCheck: false,
          verify: p => { const P = ptRead(`$${maths(p.q)[1]}$`), m = /(左|右)回りに \$(\d+)/.exec(p.q), A = ptRead(p.a), a = (m[1] === '右' ? -1 : 1) * (+m[2]) * Math.PI / 180; if (!P || !A) return '点が読めない'; return cclose([A[0] * Math.cos(a) - A[1] * Math.sin(a), A[0] * Math.sin(a) + A[1] * Math.cos(a)], P) || 'もとの点を回しても、文の点にならない'; },
        };
      },
      // わな：折り返し（回転ではない。わざなし）
      trap(r) {
        const x = r.intNot(-6, 6, v => v === 0), y = r.intNot(-6, 6, v => v === 0), re = turn(r, '60tr', 2) === 0;
        if (ex60(x, y)) return null;
        return dest({
          q: `点 $(${x},\\ ${y})$ を、${re ? '実軸' : '虚軸'}について折り返した点`, a: `$(${re ? x : -x},\\ ${re ? -y : y})$`, key: `t|${x},${y}|${re}`,
          verify: p => { const P = ptRead(`$${maths(p.q)[0]}$`), A = ptRead(p.a); return (!!P && !!A && close(A[0], re ? P[0] : -P[0]) && close(A[1], re ? -P[1] : P[1])) || '折り返した点がちがう'; },
        }, '6-60', `回すのではなく、${re ? '実軸' : '虚軸'}について折り返す。${re ? '共役 $\\bar z$ の点' : '$-\\bar z$ の点（実部の符号だけ変える）'}`);
      },
    },
  });

  // ---------------------------------------------------------------- 同じ見開きの答えの重なり（O-2）
  // わなの答えを、同じ見開きのステップの答えと重ねない。6-57〜6-60 は、ステップどうしでも同じ答えを出さない
  // （答えのちがう問題がたくさん作れるわざだけ）。答えは同じ乱数 r の上に、わざごとに覚える（turn と同じやり方）。
  const normA = a => M.plain(String(a)).replace(/\s|\\,|\\ /g, '');
  const ansOf = (r, id) => { const d = r.ans4 || (r.ans4 = {}); return d[id] || (d[id] = new Set()); };
  M.list(6).filter(id => M.waza[id].part === 4).forEach(id => {
    const st = M.waza[id].steps, uniq = ['6-57', '6-58', '6-59', '6-60'].includes(id);
    ['s1', 's2', 's3'].forEach(s => {
      const f = st[s];
      st[s] = r => { const p = f(r); if (!p) return p; const A = ansOf(r, id), k = normA(p.a); if (uniq && A.has(k)) return null; A.add(k); return p; };
    });
    const t = st.trap;
    st.trap = r => { const p = t(r); if (!p) return p; const A = ansOf(r, id), k = normA(p.a); if (A.has(k)) return null; A.add(k); return p; };
  });
})(globalThis.MONDAI);

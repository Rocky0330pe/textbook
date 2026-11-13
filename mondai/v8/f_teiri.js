/* 問題集 第8巻　第6部 2つの定理・ラプラシアン・熱と波（わざ 8-75〜8-90、8-96〜8-99）　組 f
 * 書き方は v8/README.md（第8・9巻の手引き）・v6/README.md・v5/README.md・v4/README.md。文は教科書 第8巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 8-11〜8-13 の数・ことば・記号にそろえる（ガウスの定理・ふた・袋・ガウスの法則・アンペールの法則・グリーンの定理・くつひもの式・穴をかこむ道、
 *   まわりの平均との差・ラプラシアン $\nabla^2f$・落ち着いた温度・ラプラス方程式、熱の1歩 $T_i^{\,n+1}$・$r=\frac{\alpha\Delta t}{\Delta x^2}$・こわれない・ぎざぎざ、
 *   熱方程式・波動方程式・玉のずれ・物質微分 $\frac{\mathrm DT}{\mathrm Dt}$）。8-14 は読みもの（V-9）なので、わざを作らない。
 * 用字は「距離」「ななめ」「はかる」「はば」（V-11）。定数は $k=9.0\times10^9$、$\varepsilon_0=8.85\times10^{-12}$、$g=9.8$、$\mu_0=4\pi\times10^{-7}$（V-4）。文に書く。
 * 単位は $0.3\,\mathrm{m}$・$100\,\mathrm{N/C}$・$\mathrm{m^2/s}$（O-7）。℃・％ は式の外。近似の答えは「約」と ≈（O-4・S-3。agree()）。
 * 答えは π・ln を残した形（$64\pi$、$25\ln2$）。約の値は、文に値（$\pi=3.14$、$\ln2=0.693$）とけたを書いたときだけ。
 * 検算：重積分・線積分は calc（line）か、verify で面の積分・道の積分を数でたしかめる（ガウスの定理を使わずに、面の上で直接たす）。
 *   ラプラシアンは calc（pdiff の lap）か、verify で中心差分。ほかの答えは verify(p) で別の道すじ（連立方程式はくり返しでならす、表計算は1歩ずつ、など）。
 * 図は 8-82（マスの並び）・8-83（正方形の板）のステップ3だけ（K-2）。表（p.table）は 8-80・8-85・8-88 のステップ3、プログラム（p.code）は 8-85 のステップ3。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2・S-2・U-2）。key は、ステップがちがっても同じ問題なら同じになる形にする。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const neg = x => F.sub(fr(0), x);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                        // 0.30000000004 → 0.3
  const D = x => (Array.isArray(x) ? x : F.fromDec(String(x)));        // 0.5 → [1, 2]
  // 問題ができたときだけ進める回し方（v7 と同じ）：peek で今の番を見て、問題を返す前に adv で進める
  const peek = (r, key, n) => { const d = r.turns || (r.turns = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return d[key]; };
  const adv = (r, key, n) => { r.turns[key] = (r.turns[key] + 1) % n; };
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 答えのかたより（S-4・U-3）：同じステップで同じ答えを3つ以上出さない。ok なら数える
  const cap = (r, key, a, n) => { const m = r.caps || (r.caps = {}), k = key + '\u0000' + a; if ((m[k] || 0) >= (n || 2)) return false; m[k] = (m[k] || 0) + 1; return true; };
  // 同じ見開きで同じ問題（key）を2回使わない（ステップをまたいで）
  const once = (r, key) => { const u = r.used || (r.used = new Set()); if (u.has(key)) return false; u.add(key); return true; };
  // 分数 f の、正確な小数（分母が 2 と 5 だけのとき）。そうでなければ null
  function dec(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1n;
    while (k < 15 && (BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) { k++; p *= 10n; }
    if ((BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) return null;
    const N = (BigInt(Math.abs(n)) * p / BigInt(d)).toString().padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  const decLen = f => { const t = dec(f); return t == null ? 99 : (t.split('.')[1] || '').length; };
  // 分数 f を小数第 k 位までに四捨五入した文字（文に書いた値で計算した答え）
  function roundStr(f, k) {
    const [n, d] = f, sg = n < 0 ? '-' : '', p = 10n ** BigInt(k);
    const N = ((2n * BigInt(Math.abs(n)) * p + BigInt(d)) / (2n * BigInt(d))).toString().padStart(k + 1, '0');
    const t = k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N;
    return (/[1-9]/.test(t) ? sg : '') + t;
  }
  const trueRd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  // 文の値で計算した答え f（分数）と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4）。ちがえば null
  const agree = (f, v, k) => { const a = roundStr(f, k); return a === trueRd(v, k) ? a : null; };
  const fx = f => (f[1] === 1 ? String(f[0]) : dec(f) || F.tex(f));   // 分数 → 整数・小数・\frac
  const fxs = f => (f[0] < 0 ? `(${fx(f)})` : fx(f));                 // 負なら（ ）をつける
  const cfT = (c, body) => (c === 1 ? body : c === -1 ? '-' + body : fmt(c) + body);   // 係数 × 文字（1・−1 は書かない。Z-7）
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  // π の係数 f（分数）× π：64\pi、\pi、\frac{20\pi}{3}、-\frac{\pi}{2}
  function piT(f, useDec) {
    const [n, d] = f, s = n < 0 ? '-' : '', a = Math.abs(n);
    if (n === 0) return '0';
    if (d === 1) return s + (a === 1 ? '' : a) + '\\pi';
    const dd = dec(f); if (useDec && dd != null && dd.replace('-', '').length <= 5) return s + dd.replace('-', '') + '\\pi';
    return `${s}\\frac{${a === 1 ? '' : a}\\pi}{${d}}`;
  }
  // 10 のべき：4×10^{-5}（値 v を、仮数 3けたまでで）
  function sciT(v) {
    if (v === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(v)) + 1e-9), m = +(v / 10 ** e).toFixed(6);
    if (Math.abs(m) >= 10) return sciT(v);   // 起きない
    if (e === 0) return fmt(m);
    return `${fmt(m)}\\times10^{${e}}`;
  }
  // 答えの文の中の数（$…$ ごと。単位と「x=」をとる）
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  const num1 = a => nums(a)[0];
  // シンプソン法（n は偶数）
  function simp(g, a, b, n) { const h = (b - a) / n; let s = g(a) + g(b); for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * g(a + k * h); return s * h / 3; }
  const simp2 = (g, a0, a1, b0, b1, n) => simp(u => simp(v => g(u, v), b0, b1, n), a0, a1, n);

  // ---------------------------------------------------------------- 3つの変数の多項式（成分の式）
  // 項は [係数, xの次数, yの次数, zの次数]。tex は書いた順に
  const mono = (c, i, j, k) => [c, i || 0, j || 0, k || 0];
  function pTeX(ts) {
    const out = [];
    ts.filter(t => t[0] !== 0).forEach((t, n) => {
      const [c, i, j, k] = t, v = (i ? 'x' + (i > 1 ? '^' + i : '') : '') + (j ? 'y' + (j > 1 ? '^' + j : '') : '') + (k ? 'z' + (k > 1 ? '^' + k : '') : '');
      const a = Math.abs(c), body = v ? (a === 1 ? '' : fmt(a)) + v : fmt(a);
      out.push((c < 0 ? '-' : n ? '+' : '') + body);
    });
    return out.length ? out.join('') : '0';
  }
  const pVal = (ts, x, y, z) => ts.reduce((s, [c, i, j, k]) => s + c * x ** i * y ** j * z ** k, 0);
  const pFun = comps => (x, y, z) => comps.map(ts => pVal(ts, x, y, z));
  const vecT = comps => `(${comps.map(pTeX).join(',\\ ')})`;
  // 発散（数で）：中心差分
  const divNum = (Fn, x, y, z) => { const h = 1e-4, d = (k, s) => { const p = [x, y, z]; p[k] += s * h; return Fn(...p)[k]; }; return [0, 1, 2].reduce((t, k) => t + (d(k, 1) - d(k, -1)) / (2 * h), 0); };

  // ---------------------------------------------------------------- 面の積分を数で（ガウスの定理を使わない確かめ）
  // 球の面（中心 C、半径 R）。th0〜th1 は北極からの角（ドームは 0〜π/2）
  function fluxSphere(Fn, R, th1, th0) {
    return simp2((t, p) => { const n = [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)], v = Fn(R * n[0], R * n[1], R * n[2]); return (v[0] * n[0] + v[1] * n[1] + v[2] * n[2]) * R * R * Math.sin(t); }, th0 || 0, th1 == null ? Math.PI : th1, 0, 2 * Math.PI, 96);
  }
  // 箱 [x0,x1]×[y0,y1]×[z0,z1] の6つの面（外向き）
  function fluxBox(Fn, B) {
    let s = 0;
    for (let k = 0; k < 3; k++) for (const side of [0, 1]) {
      const [u, w] = [0, 1, 2].filter(j => j !== k), sg = side ? 1 : -1;
      s += sg * simp2((a, b) => { const p = []; p[k] = B[k][side]; p[u] = a; p[w] = b; return Fn(...p)[k]; }, B[u][0], B[u][1], B[w][0], B[w][1], 16);
    }
    return s;
  }
  // 円柱（軸は z、半径 a、0≦z≦h）の閉じた面
  function fluxCyl(Fn, a, h) {
    const side = simp2((p, z) => { const n = [Math.cos(p), Math.sin(p)], v = Fn(a * n[0], a * n[1], z); return (v[0] * n[0] + v[1] * n[1]) * a; }, 0, 2 * Math.PI, 0, h, 32);
    const cap = zz => simp2((rr, p) => Fn(rr * Math.cos(p), rr * Math.sin(p), zz)[2] * rr, 0, a, 0, 2 * Math.PI, 32);
    return side + cap(h) - cap(0);
  }
  // 放物面 z=c−x²−y²（z≧0）を下から上へ
  function fluxPara(Fn, c) {
    return simp2((rr, p) => { const x = rr * Math.cos(p), y = rr * Math.sin(p), v = Fn(x, y, c - rr * rr); return v[0] * 2 * rr * x + v[1] * 2 * rr * y + v[2] * rr; }, 0, Math.sqrt(c), 0, 2 * Math.PI, 48);
  }

  // 線積分を数で（グリーンの定理を使わない確かめ）。P.path（折れ線）か P.rf（t の関数、0〜2π）。cw なら逆向き
  function lineOf(P, Fn, cw) {
    if (P.path) {
      const pts = cw ? P.path.slice().reverse() : P.path; let s = 0;
      for (let k = 0; k + 1 < pts.length; k++) { const A = pts[k], B = pts[k + 1], d = [B[0] - A[0], B[1] - A[1]]; s += simp(t => { const v = Fn(A[0] + t * d[0], A[1] + t * d[1]); return v[0] * d[0] + v[1] * d[1]; }, 0, 1, 400); }
      return s;
    }
    const h = 1e-5, g = t => { const [x, y] = P.rf(t), a = P.rf(t + h), b = P.rf(t - h), v = Fn(x, y); return v[0] * (a[0] - b[0]) / (2 * h) + v[1] * (a[1] - b[1]) / (2 * h); };
    return (cw ? -1 : 1) * simp(g, 0, 2 * Math.PI, 400);
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く（S-7）。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(8).filter(id => {
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
  const FV = '$\\vec F';
  const vF = comps => `$\\vec F=${vecT(comps)}$`;

  // ================================================================ 8-75 ガウスの定理（発散×体積）
  // 成分：x 成分は a x（＋定数）、y 成分は b y、z 成分は c z。発散 a+b+c が定数
  const lin = (a, k, e) => { const t = [0, 0, 0]; t[k] = 1; return e ? [mono(a, ...t), mono(e)] : [mono(a, ...t)]; };
  const ex75 = (abc, shape, R) => (shape === 'S' && R === 2 && abc.join() === '3,1,2');
  const BAN75 = new Set(['64\\pi', '6']);   // 楽な形の例の答え（O-2・U-2）
  M.add({
    id: '8-75', part: 6, chap: '8-11⑤⑥ 例題1・例題2', stars: 1,
    title: '閉じた面から出る量は「発散×体積」',
    mark: '閉じた面（球・立方体）から出ていく量 $\\oiint_S\\vec F\\cdot\\vec n\\,\\dd S$。成分が1次式。',
    futsu: ['球の面を2つの角で表し、', '$\\vec F\\cdot\\vec n$ を重積分する'],
    raku: ['$(3x,\\ y,\\ 2z)$、半径 $2$ の球', '→ 発散 $3+1+2=6$', '→ $6\\times\\frac{32}{3}\\pi=64\\pi$', '$(2x^2,\\ y^2,\\ 3z)$、1辺 $1$ → 6'],
    why: 'ガウスの定理 $\\oiint_S\\vec F\\cdot\\vec n\\,\\dd S=\\iiint_V\\mathrm{div}\\,\\vec F\\,\\dd V$（8-11⑤）。発散が定数なら「発散×体積」、1次式なら「箱のまん中の値×体積」。',
    caution: '開いた面（底のないドーム）には、そのまま使えない（8-76）。$\\vec n$ は外向き。',
    counts: { s1: 7, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '16mm', s3: '18mm', trap: '18mm' },
    fits(q) {
      if (/底のない|放物面|おわん|テント|通る/.test(q)) return false;
      return /(球|立方体|箱|円柱|半球)/.test(q) && /出る(量|熱)/.test(q) && /\\vec [Fqv]=|発散が/.test(q);
    },
    steps: {
      // 発散が定数：球・立方体
      s1(r) {
        const abc = [r.int(1, 4), r.int(1, 4), r.int(1, 4)], Dv = abc[0] + abc[1] + abc[2];
        const k0 = r.int(0, 3), e = k0 < 3 ? r.pick([1, 2, 3, -1]) : 0;
        const comps = abc.map((a, k) => lin(a, k, k === k0 ? e : 0));
        const shape = r.pick(['S', 'S', 'C']), R = shape === 'S' ? r.pick([1, 2, 3]) : r.pick([1, 2, 3]);
        if (ex75(abc, shape, R)) return null;
        const V = shape === 'S' ? fr(4 * R ** 3, 3) : fr(R ** 3), A = F.mul(fr(Dv), V);
        if (shape === 'S' && A[1] !== 1) return null;
        const a = shape === 'S' ? piT(A) : fx(A);
        if (BAN75.has(a) || !cap(r, '75s1', a)) return null;
        const where = shape === 'S' ? `原点が中心の半径 $${R}$ の球` : `立方体 $0\\leqq x,\\ y,\\ z\\leqq${R}$`;
        const Fn = pFun(comps);
        return { q: `${vF(comps)} が${where}から出る量`, a: `$${a}$`, key: `75|${abc.slice().sort()}|${shape}${R}`,
          easy: shape === 'S' ? `発散 $${Dv}$、$${Dv}\\times\\frac43\\pi\\times${R}^3=${a}$` : `発散 $${Dv}$、$${Dv}\\times${R}^3=${a}$`, easyCheck: 'last',
          verify: p => near(ev(strip(p.a)), shape === 'S' ? fluxSphere(Fn, R) : fluxBox(Fn, [[0, R], [0, R], [0, R]]), 1e-6) || '面の上でたした量とちがう' };
      },
      // 発散が1次式の立方体・箱、発散が定数で成分がまざる球
      s2(r) {
        if (turn(r, '75s2', 3) < 2) {
          // x²・xy・x などから：発散は1次式。箱のまん中の値×体積
          const L = [r.pick([1, 2, 3]), r.pick([1, 2]), r.pick([1, 2, 3])], cube = true;
          if (cube) { L[1] = L[0]; L[2] = L[0]; }
          const kinds = [0, 1, 2].map(() => r.int(0, 2)), co = [0, 1, 2].map(() => r.int(1, 3));
          if (kinds.every(k => k === 2)) return null;   // それは s1
          const comps = [0, 1, 2].map(k => {
            const t = [0, 0, 0];
            if (kinds[k] === 0) t[k] = 2; else if (kinds[k] === 1) { t[k] = 1; t[(k + 1) % 3] = 1; } else t[k] = 1;
            return [mono(co[k], ...t)];
          });
          if (cube && L[0] === 1 && comps.map(pTeX).join() === '2x^2,y^2,3z') return null;   // 楽な形の例（O-2）
          const Fn = pFun(comps), C = L.map(v => v / 2);
          // 発散のまん中の値×体積（分数で）
          let A = fr(0);
          [0, 1, 2].forEach(k => {
            if (kinds[k] === 0) A = F.add(A, F.mul(fr(2 * co[k]), fr(L[k], 2)));
            else if (kinds[k] === 1) A = F.add(A, F.mul(fr(co[k]), fr(L[(k + 1) % 3], 2)));
            else A = F.add(A, fr(co[k]));
          });
          A = F.mul(A, fr(L[0] * L[1] * L[2]));
          const a = fx(A); if (BAN75.has(a) || !cap(r, '75s2', a)) return null;
          const where = `立方体 $0\\leqq x,\\ y,\\ z\\leqq${L[0]}$`;
          return { q: `${vF(comps)} が${where}から出る量`, a: `$${a}$`, key: `75b|${comps.map(pTeX)}|${L}`,
            easy: `$\\mathrm{div}\\,\\vec F$ の箱のまん中 $(${C.map(fmt).join(',\\ ')})$ の値×体積 $${L[0] * L[1] * L[2]}$`, easyCheck: false,
            verify: p => near(ev(strip(p.a)), fluxBox(Fn, [[0, L[0]], [0, L[1]], [0, L[2]]]), 1e-6) || '6つの面でたした量とちがう' };
        }
        // 成分がまざる（2x+y など）。発散は定数
        const abc = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], Dv = abc[0] + abc[1] + abc[2];
        const comps = abc.map((a, k) => { const t = [0, 0, 0]; t[k] = 1; const u = [0, 0, 0]; u[(k + 1) % 3] = 1; return [mono(a, ...t), mono(r.pick([1, -1, 2, -2]), ...u)]; });
        const R = r.pick([1, 2, 3]), A = fr(4 * R ** 3 * Dv, 3); if (A[1] !== 1) return null;
        const a = piT(A); if (BAN75.has(a) || !cap(r, '75s2', a)) return null;
        const Fn = pFun(comps);
        return { q: `${vF(comps)} が原点が中心の半径 $${R}$ の球から出る量`, a: `$${a}$`, key: `75c|${comps.map(pTeX)}|${R}`,
          easy: `発散 $${abc.join('+')}=${Dv}$（$y$ や $z$ の項は、$x$ で微分すると0）、$${Dv}\\times\\frac43\\pi\\times${R}^3$`, easyCheck: false,
          verify: p => near(ev(strip(p.a)), fluxSphere(Fn, R), 1e-6) || '面の上でたした量とちがう' };
      },
      // 見かけがちがう：円柱の閉じた面・半球の閉じた面・熱を出す部品の箱
      s3(r) {
        const kind = turn(r, '75s3', 3);
        if (kind === 0) {
          const abc = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], Dv = abc[0] + abc[1] + abc[2], a0 = r.pick([1, 2, 3]), h = r.pick([1, 2, 3, 4, 5]);
          const comps = abc.map((a, k) => lin(a, k, 0)), A = fr(Dv * a0 * a0 * h), a = piT(A);
          if (BAN75.has(a) || !cap(r, '75s3', a)) return null;
          const Fn = pFun(comps);
          return { q: `${vF(comps)} が閉じた円柱 $x^2+y^2\\leqq${a0 * a0}$、$0\\leqq z\\leqq${h}$ から出る量`, a: `$${a}$`, key: `75d|${abc}|${a0},${h}`,
            easy: `$${Dv}\\times\\pi\\times${a0}^2\\times${h}=${a}$`, easyCheck: 'last',
            verify: p => near(ev(strip(p.a)), fluxCyl(Fn, a0, h), 1e-6) || '面の上でたした量とちがう' };
        }
        if (kind === 1) {
          const abc = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], Dv = abc[0] + abc[1] + abc[2], R = r.pick([1, 2, 3]);
          const A = fr(2 * Dv * R ** 3, 3); if (A[1] !== 1) return null;
          const comps = abc.map((a, k) => lin(a, k, 0)), a = piT(A); if (BAN75.has(a) || !cap(r, '75s3', a)) return null;
          const Fn = pFun(comps);
          return { q: `${vF(comps)} が閉じた半球 $x^2+y^2+z^2\\leqq${R * R}$、$z\\geqq0$ から出る量`, a: `$${a}$`, key: `75e|${abc}|${R}`,
            easy: `$${Dv}\\times\\frac23\\pi\\times${R}^3=${a}$`, easyCheck: 'last',
            verify: p => near(ev(strip(p.a)), fluxSphere(Fn, R, Math.PI / 2) - simp2((rr, ph) => Fn(rr * Math.cos(ph), rr * Math.sin(ph), 0)[2] * rr, 0, R, 0, 2 * Math.PI, 32), 1e-6) || '面の上でたした量とちがう' };
        }
        // 熱の流れ q=(cx, cy, cz)〔W/m²〕、1辺 L の立方体の箱
        const c = r.pick([100, 200, 300, 500, 1000, 2000]), L = r.pick([0.1, 0.2, 0.05]);
        const A = F.mul(fr(3 * c), F.mul(D(L), F.mul(D(L), D(L)))); if (decLen(A) > 3) return null;
        const a = fx(A); if (BAN75.has(a) || !cap(r, '75s3', a)) return null;
        return { q: `熱の流れ $\\vec q=(${c}x,\\ ${c}y,\\ ${c}z)$〔$\\mathrm{W/m^2}$〕。1辺 ${U(L, 'm')} の立方体の箱から出る熱 ＝ $□\\,\\mathrm{W}$`, a: `$${a}$`, key: `75f|${c}|${L}`,
          easy: `$\\mathrm{div}\\,\\vec q=${3 * c}$、$${3 * c}\\times${fmt(L)}^3=${a}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), fluxBox((x, y, z) => [c * x, c * y, c * z], [[0, L], [0, L], [0, L]]), 1e-6) || '6つの面でたした熱とちがう' };
      },
      // わな：底のないドーム（8-76）
      trap(r) {
        const abc = [r.int(1, 2), r.int(1, 2), r.int(1, 2)], d = r.pick([1, 2, 3]), R = r.pick([1, 2, 3]), Dv = abc[0] + abc[1] + abc[2];
        const comps = abc.map((a, k) => lin(a, k, k === 2 ? d : 0));
        const A = F.add(fr(2 * Dv * R ** 3, 3), fr(d * R * R)); if (A[1] !== 1) return null;
        if (abc.join() === '1,1,1' && d === 3 && R === 2) return null;   // 8-76 の例
        const a = piT(A), Fn = pFun(comps);
        return dest({ q: `${vF(comps)} が底のない半径 $${R}$ のドーム（$z\\geqq0$）を内から外へ通る量`, a: `$${a}$`, key: `75t|${abc}|${d}|${R}`,
          verify: p => near(ev(strip(p.a)), fluxSphere(Fn, R, Math.PI / 2), 1e-6) || 'ドームの上でたした量とちがう' }, '8-75', '閉じた面ではない。ふたをして閉じ、ふたの分をひく', ['8-76']);
      },
    },
  });

  // ================================================================ 8-76 ドームにふたをする
  const ex76 = (abc, d, R) => abc.join() === '1,1,1' && d === 3 && R === 2;
  const BAN76 = new Set(['28\\pi']);
  const minusT = (x, y) => (y[0] < 0 ? `${piT(x)}-(${piT(y)})` : `${piT(x)}-${piT(y)}`);
  const sqT = c => (Number.isInteger(Math.sqrt(c)) ? String(Math.sqrt(c)) : `\\sqrt{${c}}`);
  M.add({
    id: '8-76', part: 6, chap: '8-11⑥ 例題3', stars: 1,
    title: '開いた面（ドーム）は、ふたをして閉じ、ふたの分をひく',
    mark: '底のないドーム・放物面・おわんを「内から外へ」通る量。閉じていない面。',
    futsu: ['ドームの面を2つの角で表し、', '$\\vec F\\cdot\\vec n$ を重積分する'],
    raku: ['$(x,\\ y,\\ z+3)$、半径 $2$ のドーム', '全体 $3\\times\\frac{16}{3}\\pi=16\\pi$', 'ふた（下向き）$-3\\times4\\pi$', '→ $16\\pi-(-12\\pi)=28\\pi$'],
    why: 'ふたをして閉じると、ガウスの定理が使える（8-11⑥）。ドーム＝（閉じた全体）－（ふた）。ふたは $z=0$ を入れた $\\vec F\\cdot\\vec n$×面積。',
    caution: 'ふたの外向きは下向き（$\\vec F\\cdot\\vec n=-F_z$）。「発散×体積」だけでは、ふたの分がちがう。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '18mm', trap: '12mm' },
    fits(q) { return /ドーム|底のない|放物面|おわん|テント/.test(q) && /通る/.test(q); },
    steps: {
      // 半球のドーム：ふたは F_z(z=0)=d
      s1(r) {
        const abc = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], d = r.pick([1, 2, 3, 4, -1, -2]), R = r.pick([1, 2, 3]), Dv = abc[0] + abc[1] + abc[2];
        if (ex76(abc, d, R)) return null;
        const comps = abc.map((a, k) => lin(a, k, k === 2 ? d : 0));
        const cl = fr(2 * Dv * R ** 3, 3); if (cl[1] !== 1) return null;
        const A = F.add(cl, fr(d * R * R)), a = piT(A); if (A[0] <= 0 || BAN76.has(a) || !cap(r, '76s1', a)) return null;
        const Fn = pFun(comps);
        return { q: `${vF(comps)} が底のない半径 $${R}$ のドーム（$z\\geqq0$）を内から外へ通る量`, a: `$${a}$`, key: `76|${abc}|${d}|${R}`,
          easy: `閉じた全体 $${piT(cl)}$、ふた $${piT(fr(-d * R * R))}$、$${minusT(cl, fr(-d * R * R))}=${a}$`, easyCheck: false,
          verify: p => near(ev(strip(p.a)), fluxSphere(Fn, R, Math.PI / 2), 1e-6) || 'ドームの上でたした量とちがう' };
      },
      // 放物面（体積を文に）・外側から内側へ
      s2(r) {
        if (turn(r, '76s2', 2) === 0) {
          const c = r.pick([1, 2, 4]), abc = [r.int(1, 2), r.int(1, 2), r.int(1, 3)], d = r.pick([0, 1, 2, 3]), Dv = abc[0] + abc[1] + abc[2];
          if (c === 1 && d === 0 && abc.join() === '1,1,1') return null;   // 教科書のじぶんでとこう
          const comps = abc.map((a, k) => lin(a, k, k === 2 ? d : 0)), V = fr(c * c, 2);
          const cl = F.mul(fr(Dv), V), A = F.add(cl, fr(d * c)), a = piT(A); if (BAN76.has(a) || !cap(r, '76s2', a)) return null;
          const Fn = pFun(comps);
          // 体積はかっこで前に置き、「＝ □」が聞く量（通る量）につくように（Z-6）
          return { q: `${vF(comps)} が底のない放物面 $z=${c}-x^2-y^2$（$z\\geqq0$。下の立体の体積は $${piT(V)}$）を下から上へ通る量`, a: `$${a}$`, key: `76p|${abc}|${d}|${c}`,
            easy: `閉じた全体 $${Dv}\\times${piT(V)}$、ふた（半径 $${sqT(c)}$ の円、下向き）$${piT(fr(-d * c))}$`, easyCheck: false,
            verify: p => near(ev(strip(p.a)), fluxPara(Fn, c), 1e-6) || '放物面の上でたした量とちがう' };
        }
        const abc = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], d = r.pick([1, 2, 3, -1]), R = r.pick([1, 2, 3]), Dv = abc[0] + abc[1] + abc[2];
        if (ex76(abc, d, R)) return null;
        const comps = abc.map((a, k) => lin(a, k, k === 2 ? d : 0)), cl = fr(2 * Dv * R ** 3, 3); if (cl[1] !== 1) return null;
        const A = neg(F.add(cl, fr(d * R * R))), a = piT(A); if (BAN76.has(a) || !cap(r, '76s2', a)) return null;
        const Fn = pFun(comps);
        return { q: `${vF(comps)} が底のない半径 $${R}$ のドーム（$z\\geqq0$）を外から内へ通る量`, a: `$${a}$`, key: `76i|${abc}|${d}|${R}`,
          easy: `内側から外側へが $${piT(neg(A))}$。向きが逆なので符号を変える`, easyCheck: false,
          verify: p => near(ev(strip(p.a)), -fluxSphere(Fn, R, Math.PI / 2), 1e-6) || 'ドームの上でたした量とちがう' };
      },
      // 見かけがちがう：おわん（ふたは上向き）・上向きの一様な風とテント
      s3(r) {
        if (turn(r, '76s3', 2) === 0) {
          const abc = [r.int(1, 3), r.int(1, 3), r.int(1, 3)], d = r.pick([1, 2, 3, 4]), R = r.pick([1, 2, 3]), Dv = abc[0] + abc[1] + abc[2];
          const comps = abc.map((a, k) => lin(a, k, k === 2 ? d : 0)), cl = fr(2 * Dv * R ** 3, 3); if (cl[1] !== 1) return null;
          const A = F.sub(cl, fr(d * R * R)), a = piT(A); if (BAN76.has(a) || !cap(r, '76s3', a)) return null;
          const Fn = pFun(comps);
          return { q: `${vF(comps)} が上の開いた半径 $${R}$ のおわん（$z\\leqq0$）を内から外へ通る量`, a: `$${a}$`, key: `76b|${abc}|${d}|${R}`,
            easy: `閉じた全体 $${piT(cl)}$、ふた（$z=0$、上向き）$${piT(fr(d * R * R))}$`, easyCheck: false,
            verify: p => near(ev(strip(p.a)), fluxSphere(Fn, R, Math.PI, Math.PI / 2), 1e-6) || 'おわんの上でたした量とちがう' };
        }
        const v = r.pick([2, 3, 4, 5, 0.5, 1.5]), R = r.pick([2, 3, 4, 5]), A = F.mul(D(v), fr(R * R)), a = piT(A, true);
        if (BAN76.has(a) || !cap(r, '76s3', a)) return null;
        return { q: `上向きの一様な風 $\\vec v=(0,\\ 0,\\ ${fmt(v)})$〔$\\mathrm{m/s}$〕が、底のない半径 ${U(R, 'm')} のドーム形のテントを内から外へ通る量 ＝ $□\\,\\mathrm{m^3/s}$`, a: `$${a}$`, key: `76w|${v}|${R}`,
          easy: `発散0。ふた（下向き）$-${fx(A)}\\pi$ なので、テントは $${a}$`, easyCheck: false,
          verify: p => near(num1(p.a), fluxSphere(() => [0, 0, v], R, Math.PI / 2), 1e-6) || 'ドームの上でたした量とちがう' };
      },
      // わな：立方体の6つの面（閉じた面。8-59・8-75）
      trap(r) {
        const a = r.pick([2, 3, 4]), b = r.pick([1, 2, 3]), comps = [[mono(1, 2)], [mono(a, 0, 1)], [mono(b, 0, 0, 1)]];
        if (a === 2 && b === 1) return null;   // 8-59 の例
        const A = 1 + a + b, Fn = pFun(comps); if (!cap(r, '76t', String(A), 1)) return null;
        return dest({ q: `${vF(comps)} が立方体 $0\\leqq x,\\ y,\\ z\\leqq1$ の6つの面から出る量`, a: `$${A}$`, key: `76t|${a}|${b}`,
          verify: p => near(ev(strip(p.a)), fluxBox(Fn, [[0, 1], [0, 1], [0, 1]]), 1e-6) || '6つの面でたした量とちがう' }, '8-76', '閉じた面なので、ふたはいらない', ['8-59']);
      },
    },
  });

  // ================================================================ 8-77 対称な袋・道（ガウスの法則・アンペールの法則）
  // 定数の単位も書く（Z-8）。8-78（s2・わな）は文が長くなり右ページがあふれるので書かない（Z-8「文が長くなりすぎなければ」）
  const KU = '9.0\\times10^9\\,\\mathrm{N\\cdot m^2/C^2}';
  const Kt = `$k=${KU}$`;
  const MUt = '$\\mu_0=4\\pi\\times10^{-7}\\,\\mathrm{T\\cdot m/A}$';
  const C9 = n => `${fmt(n)}.0\\times10^{-9}`;
  const ex77 = new Set(['P|1|0.3', 'L|1|0.3', 'W|2|8|0.5']);
  M.add({
    id: '8-77', part: 6, chap: '8-11⑦⑬ 例題4・例題5・例題13', stars: 1,
    title: '対称な袋・道：大きさ×面積＝中の量',
    mark: '点の電荷・線の電荷・導線・一様な球。「□ m の所の電場（磁場・重力）の大きさ」。',
    futsu: ['電荷を小さく分け、', '1つずつの電場を', '重積分でたし合わせる'],
    raku: ['点電荷 $1.0\\times10^{-9}\\,\\mathrm C$、$0.3\\,\\mathrm m$', '球の袋 $E\\times4\\pi r^2=4\\pi kQ$', '→ $E=\\frac{kQ}{r^2}=100\\,\\mathrm{N/C}$', '線電荷は円柱の袋 $\\frac{2k\\lambda}{r}$'],
    why: 'ガウスの法則（$\\oiint\\vec E\\cdot\\vec n\\,\\dd S=4\\pi kQ$）とアンペールの法則（$\\oint\\vec B\\cdot\\dd\\vec r=\\mu_0I$）。場に合った袋・道なら「大きさ×面積（長さ）」（8-11⑦⑬）。',
    caution: '場全体が袋と同じ対称性のときだけ（電荷が2つでは使えない）。球・導線の中は、中の量の割合で。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '22mm', s3: '16mm', trap: '14mm' },
    fits(q) {
      if (/Q_2|2つをかこむ|もう1つ|流束/.test(q)) return false;
      return /(電場|磁場|重力)/.test(q) && /(電荷|導線|星|地球)/.test(q) && !/強くなる|弱くなる|1周/.test(q);
    },
    steps: {
      // 点電荷・線電荷の電場
      s1(r) {
        const kind = turn(r, '77s1', 2) === 0 ? 'P' : 'L', q = r.pick([1, 2, 3, 4, 5, 6, 8]), rr = r.pick([0.1, 0.2, 0.3, 0.5, 0.6, 1, 1.5, 2, 3]);
        if (ex77.has(`${kind}|${q}|${rr}`)) return null;
        const A = kind === 'P' ? F.div(fr(9 * q), F.mul(D(rr), D(rr))) : F.div(fr(18 * q), D(rr));
        if (decLen(A) > 1 || F.val(A) > 20000) return null;
        const a = fx(A); if (!cap(r, '77s1', a)) return null;
        const q0 = kind === 'P' ? `点電荷 $Q=${C9(q)}\\,\\mathrm{C}$ から ${U(rr, 'm')}` : `長い線電荷 $\\lambda=${C9(q)}\\,\\mathrm{C/m}$ から ${U(rr, 'm')}`;
        return { q: `${q0} の電場の大きさ（${Kt}）＝ $□\\,\\mathrm{N/C}$`, a: `$${a}$`, key: `77${kind}|${q}|${rr}`,
          easy: kind === 'P' ? `$E=\\frac{kQ}{r^2}=\\frac{${9 * q}}{${fmt(rr * rr)}}$` : `$E=\\frac{2k\\lambda}{r}=\\frac{${18 * q}}{${fmt(rr)}}$`, easyCheck: false,
          // 確かめ：電荷を小さく分けてたす（点はそのまま、線は長い線を細かく分けて数でたす）
          verify: p => { const kq = 9e9 * q * 1e-9; const E = kind === 'P' ? kq / rr ** 2 : 2 * simp(s => kq * rr / (rr * rr + s * s) ** 1.5, 0, 2000 * rr, 200000); return near(num1(p.a), E, 1e-4) || `電場は ${E} のはず`; } };
      },
      // 導線の外・導線の中・一様な球の中
      s2(r) {
        const kind = turn(r, '77s2', 3);
        if (kind === 0) {
          const I = r.pick([2, 3, 4, 5, 6, 10, 20]), rr = r.pick([0.01, 0.02, 0.04, 0.05, 0.1, 0.2]), B = 2e-7 * I / rr;
          const a = sciT(B); if (!/^\d(\.\d)?\\times10\^\{-\d\}$/.test(a) || !cap(r, '77s2', a)) return null;
          return { q: `まっすぐな導線（${U(I, 'A')}）から ${U(rr, 'm')} の磁場の大きさ（${MUt}）＝ $□\\,\\mathrm{T}$`, a: `$${a}$`, key: `77W|${I}|${rr}`,
            easy: `$B\\times2\\pi\\times${fmt(rr)}=4\\pi\\times10^{-7}\\times${I}$`, easyCheck: false,
            verify: p => near(num1(p.a), 4 * Math.PI * 1e-7 * I / (2 * Math.PI * rr), 1e-9) || '円の道の式とちがう' };
        }
        if (kind === 1) {
          const amm = r.pick([2, 4, 5, 10]), I = r.pick([2, 4, 5, 8, 10, 20]), rmm = r.pick([1, 2, 0.5, 2.5, 4, 5].filter(v => v < amm));
          if (ex77.has(`W|${amm}|${I}|${rmm}`)) return null;
          const Iin = I * rmm * rmm / (amm * amm), B = 2e-7 * Iin / (rmm / 1000);
          const a = sciT(B); if (!/^\d(\.\d)?\\times10\^\{-\d\}$/.test(a) || !cap(r, '77s2', a)) return null;
          return { q: `半径 ${U(amm, 'mm')} の導線に ${U(I, 'A')} が一様に流れる。中心から ${U(rmm, 'mm')} の磁場の大きさ（${MUt}）＝ $□\\,\\mathrm{T}$`, a: `$${a}$`, key: `77w|${amm}|${I}|${rmm}`,
            easy: `中の電流 $${I}\\times\\left(\\frac{${fmt(rmm)}}{${amm}}\\right)^2=${fmt(Iin)}$、$B\\times2\\pi r=\\mu_0\\times${fmt(Iin)}$`, easyCheck: false,
            verify: p => { const j = I / (Math.PI * (amm / 1000) ** 2), Iq = simp(s => j * 2 * Math.PI * s, 0, rmm / 1000, 200); return near(num1(p.a), 4 * Math.PI * 1e-7 * Iq / (2 * Math.PI * rmm / 1000), 1e-7) || '中の電流から出した磁場とちがう'; } };
        }
        const g0 = r.pick([10, 6, 4, 12, 3.6, 8]), [n, d] = r.pick([[1, 2], [1, 4], [3, 4], [1, 3], [2, 3], [2, 5]]);
        const A = F.mul(D(g0), fr(n, d)); if (decLen(A) > 2) return null;
        const a = fx(A); if (!cap(r, '77s2', a)) return null;
        const fT = n === 1 ? `\\frac{R}{${d}}` : `\\frac{${n}R}{${d}}`;
        return { q: `密度が一様な半径 $R$ の星の表面の重力が ${U(g0, 'm/s^2')}。中心から $${fT}$ の重力 ＝ $□\\,\\mathrm{m/s^2}$`, a: `$${a}$`, key: `77g|${g0}|${n}/${d}`,
          easy: `中の質量は $\\left(\\frac{${n}}{${d}}\\right)^3$ 倍、面積は $\\left(\\frac{${n}}{${d}}\\right)^2$ 倍で、$${fmt(g0)}\\times\\frac{${n}}{${d}}$`, easyCheck: false,
          verify: p => { const s = n / d, Min = simp(t => 3 * t * t, 0, s, 200); return near(num1(p.a), g0 * Min / (s * s), 1e-8) || '中の質量から出した重力とちがう'; } };
      },
      // 見かけがちがう：地球の中・磁場から電流を・線電荷の距離
      s3(r) {
        const kind = turn(r, '77s3', 3);
        if (kind === 0) {
          const [n, d] = r.pick([[1, 4], [3, 4], [1, 5], [2, 5], [1, 10], [3, 10]]), A = F.mul(D(9.8), fr(n, d)); if (decLen(A) > 3) return null;
          const a = fx(A); if (!cap(r, '77s3', a)) return null;
          return { q: `地球の密度が一様で、地面の重力が ${U(9.8, 'm/s^2')} なら、中心から半径の $\\frac{${n}}{${d}}$ の所の重力 ＝ $□\\,\\mathrm{m/s^2}$`, a: `$${a}$`, key: `77e|${n}/${d}`,
            easy: `中心から $\\frac{${n}}{${d}}R$ なので、$9.8\\times\\frac{${n}}{${d}}$`, easyCheck: false,
            verify: p => near(num1(p.a), 9.8 * (n / d) ** 3 / (n / d) ** 2, 1e-9) || '中の質量から出した重力とちがう' };
        }
        if (kind === 1) {
          const I = r.pick([2, 3, 4, 5, 8, 10, 15, 25]), rr = r.pick([0.01, 0.02, 0.05, 0.1]), B = 2e-7 * I / rr, bt = sciT(B);
          if (!/^\d(\.\d)?\\times10\^\{-\d\}$/.test(bt) || !cap(r, '77s3', String(I))) return null;
          return { q: `まっすぐな導線から ${U(rr, 'm')} の磁場が $${bt}\\,\\mathrm{T}$。電流（${MUt}）＝ $□\\,\\mathrm{A}$`, a: `$${I}$`, key: `77i|${I}|${rr}`,
            easy: `$${bt}\\times2\\pi\\times${fmt(rr)}=4\\pi\\times10^{-7}\\times I$`, easyCheck: false,
            verify: p => near(num1(p.a) * 4 * Math.PI * 1e-7 / (2 * Math.PI * rr), B, 1e-9) || '円の道の式で磁場がもどらない' };
        }
        const EA = r.pick([60, 90, 120, 180, 240, 360]), rA = r.pick([0.1, 0.2, 0.3, 0.6]), m = r.pick([2, 3, 4, 5]), far = r.chance(0.5);
        const rq = +(far ? rA * m : rA / m).toFixed(6); if (decLen(D(rq)) > 3) return null;
        const A = F.div(F.mul(fr(EA), D(rA)), D(rq)); if (decLen(A) > 1) return null;
        const a = fx(A); if (!cap(r, '77s3', a)) return null;
        return { q: `長い線電荷から ${U(fmt(rA), 'm')} の電場が ${U(EA, 'N/C')}。${U(fmt(rq), 'm')} の電場の大きさ ＝ $□\\,\\mathrm{N/C}$`, a: `$${a}$`, key: `77r|${EA}|${rA}|${rq}`,
          easy: `円柱の袋の側面は $r$ に比例するので、$E$ は $\\frac1r$ に比例：$${EA}\\times\\frac{${fmt(rA)}}{${fmt(rq)}}$`, easyCheck: false,
          verify: p => near(num1(p.a) * rq, EA * rA, 1e-9) || '$E\\times r$ が同じにならない' };
      },
      // わな：電荷が2つ（場が球対称でない）。それぞれの電場をたす（わざなし）
      trap(r) {
        const q1 = r.pick([1, 2, 4]), q2 = r.pick([1, 2, 3]), R = r.pick([0.3, 0.6]), s = r.pick([0.1, 0.2].filter(v => v < R));
        const E = F.add(F.div(fr(9 * q1), F.mul(D(R), D(R))), F.div(fr(9 * q2), F.mul(D(+(R - s).toFixed(6)), D(+(R - s).toFixed(6)))));
        if (decLen(E) > 1) return null;
        return dest({ q: `原点に $Q_1=${C9(q1)}\\,\\mathrm{C}$、点 $(${fmt(s)},\\ 0,\\ 0)$ に $Q_2=${C9(q2)}\\,\\mathrm{C}$。2つをかこむ半径 ${U(R, 'm')} の球の袋の上の点 $(${fmt(R)},\\ 0,\\ 0)$ の電場の大きさ（${Kt}）＝ $□\\,\\mathrm{N/C}$`,
          a: `$${fx(E)}$`, key: `77t|${q1}|${q2}|${R}|${s}`,
          verify: p => near(num1(p.a), 9e9 * q1 * 1e-9 / R ** 2 + 9e9 * q2 * 1e-9 / (R - s) ** 2, 1e-8) || '2つの電場の和とちがう' }, '8-77', '場が球対称でないので、袋の上で大きさは一定でない。$\\frac{kQ}{r^2}$ を2つたす', ['8-32']);
      },
    },
  });

  // ================================================================ 8-78 袋を通る量は中の量で決まる
  // 点のわき出し c·(x,y,z)/r³ の全体は 4πc。袋のまん中から見て同じ形の面に等分
  const BAG = [['立方体', 6], ['正四面体', 4]];
  const rho3 = c => `$\\frac{${c === 1 ? '' : c}(x,\\ y,\\ z)}{r^3}$`;
  const BAN78 = new Set(['\\frac{2\\pi}{3}', '0']);
  // 立方体の袋（まん中が原点、1辺2）の面を数でたす：場 (x,y,z)/r³ の z=1 の面を、ほかの面へ回す
  const faceCube = () => simp2((x, y) => 1 / (x * x + y * y + 1) ** 1.5, -1, 1, -1, 1, 64);
  M.add({
    id: '8-78', part: 6, chap: '8-11④⑧ 例題6・例題7', stars: 1,
    title: '袋を通る量は中の量で決まる：同じ形の面に等分、外なら0',
    mark: '立方体・正四面体の袋の1つの面、池の口をかこむ道、「袋の外に出すと」。',
    futsu: ['面をタイルに分け、', '面に直角な成分×面積を', '重積分でたす'],
    raku: ['立方体の袋のまん中の電荷', '→ 1つの面は全体の $\\frac16$', '電荷を袋の外へ → 0', '池の口 $Q=4$ をかこむ道 → 4'],
    why: '袋の形を変えても、出ていく量は中の量（電荷・口）だけで決まる（8-11④）。まん中から見て同じ形の面には同じだけ通る。中に何もなければ0。',
    caution: '流束は等分できても、面の上の電場の大きさは一定でない。電荷がまん中でないと、等分にならない。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '20mm', s2: '22mm', s3: '22mm', trap: '22mm' },
    fits(q) {
      if (/電場の大きさ|磁場の大きさ/.test(q)) return false;
      return /袋|口|部品/.test(q) && /(流束|出る量|出る熱|速さ)/.test(q);
    },
    steps: {
      // (x,y,z)/r³ の袋の面、池の口
      s1(r) {
        if (turn(r, '78s1', 3) < 2) {
          const c = r.pick([1, 2, 3, 4, 6, 9]), [bag, n] = r.pick(BAG), m = n === 6 ? r.pick([1, 1, 2, 3, 5]) : r.pick([1, 1, 2, 3]);
          const A = fr(4 * c * m, n), a = piT(A); if (BAN78.has(a) || !cap(r, '78s1', a)) return null;
          const which = `${m}つの面`;
          return { q: `場 ${rho3(c)}（全体の流束 $${piT(fr(4 * c))}$）が、まん中が原点の${bag}の袋の${which}を通る流束`, a: `$${a}$`, key: `78|${c}|${n}|${m}`,
            easy: `$${piT(fr(4 * c))}\\times\\frac{${m}}{${n}}=${a}$`, easyCheck: 'last',
            verify: p => near(ev(strip(p.a)), n === 6 ? c * m * faceCube() : c * m * 4 * Math.PI / 4, 1e-6) || '面の上でたした流束とちがう' };
        }
        // 池：口が3つ。かこむ口の量をたす
        const qs = [r.pick([2, 3, 4, 5, 6]), r.pick([1, 2, 3, 7]), -r.pick([1, 2, 3, 4, 5])], pick = r.pick([[0, 2], [1, 2], [0, 1], [2], [0, 1, 2]]);
        const A = pick.reduce((s, k) => s + qs[k], 0); if (String(A) === '0' || !cap(r, '78s1', String(A))) return null;
        const nm = ['A', 'B', 'C'], shape = r.pick(['正方形の道', '三角形の道', '円の道', 'だ円の道']);
        return { q: `池の口 A（$${qs[0]}$ わき出す）・B（$${qs[1]}$ わき出す）・C（$${-qs[2]}$ 吸いこむ）〔$\\mathrm{m^2/s}$〕。${pick.length === 3 ? 'A・B・C をすべて' : pick.map(k => nm[k]).join('と') + 'だけを'}かこむ${shape}から出る量 ＝ $□\\,\\mathrm{m^2/s}$`, a: `$${A}$`, key: `78p|${qs}|${pick}`,
          easy: pick.length === 1 ? `かこんだのは ${nm[pick[0]]} だけ：$${A}$` : `かこんだ口の量をたす：$${pick.map(k => (qs[k] < 0 ? `(${qs[k]})` : qs[k])).join('+')}=${A}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), pick.reduce((s, k) => s + simp(t => qs[k] / (2 * Math.PI), 0, 2 * Math.PI, 8), 0), 1e-9) || 'かこんだ口から出る量の和とちがう' };
      },
      // 4πkQ の形・袋の中と外の電荷・池の口からの速さ
      s2(r) {
        const kind = turn(r, '78s2', 3);
        if (kind === 0) {
          const q = r.pick([1, 2, 3, 4, 5]), [bag, n] = r.pick(BAG), A = fr(36 * q, n), a = piT(A); if (!cap(r, '78s2', a)) return null;
          return { q: `${bag}の袋のまん中の点電荷 $Q=${C9(q)}\\,\\mathrm{C}$。1つの面を通る電場の流束（全体は $4\\pi kQ$、$k=9.0\\times10^9$）＝ $□\\,\\mathrm{N\\cdot m^2/C}$`, a: `$${a}$`, key: `78k|${q}|${n}`,
            easy: `全体 $4\\pi\\times9.0\\times10^9\\times${C9(q)}=${piT(fr(36 * q))}$、その $\\frac{1}{${n}}$`, easyCheck: false,
            verify: p => near(num1(p.a), (n === 6 ? faceCube() : Math.PI) * 9e9 * q * 1e-9, 1e-6) || '面の上でたした流束とちがう' };
        }
        if (kind === 1) {
          const qin = [r.pick([1, 2, 3, 4]), -r.pick([1, 2, 3])], qout = r.pick([1, 2, 5]), inB = r.chance(0.5);
          const tot = inB ? qin[0] + qin[1] : qin[0], A = fr(36 * tot), a = piT(A); if (!cap(r, '78s2', a)) return null;
          const q1 = `$Q_1=${C9(qin[0])}\\,\\mathrm{C}$`, q2 = `$Q_2=-${C9(-qin[1])}\\,\\mathrm{C}$`, q3 = `$Q_3=${C9(qout)}\\,\\mathrm{C}$`;
          return { q: `${inB ? `袋の中に${q1}と${q2}、外に${q3}` : `袋の中に${q1}、外に${q2}と${q3}`}。袋全体の電場の流束（$\\frac{1}{\\varepsilon_0}=4\\pi k$、$k=9.0\\times10^9$）＝ $□\\,\\mathrm{N\\cdot m^2/C}$`, a: `$${a}$`, key: `78q|${qin}|${inB}|${qout}`,
            easy: `中の電荷だけ：$4\\pi k\\times(${inB ? `${C9(qin[0])}-${C9(-qin[1])}` : C9(qin[0])})$`, easyCheck: false,
            verify: p => near(num1(p.a), 4 * Math.PI * 9e9 * (qin[0] + (inB ? qin[1] : 0)) * 1e-9, 1e-9) || '中の電荷の和とちがう' };
        }
        const Q = r.pick([1, 2, 3, 4, 6, 8, 10]), rr = r.pick([0.25, 0.5, 1, 2, 4, 5]);
        if (Q === 4 && rr === 2) return null;   // 楽な形の例
        const A = F.div(fr(Q), F.mul(fr(2), D(rr))), a = A[1] === 1 ? `\\frac{${A[0]}}{\\pi}` : `\\frac{${A[0]}}{${A[1]}\\pi}`;
        if (!cap(r, '78s2', a)) return null;
        return { q: `$${Q}\\,\\mathrm{m^2/s}$ わき出す口だけの池。口から ${U(rr, 'm')} の水の速さ ＝ $□\\,\\mathrm{m/s}$`, a: `$${a.replace(/^\\frac\{1\}/, '\\frac{1}')}$`, key: `78v|${Q}|${rr}`,
          easy: `$v\\times2\\pi\\times${fmt(rr)}=${Q}$`, easyCheck: false,
          verify: p => near(num1(p.a), Q / (2 * Math.PI * rr), 1e-9) || '円から出る量の式とちがう' };
      },
      // 見かけがちがう：全体の値を文に書いた電場（約）・熱を出す部品の箱
      s3(r) {
        if (turn(r, '78s3', 2) === 0) {
          const q = r.pick([1, 2, 3, 4, 5, 6]), [bag, n] = r.pick(BAG), tv = q * 1e-9 / 8.85e-12, tt = Math.round(tv);
          const a = agree(fr(tt, n), tv / n, 1); if (a == null || !cap(r, '78s3', a)) return null;
          return { q: `${bag}の袋のまん中の点電荷 $Q=${C9(q)}\\,\\mathrm{C}$。全体の流束は約 $${tt}\\,\\mathrm{N\\cdot m^2/C}$。1つの面の流束（小数第1位まで）＝ 約 $□\\,\\mathrm{N\\cdot m^2/C}$`, a: `$${a}$`, key: `78e|${q}|${n}`,
            easy: `$${tt}\\div${n}\\approx${a}$`, easyCheck: false,
            verify: p => near(num1(p.a), Math.round(10 * (n === 6 ? faceCube() / (4 * Math.PI) : 0.25) * tv) / 10, 1e-9) || '面の上でたした流束を丸めた値とちがう' };
        }
        const P = r.pick([6, 12, 18, 24, 30, 3, 9, 15]), bigger = r.chance(0.35);
        const a = bigger ? fx(fr(P)) : fx(fr(P, 6)); if (decLen(D(+(bigger ? P : P / 6).toFixed(6))) > 1 || !cap(r, '78s3', a)) return null;
        return { q: bigger ? `$${P}\\,\\mathrm{W}$ の熱を出す部品を、どんな形の箱でかこんでも、箱から出る熱 ＝ $□\\,\\mathrm{W}$（温度は一定）` : `$${P}\\,\\mathrm{W}$ の熱を出す部品を立方体の箱のまん中に置く（温度は一定）。1つの面から出る熱 ＝ $□\\,\\mathrm{W}$`,
          a: `$${a}$`, key: `78h|${P}|${bigger}`, easy: bigger ? '中で生まれる熱だけで決まる（袋の形によらない）' : `6つの面に等分：$${P}\\div6$`, easyCheck: false,
          verify: p => near(num1(p.a), bigger ? P : P * faceCube() / (4 * Math.PI), 1e-6) || '面の上でたした熱とちがう' };
      },
      // わな：面のまん中の点の電場の大きさ（流束ではない。8-77）
      trap(r) {
        const q = r.pick([1, 2, 3, 4]), L = r.pick([0.2, 0.4, 0.6]), h = +(L / 2).toFixed(6), E = F.div(fr(9 * q), F.mul(D(h), D(h)));
        if (decLen(E) > 1) return null;
        return dest({ q: `1辺 ${U(L, 'm')} の立方体の袋のまん中の点電荷 $Q=${C9(q)}\\,\\mathrm{C}$。1つの面のまん中の点の電場の大きさ（$k=9.0\\times10^9$）＝ $□\\,\\mathrm{N/C}$`, a: `$${fx(E)}$`, key: `78t|${q}|${L}`,
          verify: p => near(num1(p.a), 9e9 * q * 1e-9 / h ** 2, 1e-9) || '点電荷の電場とちがう' }, '8-78', '流束ではなく1点の電場。電荷から1辺の半分の距離の、点電荷の電場', ['8-77']);
      },
    },
  });

  // ================================================================ 8-79 グリーンの定理（回転×面積）
  // 道：正方形・長方形・三角形（原点に角）・円・だ円（中心が原点）。左回り
  const PATH79 = ['sq', 'rect', 'tri', 'circ', 'ell'];
  function path79(r, kind) {
    if (kind === 'sq') { const L = r.pick([1, 2, 3, 4, 5]); return { t: `正方形 $0\\leqq x,\\ y\\leqq${L}$ のふち`, area: fr(L * L), pi: false, path: [[0, 0], [L, 0], [L, L], [0, L], [0, 0]], key: `s${L}` }; }
    if (kind === 'rect') { const a = r.pick([2, 3, 4, 5]), b = r.pick([1, 2, 3].filter(v => v !== a)); return { t: `長方形 $0\\leqq x\\leqq${a}$、$0\\leqq y\\leqq${b}$ のふち`, area: fr(a * b), pi: false, path: [[0, 0], [a, 0], [a, b], [0, b], [0, 0]], key: `r${a},${b}` }; }
    if (kind === 'tri') { const a = r.pick([2, 3, 4, 6]), b = r.pick([2, 4, 5, 6]); return { t: `三角形 $(0,\\ 0)$、$(${a},\\ 0)$、$(0,\\ ${b})$ のふち`, area: fr(a * b, 2), pi: false, path: [[0, 0], [a, 0], [0, b], [0, 0]], key: `t${a},${b}` }; }
    if (kind === 'circ') { const R = r.pick([1, 2, 3, 4]); return { t: `原点が中心の半径 $${R}$ の円`, area: fr(R * R), pi: true, rf: t => [R * Math.cos(t), R * Math.sin(t)], key: `c${R}` }; }
    const a = r.pick([2, 3, 4, 5]), b = r.pick([1, 2, 3].filter(v => v !== a)); return { t: `だ円 $x=${a}\\cos t$、$y=${b === 1 ? '' : b}\\sin t$（$0\\leqq t\\leqq2\\pi$）`, area: fr(a * b), pi: true, rf: t => [a * Math.cos(t), b * Math.sin(t)], key: `e${a},${b}` };
  }
  // 力 (p y + x の項, q x + y の項)：回転は q − p
  function force79(r, extra) {
    const p = r.pick([-4, -3, -2, -1, 1, 2, 3]), q = r.pick([-2, -1, 1, 2, 3, 4]); if (q === p) return null;
    const ex = extra ? r.pick([[0, 0], [1, 0], [0, 1], [2, 0], [0, 2]]) : [0, 0];
    const Fx = [mono(p, 0, 1)].concat(ex[0] ? [mono(ex[0] === 2 ? 1 : 1, ex[0] === 2 ? 2 : 1)] : []), Fy = [mono(q, 1)].concat(ex[1] ? [mono(1, 0, ex[1] === 2 ? 2 : 1)] : []);
    return { p, q, rot: q - p, tex: `$\\vec F=(${pTeX(Fx)},\\ ${pTeX(Fy)})$`, Fn: (x, y) => [pVal(Fx, x, y, 0), pVal(Fy, x, y, 0)], key: `${p},${q},${ex}` };
  }
  const lineV = (P, Fn, cw) => p => near(ev(strip(p.a)), lineOf(P, Fn, cw), 1e-6) || '道を1周してたした値とちがう';
  const BAN79 = new Set(['54', '6\\pi']);
  M.add({
    id: '8-79', part: 6, chap: '8-11⑨⑩ 例題10', stars: 1,
    title: '回転が一定なら、閉じた道の1周は「回転×かこんだ面積」',
    mark: '閉じた道を左回りに1周する $\\oint_C\\vec F\\cdot\\dd\\vec r$。$(ay,\\ bx)$ の形の力。',
    futsu: ['道を辺（円なら角）で表し、', '辺ごとに定積分してたす'],
    raku: ['$(-4y,\\ 2x)$ → 回転 $2-(-4)=6$', '1辺 $3$ の正方形 → $6\\times9=54$', '半径 $1$ の円 → $6\\pi$'],
    why: 'グリーンの定理（8-11⑨）で、道の積分を「回転 $\\frac{\\partial F_y}{\\partial x}-\\frac{\\partial F_x}{\\partial y}$ の面積分」に取りかえる。回転が一定なら「回転×面積」。',
    caution: '右回りは符号が逆。$\\frac{(-y,\\ x)}{x^2+y^2}$ のように、回転が決まらない点をかこむ道には使えない（8-97）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '22mm', trap: '18mm' },
    fits(q) {
      if (/x\^2\+y\^2\}|x\^2\+y\^2\)|穴/.test(q)) return false;
      return /1周/.test(q) && /(左回り|右回り)/.test(q) && /(\\vec [FvB]=|力)/.test(q) && !/磁場|電場|起電力/.test(q);
    },
    steps: {
      s1(r) {
        const f = force79(r, false); if (!f) return null;
        const P = path79(r, r.pick(PATH79.slice(0, 4)));
        if (f.p === -4 && f.q === 2 && (P.key === 's3' || P.key === 'c1')) return null;
        const A = F.mul(fr(f.rot), P.area), a = P.pi ? piT(A) : fx(A); if (BAN79.has(a) || !cap(r, '79s1', a)) return null;
        return { q: `${f.tex} で、${P.t}を左回りに1周する線積分`, a: `$${a}$`, key: `79|${f.key}|${P.key}`,
          easy: `回転 $${f.q}-${fxs(fr(f.p))}=${f.rot}$、$${f.rot < 0 ? `(${f.rot})` : f.rot}\\times${P.pi ? piT(P.area) : fx(P.area)}=${a}$`, easyCheck: 'last', verify: lineV(P, f.Fn) };
      },
      // 右回り・だ円・回転に効かない項がある
      s2(r) {
        const f = force79(r, true); if (!f) return null;
        const cw = turn(r, '79s2', 2) === 0, P = path79(r, r.pick(PATH79));
        const A = F.mul(fr(cw ? -f.rot : f.rot), P.area), a = P.pi ? piT(A) : fx(A); if (BAN79.has(a) || !cap(r, '79s2', a)) return null;
        return { q: `${f.tex} で、${P.t}を${cw ? '右回り' : '左回り'}に1周する線積分`, a: `$${a}$`, key: `79|${f.key}|${P.key}|${cw}`,
          easy: `回転 $${f.rot}$${/x\+|\+y|x\^2|y\^2/.test(f.tex) ? '（$F_x$ の $x$ の項、$F_y$ の $y$ の項は効かない）' : ''}${cw ? '。右回りなので符号が逆' : ''}`, easyCheck: false, verify: lineV(P, f.Fn, cw) };
      },
      // 見かけがちがう：力の仕事・回る台の循環・面積から道の大きさを
      s3(r) {
        const kind = turn(r, '79s3', 3);
        if (kind === 0) {
          const k = r.pick([1, 2, 3, 5]), R = r.pick([2, 3, 4, 5, 10]), A = fr(2 * k * R * R), a = piT(A); if (BAN79.has(a) || !cap(r, '79s3', a)) return null;
          return { q: `力 $\\vec F=(-${k === 1 ? '' : k}y,\\ ${k === 1 ? '' : k}x)$〔$\\mathrm{N}$〕で、原点が中心の半径 ${U(R, 'm')} の円を左回りに1周する仕事 ＝ $□\\,\\mathrm{J}$`, a: `$${a}$`, key: `79w|${k}|${R}`,
            easy: `回転 $${2 * k}$、$${2 * k}\\times\\pi\\times${R}^2$`, easyCheck: false, verify: lineV({ rf: t => [R * Math.cos(t), R * Math.sin(t)] }, (x, y) => [-k * y, k * x]) };
        }
        if (kind === 1) {
          const w = r.pick([0.5, 1, 2, 3, 0.2]), R = r.pick([1, 2, 3, 0.5]), A = F.mul(F.mul(fr(2), D(w)), F.mul(D(R), D(R))), a = piT(A, true); if (!cap(r, '79s3', a)) return null;
          return { q: `回転台の速度 $\\vec v=(${cfT(-w, 'y')},\\ ${cfT(w, 'x')})$〔$\\mathrm{m/s}$〕で、中心から ${U(R, 'm')} の円を左回りに1周する循環 ＝ $□\\,\\mathrm{m^2/s}$`, a: `$${a}$`, key: `79v|${w}|${R}`,
            easy: `回転 $2\\times${fmt(w)}=${fmt(2 * w)}$、×円の面積 $${piT(F.mul(D(R), D(R)), true)}$`, easyCheck: false, verify: lineV({ rf: t => [R * Math.cos(t), R * Math.sin(t)] }, (x, y) => [-w * y, w * x]) };
        }
        const f = force79(r, false); if (!f || f.rot <= 0) return null;
        const L = r.pick([1, 2, 3, 4, 5, 6]), I = f.rot * L * L; if (!cap(r, '79s3', String(L))) return null;
        return { q: `${f.tex} で、正方形 $0\\leqq x,\\ y\\leqq a$ のふちを左回りに1周すると $${I}$ になる $a$（$a>0$）`, a: `$${L}$`, key: `79a|${f.key}|${L}`,
          easy: `回転 $${f.rot}$、$${f.rot}\\times a^2=${I}$`, easyCheck: false,
          verify: p => { const v = num1(p.a); return near(v * v * f.rot, I, 1e-12) || '回転×面積がもどらない'; } };
      },
      // わな：穴のある場 (−y, x)/(x²+y²)（8-97・8-47）
      trap(r) {
        const c = r.pick([1, 2, 3, 4, 5]), R = r.pick([1, 2, 3, 4]), A = fr(2 * c), a = piT(A);
        if (!cap(r, '79t', String(c), 1)) return null;   // 同じ場で半径だけちがう（答えが同じ）わなを重ねない（Z-2）
        const tt = c === 1 ? '\\frac{(-y,\\ x)}{x^2+y^2}' : `${c}\\times\\frac{(-y,\\ x)}{x^2+y^2}`;
        return dest({ q: `$\\vec F=${tt}$ で、原点が中心の半径 $${R}$ の円を左回りに1周する線積分`, a: `$${a}$`, key: `79t|${c}|${R}`,
          verify: lineV({ rf: t => [R * Math.cos(t), R * Math.sin(t)] }, (x, y) => [-c * y / (x * x + y * y), c * x / (x * x + y * y)]) }, '8-79', '回転は原点で決まらない（穴）。かこんだ面積には比例しない', ['8-47', '8-97']);
      },
    },
  });

  // ================================================================ 8-80 まわりの平均との差
  const DIRS = ['北', '南', '西', '東'];
  const nb = vs => DIRS.map((d, k) => `${d}${vs[k]}`).join('・');
  const BAN80 = new Set(['4', '-3']);
  const ex80 = (T, vs) => (T === 20 && vs.join() === '30,22,18,26') || (T === 45 && vs.join() === '40,44,38,46');
  const WARM = ['温まる', '冷える', '変わらない'];
  const warmOf = d => (d > 0 ? WARM[0] : d < 0 ? WARM[1] : WARM[2]);
  // まわり4つを作る：平均が m（4m は整数）になるように
  function around(r, m4, spread) {
    for (let k = 0; k < 30; k++) {
      const v = [0, 1, 2].map(() => Math.round(m4 / 4) + r.int(-spread, spread)), last = m4 - v[0] - v[1] - v[2];
      if (Math.abs(last - m4 / 4) <= spread + 2 && Math.min(last, ...v) >= 0 && new Set(v.concat(last)).size >= 3) return r.shuffle(v.concat(last));
    }
    return null;
  }
  M.add({
    id: '8-80', part: 6, chap: '8-12① 例題1', stars: 1,
    title: 'まわりの平均との差：正なら温まる、負なら冷える',
    mark: '板のマスの温度と、北・南・西・東のマスの温度。「温まるか冷えるか」。',
    futsu: ['4つのとなりとの熱の', '出入りを1つずつくらべる'],
    raku: ['P 20℃、まわり30・22・18・26', '→ $24-20=4$（温まる）', 'Q 45℃、まわり40・44・38・46', '→ $42-45=-3$（冷える）'],
    why: 'となりから入る熱は「となり－自分」に比例する。4つをたすと4×（まわりの平均－自分）なので、この符号で決まる（8-12①）。',
    caution: '温度の高さではなく、まわりの平均とくらべる。ななめのマスは使わない。',
    counts: { s1: 6, s2: 5, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '12mm', s2: '22mm', s3: '12mm', trap: '12mm' },
    fits(q, p) { return /まわり/.test(q) && /(北|西)/.test(q) && /(平均との差|温まる|くぼんで|出っぱって|明るさ)/.test(q) && !/落ち着/.test(q) || !!(p && p.table && /まわりの平均との差/.test(q)); },
    steps: {
      s1(r) {
        const T = r.int(2, 9) * 5 + r.pick([0, 0, 1, 2, 3]), d = r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 2.5, -1.5, 1.5]), vs = around(r, 4 * (T + d), 6);
        if (!vs || BAN80.has(fmt(d)) || ex80(T, vs) || !cap(r, '80s1', fmt(d))) return null;
        return { q: `${T}℃、まわり ${nb(vs)}（℃）。まわりの平均との差`, a: `$${fmt(d)}$`, key: `80|${T}|${vs.slice().sort()}`,
          easy: `$\\frac{${vs.reduce((a, b) => a + b, 0)}}{4}-${T}=${fmt(d)}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), vs.reduce((s, v) => s + (v - T), 0) / 4, 1e-12) || '4つの差の和÷4 とちがう' };
      },
      // 温まる・冷える・変わらない（答えを回す。U-3）。自分より低いとなりもある
      s2(r) {
        const want = peek(r, '80s2', 3), T = r.int(4, 16) * 5, d = want === 2 ? 0 : (want === 0 ? 1 : -1) * r.pick([1, 2, 3, 0.5, 1.5]);
        const vs = around(r, 4 * (T + d), 12); if (!vs || !vs.some(v => v > T) || !vs.some(v => v < T)) return null;
        if (!cap(r, '80s2c', WARM[want])) return null; adv(r, '80s2', 3);
        return { q: `${T}℃、まわり ${nb(vs)}（℃）。少しあと（温まる・冷える・変わらない）`, a: WARM[want], key: `80|${T}|${vs.slice().sort()}`,
          easy: `まわりの平均 $${fmt(T + d)}$、差 $${fmt(d)}$`, easyCheck: false,
          verify: p => p.a === warmOf(vs.reduce((s, v) => s + v - T, 0)) || '入る熱の和の符号とちがう' };
      },
      // 見かけがちがう：3×3 の表（ななめは使わない）・画像の明るさ（4倍）
      s3(r) {
        if (turn(r, '80s3', 2) === 0) {
          const T = r.int(4, 12) * 5, d = r.pick([-5, -4, -2, -1, 1, 2, 3, 5, 6]); const vs = around(r, 4 * (T + d), 8); if (!vs || BAN80.has(fmt(d))) return null;
          const dg = [0, 1, 2, 3].map(() => T + r.int(-15, 15)), [N, S, W, E] = vs;
          if (!cap(r, '80s3', fmt(d))) return null;
          return { q: '表は板のマスの温度（℃。上が北）。まん中のマスの、まわりの平均との差', a: `$${fmt(d)}$`, key: `80t|${T}|${vs}`,
            table: { rows: [[dg[0], N, dg[1]], [W, T, E], [dg[2], S, dg[3]]].map(rw => rw.map(String)) },
            easy: `北${N}・南${S}・西${W}・東${E}（ななめは使わない）。$\\frac{${N + S + W + E}}{4}-${T}=${fmt(d)}$`, easyCheck: false,
            verify: p => near(num1(p.a), (N + S + W + E) / 4 - T, 1e-12) || '十字の4つの平均－自分 とちがう' };
        }
        const T = r.int(10, 40) * 5, d = r.pick([-6, -4, -3, -2, 2, 3, 5, 8, 10]), vs = around(r, 4 * (T + d), 20); if (!vs) return null;
        const a = String(4 * d); if (!cap(r, '80s3', a)) return null;
        return { q: `写真の明るさ ${T}、まわり ${nb(vs)}。「まわり4マスの和 $-4\\times$ 自分」の値`, a: `$${a}$`, key: `80b|${T}|${vs.slice().sort()}`,
          easy: `まわりの平均との差 $${d}$ の4倍`, easyCheck: false,
          verify: p => near(num1(p.a), vs.reduce((s, v) => s + v, 0) - 4 * T, 1e-12) || '和－4×自分 とちがう' };
      },
      // わな：式のラプラシアン（8-81）
      trap(r) {
        const a = r.pick([2, 3, 4, 5]), b = r.pick([1, 2, 3, -1]), A = 2 * a + 2 * b;
        if (!cap(r, '80t', String(A), 1)) return null;
        return dest({ q: `$f=${pTeX([mono(a, 2), mono(b, 0, 2)])}$ の $\\nabla^2f$`, a: `$${A}$`, key: `80t|${a}|${b}`,
          calc: { kind: 'pdiff', op: 'lap', f: `${a}*x^2+(${b})*y^2`, vars: ['x', 'y'] } }, '8-80', '表のマスではなく式。2回の偏微分をたす');
      },
    },
  });

  // ================================================================ 8-81 ラプラシアン（2回の偏微分の和）
  const BAN81 = new Set(['12', '2.5']);
  const jsP = ts => ts.map(([c, i, j, k]) => [`(${c})`].concat(i ? [`x^${i}`] : [], j ? [`y^${j}`] : [], k ? [`z^${k}`] : []).join('*')).join('+');
  // まわり4点（2次元）・6点（3次元）の平均との差を、方眼で計算する
  const gridDiff = (f, h, three) => { const P = three ? [[h, 0, 0], [-h, 0, 0], [0, h, 0], [0, -h, 0], [0, 0, h], [0, 0, -h]] : [[h, 0, 0], [-h, 0, 0], [0, h, 0], [0, -h, 0]]; const x0 = 3 * h, y0 = -2 * h, z0 = h; return P.reduce((s, d) => s + f(x0 + d[0], y0 + d[1], z0 + d[2]), 0) / P.length - f(x0, y0, z0); };
  M.add({
    id: '8-81', part: 6, chap: '8-12②⑤ 例題2・例題3', stars: 1,
    title: 'ラプラシアンは2回の偏微分の和',
    mark: '$\\nabla^2f$、「ラプラス方程式をみたすか」、□ m おきの方眼のまわりの平均との差。',
    futsu: ['方眼の点の値を計算し、', 'まわりの平均とくらべる'],
    raku: ['$4x^2-y^2+3z^2+5xy$ → 12', '$x^2-y^2$ → 0（ラプラス方程式）', '$0.02x^2+0.03y^2$、10 m おき', '→ $\\nabla^2f=0.1$、差 $25\\times0.1=2.5$'],
    why: '$\\nabla^2f$ は2回の偏微分の和（8-12⑤）。$xy$ の項は0。まわり4点の平均との差は $\\frac{h^2}{4}\\nabla^2f$（3次元の6点は $\\frac{h^2}{6}$）。',
    caution: '$\\nabla^2f$ は数1つ（矢印にしない）。$(\\nabla f)^2$ ではない。',
    counts: { s1: 8, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '22mm', s3: '16mm', trap: '20mm' },
    fits(q) { if (/フィルター/.test(q)) return false; return /\\nabla\^2|ラプラス方程式|ラプラシアン/.test(q) && !/r\^|\\frac\{1\}\{r|\\frac\{a\}\{r|中心からの距離|軸からの距離|e\^\{|\\sin/.test(q) || /おきの方眼/.test(q); },
    steps: {
      s1(r) {
        const three = r.chance(0.5), a = r.pick([1, 2, 3, 4, 5, -1, -2, -3]), b = r.pick([1, 2, 3, -1, -2, -4]), c = three ? r.pick([1, 2, 3, -1, -2]) : 0;
        const ts = [mono(a, 2), mono(b, 0, 2)].concat(three ? [mono(c, 0, 0, 2)] : []).concat(r.chance(0.6) ? [mono(r.pick([2, 3, 4, -2, 5, -3]), 1, 1)] : []).concat(r.chance(0.4) ? [mono(r.pick([1, 3, -2, 4]), 1)] : []).concat(r.chance(0.3) ? [mono(r.pick([1, 2, -1]), 0, 1)] : []);
        // 例 $4x^2-y^2+3z^2+5xy$ と2乗の係数（の大きさ）が同じ組は、符号を変えただけになるので出さない（R2-16・Z-2）
        if (three && [a, b, c].map(Math.abs).join() === '4,1,3') return null;
        const A = 2 * (a + b + c); if (A === 0 || BAN81.has(String(A)) || !cap(r, '81s1', String(A))) return null;
        return { q: `$f=${pTeX(ts)}$ の $\\nabla^2f$`, a: `$${A}$`, key: `81|${pTeX(ts)}`,
          easy: `$${[2 * a, 2 * b].concat(three ? [2 * c] : []).map((v, k) => (k && v < 0 ? `(${v})` : v)).join('+')}=${A}$`, easyCheck: 'last',
          calc: { kind: 'pdiff', op: 'lap', f: jsP(ts), vars: three ? ['x', 'y', 'z'] : ['x', 'y'] } };
      },
      // ラプラス方程式をみたすか（回す）・3次式の点の値
      s2(r) {
        if (turn(r, '81s2', 3) < 2) {
          const yes = peek(r, '81yes', 2) === 0;
          const pool = yes ? [[[1, 2], [-1, 0, 2]], [[3, 1, 1]], [[1, 3], [-3, 1, 2]], [[3, 2, 1], [-1, 0, 3]], [[1, 2], [1, 0, 2], [-2, 0, 0, 2]], [[2, 2], [-2, 0, 2], [5, 1, 1]], [[1, 2], [-1, 0, 0, 2], [4, 0, 1]], [[3, 2], [-1, 0, 2], [-2, 0, 0, 2]]]
            : [[[1, 2], [1, 0, 2]], [[2, 2], [-1, 0, 2]], [[1, 3], [-1, 1, 2]], [[1, 2], [-1, 0, 2], [1, 0, 0, 2]], [[3, 2, 1]], [[2, 1, 1], [1, 0, 2]], [[1, 2], [2, 0, 2], [-2, 0, 0, 2]], [[1, 1, 2]]];
          const ts = r.pick(pool).map(t => mono(...t)), three = ts.some(t => t[3]);
          const A = yes ? 'みたす' : 'みたさない'; if (!cap(r, '81s2c', A)) return null; adv(r, '81yes', 2);
          return { q: `$f=${pTeX(ts)}$ は、ラプラス方程式 $\\nabla^2f=0$ を（みたす・みたさない）`, a: A, key: `81|${pTeX(ts)}`,
            easy: yes ? '2回の偏微分の和がどこでも0' : '2回の偏微分の和が0でない所がある', easyCheck: false,
            verify: p => { const f = (x, y, z) => pVal(ts, x, y, z), h = 1e-3; const L = [[0.7, -0.3, 0.4], [1.3, 0.9, -0.6]].map(([x, y, z]) => [[h, 0, 0], [0, h, 0], [0, 0, h]].reduce((s, d) => s + (f(x + d[0], y + d[1], z + d[2]) - 2 * f(x, y, z) + f(x - d[0], y - d[1], z - d[2])) / (h * h), 0)); return p.a === (L.every(v => Math.abs(v) < 1e-4) ? 'みたす' : 'みたさない') || 'ラプラシアンを数で計算した結果とちがう'; } };
        }
        const a = r.pick([1, 2, -1]), b = r.pick([1, 2, 3, -1]), ts = [mono(a, 3), mono(b, 1, 2)].concat(r.chance(0.5) ? [mono(r.pick([2, 3]), 0, 2)] : []), x0 = r.pick([1, 2, -1, 3]), y0 = r.pick([1, 2, -2]);
        const A = 6 * a * x0 + 2 * b * x0 + ts.slice(2).reduce((s, t) => s + 2 * t[0], 0); if (!cap(r, '81s2', String(A)) || BAN81.has(String(A))) return null;
        return { q: `$f=${pTeX(ts)}$ の、点 $(${x0},\\ ${y0})$ での $\\nabla^2f$`, a: `$${A}$`, key: `81c|${pTeX(ts)}|${x0},${y0}`,
          easy: `$\\nabla^2f=${pTeX([mono(6 * a + 2 * b, 1)].concat(ts.slice(2).map(t => mono(2 * t[0]))))}$ に入れる`, easyCheck: false,
          calc: { kind: 'pdiff', op: 'lap', f: jsP(ts), vars: ['x', 'y'], at: [x0, y0] } };
      },
      // 方眼のまわりの平均との差を予想する
      s3(r) {
        const three = turn(r, '81s3', 3) === 2, a = r.pick([0.01, 0.02, 0.03, 0.04, 0.05, -0.01, -0.02, -0.03]), b = r.pick([0.01, 0.02, 0.03, 0.04, -0.01, -0.02]), c = three ? r.pick([0.01, 0.02, 0.03]) : 0;
        const h = r.pick(three ? [2, 6, 10] : [2, 4, 5, 10, 20]), A0 = r.pick([20, 50, 100]);
        if ((a === 0.02 && b === 0.03 && h === 10) || (a === -0.01 && b === -0.02 && h === 10)) return null;   // 例と主役の山
        const lap = F.mul(fr(2), F.add(F.add(D(a), D(b)), D(c))); if (lap[0] === 0) return null;
        const A = F.mul(lap, fr(h * h, three ? 6 : 4)); if (decLen(A) > 3) return null;
        const a0 = fx(A); if (BAN81.has(a0) || !cap(r, '81s3', a0)) return null;
        const ts = [mono(A0), mono(a, 2), mono(b, 0, 2)].concat(three ? [mono(c, 0, 0, 2)] : []), f = (x, y, z) => pVal(ts, x, y, z);
        return { q: `$f=${pTeX(ts)}$、${U(h, 'm')} おきの方眼で、まわり${three ? '6点（東西・南北・上下）' : '4点'}の平均と自分の差`, a: `$${a0}$`, key: `81g|${a},${b},${c}|${h}`,
          easy: `$\\nabla^2f=${fx(lap)}$、$\\frac{${h}^2}{${three ? 6 : 4}}\\times${fxs(lap)}=${a0}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), gridDiff(f, h, three), 1e-9) || '方眼で計算した差とちがう' };
      },
      // わな：マスの温度（8-80）
      trap(r) {
        const T = r.int(5, 14) * 5, d = (turn(r, '81t', 2) ? 1 : -1) * r.pick([2, 3, 5]), vs = around(r, 4 * (T + d), 12); if (!vs) return null;
        return dest({ q: `P ${T}℃、まわり ${nb(vs)}（℃）。P は少しあと（温まる・冷える）`, a: warmOf(d), key: `81t|${T}|${vs}`,
          verify: p => p.a === warmOf(vs.reduce((s, v) => s + v - T, 0)) || '差の符号とちがう' }, '8-81', '式ではなく、マスの数。まわりの平均と自分をくらべる', ['8-80']);
      },
    },
  });

  // ================================================================ 8-82 落ち着いた温度（2つのマスの連立方程式）
  // A：北 a・西 b・東 c・南 B。B：北 A・西 d・東 e・南 f。4A=P+B、4B=A+Q
  const solve2 = (P, Q) => [(4 * P + Q) / 15, (P + 4 * Q) / 15];
  // 確かめ：ならすくり返し（8-12③）
  const relax2 = (P, Q) => { let A = 0, B = 0; for (let k = 0; k < 400; k++) { A = (P + B) / 4; B = (A + Q) / 4; } return [A, B]; };
  const pairA = (A, B) => `A $${fmt(A)}$℃、B $${fmt(B)}$℃`;
  function gen82(r, avoidEx) {
    for (let k = 0; k < 40; k++) {
      const top = [r.pick([0, 20, 40, 50, 60, 80, 100]), r.pick([0, 0, 10, 20, 30]), r.pick([0, 0, 10, 20, 40])], bot = [r.pick([0, 0, 10, 20]), r.pick([0, 0, 10, 20, 30]), r.pick([0, 10, 20, 30, 40, 50])];
      const P = top[0] + top[1] + top[2], Q = bot[0] + bot[1] + bot[2]; if ((P + 4 * Q) % 15 || P + Q === 0) continue;
      if (P === 60 && Q === 30) continue;   // 楽な形の例と同じ連立方程式
      return { top, bot, P, Q, AB: solve2(P, Q) };
    }
    return null;
  }
  function fig82(g, horiz) {
    const s = 2, its = [];
    const sq = (cx, cy, lab) => { its.push(['poly', [[cx - 1, cy - 1], [cx + 1, cy - 1], [cx + 1, cy + 1], [cx - 1, cy + 1]]], ['label', [cx, cy], lab, 'c']); };
    const T = v => `${v}℃`;
    if (!horiz) {
      sq(0, 1, 'A'); sq(0, -1, 'B');
      its.push(['label', [0, 2], T(g.top[0]), 'n'], ['label', [-1, 1], T(g.top[1]), 'w'], ['label', [1, 1], T(g.top[2]), 'e'],
        ['label', [-1, -1], T(g.bot[0]), 'w'], ['label', [1, -1], T(g.bot[1]), 'e'], ['label', [0, -2], T(g.bot[2]), 's']);
    } else {
      sq(-1, 0, 'A'); sq(1, 0, 'B');
      its.push(['label', [-1, 1], T(g.top[0]), 'n'], ['label', [-1, -1], T(g.top[1]), 's'], ['label', [-2, 0], T(g.top[2]), 'w'],
        ['label', [1, 1], T(g.bot[0]), 'n'], ['label', [1, -1], T(g.bot[1]), 's'], ['label', [2, 0], T(g.bot[2]), 'e']);
    }
    return { s: 5, items: its };
  }
  M.add({
    id: '8-82', part: 6, chap: '8-12③ 例題4', stars: 1,
    title: '落ち着いた温度は「どのマスも、まわりの平均と同じ」：連立方程式',
    mark: '2つのマスと、まわりのふちの温度。「落ち着いた温度」。',
    futsu: ['0℃から始めて、まわりの', '平均に置きかえるくり返しを', '何十回も'],
    raku: ['A：北60・西東0・南は B', 'B：北は A・西東0・南30', '→ $4A=60+B$、$4B=A+30$', '→ $A=18$、$B=12$'],
    why: '落ち着くと、どのマスもまわりの平均と同じ（8-12③）。マスごとに「4×自分＝まわり4つの和」を作り、連立方程式（3-6）で解く。',
    caution: 'ふちは決まった温度のまま。相手のマスも、まわりの1つとして式に入れる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '14mm', s3: '14mm', trap: '14mm' },
    fits(q, p) { return (/落ち着/.test(q) && /(マス A|A（上）|A（左）|中の2点)/.test(q)) || !!(p && p.fig && /マス A/.test(q)); },
    steps: {
      s1(r) {
        const g = gen82(r, true); if (!g || !once(r, `82|${g.P},${g.Q}`)) return null;
        const [A, B] = g.AB; if (!cap(r, '82s1', pairA(A, B))) return null;
        return { q: `マス A（上）と B（下）。A：北 ${g.top[0]}・西 ${g.top[1]}・東 ${g.top[2]}・南は B。B：北は A・西 ${g.bot[0]}・東 ${g.bot[1]}・南 ${g.bot[2]}（℃）。落ち着いた A ＝ □℃、B ＝ □℃`,
          a: pairA(A, B), key: `82|${g.top}|${g.bot}`, easy: `$4A=${g.P}+B$、$4B=A+${g.Q}$`, easyCheck: false,
          verify: p => { const [x, y] = nums(p.a), [u, v] = relax2(g.P, g.Q); return (near(x, u, 1e-9) && near(y, v, 1e-9)) || 'ならすくり返しの行き先とちがう'; } };
      },
      // 横に並んだマス・ふちの温度を逆に求める
      s2(r) {
        if (turn(r, '82s2', 2) === 0) {
          const g = gen82(r, false); if (!g || !once(r, `82|${g.P},${g.Q}`)) return null;
          const [A, B] = g.AB;
          return { q: `マス A（左）と B（右）。A：北 ${g.top[0]}・南 ${g.top[1]}・西 ${g.top[2]}・東は B。B：西は A・北 ${g.bot[0]}・南 ${g.bot[1]}・東 ${g.bot[2]}（℃）。落ち着いた A ＝ □℃、B ＝ □℃`,
            a: pairA(A, B), key: `82h|${g.top}|${g.bot}`, easy: `$4A=${g.P}+B$、$4B=A+${g.Q}$`, easyCheck: false,
            verify: p => { const [x, y] = nums(p.a), [u, v] = relax2(g.P, g.Q); return (near(x, u, 1e-9) && near(y, v, 1e-9)) || 'ならすくり返しの行き先とちがう'; } };
        }
        // 逆：B を目標の温度にする南のふち
        const top = [r.pick([40, 60, 80, 100]), 0, 0], B = r.pick([10, 12, 14, 16, 20, 24]), Q = (15 * B - top[0]) / 4; if (!Number.isInteger(Q) || Q < 0 || Q > 100) return null;
        if (!cap(r, '82s2', String(Q))) return null;
        return { q: `マス A（上）と B（下）。A：北 ${top[0]}・西 0・東 0・南は B。B：北は A・西 0・東 0・南は $T$（℃）。落ち着いた B を ${B}℃ にする $T$`, a: `$${Q}$`, key: `82i|${top[0]}|${B}`,
          easy: `$4A=${top[0]}+${B}$ から $A=${fmt((top[0] + B) / 4)}$、$4\\times${B}=A+$（南）`, easyCheck: false,
          verify: p => near(relax2(top[0], num1(p.a))[1], B, 1e-9) || 'その南の温度では B が目標にならない' };
      },
      // 見かけがちがう：図・棒の中の2点
      s3(r) {
        if (turn(r, '82s3', 2) === 0) {
          const g = gen82(r, false), horiz = r.chance(0.5); if (!g || !once(r, `82|${g.P},${g.Q}`)) return null;
          const [A, B] = g.AB;
          return { q: '図のマス A・B の、落ち着いた温度 A ＝ □℃、B ＝ □℃', a: pairA(A, B), key: `82f|${g.top}|${g.bot}|${horiz}`, fig: fig82(g, horiz),
            easy: `$4A=${g.P}+B$、$4B=A+${g.Q}$`, easyCheck: false,
            verify: p => { const [x, y] = nums(p.a), [u, v] = relax2(g.P, g.Q); return (near(x, u, 1e-9) && near(y, v, 1e-9)) || 'ならすくり返しの行き先とちがう'; } };
        }
        const T0 = r.pick([100, 90, 80, 60, 30, 0]), T3 = r.pick([0, 15, 30, 45, 60, 20]); if (T0 === T3 || (2 * T0 + T3) % 3) return null;
        const t1 = (2 * T0 + T3) / 3, t2 = (T0 + 2 * T3) / 3;
        return { q: `棒の左はしが ${T0}℃、右はしが ${T3}℃。3等分する中の2点の落ち着いた温度 左 ＝ □℃、右 ＝ □℃`, a: `$${t1}$℃、$${t2}$℃`, key: `82r|${T0}|${T3}`,
          easy: `$2T_1=${T0}+T_2$、$2T_2=T_1+${T3}$（まっすぐな形）`, easyCheck: false,
          verify: p => { let a = 0, b = 0; for (let k = 0; k < 400; k++) { a = (T0 + b) / 2; b = (a + T3) / 2; } const [x, y] = nums(p.a); return (near(x, a, 1e-9) && near(y, b, 1e-9)) || 'ならすくり返しの行き先とちがう'; } };
      },
      // わな：正方形の板のまん中（8-83）
      trap(r) {
        const e = [r.pick([100, 80, 60]), r.pick([60, 40, 20, 0]), r.pick([0, 20, 40]), 0]; const A = (e[0] + e[1] + e[2] + e[3]) / 4; if (!Number.isInteger(A * 2)) return null;
        return dest({ q: `正方形の板のふち 上 ${e[0]}・右 ${e[1]}・下 ${e[2]}・左 ${e[3]}（℃）。落ち着いたまん中 ＝ □℃`, a: `$${fmt(A)}$`, key: `82t|${e}`,
          verify: p => near(num1(p.a), (e[0] + e[1] + e[2] + e[3]) / 4, 1e-12) || '4つのふちの平均とちがう' }, '8-82', 'マスの数が決まっていない板。4つの向きの重ね合わせで、ふちの平均', ['8-83']);
      },
    },
  });

  // ================================================================ 8-83 正方形の板のまん中は、4つのふちの平均
  const SIDES = ['上', '右', '下', '左'];
  const ex83 = e => e.join() === '100,40,20,0';
  // 確かめ：板を 8×8 のマスに分けて、ならすくり返し（8-12③）。まん中の点の値
  function plate(e) {
    const n = 8, T = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
    for (let k = 1; k < n; k++) { T[0][k] = e[0]; T[k][n] = e[1]; T[n][k] = e[2]; T[k][0] = e[3]; }
    for (let it = 0; it < 3000; it++) for (let i = 1; i < n; i++) for (let j = 1; j < n; j++) T[i][j] = (T[i - 1][j] + T[i + 1][j] + T[i][j - 1] + T[i][j + 1]) / 4;
    return T[n / 2][n / 2];
  }
  const PL = new Map();
  const plateC = e => { const k = e.join(); if (!PL.has(k)) PL.set(k, plate(e)); return PL.get(k); };
  function fig83(e) {
    return { s: 5, items: [['poly', [[0, 0], [4, 0], [4, 4], [0, 4]], { fill: true }], ['dot', [2, 2]],
      ['label', [2, 4], `${e[0]}℃`, 'n'], ['label', [4, 2], `${e[1]}℃`, 'e'], ['label', [2, 0], `${e[2]}℃`, 's'], ['label', [0, 2], `${e[3]}℃`, 'w']] };
  }
  M.add({
    id: '8-83', part: 6, chap: '8-12③ 例題5', stars: 1,
    title: '正方形の板のまん中の落ち着いた温度は、4つのふちの平均',
    mark: '正方形の板の「上 □℃、右 □℃、下 □℃、左 □℃」。「まん中は何℃」。',
    futsu: ['板をマスに分けて、', 'ならすくり返しを何十回も'],
    raku: ['上100、右40、下20、左0', '→ $\\frac{100+40+20+0}{4}=40$℃'],
    why: '1つのふちだけ $T$ の板のまん中は、回した4枚をたすと $\\frac T4$（8-12③）。4つのふちの板を重ねると、まん中は4つの平均。',
    caution: '正方形の板のまん中の点だけ（長方形や、まん中でない点では使えない）。',
    counts: { s1: 7, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '14mm' },
    fits(q, p) { return /正方形の(板|筒)/.test(q) && /まん中|中心の軸/.test(q) || !!(p && p.fig && /板の/.test(q)); },
    steps: {
      s1(r) {
        const e = [0, 1, 2, 3].map(() => r.pick([0, 10, 20, 30, 40, 50, 60, 80, 100, 0, 20])); if (e.every(v => v === e[0]) || ex83(e)) return null;
        const A = F.make(e[0] + e[1] + e[2] + e[3], 4); if (decLen(A) > 1) return null;
        const a = fx(A); if (a === '40' || !cap(r, '83s1', a)) return null;
        return { q: `正方形の板のふち 上 ${e[0]}・右 ${e[1]}・下 ${e[2]}・左 ${e[3]}（℃）。落ち着いたまん中 ＝ □℃`, a: `$${a}$`, key: `83|${e.slice().sort()}`,
          easy: `$\\frac{${e.join('+')}}{4}=${a}$`, easyCheck: 'last', verify: p => near(num1(p.a), plateC(e), 1e-6) || 'ならした板のまん中とちがう' };
      },
      // 1つのふちだけ・逆にふちを求める
      s2(r) {
        if (turn(r, '83s2', 2) === 0) {
          const k = r.int(0, 3), T = r.pick([20, 30, 50, 60, 80, 90, 100, 120, 140]), e = [0, 0, 0, 0]; e[k] = T;
          const a = fx(fr(T, 4)); if (decLen(fr(T, 4)) > 1 || !cap(r, '83s2', a)) return null;
          return { q: `正方形の板の${SIDES[k]}のふちだけ ${T}℃、ほかは 0℃。落ち着いたまん中 ＝ □℃`, a: `$${a}$`, key: `83|${e.slice().sort()}`,
            easy: `$\\frac{${T}}{4}=${a}$`, easyCheck: 'last', verify: p => near(num1(p.a), plateC(e), 1e-6) || 'ならした板のまん中とちがう' };
        }
        const e = [r.pick([100, 80, 60]), r.pick([0, 20, 40]), r.pick([0, 10, 20]), 0], X = r.pick([30, 35, 40, 45, 50]);
        const L = 4 * X - e[0] - e[1] - e[2]; if (L < 0 || L > 150 || !cap(r, '83s2', String(L))) return null;
        return { q: `正方形の板のふち 上 ${e[0]}・右 ${e[1]}・下 ${e[2]}（℃）。まん中を ${X}℃ にする左のふちの温度`, a: `$${L}$`, key: `83i|${e}|${X}`,
          easy: `$${e[0]}+${e[1]}+${e[2]}+\\square=4\\times${X}$`, easyCheck: false,
          verify: p => near(plateC([e[0], e[1], e[2], num1(p.a)]), X, 1e-6) || 'その左の温度では、まん中が目標にならない' };
      },
      // 見かけがちがう：図・正方形の筒の電位
      s3(r) {
        if (turn(r, '83s3', 2) === 0) {
          const e = [0, 1, 2, 3].map(() => r.pick([0, 10, 20, 40, 60, 80, 100])); if (e.every(v => v === e[0]) || ex83(e)) return null;
          const A = F.make(e[0] + e[1] + e[2] + e[3], 4); if (decLen(A) > 1) return null;
          const a = fx(A); if (a === '40' || !cap(r, '83s3', a)) return null;
          return { q: '図の正方形の板の、落ち着いたまん中 ＝ □℃', a: `$${a}$`, key: `83f|${e}`, fig: fig83(e),
            easy: `$\\frac{${e.join('+')}}{4}=${a}$`, easyCheck: 'last', verify: p => near(num1(p.a), plateC(e), 1e-6) || 'ならした板のまん中とちがう' };
        }
        const e = [0, 1, 2, 3].map(() => r.pick([0, 0, 6, 10, 12, 20, 24, 30])); if (e.every(v => v === e[0])) return null;
        const A = F.make(e[0] + e[1] + e[2] + e[3], 4); if (decLen(A) > 1) return null;
        const a = fx(A); if (!cap(r, '83s3', a)) return null;
        return { q: `長い正方形の筒の4つの面の電位が ${e.map(v => `$${v}\\,\\mathrm{V}$`).join('、')}。中に電荷がないとき、中心の軸の電位 ＝ $□\\,\\mathrm{V}$`, a: `$${a}$`, key: `83v|${e.slice().sort()}`,
          easy: `電位も $\\nabla^2\\phi=0$：$\\frac{${e.join('+')}}{4}$`, easyCheck: false, verify: p => near(num1(p.a), plateC(e), 1e-6) || 'ならした板のまん中とちがう' };
      },
      // わな：2つのマス（8-82）
      trap(r) {
        const g = gen82(r, false); if (!g) return null;
        const [A, B] = g.AB;
        return dest({ q: `マス A（上）と B（下）。A：北 ${g.top[0]}・西 ${g.top[1]}・東 ${g.top[2]}・南は B。B：北は A・西 ${g.bot[0]}・東 ${g.bot[1]}・南 ${g.bot[2]}（℃）。落ち着いた A ＝ □℃、B ＝ □℃`,
          a: pairA(A, B), key: `83t|${g.P},${g.Q}`,
          verify: p => { const [x, y] = nums(p.a), [u, v] = relax2(g.P, g.Q); return (near(x, u, 1e-9) && near(y, v, 1e-9)) || 'ならすくり返しの行き先とちがう'; } }, '8-83', '正方形の板のまん中ではない。マスごとに式を作る');
      },
    },
  });

  // ================================================================ 8-84 球・円柱の形の ∇²、球対称の電位 a/r+b
  // f = c r^n。球：n(n+1) c r^{n−2}、円柱：n² c r^{n−2}
  function rpow(k, m) {   // k r^m の TeX
    if (k === 0) return '0';
    const s = k < 0 ? '-' : '', a = Math.abs(k);
    if (m === 0) return s + a;
    if (m > 0) return s + (a === 1 ? '' : a) + 'r' + (m > 1 ? `^${m}` : '');
    return `${s}\\frac{${a}}{r${-m > 1 ? `^${-m}` : ''}}`;
  }
  const lap3 = (f, x, y, z) => { const h = 1e-3; return [[h, 0, 0], [0, h, 0], [0, 0, h]].reduce((s, d) => s + (f(x + d[0], y + d[1], z + d[2]) - 2 * f(x, y, z) + f(x - d[0], y - d[1], z - d[2])) / (h * h), 0); };
  const ex84 = new Set(['S|1|2', 'S|1|-1']);
  // 球の電位：内 r1 で V1、外 r2 で V2 → φ = a/r + b
  function gen84(r) {
    for (let k = 0; k < 40; k++) {
      const r1 = r.pick([0.1, 0.2, 0.05]), m = r.pick([2, 3, 4]), r2 = +(r1 * m).toFixed(6), V1 = r.pick([20, 30, 40, 60, 80, 90, 120]), V2 = r.pick([0, 0, 0, 10, 20]);
      if (V2 >= V1) continue;
      const a = F.div(fr(V1 - V2), F.sub(F.div(fr(1), D(r1)), F.div(fr(1), D(r2)))), b = F.sub(fr(V2), F.div(a, D(r2)));
      const rq = +(r1 * r.pick([1.5, 2, 2.5, 3].filter(t => t < m))).toFixed(6); if (!(rq > r1 && rq < r2)) continue;
      if (r1 === 0.1 && r2 === 0.3) continue;   // 楽な形の例と同じ半径の組（電圧だけ何倍かになる。R2-17・Z-2）
      const phi = F.add(F.div(a, D(rq)), b); if (decLen(phi) > 1 || decLen(a) > 3) continue;
      return { r1, r2, V1, V2, rq, a, b, phi };
    }
    return null;
  }
  // 同じ半径で、電圧だけ何倍かの組（答えも何倍か）を、同じ見開きに重ねない（R2-17・Z-2）
  const rat84 = g => `84r|${g.r1},${g.r2},${fmt(g.V2 / g.V1)}`;
  M.add({
    id: '8-84', part: 6, chap: '8-12⑦ 例題7・例題8', stars: 1,
    title: '球・円柱の形の $\\nabla^2$：$r^2$（円柱は $r$）をかけてから微分し、わる',
    mark: '中心（軸）からの距離 $r$ だけの関数 $f(r)$。同じ中心の2つの球の電位・温度。',
    futsu: ['$r=\\sqrt{x^2+y^2+z^2}$ を入れ、', '$x$・$y$・$z$ で2回ずつ', '偏微分してたす'],
    raku: ['球で $f=r^2$：$r^2\\times2r=2r^3$', '微分して $6r^2$、$r^2$ でわって6', '内0.1 m が60 V、外0.3 m が0 V', '→ $\\phi=\\frac9r-30$、0.2 m で15 V'],
    why: '球は $\\nabla^2f=\\frac{1}{r^2}\\frac{\\dd}{\\dd r}\\Bigl(r^2\\frac{\\dd f}{\\dd r}\\Bigr)$、円柱は $r^2$ を $r$ に（8-12⑦）。$\\nabla^2\\phi=0$ の球の形は $\\frac ar+b$。',
    caution: '2階微分 $\\frac{\\dd^2f}{\\dd r^2}$ だけにしない。電位は、まん中でも両はしの平均にならない。',
    counts: { s1: 7, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '18mm', s3: '18mm', trap: '14mm' },
    fits(q) { return /中心からの距離|軸からの距離|同じ中心の2つの球|同じ中心の/.test(q); },
    steps: {
      s1(r) {
        const sph = r.chance(0.55), n = r.pick([1, 2, 3, 4, -1, -2]), c = r.pick([1, 1, 2, 3, 5]);
        if (sph && (n === 2 || n === -1)) return null;   // 楽な形の例とその何倍か（S-2）
        const k = c * (sph ? n * (n + 1) : n * n), a = rpow(k, n - 2); if (!cap(r, '84s1', a)) return null;
        const ft = n > 0 ? rpow(c, n) : `\\frac{${c}}{r${n < -1 ? `^${-n}` : ''}}`;
        const f = sph ? (x, y, z) => c * Math.hypot(x, y, z) ** n : (x, y) => c * Math.hypot(x, y) ** n;
        return { q: `$f=${ft}$（$r$ は${sph ? '中心' : '軸'}からの距離）の $\\nabla^2f$（${sph ? '球' : '円柱'}の式）`, a: `$${a}$`, key: `84|${sph}|${c}|${n}`,
          easy: `$\\frac{\\dd f}{\\dd r}=${rpow(c * n, n - 1)}$、$${sph ? 'r^2' : 'r'}$ をかけて微分し、$${sph ? 'r^2' : 'r'}$ でわる`, easyCheck: false,
          verify: p => { const P = [0.7, -0.4, 0.5], rr = sph ? Math.hypot(...P) : Math.hypot(P[0], P[1]); return near(ev(strip(p.a), { r: rr }), lap3(f, ...P), 1e-4) || '直角座標で計算した $\\nabla^2f$ とちがう'; } };
      },
      // 同じ中心の球の電位
      s2(r) {
        const g = gen84(r); if (!g || !once(r, `84|${g.r1},${g.r2},${g.V1},${g.V2}`) || !once(r, rat84(g))) return null;
        const a = fx(g.phi); if (!cap(r, '84s2', a)) return null;
        return { q: `同じ中心の金属球：内（${U(g.r1, 'm')}）が ${U(g.V1, 'V')}、外（${U(g.r2, 'm')}）が ${U(g.V2, 'V')}。$r=${fmt(g.rq)}\\,\\mathrm{m}$ の電位 ＝ $□\\,\\mathrm{V}$`, a: `$${a}$`, key: `84v|${g.r1},${g.r2},${g.V1},${g.V2},${g.rq}`,
          easy: `$a=${fx(g.a)}$、$b=${fx(g.b)}$`, easyCheck: false,
          verify: p => { const A = (g.V1 - g.V2) / (1 / g.r1 - 1 / g.r2), B = g.V1 - A / g.r1; return (near(A / g.r2 + B, g.V2, 1e-9) && near(num1(p.a), A / g.rq + B, 1e-9)) || '内と外の条件をみたす式の値とちがう'; } };
      },
      // 見かけがちがう：球の殻の中の温度・電場の大きさ
      s3(r) {
        const g = gen84(r); if (!g || !once(r, `84|${g.r1},${g.r2},${g.V1},${g.V2}`) || !once(r, rat84(g))) return null;
        if (turn(r, '84s3', 2) === 0) {
          const a = fx(g.phi); if (!cap(r, '84s3', a)) return null;
          return { q: `同じ中心の2つの球面ではさんだ殻：内（${U(g.r1, 'm')}）${g.V1}℃、外（${U(g.r2, 'm')}）${g.V2}℃（落ち着いた）。中心から ${U(g.rq, 'm')} の温度 ＝ □℃`, a: `$${a}$`, key: `84t|${g.r1},${g.r2},${g.V1},${g.V2},${g.rq}`,
            easy: `$T=\\frac ar+b$：$a=${fx(g.a)}$、$b=${fx(g.b)}$`, easyCheck: false,
            verify: p => { const A = (g.V1 - g.V2) / (1 / g.r1 - 1 / g.r2), B = g.V1 - A / g.r1; return near(num1(p.a), A / g.rq + B, 1e-9) || '内と外の条件をみたす式の値とちがう'; } };
        }
        const E = F.div(g.a, F.mul(D(g.rq), D(g.rq))); if (decLen(E) > 1) return null;
        const a = fx(E); if (!cap(r, '84s3', a)) return null;
        return { q: `同じ中心の金属球：内（${U(g.r1, 'm')}）が ${U(g.V1, 'V')}、外（${U(g.r2, 'm')}）が ${U(g.V2, 'V')}。$r=${fmt(g.rq)}\\,\\mathrm{m}$ の電場の大きさ ＝ $□\\,\\mathrm{V/m}$`, a: `$${a}$`, key: `84e|${g.r1},${g.r2},${g.V1},${g.V2},${g.rq}`,
          easy: `$\\phi=\\frac{${fx(g.a)}}{r}+b$、$\\frac{${fx(g.a)}}{r^2}$`, easyCheck: false,
          verify: p => { const A = (g.V1 - g.V2) / (1 / g.r1 - 1 / g.r2), B = g.V1 - A / g.r1, h = 1e-6, phi = t => A / t + B; return near(num1(p.a), Math.abs((phi(g.rq + h) - phi(g.rq - h)) / (2 * h)), 1e-5) || '電位の傾きの大きさとちがう'; } };
      },
      // わな：r だけの式ではない（8-81）
      trap(r) {
        const a = r.pick([1, 2, 3, -1]), b = r.pick([2, 3, 4, 5]), ts = [mono(a, 2), mono(b, 1, 1)], A = 2 * a;
        return dest({ q: `$f=${pTeX(ts)}$ の $\\nabla^2f$`, a: `$${A}$`, key: `84t|${a}|${b}`,
          calc: { kind: 'pdiff', op: 'lap', f: jsP(ts), vars: ['x', 'y'] } }, '8-84', '中心からの距離 $r$ だけの式ではない。$x$・$y$ で2回ずつ偏微分', ['8-81']);
      },
    },
  });

  // ================================================================ 8-85 熱の表計算の1歩
  const step85 = (T, r, i) => T[i] + r * (T[i - 1] - 2 * T[i] + T[i + 1]);
  const ex85 = (T, r) => r === 0.25 && T.slice(0, 4).join() === '100,60,40,30';
  function gen85(r, n) {
    for (let k = 0; k < 40; k++) {
      const rr = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), T = [r.pick([100, 90, 80, 60])];
      for (let j = 1; j < n; j++) T.push(Math.max(0, T[j - 1] - r.pick([10, 20, 15, 30, 5])));
      if (ex85(T, rr) || new Set(T).size < n - 1) continue;
      const nx = T.map((v, i) => (i === 0 || i === n - 1 ? v : step85(T, rr, i)));
      if (nx.some(v => decLen(D(+v.toFixed(8))) > 2)) continue;
      return { r: rr, T, nx: nx.map(v => +v.toFixed(8)) };
    }
    return null;
  }
  const tl = T => T.join('、');
  // numpy と同じ順で計算した1歩の値（浮動小数点）と、Python の print の表示（35.0・61.5）。表示が長くなる組は null
  const npStep = (T, r, i) => T[i] + r * ((T[i + 1] - 2 * T[i]) + T[i - 1]);
  const pyFloat = v => { const t = String(v); if (/e/.test(t) || t.replace(/^-/, '').length > 8) return null; return /\./.test(t) ? t : t + '.0'; };
  const full85 = (T, r, i) => `${T[i]}+${r}\\times(${T[i - 1]}-${2 * T[i]}+${T[i + 1]})`;
  M.add({
    id: '8-85', part: 6, chap: '8-13①③ 例題1', stars: 1,
    title: '熱の表計算の1歩：次＝今＋$r$×（左－2×自分＋右）',
    mark: '$r=\\square$ の熱の表計算、「次の時刻の温度」。',
    futsu: ['となりから入る熱と出る熱を', '別々に計算して、', '温度の上がりを出す'],
    raku: ['$r=0.25$：100（はし）・60・40・30', '2番め $60+0.25\\times20=65$', '3番め $40+0.25\\times10=42.5$'],
    why: '$T_i^{\\,n+1}=T_i^{\\,n}+r\\bigl(T_{i+1}^{\\,n}-2T_i^{\\,n}+T_{i-1}^{\\,n}\\bigr)$（8-13③）。$r=0.5$ なら「次＝となり2点の平均」。',
    caution: 'はしの点には1歩の式を使わない（決まった温度。断熱のはしは $T+2r\\times$（となり－自分））。',
    counts: { s1: 7, s2: 2, s3: 1, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '20mm' },
    fits(q, p) { return /熱の表計算/.test(q) && (/次の時刻/.test(q) || !!(p && p.table)) || !!(p && p.code && /T\[2:/.test(p.code)); },
    steps: {
      s1(r) {
        const g = gen85(r, 4), i = r.pick([1, 2]); if (!g || !once(r, `85|${g.r}|${g.T}`)) return null;
        const a = fmt(g.nx[i]); if (!cap(r, '85s1', a)) return null;
        return { q: `熱の表計算（$r=${g.r}$）：左から ${g.T[0]}（左はし）、${tl(g.T.slice(1))}（℃）。次の時刻の${i + 1}番め ＝ □℃`, a: `$${a}$`, key: `85|${g.r}|${g.T}|${i}`,
          easy: `$${g.T[i]}+${g.r}\\times(${g.T[i - 1]}-${2 * g.T[i]}+${g.T[i + 1]})=${a}$`, easyCheck: 'last',
          verify: p => { const Tn = g.T.slice(); const lft = (g.T[i - 1] - g.T[i]) * g.r, rgt = (g.T[i + 1] - g.T[i]) * g.r; return near(num1(p.a), Tn[i] + lft + rgt, 1e-9) || '左右から入る熱の和とちがう'; } };
      },
      // 2つの点・断熱の右はし
      s2(r) {
        if (turn(r, '85s2', 2) === 0) {
          const g = gen85(r, 4); if (!g || !once(r, `85|${g.r}|${g.T}`)) return null;
          return { q: `熱の表計算（$r=${g.r}$）：左から ${g.T[0]}（左はし）、${tl(g.T.slice(1))}（℃）。次の時刻の2番め ＝ □℃、3番め ＝ □℃`, a: `$${fmt(g.nx[1])}$℃、$${fmt(g.nx[2])}$℃`, key: `85b|${g.r}|${g.T}`,
            easy: `$${full85(g.T, g.r, 1)}$、$${full85(g.T, g.r, 2)}$`, easyCheck: false,
            verify: p => { const [x, y] = nums(p.a); return (near(x, g.T[1] + g.r * (g.T[0] - g.T[1]) + g.r * (g.T[2] - g.T[1]), 1e-9) && near(y, g.T[2] + g.r * (g.T[1] - g.T[2]) + g.r * (g.T[3] - g.T[2]), 1e-9)) || '1歩の値とちがう'; } };
        }
        const rr = r.pick([0.1, 0.2, 0.25, 0.3, 0.4]), L = r.pick([30, 40, 50, 60, 70]), R = r.pick([20, 24, 28, 30, 36].filter(v => v < L)), A = R + 2 * rr * (L - R);
        if (decLen(D(+A.toFixed(8))) > 1) return null;
        const a = fmt(A); if (!cap(r, '85s2', a)) return null;
        return { q: `熱の表計算（$r=${rr}$）で、右はしは断熱。左どなり ${L}℃、右はし ${R}℃ のとき、次の時刻の右はし ＝ □℃`, a: `$${a}$`, key: `85e|${rr}|${L}|${R}`,
          easy: `$${R}+2\\times${rr}\\times(${L}-${R})=${a}$`, easyCheck: 'last',
          verify: p => { const T = [L, R, L]; return near(num1(p.a), step85(T, rr, 1), 1e-9) || '鏡にうつした点を使った1歩とちがう'; } };   // 断熱のはしは、外に同じ温度の点を置いたのと同じ
      },
      // 見かけがちがう：表の □・Python の1歩
      s3(r) {
        if (turn(r, '85s3', 2) === 1) {
          const g = gen85(r, 5), i = r.pick([1, 2, 3]); if (!g || !once(r, `85|${g.r}|${g.T}`)) return null;
          const a = fmt(g.nx[i]);
          const row1 = g.nx.map((v, j) => (j === i ? '□' : j === 0 || j === 4 || j < i ? fmt(v) : ''));
          if (!cap(r, '85s3', a)) return null;
          return { q: `熱の表計算（$r=${g.r}$。両はしは一定）の表の □（℃）`, a: `$${a}$`, key: `85t|${g.r}|${g.T}|${i}`,
            table: { head: ['点', '1', '2', '3', '4', '5'], rows: [['今'].concat(g.T.map(String)), ['次'].concat(row1)] },
            easy: `$${g.T[i]}+${g.r}\\times(${g.T[i - 1]}-${2 * g.T[i]}+${g.T[i + 1]})=${a}$`, easyCheck: 'last',
            verify: p => near(num1(p.a), step85(g.T, g.r, i), 1e-9) || '1歩の値とちがう' };
        }
        const g = gen85(r, 5), i = r.pick([1, 2, 3]); if (!g || !once(r, `85|${g.r}|${g.T}`)) return null;
        const a = pyFloat(npStep(g.T, g.r, i)); if (a == null) return null;
        const code = `import numpy as np\nT = np.array([${g.T.map(v => v.toFixed(1)).join(', ')}])\nr = ${g.r}\nU = T.copy()\nU[1:4] = T[1:4] + r*(T[2:5] - 2*T[1:4] + T[0:3])\nprint(U[${i}])`;
        return { q: '次のプログラムで表示される数', a: `\`${a}\``, key: `85c|${g.r}|${g.T}|${i}`, code,
          easy: `\`U[${i}]\` は ${i + 1}番めの点の次の温度：$${g.T[i]}+${g.r}\\times(${g.T[i - 1]}-${2 * g.T[i]}+${g.T[i + 1]})$`, easyCheck: false,
          verify: p => { const U = g.T.slice(); for (let j = 1; j < 4; j++) U[j] = g.T[j] + g.r * ((g.T[j + 1] - 2 * g.T[j]) + g.T[j - 1]); return String(p.a).replace(/`/g, '') === pyFloat(U[i]) || 'プログラムをまねた値とちがう'; } };
      },
      // わな：こわれるか（8-86）
      trap(r) {
        const al = r.pick([[1e-4, 'アルミ', '1.0\\times10^{-4}'], [1.2e-4, '銅', '1.2\\times10^{-4}']]), dx = r.pick([0.01, 0.02]), want = turn(r, '85t', 2) === 0;
        for (let k = 0; k < 20; k++) {
          const dt = r.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 2.5, 3]), rr = al[0] * dt / (dx * dx);
          if ((rr <= 0.5) !== want || Math.abs(rr - 0.5) < 1e-9) continue;
          return dest({ q: `${al[1]}（$\\alpha=${al[2]}\\,\\mathrm{m^2/s}$）の棒を $\\Delta x=${dx}\\,\\mathrm{m}$、$\\Delta t=${dt}\\,\\mathrm{s}$ で表計算する。（こわれる・こわれない）`, a: want ? 'こわれない' : 'こわれる', key: `85t|${al[1]}|${dx}|${dt}`,
            verify: p => p.a === (al[0] * dt / (dx * dx) <= 0.5 ? 'こわれない' : 'こわれる') || '$r\\leqq\\frac12$ の判定とちがう' }, '8-85', '1歩の計算ではなく、こわれない条件。$r=\\frac{\\alpha\\Delta t}{\\Delta x^2}$ を出す', ['8-86']);
        }
        return null;
      },
    },
  });

  // ================================================================ 8-86 こわれない条件 r≦1/2、ぎざぎざの倍率 1−4r
  const MAT = [['銅', '0.00012', '1.2\\times10^{-4}'], ['アルミ', '0.0001', '1.0\\times10^{-4}'], ['鉄', '0.000023', '2.3\\times10^{-5}'], ['ステンレス', '0.000004', '4.0\\times10^{-6}']];
  const alT = m => `${m[0]}（$\\alpha=${m[2]}\\,\\mathrm{m^2/s}$）`;   // 熱拡散率の単位を書く（Z-8）
  // 例（$\alpha=10^{-4}$、$\Delta x=0.01$）と同じ α・Δx の組、Δx を半分にしただけの組（使えないときの「$\frac14$」）を出さない（R2-18・Z-1）
  const ex86 = (m, dx) => m[0] === 'アルミ' && (dx === 0.01 || dx === 0.005);
  const rOf = (m, dx, dt) => F.div(F.mul(D(m[1]), D(dt)), F.mul(D(dx), D(dx)));
  // こわれるかを、ぎざぎざを実際に1歩ずつ進めて確かめる（20点、200歩）
  function breaks(rr) {
    let T = Array.from({ length: 21 }, (_, i) => (i === 0 || i === 20 ? 0 : (i % 2 ? 1 : -1)));
    for (let n = 0; n < 200; n++) T = T.map((v, i) => (i === 0 || i === 20 ? 0 : v + rr * (T[i - 1] - 2 * v + T[i + 1])));
    return Math.max(...T.map(Math.abs)) > 1;
  }
  const BAN86 = new Set(['0.4', '0.5', '-0.6', '-1.4']);
  M.add({
    id: '8-86', part: 6, chap: '8-13④⑤ 例題2・例題3', stars: 1,
    title: 'こわれない条件 $r=\\frac{\\alpha\\Delta t}{\\Delta x^2}\\leqq\\frac12$。ぎざぎざの1歩の倍率は $1-4r$',
    mark: '$\\alpha$、$\\Delta x$、$\\Delta t$。「こわれないか」「一番大きい $\\Delta t$」「ぎざぎざの倍率」。',
    futsu: ['表計算を何十歩も進め、', 'ぎざぎざが育つかを見る'],
    raku: ['$\\alpha=10^{-4}$、$\\Delta x=0.01$、$\\Delta t=0.4$', '→ $r=0.4$（こわれない）', '一番大きい $\\Delta t=\\frac{\\Delta x^2}{2\\alpha}=0.5$', 'ぎざぎざは $1-4r=-0.6$ 倍'],
    why: 'ぎざぎざ $+a$、$-a$、…は1歩で $(1-4r)$ 倍（8-13⑤）。大きさが1以下なら育たないので $r=\\frac{\\alpha\\Delta t}{\\Delta x^2}\\leqq\\frac12$。',
    caution: '$\\Delta x$ は2乗する。マスを半分にすると、$\\Delta t$ の上限は $\\frac14$。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '18mm', s3: '22mm', trap: '14mm' },
    fits(q) { return /\\alpha=/.test(q) && /\\Delta x/.test(q) && /(\\Delta t|こわれ)/.test(q) || /ぎざぎざ|交互/.test(q) && /倍|1歩で/.test(q) || /こわれない一番大きい/.test(q); },
    steps: {
      s1(r) {
        const m = r.pick(MAT), dx = r.pick(m[0] === 'ステンレス' ? [0.001, 0.002] : m[0] === '鉄' ? [0.01, 0.005] : [0.01, 0.02, 0.005]), dt = r.pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.5, 2, 3]);
        const R = rOf(m, dx, dt); if (ex86(m, dx) || F.val(R) > 1.2 || F.val(R) < 0.05 || decLen(R) > 3) return null;
        // 同じ物・同じ Δx で、Δt だけちがう（答えが何倍かだけの）問題を重ねない（Z-2）
        const a = fx(R); if (BAN86.has(a) || !cap(r, '86s1', a) || !cap(r, '86s1m', m[0] + dx, 1)) return null;
        return { q: `${alT(m)}の棒、$\\Delta x=${dx}\\,\\mathrm{m}$、$\\Delta t=${dt}\\,\\mathrm{s}$ の表計算の $r$`, a: `$${a}$`, key: `86|${m[0]}|${dx}|${dt}`,
          easy: `$r=\\frac{${m[2]}\\times${dt}}{${dx}^2}=${a}$`, easyCheck: false,
          verify: p => near(num1(p.a), +m[1] * dt / (dx * dx), 1e-9) || '$\\frac{\\alpha\\Delta t}{\\Delta x^2}$ とちがう' };
      },
      // 一番大きい Δt・ぎざぎざの倍率
      s2(r) {
        if (turn(r, '86s2', 2) === 0) {
          const m = r.pick(MAT), dx = r.pick(m[0] === 'ステンレス' ? [0.001, 0.002, 0.004] : [0.01, 0.02, 0.005, 0.004]);
          const A = F.div(F.mul(D(dx), D(dx)), F.mul(fr(2), D(m[1]))); if (ex86(m, dx) || decLen(A) > 3) return null;
          const a = fx(A); if (BAN86.has(a) || !cap(r, '86s2', a)) return null;
          return { q: `${alT(m)}の棒、$\\Delta x=${dx}\\,\\mathrm{m}$。こわれない一番大きい $\\Delta t$ ＝ $□\\,\\mathrm{s}$`, a: `$${a}$`, key: `86m|${m[0]}|${dx}`,
            easy: `$\\frac{\\Delta x^2}{2\\alpha}=\\frac{${dx}^2}{2\\times${m[2]}}$`, easyCheck: false,
            verify: p => { const dt = num1(p.a), up = dt * 1.02, dn = dt * 0.98; return (!breaks(+m[1] * dn / (dx * dx)) && breaks(+m[1] * up / (dx * dx))) || 'そのすぐ上でこわれ、すぐ下でこわれない、になっていない'; } };
        }
        const rr = r.pick([0.1, 0.15, 0.2, 0.3, 0.35, 0.45, 0.5, 0.55, 0.7, 0.75, 0.8]), A = F.sub(fr(1), F.mul(fr(4), D(rr))), a = fx(A);
        if (BAN86.has(a) || !cap(r, '86s2', a)) return null;
        return { q: `$r=${rr}$ のとき、ぎざぎざ（$+a$、$-a$、$+a$、…）の1歩の倍率`, a: `$${a}$`, key: `86z|${rr}`,
          easy: `$1-4\\times${rr}=${a}$`, easyCheck: 'last',
          verify: p => { const T = [-1, 1, -1], nx = T[1] + rr * (T[0] - 2 * T[1] + T[2]); return near(num1(p.a), nx / T[1], 1e-12) || '1歩進めたぎざぎざの倍率とちがう'; } };
      },
      // 見かけがちがう：ぎざぎざの点の値・マスを細かくしたときの Δt・こわれるか
      s3(r) {
        const kind = turn(r, '86s3', 3);
        if (kind === 0) {
          const a0 = r.pick([2, 3, 4, 5, 10]), rr = r.pick([0.1, 0.2, 0.3, 0.4, 0.45, 0.6, 0.7]), A = F.mul(fr(a0), F.sub(fr(1), F.mul(fr(4), D(rr)))), a = fx(A);
          if (!cap(r, '86s3', a)) return null;
          return { q: `ぎざぎざ $+${a0}$、$-${a0}$、$+${a0}$、…（$r=${rr}$）。$+${a0}$ の点は1歩で何になるか`, a: `$${a}$`, key: `86a|${a0}|${rr}`,
            easy: `$${a0}+${rr}\\times(-${a0}-${2 * a0}-${a0})=${a}$`, easyCheck: 'last',
            verify: p => near(num1(p.a), a0 + rr * (-a0 - 2 * a0 - a0), 1e-12) || '1歩の式とちがう' };
        }
        if (kind === 1) {
          const n = r.pick([2, 3, 4, 5, 10]), a = `\\frac{1}{${n * n}}`; if (!cap(r, '86s3', a)) return null;
          return { q: `マスを $\\frac{1}{${n}}$ の大きさにすると、こわれない一番大きい $\\Delta t$ は何倍か`, a: `$${a}$`, key: `86h|${n}`,
            easy: `$\\Delta t=\\frac{\\Delta x^2}{2\\alpha}$ は $\\Delta x^2$ に比例`, easyCheck: false,
            verify: p => { const dx = 0.01, dt0 = dx * dx / 2e-4, dt1 = (dx / n) ** 2 / 2e-4; return near(num1(p.a), dt1 / dt0, 1e-12) || '上限の比とちがう'; } };
        }
        const want = peek(r, '86s3b', 2) === 0, m = r.pick(MAT), dx = r.pick(m[0] === 'ステンレス' ? [0.001, 0.002] : [0.01, 0.005, 0.02]);
        if (ex86(m, dx)) return null;
        for (let k = 0; k < 20; k++) {
          const dt = r.pick([0.05, 0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 2, 3, 4]), R = F.val(rOf(m, dx, dt)); if ((R <= 0.5) !== want || R < 0.1 || R > 2 || near(R, 0.5)) continue;
          const A = want ? 'こわれない' : 'こわれる'; if (!cap(r, '86s3c', A)) return null; adv(r, '86s3b', 2);
          // こわれない条件 $r\leqq\frac12$ は棒（1次元）の表計算のもの。「板」は使わない（Z-5）
          return { q: `${alT(m)}の棒、$\\Delta x=${dx}\\,\\mathrm{m}$、$\\Delta t=${dt}\\,\\mathrm{s}$ の表計算は（こわれる・こわれない）`, a: A, key: `86b|${m[0]}|${dx}|${dt}`,
            easy: `$r=${fx(rOf(m, dx, dt))}$`, easyCheck: false,
            verify: p => p.a === (breaks(R) ? 'こわれる' : 'こわれない') || 'ぎざぎざを進めた結果とちがう' };
        }
        return null;
      },
      // わな：1歩の計算（8-85）
      trap(r) {
        const g = gen85(r, 3); if (!g) return null;
        return dest({ q: `熱の表計算（$r=${g.r}$）：左から ${tl(g.T)}（℃。両はしは一定）。次の時刻のまん中 ＝ □℃`, a: `$${fmt(g.nx[1])}$`, key: `86t|${g.r}|${g.T}`,
          verify: p => near(num1(p.a), step85(g.T, g.r, 1), 1e-9) || '1歩の値とちがう' }, '8-86', 'こわれるかではなく、1歩の値', ['8-85']);
      },
    },
  });

  // ================================================================ 8-87 熱方程式の答え e^{−λt} sin ax：λ = α a²、半分になる時間 ln2/λ
  const AL = [['1.0\\times10^{-4}', '0.0001'], ['4.0\\times10^{-6}', '0.000004'], ['1.2\\times10^{-4}', '0.00012']];   // 書き方をそろえる（Z-8）
  const eT = l => (l === '1' ? 'e^{-t}' : `e^{-${l}t}`);   // 係数の1は書かない（Z-7）
  const HEQ = '熱方程式 $\\frac{\\partial T}{\\partial t}=\\alpha\\frac{\\partial^2T}{\\partial x^2}$';
  // 代入して確かめる：T=C e^{-λt} sin ax の、ある点での左辺と右辺（中心差分）
  const heatOK = (C, lam, al, a) => { const T = (x, t) => C * Math.exp(-lam * t) * Math.sin(a * x), x = 0.37 / a, t = 0.5 / lam, h = 1e-4 / a, k = 1e-4 / lam; const L = (T(x, t + k) - T(x, t - k)) / (2 * k), R = al * (T(x + h, t) - 2 * T(x, t) + T(x - h, t)) / (h * h); return Math.abs(L - R) <= 1e-5 * Math.max(Math.abs(L), 1e-12); };
  const lnT = f => (F.eq(f, fr(1)) ? '\\ln2' : `${f[1] === 1 ? f[0] : `\\frac{${f[0]}}{${f[1]}}`}\\ln2`);
  M.add({
    id: '8-87', part: 6, chap: '8-13⑥⑦ 例題4', stars: 1,
    title: '熱方程式の答え $e^{-\\lambda t}\\sin ax$ は $\\lambda=\\alpha a^2$。半分になる時間は $\\frac{\\ln2}{\\lambda}$',
    mark: '熱方程式と $T=Ce^{-\\square t}\\sin\\square x$。「でこぼこが半分になる時間」。',
    futsu: ['表計算を何歩も進め、', '半分になる時刻をさがす'],
    raku: ['$\\alpha=10^{-4}$、$T=5e^{-\\lambda t}\\sin20x$', '→ $\\lambda=10^{-4}\\times400=0.04$', '半分 $\\frac{\\ln2}{0.04}=25\\ln2$（約 17.3 s）'],
    why: '$t$ で微分すると $-\\lambda T$、$x$ で2回は $-a^2T$。熱方程式に入れて $\\lambda=\\alpha a^2$（8-13⑦）。$e^{-\\lambda t}=\\frac12$ から $\\frac{\\ln2}{\\lambda}$。',
    caution: '$a$ は2乗する（3倍細かいと9倍速く消える）。前の $C$ は関係しない。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '20mm', s3: '16mm', trap: '20mm' },
    fits(q) { return /e\^\{-/.test(q) && /\\sin/.test(q) && /(熱方程式|半分になる|\\alpha)/.test(q) || /でこぼこ/.test(q) && /(細かく|半分)/.test(q); },
    steps: {
      s1(r) {
        const al = r.pick(AL), a = r.pick(al[1] === '0.000004' ? [50, 100, 200, 500] : [10, 20, 30, 40, 50, 5]), C = r.pick([2, 3, 5, 8, 10]);
        if (al[1] === '0.0001' && a === 20) return null;
        const L = F.mul(D(al[1]), fr(a * a)); if (decLen(L) > 4) return null;
        const A = fx(L); if (!cap(r, '87s1', A)) return null;
        return { q: `$\\alpha=${al[0]}\\,\\mathrm{m^2/s}$ の棒で、$T=${C}e^{-\\lambda t}\\sin${a}x$ が熱方程式をみたす $\\lambda$`, a: `$${A}$`, key: `87|${al[1]}|${a}`,
          easy: `$\\lambda=\\alpha a^2=${al[0]}\\times${a}^2$`, easyCheck: false,
          verify: p => heatOK(C, num1(p.a), +al[1], a) || '代入すると左辺と右辺がちがう' };
      },
      // 半分になる時間（ln2 を残す）・α を逆に
      s2(r) {
        if (turn(r, '87s2', 2) === 0) {
          const lam = r.pick(['0.01', '0.02', '0.05', '0.1', '0.2', '0.25', '0.5', '0.08', '0.4']), C = r.pick([4, 6, 10, 20]), a = r.pick([10, 20, 30, 40]);
          if (lam === '0.04') return null;
          const k = F.div(fr(1), D(lam)), A = lnT(k); if (!cap(r, '87s2', A)) return null;
          return { q: `熱方程式の答え $T=${C}e^{-${lam}t}\\sin${a}x$ のでこぼこが半分になる時間（$\\ln$ を残す）＝ $□\\,\\mathrm{s}$`, a: `$${A}$`, key: `87h|${lam}`,
            easy: `$e^{-${lam}t}=\\frac12$ から $t=\\frac{\\ln2}{${lam}}$`, easyCheck: false,
            verify: p => near(Math.exp(-(+lam) * num1(p.a)), 0.5, 1e-12) || 'その時刻で半分にならない' };
        }
        const al = r.pick(AL.slice(0, 2)), a = r.pick([10, 20, 30, 50, 100]), lam = F.mul(D(al[1]), fr(a * a)); if (decLen(lam) > 4) return null;
        if (al[1] === '0.0001' && a === 20) return null;
        const C = r.pick([3, 5, 8]), A = al[0]; if (!cap(r, '87s2', A)) return null;
        return { q: `$T=${C}${eT(fx(lam))}\\sin${a}x$ が熱方程式をみたす棒の $\\alpha$ ＝ $□\\,\\mathrm{m^2/s}$`, a: `$${A}$`, key: `87a|${fx(lam)}|${a}`,
          easy: `$\\alpha=\\frac{\\lambda}{a^2}=\\frac{${fx(lam)}}{${a * a}}$`, easyCheck: false,
          verify: p => heatOK(C, F.val(lam), num1(p.a), a) || '代入すると左辺と右辺がちがう' };
      },
      // 見かけがちがう：約の秒（ln2=0.693）・細かさが n 倍のとき
      s3(r) {
        if (turn(r, '87s3', 2) === 0) {
          const lam = r.pick(['0.01', '0.02', '0.05', '0.1', '0.2', '0.25', '0.5', '0.3', '0.07']), A = agree(F.div(D('0.693'), D(lam)), Math.LN2 / +lam, 1);
          if (A == null || lam === '0.04' || !cap(r, '87s3', A)) return null;
          return { q: `でこぼこが $e^{-${lam}t}$ で小さくなる。半分になる時間（$\\ln2=0.693$、小数第1位まで）＝ 約 $□\\,\\mathrm{s}$`, a: `$${A}$`, key: `87h|${lam}`,
            easy: `$\\frac{0.693}{${lam}}\\approx${A}$`, easyCheck: false,
            verify: p => near(num1(p.a), Math.round(10 * Math.LN2 / +lam) / 10, 1e-9) || 'ほんとうの値を丸めた値とちがう' };
        }
        const n = r.pick([2, 3, 4, 5, 10]), A = String(n * n); if (!cap(r, '87s3', A)) return null;
        return { q: `でこぼこを${n}倍細かく（$\\sin ax$ を $\\sin${n}ax$ に）すると、$\\lambda$ は何倍か`, a: `$${A}$`, key: `87n|${n}`,
          easy: `$\\lambda=\\alpha a^2$ は $a^2$ に比例`, easyCheck: false,
          verify: p => near(num1(p.a), (1e-4 * (n * 20) ** 2) / (1e-4 * 20 ** 2), 1e-12) || '$\\lambda$ の比とちがう' };
      },
      // わな：波の速さ（8-89）
      trap(r) {
        const a = r.pick([2, 3, 4, 5]), c = r.pick([100, 200, 300, 50]), b = a * c, sg = r.chance(0.5) ? '-' : '+';
        return dest({ q: `$y=\\sin(${a}x${sg}${b}t)$ の波の速さ ＝ $□\\,\\mathrm{m/s}$`, a: `$${c}$`, key: `87t|${a}|${b}`,
          verify: p => near(num1(p.a) * a, b, 1e-12) || '$c=\\frac ba$ とちがう' }, '8-87', '熱方程式ではなく波（$\\sin$ の中に $t$）。$c=\\frac{b}{a}$', ['8-89']);
      },
    },
  });

  // ================================================================ 8-88 波の表計算（s=1）：次＝右（今）＋左（今）－自分（1つ前）
  const waveNext = (prev, now) => now.map((v, i) => (i === 0 || i === now.length - 1 ? 0 : now[i + 1] + now[i - 1] - prev[i]));
  // 確かめ：s を残した式 y^{n+1}=2y−y_prev+s²(y_{i+1}−2y+y_{i−1}) に s=1
  const waveGen = (prev, now, s) => now.map((v, i) => (i === 0 || i === now.length - 1 ? 0 : 2 * v - prev[i] + s * s * (now[i + 1] - 2 * v + now[i - 1])));
  const ex88 = (pv, nw) => pv.join() === '0,1,3,1,0,0,0' && nw.join() === '0,0,1,3,1,0,0';
  function gen88(r) {
    for (let k = 0; k < 40; k++) {
      const kind = r.int(0, 2);
      let pv, nw;
      if (kind < 2) {   // 走る山（右か左へ）
        const sh = r.pick([[1, 2, 1], [1, 3, 1], [2, 4, 2], [1, 2, 2, 1], [2, 3, 1], [1, 4, 2]]), st = r.int(1, 7 - sh.length - 2), dir = kind === 0 ? 1 : -1;
        pv = Array(7).fill(0); nw = Array(7).fill(0);
        const s0 = dir === 1 ? st : st + 1; sh.forEach((v, j) => { pv[s0 + j] = v; nw[s0 + dir + j] = v; });
        if (pv[0] || pv[6] || nw[0] || nw[6]) continue;
        // 例（右へ進む 1・3・1 の山）と同じ形（右へ進む左右対称の3つの山）で、高さ・場所だけちがう組をよける（R2-19・Z-2）
        if (dir === 1 && sh.length === 3 && sh[0] === sh[2]) continue;
      } else { pv = [0, 0, 0, 0, 0, 0, 0].map((v, i) => (i && i < 6 ? r.int(0, 3) : 0)); nw = [0, 0, 0, 0, 0, 0, 0].map((v, i) => (i && i < 6 ? r.int(0, 3) : 0)); }
      if (ex88(pv, nw) || pv.every(v => !v)) continue;
      const nx = waveNext(pv, nw); if (nx.some(v => v < 0 || v > 9)) continue;
      return { pv, nw, nx };
    }
    return null;
  }
  const row88 = (pv, nw) => `1つ前 ${pv.join('、')}、今 ${nw.join('、')}`;
  M.add({
    id: '8-88', part: 6, chap: '8-13⑧ 例題5', stars: 1,
    title: '波の表計算（$s=1$）：次＝右どなり（今）＋左どなり（今）－自分（1つ前）',
    mark: '弦の玉のずれの表。「1つ前」と「今」から「次」。',
    futsu: ['玉ごとに力と加速度を出し、', '速度と位置を1歩ずつ進める'],
    raku: ['1つ前 0、1、3、1、0、0、0', '今　 0、0、1、3、1、0、0', '→ 次の玉2〜6は 0、0、1、3、1', '（山が右へ1マス）'],
    why: '$y_i^{\\,n+1}=2y_i^{\\,n}-y_i^{\\,n-1}+s^2\\bigl(y_{i+1}^{\\,n}-2y_i^{\\,n}+y_{i-1}^{\\,n}\\bigr)$（8-13⑧）。$s=1$ なら $2y_i^{\\,n}$ が消える。',
    caution: 'ひくのは自分の「1つ前」。手をはなした1歩めは、0歩めのとなり2つの平均。$s=1$ は $\\Delta t=\\frac{\\Delta x}{c}$。',
    counts: { s1: 5, s2: 2, s3: 1, trap: 2 },
    cols: 1,
    boxw: { s1: '12mm', s2: '30mm', s3: '12mm', trap: '16mm' },
    fits(q, p) { return /玉/.test(q) && /(ずれ|1つ前|波の表計算|手をはなす)/.test(q) || /s=1/.test(q) && /波の表計算/.test(q); },
    steps: {
      s1(r) {
        const g = gen88(r), i = r.int(1, 5); if (!g || !once(r, `88|${g.pv}|${g.nw}`)) return null;
        const a = String(g.nx[i]); if (!cap(r, '88s1', a)) return null;
        return { q: `波の表計算（$s=1$）：玉1〜7のずれが ${row88(g.pv, g.nw)}。次の玉${i + 1} ＝ □`, a: `$${a}$`, key: `88|${g.pv}|${g.nw}|${i}`,
          easy: `$${g.nw[i + 1]}+${g.nw[i - 1]}-${g.pv[i]}=${a}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), waveGen(g.pv, g.nw, 1)[i], 1e-12) || '$s$ を残した式で計算した値とちがう' };
      },
      // 玉2〜6を全部・手をはなした1歩め・s=1 の Δt
      s2(r) {
        const kind = turn(r, '88s2', 3);
        if (kind === 0) {
          const g = gen88(r); if (!g || !once(r, `88|${g.pv}|${g.nw}`)) return null;
          const a = g.nx.slice(1, 6).join('、');
          return { q: `波の表計算（$s=1$）：玉1〜7のずれが ${row88(g.pv, g.nw)}。次の玉2〜6（玉1・7は0）`, a, key: `88a|${g.pv}|${g.nw}`,
            easy: '右どなり（今）＋左どなり（今）－自分（1つ前）', easyCheck: false,
            verify: p => p.a === waveGen(g.pv, g.nw, 1).slice(1, 6).join('、') || '$s$ を残した式で計算した値とちがう' };
        }
        if (kind === 1) {
          const sh = r.pick([[2, 4, 2], [2, 6, 2], [4, 8, 4], [2, 4, 6, 4, 2], [4, 6, 4]]), st = r.int(1, 6 - sh.length), y0 = Array(7).fill(0); sh.forEach((v, j) => { y0[st + j] = v; });
          const i = r.int(1, 5), y1 = y0.map((v, k) => (k === 0 || k === 6 ? 0 : (y0[k - 1] + y0[k + 1]) / 2)), a = fmt(y1[i]);
          if (!cap(r, '88s2', a)) return null;
          return { q: `弦を玉1〜7が ${y0.join('、')} の形にして、そっと手をはなす（$s=1$）。1歩めの玉${i + 1} ＝ □`, a: `$${a}$`, key: `88r|${y0}|${i}`,
            easy: `0歩めのとなり2つの平均：$\\frac{${y0[i - 1]}+${y0[i + 1]}}{2}$`, easyCheck: false,
            verify: p => near(num1(p.a), y0[i] + (y0[i + 1] - 2 * y0[i] + y0[i - 1]) / 2, 1e-9) || '1歩め（1歩前を1歩めと同じとした式）の値とちがう' };   // y^{-1}=y^1 とおいた波の式から
        }
        const c = r.pick([100, 200, 340, 50, 400, 250]), dx = r.pick([0.01, 0.02, 0.05, 0.017, 0.1]), dt = dx / c, a = sciT(+dt.toPrecision(6));
        if (!/^\d(\.\d)?\\times10\^\{-\d\}$/.test(a) || (c === 100 && dx === 0.01) || !cap(r, '88s2', a)) return null;
        return { q: `波の速さ ${U(c, 'm/s')}、$\\Delta x=${dx}\\,\\mathrm{m}$ で、$s=1$ の波の表計算にする $\\Delta t$ ＝ $□\\,\\mathrm{s}$`, a: `$${a}$`, key: `88d|${c}|${dx}`,
          easy: `$s=\\frac{c\\Delta t}{\\Delta x}=1$ から $\\Delta t=\\frac{${dx}}{${c}}$`, easyCheck: false,
          verify: p => near(c * num1(p.a) / dx, 1, 1e-9) || '$s$ が1にならない' };
      },
      // 見かけがちがう：表の □
      s3(r) {
        const g = gen88(r), i = r.int(1, 5); if (!g || !once(r, `88|${g.pv}|${g.nw}`)) return null;
        const a = String(g.nx[i]); if (!cap(r, '88s3', a)) return null;
        const nxRow = g.nx.map((v, j) => (j === i ? '□' : j < i || j === 6 ? String(v) : ''));   // 玉7は0のままなので書く（Z-10）
        return { q: '波の表計算（$s=1$。玉1・7は0のまま）の表の □', a: `$${a}$`, key: `88t|${g.pv}|${g.nw}|${i}`,
          table: { head: ['玉', '1', '2', '3', '4', '5', '6', '7'], rows: [['1つ前'].concat(g.pv.map(String)), ['今'].concat(g.nw.map(String)), ['次'].concat(nxRow)] },
          easy: `$${g.nw[i + 1]}+${g.nw[i - 1]}-${g.pv[i]}=${a}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), waveGen(g.pv, g.nw, 1)[i], 1e-12) || '$s$ を残した式で計算した値とちがう' };
      },
      // わな：熱の表計算（8-85）
      trap(r) {
        const g = gen85(r, 4); if (!g || g.r === 0.5) return null;
        return dest({ q: `熱の表計算（$r=${g.r}$）：左から ${g.T[0]}（左はし）、${tl(g.T.slice(1))}（℃）。次の時刻の2番め ＝ □℃`, a: `$${fmt(g.nx[1])}$`, key: `88t|${g.r}|${g.T}`,
          verify: p => near(num1(p.a), step85(g.T, g.r, 1), 1e-9) || '1歩の値とちがう' }, '8-88', '波ではなく熱。1つ前の行は使わない', ['8-85']);
      },
    },
  });

  // ================================================================ 8-89 波動方程式の速さ c=b/a、x−ct は右へ
  const BAN89 = new Set(['200', '300']);
  // 確かめ：波動方程式に入れて c² を出す（中心差分）。y(x, t) の関数
  const waveC2 = (y, x, t, cs) => { const h = 1e-4, k = 1e-4 / (cs || 100); const ytt = (y(x, t + k) - 2 * y(x, t) + y(x, t - k)) / (k * k), yxx = (y(x + h, t) - 2 * y(x, t) + y(x - h, t)) / (h * h); return ytt / yxx; };
  const DIR = ['右', '左'];
  M.add({
    id: '8-89', part: 6, chap: '8-13⑨⑩ 例題6', stars: 1,
    title: '波動方程式の速さ：$\\sin(ax-bt)$ なら $c=\\frac ba$。$x-ct$ は右へ、$x+ct$ は左へ',
    mark: '波動方程式と $y=\\sin(\\square x\\pm\\square t)$。「波の速さ」「どちら向き」。',
    futsu: ['$t$・$x$ で2回ずつ偏微分して', '代入し、$c^2$ から $c$ を出す'],
    raku: ['$\\sin(3x-600t)$ → $\\frac{600}{3}=200$、右へ', '$2\\sin(4x+1200t)$ → 300、左へ'],
    why: '$f(x-ct)$ は、$t$ で2回微分すると $c^2f\'\'$、$x$ で2回は $f\'\'$ で、波動方程式をみたす（8-13⑨）。$ax-bt=a\\bigl(x-\\frac bat\\bigr)$。',
    caution: '方程式の係数は $c^2$（400 なら $c=20$）。前の数（大きさ）は速さに関係しない。',
    counts: { s1: 8, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '14mm', s3: '16mm', trap: '20mm' },
    fits(q) { return /波/.test(q) && /(\\sin\(|\\cos\(|x[-+]\d+t|\\partial\^2y)/.test(q) && !/熱方程式|表計算/.test(q) || /弦/.test(q) && /張力/.test(q); },
    steps: {
      s1(r) {
        const a = r.pick([1, 2, 3, 4, 5, 6, 10]), c = r.pick([20, 30, 40, 50, 60, 80, 100, 150, 250, 340, 400, 500]), sg = r.chance(0.5) ? '-' : '+', A = r.pick([1, 1, 2, 3, 5]), b = a * c;
        if (!cap(r, '89s1', String(c))) return null;
        const fn = r.chance(0.7) ? '\\sin' : '\\cos';
        return { q: `$y=${A === 1 ? '' : A}${fn}(${a === 1 ? '' : a}x${sg}${b}t)$ の波の速さ ＝ $□\\,\\mathrm{m/s}$`, a: `$${c}$`, key: `89|${a}|${b}`,
          easy: `$c=\\frac{${b}}{${a}}=${c}$`, easyCheck: 'last',
          verify: p => { const y = (x, t) => A * Math[fn === '\\sin' ? 'sin' : 'cos'](a * x + (sg === '-' ? -1 : 1) * b * t); return near(num1(p.a) ** 2, waveC2(y, 0.3 / a, 0.0001, num1(p.a)), 1e-3) || '代入して出した $c^2$ とちがう'; } };
      },
      // 向き（回す）・波動方程式の係数から
      s2(r) {
        if (turn(r, '89s2', 3) < 2) {
          const right = peek(r, '89dir', 2) === 0, c = r.pick([20, 40, 50, 80, 100, 120, 250]), a = r.pick([1, 2, 3, 5]), kind = r.int(0, 2);
          const sg = right ? '-' : '+', ft = kind === 0 ? `\\sin(${a === 1 ? '' : a}x${sg}${a * c}t)` : kind === 1 ? `(x${sg}${c}t)^2` : `e^{-(x${sg}${c}t)^2}`;
          const y = kind === 0 ? (x, t) => Math.sin(a * x + (right ? -1 : 1) * a * c * t) : kind === 1 ? (x, t) => (x + (right ? -1 : 1) * c * t) ** 2 : (x, t) => Math.exp(-((x + (right ? -1 : 1) * c * t) ** 2));
          if (!cap(r, '89s2c', right ? '右' : '左')) return null; adv(r, '89dir', 2);
          return { q: `波 $y=${ft}$ が走る向き（右・左）`, a: right ? '右' : '左', key: `89d|${ft}`,
            easy: `$x${sg}${c}t$ の形${right ? '（$-$ なら右へ）' : '（$+$ なら左へ）'}`, easyCheck: false,
            verify: p => { const y0 = 0.37; let best = null; for (const d of [1, -1]) { const t = 1e-3, x1 = y0 + d * c * t; if (Math.abs(y(x1, t) - y(y0, 0)) < 1e-9) best = d; } return p.a === (best === 1 ? '右' : '左') || '山の動いた向きとちがう'; } };
        }
        const c = r.pick([10, 20, 30, 50, 60, 70, 150, 400]), K = c * c; if (!cap(r, '89s2', String(c))) return null;
        return { q: `波動方程式 $\\frac{\\partial^2y}{\\partial t^2}=${K}\\frac{\\partial^2y}{\\partial x^2}$ の波の速さ ＝ $□\\,\\mathrm{m/s}$`, a: `$${c}$`, key: `89k|${K}`,
          easy: `$c^2=${K}$ なので $c=${c}$`, easyCheck: false,
          verify: p => near(waveC2((x, t) => Math.sin(x - num1(p.a) * t), 0.4, 0.0001, c), K, 1e-3) || '$\\sin(x-ct)$ を入れると係数がちがう' };
      },
      // 見かけがちがう：弦の張力と線密度・速さから時間の係数
      s3(r) {
        if (turn(r, '89s3', 2) === 0) {
          const [Fv, mu] = r.pick([[100, '0.01'], [90, '0.001'], [64, '0.01'], [160, '0.001'], [40, '0.004'], [250, '0.01'], [36, '0.01'], [81, '0.001'], [200, '0.002']]), c = Math.sqrt(Fv / +mu);
          const a = fmt(c); if (!Number.isInteger(c) || (Fv === 100 && mu === '0.01') || !cap(r, '89s3', a)) return null;
          return { q: `張力 ${U(Fv, 'N')}、1 m あたりの質量 ${U(mu, 'kg/m')} の弦の波の速さ $\\sqrt{\\frac{F}{\\mu}}$ ＝ $□\\,\\mathrm{m/s}$`, a: `$${a}$`, key: `89f|${Fv}|${mu}`,
            easy: `$\\sqrt{\\frac{${Fv}}{${mu}}}=\\sqrt{${fmt(Fv / +mu)}}$`, easyCheck: false,
            verify: p => near(num1(p.a) ** 2 * +mu, Fv, 1e-9) || '$c^2\\mu$ が張力にならない' };
        }
        const c = r.pick([50, 100, 150, 340, 400]), a = r.pick([2, 3, 4, 5]), right = r.chance(0.5), b = a * c; if (!cap(r, '89s3', String(b))) return null;
        return { q: `速さ ${U(c, 'm/s')} で${right ? '右' : '左'}へ走る波 $y=\\sin(${a}x${right ? '-' : '+'}bt)$ の $b$`, a: `$${b}$`, key: `89b|${c}|${a}|${right}`,
          easy: `$c=\\frac ba$ から $b=${a}\\times${c}$`, easyCheck: false,
          verify: p => near(Math.sqrt(waveC2((x, t) => Math.sin(a * x - num1(p.a) * t), 0.3, 0.0001, c)), c, 1e-3) || 'その $b$ では速さがちがう' };
      },
      // わな：熱方程式（8-87）
      trap(r) {
        const a = r.pick([10, 20, 30, 50]), lam = F.mul(D('0.0001'), fr(a * a)), C = r.pick([5, 10]);
        if (a === 30) return null;   // 8-87 の問題と同じ組をよける
        return dest({ q: `$T=${C}${eT(fx(lam))}\\sin${a}x$ が熱方程式をみたす棒の $\\alpha$ ＝ $□\\,\\mathrm{m^2/s}$`, a: '$1.0\\times10^{-4}$', key: `89t|${a}`,
          verify: p => heatOK(C, F.val(lam), num1(p.a), a) || '代入すると左辺と右辺がちがう' }, '8-89', '波ではなく熱（$t$ は $e$ の肩）。$\\lambda=\\alpha a^2$', ['8-87']);
      },
    },
  });

  // ================================================================ 8-90 物質微分：その場の変化＋速さ×場所による変化
  const sgn = v => (v > 0 ? '+' : '') + fmt(v);
  const BAN90 = new Set(['-3.4']);
  // 確かめ：温度計を流れにのせて、T(x(t), t) の差で時間の変化を出す
  const ride = (Tt, Tx, vkmh) => { const T = (x, t) => Tt * t + Tx * x, h = 1e-4; return (T(vkmh * h, h) - T(-vkmh * h, -h)) / (2 * h); };
  M.add({
    id: '8-90', part: 6, chap: '8-13⑪ 例題8', stars: 1,
    title: '流れにのって見た変化は「その場の変化＋速さ×場所による変化」',
    mark: '川・風にのった温度計。「その場では1時間に □℃」「1 km 下流で □℃ 高い」。',
    futsu: ['温度計の場所を時刻ごとに', '書き出し、その場所の温度を', '表にしてくらべる'],
    raku: ['3 m/s $=10.8$ km/h', '1 km 下流へ 0.5℃ 低い、その場 $+2$', '→ $2+10.8\\times(-0.5)=-3.4$'],
    why: '流れにのった温度計の温度を、連鎖律（8-3）で時間で微分すると $\\frac{\\mathrm DT}{\\mathrm Dt}=\\frac{\\partial T}{\\partial t}+v\\frac{\\partial T}{\\partial x}$（8-13⑪）。',
    caution: '単位をそろえる（1 m/s＝3.6 km/h）。下流ほど低いなら $\\frac{\\partial T}{\\partial x}$ は負。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '18mm', trap: '18mm' },
    fits(q) { return /(流れにのった|風にのった|葉|いっしょに動)/.test(q) || /ノズル/.test(q) && /加速度/.test(q); },
    steps: {
      s1(r) {
        const v = r.pick([1, 2, 3, 0.5, 1.5, 2.5]), gx = r.pick([0.5, 0.2, 0.1, 1, -0.5, -0.2, -0.1, -1]), Tt = r.pick([1, 2, 3, 0.5, -1, -2, -0.5]);
        const vk = F.mul(D(v), D('3.6')), A = F.add(D(Tt), F.mul(vk, D(gx))); if (decLen(A) > 2) return null;
        // 例（3 m/s、$+2$、0.5℃ 低い）の符号を変えただけの組もよける（R2-20・Z-2）
        const a = fx(A); if (BAN90.has(a) || (v === 3 && Math.abs(gx) === 0.5) || !cap(r, '90s1', a)) return null;
        return { q: `川が下流へ ${U(v, 'm/s')}。どの場所でも水温は1時間に ${fmt(Math.abs(Tt))}℃ ${Tt > 0 ? '上がり' : '下がり'}、1 km 下流ほど ${fmt(Math.abs(gx))}℃ ${gx > 0 ? '高い' : '低い'}。流れにのった温度計の変わる速さ ＝ □℃/h（上がるとき正）`, a: `$${a}$`, key: `90|${v}|${gx}|${Tt}`,
          easy: `$${fmt(v)}\\,\\mathrm{m/s}=${fx(vk)}\\,\\mathrm{km/h}$、$${sgn(Tt).replace('+', '')}+${fx(vk)}\\times${fxs(D(gx))}=${a}$`, easyCheck: false,
          verify: p => near(num1(p.a), ride(Tt, gx, v * 3.6), 1e-6) || '温度計をのせて動かした変化とちがう' };
      },
      // 風（km/h・100 km あたり）・その場で変わらない・その場の変化を逆に
      s2(r) {
        const kind = turn(r, '90s2', 3);
        if (kind < 2) {
          const v = r.pick([10, 18, 20, 36, 30, 40, 50]), per = r.pick([100, 50, 10]), dT = r.pick([1, 2, 3, 5]) * (r.chance(0.5) ? 1 : -1), Tt = kind === 1 ? 0 : r.pick([0.5, 1, -0.5, -1, 0.2]);
          const gx = F.div(fr(dT), fr(per)), A = F.add(D(Tt), F.mul(fr(v), gx)); if (decLen(A) > 2) return null;
          const a = fx(A); if (!cap(r, '90s2', a)) return null;
          return { q: `風が東へ $${v}\\,\\mathrm{km/h}$。${kind === 1 ? 'どの場所でも気温は時間で変わらず' : `どの場所でも気温は1時間に ${fmt(Math.abs(Tt))}℃ ${Tt > 0 ? '上がり' : '下がり'}`}、${per} km 東ほど ${Math.abs(dT)}℃ ${dT > 0 ? '高い' : '低い'}。風にのった空気の変わる速さ ＝ □℃/h（上がるとき正）`, a: `$${a}$`, key: `90w|${v}|${per}|${dT}|${Tt}`,
            easy: `$\\frac{\\partial T}{\\partial x}=${fx(gx)}$℃/km、$${fmt(Tt)}+${v}\\times${fxs(gx)}=${a}$`, easyCheck: false,
            verify: p => near(num1(p.a), ride(Tt, F.val(gx), v), 1e-6) || '空気にのせて動かした変化とちがう' };
        }
        const v = r.pick([1, 2, 0.5, 2.5]), gx = r.pick([0.5, 0.2, -0.5, -0.2, 1]), DT = r.pick([1, 2, -1, -2, 0.5, 3]);
        const vk = F.mul(D(v), D('3.6')), A = F.sub(D(DT), F.mul(vk, D(gx))); if (decLen(A) > 2) return null;
        const a = fx(A); if (!cap(r, '90s2', a)) return null;
        return { q: `川が下流へ ${U(v, 'm/s')}、1 km 下流ほど水温が ${fmt(Math.abs(gx))}℃ ${gx > 0 ? '高い' : '低い'}。流れにのった温度計は1時間に ${fmt(Math.abs(DT))}℃ ${DT > 0 ? '上がった' : '下がった'}。止めた温度計の変わる速さ ＝ □℃/h（上がるとき正）`, a: `$${a}$`, key: `90i|${v}|${gx}|${DT}`,
          easy: `$\\frac{\\partial T}{\\partial t}=${fmt(DT)}-${fx(vk)}\\times${fxs(D(gx))}$`, easyCheck: false,
          verify: p => near(ride(num1(p.a), gx, v * 3.6), DT, 1e-6) || 'その値では、のせた温度計の変化がもどらない' };
      },
      // 見かけがちがう：ノズルの水のつぶの加速度
      s3(r) {
        const v0 = r.pick([1, 2, 0.5, 3]), k = r.pick([5, 10, 20, 4, 2]), x = r.pick([0.1, 0.2, 0.05, 0.5]);
        if (v0 === 1 && k === 10 && x === 0.1) return null;   // 教科書の例
        const A = F.mul(F.add(D(v0), F.mul(fr(k), D(x))), fr(k)); if (decLen(A) > 2) return null;
        const a = fx(A); if (!cap(r, '90s3', a)) return null;
        return { q: `ノズルの水の速さ $v=${fmt(v0)}+${k}x$〔$\\mathrm{m/s}$〕（$x$ は入口からの距離〔$\\mathrm{m}$〕。時間では変わらない）。$x=${fmt(x)}\\,\\mathrm{m}$ の水のつぶの加速度 ＝ $□\\,\\mathrm{m/s^2}$`, a: `$${a}$`, key: `90n|${v0}|${k}|${x}`,
          easy: `$0+v\\frac{\\partial v}{\\partial x}=${fmt(v0 + k * x)}\\times${k}$`, easyCheck: false,
          verify: p => { let X = x, V = v0 + k * x; const h = 1e-6, X2 = X + V * h, V2 = v0 + k * X2; return near(num1(p.a), (V2 - V) / h, 1e-4) || 'つぶを少し動かして出した加速度とちがう'; } };
      },
      // わな：熱の流れ（8-28）
      trap(r) {
        const T0 = r.pick([20, 40, 60, 80]), b = r.pick([20, 50, 100, 30]), k = r.pick([16, 1.6, 0.6, 200]), A = F.mul(D(k), fr(b)); if (decLen(A) > 1) return null;
        return dest({ q: `棒の温度 $T=${T0}-${b}x$〔℃〕（$x$ は m。時間で変わらない）、熱伝導率 $k=${fmt(k)}\\,\\mathrm{W/(m\\cdot K)}$。熱の流れ $q$ ＝ $□\\,\\mathrm{W/m^2}$`, a: `$${fx(A)}$`, key: `90t|${T0}|${b}|${k}`,
          verify: p => near(num1(p.a), -k * (-b), 1e-9) || '$q=-k\\frac{\\dd T}{\\dd x}$ とちがう' }, '8-90', '流れにのって見た変化ではなく、熱の流れ。$q=-k\\frac{\\dd T}{\\dd x}$', ['8-28']);
      },
    },
  });

  // ================================================================ 8-96 くつひもの式（ふちの道で面積）
  const cross = (P, Q) => P[0] * Q[1] - Q[0] * P[1];
  const shoe2 = ps => ps.reduce((s, P, k) => s + cross(P, ps[(k + 1) % ps.length]), 0);   // 2倍の面積（左回りなら正）
  const ptT = P => `(${P[0]},\\ ${P[1]})`;
  // 左回りの多角形（凸）を作る：角の向きで並べる
  function poly96(r, n, lo, hi) {
    for (let k = 0; k < 60; k++) {
      const ps = Array.from({ length: n }, () => [r.int(lo, hi), r.int(lo, hi)]);
      const c = [ps.reduce((s, P) => s + P[0], 0) / n, ps.reduce((s, P) => s + P[1], 0) / n];
      ps.sort((P, Q) => Math.atan2(P[1] - c[1], P[0] - c[0]) - Math.atan2(Q[1] - c[1], Q[0] - c[0]));
      if (new Set(ps.map(String)).size < n) continue;
      let convex = true; for (let j = 0; j < n; j++) { const A = ps[j], B = ps[(j + 1) % n], C = ps[(j + 2) % n]; if (cross([B[0] - A[0], B[1] - A[1]], [C[0] - B[0], C[1] - B[1]]) <= 0) convex = false; }
      if (!convex) continue;
      const st = r.int(0, n - 1); return ps.slice(st).concat(ps.slice(0, st));
    }
    return null;
  }
  const areaLine = ps => lineOf({ path: ps.concat([ps[0]]) }, (x, y) => [-y / 2, x / 2]);   // ½∮(x dy − y dx) を数で
  M.add({
    id: '8-96', part: 6, chap: '8-11⑪ 例題11', stars: 1,
    title: 'くつひもの式：多角形の面積は $\\frac12\\sum(x_1y_2-x_2y_1)$',
    mark: '多角形の頂点の座標（左回りの順）。「面積を、ふちの道で」。',
    futsu: ['長方形でかこみ、まわりの', '直角三角形をひく'],
    raku: ['$(0,\\ 0)$、$(6,\\ 0)$、$(2,\\ 4)$', '→ $\\frac12(0+24+0)=12$'],
    why: '回転が1の場のグリーンの定理から $A=\\frac12\\oint_C(x\\,\\dd y-y\\,\\dd x)$（8-11⑪）。辺1本の分は $x_1y_2-x_2y_1$。',
    caution: '最後の点から最初の点への辺も入れる。右回りの順だと符号が負になる。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '14mm', s3: '18mm', trap: '20mm' },
    fits(q) { return /(くつひも|面積)/.test(q) && /頂点|座標|x\\,\\dd y/.test(q) && !/重心/.test(q); },
    steps: {
      s1(r) {
        const ps = poly96(r, 3, -2, 6); if (!ps) return null;
        const S2 = shoe2(ps), a = fmt(S2 / 2); if (S2 < 6 || a === "12" || !cap(r, "96s1", a)) return null;
        return { q: `頂点 ${ps.map(P => `$${ptT(P)}$`).join('、')}（左回り）の三角形の面積（くつひもの式）`, a: `$${a}$`, key: `96|${ps.slice().sort()}`,
          easy: `$\\frac12\\{${ps.map((P, k) => { const c = cross(P, ps[(k + 1) % 3]); return c < 0 ? `(${c})` : String(c); }).join("+")}\\}=${a}$`, easyCheck: false,
          verify: p => near(num1(p.a), areaLine(ps), 1e-9) || 'ふちの道の線積分とちがう' };
      },
      // 四角形・五角形、右回りの順
      s2(r) {
        const n = r.pick([4, 4, 5]), ps0 = poly96(r, n, -1, 6); if (!ps0) return null;
        const cw = turn(r, '96s2', 3) === 2, ps = cw ? ps0.slice().reverse() : ps0, S2 = shoe2(ps0), a = fmt(S2 / 2); if (!cap(r, '96s2', a)) return null;
        return { q: `頂点 ${ps.map(P => `$${ptT(P)}$`).join('、')}（${cw ? '右回り' : '左回り'}）の${n === 4 ? '四角形' : '五角形'}の面積`, a: `$${a}$`, key: `96|${ps0.slice().sort()}`,
          easy: cw ? `左回りに並べかえてくつひもの式（そのままだと $${fmt(-S2 / 2)}$）` : `$\\frac12\\times${S2}=${a}$`, easyCheck: false,
          verify: p => near(num1(p.a), areaLine(ps0), 1e-9) || 'ふちの道の線積分とちがう' };
      },
      // 見かけがちがう：土地の測量・だ円
      s3(r) {
        if (turn(r, '96s3', 2) === 0) {
          const ps = poly96(r, 4, 0, 9); if (!ps) return null;
          const m = r.pick([10, 5, 20]), P = ps.map(Q => [Q[0] * m, Q[1] * m]), a = fmt(shoe2(P) / 2); if (!cap(r, '96s3', a)) return null;
          return { q: `土地の角の座標（東 $x$・北 $y$、m）が左回りに ${P.map(Q => `$${ptT(Q)}$`).join('、')}。土地の面積 ＝ $□\\,\\mathrm{m^2}$`, a: `$${a}$`, key: `96m|${P}`,
            easy: `くつひもの式（座標法）：$\\frac12\\times${shoe2(P)}$`, easyCheck: false,
            verify: p => near(num1(p.a), areaLine(P), 1e-9) || 'ふちの道の線積分とちがう' };
        }
        const A = r.pick([2, 3, 4, 5, 6]), B = r.pick([1, 2, 3, 5].filter(v => v !== A)); if ((A === 3 && B === 2) || (A === 4 && B === 1)) return null;
        const a = piT(fr(A * B)); if (!cap(r, '96s3', a)) return null;
        return { q: `だ円 $x=${A}\\cos t$、$y=${B === 1 ? '' : B}\\sin t$ の面積を $\\frac12\\oint_C(x\\,\\dd y-y\\,\\dd x)$ で`, a: `$${a}$`, key: `96e|${A}|${B}`,
          easy: `$x\\,\\dd y-y\\,\\dd x=${A * B}\\,\\dd t$、$\\frac12\\times${A * B}\\times2\\pi$`, easyCheck: false,
          verify: p => near(ev(strip(p.a)), lineOf({ rf: t => [A * Math.cos(t), B * Math.sin(t)] }, (x, y) => [-y / 2, x / 2]), 1e-8) || 'ふちの道の線積分とちがう' };
      },
      // わな：三角形の重心（8-39）
      trap(r) {
        const a = r.pick([3, 6, 9, 12]), b = r.pick([3, 6, 9]); if (a === 9 && b === 6) return null;
        return dest({ q: `頂点 $(0,\\ 0)$、$(${a},\\ 0)$、$(0,\\ ${b})$ の、厚さが一定の三角形の板の重心`, a: `$(${a / 3},\\ ${b / 3})$`, key: `96t|${a}|${b}`,
          verify: p => { const v = M.readVec(p.a).map(Number), gx = simp(x => x * (b - b * x / a), 0, a, 40) / (a * b / 2), gy = simp(x => (b - b * x / a) ** 2 / 2, 0, a, 40) / (a * b / 2); return (near(v[0], gx, 1e-9) && near(v[1], gy, 1e-9)) || '積分で出した重心とちがう'; } }, '8-96', '面積ではなく重心。3つの頂点の平均', ['8-39']);
      },
    },
  });

  // ================================================================ 8-97 穴をかこむ道、かこまない道
  const holeF = c => (x, y) => [-c * y / (x * x + y * y), c * x / (x * x + y * y)];
  const holeT = c => (c === 1 ? '\\frac{(-y,\\ x)}{x^2+y^2}' : `${c}\\times\\frac{(-y,\\ x)}{x^2+y^2}`);
  // 道：中心 (a, b)・半径 R の円、中心 (a, b)・1辺 L の正方形
  function path97(r, enc) {
    for (let k = 0; k < 30; k++) {
      if (r.chance(0.5)) {
        const R = r.pick([1, 2, 3, 4]), a = enc ? r.pick([0, 0, 1, -1]) : r.pick([0, 3, 4, 5, -4, 6]), b = enc ? r.pick([0, 0, 1]) : r.pick([0, 3, 4, 5, -3]);
        const d = Math.hypot(a, b); if (enc ? d >= R - 0.3 : d <= R + 0.3) continue;
        if (a === 0 && b === 5 && R === 2) continue;   // 楽な形の例
        return { t: a === 0 && b === 0 ? `原点が中心の半径 $${R}$ の円` : `中心 $(${a},\\ ${b})$・半径 $${R}$ の円`, rf: t => [a + R * Math.cos(t), b + R * Math.sin(t)], key: `c${a},${b},${R}` };
      }
      const L = r.pick([2, 4, 6]), h = L / 2, a = enc ? r.pick([0, 0, 1, -1].filter(v => Math.abs(v) < h)) : r.pick([3, 4, 5, -4, 6]), b = enc ? r.pick([0, 0]) : r.pick([0, 2, 3, -3, 4]);
      if (enc ? (Math.abs(a) >= h || Math.abs(b) >= h) : (Math.abs(a) <= h + 0.3 && Math.abs(b) <= h + 0.3)) continue;
      if (enc && L === 4 && a === 0 && b === 0) continue;   // 楽な形の例
      const P = [[a - h, b - h], [a + h, b - h], [a + h, b + h], [a - h, b + h], [a - h, b - h]];
      return { t: `正方形 ${P.slice(0, 4).map(Q => `$(${Q[0]},\\ ${Q[1]})$`).join('、')}`, path: P, key: `s${a},${b},${L}`, name: '正方形', pts: P.slice(0, 4) };
    }
    return null;
  }
  M.add({
    id: '8-97', part: 6, chap: '8-11⑫ 例題12', stars: 1,
    title: '穴のある場 $\\frac{(-y,\\ x)}{x^2+y^2}$ の1周：原点をかこめば $2\\pi$、かこまなければ0',
    mark: '$\\vec F=\\frac{(-y,\\ x)}{x^2+y^2}$（原点以外で回転0）を、閉じた道で1周。',
    futsu: ['道を辺（角）で表して、', '定積分してたす'],
    raku: ['1辺 $4$ の正方形（中心が原点）', '→ 原点をかこむ → $2\\pi$', '中心 $(0,\\ 5)$、半径 $2$ の円 → 0'],
    why: '原点は場が決まらない「穴」（8-11⑫）。穴をくりぬくと残りは回転0なので「外の1周＝小さな円の1周＝$2\\pi$」。かこまなければ0。',
    caution: '右回りなら $-2\\pi$。前に数がかかれば、$2\\pi$ もその倍。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '24mm', trap: '16mm' },
    fits(q) { return /x\^2\+y\^2/.test(q) && /1周/.test(q); },
    steps: {
      s1(r) {
        const enc = turn(r, '97s1', 3) < 2, c = r.pick(enc ? [2, 3, 4, 5, 1] : [1, 2, 3, 4]), P = path97(r, enc); if (!P || !once(r, '97p|' + P.key)) return null;
        const a = enc ? piT(fr(2 * c)) : '0'; if (!cap(r, '97s1', a, enc ? 1 : 2)) return null;   // かこむ道で同じ答え（大きさだけちがう道）を重ねない（Z-2）
        return { q: `$\\vec F=${holeT(c)}$ で、${P.t}を左回りに1周`, a: `$${a}$`, key: `97|${c}|${P.key}`,
          easy: enc ? `原点をかこむ：小さな円と同じ $${c === 1 ? '' : c + '\\times'}2\\pi$` : '原点をかこまない：中の回転は0', easyCheck: false,
          verify: p => near(ev(strip(p.a)), lineOf(P, holeF(c)), 1e-6) || '道を1周してたした値とちがう' };
      },
      // 右回り・三角形の道（原点が中か外か）
      s2(r) {
        const cw = turn(r, '97s2', 2) === 0, enc = turn(r, '97s2e', 3) < 2, c = r.pick([1, 2, 3, 4, 6]);
        let P;
        if (r.chance(0.5)) P = path97(r, enc);
        else {
          for (let k = 0; k < 30 && !P; k++) {
            const T = [[r.int(-4, 4), r.int(-4, -1)], [r.int(1, 5), r.int(-3, 4)], [r.int(-5, 0), r.int(1, 5)]];
            if (!enc) T.forEach(Q => { Q[0] += 7; });
            const s2 = shoe2(T); if (s2 <= 0) continue;
            const inside = [0, 1, 2].every(j => cross([T[(j + 1) % 3][0] - T[j][0], T[(j + 1) % 3][1] - T[j][1]], [-T[j][0], -T[j][1]]) > 0);
            const onEdge = [0, 1, 2].some(j => { const e = [T[(j + 1) % 3][0] - T[j][0], T[(j + 1) % 3][1] - T[j][1]]; return Math.abs(cross(e, [-T[j][0], -T[j][1]])) / Math.hypot(...e) < 0.6; });   // 原点から辺まで 0.6 以上（穴の近くを通らない）
            if (inside !== enc || onEdge) continue;
            P = { t: `三角形 ${T.map(Q => `$${ptT(Q)}$`).join('、')}`, path: T.concat([T[0]]), key: `t${T}`, name: '三角形', pts: T };
          }
        }
        if (!P || !once(r, '97p|' + P.key)) return null;
        const A = fr((cw ? -2 : 2) * (enc ? c : 0)), a = enc ? piT(A) : '0'; if (!cap(r, '97s2', a)) return null;
        // 頂点は、たどる順に書く（右回りなら逆の順。8-96 とそろえる。R2-23・Z-9）
        const pt = P.pts ? `${P.name} ${(cw ? P.pts.slice().reverse() : P.pts).map(Q => `$${ptT(Q)}$`).join('、')}` : P.t;
        return { q: `$\\vec F=${holeT(c)}$ で、${pt}を${cw ? '右回り' : '左回り'}に1周`, a: `$${a}$`, key: `97|${c}|${P.key}|${cw}`,
          easy: enc ? `原点をかこむ${cw ? '。右回りなので符号が逆' : ''}` : '原点をかこまないので0', easyCheck: false,
          verify: p => near(ev(strip(p.a)), lineOf(P, holeF(c), cw), 1e-6) || '道を1周してたした値とちがう' };
      },
      // 見かけがちがう：導線の磁場・うずなし流れ
      s3(r) {
        const tv = turn(r, '97s3', 4), enc = tv < 2;   // 4問で、かこむ・かこまない × 磁場・流れ
        if (tv % 2 === 0) {
          const I = r.pick([2, 5, 10, 20, 3]), P = path97(r, enc); if (!P || !once(r, '97p|' + P.key)) return null;
          const a = enc ? sciT(4 * I * 1e-7).replace(/^/, '').replace(/\\times/, '\\pi\\times') : '0'; if (!cap(r, '97s3', a)) return null;
          return { q: `$z$ 軸の導線（${U(I, 'A')}）の磁場 $\\vec B=2\\times10^{-7}\\times${I}\\times\\frac{(-y,\\ x)}{x^2+y^2}$ で、${P.t}を左回りに1周する $\\oint_C\\vec B\\cdot\\dd\\vec r$ ＝ $□\\,\\mathrm{T\\cdot m}$`, a: `$${a}$`, key: `97b|${I}|${P.key}`,
            easy: enc ? `導線をかこむ：$2\\times10^{-7}\\times${I}\\times2\\pi=\\mu_0I$` : '導線をかこまないので0', easyCheck: false,
            verify: p => near(ev(strip(p.a)), lineOf(P, holeF(2e-7 * I)), 1e-6) || '道を1周してたした値とちがう' };
        }
        const k = r.pick([1, 2, 3, 0.5]), P = path97(r, enc); if (!P || !once(r, '97p|' + P.key)) return null;
        const a = enc ? piT(F.mul(fr(2), D(k)), true) : '0'; if (!cap(r, '97s3', a)) return null;
        return { q: `うずなし流れ $\\vec v=${k === 1 ? "" : fmt(k) + "\\times"}\\frac{(-y,\\ x)}{x^2+y^2}$ で、${P.t}を左回りに1周する循環`, a: `$${a}$`, key: `97v|${k}|${P.key}`,
          easy: enc ? '中心をかこむ：小さな円の1周と同じ' : '中心をかこまないので0', easyCheck: false,
          verify: p => near(ev(strip(p.a)), lineOf(P, holeF(k)), 1e-6) || '道を1周してたした値とちがう' };
      },
      // わな：穴のない (−cy, cx)（8-79）
      trap(r) {
        const c = r.pick([1, 2, 3]), a = r.pick([3, 4, 5]), R = r.pick([1, 2]), A = fr(2 * c * R * R), P = { rf: t => [a + R * Math.cos(t), R * Math.sin(t)] };
        return dest({ q: `$\\vec F=(-${c === 1 ? '' : c}y,\\ ${c === 1 ? '' : c}x)$ で、中心 $(${a},\\ 0)$・半径 $${R}$ の円を左回りに1周`, a: `$${piT(A)}$`, key: `97t|${c}|${a}|${R}`,
          verify: p => near(ev(strip(p.a)), lineOf(P, (x, y) => [-c * y, c * x]), 1e-6) || '道を1周してたした値とちがう' }, '8-97', '分母のない場で、穴はない。原点をかこまなくても0にならない。回転×面積', ['8-79']);
      },
    },
  });

  // ================================================================ 8-98 変わる磁場のまわりの電場
  const BAN98 = new Set(['0.012\\pi', '0.03']);
  // 円の半径は、例と同じ $0.2\,\mathrm m$ を使わない（答えが例の何倍かになる。R2-24・Z-2）
  // 確かめ：磁束 Φ(t)=B(t)×面積 を、面積を数でたして、時間の差で微分する
  const emfOf = (rr, k) => { const area = simp2((s, ph) => s, 0, rr, 0, 2 * Math.PI, 20), Phi = t => (0.5 + k * t) * area, h = 1e-3; return (Phi(1 + h) - Phi(1 - h)) / (2 * h); };
  M.add({
    id: '8-98', part: 6, chap: '8-11⑬ 例題15', stars: 1,
    title: '変わる磁場のまわりの電場：起電力＝面積×$\\frac{\\dd B}{\\dd t}$、電場＝起電力÷$2\\pi r$',
    mark: '円の中の一様な磁場が「1秒に □ T ずつ強くなる」。1周の起電力・円の上の電場。',
    futsu: ['電場の矢印を場所ごとに考え、', '円を1周する線積分をする'],
    raku: ['$r=0.2$、$0.3\\,\\mathrm{T/s}$', '起電力 $\\pi\\times0.04\\times0.3=0.012\\pi$', '$E=\\frac{0.012\\pi}{2\\pi\\times0.2}=0.03$'],
    why: '$\\oint_C\\vec E\\cdot\\dd\\vec r=-\\frac{\\dd\\Phi}{\\dd t}$（8-11⑬）で、起電力＝面積×$\\frac{\\dd B}{\\dd t}$。対称なので $E\\times2\\pi r$＝起電力。',
    caution: '弱くなるときも大きさは同じ。正方形の道でも起電力は面積×$\\frac{\\dd B}{\\dd t}$（電場の大きさは一定でない）。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '18mm', s3: '20mm', trap: '24mm' },
    fits(q) { return /(強くなる|弱くなる|強くなり|T\/s)/.test(q) && /(起電力|電場)/.test(q); },
    steps: {
      s1(r) {
        const rr = r.pick([0.1, 0.05, 0.3, 0.5, 0.4, 0.6]), k = r.pick(['0.1', '0.2', '0.4', '0.5', '0.05', '2', '0.3']), A = F.mul(F.mul(D(rr), D(rr)), D(k)); if (decLen(A) > 3) return null;
        // 同じ半径で、変わる速さだけ何倍かの問題を1つのステップに重ねない（Z-2）
        const a = piT(A, true); if (BAN98.has(a) || !cap(r, '98s1', a, 1) || !cap(r, '98s1r', String(rr), 1)) return null;
        return { q: `半径 ${U(rr, 'm')} の円の中の一様な磁場（面に直角）が1秒に $${k}\\,\\mathrm{T}$ 強くなる。円を1周する起電力 ＝ $□\\,\\mathrm{V}$`, a: `$${a}$`, key: `98|${rr}|${k}`,
          easy: `$\\pi\\times${fmt(rr)}^2\\times${k}=${a}$`, easyCheck: 'last',
          verify: p => near(ev(strip(p.a)), emfOf(rr, +k), 1e-6) || '磁束の変わる速さとちがう' };
      },
      // 円の上の電場・電場から磁場の変わる速さを
      s2(r) {
        const rr = r.pick([0.1, 0.05, 0.3, 0.5, 0.4, 0.6]), k = r.pick(['0.1', '0.2', '0.4', '0.5', '0.05', '2', '0.3', '0.6']), E = F.div(F.mul(D(rr), D(k)), fr(2)); if (decLen(E) > 4) return null;
        if (!cap(r, '98s2r', String(rr), 1)) return null;   // 同じ半径の問題を1つのステップに重ねない（Z-2）
        if (turn(r, '98s2', 3) < 2) {
          const a = fx(E); if (BAN98.has(a) || (rr === 0.2 && k === '0.3') || !cap(r, '98s2', a)) return null;
          return { q: `半径 ${U(rr, 'm')} の円の中の一様な磁場（面に直角）が1秒に $${k}\\,\\mathrm{T}$ ${r.chance(0.3) ? '弱く' : '強く'}なる。円の上の電場の大きさ ＝ $□\\,\\mathrm{V/m}$`, a: `$${a}$`, key: `98e|${rr}|${k}`,
            easy: `$E\\times2\\pi\\times${fmt(rr)}=\\pi\\times${fmt(rr)}^2\\times${k}$`, easyCheck: false,
            verify: p => near(num1(p.a) * 2 * Math.PI * rr, emfOf(rr, +k), 1e-6) || '$E\\times2\\pi r$ が起電力にならない' };
        }
        if (!cap(r, '98s2', k)) return null;
        return { q: `半径 ${U(rr, 'm')} の円の中の一様な磁場（面に直角）が一定の速さで強くなり、円の上の電場が $${fx(E)}\\,\\mathrm{V/m}$。磁場は1秒に何 T 強くなるか`, a: `$${k}$`, key: `98k|${rr}|${k}`,
          easy: `$${fx(E)}\\times2\\pi\\times${fmt(rr)}=\\pi\\times${fmt(rr)}^2\\times\\frac{\\dd B}{\\dd t}$`, easyCheck: false,
          verify: p => near(F.val(E) * 2 * Math.PI * rr, emfOf(rr, num1(p.a)), 1e-6) || 'その速さでは電場がもどらない' };
      },
      // 見かけがちがう：正方形の道・約の値（π=3.14）
      s3(r) {
        if (turn(r, '98s3', 2) === 0) {
          const L = r.pick([0.1, 0.2, 0.3, 0.05, 0.5]), k = r.pick(['0.1', '0.2', '0.5', '2', '0.4']), A = F.mul(F.mul(D(L), D(L)), D(k)); if (decLen(A) > 4) return null;
          const a = fx(A); if (!cap(r, '98s3', a)) return null;
          return { q: `1辺 ${U(L, 'm')} の正方形の道の中の一様な磁場（面に直角）が1秒に $${k}\\,\\mathrm{T}$ 強くなる。道を1周する起電力 ＝ $□\\,\\mathrm{V}$`, a: `$${a}$`, key: `98s|${L}|${k}`,
            easy: `面積×$\\frac{\\dd B}{\\dd t}$：$${fmt(L)}^2\\times${k}$`, easyCheck: false,
            verify: p => near(num1(p.a), simp2(() => 1, 0, L, 0, L, 8) * +k, 1e-9) || '面積×磁場の変わる速さ とちがう' };
        }
        const rr = r.pick([0.1, 0.5, 0.3, 0.4]), k = r.pick(['0.1', '0.2', '0.5', '0.4', '2']), A = F.mul(F.mul(F.mul(D(rr), D(rr)), D(k)), D('3.14'));
        const tv = Math.PI * rr * rr * +k, nd = decLen(A) > 4 ? null : Math.min(4, decLen(A)); if (nd == null) return null;
        const a = agree(A, tv, nd); if (a == null || !cap(r, '98s3', a)) return null;
        return { q: `半径 ${U(rr, 'm')} の円の中の一様な磁場（面に直角）が1秒に $${k}\\,\\mathrm{T}$ 強くなる。円を1周する起電力（$\\pi=3.14$、小数第${nd}位まで）＝ 約 $□\\,\\mathrm{V}$`, a: `$${a}$`, key: `98p|${rr}|${k}`,
          easy: `$3.14\\times${fmt(rr)}^2\\times${k}\\approx${a}$`, easyCheck: false,
          verify: p => near(num1(p.a), +trueRd(tv, nd), 1e-9) || 'ほんとうの値を丸めた値とちがう' };
      },
      // わな：変わらない電流のまわりの磁場（8-77）
      trap(r) {
        const I = r.pick([2, 5, 10, 20]), rr = r.pick([0.02, 0.05, 0.1]), B = 2e-7 * I / rr, a = sciT(B); if (!/^\d(\.\d)?\\times10\^\{-\d\}$/.test(a) || !cap(r, '98t', String(I), 1)) return null;   // 同じ電流で距離だけちがうわなを重ねない
        return dest({ q: `まっすぐな導線に変わらない電流 ${U(I, 'A')}。導線から ${U(rr, 'm')} の磁場の大きさ（${MUt}）＝ $□\\,\\mathrm{T}$`, a: `$${a}$`, key: `98t|${I}|${rr}`,
          verify: p => near(num1(p.a) * 2 * Math.PI * rr, 4 * Math.PI * 1e-7 * I, 1e-9) || '円の道の式とちがう' }, '8-98', '磁場は変わらないので電場のうずはない。円の道でアンペールの法則', ['8-77', '8-74']);
      },
    },
  });

  // ================================================================ 8-99 浮力は ρgV
  const RG = '水（$\\rho=1000\\,\\mathrm{kg/m^3}$、$g=9.8\\,\\mathrm{m/s^2}$）';   // 定数の単位も書く（Z-8）
  // 確かめ：上と下の面を押す力の差（圧力 ρg×深さ。横の面は打ち消す）を、深さを変えて面ごとにたす
  const buoyBox = (a, b, c, rho) => { const d = 0.7; return rho * 9.8 * (d + c) * a * b - rho * 9.8 * d * a * b; };
  const buoySph = (R, rho) => simp(z => rho * 9.8 * Math.PI * (R * R - z * z), -R, R, 200);   // 薄い円板ごとの ρgV
  M.add({
    id: '8-99', part: 6, chap: '8-11⑬（もっと）例題9', stars: 1,
    title: '浮力は $\\rho gV$（圧力の面の積分をしない）',
    mark: '水にしずんだ物（立方体・球・円柱）にかかる浮力。',
    futsu: ['面をタイルに分け、', '圧力×面積を面の積分でたす'],
    raku: ['1辺 0.1 m の立方体', '→ $1000\\times9.8\\times0.001$', '$=9.8\\,\\mathrm N$（上向き）'],
    why: '$\\oiint_S p\\,\\vec n\\,\\dd S=\\iiint_V\\mathrm{grad}\\,p\\,\\dd V$ と $\\mathrm{grad}\\,p=\\rho\\vec g$ から、浮力は上向きに $\\rho gV$（8-11 もっと）。形によらない。',
    caution: '$V$ は水の中にある部分の体積。深さには関係しない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '22mm', s3: '20mm', trap: '22mm' },
    fits(q) { return /浮力|うく|浮いて|見かけの重さ|押す力の差/.test(q); },
    steps: {
      s1(r) {
        const cube = r.chance(0.5), d = [r.pick([0.1, 0.2, 0.3, 0.05, 0.5])]; if (!cube) d.push(r.pick([0.1, 0.2, 0.5]), r.pick([0.1, 0.2, 0.4]));
        const [a, b, c] = cube ? [d[0], d[0], d[0]] : d, V = F.mul(F.mul(D(a), D(b)), D(c)), A = F.mul(fr(9800), V); if (decLen(A) > 3) return null;
        const v = fx(A); if (v === '9.8' || !cap(r, '99s1', v)) return null;
        return { q: `${RG}にしずんだ${cube ? `1辺 ${U(a, 'm')} の立方体` : `たて・横・高さが ${fmt(a)}・${fmt(b)}・${U(c, 'm')} の箱`}の浮力 ＝ $□\\,\\mathrm{N}$`, a: `$${v}$`, key: `99|${[a, b, c].sort()}`,
          easy: `$1000\\times9.8\\times${fx(V)}=${v}$`, easyCheck: 'last',
          verify: p => near(num1(p.a), buoyBox(a, b, c, 1000), 1e-9) || '上と下の面を押す力の差とちがう' };
      },
      // 球・円柱（π を残す）・上と下の面の力の差
      s2(r) {
        const kind = turn(r, '99s2', 3);
        if (kind === 0) {
          const R = r.pick([0.3, 0.15, 0.6, 0.45, 0.75]), A = F.mul(F.mul(fr(9800 * 4, 3), D(R)), F.mul(D(R), D(R))); if (decLen(A) > 2) return null;
          const a = piT(A, true); if (!cap(r, '99s2', a)) return null;
          return { q: `${RG}にしずんだ半径 ${U(R, 'm')} の球の浮力（$\\pi$ を残す）＝ $□\\,\\mathrm{N}$`, a: `$${a}$`, key: `99s|${R}`,
            easy: `$1000\\times9.8\\times\\frac43\\pi\\times${fmt(R)}^3$`, easyCheck: false,
            verify: p => near(ev(strip(p.a)), buoySph(R, 1000), 1e-6) || 'うすい円板に分けてたした値とちがう' };
        }
        if (kind === 1) {
          const R = r.pick([0.1, 0.2, 0.05]), h = r.pick([0.5, 0.2, 1, 0.4]), A = F.mul(fr(9800), F.mul(F.mul(D(R), D(R)), D(h))); if (decLen(A) > 3) return null;
          const a = piT(A, true); if (!cap(r, '99s2', a)) return null;
          return { q: `${RG}にしずんだ半径 ${U(R, 'm')}・長さ ${U(h, 'm')} の円柱の浮力（$\\pi$ を残す）＝ $□\\,\\mathrm{N}$`, a: `$${a}$`, key: `99c|${R}|${h}`,
            easy: `$9800\\times\\pi\\times${fmt(R)}^2\\times${fmt(h)}$`, easyCheck: false,
            verify: p => near(ev(strip(p.a)), simp(z => 9800 * Math.PI * R * R, 0, h, 8), 1e-9) || 'うすい円板に分けてたした値とちがう' };
        }
        const L = r.pick([0.1, 0.2, 0.3]), dep = r.pick([0.5, 1, 2, 0.3]), A = F.mul(fr(9800), F.mul(F.mul(D(L), D(L)), D(L))); if (decLen(A) > 3 || L === 0.1) return null;
        const a = fx(A); if (!cap(r, '99s2', a)) return null;
        return { q: `${RG}で、1辺 ${U(L, 'm')} の立方体の上の面が深さ ${U(dep, 'm')}。下の面を押す力と上の面を押す力の差 ＝ $□\\,\\mathrm{N}$`, a: `$${a}$`, key: `99d|${L}|${dep}`,
          easy: `深さによらず $\\rho gV=9800\\times${fmt(L)}^3$`, easyCheck: false,
          verify: p => near(num1(p.a), 9800 * (dep + L) * L * L - 9800 * dep * L * L, 1e-9) || '2つの面の力の差とちがう' };
      },
      // 見かけがちがう：海水・浮いている物・水の中での見かけの重さ
      s3(r) {
        const kind = turn(r, '99s3', 3);
        if (kind === 0) {
          const V = r.pick(['0.01', '0.02', '0.05', '0.1', '0.2', '0.5']), A = F.mul(F.mul(fr(1030), D('9.8')), D(V)); if (decLen(A) > 2) return null;
          const a = fx(A); if (!cap(r, '99s3', a)) return null;
          return { q: `海水（$\\rho=1030\\,\\mathrm{kg/m^3}$、$g=9.8\\,\\mathrm{m/s^2}$）にしずんだ体積 $${V}\\,\\mathrm{m^3}$ の物の浮力 ＝ $□\\,\\mathrm{N}$`, a: `$${a}$`, key: `99w|${V}`,
            easy: `$1030\\times9.8\\times${V}$`, easyCheck: false, verify: p => near(num1(p.a), buoyBox(+V, 1, 1, 1030), 1e-9) || '上と下の面を押す力の差とちがう' };
        }
        if (kind === 1) {
          const m = r.pick([2, 5, 8, 12, 30, 0.5]), A = F.div(fr(m), fr(1000)), a = fx(A); if (!cap(r, '99s3', a)) return null;
          return { q: `質量 ${U(m, 'kg')} の木が水（$\\rho=1000\\,\\mathrm{kg/m^3}$）に浮いている。水の中の部分の体積 ＝ $□\\,\\mathrm{m^3}$`, a: `$${a}$`, key: `99f|${m}`,
            easy: `浮力＝重さ：$1000\\times g\\times V=${m}\\times g$`, easyCheck: false,
            verify: p => near(1000 * 9.8 * num1(p.a), m * 9.8, 1e-9) || '浮力と重さがつり合わない' };
        }
        const m = r.pick([3, 5, 10, 8, 20, 30, 12]), L = r.pick([0.1, 0.2]), V = L ** 3, W = F.sub(F.mul(fr(m), D('9.8')), F.mul(fr(9800), F.mul(F.mul(D(L), D(L)), D(L)))); if (decLen(W) > 2 || F.val(W) <= 0) return null;
        const a = fx(W); if (!cap(r, '99s3', a)) return null;
        return { q: `質量 ${U(m, 'kg')}・1辺 ${U(L, 'm')} の立方体の金属を${RG}に全部しずめ、ばねばかりでつるす。見かけの重さ ＝ $□\\,\\mathrm{N}$`, a: `$${a}$`, key: `99a|${m}|${L}`,
          easy: `$${m}\\times9.8-9800\\times${fmt(L)}^3$`, easyCheck: false,
          verify: p => near(num1(p.a) + buoyBox(L, L, L, 1000), m * 9.8, 1e-9) || '力のつり合いがとれない' };
      },
      // わな：上の面だけを押す力（8-15）
      trap(r) {
        const L = r.pick([0.1, 0.2]), dep = r.pick([1, 2, 0.5, 3]), A = F.mul(F.mul(fr(9800), D(dep)), F.mul(D(L), D(L))); if (decLen(A) > 2) return null;
        return dest({ q: `${RG}で、1辺 ${U(L, 'm')} の立方体の上の面が深さ ${U(dep, 'm')}。水が上の面を押す力（大気圧はのぞく）＝ $□\\,\\mathrm{N}$`, a: `$${fx(A)}$`, key: `99t|${L}|${dep}`,
          verify: p => near(num1(p.a), 9800 * dep * L * L, 1e-9) || '圧力×面積とちがう' }, '8-99', '浮力（全体の力）ではなく、1つの面の力。深さの圧力×面積', ['8-15']);
      },
    },
  });

  // ================================================================ 左ページの例と同じ答え・同じ式を、同じ見開きに出さない（O-2・S-2・U-2）
  // わなはほかのわざの問題なので、よけない。答え（p.a）と問題の文（p.q）で見る
  const EXA = {
    '8-75': ['$64\\pi$', '$6$'], '8-76': ['$28\\pi$'], '8-77': ['$100$', '$60$'], '8-79': ['$54$', '$6\\pi$'],
    '8-80': ['$4$', '$-3$'], '8-81': ['$12$', '$2.5$'], '8-82': ['A $18$℃、B $12$℃'], '8-83': ['$40$'],
    '8-84': ['$6$', '$15$'], '8-85': ['$65$', '$42.5$'], '8-86': ['$0.4$', '$0.5$', '$-0.6$', '$-1.4$'],
    '8-87': ['$0.04$', '$25\\ln2$', '$17.3$'], '8-88': ['0、0、1、3、1'], '8-89': ['$200$', '$300$'],
    '8-90': ['$-3.4$'], '8-96': ['$12$'], '8-98': ['$0.012\\pi$', '$0.03$'], '8-99': ['$9.8$'],
  };
  const EXQ = { '8-79': /\(-4y,\\ 2x\)/ };
  Object.keys(EXA).forEach(id => {
    const d = M.waza[id], ban = new Set(EXA[id]);
    ['s1', 's2', 's3'].forEach(s => {
      const f = d.steps[s]; if (!f) return;
      d.steps[s] = r => { const p = f(r); return p && (ban.has(p.a) || (EXQ[id] && EXQ[id].test(p.q))) ? null : p; };
    });
  });

  // ================================================================ 答えの分数は \dfrac（第5部とそろえる。好み）。肩（^{ }）の中の分数はそのまま
  const dfracA = a => { let o = '', dep = [], k = 0; const s = String(a);
    while (k < s.length) {
      if (s.startsWith('^{', k)) { dep.push(1); o += '^{'; k += 2; continue; }
      if (s[k] === '{') { dep.push(0); o += '{'; k++; continue; }
      if (s[k] === '}') { dep.pop(); o += '}'; k++; continue; }
      if (s.startsWith('\\frac', k) && !dep.includes(1)) { o += '\\dfrac'; k += 5; continue; }
      o += s[k]; k++;
    }
    return o; };
  // ================================================================ 見わけようのわなが、見開きのわなと同じ問題にならないように（Z-4。組の側で）
  // 本の見開き（makeSheet）では、同じ r で s3 を作ってから trap を作る。見わけよう・アプリのプリントでは、その r で s3 を作っていない。
  // そのときは、本の見開きのわなと同じ問題（key・文）をよける（makeStep が別の問題を作りなおす）
  const bookTraps = {};
  M.list(8).filter(id => M.waza[id].part === 6).forEach(id => {
    const d = M.waza[id];
    ['s1', 's2', 's3', 'trap'].forEach(s => { const f = d.steps[s]; if (f) d.steps[s] = r => { const p = f(r); if (p && /\\frac/.test(p.a)) p.a = dfracA(p.a); return p; }; });
    const s3 = d.steps.s3, tr = d.steps.trap; if (!s3 || !tr) return;
    const tag = '\u0000s3:' + id;
    d.steps.s3 = r => { r[tag] = true; return s3(r); };
    d.steps.trap = r => {
      const p = tr(r); if (!p || r[tag]) return p;
      const b = bookTraps[id] || (bookTraps[id] = new Set(M.makeSheet(id).trap.flatMap(t => [t.key || t.q, t.q])));
      return b.has(p.key || p.q) || b.has(p.q) ? null : p;
    };
  });

  // ==== END ====
})(globalThis.MONDAI);

/* 問題集 第4巻　第3部 三角比と三角形（わざ 4-32〜4-47、4-94）　組 c
 * 書き方は v4/README.md（第4巻の手引き）と v2/README.md。文はルビなし・常用漢字まで（教科書 第4巻と同じ）。式は $…$。
 * 電卓は使わない（K-4）：角は 0°・30°・45°・60°・90° とその仲間、15°・75° だけ。ほかの値（sin75° など）は問題の文に書く。
 * 答えは √ を残した形（分母は有理化）。約の値を聞くときは、使う値（√2=1.414、√3=1.73）とけたを問題の文に書く（K-3）。
 * 図はステップ3（とわな）だけ（K-2）：4-32（直角三角形）と 4-47（2つの関節のうで）。点の位置は問題の数から計算する。
 * 答えが式1つでないもの（角が2つ・座標・ことば・近似値）は verify で、別の道すじ（座標・つり合いの式など）で確かめる。
 * わなは、そのわざで解けない（楽にならない）問題。easy に行き先を書き、同じ部のわざで解けるものは also に入れる（H-1）。
 * わなの文は、図がなくても解けるように書く（見わけように図なしで出るため）。 */
(function (M) {
  'use strict';
  const PART = 3;

  // ---------------------------------------------------------------- 数
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const lcm = (a, b) => a / gcd(a, b) * b;
  const fmt = v => String(+(+v).toFixed(6));
  const close = (x, y, e) => x != null && y != null && Math.abs(x - y) <= (e || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const ev = t => M.evalMath(strip(t), {});
  const rad = d => d * Math.PI / 180;
  const deg = x => x * 180 / Math.PI;

  // ---------------------------------------------------------------- √ をふくむ数（n/d·√k の和。k は平方の因数なし）
  function sqf(n) { let o = 1, i = n; for (let p = 2; p * p <= i; p++) while (i % (p * p) === 0) { i /= p * p; o *= p; } return [o, i]; }
  function norm(ts) {
    const m = new Map();
    for (const t of ts) {
      if (!t.n) continue;
      const [o, k] = sqf(t.k);
      const [n0, d0] = m.get(k) || [0, 1];
      const N = n0 * t.d + t.n * o * d0, Dn = d0 * t.d, g = gcd(N, Dn);
      m.set(k, [N / g, Dn / g]);
    }
    return [...m].filter(([, f]) => f[0] !== 0).map(([k, f]) => ({ n: f[0], d: f[1], k }));
  }
  const term = d => d === 2 || d === 5 || d === 10;
  const R = {
    q: (n, d = 1) => norm([{ n: d < 0 ? -n : n, d: Math.abs(d), k: 1 }]),
    s: (n, d, k) => norm([{ n, d, k }]),                                   // n/d·√k
    dec: t => { const f = M.F.fromDec(String(t)); return R.q(f[0], f[1]); },
    add: (x, y) => norm([...x, ...y]),
    neg: x => x.map(t => ({ n: -t.n, d: t.d, k: t.k })),
    sub: (x, y) => R.add(x, R.neg(y)),
    mul: (x, y) => norm(x.flatMap(a => y.map(b => ({ n: a.n * b.n, d: a.d * b.d, k: a.k * b.k })))),
    inv: x => {
      if (x.length !== 1) throw new Error('2つの項の式ではわらない');
      const t = x[0];
      return norm([{ n: t.d * Math.sign(t.n), d: Math.abs(t.n) * t.k, k: t.k }]);
    },
    div: (x, y) => R.mul(x, R.inv(y)),
    sqrt: x => {   // 有理数の √（分母は有理化）
      if (!x.length) return [];
      if (x.length > 1 || x[0].k !== 1 || x[0].n < 0) throw new Error('√ の中は正の有理数だけ');
      return norm([{ n: 1, d: x[0].d, k: x[0].n * x[0].d }]);
    },
    val: x => x.reduce((s, t) => s + t.n / t.d * Math.sqrt(t.k), 0),
    isQ: x => x.every(t => t.k === 1),
    // TeX。dec：分母が 2・5 だけなら小数（係数も）。decQ：√ のない数だけ小数
    tex: (x, o) => {
      o = o || {};
      if (!x.length) return '0';
      if (x.length === 1) {
        const { n, d, k } = x[0], sg = n < 0 ? '-' : '', a = Math.abs(n);
        if (k === 1) return d === 1 ? `${n}` : ((o.dec || o.decQ) && term(d)) ? fmt(n / d) : `${sg}\\frac{${a}}{${d}}`;
        const s = `\\sqrt{${k}}`;
        if (d === 1) return sg + (a === 1 ? '' : a) + s;
        if (o.dec && term(d)) return sg + fmt(a / d) + s;
        return `${sg}\\frac{${a === 1 ? '' : a}${s}}{${d}}`;
      }
      // 2つ以上の項：分母をそろえる。正の項を先に、√ のない数を先に、√ は大きい順（\sqrt{6}+\sqrt{2}）
      const Dn = x.reduce((m, t) => lcm(m, t.d), 1);
      const ts = x.map(t => ({ N: t.n * Dn / t.d, k: t.k })).sort((p, q) => ((p.N < 0) - (q.N < 0)) || (p.k === 1 ? -1 : q.k === 1 ? 1 : q.k - p.k));
      let s = '';
      ts.forEach((t, i) => { const a = Math.abs(t.N); s += (t.N < 0 ? '-' : i ? '+' : '') + (t.k === 1 ? `${a}` : `${a === 1 ? '' : a}\\sqrt{${t.k}}`); });
      return Dn === 1 ? s : `\\frac{${s}}{${Dn}}`;
    },
  };
  const tx = (x, o) => R.tex(x, o);
  const rq = (n, d) => R.q(n, d);

  // ---------------------------------------------------------------- 三角比の値（教科書 4-6③⑧）
  const BASE = {
    0: [], 30: R.q(1, 2), 45: R.s(1, 2, 2), 60: R.s(1, 2, 3), 90: R.q(1),
    15: norm([{ n: 1, d: 4, k: 6 }, { n: -1, d: 4, k: 2 }]), 75: norm([{ n: 1, d: 4, k: 6 }, { n: 1, d: 4, k: 2 }]),
  };
  function sinR(t) {
    t = ((t % 360) + 360) % 360;
    if (t > 180) return R.neg(sinR(t - 180));
    if (t > 90) return sinR(180 - t);
    if (!(t in BASE)) throw new Error('この角の値は使わない: ' + t);
    return BASE[t];
  }
  const cosR = t => sinR(t + 90);
  const tanR = t => R.div(sinR(t), cosR(t));
  const TRIG = { sin: sinR, cos: cosR, tan: tanR };
  const TF = { sin: Math.sin, cos: Math.cos, tan: Math.tan };

  // ---------------------------------------------------------------- 文字の部品
  const DG = d => `${d}^{\\circ}`;
  const MR = s => `\\mathrm{${s}}`;
  const UN = (v, u) => `$${v}\\,\\mathrm{${u}}$`;          // 10 kg など
  const TL = 'T_{\\mathrm{L}}', TR = 'T_{\\mathrm{R}}';
  const PT = (x, y, o) => {
    const X = typeof x === 'string' ? x : tx(x, o), Y = typeof y === 'string' ? y : tx(y, o);
    return /frac/.test(X + Y) ? `\\left(${X},\\ ${Y}\\right)` : `(${X},\\ ${Y})`;
  };
  const maths = q => (q.match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  const degsIn = q => [...String(q).matchAll(/(\d+(?:\.\d+)?)\^\{\\circ\}/g)].map(m => +m[1]);

  // ---------------------------------------------------------------- 検算の部品（verify）
  function numOK(a, v, e) {
    const x = ev(a);
    if (x == null) return `答えが読めない（${a}）`;
    return close(x, v, e) || `答え ${a} は ${fmt(v)} のはず`;
  }
  function coordVals(a) {
    const t = strip(a).replace(/\\left|\\right/g, '').trim(), m = /^\((.*)\)$/.exec(t);
    if (!m) return null;
    const ps = m[1].split(',\\ ');
    return ps.length === 2 ? ps.map(s => M.evalMath(s, {})) : null;
  }
  function ptOK(a, x, y, e) {
    const v = coordVals(a);
    if (!v || v.some(z => z == null)) return `座標が読めない（${a}）`;
    return (close(v[0], x, e || 1e-7) && close(v[1], y, e || 1e-7)) || `座標 ${a} は (${fmt(x)}, ${fmt(y)}) のはず`;
  }
  // 角の答え（「$60^{\circ}$、$120^{\circ}$」）が、さがした角の組と同じか
  function degsOK(a, want) {
    const got = degsIn(a).sort((p, q) => p - q), w = want.slice().sort((p, q) => p - q);
    return (got.length === w.length && got.every((g, i) => Math.abs(g - w[i]) < 1e-9)) || `角の答え ${a} は ${w.join('°、')}° のはず`;
  }
  // 約の値：√2=1.414、√3=1.73 を入れて、小数第 n 位まで（四捨五入）
  const APX = { 1: 1, 2: 1.414, 3: 1.73 };
  const round = (v, n) => { const f = 10 ** n; return (v < 0 ? -1 : 1) * Math.round(Math.abs(v) * f + 1e-6) / f; };
  function apx(x, n) {
    let v = 0;
    for (const t of x) { if (!(t.k in APX)) throw new Error('約の値がない √' + t.k); v += t.n / t.d * APX[t.k]; }
    return round(v, n).toFixed(n);
  }
  // 約の値の答えが、ほんとうの値に近いか（けたの半分と、使った値 1.73 などのずれまで）
  function apxOK(a, v, n) {
    const x = ev(a);
    if (x == null) return `答えが読めない（${a}）`;
    if (strip(a).split('.')[1] && strip(a).split('.')[1].length !== n) return `けたがちがう（${a}）`;
    return Math.abs(x - v) <= 0.5 * 10 ** -n + Math.abs(v) * 0.0016 + 1e-9 || `約の値 ${a} が ${fmt(v)} から遠い`;
  }
  // 点 V の角（P-V-Q）
  function angAt(P, V, Q) {
    let d = Math.abs(Math.atan2(P[1] - V[1], P[0] - V[0]) - Math.atan2(Q[1] - V[1], Q[0] - V[0]));
    if (d > Math.PI) d = 2 * Math.PI - d;
    return d;
  }
  const dist = (P, Q) => Math.hypot(P[0] - Q[0], P[1] - Q[1]);
  // 2本の半直線の交わり：P から x 軸と角 a、Q から角 b（度）の向きにのばす
  function meet(P, a, Q, b) {
    const d1 = [Math.cos(rad(a)), Math.sin(rad(a))], d2 = [Math.cos(rad(b)), Math.sin(rad(b))];
    const det = -d1[0] * d2[1] + d2[0] * d1[1], rx = Q[0] - P[0], ry = Q[1] - P[1], t = (-rx * d2[1] + ry * d2[0]) / det;
    return [P[0] + t * d1[0], P[1] + t * d1[1]];
  }
  // 角 A・B の三角形を座標で作る：P=(0,0)（角 A）、Q=(1,0)（角 B）、S は2本の半直線の交わり。oP は P の向かいの辺
  function triAng(A, B) { const P = [0, 0], Q = [1, 0], S = meet(P, A, Q, 180 - B); return { P, Q, S, oP: dist(Q, S), oQ: dist(P, S), oS: 1, angS: deg(angAt(P, S, Q)) }; }
  // 3辺 a（BC）、b（CA）、c（AB）の三角形を座標に置く：C=(0,0)、B=(a,0)、A は2つの円の交わり
  function triPts(a, b, c) {
    const x = (a * a + b * b - c * c) / (2 * a), y = Math.sqrt(Math.max(0, b * b - x * x));
    return { A: [x, y], B: [a, 0], C: [0, 0] };
  }

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 直角三角形の文：「直角三角形ABC（Cが直角）、$\mathrm{AB}=8$、$A=30^{\circ}$：$\mathrm{BC}$」
  function rtParse(q) {
    const m = /直角三角形([A-Z]{3})（([A-Z])が直角）/.exec(q);
    if (!m) return null;
    const ms = maths(q), sides = {}, angs = {};
    for (const t of ms.slice(0, -1)) {
      let k;
      if ((k = /^\\mathrm\{([A-Z]{2})\}=(.+)$/.exec(t))) sides[k[1]] = k[2];
      else if ((k = /^([A-Z])=(\d+)\^\{\\circ\}$/.exec(t))) angs[k[1]] = +k[2];
    }
    const asked = ms[ms.length - 1] || '', Z = m[2];
    const isHyp = s => !s.includes(Z);
    const askSide = (/^\\mathrm\{([A-Z]{2})\}$/.exec(asked) || [])[1];
    return { Z, sides, angs, asked, isHyp, askSide, askTrig: /^\\(sin|cos|tan) [A-Z]$/.test(asked), na: Object.keys(angs).length, given: Object.keys(sides) };
  }
  // 三角形ABC の文：「三角形ABCで、$a=6$、$b=5$、$C=30^{\circ}$ のとき、…」
  function triParse(q) {
    if (!/三角形ABCで/.test(q) || /直角三角形/.test(q)) return null;
    const sides = {}, angs = {};
    for (const t of maths(q)) {
      let m;
      if ((m = /^([abc])=(.+)$/.exec(t))) sides[m[1]] = m[2];
      else if ((m = /^([ABC])=(\d+)\^\{\\circ\}$/.exec(t))) angs[m[1]] = +m[2];
    }
    return { sides, angs, ns: Object.keys(sides).length, na: Object.keys(angs).length };
  }
  // 2辺と、そのあいだの角（角の文字が、2辺の文字のどちらでもない）
  const between = t => t && t.ns === 2 && t.na === 1 && !Object.keys(t.sides).includes(Object.keys(t.angs)[0].toLowerCase());

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(4).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')}` : ''}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 三角形の数の表
  const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [20, 21, 29], [9, 12, 15], [12, 16, 20], [9, 40, 41]];
  const PRIM = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];
  // 2辺 a、b と、そのあいだの角が 60° か 120° で、向かいの辺 c が整数になる組
  const TRI = { 60: [], 120: [] };
  for (let a = 2; a <= 16; a++) for (let b = a + 1; b <= 16; b++) {
    for (const [t, s] of [[60, -1], [120, 1]]) {
      const c2 = a * a + b * b + s * a * b, c = Math.round(Math.sqrt(c2));
      if (c * c === c2) TRI[t].push([a, b, c]);
    }
  }
  const TRI90 = TRIPLES.filter(t => t[2] <= 20);
  const NAMES = ['ABC', 'DEF', 'PQR'];
  // 直角三角形の名前と、辺の名前（三角形の名前の順：BC、AC、AB）
  function rtName(r, fixed) {
    const name = fixed ? 'ABC' : r.pick(NAMES);
    const Z = fixed ? 'C' : r.pick(name.split(''));
    const [X, Y] = name.split('').filter(c => c !== Z);
    const side = (u, v) => [u, v].sort((p, q) => name.indexOf(p) - name.indexOf(q)).join('');
    return { name, Z, X, Y, side };
  }
  const rtQ = (n, givens, ask) => `直角三角形${n.name}（${n.Z}が直角）、${givens.map(g => `$${g}$`).join('、')}：$${ask}$`;
  // 直角三角形を座標に：角 X が原点、直角 Z が (adj, 0)、Y が (adj, opp)。X の角の三角比を数で
  const rtTrig = (opp, adj) => { const X = [0, 0], Zp = [adj, 0], Yp = [adj, opp], th = angAt(Zp, X, Yp), h = dist(X, Yp); return { th, h, sin: dist(Yp, Zp) / h, cos: dist(X, Zp) / h, tan: dist(Yp, Zp) / dist(X, Zp) }; };

  // ---------------------------------------------------------------- 図の部品
  // 辺 PQ の長さのラベル：辺のまん中から、三角形の外へ少し出す
  function sideLabel(P, Q, G, t, off) {
    const m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], L = dist(P, Q);
    let n = [-(Q[1] - P[1]) / L, (Q[0] - P[0]) / L];
    if (n[0] * (m[0] - G[0]) + n[1] * (m[1] - G[1]) < 0) n = [-n[0], -n[1]];
    const o = off || 0.7;
    return ['label', [m[0] + n[0] * o, m[1] + n[1] * o], t, 'c'];
  }
  const centroid = ps => [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
  // 4-32 の図：直角三角形。opp・adj は θ から見た対辺・隣辺。rot（度）で回し、flip で左右を反対に
  function rtFig(opp, adj, hyp, show, rot, flip) {
    const k = 3.8 / Math.max(opp, adj), c = Math.cos(rad(rot)), s = Math.sin(rad(rot));
    const tr = ([x, y]) => { x = flip ? -x : x; return [x * c - y * s, x * s + y * c]; };
    const T = tr([0, 0]), V = tr([adj * k, 0]), U = tr([adj * k, opp * k]), G = centroid([T, V, U]);
    const items = [['poly', [T, V, U]], ['right', T, V, U, 0.45], ['angle', V, T, U, '$\\theta$', 0.6]];
    if (show.adj) items.push(sideLabel(T, V, G, String(adj)));
    if (show.opp) items.push(sideLabel(V, U, G, String(opp)));
    if (show.hyp) items.push(sideLabel(T, U, G, String(hyp)));
    return { fig: { s: 4.5, pad: 0.45, items }, T, V, U };
  }

  // ================================================================ 4-32
  M.add({
    id: '4-32', part: PART, chap: '4-6②', stars: 1,
    title: '$\\theta$ に目を置いて、向かいの辺・となりの辺',
    mark: '直角三角形で、$\\sin A$・$\\cos B$ のように、**どの角から見た**三角比かを聞かれている。',
    futsu: ['いつも「たて÷ななめ」を $\\sin$ にする。', '三角形の向きが変わったり、', '見る角が変わったりすると、まちがえる。'],
    raku: ['角Aに目を置く：向かいの辺BCが対辺、', 'となりの辺ACが隣辺、直角の向かいABが斜辺', '$\\sin A=\\frac{\\mathrm{BC}}{\\mathrm{AB}}=\\frac{3}{5}$'],
    why: '三角比は「$\\theta$ から見た辺」で決めた比（4-6②）。たて・横は三角形の置き方で変わるが、対辺・隣辺・斜辺は、置き方を変えても変わらない。',
    caution: '$\\theta$ が上にあると、対辺は横になる。角Bから見ると、角Aのときの対辺と隣辺が入れかわる（$\\sin B=\\cos A$）。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: '16mm', boxh: '10mm',
    fits(q) {
      if (/図の直角三角形/.test(q)) return true;
      const t = rtParse(q);
      return !!(t && t.askTrig && !t.na);
    },
    steps: {
      // Cが直角、3辺がわかっている。角Aか角Bの sin・cos・tan
      s1(r) {
        const [p, q0, h] = r.pick(TRIPLES), sw = r.chance(0.5), BC = sw ? q0 : p, AC = sw ? p : q0;
        const X = r.pick(['A', 'B']), f = r.pick(['sin', 'cos', 'tan']);
        const opp = X === 'A' ? BC : AC, adj = X === 'A' ? AC : BC, oN = X === 'A' ? 'BC' : 'AC', aN = X === 'A' ? 'AC' : 'BC';
        const [nN, nV, dN, dV] = f === 'sin' ? [oN, opp, 'AB', h] : f === 'cos' ? [aN, adj, 'AB', h] : [oN, opp, aN, adj];
        const v = rq(nV, dV), a = `$${tx(v)}$`;
        return {
          q: `直角三角形ABC（Cが直角）、$\\mathrm{BC}=${BC}$、$\\mathrm{AC}=${AC}$、$\\mathrm{AB}=${h}$：$\\${f} ${X}$`,
          a, easy: `角${X}から見る：$\\frac{${MR(nN)}}{${MR(dN)}}=\\frac{${nV}}{${dV}}${tx(v) === `\\frac{${nV}}{${dV}}` ? '' : `=${tx(v)}`}$`, easyCheck: 'last',
          verify: () => numOK(a, rtTrig(opp, adj)[f]),
        };
      },
      // 名前と直角の頂点を変え、2辺だけ（のこりの辺は三平方の定理で）
      s2(r) {
        const n = rtName(r), [o, d, h] = r.pick(TRIPLES), f = r.pick(['sin', 'cos', 'tan']);
        // 角 X から見て：対辺 YZ＝o、隣辺 XZ＝d、斜辺 XY＝h
        const S = { opp: [n.side(n.Y, n.Z), o], adj: [n.side(n.X, n.Z), d], hyp: [n.side(n.X, n.Y), h] };
        const hide = r.pick(['opp', 'adj', 'hyp']);
        const giv = ['opp', 'adj', 'hyp'].filter(k => k !== hide).map(k => `${MR(S[k][0])}=${S[k][1]}`);
        const v = f === 'sin' ? rq(o, h) : f === 'cos' ? rq(d, h) : rq(o, d), a = `$${tx(v)}$`;
        const third = hide === 'hyp' ? `\\sqrt{${o}^{2}+${d}^{2}}=${h}` : `\\sqrt{${h}^{2}-${hide === 'opp' ? d : o}^{2}}=${S[hide][1]}`;
        return {
          q: rtQ(n, r.shuffle(giv), `\\${f} ${n.X}`), a,
          easy: `$${MR(S[hide][0])}=${third}$、角${n.X}から見て $${tx(v)}$`, easyCheck: 'last',
          verify: () => numOK(a, rtTrig(o, d)[f]),
        };
      },
      // 図：向きを回したもの、θ が上にあるもの（4-6 のまちがえやすいところ）
      s3(r) {
        const [o0, d0, h] = r.pick([[3, 4, 5], [6, 8, 10], [9, 12, 15], [8, 15, 17]]);
        const sw = r.chance(0.5), opp = sw ? d0 : o0, adj = sw ? o0 : d0;
        const rot = r.pick([90, 90, 180, 270, 270]), flip = r.chance(0.5), f = r.pick(['sin', 'cos', 'tan']);
        const hide = r.pick(['none', 'none', 'opp', 'adj', 'hyp']);
        const F = rtFig(opp, adj, h, { opp: hide !== 'opp', adj: hide !== 'adj', hyp: hide !== 'hyp' }, rot, flip);
        const v = f === 'sin' ? rq(opp, h) : f === 'cos' ? rq(adj, h) : rq(opp, adj), a = `$${tx(v)}$`;
        const N = { opp: '対辺', adj: '隣辺', hyp: '斜辺' };
        const used = f === 'sin' ? ['opp', 'hyp'] : f === 'cos' ? ['adj', 'hyp'] : ['opp', 'adj'];
        return {
          q: `図の直角三角形で、$\\${f}\\theta$`, a, fig: F.fig, key: `f${opp},${adj},${rot},${flip},${f},${hide}`,
          easy: `$\\theta$ から見て${N[used[0]]} ${{ opp, adj, hyp: h }[used[0]]}、${N[used[1]]} ${{ opp, adj, hyp: h }[used[1]]}${used.includes(hide) ? `（${N[hide]}は三平方の定理で）` : ''}：$${tx(v)}$`,
          easyCheck: 'last',
          // 図の点から、角と辺を計算し直す
          verify: () => {
            const th = angAt(F.V, F.T, F.U), k = dist(F.T, F.V) / adj;
            if (!close(dist(F.T, F.U) / k, h, 1e-6) || !close(dist(F.V, F.U) / k, opp, 1e-6)) return '図の辺の長さが数と合わない';
            return numOK(a, TF[f](th));
          },
        };
      },
      // わな：直角のない二等辺三角形（垂線を下ろして直角三角形を作ってから）
      trap(r) {
        const [m, hh, L] = r.pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [8, 15, 17]]);
        const f = r.pick(['sin', 'cos', 'tan']), v = f === 'sin' ? rq(hh, L) : f === 'cos' ? rq(m, L) : rq(hh, m), a = `$${tx(v)}$`;
        // 図は出さない（右ページに入らないため。文だけで解ける）
        const p = {
          q: `三角形ABCで、$\\mathrm{AB}=\\mathrm{AC}=${L}$、$\\mathrm{BC}=${2 * m}$ のとき、$\\${f} B$`, a,
          verify: () => { const P = triPts(2 * m, L, L), th = angAt(P.C, P.B, P.A); return numOK(a, TF[f](th)); },
        };
        return dest(p, '4-32', `直角三角形ではない。Aから辺BCに垂線を下ろして直角三角形を作る。高さは $\\sqrt{${L}^{2}-${m}^{2}}=${hh}$ → $\\${f} B=${tx(v)}$`);
      },
    },
  });

  // ================================================================ 4-33
  const NICE = [30, 45, 60];
  // θ をふくむ式（ステップ3）。値の式（TeX）と、R での値
  const TH_FORMS = [
    { t: '2\\sin\\theta\\cos\\theta', f: (s, c) => R.mul(R.q(2), R.mul(s, c)), e: (s, c) => `2\\times${s}\\times${c}` },
    { t: '\\sin\\theta+\\cos\\theta', f: (s, c) => R.add(s, c), e: (s, c) => `${s}+${c}` },
    { t: '\\frac{\\sin\\theta}{\\cos\\theta}', f: (s, c) => R.div(s, c), e: (s, c) => `${s}\\div${c}` },
    { t: '1-2\\sin^{2}\\theta', f: s => R.sub(R.q(1), R.mul(R.q(2), R.mul(s, s))), e: s => `1-2\\times\\left(${s}\\right)^{2}` },
    { t: '\\cos^{2}\\theta-\\sin^{2}\\theta', f: (s, c) => R.sub(R.mul(c, c), R.mul(s, s)), e: (s, c) => `\\left(${c}\\right)^{2}-\\left(${s}\\right)^{2}` },
    { t: '\\sin\\theta\\tan\\theta', f: (s, c) => R.mul(s, R.div(s, c)), e: (s, c, t) => `${s}\\times${t}` },
  ];
  M.add({
    id: '4-33', part: PART, chap: '4-6③', stars: 1,
    title: '$30^{\\circ}$・$45^{\\circ}$・$60^{\\circ}$ は、三角定規の比から',
    mark: '$30^{\\circ}$・$45^{\\circ}$・$60^{\\circ}$ の $\\sin$・$\\cos$・$\\tan$ の値を使う。',
    futsu: ['値の表を丸ごと覚えておく。', '思い出せないと手が止まり、', '$\\sin$ と $\\cos$ を取りちがえる。'],
    raku: ['三角定規をかく：$1:2:\\sqrt{3}$ と $1:1:\\sqrt{2}$', '$60^{\\circ}$ から見て対辺 $\\sqrt{3}$、斜辺2：$\\sin60^{\\circ}=\\frac{\\sqrt{3}}{2}$', '$\\tan30^{\\circ}=\\frac{1}{\\sqrt{3}}=\\frac{\\sqrt{3}}{3}$'],
    why: '三角比は角だけで決まるので、辺の長さのわかった三角形を1つかけば読める。正三角形の半分（$1:2:\\sqrt{3}$）と、正方形の半分（$1:1:\\sqrt{2}$）がその三角形（4-6③）。',
    caution: '$30^{\\circ}$ と $60^{\\circ}$ は同じ三角形で、見る角によって対辺と隣辺が入れかわる。$\\frac{1}{\\sqrt{2}}$ は分母を有理化して $\\frac{\\sqrt{2}}{2}$ にする。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 2,
    boxw: { s1: '16mm', s2: '18mm', s3: '22mm', trap: '22mm' }, boxh: '10mm',
    fits(q) {
      if (!/\\(sin|cos|tan)/.test(q) || /三角形|斜面|うで|ロープ|合力|面積|傾き/.test(q)) return false;
      const ds = degsIn(q);
      return ds.length > 0 && ds.every(d => NICE.includes(d));
    },
    steps: {
      // 1つの値
      s1(r) {
        const f = r.pick(['sin', 'cos', 'tan']), t = r.pick(NICE), v = TRIG[f](t);
        const tri = t === 45 ? '1:1:\\sqrt{2}' : '1:2:\\sqrt{3}';
        return { q: `$\\${f}${DG(t)}$`, a: `$${tx(v)}$`, easy: `三角定規 $${tri}$ から $${tx(v)}$`, easyCheck: 'last' };
      },
      // 2つの値のたし算・ひき算・かけ算・わり算
      s2(r) {
        const f1 = r.pick(['sin', 'cos', 'tan']), f2 = r.pick(['sin', 'cos', 'tan']), t1 = r.pick(NICE), t2 = r.pick(NICE);
        if (f1 === f2 && t1 === t2) return null;
        const op = r.pick(['+', '-', '\\times', '\\div']);
        const v1 = TRIG[f1](t1), v2 = TRIG[f2](t2);
        const v = op === '+' ? R.add(v1, v2) : op === '-' ? R.sub(v1, v2) : op === '\\times' ? R.mul(v1, v2) : R.div(v1, v2);
        const w = s => (/^\\frac|^-/.test(s) || !/[+-]/.test(s) ? s : `\\left(${s}\\right)`);
        return {
          q: `$\\${f1}${DG(t1)}${op}\\${f2}${DG(t2)}$`, a: `$${tx(v)}$`,
          easy: `$${w(tx(v1))}${op}${w(tx(v2))}=${tx(v)}$`,
        };
      },
      // θ をふくむ式に、θ＝30°・45°・60° を入れる
      s3(r) {
        const F = r.pick(TH_FORMS), t = r.pick(NICE), s = sinR(t), c = cosR(t), v = F.f(s, c);
        return {
          q: `$\\theta=${DG(t)}$ のとき、$${F.t}$`, a: `$${tx(v)}$`,
          easy: `$${F.e(tx(s), tx(c), tx(tanR(t)))}=${tx(v)}$`,
          verify: () => numOK(`$${tx(v)}$`, M.evalMath(F.t.replace(/\\sin\^\{2\}\\theta/g, '(\\sin x )^{2}').replace(/\\cos\^\{2\}\\theta/g, '(\\cos x)^{2}').replace(/\\theta/g, ' x '), { x: rad(t) })),
        };
      },
      // わな：15°・75°（三角定規の角ではない。加法定理で。第4部 4-56）
      trap(r) {
        const f = r.pick(['sin', 'cos']), t = r.pick([15, 75]), v = TRIG[f](t);
        const sp = t === 15 ? '45^{\\circ}-30^{\\circ}' : '45^{\\circ}+30^{\\circ}';
        return dest({ q: `$\\${f}${DG(t)}$`, a: `$${tx(v)}$` }, '4-33',
          `$${DG(t)}$ は三角定規の角ではない。$${DG(t)}=${sp}$ に分けて加法定理を使う：$${tx(v)}$（4部のわざ 4-56）`);
      },
    },
  });

  // ================================================================ 4-34
  // 4-34・4-35・4-36 の、直角三角形の文の見わけ
  function rtKind(q) {
    const t = rtParse(q);
    if (!t || !t.askSide || t.na !== 1 || t.given.length !== 1) return null;
    const g = t.given[0];
    return t.isHyp(g) ? (t.isHyp(t.askSide) ? null : 'hyp→leg') : (t.isHyp(t.askSide) ? 'leg→hyp' : 'leg→leg');
  }
  M.add({
    id: '4-34', part: PART, chap: '4-6②', stars: 1,
    title: '向かいの辺＝斜辺×$\\sin$、となりの辺＝斜辺×$\\cos$',
    mark: '**斜辺**（はしごの長さ・極座標の $r$）と角がわかっていて、たて・横の辺を求める。',
    futsu: ['$\\sin60^{\\circ}=\\frac{h}{4}$ と式を立て、', '両辺に4をかけて $h$ について解く。'],
    raku: ['かけ算の形をそのまま使う', '高さ＝$4\\sin60^{\\circ}=2\\sqrt{3}$', 'かべまで＝$4\\cos60^{\\circ}=2$'],
    why: '$\\sin\\theta$＝対辺÷斜辺 の両辺に斜辺をかけると、対辺＝斜辺×$\\sin\\theta$。斜辺1の三角形（たて $\\sin\\theta$、横 $\\cos\\theta$）を、斜辺の長さの倍にした形（4-6②）。',
    caution: '角が、たての線（かべ）からはかってあるときは、$\\sin$ と $\\cos$ が入れかわる。どの角から見た対辺かを確かめる。',
    counts: { s1: 8, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '30mm', s3: '30mm', trap: '18mm' },
    fits(q) {
      if (rtKind(q) === 'hyp→leg') return true;
      if (/極座標/.test(q)) return true;
      if (/(はしご|うで|坂道)/.test(q) && /地面と|水平と|肩から/.test(q) && !/板の長さ|坂道の長さ/.test(q)) return true;
      if (/(ひも|ロープ)/.test(q) && /引く/.test(q) && /水平/.test(q) && !/斜面|つるす|合力/.test(q)) return true;
      return false;
    },
    steps: {
      // Cが直角、斜辺と角 → 対辺か隣辺
      s1(r) {
        const X = r.pick(['A', 'B']), Y = X === 'A' ? 'B' : 'A', th = r.pick(NICE), h = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
        const opp = r.chance(0.5), f = opp ? 'sin' : 'cos', want = opp ? (Y === 'A' ? 'AC' : 'BC') : (X === 'A' ? 'AC' : 'BC');
        const v = R.mul(rq(h), TRIG[f](th)), a = `$${tx(v)}$`;
        return {
          q: rtQ({ name: 'ABC', Z: 'C' }, [`\\mathrm{AB}=${h}`, `${X}=${DG(th)}`], MR(want)), a,
          easy: `$${h}\\${f}${DG(th)}=${h}\\times${tx(TRIG[f](th))}=${tx(v)}$`,
          verify: () => { const g = rtTrig(Math.sin(rad(th)), Math.cos(rad(th))); return numOK(a, h * (opp ? g.sin : g.cos)); },
        };
      },
      // 極座標 (r, θ) → (x, y)。名前を変えた直角三角形も
      s2(r) {
        if (r.chance(0.55)) {
          const rr = r.pick([2, 4, 6, 8, 10, 3, 5]), th = r.pick(NICE), x = R.mul(rq(rr), cosR(th)), y = R.mul(rq(rr), sinR(th)), a = `$${PT(x, y)}$`;
          return {
            q: `極座標 $(${rr},\\ ${DG(th)})$ の点の $(x,\\ y)$`, a, easyCheck: false,
            easy: `$x=${rr}\\cos${DG(th)}=${tx(x)}$、$y=${rr}\\sin${DG(th)}=${tx(y)}$`,
            verify: () => ptOK(a, rr * Math.cos(rad(th)), rr * Math.sin(rad(th))),
          };
        }
        const n = rtName(r), th = r.pick(NICE), h = r.pick([4, 6, 8, 10, 12, 20]), opp = r.chance(0.5), f = opp ? 'sin' : 'cos';
        const want = opp ? n.side(n.Y, n.Z) : n.side(n.X, n.Z), v = R.mul(rq(h), TRIG[f](th)), a = `$${tx(v)}$`;
        return {
          q: rtQ(n, r.shuffle([`${MR(n.side(n.X, n.Y))}=${h}`, `${n.X}=${DG(th)}`]), MR(want)), a,
          easy: `$${h}\\${f}${DG(th)}=${tx(v)}$`,
          verify: () => numOK(a, h * (opp ? Math.sin(rad(th)) : Math.cos(rad(th)))),
        };
      },
      // 場面：はしご・坂道・ロボットのうで。約の値も
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0 || k === 3) {
          const L = r.pick([2, 3, 4, 5, 6]), th = r.pick(NICE), up = r.chance(0.6), f = up ? 'sin' : 'cos';
          const v = R.mul(rq(L), TRIG[f](th)), what = up ? '上のはしの高さ' : '下のはしからかべまでの距離';
          const base = `長さ ${UN(L, 'm')} のはしごを、地面と $${DG(th)}$ の角でかべに立てかける。${what}は`;
          if (k === 3 && !R.isQ(v)) {
            const kk = v[0].k, a = `$${apx(v, 1)}$`;
            return { q: `${base}何 m か。$\\sqrt{${kk}}=${APX[kk]}$ として小数第1位まで求めると □ m`, a, easyCheck: false,
              easy: `$${L}\\${f}${DG(th)}=${tx(v)}$、約 $${apx(v, 1)}$`, verify: () => apxOK(a, L * TF[f](rad(th)), 1) };
          }
          const a = `$${tx(v)}$`;
          return { q: `${base} □ m`, a, easy: `$${L}\\${f}${DG(th)}=${L}\\times${tx(TRIG[f](th))}=${tx(v)}$`, verify: () => numOK(a, L * TF[f](rad(th))) };
        }
        if (k === 1) {
          const L = r.pick([100, 200, 300, 400]), th = r.pick([30, 45]), v = R.mul(rq(L), sinR(th)), a = `$${tx(v)}$`;
          return { q: `長さ ${UN(L, 'm')} のまっすぐな坂道が、水平と $${DG(th)}$ の角をなしている。のぼりきると □ m 高くなる`, a,
            easy: `$${L}\\sin${DG(th)}=${tx(v)}$`, verify: () => numOK(a, L * Math.sin(rad(th))) };
        }
        const L = r.pick([20, 30, 40, 50]), th = r.pick(NICE), x = R.mul(rq(L), cosR(th)), y = R.mul(rq(L), sinR(th)), a = `$${PT(x, y)}$`;
        return { q: `長さ ${UN(L, 'cm')} のロボットのうでを、肩から $${DG(th)}$ の向きにのばす。肩を原点として、手の $(x,\\ y)$`, a, easyCheck: false,
          easy: `$(${L}\\cos${DG(th)},\\ ${L}\\sin${DG(th)})$`, verify: () => ptOK(a, L * Math.cos(rad(th)), L * Math.sin(rad(th))) };
      },
      // わな：かべ（たての線）からはかった角。sin と cos が入れかわる
      trap(r) {
        const L = r.pick([2, 4, 6, 8]), w = r.pick([30, 60]), up = r.chance(0.5);
        const v = R.mul(rq(L), up ? cosR(w) : sinR(w)), a = `$${tx(v)}$`;
        const p = {
          q: `長さ ${UN(L, 'm')} のはしごを、**かべと** $${DG(w)}$ の角になるように立てかける。${up ? '上のはしの高さ' : '下のはしからかべまでの距離'}は □ m`, a,
          verify: () => { const g = 90 - w; return numOK(a, L * (up ? Math.sin(rad(g)) : Math.cos(rad(g)))); },
        };
        return dest(p, '4-34', `かべ（たての線）からはかった角。地面との角は $90^{\\circ}-${DG(w)}=${DG(90 - w)}$ なので、${up ? '高さ' : 'かべまで'}＝$${L}\\${up ? 'sin' : 'cos'}${DG(90 - w)}=${L}\\${up ? 'cos' : 'sin'}${DG(w)}=${tx(v)}$（$\\sin$ と $\\cos$ が入れかわる）`);
      },
    },
  });

  // ================================================================ 4-35
  M.add({
    id: '4-35', part: PART, chap: '4-6②', stars: 1,
    title: '斜辺を求めるのは「$\\div\\sin$」「$\\div\\cos$」',
    mark: '対辺（たて）か隣辺（横）と、角がわかっていて、**斜辺**を求める。',
    futsu: ['$\\sin30^{\\circ}=\\frac{1.5}{L}$ と式を立て、', '両辺に $L$ をかけてから、', '両辺を $\\sin30^{\\circ}$ でわる。'],
    raku: ['斜辺＝対辺÷$\\sin\\theta$ と、すぐわる', '$\\frac{1.5}{\\sin30^{\\circ}}=\\frac{1.5}{0.5}=3$（m）'],
    why: '対辺＝斜辺×$\\sin\\theta$ の両辺を $\\sin\\theta$ でわった形。斜辺はいちばん長い辺なので、1より小さい $\\sin\\theta$ でわって大きくなる（4-6②）。',
    caution: '$\\sqrt{\\phantom{2}}$ でわるときは分母を有理化する：$6\\div\\frac{\\sqrt{3}}{2}=\\frac{12}{\\sqrt{3}}=4\\sqrt{3}$。斜辺がわかっていて辺を求めるときは、かけ算（わざ 4-34）。',
    counts: { s1: 8, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: '20mm', boxh: '10mm',
    fits(q) {
      if (rtKind(q) === 'leg→hyp') return true;
      return /板の長さ|坂道の長さ|スロープの長さ/.test(q);
    },
    steps: {
      // Cが直角、対辺と角 → 斜辺（÷sin）
      s1(r) {
        const X = r.pick(['A', 'B']), Y = X === 'A' ? 'B' : 'A', th = r.pick(NICE), o = r.int(2, 12);
        const oN = Y === 'A' ? 'AC' : 'BC', v = R.div(rq(o), sinR(th)), a = `$${tx(v)}$`;
        return {
          q: rtQ({ name: 'ABC', Z: 'C' }, [`${MR(oN)}=${o}`, `${X}=${DG(th)}`], '\\mathrm{AB}'), a,
          easy: `$\\frac{${o}}{\\sin${DG(th)}}=\\frac{${o}}{${tx(sinR(th))}}=${tx(v)}$`,
          verify: () => numOK(a, o / Math.sin(rad(th))),
        };
      },
      // 名前を変えて、隣辺と角 → 斜辺（÷cos）。対辺のものもまぜる
      s2(r) {
        const n = rtName(r), th = r.pick(NICE), l = r.int(2, 12), adj = r.chance(0.6), f = adj ? 'cos' : 'sin';
        const g = adj ? n.side(n.X, n.Z) : n.side(n.Y, n.Z), v = R.div(rq(l), TRIG[f](th)), a = `$${tx(v)}$`;
        return {
          q: rtQ(n, r.shuffle([`${MR(g)}=${l}`, `${n.X}=${DG(th)}`]), MR(n.side(n.X, n.Y))), a,
          easy: `$\\frac{${l}}{\\${f}${DG(th)}}=\\frac{${l}}{${tx(TRIG[f](th))}}=${tx(v)}$`,
          verify: () => numOK(a, l / TF[f](rad(th))),
        };
      },
      // 場面：すべり台・坂道・スロープ
      s3(r) {
        const k = r.int(0, 2), th = r.pick(NICE);
        if (k === 0) {
          const h = r.pick(['1.2', '1.5', '2', '2.4', '3']), v = R.div(R.dec(h), sinR(th)), a = `$${tx(v, { dec: true })}$`;
          return { q: `高さ ${UN(h, 'm')} の台に、$${DG(th)}$ の角で板をかけてすべり台を作る。板の長さは □ m`, a,
            easy: `$\\frac{${h}}{\\sin${DG(th)}}=${tx(v, { dec: true })}$`, verify: () => numOK(a, +h / Math.sin(rad(th))) };
        }
        if (k === 1) {
          const w = r.pick([30, 60, 90, 120]), v = R.div(rq(w), cosR(th)), a = `$${tx(v)}$`;
          return { q: `水平と $${DG(th)}$ の角をなす坂道で、横に ${UN(w, 'm')} 進んだ。坂道の長さは □ m`, a,
            easy: `$\\frac{${w}}{\\cos${DG(th)}}=${tx(v)}$`, verify: () => numOK(a, w / Math.cos(rad(th))) };
        }
        const h = r.pick([1, 2, 3, 4]), v = R.div(rq(h), sinR(th));
        if (R.isQ(v)) return null;
        const kk = v[0].k, a = `$${apx(v, 1)}$`;
        return { q: `高さ ${UN(h, 'm')} の所まで、$${DG(th)}$ の角でまっすぐなスロープをかける。$\\sqrt{${kk}}=${APX[kk]}$ として、スロープの長さを小数第1位まで求めると □ m`, a, easyCheck: false,
          easy: `$\\frac{${h}}{\\sin${DG(th)}}=${tx(v)}$、約 $${apx(v, 1)}$`, verify: () => apxOK(a, h / Math.sin(rad(th)), 1) };
      },
      // わな：斜辺がわかっていて、辺を求める（かけ算。4-34）
      trap(r) {
        const X = r.pick(['A', 'B']), th = r.pick(NICE), h = r.pick([4, 6, 8, 10]), f = r.pick(['sin', 'cos']);
        const want = f === 'sin' ? (X === 'A' ? 'BC' : 'AC') : (X === 'A' ? 'AC' : 'BC'), v = R.mul(rq(h), TRIG[f](th)), a = `$${tx(v)}$`;
        return dest({ q: rtQ({ name: 'ABC', Z: 'C' }, [`\\mathrm{AB}=${h}`, `${X}=${DG(th)}`], MR(want)), a, verify: () => numOK(a, h * TF[f](rad(th))) },
          '4-35', `わかっているのが斜辺で、求めるのはほかの辺。わり算ではなく、かけ算 $${h}\\${f}${DG(th)}=${tx(v)}$`);
      },
    },
  });

  // ================================================================ 4-36
  const TANV = { 20: '0.364', 35: '0.700', 40: '0.839' };
  M.add({
    id: '4-36', part: PART, chap: '4-6④', stars: 1,
    title: '傾きは $\\tan$、高さは「距離×$\\tan$」',
    mark: '坂の**傾き**と角、または**仰角**（見上げる角）と水平の距離から、高さを求める。',
    futsu: ['坂や木を、方眼に大きくかいて、', '高さを目もりで読む。'],
    raku: ['傾き＝高さ÷横＝$\\tan\\theta$', '木の高さ＝$20\\tan45^{\\circ}+1.5=21.5$（m）', '目の高さをたしわすれない'],
    why: '坂の角 $\\theta$ から見ると、高さは対辺、横は隣辺。だから傾き（高さ÷横）は $\\tan\\theta$ で、高さは横×$\\tan\\theta$（4-6④）。',
    caution: '傾きと角は比例しない。傾き1は $45^{\\circ}$ だが、傾き2は $90^{\\circ}$ ではない（$60^{\\circ}$ と $70^{\\circ}$ のあいだ）。',
    counts: { s1: 8, s2: 3, s3: 3, trap: 2 },
    cols: 1,
    boxw: '20mm', boxh: { s1: '10mm' },
    fits(q) {
      if (/大きい・小さい/.test(q)) return false;
      if (rtKind(q) === 'leg→leg') return true;
      return /傾き|仰角|見上げる|軸の正の向きとなす角|上がった高さ/.test(q);
    },
    steps: {
      // 角 → 傾き、傾き → 角
      s1(r) {
        const th = r.pick([30, 45, 60]), v = tanR(th);
        if (r.chance(0.5)) {
          const what = r.pick(['坂', '直線']);
          return { q: what === '坂' ? `水平と $${DG(th)}$ の角をなす坂の傾き` : `$x$ 軸の正の向きと $${DG(th)}$ の角をなす直線の傾き`,
            a: `$${tx(v)}$`, easy: `$\\tan${DG(th)}=${tx(v)}$` };
        }
        const a = `$${DG(th)}$`, s = tx(v);
        return {
          q: r.chance(0.5) ? `傾き $${s}$ の坂が、水平となす角` : `直線 $y=${s === '1' ? '' : s}x$ が、$x$ 軸の正の向きとなす角`, a, easyCheck: false,
          easy: `$\\tan${DG(th)}=${s}$ なので $${DG(th)}$`,
          verify: () => { const d = degsIn(a)[0]; return close(Math.tan(rad(d)), R.val(v), 1e-9) || '傾きが合わない'; },
        };
      },
      // 高さ＝横×tan（坂・木・ビル）
      s2(r) {
        if (r.chance(0.5)) {
          const th = r.pick([30, 60]), w = r.pick([3, 6, 9, 12, 15, 30]), v = R.mul(rq(w), tanR(th)), a = `$${tx(v)}$`;
          return { q: `水平と $${DG(th)}$ の角をなす坂を、横に ${UN(w, 'm')} 進んだ。上がった高さは □ m`, a,
            easy: `$${w}\\tan${DG(th)}=${w}\\times${tx(tanR(th))}=${tx(v)}$`, verify: () => numOK(a, w * Math.tan(rad(th))) };
        }
        const d = r.pick([10, 12, 15, 20, 25, 30]), e = r.pick(['1.5', '1.6']), v = R.add(rq(d), R.dec(e)), a = `$${tx(v, { decQ: true })}$`;
        return { q: `木から ${UN(d, 'm')} はなれた所で、木のてっぺんを見上げる角（仰角）が $45^{\\circ}$ だった。目の高さを ${UN(e, 'm')} とすると、木の高さは □ m`, a,
          easy: `$${d}\\tan45^{\\circ}+${e}=${tx(v, { decQ: true })}$`, verify: () => numOK(a, d * Math.tan(rad(45)) + +e) };
      },
      // 約の値：√3=1.73、または問題の文の tan の値で
      s3(r) {
        const d = r.pick([10, 20, 25, 30, 40]), e = r.pick(['1.5', '1.6']);
        if (r.chance(0.5)) {
          const th = r.pick([30, 60]), v = R.add(R.mul(rq(d), tanR(th)), R.dec(e)), a = `$${apx(v, 1)}$`;
          return { q: `ビルから ${UN(d, 'm')} はなれた所で、屋上を見上げる角（仰角）は $${DG(th)}$。目の高さを ${UN(e, 'm')}、$\\sqrt{3}=1.73$ として、ビルの高さを小数第1位まで求めると □ m`, a, easyCheck: false,
            easy: `$${d}\\tan${DG(th)}+${e}=${tx(R.mul(rq(d), tanR(th)))}+${e}$、約 $${apx(v, 1)}$`, verify: () => apxOK(a, d * Math.tan(rad(th)) + +e, 1) };
        }
        const th = r.pick([20, 35, 40]), t = TANV[th], val = round(d * +t + +e, 1), a = `$${val.toFixed(1)}$`;
        return { q: `塔から ${UN(d, 'm')} はなれた所で、てっぺんを見上げる角（仰角）は $${DG(th)}$。目の高さを ${UN(e, 'm')}、$\\tan${DG(th)}=${t}$ として、塔の高さを小数第1位まで求めると □ m`, a, easyCheck: false,
          easy: `$${d}\\times${t}+${e}=${fmt(d * +t + +e)}$`, verify: () => apxOK(a, d * Math.tan(rad(th)) + +e, 1) };
      },
      // わな：傾きと角は比例しない
      trap(r) {
        const s = r.pick([[2, '2'], [3, '3'], [4, '4'], [0.5, '\\frac{1}{2}'], [1 / 3, '\\frac{1}{3}']]), naive = 45 * s[0];
        const real = deg(Math.atan(s[0])), ans = real > naive ? '大きい' : '小さい';
        const p = {
          q: `傾き1の坂の角は $45^{\\circ}$ である。傾き $${s[1]}$ の坂の角は、$${fmt(naive)}^{\\circ}$ より（大きい・小さい） □`, a: ans,
          verify: () => ((Math.tan(rad(naive)) > s[0] || naive >= 90) === (ans === '小さい')) || 'まちがい',
        };
        return dest(p, '4-36', `傾きと角は比例しない。傾き $${s[1]}$ の角は約 $${real.toFixed(1)}^{\\circ}$（電卓の $\\tan^{-1}$ で）。傾きが大きいほど、角はゆっくりしかふえない`);
      },
    },
  });

  // ================================================================ 4-37
  M.add({
    id: '4-37', part: PART, chap: '4-6⑤', stars: 1,
    title: '$\\sin$ がわかれば、直角三角形をかいて $\\cos$・$\\tan$',
    mark: '$\\theta$ が**鋭角**で、$\\sin\\theta$（または $\\cos\\theta$・$\\tan\\theta$）の値が1つだけわかっている。',
    futsu: ['$\\sin^{2}\\theta+\\cos^{2}\\theta=1$ に入れて', '$\\cos^{2}\\theta=1-\\frac{9}{25}=\\frac{16}{25}$、', '$\\sqrt{\\phantom{2}}$ をとって $\\cos\\theta=\\frac{4}{5}$'],
    raku: ['$\\sin\\theta=\\frac{3}{5}$：対辺3、斜辺5の三角形', '隣辺は $\\sqrt{5^{2}-3^{2}}=4$（3、4、5）', '$\\cos\\theta=\\frac{4}{5}$、$\\tan\\theta=\\frac{3}{4}$'],
    why: '三角比は角だけで決まるので、比が合う直角三角形を1つかけば、ほかの比も読める。3、4、5 のような整数の辺の組なら、計算がほとんどいらない（4-6⑤）。',
    caution: '鈍角のときは直角三角形がかけない。$\\cos\\theta$ と $\\tan\\theta$ は負になる（4-6⑧）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm', boxh: '10mm',
    fits(q) { return /鋭角で/.test(q); },
    steps: {
      // sin がわかる（整数の辺の組）
      s1(r) {
        const [o0, d0, h] = r.pick(PRIM), sw = r.chance(0.5), o = sw ? d0 : o0, d = sw ? o0 : d0, f = r.pick(['cos', 'tan']);
        const v = f === 'cos' ? rq(d, h) : rq(o, d), a = `$${tx(v)}$`;
        return {
          q: `$\\theta$ が鋭角で、$\\sin\\theta=\\frac{${o}}{${h}}$ のとき、$\\${f}\\theta$`, a,
          easy: `対辺${o}、斜辺${h}：隣辺 $\\sqrt{${h}^{2}-${o}^{2}}=${d}$ → $${tx(v)}$`, easyCheck: 'last',
          verify: () => { const th = Math.asin(o / h); return numOK(a, TF[f](th)); },
        };
      },
      // cos・tan がわかる
      s2(r) {
        const [o0, d0, h] = r.pick(PRIM), sw = r.chance(0.5), o = sw ? d0 : o0, d = sw ? o0 : d0;
        const g = r.pick(['cos', 'tan']), f = g === 'cos' ? r.pick(['sin', 'tan']) : r.pick(['sin', 'cos']);
        const giv = g === 'cos' ? `\\frac{${d}}{${h}}` : `\\frac{${o}}{${d}}`;
        const v = f === 'sin' ? rq(o, h) : f === 'cos' ? rq(d, h) : rq(o, d), a = `$${tx(v)}$`;
        const third = g === 'cos' ? `対辺 $\\sqrt{${h}^{2}-${d}^{2}}=${o}$` : `斜辺 $\\sqrt{${o}^{2}+${d}^{2}}=${h}$`;
        return {
          q: `$\\theta$ が鋭角で、$\\${g}\\theta=${giv}$ のとき、$\\${f}\\theta$`, a,
          easy: `${third} → $${tx(v)}$`, easyCheck: 'last',
          verify: () => { const th = Math.atan2(o, d); return numOK(a, TF[f](th)); },
        };
      },
      // 辺が整数にならない（√ が残る）
      s3(r) {
        const g = r.pick(['sin', 'cos', 'tan']);
        let o, d, h;   // 対辺・隣辺・斜辺（R）
        if (g === 'tan') { o = rq(r.int(1, 4)); d = rq(r.int(1, 5)); h = R.sqrt(R.add(R.mul(o, o), R.mul(d, d))); }
        else { h = rq(r.int(3, 7)); const s = rq(r.int(1, R.val(h) - 1)); if (g === 'sin') { o = s; d = R.sqrt(R.sub(R.mul(h, h), R.mul(o, o))); } else { d = s; o = R.sqrt(R.sub(R.mul(h, h), R.mul(d, d))); } }
        if (![o, d, h].every(x => x.length === 1) || [o, d, h].every(R.isQ) || (R.isQ(o) && R.isQ(d) && R.isQ(h))) return null;
        const gv = g === 'sin' ? R.div(o, h) : g === 'cos' ? R.div(d, h) : R.div(o, d);
        if (!R.isQ(gv)) return null;
        const f = r.pick(['sin', 'cos', 'tan'].filter(x => x !== g)), v = f === 'sin' ? R.div(o, h) : f === 'cos' ? R.div(d, h) : R.div(o, d), a = `$${tx(v)}$`;
        return {
          q: `$\\theta$ が鋭角で、$\\${g}\\theta=${tx(gv)}$ のとき、$\\${f}\\theta$`, a,
          easy: `対辺 $${tx(o)}$、隣辺 $${tx(d)}$、斜辺 $${tx(h)}$ → $${tx(v)}$`, easyCheck: 'last',
          verify: () => { const th = g === 'sin' ? Math.asin(R.val(gv)) : g === 'cos' ? Math.acos(R.val(gv)) : Math.atan(R.val(gv)); return numOK(a, TF[f](th)); },
        };
      },
      // わな：鈍角（直角三角形がかけない。cos・tan は負。4-39）
      trap(r) {
        const [o0, d0, h] = r.pick(PRIM.slice(0, 4)), sw = r.chance(0.5), o = sw ? d0 : o0, d = sw ? o0 : d0, f = r.pick(['cos', 'tan']);
        const v = f === 'cos' ? rq(-d, h) : rq(-o, d), a = `$${tx(v)}$`;
        const p = { q: `$\\theta$ が鈍角で、$\\sin\\theta=\\frac{${o}}{${h}}$ のとき、$\\${f}\\theta$`, a,
          verify: () => { const th = Math.PI - Math.asin(o / h); return numOK(a, TF[f](th)); } };
        return dest(p, '4-37', `鈍角なので、直角三角形はかけない。$${o}$、$${d}$、$${h}$ の三角形で大きさを出し、鈍角の $\\${f}$ は負なので $${tx(v)}$`);
      },
    },
  });

  // ================================================================ 4-38
  const ODD = [10, 20, 25, 35, 40, 50, 55, 65, 70, 80];   // 三角定規の角でない角
  const SINV = { 20: '0.342', 40: '0.643', 50: '0.766', 70: '0.940' };
  const TANT = { 20: '0.364', 40: '0.839', 50: '1.192', 70: '2.747' };
  M.add({
    id: '4-38', part: PART, chap: '4-6⑤', stars: 1,
    title: '余角は $\\sin$ と $\\cos$ が入れかわる',
    mark: '2つの角の**和が $90^{\\circ}$**（$\\sin70^{\\circ}$ と $\\cos20^{\\circ}$、$\\tan25^{\\circ}$ と $\\tan65^{\\circ}$）。',
    futsu: ['$\\sin70^{\\circ}$ と $\\cos20^{\\circ}$ を、', '電卓や表でそれぞれ調べて、', 'くらべる。'],
    raku: ['$70^{\\circ}=90^{\\circ}-20^{\\circ}$ なので $\\sin70^{\\circ}=\\cos20^{\\circ}$', '$\\sin^{2}20^{\\circ}+\\sin^{2}70^{\\circ}$', '$=\\sin^{2}20^{\\circ}+\\cos^{2}20^{\\circ}=1$'],
    why: '直角三角形の直角でない2つの角は $\\theta$ と $90^{\\circ}-\\theta$。$90^{\\circ}-\\theta$ に目を置くと、対辺と隣辺が入れかわる。だから $\\sin(90^{\\circ}-\\theta)=\\cos\\theta$、$\\tan(90^{\\circ}-\\theta)=\\frac{1}{\\tan\\theta}$（4-6⑤）。',
    caution: '和が $180^{\\circ}$ の2つの角（$20^{\\circ}$ と $160^{\\circ}$）は余角ではない。そちらは鈍角の式を使う（わざ 4-39）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '10mm', s3: '16mm', trap: '10mm' }, boxh: { s3: '10mm' },
    fits(q) {
      if (/90\^\{\\circ\}-|\+B=90/.test(q)) return true;
      const ds = degsIn(q).filter(d => d > 0 && d < 90 && !NICE.includes(d));
      return ds.some((d, i) => ds.some((e, j) => i !== j && d + e === 90)) || /\\(sin|cos|tan)□/.test(q);
    },
    steps: {
      // sin70°=cos□、sin20°÷cos70°
      s1(r) {
        const t = r.pick(ODD), u = 90 - t, k = r.int(0, 3);
        if (k === 3) {
          const [f, g] = r.pick([['sin', 'cos'], ['cos', 'sin']]);
          return { q: `$\\frac{\\${f}${DG(t)}}{\\${g}${DG(u)}}$`, a: '$1$', easy: `$\\${g}${DG(u)}=\\${f}${DG(t)}$ なので $1$`, easyCheck: 'last' };
        }
        const [f, g] = [['sin', 'cos'], ['cos', 'sin'], ['tan', 'tan']][k], a = `$${DG(u)}$`;
        const q = k === 2 ? `$\\tan${DG(t)}=\\frac{1}{\\tan□}$` : `$\\${f}${DG(t)}=\\${g}□$`;
        return { q, a, easy: `$90^{\\circ}-${DG(t)}=${DG(u)}$`,
          verify: () => { const d = rad(degsIn(a)[0]); const L = TF[f](rad(t)), Rr = k === 2 ? 1 / Math.tan(d) : TF[g](d); return close(L, Rr, 1e-9) || '式が成り立たない'; } };
      },
      // 和が90°の2つの角をふくむ式
      s2(r) {
        const t = r.pick(ODD.filter(x => x < 45)), u = 90 - t, k = r.int(0, 4), [p, q] = r.chance(0.5) ? [t, u] : [u, t];
        const F = [
          [`\\sin^{2}${DG(p)}+\\sin^{2}${DG(q)}`, 1, `\\sin^{2}${DG(p)}+\\cos^{2}${DG(p)}=1`, x => Math.sin(rad(p)) ** 2 + Math.sin(rad(q)) ** 2],
          [`\\cos^{2}${DG(p)}+\\cos^{2}${DG(q)}`, 1, `\\cos^{2}${DG(p)}+\\sin^{2}${DG(p)}=1`, x => Math.cos(rad(p)) ** 2 + Math.cos(rad(q)) ** 2],
          [`\\tan${DG(p)}\\times\\tan${DG(q)}`, 1, `\\tan${DG(p)}\\times\\frac{1}{\\tan${DG(p)}}=1`, x => Math.tan(rad(p)) * Math.tan(rad(q))],
          [`\\sin${DG(p)}-\\cos${DG(q)}`, 0, `\\sin${DG(p)}-\\sin${DG(p)}=0`, x => Math.sin(rad(p)) - Math.cos(rad(q))],
          [`\\cos${DG(p)}\\div\\sin${DG(q)}`, 1, `\\cos${DG(p)}\\div\\cos${DG(p)}=1`, x => Math.cos(rad(p)) / Math.sin(rad(q))],
        ][k];
        const a = `$${F[1]}$`;
        return { q: `$${F[0]}$`, a, easy: `$${F[2]}$`, verify: () => numOK(a, F[3]()) };
      },
      // 値が書いてある・文字の角
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t = r.pick(Object.keys(SINV).map(Number)), u = 90 - t, a = `$${SINV[t]}$`;
          return { q: `$\\sin${DG(t)}=${SINV[t]}$ のとき、$\\cos${DG(u)}$`, a, easyCheck: false,
            easy: `$\\cos${DG(u)}=\\sin(90^{\\circ}-${DG(u)})=\\sin${DG(t)}$`, verify: () => numOK(a, Math.cos(rad(u)), 2e-3) };
        }
        if (k === 1) {
          const t = r.pick(Object.keys(TANT).map(Number)), u = 90 - t, val = round(1 / +TANT[t], 3), a = `$${val.toFixed(3)}$`;
          return { q: `$\\tan${DG(t)}=${TANT[t]}$ のとき、$\\tan${DG(u)}$ を小数第3位まで`, a, easyCheck: false,
            easy: `$\\tan${DG(u)}=\\frac{1}{\\tan${DG(t)}}=\\frac{1}{${TANT[t]}}$、約 $${val.toFixed(3)}$`, verify: () => numOK(a, Math.tan(rad(u)), 2e-3) };
        }
        const [o, d, h] = r.pick(PRIM), g = r.pick(['sin', 'cos', 'tan']);
        const gv = g === 'sin' ? rq(o, h) : g === 'cos' ? rq(d, h) : rq(o, d);
        const f = g === 'tan' ? 'tan' : g === 'sin' ? 'cos' : 'sin', v = g === 'tan' ? R.inv(gv) : gv, a = `$${tx(v)}$`;
        return { q: `$A+B=90^{\\circ}$ で、$\\${g} A=${tx(gv)}$ のとき、$\\${f} B$`, a, easyCheck: 'last',
          easy: `$B=90^{\\circ}-A$ なので $\\${f} B=${g === 'tan' ? `\\frac{1}{\\tan A}` : `\\${g} A`}=${tx(v)}$`,
          verify: () => { const A = g === 'sin' ? Math.asin(R.val(gv)) : g === 'cos' ? Math.acos(R.val(gv)) : Math.atan(R.val(gv)); return numOK(a, TF[f](Math.PI / 2 - A)); } };
      },
      // わな：和が180°（余角ではない。4-39）
      trap(r) {
        const t = r.pick(ODD.filter(x => x < 45)), u = 180 - t, k = r.int(0, 2);
        const F = [[`\\sin${DG(u)}\\div\\sin${DG(t)}`, '1', '$\\sin(180^{\\circ}-\\theta)=\\sin\\theta$ で $1$'],
          [`\\cos${DG(u)}+\\cos${DG(t)}`, '0', '$\\cos(180^{\\circ}-\\theta)=-\\cos\\theta$ で $0$'],
          [`\\tan${DG(u)}+\\tan${DG(t)}`, '0', '$\\tan(180^{\\circ}-\\theta)=-\\tan\\theta$ で $0$']][k];
        return dest({ q: `$${F[0]}$`, a: `$${F[1]}$` }, '4-38', `たして $180^{\\circ}$。余角ではない。鈍角の式 ${F[2]}`);
      },
    },
  });

  // ================================================================ 4-39
  const OBT = [120, 135, 150];
  // 0°〜180° で f(θ)＝値 になる角（15°ごとにさがす）
  function solve180(f, v) {
    const out = [];
    for (let t = 0; t <= 180; t += 15) { if (f === 'tan' && t === 90) continue; if (close(TF[f](rad(t)), v, 1e-9)) out.push(t); }
    return out;
  }
  const angAns = ts => ts.map(t => `$${DG(t)}$`).join('、');
  M.add({
    id: '4-39', part: PART, chap: '4-6⑧', stars: 1,
    title: '鈍角は $180^{\\circ}-\\theta$ に（$\\sin$ はそのまま、$\\cos$・$\\tan$ は符号が反対）',
    mark: '$90^{\\circ}$〜$180^{\\circ}$ の角の三角比。$0^{\\circ}\\leqq\\theta\\leqq180^{\\circ}$ で $\\sin\\theta=\\square$ になる $\\theta$。',
    futsu: ['半円をかいて、点Pの座標を', 'そのつど読みとる。', '$\\sin\\theta=\\frac{\\sqrt{3}}{2}$ で $60^{\\circ}$ だけ答える。'],
    raku: ['$\\sin135^{\\circ}=\\sin45^{\\circ}=\\frac{\\sqrt{2}}{2}$', '$\\cos150^{\\circ}=-\\cos30^{\\circ}=-\\frac{\\sqrt{3}}{2}$', '$\\sin\\theta=\\frac{\\sqrt{3}}{2}$ → $60^{\\circ}$ と $180^{\\circ}-60^{\\circ}=120^{\\circ}$'],
    why: '半円の上で、$\\theta$ の点と $180^{\\circ}-\\theta$ の点は、$y$ 軸について左右反対。高さ（$\\sin$）は同じで、横（$\\cos$）は符号だけが反対になる（4-6⑧）。',
    caution: '$\\cos120^{\\circ}$ は $\\frac{1}{2}$ ではなく $-\\frac{1}{2}$。$\\sin\\theta$ が1より小さい正の値になる角は、鋭角と鈍角の2つある。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '18mm', s2: '24mm', s3: '24mm', trap: '18mm' }, boxh: { s1: '10mm', trap: '10mm' },
    fits(q) {
      const ds = degsIn(q);
      if (ds.some(d => d > 180)) return false;
      if (/鈍角/.test(q) && /\\(sin|cos|tan)/.test(q) && !/三角形/.test(q)) return true;
      if (/0\^\{\\circ\}\\leqq\\theta\\leqq180\^\{\\circ\}/.test(q)) return true;
      if (/^\$\\(sin|cos|tan)\d+\^\{\\circ\}\$$/.test(q) && [0, 90, 180].includes(ds[0])) return true;   // 0°・90°・180°（半円のはし）
      return /\\(sin|cos|tan)/.test(q) && !/三角形|斜面|うで|ロープ|合力|面積/.test(q) && ds.some(d => d > 90 && d <= 180);
    },
    steps: {
      // 鈍角の値
      s1(r) {
        const f = r.pick(['sin', 'cos', 'tan']), t = r.pick(OBT), v = TRIG[f](t), sg = f === 'sin' ? '' : '-';
        return { q: `$\\${f}${DG(t)}$`, a: `$${tx(v)}$`, easy: `$${sg}\\${f}${DG(180 - t)}=${tx(v)}$` };
      },
      // sin θ＝□ の θ（2つ）、cos・tan（1つ）
      s2(r) {
        const f = r.pick(['sin', 'sin', 'cos', 'tan']), t = r.pick(f === 'sin' ? [30, 45, 60] : [30, 45, 60, 120, 135, 150]);
        const v = TRIG[f](t), sols = solve180(f, R.val(v)), a = angAns(sols);
        return {
          q: `$0^{\\circ}\\leqq\\theta\\leqq180^{\\circ}$ で、$\\${f}\\theta=${tx(v)}$ になる $\\theta$`, a, easyCheck: false,
          easy: f === 'sin' ? `鋭角 $${DG(t)}$ と、$180^{\\circ}-${DG(t)}=${DG(180 - t)}$` : `$\\${f}$ は1つに決まる：$${DG(t)}$`,
          verify: () => degsOK(a, sols),
        };
      },
      // 鋭角・鈍角の条件、0°・90°・180°
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const t = r.pick(OBT), f = r.pick(['sin', 'cos']), v = TRIG[f](f === 'sin' ? t : t), a = `$${DG(t)}$`;
          return { q: `$\\theta$ が鈍角で、$\\${f}\\theta=${tx(v)}$ のとき、$\\theta$`, a, easyCheck: false,
            easy: f === 'sin' ? `鋭角なら $${DG(180 - t)}$。鈍角は $180^{\\circ}-${DG(180 - t)}=${DG(t)}$` : `$\\cos$ が負なので鈍角：$${DG(t)}$`,
            verify: () => degsOK(a, solve180(f, R.val(v)).filter(x => x > 90 && x < 180)) };
        }
        if (k === 1) {
          const [f, val, txt] = r.pick([['sin', 0, '0'], ['sin', 1, '1'], ['cos', 0, '0'], ['cos', -1, '-1'], ['cos', 1, '1']]);
          const sols = solve180(f, val), a = angAns(sols);
          return { q: `$0^{\\circ}\\leqq\\theta\\leqq180^{\\circ}$ で、$\\${f}\\theta=${txt}$ になる $\\theta$`, a, easyCheck: false,
            easy: `半円の上の点が、${f === 'sin' ? (val ? 'いちばん上' : '$x$ 軸の上（右はしと左はし）') : (val === 0 ? '$y$ 軸の上' : val > 0 ? '右はし' : '左はし')}`, verify: () => degsOK(a, sols) };
        }
        const t = r.pick([0, 90, 180]), f = r.pick(['sin', 'cos']), v = TRIG[f](t);
        return { q: `$\\${f}${DG(t)}$`, a: `$${tx(v)}$`, easy: `半円の上の点 $${PT(cosR(t), sinR(t))}$ の ${f === 'sin' ? '$y$' : '$x$'} 座標：$${tx(v)}$`, easyCheck: 'last' };
      },
      // わな：180° をこえる角（半円の外。第4部 4-49）
      trap(r) {
        const t = r.pick([210, 225, 240, 300, 315, 330]), f = r.pick(['sin', 'cos']), v = TRIG[f](t);
        const ref = t < 270 ? t - 180 : 360 - t;
        return dest({ q: `$\\${f}${DG(t)}$`, a: `$${tx(v)}$` }, '4-39',
          `$180^{\\circ}$ をこえる角で、半円の外。単位円で、$x$ 軸とのとがった角 $${DG(ref)}$ と、${t < 270 ? '左下' : '右下'}の符号を見る：$${tx(v)}$（4部のわざ 4-49）`);
      },
    },
  });

  // ================================================================ 4-40
  const MASS = [1, 2, 4, 5, 10, 20];
  const mgR = m => R.q(98 * m, 10);                     // mg（N）。g＝9.8
  const mgT = m => fmt(9.8 * m);
  M.add({
    id: '4-40', part: PART, chap: '4-6⑥', stars: 1,
    title: '斜面にそった力は $mg\\sin\\theta$、押しつける力は $mg\\cos\\theta$',
    mark: '**斜面**の上の物の重力 $mg$（$g=9.8$）を、斜面にそった向きと、斜面に垂直な向きに分ける（まさつは考えない）。',
    futsu: ['重力の矢印を大きくかいて、', '長方形の2辺の長さをはかる。', 'どちらが $\\sin$ か、まよう。'],
    raku: ['$10\\,\\mathrm{kg}$、$30^{\\circ}$：$mg=98$（N）', 'そった力 $98\\sin30^{\\circ}=49$', '押しつける力 $98\\cos30^{\\circ}=49\\sqrt{3}$'],
    why: '重力と、斜面に垂直な向きのあいだの角は、斜面の角 $\\theta$ と同じ。重力を斜辺とする直角三角形で、そった力は $\\theta$ の対辺、押しつける力は隣辺になる（4-6⑥）。',
    caution: '$\\theta=0^{\\circ}$（平ら）で確かめる。平らな床では、そった力は0のはず。$\\sin0^{\\circ}=0$ で合う。$\\cos$ にすると $mg$ になって合わない。',
    counts: { s1: 8, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: '20mm',
    fits(q) { return /斜面/.test(q); },
    steps: {
      // 質量と角 → そった力か押しつける力
      s1(r) {
        const m = r.pick(MASS), th = r.pick(NICE), along = r.chance(0.5), f = along ? 'sin' : 'cos';
        const v = R.mul(mgR(m), TRIG[f](th)), a = `$${tx(v, { dec: true })}$`;
        return {
          q: `$${DG(th)}$ の斜面に質量 ${UN(m, 'kg')} の物。${along ? '斜面にそった力' : '斜面へ押しつける力'}は □ N`, a,
          easy: `$${m}\\times9.8\\times\\${f}${DG(th)}=${mgT(m)}\\times${tx(TRIG[f](th))}=${tx(v, { dec: true })}$`,
          verify: () => numOK(a, m * 9.8 * TF[f](rad(th))),
        };
      },
      // 重力（N）で書いたもの、約の値
      s2(r) {
        const th = r.pick(NICE), along = r.chance(0.5), f = along ? 'sin' : 'cos', what = along ? '斜面にそった力' : '斜面へ押しつける力';
        if (r.chance(0.5)) {
          const W = r.pick([20, 40, 60, 80, 100, 120]), v = R.mul(rq(W), TRIG[f](th)), a = `$${tx(v, { dec: true })}$`;
          return { q: `$${DG(th)}$ の斜面に重力 ${UN(W, 'N')} の物。${what}は □ N`, a,
            easy: `$${W}\\${f}${DG(th)}=${tx(v, { dec: true })}$`, verify: () => numOK(a, W * TF[f](rad(th))) };
        }
        const m = r.pick([2, 5, 10, 20]), v = R.mul(mgR(m), TRIG[f](th));
        if (R.isQ(v)) return null;
        const kk = v[0].k, a = `$${apx(v, 1)}$`;
        return { q: `$${DG(th)}$ の斜面に質量 ${UN(m, 'kg')} の物。$\\sqrt{${kk}}=${APX[kk]}$ として、${what}を小数第1位まで求めると □ N`, a, easyCheck: false,
          easy: `$${mgT(m)}\\${f}${DG(th)}=${tx(v, { dec: true })}$、約 $${apx(v, 1)}$`, verify: () => apxOK(a, m * 9.8 * TF[f](rad(th)), 1) };
      },
      // 逆に：力から質量・角。はしの角（0°）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const m = r.pick([2, 4, 5, 10, 20]), F = R.mul(mgR(m), sinR(30)), a = `$${m}$`;
          return { q: `$30^{\\circ}$ の斜面で、斜面にそった力が ${UN(tx(F, { dec: true }), 'N')} だった。物の質量は □ kg`, a,
            easy: `$${tx(F, { dec: true })}\\div\\sin30^{\\circ}\\div9.8=${m}$`, verify: () => numOK(a, R.val(F) / Math.sin(rad(30)) / 9.8) };
        }
        if (k === 1) {
          const [txt, t] = r.pick([['斜面にそった力が、重力の半分', 30], ['斜面にそった力と、斜面へ押しつける力が同じ大きさ', 45], ['斜面へ押しつける力が、重力の半分', 60]]), a = `$${DG(t)}$`;
          return { q: `${txt}になる斜面の角は □`, a, easyCheck: false,
            easy: t === 45 ? '$mg\\sin\\theta=mg\\cos\\theta$ なので $\\tan\\theta=1$' : t === 30 ? '$\\sin\\theta=\\frac{1}{2}$' : '$\\cos\\theta=\\frac{1}{2}$',
            verify: () => { const d = rad(degsIn(a)[0]); return (t === 45 ? close(Math.sin(d), Math.cos(d)) : t === 30 ? close(Math.sin(d), 0.5) : close(Math.cos(d), 0.5)) || 'まちがい'; } };
        }
        const m = r.pick(MASS), along = r.chance(0.5), v = along ? rq(0) : mgR(m), a = `$${tx(v, { dec: true })}$`;
        return { q: `平らな床（$0^{\\circ}$ の斜面）に、質量 ${UN(m, 'kg')} の物がある。${along ? '床にそった力' : '床へ押しつける力'}は □ N`, a,
          easy: `$${mgT(m)}\\${along ? 'sin' : 'cos'}0^{\\circ}=${tx(v, { dec: true })}$`, verify: () => numOK(a, m * 9.8 * (along ? 0 : 1)) };
      },
      // わな：ひもでななめ上に引く。前へ引く力は F cos θ（4-34）
      trap(r) {
        const F = r.pick([10, 20, 30, 40, 50]), th = r.pick(NICE), v = R.mul(rq(F), cosR(th)), a = `$${tx(v)}$`;
        const p = { q: `ひもを水平から $${DG(th)}$ 上に向けて、${UN(F, 'N')} の力で荷物を引く。荷物を水平に前へ引く力は □ N`, a,
          verify: () => numOK(a, F * Math.cos(rad(th))) };
        return dest(p, '4-40', `斜面の重力ではない。ひもの力が斜辺で、水平に前へ引く力は $\\theta$ のとなりの辺：$${F}\\cos${DG(th)}=${tx(v)}$`);
      },
    },
  });

  // ================================================================ 4-41
  const ROT = [['a', 'b', 'C'], ['b', 'c', 'A'], ['c', 'a', 'B']];   // 2辺と、そのあいだの角
  const triQ = (gs, ask) => `三角形ABCで、${gs.map(g => `$${g}$`).join('、')} のとき、${ask}`;
  M.add({
    id: '4-41', part: PART, chap: '4-7②', stars: 1,
    title: '2辺とあいだの角なら、面積は $\\frac{1}{2}ab\\sin C$',
    mark: '**2辺**と、その**あいだの角**がわかっていて、三角形の**面積**を求める。',
    futsu: ['頂点から垂線を下ろして高さを出し、', '底辺×高さ÷2 を計算する。'],
    raku: ['$a=6$、$b=5$、$C=30^{\\circ}$', '$S=\\frac{1}{2}\\times6\\times5\\times\\sin30^{\\circ}$', '$=\\frac{1}{2}\\times6\\times5\\times\\frac{1}{2}=7.5$'],
    why: '底辺を $a$ にすると、高さは $b\\sin C$（斜辺 $b$ の直角三角形の対辺）。だから底辺×高さ÷2 が $\\frac{1}{2}ab\\sin C$（4-7②）。',
    caution: '角は2辺の「あいだ」の角。鈍角でも $\\sin$ は正（$\\sin135^{\\circ}=\\sin45^{\\circ}$）なので、面積はいつも正。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '20mm', boxh: '10mm',
    fits(q) {
      if (/平行四辺形|正三角形|土地/.test(q) && /面積/.test(q)) return true;
      return /面積/.test(q) && between(triParse(q));
    },
    steps: {
      // 鋭角（30°・45°・60°・90°）
      s1(r) {
        const [x, y, Z] = r.pick(ROT), p = r.int(2, 12), q = r.int(2, 12), t = r.pick([30, 45, 60, 90]);
        const v = R.mul(R.q(p * q, 2), sinR(t)), a = `$${tx(v, { decQ: true })}$`;
        return {
          q: triQ([`${x}=${p}`, `${y}=${q}`, `${Z}=${DG(t)}`], '面積'), a,
          easy: `$\\frac{1}{2}\\times${p}\\times${q}\\times\\sin${DG(t)}=\\frac{1}{2}\\times${p}\\times${q}\\times${tx(sinR(t))}=${tx(v, { decQ: true })}$`,
          verify: () => { const P = { C: [0, 0], B: [p, 0], A: [q * Math.cos(rad(t)), q * Math.sin(rad(t))] }; return numOK(a, p * P.A[1] / 2); },
        };
      },
      // 鈍角（120°・135°・150°）
      s2(r) {
        const [x, y, Z] = r.pick(ROT), p = r.int(2, 12), q = r.int(2, 12), t = r.pick(OBT);
        const v = R.mul(R.q(p * q, 2), sinR(t)), a = `$${tx(v, { decQ: true })}$`;
        return {
          q: triQ([`${x}=${p}`, `${y}=${q}`, `${Z}=${DG(t)}`], '面積'), a,
          easy: `$\\frac{1}{2}\\times${p}\\times${q}\\times\\sin${DG(t)}=\\frac{1}{2}\\times${p}\\times${q}\\times${tx(sinR(t))}=${tx(v, { decQ: true })}$`,
          verify: () => numOK(a, p * q * Math.sin(rad(t)) / 2),
        };
      },
      // 平行四辺形・正三角形・土地
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const p = r.int(3, 10), q = r.int(3, 10), t = r.pick([30, 45, 60, 120, 135, 150]), v = R.mul(rq(p * q), sinR(t)), a = `$${tx(v, { decQ: true })}$`;
          return { q: `となり合う2辺が $${p}$ と $${q}$ で、そのあいだの角が $${DG(t)}$ の平行四辺形の面積`, a,
            easy: `三角形2つ分：$${p}\\times${q}\\times\\sin${DG(t)}=${tx(v, { decQ: true })}$`, easyCheck: 'last', verify: () => numOK(a, p * q * Math.sin(rad(t))) };
        }
        if (k === 1) {
          const s = r.int(2, 12), v = R.mul(R.q(s * s, 2), sinR(60)), a = `$${tx(v)}$`;
          return { q: `1辺が $${s}$ の正三角形の面積`, a, easy: `$\\frac{1}{2}\\times${s}\\times${s}\\times\\sin60^{\\circ}=${tx(v)}$`,
            verify: () => numOK(a, s * (s * Math.sqrt(3) / 2) / 2) };
        }
        const p = r.pick([10, 20, 30, 40]), q = r.pick([12, 15, 20, 25]), t = r.pick([30, 150]), v = R.mul(R.q(p * q, 2), sinR(t)), a = `$${tx(v, { decQ: true })}$`;
        return { q: `三角形の土地で、2辺が ${UN(p, 'm')} と ${UN(q, 'm')}、そのあいだの角が $${DG(t)}$ だった。面積は □ $\\mathrm{m^{2}}$`, a,
          easy: `$\\frac{1}{2}\\times${p}\\times${q}\\times\\sin${DG(t)}=${tx(v, { decQ: true })}$`, verify: () => numOK(a, p * q * Math.sin(rad(t)) / 2) };
      },
      // わな：3辺だけ（角は余弦定理で先に。4-45）
      trap(r) {
        const t = r.pick([60, 120]), [p, q, c] = r.pick(TRI[t]), [x, y, Z] = r.pick(ROT);
        const v = R.mul(R.q(p * q, 2), sinR(t)), a = `$${tx(v)}$`, zl = Z.toLowerCase();
        const gs = { [x]: p, [y]: q, [zl]: c };
        const p0 = { q: triQ(['a', 'b', 'c'].map(s => `${s}=${gs[s]}`), '面積'), a,
          verify: () => { const P = triPts(gs.a, gs.b, gs.c); return numOK(a, gs.a * P.A[1] / 2); } };
        return dest(p0, '4-41', `角がわからない。まず3辺から角を出す：$\\cos ${Z}=\\frac{${p}^{2}+${q}^{2}-${c}^{2}}{2\\times${p}\\times${q}}$ で $${Z}=${DG(t)}$ → $\\frac{1}{2}\\times${p}\\times${q}\\times\\sin${DG(t)}=${tx(v)}$`);
      },
    },
  });

  // ================================================================ 4-42
  const SA = [30, 45, 60, 90, 120, 135, 150];   // sin がわかる角
  const LET = ['A', 'B', 'C'];
  M.add({
    id: '4-42', part: PART, chap: '4-7③⑤', stars: 1,
    title: '1辺と両はしの角なら、のこりの角を出して正弦定理',
    mark: '**2つの角と1辺**がわかっている。内角の和でのこりの角を出すと、角と、その**向かいの辺**の組がそろう。',
    futsu: ['頂点から垂線を下ろして、', '直角三角形を2つ作り、', '高さから順に計算する。'],
    raku: ['$c=80$、$A=45^{\\circ}$、$B=105^{\\circ}$', '$C=180^{\\circ}-45^{\\circ}-105^{\\circ}=30^{\\circ}$', '$a=\\frac{80\\sin45^{\\circ}}{\\sin30^{\\circ}}=80\\sqrt{2}$'],
    why: '正弦定理 $\\frac{a}{\\sin A}=\\frac{c}{\\sin C}$ は「角と、その向かいの辺」の組を2つ使う。内角の和で $C$ を出せば、$c$ と $C$ の組がそろう（4-7③⑤）。',
    caution: '2辺と、そのあいだでない角のときは、三角形が2つかけることがある（$\\sin C$ が同じになる鋭角と鈍角）。',
    counts: { s1: 7, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: '20mm', boxh: '10mm',
    fits(q) {
      if (/外接円/.test(q)) return false;
      const t = triParse(q);
      if (t && t.na === 2 && t.ns === 1) return true;
      return /\\angle/.test(q) && /\\mathrm\{(AB|BC|AC)\}=/.test(q) && /(AC|BC)/.test(q) && !/直角/.test(q);
    },
    steps: {
      // 1辺と両はしの角（のこりの角を出してから）
      s1(r) {
        const [P, Q2, S] = r.shuffle(LET), A = r.pick(SA.slice(0, 6)), Cc = r.pick(SA.filter(x => A + x < 180 && x !== A));
        const B = 180 - A - Cc, s = r.pick([4, 6, 8, 10, 12, 20, 40, 60, 80, 100]);
        // 角 S＝Cc の向かいの辺（長さ s）がわかっていて、角 P＝A、角 Q2＝B。求めるのは P の向かいの辺
        const v = R.div(R.mul(rq(s), sinR(A)), sinR(Cc)), a = `$${tx(v)}$`, sl = S.toLowerCase(), pl = P.toLowerCase();
        return {
          q: triQ(r.shuffle([`${sl}=${s}`, `${P}=${DG(A)}`, `${Q2}=${DG(B)}`]), `$${pl}$`), a,
          easy: `$${S}=180^{\\circ}-${DG(A)}-${DG(B)}=${DG(Cc)}$、$${pl}=\\frac{${s}\\sin${DG(A)}}{\\sin${DG(Cc)}}=${tx(v)}$`, easyCheck: 'last',
          verify: () => { const T = triAng(A, B); if (!close(T.angS, Cc, 1e-6)) return '三角形が作れない'; return numOK(a, s * T.oP); },
        };
      },
      // 角と向かいの辺の組が、はじめからそろっている
      s2(r) {
        const [P, Q2, S] = r.shuffle(LET), A = r.pick(SA.slice(0, 6)), B = r.pick(SA.filter(x => A + x < 180 && x !== A)), s = r.pick([4, 6, 8, 10, 12, 20]);
        const v = R.div(R.mul(rq(s), sinR(B)), sinR(A)), a = `$${tx(v)}$`, pl = P.toLowerCase(), ql = Q2.toLowerCase();
        return {
          q: triQ(r.shuffle([`${pl}=${s}`, `${P}=${DG(A)}`, `${Q2}=${DG(B)}`]), `$${ql}$`), a,
          easy: `$\\frac{${ql}}{\\sin${DG(B)}}=\\frac{${s}}{\\sin${DG(A)}}$ より $${ql}=\\frac{${s}\\sin${DG(B)}}{\\sin${DG(A)}}=${tx(v)}$`, easyCheck: 'last',
          // 座標で：底辺の両はしから角 A・B の半直線をのばし、交わりで三角形を作って長さをくらべる
          verify: () => { const T = triAng(A, B); return numOK(a, s / T.oP * T.oQ); },
        };
      },
      // 場面：川の向こうの木・屋根の部材。約の値も
      s3(r) {
        const A = r.pick([30, 45, 60]), Cc = r.pick([30, 45, 60, 90].filter(x => x !== A && A + x < 180)), B = 180 - A - Cc, s = r.pick([20, 40, 60, 80, 100]);
        const v = R.div(R.mul(rq(s), sinR(A)), sinR(Cc));
        const base = `川の向こうの木Cまでの距離を知りたい。こちらの岸の2点A、Bで、$\\mathrm{AB}=${s}\\,\\mathrm{m}$、$\\angle\\mathrm{CAB}=${DG(A)}$、$\\angle\\mathrm{CBA}=${DG(B)}$ をはかった。$\\mathrm{BC}$ は`;
        if (!R.isQ(v) && v[0].k !== 6 && r.chance(0.5)) {
          const kk = v[0].k, a = `$${apx(v, 1)}$`;
          return { q: `${base}何 m か。$\\sqrt{${kk}}=${APX[kk]}$ として小数第1位まで求めると □ m`, a, easyCheck: false,
            easy: `$\\angle\\mathrm{C}=${DG(Cc)}$、$\\frac{${s}\\sin${DG(A)}}{\\sin${DG(Cc)}}=${tx(v)}$、約 $${apx(v, 1)}$`, verify: () => apxOK(a, s * triAng(A, B).oP, 1) };
        }
        const a = `$${tx(v)}$`;
        return { q: `${base} □ m`, a, easy: `$\\angle\\mathrm{C}=180^{\\circ}-${DG(A)}-${DG(B)}=${DG(Cc)}$、$\\frac{${s}\\sin${DG(A)}}{\\sin${DG(Cc)}}=${tx(v)}$`, easyCheck: 'last',
          verify: () => numOK(a, s * triAng(A, B).oP) };
      },
      // わな：2辺と、そのあいだでない角（三角形が2つ）
      trap(r) {
        const [A, C1] = r.pick([[30, 45], [30, 60], [45, 60], [30, 90]].filter(x => x[1] !== 90)), aa = r.pick([2, 4, 5, 6, 10]);
        const c = R.div(R.mul(rq(aa), sinR(C1)), sinR(A)), sols = [C1, 180 - C1].filter(x => A + x < 180), ans = angAns(sols);
        const p = { q: triQ([`a=${aa}`, `c=${tx(c)}`, `A=${DG(A)}`], '$C$'), a: ans,
          // それぞれの C で、三角形が作れて、正弦定理が成り立つか
          verify: () => sols.every(C => { const B = 180 - A - C; return B > 0 && close(aa / Math.sin(rad(A)), R.val(c) / Math.sin(rad(C)), 1e-9); }) || '三角形が作れない' };
        return dest(p, '4-42', `2辺と、そのあいだでない角。正弦定理で $\\sin C=${tx(sinR(C1))}$ になり、$C$ は鋭角と鈍角の2つ（三角形が2つかける）`);
      },
    },
  });

  // ================================================================ 4-43
  M.add({
    id: '4-43', part: PART, chap: '4-7③', stars: 1,
    title: '外接円の半径は $2R=\\frac{a}{\\sin A}$',
    mark: '**外接円**の半径を聞かれていて、角と、その**向かいの辺**がわかっている。',
    futsu: ['3つの辺の垂直二等分線を引いて', '外接円の中心を作り、', '半径をものさしではかる。'],
    raku: ['$a=10$、$A=45^{\\circ}$', '$2R=\\frac{10}{\\sin45^{\\circ}}=10\\sqrt{2}$', '$R=5\\sqrt{2}$'],
    why: '正弦定理の比 $\\frac{a}{\\sin A}$ は、外接円の直径 $2R$ と同じ。直径を斜辺とする直角三角形を作ると、$a=2R\\sin A$ になるから（4-7③）。',
    caution: '$\\frac{a}{\\sin A}$ は直径 $2R$。半径はさらに2でわる。辺と角は、向かい合った組を使う。',
    counts: { s1: 7, s2: 4, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm', boxh: '10mm',
    fits(q) {
      if (!/外接円/.test(q)) return false;
      const t = triParse(q);
      if (!t) return true;
      return Object.keys(t.angs).some(X => t.sides[X.toLowerCase()] != null) || /R=/.test(q);
    },
    steps: {
      // 辺と向かいの角 → R
      s1(r) {
        const X = r.pick(LET), t = r.pick(SA), s = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), x = X.toLowerCase();
        const v = R.div(rq(s), R.mul(rq(2), sinR(t))), a = `$${tx(v)}$`;
        return {
          q: triQ([`${x}=${s}`, `${X}=${DG(t)}`], '外接円の半径 $R$'), a,
          easy: `$2R=\\frac{${s}}{\\sin${DG(t)}}=${tx(R.mul(rq(2), v))}$、$R=${tx(v)}$`, easyCheck: 'last',
          // 円周の上に B・C・A を置いて、弦 BC の長さと、A から見た角を計算し直す
          verify: () => { const Rr = R.val(v), B = [Rr * Math.cos(rad(-t)), Rr * Math.sin(rad(-t))], C = [Rr * Math.cos(rad(t)), Rr * Math.sin(rad(t))], A = [-Rr, 0];
            return (close(dist(B, C), s, 1e-9) && close(deg(angAt(B, A, C)), t, 1e-9)) || '外接円の半径が合わない'; },
        };
      },
      // R と角 → 辺、直径
      s2(r) {
        const X = r.pick(LET), t = r.pick(SA), x = X.toLowerCase();
        if (r.chance(0.5)) {
          const Rr = r.int(2, 10), v = R.mul(rq(2 * Rr), sinR(t)), a = `$${tx(v)}$`;
          return { q: `三角形ABCの外接円の半径が $R=${Rr}$ で、$${X}=${DG(t)}$ のとき、$${x}$`, a,
            easy: `$${x}=2R\\sin ${X}=${2 * Rr}\\sin${DG(t)}=${tx(v)}$`, easyCheck: 'last', verify: () => numOK(a, 2 * Rr * Math.sin(rad(t))) };
        }
        const s = r.pick([3, 4, 5, 6, 8, 9]), v = R.div(rq(s), sinR(t)), a = `$${tx(v)}$`;
        return { q: triQ([`${x}=${s}`, `${X}=${DG(t)}`], '外接円の直径'), a, easy: `$2R=\\frac{${s}}{\\sin${DG(t)}}=${tx(v)}$`, easyCheck: 'last',
          verify: () => numOK(a, s / Math.sin(rad(t))) };
      },
      // 正三角形・直角三角形・二等辺三角形
      s3(r) {
        const k = r.int(0, 2), s = r.int(2, 12);
        if (k === 0) {
          const v = R.div(rq(s), R.mul(rq(2), sinR(60))), a = `$${tx(v)}$`;
          return { q: `1辺が $${s}$ の正三角形の外接円の半径`, a, easy: `$2R=\\frac{${s}}{\\sin60^{\\circ}}$、$R=${tx(v)}$`, easyCheck: 'last',
            verify: () => numOK(a, dist([0, 0], [s / 2, s * Math.sqrt(3) / 6])) };
        }
        if (k === 1) {
          const [o, d, h] = r.pick(TRIPLES.filter(x => x[2] <= 25)), a = `$${fmt(h / 2)}$`;
          return { q: `3辺が $${o}$、$${d}$、$${h}$ の直角三角形の外接円の半径`, a, easy: `直角の向かいの辺が直径：$2R=\\frac{${h}}{\\sin90^{\\circ}}=${h}$、$R=${fmt(h / 2)}$`, easyCheck: 'last',
            verify: () => numOK(a, Math.hypot(o, d) / 2) };
        }
        const t = r.pick([120, 90, 60]), v = R.div(rq(s), R.mul(rq(2), sinR(t))), a = `$${tx(v)}$`;
        return { q: `$\\mathrm{AB}=\\mathrm{AC}$、$A=${DG(t)}$、$\\mathrm{BC}=${s}$ の二等辺三角形ABCの外接円の半径`, a,
          easy: `$2R=\\frac{${s}}{\\sin${DG(t)}}$、$R=${tx(v)}$`, easyCheck: 'last', verify: () => numOK(a, s / (2 * Math.sin(rad(t)))) };
      },
      // わな：角の向かいの辺がない（余弦定理で先に。4-44）
      trap(r) {
        const t = r.pick([60, 120]), [p, q, c] = r.pick(TRI[t]), [x, y, Z] = r.pick(ROT);
        const v = R.div(rq(c), R.mul(rq(2), sinR(t))), a = `$${tx(v)}$`;
        const p0 = { q: triQ(r.shuffle([`${x}=${p}`, `${y}=${q}`, `${Z}=${DG(t)}`]), '外接円の半径 $R$'), a, verify: () => numOK(a, c / (2 * Math.sin(rad(t)))) };
        return dest(p0, '4-43', `角 $${Z}$ の向かいの辺 $${Z.toLowerCase()}$ がまだない。余弦定理で $${Z.toLowerCase()}=${c}$ を出してから、$2R=\\frac{${c}}{\\sin${DG(t)}}$、$R=${tx(v)}$`);
      },
    },
  });

  // ================================================================ 4-44
  // 2辺 p、q と、そのあいだの角 t の向かいの辺（R）
  const cosLaw = (p, q, t) => R.sqrt(R.sub(rq(p * p + q * q), R.mul(rq(2 * p * q), cosR(t))));
  M.add({
    id: '4-44', part: PART, chap: '4-7④', stars: 1,
    title: '2辺とあいだの角なら、余弦定理で向かいの辺',
    mark: '**2辺**と、その**あいだの角**がわかっていて、のこりの**辺**を求める。',
    futsu: ['垂線を下ろして直角三角形に分け、', '三平方の定理を2回使う。'],
    raku: ['$a=3$、$b=5$、$C=120^{\\circ}$', '$c^{2}=9+25-30\\times\\left(-\\frac{1}{2}\\right)=49$', '$c=7$'],
    why: '余弦定理 $c^{2}=a^{2}+b^{2}-2ab\\cos C$ は、三平方の定理に、直角からのずれ $-2ab\\cos C$ を足した式。$C=90^{\\circ}$ なら三平方の定理にもどる（4-7④）。',
    caution: '鈍角の $\\cos$ は負なので、ひき算がたし算になる。$\\cos$ の角は、左の辺 $c$ の向かいで、$a$ と $b$ のあいだの角。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (/面積/.test(q)) return false;
      if (/池/.test(q)) return true;
      return between(triParse(q));
    },
    steps: {
      // 60°・120°・90°で、答えが整数
      s1(r) {
        const t = r.pick([60, 60, 120, 120, 90]), [p0, q0, c] = t === 90 ? r.pick(TRI90) : r.pick(TRI[t]), sw = r.chance(0.5), p = sw ? q0 : p0, q = sw ? p0 : q0;
        const [x, y, Z] = r.pick(ROT), z = Z.toLowerCase(), a = `$${c}$`, cv = tx(cosR(t)), cw = /^-/.test(cv) ? `\\left(${cv}\\right)` : cv;
        return {
          q: triQ([`${x}=${p}`, `${y}=${q}`, `${Z}=${DG(t)}`], `$${z}$`), a,
          easy: `$${z}^{2}=${p}^{2}+${q}^{2}-2\\times${p}\\times${q}\\times${cw}=${c * c}$、$${z}=${c}$`, easyCheck: 'last',
          verify: () => { const A = [q * Math.cos(rad(t)), q * Math.sin(rad(t))]; return numOK(a, dist(A, [p, 0])); },
        };
      },
      // 答えに √ が残る
      s2(r) {
        const t = r.pick([60, 120]), p = r.int(2, 9), q = r.int(2, 9), v = cosLaw(p, q, t);
        if (R.isQ(v)) return null;
        const [x, y, Z] = r.pick(ROT), z = Z.toLowerCase(), a = `$${tx(v)}$`, c2 = p * p + q * q + (t === 60 ? -p * q : p * q);
        return {
          q: triQ([`${x}=${p}`, `${y}=${q}`, `${Z}=${DG(t)}`], `$${z}$`), a,
          easy: `$${z}^{2}=${p * p}+${q * q}${t === 60 ? '-' : '+'}${p * q}=${c2}$、$${z}=${tx(v)}$`, easyCheck: 'last',
          verify: () => { const A = [q * Math.cos(rad(t)), q * Math.sin(rad(t))]; return numOK(a, dist(A, [p, 0])); },
        };
      },
      // 池をはさんだ2点、√ のある辺と 45°・30°
      s3(r) {
        if (r.chance(0.5)) {
          const t = r.pick([60, 120]), [p0, q0, c] = r.pick(TRI[t].filter(x => x[1] <= 10)), m = r.pick([10, 20]), a = `$${c * m}$`;
          return { q: `池をはさんだ2点A、Bの距離を知るために、点Cで $\\mathrm{CA}=${p0 * m}\\,\\mathrm{m}$、$\\mathrm{CB}=${q0 * m}\\,\\mathrm{m}$、$\\angle\\mathrm{ACB}=${DG(t)}$ をはかった。$\\mathrm{AB}$ は □ m`, a,
            easy: `$\\mathrm{AB}^{2}=${(p0 * m) ** 2}+${(q0 * m) ** 2}${t === 60 ? '-' : '+'}${p0 * q0 * m * m}=${(c * m) ** 2}$、$\\mathrm{AB}=${c * m}$`, easyCheck: 'last',
            verify: () => { const A = [p0 * m * Math.cos(rad(t)), p0 * m * Math.sin(rad(t))]; return numOK(a, dist(A, [q0 * m, 0])); } };
        }
        const t = r.pick([45, 135, 30, 150]), kk = t % 45 === 0 ? 2 : 3, m = r.int(1, 4), q = r.int(2, 7);
        const pR = R.s(m, 1, kk), c2 = R.sub(R.add(R.mul(pR, pR), rq(q * q)), R.mul(R.mul(rq(2 * q), pR), cosR(t)));
        if (!R.isQ(c2) || R.val(c2) <= 0) return null;
        const v = R.sqrt(c2), [x, y, Z] = r.pick(ROT), z = Z.toLowerCase(), a = `$${tx(v)}$`;
        return { q: triQ([`${x}=${tx(pR)}`, `${y}=${q}`, `${Z}=${DG(t)}`], `$${z}$`), a,
          easy: `$${z}^{2}=${tx(R.mul(pR, pR))}+${q * q}-2\\times${tx(pR)}\\times${q}\\times\\cos${DG(t)}=${tx(c2)}$、$${z}=${tx(v)}$`, easyCheck: 'last',
          verify: () => { const pv = R.val(pR), A = [q * Math.cos(rad(t)), q * Math.sin(rad(t))]; return numOK(a, dist(A, [pv, 0])); } };
      },
      // わな：あいだでない角（c の2次方程式。答えが2つ）
      trap(r) {
        const cand = [];
        for (let b = 3; b <= 24; b++) for (let c1 = 1; c1 < b - c1; c1++) { const c2 = b - c1, a2 = b * b - c1 * c2, a = Math.round(Math.sqrt(a2)); if (a * a === a2) cand.push([a, b, c1, c2]); }
        const [aa, b, c1, c2] = r.pick(cand), ans = `$${c1}$、$${c2}$`;
        const p = { q: triQ([`a=${aa}`, `b=${b}`, `A=60^{\\circ}`], '$c$'), a: ans,
          verify: () => [c1, c2].every(c => { const A = [0, 0], C = [b, 0], B = [c * Math.cos(rad(60)), c * Math.sin(rad(60))]; return close(dist(B, C), aa, 1e-9); }) || '三角形が作れない' };
        return dest(p, '4-44', `$A$ は $a$ と $b$ のあいだの角ではない。$${aa}^{2}=${b}^{2}+c^{2}-2\\times${b}\\times c\\cos60^{\\circ}$ を $c$ の2次方程式として解くと $c=${c1}$、$${c2}$（三角形が2つ）`);
      },
    },
  });

  // ================================================================ 4-45
  M.add({
    id: '4-45', part: PART, chap: '4-7④', stars: 1,
    title: '3辺から角は $\\cos C=\\frac{a^{2}+b^{2}-c^{2}}{2ab}$',
    mark: '**3辺**の長さがわかっていて、角（いちばん大きい角）を求める。',
    futsu: ['三角形を正確にかいて、', '分度器で角をはかる。'],
    raku: ['7、5、3：いちばん長い7の向かいの角', '$\\cos A=\\frac{25+9-49}{30}=-\\frac{1}{2}$', '$A=120^{\\circ}$（$\\cos$ が負なら鈍角）'],
    why: '余弦定理を $\\cos C$ について解いた形。$\\cos$ の値から、角は $0^{\\circ}$〜$180^{\\circ}$ でただ1つに決まる。いちばん長い辺の向かいが、いちばん大きい角（4-7④）。',
    caution: '分子では「向かいの辺の2乗」をひく。$\\cos$ が負なら鈍角、0なら直角、正なら鋭角。',
    counts: { s1: 8, s2: 5, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      const t = triParse(q);
      if (t && t.ns === 3) return true;
      return /肩Oから手Pまで|ひじの角|のうでで、\$\\mathrm\{OP\}=/.test(q);
    },
    steps: {
      // 整数の3辺で、60°・120°・90°の角
      s1(r) {
        const t = r.pick([60, 120, 120, 90]), [p, q, c] = t === 90 ? r.pick(TRI90) : r.pick(TRI[t]), [x, y, Z] = r.pick(ROT), z = Z.toLowerCase();
        const gs = { [x]: p, [y]: q, [z]: c }, a = `$${DG(t)}$`;
        return {
          q: triQ(['a', 'b', 'c'].map(s => `${s}=${gs[s]}`), `$${Z}$`), a,
          easy: `$\\cos ${Z}=\\frac{${p}^{2}+${q}^{2}-${c}^{2}}{2\\times${p}\\times${q}}=${tx(cosR(t))}$、$${Z}=${DG(t)}$`, easyCheck: 'last',
          verify: () => { const P = triPts(gs.a, gs.b, gs.c), V = { A: [P.B, P.A, P.C], B: [P.A, P.B, P.C], C: [P.A, P.C, P.B] }[Z]; return close(deg(angAt(...V)), t, 1e-6) || `角は ${deg(angAt(...V))}°`; },
        };
      },
      // いちばん大きい角は、鋭角・直角・鈍角のどれか
      s2(r) {
        let s;
        if (r.chance(0.2)) { const T = r.pick(TRI90); s = T.slice(); }
        else { s = [r.int(2, 10), r.int(2, 10), r.int(2, 12)].sort((p, q) => p - q); if (s[0] + s[1] <= s[2]) return null; }
        const d = s[0] ** 2 + s[1] ** 2 - s[2] ** 2, ans = d > 0 ? '鋭角' : d === 0 ? '直角' : '鈍角';
        const order = r.shuffle([0, 1, 2]), gs = { a: s[order[0]], b: s[order[1]], c: s[order[2]] };
        return {
          q: triQ(['a', 'b', 'c'].map(k => `${k}=${gs[k]}`), 'いちばん大きい角は（鋭角・直角・鈍角） □'), a: ans, easyCheck: false, key: 'k' + s.join(','),
          easy: `いちばん長い辺 $${s[2]}$ の向かいの角：$${s[0] * s[0]}+${s[1] * s[1]}-${s[2] * s[2]}=${d}$ が${d > 0 ? '正' : d === 0 ? '0' : '負'}`,
          verify: () => { const P = triPts(gs.a, gs.b, gs.c), big = Math.max(angAt(P.B, P.A, P.C), angAt(P.A, P.B, P.C), angAt(P.A, P.C, P.B)); const k = Math.abs(big - Math.PI / 2) < 1e-9 ? '直角' : big > Math.PI / 2 ? '鈍角' : '鋭角'; return k === ans || `${k} のはず`; },
        };
      },
      // √ のある辺（45°・135°・30°・150°）、ロボットのひじの角
      s3(r) {
        if (r.chance(0.4)) {
          const t = r.pick([60, 120, 90]), [p, q, c] = t === 90 ? r.pick([[3, 4, 5], [6, 8, 10]]) : r.pick(TRI[t === 60 ? 60 : 120].filter(x => x[1] <= 8)), m = 10;
          const a = `$${DG(t)}$`;
          return { q: `2つの関節のうでで、上のうでOEが $${p * m}$、下のうでEPが $${q * m}$、肩Oから手Pまでが $${c * m}$ のとき、ひじの角 $\\angle\\mathrm{OEP}$`, a,
            easy: `$\\cos\\angle\\mathrm{OEP}=\\frac{${(p * m) ** 2}+${(q * m) ** 2}-${(c * m) ** 2}}{2\\times${p * m}\\times${q * m}}=${tx(cosR(t))}$、$${DG(t)}$`, easyCheck: 'last',
            verify: () => { const P = triPts(p, c, q); return close(deg(angAt(P.C, P.B, P.A)), t, 1e-6) || 'まちがい'; } };
        }
        const t = r.pick([45, 135, 30, 150]), kk = t % 45 === 0 ? 2 : 3, m = r.int(1, 4), q = r.int(2, 7);
        const pR = R.s(m, 1, kk), c2 = R.sub(R.add(R.mul(pR, pR), rq(q * q)), R.mul(R.mul(rq(2 * q), pR), cosR(t)));
        if (!R.isQ(c2) || R.val(c2) <= 0) return null;
        const cR = R.sqrt(c2), [x, y, Z] = r.pick(ROT), z = Z.toLowerCase(), gs = { [x]: pR, [y]: rq(q), [z]: cR }, a = `$${DG(t)}$`;
        return {
          q: triQ(['a', 'b', 'c'].map(k => `${k}=${tx(gs[k])}`), `$${Z}$`), a,
          easy: `$\\cos ${Z}=\\frac{${tx(R.mul(pR, pR))}+${q * q}-${tx(c2)}}{2\\times${tx(pR)}\\times${q}}=${tx(cosR(t))}$、$${Z}=${DG(t)}$`, easyCheck: 'last',
          verify: () => { const P = triPts(R.val(gs.a), R.val(gs.b), R.val(gs.c)), V = { A: [P.B, P.A, P.C], B: [P.A, P.B, P.C], C: [P.A, P.C, P.B] }[Z]; return close(deg(angAt(...V)), t, 1e-6) || 'まちがい'; },
        };
      },
      // わな：角の比を辺の比にする（辺は sin の比。正弦定理）
      trap(r) {
        const [ratio, angs] = r.pick([['1:2:3', [30, 60, 90]], ['1:1:2', [45, 45, 90]], ['1:1:4', [30, 30, 120]]]);
        const s = angs.map(t => R.div(sinR(t), sinR(angs[0]))), ans = `$${s.map(x => tx(x)).join(':')}$`;
        const p = { q: `3つの角の比が $${ratio}$ の三角形の、辺の比（小さい順）は □`, a: ans,
          verify: () => { const got = strip(ans).split(':').map(x => M.evalMath(x, {})), w = angs.map(t => Math.sin(rad(t)) / Math.sin(rad(angs[0]))); return got.every((g, i) => close(g, w[i], 1e-9)) || '比が合わない'; } };
        return dest(p, '4-45', `辺の比は角の比ではない。角は $${angs.map(DG).join('$、$')}$ で、辺の比は $\\sin$ の比（正弦定理）：${ans}`);
      },
    },
  });

  // ================================================================ 4-46
  const fN = F => UN(F, 'N');
  M.add({
    id: '4-46', part: PART, chap: '4-7⑦', stars: 1,
    title: '合力は、三角形の中の角「$180^{\\circ}-$なす角」で余弦定理',
    mark: '2つの力の大きさと、力の**あいだの角**（なす角）がわかっていて、**合力**の大きさを求める。',
    futsu: ['力の矢印を正確にかいて平行四辺形を作り、', '対角線の長さをはかる。'],
    raku: ['$30\\,\\mathrm{N}$ と $40\\,\\mathrm{N}$、なす角 $60^{\\circ}$', '三角形の中の角は $180^{\\circ}-60^{\\circ}=120^{\\circ}$', '$R^{2}=900+1600+1200=3700$、$R=10\\sqrt{37}$'],
    why: '平行四辺形の半分の三角形で、2辺は2つの力、そのあいだの角は $180^{\\circ}-\\theta$（となり合う角の和は $180^{\\circ}$）。だから $R^{2}=F_{1}^{2}+F_{2}^{2}+2F_{1}F_{2}\\cos\\theta$（4-7⑦）。',
    caution: 'なす角をそのまま余弦定理に入れると、合力が片方の力より小さくなってしまう。同じ大きさ $F$ の2力が $120^{\\circ}$ なら、合力も $F$。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '20mm',
    fits(q) { return /合力/.test(q) && !/東へ|北へ|同じ向き/.test(q) && !degsIn(q).includes(90); },
    steps: {
      // 答えが整数（なす角 60°・120°）
      s1(r) {
        const th = r.pick([60, 120]), [p, q, c] = r.pick(TRI[th === 60 ? 120 : 60].filter(x => x[1] <= 10)), m = r.pick([1, 10]), sw = r.chance(0.5);
        const F1 = (sw ? q : p) * m, F2 = (sw ? p : q) * m, a = `$${c * m}$`, cs = th === 60 ? '+' : '-';
        return {
          q: `${fN(F1)} と ${fN(F2)} の力が、あいだの角 $${DG(th)}$ で1つの物を引く。合力は □ N`, a, key: `g${th}:${[F1, F2].sort((x, y) => x - y)}`,
          easy: `中の角 $${DG(180 - th)}$：$R^{2}=${F1 * F1}+${F2 * F2}${cs}${F1 * F2}=${(c * m) ** 2}$、$R=${c * m}$`, easyCheck: 'last',
          verify: () => { const x = F1 + F2 * Math.cos(rad(th)), y = F2 * Math.sin(rad(th)); return numOK(a, Math.hypot(x, y)); },
        };
      },
      // √ が残るもの、同じ大きさの2力
      s2(r) {
        if (r.chance(0.5)) {
          const F = r.pick([10, 20, 30, 40, 50]), th = r.pick([60, 120]), v = R.mul(rq(F), R.sqrt(R.add(rq(2), R.mul(rq(2), cosR(th))))), a = `$${tx(v)}$`;
          return { q: `どちらも ${fN(F)} の2つの力が、あいだの角 $${DG(th)}$ で1つの物を引く。合力は □ N`, a,
            easy: `$R^{2}=${F * F}+${F * F}+2\\times${F}\\times${F}\\times\\cos${DG(th)}$、$R=${tx(v)}$`, easyCheck: 'last',
            verify: () => numOK(a, Math.hypot(F + F * Math.cos(rad(th)), F * Math.sin(rad(th)))) };
        }
        const th = r.pick([60, 120]), F1 = r.int(2, 8) * 10, F2 = r.int(2, 8) * 10;
        if (F1 === F2) return null;
        const v = R.sqrt(R.add(rq(F1 * F1 + F2 * F2), R.mul(rq(2 * F1 * F2), cosR(th))));
        if (R.isQ(v)) return null;
        const a = `$${tx(v)}$`;
        return { q: `${fN(F1)} と ${fN(F2)} の力が、あいだの角 $${DG(th)}$ で1つの物を引く。合力は □ N`, a,
          easy: `中の角 $${DG(180 - th)}$：$R^{2}=${F1 * F1}+${F2 * F2}${th === 60 ? '+' : '-'}${F1 * F2}=${F1 * F1 + F2 * F2 + (th === 60 ? 1 : -1) * F1 * F2}$、$R=${tx(v)}$`, easyCheck: 'last',
          verify: () => numOK(a, Math.hypot(F1 + F2 * Math.cos(rad(th)), F2 * Math.sin(rad(th)))) };
      },
      // 場面（2人で引く・ロープ・犬ぞり）。約の値も
      s3(r) {
        const who = r.pick(['2人で、ひもをつけた荷物を', '2本のロープで、ボートを', '2頭の犬が、そりを']);
        if (r.chance(0.5)) {
          const F = r.pick([10, 20, 30, 40, 50, 60]), v = R.mul(rq(F), R.sqrt(rq(3))), a = `$${apx(v, 1)}$`;
          return { q: `${who}どちらも ${fN(F)} の力で引く。2つの力のあいだの角が $60^{\\circ}$ のとき、合力を $\\sqrt{3}=1.73$ として小数第1位まで求めると □ N`, a, easyCheck: false,
            easy: `中の角 $120^{\\circ}$：$R^{2}=3\\times${F * F}$、$R=${tx(v)}$、約 $${apx(v, 1)}$`, verify: () => apxOK(a, Math.hypot(F + F * Math.cos(rad(60)), F * Math.sin(rad(60))), 1) };
        }
        const th = r.pick([60, 120]), [p, q, c] = r.pick(TRI[th === 60 ? 120 : 60].filter(x => x[1] <= 8)), F1 = p * 10, F2 = q * 10, a = `$${c * 10}$`;
        return { q: `${who} ${fN(F1)} と ${fN(F2)} の力で引く。2つの力のあいだの角が $${DG(th)}$ のとき、合力は □ N`, a, key: `g${th}:${[F1, F2].sort((x, y) => x - y)}`,
          easy: `中の角 $${DG(180 - th)}$：$R^{2}=${F1 * F1}+${F2 * F2}${th === 60 ? '+' : '-'}${F1 * F2}=${(c * 10) ** 2}$、$R=${c * 10}$`, easyCheck: 'last',
          verify: () => numOK(a, Math.hypot(F1 + F2 * Math.cos(rad(th)), F2 * Math.sin(rad(th)))) };
      },
      // わな：直角（三平方。第5部 4-63）、同じ向き（たすだけ）
      trap(r) {
        const [p, q, c] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
        if (r.chance(0.6)) {
          const a = `$${c}$`, p0 = { q: `東へ ${fN(p)}、北へ ${fN(q)} の力で、1つの物を引く。合力は □ N`, a, verify: () => numOK(a, Math.hypot(p, q)) };
          return dest(p0, '4-46', `東と北で、なす角は $90^{\\circ}$。$\\cos90^{\\circ}=0$ なので三平方の定理だけ：$\\sqrt{${p}^{2}+${q}^{2}}=${c}$（5部のわざ 4-63）`);
        }
        const F1 = p * 10, F2 = q * 10, a = `$${F1 + F2}$`;
        return dest({ q: `${fN(F1)} と ${fN(F2)} の力で、同じ向きに1つの物を引く。合力は □ N`, a, verify: () => numOK(a, Math.hypot(F1 + F2, 0)) },
          '4-46', `同じ向きなら三角形はできない。そのままたす：$${F1}+${F2}=${F1 + F2}$`);
      },
    },
  });

  // ================================================================ 4-47
  const ARM = 'うで（肩Oが原点）で、';
  const armQ = (gs, ask) => `${ARM}${gs.map(g => `$${g}$`).join('、')}：${ask}`;
  // ひじ E と手 P（R）
  function armPts(L1, L2, t1, t2) {
    const E = [R.mul(rq(L1), cosR(t1)), R.mul(rq(L1), sinR(t1))];
    const P = [R.add(E[0], R.mul(rq(L2), cosR(t1 + t2))), R.add(E[1], R.mul(rq(L2), sinR(t1 + t2)))];
    return { E, P };
  }
  // 別の道すじ：ひじの位置で回して、下のうでの先を出す（回転の式）
  function armNum(L1, L2, t1, t2) {
    const c = Math.cos(rad(t1)), s = Math.sin(rad(t1)), E = [L1 * c, L1 * s];
    const u = [L2 * Math.cos(rad(t2)), L2 * Math.sin(rad(t2))];   // 上のうでの向きを x 軸にしたときの下のうで
    return { E, P: [E[0] + u[0] * c - u[1] * s, E[1] + u[0] * s + u[1] * c] };
  }
  // θ1・θ2 の組（和が 0°〜180° で、30° か 45° の倍数）
  function armAngles(r, need2) {
    const t1 = r.pick([0, 30, 45, 60, 90]), t2 = r.pick(need2 ? [30, 45, 60, 90, 120] : [0, 30, 45, 60, 90, 120]), s = t1 + t2;
    if (s > 180 || (s % 30 && s % 45)) return null;
    return [t1, t2];
  }
  function armFig(L1, L2, t1, t2) {
    const N = armNum(L1, L2, t1, t2), xs = [0, N.E[0], N.P[0]], ys = [0, N.E[1], N.P[1]];
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    const k = Math.min(8 / (L1 + L2), w > 1e-9 ? 9 / w : 99, h > 1e-9 ? 3.8 / h : 99);
    const O = [0, 0], E = [N.E[0] * k, N.E[1] * k], P = [N.P[0] * k, N.P[1] * k];
    const x0 = Math.min(0, E[0], P[0]) - 1.2, x1 = Math.max(0, E[0], P[0]) + 1.4, y1 = Math.max(E[1], P[1]) + 1.2;
    const unit = (A, B) => { const L = dist(A, B); return [(B[0] - A[0]) / L, (B[1] - A[1]) / L]; };
    const items = [['axes', x0, x1, -0.9, y1], ['seg', O, E, { thick: true }], ['seg', E, P, { thick: true }], ['dot', O], ['dot', E], ['dot', P]];
    // ひじの名前：2本のうでの外がわへ
    const u1 = unit(E, O), u2 = unit(E, P);
    let b = [-(u1[0] + u2[0]), -(u1[1] + u2[1])];
    if (Math.hypot(...b) < 0.2) b = [-u2[1], u2[0]];
    const bl = Math.hypot(...b);
    items.push(['label', [E[0] + b[0] / bl * 0.75, E[1] + b[1] / bl * 0.75], 'E', 'c']);
    const u3 = unit(E, P);
    items.push(['label', [P[0] + u3[0] * 0.75, P[1] + u3[1] * 0.75], 'P', 'c']);
    // 長さのラベル：線分の右がわ（時計まわりの向き）か、左がわ
    const lab = (A, B, t, sgn) => { const u = unit(A, B), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]; return ['label', [m[0] + sgn * u[1] * 0.7, m[1] - sgn * u[0] * 0.7], t, 'c']; };
    items.push(lab(O, E, String(L1), -1), lab(E, P, String(L2), -1));   // θ1 の角のしるしは OE の右下、θ2 は EP の右がわにあるので、長さは左がわに
    if (t1 > 0) items.push(['angle', [1, 0], O, E, `$${DG(t1)}$`, 1.0]);
    if (t2 > 0) { const ext = [E[0] + 1.8 * Math.cos(rad(t1)), E[1] + 1.8 * Math.sin(rad(t1))]; items.push(['seg', E, ext, { dash: true }], ['angle', ext, E, P, `$${DG(t2)}$`, 0.8]); }
    return { s: 4.5, pad: 0.6, items };
  }
  M.add({
    id: '4-47', part: PART, chap: '4-7⑥・4-0③', stars: 1,
    title: '2本のうでの手の位置は、角をたしてから $\\cos$・$\\sin$',
    mark: '**2つの関節**のうで（長さ $L_{1}$、$L_{2}$、角 $\\theta_{1}$、$\\theta_{2}$）で、ひじと手の**座標**を求める。',
    futsu: ['方眼にうでを大きくかいて、', '手の位置を目もりで読む。', '$\\theta_{2}$ を $x$ 軸からの角とまちがえる。'],
    raku: ['ひじ $\\mathrm{E}(40\\cos30^{\\circ},\\ 40\\sin30^{\\circ})=(20\\sqrt{3},\\ 20)$', '下のうでの向き：$30^{\\circ}+90^{\\circ}=120^{\\circ}$', '手はひじに $(30\\cos120^{\\circ},\\ 30\\sin120^{\\circ})$ をたす'],
    why: '$\\theta_{2}$ は、上のうでをまっすぐのばした向きからはかった角。$x$ 軸から見た下のうでの向きは $\\theta_{1}+\\theta_{2}$。ひじからその向きに $L_{2}$ 進むと手（4-7⑥）。',
    caution: '$\\theta_{1}+\\theta_{2}$ が $90^{\\circ}$ をこえると $\\cos$ が負になり、手はひじより左に出る。',
    counts: { s1: 6, s2: 2, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '34mm', s2: '34mm', s3: '34mm', trap: '14mm' },
    fits(q) { return /うで/.test(q) && /座標/.test(q); },
    steps: {
      // ひじの座標、まっすぐのばしたうでの手
      s1(r) {
        const L1 = r.pick([20, 30, 40, 50, 60]), t1 = r.pick([30, 45, 60, 90, 120]);
        if (r.chance(0.6)) {
          const { E } = armPts(L1, 0, t1, 0), a = `$${PT(E[0], E[1])}$`;
          return { q: armQ([`L_{1}=${L1}`, `\\theta_{1}=${DG(t1)}`], 'ひじEの座標'), a, easyCheck: false,
            easy: `$(${L1}\\cos${DG(t1)},\\ ${L1}\\sin${DG(t1)})$`, verify: () => { const N = armNum(L1, 0, t1, 0); return ptOK(a, N.E[0], N.E[1]); } };
        }
        const L2 = r.pick([10, 20, 30]), { P } = armPts(L1, L2, t1, 0), a = `$${PT(P[0], P[1])}$`;
        return { q: armQ([`L_{1}=${L1}`, `L_{2}=${L2}`, `\\theta_{1}=${DG(t1)}`, `\\theta_{2}=0^{\\circ}`], '手Pの座標'), a, easyCheck: false,
          easy: `まっすぐなので長さ $${L1 + L2}$：$(${L1 + L2}\\cos${DG(t1)},\\ ${L1 + L2}\\sin${DG(t1)})$`,
          verify: () => { const N = armNum(L1, L2, t1, 0); return ptOK(a, N.P[0], N.P[1]); } };
      },
      // 手の座標（角をたしてから）
      s2(r) {
        const ang = armAngles(r, true);
        if (!ang) return null;
        const [t1, t2] = ang, L1 = r.pick([20, 30, 40, 50]), L2 = r.pick([10, 20, 30]);
        const { P } = armPts(L1, L2, t1, t2), a = `$${PT(P[0], P[1])}$`;
        return { q: armQ([`L_{1}=${L1}`, `L_{2}=${L2}`, `\\theta_{1}=${DG(t1)}`, `\\theta_{2}=${DG(t2)}`], '手Pの座標'), a, easyCheck: false,
          easy: `下のうでの向き $${DG(t1 + t2)}$：$(${L1}\\cos${DG(t1)}+${L2}\\cos${DG(t1 + t2)},\\ ${L1}\\sin${DG(t1)}+${L2}\\sin${DG(t1 + t2)})$`,
          verify: () => { const N = armNum(L1, L2, t1, t2); return ptOK(a, N.P[0], N.P[1]); } };
      },
      // 図：うでの形。約の値も
      s3(r) {
        const ang = armAngles(r, true);
        if (!ang) return null;
        const [t1, t2] = ang, L1 = r.pick([30, 40, 50]), L2 = r.pick([20, 30]);
        // 図で、うでが軸に重ならないもの（θ1 は 30°〜60°、手が y 軸から少しはなれる）
        // 図で、うでの曲がりが見やすく、手が y 軸からはなれる組
        if (![[30, 60], [30, 90], [30, 120], [45, 90]].some(([u, v]) => u === t1 && v === t2) || Math.abs(armNum(L1, L2, t1, t2).P[0]) < 0.2 * (L1 + L2)) return null;
        const { P } = armPts(L1, L2, t1, t2), fig = armFig(L1, L2, t1, t2), N = armNum(L1, L2, t1, t2);
        const gs = [`L_{1}=${L1}`, `L_{2}=${L2}`, `\\theta_{1}=${DG(t1)}`, `\\theta_{2}=${DG(t2)}`];
        const ks = [...new Set([...P[0], ...P[1]].map(t => t.k))].filter(k => k > 1);
        if (ks.length === 1 && r.chance(0.5)) {
          const a = `$${PT(apx(P[0], 1), apx(P[1], 1))}$`;
          return { q: `図の${armQ(gs, `$\\sqrt{${ks[0]}}=${APX[ks[0]]}$ として、手Pの座標を小数第1位まで`).replace('（肩Oが原点）', '')}`, a, fig, easyCheck: false,
            easy: `$${PT(P[0], P[1])}$、約 $${PT(apx(P[0], 1), apx(P[1], 1))}$`,
            verify: () => { const v = coordVals(a); return (v && Math.abs(v[0] - N.P[0]) < 0.06 + Math.abs(N.P[0]) * 0.0016 && Math.abs(v[1] - N.P[1]) < 0.06 + Math.abs(N.P[1]) * 0.0016) || '約の値が遠い'; } };
        }
        const a = `$${PT(P[0], P[1])}$`;
        return { q: `図の${armQ(gs, '手Pの座標').replace('（肩Oが原点）', '')}`, a, fig, easyCheck: false,
          easy: `下のうでの向き $${DG(t1 + t2)}$：ひじ $${PT(armPts(L1, L2, t1, t2).E[0], armPts(L1, L2, t1, t2).E[1])}$ にたす`,
          verify: () => ptOK(a, N.P[0], N.P[1]) };
      },
      // わな：手の位置から角（逆。3辺から余弦定理。4-45）
      trap(r) {
        const t = r.pick([60, 90, 120]), [p, q, c] = t === 90 ? r.pick([[3, 4, 5], [6, 8, 10]]) : r.pick(TRI[t].filter(x => x[1] <= 8)), sw = r.chance(0.5);
        const L1 = (sw ? q : p) * 10, L2 = (sw ? p : q) * 10, d = c * 10, th2 = 180 - t, a = `$${DG(th2)}$`;
        const p0 = { q: `$L_{1}=${L1}$、$L_{2}=${L2}$ のうでで、$\\mathrm{OP}=${d}$ にする $\\theta_{2}$（$\\theta_{2}>0^{\\circ}$）`, a,
          verify: () => { const N = armNum(L1, L2, 0, th2); return close(Math.hypot(...N.P), d, 1e-9) || '手までの長さが合わない'; } };
        return dest(p0, '4-47', `手の位置から角を求める（逆）。三角形OEPの3辺 $${L1}$、$${L2}$、$${d}$ から余弦定理で $\\angle\\mathrm{OEP}=${DG(t)}$ → $\\theta_{2}=180^{\\circ}-${DG(t)}=${DG(th2)}$`);
      },
    },
  });

  // ================================================================ 4-94
  // 2本のロープのつり合い：左右の力（R）
  const hang = (W, a, b) => ({ L: R.div(R.mul(W, sinR(b)), sinR(a + b)), R: R.div(R.mul(W, sinR(a)), sinR(a + b)) });
  // 別の道すじ：横向きの力のつり合いと、たて向きの力のつり合い（成分）
  function hangNum(W, a, b) {
    const sa = Math.sin(rad(a)), ca = Math.cos(rad(a)), sb = Math.sin(rad(b)), cb = Math.cos(rad(b));
    const TLv = W / (ca + sa * cb / sb);
    return { L: TLv, R: TLv * sa / sb };
  }
  const ropeTxt = (a, b) => (a === b ? `2本とも真上から $${DG(a)}$ かたむいている`
    : `左のロープは真上から $${DG(a)}$、右のロープは真上から $${DG(b)}$ かたむいている${a === 90 ? '（左のロープは水平）' : b === 90 ? '（右のロープは水平）' : ''}`);
  M.add({
    id: '4-94', part: PART, chap: '4-7⑦', stars: 1,
    title: '3つの力のつり合いは正弦定理',
    mark: '2本のロープで物を**つるして**止まっている。ロープが真上からかたむいた角がわかっていて、ロープの力を求める。',
    futsu: ['ロープの力を横向きとたて向きに分けて、', '2つの式の連立方程式を解く。'],
    raku: ['$\\frac{T_{\\mathrm{L}}}{\\sin\\theta_{\\mathrm{R}}}=\\frac{T_{\\mathrm{R}}}{\\sin\\theta_{\\mathrm{L}}}=\\frac{W}{\\sin(\\theta_{\\mathrm{L}}+\\theta_{\\mathrm{R}})}$', '$30^{\\circ}$・$60^{\\circ}$、$W=98$：$\\frac{T_{\\mathrm{L}}}{\\sin60^{\\circ}}=\\frac{98}{\\sin90^{\\circ}}$', '$T_{\\mathrm{L}}=49\\sqrt{3}$'],
    why: '2本のロープの力と重力 $W$ の矢印をつなぐと、三角形ができる（力の三角形）。$T_{\\mathrm{L}}$ の向かいの角は $\\theta_{\\mathrm{R}}$、$W$ の向かいの角は $180^{\\circ}-(\\theta_{\\mathrm{L}}+\\theta_{\\mathrm{R}})$。角と向かいの辺の組なので正弦定理（4-7⑦）。',
    caution: '$T_{\\mathrm{L}}$ の向かいは、自分の角 $\\theta_{\\mathrm{L}}$ ではなく、反対のロープの角 $\\theta_{\\mathrm{R}}$。真上に近いロープのほうが、大きな力で引く。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: '20mm', boxh: '10mm',
    fits(q) { return /つるす/.test(q); },
    steps: {
      // 左右同じ角
      s1(r) {
        const W = r.pick([30, 40, 60, 90, 98, 100, 120]), t = r.pick([30, 45, 60]), T = hang(rq(W), t, t).L, a = `$${tx(T)}$`;
        return {
          q: `重力 $W=${W}\\,\\mathrm{N}$ の物を2本のロープでつるす。${ropeTxt(t, t)}とき、ロープ1本の力は □ N`, a,
          easy: `$T=\\frac{${W}\\sin${DG(t)}}{\\sin${DG(2 * t)}}=${tx(T)}$`, easyCheck: 'last',
          verify: () => numOK(a, hangNum(W, t, t).L),
        };
      },
      // 左右でちがう角
      s2(r) {
        const [ta, tb] = r.pick([[30, 60], [60, 30], [45, 90], [90, 45], [30, 90], [60, 90]]), W = r.pick([20, 40, 49, 60, 98, 100]);
        const left = r.chance(0.5), T = hang(rq(W), ta, tb)[left ? 'L' : 'R'], a = `$${tx(T)}$`, nm = left ? TL : TR;
        return {
          q: `重力 $W=${W}\\,\\mathrm{N}$ の物を2本のロープでつるす。${ropeTxt(ta, tb)}。${left ? '左' : '右'}のロープの力 $${nm}$ は □ N`, a,
          easy: `$${nm}=\\frac{${W}\\sin${DG(left ? tb : ta)}}{\\sin${DG(ta + tb)}}=${tx(T)}$`, easyCheck: 'last',
          verify: () => numOK(a, hangNum(W, ta, tb)[left ? 'L' : 'R']),
        };
      },
      // 約の値：問題の文の sin の値で（30°と45°。教科書 4-7 の例題）、√ の値で
      s3(r) {
        if (r.chance(0.55)) {
          const m = r.pick([5, 10, 20]), W = 9.8 * m, left = r.chance(0.5), sv = left ? 0.707 : 0.5;
          const val = round(W * sv / 0.966, 1), a = `$${val.toFixed(1)}$`;
          return { q: `質量 ${UN(m, 'kg')} の物（重力 ${UN(fmt(W), 'N')}）を2本のロープでつるす。左は真上から $30^{\\circ}$、右は $45^{\\circ}$ かたむいている。$\\sin45^{\\circ}=0.707$、$\\sin75^{\\circ}=0.966$ として、${left ? '左' : '右'}のロープの力を小数第1位まで求めると □ N`, a, easyCheck: false,
            easy: `$\\frac{${fmt(W)}\\times${left ? '0.707' : '0.5'}}{0.966}$、約 $${(W * sv / 0.966).toFixed(2)}$`, verify: () => apxOK(a, hangNum(W, 30, 45)[left ? 'L' : 'R'], 1) };
        }
        const W = r.pick([30, 40, 60, 80, 100]), t = r.pick([30, 45]), T = hang(rq(W), t, t).L, kk = T[0].k, a = `$${apx(T, 1)}$`;
        return { q: `重力 $W=${W}\\,\\mathrm{N}$ の物を2本のロープでつるす。${ropeTxt(t, t)}。$\\sqrt{${kk}}=${APX[kk]}$ として、ロープ1本の力を小数第1位まで求めると □ N`, a, easyCheck: false,
          easy: `$\\frac{${W}\\sin${DG(t)}}{\\sin${DG(2 * t)}}=${tx(T)}$、約 $${apx(T, 1)}$`, verify: () => apxOK(a, hangNum(W, t, t).L, 1) };
      },
      // わな：つるすのではなく、2本で引く（合力。4-46）
      trap(r) {
        const th = r.pick([60, 120]), [p, q, c] = r.pick(TRI[th === 60 ? 120 : 60].filter(x => x[1] <= 8)), F1 = p * 10, F2 = q * 10, a = `$${c * 10}$`;
        const p0 = { q: `2本のロープで荷物を引く。ロープの力は ${fN(F1)} と ${fN(F2)} で、2本のあいだの角は $${DG(th)}$。合力は □ N`, a,
          verify: () => numOK(a, Math.hypot(F1 + F2 * Math.cos(rad(th)), F2 * Math.sin(rad(th)))) };
        return dest(p0, '4-94', `つり合いではなく、2つの力を合わせる（合力）。三角形の中の角は $180^{\\circ}-${DG(th)}=${DG(180 - th)}$ で余弦定理：$${c * 10}$`);
      },
    },
  });
})(globalThis.MONDAI);

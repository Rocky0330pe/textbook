/* 問題集 第8巻　第3部 ベクトル場と重積分（わざ 8-30〜8-44、8-92）　組 c
 * 書き方は v8/README.md → v6/README.md・v5/README.md。文は教科書 第8巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 8-5・8-6 の数・ことば・記号にそろえる（ベクトル場 $\vec F(x,\ y)$、矢印、大きさ、左回り・右回り、うず、流線・力線、点電荷、
 *   軸を回して見た成分 $R^{\mathsf T}\vec F$、面密度 $\sigma$、重積分 $\iint_D$、内側の積分・外側の積分、たて線・横線、極座標のタイル $r\,\dd r\,\dd\theta$、
 *   細い輪 $2\pi r\,\dd r$、重心、断面二次モーメント、切り口の面積 $A(z)$、球座標 $r^2\sin\theta\,\dd r\,\dd\theta\,\dd\varphi$）。場合分けの表の記号（A〜H）は使わない（V-5）。
 * 検算：重積分は calc（defint2・polar）、成分の組は calc（vec）か verify、流線の式は verify（点を通ることと、線の向きが矢印の向きと同じこと）、
 *   ことばの答え・近似の答えは verify(p)。どれも、問題を作った計算とは別の道すじ（文に書いた式を evalMath で読む、数の積分）でくらべる。
 * 図は 8-31・8-38 のステップ3だけ（矢印の場・三角形の範囲。K-2）。表（p.table）は 8-44 のステップ3だけ。
 * 左ページの「楽な形」と目印の例の数（と、教科書 8-5・8-6 の例題・じぶんでとこう・章末問題の数）は、同じ見開きの問題に出さない（O-2・S-2・U-2。BAN）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」。S-7）を書く（dest。N-3）。
 * 近似値は目録の一覧の値（$\cos30^{\circ}=0.866$、$\pi=3.14$、$g=9.8$、$k=9.0\times10^9$）を文に書き、くいちがう組は出さない（O-4・S-3）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(String(t), vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                         // 0.30000000004 → 0.3
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const RAD = Math.PI / 180;
  // 形を順に回す（出せたときだけ次へ進める）：const [k, ok] = alt(r, 'key', 2); … return ok({ … })
  function alt(r, key, n) { const d = r.alts || (r.alts = {}); if (d[key] == null) d[key] = r.int(0, n - 1); return [d[key] % n, p => { if (p) d[key]++; return p; }]; }
  // 分数 f の、正確な小数（分母が 2 と 5 だけのとき）。そうでなければ null
  function dec(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1;
    while (k < 8 && (Math.abs(n) * p) % d !== 0) { k++; p *= 10; }
    if ((Math.abs(n) * p) % d !== 0) return null;
    const N = String(Math.abs(n) * p / d).padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  const fq = f => F.tex(f);                                            // 分数 → 整数か \frac
  const fx = f => (f[1] === 1 ? String(f[0]) : dec(f) || F.tex(f));   // 分数 → 整数・小数・\frac
  const powF = (f, n) => { let o = fr(1); for (let k = 0; k < n; k++) o = F.mul(o, f); return o; };
  const D = t => F.fromDec(String(t));                                 // '0.25' → [1, 4]
  const par = v => (String(v).startsWith('-') ? `(${v})` : String(v));  // マイナスはかっこごと
  const P2 = (a, b) => `(${a},\\ ${b})`;
  const P3 = (a, b, c) => `(${a},\\ ${b},\\ ${c})`;
  const sgn = (v, first) => (v < 0 ? `-${-v}` : (first ? `${v}` : `+${v}`));
  // √n を「k√m」に（n は正の整数）
  function sqrtParts(n) { let k = 1, m = n; for (let f = 2; f * f <= m; f++) while (m % (f * f) === 0) { m /= f * f; k *= f; } return [k, m]; }
  const sqrtTeX = n => { const [k, m] = sqrtParts(n); return m === 1 ? String(k) : (k === 1 ? '' : k) + `\\sqrt{${m}}`; };
  // π をふくむ数（分数 c）× π の TeX：「\frac{81\pi}{2}」「18\pi」「\pi」
  const piTeX = c => { const [n, d] = c, sg = n < 0 ? '-' : '', a = Math.abs(n), t = (a === 1 ? '' : a) + '\\pi'; return d === 1 ? sg + t : `${sg}\\frac{${t}}{${d}}`; };
  // 10 のべき：270000 → 2.7\times10^{5}（小数第3位まで）
  function sci(v) {
    if (v === 0) return '0';
    const e = Math.floor(Math.log10(Math.abs(v)) + 1e-12), m = +(v / Math.pow(10, e)).toFixed(3);
    return `${fmt(m)}\\times10^{${e}}`;
  }
  // 同じ見開き（同じ乱数の物 r）で、同じ答えを lim 回より多く出さない（U-3）。アプリで同じわざを多く出すとき（20問をこえたら）は、よけない
  function ansOK(r, id, a, lim, key) {
    const d = r.ansC || (r.ansC = {}), m = d[id] || (d[id] = new Map()), n = d[id + '#'] || 0, s = m.get(a) || new Set();
    if (key != null && s.has(key)) return true;
    if (n < 20 && s.size >= (lim || 1)) return false;
    s.add(key != null ? key : Symbol()); m.set(a, s); d[id + '#'] = n + 1;
    return true;
  }
  // わざの登録：1つのステップに同じ答えを3つ出さない（U-3）。楽な形は、ことわりがなければ値をくらべない（途中の値を書くので）
  //   banV：左ページの例と教科書の例題・じぶんでとこう・章末問題の答え（数か成分の組）。同じ見開きの問題の答えにしない（U-2「例と同じ答え」）
  //   banA：同じく、答えの文字そのもの（流線の式など）
  function add(def) {
    const banHit = p => {
      if (def.banA && def.banA.includes(String(p.a))) return true;
      if (!def.banV) return false;
      const t = (String(p.a).match(/\$[^$]*\$/) || [''])[0], vec = M.readVec(t);
      if (vec) { const v = vec.map(x => ev(x)); return def.banV.some(b => Array.isArray(b) && b.length === v.length && b.every((x, i) => near(x, v[i], 1e-9))); }
      const n = ev(unitless(t)); return n != null && def.banV.some(b => typeof b === 'number' && near(b, n, 1e-9));
    };
    for (const k of ['s1', 's2', 's3', 'trap']) {
      const f = def.steps[k]; if (!f) continue;
      def.steps[k] = r => {
        const p = f(r); if (!p) return p;
        if (p.easyCheck == null) p.easyCheck = false;
        if (banHit(p)) return null;
        return ansOK(r, def.id + k, String(p.a), 2, p.key || p.q) ? p : null;
      };
    }
    M.add(def);
  }
  // 1次式・多項式の TeX（係数1は書かない。0の項は書かない）。terms = [[係数, 文字の部分], …]（文字の部分 '' は定数）
  function poly(terms) {
    let o = '';
    for (const [c0, m] of terms) {
      const c = typeof c0 === 'number' ? c0 : F.val(c0);
      if (c === 0) continue;
      const a = Math.abs(c), cs = typeof c0 === 'number' ? fmt(a) : fx([Math.abs(c0[0]), c0[1]]);
      const body = m ? (a === 1 ? '' : cs) + m : cs;
      o += (o ? (c < 0 ? '-' : '+') : (c < 0 ? '-' : '')) + body;
    }
    return o || '0';
  }
  const lin2 = (a, b) => poly([[a, 'x'], [b, 'y']]);
  // 答えの文から数を取り出す（単位 \,\mathrm{…} は除く。「＝」の左は除く）
  const unitless = t => strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '');
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(unitless(t)));
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length === 1 && near(n[0], v, tol)) || `答え ${p.a} が ${fmt(v)} でない`; };
  // 答えの成分の組をくらべる
  //   abs を渡すと、ちがいの大きさ（丸めた答えなら 0.005 など）でくらべる
  function vecIs(a, want, tol, abs) {
    const t = (String(a).match(/\$[^$]*\$/) || [''])[0], got = M.readVec(t);
    if (!got || got.length !== want.length) return `答え ${a} が読めない`;
    for (let k = 0; k < want.length; k++) {
      const g = ev(got[k]);
      if (abs ? !(g != null && Math.abs(g - want[k]) <= abs) : !near(g, want[k], tol || 1e-9)) return `答え ${a} の ${k + 1} つめが ${fmt(want[k])} でない`;
    }
    return true;
  }
  const vecTeX = v => `(${v.join(',\\ ')})`;

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部・巻のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(8).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 3 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 8-30
  // 1次の場 (ax+by, cx+dy) を [a, b, c, d] で。例（目録・教科書 8-5 例題1・じぶんでとこう・章末問題1・見わけよう）の場はよける
  const BAN30 = new Set(['1,2,1,-1', '1,-1,1,1', '1,1,-1,1', '2,-1,1,0', '1,-1,2,0']);
  // 場の成分の項の候補（2次まで）。[文字の部分, 値の関数]
  const MONO2 = ['x^2', 'xy', 'y^2', 'x', 'y', ''];             // ならべる順（2次の項が先）
  const MONO3 = ['x^2', 'z^2', 'xy', 'yz', 'xz', 'x', 'y', 'z', ''];
  // 同じ見開き（s1・s2）で、符号を変えただけ・何倍かしただけの1次の場を2回使わない（R1-18・Z-2）。使いきったら、よけない
  function fresh30(r, c) {
    const g = c.reduce((a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }, 0) || 1;
    const s = Math.sign(c.find(v => v !== 0) || 1), k = c.map(v => v / g * s).join(',');
    const u = r.s30 || (r.s30 = new Set());
    if (u.has(k) && u.size < 30) return false;
    u.add(k); return true;
  }
  function randComp(r, monos, nonlin) {
    const n = r.int(1, 2), ms = r.shuffle(monos).slice(0, n).sort((a, b) => monos.indexOf(a) - monos.indexOf(b)), out = ms.map(m => [r.intNot(-3, 3, v => v === 0), m]);
    if (nonlin && !ms.some(m => /\^|xy|yz|xz/.test(m))) return null;
    return out;
  }
  add({
    id: '8-30', part: 3, chap: '8-5①⑤ 例題1', stars: 1,
    banV: [[3, 0], [0, 3], [4, -2], [1, 1], [-1, 1], [0, 2], [1, -1], [2, 0], [2, 1], [-1, 0], 2 * Math.sqrt(5), Math.sqrt(5), Math.SQRT2, 3, 2],
    title: '場の矢印は、場所を式に入れて出す（場所と矢印を取りちがえない）。大きさは三平方',
    mark: '$\\vec F(x,\\ y)=(\\cdots,\\ \\cdots)$ と「点 □ での矢印」「矢印の大きさ」。',
    futsu: ['表計算の A 列に $x$、B 列に $y$、', 'C 列・D 列に $F_x$、$F_y$ の式を入れて', 'コピーし、その点の行を読む。', '大きさは E 列に SQRT の式。'],
    raku: ['$\\vec F=(x+2y,\\ x-y)$、点 $(1,\\ 1)$', '→ $(1+2,\\ 1-1)=(3,\\ 0)$、大きさ3', '点 $(0,\\ 2)$ → $(4,\\ -2)$', '大きさ $\\sqrt{16+4}=2\\sqrt5$'],
    why: 'ベクトル場は、場所 $(x,\\ y)$ を入れると矢印 $(F_x,\\ F_y)$ が出てくる関数（8-5①）。だから、その点の $x$、$y$ を2つの成分の式に入れれば、その点の矢印が出る。大きさは2つの成分の三平方 $\\sqrt{F_x^{\\,2}+F_y^{\\,2}}$。',
    caution: '点 $(x,\\ y)$ は矢印を置く場所で、矢印ではない。マイナスの数はかっこをつけて入れる（$-(-1)=1$）。3次元の場も同じで、成分が3つになる。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '22mm', s3: '30mm', trap: '24mm' },
    fits(q) { return /での矢印/.test(q) && !/回る|うず|流線|力線|軸|発散|div|grad|風車|電荷|重力/.test(q); },
    steps: {
      // 1次の場の矢印
      s1(r) {
        const c = [0, 1, 2, 3].map(() => r.int(-3, 3)), [a, b, cc, d] = c;
        if ((!a && !b) || (!cc && !d) || BAN30.has(c.join(',')) || c.join(',') === '1,0,0,1') return null;
        const p = r.int(-3, 3), q = r.int(-3, 3);
        if (!p && !q) return null;
        const Fx = lin2(a, b), Fy = lin2(cc, d), u = a * p + b * q, v = cc * p + d * q;
        if ((!u || !v) && r.chance(0.85)) return null;   // 0 の成分はときどき
        if (!fresh30(r, c)) return null;
        return { q: `$\\vec F=${P2(Fx, Fy)}$ の、点 $${P2(p, q)}$ での矢印`, a: `$${P2(u, v)}$`, key: `30:${c.join(',')}@${p},${q}`,
          easy: `$x=${p}$、$y=${q}$ を入れる：$F_x=${u}$、$F_y=${v}$`,
          calc: { kind: 'vec', want: [ev(Fx, { x: p, y: q }), ev(Fy, { x: p, y: q })] } };
      },
      // 矢印の大きさ（1次の場）と、2次の項がある場の矢印
      s2(r) {
        const [k, ok] = alt(r, '30s2', 2);
        if (k === 0) {
          const c = [0, 1, 2, 3].map(() => r.int(-3, 3)), [a, b, cc, d] = c;
          if ((!a && !b) || (!cc && !d) || BAN30.has(c.join(','))) return null;
          const p = r.int(-3, 3), q = r.int(-3, 3), u = a * p + b * q, v = cc * p + d * q, n = u * u + v * v;
          if ((!p && !q) || !n || !u || !v || !fresh30(r, c)) return null;
          const Fx = lin2(a, b), Fy = lin2(cc, d);
          return ok({ q: `$\\vec F=${P2(Fx, Fy)}$ の、点 $${P2(p, q)}$ での矢印の大きさ`, a: `$${sqrtTeX(n)}$`, key: `30m:${c.join(',')}@${p},${q}`,
            easy: `矢印は $${P2(u, v)}$。$\\sqrt{${par(u)}^2+${par(v)}^2}=\\sqrt{${n}}${sqrtParts(n)[0] > 1 || sqrtParts(n)[1] === 1 ? '=' + sqrtTeX(n) : ''}$`,
            verify: pp => valIs(pp, Math.hypot(ev(Fx, { x: p, y: q }), ev(Fy, { x: p, y: q }))) });
        }
        const cx = randComp(r, MONO2), cy = randComp(r, MONO2);
        if (!cx || !cy || !cx.concat(cy).some(t => /\^|xy/.test(t[1]))) return null;
        const all = cx.concat(cy).map(t => t[1]).join('');
        if (!/x/.test(all) || !/y/.test(all)) return null;   // x と y の両方が出る場
        const Fx = poly(cx), Fy = poly(cy), p = r.intNot(-2, 2, v => v === 0), q = r.intNot(-2, 2, v => v === 0);
        const u = ev(Fx, { x: p, y: q }), v = ev(Fy, { x: p, y: q });
        if (!u || !v) return null;
        return ok({ q: `$\\vec F=${P2(Fx, Fy)}$ の、点 $${P2(p, q)}$ での矢印`, a: `$${P2(u, v)}$`, key: `30n:${Fx},${Fy}@${p},${q}`,
          easy: `$x=${p}$、$y=${q}$ を入れる（2乗・かけ算はかっこごと）`,
          verify: pp => vecIs(pp.a, [cx.reduce((s, [c0, m]) => s + c0 * mono(m, p, q, 0), 0), cy.reduce((s, [c0, m]) => s + c0 * mono(m, p, q, 0), 0)]) });
      },
      // 3次元の場の矢印・大きさ
      s3(r) {
        const [k, ok] = alt(r, '30s3', 2);
        const cs = [0, 1, 2].map(() => randComp(r, MONO3));
        if (cs.some(c => !c) || !cs.flat().some(t => /z/.test(t[1]))) return null;
        const Fs = cs.map(poly), pt = [r.int(-2, 3), r.int(-2, 3), r.int(-2, 3)];
        if (pt.filter(v => v === 0).length > 1) return null;
        const w = cs.map(c => c.reduce((s, [c0, m]) => s + c0 * mono(m, pt[0], pt[1], pt[2]), 0)), n = w.reduce((s, v) => s + v * v, 0);
        if (!n || w.filter(v => v === 0).length > 1) return null;
        const fq3 = `$\\vec F(x,\\ y,\\ z)=${P3(...Fs)}$ の、点 $${P3(...pt)}$ での矢印`;
        const want = Fs.map(f => ev(f, { x: pt[0], y: pt[1], z: pt[2] }));
        if (k === 0) return ok({ q: fq3, a: `$${P3(...w)}$`, key: `30t:${Fs.join(',')}@${pt}`, easy: `$x=${pt[0]}$、$y=${pt[1]}$、$z=${pt[2]}$ を3つの成分に入れる`, calc: { kind: 'vec', want } });
        return ok({ q: fq3 + 'の大きさ', a: `$${sqrtTeX(n)}$`, key: `30tm:${Fs.join(',')}@${pt}`, easy: `矢印は $${P3(...w)}$。$\\sqrt{${w.map(v => par(v) + '^2').join('+')}}$`,
          verify: pp => valIs(pp, Math.hypot(...want)) });
      },
      // わな：発散（8-63）、山の $-\mathrm{grad}\,h$（8-23）
      trap(r) {
        const [tk, tok] = alt(r, '30t', 2);
        if (tk === 0) {
          const c = [0, 1, 2, 3].map(() => r.int(-4, 4)), [a, b, cc, d] = c;
          if (!a || !d || (!b && !cc) || BAN30.has(c.join(',')) || c.join(',') === '1,3,2,-5') return null;
          const Fx = lin2(a, b), Fy = lin2(cc, d);
          return tok(dest({ q: `$\\vec F=${P2(Fx, Fy)}$ の発散 $\\mathrm{div}\\,\\vec F$`, a: `$${a + d}$`, key: `30d:${c.join(',')}`,
            calc: { kind: 'pdiff', op: 'div', f: [Fx, Fy], vars: ['x', 'y'] } }, '8-30',
          `場所を入れて矢印を出す問いではない。発散は「$F_x$ を $x$ で、$F_y$ を $y$ で」偏微分してたす：$${a}+${par(d)}=${a + d}$`, ['8-63']));
        }
        const H = r.pick([30, 40, 50, 60]), a = r.int(1, 3), b = r.int(1, 3), p = r.intNot(-3, 3, v => v === 0), q = r.intNot(-3, 3, v => v === 0);
        if (a === b) return null;
        const h = `${H}${poly([[-a, 'x^2'], [-b, 'y^2']]).replace(/^(?!-)/, '+')}`;
        return tok(dest({ q: `山 $h=${h}$ の $-\\mathrm{grad}\\,h$ の、点 $${P2(p, q)}$ での矢印`, a: `$${P2(2 * a * p, 2 * b * q)}$`, key: `30g:${H},${a},${b}@${p},${q}`,
          calc: { kind: 'pdiff', op: 'grad', f: `-(${h})`, vars: ['x', 'y'], at: [p, q] } }, '8-30',
        `矢印の式が書いてない。先に偏微分して $-\\mathrm{grad}\\,h=${P2(2 * a + 'x', 2 * b + 'y')}$ を作る`, ['8-23', '8-27']));   // 8-27（点での勾配）でも解ける（R1-29・Z-4）
      },
    },
  });
  // 項 m の値（m は MONO2・MONO3 の文字の部分）
  function mono(m, x, y, z) {
    return { x, y, z, 'x^2': x * x, 'y^2': y * y, 'z^2': z * z, xy: x * y, yz: y * z, xz: x * z, '': 1 }[m];
  }

  // ================================================================ 8-31
  // 回る向き：(−ky, kx) は左回り、(ky, −kx) は右回り。例（目録の $(-4y,\ 4x)$・$(3y,\ -3x)$、教科書 8-5 例題2・じぶんでとこう・章末問題2・見わけようの
  //   $(y,\ -x)$・$(-2y,\ 2x)$・$(2y,\ -2x)$）とその符号ちがい・何倍かをよけるため、$k$ は5から（a と b がちがう場は例の何倍かにならない）
  const rotF = (dir, a, b) => (dir === 'L' ? P2(poly([[-a, 'y']]), poly([[b, 'x']])) : P2(poly([[a, 'y']]), poly([[-b, 'x']])));
  // 同じ見開きで同じ場 (−ky, kx) を2回使わない（使いきったら、よけない）
  //   符号を変えただけの場（(−ky, kx) と (ky, −kx)）も同じとみて、key は k だけ（Z-2）。k は5〜12 の8とおり
  function fresh31(r, key) { const u = r.s31u || (r.s31u = new Set()); if (u.has(key) && u.size < 8) return false; u.add(key); return true; }
  // 答えの「左回り、大きさ5」を読む
  function rotIs(p, dir, mag) {
    const m = /^(左|右)回り、大きさ \$(.*)\$$/.exec(String(p.a));
    if (!m) return `答え ${p.a} が読めない`;
    if ((m[1] === '左') !== (dir === 'L')) return `向き ${m[1]} がちがう`;
    return near(ev(m[2]), mag) || `大きさ ${m[2]} が ${mag} でない`;
  }
  // 4つの点の矢印から回る向きを決める（検算用：場の式の文字列を evalMath で読み、外積の z 成分の符号を見る）
  function rotDir(FxT, FyT) {
    let s = 0;
    for (const [x, y] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const u = ev(FxT, { x, y }), v = ev(FyT, { x, y }); s += x * v - y * u; }
    return s > 0 ? 'L' : s < 0 ? 'R' : '';
  }
  add({
    id: '8-31', part: 3, chap: '8-5③ 例題2', stars: 1,
    title: 'うずの回る向き：原点のまわりの4つの点の矢印を順に見る',
    mark: '$(ay,\\ bx)$ の形の場と「左回り・右回り」「回る向き」。',
    futsu: ['方眼の点ごとに矢印を計算して', '矢印の場の図をかき、', '矢印をつないだ流線をかいて、', '進む向きから回る向きを読む。'],
    raku: ['$(-4y,\\ 4x)$：$(1,\\ 0)$ で $(0,\\ 4)$ 上、', '$(0,\\ 1)$ で $(-4,\\ 0)$ 左 → 左回り', '大きさはどれも4', '$(3y,\\ -3x)$ → 右回り'],
    why: '右の点 $(1,\\ 0)$ で上向き、上の点 $(0,\\ 1)$ で左向き、左の点で下向き、下の点で右向き、と矢印が順に回っていけば、原点のまわりを左回り（時計と反対回り）に回るうず（8-5③）。$(-ky,\\ kx)$ の大きさは $k\\sqrt{x^2+y^2}$ で、原点からの距離の $k$ 倍。',
    caution: '$y$ の前が負で $x$ の前が正なら左回り、逆なら右回り。大きさは距離に比例するので、距離が2倍なら2倍。$(ay,\\ bx)$ で $a$ と $b$ が同じ符号の場は、原点のまわりを回らない（たとえば $(y,\\ x)$。そこに置いた風車が回るかは、べつのわざ）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    fits(q) { return /回る向き|どちらに回る/.test(q) && !/風車|回した|線積分|\\oint/.test(q); },
    steps: {
      // (−ky, kx)・(ky, −kx)：向きと、4つの点の矢印の大きさ
      // （例の 1〜4 倍の場と、その符号を変えた場はよける。U-2）
      s1(r) {
        const st = r.s31 || (r.s31 = { n: r.int(0, 1) }), dir = st.n % 2 ? 'R' : 'L', k = r.int(5, 12);
        if (!fresh31(r, k)) return null;
        st.n++;
        const Fv = rotF(dir, k, k), [FxT, FyT] = M.readVec(Fv);
        return { q: `$\\vec F=${Fv}$ の回る向き（左回り・右回り）と、点 $(1,\\ 0)$、$(0,\\ 1)$、$(-1,\\ 0)$、$(0,\\ -1)$ での矢印の大きさ`,
          a: `${dir === 'L' ? '左' : '右'}回り、大きさ $${k}$`, key: `31:${dir}${k},${k}@1`,
          easy: `$(1,\\ 0)$ で $${P2(0, dir === 'L' ? k : -k)}$（${dir === 'L' ? '上' : '下'}向き）、$(0,\\ 1)$ で $${P2(dir === 'L' ? -k : k, 0)}$（${dir === 'L' ? '左' : '右'}向き）`,
          verify: p => rotIs(p, rotDir(FxT, FyT), Math.hypot(ev(FxT, { x: 1, y: 0 }), ev(FyT, { x: 1, y: 0 }))) };
      },
      // 距離 R の所の大きさ、a と b がちがう場（たてに長いうず）
      s2(r) {
        const st = r.s31b || (r.s31b = { n: r.int(0, 1) }), dir = st.n % 2 ? 'R' : 'L', [kind, ok] = alt(r, '31s2', 2);
        if (kind === 0) {
          const k = r.int(5, 10), R = r.int(2, 4);
          if (!fresh31(r, k)) return null;
          st.n++; ok(true);
          const Fv = rotF(dir, k, k), [FxT, FyT] = M.readVec(Fv);
          return { q: `$\\vec F=${Fv}$ の回る向きと、原点から距離 ${R} の所での矢印の大きさ`, a: `${dir === 'L' ? '左' : '右'}回り、大きさ $${k * R}$`, key: `31:${dir}${k},${k}@${R}`,
            easy: `大きさは $${k}\\sqrt{x^2+y^2}$。距離 ${R} で $${k}\\times${R}=${k * R}$`,
            verify: p => rotIs(p, rotDir(FxT, FyT), Math.hypot(ev(FxT, { x: 0, y: R }), ev(FyT, { x: 0, y: R }))) };
        }
        const a = r.int(1, 6), b = r.int(1, 6), R = r.int(1, 3), onY = r.chance(0.5);
        if (a === b) return null;
        st.n++; ok(true);
        const Fv = rotF(dir, a, b), [FxT, FyT] = M.readVec(Fv), pt = onY ? [0, R] : [R, 0], mag = onY ? a * R : b * R;
        return { q: `$\\vec F=${Fv}$ の回る向きと、点 $${P2(...pt)}$ での矢印の大きさ`, a: `${dir === 'L' ? '左' : '右'}回り、大きさ $${mag}$`, key: `31:${dir}${a},${b}@${pt}`,
          easy: `$(1,\\ 0)$ で${dir === 'L' ? '上' : '下'}、$(0,\\ 1)$ で${dir === 'L' ? '左' : '右'}向き。点 $${P2(...pt)}$ の矢印は $${P2(ev(FxT, { x: pt[0], y: pt[1] }), ev(FyT, { x: pt[0], y: pt[1] }))}$`,
          verify: p => rotIs(p, rotDir(FxT, FyT), Math.hypot(ev(FxT, { x: pt[0], y: pt[1] }), ev(FyT, { x: pt[0], y: pt[1] }))) };
      },
      // 外へ広がりながら回る場 (ax−by, bx+ay)（図なし）と、図（矢印の場。回る向きは聞かず、大きさがいくつになる円かを聞く。図から答えを読ませない）
      s3(r) {
        const [kind, ok] = alt(r, '31s3', 2);
        if (kind === 0) {
          const a = r.intNot(-3, 3, v => v === 0), b = r.intNot(-4, 4, v => v === 0), Fv = P2(poly([[a, 'x'], [-b, 'y']]), poly([[b, 'x'], [a, 'y']])), [FxT, FyT] = M.readVec(Fv);
          if (Math.abs(a) === Math.abs(b) && r.chance(0.5)) return null;
          return ok({ q: `$\\vec F=${Fv}$ の回る向き（左回り・右回り）と、点 $(1,\\ 0)$、$(0,\\ 1)$、$(-1,\\ 0)$、$(0,\\ -1)$ での矢印の大きさ`, a: `${b > 0 ? '左' : '右'}回り、大きさ $${sqrtTeX(a * a + b * b)}$`, key: `31s:${a},${b}`,
            easy: `$(1,\\ 0)$ で $${P2(a, b)}$（${b > 0 ? '上' : '下'}向きの成分）、$(0,\\ 1)$ で $${P2(-b, a)}$（${b > 0 ? '左' : '右'}向きの成分）。${a > 0 ? '外へ広がり' : '中へ集まり'}ながら回る`,
            verify: p => rotIs(p, rotDir(FxT, FyT), Math.hypot(a, b)) });
        }
        const dir = r.chance(0.5) ? 'L' : 'R', k = r.int(5, 12), R = r.int(3, 5), Fv = rotF(dir, k, k), [FxT, FyT] = M.readVec(Fv);
        if (!fresh31(r, k)) return null;   // s1・s2 と同じ場、2つの図で同じ場を出さない
        // 軸の上の点（わざで見る4つの点もふくむ）にも矢印をかく（R1-26・Z-9）。目もりの字と重ならないように、目もりはかかない（点の間は1）
        const G = M.graph({ x0: -2.6, x1: 2.6, y0: -2.6, y1: 2.6, w: 8, h: 8 }), xs = [-2, -1, 0, 1, 2], Fq = (x, y) => [ev(FxT, { x, y }), ev(FyT, { x, y })], sc = 0.85 / (k * 2 * Math.SQRT2);
        const fig = { s: 5, items: [...G.axes({}), ...G.quiver(Fq, xs, xs, { scale: sc, legend: { len: 2 * k, label: `$${2 * k}$` } })] };
        return ok({ q: `図は $\\vec F=${Fv}$ の矢印の場（右下の物差しの矢印が大きさ ${2 * k}）。矢印の大きさが ${k * R} になる所は、原点を中心とする半径いくつの円の上か`, a: `$${R}$`, key: `31f:${dir}${k}@${R}`, fig,
          easy: `大きさは原点からの距離の ${k} 倍。$${k * R}\\div${k}=${R}$`,
          verify: p => valIs(p, k * R / Math.hypot(ev(FxT, { x: 1, y: 0 }), ev(FyT, { x: 1, y: 0 }))) });
      },
      // わな：ずれの場に風車を置く（8-67。矢印は回っていなくても、風車は回る）
      //   答えは「左回り・右回り・回らない」を順に回す（R1-19・Z-3）。8-31 の4つの点の読み方では答えが出ない場にする：
      //   (ay, bx) で a と b が同じ符号（流線は原点のまわりを回らないが、a≠b なので風車は回る）、ずれの場 (ky, 0)・(0, kx)、(kx, −ky)（回らない）
      trap(r) {
        const st = r.s31t || (r.s31t = { n: r.int(0, 2) }), want = ['L', 'R', 'N'][st.n % 3], m = r.int(2, 4);
        let Fv, why;
        if (want === 'N') {
          const k = r.chance(0.5) ? m : -m;
          Fv = P2(poly([[k, 'x']]), poly([[-k, 'y']]));
          why = '流線は原点のまわりを回るうずではない。風車が回るかは、羽根の両側の速さのちがいで決まる（横向きの矢印は上と下で同じ、たて向きの矢印は右と左で同じなので、回らない）';
        } else if ((st.m = (st.m == null ? r.int(0, 1) : st.m + 1)) % 2 === 0) {   // 2つの形を交互に
          // (ay, bx)、a・b は同じ符号で大きさがちがう。回転 b−a の符号で向きが決まる
          const sg = r.chance(0.5) ? 1 : -1, x1 = r.int(1, 4), x2 = r.intNot(1, 4, v => v === x1);
          const lo = Math.min(x1, x2), hi = Math.max(x1, x2);
          // b−a>0 なら左回り：sg>0 なら b が大きい、sg<0 なら |b| が小さい
          const [a, b] = (want === 'L') === (sg > 0) ? [sg * lo, sg * hi] : [sg * hi, sg * lo];
          Fv = P2(poly([[a, 'y']]), poly([[b, 'x']]));
          why = '$y$ の前と $x$ の前が同じ符号なので、流線は原点のまわりを回るうずではない。それでも風車は、羽根の両側の速さのちがいで回る（右と左のたて向きのちがいと、上と下の横向きのちがいが、つり合わない）';
        } else {
          // (ky, 0) は k>0 で右回り、(0, kx) は k>0 で左回り
          const onX = r.chance(0.5), left = want === 'L', k = onX ? (left ? -m : m) : (left ? m : -m);
          Fv = onX ? P2(poly([[k, 'y']]), 0) : P2(0, poly([[k, 'x']]));
          why = `流線はまっすぐで、原点のまわりを回るうずではない。風車は羽根の両側の速さのちがいで回る（${onX ? '上と下で、横向きの矢印がちがう' : '右と左で、たて向きの矢印がちがう'}）`;
        }
        st.n++;
        const [FxT, FyT] = M.readVec(Fv), A = { L: '回る（左回り）', R: '回る（右回り）', N: '回らない' }[want];
        return dest({ q: `$\\vec F=${Fv}$ の場に小さな風車を置くと、風車は回るか。回るなら左回り・右回りのどちらか`, a: A, key: `31t:${Fv}`,
          verify: p => { const R = (ev(FyT, { x: 0.3 + 1e-3, y: 0.2 }) - ev(FyT, { x: 0.3 - 1e-3, y: 0.2 })) / 2e-3 - (ev(FxT, { x: 0.3, y: 0.2 + 1e-3 }) - ev(FxT, { x: 0.3, y: 0.2 - 1e-3 })) / 2e-3; return p.a === (Math.abs(R) < 1e-6 ? '回らない' : `回る（${R > 0 ? '左' : '右'}回り）`) || `答え ${p.a}`; } },
        '8-31', why, ['8-67']);
      },
    },
  });

  // ================================================================ 8-32
  // 点電荷：k=9.0×10^9 なので kQ=9q（Q=q×10^{-9}）。距離 r は 0.1〜3 m
  const RS = ['0.1', '0.2', '0.3', '0.5', '0.6', '1.5', '2', '3'];
  const EQ = (q, rr) => F.div(fr(9 * q), F.mul(D(rr), D(rr)));   // E = 9q / r^2（分数）
  const BAN32 = new Set(['2@1', '2@0.6,0.8']);
  add({
    id: '8-32', part: 3, chap: '8-5⑥ 例題3・例題4', stars: 1,
    banV: [18, 2.45, 36, 17.98, 8.69, [10.8, 14.4], [21.6, 28.8]],
    title: '$\\dfrac{1}{r^2}$ の場：距離が $n$ 倍なら $\\dfrac{1}{n^2}$ 倍。成分は大きさ×$\\dfrac{(x,\\ y)}{r}$',
    mark: '点電荷の電場、地球の重力。「距離が □ 倍の所」「点 □ での成分」。',
    futsu: ['距離ごとに $\\dfrac{kQ}{r^2}$ を', 'はじめから計算しなおし、', '成分は、向きの角を三角比で出して、', '大きさにかける。'],
    raku: ['$Q=2.0\\times10^{-9}\\,\\mathrm{C}$、点 $(0.6,\\ 0.8)$', '→ $r=1$、$E=18$、成分 $(10.8,\\ 14.4)$', '中心から2倍の所の重力', '→ $9.8\\div4=2.45$'],
    why: '点電荷の電場も地球の重力も、大きさは距離の2乗に反比例し（$\\dfrac{kQ}{r^2}$、$\\dfrac{GM}{r^2}$）、向きは原点（中心）からその点への矢印 $(x,\\ y)$ の向き（重力は反対）。だから距離が $n$ 倍なら $\\dfrac{1}{n^2}$ 倍、成分は「大きさ×$\\dfrac{(x,\\ y)}{r}$」（8-5⑥）。',
    caution: '距離は中心からはかる（地面からの高さではない）。2倍なら半分ではなく $\\frac14$。成分は大きさに $\\frac{x}{r}$、$\\frac{y}{r}$ をかける（$x$、$y$ そのものではない）。$k=9.0\\times10^9\\,\\mathrm{N\\cdot m^2/C^2}$、$g=9.8\\,\\mathrm{m/s^2}$ を使う。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '36mm', trap: '20mm' },
    boxh: { trap: '11mm' },
    fits(q) { return /電場|重力/.test(q) && /大きさ|成分/.test(q) && !/流束|球面/.test(q); },
    steps: {
      // 距離が n 倍（電場・重力）
      s1(r) {
        if (turn(r, '32s1', 2) === 0) {
          const r1 = r.pick(['0.1', '0.2', '0.3', '0.4', '0.5']), n = r.pick([2, 3, 4, 5, fr(1, 2), fr(1, 3)]), m = r.int(2, 30) * (typeof n === 'number' ? 1 : 1);
          const nf = typeof n === 'number' ? fr(n) : n, r2 = F.mul(D(r1), nf), E1 = F.mul(fr(m), F.mul(nf, nf)), E2 = fr(m);
          if (!dec(r2) || !dec(E1) || +dec(r2) > 2) return null;
          return { q: `点電荷から $${r1}\\,\\mathrm{m}$ の所の電場の大きさが $${fx(E1)}\\,\\mathrm{N/C}$ のとき、同じ点電荷から $${dec(r2)}\\,\\mathrm{m}$ の所の電場の大きさ`,
            a: `$${fx(E2)}\\,\\mathrm{N/C}$`, key: `32r:${r1},${dec(r2)},${fx(E1)}`,
            easy: `距離が $${fq(nf)}$ 倍なので、大きさは $${fq(F.div(fr(1), F.mul(nf, nf)))}$ 倍`, verify: p => valIs(p, F.val(E1) * Math.pow(+r1 / +dec(r2), 2)) };
        }
        const n = r.pick([4, 5, 7, 10, 14]), hi = r.chance(0.5), g = F.div(D('9.8'), fr(n * n));
        if (!dec(g)) return null;
        return { q: hi ? `地面での重力の大きさを $9.8\\,\\mathrm{m/s^2}$ とします。地面から、地球の半径の ${n - 1} 倍の高さの所での重力の大きさ` : `地面での重力の大きさを $9.8\\,\\mathrm{m/s^2}$ とします。地球の中心からの距離が地球の半径の ${n} 倍の所での重力の大きさ`,
          a: `$${dec(g)}\\,\\mathrm{m/s^2}$`, key: `32g:${n}`, easy: `中心からの距離は半径の ${n} 倍なので、$9.8\\div${n * n}=${dec(g)}$`, verify: p => valIs(p, 9.8 / (n * n)) };
      },
      // E=kQ/r^2
      s2(r) {
        const q = r.int(1, 6), rr = r.pick(RS), E = EQ(q, rr);
        if (!dec(E) || BAN32.has(`${q}@${rr}`) || F.val(E) > 2000) return null;
        return { q: `原点に $Q=${q}.0\\times10^{-9}\\,\\mathrm{C}$ の点電荷があります。原点から $${rr}\\,\\mathrm{m}$ の所での電場の大きさ（$k=9.0\\times10^9\\,\\mathrm{N\\cdot m^2/C^2}$）`,
          a: `$${dec(E)}\\,\\mathrm{N/C}$`, key: `32e:${q}@${rr}`, easy: `$kQ=9.0\\times10^9\\times${q}.0\\times10^{-9}=${9 * q}$、$${9 * q}\\div${par(rr)}^2=${dec(E)}$`,
          verify: p => valIs(p, 9.0e9 * q * 1e-9 / (+rr * +rr)) };
      },
      // 成分（平面の点・空間の点、負の電荷）
      s3(r) {
        const three = turn(r, '32s3', 2) === 1;
        const dirs = three ? [[1, 2, 2], [2, 1, 2], [2, 2, 1], [1, -2, 2], [-2, 1, 2]] : [[3, 4], [4, 3], [-3, 4], [4, -3], [-4, -3], [5, 12], [12, 5]];
        const u = r.pick(dirs), L = three ? 3 : (Math.abs(u[0]) === 5 || Math.abs(u[0]) === 12 ? 13 : 5), rr = r.pick(three ? ['0.3', '0.6', '1.5', '3'] : (L === 13 ? ['1.3', '2.6'] : ['0.5', '1', '1.5'])), s = D(rr);
        const q = r.intNot(-6, 6, v => v === 0), qq = Math.abs(q), Ef = F.div(fr(9 * qq), F.mul(s, s));
        const pt = u.map(c => F.mul(fr(c, L), s)), comp = u.map(c => F.mul(F.mul(Ef, fr(c, L)), fr(q < 0 ? -1 : 1)));
        if (pt.some(c => !dec(c)) || comp.some(c => !dec(c)) || !dec(Ef) || BAN32.has(`${q}@${pt.map(dec)}`) || F.val(Ef) > 2000) return null;
        const ptT = pt.map(dec), cT = comp.map(dec);
        return { q: `原点に $Q=${q < 0 ? '-' : ''}${qq}.0\\times10^{-9}\\,\\mathrm{C}$ の点電荷があります。点 $${vecTeX(ptT)}$（m）での電場の成分（$k=9.0\\times10^9\\,\\mathrm{N\\cdot m^2/C^2}$）`,
          a: `$${vecTeX(cT)}$（N/C）`, key: `32c:${q}@${ptT}`,
          easy: `$r=${rr}$、大きさ $${dec(Ef)}$、向き $${vecTeX(u.map(c => fx(fr(c, L))))}$${q < 0 ? '（負の電荷なので内向き）' : ''}`,
          verify: p => { const x = ptT.map(Number), R = Math.hypot(...x), E = 9.0e9 * q * 1e-9 / (R * R); return vecIs(p.a, x.map(c => E * c / R), 1e-9); } };
      },
      // わな：球面を通る電場の流束（8-56。半径によらず Q/ε0）
      trap(r) {
        const R = r.pick(['0.2', '0.5', '1.5', '2', '3']);
        if (turn(r, '32t', 2) === 0) {
          return dest({ q: `原点に点電荷 $Q$ があります。原点を中心とする半径 $${R}\\,\\mathrm{m}$ の球面を通る電場の流束（$Q$ と $\\varepsilon_0$ で）`, a: '$\\dfrac{Q}{\\varepsilon_0}$', key: `32t:${R}`,
            verify: p => (p.a === '$\\dfrac{Q}{\\varepsilon_0}$') || '答え' },
          '8-32', `点の電場ではなく、球面全体を通る量。面に直角で大きさ一定なので $\\dfrac{kQ}{R^2}\\times4\\pi R^2=4\\pi kQ=\\dfrac{Q}{\\varepsilon_0}$（半径によらない）`, ['8-56']);
        }
        const R2 = r.pick(['0.4', '1', '2.5', '4']);
        if (R2 === R) return null;
        return dest({ q: `原点に点電荷があります。原点を中心とする半径 $${R}\\,\\mathrm{m}$ の球面を通る電場の流束が $\\Phi$ のとき、半径 $${R2}\\,\\mathrm{m}$ の球面を通る流束（$\\Phi$ で）`, a: '$\\Phi$', key: `32t2:${R},${R2}`,
          verify: p => (p.a === '$\\Phi$') || '答え' },
        '8-32', `電場は $\\frac{1}{r^2}$ 倍になるが、球面の面積は $r^2$ 倍になるので、流束は半径によらず同じ`, ['8-56']);
      },
    },
  });

  // ================================================================ 8-33
  // 流線の式。答えは「x^2+y^2=25」「y=3x」「xy=6」などの式（＝ の左右）
  // 検算：答えの式 g(x, y)=0 が、点を通ることと、場の矢印にそって数で進んだ点（ルンゲ・クッタ）でも 0 のままか（問題を作った変数分離とは別の道すじ）
  function streamIs(p, FxT, FyT, x0, y0) {
    const t = strip(String(p.a).match(/\$[^$]*\$/)[0]), i = t.indexOf('=');
    if (i < 0) return `答え ${p.a} が式でない`;
    const L = t.slice(0, i), R = t.slice(i + 1), g = (x, y) => ev(L, { x, y }) - ev(R, { x, y });
    const sc = Math.max(1, Math.abs(ev(L, { x: x0, y: y0 })));
    if (!near(g(x0, y0) / sc, 0, 1e-9) && Math.abs(g(x0, y0)) > 1e-9 * sc) return `点 (${x0}, ${y0}) を通らない`;
    const Fn = (x, y) => { const u = ev(FxT, { x, y }), v = ev(FyT, { x, y }), n = Math.hypot(u, v) || 1; return [u / n, v / n]; };
    for (const sgnD of [1, -1]) {
      let x = x0, y = y0; const h = 0.01 * sgnD;
      for (let k = 0; k < 40; k++) {
        const k1 = Fn(x, y), k2 = Fn(x + h / 2 * k1[0], y + h / 2 * k1[1]), k3 = Fn(x + h / 2 * k2[0], y + h / 2 * k2[1]), k4 = Fn(x + h * k3[0], y + h * k3[1]);
        x += h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); y += h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      }
      if (Math.abs(g(x, y)) > 1e-6 * sc) return `矢印にそって進むと、答えの式からはずれる（${fmt(x)}, ${fmt(y)}）`;
    }
    return true;
  }
  const slopeTeX = m => (F.eq(m, fr(1)) ? 'x' : F.eq(m, fr(-1)) ? '-x' : `${fq(m)}x`);
  // (3,4)・(5,12) の何倍か（例と同じ円・その何倍か。目録・教科書 8-5 例題5・じぶんでとこう・章末問題4）
  const tripleOf = (x, y) => [[3, 4], [5, 12]].some(([a, b]) => { const X = Math.abs(x), Y = Math.abs(y); return (X * b === Y * a && X % a === 0) || (X * a === Y * b && X % b === 0); });
  const BAN33L = new Set(['3', '1/2']);   // 原点を通る直線の傾き（例の $y=3x$、$y=0.5x$）
  add({
    id: '8-33', part: 3, chap: '8-5⑦ 例題5', stars: 1,
    banA: ['$x^2+y^2=169$', '$y=3x$', '$x^2+y^2=25$', '$y=\\frac{1}{2}x$', '$x^2+y^2=100$', '$x^2+y^2=4$'],
    title: '流線の式：$\\dfrac{\\dd y}{\\dd x}=\\dfrac{F_y}{F_x}$ を変数分離。$(-y,\\ x)$ は円、$(x,\\ y)$ は原点を通る直線',
    mark: '「点 □ を通る流線（力線）の式」。',
    futsu: ['点から矢印の向きに少し進み、', 'その点の矢印を計算してまた進む、を', 'くり返して線をかき（6-2）、', 'できた線の形から式を考える。'],
    raku: ['$(-y,\\ x)$、点 $(5,\\ 12)$', '→ $y\\,\\dd y=-x\\,\\dd x$', '→ $x^2+y^2=169$（半径13の円）', '$(x,\\ y)$、点 $(2,\\ 6)$ → $y=3x$'],
    why: '流線は、どの点でも向きがその点の矢印の向きになっている線（8-5④）。矢印 $(F_x,\\ F_y)$ の傾きは $\\dfrac{F_y}{F_x}$ なので、流線は微分方程式 $\\dfrac{\\dd y}{\\dd x}=\\dfrac{F_y}{F_x}$ の解。$y$ と $x$ を分けて積分し（6-4）、点を入れて定数を決める（8-5⑦）。',
    caution: '矢印の大きさ（$k$ 倍）は傾きに関係しないので、$(-3y,\\ 3x)$ も $(-y,\\ x)$ と同じ円。$\\ln$ が出たら、$\\ln|y|=\\ln|x|+C$ から $y=ax$ の形に直す。答えの定数は、かならず点を入れて決める。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' },
    fits(q) { return /流線|力線/.test(q) && /式|半径/.test(q) && !/線積分|\\oint|\\int/.test(q); },
    steps: {
      // うず（円）と、広がる場（原点を通る直線）
      s1(r) {
        const [k, ok] = alt(r, '33s1', 2), x0 = r.intNot(-7, 7, v => v === 0), y0 = r.intNot(-7, 7, v => v === 0), c = r.intNot(-3, 3, v => v === 0);
        if (k === 0) {
          if (tripleOf(x0, y0)) return null;
          const Fv = c > 0 ? P2(poly([[-c, 'y']]), poly([[c, 'x']])) : P2(poly([[-c, 'y']]), poly([[c, 'x']])), [FxT, FyT] = M.readVec(Fv), R2 = x0 * x0 + y0 * y0;
          return ok({ q: `$\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線の式`, a: `$x^2+y^2=${R2}$`, key: `33c:${R2}@${x0},${y0}`,
            easy: `$\\frac{\\dd y}{\\dd x}=\\frac{${poly([[c, 'x']])}}{${poly([[-c, 'y']])}}$ から $y\\,\\dd y=-x\\,\\dd x$、$x^2+y^2=${par(x0)}^2+${par(y0)}^2=${R2}$`,
            verify: p => streamIs(p, FxT, FyT, x0, y0) });
        }
        const m = fr(y0, x0);
        if (BAN33L.has(fq(m).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2'))) return null;
        const Fv = P2(poly([[c, 'x']]), poly([[c, 'y']])), [FxT, FyT] = M.readVec(Fv);
        return ok({ q: `$\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線の式`, a: `$y=${slopeTeX(m)}$`, key: `33l:${m}`,
          easy: `$\\frac{\\dd y}{y}=\\frac{\\dd x}{x}$ から $y=ax$。$${y0}=a\\times${par(x0)}$ で $a=${fq(m)}$`,
          verify: p => streamIs(p, FxT, FyT, x0, y0) });
      },
      // 双曲線（$(y,\ x)$・$(x,\ -y)$）と放物線（$(x,\ 2y)$）
      s2(r) {
        const [k, ok] = alt(r, '33s2', 3), x0 = r.intNot(-5, 5, v => v === 0), y0 = r.intNot(-5, 5, v => v === 0), c = r.intNot(-3, 3, v => v === 0);
        if (k === 0) {
          const C = x0 * x0 - y0 * y0;
          if (!C) return null;
          const Fv = P2(poly([[c, 'y']]), poly([[c, 'x']])), [FxT, FyT] = M.readVec(Fv);
          return ok({ q: `$\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線の式`, a: C > 0 ? `$x^2-y^2=${C}$` : `$y^2-x^2=${-C}$`, key: `33h:${C}@${x0 * x0}`,
            easy: `$\\frac{\\dd y}{\\dd x}=\\frac{x}{y}$ から $y\\,\\dd y=x\\,\\dd x$、$y^2-x^2$ が一定`, verify: p => streamIs(p, FxT, FyT, x0, y0) });
        }
        if (k === 1) {
          const Fv = P2(poly([[c, 'x']]), poly([[-c, 'y']])), [FxT, FyT] = M.readVec(Fv);
          return ok({ q: `$\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線の式`, a: `$xy=${x0 * y0}$`, key: `33d:${x0 * y0}@${Math.abs(x0)}`,
            easy: `$\\frac{\\dd y}{y}=-\\frac{\\dd x}{x}$ から $\\ln|y|=-\\ln|x|+C$、$xy$ が一定`, verify: p => streamIs(p, FxT, FyT, x0, y0) });
        }
        const m = fr(y0, x0 * x0);
        if (Math.abs(x0) > 3) return null;
        const Fv = P2(poly([[c, 'x']]), poly([[2 * c, 'y']])), [FxT, FyT] = M.readVec(Fv);
        return ok({ q: `$\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線の式`, a: `$y=${F.eq(m, fr(1)) ? '' : F.eq(m, fr(-1)) ? '-' : fq(m)}x^2$`, key: `33p:${m}`,
          easy: `$\\frac{\\dd y}{y}=\\frac{2\\,\\dd x}{x}$ から $y=ax^2$。$${y0}=a\\times${par(x0)}^2$`, verify: p => streamIs(p, FxT, FyT, x0, y0) });
      },
      // 点電荷の力線・円の半径・ずれの場
      s3(r) {
        const [k, ok] = alt(r, '33s3', 3), x0 = r.intNot(-6, 6, v => v === 0), y0 = r.intNot(-6, 6, v => v === 0);
        if (k === 0) {
          const m = fr(y0, x0);
          if (BAN33L.has(fq(m).replace(/\\frac\{(\d+)\}\{(\d+)\}/, '$1/$2'))) return null;
          const FxT = 'x/(x^2+y^2)^{1.5}', FyT = 'y/(x^2+y^2)^{1.5}';
          return ok({ q: `原点の正の点電荷のまわりの電場 $\\vec E=\\dfrac{kQ}{r^3}(x,\\ y)$ の、点 $${P2(x0, y0)}$ を通る力線の式`, a: `$y=${slopeTeX(m)}$`, key: `33l:${m}`,
            easy: `$\\frac{\\dd y}{\\dd x}=\\frac{y}{x}$（$\\frac{kQ}{r^3}$ は消える）。$y=ax$ で $a=${fq(m)}$`, verify: p => streamIs(p, FxT, FyT, x0, y0) });
        }
        if (k === 1) {
          const c = r.int(2, 5), R2 = x0 * x0 + y0 * y0;
          if (tripleOf(x0, y0)) return null;
          return ok({ q: `$\\vec F=(-${c}y,\\ ${c}x)$ の流線のうち、点 $${P2(x0, y0)}$ を通るものは円になる。その円の半径`, a: `$${sqrtTeX(R2)}$`, key: `33c:${R2}@${x0},${y0}`,
            easy: `流線は $x^2+y^2=${R2}$（$${c}$ 倍は関係しない）`, verify: p => valIs(p, Math.hypot(x0, y0)) });
        }
        const c = r.intNot(-3, 3, v => v === 0), ver = r.chance(0.5);
        const Fv = ver ? P2(0, poly([[c, 'x']])) : P2(poly([[c, 'y']]), 0), [FxT, FyT] = M.readVec(Fv);
        return ok({ q: `ずれの場 $\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線の式`, a: ver ? `$x=${x0}$` : `$y=${y0}$`, key: `33s:${ver ? 'x' + x0 : 'y' + y0}`,
          easy: ver ? `$F_x=0$ なので、流線はたての直線` : `$F_y=0$ なので $\\frac{\\dd y}{\\dd x}=0$、流線は横の直線`,
          verify: p => { const t = strip(p.a); return t === (ver ? `x=${x0}` : `y=${y0}`) || `答え ${p.a}`; } });
      },
      // わな：流線（円）を1周する線積分（8-47）
      trap(r) {
        const x0 = r.intNot(-4, 4, v => v === 0), y0 = r.intNot(-4, 4, v => v === 0), c = r.int(1, 2), R2 = x0 * x0 + y0 * y0;
        if (tripleOf(x0, y0) || R2 === 9) return null;
        const Fv = P2(poly([[-c, 'y']]), poly([[c, 'x']]));
        return dest({ q: `$\\vec F=${Fv}$ の、点 $${P2(x0, y0)}$ を通る流線を、左回りに1周する線積分 $\\oint_C\\vec F\\cdot\\dd\\vec r$`, a: `$${piTeX(fr(2 * c * R2))}$`, key: `33t:${c}@${R2}`,
          calc: { kind: 'line', r: [`sqrt(${R2})*cos(t)`, `sqrt(${R2})*sin(t)`], t: [0, '2*pi'], F: [`-${c}*y`, `${c}*x`] } },
        '8-33', `流線の式を求める問いではない。流線は半径 $\\sqrt{${R2}}$ の円で、矢印はいつも円にそう。内積は $${poly([[c, 'R^2']])}=${c * R2}$ で一定、$\\times2\\pi$`, ['8-47']);
      },
    },
  });

  // ================================================================ 8-34
  // 軸を回して見た成分 R(θ)^T v。cos・sin を「p+q√s」（p、q は分数）で持つ
  const CS = {
    90: [[0, 0], [1, 0], 1], 180: [[-1, 0], [0, 0], 1], '-90': [[0, 0], [-1, 0], 1],
    30: [[0, fr(1, 2)], [fr(1, 2), 0], 3], 60: [[fr(1, 2), 0], [0, fr(1, 2)], 3], 45: [[0, fr(1, 2)], [0, fr(1, 2)], 2],
    120: [[fr(-1, 2), 0], [0, fr(1, 2)], 3], 135: [[0, fr(-1, 2)], [0, fr(1, 2)], 2], '-30': [[0, fr(1, 2)], [fr(-1, 2), 0], 3], '-60': [[fr(1, 2), 0], [0, fr(-1, 2)], 3],
  };
  const sF = x => (typeof x === 'number' ? fr(x) : x);
  const sAdd = (a, b) => [F.add(a[0], b[0]), F.add(a[1], b[1])];
  const sMul = (k, a) => [F.mul(fr(k), sF(a[0])), F.mul(fr(k), sF(a[1]))];
  // p+q√s の TeX（2+\sqrt3、1-2\sqrt3、\frac{3\sqrt2}{2}）
  function surdTeX(v, s) {
    const [p, q] = v.map(sF);
    if (q[0] === 0 || s === 1) return fq(p);
    const qa = Math.abs(q[0]), qs = (qa === 1 ? '' : qa) + `\\sqrt{${s}}`, qt = q[1] === 1 ? qs : `\\frac{${qs}}{${q[1]}}`;
    if (p[0] === 0) return (q[0] < 0 ? '-' : '') + qt;
    return `${fq(p)}${q[0] < 0 ? '-' : '+'}${qt}`;
  }
  const sVal = (v, s) => F.val(sF(v[0])) + F.val(sF(v[1])) * Math.sqrt(s);
  // R(θ)^T (vx, vy) = (vx c + vy s, −vx s + vy c)
  function axisRot(v, deg) {
    const [c, s, b] = CS[deg], C = c.map(sF), S = s.map(sF);
    return { b, w: [sAdd(sMul(v[0], C), sMul(v[1], S)), sAdd(sMul(-v[0], S), sMul(v[1], C))] };
  }
  const degT = d => (d < 0 ? `右回りに $${-d}^{\\circ}$ ` : `左回りに $${d}^{\\circ}$ `);
  const angT = d => (+d < 0 ? `(${d}^{\\circ})` : `${d}^{\\circ}`);
  const BAN34 = new Set(['3,4', '4,3', '4,2', '5,0']);   // 例の風（目録・教科書 8-5 例題6・じぶんでとこう・章末問題5）
  add({
    id: '8-34', part: 3, chap: '8-5⑧ 例題6', stars: 1,
    banV: [[4, -3], [1.5 + 2 * Math.sqrt(3), 2 - 1.5 * Math.sqrt(3)], [2, 0], [4.6, 1.96], [3.73, -2.46], [4.33, -2.5]],
    title: '軸を回して見た成分は $R^{\\mathsf T}\\vec F$（矢印そのものを回す $R\\vec F$ ではない）。大きさは変わらない',
    mark: '「東から左回りに □° 回した軸で見た成分」。',
    futsu: ['矢印を方眼にかき、新しい軸を', '分度器で引いて、矢印の影の長さを', '物差しではかる。', '向きで符号をつける。'],
    raku: ['風 $(3,\\ 4)$、軸を $90^{\\circ}$ 回す', '→ $R(90^{\\circ})^{\\mathsf T}=\\begin{pmatrix}0&1\\\\-1&0\\end{pmatrix}$', '→ $(4,\\ -3)$、大きさ5のまま', '$60^{\\circ}$ → $(1.5+2\\sqrt3,\\ 2-1.5\\sqrt3)$'],
    why: '軸を $\\theta$ 回して見ると、矢印は反対に $\\theta$ 回ったように見える。だから成分は、逆に回す行列 $R(\\theta)^{\\mathsf T}=\\begin{pmatrix}\\cos\\theta&\\sin\\theta\\\\-\\sin\\theta&\\cos\\theta\\end{pmatrix}$ をかけたもの（7-6・8-5⑧）。矢印そのものは変わらないので、大きさも変わらない。',
    caution: '1行めは $(\\cos\\theta,\\ \\sin\\theta)$、2行めは $(-\\sin\\theta,\\ \\cos\\theta)$ と内積をとる。右回りに回した軸は $\\theta$ を負に。答えの大きさがもとの大きさと同じかで確かめられる。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '40mm', s3: '30mm', trap: '20mm' },
    fits(q) { return /回した軸/.test(q) && /成分/.test(q); },
    steps: {
      // 90°・180°・−90°
      s1(r) {
        const [kd, ok] = alt(r, '34s1', 3), v = [r.int(-9, 9), r.int(-9, 9)], deg = ['90', '-90', '180'][kd];
        if (!v[0] || !v[1] || BAN34.has(v.map(Math.abs).join(',')) || v[0] === v[1]) return null;
        const { w } = axisRot(v, deg), a = w.map(z => surdTeX(z, 1));
        return ok({ q: `風 $${P2(...v)}$ を、東から${degT(+deg)}回した軸で見た成分`, a: `$${P2(...a)}$`, key: `34:${v.map(Math.abs).sort()}`,
          easy: `$R(${deg}^{\\circ})^{\\mathsf T}$ の1行め $${P2(...CS[deg][0].map(String).slice(0, 1).concat(CS[deg][1][0]))}$、2行め $${P2(-CS[deg][1][0] || 0, CS[deg][0][0])}$ と内積`,
          calc: { kind: 'vec', want: [v[0] * Math.cos(deg * RAD) + v[1] * Math.sin(deg * RAD), -v[0] * Math.sin(deg * RAD) + v[1] * Math.cos(deg * RAD)].map(x => Math.round(x * 1e9) / 1e9) } });
      },
      // 45°・30°・60°・120°・135°（√ を残す）
      s2(r) {
        const deg = r.pick(['45', '30', '60', '120', '135', '-30', '-60']), b = CS[deg][2];
        const v = [r.int(-4, 4) * 2, r.int(-4, 4) * 2];
        if (!v[0] || !v[1] || BAN34.has(v.map(Math.abs).join(',')) || Math.abs(v[0]) === Math.abs(v[1])) return null;
        const { w } = axisRot(v, deg), a = w.map(z => surdTeX(z, b));
        return { q: `風 $${P2(...v)}$ を、東から${degT(+deg)}回した軸で見た成分（$\\sqrt{\\phantom{2}}$ を残す）`, a: `$${P2(...a)}$`, key: `34:${v.map(Math.abs).sort()}`,
          easy: `$\\cos${angT(deg)}=${surdTeX(CS[deg][0], b)}$、$\\sin${angT(deg)}=${surdTeX(CS[deg][1], b)}$。$(v_x\\cos\\theta+v_y\\sin\\theta,\\ -v_x\\sin\\theta+v_y\\cos\\theta)$`,
          calc: { kind: 'vec', want: [v[0] * Math.cos(deg * RAD) + v[1] * Math.sin(deg * RAD), -v[0] * Math.sin(deg * RAD) + v[1] * Math.cos(deg * RAD)] } };
      },
      // ドローンの軸（$\cos30^{\circ}=0.866$ で小数第2位まで）、3次元（$z$ 軸のまわり）
      s3(r) {
        const [k, ok] = alt(r, '34s3', 2);
        if (k === 0) {
          const deg = r.pick([30, 60]), v = [r.int(1, 8), r.int(-5, 6)];
          if (!v[1] || BAN34.has(v.map(Math.abs).join(','))) return null;
          const c = deg === 30 ? 0.866 : 0.5, s = deg === 30 ? 0.5 : 0.866;
          const ap = [v[0] * c + v[1] * s, -v[0] * s + v[1] * c], tr = [v[0] * Math.cos(deg * RAD) + v[1] * Math.sin(deg * RAD), -v[0] * Math.sin(deg * RAD) + v[1] * Math.cos(deg * RAD)];
          const r2 = x => Math.round(x * 100 + 1e-9 * Math.sign(x)) / 100;
          if (ap.some((x, i) => r2(x) !== r2(tr[i]) || Math.abs(Math.abs(tr[i] * 100) % 1 - 0.5) < 0.05)) return null;   // 0.866 で計算した値とほんとうの値がくいちがう組・境目の組はよける（O-4）
          const a = ap.map(x => r2(x).toFixed(2));
          return ok({ q: `機首を東から左回りに $${deg}^{\\circ}$ の向きに向けたドローンから見た、風 $${P2(...v)}$（m/s）の成分（$x'$ は機首の向き、$y'$ は機体の左の向き。$\\cos${deg}^{\\circ}=${c}$、$\\sin${deg}^{\\circ}=${s}$ を使い、小数第2位まで）`,
            a: `約 $${P2(...a)}$（m/s）`, key: `34d:${v}@${deg}`,
            easy: `$v_{x'}=${v[0]}\\times${c}${v[1] < 0 ? '' : '+'}${v[1]}\\times${s}\\approx${r2(ap[0]).toFixed(2)}$、$v_{y'}=-${v[0]}\\times${s}${v[1] < 0 ? '' : '+'}${v[1]}\\times${c}\\approx${r2(ap[1]).toFixed(2)}$`,
            verify: p => vecIs(p.a, tr, 0, 0.005 + 1e-9) });
        }
        const deg = r.pick(['90', '-90', '180']), v = [r.int(-6, 6), r.int(-6, 6), r.int(-6, 6)];
        if (v.some(x => !x) || Math.abs(v[0]) === Math.abs(v[1])) return null;
        const { w } = axisRot([v[0], v[1]], deg), a = w.map(z => surdTeX(z, 1)).concat(String(v[2]));
        return ok({ q: `空間の矢印 $${P3(...v)}$ を、$z$ 軸のまわりに $x$ 軸・$y$ 軸を${degT(+deg)}回した軸で見た成分（$z$ 軸はそのまま）`, a: `$${P3(...a)}$`, key: `34z:${v}@${deg}`,
          easy: `$z$ 成分はそのまま。$x$、$y$ は平面と同じ $R(${deg}^{\\circ})^{\\mathsf T}$`,
          calc: { kind: 'vec', want: [v[0] * Math.cos(deg * RAD) + v[1] * Math.sin(deg * RAD), -v[0] * Math.sin(deg * RAD) + v[1] * Math.cos(deg * RAD), v[2]].map(x => Math.round(x * 1e9) / 1e9) } });
      },
      // わな：矢印そのものを回す（7-48）
      trap(r) {
        // （180° は $R=R^{\mathsf T}$ で、このわざでも同じ答えになるので出さない）
        const v = [r.int(-6, 6), r.int(-6, 6)], deg = r.pick([90, -90]);
        if (!v[0] || !v[1] || BAN34.has(v.map(Math.abs).join(','))) return null;
        const w = deg === 90 ? [-v[1], v[0]] : [v[1], -v[0]];
        return dest({ q: `風の矢印 $${P2(...v)}$ そのものを、${degT(deg)}回した矢印`, a: `$${P2(...w)}$`, key: `34t:${v}@${deg}`,
          calc: { kind: 'vec', want: [v[0] * Math.cos(deg * RAD) - v[1] * Math.sin(deg * RAD), v[0] * Math.sin(deg * RAD) + v[1] * Math.cos(deg * RAD)].map(x => Math.round(x * 1e9) / 1e9) } },
        '8-34', `軸ではなく矢印そのものを回すので、$R^{\\mathsf T}$ ではなく $R(${deg}^{\\circ})$ をかける`, ['7-48']);
      },
    },
  });

  // ---------------------------------------------------------------- 重積分の部品（8-35〜8-44・8-92）
  // 多項式は項の配列 [[係数（分数）, x の次数, y の次数, z の次数], …]
  const monoT = (i, j, k) => (i ? 'x' + (i > 1 ? '^' + i : '') : '') + (j ? 'y' + (j > 1 ? '^' + j : '') : '') + (k ? 'z' + (k > 1 ? '^' + k : '') : '');
  const polyT = T => poly(T.map(([c, i, j, k]) => [c, monoT(i, j, k || 0)]));
  // 長方形 [x0,x1]×[y0,y1]（3つめは [z0,z1]）の上の正確な積分（分数）
  const intPow = (n, a, b) => F.div(F.sub(powF(sF(b), n + 1), powF(sF(a), n + 1)), fr(n + 1));
  function intBox(T, X, Y, Z) {
    return T.reduce((s, [c, i, j, k]) => F.add(s, F.mul(F.mul(sF(c), intPow(i, X[0], X[1])), F.mul(intPow(j, Y[0], Y[1]), Z ? intPow(k || 0, Z[0], Z[1]) : fr(1)))), fr(0));
  }
  const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
  // 三角形：T1 は 0≦y≦x≦a、T3 は 0≦x≦y≦a、T2 は頂点 (0,0)・(a,0)・(0,b)
  const intT1 = (T, a) => T.reduce((s, [c, i, j]) => F.add(s, F.mul(sF(c), F.div(powF(fr(a), i + j + 2), fr((j + 1) * (i + j + 2))))), fr(0));
  const intT3 = (T, a) => T.reduce((s, [c, i, j]) => F.add(s, F.mul(sF(c), F.div(powF(fr(a), i + j + 2), fr((i + 1) * (i + j + 2))))), fr(0));
  const intT2 = (T, a, b) => T.reduce((s, [c, i, j]) => F.add(s, F.mul(sF(c), F.mul(F.mul(powF(fr(a), i + 1), powF(fr(b), j + 1)), fr(fact(i) * fact(j), fact(i + j + 2))))), fr(0));
  // 文の中の式を読む（見わけようの fits 用）：被積分関数・範囲・形
  function polyParse(f) {
    const s = String(f).replace(/\s|\\,|\\!/g, '').replace(/^\((.*)\)$/, '$1');
    if (!s || /[^0-9xyz^+\-.{}]/.test(s)) return null;
    const out = [];
    for (const t of s.match(/[+-]?[^+-]+/g) || []) {
      const m = /^([+-]?)(\d*\.?\d*)((?:[xyz](?:\^\{?\d+\}?)?)*)$/.exec(t);
      if (!m) return null;
      const e = [0, 0, 0];
      for (const v of m[3].matchAll(/([xyz])(?:\^\{?(\d+)\}?)?/g)) e['xyz'.indexOf(v[1])] += v[2] ? +v[2] : 1;
      out.push([(m[1] === '-' ? -1 : 1) * (m[2] ? +m[2] : 1), ...e]);
    }
    return out;
  }
  // 2つの文字の多項式が「x だけ」×「y だけ」に分かれるか（係数の表の階数が1）
  function rank1(P) {
    const nz = P.filter(t => t[0] !== 0);
    for (const a of nz) for (const b of nz) {
      const ca = nz.find(t => t[1] === a[1] && t[2] === b[2]), cb = nz.find(t => t[1] === b[1] && t[2] === a[2]);
      if (Math.abs((a[1] === b[1] && a[2] === b[2] ? 0 : (a[0] * b[0] - (ca ? ca[0] : 0) * (cb ? cb[0] : 0)))) > 1e-12) return false;
    }
    return true;
  }
  function readQ(q) {
    let f = null, m;
    if ((m = /\\iiint_V\s*\(?([^$]*?)\)?\\,\\dd V/.exec(q)) || (m = /\\iint_D\s*\(([^$]*?)\)\\,\\dd A/.exec(q)) || (m = /\\iint_D\s*([^$(]*?)\\,\\dd A/.exec(q))) f = m[1];
    else if ((m = /\\(?:sigma|rho)=([^$]+)\$/.exec(q))) f = m[1];
    else if ((m = /\\Bigl\(\\int_\{[^}]*\}\^\{[^}]*\}\s*\(?([^$]*?)\)?\\,\\dd [xy]\\Bigr\)/.exec(q))) f = m[1];
    const R = {};
    for (const mm of q.matchAll(/(-?[\d.]+)\\leqq\s*([xyz])\\leqq\s*(-?[\d.]+|\\frac\{\\pi\}\{\d\}|\\pi)/g)) R[mm[2]] = [ev(mm[1]), ev(mm[3])];   // はしは数か \pi・\frac{\pi}{2}
    // ふつうの定積分の形：内側の ∫ と外側の ∫
    const nest = /\\int_\{(-?[\d.]+)\}\^\{(-?[\d.]+)\}\\!\\Bigl\(\\int_\{(-?[\d.]+)\}\^\{(-?[\d.]+)\}[\s\S]*?\\dd ([xyz])\\Bigr\)\\dd ([xyz])/.exec(q);
    if (nest) { if (!R[nest[5]]) R[nest[5]] = [+nest[3], +nest[4]]; if (!R[nest[6]]) R[nest[6]] = [+nest[1], +nest[2]]; }
    const P = f != null ? polyParse(f) : null;
    const tri = /\\leqq [xy]\\leqq [xy]\\leqq|三角形/.test(q), circ = /円|おうぎ|輪|x\^2\+y\^2\\leqq|\\leqq r\\leqq|管/.test(q);
    const rect = !!(R.x && R.y) && !tri && !circ && !/切りとった|穴|L字/.test(q);
    return { f, P, R, tri, circ, rect, box: rect && !!R.z };
  }
  const isLin = P => P && P.some(t => t[1] + t[2] + t[3] === 1) && P.every(t => t[1] + t[2] + t[3] <= 1);
  // 数の積分（検算用：シンプソン法）
  function simp(g, a, b, n) { n = n || 200; const h = (b - a) / n; let s = g(a) + g(b); for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * g(a + k * h); return s * h / 3; }
  // 重積分の検算：問題の文に書いた式（TeX）を evalMath で読み、ガウス・ルジャンドル（10点）で数の積分をする。ranges は外側から [文字, はし, はし]（はしは外側の文字の式でよい）
  //   多項式なら19次まで正確、e・sin・cos も 1e-10 くらいまで合う。calc の defint2 は1問 0.2 秒かかり、種200とおりでは遅すぎるので、
  //   calc（defint2・polar）は 0.5％ の問題にだけつける（Q2。check.js の種200とおりで1わざ 2 秒ほど）。ほかの問題も、この別の数の積分でくらべる
  const GLX = [-0.9739065285171717, -0.8650633666889845, -0.6794095682990244, -0.4333953941292472, -0.1488743389816312, 0.1488743389816312, 0.4333953941292472, 0.6794095682990244, 0.8650633666889845, 0.9739065285171717];
  const GLW = [0.0666713443086881, 0.1494513491505806, 0.2190863625159820, 0.2692667193099963, 0.2955242247147529, 0.2955242247147529, 0.2692667193099963, 0.2190863625159820, 0.1494513491505806, 0.0666713443086881];
  function quad(f, ranges, consts) {
    const F0 = M.calcSrc(f), R = ranges.map(([n, a, b]) => [String(n).replace(/^\\/, ''), M.calcSrc(a), M.calcSrc(b)]);
    const rec = (k, vs) => {
      if (k === R.length) { const v = ev(F0, vs); return v == null ? NaN : v; }
      const a = ev(R[k][1], vs), b = ev(R[k][2], vs), m = (a + b) / 2, h = (b - a) / 2;
      let s = 0; for (let i = 0; i < 10; i++) s += GLW[i] * rec(k + 1, Object.assign({}, vs, { [R[k][0]]: m + h * GLX[i] }));
      return s * h;
    };
    return rec(0, Object.assign({}, consts || {}));
  }
  function Q2(r, f, ranges, ans, consts) {
    const o = { verify: p => valIs(p, quad(f, ranges, consts), 1e-8) };
    if (r.chance(0.005)) o.calc = Object.assign({ kind: 'defint2', f, ranges }, ans != null ? { ans: String(ans) } : {}, consts ? { consts } : {});
    return o;
  }
  const kgA = v => `$${fq(v)}\\,\\mathrm{kg}$`;
  const rangeT = (R, names) => names.map((n, k) => `$${R[k][0]}\\leqq ${n}\\leqq ${R[k][1]}$`).join('、');

  // ================================================================ 8-35
  // 例（目録・教科書 8-6 やってみよう・例題1・じぶんでとこう・章末問題1・見わけよう・作ってみよう）の [a, b, c, p, q]
  const BAN35 = new Set(['10,4,6,3,2', '10,5,2,2,1', '12,6,4,2,1', '8,3,4,2,1', '12,4,6,3,1', '6,2,4', '10,4,6', '10,5,2', '12,6,4', '8,3,4', '12,4,6']);
  const bad35 = (a, b, c, p, q) => BAN35.has([a, b, c, p, q].join(',')) || BAN35.has([a, b, c].join(',')) || (p === 2 && q === 2 && F.eq(F.add(fr(a), fr(b + c)), fr(6)));
  add({
    id: '8-35', part: 3, chap: '8-6①', stars: 1,
    banV: [132, 32, 40, 26, 63, 22],
    title: '長方形の板で面密度が1次式なら「まん中の点の値×面積」（積分しない）',
    mark: '$\\iint_D(a+bx+cy)\\,\\dd A$ と長方形の範囲。面密度が1次式の板の質量。',
    futsu: ['内側の定積分で $y$ を止めて', '$x$ で積分し、出てきた $y$ の式を', '外側で $y$ で積分する', '（定積分を2回）。'],
    raku: ['$\\sigma=10+4x+6y$、$0\\leqq x\\leqq3$、$0\\leqq y\\leqq2$', '→ まん中 $(1.5,\\ 1)$ で $10+6+6=22$', '→ 面積6で $22\\times6=132\\,\\mathrm{kg}$', '（定積分を2回しても132）'],
    why: '1次式は平らな坂の形なので、まん中より左（下）で少なすぎる分と、右（上）で多すぎる分が、ちょうど打ち消し合う（8-6①）。だから板全体の平均の面密度は、まん中の点の値になり、質量は「まん中の値×面積」。',
    caution: '使えるのは、範囲が長方形（直方体）で、式が1次式のときだけ。$x^2$ や $y^2$ があると、まん中の値×面積からずれる。角の値を使うと少なめ（多め）になる。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '22mm', s3: '22mm', trap: '22mm' }, boxh: { trap: '10mm' },
    fits(q) { const I = readQ(q); return I.rect && isLin(I.P); },
    steps: {
      // 原点からの長方形
      s1(r) {
        const a = r.int(2, 20), b = r.int(1, 9), c = r.int(1, 9), p = r.int(1, 4), q = r.int(1, 4);
        if (p === q && r.chance(0.6) || bad35(a, b, c, p, q)) return null;
        const mid = F.add(fr(a), F.add(F.mul(fr(b), fr(p, 2)), F.mul(fr(c), fr(q, 2)))), Mv = F.mul(mid, fr(p * q));
        if (Mv[1] !== 1) return null;
        const f = poly([[a, ''], [b, 'x'], [c, 'y']]);
        return { q: `面密度が $\\sigma=${f}$〔$\\mathrm{kg/m^2}$〕の長方形の板（${rangeT([[0, p], [0, q]], ['x', 'y'])}。長さは m）の質量`, a: kgA(Mv), key: `35:${a},${b},${c}|0,${p},0,${q}`,
          easy: `まん中 $${P2(fx(fr(p, 2)), fx(fr(q, 2)))}$ で $\\sigma=${fx(mid)}$、面積 $${p * q}$ で $${fx(mid)}\\times${p * q}=${fq(Mv)}$`,
          ...Q2(r, f, [['y', 0, q], ['x', 0, p]], fq(Mv)) };
      },
      // 原点からずれた長方形・負の係数・平均の面密度
      s2(r) {
        const [k, ok] = alt(r, '35s2', 2);
        const a = r.int(5, 30), b = r.intNot(-4, 6, v => v === 0), c = r.intNot(-4, 6, v => v === 0);
        const x0 = r.int(0, 3), y0 = r.int(0, 3), p = r.int(1, 3), q = r.int(1, 3), X = [x0, x0 + p], Y = [y0, y0 + q];
        if (k === 0 && !x0 && !y0) return null;
        const mx = fr(2 * x0 + p, 2), my = fr(2 * y0 + q, 2), mid = F.add(fr(a), F.add(F.mul(fr(b), mx), F.mul(fr(c), my))), Mv = F.mul(mid, fr(p * q));
        if (Mv[1] !== 1 || mid[0] <= 0 || [X, Y].some(R => a + Math.min(b * X[0], b * X[1]) + Math.min(c * Y[0], c * Y[1]) <= 0) || bad35(a, b, c, p, q)) return null;
        const f = poly([[a, ''], [b, 'x'], [c, 'y']]), rg = rangeT([X, Y], ['x', 'y']);
        if (k === 0) return ok({ q: `面密度が $\\sigma=${f}$〔$\\mathrm{kg/m^2}$〕の長方形の板（${rg}。長さは m）の質量`, a: kgA(Mv), key: `35:${a},${b},${c}|${X},${Y}`,
          easy: `まん中 $${P2(fx(mx), fx(my))}$ で $\\sigma=${fx(mid)}$、面積 $${p * q}$`,
          ...Q2(r, f, [['y', ...Y], ['x', ...X]], fq(Mv)) });
        if (mid[1] !== 1 && !dec(mid)) return null;
        return ok({ q: `面密度が $\\sigma=${f}$〔$\\mathrm{kg/m^2}$〕の長方形の板（${rg}。長さは m）の、平均の面密度（質量÷面積）`, a: `$${fx(mid)}\\,\\mathrm{kg/m^2}$`, key: `35a:${a},${b},${c}|${X},${Y}`,
          easy: `平均はまん中 $${P2(fx(mx), fx(my))}$ の値 $${fx(mid)}$`,
          ...Q2(r, `(${f})/${p * q}`, [['y', ...Y], ['x', ...X]], fx(mid)) });
      },
      // 直方体（密度が1次式）・ふつうの定積分の形
      s3(r) {
        const [k, ok] = alt(r, '35s3', 2);
        if (k === 0) {
          const a = r.int(4, 18) * 50, b = r.int(1, 10) * 20, c = r.int(1, 10) * 20, d = r.int(1, 10) * 20, X = [0, r.pick(['0.2', '0.4', '0.5'])], Y = [0, r.pick(['0.1', '0.2', '0.4'])], Z = [0, r.pick(['0.1', '0.2', '0.3'])];
          const V = F.mul(F.mul(D(X[1]), D(Y[1])), D(Z[1])), mid = [fr(a), F.mul(fr(b), F.div(D(X[1]), fr(2))), F.mul(fr(c), F.div(D(Y[1]), fr(2))), F.mul(fr(d), F.div(D(Z[1]), fr(2)))].reduce(F.add), Mv = F.mul(mid, V);
          if (!dec(Mv) || !dec(mid) || dec(Mv).replace(/^-?\d*\.?/, '').length > 2) return null;
          const f = poly([[a, ''], [b, 'x'], [c, 'y'], [d, 'z']]);
          return ok({ q: `密度が $\\rho=${f}$〔$\\mathrm{kg/m^3}$〕の直方体（$0\\leqq x\\leqq${X[1]}$、$0\\leqq y\\leqq${Y[1]}$、$0\\leqq z\\leqq${Z[1]}$。長さは m）の質量`, a: `$${dec(Mv)}\\,\\mathrm{kg}$`, key: `35b:${f}|${X[1]},${Y[1]},${Z[1]}`,
            easy: `まん中の点の $\\rho=${dec(mid)}$、体積 $${dec(V)}$ で $${dec(mid)}\\times${dec(V)}$`,
            ...Q2(r, f, [['z', 0, Z[1]], ['y', 0, Y[1]], ['x', 0, X[1]]], dec(Mv)) });
        }
        const a = r.int(1, 12), b = r.int(1, 6), c = r.intNot(-5, 6, v => v === 0), p = r.int(1, 4), q = r.int(1, 3);
        const mid = F.add(fr(a), F.add(F.mul(fr(b), fr(p, 2)), F.mul(fr(c), fr(q, 2)))), Iv = F.mul(mid, fr(p * q));
        if (bad35(a, b, c, p, q) || mid[0] <= 0) return null;
        const f = poly([[a, ''], [b, 'x'], [c, 'y']]);
        return ok({ q: `$\\displaystyle\\int_{0}^{${q}}\\!\\Bigl(\\int_{0}^{${p}}(${f})\\,\\dd x\\Bigr)\\dd y$`, a: `$${fq(Iv)}$`, key: `35:${a},${b},${c}|0,${p},0,${q}`,
          easy: `長方形 $0\\leqq x\\leqq${p}$、$0\\leqq y\\leqq${q}$ で1次式。まん中の値 $${fx(mid)}\\times$ 面積 $${p * q}$`,
          ...Q2(r, f, [['y', 0, q], ['x', 0, p]]) });
      },
      // わな：2乗の項がある面密度（8-36・8-37）
      trap(r) {
        const a = r.int(2, 12), b = r.int(1, 6), p = r.int(1, 3), q = r.int(1, 3), onX = r.chance(0.6);
        const T = [[fr(a), 0, 0, 0], onX ? [fr(b), 2, 0, 0] : [fr(b), 0, 2, 0]], Mv = intBox(T, [0, p], [0, q]);
        const f = polyT(T), wrong = F.mul(F.add(fr(a), F.mul(fr(b), onX ? fr(p * p, 4) : fr(q * q, 4))), fr(p * q));
        if (F.eq(wrong, Mv)) return null;
        return dest({ q: `面密度が $\\sigma=${f}$〔$\\mathrm{kg/m^2}$〕の長方形の板（${rangeT([[0, p], [0, q]], ['x', 'y'])}。長さは m）の質量`, a: kgA(Mv), key: `35t:${f}|${p},${q}`,
          ...Q2(r, f, [['y', 0, q], ['x', 0, p]], fq(Mv)) },
        '8-35', `2乗の項があるので、まん中の値×面積（$${fq(wrong)}$）ではずれる。定積分を2回する`, ['8-36']);
      },
    },
  });

  // ================================================================ 8-36
  const BAN36 = new Set(['x^2+3y|0,3,0,2', 'x+y^2', '10+5x+2y']);
  // 「x だけ」×「y だけ」に分かれない、1次式でもない多項式（2〜3項）
  const MON36 = [[2, 0], [0, 1], [1, 1], [0, 2], [1, 0], [2, 1], [1, 2], [0, 0], [3, 0], [0, 3]];
  function rand36(r) {
    const n = r.int(2, 3), ms = r.shuffle(MON36).slice(0, n).sort((u, v) => (v[0] + v[1]) - (u[0] + u[1]) || v[0] - u[0]);
    const T = ms.map(([i, j]) => [fr(r.int(1, 5)), i, j, 0]);
    if (T.every(t => t[1] + t[2] <= 1) || rank1(T.map(t => [F.val(t[0]), t[1], t[2]]))) return null;
    return T;
  }
  add({
    id: '8-36', part: 3, chap: '8-6③④ 例題1', stars: 1,
    banV: [36, 32, 40, 26, 63],
    title: '長方形の重積分は内側から1つずつ：止めた文字の項にも、内側のはばをかける',
    mark: '$\\int_c^d\\!\\Bigl(\\int_a^b f\\,\\dd x\\Bigr)\\dd y$ と長方形の範囲。',
    futsu: ['長方形を細かいタイルに分け、', 'タイルごとに「まん中の値×面積」を', '表計算でたし、タイルを', '細かくしていった先の値を見る。'],
    raku: ['$\\iint(x^2+3y)\\,\\dd A$、$0\\leqq x\\leqq3$、$0\\leqq y\\leqq2$', '内側 $\\Bigl[\\dfrac{x^3}{3}+3xy\\Bigr]_0^3=9+9y$', '（$3y$ にもはば3）', '外側 $\\int_0^2(9+9y)\\,\\dd y=18+18=36$'],
    why: '表の数を全部たすとき、行ごとにたしてから行の合計をたしても同じ（8-6③）。行の合計は「$y$ を止めて $x$ で積分」したもの。止めた $y$ はただの数なので、$3y$ は定数として積分され、はば（$x$ の範囲の長さ）がかかる。長方形なら、順番はどちらでもよい（8-6④）。',
    caution: '内側で $x$ で積分するとき、$3y$ の原始関数は $3y\\,x$（$3y$ を0にしない）。∫ と $\\dd$ は内側どうし・外側どうしで組。内側の答えに $x$ が残ったら、まちがい。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '22mm', s3: '22mm', trap: '18mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) { const I = readQ(q); return I.rect && !I.box && !!I.P && !isLin(I.P) && !rank1(I.P) && !/の式で/.test(q) || /内側の積分/.test(q) && /の式で/.test(q) && !/範囲/.test(q); },
    steps: {
      // 原点からの長方形
      s1(r) {
        const T = rand36(r), p = r.int(1, 3), q = r.int(1, 3); if (!T) return null;
        const f = polyT(T), V = intBox(T, [0, p], [0, q]);
        if (BAN36.has(`${f}|0,${p},0,${q}`) || BAN36.has(f) || V[1] > 6 || F.val(V) > 200) return null;
        return { q: `$\\iint_D(${f})\\,\\dd A$（$D$ は ${rangeT([[0, p], [0, q]], ['x', 'y'])} の長方形）`, a: `$${fq(V)}$`, key: `36:${f}|0,${p},0,${q}`,
          easy: `内側（$y$ を止めて $x$ で）$\\int_0^{${p}}(${f})\\,\\dd x$ は $y$ の式。外側で $y$ で0から${q}まで`,
          ...Q2(r, f, [['y', 0, q], ['x', 0, p]]) };
      },
      // 原点からずれた範囲・負の数の範囲・面密度の板
      s2(r) {
        const [k, ok] = alt(r, '36s2', 2), T = rand36(r); if (!T) return null;
        const f = polyT(T);
        if (k === 0) {
          const x0 = r.int(-2, 2), y0 = r.int(-1, 2), X = [x0, x0 + r.int(1, 3)], Y = [y0, y0 + r.int(1, 2)], V = intBox(T, X, Y);
          if ((!x0 && !y0) || V[1] > 6 || Math.abs(F.val(V)) > 300 || V[0] === 0) return null;
          return ok({ q: `$\\iint_D(${f})\\,\\dd A$（$D$ は ${rangeT([X, Y], ['x', 'y'])} の長方形）`, a: `$${fq(V)}$`, key: `36:${f}|${X},${Y}`,
            easy: `内側で $y$ を止めて $x$ で $${X[0]}$ から $${X[1]}$ まで、外側で $y$ で $${Y[0]}$ から $${Y[1]}$ まで`,   // 負の数は式に（R1-21・Z-7）
            ...Q2(r, f, [['y', ...Y], ['x', ...X]]) });
        }
        const T2 = [[fr(r.int(2, 12)), 0, 0, 0]].concat(T.filter(t => t[1] + t[2] >= 1)), f2 = polyT(T2), p = r.int(1, 3), q = r.int(1, 2), V = intBox(T2, [0, p], [0, q]);
        if (rank1(T2.map(t => [F.val(t[0]), t[1], t[2]])) || isLin(T2.map(t => [1, t[1], t[2], 0])) || V[1] > 6 || Math.abs(F.val(V)) > 300) return null;
        return ok({ q: `面密度が $\\sigma=${f2}$〔$\\mathrm{kg/m^2}$〕の長方形の板（${rangeT([[0, p], [0, q]], ['x', 'y'])}。長さは m）の質量`, a: kgA(V), key: `36:${f2}|0,${p},0,${q}`,
          easy: `$\\iint_D\\sigma\\,\\dd A$ を内側（$x$）、外側（$y$）の順に`,
          ...Q2(r, f2, [['y', 0, q], ['x', 0, p]], fq(V)) });
      },
      // ふつうの定積分の形（$y$ が内側のことも）、内側の積分の答え（$y$ の式）
      s3(r) {
        const [k, ok] = alt(r, '36s3', 2), T = rand36(r), p = r.int(1, 3), q = r.int(1, 3); if (!T) return null;
        const f = polyT(T);
        if (k === 0) {
          const V = intBox(T, [0, p], [0, q]), yIn = r.chance(0.5);
          if (V[1] > 6 || Math.abs(F.val(V)) > 300) return null;
          const nest = yIn ? `\\int_{0}^{${p}}\\!\\Bigl(\\int_{0}^{${q}}(${f})\\,\\dd y\\Bigr)\\dd x` : `\\int_{0}^{${q}}\\!\\Bigl(\\int_{0}^{${p}}(${f})\\,\\dd x\\Bigr)\\dd y`;
          return ok({ q: `$\\displaystyle${nest}$`, a: `$${fq(V)}$`, key: `36:${f}|0,${p},0,${q}`,
            easy: yIn ? `内側は $x$ を止めて $y$ で0から${q}まで（$x$ の項にもはば ${q}）` : `内側は $y$ を止めて $x$ で0から${p}まで（$y$ の項にもはば ${p}）`,
            ...Q2(r, f, yIn ? [['x', 0, p], ['y', 0, q]] : [['y', 0, q], ['x', 0, p]]) });
        }
        // 内側の積分 ∫_0^p f dx を y の式で
        const G = []; for (const [c, i, j] of T) { const m = F.mul(c, F.div(powF(fr(p), i + 1), fr(i + 1))); const g = G.find(t => t[2] === j); if (g) g[0] = F.add(g[0], m); else G.push([m, 0, j, 0]); }
        G.sort((u, v) => v[2] - u[2]);
        const ans = polyT(G);
        if (!G.some(t => t[2] > 0) || G.some(t => t[0][1] > 6)) return null;
        return ok({ q: `内側の積分 $\\displaystyle\\int_{0}^{${p}}(${f})\\,\\dd x$ を $y$ の式で`, a: `$${ans}$`, key: `36i:${f}|${p}`,
          easy: `$y$ はただの数。$y$ だけの項は $\\times${p}$（はば）`,
          verify: pp => { for (const y of [0.37, 1.3, -0.8]) { const want = simp(x => ev(f, { x, y }), 0, p, 400); if (!near(ev(strip(pp.a), { y }), want, 1e-8)) return `y=${y} で ${want} にならない`; } return true; } });
      },
      // わな：三角形の範囲（8-38）
      trap(r) {
        const T = rand36(r), a = r.int(1, 3); if (!T || T.some(t => t[1] + t[2] > 2)) return null;
        const f = polyT(T), V = intT1(T, a);
        if (V[1] > 24) return null;
        return dest({ q: `$\\iint_D(${f})\\,\\dd A$（$D$ は三角形 $0\\leqq y\\leqq x\\leqq${a}$）`, a: `$${fq(V)}$`, key: `36t:${f}|${a}`,
          ...Q2(r, f, [['x', 0, a], ['y', 0, 'x']]) },
        '8-36', `長方形ではない。内側の $y$ の範囲は $0\\leqq y\\leqq x$（外側の文字の式）`, ['8-38']);
      },
    },
  });

  // ================================================================ 8-37
  // 例（目録・教科書 8-6 例題2・じぶんでとこう・章末問題2・見わけよう）の [c, m, n, p, q]（見わけようの $x^2y^3$ は範囲によらず）
  const BAN37 = new Set(['1,1,2,2,3', '1,2,1,3,4', '1,1,3,2,2', '1,2,2,3,1', '1,2,3']);
  const prodT = (c, t) => (F.eq(c, fr(1)) ? t : `${fq(c)}(${t})`);
  // 文字の部分が「x だけ」×「y だけ」のかけ算1つか（多項式でない式：e・sin・cos）
  const isProd = f => !/[+-]/.test(String(f).replace(/\{[^{}]*\}/g, '').replace(/^\s*-/, '')) && /x/.test(f) && /y/.test(f);
  add({
    id: '8-37', part: 3, chap: '8-6④ 例題2', stars: 1,
    banV: [18, 72, 8, 3],
    title: '長方形で $f$ が「$x$ だけ」×「$y$ だけ」なら、2つの定積分のかけ算',
    mark: '$x^my^n$、$e^{x}\\sin y$ のようなかけ算の形と、長方形の範囲。',
    futsu: ['内側の定積分で $y$ を止めて', '$x$ で積分し、出てきた $y$ の式を', '外側で $y$ で積分する', '（定積分を2回）。'],
    raku: ['$\\iint x\\,y^2\\,\\dd A$、$0\\leqq x\\leqq2$、$0\\leqq y\\leqq3$', '→ $\\Bigl(\\int_0^2x\\,\\dd x\\Bigr)\\Bigl(\\int_0^3y^2\\,\\dd y\\Bigr)$', '→ $2\\times9=18$'],
    why: '内側の積分（$x$ で）では、$y$ だけの式 $y^2$ はただの数なので、積分の外に出せる。すると内側は $y^2\\times\\int_0^2x\\,\\dd x$ になり、外側の積分は「数×$\\int_0^3y^2\\,\\dd y$」。だから答えは2つのふつうの定積分のかけ算（8-6④）。',
    caution: '使えるのは、範囲が長方形で、式が「$x$ だけ」×「$y$ だけ」のときだけ。$x+y$ や $xy+1$ のような和は分かれない。三角形の範囲では、かけ算にしてはいけない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '24mm', s3: '24mm', trap: '18mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) {
      const I = readQ(q); if (!I.rect || !I.f) return false;
      if (I.P) return rank1(I.P) && I.P.some(t => t[1]) && I.P.some(t => t[2]);
      return isProd(I.f);
    },
    steps: {
      // c x^m y^n
      s1(r) {
        const c = r.int(1, 4), m = r.int(1, 3), n = r.int(1, 3), p = r.int(1, 3), q = r.int(1, 3);
        if (BAN37.has([c, m, n, p, q].join(',')) || BAN37.has([c, m, n].join(',')) || (m === n && p === q)) return null;
        const T = [[fr(c), m, n, 0]], f = polyT(T), A = intPow(m, 0, p), B = intPow(n, 0, q), V = F.mul(fr(c), F.mul(A, B));
        if (V[1] > 12 || F.val(V) > 200) return null;
        return { q: `$\\iint_D ${f}\\,\\dd A$（$D$ は ${rangeT([[0, p], [0, q]], ['x', 'y'])} の長方形）`, a: `$${fq(V)}$`, key: `37:${f}`,
          easy: `$${c === 1 ? '' : c}\\Bigl(\\int_0^{${p}}${monoT(m, 0)}\\,\\dd x\\Bigr)\\Bigl(\\int_0^{${q}}${monoT(0, n)}\\,\\dd y\\Bigr)=${c === 1 ? '' : c + '\\times'}${fq(A)}\\times${fq(B)}=${fq(V)}$`,
          ...Q2(r, f, [['y', 0, q], ['x', 0, p]]) };
      },
      // e・sin・cos のかけ算
      s2(r) {
        const k = r.int(0, 4), p = r.int(1, 3);
        let fT, X, Y, ans;
        if (k === 0) { fT = 'xe^{y}'; X = [0, p]; Y = [0, 1]; ans = prodT(fr(p * p, 2), 'e-1'); }
        else if (k === 1) { const h = r.chance(0.5); fT = 'e^{x}\\sin y'; X = [0, p]; Y = [0, h ? '\\pi' : '\\frac{\\pi}{2}']; ans = prodT(fr(h ? 2 : 1), p === 1 ? 'e-1' : `e^{${p}}-1`); }
        else if (k === 2) { fT = 'y\\cos x'; X = [0, '\\frac{\\pi}{2}']; Y = [0, p + 1]; ans = fq(fr((p + 1) * (p + 1), 2)); }
        else if (k === 3) { fT = 'x^2\\sin y'; X = [0, p]; Y = [0, '\\pi']; ans = fq(fr(2 * p * p * p, 3)); }
        else { fT = 'ye^{2x}'; X = [0, 1]; Y = [0, p]; ans = prodT(fr(p * p, 4), 'e^{2}-1'); }
        if (fT === 'e^{x}\\sin y' && X[1] === 1 && Y[1] === '\\pi') return null;   // 教科書の「どの場合かな？」の形に近いものも少し
        return { q: `$\\iint_D ${fT}\\,\\dd A$（$D$ は $${X[0]}\\leqq x\\leqq ${X[1]}$、$${Y[0]}\\leqq y\\leqq ${Y[1]}$ の長方形）`, a: `$${ans}$`, key: `37e:${fT}`,
          easy: `「$x$ だけ」の定積分と「$y$ だけ」の定積分をそれぞれ出して、かける`, ...Q2(r, fT, [['y', ...Y], ['x', ...X]]) };
      },
      // かけ算に直せる和（$x^2y+2x^2=x^2(y+2)$）・直方体の3重積分
      s3(r) {
        const [kk, ok] = alt(r, '37s3', 2);
        if (kk === 0) {
          const m = r.int(1, 2), n = r.int(1, 2), c = r.int(1, 3), d = r.int(1, 4), onX = r.chance(0.5), p = r.int(1, 3), q = r.int(1, 3);
          // onX：x^m(c y^n + d)、そうでなければ y^n(c x^m + d)
          const T = onX ? [[fr(c), m, n, 0], [fr(d), m, 0, 0]] : [[fr(c), m, n, 0], [fr(d), 0, n, 0]], f = polyT(T), V = intBox(T, [0, p], [0, q]);
          if (V[1] > 6 || Math.abs(F.val(V)) > 300) return null;
          const fac = onX ? `${monoT(m, 0)}(${poly([[c, monoT(0, n)], [d, '']])})` : `${monoT(0, n)}(${poly([[c, monoT(m, 0)], [d, '']])})`;
          return ok({ q: `$\\iint_D(${f})\\,\\dd A$（$D$ は ${rangeT([[0, p], [0, q]], ['x', 'y'])} の長方形）`, a: `$${fq(V)}$`, key: `37:${f}|${p},${q}`,
            easy: `$${f}=${fac}$ と、かけ算の形に直してから、2つの定積分のかけ算`, ...Q2(r, f, [['y', 0, q], ['x', 0, p]]) });
        }
        const e = [r.int(1, 2), r.int(0, 2), r.int(1, 2)], L = [r.int(1, 3), r.int(1, 3), r.int(1, 2)];
        const T = [[fr(1), ...e]], f = polyT(T), V = intBox(T, [0, L[0]], [0, L[1]], [0, L[2]]);
        if (V[1] > 8 || e[1] === 0 && L[1] === 1) return null;
        return ok({ q: `$\\iiint_V ${f}\\,\\dd V$（$V$ は ${rangeT([[0, L[0]], [0, L[1]], [0, L[2]]], ['x', 'y', 'z'])} の直方体）`, a: `$${fq(V)}$`, key: `37b:${f}|${L}`,
          easy: `3つのふつうの定積分のかけ算：$${['x', 'y', 'z'].map((v, k) => fq(intPow(e[k], 0, L[k]))).join('\\times')}$`,
          ...Q2(r, f, [['z', 0, L[2]], ['y', 0, L[1]], ['x', 0, L[0]]]) });
      },
      // わな：三角形の範囲（8-38）
      trap(r) {
        const a = r.int(1, 3), m = r.int(1, 2), n = r.int(1, 2), T = [[fr(1), m, n, 0]], f = polyT(T), V = intT2(T, a, a), wrong = F.mul(intPow(m, 0, a), intPow(n, 0, a));
        if (F.eq(V, wrong)) return null;
        return dest({ q: `$\\iint_D ${f}\\,\\dd A$（$D$ は頂点が $(0,\\ 0)$、$(${a},\\ 0)$、$(0,\\ ${a})$ の三角形）`, a: `$${fq(V)}$`, key: `37t:${f}|${a}`,
          ...Q2(r, f, [['x', 0, a], ['y', 0, `${a}-x`]]) },
        '8-37', `範囲が三角形なので、かけ算（$${fq(wrong)}$）にはならない。内側の $y$ の範囲は $0\\leqq y\\leqq ${a}-x$`, ['8-38']);
      },
    },
  });

  // ================================================================ 8-38
  // 例（目録・教科書 8-6⑥ 例題3・じぶんでとこう・章末問題6・見わけよう）の [f, a]
  const BAN38 = new Set(['x|2', 'xy|1', 'xy|2', 'y|3', '1|3,2', 'x|3,2', 'y|3,2']);
  const F38 = [['x', [[fr(1), 1, 0, 0]]], ['y', [[fr(1), 0, 1, 0]]], ['xy', [[fr(1), 1, 1, 0]]], ['x^2', [[fr(1), 2, 0, 0]]], ['y^2', [[fr(1), 0, 2, 0]]], ['x+y', [[fr(1), 1, 0, 0], [fr(1), 0, 1, 0]]], ['2x', [[fr(2), 1, 0, 0]]], ['6y', [[fr(6), 0, 1, 0]]]];
  // 三角形の図（たて線1本と、その上下のはし）
  function fig38(kind, a, b, x1) {
    const top = kind === 'T1' ? x => x : x => b - b / a * x, H = kind === 'T1' ? a : b, sc = 7 / (Math.max(a, H) + 0.8);
    const G = M.graph({ x0: 0, x1: a + 1.2, y0: 0, y1: H + 0.8, w: (a + 1.2) * sc, h: (H + 0.8) * sc });
    const V = kind === 'T1' ? [[0, 0], [a, 0], [a, a]] : [[0, 0], [a, 0], [0, b]];
    const items = [['poly', V.map(p => G.T(...p)), { fill: true }], ...G.axes({}),
      ['seg', G.T(x1, 0), G.T(x1, top(x1)), { thick: true }],
      ['label', G.T(x1, top(x1)), kind === 'T1' ? '$y=x$' : `$y=${b}-${fq(fr(b, a)) === '1' ? '' : fq(fr(b, a))}x$`, kind === 'T1' ? 'nw' : 'ne'],
      ['label', G.T(x1, 0), '$y=0$', 's']];
    V.slice(1).forEach(p => items.push(['dot', G.T(...p)], ['label', G.T(...p), `(${p[0]}, ${p[1]})`, p[1] === 0 ? (kind === 'T1' ? 's' : 'ne') : 'e']));
    return { s: 5, items };
  }
  // 答えの「$y\leqq x\leqq 3$」を読んで、はしの式を値でくらべる
  function rangeIs(p, v, lo, hi, vars) {
    const m = /^\$(.*)\\leqq\s*([xy])\\leqq(.*)\$$/.exec(String(p.a).trim());
    if (!m || m[2] !== v) return `答え ${p.a} が読めない`;
    for (const s of [0.3, 1.1, 1.7]) { const vs = { [vars]: s }; if (!near(ev(m[1], vs), lo(s)) || !near(ev(m[3], vs), hi(s))) return `${vars}=${s} ではしがちがう`; }
    return true;
  }
  add({
    id: '8-38', part: 3, chap: '8-6⑥ 例題3', stars: 1,
    banV: [8 / 3, 1 / 8, 2, 4.5, 3],
    title: '三角形は図をかいて範囲を作り直す：内側の範囲は外側の文字の式（順番を変えたら、範囲もかき直す）',
    mark: '$0\\leqq y\\leqq x\\leqq a$ やななめの辺のある三角形の範囲。',
    futsu: ['三角形を細かいタイルに分け、', 'ななめの辺にかかるタイルの', '分け方に気をつけながら', '表計算でたして、細かくしていく。'],
    raku: ['$\\iint_Dx\\,\\dd A$、$0\\leqq y\\leqq x\\leqq2$', 'たて線：$\\int_0^2x\\cdot x\\,\\dd x=\\dfrac83$', '横線：$\\int_0^2\\Bigl(\\int_y^2x\\,\\dd x\\Bigr)\\dd y$', '$=\\int_0^2\\dfrac{4-y^2}{2}\\,\\dd y=\\dfrac83$'],
    why: 'たて線（$x$ を止める）で切ると、切り口は $y=0$ から、ななめの辺の高さまでの線分。上のはしは止めた $x$ で決まるので、内側の範囲は外側の文字の式になる（8-6⑥）。順番を変えて横線で切ると、切り口は左のはしから右のはしまでで、範囲の式も変わる。',
    caution: '外側の範囲はただの数、内側の範囲は外側の文字の式。順番を変えるとき、∫ を入れかえるだけではだめ（図をかき直す）。内側の範囲に、内側で動かす文字を入れない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '34mm', s3: '18mm', trap: '18mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) { const I = readQ(q); return (I.tri && /\\iint|\\int_|質量/.test(q) && !/重心|つり合う/.test(q)) || (/範囲/.test(q) && /順番に直した|たて線で切る|横線で切る/.test(q)); },
    steps: {
      // 0 ≦ y ≦ x ≦ a
      s1(r) {
        const [nm, T] = r.pick(F38), a = r.pick([1, 2, 3, 4, 6]), V = intT1(T, a);
        if (BAN38.has(`${nm}|${a}`) || V[1] > 12 || F.val(V) > 400) return null;
        return { q: `$\\iint_D ${nm.includes('+') ? `(${nm})` : nm}\\,\\dd A$（$D$ は三角形 $0\\leqq y\\leqq x\\leqq${a}$）`, a: `$${fq(V)}$`, key: `38:${nm}|T1,${a}`,
          easy: `たて線：内側 $\\int_0^{x}${nm.includes('+') ? `(${nm})` : nm}\\,\\dd y$ は $x$ の式、外側で $x$ で0から${a}まで`,
          ...Q2(r, nm, [['x', 0, a], ['y', 0, 'x']]) };
      },
      // 頂点が (0,0)・(a,0)・(0,b) の三角形、0 ≦ x ≦ y ≦ a、範囲の作り直し
      s2(r) {
        const [k, ok] = alt(r, '38s2', 3), a = r.pick([1, 2, 3, 4, 6]), b = r.pick([1, 2, 3, 4, 6]);
        if (k === 0) {
          const [nm, T] = r.pick(F38.slice(0, 3).concat([['1', [[fr(1), 0, 0, 0]]]])), V = intT2(T, a, b);
          if (a === b || BAN38.has(`${nm}|${a},${b}`) || V[1] > 12) return null;
          return ok({ q: `$\\iint_D ${nm}\\,\\dd A$（$D$ は頂点が $(0,\\ 0)$、$(${a},\\ 0)$、$(0,\\ ${b})$ の三角形）`, a: `$${fq(V)}$`, key: `38:${nm}|T2,${a},${b}`,
            easy: `ななめの辺は $y=${b}-${fq(fr(b, a)) === '1' ? '' : fq(fr(b, a))}x$。たて線で $0\\leqq y\\leqq ${b}-${fq(fr(b, a)) === '1' ? '' : fq(fr(b, a))}x$、$0\\leqq x\\leqq${a}$`,
            ...Q2(r, nm, [['x', 0, a], ['y', 0, `${b}-${b}/${a}*x`]]) });
        }
        if (k === 1) {
          const [nm, T] = r.pick(F38), V = intT3(T, a);
          if (BAN38.has(`${nm}|${a}`) || V[1] > 12 || F.val(V) > 400) return null;
          return ok({ q: `$\\iint_D ${nm.includes('+') ? `(${nm})` : nm}\\,\\dd A$（$D$ は三角形 $0\\leqq x\\leqq y\\leqq${a}$）`, a: `$${fq(V)}$`, key: `38:${nm}|T3,${a}`,
            easy: `横線（$y$ を止める）：内側 $0\\leqq x\\leqq y$、外側 $0\\leqq y\\leqq${a}$`, ...Q2(r, nm, [['y', 0, a], ['x', 0, 'y']]) });
        }
        // 範囲の作り直し
        if (r.chance(0.5)) {
          const [nm] = r.pick(F38.slice(0, 3));
          return ok({ q: `$\\displaystyle\\int_{0}^{${a}}\\!\\Bigl(\\int_{0}^{x}${nm}\\,\\dd y\\Bigr)\\dd x$ を、先に $x$ で積分する順番に直したときの、内側の $x$ の範囲`, a: `$y\\leqq x\\leqq ${a}$`, key: `38r:T1,${a}`,
            easy: `横線（$y$ を止める）で切ると、左のはしは $x=y$、右のはしは $x=${a}$`, verify: p => rangeIs(p, 'x', y => y, () => a, 'y') });
        }
        if (a === b) return null;
        const s = fr(b, a), sT = fq(s) === '1' ? '' : fq(s);
        return ok({ q: `頂点が $(0,\\ 0)$、$(${a},\\ 0)$、$(0,\\ ${b})$ の三角形を、たて線で切るときの、内側の $y$ の範囲（$x$ の式で）`, a: `$0\\leqq y\\leqq ${b}-${sT}x$`, key: `38r:T2,${a},${b}`,
          easy: `ななめの辺は $(${a},\\ 0)$ と $(0,\\ ${b})$ を通る直線 $y=${b}-${sT}x$`, verify: p => rangeIs(p, 'y', () => 0, x => b - b / a * x, 'x') });
      },
      // 図：三角形とたて線
      s3(r) {
        const T1 = r.chance(0.5), a = r.int(2, 4), b = T1 ? a : r.int(2, 4), [nm, T] = r.pick(F38.slice(0, 5)), V = T1 ? intT1(T, a) : intT2(T, a, b);
        if ((!T1 && a === b) || BAN38.has(`${nm}|${a}`) || V[1] > 12) return null;
        const fig = fig38(T1 ? 'T1' : 'T2', a, b, a * 0.55);
        return { q: `図の三角形の範囲 $D$ で $\\iint_D ${nm}\\,\\dd A$（太い線は、たて線で切った切り口）`, a: `$${fq(V)}$`, key: `38:${nm}|${T1 ? 'T1,' + a : 'T2,' + a + ',' + b}`, fig,
          easy: T1 ? `内側 $0\\leqq y\\leqq x$、外側 $0\\leqq x\\leqq${a}$` : `内側 $0\\leqq y\\leqq ${b}-${fq(fr(b, a)) === '1' ? '' : fq(fr(b, a))}x$、外側 $0\\leqq x\\leqq${a}$`,
          ...Q2(r, nm, [['x', 0, a], ['y', 0, T1 ? 'x' : `${b}-${b}/${a}*x`]]) };
      },
      // わな：円の範囲（8-40）
      trap(r) {
        // 半径は 8-40 のステップ1（1・3・4）と別にし、定数をたした形もまぜる（見わけようで 8-40 の見開きと同じ問題にならないように。R1-30・Z-2）。
        //   半径2の $x^2+y^2$ だけの形は 8-40 の左ページの例（$8\pi$）なのでよける
        const [R, c] = r.pick([[2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]]);
        const f = c ? `x^2+y^2+${c}` : 'x^2+y^2', V = F.add(fr(R ** 4, 2), fr(c * R * R));
        return dest({ q: `$\\iint_D(${f})\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(V)}$`, key: `38t:${R},${c}`,
          verify: p => valIs(p, quad(`(r^2+${c})*r`, [['theta', 0, '2*pi'], ['r', 0, R]]), 1e-8) },
        '8-38', `たて線で切ると、はしが $\\pm\\sqrt{${R * R}-x^2}$ になり、手では計算しにくい。極座標で $\\int_0^{${R}}${c ? `(r^2+${c})` : 'r^2'}\\times2\\pi r\\,\\dd r$`, ['8-40']);
      },
    },
  });

  // ================================================================ 8-39
  // 三角形の重心：検算は、くつひもの式の重心（面積で重みをつけた三角形の分け方）で、頂点の平均とは別の道すじ
  function centroid(V) {
    let A = 0, cx = 0, cy = 0;
    for (let k = 0; k < V.length; k++) { const [x1, y1] = V[k], [x2, y2] = V[(k + 1) % V.length], c = x1 * y2 - x2 * y1; A += c; cx += (x1 + x2) * c; cy += (y1 + y2) * c; }
    return [cx / (3 * A), cy / (3 * A)];
  }
  const vtxT = V => V.map(p => `$${P2(...p)}$`).join('、');
  const BAN39 = new Set(['9,6', '3,2', '6,3', '4,3', '6,6', '3,3']);   // 例（目録・教科書 8-6 例題4・じぶんでとこう・章末問題3・作ってみよう）の [a, b]
  add({
    id: '8-39', part: 3, chap: '8-6⑥ 例題4', stars: 1,
    banV: [[3, 2], [1, 2 / 3], [2, 1], [4 / 3, 1]],
    title: '厚さが一定の三角形の板の重心は、3つの頂点の平均（重積分しなくてよい）',
    mark: '「三角形の板（厚さは一定）の重心」。',
    futsu: ['$\\bar x=\\dfrac{1}{S}\\iint_D x\\,\\dd A$、$\\bar y=\\dfrac{1}{S}\\iint_D y\\,\\dd A$ を', 'たて線で切って計算する', '（ななめの辺の式を作り、', '定積分を2回ずつ）。'],
    raku: ['頂点 $(0,\\ 0)$、$(9,\\ 0)$、$(0,\\ 6)$', '→ $\\Bigl(\\dfrac{0+9+0}{3},\\ \\dfrac{0+0+6}{3}\\Bigr)=(3,\\ 2)$', '（重積分なら $\\dfrac{1}{27}\\iint x\\,\\dd A=\\dfrac{81}{27}=3$）'],
    why: '重心の $x$ 座標は「$x$×タイルの面積」の合計を面積でわったもの（8-6⑥ 例題4）。三角形でこれを計算すると、どの三角形でも3つの頂点の平均になる（4-11 の三角形の重心と同じ）。だから、厚さが一定なら重積分しなくてよい。',
    caution: '使えるのは、厚さ（面密度）が一定のときだけ。面密度が場所で変わる板や、三角形でない板（四角形・半円）では、頂点の平均にならない。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '24mm', s3: '24mm', trap: '20mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) { return /重心|つり合う/.test(q) && /三角形/.test(q) && !/面密度|\\sigma=|半円/.test(q); },
    steps: {
      // (0,0)・(a,0)・(0,b)
      s1(r) {
        const three = r.chance(0.7), a = three ? 3 * r.int(1, 4) : r.int(1, 8), b = three ? 3 * r.int(1, 4) : r.int(1, 8);
        if (BAN39.has(`${a},${b}`) || BAN39.has(`${b},${a}`) || a === b) return null;
        const V = [[0, 0], [a, 0], [0, b]], G = [fr(a, 3), fr(b, 3)];
        return { q: `3つの頂点が ${vtxT(V)} の三角形の板（厚さは一定）の重心`, a: `$${P2(...G.map(fq))}$`, key: `39:${V.map(String).sort().join(';')}`,
          easy: `$\\Bigl(\\frac{0+${a}+0}{3},\\ \\frac{0+0+${b}}{3}\\Bigr)$`, verify: p => vecIs(p.a, centroid(V)) };
      },
      // ふつうの位置の三角形（負の座標も）
      s2(r) {
        const V = [0, 1, 2].map(() => [r.int(-6, 9), r.int(-6, 9)]), Sx = V.reduce((s, p) => s + p[0], 0), Sy = V.reduce((s, p) => s + p[1], 0);
        const area2 = (V[1][0] - V[0][0]) * (V[2][1] - V[0][1]) - (V[2][0] - V[0][0]) * (V[1][1] - V[0][1]);
        if (!area2 || ((Sx % 3 || Sy % 3) && r.chance(0.7)) || !V.some(p => p[0] < 0 || p[1] < 0)) return null;
        return { q: `3つの頂点が ${vtxT(V)} の三角形の板（厚さは一定）の重心`, a: `$${P2(fq(fr(Sx, 3)), fq(fr(Sy, 3)))}$`, key: `39:${V.map(String).sort().join(';')}`,
          easy: `$\\Bigl(\\frac{${V.map((p, i) => (i ? par(p[0]) : p[0])).join('+')}}{3},\\ \\frac{${V.map((p, i) => (i ? par(p[1]) : p[1])).join('+')}}{3}\\Bigr)$`, verify: p => vecIs(p.a, centroid(V)) };
      },
      // 重心から3つめの頂点、重積分の形で書いた重心
      s3(r) {
        const [k, ok] = alt(r, '39s3', 2);
        if (k === 0) {
          const G = [r.int(-2, 4), r.int(-2, 4)], A = [r.int(-4, 6), r.int(-4, 6)], B = [r.int(-4, 6), r.int(-4, 6)], C = [3 * G[0] - A[0] - B[0], 3 * G[1] - A[1] - B[1]];
          const area2 = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
          if (!area2 || Math.abs(C[0]) > 12 || Math.abs(C[1]) > 12) return null;
          return ok({ q: `三角形の板（厚さは一定）の2つの頂点が ${vtxT([A, B])} で、重心が $${P2(...G)}$ のとき、3つめの頂点`, a: `$${P2(...C)}$`, key: `39g:${A};${B};${G}`,
            easy: `3つめを $(p,\\ q)$ とすると $\\frac{${A[0]}+${par(B[0])}+p}{3}=${G[0]}$、$\\frac{${A[1]}+${par(B[1])}+q}{3}=${G[1]}$`,
            verify: p => vecIs(p.a, [0, 1].map(i => 3 * G[i] - A[i] - B[i])) && vecIs(p.a, (() => { const c = M.readVec(p.a).map(t => ev(t)); return centroid([A, B, c]).map((v, i) => v - G[i] + c[i]); })()) });
        }
        const a = 3 * r.int(1, 4), b = 3 * r.int(1, 3), sh = r.int(1, 4), V = [[0, 0], [a, 0], [sh, b]];
        if (sh === a) return null;
        return ok({ q: `$D$ が頂点 ${vtxT(V)} の三角形、$S$ がその面積のとき、$\\Bigl(\\dfrac{1}{S}\\iint_D x\\,\\dd A,\\ \\dfrac{1}{S}\\iint_D y\\,\\dd A\\Bigr)$`, a: `$${P2(fq(fr(a + sh, 3)), fq(fr(b, 3)))}$`, key: `39:${V.map(String).sort().join(';')}`,
          easy: `これは厚さが一定の三角形の板の重心なので、頂点の平均 $\\Bigl(\\frac{0+${a}+${sh}}{3},\\ \\frac{0+0+${b}}{3}\\Bigr)$`,
          verify: p => { const S = a * b / 2; return vecIs(p.a, [quad('x', [['y', 0, b], ['x', `${sh}*y/${b}`, `${a}+(${sh}-${a})*y/${b}`]]) / S, quad('y', [['y', 0, b], ['x', `${sh}*y/${b}`, `${a}+(${sh}-${a})*y/${b}`]]) / S], 1e-8); } });
      },
      // わな：面密度が場所で変わる三角形の板の質量（8-38）
      trap(r) {
        const a = r.int(2, 6), b = r.int(1, 4), c = r.int(1, 3), onX = r.chance(0.5), Mv = F.mul(fr(c), onX ? fr(a * a * b, 6) : fr(a * b * b, 6));
        if (Mv[1] !== 1 && Mv[1] > 3) return null;
        const sig = poly([[c, onX ? 'x' : 'y']]);
        return dest({ q: `3つの頂点が $(0,\\ 0)$、$(${a},\\ 0)$、$(0,\\ ${b})$ の三角形の板（長さは m）で、面密度が $\\sigma=${sig}$〔$\\mathrm{kg/m^2}$〕のときの質量`, a: kgA(Mv), key: `39t:${a},${b},${sig}`,
          ...Q2(r, sig, [['x', 0, a], ['y', 0, `${b}-${b}/${a}*x`]], fq(Mv)) },
        '8-39', `厚さが一定ではない。$\\iint_D${sig}\\,\\dd A$ を、内側 $0\\leqq y\\leqq ${b}-${fq(fr(b, a)) === '1' ? '' : fq(fr(b, a))}x$ で計算する`, ['8-38']);
      },
    },
  });

  // ================================================================ 8-40
  // 極座標の検算：x=r cosθ、y=r sinθ を入れて、r dr dθ でガウス・ルジャンドル（円のはしの √ のとがりが出ない）
  function quadPolar(fT, t0, t1, r0, r1) {
    const F0 = M.calcSrc(fT), g = (t, rr) => ev(F0, { x: rr * Math.cos(t), y: rr * Math.sin(t) }) * rr;
    let s = 0; const NP = 8, rm = (r0 + r1) / 2, rh = (r1 - r0) / 2;   // 角の向きは8つに分けて（cos^3 なども正確に）
    for (let k = 0; k < NP; k++) {
      const a = t0 + (t1 - t0) * k / NP, b = t0 + (t1 - t0) * (k + 1) / NP, tm = (a + b) / 2, th = (b - a) / 2;
      for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) s += GLW[i] * GLW[j] * g(tm + th * GLX[i], rm + rh * GLX[j]) * th;
    }
    return s * rh;
  }
  // calc（polar）の f は r・θ の式なので、x→r cosθ、y→r sinθ と書きかえて渡す（0.5％ の問題だけ）
  const P40 = (r, fT, t1, r0, r1) => {
    const o = { verify: p => valIs(p, quadPolar(fT, 0, t1, r0, r1), 1e-8) };
    if (r.chance(0.005)) o.calc = { kind: 'polar', f: String(fT).replace(/x/g, '(r\\cos\\theta)').replace(/y/g, '(r\\sin\\theta)'), r: [r0, r1], theta: [0, fmt(t1 / Math.PI) + '*pi'] };
    return o;
  };
  // f が中心からの距離 r だけで決まるか（x^2+y^2 のまとまり・√ だけ）
  //   「2x^2+y^2」の中の「x^2+y^2」は、まとまりとみない（前が数のときは、x^2 に係数がついている）
  const onlyR = f => !/[xy]/.test(String(f).replace(/(^|[+({])x\^2\+y\^2|-x\^2-y\^2/g, '$1'));
  const BAN40 = new Set(['0.1|0.05|2', 'disk2', 'ring?']);
  add({
    id: '8-40', part: 3, chap: '8-6⑦ 例題7・8-3⑧ 例題8', stars: 1,
    banV: [8 * Math.PI, 0.01],
    title: '円は極座標：タイルは $r\\,\\dd r\\,\\dd\\theta$（$r$ を忘れない）。$f$ が $r$ だけなら細い輪 $2\\pi r\\,\\dd r$ で1回',
    mark: '円・おうぎ形・輪の範囲、$x^2+y^2$、管を流れる水の量。',
    futsu: ['たて線で切って、範囲を', '$-\\sqrt{R^2-x^2}\\leqq y\\leqq\\sqrt{R^2-x^2}$ と書き、', '$\\sqrt{\\phantom{2}}$ の入った', '定積分を2回する。'],
    raku: ['円の面積 $\\int_0^{2\\pi}\\!\\int_0^R r\\,\\dd r\\,\\dd\\theta=\\pi R^2$', '（$r$ がないと $2\\pi R$）', '$\\iint_{r\\leqq2}(x^2+y^2)\\,\\dd A$', '$=\\int_0^2r^2\\cdot2\\pi r\\,\\dd r=8\\pi$'],
    why: '極座標なら円は $0\\leqq r\\leqq R$、$0\\leqq\\theta\\leqq2\\pi$ と、ただの数の範囲になる。タイルは、たて $\\dd r$、横は半径 $r$ の弧で $r\\,\\dd\\theta$ なので、面積は $r\\,\\dd r\\,\\dd\\theta$（8-6⑦）。$f$ が $r$ だけなら $\\theta$ の積分は $2\\pi$ になり、細い輪 $2\\pi r\\,\\dd r$ でたす1回の定積分になる。',
    caution: '$x^2+y^2=r^2$、$\\sqrt{x^2+y^2}=r$ と書きかえる。$r$ を忘れると、答えが長さの単位になる。4分の1の円は $\\theta$ を0から $\\frac{\\pi}{2}$ まで。輪は $r$ を内の半径から外の半径まで。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '24mm', trap: '18mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) {
      if (/タイル/.test(q) && /\\dd r/.test(q)) return true;
      if (/管/.test(q) && /流量|平均の速さ/.test(q)) return true;
      const I = readQ(q);
      return I.circ && !!I.f && onlyR(I.f) && !/重心|断面二次|半円/.test(q);
    },
    steps: {
      // タイルの面積、円の上の ∬(x^2+y^2)
      s1(r) {
        const [k, ok] = alt(r, '40s1', 2);
        if (k === 0) {
          const rr = r.pick(['1.5', '2.5', '3', '4', '5']), dr = r.pick(['0.1', '0.2']), dt = r.pick(['0.02', '0.04', '0.1']), A = F.mul(F.mul(D(rr), D(dr)), D(dt));
          if (BAN40.has(`${dr}|${dt}|${rr}`)) return null;
          return ok({ q: `極座標のタイル（中心からの距離 $r=${rr}$ の所で、$\\dd r=${dr}$、$\\dd\\theta=${dt}$ の輪のかけら）の面積 $r\\,\\dd r\\,\\dd\\theta$`, a: `$${dec(A)}$`, key: `40t:${rr},${dr},${dt}`,
            easy: `たて $${dr}$、横 $r\\,\\dd\\theta=${rr}\\times${dt}=${dec(F.mul(D(rr), D(dt)))}$`, verify: p => valIs(p, +rr * +dr * +dt, 1e-9) });
        }
        const R = r.pick([1, 3, 4]), c = r.pick([0, 0, 1, 2, 3]), f = c ? `x^2+y^2+${c}` : 'x^2+y^2', V = F.add(fr(R ** 4, 2), fr(c * R * R));
        return ok({ q: `$\\iint_D(${f})\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(V)}$`, key: `40d:${f}|${R}`,
          easy: `細い輪：$\\int_0^{${R}}${c ? `(r^2+${c})` : 'r^2'}\\times2\\pi r\\,\\dd r$`, ...P40(r, f, 2 * Math.PI, 0, R) });   // 要らないかっこを書かない（R1-30・Z-10）
      },
      // √(x^2+y^2)、R^2−x^2−y^2、輪、4分の1の円
      s2(r) {
        const k = r.int(0, 3), R = r.pick([1, 3, 4]);
        if (k === 0) return { q: `$\\iint_D\\sqrt{x^2+y^2}\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(fr(2 * R ** 3, 3))}$`, key: `40s:${R}`,
          easy: `$\\sqrt{x^2+y^2}=r$。$\\int_0^{${R}}r\\times2\\pi r\\,\\dd r$`, ...P40(r, '\\sqrt{x^2+y^2}', 2 * Math.PI, 0, R) };
        if (k === 1) { const f = `${R * R}-x^2-y^2`; return { q: `$\\iint_D(${f})\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(fr(R ** 4, 2))}$`, key: `40h:${R}`,
          easy: `$\\int_0^{${R}}(${R * R}-r^2)\\times2\\pi r\\,\\dd r$`, ...P40(r, f, 2 * Math.PI, 0, R) }; }
        if (k === 2) {
          const a = r.int(1, 2), b = a + r.int(1, 2), one = r.chance(0.5), f = one ? '1' : 'x^2+y^2', V = one ? fr(b * b - a * a) : fr(b ** 4 - a ** 4, 2);
          return { q: `$\\iint_D${one ? '1' : '(x^2+y^2)'}\\,\\dd A$（$D$ は輪 $${a * a}\\leqq x^2+y^2\\leqq${b * b}$）`, a: `$${piTeX(V)}$`, key: `40r:${f}|${a},${b}`,
            easy: `$r$ を ${a} から ${b} まで：$\\int_{${a}}^{${b}}${one ? '' : 'r^2\\times'}2\\pi r\\,\\dd r$`, ...P40(r, f, 2 * Math.PI, a, b) };
        }
        return { q: `$\\iint_D(x^2+y^2)\\,\\dd A$（$D$ は $x^2+y^2\\leqq${R * R}$、$x\\geqq0$、$y\\geqq0$ の4分の1の円）`, a: `$${piTeX(fr(R ** 4, 8))}$`, key: `40q:${R}`,
          easy: `$\\theta$ は0から $\\frac{\\pi}{2}$：$\\frac{\\pi}{2}\\int_0^{${R}}r^2\\times r\\,\\dd r$`, ...P40(r, 'x^2+y^2', Math.PI / 2, 0, R) };
      },
      // 管を流れる水の量（流量・平均の速さ）
      s3(r) {
        const [k, ok] = alt(r, '40s3', 2), R = r.pick(['0.5', '1', '1.5', '2', '3']), u = r.pick(['0.1', '0.2', '0.3', '0.4', '0.6', '0.8']);
        if (['1|0.2', '2|0.5', '0.5|0.4'].includes(`${R}|${u}`)) return null;   // 教科書 8-6 例題7・じぶんでとこう・章末問題の管
        const Q = F.mul(F.mul(D(u), fr(50)), F.mul(D(R), D(R)));   // π×(100u)×R^2/2（mL/s）
        const uT = `u=u_{\\max}\\Bigl(1-\\dfrac{r^2}{R^2}\\Bigr)`;
        const flow = () => simp(rr => 100 * +u * (1 - rr * rr / (+R * +R)) * 2 * Math.PI * rr, 0, +R, 200);
        if (k === 0) return ok({ q: `半径 $R=${R}\\,\\mathrm{cm}$ の管の中を、水がゆっくり流れています。中心からの距離 $r$ の所の速さは $${uT}$、$u_{\\max}=${u}\\,\\mathrm{m/s}$ です。流量（1秒に流れる水の体積）を $\\mathrm{mL/s}$ で（$\\pi$ を残す）`,
          a: `$${piTeX(Q)}\\,\\mathrm{mL/s}$`, key: `40p:${R},${u}`,
          easy: `$u_{\\max}=${fx(F.mul(D(u), fr(100)))}\\,\\mathrm{cm/s}$。細い輪で $\\dfrac{\\pi u_{\\max}R^2}{2}$`, verify: p => valIs(p, flow(), 1e-8) });
        return ok({ q: `半径 $R=${R}\\,\\mathrm{cm}$ の管で、中心からの距離 $r$ の所の速さが $${uT}$、$u_{\\max}=${u}\\,\\mathrm{m/s}$ のとき、平均の速さ（流量÷切り口の面積）`,
          a: `$${dec(F.div(D(u), fr(2)))}\\,\\mathrm{m/s}$`, key: `40v:${R},${u}`,
          easy: `流量 $\\dfrac{\\pi u_{\\max}R^2}{2}$ を $\\pi R^2$ でわると $\\dfrac{u_{\\max}}{2}$`, verify: p => valIs(p, flow() / (Math.PI * +R * +R) / 100, 1e-8) });
      },
      // わな：正方形の範囲（8-36）
      trap(r) {
        const a = r.int(1, 3), cen = r.chance(0.6);
        if (cen && a === 1) return null;
        const X = cen ? [-a, a] : [0, a], V = intBox([[fr(1), 2, 0, 0], [fr(1), 0, 2, 0]], X, X);
        return dest({ q: `$\\iint_D(x^2+y^2)\\,\\dd A$（$D$ は正方形 $${X[0]}\\leqq x\\leqq${X[1]}$、$${X[0]}\\leqq y\\leqq${X[1]}$）`, a: `$${fq(V)}$`, key: `40t:${X}`,
          ...Q2(r, 'x^2+y^2', [['y', ...X], ['x', ...X]]) },
        '8-40', `正方形は極座標にしない（$r$ の範囲が角で変わる）。長方形の範囲なので、内側から1つずつ`, ['8-36']);
      },
    },
  });

  // 8-40 の見開きで、ステップ1・2・3 に同じ答えを2回出さない（$\iint(x^2+y^2)$ と $\iint(9-x^2-y^2)$ がどちらも $\frac{81\pi}{2}$ など。R1-30・Z-2）。
  //   使いきったら（アプリで多く出すとき）、よけない
  for (const s of ['s1', 's2', 's3']) {
    const f = M.waza['8-40'].steps[s];
    M.waza['8-40'].steps[s] = r => {
      const p = f(r); if (!p) return p;
      const u = r.a40 || (r.a40 = new Set()), a = String(p.a);
      if (u.has(a) && u.size < 20) return null;
      u.add(a); return p;
    };
  }

  // ================================================================ 8-41
  // 対称性：折り返して符号が変わる項は0、90°回して入れかわる量は同じ
  const BAN41 = new Set(['0.15', '0.3', '0.6']);   // 教科書 8-6 例題5・じぶんでとこう・章末問題の半円の半径
  // 半円の重心（4R/3π）の近似：π=3.14 で小数第3位まで。ほんとうの値とくいちがう組・境目の組はよける（O-4）
  const r3 = x => Math.round(x * 1000 + 1e-9) / 1000;
  add({
    id: '8-41', part: 3, chap: '8-6⑨ 例題5・例題6', stars: 1,
    title: '対称性を先に使う：折り返して符号が変わる量は0、90°回して入れかわる量は同じ',
    mark: '中心が原点の円・正方形と $x$、$y$、$y^2$。半円の重心。',
    futsu: ['$x$ の項も $y^2$ の項も、', '極座標に直して $\\cos\\theta$・$\\sin^2\\theta$ を', '0から $2\\pi$ まで積分し、', 'すべてを計算する。'],
    raku: ['半円（半径 $R$、$y\\geqq0$）→ $\\bar x=0$（左右対称）', '$\\bar y=\\dfrac{2R^3/3}{\\pi R^2/2}=\\dfrac{4R}{3\\pi}$', '円の $\\iint y^2\\,\\dd A=\\dfrac12\\iint r^2\\,\\dd A$', '$=\\dfrac{\\pi R^4}{4}=\\dfrac{\\pi d^4}{64}$'],
    why: '左右対称な範囲では、点 $(x,\\ y)$ と $(-x,\\ y)$ のタイルで $x$ の値が打ち消し合うので、$\\iint x\\,\\dd A=0$（8-6⑨）。円を90°回すと $x$ と $y$ が入れかわるので $\\iint x^2\\,\\dd A=\\iint y^2\\,\\dd A$、たすと $\\iint r^2\\,\\dd A$ なので、それぞれその半分。',
    caution: '0になるのは、範囲が対称で、折り返すと符号が変わる項（$x$、$x^3$、$xy$）だけ。定数や $x^2$ は0にならない。半円の $\\bar y$ は0ではない（上半分だけなので）。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '24mm', s3: '24mm', trap: '18mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) {
      if (/半円/.test(q) && /重心/.test(q)) return true;
      if (/断面二次モーメント|丸い棒/.test(q) && !/パイプ|穴|輪/.test(q)) return true;
      const I = readQ(q); if (!I.P) return false;
      const sym = /円 \$?x\^2\+y\^2\\leqq/.test(q) || (I.R.x && I.R.y && I.R.x[0] === -I.R.x[1] && I.R.y[0] === -I.R.y[1]);
      if (!sym) return false;
      // sq：円で、$x^2$ だけ・$y^2$ だけ、または係数のちがう $ax^2+by^2$（90°回して入れかわる）
      const pure = t => (t[1] === 2 && !t[2]) || (t[2] === 2 && !t[1]);
      const odd = I.P.some(t => t[1] % 2 || t[2] % 2), sq = /円/.test(q) && I.P.every(pure) && (I.P.length === 1 || (I.P.length === 2 && I.P[0][1] !== I.P[1][1] && JSON.stringify(I.P[0][0]) !== JSON.stringify(I.P[1][0])));
      return odd || sq;
    },
    steps: {
      // 折り返しで0になる項 ＋ 定数
      s1(r) {
        const circ = r.chance(0.5), R = r.int(1, 3), b = r.int(1, 6), c = r.intNot(-5, 5, v => v === 0), odd = r.pick(['x', 'y', 'x^3', 'xy', 'y^3']);
        const f = poly([[b, ''], [c, odd]]), area = circ ? null : fr(4 * R * R);
        const V = circ ? fr(b * R * R) : F.mul(fr(b), area);
        const q = circ ? `$\\iint_D(${f})\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）` : `$\\iint_D(${f})\\,\\dd A$（$D$ は正方形 $${-R}\\leqq x\\leqq${R}$、$${-R}\\leqq y\\leqq${R}$）`;
        return { q, a: `$${circ ? piTeX(V) : fq(V)}$`, key: `41:${f}|${circ ? 'c' : 's'}${R}`,
          easy: `$${poly([[c, odd]])}$ の部分は折り返しで打ち消して0。$${b}\\times$ 面積 $${circ ? piTeX(fr(R * R)) : 4 * R * R}$`,
          ...(circ ? P40(r, f, 2 * Math.PI, 0, R) : Q2(r, f, [['y', -R, R], ['x', -R, R]])) };
      },
      // 半円の重心、円の ∬x^2・∬y^2、円の ∬(ax^2+by^2)
      //   半円は1つの見開きに1問まで（半円どうしは、回しただけ・何倍かになる）。円の半径は見開きで同じものを使わない（$x^2$ と $y^2$ の入れかえで答えが同じ。R1-22・Z-2）
      s2(r) {
        const st = r.s41 || (r.s41 = { n: r.int(0, 2), semi: 0, R: new Set() });
        let kind = st.n % 3;
        if (kind === 0 && st.semi >= 1 && st.n < 20) kind = 1 + r.int(0, 1);
        if (kind === 0) {
          const R = r.pick([3, 6, 9, 1.5]), up = r.chance(0.6), c = F.div(F.mul(fr(4), D(String(R))), fr(3)), cT = c[1] === 1 ? `\\frac{${c[0]}}{\\pi}` : `\\frac{${c[0]}}{${c[1]}\\pi}`;
          st.n++; st.semi++;
          return { q: `半径 $${fmt(R)}$ の半円の板（$x^2+y^2\\leqq${fmt(R * R)}$、$${up ? 'y' : 'x'}\\geqq0$。厚さは一定）の重心`, a: `$${up ? P2(0, cT) : P2(cT, 0)}$`, key: `41h:${R},${up}`,
            easy: `${up ? '左右' : '上下'}対称なので $\\bar ${up ? 'x' : 'y'}=0$。$\\bar ${up ? 'y' : 'x'}=\\frac{4R}{3\\pi}$`,
            verify: p => { const S = Math.PI * R * R / 2, m = quadPolar(up ? 'y' : 'x', up ? 0 : -Math.PI / 2, up ? Math.PI : Math.PI / 2, 0, R) / S; return vecIs(p.a, up ? [0, m] : [m, 0], 1e-8); } };
        }
        const R = kind === 1 ? r.pick([1, 3, 5]) : r.pick([1, 2, 3, 4]);
        if (st.R.has(R) && st.R.size < 5) return null;
        st.n++; st.R.add(R);
        if (kind === 1) {
          const w = r.pick(['x', 'y']);
          return { q: `$\\iint_D ${w}^2\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(fr(R ** 4, 4))}$`, key: `41q:${R}`,
            easy: `$\\iint ${w}^2\\,\\dd A=\\frac12\\iint r^2\\,\\dd A=\\frac12\\int_0^{${R}}r^2\\times2\\pi r\\,\\dd r$`, ...P40(r, `${w}^2`, 2 * Math.PI, 0, R) };
        }
        // ∬(ax^2+by^2)（a≠b）：90°回して $\iint x^2=\iint y^2=\frac{\pi R^4}{4}$ なので $(a+b)\frac{\pi R^4}{4}$
        const a = r.int(1, 3), b = r.intNot(1, 3, v => v === a), f = poly([[a, 'x^2'], [b, 'y^2']]), V = fr((a + b) * R ** 4, 4);
        return { q: `$\\iint_D(${f})\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(V)}$`, key: `41ab:${Math.min(a, b)},${Math.max(a, b)},${R}`,
          easy: `90°回して $\\iint x^2\\,\\dd A=\\iint y^2\\,\\dd A=\\frac{\\pi R^4}{4}$ なので $(${a}+${b})\\times\\frac{\\pi\\times${R ** 4}}{4}$`, ...P40(r, f, 2 * Math.PI, 0, R) };
      },
      // 丸い棒の断面二次モーメント、半円の重心の約の値
      s3(r) {
        const [k, ok] = alt(r, '41s3', 2);
        if (k === 0) {
          const d = r.pick([4, 8, 12]), V = fr(d ** 4, 64);
          return ok({ q: `直径 $${d}\\,\\mathrm{cm}$ の丸い棒の切り口（中心が原点の円）の断面二次モーメント $\\iint_D y^2\\,\\dd A$（$\\mathrm{cm^4}$ で、$\\pi$ を残す）`, a: `$${piTeX(V)}\\,\\mathrm{cm^4}$`, key: `41d:${d}`,
            easy: `90°回して同じなので $\\frac12\\iint r^2\\,\\dd A=\\frac{\\pi R^4}{4}=\\frac{\\pi d^4}{64}$`, verify: p => valIs(p, quadPolar('y^2', 0, 2 * Math.PI, 0, d / 2), 1e-8) });
        }
        const R = r.pick(['0.9', '1.2', '0.45', '2.4', '1.8', '0.75']);
        if (BAN41.has(R)) return null;
        const ap = r3(4 * +R / (3 * 3.14)), tr = 4 * +R / (3 * Math.PI);
        if (ap !== r3(tr) || Math.abs(Math.abs(tr * 1000) % 1 - 0.5) < 0.05) return null;   // O-4
        return ok({ q: `半径 $${R}\\,\\mathrm{m}$ の半円の板（$y\\geqq0$。厚さは一定）の重心（$\\pi=3.14$ とし、小数第3位まで）`, a: `約 $${P2(0, ap.toFixed(3))}$（m）`, key: `41a:${R}`,
          easy: `$\\bar y=\\frac{4R}{3\\pi}=\\frac{4\\times${R}}{3\\times3.14}\\approx${ap.toFixed(3)}$`, verify: p => vecIs(p.a, [0, tr], 0, 0.0005 + 1e-9) });
      },
      // わな：r だけの式（8-40。対称性では値が出ない）
      trap(r) {
        const R = r.int(1, 3);
        return dest({ q: `$\\iint_D\\sqrt{x^2+y^2}\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(fr(2 * R ** 3, 3))}$`, key: `41t:${R}`, ...P40(r, '\\sqrt{x^2+y^2}', 2 * Math.PI, 0, R) },
          '8-41', `折り返しても符号は変わらず、0にはならない。$\\sqrt{x^2+y^2}=r$ だけの式なので、細い輪で $\\int_0^{${R}}r\\times2\\pi r\\,\\dd r$`, ['8-40']);
      },
    },
  });

  // ================================================================ 8-42
  // 例（目録・教科書 8-6 例題10・じぶんでとこう・章末問題）のパイプ [D, d]（cm に直して）と、D=2d の形はよける
  const BAN42 = new Set(['4,3', '6,4', '5,4']);
  const piMinus = (a, c) => `${fq(a)}-${piTeX(c)}`;   // 「24-2\pi」
  // L字の板：[0,A]×[0,B] から [a,A]×[b,B] を切りとった形
  function L42(r) {
    const A = r.int(3, 6), B = r.int(3, 6), a = r.int(1, A - 1), b = r.int(1, B - 1);
    const big = [[0, A], [0, B]], cut = [[a, A], [b, B]], S = A * B - (A - a) * (B - b);
    const Sx = F.sub(F.mul(fr(A * A, 2), fr(B)), F.mul(fr(A * A - a * a, 2), fr(B - b))), Sy = F.sub(F.mul(fr(B * B, 2), fr(A)), F.mul(fr(B * B - b * b, 2), fr(A - a)));
    return { A, B, a, b, S, Sx, Sy, txt: `L字の板（${rangeT(big, ['x', 'y'])} の長方形から、${rangeT(cut, ['x', 'y'])} の長方形を切りとった形）`,
      parts: [[[0, a], [0, B]], [[a, A], [0, b]]] };   // 検算用：切りとらずに、2つの長方形に分けた形
  }
  add({
    id: '8-42', part: 3, chap: '8-6⑨ 例題10', stars: 1,
    title: '和・差に分ける：穴のあいた形は「大きい形－小さい形」',
    mark: 'パイプ、穴のあいた板、L字の板。',
    futsu: ['穴のあいた形のまま、', '範囲を場所ごとに書き分けて', '（穴の上・下・横）、', '重積分をいくつも計算する。'],
    raku: ['パイプ（外の直径 $D$、内の直径 $d$）', '→ $\\dfrac{\\pi D^4}{64}-\\dfrac{\\pi d^4}{64}$', '$D=2d$ なら $\\dfrac{15\\pi d^4}{64}$', '（丸い棒の $\\dfrac{15}{16}$）'],
    why: '重積分は「タイルの量をたしたもの」なので、範囲を分ければ、それぞれの重積分の和になる（8-6⑨）。穴のあいた形は「大きい形」から「穴の形」のタイルをひけばよい。それぞれは、知っている形（円・長方形）の答えが使える。',
    caution: 'ひくのは、穴の形の重積分（同じ式・同じ原点で）。直径と半径を取りちがえない（$\\frac{\\pi d^4}{64}=\\frac{\\pi R^4}{4}$）。面積をひいてから式をかけてはいけない（$y^2$ などは場所で変わる）。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '22mm', s3: '24mm', trap: '18mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) { return /パイプ|穴|L字|切りとった/.test(q); },
    steps: {
      // パイプの断面二次モーメント、穴のあいた板の面積・質量
      s1(r) {
        const [k, ok] = alt(r, '42s1', 2);
        if (k === 0) {
          const D = r.pick([3, 4, 5, 6, 8, 10]), d = r.int(1, D - 1), V = fr(D ** 4 - d ** 4, 64);
          if (D === 2 * d || BAN42.has(`${D},${d}`) || V[1] > 16) return null;
          return ok({ q: `外の直径 $${D}\\,\\mathrm{cm}$、内の直径 $${d}\\,\\mathrm{cm}$ のパイプの切り口の断面二次モーメント $\\iint_D y^2\\,\\dd A$（$\\mathrm{cm^4}$ で、$\\pi$ を残す）`, a: `$${piTeX(V)}\\,\\mathrm{cm^4}$`, key: `42p:${D},${d}`,
            easy: `$\\frac{\\pi\\times${D}^4}{64}-\\frac{\\pi\\times${d}^4}{64}=\\frac{${D ** 4 - d ** 4}\\pi}{64}=${piTeX(V)}$`, verify: p => valIs(p, quadPolar('y^2', 0, 2 * Math.PI, d / 2, D / 2), 1e-8) });
        }
        const a = r.int(3, 8), b = r.int(2, 6), rho = r.int(1, Math.min(a, b) - 1) / 2, s = r.int(1, 4), cx = a / 2, cy = b / 2;
        if (2 * rho >= Math.min(a, b)) return null;
        const S = fr(a * b * s), C = F.mul(fr(s), F.mul(D(String(rho)), D(String(rho))));
        return ok({ q: `たて ${b} m、横 ${a} m の長方形の板のまん中に、半径 $${fmt(rho)}\\,\\mathrm{m}$ の丸い穴があいています。面密度が $${s}\\,\\mathrm{kg/m^2}$ で一定のときの、板の質量`, a: `$(${piMinus(S, C)})\\,\\mathrm{kg}$`, key: `42h:${a},${b},${rho},${s}`,
          easy: `長方形 $${a * b}\\times${s}$ から、穴 $\\pi\\times${par(fmt(rho))}^2\\times${s}$ をひく`,
          verify: p => { const t = strip(p.a).replace(/\\,\\mathrm\{kg\}$/, ''); const v = ev(t); const num = s * simp(x => b - (Math.abs(x - cx) < rho ? 2 * Math.sqrt(Math.max(0, rho * rho - (x - cx) ** 2)) : 0), 0, a, 4000); return near(v, num, 1e-5) || `答え ${p.a} が ${num} でない`; } });
      },
      // L字の板の ∬x・面積の質量、四角いパイプ
      s2(r) {
        const [k, ok] = alt(r, '42s2', 2);
        if (k === 0) {
          const L = L42(r), w = r.chance(0.5) ? 'x' : 'y', V = w === 'x' ? L.Sx : L.Sy;
          if (V[1] > 2) return null;
          return ok({ q: `${L.txt}で $\\iint_D ${w}\\,\\dd A$`, a: `$${fq(V)}$`, key: `42L:${L.A},${L.B},${L.a},${L.b},${w}`,
            easy: `大きい長方形の $\\iint ${w}\\,\\dd A$ から、切りとった長方形の $\\iint ${w}\\,\\dd A$ をひく`,
            verify: p => valIs(p, L.parts.reduce((s, [X, Y]) => s + quad(w, [['y', ...Y], ['x', ...X]]), 0), 1e-8) });
        }
        const B = r.int(3, 8), b = r.int(1, B - 2), V = fr(B ** 4 - b ** 4, 12);
        if (B % 2 !== b % 2 || V[1] > 3) return null;
        return ok({ q: `外の1辺 $${B}\\,\\mathrm{cm}$、内の1辺 $${b}\\,\\mathrm{cm}$ の四角いパイプ（切り口の中心が原点、辺は軸に平行）の断面二次モーメント $\\iint_D y^2\\,\\dd A$（$\\mathrm{cm^4}$）`, a: `$${fq(V)}\\,\\mathrm{cm^4}$`, key: `42s:${B},${b}`,
          easy: `1辺 $a$ の正方形は $\\int_{-a/2}^{a/2}\\!\\int_{-a/2}^{a/2}y^2\\,\\dd x\\,\\dd y=\\frac{a^4}{12}$。$\\frac{${B}^4-${b}^4}{12}$`,
          verify: p => { const h = B / 2, g = b / 2; return valIs(p, quad('y^2', [['y', -h, h], ['x', -h, h]]) - quad('y^2', [['y', -g, g], ['x', -g, g]]), 1e-8); } });
      },
      // L字の板の重心
      s3(r) {
        const L = L42(r), G = [F.div(L.Sx, fr(L.S)), F.div(L.Sy, fr(L.S))];
        if (G.some(g => g[1] > 9)) return null;
        return { q: `${L.txt.replace(/）$/, '。厚さは一定）')}の重心`, a: `$${P2(...G.map(fq))}$`, key: `42g:${L.A},${L.B},${L.a},${L.b}`,
          easy: `面積 $${L.A * L.B}-${(L.A - L.a) * (L.B - L.b)}=${L.S}$。$\\iint x\\,\\dd A=${fq(L.Sx)}$、$\\iint y\\,\\dd A=${fq(L.Sy)}$ を面積でわる`,
          verify: p => { const c = [0, 1].map(i => L.parts.reduce((s, [X, Y]) => s + quad(i ? 'y' : 'x', [['y', ...Y], ['x', ...X]]), 0) / L.parts.reduce((s, [X, Y]) => s + (X[1] - X[0]) * (Y[1] - Y[0]), 0)); return vecIs(p.a, c, 1e-8); } };
      },
      // わな：穴のない円（8-41）
      trap(r) {
        const R = r.pick([2, 4]);
        return dest({ q: `$\\iint_D y^2\\,\\dd A$（$D$ は円 $x^2+y^2\\leqq${R * R}$）`, a: `$${piTeX(fr(R ** 4, 4))}$`, key: `42t:${R}`, ...P40(r, 'y^2', 2 * Math.PI, 0, R) },
          '8-42', `穴も切りとりもない1つの円。90°回して同じなので $\\frac12\\iint r^2\\,\\dd A$`, ['8-41']);
      },
    },
  });

  // ================================================================ 8-43
  // 山 h=H−px^2−qy^2：高さ z の切り口はだ円で、面積 A(z)=Kπ(H−z)（K=1/√(pq)）
  const MT = [['0.01', '0.01', 100], ['0.01', '0.04', 50], ['0.04', '0.01', 50], ['0.04', '0.04', 25], ['0.01', '0.25', 20], ['0.25', '0.01', 20]];
  const BAN43 = new Set(['0.01,0.04,20', '0.01,0.04,40', '0.01,0.04,60', '0.01,0.02,100']);   // 目録・教科書 8-6⑧ 例題8・じぶんでとこう・章末問題の山
  const hT = (H, p, q) => `${H}-${p}x^2-${q}y^2`;
  // 同じ見開きで、同じ山（$x$・$y$ の入れかえもふくめて）を2回使わない。ステップ1では同じ形（係数の組）を2回まで（R1-23・Z-2）。使いきったら、よけない
  function fresh43(r, p, q, H, s1) {
    const u = r.s43 || (r.s43 = { m: new Set(), t: new Map() }), t = [p, q].sort().join(','), k = `${t},${H}`;
    if (u.m.has(k) && u.m.size < 20) return false;
    if (s1 && (u.t.get(t) || 0) >= 2) return false;
    u.m.add(k); if (s1) u.t.set(t, (u.t.get(t) || 0) + 1);
    return true;
  }
  // だ円 px^2+qy^2≦c の面積を数で（x=a sinφ と置いて、なめらかな式をガウス・ルジャンドルで）：切り口の公式 πab とは別の道すじ
  const ellArea = (c, p, q) => { const a = Math.sqrt(c / p), b = Math.sqrt(c / q); let s = 0; for (let i = 0; i < 10; i++) { const t = Math.PI / 2 * GLX[i]; s += GLW[i] * 2 * b * Math.cos(t) * a * Math.cos(t); } return s * Math.PI / 2; };
  // 山の体積を数で：x=a r cosθ、y=b r sinθ（a=√(H/p)、b=√(H/q)）で ab∬ max(h−z0, 0) r dr dθ
  const mtVol = (H, p, q, z0) => { const a = Math.sqrt(H / p), b = Math.sqrt(H / q), r1 = Math.sqrt(1 - z0 / H); return a * b * 2 * Math.PI * simp(rr => (H * (1 - rr * rr) - z0) * rr, 0, r1, 200); };
  add({
    id: '8-43', part: 3, chap: '8-6⑧ 例題8', stars: 1,
    banV: [10000 * Math.PI, 40000 * Math.PI, 90000 * Math.PI],
    title: '切り口の面積がわかる立体は $\\int A(z)\\,\\dd z$（だ円の切り口は $\\pi ab$）',
    mark: '山の体積、高さ $z$ の切り口。',
    futsu: ['山の上の点ごとの高さ $h$ を', '地図のタイルにかけてたす', '（だ円の範囲で、$\\sqrt{\\phantom{2}}$ の', 'はしのある定積分を2回）。'],
    raku: ['$h=20-0.01x^2-0.04y^2$ の高さ $z$ の切り口', '$a=10\\sqrt{20-z}$、$b=5\\sqrt{20-z}$', '$A(z)=\\pi ab=50\\pi(20-z)$', '$V=50\\pi\\int_0^{20}(20-z)\\,\\dd z=10000\\pi$'],
    why: '3重積分の内側の2回（$x$ と $y$）を先にすませると、高さ $z$ の切り口の面積 $A(z)$ になる。だから切り口の面積がわかれば、体積は $\\int A(z)\\,\\dd z$ の1回の定積分（8-6⑧）。だ円は半径 $a$ の円をたてに $\\frac{b}{a}$ 倍した形なので、面積は $\\pi ab$。',
    caution: '切り口は等高線 $h=z$ の内側。横の半径は $y=0$ のとき、たての半径は $x=0$ のときの値。$\\sqrt{H-z}\\times\\sqrt{H-z}=H-z$。$z$ は0（ふもと）から頂上の高さまで。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '22mm', s3: '22mm', trap: '20mm' }, boxh: { trap: '10mm' },
    fits(q) { return !/管/.test(q) && ((/切り口/.test(q) && /面積|体積/.test(q)) || (/山/.test(q) && /体積/.test(q)) || (/すい/.test(q) && /体積/.test(q))); },
    steps: {
      // 切り口の面積 A(z)
      s1(r) {
        const [p, q, K] = r.pick(MT), H = r.pick([10, 20, 30, 40, 50, 60]);
        if (BAN43.has(`${p},${q},${H}`) || !fresh43(r, p, q, H, true)) return null;
        // 係数が同じなら切り口は円なので「（だ円）」を書かない（R1-24・Z-10）
        return { q: `山 $h=${hT(H, p, q)}$ を高さ $z$ の所で水平に切った切り口${p === q ? '' : '（だ円）'}の面積 $A(z)$`, a: `$${K}\\pi(${H}-z)$`, key: `43a:${[p, q].sort()},${H}`,
          easy: `横の半径 $${fmt(Math.sqrt(1 / +p))}\\sqrt{${H}-z}$、たての半径 $${fmt(Math.sqrt(1 / +q))}\\sqrt{${H}-z}$ で $\\pi ab$`,
          verify: pp => { for (const z of [0.3 * H, 0.71 * H]) { const v = ev(strip(pp.a), { z }), w = ellArea(H - z, +p, +q); if (!near(v, w, 1e-8)) return `z=${z} で ${w} にならない`; } return true; } };
      },
      // 山の体積
      s2(r) {
        const [p, q, K] = r.pick(MT), H = r.pick([10, 20, 30, 40, 50, 60]), V = fr(K * H * H, 2);
        if (BAN43.has(`${p},${q},${H}`) || !fresh43(r, p, q, H)) return null;
        return { q: `山 $h=${hT(H, p, q)}$ の、地面（$h=0$）より上の体積`, a: `$${piTeX(V)}$`, key: `43v:${[p, q].sort()},${H}`,
          easy: `$A(z)=${K}\\pi(${H}-z)$。$\\int_0^{${H}}${K}\\pi(${H}-z)\\,\\dd z=${K}\\pi\\times${H * H / 2}$`, verify: pp => valIs(pp, mtVol(H, +p, +q, 0), 1e-7) };
      },
      // 頂上の部分の体積、円すい
      s3(r) {
        const [k, ok] = alt(r, '43s3', 2);
        if (k === 0) {
          const [p, q, K] = r.pick(MT), H = r.pick([20, 30, 40, 50]), z0 = r.pick([10, 20, 30]);
          if (z0 >= H || !fresh43(r, p, q, H)) return null;
          const V = fr(K * (H - z0) ** 2, 2);
          return ok({ q: `山 $h=${hT(H, p, q)}$ の、高さ $${z0}$ より上の部分の体積`, a: `$${piTeX(V)}$`, key: `43u:${p},${q},${H},${z0}`,
            easy: `$\\int_{${z0}}^{${H}}${K}\\pi(${H}-z)\\,\\dd z$（$z$ は ${z0} から）`, verify: pp => valIs(pp, mtVol(H, +p, +q, z0), 1e-7) });
        }
        const R = r.pick([3, 6]), H = r.pick([4, 5, 10]);
        return ok({ q: `底面の半径 $${R}$、高さ $${H}$ の円すい（高さ $z$ の切り口は、半径 $${R}\\Bigl(1-\\dfrac{z}{${H}}\\Bigr)$ の円）の体積`, a: `$${piTeX(fr(R * R * H, 3))}$`, key: `43c:${R},${H}`,
          easy: `$\\int_0^{${H}}\\pi\\times${R * R}\\Bigl(1-\\frac{z}{${H}}\\Bigr)^2\\dd z$`, verify: pp => valIs(pp, quadPolar(`${H}(1-\\sqrt{x^2+y^2}/${R})`, 0, 2 * Math.PI, 0, R), 1e-8) });
      },
      // わな：球の慣性モーメント（8-92）
      trap(r) {
        const Mk = r.pick([5, 10, 20]), R = r.pick(['0.2', '0.5']), I = F.mul(fr(2 * Mk, 5), F.mul(D(R), D(R)));
        return dest({ q: `質量 $${Mk}\\,\\mathrm{kg}$、半径 $${R}\\,\\mathrm{m}$ の、密度が一定の球の、中心を通る軸のまわりの慣性モーメント`, a: `$${dec(I)}\\,\\mathrm{kg\\cdot m^2}$`, key: `43t:${Mk},${R}`,
          verify: p => { const rho = Mk / (4 / 3 * Math.PI * (+R) ** 3); return valIs(p, rho * quad('r^4(\\sin u)^3', [['v', 0, '2*pi'], ['u', 0, 'pi'], ['r', 0, R]]), 1e-8); } },
        '8-43', `体積ではなく、軸からの距離の2乗をかけてたす量。切り口の面積だけでは出ない。球座標で $\\frac{2}{5}MR^2$`);
      },
    },
  });

  // ================================================================ 8-44
  // データだけ：マスごとに「量×面積」。雨 1 mm が 1 km^2 に降ると 1000 m^3
  const BAN44 = new Set(['10,20,30,40', '10,20,30,20,30,40,30,40,50', '5,10,15,10,20,25,15,25,35', '10,15,20,25,30,35']);
  const mmList = (r, n) => Array.from({ length: n }, () => 5 * r.int(1, 12));
  const sumOf = q => (String(q).match(/(\d+(?:\.\d+)?)(?=、|\s*mm)/g) || []).map(Number);
  add({
    id: '8-44', part: 3, chap: '8-6⑨ 例題11', stars: 1,
    banV: [1e5, 2.7e5, 1.6e5, 1.35e5, 25, 30],
    title: 'データだけなら、マスごとに「量×面積」をたす（雨 1 mm が 1 km² に降ると $1000\\,\\mathrm{m^3}$）',
    mark: 'マスごとの雨の量の表、「流域に降った雨の体積」。',
    futsu: ['マスごとに、雨の量を m に直し、', 'マスの面積（$\\mathrm{m^2}$）をかけて', '1つずつ体積を出し、', '最後に全部たす。'],
    raku: ['1 km 四方のマス4つで 10、20、30、40 mm', '→ 合計 100 mm', '→ $100\\times1000=1\\times10^{5}\\,\\mathrm{m^3}$', '（平均 25 mm）'],
    why: '式がなくデータだけのときは、重積分の「タイルの量×タイルの面積をたす」を、マスのままで計算する（8-6⑨）。マスの面積がどれも同じなら、先に雨の量をたしてから、1マスの面積をかければよい。$1\\,\\mathrm{mm}=0.001\\,\\mathrm{m}$、$1\\,\\mathrm{km^2}=10^6\\,\\mathrm{m^2}$ なので、1 mm の雨は 1 マスに $1000\\,\\mathrm{m^3}$。',
    caution: 'mm を m に直すのを忘れない（$\\frac{1}{1000}$）。マスの1辺が 500 m なら面積は $\\frac14\\,\\mathrm{km^2}$ で、1 mm は $250\\,\\mathrm{m^3}$。平均の雨の量は、合計をマスの数でわる。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '28mm', s3: '28mm', trap: '28mm' },
    fits(q) { return /雨|肥料/.test(q) && /マス/.test(q) && !/\\leqq/.test(q); },
    steps: {
      // 1 km 四方のマス、文で
      s1(r) {
        const n = r.int(4, 6), L = mmList(r, n), S = L.reduce((s, v) => s + v, 0);
        if (BAN44.has(L.join(','))) return null;
        return { q: `1 km 四方のマス ${n} つでできた流域に、マスごとに ${L.join('、')} mm の雨が降りました。流域に降った雨の体積`, a: `$${sci(S * 1000)}\\,\\mathrm{m^3}$`, key: `44:${L.slice().sort((a, b) => a - b)}|1000`,
          easy: `合計 $${S}\\,\\mathrm{mm}$、$${S}\\times1000=${sci(S * 1000)}$`, verify: p => valIs(p, sumOf(p.q).reduce((s, v) => s + v / 1000 * 1e6, 0), 1e-9) };
      },
      // マスの大きさがちがう、平均の雨の量、畑の肥料
      s2(r) {
        const [k, ok] = alt(r, '44s2', 3), n = r.int(4, 6), L = mmList(r, n), S = L.reduce((s, v) => s + v, 0);
        if (k === 0) {
          const [side, per] = r.pick([['500 m', 250], ['2 km', 4000], ['100 m', 10]]);
          return ok({ q: `${side} 四方のマス ${n} つでできた流域に、マスごとに ${L.join('、')} mm の雨が降りました。流域に降った雨の体積`, a: `$${sci(S * per)}\\,\\mathrm{m^3}$`, key: `44:${L.slice().sort((a, b) => a - b)}|${per}`,
            easy: `1 mm の雨は1マスに $${per}\\,\\mathrm{m^3}$。合計 $${S}\\times${per}$`, verify: p => { const sd = side === '500 m' ? 500 : side === '2 km' ? 2000 : 100; return valIs(p, sumOf(p.q).reduce((s, v) => s + v / 1000 * sd * sd, 0), 1e-9); } });
        }
        if (k === 1) {
          if (S % n) return null;
          return ok({ q: `1 km 四方のマス ${n} つでできた流域に、マスごとに ${L.join('、')} mm の雨が降りました。流域の平均の雨の量`, a: `$${S / n}\\,\\mathrm{mm}$`, key: `44a:${L.slice().sort((a, b) => a - b)}`,
            easy: `合計 $${S}\\,\\mathrm{mm}$ をマスの数 ${n} でわる`, verify: p => valIs(p, sumOf(p.q).reduce((s, v) => s + v, 0) / n, 1e-9) });
        }
        const G = L.map(v => v / 5);   // g/m^2（1〜12）
        const tot = G.reduce((s, v) => s + v, 0) * 100 / 1000;
        return ok({ q: `10 m 四方のマス ${n} つでできた畑に、マスごとに ${G.join('、')} $\\mathrm{g/m^2}$ の肥料をまきました。まいた肥料の質量（kg）`, a: `$${fmt(tot)}\\,\\mathrm{kg}$`, key: `44f:${G.slice().sort((a, b) => a - b)}`,
          easy: `1マスは $100\\,\\mathrm{m^2}$。合計 $${G.reduce((s, v) => s + v, 0)}\\times100=${G.reduce((s, v) => s + v, 0) * 100}\\,\\mathrm{g}$`,
          verify: p => valIs(p, (String(p.q).match(/(\d+)(?=、| \$\\mathrm\{g)/g) || []).map(Number).reduce((s, v) => s + v * 100, 0) / 1000, 1e-9) });
      },
      // 表のデータ（雨の体積・平均）
      s3(r) {
        const [k, ok] = alt(r, '44s3', 2), rows = r.int(2, 3), L = mmList(r, rows * 3), S = L.reduce((s, v) => s + v, 0);
        if (BAN44.has(L.join(',')) || (k === 1 && S % L.length)) return null;
        const table = { rows: Array.from({ length: rows }, (_, i) => L.slice(3 * i, 3 * i + 3).map(String)) };
        const num = () => table.rows.flat().map(Number);
        if (k === 0) return ok({ q: `表は、1 km 四方のマスが、たて${rows}つ・横3つならぶ流域に降った雨の量（mm）。流域に降った雨の体積`, a: `$${sci(S * 1000)}\\,\\mathrm{m^3}$`, key: `44:${L.slice().sort((a, b) => a - b)}|1000`, table,
          easy: `行ごとに ${table.rows.map(rw => rw.reduce((s, v) => s + +v, 0)).join('、')}、合計 $${S}\\,\\mathrm{mm}$。$\\times1000$`, verify: p => valIs(p, num().reduce((s, v) => s + v * 1000, 0), 1e-9) });
        return ok({ q: `表は、1 km 四方のマスが、たて${rows}つ・横3つならぶ流域に降った雨の量（mm）。流域の平均の雨の量`, a: `$${S / L.length}\\,\\mathrm{mm}$`, key: `44a:${L.slice().sort((a, b) => a - b)}`, table,
          easy: `合計 $${S}\\,\\mathrm{mm}$ を ${L.length} でわる`, verify: p => valIs(p, num().reduce((s, v) => s + v, 0) / L.length, 1e-9) });
      },
      // わな：雨の量が1次式（8-35）
      trap(r) {
        const a = 5 * r.int(1, 4), b = r.int(1, 4), W = r.int(2, 4), Lx = r.int(2, 4), mid = a + b * Lx / 2, V = mid * W * Lx * 1000;
        return dest({ q: `東西 ${Lx} km、南北 ${W} km の長方形の流域で、雨の量が場所 $x$〔km〕によって $${a}+${b === 1 ? '' : b}x$〔mm〕（$0\\leqq x\\leqq${Lx}$）でした。流域に降った雨の体積`, a: `$${sci(V)}\\,\\mathrm{m^3}$`, key: `44t:${a},${b},${W},${Lx}`,
          verify: p => valIs(p, quad(`(${a}+${b}x)*1000`, [['y', 0, W], ['x', 0, Lx]]), 1e-9) },
        '8-44', `マスのデータではなく式がある。1次式なので、まん中 $x=${fmt(Lx / 2)}$ の $${fmt(mid)}\\,\\mathrm{mm}$ に面積 $${W * Lx}\\,\\mathrm{km^2}$ をかける`, ['8-35']);
      },
    },
  });

  // ================================================================ 8-92
  // 球座標の小さな箱 r^2 sinθ dr dθ dφ。検算は u=θ、v=φ の3重積分を数で
  const SPH = (f, R0, R1, U1) => [['v', 0, '2*pi'], ['u', 0, U1 || 'pi'], ['r', R0 || 0, R1]];
  const sphQ = (f, R0, R1, U1) => quad(`(${f})*r^2*sin(u)`, SPH(f, R0, R1, U1));
  add({
    id: '8-92', part: 3, chap: '8-6⑧ 例題9', stars: 1,
    title: '球座標のタイルは $r^2\\sin\\theta\\,\\dd r\\,\\dd\\theta\\,\\dd\\varphi$（球は $\\theta$ が $\\pi$ まで、$\\varphi$ が $2\\pi$ まで）',
    mark: '球・半球・球の殻、「球の慣性モーメント」。',
    futsu: ['たて線・横線で切って、範囲を', '$\\pm\\sqrt{R^2-x^2-y^2}$ などで書き、', '$\\sqrt{\\phantom{2}}$ のはしのある', '定積分を3回する。'],
    raku: ['半球（$0\\leqq\\theta\\leqq\\frac{\\pi}{2}$）', '$\\int_0^R r^2\\,\\dd r\\times\\int_0^{\\pi/2}\\sin\\theta\\,\\dd\\theta\\times\\int_0^{2\\pi}\\dd\\varphi$', '$=\\dfrac{R^3}{3}\\times1\\times2\\pi=\\dfrac{2\\pi R^3}{3}$'],
    why: '球座標の小さな箱の3つの辺は、$\\dd r$、$r\\,\\dd\\theta$（たての円の弧）、$r\\sin\\theta\\,\\dd\\varphi$（横の円の弧。横の円の半径は $r\\sin\\theta$）。かけると $r^2\\sin\\theta\\,\\dd r\\,\\dd\\theta\\,\\dd\\varphi$（8-6⑧）。$f$ が $r$ だけなら、$\\theta$ と $\\varphi$ の積分は $2\\times2\\pi=4\\pi$ で、うすい球の殻 $4\\pi r^2\\,\\dd r$ に分けた1回の定積分になる。',
    caution: '$\\theta$ は真上から真下まで（0から $\\pi$）、$\\varphi$ は1周（0から $2\\pi$）。$\\sin\\theta$ を忘れない。$x^2+y^2=r^2\\sin^2\\theta$（軸からの距離の2乗）、$z=r\\cos\\theta$。',
    counts: { s1: 5, s2: 4, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '22mm', s3: '28mm', trap: '20mm' }, boxh: { s1: '10mm', s2: '10mm', s3: '10mm', trap: '10mm' },
    fits(q) { return /球/.test(q) && /\\iiint|体積|慣性モーメント|r\^2\\sin|小さな箱/.test(q) && !/球面|流束|半円/.test(q); },
    steps: {
      // 小さな箱の体積、半球・8分の1の球の体積
      s1(r) {
        const [k, ok] = alt(r, '92s1', 2);
        if (k === 0) {
          const rr = r.pick([2, 3, 4]), th = r.pick([30, 90, 150]), dr = r.pick(['0.1', '0.2']), dt = r.pick(['0.05', '0.1']), dp = r.pick(['0.05', '0.1']);
          const V = F.mul(F.mul(fr(rr * rr), th === 90 ? fr(1) : fr(1, 2)), F.mul(D(dr), F.mul(D(dt), D(dp))));
          return ok({ q: `球座標の小さな箱（$r=${rr}$、$\\theta=${th}^{\\circ}$ の所で、$\\dd r=${dr}$、$\\dd\\theta=${dt}$、$\\dd\\varphi=${dp}$）の体積 $r^2\\sin\\theta\\,\\dd r\\,\\dd\\theta\\,\\dd\\varphi$`, a: `$${dec(V)}$`, key: `92b:${rr},${th},${dr},${dt},${dp}`,
            easy: `$${rr}^2\\times\\sin${th}^{\\circ}\\times${dr}\\times${dt}\\times${dp}$（$\\sin${th}^{\\circ}=${th === 90 ? 1 : '\\frac12'}$）`, verify: p => valIs(p, rr * rr * Math.sin(th * RAD) * +dr * +dt * +dp, 1e-9) });
        }
        const R = r.pick([3, 6, 1.5, 2]), half = r.chance(0.6), V = half ? F.mul(fr(2, 3), powF(D(String(R)), 3)) : F.mul(fr(1, 6), powF(D(String(R)), 3));
        if (half && R === 3 && r.chance(0.5)) return null;
        return ok({ q: half ? `球座標で求めた、半径 ${R} の半球（$z\\geqq0$）の体積` : `球座標で求めた、半径 ${R} の球の、$x\\geqq0$、$y\\geqq0$、$z\\geqq0$ の部分（8分の1）の体積`, a: `$${piTeX(V)}$`, key: `92v:${R},${half}`,
          easy: half ? `$\\theta$ は0から $\\frac{\\pi}{2}$：$\\frac{R^3}{3}\\times1\\times2\\pi$` : `$\\theta$ も $\\varphi$ も0から $\\frac{\\pi}{2}$：$\\frac{R^3}{3}\\times1\\times\\frac{\\pi}{2}$`,
          verify: p => valIs(p, half ? sphQ('1', 0, R, 'pi/2') : quad('r^2*sin(u)', [['v', 0, 'pi/2'], ['u', 0, 'pi/2'], ['r', 0, R]]), 1e-8) });
      },
      // r だけの式、球の殻、半球の ∭z
      s2(r) {
        const k = r.int(0, 3), R = r.pick([1, 2, 3]);
        if (k === 0) return { q: `$\\iiint_V(x^2+y^2+z^2)\\,\\dd V$（$V$ は球 $x^2+y^2+z^2\\leqq${R * R}$）`, a: `$${piTeX(fr(4 * R ** 5, 5))}$`, key: `92r2:${R}`,
          easy: `$x^2+y^2+z^2=r^2$。$\\int_0^{${R}}r^2\\times4\\pi r^2\\,\\dd r$`, verify: p => valIs(p, sphQ('r^2', 0, R), 1e-8) };
        if (k === 1) return { q: `$\\iiint_V\\sqrt{x^2+y^2+z^2}\\,\\dd V$（$V$ は球 $x^2+y^2+z^2\\leqq${R * R}$）`, a: `$${piTeX(fr(R ** 4))}$`, key: `92r1:${R}`,
          easy: `$\\sqrt{x^2+y^2+z^2}=r$。$\\int_0^{${R}}r\\times4\\pi r^2\\,\\dd r$`, verify: p => valIs(p, sphQ('r', 0, R), 1e-8) };
        if (k === 2) {
          const a = r.int(1, 2), b = a + r.int(1, 2), V = fr(4 * (b ** 3 - a ** 3), 3);
          return { q: `内の半径 ${a}、外の半径 ${b} の球の殻（$${a * a}\\leqq x^2+y^2+z^2\\leqq${b * b}$）の体積`, a: `$${piTeX(V)}$`, key: `92s:${a},${b}`,
            easy: `$r$ を ${a} から ${b} まで：$\\int_{${a}}^{${b}}4\\pi r^2\\,\\dd r$`, verify: p => valIs(p, sphQ('1', a, b), 1e-8) };
        }
        return { q: `$\\iiint_V z\\,\\dd V$（$V$ は半球 $x^2+y^2+z^2\\leqq${R * R}$、$z\\geqq0$）`, a: `$${piTeX(fr(R ** 4, 4))}$`, key: `92z:${R}`,
          easy: `$z=r\\cos\\theta$。$\\int_0^{${R}}r^3\\,\\dd r\\times\\int_0^{\\pi/2}\\cos\\theta\\sin\\theta\\,\\dd\\theta\\times2\\pi$`, verify: p => valIs(p, sphQ('r*cos(u)', 0, R, 'pi/2'), 1e-8) };
      },
      // 球・半球の慣性モーメント（数で）
      s3(r) {
        const Mk = r.pick([2, 4, 5, 8, 10]), R = r.pick(['0.1', '0.2', '0.3', '0.5']), half = r.chance(0.5), I = F.mul(fr(2 * Mk, 5), F.mul(D(R), D(R)));
        if (!dec(I) || (Mk === 5 && R === '0.2')) return null;
        return { q: `質量 $${Mk}\\,\\mathrm{kg}$、半径 $${R}\\,\\mathrm{m}$ の、密度が一定の${half ? '半球（$z\\geqq0$）の、$z$ 軸' : '球の、中心を通る軸'}のまわりの慣性モーメント $\\iiint_V\\rho\\,(x^2+y^2)\\,\\dd V$`, a: `$${dec(I)}\\,\\mathrm{kg\\cdot m^2}$`, key: `92i:${Mk},${R},${half}`,
          easy: `$x^2+y^2=r^2\\sin^2\\theta$。$\\frac{2}{5}MR^2$${half ? '（半球も同じ形）' : ''}`,
          verify: p => { const U = half ? 'pi/2' : 'pi', rho = Mk / sphQ('1', 0, R, U); return valIs(p, rho * sphQ('r^2(\\sin u)^2', 0, R, U), 1e-8); } };
      },
      // わな：円柱の体積（8-43。切り口がどこも同じ円）
      trap(r) {
        const R = r.int(1, 4), H = r.int(2, 6);
        return dest({ q: `底面の半径 ${R}、高さ ${H} の円柱の体積 $\\iiint_V\\dd V$`, a: `$${piTeX(fr(R * R * H))}$`, key: `92t:${R},${H}`,
          verify: p => valIs(p, quadPolar(String(H), 0, 2 * Math.PI, 0, R), 1e-8) },
        '8-92', `球ではない。高さ $z$ の切り口はどこも半径 ${R} の円なので、$\\int_0^{${H}}${R * R}\\pi\\,\\dd z$`, ['8-43']);
      },
    },
  });
})(globalThis.MONDAI);

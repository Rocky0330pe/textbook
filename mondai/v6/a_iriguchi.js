/* 問題集 第6巻『未来を計算する』　第1部 微分方程式の入口・オイラー法・積分で解く（わざ 6-01〜6-15、6-91〜6-93）　組 a
 * 書き方は v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第6巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 電卓は使わない。近似値は使う値とけたを文に書き、文の値で出した答えとほんとうの値を丸めた答えがくいちがう組は出さない（P-3・O-4）。
 * 微分方程式の解の答えは calc（kind 'ode'）で確かめる。値・ことば・表計算の式は verify(p) で、問題の文のルールを読み直して
 *   別の道すじ（右辺を数で計算し直す・オイラー法を1歩ずつたどる・ほんとうの解を数で微分する）で確かめる。
 * 図は 6-01・6-15 のステップ3だけ（傾きの場 G.field、M.graph。K-2・P-2）。表（p.table）はステップ3だけに出す
 *   （見わけようには表が出ないので、ステップ1・2は文だけで解ける形にする）。表の中には □ を書かず（ア）と書き、欄は文の □ だけにする（P-6）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」）を書く（dest。N-3）。
 * 左ページの「楽な形」の例の数は、同じ見開きの問題に出さない（O-2）。同じ見開きで同じ数の組をくり返さないように key をそろえる（N-2）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => { const s = String(+(+v).toFixed(9)); return s === '-0' ? '0' : s; };   // 0.30000000004 → 0.3
  const decs = v => (fmt(v).split('.')[1] || '').length;                                      // 小数のけた数
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));
  const close = (x, y, e) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (e || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const par = v => (v < 0 ? `(${fmt(v)})` : fmt(v));                                         // マイナスはかっこごと
  const M$ = v => `$${fmt(v)}$`;
  const U = (v, u) => `$${fmt(v)}\\,\\mathrm{${u}}$`;                                         // 数と単位（1かたまり。N-7・O-7）
  const CODE = s => '`' + s + '`';                                                             // 表計算の式（等幅）
  const DT = (y, t) => `\\frac{\\dd ${y}}{\\dd ${t || 't'}}`;
  const D2 = (y, t) => `\\frac{\\dd^2${y}}{\\dd ${t || 't'}^2}`;
  const cf = a => (a === 1 ? '' : a === -1 ? '-' : fmt(a));                                  // 係数（1 は書かない）
  const dif = (y, b) => (b === 0 ? y : `${y}${b > 0 ? '-' : '+'}${fmt(Math.abs(b))}`);          // T-20
  // 目標との差に比例するルール：-a(y-b)。b=0 なら -ay
  const ruleN = (y, a, b) => (b === 0 ? `${DT(y)}=-${cf(a)}${y}` : `${DT(y)}=-${a === 1 ? '' : fmt(a) + '\\,'}(${dif(y, b)})`);
  const range = (a, b, s) => { const o = []; for (let v = a; v <= b + 1e-9; v += (s || 1)) o.push(+v.toFixed(6)); return o; };
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 四捨五入（小数第 k 位まで）。文の値（0.368 など）で出した答え vG と、ほんとうの値 vT を丸めた答えが同じ、いちばん細かいけた（O-4）
  const rd = (v, k) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-7) / 10 ** k).toFixed(k);
  function gv(vG, vT, kmax) {
    for (let k = kmax == null ? 3 : kmax; k >= 1; k--) if (rd(vG, k) === rd(vT, k)) return { ans: rd(vG, k), k };
    return null;
  }

  // ---------------------------------------------------------------- 検算の部品（問題の文を読み直す）
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const numOf = t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, ''));
  const nums = a => maths(a).map(t => ev(t.replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  const valIs = (ans, v, e) => { const n = nums(ans); return (n.length && close(n[0], v, e)) || `答え ${ans} が ${fmt(v)} でない`; };
  const valsAre = (ans, vs) => { const n = nums(ans); return (n.length === vs.length && vs.every((v, i) => close(n[i], v))) || `答え ${ans} が ${vs.map(fmt).join('、')} でない`; };
  // 文の中の1階のルール $\frac{\dd T}{\dd t}=右辺$（右辺は $ まで）
  const RULE1 = /\\frac\{\\dd ([A-Za-z])\}\{\\dd ([a-z])\}=([^$]*)\$/;
  function rule1(q) { const m = RULE1.exec(String(q)); return m ? { v: m[1], t: m[2], rhs: m[3].trim() } : null; }
  // ルールの右辺 f(y) を、変数 v の値 y で計算する
  const rhsAt = (R, y, t) => ev(R.rhs, { [R.v]: y, [R.t]: t == null ? 0 : t });
  // 右辺が -a(y-b) の形なら a・b（数で読む）。右辺に t があれば null
  function rateAB(R) {
    if (!R || new RegExp(`(^|[^a-zA-Z\\\\])${R.t}(?![a-zA-Z])`).test(R.rhs.replace(/\\[a-zA-Z]+/g, ' '))) return null;
    const f0 = rhsAt(R, 0), f1 = rhsAt(R, 1), f2 = rhsAt(R, 2);
    if (f0 == null || f1 == null || f2 == null || !close(f2 - f1, f1 - f0)) return null;   // 1次式でない
    const a = f0 - f1; return a ? { a, b: f0 / a } : null;
  }
  // オイラー法を1歩ずつ（ルールの右辺を数で計算し直す）
  function euler(R, y0, h, n) { let y = y0, t = 0; for (let k = 0; k < n; k++) { y += rhsAt(R, y, t) * h; t += h; } return y; }
  const dtOf = q => { const m = /\\Delta t=([\d.]+)/.exec(q); return m ? +m[1] : null; };

  // ---------------------------------------------------------------- わなの行き先（N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(6).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 1 || !d.fits) return false;
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
  const has2 = q => /\\dd\^2|\\ddot|''/.test(q);                     // 2回微分
  const SEE = /積分するだけで解ける|階数|線形|初期条件の数/;           // ルールの形を見分ける問い（6-07・6-12）
  const isOneRule = q => { const R = rule1(q); return !!R && !has2(q); };

  // ================================================================ 6-01
  const A01 = [0.02, 0.04, 0.05, 0.06, 0.08, 0.1, 0.2, 0.25];
  const D01 = [-15, -10, -5, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70];
  function pick01(r) {   // 部屋 b、比例の数 a、温度 T0（左ページの例 -0.05(T-20) はよける。O-2）
    for (let k = 0; k < 60; k++) {
      const a = r.pick(A01), b = r.pick([15, 18, 20, 22, 25, 30]), d = r.pick(D01), T0 = b + d, v = -a * d;
      if (a === 0.05 && b === 20) continue;
      if (T0 < 1 || T0 > 95 || decs(v) > 2) continue;
      return { a, b, d, T0, v };
    }
    return null;
  }
  // 傾きの場の図（ステップ3）：f(t, y)、y の上はし、出発する点、たての目もり
  // atDot：● の所にも短い線をかく（「● の点での傾き」を聞くとき。第40回 S-8）
  function field01(f, ymax, dot, yt, atDot) {
    const G = M.graph({ x0: 0, x1: 6, y0: 0, y1: ymax, w: 7, h: 4.4 });
    const ys = range(ymax / 8, ymax, ymax / 8).slice(0, 7);
    return { s: 5, items: [
      ...G.axes({ xt: [2, 4, 6], yt, x: 't', y: 'y' }),
      ...G.field(f, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5], ys, { len: 0.62 }),
      ...(atDot ? G.field(f, [dot[0]], [dot[1]], { len: 0.9, thick: true }) : []),
      ['dot', G.T(dot[0], dot[1])],
    ] };
  }
  M.add({
    id: '6-01', part: 1, chap: '6-1②⑥ 例題1・8', stars: 1,
    title: 'ルールを読む：右辺に今の値を入れると「変わる速さ」。右辺が0になる値に近づく',
    mark: '$\\frac{\\dd T}{\\dd t}=-0.05\\,(T-20)$ と「□℃のときの変わる速さ」「上がるか下がるか」「どうなっていくか」。',
    futsu: ['解の式（$T=20+40e^{-0.05t}$ など）を', '先に求めて微分し、', 'その時刻の傾きを出す。', '近づく先も、解の式で調べる。'],
    raku: ['$-0.05\\times(60-20)=-2$', '（1分あたり2℃下がる）', '10℃なら $-0.05\\times(-10)=+0.5$（上がる）', '右辺が0になる $T=20$ に近づく'],
    why: '左辺 $\\frac{\\dd T}{\\dd t}$ は「今の変わる速さ」（グラフの傾き）なので、右辺に今の温度を入れた値が、そのまま今の速さになる（6-1②）。右辺がマイナスなら下がり、プラスなら上がる。右辺が0になる値では変わらないので、解はどこから出発してもその値に近づく（傾きの場。6-1⑥）。',
    caution: 'マイナスの数を入れるときは、かっこをつける（$-0.05\\times(10-20)$ は $-0.05\\times(-10)=+0.5$）。答えは「今の速さ」で、何分後の温度ではない（何分後の温度は第2部）。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '40mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      if (!isOneRule(q) || /オイラー|\\Delta t|分後|秒後|の式で|解は|解を|階数|線形|積分|C2|B3|ばね|e\^/.test(q)) return false;
      if (!rateAB(rule1(q))) return false;
      return /変わる速さ|傾き|近づく|上がるか/.test(q);
    },
    steps: {
      // 温度のルールと、ルールの右辺（y）の傾き
      s1(r) {
        if (turn(r, '01s1', 2)) {
          const a = r.pick([0.2, 0.25, 0.4, 0.5, 1, 2]), b = r.int(1, 6), y = r.int(0, 8), v = -a * (y - b);
          if (y === b || decs(v) > 2) return null;
          return {
            q: `微分方程式 $${ruleN('y', a, b)}$ で、$y=${y}$ のときの傾き $${DT('y')}$ □`, a: M$(v), key: `01|${a}|${b}|${y}`,
            easy: `$-${a === 1 ? '' : fmt(a) + '\\times'}(${y}-${b})=${fmt(v)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, rhsAt(rule1(p.q), y)),
          };
        }
        const g = pick01(r); if (!g) return null;
        const { a, b, d, T0, v } = g;
        return {
          q: `ルール $${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）で、温度が${T0}℃のときの、温度の変わる速さ □ ℃/分`, a: M$(v), key: `01|${a}|${b}|${T0}`,
          easy: `$-${fmt(a)}\\times(${T0}-${b})=-${fmt(a)}\\times${par(d)}=${fmt(v)}$（1分あたり${fmt(Math.abs(v))}℃${v < 0 ? '下がる' : '上がる'}）`, easyCheck: 'last',
          // 別の道すじ：ほんとうの解 T=b+(T0-b)e^{-at} を、t=0 で数で微分する
          verify: p => { const R = rule1(p.q), h = 1e-5, sol = t => b + (T0 - b) * Math.exp(-a * t); return (close((sol(h) - sol(-h)) / (2 * h), rhsAt(R, T0), 1e-6) && valIs(p.a, rhsAt(R, T0))) || `答え ${p.a} がちがう`; },
        };
      },
      // 差の向きが逆の書き方・上がるか下がるかと近づく先・5つの値の傾き
      s2(r) {
        const k = turn(r, '01s2', 3);
        if (k === 0) {
          const g = pick01(r); if (!g) return null;
          const { a, b, T0, v } = g;
          return {
            q: `ルール $${DT('T')}=${fmt(a)}\\,(${b}-T)$（$T$ は℃、$t$ は分）で、温度が${T0}℃のときの、温度の変わる速さ □ ℃/分`, a: M$(v), key: `01|${a}|${b}|${T0}`,
            easy: `$${fmt(a)}\\times(${b}-${T0})=${fmt(v)}$（$${fmt(a)}\\,(${b}-T)$ は $-${fmt(a)}\\,(T-${b})$ と同じ）`, easyCheck: false,
            verify: p => valIs(p.a, rhsAt(rule1(p.q), T0)),
          };
        }
        if (k === 1) {
          const g = pick01(r); if (!g) return null;
          const { a, b, d, T0 } = g, what = d > 0 ? r.pick(['お湯', 'お茶', 'スープ']) : r.pick(['水', '牛乳', '麦茶']);
          const A = `${d > 0 ? '下がって' : '上がって'}、${b}℃に近づく`;
          return {
            q: `ルール $${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）で、はじめ${T0}℃の${what}の温度は上がるか下がるか、また何℃に近づくか □`, a: A, key: `01|${a}|${b}|${T0}`,
            easy: `${T0}℃では右辺が $${fmt(-a * d)}$ で${d > 0 ? 'マイナス（下がる）' : 'プラス（上がる）'}。右辺が0になるのは $T=${b}$`, easyCheck: false,
            verify: p => { const R = rule1(p.q), ab = rateAB(R), up = rhsAt(R, T0) > 0; return (close(ab.b, b) && p.a === `${up ? '上がって' : '下がって'}、${fmt(ab.b)}℃に近づく`) || `答え ${p.a} がちがう`; },
          };
        }
        const a = r.pick([0.1, 0.2, 0.4, 0.5]), s = r.pick([1, 2]), b = r.int(2 * s, 6 + s);
        if (a === 0.5 && b === 2) return null;   // 教科書の例題8
        const ys = [-2, -1, 0, 1, 2].map(j => b + j * s), vs = ys.map(y => -a * (y - b));
        if (vs.some(v => decs(v) > 2)) return null;
        return {
          q: `微分方程式 $${ruleN('y', a, b)}$ で、$y=${ys.join('$、$')}$ のときの傾きを順に □`, a: vs.map(M$).join('、'), key: `01y|${a}|${b}|${s}`,
          easy: `$y=${b}$ で0。そこから $y$ が${s}ふえるごとに $${fmt(a * s)}$ ずつへる。$y=${b}$ より上は下がり、下は上がって、$y=${b}$ に近づく`, easyCheck: false,
          verify: p => valsAre(p.a, ys.map(y => rhsAt(rule1(p.q), y))),
        };
      },
      // 傾きの場の図：「数－数×y」の形で近づく先・点での傾き
      s3(r) {
        // 2つの形を交互に出す（数をさがしなおすときも、同じ形のなかで。図の問題が同じ形2つにならないように）
        if (turn(r, '01s3', 2)) {
          let a, b;
          for (let k = 0; k < 30; k++) { a = r.pick([0.25, 0.5, 1, 2]); b = r.pick([2, 3, 4, 5, 6]); if (!(a === 0.5 && b === 2)) break; }
          if (a === 0.5 && b === 2) return null;
          const c = a * b, y0 = r.pick([0, 2 * b]);
          return {
            q: `図は、微分方程式 $${DT('y')}=${fmt(c)}-${cf(a)}y$ の傾きの場（短い線の傾きが、その点での右辺の値）です。●（$y=${y0}$）から出発した解が近づいていく $y$ の値 □`, a: M$(b), key: `01f|${a}|${b}`,
            easy: `右辺 $${fmt(c)}-${cf(a)}y=0$ となるのは $y=${b}$（$${fmt(c)}-${cf(a)}y=-${a === 1 ? '' : fmt(a) + '\\,'}(y-${b})$）`, easyCheck: false,
            fig: field01((t, y) => c - a * y, 2 * b, [0, y0], [y0 || 2 * b]),
            verify: p => { const ab = rateAB(rule1(p.q)); return (ab && valIs(p.a, ab.b)) || '近づく先がちがう'; },
          };
        }
        let a, b, y0, v;
        for (let k = 0; k < 30; k++) { a = r.pick([0.25, 0.5, 1]); b = r.pick([2, 3, 4]); y0 = r.int(1, 2 * b - 1); v = -a * (y0 - b); if (y0 !== b && decs(v) <= 2) break; }   // ● は場の中（軸の上にしない。S-8）
        if (y0 === b || decs(v) > 2) return null;
        const t0 = r.int(1, 5);
        return {
          q: `図は、微分方程式 $${ruleN('y', a, b)}$ の傾きの場です。● の点 $(${t0},\\ ${y0})$ での短い線の傾き □`, a: M$(v), key: `01|${a}|${b}|${y0}`,
          easy: `右辺に $t$ がないので、同じ高さならどの時刻でも同じ傾き。$-${a === 1 ? '' : fmt(a) + '\\times'}(${y0}-${b})=${fmt(v)}$`, easyCheck: false,
          fig: field01((t, y) => -a * (y - b), 2 * b, [t0, y0], [b], true),
          verify: p => valIs(p.a, rhsAt(rule1(p.q), y0)),
        };
      },
      // わな：変わる速さではなく、何分後の温度（6-18）
      trap(r) {
        const n = r.pick([1, 2]), a = r.pick([0.1, 0.05, 0.2]), tt = n / a, b = r.pick([15, 20, 25]), T0 = r.pick([60, 70, 80, 90]), d = T0 - b;
        if (a === 0.05 && b === 20) return null;
        const E = n === 1 ? 0.368 : 0.135, g = gv(b + d * E, b + d * Math.exp(-n), 1);
        if (!g) return null;
        return dest({
          q: `ルール $${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）で、はじめ${T0}℃のお湯の${fmt(tt)}分後の温度は約 □ ℃（$e^{${-n}}=${fmt(E)}$、小数第1位まで）`, a: `$${g.ans}$`, key: `01t|${n}|${a}|${b}|${T0}`,
          verify: p => valIs(p.a, +rd(b + d * Math.exp(-a * tt), 1)),
        }, '6-01', `聞いているのは今の変わる速さではなく、${fmt(tt)}分後の温度。速さは温度とともに変わるので、右辺の値×時間にはならない。$T=${b}+${d}e^{-${fmt(a)}t}$ に $t=${fmt(tt)}$ を入れる`, ['6-18']);
      },
    },
  });

  // ================================================================ 6-02
  const COOL = ['お茶', 'スープ', 'みそ汁', 'ホットミルク', 'お湯', 'コーヒー'];
  const WARM = ['牛乳', '麦茶', 'ジュース'];
  function pick02(r) {   // 部屋 b、比例の数 k（左ページの例 25℃・0.04 はよける。O-2）
    for (let n = 0; n < 40; n++) {
      const b = r.pick([15, 18, 20, 22, 24, 25, 28]), k = r.pick([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15]);
      if (b === 25 && k === 0.04) continue;
      return { b, k };
    }
    return null;
  }
  // 答えのルールが「差 T-b の k 倍で、差をへらす向き」か（右辺を2つの温度で計算する）
  function ruleIs(ans, k, b) {
    const R = rule1(ans + '$');
    if (!R) return `ルールの形でない（${ans}）`;
    return (close(rhsAt(R, b + 10), -k * 10) && close(rhsAt(R, b - 10), k * 10)) || `ルール ${ans} がちがう`;
  }
  M.add({
    id: '6-02', part: 1, chap: '6-1③ 例題2', stars: 1,
    title: 'ことばからルール：「差の□倍で冷める」は $-k\\,(T-\\text{部屋の温度})$',
    mark: '「部屋は□℃」「冷める速さは、部屋との温度の差の□倍〔1/分〕」。',
    futsu: ['主役の量、変わる速さ、', '差、比例、向きを', '1つずつ考え、', 'ことばを記号に置きかえる。'],
    raku: ['部屋25℃、差の0.04倍', '→ $\\frac{\\dd T}{\\dd t}=-0.04\\,(T-25)$', '（マイナスを先に、かっこの中は「$T-$部屋」）', '85℃なら $-0.04\\times60=-2.4$'],
    why: '変わる速さ $\\frac{\\dd T}{\\dd t}$ が、差 $T-b$ に比例して、差をへらす向き（6-1③）。$T$ が部屋より高ければ差はプラスで、下がる向きなのでマイナスをつける。部屋より低くても同じ式で、右辺がプラスになって上がる。だから、冷めるときも温まるときも $-k\\,(T-b)$ の1つの形になる。',
    caution: 'マイナスをつけ忘れると、お湯がどんどん熱くなる式になる。「1分あたり3℃ずつ下がる」のように差に関係なく一定なら、差の形ではない（右辺はただの数）。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '40mm', s2: '40mm', s3: '40mm', trap: '32mm' }, boxh: { s1: '12mm', s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) { return /差の[\d.]+倍|差に比例/.test(q) && /ルール|変わる速さ/.test(q) && !rule1(q); },
    steps: {
      s1(r) {
        const g = pick02(r); if (!g) return null;
        const { b, k } = g, what = r.pick(COOL), A = `$${ruleN('T', k, b)}$`;
        return {
          q: `部屋は${b}℃です。${what}の温度 $T$〔℃〕の冷める速さは、部屋との温度の差の${fmt(k)}倍〔1/分〕です。$t$ を分として、ルールを □`, a: A, key: `02|${b}|${k}`,
          easy: `主役は $T$、変わる速さは $${DT('T')}$、差は $T-${b}$。冷めるので前にマイナス`, easyCheck: false,
          verify: p => ruleIs(p.a, k, b),
        };
      },
      // 温まる場面・ことばから変わる速さ
      s2(r) {
        const g = pick02(r); if (!g) return null;
        const { b, k } = g;
        if (turn(r, '02s2', 2)) {
          const T0 = r.int(2, 10), what = r.pick(WARM);
          return {
            q: `部屋は${b}℃です。冷蔵庫から出した${what}（${T0}℃）の温度 $T$〔℃〕の温まる速さは、部屋との温度の差の${fmt(k)}倍〔1/分〕です。$t$ を分として、ルールを □`, a: `$${ruleN('T', k, b)}$`, key: `02|${b}|${k}`,
            easy: `温まるときも差 $T-${b}$ をへらす向き。$T<${b}$ なら右辺がプラスになるので、式は冷めるときと同じ`, easyCheck: false,
            verify: p => ruleIs(p.a, k, b),
          };
        }
        const T1 = b + r.pick([10, 20, 25, 30, 40, 50, 60]), v = -k * (T1 - b), what = r.pick(COOL);
        if (decs(v) > 2 || T1 > 95) return null;
        return {
          q: `部屋は${b}℃で、${what}の冷める速さは部屋との温度の差の${fmt(k)}倍〔1/分〕です。${T1}℃のときの、温度の変わる速さ □ ℃/分`, a: M$(v), key: `02|${b}|${k}`,
          easy: `$${DT('T')}=-${fmt(k)}\\,(T-${b})$ に ${T1} を入れる：$-${fmt(k)}\\times${T1 - b}=${fmt(v)}$`, easyCheck: false,
          verify: p => valIs(p.a, -k * (T1 - b)),
        };
      },
      // はかった速さから比例の数を出す・差がいくつのときの速さから
      s3(r) {
        const g = pick02(r); if (!g) return null;
        const { b, k } = g, what = r.pick(COOL), Dd = r.pick([20, 30, 40, 50, 60]), rr = k * Dd;
        if (decs(rr) > 2 || b + Dd > 95) return null;
        if (turn(r, '02s3', 2)) {
          return {
            q: `部屋は${b}℃です。${what}が${b + Dd}℃のとき、1分あたり${fmt(rr)}℃の速さで下がっていました。冷める速さが部屋との温度の差に比例するとして、ルールを □`, a: `$${ruleN('T', k, b)}$`, key: `02|${b}|${k}`,
            easy: `差は $${b + Dd}-${b}=${Dd}$。比例の数は $${fmt(rr)}\\div${Dd}=${fmt(k)}$`, easyCheck: false,
            verify: p => ruleIs(p.a, rr / Dd, b),
          };
        }
        const T1 = b + r.pick([10, 15, 20, 25, 35, 45]), v = -k * (T1 - b);
        if (T1 - b === Dd || decs(v) > 3 || T1 > 95) return null;
        return {
          q: `部屋は${b}℃で、${what}の冷める速さは部屋との温度の差に比例し、差が${Dd}℃のとき1分あたり${fmt(rr)}℃です。${T1}℃のときの、温度の変わる速さ □ ℃/分`, a: M$(v), key: `02|${b}|${k}`,
          easy: `比例の数は $${fmt(rr)}\\div${Dd}=${fmt(k)}$。$-${fmt(k)}\\times(${T1}-${b})=${fmt(v)}$`, easyCheck: false,
          verify: p => valIs(p.a, -(rr / Dd) * (T1 - b)),
        };
      },
      // わな：差に関係なく一定の速さ（右辺はただの数。6-12）
      trap(r) {
        if (turn(r, '02t', 2)) {
          const rr = r.pick([2, 3, 4, 5, 1.5, 2.5]);
          return dest({ q: `お湯の温度 $T$〔℃〕が、部屋の温度に関係なく、1分あたり${fmt(rr)}℃ずつ下がり続けます。$t$ を分として、ルールを □`, a: `$${DT('T')}=-${fmt(rr)}$`, key: '02tA',
            verify: p => { const R = rule1(p.a + '$'); return (R && close(rhsAt(R, 80), -rr) && close(rhsAt(R, 30), -rr)) || 'ルールがちがう'; } },
          '6-02', '差に比例していない（いつも同じ速さ）ので、右辺はただの数。右辺に $T$ のない形', ['6-12']);
        }
        const rr = r.pick([0.2, 0.25, 0.3, 0.4, 0.5]);
        return dest({ q: `電気ケトルの水の温度 $T$〔℃〕が、1秒あたり${fmt(rr)}℃ずつ上がり続けます（熱は逃げない）。$t$ を秒として、ルールを □`, a: `$${DT('T')}=${fmt(rr)}$`, key: '02tB',
          verify: p => { const R = rule1(p.a + '$'); return (R && close(rhsAt(R, 80), rr) && close(rhsAt(R, 30), rr)) || 'ルールがちがう'; } },
        '6-02', '部屋との差に比例していない（いつも同じ速さで上がる）ので、右辺はただの数。右辺に $T$ のない形', ['6-12']);
      },
    },
  });

  // ================================================================ 6-03
  const R03 = [1, 2, 4, 5, 10, 20, 25, 40, 50, 100, 200, 250, 500];   // kΩ
  const C03 = [1, 2, 4, 5, 10, 20, 40, 50, 100, 200, 250, 400, 500, 1000];   // μF
  const RCOK = [0.1, 0.2, 0.25, 0.5, 1, 2, 4, 5, 10];
  function pick03(r) {   // RC が きりのよい秒になる組（左ページの例 20 kΩ・100 μF、50 kΩ・20 μF はよける）
    for (let n = 0; n < 80; n++) {
      const R = r.pick(R03), C = r.pick(C03), RC = R * C / 1000;
      if ((R === 20 && C === 100) || (R === 50 && C === 20)) continue;
      if (RCOK.some(v => close(v, RC))) return { R, C, RC: +fmt(RC) };
    }
    return null;
  }
  const vOverRC = RC => (RC === 1 ? '-V' : RC < 1 ? `-${fmt(1 / RC)}V` : `-\\frac{V}{${fmt(RC)}}`);   // -V/RC の書き方
  M.add({
    id: '6-03', part: 1, chap: '6-1④ 例題3', stars: 1,
    title: '$RC$ は $\\mathrm{k}$ と $\\mathrm{\\mu}$ を直してから（$\\mathrm{k\\Omega}\\times\\mathrm{\\mu F}$ は「数どうしをかけて1000でわる」と秒）',
    mark: '「$R=\\square\\,\\mathrm{k\\Omega}$、$C=\\square\\,\\mathrm{\\mu F}$」と放電のルール $\\frac{\\dd V}{\\dd t}=-\\frac{V}{RC}$。',
    futsu: ['$R=20\\times1000=20000\\,\\Omega$、', '$C=100\\div1000000=0.0001\\,\\mathrm{F}$', 'と直してから', '$RC=20000\\times0.0001=2$ 秒。'],
    raku: ['$20\\,\\mathrm{k\\Omega}$ と $100\\,\\mathrm{\\mu F}$', '→ $20\\times100\\div1000=2$ 秒', '→ $\\frac{\\dd V}{\\dd t}=-\\frac{V}{2}$、$10\\,\\mathrm{V}$ で毎秒 $5\\,\\mathrm{V}$ 下がる', '$50\\,\\mathrm{k\\Omega}$・$20\\,\\mathrm{\\mu F}$ → 1秒 → $-V$'],
    why: '$\\mathrm{k}$ は1000倍、$\\mathrm{\\mu}$ は100万分の1。$\\mathrm{k\\Omega}\\times\\mathrm{\\mu F}$ は $1000\\times\\frac{1}{1000000}$、つまり $\\frac{1}{1000}$ なので、数どうしをかけて1000でわれば $\\mathrm{\\Omega}\\times\\mathrm{F}$（秒）になる（6-1④）。放電の電圧の変わる速さは $-\\frac{V}{RC}$ で、今の電圧を $RC$ でわった速さで下がる。',
    caution: '$\\mathrm{k\\Omega}$・$\\mathrm{\\mu F}$ のまま $20\\times100=2000$ としない（単位が秒ではない）。$RC$ は「秒」。下がる速さは今の電圧で変わる（$10\\,\\mathrm{V}$ なら毎秒 $5\\,\\mathrm{V}$、$4\\,\\mathrm{V}$ なら毎秒 $2\\,\\mathrm{V}$）。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '16mm', s3: '16mm', trap: '16mm' }, boxh: { s1: '12mm' },
    fits(q) { return (/\\Omega/.test(q) || /抵抗/.test(q) && /放電|充電/.test(q)) && /\\mathrm\{\\mu F\}/.test(q) && !/一定の電流|オイラー|\\Delta t/.test(q); },
    steps: {
      s1(r) {
        const g = pick03(r); if (!g) return null;
        const { R, C, RC } = g;
        if (turn(r, '03s1', 2)) {
          return {
            q: `抵抗 $R=${fmt(R)}\\,\\mathrm{k\\Omega}$、静電容量 $C=${fmt(C)}\\,\\mathrm{\\mu F}$ で、コンデンサーを放電させます。$RC$ は □ 秒`, a: M$(RC), key: `03|${R}|${C}`,
            easy: `$${R}\\times${C}\\div1000=${fmt(RC)}$`, easyCheck: false,
            verify: p => valIs(p.a, (R * 1000) * (C / 1000000)),
          };
        }
        return {
          q: `抵抗 $R=${fmt(R)}\\,\\mathrm{k\\Omega}$、静電容量 $C=${fmt(C)}\\,\\mathrm{\\mu F}$ で放電させるときのルール $${DT('V')}=-\\frac{V}{RC}$ に数を入れると、$${DT('V')}=□$`, a: `$${vOverRC(RC)}$`, key: `03|${R}|${C}`,
          easy: `$RC=${R}\\times${C}\\div1000=${fmt(RC)}$ 秒`, easyCheck: false,
          verify: p => { const f = ev(strip(p.a), { V: 6 }); return close(f, -6 / ((R * 1000) * (C / 1000000))) || `答え ${p.a} がちがう`; },
        };
      },
      // ある電圧での、電圧の変わる速さ
      s2(r) {
        const g = pick03(r); if (!g) return null;
        const { R, C, RC } = g, V = r.pick([2, 3, 4, 5, 6, 8, 9, 10, 12]), v = -V / RC;
        if (decs(v) > 2) return null;
        return {
          q: `抵抗 $R=${fmt(R)}\\,\\mathrm{k\\Omega}$、静電容量 $C=${fmt(C)}\\,\\mathrm{\\mu F}$ で、コンデンサーを放電させます。電圧が ${U(V, 'V')} のときの、電圧の変わる速さ □ V/s`, a: M$(v), key: `03|${R}|${C}`,
          easy: `$RC=${fmt(RC)}$ 秒、$-\\frac{${V}}{${fmt(RC)}}=${fmt(v)}$（1秒あたり${fmt(-v)} V 下がる）`, easyCheck: false,
          verify: p => valIs(p.a, -V / ((R * 1000) * (C / 1000000))),
        };
      },
      // 抵抗を逆に求める・充電のはじめの速さ・Ω と μF
      s3(r) {
        const k = turn(r, '03s3', 3), g = pick03(r); if (!g) return null;
        const { R, C, RC } = g;
        if (k === 0) {
          const V = r.pick([2, 4, 5, 6, 8, 10, 12]), rr = V / RC;
          if (decs(rr) > 2) return null;
          return {
            q: `静電容量 $C=${fmt(C)}\\,\\mathrm{\\mu F}$ のコンデンサーを抵抗につないで放電させると、電圧が ${U(V, 'V')} のとき、1秒あたり ${U(rr, 'V')} の速さで下がりました。抵抗 $R$ は $□\\,\\mathrm{k\\Omega}$`, a: M$(R), key: `03|${R}|${C}`,
            easy: `$RC=${V}\\div${fmt(rr)}=${fmt(RC)}$ 秒。$R=${fmt(RC)}\\times1000\\div${C}=${R}$`, easyCheck: false,
            verify: p => valIs(p.a, V / rr / (C / 1000000) / 1000),
          };
        }
        if (k === 1) {
          const E = r.pick([3, 5, 6, 9, 10, 12]), V1 = r.pick([0, 0, 1, 2]), v = (E - V1) / RC;
          if (V1 >= E || decs(v) > 2) return null;
          return {
            q: `電池 ${U(E, 'V')}、抵抗 $R=${fmt(R)}\\,\\mathrm{k\\Omega}$、コンデンサー $C=${fmt(C)}\\,\\mathrm{\\mu F}$ を1列につないで充電します（ルール $${DT('V')}=\\frac{E-V}{RC}$）。コンデンサーの電圧が ${U(V1, 'V')} のときの、電圧の変わる速さ □ V/s`, a: M$(v), key: `03|${R}|${C}`,
            easy: `$RC=${fmt(RC)}$ 秒。$\\frac{${E}-${V1}}{${fmt(RC)}}=${fmt(v)}$`, easyCheck: false,
            verify: p => valIs(p.a, (E - V1) / ((R * 1000) * (C / 1000000))),
          };
        }
        const Rw = R * 1000 / 10, Cw = C * 10;   // Ω と μF（同じ RC）
        if (Rw < 10 || Cw > 5000) return null;
        return {
          q: `抵抗 $R=${fmt(Rw)}\\,\\mathrm{\\Omega}$、静電容量 $C=${fmt(Cw)}\\,\\mathrm{\\mu F}$ で、コンデンサーを放電させます。$RC$ は □ 秒`, a: M$(RC), key: `03|${R}|${C}`,
          easy: `$\\mathrm{\\Omega}$ はそのまま、$\\mathrm{\\mu F}$ は100万でわる：$${fmt(Rw)}\\times${fmt(Cw)}\\div1000000=${fmt(RC)}$`, easyCheck: false,
          verify: p => valIs(p.a, Rw * (Cw / 1000000)),
        };
      },
      // わな：一定の電流（RC ではなく I/C。6-14）
      trap(r) {
        const C = r.pick([50, 100, 200, 500]), I = r.pick([0.5, 1, 2]), Vt = r.pick([2, 3, 4, 5, 6]), t = Vt * C / 1000 / I;
        if (decs(t) > 2 || (C === 100 && I === 1 && Vt === 5)) return null;
        return dest({ q: `静電容量 $C=${fmt(C)}\\,\\mathrm{\\mu F}$ のコンデンサーに、一定の電流 ${U(I, 'mA')} を流しこみます。はじめ $V=0$ のとき、電圧が ${U(Vt, 'V')} になる時刻 □ 秒`, a: M$(t), key: `03t|${C}|${I}`,
          verify: p => valIs(p.a, Vt * (C / 1000000) / (I / 1000)) },
        '6-03', `抵抗につないだ放電・充電ではない。一定の電流なら $${DT('V')}=\\frac{I}{C}$ で、電圧はまっすぐ上がる`, ['6-14']);
      },
    },
  });

  // ================================================================ 6-04
  const M04 = [0.1, 0.2, 0.25, 0.4, 0.5, 1, 2, 4, 5];
  const K04 = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 100, 200];
  function pick04(r) {   // k/m が整数になる組（左ページの例 0.5 kg・8 N/m、2 kg・50 N/m はよける）
    for (let n = 0; n < 80; n++) {
      const m = r.pick(M04), k = r.pick(K04), K = k / m;
      if ((m === 0.5 && k === 8) || (m === 2 && k === 50)) continue;
      if (Math.abs(K - Math.round(K)) < 1e-9 && K >= 2 && K <= 400) return { m, k, K: Math.round(K) };
    }
    return null;
  }
  const X04 = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2];
  M.add({
    id: '6-04', part: 1, chap: '6-1⑤ 例題4', stars: 1,
    title: 'ばねのルール：$m\\ddot x=-kx$ を $m$ でわる（加速度＝$-k\\div m\\times$ずれ）',
    mark: '質量とばね定数、「ずれ□ m のときの加速度」「ルールを書く」。',
    futsu: ['ばねの力 $-kx$ を出してから、', '運動の法則「力＝質量×加速度」で', '質量でわって加速度を出す。', '（ずれのたびに力から計算）'],
    raku: ['0.5 kg・8 N/m → $\\frac{\\dd^2x}{\\dd t^2}=-16x$', '$x=-0.05$ で $-16\\times(-0.05)=+0.8$', '（右向きに $0.8\\,\\mathrm{m/s^2}$）', '2 kg・50 N/m → $-25x$'],
    why: '運動の法則 $m\\frac{\\dd^2x}{\\dd t^2}=-kx$ の両辺を $m$ でわると、加速度は「ずれの $\\frac{k}{m}$ 倍で、もどる向き」（6-1⑤）。$\\frac{k}{m}$ を1回計算しておけば、どのずれでも加速度はかけ算1回で出る。',
    caution: '左にずれているとき（$x$ がマイナス）は、加速度はプラス（右向き）。$\\frac{m}{k}$ と逆にしない。g（グラム）は kg に直してからわる。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' }, boxh: { trap: '12mm' },
    fits(q) { return /ばね定数/.test(q) && /加速度|ルール/.test(q) && !/周期|オイラー|\\Delta t|速度を先|振動数|静かにはなし|の式で|\\cos|\\sin/.test(q); },
    steps: {
      s1(r) {
        const g = pick04(r); if (!g) return null;
        const { m, k, K } = g;
        return {
          q: `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつけました。ずれ $x$〔m〕のルールは $${D2('x')}=□\\,x$`, a: M$(-K), key: `04|${m}|${k}`,
          easy: `$${fmt(m)}\\,${D2('x')}=-${k}x$ の両辺を${fmt(m)}でわる：$${k}\\div${fmt(m)}=${K}$`, easyCheck: false,
          verify: p => valIs(p.a, -k / m),
        };
      },
      // ずれから加速度（右向きを正）
      s2(r) {
        const g = pick04(r); if (!g) return null;
        const { m, k, K } = g, x = r.pick(X04) * r.pick([1, -1]), acc = -K * x;
        if (decs(acc) > 2 || Math.abs(acc) > 40) return null;
        return {
          q: `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつけました（右向きを正）。ずれが $x=${fmt(x)}\\,\\mathrm{m}$ のときの加速度 $□\\,\\mathrm{m/s^2}$`, a: M$(acc), key: `04|${m}|${k}`,
          easy: `$${D2('x')}=-${K}x$。$-${K}\\times${par(x)}=${fmt(acc)}$（${acc > 0 ? '右' : '左'}向き）`, easyCheck: false,
          verify: p => valIs(p.a, (-k * x) / m),
        };
      },
      // グラムで・質量を逆に・ずれを逆に
      s3(r) {
        const kk = turn(r, '04s3', 3), g = pick04(r); if (!g) return null;
        const { m, k, K } = g;
        if (kk === 0) {
          const grams = m * 1000, x = r.pick(X04), acc = -K * x;
          if (m >= 1 || decs(acc) > 2) return null;
          return {
            q: `質量 $${fmt(grams)}\\,\\mathrm{g}$ のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつけました（右向きを正）。ずれが $x=${fmt(x)}\\,\\mathrm{m}$ のときの加速度 $□\\,\\mathrm{m/s^2}$`, a: M$(acc), key: `04|${m}|${k}`,
            easy: `${fmt(grams)} g＝${fmt(m)} kg。$${k}\\div${fmt(m)}=${K}$、$-${K}\\times${fmt(x)}=${fmt(acc)}$`, easyCheck: false,
            verify: p => valIs(p.a, -k * x / (grams / 1000)),
          };
        }
        const x = r.pick(X04), acc = K * x;
        if (decs(acc) > 2) return null;
        if (kk === 1) {
          return {
            q: `ばね定数 ${U(k, 'N/m')} のばねにおもりをつけました。おもりが右へ ${U(x, 'm')} ずれたとき、加速度は左向きに $${fmt(acc)}\\,\\mathrm{m/s^2}$ でした。おもりの質量 □ kg`, a: M$(m), key: `04|${m}|${k}`,
            easy: `$\\frac{k}{m}=${fmt(acc)}\\div${fmt(x)}=${K}$。$m=${k}\\div${K}=${fmt(m)}$`, easyCheck: false,
            verify: p => valIs(p.a, k * x / acc),
          };
        }
        return {
          q: `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつけました（右向きを正）。加速度が左向きに $${fmt(acc)}\\,\\mathrm{m/s^2}$ になるときのずれ $x$ □ m`, a: M$(x), key: `04|${m}|${k}`,
          easy: `$-${K}x=-${fmt(acc)}$ より $x=${fmt(x)}$`, easyCheck: false,
          verify: p => valIs(p.a, m * acc / k),
        };
      },
      // わな：周期（6-31）
      trap(r) {
        const [m, k, w] = r.pick([[1, 16, 4], [1, 4, 2], [0.25, 4, 4], [2, 8, 2], [1, 25, 5], [0.1, 10, 10], [0.2, 20, 10], [4, 16, 2], [0.5, 50, 10], [2, 32, 4]]);
        const A = { 2: '\\pi', 4: '\\frac{\\pi}{2}', 5: '\\frac{2\\pi}{5}', 10: '\\frac{\\pi}{5}' }[w];
        return dest({ q: `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(k, 'N/m')} のばねにつけました。ゆれの周期 □ 秒`, a: `$${A}$`, key: `04t|${w}`,
          verify: p => valIs(p.a, 2 * Math.PI * Math.sqrt(m / k)) },
        '6-04', `加速度ではなく周期を聞いている。$\\omega_{\\mathrm n}=\\sqrt{\\frac{k}{m}}=${w}$、周期は $\\frac{2\\pi}{\\omega_{\\mathrm n}}$`, ['6-31']);
      },
    },
  });

  // ================================================================ 6-05
  const A05 = [-3, -2, -1, -0.5, -0.4, -0.2, -0.1, 0.1, 0.2, 0.5, 1, 2];
  const V05 = ['y', 'N', 'V', 'q'];
  const ex05 = a => (a === 1 ? 't' : a === -1 ? '-t' : fmt(a) + 't');                 // 肩：-0.5t
  const sol05 = (y0, a) => `${y0 === 1 ? '' : fmt(y0)}e^{${ex05(a)}}`;                // 5e^{-2t}
  function pick05(r) {   // 係数 a と、はじめの値 y0（左ページの例 -2y・5 はよける）
    const a = r.pick(A05), y0 = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 20, 50]);
    return a === -2 && y0 === 5 ? null : { a, y0, v: r.pick(V05) };
  }
  // 式 f（t の式）が、y'=a*y をみたし、f(0)=y0 か（数で微分する）
  function solves05(f, a, y0) {
    const h = 1e-5, F = t => ev(f, { t });
    for (const t of [0.3, 0.9, 1.4]) { const d = (F(t + h) - F(t - h)) / (2 * h); if (!close(d, a * F(t), 1e-5)) return false; }
    return close(F(0), y0);
  }
  M.add({
    id: '6-05', part: 1, chap: '6-1①⑧ 例題5・6', stars: 1,
    title: '1階の解：$y\'=ay$、$y(0)=y_0$ の解は $y_0e^{at}$（肩に係数、前にはじめの値）',
    mark: '$\\frac{\\dd y}{\\dd t}=-2y$ のような「自分の□倍」のルールと、$e^{\\square t}$ の候補・「解は」。',
    futsu: ['候補を1つずつ微分して左辺を作り、', '右辺に入れた式とくらべる。', '$t=0$ を入れて、', 'はじめの値も確かめる。'],
    raku: ['$\\frac{\\dd y}{\\dd t}=-2y$、$y(0)=5$ の解は？', '（ア）$5-10t$（イ）$5e^{-2t}$（ウ）$5e^{2t}$', '→ 計算せずに、肩が $-2$、前が5の（イ）'],
    why: '$(e^{at})\'=ae^{at}$（5-14）なので、$y=y_0e^{at}$ を微分すると $ay_0e^{at}=a\\times y$。左辺と右辺がどの $t$ でも同じになり、$t=0$ では $y_0e^0=y_0$（6-1⑧）。だから、ルールの係数を肩に、はじめの値を前に書けば、それが解になる。',
    caution: '肩の符号を逆にしない（$-2y$ なら $e^{-2t}$）。直線 $y_0+ay_0t$ は $t=0$ だけ左辺と右辺が合う（すべての時刻では合わない）。右辺が「数－数×$y$」のときは、この形ではない。',
    counts: { s1: 3, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '30mm', s3: '30mm', trap: '32mm' }, boxh: { s2: '12mm', s3: '12mm', trap: '12mm' },
    fits(q) {
      const R = rule1(q);
      if (!R || has2(q) || SEE.test(q) || /オイラー|変わる速さ|傾き|後の|後は|積分|C2|B3/.test(q)) return false;
      const body = R.rhs.replace(/\\,/g, '');
      const prop = new RegExp(`^-?(?:[\\d.]*|□)${R.v}$|^-?\\\\frac\\{${R.v}\\}\\{[\\d.]+\\}$`).test(body);
      return prop && /解|左辺/.test(q);
    },
    steps: {
      // 3つの候補から解を選ぶ
      s1(r) {
        const g = pick05(r); if (!g) return null;
        const { a, y0, v } = g, lin = `${fmt(y0)}${a * y0 < 0 ? '-' : '+'}${fmt(Math.abs(a * y0))}t`;
        const cands = r.shuffle([[sol05(y0, a), true], [sol05(y0, -a), false], [lin, false]]), lab = ['ア', 'イ', 'ウ'];
        const k = cands.findIndex(c => c[1]);
        return {
          q: `微分方程式 $${DT(v)}=${cf(a)}${v}$、初期条件 $${v}(0)=${y0}$ の解は、（ア）$${v}=${cands[0][0]}$、（イ）$${v}=${cands[1][0]}$、（ウ）$${v}=${cands[2][0]}$ のどれ □`,
          a: `（${lab[k]}）`, key: `05|${a}|${y0}`,
          easy: `肩が $${fmt(a)}$、前が ${y0} の $${sol05(y0, a)}$`, easyCheck: false,
          // 別の道すじ：候補を1つずつ数で微分して、みたすのが答えの1つだけか
          verify: p => { const ok = cands.map(c => solves05(c[0], a, y0)); return (ok.filter(Boolean).length === 1 && p.a === `（${lab[ok.indexOf(true)]}）`) || `答え ${p.a} がちがう`; },
        };
      },
      // 解を書く（同じ見開きで、はじめの値も係数の大きさもくり返さない。第40回 R1-31）
      s2(r) {
        const used = r.u05 || (r.u05 = { y: new Set(), a: new Set() });
        if (used.y.size >= 6) { used.y.clear(); used.a.clear(); }   // アプリで何問も作るときは、ひとまわりしたら、また使う
        let g = null;
        for (let k = 0; k < 30 && !g; k++) { g = pick05(r); if (g && (used.y.has(g.y0) || used.a.has(Math.abs(g.a)))) g = null; }
        if (!g) return null;
        used.y.add(g.y0); used.a.add(Math.abs(g.a));
        const { a, y0, v } = g;
        return {
          q: `微分方程式 $${DT(v)}=${cf(a)}${v}$、初期条件 $${v}(0)=${y0}$ の解 □`, a: `$${v}=${sol05(y0, a)}$`, key: `05|${a}|${y0}`,
          easy: `係数 $${fmt(a)}$ を肩に、はじめの値 ${y0} を前に`, easyCheck: false,
          calc: { kind: 'ode', x: 't', coef: [1, -a], init: [[0, y0]] },
        };
      },
      // 分数の係数・左辺の値・解からルールを読む
      s3(r) {
        const k = turn(r, '05s3', 3), g = pick05(r); if (!g) return null;
        const { a, y0, v } = g;
        if (k === 0) {
          const tau = r.pick([2, 3, 4, 5, 10]);
          return {
            q: `微分方程式 $${DT(v)}=-\\frac{${v}}{${tau}}$、初期条件 $${v}(0)=${y0}$ の解 □`, a: `$${v}=${y0}e^{-t/${tau}}$`, key: `05|${fmt(-1 / tau)}|${y0}`,
            easy: `$-\\frac{${v}}{${tau}}=-\\frac{1}{${tau}}\\,${v}$ なので、肩は $-\\frac{t}{${tau}}$`, easyCheck: false,
            calc: { kind: 'ode', x: 't', coef: [1, 1 / tau], init: [[0, y0]] },
          };
        }
        if (k === 1) {
          return {
            q: `$${v}=${sol05(y0, a)}$ を微分方程式 $${DT(v)}=${cf(a)}${v}$ の左辺に入れたとき、$t=0$ での左辺の値 □`, a: M$(a * y0), key: `05|${a}|${y0}`,
            easy: `左辺は $${fmt(a * y0)}e^{${ex05(a)}}$（$${fmt(a)}$ 倍）。$t=0$ で $e^0=1$`, easyCheck: false,
            verify: p => { const h = 1e-6, F = t => ev(sol05(y0, a), { t }); return valIs(p.a, (F(h) - F(-h)) / (2 * h), 1e-6); },
          };
        }
        return {
          q: `$${v}=${sol05(y0, a)}$ が解になる微分方程式 $${DT(v)}=□\\,${v}$`, a: M$(a), key: `05|${a}|${y0}`,
          easy: `肩の数 $${fmt(a)}$ が係数`, easyCheck: false,
          verify: p => { const c = numOf(p.a); return solves05(sol05(y0, a), c, y0) || `答え ${p.a} がちがう`; },
        };
      },
      // わな：右辺が「数－数×y」（6-19）
      trap(r) {
        const a = r.pick([1, 2, 0.5, 0.2]), yi = r.pick([2, 3, 4, 5, 10]), b = a * yi, y0 = yi + r.pick([-2, -1, 1, 2, 3, 5]);
        if (y0 <= 0 || decs(b) > 1) return null;
        const c0 = y0 - yi, A = `y=${yi}${c0 > 0 ? '+' : '-'}${Math.abs(c0) === 1 ? '' : Math.abs(c0)}e^{${ex05(-a)}}`;
        return dest({ q: `微分方程式 $${DT('y')}=${fmt(b)}-${cf(a)}y$、初期条件 $y(0)=${y0}$ の解 □`, a: `$${A}$`, key: `05t|${a}|${yi}|${y0}`,
          calc: { kind: 'ode', x: 't', coef: [1, a], rhs: fmt(b), init: [[0, y0]] } },
        '6-05', `右辺が「自分の□倍」だけでなく、数 ${fmt(b)} がたしてあるので、$y_0e^{at}$ の形ではない。右辺が0になる ${yi} に近づく形`, ['6-19']);
      },
    },
  });

  // ================================================================ 6-06
  const W06 = [2, 3, 5, 6, 8, 10];
  const A06 = [0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.12, 0.15, 0.2];
  const trig = (A, fn, w) => `${fmt(A)}\\${fn}${w}t`;
  function pick06(r) {   // 左ページの例（0.1cos4t・0.05sin4t・-16x）の ω=4 は、W06 に入れない（O-2）
    const w = r.pick(W06), A = r.pick(A06);
    return { w, A, K: w * w };
  }
  M.add({
    id: '6-06', part: 1, chap: '6-1⑧ 例題7', stars: 1,
    title: '2階の解：$\\ddot x=-Kx$ なら $\\omega^2=K$ の $\\cos\\omega t$・$\\sin\\omega t$（前の数は、はじめの位置と速度から）',
    mark: '$\\frac{\\dd^2x}{\\dd t^2}=-Kx$ と $x=\\square\\cos\\omega t$・$\\square\\sin\\omega t$、2つの初期条件。',
    futsu: ['候補を1回微分し、もう1回微分して', '左辺を作り、右辺 $-Kx$ とくらべる。', '$t=0$ を入れて、位置と速度の', '2つの初期条件を確かめる。'],
    raku: ['$x=0.1\\cos4t$ と $\\frac{\\dd^2x}{\\dd t^2}=-16x$', '→ 2回微分を書き出さずに $4^2=16$', '$x(0)=0.1$、$\\frac{\\dd x}{\\dd t}(0)=0$', '$x=0.05\\sin4t$ → $\\frac{\\dd x}{\\dd t}(0)=0.05\\times4=0.2$'],
    why: '$(\\cos\\omega t)\'=-\\omega\\sin\\omega t$、$(\\sin\\omega t)\'=\\omega\\cos\\omega t$（5-15）なので、どちらも2回微分すると $-\\omega^2$ 倍になる。だから $\\omega^2=K$ なら、左辺と右辺がどの $t$ でも同じ。$t=0$ では $\\cos0=1$、$\\sin0=0$ なので、位置は $\\cos$ の前の数、速度は $\\sin$ の前の数×$\\omega$ になる。',
    caution: '$\\omega$ と $K$ をとりちがえない（$K=16$ なら $\\omega=4$）。2階の式には初期条件が2つ要る。右辺がプラス（$+Kx$）や、$\\frac{\\dd x}{\\dd t}$ の項（ダンパー）があるときは、この形ではない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '30mm', s3: '42mm', trap: '30mm' }, boxh: { trap: '12mm' },
    fits(q) {
      if (SEE.test(q) || /ダンパー|オイラー|\\Delta t|周期/.test(q)) return false;
      if (/=-(?:\d+|K)x\$/.test(q) && /\\cos|\\sin|の解/.test(q)) return true;
      if (/2回微分すると/.test(q) && /\\cos|\\sin/.test(q)) return true;
      if (/\\sin|\\cos/.test(q) && /はじめの速度/.test(q)) return true;
      return /ばね定数/.test(q) && /静かにはなし/.test(q) && /の式で/.test(q);
    },
    steps: {
      s1(r) {
        const k = turn(r, '06s1', 3), g = pick06(r); if (!g) return null;
        const { w, A, K } = g, fn = r.pick(['cos', 'sin']);
        if (k === 0) return {
          q: `$x=${trig(A, fn, w)}$ が微分方程式 $${D2('x')}=-Kx$ の解になるとき、$K$ □`, a: M$(K), key: `06s1|${w}`,
          easy: `$${w}^2=${K}$`, easyCheck: false,
          verify: p => { const h = 1e-3, F = t => ev(trig(A, fn, w), { t }), t0 = 0.37; return valIs(p.a, -((F(t0 + h) - 2 * F(t0) + F(t0 - h)) / (h * h)) / F(t0), 1e-4); },
        };
        if (k === 1) return {
          q: `微分方程式 $${D2('x')}=-${K}x$ の解 $x=${fmt(A)}\\cos□t$`, a: M$(w), key: `06s1|${w}`,
          easy: `$\\omega^2=${K}$ より $\\omega=${w}$`, easyCheck: false,
          verify: p => { const c = numOf(p.a); return close(c * c, K) && c > 0 || `答え ${p.a} がちがう`; },
        };
        return {
          q: `$x=${trig(A, fn, w)}$ を2回微分すると、もとの $x$ の □ 倍`, a: M$(-K), key: `06s1|${w}`,
          easy: `$-${w}^2=-${K}$`, easyCheck: false,
          verify: p => { const h = 1e-3, F = t => ev(trig(A, fn, w), { t }), t0 = 0.29; return valIs(p.a, ((F(t0 + h) - 2 * F(t0) + F(t0 - h)) / (h * h)) / F(t0), 1e-4); },
        };
      },
      // はじめの速度・初期条件から解を書く
      s2(r) {
        const k = turn(r, '06s2', 3), g = pick06(r); if (!g) return null;
        const { w, A, K } = g, v0 = A * w;
        if (k === 0) return {
          q: `$x=${trig(A, 'sin', w)}$ のはじめの速度 $\\frac{\\dd x}{\\dd t}(0)$ □`, a: M$(v0), key: `06|${w}|${A}`,
          easy: `$\\sin$ の前の数×$\\omega$：$${fmt(A)}\\times${w}=${fmt(v0)}$`, easyCheck: false,
          verify: p => { const h = 1e-6, F = t => ev(trig(A, 'sin', w), { t }); return valIs(p.a, (F(h) - F(-h)) / (2 * h), 1e-6); },
        };
        if (k === 1) return {
          q: `微分方程式 $${D2('x')}=-${K}x$、初期条件 $x(0)=${fmt(A)}$、$\\frac{\\dd x}{\\dd t}(0)=0$ の解 □`, a: `$x=${trig(A, 'cos', w)}$`, key: `06|${w}|${A}`,
          easy: `$\\omega=\\sqrt{${K}}=${w}$。はじめの位置が $\\cos$ の前の数`, easyCheck: false,
          calc: { kind: 'ode', x: 't', coef: [1, 0, K], init: [[0, A], [0, 0, 1]] },
        };
        return {
          q: `微分方程式 $${D2('x')}=-${K}x$、初期条件 $x(0)=0$、$\\frac{\\dd x}{\\dd t}(0)=${fmt(v0)}$ の解 □`, a: `$x=${trig(A, 'sin', w)}$`, key: `06|${w}|${A}`,
          easy: `$\\omega=${w}$。$\\sin$ の前の数は $${fmt(v0)}\\div${w}=${fmt(A)}$`, easyCheck: false,
          calc: { kind: 'ode', x: 't', coef: [1, 0, K], init: [[0, 0], [0, v0, 1]] },
        };
      },
      // 位置も速度も0でない・ばねのことばから
      s3(r) {
        if (turn(r, '06s3', 2)) {
          const [m, kk, w] = r.pick([[0.5, 18, 6], [1, 9, 3], [0.5, 2, 2], [2, 50, 5], [0.1, 10, 10], [1, 36, 6], [0.25, 16, 8], [0.2, 20, 10], [1, 4, 2], [4, 36, 3]]), A = r.pick(A06);
          if (w === 4 && A === 0.1) return null;
          return {
            q: `質量 ${U(m, 'kg')} のおもりを、ばね定数 ${U(kk, 'N/m')} のばねにつけ、つり合いの位置から ${U(A, 'm')} 引いて静かにはなしました。ずれ $x$〔m〕を $t$〔s〕の式で □`, a: `$x=${trig(A, 'cos', w)}$`, key: `06|${w}|${A}`,
            easy: `$\\frac{k}{m}=${fmt(kk / m)}$、$\\omega=${w}$。静かにはなしたので速度0、$\\cos$ だけ`, easyCheck: false,
            calc: { kind: 'ode', x: 't', coef: [m, 0, kk], init: [[0, A], [0, 0, 1]] },
          };
        }
        const g = pick06(r); if (!g) return null;
        const { w, A, K } = g, B = r.pick(A06), v0 = B * w;
        if (A === B) return null;
        return {
          q: `微分方程式 $${D2('x')}=-${K}x$、初期条件 $x(0)=${fmt(A)}$、$\\frac{\\dd x}{\\dd t}(0)=${fmt(v0)}$ の解 □`, a: `$x=${trig(A, 'cos', w)}+${trig(B, 'sin', w)}$`, key: `06|${w}|${A}`,
          easy: `$\\cos$ の前は位置 ${fmt(A)}、$\\sin$ の前は $${fmt(v0)}\\div${w}=${fmt(B)}$`, easyCheck: false,
          calc: { kind: 'ode', x: 't', coef: [1, 0, K], init: [[0, A], [0, v0, 1]] },
        };
      },
      // わな：ダンパーの項がある（わざなし）・右辺がプラス（6-72）
      trap(r) {
        const g = pick06(r); if (!g) return null;
        const { w, A, K } = g;
        if (turn(r, '06t', 2)) {
          const c = r.pick([0.2, 0.4, 0.5, 0.8, 1, 2]), val = c * A * w;
          if (decs(val) > 3) return null;
          return dest({ q: `$x=${trig(A, 'cos', w)}$ を、ダンパーのある式 $${D2('x')}=-${K}x-${fmt(c)}\\,\\frac{\\dd x}{\\dd t}$ の右辺に入れます。$t=\\frac{\\pi}{${2 * w}}$ のときの右辺の値 □`, a: M$(val), key: `06tA|${w}|${A}|${c}`,
            verify: p => { const h = 1e-6, t0 = Math.PI / (2 * w), F = t => ev(trig(A, 'cos', w), { t }); return valIs(p.a, -K * F(t0) - c * (F(t0 + h) - F(t0 - h)) / (2 * h), 1e-5); } },
          '6-06', `ダンパーの項 $-${fmt(c)}\\,\\frac{\\dd x}{\\dd t}$ があるので、2回微分で $-\\omega^2$ 倍になるかを見るだけでは決まらない。代入して、左辺と右辺をくらべる（このとき左辺は0で、右辺と合わないので解ではない）`);
        }
        return dest({ q: `微分方程式 $${D2('x')}=${K}x$、初期条件 $x(0)=${fmt(A)}$、$\\frac{\\dd x}{\\dd t}(0)=${fmt(A * w)}$ の解 □`, a: `$x=${fmt(A)}e^{${w}t}$`, key: `06tB|${w}|${A}`,
          calc: { kind: 'ode', x: 't', coef: [1, 0, -K], init: [[0, A], [0, A * w, 1]] } },
        '6-06', `右辺がプラス（$+${K}x$）なので、$\\cos$・$\\sin$ ではなく $e^{${w}t}$・$e^{-${w}t}$（双曲線関数）の形`, ['6-72']);
      },
    },
  });

  // ================================================================ 6-07
  // 微分方程式の表：[TeX, 階数, 線形か（null：階数だけを聞く）]。左ページの例（9.8-0.01v^2、-9.8sinθ、-100q）は入れない
  const ODE07 = [
    [`${DT('T')}=-0.2\\,(T-15)`, 1, true], [`${DT('y')}=-3y`, 1, true], [`${DT('V')}=\\frac{6-V}{3}`, 1, true], [`${DT('q')}=-\\frac{q}{5}`, 1, true],
    [`${DT('N')}=0.3N`, 1, true], [`${DT('v')}=9.8-0.2v`, 1, true], [`${DT('y')}=4t-1`, 1, null], [`${DT('p', 'z')}=-9800`, 1, null],
    [`${DT('y')}=y^2`, 1, false], [`${DT('y')}=y^3`, 1, false], [`${DT('v')}=9.8-0.004v^2`, 1, false], [`${DT('h')}=-0.02\\sqrt h`, 1, false],
    [`${DT('y')}=y\\,(1-y)`, 1, false], [`${DT('N')}=0.5N-0.01N^2`, 1, false],
    [`${D2('x')}=-25x`, 2, true], [`${D2('y')}=-4y`, 2, true], [`${D2('x')}=9.8`, 2, true], [`${D2('T', 'x')}=0`, 2, null], [`${D2('y', 'x')}=0.008`, 2, null],
    [`${D2('x')}=-16x-0.8\\,\\frac{\\dd x}{\\dd t}`, 2, true], [`${D2('q')}=-400q`, 2, true],
    [`${D2('\\theta')}=-4.9\\sin\\theta`, 2, false], [`${D2('x')}=-x^3`, 2, false], [`${D2('x')}=-4x-0.1x^3`, 2, false], [`${D2('y')}=-y\\,\\frac{\\dd y}{\\dd t}`, 2, false],
  ];
  // 点や ' で書いた式（ステップ3）
  const DOT07 = [
    ['\\ddot x+0.4\\dot x+16x=0', 2, true], ['\\ddot x=-9x', 2, true], ["y''=-9y", 2, true], ['\\dot T=-0.1\\,(T-20)', 1, true], ["y'=-0.5y", 1, true],
    ['m\\ddot x=-kx-c\\dot x', 2, true], ['\\dot v=9.8-0.002v^2', 1, false], ['\\ddot x=-x^3', 2, false], ["y'=y\\,(2-y)", 1, false],
    ['\\ddot{\\theta}=-2.45\\sin\\theta', 2, false], ["y''=y^2", 2, false], ['\\dot q=-\\frac{q}{2}', 1, true],
  ];
  // 別の道すじ：式の文字から階数を読み、主役の量（と、その微分）について1次式かを、数で確かめる（2回の差が0）
  function classify07(tex) {
    let s = String(tex), main = null, ord = 1;
    let m;
    if ((m = /\\frac\{\\dd\^2([^}]*)\}/.exec(s))) { main = m[1]; ord = 2; }
    else if ((m = /\\ddot\s*\{?\\?([a-zA-Z]+)\}?/.exec(s))) { main = m[1]; ord = 2; }
    else if ((m = /([a-zA-Z])''/.exec(s))) { main = m[1]; ord = 2; }
    else if ((m = /\\frac\{\\dd ([^}]*)\}/.exec(s))) { main = m[1]; }
    else if ((m = /\\dot\s*\{?\\?([a-zA-Z]+)\}?/.exec(s))) { main = m[1]; }
    else if ((m = /([a-zA-Z])'/.exec(s))) { main = m[1]; }
    main = main.replace(/^\\/, '');
    // 微分の部分を、ほかの文字（P・Q）に置きかえる
    s = s.replace(/\\frac\{\\dd\^2[^}]*\}\{\\dd [a-z]\^2\}|\\ddot\s*\{?\\?[a-zA-Z]+\}?|[a-zA-Z]''/g, '(P)').replace(/\\frac\{\\dd [^}]*\}\{\\dd [a-z]\}|\\dot\s*\{?\\?[a-zA-Z]+\}?|[a-zA-Z]'/g, '(Q)');
    const [L, Rr] = s.split('=');
    const f = vals => { const a = ev(L, vals), b = ev(Rr, vals); return a == null || b == null ? NaN : a - b; };
    const base = { m: 0.7, k: 1.3, c: 0.4, t: 0.6, x: 0.8, z: 0.8 };
    const vs = [main, 'P', 'Q'];
    let lin = true;
    for (const u of vs) for (const w of vs) {
      const at = (du, dw) => f(Object.assign({}, base, { [main]: 0.9, P: 0.5, Q: 0.3 }, { [u]: (u === main ? 0.9 : u === 'P' ? 0.5 : 0.3) + du }, u === w ? {} : { [w]: (w === main ? 0.9 : w === 'P' ? 0.5 : 0.3) + dw }));
      const d2 = u === w ? at(2, 0) - 2 * at(1, 0) + at(0, 0) : at(1, 1) - at(1, 0) - at(0, 1) + at(0, 0);
      if (!isFinite(d2) || Math.abs(d2) > 1e-9) lin = false;
    }
    return { ord, lin };
  }
  const ans07 = (o, l) => `${o}階・${l ? '線形' : '線形でない'}`;
  M.add({
    id: '6-07', part: 1, chap: '6-1⑨ 例題9', stars: 1,
    title: '階数＝微分の回数＝要る初期条件の数。主役の量の2乗・$\\sin$・かけ算があれば線形でない',
    mark: '「階数」「線形かどうか」「はじめの状態はいくつ要る」。',
    futsu: ['式の形を1つずつ読んで、', '解き方の章を思い出し、', '解いてみて、決める数（$C$）が', 'いくつ出るかを数える。'],
    raku: ['$\\frac{\\dd v}{\\dd t}=9.8-0.01v^2$ → 1階・線形でない（$v^2$）', '$\\frac{\\dd^2\\theta}{\\dd t^2}=-9.8\\sin\\theta$ → 2階・線形でない', '$\\frac{\\dd^2q}{\\dd t^2}=-100q$ → 2階・線形、初期条件2つ'],
    why: '1回積分するごとに、決める数 $C$ が1つ出る（5-13）。だから、いちばん多い微分の回数（階数）だけ、初期条件が要る（6-1⑨）。主役の量とその微分が「数×主役の量」の形とたし算・ひき算だけで出てくれば線形。2乗・$\\sin$ の中・主役の量どうしのかけ算があると線形でない。',
    caution: '「$v^2$」の2乗は微分の回数ではない（$\\frac{\\dd^2x}{\\dd t^2}$ の2とまちがえない）。$\\dot x$ は1回微分、$\\ddot x$ は2回微分。$9.8$ のような定数の項があっても線形の仲間。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '34mm', s3: '34mm', trap: '32mm' }, boxh: { trap: '12mm' },
    fits(q) { return /階数|線形|初期条件の数|条件はいくつ|初期条件はいくつ/.test(q); },
    steps: {
      // 階数・初期条件の数
      s1(r) {
        const [t, o] = r.pick(ODE07);
        if (turn(r, '07s1', 2)) return {
          q: `微分方程式 $${t}$ の階数 □ 階`, a: M$(o), key: `07|${t}`,
          easy: o === 2 ? '2回微分があるので2階' : '1回微分だけなので1階', easyCheck: false,
          verify: p => valIs(p.a, classify07(t).ord),
        };
        return {
          q: `微分方程式 $${t}$ の解を1つに決めるのに要る、初期条件の数 □ つ`, a: M$(o), key: `07|${t}`,
          easy: `${o}階なので${o}つ`, easyCheck: false,
          verify: p => valIs(p.a, classify07(t).ord),
        };
      },
      // 階数と、線形かどうか
      s2(r) {
        const [t, o, l] = r.pick(ODE07);
        if (l == null) return null;
        return {
          q: `微分方程式 $${t}$ の階数と、線形かどうか □`, a: ans07(o, l), key: `07|${t}`,
          easy: l ? '主役の量は「数×主役の量」の形だけ' : `主役の量の${/\\sin/.test(t) ? '$\\sin$' : /sqrt/.test(t) ? '$\\sqrt{\\phantom{h}}$' : /\^/.test(t) ? '2乗・3乗' : 'かけ算'}がある`, easyCheck: false,
          verify: p => { const c = classify07(t); return p.a === ans07(c.ord, c.lin) || `答え ${p.a} がちがう（${ans07(c.ord, c.lin)}）`; },
        };
      },
      // 点や ' の書き方
      s3(r) {
        const [t, o, l] = r.pick(DOT07);
        if (turn(r, '07s3', 2)) return {
          q: `微分方程式 $${t}$ の階数と、線形かどうか □`, a: ans07(o, l), key: `07|${t}`,
          easy: `$${(/\\ddot\s*\{?\\?[a-zA-Z]+\}?|[a-zA-Z]''|\\dot\s*[a-zA-Z]|[a-zA-Z]'/.exec(t) || [''])[0]}$ は${o}回微分。${l ? '主役の量は「数×主役の量」の形だけ' : '主役の量の2乗・3乗・$\\sin$・かけ算がある'}`, easyCheck: false,
          verify: p => { const c = classify07(t); return p.a === ans07(c.ord, c.lin) || `答え ${p.a} がちがう（${ans07(c.ord, c.lin)}）`; },
        };
        return {
          q: `微分方程式 $${t}$ の解を1つに決めるのに要る、初期条件の数 □ つ`, a: M$(o), key: `07|${t}`,
          easy: `$${(/\\ddot\s*\{?\\?[a-zA-Z]+\}?|[a-zA-Z]''|\\dot\s*[a-zA-Z]|[a-zA-Z]'/.exec(t) || [''])[0]}$ は${o}回微分なので${o}つ`, easyCheck: false,
          verify: p => valIs(p.a, classify07(t).ord),
        };
      },
      // わな：解を求める（6-05・6-06）
      trap(r) {
        if (turn(r, '07t', 2)) {
          const a = r.pick([-0.5, -0.2, -3, -1, 0.4]), y0 = r.pick([2, 3, 4, 6, 8]);
          return dest({ q: `1階の微分方程式 $${DT('y')}=${cf(a)}y$、初期条件 $y(0)=${y0}$ の解 □`, a: `$y=${sol05(y0, a)}$`, key: `07tA|${a}|${y0}`,
            calc: { kind: 'ode', x: 't', coef: [1, -a], init: [[0, y0]] } },
          '6-07', '階数ではなく解そのものを聞いている。「自分の□倍」のルールなので、肩に係数、前にはじめの値', ['6-05']);
        }
        const w = r.pick([2, 3, 5, 6]), A = r.pick([0.1, 0.2, 0.05, 0.3]);
        return dest({ q: `2階の微分方程式 $${D2('x')}=-${w * w}x$、初期条件 $x(0)=${fmt(A)}$、$\\frac{\\dd x}{\\dd t}(0)=0$ の解 □`, a: `$x=${trig(A, 'cos', w)}$`, key: `07tB|${w}|${A}`,
          calc: { kind: 'ode', x: 't', coef: [1, 0, w * w], init: [[0, A], [0, 0, 1]] } },
        '6-07', `階数ではなく解そのものを聞いている。$\\omega^2=${w * w}$ の $\\cos$ の形`, ['6-06']);
      },
    },
  });

  // ================================================================ 6-08
  const F08 = [0.75, 0.8, 0.9, 0.92, 0.95, 0.96, 0.98];
  // 比例の数 a、Δt=h（差の倍率 f=1-ah）、部屋 b、差 d、歩数 n。
  //   左ページの例（-0.1(T-20)・60℃・0.5 → 差40に0.95を2回）と同じルール、同じ（差, 倍率）の組はよける（途中の 38・36.1 が左ページにあるので。第40回 S-1）
  function pick08(r, warm) {
    for (let k = 0; k < 60; k++) {
      const a = r.pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.25]), h = r.pick([0.5, 1, 2]), f = +fmt(1 - a * h);
      if (!F08.includes(f)) continue;
      const b = r.pick([15, 18, 20, 22, 25]), d = warm ? -r.pick([10, 12, 15, 16, 20]) : r.pick([20, 30, 40, 50, 60, 64]), n = r.pick([2, 3]);
      if ((a === 0.1 && b === 20) || (f === 0.95 && d === 40)) continue;
      if (warm && (b + d < 2 || b + d > 10)) continue;   // 冷蔵庫から出した牛乳は 2〜10℃（凍った温度や負の温度にしない）
      const T = b + d * f ** n;
      if (decs(T) > 3) continue;
      return { a, h, f, b, d, n, T0: b + d, T: +fmt(T) };
    }
    return null;
  }
  const chain = (y0, f, n) => { const o = [y0]; for (let k = 0; k < n; k++) o.push(+fmt(o[k] * f)); return o; };
  M.add({
    id: '6-08', part: 1, chap: '6-0①・6-2①②⑥⑧ 例題1・4', stars: 1,
    title: 'オイラー法は「差」に $1-a\\Delta t$ をかけて進める（充電は、残り $E-V$ にかける）',
    mark: '$\\frac{\\dd T}{\\dd t}=-a\\,(T-b)$ と「$\\Delta t=\\square$ のオイラー法で□分後」。',
    futsu: ['毎回、右辺に今の値を入れて速さを出し、', '速さ×$\\Delta t$ を今の値にたす。', '（1歩ごとに、ひき算・かけ算・', 'かけ算・たし算の4回）'],
    raku: ['$-0.1\\,(T-20)$、60℃、$\\Delta t=0.5$', '→ 差40に $1-0.1\\times0.5=0.95$ を2回', '→ 38、36.1 → 1分後は56.1℃', '充電 $\\frac{10-V}{2}$、$\\Delta t=0.5$ → 残り10に0.75を2回 → $V=4.375$'],
    why: 'オイラー法の1行 $T_{n+1}=T_n-a\\,(T_n-b)\\,\\Delta t$ の両辺から $b$ をひくと、差 $u=T-b$ について $u_{n+1}=(1-a\\Delta t)\\,u_n$（6-2②）。差は1歩ごとに同じ倍率でへるので、倍率を歩数だけかければよい。充電では、目標 $E$ との残り $E-V$ が同じように $1-\\frac{\\Delta t}{RC}$ 倍になる。',
    caution: '最後に部屋の温度（目標）をたしもどすのを忘れない。倍率は $1-a\\Delta t$ で、$a\\Delta t$ ではない。右辺が「差の何倍」の形でない（$v^2$ がある）ときは、この方法は使えない。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '18mm', s3: '18mm', trap: '16mm' },
    fits(q) {
      if (!isOneRule(q) || !/オイラー法/.test(q) || !/分後|秒後|（ア）/.test(q)) return false;
      if (/式 □|ずれ|倍率|何倍|ふらふら|こわれ|C2|B3|速度を先|ばね|半径/.test(q)) return false;
      return !!rateAB(rule1(q));
    },
    steps: {
      s1(r) {
        const g = pick08(r, false); if (!g) return null;
        const { a, h, f, b, d, n, T0, T } = g, c = chain(d, f, n);
        return {
          q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）、はじめ${T0}℃のお湯の${fmt(n * h)}分後の温度を、$\\Delta t=${fmt(h)}$ 分のオイラー法で求めると □ ℃`, a: M$(T), key: `08|${a}|${b}|${T0}|${h}`,
          easy: `差 ${d} に $1-${fmt(a)}\\times${fmt(h)}=${fmt(f)}$ を${n}回：${c.map(fmt).join(' → ')}。$${b}+${fmt(c[n])}=${fmt(T)}$`, easyCheck: false,
          verify: p => valIs(p.a, euler(rule1(p.q), T0, h, n)),
        };
      },
      // 充電・温まる・放電
      s2(r) {
        const k = turn(r, '08s2', 3);
        if (k === 1) {
          const g = pick08(r, true); if (!g) return null;
          const { a, h, f, b, d, n, T0, T } = g, c = chain(d, f, n);
          return {
            q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）、冷蔵庫から出した${T0}℃の牛乳の${fmt(n * h)}分後の温度を、$\\Delta t=${fmt(h)}$ 分のオイラー法で求めると □ ℃`, a: M$(T), key: `08|${a}|${b}|${T0}|${h}`,
            easy: `差 $${d}$ に $${fmt(f)}$ を${n}回：$${c.map(fmt).join('\\to')}$。$${b}${fmt(c[n])}=${fmt(T)}$`, easyCheck: false,
            verify: p => valIs(p.a, euler(rule1(p.q), T0, h, n)),
          };
        }
        const E = r.pick([5, 6, 8, 10, 12]), RC = r.pick([1, 2, 4, 5]), h = r.pick([0.25, 0.5, 1]), f = +fmt(1 - h / RC), n = 2;
        if (!(f >= 0.5 && f <= 0.9) || (E === 10 && f === 0.75)) return null;   // 左ページの例（残り10に0.75を2回）と同じ計算はよける
        const rule = k === 0 ? (RC === 1 ? `${E}-V` : `\\frac{${E}-V}{${RC}}`) : (RC === 1 ? '-V' : `-\\frac{V}{${RC}}`);
        const V0 = k === 0 ? 0 : E, Vn = k === 0 ? E - E * f ** n : E * f ** n;
        if (decs(Vn) > 4) return null;
        return {
          q: k === 0
            ? `電池 ${U(E, 'V')} でコンデンサーを充電するルール $${DT('V')}=${rule}$（$t$ は秒）で、はじめ $V=0$ です。$\\Delta t=${fmt(h)}$ 秒のオイラー法で、${fmt(n * h)}秒後の電圧 □ V`
            : `${U(E, 'V')} にためたコンデンサーを放電させるルール $${DT('V')}=${rule}$（$t$ は秒）で、$\\Delta t=${fmt(h)}$ 秒のオイラー法を使うと、${fmt(n * h)}秒後の電圧 □ V`,
          a: M$(Vn), key: `08V|${k}|${E}|${RC}|${h}`,
          easy: k === 0 ? `残り $${E}-V$ に $1-\\frac{${fmt(h)}}{${RC}}=${fmt(f)}$ を2回：$${chain(E, f, n).map(fmt).join('\\to')}$。$${E}-${fmt(E * f ** n)}=${fmt(Vn)}$` : `電圧に $1-\\frac{${fmt(h)}}{${RC}}=${fmt(f)}$ を2回：$${chain(E, f, n).map(fmt).join('\\to')}$`, easyCheck: false,
          verify: p => valIs(p.a, euler(rule1(p.q), V0, h, n)),
        };
      },
      // 表の続き・10歩（倍率の10乗を文に）
      s3(r) {
        const g = pick08(r, false); if (!g) return null;
        const { a, h, f, b, d, T0 } = g;
        if (turn(r, '08s3', 2)) {
          const c = chain(d, f, 3).map(u => +fmt(b + u)), sp = c.map(T => +fmt(-a * (T - b)));
          if (c.some(T => decs(T) > 3)) return null;
          return {
            q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）を、$\\Delta t=${fmt(h)}$ 分のオイラー法で進めた表です。（ア）に入る温度 □ ℃`, a: M$(c[3]), key: `08|${a}|${b}|${T0}|${h}`,
            table: { head: ['$t$〔分〕', '0', fmt(h), fmt(2 * h), fmt(3 * h)], rows: [['$T$〔℃〕', ...c.slice(0, 3).map(fmt), '（ア）'], ['変わる速さ', ...sp.slice(0, 3).map(M$), '']] },
            easy: `差 $${fmt(c[2] - b)}$ に $${fmt(f)}$ をかけて $${fmt(c[3] - b)}$、$${b}$ をたす`, easyCheck: false,
            verify: p => valIs(p.a, euler(rule1(p.q), T0, h, 3)),
          };
        }
        const PW = { 0.9: 0.3487, 0.95: 0.5987, 0.8: 0.1074, 0.98: 0.8171, 0.96: 0.6648, 0.92: 0.4344, 0.75: 0.0563 };
        const pw = PW[f], gg = gv(b + d * pw, b + d * f ** 10, 1);
        if (!gg) return null;
        return {
          q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）、はじめ${T0}℃のお湯を $\\Delta t=${fmt(h)}$ 分のオイラー法で進めると、${fmt(10 * h)}分後は約 □ ℃（$${fmt(f)}^{10}=${pw}$、小数第1位まで）`, a: `$${gg.ans}$`, key: `08|${a}|${b}|${T0}|${h}`,
          easy: `10歩で差は $${fmt(f)}^{10}$ 倍：$${d}\\times${pw}=${fmt(d * pw)}$、$${b}+${fmt(d * pw)}\\approx${gg.ans}$`, easyCheck: false,
          verify: p => valIs(p.a, +rd(euler(rule1(p.q), T0, h, 10), 1)),
        };
      },
      // わな：右辺に v^2（差の倍率で進められない。6-94）
      trap(r) {
        const c = r.pick([0.002, 0.004, 0.005, 0.01]), h = r.pick([1, 0.5]), v1 = 9.8 * h, v2 = v1 + (9.8 - c * v1 * v1) * h, x10 = v2 * 10;
        if (Math.abs(x10 - Math.floor(x10) - 0.5) < 0.02) return null;
        return dest({ q: `雨つぶのルール $${DT('v')}=9.8-${fmt(c)}v^2$（$t$ は秒）、はじめ $v=0$。$\\Delta t=${fmt(h)}$ 秒のオイラー法で${fmt(2 * h)}秒後の速さは約 □ m/s（小数第1位まで）`, a: `$${rd(v2, 1)}$`, key: `08t|${c}|${h}`,
          verify: p => valIs(p.a, +rd(euler(rule1(p.q), 0, h, 2), 1)) },
        '6-08', '右辺が「差の何倍」の形でない（$v^2$ がある）ので、差に倍率をかけて進められない。1歩ずつ、右辺から速さの変わる速さを出して進める', ['6-94']);
      },
    },
  });

  // ================================================================ 6-09
  const cellOf = s => s.replace(/^=/, '');                                   // 表計算の式の = を取る
  // 表計算の式を、B2 などに値を入れて計算する（* → ×、/ → ÷）
  function cellVal(f, vals) {
    let s = cellOf(String(f).replace(/`/g, ''));
    for (const [c, v] of Object.entries(vals)) s = s.split(c).join(`(${v})`);
    s = s.replace(/\$/g, '').replace(/\*/g, '\\times ').replace(/\//g, '\\div ');
    return ev(s);
  }
  const C2of = (a, b) => (b === 0 ? `=-${a === 1 ? '' : fmt(a) + '*'}B2` : `=-${a === 1 ? '' : fmt(a) + '*'}(B2-${fmt(b)})`);
  const DTCELL = ['D2', 'E1', 'F1', 'E2', 'F2'];
  const absCell = c => `$${c[0]}$${c[1]}`;                                    // D2 → $D$2
  M.add({
    id: '6-09', part: 1, chap: '6-2④ 例題3', stars: 1,
    title: '表計算の式：変わるのは C2（ルールの右辺）だけ。B3 `=B2+C2*$D$2` はいつも同じ',
    mark: '「A列 $t$、B列 $T$、C列 変わる速さ、D2 に $\\Delta t$」の表と、入れる式。',
    futsu: ['表のしくみを1行ずつ考え、', '3つのセルの式を', '毎回はじめから組み立てる。'],
    raku: ['$-0.08\\,(T-25)$ なら', 'C2 `=-0.08*(B2-25)`（$T$ を B2 に）', 'B3 `=B2+C2*$D$2`、A3 `=A2+$D$2`（いつも同じ）', '`$` がないと、下へコピーしたとき空のセルを指す'],
    why: 'オイラー法の1行は「次の値＝今の値＋今の速さ×$\\Delta t$」（6-2④）。今の値は1つ上の行の B、今の速さは C、$\\Delta t$ は1つのセル。ルールが変わっても変わるのは C 列の式だけで、B 列と A 列の式は同じ。$\\Delta t$ のセルに `$` をつけると、コピーしても同じセルを指したままになる。',
    caution: 'C2 では、ルールの $T$ を B2 に置きかえる（かけ算の記号 * を忘れない）。`$` をつけないと、1行下では $\\Delta t$ のかわりに空のセル（0）を使ってしまい、値が変わらない表になる。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '36mm', s3: '40mm', trap: '16mm' }, boxh: { s3: '12mm' },
    fits(q) { return (/C2|B3|A3|B4|B5/.test(q) || /`=/.test(q)) && /式 □|ルール □/.test(q) && !/の値 □/.test(q); },
    steps: {
      // C2 の式（-a(T-b) の形）
      s1(r) {
        const a = r.pick([0.02, 0.03, 0.04, 0.05, 0.06, 0.08, 0.1, 0.2, 0.3, 0.5]), b = r.pick([5, 10, 15, 18, 20, 22, 25, 30]), v = r.pick(['T', 'T', 'y']);
        if (a === 0.08 && b === 25) return null;
        const A = C2of(a, b);
        return {
          q: `ルール $${ruleN(v, a, b)}$ を、A列 $t$、B列 $${v}$、C列 変わる速さ、D2 に $\\Delta t$ の表計算で解きます。C2 に入れる式 □`, a: CODE(A), key: `09|${a}|${b}`,
          easy: `右辺の $${v}$ を、今の値の B2 に置きかえる`, easyCheck: false,
          verify: p => { const R = rule1(p.q); return [3, 41].every(y => close(cellVal(p.a, { B2: y }), rhsAt(R, y))) || `式 ${p.a} がちがう`; },
        };
      },
      // ほかの形のルールの C2・B3・A3（Δt のセルを変えて）
      s2(r) {
        const k = turn(r, '09s2', 3);
        if (k === 0) {
          const E = r.pick([5, 6, 9, 10, 12]), RC = r.pick([2, 3, 4, 5]), dis = r.chance(0.4);
          const rule = dis ? `-\\frac{V}{${RC}}` : `\\frac{${E}-V}{${RC}}`, A = dis ? `=-B2/${RC}` : `=(${E}-B2)/${RC}`;
          return {
            q: `ルール $${DT('V')}=${rule}$ を、A列 $t$、B列 $V$、C列 変わる速さ、D2 に $\\Delta t$ の表計算で解きます。C2 に入れる式 □`, a: CODE(A), key: `09V|${dis}|${E}|${RC}`,
            easy: `$V$ を B2 に。分数の線は / で、分子はかっこでかこむ`, easyCheck: false,
            verify: p => { const R = rule1(p.q); return [1.5, 7].every(y => close(cellVal(p.a, { B2: y }), rhsAt(R, y))) || `式 ${p.a} がちがう`; },
          };
        }
        const cell = r.pick(DTCELL), a = r.pick([0.05, 0.1, 0.2]), b = r.pick([15, 20, 25]);
        const A = k === 1 ? `=B2+C2*${absCell(cell)}` : `=A2+${absCell(cell)}`;
        return {
          q: `ルール $${ruleN('T', a, b)}$ を、A列 $t$、B列 $T$、C列 変わる速さ、${cell} に $\\Delta t$ の表計算で解きます。下へコピーする ${k === 1 ? 'B3' : 'A3'} の式 □`, a: CODE(A), key: `09c|${k}|${cell}`,
          easy: k === 1 ? `今の値 B2＋今の速さ C2×$\\Delta t$。$\\Delta t$ の ${cell} に \`$\`` : `時刻を $\\Delta t$ だけ進める。${cell} に \`$\``, easyCheck: false,
          // 別の道すじ：式を下へコピーした4行めでも、Δt のセルを指したままか
          verify: p => { const f = cellOf(p.a.replace(/`/g, '')), sh = f.replace(/([A-F])(\d)/g, (m0, c, n) => c + (+n + 1)).replace(/\$([A-F])\$(\d)/g, '$$$1$$$2'); return (new RegExp(`\\$${cell[0]}\\$${cell[1]}`).test(f) && (k === 1 ? /^B2\+C2\*/.test(f) : /^A2\+/.test(f)) && sh !== f) || `式 ${p.a} がちがう`; },
        };
      },
      // 表を見て：\$ がない式をコピー・\$ のある式をコピー・C2 の式からルール
      s3(r) {
        const k = turn(r, '09s3', 2) ? r.pick([0, 1]) : 2, a = r.pick([0.05, 0.1, 0.2, 0.25]), b = r.pick([15, 20, 25]), T0 = r.pick([60, 70, 80, 90]), h = r.pick([0.5, 1, 2]);
        const C2 = C2of(a, b);
        if (k === 2) {
          const aa = r.pick([0.3, 0.4, 0.5, 0.15]), bb = r.pick([2, 3, 4, 5, 6]);
          return {
            q: `ある表計算で、A列が $t$、B列が $y$、D2 が $\\Delta t$ で、C2 に ${CODE(C2of(aa, bb))}、B3 に ${CODE('=B2+C2*$D$2')} が入っています。この表で解いているルール □`, a: `$${ruleN('y', aa, bb)}$`, key: `09r|${aa}|${bb}`,
            easy: 'C2 の B2 を $y$ にもどすと、右辺になる', easyCheck: false,
            verify: p => { const R = rule1(p.a + '$'); return (R && [1, 9].every(y => close(rhsAt(R, y), cellVal(C2of(aa, bb), { B2: y })))) || `ルール ${p.a} がちがう`; },
          };
        }
        const nodollar = k === 0, B3 = nodollar ? '=B2+C2*D2' : '=B2+C2*$D$2', row = nodollar ? 4 : r.pick([4, 5, 6]);
        const A = nodollar ? '=B3+C3*D3' : `=B${row - 1}+C${row - 1}*$D$2`;
        return {
          q: `下の表で、B3 に ${CODE(B3)} を入れて、C2 と B3 を下へコピーしました。B${row} に入る式 □`, a: CODE(A), key: `09s|${nodollar}|${row}|${a}|${b}`,
          table: { head: ['', 'A', 'B', 'C', 'D'], rows: [['1', '$t$', '$T$', '変わる速さ', '$\\Delta t$'], ['2', '0', String(T0), CODE(C2), fmt(h)], ['3', CODE('=A2+$D$2'), CODE(B3), '', '']] },
          easy: nodollar ? '`$` がないので、1行下へ行くと D2 も D3 にずれる（D3 は空なので $\\Delta t$ が0になり、温度が変わらない）' : '`$` のついた `$D$2` はそのまま、ほかは1行上を指す', easyCheck: false,
          // 別の道すじ：コピーで行番号を1ずつずらし、\$ のついたセルだけ動かさない
          verify: p => { let f = B3; for (let n = 3; n < row; n++) f = f.replace(/(\$?)([A-F])(\$?)(\d+)/g, (m0, d1, c, d2, num) => d2 ? m0 : d1 + c + d2 + (+num + 1)); return p.a === CODE(f) || `式 ${p.a} がちがう（${f}）`; },
        };
      },
      // わな：式ではなく値（6-08）
      trap(r) {
        const a = r.pick([0.05, 0.1, 0.2]), h = r.pick([0.5, 1, 2]), b = r.pick([15, 20, 25]), T0 = r.pick([55, 65, 75, 85]), f = 1 - a * h, T2 = b + (T0 - b) * f * f;
        if (f <= 0.5 || decs(T2) > 3 || (a === 0.1 && h === 0.5 && b === 20 && T0 === 60)) return null;
        return dest({ q: `表計算で、B2 に ${T0}、C2 に ${CODE(C2of(a, b))}、D2 に ${fmt(h)}、B3 に ${CODE('=B2+C2*$D$2')} を入れて、下へコピーしました。B4 の値 □`, a: M$(T2), key: `09t|${a}|${h}|${b}|${T0}`,
          verify: p => { let B = T0; for (let n = 0; n < 2; n++) B = cellVal('=B2+C2*D2', { C2: cellVal(C2of(a, b), { B2: B }), B2: B, D2: h }); return valIs(p.a, B); } },
        '6-09', `聞いているのは式ではなく値。ルール $${ruleN('T', a, b)}$、$\\Delta t=${fmt(h)}$ のオイラー法の2歩め`, ['6-08']);
      },
    },
  });

  // ================================================================ 6-10
  // a・Δt=h で ah>1。左ページの例（-0.05(T-20)・80℃、Δt=30 → 倍率 -0.5、Δt=60 → 倍率 -2）と同じ ah（1.5・3）と、同じルールはよける（倍率は部屋の温度によらない。第40回 S-1）
  function pick10(r) {
    for (let k = 0; k < 60; k++) {
      const a = r.pick([0.05, 0.1, 0.2, 0.25, 0.5]), ah = r.pick([1.2, 1.4, 1.6, 1.8, 2, 2.4, 2.5]), h = +fmt(ah / a), f = +fmt(1 - ah);
      if (!Number.isInteger(h) || h > 60) continue;
      const b = r.pick([15, 20, 25]), d = r.pick([20, 30, 40, 50, 60]);
      if (a === 0.05 && b === 20) continue;
      return { a, h, f, b, d, T0: b + d };
    }
    return null;
  }
  M.add({
    id: '6-10', part: 1, chap: '6-2⑥ 例題7', stars: 1,
    title: '$\\Delta t$ が大きすぎると：差の倍率 $1-a\\Delta t$ が負ならふらふら、$-1$ 未満でこわれる',
    mark: '$\\Delta t$ が「ようすが変わる時間」（$\\frac{1}{a}$）より大きいオイラー法。',
    futsu: ['オイラー法の1行を、', '1歩ずつ計算して、', '表のようすを見て判断する。'],
    raku: ['$-0.05\\,(T-20)$、80℃、$\\Delta t=30$', '→ 倍率 $1-1.5=-0.5$ → 差 $60\\to-30\\to15$', '→ $-10$℃、35℃（ふらふら）', '$\\Delta t=60$ → 倍率 $-2$ → $-100$℃、260℃（こわれる）'],
    why: '差 $u=T-b$ は1歩ごとに $1-a\\Delta t$ 倍になる（6-2⑥）。$a\\Delta t>1$ だと倍率が負で、差の符号が毎回入れかわり、部屋の温度の上と下を行き来する。倍率が $-1$ より小さい（$a\\Delta t>2$）と、差がどんどん大きくなって計算がこわれる。ふらふらしないのは $\\Delta t\\leqq\\frac{1}{a}$。',
    caution: 'お湯が部屋より冷たくなるなど、ありえない値が出たら、$\\Delta t$ が大きすぎる。倍率は $1-a\\Delta t$（$a\\Delta t$ ではない）。',
    counts: { s1: 3, s2: 2, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      if (!isOneRule(q) || !/オイラー法/.test(q) || /式 □|C2|B3|ずれ|ばね|半径/.test(q)) return false;
      if (/ふらふら|こわれ|倍率|何倍/.test(q)) return true;
      const ab = rateAB(rule1(q)), h = dtOf(q);
      return !!ab && h != null && ab.a * h > 1;
    },
    steps: {
      // 差の倍率（同じ見開きで同じ倍率をくり返さない）
      s1(r) {
        const used = r.f10 || (r.f10 = new Set());
        if (used.size >= 4) used.clear();   // アプリで何問も作るときは、ひとまわりしたら、また使う
        let g = null;
        for (let k = 0; k < 30; k++) { g = pick10(r); if (g && !used.has(g.f)) break; }
        if (!g || used.has(g.f)) return null;
        used.add(g.f);
        const { a, h, f, b, T0 } = g;
        return {
          q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）を、$\\Delta t=${fmt(h)}$ 分のオイラー法で計算します。部屋との差は、1歩ごとに □ 倍`, a: M$(f), key: `10|${a}|${h}|${b}`,
          easy: `$1-${fmt(a)}\\times${fmt(h)}=${fmt(f)}$`, easyCheck: false,
          verify: p => { const R = rule1(p.q), T1 = euler(R, T0, h, 1); return valIs(p.a, (T1 - b) / (T0 - b)); },
        };
      },
      // 1歩め・2歩めの温度
      s2(r) {
        const g = pick10(r); if (!g) return null;
        const { a, h, f, b, d, T0 } = g, n = r.pick([1, 2]), T = b + d * f ** n;
        if (decs(T) > 2 || f < -2) return null;
        return {
          q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）、はじめ${T0}℃のお湯を、$\\Delta t=${fmt(h)}$ 分のオイラー法で計算します。${fmt(n * h)}分後の温度 □ ℃`, a: M$(T), key: `10|${a}|${h}|${b}`,
          easy: `倍率 $1-${fmt(a)}\\times${fmt(h)}=${fmt(f)}$。差 $${chain(d, f, n).map(fmt).join('\\to')}$。$${b}+${par(+fmt(d * f ** n))}=${fmt(T)}$${f < 0 ? '（部屋の温度の上と下を行き来する）' : ''}`, easyCheck: false,
          verify: p => valIs(p.a, euler(rule1(p.q), T0, h, n)),
        };
      },
      // ふらふらしない・こわれない Δt、充電で大きすぎる Δt
      s3(r) {
        const k = turn(r, '10s3', 3);
        if (k === 2) {
          const E = r.pick([5, 6, 10, 12]), RC = r.pick([1, 2, 4]), h = RC * r.pick([1.4, 2.4, 2.5]), f = 1 - h / RC, n = r.pick([1, 2]), V = E - E * f ** n;
          if (decs(V) > 2 || decs(h) > 1) return null;
          return {
            q: `電池 ${U(E, 'V')} の充電のルール $${DT('V')}=${RC === 1 ? `${E}-V` : `\\frac{${E}-V}{${RC}}`}$（$t$ は秒）で、はじめ $V=0$ です。$\\Delta t=${fmt(h)}$ 秒のオイラー法で、${fmt(n * h)}秒後の電圧 □ V`, a: M$(V), key: `10V|${E}|${RC}|${h}`,
            easy: `残り $${E}-V$ の倍率は $1-\\frac{${fmt(h)}}{${RC}}=${fmt(f)}$。残り $${chain(E, f, n).map(fmt).join('\\to')}$ で、電池の電圧をこえてしまう`, easyCheck: false,
            verify: p => valIs(p.a, euler(rule1(p.q), 0, h, n)),
          };
        }
        const a = r.pick([0.02, 0.04, 0.05, 0.1, 0.2, 0.25, 0.5]), b = r.pick([15, 20, 25]), lim = k === 0 ? 1 / a : 2 / a;
        if (a === 0.05 && b === 20) return null;
        return {
          q: `$${ruleN('T', a, b)}$（$T$ は℃、$t$ は分）をオイラー法で計算します。${k === 0 ? 'ふらふらしない（差の倍率が0以上になる）のは、$\\Delta t$ が □ 分以下のとき' : '計算がこわれない（差の倍率が $-1$ より大きい）のは、$\\Delta t$ が □ 分より小さいとき'}`, a: M$(lim), key: `10l|${k}|${a}|${b}`,
          easy: k === 0 ? `$1-${fmt(a)}\\Delta t\\geqq0$ より $\\Delta t\\leqq${fmt(lim)}$` : `$1-${fmt(a)}\\Delta t>-1$ より $\\Delta t<${fmt(lim)}$`, easyCheck: false,
          verify: p => { const R = rule1(p.q), L = numOf(p.a), fac = h => (euler(R, b + 10, h, 1) - b) / 10; return (k === 0 ? close(fac(L), 0) && fac(L * 1.01) < 0 : close(fac(L), -1) && fac(L * 0.99) > -1) || `答え ${p.a} がちがう`; },
        };
      },
      // わな：Δt を半分にしたときのずれ（6-92）
      trap(r) {
        const e = r.pick([0.96, 0.52, 0.74, 1.12, 0.86, 0.48]), n = r.pick([2, 4]), h = r.pick([2, 1]);
        return dest({ q: `お湯の温度を $\\Delta t=${h}$ 分のオイラー法で計算すると、10分後の温度のずれ（ほんとうの値との差）が${fmt(e)}℃でした。$\\Delta t=${fmt(h / n)}$ 分にすると、ずれは約 □ ℃`, a: M$(+fmt(e / n)), key: `10t|${e}|${n}|${h}`,
          verify: p => valIs(p.a, e * (h / n) / h) },
        '6-10', `$\\Delta t$ が大きすぎる話ではなく、$\\Delta t$ を $\\frac{1}{${n}}$ にしたときのずれ。オイラー法のずれは $\\Delta t$ にほぼ比例する`, ['6-92']);
      },
    },
  });

  // ================================================================ 6-11
  // 速度を先に進めるオイラー法：[x, v] から1歩（a は加速度の式）
  const step11 = (acc, x, v, h) => { const a = acc(x, v), v1 = v + a * h; return [x + v1 * h, v1, a]; };
  // 左ページの例（-16x、0.1、0.05）と同じ KΔt²=0.04 の組はよける（位置は x0 の何倍かになり、答えが例の何倍かになる。第40回 S-1・S-2）
  function pick11(r) {
    for (let k = 0; k < 40; k++) {
      const K = r.pick([4, 9, 16, 25, 100]), x0 = r.pick([0.04, 0.05, 0.08, 0.1, 0.2]), h = r.pick([0.02, 0.05, 0.1]);
      if (Math.abs(K * h * h - 0.04) < 1e-12) continue;
      if (K * h * h > 0.3) continue;
      return { K, x0, h };
    }
    return null;
  }
  M.add({
    id: '6-11', part: 1, chap: '6-2⑨⑪ 例題5・6-7③・6-14④', stars: 1,
    title: '2回微分の式は「加速度 → 新しい速度 → 新しい位置」（位置は新しい速度で進める）',
    mark: 'ばねの $m$・$k$（ダンパーの $c$）と「速度を先に進めるオイラー法」。',
    futsu: ['位置と速度を、それぞれ', '「今の値」の速さで別々に進める', '（ふつうのオイラー法。', 'ゆれがだんだんふくらむ）。'],
    raku: ['$a=-16x$、$x=0.1$、$v=0$、$\\Delta t=0.05$', '→ $a=-1.6$、$v=-0.08$、$x=0.096$', '→ $a=-1.536$、$v=-0.1568$、$x=0.08816$', '（新しい $v$ で $x$ を進める）'],
    why: '2回微分の式は、$\\frac{\\dd x}{\\dd t}=v$、$\\frac{\\dd v}{\\dd t}=a$ の2つの1回微分の式に分けて進める（6-2⑨）。先に速度を新しくして、その新しい速度で位置を進めると、ゆれがふくらまない（6-2⑪）。ダンパーがあれば、力は $-kx-cv$ なので、加速度は $\\frac{-kx-cv}{m}$（6-7③）。',
    caution: '位置を進めるのは「新しい」速度（古い速度で進めると、ふつうのオイラー法になって、ゆれがふくらむ）。加速度は今の位置（と速度）から出す。ダンパーの力は速度と反対向きなので $-cv$。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '20mm', s3: '20mm', trap: '16mm' },
    fits(q) { return (/速度を先に進める|1回微分の式2つ/.test(q) || (/オイラー/.test(q) && /ばね|おもり|加速度/.test(q))) && !/半径|何倍|ふくら|ふつうのオイラー/.test(q); },
    steps: {
      // 1歩：速度か位置
      s1(r) {
        const g = pick11(r); if (!g) return null;
        const { K, x0, h } = g, [x1, v1] = step11(x => -K * x, x0, 0, h), askX = turn(r, '11s1', 2);
        if (decs(x1) > 6) return null;
        return {
          q: `加速度が $a=-${K}x$ のばねで、はじめ $x=${fmt(x0)}$、$v=0$ です。速度を先に進めるオイラー法（$\\Delta t=${fmt(h)}$）で、${fmt(h)}秒後の${askX ? '位置 □ m' : '速度 □ m/s'}`, a: M$(askX ? x1 : v1), key: `11|${K}|${x0}|${h}|${askX}`,
          easy: `$a=-${K}\\times${fmt(x0)}=${fmt(-K * x0)}$、$v=0+${par(-K * x0)}\\times${fmt(h)}=${fmt(v1)}$${askX ? `、$x=${fmt(x0)}+${par(v1)}\\times${fmt(h)}=${fmt(x1)}$` : ''}`, easyCheck: false,
          // 別の道すじ：x''=-Kx を v'=-Kx、x'=v の2つに分けて、1歩ずつ（新しい v で x）
          verify: p => { let x = x0, v = 0; v += -K * x * h; x += v * h; return valIs(p.a, askX ? x : v); },
        };
      },
      // 2歩・ダンパーつき
      s2(r) {
        if (turn(r, '11s2', 2)) {
          const g = pick11(r); if (!g) return null;
          const { K, x0, h } = g;
          const [x1, v1] = step11(x => -K * x, x0, 0, h), [x2] = step11(x => -K * x, x1, v1, h);
          if (decs(x2) > 5) return null;
          return {
            q: `加速度が $a=-${K}x$ のばねで、はじめ $x=${fmt(x0)}$、$v=0$ です。速度を先に進めるオイラー法（$\\Delta t=${fmt(h)}$）で、${fmt(2 * h)}秒後の位置 □ m`, a: M$(x2), key: `11|${K}|${x0}|${h}|2`,
            easy: `1歩め $v=${fmt(v1)}$、$x=${fmt(x1)}$。2歩め $a=${fmt(-K * x1)}$、$v=${fmt(v1 - K * x1 * h)}$、$x=${fmt(x2)}$`, easyCheck: false,
            verify: p => { let x = x0, v = 0; for (let n = 0; n < 2; n++) { v += -K * x * h; x += v * h; } return valIs(p.a, x); },
          };
        }
        const m = r.pick([0.5, 1, 2]), k = r.pick([2, 4, 8, 10, 20]), c = r.pick([0.2, 0.4, 0.5, 1, 2]), x0 = r.pick([0.1, 0.2, -0.1]), v0 = r.pick([0.2, -0.2, 0.5, -0.4]), h = 0.1;
        const acc = (x, v) => (-k * x - c * v) / m, [x1, v1, a0] = step11(acc, x0, v0, h), askX = r.chance(0.5);
        if (decs(a0) > 3 || decs(x1) > 5 || Math.abs(a0) < 1e-9) return null;
        return {
          q: `質量 ${U(m, 'kg')}、ばね定数 ${U(k, 'N/m')}、ダンパーの減衰係数 $${fmt(c)}\\,\\mathrm{N\\cdot s/m}$ の台車が、はじめ $x=${fmt(x0)}\\,\\mathrm{m}$、速度 $v=${fmt(v0)}\\,\\mathrm{m/s}$ です。速度を先に進めるオイラー法で、$\\Delta t=0.1$ として、0.1秒後の${askX ? '位置 □ m' : '速度 □ m/s'}`, a: M$(askX ? x1 : v1), key: `11d|${m}|${k}|${c}|${x0}|${v0}`,
          easy: `$a=\\frac{-${k}\\times${par(x0)}-${fmt(c)}\\times${par(v0)}}{${fmt(m)}}=${fmt(a0)}$、$v=${fmt(v0)}+${par(a0)}\\times0.1=${fmt(v1)}$${askX ? `、$x=${fmt(x0)}+${par(v1)}\\times0.1=${fmt(x1)}$` : ''}`, easyCheck: false,
          verify: p => { const F = -k * x0 - c * v0, v = v0 + F / m * h, x = x0 + v * h; return valIs(p.a, askX ? x : v); },
        };
      },
      // 表の続き・1回微分の式2つに書きかえる
      s3(r) {
        const g = pick11(r); if (!g) return null;
        const { K, x0, h } = g;
        if (turn(r, '11s3', 2)) {
          if (K === 16) return null;   // 左ページの例の $a=-16x$
          return {
            q: `微分方程式 $${D2('x')}=-${K}x$ を、1回微分の式2つにすると、$${DT('x')}=v$、$${DT('v')}=□$`, a: `$-${K}x$`, key: `11|${K}|w`,
            easy: '位置の変わる速さは速度、速度の変わる速さは加速度', easyCheck: false,
            verify: p => valIs(p.a.replace(/x/, ''), -K) === true || close(ev(strip(p.a), { x: 1 }), -K) || `答え ${p.a} がちがう`,
          };
        }
        const s1 = step11(x => -K * x, x0, 0, h), s2 = step11(x => -K * x, s1[0], s1[1], h);
        if (decs(s2[0]) > 5) return null;
        return {
          q: `加速度が $a=-${K}x$ のばねを、速度を先に進めるオイラー法（$\\Delta t=${fmt(h)}$）で進めた表です。（ア）に入る位置 □ m`, a: M$(s2[0]), key: `11|${K}|${x0}|${h}|2`,
          table: { head: ['$t$〔s〕', '$x$〔m〕', '$v$〔m/s〕', '$a$〔m/s$^2$〕'], rows: [['0', fmt(x0), '0', M$(-K * x0)], [fmt(h), fmt(s1[0]), M$(s1[1]), M$(+fmt(-K * s1[0]))], [fmt(2 * h), '（ア）', '', '']] },
          easy: `$v=${fmt(s1[1])}+${par(+fmt(-K * s1[0]))}\\times${fmt(h)}=${fmt(s2[1])}$、新しい $v$ で $x=${fmt(s1[0])}+${par(s2[1])}\\times${fmt(h)}=${fmt(s2[0])}$`, easyCheck: false,
          verify: p => { let x = x0, v = 0; for (let n = 0; n < 2; n++) { v += -K * x * h; x += v * h; } return valIs(p.a, x); },
        };
      },
      // わな：1回微分の式（6-08）
      trap(r) {
        const a = r.pick([0.05, 0.1, 0.2]), b = r.pick([15, 20, 25]), T0 = r.pick([55, 65, 75, 85]), h = r.pick([1, 2]), T1 = b + (T0 - b) * (1 - a * h);
        return dest({ q: `お湯の温度のルール $${ruleN('T', a, b)}$（$t$ は分）で、はじめ${T0}℃です。$\\Delta t=${h}$ 分のオイラー法で、${h}分後の温度 □ ℃`, a: M$(+fmt(T1)), key: `11t|${a}|${b}|${T0}|${h}`,
          verify: p => valIs(p.a, euler(rule1(p.q), T0, h, 1)) },
        '6-11', '1回微分の式なので、位置と速度の2つの列はいらない。差に倍率 $1-a\\Delta t$ をかける', ['6-08']);
      },
    },
  });

  // ================================================================ 6-12
  // 積分するだけで解けるルール（YES）と、解けないルール（NO）。左ページの例（3t^2、-12、-2y、(6-V)/3）は入れない
  const YES12 = [`${DT('y')}=4t-1`, `${DT('T')}=0.5`, `${DT('h')}=2-0.1t`, `${DT('V')}=10-0.5t`, `${DT('v')}=-9.8`, `${DT('V')}=5`, `${DT('y')}=6t^2+1`, `${DT('x')}=3t^2-2t`,
    `${DT('T')}=-2`, `${DT('x')}=8-2t`, `${DT('q')}=0.2`, `${DT('V')}=6t`, `${DT('h')}=-0.4`, `${DT('y')}=5-4t^2`];
  const NO12 = [`${DT('N')}=0.3N`, `${DT('T')}=-0.1\\,(T-25)`, `${DT('q')}=-\\frac{q}{5}`, `${DT('v')}=9.8-0.2v`, `${DT('V')}=\\frac{10-V}{2}`, `${DT('y')}=y^2`, `${DT('y')}=2y+1`, `${DT('h')}=-0.5h`,
    `${DT('T')}=0.2\\,(30-T)`, `${DT('N')}=-0.05N`, `${DT('V')}=-V`, `${DT('y')}=3y-t`, `${DT('x')}=x+2`, `${DT('q')}=-4q`];
  const YES12b = [`${DT('q')}=0.5e^{-t/2}`, `${D2('x')}=9.8`, `${D2('T', 'x')}=0`, `${DT('x')}=3\\cos2t`, `${D2('y', 'x')}=0.004`, `${DT('p', 'z')}=-11760`, `${DT('T', 'x')}=-40`, `${DT('N')}=100e^{0.1t}`];
  const NO12b = [`${DT('T', 'x')}=-T`, `${D2('x')}=-16x`, `${DT('h')}=-0.02\\sqrt h`, `${DT('y')}=ty`, `${DT('y')}=t+y`, `${D2('y', 'x')}=-4y`, `${DT('p', 'z')}=-0.0001p`, `${DT('v')}=9.8-0.004v^2`];
  // 別の道すじ：左辺で微分されている量（主役）の文字が、右辺の文字に入っているか
  function only12(t) {
    const m = /\\frac\{\\dd(?:\^2)? ?([A-Za-z])\}/.exec(t), rhs = t.slice(t.indexOf('=') + 1);
    return !M.mathVars(rhs, { econst: true }).includes(m[1]);
  }
  // 検算用（only12 とは別の読み方）：右辺から \命令 を消し、主役の文字が1字でも残っているか
  const noMain12 = t => { const v = /\\frac\{\\dd(?:\^2)? ?([A-Za-z])\}/.exec(t)[1]; return !t.slice(t.indexOf('=') + 1).replace(/\\[a-zA-Z]+/g, ' ').includes(v); };
  const list12 = ts => ts.map((t, i) => `（${i + 1}）$${t}$`).join('　');
  // 同じ見開きで同じルールをくり返さない（第40回 R1-18）：池 pool から、まだ使っていないものを n こ。足りなければ（アプリで何問も作るとき）その池をひとまわりさせる
  function take12(r, pool, n) {
    const u = r.u12 || (r.u12 = new Set());
    let c = r.shuffle(pool).filter(t => !u.has(t));
    if (c.length < n) { pool.forEach(t => u.delete(t)); c = r.shuffle(pool); }
    c = c.slice(0, n); c.forEach(t => u.add(t));
    return c;
  }
  const ans12 = ts => ts.map((t, i) => (only12(t) ? `（${i + 1}）` : null)).filter(Boolean).join('・');
  M.add({
    id: '6-12', part: 1, chap: '6-3① 例題1', stars: 1,
    title: '右辺に主役の量（左辺で微分されている量）がなければ、積分するだけで解ける',
    mark: 'いくつかのルールと「積分するだけで解けるもの」。',
    futsu: ['1つずつ積分してみて、', '右辺の中に、まだわからない', '関数が残ってしまわないか', 'ためしてみる。'],
    raku: ['$\\frac{\\dd y}{\\dd t}=3t^2$、$\\frac{\\dd p}{\\dd z}=-12$ → 積分するだけ', '$\\frac{\\dd y}{\\dd t}=-2y$、$\\frac{\\dd V}{\\dd t}=\\frac{6-V}{3}$', '→ 右辺に主役 → 表計算（6-08）か第2部'],
    why: '$\\frac{\\dd y}{\\dd t}=f(t)$ は「$y$ を微分すると $f(t)$」なので、$y$ は $f(t)$ の原始関数で、$y=\\int f(t)\\,\\dd t+C$（6-3①）。右辺に $y$ があると、まだわからない関数のグラフの面積を求めることになり、積分だけでは解けない。左辺の分母の文字（$t$・$x$・$z$）は何でもよい。',
    caution: '見るのは右辺に「左辺で微分されている量」があるかどうか。右辺に $t$ や $x$（変数）があっても積分できる。2回微分の式も、右辺に主役がなければ2回積分するだけ。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '30mm', s3: '30mm', trap: '34mm' }, boxh: { trap: '12mm' },
    fits(q) { return /積分するだけで解ける/.test(q); },
    steps: {
      // 1つのルール
      s1(r) {
        const t = take12(r, r.chance(0.5) ? YES12 : NO12, 1)[0], A = only12(t) ? '解ける' : '解けない';
        return {
          q: `ルール $${t}$ は、積分するだけで解ける形か □`, a: A, key: `12|${t}`,
          easy: only12(t) ? '右辺に、左辺で微分されている量がない' : '右辺に、左辺で微分されている量がある', easyCheck: false,
          verify: p => p.a === (only12(t) ? '解ける' : '解けない') || `答え ${p.a} がちがう`,
        };
      },
      // 4つから選ぶ
      s2(r) {
        const ny = r.int(1, 3), ts = r.shuffle(take12(r, YES12, ny).concat(take12(r, NO12, 4 - ny)));
        if (!ts.some(only12) || ts.every(only12)) return null;
        return {
          q: `次のルールのうち、積分するだけで解けるものをすべて選ぶと □　${list12(ts)}`, a: ans12(ts), key: `12|${ts.join('|')}`,
          easy: '右辺に、左辺で微分されている量がないものを選ぶ', easyCheck: false,
          verify: p => { const ok = ts.map(noMain12); return p.a === ok.map((b, i) => (b ? `（${i + 1}）` : null)).filter(Boolean).join('・') || `答え ${p.a} がちがう`; },
        };
      },
      // 変数が時間でない・2回微分・e や cos の入った右辺
      s3(r) {
        const ny = r.int(1, 3), ts = r.shuffle(take12(r, YES12b, ny).concat(take12(r, NO12b, 4 - ny)));
        if (!ts.some(only12) || ts.every(only12)) return null;
        return {
          q: `次のルールのうち、積分するだけで解けるものをすべて選ぶと □　${list12(ts)}`, a: ans12(ts), key: `12|${ts.join('|')}`,
          easy: '変数（分母の文字）が $t$ でなくても、2回微分でも、右辺に主役の量がなければ積分するだけ', easyCheck: false,
          verify: p => { const ok = ts.map(noMain12); return p.a === ok.map((b, i) => (b ? `（${i + 1}）` : null)).filter(Boolean).join('・') || `答え ${p.a} がちがう`; },
        };
      },
      // わな：見分けではなく、解く（6-14）
      trap(r) {
        const a = r.pick([2, 3, 4, 6]), b = r.pick([-3, -1, 1, 2, 5]), c = r.pick([1, 2, 3, 5, 10]), sq = r.chance(0.5);
        const f = sq ? `${3 * a}t^2${b > 0 ? '+' : ''}${b}` : `${2 * a}t${b > 0 ? '+' : ''}${b}`, A = `y=${a}t^${sq ? 3 : 2}${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}t+${c}`;
        return dest({ q: `ルール $${DT('y')}=${f}$、初期条件 $y(0)=${c}$ の解 □`, a: `$${A.replace(/\^(\d)/g, '^{$1}')}$`, key: `12t|${f}|${c}`,
          calc: { kind: 'ode', x: 't', coef: [1, 0], rhs: f, init: [[0, c]] } },
        '6-12', '見分けではなく、解を求めている。右辺が $t$ だけなので、項ごとに積分して $C$ をはじめの値で決める', ['6-14']);
      },
    },
  });

  // ================================================================ 6-13
  const H13 = [[4.9, 1], [19.6, 2], [122.5, 5], [176.4, 6], [240.1, 7], [490, 10]];   // 左ページの例（44.1 m・78.4 m）はよける
  M.add({
    id: '6-13', part: 1, chap: '6-3② 例題2', stars: 1,
    title: '2回積分の $C_1$ ははじめの速度、$C_2$ ははじめの位置（静かにはなせば $x=4.9t^2$）',
    mark: '$\\frac{\\dd^2x}{\\dd t^2}=9.8$（下向きが正）と高さ。「静かにはなす」「投げ下ろす」。',
    futsu: ['$v=9.8t+C_1$、$x=4.9t^2+C_1t+C_2$ と2回積分し、', '$t=0$ の速度と位置を入れて', '$C_1$・$C_2$ を連立して求める。'],
    raku: ['44.1 m から静かにはなす', '→ $C_1=C_2=0$ で $4.9t^2=44.1$、$t^2=9$、3秒', '速さ $9.8\\times3=29.4\\,\\mathrm{m/s}$', '78.4 m → 4秒、$39.2\\,\\mathrm{m/s}$'],
    why: '$\\frac{\\dd v}{\\dd t}=9.8$ を積分すると $v=9.8t+C_1$ で、$t=0$ を入れると $C_1=v(0)$（はじめの速度）。もう1回積分すると $x=4.9t^2+C_1t+C_2$ で、$C_2=x(0)$（はじめの位置）（6-3②）。だから、$C$ は連立せずにはじめの状態をそのまま書けばよい。',
    caution: '下向きを正にとっているので、高さ $h$ の地面に着くのは $x=h$ のとき。投げ下ろしたときは $C_1$ がはじめの速さ。$t$ はプラスの解だけ。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '26mm', s3: '16mm', trap: '16mm' }, boxh: { s2: '12mm' },
    fits(q) { return /静かにはなし|投げ下ろ/.test(q) && /\\dd\^2x/.test(q) && !/-[\d.]+v/.test(q); },
    steps: {
      // 静かにはなす：着く時刻・速さ
      s1(r) {
        const [h, n] = r.pick(H13), askV = turn(r, '13s1', 2);
        return {
          q: `高さ ${U(h, 'm')} の所から、ボールを静かにはなします。$${D2('x')}=9.8$（下向きが正）として、地面に着く${askV ? 'ときの速さ □ m/s' : '時刻 □ 秒後'}`, a: M$(askV ? +fmt(9.8 * n) : n), key: `13|${h}`,
          easy: `$x=4.9t^2$。$4.9t^2=${fmt(h)}$、$t^2=${n * n}$、$t=${n}$${askV ? `。$9.8\\times${n}=${fmt(9.8 * n)}$` : ''}`, easyCheck: false,
          // 別の道すじ：オイラー法（細かい Δt）で落としてみる
          verify: p => { let x = 0, v = 0, t = 0; const dt = 1e-4; while (x < h) { const v1 = v + 9.8 * dt; x += (v + v1) / 2 * dt; v = v1; t += dt; } return valIs(p.a, askV ? v : t, 2e-3); },
        };
      },
      // 投げ下ろす：位置・式・速度
      s2(r) {
        const k = turn(r, '13s2', 3), v0 = r.pick([2, 3, 5, 10]), t = r.pick([1, 2, 3]);
        if (k === 1) return {
          q: `高い所から、ボールを下向きに ${U(v0, 'm/s')} で投げ下ろします。$${D2('x')}=9.8$（下向きが正、投げた所が $x=0$）として、$x$ を $t$ の式で □`, a: `$x=4.9t^2+${v0}t$`, key: `13v|${v0}`,
          easy: `$C_1=${v0}$（はじめの速度）、$C_2=0$（はじめの位置）`, easyCheck: false,
          calc: { kind: 'ode', x: 't', coef: [1, 0, 0], rhs: '9.8', init: [[0, 0], [0, v0, 1]] },
        };
        const x = 4.9 * t * t + v0 * t, v = 9.8 * t + v0;
        return {
          q: `高い所から、ボールを下向きに ${U(v0, 'm/s')} で投げ下ろします。$${D2('x')}=9.8$（下向きが正）として、${t}秒後の${k === 0 ? '落ちた距離 □ m' : '速さ □ m/s'}`, a: M$(+fmt(k === 0 ? x : v)), key: `13v|${v0}|${t}|${k}`,
          easy: k === 0 ? `$x=4.9t^2+${v0}t$ に $t=${t}$：$${fmt(4.9 * t * t)}+${v0 * t}=${fmt(x)}$` : `$v=9.8t+${v0}$ に $t=${t}$：$${fmt(9.8 * t)}+${v0}=${fmt(v)}$`, easyCheck: false,
          verify: p => { const X = s => 0.5 * 9.8 * s * s + v0 * s, h = 1e-5; return valIs(p.a, k === 0 ? X(t) : (X(t + h) - X(t - h)) / (2 * h), 1e-6); },
        };
      },
      // 投げ下ろして地面に着く時刻・月の上で
      s3(r) {
        if (turn(r, '13s3', 2)) {
          const t = r.pick([2, 3, 4, 5]), h = 0.8 * t * t;
          return {
            q: `月の上で、高さ ${U(+fmt(h), 'm')} の所から物を静かにはなします。ルールは $${D2('x')}=1.6$（下向きが正）です。着く時刻 □ 秒後`, a: M$(t), key: `13m|${t}`,
            easy: `$x=0.8t^2$。$0.8t^2=${fmt(h)}$、$t^2=${t * t}$`, easyCheck: false,
            verify: p => valIs(p.a, Math.sqrt(2 * h / 1.6)),
          };
        }
        const t = r.pick([1, 2, 3]), m = r.pick([1, 2, 3]), v0 = 4.9 * m, h = 4.9 * t * t + v0 * t;
        return {
          q: `高さ ${U(+fmt(h), 'm')} の所から、ボールを下向きに ${U(+fmt(v0), 'm/s')} で投げ下ろします。$${D2('x')}=9.8$（下向きが正）として、地面に着く時刻 □ 秒後`, a: M$(t), key: `13d|${t}|${m}`,
          easy: `$4.9t^2+${fmt(v0)}t=${fmt(h)}$。4.9でわって $t^2+${m}t-${fmt(h / 4.9)}=0$、$(t-${t})(t+${t + m})=0$`, easyCheck: false,
          verify: p => valIs(p.a, (-v0 + Math.sqrt(v0 * v0 + 4 * 4.9 * h)) / (2 * 4.9), 1e-6),
        };
      },
      // わな：右辺に v（終端速度。6-19）
      trap(r) {
        const c = r.pick([49, 98, 196, 245, 490, 980]), vt = 9.8 / c;
        return dest({ q: `霧のつぶの落ち方のルールは $${DT('v')}=9.8-${c}v$（下向きが正）です。それ以上速くならない速さ（終端速度）□ m/s`, a: M$(+fmt(vt)), key: `13t|${c}`,
          verify: p => { let v = 0; const dt = 1e-4; for (let k = 0; k < 2000; k++) v += (9.8 - c * v) * dt; return valIs(p.a, v, 1e-4); } },
        '6-13', '右辺に $v$ があるので、積分するだけでは解けない。右辺が0になる速さに近づく', ['6-19']);
      },
    },
  });

  // ================================================================ 6-14
  const L14 = U => `$${fmt(U)}\\,\\mathrm{L}$`;
  M.add({
    id: '6-14', part: 1, chap: '6-3③④⑤ 例題3〜6', stars: 1,
    title: '右辺が一定なら直線（かかる時間＝ふやす量÷速さ）。右辺が $t$ の式なら項ごとに積分',
    mark: 'ヒーター・一定の電流・流量 $Q=a-bt$・わかっている電流 $i=I_0e^{-t/\\tau}$。',
    futsu: ['ルールを積分して $C$ をつけ、', 'はじめの値から $C$ を決めて式を作り、', 'その式に値を入れて', '方程式を解く。'],
    raku: ['1250 W、$4200\\,\\mathrm{J/K}$、20→100℃', '→ $80\\times\\frac{4200}{1250}=268.8$ 秒（約4.5分）', '$Q=12-0.4t$、はじめ50 L → $12t-0.2t^2+50$', '$i=0.5e^{-t/2}$ → $q=1-e^{-t/2}$'],
    why: '右辺が一定（ただの数）なら、変わる速さが一定なのでグラフは直線になり、かかる時間は「ふやす量÷速さ」（6-3③④）。右辺が $t$ の式なら、項ごとに積分して $+C$ をつけ、$t=0$ の値で $C$ を決める（6-3⑤）。$e^{at}$ の積分は $\\frac{1}{a}e^{at}$。',
    caution: '熱容量は「1℃上げるのに要る熱」。$\\frac{P}{C_{\\mathrm{th}}}$ は1秒に上がる温度。$\\mathrm{mA}$・$\\mathrm{\\mu F}$ は $\\mathrm{A}$・$\\mathrm{F}$ に直す（$\\frac{I}{C}$）。$C$ ははじめの値で決める（$e^0=1$ に注意）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '36mm', s3: '16mm', trap: '20mm' }, boxh: { s2: '12mm', trap: '12mm' },
    fits(q) {
      if (SEE.test(q) || /オイラー|\\Delta t/.test(q)) return false;
      if (/ヒーター|一定の電流|流量|流れこむ電流/.test(q)) return true;
      const R = rule1(q); if (!R || has2(q)) return false;
      if (M.mathVars(R.rhs, { econst: true }).includes(R.v)) return false;
      return /の解|の式で|での \$|になる時刻|後の/.test(q);
    },
    steps: {
      // ヒーター・一定の電流
      s1(r) {
        if (turn(r, '14s1', 2)) {
          const C = r.pick([50, 100, 200, 500]), I = r.pick([0.5, 1, 2, 5]), V = r.pick([2, 3, 4, 5, 6, 8, 10]), t = V * C / 1000 / I;
          if (decs(t) > 2 || (C === 100 && I === 1 && V === 5)) return null;
          return {
            q: `静電容量 $C=${C}\\,\\mathrm{\\mu F}$ のコンデンサーに、一定の電流 ${U(I, 'mA')} を流しこみます。はじめ $V=0$ のとき、電圧が ${U(V, 'V')} になる時刻 □ 秒`, a: M$(t), key: `14I|${C}|${I}|${V}`,
            easy: `$\\frac{I}{C}=\\frac{${fmt(I / 1000)}}{${fmt(C / 1e6)}}=${fmt(I * 1000 / C)}$〔V/s〕。$${V}\\div${fmt(I * 1000 / C)}=${fmt(t)}$`, easyCheck: false,
            verify: p => valIs(p.a, V / ((I / 1000) / (C / 1e6))),
          };
        }
        const L = r.pick([0.5, 1, 2]), Cth = 4200 * L, P = r.pick([700, 840, 1000, 1050, 1200, 1400, 1500, 2100]), T0 = r.pick([10, 15, 20, 25]), T1 = r.pick([60, 80, 100]), t = (T1 - T0) * Cth / P;
        if (decs(t) > 1 || (L === 1 && P === 1250)) return null;
        return {
          q: `${L14(L)} の水（熱容量 $C_{\\mathrm{th}}=${fmt(Cth)}\\,\\mathrm{J/K}$）を、電力 ${U(P, 'W')} のヒーターで温めます。熱は逃げないとします。はじめ${T0}℃の水が${T1}℃になる時刻 □ 秒`, a: M$(t), key: `14P|${L}|${P}|${T0}|${T1}`,
          easy: `1秒に $\\frac{${P}}{${fmt(Cth)}}$℃上がる。$${T1 - T0}\\times\\frac{${fmt(Cth)}}{${P}}=${fmt(t)}$`, easyCheck: false,
          verify: p => valIs(p.a, (T1 - T0) / (P / Cth)),
        };
      },
      // 右辺が t の式：流量・わかっている電流
      s2(r) {
        const k = turn(r, '14s2', 3);
        if (k === 2) {
          const [I0, tau] = r.pick([[0.6, 3], [0.2, 5], [0.4, 5], [1, 2], [0.3, 2], [0.5, 4], [2, 0.5], [0.1, 10]]), Q = +fmt(I0 * tau);
          return {
            q: `コンデンサーに流れこむ電流が $i=${fmt(I0)}e^{-t/${fmt(tau)}}$〔mA〕（$t$ は秒）です。はじめ $q=0$ のとき、たまった電気の量 $q$〔mC〕を $t$ の式で □`, a: `$q=${Q === 1 ? '' : fmt(Q)}\\,(1-e^{-t/${fmt(tau)}})$`.replace('=\\,(', '=('), key: `14i|${I0}|${tau}`,
            easy: `$\\int e^{-t/${fmt(tau)}}\\,\\dd t=-${fmt(tau)}e^{-t/${fmt(tau)}}+C$。$q=-${fmt(Q)}e^{-t/${fmt(tau)}}+C$、$t=0$ で $C=${fmt(Q)}$`, easyCheck: false,
            calc: { kind: 'ode', x: 't', coef: [1, 0], rhs: `${fmt(I0)}e^{-t/${fmt(tau)}}`, init: [[0, 0]] },
          };
        }
        const a = r.pick([8, 10, 12, 15, 20]), b = r.pick([0.2, 0.4, 0.5, 1]), V0 = r.pick([0, 20, 30, 40, 100]), T = r.pick([5, 10, 20]);
        if (a - b * T < 0 || (a === 12 && b === 0.4)) return null;   // 左ページの例（Q=12-0.4t）はよける（O-2）
        const VT = V0 + a * T - b * T * T / 2, h = +fmt(b / 2);
        if (k === 1) return {
          q: `${V0 ? `水が ${L14(V0)} 入った水そう` : '空の水そう'}に、流量 $Q=${a}-${fmt(b)}t$〔L/min〕で水を入れます。水の量 $V$〔L〕を $t$〔min〕の式で □`, a: `$V=${a}t-${h === 1 ? '' : fmt(h)}t^{2}${V0 ? '+' + V0 : ''}$`, key: `14Q|${a}|${b}|${V0}`,
          easy: `項ごとに積分：$${a}t-${fmt(b)}\\times\\frac{t^2}{2}+C$、$C$ ははじめの ${V0}`, easyCheck: false,
          calc: { kind: 'ode', x: 't', coef: [1, 0], rhs: `${a}-${fmt(b)}t`, init: [[0, V0]] },
        };
        return {
          q: `${V0 ? `水が ${L14(V0)} 入った水そう` : '空の水そう'}に、流量 $Q=${a}-${fmt(b)}t$〔L/min〕で水を入れます。${T}分後の水の量 □ L`, a: M$(+fmt(VT)), key: `14Q|${a}|${b}|${V0}`,
          easy: `$V=${a}t-${fmt(h)}t^2+${V0}$ に $t=${T}$：$${a * T}-${fmt(h * T * T)}+${V0}=${fmt(VT)}$`, easyCheck: false,
          verify: p => { let s = 0; const n = 2000, dt = T / n; for (let j = 0; j < n; j++) s += (a - b * (j + 0.5) * dt) * dt; return valIs(p.a, V0 + s, 1e-6); },
        };
      },
      // 熱容量を逆に・t の式のルールで値を出す
      s3(r) {
        if (turn(r, '14s3', 2)) {
          const P = r.pick([500, 600, 800, 1000, 1200]), t = r.pick([60, 120, 180, 240, 300]), dT = r.pick([10, 20, 24, 30, 40]), C = P * t / dT;
          if (!Number.isInteger(C)) return null;
          return {
            q: `熱が逃げないようにした水を、電力 ${U(P, 'W')} のヒーターで ${t} 秒温めると、温度が${dT}℃上がりました。この水の熱容量 $C_{\\mathrm{th}}$ □ J/K`, a: M$(C), key: `14c|${P}|${t}|${dT}`,
            easy: `入った熱 $${P}\\times${t}=${P * t}$〔J〕を、上がった温度 ${dT} でわる`, easyCheck: false,
            verify: p => valIs(p.a, P * t / dT),
          };
        }
        const a = r.pick([2, 3, 4, 6]), b = r.pick([-4, -2, 1, 3]), c = r.pick([0, 2, 5, 10]), T = r.pick([1, 2, 3]), val = a * T * T * T / 3 * 3 / 3 + 0;
        const f = `${3 * a}t^2${b > 0 ? '+' : ''}${b}`, y = a * T ** 3 + b * T + c;
        return {
          q: `ルール $${DT('y')}=${f}$、$y(0)=${c}$ のとき、$t=${T}$ での $y$ の値 □`, a: M$(y), key: `14f|${f}|${c}|${T}|${val}`,
          easy: `$y=${a}t^3${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}t+${c}$ に $t=${T}$`, easyCheck: false,
          verify: p => { let s = 0; const n = 3000, dt = T / n; for (let j = 0; j < n; j++) { const t = (j + 0.5) * dt; s += (3 * a * t * t + b) * dt; } return valIs(p.a, c + s, 1e-5); },
        };
      },
      // わな：右辺に T（差が半分になる時刻。6-20）
      trap(r) {
        const a = r.pick([0.05, 0.1, 0.2, 0.25, 0.5, 0.04]), b = r.pick([15, 20, 25]), T0 = b + r.pick([40, 50, 60, 70]), Th = (T0 + b) / 2, tau = +fmt(1 / a);
        if (a === 0.05 && b === 20 && T0 === 80) return null;
        return dest({ q: `ルール $${ruleN('T', a, b)}$（$t$ は分）で、はじめ${T0}℃のお湯が${fmt(Th)}℃になる時刻 □ 分後`, a: `$${tau}\\ln2$`, key: `14t|${a}`,
          verify: p => valIs(p.a, Math.log((T0 - b) / (Th - b)) / a) },
        '6-14', '右辺に $T$ があるので、変わる速さは一定ではなく、直線にはならない。差が半分になる時間は $\\tau\\ln2$', ['6-20']);
      },
    },
  });

  // ================================================================ 6-15
  function pick15w(r) {   // かべ：厚さ L、部屋 Ti、外 To（左ページの例 0.2 m・20℃・0℃ はよける）
    for (let k = 0; k < 40; k++) {
      const L = r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), Ti = r.pick([18, 20, 22, 24, 25]), To = r.pick([-5, -4, -2, 0, 2, 4, 5, 10]);
      if (L === 0.2 && Ti === 20 && To === 0) continue;
      const s = (To - Ti) / L;
      if (decs(s) > 1) continue;
      return { L, Ti, To, s };
    }
    return null;
  }
  function pick15b(r) {   // つり橋：塔のあいだ L、y''=a（左ページの例 100 m・0.008 はよける）
    for (let k = 0; k < 40; k++) {
      const L = r.pick([40, 60, 80, 120, 150, 200]), a = r.pick([0.002, 0.004, 0.005, 0.008, 0.01]);
      const sag = a * L * L / 8;
      if (decs(sag) > 2 || sag < 1 || sag > 60) continue;
      return { L, a, sag, h: +fmt(a / 2) };
    }
    return null;
  }
  const wallT = (s, Ti) => `T=${Ti}${s < 0 ? '-' : '+'}${fmt(Math.abs(s))}x`;
  function wallFig(L, Ti, To) {
    const lo = Math.min(0, To) - 4, hi = Ti + 5, G = M.graph({ x0: 0, x1: 1.3 * L, y0: lo, y1: hi, w: 6.6, h: 4 });   // 横軸は L の先までのばし、軸の名前 x を目もり L からはなす（第40回 S-8）
    return { s: 5, items: [
      G.area(() => hi - 1, () => 0, 0, L, { hatch: true }),   // かべの斜線は 0℃ より上だけ（温度の線を斜線にうめない）
      ...G.axes({ xt: To < 0 ? [] : [L], yt: [Ti, To].filter(v => v !== 0), x: 'x', y: 'T', o: To < 0 ? 'nw' : 'sw' }),
      ...(To < 0 ? [['seg', [G.T(L, 0)[0], -0.15], [G.T(L, 0)[0], 0.15]], ['label', G.T(L, 0), fmt(L), 'ne']] : []),   // 外が0℃より下のときは、目もり L を軸の上に（温度の線の下はしと重ねない）
      ['seg', G.T(0, Ti), G.T(L, To), { thick: true }], ['dot', G.T(0, Ti)], ['dot', G.T(L, To)],
      ['label', G.T(0, hi - 1), '部屋', 'nw'], ['label', G.T(L, hi - 1), '外', 'ne'],
    ] };
  }
  function bridgeFig(L, a) {
    const sag = a * L * L / 8, G = M.graph({ x0: 0, x1: L, y0: -1.5 * sag, y1: 0.35 * sag, w: 7, h: 3.4 });
    return { s: 5, items: [
      ['seg', G.T(0, 0.3 * sag), G.T(0, -1.45 * sag), { thick: true }], ['seg', G.T(L, 0.3 * sag), G.T(L, -1.45 * sag), { thick: true }],
      ['seg', G.T(0, -1.3 * sag), G.T(L, -1.3 * sag)],
      ['seg', G.T(0, 0), G.T(L, 0), { dash: true }],
      ...G.plot(x => a / 2 * x * (x - L), 0, L, { thick: true }),
      ['dot', G.T(0, 0)], ['dot', G.T(L, 0)],
      ['label', G.T(0, 0), '$x=0$', 'nw'], ['label', G.T(L, 0), `$x=${L}$`, 'ne'],
      ['seg', G.T(L / 2, 0), G.T(L / 2, -sag), { arrow: true }], ['label', G.T(L / 2, -sag / 2), 'たるみ', 'e'],
    ] };
  }
  M.add({
    id: '6-15', part: 1, chap: '6-3⑦⑧ 例題8・9', stars: 1,
    title: '両はしで決める：$T\'\'=0$ は両はしを結ぶ直線、$y\'\'=a$ は $y=\\frac{a}{2}x\\,(x-L)$',
    mark: '「かべの部屋の側と外の側の温度」「塔と塔のあいだ」と2回微分のルール。',
    futsu: ['2回積分して $T=C_1x+C_2$（$y=\\frac{a}{2}x^2+C_1x+C_2$）、', '両はしの値を入れて', '$C_1$・$C_2$ の連立方程式を解く。'],
    raku: ['厚さ0.2 m、20℃と0℃ → $T=20-100x$', '5 cm で15℃、10℃はまん中の $x=0.1$', '100 m、$y\'\'=0.008$ → $y=0.004x\\,(x-100)$', '$x=25$ で7.5 m 下、まん中は $\\frac{0.008\\times100^2}{8}=10$ m 下'],
    why: '$\\frac{\\dd^2T}{\\dd x^2}=0$ の解は直線なので、両はしの点を結べばよい（比例で読める。6-3⑦）。$y\'\'=a$ の解は放物線で、両はしで0なら、$x=0$ と $x=L$ で0になる $y=\\frac{a}{2}x\\,(x-L)$ と書ける（$x^2$ の係数は $\\frac{a}{2}$）。$x=\\frac{L}{2}$ を入れると、まん中のたるみ $\\frac{aL^2}{8}$（6-3⑧）。',
    caution: '$x$ の単位をそろえる（5 cm は0.05 m）。温度は部屋の側から外の側へまっすぐ変わる。片方のはしの値と傾きがわかっているときは、両はしの形ではない（はじめの状態で $C$ を決める）。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '24mm', s3: '16mm', trap: '16mm' }, boxh: { s1: '12mm', s2: '12mm' },
    fits(q) { return /かべ|つり橋|塔/.test(q) && !/傾き/.test(q); },
    steps: {
      // かべ：ある場所の温度・式
      s1(r) {
        const g = pick15w(r); if (!g) return null;
        const { L, Ti, To, s } = g;
        if (turn(r, '15s1', 2)) {
          const xc = r.pick([1, 2, 4, 5, 10, 15, 20, 25, 30, 40]), x = xc / 100, T = Ti + s * x;
          if (x >= L || decs(T) > 1) return null;
          return {
            q: `厚さ ${U(L, 'm')} のかべで、部屋の側が${Ti}℃、外の側が${To < 0 ? `$${To}$` : To}℃です（定常で $\\frac{\\dd^2T}{\\dd x^2}=0$）。部屋の側から ${U(xc, 'cm')} の所の温度 □ ℃`, a: M$(+fmt(T)), key: `15w|${L}|${Ti}|${To}`,
            easy: `${fmt(L)} m で ${Ti - To}℃下がるので、${fmt(x)} m で $${Ti - To}\\times\\frac{${fmt(x)}}{${fmt(L)}}=${fmt(Ti - T)}$℃下がる`, easyCheck: false,
            verify: p => valIs(p.a, Ti + (To - Ti) * x / L),
          };
        }
        return {
          q: `厚さ ${U(L, 'm')} のかべで、部屋の側（$x=0$）が${Ti}℃、外の側（$x=${fmt(L)}$）が${To < 0 ? `$${To}$` : To}℃です。定常のとき $\\frac{\\dd^2T}{\\dd x^2}=0$ として、$T$ を $x$ の式で □`, a: `$${wallT(s, Ti)}$`, key: `15w|${L}|${Ti}|${To}`,
          easy: `傾きは $\\frac{${To}-${Ti}}{${fmt(L)}}=${fmt(s)}$、$x=0$ で ${Ti}`, easyCheck: false,
          calc: { kind: 'ode', x: 'x', coef: [1, 0, 0], rhs: '0', init: [[0, Ti], [L, To]] },
        };
      },
      // つり橋：ある場所の高さ・式
      s2(r) {
        const g = pick15b(r); if (!g) return null;
        const { L, a, h } = g;
        if (turn(r, '15s2', 2)) {
          const x = L * r.pick([0.1, 0.2, 0.25, 0.3, 0.4]), y = -h * x * (x - L);
          if (decs(y) > 2 || decs(x) > 0) return null;
          return {
            q: `つり橋のケーブルの形が $\\frac{\\dd^2y}{\\dd x^2}=${fmt(a)}$ にしたがい、塔の上（$x=0$ と $x=${L}$）で $y=0$ です。$x=${fmt(x)}$ の所は、塔の上より □ m 下`, a: M$(+fmt(y)), key: `15b|${L}|${a}`,
            easy: `$y=${fmt(h)}x\\,(x-${L})$ に $x=${fmt(x)}$：$${fmt(h)}\\times${fmt(x)}\\times(${fmt(x - L)})=${fmt(-y)}$`, easyCheck: false,
            verify: p => { const yy = t => a / 2 * t * t - a * L / 2 * t; return (close(yy(L), 0) && valIs(p.a, -yy(x))) || 'ちがう'; },
          };
        }
        return {
          q: `つり橋のケーブルの形が $\\frac{\\dd^2y}{\\dd x^2}=${fmt(a)}$ にしたがい、塔の上（$x=0$ と $x=${L}$）で $y=0$ です。$y$ を $x$ の式で □`, a: `$y=${fmt(h)}x\\,(x-${L})$`, key: `15b|${L}|${a}`,
          easy: `$x^2$ の係数は $\\frac{${fmt(a)}}{2}=${fmt(h)}$、$x=0$ と $x=${L}$ で0`, easyCheck: false,
          calc: { kind: 'ode', x: 'x', coef: [1, 0, 0], rhs: fmt(a), init: [[0, 0], [L, 0]], pts: [3.7, 11.3, 25.9] },
        };
      },
      // 図：かべの温度が□℃の場所・つり橋のまん中のたるみ
      s3(r) {
        if (turn(r, '15s3', 2)) {
          const g = pick15b(r); if (!g) return null;
          const { L, a, sag } = g;
          return {
            q: `図は、塔と塔のあいだが ${U(L, 'm')} のつり橋のケーブルです。ケーブルの形は $\\frac{\\dd^2y}{\\dd x^2}=${fmt(a)}$ にしたがい、両方の塔の上で $y=0$ です。まん中のたるみ □ m`, a: M$(+fmt(sag)), key: `15b|${L}|${a}`,
            easy: `$\\frac{aL^2}{8}=\\frac{${fmt(a)}\\times${L}^2}{8}=${fmt(sag)}$`, easyCheck: false,
            fig: bridgeFig(L, a),
            verify: p => { let y = 0, s = -a * L / 2; const n = 4000, dx = L / 2 / n; for (let j = 0; j < n; j++) { const s1 = s + a * dx; y += (s + s1) / 2 * dx; s = s1; } return valIs(p.a, -y, 1e-6); },
          };
        }
        let g = null, xc = 0, x = 0, T = 0;
        for (let k = 0; k < 40 && !g; k++) {   // 図の問題が見開きに出るように、ここで数をさがしなおす
          g = pick15w(r); if (!g) continue;
          xc = r.pick([1, 2, 4, 5, 10, 15, 20, 25, 30, 40]); x = xc / 100; T = +fmt(g.Ti + g.s * x);
          if (x >= g.L || decs(T) > 1 || T === g.Ti || T === g.To) g = null;
        }
        if (!g) return null;
        const { L, Ti, To } = g;
        return {
          q: `図は、厚さ ${U(L, 'm')} のかべの中の温度（定常で $\\frac{\\dd^2T}{\\dd x^2}=0$）です。部屋の側が${Ti}℃、外の側が${To < 0 ? `$${To}$` : To}℃のとき、温度が${T < 0 ? `$${T}$` : T}℃になるのは、部屋の側から □ cm の所`, a: M$(xc), key: `15w|${L}|${Ti}|${To}`,
          easy: `${fmt(L)} m で ${Ti - To}℃下がる。${fmt(Ti - T)}℃下がるのは $${fmt(L)}\\times\\frac{${fmt(Ti - T)}}{${Ti - To}}=${fmt(x)}$ m`, easyCheck: false,
          fig: wallFig(L, Ti, To),
          verify: p => valIs(p.a, 100 * L * (Ti - T) / (Ti - To)),
        };
      },
      // わな：片方のはしの値と傾き（はじめの状態で C を決める。6-13）
      trap(r) {
        const a = r.pick([0.004, 0.006, 0.01, 0.02]), s = -r.pick([0.2, 0.3, 0.4, 0.5]), X = r.pick([10, 20, 30, 50]), y = a / 2 * X * X + s * X;
        if (decs(y) > 2 || Math.abs(y) < 1e-9 || (a === 0.008 && s === -0.4)) return null;
        return dest({ q: `ケーブルの形が $\\frac{\\dd^2y}{\\dd x^2}=${fmt(a)}$ にしたがい、$x=0$ で $y=0$、傾き $\\frac{\\dd y}{\\dd x}=${fmt(s)}$ です。$x=${X}$ での $y$ □`, a: M$(+fmt(y)), key: `15t|${a}|${s}|${X}`,
          verify: p => { let yy = 0, sl = s; const n = 4000, dx = X / n; for (let j = 0; j < n; j++) { const s1 = sl + a * dx; yy += (sl + s1) / 2 * dx; sl = s1; } return valIs(p.a, yy, 1e-6); } },
        '6-15', '両はしの値ではなく、片方のはしの値と傾き。$C_1$ ははじめの傾き、$C_2$ ははじめの値で、$y=\\frac{a}{2}x^2+C_1x+C_2$', ['6-13']);
      },
    },
  });

  // ================================================================ 6-91（第39回で足した）
  const P0 = 101300;
  const LIQ91 = [{ name: '水', top: '水面', rg: 9800 }, { name: '海水', top: '海面', rg: 10094 }];
  const D91 = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 40, 50];
  M.add({
    id: '6-91', part: 1, chap: '6-3⑥ 例題7', stars: 1,
    title: '深さと水圧：$p=p_0+\\rho g\\times$深さ（深さ $d$ は $z=-d$）',
    mark: '$\\frac{\\dd p}{\\dd z}=-\\rho g$、水面（海面）の圧力と、深さ・水圧。',
    futsu: ['$\\frac{\\dd p}{\\dd z}=-\\rho g$ を $z$ で積分して $p=-\\rho gz+C$、', '$z=0$ の圧力で $C$ を決め、', '深さ $d$ のとき $z=-d$ を入れる。'],
    raku: ['海水 $\\rho g=10094$、深さ $30\\,\\mathrm{m}$', '→ $p=101300+10094\\times30$', '$=101300+302820=404120\\,\\mathrm{Pa}$'],
    why: '$\\frac{\\dd p}{\\dd z}=-\\rho g$ は右辺が一定なので、圧力は高さ $z$ について直線（6-3⑥）。$z$ は上向きなので、深さ $d$ の所は $z=-d$ で、$p=p_0-\\rho g\\times(-d)=p_0+\\rho g d$。深さ1 m ごとに $\\rho g$ ずつふえると読めばよい。',
    caution: '深さ $d$ を $z=d$ と入れない（圧力がへってしまう）。水面の大気の圧力 $p_0$ をたし忘れない。$\\rho g$ の単位は Pa/m。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '20mm', s2: '16mm', s3: '36mm', trap: '40mm' }, boxh: { s3: '12mm', trap: '12mm' },
    fits(q) { return /水圧|水面|海面|表面の圧力|\\dd p\}\{\\dd z/.test(q) && !/[\d.]p\$|\\dd p\}\{\\dd z\}=-[\d.]+p/.test(q) && !SEE.test(q); },
    steps: {
      // 深さから水圧
      s1(r) {
        const L = r.pick(LIQ91), d = r.pick(D91), p = P0 + L.rg * d;
        if (L.rg === 10094 && d === 30) return null;
        return {
          q: `${L.name}（$\\rho g=${L.rg}$〔Pa/m〕）で、${L.top}の圧力が ${U(P0, 'Pa')} のとき、深さ ${U(d, 'm')} の水圧 □ Pa`, a: M$(p), key: `91|${L.rg}|${d}`,
          easy: `$${P0}+${L.rg}\\times${d}=${P0}+${L.rg * d}=${p}$`, easyCheck: false,
          calc: { kind: 'ode', x: 'z', coef: [1, 0], rhs: String(-L.rg), init: [[0, P0]], ans: `${P0}-${L.rg}z` },
          verify: p_ => valIs(p_.a, P0 - L.rg * (-d)),
        };
      },
      // 水圧から深さ・水面の何倍になる深さ
      s2(r) {
        const L = r.pick(LIQ91);
        if (turn(r, '91s2', 2)) {
          const n = r.pick([2, 3, 4]), d = (n - 1) * P0 / L.rg, g = gv(d, d, 1);
          return {
            q: `${L.name}（$\\rho g=${L.rg}$〔Pa/m〕）で、${L.top}の圧力が ${U(P0, 'Pa')} のとき、水圧が${L.top}の${n}倍（${U(n * P0, 'Pa')}）になる深さは約 □ m（小数第1位まで）`, a: `$${g.ans}$`, key: `91n|${L.rg}|${n}`,
            easy: `ふえる分は $${(n - 1) * P0}\\,\\mathrm{Pa}$。$${(n - 1) * P0}\\div${L.rg}\\approx${g.ans}$`, easyCheck: false,
            verify: p_ => valIs(p_.a, +rd(((n * P0) - P0) / L.rg, 1)),
          };
        }
        const d = r.pick(D91), p = P0 + L.rg * d;
        return {
          q: `${L.name}（$\\rho g=${L.rg}$〔Pa/m〕）で、${L.top}の圧力が ${U(P0, 'Pa')} のとき、水圧が ${U(p, 'Pa')} になる深さ □ m`, a: M$(d), key: `91|${L.rg}|${d}`,
          easy: `$(${p}-${P0})\\div${L.rg}=${d}$`, easyCheck: false,
          verify: p_ => valIs(p_.a, (p - P0) / L.rg),
        };
      },
      // z の式・ほかの液体
      s3(r) {
        if (turn(r, '91s3', 2)) {
          const L = r.pick(LIQ91);
          return {
            q: `${L.name}の中で $\\frac{\\dd p}{\\dd z}=-${L.rg}$ です（$z$ は上向きの高さ〔m〕で、${L.top}が $z=0$、そこで $p=${P0}\\,\\mathrm{Pa}$）。$p$ を $z$ の式で □`, a: `$p=${P0}-${L.rg}z$`, key: `91z|${L.rg}`,
            easy: `$z$ で積分して $p=-${L.rg}z+C$、$z=0$ で $C=${P0}$`, easyCheck: false,
            calc: { kind: 'ode', x: 'z', coef: [1, 0], rhs: String(-L.rg), init: [[0, P0]] },
          };
        }
        const [nm, rho] = r.pick([['油', 800], ['油', 900], ['海水', 1020], ['しょう油', 1200]]), rg = +fmt(rho * 9.8), d = r.pick([2, 5, 10, 20]), p = P0 + rg * d;
        return {
          q: `密度 $\\rho=${rho}\\,\\mathrm{kg/m^3}$ の${nm}（$g=9.8$）で、表面の圧力が ${U(P0, 'Pa')} のとき、深さ ${U(d, 'm')} の圧力 □ Pa`, a: M$(+fmt(p)), key: `91o|${rho}|${d}`,
          easy: `$\\rho g=${rho}\\times9.8=${fmt(rg)}$。$${P0}+${fmt(rg)}\\times${d}=${fmt(p)}$`, easyCheck: false,
          verify: p_ => valIs(p_.a, P0 + rho * 9.8 * d),
        };
      },
      // わな：空気（右辺に p。6-17）
      trap(r) {
        const k = r.pick([0.0001, 0.00012, 0.00013]);
        return dest({ q: `空気は押しちぢめられるので、上空ほど密度が小さく、$\\frac{\\dd p}{\\dd z}=-${fmt(k)}p$（$z$ は上向きの高さ〔m〕）とします。地面（$z=0$）で $p=${P0}\\,\\mathrm{Pa}$ のとき、$p$ を $z$ の式で □`, a: `$p=${P0}e^{-${fmt(k)}z}$`, key: `91t|${k}`,
          calc: { kind: 'ode', x: 'z', coef: [1, k], init: [[0, P0]], pts: [10, 300, 1200] } },
        '6-91', '右辺に $p$ があるので、積分するだけでは解けない（圧力は直線でへらない）。「自分に比例してへる」形で、$p_0e^{-kz}$', ['6-17']);
      },
    },
  });

  // ================================================================ 6-92（第39回で足した）
  const E92 = [0.4, 0.48, 0.52, 0.64, 0.74, 0.86, 0.96, 1.12, 1.2, 1.6, 2.64];
  M.add({
    id: '6-92', part: 1, chap: '6-2⑤ 例題2', stars: 1,
    title: '$\\Delta t$ を半分にすると、ずれもほぼ半分（ずれは $\\Delta t$ に比例する）',
    mark: '「$\\Delta t=\\square$ のずれが□」と、ちがう $\\Delta t$ でのずれ・予想。',
    futsu: ['新しい $\\Delta t$ で、オイラー法を', '1歩ずつ計算しなおし、', 'ほんとうの値とくらべて', 'ずれを出す。'],
    raku: ['$\\Delta t=2$ 分でずれ0.52℃', '→ $\\Delta t=1$ 分では約 $0.52\\div2=0.26$℃', '（ほんとうは0.25℃）'],
    why: 'オイラー法は、1歩の下げすぎがおよそ $\\Delta t\\times\\Delta t$ に比例し、歩数は $\\Delta t$ に反比例する。だから、全部のずれは $\\Delta t$ にほぼ比例する（1次の方法。6-2⑤）。$\\Delta t$ を $\\frac{1}{n}$ にすると、ずれもほぼ $\\frac{1}{n}$ になる。',
    caution: 'ほぼ比例するだけなので、答えは「約」。$\\Delta t$ が大きすぎる（ふらふらする）ときは、この比例は成り立たない。ずれを $\\frac{1}{10}$ にするには、歩数を10倍にする。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { return (/ずれ/.test(q) || /オイラー法/.test(q) && /ほんとうの/.test(q) && /予想/.test(q)) && /\\Delta t/.test(q) && !/倍率|半径|何倍/.test(q); },
    steps: {
      // Δt を 1/n にしたときのずれ
      s1(r) {
        const e = r.pick(E92), h = r.pick([1, 2, 4]), n = r.pick([2, 4, 5, 10]);
        if (decs(e / n) > 3 || (e === 0.52 && h === 2 && n === 2)) return null;
        return {
          q: `お湯の温度を $\\Delta t=${h}$ 分のオイラー法で計算すると、ほんとうの値とのずれが${fmt(e)}℃でした。$\\Delta t=${fmt(h / n)}$ 分にすると、ずれは約 □ ℃`, a: M$(+fmt(e / n)), key: `92|${e}|${h}|${n}`,
          easy: `$\\Delta t$ が $\\frac{1}{${n}}$ なので、ずれも約 $\\frac{1}{${n}}$：$${fmt(e)}\\div${n}=${fmt(e / n)}$`, easyCheck: false,
          verify: p => valIs(p.a, e * (h / n) / h),
        };
      },
      // ずれを小さくする Δt・Δt を大きくしたときのずれ
      s2(r) {
        const e = r.pick(E92), h = r.pick([0.5, 1, 2]), n = r.pick([2, 4, 5, 10]);
        if (turn(r, '92s2', 2)) {
          const E = +fmt(e / n);
          if (decs(E) > 3 || decs(h / n) > 3) return null;
          return {
            q: `$\\Delta t=${fmt(h)}$ 分のオイラー法で、ほんとうの値とのずれが${fmt(e)}℃でした。ずれを約${fmt(E)}℃にするには、$\\Delta t$ を約 □ 分にする`, a: M$(+fmt(h / n)), key: `92|${e}|${h}|${n}`,
            easy: `ずれを $\\frac{1}{${n}}$ にするので、$\\Delta t$ も $\\frac{1}{${n}}$：$${fmt(h)}\\div${n}=${fmt(h / n)}$`, easyCheck: false,
            verify: p => valIs(p.a, h * E / e),
          };
        }
        const e0 = +fmt(e / 10), h0 = 0.1;
        if (decs(e0) > 3) return null;
        return {
          q: `$\\Delta t=${h0}$ 分のオイラー法で、ほんとうの値とのずれが${fmt(e0)}℃でした。$\\Delta t=1$ 分にすると、ずれは約 □ ℃`, a: M$(e), key: `92b|${e}`,
          easy: `$\\Delta t$ が10倍なので、ずれも約10倍：$${fmt(e0)}\\times10=${fmt(e)}$`, easyCheck: false,
          verify: p => valIs(p.a, e0 * 1 / h0),
        };
      },
      // ほんとうの値の予想
      s3(r) {
        const Tt = +fmt(r.int(3500, 7500) / 100), e = r.pick(E92);
        if (turn(r, '92s3', 2)) {
          const T2 = +fmt(Tt - e), T1 = +fmt(Tt - e / 2);
          if (decs(T1) > 2) return null;
          return {
            q: `お湯の温度を、$\\Delta t=2$ 分のオイラー法で計算すると${fmt(T2)}℃、$\\Delta t=1$ 分では${fmt(T1)}℃でした。ずれが $\\Delta t$ に比例するとして、ほんとうの温度は約 □ ℃`, a: M$(Tt), key: `92r|${Tt}|${e}`,
            easy: `$\\Delta t=1$ 分のずれは、ずれの差 $${fmt(T1)}-${fmt(T2)}=${fmt(e / 2)}$ と同じ。$${fmt(T1)}+${fmt(e / 2)}=${fmt(Tt)}$`, easyCheck: false,
            verify: p => valIs(p.a, 2 * T1 - T2),
          };
        }
        const T2 = +fmt(Tt - e), Ans = +fmt(Tt - e / 2);
        if (decs(Ans) > 3 || (Tt === 69.12 && e === 0.52)) return null;
        return {
          q: `お湯の温度を $\\Delta t=2$ 分のオイラー法で計算すると${fmt(T2)}℃で、ほんとうの値${fmt(Tt)}℃より低くなりました。$\\Delta t=1$ 分で計算すると、約 □ ℃になると予想できる`, a: M$(Ans), key: `92p|${Tt}|${e}`,
          easy: `ずれ $${fmt(e)}$ がほぼ半分の $${fmt(e / 2)}$ になる。$${fmt(Tt)}-${fmt(e / 2)}=${fmt(Ans)}$`, easyCheck: false,
          verify: p => valIs(p.a, Tt - (Tt - T2) / 2),
        };
      },
      // わな：Δt を半分にして、値そのものを出す（6-08）
      trap(r) {
        const a = r.pick([0.04, 0.1, 0.2]), b = r.pick([15, 20, 25]), T0 = b + r.pick([20, 40, 50, 60]), h = r.pick([1, 2]), f = 1 - a * h / 2, T = b + (T0 - b) * f * f;
        if (decs(T) > 3 || (a === 0.1 && b === 20 && T0 === 60 && h === 1)) return null;
        return dest({ q: `$${ruleN('T', a, b)}$（$t$ は分）、はじめ${T0}℃です。$\\Delta t$ を半分の ${fmt(h / 2)} 分にしたオイラー法で、${h}分後の温度 □ ℃`, a: M$(+fmt(T)), key: `92t|${a}|${b}|${T0}|${h}`,
          verify: p => valIs(p.a, euler(rule1(p.q), T0, h / 2, 2)) },
        '6-92', 'ずれではなく、温度そのものを聞いている。オイラー法を2歩（差に倍率を2回）', ['6-08']);
      },
    },
  });

  // ================================================================ 6-93（第39回で足した）
  const SQ93 = { 0.02: '1.0004', 0.04: '1.0016', 0.05: '1.0025', 0.06: '1.0036', 0.1: '1.01', 0.2: '1.04', 0.3: '1.09', 0.4: '1.16', 0.5: '1.25' };
  function pick93(r) {   // ω と Δt（ωΔt が表の値。左ページの例 ω=4・Δt=0.02 はよける）
    for (let k = 0; k < 40; k++) {
      const w = r.pick([1, 2, 3, 4, 5, 10, 20]), wd = +r.pick(Object.keys(SQ93)), dt = +fmt(wd / w);
      if ((w === 4 && dt === 0.02) || decs(dt) > 3) continue;
      return { w, wd, dt, sq: SQ93[wd] };
    }
    return null;
  }
  M.add({
    id: '6-93', part: 1, chap: '6-2⑩ 例題6', stars: 1,
    title: 'ふつうのオイラー法のふくらみ：ゆれの円の半径は1歩で $\\sqrt{1+(\\omega\\Delta t)^2}$ 倍',
    mark: '「ふつうのオイラー法」でばね（$\\omega$）と $\\Delta t$、「1歩で何倍」「1周で何倍」。',
    futsu: ['表で何百歩も計算して、', '山の高さがどうふえるかを', '1周ずつくらべる。'],
    raku: ['$\\omega=4$、$\\Delta t=0.02$ → $\\omega\\Delta t=0.08$', '→ $\\sqrt{1+0.08^2}=\\sqrt{1.0064}\\approx1.0032$ 倍', '1周（約79歩）で $1.0032^{79}\\approx1.29$ 倍'],
    why: '点 $\\bigl(x,\\ \\frac{v}{\\omega}\\bigr)$ は円の上を回る。ふつうのオイラー法の1歩は、円の接線の向き（半径に垂直）に、半径の $\\omega\\Delta t$ 倍の長さだけ進むので、三平方の定理で新しい半径は $r\\sqrt{1+(\\omega\\Delta t)^2}$（6-2⑩）。どの1歩でも同じなので、$n$ 歩で $n$ 乗倍。',
    caution: '1より少しだけ大きいので、長い時間ではふくらみが目立つ。速度を先に進めるオイラー法では、ふくらまない。1周の歩数は $\\frac{2\\pi}{\\omega}\\div\\Delta t$。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '22mm', s2: '22mm', s3: '16mm', trap: '20mm' },
    fits(q) { return /ふつうのオイラー法/.test(q) && /半径|倍|歩/.test(q); },
    steps: {
      s1(r) {
        const used = r.sq93 || (r.sq93 = new Set());   // 同じ見開きで同じ倍率（√の中）をくり返さない
        if (used.size >= 6) used.clear();
        let g = null;
        for (let k = 0; k < 30; k++) { g = pick93(r); if (g && !used.has(g.sq)) break; }
        if (!g || used.has(g.sq)) return null;
        used.add(g.sq);
        const { w, wd, dt, sq } = g;
        return {
          q: `$\\omega=${w}$ のばねの動きを、ふつうのオイラー法で $\\Delta t=${fmt(dt)}$ として計算します。1歩で、ゆれの円の半径は □ 倍`, a: `$\\sqrt{${sq}}$`, key: `93|${w}|${dt}`,
          easy: `$\\omega\\Delta t=${fmt(wd)}$、$\\sqrt{1+${fmt(wd)}^2}=\\sqrt{${sq}}$`, easyCheck: false,
          // 別の道すじ：x'=v、v'=-ω^2 x を、ふつうのオイラー法で1歩進めて、点 (x, v/ω) の原点からの距離をくらべる
          verify: p => { const x = 1, v = 0, x1 = x + v * dt, v1 = v - w * w * x * dt; return valIs(p.a, Math.hypot(x1, v1 / w), 1e-9); },
        };
      },
      // m・k から・1周の歩数
      s2(r) {
        if (turn(r, '93s2', 2)) {
          const used = r.sq93 || (r.sq93 = new Set());
          if ([0.1, 0.2, 0.4, 0.5].every(v => used.has(SQ93[v]))) used.clear();
          const [m, k, w] = r.pick([[1, 4, 2], [0.25, 4, 4], [1, 9, 3], [2, 50, 5], [0.1, 10, 10], [1, 25, 5], [0.5, 2, 2], [4, 16, 2]]), wd = r.pick([0.1, 0.2, 0.4, 0.5].filter(v => !used.has(SQ93[v]))), dt = +fmt(wd / w);
          if (wd == null || decs(dt) > 3) return null;
          used.add(SQ93[wd]);
          return {
            q: `質量 ${U(m, 'kg')}、ばね定数 ${U(k, 'N/m')} のばねの動きを、ふつうのオイラー法で $\\Delta t=${fmt(dt)}$ として計算します。1歩で、ゆれの円の半径は □ 倍`, a: `$\\sqrt{${SQ93[wd]}}$`, key: `93|${w}|${dt}`,
            easy: `$\\omega=\\sqrt{\\frac{${k}}{${fmt(m)}}}=${w}$、$\\omega\\Delta t=${fmt(wd)}$`, easyCheck: false,
            verify: p => { const ww = Math.sqrt(k / m), x1 = 1, v1 = -ww * ww * dt; return valIs(p.a, Math.hypot(x1, v1 / ww), 1e-9); },
          };
        }
        const g = pick93(r); if (!g) return null;
        const { w, wd, dt } = g, N = 6.28 / wd, gg = gv(N, 2 * Math.PI / wd, 0);
        if (!gg) return null;
        const nn = Math.round(N);
        if (rd(N, 0) !== rd(2 * Math.PI / wd, 0) || Math.abs(N - Math.floor(N) - 0.5) < 0.05) return null;
        return {
          q: `$\\omega=${w}$ のばねの動きを、ふつうのオイラー法で $\\Delta t=${fmt(dt)}$ として計算します。1周（周期 $\\frac{2\\pi}{\\omega}$ 秒）は約 □ 歩（$\\pi=3.14$、整数で）`, a: M$(nn), key: `93|${w}|${dt}`,
          easy: `周期 $\\frac{6.28}{${w}}=${fmt(6.28 / w)}$ 秒、$${fmt(6.28 / w)}\\div${fmt(dt)}\\approx${nn}$`, easyCheck: false,
          verify: p => valIs(p.a, Math.round(2 * Math.PI / w / dt)),
        };
      },
      // ω を逆に・Δt を逆に
      s3(r) {
        const g = pick93(r); if (!g) return null;
        const { w, wd, dt, sq } = g;
        if (turn(r, '93s3', 2)) return {
          q: `あるばねの動きを、ふつうのオイラー法で $\\Delta t=${fmt(dt)}$ として計算すると、ゆれの円の半径が1歩で $\\sqrt{${sq}}$ 倍になりました。このばねの $\\omega$ □`, a: M$(w), key: `93|${w}|${dt}`,
          easy: `$1+(\\omega\\Delta t)^2=${sq}$ より $\\omega\\Delta t=${fmt(wd)}$、$\\omega=${fmt(wd)}\\div${fmt(dt)}=${w}$`, easyCheck: false,
          verify: p => { const ww = numOf(p.a); return close(1 + (ww * dt) ** 2, +sq) || `答え ${p.a} がちがう`; },
        };
        return {
          q: `$\\omega=${w}$ のばねの動きを、ふつうのオイラー法で計算します。ゆれの円の半径が1歩で $\\sqrt{${sq}}$ 倍になるのは、$\\Delta t=$ □ のとき`, a: M$(dt), key: `93|${w}|${dt}`,
          easy: `$(\\omega\\Delta t)^2=${fmt(+sq - 1)}$、$\\omega\\Delta t=${fmt(wd)}$、$\\Delta t=${fmt(wd)}\\div${w}=${fmt(dt)}$`, easyCheck: false,
          verify: p => { const d = numOf(p.a); return close(1 + (w * d) ** 2, +sq) || `答え ${p.a} がちがう`; },
        };
      },
      // わな：速度を先に進めるオイラー法の1歩（6-11）
      trap(r) {
        const K = r.pick([4, 9, 25, 100]), x0 = r.pick([0.1, 0.2, 0.05]), h = r.pick([0.1, 0.05]), v1 = -K * x0 * h, x1 = x0 + v1 * h;
        if (decs(x1) > 5 || K * h * h > 0.3) return null;
        return dest({ q: `加速度が $a=-${K}x$ のばねで、はじめ $x=${fmt(x0)}$、$v=0$ です。速度を先に進めるオイラー法で、$\\Delta t=${fmt(h)}$ として、1歩後の位置 □ m`, a: M$(+fmt(x1)), key: `93t|${K}|${x0}|${h}`,
          verify: p => { let x = x0, v = 0; v += -K * x * h; x += v * h; return valIs(p.a, x); } },
        '6-93', 'ふつうのオイラー法のふくらみではなく、速度を先に進めるオイラー法の1歩の値。加速度→新しい速度→新しい位置', ['6-11']);
      },
    },
  });
  // ---------------------------------------------------------------- わなの答えと s3 の答えを重ねない（第40回 S-2）
  // 同じ見開き（アプリでは同じプリント）で、s3 に出た答えと同じ答えのわなは出さない（作りなおす。makeStep の回数の上限の中で）
  ['6-01', '6-02', '6-03', '6-04', '6-05', '6-06', '6-07', '6-08', '6-09', '6-10', '6-11', '6-12', '6-13', '6-14', '6-15', '6-91', '6-92', '6-93'].forEach(id => {
    const d = M.waza[id], s3 = d.steps.s3, trap = d.steps.trap;
    if (!s3 || !trap) return;
    const seen = r => { const o = r.s3ans || (r.s3ans = {}); return o[id] || (o[id] = new Set()); };
    d.steps.s3 = r => { const p = s3(r); if (p) seen(r).add(String(p.a)); return p; };
    d.steps.trap = r => { const p = trap(r); return p && seen(r).has(String(p.a)) ? null : p; };
  });
})(globalThis.MONDAI);

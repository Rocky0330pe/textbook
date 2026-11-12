/* 問題集 第5巻　第2部 運動・微分の道具箱・最大と近似（わざ 5-15〜5-30、5-92）　組 b
 * 書き方は v5/README.md（第5巻の手引き）と v4/README.md・v2/README.md。文は教科書 第5巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 電卓は使わない（L-4）。近似値は、使う値とけたを問題の文に書き、近似の答えは「\approx」で聞く（L-3・L-5）。
 * 微分の答えは展開しない形を本の答えにし（L-5）、calc（kind 'diff'）で数値の微分とくらべる。展開した形も正。
 *   積の微分（5-19）だけは、教科書 5-6 例題1 と同じく、まとめた多項式を答えにする。
 * 極値と x の組・最大と最小・近似値・ずれは verify(p) で、別の道すじ（細かくならべて調べる、数値の微分、1歩ずつの計算）で確かめる。
 *   極値（5-24）・最大と最小（5-25）の答えは値だけ（こたえのページの欄に入る長さ）。どの x かは楽な形に書き、verify は値と x の両方を見る。
 * 図はステップ3だけ（K-2）：5-25 はグラフ（M.graph）、5-26 は囲む長方形と箱の紙、5-23 はさかさの円すいのタンク（だ円。図（立体））。
 * 問題の文と数は、本の見開き（左：ステップ1、右：ステップ2・3・わな）に入る長さにしてある。文を長くするときは mk_pdf.sh 5 で確かめる。
 * 近似（5-28・5-29）の問題は「1次近似で」と書く（近似のしかたを決めないと、答えが1つに決まらない）。1に近い数は 5-29、そのほかは 5-28。
 * わなは、そのわざ自身では楽にならないものにして、答えに行き先（わざの番号か「わざなし」）を書く（第36回 N-3。dest）。
 * 「範囲」は教科書 5-7 にそろえて漢字（L-7）。 */
(function (M) {
  'use strict';
  const PART = 2;
  const F = M.F, PP = M.P;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(9));                        // 0.30000000004 → 0.3
  const strip = s => String(s).replace(/\$/g, '');
  const close = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const ev = (t, vars) => M.evalMath(strip(t), vars || {});
  const numOf = t => ev(t);
  const par = t => (/^-/.test(String(t)) ? `\\left(${t}\\right)` : t);   // マイナスはかっこごと
  const pw = (base, n) => (n === 1 ? `(${base})` : `(${base})^{${n}}`);    // (中身)^n。1乗は書かない
  const cf = c => (c === 1 ? '' : c === -1 ? '-' : `${c}`);                 // 係数（1・−1 は書かない）
  // 1次式 ax+b（a・b は整数。v は文字）
  const lin = (a, b, v) => `${cf(a)}${v || 'x'}${b > 0 ? `+${b}` : b < 0 ? `${b}` : ''}`;
  const linR = (b, a, v) => `${b}-${a === 1 ? '' : a}${v || 'x'}`;           // b−ax（a は正）
  const PT = (P, v) => PP.tex(P, v || 'x');
  const fdec = f => fmt(F.val(f));                                     // 分数を小数の文字に（わり切れる数だけに使う）
  const termDec = f => { let d = f[1]; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const decTeX = f => (termDec(f) ? fdec(f) : F.tex(f));
  // 数値の微分（検算用。中心差分）
  const dnum = (t, x, v) => { const h = 1e-5, a = ev(t, { [v || 'x']: x + h }), b = ev(t, { [v || 'x']: x - h }); return a == null || b == null ? null : (a - b) / (2 * h); };
  const d2num = (t, x, v) => { const h = 1e-3, a = ev(t, { [v]: x + h }), b = ev(t, { [v]: x }), c = ev(t, { [v]: x - h }); return a == null || b == null || c == null ? null : (a - 2 * b + c) / (h * h); };
  // 2つの式（文字 v）が、いくつかの値で同じか
  function sameFn(a, b, v, pts) {
    for (const x of (pts || [0.37, 0.83, 1.29, 2.11])) {
      const p = ev(a, { [v || 'x']: x }), q = ev(b, { [v || 'x']: x });
      if (p == null || q == null) return `式が読めない（${a} ／ ${b}）`;
      if (!close(p, q, 1e-6)) return `${v || 'x'}=${x} で ${a} と ${b} の値がちがう`;
    }
    return true;
  }
  // 区間を細かく調べて、いちばん大きい値・小さい値（検算用）。粗くならべてから、山・谷のまわりを3分割でしぼる
  function refine(f, a, b, sgn) {   // sgn=1 で山、-1 で谷
    for (let k = 0; k < 50; k++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (sgn * f(m1) < sgn * f(m2)) a = m1; else b = m2; }
    return (a + b) / 2;
  }
  function scan(f, a, b, n) {
    n = n || 600; const h = (b - a) / n;
    let mx = -Infinity, mn = Infinity, xmx = a, xmn = a;
    for (let k = 0; k <= n; k++) { const x = a + h * k, y = f(x); if (y > mx) { mx = y; xmx = x; } if (y < mn) { mn = y; xmn = x; } }
    const fix = (x0, sg) => { const x = refine(f, Math.max(a, x0 - h), Math.min(b, x0 + h), sg); return [x, f(x)]; };
    const [x1, y1] = fix(xmx, 1), [x2, y2] = fix(xmn, -1);
    if (y1 > mx) { mx = y1; xmx = x1; }
    if (y2 < mn) { mn = y2; xmn = x2; }
    return { mx, mn, xmx, xmn };
  }
  // 極大・極小（検算用）：粗くならべて、となりより大きい（小さい）所を見つけ、しぼる
  function localExt(f, a, b, n) {
    n = n || 240; const h = (b - a) / n, out = { max: [], min: [] }, ys = [];
    for (let k = 0; k <= n; k++) ys.push(f(a + k * h));
    for (let k = 1; k < n; k++) {
      if (ys[k] > ys[k - 1] && ys[k] >= ys[k + 1]) { const x = refine(f, a + (k - 1) * h, a + (k + 1) * h, 1); out.max.push([x, f(x)]); }
      if (ys[k] < ys[k - 1] && ys[k] <= ys[k + 1]) { const x = refine(f, a + (k - 1) * h, a + (k + 1) * h, -1); out.min.push([x, f(x)]); }
    }
    return out;
  }
  const yOf = q => { const m = /\$y=([^$]*)\$/.exec(q); return m ? m[1].replace(/\\left|\\right/g, '') : null; };
  // \frac{A}{B} を分ける（かっこの対応を見る）。式全体が1つの分数でなければ null
  function splitFrac(s) {
    s = s.replace(/^\\d?frac/, '');
    if (s === undefined || s[0] !== '{') return null;
    const grp = i => { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) return j; } } return -1; };
    const e1 = grp(0); if (e1 < 0 || s[e1 + 1] !== '{') return null;
    const e2 = grp(e1 + 1); if (e2 !== s.length - 1) return null;
    return [s.slice(1, e1), s.slice(e1 + 2, e2)];
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざ（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(5).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== PART || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 5-15
  // 位置の式 x（t の多項式。M.P）
  function posPoly(r, deg) {
    if (deg === 2) return PP.make(r.int(0, 9), r.intNot(-9, 9, v => v === 0), r.pick([1, 2, 3, 4, 5, -1, -2, -3, -5]));
    return PP.make(r.int(0, 6), r.int(-12, 12), r.intNot(-6, 6, v => v === 0), r.pick([1, 1, 2, -1]));
  }
  const DOTFITS = /速度|加速度|\\dot|\\ddot/;
  M.add({
    id: '5-15', part: PART, chap: '5-5①②④', stars: 1,
    title: '速度は位置を1回、加速度は2回微分（$\\dot{x}$・$\\ddot{x}$）',
    mark: '位置 $x$ が $t$ の式で与えられていて、速度・加速度（$\\dot{x}$・$\\ddot{x}$）や、ある時刻のそれらの値を聞かれる。',
    futsu: ['$t$ 秒から $t+h$ 秒までの平均の速度を作り、', '$h\\to0$ の極限で速度を出す。', '加速度も、速度で同じことをもう一度。'],
    raku: ['$x=t^3-6t^2+9t$', '$v=\\dot{x}=3t^2-12t+9$', '$a=\\ddot{x}=6t-12$', '2秒で $v=-3$、$a=0$'],
    why: '速度は位置を時間で微分したもの、加速度は速度を時間で微分したもの（5-5①②）。だから位置の式を1回微分すると速度、2回微分すると加速度になる（5-5④）。微分は $(t^n)\'=nt^{n-1}$ を1項ずつ使えばよい（5-4）。',
    caution: '時刻の値を先に入れてから微分しない（$t=2$ を入れると数になり、微分すると0）。式のまま微分してから、時刻を入れる。速度が0の時刻でも、加速度は0とはかぎらない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '22mm', s3: '22mm', trap: '30mm' },
    fits(q) { return /\$x=[^$]*t[^$]*\$/.test(q) && DOTFITS.test(q) && !/最も高|いちばん高|最高点|予想/.test(q) && !/\$x=[^$]*\)\^/.test(q); },
    steps: {
      // 1回微分（速度）
      s1(r) {
        const P = posPoly(r, r.chance(0.5) ? 2 : 3), X = PT(P, 't'), V = PT(PP.diff(P), 't'), dot = r.chance(0.3);
        return {
          q: dot ? `位置 $x=${X}$（m）のとき、$\\dot{x}$` : `位置 $x=${X}$（m）のとき、速度 $v$`, a: `$${V}$`, key: `x${X}`,
          easy: `1項ずつ微分して $${V}$`, easyCheck: 'last', calc: { kind: 'diff', f: X, x: 't' },
        };
      },
      // 2回微分（加速度）
      s2(r) {
        const P = posPoly(r, r.chance(0.3) ? 2 : 3), X = PT(P, 't'), V = PT(PP.diff(P), 't'), A = PT(PP.diff(PP.diff(P)), 't'), dd = r.chance(0.3);
        return {
          q: dd ? `位置 $x=${X}$（m）のとき、$\\ddot{x}$` : `位置 $x=${X}$（m）のとき、加速度 $a$`, a: `$${A}$`, key: `x${X}`,
          easy: `$v=${V}$ をもう1回微分して $${A}$`, easyCheck: false,
          verify: () => { for (const t of [0.4, 1.3, 2.7]) { const d = d2num(X, t, 't'), va = ev(A, { t }); if (va == null || Math.abs(d - va) > 1e-3 * Math.max(1, Math.abs(va))) return `t=${t} で2回微分が ${d}（答え ${va}）`; } return true; },
        };
      },
      // ある時刻の速度・加速度、速度が0になる2つの時刻（教科書 5-5 例題3・例題6）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const [al, be] = r.pick([[1, 3], [2, 4], [1, 5], [3, 5], [2, 6]]);
          const P = PP.make(r.int(0, 5), 3 * al * be, -3 * (al + be) / 2, 1), X = PT(P, 't');
          return {
            q: `位置 $x=${X}$（m）の物体の速度が0になるのは □ 秒と □ 秒`, a: `${al} 秒と ${be} 秒`, key: `x${X}`, boxw: '12mm',
            easy: `$v=${PT(PP.diff(P), 't')}=3(t-${al})(t-${be})$`, easyCheck: false,
            verify: () => ([al, be].every(t => close(dnum(X, t, 't'), 0, 1e-6)) && al < be) || '速度が0にならない',
          };
        }
        const P = posPoly(r, 3), X = PT(P, 't'), T = r.int(1, 4), V = PP.diff(P), A = PP.diff(V);
        const isV = k === 0, val = F.val(PP.at(isV ? V : A, T));
        return {
          q: `位置 $x=${X}$（m）の、${T}秒での${isV ? '速度' : '加速度'} $□\\,\\mathrm{${isV ? 'm/s' : 'm/s^2'}}$`, a: `$${val}$`, key: `x${X}`,
          easy: `$${isV ? 'v' : 'a'}=${PT(isV ? V : A, 't')}$ に $t=${T}$ を入れる`, easyCheck: false,
          verify: () => close(isV ? dnum(X, T, 't') : d2num(X, T, 't'), val, 1e-4) || `数値の微分とちがう（${val}）`,
        };
      },
      // わな：速度の式から位置（微分ではなく積分。はじめの位置で定数を決める → 5-57）
      trap(r) {
        const a = r.pick([3, 6, 9]), b = 2 * r.int(-3, 3), c = r.int(-5, 5), x0 = r.int(1, 9);
        const V = PP.make(c, b, a), X = PP.integ(V); X[0] = fr(x0);
        const VT = PT(V, 't'), XT = PT(X, 't');
        return dest({
          q: `速度 $v=${VT}$（m/s）、$t=0$ のとき位置 $${x0}\\,\\mathrm{m}$。位置 $x$`, a: `$${XT}$`,
          verify: () => ([0.5, 1.5, 2.5].every(t => close(dnum(XT, t, 't'), ev(VT, { t }), 1e-6)) && close(ev(XT, { t: 0 }), x0)) || '微分して v にならないか、はじめの位置がちがう',
        }, '5-15', `速度から位置へは、微分ではなく逆向き（積分）。はじめの位置で定数を決める`, ['5-57']);
      },
    },
  });

  // ================================================================ 5-16
  const KMH = v => fmt(v * 3.6);                                     // m/s → km/h（5の倍数の m/s は整数）
  M.add({
    id: '5-16', part: PART, chap: '5-5② 例題2', stars: 1,
    title: '平均の加速度は「速度の変化÷時間」（km/h は先に m/s に）',
    mark: '「□秒で時速□kmになった」「□秒で止まった」と、平均の加速度。',
    futsu: ['時速を「km/h÷s」のまま計算し、', 'あとで単位を直そうとする', '（km・h・s がまざる）。'],
    raku: ['時速72 km は $72\\div3.6=20\\,\\mathrm{m/s}$', '$\\dfrac{20-0}{8}=2.5\\,\\mathrm{m/s^2}$', '止まるときは「あと－まえ」でマイナス'],
    why: '平均の加速度は $\\dfrac{\\Delta v}{\\Delta t}$（5-5②）。平均の速さ $\\dfrac{\\Delta x}{\\Delta t}$ の $x$ を $v$ にかえただけ。単位は $\\mathrm{m/s}\\div\\mathrm{s}=\\mathrm{m/s^2}$ なので、速度を先に m/s にそろえる（$\\times1000\\div3600$ は $\\div3.6$）。',
    caution: '「まえ－あと」にしない。おそくなるとき（止まるとき）の加速度はマイナス。時速を秒速にするとき、$\\times3.6$ と $\\div3.6$ を逆にしない（$72\\times3.6$ では新幹線よりずっと速い）。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /平均の加速度/.test(q); },
    steps: {
      // m/s で（止まっていたところから）
      s1(r) {
        const T = r.int(2, 10), a = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]), V = a * T, obj = r.pick(['車', '自転車', '電車', 'バス']);
        if (V > (obj === '自転車' ? 10 : 30) || V !== Math.round(V) || a > { 車: 4, 自転車: 2, 電車: 1.5, バス: 1.5 }[obj]) return null;
        return {
          q: `止まっていた${obj}が、${T}秒で $${V}\\,\\mathrm{m/s}$ に。平均の加速度 $□\\,\\mathrm{m/s^2}$`, a: `$${fmt(a)}$`, key: `${V}:${T}`,
          easy: `$\\frac{${V}-0}{${T}}=${fmt(a)}$`, verify: () => close((V - 0) / T, a) || 'ちがう',
        };
      },
      // 時速から（教科書 5-5 例題2）
      s2(r) {
        const V = r.pick([10, 15, 20, 25, 30]), T = r.pick([2, 4, 5, 8, 10, 20, 25, 30]), a = V / T;
        if (a > 6 || !termDec(fr(V, T)) || fmt(a).length > 5) return null;
        const obj = r.pick(['車', '電車', 'バス']);
        if (a > (obj === '車' ? 4 : 1.5)) return null;
        return {
          q: `止まっていた${obj}が、${T}秒で時速 $${KMH(V)}\\,\\mathrm{km}$ に。平均の加速度 $□\\,\\mathrm{m/s^2}$`, a: `$${fmt(a)}$`, key: `${V}:${T}`,
          easy: `$${KMH(V)}\\div3.6=${V}$、$\\frac{${V}}{${T}}=${fmt(a)}$`, easyCheck: 'last',
          verify: () => close((KMH(V) * 1000 / 3600) / T, a) || 'ちがう',   // 別の道すじ：×1000÷3600
        };
      },
      // 止まる（マイナス）・時速から時速へ
      s3(r) {
        if (r.chance(0.6)) {
          const V = r.pick([10, 15, 20, 25, 30]), T = r.pick([2, 4, 5, 8, 10]), a = -V / T;
          if (!termDec(fr(V, T)) || -a > 8) return null;
          return {
            q: `時速 $${KMH(V)}\\,\\mathrm{km}$ で走っていた車がブレーキをかけ、${T}秒で止まった。平均の加速度 $□\\,\\mathrm{m/s^2}$`, a: `$${fmt(a)}$`, key: `b${V}:${T}`,
            easy: `$${KMH(V)}\\div3.6=${V}$、$\\frac{0-${V}}{${T}}=${fmt(a)}$`, easyCheck: 'last',
            verify: () => close((0 - KMH(V) / 3.6) / T, a) || 'ちがう',
          };
        }
        const V1 = r.pick([5, 10, 15, 20]), V2 = V1 + r.pick([5, 10, 15, 20]), T = r.pick([2, 4, 5, 10]), a = (V2 - V1) / T;
        if (V2 > 35 || !termDec(fr(V2 - V1, T))) return null;
        return {
          q: `時速 $${KMH(V1)}\\,\\mathrm{km}$ で走っていた車が、${T}秒後に時速 $${KMH(V2)}\\,\\mathrm{km}$ になった。平均の加速度 $□\\,\\mathrm{m/s^2}$`, a: `$${fmt(a)}$`, key: `c${V1}:${V2}:${T}`,
          easy: `$${V1}\\,\\mathrm{m/s}$ から $${V2}\\,\\mathrm{m/s}$ へ。$\\frac{${V2}-${V1}}{${T}}=${fmt(a)}$`, easyCheck: 'last',
          verify: () => close((KMH(V2) - KMH(V1)) / 3.6 / T, a) || 'ちがう',
        };
      },
      // わな：加速度ではなく進んだ距離（v-t グラフの三角形 → 5-32）
      trap(r) {
        const T = r.pick([4, 6, 8, 10]), V = r.pick([10, 12, 16, 20]), D = V * T / 2;
        return dest({
          q: `止まっていた車が、一定の加速度で、${T}秒で速度 $${V}\\,\\mathrm{m/s}$ になった。そのあいだに進んだ距離 $□\\,\\mathrm{m}$`, a: `$${D}$`,
          verify: () => { let x = 0; const n = 100, a = V / T, h = T / n; for (let k = 0; k < n; k++) x += a * (k + 0.5) * h * h; return close(x, D, 1e-6) || `距離は ${x}`; },
        }, '5-16', `加速度ではなく距離を聞いている。$v$-$t$ グラフの三角形 $\\frac{1}{2}\\times${T}\\times${V}=${D}$`, ['5-32']);
      },
    },
  });

  // ================================================================ 5-17
  // 投げ上げ：x = h0 + v0 t − (g/2) t²。いちばん高いのは k 秒後
  function throwUp(r, opt) {
    opt = opt || {};
    const g49 = !opt.g10 && r.chance(0.2);
    const k = g49 ? r.int(1, 4) : r.pick([0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6]);
    const v0 = g49 ? 9.8 * k : 10 * k, c = g49 ? 4.9 : 5, h0 = opt.h0 ? r.pick([2, 5, 10, 15, 20]) : 0;
    const H = h0 + c * k * k;
    const X = `${h0 ? `${h0}+` : ''}${fmt(v0)}t-${c}t^2`;
    return { k, v0: +fmt(v0), c, h0, H: +fmt(H), X, g49 };
  }
  const xmaxNum = (X, T) => scan(t => ev(X, { t }), 0, T);
  M.add({
    id: '5-17', part: PART, chap: '5-5④・5-7①', stars: 1,
    title: 'いちばん高い所は $v=0$ の時刻：高さは「$\\dfrac{v_0}{2}\\times$時間」でもよい',
    mark: '投げ上げの高さの式（$x=30t-5t^2$）と、「最も高くなる時刻」「最も高い所の高さ」。',
    futsu: ['1秒ごとに高さを計算して表にし、', 'いちばん大きい所をさがす', '（3.5秒のような時刻では見落とす）。'],
    raku: ['$x=30t-5t^2$ → $\\dot{x}=30-10t=0$', '$t=3$ 秒', '高さ $\\frac{30}{2}\\times3=45\\,\\mathrm{m}$'],
    why: 'いちばん高い所では、上がるのから下がるのに変わるので、速度 $\\dot{x}$ が0（5-7①）。速度は $v_0$ から0まで一定の割合でへるので、そのあいだの平均の速さは $\\frac{v_0}{2}$。高さは「平均の速さ×時間」でも出せる（式に入れても同じ）。',
    caution: '加速度は最も高い所でも0ではない（いつも下向きに $g$）。投げた所の高さがあるときは、その高さをたす。$\\frac{v_0}{2}\\times$時間 は、投げた所から上がった高さ。',
    counts: { s1: 7, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /最も高|いちばん高|最高点/.test(q) && /\$x=[^$]*t/.test(q); },
    steps: {
      // 最も高くなる時刻
      s1(r) {
        const o = throwUp(r);
        return {
          q: `ボールの高さ $x=${o.X}$（m）。最も高いのは □ 秒後`, a: `$${fmt(o.k)}$`, key: `v${o.v0}`,
          easy: `$\\dot{x}=${o.v0}-${fmt(2 * o.c)}t=0$ → $t=${fmt(o.k)}$`, easyCheck: false,
          verify: () => close(xmaxNum(o.X, 2 * o.k + 1).xmx, o.k, 1e-4) || '最も高い時刻がちがう',
        };
      },
      // 最も高い所の高さ
      s2(r) {
        const o = throwUp(r);
        return {
          q: `ボールの高さ $x=${o.X}$（m）。最も高い所の高さ $□\\,\\mathrm{m}$`, a: `$${fmt(o.H)}$`, key: `v${o.v0}`,
          easy: `$t=${fmt(o.k)}$ 秒。$\\frac{${o.v0}}{2}\\times${fmt(o.k)}=${fmt(o.H)}$`, easyCheck: 'last',
          verify: () => close(xmaxNum(o.X, 2 * o.k + 1).mx, o.H, 1e-6) || '最も高い所の高さがちがう',
        };
      },
      // 投げた所に高さがある・時刻と高さの両方
      s3(r) {
        if (r.chance(0.5)) {
          const o = throwUp(r, { h0: true, g10: true });
          return {
            q: `高さ $${o.h0}\\,\\mathrm{m}$ の所から真上に投げたボールの高さが $x=${o.X}$（m）。最も高い所の高さ $□\\,\\mathrm{m}$`, a: `$${fmt(o.H)}$`, key: `h${o.h0}v${o.v0}`,
            easy: `$t=${fmt(o.k)}$ 秒。$${o.h0}+\\frac{${o.v0}}{2}\\times${fmt(o.k)}=${fmt(o.H)}$`, easyCheck: 'last',
            verify: () => close(xmaxNum(o.X, 2 * o.k + 1).mx, o.H, 1e-6) || '最も高い所の高さがちがう',
          };
        }
        const o = throwUp(r);
        return {
          q: `真上に投げたボールの高さが $x=${o.X}$（m）。最も高くなるのは □ 秒後で、その高さは $□\\,\\mathrm{m}$`, a: `${fmt(o.k)} 秒後、$${fmt(o.H)}\\,\\mathrm{m}$`, key: `w${o.v0}`, boxw: '12mm',
          easy: `$\\dot{x}=0$ → $t=${fmt(o.k)}$、$\\frac{${o.v0}}{2}\\times${fmt(o.k)}=${fmt(o.H)}$`, easyCheck: false,
          verify: () => { const s = xmaxNum(o.X, 2 * o.k + 1); return (close(s.xmx, o.k, 1e-4) && close(s.mx, o.H, 1e-6)) || 'ちがう'; },
        };
      },
      // わな：最も高い所より後の時刻の速度（v=0 ではない。マイナス → 5-15）
      trap(r) {
        const k = r.int(2, 4), v0 = 10 * k, T = k + r.int(1, 2), V = v0 - 10 * T, X = `${v0}t-5t^2`;
        return dest({
          q: `ボールの高さ $x=${X}$（m）。${T}秒での速度 $□\\,\\mathrm{m/s}$`, a: `$${V}$`,
          verify: () => close(dnum(X, T, 't'), V, 1e-6) || '速度がちがう',
        }, '5-17', `最も高い時刻（${k}秒）ではない。$\\dot{x}=${v0}-10t$ に $t=${T}$ を入れる。下向きなのでマイナス`);
      },
    },
  });

  // ================================================================ 5-18
  // 一定の加速度：x = x0 + v0 t + a t²/2（M.P）
  const motion = (x0, v0, a) => PP.make(x0, v0, fr(a, 2));
  // 別の道すじ：細かい時間で、速度と位置を1歩ずつ進める（加速度が一定なら、この進め方で正しい値になる）
  function stepMove(x0, v0, accel, T, n) {
    n = n || 400; let x = x0, v = v0; const h = T / n;
    for (let k = 0; k < n; k++) { const t = k * h, a0 = accel(t), a1 = accel(t + h); x += v * h + a0 * h * h / 3 + a1 * h * h / 6; v += (a0 + a1) / 2 * h; }
    return { x, v };
  }
  M.add({
    id: '5-18', part: PART, chap: '5-5⑦', stars: 1,
    title: '加速度が一定なら $x=x_0+v_0t+\\dfrac12at^2$、$v=v_0+at$ に入れるだけ',
    mark: '「加速度が□で一定」と、はじめの位置・はじめの速度。',
    futsu: ['1秒ごとに速度と位置を計算して、', '表を少しずつのばしていく。'],
    raku: ['$x_0=2$、$v_0=3$、$a=4$', '$x=2+3t+\\frac{1}{2}\\times4t^2=2t^2+3t+2$', '$v=3+4t$。微分して確かめる'],
    why: '$\\frac{1}{2}at^2$ は2回微分すると $a$、$v_0t$ は2回微分すると0、定数 $x_0$ は1回微分で0になる（5-5⑦）。だから $x=x_0+v_0t+\\frac{1}{2}at^2$ は、加速度が $a$ で一定、$t=0$ で位置 $x_0$・速度 $v_0$ の運動を表す。止まるのは $v=0$ のとき。',
    caution: '$\\frac{1}{2}$ をつけ忘れない。ブレーキの加速度はマイナスのまま入れる。加速度が $a=6t$ のように時間で変わるときは、この式は使えない。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '28mm', s2: '14mm', s3: '14mm', trap: '14mm' },
    fits(q) { return ((/加速度/.test(q) && /一定/.test(q) && /はじめ|止まっていた|ブレーキ/.test(q)) || /x_0=/.test(q)) && !/\$a=\d*t\$/.test(q); },
    steps: {
      // x（または v）を t の式で（教科書 5-5 例題5）
      s1(r) {
        const a = r.pick([2, 4, 6, 8, 10, -2, -4, -6]), x0 = r.int(0, 10), v0 = r.int(1, 10), isX = r.chance(0.7);
        const P = motion(x0, v0, a), XT = PT(P, 't'), VT = PT(PP.diff(P), 't');
        return {
          q: `加速度が $${a}\\,\\mathrm{m/s^2}$ で一定。はじめの位置 $${x0}\\,\\mathrm{m}$、はじめの速度 $${v0}\\,\\mathrm{m/s}$。${isX ? '位置 $x$' : '速度 $v$'}`, a: `$${isX ? XT : VT}$`, key: `${a}:${x0}:${v0}`,
          easy: isX ? `$${x0}+${v0}t+\\frac{1}{2}\\times${par(a)}t^2=${XT}$` : `$${v0}+${par(a)}t=${VT}$`,
          verify: () => { const s = stepMove(x0, v0, () => a, 2.5); return close(ev(isX ? XT : VT, { t: 2.5 }), isX ? s.x : s.v, 1e-6) || '式がちがう'; },
        };
      },
      // ある時刻の位置・速度
      s2(r) {
        const a = r.pick([2, 4, 6, -2, -4]), x0 = r.int(0, 10), v0 = r.int(1, 12), T = r.int(1, 4), isX = r.chance(0.6);
        const P = motion(x0, v0, a), val = F.val(PP.at(isX ? P : PP.diff(P), T));
        if (isX && val < 0) return null;
        return {
          q: `$a=${a}\\,\\mathrm{m/s^2}$、$x_0=${x0}\\,\\mathrm{m}$、$v_0=${v0}\\,\\mathrm{m/s}$。${T}秒での${isX ? `位置 $□\\,\\mathrm{m}$` : `速度 $□\\,\\mathrm{m/s}$`}`, a: `$${fmt(val)}$`, key: `${a}:${x0}:${v0}`,
          easy: `$${isX ? `x=${PT(P, 't')}` : `v=${PT(PP.diff(P), 't')}`}$ に $t=${T}$`, easyCheck: false,
          verify: () => { const s = stepMove(x0, v0, () => a, T); return close(isX ? s.x : s.v, val, 1e-6) || '値がちがう'; },
        };
      },
      // ブレーキで止まるまで（教科書 5-5 例題6）・落ちる物
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const T = r.int(1, 4), D = fmt(4.9 * T * T);
          return {
            q: `止まっていた物が、加速度 $9.8\\,\\mathrm{m/s^2}$（一定）で落ちはじめた。${T}秒で落ちる距離 $□\\,\\mathrm{m}$`, a: `$${D}$`, key: `g${T}`,
            easy: `$\\frac{1}{2}\\times9.8\\times${T}^2=${D}$`,
            verify: () => close(stepMove(0, 0, () => 9.8, T).x, +D, 1e-6) || 'ちがう',
          };
        }
        const a = r.pick([-2, -3, -4, -5, -6, -8]), T = r.int(2, 8), v0 = -a * T, D = v0 * T / 2;
        if (v0 > 30 || v0 < 8) return null;
        const kmh = v0 % 5 === 0 && r.chance(0.4), vT = kmh ? `時速 $${KMH(v0)}\\,\\mathrm{km}$` : `秒速 $${v0}\\,\\mathrm{m}$`;
        const askT = k === 0;
        return {
          q: `${vT}で走る車が、加速度 $${a}\\,\\mathrm{m/s^2}$（一定）でブレーキをかけた。止まるまでの${askT ? '時間 □ 秒' : `距離 $□\\,\\mathrm{m}$`}`, a: `$${fmt(askT ? T : D)}$`, key: `b${a}:${v0}`,
          easy: askT ? `$${v0}${a}t=0$ → $t=${T}$` : `$${v0}${a}t=0$ → ${T}秒、$${v0}\\times${T}+\\frac{1}{2}\\times(${a})\\times${T}^2=${fmt(D)}$`, easyCheck: false,
          verify: () => { const s = stepMove(0, v0, () => a, T); return (Math.abs(s.v) < 1e-9 && close(s.x, D, 1e-6)) || 'ちがう'; },
        };
      },
      // わな：加速度が時間で変わる（a=ct。2回積分 → 5-58）
      trap(r) {
        const c = r.pick([2, 4, 6]), v0 = r.int(1, 5), T = r.int(1, 3), V = v0 + c * T * T / 2;
        return dest({
          q: `$a=${c}t$（$\\mathrm{m/s^2}$）、$v_0=${v0}\\,\\mathrm{m/s}$ のとき、${T}秒での速度 $□\\,\\mathrm{m/s}$`, a: `$${V}$`,
          verify: () => close(stepMove(0, v0, t => c * t, T).v, V, 1e-6) || '速度がちがう',
        }, '5-18', `加速度が時間で変わるので、$v_0+at$ は使えない。積分して $v=${v0}+${c / 2 === 1 ? '' : c / 2}t^2$`, ['5-58']);
      },
    },
  });

  // ================================================================ 5-19
  const isMono = P => P.filter(c => c[0] !== 0).length === 1;
  const wrapP = P => (isMono(P) ? PT(P) : `(${PT(P)})`);
  // 積の微分の楽な形 f'g+fg' の TeX（数で確かめられる形）
  function prodEasy(f, g) {
    const fp = PP.diff(f), gp = PP.diff(g), fpT = PT(fp), gpT = PT(gp);
    const t1 = fpT === '1' ? `(${PT(g)})` : `${isMono(fp) ? fpT : `(${fpT})`}${isMono(g) && fpT !== '1' ? `\\times${PT(g)}` : `(${PT(g)})`}`;
    const t2 = `${wrapP(f)}\\times${isMono(gp) ? par(gpT) : `(${gpT})`}`;
    return `${t1}+${t2}`;
  }
  const yq = Y => `$y=${Y}$ のとき、$y'$`;
  M.add({
    id: '5-19', part: PART, chap: '5-6②', stars: 1,
    title: '積の微分は「片方ずつ微分してたす」（微分どうしをかけない）',
    mark: '2つのかっこ（$x$ の式）のかけ算。展開すると長くなる式。',
    futsu: ['かっこを全部展開して、', '1項ずつ微分する', '（項が多いと、展開でまちがえやすい）。'],
    raku: ['$y=(2x+1)(x^2-3)$', '$y\'=2(x^2-3)+(2x+1)\\times2x$', '$\\phantom{y\'}=6x^2+2x-6$'],
    why: '$fg$ を、横 $f$・たて $g$ の長方形の面積と見る。$x$ が少し変わると、ふえる面積は「横がのびた帯 $g\\,\\Delta f$」と「たてがのびた帯 $f\\,\\Delta g$」と、すみの小さな四角。すみの四角は0に近づくので、$\\{fg\\}\'=f\'g+fg\'$（5-6②）。',
    caution: '$(fg)\'=f\'g\'$ としない（$x^2\\cdot x^3$ の微分は $2x\\cdot3x^2=6x^3$ ではなく $5x^4$）。かっこの中に $x$ の式の $n$ 乗があるときは、その微分に合成関数の微分（5-20・5-21）を使う。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '26mm', s2: '26mm', s3: '16mm', trap: '30mm' }, boxh: { trap: '12mm' },
    fits(q) {
      if (/P=VI/.test(q)) return true;
      const e = yOf(q); if (!e) return false;
      return /^-?\d*\(([^()]*)\)(\^\{\d+\})?\(([^()]*)\)(\^\{\d+\})?$/.test(e) || /^-?\d*x(\^\{\d+\})?\(([^()]*x[^()]*)\)(\^\{\d+\})?$/.test(e);
    },
    steps: {
      // 1次式×2次式（教科書 5-6 例題1）
      s1(r) {
        const f = PP.make(r.intNot(-5, 5, v => v === 0), r.pick([1, 2, 3])), g = PP.make(r.intNot(-6, 6, v => v === 0), 0, r.pick([1, 1, 2, 3]));
        const ans = PT(PP.diff(PP.mul(f, g))), Y = `(${PT(f)})(${PT(g)})`;
        return { q: yq(Y), a: `$${ans}$`, key: [PT(f), PT(g)].sort().join('*'), easy: `$${prodEasy(f, g)}=${ans}$`, calc: { kind: 'diff', f: Y } };
      },
      // x^m×1次式、2次式×2次式、1次式×(2次式)
      s2(r) {
        const k = r.int(0, 2);
        let f, g;
        if (k === 0) { f = PP.make(r.intNot(-6, 6, v => v === 0), 0, 1); g = PP.make(r.intNot(-6, 6, v => v === 0), 0, 1); if (F.eq(f[0], g[0])) return null; }
        else if (k === 1) { const m = r.pick([2, 3]); f = Array.from({ length: m + 1 }, (_, i) => fr(i === m ? 1 : 0)); g = PP.make(r.intNot(-6, 6, v => v === 0), r.pick([2, 3, 4, 5])); }
        else { f = PP.make(r.intNot(-5, 5, v => v === 0), 1); g = PP.make(r.intNot(-5, 5, v => v === 0), r.intNot(-4, 4, v => v === 0), 1); }
        const ans = PT(PP.diff(PP.mul(f, g))), Y = k === 1 ? `${PT(f)}(${PT(g)})` : `(${PT(f)})(${PT(g)})`;
        return { q: yq(Y), a: `$${ans}$`, key: [PT(f), PT(g)].sort().join('*'), easy: `$${prodEasy(f, g)}=${ans}$`, calc: { kind: 'diff', f: Y } };
      },
      // 電力 P=VI の変わる速さ（5-6 物理）・ある点の傾き
      s3(r) {
        if (r.chance(0.5)) {
          const a = r.int(1, 3), b = r.int(1, 6), c = r.int(1, 3), d = r.int(1, 5), T = r.int(1, 3);
          const val = a * (c * T + d) + (a * T + b) * c, VT = lin(a, b, 't'), IT = lin(c, d, 't');
          return {
            q: `電圧が $V=${VT}$、電流が $I=${IT}$ で変わるとき、電力 $P=VI$ の変わる速さ $\\frac{\\dd P}{\\dd t}$ の、$t=${T}$ での値`, a: `$${val}$`, key: `p${VT}*${IT}:${T}`,
            easy: `$${a}\\times${c * T + d}+${a * T + b}\\times${c}=${val}$`,
            verify: () => close(dnum(`(${VT})(${IT})`, T, 't'), val, 1e-6) || 'ちがう',
          };
        }
        const f = PP.make(r.intNot(-4, 4, v => v === 0), 1), g = PP.make(r.int(1, 5), 0, 1), x0 = r.int(-2, 3), Y = `(${PT(g)})(${PT(f)})`;
        const val = F.val(PP.at(PP.diff(PP.mul(f, g)), x0));
        return {
          q: `$y=${Y}$ の、$x=${x0}$ での $y'$ の値`, a: `$${val}$`, key: `v${Y}:${x0}`,
          easy: `$y'=${prodEasy(g, f)}$ に $x=${x0}$`, easyCheck: false,
          verify: () => close(dnum(Y, x0), val, 1e-6) || 'ちがう',
        };
      },
      // わな：かけ算ではなく、ルートの中に x の式（→ 5-22）
      trap(r) {
        const c = r.pick([1, 4, 9, 16, 25, 3, 5]), Y = `\\sqrt{x^{2}+${c}}`, A = `\\frac{x}{\\sqrt{x^{2}+${c}}}`;
        return dest({ q: yq(Y), a: `$${A}$`, calc: { kind: 'diff', f: Y } }, '5-19', `かけ算ではなく、ルートの中に $x$ の式。外側 $\\sqrt{u}$ と内側 $x^{2}+${c}$`);
      },
    },
  });

  // ================================================================ 5-20
  // y の式が (中身)^n か（係数がついてもよい）。中身を返す
  const powOf = e => { const m = e && /^-?\d*\(([^()]*)\)\^\{(\d+)\}$/.exec(e); return m && +m[2] >= 2 ? m[1] : null; };
  const isLinIn = s => /x/.test(s) && !/x\^|\\sqrt/.test(s);
  M.add({
    id: '5-20', part: PART, chap: '5-6⑥', stars: 1,
    title: '$(ax+b)^n$ は $n(ax+b)^{n-1}\\times a$（展開しない）',
    mark: 'かっこの中が1次式（$2x-5$、$4-x$）で、3乗以上。',
    futsu: ['$(2x-5)^4$ を展開して', '$16x^4-160x^3+600x^2$', '$-1000x+625$ にし、', '1項ずつ微分する。'],
    raku: ['$(2x-5)^4$ → $4(2x-5)^3\\times2$', '$=8(2x-5)^3$', '$(4-x)^3$ → $3(4-x)^2\\times(-1)$'],
    why: 'かっこの中 $u=ax+b$ を内側、$u^n$ を外側と見る合成関数。外側の微分 $nu^{n-1}$ に、内側の微分 $a$ をかける（5-6⑥）。歯車の回る速さの比をかけ算でつなぐのと同じ。',
    caution: '内側の微分 $a$ をかけ忘れない（$\\{(2x-5)^4\\}\'=4(2x-5)^3$ はまちがい）。$4-x$ の微分は $-1$ なので、マイナスがつく。答えに $u$ を残さない。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '24mm', s2: '24mm', s3: '16mm', trap: '26mm' },
    fits(q) { const m = /\$x=([^$]*)\$/.exec(q), u = powOf(yOf(q)) || powOf(m && m[1].replace(/t/g, 'x')); return !!u && isLinIn(u); },
    steps: {
      // (ax+b)^n
      s1(r) {
        const a = r.pick([1, 2, 2, 3, 3, 4, 5]), b = r.intNot(-9, 9, v => v === 0), n = r.int(3, 6), U = lin(a, b), Y = pw(U, n), A = `${n * a}${pw(U, n - 1)}`;
        return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$${n}${pw(U, n - 1)}\\times${a}=${A}$`, calc: { kind: 'diff', f: Y } };
      },
      // (b−ax)^n・定数倍（教科書 5-6 例題2（2））
      s2(r) {
        if (r.chance(0.6)) {
          const a = r.pick([1, 1, 2, 3]), b = r.int(1, 9), n = r.int(3, 5), U = linR(b, a), Y = pw(U, n), A = `-${n * a}${pw(U, n - 1)}`;
          return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$${n}${pw(U, n - 1)}\\times(-${a})=${A}$`, calc: { kind: 'diff', f: Y } };
        }
        const k = r.pick([2, 3, 5, -1, -2]), a = r.pick([2, 3]), b = r.intNot(-7, 7, v => v === 0), n = r.int(3, 5), U = lin(a, b), Y = `${cf(k)}${pw(U, n)}`, A = `${k * n * a}${pw(U, n - 1)}`;
        return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$${k === -1 ? '-' : `${k}\\times`}${n}${pw(U, n - 1)}\\times${a}=${A}$`, calc: { kind: 'diff', f: Y } };
      },
      // ある点の接線の傾き・位置の式の速度
      s3(r) {
        const a = r.pick([1, 2, 3]), b = r.intNot(-5, 5, v => v === 0), n = r.int(3, 4), x0 = r.int(-1, 2), inner = a * x0 + b;
        if (Math.abs(inner) > 3 || inner === 0) return null;
        const val = n * a * Math.pow(inner, n - 1);
        if (r.chance(0.5)) {
          const Y = pw(lin(a, b), n);
          return {
            q: `$y=${Y}$ のグラフの、$x=${x0}$ の点での接線の傾き`, a: `$${val}$`, key: `${Y}:${x0}`,
            easy: `$y'=${n * a}${pw(lin(a, b), n - 1)}$ に $x=${x0}$`, easyCheck: false, verify: () => close(dnum(Y, x0), val, 1e-6) || 'ちがう',
          };
        }
        if (x0 < 0 || inner < 0) return null;
        const X = pw(lin(a, b, 't'), n);
        return {
          q: `位置が $x=${X}$（m）の物体の、${x0}秒での速度 $□\\,\\mathrm{m/s}$`, a: `$${val}$`, key: `${X}:${x0}`,
          easy: `$\\dot{x}=${n * a}${pw(lin(a, b, 't'), n - 1)}$ に $t=${x0}$`, easyCheck: false, verify: () => close(dnum(X, x0, 't'), val, 1e-6) || 'ちがう',
        };
      },
      // わな：中身が1次式でない（→ 5-21）
      trap(r) {
        const c = r.intNot(-5, 5, v => v === 0), n = r.int(3, 4), U = `x^{2}${c > 0 ? '+' : ''}${c}`, Y = pw(U, n), A = `${2 * n}x${pw(U, n - 1)}`;
        return dest({ q: yq(Y), a: `$${A}$`, calc: { kind: 'diff', f: Y } }, '5-20', `中身 $${U}$ は1次式ではない。内側の微分は $2x$ で、$${n}${pw(U, n - 1)}\\times2x$`);
      },
    },
  });

  // ================================================================ 5-21
  const sq2 = c => `x^{2}${c > 0 ? '+' : ''}${c}`;
  M.add({
    id: '5-21', part: PART, chap: '5-6⑤⑩', stars: 1,
    title: '中身のある $n$ 乗は「外側の微分×中身の微分」',
    mark: 'かっこの中が $x^2+1$・$x^3-2$ など、1次式でない式の $n$ 乗。',
    futsu: ['$(x^2+1)^4$ を展開して', '$x^8+4x^6+6x^4+4x^2+1$ にし、', '1項ずつ微分する。'],
    raku: ['$(x^2+1)^4$：内側 $u=x^2+1$、外側 $u^4$', '$4(x^2+1)^3\\times2x$', '$=8x(x^2+1)^3$'],
    why: '$\\dfrac{\\dd y}{\\dd x}=\\dfrac{\\dd y}{\\dd u}\\times\\dfrac{\\dd u}{\\dd x}$（合成関数の微分。5-6⑤）。外側 $u^n$ を $u$ で微分して $nu^{n-1}$、内側 $x^2+1$ を $x$ で微分して $2x$。かけて、$u$ を $x$ の式にもどす。表の順に「内側・外側・外側の微分・内側の微分」をうめるとまちがえない（5-6⑩）。',
    caution: '内側の微分（$2x$ など）をかけ忘れない。答えに $u$ を残さない。内側が1次式なら、内側の微分は数（5-20）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '26mm', s2: '30mm', s3: '16mm', trap: '34mm' },
    fits(q) { const u = powOf(yOf(q)); return !!u && /x\^/.test(u); },
    steps: {
      // (x²+c)^n
      s1(r) {
        const c = r.intNot(-9, 9, v => v === 0), n = r.int(3, 5), U = sq2(c), Y = pw(U, n), A = `${2 * n}x${pw(U, n - 1)}`;
        return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$${n}${pw(U, n - 1)}\\times2x=${A}$`, calc: { kind: 'diff', f: Y } };
      },
      // (ax²+c)^n・(x³+c)^n・(x²+bx)^n
      s2(r) {
        const k = r.int(0, 2), n = r.int(2, 4);
        let U, A, ins;
        if (k === 0) { const a = r.pick([2, 3]), c = r.intNot(-5, 5, v => v === 0); U = `${a}x^{2}${c > 0 ? '+' : ''}${c}`; ins = `${2 * a}x`; A = `${2 * a * n}x${pw(U, n - 1)}`; }
        else if (k === 1) { const c = r.intNot(-5, 5, v => v === 0); U = `x^{3}${c > 0 ? '+' : ''}${c}`; ins = '3x^{2}'; A = `${3 * n}x^{2}${pw(U, n - 1)}`; }
        else { const b = r.intNot(-5, 5, v => v === 0); U = `x^{2}${b > 0 ? '+' : ''}${cf(b)}x`; ins = `(${lin(2, b)})`; A = `${n}${pw(U, n - 1)}(${lin(2, b)})`; }
        const Y = pw(U, n);
        return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$${n}${pw(U, n - 1)}\\times${ins}=${A}$`, calc: { kind: 'diff', f: Y } };
      },
      // ある点の傾き
      s3(r) {
        const c = r.intNot(-4, 4, v => v === 0), n = r.int(2, 4), x0 = r.pick([1, -1, 2]), inner = x0 * x0 + c, val = n * Math.pow(inner, n - 1) * 2 * x0;
        if (inner === 0 || Math.abs(val) > 500) return null;
        const Y = pw(sq2(c), n);
        return {
          q: `$y=${Y}$ のグラフの、$x=${x0}$ の点での接線の傾き`, a: `$${val}$`, key: `${Y}:${x0}`,
          easy: `$y'=${2 * n}x${pw(sq2(c), n - 1)}$ に $x=${x0}$`, easyCheck: false, verify: () => close(dnum(Y, x0), val, 1e-6) || 'ちがう',
        };
      },
      // わな：積と合成（x(x+b)^n → 5-19、かけるほうに 5-20）
      trap(r) {
        const b = r.intNot(-4, 4, v => v === 0), n = r.int(2, 4), U = lin(1, b), Y = `x${pw(U, n)}`, A = `${pw(U, n)}+${n}x${pw(U, n - 1)}`;
        return dest({ q: yq(Y), a: `$${A}$`, calc: { kind: 'diff', f: Y }, boxh: '11mm' }, '5-21', `$x$ と $${pw(U, n)}$ のかけ算。積の微分で、$${pw(U, n)}$ の微分に合成関数の微分`, ['5-20']);
      },
    },
  });

  // ================================================================ 5-22
  // ルートの式 √(ax+b) の微分：a/(2√…) を約分した形
  const sqrtLinD = (a, U) => (a % 2 === 0 ? `\\frac{${a / 2}}{\\sqrt{${U}}}` : `\\frac{${a}}{2\\sqrt{${U}}}`);
  M.add({
    id: '5-22', part: PART, chap: '5-6⑥', stars: 1,
    title: '$\\sqrt{\\text{中身}}$ は $\\dfrac{(\\text{中身})\'}{2\\sqrt{\\text{中身}}}$、$\\dfrac{1}{\\text{中身}}$ は $-\\dfrac{(\\text{中身})\'}{(\\text{中身})^2}$',
    mark: 'ルートの中、または分母に $x$ の式（分子は数）。',
    futsu: ['$\\sqrt{x^2+9}$ の平均変化率を作り、', '分子を有理化して、', '$h\\to0$ の極限を計算する。'],
    raku: ['$\\sqrt{x^2+9}$ → $\\frac{2x}{2\\sqrt{x^2+9}}=\\frac{x}{\\sqrt{x^2+9}}$', '$\\frac{1}{2x+1}$ → $-\\frac{2}{(2x+1)^2}$'],
    why: '$\\sqrt{u}=u^{\\frac{1}{2}}$ の微分は $\\frac{1}{2}u^{-\\frac{1}{2}}=\\frac{1}{2\\sqrt{u}}$、$\\frac{1}{u}=u^{-1}$ の微分は $-u^{-2}=-\\frac{1}{u^2}$（5-6⑥）。どちらも外側の微分なので、内側（中身）の微分をかける。',
    caution: '中身の微分をかけ忘れない。分数の形はマイナスがつく。分子にも $x$ があるとき（$\\frac{x}{x+1}$）は、この形ではない（積の微分 5-19 か、商の微分 5-92）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '28mm', s2: '28mm', s3: '16mm', trap: '26mm' }, boxh: '12mm',
    fits(q) {
      const e = yOf(q); if (!e) return false;
      if (/^\\sqrt\{/.test(e)) { let d = 0, end = -1; for (let j = 5; j < e.length; j++) { if (e[j] === '{') d++; else if (e[j] === '}') { d--; if (!d) { end = j; break; } } } if (end === e.length - 1 && /x/.test(e)) return true; }
      const fr2 = splitFrac(e); return !!fr2 && !/x/.test(fr2[0]) && /x/.test(fr2[1]) && !/\\sqrt/.test(fr2[1]);
    },
    steps: {
      // ルート
      s1(r) {
        if (r.chance(0.5)) {
          const c = r.int(1, 25), U = sq2(c), Y = `\\sqrt{${U}}`, A = `\\frac{x}{\\sqrt{${U}}}`;
          return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$\\frac{2x}{2\\sqrt{${U}}}=${A}$`, calc: { kind: 'diff', f: Y, pts: [0.37, 0.83, 1.29] } };
        }
        const a = r.int(1, 6), b = r.int(1, 9), U = lin(a, b), Y = `\\sqrt{${U}}`, A = sqrtLinD(a, U);
        return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$\\frac{${a}}{2\\sqrt{${U}}}=${A}$`, calc: { kind: 'diff', f: Y } };
      },
      // 分数（教科書 5-6 例題4）
      s2(r) {
        const k = r.int(0, 2), a = r.int(1, 5), b = r.intNot(-7, 7, v => v === 0);
        let Y, A, E;
        if (k === 0) { const U = lin(a, b); Y = `\\frac{1}{${U}}`; A = `-\\frac{${a}}{(${U})^{2}}`; E = `-\\frac{1}{(${U})^{2}}\\times${a}`; }
        else if (k === 1) { const U = sq2(r.int(1, 9)); Y = `\\frac{1}{${U}}`; A = `-\\frac{2x}{(${U})^{2}}`; E = `-\\frac{1}{(${U})^{2}}\\times2x`; }
        else { const U = lin(a, b); Y = `\\frac{1}{(${U})^{2}}`; A = `-\\frac{${2 * a}}{(${U})^{3}}`; E = `-2(${U})^{-3}\\times${a}`; }
        return { q: yq(Y), a: `$${A}$`, key: Y, easy: `$${E}=${A}$`, calc: { kind: 'diff', f: Y, pts: [0.37, 0.83, 1.29] } };
      },
      // ある点の値（ルートがきれいな数になる点。教科書 5-6 例題3）
      s3(r) {
        const k = r.int(0, 2);
        let Y, x0, val;
        if (k === 0) { const [p, c, q] = r.pick([[4, 9, 5], [3, 16, 5], [12, 25, 13], [5, 144, 13], [6, 64, 10], [8, 36, 10], [8, 225, 17], [15, 64, 17], [1, 3, 2], [2, 5, 3]]); Y = `\\sqrt{x^{2}+${c}}`; x0 = p; val = fr(p, q); }
        else if (k === 1) { const a = r.int(1, 4), m = r.int(2, 5), x = r.int(1, 6), b = m * m - a * x; if (b <= 0 || b > 20) return null; Y = `\\sqrt{${lin(a, b)}}`; x0 = x; val = fr(a, 2 * m); }
        else { const a = r.int(1, 4), b = r.int(1, 5), x = r.int(0, 2), u = a * x + b; Y = `\\frac{1}{${lin(a, b)}}`; x0 = x; val = fr(-a, u * u); }
        return {
          q: `$y=${Y}$ の、$x=${x0}$ での $y'$ の値`, a: `$${F.tex(val)}$`, key: `${Y}:${x0}`,
          easy: `微分してから $x=${x0}$ を入れる`, easyCheck: false, verify: () => close(dnum(Y, x0), F.val(val), 1e-6) || 'ちがう',
        };
      },
      // わな：分子にも x（→ 5-19 で x×(x+a)^{-1}、5-92）
      trap(r) {
        const a = r.intNot(-4, 5, v => v === 0), U = lin(1, a), Y = `\\frac{x}{${U}}`, A = `${a < 0 ? '-' : ''}\\frac{${Math.abs(a)}}{(${U})^{2}}`;
        return dest({ q: yq(Y), a: `$${A}$`, calc: { kind: 'diff', f: Y, pts: [0.37, 0.83, 1.29].map(x => (a < 0 ? x - a + 0.5 : x)) } }, '5-22', `分子にも $x$ がある。$x\\times(${U})^{-1}$ と見て積の微分か、商の微分`, ['5-19']);
      },
    },
  });

  // ================================================================ 5-23
  const piT = f => (f[0] === 0 ? '0' : `${f[0] < 0 ? '-' : ''}${Math.abs(f[0]) === 1 && f[1] === 1 ? '' : (f[1] === 1 ? Math.abs(f[0]) : `\\frac{${Math.abs(f[0])}}{${f[1]}}`)}\\pi`);   // (n/d)π
  const overPi = f => (f[1] === 1 ? `\\frac{${f[0]}}{\\pi}` : `\\frac{${f[0]}}{${f[1]}\\pi}`);   // (n/d)÷π
  // つながった変化：辺・半径 L = kt + c。S（または V）のふえる速さ
  const SHAPE = {
    sq: { name: '正方形の1辺', v: 'a', what: '面積', unit: 'cm^2/s', expo: 2, coef: fr(1), d: 'S', dd: L => `2a`, rate: (L, k) => fr(2 * L * k) },
    cube: { name: '立方体の1辺', v: 'a', what: '体積', unit: 'cm^3/s', expo: 3, coef: fr(1), d: 'V', dd: () => '3a^{2}', rate: (L, k) => fr(3 * L * L * k) },
    circ: { name: '円の半径', v: 'r', what: '面積', unit: 'cm^2/s', expo: 2, coef: null, d: 'S', dd: () => '2\\pi r', rate: (L, k) => fr(2 * L * k), pi: true },
    ball: { name: '球の半径', v: 'r', what: '体積', unit: 'cm^3/s', expo: 3, coef: null, d: 'V', dd: () => '4\\pi r^{2}', rate: (L, k) => fr(4 * L * L * k), pi: true },
  };
  const SHAPE_F = { sq: 'a^{2}', cube: 'a^{3}', circ: '\\pi r^{2}', ball: '\\frac{4}{3}\\pi r^{3}' };
  function chainProb(r, kinds) {
    const sh = r.pick(kinds), S = SHAPE[sh], k = r.int(1, 4), c = r.chance(0.3) ? r.int(1, 2) : 0, T = r.int(1, 3), L = k * T + c;
    const rate = S.rate(L, k), ans = S.pi ? piT(rate) : F.tex(rate), LT = lin(k, c, 't');
    if (F.val(rate) > 1000) return null;
    const qv = `${S.name}が $${S.v}=${LT}$（cm）でのびていく。${T}秒のとき、${S.what}${S.pi ? `（$${S.d}=${SHAPE_F[sh]}$）` : ''}がふえる速さ $□\\,\\mathrm{${S.unit}}$`;
    const full = { sq: `(${LT})^{2}`, cube: `(${LT})^{3}`, circ: `\\pi(${LT})^{2}`, ball: `\\frac{4}{3}\\pi(${LT})^{3}` }[sh];
    return {
      q: qv, a: `$${ans}$`, key: `${sh}${LT}:${T}`,
      easy: `$\\frac{\\dd ${S.d}}{\\dd t}=${S.dd(L)}\\times${k}$、$${S.v}=${L}$ で $${ans}$`, easyCheck: false,
      verify: () => close(dnum(full, T, 't'), F.val(rate) * (S.pi ? Math.PI : 1), 1e-6) || `ちがう（${full}）`,
    };
  }
  // 円すい形のタンク：水面の半径＝深さ×m（m は 1/2 か 1）。毎秒 Q cm³、深さ h のときの水位の上がる速さ Q÷(dV/dh)
  function tankProb(r, withFig) {
    const half = r.chance(0.7), h = r.pick(half ? [2, 4, 5, 6, 8, 10, 12, 20] : [2, 3, 4, 5, 6, 10]), Q = r.pick([10, 20, 25, 30, 40, 50, 60, 75, 100, 150]);
    const rate = half ? fr(4 * Q, h * h) : fr(Q, h * h);                       // dh/dt ＝ rate÷π
    if (rate[1] > 9 || F.val(rate) > 8) return null;                    // 水位の上がる速さは 2.5 cm/s くらいまで
    const VT = half ? '\\frac{\\pi}{12}h^{3}' : '\\frac{\\pi}{3}h^{3}', dV = half ? '\\frac{\\pi}{4}h^{2}' : '\\pi h^{2}', ans = overPi(rate);
    const dVf = half ? fr(h * h, 4) : fr(h * h);                               // dV/dh ＝ dVf×π
    const divT = dVf[1] === 1 ? `\\frac{${Q}}{${piT(dVf)}}` : `${Q}\\div\\frac{${dVf[0]}\\pi}{${dVf[1]}}`;
    return {
      q: `${withFig ? '図の' : '円すい形の'}タンク（深さ $h$ cm で水は $V=${VT}$）に、毎秒 $${Q}\\,\\mathrm{cm^3}$ 入れる。深さ $${h}\\,\\mathrm{cm}$ のとき、水位の上がる速さ $□\\,\\mathrm{cm/s}$`,
      a: `$${ans}$`, key: `t${half}:${Q}:${h}`, boxw: '16mm', boxh: '12mm',
      easy: `$\\frac{\\dd V}{\\dd h}=${dV}=${piT(dVf)}$、$\\frac{\\dd h}{\\dd t}=${divT === ans ? ans : `${divT}=${ans}`}$`, easyCheck: false,
      verify: () => { const dVdh = dnum(VT, h, 'h'); return close(Q / dVdh, numOf(ans), 1e-6) || `ちがう（${Q / dVdh}）`; },
      fig: withFig ? tankFig(half) : undefined,
    };
  }
  // さかさの円すいのタンクの図（図（立体）：だ円。前の半分は実線、うしろの半分は点線）
  function tankFig(half) {
    const H = half ? 6 : 4.4, R = half ? 3 : 4.4, hw = H * 0.62, rw = R * 0.62, ry = rw * 0.3, Ry = R * 0.3;
    const front = []; for (let j = 0; j <= 24; j++) { const a = Math.PI + Math.PI * j / 24; front.push([rw * Math.cos(a), hw + ry * Math.sin(a)]); }
    return {
      s: 4.0, pad: 1.0,
      items: [
        ['poly', [[0, 0]].concat(front), { fill: true, noline: true }],
        ['seg', [0, 0], [-R, H]], ['seg', [0, 0], [R, H]],
        ['ellipse', [0, H], R, Ry],
        ['ellipse', [0, hw], rw, ry, 180, 360], ['ellipse', [0, hw], rw, ry, 0, 180, { dash: true }],
        ['seg', [0, 0], [0, hw], { dash: true }], ['seg', [0, hw], [rw, hw], { dash: true }], ['dot', [0, hw]],
        ['label', [rw + 0.45, hw - 0.5], half ? '$\\frac{h}{2}$' : '$h$', 'e'],
        ['seg', [-R - 0.7, 0], [-R - 0.7, hw]], ['seg', [-R - 0.9, 0], [-R - 0.5, 0]], ['seg', [-R - 0.9, hw], [-R - 0.5, hw]], ['seg', [-R - 0.7, 0], [-0.25, 0], { dash: true }],
        ['label', [-R - 0.7, hw / 2], '$h$', 'w'],
        ['seg', [0.35, H + 1.4], [0.35, hw + 0.5], { arrow: true }],
      ],
    };
  }
  M.add({
    id: '5-23', part: PART, chap: '5-6⑦⑧', stars: 1,
    title: 'つながった変化の速さはかけ算でつなぐ $\\dfrac{\\dd S}{\\dd t}=\\dfrac{\\dd S}{\\dd a}\\times\\dfrac{\\dd a}{\\dd t}$（水位は「入る速さ÷$\\dfrac{\\dd V}{\\dd h}$」）',
    mark: '辺・半径・深さが時間とともに変わり、面積・体積・水位の変わる「速さ」を聞かれる。毎秒□$\\mathrm{cm^3}$ 入れる。',
    futsu: ['$S$ を $t$ の式（$S=(3t)^2=9t^2$）にしてから', '$t$ で微分する', '（タンクは $h$ を $t$ の式にできない）。'],
    raku: ['$\\frac{\\dd S}{\\dd t}=2a\\times3$、2秒で $a=6$ → $36$', 'タンク：$\\frac{\\dd V}{\\dd h}=\\frac{\\pi}{4}h^2=25\\pi$', '$\\frac{\\dd h}{\\dd t}=50\\div25\\pi=\\frac{2}{\\pi}$'],
    why: '$t$ が変わると $a$ が変わり、$a$ が変わると $S$ が変わる。変わる速さの比はかけ算でつながる（合成関数の微分。5-6⑦）。タンクでは $\\frac{\\dd V}{\\dd t}=\\frac{\\dd V}{\\dd h}\\times\\frac{\\dd h}{\\dd t}$ で、$\\frac{\\dd V}{\\dd t}$（入れる速さ）がわかっているので、わり算で $\\frac{\\dd h}{\\dd t}$ が出る（5-6⑧）。',
    caution: '「速さ」を聞かれたら、量（面積・体積）そのものではない。$\\frac{\\dd a}{\\dd t}$（のびる速さ）をかけ忘れない。タンクの水位は、水面が広いほどゆっくり上がる。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /速さ/.test(q) && /のびていく|毎秒/.test(q) && /面積|体積|水位/.test(q); },
    steps: {
      s1(r) { return chainProb(r, ['sq', 'sq', 'cube', 'circ']); },
      s2(r) { return tankProb(r, false); },
      // 図のタンク・球（風船）・立方体
      s3(r) {
        if (r.chance(0.65)) return tankProb(r, true);
        return chainProb(r, ['ball', 'cube']);
      },
      // わな：速さではなく、そのときの量（→ そのまま入れる）
      trap(r) {
        const k = r.int(2, 4), T = r.pick([1, 3, 4, 5]), L = k * T, sq = r.chance(0.6);
        const A = sq ? L * L : L * L * L;
        return dest({
          q: `1辺が $a=${cf(k)}t$（cm）の${sq ? '正方形' : '立方体'}の、${T}秒後の${sq ? `面積 $□\\,\\mathrm{cm^2}$` : `体積 $□\\,\\mathrm{cm^3}$`}`, a: `$${A}$`,
          verify: () => close(Math.pow(k * T, sq ? 2 : 3), A) || 'ちがう',
        }, '5-23', `ふえる速さではなく、そのときの${sq ? '面積' : '体積'}。1辺 $${k}\\times${T}=${L}$ を入れて $${L}^{${sq ? 2 : 3}}=${A}$`);
      },
    },
  });

  // ================================================================ 5-24
  const fac = a => (a === 0 ? 'x' : `(x${a > 0 ? '-' : '+'}${Math.abs(a)})`);   // (x−a)
  const fOf = q => { const m = /\$f\(x\)=([^$]*)\$/.exec(q); return m ? m[1] : null; };
  const fnum = (T, v) => x => ev(T, { [v || 'x']: x });
  // 3次関数 f：f'(x)=k(x−al)(x−be)（al<be）。x³ の係数は ±1（al+be が偶数）か ±2（奇数）。係数はどれも整数
  function cubic(r, opt) {
    opt = opt || {};
    const al = r.int(opt.lo == null ? -3 : opt.lo, 3), be = al + r.int(1, 4), lead = ((al + be) % 2 === 0 ? 1 : 2) * (opt.neg ? -1 : 1);
    const fp = PP.scale(PP.mul(PP.make(-al, 1), PP.make(-be, 1)), 3 * lead), f = PP.integ(fp);
    f[0] = fr(opt.c ? r.int(-6, 6) : 0);
    const fa = F.val(PP.at(f, al)), fb = F.val(PP.at(f, be));
    if (Math.abs(fa) > 60 || Math.abs(fb) > 60 || Math.abs(3 * lead * al * be) > 36) return null;
    const up = lead > 0;
    return { al, be, lead, f, fp, dk: `${lead}:${al}:${be}`, T: PT(f, opt.v), fpT: `${cf(3 * lead)}${be === 0 ? fac(be) + fac(al) : fac(al) + fac(be)}`, xmax: up ? al : be, xmin: up ? be : al, vmax: up ? fa : fb, vmin: up ? fb : fa };
  }
  // p.a の「極大値 $v$、極小値 $w$」と、楽な形に書いた x（xmax・xmin）を、細かくならべた値（localExt）で確かめる
  function extCheck(p, T, lo, hi, xmax, xmin) {
    const m = /^極大値 \$([^$]*)\$、極小値 \$([^$]*)\$$/.exec(p.a); if (!m) return '答えの形がちがう';
    const E = localExt(fnum(T), lo, hi);
    if (E.max.length !== 1 || E.min.length !== 1) return `極大 ${E.max.length} こ、極小 ${E.min.length} こ`;
    return (close(E.max[0][1], numOf(m[1]), 1e-6) && close(E.max[0][0], xmax, 1e-4) && close(E.min[0][1], numOf(m[2]), 1e-6) && close(E.min[0][0], xmin, 1e-4)) || `極大 ${E.max[0]}、極小 ${E.min[0]}`;
  }
  M.add({
    id: '5-24', part: PART, chap: '5-7①②⑤', stars: 1,
    title: '増減表は $f\'(x)=0$ の解と符号（3次で $x^3$ の係数が正なら ＋－＋）',
    mark: '「極大値・極小値」「増加・減少する範囲」。3次関数の山と谷。',
    futsu: ['$x$ にいろいろな値を入れて表を作り、', '大きくなる所・小さくなる所をさがす', '（山のてっぺんが整数の所とはかぎらない）。'],
    raku: ['$f(x)=x^3-6x^2+9x$', '$f\'(x)=3(x-1)(x-3)$ → ＋－＋', '極大 $f(1)=4$、極小 $f(3)=0$'],
    why: '$f\'(x)>0$ の所では増加、$f\'(x)<0$ の所では減少（5-7①）。だから $f\'(x)=0$ の解の前後で符号が ＋ から － に変われば山（極大）、－ から ＋ なら谷（極小）。$x^3$ の係数が正の3次関数は、右へ行くとかならず上がるので、符号は左から ＋－＋ になる。2回微分でも見分けられる：$f\'\'(a)<0$ なら山、$f\'\'(a)>0$ なら谷（5-7⑤）。',
    caution: '$f\'(a)=0$ でも、前後で符号が変わらなければ極大でも極小でもない（$f(x)=x^3$ の $x=0$）。極大値は「近くの中でいちばん大きい値」で、全体の最大値とはかぎらない。答えるのは $f\'$ の値ではなく、もとの $f$ の値。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '13mm',
    fits(q) { return /極大|極小|増加|減少/.test(q) && !/\\leqq/.test(q); },
    steps: {
      // x³ の係数が正（＋－＋）：極大値と極小値（教科書 5-7 例題2）
      s1(r) {
        const o = cubic(r, { c: r.chance(0.3) }); if (!o) return null;
        return {
          q: `$f(x)=${o.T}$ の極大値 □ と極小値 □`, a: `極大値 $${o.vmax}$、極小値 $${o.vmin}$`, key: `d${o.dk}`,
          easy: `$f'(x)=${o.fpT}$。符号は ＋－＋ なので、$x=${o.al}$ で極大、$x=${o.be}$ で極小`, easyCheck: false,
          verify: p => extCheck(p, fOf(p.q), o.al - 2, o.be + 2, o.xmax, o.xmin),
        };
      },
      // x³ の係数が負（－＋－）・2回微分で山か谷か・係数が分数（f' を因数分解）
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const o = cubic(r, { neg: true }); if (!o) return null;
          return {
            q: `$f(x)=${o.T}$ の極大値 □ と極小値 □`, a: `極大値 $${o.vmax}$、極小値 $${o.vmin}$`, key: `d${o.dk}`,
            easy: `$f'(x)=${o.fpT}$。$x^3$ の係数が負なので符号は －＋－。$x=${o.al}$ で極小、$x=${o.be}$ で極大`, easyCheck: false,
            verify: p => extCheck(p, fOf(p.q), o.al - 2, o.be + 2, o.xmax, o.xmin),
          };
        }
        if (k === 1) {
          const o = cubic(r, { neg: r.chance(0.3), c: r.chance(0.3) }); if (!o) return null;
          const a = r.pick([o.al, o.be]), f2 = PP.diff(o.fp), v2 = F.val(PP.at(f2, a)), top = v2 < 0;
          return {
            q: `$f(x)=${o.T}$ では $f'(${a})=0$。$f''(${a})=□$ なので、$x=${a}$ で □（極大・極小）`, a: `$${v2}$、${top ? '極大' : '極小'}`, key: `${o.T}:${a}`,
            easy: `$f''(x)=${PT(f2)}$、$f''(${a})=${v2}${top ? '<0' : '>0'}$ なので${top ? '山（極大）' : '谷（極小）'}`, easyCheck: false,
            verify: p => {
              const T = fOf(p.q), E = localExt(fnum(T), o.al - 2, o.be + 2), hit = (top ? E.max : E.min).some(e => close(e[0], a, 1e-4));
              return (close(d2num(T, a, 'x'), v2, 1e-4) && hit && p.a.endsWith(top ? '極大' : '極小')) || `x=${a} は${top ? '極大' : '極小'}ではないか、2回微分の値がちがう`;
            },
          };
        }
        const al = r.int(-4, 2), be = al + 2 * r.int(1, 3), f = PP.integ(PP.mul(PP.make(-al, 1), PP.make(-be, 1))), T = PT(f);
        return {
          q: `$f(x)=${T}$ が極大になる $x$ □ と、極小になる $x$ □`, a: `極大 $x=${al}$、極小 $x=${be}$`, key: T,
          easy: `$f'(x)=${PT(PP.diff(f))}=${fac(al)}${fac(be)}$。符号は ＋－＋`, easyCheck: false,
          verify: p => {
            const m = /極大 \$x=([^$]*)\$、極小 \$x=([^$]*)\$/.exec(p.a), E = localExt(fnum(fOf(p.q)), al - 2, be + 2);
            return (!!m && E.max.length === 1 && E.min.length === 1 && close(E.max[0][0], numOf(m[1]), 1e-4) && close(E.min[0][0], numOf(m[2]), 1e-4)) || '極大・極小の x がちがう';
          },
        };
      },
      // 減少（増加）する範囲・極大と極小の数（符号が変わらないと0こ）・定数を決める
      // （数を聞く形は1見開きに1問、定数を決める形は2問までにして、3つの形がかたよらないようにする。key）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const o = cubic(r, { neg: r.chance(0.4), c: r.chance(0.3) }); if (!o) return null;
          const down = o.lead > 0;
          return {
            q: `$f(x)=${o.T}$ が${down ? '減少' : '増加'}する $x$ の範囲は □`, a: `$${o.al}<x<${o.be}$`, key: `r${o.dk}`, boxw: '24mm',
            easy: `$f'(x)=${o.fpT}$ が${down ? '負' : '正'}になるのは、$${o.al}$ と $${o.be}$ のあいだ`, easyCheck: false,
            verify: p => {
              const T = fOf(p.q), sg = down ? -1 : 1, m = /^\$(-?\d+)<x<(-?\d+)\$$/.exec(p.a); if (!m) return '答えの形がちがう';
              const a = +m[1], b = +m[2], ok = [a + 0.01, (a + b) / 2, b - 0.01].every(x => sg * dnum(T, x) > 0) && [a - 0.01, b + 0.01, a - 3, b + 3].every(x => sg * dnum(T, x) < 0);
              return ok || '範囲がちがう';
            },
          };
        }
        if (k === 1) {
          const kind = r.int(0, 2), a = r.int(-2, 3);
          let f, why, n;
          if (kind === 2) { const o = cubic(r, { neg: r.chance(0.3) }); if (!o) return null; f = o.f; n = 2; why = `$f'(x)=${o.fpT}$。$x=${o.al}$ と $x=${o.be}$ の前後で符号が変わる`; }
          else {
            const m = kind === 0 ? 0 : r.int(1, 3), fp = PP.add(PP.scale(PP.pow(PP.make(-a, 1), 2), 3), PP.make(3 * m));
            f = PP.integ(fp); n = 0;
            const sq = a === 0 ? '3x^{2}' : `3${fac(a)}^{2}`;
            why = kind === 0 ? `$f'(x)=${sq}$ は0以上。$x=${a}$ の前後で符号が変わらない（ずっと増加）` : `$f'(x)=${a === 0 ? '' : `${PT(fp)}=`}${sq}+${3 * m}>0$。いつも増加で、山も谷もない`;
          }
          const T = PT(f);
          return {
            q: `$f(x)=${T}$ の極大と極小は、あわせて □ こ`, a: `$${n}$`, key: 'cnt',
            easy: why, easyCheck: false,
            verify: p => { const E = localExt(fnum(fOf(p.q)), -9, 11); return E.max.length + E.min.length === numOf(p.a) || `極大 ${E.max.length} こ、極小 ${E.min.length} こ`; },
          };
        }
        const o = cubic(r); if (!o) return null;
        const isMin = r.chance(0.6), t = r.int(0, 5), c = t - (isMin ? o.vmin : o.vmax);
        if (c === 0) return null;
        return {
          q: `$f(x)=${o.T}+c$ の${isMin ? '極小値' : '極大値'}が $${t}$ になる定数 $c$`, a: `$${c}$`, key: `c${r.int(0, 1)}`,
          easy: `$f'(x)=${o.fpT}$ より、$x=${isMin ? o.xmin : o.xmax}$ で${isMin ? '極小' : '極大'}。$${isMin ? o.vmin : o.vmax}+c=${t}$`, easyCheck: false,
          verify: p => { const T = fOf(p.q), cv = numOf(p.a), E = localExt(x => ev(T, { x, c: cv }), o.al - 2, o.be + 2), e = isMin ? E.min : E.max; return (e.length === 1 && close(e[0][1], t, 1e-6)) || `${isMin ? '極小値' : '極大値'}が ${e.length ? e[0][1] : 'ない'}`; },
        };
      },
      // わな：範囲がある最大値（極大値ではなく、はしの値 → 5-25）
      trap(r) {
        for (let n = 0; n < 40; n++) {
          const o = cubic(r); if (!o) continue;
          const a = o.al - r.int(0, 1), b = o.be + r.int(1, 2), vb = F.val(PP.at(o.f, b));
          if (vb <= o.vmax || vb > 99) continue;
          return dest({
            q: `$f(x)=${o.T}$ の、$${a}\\leqq x\\leqq${b}$ での最大値 □`, a: `$${vb}$（$x=${b}$）`, key: `t${o.T}`,
            verify: p => { const s = scan(fnum(fOf(p.q)), a, b, 300), m = /^\$(-?\d+)\$（\$x=(-?\d+)\$）$/.exec(p.a); return (!!m && close(s.mx, +m[1], 1e-6) && close(s.xmx, +m[2], 1e-4)) || `最大は ${s.mx}（x=${s.xmx}）`; },
          }, '5-24', `範囲がある。極大値 $${o.vmax}$ より、はしの $f(${b})=${vb}$ が大きい`);
        }
        return null;
      },
    },
  });

  // ================================================================ 5-25
  const rangeT = (a, b, v) => `${a}\\leqq ${v || 'x'}\\leqq${b}`;
  // p.a の「最大値 $M$、最小値 $m$」と、楽な形に書いた候補（mm）を、範囲を細かくならべた値（scan）で確かめる
  function mmCheck(p, T, a, b, v, mm) {
    const m = /^最大値 \$([^$]*)\$、最小値 \$([^$]*)\$$/.exec(p.a); if (!m) return '答えの形がちがう';
    const s = scan(fnum(T, v), a, b, 300);
    return (close(s.mx, numOf(m[1]), 1e-6) && close(s.xmx, mm.M[0], 1e-4) && close(s.mn, numOf(m[2]), 1e-6) && close(s.xmn, mm.m[0], 1e-4)) || `最大 ${s.mx}（${s.xmx}）、最小 ${s.mn}（${s.xmn}）`;
  }
  // 候補（はしと、範囲の中の f'=0 の点）の値をならべて、最大・最小を決める。同じ値が2つあるときは null
  function pickMM(f, xs) {
    const c = xs.map(x => [x, F.val(PP.at(f, x))]), mx = Math.max(...c.map(e => e[1])), mn = Math.min(...c.map(e => e[1]));
    if (c.filter(e => e[1] === mx).length !== 1 || c.filter(e => e[1] === mn).length !== 1 || Math.abs(mx) > 99 || Math.abs(mn) > 99) return null;
    return { c, M: c.find(e => e[1] === mx), m: c.find(e => e[1] === mn) };
  }
  const candT = (c, name) => c.map(e => `$${name || 'f'}(${e[0]})=${e[1]}$`).join('、');
  const whereT = (o, v) => `。最大は $${v || 'x'}=${o.M[0]}$、最小は $${v || 'x'}=${o.m[0]}$`;
  const mmA = o => `最大値 $${o.M[1]}$、最小値 $${o.m[1]}$`;
  // 範囲つきの3次関数：範囲の中に f'=0 の点が1つか2つ
  function rangeCubic(r, opt) {
    const o = cubic(r, opt); if (!o) return null;
    const a = opt && opt.a0 != null ? opt.a0 : r.int(o.al - 2, o.be - 1), b = r.int(Math.max(a + 2, o.al + 1), o.be + 2);
    const ins = [o.al, o.be].filter(x => x > a && x < b);
    if (!ins.length || b - a > 7) return null;
    const mm = pickMM(o.f, [a, ...ins, b]); if (!mm) return null;
    return Object.assign(o, { a, b, ins, mm, out: [o.al, o.be].filter(x => x < a || x > b) });
  }
  // 範囲のあるグラフ（図）：範囲の中は太い実線、外は点線。両はしに点線、はしと f'=0 の点に点。目もりは範囲の両はしだけ
  function rangeFig(f, a, b, crit) {
    const x0 = Math.min(a - 0.6, -0.5), x1 = Math.max(b + 0.6, 0.5), s = scan(f, a, b, 300);
    const e = scan(f, x0, x1, 300), sp = Math.max(s.mx, 0) - Math.min(s.mn, 0);   // 範囲の外の点線は、上下に3わりまで見せる
    const y0 = Math.min(0, Math.max(e.mn, s.mn - 0.3 * sp)) - 0.06 * sp, y1 = Math.max(0, Math.min(e.mx, s.mx + 0.3 * sp)) + 0.06 * sp;
    const G = M.graph({ x0, x1, y0, y1, w: 8, h: 4.6 });
    const tick = t => (t === 0 ? [] : [['seg', [t * G.sx, -0.15], [t * G.sx, 0.15]], ['label', [t * G.sx, 0], `$${t}$`, f(t) < 0 ? 'n' : 's']]);
    // 曲線が原点の近くを通るとき、O は曲線のない向きに置く
    const d = (x1 - x0) * 0.06, near0 = Math.abs(f(0)) < 0.15 * sp, o = !near0 || f(-d) >= 0 ? 'sw' : f(d) >= 0 ? 'se' : 'nw';
    return {
      s: 5, items: [
        ...G.axes({ o }), ...tick(a), ...tick(b),
        ...G.plot(f, x0, a, { dash: true }), ...G.plot(f, b, x1, { dash: true }), ...G.plot(f, a, b, { thick: true }),
        ['seg', G.T(a, 0), G.T(a, f(a)), { dash: true }], ['seg', G.T(b, 0), G.T(b, f(b)), { dash: true }],
        ['dot', G.T(a, f(a))], ['dot', G.T(b, f(b))], ...crit.map(c => ['dot', G.T(c, f(c))]),
      ],
    };
  }
  M.add({
    id: '5-25', part: PART, chap: '5-7③', stars: 1,
    title: '範囲があれば、極値とはしの値をならべてくらべる',
    mark: '「$0\\leqq x\\leqq5$ での最大値・最小値」のように、$x$ の範囲が決まっている。',
    futsu: ['範囲の中の $x$ を0.5きざみで入れて表を作り、', 'いちばん大きい値・小さい値をさがす。'],
    raku: ['$f(x)=x^2-4x+5$、$0\\leqq x\\leqq5$', '$f\'(x)=2x-4=0$ → $x=2$（範囲の中）', '$f(0)=5$、$f(2)=1$、$f(5)=10$', '最大値10、最小値1'],
    why: '範囲が決まっているとき、最大・最小になれるのは、山のてっぺん・谷の底（$f\'(x)=0$ の点）か、範囲のはしだけ（5-7③）。そのあいだは上がるか下がるかのどちらかで、とちゅうでいちばんにはならない。だから、候補の値をならべてくらべればよい。',
    caution: '極大値がいちばん大きいとはかぎらない（はしのほうが高いことがある）。$f\'(x)=0$ の解が範囲の外なら、候補に入れない。はしの値を調べ忘れない。',
    counts: { s1: 6, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '12mm',
    fits(q) { return /\\leqq/.test(q) && /最大値|最小値/.test(q); },
    steps: {
      // 2次関数（頂点が範囲の中。教科書 5-7 例題3）
      s1(r) {
        const up = r.chance(0.7), p0 = r.int(1, 5), c = r.int(-3, 9), a = p0 - r.int(1, 3), b = p0 + r.int(1, 4);
        const f = up ? PP.make(c, -2 * p0, 1) : PP.make(c, 2 * p0, -1), T = PT(f), mm = pickMM(f, [a, p0, b]);
        if (!mm) return null;
        return {
          q: `$f(x)=${T}$（$${rangeT(a, b)}$）の最大値 □ と最小値 □`, a: mmA(mm), key: T,
          easy: `$f'(x)=${PT(PP.diff(f))}=0$ は $x=${p0}$。${candT(mm.c)} をくらべる${whereT(mm)}`, easyCheck: false,
          verify: p => mmCheck(p, fOf(p.q), a, b, 'x', mm),
        };
      },
      // 3次関数（教科書 5-7 例題4）・f'=0 の解が範囲の外（はしだけをくらべる）
      s2(r) {
        if (r.chance(0.3)) {
          const up = r.chance(0.6), p0 = r.int(-2, 6), c = r.int(-3, 9), left = r.chance(0.5), a = left ? p0 + r.int(1, 2) : p0 - r.int(3, 6), b = left ? a + r.int(2, 4) : p0 - r.int(1, 2);
          const f = up ? PP.make(c, -2 * p0, 1) : PP.make(c, 2 * p0, -1), T = PT(f), mm = pickMM(f, [a, b]);
          if (!mm || b - a < 2) return null;
          return {
            q: `$f(x)=${T}$（$${rangeT(a, b)}$）の最大値 □ と最小値 □`, a: mmA(mm), key: T,
            easy: `$f'(x)=${PT(PP.diff(f))}=0$ の $x=${p0}$ は範囲の外。はしの ${candT(mm.c)} をくらべる${whereT(mm)}`, easyCheck: false,
            verify: p => mmCheck(p, fOf(p.q), a, b, 'x', mm),
          };
        }
        const o = rangeCubic(r, { neg: r.chance(0.25) }); if (!o) return null;
        return {
          q: `$f(x)=${o.T}$（$${rangeT(o.a, o.b)}$）の最大値 □ と最小値 □`, a: mmA(o.mm), key: o.T,
          easy: `$f'(x)=${o.fpT}$${o.out.length ? `（$x=${o.out[0]}$ は範囲の外）` : ''}。${candT(o.mm.c)} をくらべる${whereT(o.mm)}`, easyCheck: false,
          verify: p => mmCheck(p, fOf(p.q), o.a, o.b, 'x', o.mm),
        };
      },
      // 図のグラフ（範囲の中が実線）・位置の式（文字が t）
      s3(r) {
        if (r.chance(0.35)) {
          const o = rangeCubic(r, { v: 't', lo: 0, a0: 0 }); if (!o) return null;
          return {
            q: `位置 $x=${o.T}$（m）の物体の、$${rangeT(o.a, o.b, 't')}$ での位置の最大値 $□\\,\\mathrm{m}$ と最小値 $□\\,\\mathrm{m}$`, a: mmA(o.mm), key: o.T.replace(/t/g, 'x'),
            easy: `$\\dot{x}=${o.fpT.replace(/x/g, 't')}$${o.out.length ? `（$t=${o.out[0]}$ は範囲の外）` : ''}。${candT(o.mm.c, 'x')} をくらべる${whereT(o.mm, 't')}`, easyCheck: false,
            verify: p => { const m = /\$x=([^$]*)\$/.exec(p.q); return mmCheck(p, m[1], o.a, o.b, 't', o.mm); },
          };
        }
        const o = rangeCubic(r, { neg: r.chance(0.3) }); if (!o) return null;
        if (o.ins.length === 2 && Math.abs(o.vmax - o.vmin) < 0.15 * (o.mm.M[1] - o.mm.m[1])) return null;   // 山と谷が図で見分けられること
        return {
          q: `図は $y=f(x)$ のグラフ。$f(x)=${o.T}$ の、$${rangeT(o.a, o.b)}$（太い線の所）での最大値 □ と最小値 □`, a: mmA(o.mm), key: o.T,
          easy: `$f'(x)=${o.fpT}$${o.out.length ? `（$x=${o.out[0]}$ は範囲の外）` : ''}。${candT(o.mm.c)} をくらべる${whereT(o.mm)}`, easyCheck: false,
          verify: p => mmCheck(p, fOf(p.q), o.a, o.b, 'x', o.mm),
          fig: rangeFig(x => PP.val(o.f, x), o.a, o.b, o.ins),
        };
      },
      // わな：はしがない（x>0）。f'=0 の前後の符号で決める（増減表 → 5-24）
      trap(r) {
        const [k, m] = r.pick([[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 1], [2, 3], [2, 5], [3, 1], [3, 2]]);
        const T = `${cf(k * k)}x+\\frac{${m * m}}{x}`, x0 = fr(m, k), mn = 2 * k * m;
        return dest({
          q: `$x>0$ のとき、$f(x)=${T}$ の最小値 □`, a: `$${mn}$（$x=${F.tex(x0)}$）`,
          verify: p => { const s = scan(fnum(fOf(p.q)), 0.05, 4 * F.val(x0) + 4, 600), mm = /^\$(\d+)\$（\$x=([^$]*)\$）$/.exec(p.a); return (!!mm && close(s.mn, +mm[1], 1e-6) && close(s.xmn, numOf(mm[2]), 1e-4)) || `最小は ${s.mn}（x=${s.xmn}）`; },
        }, '5-25', `範囲にはしがないので、はしの値とくらべられない。$f'(x)=${k * k}-\\frac{${m * m}}{x^{2}}=0$ の $x=${F.tex(x0)}$ の前後で、符号が －＋ と変わる（谷）`, ['5-24']);
      },
    },
  });

  // ================================================================ 5-26
  const fmtF = f => fdec(f);                                           // わり切れる分数を小数の文字に
  // p.a の中の数（$…$ の中の数。単位・文字は読み捨てる）を順に取り出す
  const numsOf = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => { const m = /-?\d+(?:\.\d+)?/.exec(t.replace(/\\mathrm\{[^}]*\}/g, '').replace(/^\$[A-Za-z]=/, '$')); return m ? +m[0] : NaN; });
  // かべと長方形の図：かべ（太い線と斜めのしるし）、ロープの辺（n 本がかべと直角）
  function wallFig(n) {
    const W = 8, H = 3.4, it = [['seg', [-0.9, H], [W + 0.9, H], { thick: true }]];
    for (let x = -0.7; x < W + 0.8; x += 0.8) it.push(['seg', [x, H], [x + 0.35, H + 0.4]]);
    it.push(['label', [W / 2, H + 0.4], 'かべ', 'n']);
    it.push(['path', [[0, H], [0, 0], [W, 0], [W, H]], { thick: true }]);
    if (n === 3) it.push(['seg', [W / 2, 0], [W / 2, H], { thick: true }]);
    it.push(['label', [0, H / 2], '$x$', 'w'], ['label', [W, H / 2], '$x$', 'e']);
    if (n === 3) it.push(['label', [W / 2, H / 2], '$x$', 'e']);
    return { s: 5, items: it };
  }
  // 箱の紙の図：正方形の紙、4すみの切りとる正方形（うすくぬる）、折る線（点線）
  function paperFig(a) {
    const W = 4.6, c = 0.9, it = [];
    [[0, 0], [W - c, 0], [0, W - c], [W - c, W - c]].forEach(([x, y]) => it.push(['poly', [[x, y], [x + c, y], [x + c, y + c], [x, y + c]], { fill: true }]));
    it.push(['poly', [[0, 0], [W, 0], [W, W], [0, W]]]);
    it.push(['seg', [c, c], [W - c, c], { dash: true }], ['seg', [c, W - c], [W - c, W - c], { dash: true }], ['seg', [c, c], [c, W - c], { dash: true }], ['seg', [W - c, c], [W - c, W - c], { dash: true }]);
    it.push(['label', [c / 2, 0], '$x$', 's'], ['label', [0, c / 2], '$x$', 'w'], ['label', [W / 2, W], `$${a}\\,\\mathrm{cm}$`, 'n']);
    return { s: 5, items: it };
  }
  M.add({
    id: '5-26', part: PART, chap: '5-7④⑥ 例題5〜8', stars: 1,
    title: '材料・長さが決まった「いちばん」は、1つの文字の式にして範囲を書き、$f\'=0$',
    mark: 'ロープで囲む長方形、紙の4すみを切ってつくる箱、缶、電池と器具。「面積・体積が最大」「表面積が最小」「電力が最大」。',
    futsu: ['たてを1 m ずつ変えて表を作り、', 'いちばん大きい面積をさがす', '（表では、いちばんと言いきれない）。'],
    raku: ['ロープ40 m：$S=x(20-x)$、$0<x<20$', '$S\'=20-2x=0$ → $x=10$（正方形）', '箱：$V=x(18-2x)^2$、$0<x<9$', '$V\'=(18-2x)(18-6x)=0$ → $x=3$'],
    why: '大きく（小さく）したい量を1つの文字の式にして、範囲を書き、$f\'=0$ の解から範囲の中のものをえらぶ（5-7⑥）。前後で $f\'$ が ＋ から － なら最大、－ から ＋ なら最小。まわりの長さが決まった長方形は正方形、1辺 $a$ の紙の箱は $x=\\frac{a}{6}$、缶は高さ＝直径、電池は器具の抵抗＝内部抵抗のときが、いちばん。',
    caution: '範囲の外の解（箱の $x=9$ は底の1辺が0）は答えにしない。聞かれているのが $x$ か、面積・体積かを確かめる。かべを使うときのロープは3辺ぶん（$x$ が2本と横が1本）。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '13mm',
    fits(q) { return /最大|最小/.test(q) && /ロープ|針金|紙|箱|缶|電池/.test(q); },
    steps: {
      // 囲む（教科書 5-7 例題5）：4辺を囲む → 正方形。かべを1辺に → かべと直角な辺は全体の 1/4
      s1(r) {
        const wall = r.chance(0.45), rope = wall || r.chance(0.6), u = rope ? 'm' : 'cm';
        const L = r.pick(wall ? [8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 60, 80] : [8, 10, 12, 14, 16, 20, 24, 28, 30, 32, 36, 40, 48, 60, 80]);
        const x = fr(L, 4), S = wall ? fr(L * L, 8) : fr(L * L, 16);
        const q = wall
          ? `かべを1辺にして、長さ $${L}\\,\\mathrm{m}$ のロープで残りの3辺を囲む長方形の面積は、かべと直角な辺が $□\\,\\mathrm{m}$ のとき最大で、$□\\,\\mathrm{m^2}$`
          : `長さ $${L}\\,\\mathrm{${u}}$ の${rope ? 'ロープで囲む' : '針金でつくる'}長方形の面積は、たてが $□\\,\\mathrm{${u}}$ のとき最大で、$□\\,\\mathrm{${u}^2}$`;
        return {
          q, a: `$${fmtF(x)}\\,\\mathrm{${u}}$、$${fmtF(S)}\\,\\mathrm{${u}^2}$`, key: `${wall}:${L}`,
          easy: wall ? `$S=x(${L}-2x)$、$S'=${L}-4x=0$ → $x=${fmtF(x)}$（横は $${L / 2}$）` : `$S=x(${L / 2}-x)$、$S'=${L / 2}-2x=0$ → $x=${fmtF(x)}$（正方形）`, easyCheck: false,
          verify: p => { const s = scan(t => (wall ? t * (L - 2 * t) : t * (L / 2 - t)), 0, L / 2), v = numsOf(p.a); return (close(s.xmx, v[0], 1e-5) && close(s.mx, v[1], 1e-7)) || `最大は x=${s.xmx} で ${s.mx}`; },
        };
      },
      // 箱（教科書 5-7 例題6）：x＝a/6
      s2(r) {
        const a = 3 * r.int(2, 12), x = fr(a, 6), V = F.mul(x, fr(4 * a * a, 9)), giveV = r.chance(0.35);
        const scanV = () => scan(t => t * (a - 2 * t) * (a - 2 * t), 0, a / 2, 900);
        if (giveV) return {
          q: `箱の体積 $V=x(${a}-2x)^{2}$（$0<x<${fmtF(fr(a, 2))}$）が最大になる $x$`, a: `$${fmtF(x)}$`, key: `v${a}`,
          easy: `$V'=(${a}-2x)^{2}-4x(${a}-2x)=(${a}-2x)(${a}-6x)$。範囲の中の解は $x=${fmtF(x)}$`, easyCheck: false,
          verify: p => close(scanV().xmx, numOf(p.a), 1e-5) || '最大になる x がちがう',
        };
        return {
          q: `1辺 $${a}\\,\\mathrm{cm}$ の正方形の紙の4すみから、1辺 $x\\,\\mathrm{cm}$ の正方形を切りとって、ふたのない箱をつくる。体積は $x=□$ のとき最大で、$□\\,\\mathrm{cm^3}$`, a: `$x=${fmtF(x)}$、$${fmtF(V)}\\,\\mathrm{cm^3}$`, key: `b${a}`,
          easy: `$V=x(${a}-2x)^{2}$（$0<x<${fmtF(fr(a, 2))}$）、$V'=(${a}-2x)(${a}-6x)=0$ → $x=${fmtF(x)}$`, easyCheck: false,
          verify: p => { const s = scanV(), v = numsOf(p.a); return (close(s.xmx, v[0], 1e-5) && close(s.mx, v[1], 1e-7)) || `最大は x=${s.xmx} で ${s.mx}`; },
        };
      },
      // 缶（例題7）・電池（例題8）・図のかべ（まん中を仕切る）・図の紙（底の1辺と深さ）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const r0 = r.int(1, 5), c = 2 * r0 * r0 * r0, ST = `2\\pi r^{2}+\\frac{${2 * c}\\pi}{r}`;
          return {
            q: `体積 $${c}\\pi\\,\\mathrm{cm^3}$ の、ふたのある円柱の缶をつくる。半径を $r\\,\\mathrm{cm}$ とすると、表面積は $S=${ST}$。$S$ は $r=□$ のとき最小で、そのときの高さは $□\\,\\mathrm{cm}$`, a: `$r=${r0}$、$${2 * r0}\\,\\mathrm{cm}$`, key: `can${r0}`,
            easy: `$S'=4\\pi r-\\frac{${2 * c}\\pi}{r^{2}}=0$ → $r^{3}=${r0 * r0 * r0}$、$r=${r0}$。高さ $\\frac{${c}}{${r0}^{2}}=${2 * r0}$（直径と等しい）`, easyCheck: false,
            verify: p => { const s = scan(fnum(ST, 'r'), 0.2, 3 * r0 + 2, 900), v = numsOf(p.a); return (close(s.xmn, v[0], 1e-5) && close(c / (s.xmn * s.xmn), v[1], 1e-4)) || `最小は r=${s.xmn}`; },
          };
        }
        if (k === 1) {
          const [E, r0] = r.pick([[12, 2], [6, 3], [10, 5], [12, 4], [12, 3], [6, 1], [8, 2], [8, 4], [10, 1], [6, 2], [12, 6], [4, 1], [4, 2], [10, 2], [20, 5], [20, 4]]);
          const PT2 = `\\frac{${E * E}R}{(R+${r0})^{2}}`, Pm = fr(E * E, 4 * r0);
          return {
            q: `電圧 $${E}\\,\\mathrm{V}$、内部抵抗 $${r0}\\,\\Omega$ の電池に、抵抗 $R$ の器具をつなぐと、器具の電力は $P=${PT2}$（W）。$P$ は $R=□\\,\\Omega$ のとき最大で、$□\\,\\mathrm{W}$`, a: `$R=${r0}\\,\\Omega$、$${fmtF(Pm)}\\,\\mathrm{W}$`, key: `bat${E}:${r0}`, boxh: '11mm',
            easy: `$P'=\\frac{${E * E}(${r0}-R)}{(R+${r0})^{3}}$。$R=${r0}$（内部抵抗と同じ）の前後で ＋ から －。$P=\\frac{${E * E * r0}}{${4 * r0 * r0}}=${fmtF(Pm)}$`, easyCheck: false,
            verify: p => { const s = scan(fnum(PT2, 'R'), 0.01, 6 * r0 + 4, 900), v = numsOf(p.a); return (close(s.xmx, v[0], 1e-5) && close(s.mx, v[1], 1e-7)) || `最大は R=${s.xmx} で ${s.mx}`; },
          };
        }
        if (k === 2) {
          const n = r.pick([2, 3, 3]), L = n === 3 ? 6 * r.pick([2, 3, 4, 5, 6, 8, 10]) : 4 * r.pick([3, 5, 6, 7, 9, 11, 13, 15]), x = fr(L, 2 * n), S = fr(L * L, 4 * n);
          return {
            q: `図のように、かべを1辺にして、長さ $${L}\\,\\mathrm{m}$ のロープ（太い線）で長方形を囲${n === 3 ? 'み、まん中も仕切る' : 'む'}。面積は $x=□$ のとき最大で、$□\\,\\mathrm{m^2}$`, a: `$x=${fmtF(x)}$、$${fmtF(S)}\\,\\mathrm{m^2}$`, key: `w${n}:${L}`,
            easy: `横は $${L}-${n}x$。$S=x(${L}-${n}x)$、$S'=${L}-${2 * n}x=0$ → $x=${fmtF(x)}$`, easyCheck: false,
            verify: p => { const s = scan(t => t * (L - n * t), 0, L / n), v = numsOf(p.a); return (close(s.xmx, v[0], 1e-5) && close(s.mx, v[1], 1e-7)) || `最大は x=${s.xmx} で ${s.mx}`; },
            fig: wallFig(n),
          };
        }
        const a = 6 * r.int(1, 8), x = a / 6;
        return {
          q: `図の紙の4すみ（1辺 $x\\,\\mathrm{cm}$ の正方形）を切りとり、点線で折って箱をつくる。体積が最大のとき、底の1辺は $□\\,\\mathrm{cm}$、深さは $□\\,\\mathrm{cm}$`, a: `底の1辺 $${a - 2 * x}\\,\\mathrm{cm}$、深さ $${x}\\,\\mathrm{cm}$`, key: `p${a}`,
          easy: `$V=x(${a}-2x)^{2}$、$V'=(${a}-2x)(${a}-6x)=0$ → $x=${x}$。底の1辺は $${a}-2\\times${x}=${a - 2 * x}$`, easyCheck: false,
          verify: p => { const s = scan(t => t * (a - 2 * t) * (a - 2 * t), 0, a / 2, 900), v = numsOf(p.a); return (close(a - 2 * s.xmx, v[0], 1e-4) && close(s.xmx, v[1], 1e-5)) || `最大は x=${s.xmx}`; },
          fig: paperFig(a),
        };
      },
      // わな：いちばんを聞いていない（形が決まっている。式に入れるだけ）
      trap(r) {
        const h = r.pick([8, 10, 12, 14, 15, 16, 18, 20, 25, 30]), d = r.int(1, 6) * (h % 2 === 0 ? 2 : 1), yoko = (h - d) / 2, tate = (h + d) / 2;
        if (yoko <= 0 || yoko !== Math.round(yoko)) return null;
        return dest({
          q: `$${2 * h}\\,\\mathrm{m}$ のロープで囲む、たてが横より $${d}\\,\\mathrm{m}$ 長い長方形の面積 $□\\,\\mathrm{m^2}$`, a: `$${tate * yoko}$`,
          verify: p => { const v = numOf(p.a); for (let y = 0.5; y < h; y += 0.5) if (2 * (y + y + d) === 2 * h) return close(y * (y + d), v) || `面積は ${y * (y + d)}`; return '長方形ができない'; },
        }, '5-26', `いちばんを聞いていない。形が決まっているので、微分はいらない。たて＋横 $=${h}$ より、たて $${tate}$、横 $${yoko}$`);
      },
    },
  });

  // ================================================================ 5-27
  // 速度の式 v=at+b の TeX（a・b は整数）
  const vLin = (a, b) => (a === 0 ? `${b}` : b === 0 ? `${cf(a)}t` : a < 0 ? `${b}-${cf(-a)}t` : `${cf(a)}t+${b}`);
  // 「次の位置＝今の位置＋今の速度×Δt」を分数でくり返す（検算用。問題の速度の式を読む）
  function eulerF(VT, x0, t0, dt, n) {
    let x = F.fromDec(String(x0)), t = F.fromDec(String(t0)); const h = F.fromDec(String(dt)), out = [];
    for (let k = 0; k < n; k++) { const v = ev(VT, { t: F.val(t) }); x = F.add(x, F.mul(F.fromDec(fmt(v)), h)); t = F.add(t, h); out.push(F.val(x)); }
    return out;
  }
  M.add({
    id: '5-27', part: PART, chap: '5-8①', stars: 1,
    title: '次の位置 $\\approx$ 今の位置＋今の速度×$\\Delta t$（くり返すときは区間のはじめの速度）',
    mark: '「□秒後の位置を予想」。今の位置と速度（または速度の式）と、短い時間 $\\Delta t$。',
    futsu: ['位置の式を作ってから、時刻を入れる', '（速度から位置の式を作るには、', '積分がいる）。'],
    raku: ['$100\\,\\mathrm{m}$ の所を $15\\,\\mathrm{m/s}$、0.2秒後', '$100+15\\times0.2=103\\,\\mathrm{m}$', '$v=2t$ を1秒ごと：$0\\to0\\to2\\to6$'],
    why: '速度は $v=\\frac{\\dd x}{\\dd t}$ なので、$\\Delta t$ が小さいとき $\\frac{\\Delta x}{\\Delta t}\\approx v$、つまり $\\Delta x\\approx v\\,\\Delta t$（5-8①）。短い時間なら、そのあいだの速度はほぼ変わらないと見てよい。これをくり返して少しずつ先を予想するのがオイラー法で、$\\Delta t$ を小さくするほど、ほんとうの値に近づく。',
    caution: 'くり返すときに使うのは、区間の**はじめ**の速度（$v=2t$ の1秒の位置は $0+0\\times1=0$。おわりの速度2を使わない）。速度がマイナスなら、マイナスのままかける。予想は「$\\approx$」で、ぴったりの値ではない。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '14mm',
    fits(q) { return /予想/.test(q); },
    steps: {
      // 1歩だけ（教科書 5-8 例題1（1））
      s1(r) {
        const [obj, lo, hi] = r.pick([['走る車', 10, 30], ['走る自転車', 3, 10], ['走る電車', 15, 40], ['進む船', 2, 12]]);
        const x0 = r.pick([20, 30, 50, 80, 100, 120, 150, 200]), v = r.int(lo, hi), dt = r.pick([0.1, 0.2, 0.4, 0.5]);
        const ans = fmt(x0 + v * dt);
        return {
          q: `位置 $${x0}\\,\\mathrm{m}$ の所を $${v}\\,\\mathrm{m/s}$ で${obj}の、${dt}秒後の位置の予想 $x\\approx□\\,\\mathrm{m}$`, a: `$${ans}$`, key: `${x0}:${v}:${dt}`,
          easy: `$${x0}+${v}\\times${dt}=${ans}$`,
          verify: p => close(eulerF(`${v}`, x0, 0, dt, 1)[0], numOf(p.a)) || 'ちがう',
        };
      },
      // 速度がマイナス（例題1（2））・速度の式から今の速度を出す
      s2(r) {
        if (r.chance(0.45)) {
          const x0 = r.pick([10, 20, 30, 50, 80, 100]), v = -r.int(2, 9), dt = r.pick([0.1, 0.2, 0.4, 0.5]), ans = fmt(x0 + v * dt);
          return {
            q: `位置 $${x0}\\,\\mathrm{m}$ の所を、速度 $${v}\\,\\mathrm{m/s}$ で動く物体の、${dt}秒後の位置の予想 $x\\approx□\\,\\mathrm{m}$`, a: `$${ans}$`, key: `${x0}:${v}:${dt}`,
            easy: `$${x0}+(${v})\\times${dt}=${ans}$`,
            verify: p => close(eulerF(`${v}`, x0, 0, dt, 1)[0], numOf(p.a)) || 'ちがう',
          };
        }
        const a = r.pick([2, 3, 4, 5, 10, -2, -4]), b = a < 0 ? r.pick([20, 30]) : r.pick([0, 0, 1, 2, 5]), t0 = r.int(1, 4), x0 = r.int(2, 40), dt = r.pick([0.1, 0.2, 0.5]);
        const VT = vLin(a, b), v = a * t0 + b, ans = fmt(x0 + v * dt);
        return {
          q: `速度 $v=${VT}$（m/s）の物体が、$t=${t0}$ のとき位置 $${x0}\\,\\mathrm{m}$ にいる。${dt}秒後の位置の予想 $x\\approx□\\,\\mathrm{m}$`, a: `$${ans}$`, key: `${VT}:${t0}:${x0}:${dt}`,
          easy: `今の速度は $${v}$。$${x0}+${v}\\times${dt}=${ans}$`, easyCheck: 'last',
          verify: p => { const m = /\$v=([^$]*)\$/.exec(p.q); return close(eulerF(m[1], x0, t0, dt, 1)[0], numOf(p.a)) || 'ちがう'; },
        };
      },
      // くり返す（例題2・3）：3歩の予想をならべる・最後の予想とほんとうの位置の差
      s3(r) {
        const a = r.pick([2, 4, 6, 10, -2, -4]), b = a < 0 ? r.pick([10, 20]) : r.pick([0, 0, 1, 3]), dt = r.pick([1, 1, 0.5]), x0 = r.chance(0.25) ? r.int(1, 10) : 0;
        const VT = vLin(a, b), xs = [x0], ts = [0];
        for (let k = 0; k < 3; k++) { xs.push(xs[k] + (a * ts[k] + b) * dt); ts.push(ts[k] + dt); }
        const lead = `速度 $v=${VT}$（m/s）、$t=0$ で位置 $${x0}\\,\\mathrm{m}$。${dt}秒ごとに予想をくり返すと、`;
        const chain = xs.map(fmt).join('\\to');
        const getV = p => /\$v=([^$]*)\$/.exec(p.q)[1];
        if (r.chance(0.6)) return {
          q: `${lead}${ts.slice(1).map(t => fmt(t)).join('・')}秒の位置の予想は、順に □、□、$□\\,\\mathrm{m}$`, a: xs.slice(1).map(x => `$${fmt(x)}$`).join('、'), key: `${VT}:${dt}:${x0}`,
          easy: `はじめの速度は $${[0, 1, 2].map(k => fmt(a * ts[k] + b)).join('$、$')}$。$${chain}$`, easyCheck: false,
          verify: p => { const e = eulerF(getV(p), x0, 0, dt, 3), v = numsOf(p.a); return (v.length === 3 && e.every((x, k) => close(x, v[k]))) || `予想は ${e}`; },
        };
        const XP = PP.make(x0, b, fr(a, 2)), real = F.val(PP.at(XP, F.fromDec(fmt(ts[3])))), diff = fmt(Math.abs(xs[3] - real));
        return {
          q: `${lead}${fmt(ts[3])}秒の位置の予想は $□\\,\\mathrm{m}$。ほんとうの位置 $x=${PT(XP, 't')}$ との差は $□\\,\\mathrm{m}$`, a: `$${fmt(xs[3])}$、$${diff}$`, key: `d${VT}:${dt}:${x0}`,
          easy: `$${chain}$。ほんとうは $${fmt(real)}$`, easyCheck: false,
          verify: p => { const e = eulerF(getV(p), x0, 0, dt, 3), v = numsOf(p.a), X = /\$x=([^$]*)\$/.exec(p.q)[1]; return (close(e[2], v[0]) && close(Math.abs(e[2] - ev(X, { t: ts[3] })), v[1]) && [0.3, 1.1].every(t => close(dnum(X, t, 't'), ev(getV(p), { t }), 1e-6))) || `予想は ${e[2]}`; },
        };
      },
      // わな：位置の式がわかっている（予想はいらない。式に入れる）
      trap(r) {
        const k = r.pick([1, 2, 3, 5]), t0 = r.int(1, 4), dt = r.pick([0.1, 0.5, 1]), t1 = fmt(t0 + dt), X = `${cf(k)}t^{2}`;
        const ans = fdec(F.mul(fr(k), F.mul(F.fromDec(t1), F.fromDec(t1))));
        return dest({
          q: `位置が $x=${X}$（m）の物体の、$t=${t0}$ の${dt}秒後の位置 $□\\,\\mathrm{m}$`, a: `$${ans}$`,
          verify: p => close(ev(/\$x=([^$]*)\$/.exec(p.q)[1], { t: t0 + dt }), numOf(p.a)) || 'ちがう',
        }, '5-27', `位置の式がわかっているので、近似はいらない。$t=${t1}$ を入れて $${k === 1 ? '' : `${k}\\times`}${t1}^{2}=${ans}$`);
      },
    },
  });

  // ================================================================ 5-28
  // 問題の式（$…$）の中の、はじめの小数が1に近いか（5-29 の形）
  const near1 = q => { const m = /\d+\.\d+/.exec((q.match(/\$[^$]*\$/g) || []).join(' ')); return !!m && Math.abs(+m[0] - 1) <= 0.2; };
  const fD = f => fdec(f);
  const DELTAS = [[1, 100], [1, 50], [1, 40], [3, 100], [1, 25], [1, 20], [1, 10]];   // 答えの小数の部分（0.01〜0.1）
  // 1次近似の値を、問題の文から別の道すじで出す：f(a)+f'(a)h（f' は数値の微分）
  const lin1 = (fT, a, h) => ev(fT, { x: a }) + dnum(fT, a) * h;
  M.add({
    id: '5-28', part: PART, chap: '5-8②', stars: 1,
    title: '1次近似 $f(a+h)\\approx f(a)+f\'(a)h$：$\\sqrt{\\phantom{9}}$ は近い平方数を $a$ に',
    mark: '$\\sqrt{9.2}$・$\\sqrt{25.5}$ のように、平方数に近い数のルート。$2.01^3$ のように、きりのよい数から少しだけずれた数の計算。',
    futsu: ['$3.03^2=9.1809$、$3.04^2=9.2416$ …と', '2乗して近い数をさがしていく', '（けたの多いかけ算を何度もする）。'],
    raku: ['$\\sqrt{9.2}$：$a=9$、$h=0.2$', '$f(9)=3$、$f\'(9)=\\frac{1}{2\\sqrt{9}}=\\frac{1}{6}$', '$\\sqrt{9.2}\\approx3+\\frac{1}{6}\\times0.2\\approx3.033$'],
    why: '点 $(a,\\ f(a))$ の近くでは、グラフと接線はほとんど重なる。接線の上では、$a$ から $h$ 進むと高さが $f\'(a)\\times h$ だけ変わるので、$f(a+h)\\approx f(a)+f\'(a)h$（5-8②）。$\\sqrt{x}$ の微分は $\\frac{1}{2\\sqrt{x}}$（5-6）なので、$a$ を平方数にすると $f(a)$ も $f\'(a)$ もすぐ出る。',
    caution: '$h$ が大きいと使えない（$\\sqrt{9}$ を $a=4$、$h=5$ で近似すると3.25になってしまう）。目安は、$h$ が $a$ よりずっと小さいとき。近似した値は「$=$」ではなく「$\\approx$」で書く。$a$ より小さい数なら、$h$ はマイナス。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '12mm', s2: '14mm', s3: '16mm', trap: '14mm' },
    fits(q) { return /1次近似/.test(q) && !near1(q); },
    steps: {
      // ルート（h はプラス。答えがきれいな小数になる数。教科書 5-8 例題4）
      s1(r) {
        const m = r.int(2, 10), d = fr(...r.pick(DELTAS)), h = F.mul(fr(2 * m), d);
        if ((h[0] * 100) % h[1] !== 0 || F.val(h) / (m * m) > 0.07) return null;
        const N = fD(F.add(fr(m * m), h)), ans = fD(F.add(fr(m), d));
        if (N.length > 4) return null;                                   // 2列に入る長さ
        return {
          q: `1次近似で $\\sqrt{${N}}\\approx□$`, a: `$${ans}$`, key: `s${N}`,
          easy: `$a=${m * m}$、$h=${fD(h)}$。$${m}+\\frac{1}{${2 * m}}\\times${fD(h)}=${ans}$`, easyCheck: 'last',
          verify: p => { const n = +/\\sqrt\{([\d.]+)\}/.exec(p.q)[1], a = Math.pow(Math.round(Math.sqrt(n)), 2); return (close(lin1('\\sqrt{x}', a, n - a), numOf(p.a), 1e-9) && Math.abs(Math.sqrt(n) - numOf(p.a)) < 0.01) || '1次近似の値がちがう'; },
        };
      },
      // h がマイナス・小数第3位まで（わり切れない）・a^n（教科書 5-8 章末）
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const m = r.int(2, 10), d = fr(...r.pick(DELTAS)), h = F.mul(fr(2 * m), d);
          if ((h[0] * 100) % h[1] !== 0 || F.val(h) / (m * m) > 0.07) return null;
          const N = fD(F.sub(fr(m * m), h)), ans = fD(F.sub(fr(m), d));
          return {
            q: `1次近似で $\\sqrt{${N}}\\approx□$`, a: `$${ans}$`, key: `s${N}`,
            easy: `$a=${m * m}$、$h=-${fD(h)}$。$${m}-\\frac{1}{${2 * m}}\\times${fD(h)}=${ans}$`, easyCheck: 'last',
            verify: p => { const n = +/\\sqrt\{([\d.]+)\}/.exec(p.q)[1], a = Math.pow(Math.round(Math.sqrt(n)), 2); return (close(lin1('\\sqrt{x}', a, n - a), numOf(p.a), 1e-9) && Math.abs(Math.sqrt(n) - numOf(p.a)) < 0.01) || '1次近似の値がちがう'; },
          };
        }
        if (k === 1) {
          const m = r.pick([3, 6, 7, 9]), h10 = r.int(1, Math.min(9, Math.floor(m * m * 0.6))) * (r.chance(0.3) ? -1 : 1), d = fr(h10, 20 * m);
          if (termDec(d)) return null;
          const val = m + F.val(d), t = val * 1000, ans = (Math.round(t) / 1000).toFixed(3);
          if (Math.abs(t - Math.floor(t) - 0.5) < 1e-6) return null;
          const N = fD(fr(10 * m * m + h10, 10)), hT = fD(fr(h10, 10));
          return {
            q: `1次近似で $\\sqrt{${N}}\\approx□$（四捨五入して小数第3位まで）`, a: `$${ans}$`, key: `s${N}`,
            easy: `$a=${m * m}$、$h=${hT}$。$${m}${h10 < 0 ? '-' : '+'}\\frac{1}{${2 * m}}\\times${fD(fr(Math.abs(h10), 10))}=${m}${h10 < 0 ? '-' : '+'}${(Math.abs(F.val(d))).toFixed(5).slice(0, 6)}\\cdots$`, easyCheck: false,
            verify: p => { const n = +/\\sqrt\{([\d.]+)\}/.exec(p.q)[1], a = Math.pow(Math.round(Math.sqrt(n)), 2), v = lin1('\\sqrt{x}', a, n - a); return (Math.abs(v - numOf(p.a)) <= 0.0005 + 1e-9 && /^\$\d\.\d{3}\$$/.test(p.a)) || `1次近似は ${v}`; },
          };
        }
        const a = r.pick([2, 3, 4, 5, 10]), n = r.pick([2, 3, 3]), h = fr(r.pick(a === 10 ? [1, 2, -1, 10, -10] : [1, 2, -1, -2]), 100);
        const ans = fD(F.add(fr(Math.pow(a, n)), F.mul(fr(n * Math.pow(a, n - 1)), h))), base = fD(F.add(fr(a), h));
        return {
          q: `1次近似で $${base}^{${n}}\\approx□$`, a: `$${ans}$`, key: `p${base}:${n}`,
          easy: `$f(x)=x^{${n}}$、$a=${a}$、$h=${fD(h)}$。$${Math.pow(a, n)}+${n * Math.pow(a, n - 1)}\\times${par(fD(h))}=${ans}$`, easyCheck: 'last',
          verify: p => { const m = /\$([\d.]+)\^\{(\d)\}/.exec(p.q), b = +m[1], a0 = Math.round(b); return close(lin1(`x^{${m[2]}}`, a0, b - a0), numOf(p.a), 1e-9) || '1次近似の値がちがう'; },
        };
      },
      // 文章（立方体の体積・正方形の1辺）・逆数・3乗根
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const a = r.pick([2, 3, 4, 5, 10]), h = fr(r.pick(a === 10 ? [1, 2, -1] : [1, 2, -1, -2]), a === 10 ? 10 : 100), x = fD(F.add(fr(a), h));
          const ans = fD(F.add(fr(a * a * a), F.mul(fr(3 * a * a), h)));
          return {
            q: `1辺 $${x}\\,\\mathrm{cm}$ の立方体の体積を1次近似で求めると、およそ $□\\,\\mathrm{cm^3}$`, a: `$${ans}$`, key: `c${x}`,
            easy: `$${a}^{3}+3\\times${a}^{2}\\times${par(fD(h))}=${ans}$`,
            verify: p => { const b = +/\$([\d.]+)\\,/.exec(p.q)[1], a0 = Math.round(b); return close(lin1('x^{3}', a0, b - a0), numOf(p.a), 1e-9) || 'ちがう'; },
          };
        }
        if (k === 1) {
          const m = r.int(2, 10), d = fr(...r.pick(DELTAS)), h = F.mul(fr(2 * m), d);
          if ((h[0] * 100) % h[1] !== 0 || F.val(h) / (m * m) > 0.07) return null;
          const N = fD(F.add(fr(m * m), h)), ans = fD(F.add(fr(m), d));
          return {
            q: `面積 $${N}\\,\\mathrm{cm^2}$ の正方形の1辺を1次近似で求めると、およそ $□\\,\\mathrm{cm}$`, a: `$${ans}$`, key: `q${N}`,
            easy: `1辺は $\\sqrt{${N}}$。$${m}+\\frac{1}{${2 * m}}\\times${fD(h)}=${ans}$`, easyCheck: 'last',
            verify: p => { const n = +/\$([\d.]+)\\,/.exec(p.q)[1], a = Math.pow(Math.round(Math.sqrt(n)), 2); return close(lin1('\\sqrt{x}', a, n - a), numOf(p.a), 1e-9) || 'ちがう'; },
          };
        }
        if (k === 2) {
          const a = r.pick([2, 4, 5, 10]), dl = fr(r.pick([1, 2, 4, 5, -1, -2, -5]), 1000), h = F.mul(fr(-a * a), dl);   // 1/x：値が dl 変わる h
          const x = fD(F.add(fr(a), h)), ans = fD(F.add(fr(1, a), dl));
          if (Math.abs(F.val(h)) / a > 0.045 || (h[0] * 100) % h[1] !== 0) return null;
          return {
            q: `1次近似で $\\frac{1}{${x}}\\approx□$`, a: `$${ans}$`, key: `i${x}`, boxh: '11mm',
            easy: `$f(x)=\\frac{1}{x}$、$f'(x)=-\\frac{1}{x^{2}}$、$a=${a}$、$h=${fD(h)}$。$${fD(fr(1, a))}-\\frac{1}{${a * a}}\\times${par(fD(h))}=${ans}$`, easyCheck: 'last',
            verify: p => { const b = +/\\frac\{1\}\{([\d.]+)\}/.exec(p.q)[1], a0 = Math.round(b); return close(lin1('\\frac{1}{x}', a0, b - a0), numOf(p.a), 1e-9) || 'ちがう'; },
          };
        }
        const m = r.pick([2, 3, 4, 5]), dl = fr(r.pick([1, 2, -1, -2]), 100), h = F.mul(fr(3 * m * m), dl), N = fD(F.add(fr(m * m * m), h)), ans = fD(F.add(fr(m), dl));
        return {
          q: `1次近似で $\\sqrt[3]{${N}}\\approx□$`, a: `$${ans}$`, key: `r${N}`,
          easy: `$f(x)=x^{\\frac{1}{3}}$、$f'(x)=\\frac{1}{3}x^{-\\frac{2}{3}}$、$a=${m * m * m}$、$h=${fD(h)}$。$${m}+\\frac{1}{${3 * m * m}}\\times${par(fD(h))}=${ans}$`, easyCheck: 'last',
          verify: p => { const n = +/\\sqrt\[3\]\{([\d.]+)\}/.exec(p.q)[1], a = Math.pow(Math.round(Math.cbrt(n)), 3); return close(lin1('\\sqrt[3]{x}', a, n - a), numOf(p.a), 1e-9) || 'ちがう'; },
        };
      },
      // わな：ちょうどの値がある（近似はいらない。近い平方数からは h が大きい）
      trap(r) {
        const m = r.int(1, 8), v = fD(fr(2 * m + 1, 2)), N = fD(fr((2 * m + 1) * (2 * m + 1), 4));
        return dest({
          q: `$\\sqrt{${N}}=□$`, a: `$${v}$`,
          verify: p => close(Math.pow(numOf(p.a), 2), +/\\sqrt\{([\d.]+)\}/.exec(p.q)[1], 1e-12) || '2乗してもどらない',
        }, '5-28', `$${v}^{2}=${N}$ なので、ちょうど $${v}$。近似はいらない。近い平方数の $${m * m}$・$${(m + 1) * (m + 1)}$ からは $h$ が大きく、1次近似ではずれる`);
      },
    },
  });

  // ================================================================ 5-29
  // (1+h)^n の n を、問題の式の形から読む（検算用）：べき・逆数・ルート・3乗根
  function readNear1(q) {
    const s = (q.match(/\$[^$]*\$/g) || []).join(' ');
    let m;
    if ((m = /\\frac\{1\}\{\\sqrt\{([\d.]+)\}\}/.exec(s))) return { b: +m[1], n: -0.5 };
    if ((m = /\\frac\{1\}\{([\d.]+)\^\{(\d+)\}\}/.exec(s))) return { b: +m[1], n: -m[2] };
    if ((m = /\\frac\{1\}\{([\d.]+)\}/.exec(s))) return { b: +m[1], n: -1 };
    if ((m = /\\sqrt\[3\]\{([\d.]+)\}/.exec(s))) return { b: +m[1], n: 1 / 3 };
    if ((m = /\\sqrt\{([\d.]+)\}/.exec(s))) return { b: +m[1], n: 0.5 };
    if ((m = /([\d.]+)\^\{(\d+)\}/.exec(s))) return { b: +m[1], n: +m[2] };
    return null;
  }
  // 別の道すじ：x^n の x=1 での数値の微分から 1+f'(1)h
  const near1Check = p => { const o = readNear1(p.q); if (!o) return '式が読めない'; const h = 1e-6, d = (Math.pow(1 + h, o.n) - Math.pow(1 - h, o.n)) / (2 * h); return close(1 + d * (o.b - 1), numOf(p.a), 1e-8) || `1次近似は ${1 + d * (o.b - 1)}`; };
  const baseT = h => fD(F.add(fr(1), h));
  const hPick = (r, list) => { const v = r.pick(list); return fr(r.chance(0.4) ? -v : v, 1000); };
  M.add({
    id: '5-29', part: PART, chap: '5-8④', stars: 1,
    title: '$(1+h)^n\\approx1+nh$（$\\dfrac{1}{1+h}\\approx1-h$、$\\sqrt{1+h}\\approx1+\\dfrac{h}{2}$）',
    mark: '1に近い数（$1.02$・$0.99$）の $n$ 乗・逆数・ルート。',
    futsu: ['$1.02\\times1.02\\times\\cdots$ と、', '筆算で4回かけ算する', '（$1.1040808032$。', 'けたがどんどんふえる）。'],
    raku: ['$1.02^5=(1+0.02)^5\\approx1+5\\times0.02=1.1$', '$\\frac{1}{0.98}=(1-0.02)^{-1}\\approx1.02$', '$\\sqrt{0.96}=(1-0.04)^{\\frac{1}{2}}\\approx0.98$'],
    why: '$f(x)=x^n$ の、$x=1$ での1次近似。$f(1)=1$、$f\'(1)=n$ なので $(1+h)^n\\approx1+nh$（5-8④）。$n$ はマイナスや分数でもよいので、$\\frac{1}{1+h}=(1+h)^{-1}\\approx1-h$、$\\sqrt{1+h}=(1+h)^{\\frac{1}{2}}\\approx1+\\frac{h}{2}$。数えていないのは、$h^2$ より小さい項だけ。',
    caution: '$h$ が小さいときだけ使う（$1.5^4$ を $1+4\\times0.5=3$ としない。ほんとうは5.0625）。1より小さい数は、$h$ がマイナス（$0.99=1+(-0.01)$）。逆数では符号が反対になる（$\\frac{1}{0.98}\\approx1.02$）。',
    counts: { s1: 8, s2: 8, s3: 5, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '12mm', s2: '12mm', s3: '16mm', trap: '14mm' },
    fits(q) { return /1次近似/.test(q) && near1(q); },
    steps: {
      // (1+h)^n（教科書 5-8 例題5）
      s1(r) {
        const n = r.int(2, 10), h = hPick(r, [10, 20, 30, 40, 50, 5, 2, 1]);
        if (Math.abs(n * F.val(h)) > 0.2) return null;
        const b = baseT(h), ans = fD(F.add(fr(1), F.mul(fr(n), h)));
        return {
          q: `1次近似で $${b}^{${n}}\\approx□$`, a: `$${ans}$`, key: `${b}:${n}`,
          easy: `$1+${n}\\times${par(fD(h))}=${ans}$`, verify: near1Check,
        };
      },
      // 逆数・ルート（例題6）
      s2(r) {
        if (r.chance(0.5)) {
          const h = hPick(r, [10, 20, 30, 40, 50, 60, 80, 5]), b = baseT(h), ans = fD(F.sub(fr(1), h));
          return {
            q: `1次近似で $\\frac{1}{${b}}\\approx□$`, a: `$${ans}$`, key: `i${b}`, boxh: '11mm',
            easy: `$(1${F.val(h) < 0 ? '-' : '+'}${fD([Math.abs(h[0]), h[1]])})^{-1}$ なので $n=-1$。$1+(-1)\\times${par(fD(h))}=${ans}$`, easyCheck: 'last', verify: near1Check,
          };
        }
        const h = hPick(r, [20, 40, 60, 80, 100, 10, 30]), b = baseT(h), ans = fD(F.add(fr(1), F.mul(fr(1, 2), h)));
        return {
          q: `1次近似で $\\sqrt{${b}}\\approx□$`, a: `$${ans}$`, key: `s${b}`,
          easy: `$(1${F.val(h) < 0 ? '-' : '+'}${fD([Math.abs(h[0]), h[1]])})^{\\frac{1}{2}}$ なので $n=\\frac{1}{2}$。$1+\\frac{1}{2}\\times${par(fD(h))}=${ans}$`, easyCheck: 'last', verify: near1Check,
        };
      },
      // 利息・立方体の体積（何倍）・(1+h)^{-2}・ルートの逆数・3乗根
      s3(r) {
        const k = r.pick([0, 0, 1, 1, 2, 3, 4]);
        if (k === 0) {
          const pc = r.pick([1, 2, 3, 0.5]), n = r.pick([2, 3, 4, 5, 10]), h = F.fromDec(String(pc / 100));
          if (pc * n > 20) return null;
          const b = baseT(h), ans = fD(F.add(fr(1), F.mul(fr(n), h)));
          return {
            q: `1年に${pc}%の利息がつく預金は、${n}年で $${b}^{${n}}$ 倍になる。1次近似で、およそ □ 倍`, a: `$${ans}$`, key: `r${b}:${n}`,
            easy: `$1+${n}\\times${fD(h)}=${ans}$`, verify: near1Check,
          };
        }
        if (k === 1) {
          const pc = r.pick([1, 2, 3, 0.5]), sq = r.chance(0.4), n = sq ? 2 : 3, h = F.fromDec(String(pc / 100)), b = baseT(h), ans = fD(F.add(fr(1), F.mul(fr(n), h)));
          return {
            q: `${sq ? '正方形' : '立方体'}の1辺を${pc}%長くすると、${sq ? '面積' : '体積'}は $${b}^{${n}}$ 倍になる。1次近似で、およそ □ 倍`, a: `$${ans}$`, key: `v${b}:${n}`,
            easy: `$1+${n}\\times${fD(h)}=${ans}$`, verify: near1Check,
          };
        }
        if (k === 2) {
          const n = r.pick([2, 3]), h = hPick(r, [10, 20, 30, 5]), b = baseT(h), ans = fD(F.sub(fr(1), F.mul(fr(n), h)));
          return {
            q: `1次近似で $\\frac{1}{${b}^{${n}}}\\approx□$`, a: `$${ans}$`, key: `j${b}:${n}`, boxh: '11mm',
            easy: `$(1${F.val(h) < 0 ? '-' : '+'}${fD([Math.abs(h[0]), h[1]])})^{-${n}}$ なので $n=-${n}$。$1+(-${n})\\times${par(fD(h))}=${ans}$`, easyCheck: 'last', verify: near1Check,
          };
        }
        if (k === 3) {
          const h = hPick(r, [20, 40, 60, 80]), b = baseT(h), ans = fD(F.sub(fr(1), F.mul(fr(1, 2), h)));
          return {
            q: `1次近似で $\\frac{1}{\\sqrt{${b}}}\\approx□$`, a: `$${ans}$`, key: `k${b}`, boxh: '11mm',
            easy: `$(1${F.val(h) < 0 ? '-' : '+'}${fD([Math.abs(h[0]), h[1]])})^{-\\frac{1}{2}}$ なので $n=-\\frac{1}{2}$。$1-\\frac{1}{2}\\times${par(fD(h))}=${ans}$`, easyCheck: 'last', verify: near1Check,
          };
        }
        const h = hPick(r, [30, 60, 90, 120]), b = baseT(h), ans = fD(F.add(fr(1), F.mul(fr(1, 3), h)));
        return {
          q: `1次近似で $\\sqrt[3]{${b}}\\approx□$`, a: `$${ans}$`, key: `c${b}`,
          easy: `$(1${F.val(h) < 0 ? '-' : '+'}${fD([Math.abs(h[0]), h[1]])})^{\\frac{1}{3}}$ なので $n=\\frac{1}{3}$。$1+\\frac{1}{3}\\times${par(fD(h))}=${ans}$`, easyCheck: 'last', verify: near1Check,
        };
      },
      // わな：h が大きい（近似は大はずれ。そのままかけ算する）
      trap(r) {
        const [b, n] = r.pick([[1.5, 3], [1.5, 4], [1.2, 3], [1.2, 4], [0.5, 3], [0.5, 4], [2.5, 2], [1.3, 3], [0.8, 3], [0.6, 3], [0.7, 3], [1.4, 3]]);
        const B = F.fromDec(String(b)), ans = fD(PP.at(PP.pow(PP.make(0, 1), n), B)), h = fmt(b - 1), ap = fmt(1 + n * (b - 1));
        return dest({
          q: `$${b}^{${n}}=□$`, a: `$${ans}$`, boxw: '18mm',
          verify: p => { const m = /\$([\d.]+)\^\{(\d)\}/.exec(p.q); let v = 1; for (let k = 0; k < +m[2]; k++) v *= +m[1]; return close(v, numOf(p.a), 1e-12) || 'かけ算の値がちがう'; },
        }, '5-29', `$h=${h}$ は大きいので、$1+${n}\\times${par(h)}=${ap}$ ではずれが大きい。そのままかけ算する`);
      },
    },
  });

  // ================================================================ 5-30
  // ずれの割合：量の式（文字 v の n 乗の形）。式から指数を数値で読む（検算用）：x f'(x)/f(x)
  const expoOf = (T, v) => { const x = 1.7, f = ev(T, { [v]: x, g: 9.8, m: 2, k: 3 }), h = 1e-6; return (ev(T, { [v]: x + h, g: 9.8, m: 2, k: 3 }) - ev(T, { [v]: x - h, g: 9.8, m: 2, k: 3 })) / (2 * h) * x / f; };
  const QUANT = {
    sq: { obj: '正方形', len: '1辺', v: 'x', name: '面積', T: 'x^{2}', sym: 'S', n: 2 },
    cube: { obj: '立方体', len: '1辺', v: 'x', name: '体積', T: 'x^{3}', sym: 'V', n: 3 },
    circ: { obj: '円', len: '半径', v: 'r', name: '面積', T: '\\pi r^{2}', sym: 'S', n: 2 },
    ball: { obj: '球', len: '半径', v: 'r', name: '体積', T: '\\frac{4}{3}\\pi r^{3}', sym: 'V', n: 3 },
    surf: { obj: '球', len: '半径', v: 'r', name: '表面積', T: '4\\pi r^{2}', sym: 'S', n: 2 },
  };
  const pcT = v => fmt(v);
  const quantOf = q => { const m = /\$([SVTxPE])=([^$]*)\$/.exec(q); return m ? m[2] : null; };
  M.add({
    id: '5-30', part: PART, chap: '5-8⑤', stars: 1,
    title: 'ずれの割合は指数倍（$x^n$ の量なら $n$ 倍）',
    mark: '「はかった値に□%のずれ」と、それを使って計算する面積・体積など（$x^2$・$x^3$・$\\sqrt{x}$ の形の量）。',
    futsu: ['ずれた値（1辺 $10.1$）で体積を計算し直し、', 'もとの体積とのちがいを出して、', '割合に直す（$10.1^3=1030.301$）。'],
    raku: ['立方体の体積 $V=x^3$：1辺のずれが1%', '→ 体積のずれは $3\\times1=3$ %', '体積のずれを1.5%以内にするには、', '1辺のずれを $1.5\\div3=0.5$ %以内に'],
    why: '$y=x^n$ のとき、$\\Delta y\\approx nx^{n-1}\\Delta x$。両辺を $y=x^n$ でわると、$\\frac{\\Delta y}{y}\\approx n\\times\\frac{\\Delta x}{x}$（5-8⑤）。ずれの割合は、指数の $n$ 倍にふくらむ。$\\pi$ や $\\frac{4}{3}$ のような係数は約分で消えるので、関係しない。$\\sqrt{x}=x^{\\frac{1}{2}}$ の形なら半分になる。',
    caution: 'ずれが大きいと使えない（1辺が10%長い立方体の体積は $1.1^3=1.331$ 倍で、30%ではなく33.1%大きい）。割合（%）と、ずれそのもの（cm）をまぜない。逆向き（面積・体積のずれ → 長さのずれ）は、指数でわる。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '13mm',
    fits(q) { return (/ずれ/.test(q) || /%/.test(q)) && /約/.test(q) && !/1次近似/.test(q); },
    steps: {
      // 長さのずれの割合 → 面積・体積のずれの割合
      s1(r) {
        const key = r.pick(['sq', 'cube', 'circ', 'ball', 'surf', 'cube', 'sq']), Q = QUANT[key], pc = r.pick([0.5, 1, 1.5, 2, 3]), ans = pcT(Q.n * pc);
        return {
          q: `${Q.obj}の${Q.len}に${pc}%のずれがあるとき、${Q.name} $${Q.sym}=${Q.T}$ のずれは約 □ %`, a: `$${ans}$`, key: `${key}:${pc}`,
          easy: `$${Q.n}\\times${pc}=${ans}$`,
          verify: p => close(expoOf(quantOf(p.q), Q.v) * pc, numOf(p.a), 1e-6) || 'ちがう',
        };
      },
      // 逆向き（何%以内に。教科書 5-8 例題8）・ずれを長さで（例題7）
      s2(r) {
        const key = r.pick(['sq', 'cube', 'circ', 'ball']), Q = QUANT[key], k = r.int(0, 2);
        if (k === 0) {
          const pc = r.pick([0.5, 1, 1.5, 2]), tot = pcT(Q.n * pc);
          return {
            q: `${Q.obj}の${Q.name} $${Q.sym}=${Q.T}$ を、ずれ${tot}%以内で求めたい。${Q.len}のずれは約 □ %以内にする`, a: `$${pc}$`, key: `i${key}:${pc}`,
            easy: `$${tot}\\div${Q.n}=${pc}$`,
            verify: p => close(expoOf(quantOf(p.q), Q.v) * numOf(p.a), +tot, 1e-6) || 'ちがう',
          };
        }
        const L = r.pick([5, 10, 20, 25, 50]), pc = r.pick([0.5, 1, 2, 4]), dL = fmt(L * pc / 100);
        if (String(dL).length > 4) return null;
        if (k === 1) {
          const ans = pcT(Q.n * pc);
          return {
            q: `${Q.obj}の${Q.len}をはかったら $${L.toFixed(1)}\\,\\mathrm{cm}$ で、ずれは $${dL}\\,\\mathrm{cm}$。${Q.name} $${Q.sym}=${Q.T}$ のずれは約 □ %`, a: `$${ans}$`, key: `l${key}:${L}:${pc}`,
            easy: `長さのずれは $${dL}\\div${L}=${fmt(pc / 100)}$ で${pc}%。$${Q.n}\\times${pc}=${ans}$`, easyCheck: 'last',
            verify: p => { const m = /\$([\d.]+)\\,\\mathrm\{cm\}\$ で、ずれは \$([\d.]+)\\,/.exec(p.q); return close(expoOf(quantOf(p.q), Q.v) * (+m[2] / +m[1]) * 100, numOf(p.a), 1e-6) || 'ちがう'; },
          };
        }
        const tot = pcT(Q.n * pc);
        return {
          q: `${Q.len}がおよそ $${L}\\,\\mathrm{cm}$ の${Q.obj}の${Q.name} $${Q.sym}=${Q.T}$ を、ずれ${tot}%以内で求めたい。${Q.len}のずれは約 $□\\,\\mathrm{cm}$ 以内にする`, a: `$${dL}$`, key: `d${key}:${L}:${pc}`,
          easy: `長さのずれは $${tot}\\div${Q.n}=${pc}$ %以内。$${L}\\times${fmt(pc / 100)}=${dL}$`, easyCheck: 'last',
          verify: p => { const m = /およそ \$([\d.]+)\\,/.exec(p.q); return close(expoOf(quantOf(p.q), Q.v) * (numOf(p.a) / +m[1]) * 100, +tot, 1e-6) || 'ちがう'; },
        };
      },
      // ルートの形（振り子の周期）・2乗の式（落ちる距離・運動エネルギー）・ずれそのもの（ΔV≈V'Δx）
      s3(r) {
        const k = r.int(0, 3), pc = r.pick([1, 2, 3, 4]);
        if (k === 0) {
          const T = '2\\pi\\sqrt{\\frac{L}{g}}', ans = pcT(pc / 2);
          return {
            q: `振り子の周期は $T=${T}$。糸の長さ $L$ を${pc}%長くすると、周期は約 □ %長くなる`, a: `$${ans}$`, key: 'pen',
            easy: `$\\sqrt{L}=L^{\\frac{1}{2}}$ なので、$\\frac{1}{2}\\times${pc}=${ans}$`, easyCheck: 'last',
            verify: p => close(expoOf(quantOf(p.q), 'L') * pc, numOf(p.a), 1e-6) || 'ちがう',
          };
        }
        if (k === 1) {
          const ans = pcT(2 * pc);
          return {
            q: `落ちた距離を $x=4.9t^{2}$ で計算する。はかった時間 $t$ に${pc}%のずれがあるとき、距離のずれは約 □ %`, a: `$${ans}$`, key: 'fall',
            easy: `$2\\times${pc}=${ans}$`,
            verify: p => close(expoOf(quantOf(p.q), 't') * pc, numOf(p.a), 1e-6) || 'ちがう',
          };
        }
        if (k === 2) {
          const ans = pcT(2 * pc);
          return {
            q: `運動エネルギー $K=\\frac{1}{2}mv^{2}$ は、速さ $v$ が${pc}%大きくなると、約 □ %大きくなる`, a: `$${ans}$`, key: 'ke',
            easy: `$2\\times${pc}=${ans}$`,
            verify: p => close(expoOf(/\$K=([^$]*)\$/.exec(p.q)[1], 'v') * pc, numOf(p.a), 1e-6) || 'ちがう',
          };
        }
        const cube = r.chance(0.6), L = r.pick([5, 10, 20]), dL = r.pick([0.1, 0.2]), n = cube ? 3 : 2, ans = fmt(n * Math.pow(L, n - 1) * dL);
        return {
          q: `${cube ? '立方体' : '正方形'}の1辺をはかったら $${L.toFixed(1)}\\,\\mathrm{cm}$ で、ずれは $${dL}\\,\\mathrm{cm}$。${cube ? '体積' : '面積'}のずれは約 $□\\,\\mathrm{cm^${n}}$`, a: `$${ans}$`, key: `abs${cube}:${L}:${dL}`,
          easy: `$\\Delta ${cube ? 'V' : 'S'}\\approx${cube ? '3x^{2}' : '2x'}\\Delta x$。$${n}\\times${L}${n === 3 ? '^{2}' : ''}\\times${dL}=${ans}$`, easyCheck: 'last',
          verify: p => { const m = /\$([\d.]+)\\,\\mathrm\{cm\}\$ で、ずれは \$([\d.]+)\\,/.exec(p.q); return close(dnum(`x^{${n}}`, +m[1]) * +m[2], numOf(p.a), 1e-6) || 'ちがう'; },
        };
      },
      // わな：ずれ（変化）が大きい（指数倍にならない。そのまま計算する）
      trap(r) {
        const [sq, pc] = r.pick([[true, 10], [true, 20], [true, 30], [true, 50], [false, 10], [false, 20], [false, 50]]), n = sq ? 2 : 3;
        const b = fr(100 + pc, 100), times = PP.at(PP.pow(PP.make(0, 1), n), b), ans = fD(F.mul(F.sub(times, fr(1)), fr(100)));
        return dest({
          q: `${sq ? '正方形' : '立方体'}の1辺を${pc}%長くすると、${sq ? '面積' : '体積'}はちょうど □ %大きくなる`, a: `$${ans}$`,
          verify: p => { const m = /を(\d+)%長く/.exec(p.q); return close((Math.pow(1 + m[1] / 100, n) - 1) * 100, numOf(p.a), 1e-9) || 'ちがう'; },
        }, '5-30', `${pc}%は大きいので、$${n}\\times${pc}=${n * pc}$ %ではずれる。$${fD(b)}^{${n}}=${fD(times)}$ 倍なので ${ans}%`);
      },
    },
  });

  // ================================================================ 5-92
  // 多項式を低い次から書く（分子が「4−x²」のように、定数が正で最高次が負のとき）
  const ascT = P => { let o = ''; P.forEach((c, k) => { if (c[0] === 0) return; const neg = c[0] < 0, ab = [Math.abs(c[0]), c[1]], one = ab[0] === 1 && ab[1] === 1; o += (o ? (neg ? '-' : '+') : (neg ? '-' : '')) + (k === 0 ? F.tex(ab) : (one ? '' : F.tex(ab)) + (k === 1 ? 'x' : `x^{${k}}`)); }); return o || '0'; };
  const deg = P => { let d = 0; P.forEach((c, k) => { if (c[0] !== 0) d = k; }); return d; };
  const numT = N => (N[deg(N)][0] < 0 && N[0][0] > 0 ? ascT(N) : PT(N));
  // 商 f/g の微分：分子 f'g−fg'（M.P）、答えの TeX、楽な形の TeX
  function quot(f, g) {
    const fp = PP.diff(f), gp = PP.diff(g), N = PP.add(PP.mul(fp, g), PP.scale(PP.mul(f, gp), -1));
    const fpT = PT(fp), gpT = PT(gp), gT = PT(g), fT = PT(f);
    const t1 = fpT === '1' ? `(${gT})` : `${isMono(fp) ? fpT : `(${fpT})`}(${gT})`;
    const t2 = `${isMono(f) ? fT : `(${fT})`}\\times${isMono(gp) ? par(gpT) : `(${gpT})`}`;
    const d = deg(N), cst = d === 0, neg = cst && N[0][0] < 0;
    const ans = cst ? `${neg ? '-' : ''}\\frac{${Math.abs(N[0][0])}}{(${gT})^{2}}` : `\\frac{${numT(N)}}{(${gT})^{2}}`;
    return { N, Y: `\\frac{${fT}}{${gT}}`, ans, easy: `\\frac{${t1}-${t2}}{(${gT})^{2}}` };
  }
  // 分母が0になる所をよけた、くらべる点
  const ptsFor = g => { const base = [0.37, 0.83, 1.29]; for (const sh of [0, 2.3, -3.1, 5.7]) { const pts = base.map(x => x + sh); if (pts.every(x => Math.abs(PP.val(g, x)) > 0.3)) return pts; } return base; };
  M.add({
    id: '5-92', part: PART, chap: '5-6（もっと）', stars: 1,
    title: '商の微分 $\\Bigl(\\dfrac{f}{g}\\Bigr)\'=\\dfrac{f\'g-fg\'}{g^2}$',
    mark: '分数の形で、分子にも分母にも $x$ がある（$\\frac{x}{x+2}$、$\\frac{x^2}{x+1}$）。',
    futsu: ['$\\frac{x}{x+2}=x\\times(x+2)^{-1}$ と書き直して、', '積の微分と合成関数の微分を使い、', '最後に分母をそろえてまとめる。'],
    raku: ['$y=\\frac{x}{x+2}$：$f=x$、$g=x+2$', '$y\'=\\frac{1\\times(x+2)-x\\times1}{(x+2)^2}=\\frac{2}{(x+2)^2}$'],
    why: '$\\frac{f}{g}=f\\times\\frac{1}{g}$ と見て、積の微分（5-19）と $\\bigl(\\frac{1}{g}\\bigr)\'=-\\frac{g\'}{g^2}$（5-22）を組み合わせると、$\\frac{f\'}{g}-\\frac{fg\'}{g^2}=\\frac{f\'g-fg\'}{g^2}$（5-6 もっと）。分母をそろえる所までを、先にすませた形になっている。',
    caution: '分子は「$f\'g-fg\'$」の順（ひき算なので、入れかえると符号が反対になる）。分母は $g$ の2乗。$\\frac{f\'}{g\'}$ としない。分子が数だけなら 5-22 の形。約分できる分数（$\\frac{x^2+3x}{x}$）は、先に約分する。',
    counts: { s1: 6, s2: 5, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '26mm', s2: '30mm', s3: '16mm', trap: '16mm' }, boxh: '12mm',
    fits(q) { const e = yOf(q), f2 = e && splitFrac(e); return !!f2 && /x/.test(f2[0]) && /x/.test(f2[1]) && !/^x(\^\{\d+\})?$/.test(f2[1]); },
    steps: {
      // 1次式÷1次式（答えの分子は数。教科書 5-6 例題9）
      s1(r) {
        const simple = r.chance(0.5), a = simple ? 1 : r.int(1, 3), b = simple ? 0 : r.intNot(-5, 5, v => v === 0), c = r.pick([1, 1, 1, 2, 3]), d = r.intNot(-6, 6, v => v === 0);
        if (a * d - b * c === 0 || F.gcd(c, d) !== 1) return null;
        const f = PP.make(b, a), g = PP.make(d, c), o = quot(f, g);
        return { q: yq(o.Y), a: `$${o.ans}$`, key: o.Y, easy: `$${o.easy}=${o.ans}$`, calc: { kind: 'diff', f: o.Y, pts: ptsFor(g) } };
      },
      // 2次式が入る（分子に x が残る）
      s2(r) {
        const k = r.int(0, 3), a = r.intNot(-4, 5, v => v === 0), c = r.int(1, 9);
        let f, g;
        if (k === 0) { f = PP.make(0, 0, 1); g = PP.make(a, 1); }
        else if (k === 1) { f = PP.make(0, 1); g = PP.make(c, 0, 1); }
        else if (k === 2) { f = PP.make(r.intNot(-5, 5, v => v === 0), 0, 1); g = PP.make(a, 1); }
        else { f = PP.make(r.intNot(-3, 3, v => v === 0), r.int(1, 2)); g = PP.make(c, 0, 1); }
        const o = quot(f, g);
        if (deg(o.N) === 0) return null;
        return { q: yq(o.Y), a: `$${o.ans}$`, key: o.Y, easy: `$${o.easy}=${o.ans}$`, calc: { kind: 'diff', f: o.Y, pts: ptsFor(g) } };
      },
      // ある点での値・傾きが0になる x・分母が2乗
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.int(1, 3), b = r.int(-4, 4), c = r.pick([1, 1, 2]), d = r.int(1, 5), x0 = r.int(-1, 2), K = a * d - b * c, u = c * x0 + d;
          if (K === 0 || u === 0 || Math.abs(u) > 6 || F.gcd(c, d) !== 1) return null;
          const o = quot(PP.make(b, a), PP.make(d, c)), val = fr(K, u * u);
          return {
            q: `$y=${o.Y}$ の、$x=${x0}$ での $y'$ の値`, a: `$${F.tex(val)}$`, key: `${o.Y}:${x0}`,
            easy: `$y'=${o.ans}$ に $x=${x0}$`, easyCheck: false, verify: p => close(dnum(yOf(p.q), x0), numOf(p.a), 1e-6) || 'ちがう',
          };
        }
        if (k === 1) {
          const a = r.int(1, 6), o = quot(PP.make(0, 1), PP.make(a * a, 0, 1));
          return {
            q: `$y=${o.Y}$ のグラフで、接線の傾きが0になる正の $x$`, a: `$${a}$`, key: `z${o.Y}`,
            easy: `$y'=${o.ans}=0$ より $x^{2}=${a * a}$。正なので $x=${a}$`, easyCheck: false,
            verify: p => { const Y = yOf(p.q), x = numOf(p.a); return (x > 0 && Math.abs(dnum(Y, x)) < 1e-8 && Math.abs(dnum(Y, x + 0.5)) > 1e-5) || '傾きが0にならない'; },
          };
        }
        const a = r.intNot(-4, 5, v => v === 0), U = lin(1, a), Y = `\\frac{x}{(${U})^{2}}`, A = a > 0 ? `\\frac{${a}-x}{(${U})^{3}}` : `-\\frac{x+${-a}}{(${U})^{3}}`;
        return {
          q: yq(Y), a: `$${A}$`, key: Y, boxw: '26mm',
          easy: `$\\frac{(${U})^{2}-x\\times2(${U})}{(${U})^{4}}=\\frac{(${U})-2x}{(${U})^{3}}$ をまとめて $${A}$`,
          calc: { kind: 'diff', f: Y, pts: ptsFor(PP.make(a, 1)) },
        };
      },
      // わな：約分できる分数（商の微分はいらない。約分すると多項式 → 5-10）
      trap(r) {
        const cube = r.chance(0.5), a = cube ? r.pick([1, 1, 2, 3]) : r.pick([2, 3, 4, 5]), b = r.intNot(-6, 6, v => v === 0);
        const f = cube ? PP.make(0, b, 0, a) : PP.make(0, b, a), red = cube ? PP.make(b, 0, a) : PP.make(b, a), Y = `\\frac{${PT(f)}}{x}`, A = PT(PP.diff(red));
        return dest({ q: yq(Y), a: `$${A}$`, calc: { kind: 'diff', f: Y, pts: [0.37, 0.83, 1.29] }, boxh: '12mm' }, '5-92', `先に約分すると $${PT(red)}$。商の微分はいらない`, ['5-10']);
      },
    },
  });
})(globalThis.MONDAI);

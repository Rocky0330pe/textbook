/* 問題集 第5巻　第4部 定積分と物理・はじめの状態（わざ 5-46〜5-60、5-93・5-94）　組 d
 * 書き方は v5/README.md（第5巻の手引き）・v4/README.md・v2/README.md。文は教科書 第5巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 式の数は M.P（係数は M.F の分数）で作り、問題と答えを同じ多項式から書く。不定積分の答えには +C（L-5）。
 * 検算：不定積分は calc（kind 'int'）、定積分は calc（kind 'defint'）。初期条件の式・2つの答え・文の問題は verify で、
 *   問題を作った式とは別の道すじ（答えの式を数で微分する・数で積分する・動きを数でたどる）で確かめる。
 * 図は 5-49・5-50 のステップ3だけ（M.graph。K-2・L-2）。目もりは書かない（式は文にある。図を読んで答えを出さない）。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「わざなし」）を書く（dest。第36回 N-3）。
 * 速度から「進んだ距離」を聞く問題は、とちゅうで速度の符号が変わらないものだけにする（L-9。教科書 5-11 の基本問題の形は使わない）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F, P = M.P;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const close = (x, y) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const decOK = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const D = c => (Array.isArray(c) ? c : Number.isInteger(c) ? fr(c) : F.fromDec(String(c)));   // 0.5 → [1, 2]
  const Pm = (...cs) => cs.map(D);                                  // 低い次から：Pm(1, 0, 3) は 3x^2+1
  const fx = f => (decOK(f[1]) ? fmt(F.val(f)) : F.tex(f));          // 分数を、きりのよい小数か \frac に
  const par = t => (/^-/.test(String(t)) ? `(${t})` : String(t));   // マイナスはかっこごと
  const val = (p, x) => P.at(p, D(x));                               // 多項式の値（分数）
  const nzs = (r, lo, hi) => r.intNot(lo, hi, v => v === 0);
  const nterms = p => p.filter(c => c && c[0] !== 0).length;
  const deg = p => { for (let k = p.length - 1; k >= 0; k--) if (p[k] && p[k][0] !== 0) return k; return -1; };
  const sub = (a, b) => P.add(a, P.scale(b, -1));
  // 同じステップの中で、問題の形を順番に回す（同じ形ばかりにならないように）。はじめの形は乱数で決め、あとは 1 ずつ進める。
  // どこまで進んだかは、乱数の物 r に持たせる（r は見開き・プリントごとに新しく作られるので、同じ種なら同じ問題になる）
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };

  // 多項式の TeX。分数の係数は教科書と同じ \frac{x^{3}}{3}・\frac{2x^{3}}{3}。dec：小数で書ける係数は小数（0.25t^{2}）。
  // いちばん高い次の係数がマイナスで、いちばん低い次の係数がプラスなら、低い次から書く（$20t-5t^{2}$、$4-x^{2}$。教科書の書き方）。
  // どちらもマイナスなら、高い次から（$-x^{2}-3x$）
  function ptex(p, v, o) {
    o = o || {}; v = v || 'x';
    const ks = [];
    for (let k = p.length - 1; k >= 0; k--) if (p[k] && p[k][0] !== 0) ks.push(k);
    if (!ks.length) return '0';
    const order = (o.asc === true || (o.asc !== false && ks.length > 1 && p[ks[0]][0] < 0 && p[ks[ks.length - 1]][0] > 0)) ? ks.slice().reverse() : ks;
    return order.map((k, i) => {
      const c = p[k], neg = c[0] < 0, n = Math.abs(c[0]), d = c[1];
      const vp = k === 0 ? '' : k === 1 ? v : `${v}^{${k}}`;
      let body;
      if (d === 1 || (o.dec && decOK(d))) { const num = d === 1 ? String(n) : fmt(n / d); body = k === 0 ? num : (num === '1' ? '' : num) + vp; }
      else body = `\\frac{${k === 0 ? n : (n === 1 ? '' : n) + vp}}{${d}}`;
      return (i === 0 ? (neg ? '-' : '') : (neg ? '-' : '+')) + body;
    }).join('');
  }
  // ∫ の中身：項が2つ以上・マイナスで始まるときは、かっこでかこむ（\int(3x^2+2x-4)\,\dd x）
  const wrap = b => (/[+-]/.test(String(b).replace(/\{[^{}]*\}/g, '').replace(/\{[^{}]*\}/g, '')) ? `(${b})` : `${b}`);
  const INT = (b, v) => `\\displaystyle\\int ${wrap(b)}\\,\\dd ${v || 'x'}`;
  const DEF = (a, b, body, v) => `\\displaystyle\\int_{${a}}^{${b}}${wrap(body)}\\,\\dd ${v || 'x'}`;
  const BR = (Ft, a, b) => `\\Bigl[\\,${Ft}\\,\\Bigr]_{${a}}^{${b}}`;
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;                     // 数と単位（1かたまり。N-7）

  // ---------------------------------------------------------------- 検算の部品（問題を作った式とは別の道すじ）
  const evx = (t, v, x) => M.evalMath(strip(t), { [v || 'x']: x });
  // 答えの文から数を取り出す（単位 \,\mathrm{…} は除く）
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => M.evalMath(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, ''), {}));
  // シンプソン法
  function simpson(fn, a, b, n) {
    n = n || 2000; const h = (b - a) / n; let s = fn(a) + fn(b);
    for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * fn(a + k * h);
    return s * h / 3;
  }
  // 答えの式（「$x=…$」の右）を数で微分すると rate になり、conds の時刻で決まった値になるか（初期条件の式）
  function icCheck(ans, rate, conds, v) {
    v = v || 't';
    const t0 = strip(ans).replace(/^[^=]*=/, '');
    const X = t => evx(t0, v, t);
    for (const t of [0.3, 1.1, 2.7]) {
      const h = 1e-4, d = (X(t + h) - X(t - h)) / (2 * h), want = evx(rate, v, t);
      if (d == null || want == null || !isFinite(d) || Math.abs(d - want) > 1e-5 * Math.max(1, Math.abs(want))) return `答え ${ans} を微分しても ${rate} にならない`;
    }
    for (const [ta, xa] of conds) if (!close(X(ta), xa)) return `t=${ta} で ${xa} にならない（答え ${ans}）`;
    return true;
  }
  // 2回微分すると acc、t=0 の速度 v0・位置 x0 になるか
  function ic2Check(ans, acc, v0, x0) {
    const t0 = strip(ans).replace(/^[^=]*=/, ''), X = t => evx(t0, 't', t);
    for (const t of [0.4, 1.3, 2.2]) {
      const h = 1e-3, d2 = (X(t + h) - 2 * X(t) + X(t - h)) / (h * h), want = evx(acc, 't', t);
      if (want == null || Math.abs(d2 - want) > 1e-3 * Math.max(1, Math.abs(want))) return `2回微分しても ${acc} にならない`;
    }
    const h = 1e-5, d0 = (X(h) - X(-h)) / (2 * h);
    if (Math.abs(d0 - v0) > 1e-6 * Math.max(1, Math.abs(v0))) return `はじめの速度が ${v0} にならない`;
    if (!close(X(0), x0)) return `はじめの位置が ${x0} にならない`;
    return true;
  }
  // 2つの式のグラフで囲まれた部分の面積（数で）：差が0になる所を細かくさがし、そのあいだの |差| を積分
  function areaNum(f, g, lo, hi) {
    const d = x => f(x) - g(x), roots = [];
    const N = 4000;
    for (let k = 0; k < N; k++) {
      const a = lo + (hi - lo) * k / N, b = lo + (hi - lo) * (k + 1) / N;
      if (Math.abs(d(a)) < 1e-12) { if (!roots.length || Math.abs(roots[roots.length - 1] - a) > 1e-6) roots.push(a); continue; }
      if (d(a) * d(b) < 0) { let u = a, w = b; for (let j = 0; j < 80; j++) { const m = (u + w) / 2; if (d(u) * d(m) <= 0) w = m; else u = m; } roots.push((u + w) / 2); }
    }
    if (roots.length < 2) return null;
    let s = 0;
    for (let k = 0; k + 1 < roots.length; k++) s += Math.abs(simpson(d, roots[k], roots[k + 1]));
    return s;
  }
  const valIs = (ans, v) => { const n = nums(ans); return (n.length && close(n[0], v)) || `答え ${ans} が ${fmt(v)} でない`; };
  const valsAre = (ans, vs) => { const n = nums(ans); return (n.length === vs.length && vs.every((v, i) => close(n[i], v))) || `答え ${ans} が ${vs.map(fmt).join('、')} でない`; };

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  // 問題の文の、はじめの ∫ の中身と、下端・上端
  function intParts(q) {
    const m = /\\int(?:_\{([^}]*)\}\^\{([^}]*)\})?\s*(.*?)\\,\\dd ([a-z])/.exec(q);
    return m ? { lim: m[1] != null, a: m[1], b: m[2], body: m[3], v: m[4] } : null;
  }
  // 多項式の次数（多項式でなければ null）
  function polyDeg(t) {
    if (t == null) return null;
    const s = String(t);
    if (/e\^|\\ln|\\sin|\\cos|\\sqrt/.test(s)) return null;
    for (let i = s.indexOf('\\frac'); i >= 0; i = s.indexOf('\\frac', i + 1)) {   // 分母に文字のある分数（$\frac{x^{2}+3}{x}$）は多項式でない
      let j = i + 5, dep = 0, grp = 0, st = -1;
      for (; j < s.length && grp < 2; j++) {
        if (s[j] === '{') { if (dep === 0 && grp === 1) st = j; dep++; }
        else if (s[j] === '}') { dep--; if (dep === 0) { grp++; if (grp === 2 && /[a-z]/.test(s.slice(st, j).replace(/\\[a-zA-Z]+/g, ''))) return null; } }
      }
    }
    const body = s.replace(/\\frac/g, '').replace(/\\[a-zA-Z]+/g, ' ');
    let d = /[a-z]/.test(body) ? 1 : 0;
    for (const m of body.matchAll(/[a-z]\^\{?(\d+)/g)) d = Math.max(d, +m[1]);
    for (const m of body.matchAll(/\)\^\{?(\d+)/g)) d = Math.max(d, 2 * +m[1]);   // (x+3)^{2} は2次とみる
    if (/\)\s*\(/.test(body) || /[a-z]\(/.test(body)) d = Math.max(d, 2);         // (x+3)(x-2)、x(x-4)
    return d;
  }
  const eqs = q => [...q.matchAll(/\$y=([^$]*)\$/g)].map(m => m[1]);

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(5).filter(id => {
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

  // ================================================================ 5-46
  // 項ごとの積分：「$3x^{2}\to x^{3}$、$-5x\to-\frac{5x^{2}}{2}$、$-2\to-2x$」
  const termMap = (f, v) => f.map((c, k) => (c && c[0] !== 0 ? k : -1)).filter(k => k >= 0).reverse()
    .map(k => { const one = f.map((c, j) => (j === k ? c : fr(0))); return `$${ptex(one, v)}\\to ${ptex(P.integ(one), v)}$`; }).join('、');
  M.add({
    id: '5-46', part: 4, chap: '5-11③', stars: 1,
    title: '$\\int x^n\\,\\dd x$ は「指数を1ふやして、その数でわる」（項ごと、係数は先に約分、$+C$）',
    mark: '下端と上端のない $\\int$（不定積分）。$\\int(3x^2+2x-4)\\,\\dd x$ など。',
    futsu: ['微分すると', '$3x^2+2x-4$ になる関数を、', '$x^3$、$x^2$ … とためして、', '1つずつさがす。'],
    raku: ['$3x^2\\to3\\times\\frac{x^3}{3}=x^3$（係数は先に約分）', '$2x\\to x^2$、$-4\\to-4x$', '$x^3+x^2-4x+C$（$+C$ は最後に1つ）'],
    why: '微分は「指数を前に出して1へらす」（5-4）。その逆なので「指数を1ふやして、その数でわる」：$\\Bigl(\\frac{x^{n+1}}{n+1}\\Bigr)\'=x^n$。定数倍と和は、微分と同じく1つずつ積分できる（5-11③）。定数は微分すると0なので、答えには $+C$ をつける。',
    caution: '$+C$ を書き忘れない（$+C$ のない答えは×）。$\\int x^2\\,\\dd x=x^3+C$ と、わるのを忘れない（微分すると $3x^2$ になってしまう）。答えは、微分してもとにもどるかで確かめる。',
    counts: { s1: 8, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '24mm', s2: '42mm', s3: '42mm', trap: '34mm' }, boxh: '12mm',
    fits(q) {
      if (/\\int_|S'|S\(|e\^|\\ln|\\sin|\\cos|のとき|はじめ|加速度/.test(q)) return false;
      const m = intParts(q);
      if (m) return polyDeg(m.body) != null;
      return (/微分すると/.test(q) && /すべて/.test(q)) || (/\+C/.test(q) && /位置/.test(q));
    },
    steps: {
      // 1つの項（係数は、指数＋1 でわりきれることが多い）
      s1(r) {
        const n = r.int(0, 5), k = r.chance(0.7) ? (n + 1) * r.int(1, 3) : r.int(1, 9);
        if (n === 0 && k === 1) return null;
        const f = Pm(...Array(n).fill(0), k), G = P.integ(f), A = `${ptex(G)}+C`;
        const how = n === 0 ? `$${k}=${k}x^{0}$ と見て、指数 0→1、1 でわる` : `指数 ${n}→${n + 1}、${n + 1} でわる` + (k % (n + 1) === 0 ? `（係数は $${k}\\div${n + 1}=${k / (n + 1)}$）` : '');
        return { q: `$${INT(ptex(f))}$`, a: `$${A}$`, easy: how, easyCheck: false, key: `${k}x${n}`, calc: { kind: 'int', f: ptex(f) } };
      },
      // 項が2つ・3つ（答えの係数が整数のものと、分数のもの）
      s2(r) {
        let f;
        if (r.chance(0.6)) f = P.diff(Pm(0, nzs(r, -6, 6), r.int(-3, 3), r.pick([1, 1, 2, -1, 0]), r.chance(0.2) ? r.pick([1, -1]) : 0));
        else f = Pm(r.int(-6, 6), r.int(-6, 6), r.pick([1, 2, 3, -1, -2]));
        if (nterms(f) < 2 || deg(f) < 1) return null;
        const G = P.integ(f), A = `${ptex(G)}+C`;
        return { q: `$${INT(ptex(f))}$`, a: `$${A}$`, easy: termMap(f), easyCheck: false, key: ptex(f), calc: { kind: 'int', f: ptex(f) } };
      },
      // かっこは展開してから・文字が t・「微分すると □ になる関数をすべて」
      s3(r) {
        const k = turn(r, '46s3', 3);
        if (k === 0) {
          const a = nzs(r, -5, 5), b = nzs(r, -5, 5), form = r.int(0, 2);
          const L1 = Pm(a, 1), L2 = form === 1 ? Pm(0, 1) : Pm(b, 1);
          const f = form === 2 ? P.mul(L1, L1) : P.mul(L2, L1);
          const tx = form === 0 ? `(${ptex(L1)})(${ptex(L2)})` : form === 1 ? `x(${ptex(L1)})` : `(${ptex(L1)})^{2}`;
          if (form === 0 && a === b) return null;
          const G = P.integ(f), A = `${ptex(G)}+C`;
          return { q: `$\\displaystyle\\int ${tx}\\,\\dd x$`, a: `$${A}$`, easy: `展開して $${ptex(f)}$。${termMap(f)}`, easyCheck: false, key: ptex(f), calc: { kind: 'int', f: tx } };
        }
        const f = P.diff(Pm(0, nzs(r, -5, 5), r.int(-3, 3), r.pick([1, 2, -1])));
        if (nterms(f) < 2) return null;
        const G = P.integ(f);
        if (k === 1) {
          const A = `x=${ptex(G, 't')}+C`;
          return { q: `速度が $v=${ptex(f, 't')}$（m/s）の物体の位置 $x$ を、$+C$ をつけて $t$ の式で □`, a: `$${A}$`, easy: `位置は速度の原始関数。${termMap(f, 't')}`, easyCheck: false, key: 'v' + ptex(f), calc: { kind: 'int', f: ptex(f, 't'), x: 't' } };
        }
        const A = `${ptex(G)}+C`;
        return { q: `微分すると $${ptex(f)}$ になる関数を、すべて（定数 $C$ を使って） □`, a: `$${A}$`, easy: `不定積分 $${INT(ptex(f))}$ と同じ。${termMap(f)}`, easyCheck: false, key: 'd' + ptex(f), calc: { kind: 'int', f: ptex(f) } };
      },
      // わな：$\frac{1}{x}$ は $n=-1$（0でわれない。$\ln x$。5-67）
      trap(r) {
        const a = r.int(1, 9), k = turn(r, '46t', 2);
        const f = k === 0 ? `\\frac{${a}}{x}` : `\\frac{x^{2}+${a}}{x}`;
        const A = k === 0 ? `${a === 1 ? '' : a}\\ln x+C` : `\\frac{x^{2}}{2}+${a === 1 ? '' : a}\\ln x+C`;
        return dest({ q: `$x>0$ のとき、$${INT(f)}$`, a: `$${A}$`, key: `t${k}${a}`, calc: { kind: 'int', f } }, '5-46',
          `$\\frac{1}{x}=x^{-1}$ は $n=-1$ で、指数を1ふやすと0になり、0でわれない。$\\int\\frac{1}{x}\\,\\dd x=\\ln x+C$${k ? '（先に $x+\\frac{' + a + '}{x}$ と分ける）' : ''}`, ['5-67']);
      },
    },
  });

  // ================================================================ 5-47
  // 定積分の問題（多項式 f と、はし a・b）：答えと「楽な形」
  function defProb(f, a, b, v) {
    v = v || 'x';
    const G = P.integ(f), Gb = val(G, b), Ga = val(G, a), I = F.sub(Gb, Ga);
    return { G, I, easy: `$${BR(ptex(G, v), a, b)}=${par(F.tex(Gb))}-${par(F.tex(Ga))}=${F.tex(I)}$` };
  }
  M.add({
    id: '5-47', part: 4, chap: '5-11④', stars: 1,
    title: '定積分は $\\Bigl[\\,F(x)\\,\\Bigr]_a^b=F(b)-F(a)$（$C$ はいらない。下端も入れてひく）',
    mark: '下端と上端のある $\\int$ と多項式。「$v=3t^2+2$ の1秒から2秒までに進んだ距離」。',
    futsu: ['細い長方形に分けて和を作り、', '$n\\to\\infty$ の極限を計算する', '（5-10）。'],
    raku: ['$\\displaystyle\\int_1^2(3x^2-2x)\\,\\dd x=\\Bigl[\\,x^3-x^2\\,\\Bigr]_1^2$', '$=(8-4)-(1-1)=4-0=4$'],
    why: 'グラフの $a$ から $x$ までの面積 $S(x)$ は、微分すると $f(x)$（5-11②）なので、原始関数 $F(x)$ と定数しかちがわない。$x=a$ では面積が0なので、$S(b)=F(b)-F(a)$。$C$ はひき算で消えるので書かなくてよい（5-11④）。',
    caution: '上端の値から下端の値をひく（「あと－まえ」。逆にしない）。下端が0でも $F(0)$ が0とはかぎらない。下端がマイナスの数なら、かっこをつけて入れる。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '30mm', trap: '24mm' }, boxh: '12mm',
    fits(q) {
      if (/S'|\\d?frac\{\\dd\}|ふえる速さ|平均|面積|囲まれた/.test(q)) return false;
      const m = intParts(q);
      if (m && m.lim) return polyDeg(m.body) != null;
      const v = /速度が \$v=([^$]*)\$/.exec(q);
      return !!v && /秒から/.test(q) && /進んだ距離/.test(q) && polyDeg(v[1]) != null;
    },
    steps: {
      // 0か1から、2次・3次の式（答えは整数が多い）
      s1(r) {
        let f;
        if (r.chance(0.7)) f = P.diff(Pm(0, r.int(-4, 4), r.int(-3, 3), nzs(r, -2, 2)));
        else f = Pm(r.int(-3, 4), r.int(-4, 4), nzs(r, -3, 3));
        if (deg(f) < 2) return null;
        const a = r.pick([0, 0, 1]), b = r.int(a + 1, 3), d = defProb(f, a, b);
        return { q: `$${DEF(a, b, ptex(f))}$`, a: `$${F.tex(d.I)}$`, easy: d.easy, easyCheck: 'last', key: `${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: ptex(f), a, b } };
      },
      // 下端がマイナス・下端が0でない、速度から進んだ距離（速度はずっと正。L-9）
      s2(r) {
        if (turn(r, '47s2', 5) < 2) {
          const f = P.diff(Pm(0, r.int(1, 4), r.int(0, 3), r.int(1, 2)));   // 係数がどれも正なので、t≧0 で v>0
          const a = r.int(1, 2), b = r.int(a + 1, a + 2), d = defProb(f, a, b, 't');
          return { q: `速度が $v=${ptex(f, 't')}$（m/s）の物体が、${a}秒から${b}秒までに進んだ距離 □ m`, a: `$${F.tex(d.I)}$`, easy: d.easy, easyCheck: 'last', key: `v${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: ptex(f, 't'), x: 't', a, b } };
        }
        const f = r.chance(0.5) ? P.diff(Pm(0, r.int(-4, 4), nzs(r, -3, 3), r.int(-1, 1))) : Pm(r.int(-4, 4), nzs(r, -4, 4), r.int(0, 3));
        if (deg(f) < 1 || nterms(f) < 2) return null;
        const a = r.pick([-2, -1, -1, 1, 2]), b = r.int(Math.max(a + 1, 1), 3), d = defProb(f, a, b);
        return { q: `$${DEF(a, b, ptex(f))}$`, a: `$${F.tex(d.I)}$`, easy: d.easy, easyCheck: 'last', key: `${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: ptex(f), a, b } };
      },
      // 上端と下端が逆・かっこの式・$S(x)=\int_a^x$ を $x$ の式に
      s3(r) {
        const k = turn(r, '47s3', 3);
        if (k === 0) {
          const f = P.diff(Pm(0, r.int(-3, 3), r.int(-2, 2), nzs(r, -2, 2))), b = r.int(0, 1), a = r.int(b + 2, 3), d = defProb(f, a, b);
          if (d.I[0] === 0) return null;
          return { q: `上端のほうが小さい定積分 $${DEF(a, b, ptex(f))}$`, a: `$${F.tex(d.I)}$`, easy: d.easy, easyCheck: 'last', key: `${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: ptex(f), a, b } };
        }
        if (k === 1) {
          const u = nzs(r, -3, 3), w = nzs(r, -3, 3), L1 = Pm(u, 1), L2 = Pm(w, 1), f = P.mul(L1, L2), a = r.int(0, 1), b = r.int(a + 1, 3), d = defProb(f, a, b);
          const tx = `(${ptex(L1)})(${ptex(L2)})`;
          return { q: `$\\displaystyle\\int_{${a}}^{${b}}${tx}\\,\\dd x$`, a: `$${F.tex(d.I)}$`, easy: `展開して $${ptex(f)}$。${d.easy}`, easyCheck: 'last', key: `${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: tx, a, b } };
        }
        const f = P.diff(Pm(0, r.int(1, 4), r.int(-2, 2), r.int(0, 1))), a = r.int(1, 2);
        if (nterms(f) < 2) return null;
        const G = P.integ(f), S = P.add(G, Pm(F.tex(val(G, a)) === '0' ? 0 : F.sub(fr(0), val(G, a))));
        const A = `S(x)=${ptex(S)}`;
        return {
          q: `$S(x)=${DEF(a, 'x', ptex(f, 't'), 't')}$ を $x$ の式で □`, a: `$${A}$`, key: `S${ptex(f)}|${a}`,
          easy: `$${BR(ptex(G, 't'), a, 'x')}=${ptex(G)}-${par(F.tex(val(G, a)))}$`, easyCheck: false,
          verify: () => icCheck(A, ptex(f), [[a, 0]], 'x'),
        };
      },
      // わな：$e^x$、$\frac{1}{x}$ の定積分（多項式でない。5-66・5-67）
      trap(r) {
        if (turn(r, '47t', 2)) {
          const [f, a, b, A] = r.pick([['e^{x}', 0, 1, 'e-1'], ['e^{-x}', 0, 1, '1-e^{-1}'], ['e^{x}', 0, 2, 'e^{2}-1'], ['e^{2x}', 0, 1, '\\frac{e^{2}-1}{2}'], ['e^{-x}', 0, 2, '1-e^{-2}']]);
          return dest({ q: `$${DEF(a, b, f)}$`, a: `$${A}$`, key: `e${f}${b}`, calc: { kind: 'defint', f, a, b } }, '5-47', `$${f}$ は多項式ではないので、指数を1ふやしてわる形にならない。$\\int e^{ax}\\,\\dd x=\\frac{1}{a}e^{ax}+C$ を使う`, ['5-66']);
        }
        const [a, b] = r.pick([[1, 2], [1, 3], [2, 6], [3, 9], [2, 8], [1, 5]]);
        return dest({ q: `$${DEF(a, b, '\\frac{1}{x}')}$`, a: `$\\ln${b / a}$`, key: `l${a}${b}`, calc: { kind: 'defint', f: '\\frac{1}{x}', a, b } }, '5-47', '$\\frac{1}{x}$ は $n=-1$ で、指数を1ふやしてわる形にならない。$\\Bigl[\\,\\ln x\\,\\Bigr]_a^b=\\ln\\frac{b}{a}$', ['5-67']);
      },
    },
  });

  // ================================================================ 5-48
  const QTY48 = [   // 1次式で変わる量（ずっと0以上）：[文字, 何, 単位（たて）, 時間の単位, 答えの単位, 文]
    { s: 'I', what: '電流', u: 'A', tu: '秒', au: 'C', ask: 'に流れた電気の量' },
    { s: 'P', what: '電力', u: 'kW', tu: '時間', au: 'kWh', ask: 'の電力量' },
    { s: 'v', what: '速度', u: 'm/s', tu: '秒', au: 'm', ask: 'に進んだ距離' },
    { s: 'Q', what: '流量', u: 'L/s', tu: '秒', au: 'L', ask: 'に出た水の量' },
  ];
  const trap48 = (fa, fb, w, ans) => `$\\frac{${fx(fa)}+${par(fx(fb))}}{2}\\times${fx(w)}=${fx(ans)}$`;
  M.add({
    id: '5-48', part: 4, chap: '5-11 例題3・5-12⑥⑦', stars: 1,
    title: 'グラフがまっすぐなら、定積分は台形：$\\dfrac{f(a)+f(b)}{2}\\times(b-a)$',
    mark: '1次式の定積分。1次式で変わる電流・電力・速度・流量の、たまる量。',
    futsu: ['原始関数を作り、', '上端と下端を入れて', '$F(b)-F(a)$ を計算する', '（5-47）。'],
    raku: ['$\\displaystyle\\int_1^3(2x+1)\\,\\dd x$', '両はしの高さ3と7、はば2の台形', '$\\frac{3+7}{2}\\times2=10$'],
    why: '1次式のグラフはまっすぐなので、$a$ から $b$ までのグラフの下の部分は、左の高さ $f(a)$、右の高さ $f(b)$、はば $b-a$ の台形（5-11 例題3の確かめ、5-12⑥⑦）。高さがマイナスの所は、マイナスの面積として計算される（5-11⑤）。',
    caution: 'グラフが曲がっている（$x^2$ がある）ときは、両はしの平均×はばにはならない。答えの単位は、たての単位×横の単位（A×s＝C、kW×h＝kWh）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' }, boxh: { s1: '12mm', trap: '12mm' },
    fits(q) {
      if (/平均|面積|囲まれた|S'|\\d?frac\{\\dd\}|のとき|はじめ|出会|追いつ|ばね/.test(q)) return false;
      if (/1次関数/.test(q) && /通る/.test(q)) return true;
      if (/一定の割合で/.test(q) && /進んだ/.test(q)) return true;
      const m = intParts(q);
      if (m && m.lim) { const d = polyDeg(m.body); return d != null && d <= 1; }
      const f = /\$([vIPQF])=([^$]*)\$/.exec(q);
      return !!f && /から/.test(q) && /まで/.test(q) && polyDeg(f[2]) === 1;
    },
    steps: {
      s1(r) {
        const m = nzs(r, -3, 4), c = r.int(-3, 6), a = r.int(0, 3), b = r.int(a + 1, 5), f = Pm(c, m);
        const fa = val(f, a), fb = val(f, b);
        if (fa[0] < 0 || fb[0] < 0) return null;
        const I = F.mul(F.div(F.add(fa, fb), fr(2)), fr(b - a));
        return { q: `$${DEF(a, b, ptex(f))}$`, a: `$${fx(I)}$`, easy: trap48(fa, fb, fr(b - a), I), key: `${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: ptex(f), a, b } };
      },
      // 1次式で変わる量（電流・電力・速度・流量）。どれも、あいだで0以上（L-9）
      s2(r) {
        const Qk = QTY48[turn(r, '48s2', 4)];
        const v0 = D(r.pick([1, 2, 3, 4, 5, 6, 8, 10])), sl = D(r.pick([0.5, 1, 2, 0.25, 0.2])), dn = r.chance(0.5), T = r.pick([2, 3, 4, 5, 6, 8, 10]);
        const f = dn ? [v0, F.mul(sl, fr(-1))] : [v0, sl], fT = val(f, T);
        if (fT[0] < 0) return null;
        if (Qk.s === 'v' && dn && fT[0] === 0) return null;
        const I = F.mul(F.div(F.add(f[0], fT), fr(2)), fr(T));
        if (![1, 2, 5, 10].includes(I[1]) || ![1, 2, 5, 10].includes(fT[1])) return null;   // 小数は第1位まで
        const ft = ptex(f, 't', { dec: true });
        return {
          q: `${Qk.what}が $${Qk.s}=${ft}$（${Qk.u}）で変わる。0${Qk.tu}から${T}${Qk.tu}まで${Qk.ask} □ ${Qk.au}`, a: `$${fx(I)}$`,
          easy: trap48(f[0], fT, fr(T), I), key: Qk.s === 'v' ? `r${fx(f[0])}|${T}|${fx(fT)}` : `${Qk.s}${ft}|${T}`, calc: { kind: 'defint', f: ft, x: 't', a: 0, b: T },
        };
      },
      // 2点を通る1次関数・横軸より下がある・面積から右はしの高さ
      s3(r) {
        const k = turn(r, '48s3', 3);
        if (k === 0) {
          const a = r.int(0, 2), b = r.int(a + 2, 6), ya = r.int(-2, 6), yb = r.int(-2, 12), I = F.mul(F.div(fr(ya + yb), fr(2)), fr(b - a));
          if (ya === yb) return null;
          const sl = F.div(fr(yb - ya), fr(b - a)), f = [F.sub(fr(ya), F.mul(sl, fr(a))), sl];
          return {
            q: `1次関数 $f(x)$ のグラフが、2点 $(${a},\\ ${ya})$ と $(${b},\\ ${yb})$ を通る。$${DEF(a, b, 'f(x)')}$`, a: `$${fx(I)}$`, key: `p${a}${ya}${b}${yb}`,
            easy: trap48(fr(ya), fr(yb), fr(b - a), I), calc: { kind: 'defint', f: ptex(f), a, b },
          };
        }
        if (k === 1) {
          const m = r.pick([1, 2, 3]), c = r.int(-6, -1), a = r.int(-2, 0), b = r.int(2, 5), f = Pm(c, m), fa = val(f, a), fb = val(f, b);
          if (!(fa[0] < 0 && fb[0] > 0)) return null;
          const I = F.mul(F.div(F.add(fa, fb), fr(2)), fr(b - a));
          return { q: `グラフがとちゅうで横軸より下になる。$${DEF(a, b, ptex(f))}$`, a: `$${fx(I)}$`, easy: trap48(fa, fb, fr(b - a), I), key: `${ptex(f)}|${a}|${b}`, calc: { kind: 'defint', f: ptex(f), a, b } };
        }
        // 面積（距離）から、おわりの速さを出す（逆の問題）
        const v0 = r.int(1, 6), T = r.pick([2, 4, 5, 6, 8, 10]), vT = r.int(v0 + 2, 20), dist = F.mul(F.div(fr(v0 + vT), fr(2)), fr(T));
        if (!decOK(dist[1])) return null;
        return {
          q: `速度が一定の割合でふえる物体が、$${v0}\\,\\mathrm{m/s}$ から${T}秒間で $${fx(dist)}\\,\\mathrm{m}$ 進んだ。${T}秒後の速さ □ m/s`, a: `$${vT}$`, key: `r${v0}|${T}|${vT}`,   // s2 の速度の問題と同じ key（逆の問題を同じ見開きに出さない。N-2）
          easy: `$\\frac{${v0}+v}{2}\\times${T}=${fx(dist)}$ より $v=${vT}$`, easyCheck: false,
          verify: p => valIs(p.a, 2 * F.val(dist) / T - v0),
        };
      },
      // わな：曲がっている（$x^2$）。両はしの平均×はばにならない（5-42）
      trap(r) {
        const c = r.pick([1, 3, 3, 6]), b = r.pick([1, 2, 3]), f = Pm(0, 0, c), I = F.div(fr(c * b * b * b), fr(3)), wrong = F.mul(F.div(fr(c * b * b), fr(2)), fr(b));
        if (turn(r, '48t', 2)) {
          return dest({ q: `$${DEF(0, b, ptex(f))}$`, a: `$${F.tex(I)}$`, key: `t${c}${b}`, calc: { kind: 'defint', f: ptex(f), a: 0, b } }, '5-48',
            `グラフが曲がっているので、両はしの平均×はば（$${fx(wrong)}$）にはならない。$\\int_0^b x^2\\,\\dd x=\\frac{b^3}{3}$ を使う`, ['5-42']);
        }
        return dest({ q: `速度が $v=${ptex(f, 't')}$（m/s）の物体が、0秒から${b}秒までに進んだ距離 □ m`, a: `$${F.tex(I)}$`, key: `t${c}${b}`, calc: { kind: 'defint', f: ptex(f, 't'), x: 't', a: 0, b } }, '5-48',
          `$v$-$t$ グラフが曲がっているので、両はしの速さの平均×時間（$${fx(wrong)}$）にはならない。$\\int_0^b t^2\\,\\dd t=\\frac{b^3}{3}$ を使う`, ['5-42']);
      },
    },
  });

  // ================================================================ 5-49
  // グラフの図：fs＝かくグラフ [{ fn, tex }]、交わる点 al・be。ぬるのは、グラフとグラフ（1本なら横軸）のあいだ。
  // 式のラベルは、自分のグラフのすぐそばで、ほかのグラフ・軸・ぬった所・ほかのラベルからいちばん遠い所に置く（方眼の点から数でえらぶ。重ならないように）。
  // 目もりは書かない（式は問題の文にある。図を読んで答えを出さない）。横はばは 60 mm 以内（わく 7.8＋ラベルが左右に出る分 合わせて 4.4＋余白 0.8 で 13 単位）。
  function areaFig(fs, al, be, o) {
    o = o || {};
    const S = 4.6, U = 3.4 / S;                                      // 1単位の mm、字の高さ（図の単位）
    const xs0 = Math.min(al, 0) - 0.7, xs1 = Math.max(be, 0) + 0.7;
    const upF = x => Math.max(...fs.map(f => f.fn(x)), fs.length === 1 ? 0 : -Infinity), lowF = x => Math.min(...fs.map(f => f.fn(x)), fs.length === 1 ? 0 : Infinity);
    let lo = 0, hi = 0;
    for (let k = 0; k <= 60; k++) { const x = al + (be - al) * k / 60; lo = Math.min(lo, lowF(x)); hi = Math.max(hi, upF(x)); }
    const span = hi - lo || 1, y0 = lo - 0.25 * span, y1 = hi + 0.25 * span;
    const G = M.graph({ x0: xs0, x1: xs1, y0, y1, w: 7, h: o.h || 5.4 }), T = G.T;
    const inWin = y => y >= y0 && y <= y1;
    const ax0 = xs0 * G.sx, ax1 = xs1 * G.sx + 0.8, ay0 = y0 * G.sy, ay1 = y1 * G.sy + 0.8;
    // さけたい点：グラフ（1本ずつ）、軸・ぬった所・軸の文字、置いたラベル
    const curve = fs.map(f => { const ps = []; for (let k = 0; k <= 120; k++) { const x = xs0 + (xs1 - xs0) * k / 120, y = f.fn(x); if (inWin(y)) ps.push(T(x, y)); } return ps; });
    const boxPts = b => { const out = []; for (let i = 0; i <= 8; i++) for (let j = 0; j <= 2; j++) out.push([b[0] + (b[2] - b[0]) * i / 8, b[1] + (b[3] - b[1]) * j / 2]); return out; };
    const other = [];
    for (let k = 0; k <= 80; k++) other.push([ax0 + (ax1 - ax0) * k / 80, 0], [0, ay0 + (ay1 - ay0) * k / 80]);
    for (let k = 1; k < 20; k++) { const x = al + (be - al) * k / 20; for (let j = 1; j < 5; j++) other.push(T(x, lowF(x) + (upF(x) - lowF(x)) * j / 5)); }
    other.push(...boxPts([ax1 - 0.9 * U, -1.3 * U, ax1, -0.2 * U]), ...boxPts([0.2, ay1 - 1.0 * U, 0.2 + 0.7 * U, ay1]));   // 軸の文字 x・y
    const dist = (b, p) => Math.hypot(Math.max(b[0] - p[0], 0, p[0] - b[2]), Math.max(b[1] - p[1], 0, p[1] - b[3]));
    const near = (b, ps) => { let m = Infinity; for (const p of ps) { const d = dist(b, p); if (d < m) m = d; } return m; };
    // ラベルのはば（字の高さを1として）：本（TeX）では ＝ や ＋・－ の前後があくので、広めに見つもる
    const texW = t => { let w = 0; for (let k = 0; k < t.length; k++) { const c = t[k], pv = t[k - 1]; if (c === '^' || c === '{' || c === '}') continue; w += (pv === '{' || pv === '^') ? 0.35 : c === '=' ? 1.34 : c === '+' ? 1.22 : c === '-' ? ((pv === '=' || pv === '(') ? 0.78 : 1.22) : (c === '(' || c === ')') ? 0.4 : 0.5; } return w; };
    const labels = [], OUT = 4.4;
    let outL = 0, outR = 0;                                         // ラベルが、わくの左・右に出た分
    fs.forEach((f, i) => {
      const text = `$y=${f.tex}$`, w = texW(`y=${f.tex}`) * U * 1.08;
      const rivals = [].concat(...curve.filter((c, j) => j !== i));   // ほかのグラフ
      let best = null;
      // [ほかのグラフからのすき間, 軸・ぬった所・ほかのラベルからのすき間, 自分のグラフからいちばん遠くて]。だめなら、だんだんゆるくする（グラフが2本なら、ラベルはかならず置く。1本で置けないときは書かない：式は問題の文にある）
      for (const [gap, gapO, far] of [[0.55, 0.32, 0.55], [0.3, 0.25, 0.55], [0.2, 0.15, 0.8], [0.05, 0.05, 1.2]].concat(fs.length > 1 ? [[-1, -1, 3]] : [])) {
        for (let cx = ax0 - OUT + w / 2; cx <= ax1 + OUT - w / 2 + 1e-9; cx += 0.25) {
          if (Math.max(outL, ax0 - (cx - w / 2), 0) + Math.max(outR, cx + w / 2 - ax1, 0) > OUT) continue;   // 左右に出る分は、合わせて OUT まで
          for (let cy = ay0 + 0.5 * U; cy <= ay1 - 0.7 * U + 1e-9; cy += 0.25) {
            const b = [cx - w / 2, cy - 0.5 * U, cx + w / 2, cy + 0.7 * U], dOwn = near(b, curve[i]);
            if (dOwn < 0.18 || dOwn > far) continue;                // 自分のグラフのすぐそば（重ならない）
            const dRiv = near(b, rivals);
            if (dRiv < gap) continue;
            const dOth = Math.min(dRiv, near(b, other));
            if (dOth < gapO) continue;
            const sc = Math.min(dOth, 1.6) - 0.6 * dOwn;
            if (!best || sc > best.sc + 1e-9) best = { sc, P: [cx, cy], b };
          }
        }
        if (best) break;
      }
      if (best) {   // 長さ0の線分は、図の大きさに、本の式のはば（core.js の見つもりより広い）を入れるため
        labels.push(['label', best.P, text, 'c'], ['seg', [best.b[0], best.P[1]], [best.b[0], best.P[1]]], ['seg', [best.b[2], best.P[1]], [best.b[2], best.P[1]]]);
        other.push(...boxPts(best.b));
        outL = Math.max(outL, ax0 - best.b[0]); outR = Math.max(outR, best.b[2] - ax1);
      }
    });
    // O の置き場所（どこも近すぎるなら書かない）
    const all = other.concat(...curve);
    let oBest = null;
    for (const d of ['sw', 'se', 'nw', 'ne']) {
      const sx = d[1] === 'w' ? -1 : 1, sy = d[0] === 's' ? -1 : 1, cx = sx * 0.6 * U, cy = sy * 0.6 * U;
      const b = [cx - 0.3 * U, cy - 0.45 * U, cx + 0.3 * U, cy + 0.45 * U];
      const sc = near(b, all.filter(p => !((Math.abs(p[1]) < 1e-9 || Math.abs(p[0]) < 1e-9) && Math.hypot(p[0], p[1]) < 1.5)));   // O のすぐ横の軸は数えない
      if (!oBest || sc > oBest.sc + 1e-9) oBest = { sc, d };
    }
    const items = [G.area(upF, lowF, al, be, { fill: true }), ...G.axes({ o: oBest && oBest.sc > 0.15 ? oBest.d : false })];
    fs.forEach(f => items.push(...G.plot(f.fn, xs0, xs1, { thick: true })));
    items.push(...labels, ['dot', T(al, fs[0].fn(al))], ['dot', T(be, fs[0].fn(be))]);
    return { s: S, pad: 0.4, items };
  }
  // 放物線 y=sg·x^2+c0 と直線で、交わる点が al・be になるもの（sg=1 なら放物線が下、-1 なら上）
  function pairPL(al, be, sg, c0) {
    const par0 = Pm(c0, 0, sg), dif = P.mul(Pm(-al, 1), Pm(-be, 1));   // (x-al)(x-be)
    const line = sg > 0 ? sub(par0, dif) : P.add(par0, dif);
    const up = sg > 0 ? line : par0, low = sg > 0 ? par0 : line;
    const G = P.integ(sub(up, low)), A = F.sub(val(G, be), val(G, al));
    return { par: par0, line, up, low, A };
  }
  M.add({
    id: '5-49', part: 4, chap: '5-11⑥ 例題8', stars: 1,
    title: '2つのグラフにはさまれた面積は「上－下」を、交わる点から交わる点まで',
    mark: '2つのグラフ（直線と放物線など）で囲まれた部分の面積。',
    futsu: ['それぞれのグラフの下の', '面積を求め、図を見ながら、', 'たしたり、ひいたりする。'],
    raku: ['$y=x$ と $y=x^2$：$x=x^2$ より $x=0,\\ 1$', '上は $y=x$。$\\displaystyle\\int_0^1(x-x^2)\\,\\dd x$', '$=\\frac{1}{2}-\\frac{1}{3}=\\frac{1}{6}$'],
    why: 'はさまれた部分を細い長方形に分けると、1本の高さは「上のグラフ－下のグラフ」（5-11⑥）。はしは2つのグラフが交わる所なので、2つの式を等しいとおいて解く。どちらが上かは、あいだの $x$ を1つ入れてくらべる。',
    caution: 'どちらが上かを確かめてからひく（逆にするとマイナスになる）。横軸より下にあっても、「上－下」はそのまま使える（横軸で分けなくてよい）。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm', boxh: '12mm',
    fits(q) { return /囲まれた/.test(q) && eqs(q).length >= 2; },
    steps: {
      // $y=mx$ と $y=x^2$、$y=k^2$ と $y=x^2$
      s1(r) {
        if (turn(r, '49s1', 3)) {
          const m = r.int(1, 5), L = Pm(0, m), A = F.div(fr(m * m * m), fr(6));
          const e = [`y=${ptex(L)}`, 'y=x^{2}'], sw = r.chance(0.5);
          return {
            q: `$${e[sw ? 1 : 0]}$ と $${e[sw ? 0 : 1]}$ のグラフで囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: `m${m}`,
            easy: `$x=0,\\ ${m}$。$${DEF(0, m, `${ptex(L)}-x^{2}`)}=${F.tex(A)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, areaNum(x => m * x, x => x * x, -10, 10)),
          };
        }
        const k = r.int(1, 3), A = F.div(fr(4 * k * k * k), fr(3));
        return {
          q: `$y=${k * k}$ と $y=x^{2}$ のグラフで囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: `c${k}`,
          easy: `$x=-${k},\\ ${k}$。$${DEF(-k, k, `${k * k}-x^{2}`)}=${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, areaNum(() => k * k, x => x * x, -10, 10)),
        };
      },
      // 原点を通らない直線と放物線・2つの放物線
      s2(r) {
        if (turn(r, '49s2', 3)) {
          const al = r.int(-3, 1), be = r.int(al + 1, 3), c0 = r.pick([0, 0, 1, -1, 2, -2]), sg = r.pick([1, 1, -1]), S = pairPL(al, be, sg, c0);
          if (deg(S.line) < 1 && S.line[0][0] === 0) return null;
          if (sg > 0 && c0 === 0 && (al === 0 || be === 0 || al + be === 0)) return null;   // $y=mx$・$y=k^2$ と $y=x^2$ はステップ1の形
          const e = [`y=${ptex(S.par)}`, `y=${ptex(S.line)}`], sw = r.chance(0.5);
          return {
            q: `$${e[sw ? 1 : 0]}$ と $${e[sw ? 0 : 1]}$ のグラフで囲まれた部分の面積`, a: `$${F.tex(S.A)}$`, key: [ptex(S.par), ptex(S.line)].sort().join('|'),
            easy: `$x=${al},\\ ${be}$。$${DEF(al, be, ptex(sub(S.up, S.low)))}=${F.tex(S.A)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, areaNum(x => P.val(S.par, x), x => P.val(S.line, x), -10, 10)),
          };
        }
        const a = r.int(1, 3), A = F.div(fr(a * a * a), fr(3)), f2 = Pm(0, 2 * a, -1);
        return {
          q: `$y=x^{2}$ と $y=${ptex(f2)}$ のグラフで囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: `pp${a}`,
          easy: `$x^{2}=${ptex(f2)}$ より $x=0,\\ ${a}$。$${DEF(0, a, ptex(Pm(0, 2 * a, -2)))}=${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, areaNum(x => x * x, x => P.val(f2, x), -10, 10)),
        };
      },
      // 図：直線と放物線にはさまれた部分（ぬり）
      s3(r) {
        const al = r.int(-3, 1), be = r.int(al + 2, 3), c0 = r.pick([0, 1, -1, 2, 3, -2]), sg = r.pick([1, -1]), S = pairPL(al, be, sg, c0);
        if (deg(S.line) < 1) return null;
        const pf = x => P.val(S.par, x), lf = x => P.val(S.line, x);
        const fig = areaFig([{ fn: pf, tex: ptex(S.par) }, { fn: lf, tex: ptex(S.line) }], al, be);
        return {
          q: `図の色のついた部分（$y=${ptex(S.par)}$ と $y=${ptex(S.line)}$ のグラフで囲まれた部分）の面積`, a: `$${F.tex(S.A)}$`, fig, key: `f${ptex(S.par)}|${ptex(S.line)}`,
          easy: `$x=${al},\\ ${be}$。$${DEF(al, be, ptex(sub(S.up, S.low)))}=${F.tex(S.A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, areaNum(pf, lf, -10, 10)),
        };
      },
      // わな：面積ではなく定積分の値（横軸より下はマイナスのまま。5-47）
      trap(r) {
        const c = r.pick([2, 3, 4]), b = r.int(c + 1, c + 2), f = Pm(0, -c, 1), d = defProb(f, 0, b);
        return dest({ q: `$y=${ptex(f)}$ のグラフについて、$${DEF(0, b, ptex(f))}$ の値`, a: `$${F.tex(d.I)}$`, key: `t${c}${b}`, calc: { kind: 'defint', f: ptex(f), a: 0, b } }, '5-49',
          `囲まれた部分の面積ではなく、定積分の値。横軸より下（$0<x<${c}$）はマイナスのまま計算する`);
      },
    },
  });

  // ================================================================ 5-50
  M.add({
    id: '5-50', part: 4, chap: '5-11 例題5・例題8の先', stars: 2,
    title: '放物線と横軸（直線）で囲まれた面積は $\\dfrac{\\lvert a\\rvert(\\beta-\\alpha)^3}{6}$（交わる2点のあいだの長さの3乗）',
    mark: '放物線と横軸、または放物線と直線で囲まれた部分の面積。交わる2点 $\\alpha$、$\\beta$ がすぐわかる。',
    futsu: ['交わる2点 $\\alpha$、$\\beta$ を求め、', '$\\alpha$ から $\\beta$ までの定積分を', '原始関数で計算する', '（5-47・5-49）。'],
    raku: ['$y=4-x^2$：横軸と $x=-2$、$2$ で交わる', 'はば4、$x^2$ の係数は $-1$', '$\\frac{1\\times4^3}{6}=\\frac{32}{3}$'],
    why: '$y=a(x-\\alpha)(x-\\beta)$ を $\\alpha$ から $\\beta$ まで積分すると、いつも $-\\frac{a(\\beta-\\alpha)^3}{6}$ になる（展開して積分すると確かめられる）。だから面積は、$x^2$ の係数の大きさと、交わる2点のあいだの長さだけで決まる。放物線と直線なら、2つの式の差が放物線。教科書の「放物線の山の面積は外の長方形の $\\frac{2}{3}$」と同じこと（5-11 例題5）。',
    caution: '$x^2$ の係数が1でなければ、その大きさ $\\lvert a\\rvert$ をかける。はしが交わる点でない（直線 $x=3$ で切る）ときや、3次のグラフには使えない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm', boxh: '12mm',
    fits(q) {
      if (!/囲まれた/.test(q) || /直線 \$x=/.test(q)) return false;
      const e = eqs(q);
      if (!e.length || e.some(t => polyDeg(t) == null || polyDeg(t) > 2)) return false;
      if (e.length >= 2) return e.some(t => polyDeg(t) === 2);
      return /横軸/.test(q) && polyDeg(e[0]) === 2;
    },
    steps: {
      // $x^2$ の係数が $\pm1$ の放物線と横軸
      s1(r) {
        const al = r.int(-4, 1), be = r.int(al + 1, 4), sg = r.pick([-1, -1, 1]), f = P.scale(P.mul(Pm(-al, 1), Pm(-be, 1)), sg), w = be - al, A = F.div(fr(w * w * w), fr(6));
        return {
          q: `$y=${ptex(f)}$ のグラフと横軸で囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: ptex(f),
          easy: `横軸と $x=${al},\\ ${be}$ で交わる。はば ${w} → $\\frac{${w}^{3}}{6}=${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, areaNum(x => P.val(f, x), () => 0, -10, 10)),
        };
      },
      // 係数が $\pm1$ でない放物線、放物線と直線
      s2(r) {
        if (turn(r, '50s2', 2)) {
          const al = r.int(-3, 1), be = r.int(al + 1, 3), a = r.pick([2, 3, -2, -3, -2]), f = P.scale(P.mul(Pm(-al, 1), Pm(-be, 1)), a), w = be - al, A = F.div(fr(Math.abs(a) * w * w * w), fr(6));
          return {
            q: `$y=${ptex(f)}$ のグラフと横軸で囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: ptex(f),
            easy: `$x=${al},\\ ${be}$、はば ${w}、係数 $${a}$ → $\\frac{${Math.abs(a)}\\times${w}^{3}}{6}=${F.tex(A)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, areaNum(x => P.val(f, x), () => 0, -10, 10)),
          };
        }
        const al = r.int(-2, 1), be = r.int(al + 1, 3), S = pairPL(al, be, 1, 0), w = be - al;
        if (deg(S.line) < 1) return null;
        return {
          q: `$y=x^{2}$ と $y=${ptex(S.line)}$ のグラフで囲まれた部分の面積`, a: `$${F.tex(S.A)}$`, key: `l${ptex(S.line)}`,
          easy: `$x=${al},\\ ${be}$、はば ${w} → $\\frac{${w}^{3}}{6}=${F.tex(S.A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, areaNum(x => x * x, x => P.val(S.line, x), -10, 10)),
        };
      },
      // 図：放物線と横軸（因数分解した形でも）
      s3(r) {
        const al = r.int(-3, 1), be = r.int(al + 2, 4), a = r.pick([-1, -1, 1, -2, 2]), f = P.scale(P.mul(Pm(-al, 1), Pm(-be, 1)), a), w = be - al, A = F.div(fr(Math.abs(a) * w * w * w), fr(6));
        const fct = r.chance(0.4) && Math.abs(a) > 1;
        const lin = c => `(x${c > 0 ? '-' + c : '+' + (-c)})`;   // (x-c)
        const tx = !fct ? ptex(f) : al === 0 ? `${a}x${lin(be)}` : be === 0 ? `${a}x${lin(al)}` : `${a}${lin(al)}${lin(be)}`;
        const fn = x => P.val(f, x);
        const fig = areaFig([{ fn, tex: tx }], al, be);
        return {
          q: `図の色のついた部分（放物線 $y=${tx}$ と横軸で囲まれた部分）の面積`, a: `$${F.tex(A)}$`, fig, key: `f${ptex(f)}`,
          easy: `$x=${al},\\ ${be}$、はば ${w} → $\\frac{${Math.abs(a) === 1 ? '' : Math.abs(a) + '\\times'}${w}^{3}}{6}=${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, areaNum(fn, () => 0, -10, 10)),
        };
      },
      // わな：はしが直線 $x=b$（5-42）、3次のグラフ（5-47 で分けて積分）
      trap(r) {
        if (turn(r, '50t', 2)) {
          const c = r.pick([1, 3]), b = r.int(1, 3), A = F.div(fr(c * b * b * b), fr(3));
          return dest({ q: `$y=${ptex(Pm(0, 0, c))}$ のグラフと横軸、直線 $x=${b}$ で囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: `t${c}${b}`, verify: p => valIs(p.a, simpson(x => c * x * x, 0, b)) }, '5-50',
            `はしが交わる2点ではない（$x=0$ と $x=${b}$）。$${DEF(0, b, ptex(Pm(0, 0, c)))}$ を計算する`, ['5-42']);
        }
        const k = r.int(1, 2), f = Pm(0, -k * k, 0, 1), A = F.div(fr(k * k * k * k), fr(2));
        return dest({ q: `$y=${ptex(f)}$ のグラフと横軸で囲まれた部分の面積`, a: `$${F.tex(A)}$`, key: `c${k}`, verify: p => valIs(p.a, areaNum(x => P.val(f, x), () => 0, -10, 10)) }, '5-50',
          `3次のグラフなので使えない。$x=-${k},\\ 0,\\ ${k}$ で横軸と交わるので、横軸の上と下に分けて積分し、大きさをたす`, ['5-47']);
      },
    },
  });

  // ================================================================ 5-51
  // $S(x)=\int_a^x f(t)\,dt$ の $S'(k)$ を、数で（S を数で積分して、数で微分する）
  // 微分は、はば h と h/2 の中心差分を組み合わせる（3次までの式なら、h^2 のずれが消えて、丸めのずれだけになる）
  const dS = (f, a, k) => {
    const S = x => simpson(t => P.val(f, t), a, x, 400), d = h => (S(k + h) - S(k - h)) / (2 * h), h = 0.02;
    return (4 * d(h / 2) - d(h)) / 3;
  };
  M.add({
    id: '5-51', part: 4, chap: '5-11② 例題6', stars: 1,
    title: '$S(x)=\\int_a^xf(t)\\,\\dd t$ を微分すると $f(x)$（積分しないで、$t$ を $x$ にかえる）',
    mark: '上端が $x$ の定積分 $S(x)$ と、$S\'(2)$・$\\dfrac{\\dd}{\\dd x}\\displaystyle\\int_1^x\\cdots$。',
    futsu: ['$S(x)$ を積分して', '$x$ の式にしてから、', '微分して、$x=2$ を入れる。'],
    raku: ['$S(x)=\\displaystyle\\int_0^x(t^2+1)\\,\\dd t$', '$S\'(x)=x^2+1$（$t$ を $x$ にかえるだけ）', '$S\'(2)=2^2+1=5$'],
    why: '$S(x)$ は、グラフ $y=f(t)$ の $a$ から $x$ までの面積。右はしを少し動かしたときの面積のふえ方は、その場所の高さ $f(x)$（微分積分学の基本定理、5-11②）。下端 $a$ がどの数でも、$S\'(x)$ は変わらない。',
    caution: '$S(2)$（面積そのもの）と $S\'(2)$（面積のふえる速さ）をまちがえない。$S(2)$ なら、積分して計算する（5-47）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '30mm', s3: '16mm', trap: '16mm' }, boxh: { trap: '12mm' },
    fits(q) { return /S'|\\d?frac\{\\dd\}\{\\dd x\}/.test(q) || (/面積/.test(q) && /ふえる速さ/.test(q)); },
    steps: {
      s1(r) {
        const f = Pm(r.int(-4, 5), r.int(-3, 3), r.pick([1, 1, 2, 3, -1]), r.chance(0.3) ? 1 : 0), k = r.pick([1, 2, 3, -1, 2]);
        if (nterms(f) < 2) return null;
        const A = val(f, k);
        return {
          q: `$S(x)=${DEF(0, 'x', ptex(f, 't'), 't')}$ のとき、$S'(${k})$`, a: `$${F.tex(A)}$`, key: `${ptex(f)}|${k}`,
          easy: `$S'(x)=${ptex(f)}$ なので $S'(${k})=${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, dS(f, 0, k)),
        };
      },
      // 下端が0でない・$S'(x)$ を式で・$\frac{\dd}{\dd x}$ の形
      s2(r) {
        const f = Pm(r.int(-4, 4), r.int(-4, 4), r.pick([0, 1, 3, -1]), r.pick([0, 1, 1])), a = r.pick([1, 2, -1, 3]), k = turn(r, '51s2', 2);
        if (nterms(f) < 2 || deg(f) < 1) return null;
        if (k === 0) {
          return {
            q: `$S(x)=${DEF(a, 'x', ptex(f, 't'), 't')}$ のとき、$S'(x)$ を $x$ の式で □`, a: `$S'(x)=${ptex(f)}$`, key: `${ptex(f)}|${a}`,
            easy: '$t$ を $x$ にかえるだけ（下端は関係ない）', easyCheck: false,
            verify: p => { const t0 = strip(p.a).replace(/^.*=/, ''); return [0.5, 1.7, 2.6].every(x => close(evx(t0, 'x', x), dS(f, a, x)) || Math.abs(evx(t0, 'x', x) - dS(f, a, x)) < 1e-5) || '式がちがう'; },
          };
        }
        const x0 = r.pick([1, 2, 3]), A = val(f, x0);
        return {
          q: `$x=${x0}$ のときの $\\dfrac{\\dd}{\\dd x}${DEF(a, 'x', ptex(f, 't'), 't')}$`, a: `$${F.tex(A)}$`, key: `d${ptex(f)}|${a}|${x0}`,
          easy: `$${ptex(f)}$ に $x=${x0}$ を入れて $${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, dS(f, a, x0)),
        };
      },
      // 面積のふえる速さ（ことば）・$S'(x)=0$ になる $x$
      s3(r) {
        if (turn(r, '51s3', 2)) {
          const f = Pm(r.int(1, 4), r.int(0, 3), r.pick([1, 1, 2])), k = r.int(1, 3), A = val(f, k);
          return {
            q: `グラフ $y=${ptex(f, 't')}$ の、0から $x$ までの面積を $S(x)$ とする。$x=${k}$ のとき、$S(x)$ がふえる速さ`, a: `$${F.tex(A)}$`, key: `w${ptex(f)}|${k}`,
            easy: `ふえる速さはその場所の高さ。$S'(${k})=${F.tex(A)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, dS(f, 0, k)),
          };
        }
        const m = r.pick([1, 2, 3]), x0 = r.int(1, 5), f = Pm(-m * x0, m), a = r.pick([0, 1]);
        return {
          q: `$S(x)=${DEF(a, 'x', ptex(f, 't'), 't')}$ で、$S'(x)=0$ になる $x$ の値`, a: `$${x0}$`, key: `z${ptex(f)}|${a}`,
          easy: `$S'(x)=${ptex(f)}=0$ より $x=${x0}$`, easyCheck: false,
          verify: p => Math.abs(dS(f, a, nums(p.a)[0])) < 1e-6 || '0 にならない',
        };
      },
      // わな：$S(2)$ は面積そのもの（積分して計算する。5-47）
      trap(r) {
        const f = P.diff(Pm(0, r.int(1, 3), r.int(-2, 2), r.pick([1, 1, 0]))), k = r.pick([2, 3]), a = r.pick([0, 0, 1]);
        if (nterms(f) < 1 || deg(f) < 1) return null;
        const d = defProb(f, a, k);
        return dest({ q: `$S(x)=${DEF(a, 'x', ptex(f, 't'), 't')}$ のとき、$S(${k})$`, a: `$${F.tex(d.I)}$`, key: `t${ptex(f)}|${a}|${k}`, calc: { kind: 'defint', f: ptex(f), a, b: k } }, '5-51',
          `$S'(${k})$ ではなく $S(${k})$（${a}から${k}までの面積そのもの）。積分して計算する`);
      },
    },
  });

  // ================================================================ 5-52
  const half = (k, xs) => xs.reduce((s, [x, sg]) => F.add(s, F.mul(F.mul(fr(k, 2), F.mul(D(x), D(x))), fr(sg))), fr(0));
  M.add({
    id: '5-52', part: 4, chap: '5-12④', stars: 1,
    title: 'ばねの仕事は $\\dfrac{1}{2}kx^2$（とちゅうからは $\\dfrac{1}{2}k(x_2^{\\,2}-x_1^{\\,2})$）',
    mark: 'ばね定数 $k$（N/m）と、のび（m）。「ばねをのばす仕事」。',
    futsu: ['力 $F=kx$ を、', '$x_1$ から $x_2$ まで積分して', '計算する（5-12③）。'],
    raku: ['$k=200$、$0.1\\,\\mathrm{m}$ から $0.2\\,\\mathrm{m}$', '$\\frac{1}{2}\\times200\\times(0.2^2-0.1^2)$', '$=100\\times0.03=3\\,\\mathrm{J}$'],
    why: 'ばねの力 $F=kx$ はのびに比例するので、$F$-$x$ グラフは原点からの直線。仕事はその下の三角形の面積で $\\frac{1}{2}\\times x\\times kx=\\frac{1}{2}kx^2$（5-12④）。とちゅうからなら、大きい三角形から小さい三角形をひく。',
    caution: '最後の力 $kx$ に $x$ をかけて $kx^2$ としない（三角形なので $\\frac{1}{2}$ がつく）。のびが cm なら m に直す。力が一定なら $\\frac{1}{2}$ はつかない（力×距離）。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /ばね/.test(q); },
    steps: {
      s1(r) {
        const k = r.pick([100, 200, 400, 500, 800, 1000, 50, 300]), x = r.pick([0.05, 0.1, 0.2, 0.3, 0.4]), W = half(k, [[x, 1]]);
        if (!decOK(W[1]) || fmt(F.val(W)).length > 4) return null;
        return {
          q: `ばね定数 $${k}\\,\\mathrm{N/m}$ のばねを、のび0から $${x}\\,\\mathrm{m}$ までのばす仕事 □ J`, a: `$${fx(W)}$`, key: `k${k}x${x}`,
          easy: `$\\frac{1}{2}\\times${k}\\times${x}^{2}=${fx(W)}$`,
          verify: p => valIs(p.a, simpson(s => k * s, 0, x)),
        };
      },
      // とちゅうから
      s2(r) {
        const k = r.pick([100, 200, 400, 500, 1000]), x1 = r.pick([0.05, 0.1, 0.2]), x2 = r.pick([0.1, 0.2, 0.3, 0.4]);
        if (x2 <= x1) return null;
        const W = half(k, [[x2, 1], [x1, -1]]);
        if (!decOK(W[1]) || fmt(F.val(W)).length > 4) return null;
        return {
          q: `ばね定数 $${k}\\,\\mathrm{N/m}$ のばねを、のび $${x1}\\,\\mathrm{m}$ から $${x2}\\,\\mathrm{m}$ までのばす仕事 □ J`, a: `$${fx(W)}$`, key: `k${k}x${x1}-${x2}`,
          easy: `$\\frac{1}{2}\\times${k}\\times(${x2}^{2}-${x1}^{2})=${fx(W)}$`,
          verify: p => valIs(p.a, simpson(s => k * s, x1, x2)),
        };
      },
      // cm で・力の表から $k$・仕事からのび（逆の問題。s1 と同じ key で、同じ見開きに出さない）
      s3(r) {
        const t = turn(r, '52s3', 3);
        if (t === 0) {
          const k = r.pick([200, 400, 500, 1000]), cm = r.pick([5, 10, 20, 30]), x = cm / 100, W = half(k, [[x, 1]]);
          if (!decOK(W[1])) return null;
          return {
            q: `ばね定数 $${k}\\,\\mathrm{N/m}$ のばねを、のび0から $${cm}\\,\\mathrm{cm}$ までのばす仕事 □ J`, a: `$${fx(W)}$`, key: `k${k}x${x}`,
            easy: `$${cm}\\,\\mathrm{cm}=${x}\\,\\mathrm{m}$。$\\frac{1}{2}\\times${k}\\times${x}^{2}=${fx(W)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, 0.5 * k * x * x),
          };
        }
        if (t === 1) {
          const k = r.pick([100, 200, 400, 500]), c0 = r.pick([1, 2, 4, 5]), F0 = k * c0 / 100, cm = r.pick([10, 20]), x = cm / 100, W = half(k, [[x, 1]]);
          return {
            q: `$${c0}\\,\\mathrm{cm}$ のばすのに $${fmt(F0)}\\,\\mathrm{N}$ の力がいるばね（力はのびに比例）を、のび0から $${cm}\\,\\mathrm{cm}$ までのばす仕事 □ J`, a: `$${fx(W)}$`, key: `k${k}x${x}`,
            easy: `$k=${fmt(F0)}\\div${c0 / 100}=${k}$。$\\frac{1}{2}\\times${k}\\times${x}^{2}=${fx(W)}$`, easyCheck: 'last',
            verify: p => valIs(p.a, 0.5 * (F0 / (c0 / 100)) * x * x),
          };
        }
        const k = r.pick([200, 400, 500, 800, 1000, 50]), x = r.pick([0.05, 0.1, 0.2, 0.3]), W = half(k, [[x, 1]]);
        if (!decOK(W[1]) || fmt(F.val(W)).length > 5) return null;
        return {
          q: `ばね定数 $${k}\\,\\mathrm{N/m}$ のばねをのび0からのばすと、仕事が $${fx(W)}\\,\\mathrm{J}$ だった。のび □ m`, a: `$${x}$`, key: `k${k}x${x}`,
          easy: `$\\frac{1}{2}\\times${k}\\times x^{2}=${fx(W)}$ より $x^{2}=${fmt(x * x)}$、$x=${x}$`, easyCheck: false,
          verify: p => valIs(p.a, Math.sqrt(2 * F.val(W) / k)),
        };
      },
      // わな：力が一定（ばねでない。力×距離、$\frac12$ はつけない）
      trap(r) {
        if (turn(r, '52t', 2)) {
          const Fo = r.pick([10, 20, 30, 40, 50]), d = r.pick([2, 3, 4, 5]);
          return dest({ q: `$${Fo}\\,\\mathrm{N}$ の一定の力で、物を力の向きに $${d}\\,\\mathrm{m}$ 動かす仕事 □ J`, a: `$${Fo * d}$`, key: `c${Fo}${d}`, verify: p => valIs(p.a, Fo * d) }, '5-52',
            '力が一定なので「力×距離」。$\\frac{1}{2}$ はつけない（グラフは長方形）');
        }
        const m = r.pick([2, 5, 10]), h = r.pick([1, 2, 3]);
        return dest({ q: `質量 $${m}\\,\\mathrm{kg}$ の荷物を、ゆっくり一定の速さで $${h}\\,\\mathrm{m}$ 持ち上げる仕事 □ J（重力は $1\\,\\mathrm{kg}$ あたり $9.8\\,\\mathrm{N}$）`, a: `$${fmt(m * 9.8 * h)}$`, key: `m${m}${h}`, verify: p => valIs(p.a, m * 9.8 * h) }, '5-52',
          `力は重力と同じ $${fmt(m * 9.8)}\\,\\mathrm{N}$ で一定なので「力×距離」。$\\frac{1}{2}$ はつけない`);
      },
    },
  });

  // ================================================================ 5-53
  const CTX53 = {
    F: (f, T) => ({ q: `位置 $x$（m）で力が $F=${f}$（N）になる物体を、$x=0$ から $${T}\\,\\mathrm{m}$ まで動かす仕事 □ J`, v: 'x' }),
    Q: (f, T) => ({ q: `ポンプの流量が $Q=${f}$（L/min、$t$ は分）で変わる。0分から${T}分までに出た水の量 □ L`, v: 't' }),
    I: (f, T) => ({ q: `電流が $I=${f}$（A、$t$ は秒）で変わる。0秒から${T}秒までに流れた電気の量 □ C`, v: 't' }),
    P: (f, T) => ({ q: `電力が $P=${f}$（kW、$t$ は時間）で変わる。0時間から${T}時間までの電力量 □ kWh`, v: 't' }),
  };
  M.add({
    id: '5-53', part: 4, chap: '5-12②③⑤⑦', stars: 1,
    title: '変わる量を積分すると、たまる量（単位はかけ算）：仕事 $\\int F\\,\\dd x$、水の量 $\\int Q\\,\\dd t$、電気の量 $\\int I\\,\\dd t$',
    mark: '「力が $F=3x^2$」「流量が $Q=3t^2$」「電流が $I=0.2t$」と、たまる量（仕事・水の量・電気の量・電力量）。',
    futsu: ['時間（位置）を細かく分け、', '小さな量を1つずつ計算して', 'たす。分け方を', '細かくしていく（5-12②）。'],
    raku: ['流量 $Q=3t^2$（L/min）、0〜4分', '$\\displaystyle\\int_0^4 3t^2\\,\\dd t=\\Bigl[\\,t^3\\,\\Bigr]_0^4=64$', '(L/min)×min＝L なので $64\\,\\mathrm{L}$'],
    why: '流量・電流・電力は「1分（1秒）あたりの量」。短い時間なら「あたりの量×時間」が小さなたまる量で、それをたし合わせたものが定積分（5-12③⑤⑦）。仕事も「力×小さな距離」の和。単位は、かけ算で「あたり」が消えて決まる。',
    caution: '流量が L/min なら時間は分のまま、電流（A＝C/s）なら秒で積分する（単位をそろえる）。はじめにたまっていた量があれば、それをたす（5-13⑤）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) {
      if (/ばね|平均|いちばん|出会|追いつ|の式で|S'/.test(q)) return false;
      const m = /\$(?:[FQIP]|\\d?frac\{\\dd [VTh]\}\{\\dd t\})=([^$]*)\$/.exec(q);
      return !!m && /[tx]/.test(m[1]) && polyDeg(m[1]) != null && /(から|まで|後)/.test(q);
    },
    steps: {
      // 係数が整数の式（2次・3次）
      s1(r) {
        const kind = ['F', 'Q', 'I', 'P'][turn(r, '53s1', 4)], G = Pm(0, r.int(0, 3), r.int(0, 2), r.int(1, 2)), f = P.diff(G), T = r.int(2, 4);
        const c = CTX53[kind](ptex(f, kind === 'F' ? 'x' : 't'), T), I = val(G, T);
        return { q: c.q, a: `$${F.tex(I)}$`, key: `${kind}${ptex(f)}|${T}`, easy: `$${BR(ptex(G, c.v), 0, T)}=${F.tex(I)}$`, easyCheck: 'last', calc: { kind: 'defint', f: ptex(f, c.v), x: c.v, a: 0, b: T } };
      },
      // 小数の係数・mAh・Wh
      s2(r) {
        const t = turn(r, '53s2', 3);
        if (t === 0) {
          const [kind, u, tu, au, ask] = r.pick([['Q', 'L/s', '秒', 'L', '出た水の量'], ['I', 'A', '秒', 'C', '流れた電気の量']]);
          const c = D(r.pick([0.2, 0.4, 0.5, 0.6, 0.3])), T = r.pick([5, 10, 20]), f = [fr(0), c], I = F.mul(F.div(c, fr(2)), fr(T * T));
          const ft = ptex(f, 't', { dec: true });
          return { q: `${kind === 'Q' ? '流量' : '電流'}が $${kind}=${ft}$（${u}）でふえる。0${tu}から${T}${tu}までに${ask} □ ${au}`, a: `$${fx(I)}$`, key: `${kind}${ft}|${T}`,
            easy: `$${BR(ptex(P.integ(f), 't', { dec: true }), 0, T)}=${fx(I)}$`, easyCheck: 'last', calc: { kind: 'defint', f: ft, x: 't', a: 0, b: T } };
        }
        if (t === 1) {
          const i0 = r.pick([100, 200, 300]), s = r.pick([50, 100]), T = r.pick([2, 4]), f = Pm(i0, s), I = val(P.integ(f), T);
          return { q: `スマートフォンから、電流 $I=${ptex(f, 't')}$（mA、$t$ は時間）が流れた。${T}時間で使った電気の量 □ mAh`, a: `$${F.tex(I)}$`, key: `m${i0}${s}${T}`,
            easy: `$${BR(ptex(P.integ(f), 't'), 0, T)}=${F.tex(I)}$`, easyCheck: 'last', calc: { kind: 'defint', f: ptex(f, 't'), x: 't', a: 0, b: T } };
        }
        const T = r.pick([6, 12]), f = Pm(0, T, -1), I = val(P.integ(f), T);
        return { q: `太陽光パネルの電力が $P=${ptex(f, 't')}$（W、$t$ は時間）で変わった。0時間から${T}時間までの電力量 □ Wh`, a: `$${F.tex(I)}$`, key: `w${T}`,
          easy: `$${BR(ptex(P.integ(f), 't'), 0, T)}=${F.tex(I)}$`, easyCheck: 'last', calc: { kind: 'defint', f: ptex(f, 't'), x: 't', a: 0, b: T } };
      },
      // はじめの量＋たまった量（水の量・温度）
      s3(r) {
        if (turn(r, '53s3', 2)) {
          const V0 = r.pick([10, 20, 30, 50]), G = Pm(0, r.int(1, 4), r.int(1, 2)), f = P.diff(G), T = r.int(2, 5), I = F.add(fr(V0), val(G, T));
          return { q: `水そうに、はじめ $${V0}\\,\\mathrm{L}$ の水がある。流量 $Q=${ptex(f, 't')}$（L/min）で水を入れると、${T}分後の水の量 □ L`, a: `$${F.tex(I)}$`, key: `V${V0}${ptex(f)}${T}`,
            easy: `$${V0}+${BR(ptex(G, 't'), 0, T)}=${F.tex(I)}$`, easyCheck: 'last', verify: p => valIs(p.a, V0 + simpson(t => P.val(f, t), 0, T)) };
        }
        const T0 = r.pick([15, 20, 25]), p0 = r.pick([2, 3, 4]), q0 = D(r.pick([0.1, 0.2])), T = 10, f = [fr(p0), F.mul(q0, fr(-1))], G = P.integ(f), I = F.add(fr(T0), val(G, T));
        return { q: `お湯の温度が $\\dfrac{\\dd T}{\\dd t}=${ptex(f, 't', { dec: true })}$（℃/min）で変わる。はじめが ${T0}℃ のとき、${T}分後の温度 □ ℃`, a: `$${fx(I)}$`, key: `T${T0}${p0}${q0[0]}`,
          easy: `$${T0}+${BR(ptex(G, 't', { dec: true }), 0, T)}=${fx(I)}$`, easyCheck: 'last', verify: p => valIs(p.a, T0 + simpson(t => P.val(f, t), 0, T)) };
      },
      // わな：流量は一定で、単位がそろっていない（L/min と秒）
      trap(r) {
        const Q = r.pick([6, 12, 18, 24, 30]), s = r.pick([10, 20, 30, 40]), V = F.div(fr(Q * s), fr(60));
        if (!decOK(V[1])) return null;
        return dest({ q: `流量 $${Q}\\,\\mathrm{L/min}$ で、${s}秒間に出る水の量 □ L`, a: `$${fx(V)}$`, key: `t${Q}${s}`, verify: p => valIs(p.a, Q * s / 60) }, '5-53',
          `流量は一定なので積分はいらない。1分あたりなので、${s}秒を $\\frac{${s}}{60}$ 分に直して「流量×時間」（$${Q}\\times${s}$ ではない）`);
      },
    },
  });

  // ================================================================ 5-54
  const DEV = ['ドライヤー', '電子レンジ', 'ヒーター', 'エアコン', 'アイロン', '電気ケトル'];
  function sci(n) {   // 正の整数を a\times10^{k} に
    const s = String(n), k = s.length - 1, m = (s[0] + '.' + s.slice(1)).replace(/\.?0+$/, '');
    return k === 0 ? s : `${m}\\times10^{${k}}`;
  }
  M.add({
    id: '5-54', part: 4, chap: '5-12⑥', stars: 1,
    title: '電力量は「kW×h」（分は60でわって h に。$1\\,\\mathrm{kWh}=3.6\\times10^6\\,\\mathrm{J}$）',
    mark: '電力（kW・W）と「□分使った」。電力量を kWh や J で。',
    futsu: ['W を J/s と見て、', '時間を秒に直し、', '$1200\\times900=1080000\\,\\mathrm{J}$', 'のように計算する。'],
    raku: ['$1.2\\,\\mathrm{kW}$ を15分：$15\\div60=0.25\\,\\mathrm{h}$', '$1.2\\times0.25=0.3\\,\\mathrm{kWh}$', 'J なら $0.3\\times3.6\\times10^6=1.08\\times10^6$'],
    why: '電力が一定なら、電力量＝電力×時間（5-12⑥）。kW と h でかければ kWh。$1\\,\\mathrm{kWh}$ は $1000\\,\\mathrm{W}$ を $3600\\,\\mathrm{s}$ 使った量なので $1000\\times3600=3.6\\times10^6\\,\\mathrm{J}$。',
    caution: 'kW と kWh を同じものと考えない（時間をかけて kWh）。分のまま kW にかけない（60でわって h に）。W なら1000でわって kW に。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '30mm', s3: '16mm', trap: '16mm' },
    fits(q) { return /\\mathrm\{k?W\}/.test(q) && /(分|時間)/.test(q) && !/[PQI]=|平均|mA|ごとに/.test(q); },
    steps: {
      s1(r) {
        const Pw = r.pick([0.5, 0.6, 0.8, 1, 1.2, 1.5, 2, 2.4, 3]), mn = r.pick([6, 12, 15, 20, 30, 45, 90]), h = F.div(fr(mn), fr(60)), E = F.mul(D(Pw), h);
        if (!decOK(h[1]) || !decOK(E[1]) || fmt(F.val(E)).length > 5) return null;
        return {
          q: `$${Pw}\\,\\mathrm{kW}$ の${r.pick(DEV)}を${mn}分使った電力量 □ kWh`, a: `$${fx(E)}$`, key: `${Pw}|${mn}`,
          easy: `$${mn}\\div60=${fx(h)}$、$${Pw}\\times${fx(h)}=${fx(E)}$`, easyCheck: 'last', verify: p => valIs(p.a, Pw * mn / 60),
        };
      },
      // J で（$3.6\times10^6$ をかける）、W で
      s2(r) {
        if (turn(r, '54s2', 2)) {
          const Pw = r.pick([0.6, 0.8, 1, 1.2, 1.5, 2]), mn = r.pick([5, 10, 15, 20, 30]), h = F.div(fr(mn), fr(60)), E = F.mul(D(Pw), h), J = Math.round(Pw * 1000) * mn * 60;
          if (!decOK(h[1]) || !decOK(E[1])) return null;
          return {
            q: `$${Pw}\\,\\mathrm{kW}$ の${r.pick(DEV)}を${mn}分使った電力量 □ J`, a: `$${sci(J)}$`, key: `J${Pw}|${mn}`,
            easy: `$${Pw}\\times${fx(h)}=${fx(E)}\\,\\mathrm{kWh}$、$${fx(E)}\\times3.6\\times10^{6}=${sci(J)}$`, easyCheck: 'last', verify: p => valIs(p.a, Pw * 1000 * mn * 60),
          };
        }
        const W = r.pick([40, 60, 100, 200, 500, 800]), hr = r.pick([2, 3, 4, 5, 10]), E = F.div(fr(W * hr), fr(1000));
        return {
          q: W <= 100 ? `$${W}\\,\\mathrm{W}$ の電球を${hr}時間つけた電力量 □ kWh` : `$${W}\\,\\mathrm{W}$ の${r.pick(['ヒーター', 'エアコン', 'ホットプレート'])}を${hr}時間使った電力量 □ kWh`, a: `$${fx(E)}$`, key: `W${W}|${hr}`,
          easy: `$${W}\\,\\mathrm{W}=${fmt(W / 1000)}\\,\\mathrm{kW}$、$${fmt(W / 1000)}\\times${hr}=${fx(E)}$`, easyCheck: 'last', verify: p => valIs(p.a, W * hr / 1000),
        };
      },
      // 電気代・1 kWh で何分
      s3(r) {
        if (turn(r, '54s3', 2)) {
          const Pw = r.pick([1, 1.2, 0.8, 1.5, 2]), mn = r.pick([15, 30, 45, 20]), days = 30, E = F.mul(F.mul(D(Pw), F.div(fr(mn), fr(60))), fr(days)), yen = F.mul(E, fr(31));
          if (E[1] !== 1) return null;
          return {
            q: `1 kWh あたり31円とする。$${Pw}\\,\\mathrm{kW}$ の${r.pick(DEV)}を毎日${mn}分、${days}日使ったときの電気代 □ 円`, a: `$${F.tex(yen)}$`, key: `y${Pw}|${mn}`,
            easy: `$${Pw}\\times${fx(F.div(fr(mn), fr(60)))}\\times${days}=${F.tex(E)}$ kWh、$${F.tex(E)}\\times31=${F.tex(yen)}$`, easyCheck: 'last', verify: p => valIs(p.a, Pw * mn / 60 * days * 31),
          };
        }
        const Pw = r.pick([0.4, 0.5, 0.8, 1.2, 1.5, 2, 2.5, 3]), mn = F.div(fr(60), D(Pw));
        if (mn[1] !== 1) return null;
        return {
          q: `$${Pw}\\,\\mathrm{kW}$ の${r.pick(DEV)}を、ちょうど $1\\,\\mathrm{kWh}$ 使うのは □ 分`, a: `$${F.tex(mn)}$`, key: `m${Pw}`,
          easy: `$1\\div${Pw}=${fx(F.div(fr(1), D(Pw)))}$ 時間 → $${F.tex(mn)}$ 分`, easyCheck: 'last', verify: p => valIs(p.a, 60 / Pw),
        };
      },
      // わな：電力ではなく電流（mA×h で mAh。5-53）
      trap(r) {
        const i = r.pick([100, 200, 300, 500]), hr = r.pick([2, 3, 4, 5]);
        return dest({ q: `$${i}\\,\\mathrm{mA}$ の電流が${hr}時間流れたときの電気の量 □ mAh`, a: `$${i * hr}$`, key: `t${i}${hr}`, verify: p => valIs(p.a, i * hr) }, '5-54',
          '電力（kW）ではなく電流（mA）。電流×時間で、電気の量（mAh）', ['5-53']);
      },
    },
  });

  // ================================================================ 5-55
  // 平均の値（式 f、[a, b]）。f はあいだで0以上かを数で確かめる
  const nonneg = (f, a, b) => { for (let k = 0; k <= 40; k++) if (P.val(f, a + (b - a) * k / 40) < -1e-12) return false; return true; };
  const avgOf = (f, a, b) => F.div(F.sub(val(P.integ(f), b), val(P.integ(f), a)), fr(b - a));
  M.add({
    id: '5-55', part: 4, chap: '5-12⑧', stars: 1,
    title: '平均の値は「積分÷時間」（まっすぐなら両はしの平均）',
    mark: '「平均の速さ」「平均の電力」「平均の温度」と、時間で変わる式。',
    futsu: ['時間を細かく分けて、', 'たくさんの時刻の値を計算し、', '「合計÷個数」を出す', '（5-12⑧）。'],
    raku: ['$v=3t^2$、0〜2秒：$\\displaystyle\\int_0^2 3t^2\\,\\dd t=8$', '$8\\div2=4\\,\\mathrm{m/s}$', '（$\\frac{0+12}{2}=6$ ではない）'],
    why: '平均の値は、グラフの下の面積と同じ面積の長方形の高さ（でこぼこの砂をならした高さ）。だから 平均＝$\\frac{1}{b-a}\\displaystyle\\int_a^b f\\,\\dd t$（5-12⑧）。速さなら「全部の距離÷全部の時間」と同じ。',
    caution: '「(はじめ＋おわり)÷2」が使えるのは、グラフがまっすぐ（1次式）のときだけ。わるのは、あいだの時間 $b-a$。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm', boxh: { s3: '12mm' },
    fits(q) { return /平均/.test(q) && !/位置が/.test(q) && /\$(?:[vPTQ]|y)=/.test(q) && !/ごとに/.test(q); },
    steps: {
      // 曲がった速度（ずっと正）
      s1(r) {
        const k = turn(r, '55s1', 2), T = k === 0 ? r.int(2, 4) : r.pick([3, 6, 6]);
        const f = k === 0 ? Pm(r.pick([0, 0, 1, 2]), 0, r.pick([1, 3, 6])) : Pm(0, T + r.int(0, 4), -1);
        if (!nonneg(f, 0, T)) return null;
        const A = avgOf(f, 0, T), I = F.sub(val(P.integ(f), T), fr(0));
        if (A[1] !== 1 || F.val(A) > 30) return null;   // 平均は整数
        return {
          q: `速度が $v=${ptex(f, 't')}$（m/s）の物体の、0秒から${T}秒までの平均の速さ □ m/s`, a: `$${F.tex(A)}$`, key: `${ptex(f)}|${T}`,
          easy: `$${DEF(0, T, ptex(f, 't'), 't')}=${F.tex(I)}$、$${F.tex(I)}\\div${T}=${F.tex(A)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, simpson(t => P.val(f, t), 0, T) / T),
        };
      },
      // 電力・温度・まっすぐな式
      s2(r) {
        const t = turn(r, '55s2', 3);
        if (t === 0) {
          const T = r.pick([6, 12]), f = Pm(0, T, -1), A = avgOf(f, 0, T);
          return { q: `太陽光パネルの電力が $P=${ptex(f, 't')}$（W、$t$ は時間）で変わった。0時間から${T}時間までの平均の電力 □ W`, a: `$${F.tex(A)}$`, key: `P${T}`,
            easy: `電力量 $${F.tex(F.mul(A, fr(T)))}$ を ${T} でわって $${F.tex(A)}$`, easyCheck: 'last', verify: p => valIs(p.a, simpson(x => P.val(f, x), 0, T) / T) };
        }
        if (t === 1) {
          const T = r.pick([3, 6]), c = r.pick([10, 15, 20]), b = T, f = Pm(c, b, -1), A = avgOf(f, 0, T);
          if (A[1] !== 1) return null;
          return { q: `部屋の温度が $T=${ptex(f, 't')}$（℃、$t$ は時間）で変わった。$t=0$ から${T}までの平均の温度 □ ℃`, a: `$${F.tex(A)}$`, key: `T${c}${T}`,
            easy: `$${DEF(0, T, ptex(f, 't'), 't')}=${F.tex(F.mul(A, fr(T)))}$、$\\div${T}$ で $${F.tex(A)}$`, easyCheck: 'last', verify: p => valIs(p.a, simpson(x => P.val(f, x), 0, T) / T) };
        }
        const p0 = r.pick([4, 6, 8, 10]), T = r.pick([2, 4]), f = Pm(p0, -1), A = avgOf(f, 0, T);
        return { q: `電力が $P=${ptex(f, 't')}$（kW、$t$ は時間）でへる充電器の、0時間から${T}時間までの平均の電力 □ kW`, a: `$${F.tex(A)}$`, key: `L${p0}${T}`,
          easy: `まっすぐなので $\\frac{${p0}+${p0 - T}}{2}=${F.tex(A)}$`, easyCheck: 'last', verify: p => valIs(p.a, simpson(x => P.val(f, x), 0, T) / T) };
      },
      // 0から始まらない・グラフの平均の高さ
      s3(r) {
        if (turn(r, '55s3', 2)) {
          const a = r.int(1, 2), b = r.int(a + 1, a + 2), f = Pm(r.pick([0, 0, 1, 2]), r.pick([0, 0, 2]), 3), G = P.integ(f), I = F.sub(val(G, b), val(G, a)), A = avgOf(f, a, b);
          return { q: `速度が $v=${ptex(f, 't')}$（m/s）の物体の、${a}秒から${b}秒までの平均の速さ □ m/s`, a: `$${F.tex(A)}$`, key: `m${ptex(f)}|${a}${b}`,
            easy: `$${BR(ptex(G, 't'), a, b)}=${F.tex(I)}$、$\\div${b - a}$ で $${F.tex(A)}$`, easyCheck: 'last', verify: p => valIs(p.a, simpson(t => P.val(f, t), a, b) / (b - a)) };
        }
        const b = r.int(2, 6), c = r.pick([1, 3]), f = Pm(0, 0, c), A = avgOf(f, 0, b);
        return { q: `$y=${ptex(f)}$ のグラフの、$0\\leqq x\\leqq${b}$ での平均の高さ`, a: `$${F.tex(A)}$`, key: `y${c}${b}`,
          easy: `$${DEF(0, b, ptex(f))}\\div${b}=${F.tex(A)}$`, easyCheck: 'last', verify: p => valIs(p.a, simpson(x => c * x * x, 0, b) / b) };
      },
      // わな：位置の式がわかっている（積分はいらない。瞬間の速さは 5-10、平均の速さは 5-02）
      trap(r) {
        const c = r.pick([1, 2]), d = r.pick([1, 2, 3, 4]), x = Pm(0, d, 0, c), T = r.pick([2, 3]);
        if (turn(r, '55t', 2)) {
          const v = val(P.diff(x), T);
          return dest({ q: `位置が $x=${ptex(x, 't')}$（m）の物体の、${T}秒の瞬間の速さ □ m/s`, a: `$${F.tex(v)}$`, key: `i${ptex(x)}${T}`, verify: p => valIs(p.a, (P.val(x, T + 1e-5) - P.val(x, T - 1e-5)) / 2e-5) }, '5-55',
            '平均ではなく瞬間の速さ。位置を微分した速度の式に入れる', ['5-10']);
        }
        const A = F.div(val(x, T), fr(T));
        return dest({ q: `位置が $x=${ptex(x, 't')}$（m）の物体の、0秒から${T}秒までの平均の速さ □ m/s`, a: `$${F.tex(A)}$`, key: `a${ptex(x)}${T}`, verify: p => valIs(p.a, (P.val(x, T) - P.val(x, 0)) / T) }, '5-55',
          '位置の式がわかっているので、積分はいらない。（あとの位置－まえの位置）÷時間', ['5-02']);
      },
    },
  });

  // ================================================================ 5-56
  // 表（はかった値）の台形の和
  const trapSum = (vs, w) => F.mul(vs.reduce((s, v, i) => F.add(s, (i === 0 || i === vs.length - 1) ? F.div(D(v), fr(2)) : D(v)), fr(0)), D(w));
  const trapNum = (vs, w) => { let s = 0; for (let i = 0; i + 1 < vs.length; i++) s += (vs[i] + vs[i + 1]) / 2 * w; return s; };
  const listTeX = vs => vs.map(v => `$${v}$`).join('、');
  // はかった値の列（n+1 こ）：前の値から少しずつ変わる（1 以上 top 以下）
  const walk = (r, n, top) => { const vs = [r.int(1, top)]; for (let i = 1; i <= n; i++) vs.push(Math.max(1, Math.min(top, vs[i - 1] + r.int(-Math.ceil(top / 3), Math.ceil(top / 3))))); return vs; };
  const easy56 = (vs, w, I) => `$(${[fx(F.div(D(vs[0]), fr(2))), ...vs.slice(1, -1).map(String), fx(F.div(D(vs[vs.length - 1]), fr(2)))].join('+')})\\times${w}=${fx(I)}$`;
  M.add({
    id: '5-56', part: 4, chap: '5-12 例題10', stars: 1,
    title: 'はかった値の表は台形の和：（はし2つは半分＋なか全部）×はば',
    mark: '1分ごと・1時間ごとにはかった流量・電力・速さの表から、たまった量を「およそ」求める。',
    futsu: ['1区間ごとに', '「(左＋右)÷2×はば」の', '台形の面積を計算して、', '全部たす。'],
    raku: ['流量 2、6、8、9、9（1分ごと）', '$(1+6+8+9+4.5)\\times1=28.5\\,\\mathrm{L}$', '（はしの2と9は半分にする）'],
    why: '1区間の中では、量がほぼまっすぐ変わると考えて台形にする（5-12 例題10）。となりあう台形で、なかの値は2回ずつ、はしの値は1回ずつ使われるので、まとめると「はしは半分、なかはそのまま」をたして、はばをかければよい。',
    caution: 'はばが1でなければ、最後にはばをかける（2分ごとなら×2）。表の値が「たまった量」なら、台形の和ではなく「あと－まえ」。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /ごとにはか/.test(q) && !/たまった/.test(q); },
    steps: {
      s1(r) {
        const n = r.int(4, 5), vs = walk(r, n, 12);
        if (new Set(vs).size < 3) return null;
        const I = trapSum(vs, 1);
        return { q: `流量を1分ごとにはかると、0分から${n}分まで ${listTeX(vs)}（L/min）だった。出た水の量はおよそ □ L`, a: `$${fx(I)}$`, key: vs.join(','),
          easy: easy56(vs, 1, I), verify: p => valIs(p.a, trapNum(vs, 1)) };
      },
      // はばが1でない、電力・速さ
      s2(r) {
        const [what, u, w, tu, au, ask] = ([['流量', 'L/min', 2, '分', 'L', '出た水の量'], ['電力', 'kW', 1, '時間', 'kWh', '電力量'], ['電力', 'kW', 0.5, '時間', 'kWh', '電力量'], ['速さ', 'm/s', 10, '秒', 'm', '進んだ距離']])[turn(r, '56s2', 4)];
        const n = r.int(4, 5), top = u === 'm/s' ? 20 : 10, vs = walk(r, n, top);
        if (new Set(vs).size < 3) return null;
        const I = trapSum(vs, w);
        return { q: `${what}を${w}${tu}ごとにはかると、0${tu}から${fmt(w * n)}${tu}まで ${listTeX(vs)}（${u}）だった。${ask}はおよそ □ ${au}`, a: `$${fx(I)}$`, key: `${u}${w}:${vs.join(',')}`,
          easy: easy56(vs, w, I), verify: p => valIs(p.a, trapNum(vs, w)) };
      },
      // 平均の流量（台形の和÷時間）
      s3(r) {
        const n = 4, vs = walk(r, n, 12), I = trapSum(vs, 1), A = F.div(I, fr(n));
        if (new Set(vs).size < 3 || A[1] > 2) return null;   // 平均は整数か、□.5
        return { q: `流量を1分ごとにはかると、0分から${n}分まで ${listTeX(vs)}（L/min）だった。${n}分間の平均の流量はおよそ □ L/min`, a: `$${fx(A)}$`, key: `a${vs.join(',')}`,
          easy: `台形の和 $${fx(I)}$ を ${n} でわって $${fx(A)}$`, easyCheck: 'last', verify: p => valIs(p.a, trapNum(vs, 1) / n) };
      },
      // わな：表の値が「たまった量」（あと－まえ。5-02）
      trap(r) {
        const fl = Array.from({ length: 4 }, () => r.int(2, 9)), cum = [0];
        fl.forEach(v => cum.push(cum[cum.length - 1] + v));
        const k = 1 + turn(r, '56t', 3);
        return dest({ q: `たまった水の量を1分ごとにはかると、0分から4分まで ${listTeX(cum)}（L）だった。${k}分から${k + 1}分までの平均の流量 □ L/min`, a: `$${fl[k]}$`, key: `t${cum.join(',')}|${k}`, verify: p => valIs(p.a, cum[k + 1] - cum[k]) }, '5-56',
          '表の値は流量ではなく、たまった量。台形の和ではなく（あと－まえ）÷時間', ['5-02']);
      },
    },
  });

  // ================================================================ 5-57
  M.add({
    id: '5-57', part: 4, chap: '5-13①②', stars: 1,
    title: '積分定数は、はじめの状態で：$t=0$ の値はそのまま $C$、ほかの時刻ならその時刻を入れて解く',
    mark: '速度の式と「$t=0$ の位置」「$t=1$ で位置0」など。積分して、$C$ を決める。',
    futsu: ['位置を $x=at^2+bt+c$ とおき、', '微分して速度の式とくらべ、', '$a$、$b$ を決める。$c$ は、', 'わかっている位置で決める。'],
    raku: ['$v=3t^2-4$、$t=1$ で $x=0$', '$x=t^3-4t+C$、$0=1-4+C$', '$C=3$ → $x=t^3-4t+3$'],
    why: '位置は速度の原始関数なので $x=F(t)+C$（5-13①）。$C$ はグラフを上下にずらす量で、速度だけでは決まらない。$t=0$ を入れると $x(0)=C$ なので、$C$ ははじめの位置。ほかの時刻の値がわかっているときは、その時刻と値を入れて $C$ について解く（5-13②）。',
    caution: '$C$ を0にしない。$t=1$ の位置を、そのまま $C$ にしない（$t=1$ を入れて解く）。答えは、微分してもとの速度にもどるか、初期条件を入れて合うかで確かめる。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '36mm',
    fits(q) {
      if (/加速度|出会|追いつ|いちばん|平均|a=/.test(q)) return false;
      return /(速度が \$v=|\\d?frac\{\\dd [VhT]\}\{\\dd t\}=)/.test(q) && /(のとき|はじめ|\$t=\d+\$ の位置)/.test(q) && /(位置|量|水位|温度)/.test(q);
    },
    steps: {
      // $t=0$ の位置
      s1(r) {
        const G = Pm(0, r.int(-4, 5), r.int(1, 3), r.chance(0.4) ? 1 : 0), f = P.diff(G), x0 = nzs(r, -5, 8);
        if (nterms(f) < 1) return null;
        const X = P.add(G, Pm(x0)), A = `x=${ptex(X, 't')}`;
        return {
          q: `速度が $v=${ptex(f, 't')}$（m/s）で、$t=0$ の位置が $${x0}\\,\\mathrm{m}$ の物体の位置 $x$ を $t$ の式で □`, a: `$${A}$`, key: `${ptex(f)}|0|${x0}`,
          easy: `$x=${ptex(G, 't')}+C$、$t=0$ を入れて $C=${x0}$`, easyCheck: false, verify: p => icCheck(p.a, ptex(f, 't'), [[0, x0]]),
        };
      },
      // $t=0$ でない時刻の位置
      s2(r) {
        const G = Pm(0, r.int(-4, 4), r.int(-2, 3), r.pick([0, 1, 1])), f = P.diff(G), t1 = r.int(1, 3), x1 = r.int(-2, 12);
        if (nterms(f) < 2) return null;
        const C = F.sub(fr(x1), val(G, t1)), X = P.add(G, [C]), A = `x=${ptex(X, 't')}`;
        if (C[0] === 0) return null;   // C＝0 は出さない（「C を0にしない」のわざなので）
        return {
          q: `速度が $v=${ptex(f, 't')}$（m/s）で、$t=${t1}$ のとき位置が $${x1}\\,\\mathrm{m}$ の物体の位置 $x$ を $t$ の式で □`, a: `$${A}$`, key: `${ptex(f)}|${t1}|${x1}`,
          easy: `$x=${ptex(G, 't')}+C$、$${x1}=${F.tex(val(G, t1))}+C$ より $C=${F.tex(C)}$`, easyCheck: false, verify: p => icCheck(p.a, ptex(f, 't'), [[t1, x1]]),
        };
      },
      // 水の量の式・わかっている時刻からほかの時刻の位置
      s3(r) {
        if (turn(r, '57s3', 2)) {
          const G = Pm(0, r.int(2, 30), -r.int(1, 3)), f = P.diff(G), V0 = r.pick([20, 50, 80, 100]), X = P.add(G, Pm(V0)), A = `V=${ptex(X, 't')}`;
          return {
            q: `タンクの水の量 $V$（L）が $\\dfrac{\\dd V}{\\dd t}=${ptex(f, 't')}$（L/min）で変わる。$t=0$ のとき $${V0}\\,\\mathrm{L}$。$V$ を $t$ の式で □`, a: `$${A}$`, key: `V${ptex(f)}|${V0}`,
            easy: `$V=${ptex(G, 't')}+C$、$C=${V0}$`, easyCheck: false, verify: p => icCheck(p.a, ptex(f, 't'), [[0, V0]]),
          };
        }
        const G = Pm(0, r.int(1, 3), 1), f = P.diff(G), t1 = r.int(1, 3), x1 = r.int(t1 + 4, 20), C = F.sub(fr(x1), val(G, t1)), X = P.add(G, [C]), t2 = r.int(t1 + 1, 5);
        return {
          q: `速度が $v=${ptex(f, 't')}$（m/s）の物体が、$t=${t1}$ のとき位置 $${x1}\\,\\mathrm{m}$ にいた。$t=0$ の位置 □ m、$t=${t2}$ の位置 □ m`, a: `$${F.tex(C)}$、$${F.tex(val(X, t2))}$`, key: `p${ptex(f)}|${t1}|${x1}`,
          easy: `$x=${ptex(G, 't')}+C$、$C=${F.tex(C)}$。$x(${t2})=${F.tex(val(X, t2))}$`, easyCheck: false, boxw: '16mm', boxh: null,
          verify: p => { const C2 = x1 - P.val(G, t1); return valsAre(p.a, [C2, P.val(G, t2) + C2]); },
        };
      },
      // わな：加速度とはじめの速度・位置（2回積分。5-58）
      trap(r) {
        const c = r.pick([6, 12]), v0 = r.int(-3, 4), x0 = r.int(0, 5), X = Pm(x0, v0, 0, c / 6), A = `x=${ptex(X, 't')}`;
        return dest({ q: `加速度が $a=${c}t$（$\\mathrm{m/s^2}$）で、はじめの速度が $${v0}\\,\\mathrm{m/s}$、はじめの位置が $${x0}\\,\\mathrm{m}$ の物体の位置 $x$ を $t$ の式で □`, a: `$${A}$`, key: `t${c}${v0}${x0}`,
          verify: p => ic2Check(p.a, `${c}t`, v0, x0) }, '5-57', '速度ではなく加速度なので、2回積分して $C$ が2つ（はじめの速度と、はじめの位置）');
      },
    },
  });

  // ================================================================ 5-58
  M.add({
    id: '5-58', part: 4, chap: '5-13③', stars: 1,
    title: '加速度から位置は2回積分、$C$ は2つ（はじめの速度とはじめの位置）',
    mark: '加速度の式（一定、または $a=6t$）と、はじめの速度・はじめの位置。',
    futsu: ['短い時間ごとに', '「次の速度」「次の位置」を', 'くり返し計算して、', '表で近づける（5-13⑥）。'],
    raku: ['$a=6t$、$v_0=2$、$x_0=0$', '$v=3t^2+C_1=3t^2+2$', '$x=t^3+2t+C_2=t^3+2t$'],
    why: '速度は加速度の原始関数、位置は速度の原始関数（5-13③）。1回めの積分の $C_1$ は $t=0$ の速度、2回めの $C_2$ は $t=0$ の位置。加速度が一定なら $v=v_0+at$、$x=x_0+v_0t+\\frac{1}{2}at^2$。',
    caution: '$C$ を1つにまとめない（$C_1$ と $C_2$）。$a$ が $t$ で変わるときは、加速度が一定のときの式（$v=v_0+at$ など）は使えない（2回積分する）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '36mm', s2: '16mm', s3: '36mm', trap: '36mm' },
    fits(q) { return /(加速度|a=)/.test(q) && /(はじめの速度|投げ|で走る)/.test(q) && !/いちばん|静かに|止まった|秒後に、/.test(q); },
    steps: {
      // 加速度が一定
      s1(r) {
        const a = r.pick([2, 3, 4, 6, -2, -4, -10]), v0 = r.int(0, 20), x0 = r.int(0, 10), X = [fr(x0), fr(v0), fr(a, 2)], A = `x=${ptex(X, 't', { dec: true })}`;
        return {
          q: `加速度 $${a}\\,\\mathrm{m/s^2}$、はじめの速度 $${v0}\\,\\mathrm{m/s}$、はじめの位置 $${x0}\\,\\mathrm{m}$ の物体の位置 $x$ を $t$ の式で □`, a: `$${A}$`, key: `${a}|${v0}|${x0}`,
          easy: `$v=${ptex([fr(a)], 't')}t+C_1$、$C_1=${v0}$。もう1回積分して、$C_2=${x0}$`.replace('$v=1t', '$v=t').replace('$v=-1t', '$v=-t'), easyCheck: false, verify: p => ic2Check(p.a, `${a}`, v0, x0),
        };
      },
      // 加速度が $t$ で変わる。$T$ 秒後の速度と位置
      s2(r) {
        const c = r.pick([6, 12, 6, 12, 2, 3]), v0 = r.int(-3, 4), x0 = r.int(0, 3), T = c === 2 ? 3 : c === 3 ? 2 : r.int(1, 3);
        const V = [fr(v0), fr(0), fr(c, 2)], X = [fr(x0), fr(v0), fr(0), fr(c, 6)], vT = val(V, T), xT = val(X, T);
        if (vT[1] !== 1 || xT[1] !== 1) return null;
        return {
          q: `加速度が $a=${c}t$（$\\mathrm{m/s^2}$）、はじめの速度 $${v0}\\,\\mathrm{m/s}$、はじめの位置 $${x0}\\,\\mathrm{m}$ の物体の、${T}秒後の速度 □ m/s、位置 □ m`, a: `$${F.tex(vT)}$、$${F.tex(xT)}$`, key: `${c}|${v0}|${x0}|${T}`,
          easy: `$v=${ptex(V, 't')}$、$x=${ptex(X, 't')}$`, easyCheck: false,
          verify: p => { const vOf = s => v0 + simpson(t => c * t, 0, s, 200); return valsAre(p.a, [vOf(T), x0 + simpson(vOf, 0, T, 200)]); },   // 加速度を数で積分して速度、速度を数で積分して位置
        };
      },
      // 投げ上げ・ブレーキ・ロケット（ことばで）
      s3(r) {
        const k = turn(r, '58s3', 3);
        if (k === 0) {
          const h0 = r.pick([0, 1, 1.5, 2]), v0 = r.pick([10, 15, 20, 25, 30]), X = [D(h0), fr(v0), fr(-5)], A = `x=${ptex(X, 't', { dec: true })}`;
          return {
            q: `${h0 === 0 ? '地面から' : `高さ $${h0}\\,\\mathrm{m}$ から`}、上向きに $${v0}\\,\\mathrm{m/s}$ でボールを投げた（$a=-10$、上向きが＋）。高さ $x$ を $t$ の式で □`, a: `$${A}$`, key: `n${h0}|${v0}`,
            easy: `$v=${v0}-10t$、$${A}$`, easyCheck: false, verify: p => ic2Check(p.a, '-10', v0, h0),
          };
        }
        if (k === 1) {
          const v0 = r.pick([10, 15, 20, 25, 30]), b = r.pick([2, 4, 5]), X = [fr(0), fr(v0), fr(-b, 2)], A = `x=${ptex(X, 't', { dec: true })}`;
          return {
            q: `$${v0}\\,\\mathrm{m/s}$ で走る車が、加速度 $-${b}\\,\\mathrm{m/s^2}$ でブレーキをかけた。ブレーキをかけた時刻を $t=0$、その場所を位置0として、位置 $x$ を $t$ の式で □`, a: `$${A}$`, key: `b${v0}|${b}`,
            easy: `$v=${v0}-${b}t$、$${A}$`, easyCheck: false, verify: p => ic2Check(p.a, `-${b}`, v0, 0),
          };
        }
        const c = r.pick([2, 6]), T = r.pick([3, 6]), vT = c / 2 * T * T, xT = c / 6 * T * T * T;
        return {
          q: `ロケットの加速度が $a=${c}t$（$\\mathrm{m/s^2}$）でふえていく。はじめの速度と位置は0。${T}秒後の速度 □ m/s、位置 □ m`, a: `$${vT}$、$${xT}$`, key: `r${c}|${T}`,
          easy: `$v=${ptex([fr(0), fr(0), fr(c, 2)], 't')}$、$x=${ptex([fr(0), fr(0), fr(0), fr(c, 6)], 't')}$`, easyCheck: false, boxw: '16mm',
          verify: p => valsAre(p.a, [simpson(t => c * t, 0, T), simpson(s => simpson(t => c * t, 0, s, 200), 0, T, 200)]),
        };
      },
      // わな：速度とはじめの位置だけ（積分は1回。5-57）
      trap(r) {
        const G = Pm(0, r.int(-3, 4), r.int(1, 3)), f = P.diff(G), x0 = nzs(r, -4, 6), X = P.add(G, Pm(x0)), A = `x=${ptex(X, 't')}`;
        return dest({ q: `速度が $v=${ptex(f, 't')}$（m/s）で、はじめの位置が $${x0}\\,\\mathrm{m}$ の物体の位置 $x$ を $t$ の式で □`, a: `$${A}$`, key: `t${ptex(f)}${x0}`,
          verify: p => icCheck(p.a, ptex(f, 't'), [[0, x0]]) }, '5-58', '加速度ではなく速度がわかっているので、積分は1回、$C$ は1つ（はじめの位置）');
      },
    },
  });

  // ================================================================ 5-59
  const H59 = k => fmt(4.9 * k * k);   // 4.9、19.6、44.1、…
  const OBJ = ['ボール', '石', 'りんご', '小さな鉄の球'];
  const G98 = '（$g=9.8\\,\\mathrm{m/s^2}$）';
  M.add({
    id: '5-59', part: 4, chap: '5-13④', stars: 1,
    title: '落とした物は $x=4.9t^2$：高さ÷4.9 が平方数なら、時刻はその平方根',
    mark: '「静かに落とす」と高さ（$g=9.8\\,\\mathrm{m/s^2}$）。地面に着く時刻・そのときの速さ。',
    futsu: ['$x=x_0+v_0t-4.9t^2$ に', '$v_0=0$ を入れ、', '$x=0$ の方程式を解く。'],
    raku: ['$44.1\\,\\mathrm{m}$：$44.1\\div4.9=9$', '$t^2=9$ なので3秒', '速さは $9.8\\times3=29.4\\,\\mathrm{m/s}$'],
    why: '静かに落とすと $v_0=0$ なので、落ちた距離は $\\frac{1}{2}\\times9.8\\times t^2=4.9t^2$（5-13④）。地面に着くのは、落ちた距離が高さと等しくなるとき。$4.9\\times9=44.1$ のように、高さが4.9の平方数倍（4.9、19.6、44.1、78.4）なら、時刻は整数。速さは $v=9.8t$。',
    caution: '$t^2=9$ から $t=9$ としない（2回かけて9になる正の数）。上向きを＋にすると、速度は $-9.8t$（下向き）。上向きに投げたときは $v_0$ があるので、この形ではない。',
    counts: { s1: 6, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /静かに/.test(q) && /落と/.test(q); },
    steps: {
      s1(r) {
        const k = r.int(1, 7);
        return { q: `高さ $${H59(k)}\\,\\mathrm{m}$ から静かに落とした${r.pick(OBJ)}が、地面に着くまでの時間 □ 秒${G98}`, a: `$${k}$`, key: `k${k}`,
          easy: `$${H59(k)}\\div4.9=${k * k}$、$t=${k}$`, easyCheck: 'last', verify: p => valIs(p.a, Math.sqrt(2 * (+H59(k)) / 9.8)) };
      },
      // 地面に着くときの速さ・とちゅうの高さを通る時刻
      s2(r) {
        const k = r.int(2, 6);
        if (turn(r, '59s2', 2)) {
          return { q: `高さ $${H59(k)}\\,\\mathrm{m}$ から静かに落とした${r.pick(OBJ)}が、地面に着くときの速さ □ m/s${G98}`, a: `$${fmt(9.8 * k)}$`, key: `v${k}`,
            easy: `$${H59(k)}\\div4.9=${k * k}$ より ${k}秒、$9.8\\times${k}=${fmt(9.8 * k)}$`, easyCheck: 'last', verify: p => valIs(p.a, Math.sqrt(2 * 9.8 * (+H59(k)))) };
        }
        const j = r.int(1, k - 1), h2 = fmt(4.9 * (k * k - j * j));
        return { q: `高さ $${H59(k)}\\,\\mathrm{m}$ から静かに落とした${r.pick(OBJ)}が、地面から $${h2}\\,\\mathrm{m}$ の高さを通るのは □ 秒後${G98}`, a: `$${j}$`, key: `p${k}-${j}`,
          easy: `落ちた距離は $${H59(k)}-${h2}=${H59(j)}$、$\\div4.9=${j * j}$ で ${j}秒`, easyCheck: false, verify: p => valIs(p.a, Math.sqrt(2 * (+H59(k) - +h2) / 9.8)) };
      },
      // 時刻から高さ（逆の問題。s1 と同じ key）・とちゅうの1秒に落ちる距離
      s3(r) {
        if (turn(r, '59s3', 2)) {
          const k = r.int(1, 7);
          return { q: `がけの上から静かに落とした石が、${k}秒後に水面に着いた。がけの上から水面までの高さ □ m${G98}`, a: `$${H59(k)}$`, key: `k${k}`,
            easy: `$4.9\\times${k}^{2}=${H59(k)}$`, verify: p => valIs(p.a, 0.5 * 9.8 * k * k) };
        }
        const j = r.int(1, 4), d = fmt(4.9 * ((j + 1) ** 2 - j * j));
        return { q: `静かに落とした${r.pick(OBJ)}が、${j}秒後から${j + 1}秒後までの1秒間に落ちる距離 □ m${G98}`, a: `$${d}$`, key: `d${j}`,
          easy: `$4.9\\times${j + 1}^{2}-4.9\\times${j}^{2}=${d}$`, verify: p => valIs(p.a, simpson(t => 9.8 * t, j, j + 1)) };
      },
      // わな：上向きに投げた（$v_0$ がある。5-58）
      trap(r) {
        const k = r.int(1, 3), v0 = fmt(9.8 * k);
        if (turn(r, '59t', 2)) {   // とちゅうの時刻の高さ
          const T = r.int(1, 2 * k - 1), h = fmt(9.8 * k * T - 4.9 * T * T);
          return dest({ q: `地面から上向きに $${v0}\\,\\mathrm{m/s}$ で投げ上げたボールの、${T}秒後の高さ □ m（加速度 $-9.8\\,\\mathrm{m/s^2}$、上向きが＋）`, a: `$${h}$`, key: `h${k}|${T}`,
            verify: p => valIs(p.a, simpson(t => 9.8 * k - 9.8 * t, 0, T)) }, '5-59', `はじめの速度があるので $4.9t^2$ だけではない。$x=${v0}t-4.9t^{2}$ に $t=${T}$ を入れる`, ['5-58']);
        }
        return dest({ q: `地面から上向きに $${v0}\\,\\mathrm{m/s}$ で投げ上げたボールが、地面にもどってくるまでの時間 □ 秒（加速度 $-9.8\\,\\mathrm{m/s^2}$、上向きが＋）`, a: `$${2 * k}$`, key: `t${k}`,
          verify: p => valIs(p.a, 2 * (9.8 * k) / 9.8) }, '5-59', `はじめの速度があるので $4.9t^2$ だけではない。$x=${v0}t-4.9t^{2}=0$ を解く`, ['5-58']);
      },
    },
  });

  // ================================================================ 5-60
  M.add({
    id: '5-60', part: 4, chap: '5-13 例題6・7', stars: 1,
    title: '出会う時刻は「位置の式どうしを等しく」して、因数分解か整数をためす',
    mark: '2つの物体の速度と、はじめの位置。「出会う」「追いつく」時刻。',
    futsu: ['2つの物体の位置を', '1秒ごとに計算して表にし、', '同じになる時刻をさがす', '（整数秒でないと見つからない）。'],
    raku: ['A：$x=t^2$、B：$x=15-2t$', '$t^2+2t-15=(t+5)(t-3)=0$', '$t>0$ なので3秒後（位置 $9\\,\\mathrm{m}$）'],
    why: '同じ時刻に同じ位置にいるのが「出会う」こと。それぞれの速度を積分し、はじめの位置で $C$ を決めて位置の式をつくり（5-13①）、等しいとおく。2次なら因数分解（3-10）。3次で「整数秒」とわかっていれば、$t=1,\\ 2,\\ 3,\\ \\ldots$ をためす。',
    caution: '解が2つ出たら、$t>0$ のほうだけ。速度が等しくなる時刻と、出会う時刻をまちがえない。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /出会|追いつ/.test(q); },
    steps: {
      // A：$v=2pt$（位置0から）、B：一定の速度でもどる
      s1(r) {
        const p = r.pick([1, 1, 2]), c = r.int(1, 6), T = r.int(2, 6), L = p * T * T + c * T;
        return {
          q: `物体Aは位置0から速度 $v=${2 * p}t$ で、物体Bは位置 $${L}\\,\\mathrm{m}$ から速度 $${-c}\\,\\mathrm{m/s}$ で動く。2つが出会うのは □ 秒後`, a: `$${T}$`, key: `${p}|${c}|${L}`,
          easy: p === 2 && c % 2 === 0
            ? `$2t^{2}=${L}-${c}t$、2でわって $t^{2}+${c === 2 ? '' : c / 2}t-${L / 2}=0$、$(t-${T})(t+${T + c / 2})=0$ → $t=${T}$`
            : `$${p === 1 ? '' : p}t^{2}=${L}-${c === 1 ? '' : c}t$、$(t-${T})(${p === 1 ? '' : p}t+${p * T + c})=0$ → $t=${T}$`, easyCheck: false,
          verify: p0 => { const g = t => p * t * t - (L - c * t); let n = 0, tt = null; for (let k = 1; k <= 4000; k++) { const a = (k - 1) / 400, b = k / 400; if (g(a) * g(b) <= 0 && g(a) !== 0) { n++; tt = b; } } return (n === 1 && Math.abs(tt - T) < 0.003 && valIs(p0.a, T) === true) || '出会う時刻がちがう'; },
        };
      },
      // A：$v=3t^2$（$x=t^3$）。整数秒をためす
      s2(r) {
        const c = r.int(1, 6), T = r.int(2, 4), L = T * T * T + c * T;
        return {
          q: `Aは位置0から速度 $v=3t^{2}$ で、Bは位置 $${L}\\,\\mathrm{m}$ から速度 $${-c}\\,\\mathrm{m/s}$ で動く。出会うのは □ 秒後（整数秒）`, a: `$${T}$`, key: `c${c}|${L}`,
          easy: `$t=${T}$：Aは $${T}^{3}=${T ** 3}$、Bは $${L}-${c * T}=${L - c * T}$`, easyCheck: false,
          verify: p => { const g = t => t * t * t + c * t - L; return (Math.abs(g(T)) < 1e-9 && g(T - 0.5) < 0 && valIs(p.a, T) === true) || '出会う時刻がちがう'; },
        };
      },
      // 追いつく（同じ向き）。時刻と位置
      s3(r) {
        const p = r.pick([1, 2]), c = r.int(1, 6), T = r.int(c + 1, c + 4), L = p * T * T - c * T;
        if (L <= 0 || T > 8) return null;
        return {
          q: `Aは位置0から速度 $v=${2 * p}t$ で、Bは位置 $${L}\\,\\mathrm{m}$ から速度 $${c}\\,\\mathrm{m/s}$ で、同じ向きに動く。AがBに追いつくのは □ 秒後で、位置 □ m`, a: `$${T}$、$${p * T * T}$`, key: `o${p}|${c}|${L}`,
          easy: `$${p === 1 ? '' : p}t^{2}=${L}+${c === 1 ? '' : c}t$ → $t=${T}$、位置 $${p * T * T}$`, easyCheck: false,
          verify: q => { const g = t => p * t * t - (L + c * t); return (Math.abs(g(T)) < 1e-9 && g(0.001) < 0 && valsAre(q.a, [T, L + c * T]) === true) || '追いつく時刻か位置がちがう'; },
        };
      },
      // わな：速度が同じになる時刻（位置ではない。微分して速度の式を等しく。5-10）
      trap(r) {
        const c = r.pick([2, 4, 6, 8]), L = r.int(3, 20);
        return dest({ q: `物体Aの位置が $x=t^{2}$、物体Bの位置が $x=${L}+${c}t$（m）のとき、2つの速度が同じになるのは □ 秒後`, a: `$${c / 2}$`, key: `t${c}${L}`, verify: p => valIs(p.a, c / 2) }, '5-60',
          '出会う時刻ではなく、速度が同じになる時刻。位置を微分して、速度の式どうしを等しくする（$2t=' + c + '$）', ['5-10']);
      },
    },
  });

  // ================================================================ 5-93
  // 量 V(t)=V0+∫rate を数でたどって、いちばん多い時刻と量
  function maxNum(rate, V0, t1) {
    let V = V0, best = V0, tb = 0; const n = 30000, h = t1 / n;
    for (let k = 0; k < n; k++) { const t = k * h; V += (rate(t) + 4 * rate(t + h / 2) + rate(t + h)) / 6 * h; if (V > best) { best = V; tb = t + h; } }
    return [tb, best];
  }
  // 答え「時刻、量」が、数でたどった いちばん多い所と合うか（時刻は、たどるきざみの分だけゆるく見る）
  const maxCheck = (ans, rate, V0, t1) => {
    const [tb, best] = maxNum(rate, V0, t1), n = nums(ans);
    return (n.length === 2 && Math.abs(n[0] - tb) < 2e-3 && Math.abs(n[1] - best) < 1e-6 * Math.max(1, Math.abs(best))) || `いちばん多いのは ${fmt(tb)} と ${fmt(best)}（答え ${ans}）`;
  };
  M.add({
    id: '5-93', part: 4, chap: '5-13 例題10', stars: 1,
    title: 'いちばん多くなるのは、ふえる速さ＝0 のとき',
    mark: '量の変わる速さ（$\\dfrac{\\dd V}{\\dd t}=30-6t$）と、はじめの量。「いちばん多く（高く）なる」時刻と量。',
    futsu: ['1分ごとの量を表にして、', 'ふえるのが止まる所をさがす。'],
    raku: ['$\\dfrac{\\dd V}{\\dd t}=30-6t=0$ より $t=5$', '$V=50+30t-3t^2$（はじめ $50\\,\\mathrm{L}$）', '$t=5$ で $50+150-75=125\\,\\mathrm{L}$'],
    why: '変わる速さが＋のあいだは量がふえ、－になるとへる。＋から－に変わる瞬間（速さ＝0）が、いちばん多い所（5-13 例題10。いちばん高い所で速度0なのと同じ）。そのときの量は、はじめの量＋変わる速さの積分（5-13⑤）。',
    caution: '時刻だけでなく、そのときの量も求める（はじめの量をたすのを忘れない）。時刻にかぎりがあって、そのあいだで速さが0にならないときは、はしの値をくらべる。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /いちばん(多|高)/.test(q) && /(\\d?frac\{\\dd [VhT]\}\{\\dd t\}|変わる速さ|毎分)/.test(q) && !/あいだで|投げ/.test(q); },
    steps: {
      s1(r) {
        const q = r.pick([2, 4, 6]), T = r.int(2, 6), p = q * T, V0 = r.pick([10, 20, 50, 100]), Vm = V0 + q * T * T / 2;
        return {
          q: `タンクの水の量 $V$ が $\\dfrac{\\dd V}{\\dd t}=${p}-${q}t$（L/min）で変わり、はじめは $${V0}\\,\\mathrm{L}$。いちばん多くなるのは □ 分後で、そのとき □ L`, a: `$${T}$、$${Vm}$`, key: `${p}|${q}|${V0}`,
          easy: `$${p}-${q}t=0$ より $t=${T}$。$V=${V0}+${p}t-${q / 2 === 1 ? '' : q / 2}t^{2}$ に入れて $${Vm}$`, easyCheck: false,
          verify: pp => maxCheck(pp.a, t => p - q * t, V0, 3 * T),
        };
      },
      // 水位・温度（小数の係数）
      s2(r) {
        const [what, s, u, au] = [['水位', 'h', 'cm/min', 'cm'], ['お湯の温度', 'T', '℃/min', '℃']][turn(r, '93s2', 2)];
        const q = D(r.pick([0.2, 0.4, 0.5, 1, 2])), T = r.pick([2, 4, 5, 10]), p = F.mul(q, fr(T)), V0 = r.pick([10, 20, 25, 30]);
        const Vm = F.add(fr(V0), F.mul(F.div(q, fr(2)), fr(T * T)));
        if (!decOK(p[1]) || !decOK(Vm[1])) return null;
        const rt = ptex([p, F.mul(q, fr(-1))], 't', { dec: true });
        return {
          q: `${what}が $\\dfrac{\\dd ${s}}{\\dd t}=${rt}$（${u}）で変わり、はじめは ${au === '℃' ? `${V0}℃` : `$${V0}\\,\\mathrm{cm}$`}。いちばん高くなるのは □ 分後で、そのとき □ ${au}`, a: `$${T}$、$${fx(Vm)}$`, key: `${s}${rt}|${V0}`,
          easy: `$${rt}=0$ より $t=${T}$。$${V0}+${BR(ptex(P.integ([p, F.mul(q, fr(-1))]), 't', { dec: true }), 0, T)}=${fx(Vm)}$`, easyCheck: false,
          verify: pp => maxCheck(pp.a, t => F.val(p) - F.val(q) * t, V0, 3 * T),
        };
      },
      // 入る量－出る量・曲がった速さ
      s3(r) {
        if (turn(r, '93s3', 2)) {
          const q = r.pick([2, 4]), T = r.int(3, 8), p = q * T, V0 = r.pick([20, 40, 60]), Vm = V0 + q * T * T / 2;
          return {
            q: `毎分 $${p}\\,\\mathrm{L}$ の水が入り、毎分 $${q}t\\,\\mathrm{L}$（$t$ は分）の水が出ていくタンク。はじめは $${V0}\\,\\mathrm{L}$。いちばん多くなるのは □ 分後で、そのとき □ L`, a: `$${T}$、$${Vm}$`, key: `${p}|${q}|${V0}`,   // ステップ1 と同じ key（同じ数の問題を同じ見開きに出さない）
            easy: `変わる速さは $${p}-${q}t$。$t=${T}$ で $${V0}+${p * T}-${q * T * T / 2}=${Vm}$`, easyCheck: false,
            verify: pp => maxCheck(pp.a, t => p - q * t, V0, 3 * T),
          };
        }
        const T = r.int(1, 3), c = r.pick([1, 1, 2]), V0 = r.pick([10, 20, 50]), Vm = V0 + 2 * c * T * T * T, a3 = 3 * c * T * T;   // 速さ 3c(T^2-t^2)
        return {
          q: `水の量 $V$ が $\\dfrac{\\dd V}{\\dd t}=${a3}-${3 * c}t^{2}$（L/min、$t\\geqq0$）で変わり、はじめは $${V0}\\,\\mathrm{L}$。いちばん多くなるのは □ 分後で、そのとき □ L`, a: `$${T}$、$${Vm}$`, key: `c${c}|${T}|${V0}`,
          easy: `$${a3}-${3 * c}t^{2}=0$ より $t=${T}$。$V=${V0}+${a3}t-${c === 1 ? '' : c}t^{3}$ に入れて $${Vm}$`, easyCheck: false,
          verify: pp => maxCheck(pp.a, t => a3 - 3 * c * t * t, V0, 3 * T),
        };
      },
      // わな：かぎられた時間のあいだ、ふえる速さがずっと＋（はしの値。5-25）
      trap(r) {
        const q = r.pick([2, 4, 6]), T = r.int(4, 8), p = q * T, V0 = r.pick([10, 20, 50]), R = r.int(2, T - 1), Vr = V0 + p * R - q * R * R / 2;
        return dest({ q: `タンクの水の量 $V$ が $\\dfrac{\\dd V}{\\dd t}=${p}-${q}t$（L/min）で変わり、はじめは $${V0}\\,\\mathrm{L}$。$0\\leqq t\\leqq${R}$ のあいだで、いちばん多い量 □ L`, a: `$${Vr}$`, key: `t${p}|${q}|${V0}|${R}`,
          verify: pp => valIs(pp.a, maxNum(t => p - q * t, V0, R)[1]) }, '5-93',
          `このあいだでは、ふえる速さ $${p}-${q}t$ がずっと＋なので、量はふえつづける。いちばん多いのは、おわりの $t=${R}$`, ['5-25']);
      },
    },
  });

  // ================================================================ 5-94
  // 投げ上げを数でたどる（a 一定）：t=T の速度と高さ
  const fly = (v0, x0, a, T) => [v0 + a * T, x0 + v0 * T + a * T * T / 2];
  M.add({
    id: '5-94', part: 4, chap: '5-13 例題11', stars: 1,
    title: 'さかのぼる：最高点で $v=0$ から $v_0$、最高点の高さから投げた高さ',
    mark: '「□秒後に、いちばん高い □ m の所に来た」から、はじめの速度と投げた高さ。$t=0$ でない時刻の値で $C_1$、$C_2$ を決める。',
    futsu: ['$v=-10t+C_1$、', '$x=-5t^2+C_1t+C_2$ に、', 'わかっている時刻の値を入れ、', '$C_1$、$C_2$ を順に解く。'],
    raku: ['2秒後にいちばん高い $25\\,\\mathrm{m}$（$a=-10$）', '$v_0=10\\times2=20\\,\\mathrm{m/s}$', '$x_0=25-5\\times2^2=5\\,\\mathrm{m}$'],
    why: 'いちばん高い所では速度が0（5-13 例題4）。速度は1秒に $10\\,\\mathrm{m/s}$ ずつへって $T$ 秒で0になったので、はじめは $10T$。$T$ 秒で上がった高さは、$v$-$t$ グラフの三角形 $\\frac{1}{2}\\times T\\times10T=5T^2$ なので、投げた高さは最高点から $5T^2$ をひいたもの。',
    caution: '投げた高さを0と決めつけない。$g=9.8$ なら、10 のかわりに 9.8、5 のかわりに 4.9。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '16mm',
    fits(q) { return /秒後に/.test(q) && /(はじめの速度|投げた高さ|はじめの速さ)/.test(q) && !/から上向きに/.test(q); },
    steps: {
      s1(r) {
        const T = r.pick([1, 1.5, 2, 2.5, 3, 4]), x0 = r.pick([0, 1, 1.5, 2, 5, 10]), v0 = 10 * T, H = x0 + 5 * T * T;
        return {
          q: `真上に投げたボールが、${T}秒後に、いちばん高い $${fmt(H)}\\,\\mathrm{m}$ の所に来た（$a=-10$）。はじめの速度 □ m/s、投げた高さ □ m`, a: `$${fmt(v0)}$、$${fmt(x0)}$`, key: `${T}|${H}`,
          easy: `$v_0=10\\times${T}=${fmt(v0)}$、$x_0=${fmt(H)}-5\\times${T}^{2}=${fmt(x0)}$`, easyCheck: false,
          verify: p => { const [u, w] = nums(p.a), [vT, xT] = fly(u, w, -10, T); return (Math.abs(vT) < 1e-9 && close(xT, H)) || `${T}秒後の速度 ${fmt(vT)}、高さ ${fmt(xT)}`; },
        };
      },
      // $g=9.8$
      s2(r) {
        const T = 1 + turn(r, '94s2', 3), x0 = r.pick([0, 1, 1.5, 2]), v0 = fmt(9.8 * T), H = fmt(x0 + 4.9 * T * T);
        return {
          q: `真上に投げたボールが、${T}秒後に、いちばん高い $${H}\\,\\mathrm{m}$ の所に来た（$g=9.8\\,\\mathrm{m/s^2}$）。はじめの速度 □ m/s、投げた高さ □ m`, a: `$${v0}$、$${fmt(x0)}$`, key: `g${T}|${H}`,
          easy: `$v_0=9.8\\times${T}=${v0}$、$x_0=${H}-4.9\\times${T}^{2}=${fmt(x0)}$`, easyCheck: false,
          verify: p => { const [u, w] = nums(p.a), [vT, xT] = fly(u, w, -9.8, T); return (Math.abs(vT) < 1e-9 && close(xT, +H)) || `${T}秒後の速度 ${fmt(vT)}、高さ ${fmt(xT)}`; },
        };
      },
      // ブレーキで止まった・最高点でない時刻の値
      s3(r) {
        if (turn(r, '94s3', 2)) {
          const b = r.pick([2, 4, 5]), T = r.pick([2, 3, 4, 5, 6]), v0 = b * T, d = b * T * T / 2;
          return {
            q: `車が、一定の加速度 $-${b}\\,\\mathrm{m/s^2}$ でブレーキをかけると、${T}秒後に止まった。はじめの速さ □ m/s、止まるまでの距離 □ m`, a: `$${v0}$、$${fmt(d)}$`, key: `b${b}|${T}`,
            easy: `$v_0=${b}\\times${T}=${v0}$、距離は $\\frac{1}{2}\\times${T}\\times${v0}=${fmt(d)}$`, easyCheck: false,
            verify: p => { const [u, w] = nums(p.a), [vT, xT] = fly(u, 0, -b, T); return (Math.abs(vT) < 1e-9 && close(xT, w)) || `${T}秒後の速度 ${fmt(vT)}、距離 ${fmt(xT)}`; },
          };
        }
        const T = r.pick([1, 2]), vT = r.pick([5, 10, 15]), x0 = r.pick([0, 1, 2, 5]), v0 = vT + 10 * T, H = x0 + v0 * T - 5 * T * T;
        return {
          q: `真上に投げたボールが、${T}秒後に、上向きに $${vT}\\,\\mathrm{m/s}$ で高さ $${H}\\,\\mathrm{m}$ の所を通った（$a=-10$）。はじめの速度 □ m/s、投げた高さ □ m`, a: `$${v0}$、$${x0}$`, key: `n${T}|${vT}|${H}`,
          easy: `$${vT}=v_0-10\\times${T}$ より $v_0=${v0}$、$${H}=x_0+${v0 * T}-${5 * T * T}$ より $x_0=${x0}$`, easyCheck: false,
          verify: p => { const [u, w] = nums(p.a), [vv, xx] = fly(u, w, -10, T); return (close(vv, vT) && close(xx, H)) || `${T}秒後の速度 ${fmt(vv)}、高さ ${fmt(xx)}`; },
        };
      },
      // わな：はじめの速度と高さがわかっている（さかのぼらない。v=0 の時刻を先に。5-17）
      trap(r) {
        const v0 = r.pick([10, 20, 30]), x0 = r.pick([0, 1, 2, 5]), T = v0 / 10, H = x0 + v0 * v0 / 20;
        return dest({ q: `${x0 === 0 ? '地面から' : `高さ $${x0}\\,\\mathrm{m}$ から`}、上向きに $${v0}\\,\\mathrm{m/s}$ でボールを投げた（$a=-10$、上向きが＋）。いちばん高くなるのは □ 秒後で、高さ □ m`, a: `$${T}$、$${H}$`, key: `t${v0}|${x0}`,
          verify: p => { const [u, w] = nums(p.a), [vv, xx] = fly(v0, x0, -10, u); return (Math.abs(vv) < 1e-9 && close(xx, w)) || 'いちばん高い所がちがう'; } }, '5-94',
          `はじめの速度と高さがわかっているので、さかのぼらない。$v=${v0}-10t=0$ の時刻を先に出す`, ['5-17']);
      },
    },
  });
})(globalThis.MONDAI);

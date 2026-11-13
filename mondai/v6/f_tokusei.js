/* 問題集 第6巻　第6部 特性方程式・共振・連立・まとめ（わざ 6-76〜6-90、6-97〜6-99）　組 f
 * 書き方は v6/README.md（第6・7巻の手引き）・v5/README.md・v4/README.md。文は教科書 第6巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書 6-12〜6-15 の数・ことば・記号にそろえる（$\omega_{\mathrm n}$・$\omega_{\mathrm d}$・$\zeta$・$x_{\mathrm p}$、ゆすりに合うゆれ、自分のゆれ、水そう）。
 * 単位は $0.5\,\mathrm{kg}$・$8\,\mathrm{N/m}$・$0.4\,\mathrm{N\cdot s/m}$・$10\,\mathrm{mH}$・$1\,\mathrm{\mu F}$・$20\,\mathrm{\Omega}$（O-7・P-14）。
 * 近似値は第39回の値（P-3：$2\pi=6.28$、$e^{-1}=0.368$、$e^{-2}=0.135$、$\ln2=0.693$、$\ln3=1.099$）と、問題ごとに文に書く √ の値（1問に2つまで。P-4）。
 *   文に書いた値で計算して丸めた答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4。agree()）。近似の答えは「約」と ≈。
 * 答えは e・ln・π・√ を残した形（微分方程式の解は式。P-7）。
 * 検算：微分方程式の解は calc（kind 'ode'）。ほかは verify(p) で、問題を作った式とは別の道すじ（運動方程式を数でたどる・
 *   振幅を ω を細かく変えて数でさがす・表を1行ずつ計算しなおす・式に数を入れてくらべる）で確かめる。
 * 図は 6-84 のステップ3だけ（共振曲線。M.graph。K-2）。目もりは山の ω を書かない（図を読んで答えを出さない）。
 * 表（p.table）は 6-87 のステップ3だけ（見わけようは表を出さないので、ステップ1・2 は文だけ）。
 * 左ページの「楽な形」と目印の例の数は、同じ見開きの問題に出さない（O-2）。key は、ステップがちがっても同じ問題（同じ式・同じはじめの状態）なら同じになる形にする。
 * わなは、そのわざ自身で解けないもの。答えにはかならず行き先（わざの番号か「楽な形なし」）を書く（dest。N-3）。
 * 6-15（まとめ）の「式の形から解き方を選ぶ」は、わざにせず、6-76 のわな（右辺あり・1回微分・積分するだけ・$v^2$）と見わけようの must で出す（P-13）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数と式の部品
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const fmt = v => String(+(+v).toFixed(10));                        // 0.30000000004 → 0.3
  const D = x => (Array.isArray(x) ? x : F.fromDec(String(x)));        // 0.5 → [1, 2]
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  const nums = a => (String(a).match(/\$[^$]*\$/g) || []).map(t => ev(strip(t).replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')));
  // 分数 f の、正確な小数（分母が 2 と 5 だけのとき）。そうでなければ null
  function dec(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1n;
    while (k < 15 && (BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) { k++; p *= 10n; }
    if ((BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) return null;
    const N = (BigInt(Math.abs(n)) * p / BigInt(d)).toString().padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  // 分数 f を小数第 k 位までに四捨五入した文字（文に書いた値で計算した答え）
  function roundStr(f, k) {
    const [n, d] = f, sg = n < 0 ? '-' : '', p = 10n ** BigInt(k);
    const N = ((2n * BigInt(Math.abs(n)) * p + BigInt(d)) / (2n * BigInt(d))).toString().padStart(k + 1, '0');
    const t = k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N;
    return (/[1-9]/.test(t) ? sg : '') + t;
  }
  // ほんとうの値（小数）を小数第 k 位までに丸めた文字
  const trueRd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  // 文の値で計算した答え f（分数）と、ほんとうの値 v を、小数第 k 位で丸めて同じなら、その文字（O-4）。ちがえば null
  const agree = (f, v, k) => { const a = roundStr(f, k); return a === trueRd(v, k) ? a : null; };
  const fx = f => (f[1] === 1 ? String(f[0]) : dec(f) || F.tex(f));   // 分数 → 整数・小数・\frac
  // 係数 c（分数か数）× 式 body：1 は書かない、小数で書けるなら小数、そうでなければ \frac{}{}
  function cf(c, body) {
    c = D(c); const [n, d] = c; if (n === 0) return '';
    const sg = n < 0 ? '-' : '', a = [Math.abs(n), d];
    if (!body) return sg + fx(a);
    if (a[0] === 1 && a[1] === 1) return sg + body;
    return sg + fx(a) + body;
  }
  const sum = ts => ts.filter(t => t && t !== '0').map((t, i) => (i && !/^-/.test(t) ? '+' : '') + t).join('') || '0';
  // e の右肩：s は負の分数（-2 → e^{-2t}、-1/2 → e^{-t/2}、-2/5 → e^{-0.4t}）。o.dec：分母があっても小数で（e^{-0.5t}）
  function ex(s, o) {
    s = D(s); o = o || {};
    const [n, d] = s, sg = n < 0 ? '-' : '', a = Math.abs(n);
    if (d === 1) return `e^{${sg}${a === 1 ? '' : a}t}`;
    if (a === 1 && !o.dec) return `e^{${sg}t/${d}}`;
    const dc = dec([a, d]);
    return dc ? `e^{${sg}${dc}t}` : `e^{${sg}${a}t/${d}}`;
  }
  const trig = (fn, w) => { const t = fx(D(w)); return `\\${fn}${t === '1' ? ' ' : t}t`; };   // \cos t・\cos3t・\sin0.5t
  // 2階の線形の式の TeX：a\ddot x+b\dot x+cx=右辺
  const ode = (a, b, c, rhs, v) => { v = v || 'x'; return `${sum([cf(a, `\\ddot ${v}`), cf(b, `\\dot ${v}`), cf(c, v)])}=${rhs || '0'}`; };
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const spring = (m, k, c) => `$m=${fmt(m)}\\,\\mathrm{kg}$、$k=${fmt(k)}\\,\\mathrm{N/m}$${c == null ? '' : `、$c=${fmt(c)}\\,\\mathrm{N\\cdot s/m}$`}`;
  // L（H）・C（F）・R（Ω）を、教科書の書き方の単位で
  function unitL(L) { if (L >= 1) return U(fmt(L), 'H'); if (L >= 1e-3 - 1e-15) return U(fmt(L * 1e3), 'mH'); return U(fmt(L * 1e6), '\\mu H'); }
  function unitC(C) { if (C >= 1e-8 - 1e-20) return U(fmt(C * 1e6), '\\mu F'); return U(fmt(C * 1e12), 'pF'); }
  const unitR = R => (R >= 1000 && R % 1000 === 0 ? U(fmt(R / 1000), 'k\\Omega') : U(fmt(R), '\\Omega'));
  const rlc = (L, C, R) => `$L=${strip(unitL(L))}$、$C=${strip(unitC(C))}$${R == null ? '' : `、$R=${strip(unitR(R))}$`}`;
  // √N を、外に出せる数を出した形に（92 → 2\sqrt{23}）。小数は 0.5 → \frac{\sqrt{2}}{2}
  function sqrtTeX(N) {
    if (Number.isInteger(N)) {
      let out = 1, inn = N;
      for (let f = 2; f * f <= inn; f++) while (inn % (f * f) === 0) { inn /= f * f; out *= f; }
      return inn === 1 ? String(out) : `${out === 1 ? '' : out}\\sqrt{${inn}}`;
    }
    return null;
  }
  const isSq = n => Number.isInteger(n) && n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;

  // ---------------------------------------------------------------- 検算の部品（問題を作った式とは別の道すじ）
  // m x'' + c x' + k x = f(t) を、ルンゲ・クッタ法でたどる。t の配列での x を返す
  function rk4(m, c, k, f, x0, v0, T, n) {
    n = n || 4000; const h = T / n; let x = x0, v = v0, t = 0; const xs = [x];
    const acc = (t, x, v) => (f(t) - c * v - k * x) / m;
    for (let i = 0; i < n; i++) {
      const k1x = v, k1v = acc(t, x, v);
      const k2x = v + h / 2 * k1v, k2v = acc(t + h / 2, x + h / 2 * k1x, v + h / 2 * k1v);
      const k3x = v + h / 2 * k2v, k3v = acc(t + h / 2, x + h / 2 * k2x, v + h / 2 * k2v);
      const k4x = v + h * k3v, k4v = acc(t + h, x + h * k3x, v + h * k3v);
      x += h / 6 * (k1x + 2 * k2x + 2 * k3x + k4x); v += h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v); t += h; xs.push(x);
    }
    return { xs, h };
  }
  // 振幅（ゆすりに合うゆれ）を ω の関数として、数でさがした山の ω と高さ
  function peakNum(m, k, c, F0, wmax) {
    const amp = w => F0 / Math.hypot(k - m * w * w, c * w);
    let best = 0, bw = 0; const N = 4000;
    for (let i = 0; i <= N; i++) { const w = wmax * i / N, a = amp(w); if (a > best) { best = a; bw = w; } }
    let lo = Math.max(0, bw - wmax / N), hi = bw + wmax / N;
    for (let j = 0; j < 80; j++) { const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3; if (amp(a) < amp(b)) lo = a; else hi = b; }
    const w = (lo + hi) / 2; return { w, a: amp(w) };
  }
  const valIs = (p, v, tol) => { const n = nums(p.a); return (n.length && near(n[0], v, tol || 1e-9)) || `答え ${p.a} が ${fmt(v)} でない`; };

  // ---------------------------------------------------------------- 見わけようの目印（fits）の部品
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(strip);
  // 項に分ける（{ } と ( ) の中の ＋ − では分けない）
  function terms(s) {
    const out = []; let d = 0, cur = '', sg = 1;
    s = s.replace(/\s+/g, ' ').trim();
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '{' || ch === '(') d++; else if (ch === '}' || ch === ')') d--;
      if (d === 0 && (ch === '+' || ch === '-') && cur.trim() !== '') { out.push([sg, cur.trim()]); cur = ''; sg = ch === '-' ? -1 : 1; continue; }
      if (d === 0 && (ch === '+' || ch === '-') && cur.trim() === '') { if (ch === '-') sg = -sg; continue; }
      cur += ch;
    }
    if (cur.trim() !== '') out.push([sg, cur.trim()]);
    return out;
  }
  const num1 = t => (t === '' ? 1 : ev(t));
  // 2階の線形の式：{ a, b, c, rest:[[符号, 項]], v }（左辺へ移した係数）。2階の式でなければ null
  function lin2(q) {
    const seg = maths(q).find(t => /\\ddot [a-z]/.test(t) && t.includes('='));
    if (!seg) return null;
    const v = /\\ddot ([a-z])/.exec(seg)[1], k = seg.indexOf('=');
    const o = { a: 0, b: 0, c: 0, rest: [], v };
    [[seg.slice(0, k), 1], [seg.slice(k + 1), -1]].forEach(([side, sgn]) => {
      for (const [sg, t] of terms(side)) {
        let m;
        if ((m = new RegExp(`^([\\d.]*)\\\\ddot ${v}$`).exec(t))) o.a += sgn * sg * num1(m[1]);
        else if ((m = new RegExp(`^([\\d.]*)\\\\dot ${v}$`).exec(t))) o.b += sgn * sg * num1(m[1]);
        else if ((m = new RegExp(`^([\\d.]*)${v}$`).exec(t))) o.c += sgn * sg * num1(m[1]);
        else if (t !== '0') o.rest.push([-sgn * sg, t]);
      }
    });
    return [o.a, o.b, o.c].some(x => x == null || !isFinite(x)) ? null : o;
  }
  // 右辺の F\cos ωt（1つだけ）
  function cosRhs(o) {
    if (!o || o.rest.length !== 1) return null;
    const m = /^([\d.]*)\\cos\s*([\d.]*)t$/.exec(o.rest[0][1]);
    return m ? { F: o.rest[0][0] * num1(m[1]), w: num1(m[2]) } : null;
  }
  // 文の中のばね・質量・ダンパー（m、k、c）
  function springOf(q) {
    const g = re => { const m = re.exec(q); return m ? +m[1] : null; };
    const m = g(/m=([\d.]+)\\,\\mathrm\{kg\}/), k = g(/k=([\d.]+)\\,\\mathrm\{N\/m\}/), c = g(/c=([\d.]+)\\,\\mathrm\{N\\cdot s\/m\}/);
    return m != null && k != null ? { m, k, c } : null;
  }
  // 文の中の RLC（H・F・Ω に直した値）
  function rlcOf(q) {
    const g = (re, unit) => { const m = re.exec(q); if (!m) return null; return +m[1] * (unit[m[2] || ''] || 1); };
    const L = g(/L=([\d.]+)\\,\\mathrm\{(m|\\mu )?H\}/, { m: 1e-3, '\\mu ': 1e-6 }), C = g(/C=([\d.]+)\\,\\mathrm\{(\\mu |p)?F\}/, { '\\mu ': 1e-6, p: 1e-12 }), R = g(/R=([\d.]+)\\,\\mathrm\{(k)?\\Omega\}/, { k: 1e3 });
    return L != null && C != null ? { L, C, R } : null;
  }
  // 判別式の符号（-1・0・1）。ばね・式のどちらからでも
  const sgnD = (a, b, c) => { const D0 = b * b - 4 * a * c; return Math.abs(D0) < 1e-9 * Math.max(1, b * b) ? 0 : Math.sign(D0); };
  function homoD(q) {   // 右辺が0の2階の式（またはダンパーつきのばね）の判別式の符号。なければ null
    const o = lin2(q);
    if (o) return o.rest.length ? null : sgnD(o.a, o.b, o.c);
    const s = springOf(q);
    if (s && s.c != null) return sgnD(s.m, s.c, s.k);
    return null;
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。楽な形なし）」を書く。extra：ほかの部のわざ・fits では見つからないわざの番号
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(6).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 6 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : '楽な形なし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- 解の形の問題（6-77〜6-79 と、ほかのわざのわなで使う）
  // 解が2つ（-p、-q）：x0・v0 から A・B（分数）
  function twoRoots(p, q, x0, v0) {
    const X0 = D(x0), V0 = D(v0), A = F.div(F.add(V0, F.mul(fr(q), X0)), fr(q - p)), B = F.sub(X0, A);
    return { A, B, ans: sum([cf(A, ex(-p)), cf(B, ex(-q))]) };
  }
  // 重解（-a。a は分数でもよい）：A=x0、B=v0+a x0
  function dblRoot(a, x0, v0) {
    const A = D(x0), B = F.add(D(v0), F.mul(D(a), A));
    const E = ex(F.mul(D(a), fr(-1)));
    if (A[0] === 0) return { A, B, ans: cf(B, 't' + E) };
    if (B[0] === 0) return { A, B, ans: cf(A, E) };
    return { A, B, ans: `(${sum([cf(A, ''), cf(B, 't')])})${E}` };
  }
  // 複素数の解（-α±jω）：A=x0、B=(v0+αx0)/ω
  function cpxRoot(al, w, x0, v0) {
    const A = D(x0), B = F.div(F.add(D(v0), F.mul(fr(al), A)), fr(w));
    if (A[0] === 0) return { A, B, ans: cf(B, ex(-al) + trig('sin', w)) };
    if (B[0] === 0) return { A, B, ans: cf(A, ex(-al) + trig('cos', w)) };
    const big = [A, B].some(z => z[1] !== 1 && !dec(z)), inner = sum([cf(A, trig('cos', w)), cf(B, trig('sin', w))]);
    return { A, B, ans: big ? `${ex(-al)}\\Bigl(${inner}\\Bigr)` : `${ex(-al)}(${inner})` };
  }
  const odeCalc = (a, b, c, x0, v0, rhs) => ({ kind: 'ode', x: 't', coef: [a, b, c].map(z => F.val(D(z))), rhs: rhs || '0', init: [[0, F.val(D(x0))], [0, F.val(D(v0)), 1]] });
  // 解が2つの問題（モニックの式）
  function genTwo(r, opt) {
    opt = opt || {};
    for (let k = 0; k < 40; k++) {
      const p = r.int(1, 5), q = r.int(p + 1, 6);
      const x0 = opt.x0 != null ? opt.x0 : r.pick([1, 2, 3, 4]), v0 = opt.v0 != null ? opt.v0 : 0;
      const s = twoRoots(p, q, x0, v0);
      if (!dec(s.A) || !dec(s.B) || s.A[0] === 0 || s.B[0] === 0) continue;
      if (opt.bad && opt.bad(p, q, x0, v0)) continue;
      return { p, q, x0, v0, s, eq: ode(1, p + q, p * q), calc: odeCalc(1, p + q, p * q, x0, v0) };
    }
    return null;
  }
  function genDbl(r, opt) {
    opt = opt || {};
    for (let k = 0; k < 40; k++) {
      const a = r.int(1, 6), x0 = opt.x0 != null ? opt.x0 : r.pick([1, 2, 3, 0.5]), v0 = opt.v0 != null ? opt.v0 : 0;
      if (opt.bad && opt.bad(a, x0, v0)) continue;
      return { a, x0, v0, s: dblRoot(a, x0, v0), eq: ode(1, 2 * a, a * a), calc: odeCalc(1, 2 * a, a * a, x0, v0) };
    }
    return null;
  }
  function genCpx(r, opt) {
    opt = opt || {};
    for (let k = 0; k < 40; k++) {
      const al = r.int(1, 4), w = r.int(1, 5), x0 = opt.x0 != null ? opt.x0 : r.pick([1, 2, 3]), v0 = opt.v0 != null ? opt.v0 : 0;
      if (opt.bad && opt.bad(al, w, x0, v0)) continue;
      return { al, w, x0, v0, s: cpxRoot(al, w, x0, v0), eq: ode(1, 2 * al, al * al + w * w), calc: odeCalc(1, 2 * al, al * al + w * w, x0, v0) };
    }
    return null;
  }
  const initTxt = (x0, v0, v) => { v = v || 'x'; return `$${v}(0)=${fx(D(x0))}$、$\\dot ${v}(0)=${fx(D(v0))}$`; };
  const solveQ = (eq, x0, v0) => `$${eq}$、${initTxt(x0, v0)} をみたす $x$`;

  // 動き方の3つのことば
  const nk = (a, b, c) => `${fmt(b / a)},${fmt(c / a)}`;   // 式を最高次の係数でわった形（同じ式を、ステップがちがっても同じ key に。O-2）
  const MOVE = ['ゆっくりもどる', 'ちょうど', 'ゆれながら止まる'];
  const CHOICE = '（ゆっくりもどる・ちょうど・ゆれながら止まる）';
  const moveOf = sd => (sd > 0 ? MOVE[0] : sd === 0 ? MOVE[1] : MOVE[2]);
  // 動き方の確かめ：特性方程式の左辺の、いちばん小さい値（頂点の値）の符号で（負なら解が2つ、0なら重解、正なら複素数）
  function moveCheck(p, a, b, c) {
    const vMin = c - b * b / (4 * a), sd = Math.abs(vMin) < 1e-9 * Math.max(1, Math.abs(c)) ? 0 : (vMin < 0 ? 1 : -1);
    return p.a === moveOf(sd) || `動き方は ${moveOf(sd)} のはず`;
  }

  // ================================================================ 6-76
  // わな（6-15 の「式の形から解き方を選ぶ」。P-13）：右辺あり → 6-81、1回微分で部屋の温度 → 6-18、右辺が t だけ → 6-14、v^2 → 6-28
  const VT = [[0.2, 7], [0.05, 14], [0.098, 10], [0.0245, 20], [0.008, 35], [0.002, 70]];
  function trap76(r) {
    const k = turn(r, '76t', 4);
    if (k === 0) {
      const n = r.pick([2, 3, 4, 5, 6]), P = r.pick([1, 2]), Fv = P * (n * n - 1);
      if ((n === 3 && Fv === 8) || (n === 5 && Fv === 24)) return null;   // 6-81 の楽な形の例
      const rhs = `${Fv}\\cos t`;
      return dest({ q: solveQ(ode(1, 0, n * n, rhs), 0, 0), a: `$${sum([cf(P, '\\cos t'), cf(-P, trig('cos', n))])}$`, key: `t81${n},${P}`, boxw: '40mm', calc: odeCalc(1, 0, n * n, 0, 0, rhs) }, '6-76',
        `右辺に $${rhs}$（ゆする力）がある。特性方程式だけでは決まらず、ゆすりに合うゆれ $P\\cos t$ を足す`, ['6-81']);
    }
    if (k === 1) {
      const kk = r.pick(['0.1', '0.2', '0.04', '0.5']), Ta = r.pick([20, 25, 15]), T0 = Ta + r.pick([40, 50, 60]);
      return dest({ q: `$\\frac{\\dd T}{\\dd t}=-${kk}(T-${Ta})$、$T(0)=${T0}$ をみたす $T$`, a: `$${Ta}+${T0 - Ta}${ex(F.mul(D(kk), fr(-1)), { dec: true })}$`, key: `t18${kk},${Ta},${T0}`, boxw: '30mm',
        calc: { kind: 'ode', x: 't', coef: [1, +kk], rhs: String(+kk * Ta), init: [[0, T0]] } }, '6-76',
        '1回微分の式で、右辺は「部屋の温度との差」の数倍。2回微分の特性方程式ではなく、目標へ近づく形（差が $e^{-kt}$ でへる）', ['6-18']);
    }
    if (k === 2) {
      const a = r.pick([3, 6, 12]), b = r.pick([2, 4, -1]), y0 = r.pick([1, 2, 5]), A = a / 3;
      return dest({ q: `$\\frac{\\dd y}{\\dd t}=${a}t^2${b > 0 ? '+' : ''}${b}$、$y(0)=${y0}$ をみたす $y$`, a: `$${sum([cf(A, 't^3'), cf(b, 't'), String(y0)])}$`, key: `t14${a},${b},${y0}`, boxw: '30mm',
        calc: { kind: 'ode', x: 't', coef: [1, 0], rhs: `${a}t^2${b > 0 ? '+' : ''}${b}`, init: [[0, y0]] } }, '6-76',
        '右辺に $y$ がない（$t$ と数だけ）。特性方程式はいらず、積分して、はじめの値をたすだけ', ['6-14']);
    }
    const [c, vt] = r.pick(VT);
    return dest({ q: `$\\frac{\\dd v}{\\dd t}=9.8-${fmt(c)}v^2$（下向きが正）で、速さが近づく値（終端速度）$v_{\\mathrm t}=□\\,\\mathrm{m/s}$`, a: `$${vt}$`, key: `t28${c}`, boxw: '14mm',
      verify: p => { const v = nums(p.a)[0]; return (near(9.8 - c * v * v, 0, 1e-9) && v > 0) || '右辺が0にならない'; } }, '6-76',
      '$v^2$ があるので線形でない（特性方程式は使えない）。右辺＝0 とおいて終端速度', ['6-28']);
  }
  M.add({
    id: '6-76', part: 6, chap: '6-12②⑥ 問題1', stars: 1,
    title: '特性方程式は $\\ddot x\\to s^2$、$\\dot x\\to s$、$x\\to1$。判別式の符号で動き方がわかる',
    mark: '$m\\ddot x+c\\dot x+kx=0$ の形と「特性方程式」「動き方（ゆっくりもどる・ちょうど・ゆれながら止まる）」。',
    futsu: ['$x=e^{st}$ を式に入れ、$\\dot x=se^{st}$、', '$\\ddot x=s^2e^{st}$ を代入してから、', '$e^{st}$ でわって $s$ の式を作る'],
    raku: ['$2\\ddot x+4\\dot x+10x=0$', '→ $2s^2+4s+10=0$（そのまま置きかえる）', '$D=4^2-4\\times2\\times10=-64<0$', '→ ゆれながら止まる'],
    why: '$x=e^{st}$ を入れると、微分するたびに $s$ が前に出るので、$\\ddot x=s^2e^{st}$、$\\dot x=se^{st}$。$e^{st}$ は0にならないのでわれて、$\\ddot x\\to s^2$、$\\dot x\\to s$、$x\\to1$ と置きかえた式が残る（6-12②）。判別式 $D=c^2-4mk$ が正なら解が2つ（ゆっくりもどる）、0なら重解（ちょうど）、負なら複素数の解で $\\sin$・$\\cos$ が出る（ゆれながら止まる。6-12⑥）。',
    caution: '$\\dot x$ の項の $s$ を落とさない（$s^2+3+2=0$ は×）。$x$ の項には $s$ がつかない。判別式は $D=c^2-4mk$（$\\ddot x$ の係数も入れる）。右辺が0でない式・1回微分の式・$v^2$ がある式は、この形ではない。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '30mm', s2: '30mm', s3: '30mm', trap: '30mm' },
    fits(q) {
      if (!/特性方程式は|動き方/.test(q) || /ゆす/.test(q)) return false;
      if (homoD(q) != null) return true;
      const e = rlcOf(q); return !!(e && e.R != null);
    },
    steps: {
      // 特性方程式を作る（係数が1でない式・$\dot x$ の項がない式もまぜる）
      s1(r) {
        const a = r.pick([1, 1, 2, 3]), b = r.chance(0.15) ? 0 : r.int(1, 10), c = r.int(1, 30);
        if ((a === 2 && b === 4 && c === 10) || (a === 1 && b === 7 && c === 12)) return null;   // 楽な形・目印の例（O-2）
        const g = F.gcd(F.gcd(a, b), c); if (g > 1 && a > 1) return null;
        return { q: `$${ode(a, b, c)}$ の特性方程式は □`, a: `$${sum([cf(a, 's^2'), cf(b, 's'), cf(c, '')])}=0$`, key: nk(a, b, c), easyCheck: false,
          easy: `$\\ddot x\\to s^2$、$\\dot x\\to s$、$x\\to1$`,
          verify: p => { const L = strip(p.a).replace(/=0$/, ''); return [0.37, 1.3, -2.1].every(s => near(ev(L, { s }), a * s * s + b * s + c)) || '特性方程式の係数がちがう'; } };
      },
      // 動き方（3つの場合を順に）
      s2(r) {
        const kind = turn(r, '76s2', 3), a = r.pick([1, 1, 2]);
        let b, c;
        if (kind === 0) { const p = r.int(1, 5), q = r.int(p + 1, 7); b = a * (p + q); c = a * p * q; }
        else if (kind === 1) { const p = r.int(1, 7); b = 2 * a * p; c = a * p * p; }
        else { b = r.int(1, 8); c = r.int(Math.floor(b * b / (4 * a)) + 1, Math.floor(b * b / (4 * a)) + 25); }
        if ((a === 2 && b === 4 && c === 10) || (a === 1 && b === 7 && c === 12)) return null;
        const D0 = b * b - 4 * a * c;
        return { q: `$${ode(a, b, c)}$ の動き方${CHOICE}`, a: moveOf(Math.sign(D0)), key: nk(a, b, c), easyCheck: false,
          easy: `$${sum([cf(a, 's^2'), cf(b, 's'), cf(c, '')])}=0$、$D=${b}^2-4\\times${a}\\times${c}=${D0}$`, verify: p => moveCheck(p, a, b, c) };
      },
      // 見かけがちがう：移項した形・ばね・質量・ダンパー・RLC 回路（電荷 q）
      s3(r) {
        const kind = turn(r, '76s3', 3);
        if (kind === 0) {
          const D0 = r.int(0, 2); let b, c;
          if (D0 === 0) { const p = r.int(1, 5), q = r.int(p + 1, 7); b = p + q; c = p * q; }
          else if (D0 === 1) { const p = r.int(1, 7); b = 2 * p; c = p * p; }
          else { b = r.int(1, 8); c = r.int(Math.floor(b * b / 4) + 1, Math.floor(b * b / 4) + 25); }
          if (b === 7 && c === 12) return null;
          return { q: `$\\ddot x=${sum([cf(-b, '\\dot x'), cf(-c, 'x')])}$ の動き方${CHOICE}`, a: moveOf(Math.sign(b * b - 4 * c)), key: nk(1, b, c), easyCheck: false,
            easy: `移項して $${ode(1, b, c)}$。$D=${b * b - 4 * c}$`, verify: p => moveCheck(p, 1, b, c) };
        }
        if (kind === 1) {
          const m = r.pick([1, 2, 0.5, 4]), w = r.pick([2, 3, 4, 5, 10]), k = m * w * w, cc = 2 * m * w, c = cc * r.pick([0.2, 0.5, 1, 1, 2, 2.5]);
          return { q: `ばね・質量・ダンパー（${spring(m, k, c)}）の動き方${CHOICE}`, a: moveOf(Math.sign(c * c - 4 * m * k)), key: nk(m, c, k), easyCheck: false,
            easy: `$${ode(m, c, k)}$。$D=${fmt(c)}^2-4\\times${fmt(m)}\\times${fmt(k)}=${fmt(c * c - 4 * m * k)}$`, verify: p => moveCheck(p, m, c, k) };
        }
        const [L, C, Rc] = r.pick([[0.01, 1e-6, 200], [0.004, 1e-7, 400], [0.02, 5e-7, 400], [0.001, 1e-7, 200], [0.04, 1e-6, 400]]), R = Rc * r.pick([0.1, 0.5, 1, 2, 5]);
        const D0 = R * R - 4 * L / C;
        return { q: `RLC 回路（${rlc(L, C, R)}）の電荷 $q$ の動き方${CHOICE}`, a: moveOf(Math.abs(D0) < 1e-6 ? 0 : Math.sign(D0)), key: nk(L, R, 1 / C), easyCheck: false,
          easy: `$Ls^2+Rs+\\frac1C=0$。$D=R^2-\\frac{4L}{C}=${fmt(R * R)}-${fmt(4 * L / C)}$`, verify: p => moveCheck(p, L, R, 1 / C) };
      },
      trap: trap76,
    },
  });

  // ================================================================ 6-77
  M.add({
    id: '6-77', part: 6, chap: '6-12③ 例題1', stars: 1,
    title: '解が2つ：$x=Ae^{s_1t}+Be^{s_2t}$、$A+B=x_0$、$s_1A+s_2B=v_0$（加減法で1回）',
    mark: '特性方程式の解が2つの負の実数と、はじめの位置・速度。$\\ddot x+5\\dot x+6x=0$、$x(0)=1$、$\\dot x(0)=0$。',
    futsu: ['$x=Ae^{-2t}+Be^{-3t}$ を微分して', '速度の式 $\\dot x=-2Ae^{-2t}-3Be^{-3t}$ を作り、', '位置の式と速度の式に $t=0$ を入れる'],
    raku: ['$s^2+5s+6=0$ → $s=-2$、$-3$', '$A+B=1$、$-2A-3B=0$（$e^0=1$）', '$A=3$、$B=-2$ → $x=3e^{-2t}-2e^{-3t}$'],
    why: '$t=0$ では $e^{s_1t}=e^{s_2t}=1$ なので、位置は $A+B$。微分すると $e^{st}$ の前に $s$ が出るので、はじめの速度は $s_1A+s_2B$（6-12③）。この2つの式を、加減法（3-6）で1回解けばよい。',
    caution: 'はじめの速度の式で、$s$ をかけ忘れない（$A+B=x_0$ と $A+B=v_0$ にしない）。答えは、$t=0$ を入れて $x_0$ になるかで確かめる。重解のときは、この形では数が足りない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: 1, boxw: '46mm',
    fits(q) {
      if (/特性方程式は|動き方|ゆす|周期|omega_\{\\mathrm d\}|ゆれずに/.test(q)) return false;
      return homoD(q) === 1 && /x\(0\)|静かに/.test(q);
    },
    steps: {
      // 静かにはなす（$\dot x(0)=0$）
      s1(r) {
        const g = genTwo(r, { bad: (p, q, x0) => p === 2 && q === 3 && x0 === 1 }); if (!g) return null;
        return { q: solveQ(g.eq, g.x0, 0), a: `$${g.s.ans}$`, key: `${g.p},${g.q}|${g.x0},0`, easyCheck: false,
          easy: `$s=-${g.p}$、$-${g.q}$。$A+B=${g.x0}$、$-${g.p === 1 ? '' : g.p}A-${g.q}B=0$`, calc: g.calc };
      },
      // はじめの速度がある・係数が1でない
      s2(r) {
        const kind = turn(r, '77s2', 2);
        const x0 = kind === 0 ? 0 : r.pick([1, 2]), v0 = r.pick([2, 3, 4, 6, -2, -3, 1]);
        const g = genTwo(r, { x0, v0 }); if (!g) return null;
        const a = r.chance(0.4) ? r.pick([2, 3]) : 1, eq = ode(a, a * (g.p + g.q), a * g.p * g.q);
        return { q: solveQ(eq, x0, v0), a: `$${g.s.ans}$`, key: `${g.p},${g.q}|${x0},${v0}`, easyCheck: false,
          easy: `$s=-${g.p}$、$-${g.q}$。$A+B=${x0}$、$-${g.p === 1 ? '' : g.p}A-${g.q}B=${v0}$`, calc: odeCalc(a, a * (g.p + g.q), a * g.p * g.q, x0, v0) };
      },
      // 見かけがちがう：移項した形・ばね・質量・ダンパー（引いて静かにはなす）
      s3(r) {
        if (turn(r, '77s3', 2) === 0) {
          const g = genTwo(r, { bad: (p, q, x0) => p === 2 && q === 3 && x0 === 1 }); if (!g) return null;
          return { q: `$\\ddot x=${sum([cf(-(g.p + g.q), '\\dot x'), cf(-g.p * g.q, 'x')])}$、${initTxt(g.x0, 0)} をみたす $x$`, a: `$${g.s.ans}$`, key: `${g.p},${g.q}|${g.x0},0`, easyCheck: false,
            easy: `移項して $${g.eq}$。$s=-${g.p}$、$-${g.q}$`, calc: g.calc };
        }
        const m = r.pick([1, 2, 0.5]), x0 = r.pick(['0.1', '0.2']);
        const g = genTwo(r, { x0 }); if (!g) return null;
        const c = m * (g.p + g.q), k = m * g.p * g.q;
        return { q: `ばね・質量・ダンパー（${spring(m, k, c)}）のおもりを $${x0}\\,\\mathrm{m}$ 引いて、静かにはなした。位置 $x$（m）`, a: `$${g.s.ans}$`, key: `${g.p},${g.q}|${x0},0`, easyCheck: false,
          easy: `$${ode(m, c, k)}$、$s=-${g.p}$、$-${g.q}$。$A+B=${x0}$`, calc: odeCalc(m, c, k, x0, 0) };
      },
      // わな：重解（6-79）
      trap(r) {
        const g = genDbl(r, { bad: (a, x0) => a === 3 && x0 === 1 }); if (!g) return null;
        return dest({ q: solveQ(g.eq, g.x0, 0), a: `$${g.s.ans}$`, key: `d${g.a},${g.x0}`, calc: g.calc }, '6-77',
          `特性方程式は $(s+${g.a})^2=0$ で、解は1つ（重解）。$A${ex(-g.a)}+B${ex(-g.a)}$ では数が足りない`, ['6-79']);
      },
    },
  });

  // ================================================================ 6-78
  M.add({
    id: '6-78', part: 6, chap: '6-12④ 例題2', stars: 1,
    title: '複素数の解 $-\\alpha\\pm j\\omega_{\\mathrm d}$：$A=x_0$、$B=\\tfrac{v_0+\\alpha x_0}{\\omega_{\\mathrm d}}$',
    mark: '判別式が負の特性方程式と、はじめの位置・速度。$\\ddot x+2\\dot x+10x=0$、$x(0)=1$、$\\dot x(0)=0$。',
    futsu: ['$x=e^{-t}(A\\cos3t+B\\sin3t)$ を積の微分で微分し、', '$\\dot x=-e^{-t}(\\cdots)$', '$\\quad+e^{-t}(-3A\\sin3t+3B\\cos3t)$', 'に $t=0$ を入れて、$-A+3B=0$ を解く'],
    raku: ['$s^2+2s+10=0$ → $s=-1\\pm3j$', '$A=x_0=1$、$B=\\dfrac{0+1\\times1}{3}=\\dfrac13$', '$x=e^{-t}\\Bigl(\\cos3t+\\dfrac13\\sin3t\\Bigr)$'],
    why: '$t=0$ では $e^0=1$、$\\cos0=1$、$\\sin0=0$ なので、位置は $A$。積の微分で、はじめの速度は $-\\alpha A+\\omega_{\\mathrm d}B$（$e^{-\\alpha t}$ の微分から $-\\alpha A$、$\\sin$ の微分から $\\omega_{\\mathrm d}B$）。これが $v_0$ なので $B=\\dfrac{v_0+\\alpha x_0}{\\omega_{\\mathrm d}}$（6-12④）。',
    caution: '$e^{-\\alpha t}$ の微分を忘れると $B=\\dfrac{v_0}{\\omega_{\\mathrm d}}$ になる（静かにはなしたのに $B=0$ とまちがえる）。答えに $j$ を残さない。$\\omega_{\\mathrm d}$ は解の虚部で、$\\omega_{\\mathrm n}$ ではない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: '50mm', boxh: '11mm',
    fits(q) {
      if (/特性方程式は|動き方|ゆす|周期|omega_\{\\mathrm d\}|ゆれずに/.test(q)) return false;
      return homoD(q) === -1 && /x\(0\)|静かに/.test(q);
    },
    steps: {
      s1(r) {
        const g = genCpx(r, { bad: (al, w, x0) => al === 1 && w === 3 && x0 === 1 }); if (!g) return null;
        return { q: solveQ(g.eq, g.x0, 0), a: `$${g.s.ans}$`, key: `${g.al},${g.w}|${g.x0},0`, easyCheck: false,
          easy: `$s=-${g.al}\\pm ${g.w === 1 ? '' : g.w}j$。$A=${g.x0}$、$B=\\frac{0+${g.al}\\times${g.x0}}{${g.w}}$`, calc: g.calc };
      },
      // はじめの速度がある（たたいて動かす）・係数が1でない
      s2(r) {
        const x0 = turn(r, '78s2', 2) === 0 ? 0 : r.pick([1, 2]), v0 = r.pick([2, 3, 4, 6, -2, 1]);
        const g = genCpx(r, { x0, v0 }); if (!g) return null;
        const a = r.chance(0.35) ? 2 : 1, A0 = g.al * g.al + g.w * g.w;
        return { q: solveQ(ode(a, a * 2 * g.al, a * A0), x0, v0), a: `$${g.s.ans}$`, key: `${g.al},${g.w}|${x0},${v0}`, easyCheck: false,
          easy: `$s=-${g.al}\\pm ${g.w === 1 ? '' : g.w}j$。$A=${x0}$、$B=\\frac{${v0}+${g.al}\\times${x0}}{${g.w}}$`, calc: odeCalc(a, a * 2 * g.al, a * A0, x0, v0) };
      },
      // 見かけがちがう：ばね・質量・ダンパー・移項した形
      s3(r) {
        if (turn(r, '78s3', 2) === 0) {
          const g = genCpx(r, { bad: (al, w, x0) => al === 1 && w === 3 && x0 === 1 }); if (!g) return null;
          const A0 = g.al * g.al + g.w * g.w;
          return { q: `$\\ddot x=${sum([cf(-2 * g.al, '\\dot x'), cf(-A0, 'x')])}$、${initTxt(g.x0, 0)} をみたす $x$`, a: `$${g.s.ans}$`, key: `${g.al},${g.w}|${g.x0},0`, easyCheck: false,
            easy: `移項して $${g.eq}$。$s=-${g.al}\\pm ${g.w === 1 ? '' : g.w}j$`, calc: g.calc };
        }
        const m = r.pick([1, 2, 0.5]), x0 = r.pick(['0.1', '0.2']);
        const g = genCpx(r, { x0 }); if (!g) return null;
        const c = m * 2 * g.al, k = m * (g.al * g.al + g.w * g.w);
        return { q: `ばね・質量・ダンパー（${spring(m, k, c)}）のおもりを $${x0}\\,\\mathrm{m}$ 引いて、静かにはなした。位置 $x$（m）`, a: `$${g.s.ans}$`, key: `${g.al},${g.w}|${x0},0`, easyCheck: false,
          easy: `$${ode(m, c, k)}$、$s=-${g.al}\\pm ${g.w === 1 ? '' : g.w}j$`, calc: odeCalc(m, c, k, x0, 0) };
      },
      // わな：解が2つ（6-77）
      trap(r) {
        const g = genTwo(r, { bad: (p, q, x0) => p === 2 && q === 3 && x0 === 1 }); if (!g) return null;
        return dest({ q: solveQ(g.eq, g.x0, 0), a: `$${g.s.ans}$`, key: `t${g.p},${g.q},${g.x0}`, calc: g.calc }, '6-78',
          `判別式 $${g.p + g.q}^2-4\\times${g.p * g.q}>0$ で、解は2つの負の数 $-${g.p}$、$-${g.q}$。$\\cos$・$\\sin$ は出ない`, ['6-77']);
      },
    },
  });

  // ================================================================ 6-79
  // RLC の放電（境めの抵抗）：q=q0(1+bt)e^{-bt}。t がとても小さいので、自分の物さしで確かめる
  function rlcDbl(L, C, V) {
    const R = 2 * Math.sqrt(L / C), b = R / (2 * L), q0 = C * V;
    return { R, b, q0 };
  }
  const pow10 = v => { const e = Math.floor(Math.log10(v) + 1e-9), m = v / 10 ** e; return near(m, 1) ? `10^{${e}}` : `${fmt(m)}\\times10^{${e}}`; };
  M.add({
    id: '6-79', part: 6, chap: '6-12⑤⑦ 例題3・5', stars: 1,
    title: '重解：$x=(A+Bt)e^{st}$、$A=x_0$、$B=v_0-sx_0$（$c=2\\sqrt{mk}$ では $s=-\\omega_{\\mathrm n}$）',
    mark: '特性方程式が $(s+a)^2=0$、「ゆれずにいちばん早くもどる」。$\\ddot x+6\\dot x+9x=0$、$x(0)=1$、$\\dot x(0)=0$。',
    futsu: ['$x=(A+Bt)e^{-3t}$ を積の微分で微分して', '$\\dot x=Be^{-3t}-3(A+Bt)e^{-3t}$', 'に $t=0$ を入れ、$B-3A=0$ を解く'],
    raku: ['$(s+3)^2=0$ → $s=-3$（重解）', '$A=1$、$B=0-(-3)\\times1=3$', '$x=(1+3t)e^{-3t}$'],
    why: '$t=0$ で位置は $A$。$(A+Bt)e^{st}$ を積の微分で微分すると $Be^{st}+s(A+Bt)e^{st}$ で、$t=0$ では $B+sA$。これが $v_0$ なので $B=v_0-sA$（6-12⑤）。ちょうどよいダンパー $c=2\\sqrt{mk}$ では判別式が0になり、重解 $s=-\\dfrac{c}{2m}=-\\omega_{\\mathrm n}$（6-12⑦）。',
    caution: '重解で $Ae^{st}+Be^{st}$ と書かない（数が1つしかなく、はじめの速度に合わせられない）。$s$ は負なので、$B=v_0-sx_0$ は $v_0$ に $\\lvert s\\rvert x_0$ をたした数。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: 1, boxw: '42mm',
    fits(q) {
      if (/特性方程式は|動き方|ゆす|周期|omega_\{\\mathrm d\}/.test(q)) return false;
      if (/ゆれずにいちばん早く/.test(q) && /静かに|q\(0\)/.test(q)) return true;
      return homoD(q) === 0 && /x\(0\)|静かに/.test(q);
    },
    steps: {
      s1(r) {
        const g = genDbl(r, { bad: (a, x0) => a === 3 && x0 === 1 }); if (!g) return null;
        return { q: solveQ(g.eq, g.x0, 0), a: `$${g.s.ans}$`, key: `${g.a}|${g.x0},0`, easyCheck: false,
          easy: `$(s+${g.a})^2=0$、$s=-${g.a}$。$A=${g.x0}$、$B=0+${g.a}\\times${g.x0}$`, calc: g.calc };
      },
      // はじめの速度がある・係数が1でない（$4\ddot x+4\dot x+x=0$ の $s=-\frac12$ も）
      s2(r) {
        const kind = turn(r, '79s2', 3);
        if (kind === 2) {
          const x0 = r.pick([1, 2, 4]), v0 = r.pick([0, 1, -1, 2]);
          const s = dblRoot(fr(1, 2), x0, v0);
          return { q: solveQ(ode(4, 4, 1), x0, v0), a: `$${s.ans}$`, key: `h|${x0},${v0}`, easyCheck: false,
            easy: `$(2s+1)^2=0$、$s=-\\frac12$。$A=${x0}$、$B=${v0}+\\frac12\\times${x0}$`, calc: odeCalc(4, 4, 1, x0, v0) };
        }
        const x0 = kind === 0 ? 0 : r.pick([1, 2]), v0 = kind === 0 ? r.pick([1, 2, 3, 5, 0.5]) : r.pick([1, 2, 3, 4, -2]);
        const g = genDbl(r, { x0, v0 }); if (!g) return null;
        const a = r.chance(0.35) ? 2 : 1;
        return { q: solveQ(ode(a, a * 2 * g.a, a * g.a * g.a), x0, v0), a: `$${g.s.ans}$`, key: `${g.a}|${x0},${v0}`, easyCheck: false,
          easy: `$s=-${g.a}$（重解）。$A=${x0}$、$B=${v0}+${g.a}\\times${x0}$`, calc: odeCalc(a, a * 2 * g.a, a * g.a * g.a, x0, v0) };
      },
      // 見かけがちがう：ちょうどよいダンパーをつける・RLC 回路の放電（境めの抵抗）
      s3(r) {
        const kind = turn(r, '79s3', 3);
        if (kind < 2) {
          const [m, k] = r.pick([[1, 4], [1, 9], [1, 25], [2, 8], [2, 18], [4, 16], [0.5, 8], [0.5, 2], [2, 32]]), x0 = r.pick(['0.1', '0.2', '0.05']);
          const c = 2 * Math.sqrt(m * k), w = Math.sqrt(k / m), s = dblRoot(w, x0, 0);
          return { q: `${spring(m, k)} のばねに、ゆれずにいちばん早くもどるダンパーをつけ、おもりを $${x0}\\,\\mathrm{m}$ 引いて静かにはなした。位置 $x$（m）`, a: `$${s.ans}$`, key: `${fmt(w)}|${x0},0`, easyCheck: false,
            easy: `$c=2\\sqrt{${fmt(m)}\\times${fmt(k)}}=${fmt(c)}$、$s=-${fmt(w)}$（重解）。$A=${x0}$、$B=${fmt(w)}\\times${x0}$`, calc: odeCalc(m, c, k, x0, 0) };
        }
        const [L, C] = r.pick([[0.001, 1e-7], [0.004, 1e-7], [0.01, 4e-6], [0.04, 1e-6]]), V = r.pick([10, 5, 20]);
        if (L === 0.01 && C === 1e-6) return null;   // 教科書の例題（$10\,\mathrm{mH}$・$1\,\mathrm{\mu F}$）
        const { R, b, q0 } = rlcDbl(L, C, V);
        const ans = `${pow10(q0)}(1+${pow10(b)}t)e^{-${pow10(b)}t}`;
        return { q: `${rlc(L, C, R)}（境めの抵抗）の回路で、はじめコンデンサーを $${V}\\,\\mathrm{V}$ にしておき（$q(0)=${pow10(q0)}\\,\\mathrm{C}$）、$\\dot q(0)=0$ でスイッチを入れた。電荷 $q$（C）`, a: `$${ans}$`, key: `r${L},${C},${V}`, easyCheck: false, boxw: '56mm',
          easy: `$${fmt(L)}s^2+${fmt(R)}s+${pow10(1 / C)}=0$、$s=-${pow10(b)}$（重解）。$A=${pow10(q0)}$、$B=${pow10(b)}A$`,
          verify: p => {   // 電荷の式 L q'' + R q' + q/C = 0 と、はじめの値（時間の物さし 1/b で数で微分する）
            const f = t => ev(strip(p.a), { t }), T = 1 / b, h = T * 1e-3;
            for (const u of [0.37, 0.83, 1.29]) { const t = u * T, d1 = (f(t + h) - f(t - h)) / (2 * h), d2 = (f(t + h) - 2 * f(t) + f(t - h)) / (h * h); if (!(Math.abs(L * d2 + R * d1 + f(t) / C) < 1e-4 * V)) return '式をみたさない'; }
            const d0 = (f(h) - f(-h)) / (2 * h);
            return (near(f(0), q0, 1e-9) && Math.abs(d0) < 1e-4 * b * q0) || 'はじめの値がちがう';
          } };
      },
      // わな：複素数の解（6-78）
      trap(r) {
        const g = genCpx(r, { bad: (al, w, x0) => al === 1 && w === 3 && x0 === 1 }); if (!g) return null;
        return dest({ q: solveQ(g.eq, g.x0, 0), a: `$${g.s.ans}$`, key: `t${g.al},${g.w},${g.x0}`, calc: g.calc }, '6-79',
          `判別式が負で、解は $-${g.al}\\pm ${g.w === 1 ? '' : g.w}j$（重解ではない）`, ['6-78']);
      },
    },
  });

  // ================================================================ 6-80
  // ζ と、文に書く √(1-ζ^2) の値（0.6・0.8 は 0.8・0.6 で、値を書かなくても計算できる）
  const ZT = { '0.1': ['0.99', '0.995'], '0.2': ['0.96', '0.980'], '0.3': ['0.91', '0.954'], '0.5': ['0.75', '0.866'], '0.6': [null, '0.8'], '0.8': [null, '0.6'] };
  const sqTxt = z => (ZT[z][0] ? `$\\sqrt{${ZT[z][0]}}=${ZT[z][1]}$` : '');
  // ばね（m、ωn、ζ）を作る。c=2ζ m ωn
  function gen80(r) {
    const z = r.pick(Object.keys(ZT)), [m, wn] = r.pick([[1, 2], [1, 4], [1, 5], [1, 10], [2, 5], [2, 10], [0.5, 4], [0.5, 2], [200, 10], [400, 10], [4, 5]]);
    if (z === '0.3' && wn === 10) return null;   // 楽な形の例（ωn=10、ζ=0.3、ωd=9.54。O-2）
    const k = m * wn * wn, c = 2 * +z * m * wn;
    return { z, m, wn, k, c, wd: F.mul(fr(wn), D(ZT[z][1])), wdTrue: wn * Math.sqrt(1 - z * z) };
  }
  // ピタゴラスの数の組（α、ωd、ωn）：1周期の割合 e^{-2πα/ωd} を、e と π を残した形で
  const PY = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25]];
  // 減衰振動の山の高さの割合を、運動方程式を数でたどって確かめる（1つめと2つめの山）
  function peakRatio(m, c, k) {
    const wd = Math.sqrt(k / m - (c / (2 * m)) ** 2), T = 2 * Math.PI / wd, n = 20000;
    const { xs, h } = rk4(m, c, k, () => 0, 1, 0, 2.6 * T, n), pk = [];
    for (let i = 1; i < xs.length - 1; i++) if (xs[i] > xs[i - 1] && xs[i] >= xs[i + 1]) { const a = xs[i - 1], b = xs[i], d = xs[i + 1], den = a - 2 * b + d; pk.push(den ? b - (a - d) ** 2 / (8 * den) : b); }
    return pk.length >= 2 ? pk[1] / pk[0] : null;
  }
  // RLC の組（L、C）と ωn
  const RLCS = [[0.01, 1e-6, 1e4], [0.004, 1e-7, 5e4], [0.001, 1e-7, 1e5], [0.04, 1e-6, 5e3], [0.001, 1e-6, Math.sqrt(1e9)]].filter(x => Number.isInteger(x[2]));
  M.add({
    id: '6-80', part: 6, chap: '6-12⑥⑧ 例題4・6', stars: 1,
    title: '$\\omega_{\\mathrm d}=\\omega_{\\mathrm n}\\sqrt{1-\\zeta^2}$、ゆれの周期 $T_{\\mathrm d}=\\tfrac{2\\pi}{\\omega_{\\mathrm d}}$、1周期で山は $e^{-\\alpha T_{\\mathrm d}}$ 倍',
    mark: '質量・ばね定数・減衰係数（または $L$・$C$・$R$）と「$\\omega_{\\mathrm d}$」「ゆれの周期」「1周期で山は何倍」。',
    futsu: ['特性方程式 $300s^2+1800s+30000=0$ を', '解の公式で解き、解の虚部から $\\omega_{\\mathrm d}$、', '実部から $\\alpha$ を出す'],
    raku: ['$300\\,\\mathrm{kg}$・$30000\\,\\mathrm{N/m}$・$1800\\,\\mathrm{N\\cdot s/m}$', '$\\omega_{\\mathrm n}=10$、$\\zeta=\\dfrac{1800}{6000}=0.3$、$\\alpha=3$', '$\\omega_{\\mathrm d}=10\\sqrt{0.91}=10\\times0.954=9.54$', '周期 $\\dfrac{2\\pi}{9.54}\\approx0.66$ 秒、1周期で $e^{-1.976}\\approx0.139$ 倍'],
    why: '特性方程式の解は $-\\zeta\\omega_{\\mathrm n}\\pm j\\omega_{\\mathrm n}\\sqrt{1-\\zeta^2}$（6-12⑥）。虚部がゆれの角振動数 $\\omega_{\\mathrm d}$、実部の大きさがへる速さ $\\alpha$。山の高さはつつみの線 $e^{-\\alpha t}$ にそってへるので、1周期 $T_{\\mathrm d}$ では $e^{-\\alpha T_{\\mathrm d}}$ 倍（6-12④）。RLC 回路は $\\omega_{\\mathrm n}=\\dfrac{1}{\\sqrt{LC}}$、$\\zeta=\\dfrac R2\\sqrt{\\dfrac CL}$（6-12⑧）。',
    caution: '周期は $\\dfrac{2\\pi}{\\omega_{\\mathrm d}}$ で、$\\dfrac{2\\pi}{\\omega_{\\mathrm n}}$ ではない（$\\zeta$ が小さいとほぼ同じ）。$\\zeta\\geqq1$ ならゆれないので、周期はない。',
    counts: { s1: 4, s2: 4, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '14mm', s2: '14mm', s3: '22mm', trap: '40mm' }, boxh: { s3: '11mm' },
    fits(q) {
      if (!/omega_\{\\mathrm d\}|ゆれの周期|1周期たつと/.test(q) || /ゆす/.test(q)) return false;
      const s = springOf(q); if (s && s.c != null) return s.c * s.c < 4 * s.m * s.k;
      const e = rlcOf(q); return !!(e && e.R != null && e.R * e.R < 4 * e.L / e.C);
    },
    steps: {
      // ωd（ζ=0.6・0.8 は √ の値なしで）
      s1(r) {
        const g = gen80(r); if (!g) return null;
        const ex0 = !ZT[g.z][0], ans = ex0 ? fx(g.wd) : agree(g.wd, g.wdTrue, (dec(g.wd).split('.')[1] || '').length);
        if (ans == null) return null;
        return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）の $\\omega_{\\mathrm d}${ex0 ? '=' : '\\approx'}□\\,\\mathrm{rad/s}$${ex0 ? '' : `（${sqTxt(g.z)}）`}`, a: `$${ans}$`, key: `${g.m},${g.wn},${g.z}`, easyCheck: false,
          easy: `$\\omega_{\\mathrm n}=${g.wn}$、$\\zeta=${g.z}$。$\\omega_{\\mathrm d}=${g.wn}\\times${ZT[g.z][1]}$`, verify: p => valIs(p, g.wdTrue, ex0 ? 1e-9 : 0.006 / g.wdTrue) };
      },
      // ゆれの周期（2π=6.28、小数第2位まで）
      s2(r) {
        const g = gen80(r); if (!g) return null;
        const T = F.div(D('6.28'), g.wd), ans = agree(T, 2 * Math.PI / g.wdTrue, 2);
        if (ans == null) return null;
        return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）のゆれの周期 $T_{\\mathrm d}\\approx□$ 秒（$2\\pi=6.28$${ZT[g.z][0] ? `、${sqTxt(g.z)}` : ''} として、小数第2位まで）`, a: `$${ans}$`, key: `${g.m},${g.wn},${g.z}`, easyCheck: false,
          easy: `$\\omega_{\\mathrm d}=${g.wn}\\times${ZT[g.z][1]}=${fx(g.wd)}$。$\\frac{6.28}{${fx(g.wd)}}$`,
          verify: p => { const T0 = nums(p.a)[0], { xs, h } = rk4(g.m, g.c, g.k, () => 0, 1, 0, 1.5 * T0, 6000); let z = []; for (let i = 1; i < xs.length; i++) if (xs[i - 1] > 0 !== xs[i] > 0) z.push((i - 1 + xs[i - 1] / (xs[i - 1] - xs[i])) * h); return (z.length >= 3 && Math.abs(z[2] - z[0] - T0) < 0.006) || '周期がちがう'; } };
      },
      // 見かけがちがう：1周期で山は何倍（e と π を残した形）・RLC 回路の ωd
      s3(r) {
        if (turn(r, '80s3', 2) === 0) {
          const [al, wd, wn] = r.pick(PY), m = r.pick([1, 2]), k = m * wn * wn, c = 2 * m * al, R0 = F.make(2 * al, wd);
          const E = `e^{-${R0[1] === 1 ? (R0[0] === 1 ? '' : R0[0]) + '\\pi' : `\\frac{${R0[0] === 1 ? '' : R0[0]}\\pi}{${R0[1]}}`}}`;
          return { q: `ばね・質量・ダンパー（${spring(m, k, c)}）。1周期たつと、ゆれの山の高さは □ 倍（$e$ と $\\pi$ を残した形で）`, a: `$${E}$`, key: `${wn},${al}|e`, easyCheck: false,
            easy: `$\\alpha=\\frac{c}{2m}=${al}$、$\\omega_{\\mathrm d}=\\sqrt{${wn * wn}-${al * al}}=${wd}$、$T_{\\mathrm d}=\\frac{2\\pi}{${wd}}$`,
            verify: p => { const v = ev(strip(p.a)), pr = peakRatio(m, c, k); return (pr != null && near(v, pr, 1e-4)) || `山の割合は ${pr} のはず`; } };
        }
        const [L, C, wn] = r.pick(RLCS), z = r.pick(['0.1', '0.2', '0.3', '0.5', '0.6', '0.8']), R = 2 * +z * Math.sqrt(L / C);
        if (L === 0.01 && C === 1e-6 && z === '0.1') return null;   // 楽な形の例（10 mH・1 μF・20 Ω）
        const wd = F.mul(fr(wn), D(ZT[z][1])), ex0 = !ZT[z][0], ans = ex0 ? fx(wd) : agree(wd, wn * Math.sqrt(1 - z * z), 0);
        if (ans == null) return null;
        return { q: `RLC 回路（${rlc(L, C, R)}）の $\\omega_{\\mathrm d}${ex0 ? '=' : '\\approx'}□\\,\\mathrm{rad/s}$${ex0 ? '' : `（${sqTxt(z)}）`}`, a: `$${ans}$`, key: `${wn},${z}|d`, easyCheck: false,
          easy: `$\\omega_{\\mathrm n}=\\frac{1}{\\sqrt{LC}}=${wn}$、$\\zeta=\\frac R2\\sqrt{\\frac CL}=${z}$`,
          verify: p => { const a = L, b = R, c = 1 / C, wdT = Math.sqrt(4 * a * c - b * b) / (2 * a); return near(nums(p.a)[0], wdT, ex0 ? 1e-9 : 0.6 / wdT) || 'ωd がちがう'; } };
      },
      // わな：ζ>1（ゆれない。6-76 の動き方）
      trap(r) {
        const [m, wn] = r.pick([[1, 4], [1, 5], [2, 5], [1, 10], [0.5, 4]]), z = r.pick([1.25, 1.5, 2, 2.5]), k = m * wn * wn, c = 2 * z * m * wn;
        return dest({ q: `ばね・質量・ダンパー（${spring(m, k, c)}）のゆれの周期 $T_{\\mathrm d}$`, a: 'ゆれない（周期はない）', key: `t${wn},${z}`,
          verify: () => { const { xs } = rk4(m, c, k, () => 0, 1, 0, 40 / wn, 4000); return xs.every(x => x > -1e-12) || 'ゆれている'; } }, '6-80',
          `$\\zeta=\\frac{${fmt(c)}}{2\\sqrt{${fmt(m)}\\times${fmt(k)}}}=${fmt(z)}$ で1より大きい。解は2つの負の数で、ゆれずにゆっくりもどる（$\\omega_{\\mathrm d}$ はない）`, ['6-76']);
      },
    },
  });

  // ================================================================ 6-81
  // ダンパーのない式 ẍ+n²x=F cos wt：P=F/(n²-w²)（F は正。w>n なら P は負）
  function gen81(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 30; t++) {
      const n = r.int(2, 6), w = opt.w || r.pick([1, 1, 1, 2, 3]); if (w === n) continue;
      const P = F.mul(D(r.pick([1, 2, 3, 0.5, 1.5])), fr(Math.sign(n * n - w * w))), Fv = F.mul(P, fr(n * n - w * w));
      if (Fv[1] !== 1) continue;
      if (w === 1 && ((n === 3 && Fv[0] === 8) || (n === 5 && Fv[0] === 24))) continue;   // 楽な形・6-13 の基本問題の例（O-2）
      const rhs = `${Fv[0]}${trig('cos', w)}`;
      return { n, w, P, F: Fv[0], rhs, eq: ode(1, 0, n * n, rhs), xp: cf(P, trig('cos', w)), full: sum([cf(P, trig('cos', w)), cf(F.mul(P, fr(-1)), trig('cos', n))]) };
    }
    return null;
  }
  M.add({
    id: '6-81', part: 6, chap: '6-13④⑤ 例題1', stars: 1,
    title: 'ダンパーのない強制振動：$x_{\\mathrm p}=\\tfrac{F}{\\omega_{\\mathrm n}^2-\\omega^2}\\cos\\omega t$、止まった所からは $P(\\cos\\omega t-\\cos\\omega_{\\mathrm n}t)$',
    mark: '$\\ddot x+\\omega_{\\mathrm n}^2x=F\\cos\\omega t$（$\\dot x$ の項がない）と、$x(0)=0$、$\\dot x(0)=0$。',
    futsu: ['$x_{\\mathrm p}=P\\cos t$ を入れて係数を比べ、', '自分のゆれ $A\\cos3t+B\\sin3t$ を足して、', '位置と速度の式から $A$、$B$ を決める'],
    raku: ['$\\ddot x+9x=8\\cos t$：$P=\\dfrac{8}{9-1}=1$', '止まった所から → $x=\\cos t-\\cos3t$'],
    why: '$x=P\\cos\\omega t$ を入れると、$\\ddot x=-\\omega^2x$ なので $(\\omega_{\\mathrm n}^2-\\omega^2)P=F$。$x(0)=0$ から自分のゆれの $A=-P$、$\\dot x(0)=0$ から $B=0$ なので、自分のゆれは $-P\\cos\\omega_{\\mathrm n}t$（6-13⑤ 例題1）。',
    caution: '$\\omega$ が $\\omega_{\\mathrm n}$ より大きいと $P$ は負（ゆれは力と反対向き）。ダンパー（$\\dot x$ の項）があると $P\\cos\\omega t$ だけでは合わない（$\\sin$ も要る）。$\\omega=\\omega_{\\mathrm n}$ では分母が0で、この形は使えない。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: 1, boxw: { s1: '22mm', s2: '36mm', s3: '42mm', trap: '34mm' },
    fits(q) {
      const o = lin2(q), cr = cosRhs(o);
      if (o && cr) return o.b === 0 && Math.abs(o.c / o.a - cr.w * cr.w) > 1e-9;
      return /ダンパーはない/.test(q) && /ゆす/.test(q);
    },
    steps: {
      // ゆすりに合うゆれ x_p
      s1(r) {
        const g = gen81(r); if (!g) return null;
        return { q: `$${g.eq}$ の、ゆすりに合うゆれ $x_{\\mathrm p}$`, a: `$${g.xp}$`, key: `${g.n},${g.w},${fx(g.P)}`, easyCheck: false,
          easy: `$P=\\frac{${g.F}}{${g.n * g.n}-${g.w * g.w}}=${fx(g.P)}$`, calc: { kind: 'ode', x: 't', coef: [1, 0, g.n * g.n], rhs: g.rhs } };
      },
      // 止まった所から（ω が ωn より大きいときもまぜる）
      s2(r) {
        const g = gen81(r, { w: r.pick([1, 1, 2, 3, 4]) }); if (!g) return null;
        return { q: solveQ(g.eq, 0, 0), a: `$${g.full}$`, key: `${g.n},${g.w},${fx(g.P)}`, easyCheck: false,
          easy: `$P=\\frac{${g.F}}{${g.n * g.n}-${g.w * g.w}}=${fx(g.P)}$。$x=P(${trig('cos', g.w)}-${trig('cos', g.n)})$`, calc: odeCalc(1, 0, g.n * g.n, 0, 0, g.rhs) };
      },
      // 見かけがちがう：ばねとおもり（質量でわってから）・係数が1でない式
      s3(r) {
        const kind = turn(r, '81s3', 2), m = r.pick([0.5, 2, 4]), g = gen81(r); if (!g) return null;
        const k = m * g.n * g.n;
        if (kind === 0) {
          const P = F.mul(D(r.pick(['0.1', '0.05', '0.2', '0.02'])), fr(Math.sign(g.n * g.n - g.w * g.w))), F0 = F.mul(P, D(fmt(k - m * g.w * g.w)));
          if (!dec(F0)) return null;
          const rhs = `${fx(F0)}${trig('cos', g.w)}`, ans = sum([cf(P, trig('cos', g.w)), cf(F.mul(P, fr(-1)), trig('cos', g.n))]);
          return { q: `ばねとおもり（${spring(m, k)}。ダンパーはない）を、止まった所から力 $${rhs}$（N）でゆする。位置 $x$（m）`, a: `$${ans}$`, key: `${g.n},${g.w},${fx(P)}`, easyCheck: false,
            easy: `$${m}$ でわって $\\ddot x+${g.n * g.n}x=${fmt(F.val(F0) / m)}${trig('cos', g.w)}$。$P=${fx(P)}$`, calc: odeCalc(m, 0, k, 0, 0, rhs) };
        }
        const rhs = `${fmt(m * g.F)}${trig('cos', g.w)}`;
        return { q: solveQ(ode(m, 0, k, rhs), 0, 0), a: `$${g.full}$`, key: `${g.n},${g.w},${fx(g.P)}`, easyCheck: false,
          easy: `$${m}$ でわって $${g.eq}$。$P=${fx(g.P)}$`, calc: odeCalc(m, 0, k, 0, 0, rhs) };
      },
      // わな：ダンパーがある（6-82）
      trap(r) {
        const g = gen82(r, { w: 1 }); if (!g) return null;
        return dest({ q: `$${g.eq}$ の、ゆすりに合うゆれ $x_{\\mathrm p}$`, a: `$${g.xp}$`, key: `t${g.key}`, calc: { kind: 'ode', x: 't', coef: [g.m, g.c, g.k], rhs: g.rhs } }, '6-81',
          `$${cf(g.c, '\\dot x')}$ の項（ダンパー）があるので、$P\\cos t$ だけでは合わない。$X=\\frac{${g.F0}}{${fmt(g.a)}+${fmt(g.b)}j}$ のわり算で`, ['6-82']);
      },
    },
  });

  // ================================================================ 6-82
  // 分母 a+jb（a=k-mω²、b=cω）と λ から：X=λ(a-jb)、F0=λ(a²+b²)、x_p=λa cos ωt+λb sin ωt
  function gen82(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 40; t++) {
      const w = opt.w || r.pick([1, 1, 2]), m = opt.m || (r.chance(0.2) ? 2 : 1), a = opt.a != null ? opt.a : r.int(-3, 6), b = opt.b || r.int(1, 6);
      const c = b / w, k = a + m * w * w, lam = D(r.pick([0.5, 1, 1, 2, 2.5]));
      if (k <= 0 || !Number.isInteger(2 * c)) continue;
      const F0 = F.mul(lam, fr(a * a + b * b)), P = F.mul(lam, fr(a)), Q = F.mul(lam, fr(b));
      if (F0[1] !== 1 || !dec(P) || !dec(Q)) continue;
      if (w === 1 && m === 1 && c === 4 && k === 3 && F0[0] === 10) continue;   // 楽な形の例（O-2）
      if (w === 2 && m === 1 && c === 2 && k === 8 && F0[0] === 20) continue;   // 目録の例（6-13 例題4）
      if (opt.bad && opt.bad(a, b, w, m, F0[0])) continue;
      const rhs = `${F0[0]}${trig('cos', w)}`;
      return { w, m, a, b, c, k, lam, F0: F0[0], P, Q, rhs, eq: ode(m, c, k, rhs), key: `${m},${fmt(c)},${k},${F0[0]},${w}`,
        xp: sum([cf(P, trig('cos', w)), cf(Q, trig('sin', w))]), X: sum([cf(P, ''), cf(F.mul(Q, fr(-1)), 'j')]) };
    }
    return null;
  }
  const den = (a, b) => sum([cf(a, ''), cf(b, 'j')]);   // 分母 a+bj
  // 振幅 λ√(a²+b²) を、√ を残した形で
  function ampTeX(lam, d) {
    const s = sqrtTeX(d); if (!/sqrt/.test(s)) return fx(F.mul(lam, fr(+s)));
    const m = /^(\d*)\\sqrt\{(\d+)\}$/.exec(s), out = F.mul(lam, fr(m[1] ? +m[1] : 1));
    return cf(out, `\\sqrt{${m[2]}}`);
  }
  M.add({
    id: '6-82', part: 6, chap: '6-13⑤⑥⑧ 例題2・4', stars: 1,
    title: 'ゆすりに合うゆれは、複素数のわり算1回：$X=\\tfrac{F_0}{(k-m\\omega^2)+jc\\omega}$',
    mark: '$m\\ddot x+c\\dot x+kx=F_0\\cos\\omega t$ と「ゆすりに合うゆれ」「振幅」「位相のおくれ」。',
    futsu: ['$x=P\\cos t+Q\\sin t$ と置いて2回微分し、', '$\\cos t$ と $\\sin t$ の係数を比べて、', '$P$、$Q$ の連立方程式を解く'],
    raku: ['$\\ddot x+4\\dot x+3x=10\\cos t$', '$X=\\dfrac{10}{(3-1)+4j}=\\dfrac{10}{2+4j}=1-2j$', '$x_{\\mathrm p}=\\cos t+2\\sin t$、振幅 $\\lvert X\\rvert=\\sqrt5$'],
    why: '$x=\\mathrm{Re}[Xe^{j\\omega t}]$ と置くと、微分は $j\\omega$ をかけることになり、式は $X$ の1次式 $(k-m\\omega^2+jc\\omega)X=F_0$（6-13⑥）。$X=P-jQ$ なら $\\mathrm{Re}[(P-jQ)(\\cos\\omega t+j\\sin\\omega t)]$ は $P\\cos\\omega t+Q\\sin\\omega t$。$X$ の大きさが振幅、分母の角が位相のおくれ（6-13⑧）。',
    caution: '答えは実部をとった実数の式にする（$j$ を残さない）。虚部の符号を変えるのを忘れない（$X=1-2j$ なら $+2\\sin t$）。ダンパーがなく $\\omega=\\omega_{\\mathrm n}$ だと、分母が0になって使えない。',
    counts: { s1: 4, s2: 4, s3: 4, trap: 2 },
    cols: 1, boxw: { s1: '34mm', s2: '18mm', s3: '22mm', trap: '22mm' },
    fits(q) {
      const o = lin2(q), cr = cosRhs(o);
      return !!(o && cr && o.b !== 0 && !/x\(0\)/.test(q));
    },
    steps: {
      s1(r) {
        const g = gen82(r); if (!g) return null;
        return { q: `$${g.eq}$ の、ゆすりに合うゆれ $x_{\\mathrm p}$`, a: `$${g.xp}$`, key: g.key, easyCheck: false,
          easy: `$X=\\frac{${g.F0}}{${den(g.a, g.b)}}=${g.X}$`, calc: { kind: 'ode', x: 't', coef: [g.m, g.c, g.k], rhs: g.rhs } };
      },
      // 振幅 |X|（√ を残した形）
      s2(r) {
        const g = gen82(r); if (!g) return null;
        const d = g.a * g.a + g.b * g.b, A = ampTeX(g.lam, d);
        return { q: `$${g.eq}$ の、ゆすりに合うゆれの振幅`, a: `$${A}$`, key: g.key, easyCheck: false,
          easy: `$\\lvert X\\rvert=\\frac{${g.F0}}{\\sqrt{${g.a < 0 ? `(${g.a})` : g.a}^2+${g.b}^2}}=\\frac{${g.F0}}{\\sqrt{${d}}}$`,
          verify: p => { const pk = (() => { const dd = g.c * g.c - 4 * g.m * g.k, al = dd > 0 ? (g.c - Math.sqrt(dd)) / (2 * g.m) : g.c / (2 * g.m), Ts = 16 / al + 4 * Math.PI / g.w, n = Math.ceil(Ts / 0.002), { xs } = rk4(g.m, g.c, g.k, t => g.F0 * Math.cos(g.w * t), 0, 0, Ts, n); return Math.max(...xs.slice(-Math.ceil(2 * Math.PI / g.w / 0.002) - 10).map(Math.abs)); })(); return near(ev(strip(p.a)), pk, 2e-3) || `振幅は ${pk} のはず`; } };
      },
      // 見かけがちがう：位相のおくれ（45°・90°・135°）・複素振幅 X
      s3(r) {
        if (turn(r, '82s3', 2) === 0) {
          const kind = r.int(0, 2), b = r.int(1, 5), g = gen82(r, { a: kind === 0 ? b : kind === 1 ? 0 : -b, b }); if (!g) return null;
          const deg = [45, 90, 135][kind];
          return { q: `$${g.eq}$ で、ゆすりに合うゆれは、力より何度おくれるか`, a: `$${deg}^{\\circ}$`, key: g.key, easyCheck: false,
            easy: `分母 $${den(g.a, g.b)}$ の角`,
            verify: p => { const X = M.evalC(`\\frac{${g.F0}}{${g.k}-${g.m * g.w * g.w}+${fmt(g.c * g.w)}j}`, {}); return near(-Math.atan2(X[1], X[0]) * 180 / Math.PI, deg, 1e-9) || 'おくれがちがう'; } };
        }
        const g = gen82(r); if (!g) return null;
        return { q: `$${g.eq}$ の、ゆすりに合うゆれの複素振幅 $X$（$x_{\\mathrm p}=\\mathrm{Re}[Xe^{j${g.w === 1 ? '' : g.w}t}]$）`, a: `$${g.X}$`, key: g.key, easyCheck: false,
          easy: `$X=\\frac{${g.F0}}{(${g.k}-${g.m * g.w * g.w})+${cf(g.c * g.w, 'j')}}$`,
          verify: p => { const X = M.evalC(strip(p.a), {}), Z = [g.k - g.m * g.w * g.w, g.c * g.w]; return (X && near(X[0] * Z[0] - X[1] * Z[1], g.F0, 1e-9) && Math.abs(X[0] * Z[1] + X[1] * Z[0]) < 1e-9) || 'X×分母が F0 にならない'; } };
      },
      // わな：ダンパーがなく、ちょうど ωn（分母が0。t sin の形。わざなし）
      trap(r) {
        const n = r.pick([1, 2, 3, 4]), A = r.pick([1, 2, 0.5]), Fv = 2 * n * A, rhs = `${fmt(Fv)}${trig('cos', n)}`;
        return dest({ q: `$${ode(1, 0, n * n, rhs)}$ の、ゆすりに合うゆれ $x_{\\mathrm p}$`, a: `$${cf(A, 't' + trig('sin', n))}$`, key: `t${n},${A}`, calc: { kind: 'ode', x: 't', coef: [1, 0, n * n], rhs } }, '6-82',
          `ダンパーがなく、ちょうど $\\omega=\\omega_{\\mathrm n}=${n}$ でゆすっている。分母 $${n * n}-${n * n}=0$ で $X$ が求められない（$t$ をかけた形。ゆれはふえ続ける）`);
      },
    },
  });

  // ================================================================ 6-83
  // 解が2つ（-p、-q）の式 ẍ+(p+q)ẋ+pq x=F0 cos t、x(0)=0、ẋ(0)=0
  function gen83(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 60; t++) {
      const p = r.int(1, 3), q = r.int(p + 1, 4), g = gen82(r, { w: 1, m: 1, a: p * q - 1, b: p + q }); if (!g) continue;
      const A = F.div(F.add(g.Q, F.mul(fr(q), g.P)), fr(p - q)), B = F.sub(F.mul(g.P, fr(-1)), A);
      if (!dec(A) || !dec(B) || A[0] === 0 || B[0] === 0) continue;
      if (p === 1 && q === 3 && g.F0 === 10) continue;   // 楽な形の例（O-2）
      if (g.F0 > 100 || Math.abs(F.val(A)) > 30 || Math.abs(F.val(B)) > 30) continue;   // 数を手で計算できる大きさに
      return Object.assign(g, { p, q, A, B, full: sum([g.xp, cf(A, ex(-p)), cf(B, ex(-q))]), key2: `${p},${q},${g.F0}` });
    }
    return null;
  }
  // 複素数の解（-α±jωd）の式 ẍ+2αẋ+(α²+ωd²)x=F0 cos t
  function gen83c(r) {
    for (let t = 0; t < 60; t++) {
      const al = r.int(1, 2), wd = r.int(1, 3), g = gen82(r, { w: 1, m: 1, a: al * al + wd * wd - 1, b: 2 * al }); if (!g) continue;
      const A = F.mul(g.P, fr(-1)), B = F.div(F.sub(F.mul(fr(al), A), g.Q), fr(wd));
      if (!dec(A) || !dec(B)) continue;
      const neg = A[0] <= 0 && B[0] <= 0, Aa = neg ? F.mul(A, fr(-1)) : A, Ba = neg ? F.mul(B, fr(-1)) : B;
      const inner = sum([cf(Aa, trig('cos', wd)), cf(Ba, trig('sin', wd))]);
      return Object.assign(g, { al, wd, A, B, full: `${g.xp}${neg ? '-' : '+'}${ex(-al)}(${inner})`, key2: `c${al},${wd},${g.F0}` });
    }
    return null;
  }
  M.add({
    id: '6-83', part: 6, chap: '6-13④ 例題3', stars: 1,
    title: '$x_{\\mathrm p}$ に「自分のゆれ」を足してから、はじめの状態で $A$、$B$ を決める',
    mark: '右辺に $\\cos\\omega t$ がある式と、$x(0)=0$、$\\dot x(0)=0$（止まった所からゆする）。',
    futsu: ['係数を比べて $x_{\\mathrm p}=\\cos t+2\\sin t$ を出し、', '$x=x_{\\mathrm p}+Ae^{-t}+Be^{-3t}$ を微分した', '速度の式を書いて、$t=0$ を入れる'],
    raku: ['$\\ddot x+4\\dot x+3x=10\\cos t$、$0$、$0$', '$x=\\cos t+2\\sin t+Ae^{-t}+Be^{-3t}$', '位置：$1+A+B=0$、速度：$2-A-3B=0$', '$A=-2.5$、$B=1.5$'],
    why: '答え＝ゆすりに合うゆれ $x_{\\mathrm p}$＋自分のゆれ（6-13④）。$x_{\\mathrm p}$ は右辺に合わせて決まってしまうので、はじめの状態に合わせる数 $A$、$B$ は自分のゆれのほうにある。$t=0$ では、$x_{\\mathrm p}=P\\cos\\omega t+Q\\sin\\omega t$ の位置は $P$、速度は $Q\\omega$。',
    caution: '$x_{\\mathrm p}$ だけで $x(0)=0$ に合わせようとしない。はじめの速度の式には、$x_{\\mathrm p}$ の速度 $Q\\omega$ も入れる。自分のゆれは、右辺を0にした式の特性方程式から（6-12）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '64mm', s2: '64mm', s3: '70mm', trap: '18mm' },
    fits(q) {
      const o = lin2(q), cr = cosRhs(o);
      return !!(o && cr && o.b !== 0 && /x\(0\)/.test(q));
    },
    steps: {
      // x_p を文に書いておく
      s1(r) {
        const g = gen83(r); if (!g) return null;
        return { q: `$${g.eq}$ のゆすりに合うゆれは $x_{\\mathrm p}=${g.xp}$。$x(0)=0$、$\\dot x(0)=0$ をみたす $x$`, a: `$${g.full}$`, key: g.key2, easyCheck: false,
          easy: `$s=-${g.p}$、$-${g.q}$。$${fx(g.P)}+A+B=0$、$${fx(g.Q)}-${g.p === 1 ? '' : g.p}A-${g.q}B=0$`, calc: odeCalc(1, g.c, g.k, 0, 0, g.rhs) };
      },
      // x_p から求める
      s2(r) {
        const g = gen83(r); if (!g) return null;
        return { q: solveQ(g.eq, 0, 0), a: `$${g.full}$`, key: g.key2, easyCheck: false,
          easy: `$x_{\\mathrm p}=${g.xp}$、$s=-${g.p}$、$-${g.q}$。$A=${fx(g.A)}$、$B=${fx(g.B)}$`, calc: odeCalc(1, g.c, g.k, 0, 0, g.rhs) };
      },
      // 自分のゆれが e^{-αt}(cos・sin) の形
      s3(r) {
        const g = gen83c(r); if (!g) return null;
        return { q: solveQ(g.eq, 0, 0), a: `$${g.full}$`, key: g.key2, easyCheck: false, boxh: '11mm',
          easy: `$x_{\\mathrm p}=${g.xp}$、自分のゆれ $${ex(-g.al)}(A${trig('cos', g.wd)}+B${trig('sin', g.wd)})$。$A=${fx(g.A)}$、$B=${fx(g.B)}$`, calc: odeCalc(1, g.c, g.k, 0, 0, g.rhs) };
      },
      // わな：振幅だけ（自分のゆれは要らない。6-82）
      trap(r) {
        const g = gen83(r); if (!g) return null;
        return dest({ q: `$${g.eq}$ の、ゆすりに合うゆれの振幅`, a: `$${ampTeX(g.lam, g.a * g.a + g.b * g.b)}$`, key: `t${g.key2}`,
          verify: p => near(ev(strip(p.a)), g.F0 / Math.hypot(g.k - 1, g.c), 1e-9) || '振幅がちがう' }, '6-83',
          'はじめの状態がなく、聞いているのは、やがて残るゆすりに合うゆれの振幅だけ。自分のゆれは足さなくてよい', ['6-82']);
      },
    },
  });

  // ================================================================ 6-84
  // 山の ω²=k/m-c²/(2m²) が正の整数になる (m, k, c)。楽な形・教科書の例（1・100・4、1・64・4）はのぞく
  const P84 = [];
  [[1, 2], [1, 4], [1, 6], [2, 2], [2, 4]].forEach(([m, c]) => { for (let k = 3; k <= 130; k++) { const w2 = k / m - c * c / (2 * m * m); if (Number.isInteger(w2) && w2 >= 2 && c * c < 0.72 * 2 * m * k && !(m === 1 && c === 4 && (k === 100 || k === 64))) P84.push({ m, c, k, w2 }); } });
  // 山の高さ F0/√G（G=c²(k-c²/(4m))/m）が、きりのよい数になる組（m=1）
  const G84 = P84.filter(o => o.m === 1 && isSq(o.k - o.c * o.c / 4) && o.w2 !== 92);
  const amp84 = o => w => o.F0 / Math.hypot(o.k - o.m * w * w, o.c * w);
  function fig84(o, wp) {
    const wn = Math.sqrt(o.k / o.m), f = amp84(o), ap = f(wp), G = M.graph({ x0: 0, x1: 2 * wn, y0: 0, y1: 1.25 * ap, w: 8, h: 5 });
    return { s: 5, items: [
      ...G.axes({ xt: [wn], xfmt: () => '$\\omega_{\\mathrm n}$', x: '\\omega', y: '\\lvert X\\rvert' }),
      ['seg', G.T(wn, 0), G.T(wn, 1.15 * ap), { dash: true }],
      ...G.plot(f, 0, 2 * wn, { n: 160, thick: true }),
      ['dot', G.T(wp, ap)], ['label', G.T(wp, ap), '山', 'nw'],
    ] };
  }
  M.add({
    id: '6-84', part: 6, chap: '6-13⑦ 例題6', stars: 1,
    title: 'いちばん大きくゆれる $\\omega$ は $\\omega_{\\mathrm n}\\sqrt{1-2\\zeta^2}$（$\\omega^2=\\tfrac km-\\tfrac{c^2}{2m^2}$）',
    mark: 'ばね・質量・ダンパーをゆする、「振幅がいちばん大きくなる $\\omega$」「そのときの振幅」。',
    futsu: ['$G(\\omega)=(100-\\omega^2)^2+16\\omega^2$ を微分して', '$G\'(\\omega)=4\\omega(\\omega^2-92)$、', '増減表をかいて、いちばん小さい所をさがす'],
    raku: ['$m=1$、$k=100$、$c=4$', '$\\omega^2=\\dfrac{100}{1}-\\dfrac{4^2}{2\\times1^2}=100-8=92$', '$\\omega=\\sqrt{92}=2\\sqrt{23}$', '振幅は $G=(k-m\\omega^2)^2+c^2\\omega^2$ に $\\omega^2=92$ を入れて'],
    why: '振幅 $\\dfrac{F_0}{\\sqrt{G}}$ がいちばん大きいのは $G=(k-m\\omega^2)^2+c^2\\omega^2$ がいちばん小さいとき。$G\'(\\omega)=2\\omega\\{c^2-2m(k-m\\omega^2)\\}=0$ から $k-m\\omega^2=\\dfrac{c^2}{2m}$、つまり $\\omega^2=\\dfrac km-\\dfrac{c^2}{2m^2}$（6-13⑦）。$c=2\\zeta\\sqrt{mk}$ を入れると $\\omega=\\omega_{\\mathrm n}\\sqrt{1-2\\zeta^2}$。',
    caution: '山は $\\omega_{\\mathrm n}$ ちょうどではなく、少し左。$c^2$ が $2mk$ より大きい（$\\zeta>0.707$）と山はない。振幅を出すときは、$G$ に $\\omega$ ではなく $\\omega^2$ の値を入れると早い。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 1 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 }, boxw: { s1: '18mm', s2: '16mm', s3: '18mm', trap: '40mm' },
    fits(q) {
      if (!/いちばん大きく|いちばん大きい値|山の/.test(q) || !/ゆす|共振曲線/.test(q) || /ちょうど|Q 値|半値幅/.test(q)) return false;
      const s = springOf(q); if (s && s.c != null) return s.c * s.c < 2 * s.m * s.k;
      const z = /zeta=([\d.]+)/.exec(q); return !!(z && +z[1] < 0.707);
    },
    steps: {
      // 山の ω（√ を残した形）
      s1(r) {
        const o = r.pick(P84);
        return { q: `ばね・質量・ダンパー（${spring(o.m, o.k, o.c)}）を $F_0\\cos\\omega t$ でゆする。振幅がいちばん大きくなるのは $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${sqrtTeX(o.w2)}$`, key: `${o.m},${o.k},${o.c}`, easyCheck: false,
          easy: `$\\omega^2=\\frac{${o.k}}{${o.m}}-\\frac{${o.c}^2}{2\\times${o.m}^2}=${o.w2}$`, verify: p => near(ev(strip(p.a)), peakNum(o.m, o.k, o.c, 1, 2 * Math.sqrt(o.k / o.m)).w, 1e-6) || '山の ω がちがう' };
      },
      // 山の高さ・ωn と ζ から山の ω
      s2(r) {
        if (turn(r, '84s2', 2) === 0) {
          const o = Object.assign({}, r.pick(G84)), sG = o.c * Math.sqrt(o.k - o.c * o.c / 4), A = r.pick(['0.1', '0.2', '0.5', '0.05', '0.25']), F0 = F.mul(D(A), D(fmt(sG)));
          if (!dec(F0) || F.val(F0) > 100) return null;
          o.F0 = F.val(F0);
          return { q: `ばね・質量・ダンパー（${spring(o.m, o.k, o.c)}）を $${fx(F0)}\\cos\\omega t$（N）でゆする。いちばん大きくゆれるときの振幅は □ m`, a: `$${A}$`, key: `${o.m},${o.k},${o.c}`, easyCheck: false,
            easy: `$\\omega^2=${o.w2}$、$G=(${o.k}-${o.w2})^2+${o.c * o.c}\\times${o.w2}=${fmt(sG * sG)}$、$\\frac{${fx(F0)}}{\\sqrt{${fmt(sG * sG)}}}$`, verify: p => near(nums(p.a)[0], peakNum(o.m, o.k, o.c, o.F0, 2 * Math.sqrt(o.k)).a, 1e-6) || '山の高さがちがう' };
        }
        const [wn, z] = r.pick([[4, '0.5'], [6, '0.5'], [10, '0.5'], [8, '0.5'], [10, '0.1'], [20, '0.1'], [10, '0.3'], [5, '0.6'], [10, '0.6'], [20, '0.3']]), N = Math.round(wn * wn * (1 - 2 * z * z) * 1e6) / 1e6;
        return { q: `$\\omega_{\\mathrm n}=${wn}\\,\\mathrm{rad/s}$、$\\zeta=${z}$ のばね・質量・ダンパーをゆする。振幅がいちばん大きくなるのは $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${sqrtTeX(N)}$`, key: `z${wn},${z}`, easyCheck: false,
          easy: `$\\omega=${wn}\\sqrt{1-2\\times${z}^2}=\\sqrt{${wn * wn}\\times${fmt(1 - 2 * z * z)}}$`, verify: p => near(ev(strip(p.a)), peakNum(1, wn * wn, 2 * z * wn, 1, 2 * wn).w, 1e-6) || '山の ω がちがう' };
      },
      // 見かけがちがう：共振曲線の図（山の ω・山の高さ）
      s3(r) {
        if (turn(r, '84s3', 2) === 0) {
          const o = Object.assign({ F0: 1 }, r.pick(P84));
          return { q: `図は、ばね・質量・ダンパー（${spring(o.m, o.k, o.c)}）を $F_0\\cos\\omega t$ でゆすったときの共振曲線。山の $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${sqrtTeX(o.w2)}$`, key: `${o.m},${o.k},${o.c}`, easyCheck: false, fig: fig84(o, Math.sqrt(o.w2)),
            easy: `$\\omega^2=\\frac{${o.k}}{${o.m}}-\\frac{${o.c}^2}{2\\times${o.m}^2}=${o.w2}$`, verify: p => near(ev(strip(p.a)), peakNum(o.m, o.k, o.c, 1, 2 * Math.sqrt(o.k / o.m)).w, 1e-6) || '山の ω がちがう' };
        }
        const o = Object.assign({}, r.pick(G84)), sG = o.c * Math.sqrt(o.k - o.c * o.c / 4), A = r.pick(['0.1', '0.2', '0.5', '0.25']), F0 = F.mul(D(A), D(fmt(sG)));
        if (!dec(F0) || F.val(F0) > 100) return null;
        o.F0 = F.val(F0);
        return { q: `図は、ばね・質量・ダンパー（${spring(o.m, o.k, o.c)}）を $${fx(F0)}\\cos\\omega t$（N）でゆすったときの共振曲線。山の高さ（振幅）は □ m`, a: `$${A}$`, key: `${o.m},${o.k},${o.c}`, easyCheck: false, fig: fig84(o, Math.sqrt(o.w2)),
          easy: `$\\omega^2=${o.w2}$、$G=${fmt(sG * sG)}$、$\\frac{${fx(F0)}}{\\sqrt{${fmt(sG * sG)}}}$`, verify: p => near(nums(p.a)[0], peakNum(o.m, o.k, o.c, o.F0, 2 * Math.sqrt(o.k)).a, 1e-6) || '山の高さがちがう' };
      },
      // わな：c² > 2mk（ζ>0.707。山がない）
      trap(r) {
        const [m, k] = r.pick([[1, 25], [1, 16], [1, 36], [2, 8], [1, 9]]), c = 2 * Math.sqrt(m * k) * r.pick([0.8, 0.9, 1, 1.5]);
        return dest({ q: `ばね・質量・ダンパー（${spring(m, k, c)}）を $F_0\\cos\\omega t$ でゆする。振幅がいちばん大きくなる $\\omega$`, a: '山はない（$\\omega$ が0に近いほど大きい）', key: `t${m},${k},${fmt(c)}`,
          verify: () => peakNum(m, k, c, 1, 3 * Math.sqrt(k / m)).w < 1e-3 * Math.sqrt(k / m) || '山がある' }, '6-84',
          `$c^2=${fmt(c * c)}$ が $2mk=${2 * m * k}$ より大きい（$\\zeta>0.707$）。$\\omega^2=\\frac km-\\frac{c^2}{2m^2}$ が負で、山はない`);
      },
    },
  });

  // ================================================================ 6-85
  // ゆする角振動数 w での振幅を、複素数のわり算 F0/(k-mw²+jcw) の大きさで（ωn だけの形 F0/(cωn) とは別の道すじ）
  const ampAt = (m, k, c, F0, w) => { const X = M.evalC(`\\frac{${F0}}{${k - m * w * w}+${c * w}j}`, {}); return Math.hypot(X[0], X[1]); };
  const ZQ = ['0.05', '0.1', '0.2', '0.25', '0.02', '0.125'];
  function gen85(r) {
    const [m, wn] = r.pick([[1, 2], [1, 4], [1, 5], [1, 10], [0.5, 4], [2, 5], [2, 2], [0.5, 10]]), z = r.pick(ZQ), k = m * wn * wn, c = 2 * +z * m * wn;
    if (!dec(D(fmt(c)))) return null;
    if ((m === 0.5 && wn === 4 && z === '0.1') || (m === 1 && wn === 5 && z === '0.2')) return null;   // 楽な形の例（O-2）
    return { m, wn, z, k, c };
  }
  M.add({
    id: '6-85', part: 6, chap: '6-13③⑩・問題', stars: 1,
    title: '$\\omega=\\omega_{\\mathrm n}$ でゆすると、振幅は $\\tfrac{F_0}{c\\,\\omega_{\\mathrm n}}$（$\\tfrac{F_0}{k}$ の $\\tfrac{1}{2\\zeta}$ 倍）',
    mark: '「ちょうど $\\omega=\\omega_{\\mathrm n}$ でゆすった」「共振のときの振幅」「何倍ゆれる」。',
    futsu: ['$X=\\dfrac{F_0}{k-m\\omega^2+jc\\omega}$ に $\\omega=4$ を入れて、', '$k-m\\omega^2=8-0.5\\times16=0$ を確かめ、', '分母の大きさ $\\sqrt{0^2+1.6^2}$ を計算する'],
    raku: ['$m=0.5$、$k=8$、$c=0.4$、$F_0=0.8$', '$\\omega_{\\mathrm n}=4$ → $\\dfrac{0.8}{0.4\\times4}=0.5\\,\\mathrm{m}$', '$\\dfrac{F_0}{k}=0.1$ の5倍（$\\zeta=0.1$、$\\dfrac{1}{2\\zeta}=5$）'],
    why: '$\\omega=\\omega_{\\mathrm n}$ では $m\\omega^2=k$ なので、ばねと質量の矢印が打ち消しあい、分母は $jc\\omega_{\\mathrm n}$ だけになる（6-13⑥）。振幅は $\\dfrac{F_0}{c\\omega_{\\mathrm n}}$。$c=2\\zeta\\sqrt{mk}$、$\\omega_{\\mathrm n}=\\sqrt{\\frac km}$ から $c\\omega_{\\mathrm n}=2\\zeta k$ なので、$\\dfrac{F_0}{k}$ の $\\dfrac{1}{2\\zeta}$ 倍。',
    caution: 'これは $\\omega=\\omega_{\\mathrm n}$ のときだけの形（ほかの $\\omega$ では $k-m\\omega^2$ が残る）。いちばん大きい振幅（山）は少し左の $\\omega_{\\mathrm n}\\sqrt{1-2\\zeta^2}$ でとり、少しだけ大きい。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: 1, boxw: '16mm',
    fits(q) { return /ちょうど \$\\omega=\\omega_\{\\mathrm n\}\$/.test(q); },
    steps: {
      s1(r) {
        const g = gen85(r); if (!g) return null;
        const A = r.pick(['0.1', '0.2', '0.5', '0.25', '0.4', '0.05']), F0 = F.mul(D(A), D(fmt(g.c * g.wn)));
        if (!dec(F0) || (dec(F0).split('.')[1] || '').length > 2) return null;
        return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）を、ちょうど $\\omega=\\omega_{\\mathrm n}$ で、力 $${fx(F0)}\\cos\\omega t$（N）でゆすった。振幅は □ m`, a: `$${A}$`, key: `${g.m},${g.wn},${g.z}`, easyCheck: false,
          easy: `$\\omega_{\\mathrm n}=${g.wn}$。$\\frac{${fx(F0)}}{${fmt(g.c)}\\times${g.wn}}$`, verify: p => near(nums(p.a)[0], ampAt(g.m, g.k, g.c, F.val(F0), g.wn), 2e-3) || '振幅がちがう' };
      },
      // ゆっくりおしたときの何倍か（m・k・c から、ζ から）
      s2(r) {
        if (turn(r, '85s2', 2) === 0) {
          const g = gen85(r); if (!g) return null;
          const R = F.div(fr(1), F.mul(fr(2), D(g.z)));
          return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）を、ちょうど $\\omega=\\omega_{\\mathrm n}$ でゆすった。振幅は、同じ力でゆっくりおし続けたときののび $\\frac{F_0}{k}$ の □ 倍`, a: `$${fx(R)}$`, key: `${g.m},${g.wn},${g.z}`, easyCheck: false,
            easy: `$\\zeta=\\frac{${fmt(g.c)}}{2\\sqrt{${fmt(g.m)}\\times${fmt(g.k)}}}=${g.z}$、$\\frac{1}{2\\zeta}$`, verify: p => near(nums(p.a)[0], g.k / Math.hypot(g.k - g.m * g.wn * g.wn, g.c * g.wn), 1e-9) || '倍率がちがう' };
        }
        const z = r.pick(ZQ.concat(['0.01', '0.04'])), R = F.div(fr(1), F.mul(fr(2), D(z)));
        return { q: `$\\zeta=${z}$ のばね・質量・ダンパーを、ちょうど $\\omega=\\omega_{\\mathrm n}$ でゆすった。振幅は、ゆっくりおし続けたときののび $\\frac{F_0}{k}$ の □ 倍`, a: `$${fx(R)}$`, key: `z${z}`, easyCheck: false,
          easy: `$\\frac{1}{2\\times${z}}$`, verify: p => near(nums(p.a)[0], 1 / Math.hypot(0, 2 * z), 1e-9) || '倍率がちがう' };
      },
      // 見かけがちがう：振幅をおさえる c・はかった倍率から ζ
      s3(r) {
        if (turn(r, '85s3', 2) === 0) {
          const g = gen85(r); if (!g) return null;
          const A = r.pick(['0.1', '0.2', '0.05', '0.5']), F0 = F.mul(D(A), D(fmt(g.c * g.wn)));
          if (!dec(F0) || (dec(F0).split('.')[1] || '').length > 2) return null;
          return { q: `${spring(g.m, g.k)} のばねを、ちょうど $\\omega=\\omega_{\\mathrm n}$ で、力 $${fx(F0)}\\cos\\omega t$（N）でゆする。振幅を $${A}\\,\\mathrm{m}$ 以下にするダンパーの $c$ は、□ $\\mathrm{N\\cdot s/m}$ 以上`, a: `$${fmt(g.c)}$`, key: `${g.m},${g.wn},${g.z}`, easyCheck: false,
            easy: `$\\frac{${fx(F0)}}{c\\times${g.wn}}=${A}$ より $c=\\frac{${fx(F0)}}{${A}\\times${g.wn}}$`, verify: p => near(F.val(F0) / Math.hypot(0, nums(p.a)[0] * g.wn), +A, 1e-9) || 'c がちがう' };
        }
        const R = r.pick([2, 4, 5, 8, 10, 20, 25, 50]), z = F.div(fr(1), fr(2 * R));
        if (!dec(z)) return null;
        return { q: `ばね・質量・ダンパーを、ちょうど $\\omega=\\omega_{\\mathrm n}$ でゆすったら、ゆっくりおし続けたときののび $\\frac{F_0}{k}$ の $${R}$ 倍ゆれた。減衰比 $\\zeta$`, a: `$${dec(z)}$`, key: `R${R}`, easyCheck: false,
          easy: `$\\frac{1}{2\\zeta}=${R}$`, verify: p => near(1 / (2 * nums(p.a)[0]), R, 1e-9) || 'ζ がちがう' };
      },
      // わな：ω=2ωn（ωn ではない。6-82）
      trap(r) {
        const o = r.pick(T85), A = r.pick([0.1, 0.2, 0.5, 0.05]), F0 = +fmt(o.n * o.h * A);
        if (F0 > 60 || !Number.isInteger(F0 * 10)) return null;
        return dest({ q: `ばね・質量・ダンパー（${spring(1, o.n * o.n, o.c)}）を、$\\omega=2\\omega_{\\mathrm n}$ で、力 $${fmt(F0)}\\cos\\omega t$（N）でゆすった。振幅は □ m`, a: `$${fmt(A)}$`, key: `t${o.n},${o.c},${fmt(F0)}`,
          verify: p => near(nums(p.a)[0], ampAt(1, o.n * o.n, o.c, F0, 2 * o.n), 2e-3) || '振幅がちがう' }, '6-85',
          `$\\omega=2\\omega_{\\mathrm n}=${2 * o.n}$ では $k-m\\omega^2=${o.n * o.n}-${4 * o.n * o.n}$ が0にならない。$\\lvert X\\rvert=\\frac{${fmt(F0)}}{\\sqrt{(${-3 * o.n * o.n})^2+${fmt(2 * o.c * o.n)}^2}}$`, ['6-82']);
      },
    },
  });
  // ω=2ωn の分母 √(9n⁴+4c²n²)=n√(9n²+4c²) が整数になる (n, c)（ζ=c/(2n) は 0.75 より小さい）
  const T85 = [];
  for (let n = 2; n <= 10; n++) for (let c2 = 1; c2 <= 30; c2++) { const c = c2 / 2, h2 = 9 * n * n + 4 * c * c, h = Math.round(Math.sqrt(h2)); if (h * h === h2 && c / (2 * n) < 0.75) T85.push({ n, c, h }); }

  // ================================================================ 6-86
  // ω=1/√(LC) がきりのよい数になる (L, C)（10 mH・1 μF は楽な形の例なので出さない。O-2）
  const LCW = [[0.001, 1e-5, 1e4], [0.004, 2.5e-6, 1e4], [0.025, 4e-7, 1e4], [0.04, 2.5e-7, 1e4], [0.1, 1e-7, 1e4], [0.001, 4e-7, 5e4], [0.004, 1e-7, 5e4], [0.001, 1e-7, 1e5],
    [0.01, 4e-6, 5e3], [0.04, 1e-6, 5e3], [0.1, 1e-5, 1e3], [0.1, 1.6e-6, 2500], [0.04, 4e-6, 2500], [1, 1e-6, 1e3], [0.01, 1e-4, 1e3]];
  const pfOf = (L, f, c4) => 1e12 / (c4 * f * f * L);   // 放送を選ぶ C（pF）
  M.add({
    id: '6-86', part: 6, chap: '6-13⑪ 例題7', stars: 1,
    title: 'RLC の共振：$f=\\tfrac{1}{2\\pi\\sqrt{LC}}$、電流は $\\tfrac{V_0}{R}$、放送を選ぶ $C=\\tfrac{1}{(2\\pi f)^2L}$',
    mark: '$L$・$C$・$R$ と交流の電源、「共振周波数」「共振のときの電流」「放送を選ぶ $C$」。',
    futsu: ['電流の大きさ $\\dfrac{V_0}{\\sqrt{R^2+\\bigl(\\omega L-\\frac{1}{\\omega C}\\bigr)^2}}$', 'がいちばん大きい $\\omega$ を、', '分母を微分してさがす'],
    raku: ['$L=10\\,\\mathrm{mH}$、$C=1\\,\\mathrm{\\mu F}$：$\\sqrt{LC}=10^{-4}$', '$f=\\dfrac{10^4}{2\\pi}\\approx1592\\,\\mathrm{Hz}$', '$R=20\\,\\mathrm{\\Omega}$、$V_0=1\\,\\mathrm{V}$ なら $\\dfrac{1}{20}\\,\\mathrm{A}=50\\,\\mathrm{mA}$'],
    why: '電流の大きさは $\\dfrac{V_0}{\\sqrt{R^2+\\bigl(\\omega L-\\frac{1}{\\omega C}\\bigr)^2}}$（6-13⑪）。$R^2$ は $\\omega$ によらないので、もう1つの2乗が0になる $\\omega L=\\dfrac{1}{\\omega C}$、つまり $\\omega=\\dfrac{1}{\\sqrt{LC}}$ でいちばん大きく、そのとき電流は $\\dfrac{V_0}{R}$。$f=\\dfrac{\\omega}{2\\pi}$ を $C$ について解くと $C=\\dfrac{1}{(2\\pi f)^2L}$。',
    caution: 'm（ミリ）は $10^{-3}$、μ（マイクロ）は $10^{-6}$、p（ピコ）は $10^{-12}$。$\\sqrt{LC}$ は、$LC$ を $10^{-\\text{偶数}}$ にしてから。角振動数 $\\omega$（rad/s）と周波数 $f$（Hz）を取りちがえない。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1, boxw: '16mm',
    fits(q) { return /共振|放送/.test(q) && !/Q 値|半値幅/.test(q) && (!!rlcOf(q) || /コイル/.test(q)); },
    steps: {
      // 共振の角振動数・共振のときの電流
      s1(r) {
        if (turn(r, '86s1', 2) === 0) {
          const [L, C, w] = r.pick(LCW);
          return { q: `${rlc(L, C)} の RLC 回路の、共振の角振動数 $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${w}$`, key: `${L},${C}`, easyCheck: false,
            easy: `$LC=${pow10(L * C)}$、$\\sqrt{LC}=${pow10(1 / w)}$`, verify: p => near(nums(p.a)[0] * nums(p.a)[0] * L * C, 1, 1e-9) || 'ωL=1/(ωC) にならない' };
        }
        const [L, C] = r.pick(LCW), V = r.pick([1, 2, 5, 10]), R = r.pick([5, 10, 20, 40, 50, 100]), I = F.make(V, R);
        if ((V === 1 && R === 20) || !dec(I)) return null;
        return { q: `${rlc(L, C, R)} の回路に、$V_0=${V}\\,\\mathrm{V}$ の交流をつなぐ。共振のときの電流（いちばん大きい値）は □ A`, a: `$${dec(I)}$`, key: `${L},${C},${V},${R}`, easyCheck: false,
          easy: `$\\frac{V_0}{R}=\\frac{${V}}{${R}}$`, verify: p => { const w = 1 / Math.sqrt(L * C); return near(nums(p.a)[0], V / Math.hypot(R, w * L - 1 / (w * C)), 1e-9) || '電流がちがう'; } };
      },
      // 共振周波数（2π=6.28、整数で）
      s2(r) {
        const [L, C, w] = r.pick(LCW), f = agree(F.div(fr(w), D('6.28')), w / (2 * Math.PI), 0);
        if (f == null) return null;
        return { q: `${rlc(L, C)} の RLC 回路の共振周波数 $f\\approx□\\,\\mathrm{Hz}$（$2\\pi=6.28$ として、整数で）`, a: `$${f}$`, key: `${L},${C}`, easyCheck: false,
          easy: `$\\sqrt{LC}=${pow10(1 / w)}$、$\\frac{1}{6.28\\times${pow10(1 / w)}}$`, verify: p => Math.abs(nums(p.a)[0] - 1 / (2 * Math.PI * Math.sqrt(L * C))) < 0.6 || '周波数がちがう' };
      },
      // 見かけがちがう：放送を選ぶ C（4π²=39.48）・C を変えると周波数は何倍
      s3(r) {
        if (turn(r, '86s3', 2) === 0) {
          const L = r.pick([100, 200, 250, 400, 500]) * 1e-6, fk = r.pick([500, 600, 800, 1000, 1200, 1500]), f = fk * 1e3;
          if (L === 2e-4 && fk === 1000) return null;   // 教科書の例（200 μH・1 MHz）
          const a = Math.round(pfOf(L, f, 39.48)), t = Math.round(pfOf(L, f, 4 * Math.PI * Math.PI)), fr0 = pfOf(L, f, 39.48) % 1;
          if (a !== t || Math.abs(fr0 - 0.5) < 0.02 || a < 20 || a > 2000) return null;
          return { q: `$L=${fmt(L * 1e6)}\\,\\mathrm{\\mu H}$ のコイルで、$${fk}\\,\\mathrm{kHz}$ の放送を選ぶ（共振させる）コンデンサーの $C\\approx□\\,\\mathrm{pF}$（$4\\pi^2=39.48$ として、整数で）`, a: `$${a}$`, key: `${L},${fk}`, easyCheck: false, boxw: '18mm',
            easy: `$C=\\frac{1}{(2\\pi f)^2L}=\\frac{1}{39.48\\times(${fk}\\times10^{3})^2\\times${fmt(L * 1e6)}\\times10^{-6}}$`, verify: p => Math.abs(nums(p.a)[0] - 1e12 / ((2 * Math.PI * f) ** 2 * L)) < 0.6 || 'C がちがう' };
        }
        const n = r.pick([4, 9, 16, 0.25]), up = r.chance(0.5);
        const ratio = F.div(fr(1), D(fmt(Math.sqrt(n))));
        if (up) return { q: `RLC 回路の $C$ を $${fmt(n)}$ 倍にすると、共振周波数は □ 倍`, a: `$${fx(ratio)}$`, key: `n${n}`, easyCheck: false,
          easy: `$f$ は $\\sqrt{C}$ に反比例。$\\frac{1}{\\sqrt{${fmt(n)}}}$`, verify: p => near(nums(p.a)[0], 1 / Math.sqrt(n), 1e-9) || '倍率がちがう' };
        const m = Math.sqrt(n), Cn = F.div(fr(1), D(fmt(n)));
        return { q: `共振周波数を $${fmt(m)}$ 倍にするには、RLC 回路の $C$ を □ 倍にする（$L$ は同じ）`, a: `$${fx(Cn)}$`, key: `f${n}`, easyCheck: false,
          easy: `$f$ は $\\sqrt{C}$ に反比例。$C$ は $\\frac{1}{${fmt(m)}^2}$ 倍`, verify: p => near(1 / Math.sqrt(nums(p.a)[0]), m, 1e-9) || '倍率がちがう' };
      },
      // わな：減衰比（6-44。第3部）
      trap(r) {
        const [L, C] = r.pick(LCW), z = r.pick(['0.1', '0.2', '0.5', '0.05']), R = 2 * +z * Math.sqrt(L / C);
        if (!dec(D(fmt(R)))) return null;
        return dest({ q: `RLC 回路（${rlc(L, C, R)}）の減衰比 $\\zeta$`, a: `$${z}$`, key: `t${L},${C},${z}`,
          verify: p => near(nums(p.a)[0], R / (2 * Math.sqrt(L / C)), 1e-9) || 'ζ がちがう' }, '6-86',
          `共振ではなく、ゆれのおさまり方の数。$\\zeta=\\frac R2\\sqrt{\\frac CL}$`, ['6-44']);
      },
    },
  });

  // ================================================================ 6-87〜6-89・6-97・6-98 の部品（連立微分方程式）
  // 連立の1回微分の式 y'=f(t, y)（y は配列）を、ルンゲ・クッタ法でたどる。時刻の配列 ts（小さい順）での y を返す（検算用。問題を作る式とは別の道すじ）
  function rkSys(f, y0, ts, h) {
    let t = 0, y = y0.slice(); const out = [];
    const add = (a, b, s) => a.map((v, i) => v + s * b[i]);
    for (const T of ts) {
      for (let n = 0; t < T - 1e-12 && n < 200000; n++) {
        const hh = Math.min(h, T - t), k1 = f(t, y), k2 = f(t + hh / 2, add(y, k1, hh / 2)), k3 = f(t + hh / 2, add(y, k2, hh / 2)), k4 = f(t + hh, add(y, k3, hh));
        y = y.map((v, i) => v + hh / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])); t += hh;
      }
      out.push(y.slice());
    }
    return out;
  }
  // 答えの式（t の式）が、連立の式を数でたどった値（i 番めの量）と合うか。T は時間の物さし
  function sysIs(p, f, y0, i, T, what) {
    const ts = [0, 0.37, 0.83, 1.29, 2.6].map(u => u * T), ys = rkSys(f, y0, ts, T / 2000), sc = Math.max(...y0.map(Math.abs), 1e-9);
    for (let k = 0; k < ts.length; k++) {
      const v = ev(strip(p.a), { t: ts[k] });
      if (!(v != null && Math.abs(v - ys[k][i]) < 1e-6 * sc)) return `${what || '答え'}が t=${fmt(ts[k])} で ${ys[k][i]} にならない（${v}）`;
    }
    return true;
  }
  // 数でたどった答えの、いちばん大きい所（時刻と値）
  function sysMax(f, y0, i, T) {
    const n = 3000, ts = Array.from({ length: n + 1 }, (_, k) => 6 * T * k / n), ys = rkSys(f, y0, ts, T / 500);
    let b = 0; for (let k = 1; k <= n; k++) if (ys[k][i] > ys[b][i]) b = k;
    const a = ys[b - 1][i], c = ys[b][i], d = ys[b + 1][i], den = a - 2 * c + d, s = den ? (a - d) / (2 * den) : 0;
    return { t: ts[b] + s * 6 * T / n, v: c - (a - d) ** 2 / (8 * den || 1) };
  }
  const decs = f => ((dec(f) || '').split('.')[1] || '').length;   // 小数のけたの数
  const par = f => (F.val(f) < 0 ? `(${fx(f)})` : fx(f));
  const mx = f => `$${fx(f)}$`;   // 表のセル（負の数をマイナスの記号で）

  // ---------------------------------------------------------------- 同じ形の2つの水そう（6-87・6-88）
  const tankEqs = a => `$\\dot h_1=-${a}(h_1-h_2)$、$\\dot h_2=${a}(h_1-h_2)$`;   // 1行に入るように、$\\dot h$ で書く（教科書 6-14⑦と同じ）
  const tankF = a => (t, y) => [-a * (y[0] - y[1]), a * (y[0] - y[1])];
  // a：管のルールの数、dt：Δt。2a dt ≦ 0.5（1歩で差が半分より小さくならない）
  function genTank(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 40; t++) {
      const a = r.pick(['0.1', '0.2', '0.05', '0.25', '0.5', '0.4']), dt = opt.dt || r.pick(['0.5', '1', '2', '0.5']);
      const h1 = r.pick([20, 24, 30, 36, 40, 45, 50, 60]), h2 = r.pick([0, 0, 4, 5, 10, 12, 15]);
      if (+a * +dt > 0.25 + 1e-9 || h2 >= h1) continue;
      if ((a === '0.2' && h1 === 30 && h2 === 10) || (a === '0.05' && h1 === 40 && h2 === 0)) continue;   // 楽な形の例・教科書の例（6-14 例題1・3。O-2）
      return { a, dt, h1, h2, S: h1 + h2, D: h1 - h2, key: `${a},${h1},${h2}` };
    }
    return null;
  }
  // オイラー法で n 歩（分数で正確に）：差は1歩ごとに (1-2aΔt) 倍、合計は変わらない…とはせず、表のとおり1行ずつ
  function eulTank(g, n) {
    let h1 = fr(g.h1), h2 = fr(g.h2); const rows = [[h1, h2]];
    for (let k = 0; k < n; k++) { const chg = F.mul(F.mul(D(g.a), F.sub(h1, h2)), D(g.dt)); h1 = F.sub(h1, chg); h2 = F.add(h2, chg); rows.push([h1, h2]); }
    return rows;
  }
  // 検算：合計 S は一定、差は (1-2aΔt)^n 倍（1行ずつ計算するのとは別の道すじ）
  const tankClosed = (g, n, i) => { const Dn = g.D * (1 - 2 * g.a * g.dt) ** n; return i === 0 ? (g.S + Dn) / 2 : (g.S - Dn) / 2; };
  // ばね（速度を先に進めるオイラー法）：ẍ=-Kx-bẋ。x0 から、v0=0
  function eulSpring(K, b, x0, dt, n) {
    let x = D(x0), v = fr(0); const rows = [];
    for (let k = 0; k <= n; k++) {
      const a = F.sub(F.mul(fr(-K), x), F.mul(D(b), v)); rows.push([x, v, a]);
      v = F.add(v, F.mul(a, D(dt))); x = F.add(x, F.mul(v, D(dt)));
    }
    return rows;
  }
  const SP87 = [[16, '0.8'], [9, '0.2'], [25, '1'], [16, '0.4'], [4, '0.4'], [36, '1.2'], [100, '2'], [25, '0.6']];   // ẍ=-Kx-bẋ の K・b

  // ================================================================ 6-87
  M.add({
    id: '6-87', part: 6, chap: '6-14③④ 例題1・2', stars: 1,
    title: '連立のオイラー法：全部の列を「今の行」の値で進める。2回微分の式は $\\dot x=v$、$\\dot v=\\cdots$ に',
    mark: 'つながった2つの水そう（2つの量のルール）と「$\\Delta t=\\square$ のオイラー法」。2回微分の式を「1回微分の式2つ」に。',
    futsu: ['$h_1$ の式 $30+\\bigl(-0.2\\times(30-10)\\bigr)\\times0.5$ と', '$h_2$ の式 $10+0.2\\times(30-10)\\times0.5$ を', '1つずつ別に計算する'],
    raku: ['$-0.2(h_1-h_2)$、$30$・$10$、$\\Delta t=0.5$', '差 $20$ → 変わる量 $0.2\\times20\\times0.5=2$', '$h_1=30-2=28$、$h_2=10+2=12$（合計40のまま）', '次は差16、変わる量1.6 → $26.4$、$13.6$'],
    why: '左から出ていった水が、そのまま右に入るので、2つの水位の「変わる量」は大きさが同じで向きが反対（6-14①）。だから今の行の差から変わる量を1回だけ計算して、片方からひき、もう片方にたせばよい。合計が変わらないことで、計算を確かめられる（6-14③）。2回微分の式は、$\\dot x=v$、$\\dot v=\\ddot x$ と置くと、1回微分の式2つの組になる（6-14④）。',
    caution: '片方を先に新しくして、その新しい値でもう片方を計算しない（合計が変わってしまう）。ばねの表は、加速度→速度→位置（新しい速度で）の順（6-2）。',
    counts: { s1: 3, s2: 3, s3: 1, trap: 2 },
    cols: 1, boxw: { s1: '16mm', s2: '20mm', s3: '18mm', trap: '20mm' },
    fits(q) { return /オイラー法|1回微分の式2つ|\\dot v=□/.test(q); },
    steps: {
      // 1歩（Δt 後の h1 か h2）
      s1(r) {
        const g = genTank(r); if (!g) return null;
        const i = turn(r, '87s1', 2), rows = eulTank(g, 1), ans = rows[1][i], chg = F.sub(fr(g.h1), rows[1][0]);
        if (!dec(ans) || decs(ans) > 3) return null;
        return { q: `${tankEqs(g.a)}（cm、分）で、はじめ $h_1=${g.h1}$、$h_2=${g.h2}$。$\\Delta t=${g.dt}$ 分のオイラー法で、$${g.dt}$ 分後の $h_${i + 1}=□\\,\\mathrm{cm}$`, a: `$${fx(ans)}$`, key: `${g.key}|${g.dt}`, easyCheck: false,
          easy: `差 $${g.D}$、変わる量 $${g.a}\\times${g.D}\\times${g.dt}=${fx(chg)}$`, verify: p => valIs(p, tankClosed(g, 1, i)) };
      },
      // 2歩・2回微分の式を1回微分の式2つに・ばねの1行め
      s2(r) {
        const kind = turn(r, '87s2', 3);
        if (kind === 0) {
          const g = genTank(r); if (!g) return null;
          const i = r.int(0, 1), rows = eulTank(g, 2), ans = rows[2][i], D1 = F.sub(rows[1][0], rows[1][1]);
          if (!dec(ans) || decs(ans) > 3) return null;
          return { q: `${tankEqs(g.a)}（cm、分）で、はじめ $h_1=${g.h1}$、$h_2=${g.h2}$。$\\Delta t=${g.dt}$ 分のオイラー法で、2歩進めた $h_${i + 1}=□\\,\\mathrm{cm}$`, a: `$${fx(ans)}$`, key: `${g.key}|${g.dt}`, easyCheck: false,
            easy: `1歩め：$${fx(rows[1][0])}$、$${fx(rows[1][1])}$。2歩め：差 $${fx(D1)}$ で、変わる量 $${fx(F.mul(F.mul(D(g.a), D1), D(g.dt)))}$`, verify: p => valIs(p, tankClosed(g, 2, i)) };
        }
        if (kind === 1) {
          const m = r.pick([0.5, 2, 4]), [K, b] = r.pick(SP87), c = +fmt(m * +b), k = m * K;
          if ((m === 0.5 && K === 16 && b === '0.8') || (m === 1 && K === 9 && b === '0.2')) return null;   // 教科書の例題2・じぶんでとこう2
          const ans = sum([cf(-K, 'x'), cf(fmt(-b), 'v')]);
          return { q: `$${ode(m, c, k)}$ を、$\\dot x=v$ と $\\dot v=□$ の、1回微分の式2つに書きかえる`, a: `$${ans}$`, key: `v${m},${K},${b}`, easyCheck: false,
            easy: `$${m}$ でわって $\\ddot x=${ans.replace('v', '\\dot x')}$。$\\ddot x$ を $\\dot v$、$\\dot x$ を $v$ に`,
            verify: p => [[0.37, -1.3], [-2.1, 0.6]].every(([x, v]) => near(ev(strip(p.a), { x, v }), -(c * v + k * x) / m)) || '式がちがう' };
        }
        const [K, b] = r.pick(SP87), x0 = r.pick(['0.1', '0.2', '0.05', '0.3']), dt = r.pick(['0.1', '0.05']);
        if (K === 16 && x0 === '0.1' && dt === '0.1') return null;   // 教科書の例題2
        const rows = eulSpring(K, b, x0, dt, 1), ans = rows[1][0];
        if (decs(ans) > 5) return null;
        return { q: `$\\ddot x=${sum([cf(-K, 'x'), cf(fmt(-b), '\\dot x')])}$ を、$x=${x0}$、$v=0$ から、$\\Delta t=${dt}$ の「速度を先に進めるオイラー法」で1行進めた位置 $x=□$`, a: `$${fx(ans)}$`, key: `x${K},${b},${x0},${dt}`, easyCheck: false,
          easy: `$a=-${K}\\times${x0}=${fx(rows[0][2])}$、$v=${fx(rows[0][2])}\\times${dt}=${fx(rows[1][1])}$、新しい $v$ で $x=${x0}+${par(rows[1][1])}\\times${dt}$`,
          verify: p => { const h = +dt, a0 = -K * +x0, v1 = a0 * h; return valIs(p, +x0 + v1 * h); } };
      },
      // 見かけがちがう：表（水そう・ダンパーつきのばね）。（ア）に入る数
      s3(r) {
        if (turn(r, '87s3', 2) === 0) {
          const g = genTank(r); if (!g) return null;
          const i = r.int(0, 1), rows = eulTank(g, 2), ans = rows[2][i];
          if (!dec(ans) || decs(ans) > 3 || rows.some(([u, w]) => decs(u) > 3 || decs(w) > 3)) return null;
          const dt = D(g.dt), dif = k => fx(F.sub(rows[k][0], rows[k][1]));
          return { q: `${tankEqs(g.a)}（cm、分）を、$\\Delta t=${g.dt}$ 分のオイラー法で進めた表です。（ア）に入る $h_${i + 1}$ □ cm`, a: `$${fx(ans)}$`, key: `${g.key}|${g.dt}`, easyCheck: false,
            table: { head: ['$t$〔分〕', '$h_1$〔cm〕', '$h_2$〔cm〕', '差'], rows: [['0', String(g.h1), String(g.h2), dif(0)], [fx(dt), fx(rows[1][0]), fx(rows[1][1]), dif(1)], [fx(F.mul(dt, fr(2))), i === 0 ? '（ア）' : '', i === 1 ? '（ア）' : '', '']] },
            easy: `今の行の差 $${dif(1)}$ で、変わる量 $${g.a}\\times${dif(1)}\\times${g.dt}$`, verify: p => valIs(p, tankClosed(g, 2, i)) };
        }
        const [K, b] = r.pick(SP87), x0 = r.pick(['0.1', '0.2', '0.05']), dt = '0.1';
        if (K === 16 && b === '0.8' && x0 === '0.1') return null;   // 教科書の例題2
        const rows = eulSpring(K, b, x0, dt, 2), ans = rows[2][0];
        if (decs(ans) > 6) return null;
        return { q: `$\\ddot x=${sum([cf(-K, 'x'), cf(fmt(-b), '\\dot x')])}$ を、速度を先に進めるオイラー法（$\\Delta t=${dt}$）で進めた表です。（ア）に入る位置 □ m`, a: `$${fx(ans)}$`, key: `x${K},${b},${x0},${dt}`, easyCheck: false,
          table: { head: ['$t$〔s〕', '$x$〔m〕', '$v$〔m/s〕', '$a$〔m/s$^2$〕'], rows: [['0', x0, '0', mx(rows[0][2])], [dt, fx(rows[1][0]), mx(rows[1][1]), mx(rows[1][2])], ['0.2', '（ア）', '', '']] },   // 負の数は $…$ に（マイナスの記号で）
          easy: `$v=${fx(rows[1][1])}+${par(rows[1][2])}\\times${dt}=${fx(rows[2][1])}$、新しい $v$ で $x=${fx(rows[1][0])}+${par(rows[2][1])}\\times${dt}$`,
          verify: p => { let x = +x0, v = 0; for (let n = 0; n < 2; n++) { v += (-K * x - +b * v) * +dt; x += v * +dt; } return valIs(p, x, 1e-7); } };
      },
      // わな：差が □ cm になる時刻（オイラー法ではなく、和と差で解く。6-88）
      trap(r) {
        const g = genTank(r); if (!g || g.D % 4) return null;
        const q4 = r.chance(0.5), cof = F.div(fr(q4 ? 2 : 1), F.mul(fr(2), D(g.a)));   // 差が 1/2（または 1/4）になる時刻 = ln2/(2a)（ln4/(2a)）
        return dest({ q: `${tankEqs(g.a)}（cm、分）で、はじめ $h_1=${g.h1}$、$h_2=${g.h2}$。2つの水位の差が $${q4 ? g.D / 4 : g.D / 2}\\,\\mathrm{cm}$ になる時刻（分。$\\ln$ を残した形で）`, a: `$${cf(cof, '\\ln2')}$`, key: `t${g.key},${q4}`,
          verify: p => { const T = nums(p.a)[0], y = rkSys(tankF(+g.a), [g.h1, g.h2], [T], T / 2000)[0]; return near(y[0] - y[1], g.D / (q4 ? 4 : 2), 1e-7) || '差がちがう'; } }, '6-87',
          'オイラー法の近似ではなく、ちょうどの時刻を聞いている。2つの式をひくと差は $' + ex(F.mul(D(g.a), fr(-2)), { dec: true }) + '$ 倍にへる（和と差に分ける）');
      },
    },
  });

  // ================================================================ 6-88
  // 熱：C1=u p、C2=u q（J/K）、R（K/W）。電気：C1・C2（μF）、R（kΩ）
  function genHeat(r) {
    for (let t = 0; t < 60; t++) {
      const u = r.pick([420, 840, 210]), p = r.int(1, 5), q = r.int(1, 6), R = r.pick(['0.5', '1', '2', '0.25', '1.5']);
      const T1 = r.pick([60, 70, 80, 90, 95, 75]), T2 = r.pick([5, 10, 15, 20, 25]);
      const Tf = F.make(p * T1 + q * T2, p + q), tau = F.mul(D(R), F.make(u * p * q, p + q));
      if (Tf[1] !== 1 || tau[1] !== 1 || tau[0] > 3000 || p === q) continue;
      const C1 = u * p, C2 = u * q;
      if ((C1 === 840 && C2 === 2520) || (C1 === 420 && C2 === 1260 && T1 === 90 && T2 === 10)) continue;   // 教科書の例題4（目録の楽な形の例）・じぶんでとこう4
      return { heat: true, C1, C2, X1: T1, X2: T2, R, Xf: Tf[0], tau, w1: F.make(q, p + q), w2: F.make(p, p + q), Rv: +R,
        txt: `${T1}℃のお湯（熱容量 $C_1=${C1}\\,\\mathrm{J/K}$）を入れた金属のコップを、${T2}℃の水（$C_2=${C2}\\,\\mathrm{J/K}$）にひたす。熱抵抗は $R_{\\mathrm{th}}=${R}\\,\\mathrm{K/W}$ で、外へ熱は逃げない。`,
        key: `h${C1},${C2},${T1},${T2},${R}` };
    }
    return null;
  }
  function genCap(r) {
    for (let t = 0; t < 60; t++) {
      const C1 = r.pick([50, 100, 200, 300, 400, 600]), C2 = r.pick([50, 100, 200, 300, 400, 600]), V1 = r.pick([5, 6, 9, 10, 12]), V2 = r.pick([0, 0, 0, 2, 3]), R = r.pick([1, 2, 5, 10, 15, 20]);
      const Vf = F.make(C1 * V1 + C2 * V2, C1 + C2), tau = F.div(F.make(R * C1 * C2, C1 + C2), fr(1000));
      if (!dec(Vf) || decs(Vf) > 1 || !dec(tau) || decs(tau) > 2 || V1 === V2) continue;
      if ((C1 === 100 && C2 === 400 && V1 === 10 && R === 10) || (C1 === 200 && C2 === 100 && V1 === 9 && R === 15) || (C1 === 100 && C2 === 100 && V1 === 10 && R === 20)) continue;   // 教科書の例
      return { heat: false, C1: C1 * 1e-6, C2: C2 * 1e-6, X1: V1, X2: V2, Xf: fx(Vf), Xff: Vf, tau, w1: F.make(C2, C1 + C2), w2: F.make(C1, C1 + C2), Rv: R * 1e3,
        txt: `$${V1}\\,\\mathrm{V}$ に充電した $C_1=${C1}\\,\\mathrm{\\mu F}$ のコンデンサーと、${V2 ? `$${V2}\\,\\mathrm{V}$ の` : '空の'} $C_2=${C2}\\,\\mathrm{\\mu F}$ のコンデンサーを、$R=${R}\\,\\mathrm{k\\Omega}$ の抵抗でつなぐ。`,
        key: `c${C1},${C2},${V1},${V2},${R}` };
    }
    return null;
  }
  const capF = g => (t, y) => { const P = (y[0] - y[1]) / g.Rv; return [-P / g.C1, P / g.C2]; };
  // e^{-t/τ}（τ が1なら e^{-t}）
  const exTau = tau => (F.val(tau) === 1 ? 'e^{-t}' : `e^{-t/${fx(tau)}}`);
  const tankSym = q => { const m = /=-([\d.]+)\(h_1-h_2\)/.exec(q); return !!(m && q.includes(`=${m[1]}(h_1-h_2)`)); };
  M.add({
    id: '6-88', part: 6, chap: '6-14⑤⑧ 例題3・4・5', stars: 1,
    title: '和と差に分ける：（重みつきの）和は一定、差は $e^{-t/\\tau}$ でへる',
    mark: '同じ形の2つの水そう、お湯と水、2つのコンデンサーをつなぐ、「$t$ の式」「最後の値」「時定数」。',
    futsu: ['消去法で $h_1$ だけの2回微分の式を作り、', '特性方程式 $s(s+0.4)=0$ から $h_1=A+Be^{-0.4t}$、', 'はじめの値と変わる速さで $A$、$B$ を決める'],
    raku: ['$-0.2(h_1-h_2)$、はじめ $30$・$10$', 'たす：和 $40$ は一定。ひく：差は $20e^{-0.4t}$', '$h_1=\\dfrac{40+20e^{-0.4t}}{2}=20+10e^{-0.4t}$', '熱：最後は $\\dfrac{C_1T_1+C_2T_2}{C_1+C_2}$'],
    why: '2つの式をたすと右辺が打ち消しあうので、和（大きさがちがえば、底面積・熱容量・静電容量をかけた重みつきの和）は一定（6-14⑤）。ひくと差だけの式 $\\dfrac{\\dd D}{\\dd t}=-\\dfrac{D}{\\tau}$ になり、6-4 の形でへる。熱と電気は $\\dfrac1\\tau=\\dfrac1R\\Bigl(\\dfrac1{C_1}+\\dfrac1{C_2}\\Bigr)$（6-14⑧）。最後は2つがそろうので、重みつきの和を重みの合計でわった値。',
    caution: '差 $D$ のまま答えない（最後に $h_1=\\dfrac{S+D}{2}$ にもどす）。大きさのちがう水そう・熱・電気では、ただの和ではなく、重みつきの和が一定（最後は単純な平均ではない）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '34mm', s2: '16mm', s3: '40mm', trap: '30mm' },
    fits(q) {
      if (/オイラー法/.test(q)) return false;
      if (tankSym(q)) return true;
      return /ひたす|抵抗でつなぐ/.test(q) && /最後|時定数|の式/.test(q);
    },
    steps: {
      // 同じ形の水そう：h1・h2 の式
      s1(r) {
        const g = genTank(r); if (!g) return null;
        const i = turn(r, '88s1', 2), E = ex(F.mul(D(g.a), fr(-2)), { dec: true }), ans = sum([fx(F.make(g.S, 2)), cf(F.make(i ? -g.D : g.D, 2), E)]);
        return { q: `${tankEqs(g.a)}（cm、分）で、はじめ $h_1=${g.h1}$、$h_2=${g.h2}$。$h_${i + 1}$ を $t$ の式で`, a: `$${ans}$`, key: g.key, easyCheck: false,
          easy: `和 $${g.S}$ は一定、差は $${g.D}${E}$。$h_${i + 1}=\\frac{${g.S}${i ? '-' : '+'}${g.D}${E}}{2}$`, verify: p => sysIs(p, tankF(+g.a), [g.h1, g.h2], i, 1 / g.a) };
      },
      // 熱・電気：最後の値と時定数
      s2(r) {
        const g = turn(r, '88s2g', 2) === 0 ? genHeat(r) : genCap(r); if (!g) return null;
        const f = g.heat ? (t, y) => { const P = (y[0] - y[1]) / g.Rv; return [-P / g.C1, P / g.C2]; } : capF(g), T = F.val(g.tau);
        if (turn(r, '88s2k', 2) === 0) {
          return { q: g.txt + `最後の${g.heat ? '温度 □ ℃' : '電圧 □ V'}`, a: `$${g.heat ? g.Xf : g.Xf}$`, key: g.key, easyCheck: false,
            easy: g.heat ? `$\\frac{${g.C1}\\times${g.X1}+${g.C2}\\times${g.X2}}{${g.C1}+${g.C2}}$` : `電気の量 $C_1V_1+C_2V_2$ は一定。$\\frac{${fmt(g.C1 * 1e6)}\\times${g.X1}+${fmt(g.C2 * 1e6)}\\times${g.X2}}{${fmt(g.C1 * 1e6)}+${fmt(g.C2 * 1e6)}}$`,
            verify: p => { const y = rkSys(f, [g.X1, g.X2], [30 * T], T / 200)[0]; return (near(y[0], nums(p.a)[0], 1e-6) && near(y[1], nums(p.a)[0], 1e-6)) || `最後は ${y[0]} のはず`; } };
        }
        return { q: g.txt + `2つの${g.heat ? '温度' : '電圧'}の差がへるときの時定数 $\\tau=□\\,\\mathrm{s}$`, a: `$${fx(g.tau)}$`, key: g.key, easyCheck: false,
          easy: g.heat ? `$\\frac1\\tau=\\frac{1}{${g.R}}\\Bigl(\\frac{1}{${g.C1}}+\\frac{1}{${g.C2}}\\Bigr)$` : `$\\tau=R\\times\\frac{C_1C_2}{C_1+C_2}=${fmt(g.Rv / 1e3)}\\times10^{3}\\times\\frac{${fmt(g.C1 * 1e6)}\\times${fmt(g.C2 * 1e6)}}{${fmt((g.C1 + g.C2) * 1e6)}}\\times10^{-6}$`,
          verify: p => { const Tq = nums(p.a)[0], y = rkSys(f, [g.X1, g.X2], [Tq], Tq / 2000)[0]; return near((y[0] - y[1]) / (g.X1 - g.X2), Math.exp(-1), 1e-7) || '時定数がたっても差が e^{-1} 倍にならない'; } };
      },
      // 見かけがちがう：重みつき（熱・電気）の T1・T2・V1・V2 の式
      s3(r) {
        const g = turn(r, '88s3', 2) === 0 ? genHeat(r) : genCap(r); if (!g) return null;
        const i = r.int(0, 1), D0 = g.X1 - g.X2, cof = F.mul(i ? g.w2 : g.w1, fr(i ? -D0 : D0));
        if (!dec(cof) || decs(cof) > 2) return null;
        const E = exTau(g.tau), Xf = g.heat ? String(g.Xf) : g.Xf, nm = g.heat ? 'T' : 'V';
        const ans = sum([Xf, cf(cof, E)]), f = g.heat ? (t, y) => { const P = (y[0] - y[1]) / g.Rv; return [-P / g.C1, P / g.C2]; } : capF(g);
        return { q: g.txt + `$${nm}_${i + 1}$ を $t$ の式で（$t$ は秒）`, a: `$${ans}$`, key: g.key, easyCheck: false, boxh: '9mm',
          easy: `最後 $${Xf}$、$\\tau=${fx(g.tau)}$、差 $${D0}${E}$。$${nm}_${i + 1}=${Xf}${i ? '-' : '+'}\\frac{C_${i ? 1 : 2}}{C_1+C_2}\\times${D0}${E}$`,
          verify: p => sysIs(p, f, [g.X1, g.X2], i, F.val(g.tau)) };
      },
      // わな：直列の水そう（和が一定でない。消去法。6-97）
      trap(r) {
        const g = gen97(r); if (!g) return null;
        return dest({ q: `${eqs97(g.tau)}（cm、分）で、はじめ $h_1=${g.h0}$、$h_2=0$。$h_2$ を $t$ の式で`, a: `$${g.ans}$`, key: `t${g.key}`,
          verify: p => sysIs(p, f97(g.tau), [g.h0, 0], 1, g.tau) }, '6-88',
          '上から下へ流れ落ちるだけで、下からも外へ出ていく。2つの式をたしても右辺が0にならない（和は一定でない）。消去法で1つの式に');
      },
    },
  });

  // ================================================================ 6-89
  // 同じ台車2つ（質量 m）、外側のばね k、つなぎのばね K：ω1²=k/m、ω2²=(k+2K)/m
  function gen89(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 60; t++) {
      const m = r.pick([1, 1, 2, 0.5, 4]), w1 = r.int(2, 10);
      const N = opt.int ? r.int(w1 + 1, w1 + 6) ** 2 : w1 * w1 + r.int(2, 60), k = m * w1 * w1, K = +fmt(m * (N - w1 * w1) / 2);
      if (!Number.isInteger(K) || K > 600 || k > 600 || K < 1) continue;   // つなぎのばねは整数（N/m）
      if ((m === 2 && k === 200 && K === 100) || (m === 1 && k === 16 && K === 10) || (m === 1 && k === 100 && (K === 10 || K === 100))) continue;   // 教科書の例
      return { m, k, K, w1, N, w2: Math.round(Math.sqrt(N)), txt: `台車2つ（各 $m=${fmt(m)}\\,\\mathrm{kg}$）を、外側のばね2本（$k=${fmt(k)}\\,\\mathrm{N/m}$）とつなぎのばね（$K=${fmt(K)}\\,\\mathrm{N/m}$）でつなぐ。`, key: `${m},${k},${K}` };
    }
    return null;
  }
  const f89 = (m, k, K, m2) => (t, y) => [y[2], y[3], (-k * y[0] + K * (y[1] - y[0])) / m, (-k * y[1] - K * (y[1] - y[0])) / (m2 || m)];
  // x1（i=0）か x2（i=1）の式。X1・X2 は分数（はじめの位置、静かにはなす）
  function modeAns(g, X1, X2, i) {
    const u = F.div(F.add(X1, X2), fr(2)), w = F.div(F.sub(X1, X2), fr(2));
    return sum([cf(u, trig('cos', g.w1)), cf(i ? F.mul(w, fr(-1)) : w, trig('cos', g.w2))]);
  }
  // 質量がちがう台車（和と差に分かれない。わな）：ω が整数になる組
  const T89 = [];
  [[2, 3, 24, 6], [3, 2, 24, 6], [2, 3, 96, 24], [3, 2, 96, 24]].forEach(([a, b, k, K]) => [0.5, 1, 2].forEach(s => T89.push([a * s, b * s, k * s, K * s])));
  M.add({
    id: '6-89', part: 6, chap: '6-14⑥ 例題6', stars: 1,
    title: '振動モード：いっしょ $\\sqrt{k/m}$、反対 $\\sqrt{(k+2K)/m}$。$x_1=\\tfrac{u+w}{2}$、$x_2=\\tfrac{u-w}{2}$',
    mark: '同じ台車2つ・外側のばね2本・つなぎのばね、「モードの角振動数」「$x_1$、$x_2$ の式」。',
    futsu: ['2つの運動方程式を4つの列（$x_1$、$x_2$、$v_1$、$v_2$）の', '表計算で進め、グラフから', 'ゆれの周期を読む'],
    raku: ['$2\\,\\mathrm{kg}$・$k=200$・$K=100$', '$\\omega_1=\\sqrt{100}=10$、$\\omega_2=\\sqrt{\\dfrac{400}{2}}=\\sqrt{200}$', 'はじめ $0.05$・$0.01$ → $u=0.06\\cos10t$、$w=0.04\\cos\\sqrt{200}\\,t$', '$x_1=0.03\\cos10t+0.02\\cos\\sqrt{200}\\,t$'],
    why: '2つの運動方程式をたすと、つなぎのばねの力が打ち消しあって $m\\ddot u=-ku$（$u=x_1+x_2$）。ひくと $m\\ddot w=-(k+2K)w$（$w=x_1-x_2$）。どちらも6-6の形なので、静かにはなせば $u=u_0\\cos\\omega_1t$、$w=w_0\\cos\\omega_2t$（6-14⑥）。加減法で $x_1=\\dfrac{u+w}{2}$、$x_2=\\dfrac{u-w}{2}$ にもどす。',
    caution: '$\\omega_1+\\omega_2$ のような角振動数のたし算はしない（たすのは $\\cos$ の式）。つなぎのばねは反対に動くとき2倍のびちぢみするので $k+2K$（$k+K$ ではない）。$x_2$ は $\\dfrac{u-w}{2}$（$w$ の項の符号が反対）。',
    counts: { s1: 2, s2: 2, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '18mm', s2: '48mm', s3: '40mm', trap: '16mm' },
    fits(q) { return /つなぎのばね/.test(q) && !/m_1/.test(q); },
    steps: {
      // モードの角振動数（反対に動くほうは √ を残した形）
      s1(r) {
        const g = gen89(r); if (!g) return null;
        const two = turn(r, '89s1', 3) > 0;
        return { q: g.txt + (two ? `2次モード（反対に動く）の角振動数 $\\omega_2=□\\,\\mathrm{rad/s}$` : `1次モード（いっしょに動く）の角振動数 $\\omega_1=□\\,\\mathrm{rad/s}$`), a: `$${two ? sqrtTeX(g.N) : g.w1}$`, key: g.key, easyCheck: false,
          easy: two ? `$\\sqrt{\\frac{${fmt(g.k)}+2\\times${fmt(g.K)}}{${fmt(g.m)}}}=\\sqrt{${g.N}}$` : `$\\sqrt{\\frac{${fmt(g.k)}}{${fmt(g.m)}}}$`,
          verify: p => { const w = ev(strip(p.a)), M2 = [[g.k + g.K - g.m * w * w, -g.K], [-g.K, g.k + g.K - g.m * w * w]]; return (near(M2[0][0] * M2[1][1] - M2[0][1] * M2[1][0], 0, 1e-9) && (two ? w > g.w1 + 1e-9 : w < Math.sqrt(g.N) - 1e-9)) || 'モードの角振動数でない'; } };
      },
      // 2つともずらして静かにはなす：x1・x2 の式
      s2(r) {
        const g = gen89(r, { int: true }); if (!g) return null;
        const X1 = D(r.pick(['0.05', '0.04', '0.03', '0.08', '0.1', '0.06'])), X2 = D(r.pick(['0.01', '0.02', '-0.02', '0.04', '-0.04', '0.06'])), i = turn(r, '89s2', 2);
        if (F.val(X1) === F.val(X2) || F.val(X1) === -F.val(X2)) return null;
        return { q: g.txt + `$x_1=${fx(X1)}$、$x_2=${fx(X2)}$（m）だけずらして、静かにはなした。$x_${i + 1}$（m）を $t$ の式で`, a: `$${modeAns(g, X1, X2, i)}$`, key: `${g.key}|${fx(X1)},${fx(X2)}`, easyCheck: false,
          easy: `$\\omega_1=${g.w1}$、$\\omega_2=${g.w2}$。$u=${fx(F.add(X1, X2))}${trig('cos', g.w1)}$、$w=${fx(F.sub(X1, X2))}${trig('cos', g.w2)}$。$x_${i + 1}=\\frac{u${i ? '-' : '+'}w}{2}$`,
          verify: p => sysIs(p, f89(g.m, g.k, g.K), [F.val(X1), F.val(X2), 0, 0], i, 1 / g.w1) };
      },
      // 見かけがちがう：1つだけずらす・いっしょ・反対（モード1つだけ）
      s3(r) {
        const g = gen89(r, { int: true }); if (!g) return null;
        const kind = turn(r, '89s3', 3), X = D(r.pick(['0.1', '0.05', '0.06', '0.04', '0.2'])), mX = F.mul(X, fr(-1));
        const [X1, X2, i, txt] = kind === 0 ? [X, fr(0), 1, `台車1だけを $${fx(X)}\\,\\mathrm{m}$ 引いて、2つとも静かにはなした。$x_2$（m）を $t$ の式で`]
          : kind === 1 ? [X, X, 0, `2つを同じ向きに $${fx(X)}\\,\\mathrm{m}$ ずつずらして、静かにはなした。$x_1$（m）を $t$ の式で`]
            : [X, mX, 1, `2つを反対向きに $${fx(X)}\\,\\mathrm{m}$ ずつ（$x_2=${fx(mX)}$）ずらして、静かにはなした。$x_2$（m）を $t$ の式で`];
        return { q: g.txt + txt, a: `$${modeAns(g, X1, X2, i)}$`, key: `${g.key}|${fx(X1)},${fx(X2)}`, easyCheck: false,
          easy: kind === 0 ? `$u=w=${fx(X)}$ を大きさとする $\\cos$。$x_2=\\frac{u-w}{2}$` : kind === 1 ? '差 $w$ はずっと0。1次モードだけ' : '和 $u$ はずっと0。2次モードだけ',
          verify: p => sysIs(p, f89(g.m, g.k, g.K), [F.val(X1), F.val(X2), 0, 0], i, 1 / g.w1) };
      },
      // わな：質量がちがう台車（和と差に分かれない。楽な形なし）
      trap(r) {
        const [m1, m2, k, K] = r.pick(T89);
        const A = (k + K) / m1 + (k + K) / m2, B = ((k + K) ** 2 - K * K) / (m1 * m2), w = Math.sqrt((A - Math.sqrt(A * A - 4 * B)) / 2);
        return dest({ q: `$m_1=${fmt(m1)}\\,\\mathrm{kg}$ と $m_2=${fmt(m2)}\\,\\mathrm{kg}$ の台車を、外側のばね2本（$k=${fmt(k)}\\,\\mathrm{N/m}$）とまん中のばね（$K=${fmt(K)}\\,\\mathrm{N/m}$）でつないだ。小さいほうのモードの角振動数 $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${Math.round(w)}$`, key: `t${m1},${m2},${k},${K}`,
          verify: p => { const v = nums(p.a)[0], d = (k + K - m1 * v * v) * (k + K - m2 * v * v) - K * K, w2 = Math.sqrt((A + Math.sqrt(A * A - 4 * B)) / 2); return (near(d, 0, 1e-9) && v < w2) || 'モードの角振動数でない'; } }, '6-89',
          '質量がちがうので、たしてもひいても $x_1$ と $x_2$ が残る（和と差に分かれない）。$\\omega_1=\\sqrt{\\frac km}$ の形は使えない（係数の表の行列で解く。第7巻）');
      },
    },
  });

  // ================================================================ 6-90
  // ばね（m、ωn、ζ）と RLC（L、C、ωn）。R=2ζ√(L/C)=2ζLωn、c=2ζmωn
  const SPR90 = [[0.5, 4], [1, 2], [1, 4], [1, 5], [1, 10], [2, 5], [2, 10], [4, 5], [0.5, 10], [2, 2]];
  const Z90 = ['0.1', '0.2', '0.25', '0.5', '0.05'];
  function gen90(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 60; t++) {
      const [m, ws] = r.pick(SPR90), [L, C, wr] = r.pick(LCW), z = opt.z || r.pick(Z90), zr = opt.same === false ? r.pick(Z90.filter(x => x !== z)) : z;
      const k = m * ws * ws, c = +fmt(2 * +z * m * ws), R = +fmt(2 * +zr * L * wr);
      if (!dec(D(String(c))) || !dec(D(String(R))) || decs(D(String(R))) > 2) continue;
      if ((m === 0.5 && ws === 4 && z === '0.1') || (m === 2 && ws === 10 && z === '0.1')) continue;   // 楽な形の例・教科書のじぶんでとこう（O-2）
      if ((L === 0.01 && C === 1e-6) || (L === 0.001 && C === 1e-5)) continue;
      return { m, ws, k, c, z, L, C, wr, R, zr, key: `${m},${ws},${z}|${L},${C},${zr}` };
    }
    return null;
  }
  // 相似の表（力学 ↔ 電気）。検算では、2つの式 m\ddot x+c\dot x+kx=F と L\ddot q+R\dot q+\frac1C q=E の項を、前から順に組にする
  const EQ_M = ['m', 'c', 'k', 'x', 'v', 'F'], EQ_E = ['L', 'R', '\\frac{1}{C}', 'q', 'i', 'E'];
  const NAME90 = { m: '質量', c: 'ダンパーの減衰係数', k: 'ばね定数', x: '位置', v: '速度', F: '力', L: 'インダクタンス', R: '抵抗', '\\frac{1}{C}': '静電容量の逆数', q: '電荷', i: '電流', E: '電源の電圧' };
  M.add({
    id: '6-90', part: 6, chap: '6-15③④ 例題4', stars: 1,
    title: '相似の表：$m\\leftrightarrow L$、$c\\leftrightarrow R$、$k\\leftrightarrow\\tfrac1C$。$\\zeta$ が同じなら、ゆれ方の形は同じ',
    mark: 'ばね・質量・ダンパーと RLC 回路の数をくらべる、「ゆれ方の形」「対応する量」「何倍速い」。',
    futsu: ['ばねの式と回路の式を、それぞれ特性方程式から解き、', '2つの答えのグラフをかいて', '形をくらべる'],
    raku: ['ばね $0.5\\,\\mathrm{kg}$・$8\\,\\mathrm{N/m}$・$0.4\\,\\mathrm{N\\cdot s/m}$：$\\omega_{\\mathrm n}=4$、$\\zeta=0.1$', '回路 $10\\,\\mathrm{mH}$・$1\\,\\mathrm{\\mu F}$・$20\\,\\mathrm{\\Omega}$：$\\omega_{\\mathrm n}=10^4$、$\\zeta=0.1$', '$\\zeta$ が同じ → 形は同じ。回路は $\\dfrac{10^4}{4}=2500$ 倍速い'],
    why: '力学の $m\\ddot x+c\\dot x+kx=F$ と電気の $L\\ddot q+R\\dot q+\\dfrac1Cq=E$ は、文字がちがうだけで同じ形（6-15③）。だから $\\omega_{\\mathrm n}=\\sqrt{\\dfrac km}$ は $\\dfrac{1}{\\sqrt{LC}}$ に、$\\zeta=\\dfrac{c}{2\\sqrt{mk}}$ は $\\dfrac R2\\sqrt{\\dfrac CL}$ になる。$\\zeta$ が同じなら答えの形は同じで、ちがうのは時間の物さし $\\dfrac{1}{\\omega_{\\mathrm n}}$ だけ（6-15④）。',
    caution: 'ばねの $k$ に対応するのは $C$ ではなく $\\dfrac1C$（やわらかさ $\\dfrac1k$ が $C$）。$\\omega_{\\mathrm n}$ が同じでも $\\zeta$ がちがえば形はちがう。熱には慣性（$m$、$L$）がないので、ゆれない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 1 },
    cols: 1, boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '34mm' },
    fits(q) { return /ゆれ方の形|相似の表|時間の物さし/.test(q); },
    steps: {
      // ゆれ方の形は同じか・対応する量
      s1(r) {
        if (turn(r, '90s1', 2) === 0) {
          const same = r.chance(0.5), g = gen90(r, { same }); if (!g) return null;
          return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）と、RLC 回路（${rlc(g.L, g.C, g.R)}）のゆれ方の形は（同じ・ちがう）`, a: same ? '同じ' : 'ちがう', key: g.key, easyCheck: false,
            easy: `ばね $\\zeta=\\frac{${fmt(g.c)}}{2\\sqrt{${fmt(g.m)}\\times${fmt(g.k)}}}=${g.z}$、回路 $\\zeta=\\frac{${fmt(g.R)}}{2}\\sqrt{\\frac CL}=${g.zr}$`,
            verify: p => { const zs = g.c / (2 * Math.sqrt(g.m * g.k)), ze = g.R / 2 * Math.sqrt(g.C / g.L); return p.a === (near(zs, ze, 1e-9) ? '同じ' : 'ちがう') || `ζ は ${zs} と ${ze}`; } };
        }
        const i = r.int(0, 5), toE = r.chance(0.6), [a, b] = toE ? [EQ_M[i], EQ_E[i]] : [EQ_E[i], EQ_M[i]];
        return { q: `相似の表で、${toE ? 'ばね・質量・ダンパー' : 'RLC 回路'}の${NAME90[a]} $${a}$ に対応する${toE ? ' RLC 回路' : 'ばね・質量・ダンパー'}の量 □`, a: `$${b}$`, key: `n${toE}${i}`, easyCheck: false,
          easy: '$m\\ddot x+c\\dot x+kx=F$ と $L\\ddot q+R\\dot q+\\frac1Cq=E$ の項をならべる',
          verify: p => { const LM = 'm\\ddot x+c\\dot x+k x=F'.split(/\+|=/), LE = 'L\\ddot q+R\\dot q+\\frac{1}{C} q=E'.split(/\+|=/), head = s => s.split(/\\d?dot | /)[0];
            const pairs = LM.map((t, j) => [head(t), head(LE[j])]).concat([['x', 'q'], ['v', 'i']]), want = pairs.find(pq => pq[toE ? 0 : 1] === a);
            return (want && strip(p.a) === want[toE ? 1 : 0]) || '対応がちがう'; } };
      },
      // 同じ形にする R・時間の物さしの倍率
      s2(r) {
        const g = gen90(r); if (!g) return null;
        if (turn(r, '90s2', 2) === 0) {
          return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）と、ゆれ方の形が同じになる RLC 回路（${rlc(g.L, g.C)}）の抵抗 $R=□\\,\\mathrm{\\Omega}$`, a: `$${fmt(g.R)}$`, key: g.key, easyCheck: false,
            easy: `ばねの $\\zeta=${g.z}$。$R=2\\zeta\\sqrt{\\frac LC}=2\\times${g.z}\\times${fmt(g.L * g.wr)}$`,
            verify: p => near(nums(p.a)[0] / 2 * Math.sqrt(g.C / g.L), g.c / (2 * Math.sqrt(g.m * g.k)), 1e-9) || 'ζ がそろわない' };
        }
        return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）と RLC 回路（${rlc(g.L, g.C, g.R)}）は、ゆれ方の形が同じ。回路のゆれは、ばねの □ 倍速い（時間の物さし）`, a: `$${fmt(g.wr / g.ws)}$`, key: g.key, easyCheck: false,
          easy: `$\\omega_{\\mathrm n}$ は ばね $${g.ws}$、回路 $${g.wr}$。$\\frac{${g.wr}}{${g.ws}}$`,
          verify: p => near(nums(p.a)[0], Math.sqrt(1 / (g.L * g.C)) / Math.sqrt(g.k / g.m), 1e-9) || '倍率がちがう' };
      },
      // 見かけがちがう：同じ形にするダンパーの c・ばねの時間から回路の時間
      s3(r) {
        const g = gen90(r); if (!g) return null;
        if (turn(r, '90s3', 2) === 0) {
          return { q: `RLC 回路（${rlc(g.L, g.C, g.R)}）と、ゆれ方の形が同じになるばね・質量・ダンパー（${spring(g.m, g.k)}）のダンパーの $c=□\\,\\mathrm{N\\cdot s/m}$`, a: `$${fmt(g.c)}$`, key: g.key, easyCheck: false,
            easy: `回路の $\\zeta=\\frac{${fmt(g.R)}}{2}\\sqrt{\\frac CL}=${g.zr}$。$c=2\\zeta\\sqrt{mk}=2\\times${g.zr}\\times${fmt(Math.sqrt(g.m * g.k))}$`,
            verify: p => near(nums(p.a)[0] / (2 * Math.sqrt(g.m * g.k)), g.R / 2 * Math.sqrt(g.C / g.L), 1e-9) || 'ζ がそろわない' };
        }
        const Ts = r.pick([1, 2, 5, 0.5, 4]), ms = F.mul(fr(Ts * 1000 * g.ws), F.make(1, g.wr));
        if (!dec(ms) || decs(ms) > 3) return null;
        return { q: `ばね・質量・ダンパー（${spring(g.m, g.k, g.c)}）と RLC 回路（${rlc(g.L, g.C, g.R)}）は、ゆれ方の形が同じ。ばねのゆれが $${Ts}$ 秒でほぼおさまるとき、回路のゆれは □ ms でほぼおさまる`, a: `$${fx(ms)}$`, key: g.key, easyCheck: false,
          easy: `回路は $\\frac{${g.wr}}{${g.ws}}$ 倍速い。$${Ts}\\div${fmt(g.wr / g.ws)}$ 秒`,
          verify: p => { const a1 = g.c / (2 * g.m), a2 = g.R / (2 * g.L); return near(nums(p.a)[0] / 1000 * a2, Ts * a1, 1e-9) || '時間がちがう'; } };   // 別の道すじ：つつみ e^{-αt} が同じ値になる時刻（α=c/2m、R/2L）
      },
      // わな：熱（慣性がない。ゆれずに近づく。6-18）
      trap(r) {
        const C = r.pick([1000, 2000, 4200, 840]), R = r.pick(['0.5', '1', '2', '0.25']), Ta = r.pick([18, 20, 22, 25]), T0 = Ta + r.pick([40, 50, 60]);
        return dest({ q: `${T0}℃のお湯（熱容量 $C_{\\mathrm{th}}=${C}\\,\\mathrm{J/K}$、熱抵抗 $R_{\\mathrm{th}}=${R}\\,\\mathrm{K/W}$）を ${Ta}℃の部屋に置く。お湯の温度は、ばねのおもりのように、部屋の温度のまわりでゆれながら近づくか`, a: 'ゆれない（ゆれずに近づく）', key: `t${C},${R},${Ta},${T0}`,
          verify: p => { const ys = rkSys((t, y) => [-(y[0] - Ta) / (C * +R)], [T0], Array.from({ length: 40 }, (_, k) => (k + 1) * C * +R / 5), C * +R / 500); return (/^ゆれない/.test(p.a) && ys.every(y => y[0] > Ta)) || '部屋の温度より下がった'; } }, '6-90',
          '熱には慣性（質量・コイルにあたるもの）がないので1回微分の式。差は $e^{-t/\\tau}$ でへるだけで、行きすぎない', ['6-18']);
      },
    },
  });

  // ================================================================ 6-97
  // 直列の水そう：h1'=-h1/τ、h2'=h1/τ-h2/τ、はじめ h1=h0、h2=H → h2=(H+(h0/τ)t)e^{-t/τ}
  const eqs97 = (tau, v1, v2) => { v1 = v1 || 'h_1'; v2 = v2 || 'h_2'; return `$\\dot ${v1}=-${v1}/${tau}$、$\\dot ${v2}=${v1}/${tau}-${v2}/${tau}$`; };
  const f97 = tau => (t, y) => [-y[0] / tau, y[0] / tau - y[1] / tau];
  function gen97(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 40; t++) {
      const tau = r.pick([2, 3, 4, 5, 6, 8, 10]), h0 = r.pick([20, 30, 40, 50, 60, 80, 90, 100, 120]), H = opt.H ? r.pick([2, 4, 5, 6, 10]) : 0, B = F.make(h0, tau);
      if (!dec(B) || decs(B) > 1 || H >= h0) continue;
      if ((tau === 4 && h0 === 40) || (tau === 2 && h0 === 30)) continue;   // 楽な形の例・教科書のじぶんでとこう（O-2）
      const E = ex(fr(-1, tau)), ans = H ? `(${sum([String(H), cf(B, 't')])})${E}` : cf(B, 't' + E);
      return { tau, h0, H, B, E, ans, key: `${tau},${h0},${H}` };
    }
    return null;
  }
  // 親と子：N1'=-aN1、N2'=aN1-bN2（a、b は分数）
  const rt = (f, v) => (f[1] === 1 ? (f[0] === 1 ? v : `${f[0]}${v}`) : `${f[0] === 1 ? '' : f[0]}${v}/${f[1]}`);
  const eqs98 = (a, b, v1, v2) => { v1 = v1 || 'N_1'; v2 = v2 || 'N_2'; return `$\\dot ${v1}=-${rt(a, v1)}$、$\\dot ${v2}=${rt(a, v1)}-${rt(b, v2)}$`; };
  const f98 = (a, b) => (t, y) => [-a * y[0], a * y[0] - b * y[1]];
  // 直列の2つの式（h1'=-a h1、h2'=a' h1-b h2）を文から読む。読めなければ null
  function chainOf(q) {
    const eqs = maths(q).map(s => /^\\dot ([A-Za-z](?:_\d)?)=(.+)$/.exec(s) || /^\\frac\{\\dd ([A-Za-z](?:_\d)?)\}\{\\dd t\}=(.+)$/.exec(s)).filter(Boolean);
    if (eqs.length !== 2) return null;
    const [[, v1, r1], [, v2, r2]] = eqs, co = (rhs, v) => { let s = 0, n = 0; for (const [sg, t] of terms(rhs)) if (t.includes(v)) { const c = ev(t.split(v).join('(1)')); if (c == null) return null; s += sg * c; n++; } return n ? s : 0; };
    if (r1.includes(v2)) return null;
    const a = co(r1, v1), a2 = co(r2, v1), b = co(r2, v2);
    if ([a, a2, b].some(x => x == null) || !(a < 0) || !(a2 > 0) || !(b < 0)) return null;
    return { a: -a, b: -b };
  }
  M.add({
    id: '6-97', part: 6, chap: '6-14⑦ 例題7', stars: 1,
    title: '直列の水そう（消去法）：$h_2=\\tfrac{h_0}{\\tau}\\,te^{-t/\\tau}$、いちばん高いのは $t=\\tau$',
    mark: '上の水そうから下の水そうへ落ち、下から外へ出る（2つの時定数が同じ）、「下の水位の式」「いちばん高くなる時刻」。',
    futsu: ['下の式を $h_1=\\tau\\dot h_2+h_2$ にして上の式に入れ、', '$\\tau^2\\ddot h_2+2\\tau\\dot h_2+h_2=0$ の重解 $s=-\\dfrac1\\tau$ から', '$(A+Bt)e^{-t/\\tau}$ の $A$、$B$ を決める'],
    raku: ['$\\tau=4$ 分、はじめ上 $40$、下 $0$', '$h_2=\\dfrac{40}{4}\\,te^{-t/4}=10te^{-t/4}$', 'いちばん高いのは4分後、$40e^{-1}\\approx14.7\\,\\mathrm{cm}$'],
    why: '消去法で $h_2$ だけの式にすると、特性方程式 $(\\tau s+1)^2=0$ の重解 $s=-\\dfrac1\\tau$（6-14⑦）。答えは $(A+Bt)e^{-t/\\tau}$ で、$A=h_2(0)$、$B=\\dot h_2(0)+\\dfrac{A}{\\tau}$。$\\dot h_2(0)=\\dfrac{h_0-A}{\\tau}$ なので、$B=\\dfrac{h_0}{\\tau}$。$\\dot h_2=B\\Bigl(1-\\dfrac t\\tau\\Bigr)e^{-t/\\tau}=0$（$A=0$ のとき）から $t=\\tau$。',
    caution: '上の水そうだけの $h_0e^{-t/\\tau}$ を答えにしない（下はふえてからへる）。2つの時定数がちがうときは、この形ではない（$Ae^{-t/\\tau_1}+Be^{-t/\\tau_2}$）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '28mm', s2: '16mm', s3: '34mm', trap: '40mm' },
    fits(q) { const c = chainOf(q); return !!(c && near(c.a, c.b, 1e-9)); },
    steps: {
      s1(r) {
        const g = gen97(r); if (!g) return null;
        return { q: `${eqs97(g.tau)}（cm、分）で、はじめ $h_1=${g.h0}$、$h_2=0$。下の水位 $h_2$ を $t$ の式で`, a: `$${g.ans}$`, key: g.key, easyCheck: false,
          easy: `重解 $s=-\\frac1{${g.tau}}$。$A=0$、$B=\\frac{${g.h0}}{${g.tau}}$`, verify: p => sysIs(p, f97(g.tau), [g.h0, 0], 1, g.tau) };
      },
      // いちばん高くなる時刻・高さ（e^{-1}=0.368）
      s2(r) {
        const g = gen97(r); if (!g) return null;
        const mx = sysMax(f97(g.tau), [g.h0, 0], 1, g.tau);
        if (turn(r, '97s2', 2) === 0) {
          return { q: `${eqs97(g.tau)}（cm、分）で、はじめ $h_1=${g.h0}$、$h_2=0$。下の水位がいちばん高くなるのは □ 分後`, a: `$${g.tau}$`, key: g.key, easyCheck: false,
            easy: `$h_2=${g.ans}$。$\\dot h_2=0$ は $t=\\tau$`, verify: p => near(nums(p.a)[0], mx.t, 1e-4) || `いちばん高いのは ${mx.t}` };
        }
        const H = agree(F.mul(fr(g.h0), D('0.368')), g.h0 * Math.exp(-1), 1);
        if (H == null) return null;
        return { q: `${eqs97(g.tau)}（cm、分）で、はじめ $h_1=${g.h0}$、$h_2=0$。下の水位のいちばん高い値は約 □ cm（$e^{-1}=0.368$ として、小数第1位まで）`, a: `$${H}$`, key: g.key, easyCheck: false,
          easy: `$t=${g.tau}$ で $${g.h0}e^{-1}=${g.h0}\\times0.368$`, verify: p => Math.abs(nums(p.a)[0] - mx.v) < 0.051 || `いちばん高い値は ${mx.v}` };
      },
      // 見かけがちがう：下にもはじめ水がある・薬（胃腸と血液。同じ速さ）
      s3(r) {
        if (turn(r, '97s3', 2) === 0) {
          const g = gen97(r, { H: true }); if (!g) return null;
          return { q: `${eqs97(g.tau)}（cm、分）で、はじめ $h_1=${g.h0}$、$h_2=${g.H}$。$h_2$ を $t$ の式で`, a: `$${g.ans}$`, key: g.key, easyCheck: false,
            easy: `$(A+Bt)e^{-t/${g.tau}}$、$A=${g.H}$、$B=\\dot h_2(0)+\\frac{A}{${g.tau}}=\\frac{${g.h0}-${g.H}}{${g.tau}}+\\frac{${g.H}}{${g.tau}}$`, verify: p => sysIs(p, f97(g.tau), [g.h0, g.H], 1, g.tau) };
        }
        const rho = r.pick(['0.5', '0.25', '0.2', '1']), G0 = r.pick([100, 200, 300, 400, 500]), B = F.mul(D(rho), fr(G0)), E = ex(F.mul(D(rho), fr(-1)), { dec: true });
        return { q: `飲み薬の、胃腸の量 $G$ と血液の量 $B$（mg）が $\\dot G=-${rho === '1' ? '' : rho}G$、$\\dot B=${rho === '1' ? '' : rho}G-${rho === '1' ? '' : rho}B$（$t$ は時間）にしたがい、はじめ $G=${G0}$、$B=0$。$B$ を $t$ の式で`, a: `$${cf(B, 't' + E)}$`, key: `g${rho},${G0}`, easyCheck: false,
          easy: `2つの速さが同じなので重解。$B=${fx(B)}t${E}$（$${rho}\\times${G0}$）`, verify: p => sysIs(p, f97(1 / +rho), [G0, 0], 1, 1 / +rho) };
      },
      // わな：時定数がちがう（親と子。6-98）
      trap(r) {
        const g = gen98(r); if (!g) return null;
        return dest({ q: `${eqs98(g.a, g.b)}（$t$ は時間）で、はじめ $N_1=${g.N0}$、$N_2=0$。$N_2$ を $t$ の式で`, a: `$${g.ans}$`, key: `t${g.key}`,
          verify: p => sysIs(p, f98(F.val(g.a), F.val(g.b)), [g.N0, 0], 1, 1 / F.val(g.a)) }, '6-97',
          `2つの速さ $${fx(g.a)}$ と $${fx(g.b)}$ がちがうので、特性方程式の解は2つ（重解ではない）。$te^{st}$ の形にならない`);
      },
    },
  });

  // ================================================================ 6-98
  // 親と子：N2=aN0/(b-a)·(e^{-at}-e^{-bt})。いちばん多いのは t=ln(b/a)/(b-a)。b=2a・b=a/2 のとき t と値がきれい
  const P98 = [[[1, 2], [1, 1]], [[1, 1], [1, 2]], [[1, 1], [2, 1]], [[2, 1], [1, 1]], [[1, 3], [2, 3]], [[2, 3], [1, 3]], [[1, 4], [1, 2]], [[1, 2], [1, 4]], [[1, 1], [3, 1]], [[1, 3], [1, 1]], [[1, 1], [1, 3]], [[1, 2], [3, 2]], [[3, 1], [1, 1]], [[1, 4], [1, 1]]];
  function gen98(r, opt) {
    opt = opt || {};
    for (let t = 0; t < 40; t++) {
      const [a, b] = r.pick(P98).map(x => F.make(x[0], x[1]));
      const ratio = F.val(F.div(b, a)); if (opt.peak && ratio !== 2 && ratio !== 0.5) continue;
      const N0 = r.pick([1000, 600, 800, 400, 1200, 2000, 200, 900]), C = F.div(F.mul(a, fr(N0)), F.sub(b, a));
      if (C[1] !== 1) continue;
      if ((F.val(a) === 0.5 && F.val(b) === 1 && N0 === 1000) || (F.val(a) === 1 && F.val(b) === 0.5 && N0 === 200)) continue;   // 楽な形の例・教科書のじぶんでとこう（O-2）
      const Ea = ex(F.mul(a, fr(-1))), Eb = ex(F.mul(b, fr(-1))), ans = C[0] > 0 ? `${C[0]}(${Ea}-${Eb})` : `${-C[0]}(${Eb}-${Ea})`;
      // いちばん多い時刻（ln2 の何倍か）と値
      const tl = ratio === 2 ? F.div(fr(1), a) : ratio === 0.5 ? F.div(fr(2), a) : null, Nm = ratio === 2 ? N0 / 4 : ratio === 0.5 ? N0 / 2 : null;
      return { a, b, N0, C, ans, tl, Nm, key: `${fx(a)},${fx(b)},${N0}` };
    }
    return null;
  }
  M.add({
    id: '6-98', part: 6, chap: '6-14⑦ 例題8', stars: 1,
    title: '親と子（消去法）：$N_2=\\tfrac{aN_0}{b-a}(e^{-at}-e^{-bt})$',
    mark: '親がこわれて子になり、子もこわれる（2つの速さがちがう）、「子の数の式」「いちばん多くなる時刻と数」。',
    futsu: ['子の式を $N_1=2(\\dot N_2+N_2)$ にして親の式に入れ、', '$2\\ddot N_2+3\\dot N_2+N_2=0$ を特性方程式で解き、', '$N_2(0)=0$、$\\dot N_2(0)$ で $A$、$B$ を決める'],
    raku: ['$\\dot N_1=-N_1/2$、$\\dot N_2=N_1/2-N_2$、$N_0=1000$', '$\\tfrac{aN_0}{b-a}=\\tfrac{0.5\\times1000}{1-0.5}=1000$', '$N_2=1000(e^{-t/2}-e^{-t})$', '$e^{-t/2}=\\tfrac12$ で $t=2\\ln2$、$N_2=1000\\bigl(\\tfrac12-\\tfrac14\\bigr)=250$'],
    why: '消去法で、特性方程式は $(s+a)(s+b)=0$、$N_2=Ae^{-at}+Be^{-bt}$（6-14⑦）。$N_2(0)=0$ から $B=-A$。$\\dot N_2(0)=aN_0$ から $-aA+bA=aN_0$、$A=\\dfrac{aN_0}{b-a}$。いちばん多いのは $\\dot N_2=0$、つまり $ae^{-at}=be^{-bt}$ のとき（5-7）。',
    caution: '$A$ と $B$ の符号に気をつける（$b<a$ なら $A$ は負なので、$e^{-bt}-e^{-at}$ の形に書くと正の数がならぶ）。2つの速さが同じときは、この形は使えない（分母が0。直列の水そうの $te^{-t/\\tau}$）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1, boxw: { s1: '40mm', s2: '16mm', s3: '40mm', trap: '28mm' },
    fits(q) { const c = chainOf(q); return !!(c && !near(c.a, c.b, 1e-9)); },
    steps: {
      s1(r) {
        const g = gen98(r); if (!g) return null;
        return { q: `${eqs98(g.a, g.b)}（$t$ は時間）で、はじめ $N_1=${g.N0}$、$N_2=0$。子の数 $N_2$ を $t$ の式で`, a: `$${g.ans}$`, key: g.key, easyCheck: false,
          easy: `$s=-${fx(g.a)}$、$-${fx(g.b)}$。$A=\\frac{${fx(g.a)}\\times${g.N0}}{${fx(g.b)}-${fx(g.a)}}=${g.C[0]}$`, verify: p => sysIs(p, f98(F.val(g.a), F.val(g.b)), [g.N0, 0], 1, 1 / F.val(g.a)) };
      },
      // いちばん多くなる時刻（ln を残した形）・数
      s2(r) {
        const g = gen98(r, { peak: true }); if (!g) return null;
        const mx = sysMax(f98(F.val(g.a), F.val(g.b)), [g.N0, 0], 1, 1 / Math.min(F.val(g.a), F.val(g.b)));
        if (turn(r, '98s2', 2) === 0) {
          return { q: `${eqs98(g.a, g.b)}（$t$ は時間）で、はじめ $N_1=${g.N0}$、$N_2=0$。子がいちばん多くなる時刻（$\\ln$ を残した形で）`, a: `$${cf(g.tl, '\\ln2')}$`, key: g.key, easyCheck: false,
            easy: `$N_2=${g.ans}$。$\\dot N_2=0$ から $${cf(g.a, ex(F.mul(g.a, fr(-1))))}=${cf(g.b, ex(F.mul(g.b, fr(-1))))}$`, verify: p => near(ev(strip(p.a)), mx.t, 1e-4) || `いちばん多いのは ${mx.t}` };
        }
        return { q: `${eqs98(g.a, g.b)}（$t$ は時間）で、はじめ $N_1=${g.N0}$、$N_2=0$。子のいちばん多い数 □`, a: `$${g.Nm}$`, key: g.key, easyCheck: false,
          easy: `$N_2=${g.ans}$。$\\dot N_2=0$ のとき、速いほうの $e$ はおそいほうの2乗`, verify: p => near(nums(p.a)[0], mx.v, 1e-5) || `いちばん多い数は ${mx.v}` };
      },
      // 見かけがちがう：飲み薬（胃腸 G・血液 B）
      s3(r) {
        const g = gen98(r, { peak: turn(r, '98s3', 2) === 1 }); if (!g) return null;
        const q0 = `飲み薬の、胃腸の量 $G$ と血液の量 $B$（mg）が ${eqs98(g.a, g.b, 'G', 'B')}（$t$ は時間）にしたがい、はじめ $G=${g.N0}$、$B=0$。`, f = f98(F.val(g.a), F.val(g.b));
        if (!g.Nm) return { q: q0 + '$B$ を $t$ の式で', a: `$${g.ans}$`, key: `g${g.key}`, easyCheck: false,
          easy: `$s=-${fx(g.a)}$、$-${fx(g.b)}$。$A=\\frac{${fx(g.a)}\\times${g.N0}}{${fx(g.b)}-${fx(g.a)}}$`, verify: p => sysIs(p, f, [g.N0, 0], 1, 1 / F.val(g.a)) };
        const mx = sysMax(f, [g.N0, 0], 1, 1 / Math.min(F.val(g.a), F.val(g.b)));
        return { q: q0 + '血液の薬がいちばん多いときの量 □ mg', a: `$${g.Nm}$`, key: `g${g.key}`, easyCheck: false,
          easy: `$B=${g.ans}$。$\\dot B=0$ から時刻を出して入れる`, verify: p => near(nums(p.a)[0], mx.v, 1e-5) || `いちばん多い量は ${mx.v}` };
      },
      // わな：2つの速さが同じ（重解。6-97）
      trap(r) {
        const a = r.pick([[1, 2], [1, 1], [1, 4], [1, 3]]), af = F.make(a[0], a[1]), N0 = r.pick([600, 800, 1200, 400]), B = F.mul(af, fr(N0));
        if (!dec(B)) return null;
        return dest({ q: `${eqs98(af, af)}（$t$ は時間）で、はじめ $N_1=${N0}$、$N_2=0$。$N_2$ を $t$ の式で`, a: `$${cf(B, 't' + ex(F.mul(af, fr(-1))))}$`, key: `t${fx(af)},${N0}`,
          verify: p => sysIs(p, f98(F.val(af), F.val(af)), [N0, 0], 1, 1 / F.val(af)) }, '6-98',
          `2つの速さが同じ $${fx(af)}$ で、$\\frac{aN_0}{b-a}$ の分母が0。特性方程式は重解で、$te^{st}$ の形`);
      },
    },
  });

  // ================================================================ 6-99
  // Q 値＝ωn÷半値幅（山の高さの 1/√2 倍の高さでのはば）。ζ が小さいとき Q≈1/(2ζ)
  // 検算：振幅の式から半値幅を数でさがす（ωn と ζ から）
  function qNum(wn, z) {
    const amp = w => 1 / Math.hypot(wn * wn - w * w, 2 * z * wn * w), pk = peakNum(1, wn * wn, 2 * z * wn, 1, 2 * wn), h = pk.a / Math.SQRT2;
    const cross = (lo, hi) => { for (let j = 0; j < 100; j++) { const m = (lo + hi) / 2; if ((amp(m) > h) === (amp(lo) > h)) lo = m; else hi = m; } return (lo + hi) / 2; };
    return wn / (cross(pk.w, 3 * wn) - cross(1e-9 * wn, pk.w));
  }
  const qTol = z => 0.15 * z + 1e-4;   // Q≈1/(2ζ) のずれは ζ=0.1 で約1%、ζ=0.125 で約1.6%（ζ が小さいほど小さい）
  const ZQ99 = ['0.01', '0.02', '0.025', '0.05', '0.1', '0.125'];
  M.add({
    id: '6-99', part: 6, chap: '6-13⑩', stars: 1,
    title: 'Q 値＝$\\tfrac{\\omega_{\\mathrm n}}{\\text{半値幅}}\\approx\\tfrac{1}{2\\zeta}$',
    mark: '共振曲線の山の「鋭さ」、「半値幅」「Q 値」。',
    futsu: ['共振曲線をかいて、山の高さの0.707倍の高さで', '曲線と交わる2つの $\\omega$ を読み、', 'そのはばで $\\omega_{\\mathrm n}$ をわる'],
    raku: ['$\\zeta=0.1$、$\\omega_{\\mathrm n}=4$：はば約0.81', '$Q=\\dfrac{4}{0.81}\\approx4.9$', '$\\dfrac{1}{2\\zeta}=\\dfrac{1}{0.2}=5$ とほぼ同じ'],
    why: '山の高さの $\\dfrac1{\\sqrt2}$ 倍の高さでのはばが半値幅（振幅の2乗で見ると半分になる高さ）。$\\omega_{\\mathrm n}$ を半値幅でわった数が Q 値（6-13⑩）。$\\zeta$ が小さいときは半値幅 $\\approx2\\zeta\\omega_{\\mathrm n}$ なので $Q\\approx\\dfrac{1}{2\\zeta}$ で、ちょうど $\\omega_{\\mathrm n}$ でゆすったときの倍率（わざ 6-85）とほぼ同じ。',
    caution: '$Q\\approx\\dfrac{1}{2\\zeta}$ は $\\zeta$ が小さいときの近い値（$\\zeta=0.1$ で約1% ちがう）。半値幅は山の高さの半分の所のはばではない（$\\dfrac{1}{\\sqrt2}\\approx0.707$ 倍）。Q 値が大きいほど、山は高く細い。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1, boxw: '16mm',
    fits(q) { return /Q 値|半値幅/.test(q); },
    steps: {
      // ωn と半値幅から Q・Q と ωn から半値幅
      s1(r) {
        const Q = r.pick([4, 5, 8, 10, 20, 25, 40, 50]), wn = r.pick([2, 4, 5, 10, 20, 100, 1000]), w = F.make(wn, Q);
        if (!dec(w) || decs(w) > 2 || (wn === 4 && Q === 5)) return null;
        const head = `共振曲線の山が $\\omega_{\\mathrm n}=${wn}\\,\\mathrm{rad/s}$ のあたりにある。`;
        if (turn(r, '99s1', 2) === 0) return { q: head + `半値幅が $${fx(w)}\\,\\mathrm{rad/s}$ のとき、Q 値 □`, a: `$${Q}$`, key: `${wn},${Q}`, easyCheck: false,
          easy: `$\\frac{${wn}}{${fx(w)}}$`, verify: p => near(nums(p.a)[0] * F.val(w), wn, 1e-9) || 'Q×半値幅が ωn にならない' };
        return { q: head + `Q 値が $${Q}$ のとき、半値幅 □ $\\mathrm{rad/s}$`, a: `$${fx(w)}$`, key: `${wn},${Q}`, easyCheck: false,
          easy: `$\\frac{${wn}}{${Q}}$`, verify: p => near(nums(p.a)[0] * Q, wn, 1e-9) || 'Q×半値幅が ωn にならない' };
      },
      // ζ から（m・k・c から）Q≈1/(2ζ)
      s2(r) {
        const z = r.pick(ZQ99), Q = fx(F.div(fr(1), F.mul(fr(2), D(z))));
        if (turn(r, '99s2', 2) === 0) {
          if (z === '0.1') return null;   // 楽な形の例（ζ=0.1 → 5。O-2）
          return { q: `減衰比 $\\zeta=${z}$ のばね・質量・ダンパーを、$\\omega_{\\mathrm n}$ のあたりでゆする。共振の Q 値はおよそ □`, a: `$${Q}$`, key: `z${z}`, easyCheck: false,
            easy: `$Q\\approx\\frac{1}{2\\times${z}}$`, verify: p => Math.abs(nums(p.a)[0] / qNum(1, +z) - 1) < qTol(+z) || `Q は ${qNum(1, +z)}` };
        }
        const [m, wn] = r.pick([[1, 2], [1, 4], [1, 5], [1, 10], [2, 5], [2, 10], [0.5, 10], [4, 5]]), k = m * wn * wn, c = +fmt(2 * +z * m * wn);
        if (!dec(D(String(c))) || (z === '0.1' && wn === 4)) return null;
        return { q: `ばね・質量・ダンパー（${spring(m, k, c)}）の、共振の Q 値はおよそ □`, a: `$${Q}$`, key: `z${z}`, easyCheck: false,
          easy: `$\\zeta=\\frac{${fmt(c)}}{2\\sqrt{${fmt(m)}\\times${fmt(k)}}}=${z}$、$Q\\approx\\frac{1}{2\\zeta}$`, verify: p => Math.abs(nums(p.a)[0] / qNum(wn, c / (2 * Math.sqrt(m * k))) - 1) < qTol(+z) || 'Q がちがう' };
      },
      // 見かけがちがう：RLC 回路の Q 値・Q 値をきめる ζ
      s3(r) {
        if (turn(r, '99s3', 2) === 0) {
          const [L, C, w] = r.pick(LCW), z = r.pick(ZQ99), R = +fmt(2 * +z * L * w);
          if (!dec(D(String(R))) || decs(D(String(R))) > 2) return null;
          return { q: `RLC 回路（${rlc(L, C, R)}）の共振の Q 値はおよそ □`, a: `$${fx(F.div(fr(1), F.mul(fr(2), D(z))))}$`, key: `r${L},${C},${z}`, easyCheck: false,
            easy: `$\\zeta=\\frac R2\\sqrt{\\frac CL}=${z}$、$Q\\approx\\frac{1}{2\\zeta}$`, verify: p => Math.abs(nums(p.a)[0] / qNum(w, R / 2 * Math.sqrt(C / L)) - 1) < qTol(+z) || 'Q がちがう' };
        }
        const Q = r.pick([4, 10, 20, 25, 50, 40]), z = F.make(1, 2 * Q);   // 5（ζ=0.1）は楽な形の例なので出さない（O-2）
        if (!dec(z)) return null;
        return { q: `ラジオの同調の回路で、共振の Q 値をおよそ $${Q}$ にしたい。減衰比 $\\zeta$ はおよそ □`, a: `$${fx(z)}$`, key: `q${Q}`, easyCheck: false,
          easy: `$\\frac{1}{2\\zeta}=${Q}$`, verify: p => Math.abs(qNum(1, nums(p.a)[0]) / Q - 1) < qTol(1 / (2 * Q)) || 'Q がちがう' };
      },
      // わな：いちばん大きくゆれる ω（Q 値ではない。6-84）
      trap(r) {
        const [wn, z] = r.pick([[4, '0.25'], [8, '0.25'], [12, '0.5'], [2, '0.5'], [10, '0.4'], [14, '0.5']]), N = Math.round(wn * wn * (1 - 2 * z * z) * 1e6) / 1e6;
        return dest({ q: `$\\omega_{\\mathrm n}=${wn}\\,\\mathrm{rad/s}$、$\\zeta=${z}$ のばね・質量・ダンパーをゆする。振幅がいちばん大きくなるのは $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${sqrtTeX(N)}$`, key: `t${wn},${z}`,
          verify: p => near(ev(strip(p.a)), peakNum(1, wn * wn, 2 * z * wn, 1, 2 * wn).w, 1e-6) || '山の ω がちがう' }, '6-99',
          '山の鋭さ（Q 値）ではなく、山の場所を聞いている。$\\omega_{\\mathrm n}\\sqrt{1-2\\zeta^2}$');
      },
    },
  });
})(globalThis.MONDAI);

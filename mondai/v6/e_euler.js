/* 問題集 第6巻　第5部 オイラーの公式と双曲線関数（わざ 6-61〜6-75、6-95・6-96）　組 e
 * 書き方は v6/README.md（第6巻の手引き）、v5/README.md、v4/README.md。文は教科書 第6巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 虚数単位は j（教科書と同じ）。j・e を変数の名前に使わない。複素数の答えは check.js が j を虚数単位として読む（M.evalC）。
 * 6-10 の角はラジアンで、偏角は $-\pi<\theta\leqq\pi$（P-7）。交流の位相（6-64・6-65・6-67・6-96）は教科書 6-10⑨⑩ と同じく度で書く。
 * 電卓は使わない：$\tan^{-1}$・$\cosh$・$\sinh$・$\tanh$・$e^{\square}$ の値は問題の文に書く（1問に2つまで。P-4）。
 * 近似値は、使う値とけたを文に書き、文の値で計算した答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（O-4。gv）。近似の答えは「約」と ≈。
 * 微分の答えは calc（diff）、微分方程式の解は calc（ode）。複素数・近似値・ことばは verify(p) で、別の道すじで計算し直す。
 * わなは、そのわざ自身で解けない問題にして、答えにかならず行き先（わざの番号か「わざなし」）を書く（N-3。dest）。
 * 同じ見開きで、入れかえただけの問題・逆の問題（s1 の答えを s2 で問う）は key でよける（N-2・O-2）。左ページの「楽な形」の例の数は、問題に出さない（O-2）。
 * 図は 6-61・6-64（複素平面 M.cplane）と 6-74（M.graph）のステップ3だけ（K-2・P-2）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(8));                       // 0.30000000004 → 0.3
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const numOf = t => M.evalMath(strip(t), {});
  const cOf = t => M.evalC(strip(t), {});
  const close = (x, y, tol) => x != null && y != null && Math.abs(x - y) <= (tol || 1e-7) * Math.max(1, Math.abs(x), Math.abs(y));
  const cClose = (x, y, tol) => !!x && !!y && Math.hypot(x[0] - y[0], x[1] - y[1]) <= (tol || 1e-7) * Math.max(1, Math.hypot(y[0], y[1]));
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // 四捨五入（小数第 k 位まで）と、文で与えた値で出した答え vG・ほんとうの値 vT が同じになるけた（v5 組 e と同じ。O-4）
  const rd = (v, k) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k + 1e-7) / 10 ** k).toFixed(k);
  const exactDec = (v, k) => Math.abs(v * 10 ** k - Math.round(v * 10 ** k)) < 1e-7;
  function gv(vG, vT, kmax, kmin) {
    for (let k = kmax == null ? 3 : kmax; k >= (kmin == null ? 1 : kmin); k--) {
      if (rd(vG, k) !== rd(vT, k)) continue;
      return exactDec(vG, k) ? { ans: rd(vG, k), note: '', k } : { ans: rd(vG, k), note: `、小数第${k}位まで`, k };
    }
    return null;
  }
  // 近似の答え：ほんとうの値 vT を、答えのけたで丸めると答えになるか
  function nearTrue(ans, vT) {
    const t = strip(ans), d = (t.split('.')[1] || '').length;
    return Math.abs(numOf(t) - vT) <= 0.5 * 10 ** -d + 1e-9 || `答え ${t} が、ほんとうの値 ${vT} を丸めた数でない`;
  }
  const valIs = (ans, v, tol) => (close(numOf(ans), v, tol) || `答え ${ans} の値が ${v} でない`);
  const cIs = (ans, z, tol) => (cClose(cOf(ans), z, tol) || `答え ${ans} の値が ${z[0]}+${z[1]}j でない`);

  // √ をふくむ数 n/d·√s（s は平方因数なし）
  function sq(m) { let k = 1, s = m; for (let f = 2; f * f <= s; f++) while (s % (f * f) === 0) { s /= f * f; k *= f; } return [k, s]; }
  function S(n, d, s) {
    d = d || 1; s = s || 1;
    if (n === 0) return { n: 0, d: 1, s: 1 };
    const [k, t] = sq(s); n *= k; s = t;
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); return { n: n / g, d: d / g, s };
  }
  const Smul = (a, b) => S(a.n * b.n, a.d * b.d, a.s * b.s);
  const Sneg = a => S(-a.n, a.d, a.s);
  const Sval = a => a.n / a.d * Math.sqrt(a.s);
  const Sadd = (a, b) => { if (a.n === 0) return b; if (b.n === 0) return a; if (a.s !== b.s) throw new Error('Sadd：√ の中がちがう'); return S(a.n * b.d + b.n * a.d, a.d * b.d, a.s); };
  const Seq = (a, b) => a.n === b.n && a.d === b.d && a.s === b.s;
  // TeX：\frac{\sqrt{3}}{2}、-2\sqrt{2}、\frac{3}{2}
  function Stex(a) {
    if (a.n === 0) return '0';
    const sg = a.n < 0 ? '-' : '', A = Math.abs(a.n), rt = a.s === 1 ? '' : `\\sqrt{${a.s}}`;
    const top = (A === 1 && rt ? '' : String(A)) + rt;
    return a.d === 1 ? sg + top : `${sg}\\frac{${top}}{${a.d}}`;
  }
  // 虚部の項：j、-j、4j、\frac{1}{2}j、\sqrt{3}\,j、\frac{\sqrt{3}}{2}j（教科書の書き方）
  function imT(b) {
    if (b.n === 0) return '';
    const sg = b.n < 0 ? '-' : '', A = Math.abs(b.n);
    if (b.s === 1) return b.d === 1 ? `${sg}${A === 1 ? '' : A}j` : `${sg}\\frac{${A}}{${b.d}}j`;
    return b.d === 1 ? `${sg}${A === 1 ? '' : A}\\sqrt{${b.s}}\\,j` : `${sg}\\frac{${A === 1 ? '' : A}\\sqrt{${b.s}}}{${b.d}}j`;
  }
  function cT(re, im) {
    const a = re.n ? Stex(re) : '', b = imT(im);
    if (!a && !b) return '0';
    if (!a) return b;
    if (!b) return a;
    return a + (b[0] === '-' ? '' : '+') + b;
  }
  const hasFrac = t => /\\frac/.test(t);
  // e の前の大きさ：2、\sqrt{2}\,、3\sqrt{2}\,（1 は書かない）
  const rT = r => (r.n === 1 && r.d === 1 && r.s === 1 ? '' : Stex(r) + (r.s !== 1 ? '\\,' : ''));

  // 角 θ=pπ/q を [p, q]（q>0、約分ずみ）で
  const Ang = (p, q) => { const g = gcd(p, q); return [p / g, q / g]; };
  const angAdd = (a, b) => Ang(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const angMul = (a, n) => Ang(a[0] * n, a[1]);
  const angNorm = a => { let [p, q] = a; while (p > q) p -= 2 * q; while (p <= -q) p += 2 * q; return Ang(p, q); };   // (-π, π]
  const angVal = a => a[0] * Math.PI / a[1];
  const angDeg = a => 180 * a[0] / a[1];
  const angEq = (a, b) => a[0] === b[0] && a[1] === b[1];
  // 肩の計算の結果 raw が (-π, π] をはみ出したら、2π をたす・ひく所も書く（radT は下で定義。呼ぶのは問題を作るとき）
  const angTo = raw => { const n = angNorm(raw); return angEq(raw, n) ? radT(n) : `${radT(raw)}$。$2\\pi$ を${raw[0] > 0 ? 'ひいて' : 'たして'} $${radT(n)}`; };
  // 肩：j3\pi/4・-j\pi/2・j\pi
  function jAng(a) { const [p, q] = a; if (p === 0) return '0'; const sg = p < 0 ? '-' : '', P = Math.abs(p); return `${sg}j${P === 1 ? '' : P}\\pi${q === 1 ? '' : '/' + q}`; }
  const EJ = (a, r) => `${r ? rT(r) : ''}e^{${jAng(a)}}`;
  // ラジアンの文字：\frac{3\pi}{4}・-\frac{\pi}{2}・\pi
  function radT(a) { const [p, q] = a; if (p === 0) return '0'; const sg = p < 0 ? '-' : '', P = Math.abs(p), top = (P === 1 ? '' : P) + '\\pi'; return q === 1 ? sg + top : `${sg}\\frac{${top}}{${q}}`; }
  // cos・sin（特別な角）。[cos, sin] を √ の数で
  const BASE = { 0: [S(1), S(0)], 30: [S(1, 2, 3), S(1, 2)], 45: [S(1, 2, 2), S(1, 2, 2)], 60: [S(1, 2), S(1, 2, 3)], 90: [S(0), S(1)] };
  function trig(a) {
    let d = ((angDeg(a) % 360) + 360) % 360; d = Math.round(d * 1e6) / 1e6;
    const b = x => { const v = BASE[x]; if (!v) throw new Error('特別な角でない: ' + angDeg(a)); return v; };
    if (d <= 90) return b(d);
    if (d <= 180) { const [c, s] = b(180 - d); return [Sneg(c), s]; }
    if (d <= 270) { const [c, s] = b(d - 180); return [Sneg(c), Sneg(s)]; }
    const [c, s] = b(360 - d); return [c, Sneg(s)];
  }
  const special = a => { try { trig(a); return true; } catch (e) { return false; } };
  // 区画のことば
  function where(a) {
    const d = ((angDeg(a) % 360) + 360) % 360;
    if (d === 0) return '右（横の軸の上）';
    if (d === 90) return '真上';
    if (d === 180) return '左（横の軸の上）';
    if (d === 270) return '真下';
    return d < 90 ? '右上' : d < 180 ? '左上' : d < 270 ? '左下' : '右下';
  }
  const degT = a => `$${fmt(angDeg(a))}^{\\circ}$`;
  // e^x・e^{-x}（x=1 は e と e^{-1}。教科書と同じ）
  const eP = x => (x === 1 ? 'e' : `e^{${fmt(x)}}`), eM = x => `e^{-${fmt(x)}}`;

  // ---------------------------------------------------------------- 見わけようの判定の部品
  // { … } を1つ読む（s[i] が '{'）。[中身, 次の位置]
  function brace(s, i) { let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { d--; if (!d) break; } } return [s.slice(i + 1, j), j + 1]; }
  // \frac{分子}{分母}・\dfrac{分子}{分母} の組
  function fracs(q) {
    const out = []; let i = 0;
    for (;;) { const k = q.indexOf('frac{', i); if (k < 0) break; i = k + 4; if (!/\\d?$/.test(q.slice(Math.max(0, k - 2), k))) continue; const [a, j] = brace(q, k + 4); if (q[j] !== '{') continue; const [b] = brace(q, j); out.push([a, b]); }
    return out;
  }
  // e の右肩（e^{…} の中身）
  const shoulders = q => { const out = []; let i = 0; for (;;) { const k = q.indexOf('e^{', i); if (k < 0) break; const [a, j] = brace(q, k + 2); out.push(a); i = j; } return out; };
  const pureJ = sh => /^-?j/.test(sh) || /^-?\d*(?:\.\d+)?j\d*(?:\.\d+)?t$/.test(sh) || /^-?j\\omega t$/.test(sh);   // 肩が j の式だけ
  // 波：係数・sin か cos・ωt の係数・ずれ（\sin(\omega t+60^{\circ})、4\cos\omega t、100\sin2\omega t）
  function waves(q) {
    const out = [];
    const re = /(\d+(?:\.\d+)?)?\\(sin|cos)\s*(?:\(\s*(\d*)\\omega t\s*([+-]\s*\d+(?:\.\d+)?\^\{\\circ\})?\s*\)|(\d*)\\omega t)/g;
    for (const m of q.matchAll(re)) out.push({ A: m[1] ? +m[1] : 1, fn: m[2], w: +(m[3] != null ? m[3] || 1 : m[5] || 1), ph: m[4] ? +m[4].replace(/\^\{\\circ\}|\s/g, '') : 0 });
    return out;
  }

  // ---------------------------------------------------------------- わなの行き先（第36回 N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」を書く。extra：ほかの部のわざで楽になるときの番号（fits では見つからないので、ここで足す）
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(6).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 5 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // 特別な角（6-10 の表の仲間）
  const ANG = [[1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [1, 1], [-1, 6], [-1, 4], [-1, 3], [-1, 2], [-2, 3], [-3, 4], [-5, 6]];
  const isAxis = a => a[1] <= 2;   // 0・±π/2・π（軸の上）

  // ================================================================ 6-61
  // 単位円（半径 R の円）と、角 θ の点の図（ステップ3）
  //   bare：円と目もりを書かない（a+bj から re^{jθ} を求める問題。大きさは答えなので）
  function circFig(R, a, lab, angLab, bare) {
    const L = 1.4, G = M.cplane({ x0: -L, x1: L, y0: -L, y1: L, w: 5.6, h: 5.6 });
    const th = angVal(a), P = [Math.cos(th), Math.sin(th)], d = angDeg(a);
    const dir = (P[1] >= 0 ? 'n' : 's') + (P[0] >= 0 ? 'e' : 'w');
    const d0 = Math.min(0, d), d1 = Math.max(0, d), mid = (d0 + d1) / 2 * Math.PI / 180, ra = 0.32 * G.sx;
    return {
      s: 5,
      items: [
        // 横の軸の目もりは書かない（角のラベルと重なる。半径は文に書く）。O は弧と矢印のない側に
        ...G.axes(Object.assign({ o: d > 0 ? 'sw' : 'nw' }, bare ? {} : { yt: [1], yfmt: () => (R === 1 ? '$j$' : `$${R}j$`) })),
        ...(bare ? [] : [['circle', G.T(0, 0), G.sx]]),
        ['seg', G.T(0, 0), G.T(P[0], P[1]), { arrow: true }],
        ['dot', G.T(P[0], P[1])], ['label', G.T(P[0], P[1]), lab, dir],
        ['arc', [0, 0], ra, d0, d1],
        ['label', [(ra + 0.75) * Math.cos(mid), (ra + 0.75) * Math.sin(mid)], angLab, 'c'],
      ],
    };
  }
  M.add({
    id: '6-61', part: 5, chap: '6-10⑥⑦ 例題1・2', stars: 1,
    title: '$e^{j\\theta}$ ⇄ $a+bj$：ラジアンを度に直して、単位円の上の点を読む（反対は $r$ と区画で $\\theta$）',
    mark: '$e^{j\\square}$ を $a+bj$ に、$a+bj$ を $re^{j\\theta}$ に（$-\\pi<\\theta\\leqq\\pi$）。',
    futsu: ['$\\cos\\dfrac{3\\pi}{4}$ と $\\sin\\dfrac{3\\pi}{4}$ を、', 'ラジアンのまま思い出そうとする。'],
    raku: ['$e^{j3\\pi/4}$ → 135°（左上）→ $-\\dfrac{\\sqrt{2}}{2}+\\dfrac{\\sqrt{2}}{2}j$', '$4e^{-j\\pi/2}$ → 右回りに90°（真下）→ $-4j$', '$1-j$ → $r=\\sqrt{2}$、右下で $-\\dfrac{\\pi}{4}$ → $\\sqrt{2}\\,e^{-j\\pi/4}$'],
    why: '$e^{j\\theta}=\\cos\\theta+j\\sin\\theta$ は、単位円の上の角 $\\theta$ の点（6-10①⑥）。$\\pi$ ラジアンが180°なので、度に直すと点の場所がすぐわかる。$re^{j\\theta}$ は、その点を原点から $r$ 倍した点で、6-9 の極形式 $r(\\cos\\theta+j\\sin\\theta)$ と同じ。反対は、$r$ を三平方で出し、点の区画を見てから $\\theta$ を決める（6-9）。',
    caution: '$\\theta$ はラジアン（$e^{j60}$ は60ラジアン回した点。×）。$e^{j\\theta}$ の大きさはいつも1。肩に実部がある $e^{1+j\\pi}$ は、$e\\times e^{j\\pi}$ に分けてから（わざ 6-68）。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: { s1: '30mm', s2: '24mm', s3: '30mm', trap: '18mm' },
    fits(q) {
      if (/\\times|\)\^\{|\\cos|\\sin|微分|積分/.test(q) || fracs(q).some(([a, b]) => /e\^/.test(a + b))) return false;
      const sh = shoulders(q);
      if (/re\^\{j\\theta\}/.test(q) && /の形/.test(q)) return sh.filter(s => s !== 'j\\theta').length === 0;
      return sh.length === 1 && pureJ(sh[0]) && /\\pi/.test(sh[0]) && /a\+bj/.test(q);
    },
    steps: {
      // e^{jθ}・re^{jθ} を a+bj に
      s1(r) {
        const a = r.pick(ANG.concat([[-1, 1]])), R = r.pick([1, 1, 1, 2, 3, 4, 6]);
        if ((R === 1 && angEq(a, [3, 4])) || (R === 4 && angEq(a, [-1, 2]))) return null;   // 楽な形の例（O-2）
        const [c, s] = trig(a), Rs = S(R), ans = cT(Smul(Rs, c), Smul(Rs, s)), th = angVal(a);
        return {
          q: `$a+bj$ の形に：$${EJ(a, Rs)}=□$`, a: `$${ans}$`, key: `${R},${angNorm(a)}`, boxh: hasFrac(ans) ? '12mm' : null,
          easy: `$${radT(a)}$ は ${degT(a)}（${where(a)}）→ $${ans}$`, easyCheck: 'last',
          verify: p => cIs(p.a, [R * Math.cos(th), R * Math.sin(th)]),
        };
      },
      // a+bj を re^{jθ} に（−π<θ≦π）。key は s1 と同じ形（同じ点の逆の問題を出さない。N-2）
      s2(r) {
        const a = r.pick(ANG.concat([[1, 1]]));
        let R;
        if (a[1] === 4) R = r.pick([S(1, 1, 2), S(2, 1, 2), S(3, 1, 2), S(2), S(4)]);
        else if (a[1] === 1 || a[1] === 2) R = S(r.pick([2, 3, 4, 5]));
        else R = S(r.pick([2, 4, 6]));
        if (Seq(R, S(1, 1, 2)) && angEq(a, [-1, 4])) return null;   // 楽な形の例 1−j（O-2）
        const [c, s] = trig(a), re = Smul(R, c), im = Smul(R, s), z = cT(re, im), ans = `${rT(R)}e^{${jAng(a)}}`;
        const th = angVal(a), rv = Sval(R), r2 = Sval(re) ** 2 + Sval(im) ** 2;
        return {
          q: `$re^{j\\theta}$ の形に（$-\\pi<\\theta\\leqq\\pi$）：$${z}=□$`, a: `$${ans}$`, key: `${fmt(rv)},${a}`,
          easy: `$r=\\sqrt{${fmt(r2)}}${Number.isInteger(rv) ? `=${fmt(rv)}` : (R.n > 1 ? `=${Stex(R)}` : '')}$。${where(a)}の点で $\\theta=${radT(a)}$`, easyCheck: false,
          verify: p => {
            const t = strip(p.a), m = /e\^\{(.+)\}$/.exec(t); if (!m) return '形が re^{jθ} でない';
            const e = cOf(m[1]); if (!e || Math.abs(e[0]) > 1e-12 || !(e[1] > -Math.PI + 1e-9 && e[1] <= Math.PI + 1e-9)) return '角が −π<θ≦π にない';
            return cIs(p.a, [Sval(re), Sval(im)]);
          },
        };
      },
      // 図：単位円（半径 R の円）の上の点
      s3(r) {
        const a = r.pick(ANG.filter(x => !isAxis(x)));
        if (r.chance(0.6)) {
          const R = r.pick([1, 1, 2, 3]);
          if (R === 1 && angEq(a, [3, 4])) return null;
          const [c, s] = trig(a), Rs = S(R), ans = cT(Smul(Rs, c), Smul(Rs, s)), th = angVal(a);
          return {
            q: `図の点Pは、原点を中心とする半径${R}の円の上の、角 $${radT(a)}$ の点（$${EJ(a, Rs)}$）。Pを $a+bj$ の形で表すと　□`, a: `$${ans}$`, key: `${R},${a}`,
            fig: circFig(R, a, 'P', `$${radT(a)}$`), boxh: hasFrac(ans) ? '12mm' : null,
            easy: `$${radT(a)}$ は ${degT(a)}（${where(a)}）→ $${ans}$`, easyCheck: 'last',
            verify: p => cIs(p.a, [R * Math.cos(th), R * Math.sin(th)]),
          };
        }
        const R = a[1] === 4 ? r.pick([S(1, 1, 2), S(2, 1, 2)]) : S(2);
        if (Seq(R, S(1, 1, 2)) && angEq(a, [-1, 4])) return null;
        const [c, s] = trig(a), re = Smul(R, c), im = Smul(R, s), z = cT(re, im), ans = `${rT(R)}e^{${jAng(a)}}`, rv = Sval(R);
        const fig = circFig(1, a, `$${z}$`, '$\\theta$', true);
        return {
          q: `図の点を $re^{j\\theta}$ の形に（$-\\pi<\\theta\\leqq\\pi$）：$${z}=□$`, a: `$${ans}$`, key: `${fmt(rv)},${a}`, fig,
          easy: `$r=${Stex(R)}$。${where(a)}の点で $\\theta=${radT(a)}$`, easyCheck: false,
          verify: p => cIs(p.a, [Sval(re), Sval(im)]),
        };
      },
      // わな：肩に実部がある（6-68）
      trap(r) {
        const [sg, sT, ang] = r.pick([[1, '1', [1, 1]], [2, '2', [1, 1]], [2, '2', [1, 2]], [2, '2', [-1, 2]], [-1, '-1', [1, 1]], [-1, '-1', [1, 2]], [3, '3', [1, 1]]]);
        const E1 = sg === 1 ? 'e' : `e^{${sg}}`, [c, s] = trig(ang), cv = Sval(c), sv = Sval(s);
        const ans = cv ? (cv < 0 ? '-' : '') + E1 : (sv < 0 ? '-' : '') + E1 + 'j';
        const sh = `${sT}${jAng(ang)[0] === '-' ? '' : '+'}${jAng(ang)}`, val = Math.exp(sg);
        return dest({ key: `6-61trap${sg > 0 ? 'A' : 'B'}`, q: `$a+bj$ の形に：$e^{${sh}}=□$`, a: `$${ans}$`,
          verify: p => cIs(p.a, [val * cv, val * sv]) }, '6-61', `肩に実部 $${sg}$ がある。$${E1}\\times e^{${jAng(ang)}}$ に分ける`, ['6-68']);
      },
    },
  });

  // ================================================================ 6-62
  // 1/12 の角もふくめる（かける・わる数）。答えの角が特別な角になる組だけ使う
  const ANG12 = [[1, 12], [5, 12], [1, 6], [1, 4], [1, 3], [1, 2], [2, 3], [3, 4], [5, 6], [-1, 12], [-1, 6], [-1, 4], [-1, 3], [-1, 2], [-2, 3]];
  const POWB = [   // (a+bj) と、その大きさ・角
    { z: '1+j', R: S(1, 1, 2), a: [1, 4] }, { z: '1-j', R: S(1, 1, 2), a: [-1, 4] }, { z: '-1+j', R: S(1, 1, 2), a: [3, 4] }, { z: '-1-j', R: S(1, 1, 2), a: [-3, 4] },
    { z: '\\sqrt{3}+j', R: S(2), a: [1, 6] }, { z: '\\sqrt{3}-j', R: S(2), a: [-1, 6] }, { z: '1+\\sqrt{3}\\,j', R: S(2), a: [1, 3] }, { z: '1-\\sqrt{3}\\,j', R: S(2), a: [-1, 3] },
    { z: '-1+\\sqrt{3}\\,j', R: S(2), a: [2, 3] }, { z: '-\\sqrt{3}+j', R: S(2), a: [5, 6] },
  ];
  M.add({
    id: '6-62', part: 5, chap: '6-10④⑦ 例題3・4', stars: 1,
    title: '$re^{j\\theta}$ のかけ算・わり算・べきは、肩のたし算・ひき算・かけ算（大きさはかけ・わり・べき）',
    mark: '$re^{j\\theta}$ の積・商、$(a+bj)^n$（$n$ が大きい）。',
    futsu: ['$e^{j\\theta}$ をそれぞれ $a+bj$ に直してから、', 'かっこを展開してかける（$n$ 乗は $n$ 回）。'],
    raku: ['$2e^{j\\pi/6}\\times3e^{j\\pi/3}=6e^{j\\pi/2}=6j$', '$\\dfrac{6e^{j\\pi/2}}{2e^{j\\pi/6}}=3e^{j\\pi/3}=\\dfrac{3}{2}+\\dfrac{3\\sqrt{3}}{2}j$', '$(\\sqrt{3}+j)^6=(2e^{j\\pi/6})^6=64e^{j\\pi}=-64$'],
    why: '指数のきまり $e^ae^b=e^{a+b}$ が、$e^{j\\theta}$ でもそのまま成り立つ（6-10④）。だから $r_1e^{j\\theta_1}\\times r_2e^{j\\theta_2}=r_1r_2e^{j(\\theta_1+\\theta_2)}$、わり算は肩のひき算、$n$ 乗は肩を $n$ 倍（6-10⑦）。6-9 の「大きさはかけ算、角はたし算」と同じこと。',
    caution: 'たし算 $e^{ja}+e^{jb}$ は、肩のたし算にならない（$e^{j(a+b)}$ ではない。わざ 6-63・6-64）。答えの角が $\\pi$ をこえたら $2\\pi$ をひいて、単位円の上で読む。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 2, s3: 2, trap: 2 },   // かけ算の式と欄が2列では入らない
    boxw: { s1: '34mm', s2: '30mm', s3: '30mm', trap: '20mm' },
    fits(q) {
      const sh = shoulders(q);
      if (/\\times/.test(q) && sh.filter(pureJ).length >= 2 && !/\+\s*\d*e\^|-\s*\d*e\^\{-j/.test(q)) return true;
      if (fracs(q).some(([a, b]) => /e\^\{-?j/.test(a) && /e\^\{-?j/.test(b))) return true;
      return /\(([^()]*j[^()]*)\)\^\{\d+\}/.test(q) && !/\\omega/.test(q);
    },
    steps: {
      // かけ算
      s1(r) {
        const a = r.pick(ANG12), b = r.pick(ANG12), s = angNorm(angAdd(a, b));
        if (!special(s) || s[0] === 0) return null;
        const r1 = r.pick([1, 2, 3, 4, 5]), r2 = r.pick([1, 2, 3, 4]);
        if ((r1 === 2 && r2 === 3 && angEq(a, [1, 6]) && angEq(b, [1, 3])) || (r1 === 3 && r2 === 2 && angEq(a, [1, 3]) && angEq(b, [1, 6]))) return null;   // 楽な形の例（O-2）
        const R = r1 * r2, [c, sn] = trig(s), ans = cT(Smul(S(R), c), Smul(S(R), sn)), th = angVal(s);
        return {
          q: `$a+bj$ の形に：$${EJ(a, S(r1))}\\times ${EJ(b, S(r2))}=□$`, a: `$${ans}$`, key: `m${[String(a), String(b)].sort().join('|')}`, boxh: hasFrac(ans) ? '12mm' : null,
          easy: `大きさ $${r1}\\times${r2}=${R}$、肩 $${radT(a)}+${b[0] < 0 ? `\\Bigl(${radT(b)}\\Bigr)` : radT(b)}=${angTo(angAdd(a, b))}$ → $${EJ(s, S(R))}=${ans}$`, easyCheck: 'last',
          verify: p => cIs(p.a, [R * Math.cos(angVal(a) + angVal(b)), R * Math.sin(angVal(a) + angVal(b))]),
        };
      },
      // わり算
      s2(r) {
        const a = r.pick(ANG12.concat([[1, 1]])), b = r.pick(ANG12), s = angNorm(angAdd(a, [-b[0], b[1]]));
        if (!special(s) || s[0] === 0) return null;
        const r2 = r.pick([1, 2, 3, 4]), k = r.pick([1, 2, 3, 4]), r1 = r2 * k;
        if (r1 === 6 && r2 === 2 && angEq(a, [1, 2]) && angEq(b, [1, 6])) return null;   // 楽な形の例（O-2）
        const [c, sn] = trig(s), ans = cT(Smul(S(k), c), Smul(S(k), sn));
        const num = EJ(a, S(r1)), den = EJ(b, S(r2));
        return {
          q: `$a+bj$ の形に：$\\dfrac{${num}}{${den}}=□$`, a: `$${ans}$`, key: `d${a},${b}`, boxh: '12mm',
          easy: `大きさ $${r1}\\div${r2}=${k}$、肩 $${radT(a)}-${b[0] < 0 ? `\\Bigl(${radT(b)}\\Bigr)` : radT(b)}=${angTo(angAdd(a, [-b[0], b[1]]))}$ → $${EJ(s, S(k))}=${ans}$`, easyCheck: 'last',
          verify: p => cIs(p.a, [k * Math.cos(angVal(a) - angVal(b)), k * Math.sin(angVal(a) - angVal(b))]),
        };
      },
      // べき：(a+bj)^n を極形式で
      s3(r) {
        const B = r.pick(POWB), n = r.int(3, B.R.s === 2 ? 8 : 6);
        if (B.z === '\\sqrt{3}+j' && n === 6) return null;   // 楽な形の例（O-2）
        const s = angNorm(angMul(B.a, n)), Rn = (() => { let x = S(1); for (let i = 0; i < n; i++) x = Smul(x, B.R); return x; })();
        const [c, sn] = trig(s), ans = cT(Smul(Rn, c), Smul(Rn, sn));
        const zv = cOf(B.z);
        return {
          q: `$a+bj$ の形に：$(${B.z})^{${n}}=□$`, a: `$${ans}$`, key: `p${Math.abs(B.a[0])},${B.a[1]},${n}`, boxh: hasFrac(ans) ? '12mm' : null,
          easy: `$${B.z}=${EJ(B.a, B.R)}$ → $${Stex(Rn)}e^{j${n}\\times${radT(B.a).replace(/^-/, '(-') + (B.a[0] < 0 ? ')' : '')}}${s[0] ? `=${EJ(s, Rn)}` : ''}=${ans}$`, easyCheck: 'last',
          verify: p => { let w = [1, 0]; for (let i = 0; i < n; i++) w = [w[0] * zv[0] - w[1] * zv[1], w[0] * zv[1] + w[1] * zv[0]]; return cIs(p.a, w); },
        };
      },
      // わな：たし算・ひき算は肩のたし算にならない（6-63）
      trap(r) {
        const a = r.pick([[1, 3], [1, 4], [1, 6], [2, 3], [3, 4], [5, 6]]), plus = r.chance(0.6), [c, s] = trig(a);
        const ans = plus ? Stex(Smul(S(2), c)) : imT(Smul(S(2), s)), th = angVal(a);
        return dest({ key: `6-62trap${plus ? 'A' : 'B'}`, q: `$a+bj$ の形に：$e^{${jAng(a)}}${plus ? '+' : '-'}e^{-${jAng(a)}}=□$`, a: `$${ans}$`,
          verify: p => cIs(p.a, plus ? [2 * Math.cos(th), 0] : [0, 2 * Math.sin(th)]) },
        '6-62', `たし算${plus ? '' : '・ひき算'}は肩のたし算にならない。$e^{-j\\theta}$ は $e^{j\\theta}$ の共役で、${plus ? '和は実部の2倍' : '差は虚部の $2j$ 倍'}`);
      },
    },
  });

  // ================================================================ 6-63
  const k63 = (t, a) => `${t}${Math.abs(a[0])},${a[1]}`;   // θ と −θ は同じ数の問題（N-2）。c・s は2でわった形、C・S はわらない形
  const T63 = [[1, 4], [1, 3], [2, 3], [3, 4], [5, 6], [1, 1], [-1, 4], [-1, 3], [-2, 3], [-3, 4], [-5, 6]];   // ±π/6・±π/2 は楽な形の例なので出さない（O-2）
  const EV = [[0.5, '1.649', '0.607'], [1, '2.718', '0.368'], [1.5, '4.482', '0.223'], [2, '7.389', '0.135'], [0.2, '1.221', '0.819'], [0.4, '1.492', '0.670'], [3, '20.09', '0.050'], [2.5, '12.18', '0.082']];
  M.add({
    id: '6-63', part: 5, chap: '6-10⑧ 例題5', stars: 1,
    title: '$\\cos\\theta=\\dfrac{e^{j\\theta}+e^{-j\\theta}}{2}$、$\\sin\\theta=\\dfrac{e^{j\\theta}-e^{-j\\theta}}{2j}$（$e^{-j\\theta}$ は共役。和は実部の2倍、差は虚部の $2j$ 倍）',
    mark: '$e^{j\\theta}$ と $e^{-j\\theta}$ のたし算・ひき算（$\\dfrac{e^{j\\theta}\\pm e^{-j\\theta}}{\\square}$）。',
    futsu: ['$e^{j\\theta}$ と $e^{-j\\theta}$ を、2つとも $a+bj$ に直してから、', '実部どうし・虚部どうしをたす（ひく）。'],
    raku: ['$\\theta=\\dfrac{\\pi}{6}$：和は実部の2倍 $\\sqrt{3}$ → $\\dfrac{\\sqrt{3}}{2}$', '差は虚部の $2j$ 倍 $j$ → $2j$ でわって $\\dfrac{1}{2}$', '$\\theta=\\dfrac{\\pi}{2}$ なら、$\\cos$ は0、$\\sin$ は1'],
    why: '$e^{-j\\theta}=\\cos\\theta-j\\sin\\theta$ は $e^{j\\theta}$ の共役（横の軸で裏返した点。6-10④）。たすと虚部が消えて $2\\cos\\theta$、ひくと実部が消えて $2j\\sin\\theta$ が残る（6-10⑧）。だから、1つだけ $a+bj$ に直せば、答えは実部か虚部を読むだけ。',
    caution: '$\\sin$ の式は $2j$ でわる（2でわるだけだと $j\\sin\\theta$ になる）。肩に $j$ がない $\\dfrac{e^{x}+e^{-x}}{2}$ は $\\cosh x$（わざ 6-69）。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: 2,
    boxw: '22mm', boxh: '12mm',
    fits(q) {
      if (/\\times/.test(q) || fracs(q).some(([, b]) => /e\^/.test(b))) return false;   // わり算（6-62）
      const sh = shoulders(q).filter(pureJ), bodies = sh.map(s => s.replace(/^-/, ''));
      return sh.some(s => s[0] !== '-' && sh.includes('-' + s)) && bodies.length >= 2 && !/\\(sin|cos)/.test(q);
    },
    steps: {
      // θ を決めて、cos・sin の式
      s1(r) {
        const a = r.pick(T63), cs = a[1] === 1 || r.chance(0.5), [c, s] = trig(a), ans = Stex(cs ? c : s), th = angVal(a);
        const f = cs ? '\\dfrac{e^{j\\theta}+e^{-j\\theta}}{2}' : '\\dfrac{e^{j\\theta}-e^{-j\\theta}}{2j}';
        const z = cT(c, s);
        return {
          q: `$\\theta=${radT(a)}$ のとき、$${f}=□$`, a: `$${ans}$`, key: k63(cs ? 'c' : 's', a),
          easy: cs ? `$e^{j\\theta}=${z}$。和は実部の2倍 $${Stex(Smul(S(2), c))}$ → $${ans}$` : `$e^{j\\theta}=${z}$。差は虚部の $2j$ 倍 $${imT(Smul(S(2), s)) || '0'}$ → $${ans}$`, easyCheck: 'last',
          verify: p => cIs(p.a, M.evalC(f, { theta: th })),
        };
      },
      // 2でわらない・2j でわらない（j sin θ が残る）
      s2(r) {
        const a = r.pick(T63.filter(x => x[0] !== 1 || x[1] !== 1)), k = r.int(0, 2), [c, s] = trig(a), th = angVal(a);
        const E1 = `e^{${jAng(a)}}`, E2 = `e^{${jAng([-a[0], a[1]])}}`;
        let q, ans, easy;
        if (k === 0) { q = `$${E1}+${E2}=□$`; ans = Stex(Smul(S(2), c)); easy = `和は実部の2倍：$2\\cos${a[0] < 0 ? `\\Bigl(${radT(a)}\\Bigr)` : radT(a)}=${ans}$`; }
        else if (k === 1) { q = `$a+bj$ の形に：$${E1}-${E2}=□$`; ans = imT(Smul(S(2), s)); easy = `差は虚部の $2j$ 倍：$2j\\sin${a[0] < 0 ? `\\Bigl(${radT(a)}\\Bigr)` : radT(a)}=${ans}$`; }
        else { q = `$a+bj$ の形に：$\\dfrac{${E1}-${E2}}{2}=□$`; ans = imT(s); easy = `差は $2j\\sin\\theta$ なので、2でわると $j\\sin\\theta$：$${ans}$`; }
        const ex = `e^{j\\theta}${k === 0 ? '+' : '-'}e^{-j\\theta}`, f = k === 2 ? `\\frac{${ex}}{2}` : ex;
        return {
          q, a: `$${ans}$`, key: k63(k === 0 ? 'C' : 'S', a), easy, easyCheck: 'last',
          verify: p => cIs(p.a, M.evalC(f, { theta: th })),
        };
      },
      // 見かけがちがう：係数つき、j でわる、2θ
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const a = r.pick(T63.filter(x => x[1] !== 1)), m = r.pick([3, 4, 5, 10]), [c] = trig(a), ans = Stex(Smul(S(2 * m), c));
          return { q: `$${m}e^{${jAng(a)}}+${m}e^{${jAng([-a[0], a[1]])}}=□$`, a: `$${ans}$`, key: k63('C', a),
            easy: `$${m}\\,(e^{j\\theta}+e^{-j\\theta})=${m}\\times2\\cos\\theta$ → $${ans}$`, easyCheck: 'last',
            verify: p => cIs(p.a, [2 * m * Math.cos(angVal(a)), 0]) };
        }
        if (k === 1) {
          const a = r.pick(T63.filter(x => x[1] !== 1)), [, s] = trig(a), ans = Stex(Smul(S(2), s));
          return { q: `$\\dfrac{e^{${jAng(a)}}-e^{${jAng([-a[0], a[1]])}}}{j}=□$`, a: `$${ans}$`, key: k63('S', a),
            easy: `分子は $2j\\sin\\theta$。$j$ でわると $2\\sin\\theta$ → $${ans}$`, easyCheck: 'last',
            verify: p => cIs(p.a, [2 * Math.sin(angVal(a)), 0]) };
        }
        const [a, cs] = [r.pick([[1, 8], [3, 8], [5, 12], [-1, 8]]), r.chance(0.5)], a2 = angMul(a, 2), [c, s] = trig(a2), ans = Stex(cs ? c : s);
        const f = cs ? '\\dfrac{e^{j2\\theta}+e^{-j2\\theta}}{2}' : '\\dfrac{e^{j2\\theta}-e^{-j2\\theta}}{2j}';
        return { q: `$\\theta=${radT(a)}$ のとき、$${f}=□$`, a: `$${ans}$`, key: k63(cs ? 'c' : 's', a2),
          easy: `$\\${cs ? 'cos' : 'sin'}2\\theta=\\${cs ? 'cos' : 'sin'}${radT(a2)}=${ans}$`, easyCheck: 'last',
          verify: p => cIs(p.a, M.evalC(f, { theta: angVal(a) })) };
      },
      // わな：肩に j がない（6-69 の cosh・sinh）
      trap(r) {
        const [x, ep, em] = r.pick(EV.slice(0, 4)), plus = r.chance(0.6);
        const vG = plus ? (+ep + +em) / 2 : (+ep - +em) / 2, vT = plus ? Math.cosh(x) : Math.sinh(x), g = gv(vG, vT, 3);
        if (!g) return null;
        const xs = fmt(x);
        return dest({ key: `6-63trap${plus ? 'A' : 'B'}`, q: `$${eP(x)}=${ep}$、$${eM(x)}=${em}$ として、$\\dfrac{${eP(x)}${plus ? '+' : '-'}${eM(x)}}{2}$ は約 □${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`,
          verify: p => nearTrue(p.a, vT) }, '6-63', `肩に $j$ がないので、回る点ではない。$\\${plus ? 'cosh' : 'sinh'}${xs}$ の定義そのもの`);
      },
    },
  });

  // ================================================================ 6-64
  // a sin + b cos の組（3・4・5 などの三角形）と、tan^{-1}(b/a) の値（小数第1位）
  const PYT = [[4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25], [20, 21, 29], [21, 20, 29], [30, 40, 50], [40, 30, 50]];   // 3・4 は楽な形の例（O-2）。key は b÷a（4・3 と 40・30 は同じ角）
  const atanD = (b, a) => +(Math.atan2(b, a) * 180 / Math.PI).toFixed(1);
  const phT = d => (d === 0 ? '' : d > 0 ? `+${fmt(d)}^{\\circ}` : `-${fmt(-d)}^{\\circ}`);
  const sinT = (A, d, fn) => `${A === 1 ? '' : A}\\${fn || 'sin'}${d ? `(\\omega t${phT(d)})` : '\\omega t'}`;
  // 振幅 R・位相 d の答えが、a sin + b cos とほぼ同じか（位相は小数第1位なので、ずれは R×0.001 まで）
  function waveIs(ans, f, amp) {
    for (const x of [0.37, 1.21, 2.53, 4.1]) {
      const v = M.evalMath(strip(ans), { omega: 1, t: x }); if (v == null) return `答え ${ans} が読めない`;
      const w = f(x); if (Math.abs(v - w) > 1e-3 * (amp || 1) + 1e-9) return `答え ${ans} の値が ${w} とちがう（ωt=${x}）`;
    }
    return true;
  }
  // 2本のフェーザ（a と bj）と和の図
  function phasorFig(a, b) {
    const m = Math.max(Math.abs(a), Math.abs(b)), k = 4 / m;
    const x0 = Math.min(0, a) - 0.25 * m, x1 = Math.max(0, a) + 0.3 * m, y0 = Math.min(0, b) - 0.25 * m, y1 = Math.max(0, b) + 0.3 * m;
    const G = M.cplane({ x0, x1, y0, y1, w: (x1 - x0) * k, h: (y1 - y0) * k }), T = G.T;
    const d = Math.atan2(b, a) * 180 / Math.PI, ra = 1.0, mid = d / 2 * Math.PI / 180;
    return {
      s: 5,
      items: [
        ...G.axes({ o: b < 0 ? 'nw' : 'sw' }),
        ['seg', T(0, 0), T(a, 0), { arrow: true }], ['seg', T(0, 0), T(0, b), { arrow: true }],
        ['seg', T(a, 0), T(a, b), { dash: true }], ['seg', T(0, b), T(a, b), { dash: true }],
        ['seg', T(0, 0), T(a, b), { arrow: true, thick: true }],
        ['label', T(a / 2, 0), `$${a}$`, b < 0 ? 'n' : 's'], ['label', T(0, b / 2), `$${b === 1 ? '' : b === -1 ? '-' : b}j$`, 'w'],
        ['arc', [0, 0], ra, Math.min(0, d), Math.max(0, d)], ['label', [(ra + 0.55) * Math.cos(mid), (ra + 0.55) * Math.sin(mid)], '$\\phi$', 'c'],
      ],
    };
  }
  M.add({
    id: '6-64', part: 5, chap: '6-10⑨ 例題6・7', stars: 1,
    title: '同じ $\\omega$ の波のたし算は、フェーザ（$\\sin$ は横、$\\cos$ は上向きの矢印）のたし算。和の長さが振幅、角が位相',
    mark: '角振動数が同じ $\\sin$・$\\cos$ の和と「1つの $\\sin$ の形で」「振幅」。',
    futsu: ['加法定理で $\\sin(\\omega t+\\phi)$ を広げて、', '$\\sin\\omega t$ と $\\cos\\omega t$ の係数をくらべる。'],
    raku: ['$3\\sin\\omega t+4\\cos\\omega t$ → フェーザ $3$ と $4j$', '和 $3+4j$ → 長さ5、角 $\\tan^{-1}\\dfrac{4}{3}=53.1^{\\circ}$', '→ $5\\sin(\\omega t+53.1^{\\circ})$'],
    why: '同じ $\\omega$ で回る矢印は、あいだの角が変わらないので、たした矢印も同じ速さで回る。影（虚部）はたし算になるので、波の和は矢印の和で計算できる（6-10⑨）。$A\\sin(\\omega t+\\alpha)$ のフェーザは長さ $A$、角 $\\alpha$ の矢印 $Ae^{j\\alpha}$ で、$\\cos\\omega t=\\sin(\\omega t+90^{\\circ})$ は上向き（$j$）。',
    caution: '振幅は、振幅どうしのたし算ではない（ずれがあると和はへる）。角振動数がちがう波（$\\sin\\omega t$ と $\\sin2\\omega t$）は、1つの $\\sin$ にならない。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },   // 図が2つ入るので、ステップ2は3問（4問では右ページがあふれる）
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '38mm', s2: '14mm', s3: '38mm', trap: '24mm' },
    fits(q) { const w = waves(q); return w.length >= 2 && w.every(x => x.w === w[0].w) && /1つの|振幅/.test(q) && !/\\times/.test(q); },
    steps: {
      // a sin ωt + b cos ωt（b は負もある）
      s1(r) {
        const [a, b0, R] = r.pick(PYT), b = r.chance(0.3) ? -b0 : b0, d = atanD(b, a);
        const q0 = `${a}\\sin\\omega t${b < 0 ? '-' : '+'}${Math.abs(b)}\\cos\\omega t`, ans = sinT(R, d);
        return {
          q: `1つの $\\sin$ の形に（$\\tan^{-1}\\frac{${b0}}{${a}}=${fmt(Math.abs(d))}^{\\circ}$）：$${q0}=□$`, a: `$${ans}$`, key: `p${fmt(b0 / a)}`,
          easy: `フェーザの和 $${cT(S(a), S(b))}$。大きさ $\\sqrt{${a * a}+${b * b}}=${R}$、角 $${fmt(d)}^{\\circ}$ → $${ans}$`, easyCheck: 'last',
          verify: p => (atanD(b0, a) === Math.abs(d) && waveIs(p.a, x => a * Math.sin(x) + b * Math.cos(x), R)),
        };
      },
      // ずれが60°・120°の2つの波の振幅（a²±ab+b² が平方数になる組）
      s2(r) {
        const [a, b, del, c] = r.pick([[3, 5, 60, 7], [5, 3, 60, 7], [7, 8, 60, 13], [8, 7, 60, 13], [5, 16, 60, 19], [16, 5, 60, 19], [3, 8, 120, 7], [8, 3, 120, 7], [5, 8, 120, 7], [8, 5, 120, 7], [7, 15, 120, 13], [15, 7, 120, 13]]);
        const sg = r.chance(0.3) ? -1 : 1, k = r.pick([1, 10, 20]), A = a * k, B = b * k, C = c * k, dd = sg * del;
        const re = A + B * Math.cos(dd * Math.PI / 180), im2 = 3 * B * B / 4;
        return {
          q: `$${A}\\sin\\omega t+${B}\\sin(\\omega t${phT(dd)})$ を1つの $\\sin$ の形にしたときの振幅　□`, a: `$${C}$`, key: `e${a},${b},${del}`,
          easy: `フェーザ $${A}+${B}e^{${dd < 0 ? '-' : ''}j${del === 60 ? '\\pi/3' : '2\\pi/3'}}=${fmt(re)}${dd < 0 ? '-' : '+'}${imT(S(B, 2, 3))}$。大きさ $\\sqrt{${fmt(re * re)}+${fmt(im2)}}=\\sqrt{${C * C}}=${C}$`, easyCheck: 'last',
          verify: p => valIs(p.a, Math.hypot(re, B * Math.sin(dd * Math.PI / 180))),
        };
      },
      // 図：2本のフェーザと和（ステップ1と同じ key）
      s3(r) {
        const [a, b0, R] = r.pick(PYT.filter(x => x[2] <= 29)), b = r.chance(0.4) ? -b0 : b0, d = atanD(b, a);
        const q0 = `${a}\\sin\\omega t${b < 0 ? '-' : '+'}${Math.abs(b)}\\cos\\omega t`, ans = sinT(R, d);
        return {
          q: `図は $${q0}$ の2つのフェーザと、その和。1つの $\\sin$ の形に（$\\tan^{-1}\\frac{${b0}}{${a}}=${fmt(Math.abs(d))}^{\\circ}$）：$${q0}=□$`, a: `$${ans}$`, key: `p${fmt(b0 / a)}`, fig: phasorFig(a, b),
          easy: `和の矢印 $${cT(S(a), S(b))}$。長さ $\\sqrt{${a * a}+${b * b}}=${R}$、角 $\\phi=${fmt(d)}^{\\circ}$ → $${ans}$`, easyCheck: 'last',
          verify: p => waveIs(p.a, x => a * Math.sin(x) + b * Math.cos(x), R),
        };
      },
      // わな：かけ算（2倍角）、角振動数がちがう（1つの sin にならない）
      trap(r) {
        if (r.chance(0.5)) {
          const [a, b] = r.pick([[3, 4], [2, 5], [4, 5], [3, 2]]), ans = `${a * b / 2 === 1 ? '' : fmt(a * b / 2)}\\sin2\\omega t`;
          return dest({ key: '6-64trapA', q: `1つの $\\sin$ の形に：$${a}\\sin\\omega t\\times${b}\\cos\\omega t=□$`, a: `$${ans}$`,
            verify: p => waveIs(p.a.replace(/2\\omega t/, '(2\\omega t)'), x => a * b * Math.sin(x) * Math.cos(x)) }, '6-64', 'たし算ではなく、かけ算。フェーザのたし算は使えない。2倍角 $2\\sin\\omega t\\cos\\omega t=\\sin2\\omega t$（第4巻）');
        }
        const [A, B] = r.pick([[100, 100], [100, 50], [50, 100]]), [x, xs] = r.pick([[Math.PI / 2, '\\frac{\\pi}{2}'], [Math.PI / 6, '\\frac{\\pi}{6}'], [Math.PI / 4, '\\frac{\\pi}{4}'], [Math.PI / 3, '\\frac{\\pi}{3}']]);
        const v1 = trig(Ang(Math.round(x / Math.PI * 12), 12))[1], v2 = trig(Ang(Math.round(2 * x / Math.PI * 12), 12))[1];
        const t1 = Smul(S(A), v1), t2 = Smul(S(B), v2);
        let ans; try { ans = Stex(Sadd(t1, t2)); } catch (e) { ans = Stex(t1) + (t2.n < 0 ? '' : '+') + Stex(t2); }
        if (t2.n === 0) ans = Stex(t1);
        return dest({ key: '6-64trapB', q: `$\\omega t=${xs}$ のとき、$${A}\\sin\\omega t+${B}\\sin2\\omega t=□$`, a: `$${ans}$`,
          verify: p => valIs(p.a, A * Math.sin(x) + B * Math.sin(2 * x)) }, '6-64', '角振動数がちがうので、2本の矢印は同じ速さで回らない（1つの $\\sin$ にならない）。$\\omega t$ をそのまま入れる');
      },
    },
  });

  // ================================================================ 6-65
  const DEL = [60, 90, 120, -60, -90, -120];
  const ampT = (A, del) => { const h = Math.abs(del) / 2; return h === 30 ? `${A}\\sqrt{3}` : h === 45 ? `${A}\\sqrt{2}` : `${A}`; };
  M.add({
    id: '6-65', part: 5, chap: '6-10⑨ 例題6 の先', stars: 2,
    title: '振幅が同じ2つの波（ずれ $\\delta$）の和は、振幅 $2A\\cos\\dfrac{\\delta}{2}$、位相 $\\dfrac{\\delta}{2}$（ひし形の対角線）',
    mark: '振幅が同じで、ずれだけがちがう2つの $\\sin$（$\\cos$）の和。',
    futsu: ['2本目のフェーザを $a+bj$ に直して、', 'たしてから、大きさと角を計算する。'],
    raku: ['$100\\sin\\omega t+100\\sin(\\omega t+60^{\\circ})$', '→ 振幅 $200\\cos30^{\\circ}=100\\sqrt{3}\\approx173$、位相30°', '120°ずれなら $200\\cos60^{\\circ}=100$、位相60°'],
    why: '長さが同じ2本の矢印でできる平行四辺形はひし形。和はひし形の対角線で、2本の矢印のまん中の向き（角 $\\frac{\\delta}{2}$）を向く。対角線の半分は $A\\cos\\frac{\\delta}{2}$ なので、長さは $2A\\cos\\frac{\\delta}{2}$（6-10⑨のフェーザの和を、ひし形で見たもの）。',
    caution: '振幅がちがう2つの波には使えない（わざ 6-64）。ずれが180°なら $\\cos90^{\\circ}=0$ で、和は0（打ち消しあう）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '40mm', s3: '40mm', trap: '14mm' },
    fits(q) { const w = waves(q); return w.length === 2 && w.every(x => x.w === w[0].w && x.A === w[0].A && x.fn === w[0].fn) && /1つの|振幅/.test(q) && !/\\times/.test(q); },
    steps: {
      // 振幅だけ
      s1(r) {
        const A = r.pick([10, 20, 30, 40, 50, 60, 80, 200]), del = r.pick(DEL), ans = ampT(A, del), h = Math.abs(del) / 2;
        return {
          q: `$${A}\\sin\\omega t+${A}\\sin(\\omega t${phT(del)})$ を1つの $\\sin$ の形にしたときの振幅　□`, a: `$${ans}$`, key: `${A},${Math.abs(del)}`,
          easy: `$2\\times${A}\\cos${h}^{\\circ}=${ans}$`, easyCheck: 'last',
          verify: p => valIs(p.a, Math.hypot(A + A * Math.cos(del * Math.PI / 180), A * Math.sin(del * Math.PI / 180))),
        };
      },
      // 1つの sin の形
      s2(r) {
        const A = r.pick([10, 20, 30, 40, 50, 60, 80, 200]), del = r.pick(DEL), amp = ampT(A, del), h = del / 2, ans = `${amp}\\sin(\\omega t${phT(h)})`;
        return {
          q: `1つの $\\sin$ の形に：$${A}\\sin\\omega t+${A}\\sin(\\omega t${phT(del)})=□$`, a: `$${ans}$`, key: `${A},${Math.abs(del)}`,
          easy: `振幅 $2\\times${A}\\cos${Math.abs(h)}^{\\circ}=${amp}$、位相はまん中の $${fmt(h)}^{\\circ}$ → $${ans}$`, easyCheck: 'last',
          verify: p => waveIs(p.a, x => A * Math.sin(x) + A * Math.sin(x + del * Math.PI / 180)),
        };
      },
      // 見かけがちがう：はじめの位相が0でない・cos の波
      s3(r) {
        const A = r.pick([10, 20, 50, 60, 80, 200]), del = r.pick([60, 90, 120]);
        if (r.chance(0.5)) {
          const al = r.pick([10, 20, 30, -30, -40]), be = al + del, mid = (al + be) / 2, amp = ampT(A, del), ans = `${amp}\\sin${mid ? `(\\omega t${phT(mid)})` : `\\omega t`}`;
          return {
            q: `1つの $\\sin$ の形に：$${A}\\sin(\\omega t${phT(al)})+${A}\\sin(\\omega t${phT(be)})=□$`, a: `$${ans}$`, key: `${A},${del}`,
            easy: `ずれは $${del}^{\\circ}$。振幅 $2\\times${A}\\cos${del / 2}^{\\circ}=${amp}$、位相はまん中の $${fmt(mid)}^{\\circ}$ → $${ans}$`, easyCheck: 'last',
            verify: p => waveIs(p.a, x => A * Math.sin(x + al * Math.PI / 180) + A * Math.sin(x + be * Math.PI / 180)),
          };
        }
        const amp = ampT(A, del), ans = `${amp}\\cos(\\omega t${phT(del / 2)})`;
        return {
          q: `1つの $\\cos$ の形に：$${A}\\cos\\omega t+${A}\\cos(\\omega t${phT(del)})=□$`, a: `$${ans}$`, key: `${A},${del}`,
          easy: `$\\cos$ も同じ（矢印を90°回して見るだけ）。振幅 $2\\times${A}\\cos${del / 2}^{\\circ}=${amp}$、位相 $${del / 2}^{\\circ}$ → $${ans}$`, easyCheck: 'last',
          verify: p => { const v = x => M.evalMath(strip(p.a), { omega: 1, t: x }); for (const x of [0.4, 1.7, 3.1]) if (!close(v(x), A * Math.cos(x) + A * Math.cos(x + del * Math.PI / 180), 1e-6)) return 'ちがう'; return true; },
        };
      },
      // わな：振幅がちがう（6-64）、角振動数がちがう
      trap(r) {
        if (r.chance(0.4)) {
          const A = r.pick([50, 100]), [n, x, xs] = r.pick([[2, Math.PI / 2, '\\frac{\\pi}{2}'], [3, Math.PI / 2, '\\frac{\\pi}{2}'], [3, Math.PI / 6, '\\frac{\\pi}{6}']]);
          const v = A * Math.sin(x) + A * Math.sin(n * x), ans = fmt(Math.round(v * 1e6) / 1e6);
          return dest({ key: '6-65trapB', q: `$\\omega t=${xs}$ のとき、$${A}\\sin\\omega t+${A}\\sin${n}\\omega t=□$`, a: `$${ans}$`,
            verify: p => valIs(p.a, v) }, '6-65', '振幅は同じでも、角振動数がちがう（ずれの角が時間で変わる）。$\\omega t$ をそのまま入れる');
        }
        const [a, b, del, c] = r.pick([[3, 5, 60, 7], [5, 3, 60, 7], [3, 8, 120, 7], [8, 5, 120, 7], [7, 8, 60, 13]]), k = r.pick([10, 20]);
        return dest({ key: '6-65trapA', q: `$${a * k}\\sin\\omega t+${b * k}\\sin(\\omega t+${del}^{\\circ})$ を1つの $\\sin$ の形にしたときの振幅　□`, a: `$${c * k}$`,
          verify: p => valIs(p.a, Math.hypot(a * k + b * k * Math.cos(del * Math.PI / 180), b * k * Math.sin(del * Math.PI / 180))) }, '6-65', '振幅がちがうので、ひし形にならない。フェーザを $a+bj$ に直してたす');
      },
    },
  });

  // ================================================================ 6-66
  // 複素数の関数 f(t) の n 回微分（数値）と、答えの式がそろうか
  function cDerivIs(ans, f, n) {
    const h = 1e-3;
    for (const t of [0.37, 0.83, 1.29]) {
      const v = M.evalC(strip(ans), { t }); if (!v) return `答え ${ans} が読めない`;
      const F0 = f(t), Fp = f(t + h), Fm = f(t - h), F2p = f(t + 2 * h), F2m = f(t - 2 * h);
      const d = n === 1 ? [(Fp[0] - Fm[0]) / (2 * h), (Fp[1] - Fm[1]) / (2 * h)]
        : n === 2 ? [(Fp[0] - 2 * F0[0] + Fm[0]) / (h * h), (Fp[1] - 2 * F0[1] + Fm[1]) / (h * h)]
          : [(F2p[0] - 2 * Fp[0] + 2 * Fm[0] - F2m[0]) / (2 * h ** 3), (F2p[1] - 2 * Fp[1] + 2 * Fm[1] - F2m[1]) / (2 * h ** 3)];
      if (!cClose(v, d, 1e-4)) return `答え ${ans} の値が ${n} 回微分とちがう（t=${t}）`;
    }
    return true;
  }
  const ejw = (c, w) => t => [c * Math.cos(w * t), c * Math.sin(w * t)];
  const jcoef = (n, d) => { const g = gcd(n, d); n /= g; d /= g; const sg = n < 0 ? '-' : '', A = Math.abs(n); return d === 1 ? `${sg}${A === 1 ? '' : A}j` : `${sg}\\frac{${A === 1 ? '' : A}j}{${d}}`; };
  M.add({
    id: '6-66', part: 5, chap: '6-10③⑩ 例題8', stars: 1,
    title: '$e^{j\\omega t}$ の微分は $j\\omega$ をかける（$\\omega$ 倍・90°進む）。積分は $j\\omega$ でわる（$\\dfrac{1}{j}=-j$。90°おくれる）',
    mark: '$e^{j\\square t}$ の微分・2回微分・積分と「何倍し、何度回したもの」。',
    futsu: ['$e^{j\\omega t}=\\cos\\omega t+j\\sin\\omega t$ に直して、', '実部と虚部を1つずつ微分する。'],
    raku: ['$e^{j2t}$ の微分 → $2j$ をかけて $2je^{j2t}$（2倍・90°進む）', '2回微分 → $(2j)^2=-4$ → $-4e^{j2t}$（180°）', '積分 → $\\dfrac{1}{2j}=-\\dfrac{j}{2}$ → $-\\dfrac{j}{2}e^{j2t}$（90°おくれる）'],
    why: '$(e^{at})\'=ae^{at}$ は $a=j\\omega$ でも成り立つ（6-10③⑩）。$j\\omega=\\omega e^{j\\pi/2}$ は「大きさ $\\omega$、角90°」の数なので、かけると $\\omega$ 倍して90°進む。2回微分は $(j\\omega)^2=-\\omega^2$、積分は $\\dfrac{1}{j\\omega}=-\\dfrac{j}{\\omega}$ をかける。',
    caution: '$j^2=-1$ を忘れない（2回微分は $-\\omega^2$ 倍）。$\\dfrac{1}{j}=-j$（$\\dfrac{j}{j^2}$）。肩に $j$ がない $e^{-2t}$ の微分は、回らない（$(e^{at})\'=ae^{at}$ のまま）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 2,
    boxw: { s1: '24mm', s2: '24mm', s3: '18mm', trap: '20mm' },
    boxh: { s2: '12mm', s3: '12mm' },
    fits(q) { return shoulders(q).some(s => /^-?\d*j\d*t$|^-?j\\omega t$/.test(s)) && /\\dd|微分|積分/.test(q); },
    steps: {
      // 1回微分（係数つき）
      s1(r) {
        const w = r.pick([3, 4, 5, 6, 10]), c = r.pick([1, 1, 2, 3, 4, -1, -2]), sw = w === 1 ? '' : w;
        const f = `${c === 1 ? '' : c === -1 ? '-' : c}e^{j${sw}t}`, ans = `${jcoef(c * w, 1)}e^{j${sw}t}`;
        return {
          q: `$\\dfrac{\\dd}{\\dd t}\\bigl(${f}\\bigr)=□$`, a: `$${ans}$`, key: `${w},${c}`,
          easy: `$${w}j$ をかける → $${ans}$`, easyCheck: 'last',
          verify: p => cDerivIs(p.a, ejw(c, w), 1),
        };
      },
      // 2回微分・積分（微分すると □e^{jωt} になる数）
      s2(r) {
        const w = r.pick([3, 4, 5, 6, 10]), c = r.pick([1, 1, 2, 3, -1]);
        const f = `${c === 1 ? '' : c === -1 ? '-' : c}e^{j${w}t}`;
        if (r.chance(0.5)) {
          const ans = `${fmt(-c * w * w)}e^{j${w}t}`;
          return { q: `$\\dfrac{\\dd^2}{\\dd t^2}\\bigl(${f}\\bigr)=□$`, a: `$${ans}$`, key: `d${w}`, boxh: null,
            easy: `$(${w}j)^2=-${w * w}$ をかける → $${ans}$`, easyCheck: 'last',
            verify: p => cDerivIs(p.a, ejw(c, w), 2) };
        }
        const ans = jcoef(-c, w);
        return { q: `$\\dfrac{\\dd}{\\dd t}\\bigl(□\\,e^{j${w}t}\\bigr)=${f}$`, a: `$${ans}$`, key: `i${w}`,
          easy: c === 1 ? `$\\frac{1}{${w}j}=-\\frac{j}{${w}}$ → $${ans}$` : `$${c}\\times\\frac{1}{${w}j}=${c}\\times\\Bigl(-\\frac{j}{${w}}\\Bigr)=${ans}$`, easyCheck: 'last',
          verify: p => { const k = cOf(p.a); if (!k) return '読めない'; const kk = k; return cDerivIs(`${c}e^{j${w}t}`, t => { const z = [Math.cos(w * t), Math.sin(w * t)]; return [kk[0] * z[0] - kk[1] * z[1], kk[0] * z[1] + kk[1] * z[0]]; }, 1); } };
      },
      // 見かけがちがう：何倍か・3回微分・e^{-jωt}
      s3(r) {
        const k = r.int(0, 2), w = r.pick([3, 4, 5, 6]);
        if (k === 0) {
          const integ = r.chance(0.5);
          return { q: integ ? `$e^{j${w}t}$ を積分すると（積分定数は考えない）、もとの矢印を □ 倍して、90°おくらせたものになる` : `$e^{j${w}t}$ を微分すると、もとの矢印を □ 倍して、90°進めたものになる`,
            a: integ ? `$\\frac{1}{${w}}$` : `$${w}$`, key: integ ? `i${w}` : `${w},1`, boxh: integ ? '12mm' : null,
            easy: integ ? `$\\frac{1}{j${w}}=-\\frac{j}{${w}}=\\frac{1}{${w}}e^{-j\\pi/2}$ → $\\frac{1}{${w}}$` : `$j${w}=${w}e^{j\\pi/2}$ → $${w}$`, easyCheck: 'last',
            verify: p => valIs(p.a, integ ? 1 / w : w) };
        }
        if (k === 1) {
          const ans = `-${w ** 3}je^{j${w}t}`;
          return { q: `$\\dfrac{\\dd^3}{\\dd t^3}e^{j${w}t}=□$`, a: `$${ans}$`, key: `t${w}`, boxh: null,
            easy: `$(${w}j)^3=${w ** 3}j^3=-${w ** 3}j$ → $${ans}$`, easyCheck: 'last',
            verify: p => cDerivIs(p.a, ejw(1, w), 3) };
        }
        const ans = `-${w}je^{-j${w}t}`;
        return { q: `$\\dfrac{\\dd}{\\dd t}e^{-j${w}t}=□$`, a: `$${ans}$`, key: `n${w}`, boxh: null,
          easy: `$-${w}j$ をかける（右回りの矢印。90°おくれる向き）→ $${ans}$`, easyCheck: 'last',
          verify: p => cDerivIs(p.a, ejw(1, -w), 1) };
      },
      // わな：肩に j がない
      trap(r) {
        const a = r.pick([-2, -3, 2, 3, -0.5]), c = r.pick([1, 3, 5]), f = `${c === 1 ? '' : c}e^{${a === -1 ? '-' : a}t}`, ans = `${fmt(c * a)}e^{${a}t}`;
        return dest({ key: `6-66trap${a > 0 ? 'A' : 'B'}`, q: `$\\dfrac{\\dd}{\\dd t}\\bigl(${f}\\bigr)=□$`, a: `$${ans}$`, calc: { kind: 'diff', f, x: 't' } },
          '6-66', `肩に $j$ がないので、回らない。$(e^{at})'=ae^{at}$（第5巻）で、$${a}$ 倍するだけ`);
      },
    },
  });

  // ================================================================ 6-67
  const wOf = f => 2 * 3.14 * f;   // π=3.14 で
  const muF = c => `$${c}\\,\\mathrm{\\mu F}$`;
  M.add({
    id: '6-67', part: 5, chap: '6-10⑩ 例題9・10', stars: 1,
    title: '交流の電流：コンデンサーは振幅 $\\omega CV$ で90°進む、コイルは振幅 $\\dfrac{V}{\\omega L}$ で90°おくれる（$\\omega=2\\pi f$）',
    mark: '静電容量かインダクタンスと、$v=V\\sin\\omega t$〔V〕・周波数〔Hz〕。電流の振幅とずれ。',
    futsu: ['$v=V\\sin\\omega t$ を微分（積分）して $i$ の式を作り、', '$\\cos$ を $\\sin(\\omega t\\pm90^{\\circ})$ に直して読む。'],
    raku: ['$10\\,\\mathrm{\\mu F}$・100 V・50 Hz → $\\omega=2\\times3.14\\times50=314$', '電流のフェーザ $j\\omega CV=314\\times10^{-5}\\times100\\,j$ → 約0.31 A、90°進む', '0.1 H なら $\\dfrac{100}{31.4j}$ → 約3.2 A、90°おくれる'],
    why: 'コンデンサーは $i=C\\dfrac{\\dd v}{\\dd t}$ で、微分は $j\\omega$ をかけること（6-10⑩）。だから電流のフェーザは $j\\omega C\\times V$：長さ $\\omega CV$、角90°。コイルは $v=L\\dfrac{\\dd i}{\\dd t}$ なので、電圧が $j\\omega L$ 倍。電流は電圧を $j\\omega L$ でわって、長さ $\\dfrac{V}{\\omega L}$、角 $-90^{\\circ}$。',
    caution: '$\\mu$ は $10^{-6}$（$10\\,\\mathrm{\\mu F}=10^{-5}\\,\\mathrm{F}$）。コイルは $j\\omega L$ を「かける」のではなく「わる」。抵抗はオームの法則で、ずれはない。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: { s1: '16mm', s2: '16mm', s3: '36mm', trap: '14mm' },
    fits(q) { return /コンデンサー|コイル/.test(q) && /Hz/.test(q) && /電流/.test(q); },
    steps: {
      // コンデンサー
      s1(r) {
        const C = r.pick([5, 10, 20, 40, 50, 100]), V = r.pick([100, 200]), f = r.pick([50, 60]);
        if (C === 10 && V === 100 && f === 50) return null;   // 楽な形の例（O-2）
        const w = wOf(f), vG = w * C * 1e-6 * V, vT = 2 * Math.PI * f * C * 1e-6 * V, g = gv(vG, vT, 3, 1);
        if (!g) return null;
        return {
          q: `静電容量 ${muF(C)} のコンデンサーに、$v=${V}\\sin\\omega t$〔V〕、周波数 $${f}\\,\\mathrm{Hz}$ の電圧をかける。電流の振幅は約 □ A（$\\pi=3.14$、小数第${g.k}位まで）`, a: `$${g.ans}$`, key: `C${C},${V},${f}`,
          easy: `$\\omega=2\\times3.14\\times${f}=${fmt(w)}$、$j\\omega CV$ の長さ $${fmt(w)}\\times${C}\\times10^{-6}\\times${V}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$（90°進む）`, easyCheck: false,
          verify: p => nearTrue(p.a, vT),
        };
      },
      // コイル
      s2(r) {
        const L = r.pick([0.05, 0.1, 0.2, 0.5, 1]), V = r.pick([100, 200]), f = r.pick([50, 60]);
        if (L === 0.1 && V === 100 && f === 50) return null;   // 楽な形の例（O-2）
        const w = wOf(f), vG = V / (w * L), vT = V / (2 * Math.PI * f * L), g = gv(vG, vT, 2, 1);
        if (!g) return null;
        return {
          q: `インダクタンス $${L}\\,\\mathrm{H}$ のコイルに、$v=${V}\\sin\\omega t$〔V〕、周波数 $${f}\\,\\mathrm{Hz}$ の電圧をかける。電流の振幅は約 □ A（$\\pi=3.14$、小数第${g.k}位まで）`, a: `$${g.ans}$`, key: `L${L},${V},${f}`,
          easy: `$\\omega L=2\\times3.14\\times${f}\\times${L}=${fmt(w * L)}$。$\\frac{${V}}{${fmt(w * L)}j}$ の長さ $\\approx${g.ans}$（90°おくれる）`, easyCheck: false,
          verify: p => nearTrue(p.a, vT),
        };
      },
      // 電流の式（sin の形）
      s3(r) {
        const cap = r.chance(0.5), V = 100, f = 50, w = wOf(f);
        const X = cap ? r.pick([20, 50, 100]) : r.pick([0.2, 0.5, 1]);
        const vG = cap ? w * X * 1e-6 * V : V / (w * X), vT = cap ? 2 * Math.PI * f * X * 1e-6 * V : V / (2 * Math.PI * f * X), g = gv(vG, vT, cap ? 3 : 2, 1);
        if (!g) return null;
        const ans = `${g.ans}\\sin(\\omega t${cap ? '+' : '-'}90^{\\circ})`;
        return {
          q: `${cap ? `静電容量 ${muF(X)} のコンデンサー` : `インダクタンス $${X}\\,\\mathrm{H}$ のコイル`}に、$v=${V}\\sin\\omega t$〔V〕（$${f}\\,\\mathrm{Hz}$）の電圧をかける。電流を $\\sin$ の形で（$\\pi=3.14$、振幅は小数第${g.k}位まで）：$i\\approx□$`, a: `$${ans}$`, key: `${cap ? 'C' : 'L'}${X},${V},${f}`,
          easy: `${cap ? '$j\\omega CV$' : '$\\frac{V}{j\\omega L}$'} → 長さ $${g.ans}$、角 $${cap ? '' : '-'}90^{\\circ}$ → $${ans}$`, easyCheck: 'last',
          verify: p => { const m = /^([\d.]+)\\sin\(\\omega t([+-])90\^\{\\circ\}\)$/.exec(strip(p.a)); if (!m) return '形がちがう'; return (m[2] === (cap ? '+' : '-')) && nearTrue(m[1], vT); },
        };
      },
      // わな：抵抗（ずれなし）、直流の RC（時定数。6-03）
      trap(r) {
        if (r.chance(0.5)) {
          const R = r.pick([20, 25, 40, 50]), V = r.pick([100, 200]);
          return dest({ key: '6-67trapA', q: `抵抗 $${R}\\,\\Omega$ に、$v=${V}\\sin\\omega t$〔V〕、周波数 $50\\,\\mathrm{Hz}$ の電圧をかける。電流の振幅は □ A`, a: `$${fmt(V / R)}$`,
            verify: p => valIs(p.a, V / R) }, '6-67', 'コンデンサーでもコイルでもない。オームの法則で電圧÷抵抗、ずれもない');
        }
        const [R, C] = r.pick([[20, 100], [50, 20], [10, 50], [40, 50]]);
        return dest({ key: '6-67trapB', q: `$${R}\\,\\mathrm{k\\Omega}$ の抵抗と ${muF(C)} のコンデンサーを直列にして、$10\\,\\mathrm{V}$ の電池（直流）につなぐ。時定数 $RC$ は □ 秒`, a: `$${fmt(R * C / 1000)}$`,
          verify: p => valIs(p.a, R * 1000 * C * 1e-6) }, '6-67', '交流ではなく直流の電池。時定数は $RC$ で、k と μ を数に直す', ['6-03']);
      },
    },
  });

  // ================================================================ 6-68
  const SIG = [-2, -3, -0.5, 1, -0.2, -4];   // −1（と ω=2）は楽な形の例（O-2）
  const expT = (s, v) => `e^{${s === 1 ? '' : s === -1 ? '-' : s}${v}}`;
  const trigW = (fn, w) => `\\${fn}${w === 1 ? ' ' : w}t`;
  // e^{(σ+jω)t} の TeX
  const sjT = (s, w) => `e^{(${s}${w < 0 ? '-' : '+'}${Math.abs(w) === 1 ? '' : Math.abs(w)}j)t}`;
  function partIs(ans, s, w, fn, c) {
    for (const t of [0.37, 0.83, 1.29]) { const v = M.evalMath(strip(ans), { t }), z = M.evalC(`e^{(${s}+${w}j)t}`, { t }); if (v == null || !z) return '読めない'; if (!close(v, (c || 1) * z[fn === 'cos' ? 0 : 1], 1e-9)) return `答え ${ans} が ${fn === 'cos' ? '実部' : '虚部'} とちがう`; }
    return true;
  }
  M.add({
    id: '6-68', part: 5, chap: '6-10⑪ 例題10', stars: 1,
    title: '$e^{(\\sigma+j\\omega)t}$ の実部は $e^{\\sigma t}\\cos\\omega t$（肩を分けて $e^{\\sigma t}\\times e^{j\\omega t}$）',
    mark: '肩に実部と虚部がある $e$ の「実部」「虚部」と、その値。',
    futsu: ['$e^{(\\sigma+j\\omega)t}$ を $a+bj$ に直す方法がわからず、', 'テイラー展開から考えようとする。'],
    raku: ['$e^{(-1+2j)t}=e^{-t}\\times e^{j2t}$', '$e^{-t}$ は実数なので、実部は $e^{-t}\\cos2t$', '$t=\\dfrac{\\pi}{2}$ → $e^{-\\pi/2}\\cos\\pi=-e^{-\\pi/2}$'],
    why: '肩のたし算を逆に使うと $e^{(\\sigma+j\\omega)t}=e^{\\sigma t}e^{j\\omega t}$（6-10⑪）。$e^{j\\omega t}=\\cos\\omega t+j\\sin\\omega t$ に、実数 $e^{\\sigma t}$ がかかるだけなので、実部は $e^{\\sigma t}\\cos\\omega t$、虚部は $e^{\\sigma t}\\sin\\omega t$。長さが $e^{\\sigma t}$ で変わりながら回る、らせんの影。',
    caution: '実部に $j$ を残さない。$\\omega$ の符号を変えても実部は同じ（$\\cos$ は左右対称）。実部の式の微分は、積の微分（第5巻）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 2, trap: 1 },   // わなの答え（積の微分）が長い
    boxw: { s1: '24mm', s2: '22mm', s3: '24mm', trap: '40mm' },
    fits(q) { return shoulders(q).some(s => /^\(-?[\d.]*[+-][\d.]*j\)t$|^-?[\d.]+[+-]j/.test(s)) || (/実部|虚部/.test(q) && shoulders(q).length >= 2 && shoulders(q).some(s => /j/.test(s))); },
    steps: {
      // 実部の式
      s1(r) {
        const s = r.pick(SIG), w = r.pick([1, 2, 3, 4, 5]), ans = `${expT(s, 't')}${trigW('cos', w)}`.replace(/ $/, '');
        return {
          q: `$${sjT(s, w)}$ の実部（$t$ の式）`, a: `$${ans}$`, key: `${s},${w}`,
          easy: `$${expT(s, 't')}\\times e^{j${w === 1 ? '' : w}t}$。実部は $${ans}$`, easyCheck: false,
          verify: p => partIs(p.a, s, w, 'cos'),
        };
      },
      // 実部の値（e を残した形）
      s2(r) {
        const s = r.pick([-1, -2, -3, -0.5]), w = r.pick([1, 2, 3, 4]), a = r.pick([[1, 2], [1, 1], [1, 3], [2, 3], [1, 4]]);
        if (s === -1 && w === 2) return null;   // 楽な形の例（O-2）
        const tt = Ang(a[0], a[1] * w), wt = a;   // ωt を特別な角に：t=ωt/ω
        const [c] = trig(wt); if (c.n === 0) return null;
        const sp = s === -0.5 ? Ang(-tt[0], 2 * tt[1]) : Ang(s * tt[0], tt[1]);
        const ex = `e^{${sp[0] < 0 ? '-' : ''}${Math.abs(sp[0]) === 1 ? '' : Math.abs(sp[0])}\\pi${sp[1] === 1 ? '' : '/' + sp[1]}}`;
        const cv = Stex(c), ans = cv === '1' ? ex : cv === '-1' ? '-' + ex : `${cv}${ex}`;
        const tv = angVal(tt), val = Math.exp(s * tv) * Math.cos(w * tv);
        return {
          q: `$${sjT(s, w)}$ の実部の、$t=${radT(tt)}$ での値`, a: `$${ans}$`, key: `${s},${w}`, boxh: hasFrac(ans) ? '12mm' : null,
          easy: `実部 $${expT(s, 't')}${trigW('cos', w)}$ に入れて $${ex}\\cos${radT(wt)}=${ans}$`, easyCheck: 'last',
          verify: p => valIs(p.a, val),
        };
      },
      // 見かけがちがう：虚部・かけ算の形・係数つき・ω が負
      s3(r) {
        const k = r.int(0, 3), s = r.pick(SIG), w = r.pick([1, 2, 3, 4, 5]);
        if (k === 0) {
          const ans = `${expT(s, 't')}${trigW('sin', w)}`.replace(/ $/, '');
          return { q: `$${sjT(s, w)}$ の虚部（$t$ の式）`, a: `$${ans}$`, key: `${s},${w}`, easy: `虚部は $e^{j${w === 1 ? '' : w}t}$ の $\\sin$ の項 → $${ans}$`, easyCheck: false, verify: p => partIs(p.a, s, w, 'sin') };
        }
        if (k === 1) {
          const ans = `${expT(s, 't')}${trigW('cos', w)}`.replace(/ $/, '');
          return { q: `$${expT(s, 't')}e^{j${w === 1 ? '' : w}t}$ の実部（$t$ の式）`, a: `$${ans}$`, key: `${s},${w}`, easy: `$${expT(s, 't')}$ は実数 → $${ans}$`, easyCheck: false, verify: p => partIs(p.a, s, w, 'cos') };
        }
        if (k === 2) {
          const c = r.pick([2, 3, 5, 10]), ans = `${c}${expT(s, 't')}${trigW('cos', w)}`.replace(/ $/, '');
          return { q: `$${c}${sjT(s, w)}$ の実部（$t$ の式）`, a: `$${ans}$`, key: `${s},${w}`, easy: `$${c}$ は実数なのでそのまま → $${ans}$`, easyCheck: false, verify: p => partIs(p.a, s, w, 'cos', c) };
        }
        const ans = `${expT(s, 't')}${trigW('cos', w)}`.replace(/ $/, '');
        return { q: `$${sjT(s, -w)}$ の実部（$t$ の式）`, a: `$${ans}$`, key: `${s},${w}`, easy: `$\\cos(-${w === 1 ? '' : w}t)=\\cos${w === 1 ? ' ' : w}t$ → $${ans}$`, easyCheck: false, verify: p => partIs(p.a, s, -w, 'cos') };
      },
      // わな：実部の式の微分（積の微分）
      trap(r) {
        const s = r.pick([-1, -2, -3]), w = r.pick([2, 3, 4]), f = `${expT(s, 't')}\\cos${w}t`;
        if (s === -1 && w === 2) return null;   // 楽な形の例 e^{-t}cos2t（O-2）
        const ans = `${s === -1 ? '-' : s}${expT(s, 't')}\\cos${w}t-${w}${expT(s, 't')}\\sin${w}t`;
        return dest({ key: `6-68trap${s}`, q: `$\\dfrac{\\dd}{\\dd t}\\bigl(${f}\\bigr)=□$`, a: `$${ans}$`, calc: { kind: 'diff', f, x: 't' } },
          '6-68', '実部をとるのではなく、実部の式の微分。$e$ と $\\cos$ のかけ算なので、積の微分（第5巻）');
      },
    },
  });

  // ================================================================ 6-69
  const EVX = [[0.5, '1.649', '0.607'], [1.5, '4.482', '0.223'], [2, '7.389', '0.135'], [0.2, '1.221', '0.819'], [0.4, '1.492', '0.670'], [3, '20.09', '0.050'], [0.1, '1.105', '0.905'], [0.3, '1.350', '0.741']];   // x=1 は楽な形の例（O-2）
  const eVals = (x, ep, em) => `$${eP(x)}=${ep}$、$${eM(x)}=${em}$ として`;
  const hypT = (fn, x) => `\\${fn}${fmt(x)}`;
  M.add({
    id: '6-69', part: 5, chap: '6-11② 例題1', stars: 1,
    title: '$\\cosh x$・$\\sinh x$ は、$e^x$ と $e^{-x}$ の平均と、差の半分（$\\tanh=\\sinh\\div\\cosh$）',
    mark: '$e^{\\square}$・$e^{-\\square}$ の値と、$\\cosh$・$\\sinh$・$\\tanh$ の値。',
    futsu: ['電卓の hyp のキーをさがす。', '（電卓がないと、どうしてよいかわからない）'],
    raku: ['$e=2.718$、$e^{-1}=0.368$', '$\\cosh1=\\dfrac{2.718+0.368}{2}=1.543$、$\\sinh1=\\dfrac{2.350}{2}=1.175$', '$\\tanh1=\\dfrac{1.175}{1.543}\\approx0.762$'],
    why: '$\\cosh x=\\dfrac{e^{x}+e^{-x}}{2}$ は2つの高さの平均、$\\sinh x=\\dfrac{e^{x}-e^{-x}}{2}$ は差の半分（6-11①②）。$\\tanh x$ はその比。だから $e^x$ と $e^{-x}$ の値があれば、たし算・ひき算・わり算だけで求まる。$\\cosh x+\\sinh x=e^x$、$\\cosh x-\\sinh x=e^{-x}$ にもなる。',
    caution: '$\\sinh$ は差の半分（ひく順は $e^x-e^{-x}$）。$x$ を $-x$ にすると、$\\cosh$ は同じ値で、$\\sinh$ は符号だけが変わる。$e$ の値がなく、$\\sinh x$ の値だけがわかっているときは、わざ 6-70。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /e\^\{[\d.]+\}=|(^|[^\\])e=\d/.test(q) && (/\\(cosh|sinh|tanh)/.test(q) || fracs(q).some(([a, b]) => b === '2' && /e\^\{-/.test(a))); },
    steps: {
      // cosh x・sinh x
      s1(r) {
        const [x, ep, em] = r.pick(EVX), cs = r.chance(0.5);
        const vG = cs ? (+ep + +em) / 2 : (+ep - +em) / 2, vT = cs ? Math.cosh(x) : Math.sinh(x), g = gv(vG, vT, 3);
        if (!g) return null;
        return {
          q: `${eVals(x, ep, em)}、$${hypT(cs ? 'cosh' : 'sinh', x)}$ は約 □${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`, key: `${cs ? 'c' : 's'}${x}`,
          easy: `$\\frac{${ep}${cs ? '+' : '-'}${em}}{2}=\\frac{${fmt(cs ? +ep + +em : +ep - +em)}}{2}=${fmt(vG)}${g.note ? `\\approx${g.ans}` : ''}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT),
        };
      },
      // マイナスの x・cosh x ± sinh x
      s2(r) {
        const [x, ep, em] = r.pick(EVX), k = r.int(0, 3);
        if (k <= 1) {
          const cs = k === 0, vG = cs ? (+ep + +em) / 2 : -(+ep - +em) / 2, vT = cs ? Math.cosh(-x) : Math.sinh(-x), g = gv(vG, vT, 3);
          if (!g) return null;
          return {
            q: `${eVals(x, ep, em)}、$\\${cs ? 'cosh' : 'sinh'}(-${fmt(x)})$ は約 □${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`, key: `${cs ? 'c' : 's'}${x}`,
            easy: cs ? `$\\cosh(-x)=\\cosh x$（左右対称）→ $\\frac{${ep}+${em}}{2}${g.note ? '\\approx' : '='}${g.ans}$` : `$\\sinh(-x)=-\\sinh x$ → $-\\frac{${ep}-${em}}{2}${g.note ? '\\approx' : '='}${g.ans}$`, easyCheck: false,
            verify: p => nearTrue(p.a, vT),
          };
        }
        const plus = k === 2;
        return {
          q: `${eVals(x, ep, em)}、$${hypT('cosh', x)}${plus ? '+' : '-'}${hypT('sinh', x)}=□$`, a: `$${plus ? ep : em}$`, key: `${plus ? 'p' : 'm'}${x}`,
          easy: plus ? `平均と差の半分をたすと $${eP(x)}$ → $${ep}$` : `平均から差の半分をひくと $${eM(x)}$ → $${em}$`, easyCheck: false,
          verify: p => nearTrue(p.a, plus ? Math.exp(x) : Math.exp(-x)),
        };
      },
      // tanh x（小数第2位まで）
      s3(r) {
        const [x, ep, em] = r.pick(EVX.filter(v => v[0] <= 2 && v[0] >= 0.4)), sg = r.chance(0.25) ? -1 : 1;
        const vG = sg * (+ep - +em) / (+ep + +em), vT = Math.tanh(sg * x), g = gv(vG, vT, 2, 2);
        if (!g) return null;
        return {
          q: `${eVals(x, ep, em)}、$\\tanh${sg < 0 ? `(-${fmt(x)})` : fmt(x)}$ は約 □（小数第2位まで）`, a: `$${g.ans}$`, key: `t${x}`,
          easy: `$${sg < 0 ? '-' : ''}\\frac{${ep}-${em}}{${ep}+${em}}=${sg < 0 ? '-' : ''}\\frac{${fmt(+ep - +em)}}{${fmt(+ep + +em)}}\\approx${g.ans}$（2でわる所は消える）`, easyCheck: false,
          verify: p => nearTrue(p.a, vT),
        };
      },
      // わな：e の値がなく、cosh x の値だけ（6-70）
      trap(r) {
        const [a, b, c] = r.pick([[4, 3, 5], [3, 4, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17]]);
        return dest({ key: `6-69trap${b}`, q: `$x>0$ で $\\cosh x=\\dfrac{${c}}{${b}}$ のとき、$\\sinh x=□$`, a: `$\\frac{${a}}{${b}}$`, boxh: '12mm',
          verify: p => valIs(p.a, Math.sinh(Math.acosh(c / b))) }, '6-69', '$e^x$ の値がない。$\\cosh^2x-\\sinh^2x=1$ を使う');
      },
    },
  });

  // ================================================================ 6-70
  const LEG = [[4, 3, 5], [5, 12, 13], [8, 15, 17], [15, 8, 17], [7, 24, 25], [24, 7, 25], [20, 21, 29], [21, 20, 29], [9, 40, 41], [40, 9, 41], [12, 35, 37], [35, 12, 37]];   // sinh=a/b、cosh=c/b（3/4・12/5 は楽な形の例。O-2）
  const frT = (n, d) => Stex(S(n, d));
  M.add({
    id: '6-70', part: 5, chap: '6-11③ 例題2', stars: 1,
    title: '$\\cosh^2x-\\sinh^2x=1$：片方がわかれば、もう片方と $\\tanh$（$\\cosh x>0$。3・4・5、5・12・13 の組）',
    mark: '$\\sinh x=\\dfrac{3}{4}$ などと「$\\cosh x$ と $\\tanh x$」（$e$ の値は書いていない）。',
    futsu: ['$\\dfrac{e^x-e^{-x}}{2}=\\dfrac{3}{4}$ から $e^x$ を求めて（2次方程式）、', '$\\cosh x$ に入れる。'],
    raku: ['$\\sinh x=\\dfrac{3}{4}$ → $\\cosh^2x=1+\\dfrac{9}{16}=\\dfrac{25}{16}$', '$\\cosh x>0$ なので $\\dfrac{5}{4}$、$\\tanh x=\\dfrac{3}{5}$', '$\\dfrac{12}{5}$ なら $\\dfrac{13}{5}$、$\\dfrac{12}{13}$'],
    why: '$\\cosh^2x=\\dfrac{e^{2x}+2+e^{-2x}}{4}$、$\\sinh^2x=\\dfrac{e^{2x}-2+e^{-2x}}{4}$ なので、ひくといつも1（6-11③）。$\\cosh^2x=1+\\sinh^2x$ で $\\cosh$ が出る。$\\cosh x$ はいつも1以上で正なので、正のほうをとる。直角三角形の3辺（3・4・5）と同じ数の組になる。',
    caution: '和ではなく差（$\\cosh^2+\\sinh^2=1$ ではない）。$\\cosh x$ は負にならないが、$\\sinh x$・$\\tanh x$ は $x<0$ なら負。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 2,
    boxw: '14mm', boxh: '12mm',
    fits(q) { return /\\(sinh|cosh|tanh)\s*x\s*=\s*-?\\d?frac/.test(q) && !/e\^\{[\d.]+\}=|(^|[^\\])e=\d/.test(q); },
    steps: {
      // sinh → cosh
      s1(r) {
        const [a, b, c] = r.pick(LEG);
        return {
          q: `$x>0$ で $\\sinh x=${frT(a, b)}$ のとき、$\\cosh x=□$`, a: `$${frT(c, b)}$`, key: `${a},${b}`,
          easy: `$\\cosh^2x=1+\\frac{${a * a}}{${b * b}}=\\frac{${c * c}}{${b * b}}$ → $${frT(c, b)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, Math.cosh(Math.asinh(a / b))),
        };
      },
      // cosh → sinh・tanh
      s2(r) {
        const [a, b, c] = r.pick(LEG), th = r.chance(0.5);
        const ans = th ? frT(a, c) : frT(a, b);
        return {
          q: `$x>0$ で $\\cosh x=${frT(c, b)}$ のとき、$\\${th ? 'tanh' : 'sinh'} x=□$`, a: `$${ans}$`, key: `${a},${b}`,
          easy: th ? `$\\sinh x=${frT(a, b)}$（$x>0$ で正）→ $\\tanh x=${frT(a, b)}\\div${frT(c, b)}=${ans}$` : `$\\sinh^2x=\\frac{${c * c}}{${b * b}}-1=\\frac{${a * a}}{${b * b}}$、$x>0$ なので正 → $${ans}$`, easyCheck: 'last',
          verify: p => valIs(p.a, th ? a / c : a / b),
        };
      },
      // 見かけがちがう：tanh から・x<0
      s3(r) {
        const [a, b, c] = r.pick(LEG);
        if (r.chance(0.5)) {
          const want = r.chance(0.5) ? 'cosh' : 'sinh', ans = want === 'cosh' ? frT(c, b) : frT(a, b);
          return { q: `$x>0$ で $\\tanh x=${frT(a, c)}$ のとき、$\\${want} x=□$`, a: `$${ans}$`, key: `${a},${b}`,
            easy: `$\\sinh x:\\cosh x=${a}:${c}$。$\\cosh^2-\\sinh^2=1$ から $\\sinh x=${frT(a, b)}$、$\\cosh x=${frT(c, b)}$ → $${ans}$`, easyCheck: 'last',
            verify: p => valIs(p.a, want === 'cosh' ? c / b : a / b) };
        }
        return { q: `$x<0$ で $\\sinh x=${frT(-a, b)}$ のとき、$\\tanh x=□$`, a: `$${frT(-a, c)}$`, key: `${a},${b}`,
          easy: `$\\cosh x=${frT(c, b)}$（いつも正）→ $\\tanh x=${frT(-a, b)}\\div${frT(c, b)}=${frT(-a, c)}$`, easyCheck: 'last',
          verify: p => valIs(p.a, -a / c) };
      },
      // わな：e の値がある（6-69）
      trap(r) {
        const [x, ep, em] = r.pick([[2, '7.389', '0.135'], [0.5, '1.649', '0.607'], [1.5, '4.482', '0.223']]), cs = r.chance(0.6);
        const vG = cs ? (+ep + +em) / 2 : (+ep - +em) / 2, vT = cs ? Math.cosh(x) : Math.sinh(x), g = gv(vG, vT, 3);
        if (!g) return null;
        return dest({ key: `6-70trap${cs ? 'A' : 'B'}`, q: `${eVals(x, ep, em)}、$${hypT(cs ? 'cosh' : 'sinh', x)}$ は約 □${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`, boxh: null,
          verify: p => nearTrue(p.a, vT) }, '6-70', `片方の値ではなく、$e^x$ と $e^{-x}$ の値がある。定義に入れる`);
      },
    },
  });

  // ================================================================ 6-71
  const coT = c => (c === 1 ? '' : c === -1 ? '-' : fmt(c));
  const argT = (a, v) => `${a === 1 ? (v === 'x' || v === 't' ? ' ' : '') : fmt(a)}${v}`;
  M.add({
    id: '6-71', part: 5, chap: '6-11④ 例題3', stars: 1,
    title: '$\\cosh$・$\\sinh$ の微分は、符号が変わらない（中の微分をかける。$\\tanh u$ の微分は $1-\\tanh^2u$）',
    mark: '$\\cosh ax$・$\\sinh ax$・$\\tanh at$ の微分、2回微分。',
    futsu: ['$\\cosh3x=\\dfrac{e^{3x}+e^{-3x}}{2}$ に直して、', '$e$ の項を1つずつ微分してから、もとにもどす。'],
    raku: ['$(\\cosh3x)\'=3\\sinh3x$（$\\cos$ のようにマイナスをつけない）', '$\\sinh2x$ を2回 → $2^2=4$ 倍 → $4\\sinh2x$', '$(5\\tanh2t)\'=10\\,(1-\\tanh^{2}2t)$'],
    why: '$(\\cosh x)\'=\\dfrac{e^x-e^{-x}}{2}=\\sinh x$、$(\\sinh x)\'=\\cosh x$（6-11④）。$\\cos$ とちがい、$-$ がつかない。中に $a$ があるときは、合成関数の微分で $a$ をかける。2回微分すると自分の $a^2$ 倍。$\\tanh$ は商の微分と $\\cosh^2-\\sinh^2=1$ から $1-\\tanh^2$。',
    caution: '$(\\cosh x)\'=-\\sinh x$ としない（$\\cosh x$ は $x>0$ でふえるので、傾きは正）。$\\cos$・$\\sin$ の微分（第5巻）は符号が変わる。',
    counts: { s1: 6, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },   // ステップ3の式（cosh^2−sinh^2）が長い
    boxw: { s1: '22mm', s2: '28mm', s3: '28mm', trap: '20mm' },
    fits(q) { return /\\(cosh|sinh|tanh)/.test(q) && /[)}]'|微分|\\dd/.test(q) && !/をみたす|y''=|=□-|\\cosh\s*x\s*=|\\sinh\s*x\s*=/.test(q); },
    steps: {
      // (c cosh ax)'・(c sinh ax)'
      s1(r) {
        const fn = r.pick(['cosh', 'sinh']), a = r.pick([2, 3, 4, 5, 6, 0.5]), c = r.pick([1, 1, 2, 3, -1, -2]);
        if (fn === 'cosh' && a === 3) return null;   // 楽な形の例 cosh3x（O-2）
        const g = fn === 'cosh' ? 'sinh' : 'cosh', f = `${coT(c)}\\${fn}${argT(a, 'x')}`, ans = `${coT(c * a)}\\${g}${argT(a, 'x')}`;
        return { q: `$(${f})'=□$`, a: `$${ans}$`, key: c === a ? `d${g}${a}` : `${fn}${a}`, calc: { kind: 'diff', f },   // c=a なら s2 の2回微分と同じ答え
          easy: `中の微分 $${fmt(a)}$ をかけて、$\\${fn}$ → $\\${g}$（符号はそのまま）→ $${ans}$`, easyCheck: 'last' };
      },
      // 2回微分・tanh
      s2(r) {
        if (r.chance(0.5)) {
          const fn = r.pick(['cosh', 'sinh']), a = r.pick([2, 3, 4, 5, 10]);
          if (fn === 'sinh' && a === 2) return null;   // 楽な形の例（O-2）
          const f = `\\${fn}${a}x`, ans = `${a * a}\\${fn}${a}x`;
          return { q: `$\\dfrac{\\dd^2}{\\dd x^2}${f}=□$`, a: `$${ans}$`, key: `d${fn}${a}`,
            easy: `2回微分で $${a}^2=${a * a}$ 倍（$\\${fn}$ にもどる）→ $${ans}$`, easyCheck: 'last',
            verify: p => { const h = 1e-3, F = x => M.evalMath(f, { x }); for (const x of [0.11, 0.23, 0.37]) { const d2 = (F(x + h) - 2 * F(x) + F(x - h)) / (h * h); if (!close(d2, M.evalMath(strip(p.a), { x }), 1e-4)) return 'ちがう'; } return true; } };
        }
        const a = r.pick([2, 3, 4, 0.5]), c = r.pick([1, 2, 3, 4, 6, 10]);
        if (a === 2 && c === 5) return null;
        const k = c * a, f = `${coT(c)}\\tanh${argT(a, 't')}`, ans = k === 1 ? `1-\\tanh^{2}${argT(a, 't').trim()}` : `${fmt(k)}\\,(1-\\tanh^{2}${argT(a, 't').trim()})`;
        return { q: `$(${f})'=□$`, a: `$${ans}$`, key: `t${a},${c}`, calc: { kind: 'diff', f, x: 't' },
          easy: `$${c}\\times${fmt(a)}\\,(1-\\tanh^{2}u)$ → $${ans}$`, easyCheck: 'last' };
      },
      // 見かけがちがう：中が ax+b・cosh^2 x・cosh^2 x − sinh^2 x
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const fn = r.pick(['cosh', 'sinh']), a = r.pick([2, 3, 4]), b = r.pick([1, -1, 2, 3]), g = fn === 'cosh' ? 'sinh' : 'cosh';
          const u = `${a}x${b > 0 ? '+' : ''}${b}`, f = `\\${fn}(${u})`, ans = `${a}\\${g}(${u})`;
          return { q: `$\\{${f}\\}'=□$`, a: `$${ans}$`, key: 'l', calc: { kind: 'diff', f }, easy: `中 $${u}$ の微分 $${a}$ をかける → $${ans}$`, easyCheck: 'last' };
        }
        if (k === 1) {
          const fn = r.pick(['cosh', 'sinh']), g = fn === 'cosh' ? 'sinh' : 'cosh', f = `\\${fn}^{2}x`, ans = `2\\${fn} x\\${g} x`;
          return { q: `$(${f})'=□$`, a: `$${ans}$`, key: 'q', calc: { kind: 'diff', f }, easy: `2乗の微分：$2\\${fn} x\\times(\\${fn} x)'$ → $${ans}$`, easyCheck: 'last' };
        }
        const a = r.pick([1, 2, 3]), f = `\\cosh^{2}${argT(a, 'x').trim()}-\\sinh^{2}${argT(a, 'x').trim()}`;
        return { q: `$(${f})'=□$`, a: '$0$', key: 'z', calc: { kind: 'diff', f }, easy: '微分する前に $\\cosh^2-\\sinh^2=1$（定数）→ $0$', easyCheck: 'last' };
      },
      // わな：双曲線関数でない（cos・sin。符号が変わる）
      trap(r) {
        const fn = r.pick(['cos', 'sin']), a = r.pick([2, 3, 4, 5]), f = `\\${fn}${a}x`, ans = fn === 'cos' ? `-${a}\\sin${a}x` : `${a}\\cos${a}x`;
        return dest({ key: `6-71trap${fn}`, q: `$(${f})'=□$`, a: `$${ans}$`, calc: { kind: 'diff', f } }, '6-71', `双曲線関数ではなく、ふつうの三角関数。$\\${fn}$ の微分（第5巻）${fn === 'cos' ? 'で、符号が変わる' : ''}`);
      },
    },
  });

  // ================================================================ 6-72
  const chT = (C, D, a, v) => { const at = `${a === 1 ? '' : fmt(a)}${v || 't'}`; const t1 = C ? `${coT(C)}\\cosh${a === 1 ? ' ' : ''}${at}` : '', t2 = D ? `${coT(D)}\\sinh${a === 1 ? ' ' : ''}${at}` : ''; return t1 && t2 ? t1 + (D < 0 ? '' : '+') + t2 : t1 || t2 || '0'; };
  const odeC = (a, C, D) => ({ kind: 'ode', x: 't', coef: [1, 0, -a * a], init: [[0, C], [0, a * D, 1]] });
  M.add({
    id: '6-72', part: 5, chap: '6-11⑤ 例題5', stars: 1,
    title: '$y\'\'=a^2y$ の答えは $C\\cosh at+D\\sinh at$、$C=y(0)$、$D=\\dfrac{y\'(0)}{a}$（$Ae^{at}+Be^{-at}$ からは $C=A+B$、$D=A-B$）',
    mark: '$y\'\'=\\square y$（右辺がプラス）と2つの初期条件、または $Ae^{at}+Be^{-at}$ の書きかえ。',
    futsu: ['$y=Ae^{at}+Be^{-at}$ とおいて、$y(0)$ と $y\'(0)$ から', '$A+B$ と $a(A-B)$ の連立方程式を解く。'],
    raku: ['$y\'\'=4y$、$y(0)=2$、$y\'(0)=6$ → $a=2$', '$C=2$、$D=\\dfrac{6}{2}=3$ → $2\\cosh2t+3\\sinh2t$', '$3e^{2t}+e^{-2t}$ → $C=3+1$、$D=3-1$ → $4\\cosh2t+2\\sinh2t$'],
    why: '$\\cosh at$ も $\\sinh at$ も2回微分すると $a^2$ 倍なので、たしたものも答え（6-11⑤）。$t=0$ で $\\cosh0=1$、$\\sinh0=0$ なので $y(0)=C$。微分すると $aC\\sinh at+aD\\cosh at$ で、$y\'(0)=aD$。連立方程式を解かずに、1つずつ決まる。',
    caution: '右辺がマイナスの $y\'\'=-4y$ は、$\\cos$・$\\sin$ の答え（わざ 6-06）。$D$ は $y\'(0)$ を $a$ でわる（$a^2$ でわらない）。',
    counts: { s1: 4, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: '36mm',
    fits(q) { return (/(?:y|x|\\theta)''=\d+(?:\.\d+)?(?:y|x|\\theta)|\\ddot\{?\\?\w+\}?=\d+(?:\.\d+)?\\?\w|y''-\d+y=0/.test(q) && /\(0\)=/.test(q)) || (/e\^\{[\d.]*t\}/.test(q) && /e\^\{-[\d.]*t\}/.test(q) && /\\cosh/.test(q)); },
    steps: {
      s1(r) {
        const a = r.pick([2, 3, 4, 5]), C = r.pick([1, 2, 3, 4, 5]), D = r.pick([1, 2, 3, -1, -2]);
        if (a === 2 && C === 2 && D === 3) return null;   // 楽な形の例（O-2）
        const ans = chT(C, D, a);
        return { q: `$y''=${a * a}y$、$y(0)=${C}$、$y'(0)=${a * D}$ をみたす $y$ を、$\\cosh$ と $\\sinh$ で：$y=□$`, a: `$${ans}$`, key: `${a},${C},${D}`, calc: odeC(a, C, D),
          easy: `$a=${a}$。$C=${C}$、$D=\\frac{${a * D}}{${a}}=${D}$ → $${ans}$`, easyCheck: 'last' };
      },
      // Ae^{at}+Be^{-at} の書きかえ
      s2(r) {
        const a = r.pick([1, 2, 3, 4]), A = r.pick([1, 2, 3, 4, 5, -1, -2]), B = r.pick([1, 2, 3, 4, -1, -3]);
        if (a === 2 && A === 3 && B === 1) return null;   // 楽な形の例（O-2）
        const C = A + B, D = A - B, ans = chT(C, D, a), at = `${a === 1 ? '' : a}t`;
        const f = `${coT(A)}e^{${at}}${B < 0 ? '-' : '+'}${Math.abs(B) === 1 ? '' : Math.abs(B)}e^{-${at}}`;
        return { q: `$C\\cosh ${at}+D\\sinh ${at}$ の形に：$${f}=□$`, a: `$${ans}$`, key: `${a},${C},${D}`,
          easy: `$C=${A}${B < 0 ? '' : '+'}${B}=${C}$、$D=${A}-${B < 0 ? `(${B})` : B}=${D}$ → $${ans}$`, easyCheck: 'last',
          verify: p => { for (const t of [0.2, 0.7, 1.1]) if (!close(M.evalMath(strip(p.a), { t }), A * Math.exp(a * t) + B * Math.exp(-a * t), 1e-9)) return 'ちがう'; return true; } };
      },
      // 見かけがちがう：θ の式・y''−a²y=0・片方が0
      s3(r) {
        const k = r.int(0, 2), a = r.pick([2, 3, 4, 5]);
        if (k === 0) {
          const th0 = r.pick([0.01, 0.02, 0.05]), ans = `${th0}\\cosh${a}t`;
          return { q: `$\\ddot{\\theta}=${a * a}\\theta$、$\\theta(0)=${th0}$、$\\dot{\\theta}(0)=0$ をみたす $\\theta$（$\\cosh$・$\\sinh$ で）：$\\theta=□$`, a: `$${ans}$`, key: `${a},${th0},0`, calc: odeC(a, th0, 0),
            easy: `$C=${th0}$、$D=\\frac{0}{${a}}=0$ → $${ans}$`, easyCheck: 'last' };
        }
        const D = r.pick([1, 2, 3, -1]), v0 = a * D;
        if (k === 1) {
          const ans = chT(0, D, a);
          return { q: `$y''-${a * a}y=0$、$y(0)=0$、$y'(0)=${v0}$ をみたす $y$（$\\cosh$・$\\sinh$ で）：$y=□$`, a: `$${ans}$`, key: `${a},0,${D}`, calc: odeC(a, 0, D),
            easy: `$y''=${a * a}y$ の形。$C=0$、$D=\\frac{${v0}}{${a}}=${D}$ → $${ans}$`, easyCheck: 'last' };
        }
        const C = r.pick([2, 3, 5, -2]), ans = chT(C, D, a), A = (C + D) / 2, B = (C - D) / 2;
        if (!Number.isInteger(A) || !Number.isInteger(B)) return null;
        return { q: `$y=${coT(A)}e^{${a}t}${B < 0 ? '-' : '+'}${Math.abs(B) === 1 ? '' : Math.abs(B)}e^{-${a}t}$ の $y(0)$ と $y'(0)$ を見て、$\\cosh$・$\\sinh$ で：$y=□$`, a: `$${ans}$`, key: `${a},${C},${D}`,
          easy: `$y(0)=${C}$、$y'(0)=${a * D}$ → $C=${C}$、$D=${D}$ → $${ans}$`, easyCheck: 'last',
          verify: p => { for (const t of [0.2, 0.7, 1.1]) if (!close(M.evalMath(strip(p.a), { t }), A * Math.exp(a * t) + B * Math.exp(-a * t), 1e-9)) return 'ちがう'; return true; } };
      },
      // わな：右辺がマイナス（6-06）
      trap(r) {
        const a = r.pick([2, 3, 4, 5]), y0 = r.pick([0.1, 0.2, 1, 2]), ans = `${coT(y0)}\\cos${a}t`;
        return dest({ key: `6-72trap${y0}`, q: `$y''=-${a * a}y$、$y(0)=${y0}$、$y'(0)=0$ をみたす $y$：$y=□$`, a: `$${ans}$`, calc: { kind: 'ode', x: 't', coef: [1, 0, a * a], init: [[0, y0], [0, 0, 1]] } },
          '6-72', `右辺がマイナスなので、ふえる $\\cosh$ ではなく、ゆれる $\\cos$。2回微分で $-${a * a}$ 倍`, ['6-06']);
      },
    },
  });

  // ================================================================ 6-73
  const TANH = { 0.2: '0.197', 0.4: '0.380', 0.5: '0.462', 0.8: '0.664', 1: '0.762', 1.5: '0.905', 2: '0.964' };
  const ATANH = [[0.5, '0.549'], [0.6, '0.693'], [0.8, '1.099'], [0.9, '1.472']];   // tanh(u)=p となる u（文に書く）
  const who = k => (k <= 3 ? 'ボール' : 'スカイダイバー');
  const gT = '$g=9.8\\,\\mathrm{m/s^2}$';
  M.add({
    id: '6-73', part: 5, chap: '6-11⑥ 例題6', stars: 1,
    title: '空気の中の落下 $v=v_{\\mathrm t}\\tanh u$：$u=\\dfrac{gt}{v_{\\mathrm t}}$ を先に出す（逆に、□%になる時刻は $t=\\dfrac{uv_{\\mathrm t}}{g}$）',
    mark: '終端速度 $v_{\\mathrm t}$ と「□秒後の速さ」「終端速度の□%になる時刻」（$\\tanh$ の値は文に）。',
    futsu: ['表計算で $\\dfrac{\\dd v}{\\dd t}=g-\\dfrac{c}{m}v^2$ を', 'オイラー法で1歩ずつ進める（6-2）。'],
    raku: ['$v_{\\mathrm t}=54.9$、3秒 → $u=\\dfrac{29.4}{54.9}\\approx0.535$', '→ $54.9\\times0.490\\approx26.9\\,\\mathrm{m/s}$', '90% → $u=1.47$ → $\\dfrac{1.47\\times54.9}{9.8}\\approx8.2$ 秒'],
    why: '$v=v_{\\mathrm t}\\tanh\\dfrac{gt}{v_{\\mathrm t}}$ は $m\\dfrac{\\dd v}{\\dd t}=mg-cv^2$、$v(0)=0$ の答え（6-11⑥）。$\\tanh u$ は終端速度の何倍になったかを表すので、$u$ を出して $\\tanh u$ をかけるだけ。逆に「$p$ 倍になる時刻」は、$\\tanh u=p$ の $u$ から $t=\\dfrac{uv_{\\mathrm t}}{g}$。',
    caution: '$\\tanh$ の中は $t$ ではなく $\\dfrac{gt}{v_{\\mathrm t}}$。はじめは $v\\approx gt$、やがて $v_{\\mathrm t}$ に近づき、こえない。終端速度そのものは $\\sqrt{\\dfrac{mg}{c}}$（わざ 6-28）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: '16mm',
    fits(q) { return /v_\{\\mathrm t\}|終端速度/.test(q) && /\\tanh/.test(q); },
    steps: {
      // t 秒後の速さ
      s1(r) {
        const k = r.pick([2, 3, 4, 5, 6]), u = r.pick([0.4, 0.5, 1, 1.5, 2]), t = u * k, vt = 9.8 * k;
        if (!Number.isInteger(t * 2) || t > 12) return null;
        const vG = vt * +TANH[u], vT = vt * Math.tanh(u), g = gv(vG, vT, 1);
        if (!g) return null;
        return { q: `終端速度 $v_{\\mathrm t}=${fmt(vt)}\\,\\mathrm{m/s}$ の${who(k)}が、止まった状態から落ち始める。$v=v_{\\mathrm t}\\tanh\\dfrac{gt}{v_{\\mathrm t}}$ で、${fmt(t)}秒後の速さは約 □ m/s（${gT}、$\\tanh${fmt(u)}=${TANH[u]}$${g.note}）`, a: `$${g.ans}$`, key: `v${u}`,
          easy: `$u=\\frac{9.8\\times${fmt(t)}}{${fmt(vt)}}=${fmt(u)}$ → $${fmt(vt)}\\times${TANH[u]}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT) };
      },
      // 終端速度の p 倍になる時刻
      s2(r) {
        const k = r.pick([2, 3, 4, 5, 6]), [pp, us] = r.pick(ATANH), vt = 9.8 * k;
        const vG = +us * k, vT = Math.atanh(pp) * k, g = gv(vG, vT, 1);
        if (!g) return null;
        return { q: `終端速度 $v_{\\mathrm t}=${fmt(vt)}\\,\\mathrm{m/s}$ の${who(k)}が、止まった状態から落ち始める。$v=v_{\\mathrm t}\\tanh\\dfrac{gt}{v_{\\mathrm t}}$ で、終端速度の${fmt(pp * 100)}%になるのは約 □ 秒後（${gT}、$\\tanh${us}=${fmt(pp)}${pp === 0.5 || pp === 0.6 || pp === 0.8 || pp === 0.9 ? '00' : ''}$${g.note}）`, a: `$${g.ans}$`, key: `p${k},${pp}`,
          easy: `$\\tanh u=${fmt(pp)}$ → $u=${us}$。$t=\\frac{${us}\\times${fmt(vt)}}{9.8}=${us}\\times${k}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT) };
      },
      // 見かけがちがう：何%か・速さから時刻
      s3(r) {
        const k = r.pick([2, 3, 4, 5, 6]), vt = 9.8 * k;
        if (r.chance(0.5)) {
          const u = r.pick([0.5, 1, 1.5, 2]), t = u * k;
          if (!Number.isInteger(t * 2) || t > 12) return null;
          const vG = 100 * +TANH[u], vT = 100 * Math.tanh(u), g = gv(vG, vT, 1);
          if (!g) return null;
          return { q: `終端速度 $${fmt(vt)}\\,\\mathrm{m/s}$ の${who(k)}が、止まった状態から落ちる（$v=v_{\\mathrm t}\\tanh\\dfrac{gt}{v_{\\mathrm t}}$）。${fmt(t)}秒後の速さは、終端速度の約 □ %（${gT}、$\\tanh${fmt(u)}=${TANH[u]}$）`, a: `$${g.ans}$`, key: `v${u}`,
            easy: `$u=\\frac{9.8\\times${fmt(t)}}{${fmt(vt)}}=${fmt(u)}$。$\\tanh u$ が終端速度の何倍か → $${g.ans}$ %`, easyCheck: false,
            verify: p => nearTrue(p.a, vT) };
        }
        const [pp, us] = r.pick(ATANH), v = pp * vt, vG = +us * k, vT = Math.atanh(pp) * k, g = gv(vG, vT, 1);
        if (!g || !exactDec(v, 1)) return null;
        return { q: `終端速度 $${fmt(vt)}\\,\\mathrm{m/s}$ の${who(k)}が、止まった状態から落ちる（$v=v_{\\mathrm t}\\tanh\\dfrac{gt}{v_{\\mathrm t}}$）。速さが $${fmt(v)}\\,\\mathrm{m/s}$ になるのは約 □ 秒後（${gT}、$\\tanh${us}=${fmt(pp)}00$）`, a: `$${g.ans}$`, key: `p${k},${pp}`,
          easy: `$\\frac{${fmt(v)}}{${fmt(vt)}}=${fmt(pp)}$ → $u=${us}$ → $t=${us}\\times${k}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT) };
      },
      // わな：終端速度そのもの（6-28）、抵抗がない（6-13）
      trap(r) {
        if (r.chance(0.6)) {
          const [m, c, vt] = r.pick([[50, 0.4, 35], [90, 0.5, 42], [64, 0.2, 56], [40, 0.5, 28], [45, 1, 21], [72, 0.4, 42]]);
          return dest({ key: '6-73trapA', q: `質量 $${m}\\,\\mathrm{kg}$ の人が、空気の抵抗 $f=${c}v^2$〔N〕を受けて落ちる。終端速度は □ m/s（${gT}）`, a: `$${vt}$`,
            verify: p => valIs(p.a, Math.sqrt(m * 9.8 / c)) }, '6-73', '$\\tanh$ の式ではなく、終端速度そのもの。$mg=cv^2$ のつり合いで $\\sqrt{\\frac{mg}{c}}$', ['6-28']);
        }
        const t = r.pick([2, 3, 4, 5]);
        return dest({ key: '6-73trapB', q: `空気の抵抗がないとき、止まった状態から落とした物の${t}秒後の速さは □ m/s（${gT}）`, a: `$${fmt(9.8 * t)}$`,
          verify: p => valIs(p.a, 9.8 * t) }, '6-73', '空気の抵抗がないので、終端速度はない。$v=gt$', ['6-13']);
      },
    },
  });

  // ================================================================ 6-74
  const CH = { 0.5: ['1.128', '0.521'], 1: ['1.543', '1.175'], 1.5: ['2.352', '2.129'], 2: ['3.762', '3.627'] };
  const catQ = '$y=a\\Bigl(\\cosh\\dfrac{x}{a}-1\\Bigr)$';
  // 懸垂線（実線）と、同じはば・たるみの放物線（点線）の図。X があれば、その点 P の高さを問う
  function catFig(a, W, X) {
    const h = W / 2, sag = a * (Math.cosh(h / a) - 1), G = M.graph({ x0: -h * 1.25, x1: h * 1.25, y0: 0, y1: sag * 1.3, w: 8, h: 4.2 });
    const its = [
      ...G.axes({ xt: X ? [-h, X, h] : [-h, h] }),
      ...G.plot(x => a * (Math.cosh(x / a) - 1), -h, h, { thick: true }),
      ...G.plot(x => sag * (x / h) ** 2, -h, h, { dash: true }),
      ['dot', G.T(-h, sag)], ['dot', G.T(h, sag)],
    ];
    if (X) { const yP = a * (Math.cosh(X / a) - 1); its.push(['dot', G.T(X, yP)], ['label', G.T(X, yP), 'P', 'nw'], ['seg', G.T(X, 0), G.T(X, yP), { dash: true }]); }
    else { const xr = h * 1.12; its.push(['seg', G.T(h, sag), G.T(xr, sag), { dash: true }], ['seg', G.T(xr, sag / 2), G.T(xr, sag), { arrow: true }], ['seg', G.T(xr, sag / 2), G.T(xr, 0), { arrow: true }], ['label', G.T(xr, sag / 2), 'たるみ', 'e']); }
    return { s: 5, items: its };
  }
  M.add({
    id: '6-74', part: 5, chap: '6-11⑦ 例題7', stars: 1,
    title: '懸垂線：たるみ $a\\Bigl(\\cosh\\dfrac{x}{a}-1\\Bigr)$、長さ $2a\\sinh\\dfrac{x}{a}$（$x$ ははばの半分）',
    mark: '$a$ とはば、「たるみ」「くさりの長さ」（$\\cosh$・$\\sinh$ の値は文に）。',
    futsu: ['くさりの形の微分方程式 $y\'\'=\\dfrac{1}{a}\\sqrt{1+y\'^2}$ から', '考えようとする。'],
    raku: ['$a=50$、はば100 → $\\dfrac{x}{a}=\\dfrac{50}{50}=1$', 'たるみ $50\\times(1.543-1)\\approx27.2$ m', '長さ $100\\times1.175=117.5$ m'],
    why: 'いちばん下の点を原点にすると、くさりの形は $y=a\\Bigl(\\cosh\\dfrac{x}{a}-1\\Bigr)$、原点からの長さは $s=a\\sinh\\dfrac{x}{a}$（6-11⑦）。はしは $x=\\dfrac{\\text{はば}}{2}$ なので、まず $\\dfrac{x}{a}$ を出して、表の値を入れる。全体の長さは片がわの2倍。',
    caution: '$x$ ははば全体ではなく半分。たるみは $a\\cosh\\dfrac{x}{a}$ ではなく、$-1$ をしてから $a$ 倍。$\\dfrac{x}{a}$ が小さい電線は放物線で近似できる（わざ 6-75）。',
    counts: { s1: 3, s2: 2, s3: 2, trap: 2 },   // 文が2行で図が2つ入るので、ステップ2は2問（3問では右ページがあふれる）
    cols: 1,
    boxw: '16mm',
    fits(q) { return /懸垂線|くさり/.test(q) && /\\cosh[\d.]+=|\\sinh[\d.]+=/.test(q); },
    steps: {
      // たるみ
      s1(r) {
        const u = r.pick([0.5, 1, 1.5, 2]), a = r.pick([10, 20, 30, 40, 60, 80, 100]), W = 2 * a * u;
        if ((a === 50 && u === 1) || (a === 100 && u === 0.5) || a * u > 80) return null;
        const vG = a * (+CH[u][0] - 1), vT = a * (Math.cosh(u) - 1), g = gv(vG, vT, 1);
        if (!g) return null;
        return { q: `$a=${a}\\,\\mathrm{m}$ の懸垂線 ${catQ} を、はば $${fmt(W)}\\,\\mathrm{m}$ にはった。たるみは約 □ m（$\\cosh${fmt(u)}=${CH[u][0]}$${g.note}）`, a: `$${g.ans}$`, key: `s${a},${u}`,
          easy: `$\\frac{x}{a}=\\frac{${fmt(W / 2)}}{${a}}=${fmt(u)}$。$${a}\\times${fmt(+CH[u][0] - 1)}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT) };
      },
      // くさりの長さ
      s2(r) {
        const u = r.pick([0.5, 1, 1.5, 2]), a = r.pick([10, 20, 30, 40, 60, 80, 100]), W = 2 * a * u;
        if ((a === 50 && u === 1) || (a === 100 && u === 0.5) || a * u > 80) return null;
        const vG = 2 * a * +CH[u][1], vT = 2 * a * Math.sinh(u), g = gv(vG, vT, 1);
        if (!g) return null;
        return { q: `$a=${a}\\,\\mathrm{m}$ の懸垂線 ${catQ} を、はば $${fmt(W)}\\,\\mathrm{m}$ にはった。くさりの長さは約 □ m（$\\sinh${fmt(u)}=${CH[u][1]}$${g.note}）`, a: `$${g.ans}$`, key: `l${a},${u}`,
          easy: `$\\frac{x}{a}=${fmt(u)}$。片がわ $${a}\\times${CH[u][1]}$ の2倍 → $${2 * a}\\times${CH[u][1]}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT) };
      },
      // 図：たるみ、とちゅうの点の高さ
      s3(r) {
        const a = r.pick([10, 20, 30, 40, 60]);
        if (r.chance(0.5)) {
          const u = r.pick([0.5, 1, 1.5]), W = 2 * a * u, vG = a * (+CH[u][0] - 1), vT = a * (Math.cosh(u) - 1), g = gv(vG, vT, 1);
          if (!g) return null;
          return { q: `図の実線は、$a=${a}\\,\\mathrm{m}$ の懸垂線 ${catQ}（点線は、同じはば・たるみの放物線）。はば $${fmt(W)}\\,\\mathrm{m}$ のたるみは約 □ m（$\\cosh${fmt(u)}=${CH[u][0]}$${g.note}）`, a: `$${g.ans}$`, key: `s${a},${u}`, fig: catFig(a, W),
            easy: `$\\frac{x}{a}=${fmt(u)}$ → $${a}\\times${fmt(+CH[u][0] - 1)}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
            verify: p => nearTrue(p.a, vT) };
        }
        const [uP, uE] = r.pick([[0.5, 1], [1, 2], [0.5, 1.5], [1, 1.5]]), W = 2 * a * uE, X = a * uP;
        const vG = a * (+CH[uP][0] - 1), vT = a * (Math.cosh(uP) - 1), g = gv(vG, vT, 1);
        if (!g) return null;
        return { q: `図の実線は、$a=${a}\\,\\mathrm{m}$ の懸垂線 ${catQ}（はば $${fmt(W)}\\,\\mathrm{m}$。点線は放物線）。$x=${fmt(X)}$ の点Pの高さは約 □ m（$\\cosh${fmt(uP)}=${CH[uP][0]}$${g.note}）`, a: `$${g.ans}$`, key: `s${a},${uP}`, fig: catFig(a, W, X),
          easy: `はしではなく点P：$\\frac{x}{a}=\\frac{${fmt(X)}}{${a}}=${fmt(uP)}$ → $${a}\\times${fmt(+CH[uP][0] - 1)}${exactDec(vG, g.k) ? '=' : '\\approx'}${g.ans}$`, easyCheck: false,
          verify: p => nearTrue(p.a, vT) };
      },
      // わな：x/a が小さく、cosh の値がない（6-75）
      trap(r) {
        const [a, W] = r.pick([[400, 40], [1000, 100], [800, 80], [625, 50]]), x = W / 2, vT = a * (Math.cosh(x / a) - 1), g = sagG(a, x);
        if (!g) return null;
        return dest({ key: `6-74trap${a}`, q: `$a=${a}\\,\\mathrm{m}$ の懸垂線 ${catQ} の形の電線を、はば $${W}\\,\\mathrm{m}$ にはった。たるみは約 □ m${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`,
          verify: p => nearTrue(p.a, vT) }, '6-74', `$\\frac{x}{a}=${fmt(x / a)}$ が小さく、$\\cosh$ の値がない。放物線 $\\frac{x^2}{2a}$ で近似する`);
      },
    },
  });

  // ================================================================ 6-75
  // a=H/w と、はばの半分 x（x/a は 0.1 以下）。x²/(2a) が小数第3位までで終わる組
  const AX = [];
  for (const a of [200, 250, 400, 500, 625, 800, 1000, 1250]) for (const x of [10, 15, 20, 25, 30, 40, 50]) { const s = x * x / (2 * a); if (x / a <= 0.1 && exactDec(s, 3)) AX.push([a, x]); }
  // 放物線の値（ちょうどの小数）が、懸垂線のほんとうの値をそのけたで丸めた数と同じときだけ使う（O-4）
  const sagG = (a, x) => { const vG = x * x / (2 * a), vT = a * (Math.cosh(x / a) - 1), t = fmt(vG), k = (t.split('.')[1] || '').length; return rd(vT, k) === rd(vG, k) ? { ans: t, note: '' } : null; };
  M.add({
    id: '6-75', part: 5, chap: '6-11⑦ 例題8', stars: 1,
    title: '電線のたるみは放物線で $\\dfrac{x^2}{2a}$、$a=\\dfrac{H}{w}$（$\\dfrac{x}{a}$ が小さいとき）',
    mark: '$1\\,\\mathrm{m}$ あたりの重さ $w$、いちばん下の張力 $H$、はば（$\\cosh$ の値は書いていない）。',
    futsu: ['$a\\Bigl(\\cosh\\dfrac{x}{a}-1\\Bigr)$ に入れようとして、', '$\\cosh0.05$ の値がわからず止まる。'],
    raku: ['$10\\,\\mathrm{N/m}$・$5000\\,\\mathrm{N}$・はば50 m → $a=500$、$\\dfrac{x}{a}=0.05$', '→ $\\dfrac{25^2}{2\\times500}=0.625$ m', '$8\\,\\mathrm{N/m}$・$3200\\,\\mathrm{N}$・80 m → $a=400$、2.0 m'],
    why: '$\\cosh u\\approx1+\\dfrac{u^2}{2}$（$u$ が小さいとき。5-17 のテイラー展開）なので、$a\\Bigl(\\cosh\\dfrac{x}{a}-1\\Bigr)\\approx\\dfrac{x^2}{2a}$（6-11⑦）。つり橋の放物線と同じ式。$a$ は「いちばん下の張力÷1 m あたりの重さ」で、単位は m。',
    caution: '$x$ ははばの半分。$\\dfrac{x}{a}$ が1くらい（たるみが大きい）ときは、放物線ではずれる（わざ 6-74）。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) { return /電線|懸垂線/.test(q) && /たるみ|張力/.test(q) && !/\\cosh[\d.]+=|\\sinh[\d.]+=/.test(q); },
    steps: {
      // a とはばから
      s1(r) {
        const [a, x] = r.pick(AX), g = sagG(a, x);
        if (!g || (a === 500 && x === 25) || (a === 400 && x === 40)) return null;
        return { q: `$a=${a}\\,\\mathrm{m}$ の電線を、はば $${2 * x}\\,\\mathrm{m}$ にはった。たるみは約 □ m${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`, key: `${a},${x}`,
          easy: `$\\frac{x}{a}=\\frac{${x}}{${a}}$ は小さい → $\\frac{${x}^2}{2\\times${a}}=${fmt(x * x / (2 * a))}$`, easyCheck: false,
          verify: p => nearTrue(p.a, a * (Math.cosh(x / a) - 1)) };
      },
      // w と H から
      s2(r) {
        const [a, x] = r.pick(AX), w = r.pick([4, 5, 8, 10, 12, 16, 20]), H = a * w, g = sagG(a, x);
        if (!g || (a === 500 && x === 25) || (a === 400 && x === 40) || !Number.isInteger(H) || (w === 10 && H === 5000) || (w === 8 && H === 3200)) return null;   // 楽な形の例の数（O-2）
        return { q: `$1\\,\\mathrm{m}$ あたりの重さ $${w}\\,\\mathrm{N/m}$ の電線を、いちばん下の張力 $${H}\\,\\mathrm{N}$ で、はば $${2 * x}\\,\\mathrm{m}$ にはった。たるみは約 □ m${g.note ? `（${g.note.slice(1)}）` : ''}`, a: `$${g.ans}$`, key: `${a},${x}`,
          easy: `$a=\\frac{${H}}{${w}}=${a}$。$\\frac{${x}^2}{2\\times${a}}=${fmt(x * x / (2 * a))}$`, easyCheck: false,
          verify: p => nearTrue(p.a, a * (Math.cosh(x / a) - 1)) };
      },
      // 見かけがちがう：たるみから張力・a
      s3(r) {
        const [a, x] = r.pick(AX), s = x * x / (2 * a);
        if ((a === 500 && x === 25) || (a === 400 && x === 40)) return null;
        if (r.chance(0.5)) {
          const w = r.pick([5, 8, 10, 12, 20]), H = w * a;
          if ((w === 10 && H === 5000) || (w === 8 && H === 3200)) return null;   // 楽な形の例の数（O-2）
          return { q: `$1\\,\\mathrm{m}$ あたりの重さ $${w}\\,\\mathrm{N/m}$ の電線を、はば $${2 * x}\\,\\mathrm{m}$ にはり、たるみを $${fmt(s)}\\,\\mathrm{m}$ にしたい。いちばん下の張力は約 □ N`, a: `$${H}$`, key: `${a},${x}`,
            easy: `$${fmt(s)}=\\frac{${x}^2}{2a}$ → $a=\\frac{${x * x}}{${fmt(2 * s)}}=${a}$ → $H=${w}\\times${a}=${H}$`, easyCheck: false,
            verify: p => valIs(p.a, w * x * x / (2 * s)) };
        }
        return { q: `はば $${2 * x}\\,\\mathrm{m}$ にはった電線のたるみが $${fmt(s)}\\,\\mathrm{m}$ だった。$a=\\dfrac{H}{w}$ は約 □ m`, a: `$${a}$`, key: `${a},${x}`,
          easy: `$${fmt(s)}=\\frac{${x}^2}{2a}$ → $a=\\frac{${x * x}}{2\\times${fmt(s)}}=${a}$`, easyCheck: false,
          verify: p => valIs(p.a, x * x / (2 * s)) };
      },
      // わな：x/a が小さくない（6-74）
      trap(r) {
        const u = r.pick([1, 0.5]), a = u === 1 ? r.pick([20, 30, 40]) : r.pick([40, 60, 80]), W = 2 * a * u;
        const vG = a * (+CH[u][0] - 1), vT = a * (Math.cosh(u) - 1), g = gv(vG, vT, 1);
        if (!g) return null;
        return dest({ key: `6-75trap${u}`, q: `$a=${a}\\,\\mathrm{m}$ のくさりを、はば $${W}\\,\\mathrm{m}$ にはった。たるみは約 □ m（$\\cosh${fmt(u)}=${CH[u][0]}$${g.note}）`, a: `$${g.ans}$`,
          verify: p => nearTrue(p.a, vT) }, '6-75', `$\\frac{x}{a}=${fmt(u)}$ は小さくないので、放物線ではずれる。$a\\Bigl(\\cosh\\frac{x}{a}-1\\Bigr)$ に入れる`);
      },
    },
  });

  // ================================================================ 6-95
  const fracT = (n, d) => Stex(S(n, d));
  M.add({
    id: '6-95', part: 5, chap: '6-11④ 例題4', stars: 1,
    title: '$y=A\\tanh bt$ は $y\'=Ab-\\dfrac{b}{A}y^2$、$y(0)=0$ をみたす（係数を読む）',
    mark: '$y=A\\tanh bt$ と「みたす式」、または $y\'=p-qy^2$、$y(0)=0$ の答え。',
    futsu: ['$y\'=Ab\\,(1-\\tanh^2bt)$ と、$p-qy^2$ に $y=A\\tanh bt$ を入れた式を、', '$\\tanh^2bt$ の係数どうしでくらべる。'],
    raku: ['$y=2\\tanh3t$ → $y\'=2\\times3\\,(1-\\tanh^2)=6-6\\tanh^2$', '$y^2=4\\tanh^2$ なので $6\\tanh^2=1.5y^2$', '→ $y\'=6-1.5y^{2}$（$Ab=6$、$\\dfrac{b}{A}=1.5$）'],
    why: '$(\\tanh u)\'=1-\\tanh^2u$（6-11④）から $y\'=Ab-Ab\\tanh^2bt$。$\\tanh^2bt=\\dfrac{y^2}{A^2}$ なので $y\'=Ab-\\dfrac{b}{A}y^2$。$y(0)=A\\tanh0=0$。反対に $y\'=p-qy^2$ なら、$Ab=p$、$\\dfrac{b}{A}=q$ から $A=\\sqrt{\\dfrac{p}{q}}$、$b=\\sqrt{pq}$（終端速度の式 6-11⑥ と同じ形）。',
    caution: '$y^2$ の係数は $\\dfrac{b}{A}$（$Ab$ ではない）。$A$ は、$y$ が近づく値（$y\'=0$ になる値）。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '14mm', s2: '22mm', s3: '22mm', trap: '14mm' },
    boxh: { s1: '12mm' },
    fits(q) { return /\\tanh/.test(q) && (/[yv]'|\\dd v/.test(q)); },
    steps: {
      // 係数を1つ
      s1(r) {
        const A = r.pick([1, 2, 3, 4, 5, 10]), b = r.pick([1, 2, 3, 4, 5]);
        if ((A === 2 && b === 3) || (A === 1 && b === 1)) return null;   // 楽な形の例・教科書の例
        const P = A * b, Q = fracT(b, A), first = r.chance(0.5);
        return { q: first ? `$y=${A === 1 ? '' : A}\\tanh${b === 1 ? ' ' : b}t$ がみたす式：$y'=□-${Q === '1' ? '' : Q}y^{2}$` : `$y=${A === 1 ? '' : A}\\tanh${b === 1 ? ' ' : b}t$ がみたす式：$y'=${P}-□y^{2}$`,
          a: `$${first ? P : Q}$`, key: `${A},${b}`,
          easy: first ? `$Ab=${A}\\times${b}=${P}$` : `$\\frac{b}{A}=${gcd(b, A) === 1 && A !== 1 ? Q : `\\frac{${b}}{${A}}=${Q}`}$`, easyCheck: 'last',
          verify: p => { const v = numOf(p.a); const PP = first ? v : P, QQ = first ? b / A : v; for (const t of [0.1, 0.3, 0.6]) { const y = A * Math.tanh(b * t), d = A * b * (1 - Math.tanh(b * t) ** 2); if (!close(d, PP - QQ * y * y, 1e-9)) return 'ちがう'; } return true; } };
      },
      // y' = p − q y² の答え
      s2(r) {
        const A = r.pick([1, 2, 3, 4, 5, 10]), b = r.pick([1, 2, 3, 4, 5]);
        if ((A === 2 && b === 3) || (A === 1 && b === 1)) return null;
        const P = A * b, Q = fracT(b, A), ans = `${A === 1 ? '' : A}\\tanh${b === 1 ? ' ' : b}t`;
        return { q: `$y'=${P}-${Q === '1' ? '' : Q}y^{2}$、$y(0)=0$ をみたす $y$ を $A\\tanh bt$ の形で：$y=□$`, a: `$${ans}$`, key: `${A},${b}`,
          easy: `$A=\\sqrt{${P}\\div${Q}}=${A}$、$b=\\sqrt{${P}\\times${Q}}=${b}$ → $${ans}$`, easyCheck: 'last',
          verify: p => { const f = t => M.evalMath(strip(p.a), { t }), h = 1e-5; if (Math.abs(f(0)) > 1e-12) return 'y(0) がちがう'; for (const t of [0.1, 0.3, 0.6]) { const d = (f(t + h) - f(t - h)) / (2 * h); if (!close(d, P - (b / A) * f(t) ** 2, 1e-6)) return 'ちがう'; } return true; } };
      },
      // 見かけがちがう：v の式・はじめの傾き
      s3(r) {
        if (r.chance(0.5)) {
          const [A, b] = r.pick([[10, 2], [20, 0.5], [50, 0.2], [5, 2], [40, 0.25], [8, 0.5]]), P = A * b, Q = b / A, ans = `${A}\\tanh${fmt(b)}t`;
          return { q: `$\\dfrac{\\dd v}{\\dd t}=${fmt(P)}-${fmt(Q)}v^{2}$、$v(0)=0$ の答えを $v_{\\mathrm t}\\tanh bt$ の形で：$v=□$`, a: `$${ans}$`, key: `${A},${b}`,
            easy: `$v_{\\mathrm t}=\\sqrt{\\frac{${fmt(P)}}{${fmt(Q)}}}=${A}$、$b=\\sqrt{${fmt(P)}\\times${fmt(Q)}}=${fmt(b)}$ → $${ans}$`, easyCheck: 'last',
            verify: p => { const f = t => M.evalMath(strip(p.a), { t }), h = 1e-5; for (const t of [0.2, 0.9, 2.1]) { const d = (f(t + h) - f(t - h)) / (2 * h); if (!close(d, P - Q * f(t) ** 2, 1e-6)) return 'ちがう'; } return Math.abs(f(0)) < 1e-12 || 'v(0)'; } };
        }
        const A = r.pick([2, 3, 4, 5, 10]), b = r.pick([2, 3, 4, 5]);
        if (A === 2 && b === 3) return null;
        return { q: `$y=${A}\\tanh${b}t$ の、$t=0$ での傾き $y'(0)=□$`, a: `$${A * b}$`, key: `${A},${b}`,
          easy: `$y'=${A * b}-${fracT(b, A)}y^{2}$ で $y(0)=0$ → $${A * b}$`, easyCheck: 'last',
          verify: p => valIs(p.a, A * b) };
      },
      // わな：tanh でなく cosh（2回微分で a² 倍。6-71）、tanh の値
      trap(r) {
        if (r.chance(0.5)) {
          const C = r.pick([2, 3, 5]), a = r.pick([2, 3, 4]);
          return dest({ key: '6-95trapA', q: `$y=${C}\\cosh${a}t$ は $y''=□y$ をみたす`, a: `$${a * a}$`,
            verify: p => valIs(p.a, a * a) }, '6-95', `$\\tanh$ ではなく $\\cosh$。2回微分すると自分の $${a}^2$ 倍`, ['6-71']);
        }
        const A = r.pick([3, 4, 5]), [b, tv] = r.pick([[1, '0.762'], [2, '0.964']]), g = gv(A * +tv, A * Math.tanh(b), 2);
        if (!g) return null;
        return dest({ key: '6-95trapB', q: `$y=${A}\\tanh${b === 1 ? ' ' : b}t$ の、$t=1$ での値は約 □（$\\tanh${b}=${tv}$${g.note}）`, a: `$${g.ans}$`,
          verify: p => nearTrue(p.a, A * Math.tanh(b)) }, '6-95', 'みたす式ではなく、値。$t=1$ をそのまま入れる');
      },
    },
  });

  // ================================================================ 6-96
  // 和の項（数 × e^{jθ}）を読む：[{A, th}]。読めなければ null
  function phasorSum(q) {
    for (const m of String(q).match(/\$[^$]*\$/g) || []) {
      const s = m.slice(1, -1).replace(/=□.*$/, '');
      if (!/e\^\{-?j/.test(s) || /\\times|\\frac|\\cdot/.test(s)) continue;
      const terms = []; let d = 0, cur = '';
      for (const ch of s) { if (ch === '{') d++; if (ch === '}') d--; if (d === 0 && (ch === '+' || ch === '-') && cur.trim() !== '') { terms.push(cur); cur = ch; } else cur += ch; }
      terms.push(cur);
      const out = [];
      for (const t of terms) {
        const mm = /^([+-]?)(\d*(?:\.\d+)?)(?:e\^\{(-?j[^}]*)\})?$/.exec(t.trim());
        if (!mm || (!mm[2] && !mm[3])) return null;
        let th = 0; if (mm[3]) { const v = M.evalC(mm[3], {}); if (!v) return null; th = v[1]; }
        out.push({ A: mm[2] ? +mm[2] : 1, th: mm[1] === '-' ? th + Math.PI : th });
      }
      return out;
    }
    return null;
  }
  const d120 = (x, y) => { const d = Math.abs(((x - y) % 360) + 360) % 360; return Math.abs(d - 120) < 1e-6 || Math.abs(d - 240) < 1e-6; };
  M.add({
    id: '6-96', part: 5, chap: '6-10⑨ 問題', stars: 1,
    title: '三相交流のフェーザ $1$、$e^{j2\\pi/3}$、$e^{j4\\pi/3}$ の和は0（2つの和は、のこりの1つの $-1$ 倍）',
    mark: '大きさが同じで、角が120°ずつずれた2つか3つのフェーザ・波の和。',
    futsu: ['3つを1つずつ $a+bj$ に直して、', '実部どうし・虚部どうしをたす。'],
    raku: ['$1+e^{j2\\pi/3}+e^{j4\\pi/3}$ → 先から先へつなぐと正三角形 → 0', '2つだけなら、のこりの $-1$ 倍：', '$1+e^{j2\\pi/3}=-e^{j4\\pi/3}=\\dfrac{1}{2}+\\dfrac{\\sqrt{3}}{2}j$'],
    why: '長さが同じで120°ずつずれた3本の矢印を、先から先へつなぐと正三角形になり、もとの点にもどる（6-10⑨）。だから和は0。実部 $1-\\frac{1}{2}-\\frac{1}{2}=0$、虚部 $\\frac{\\sqrt{3}}{2}-\\frac{\\sqrt{3}}{2}=0$ でも確かめられる。2つの和は、0からのこりの1つをひいたもの。',
    caution: '大きさがそろっていないとき・角が120°ずつでないときは、0にならない（1つずつ $a+bj$ に直す）。$e^{j4\\pi/3}$ は $e^{-j2\\pi/3}$ と同じ点。',
    counts: { s1: 3, s2: 4, s3: 3, trap: 2 },
    cols: 1,   // 和の式が長く、2列では答えの欄が右の問題・ページの外に出る
    boxw: { s1: '14mm', s2: '28mm', s3: '36mm', trap: '28mm' },
    fits(q) {
      if (/三相/.test(q)) return true;
      const ps = phasorSum(q);
      if (ps && ps.length >= 2 && ps.every(x => Math.abs(x.A - ps[0].A) < 1e-9)) { const deg = ps.map(x => x.th * 180 / Math.PI); for (let i = 0; i < deg.length; i++) for (let k = i + 1; k < deg.length; k++) if (d120(deg[i], deg[k])) return true; }
      const w = waves(q);
      if (w.length >= 2 && w.every(x => x.A === w[0].A && x.w === w[0].w && x.fn === w[0].fn)) { for (let i = 0; i < w.length; i++) for (let k = i + 1; k < w.length; k++) if (d120(w[i].ph, w[k].ph)) return true; }
      return false;
    },
    steps: {
      // 3つの和
      s1(r) {
        const al = r.pick([[0, 1], [1, 6], [1, 3], [1, 2], [-1, 6], [1, 4]]), A = r.pick([1, 1, 2, 10, 100]), neg = r.chance(0.5);
        const angs = [0, 1, 2].map(i => angNorm(angAdd(al, [(neg ? -2 : 2) * i, 3])));
        if (al[0] === 0 && A === 1) return null;   // 楽な形の例（O-2）
        const terms = angs.map((a, i) => `${i && !(A === 1 && a[0] === 0) ? '+' : ''}${a[0] === 0 ? A : (A === 1 ? '' : A) + `e^{${jAng(a)}}`}`).join('');
        return { q: `$a+bj$ の形に：$${terms}=□$`, a: '$0$', key: `t${((angDeg(al) % 120) + 120) % 120},${A}`,
          easy: `大きさ $${A}$ で、120°ずつずれた3本 → 正三角形で $0$`, easyCheck: 'last',
          verify: p => cIs(p.a, angs.reduce((z, a) => [z[0] + A * Math.cos(angVal(a)), z[1] + A * Math.sin(angVal(a))], [0, 0])) };
      },
      // 2つの和（のこりの −1 倍）
      s2(r) {
        const al = r.pick([[0, 1], [1, 6], [1, 3], [1, 2], [-1, 6], [-1, 2], [-1, 3]]), A = r.pick([1, 1, 2, 4]);
        if (al[0] === 0 && A === 1) return null;   // 楽な形の例（O-2）
        const b = angNorm(angAdd(al, [2, 3])), rest = angNorm(angAdd(al, [4, 3])), s = angNorm(angAdd(rest, [1, 1]));
        const [c, sn] = trig(s), ans = cT(Smul(S(A), c), Smul(S(A), sn));
        const t1 = al[0] === 0 ? `${A}` : `${A === 1 ? '' : A}e^{${jAng(al)}}`, t2 = `${A === 1 ? '' : A}e^{${jAng(b)}}`;
        return { q: `$a+bj$ の形に：$${t1}+${t2}=□$`, a: `$${ans}$`, key: `${al},${A}`, boxh: hasFrac(ans) ? '12mm' : null,
          easy: `のこりの1本は $${A === 1 ? '' : A}e^{${jAng(rest)}}$。和はその $-1$ 倍 $=${EJ(s, S(A))}$ → $${ans}$`, easyCheck: 'last',
          verify: p => cIs(p.a, [A * (Math.cos(angVal(al)) + Math.cos(angVal(b))), A * (Math.sin(angVal(al)) + Math.sin(angVal(b)))]) };
      },
      // 波：三相の電圧の和・2つの波の和
      s3(r) {
        const A = r.pick([100, 200, 141]);
        if (r.chance(0.4)) {
          const ph = r.pick([[0, -120, -240], [0, 120, 240], [30, -90, -210]]);
          const vs = ph.map((d, i) => `$v_{${i + 1}}=${sinT(A, d)}$`).join('、');
          return { q: `三相交流の電圧 ${vs}（V）の和：$v_1+v_2+v_3=□$`, a: '$0$', key: 'w3',
            easy: 'フェーザは長さが同じで120°ずつずれた3本 → 和は $0$（いつでも）', easyCheck: 'last',
            verify: p => valIs(p.a, ph.reduce((z, d) => z + A * Math.sin(1.234 + d * Math.PI / 180), 0), 1e-9) };
        }
        const [d1, d2] = r.pick([[0, -120], [0, 120], [0, 240], [30, 150], [-30, 90]]), rest = [d1 + 120, d1 + 240].find(c => ((c - d2) % 360 + 360) % 360 !== 0);
        let m = rest + 180; while (m > 180) m -= 360; while (m <= -180) m += 360;
        const ans = sinT(A, m);
        return { q: `1つの $\\sin$ の形に：$${sinT(A, d1)}+${sinT(A, d2)}=□$`, a: `$${ans}$`, key: `w2${d1},${((d2 % 360) + 360) % 360}`,
          easy: `120°ずれたもう1本 $${sinT(A, rest)}$ を入れると和は0。だから2つの和はその $-1$ 倍（180°回す）→ $${ans}$`, easyCheck: 'last',
          verify: p => waveIs(p.a, x => A * Math.sin(x + d1 * Math.PI / 180) + A * Math.sin(x + d2 * Math.PI / 180), A) };
      },
      // わな：大きさがそろっていない（6-47）、120°ずつでない（6-61）
      trap(r) {
        if (r.chance(0.5)) {
          const [A, B] = r.pick([[100, 50], [100, 120], [10, 20], [20, 10]]), last = [4, 3];
          const [c, sn] = trig(last), k = B - A, ans = cT(Smul(S(k), c), Smul(S(k), sn));
          return dest({ key: '6-96trapA', q: `$a+bj$ の形に：$${A}+${A}e^{j2\\pi/3}+${B}e^{j4\\pi/3}=□$`, a: `$${ans}$`, boxh: hasFrac(ans) ? '12mm' : null,
            verify: p => cIs(p.a, [A + A * Math.cos(2 * Math.PI / 3) + B * Math.cos(4 * Math.PI / 3), A * Math.sin(2 * Math.PI / 3) + B * Math.sin(4 * Math.PI / 3)]) },
          '6-96', '大きさがそろっていないので、正三角形にならない。1つずつ $a+bj$ に直して、実部どうし・虚部どうしをたす', ['6-47']);
        }
        const set = r.pick([[[0, 1], [1, 2], [1, 1]], [[1, 2], [1, 1], [-1, 2]], [[0, 1], [1, 2], [-1, 2]]]);
        const terms = set.map((a, i) => (i ? '+' : '') + (a[0] === 0 ? '1' : `e^{${jAng(a)}}`)).join('');
        const z = set.reduce((w, a) => [w[0] + Math.cos(angVal(a)), w[1] + Math.sin(angVal(a))], [0, 0]);
        const ans = cT(S(Math.round(z[0])), S(Math.round(z[1])));
        return dest({ key: '6-96trapB', q: `$a+bj$ の形に：$${terms}=□$`, a: `$${ans}$`,
          verify: p => cIs(p.a, z) }, '6-96', '角が120°ずつではなく90°ずつ。和は0にならない。1つずつ $a+bj$ に直す', ['6-61']);
      },
    },
  });

})(globalThis.MONDAI);

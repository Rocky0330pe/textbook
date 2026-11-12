/* 問題集 第4巻　第4部 三角関数と加法定理（わざ 4-48〜4-62、4-95）　組 d
 * 書き方は v4/README.md（第4巻の手引き）と v2/README.md。文は教科書 第4巻と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 角は度で書く（$30^{\circ}$）。電卓は使わない：角は 0°・30°・45°・60°・90° とその仲間（180°・360° から足し引き）と 15°・75° だけ（K-4）。
 * 答えは √ を残した形（分母は有理化）。答えが式1つでないもの（角が2つ・ことば・振幅と周期の組・座標）は verify で、別の道すじで計算し直す。
 * θ をふくむ恒等式（加法定理・2倍角・90°回す式）は、θ にいくつかの角を入れて、数で確かめる（evT）。
 * 図は 4-49 のステップ3だけ（単位円。K-2）。図の点の位置は、問題の角から計算する。
 * わなは、同じ部のほかのわざで楽にならないものにする。当たるときは easy に行き先を書いて also に入れる（dest。第29回 H-1）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の書き方
  const fmt = v => String(+(+v).toFixed(6));                       // 0.30000000004 → 0.3
  const strip = s => String(s).replace(/^\$|\$$/g, '');
  const close = (x, y) => x != null && y != null && Math.abs(x - y) <= 1e-7 * Math.max(1, Math.abs(x), Math.abs(y));
  const rd = a => a * Math.PI / 180;
  const dg = a => `${a}^{\\circ}`;                                  // 角（度）の TeX
  const P = (x, y) => `(${x},\\ ${y})`;                            // 座標 (x,\ y)
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const decOK = d => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const decTeX = f => (decOK(f[1]) ? fmt(f[0] / f[1]) : F.tex(f));  // 分数を、きりのよい小数か \frac に
  const par = t => (/^-/.test(t) ? `\\left(${t}\\right)` : t);     // マイナスはかっこごと
  const maths = q => (String(q).match(/\$[^$]*\$/g) || []).map(t => t.slice(1, -1));

  // ---------------------------------------------------------------- 根号をふくむ数（1・√2・√3・√6 の組み合わせ。係数は分数）
  const KEYS = [1, 6, 3, 2];
  const Rz = () => ({ 1: fr(0), 2: fr(0), 3: fr(0), 6: fr(0) });
  const Rk = (k, f) => { const r = Rz(); r[k] = f; return r; };
  const Radd = (a, b) => { const r = Rz(); KEYS.forEach(k => { r[k] = F.add(a[k], b[k]); }); return r; };
  const Rscale = (a, f) => { const r = Rz(); KEYS.forEach(k => { r[k] = F.mul(a[k], f); }); return r; };
  const Rnum = a => KEYS.reduce((s, k) => s + F.val(a[k]) * Math.sqrt(k), 0);
  function Rtex(a) {
    const ks = KEYS.filter(k => a[k][0] !== 0);
    if (!ks.length) return '0';
    const D = ks.reduce((l, k) => F.lcm(l, a[k][1]), 1);
    let ns = ks.map(k => [k, a[k][0] * D / a[k][1]]);
    let neg = false;
    if (D > 1 && ns.every(([, n]) => n < 0)) { neg = true; ns = ns.map(([k, n]) => [k, -n]); }   // 分数のときだけ、マイナスを前に出す
    ns = ns.filter(([, n]) => n > 0).concat(ns.filter(([, n]) => n < 0));   // 正の項を先に
    const term = (k, n) => { const m = Math.abs(n); return k === 1 ? `${m}` : `${m === 1 ? '' : m}\\sqrt{${k}}`; };
    const top = ns.map(([k, n], i) => (i === 0 ? (n < 0 ? '-' : '') : (n < 0 ? '-' : '+')) + term(k, n)).join('');
    return (neg ? '-' : '') + (D === 1 ? top : `\\frac{${top}}{${D}}`);
  }
  // 三角関数の値（15° の倍数）
  const SINREF = { 0: Rz(), 15: Radd(Rk(6, fr(1, 4)), Rk(2, fr(-1, 4))), 30: Rk(1, fr(1, 2)), 45: Rk(2, fr(1, 2)), 60: Rk(3, fr(1, 2)), 75: Radd(Rk(6, fr(1, 4)), Rk(2, fr(1, 4))), 90: Rk(1, fr(1)) };
  const TANREF = { 0: Rz(), 15: Radd(Rk(1, fr(2)), Rk(3, fr(-1))), 30: Rk(3, fr(1, 3)), 45: Rk(1, fr(1)), 60: Rk(3, fr(1)), 75: Radd(Rk(1, fr(2)), Rk(3, fr(1))) };
  const norm = a => ((a % 360) + 360) % 360;
  function refAng(a) { const r = norm(a); return r <= 90 ? r : r <= 180 ? 180 - r : r <= 270 ? r - 180 : 360 - r; }
  const quad = a => { const r = norm(a); return r > 0 && r < 90 ? 1 : r > 90 && r < 180 ? 2 : r > 180 && r < 270 ? 3 : r > 270 ? 4 : 0; };
  const sgn = v => (Math.abs(v) < 1e-12 ? 0 : v > 0 ? 1 : -1);
  const FN = { sin: a => Math.sin(rd(a)), cos: a => Math.cos(rd(a)), tan: a => Math.tan(rd(a)) };
  function ev(fn, a) {   // 正確な値（R）
    const r = refAng(a);
    if (fn === 'sin') return Rscale(SINREF[r], fr(sgn(FN.sin(a))));
    if (fn === 'cos') return Rscale(SINREF[90 - r], fr(sgn(FN.cos(a))));
    return Rscale(TANREF[r], fr(sgn(FN.sin(a)) * sgn(FN.cos(a)) || 1));
  }
  const evt = (fn, a) => Rtex(ev(fn, a));
  const QN = ['', '右上', '左上', '左下', '右下'];
  const DIRX = c => (c > 0 ? '右' : '左'), DIRY = s => (s > 0 ? '上' : '下');

  // ---------------------------------------------------------------- 検算の部品
  // θ をふくむ式の値（θ は度）。\sin^{2}\theta → (\sin\theta)^{2}、\sin2\theta → \sin(2\theta)
  function evT(t, th) {
    const s = strip(t).replace(/\\(sin|cos|tan)\^\{2\}\\theta/g, '(\\$1\\theta)^{2}')
      .replace(/\\(sin|cos|tan)\s*(\d+)\\theta/g, '\\$1($2\\theta)')
      .replace(/\\theta/g, `(${th}^{\\circ})`);
    return M.evalMath(s, {});
  }
  // 2つの式が θ の恒等式か
  function sameTheta(a, b) {
    for (const th of [17, 41, 73, 128, 199, 262, 333]) {
      const x = evT(a, th), y = evT(b, th);
      if (x == null || y == null) return `式が読めない（${a} ／ ${b}）`;
      if (!close(x, y)) return `θ=${th}° で ${a} と ${b} の値がちがう`;
    }
    return true;
  }
  const angs = t => [...String(t).matchAll(/(-?\d+(?:\.\d+)?)\^\{\\circ\}/g)].map(m => +m[1]);
  const numOf = t => M.evalMath(strip(t), {});
  // 答えの値（式）と、数 v が同じか
  const valIs = (ans, v) => (close(numOf(ans), v) || `答え ${ans} の値が ${v} でない`);

  // ---------------------------------------------------------------- わなの行き先（H-1・H-2）
  function dest(p, self, why) {
    const q = M.plain(p.q);
    const also = M.list(4).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 4 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    if (also.length) p.also = also;
    p.easy = `（${why}${also.length ? `。わざ ${also.join('・')}` : ''}）`;
    p.easyCheck = false;
    return p;
  }

  // ---------------------------------------------------------------- よく使う文
  const RANGE = `$0^{\\circ}\\leqq\\theta<360^{\\circ}$`;
  const TRI = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]];   // 辺が整数の直角三角形

  // ================================================================ 4-48
  M.add({
    id: '4-48', part: 4, chap: '4-8①', stars: 1,
    title: '一般角は $360^{\\circ}$ でわったあまり（負の角は $+360^{\\circ}$）',
    mark: '$360^{\\circ}$ より大きい角、マイナスの角、$2\\pi$ より大きい rad の角の、動径の位置。',
    futsu: ['動径を1周ずつ回して、', '何周めのどこに来るかを図でたどる。'],
    raku: ['$750^{\\circ}-360^{\\circ}\\times2=30^{\\circ}$', '→ 2周と $30^{\\circ}$。$30^{\\circ}$ と同じ位置', '$-120^{\\circ}+360^{\\circ}=240^{\\circ}$'],
    why: '動径は $360^{\\circ}$（$2\\pi$ rad）回るともとの位置にもどる。曜日を7日でわったあまりで見るのと同じで、何周したかは位置に関係しない（4-8①）。右回りのマイナスの角は、$360^{\\circ}$ をたすと、同じ位置の正の角になる。',
    caution: 'マイナスの角 $-120^{\\circ}$ を、$120^{\\circ}$ の位置としない。マイナスは右回りなので、$360^{\\circ}$ をたした $240^{\\circ}$ の位置。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s3: '22mm' },
    fits(q) {
      if (/周期|くり返/.test(q)) return false;
      if (angs(q).some(a => Math.abs(a) > 360)) return true;
      if (/(^|[^a-zA-Z0-9}])-\d+(\.\d+)?\^\{\\circ\}/.test(q)) return true;
      if ([...q.matchAll(/\\frac\{(\d+)\\pi\}\{(\d+)\}/g)].some(m => +m[1] / +m[2] > 2)) return true;
      return /右回り/.test(q) && /動径/.test(q);
    },
    steps: {
      // 360°より大きい角
      s1(r) {
        const b = r.int(1, 35) * 10, n = r.int(1, 3), A = b + 360 * n;
        if (b % 90 === 0 && r.chance(0.6)) return null;
        return { q: `$${dg(A)}$ と同じ位置の動径の角（$0^{\\circ}$〜$360^{\\circ}$）`, a: `$${dg(b)}$`, easy: `$${dg(A)}-360^{\\circ}${n > 1 ? `\\times${n}` : ''}=${dg(b)}$` };
      },
      // マイナスの角
      s2(r) {
        const b = r.int(1, 35) * 10, n = r.chance(0.7) ? 1 : 2, A = b - 360 * n;
        return { q: `$${dg(A)}$ と同じ位置の動径の角（$0^{\\circ}$〜$360^{\\circ}$）`, a: `$${dg(b)}$`, easy: `$${dg(A)}+360^{\\circ}${n > 1 ? `\\times${n}` : ''}=${dg(b)}$` };
      },
      // rad の角・何周と何度・右回りに回る（教科書 4-8①の例題）
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const d = r.pick([2, 3, 4, 6]), p = r.int(1, 2 * d - 1), n = r.int(1, 2);
          if (F.gcd(p, d) !== 1) return null;
          const N = p + 2 * d * n, pi = (num, den) => (den === 1 ? `${num === 1 ? '' : num}\\pi` : `\\frac{${num === 1 ? '' : num}\\pi}{${den}}`);
          return { q: `$${pi(N, d)}$ rad と同じ位置の動径の角を、$0$〜$2\\pi$ の rad で`, a: `$${pi(p, d)}$`, easy: `$${pi(N, d)}-2\\pi${n > 1 ? `\\times${n}` : ''}=${pi(p, d)}$` };
        }
        if (k === 1) {
          const b = r.int(1, 35) * 10, n = r.int(2, 5), A = b + 360 * n, obj = r.pick(['観覧車', 'タイヤ', '風車', 'こま']);
          return {
            q: `${obj}が左回りに $${dg(A)}$ 回った。□ 周と $□^{\\circ}$`, a: `${n} 周と $${dg(b)}$`, easyCheck: false,
            easy: `$${A}\\div360=${n}$ あまり ${b}`, verify: () => (n * 360 + b === A && b > 0 && b < 360) || 'あまりがちがう',
          };
        }
        const X = r.int(1, 70) * 10, b = norm(-X), n = Math.ceil(X / 360);
        if (b === 0) return null;
        return { q: `右回りに $${dg(X)}$ 回った動径と同じ位置の角（$0^{\\circ}$〜$360^{\\circ}$）`, a: `$${dg(b)}$`, easy: `$${dg(-X)}+360^{\\circ}${n > 1 ? `\\times${n}` : ''}=${dg(b)}$` };
      },
      // わな：sin kθ の周期は 360° ではない（θ に 360°÷k たすと kθ が1周する。4-52）
      trap(r) {
        const k = r.pick([2, 3, 4]), fn = r.pick(['sin', 'cos']), p = 360 / k;
        const p0 = { q: `$y=\\${fn}${k}\\theta$ は、$\\theta$ が何度ふえるごとに同じ値をくり返すか（いちばん小さい角）`, a: `$${dg(p)}$`,
          verify: () => [10, 47, 200].every(t => close(Math.sin(rd(k * (t + p))) , Math.sin(rd(k * t)))) && [10, 47].some(t => !close(Math.sin(rd(k * (t + p / 2))), Math.sin(rd(k * t)))) || '周期がちがう' };
        return dest(p0, '4-48', `$${dg(360)}$ ではなく、$\\theta$ が $360^{\\circ}\\div${k}=${dg(p)}$ ふえると $${k}\\theta$ が1周する。波の周期を読む`);
      },
    },
  });

  // ================================================================ 4-49
  // 単位円の図：座標軸・半径1の円（図では半径4の大きさ）・動径・点P・x 軸とのとがった角のしるし
  function unitFig(a) {
    const R0 = 4, c = Math.cos(rd(a)), s = Math.sin(rd(a)), Pp = [R0 * c, R0 * s], q = quad(a), ref = refAng(a);
    const mid = [0, ref / 2, 180 - ref / 2, 180 + ref / 2, 360 - ref / 2][q], lr = 2.8;
    return {
      s: 3.3, pad: 0.4,
      items: [
        ['axes', -4.8, 5.3, -4.8, 5.3, { o: false }],
        ['label', [0, 0], 'O', q === 3 ? 'se' : 'sw'],          // O は、角のしるしのない側に
        ['circle', [0, 0], R0],
        ['seg', [0, 0], Pp, { thick: true }],
        ['angle', [c > 0 ? 2 : -2, 0], [0, 0], Pp, '', 1.3],
        ['label', [lr * Math.cos(rd(mid)), lr * Math.sin(rd(mid))], `$${dg(ref)}$`, 'c'],
        ['dot', Pp],
        ['label', Pp, '$\\mathrm{P}$', ['', 'ne', 'nw', 'sw', 'se'][q]],
      ],
    };
  }
  const STD = [120, 135, 150, 210, 225, 240, 300, 315, 330];
  function easy49(a, fn) {
    const q = quad(a);
    if (!q) return { easy: `動径は軸の上 → $${evt(fn, a)}$`, easyCheck: 'last' };
    return { easy: `${QN[q]}、$x$ 軸から $${dg(refAng(a))}$ → $${evt(fn, a)}$`, easyCheck: 'last' };
  }
  M.add({
    id: '4-49', part: 4, chap: '4-8②③', stars: 1,
    title: '単位円では、$x$ 軸とのとがった角と、象限の符号',
    mark: '$90^{\\circ}$ をこえる角や、マイナスの角の $\\sin$・$\\cos$・$\\tan$（$210^{\\circ}$、$315^{\\circ}$、$480^{\\circ}$）。',
    futsu: ['単位円をかき、動径の点Pの座標を、', '図からはかって読む。'],
    raku: ['$210^{\\circ}$ は左下、$x$ 軸から $30^{\\circ}$', '$30^{\\circ}$ の三角形で、横 $\\frac{\\sqrt{3}}{2}$、たて $\\frac{1}{2}$', '左なので $\\cos210^{\\circ}=-\\frac{\\sqrt{3}}{2}$'],
    why: '単位円の上の点Pの座標が $(\\cos\\theta,\\ \\sin\\theta)$（4-8②）。Pから $x$ 軸に下ろした直角三角形は、$x$ 軸とのとがった角の三角定規の形なので、長さはその角の値。右か左か、上か下かが符号を決める（4-8③）。',
    caution: '$\\cos150^{\\circ}=\\frac{\\sqrt{3}}{2}$ としない。Pは左にいるので $\\cos$ は負。$x$ 軸とのとがった角が $15^{\\circ}$・$75^{\\circ}$ なら、三角定規の値ではない（加法定理。4-56）。',
    counts: { s1: 8, s2: 4, s3: 2, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '20mm', boxh: '11mm',
    fits(q) {
      if (/単位円/.test(q) && /図/.test(q)) return true;
      if (/極座標/.test(q)) return angs(q).some(a => (a < 0 || a > 90) && [0, 30, 45, 60, 90].includes(refAng(a)));
      for (const m of q.matchAll(/\\(sin|cos|tan)\s*(?:(-?\d+)\^\{\\circ\}|\((-?\d+)\^\{\\circ\}\))/g)) {
        const a = +(m[2] || m[3]);
        if ((a < 0 || a > 90) && [0, 30, 45, 60, 90].includes(refAng(a))) return true;
      }
      return false;
    },
    steps: {
      // 0°〜360°の角の sin・cos
      s1(r) {
        const a = r.chance(0.12) ? r.pick([180, 270]) : r.pick(STD), fn = r.pick(['sin', 'cos']);
        return { q: `$\\${fn}${dg(a)}$`, a: `$${evt(fn, a)}$`, ...easy49(a, fn), key: fn + a };
      },
      // 360°より大きい角・マイナスの角・tan・極座標（教科書 4-8②の例題）
      s2(r) {
        const k = r.int(0, 3);
        if (k === 3) {
          const R0 = r.pick([2, 4, 6, 8]), a = r.pick(STD), xy = r.pick(['x', 'y']), fn = xy === 'x' ? 'cos' : 'sin';
          const v = Rscale(ev(fn, a), fr(R0));
          return { q: `極座標 $${P(R0, dg(a))}$ の点の $${xy}$ 座標`, a: `$${Rtex(v)}$`, easy: `$${R0}\\${fn}${dg(a)}=${R0}\\times${par(evt(fn, a))}=${Rtex(v)}$`, key: `p${R0}${a}${xy}` };
        }
        const base = r.pick([30, 45, 60].concat(STD)), fn = k === 2 ? 'tan' : r.pick(['sin', 'cos']);
        const neg = r.chance(0.4), A = neg ? base - 360 : base + 360 * r.int(1, 2);
        const qa = neg ? `\\${fn}(${dg(A)})` : `\\${fn}${dg(A)}`;
        const step = neg ? `${dg(A)}+360^{\\circ}=${dg(base)}` : `${dg(A)}-360^{\\circ}${A - base > 360 ? `\\times${(A - base) / 360}` : ''}=${dg(base)}`;
        return { q: `$${qa}$`, a: `$${evt(fn, A)}$`, easy: `$${step}$ と同じ位置 → $${evt(fn, A)}$`, easyCheck: 'last', key: fn + A };
      },
      // 図の単位円で、点Pの座標・動径の角（図はステップ3。x 軸とのとがった角だけを図に書く）
      s3(r) {
        const a = r.pick(STD), k = r.int(0, 2), q = quad(a), ref = refAng(a), fig = unitFig(a);
        if (k === 2) {
          const st = q === 2 ? `180^{\\circ}-${dg(ref)}` : q === 3 ? `180^{\\circ}+${dg(ref)}` : `360^{\\circ}-${dg(ref)}`;
          return { q: '図は単位円。動径OPの角 $\\theta$（$0^{\\circ}\\leqq\\theta<360^{\\circ}$）', a: `$${dg(a)}$`, easy: `${QN[q]}なので $${st}=${dg(a)}$`, fig, key: `t${a}` };
        }
        const xy = k ? 'y' : 'x', fn = k ? 'sin' : 'cos';
        return {
          q: `図は単位円。点Pの $${xy}$ 座標`, a: `$${evt(fn, a)}$`, fig, key: `${xy}${a}`,
          easy: `${QN[q]}、とがった角 $${dg(ref)}$ → $${evt(fn, a)}$`, easyCheck: 'last', verify: () => valIs(`$${evt(fn, a)}$`, FN[fn](a)),
        };
      },
      // わな：x 軸とのとがった角が 15°・75°（三角定規の角ではない。加法定理 4-56）
      trap(r) {
        const a = r.pick([105, 165, 195, 255, 285, 345]), fn = r.pick(['sin', 'cos']);
        return dest({ q: `$\\${fn}${dg(a)}$`, a: `$${evt(fn, a)}$` }, '4-49', `$x$ 軸とのとがった角が $${dg(refAng(a))}$ で、三角定規の角ではない。$45^{\\circ}$ と $30^{\\circ}$ などに分けて加法定理`);
      },
    },
  });

  // ================================================================ 4-50
  // 三角形 [p, q, h] から、sin（または cos）が p/h になる値
  const ratioTeX = (n, d, dec) => (dec && decOK(d) ? fmt(n / d) : F.tex(fr(n, d)));
  // √(d²−n²)/d を、根号の形に（整数になるときは分数）
  function otherSide(n, d) {
    const m = d * d - n * n;
    let k = 1, s = m;
    for (let i = Math.floor(Math.sqrt(m)); i >= 2; i--) if (m % (i * i) === 0) { k = i; s = m / (i * i); break; }
    return s === 1 ? Rk(1, fr(k, d)) : Rk(s, fr(k, d));
  }
  M.add({
    id: '4-50', part: 4, chap: '4-8④', stars: 1,
    title: '$\\sin^{2}\\theta+\\cos^{2}\\theta=1$ のあと、符号は象限で決める',
    mark: '$\\sin\\theta$ か $\\cos\\theta$ の一方の値と、$\\theta$ の象限（または角のはんい）だけがわかっている。',
    futsu: ['$\\theta$ が何度かを先に求めようとする', '（$\\sin\\theta=0.6$ の角は三角定規の角ではないので、電卓がいる）。'],
    raku: ['$\\sin\\theta=0.6$、第2象限', '$\\cos^{2}\\theta=1-0.36=0.64$ → $\\pm0.8$', '左にいるので $\\cos\\theta=-0.8$'],
    why: '単位円の上の点は原点から1の所にあるので、三平方の定理で $\\sin^{2}\\theta+\\cos^{2}\\theta=1$（4-8④）。2乗すると符号が消えるので、2つの候補のどちらかを、点のいる場所（象限）で決める。',
    caution: '象限が書いていないと、符号は1つに決まらない（答えは2つ）。',
    counts: { s1: 8, s2: 5, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: '16mm', boxh: '11mm',
    fits(q) { return /\\(sin|cos)\\theta=/.test(q) && /象限|<\\theta</.test(q) && !/満たす/.test(q); },
    steps: {
      // sin から cos（辺が整数の直角三角形の値）
      s1(r) {
        const t = r.pick(TRI), sw = r.chance(0.5), n = sw ? t[1] : t[0], m = sw ? t[0] : t[1], h = t[2];
        const qd = r.int(1, 4), sy = qd <= 2 ? 1 : -1, cx = qd === 1 || qd === 4 ? 1 : -1, dec = decOK(h);
        const sT = ratioTeX(sy * n, h, dec), cT = ratioTeX(cx * m, h, dec);
        const sq = dec ? `${fmt(n / h)}^{2}` : `\\left(\\frac{${n}}{${h}}\\right)^{2}`, c2 = dec ? fmt((m * m) / (h * h)) : F.tex(fr(m * m, h * h));
        return {
          q: `$\\sin\\theta=${sT}$（第${qd}象限）、$\\cos\\theta$`, a: `$${cT}$`,
          easy: `$\\cos^{2}\\theta=1-${sq}=${c2}$ → ${DIRX(cx)}にいるので $${cT}$`, easyCheck: 'last',
          verify: () => (close(numOf(cT) ** 2 + numOf(sT) ** 2, 1) && Math.sign(numOf(cT)) === cx && Math.sign(numOf(sT)) === sy) || '値か符号がちがう',
        };
      },
      // cos から sin。根号が残る値（$\frac13$ など）、角のはんいで書く
      s2(r) {
        const [n, d] = r.chance(0.5) ? r.pick([[1, 3], [1, 5], [1, 7], [5, 7], [7, 9]]) : (t => [t[0], t[2]])(r.pick(TRI));
        const qd = r.int(1, 4), cx = qd === 1 || qd === 4 ? 1 : -1, sy = qd <= 2 ? 1 : -1;
        const oth = otherSide(n, d);
        const sv = Rscale(oth, fr(sy)), cT = F.tex(fr(cx * n, d)), sT = Rtex(sv);
        const rng = ['', `$0^{\\circ}<\\theta<90^{\\circ}$`, `$90^{\\circ}<\\theta<180^{\\circ}$`, `$180^{\\circ}<\\theta<270^{\\circ}$`, `$270^{\\circ}<\\theta<360^{\\circ}$`][qd];
        const where = r.chance(0.5) ? rng : `第${qd}象限`;
        return {
          q: `$\\cos\\theta=${cT}$（${where}）、$\\sin\\theta$`, a: `$${sT}$`, key: `${cT}/${qd}`,
          easy: `$\\sin^{2}\\theta=1-\\frac{${n * n}}{${d * d}}=\\frac{${d * d - n * n}}{${d * d}}$ → ${DIRY(sy)}にいるので $${sT}$`, easyCheck: 'last',
          verify: () => (close(numOf(sT) ** 2 + (n / d) ** 2, 1) && Math.sign(numOf(sT)) === sy) || '値か符号がちがう',
        };
      },
      // 単位円の点の座標で聞く・tan を聞く
      s3(r) {
        const t = r.pick(TRI), h = t[2], dec = decOK(h);
        if (r.chance(0.5)) {
          const n = t[0], m = t[1], sy = r.pick([1, -1]), cx = r.pick([1, -1]);
          const yT = ratioTeX(sy * n, h, dec), xT = ratioTeX(cx * m, h, dec);
          return {
            q: `単位円の上の点Pは、$y$ 座標が $${yT}$ で、$y$ 軸より${DIRX(cx)}。Pの $x$ 座標`, a: `$${xT}$`,
            easy: `$x^{2}=1-${dec ? `${fmt(n / h)}^{2}` : `\\left(\\frac{${n}}{${h}}\\right)^{2}`}$ → ${DIRX(cx)}なので $${xT}$`, easyCheck: 'last',
            verify: () => (close(numOf(xT) ** 2 + numOf(yT) ** 2, 1) && Math.sign(numOf(xT)) === cx) || '値か符号がちがう',
          };
        }
        const qd = r.int(2, 4), cx = qd === 4 ? 1 : -1, sy2 = qd === 2 ? 1 : -1;
        const cT = F.tex(fr(cx * t[0], h)), sT = F.tex(fr(sy2 * t[1], h)), tn = F.tex(fr(sy2 * cx * t[1], t[0]));
        return {
          q: `$\\cos\\theta=${cT}$（第${qd}象限）、$\\tan\\theta$`, a: `$${tn}$`,
          easy: `$\\sin\\theta=${sT}$ → $\\tan\\theta=\\frac{\\sin\\theta}{\\cos\\theta}=${tn}$`, easyCheck: 'last',
          verify: () => { const th = Math.atan2(sy2 * t[1], cx * t[0]); return (close(Math.cos(th), numOf(cT)) && close(Math.tan(th), numOf(tn))) || 'tan がちがう'; },
        };
      },
      // わな：象限が書いていない（符号が1つに決まらない。答えは2つ）
      trap(r) {
        const t = r.pick(TRI), h = t[2], dec = decOK(h), fn = r.pick(['sin', 'cos']), other = fn === 'sin' ? 'cos' : 'sin';
        const gT = ratioTeX(t[0], h, dec), oT = ratioTeX(t[1], h, dec);
        return dest({
          q: `$\\${fn}\\theta=${gT}$ のとき $\\${other}\\theta$`, a: `$${oT}$ か $-${oT}$`,
          verify: () => close(numOf(oT) ** 2 + numOf(gT) ** 2, 1) || '値がちがう',
        }, '4-50', '象限が書いていないので、符号を1つに決められない。答えは2つ');
      },
    },
  });

  // ================================================================ 4-51
  const rot = (x, y, deg) => [Math.round(x * Math.cos(rd(deg)) - y * Math.sin(rd(deg))), Math.round(x * Math.sin(rd(deg)) + y * Math.cos(rd(deg)))];
  const ptOK = (ans, x, y, deg) => {
    const m = /\((-?\d+),\\ (-?\d+)\)/.exec(ans), [u, v] = [x * Math.cos(rd(deg)) - y * Math.sin(rd(deg)), x * Math.sin(rd(deg)) + y * Math.cos(rd(deg))];
    return (m && close(+m[1], u) && close(+m[2], v)) || `回した点は (${fmt(u)}, ${fmt(v)})（答え ${ans}）`;
  };
  const nz = r => r.pick([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
  M.add({
    id: '4-51', part: 4, chap: '4-8⑤', stars: 1,
    title: '$90^{\\circ}$ 回すと $(x,\\ y)\\to(-y,\\ x)$',
    mark: '点を原点のまわりに $90^{\\circ}$・$180^{\\circ}$ 回す。$\\sin(\\theta+90^{\\circ})$、$\\cos(\\theta+90^{\\circ})$ を書きかえる。',
    futsu: ['方眼に点をかき、原点と結ぶ線を', '分度器で $90^{\\circ}$ 回して、', '新しい点の座標を読む。'],
    raku: ['$(4,\\ 2)$ → $(-2,\\ 4)$（入れかえて、前にマイナス）', 'もう1回で $(-4,\\ -2)$', '$180^{\\circ}$ は両方の符号を変えるだけ'],
    why: '点への道すじ「右へ $x$、上へ $y$」をまるごと $90^{\\circ}$ 回すと、「上へ $x$、左へ $y$」になる（4-8⑤）。単位円の点 $(\\cos\\theta,\\ \\sin\\theta)$ に使うと、$\\cos(\\theta+90^{\\circ})=-\\sin\\theta$、$\\sin(\\theta+90^{\\circ})=\\cos\\theta$。',
    caution: '右回りの $90^{\\circ}$ は $(x,\\ y)\\to(y,\\ -x)$。$60^{\\circ}$ のように $90^{\\circ}$ の倍数でない角では使えない（原点からの距離 $r$ で $(r\\cos\\theta,\\ r\\sin\\theta)$）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '24mm',
    fits(q) {
      if (/y=/.test(q)) return false;
      if (/\((\\theta|x)\s*[-+]\s*(90|180|270)\^\{\\circ\}\)/.test(q)) return true;
      return /回/.test(q) && /点|先/.test(q) && /(^|[^0-9])(90|180|270)\^\{\\circ\}/.test(q) && !/(^|[^0-9])(30|45|60|120|150)\^\{\\circ\}/.test(q);
    },
    steps: {
      // 左回りに 90°・180°
      s1(r) {
        const x = nz(r), y = nz(r), deg = r.chance(0.7) ? 90 : 180, [u, v] = rot(x, y, deg);
        return {
          q: `点 $${P(x, y)}$ を原点のまわりに左回りに $${dg(deg)}$ 回した点`, a: `$${P(u, v)}$`, easyCheck: false,
          easy: deg === 90 ? `$(x,\\ y)\\to(-y,\\ x)$ で $${P(u, v)}$` : `両方の符号を変えて $${P(u, v)}$`, verify: () => ptOK(`$${P(u, v)}$`, x, y, deg),
        };
      },
      // 右回りの 90°・左回りに 270°・2回つづけて
      s2(r) {
        const x = nz(r), y = nz(r), k = r.int(0, 2);
        if (k === 2) {
          const [u, v] = rot(x, y, 90), [u2, v2] = rot(x, y, 180);
          return {
            q: `点 $${P(x, y)}$ を左回りに $90^{\\circ}$ 回し、さらに $90^{\\circ}$ 回した点`, a: `$${P(u2, v2)}$`, easyCheck: false,
            easy: `$${P(u, v)}$ → $${P(u2, v2)}$（$180^{\\circ}$ と同じ）`, verify: () => ptOK(`$${P(u2, v2)}$`, x, y, 180),
          };
        }
        const [u, v] = rot(x, y, -90), how = k ? `左回りに $270^{\\circ}$` : `右回りに $90^{\\circ}$`;
        return {
          q: `点 $${P(x, y)}$ を原点のまわりに${how} 回した点`, a: `$${P(u, v)}$`, easyCheck: false,
          easy: `右回りの $90^{\\circ}$ は $(x,\\ y)\\to(y,\\ -x)$ で $${P(u, v)}$`, verify: () => ptOK(`$${P(u, v)}$`, x, y, -90),
        };
      },
      // sin・cos の式で（4-8⑤）・ロボットのうで・時計の針
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [lhs, rhs] = r.pick([['\\sin(\\theta+90^{\\circ})', '\\cos\\theta'], ['\\cos(\\theta+90^{\\circ})', '-\\sin\\theta'], ['\\sin(\\theta-90^{\\circ})', '-\\cos\\theta'],
            ['\\cos(\\theta-90^{\\circ})', '\\sin\\theta'], ['\\sin(\\theta+180^{\\circ})', '-\\sin\\theta'], ['\\cos(\\theta+180^{\\circ})', '-\\cos\\theta']]);
          return { q: `$${lhs}$ を、$\\sin\\theta$ か $\\cos\\theta$ で`, a: `$${rhs}$`, easyCheck: false, easy: '単位円の点を回した点の座標から', verify: () => sameTheta(lhs, rhs) };
        }
        if (k === 1) {
          const x = r.int(1, 6), y = r.int(1, 6), [u, v] = rot(x, y, 90);
          return {
            q: `ロボットのうでの先が $${P(x, y)}$ にある。肩（原点）のまわりに左回りに $90^{\\circ}$ 回すと、先の座標は`, a: `$${P(u, v)}$`, easyCheck: false,
            easy: `$(x,\\ y)\\to(-y,\\ x)$ で $${P(u, v)}$`, verify: () => ptOK(`$${P(u, v)}$`, x, y, 90),
          };
        }
        const [x, y] = r.pick([[3, 4], [4, 3], [-3, 4], [-4, 3], [5, 12], [-5, 12], [12, 5], [0, 5]]), mins = r.pick([15, 30, 45]), [u, v] = rot(x, y, -6 * mins);
        return {
          q: `時計の中心を原点にすると、長針の先は $${P(x, y)}$。${mins}分後（右回りに $${dg(6 * mins)}$）の先の座標`, a: `$${P(u, v)}$`, easyCheck: false,
          easy: mins === 30 ? `両方の符号を変えて $${P(u, v)}$` : mins === 15 ? `右回りの $90^{\\circ}$：$(x,\\ y)\\to(y,\\ -x)$ で $${P(u, v)}$` : `左回りの $90^{\\circ}$ と同じ：$(x,\\ y)\\to(-y,\\ x)$ で $${P(u, v)}$`,
          verify: () => ptOK(`$${P(u, v)}$`, x, y, -6 * mins),
        };
      },
      // わな：90°の倍数でない角（入れかえは使えない。距離 r で (r cos θ, r sin θ)）
      trap(r) {
        const R0 = r.pick([2, 4, 6]), a = r.pick([30, 45, 60]), ax = r.chance(0.5);
        const X = Rscale(ev('cos', a), fr(R0)), Y = Rscale(ev('sin', a), fr(R0));
        const [xT, yT] = ax ? [Rtex(X), Rtex(Y)] : [Rtex(Rscale(Y, fr(-1))), Rtex(X)];
        return dest({
          q: `点 $${ax ? P(R0, 0) : P(0, R0)}$ を原点のまわりに左回りに $${dg(a)}$ 回した点`, a: `$${P(xT, yT)}$`,
          verify: () => { const b = ax ? a : a + 90; return (close(numOf(xT), R0 * Math.cos(rd(b))) && close(numOf(yT), R0 * Math.sin(rd(b)))) || '座標がちがう'; },
        }, '4-51', `$90^{\\circ}$ の倍数でないので、入れかえは使えない。原点から $${R0}$ の所なので $(${R0}\\cos${dg(ax ? a : a + 90)},\\ ${R0}\\sin${dg(ax ? a : a + 90)})$`);
      },
    },
  });

  // ================================================================ 4-52
  // 波の式 y = A sin(kθ − α) の値（数）
  const wave = (fn, A, k, al) => th => A * FN[fn](k * th - al);
  const coefT = A => (A === 1 ? '' : `${A}`);
  // 振幅（いちばん大きい値）と周期（同じ値をくり返す、いちばん小さい角）を、表を作って調べる
  function ampPer(f) {
    let mx = -Infinity;
    for (let t = 0; t < 720; t += 0.5) mx = Math.max(mx, f(t));
    let per = null;
    for (let p = 1; p <= 720 && per == null; p++) if ([0, 13, 37, 101, 250].every(t => close(f(t + p), f(t)))) per = p;
    return [mx, per];
  }
  M.add({
    id: '4-52', part: 4, chap: '4-8⑦', stars: 1,
    title: '波の式から、振幅・周期・ずれを読む',
    mark: '$y=A\\sin(\\theta-\\alpha)$、$y=\\sin k\\theta$ の形の式。',
    futsu: ['$\\theta$ に $0^{\\circ}$、$30^{\\circ}$、$60^{\\circ}$、… を入れて表を作り、', 'グラフをかいて、山の高さやくり返しを読む。'],
    raku: ['$y=3\\sin(\\theta-30^{\\circ})$', '前の3が振幅、周期は $360^{\\circ}$', 'かっこの中の $-30^{\\circ}$ で右へ $30^{\\circ}$', '$y=\\sin2\\theta$ の周期は $360^{\\circ}\\div2=180^{\\circ}$'],
    why: '前の $A$ はたてに $A$ 倍。かっこの中が0になる $\\theta=\\alpha$ で波が始まるので、右へ $\\alpha$。$k\\theta$ は $k$ 倍の速さで回るのと同じなので、周期は $360^{\\circ}\\div k$（4-8⑦。3-9の放物線の動かし方と同じ）。',
    caution: '$\\sin(\\theta-60^{\\circ})$ は右へ $60^{\\circ}$（左ではない）。$\\sin(2\\theta-60^{\\circ})$ は $2(\\theta-30^{\\circ})$ とくくるので、右へ $30^{\\circ}$。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (!/y=[^$]*\\(sin|cos)/.test(q) || !/振幅|周期|ずら|くり返/.test(q)) return false;
      if (/\\(sin|cos)\\theta[+-]\d*\\(sin|cos)/.test(q)) return false;        // sin と cos の和（合成）
      return !/\(\d+\\theta[+-]\d+\^\{\\circ\}\)/.test(q);                        // かっこの中が kθ−α
    },
    steps: {
      // 振幅と周期
      s1(r) {
        const fn = r.pick(['sin', 'cos']), A = r.pick([1, 2, 3, 4, 5, 10]), k = r.pick([1, 2, 3, 4, 6, 0.5]);
        if (A === 1 && k === 1) return null;
        const kt = k === 0.5 ? `\\frac{\\theta}{2}` : `${k === 1 ? '' : k}\\theta`, per = 360 / k;
        const ans = `$${A}$、$${dg(per)}$`;
        return {
          q: `$y=${coefT(A)}\\${fn}${kt}$ の振幅は □、周期は $□^{\\circ}$`, a: ans, easyCheck: false,
          easy: `前の数が振幅、周期は $360^{\\circ}\\div${k === 0.5 ? '\\frac{1}{2}' : k}=${dg(per)}$`,
          verify: () => { const [mx, p] = ampPer(wave(fn, A, k, 0)); return (close(mx, A) && p === per) || `振幅 ${mx}、周期 ${p}`; },
        };
      },
      // ずれ（右へ・左へ）
      s2(r) {
        const fn = r.pick(['sin', 'cos']), A = r.pick([1, 1, 2, 3, 4]), al = r.pick([15, 30, 45, 60, 90, 120]), right = r.chance(0.6);
        const ans = `${right ? '右' : '左'}へ $${dg(al)}$`;
        return {
          q: `$y=${coefT(A)}\\${fn}(\\theta${right ? '-' : '+'}${dg(al)})$ は $y=${coefT(A)}\\${fn}\\theta$ をどちらへ何度ずらしたか`, a: ans, easyCheck: false,
          easy: `かっこの中が0になるのは $\\theta=${dg(right ? al : -al)}$ → ${ans}`,
          verify: () => {   // 右へ s ずらした形なら、f(θ+s) がもとの波
            const s = right ? al : -al, f = wave(fn, A, 1, right ? al : -al);
            return [0, 25, 77, 140, 300].every(t => close(f(t + s), A * FN[fn](t))) || 'ずれがちがう';
          },
        };
      },
      // 値を入れる（教科書 4-8⑦の例題）・電圧の波の周期
      s3(r) {
        if (r.chance(0.35)) {
          const V = r.pick([100, 141, 200, 282]), f = r.pick([50, 60]);
          return {
            q: `電圧 $y=${V}\\sin(360^{\\circ}\\times${f}t)$（$t$ は秒）の周期は □ 秒`, a: `$\\frac{1}{${f}}$`, easyCheck: false,
            easy: `$t$ が $\\frac{1}{${f}}$ ふえると、かっこの中が $360^{\\circ}$ ふえる`,
            verify: () => { const g = t => V * Math.sin(rd(360 * f * t)); return ([0.001, 0.0037].every(t => close(g(t + 1 / f), g(t))) && !close(g(0.001 + 0.5 / f), g(0.001))) || '周期がちがう'; },
          };
        }
        const A = r.pick([2, 3, 4, 6]), al = r.pick([30, 45, 60, 90]), inner = r.pick([30, 90, 150, 180, 210, 270]), th = inner + al;
        if (th >= 360) return null;
        const v = Rscale(ev('sin', inner), fr(A));
        return {
          q: `$y=${A}\\sin(\\theta-${dg(al)})$ で、$\\theta=${dg(th)}$ のときの $y$`, a: `$${Rtex(v)}$`,
          easy: `$${A}\\sin(${dg(th)}-${dg(al)})=${A}\\sin${dg(inner)}=${Rtex(v)}$`,
        };
      },
      // わな：かっこの中が 2θ−60° のとき（くくると右へ30°）・sin と cos の和の振幅（合成）
      trap(r) {
        if (r.chance(0.5)) {
          const k = r.pick([2, 3]), s = r.pick([15, 20, 30, 45]), b = k * s, fn = r.pick(['sin', 'cos']);
          return dest({
            q: `$y=\\${fn}(${k}\\theta-${dg(b)})$ は $y=\\${fn}${k}\\theta$ を右へ何度ずらしたか`, a: `$${dg(s)}$`,
            verify: () => [0, 33, 100].every(t => close(FN[fn](k * (t + s) - b), FN[fn](k * t))) || 'ずれがちがう',
          }, '4-52', `$${k}(\\theta-${dg(s)})$ とくくると、右へ $${dg(s)}$。かっこの中の $${dg(b)}$ そのままではない`);
        }
        const [a, b, R] = r.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10]]);
        return dest({
          q: `$y=${a}\\sin\\theta+${b}\\cos\\theta$ の振幅`, a: `$${R}$`,
          verify: () => { let mx = -Infinity; for (let t = 0; t < 360; t += 0.05) mx = Math.max(mx, a * FN.sin(t) + b * FN.cos(t)); return Math.abs(mx - R) < 1e-4 || `最大は ${mx}`; },
        }, '4-52', `$\\sin$ と $\\cos$ の和で、前の数を読むだけでは決まらない。1つの $\\sin$ にまとめる。$${a}+${b}=${a + b}$ ではない`);
      },
    },
  });

  // ================================================================ 4-53
  // 0°〜359°で、式（θ をふくむ「左辺=右辺」）を満たす角を、1°ずつ調べる
  const solCache = new Map();
  function solveDeg(eq) {
    if (solCache.has(eq)) return solCache.get(eq);
    const k = eq.indexOf('='), L = eq.slice(0, k), R = eq.slice(k + 1), out = [];
    for (let t = 0; t < 360; t++) { const x = evT(L, t), y = evT(R, t); if (x != null && y != null && Math.abs(x - y) < 1e-9) out.push(t); }
    solCache.set(eq, out);
    return out;
  }
  const solOK = (eq, ans) => { const s = solveDeg(eq), g = angs(ans).sort((x, y) => x - y); return (s.length === g.length && s.every((v, i) => v === g[i])) || `解は ${s.join('°、')}°（答え ${ans}）`; };
  const VSIN = [[30, 1], [30, -1], [45, 1], [45, -1], [60, 1], [60, -1]];   // [とがった角, 符号]
  function two(fn, ref, sg) {   // sin/cos = 符号×(とがった角の値) の2つの角
    if (fn === 'sin') return sg > 0 ? [ref, 180 - ref] : [180 + ref, 360 - ref];
    return sg > 0 ? [ref, 360 - ref] : [180 - ref, 180 + ref];
  }
  M.add({
    id: '4-53', part: 4, chap: '4-8⑧', stars: 1,
    title: '$\\sin\\theta=a$ の角は1周に2つ：$\\theta$ と $180^{\\circ}-\\theta$（$\\cos$ なら $360^{\\circ}-\\theta$）',
    mark: `${RANGE} で「$\\sin\\theta=\\square$ を満たす $\\theta$」「$\\cos\\theta=\\square$ を満たす $\\theta$」。`,
    futsu: ['$0^{\\circ}$、$30^{\\circ}$、$45^{\\circ}$、… と順に値を出して、', '合うものを1つ見つけたら終わりにする。'],
    raku: ['$\\sin\\theta=-\\frac{1}{2}$：とがった角 $30^{\\circ}$、高さは下', '下の2つ → $210^{\\circ}$、$330^{\\circ}$', '$\\cos\\theta=-\\frac{1}{2}$ → 左の2つ → $120^{\\circ}$、$240^{\\circ}$'],
    why: '$\\sin\\theta$ は高さなので、横線と単位円が交わる2点。2つは $y$ 軸で裏返した位置（$\\theta$ と $180^{\\circ}-\\theta$）。$\\cos\\theta$ は横の位置なので、たての線と交わる2点で、$x$ 軸で裏返した位置（$\\theta$ と $360^{\\circ}-\\theta$）（4-8⑧）。',
    caution: '答えを1つだけ書かない。$\\sin\\theta=1$、$\\sin\\theta=-1$（$\\cos$ なら $\\pm1$）は、単位円と1点でしか交わらないので、答えは1つ。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '30mm',
    fits(q) {
      if (!/満たす/.test(q)) return false;
      const eq = maths(q).find(m => /\\theta/.test(m) && /=/.test(m));
      return !!eq && solveDeg(eq).length === 2;
    },
    steps: {
      // sin
      s1(r) {
        const [ref, sg] = r.chance(0.15) ? [0, 1] : r.pick(VSIN), v = sg * Math.sin(rd(ref)), vt = Rtex(Rscale(SINREF[ref], fr(sg)));
        const [a1, a2] = ref === 0 ? [0, 180] : two('sin', ref, sg), eq = `\\sin\\theta=${vt}`, ans = `$${dg(a1)}$、$${dg(a2)}$`;
        return {
          q: `$${eq}$ を満たす $\\theta$（${RANGE}）`, a: ans, easyCheck: false,
          easy: ref === 0 ? '高さ0は $x$ 軸の上の2点' : `とがった角 $${dg(ref)}$、${sg > 0 ? '上' : '下'}の2つ → ${ans}`, verify: () => (close(v, Math.sin(rd(a1))) && solOK(eq, ans)),
        };
      },
      // cos
      s2(r) {
        const [ref, sg] = r.chance(0.15) ? [90, 1] : r.pick(VSIN), vt = Rtex(Rscale(SINREF[90 - ref], fr(sg)));
        const [a1, a2] = ref === 90 ? [90, 270] : two('cos', ref, sg), eq = `\\cos\\theta=${vt}`, ans = `$${dg(a1)}$、$${dg(a2)}$`;
        return {
          q: `$${eq}$ を満たす $\\theta$（${RANGE}）`, a: ans, easyCheck: false,
          easy: ref === 90 ? '横の位置0は $y$ 軸の上の2点' : `とがった角 $${dg(ref)}$、${sg > 0 ? '右' : '左'}の2つ → ${ans}`, verify: () => solOK(eq, ans),
        };
      },
      // 式の形がちがう：2sinθ−1=0、√2 cosθ=−1 など
      s3(r) {
        const fn = r.pick(['sin', 'cos']), [ref, sg] = r.pick(VSIN), base = fn === 'sin' ? ref : 90 - ref;
        const [a1, a2] = two(fn, ref, sg), ans = `$${dg(a1)}$、$${dg(a2)}$`;
        // 値 = 符号 × (1/2、√2/2、√3/2)
        const kind = { 30: 1, 45: 2, 60: 3 }[base], num = kind === 1 ? '1' : `\\sqrt{${kind}}`;
        const eq = r.chance(0.5) ? `2\\${fn}\\theta${sg > 0 ? '-' : '+'}${num}=0` : (kind === 2 && r.chance(0.6) ? `\\sqrt{2}\\${fn}\\theta=${sg > 0 ? '' : '-'}1` : `2\\${fn}\\theta=${sg > 0 ? '' : '-'}${num}`);
        const vt = Rtex(Rscale(SINREF[base], fr(sg)));
        return { q: `$${eq}$ を満たす $\\theta$（${RANGE}）`, a: ans, easyCheck: false, easy: `$\\${fn}\\theta=${vt}$ → ${ans}`, verify: () => solOK(eq, ans) };
      },
      // わな：sin θ = ±1、cos θ = ±1（単位円と1点でしか交わらない。答えは1つ）
      trap(r) {
        const fn = r.pick(['sin', 'cos']), sg = r.pick([1, -1]), a1 = fn === 'sin' ? (sg > 0 ? 90 : 270) : (sg > 0 ? 0 : 180), eq = `\\${fn}\\theta=${sg > 0 ? '' : '-'}1`;
        return dest({ q: `$${eq}$ を満たす $\\theta$（${RANGE}）`, a: `$${dg(a1)}$`, verify: () => solOK(eq, `$${dg(a1)}$`) },
          '4-53', `${fn === 'sin' ? '高さ' : '横の位置'} $${sg > 0 ? '' : '-'}1$ の線は、単位円と1点でしか交わらない。答えは1つ`);
      },
    },
  });

  // ================================================================ 4-54
  // 数 × π の TeX（係数は分数）
  function piT(c) {
    if (c[0] === 0) return '0';
    const sg = c[0] < 0 ? '-' : '', n = Math.abs(c[0]);
    if (c[1] === 1) return `${sg}${n === 1 ? '' : n}\\pi`;
    if (decOK(c[1]) && c[1] !== 2 && c[1] !== 4) return `${sg}${fmt(n / c[1])}\\pi`;
    return `${sg}\\frac{${n === 1 ? '' : n}\\pi}{${c[1]}}`;
  }
  const decF = t => F.fromDec(String(t));
  M.add({
    id: '4-54', part: 4, chap: '4-8⑨', stars: 1,
    title: '回転は $f$ → $T$ → $\\omega$ → $v$ の順に',
    mark: '「1分に□回転」「周期□秒」と半径から、振動数・周期・角速度・速さを聞く。',
    futsu: ['1回転の角や道のりを、', '1分あたり・1秒あたりと、そのつど考えなおす。'],
    raku: ['1分に1200回転 → $f=1200\\div60=20\\,\\mathrm{Hz}$', '$T=\\frac{1}{20}\\,\\mathrm{s}$、$\\omega=2\\pi\\times20=40\\pi\\,\\mathrm{rad/s}$', '半径 $0.15\\,\\mathrm{m}$ → $v=0.15\\times40\\pi=6\\pi\\,\\mathrm{m/s}$'],
    why: 'はじめに1秒あたりの回転数 $f$ を出せば、あとは $T=\\frac{1}{f}$、$\\omega=2\\pi f$（1回転は $2\\pi$ rad）、$v=r\\omega$（弧＝半径×角）と、1本の道で順に出る（4-8⑨）。',
    caution: '「1分に」は60でわって1秒あたりに直す。$\\omega t$ は rad なので、$\\sin$ に入れるときは度に直す（$\\frac{\\pi}{2}$ rad は $90^{\\circ}$）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: '18mm',
    fits(q) {
      if (/うな[りるっ]|y=|\\sin|\\cos|電力/.test(q)) return false;
      return /回転|Hz|rad\/s|角速度|振動数|周期/.test(q) || (/1周/.test(q) && /道のり|速さ/.test(q));
    },
    steps: {
      // 1分の回転数から f・T・ω
      s1(r) {
        const N = r.pick([60, 120, 300, 600, 900, 1200, 1800, 2400, 3000]), f = N / 60, k = r.int(0, 2);
        if (k === 0) return { q: `1分に ${N} 回転する。振動数 $f=□\\,\\mathrm{Hz}$`, a: `$${f}$`, easy: `$${N}\\div60=${f}$`, key: `f${N}` };
        if (k === 1) { const T = decTeX(fr(1, f)); return { q: `1分に ${N} 回転する。周期 $T=□\\,\\mathrm{s}$`, a: `$${T}$`, easy: `$${N}\\div60=${f}$、$1\\div${f}=${T}$`, easyCheck: 'last', verify: () => valIs(`$${T}$`, 60 / N), key: `T${N}` }; }
        const w = piT(fr(2 * f));
        return { q: `1分に ${N} 回転する。角速度 $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${w}$`, easy: `$f=${f}$、$2\\pi\\times${f}=${w}$`, easyCheck: 'last', verify: () => valIs(`$${w}$`, 2 * Math.PI * N / 60), key: `w${N}` };
      },
      // 周期から ω、ω から T、半径と回転数から v
      s2(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const T = r.pick(['0.1', '0.2', '0.5', '2', '4', '6', '8', '10']), w = piT(F.div(fr(2), decF(T)));
          return { q: `周期 $${T}\\,\\mathrm{s}$ で回る。角速度 $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${w}$`, easy: `$\\frac{2\\pi}{${T}}=${w}$` };
        }
        if (k === 1) {
          const c = r.pick([fr(1, 2), fr(1), fr(2), fr(4), fr(10), fr(20), fr(1, 3), fr(1, 4)]), T = decTeX(F.div(fr(2), c));
          return { q: `$\\omega=${piT(c)}\\,\\mathrm{rad/s}$ で回る。周期 $T=□\\,\\mathrm{s}$`, a: `$${T}$`, easy: `$2\\pi\\div${piT(c)}=${T}$`, easyCheck: false, verify: () => valIs(`$${T}$`, 2 / F.val(c)) };
        }
        const N = r.pick([60, 120, 300, 600, 1200]), rr = r.pick(['0.1', '0.2', '0.25', '0.5', '0.15', '2']), f = N / 60;
        const v = piT(F.mul(decF(rr), fr(2 * f)));
        return {
          q: `半径 $${rr}\\,\\mathrm{m}$ の円を、1分に ${N} 回転する点の速さ $v=□\\,\\mathrm{m/s}$`, a: `$${v}$`,
          easy: `$\\omega=2\\pi\\times${f}=${piT(fr(2 * f))}$、$v=${rr}\\times${piT(fr(2 * f))}=${v}$`, easyCheck: 'last', verify: () => valIs(`$${v}$`, +rr * 2 * Math.PI * f),
        };
      },
      // 場面：時計の針・観覧車・扇風機・洗たく機（教科書 4-8⑨のコラムと例題）
      s3(r) {
        const k = r.int(0, 3);
        if (k === 0) {
          const [nm, T] = r.pick([['秒針', 60], ['長針', 3600]]), w = piT(fr(2, T));
          return { q: `時計の${nm}の角速度 $\\omega=□\\,\\mathrm{rad/s}$`, a: `$${w}$`, easy: `$T=${T}\\,\\mathrm{s}$、$\\frac{2\\pi}{${T}}=${w}$`, easyCheck: 'last', verify: () => valIs(`$${w}$`, 2 * Math.PI / T) };
        }
        if (k === 1) {
          const R = r.pick([30, 40, 50, 60]), m = r.pick([10, 12, 15, 20]), v = piT(fr(2 * R, m * 60));
          return { q: `半径 $${R}\\,\\mathrm{m}$、1周 ${m} 分の観覧車のゴンドラの速さ $v=□\\,\\mathrm{m/s}$`, a: `$${v}$`, easy: `$T=${m * 60}\\,\\mathrm{s}$、$v=\\frac{2\\pi\\times${R}}{${m * 60}}=${v}$`, easyCheck: 'last', verify: () => valIs(`$${v}$`, 2 * Math.PI * R / (m * 60)) };
        }
        const [nm, N, rr] = k === 2 ? ['扇風機の羽根', r.pick([600, 900, 1200]), r.pick(['0.1', '0.15', '0.2'])] : ['洗たく機のドラム', r.pick([600, 900, 1200]), r.pick(['0.25', '0.2', '0.3'])];
        const f = N / 60, v = piT(F.mul(decF(rr), fr(2 * f)));
        return {
          q: `${nm}が1分に ${N} 回転する。半径 $${rr}\\,\\mathrm{m}$ の所の速さ $v=□\\,\\mathrm{m/s}$`, a: `$${v}$`,
          easy: `$f=${f}$、$\\omega=${piT(fr(2 * f))}$、$v=${rr}\\times${piT(fr(2 * f))}=${v}$`, easyCheck: 'last', verify: () => valIs(`$${v}$`, +rr * 2 * Math.PI * f),
        };
      },
      // わな：ωt は rad。度に直してから sin（f・T・ω の順に出すわざではない）
      trap(r) {
        const [c, t, deg] = r.pick([[fr(1, 2), 1, 90], [fr(1, 2), 3, 270], [fr(1, 3), 1, 60], [fr(1, 6), 1, 30], [fr(1, 6), 5, 150], [fr(1, 2), 2, 180], [fr(1, 3), 2, 120]]);
        if ([60, 120].includes(deg)) return null;
        const A = r.pick(['0.1', '0.2', '0.4', '2', '4']), y = fmt(+A * Math.sin(rd(deg)));
        return dest({
          q: `半径 $${A}\\,\\mathrm{m}$ の円を $\\omega=${piT(c)}\\,\\mathrm{rad/s}$ で回る点の影の高さ $y=${A}\\sin\\omega t$。$t=${t}$ のときの $y$`, a: `$${y}$`,
          verify: () => valIs(`$${y}$`, +A * Math.sin(F.val(c) * Math.PI * t)),
        }, '4-54', `$\\omega t=${piT(F.mul(c, fr(t)))}$ は rad。$${dg(deg)}$ に直してから $\\sin$ を出す`);
      },
    },
  });

  // ================================================================ 4-55
  // 1周 T 分で、あまり r 分の角が三角定規の角になる組
  function wheel(r) {
    const T = r.pick([8, 12, 16, 20, 24]), per = 360 / T;
    const cands = [];
    for (let k = 1; k < T; k++) { const th = per * k; if (Number.isInteger(th) && (th % 30 === 0 || th % 45 === 0)) cands.push(k); }
    const rem = r.pick(cands), n = r.int(2, 5);
    return { T, per, rem, n, t: T * n + rem, th: per * rem };
  }
  M.add({
    id: '4-55', part: 4, chap: '4-8⑨', stars: 1,
    title: '何周もしたら、あまりの時間だけ考える',
    mark: '観覧車・回る点の「□分後」「□秒後」で、時間が1周の時間より長い。',
    futsu: ['1周ずつ、12分後、24分後、… と', '位置をたどっていく。'],
    raku: ['1周12分、50分後', '$50\\div12=4$ あまり2 → 2分後と同じ位置', '1分に $30^{\\circ}$ なので $60^{\\circ}$ → 高さ $30-30\\cos60^{\\circ}=15$'],
    why: '1周するともとの位置にもどる（周期）。だから「何周と何分」に分けて、あまりの時間で回った角だけを見ればよい（4-8①⑨。曜日と同じ考え方）。',
    caution: '進んだ道のりや、回った回数を聞かれたときは、あまりにしない（何周ぶんも足す）。',
    counts: { s1: 8, s2: 4, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '24mm', s3: '18mm', trap: '18mm' },
    fits(q) {
      if (/道のり|速さ/.test(q)) return false;
      const T = /1周\s*(\d+(?:\.\d+)?)\s*(分|秒|時間)/.exec(q), t = /(\d+(?:\.\d+)?)\s*(分|秒|時間)(?:後|たった|回った)/.exec(q);
      return !!(T && t && +t[1] > +T[1]);
    },
    steps: {
      // あまりの時間
      s1(r) {
        const w = wheel(r);
        return {
          q: `1周 ${w.T} 分。${w.t} 分後と同じ位置になる、${w.T} 分より前の時刻 □ 分後`, a: `$${w.rem}$`, easyCheck: false,
          easy: `$${w.t}\\div${w.T}=${w.n}$ あまり ${w.rem}`, verify: () => ((w.t - w.rem) % w.T === 0 && w.rem > 0 && w.rem < w.T) || 'あまりがちがう',
        };
      },
      // 観覧車の高さ（教科書 4-8⑨の例題）
      s2(r) {
        const w = wheel(r), R = r.pick([20, 30, 40, 50, 60]);
        const h = Radd(Rk(1, fr(R)), Rscale(ev('cos', w.th), fr(-R)));
        return {
          q: `半径 $${R}\\,\\mathrm{m}$、1周 ${w.T} 分の観覧車にいちばん下から乗る（$\\theta$ 回ると高さ $y=${R}-${R}\\cos\\theta$）。${w.t} 分後の高さ □ m`, a: `$${Rtex(h)}$`,
          easy: `$${w.t}\\div${w.T}=${w.n}$ あまり ${w.rem} → $\\theta=${fmt(w.per)}^{\\circ}\\times${w.rem}=${dg(w.th)}$ → $${Rtex(h)}$`, easyCheck: 'last',
          verify: () => valIs(`$${Rtex(h)}$`, R - R * Math.cos(rd(360 * w.t / w.T))),
        };
      },
      // 時計の長針・回転台の影・地球の自転
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const rem = r.int(1, 11) * 5, t = 60 * r.int(2, 4) + rem;
          return { q: `時計の長針（1周 60 分）が12を指してから ${t} 分たった。12から右回りに何度の所か`, a: `$${dg(6 * rem)}$`, easy: `$${t}\\div60=${(t - rem) / 60}$ あまり ${rem} → $${dg(6)}\\times${rem}=${dg(6 * rem)}$`, easyCheck: 'last', verify: () => (norm(6 * t) === 6 * rem) || '角がちがう' };
        }
        if (k === 1) {
          const T = r.pick([4, 8, 12]), per = 360 / T, ok = [];
          for (let j = 1; j < T; j++) { const th = per * j; if ([30, 90, 150, 180, 210, 270, 330].includes(th)) ok.push(j); }
          const rem = r.pick(ok), t = T * r.int(2, 6) + rem, A = r.pick(['0.1', '0.2', '0.4', '2']), y = fmt(+A * Math.sin(rd(per * rem)));
          return {
            q: `1周 ${T} 秒で左回りに回る点（0秒で右はし、$\\theta$ 回ると影の高さ $y=${A}\\sin\\theta$）。${t} 秒後の $y$`, a: `$${y}$`,
            easy: `$${t}\\div${T}$ のあまり ${rem} → $\\theta=${dg(per * rem)}$ → $${y}$`, easyCheck: 'last', verify: () => valIs(`$${y}$`, +A * Math.sin(rd(360 * t / T))),
          };
        }
        const rem = r.pick([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 3, 9, 15, 21]), t = 24 * r.int(2, 6) + rem;
        return { q: `地球（1周 24 時間）が ${t} 時間回った。何度回った所と同じ位置か（$0^{\\circ}$〜$360^{\\circ}$）`, a: `$${dg(15 * rem)}$`, easy: `$${t}\\div24$ のあまり ${rem} → $${dg(15)}\\times${rem}=${dg(15 * rem)}$`, easyCheck: 'last', verify: () => (norm(15 * t) === 15 * rem) || '角がちがう' };
      },
      // わな：進んだ道のりは、あまりにしない（何周ぶんも足す）
      trap(r) {
        const R = r.pick([10, 20, 30, 40, 50, 60]), T = r.pick([10, 12, 15, 20]), t = T * r.int(2, 4) + r.int(1, T - 1), c = fr(2 * R * t, T);
        if (c[1] !== 1) return null;
        const ans = piT(c);
        return dest({ q: `半径 $${R}\\,\\mathrm{m}$、1周 ${T} 分の観覧車が ${t} 分間に進む道のり`, a: `$${ans}$`, verify: () => valIs(`$${ans}$`, 2 * Math.PI * R * t / T) },
          '4-55', `道のりは何周しても足していく。あまりだけを見ない。$2\\pi\\times${R}\\times\\frac{${t}}{${T}}=${ans}$`);
      },
    },
  });

  // ================================================================ 4-56
  // 加法定理を広げた式（数の角）
  function expand(fn, a, b, plus) {
    const S = x => `\\sin${dg(x)}`, C = x => `\\cos${dg(x)}`;
    if (fn === 'sin') return `${S(a)}${C(b)}${plus ? '+' : '-'}${C(a)}${S(b)}`;
    return `${C(a)}${C(b)}${plus ? '-' : '+'}${S(a)}${S(b)}`;
  }
  const SPLIT = { 15: [45, 30, false], 75: [45, 30, true], 105: [60, 45, true], 165: [120, 45, true], 195: [150, 45, true], 255: [210, 45, true], 285: [240, 45, true], 345: [300, 45, true] };
  M.add({
    id: '4-56', part: 4, chap: '4-9②', stars: 1,
    title: '$75^{\\circ}$・$15^{\\circ}$ は、$45^{\\circ}$ と $30^{\\circ}$ に分けて加法定理',
    mark: '$15^{\\circ}$、$75^{\\circ}$、$105^{\\circ}$、$165^{\\circ}$ などの $\\sin$・$\\cos$。$\\sin(45^{\\circ}+30^{\\circ})$ のような和や差の角。',
    futsu: ['$75^{\\circ}$ の直角三角形を作図して、', '辺の長さをはかって比を出す。'],
    raku: ['$75^{\\circ}=45^{\\circ}+30^{\\circ}$', '$\\sin75^{\\circ}=\\sin45^{\\circ}\\cos30^{\\circ}+\\cos45^{\\circ}\\sin30^{\\circ}$', '$=\\frac{\\sqrt{6}}{4}+\\frac{\\sqrt{2}}{4}=\\frac{\\sqrt{6}+\\sqrt{2}}{4}$'],
    why: '加法定理（4-9②）は、$\\sin(a\\pm b)=\\sin a\\cos b\\pm\\cos a\\sin b$ と、$\\cos(a\\pm b)=\\cos a\\cos b\\mp\\sin a\\sin b$。ここに、値を知っている三角定規の角を入れる。$\\sqrt{2}\\times\\sqrt{3}=\\sqrt{6}$。',
    caution: '$\\sin(45^{\\circ}+30^{\\circ})$ を $\\sin45^{\\circ}+\\sin30^{\\circ}$ としない（1をこえてしまう）。$\\cos$ の加法定理は、かっこの中と符号が反対。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: '26mm', boxh: '11mm',
    fits(q) {
      const hit = a => [15, 75].includes(refAng(a));
      for (const m of q.matchAll(/\\(sin|cos|tan)\s*(\(?)(-?\d+)\^\{\\circ\}(?:([+-])(\d+)\^\{\\circ\})?/g)) {
        const a = +m[3] + (m[4] ? (m[4] === '+' ? 1 : -1) * +m[5] : 0);
        if (hit(a)) return true;
      }
      return /極座標/.test(q) && angs(q).some(hit);
    },
    steps: {
      // かっこの中の和・差の角（そのまま加法定理）
      s1(r) {
        const fn = r.pick(['sin', 'cos']), a = r.pick([30, 60, 120, 150]), b = r.pick([45, 135]), plus = r.chance(0.6);
        const [x, y] = r.chance(0.5) ? [a, b] : [b, a], c = plus ? x + y : x - y;
        if (![15, 75].includes(refAng(c))) return null;
        const ans = evt(fn, c);
        return { q: `$\\${fn}(${dg(x)}${plus ? '+' : '-'}${dg(y)})$`, a: `$${ans}$`, easy: `$${expand(fn, x, y, plus)}=${ans}$` };
      },
      // 角を分ける：15°・75°・105°・165° など
      s2(r) {
        const c = +r.pick(Object.keys(SPLIT)), [x, y, plus] = SPLIT[c], fn = r.pick(['sin', 'cos']), ans = evt(fn, c), e = expand(fn, x, y, plus);
        return {
          q: `$\\${fn}${dg(c)}$`, a: `$${ans}$`, key: fn + c,
          easy: `$${dg(c)}=${dg(x)}${plus ? '+' : '-'}${dg(y)}$ → $${e}=${ans}$`, easyCheck: 'last', verify: () => valIs(`$${e}$`, numOf(`$${ans}$`)),
        };
      },
      // tan・極座標・2つの値の和や差
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const c = r.pick([15, 75, 105, 165]), ans = evt('tan', c);
          return { q: `$\\tan${dg(c)}$`, a: `$${ans}$`, easy: `$\\frac{\\sin${dg(c)}}{\\cos${dg(c)}}=\\frac{${evt('sin', c)}}{${evt('cos', c)}}=${ans}$` };
        }
        if (k === 1) {
          const R0 = r.pick([4, 8, 12]), c = r.pick([15, 75, 105, 165]), xy = r.pick(['x', 'y']), fn = xy === 'x' ? 'cos' : 'sin', v = Rtex(Rscale(ev(fn, c), fr(R0)));
          return { q: `極座標 $${P(R0, dg(c))}$ の点の $${xy}$ 座標`, a: `$${v}$`, easy: `$${R0}\\${fn}${dg(c)}=${R0}\\times${par(evt(fn, c))}=${v}$` };
        }
        const [e, ans] = r.pick([['\\sin75^{\\circ}+\\sin15^{\\circ}', '\\frac{\\sqrt{6}}{2}'], ['\\sin75^{\\circ}-\\sin15^{\\circ}', '\\frac{\\sqrt{2}}{2}'], ['\\cos15^{\\circ}-\\sin15^{\\circ}', '\\frac{\\sqrt{2}}{2}'],
          ['\\cos15^{\\circ}+\\cos75^{\\circ}', '\\frac{\\sqrt{6}}{2}'], ['\\sin105^{\\circ}-\\cos105^{\\circ}', '\\frac{\\sqrt{6}}{2}'], ['\\cos75^{\\circ}-\\cos15^{\\circ}', '-\\frac{\\sqrt{2}}{2}']]);
        return { q: `$${e}$`, a: `$${ans}$`, easyCheck: false, easy: '2つの値を加法定理で出してから、たし算・ひき算' };
      },
      // わな：加法定理を逆に読む（$\sin40^{\circ}\cos20^{\circ}+\cos40^{\circ}\sin20^{\circ}=\sin60^{\circ}$）
      trap(r) {
        const kind = r.int(0, 3), s = r.pick([30, 60, 90, 45]), cands = [10, 20, 25, 35, 40, 50, 55, 65, 70, 80, 85];
        const plus = kind === 0 || kind === 2;
        const a = r.pick(cands), b = plus ? s - a : a - s;
        if (!cands.includes(b) || a === b) return null;
        const S = x => `\\sin${dg(x)}`, C = x => `\\cos${dg(x)}`;
        const e = [`${S(a)}${C(b)}+${C(a)}${S(b)}`, `${S(a)}${C(b)}-${C(a)}${S(b)}`, `${C(a)}${C(b)}-${S(a)}${S(b)}`, `${C(a)}${C(b)}+${S(a)}${S(b)}`][kind];
        const fn = kind < 2 ? 'sin' : 'cos';
        return dest({ q: `$${e}$`, a: `$${evt(fn, s)}$` }, '4-56', `$${dg(a)}$ や $${dg(b)}$ の値は使わない。加法定理を逆に読んで $\\${fn}(${dg(a)}${plus ? '+' : '-'}${dg(b)})=\\${fn}${dg(s)}$`);
      },
    },
  });

  // ================================================================ 4-57
  // 三角形から sin・cos（分数）
  function sc(r, acute) {
    const t = r.pick(TRI.slice(0, 3)), sw = r.chance(0.5);
    let s = fr(sw ? t[1] : t[0], t[2]), c = fr(sw ? t[0] : t[1], t[2]);
    if (!acute) c = F.mul(c, fr(-1));
    return { s, c };
  }
  const sumFr = (fn, A, B, plus) => (fn === 'sin'
    ? (plus ? F.add : F.sub)(F.mul(A.s, B.c), F.mul(A.c, B.s))
    : (plus ? F.sub : F.add)(F.mul(A.c, B.c), F.mul(A.s, B.s)));
  const fx = f => F.tex(f);
  function addProb(fn, plus, A, B, givenA, givenB, cond) {
    const ans = sumFr(fn, A, B, plus), know = [];
    if (givenA !== 'c') know.push(`$\\cos a=${fx(A.c)}$`); if (givenA !== 's') know.push(`$\\sin a=${fx(A.s)}$`);
    if (givenB !== 'c') know.push(`$\\cos b=${fx(B.c)}$`); if (givenB !== 's') know.push(`$\\sin b=${fx(B.s)}$`);
    const g = (x, k, v) => (k === 't' ? `$\\tan ${x}=${fx(F.div(v.s, v.c))}$` : `$\\${k === 's' ? 'sin' : 'cos'} ${x}=${fx(k === 's' ? v.s : v.c)}$`);
    const prod = fn === 'sin'
      ? `${par(fx(A.s))}\\times${par(fx(B.c))}${plus ? '+' : '-'}${par(fx(A.c))}\\times${par(fx(B.s))}`
      : `${par(fx(A.c))}\\times${par(fx(B.c))}${plus ? '-' : '+'}${par(fx(A.s))}\\times${par(fx(B.s))}`;
    return {
      q: `${cond}、${g('a', givenA, A)}、${g('b', givenB, B)}。$\\${fn}(a${plus ? '+' : '-'}b)$`, a: `$${fx(ans)}$`,
      easy: `${know.join('、')} → $${prod}=${fx(ans)}$`, easyCheck: 'last',
      verify: () => {
        const a = Math.atan2(F.val(A.s), F.val(A.c)), b = Math.atan2(F.val(B.s), F.val(B.c)), c = plus ? a + b : a - b;
        return (close(Math[fn](c), F.val(ans)) && valIs(`$${prod}$`, F.val(ans)) === true) || '加法定理の値がちがう';
      },
    };
  }
  M.add({
    id: '4-57', part: 4, chap: '4-9②', stars: 1,
    title: '加法定理の前に、直角三角形で $\\cos$・$\\sin$ をそろえる',
    mark: '$\\sin a=\\frac{3}{5}$、$\\cos b=\\frac{5}{13}$ のように、それぞれの角の値が1つずつだけで、$\\sin(a+b)$ を聞く。',
    futsu: ['$a$ と $b$ の角度を、分度器や電卓で求めてから、', '$a+b$ の $\\sin$ を出す。'],
    raku: ['$\\sin a=\\frac{3}{5}$ → 3、4、5 の三角形で $\\cos a=\\frac{4}{5}$', '$\\cos b=\\frac{5}{13}$ → 5、12、13 で $\\sin b=\\frac{12}{13}$', '$\\sin(a+b)=\\frac{15}{65}+\\frac{48}{65}=\\frac{63}{65}$'],
    why: '加法定理には、$a$ と $b$ の $\\sin$・$\\cos$ が4つともいる。わかっている値から、辺が整数の直角三角形（3、4、5 など）をかけば、のこりの値がすぐ出る（$\\sin^{2}+\\cos^{2}=1$ と同じ。4-8④・4-9②）。',
    caution: '角が $90^{\\circ}$ より大きいときは、$\\cos$ が負になる（4-50）。同じ角の2倍（$\\sin2a$）なら、2倍角の式（4-58）。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 2 },
    boxw: '18mm', boxh: '10mm',
    fits(q) { return /\\(sin|cos|tan) a=/.test(q) && /\(a[+-]b\)/.test(q); },
    steps: {
      // sin a と cos b から sin(a+b)・cos(a+b)（教科書 4-9②の例題）
      s1(r) {
        const A = sc(r, true), B = sc(r, true);
        return addProb(r.pick(['sin', 'cos']), true, A, B, 's', 'c', '$a$、$b$ は鋭角');
      },
      // わかっている値の組み合わせを変える・ひき算
      s2(r) {
        const A = sc(r, true), B = sc(r, true);
        return addProb(r.pick(['sin', 'cos']), r.chance(0.4), A, B, r.pick(['s', 'c']), r.pick(['s', 'c']), '$a$、$b$ は鋭角');
      },
      // tan でわかる・a が鈍角
      s3(r) {
        if (r.chance(0.5)) {
          const A = sc(r, true), B = sc(r, true);
          return addProb(r.pick(['sin', 'cos']), true, A, B, 't', r.pick(['s', 'c']), '$a$、$b$ は鋭角');
        }
        const A = sc(r, false), B = sc(r, true);
        return addProb(r.pick(['sin', 'cos']), true, A, B, 's', 'c', '$90^{\\circ}<a<180^{\\circ}$、$b$ は鋭角');
      },
      // わな：同じ角の2倍（2倍角の式。4-58）
      trap(r) {
        const A = sc(r, true), fn = r.pick(['sin', 'cos']), g = r.pick(['s', 'c']);
        const ans = fn === 'sin' ? F.mul(fr(2), F.mul(A.s, A.c)) : F.sub(F.mul(A.c, A.c), F.mul(A.s, A.s));
        return dest({
          q: `$a$ は鋭角、$\\${g === 's' ? 'sin' : 'cos'} a=${fx(g === 's' ? A.s : A.c)}$。$\\${fn}2a$`, a: `$${fx(ans)}$`,
          verify: () => { const a = Math.atan2(F.val(A.s), F.val(A.c)); return close(Math[fn](2 * a), F.val(ans)) || '2倍角の値がちがう'; },
        }, '4-57', '同じ角の2倍なので、加法定理より2倍角の式が早い');
      },
    },
  });

  // ================================================================ 4-58
  const PAIRS = [['0.6', '0.8'], ['0.8', '0.6'], ['0.28', '0.96'], ['0.96', '0.28']];
  M.add({
    id: '4-58', part: 4, chap: '4-9④', stars: 1,
    title: '2倍角・半角の式',
    mark: '$\\sin2\\theta$、$\\cos2\\theta$（$\\sin\\theta$ などがわかっている）。$\\sin^{2}15^{\\circ}$ のような2乗の値。',
    futsu: ['$\\theta$ の角度を求めてから $2\\theta$ を計算し、', 'その $\\sin$ を出す。', '$\\sin15^{\\circ}$ を出してから2乗する。'],
    raku: ['$\\sin\\theta=0.6$、$\\cos\\theta=0.8$', '$\\sin2\\theta=2\\times0.6\\times0.8=0.96$', '$\\cos2\\theta=1-2\\times0.6^{2}=0.28$', '$\\sin^{2}15^{\\circ}=\\frac{1-\\cos30^{\\circ}}{2}=\\frac{2-\\sqrt{3}}{4}$'],
    why: '加法定理で $a=b=\\theta$ とすると、$\\sin2\\theta=2\\sin\\theta\\cos\\theta$、$\\cos2\\theta=1-2\\sin^{2}\\theta=2\\cos^{2}\\theta-1$。これを $\\sin^{2}\\theta$ について解くと $\\sin^{2}\\theta=\\frac{1-\\cos2\\theta}{2}$（4-9④）。2乗が、2倍の角の $\\cos$ になる。',
    caution: '$\\sin2\\theta$ は $2\\sin\\theta$ ではない（$\\sin60^{\\circ}\\neq2\\sin30^{\\circ}$）。$\\cos2\\theta$ は $\\sin\\theta$ だけでも出せる（$1-2\\sin^{2}\\theta$）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 2 },
    boxw: '18mm', boxh: '11mm',
    fits(q) {
      if (/届く|y=/.test(q)) return false;
      return /\\(sin|cos)\s*2(\\theta|a)/.test(q) || /\\(sin|cos)\^\{2\}\s*\d/.test(q) || /2\\sin\s*\d+\^\{\\circ\}\\cos/.test(q);
    },
    steps: {
      // 2倍角：sin θ と cos θ がわかっている。sin θ だけで cos 2θ
      s1(r) {
        if (r.chance(0.3)) {
          const [n, d] = r.pick([[1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5]]), ans = F.sub(fr(1), F.mul(fr(2), fr(n * n, d * d)));
          return { q: `$\\sin\\theta=\\frac{${n}}{${d}}$ のとき $\\cos2\\theta$`, a: `$${fx(ans)}$`, easy: `$1-2\\times\\left(\\frac{${n}}{${d}}\\right)^{2}=${fx(ans)}$` };
        }
        const [s, c] = r.pick(PAIRS), fn = r.pick(['sin', 'cos']), S = decF(s), C = decF(c);
        const ans = fn === 'sin' ? F.mul(fr(2), F.mul(S, C)) : F.sub(fr(1), F.mul(fr(2), F.mul(S, S)));
        return {
          q: `$\\sin\\theta=${s}$、$\\cos\\theta=${c}$。$\\${fn}2\\theta$`, a: `$${decTeX(ans)}$`,
          easy: fn === 'sin' ? `$2\\times${s}\\times${c}=${decTeX(ans)}$` : `$1-2\\times${s}^{2}=${decTeX(ans)}$`,
        };
      },
      // 半角：sin²15° など
      s2(r) {
        const fn = r.pick(['sin', 'cos']), a = r.pick([15, 75, 105, 165]), sg = fn === 'sin' ? '-' : '+';
        const ans = Rtex(Rscale(Radd(Rk(1, fr(1)), Rscale(ev('cos', 2 * a), fr(fn === 'sin' ? -1 : 1))), fr(1, 2)));
        return {
          q: `$\\${fn}^{2}${dg(a)}$`, a: `$${ans}$`,
          easy: `$\\frac{1${sg}\\cos${dg(2 * a)}}{2}=${ans}$`, verify: () => valIs(`$${ans}$`, FN[fn](a) ** 2), key: fn + a,
        };
      },
      // まぜる：象限つき・式を逆に読む・θ の式で
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [s, c] = r.pick(PAIRS), qd = r.pick([2, 4]), S = decF(qd === 2 ? s : '-' + s), C = decF(qd === 2 ? '-' + c : c), fn = r.pick(['sin', 'cos']);
          const ans = fn === 'sin' ? F.mul(fr(2), F.mul(S, C)) : F.sub(fr(1), F.mul(fr(2), F.mul(S, S)));
          const sT = decTeX(S);
          return {
            q: `$\\sin\\theta=${sT}$（第${qd}象限）、$\\${fn}2\\theta$`, a: `$${decTeX(ans)}$`,
            easy: fn === 'sin' ? `$\\cos\\theta=${decTeX(C)}$ → $2\\times${par(sT)}\\times${par(decTeX(C))}=${decTeX(ans)}$` : `$1-2\\times${par(sT)}^{2}=${decTeX(ans)}$`, easyCheck: 'last',
            verify: () => { const th = Math.atan2(F.val(S), F.val(C)); return close(Math[fn](2 * th), F.val(ans)) || '値がちがう'; },
          };
        }
        if (k === 1) {
          const [e, v] = r.pick([['2\\sin15^{\\circ}\\cos15^{\\circ}', 30, 'sin'], ['2\\sin75^{\\circ}\\cos75^{\\circ}', 150, 'sin'], ['\\cos^{2}15^{\\circ}-\\sin^{2}15^{\\circ}', 30, 'cos'],
            ['1-2\\sin^{2}75^{\\circ}', 150, 'cos'], ['2\\cos^{2}15^{\\circ}-1', 30, 'cos'], ['\\cos^{2}75^{\\circ}-\\sin^{2}75^{\\circ}', 150, 'cos']].map(([e, a, fn]) => [e, [fn, a]]));
          const ans = evt(v[0], v[1]), num = M.evalMath(e.replace(/\\(sin|cos)\^\{2\}(\d+\^\{\\circ\})/g, '(\\$1$2)^{2}'), {});
          return { q: `$${e}$`, a: `$${ans}$`, easy: `$\\${v[0]}${dg(v[1])}=${ans}$`, easyCheck: 'last', verify: () => valIs(`$${ans}$`, num) };
        }
        const [e, ans] = r.pick([['\\sin\\theta\\cos\\theta', '\\frac{1}{2}\\sin2\\theta'], ['\\cos^{2}\\theta-\\sin^{2}\\theta', '\\cos2\\theta'], ['\\sin^{2}\\theta', '\\frac{1-\\cos2\\theta}{2}'], ['\\cos^{2}\\theta', '\\frac{1+\\cos2\\theta}{2}']]);
        return { q: `$${e}$ を、$2\\theta$ の $\\sin$ か $\\cos$ を使って書く`, a: `$${ans}$`, easyCheck: false, easy: '2倍角の式を逆に読む', verify: () => sameTheta(e, ans) };
      },
      // わな：2 sin θ・sin² θ（2倍角ではない。かけ算・2乗するだけ）
      trap(r) {
        const s = r.pick(['0.6', '0.8', '0.3', '0.5', '0.4']), two = r.chance(0.5), S = decF(s), ans = two ? F.mul(fr(2), S) : F.mul(S, S);
        return dest({ q: `$\\sin\\theta=${s}$ のとき $${two ? '2\\sin\\theta' : '\\sin^{2}\\theta'}$`, a: `$${decTeX(ans)}$`, verify: () => valIs(`$${decTeX(ans)}$`, two ? 2 * +s : (+s) ** 2) },
          '4-58', two ? '$2\\sin\\theta$ は $\\sin\\theta$ の2倍で、$\\sin2\\theta$ ではない。2倍角の式はいらない' : '$\\sin^{2}\\theta$ は $\\sin\\theta$ を2乗するだけ。半角の式はいらない');
      },
    },
  });

  // ================================================================ 4-59
  // a sin θ + b cos θ の係数（√3 をふくむ）。[TeX, 数]
  const CO = { 1: ['', 1], 2: ['2', 2], 3: ['3', 3], 4: ['4', 4], 5: ['5', 5], 6: ['6', 6], 8: ['8', 8], 12: ['12', 12], 15: ['15', 15], r3: ['\\sqrt{3}', Math.sqrt(3)], r33: ['3\\sqrt{3}', 3 * Math.sqrt(3)], r32: ['2\\sqrt{3}', 2 * Math.sqrt(3)] };
  function sumTeX(a, b) {   // a sin θ + b cos θ（a、b は [CO のキー, 符号]）
    const t = (k, s, f, first) => `${s < 0 ? '-' : first ? '' : '+'}${CO[k][0]}\\${f}\\theta`;
    return t(a[0], a[1], 'sin', true) + t(b[0], b[1], 'cos', false);
  }
  const maxOf = (a, b) => { let mx = -Infinity, at = 0; for (let t = 0; t < 360; t += 0.05) { const v = a * FN.sin(t) + b * FN.cos(t); if (v > mx) { mx = v; at = t; } } return [mx, at]; };
  const RR = { 5: '5', 13: '13', 10: '10', 17: '17', 2: '2', 4: '4', 6: '6', r2: '\\sqrt{2}', r22: '2\\sqrt{2}', r32: '3\\sqrt{2}', r5: '\\sqrt{5}', r13: '\\sqrt{13}' };
  const MAXSET = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [6, 8, 10], [8, 6, 10], [8, 15, 17], [15, 8, 17], [1, 1, 'r2'], [2, 2, 'r22'], [3, 3, 'r32'], [1, 2, 'r5'], [2, 3, 'r13'], [3, 2, 'r13'], [1, 'r3', 2], ['r3', 1, 2], [2, 'r32', 4], ['r33', 3, 6]];
  // R sin(θ+α) にまとめる組：[a, b, R, α]
  const SYN = [[1, 'r3', 2, 60], ['r3', 1, 2, 30], [1, 1, 'r2', 45], [2, 'r32', 4, 60], ['r32', 2, 4, 30], [2, 2, 'r22', 45], [3, 'r33', 6, 60], ['r33', 3, 6, 30], [3, 3, 'r32', 45]];
  const coefNum = k => CO[k][1];
  M.add({
    id: '4-59', part: 4, chap: '4-9⑥', stars: 1,
    title: '合成：$a\\sin\\theta+b\\cos\\theta$ の最大は $\\sqrt{a^{2}+b^{2}}$',
    mark: '$\\sin\\theta$ と $\\cos\\theta$ の和（差）の最大・最小。1つの $\\sin$ にまとめる。',
    futsu: ['$\\theta$ に $0^{\\circ}$、$30^{\\circ}$、$45^{\\circ}$、… を入れて値の表を作り、', 'いちばん大きい値をさがす。'],
    raku: ['$3\\sin\\theta+4\\cos\\theta$', '点 $(3,\\ 4)$ の原点からの距離 $\\sqrt{9+16}=5$', '最大5、最小 $-5$（$3+4=7$ ではない）'],
    why: '$a\\sin\\theta+b\\cos\\theta=R\\sin(\\theta+\\alpha)$ と書け、$R$ は点 $(a,\\ b)$ と原点の距離、$\\alpha$ はその点の動径の角（4-9⑥）。$\\sin$ は $-1$ から1までなので、最大は $R$、最小は $-R$。',
    caution: '2つの波の山は同じ角で来ないので、最大は係数の和にならない。$3\\sin\\theta+4\\sin\\theta$ のように同じ $\\sin$ どうしなら、$7\\sin\\theta$ にまとめるだけ（合成はいらない）。',
    counts: { s1: 8, s2: 6, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 1, s3: 1, trap: 2 },
    boxw: { s1: '16mm', s2: '36mm', s3: '18mm', trap: '16mm' },
    fits(q) {
      if (/\\sin\\theta[+-][^$]*\\cos\\theta|\\cos\\theta[+-][^$]*\\sin\\theta/.test(q)) return true;
      return maths(q).some(m => { const k = /^\d*\\(sin|cos)\\theta\+\d*\\(sin|cos)\(\\theta[+-](\d+)\^\{\\circ\}\)$/.exec(m); return !!k && +k[3] % 120 !== 0; });
    },
    steps: {
      // 最大・最小
      s1(r) {
        const [a0, b0, R] = r.pick(MAXSET), sa = r.chance(0.8) ? 1 : -1, sb = r.chance(0.7) ? 1 : -1, mx = r.chance(0.7);
        const e = sumTeX([a0, sa], [b0, sb]), a = sa * coefNum(a0), b = sb * coefNum(b0), RT = RR[R] || String(R);
        return {
          q: `$${e}$ の${mx ? '最大' : '最小'}の値`, a: `$${mx ? '' : '-'}${RT}$`, key: e + mx,
          easy: `$${mx ? '' : '-'}\\sqrt{${fmt(a * a)}+${fmt(b * b)}}=${mx ? '' : '-'}${RT}$`,
          verify: () => { const [m] = maxOf(a, b); return Math.abs(m - numOf(RT)) < 1e-4 || `最大は ${m}`; },
        };
      },
      // R sin(θ+α) の形に（α は 30°・45°・60° と、その仲間）
      s2(r) {
        const [a0, b0, R, al0] = r.pick(SYN), sb = r.chance(0.7) ? 1 : -1, sa = r.chance(0.85) ? 1 : -1;
        const al = sa > 0 ? sb * al0 : (sb > 0 ? 180 - al0 : al0 - 180), e = sumTeX([a0, sa], [b0, sb]), RT = RR[R] || String(R);
        const ans = `${RT}\\sin(\\theta${al < 0 ? '-' : '+'}${dg(Math.abs(al))})`;
        return { q: `$${e}$ を $R\\sin(\\theta+\\alpha)$ の形に`, a: `$${ans}$`, easyCheck: false, easy: `点 $${P(sa < 0 ? `-${CO[a0][0] || 1}` : (CO[a0][0] || 1), sb < 0 ? `-${CO[b0][0] || 1}` : (CO[b0][0] || 1))}$ は、原点から $${RT}$、角 $${dg(al)}$`, verify: () => sameTheta(e, ans) };
      },
      // 最大になる θ・ずれた2つの波の和・電圧
      s3(r) {
        const k = r.int(0, 2);
        if (k === 0) {
          const [a0, b0, R, al] = r.pick(SYN), e = sumTeX([a0, 1], [b0, 1]), th = 90 - al;
          return {
            q: `$${e}$ が最大になる $\\theta$（${RANGE}）`, a: `$${dg(th)}$`, easy: `$\\theta+${dg(al)}=90^{\\circ}$ のとき → $${dg(th)}$`, easyCheck: 'last',
            verify: () => { const [, at] = maxOf(coefNum(a0), coefNum(b0)); return Math.abs(at - th) < 0.1 || `最大は ${at}° のとき`; },
          };
        }
        if (k === 1) {
          const [sh, RT] = r.pick([[60, '\\sqrt{3}'], [90, '\\sqrt{2}']]), fn = r.pick(['sin', 'cos']), e = `\\${fn}\\theta+\\${fn}(\\theta+${dg(sh)})`;
          return {
            q: `$${e}$ の最大の値`, a: `$${RT}$`, easyCheck: false, easy: `加法定理で広げて $a\\sin\\theta+b\\cos\\theta$ の形にしてから、$\\sqrt{a^{2}+b^{2}}=${RT}$`,
            verify: () => { let mx = -Infinity; for (let t = 0; t < 360; t += 0.05) mx = Math.max(mx, FN[fn](t) + FN[fn](t + sh)); return Math.abs(mx - numOf(RT)) < 1e-4 || `最大は ${mx}`; },
          };
        }
        const [a, b, R] = r.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]]);
        return { q: `電圧 $${a}\\sin\\theta$ と $${b}\\cos\\theta$（V）をたした電圧の、山の高さ □ V`, a: `$${R}$`, easy: `$\\sqrt{${a}^{2}+${b}^{2}}=${R}$`, verify: () => Math.abs(maxOf(a, b)[0] - R) < 1e-4 || '最大がちがう' };
      },
      // わな：同じ sin どうし（まとめるだけ。合成はいらない）
      trap(r) {
        const fn = r.pick(['sin', 'cos']), a = r.int(2, 6), b = r.int(1, 5), sb = r.chance(0.7) ? 1 : -1, m = Math.abs(a + sb * b);
        if (m < 2 || a + sb * b < 0) return null;
        return dest({ q: `$${a}\\${fn}\\theta${sb > 0 ? '+' : '-'}${b === 1 ? '' : b}\\${fn}\\theta$ の最大の値`, a: `$${m}$`, verify: () => { let mx = -Infinity; for (let t = 0; t < 360; t += 0.5) mx = Math.max(mx, (a + sb * b) * FN[fn](t)); return close(mx, m) || '最大がちがう'; } },
          '4-59', `どちらも $\\${fn}\\theta$ なので、まとめて $${a + sb * b}\\${fn}\\theta$。山が同じ角で来るので、最大は $${m}$`);
      },
    },
  });

  // ================================================================ 4-60
  const dist = (v, th) => Rscale(ev('sin', 2 * th), fr(v * v, 10));
  M.add({
    id: '4-60', part: 4, chap: '4-9⑤', stars: 1,
    title: '届く距離は $\\sin2\\theta$ に比例：$\\theta$ と $90^{\\circ}-\\theta$ は同じ距離',
    mark: '同じ速さで、角だけを変えて投げる・ふき出す。届く距離 $x=\\frac{v^{2}\\sin2\\theta}{10}$。',
    futsu: ['角ごとに、空中にいる時間と横の速さを出して、', 'かけ算で距離を求める。'],
    raku: ['$10\\,\\mathrm{m/s}$、$30^{\\circ}$ → $x=\\frac{100\\times\\sin60^{\\circ}}{10}=5\\sqrt{3}$', '$60^{\\circ}$ も $\\sin120^{\\circ}=\\sin60^{\\circ}$ で同じ距離', 'いちばん遠いのは $45^{\\circ}$ で $10\\,\\mathrm{m}$'],
    why: '届く距離は $x=\\frac{v^{2}\\sin2\\theta}{10}$（4-9⑤。2倍角の式から）。$\\sin2\\theta$ は $2\\theta=90^{\\circ}$ で最大の1。$\\sin(180^{\\circ}-2\\theta)=\\sin2\\theta$ なので、$\\theta$ と $90^{\\circ}-\\theta$ は同じ距離。',
    caution: 'いちばん高く上がるのは真上（$90^{\\circ}$）で、$45^{\\circ}$ ではない。空気の抵抗や、投げる高さは考えていない。',
    counts: { s1: 6, s2: 5, s3: 3, trap: 2 },
    cols: 1,
    boxw: { s1: '18mm', s2: '22mm', s3: '18mm', trap: '16mm' },
    fits(q) { return /届く/.test(q); },
    steps: {
      // 速さと角から、届く距離
      s1(r) {
        const v = r.pick([10, 20, 30, 40]), th = r.pick([15, 30, 45, 60, 75]), x = Rtex(dist(v, th));
        return {
          q: `届く距離 $x=\\frac{v^{2}\\sin2\\theta}{10}$ で、$v=${v}$、$\\theta=${dg(th)}$ のとき $x$`, a: `$${x}$`,
          easy: `$\\frac{${v}^{2}\\times\\sin${dg(2 * th)}}{10}=${x}$`,
        };
      },
      // 同じ距離のもう1つの角・いちばん遠い角
      s2(r) {
        if (r.chance(0.65)) {
          const th = r.pick([10, 15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 75, 80]);
          return { q: `同じ速さで、$${dg(th)}$ と同じ距離に届く、もう1つの角`, a: `$${dg(90 - th)}$`, easy: `$90^{\\circ}-${dg(th)}=${dg(90 - th)}$`, verify: () => close(FN.sin(2 * (90 - th)), FN.sin(2 * th)) || '距離がちがう' };
        }
        const v = r.pick([10, 20, 30, 40, 50]), x = v * v / 10;
        return {
          q: `$x=\\frac{v^{2}\\sin2\\theta}{10}$、$v=${v}$ で、いちばん遠くへ届く角と、その距離`, a: `$45^{\\circ}$、$${x}\\,\\mathrm{m}$`, easyCheck: false,
          easy: `$\\sin2\\theta=1$ の $2\\theta=90^{\\circ}$ → $\\frac{${v}^{2}}{10}=${x}$`,
          verify: () => { let best = 0, bx = 0; for (let t = 1; t < 90; t++) { const d = v * v * FN.sin(2 * t) / 10; if (d > bx) { bx = d; best = t; } } return (best === 45 && close(bx, x)) || 'いちばん遠い角がちがう'; },
        };
      },
      // 距離から、ほかの角・速さを変える
      s3(r) {
        const k = r.int(0, 2);
        if (k === 2) {
          const m = r.pick([2, 3, 4]);
          return { q: `角を変えずに、速さを ${m} 倍にすると、届く距離は □ 倍`, a: `$${m * m}$`, easy: `$x$ は $v^{2}$ に比例 → $${m}^{2}=${m * m}$`, easyCheck: 'last', verify: () => close(Rnum(dist(10 * m, 30)) / Rnum(dist(10, 30)), m * m) || '倍がちがう' };
        }
        const v = r.pick([10, 20, 30]), [t1, t2] = k === 0 ? r.pick([[60, 45], [30, 45], [15, 45], [75, 45]]) : r.pick([[30, 75], [60, 15], [30, 15], [75, 30], [45, 15], [45, 30]]);
        const x1 = Rtex(dist(v, t1)), x2 = Rtex(dist(v, t2));
        return {
          q: `同じ速さで、$${dg(t1)}$ では $${x1}\\,\\mathrm{m}$ 届いた。$${dg(t2)}$ では □ m`, a: `$${x2}$`,
          easy: `距離は $\\sin2\\theta$ に比例：$${x1}\\times\\frac{\\sin${dg(2 * t2)}}{\\sin${dg(2 * t1)}}=${x2}$`, easyCheck: 'last',
          verify: () => valIs(`$${x2}$`, numOf(`$${x1}$`) * FN.sin(2 * t2) / FN.sin(2 * t1)),
        };
      },
      // わな：いちばん高く上がる角（高さはたての速さ v sin θ。45°ではない）
      trap(r) {
        const what = r.pick(['いちばん高く上がる', '空中にいる時間がいちばん長い']);
        return dest({ q: `同じ速さでボールを投げるとき、${what}角`, a: '$90^{\\circ}$', verify: () => (FN.sin(90) === 1) || 'まちがい' },
          '4-60', 'たての速さ $v\\sin\\theta$ で決まるので、$\\sin\\theta$ が最大の $90^{\\circ}$（真上）。横の距離の $45^{\\circ}$ とはちがう');
      },
    },
  });

  // ================================================================ 4-61
  const FREQ = [256, 262, 294, 330, 349, 392, 440, 494, 523];
  M.add({
    id: '4-61', part: 4, chap: '4-9⑦', stars: 1,
    title: 'うなりの回数は振動数の差、聞こえる高さは平均',
    mark: '振動数が少しちがう2つの音を、同時に鳴らす。',
    futsu: ['2つの波をたしたグラフをかいて、', '大きい所が1秒に何回来るかを数える。'],
    raku: ['$440\\,\\mathrm{Hz}$ と $443\\,\\mathrm{Hz}$', 'うなりは $443-440=3$ で1秒に3回', '高さは $\\frac{440+443}{2}=441.5\\,\\mathrm{Hz}$'],
    why: '和を積に直す式 $\\sin A+\\sin B=2\\sin\\frac{A+B}{2}\\cos\\frac{A-B}{2}$ で、速い波は2つの振動数の平均。音の大きさを変えるゆっくりした波から、うなりは1秒に $f_1-f_2$ 回（4-9⑦）。',
    caution: '振動数の和は、うなりの回数ではない。うなりの回数から相手の振動数を求めると、高いほうと低いほうの2つの答えがある。',
    counts: { s1: 8, s2: 5, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '28mm', s3: '16mm', trap: '14mm' },
    fits(q) { return /うな[りるっ]/.test(q); },
    steps: {
      // うなりの回数・聞こえる高さ
      s1(r) {
        const f1 = r.pick(FREQ), d = r.int(1, 6), f2 = f1 + d, [x, y] = r.chance(0.5) ? [f1, f2] : [f2, f1];
        if (r.chance(0.55)) return { q: `$${x}\\,\\mathrm{Hz}$ と $${y}\\,\\mathrm{Hz}$ を同時に鳴らすと、1秒に □ 回うなる`, a: `$${d}$`, easy: `$${f2}-${f1}=${d}$` };
        const m = fmt((f1 + f2) / 2);
        return { q: `$${x}\\,\\mathrm{Hz}$ と $${y}\\,\\mathrm{Hz}$ で、うなる音の高さはおよそ □ Hz`, a: `$${m}$`, easy: `$\\frac{${x}+${y}}{2}=${m}$` };
      },
      // うなりの回数から、相手の振動数（2つ）
      s2(r) {
        const f = r.pick(FREQ), d = r.int(1, 6), obj = r.pick(['ギターの弦', 'ピアノの弦', '別のおんさ']);
        return {
          q: `$${f}\\,\\mathrm{Hz}$ のおんさと${obj}で、1秒に ${d} 回うなった。${obj}の振動数（2つ）□ Hz`, a: `$${f - d}$ か $${f + d}$`, easyCheck: false,
          easy: `差が ${d} なので $${f}-${d}$ か $${f}+${d}$`, verify: () => (Math.abs(f + d - f) === d && Math.abs(f - (f - d)) === d) || 'まちがい',
        };
      },
      // 調律（弦をしめる）・うなりの間かく
      s3(r) {
        if (r.chance(0.5)) {
          const f = r.pick([440, 330, 262]), d = r.int(2, 5), slow = r.chance(0.5), ans = slow ? f - d : f + d;
          return {
            q: `$${f}\\,\\mathrm{Hz}$ のおんさと弦で、1秒に ${d} 回うなった。弦を少ししめて音を高くすると、うなりが${slow ? 'ゆっくり' : '速く'}なった。弦の振動数 □ Hz`, a: `$${ans}$`, easyCheck: false,
            easy: `$${f - d}$ か $${f + d}$。高くして${slow ? '差が小さく' : '差が大きく'}なったので $${ans}$`,
            verify: () => { const up = ans + 0.5; return ((Math.abs(up - f) < Math.abs(ans - f)) === slow && Math.abs(ans - f) === d) || 'まちがい'; },
          };
        }
        const [T, d] = r.pick([['0.5', 2], ['0.25', 4], ['1', 1], ['0.2', 5], ['2', '0.5']]), f = r.pick(FREQ);
        return { q: `2つの音のうなりが $${T}$ 秒ごとに聞こえた。振動数の差 □ Hz`, a: `$${d}$`, easy: `1秒に $1\\div${T}=${d}$ 回`, easyCheck: 'last', verify: () => valIs(`$${d}$`, 1 / +T) };
      },
      // わな：1つの音の周期（うなりではない。振動数の逆数）
      trap(r) {
        const f = r.pick([100, 200, 250, 440, 500, 1000]);
        return dest({ q: `$${f}\\,\\mathrm{Hz}$ の音の周期は □ 秒`, a: `$${decTeX(fr(1, f))}$`, verify: () => valIs(`$${decTeX(fr(1, f))}$`, 1 / f) }, '4-61', `音は1つだけで、うなりではない。周期は振動数の逆数 $\\frac{1}{${f}}$`);
      },
    },
  });

  // ================================================================ 4-62
  const COSA = [0, 30, 45, 60, 90];
  M.add({
    id: '4-62', part: 4, chap: '4-9⑧', stars: 1,
    title: '交流の平均の電力は「実効値の積×$\\cos$（ずれの角）」',
    mark: '交流の電圧と電流の実効値と、電流のおくれの角から、平均の電力を聞く。',
    futsu: ['$p=V_0I_0\\sin\\omega t\\sin(\\omega t-60^{\\circ})$ のグラフをかいて、', '1周期のあいだの平均を求める。'],
    raku: ['$100\\,\\mathrm{V}$、$10\\,\\mathrm{A}$、$60^{\\circ}$ おくれ', '$100\\times10\\times\\cos60^{\\circ}=500\\,\\mathrm{W}$', 'ずれがなければ $1000\\,\\mathrm{W}$'],
    why: '電力 $p$ は、積を和に直す式で、一定の部分と、2倍の速さでゆれる部分に分かれる。ゆれる部分は平均すると0なので、平均の電力は「電圧の実効値×電流の実効値×$\\cos$（おくれの角）」（4-9⑧）。この $\\cos$ を力率という。',
    caution: '山の高さ（最大の値）で計算するときは、$\\frac{V_0I_0}{2}\\cos$（おくれの角）。実効値は山の高さの $\\frac{1}{\\sqrt{2}}$ 倍。',
    counts: { s1: 8, s2: 6, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: '20mm',
    fits(q) { return /電力|力率/.test(q) && /実効値|山の高さ|おくれ|ずれ/.test(q); },
    steps: {
      // 実効値とおくれの角から
      s1(r) {
        const V = r.pick([100, 200]), I = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), a = r.pick(COSA), p = Rtex(Rscale(ev('cos', a), fr(V * I)));
        const how = a === 0 ? '電流は電圧とずれない' : `電流のおくれ $${dg(a)}$`;
        return { q: `実効値 $${V}\\,\\mathrm{V}$・$${I}\\,\\mathrm{A}$、${how}。平均の電力 □ W`, a: `$${p}$`, easy: `$${V}\\times${I}\\times\\cos${dg(a)}=${p}$` };
      },
      // 山の高さで・電力から電流を
      s2(r) {
        if (r.chance(0.5)) {
          const V0 = r.pick([100, 140, 200, 282]), I0 = r.pick([2, 4, 5, 10]), a = r.pick([0, 60, 90, 30]), p = Rtex(Rscale(ev('cos', a), fr(V0 * I0, 2)));
          return { q: `山の高さが電圧 $${V0}\\,\\mathrm{V}$・電流 $${I0}\\,\\mathrm{A}$、電流のおくれ $${dg(a)}$。平均の電力 □ W`, a: `$${p}$`, easy: `$\\frac{${V0}\\times${I0}}{2}\\times\\cos${dg(a)}=${p}$` };
        }
        const V = r.pick([100, 200]), I = r.pick([2, 4, 5, 10, 6]), a = r.pick([0, 60]), P0 = V * I * FN.cos(a);
        return { q: `実効値 $${V}\\,\\mathrm{V}$、${a ? `電流のおくれ $${dg(a)}$` : '電流は電圧とずれない'}、平均の電力 $${fmt(P0)}\\,\\mathrm{W}$。電流の実効値 □ A`, a: `$${I}$`, easy: `$${fmt(P0)}\\div(${V}\\times\\cos${dg(a)})=${I}$` };
      },
      // 力率・おくれの角・電気ストーブとモーター
      s3(r) {
        const V = r.pick([100, 200]), I = r.pick([2, 5, 10]), a = r.pick([0, 60, 90]), P0 = fmt(V * I * FN.cos(a)), k = r.int(0, 2);
        if (k === 0) return { q: `実効値 $${V}\\,\\mathrm{V}$、$${I}\\,\\mathrm{A}$ の交流で、平均の電力 $${P0}\\,\\mathrm{W}$。力率`, a: `$${fmt(FN.cos(a))}$`, easy: `$\\frac{${P0}}{${V}\\times${I}}=${fmt(FN.cos(a))}$` };
        if (k === 1) return { q: `実効値 $${V}\\,\\mathrm{V}$、$${I}\\,\\mathrm{A}$ の交流で、平均の電力 $${P0}\\,\\mathrm{W}$。電流のおくれの角（$0^{\\circ}$〜$90^{\\circ}$）`, a: `$${dg(a)}$`, easy: `$\\cos\\theta=\\frac{${P0}}{${V * I}}=${fmt(FN.cos(a))}$ → $${dg(a)}$`, easyCheck: false, verify: () => close(V * I * FN.cos(a), +P0) || 'まちがい' };
        const I2 = r.pick([6, 8, 10, 12, 15]);
        return { q: `電気ストーブ（電流は電圧とずれない）に、実効値 $${V}\\,\\mathrm{V}$ で $${I2}\\,\\mathrm{A}$。平均の電力 □ W`, a: `$${V * I2}$`, easy: `$${V}\\times${I2}\\times\\cos0^{\\circ}=${V * I2}$` };
      },
      // わな：山の高さ（電力の式ではない。実効値の √2 倍。3-10）
      trap(r) {
        const V = r.pick([100, 200, 50, 6]);
        return dest({ q: `実効値 $${V}\\,\\mathrm{V}$ の交流の電圧の、山の高さ（最大の値）□ V`, a: `$${V}\\sqrt{2}$`, verify: () => valIs(`$${V}\\sqrt{2}$`, V * Math.SQRT2) }, '4-62', '電力ではない。山の高さは実効値の $\\sqrt{2}$ 倍（3-10）');
      },
    },
  });

  // ================================================================ 4-95
  // 3つの波の項：[角のずれ, TeX]
  const sh = (fn, d) => (d === 0 ? `\\${fn}\\theta` : `\\${fn}(\\theta${d < 0 ? '-' : '+'}${dg(Math.abs(d))})`);
  M.add({
    id: '4-95', part: 4, chap: '4-9②・三相交流', stars: 1,
    title: '$120^{\\circ}$ ずつずれた3つの波の和は0',
    mark: '$\\sin\\theta$、$\\sin(\\theta-120^{\\circ})$、$\\sin(\\theta+120^{\\circ})$ のように、同じ振幅で $120^{\\circ}$ ずつずれた波をたす（三相交流）。',
    futsu: ['3つの式を、加法定理で1つずつ広げて、', '$\\sin\\theta$ の項と $\\cos\\theta$ の項を集める。'],
    raku: ['$\\sin\\theta+\\sin(\\theta-120^{\\circ})+\\sin(\\theta+120^{\\circ})$', '3つの和は、いつも0', '2つの和は、のこりの1つにマイナスをつけたもの：', '$\\sin(\\theta+120^{\\circ})+\\sin(\\theta-120^{\\circ})=-\\sin\\theta$'],
    why: '加法定理で広げると $\\sin(\\theta\\pm120^{\\circ})=-\\frac{1}{2}\\sin\\theta\\pm\\frac{\\sqrt{3}}{2}\\cos\\theta$。2つをたすと $-\\sin\\theta$ で、$\\sin\\theta$ と打ち消しあう（4-9の例題3、三相交流）。$120^{\\circ}$ ずつずれた単位円の3つの点は、たすと原点にもどる。',
    caution: '振幅がそろっていないとき、ずれが $120^{\\circ}$ でないときは0にならない。$\\theta-240^{\\circ}$ は $\\theta+120^{\\circ}$ と同じ位置（$360^{\\circ}$ たした）。',
    counts: { s1: 6, s2: 6, s3: 4, trap: 2 },
    cols: 1,
    boxw: { s1: '14mm', s2: '30mm', s3: '18mm', trap: '24mm' },
    fits(q) {
      if (/三相/.test(q)) return true;
      return maths(q).some(m => {
        const re = /(\d*)\\(sin|cos)(?:\\theta|\(\\theta([+-]\d+)\^\{\\circ\}\))/g, ts = [...m.matchAll(re)];
        if (ts.length < 2 || m.replace(re, '').replace(/\+/g, '') !== '') return false;   // 項がこの形だけ
        const sh = ts.map(t => norm(+(t[3] || 0)));
        return ts.every(t => t[1] === ts[0][1] && t[2] === ts[0][2]) && sh.every(x => x % 120 === 0) && new Set(sh).size === sh.length;
      });
    },
    steps: {
      // 3つの和
      s1(r) {
        const fn = r.pick(['sin', 'cos']), ds = r.shuffle(r.pick([[0, -120, 120], [0, -120, -240], [0, 120, 240]])), A = r.pick([1, 1, 2, 3, 100]);
        const e = ds.map((d, i) => (i ? '+' : '') + coefT(A) + sh(fn, d)).join('');
        return { q: `$${e}$`, a: '$0$', easyCheck: false, easy: '$120^{\\circ}$ ずつずれた、同じ振幅の3つの波 → 0', verify: () => sameTheta(e, '0') };
      },
      // 2つの和 → のこりの1つのマイナス
      s2(r) {
        const fn = r.pick(['sin', 'cos']), set = [0, -120, 120], miss = r.pick(set), two = r.shuffle(set.filter(d => d !== miss));
        const e = two.map((d, i) => (i ? '+' : '') + sh(fn, d)).join(''), ans = `-${sh(fn, miss)}`;
        return { q: `$${e}$ を短く`, a: `$${ans}$`, easyCheck: false, easy: `3つめの $${sh(fn, miss)}$ をたすと0なので、$${ans}$`, verify: () => sameTheta(e, ans) };
      },
      // 三相交流の電圧・θ を入れた値
      s3(r) {
        if (r.chance(0.6)) {
          const A = r.pick([100, 200, 140]), th = r.pick([30, 90, 150, 210, 270, 330]), vs = [0, -120, 120].map(d => fmt(A * FN.sin(th + d)));
          const [i, j] = r.pick([[0, 1], [0, 2], [1, 2]]), k = 3 - i - j, v3 = vs[k];
          return {
            q: `三相交流の3つの電圧（山の高さ $${A}\\,\\mathrm{V}$）。ある時刻に2つが $${vs[i]}\\,\\mathrm{V}$ と $${vs[j]}\\,\\mathrm{V}$ のとき、3つめ □ V`, a: `$${v3}$`,
            easy: `3つの和は0なので $0-${par(vs[i])}-${par(vs[j])}=${v3}$`,
          };
        }
        const th = r.pick([0, 30, 45, 60, 90, 120, 150, 180, 210, 270, 300]), fn = r.pick(['sin', 'cos']), ans = Rtex(Rscale(ev(fn, th), fr(-1)));
        return {
          q: `$\\theta=${dg(th)}$ のとき、$${sh(fn, -120)}+${sh(fn, 120)}$ の値`, a: `$${ans}$`, easyCheck: false, easy: `$-\\${fn}${dg(th)}=${ans}$`,
          verify: () => valIs(`$${ans}$`, FN[fn](th - 120) + FN[fn](th + 120)),
        };
      },
      // わな：振幅がそろっていない・ずれが 90°
      trap(r) {
        const fn = r.pick(['sin', 'cos']);
        if (r.chance(0.5)) {
          const A = r.int(2, 4), e = `${A}${sh(fn, 0)}+${sh(fn, -120)}+${sh(fn, 120)}`, ans = `${A - 1 === 1 ? '' : A - 1}\\${fn}\\theta`;
          return dest({ q: `$${e}$ を短く`, a: `$${ans}$`, verify: () => sameTheta(e, ans) }, '4-95', `振幅がそろっていないので0にならない。$${A}${sh(fn, 0)}$ を $${sh(fn, 0)}$ と $${A - 1 === 1 ? '' : A - 1}${sh(fn, 0)}$ に分けると、のこりは $${ans}$`);
        }
        const e = `${sh(fn, 0)}+${sh(fn, 90)}+${sh(fn, 180)}`, ans = fn === 'sin' ? '\\cos\\theta' : '-\\sin\\theta';
        return dest({ q: `$${e}$ を短く`, a: `$${ans}$`, verify: () => sameTheta(e, ans) }, '4-95', `ずれが $90^{\\circ}$ ずつで、$120^{\\circ}$ ではない。$${sh(fn, 180)}=-${sh(fn, 0)}$ と打ち消しあい、のこりは $${sh(fn, 90)}=${ans}$`);
      },
    },
  });
})(globalThis.MONDAI);

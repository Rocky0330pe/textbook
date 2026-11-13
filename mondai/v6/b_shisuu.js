/* 問題集 第6巻　第2部 自分に比例してへる・終端速度（わざ 6-16〜6-30、6-94）　組 b
 * 書き方は v6/README.md（第6巻の手引き）と v5/README.md・v4/README.md。文は教科書 第6巻 6-4・6-5 と同じ：ルビなし、常用漢字まで、分かち書きはしない。式は $…$。
 * 教科書にそろえる：$\dfrac{\dd T}{\dd t}=-0.05\,(T-20)$、目標へ近づく形 $y=y_\infty+(y_0-y_\infty)e^{-t/\tau}$、$v_{\mathrm f}$（比例の抵抗）・$v_{\mathrm t}$（2乗の抵抗）、
 *   $C_{\mathrm{th}}$・$R_{\mathrm{th}}$・$T_{\mathrm a}$。落ちる物は「速さ」（下向きが正。教科書 6-5）。体重計の加速度は上向きを正（負にもなるので「加速度」の値で聞く）。
 * 近似値（第39回 P-3・O-4）：$e^{-1}=0.368$、$e^{-2}=0.135$、$e^{-3}=0.050$、$\ln2=0.693$、$\ln3=1.099$、$\ln4=1.386$、$\ln10=2.30$、$\sqrt2=1.414$。
 *   表にない値（$e^{-4}=0.018$・$e^{-5}=0.007$・$e^{-0.5}=0.607$・$e^{-1.5}=0.223$）は教科書 6-4 の値。$\ln1.5$ は P-3 の値から3けためが合わないので使わない（第40回 R1-19）。使う値とけたを問題の文に書き、
 *   文の値で計算して丸めた答えと、ほんとうの値を丸めた答えがくいちがう組は出さない（approx()。O-4）。近似の答えは「約 □」、楽な形に ≈。
 * 答えの確かめ：微分方程式の解は calc（kind 'ode'）。数の答えは verify(p) で、問題を作った式とは別の道すじ
 *   （e と ln をほんとうの値で計算する、微分方程式を細かいオイラー法でたどる、力のつり合いを数で解く）で出し直してくらべる。
 * 図は 6-22 のステップ3だけ（M.graph。$e^{-t/\tau}$・$1-e^{-t/\tau}$ の曲線と、$\tau$・$3\tau$・$5\tau$ の目もり。K-2・P-2）。回路・エレベーターの図は出さない（文だけ）。
 * 同じ見開きの重なり（O-2）：左ページの「楽な形にすると」の例の数（RAKU_*）は問題に出さない。key は s1〜s3・わなで同じ形（同じ式・同じ数の組を2回出さない）。
 * わなは、そのわざ自身で解けない問題。答えにはかならず行き先（わざの番号か「わざなし」。dest。N-3・第40回 S-7）。 */
(function (M) {
  'use strict';

  // ---------------------------------------------------------------- 数の部品
  const F = M.F;
  const fr = (n, d) => F.make(n, d == null ? 1 : d);
  const D = s => F.fromDec(String(s));                               // '0.05' → 分数
  const strip = s => String(s).trim().replace(/^\$|\$$/g, '');
  const ev = (t, vars) => M.evalMath(t, vars || {});
  const fmt = v => String(+(+v).toFixed(10));                       // 0.30000000004 → 0.3
  const near = (x, y, tol) => x != null && y != null && isFinite(x) && isFinite(y) && Math.abs(x - y) <= (tol || 1e-9) * Math.max(1, Math.abs(x), Math.abs(y));
  // 分数 f の、ちょうどの小数（分母が 2 と 5 だけのとき。ほかは null）
  function decStr(f) {
    const [n, d] = f, sg = n < 0 ? '-' : '';
    let k = 0, p = 1n;
    while (k < 15 && (BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) { k++; p *= 10n; }
    if ((BigInt(Math.abs(n)) * p) % BigInt(d) !== 0n) return null;
    const N = (BigInt(Math.abs(n)) * p / BigInt(d)).toString().padStart(k + 1, '0');
    return sg + (k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N);
  }
  // 分数 f を、小数第 k 位までに四捨五入した文字（0 なら整数）
  function roundStr(f, k) {
    const [n, d] = f, sg = n < 0 ? '-' : '', p = 10n ** BigInt(k);
    const N = ((2n * BigInt(Math.abs(n)) * p + BigInt(d)) / (2n * BigInt(d))).toString().padStart(k + 1, '0');
    const t = k ? N.slice(0, N.length - k) + '.' + N.slice(N.length - k) : N;
    return (/[1-9]/.test(t) ? sg : '') + t;
  }
  // ほんとうの値（小数）を小数第 k 位までに丸めた文字（roundStr とくらべる。O-4）
  const trueRd = (v, k) => { const t = (Math.sign(v) * Math.round(Math.abs(v) * 10 ** k) / 10 ** k).toFixed(k); return /[1-9]/.test(t) ? t : t.replace('-', ''); };
  const decLen = s => (String(s).split('.')[1] || '').length;          // 小数のけた数
  const keta = k => (k ? `小数第${k}位まで` : '整数で');
  // 近似の答え：文の値で計算した分数 f と、ほんとうの値 v。けた ks（かず。多い順にためす）のうち、丸めた答えがくいちがわないものを使う（O-4）。
  //   どのけたでもくいちがうなら null（その組は出さない）
  function approx(f, v, ks) {
    if (ks === 'auto') { const e = decStr(f), k = e ? Math.min(2, Math.max(1, decLen(e))) : 2; ks = [k, 3 - k]; }
    for (const k of ks) { const a = roundStr(f, k); if (a === trueRd(v, k)) return { a, k, ex: decStr(f) }; }
    return null;
  }
  // 楽な形の最後：「＝ちょうどの値」のあとに、丸めた答えがちがえば「≈答え」
  const tail = A => (!A.ex ? `\\approx${A.a}` : +A.ex === +A.a ? `=${A.a}` : `=${A.ex}\\approx${A.a}`);
  // 近似の値（教科書 第6巻・第39回 P-3）
  const EXP = { 1: '0.368', 2: '0.135', 3: '0.050', 4: '0.018', 5: '0.007', 0.5: '0.607', 1.5: '0.223' };   // e^{-k}
  const LN = { 2: '0.693', 3: '1.099', 4: '1.386', 10: '2.30' };
  const eTxt = k => `$e^{-${k}}=${EXP[k]}$`;
  const lnTxt = n => `$\\ln${n}=${LN[n]}$`;
  // 数と単位（1かたまり。O-7）
  //   単位の中の μ・Ω は \mathrm{\mu F}・\mathrm{k\Omega}（P-14。本では core.js が立てた字 \upmu・\upOmega に直す。第40回 S-6 で組 a・c とそろえた）
  const U = (v, u) => `$${v}\\,\\mathrm{${u}}$`;
  const C = v => `$${v}$℃`;                                           // ℃ は式の外（教科書と同じ）。数と ℃ のあいだはあけない（行末で分かれないように。第40回 S-6）
  const DY = v => `\\dfrac{\\dd ${v}}{\\dd t}`;
  // e の右肩：τ が整数なら e^{-t/τ}、そうでなければ e^{-at}（a=1 は e^{-t}）
  const eT = tau => `e^{-t/${fmt(tau)}}`;
  const eA = a => `e^{-${String(a) === '1' ? '' : fmt(a)}t}`;
  const eOf = a => (Number.isInteger(1 / a) && 1 / a > 1 ? eT(1 / a) : eA(a));
  // y∞ + d e^{…}（d が負なら −）
  const near0 = (yi, d, e) => (yi === 0 ? `${d < 0 ? '-' : ''}${Math.abs(d) === 1 ? '' : fmt(Math.abs(d))}${e}` : `${fmt(yi)}${d < 0 ? '-' : '+'}${Math.abs(d) === 1 ? '' : fmt(Math.abs(d))}${e}`);
  const co = a => (String(a) === '1' ? '' : fmt(a));                 // 係数1は書かない
  // 同じステップの中で、問題の形を順番に回す（はじめの形は乱数。r は見開き・プリントごとに新しく作られる）
  const turn = (r, key, n) => { const d = r.turns || (r.turns = {}); d[key] = d[key] == null ? r.int(0, n - 1) : (d[key] + 1) % n; return d[key]; };
  // 答えの文から数を1つ（「$…$」の中。単位は除く）
  const numOf = a => { const m = /\$([^$]*)\$/.exec(String(a)); return m ? ev(m[1].replace(/\\,\\mathrm\{[^}]*\}/g, '').replace(/^.*=/, '')) : null; };
  const isNum = (a, want, tol) => (near(numOf(a), want, tol || 1e-9) || `答え ${a} は ${fmt(want)} のはず`);
  // 近似の答え：ほんとうの値 want を、答えのけたで丸めると答えになるか
  const isRd = (a, want) => { const t = String(a).replace(/\$/g, ''), k = decLen(t); return (t === trueRd(want, k)) || `答え ${a} は ${trueRd(want, k)} のはず（ほんとうの値 ${fmt(want)}）`; };
  // 1階の式 y' = f(t, y) を細かいオイラー法でたどる（確かめ用。答えの式を使わない別の道すじ）
  function walk(f, y0, t1, n) { n = n || 20000; let y = y0; const h = t1 / n; for (let k = 0; k < n; k++) { const t = k * h, a = f(t, y), b = f(t + h / 2, y + a * h / 2), c = f(t + h / 2, y + b * h / 2), d = f(t + h, y + c * h); y += h * (a + 2 * b + 2 * c + d) / 6; } return y; }
  // 答えの式（＝ の右、変数 t）が、y' = f(t, y)・y(0)=y0 の解を数でたどった値と、いくつかの時刻で合うか（calc ode より細かく。τ が大きいときも見のがさない）
  function solOK(ans, f, y0, T) {
    const R = strip(ans).replace(/^[^=]*=/, ''), Y = t => ev(R, { t });
    for (const t of [0, 0.37 * T, 1.3 * T, 2.9 * T]) {
      const want = t ? walk(f, y0, t, 400) : y0, got = Y(t);
      if (!near(got, want, 1e-6)) return `t=${fmt(t)} で ${fmt(want)} のはずが ${got}（答え ${ans}）`;
    }
    return true;
  }
  // y' = −a y + b の答えの確かめ（calc と verify の両方）
  const lin1 = (a, b, y0) => ({ calc: { kind: 'ode', x: 't', coef: [1, +a], rhs: String(b || 0), init: [[0, y0]] }, verify: p => solOK(p.a, (t, y) => -a * y + (+b || 0), y0, 1 / a) });

  // ---------------------------------------------------------------- 見わけよう（fits）の部品
  // 文から $ と \, と空白をとり、\dfrac を \frac に（正規表現で読みやすく）
  const sq = q => String(q).replace(/\$/g, '').replace(/\\,/g, '').replace(/\\dfrac/g, '\\frac').replace(/\s+/g, '');
  // 微分方程式の右辺の形（自分に比例してへる・目標へ近づく・数−数×自分・2乗・自分がない）
  const DV = '\\\\frac\\{\\\\dd([A-Za-z])(?:_\\{[^}]*\\})?\\}\\{\\\\ddt\\}';
  const RX = {
    self: new RegExp(`${DV}=-(?:[\\d.]*\\1|\\\\frac\\{\\1\\}\\{[\\w.]+\\})(?![\\w(^{.])`),
    self2: new RegExp(`${DV}\\+[\\d.]*\\1=0`),
    diff: new RegExp(`${DV}=(?:-[\\d.]+\\(\\1-[\\d.]+\\)|\\\\frac\\{[\\d.]+-\\1\\}\\{[\\d.]+\\})`),
    diff2: new RegExp(`[\\d.]+${DV}\\+\\1=[\\d.]+`),
    lin: new RegExp(`${DV}=[\\d.]+-[\\d.]+\\1(?![\\w^{.(])`),
    sq2: new RegExp(`${DV}=[\\d.]+-[\\d.]+\\1\\^\\{?2`),
  };
  const asksExpr = s => /をみたす|の式で/.test(s);
  const asksTime = s => /□(分|秒|日|時間|ms)後|になる時刻|□(分|秒)かかる|までの時間/.test(s);
  // 部屋の温度（目標）・はじめ・なる温度から「残りの差の割合」（読めなければ null）
  function ratioOf(s) {
    let m, Ta = null, T0 = null, T1 = null, D0 = null;
    if ((m = /部屋の温度は(-?[\d.]+)℃/.exec(s)) || (m = /\((?:T|x)-([\d.]+)\)/.exec(s)) || (m = /\\frac\{([\d.]+)-(?:T|x)\}/.exec(s))) Ta = +m[1];
    if ((m = /はじめ(-?[\d.]+)℃/.exec(s)) || (m = /(?:T|x)\(0\)=(-?[\d.]+)/.exec(s))) T0 = +m[1];
    if ((m = /=([\d.]+)([+-][\d.]+)e\^\{-/.exec(s))) { Ta = +m[1]; D0 = +m[2]; }
    if ((m = /([\d.]+)℃になる/.exec(s))) T1 = +m[1];
    if ((m = /(-?[\d.]+)℃から(-?[\d.]+)℃にな/.exec(s))) { T0 = +m[1]; T1 = +m[2]; }
    // 温度でないもの（電圧・量）：目標は0（放電・へる量）
    if ((m = /([\d.]+)\\mathrm\{(V|g)\}(?:までためた|が|から)[^□]*?([\d.]+)\\mathrm\{\2\}になる/.exec(s)) && !/充電/.test(s)) return +m[3] / +m[1];
    if ((m = /差が\\frac\{1\}\{(\d+)\}にな/.exec(s))) return 1 / +m[1];
    if (Ta == null || T1 == null) return null;
    const d0 = D0 != null ? D0 : T0 != null ? T0 - Ta : null;
    return d0 ? (T1 - Ta) / d0 : null;
  }

  // ---------------------------------------------------------------- わなの行き先（H-1・N-3）
  // easy に「（わけ。わざ □ で）」か「（わけ。わざなし）」。extra：ほかの部のわざなど、fits では見つからない行き先
  function dest(p, self, why, extra) {
    const q = M.plain(p.q);
    const also = M.list(6).filter(id => {
      const d = M.waza[id];
      if (id === self || d.part !== 2 || !d.fits) return false;
      try { return !!d.fits(q, p); } catch (e) { return false; }
    });
    (extra || []).forEach(id => { if (id !== self && !also.includes(id)) also.push(id); });
    also.sort();
    if (also.length) p.also = also;
    p.easy = `（${why}。${also.length ? `わざ ${also.join('・')} で` : 'わざなし'}）`;
    p.easyCheck = false;
    return p;
  }

  // ================================================================ 6-16
  // r^n：r は「半分」か小数。n 回分
  const RS = ['half', '0.6', '0.8', '0.9', '0.4', '0.7'];
  const rF = r => (r === 'half' ? fr(1, 2) : D(r));
  const rWord = r => (r === 'half' ? '半分' : `$${r}$ 倍`);
  const rTeX = r => (r === 'half' ? '\\Bigl(\\frac{1}{2}\\Bigr)' : `${r}`);
  const fpow = (f, n) => { let o = fr(1); for (let k = 0; k < n; k++) o = F.mul(o, f); return o; };
  // D0 × r^n がきりのよい小数（3けたまで）になる組
  function decayPick(r, Ds, ns) {
    for (let k = 0; k < 40; k++) {
      const rr = r.pick(RS), D0 = r.pick(Ds), n = r.pick(ns), v = F.mul(fr(D0), fpow(rF(rr), n)), s = decStr(v);
      if (s && decLen(s) <= (rr === 'half' ? 3 : 2) + (D0 < 20 ? 1 : 0)) return { rr, D0, n, v, s };
    }
    return null;
  }
  // 確かめ：k=−ln r ÷ p として D0 e^{−kt}（ほんとうの指数関数）で計算しなおす
  const viaExp = (D0, rr, p, t) => D0 * Math.exp(Math.log(rr === 'half' ? 0.5 : +rr) / p * t);
  M.add({
    id: '6-16', part: 2, chap: '6-4①・3-11', stars: 1,
    title: '差は「同じ時間で同じ割合」でへる：$t$ で $r$ 倍なら、$nt$ で $r^n$ 倍（$e$ も $\\ln$ も使わない）',
    mark: '部屋との温度の差や電圧が「□分で半分」「1秒で0.6倍」とわかっていて、その整数倍の時間後を聞かれる。',
    futsu: ['10分で半分から $k=\\dfrac{\\ln2}{10}$ を出し、', '$T=20+60e^{-kt}$ に $t=30$ を入れる'],
    raku: ['30分は10分の3回分', '差 $60\\times\\Bigl(\\dfrac12\\Bigr)^3=7.5$', '温度は $20+7.5=27.5$℃'],
    why: 'ルール $\\dfrac{\\dd T}{\\dd t}=-k\\,(T-20)$ では、差が半分なら下がる速さも半分。だから、差が何℃でも、同じ時間で同じ割合だけへる（6-4①）。$t$ で $r$ 倍なら、次の $t$ でもまた $r$ 倍で、$nt$ では $r^n$ 倍（3-11）。',
    caution: '割合でへるので、ひき算ではない（10分で30℃下がったから、次の10分も30℃、ではない）。温度を聞かれたら、差に部屋の温度をたしてもどす。冷たい物が温まるときは、部屋の温度から差をひく。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      const s = sq(q);
      if (asksTime(s) || /\\ln|e\^/.test(s)) return false;
      const per = /([\d.]+)(分|秒|日|時間)(?:ごとに|で|後に)/.exec(s), ask = /([\d.]+)(分|秒|日|時間)後(?:は|の|には)/.exec(s);
      if (!per || !ask || per[2] !== ask[2] || !/半分|倍にな|になった/.test(s)) return false;
      const n = +ask[1] / +per[1];
      return Number.isInteger(n) && (n >= 2 || (n >= 1 && /さらに/.test(s)));
    },
    steps: {
      // 差・電圧が、□ごとに r 倍（答えは、ちょうどの小数）
      s1(r) {
        const kind = turn(r, '16s1', 2);
        if (kind === 0) {
          const P = decayPick(r, [40, 60, 50, 32, 64, 48, 24, 30, 70], [2, 3, 4]); if (!P) return null;
          const p = r.pick([5, 10, 15, 20, 4, 6]);
          if (P.D0 === 60 && P.rr === 'half' && P.n === 3) return null;   // 左ページの例（O-2）
          return {
            q: `お湯と部屋の温度の差が ${C(P.D0)}ある。差は $${p}$ 分ごとに${rWord(P.rr)}になる。$${P.n * p}$ 分後の差は □ ℃`, a: `$${P.s}$`, key: `${P.D0}|${P.rr}|${P.n}`,
            easy: `$${P.n * p}\\div${p}=${P.n}$ 回分。$${P.D0}\\times${rTeX(P.rr)}^{${P.n}}=${P.s}$`, easyCheck: false,
            verify: p2 => isNum(p2.a, viaExp(P.D0, P.rr, p, P.n * p), 1e-9),
          };
        }
        const P = decayPick(r, [10, 20, 50, 100, 5, 12], [2, 3]); if (!P) return null;
        const p = r.pick([1, 2, 0.5]);
        if (P.D0 === 10 && P.rr === '0.6' && P.n === 3) return null;   // 左ページの例（O-2）
        return {
          q: `コンデンサーの電圧 ${U(P.D0, 'V')} が、$${p}$ 秒ごとに${rWord(P.rr)}になる。$${fmt(P.n * p)}$ 秒後の電圧は □ V`, a: `$${P.s}$`, key: `${P.D0}|${P.rr}|${P.n}`,
          easy: `$${fmt(P.n * p)}\\div${p}=${P.n}$ 回分。$${P.D0}\\times${rTeX(P.rr)}^{${P.n}}=${P.s}$`, easyCheck: false,
          verify: p2 => isNum(p2.a, viaExp(P.D0, P.rr, p, P.n * p), 1e-9),
        };
      },
      // 温度で聞く（差を出してから、部屋の温度にもどす。温まるときは部屋の温度からひく）
      s2(r) {
        const P = decayPick(r, [40, 60, 80, 50, 64, 48, 32, 20, 16], [2, 3, 4]); if (!P) return null;
        const Ta = r.pick([20, 25, 15, 18, 22, 24]), p = r.pick([5, 10, 15, 20, 8]), warm = P.D0 <= 20 && Ta >= 20;
        const T0 = warm ? Ta - P.D0 : Ta + P.D0, A = warm ? F.sub(fr(Ta), P.v) : F.add(fr(Ta), P.v), ans = decStr(A);
        if (T0 > 95 || T0 < 0 || (Ta === 20 && T0 === 80 && P.rr === 'half' && P.n === 3)) return null;   // 100℃をこえない。左ページの例（O-2）
        return {
          q: `部屋の温度は ${C(Ta)}。はじめ ${C(T0)}の${warm ? '飲み物' : 'お湯'}は、部屋との温度の差が $${p}$ 分ごとに${rWord(P.rr)}になる。$${P.n * p}$ 分後の温度は □ ℃`,
          a: `$${ans}$`, key: `${P.D0}|${P.rr}|${P.n}`, easyCheck: false,
          easy: `差 $${P.D0}\\times${rTeX(P.rr)}^{${P.n}}=${P.s}$。$${Ta}${warm ? '-' : '+'}${P.s}=${ans}$`,
          verify: p2 => isNum(p2.a, Ta + (warm ? -1 : 1) * viaExp(P.D0, P.rr, p, P.n * p), 1e-9),
        };
      },
      // 見かけがちがう：はかった2つの温度から割合を読む・放射性の物質・充電（残りの差）
      s3(r) {
        const kind = turn(r, '16s3', 3);
        if (kind === 0) {
          const Ta = r.pick([20, 25, 15]), D0 = r.pick([40, 60, 80, 64]), rr = r.pick(['half', '0.8', '0.6']), n = r.pick([2, 3]), p = r.pick([5, 10, 15]);
          const D1 = F.mul(fr(D0), rF(rr)), v = F.mul(fr(D0), fpow(rF(rr), n)), s = decStr(v), T1 = decStr(F.add(fr(Ta), D1)), ans = decStr(F.add(fr(Ta), v));
          if (!s || decLen(s) > 2 || decLen(T1) > 1 || Ta + D0 > 95) return null;
          return {
            q: `部屋の温度は ${C(Ta)}。はじめ ${C(Ta + D0)}のお湯が、$${p}$ 分後に ${C(T1)}になった。はじめから $${n * p}$ 分後の温度は □ ℃`,
            a: `$${ans}$`, key: `${D0}|${rr}|${n}`, easyCheck: false,
            easy: `差は $${D0}\\to${decStr(D1)}$ で、$${p}$ 分で $${rr === 'half' ? '\\frac{1}{2}' : rr}$ 倍。$${D0}\\times${rTeX(rr)}^{${n}}=${s}$、$${Ta}+${s}=${ans}$`,
            verify: p2 => isNum(p2.a, Ta + viaExp(D0, rr, p, n * p), 1e-9),
          };
        }
        if (kind === 1) {
          const N0 = r.pick([800, 400, 1000, 640, 480, 200]), n = r.pick([2, 3, 4]), p = r.pick([5, 8, 10, 30]), v = F.mul(fr(N0), fpow(fr(1, 2), n)), s = decStr(v);
          return {
            q: `放射性の物質が $${p}$ 日で半分になる。はじめ ${U(N0, 'g')} のとき、$${n * p}$ 日後は □ g`, a: `$${s}$`, key: `${N0}|half|${n}`, easyCheck: false,
            easy: `$${n}$ 回分。$${N0}\\times\\Bigl(\\frac{1}{2}\\Bigr)^{${n}}=${s}$`, verify: p2 => isNum(p2.a, viaExp(N0, 'half', p, n * p), 1e-9),
          };
        }
        const E = r.pick([10, 12, 5, 20, 6]), rr = r.pick(['half', '0.6', '0.4', '0.8']), n = r.pick([2, 3]), p = r.pick([1, 2]);
        const v = F.mul(fr(E), fpow(rF(rr), n)), s = decStr(v), ans = decStr(F.sub(fr(E), v));
        if (!s || decLen(s) > 3) return null;
        return {
          q: `${U(E, 'V')} の電池で、空のコンデンサーを充電する。電池とコンデンサーの電圧の差（はじめ ${U(E, 'V')}）は、$${p}$ 秒ごとに${rWord(rr)}になる。$${n * p}$ 秒後のコンデンサーの電圧は □ V`,
          a: `$${ans}$`, key: `${E}|${rr}|${n}`, easyCheck: false,
          easy: `残りの差 $${E}\\times${rTeX(rr)}^{${n}}=${s}$。$${E}-${s}=${ans}$`, verify: p2 => isNum(p2.a, E - viaExp(E, rr, p, n * p), 1e-9),
        };
      },
      // わな：時間が整数倍でない（1.5回分・0.5回分）→ e^{-t/τ} の式（6-18）で、√2 を使う
      trap(r) {
        const D0 = r.pick([40, 60, 50, 70, 30]), p = r.pick([10, 20, 6]), m = r.pick([0.5, 1.5]);
        const f = m === 0.5 ? F.div(fr(D0), D('1.414')) : F.div(fr(D0), F.mul(fr(2), D('1.414'))), A = approx(f, D0 * Math.pow(2, -m), [1]);
        if (!A) return null;
        return dest({
          q: `お湯と部屋の温度の差が ${C(D0)}ある。差は $${p}$ 分ごとに半分になる。$${fmt(m * p)}$ 分後の差は約 □ ℃（$\\sqrt2=1.414$ として、小数第1位まで）`,
          a: `$${A.a}$`, key: `t${D0}|${m}`, verify: p2 => isRd(p2.a, D0 * Math.pow(2, -m)),
        }, '6-16', `$${fmt(m * p)}$ 分は $${p}$ 分の整数倍でない（$${m}$ 回分）。$T-T_{\\mathrm a}=${D0}e^{-t/\\tau}$ の式で、$\\Bigl(\\frac{1}{2}\\Bigr)^{${m}}=${m === 0.5 ? '\\frac{1}{\\sqrt2}' : '\\frac{1}{2\\sqrt2}'}$。$${D0}\\div${m === 0.5 ? '1.414' : '2.828'}${tail(A)}$`, ['6-18']);
      },
    },
  });

  // ================================================================ 6-17
  const AS17 = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.05', '1', '2', '3', '0.25', '1.5', '0.02'];
  const Y17 = [2, 3, 4, 5, 6, 8, 10, 20, 50, 100, 200, 500];
  const raku17 = (a, y0) => (+a === 0.2 && y0 === 500) || (+a === 0.5 && y0 === 8);   // 左ページの例（O-2）
  M.add({
    id: '6-17', part: 2, chap: '6-4②③ 例題2', stars: 1,
    title: '$\\dfrac{\\dd y}{\\dd t}=-ay$ は、変数分離をくり返さずに $y=y_0e^{-at}$（時定数 $\\tau=\\dfrac1a$）',
    mark: '「自分に比例してへる」ルールと、はじめの量。$\\dfrac{\\dd N}{\\dd t}=-0.2N$、$N(0)=500$。',
    futsu: ['$N$ でわって両辺を積分し、', '$\\ln N=-0.2t+C$ から $N=e^{-0.2t+C}$、', '$e^C=A$ とおいて、$t=0$ で $A$ を決める'],
    raku: ['$\\dfrac{\\dd N}{\\dd t}=-0.2N$、$N(0)=500$', '肩は $-0.2t$、前ははじめの $500$', '$N=500e^{-0.2t}$'],
    why: '変数分離（6-4③）をすると、いつも $y=Ae^{-at}$ になり、$t=0$ で $e^0=1$ なので $A$ ははじめの値。だから、肩には右辺の係数（$-a$）と $t$、前にははじめの値を書けばよい。微分すると $-a\\times y_0e^{-at}=-ay$ で、たしかに合う。',
    caution: '肩の数の符号に気をつける（へるときはマイナス）。$-\\dfrac{V}{4}$ なら肩は $-\\dfrac{t}{4}$（$\\tau=4$）で、$-4t$ ではない。部屋の温度のような「目標」があるときは、この形ではない（わざ 6-18）。',
    counts: { s1: 6, s2: 4, s3: 4, trap: 2 },
    cols: { s1: 2, s2: 2, s3: 1, trap: 1 },
    boxw: { s1: '26mm', s2: '26mm', s3: '28mm', trap: '30mm' },
    fits(q) {
      const s = sq(q);
      return asksExpr(s) && (RX.self.test(s) || RX.self2.test(s) || /そのときの量の[\d.]+倍の速さでへる/.test(s));
    },
    steps: {
      s1(r) {
        const a = r.pick(AS17), y0 = r.pick(Y17);
        if (raku17(a, y0)) return null;
        return { q: `$${DY('y')}=-${co(a)}y$、$y(0)=${y0}$ をみたす $y$`, a: `$y=${y0}${eA(a)}$`, key: `${fmt(a)}`, easy: `肩は $-${co(a)}t$、前は $y(0)=${y0}$`, easyCheck: false, ...lin1(a, 0, y0) };
      },
      // τ の形（$-\frac{V}{4}$）・文字が y でない
      s2(r) {
        const tau = r.pick([2, 4, 5, 8, 10, 20, 25, 50]), y0 = r.pick(Y17), v = r.pick(['V', 'N', 'q', 'x']);
        if (raku17(1 / tau, y0) || (tau === 4 && v === 'V')) return null;   // 左ページの「使えないとき」の例（$-\\dfrac{V}{4}$）も出さない
        return { q: `$${DY(v)}=-\\dfrac{${v}}{${tau}}$、$${v}(0)=${y0}$ をみたす $${v}$`, a: `$${v}=${y0}${eT(tau)}$`, key: `${fmt(1 / tau)}`, easy: `$\\tau=${tau}$。肩は $-\\frac{t}{${tau}}$、前は $${y0}$`, easyCheck: false, ...lin1(1 / tau, 0, y0) };
      },
      // 見かけがちがう：ことばの放射性の物質・左辺にまとめた形・まだ鳴らない確率・RC の放電
      s3(r) {
        const kind = turn(r, '17s3', 4);
        if (kind === 0) {
          const a = r.pick(['0.1', '0.2', '0.05', '0.3']), N0 = r.pick([100, 200, 400, 1000, 50]);
          if (raku17(a, N0)) return null;
          return { q: `放射性の物質の量 $N$（g）は、1日あたり、そのときの量の $${a}$ 倍の速さでへる。はじめ ${U(N0, 'g')}。$N$ を $t$（日）の式で □`, a: `$N=${N0}${eA(a)}$`, key: `${fmt(a)}`, easy: `$${DY('N')}=-${a}N$、$N(0)=${N0}$`, easyCheck: false, ...lin1(a, 0, N0) };
        }
        if (kind === 1) {
          const a = r.pick(['2', '3', '0.5', '4', '0.1']), y0 = r.pick([3, 5, 7, 10, 20]);
          if (raku17(a, y0)) return null;
          return { q: `$${DY('y')}+${co(a)}y=0$、$y(0)=${y0}$ をみたす $y$`, a: `$y=${y0}${eA(a)}$`, key: `${fmt(a)}`, easy: `$${DY('y')}=-${co(a)}y$ と同じ`, easyCheck: false, ...lin1(a, 0, y0) };
        }
        if (kind === 2) {
          const a = r.pick(['0.3', '0.2', '0.5', '2', '1.5']);
          return { q: `まだ1回も鳴らない確率 $P$ は、$${DY('P')}=-${co(a)}P$、$P(0)=1$ をみたす。$P$ を $t$ の式で □`, a: `$P=${eA(a)}$`, key: `${fmt(a)}`, easy: `前は $P(0)=1$ なので書かない`, easyCheck: false, ...lin1(a, 0, 1) };
        }
        const tau = r.pick([2, 4, 5, 10, 0.5]), V0 = r.pick([5, 9, 10, 12, 6]);
        return { q: `放電：$${DY('V')}=-\\dfrac{V}{RC}$、$RC=${tau}$ 秒、$V(0)=${V0}$。$V$ を $t$ の式で □`, a: `$V=${V0}${tau < 1 ? eA(1 / tau) : eT(tau)}$`, key: `${fmt(1 / tau)}`, easy: `$\\tau=RC=${tau}$`, easyCheck: false, ...lin1(1 / tau, 0, V0) };
      },
      // わな：$-a(y-b)$（0 でなく b に近づく）→ わざ 6-18
      trap(r) {
        const a = r.pick(['0.2', '0.5', '0.1', '0.25']), b = r.pick([5, 10, 20, 4]), y0 = b + r.pick([4, 6, -3, 10, 8]);
        if (y0 <= 0) return null;
        return dest({ q: `$${DY('y')}=-${a}\\,(y-${b})$、$y(0)=${y0}$ をみたす $y$`, a: `$y=${near0(b, y0 - b, eOf(+a))}$`, key: `t${a}|${b}|${y0}`, ...lin1(a, +a * b, y0) }, '6-17',
          `0 ではなく ${b} に近づく。差 $y-${b}$ が自分に比例してへるので、$y=${b}+(${y0}-${b})${eOf(+a)}$`);
      },
    },
  });

  // ================================================================ 6-18
  const raku18 = (Ta, tau, T0) => Ta === 20 && (tau === 20 || (tau === 10 && T0 === 5));   // 左ページの例（O-2）。-0.05(T-20) は、はじめの温度によらず出さない（第40回 R1-6）
  const ans18 = (v, yi, tau, y0) => `${v}=${near0(yi, y0 - yi, Number.isInteger(tau) && tau > 1 ? eT(tau) : eA(1 / tau))}`;
  // 部屋の温度・τ・はじめ（熱い物・冷たい物）
  function pick18(r) {
    const Ta = r.pick([15, 18, 20, 22, 24, 25, 26]), tau = r.pick([5, 8, 10, 15, 20, 25, 40, 50]), warm = r.chance(0.35);
    const T0 = warm ? r.pick([2, 4, 5, 6, 8, 10]) : Ta + r.pick([40, 50, 60, 70, 55]);
    return raku18(Ta, tau, T0) || T0 > 95 ? null : { Ta, tau, T0 };
  }
  M.add({
    id: '6-18', part: 2, chap: '6-4④ 例題1・3', stars: 1,
    title: '目標へ近づく形：$\\dfrac{\\dd y}{\\dd t}=\\dfrac{y_\\infty-y}{\\tau}$ なら $y=y_\\infty+(y_0-y_\\infty)\\,e^{-t/\\tau}$（温まるときは $y_0-y_\\infty$ が負）',
    mark: '部屋の温度（目標）とはじめの温度と、近づく形のルール。$-0.05\\,(T-20)$ や $\\dfrac{20-T}{10}$。',
    futsu: ['差 $u=T-20$ とおいて変数分離し、', '$\\ln u=-0.05t+C$ から $u=Ae^{-0.05t}$、', '$t=0$ で $A$ を決めて $T$ にもどす'],
    raku: ['$-0.05\\,(T-20)$、$T(0)=80$', '$\\tau=\\dfrac{1}{0.05}=20$、はじめの差 $80-20=60$', '$T=20+60e^{-t/20}$'],
    why: '目標との差 $u=y-y_\\infty$ は、目標が定数なので $\\dfrac{\\dd u}{\\dd t}=-\\dfrac{u}{\\tau}$。自分に比例してへる形なので $u=(y_0-y_\\infty)e^{-t/\\tau}$（6-4④）。答えは「最後の値＋はじめの差×へり方」。',
    caution: '$e$ の前の数は、はじめの温度ではなく「はじめの差」（はじめ－目標）。5℃の飲み物を 20℃の部屋に置くと、差は $5-20=-15$ で $T=20-15e^{-t/10}$。$t=0$ を入れて、はじめの値になるか確かめる。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '32mm', s2: '32mm', s3: '32mm', trap: '16mm' },
    fits(q) { const s = sq(q); return asksExpr(s) && (RX.diff.test(s) || RX.diff2.test(s)); },
    steps: {
      // $\frac{20-T}{10}$ の形（τ と目標がそのまま読める）
      s1(r) {
        const P = pick18(r); if (!P) return null;
        const { Ta, tau, T0 } = P;
        return {
          q: `$${DY('T')}=\\dfrac{${Ta}-T}{${tau}}$、$T(0)=${T0}$ をみたす $T$`, a: `$${ans18('T', Ta, tau, T0)}$`, key: `${Ta}|${tau}`,
          easy: `目標 $${Ta}$、$\\tau=${tau}$、はじめの差 $${T0}-${Ta}=${T0 - Ta}$`, easyCheck: false, ...lin1(1 / tau, Ta / tau, T0),
        };
      },
      // $-k(T-T_a)$ の形（τ=1/k）
      s2(r) {
        const P = pick18(r); if (!P) return null;
        const { Ta, tau, T0 } = P, k = fmt(1 / tau);
        if (decLen(k) > 3) return null;
        return {
          q: `部屋の温度は ${C(Ta)}。$${DY('T')}=-${k}\\,(T-${Ta})$（$t$ は分）、$T(0)=${T0}$ をみたす $T$`, a: `$${ans18('T', Ta, tau, T0)}$`, key: `${Ta}|${tau}`,
          easy: `$\\tau=\\frac{1}{${k}}=${tau}$、はじめの差 $${T0}-${Ta}=${T0 - Ta}$`, easyCheck: false, ...lin1(1 / tau, Ta / tau, T0),
        };
      },
      // 見かけがちがう：RC の充電・温度計・$\tau\frac{dy}{dt}+y=y_\infty$（大学の本の書き方）
      s3(r) {
        const kind = turn(r, '18s3', 3);
        if (kind === 0) {
          const E = r.pick([5, 6, 9, 10, 12]), tau = r.pick([2, 4, 5, 10]);
          return { q: `充電：$${DY('V')}=\\dfrac{${E}-V}{${tau}}$（$t$ は秒）、$V(0)=0$。$V$ を $t$ の式で □`, a: `$V=${E}(1-${eT(tau)})$`, key: `${E}|${tau}`, easy: `目標 $${E}$、$\\tau=${tau}$、はじめの差 $0-${E}=-${E}$。$V=${E}-${E}${eT(tau)}$`, easyCheck: false, ...lin1(1 / tau, E / tau, 0) };
        }
        if (kind === 1) {
          const Tw = r.pick([40, 60, 80, 50]), tau = r.pick([5, 10, 20, 4]), x0 = r.pick([20, 25, 15]);
          return { q: `温度計を ${C(Tw)}のお湯に入れる。温度計の示す温度 $x$ は $${DY('x')}=\\dfrac{${Tw}-x}{${tau}}$（$t$ は秒）、$x(0)=${x0}$。$x$ を $t$ の式で □`, a: `$${ans18('x', Tw, tau, x0)}$`, key: `${Tw}|${tau}`, easy: `目標はお湯の $${Tw}$、はじめの差 $${x0}-${Tw}=${x0 - Tw}$`, easyCheck: false, ...lin1(1 / tau, Tw / tau, x0) };
        }
        const tau = r.pick([2, 4, 5, 10]), yi = r.pick([30, 12, 50, 8]), y0 = r.pick([0, 10, 20, 2, 60]);
        if (y0 === yi) return null;
        return { q: `$${tau}${DY('y')}+y=${yi}$、$y(0)=${y0}$ をみたす $y$`, a: `$${ans18('y', yi, tau, y0)}$`, key: `${yi}|${tau}`, easy: `両辺を $${tau}$ でわると $${DY('y')}=\\frac{${yi}-y}{${tau}}$`, easyCheck: false, ...lin1(1 / tau, yi / tau, y0) };
      },
      // わな：2乗の抵抗（目標へ近づく形でない）の終端速度 → わざ 6-28
      trap(r) {
        const [k, v] = r.pick([['0.2', 7], ['0.05', 14], ['0.0125', 28], ['0.008', 35], ['0.002', 70]]);
        return dest({ q: `落ちる物の速さ $v$（m/s）が、$${DY('v')}=9.8-${k}v^{2}$ にしたがう。終端速度は □ m/s`, a: `$${v}$`, key: `t${k}`, verify: p => isNum(p.a, Math.sqrt(9.8 / +k), 1e-9) }, '6-18',
          `$v^{2}$ があるので、目標へ近づく形ではない（$e$ の式にならない）。変わらなくなる速さは $0=9.8-${k}v^{2}$ から $\\sqrt{\\frac{9.8}{${k}}}=${v}$`, ['6-28']);
      },
    },
  });

  // ================================================================ 6-19
  // y∞ と a（b=a y∞）。b がきりのよい小数になる組
  const A19 = ['0.2', '0.5', '0.1', '0.25', '2', '3', '4', '0.4', '0.05', '5'];
  const YI19 = [10, 20, 30, 40, 8, 12, 16, 50, 4, 6, 2, 60];
  const raku19 = (yi, a) => (yi === 30 && +a === 0.2) || (yi === 4 && +a === 3);   // 左ページの例（O-2）
  function pick19(r) {
    const a = r.pick(A19), yi = r.pick(YI19), b = decStr(F.mul(D(a), fr(yi)));
    return !b || decLen(b) > 2 || raku19(yi, a) ? null : { a, yi, b };
  }
  const tauTeX = a => (decStr(F.div(fr(1), D(a))) || `\\frac{1}{${fmt(a)}}`);
  // y を 0 から数でたどり、t=τ で最後の値の 1−e^{−1} に届くか（時定数の確かめ）
  const tauOK = (ans, a, b) => { const T = numOf(ans), yi = b / a; return (T > 0 && near(walk((t, y) => b - a * y, 0, T, 400) / yi, 1 - Math.exp(-1), 1e-7)) || `時定数 ${ans} がちがう`; };
  const finOK = (ans, a, b) => isNum(ans, walk((t, y) => b - a * y, 0, 60 / a, 4000), 1e-6);   // 長い時間たどった値
  M.add({
    id: '6-19', part: 2, chap: '6-4④ 例題4・6-5③⑤ 例題1・5', stars: 1,
    title: '$\\dfrac{\\dd y}{\\dd t}=b-ay$ は、右辺＝0 で最後の値 $y_\\infty=\\dfrac ba$、時定数 $\\tau=\\dfrac1a$（終端速度も同じ）',
    mark: '右辺が「数 $-$ 数×$y$」。「最後の値」「終端速度」「時定数」。$\\dfrac{\\dd y}{\\dd t}=6-0.2y$。',
    futsu: ['右辺を $0.2$ でくくって $\\dfrac{30-y}{5}$ に直し、', '差 $u=y-30$ とおいて変数分離して解き、', '$t$ を大きくして近づく値を見る'],
    raku: ['$6-0.2y=0$ から $y_\\infty=\\dfrac{6}{0.2}=30$', '$\\tau=\\dfrac{1}{0.2}=5$', '$y(0)=0$ なら $y=30\\,(1-e^{-t/5})$'],
    why: '最後には $y$ が変わらなくなるので、$\\dfrac{\\dd y}{\\dd t}=0$。右辺を0とおくと、解かなくても最後の値がわかる（6-4④）。右辺を $a$ でくくると $\\dfrac{\\frac{b}{a}-y}{\\frac{1}{a}}$ で、目標へ近づく形（$\\tau=\\dfrac1a$）。落ちる物の $9.8-810v$ も同じで、最後の値が終端速度（6-5③）。',
    caution: '時定数は $y$ の係数の逆数（$12-3y$ なら $\\tau=\\dfrac13$。$3$ ではない）。最後の値は $\\dfrac{b}{a}$ で、$b$ そのものではない。$m\\dfrac{\\dd v}{\\dd t}=mg-bv$ は、先に両辺を $m$ でわる。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '14mm', s2: '30mm', s3: '16mm', trap: '30mm' },
    fits(q) { const s = sq(q); return RX.lin.test(s) && !/\\Delta/.test(s); },
    steps: {
      // 最後の値か時定数（同じ式は1回だけ）
      s1(r) {
        const P = pick19(r); if (!P) return null;
        const { a, yi, b } = P, eq = `$${DY('y')}=${b}-${co(a)}y$`;
        if (turn(r, '19s1', 2) === 0) return { q: `${eq} の最後の値 $y_\\infty$`, a: `$${yi}$`, key: `${yi}|${fmt(a)}`, easy: `$${b}-${co(a)}y=0$ から $y=\\frac{${b}}{${a}}=${yi}$`, easyCheck: false, verify: p => finOK(p.a, +a, +b) };
        return { q: `${eq} の時定数 $\\tau$`, a: `$${tauTeX(a)}$`, key: `${yi}|${fmt(a)}`, easy: `$y$ の係数 $${a}$ の逆数`, easyCheck: false, verify: p => tauOK(p.a, +a, +b) };
      },
      // y の式（はじめ0か、0でない）
      s2(r) {
        const P = pick19(r); if (!P) return null;
        const { a, yi, b } = P, y0 = r.chance(0.6) ? 0 : yi + r.pick([10, -yi / 2, 20, 5]);
        if (y0 < 0 || y0 === yi || !Number.isInteger(y0)) return null;
        const ex = eOf(+a), A = y0 === 0 ? `${yi}(1-${ex})` : near0(yi, y0 - yi, ex);
        return {
          q: `$${DY('y')}=${b}-${co(a)}y$、$y(0)=${y0}$ をみたす $y$`, a: `$y=${A}$`, key: `${yi}|${fmt(a)}`,
          easy: `$y_\\infty=\\frac{${b}}{${a}}=${yi}$、$\\tau=${tauTeX(a)}$、はじめの差 $${y0}-${yi}=${y0 - yi}$`, easyCheck: false, ...lin1(a, b, y0),
        };
      },
      // 見かけがちがう：霧のつぶの終端速度・時定数、質量のある落ちる物
      s3(r) {
        const kind = turn(r, '19s3', 3);
        if (kind < 2) {
          const k = r.pick([980, 490, 196, 98, 245, 1960, 392]), vf = decStr(F.div(D('9.8'), fr(k)));
          const head = `小さなつぶが、$${DY('v')}=9.8-${k}v$（$v$ は m/s、$t$ は秒）にしたがって落ちる。`;
          if (kind === 0) return { q: `${head}終端速度は □ m/s`, a: `$${vf}$`, key: `${vf}|${k}`, easy: `$0=9.8-${k}v$ から $v_{\\mathrm f}=\\frac{9.8}{${k}}=${vf}$`, easyCheck: false, verify: p => finOK(p.a, k, 9.8) };
          return { q: `${head}時定数は □ 秒`, a: `$\\frac{1}{${k}}$`, key: `${vf}|${k}`, easy: `$v$ の係数 $${k}$ の逆数`, easyCheck: false, verify: p => tauOK(p.a, k, 9.8) };
        }
        const [m, bb] = r.pick([[1, '0.98'], [2, '0.98'], [0.5, '0.49'], [2, '4.9'], [1, '0.49'], [0.5, '0.98'], [0.1, '0.49'], [4, '9.8']]), mg = fmt(m * 9.8), vf = decStr(F.div(D(mg), D(bb))), a = +bb / m;
        return {
          q: `質量 ${U(m, 'kg')} の物が、速さに比例する抵抗を受けて落ちる。$${m === 1 ? '' : m}${DY('v')}=${mg}-${bb}v$（$v$ は m/s）。終端速度は □ m/s`, a: `$${vf}$`, key: `${vf}|${fmt(a)}`,
          easy: `$0=${mg}-${bb}v$ から $v_{\\mathrm f}=\\frac{${mg}}{${bb}}=${vf}$`, easyCheck: false, verify: p => finOK(p.a, a, 9.8),
        };
      },
      // わな：右辺に y がない（積分するだけ）→ わざ 6-14
      trap(r) {
        const p0 = r.pick([2, 3, 4, 6, -2]), q0 = r.pick(['-0.5', '1', '-2', '0.5', '5', '-1']), y0 = r.pick([2, 0, 5, 10, 1]);
        const h = fmt(p0 / 2), q = +q0, A = `${h === '1' ? '' : h === '-1' ? '-' : h}t^{2}${q < 0 ? '-' : '+'}${Math.abs(q) === 1 ? '' : Math.abs(q)}t${y0 ? '+' + y0 : ''}`;
        return dest({
          q: `$${DY('y')}=${p0}t${q < 0 ? '' : '+'}${q0}$、$y(0)=${y0}$ をみたす $y$`, a: `$y=${A}$`, key: `t${p0}|${q0}|${y0}`,
          calc: { kind: 'ode', x: 't', coef: [1, 0], rhs: `${p0}t+(${q0})`, init: [[0, y0]] }, verify: p => solOK(p.a, t => p0 * t + q, y0, 1),
        }, '6-19', `右辺に $y$ がなく、$t$ の式だけ。最後の値も時定数もない。右辺を積分して $+y(0)$`, ['6-14']);
      },
    },
  });

  // ================================================================ 6-20
  // 時定数と「半分」：答えは τ×0.693 を丸めた数（くいちがう τ は出さない）
  const half20 = (tau, ks) => approx(F.mul(D(tau), D(LN[2])), +tau * Math.LN2, ks || [1]);
  const raku20 = tau => +tau === 20 || +tau === 2;   // 左ページの例（τ=20 分・RC=2 秒。O-2）
  M.add({
    id: '6-20', part: 2, chap: '6-4⑤ 例題1・6', stars: 1,
    title: '差が半分になる時間は $\\tau\\ln2$（どこから数えても同じ）',
    mark: '「半分になるのは何分後」「50℃から 35℃までは」（部屋との差が半分）。時定数かルールがわかっている。',
    futsu: ['$T=20+60e^{-t/20}=50$ を作り、', '$e^{-t/20}=\\dfrac12$ にしてから $\\ln$ をとる', '（50℃から 35℃も、もう一度解く）'],
    raku: ['$\\tau=20$ 分なら、差が半分になるのは', '$20\\ln2\\approx20\\times0.693\\approx13.9$ 分', '80→50℃も 50→35℃も同じ'],
    why: '差は $e^{-t/\\tau}$ 倍になるので、半分になるのは $e^{-t/\\tau}=\\dfrac12$、つまり $t=\\tau\\ln2$（6-4⑤）。式に、はじめの差が入っていないので、どこから数えても同じ（半減期）。$\\dfrac14$ は半分の2回分で $2\\tau\\ln2$。',
    caution: '半分になるのは「部屋との差」で、温度そのものではない（80℃のお湯が 40℃になる時刻ではない）。半減期 $\\tau\\ln2$ は時定数 $\\tau$ より短い（0.693 倍）。',
    counts: { s1: 5, s2: 2, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { const s = sq(q), k = ratioOf(s); return asksTime(s) && (/半分/.test(s) || k === 0.5 || k === 0.25); },   // 1/4 は半分の2回分
    steps: {
      // 時定数がわかっていて、差（電圧・量）が半分になる時間
      s1(r) {
        const kind = turn(r, '20s1', 3);
        const tau = kind === 0 ? r.pick([4, 5, 6, 8, 10, 12, 15, 16, 25, 30, 40, 50]) : kind === 1 ? r.pick(['0.5', '1', '4', '5', '10', '0.2', '2.5']) : r.pick([5, 10, 30, 8, 100]);
        if (raku20(tau)) return null;
        const A = half20(tau, [+tau < 2 ? 2 : 1]); if (!A) return null;
        const u = ['分', '秒', '日'][kind];
        const what = ['時定数 $' + tau + '$ 分で冷めるお湯の、部屋との温度の差', 'コンデンサーの放電（時定数 $' + tau + '$ 秒）で、電圧', '時定数 $' + tau + '$ 日でへる放射性の物質の量'][kind];
        return {
          q: `${what}が半分になるのは約 □ ${u}後（${lnTxt(2)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: `${fmt(tau)}`,
          easy: `$${tau}\\ln2\\approx${tau}\\times0.693${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, +tau * Math.LN2),
        };
      },
      // ルールと温度から（差が半分になっていることに気づく。途中から数えても同じ）
      s2(r) {
        const k = r.pick(['0.1', '0.04', '0.02', '0.025', '0.2', '0.125', '0.25', '0.0625']), tau = 1 / +k, Ta = r.pick([20, 25, 15, 18]), Dd = r.pick([40, 60, 48, 64, 56, 72]);
        if (raku20(tau) || Ta + Dd > 95) return null;
        const A = half20(tau, [1]); if (!A) return null;
        const T0 = Ta + Dd, head = `部屋の温度は ${C(Ta)}。$${DY('T')}=-${k}\\,(T-${Ta})$（$t$ は分）にしたがって冷める。`;
        const q = turn(r, '20s2', 2) === 0 ? `${head}はじめ ${C(T0)}のとき、${C(Ta + Dd / 2)}になるのは約 □ 分後`
          : `${head}${C(Ta + Dd / 2)}から ${C(Ta + Dd / 4)}になるのに、約 □ 分かかる`;
        return {
          q: `${q}（${lnTxt(2)} として、小数第1位まで）`, a: `$${A.a}$`, key: `${fmt(tau)}`,
          easy: `差 $${q.includes('から') ? Dd / 2 + '\\to' + Dd / 4 : Dd + '\\to' + Dd / 2}$ で半分。$\\tau=${fmt(tau)}$、$${fmt(tau)}\\times0.693${tail(A)}$`, easyCheck: false,
          verify: p => isRd(p.a, tau * Math.LN2),
        };
      },
      // 見かけがちがう：R と C から・1/4 は半分の2回分・ルールから放射性の物質
      s3(r) {
        const kind = turn(r, '20s3', 3);
        if (kind === 0) {
          const [R, Cc] = r.pick([[10, 100], [50, 20], [20, 50], [100, 10], [5, 1000], [10, 500], [50, 100], [40, 100], [100, 30], [30, 100], [20, 300], [10, 330]]), tau = R * Cc / 1000, V0 = r.pick([10, 12, 6, 8]);
          if (raku20(tau)) return null;
          const A = half20(tau, [2, 1]); if (!A) return null;
          return {
            q: `${U(V0, 'V')} までためた ${U(Cc, '\\mu F')} のコンデンサーを、${U(R, 'k\\Omega')} の抵抗につなぐ。電圧が ${U(V0 / 2, 'V')} になるのは約 □ 秒後（${lnTxt(2)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: `${fmt(tau)}`,
            easy: `$RC=${R * 1000}\\times${fmt(Cc / 1e6)}=${fmt(tau)}$ 秒。半分なので $${fmt(tau)}\\times0.693${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, tau * Math.LN2),
          };
        }
        if (kind === 1) {
          const tau = r.pick([5, 10, 15, 8, 25, 30, 6, 12, 40]);
          const A = approx(F.mul(fr(2 * tau), D(LN[2])), 2 * tau * Math.LN2, [1]); if (!A) return null;
          return {
            q: `時定数 $${tau}$ 分で冷めるお湯の、部屋との温度の差が $\\frac{1}{4}$ になるのは約 □ 分後（${lnTxt(2)} として、小数第1位まで）`, a: `$${A.a}$`, key: `${fmt(2 * tau)}`,
            easy: `$\\frac{1}{4}$ は半分の2回分。$2\\times${tau}\\times0.693${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, 2 * tau * Math.LN2),
          };
        }
        const k = r.pick(['0.1', '0.05', '0.2', '0.02', '0.04', '0.01', '0.025', '0.5']), tau = 1 / +k, N0 = r.pick([100, 200, 500, 80]);
        const A = half20(tau, [1]); if (!A || raku20(tau)) return null;
        return {
          q: `放射性の物質の量 $N$（g）が $${DY('N')}=-${k}N$（$t$ は日）にしたがってへる。はじめ ${U(N0, 'g')} が ${U(N0 / 2, 'g')} になるのは約 □ 日後（${lnTxt(2)} として、小数第1位まで）`, a: `$${A.a}$`, key: `${fmt(tau)}`,
          easy: `$\\tau=\\frac{1}{${k}}=${fmt(tau)}$。$${fmt(tau)}\\times0.693${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, tau * Math.LN2),
        };
      },
      // わな：差が 1/3・1/10（半分でない）→ わざ 6-21（$\ln3$・$\ln10$。1/4 は半分の2回分で、このわざで解けるので出さない）
      trap(r) {
        const n = r.pick([3, 10]), tau = r.pick([10, 30, 15, 25, 40, 12]), Ta = r.pick([20, 25]), Dd = r.pick(n === 3 ? [60, 30, 45, 66, 54] : [60, 50, 70, 40]), T0 = Ta + Dd, T1 = Ta + Dd / n;
        const A = approx(F.mul(fr(tau), D(LN[n])), tau * Math.log(n), [1]); if (!A) return null;
        return dest({
          q: `部屋の温度は ${C(Ta)}。時定数 $${tau}$ 分のお湯が、はじめ ${C(T0)}から ${C(T1)}になるのは約 □ 分後（${lnTxt(n)} として、小数第1位まで）`, a: `$${A.a}$`, key: `t${tau}|${n}`,
          verify: p => isRd(p.a, tau * Math.log(n)),
        }, '6-20', `差は $${Dd}\\to${Dd / n}$ で $\\frac{1}{${n}}$ 倍（半分でない）。$e^{-t/${tau}}=\\frac{1}{${n}}$ から $t=${tau}\\ln${n}\\approx${tau}\\times${LN[n]}${tail(A)}$`, ['6-21']);
      },
    },
  });

  // ================================================================ 6-21
  const raku21 = (tau, n) => (tau === 10 && n === 3) || (tau === 20 && n === 4);   // 左ページの例（O-2）
  M.add({
    id: '6-21', part: 2, chap: '6-4⑤ 例題3', stars: 1,
    title: '「$\\dfrac1n$ になる時刻」は、$e$ の式だけにしてから $\\ln$：$e^{-t/\\tau}=\\dfrac1n$ → $t=\\tau\\ln n$',
    mark: '「□ ℃ になるのは何分後」で、残りの差がはじめの $\\dfrac13$・$\\dfrac14$・$\\dfrac{1}{10}$ になる。',
    futsu: ['$20-15e^{-t/10}=15$ を $15e^{-t/10}=5$ にし、', '両辺の $\\ln$ をとって $\\ln15-\\dfrac{t}{10}=\\ln5$、', '$t=10\\,(\\ln15-\\ln5)$ を計算する'],
    raku: ['$20-15e^{-t/10}=15$ → $15e^{-t/10}=5$', '$e^{-t/10}=\\dfrac13$ → $t=10\\ln3$', '$\\approx10\\times1.099\\approx11$ 分'],
    why: '$\\ln(a+b)$ は $\\ln a+\\ln b$ にならない（5-14）。たし算の数を先に移し、$e$ の前の数でわって、$e^{-t/\\tau}$ だけを残す。$e^{-t/\\tau}=\\dfrac1n$ なら、両辺の $\\ln$ をとって $-\\dfrac{t}{\\tau}=-\\ln n$、$t=\\tau\\ln n$（6-4⑤）。',
    caution: '「残りの差」がはじめの差の何分の1かを先に見る（20℃に近づくお湯が 30℃になるとき、残りは $30-20$）。$\\ln\\dfrac1n=-\\ln n$ なので、マイナスは消える。たし算が残ったまま $\\ln$ をとると、$\\ln(20-15e^{-t/10})$ で先へ進めない。',
    counts: { s1: 6, s2: 2, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '18mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      const s = sq(q);
      return asksTime(s) && (/半分|\\frac\{1\}\{\d+\}|e\^\{-|\\ln(?!2=)/.test(s) || ratioOf(s) != null);
    },
    steps: {
      // 答えの式が出ていて、□ ℃ になる時刻（答えは ln を残した形）
      s1(r) {
        const n = r.pick([3, 4, 5, 10, 6]), tau = r.pick([5, 10, 15, 20, 25, 30, 4, 8]), Ta = r.pick([20, 24, 25, 30, 15]), warm = r.chance(0.4);
        const Dd = n * r.pick([4, 5, 6, 8, 10, 12, 3]), d = warm ? -Dd : Dd, T1 = Ta + d / n, T0 = Ta + d;
        if (raku21(tau, n) || (tau === 10 && Dd === 15) || (tau === 20 && Dd === 20) || T0 > 95 || T0 < 0 || Dd > 75) return null;
        return {
          q: `$T=${near0(Ta, d, eT(tau))}$ が ${C(T1)}になる時刻 $t$`, a: `$${tau}\\ln${n}$`, key: `${tau}|${n}`,
          easy: `$${Math.abs(d)}e^{-t/${tau}}=${Math.abs(d / n)}$、$e^{-t/${tau}}=\\frac{1}{${n}}$`, easyCheck: false,
          verify: p => { const t = numOf(p.a); return near(Ta + d * Math.exp(-t / tau), T1, 1e-9) || `t=${t} で ${T1} にならない`; },
        };
      },
      // ルールとはじめの温度から（ln の値を文に）
      s2(r) {
        const n = r.pick([3, 4, 10]), tau = r.pick([5, 10, 15, 20, 25, 30, 12, 40]), Ta = r.pick([20, 24, 25, 26, 18]), warm = r.chance(0.4);
        const Dd = n * r.pick([4, 5, 6, 2, 3]) * (n === 10 ? 1 : 2), d = warm ? -Dd : Dd, T0 = Ta + d, T1 = Ta + d / n;
        if (raku21(tau, n) || (tau === 10 && Dd === 15) || (tau === 20 && Dd === 20) || T0 > 95 || T0 < 0 || Dd > 75) return null;
        const A = approx(F.mul(fr(tau), D(LN[n])), tau * Math.log(n), [1]); if (!A) return null;
        return {
          q: `${warm ? '冷たい飲み物' : 'お湯'}の温度 $T$ が $${DY('T')}=\\dfrac{${Ta}-T}{${tau}}$（$t$ は分）にしたがう。はじめ ${C(T0)}。${C(T1)}になるのは約 □ 分後（${lnTxt(n)} として、小数第1位まで）`,
          a: `$${A.a}$`, key: `${tau}|${n}`, easyCheck: false,
          easy: `残りの差 $${T1}-${Ta}=${d / n}$ は、はじめの差 $${d}$ の $\\frac{1}{${n}}$。$t=${tau}\\ln${n}\\approx${tau}\\times${LN[n]}${tail(A)}$`,
          verify: p => isRd(p.a, tau * Math.log(n)),
        };
      },
      // 見かけがちがう：RC の充電・放電で 1/10・放射性の物質
      s3(r) {
        const kind = turn(r, '21s3', 3);
        if (kind === 0) {
          const n = r.pick([3, 4]), E = n * r.pick([3, 4, 5]), tau = r.pick([2, 4, 5, 0.5, 10, 3]);
          if (raku21(tau, n)) return null;
          const A = approx(F.mul(D(tau), D(LN[n])), tau * Math.log(n), [2, 1]); if (!A) return null;
          return {
            q: `時定数 $${tau}$ 秒で、${U(E, 'V')} の電池が空のコンデンサーを充電する。電圧が ${U(E - E / n, 'V')} になるのは約 □ 秒後（${lnTxt(n)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: `${tau}|${n}`,
            easy: `残り $${E}-${E - E / n}=${E / n}$ は $\\frac{1}{${n}}$。$${tau}\\times${LN[n]}${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, tau * Math.log(n)),
          };
        }
        if (kind === 1) {
          const tau = r.pick([2, 4, 5, 10, 0.5, 3]), V0 = r.pick([10, 20, 5, 12]);
          const A = approx(F.mul(D(tau), D(LN[10])), tau * Math.log(10), [1]); if (!A) return null;
          return {
            q: `時定数 $${tau}$ 秒の放電で、コンデンサーの電圧が ${U(V0, 'V')} から ${U(V0 / 10, 'V')} になるのは約 □ 秒後（${lnTxt(10)} として、小数第1位まで）`, a: `$${A.a}$`, key: `${tau}|10`,
            easy: `$e^{-t/${tau}}=\\frac{1}{10}$。$${tau}\\times2.30${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, tau * Math.log(10)),
          };
        }
        const k = r.pick(['0.1', '0.2', '0.05', '0.5']), tau = 1 / +k, n = r.pick([3, 4]), N0 = n * r.pick([100, 50, 30]);
        if (raku21(tau, n)) return null;
        const A = approx(F.mul(D(tau), D(LN[n])), tau * Math.log(n), [1]); if (!A) return null;
        return {
          q: `放射性の物質の量 $N$（g）が $${DY('N')}=-${k}N$（$t$ は日）にしたがってへる。はじめ ${U(N0, 'g')} が ${U(N0 / n, 'g')} になるのは約 □ 日後（${lnTxt(n)} として、小数第1位まで）`, a: `$${A.a}$`, key: `${fmt(tau)}|${n}`,
          easy: `$e^{-${k}t}=\\frac{1}{${n}}$、$t=\\frac{\\ln${n}}{${k}}\\approx${fmt(tau)}\\times${LN[n]}${tail(A)}$`, easyCheck: false, verify: p => isRd(p.a, tau * Math.log(n)),
        };
      },
      // わな：時刻を求めるのではなく、決まった時刻（τ の整数倍）の温度 → わざ 6-22
      trap(r) {
        const tau = r.pick([10, 20, 15, 25, 30]), Ta = r.pick([20, 25]), Dd = r.pick([60, 50, 40, 70]), k = r.pick([1, 2, 3]), T0 = Ta + Dd;
        if (T0 > 95) return null;
        const A = approx(F.add(fr(Ta), F.mul(fr(Dd), D(EXP[k]))), Ta + Dd * Math.exp(-k), [1]); if (!A) return null;
        return dest({
          q: `部屋の温度は ${C(Ta)}。時定数 $${tau}$ 分のお湯（はじめ ${C(T0)}）の、$${k * tau}$ 分後の温度は約 □ ℃（${eTxt(k)} として、小数第1位まで）`, a: `$${A.a}$`, key: `t${tau}|${k}`,
          verify: p => isRd(p.a, Ta + Dd * Math.exp(-k)),
        }, '6-21', `時刻を求めるのではなく、決まった時刻の温度。$${k * tau}$ 分は $${k === 1 ? '' : k}\\tau$ なので、差は $e^{-${k}}$ 倍：$${Ta}+${Dd}\\times${EXP[k]}${tail(A)}$`, ['6-22']);
      },
    },
  });

  // ================================================================ 6-22
  const raku22 = (tau, amp) => +tau === 2 || (+tau === 20 && amp === 60);   // 左ページの例（RC=2 秒で6秒後＝3τ、τ=20 分・差 60℃。O-2）。RC=2 秒は電圧によらず出さない
  const PCT = { 1: '36.8', 2: '13.5', 3: '5.0', 5: '0.7' };
  // 図（ステップ3）：曲線と、τ・3τ・5τ の目もりと点線、最後の値の点線。たての目もりは最後の値（と、はじめの値）だけ
  function fig22(f, tau, yTop, yt, ylab, fin) {
    const G = M.graph({ x0: 0, x1: 5.8 * tau, y0: 0, y1: 1.18 * yTop, w: 8.4, h: 4.4 });
    const items = [
      // 目もりの τ は Unicode の字で書く（アプリの図の字（figText）が \tau を知らず「tau」と出るため。本の TikZ では τ も同じに出る）
      ...G.axes({ xt: [tau, 3 * tau, 5 * tau], xfmt: t => (Math.abs(t - tau) < 1e-9 ? '$τ$' : `$${Math.round(t / tau)}τ$`), yt, x: 't', y: ylab }),
      ['seg', G.T(0, fin), G.T(5.8 * tau, fin), { dash: true }],
      ...[1, 3, 5].map(k => ['seg', G.T(k * tau, 0), G.T(k * tau, f(k * tau)), { dash: true }]),
      ...G.plot(f, 0, 5.8 * tau, { n: 90, thick: true }),
    ];
    return { s: 5, items };
  }
  M.add({
    id: '6-22', part: 2, chap: '6-4⑤ 例題7・6-15④ 例題5', stars: 1,
    title: '$\\tau$ の何倍かを先に見る：$\\tau$ で差は36.8%（63%とどく）、$3\\tau$ で5%（95%）、$5\\tau$ で0.7%（99.3%）',
    mark: '時刻が、時定数のちょうど整数倍。「時定数 2 秒の充電で、6 秒後の電圧」。',
    futsu: ['$V=10\\,(1-e^{-t/2})$ に $t=6$ を入れ、', '$e^{-6/2}$ を計算する'],
    raku: ['6 秒は $3\\tau$（$\\tau=2$ 秒）', '残りの差は $e^{-3}$ で5%', '$10\\times(1-0.050)=9.5$ V'],
    why: '目標までの残りの差は $e^{-t/\\tau}$ 倍（6-4⑤）。$t$ が $\\tau$ の $k$ 倍なら $e^{-k}$ 倍で、$\\tau$ や $\\ln$ の計算はいらない。$e^{-1}=0.368$、$e^{-3}=0.050$、$e^{-5}=0.007$ を覚えておくと、「$3\\tau$ で95%、$5\\tau$ でほぼ終わり」がすぐわかる。',
    caution: '$e^{-k}$ は「残りの差」の割合。充電の電圧は $E\\times(1-e^{-k})$、冷めるお湯の温度は「部屋の温度＋差×$e^{-k}$」。$\\tau$ たっても目標には届かない（63%だけ）。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      const s = sq(q);
      if (/時定数(?:は)?(?:\\tau=)?[\d.]+(秒|分)/.test(s) && /ほぼ終わる|5%に/.test(s)) return true;   // 差が5%になる時刻は 3τ
      if (asksTime(s)) return false;
      const m = /時定数(?:は)?([\d.]+)(秒|分|ms)/.exec(s) || /\\tau=([\d.]+)(秒|分|ms)/.exec(s), t = /([\d.]+)(秒|分|ms)後(?:の|は|には)/.exec(s);
      if (/([1-5]?)\\tau(のとき|たった|後)/.test(s)) return true;
      if (!m || !t || m[2] !== t[2]) return false;
      const k = +t[1] / +m[1];
      return [1, 2, 3, 5].includes(k);
    },
    steps: {
      // 充電・放電の電圧（τ と時刻が文にある）
      s1(r) {
        const tau = r.pick([2, 4, 5, 10, 0.5, 3, 1]), k = r.pick([1, 2, 3, 5]), E = r.pick([10, 12, 6, 5, 9, 20]), dis = turn(r, '22s1', 2) === 1;
        if (raku22(tau, E)) return null;
        const f = dis ? F.mul(fr(E), D(EXP[k])) : F.mul(fr(E), F.sub(fr(1), D(EXP[k]))), v = dis ? E * Math.exp(-k) : E * (1 - Math.exp(-k)), A = approx(f, v, 'auto');
        if (!A) return null;
        return {
          q: dis ? `時定数 $${tau}$ 秒の放電で、${U(E, 'V')} からへるコンデンサーの電圧。$${fmt(k * tau)}$ 秒後は約 □ V（${eTxt(k)} として、${keta(A.k)}）`
            : `時定数 $${tau}$ 秒で、${U(E, 'V')} の電池が空のコンデンサーを充電する。$${fmt(k * tau)}$ 秒後の電圧は約 □ V（${eTxt(k)} として、${keta(A.k)}）`,
          a: `$${A.a}$`, key: `${tau}|${k}`, easyCheck: false,
          easy: `$${fmt(k * tau)}$ 秒は $${k === 1 ? '' : k}\\tau$。${dis ? `$${E}\\times${EXP[k]}${tail(A)}$` : `$${E}\\times(1-${EXP[k]})${tail(A)}$`}`,
          verify: p => isRd(p.a, dis ? walk((t, y) => -y / tau, E, k * tau, 2000) : walk((t, y) => (E - y) / tau, 0, k * tau, 2000)),
        };
      },
      // 冷めるお湯の温度・目標までに進んだ割合
      s2(r) {
        const tau = r.pick([10, 15, 20, 25, 30, 5, 8]), k = r.pick([1, 2, 3, 5]);
        if (turn(r, '22s2', 2) === 0) {
          const Ta = r.pick([20, 25, 15, 18]), Dd = r.pick([60, 50, 40, 70, 64]), T0 = Ta + Dd;
          if (T0 > 95 || raku22(tau, Dd)) return null;
          const A = approx(F.add(fr(Ta), F.mul(fr(Dd), D(EXP[k]))), Ta + Dd * Math.exp(-k), [1]); if (!A) return null;
          return {
            q: `部屋の温度は ${C(Ta)}。時定数 $${tau}$ 分で冷めるお湯（はじめ ${C(T0)}）の、$${k * tau}$ 分後の温度は約 □ ℃（${eTxt(k)} として、小数第1位まで）`,
            a: `$${A.a}$`, key: `${tau}|${k}`, easyCheck: false, easy: `$${k === 1 ? '' : k}\\tau$。差 $${Dd}\\times${EXP[k]}$、$${Ta}+${Dd}\\times${EXP[k]}${tail(A)}$`,
            verify: p => isRd(p.a, walk((t, y) => (Ta - y) / tau, T0, k * tau, 2000)),
          };
        }
        const f = F.mul(fr(100), F.sub(fr(1), D(EXP[k]))), A = approx(f, 100 * (1 - Math.exp(-k)), [1]); if (!A) return null;
        return {
          q: `時定数 $${tau}$ 秒の充電で、$${k * tau}$ 秒後には、目標（電池の電圧）までの約 □ % まで進んでいる（${eTxt(k)} として、小数第1位まで）`,
          a: `$${A.a}$`, key: `${tau}|${k}`, easyCheck: false, easy: `$${k === 1 ? '' : k}\\tau$。残りは $${EXP[k]}$（${PCT[k]}%）なので $100-${PCT[k]}${tail(A)}$`,
          verify: p => isRd(p.a, 100 * (1 - Math.exp(-k))),
        };
      },
      // 見かけがちがう：グラフの図（τ・3τ・5τ の目もり）。充電・放電・冷めるお湯（差が5%になる時刻）
      s3(r) {
        const kind = turn(r, '22s3', 3);
        if (kind < 2) {
          const tau = r.pick([2, 4, 5, 10, 3]), k = r.pick([1, 3, 5]), E = r.pick([10, 12, 6, 9, 20]), dis = kind === 1;
          if (raku22(tau, E)) return null;
          const f = dis ? F.mul(fr(E), D(EXP[k])) : F.mul(fr(E), F.sub(fr(1), D(EXP[k]))), v = dis ? E * Math.exp(-k) : E * (1 - Math.exp(-k)), A = approx(f, v, 'auto');
          if (!A) return null;
          const fn = dis ? t => E * Math.exp(-t / tau) : t => E * (1 - Math.exp(-t / tau));
          return {
            q: dis ? `図は、${U(E, 'V')} までためたコンデンサーの放電の電圧 $V$ のグラフ（時定数 $\\tau=${tau}$ 秒）。$${fmt(k * tau)}$ 秒後の電圧は約 □ V（${eTxt(k)} として、${keta(A.k)}）`
              : `図は、${U(E, 'V')} の電池で空のコンデンサーを充電したときの電圧 $V$ のグラフ（時定数 $\\tau=${tau}$ 秒）。$${fmt(k * tau)}$ 秒後の電圧は約 □ V（${eTxt(k)} として、${keta(A.k)}）`,
            a: `$${A.a}$`, key: `${tau}|${k}`, easyCheck: false, fig: fig22(fn, tau, E, [E], 'V', dis ? 0 : E),
            easy: `$${fmt(k * tau)}$ 秒は $${k === 1 ? '' : k}\\tau$。${dis ? `$${E}\\times${EXP[k]}${tail(A)}$` : `$${E}\\times(1-${EXP[k]})${tail(A)}$`}`,
            verify: p => isRd(p.a, fn(k * tau)),
          };
        }
        const tau = r.pick([10, 15, 20, 25, 30, 8]), Ta = r.pick([20, 25]), Dd = r.pick([60, 50, 40, 70]), T0 = Ta + Dd;
        if (T0 > 95 || raku22(tau, Dd)) return null;
        const fn = t => Ta + Dd * Math.exp(-t / tau);
        return {
          q: `図は、部屋の温度 ${C(Ta)}で冷めるお湯の温度 $T$ のグラフ（はじめ ${C(T0)}、時定数 $\\tau=${tau}$ 分）。部屋との差がはじめの5%になる（ほぼ終わる）のは □ 分後（${eTxt(3)}）`,
          a: `$${3 * tau}$`, key: `${tau}|3`, easyCheck: false, fig: fig22(fn, tau, T0, [Ta, T0], 'T', Ta),
          easy: `$e^{-3}=0.050$ なので、5%は $3\\tau=3\\times${tau}=${3 * tau}$`,
          verify: p => { const t = numOf(p.a); return (Math.abs((fn(t) - Ta) / Dd - 0.05) < 0.0003) || `t=${t} で差が5%にならない`; },
        };
      },
      // わな：半分になる時刻（τ の整数倍でない）→ わざ 6-20
      trap(r) {
        const tau = r.pick([4, 5, 10, 3, 6, 8]), E = r.pick([10, 12, 6, 8, 20]);   // RC=2 秒（左ページの例）はさける
        const A = approx(F.mul(fr(tau), D(LN[2])), tau * Math.LN2, [1]); if (!A) return null;
        return dest({
          q: `時定数 $${tau}$ 秒で、${U(E, 'V')} の電池が空のコンデンサーを充電する。電圧が ${U(E / 2, 'V')}（半分）になるのは約 □ 秒後（${lnTxt(2)} として、小数第1位まで）`, a: `$${A.a}$`, key: `t${tau}`,
          verify: p => isRd(p.a, tau * Math.LN2),
        }, '6-22', `時刻が答えで、$\\tau$ の整数倍ではない。残りが半分なので $${tau}\\ln2\\approx${tau}\\times0.693${tail(A)}$`, ['6-20']);
      },
    },
  });

  // ================================================================ 6-23
  // 差の割合 n（はじめ÷あと）と時間 t。答えは t÷ln n
  const raku23 = (t, n) => (+t === 12 && n === 4) || (+t === 30 && n === 4) || (+t === 6 && n === 2) || (+t === 15 && n === 2);   // 左ページの例（O-2）。t÷ln4 は (t÷2)÷ln2 と同じ τ なので、それもよける（第40回 R1-22）
  const key23 = (t, n) => (n === 4 ? `${fmt(+t / 2)}|2` : `${t}|${n}`);   // 同じ τ を同じ key に（ln4=2ln2）
  const tau23 = (t, n, ks) => approx(F.div(D(t), D(LN[n])), +t / Math.log(n), ks || [1]);
  // 確かめ：答えの τ で e^{-t/τ} を計算すると、はかった割合 1/n になるか
  const tau23OK = (ans, t, n) => { let lo = 1e-6, hi = 1e6; for (let k = 0; k < 200; k++) { const m = Math.sqrt(lo * hi); if (Math.exp(-t / m) * n < 1) lo = m; else hi = m; } return isRd(ans, Math.sqrt(lo * hi)); };   // e^{-t/τ}=1/n を、τ をはさみうちして解いた値とくらべる
  M.add({
    id: '6-23', part: 2, chap: '6-4⑤ 例題10', stars: 1,
    title: 'はかった2つの値から時定数：$\\tau=\\dfrac{t}{\\ln(\\text{はじめ}\\div\\text{あと})}$',
    mark: '「差がはじめ □ ℃、□ 分後に □ ℃」と、時定数を聞かれる。',
    futsu: ['$40e^{-12/\\tau}=10$ を作り、', '両辺の $\\ln$ をとって $\\tau$ について解く'],
    raku: ['$\\dfrac{40}{10}=4$ 倍にへった', '$\\tau=\\dfrac{12}{\\ln4}=\\dfrac{12}{1.386}$', '$\\approx8.7$ 分'],
    why: '差は $e^{-t/\\tau}$ 倍になるので、はじめ÷あと $=e^{t/\\tau}$。両辺の $\\ln$ をとると $\\ln(\\text{はじめ}\\div\\text{あと})=\\dfrac{t}{\\tau}$ で、$\\tau=\\dfrac{t}{\\ln(\\text{はじめ}\\div\\text{あと})}$（6-4⑤）。',
    caution: '温度そのものではなく、部屋との差でわる（はじめ 60℃、部屋 20℃なら差は 40℃）。わる向きは「はじめ÷あと」（1より大きい数）。半分なら $\\ln2$、$\\dfrac14$ なら $\\ln4$。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { const s = sq(q); return /後に/.test(s) && /(時定数|抵抗)は約?□/.test(s); },
    steps: {
      s1(r) {
        const n = r.pick([2, 4, 10, 3]), t = r.pick([5, 6, 8, 10, 12, 15, 20, 30, 9]), D1 = r.pick([5, 6, 8, 10, 12, 15]), D0 = D1 * n;
        if (raku23(t, n) || D0 > 75) return null;
        const A = tau23(t, n); if (!A) return null;
        return {
          q: `部屋との温度の差が、はじめ ${C(D0)}、$${t}$ 分後に ${C(D1)}だった。時定数は約 □ 分（${lnTxt(n)} として、小数第1位まで）`, a: `$${A.a}$`, key: key23(t, n), easyCheck: false,
          easy: `$\\frac{${D0}}{${D1}}=${n}$。$\\tau=\\frac{${t}}{\\ln${n}}\\approx\\frac{${t}}{${LN[n]}}${tail(A)}$`, verify: p => tau23OK(p.a, t, n),
        };
      },
      // 温度から差を出す（冷める・温まる）
      s2(r) {
        const n = r.pick([2, 4, 3, 10]), t = r.pick([5, 6, 8, 10, 12, 15, 20, 30, 9]), Ta = r.pick([20, 25, 18, 24]), warm = r.chance(0.35), D1 = r.pick([4, 5, 6, 8, 10, 15]) * (warm ? 1 : 1), Dd = D1 * n;
        if (raku23(t, n) || Dd > 75 || (warm && Dd > Ta)) return null;
        const T0 = warm ? Ta - Dd : Ta + Dd, T1 = warm ? Ta - D1 : Ta + D1;
        const A = tau23(t, n); if (!A) return null;
        return {
          q: `部屋の温度は ${C(Ta)}。${warm ? '麦茶' : 'お湯'}の温度が、はじめ ${C(T0)}、$${t}$ 分後に ${C(T1)}だった。時定数は約 □ 分（${lnTxt(n)} として、小数第1位まで）`, a: `$${A.a}$`, key: key23(t, n), easyCheck: false,
          easy: `差は $${Dd}\\to${D1}$ で $\\frac{1}{${n}}$。$\\frac{${t}}{${LN[n]}}${tail(A)}$`, verify: p => tau23OK(p.a, t, n),
        };
      },
      // 見かけがちがう：放電の電圧から時定数・抵抗、半分になる時間から時定数
      s3(r) {
        const kind = turn(r, '23s3', 3);
        // 数をさがしなおすときも同じ形のなかで（形が回って、同じ形が2問にならないように。回数に上限）
        if (kind === 0) {
          let n, t, V1, V0, A = null;
          for (let k = 0; k < 30 && !A; k++) { n = r.pick([2, 4, 10]); t = r.pick([1, 2, 3, 5, 6, 0.5]); V1 = r.pick([1, 2, 3, 2.5, 1.5]); V0 = V1 * n; if (V0 <= 30 && !raku23(t, n)) A = tau23(t, n, [2, 1]); }
          if (!A) return null;
          return {
            q: `コンデンサーの放電で、電圧がはじめ ${U(fmt(V0), 'V')}、$${t}$ 秒後に ${U(fmt(V1), 'V')} だった。時定数は約 □ 秒（${lnTxt(n)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: key23(t, n), easyCheck: false,
            easy: `$\\frac{${fmt(V0)}}{${fmt(V1)}}=${n}$。$\\frac{${t}}{${LN[n]}}${tail(A)}$`, verify: p => tau23OK(p.a, t, n),
          };
        }
        if (kind === 1) {
          let n, t, Cc, V0, want, A = null;
          for (let k = 0; k < 30 && !A; k++) {
            n = r.pick([2, 4]); t = r.pick([3, 6, 9, 12]); Cc = r.pick([100, 50, 200]); V0 = r.pick([8, 12, 16]);
            if (raku23(t, n)) continue;   // RC が左ページの例の τ（12÷ln4）と同じ数になる組はよける
            want = t * 1000 / (Math.log(n) * Cc); A = approx(F.div(F.mul(D(t), fr(1000)), F.mul(D(LN[n]), fr(Cc))), want, [1]);
          }
          if (!A) return null;
          return {
            q: `${U(Cc, '\\mu F')} のコンデンサーを抵抗で放電すると、電圧がはじめ ${U(V0, 'V')}、$${t}$ 秒後に ${U(fmt(V0 / n), 'V')} だった。抵抗は約 $□\\,\\mathrm{k\\Omega}$（${lnTxt(n)} として、小数第1位まで）`, a: `$${A.a}$`, key: `R${A.a}`, easyCheck: false,
            easy: `$RC=\\frac{${t}}{${LN[n]}}$ 秒。$R=\\frac{${t}}{${LN[n]}\\times${fmt(Cc / 1e6)}}\\,\\mathrm{\\Omega}${tail(A)}\\,\\mathrm{k\\Omega}$`, verify: p => isRd(p.a, want),
          };
        }
        let th, A = null;
        for (let k = 0; k < 30 && !A; k++) { const tau = r.pick([5, 10, 30, 40, 8]); th = roundStr(F.mul(fr(tau), D(LN[2])), 1); A = tau23(th, 2); }
        if (!A) return null;
        return {
          q: `部屋との温度の差が、はじめ ${C(60)}、$${th}$ 分後に ${C(30)}だった。時定数は約 □ 分（${lnTxt(2)} として、小数第1位まで）`, a: `$${A.a}$`, key: `${th}|2`, easyCheck: false,
          easy: `半分になる時間が $${th}$ 分。$\\tau=\\frac{${th}}{0.693}${tail(A)}$`, verify: p => tau23OK(p.a, +th, 2),
        };
      },
      // わな：同じ時間がもう一度たったときの差（時定数はいらない）→ わざ 6-16
      trap(r) {
        const D0 = r.pick([60, 40, 80, 50, 64]), rr = r.pick(['half', '0.25', '0.8', '0.6']), t = r.pick([10, 20, 15, 6]);
        const D1 = F.mul(fr(D0), rF(rr)), D2 = decStr(F.mul(D1, rF(rr))), d1 = decStr(D1);
        if (!D2 || decLen(D2) > 2 || decLen(d1) > 1) return null;
        return dest({
          q: `部屋との温度の差が、${C(D0)}から $${t}$ 分で ${C(d1)}になった。さらに $${t}$ 分後の差は □ ℃`, a: `$${D2}$`, key: `t${D0}|${rr}`,
          verify: p => isNum(p.a, +d1 * (+d1 / D0), 1e-9),
        }, '6-23', `時定数を出さなくても、同じ $${t}$ 分でもう一度 $\\frac{${d1}}{${D0}}$ 倍：$${d1}\\times\\frac{${d1}}{${D0}}=${D2}$`, ['6-16']);
      },
    },
  });

  // ================================================================ 6-24
  const raku24 = (P, Cc, R) => P === 20 && Cc === 5 && R === 18;   // 左ページの例（はんだごて。O-2）
  // 熱の式 C T' = P − (T−Ta)/R を数でたどる（確かめ用）
  const heat = (P, Cc, R, Ta, t) => walk((s, T) => (P - (T - Ta) / R) / Cc, Ta, t, 2000);
  M.add({
    id: '6-24', part: 2, chap: '6-4⑥ 例題5', stars: 1,
    title: '熱：最後の温度 $T_{\\mathrm a}+PR_{\\mathrm{th}}$、時定数 $C_{\\mathrm{th}}R_{\\mathrm{th}}$（J/K×K/W＝秒）',
    mark: '電力 $P$・熱容量 $C_{\\mathrm{th}}$・熱抵抗 $R_{\\mathrm{th}}$・部屋の温度 $T_{\\mathrm a}$。「最後の温度」「時定数」。',
    futsu: ['$C_{\\mathrm{th}}\\dfrac{\\dd T}{\\dd t}=P-\\dfrac{T-T_{\\mathrm a}}{R_{\\mathrm{th}}}$ を立て、', '目標へ近づく形に変形して解く'],
    raku: ['はんだごて 20 W、$5\\,\\mathrm{J/K}$、$18\\,\\mathrm{K/W}$', '最後 $20+20\\times18=380$℃', '$\\tau=5\\times18=90$ 秒'],
    why: '最後には温度が変わらず、入る熱 $P$ と逃げる熱 $\\dfrac{T-T_{\\mathrm a}}{R_{\\mathrm{th}}}$ がつり合う：$T=T_{\\mathrm a}+PR_{\\mathrm{th}}$。式を目標へ近づく形にすると、分母が $C_{\\mathrm{th}}R_{\\mathrm{th}}$ になる（6-4⑥）。単位は $\\dfrac{\\mathrm J}{\\mathrm K}\\times\\dfrac{\\mathrm K}{\\mathrm W}=\\dfrac{\\mathrm J}{\\mathrm J/\\mathrm s}=$ 秒。',
    caution: '最後の温度は「部屋の温度＋$PR_{\\mathrm{th}}$」（$PR_{\\mathrm{th}}$ だけではない）。最後の温度に熱容量は入らない（$C_{\\mathrm{th}}$ は時定数だけを決める）。時定数の単位は秒なので、分にするなら60でわる。',
    counts: { s1: 5, s2: 4, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { const s = sq(q); return (/熱抵抗|R_\{\\mathrm\{th\}\}/.test(s) || /[\d.]+\\frac\{\\ddT\}\{\\ddt\}=[\d.]+-\\frac\{T-[\d.]+\}\{[\d.]+\}/.test(s)) && !/にした式|の係数/.test(s); },
    steps: {
      // 最後の温度
      s1(r) {
        const [P, R] = r.pick([[10, 5], [20, 4], [50, 0.8], [100, 0.5], [5, 10], [40, 2], [20, 10], [30, 3], [50, 2], [8, 25], [100, 0.1], [60, 1.5]]), Ta = r.pick([20, 25, 15]);
        const Tf = decStr(F.add(fr(Ta), F.mul(fr(P), D(R))));
        return {
          q: `電力 ${U(P, 'W')} のヒーターで温める物がある。まわりへの熱抵抗は ${U(R, 'K/W')}、部屋の温度は ${C(Ta)}。最後の温度は □ ℃`, a: `$${Tf}$`, key: `f${P}|${R}|${Ta}`, easyCheck: false,
          easy: `$${Ta}+${P}\\times${R}=${Tf}$`, verify: p => isNum(p.a, heat(P, 1, R, Ta, 60 * R), 1e-6),
        };
      },
      // 時定数（秒・分）
      s2(r) {
        const [Cc, R] = r.pick([[10, 5], [100, 0.8], [50, 2], [200, 1.5], [1000, 1.2], [1500, 0.5], [900, 2], [4, 25], [20, 3], [400, 0.5], [600, 3], [2400, 0.5]]);
        if (raku24(20, Cc, R)) return null;
        const tau = F.mul(fr(Cc), D(R)), ts = decStr(tau), min = F.val(tau) % 60 === 0 && F.val(tau) >= 600;
        return {
          q: `熱容量 ${U(Cc, 'J/K')}、まわりへの熱抵抗 ${U(R, 'K/W')} の物の時定数は □ ${min ? '分' : '秒'}`, a: `$${min ? F.val(tau) / 60 : ts}$`, key: `c${ts}`, easyCheck: false,
          easy: `$${Cc}\\times${R}=${ts}$ 秒${min ? `$=${F.val(tau) / 60}$ 分` : ''}`,
          verify: p => { const T = numOf(p.a) * (min ? 60 : 1); return near((heat(1, Cc, R, 0, T)) / R, 1 - Math.exp(-1), 1e-6) || `時定数 ${p.a} がちがう`; },
        };
      },
      // 見かけがちがう：τ の整数倍の時刻の温度・式から最後の温度・水そうの時定数を時間で
      s3(r) {
        const kind = turn(r, '24s3', 3);
        if (kind === 0) {
          const [P, Cc, R] = r.pick([[50, 100, 0.8], [10, 4, 25], [20, 10, 5], [100, 200, 0.5], [40, 50, 2], [30, 20, 4]]), Ta = r.pick([20, 25]), k = r.pick([1, 2]);
          const tau = Cc * R, Tf = Ta + P * R, A = approx(F.sub(fr(Tf), F.mul(fr(P * R), D(EXP[k]))), Tf - P * R * Math.exp(-k), [1]);
          if (!A) return null;
          return {
            q: `電力 ${U(P, 'W')}、熱容量 ${U(Cc, 'J/K')}、熱抵抗 ${U(R, 'K/W')} の電子部品。部屋もはじめも ${C(Ta)}。電源を入れて $${k * tau}$ 秒後の温度は約 □ ℃（${eTxt(k)} として、小数第1位まで）`,
            a: `$${A.a}$`, key: `d${P}|${Cc}|${R}`, easyCheck: false,
            easy: `最後 $${Ta}+${P}\\times${R}=${Tf}$、$\\tau=${tau}$ 秒、$${k * tau}$ 秒は $${k === 1 ? '' : k}\\tau$。$${Tf}-${P * R}\\times${EXP[k]}${tail(A)}$`,
            verify: p => isRd(p.a, heat(P, Cc, R, Ta, k * tau)),
          };
        }
        if (kind === 1) {
          const [P, Cc, R] = r.pick([[20, 10, 5], [50, 100, 1.2], [10, 5, 6], [40, 200, 1.5], [25, 50, 4]]), Ta = r.pick([20, 25, 15]);
          const Tf = decStr(F.add(fr(Ta), F.mul(fr(P), D(R))));
          return {
            q: `$${Cc}${DY('T')}=${P}-\\dfrac{T-${Ta}}{${R}}$（たまる熱＝入る熱－逃げる熱）で温まる物の、最後の温度は □ ℃`, a: `$${Tf}$`, key: `d${P}|${Cc}|${R}`, easyCheck: false,
            easy: `$${DY('T')}=0$ とおく：$${P}=\\frac{T-${Ta}}{${R}}$、$T=${Ta}+${P}\\times${R}=${Tf}$`, verify: p => isNum(p.a, heat(P, Cc, R, Ta, 60 * Cc * R), 1e-6),
          };
        }
        const [L, R] = r.pick([[60, 0.1], [40, 0.15], [100, 0.05], [30, 0.2], [50, 0.12]]), Cc = 4200 * L, tau = Cc * R, h = F.div(F.mul(fr(Cc), D(R)), fr(3600)), hs = roundStr(h, 1);
        return {
          q: `$${L}$ L の水そう（熱容量 ${U(Cc, 'J/K')}）の、まわりへの熱抵抗は ${U(R, 'K/W')}。時定数は約 □ 時間（小数第1位まで）`, a: `$${hs}$`, key: `w${L}|${R}`, easyCheck: false,
          easy: `$${Cc}\\times${R}=${fmt(tau)}$ 秒、$${fmt(tau)}\\div3600\\approx${hs}$ 時間`, verify: p => isRd(p.a, tau / 3600),
        };
      },
      // わな：熱が逃げない（熱抵抗がない）→ わざ 6-14（一定の速さで上がる）
      trap(r) {
        const [L, P, dT] = r.pick([[1, 1200, 80], [1, 1400, 60], [2, 1400, 50], [1, 1000, 50], [2, 1200, 50], [1, 800, 40], [0.5, 700, 80]]), Cc = 4200 * L, T0 = r.pick([20, 15, 10]);
        const t = decStr(F.div(fr(Cc * dT), fr(P)));
        if (!t || decLen(t) > 1) return null;
        return dest({
          q: `$${L}$ L の水（熱容量 ${U(Cc, 'J/K')}）を、${U(P, 'W')} のヒーターで温める。熱は逃げないとする。${C(T0)}から ${C(T0 + dT)}になるのは □ 秒後`, a: `$${t}$`, key: `t${L}|${P}|${dT}`,
          verify: p => { const T = numOf(p.a); return near(walk(() => P / Cc, T0, T, 10), T0 + dT, 1e-9) || `${p.a} 秒では ${T0 + dT} ℃ にならない`; },
        }, '6-24', `熱抵抗がない（逃げる熱が0）ので、目標へ近づく形ではなく、1秒に $\\frac{${P}}{${Cc}}$℃ずつ上がり続ける。$${dT}\\times\\frac{${Cc}}{${P}}=${t}$`, ['6-14']);
      },
    },
  });

  // ================================================================ 6-25
  // [R（kΩ）, C（μF）]。RC=R×C÷1000 秒
  const RC25 = [[10, 100], [50, 20], [100, 10], [1, 1000], [5, 200], [20, 50], [50, 100], [100, 50], [10, 500], [40, 100], [20, 200], [100, 100], [50, 200], [2, 500], [5, 100], [10, 50], [1, 500], [100, 20], [50, 40], [25, 40], [4, 250]];
  const raku25 = (R, Cc) => (R === 20 && Cc === 100) || (R === 100 && Cc === 20);   // 左ページの例（O-2）と、それを入れかえた組（20×100 のかけ算が同じ。N-2・第40回 R1-8）
  const key25 = (R, Cc) => `${Math.min(R, Cc)}|${Math.max(R, Cc)}`;   // 入れかえた組は同じ問題とみる
  const rcOf = (R, Cc) => R * Cc / 1000;
  const parts25 = (E, R, Cc) => `${U(E, 'V')} の電池、${U(R, 'k\\Omega')} の抵抗、${U(Cc, '\\mu F')} の空のコンデンサーを直列につなぎ、スイッチを入れる。`;
  M.add({
    id: '6-25', part: 2, chap: '6-4⑦ 例題6・7・8', stars: 1,
    title: 'RC：放電 $V_0e^{-t/RC}$、充電 $E\\,(1-e^{-t/RC})$、スイッチを入れた直後の電流 $\\dfrac ER$（$C$・$R$ を変えると $\\tau$ だけが変わる）',
    mark: '電池・抵抗・コンデンサーと「□ 秒後の電圧」「直後の電流」。$\\mathrm{k}$ と $\\mathrm{\\mu}$ は数に直してから。',
    futsu: ['$C\\dfrac{\\dd V}{\\dd t}=-\\dfrac{V}{R}$ を立てて変数分離し、', '$V=Ae^{-t/RC}$ の $A$ をはじめの電圧で決める'],
    raku: ['$20\\,\\mathrm{k\\Omega}$・$100\\,\\mathrm{\\mu F}$ → $\\tau=20000\\times0.0001=2$ 秒', '放電 $10\\,\\mathrm{V}$：2 秒後 $10e^{-1}\\approx3.7\\,\\mathrm{V}$', '充電：直後の電流 $\\dfrac{10}{20000}\\,\\mathrm{A}=0.5\\,\\mathrm{mA}$'],
    why: '放電は「自分に比例してへる」形で $y_\\infty=0$、充電は目標 $E$ へ近づく形で、どちらも $\\tau=RC$（6-4⑦）。スイッチを入れた直後はコンデンサーの電圧が0なので、電池の電圧が全部抵抗にかかり、電流は $\\dfrac ER$。$C$ や $R$ を変えても、最後の電圧（$E$ か0）は変わらない。',
    caution: '$\\mathrm{k}$ は1000倍、$\\mathrm{\\mu}$ は100万分の1倍。$\\mathrm{k\\Omega}\\times\\mathrm{\\mu F}$ は「数どうしをかけて1000でわると秒」（$20\\times100\\div1000=2$）。$\\mathrm{k\\Omega}$ でわった電流は $\\mathrm{mA}$（$\\dfrac{10\\,\\mathrm V}{20\\,\\mathrm{k\\Omega}}=0.5\\,\\mathrm{mA}$）。',
    counts: { s1: 4, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { const s = sq(q); return /コンデンサー/.test(s) && /\\mathrm\{k(?:\\Omega|Ω)\}|抵抗/.test(s) && /\\mathrm\{(?:\\mu|μ)F\}/.test(s) && !/コイル/.test(s) && !/後に/.test(s); },
    steps: {
      // 放電：時定数か、τ の整数倍の時刻の電圧
      s1(r) {
        const [R, Cc] = r.pick(RC25), tau = rcOf(R, Cc), V0 = r.pick([10, 12, 6, 9, 5, 20]);
        if (raku25(R, Cc)) return null;
        const head = `${U(V0, 'V')} までためた ${U(Cc, '\\mu F')} のコンデンサーを、${U(R, 'k\\Omega')} の抵抗につなぐ。`;
        if (turn(r, '25s1', 2) === 0) return { q: `${head}時定数は □ 秒`, a: `$${fmt(tau)}$`, key: key25(R, Cc), easyCheck: false, easy: `$${R * 1000}\\times${fmt(Cc / 1e6)}=${fmt(tau)}$`, verify: p => isNum(p.a, (R * 1e3) * (Cc * 1e-6), 1e-9) };
        const k = r.pick([1, 2, 3]), A = approx(F.mul(fr(V0), D(EXP[k])), V0 * Math.exp(-k), 'auto'); if (!A) return null;
        return {
          q: `${head}$${fmt(k * tau)}$ 秒後の電圧は約 □ V（${eTxt(k)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: key25(R, Cc), easyCheck: false,
          easy: `$\\tau=${fmt(tau)}$ 秒、$${fmt(k * tau)}$ 秒は $${k === 1 ? '' : k}\\tau$。$${V0}\\times${EXP[k]}${tail(A)}$`, verify: p => isRd(p.a, walk((t, y) => -y / (R * 1e3 * Cc * 1e-6), V0, k * tau, 2000)),
        };
      },
      // 充電：直後の電流か、τ の整数倍の時刻の電圧
      s2(r) {
        const [R, Cc] = r.pick(RC25), tau = rcOf(R, Cc), E = r.pick([10, 12, 6, 9, 5, 20]);
        if (raku25(R, Cc)) return null;
        if (turn(r, '25s2', 2) === 0) {
          const I = decStr(F.div(fr(E), fr(R)));
          if (!I || decLen(I) > 3) return null;
          return { q: `${parts25(E, R, Cc)}直後の電流は □ mA`, a: `$${I}$`, key: key25(R, Cc), easyCheck: false, easy: `はじめコンデンサーは $0$ V なので、$\\frac{${E}}{${R}}=${I}$ mA`, verify: p => isNum(p.a, (E / (R * 1e3)) * 1e3, 1e-9) };
        }
        const k = r.pick([1, 2, 3]), A = approx(F.mul(fr(E), F.sub(fr(1), D(EXP[k]))), E * (1 - Math.exp(-k)), 'auto'); if (!A) return null;
        return {
          q: `${parts25(E, R, Cc)}$${fmt(k * tau)}$ 秒後のコンデンサーの電圧は約 □ V（${eTxt(k)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: key25(R, Cc), easyCheck: false,
          easy: `$\\tau=${fmt(tau)}$ 秒、$${k === 1 ? '' : k}\\tau$。$${E}\\times(1-${EXP[k]})${tail(A)}$`, verify: p => isRd(p.a, walk((t, y) => (E - y) / (R * 1e3 * Cc * 1e-6), 0, k * tau, 2000)),
        };
      },
      // 見かけがちがう：C・R をかえる（時定数・最後の電圧・かえたあとの電圧）
      s3(r) {
        const [R, Cc] = r.pick(RC25), E = r.pick([10, 12, 6, 9]), kind = turn(r, '25s3', 3), m = r.pick([2, 3, 4, 5, 0.5]);
        if (raku25(R, Cc)) return null;
        const head = `${parts25(E, R, Cc)}この回路で、`;
        if (kind === 0) {
          const C2 = Cc * m, tau2 = rcOf(R, C2);
          if (!Number.isInteger(C2) || raku25(R, C2)) return null;   // かえたあとが左ページの例にならない
          return { q: `${head}コンデンサーを ${U(C2, '\\mu F')} にかえると、時定数は □ 秒`, a: `$${fmt(tau2)}$`, key: key25(R, Cc), easyCheck: false, easy: `$\\tau=RC$ は $C$ に比例：$${fmt(rcOf(R, Cc))}\\times${m}=${fmt(tau2)}$`, verify: p => isNum(p.a, R * 1e3 * C2 * 1e-6, 1e-9) };
        }
        if (kind === 1) {
          const R2 = R * m;
          if (!Number.isInteger(R2) || raku25(R2, Cc)) return null;
          return { q: `${head}抵抗を ${U(R2, 'k\\Omega')} にかえると、じゅうぶん時間がたったときの電圧は □ V`, a: `$${E}$`, key: key25(R, Cc), easyCheck: false, easy: `最後の電圧は $E$ で、$R$ や $C$ によらない（$\\tau$ だけが変わる）`, verify: p => isNum(p.a, walk((t, y) => (E - y) / (R2 * Cc * 1e-3), 0, 40 * R2 * Cc / 1000, 4000), 1e-6) };
        }
        const R2 = R * m, tau2 = rcOf(R2, Cc), k = r.pick([1, 2]), A = approx(F.mul(fr(E), F.sub(fr(1), D(EXP[k]))), E * (1 - Math.exp(-k)), 'auto');
        if (!A || !Number.isInteger(R2) || raku25(R2, Cc)) return null;
        return {
          q: `${head}抵抗を ${U(R2, 'k\\Omega')} にかえると、$${fmt(k * tau2)}$ 秒後の電圧は約 □ V（${eTxt(k)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: key25(R, Cc), easyCheck: false,
          easy: `$\\tau=${R2}\\times${Cc}\\div1000=${fmt(tau2)}$ 秒、$${k === 1 ? '' : k}\\tau$。$${E}\\times(1-${EXP[k]})${tail(A)}$`, verify: p => isRd(p.a, walk((t, y) => (E - y) / (R2 * Cc * 1e-3), 0, k * tau2, 2000)),
        };
      },
      // わな：コンデンサーでなくコイル（時定数は L/R）→ わざ 6-26
      trap(r) {
        const [E, R, L] = r.pick([[12, 400, 0.2], [6, 20, 0.1], [10, 50, 0.5], [24, 60, 0.3], [5, 25, 0.05], [12, 200, 0.1], [9, 100, 0.2]]);
        if (E === 12 && R === 400) return null;   // 6-26 の左ページの例と同じ数はさける
        const ms = decStr(F.div(F.mul(D(L), fr(1000)), fr(R)));
        return dest({ q: `${U(E, 'V')} の電池、${U(R, '\\Omega')} の抵抗、${U(L, 'H')} のコイルを直列につなぎ、スイッチを入れる。時定数は □ ms`, a: `$${ms}$`, key: `t${E}|${R}|${L}`, verify: p => isNum(p.a, L / R * 1000, 1e-9) }, '6-25',
          `コンデンサーではなくコイル。時定数は $RC$ ではなく $\\frac{L}{R}=\\frac{${L}}{${R}}$ 秒 $=${ms}$ ms`);
      },
    },
  });

  // ================================================================ 6-26
  // [E（V）, R（Ω）, L（H）]：最後の電流 E/R、時定数 L/R
  const RL26 = [[6, 20, 0.1], [10, 50, 0.5], [24, 60, 0.3], [5, 25, 0.05], [12, 200, 0.1], [9, 100, 0.2], [10, 20, 0.2], [6, 30, 0.6], [12, 40, 0.2], [20, 100, 1], [10, 200, 0.1], [12, 300, 0.6], [5, 50, 0.05], [9, 30, 0.15]];
  const raku26 = (E, R, L) => E === 12 && R === 400 && +L === 0.2;
  const I26 = (E, R) => { const I = F.div(fr(E), fr(R)); return F.val(I) < 1 ? { v: decStr(F.mul(I, fr(1000))), u: 'mA', x: 1000 } : { v: decStr(I), u: 'A', x: 1 }; };
  const head26 = (E, R, L) => `${U(E, 'V')} の電池、${U(R, '\\Omega')} の抵抗、${U(L, 'H')} のコイルを直列につなぎ、スイッチを入れる。`;
  M.add({
    id: '6-26', part: 2, chap: '6-4⑦ 例題9・6-5⑦ 例題8', stars: 1,
    title: 'RL：最後の電流 $\\dfrac ER$、時定数 $\\dfrac LR$、$i=\\dfrac ER\\,(1-e^{-t/\\tau})$（電流の終端速度）',
    mark: '電池・抵抗・コイル（インダクタンス □ H）。「最後の電流」「時定数」「□ ms 後の電流」。',
    futsu: ['$E=Ri+L\\dfrac{\\dd i}{\\dd t}$ を立て、', '$\\dfrac{\\dd i}{\\dd t}=\\dfrac{\\frac ER-i}{\\frac LR}$ に変形して解く'],
    raku: ['12 V・$400\\,\\Omega$・0.2 H', '最後 $\\dfrac{12}{400}=30$ mA、$\\tau=\\dfrac{0.2}{400}=0.5$ ms', '1 ms は $2\\tau$：$30\\times(1-0.135)\\approx26$ mA'],
    why: 'コイルは電流の急な変化をきらうので、電流は0から始まり、目標 $\\dfrac ER$（コイルがないときのオームの法則の電流）へ近づく。式は目標へ近づく形で、$\\tau=\\dfrac LR$（6-4⑦）。落ちる物の終端速度 $\\dfrac{mg}{b}$、$\\tau=\\dfrac mb$ と同じ形（6-5⑦）。',
    caution: '時定数は $\\dfrac LR$（$LR$ でも $\\dfrac RL$ でもない）。1 ms（ミリ秒）は 0.001 秒。スイッチを入れた直後の電流は $\\dfrac ER$ ではなく0（コンデンサーの充電とはちがう）。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '30mm', trap: '16mm' },
    fits(q) { const s = sq(q); return /コイル|\\frac\{\\ddi\}\{\\ddt\}/.test(s) && /\\Omega|Ω|抵抗|[\d.]+i(?![\w^{])/.test(s); },
    steps: {
      // 最後の電流か時定数
      s1(r) {
        const [E, R, L] = r.pick(RL26), I = I26(E, R), ms = decStr(F.div(F.mul(D(L), fr(1000)), fr(R)));
        if (raku26(E, R, L)) return null;
        if (turn(r, '26s1', 2) === 0) return { q: `${head26(E, R, L)}最後の電流は □ ${I.u}`, a: `$${I.v}$`, key: `${E}|${R}|${L}`, easyCheck: false, easy: `$\\frac{${E}}{${R}}${I.u === 'mA' ? `=${fmt(E / R)}$ A $=${I.v}` : `=${I.v}`}$ ${I.u}`, verify: p => isNum(p.a, walk((t, i) => (E - R * i) / L, 0, 40 * L / R, 4000) * I.x, 1e-6) };
        return { q: `${head26(E, R, L)}時定数は □ ms`, a: `$${ms}$`, key: `${E}|${R}|${L}`, easyCheck: false, easy: `$\\frac{${L}}{${R}}=${fmt(L / R)}$ 秒 $=${ms}$ ms`, verify: p => { const T = numOf(p.a) / 1000; return near(walk((t, i) => (E - R * i) / L, 0, T, 400) / (E / R), 1 - Math.exp(-1), 1e-6) || `時定数 ${p.a} がちがう`; } };
      },
      // τ の整数倍の時刻の電流
      s2(r) {
        const [E, R, L] = r.pick(RL26), I = I26(E, R), tau = L / R * 1000, k = [1, 2, 3][turn(r, '26s2', 3)];   // τ・2τ・3τ を順に
        if (raku26(E, R, L)) return null;
        // 小数でくいちがうとき（$e^{-2}=0.135$ はけたが少ない）、10 以上なら整数でためす（O-4）
        const f = F.mul(D(I.v), F.sub(fr(1), D(EXP[k]))), v = +I.v * (1 - Math.exp(-k)), A = approx(f, v, 'auto') || (v >= 10 ? approx(f, v, [0]) : null); if (!A) return null;
        return {
          q: `${head26(E, R, L)}$${fmt(k * tau)}$ ms 後の電流は約 □ ${I.u}（${eTxt(k)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: `${E}|${R}|${L}`, easyCheck: false,
          easy: `最後 $${I.v}$ ${I.u}、$\\tau=${fmt(tau)}$ ms、$${k === 1 ? '' : k}\\tau$。$${I.v}\\times(1-${EXP[k]})${tail(A)}$`, verify: p => isRd(p.a, walk((t, i) => (E - R * i) / L, 0, k * L / R, 2000) * I.x),
        };
      },
      // 見かけがちがう：電流の式・式から最後の電流・抵抗をかえる
      s3(r) {
        const [E, R, L] = r.pick(RL26), kind = turn(r, '26s3', 3);
        if (raku26(E, R, L)) return null;
        if (kind === 0) {
          const I = decStr(F.div(fr(E), fr(R))), a = decStr(F.div(fr(R), D(L)));
          if (!I || !a || decLen(I) > 3) return null;
          return { q: `${head26(E, R, L)}電流 $i$（A）を $t$（秒）の式で □`, a: `$i=${I}(1-${eA(a)})$`, key: `${E}|${R}|${L}`, easyCheck: false, easy: `最後 $\\frac{${E}}{${R}}=${I}$ A、$\\frac{t}{\\tau}=\\frac{${R}}{${L}}t=${a}t$`, ...lin1(R / L, E / L, 0) };
        }
        if (kind === 1) {
          const I = I26(E, R);
          return { q: `$${L}${DY('i')}=${E}-${R}i$（$i$ は電流〔A〕）の、最後の電流は □ ${I.u}`, a: `$${I.v}$`, key: `${E}|${R}|${L}`, easyCheck: false, easy: `$${DY('i')}=0$ とおく：$i=\\frac{${E}}{${R}}${I.u === 'mA' ? `=${fmt(E / R)}$ A $=${I.v}$ mA` : `=${I.v}$`}`, verify: p => isNum(p.a, walk((t, i) => (E - R * i) / L, 0, 40 * L / R, 4000) * I.x, 1e-6) };
        }
        const m = r.pick([2, 4, 5]), ms = decStr(F.div(F.mul(D(L), fr(1000)), fr(R * m)));
        if (!ms || decLen(ms) > 3 || (E === 12 && R * m === 400)) return null;   // 左ページの例（12 V・400 Ω）にしない
        return { q: `${head26(E, R, L)}抵抗を ${U(R * m, '\\Omega')} にかえると、時定数は □ ms`, a: `$${ms}$`, key: `${E}|${R}|${L}`, easyCheck: false, easy: `$\\frac{L}{R}$ は $R$ に反比例：$\\frac{${L}}{${R * m}}$ 秒 $=${ms}$ ms`, verify: p => isNum(p.a, L / (R * m) * 1000, 1e-9) };
      },
      // わな：コイルでなくコンデンサー（直後の電流は 0 でなく E/R）→ わざ 6-25
      trap(r) {
        const [R, Cc] = r.pick(RC25), E = r.pick([10, 12, 6, 9, 5]);
        if (raku25(R, Cc)) return null;
        const I = decStr(F.div(fr(E), fr(R)));
        if (!I || decLen(I) > 3) return null;
        return dest({ q: `${parts25(E, R, Cc)}直後の電流は □ mA`, a: `$${I}$`, key: `t${E}|${R}`, verify: p => isNum(p.a, E / R, 1e-9) }, '6-26',
          `コイルでなくコンデンサー。直後はコンデンサーの電圧が0なので、電流は0ではなく $\\frac{${E}}{${R}}=${I}$ mA`);
      },
    },
  });

  // ================================================================ 6-27
  // λt（めったに起きないことの、平均の回数）
  const raku27 = (n, T, t) => n === 3 && T === 10 && (t === 10 || t === 5);   // 左ページの例（10秒に3回。O-2）
  // 確かめ：時間を細かく分けて「その区間で起きる確率 λΔt」をかけ合わせる（0回）・1つだけ選ぶ（1回）。教科書 6-4⑨ の表と同じ道すじ
  const p0Num = x => Math.pow(1 - x / 1e6, 1e6), p1Num = x => 1e6 * (x / 1e6) * Math.pow(1 - x / 1e6, 1e6 - 1);
  // λt の候補。左ページの例の λt=3（0回 0.050・1回 0.15 が左ページにある）は出さない。0回の確率（s1・s3 の窓口）は、例の「5 秒より長く待つ」の λt=1.5 も出さない（第40回 R1-7）
  const LT0 = ['1', '2', '0.5', '4', '5'], LT1 = ['1', '2', '0.5', '1.5', '4'];
  // 「平均して T 秒に n 回」と、聞く時間 t（λt が LT のどれか）。同じ見開きで、同じ「T 秒に n 回・t 秒」をくり返さない（s1 と s2。R1-7）
  function pick27(r, LT) {
    const used = r.u27 || (r.u27 = new Set());
    for (let k = 0; k < 60; k++) {
      if (k === 30) used.clear();   // 見つからないとき（アプリで何問も作るとき）は、ひとまわりしたとみて、また使う
      const n = r.pick([1, 2, 3, 4, 5, 6]), T = r.pick([10, 20, 30, 60, 5, 2]), x = r.pick(LT), t = +x * T / n;
      if (Number.isInteger(t) && t > 0 && T > n && !raku27(n, T, t) && !used.has(`${n}|${T}|${t}`)) { used.add(`${n}|${T}|${t}`); return { n, T, x, t }; }   // 「2 秒に 2 回」のような書き方はさける
    }
    return null;
  }
  M.add({
    id: '6-27', part: 2, chap: '6-4⑨ 例題11', stars: 1,
    title: 'めったに起きないこと：$\\lambda t$ を先に出す。0回は $e^{-\\lambda t}$、ちょうど1回は $\\lambda t\\,e^{-\\lambda t}$、$t$ より長く待つのは $e^{-\\lambda t}$',
    mark: '「平均して □ 秒に □ 回」と、0回・1回・待ち時間の確率。ガイガーカウンター・窓口。',
    futsu: ['時間を $n$ 個の区間に分けて、', '$(1-p)^n$ や $np(1-p)^{n-1}$ を計算し、', '$n$ を大きくする'],
    raku: ['10 秒に3回 → $\\lambda t=3$', '0回 $e^{-3}\\approx0.050$、1回 $3\\times0.050$', '5 秒より長く待つ：$\\lambda t=1.5$、$e^{-1.5}$'],
    why: 'まだ1回も起きない確率 $P_0$ は、$\\dfrac{\\dd P_0}{\\dd t}=-\\lambda P_0$（自分に比例してへる）なので $e^{-\\lambda t}$（6-4⑨）。「$t$ までに1回も起きない」は「待ち時間が $t$ より長い」と同じ。ちょうど $k$ 回は $\\dfrac{(\\lambda t)^k}{k!}e^{-\\lambda t}$ で、1回なら $\\lambda t\\,e^{-\\lambda t}$。',
    caution: '$\\lambda$（1秒あたりの回数）と時間 $t$ の単位をそろえる（1分に2人で30秒なら $\\lambda t=2\\times0.5=1$）。平均が3回でも、ちょうど3回とはかぎらない。',
    counts: { s1: 5, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { const s = sq(q); return /平均して/.test(s) && /確率|待ち時間/.test(s); },
    steps: {
      // 0回の確率
      s1(r) {
        const P = pick27(r, LT0); if (!P) return null;
        const { n, T, x, t } = P, A = approx(D(EXP[x]), Math.exp(-x), [3]); if (!A) return null;
        return {
          q: `ガイガーカウンターが、平均して $${T}$ 秒に $${n}$ 回鳴る。$${t}$ 秒間に1回も鳴らない確率は約 □（${eTxt(x)} として、小数第3位まで）`, a: `$${A.a}$`, key: `0|${x}`, easyCheck: false,
          easy: `$\\lambda t=\\frac{${n}}{${T}}\\times${t}=${x}$。$e^{-${x}}\\approx${EXP[x]}$`, verify: p => isRd(p.a, p0Num(+x)),
        };
      },
      // ちょうど1回の確率
      s2(r) {
        const P = pick27(r, LT1); if (!P) return null;
        const { n, T, x, t } = P, A = approx(F.mul(D(x), D(EXP[x])), +x * Math.exp(-x), [3, 2]); if (!A) return null;
        return {
          q: `放射線を数えると、平均して $${T}$ 秒に $${n}$ 回だった。$${t}$ 秒間に、ちょうど1回数える確率は約 □（${eTxt(x)} として、${keta(A.k)}）`, a: `$${A.a}$`, key: `1|${x}`, easyCheck: false,
          easy: `$\\lambda t=${x}$。$${x}e^{-${x}}\\approx${x}\\times${EXP[x]}${tail(A)}$`, verify: p => isRd(p.a, p1Num(+x)),
        };
      },
      // 見かけがちがう：窓口の待ち時間（分と秒をそろえる。key は s1 の「0回」とは別）・平均の待ち時間（1見開きに1問）
      s3(r) {
        const kind = turn(r, '27s3', 2), lam = r.pick([2, 3, 4, 6, 1]);
        if (kind === 0) {
          const x = r.pick(LT0), sec = +x / lam * 60, mn = F.make(sec, 60), mnTeX = decStr(mn) || `\\frac{${mn[0]}}{${mn[1]}}`;   // 秒を分に。割り切れないときは分数（20 秒は $\frac13$ 分。第40回 S-1・R1-5）
          if (!Number.isInteger(sec)) return null;
          const A = approx(D(EXP[x]), Math.exp(-x), [3]); if (!A) return null;
          return {
            q: `ある窓口には、平均して1分に $${lam}$ 人が来る（来る時刻はばらばら）。次の人が来るまで $${sec}$ 秒より長く待つ確率は約 □（${eTxt(x)} として、小数第3位まで）`, a: `$${A.a}$`, key: `m${x}`, easyCheck: false,
            easy: `$${sec}$ 秒は $${mnTeX}$ 分。$\\lambda t=${lam}\\times${mnTeX}=${x}$、$e^{-${x}}\\approx${EXP[x]}$`, verify: p => isRd(p.a, p0Num(+x)),
          };
        }
        const T = r.pick([10, 20, 60, 30]), n = r.pick([2, 3, 4, 5, 6]), w = decStr(F.div(fr(T), fr(n)));
        if (!w || decLen(w) > 1 || (n === 3 && T === 10)) return null;
        return {
          q: `ガイガーカウンターが、平均して $${T}$ 秒に $${n}$ 回鳴る。次に鳴るまでの待ち時間の平均は □ 秒`, a: `$${w}$`, key: `avg`, easyCheck: false,
          easy: `$\\lambda=\\frac{${n}}{${T}}$ 回/秒。平均の待ち時間は $\\tau=\\frac{1}{\\lambda}=${w}$`,
          verify: p => { let s = 0; const N = 20000, L = n / T, H = 40 / L; for (let k = 0; k < N; k++) { const u = (k + 0.5) * H / N; s += Math.exp(-L * u); } return isNum(p.a, s * H / N, 1e-4); },   // 「t より長く待つ確率」を t で積分すると平均
        };
      },
      // わな：放射性の物質の量が半分（確率ではない。同じ時間で同じ割合）→ わざ 6-16
      trap(r) {
        const p0 = r.pick([10, 5, 8, 20]), n = r.pick([2, 3, 4]), N0 = r.pick([800, 400, 1000, 640]), v = decStr(F.mul(fr(N0), fpow(fr(1, 2), n)));
        return dest({ q: `放射性の物質が $${p0}$ 分で半分になる。はじめ ${U(N0, 'g')} のとき、$${n * p0}$ 分後の量は □ g`, a: `$${v}$`, key: `t${p0}|${n}`, verify: p => isNum(p.a, viaExp(N0, 'half', p0, n * p0), 1e-9) }, '6-27',
          `平均の回数や確率ではなく、同じ時間で同じ割合（半分）にへる量。$${n}$ 回分で $${N0}\\times\\Bigl(\\frac{1}{2}\\Bigr)^{${n}}=${v}$`, ['6-16']);
      },
    },
  });

  // ================================================================ 6-28
  // 終端速度がきりのよい数になる [質量 m（kg）, 抵抗の係数 c, 終端速度 v]（c=9.8m÷v² が3けたまでの小数）
  const CS28 = (() => {
    const out = [];
    for (const v of [5, 6, 7, 8, 10, 12, 14, 20, 21, 28, 30, 35, 40, 42, 49, 50, 56, 60, 63, 70]) for (const m of [0.5, 1, 2, 5, 10, 40, 49, 50, 60, 64, 70, 72, 75, 80, 81, 90, 96, 98, 100]) {
      const c = decStr(F.div(F.mul(D('9.8'), D(m)), fr(v * v)));
      if (!c || decLen(c) > 2 || (m === 80 && +c === 0.26)) continue;
      if (m >= 40 ? (+c >= 0.1 && +c <= 0.6) || (+c >= 15 && +c <= 40) : +c >= 0.05 && +c <= 1) out.push([m, c, v]);   // 人は手足を広げた姿勢（0.1〜0.6）かパラシュート（15〜40）
    }
    return out;
  })();
  const obj28 = (m, c) => (m >= 40 ? (+c >= 15 ? 'パラシュートで降りる人' : 'スカイダイバー') : m >= 5 ? '荷物' : 'ボール');
  M.add({
    id: '6-28', part: 2, chap: '6-5③ 例題2・3・9', stars: 1,
    title: '2乗の抵抗の終端速度は $v_{\\mathrm t}=\\sqrt{\\dfrac{mg}{c}}$（質量 $n$ 倍で $\\sqrt n$ 倍。おす力 $F$ とのつり合いなら $\\sqrt{\\dfrac Fc}$）',
    mark: '「抵抗は $f=cv^2$」と、終端速度・それ以上速くならない速さ。質量を何倍にすると。',
    futsu: ['$m\\dfrac{\\dd v}{\\dd t}=mg-cv^2$ を表計算で', '何十行もくり返して、近づく速さを読む'],
    raku: ['$80\\,\\mathrm{kg}$、$c=0.26$：$\\sqrt{\\dfrac{784}{0.26}}\\approx54.9$ m/s', '質量 4 倍 → $\\sqrt4=2$ 倍', '1000 N、$c=0.4$：$\\sqrt{2500}=50$ m/s'],
    why: '終端速度では速さが変わらないので $\\dfrac{\\dd v}{\\dd t}=0$。$0=mg-cv^2$ から $v^2=\\dfrac{mg}{c}$、正のほうの平方根をとる（6-5③）。$v_{\\mathrm t}$ は $\\sqrt m$ に比例するので、質量 $n$ 倍で $\\sqrt n$ 倍。重力のかわりにおす力 $F$ なら、$F=cv^2$ のつり合い。',
    caution: '$\\sqrt{\\phantom{m}}$ を忘れない（$\\dfrac{mg}{c}$ は速さの2乗）。速さに比例する抵抗（$9.8-810v$）なら $\\sqrt{\\phantom{m}}$ はいらない（わざ 6-19）。時速にするには 3.6 倍。',
    counts: { s1: 5, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) {
      const s = sq(q);
      if (/\\Delta/.test(s)) return false;
      return (/v\^\{?2/.test(s) && /終端速度|つり合う速さ|変わらなくなる|それ以上速くならない/.test(s)) || (/2乗に比例/.test(s) && /終端速度/.test(s));
    },
    steps: {
      s1(r) {
        const [m, c, v] = r.pick(CS28);
        if (m === 80) return null;   // 左ページの例（80 kg のスカイダイバー。O-2）
        return {
          q: `質量 ${U(m, 'kg')} の${obj28(m, c)}が落ちている。空気の抵抗は $f=cv^{2}$、$c=${c}\\,\\mathrm{N\\cdot s^2/m^2}$。終端速度は □ m/s`, a: `$${v}$`, key: `${m}|${c}`, easyCheck: false,
          easy: `$\\sqrt{\\frac{${m}\\times9.8}{${c}}}=\\sqrt{${fmt(m * 9.8 / +c)}}=${v}$`, verify: p => isNum(p.a, walk((t, u) => 9.8 - (+c / m) * u * u, 0, 30 * v / 9.8, 6000), 1e-6),
        };
      },
      // 質量・抵抗の係数を何倍か
      s2(r) {
        const kind = turn(r, '28s2', 3), k = r.pick([4, 5, 6, 7, 10, 3]), n = k * k;
        if (kind === 0) return { q: `形と大きさが同じで、2乗に比例する抵抗を受けて落ちる物がある。質量を $${n}$ 倍にすると、終端速度は □ 倍`, a: `$${k}$`, key: `n${n}`, easyCheck: false, easy: `$v_{\\mathrm t}$ は $\\sqrt m$ に比例：$\\sqrt{${n}}=${k}$`, verify: p => isNum(p.a, Math.sqrt(n), 1e-12) };
        const v = r.pick([3, 4, 5, 6, 8, 10, 2]);
        if (kind === 1) return { q: `2乗に比例する抵抗を受けて、終端速度 ${U(v, 'm/s')} で落ちる物がある。形と大きさを変えずに、質量だけを $${n}$ 倍にすると、終端速度は □ m/s`, a: `$${v * k}$`, key: `v${v}|${n}`, easyCheck: false, easy: `$${v}\\times\\sqrt{${n}}=${v}\\times${k}=${v * k}$`, verify: p => isNum(p.a, v * Math.sqrt(n), 1e-12) };
        const vv = v * k;
        if (vv > 60) return null;   // スカイダイバーの終端速度（約 55 m/s）をこえない
        return { q: `2乗に比例する抵抗を受けて、終端速度 ${U(vv, 'm/s')} で落ちる物がある。パラシュートを開いて、抵抗の係数 $c$ が $${n}$ 倍になると、終端速度は □ m/s`, a: `$${v}$`, key: `c${vv}|${n}`, easyCheck: false, easy: `$v_{\\mathrm t}$ は $\\frac{1}{\\sqrt c}$ に比例：$${vv}\\div\\sqrt{${n}}=${v}$`, verify: p => isNum(p.a, vv / Math.sqrt(n), 1e-12) };
      },
      // 見かけがちがう：おす力とつり合う速さ（m/s・時速）
      s3(r) {
        const car = r.chance(0.7), v = car ? r.pick([20, 25, 30, 40, 45, 50, 35]) : r.pick([6, 8, 10, 12]), c = car ? r.pick(['0.3', '0.4', '0.35', '0.5', '0.32', '0.36']) : r.pick(['0.25', '0.2', '0.3', '0.4']), Fp = decStr(F.mul(D(c), fr(v * v))), kmh = turn(r, '28s3', 2) === 1;
        if (!Fp || decLen(Fp) > 0 || (+Fp === 1000 && c === '0.4')) return null;
        const what = car ? ['自動車', '車輪が車を前へおす力'] : ['自転車と人', 'ペダルをこいで前へおす力'];
        return {
          q: `${what[0]}の空気の抵抗を $f=cv^{2}$、$c=${c}\\,\\mathrm{N\\cdot s^2/m^2}$ とする。${what[1]}が ${U(Fp, 'N')} のとき、抵抗とつり合う速さは${kmh ? '時速 □ km' : ' □ m/s'}（ほかの抵抗は考えない）`,
          a: `$${kmh ? fmt(v * 3.6) : v}$`, key: `F${Fp}|${c}`, easyCheck: false,
          easy: `$${Fp}=${c}v^{2}$ から $v=\\sqrt{\\frac{${Fp}}{${c}}}=\\sqrt{${v * v}}=${v}$${kmh ? `、$${v}\\times3.6=${fmt(v * 3.6)}$` : ''}`,
          verify: p => isNum(p.a, walk((t, u) => (+Fp - +c * u * u), 0, 50 / (+c * v), 6000) * (kmh ? 3.6 : 1), 1e-6),
        };
      },
      // わな：速さに比例する抵抗（√ はいらない）→ わざ 6-19
      trap(r) {
        const k = r.pick([980, 490, 196, 98, 1960]), vf = decStr(F.div(D('9.8'), fr(k)));
        return dest({ q: `小さなつぶが、$${DY('v')}=9.8-${k}v$（$v$ は m/s、$t$ は秒）にしたがって落ちる。それ以上速くならない速さ（終端速度）は □ m/s`, a: `$${vf}$`, key: `t${k}`, verify: p => finOK(p.a, k, 9.8) }, '6-28',
          `抵抗は速さの2乗ではなく、速さに比例（$${k}v$）。$0=9.8-${k}v$ から $\\frac{9.8}{${k}}=${vf}$（$\\sqrt{\\phantom{m}}$ はいらない）`, ['6-19']);
      },
    },
  });

  // ================================================================ 6-29
  // 左ページの例（60 kg、±1、目もり 63.0 kg → 0.49。O-2）。目もりは質量に比例するので、例と同じ加速度の大きさ（1・0.49）は質量によらず出さず、60 kg も出さない（第40回 R1-22）
  const raku29 = (m, a) => m === 60 || Math.abs(Math.abs(a) - 1) < 1e-9 || Math.abs(Math.abs(a) - 0.49) < 1e-9;
  const AS29 = ['0.98', '1.96', '2.45', '1.5', '0.5', '2', '0.7', '1.4'];
  // 目もり m(g+a)/g（分数）。ちょうどの小数なら「□」、丸めるなら「約 □（小数第1位まで）」
  function scale29(m, a) {
    const f = F.div(F.mul(fr(m), F.add(D('9.8'), D(a))), D('9.8')), ex = decStr(f);
    if (ex && decLen(ex) === 2 && ex.endsWith('5')) return null;   // 56.25 のように、ちょうど …5 になる数は丸め方がまぎれるので出さない
    return ex && decLen(ex) <= 1 ? { a: ex, ex, exact: true } : { a: roundStr(f, 1), ex, exact: false };
  }
  // 確かめ：人にはたらく力 N−mg=ma を N について解き、N÷g を目もりにする（同じ式を別の順で）
  const scaleOK = (ans, m, a) => { const N = m * a + m * 9.8; return isRd(ans, N / 9.8); };
  M.add({
    id: '6-29', part: 2, chap: '6-5⑥ 例題6・7', stars: 1,
    title: '体重計の目もり＝$m\\times\\dfrac{g+a}{g}$（上向きが＋）。目もりから $a=g\\Bigl(\\dfrac{\\text{目もり}}{m}-1\\Bigr)$',
    mark: 'エレベーターの中の体重計。加速度から目もり、目もりから加速度。',
    futsu: ['人にはたらく力 $N$ と $mg$ を図にかき、', '$ma=N-mg$ を立てて $N$ を出し、', '$g$ でわって kg にする'],
    raku: ['60 kg、上向き $1\\,\\mathrm{m/s^2}$', '$60\\times\\dfrac{10.8}{9.8}\\approx66.1$ kg', '目もり 63.0 kg → $9.8\\times\\Bigl(\\dfrac{63}{60}-1\\Bigr)=0.49$'],
    why: '上向きを正とすると、$ma=N-mg$ から $N=m(g+a)$。体重計は $N$ を $g$ でわって kg で表示するので、目もりは $m\\times\\dfrac{g+a}{g}$（6-5⑥）。決めるのは速さではなく加速度の向き。',
    caution: '「上へ動いていて止まる」「下へ動き出す」は、どちらも加速度が下向き（$a<0$）で、軽く表示される。「下へ動いていて止まる」は上向き（$a>0$）で、重く表示される。',
    counts: { s1: 3, s2: 3, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { return /体重計/.test(q); },
    steps: {
      // 加速度の向きと大きさから目もり
      s1(r) {
        const m = r.pick([40, 45, 50, 55, 65, 70, 75, 80]), ab = r.pick(AS29), up = r.chance(0.55), a = (up ? 1 : -1) * +ab;
        if (raku29(m, a)) return null;
        const S = scale29(m, up ? ab : '-' + ab); if (!S) return null;
        return {
          q: `体重 ${U(m, 'kg')} の人が、エレベーターの中で体重計に乗っている。加速度が${up ? '上' : '下'}向きに ${U(ab, 'm/s^{2}')} のとき、目もりは${S.exact ? ' □ kg（$g=9.8$）' : '約 □ kg（$g=9.8$ として、小数第1位まで）'}`, a: `$${S.a}$`, key: `${fmt(a)}`, easyCheck: false,
          easy: `$${m}\\times\\frac{9.8${up ? '+' : '-'}${ab}}{9.8}=${m}\\times\\frac{${fmt(9.8 + a)}}{9.8}${S.exact ? '=' : '\\approx'}${S.a}$`, verify: p => scaleOK(p.a, m, a),
        };
      },
      // 動き方のことばから、加速度の向きを読む
      s2(r) {
        const m = r.pick([40, 45, 50, 55, 65, 70, 75, 80]), ab = r.pick(AS29), sc = r.pick([['上へ動き出す', 1], ['上へ動いていて止まる', -1], ['下へ動き出す', -1], ['下へ動いていて止まる', 1]]), a = sc[1] * +ab;
        if (raku29(m, a)) return null;
        const S = scale29(m, sc[1] > 0 ? ab : '-' + ab); if (!S) return null;
        return {
          q: `体重 ${U(m, 'kg')} の人が、エレベーターの中で体重計に乗っている。エレベーターが${sc[0]}とき（加速度の大きさ ${U(ab, 'm/s^{2}')}）、目もりは${S.exact ? ' □ kg（$g=9.8$）' : '約 □ kg（$g=9.8$ として、小数第1位まで）'}`, a: `$${S.a}$`, key: `${fmt(a)}`, easyCheck: false,
          easy: `加速度は${sc[1] > 0 ? '上' : '下'}向き。$${m}\\times\\frac{${fmt(9.8 + a)}}{9.8}${S.exact ? '=' : '\\approx'}${S.a}$`, verify: p => scaleOK(p.a, m, a),
        };
      },
      // 見かけがちがう：目もりから加速度（上向きを正）・自由落下で目もり0
      s3(r) {
        const kind = turn(r, '29s3', 3);
        if (kind < 2) {
          const m = r.pick([40, 50, 70, 80, 100]), rat = r.pick(['1.1', '0.9', '1.2', '0.8', '1.15', '0.85']), R = decStr(F.mul(fr(m), D(rat))), a = decStr(F.mul(D('9.8'), F.sub(D(rat), fr(1))));   // 1.05・0.95（±0.49）は左ページの例の答え
          if (raku29(m, +a) || decLen(R) > 1 || +R === 63) return null;   // 左ページの例（目もり 63.0 kg）
          return {
            q: `体重 ${U(m, 'kg')} の人が、エレベーターの中の体重計に乗ると、目もりが ${U(R + (decLen(R) ? '' : '.0'), 'kg')} だった。エレベーターの加速度（上向きを正）は $□\\,\\mathrm{m/s^{2}}$（$g=9.8$）`, a: `$${a}$`, key: `${fmt(+a)}`, easyCheck: false,
            easy: `$\\frac{${R}}{${m}}=${rat}$。$a=9.8\\times(${rat}-1)=${a}$`, verify: p => { const A = numOf(p.a); return near(m * (9.8 + A) / 9.8, +R, 1e-9) || `a=${A} では目もりが ${R} にならない`; },
          };
        }
        const m = r.pick([40, 50, 70, 80]);
        return { q: `体重 ${U(m, 'kg')} の人がエレベーターの中で体重計に乗っている。ケーブルが切れて、エレベーターが自由落下する（加速度は下向きに $g$）と、目もりは □ kg`, a: '$0$', key: `-9.8`, easyCheck: false, easy: `$a=-9.8$ で、$${m}\\times\\frac{9.8-9.8}{9.8}=0$（無重量）`, verify: p => scaleOK(p.a, m, -9.8) };
      },
      // わな：エレベーターでなく、2乗の抵抗の終端速度 → わざ 6-28
      trap(r) {
        const [m, c, v] = r.pick(CS28.filter(x => x[0] >= 40 && +x[1] < 1));
        return dest({ q: `質量 ${U(m, 'kg')} のスカイダイバーが、手足を広げて落ちている。空気の抵抗は $f=cv^{2}$、$c=${c}\\,\\mathrm{N\\cdot s^2/m^2}$。終端速度は □ m/s`, a: `$${v}$`, key: `t${m}|${c}`, verify: p => isNum(p.a, Math.sqrt(m * 9.8 / +c), 1e-9) }, '6-29',
          `体重計ではなく、空気の抵抗とのつり合い。$\\sqrt{\\frac{${m}\\times9.8}{${c}}}=${v}$`, ['6-28']);
      },
    },
  });

  // ================================================================ 6-30
  // S：秒の式の分母（$-\frac{T-T_a}{S}$）。分の式の係数は 60÷S
  const S30 = [300, 600, 750, 1500, 2400, 3000, 6000, 480, 240, 120, 2000, 400, 200, 1000, 800];
  const k30 = S => decStr(F.div(fr(60), fr(S)));
  const CR30 = [[1000, 0.6], [1500, 0.5], [500, 0.6], [2000, 0.75], [800, 3], [1000, 3], [600, 0.8], [400, 0.6], [3000, 2], [250, 0.8], [1000, 2], [500, 0.8], [1250, 0.8], [2000, 0.2], [400, 0.5]];
  // 確かめ：秒の式で 60 秒たどった変化と、分の式で 1 分たどった変化が同じか
  const sameRule = (S, k, Ta) => { const T0 = Ta + 50, a = walk((t, T) => -(T - Ta) / S, T0, 60, 600), b = walk((t, T) => -k * (T - Ta), T0, 1, 600); return near(a, b, 1e-9); };
  M.add({
    id: '6-30', part: 2, chap: '6-15② 例題3', stars: 1,
    title: '秒の式を分の式に：右辺の係数（1/s）を60倍する（時定数は60でわる）',
    mark: '熱容量・熱抵抗から立てた「秒」の式と、「$t$ を分にした式に直す」。',
    futsu: ['$t$ 秒と $t$ 分の関係から、', '$\\dfrac{\\dd T}{\\dd t}$ の単位を一つずつ', '℃/s から ℃/分 に書きかえる'],
    raku: ['$1000\\dfrac{\\dd T}{\\dd t}=-\\dfrac{T-20}{1.2}$ → $-\\dfrac{T-20}{1200}$（秒）', '60倍：$-\\dfrac{60}{1200}\\,(T-20)=-0.05\\,(T-20)$（分）', '$\\tau=1200$ 秒＝20 分'],
    why: '1分は60秒なので、1分あたりの変わり方は、1秒あたりの変わり方の60倍（6-15②）。右辺の係数（1/s）を60倍すると、1/分 の係数になる。時定数は時間なので、秒の数を60でわると分になる。',
    caution: '係数は60倍、時定数は60でわる（逆にしない）。部屋の温度の20は、℃のままで変わらない。分の式を秒の式にするときは、係数を60でわる。',
    counts: { s1: 4, s2: 3, s3: 3, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { return /分にした式|秒にした式|ミリ秒（ms）にした式/.test(q) || (/熱抵抗/.test(q) && /時定数は □ 分/.test(q)); },
    steps: {
      s1(r) {
        const S = r.pick(S30), Ta = r.pick([20, 25, 22, 18, 15]), k = k30(S);
        return {
          q: `$${DY('T')}=-\\dfrac{T-${Ta}}{${S}}$（$t$ は秒）を、$t$ を分にした式 $${DY('T')}=-k\\,(T-${Ta})$ に直したときの $k$（1/分）`, a: `$${k}$`, key: `${S}`, easyCheck: false,
          easy: `係数 $\\frac{1}{${S}}$（1/秒）を60倍：$\\frac{60}{${S}}=${k}$`, verify: p => sameRule(S, numOf(p.a), Ta) || `係数 ${p.a} では、1分の変わり方が合わない`,
        };
      },
      // 熱容量と熱抵抗から（係数か、時定数を分で）
      s2(r) {
        const [Cc, R] = r.pick(CR30), S = Cc * R, Ta = r.pick([20, 25, 22]), k = k30(S);
        if (S === 1200 || Cc === 1000 || !k) return null;   // 左ページの例（1000 J/K・1.2 K/W、部屋 20℃）の熱容量はよける（第40回 R1-22）
        const head = `熱容量 ${U(Cc, 'J/K')} の物が、熱抵抗 ${U(R, 'K/W')} で ${C(Ta)}の部屋へ熱を逃がす。`;
        if (turn(r, '30s2', 2) === 0) return { q: `${head}$t$ を分にした式 $${DY('T')}=-k\\,(T-${Ta})$ の $k$（1/分）`, a: `$${k}$`, key: `${S}`, easyCheck: false, easy: `秒の式は $-\\frac{T-${Ta}}{${Cc}\\times${R}}=-\\frac{T-${Ta}}{${S}}$。$\\frac{60}{${S}}=${k}$`, verify: p => sameRule(S, numOf(p.a), Ta) || `係数 ${p.a} がちがう` };
        const m = decStr(F.div(fr(S), fr(60)));
        if (!m || decLen(m) > 1) return null;
        return { q: `${head}時定数は □ 分`, a: `$${m}$`, key: `${S}`, easyCheck: false, easy: `$${Cc}\\times${R}=${S}$ 秒、$${S}\\div60=${m}$ 分`, verify: p => isNum(p.a, S / 60, 1e-9) };
      },
      // 見かけがちがう：分の式を秒の式に・ミリ秒の式に
      s3(r) {
        const kind = turn(r, '30s3', 2);
        if (kind === 0) {
          const S = r.pick(S30), Ta = r.pick([20, 25, 22]), k = k30(S);
          return {
            q: `$${DY('T')}=-${k}\\,(T-${Ta})$（$t$ は分）を、$t$ を秒にした式 $${DY('T')}=-\\dfrac{T-${Ta}}{S}$ に直したときの $S$（秒）`, a: `$${S}$`, key: `${S}`, easyCheck: false,
            easy: `秒の係数は $${k}\\div60$。$S=\\frac{60}{${k}}=${S}$（時定数）`, verify: p => sameRule(numOf(p.a), +k, Ta) || `S=${p.a} では、1分の変わり方が合わない`,
          };
        }
        const ms = r.pick([2, 5, 4, 10, 20, 0.5]), V0 = r.pick([10, 12, 5]), sec = fmt(ms / 1000), kk = decStr(F.div(fr(1), D(ms)));
        return {
          q: `放電の式 $${DY('V')}=-\\dfrac{V}{${sec}}$（$t$ は秒、はじめ ${U(V0, 'V')}）を、$t$ をミリ秒（ms）にした式 $${DY('V')}=-kV$ に直したときの $k$（1/ms）`, a: `$${kk}$`, key: `ms${ms}`, easyCheck: false,
          easy: `$${sec}$ 秒 $=${ms}$ ms なので、$k=\\frac{1}{${ms}}=${kk}$（秒の係数 $\\frac{1}{${sec}}$ を1000でわる）`,
          verify: p => { const a = walk((t, V) => -V / +sec, V0, ms / 1000, 400), b = walk((t, V) => -numOf(p.a) * V, V0, ms, 400); return near(a, b, 1e-9) || `k=${p.a} がちがう`; },
        };
      },
      // わな：時刻を秒で聞く（差が半分になる時間を出してから60倍）→ わざ 6-20
      trap(r) {
        const k = r.pick(['0.1', '0.04', '0.02', '0.2', '0.025']), Ta = r.pick([20, 25]), Dd = r.pick([60, 40, 50]), T0 = Ta + Dd, tau = 1 / +k;
        const A = approx(F.mul(fr(60 * tau), D(LN[2])), 60 * tau * Math.LN2, [0]); if (!A) return null;
        return dest({
          q: `部屋の温度は ${C(Ta)}。$${DY('T')}=-${k}\\,(T-${Ta})$（$t$ は分）、はじめ ${C(T0)}。${C(Ta + Dd / 2)}になるのは約 □ 秒後（${lnTxt(2)} として、整数で）`, a: `$${A.a}$`, key: `t${k}|${Dd}`,
          verify: p => isRd(p.a, 60 * tau * Math.LN2),
        }, '6-30', `式を直すのではなく、時刻を求める。差が半分なので $${fmt(tau)}\\ln2$ 分、それを60倍：$${fmt(tau)}\\times0.693\\times60${tail(A)}$`, ['6-20']);
      },
    },
  });

  // ================================================================ 6-94
  // 2乗の抵抗のオイラー法（表計算の1行）
  const raku94 = (k, dt) => k === '0.00325' && +dt === 1;   // 左ページの例（O-2）
  const eu = (k, v, dt) => F.add(D(v), F.mul(F.sub(D('9.8'), F.mul(D(k), F.mul(D(v), D(v)))), D(dt)));   // 次の速さ（分数）
  const accTeX = (k, v) => `9.8-${k}\\times${/^-|\./.test(String(v)) && +v < 0 ? `(${v})` : v}^{2}`;
  M.add({
    id: '6-94', part: 2, chap: '6-5④ 例題4', stars: 1,
    title: '2乗の抵抗のオイラー法：加速度 $9.8-kv^2$ を出して、次の速さ＝今の速さ＋加速度×$\\Delta t$',
    mark: '$\\dfrac{\\dd v}{\\dd t}=9.8-kv^2$ と「$\\Delta t=\\square$ 秒のオイラー法で □ 秒後の速さ」。',
    futsu: ['表計算に、加速度の列と速さの列の式を入れ、', '下へコピーして表を作り、', '□ 秒後の行の速さを読む'],
    raku: ['0 秒：$a=9.8$、1 秒後 $v=0+9.8\\times1=9.8$', '1 秒：$a=9.8-0.00325\\times9.8^2=9.488$', '2 秒後 $v=9.8+9.488\\times1\\approx19.3$'],
    why: '2乗の抵抗の式は、目標へ近づく形にならない（$e$ の式で書けない）。そこで、6-2のオイラー法で1行ずつ進める（6-5④）：今の速さから今の加速度を出し、次の速さ＝今の速さ＋加速度×$\\Delta t$。',
    caution: '加速度は「今の速さ」で計算する（次の速さではない）。$kv^2$ は $v$ を2乗してから $k$ をかける。$\\Delta t$ が1でないときは、加速度に $\\Delta t$ をかけるのを忘れない。変数分離で式を解こうとすると $\\tanh$ が出て、手では進めにくい。',
    counts: { s1: 4, s2: 2, s3: 2, trap: 2 },
    cols: { s1: 1, s2: 1, s3: 1, trap: 1 },
    boxw: { s1: '16mm', s2: '16mm', s3: '16mm', trap: '16mm' },
    fits(q) { const s = sq(q); return /\\Deltat/.test(s) && /v\^\{2\}/.test(s); },
    steps: {
      // 1歩
      s1(r) {
        const k = r.pick(['0.004', '0.002', '0.005', '0.01', '0.02', '0.003', '0.2', '0.1']), v = r.pick([10, 20, 5, 2, 1, 3, 4, 30, 15]), dt = r.pick(['1', '0.5', '0.1', '0.2']);
        const kv2 = +k * v * v, nx = decStr(eu(k, v, dt));
        if (kv2 >= 9.8 || kv2 < 0.05 || raku94(k, dt) || !nx || decLen(nx) > 3) return null;
        const a = decStr(F.sub(D('9.8'), F.mul(D(k), fr(v * v))));
        return {
          q: `$${DY('v')}=9.8-${k}v^{2}$。今の速さが ${U(v, 'm/s')} のとき、$\\Delta t=${dt}$ 秒のオイラー法で、次の速さは □ m/s`, a: `$${nx}$`, key: `${k}|${v}|${dt}`, easyCheck: false,
          easy: `$a=${accTeX(k, v)}=${a}$。$${v}+${a}\\times${dt}=${nx}$`, verify: p => isNum(p.a, v + (9.8 - +k * v * v) * +dt, 1e-9),
        };
      },
      // 止まった状態から2歩
      s2(r) {
        const k = r.pick(['0.004', '0.002', '0.005', '0.003', '0.01', '0.006']), dt = r.pick(['1', '0.5']);
        if (raku94(k, dt)) return null;
        const v1 = decStr(F.mul(D('9.8'), D(dt))), v2f = eu(k, v1, dt), v2 = roundStr(v2f, 2), ex = decStr(v2f), a1 = decStr(F.sub(D('9.8'), F.mul(D(k), F.mul(D(v1), D(v1)))));
        return {
          q: `スカイダイバーの速さ：$${DY('v')}=9.8-${k}v^{2}$、はじめ $v=0$。$\\Delta t=${dt}$ 秒のオイラー法で、$${fmt(2 * +dt)}$ 秒後の速さは約 □ m/s（小数第2位まで）`, a: `$${v2}$`, key: `${k}|0|${dt}`, easyCheck: false,
          easy: `$${dt}$ 秒後 $0+9.8\\times${dt}=${v1}$。$a=${accTeX(k, v1)}=${a1}$、$${v1}+${a1}\\times${dt}=${ex}${ex === v2 ? '' : `\\approx${v2}`}$`,
          verify: p => { let v = 0; for (let s = 0; s < 2; s++) v += (9.8 - +k * v * v) * +dt; return isRd(p.a, v); },
        };
      },
      // 見かけがちがう：表計算の表（ア の数）・シャトル（シャトルは1見開きに1問）
      s3(r) {
        const kind = turn(r, '94s3', 2);
        const [k, dt] = kind === 0 ? [r.pick(['0.004', '0.002', '0.005', '0.003']), '1'] : [r.pick(['0.2', '0.1', '0.3']), '0.2'];
        const v1 = decStr(F.mul(D('9.8'), D(dt))), a1 = F.sub(D('9.8'), F.mul(D(k), F.mul(D(v1), D(v1)))), v2f = eu(k, v1, dt), v2 = roundStr(v2f, 2);
        const a1r = roundStr(a1, 3);
        if (kind === 0) {
          return {
            q: `表計算で、$${DY('v')}=9.8-${k}v^{2}$ を $\\Delta t=${dt}$ 秒のオイラー法で進めた。表の ア に入る数は約 □（小数第2位まで）`, a: `$${v2}$`, key: `${k}|0|${dt}`, easyCheck: false,
            table: { head: ['$t$（秒）', '0', '1', '2'], rows: [['$v$（m/s）', '0', v1, 'ア'], ['加速度（$\\mathrm{m/s^{2}}$）', '9.8', decStr(a1), '']] },
            easy: `ア＝今の速さ＋加速度×$\\Delta t$：$${v1}+${decStr(a1)}\\times1=${decStr(v2f)}${decStr(v2f) === v2 ? '' : `\\approx${v2}`}$`,
            verify: p => { let v = 0; for (let s = 0; s < 2; s++) v += (9.8 - +k * v * v); return isRd(p.a, v); },
          };
        }
        return {
          q: `バドミントンのシャトルの速さが $${DY('v')}=9.8-${k}v^{2}$ にしたがう。はじめ $v=0$ として、$\\Delta t=${dt}$ 秒のオイラー法で、$0.4$ 秒後の速さは約 □ m/s（小数第2位まで）`, a: `$${v2}$`, key: `shuttle`, easyCheck: false,
          easy: `$0.2$ 秒後 $9.8\\times0.2=${v1}$。$a=${accTeX(k, v1)}\\approx${a1r}$、$${v1}+${decStr(a1)}\\times0.2=${decStr(v2f)}\\approx${v2}$`,
          verify: p => { let v = 0; for (let s = 0; s < 2; s++) v += (9.8 - +k * v * v) * 0.2; return isRd(p.a, v); },
        };
      },
      // わな：オイラー法でなく、変わらなくなる速さ（終端速度）→ わざ 6-28
      trap(r) {
        const [k, v] = r.pick([['0.2', 7], ['0.05', 14], ['0.0125', 28], ['0.008', 35], ['0.002', 70], ['0.02', 'x']]);
        if (v === 'x') return null;
        return dest({ q: `$${DY('v')}=9.8-${k}v^{2}$ にしたがって落ちる物の速さが、それ以上速くならない（変わらなくなる）のは □ m/s`, a: `$${v}$`, key: `t${k}`, verify: p => isNum(p.a, Math.sqrt(9.8 / +k), 1e-9) }, '6-94',
          `1行ずつ進めなくても、$${DY('v')}=0$ とおけば $v=\\sqrt{\\frac{9.8}{${k}}}=${v}$`, ['6-28']);
      },
    },
  });

  // ---------------------------------------------------------------- 答えの「y=」（第40回 S-11）
  // 文に □ がない問題は、文の末尾に「＝ □」がつくので、答えには「y=」を書かない（「＝」が重ならないように）。
  //   「…を $t$ の式で □」のように文に □ があるときは、答えは「V=…」のまま
  ['6-16', '6-17', '6-18', '6-19', '6-20', '6-21', '6-22', '6-23', '6-24', '6-25', '6-26', '6-27', '6-28', '6-29', '6-30', '6-94'].forEach(id => {
    const d = M.waza[id];
    Object.keys(d.steps).forEach(st => {
      const f = d.steps[st];
      d.steps[st] = r => { const p = f(r); if (p && !String(p.q).includes('□')) p.a = String(p.a).replace(/^\$[A-Za-z]+=/, '$'); return p; };
    });
  });
  // ---------------------------------------------------------------- わなの答えと s3 の答えを重ねない（第40回 S-2）
  // 同じ見開き（アプリでは同じプリント）で、s3 に出た答えと同じ答えのわなは出さない（作りなおす。makeStep の回数の上限の中で）
  ['6-16', '6-17', '6-18', '6-19', '6-20', '6-21', '6-22', '6-23', '6-24', '6-25', '6-26', '6-27', '6-28', '6-29', '6-30', '6-94'].forEach(id => {
    const d = M.waza[id], s3 = d.steps.s3, trap = d.steps.trap;
    if (!s3 || !trap) return;
    const seen = r => { const o = r.s3ans || (r.s3ans = {}); return o[id] || (o[id] = new Set()); };
    d.steps.s3 = r => { const p = s3(r); if (p) seen(r).add(String(p.a)); return p; };
    d.steps.trap = r => { const p = trap(r); return p && seen(r).has(String(p.a)) ? null : p; };
  });
})(globalThis.MONDAI);

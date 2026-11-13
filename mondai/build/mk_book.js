// 問題集の本文を LaTeX に書き出す：node build/mk_book.js [巻]
//   tex/mq<巻>-list.tex  わざの一覧（前付）
//   tex/mq<巻>-body.tex  本文（部ごとに、わざの見開き → 見分けよう → 作ってみよう）
//   tex/mq<巻>-ans.tex   こたえ
// 問題は、わざの番号から決まった種で作る（MONDAI.makeSheet）。同じ版なら、何度書き出しても同じ問題になる。
'use strict';
const fs = require('fs');
const path = require('path');
const { load, ROOT } = require('./load');
const vol = +(process.argv[2] || 1);
const M = load(vol);
const TEX = path.resolve(ROOT, '..', 'tex');
const tx = (s, o) => M.toTeX(s, o);
const parts = M.parts[vol] || [];
const ids = M.list(vol);
const byPart = no => ids.filter(id => M.waza[id].part === no);

function box(def, step, p) { const w = M.boxwOf(def, step, p), h = M.boxhOf(def, step, p); if (h) return `\\mqboxt{${w || '15mm'}}{${h}}`; return w ? `\\mqbox[${w}]` : '\\mqbox{}'; }
const SQ = { box: '\\mqsq{}' };   // 説明の文の □ は、書きこむ欄ではない
function probLine(def, p, num, extra) {
  const q = M.withBox(p.q);
  // 表・プログラム（第6巻から。第39回）：文の下に置く
  const below = (p.table ? `\\mqfig{${M.tableTeX(p.table, { box: '\\mqbox[10mm]' })}}` : '') + (p.code ? `\\mqcodeblock{${M.codeTeX(p.code)}}` : '');
  if (below) return `\\mqp{${num}}{${tx(q, { box: box(def, p.step, p) })}${extra || ''}${below}}`;
  if (p.fig) return `\\mqpf{${num}}{${tx(q, { box: box(def, p.step, p) })}${extra || ''}}{${M.figTeX(p.fig, { vol })}}`;   // 図（第4巻から。第35回）：文の右に図
  return `\\mqp{${num}}{${tx(q, { box: box(def, p.step, p) })}${extra || ''}}`;
}
function probs(def, list, start, extra) {
  // ひっ算の問題は、方眼の絵をならべる（左から右へ、入るだけ）
  if (list.length && list[0].hs) {
    const items = list.map((p, i) => `\\mqhsp{${start + i}}{${M.hissanTeX(M.hissanLayout(p.hs), { cell: def.cell || 7.5 })}}`);
    return `\\begin{mqhsprobs}\n${items.join('\n')}\n\\end{mqhsprobs}`;
  }
  const cols = M.colsOf(def, list[0] && list[0].step);
  const lines = list.map((p, i) => probLine(def, p, start + i, extra && extra(p)));
  return `\\begin{mqprobs}{${cols}}\n${lines.join('\n')}\n\\end{mqprobs}`;
}
function lines(arr) { return arr.map(l => tx(l, SQ)).join('\\\\\n'); }

const body = [];
const ans = [];
const list = [];
body.push(`%% 自動生成（mondai/build/mk_book.js）。直すときは mondai/v${vol}/*.js を直して書き出し直す`);
ans.push(`%% 自動生成（mondai/build/mk_book.js）`);
list.push(`%% 自動生成（mondai/build/mk_book.js）`);

const TSUKURO = vol > 1 ? '《作|つく》ってみよう' : '《作|つく》って みよう';
for (const part of parts) {
  const pid = part.no;
  const pname = tx(part.name);
  if (!byPart(pid).length) continue;
  list.push(`\\mqlistpart{${pid}}{${pname}}{${tx(part.chaps)}}`);
  ans.push(`\\mqanspart{${pid}}{${pname}}`);
  for (const id of byPart(pid)) {
    const d = M.waza[id];
    const sh = M.makeSheet(id);
    list.push(`\\mqlistrow{${id}}{${tx(d.title, SQ)}}{${tx(d.mark, SQ)}}{${tx(d.chap)}}{${d.stars}}`);
    let n = 1;
    const out = [];
    out.push(`\\mqwaza{${id}}{${tx(d.title, SQ)}}{${tx(d.chap)}}{${d.stars}}{${pid}}{${pname}}`);
    if (d.flow) out.push(`\\typeout{MQFLOW ${id}}`);
    out.push(`\\mqmark{${tx(d.mark, SQ)}}`);
    out.push(`\\mqcompare{${lines(d.futsu)}}{${lines(d.raku)}}`);
    out.push(`\\mqwhy{${tx(d.why, SQ)}}`);
    out.push(`\\mqcaution{${tx(d.caution, SQ)}}`);
    const nums = {};
    M.STEPS.forEach(s => {
      const L = sh[s];
      if (!L.length) return;
      if (s === 's2' && !d.flow) out.push('\\mqrightpage');
      const fl = d.flow ? 'flow' : '';
      out.push(s === 'trap' ? `\\mqtrapstep${fl}{${tx(M.stepTitle(vol, s))}}` : `\\mqstep${fl}{${s}}{${tx(M.stepTitle(vol, s))}}`);
      out.push(probs(d, L, n));
      nums[s] = L.length;
      n += L.length;
    });
    out.push(`\\mqfurikaeri{${nums.s1 || 0}}{${nums.s2 || 0}}{${nums.s3 || 0}}`);
    body.push(out.join('\n'));
    // こたえ
    const a = [`\\mqanshead{${id}}{${tx(d.title, SQ)}}`];
    let k = 1;
    const STEPNAME = { s1: 'ステップ1', s2: 'ステップ2', s3: 'ステップ3', trap: 'わな' };   // 巻によらない
    M.STEPS.forEach(s => {
      if (sh[s].length) a.push(`\\mqansstep{${STEPNAME[s]}}`);
      sh[s].forEach(p => {
        if (p.hs) a.push(`\\mqahs${s === 'trap' && p.easy ? `[${tx(p.easy, SQ)}]` : ''}{${k}}{${tx(p.a, SQ)}}{${M.hissanTeX(M.hissanLayout(p.hs), { cell: 3.3, answer: true, font: '\\scriptsize' })}}`);
        else a.push(`\\mqa{${k}}{${tx(p.a, SQ)}}{${tx(p.easy || '', SQ).replace(/ (＝|＋|－|×|÷) /g, ' $1\\mqeqbreak ')}}`);
        k++;
      });
    });
    ans.push(a.join('\n'));
  }
  if (part.miwake && byPart(pid).length) list.push(`\\mqlistextra{${tx('《見|み》わけよう')}}{mq:sp:${pid}:miwake}`);
  if (part.tsukuro && part.tsukuro.length && byPart(pid).length) list.push(`\\mqlistextra{${tx(TSUKURO)}}{mq:sp:${pid}:tsukuro}`);
  // 見分けよう
  if (part.miwake && byPart(pid).length) {
    const r = M.rng(M.hash(`miwake:${vol}:${pid}`));
    const wz = byPart(pid);
    const seen = new Set();
    const pool = [];
    const nTrap = part.miwake.traps ?? 2;
    // must：かならず入れる問題 [[わざ, ステップ], …]。ほかの部のわざでもよい（第4巻 第5部で 4-46 と 4-63 をまぜる。K-7・第36回）
    const must = part.miwake.must || [];
    const usedTrap0 = new Set();
    const wzAll = wz.concat(must.map(m => m[0]).filter(id => !wz.includes(id)));
    const nMain = M.miwakeCount(part, wz.length) - nTrap;   // must の問題もふくめた数（pool に先に入れる）
    // 第6巻から：わざの見開きに出たステップ1・2の問題（key）は、見わけようでよける（第6巻 R2-19・第40回）。わなは数が決まっているのでそのまま
    //   key はわざごとにくらべる（ほかのわざの同じ形の key でよけすぎないように）
    const onSheet = new Set();
    if (vol >= 6) for (const id of wzAll) { const sh = M.makeSheet(id); M.STEPS.forEach(s => sh[s].forEach(p => { onSheet.add(id + '\u0000' + (p.key || p.q)); onSheet.add('\u0001' + p.q); })); }   // ほかのわざで同じ文になる問題も
    const fresh = p => !onSheet.has(p.id + '\u0000' + (p.key || p.q)) && !onSheet.has('\u0001' + p.q);
    for (const [id, st] of must) { for (let j = 0; j < 30; j++) { const got = M.makeStep(id, st, 1, r, seen); if (got.length && ((st === 'trap' && (vol < 7 || j >= 25)) || fresh(got[0]))) { pool.push(got[0]); break; } } if (vol >= 7 && st === 'trap') usedTrap0.add(id); }   // 第7巻から：must のわなも見開きと同じ問題をなるべくよけ、「もう選んだわな」に入れる（修B・修C の要望）
    // わざの順をまぜてから選ぶ（前のほうのわざだけに かたよらないように）
    const order = r.shuffle(wz.slice());
    for (let k = 0; pool.length < nMain && k < 2000; k++) {
      const id = order[k % order.length];
      const got = M.makeStep(id, r.pick(['s1', 's2']), 1, r, seen);
      if (got.length && fresh(got[0])) pool.push(got[0]);
    }
    const usedTrap = usedTrap0;
    for (let k = 0, t = 0; t < nTrap && k < 200; k++) {
      const id = r.pick(wz);
      if (!M.waza[id].steps.trap) continue;
      if (vol >= 4 && usedTrap.has(id) && k < 150) continue;   // 第4巻から：わなは1わざ1問（修B の要望）
      usedTrap.add(id);
      const got = M.makeStep(id, 'trap', 1, r, seen);
      if (got.length) { pool.push(got[0]); t++; }
    }
    const mixed = r.shuffle(pool);
    // 第7巻から：右ページの「この部のわざ」の表は、題の前半（式の外の「：」「。」「（」の前）だけ（表が長くて問題をへらさないように。第7巻 書く組の要望）
    const mwTitle = t => { if (vol < 7) return t; let o = '', q = 0; const sg = t.split(/(\$[^$]*\$)/); for (let k = 0; k < sg.length; k++) { if (k % 2) { o += sg[k]; continue; } for (const ch of sg[k]) { if (ch === '「') q++; else if (ch === '」') q--; else if (q <= 0 && /[：。（]/.test(ch)) return o.trim().length >= 4 ? o.trim() : t; o += ch; } } return t; };   // 「 」の中では切らない（第7巻 R1-21）
    const intro = vol > 1
      ? '《見|み》たことのあるわざがまざっています。まず、どのわざを《使|つか》うかを《右|みぎ》の「わざ」に《書|か》いてから《解|と》きましょう。《使|つか》えるわざがないときは「なし」と《書|か》きます。わざの《番号|ばん|ごう》は、《右|みぎ》のページの《下|した》の《表|ひょう》を《見|み》ましょう。' + (vol >= 6 ? '前の部のわざを使うときは、その番号を書きます。' : '')
      : '《見|み》た ことの ある わざが まざって いるよ。 まず、 どの わざを つかうかを 《右|みぎ》の「わざ」に 《書|か》いて から とこう。 つかう わざが ない ときは「なし」と 《書|か》こう。 わざの ばんごうは、 《右|みぎ》の ページの 下の ひょうを 《見|み》よう。';
    // 欄のはばは、どのわざでも同じにする（はばが手がかりにならないように）
    const lines2 = mixed.map((p, i) => {
      const bw = M.boxwOf(M.waza[p.id], p.step, p), bh = M.boxhOf(M.waza[p.id], p.step, p), nb = (M.withBox(p.q).match(/□/g) || []).length;
      // 第4巻から：欄のはばは2種類だけ（15mm と 32mm。はばがわざの手がかりにならないように。H-7・第36回）。高い欄（分数）はそのまま
      const w = vol >= 4 ? (nb > 1 ? '13mm' : bw && parseFloat(bw) > 20 ? '32mm' : '15mm') : (nb > 1 ? '13mm' : bw && parseFloat(bw) > 15 ? bw : '15mm');
      const bx = vol >= 4 && bh && nb <= 1 ? `\\mqboxt{${w}}{${bh}}` : `\\mqbox[${w}]`;
      return `\\mqp{${i + 1}}{${tx(M.withBox(p.q), { box: bx })}\\mqwazabox}`;
    });
    const half = Math.ceil(lines2.length / 2);
    body.push(`\\def\\mqsplabelkey{miwake}\\mqspreadhead{${pid}}{${pname}}{${tx('《見|み》わけよう')}}{${tx(intro)}}\n\\begin{mqprobs}{1}\n${lines2.slice(0, half).join('\n')}\n\\end{mqprobs}\n\\mqrightpage\n\\begin{mqprobs}{1}\n${lines2.slice(half).join('\n')}\n\\end{mqprobs}\n\\mqmiwaketable{${wzAll.map(id => `\\mqmwrow{${id}}{${tx(mwTitle(M.waza[id].title), SQ)}}`).join('')}}`);
    const a = [`\\mqanssub{${tx('《見|み》わけよう')}（\\R{第}{だい}${pid}\\R{部}{ぶ}）}`];
    mixed.forEach((p, i) => { const u = M.usableWaza(p, wzAll); const nashi = !u.length && p.easy && /わざなし|わざ なし|楽な形なし/.test(M.plain(p.easy)); a.push(`\\mqa{${i + 1}}{${tx(p.a, SQ)}}{${(u.length && p.easy && u.every(id => p.easy.includes(id))) || nashi ? tx(p.easy, SQ) : (u.length ? 'わざ ' + u.join('・') : 'わざ なし') + (p.easy ? '：' + tx(p.easy, SQ) : '')}}`); });   // 楽な形に「わざなし」があれば前に重ねない（第36回）
    ans.push(a.join('\n'));
  }
  // 作ってみよう
  if (part.tsukuro && part.tsukuro.length && byPart(pid).length) {
    const intro = vol > 1
      ? '《答|こた》えは1つではありません。《自分|じ|ぶん》で《作|つく》った《問題|もん|だい》を、ともだちと《解|と》き《合|あ》ってみましょう。'
      : 'こたえは 1つでは ないよ。 じぶんで 《作|つく》った もんだいを、 ともだちや おうちの 《人|ひと》と とき あって みよう。';
    const qs = part.tsukuro.map((t, i) => `\\mqtsukuro{${i + 1}}{${tx(t.q, { box: '\\mqsq{}' })}}`);
    body.push(`\\def\\mqsplabelkey{tsukuro}\\mqspreadhead{${pid}}{${pname}}{${tx(TSUKURO)}}{${tx(intro)}}\n${qs.join('\n')}`);
    const a = [`\\mqanssub{${tx(TSUKURO)}（\\R{第}{だい}${pid}\\R{部}{ぶ}）}`];
    part.tsukuro.forEach((t, i) => a.push(`\\mqtsukuroans{${i + 1}}{${tx(t.ex, { box: '\\mqsq{}' }).replace(/ (＝|＋|－|×|÷) /g, ' $1\\mqeqbreak ')}}`));
    ans.push(a.join('\n'));
  }
}
fs.writeFileSync(path.join(TEX, `mq${vol}-body.tex`), body.join('\n\n') + '\n');
fs.writeFileSync(path.join(TEX, `mq${vol}-ans.tex`), ans.join('\n') + '\n');
list.push(`\\mqlistextra{${vol > 1 ? '\\R{答}{こた}え' : 'こたえ'}}{mq:answers}`);
fs.writeFileSync(path.join(TEX, `mq${vol}-list.tex`), list.join('\n') + '\n');
console.log(`mq${vol}: わざ ${ids.length}、部 ${parts.length}。tex/mq${vol}-body.tex・-ans.tex・-list.tex を書いた`);

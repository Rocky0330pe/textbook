// わざの検査：node build/check.js [巻] [わざの番号…]
//  ・どのステップも、決まった数の問題が作れるか（同じ問題を2回出さない）
//  ・答えが式の値と合うか、楽な形の値が答えと合うか（MONDAI.checkProblem）
//  ・第1巻は、ルビのない漢字がないか（文・問題・答え・楽な形）
//  ・種を変えて 200 回作っても、まちがいが出ないか
'use strict';
const { load } = require('./load');
const vol = +(process.argv[2] || 1);
const M = load(vol);
const only = process.argv.slice(3);
const ids = M.list(vol).filter(id => !only.length || only.includes(id));
const KANJI = /[一-鿿々]/;
function bareKanji(s) {
  if (!s) return false;
  const t = String(s).replace(/《[^》]*》/g, '');
  return KANJI.test(t);
}
// 第1巻：教科書 第1巻で使っている漢字だけ（v1/kanji1.txt。tex/ch1-*.tex から作った）
const fs0 = require('fs'), path0 = require('path');
const kf = path0.join(__dirname, '..', 'v' + vol, 'kanji' + vol + '.txt');
const ALLOWED = fs0.existsSync(kf) ? new Set([...fs0.readFileSync(kf, 'utf8').trim()]) : null;
function badKanji(s) {
  if (!ALLOWED || !s) return [];
  return [...new Set([...M.plain(String(s))].filter(ch => KANJI.test(ch) && !ALLOWED.has(ch)))];
}
let bad = 0;
const report = [];
for (const id of ids) {
  const d = M.waza[id];
  const errs = [];
  if (vol <= 3) {
    for (const f of ['title', 'mark', 'why', 'caution']) if (bareKanji(d[f])) errs.push(`${f} にルビのない漢字`);
    for (const f of ['futsu', 'raku']) (d[f] || []).forEach((l, i) => { if (bareKanji(l)) errs.push(`${f}[${i}] にルビのない漢字`); });
    const bk = new Set();
    for (const f of ['title', 'mark', 'why', 'caution']) badKanji(d[f]).forEach(c => bk.add(c));
    for (const f of ['futsu', 'raku']) (d[f] || []).forEach(l => badKanji(l).forEach(c => bk.add(c)));
    if (bk.size) errs.push(`教科書 第1巻にない漢字：${[...bk].join('')}`);
  }
  for (const f of ['title', 'mark', 'futsu', 'raku', 'why', 'caution', 'steps']) if (!d[f]) errs.push(`${f} がない`);
  const sheet = M.makeSheet(id);
  for (const s of M.STEPS) {
    const want = d.counts[s];
    if (d.steps[s] && sheet[s].length < want) errs.push(`${s}: ${want}問のはずが ${sheet[s].length}問しか作れない`);
  }
  for (let seed = 1; seed <= 200; seed++) {
    const sh = M.makeSheet(id, { seed });
    for (const s of M.STEPS) for (const p of sh[s]) {
      const e = M.checkProblem(p);
      if (e.length) errs.push(`${s} 種${seed}「${M.plain(p.q)}」: ${e.join(' / ')}`);
      if (vol <= 3) for (const f of ['q', 'a', 'easy']) if (bareKanji(p[f])) errs.push(`${s}「${M.plain(p.q)}」の ${f} にルビのない漢字`);
      for (const f of ['q', 'a', 'easy']) { const b = badKanji(p[f]); if (b.length) errs.push(`${s}「${M.plain(p.q)}」の ${f} に教科書 第1巻にない漢字：${b.join('')}`); }
    }
    if (errs.length > 8) break;
  }
  const uniq = [...new Set(errs)];
  if (uniq.length) bad++;
  const cnt = M.STEPS.map(s => sheet[s].length).join('/');
  report.push(`${uniq.length ? 'NG' : 'OK'} ${id} ${M.plain(d.title)}  [${cnt}]` + (uniq.length ? '\n   - ' + uniq.slice(0, 8).join('\n   - ') : ''));
}
// 部の見開き（作ってみよう）の文
for (const part of (M.parts[vol] || [])) {
  const errs = [];
  if (vol <= 3) {
    if (bareKanji(part.name)) errs.push('name');
    (part.tsukuro || []).forEach((t, i) => { const b = badKanji(t.q).concat(badKanji(t.ex)); if (b.length) errs.push(`tsukuro[${i}] 教科書にない漢字 ${[...new Set(b)].join('')}`); });
    (part.tsukuro || []).forEach((t, i) => { if (bareKanji(t.q)) errs.push(`tsukuro[${i}].q`); if (bareKanji(t.ex)) errs.push(`tsukuro[${i}].ex`); });
  }
  if (errs.length) { bad++; report.push(`NG 第${part.no}部: ルビのない漢字 ${errs.join(', ')}`); }
}
console.log(report.join('\n'));
console.log(`\nわざ ${ids.length}個、まちがいのあるわざ ${bad}個`);
process.exit(bad ? 1 : 0);

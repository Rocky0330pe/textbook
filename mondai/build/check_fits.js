// 見わけようの 判定（fits）の 確かめ：node build/check_fits.js [巻] [--seeds N] [--ex K] [--detail 1-16,1-19]
//  ・部ごとに、その部の すべての わざの s1〜s3・わな の 問題を、種を N とおり 変えて 作る（同じ文の 問題は 1つに まとめる）
//  ・わざごとに：自分の 問題に 自分の fits が true に なる 割合（ステップごと。低いと 目印の 規則が せまい）、
//    ほかの わざの 問題に true に なる 数（多いと 広すぎる。どの わざの 問題に 当たったかも 出す）
//  ・わなの 問題に、同じ部の どれかの fits が true に なる もの（わなが 本当は ほかの わざで 楽に なって いる 疑い）
//  ・本の 見わけようの 答え（mk_book.js と 同じ 種で 作った 問題と、M.usableWaza の 答え）
//  fits が 例外を 出したら まちがいとして 出す（M.usableWaza は 例外を だまって とばすので、ここで 見る）
'use strict';
const { load } = require('./load');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? +args[i + 1] : def; };
const vol = +(args.find((a, i) => /^\d+$/.test(a) && !/^--/.test(args[i - 1] || '')) || 1);
const SEEDS = opt('--seeds', 60);
const EX = opt('--ex', 3);
//  --detail：その わざの fits が ほかの わざの 問題に 当たった 例を、 当たりさきごとに 出す
const DETAIL = args.includes('--detail') ? (args[args.indexOf('--detail') + 1] || '').split(',') : [];
const M = load(vol);
const STEPS = ['s1', 's2', 's3'];
const pct = (a, b) => (b ? Math.round(100 * a / b) + '%' : '-');
const pad = (s, n) => { s = String(s); return s + ' '.repeat(Math.max(0, n - [...s].length)); };
let errors = 0;
const errSeen = new Set();
function fitsOf(id, p) {
  const d = M.waza[id];
  if (!d.fits) return false;
  try { return !!d.fits(M.plain(p.q), p); } catch (e) {
    const k = id + ':' + e.message;
    if (!errSeen.has(k)) { errSeen.add(k); errors++; console.log(`  まちがい：${id} の fits が 例外「${e.message}」（問題「${M.plain(p.q)}」）`); }
    return false;
  }
}

const parts = (M.parts[vol] || []).map(pt => pt.no);
const allParts = [...new Set(M.list(vol).map(id => M.waza[id].part))].sort((a, b) => a - b);
const noFits = [];
for (const no of allParts) {
  const wz = M.list(vol).filter(id => M.waza[id].part === no);
  const pinfo = (M.parts[vol] || []).find(pt => pt.no === no);
  console.log(`\n================ 第${no}部 ${pinfo ? M.plain(pinfo.name) : ''}（わざ ${wz[0]}〜${wz[wz.length - 1]}、 種 ${SEEDS}とおり）`);
  // 問題を 作る（わざ × ステップごとに、文の ちがう 問題）
  const probs = {};   // id → step → [p]
  for (const id of wz) {
    probs[id] = {};
    for (const s of STEPS.concat('trap')) {
      const seen = new Map();
      for (let seed = 1; seed <= SEEDS; seed++) {
        const sh = M.makeSheet(id, { seed });
        for (const p of sh[s] || []) if (!seen.has(p.q)) seen.set(p.q, p);
      }
      probs[id][s] = [...seen.values()];
    }
  }
  // わざごとの 表
  console.log('\n わざ   自分の問題に当たる割合 s1 / s2 / s3 （数）     ほかの わざの 問題に 当たる 数（s1〜s3 の うち）と おもな 当たりさき');
  for (const c of wz) {
    if (!M.waza[c].fits) { noFits.push(c); console.log(` ${c}   fits なし`); continue; }
    const own = STEPS.map(s => { const L = probs[c][s]; const h = L.filter(p => fitsOf(c, p)).length; return [h, L.length]; });
    const ownTxt = own.map(([h, n]) => pad(pct(h, n), 4)).join(' / ') + ' （' + own.map(([h, n]) => `${h}/${n}`).join('・') + '）';
    let cross = 0, total = 0;
    const by = [];
    for (const id of wz) {
      if (id === c) continue;
      let h = 0, n = 0;
      for (const s of STEPS) for (const p of probs[id][s]) { n++; if (fitsOf(c, p)) h++; }
      cross += h; total += n;
      if (h) by.push([id, h, n]);
    }
    by.sort((x, y) => y[1] / y[2] - x[1] / x[2]);
    const byTxt = by.slice(0, 4).map(([id, h, n]) => `${id} ${pct(h, n)}`).join('、 ') + (by.length > 4 ? ` ほか ${by.length - 4}` : '');
    console.log(` ${c}   ${pad(ownTxt, 44)} ${pad(`${cross}/${total}（${pct(cross, total)}）`, 16)} ${byTxt}`);
    if (DETAIL.includes(c)) for (const [id] of by) {
      const ex = STEPS.flatMap(s => probs[id][s]).filter(p => fitsOf(c, p)).slice(0, EX).map(p => `${p.step}「${M.plain(p.q)}」`);
      console.log(`          ${id} の 問題：${ex.join('　')}`);
    }
  }
  // 自分の 問題で 当たらない 例（目印の 規則が せまい ところ）
  console.log('\n 自分の 問題で fits が false の 例（ステップ1・2 は 見わけように 出る）');
  for (const c of wz) {
    if (!M.waza[c].fits) continue;
    const miss = [];
    for (const s of STEPS) for (const p of probs[c][s]) if (!fitsOf(c, p)) miss.push(`${s}「${M.plain(p.q)}」`);
    if (miss.length) console.log(`  ${c}：${miss.length}問　例 ${miss.slice(0, EX).join('　')}`);
  }
  // わなの 問題に 当たる fits
  console.log('\n わなの 問題に、 同じ部の fits が true に なる もの（答えは「わざ なし」に なって いる）');
  let any = false;
  for (const id of wz) {
    const hit = new Map();   // c → [q]
    for (const p of probs[id].trap) for (const c of wz) if (fitsOf(c, p)) { if (!hit.has(c)) hit.set(c, []); hit.get(c).push(M.plain(p.q)); }
    for (const [c, qs] of hit) {
      any = true;
      console.log(`  ${id} の わな ${qs.length}/${probs[id].trap.length}問 → ${c}${c === id ? '（自分）' : ''} が 当たる　例 ${qs.slice(0, EX).map(q => `「${q}」`).join(' ')}`);
    }
  }
  if (!any) console.log('  なし');
  // 本の 見わけようの 答え（mk_book.js と 同じ 作り方）
  if (pinfo && pinfo.miwake) {
    const r = M.rng(M.hash(`miwake:${vol}:${no}`));
    const seen = new Set(), pool = [];
    const nTrap = pinfo.miwake.traps || 2, nMain = M.miwakeCount(pinfo, wz.length) - nTrap;
    const must = pinfo.miwake.must || [], wzAll = wz.concat(must.map(m => m[0]).filter(id => !wz.includes(id)));   // mk_book.js と同じ（第36回 N-4）
    for (const [id, st] of must) { const got = M.makeStep(id, st, 1, r, seen); if (got.length) pool.push(got[0]); }
    const order = r.shuffle(wz.slice());
    for (let k = 0; pool.length < nMain && k < 2000; k++) {
      const got = M.makeStep(order[k % order.length], r.pick(['s1', 's2']), 1, r, seen);
      if (got.length) pool.push(got[0]);
    }
    const usedTrap = new Set();
    for (let k = 0, t = 0; t < nTrap && k < 200; k++) {
      const id = r.pick(wz);
      if (!M.waza[id].steps.trap) continue;
      if (vol >= 4 && usedTrap.has(id) && k < 150) continue;   // 第4巻から：わなは1わざ1問（修B の要望）
      usedTrap.add(id);
      const got = M.makeStep(id, 'trap', 1, r, seen);
      if (got.length) { pool.push(got[0]); t++; }
    }
    console.log('\n 本の 見わけようの 答え');
    r.shuffle(pool).forEach((p, i) => {
      const u = M.usableWaza(p, wzAll);
      console.log(`  ${pad(i + 1, 3)}${pad(M.plain(p.q), 34)} → ${u.length ? 'わざ ' + u.join('・') : 'わざ なし'}${p.step === 'trap' ? `（${p.id} の わな）` : ''}`);
    });
  }
}
console.log(`\nfits の ない わざ：${noFits.length ? noFits.join('、 ') : 'なし'}　　fits の 例外：${errors}`);
process.exit(errors ? 1 : 0);

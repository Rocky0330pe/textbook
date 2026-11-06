// Node.js で、ブラウザと同じ順にスクリプトを読む（core.js → v1/[a-f]_*.js → v1/parts.js）
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
function files(vol) {
  const dir = path.join(ROOT, 'v' + vol);
  const groups = fs.readdirSync(dir).filter(f => /^[a-z]_.*\.js$/.test(f)).sort();
  const out = [path.join(ROOT, 'core.js')].concat(groups.map(f => path.join(dir, f)));
  if (fs.existsSync(path.join(dir, 'parts.js'))) out.push(path.join(dir, 'parts.js'));
  return out;
}
function load(vol) {
  vol = vol || 1;
  for (const f of files(vol)) vm.runInThisContext(fs.readFileSync(f, 'utf8'), { filename: f });
  return globalThis.MONDAI;
}
module.exports = { load, files, ROOT };

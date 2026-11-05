# calc_p3_04_out.txt の %SEG の点を tex/p3-04.tex の @@…@@ に入れる（一度だけ使う）。リポジトリの根で動かす
import re
L = open('checks/物理第3巻/波-4/calc_p3_04_out.txt').read().split('\n')
seg = {}
for k, l in enumerate(L):
    m = re.match(r'^%SEG (\w+)', l)
    if m:
        seg[m.group(1)] = L[k+1].strip()
p = 'tex/p3-04.tex'
s = open(p).read()
s = s.replace("%%   ・ドローンの姿勢の制御の回数「1秒に数百回以上」：〔要確認〕（機体と制御ソフトで大きく違う。メーカーの公開資料で確かめられなかった）",
              "%%   ・ドローンの姿勢の制御の回数「1秒に数百回以上」：Betaflight の説明（https://betaflight.com/docs/wiki/app/configuration-tab。PID の計算は 1〜8 kHz）。")
for k, v in {'@@P@@': 'P', '@@PI@@': 'PI', '@@PIX@@': 'PIX', '@@DEAD9@@': 'DEAD9', '@@DEAD18@@': 'DEAD18'}.items():
    assert s.count(k) == 1, k
    s = s.replace(k, seg[v])
open(p, 'w').write(s)
print('filled')

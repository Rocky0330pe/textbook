# -*- coding: utf-8 -*-
"""物理第2巻 確認の直し 修2-6（熱-15・熱-16・巻末）で変えた数の検算。
使い方（リポジトリの根で）:  python3 checks/物理第2巻/確認/fix6_check.py > checks/物理第2巻/確認/fix6_check_out.txt
"""
import math, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..')
kB = 1.380649e-23
e = 1.602176634e-19
R = 8.314462618

print('== Q6-4 熱-15 例題7：差 0.1 eV、300 K')
kT_eV = kB * 300 / e
print('k_B T =', round(kB * 300, 26), 'J =', round(kT_eV, 5), 'eV（紙面 0.0259）')
a = 0.1 / 0.0259
print('0.1/0.0259 =', round(a, 4), '→ 紙面「≈3.86」')
print('e^-3.86 =', round(math.exp(-3.86), 4), ' e^-(0.1/0.0259) =', round(math.exp(-a), 4), '→ 紙面「≈0.021」（答えは変わらない）')

print('== Q6-3 熱-15 例題3：2個とも左の確率')
print('左右の並び方', 2 ** 2, '通り、2個とも左 1 通り：1/4 =', 1 / 4, '= (1/2)^2 =', 0.5 ** 2)
print('100個とも左：(1/2)^100 =', '%.2e' % 0.5 ** 100)

print('== Q6-5 熱-15 章末問題（チャレンジから基本の8へ移した問題）：混ぜたときのエントロピー')
sN = 0.79 * R * math.log(1 / 0.79); sO = 0.21 * R * math.log(1 / 0.21)
print('窒素 %.3f J/K、酸素 %.3f J/K、あわせて %.3f J/K（紙面 1.55・2.72・約4.3）' % (sN, sO, sN + sO))
src15 = open(os.path.join(ROOT, 'tex', 'p2-15.tex'), encoding='utf-8').read()
tail = src15[src15.index(r'\bkendproblems'):]
kihon = tail[tail.index('{基本}'):tail.index('{チャレンジ}')].count(r'\bkproblem ')
chal = tail[tail.index('{チャレンジ}'):].count(r'\bkproblem ')
print('章末問題：基本 %d・チャレンジ %d（U-2 の目安 基本4〜8・チャレンジ2〜4）' % (kihon, chal))

print('== Q6-9 熱-16 表2（表計算）')
for row, eta, fuel in ((2, 0.60, 802.6), (3, 0.40, 802.6), (4, 0.40, 393.5), (5, 0.45, 393.5)):
    C = 3.6 / eta; D = 44000 / fuel
    print('行%d：C=%.1f MJ、D=%.1f g/MJ、E=C×D=%.2f → %d g/kWh' % (row, C, D, C * D, round(C * D)))
print('（4行めは 1006。前の 1007 は M=44.01 で計算した値：%.2f）' % (9.0 * 44010 / 393.5))

print('== U-10 ヘリウム（巻末の気体の表と注）')
try:
    import CoolProp
    import CoolProp.CoolProp as CP
    M = CP.PropsSI('M', 'Helium')
    print('CoolProp', CoolProp.__version__, '：M = %.3f g/mol、R_s = %.0f J/(kg·K)、20 ℃の音速 %.1f m/s → 1008'
          % (M * 1000, R / M, CP.PropsSI('A', 'T', 293.15, 'P', 101325, 'Helium')))
    print('空気の音速 %.1f m/s → 343' % CP.PropsSI('A', 'T', 293.15, 'P', 101325, 'Air'))
except ImportError:
    pass
M = 4.002602e-3
print('理想気体 a=sqrt(γ R_s T)：γ=5/3、R_s=%.1f、T=293.15 K → %.1f m/s' % (R / M, math.sqrt(5 / 3 * R / M * 293.15)))
fluid = open(os.path.join(ROOT, 'tex', 'ph2-fluid.tex'), encoding='utf-8').read()
print('ph2-fluid.tex の注：', re.search(r'熱-4 の音速（[^）]*）', fluid).group(0))

print('== U-6 記号カード：巻末の数学の記号の行と、章のカードの重なり（\\dot Q）')
back = open(os.path.join(ROOT, 'tex', 'ph2-back.tex'), encoding='utf-8').read()
rows = [l for l in back.splitlines() if l.startswith(r'\bkkigorow')]
print('巻末の数学の記号の行で \\dot Q をふくむもの：', [l[:60] for l in rows if 'dot Q' in l or 'dot{Q}' in l])
cards = []
for fn in sorted(os.listdir(os.path.join(ROOT, 'tex'))):
    if re.match(r'^p2-\d\d\.tex$', fn):
        t = open(os.path.join(ROOT, 'tex', fn), encoding='utf-8').read()
        for m in re.finditer(r'\\bkkigocard\{', t):
            args, i = [], m.end() - 1
            for _ in range(2):          # 1つめ（記号）と2つめ（読み）の引数を、かっこの深さを数えて取り出す
                depth, j = 0, i
                while True:
                    depth += {'{': 1, '}': -1}.get(t[j], 0)
                    if depth == 0:
                        break
                    j += 1
                args.append(t[i + 1:j]); i = j + 1
            cards.append((args[0], args[1], fn))
dq = [c for c in cards if 'dot Q' in c[0] or 'dot{Q}' in c[0]]
print('章のカードの \\dot Q：', dq)
from collections import defaultdict
d = defaultdict(list)
for sym, yomi, fn in cards:
    d[re.sub(r'\s+', '', sym)].append((fn, yomi))
print('同じ記号のカードが2つ以上ある記号（意味がちがう U・h・x・ε などもふくむ）：')
for k, v in sorted(d.items()):
    if len(v) > 1:
        print('  ', k, v)

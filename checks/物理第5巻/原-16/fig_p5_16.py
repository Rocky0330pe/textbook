#!/usr/bin/env python3
"""原-16 の図の位置（対数の目もり）の検算。python3 fig_p5_16.py
図 fig-jikan：x〔mm〕＝13×(log10(年)＋3)。図 fig-noudo：x〔mm〕＝40＋15×(log10(Bq/L)＋1)。"""
import math

DAYY = 1 / 365.25


def xj(years):
    return 13 * (math.log10(years) + 3)


print('== 図 fig-jikan（時間の物差し）')
for name, y in (('1日', DAYY), ('1年', 1), ('10年', 10), ('100年', 100), ('1000年', 1e3), ('1万年', 1e4),
                ('10万年', 1e5), ('100万年', 1e6)):
    print(f'目もり {name}: x={xj(y):.2f}')
for name, T in (('ヨウ素131 8日', 8 * DAYY), ('セシウム137 30年', 30), ('プルトニウム239 24110年', 24110)):
    print(f'{name}: 半減期 x={xj(T):.2f}、1000分の1（10倍）x={xj(10 * T):.2f}、長さ {xj(10 * T) - xj(T):.2f} mm')
print(f'ガラス固化体 30〜50年: x={xj(30):.2f}〜{xj(50):.2f}')


def xn(c):
    return 40 + 15 * (math.log10(c) + 1)


print('\n== 図 fig-noudo（トリチウムの濃さ）')
for name, c in (('告示濃度限度 60000', 60000), ('WHO 10000', 10000), ('放出の上限 1500', 1500), ('放出口の近く 30', 30),
                ('周辺の海 0.1', 0.1), ('周辺の海 1', 1)):
    print(f'{name} Bq/L: x={xn(c):.2f}')

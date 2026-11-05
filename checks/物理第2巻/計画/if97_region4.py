# -*- coding: utf-8 -*-
"""物理第2巻『熱学』計画書（組 P2-R）：IAPWS-IF97 の領域4（飽和線）を自分で組んだもの。

計画書 tools/phys2-plan.md の C-7（巻末の蒸気表の作り方）の「自分で組む式」の見本。
係数は IAPWS-IF97（改訂版 2007）の領域4の式 (30)・(31) の n1〜n10。
- psat(T)：飽和圧力〔MPa〕（T は K、273.15〜647.096 K）
- tsat(p)：飽和温度〔K〕（p は MPa、611.213 Pa〜22.064 MPa）
動かすと、IF97 の検証表の値（文書の表35・36。〔要〕原文で照合）と、入っていれば
iapws（IF97）・CoolProp（IAPWS-95）の値と照らし合わせる。
"""
import math

N = [None,
     0.11670521452767e4, -0.72421316598447e6, -0.17073846940092e2,
     0.12020824702470e5, -0.32325550322333e7, 0.14915108613530e2,
     -0.48232657361591e4, 0.40511340542057e6, -0.23855557567849,
     0.65017534844798e3]


def psat(T):
    n = N
    th = T + n[9] / (T - n[10])
    A = th * th + n[1] * th + n[2]
    B = n[3] * th * th + n[4] * th + n[5]
    C = n[6] * th * th + n[7] * th + n[8]
    return (2 * C / (-B + math.sqrt(B * B - 4 * A * C))) ** 4


def tsat(p):
    n = N
    be = p ** 0.25
    E = be * be + n[3] * be + n[6]
    F = n[1] * be * be + n[4] * be + n[7]
    G = n[2] * be * be + n[5] * be + n[8]
    D = 2 * G / (-F - math.sqrt(F * F - 4 * E * G))
    return (n[10] + D - math.sqrt((n[10] + D) ** 2 - 4 * (n[9] + n[10] * D))) / 2


# IF97 の検証の値（表35：psat、表36：Tsat）。記憶から写した値なので〔要〕：原文で照合する
VERIFY_P = [(300, 0.353658941e-2), (500, 0.263889776e1), (600, 0.123443146e2)]
VERIFY_T = [(0.1, 0.372755919e3), (1.0, 0.453035632e3), (10.0, 0.584149488e3)]

if __name__ == "__main__":
    print("== IF97 領域4 の検証の値との照合")
    for T, ref in VERIFY_P:
        v = psat(T)
        print(f"psat({T} K) = {v:.9e} MPa  検証値 {ref:.9e}  相対差 {abs(v-ref)/ref:.1e}")
    for p, ref in VERIFY_T:
        v = tsat(p)
        print(f"tsat({p} MPa) = {v:.9e} K  検証値 {ref:.9e}  差 {abs(v-ref):.1e} K")
    try:
        from iapws import IAPWS97
        print("== iapws（IF97）との照合")
        for t in [0.01, 20, 50, 100, 150, 200, 250, 300, 350, 370]:
            T = t + 273.15
            s = IAPWS97(T=T, x=0)
            print(f"{t:6.2f} ℃  自作 {psat(T)*1e3:12.4f} kPa  iapws {s.P*1e3:12.4f} kPa")
    except ImportError:
        print("iapws がないので、照合を飛ばした（pip install iapws）")
    try:
        from CoolProp.CoolProp import PropsSI
        print("== CoolProp（IAPWS-95）との照合（IF97 と IAPWS-95 のちがいは 0.1 % 以下のはず）")
        for t in [20, 100, 200, 300]:
            T = t + 273.15
            c = PropsSI('P', 'T', T, 'Q', 0, 'Water')
            print(f"{t:6.2f} ℃  自作 {psat(T)*1e6:12.1f} Pa  CoolProp {c:12.1f} Pa  相対差 {abs(psat(T)*1e6-c)/c:.1e}")
    except ImportError:
        print("CoolProp がないので、照合を飛ばした（pip install CoolProp）")
    # 計画書で使う値
    print("== 計画書で使う値")
    for kpa in [63, 101.325, 181.3, 200]:
        print(f"{kpa} kPa の飽和温度 {tsat(kpa/1000)-273.15:.2f} ℃")
    for t in [5, 9.3, 16.7, 20, 25, 30]:
        print(f"{t} ℃ の飽和蒸気圧 {psat(t+273.15)*1e3:.4f} kPa")

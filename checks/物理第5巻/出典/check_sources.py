# 物理第5巻『原子』：出典の組（11月11日）。〔要確認〕・二次資料で照らした値を、一次資料の値とくらべる。
# 使い方：python3 check_sources.py > check_sources_out.txt（下の SNAP の値は、下の URL を curl で読んで写した）
# 一次資料（すべて 2026年11月11日に curl で読んだ）
#   IAEA LiveChart の API（ENSDF・ENDF/B の収率）https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=137cs など
#   IAEA Neutron Data Standards 2017 表11 https://nds.iaea.org/standards/std2017/Standards2017_TNC.txt
#   NIST NCNR の散乱長と断面積の表 https://www.ncnr.nist.gov/resources/n-lengths/list.html
#   PDG 2025 https://pdg.lbl.gov/2025/listings/rpp2025-list-pi-plus-minus.pdf
#   IS-GPS-200N https://www.gps.gov/sites/default/files/2025-07/IS-GPS-200N.pdf、https://www.gps.gov/space-segment

# 半減期（ENSDF）
SNAP_HL = {'14c': (5700, 'Y'), '226ra': (1600, 'Y'), '235u': (7.04e8, 'Y'), '238u': (4.468e9, 'Y'), '212po': (294.3, 'ns'),
           '210po': (138.376, 'd'), '60co': (1925.28, 'd'), '137cs': (30.08, 'Y'), '135i': (6.58, 'h'), '135xe': (9.14, 'h'),
           '99mo': (65.924, 'h'), '222rn': (3.8222, 'd'), '131i': (8.0252, 'd'), '134cs': (2.0652, 'Y'),
           '40k': (1.248e9, 'Y'), '3h': (12.32, 'Y')}
# 放射線のエネルギー keV と放出の割合 %（ENSDF）
SNAP_RAD = {'Cs-137（Ba-137m）γ': (661.657, 85.1), 'Co-60 γ1': (1173.228, 99.85), 'Co-60 γ2': (1332.492, 99.9826),
            'Po-210 α': (5304.33, 100), 'Y-90 β の最大': (2278.5, 99.9885), 'Ra-226 α': (4784.34, 94.07)}
# ウラン235 の熱中性子の分裂の収率（IAEA LiveChart、分裂1回あたり）
SNAP_FY = {'I-135 累積': 0.063853, 'Xe-135 累積': 0.06614, 'Xe-135 独立（基底）': 0.00069118, 'Xe-135m 独立': 0.0016686}
STD2017 = {'nu': (2.425, 0.011), 'sf': (587.3, 1.4), 'sc': (99.5, 1.3)}
NCNR = {'1H abs b': 0.3326, 'Co abs b': 37.18, '235U abs b': 680.9, '238U abs b': 2.68}
PDG_PI = 139.57039
GPS_AREF_M = 26559710
TO_S = {'Y': 365.2422 * 86400, 'd': 86400, 'h': 3600, 'ns': 1e-9}


p = print
p('== 半減期（ENSDF）と本文の値')
text = {'14c': ('5700 年（計算は 5730 年）', 5700 * TO_S['Y']), '226ra': ('1600 年', 1600 * TO_S['Y']),
        '235u': ('7.04×10^8 年', 7.04e8 * TO_S['Y']), '238u': ('4.47×10^9 年・45億年', 4.47e9 * TO_S['Y']),
        '212po': ('0.3 μs（例題12 は 0.29 μs）', 0.29e-6), '210po': ('138 日', 138 * 86400), '60co': ('5.27 年', 5.27 * TO_S['Y']),
        '137cs': ('約30年', 30 * TO_S['Y']), '135i': ('6.58 h（はじめ 6.57 h）', 6.58 * 3600), '135xe': ('9.14 h', 9.14 * 3600),
        '99mo': ('約66 h', 66 * 3600), '222rn': ('約3.8 日', 3.8 * 86400), '131i': ('約8日', 8 * 86400),
        '134cs': ('約2年', 2 * TO_S['Y']), '40k': ('13億年', 1.3e9 * TO_S['Y']), '3h': ('12.3 年', 12.3 * TO_S['Y'])}
for n, (v, u) in SNAP_HL.items():
    s = v * TO_S[u]
    t, ts = text[n]
    p(f'  {n:6s} ENSDF {v} {u}  本文 {t}  ずれ {100 * (ts / s - 1):+.2f} %')
p('  Co-60 を年で', round(1925.28 / 365.2422, 4))
p('== 放射線のエネルギー keV・放出の割合 %（ENSDF）')
for k, v in SNAP_RAD.items():
    p('  ', k, v)
p('== ウラン235 の熱中性子の分裂の収率（IAEA LiveChart）')
xd = SNAP_FY['Xe-135 独立（基底）'] + SNAP_FY['Xe-135m 独立']
p('  ヨウ素135 の累積 %', round(100 * SNAP_FY['I-135 累積'], 3), '（本文 約6 %、例題11 γ_I＝0.064）')
p('  キセノン135 が直接できる分 %（基底＋準安定）', round(100 * xd, 3), '（本文 約0.2 %、例題11 γ_X＝0.0024。はじめは 0.3 %）')
p('  キセノン135 のうちヨウ素135 から来る割合 %', round(100 * (1 - xd / SNAP_FY['Xe-135 累積']), 1))
p('== IAEA Standards 2017 と NCNR')
p('  ν', STD2017['nu'], '→ 本文 2.43')
p('  U-235 分裂・捕獲 b', STD2017['sf'], STD2017['sc'], '本文 585・99 とのずれ %',
  round(100 * (585 / 587.3 - 1), 2), round(100 * (99 / 99.5 - 1), 2))
p('  η の上限 2.43×σf/(σf+σc)：本文の値・標準の値', round(2.43 * 585 / 684, 4), round(2.425 * 587.3 / (587.3 + 99.5), 4))
p('  β＝ν_d/ν（ν_d 1.57e-2 は arXiv:2101.09338。〔要確認〕）', round(1.57e-2 / STD2017['nu'][0], 5))
for k, v in NCNR.items():
    p('  NCNR', k, v)
p('== PDG・GPS')
p('  π± の質量 MeV', PDG_PI, '→ ħc/(mc²) fm', round(197.327 / PDG_PI, 3))
p('  GPS の A_REF km', GPS_AREF_M / 1e3, '赤道半径 6378.137 km を引いた高さ km', round(GPS_AREF_M / 1e3 - 6378.137, 1))

# 力-0（p1-00.tex）の数値の検算。g=9.8
import math
g=9.8
m=2000.0
print("例題1 T=mg =", m*g, "N")
a=0.50
T2=m*(g+a); print("例題2 T=m(g+a) =", T2, "N  比", T2/(m*g))
print("例題3 M=mgR =", m*g*10/1000, "kN·m")
# 力-5 例題15 のモデル：車体 24 t、重心は中心から荷と反対へ 0.5 m、荷の側アウトリガ 3.0 m
def mmax(R): return 24*3.5/(R-3.0)
for R in (10,20,8,15,6,5):
    print(f"R={R} m 倒れ始める荷 {mmax(R):.3f} t")
print("2 t のときの比 (もどす/倒す) at R=10:", 24*3.5/(2*7.0))
print("反比例とした場合 R=20:", 12*10/20)
print("動力 2 t を 0.50 m/s:", m*g*0.5, "W")
print("油圧 30 MPa × π(0.06)^2 =", 30e6*math.pi*0.06**2/1000, "kN")
# やってみよう（定規のクレーン）の見当：30 cm 定規、机の上 10 cm・つき出し 20 cm
# 定規の重心は机のはしから 5 cm 外。消しゴムを机の上の x_e(cm) に置く。
# 机のはし（倒れる軸）まわりのモーメント [g·cm]
for mr in (10, 20, 30):          # 定規の質量 g
  for me, xe in ((15, 8), (25, 8), (40, 8)):   # 消しゴム g, 机のはしからの距離 cm
    margin = me*xe - mr*5
    for R in (10, 20):
        d = R-3   # 回る中心の印は机のはしから 3 cm 内側
        n = margin/d if margin>0 else 0
        print(f"定規{mr}g 消しゴム{me}g@{xe}cm  R={R}cm  のせられる質量 ≈ {n:.1f} g（袋・クリップ込み）")

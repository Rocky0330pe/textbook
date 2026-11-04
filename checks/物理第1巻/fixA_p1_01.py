# 物理第1巻 第19回の直し（組A）：力-1 で変えた・足した数の検算。  python3 -I fixA_p1_01.py
import math
g = 9.8
# ⑥ 2倍にすると（例題11 の雨：真下に 5.0 m/s、電車の速さを変える）
for va in (0, 5, 10, 20):
    print("電車 %2d m/s：見かけの速さ %.1f m/s、真下からの角 %.0f°" % (va, math.hypot(va, 5.0), math.degrees(math.atan2(va, 5.0))))
# チャレンジ1（1）がけ 4.9 m・5.0 m/s、（2）30°・20 m/s
t = math.sqrt(4.9 / 4.9); print("チャレンジ1(1) t", t, "x", 5.0 * t)
print("チャレンジ1(2) R %.1f H %.2f" % (20**2 * math.sin(math.radians(60)) / g, 20**2 * 0.25 / (2 * g)))
# チャレンジ2（1）半径0.50 m・1秒に2回転、（2）半径200 m・30 m/s・接線 2.0
w = 2 * 2 * math.pi; print("チャレンジ2(1) ω %.1f v %.1f a %.0f" % (w, 0.5 * w, 0.5 * w * w))
an = 30**2 / 200; print("チャレンジ2(2) an", an, "a %.1f" % math.hypot(2.0, an))
# チャレンジ3：上り斜面（傾き α）のふもとから、水平と θ の向きに v0 で投げる（精査の差しかえ案）
def l_slope(v0, th, al):
    th, al = math.radians(th), math.radians(al)
    t = 2 * v0 * math.sin(th - al) / (g * math.cos(al))     # 斜面に垂直な向きで0にもどる時間
    x = v0 * math.cos(th) * t                                 # 水平に進む距離
    # 斜面にそった軸で直接計算した値とくらべる
    l2 = v0 * math.cos(th - al) * t - 0.5 * g * math.sin(al) * t * t
    return x / math.cos(al), l2, t
v0, al = 10.0, 30.0
l, l2, t = l_slope(v0, 50, al)
print("チャレンジ3 θ=50° l(水平から) %.4f l(斜面の軸) %.4f t %.4f" % (l, l2, t))
best = max((l_slope(v0, th / 100, al)[0], th / 100) for th in range(3001, 9000))
print("チャレンジ3 いちばん遠い θ", best[1], "（式 45+α/2 =", 45 + al / 2, "）  l_max", round(best[0], 4),
      "式 v0²/(g(1+sinα)) =", round(v0**2 / (g * (1 + math.sin(math.radians(al)))), 4))
print("チャレンジ3 α=0 なら", round(l_slope(v0, 45, 0)[0], 4), "＝ v0²/g", round(v0**2 / g, 4))
# チャレンジ4：モンキーハンティング（的の高さ h = l sinθ）。l=10 m、θ=30° の例
lm, th = 10.0, math.radians(30)
vmin = math.sqrt(g * lm / (2 * math.sin(th)))
tt = lm / vmin
print("チャレンジ4 v0_min %.3f、そのとき的の落ちる距離 %.3f ＝ h %.3f" % (vmin, 0.5 * g * tt * tt, lm * math.sin(th)))
# ブレーキの距離 v0²/(2|a|)（|a|=7）。②の図の点
for v in (10, 20, 30):
    print("止まるまで v0=%d：%.1f m" % (v, 0.75 * v + v * v / 14))

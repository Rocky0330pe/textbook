#!/usr/bin/env python3
"""挿絵（白い背景のJPG）から、背景だけを透明にしたPNGを作る。
使い方: cutout.py 入力.jpg 出力.png [下を切る行]
・紙のふちにつながった白だけを透明にする（服や顔の中の白は残る）。
・胸から上の絵は、服のすそで切ってから処理する（服の白が背景とつながらないように）。"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
cut = int(sys.argv[3]) if len(sys.argv) > 3 else None
im = np.asarray(Image.open(src).convert('RGB')).astype(np.int16)
if cut: im = im[:cut]
h, w, _ = im.shape
light = (im.min(axis=2) > 232)            # 白に近い画素
lab, n = ndimage.label(light)
seeds = set(np.unique(np.concatenate([lab[0, :], lab[:, 0], lab[:, -1]] + ([] if cut else [lab[-1, :]]))))
seeds.discard(0)
bg = np.isin(lab, list(seeds))
# ふちのにじみ：背景に接する明るい灰色を半透明にする
dist = ndimage.binary_dilation(bg, iterations=2) & ~bg
alpha = np.where(bg, 0, 255).astype(np.uint8)
lum = im.mean(axis=2)
fr = dist & (lum > 200)
alpha[fr] = np.clip((255 - lum[fr]) * 255 / 55, 0, 255).astype(np.uint8)
rgba = np.dstack([im.astype(np.uint8), alpha])
# 余白を切りつめる
ys, xs = np.where(alpha > 0)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
out = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
out.save(dst, optimize=True)
print(dst, out.size)

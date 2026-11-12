/* 補助教材のアニメーション：3次元の部品（K5）。外のライブラリを使わない小さな描き方。
   座標は z が上。yaw（左右に回す）・pitch（上から見下ろす角）は度。ドラッグで回せる。 */
(function () {
  'use strict';
  const A = window.A;
  class View3 {
    // o = { box:[左,上,幅,高さ], yaw, pitch, scale（1単位のピクセル）, center:[x,y,z], persp（0で平行投影） }
    constructor(cv, o) {
      this.cv = cv; const b = o.box || [0, 0, cv.W, cv.H]; this.L = b[0]; this.T = b[1]; this.Wp = b[2]; this.Hp = b[3];
      this.cx = this.L + this.Wp / 2; this.cy = this.T + this.Hp / 2;
      this.s = o.scale || Math.min(this.Wp, this.Hp) / 4; this.c = o.center || [0, 0, 0]; this.persp = o.persp == null ? 0.08 : o.persp;
      const yw = (o.yaw == null ? -35 : o.yaw) * Math.PI / 180, pt = (o.pitch == null ? 25 : o.pitch) * Math.PI / 180;
      this.cy1 = Math.cos(yw); this.sy1 = Math.sin(yw); this.cp = Math.cos(pt); this.sp = Math.sin(pt);
      this.queue = [];
    }
    // 画面の座標と奥行き（大きいほど手前）
    P(p) {
      const x = p[0] - this.c[0], y = p[1] - this.c[1], z = p[2] - this.c[2];
      const xr = x * this.cy1 - y * this.sy1, yr = x * this.sy1 + y * this.cy1;      // z のまわりに回す
      // 見る人は（回したあとの）−y の側の、pitch だけ上にいる
      const sx = xr, sy = z * this.cp + yr * this.sp;   // 画面の右・上
      const d = -yr * this.cp + z * this.sp;            // 見る人に近いほど大きい
      const k = 1 / Math.max(0.3, 1 - this.persp * d / 4);
      return [this.cx + sx * this.s * k, this.cy - sy * this.s * k, d];
    }
    line3(pts, o = {}) { this.queue.push({ z: avg(pts.map(p => this.P(p)[2])) + (o.zbias || 0), f: () => this.cv.line(pts.map(p => this.P(p)), o) }); }
    arrow3(p, q, o = {}) { this.queue.push({ z: (this.P(p)[2] + this.P(q)[2]) / 2 + (o.zbias || 0), f: () => { const a = this.P(p), b = this.P(q); this.cv.arrow(a[0], a[1], b[0], b[1], o); } }); }
    dot3(p, o = {}) { this.queue.push({ z: this.P(p)[2] + 0.01 + (o.zbias || 0), f: () => { const a = this.P(p); this.cv.dot(a[0], a[1], o); } }); }
    poly3(pts, o = {}) { this.queue.push({ z: avg(pts.map(p => this.P(p)[2])) + (o.zbias || 0), f: () => this.cv.poly(pts.map(p => this.P(p)), o) }); }
    text3(s, p, o = {}) { this.queue.push({ z: 1e6, f: () => { const a = this.P(p); this.cv.text(s, a[0], a[1], o); } }); }
    // 軸：len の長さ、名前つき
    axes3(o = {}) {
      const L = o.len || 2, names = o.names || ['x', 'y', 'z'];
      [[L, 0, 0], [0, L, 0], [0, 0, L]].forEach((e, k) => { this.arrow3([0, 0, 0], e, { color: 'sub', width: 1.5, head: 9 }); this.text3(names[k], e.map(v => v * 1.1), { color: 'sub', italic: true, math: true, size: 16, align: 'center' }); });
    }
    // 面 z=f(x,y) を網で描く
    surface(f, o = {}) {
      const [x0, x1] = o.x || [-2, 2], [y0, y1] = o.y || [-2, 2], n = o.n || 16;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const xa = x0 + (x1 - x0) * i / n, xb = x0 + (x1 - x0) * (i + 1) / n, ya = y0 + (y1 - y0) * j / n, yb = y0 + (y1 - y0) * (j + 1) / n;
        const q = [[xa, ya, f(xa, ya)], [xb, ya, f(xb, ya)], [xb, yb, f(xb, yb)], [xa, yb, f(xa, yb)]];
        this.poly3(q, { fill: o.fill || 'a', alpha: o.alpha == null ? 0.18 : o.alpha, color: o.mesh === false ? null : (o.color || 'sub'), width: 0.7 });
      }
    }
    // ためた絵を、奥から順に描く
    flush() { this.queue.sort((a, b) => a.z - b.z).forEach(q => q.f()); this.queue = []; }
  }
  const avg = a => a.reduce((s, v) => s + v, 0) / a.length;
  A.View3 = View3;
  // ドラッグで回す：st[yawKey]・st[pitchKey] を変える。box の中だけ
  A.rotDrag = function (box, yawKey = 'yaw', pitchKey = 'pitch', extra) {
    let px = 0, py = 0;
    return {
      hit(st, x, y, api) { if (extra) { const h = extra.hit(st, x, y, api); if (h != null && h !== false) return h; } if (x < box[0] || x > box[0] + box[2] || y < box[1] || y > box[1] + box[3]) return null; px = x; py = y; return 'rot'; },
      move(st, x, y, api, h) { if (h !== 'rot') return extra.move(st, x, y, api, h); st[yawKey] -= (x - px) * 0.5; st[pitchKey] = A.clamp(st[pitchKey] + (y - py) * 0.4, -89, 89); px = x; py = y; },
      end(st, api, h) { if (h !== 'rot' && extra && extra.end) extra.end(st, api, h); }
    };
  };
})();

/* ---------- Floating kanji field ---------- */
class Field {
  constructor(canvas, faceCanvas) { this.field = canvas; this._face = faceCanvas; this.fctx = canvas.getContext('2d'); }
  init() {
    this.chars = ['学', '字', '読', '書', '漢', '語', '文', '本', '日', 'か', 'ん', 'じ', 'だ', 'ダ'];
    this.parts = [];
    this.bursts = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
    for (let i = 0; i < 16; i++) this.parts.push(this.spawn(true, (i / 16) * Math.PI * 2));
    const host = this.field.parentElement;
    if (host) host.addEventListener('pointerdown', (e) => {
      const fr = this.field.getBoundingClientRect();
      const x = e.clientX - fr.left, y = e.clientY - fr.top;
      let best = null, bd = 1e9;
      for (const p of this.parts) { if (p.px == null) continue; const d = Math.hypot(p.px - x, p.py - y); if (d < p.hit && d < bd) { bd = d; best = p; } }
      if (best) { this.spawnBurst(best.px, best.py, best.tone, best.size); Object.assign(best, this.spawn(false, best.slot)); best.px = null; }
    });
  }
  spawnBurst(x, y, tone, bigSize) {
    if (!this.bursts) this.bursts = [];
    const base = bigSize || 40;
    const n = 3 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.7, sp = 50 + Math.random() * 120;
      this.bursts.push({ char: this.chars[(Math.random() * this.chars.length) | 0], x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, life: 0, ttl: 0.7 + Math.random() * 0.5, size: base * (0.3 + Math.random() * 0.22), rot: (Math.random() - 0.5) * 1.2, spin: (Math.random() - 0.5) * 7, tone });
    }
  }
  resize() {
    const r = this.field.getBoundingClientRect();
    this.fdpr = Math.min(window.devicePixelRatio || 1, 2);
    this.fw = r.width || 800; this.fh = r.height || 600;
    this.field.width = Math.round(this.fw * this.fdpr);
    this.field.height = Math.round(this.fh * this.fdpr);
  }
  center() {
    const wrap = this._face ? this._face.parentElement : null;
    const fr = this.field.getBoundingClientRect();
    if (wrap) {
      const wr = wrap.getBoundingClientRect();
      return { x: wr.left + wr.width / 2 - fr.left, y: wr.top + wr.height / 2 - fr.top, r: Math.min(wr.width, wr.height) / 2 };
    }
    return { x: this.fw / 2, y: this.fh / 2, r: 150 };
  }
  spawn(initial, slot) {
    const c = this.center();
    const reach = Math.hypot(this.fw, this.fh) / 2;
    if (slot == null) slot = Math.random() * Math.PI * 2;
    return {
      char: this.chars[(Math.random() * this.chars.length) | 0],
      slot, angle: slot + (Math.random() - 0.5) * 0.26,
      dist: c.r + 8 + (initial ? Math.random() * reach : 0),
      vMax: 38 + Math.random() * 32, rot: (Math.random() - 0.5) * 0.6, spin: (Math.random() - 0.5) * 0.25,
      size: 30 + Math.random() * 82, wobAmp: 6 + Math.random() * 16, wobSpeed: 0.5 + Math.random() * 0.9,
      wobPhase: Math.random() * Math.PI * 2, tone: Math.random(),
    };
  }
  step(dt) {
    if (!this.fctx) return;
    const ctx = this.fctx, c = this.center();
    ctx.setTransform(this.fdpr, 0, 0, this.fdpr, 0, 0);
    ctx.clearRect(0, 0, this.fw, this.fh);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const maxR = Math.hypot(this.fw, this.fh) / 2 + 120;
    for (const p of this.parts) {
      const rr = Math.max(p.dist, c.r);
      const v = Math.max(6, p.vMax * Math.pow(c.r / rr, 0.85));
      p.dist += v * dt;
      const df = Math.min(2.4, p.dist / c.r);
      p.rot += (p.spin / df) * dt; p.wobPhase += (p.wobSpeed / df) * dt;
      const dirX = Math.cos(p.angle), dirY = Math.sin(p.angle);
      const wob = Math.sin(p.wobPhase) * p.wobAmp * df;
      const x = c.x + dirX * p.dist - dirY * wob;
      const y = c.y + dirY * p.dist + dirX * wob;
      p.px = x; p.py = y; p.hit = p.size * 0.5;
      if (p.dist > maxR || x < -140 || x > this.fw + 140 || y < -140 || y > this.fh + 140) { p.px = null; Object.assign(p, this.spawn(false, p.slot)); continue; }
      const fadeIn = Math.min(1, (p.dist - c.r) / 80);
      const edge = Math.min(x, this.fw - x, y, this.fh - y);
      const fadeOut = Math.max(0, Math.min(1, edge / 100));
      const alpha = Math.max(0, fadeIn * fadeOut) * 0.15;
      if (alpha <= 0.003) continue;
      const col = p.tone < 0.5 ? '53,99,168' : (p.tone < 0.8 ? '62,138,110' : '35,39,51');
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot);
      ctx.font = `900 ${p.size}px 'Zen Maru Gothic','Zen Kaku Gothic New',sans-serif`;
      ctx.fillStyle = `rgba(${col},${alpha.toFixed(3)})`;
      ctx.fillText(p.char, 0, 0); ctx.restore();
    }
    if (this.bursts && this.bursts.length) {
      for (let i = this.bursts.length - 1; i >= 0; i--) {
        const b = this.bursts[i];
        b.life += dt;
        if (b.life >= b.ttl) { this.bursts.splice(i, 1); continue; }
        b.vy += 240 * dt; b.vx *= 0.98;
        b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.spin * dt;
        const k = b.life / b.ttl, alpha = (1 - k) * 0.9, pop = k < 0.16 ? k / 0.16 : 1;
        const col = b.tone < 0.5 ? '53,99,168' : (b.tone < 0.8 ? '62,138,110' : '35,39,51');
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot);
        ctx.font = `900 ${(b.size * pop).toFixed(1)}px 'Zen Maru Gothic','Zen Kaku Gothic New',sans-serif`;
        ctx.fillStyle = `rgba(${col},${alpha.toFixed(3)})`;
        ctx.fillText(b.char, 0, 0); ctx.restore();
      }
    }
  }
}

/* ---------- 3D head ---------- */
class Head {
  constructor(canvas, model, texture) { this._canvas = canvas; this.modelUrl = model; this.textureUrl = texture; }

  init3D() {
    const THREE = window.THREE;
    if (!THREE || this._inited) return;
    this._inited = true; this.THREE = THREE;
    this.faceYaw = Math.PI; this.facePitch = 0; this.faceRoll = 0;
    const canvas = this._canvas; this.grabbing = false;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0); this.renderer = renderer;
    const scene = new THREE.Scene(); this.scene = scene;
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    cam.position.set(0, 0, 6.8); this.cam = cam;
    scene.add(new THREE.AmbientLight(0xffffff, 0.42));
    const key = new THREE.DirectionalLight(0xffffff, 0.7); key.position.set(3, 5, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x99b4ff, 0.28); fill.position.set(-4, -1, 2); scene.add(fill);
    this.R = 1.35;
    this.ray = new THREE.Raycaster();
    this.dragStart = new THREE.Vector3();
    this.dragCur = new THREE.Vector3();
    this.resize3D();
    this._onResize = () => this.resize3D();
    window.addEventListener('resize', this._onResize);
    canvas.addEventListener('pointerdown', e => this.onDown3(e));
    window.addEventListener('pointermove', e => this.onMove3(e));
    window.addEventListener('pointerup', () => this.onUp3());
    window.addEventListener('pointercancel', () => this.onCancel3());
    window.addEventListener('blur', () => this.onCancel3());
    // A touch that landed on the actual head (grab set via raycast in onDown3) captures
    // the gesture so it deforms; touches that miss the head aren't grabs, so the page scrolls.
    canvas.addEventListener('touchmove', e => { if (this.grabbing) e.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', e => { if (e.key === 'r' || e.key === 'R') this.resetHead(); });
    this._scrollY = window.scrollY || window.pageYOffset || 0;
    this._scrollVel = 0; this._scrollOff = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || window.pageYOffset || 0;
      const d = y - this._scrollY; this._scrollY = y;
      this._scrollVel += -d * 0.0042;
      if (this._scrollVel > 0.35) this._scrollVel = 0.35;
      if (this._scrollVel < -0.35) this._scrollVel = -0.35;
    }, { passive: true });
    this.loadModel(this.modelUrl, this.textureUrl);
    this.start();
  }

  loadModel(url, texUrl) {
    const THREE = this.THREE;
    fetch(url).then(r => r.text()).then(txt => {
      const V = [], VT = [], posArr = [], uvArr = [];
      const faces = [];
      for (const ln of txt.split('\n')) {
        if (ln[0] === 'v' && ln[1] === ' ') { const p = ln.split(/\s+/); V.push([+p[1], +p[2], +p[3]]); }
        else if (ln[0] === 'v' && ln[1] === 't') { const p = ln.split(/\s+/); VT.push([+p[1], +p[2]]); }
        else if (ln[0] === 'f' && ln[1] === ' ') {
          const p = ln.trim().split(/\s+/).slice(1).map(tok => { const a = tok.split('/'); return [parseInt(a[0]) - 1, a[1] ? parseInt(a[1]) - 1 : -1]; });
          for (let k = 1; k < p.length - 1; k++) faces.push([p[0], p[k], p[k + 1]]);
        }
      }
      // Keep every face — no connected-component filtering.
      for (const f of faces) {
        for (const vt of f) { const v = V[vt[0]]; posArr.push(v[0], v[1], v[2]); const t = vt[1] >= 0 ? VT[vt[1]] : null; uvArr.push(t ? t[0] : 0, t ? t[1] : 0); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(posArr), 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvArr), 2));
      geo.computeBoundingBox();
      const c = new THREE.Vector3(); geo.boundingBox.getCenter(c); geo.translate(-c.x, -c.y, -c.z);
      geo.computeBoundingSphere();
      const s = this.R / geo.boundingSphere.radius; geo.scale(s, s, s);
      geo.computeVertexNormals();
      this.subdivide(geo);
      const gramp = ['#2e2b33', '#5c606a', '#898d95', '#b0b4bb', '#d6dae0', '#ffffff'];
      const gcan = document.createElement('canvas'); gcan.width = gramp.length; gcan.height = 1;
      const gctx = gcan.getContext('2d');
      gramp.forEach((c, i) => { gctx.fillStyle = c; gctx.fillRect(i, 0, 1, 1); });
      const gradientMap = new THREE.CanvasTexture(gcan);
      gradientMap.minFilter = gradientMap.magFilter = THREE.NearestFilter;
      const mat = new THREE.MeshToonMaterial({ gradientMap, side: THREE.DoubleSide });
      if (texUrl) { const t = new THREE.TextureLoader().load(texUrl); t.flipY = true; mat.map = t; }
      if (this.mesh) this.scene.remove(this.mesh);
      this.mesh = new THREE.Mesh(geo, mat);
      const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1c22, side: THREE.BackSide });
      const outlineGeo = new THREE.BufferGeometry();
      outlineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.array.length), 3));
      this.outlineGeo = outlineGeo;
      const outline = new THREE.Mesh(outlineGeo, outlineMat);
      this.mesh.add(outline);
      this.faceYaw = -Math.PI / 2; this.facePitch = -0.15; this.faceRoll = 0;
      this.scene.add(this.mesh);
      this.smoothGeometry(geo, 3);
      this.setupDeform(geo);
      this.smoothNormals();
      this.updateOutline();
      this.resize3D();
    }).catch(e => console.warn('model load failed', e));
  }

  setupDeform(geometry) {
    const pos = geometry.attributes.position;
    pos.setUsage(this.THREE.DynamicDrawUsage);
    this.basePos = Float32Array.from(pos.array);
    this.disp = new Float32Array(pos.count * 3);
    this.vel = new Float32Array(pos.count * 3);
    this.wt = new Float32Array(pos.count);
    this.grabDisp = new Float32Array(pos.count * 3);
    const bp = this.basePos, map = new Map();
    for (let i = 0; i < pos.count; i++) {
      const k = bp[i * 3].toFixed(2) + ',' + bp[i * 3 + 1].toFixed(2) + ',' + bp[i * 3 + 2].toFixed(2);
      let a = map.get(k); if (!a) { a = []; map.set(k, a); } a.push(i);
    }
    this._nGroups = [...map.values()].filter(g => g.length > 1);
  }
  subdivide(geo) {
    const THREE = this.THREE;
    const p = geo.attributes.position.array, u = geo.attributes.uv.array;
    const np = [], nu = [];
    const P = (i) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
    const Uv = (i) => [u[i * 2], u[i * 2 + 1]];
    const mp = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const mu = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const push = (pt, uv) => { np.push(pt[0], pt[1], pt[2]); nu.push(uv[0], uv[1]); };
    const tris = p.length / 9;
    for (let t = 0; t < tris; t++) {
      const i = t * 3;
      const v0 = P(i), v1 = P(i + 1), v2 = P(i + 2), t0 = Uv(i), t1 = Uv(i + 1), t2 = Uv(i + 2);
      const a = mp(v0, v1), b = mp(v1, v2), c = mp(v2, v0), ta = mu(t0, t1), tb = mu(t1, t2), tc = mu(t2, t0);
      push(v0, t0); push(a, ta); push(c, tc);
      push(a, ta); push(v1, t1); push(b, tb);
      push(c, tc); push(b, tb); push(v2, t2);
      push(a, ta); push(b, tb); push(c, tc);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(np), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(nu), 2));
    geo.deleteAttribute('normal');
    geo.computeVertexNormals();
  }
  smoothGeometry(geo, iters) {
    const pos = geo.attributes.position.array, n = pos.length / 3;
    const canon = new Map(), cid = new Int32Array(n), reps = [];
    for (let i = 0; i < n; i++) {
      const k = pos[i * 3].toFixed(3) + ',' + pos[i * 3 + 1].toFixed(3) + ',' + pos[i * 3 + 2].toFixed(3);
      let id = canon.get(k); if (id === undefined) { id = reps.length; canon.set(k, id); reps.push([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]]); }
      cid[i] = id;
    }
    const U = reps.length, adj = Array.from({ length: U }, () => new Set());
    for (let t = 0; t < n; t += 3) { const a = cid[t], b = cid[t + 1], c = cid[t + 2]; adj[a].add(b); adj[a].add(c); adj[b].add(a); adj[b].add(c); adj[c].add(a); adj[c].add(b); }
    let P = reps.map(v => [v[0], v[1], v[2]]);
    const pass = (lam) => P.map((p, i) => {
      const nb = adj[i]; if (!nb.size) return p;
      let x = 0, y = 0, z = 0; for (const j of nb) { x += P[j][0]; y += P[j][1]; z += P[j][2]; }
      const k = nb.size; return [p[0] + lam * (x / k - p[0]), p[1] + lam * (y / k - p[1]), p[2] + lam * (z / k - p[2])];
    });
    for (let it = 0; it < iters; it++) { P = pass(0.5); P = pass(-0.53); }
    for (let i = 0; i < n; i++) { const c = cid[i]; pos[i * 3] = P[c][0]; pos[i * 3 + 1] = P[c][1]; pos[i * 3 + 2] = P[c][2]; }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  }
  smoothNormals() {
    if (!this.mesh || !this._nGroups) return;
    const arr = this.mesh.geometry.attributes.normal.array;
    for (const g of this._nGroups) {
      let x = 0, y = 0, z = 0;
      for (const i of g) { x += arr[i * 3]; y += arr[i * 3 + 1]; z += arr[i * 3 + 2]; }
      const l = Math.hypot(x, y, z) || 1; x /= l; y /= l; z /= l;
      for (const i of g) { arr[i * 3] = x; arr[i * 3 + 1] = y; arr[i * 3 + 2] = z; }
    }
    this.mesh.geometry.attributes.normal.needsUpdate = true;
    this.updateOutline();
  }
  updateOutline() {
    if (!this.outlineGeo || !this.mesh) return;
    const pos = this.mesh.geometry.attributes.position.array;
    const nor = this.mesh.geometry.attributes.normal.array;
    const out = this.outlineGeo.attributes.position.array;
    const k = 0.007;
    for (let i = 0; i < out.length; i++) out[i] = pos[i] + nor[i] * k;
    this.outlineGeo.attributes.position.needsUpdate = true;
  }

  resize3D() {
    const r = this._canvas.getBoundingClientRect();
    const w = r.width || 320, h = r.height || 320;
    this.renderer.setSize(w, h, false);
    this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
  }

  ndc(e) {
    const r = this._canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 };
  }

  onDown3(e) {
    if (!this.mesh) return;
    const THREE = this.THREE;
    this.ray.setFromCamera(this.ndc(e), this.cam);
    const hit = this.ray.intersectObject(this.mesh)[0];
    if (!hit) return;
    this.grabbing = true;
    this._settled = false;
    const n = this.cam.getWorldDirection(new THREE.Vector3());
    this.plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, hit.point.clone());
    this.dragStart.copy(hit.point); this.dragCur.copy(hit.point);
    const local = this.mesh.worldToLocal(hit.point.clone());
    const sigma = this.R * 0.7, denom = 2 * sigma * sigma, bp = this.basePos;
    for (let i = 0; i < this.wt.length; i++) {
      const dx = bp[i * 3] - local.x, dy = bp[i * 3 + 1] - local.y, dz = bp[i * 3 + 2] - local.z;
      this.wt[i] = Math.exp(-(dx * dx + dy * dy + dz * dz) / denom);
    }
    this.ensureAudio();
    this.grabDisp.set(this.disp);
    this._canvas.style.cursor = 'grabbing';
    e.preventDefault();
  }

  onMove3(e) {
    const r = this._canvas.getBoundingClientRect();
    this._pnx = Math.max(-1.4, Math.min(1.4, ((e.clientX - r.left) / r.width) * 2 - 1));
    this._pny = Math.max(-1.4, Math.min(1.4, ((e.clientY - r.top) / r.height) * 2 - 1));
    this._lastMoveT = performance.now();
    if (this._lastMx != null) this._pvx = e.clientX - this._lastMx;
    this._lastMx = e.clientX;
    if (!this.grabbing) return;
    this.ray.setFromCamera(this.ndc(e), this.cam);
    const p = new this.THREE.Vector3();
    if (this.ray.ray.intersectPlane(this.plane, p)) this.dragCur.copy(p);
  }

  onUp3() {
    if (!this.grabbing) return;
    this.grabbing = false;
    const flick = Math.max(-1.2, Math.min(1.2, (this._pvx || 0) * 0.010));
    this._spinV = (this._spinV || 0) + flick;
    let m = 0; const ds = this.disp; if (ds) for (let i = 0; i < ds.length; i++) { const a = Math.abs(ds[i]); if (a > m) m = a; }
    if (m > 0.12) this.boing(Math.min(1, m / 2.4));
    if (Math.abs(flick) > 0.18) this.whoosh(Math.min(1, Math.abs(flick) / 0.9));
    this._pvx = 0; this._lastMx = null;
    this._canvas.style.cursor = 'grab';
  }

  onCancel3() {
    // Pointer contact lost (browser scroll takeover, tab blur, etc.) — release the
    // grab and let the deformation spring back to rest instead of freezing in place.
    if (!this.grabbing) return;
    this.grabbing = false;
    this._settled = false;
    let m = 0; const ds = this.disp; if (ds) for (let i = 0; i < ds.length; i++) { const a = Math.abs(ds[i]); if (a > m) m = a; }
    if (m > 0.12) this.boing(Math.min(1, m / 2.4));
    this._pvx = 0; this._lastMx = null;
    this._canvas.style.cursor = 'grab';
  }

  ensureAudio() {
    try {
      if (!this._ac) this._ac = new (window.AudioContext || window.webkitAudioContext)();
      if (this._ac.state === 'suspended') this._ac.resume();
      // iOS/Safari won't play Web Audio until a silent buffer runs inside a user gesture.
      if (!this._audioUnlocked) {
        const src = this._ac.createBufferSource();
        src.buffer = this._ac.createBuffer(1, 1, 22050);
        src.connect(this._ac.destination); src.start(0);
        this._audioUnlocked = true;
      }
    } catch (e) {}
  }

  boing(amt) {
    const ac = this._ac; if (!ac) return; const t = ac.currentTime;
    const dur = 0.46 + amt * 0.14;
    const N = 72, base = 430 + amt * 180;
    const curve = new Float32Array(N), curve2 = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const x = i / (N - 1);
      const env = Math.exp(-3.4 * x);
      const wob = Math.sin(x * Math.PI * 2 * 6.5) * env;
      const center = base * Math.exp(-1.35 * x) + 70;
      const f = Math.max(50, center * (1 + 0.6 * wob));
      curve[i] = f; curve2[i] = f * 2;
    }
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueCurveAtTime(curve, t, dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.min(0.34, 0.15 + amt * 0.2), t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const o2 = ac.createOscillator(), g2 = ac.createGain();
    o2.type = 'sine'; o2.frequency.setValueCurveAtTime(curve2, t, dur);
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(Math.min(0.12, 0.05 + amt * 0.08), t + 0.02);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.85);
    o.connect(g).connect(ac.destination); o2.connect(g2).connect(ac.destination);
    o.start(t); o2.start(t); o.stop(t + dur + 0.02); o2.stop(t + dur + 0.02);
  }

  whoosh(amt) {
    const ac = this._ac; if (!ac) return; const t = ac.currentTime; const dur = 0.28 + amt * 0.26;
    const n = Math.floor(ac.sampleRate * dur), buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(360, t);
    bp.frequency.exponentialRampToValueAtTime(1400 + amt * 1200, t + dur * 0.5);
    bp.frequency.exponentialRampToValueAtTime(300, t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.min(0.22, 0.07 + amt * 0.18), t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(bp).connect(g).connect(ac.destination);
    src.start(t); src.stop(t + dur);
  }

  resetHead() {
    if (!this.disp) return;
    this.disp.fill(0); this.vel.fill(0); this.grabbing = false; this._settled = false;
    this._canvas.style.cursor = 'grab';
  }

  step3D(dt, t) {
    if (!this.mesh) return;
    const mesh = this.mesh;
    if (!this.grabbing) {
      const idlePtr = (t - (this._lastMoveT || 0)) < 1600;
      if (!idlePtr && t > (this._nextGlance || 0)) {
        this._nextGlance = t + 2600 + Math.random() * 3500;
        this._autoNx = (Math.random() * 2 - 1) * 0.8;
        this._autoNy = (Math.random() * 2 - 1) * 0.45;
        if (Math.random() < 0.5) this._squishT = t;
      }
      const nx = idlePtr ? (this._pnx || 0) : (this._autoNx || 0);
      const ny = idlePtr ? (this._pny || 0) : (this._autoNy || 0);
      const ty = this.faceYaw + nx * 0.6;
      const tx = this.facePitch + ny * 0.38;
      this._ry = this._ry == null ? ty : this._ry + (ty - this._ry) * 0.07;
      this._rx = this._rx == null ? tx : this._rx + (tx - this._rx) * 0.07;
      this._spinV = (this._spinV || 0) * 0.955;
      this._spinA = (this._spinA || 0) + this._spinV;
      if (Math.abs(this._spinV) < 0.012) {
        const tgt = Math.round(this._spinA / (Math.PI * 2)) * (Math.PI * 2);
        this._spinA += (tgt - this._spinA) * 0.05;
      }
      mesh.rotation.y = this._ry + this._spinA + Math.sin(t * 0.0011) * 0.04;
      mesh.rotation.x = this._rx + Math.sin(t * 0.00058) * 0.03;
      mesh.rotation.z = this.faceRoll + Math.sin(t * 0.0004) * 0.02;
      let sq = 0;
      if (this._squishT) { const e = (t - this._squishT) / 620; if (e >= 1) this._squishT = 0; else sq = Math.sin(e * Math.PI * 2) * 0.11 * (1 - e); }
      const br = 1 + Math.sin(t * 0.0016) * 0.015;
      mesh.scale.set(br * (1 + sq), br * (1 - sq * 0.7), br * (1 + sq));
    } else {
      mesh.scale.set(1, 1, 1);
    }
    this._scrollVel = (this._scrollVel || 0) + (0 - (this._scrollOff || 0)) * 0.14;
    this._scrollVel *= 0.86;
    this._scrollOff = (this._scrollOff || 0) + this._scrollVel;
    if (this._scrollOff > 0.6) this._scrollOff = 0.6;
    if (this._scrollOff < -0.6) this._scrollOff = -0.6;
    mesh.position.y = this._scrollOff;
    mesh.rotation.z += this._scrollOff * 0.10;
    mesh.updateMatrixWorld();
    let ldx = 0, ldy = 0, ldz = 0;
    if (this.grabbing) {
      const a = mesh.worldToLocal(this.dragStart.clone());
      const b = mesh.worldToLocal(this.dragCur.clone());
      ldx = b.x - a.x; ldy = b.y - a.y; ldz = b.z - a.z;
      const L = Math.hypot(ldx, ldy, ldz), max = 1.2;
      if (L > max) { const s = max / L; ldx *= s; ldy *= s; ldz *= s; }
    }
    const K = 0.45, D = 0.68, pos = mesh.geometry.attributes.position, bp = this.basePos, ds = this.disp, ve = this.vel, wt = this.wt, gd = this.grabDisp;
    const grab = this.grabbing;
    if (this.grabbing || !this._settled) {
      let resid = 0;
      for (let i = 0; i < wt.length; i++) {
        const idx = i * 3, w = wt[i];
        if (grab) {
          const tx = gd[idx] + w * ldx, ty = gd[idx + 1] + w * ldy, tz = gd[idx + 2] + w * ldz;
          ve[idx] = (ve[idx] + (tx - ds[idx]) * K) * D; ds[idx] += ve[idx];
          ve[idx + 1] = (ve[idx + 1] + (ty - ds[idx + 1]) * K) * D; ds[idx + 1] += ve[idx + 1];
          ve[idx + 2] = (ve[idx + 2] + (tz - ds[idx + 2]) * K) * D; ds[idx + 2] += ve[idx + 2];
        } else {
          ve[idx] = (ve[idx] + (0 - ds[idx]) * 0.11) * 0.90; ds[idx] += ve[idx];
          ve[idx + 1] = (ve[idx + 1] + (0 - ds[idx + 1]) * 0.11) * 0.90; ds[idx + 1] += ve[idx + 1];
          ve[idx + 2] = (ve[idx + 2] + (0 - ds[idx + 2]) * 0.11) * 0.90; ds[idx + 2] += ve[idx + 2];
          resid += Math.abs(ds[idx]) + Math.abs(ds[idx + 1]) + Math.abs(ds[idx + 2]) + Math.abs(ve[idx]) + Math.abs(ve[idx + 1]) + Math.abs(ve[idx + 2]);
        }
        pos.array[idx] = bp[idx] + ds[idx];
        pos.array[idx + 1] = bp[idx + 1] + ds[idx + 1];
        pos.array[idx + 2] = bp[idx + 2] + ds[idx + 2];
      }
      pos.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
      this.smoothNormals();
      if (!grab && resid < wt.length * 1e-5) this._settled = true;
    }
  }

  start() {
    if (this._raf) return;
    let last = performance.now();
    const loop = t => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t;
      this.step3D(dt, t);
      if (this.renderer) this.renderer.render(this.scene, this.cam);
      if (window.__field) window.__field.step(dt);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
}

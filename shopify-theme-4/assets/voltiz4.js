/* =====================================================================
   VOLTIZ, brouillon 4 : animation d'ouverture du premier écran
   1. Des particules d'énergie jaunes arrivent de partout et se rassemblent en 7 groupes.
   2. Chaque groupe devient une pastille.
   3. Les pastilles sont lancées l'une après l'autre dans le sachet ouvert.
   4. Le sachet se ferme, la fermeture s'allume, une petite gerbe de particules part.
   5. Le sachet redevient le sachet 3D qu'on fait tourner ; quelques particules montent lentement.
   Rien ne se joue avec « réduire les animations », dans l'éditeur Shopify ou sans canvas.
   ===================================================================== */
(() => {
  "use strict";
  const hero = document.querySelector(".v3 [data-vz-intro]");
  if (!hero) return;
  const canvas = hero.querySelector(".intro__canvas");
  const pouch = hero.querySelector(".hero__stage .pouch");
  const mouth = hero.querySelector(".pouch__mouth");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  const done = () => { hero.classList.remove("is-playing", "is-sealed"); hero.classList.add("is-done"); };
  if (!hero.classList.contains("is-playing") || !ctx || !pouch || !mouth) { done(); return; }

  const YELLOW = "245, 214, 41";
  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const box = (el) => {
    const h = hero.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
  };

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t) => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const rand = (a, b) => a + Math.random() * (b - a);

  /* Petite lueur ronde, dessinée une fois puis réutilisée */
  const dot = document.createElement("canvas");
  dot.width = dot.height = 32;
  (() => {
    const g = dot.getContext("2d"), grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255, 248, 200, 1)");
    grad.addColorStop(0.25, `rgba(${YELLOW}, .95)`);
    grad.addColorStop(1, `rgba(${YELLOW}, 0)`);
    g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
  })();

  /* Pastille vue légèrement de dessus : tranche, face, trait de sécabilité, reflet. Dessinée une fois. */
  let pill = null, PW = 40, PH = 26;
  const makePill = () => {
    const pad = 18, c = document.createElement("canvas");
    c.width = Math.ceil((PW + pad * 2) * dpr); c.height = Math.ceil((PH + pad * 2) * dpr);
    const g = c.getContext("2d");
    g.scale(dpr, dpr); g.translate(PW / 2 + pad, PH / 2 + pad);
    const rx = PW / 2, ry = PH / 2;
    g.shadowColor = `rgba(${YELLOW}, .6)`; g.shadowBlur = 16;
    g.fillStyle = "#B8960A";
    g.beginPath(); g.ellipse(0, ry * 0.22, rx, ry * 0.86, 0, 0, Math.PI * 2); g.fill();
    g.shadowBlur = 0;
    const grad = g.createLinearGradient(-rx, -ry, rx, ry);
    grad.addColorStop(0, "#FFF4B0"); grad.addColorStop(0.45, "#F5D629"); grad.addColorStop(1, "#DDB60E");
    g.fillStyle = grad;
    g.beginPath(); g.ellipse(0, 0, rx, ry * 0.86, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(16, 44, 70, .28)"; g.lineWidth = 1.2; g.lineCap = "round";
    g.beginPath(); g.moveTo(-rx * 0.5, 0); g.lineTo(rx * 0.5, 0); g.stroke();
    g.fillStyle = "rgba(255, 255, 255, .55)";
    g.beginPath(); g.ellipse(-rx * 0.32, -ry * 0.4, rx * 0.3, ry * 0.14, -0.2, 0, Math.PI * 2); g.fill();
    pill = { img: c, w: c.width / dpr, h: c.height / dpr };
  };
  const drawPill = (x, y, s, rot, a) => {
    if (s <= 0.01 || a <= 0.01) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.drawImage(pill.img, -pill.w / 2, -pill.h / 2, pill.w, pill.h);
    ctx.restore();
  };
  const drawDot = (x, y, r, a) => {
    if (a <= 0.01) return;
    ctx.globalAlpha = a; ctx.drawImage(dot, x - r * 2, y - r * 2, r * 4, r * 4);
  };

  /* Mise en place des positions à partir du sachet réel */
  const N_PILLS = 7, PER = 22;
  let pills = [], parts = [], sparks = [], motes = [];
  let mouthY = 0, mouthX = 0, mouthW = 0;
  const layout = () => {
    resize();
    const p = box(pouch), m = box(mouth);
    mouthX = m.x + m.w / 2; mouthY = m.y + m.h / 2; mouthW = m.w;
    PW = clamp(p.w * 0.16, 22, 50); PH = PW * 0.64;
    makePill();
    const cx = p.x + p.w / 2, cy = p.y + p.h / 2, R = p.h * 0.66;
    // Sur mobile le sachet touche presque la barre du haut : on aplatit l'arc pour garder les pastilles visibles
    const Ry = Math.max(p.h * 0.3, Math.min(R, cy - PH * 2.6));
    pills = [];
    for (let i = 0; i < N_PILLS; i++) {
      const a = lerp(-Math.PI * 0.92, -Math.PI * 0.08, i / (N_PILLS - 1));
      const x = clamp(cx + Math.cos(a) * R * 1.05, PW, W - PW);
      const y = Math.max(PH * 2, cy + Math.sin(a) * Ry);
      const tx = mouthX + lerp(-0.28, 0.28, ((i * 3) % N_PILLS) / (N_PILLS - 1)) * mouthW;
      pills.push({ x, y, tx, ty: mouthY + PH * 1.2, rot: rand(-0.6, 0.6), spin: rand(-5, 5), order: i });
    }
    // Ordre de chute : du centre vers l'extérieur, en alternant les côtés
    pills.sort((a, b) => Math.abs(a.order - 3) - Math.abs(b.order - 3) || a.order - b.order).forEach((p, k) => { p.k = k; });
    parts = [];
    pills.forEach((pl) => {
      for (let j = 0; j < PER; j++) {
        const sx = rand(-0.05, 1.05) * W, sy = rand(-0.05, 1.05) * H;
        const ang = rand(0, Math.PI * 2), rad = rand(0.2, 1) * PW * 0.55;
        parts.push({ pl, sx, sy, ox: Math.cos(ang) * rad, oy: Math.sin(ang) * rad * 0.7, r: rand(0.9, 2.2), d: rand(0, 420), sw: rand(-1, 1) * 120 });
      }
    });
  };

  /* Chronologie (ms) */
  const T_GATHER = 1250, T_FORM = 1150, FORM_LEN = 480, T_DROP = 1750, DROP_GAP = 120, DROP_LEN = 620;
  const T_SEAL = T_DROP + (N_PILLS - 1) * DROP_GAP + DROP_LEN + 80;
  const T_END = T_SEAL + 950;
  let t0 = 0, sealed = false, ended = false, raf = 0;

  const burst = () => {
    const z = box(mouth);
    for (let i = 0; i < 46; i++) {
      const a = rand(-Math.PI * 0.95, -Math.PI * 0.05), v = rand(1.2, 4.2);
      sparks.push({ x: z.x + rand(0.05, 0.95) * z.w, y: z.y + z.h * 0.5 + pouch.getBoundingClientRect().height * 0.12, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: rand(500, 1100), r: rand(0.8, 2) });
    }
  };

  const frame = (now) => {
    if (!t0) t0 = now;
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    // 1 et 2 : particules qui se rassemblent puis se fondent dans la pastille
    for (const q of parts) {
      const pl = q.pl;
      const g = easeInOut(clamp((t - q.d) / T_GATHER));
      const f = clamp((t - T_FORM - pl.order * 40) / FORM_LEN);
      const tx = pl.x + q.ox * (1 - f), ty = pl.y + q.oy * (1 - f);
      const swirl = Math.sin(g * Math.PI) * q.sw;
      const dx = tx - q.sx, dy = ty - q.sy, len = Math.hypot(dx, dy) || 1;
      const x = lerp(q.sx, tx, g) + (-dy / len) * swirl;
      const y = lerp(q.sy, ty, g) + (dx / len) * swirl;
      const a = clamp(t / 300) * (1 - f) * 0.9;
      drawDot(x, y, q.r, a);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // 2 et 3 : pastilles qui apparaissent puis sont lancées dans le sachet
    for (const pl of pills) {
      const f = clamp((t - T_FORM - pl.order * 40) / FORM_LEN);
      if (f <= 0) continue;
      const start = T_DROP + pl.k * DROP_GAP;
      const d = clamp((t - start) / DROP_LEN);
      if (d >= 1) continue;
      let x = pl.x, y = pl.y, rot = pl.rot + Math.sin(t / 380 + pl.order) * 0.08, s = easeOutBack(f);
      if (d > 0) {
        // Trajectoire en cloche (courbe de Bézier) vers l'ouverture, qui accélère en descendant
        const u = Math.pow(d, 1.35), cxp = (pl.x + pl.tx) / 2, cyp = Math.min(pl.y, mouthY) - Math.max(60, H * 0.12);
        x = (1 - u) * (1 - u) * pl.x + 2 * (1 - u) * u * cxp + u * u * pl.tx;
        y = (1 - u) * (1 - u) * pl.y + 2 * (1 - u) * u * cyp + u * u * pl.ty;
        rot = pl.rot + pl.spin * u;
        s *= lerp(1, 0.82, u);
      }
      if (d > 0.5) {
        // Une fois au-dessus du sachet, la pastille disparaît sous le bord de l'ouverture
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, mouthY); ctx.clip();
        drawPill(x, y, s, rot, 1);
        ctx.restore();
      } else drawPill(x, y, s, rot, 1);
    }

    // 4 : fermeture du sachet
    if (!sealed && t >= T_SEAL) { sealed = true; hero.classList.add("is-sealed"); burst(); }

    // Gerbe et particules lentes (après la fermeture)
    ctx.globalCompositeOperation = "lighter";
    sparks = sparks.filter((s) => (s.life += 16) < s.max);
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.vy += 0.035; s.vx *= 0.985;
      drawDot(s.x, s.y, s.r, (1 - s.life / s.max) * 0.9);
    }
    for (const m of motes) {
      m.y -= m.v; m.x += Math.sin((now / 1000) * m.f + m.ph) * 0.15;
      if (m.y < -10) { m.y = H + 10; m.x = rand(0, W); }
      drawDot(m.x, m.y, m.r, m.a * clamp((t - T_END) / 1200));
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // 5 : retour au sachet 3D
    if (!ended && t >= T_END) {
      ended = true; done();
      const n = W < 600 ? 12 : 22;
      for (let i = 0; i < n; i++) motes.push({ x: rand(0, W), y: rand(0, H), v: rand(0.12, 0.42), r: rand(0.7, 1.6), a: rand(0.12, 0.35), f: rand(0.3, 0.9), ph: rand(0, 6) });
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  };

  // On ne dessine que lorsque le premier écran est visible
  let visible = true, paused = 0;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && t0) { const resume = performance.now(); t0 += resume - (paused || resume); paused = 0; raf = requestAnimationFrame(frame); }
      if (!visible) paused = performance.now();
    }).observe(hero);
  }
  window.addEventListener("resize", () => { if (ended) resize(); });

  const start = () => { layout(); raf = requestAnimationFrame(frame); };
  const img = pouch.querySelector(".pouch__face--front img");
  const ready = img && !img.complete ? new Promise((res) => { img.addEventListener("load", res, { once: true }); img.addEventListener("error", res, { once: true }); setTimeout(res, 1500); }) : Promise.resolve();
  // Deux images pour laisser la mise en page se poser avant de mesurer le sachet
  ready.then(() => requestAnimationFrame(() => requestAnimationFrame(start)));
})();

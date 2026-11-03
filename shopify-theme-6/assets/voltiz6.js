/* =====================================================================
   VOLTIZ, brouillon 6 : scripts ajoutés à voltiz3.js et voltiz5.js
   1. Premier écran : les plans bougent légèrement avec la souris (profondeur).
      (Le décalage au défilement, --hs, vient de voltiz5.js.)
   2. Ligne d'énergie : un tracé jaune, en courbes et en angles d'éclair, qui se dessine en descendant
      et s'efface en remontant. Il passe dans les marges et ne traverse la page que dans les espaces vides
      entre deux sections, jamais sur un texte, un bouton ou une image.
   ===================================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scroller = document.querySelector(".page-wrapper");
  const onScroll = (fn) => {
    window.addEventListener("scroll", fn, { passive: true });
    if (scroller) scroller.addEventListener("scroll", fn, { passive: true });
  };

  /* ---------- 1. Profondeur du premier écran ---------- */
  const initHero = (root) => {
    if (reduce || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    root.querySelectorAll(".v6 [data-vz6-hero]").forEach((hero) => {
      if (hero._vz6) return; hero._vz6 = true;
      let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
      const tick = () => {
        x += (tx - x) * 0.08; y += (ty - y) * 0.08;
        hero.style.setProperty("--mx", x.toFixed(4));
        hero.style.setProperty("--my", y.toFixed(4));
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
      };
      const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
      hero.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        go();
      });
      hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; go(); });
    });
  };

  /* ---------- 2. Ligne d'énergie ---------- */
  const NS = "http://www.w3.org/2000/svg";
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    if (parent) parent.appendChild(n);
    return n;
  };
  // Hasard reproductible : le tracé reste le même d'un chargement à l'autre
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // Éléments qu'il ne faut jamais recouvrir
  const SOLID = "h1, h2, h3, h4, p, li, a, button, img, picture, video, input, select, textarea, label, summary, .pouch, .btn, .specs, .marquee, [data-vz-pouch]";

  const initLine = () => {
    const start = document.querySelector("[data-vz6-line-start]");
    if (!start) return;
    const main = document.getElementById("MainContent") || start.closest("main");
    if (!main || main._vz6line) return;
    main._vz6line = true;
    if (getComputedStyle(main).position === "static") main.style.position = "relative";

    const svg = el("svg", { class: "vz6-line", "aria-hidden": "true", focusable: "false" });
    const defs = el("defs", {}, svg);
    const grad = el("radialGradient", { id: "vz6-tip" }, defs);
    el("stop", { offset: "0", "stop-color": "#FECD06", "stop-opacity": ".75" }, grad);
    el("stop", { offset: "1", "stop-color": "#FECD06", "stop-opacity": "0" }, grad);
    const mask = el("mask", { id: "vz6-mask", maskUnits: "userSpaceOnUse" }, defs);
    const g = el("g", { mask: "url(#vz6-mask)" }, svg);
    const glow = el("path", { class: "vz6-line__glow" }, g);
    const core = el("path", { class: "vz6-line__core" }, g);
    const halo = el("circle", { class: "vz6-line__tip-halo", r: "16" }, svg);
    const tip = el("circle", { class: "vz6-line__tip", r: "3" }, svg);
    if (reduce) svg.classList.add("is-static");
    main.appendChild(svg);

    let L = 0, lens = [], ys = [];

    const boxes = (sec, top0) => {
      let l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
      sec.querySelectorAll(SOLID).forEach((n) => {
        if (n.closest('[aria-hidden="true"]') || n.closest(".vz6-line")) return;
        const cs = getComputedStyle(n);
        if (cs.visibility === "hidden" || cs.display === "none") return;
        const q = n.getBoundingClientRect();
        if (q.width < 2 || q.height < 2) return;
        l = Math.min(l, q.left); r = Math.max(r, q.right); t = Math.min(t, q.top - top0); b = Math.max(b, q.bottom - top0);
      });
      return { l, r, t, b };
    };

    const build = () => {
      const mr = main.getBoundingClientRect();
      const W = main.clientWidth, H = main.scrollHeight;
      if (W < 200) return;
      svg.setAttribute("width", W); svg.setAttribute("height", H);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      svg.style.height = `${H}px`;

      const secs = [...main.children].filter((s) => s !== svg && s.offsetHeight > 0);
      const heroSec = secs.find((s) => s.contains(start));
      const buy = main.querySelector("#precommande");
      const endSec = (buy && secs.find((s) => s.contains(buy))) || secs[secs.length - 1];
      const i0 = secs.indexOf(heroSec), i1 = secs.indexOf(endSec);
      if (i0 < 0 || i1 <= i0) { svg.style.display = "none"; return; }
      svg.style.display = "";

      const info = secs.slice(i0, i1 + 1).map((s) => {
        const q = s.getBoundingClientRect();
        const top = q.top - mr.top, bottom = q.bottom - mr.top;
        const c = boxes(s, mr.top);
        return { top, bottom, l: isFinite(c.l) ? c.l - mr.left : W * 0.1, r: isFinite(c.r) ? c.r - mr.left : W * 0.9, ct: isFinite(c.t) ? c.t : top, cb: isFinite(c.b) ? c.b : bottom };
      });

      // Bords du contenu standard de la page (.wrap) : la ligne reste dans les marges, même près des éléments décoratifs
      const wrap = main.querySelector(".v3 .wrap");
      let wl = W * 0.1, wr = W * 0.9;
      if (wrap) { const q = wrap.getBoundingClientRect(), cs = getComputedStyle(wrap); wl = q.left - mr.left + parseFloat(cs.paddingLeft); wr = q.right - mr.left - parseFloat(cs.paddingRight); }
      info.forEach((s) => { s.l = Math.min(s.l, wl); s.r = Math.max(s.r, wr); });
      const small = W < 750;
      const pad = small ? 7 : 18;           // distance minimale avec le contenu
      const edge = small ? 4 : 10;          // distance minimale avec le bord de l'écran
      const gutter = (s, side) => {
        if (side < 0) { const a = edge, b = Math.max(edge, s.l - pad); return [a, b]; }
        const a = Math.min(W - edge, s.r + pad), b = W - edge; return [a, b];
      };
      const xIn = (gt, k) => gt[0] + (gt[1] - gt[0]) * k;

      const pts = [];                       // [x, y, sharp]
      const rand = rng(1793);
      let side = 1;                         // on part à droite, sous le sachet
      const h = info[0];
      let gt = gutter(h, side);
      let y = h.bottom - (small ? 40 : 90);
      pts.push([xIn(gt, 0.5), y, true]);

      for (let k = 0; k < info.length - 1; k++) {
        const s = info[k], n = info[k + 1];
        const bandTop = Math.max(s.cb, k === 0 ? s.bottom - 20 : s.cb), bandBottom = n.ct;
        const band = bandBottom - bandTop;
        const last = k === info.length - 2;
        const yc = band > 0 ? (bandTop + bandBottom) / 2 : n.top;
        // Descente dans la marge, en courbes, avec un coude en éclair au milieu
        gt = gutter(k === 0 ? n : s, side);
        const yEnd = yc - Math.min(60, Math.max(band / 2 - 4, 8));
        const span = yEnd - y;
        if (span > 40) {
          const steps = Math.max(1, Math.round(span / (small ? 170 : 240)));
          const kink = 1 + Math.floor(rand() * steps);
          for (let j = 1; j <= steps; j++) {
            const yy = y + (span * j) / steps;
            const g2 = gutter(info[k + (yy > s.bottom ? 1 : 0)] || s, side);
            if (j === kink && span > 160) {
              const xa = xIn(g2, 0.2 + rand() * 0.2), xb = xIn(g2, 0.75 + rand() * 0.2);
              pts.push([xa, yy - 36, true], [xb, yy - 14, true], [xIn(g2, 0.35), yy, true]);
            } else {
              pts.push([xIn(g2, 0.25 + rand() * 0.5), yy, false]);
            }
          }
          y = yEnd;
        }
        // Traversée en éclair, seulement dans un espace vide assez haut
        const canCross = band > (small ? 46 : 70);
        if (canCross) {
          const from = pts[pts.length - 1][0];
          const nextSide = last ? 0 : -side;
          const to = last ? W * (small ? 0.5 : 0.5) : xIn(gutter(n, nextSide), 0.5);
          const hb = Math.min(band / 2 - 6, small ? 26 : 40);
          pts.push(
            [from + (to - from) * 0.38, yc - hb * 0.15, true],
            [from + (to - from) * 0.52, yc - hb * 0.55, true],
            [to, yc + hb * (last ? 0.2 : 0.9), true]
          );
          y = yc + hb * 0.9;
          if (last) break;
          side = nextSide;
        } else if (last) {
          pts.push([pts[pts.length - 1][0], n.top + 8, true]);
        }
      }

      // Courbes lisses (Catmull-Rom) entre points normaux, segments droits autour des angles d'éclair
      let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i], q = pts[i - 1];
        if (p[2] || q[2]) { d += ` L${p[0].toFixed(1)} ${p[1].toFixed(1)}`; continue; }
        const a = pts[i - 2] || q, b = pts[i + 1] || p;
        const c1x = q[0] + (p[0] - a[0]) / 6, c1y = q[1] + (p[1] - a[1]) / 6;
        const c2x = p[0] - (b[0] - q[0]) / 6, c2y = p[1] - (b[1] - q[1]) / 6;
        d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      }
      glow.setAttribute("d", d);
      core.setAttribute("d", d);

      // Discrète le long des sections, plus lumineuse dans les espaces vides
      mask.innerHTML = "";
      el("rect", { x: 0, y: 0, width: W, height: H, fill: "#fff" }, mask);
      info.forEach((s, k) => { if (k > 0) el("rect", { x: 0, y: s.ct, width: W, height: Math.max(0, s.cb - s.ct), fill: "#8c8c8c" }, mask); });

      L = core.getTotalLength();
      lens = []; ys = [];
      const N = Math.max(60, Math.ceil(L / 10));
      let maxY = -Infinity;
      for (let i = 0; i <= N; i++) {
        const len = (L * i) / N;
        maxY = Math.max(maxY, core.getPointAtLength(len).y);
        lens.push(len); ys.push(maxY);
      }
      [glow, core].forEach((p) => { p.style.strokeDasharray = reduce ? "none" : `${L} ${L}`; });
      update();
    };

    // La pointe de la ligne suit un repère placé aux deux tiers de l'écran
    const update = () => {
      if (reduce || !L) return;
      const mr = main.getBoundingClientRect();
      const target = window.innerHeight * 0.64 - mr.top;
      let len;
      if (target <= ys[0]) len = 0;
      else if (target >= ys[ys.length - 1]) len = L;
      else {
        let lo = 0, hi = ys.length - 1;
        while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ys[m] < target) lo = m; else hi = m; }
        const f = (target - ys[lo]) / Math.max(1e-6, ys[hi] - ys[lo]);
        len = lens[lo] + (lens[hi] - lens[lo]) * f;
      }
      const off = L - len;
      glow.style.strokeDashoffset = off; core.style.strokeDashoffset = off;
      const on = len > 1;
      tip.style.display = halo.style.display = on ? "" : "none";
      if (on) {
        const p = core.getPointAtLength(len);
        tip.setAttribute("cx", p.x); tip.setAttribute("cy", p.y);
        halo.setAttribute("cx", p.x); halo.setAttribute("cy", p.y);
      }
    };

    let raf = 0;
    onScroll(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); });
    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(build, 160); };
    window.addEventListener("resize", later);
    window.addEventListener("load", later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    if ("ResizeObserver" in window) new ResizeObserver(later).observe(main);
    build();
  };

  const init = (root) => { initHero(root); };
  init(document);
  initLine();
  document.addEventListener("shopify:section:load", (e) => { init(e.target); });
})();

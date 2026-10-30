/* =====================================================================
   VOLTIZ, brouillon 2 : scripts
   1. Apparitions   2. En-tête   3. Sachet 3D (glisser, bouton, défilement)   4. Étapes du produit
   5. Onglets des moments   6. Achat (photos, variantes, quantité, total)   7. Barre d'achat sur téléphone
   ===================================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const design = !!(window.Shopify && window.Shopify.designMode);
  const scroller = document.querySelector(".page-wrapper");
  // Horizon fait défiler .page-wrapper sur ordinateur, la fenêtre sur téléphone : on écoute les deux.
  const onScroll = (fn) => {
    window.addEventListener("scroll", fn, { passive: true });
    if (scroller) scroller.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
  };
  const viewH = () => window.innerHeight || document.documentElement.clientHeight;

  /* ---------- 1. Apparitions au défilement ---------- */
  const initReveal = (root) => {
    const els = root.querySelectorAll(".v2 [data-reveal]");
    root.querySelectorAll(".v2 .why__grid, .v2 .hero__text").forEach((list) => {
      list.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--d", `${i * 80}ms`));
    });
    if (!("IntersectionObserver" in window) || reduce || design) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => io.observe(el));
  };
  document.addEventListener("focusin", (e) => { const el = e.target.closest && e.target.closest("[data-reveal]"); if (el) el.classList.add("is-in"); });

  /* ---------- 2. En-tête ---------- */
  const nav = document.querySelector(".v2 [data-vz-nav]");
  if (nav) {
    const update = () => nav.classList.toggle("is-stuck", Math.max(window.scrollY, scroller ? scroller.scrollTop : 0) > 4);
    onScroll(update); update();
    document.querySelectorAll(".v2 .menu").forEach((menu) => {
      menu.addEventListener("click", (e) => { if (e.target.closest("a")) menu.open = false; });
      document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.open = false; });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); } });
    });
  }

  /* ---------- 3. Sachet 3D ---------- */
  const setAngle = (pouch, ry, rx = 0) => {
    pouch.style.setProperty("--ry", `${ry}deg`);
    pouch.style.setProperty("--rx", `${rx}deg`);
  };
  const initPouch = (root) => {
    root.querySelectorAll('.v2 [data-vz-pouch="drag"]').forEach((pouch) => {
      if (pouch._vz) return; pouch._vz = true;
      const rest = -14;
      let base = rest, start = 0, drag = false, moved = false;
      setAngle(pouch, base);
      const stage = pouch.closest(".hero__stage");
      const turn = stage && stage.querySelector("[data-vz-turn]");
      const label = turn && turn.querySelector("span");
      const showBack = (on) => {
        base = on ? rest + 180 : rest;
        setAngle(pouch, base);
        if (turn) { turn.setAttribute("aria-pressed", String(on)); label.textContent = on ? turn.dataset.back : turn.dataset.front; }
      };
      if (turn) turn.addEventListener("click", () => showBack(turn.getAttribute("aria-pressed") !== "true"));
      pouch.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); base += e.key === "ArrowLeft" ? -20 : 20; setAngle(pouch, base); }
      });
      if (reduce) return;
      // Glisser pour faire tourner (souris ou doigt, le défilement vertical reste possible)
      pouch.addEventListener("pointerdown", (e) => {
        drag = true; moved = false; start = e.clientX; pouch.classList.add("is-live", "is-dragging");
        pouch.setPointerCapture(e.pointerId);
      });
      pouch.addEventListener("pointermove", (e) => {
        if (drag) { const dx = e.clientX - start; if (Math.abs(dx) > 3) moved = true; setAngle(pouch, base + dx * 0.6); return; }
        if (e.pointerType !== "mouse") return;
        // Survol à la souris : légère inclinaison vers le curseur
        const r = pouch.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        pouch.classList.add("is-live");
        setAngle(pouch, base + x * 22, y * -10);
      });
      const end = (e) => {
        if (drag) {
          const dx = e.clientX - start;
          // Au relâchement, le sachet se pose sur la face la plus proche
          const a = base + dx * 0.6;
          const back = Math.abs(((Math.round((a - rest) / 180) % 2) + 2) % 2) === 1;
          base = Math.round((a - rest) / 180) * 180 + rest;
          if (turn) { turn.setAttribute("aria-pressed", String(back)); label.textContent = back ? turn.dataset.back : turn.dataset.front; }
        }
        drag = false; pouch.classList.remove("is-live", "is-dragging"); setAngle(pouch, base);
      };
      pouch.addEventListener("pointerup", end);
      pouch.addEventListener("pointercancel", end);
      pouch.addEventListener("pointerleave", () => { if (!drag) { pouch.classList.remove("is-live"); setAngle(pouch, base); } });
    });
  };

  /* ---------- 4. Le produit : le sachet tourne avec le défilement, l'étape visible s'allume ---------- */
  const initStory = (root) => {
    root.querySelectorAll(".v2 [data-vz-story]").forEach((story) => {
      const pouch = story.querySelector('[data-vz-pouch="scroll"]');
      const steps = [...story.querySelectorAll("[data-vz-step]")];
      if (!pouch || !steps.length) return;
      const wide = window.matchMedia("(min-width: 990px)");
      let target = -14, current = -14, raf = 0;
      const tick = () => {
        current += (target - current) * 0.12;
        setAngle(pouch, current);
        if (Math.abs(target - current) > 0.1) raf = requestAnimationFrame(tick); else raf = 0;
      };
      const update = () => {
        if (!wide.matches) { story.classList.remove("is-live"); return; }
        story.classList.add("is-live");
        const mid = viewH() * 0.5;
        let active = 0;
        steps.forEach((s, i) => { if (s.getBoundingClientRect().top < mid) active = i; });
        steps.forEach((s, i) => s.classList.toggle("is-on", i === active));
        // Rotation continue : chaque étape « dos » ajoute un demi-tour, les autres reviennent à la face
        const first = steps[0].getBoundingClientRect().top, last = steps[steps.length - 1].getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, (mid - first) / Math.max(1, last - first)));
        const wantBack = steps[active].dataset.vzStep === "back";
        target = (wantBack ? 166 : -14) + (p - 0.5) * 24;
        if (reduce) { setAngle(pouch, wantBack ? 166 : -14); return; }
        if (!raf) raf = requestAnimationFrame(tick);
      };
      onScroll(update); update();
    });
  };

  /* ---------- 5. Onglets des moments (clavier : flèches) ---------- */
  const initTabs = (root) => {
    root.querySelectorAll(".v2 [data-vz-tabs]").forEach((box) => {
      const tabs = [...box.querySelectorAll('[role="tab"]')];
      const panels = [...box.querySelectorAll('[role="tabpanel"]')];
      const select = (i, focus) => {
        tabs.forEach((t, k) => { t.setAttribute("aria-selected", String(k === i)); t.tabIndex = k === i ? 0 : -1; });
        panels.forEach((p, k) => { p.classList.toggle("is-on", k === i); p.hidden = k !== i; });
        if (focus) tabs[i].focus();
      };
      tabs.forEach((t, i) => {
        t.addEventListener("click", () => select(i));
        t.addEventListener("keydown", (e) => {
          const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (n) { e.preventDefault(); select((i + n + tabs.length) % tabs.length, true); }
        });
      });
      box.addEventListener("shopify:block:select", (e) => { const i = panels.indexOf(e.target); if (i >= 0) select(i); });
    });
  };

  /* ---------- 6. Achat ---------- */
  const money = (cents, format) => {
    const group = (n, sep) => n.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    const [int, dec] = (cents / 100).toFixed(2).split(".");
    return (format || "{{amount}}").replace(/\{\{\s*(\w+)\s*\}\}/, (m, key) => {
      switch (key) {
        case "amount_no_decimals": return group(String(Math.round(cents / 100)), ",");
        case "amount_with_comma_separator": return `${group(int, ".")},${dec}`;
        case "amount_with_apostrophe_separator": return `${group(int, "'")}.${dec}`;
        case "amount_with_space_separator": return `${group(int, " ")},${dec}`;
        default: return `${group(int, ",")}.${dec}`;
      }
    });
  };
  const initBuy = (root) => {
    root.querySelectorAll(".v2 [data-vz-gallery]").forEach((g) => {
      const shots = g.querySelectorAll(".buy__shot");
      g.querySelectorAll(".buy__thumb").forEach((b) => b.addEventListener("click", () => {
        shots.forEach((s) => s.classList.toggle("is-on", s.dataset.shot === b.dataset.show));
        g.querySelectorAll(".buy__thumb").forEach((t) => t.setAttribute("aria-pressed", String(t === b)));
      }));
    });
    root.querySelectorAll(".v2 .buy__form").forEach((form) => {
      const qty = form.querySelector('input[name="quantity"]');
      if (!qty) return;
      const minus = form.querySelector('[data-step="-1"]'), plus = form.querySelector('[data-step="1"]');
      const max = parseInt(form.dataset.max, 10) || 20;
      const totals = form.closest(".buy").querySelectorAll("[data-vz-total]");
      const clamp = (n) => Math.min(max, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));
      const price = () => { const v = form.querySelector('input[name="id"]:checked') || form.querySelector('input[name="id"]'); return v ? parseInt(v.dataset.price, 10) || 0 : 0; };
      const update = () => {
        const n = clamp(parseInt(qty.value, 10));
        if (form.dataset.moneyFormat) totals.forEach((el) => { el.textContent = money(n * price(), form.dataset.moneyFormat); });
        minus.disabled = n <= 1; plus.disabled = n >= max;
      };
      form.querySelectorAll(".qty__btn").forEach((b) => b.addEventListener("click", () => { qty.value = clamp(parseInt(qty.value, 10) + Number(b.dataset.step)); update(); }));
      qty.addEventListener("input", update);
      qty.addEventListener("blur", () => { qty.value = clamp(parseInt(qty.value, 10)); update(); });
      form.querySelectorAll('input[name="id"]').forEach((r) => r.addEventListener("change", update));
      update();
    });
  };

  /* ---------- 7. Barre d'achat : après le premier écran, cachée quand la zone d'achat est visible ---------- */
  const initBar = (root) => {
    root.querySelectorAll(".v2 [data-vz-bar]").forEach((bar) => {
      const buy = bar.parentElement.querySelector(".buy");
      const btn = bar.querySelector("a");
      if (!buy) return;
      const update = () => {
        const r = buy.getBoundingClientRect();
        const past = Math.max(window.scrollY, scroller ? scroller.scrollTop : 0) > viewH() * 0.7;
        const show = past && (r.top > viewH() || r.bottom < 0);
        bar.classList.toggle("is-on", show);
        bar.setAttribute("aria-hidden", String(!show));
        btn.tabIndex = show ? 0 : -1;
      };
      onScroll(update); update();
    });
  };

  const init = (root) => { initReveal(root); initPouch(root); initStory(root); initTabs(root); initBuy(root); initBar(root); };
  init(document);
  document.addEventListener("shopify:section:load", (e) => init(e.target));
})();

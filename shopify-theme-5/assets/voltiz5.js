/* =====================================================================
   VOLTIZ, brouillon 5 : scripts ajoutés à voltiz3.js
   1. Hero : le sachet et l'éclair bougent un peu au défilement   2. Moments : la couleur suit l'onglet
   3. Boutons d'ajout au panier : état de chargement   4. Offre -10 % (apparition, fermeture, copie du code)
   ===================================================================== */
(() => {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const design = !!(window.Shopify && window.Shopify.designMode);
  const scroller = document.querySelector(".page-wrapper");
  const scrollTop = () => Math.max(window.scrollY, scroller ? scroller.scrollTop : 0);
  const onScroll = (fn) => {
    window.addEventListener("scroll", fn, { passive: true });
    if (scroller) scroller.addEventListener("scroll", fn, { passive: true });
  };
  const store = {
    get: (k) => { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { window.localStorage.setItem(k, v); } catch (e) { /* stockage indisponible */ } },
  };

  /* ---------- 1. Hero ---------- */
  const initHero = (root) => {
    root.querySelectorAll(".v5 [data-vz-hero]").forEach((hero) => {
      if (reduce) return;
      let raf = 0;
      const update = () => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        if (r.bottom < 0) return;
        hero.style.setProperty("--hs", Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))).toFixed(3));
      };
      onScroll(() => { if (!raf) raf = requestAnimationFrame(update); });
      update();
    });
  };

  /* ---------- 2. Moments : la section prend la couleur de l'univers choisi ---------- */
  const initMoments = (root) => {
    root.querySelectorAll(".v5 [data-vz-moments]").forEach((box) => {
      const sync = () => {
        const tab = box.querySelector('[role="tab"][aria-selected="true"]');
        if (tab && tab.dataset.tone) box.dataset.tone = tab.dataset.tone;
      };
      box.addEventListener("click", (e) => { if (e.target.closest('[role="tab"]')) requestAnimationFrame(sync); });
      box.addEventListener("keydown", (e) => { if (e.target.closest('[role="tab"]')) requestAnimationFrame(sync); });
      box.addEventListener("shopify:block:select", () => requestAnimationFrame(sync));
    });
  };

  /* ---------- 3. État de chargement des boutons d'ajout au panier ---------- */
  document.addEventListener("submit", (e) => {
    const form = e.target;
    if (!form.closest || !form.closest(".v5") || !form.matches('form[action*="/cart/add"]')) return;
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.classList.add("is-loading"); btn.setAttribute("aria-busy", "true"); }
  });
  window.addEventListener("pageshow", () => document.querySelectorAll(".v5 .btn.is-loading").forEach((b) => { b.classList.remove("is-loading"); b.removeAttribute("aria-busy"); }));

  /* ---------- 4. Offre -10 % ---------- */
  const KEY = "vz5-offre";
  const initPopup = (root) => {
    root.querySelectorAll(".v5 [data-vz-popup]").forEach((pop) => {
      if (pop._vz) return; pop._vz = true;
      const state = pop.querySelector("[data-vz-popup-state]");
      const days = parseInt(pop.dataset.days, 10) || 14;
      const delay = (parseInt(pop.dataset.delay, 10) || 20) * 1000;
      let shown = false, lastFocus = null;
      const bar = document.querySelector(".v3 [data-vz-bar]");
      const placeAboveBar = () => {
        const on = bar && bar.classList.contains("is-on");
        pop.style.setProperty("--vz-bar", on ? `${bar.getBoundingClientRect().height + 8}px` : "0px");
      };
      const open = (focus) => {
        if (shown) return; shown = true;
        lastFocus = document.activeElement;
        placeAboveBar();
        pop.hidden = false;
        if (focus) { const f = pop.querySelector("input, button, a"); if (f) f.focus({ preventScroll: true }); }
      };
      const close = () => {
        pop.hidden = true;
        store.set(KEY, String(Date.now() + days * 864e5));
        if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
      };
      pop.querySelectorAll("[data-vz-popup-close]").forEach((b) => b.addEventListener("click", close));
      pop.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
      onScroll(placeAboveBar);
      pop.querySelectorAll("[data-vz-copy]").forEach((b) => b.addEventListener("click", () => {
        const done = () => { b.textContent = b.dataset.done; };
        if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.vzCopy).then(done, () => {}); else done();
      }));

      // Retour du formulaire (inscription réussie ou erreur) : on rouvre la fenêtre tout de suite
      if (state) {
        if (state.dataset.vzPopupState === "success") store.set(KEY, String(Date.now() + 3650 * 864e5));
        open(true);
        return;
      }
      if (design) {
        document.addEventListener("shopify:section:select", (e) => { if (e.target.contains(pop)) { shown = false; open(false); } });
        document.addEventListener("shopify:section:deselect", (e) => { if (e.target.contains(pop)) { pop.hidden = true; shown = false; } });
        return;
      }
      const until = parseInt(store.get(KEY), 10);
      if (until && until > Date.now()) return;
      // Jamais à l'arrivée : après le délai, ou dès que la moitié de la page est passée
      const timer = setTimeout(() => open(false), delay);
      const check = () => {
        const doc = scroller && scroller.scrollHeight > scroller.clientHeight ? scroller : document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        if (max > 0 && scrollTop() / max > 0.5) { clearTimeout(timer); open(false); }
      };
      onScroll(check);
    });
  };

  const init = (root) => { initHero(root); initMoments(root); initPopup(root); };
  init(document);
  document.addEventListener("shopify:section:load", (e) => init(e.target));
})();

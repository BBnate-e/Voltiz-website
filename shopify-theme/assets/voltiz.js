/* =====================================================================
   VOLTIZ : scripts des sections Voltiz du thème
   1. Apparitions au scroll   2. En-tête   3. Bloc produit (quantité et total)   4. Photos de l'accueil
   ===================================================================== */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Apparitions au scroll (une seule fois) ---------- */
  const initReveal = (root) => {
    const els = root.querySelectorAll(".vz [data-reveal]");
    root.querySelectorAll(".vz .moments__list").forEach((list) => {
      list.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--d", `${(i % 3) * 90}ms`));
    });
    // Dans l'éditeur de thème, tout est visible tout de suite
    if (!("IntersectionObserver" in window) || reduceMotion || window.Shopify?.designMode) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
  };
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest && e.target.closest("[data-reveal]");
    if (el) el.classList.add("is-in");
  });

  /* ---------- 2. En-tête : fond plus clair une fois la page défilée ----------
     Sur ordinateur, Horizon fait défiler .page-wrapper et non la fenêtre. */
  const header = document.querySelector(".vz .top");
  if (header) {
    const scroller = document.querySelector(".page-wrapper");
    const update = () => {
      const y = Math.max(window.scrollY, scroller ? scroller.scrollTop : 0);
      header.classList.toggle("is-stuck", y > 8);
    };
    // Menu mobile : se referme après un clic sur un lien
    document.querySelectorAll(".vz .menu").forEach((menu) => {
      menu.addEventListener("click", (e) => { if (e.target.closest("a")) menu.open = false; });
      document.addEventListener("click", (e) => { if (!menu.contains(e.target)) menu.open = false; });
    });
    window.addEventListener("scroll", update, { passive: true });
    if (scroller) scroller.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- 3. Bloc produit : quantité et total ---------- */
  const formatMoney = (cents, format) => {
    const group = (n, sep) => n.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    const [int, dec] = (cents / 100).toFixed(2).split(".");
    return (format || "{{amount}}").replace(/\{\{\s*(\w+)\s*\}\}/, (m, key) => {
      switch (key) {
        case "amount_no_decimals": return group(String(Math.round(cents / 100)), ",");
        case "amount_with_comma_separator": return `${group(int, ".")},${dec}`;
        case "amount_no_decimals_with_comma_separator": return group(String(Math.round(cents / 100)), ".");
        case "amount_with_apostrophe_separator": return `${group(int, "'")}.${dec}`;
        case "amount_with_space_separator": return `${group(int, " ")},${dec}`;
        default: return `${group(int, ",")}.${dec}`;
      }
    });
  };

  const initOrder = (root) => {
    root.querySelectorAll("#vz-order, form[id^='vz-order']").forEach((form) => {
      const qty = form.querySelector('input[name="quantity"]');
      const minus = form.querySelector('[data-step="-1"]');
      const plus = form.querySelector('[data-step="1"]');
      const totals = form.querySelectorAll("[data-vz-total]");
      const unit = form.querySelector("[data-vz-unit]");
      const max = parseInt(form.dataset.max, 10) || 20;
      const fmt = form.dataset.moneyFormat;
      if (!qty) return;

      const clamp = (n) => Math.min(max, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));
      const price = () => {
        const sel = form.querySelector('input[name="id"]:checked') || form.querySelector('input[name="id"]');
        return sel ? parseInt(sel.dataset.price, 10) || 0 : 0;
      };
      const update = () => {
        const n = clamp(parseInt(qty.value, 10));
        const p = price();
        totals.forEach((el) => { el.textContent = formatMoney(n * p, fmt); });
        if (unit) unit.textContent = formatMoney(p, fmt);
        minus.disabled = n <= 1;
        plus.disabled = n >= max;
      };
      form.querySelectorAll(".qty__btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          qty.value = clamp(parseInt(qty.value, 10) + Number(btn.dataset.step));
          update();
        });
      });
      qty.addEventListener("input", update);
      qty.addEventListener("blur", () => { qty.value = clamp(parseInt(qty.value, 10)); update(); });
      form.querySelectorAll('input[name="id"]').forEach((r) => r.addEventListener("change", update));
      form.addEventListener("submit", () => { qty.value = clamp(parseInt(qty.value, 10)); });
      update();
    });
  };

  /* ---------- 4. Photos de l'accueil : fondu toutes les N secondes, bouton pause ---------- */
  const initSlides = (root) => {
    root.querySelectorAll("[data-vz-slides]").forEach((hero) => {
      if (hero._vzTimer) clearInterval(hero._vzTimer);
      const slides = hero.querySelectorAll(".hero__slide");
      const caps = hero.querySelectorAll(".hero__cap");
      const bars = hero.querySelectorAll(".hero__bar");
      const btn = hero.querySelector("[data-vz-pause]");
      if (slides.length < 2) return;
      const delay = (parseInt(hero.dataset.interval, 10) || 5) * 1000;
      hero.style.setProperty("--vz-slide", `${delay}ms`);
      let i = 0;
      let paused = reduceMotion;
      const show = (n) => {
        i = (n + slides.length) % slides.length;
        [slides, caps, bars].forEach((list) => list.forEach((el, k) => el.classList.toggle("is-on", k === i)));
        bars.forEach((el, k) => el.classList.toggle("is-done", k < i));
      };
      const start = () => { hero._vzTimer = setInterval(() => show(i + 1), delay); };
      const setPaused = (p) => {
        paused = p;
        hero.classList.toggle("is-paused", p);
        if (btn) {
          btn.setAttribute("aria-pressed", String(p));
          const label = btn.querySelector(".sr-only");
          label.textContent = p ? label.dataset.labelPlay : label.dataset.labelPause;
        }
        clearInterval(hero._vzTimer);
        if (!p) start();
      };
      if (btn) btn.addEventListener("click", () => setPaused(!paused));
      // Éditeur : un bloc sélectionné s'affiche
      hero.addEventListener("shopify:block:select", (e) => {
        const k = Array.prototype.indexOf.call(slides, e.target);
        if (k >= 0) { setPaused(true); show(k); }
      });
      setPaused(paused);
    });
  };

  const init = (root) => { initReveal(root); initOrder(root); initSlides(root); };
  init(document);
  // Éditeur de thème : une section rechargée doit être réinitialisée
  document.addEventListener("shopify:section:load", (e) => init(e.target));
})();

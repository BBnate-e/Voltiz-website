/* =====================================================================
   VOLTIZ ENERGY GUM : scripts de la page
   1. Apparitions au scroll   2. En-tête   3. BOOOOST   4. Commande
   ===================================================================== */

/* ---------------------------------------------------------------------
   RÉGLAGES DE LA COMMANDE
   ORDER_ENDPOINT : colle ici le lien de ton formulaire Formspree
   (gratuit, https://formspree.io), par exemple "https://formspree.io/f/abcdwxyz".
   Tant qu'il est vide, le formulaire n'envoie rien et le dit au visiteur.
   --------------------------------------------------------------------- */
const ORDER_ENDPOINT = "";
const PRICE_CHF = 5;     // prix d'un strip
const QTY_MAX = 20;      // strips maximum par commande

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Apparitions au scroll (une seule fois) ---------- */
  const revealEls = document.querySelectorAll("[data-reveal], .sep");
  // Petit décalage entre les éléments d'un même groupe
  document.querySelectorAll(".bento, .specs, .flavors").forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--d", `${i * 80}ms`));
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    // threshold 0 : même un bloc très haut (formulaire, zoom à 400 %) apparaît dès qu'il entre à l'écran
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
    revealEls.forEach((el) => io.observe(el));
    // Sécurité : un élément atteint au clavier s'affiche tout de suite
    document.addEventListener("focusin", (e) => {
      const el = e.target.closest && e.target.closest("[data-reveal]");
      if (el) el.classList.add("is-in");
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- 2. En-tête : fond plus clair une fois la page défilée ---------- */
  const header = document.querySelector(".top");
  const sentinel = document.querySelector(".top-sentinel");
  if (header && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-stuck", !entry.isIntersecting);
    }).observe(sentinel);
  }

  /* ---------- 3. BOOOOST : largeur d'un « O » pour l'animation ---------- */
  const word = document.querySelector(".boost__row--2 .boost__w");
  const measureO = () => {
    const o = word && word.querySelector(".o");
    // offsetWidth ignore le zoom de départ (scale) : on mesure la vraie largeur d'un O
    if (o) word.style.setProperty("--ow", `${o.offsetWidth}px`);
  };
  if (word) {
    measureO();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureO);
    window.addEventListener("resize", measureO, { passive: true });
  }

  /* ---------- 4. Commande ---------- */
  const form = document.getElementById("order-form");
  if (!form) return;

  const qty = form.querySelector("#qty");
  const minus = form.querySelector('[data-step="-1"]');
  const plus = form.querySelector('[data-step="1"]');
  const totals = [form.querySelector("#total"), form.querySelector("#total-2")];
  const statusBox = form.querySelector("#order-status");
  const submitBtn = form.querySelector("#order-submit");

  // Le message « commandes pas encore ouvertes » disparaît dès qu'un lien Formspree est collé
  const closedNote = document.getElementById("order-closed");
  if (ORDER_ENDPOINT && closedNote) closedNote.hidden = true;
  // Le bouton est désactivé dans le HTML (sans JavaScript, rien ne doit partir)
  submitBtn.disabled = false;

  const clampQty = (n) => Math.min(QTY_MAX, Math.max(1, Number.isFinite(n) ? Math.round(n) : 1));
  const formatCHF = (n) => `${n}\u00A0CHF`;
  const strips = (n) => `${n}\u00A0strip${n > 1 ? "s" : ""}`;

  const updateTotal = () => {
    const n = clampQty(parseInt(qty.value, 10));
    totals.forEach((el) => { if (el) el.textContent = formatCHF(n * PRICE_CHF); });
    minus.disabled = n <= 1;
    plus.disabled = n >= QTY_MAX;
    return n;
  };

  form.querySelectorAll(".qty__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      qty.value = clampQty(parseInt(qty.value, 10) + Number(btn.dataset.step));
      updateTotal();
    });
  });
  qty.addEventListener("input", updateTotal);
  qty.addEventListener("blur", () => { qty.value = clampQty(parseInt(qty.value, 10)); updateTotal(); });
  updateTotal();

  // Validation : message sous le champ, en clair
  const required = ["prenom", "nom", "email", "rue", "npa", "localite"].map((id) => form.querySelector(`#${id}`));
  const isValid = (input) => {
    const v = input.value.trim();
    if (!v) return false;
    if (input.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (input.id === "npa") return /^[1-9][0-9]{3}$/.test(v);
    return true;
  };
  // Le message d'erreur n'est relié au champ (aria-describedby) que lorsqu'il est affiché
  const helpIds = new Map(required.map((input) => [input, (input.getAttribute("aria-describedby") || "").split(" ").filter((id) => id && !id.endsWith("-err"))]));
  const showError = (input, show) => {
    const err = form.querySelector(`#${input.id}-err`);
    input.setAttribute("aria-invalid", show ? "true" : "false");
    if (err) err.hidden = !show;
    const ids = [...helpIds.get(input), ...(show && err ? [err.id] : [])];
    if (ids.length) input.setAttribute("aria-describedby", ids.join(" "));
    else input.removeAttribute("aria-describedby");
  };
  required.forEach((input) => {
    showError(input, false);
    input.removeAttribute("aria-invalid");
    input.addEventListener("blur", () => { if (input.value.trim()) showError(input, !isValid(input)); });
    input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true" && isValid(input)) showError(input, false); });
  });

  const showStatus = (title, text, isError) => {
    statusBox.innerHTML = "";
    const h = document.createElement("h3");
    h.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    statusBox.append(h, p);
    statusBox.classList.toggle("is-error", Boolean(isError));
    statusBox.hidden = false;
    statusBox.focus({ preventScroll: true });
    statusBox.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusBox.hidden = true;

    let firstInvalid = null;
    required.forEach((input) => {
      const ok = isValid(input);
      showError(input, !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    const n = updateTotal();
    const data = Object.fromEntries(new FormData(form).entries());
    data.quantite = n;
    data.total = formatCHF(n * PRICE_CHF);
    data._subject = `Commande Voltiz : ${strips(n)}, ${data.saveur}`;

    // Pas encore de lien Formspree : on le dit, rien n'est envoyé
    if (!ORDER_ENDPOINT) {
      showStatus(
        "Pas encore ouvert.",
        "Les commandes ne sont pas encore ouvertes\u00A0: rien n’a été envoyé. Reviens bientôt.",
        false
      );
      return;
    }

    submitBtn.setAttribute("aria-busy", "true");
    submitBtn.disabled = true;
    const label = submitBtn.textContent;
    submitBtn.textContent = "Envoi en cours…";
    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      updateTotal();
      showStatus(
        `Merci, ${data.prenom}.`,
        `Commande reçue\u00A0: ${strips(n)}, saveur ${data.saveur}, total ${data.total}. On t’envoie la confirmation et la facture par e-mail.`,
        false
      );
    } catch (e) {
      showStatus(
        "L’envoi n’a pas marché.",
        "Ta commande n’est pas partie. Vérifie ta connexion et réessaie dans un moment.",
        true
      );
    } finally {
      submitBtn.removeAttribute("aria-busy");
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
})();

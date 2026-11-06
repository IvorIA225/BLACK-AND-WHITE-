import { mountHero3D } from "./scene3d.js";

// 1. Mount unmodified ScrollCraft runtime
const sc = window.ScrollCraft.mount(document.body);

// 2. Mount 3D Sculptural Centerpiece in Chapitre I
const hero3DEl = document.getElementById("bw-hero-3d");
mountHero3D(hero3DEl);

// Additive fine-pointer parallax for Chapitre I planes (never captures/locks pointer)
const heroAct = document.getElementById("seuil");
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroAct && canHover && !reduceMotion) {
  let tx = 0, ty = 0, cx = 0, cy = 0, rafPtr = 0;
  const stepPtr = () => {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    heroAct.style.setProperty("--bw-px", cx.toFixed(3));
    heroAct.style.setProperty("--bw-py", cy.toFixed(3));
    if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) {
      rafPtr = requestAnimationFrame(stepPtr);
    } else {
      rafPtr = 0;
    }
  };
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      if (window.scrollY > window.innerHeight * 2.4) return;
      tx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
      ty = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
      if (!rafPtr) rafPtr = requestAnimationFrame(stepPtr);
    },
    { passive: true }
  );
}

// 3. Bespoke Signature Move: La Jauge de Pierre Vive + Carnet de Table N° 1986
const SEAR_PRESETS = {
  bleue: {
    temp: 225,
    heat: 0.56,
    label: "Saisie bleue",
    note: "Aller-retour vif sur le basalte chaud : croûte fine au beurre persillé, intérieur rouge et juteux.",
  },
  apoint: {
    temp: 265,
    heat: 0.78,
    label: "À point",
    note: "La tranche grésille doucement devant vous avec le romarin frais et garde tout son fondant.",
  },
  doree: {
    temp: 300,
    heat: 1.0,
    label: "Bien dorée",
    note: "Pierre au maximum de sa chauffe : sucs caramélisés au gros sel et parfum franc de grillade.",
  },
};

const state = {
  searKey: null, // null = driven organically by scroll; set when visitor chooses a sear
  dishes: new Set(["La Pierrade sur pierre chaude"]),
  cadre: "Sous le grand apatam arboré",
  service: "Dîner (18h00 à 22h30)",
  couverts: "2 couverts",
};

const peakSection = document.getElementById("pierrade");
const tempEl = document.getElementById("bw-stone-temp");
const noteEl = document.getElementById("bw-stone-note");
const searBtns = [...document.querySelectorAll("[data-bw-sear]")];
const dishBtns = [...document.querySelectorAll("[data-bw-dish]")];
const stubCountEl = document.getElementById("bw-stub-count");
const picksListEl = document.getElementById("bw-picks-list");
const whatsappCta = document.getElementById("bw-whatsapp-cta");
const memoBtn = document.getElementById("bw-download-memo");

function updateThermalFromScroll() {
  if (!peakSection || !tempEl || !noteEl) return;
  if (state.searKey && SEAR_PRESETS[state.searKey]) {
    const preset = SEAR_PRESETS[state.searKey];
    peakSection.style.setProperty("--bw-heat", String(preset.heat));
    tempEl.textContent = `${preset.temp}°C`;
    noteEl.textContent = preset.note;
    return;
  }
  const p = parseFloat(peakSection.style.getPropertyValue("--sc-p") || "0") || 0;
  const clamped = Math.max(0, Math.min(1, p));
  const deg = Math.round(95 + clamped * 205);
  const heat = (0.18 + clamped * 0.82).toFixed(3);
  peakSection.style.setProperty("--bw-heat", heat);
  tempEl.textContent = `${deg}°C`;

  if (deg < 175) {
    noteEl.textContent = "La pierre volcanique arrive du four sur son plateau de bois. Le beurre aux herbes commence à fondre.";
  } else if (deg < 250) {
    noteEl.textContent = "À 225°C, la viande saisit aussitôt au contact du basalte noir sans perdre son jus.";
  } else {
    noteEl.textContent = "À 300°C, la croûte caramélise au gros sel devant vous. Cliquez un repère pour fixer votre cuisson.";
  }
}

searBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-bw-sear");
    state.searKey = state.searKey === key ? null : key;
    searBtns.forEach((b) => {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-bw-sear") === state.searKey));
    });
    // Ensure La Pierrade reflects the chosen sear in the Carnet
    for (const item of [...state.dishes]) {
      if (item.startsWith("La Pierrade")) state.dishes.delete(item);
    }
    if (state.searKey && SEAR_PRESETS[state.searKey]) {
      state.dishes.add(`La Pierrade (${SEAR_PRESETS[state.searKey].label.toLowerCase()})`);
    } else {
      state.dishes.add("La Pierrade sur pierre chaude");
    }
    updateThermalFromScroll();
    syncCarnetUI();
  });
});

function hasDishFamily(prefix) {
  for (const d of state.dishes) {
    if (d === prefix || d.startsWith(prefix)) return true;
  }
  return false;
}

function toggleDish(dishName) {
  if (dishName.startsWith("La Pierrade")) {
    const active = hasDishFamily("La Pierrade");
    for (const d of [...state.dishes]) {
      if (d.startsWith("La Pierrade")) state.dishes.delete(d);
    }
    if (!active) {
      const suffix = state.searKey ? ` (${SEAR_PRESETS[state.searKey].label.toLowerCase()})` : " sur pierre chaude";
      state.dishes.add(`La Pierrade${suffix}`);
    }
  } else if (state.dishes.has(dishName)) {
    state.dishes.delete(dishName);
  } else {
    state.dishes.add(dishName);
  }
  syncCarnetUI();
}

dishBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const name = btn.getAttribute("data-bw-dish");
    if (name) toggleDish(name);
  });
});

// Radio-like ticket option groups (Cadre, Service, Couverts)
document.querySelectorAll("[data-bw-group]").forEach((groupEl) => {
  const key = groupEl.getAttribute("data-bw-group");
  const buttons = [...groupEl.querySelectorAll("[data-bw-val]")];
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-bw-val");
      if (!key || !val) return;
      state[key] = val;
      buttons.forEach((b) => b.setAttribute("aria-checked", String(b === btn)));
      syncCarnetUI();
    });
  });
});

function buildReservationLines() {
  const dishesArr = [...state.dishes];
  const lines = [
    "Bonjour Le Black and White,",
    "Je souhaite réserver une table à Bouaké (Quartier Nimbo) :",
    `• Nombre : ${state.couverts}`,
    `• Moment : ${state.service}`,
    `• Cadre préféré : ${state.cadre}`,
  ];
  if (dishesArr.length > 0) {
    lines.push(`• Envies notées sur la carte : ${dishesArr.join(", ")}`);
  }
  lines.push("Merci de me confirmer la disponibilité.");
  return lines;
}

function syncCarnetUI() {
  const count = state.dishes.size;
  if (stubCountEl) stubCountEl.textContent = String(count);

  dishBtns.forEach((btn) => {
    const name = btn.getAttribute("data-bw-dish") || "";
    const active = name.startsWith("La Pierrade") ? hasDishFamily("La Pierrade") : state.dishes.has(name);
    btn.setAttribute("aria-pressed", String(active));
    const statusSpan = btn.querySelector("[data-bw-stamp-label]");
    if (statusSpan) {
      statusSpan.textContent = active ? "Tamponné au carnet ✓" : "Noter sur mon carnet +";
    }
  });

  if (picksListEl) {
    picksListEl.textContent = "";
    if (count === 0) {
      const emptyLi = document.createElement("li");
      emptyLi.className = "bw-pick-tag";
      emptyLi.textContent = "Aucune assiette cochée (choix sur place)";
      picksListEl.appendChild(emptyLi);
    } else {
      for (const item of state.dishes) {
        const li = document.createElement("li");
        li.className = "bw-pick-tag";
        const span = document.createElement("span");
        span.textContent = item;
        const rm = document.createElement("button");
        rm.type = "button";
        rm.setAttribute("aria-label", `Retirer ${item} du carnet`);
        rm.textContent = "×";
        rm.addEventListener("click", () => {
          state.dishes.delete(item);
          syncCarnetUI();
        });
        li.append(span, rm);
        picksListEl.appendChild(li);
      }
    }
  }

  if (whatsappCta) {
    const msg = buildReservationLines().join("\n");
    whatsappCta.href = `https://wa.me/2250505926080?text=${encodeURIComponent(msg)}`;
  }
}

if (memoBtn) {
  memoBtn.addEventListener("click", () => {
    const memo = [
      "LE BLACK AND WHITE · BOUAKÉ (DEPUIS 1986)",
      "Carnet de Table N° 1986",
      "==========================================",
      `Cadre retenu   : ${state.cadre}`,
      `Service        : ${state.service}`,
      `Table          : ${state.couverts}`,
      `Envies notées  : ${state.dishes.size ? [...state.dishes].join(", ") : "À choisir sur place"}`,
      "",
      "Adresse  : Avenue Jacques Aka, Quartier Nimbo (près de la BCEAO), Bouaké",
      "Horaires : Mardi au dimanche, 11h00 à 15h00 et 18h00 à 22h30 (fermé le lundi)",
      "WhatsApp : +225 05 05 92 60 80",
      "Google Maps : https://www.google.com/maps/place/Black+and+White/@7.6779243,-5.0255009,17z",
    ].join("\r\n");

    const blob = new Blob([memo], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "carnet-table-black-and-white-bouake.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  });
}

// 4. Folio active chapter & automatic Noir/Paper theme switch
const folioEl = document.querySelector(".bw-folio");
const chapters = [...document.querySelectorAll("main > section[id]")];
const folioLinks = [...document.querySelectorAll(".bw-folio__link")];

function updateFolioOnScroll() {
  const midY = window.innerHeight * 0.45;
  let activeChapter = chapters[0];
  for (const ch of chapters) {
    const r = ch.getBoundingClientRect();
    if (r.top <= midY && r.bottom >= midY) {
      activeChapter = ch;
      break;
    }
  }
  if (activeChapter) {
    const id = activeChapter.id;
    folioLinks.forEach((link) => {
      const match = link.getAttribute("href") === `#${id}`;
      if (match) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    if (folioEl) {
      const isPaper =
        activeChapter.classList.contains("bw-chapter--paper") ||
        activeChapter.classList.contains("bw-chapter--cream");
      folioEl.setAttribute("data-folio-theme", isPaper ? "paper" : "noir");
    }
    if (reduceMotion) {
      chapters.forEach((ch) => {
        const st = ch.querySelector("[data-sc-stage]");
        if (!st) return;
        const kind = ch.getAttribute("data-sc-act");
        if (ch === activeChapter && (kind === "pin" || kind === "scrub")) {
          st.setAttribute("data-sc-verify-state", `rm-${ch.id}`);
          st.setAttribute("data-sc-verify-hold", "true");
        } else {
          st.removeAttribute("data-sc-verify-state");
          st.removeAttribute("data-sc-verify-hold");
        }
      });
    }
  }
}

window.addEventListener(
  "scroll",
  () => {
    requestAnimationFrame(() => {
      updateThermalFromScroll();
      updateFolioOnScroll();
    });
  },
  { passive: true }
);

// 5. Keyboard Accessibility on Pinned Cues & Horizontal Pan Rail (verify.md & approved-collection.md §6)
function invertDwell(targetP, L) {
  if (!L) return targetP;
  // Binary search monotone dwell(raw, L) == targetP on [0, 1]
  let lo = 0, hi = 1;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) * 0.5;
    const c = mid - 0.5;
    const val = (1 - L) * mid + L * (4 * c * c * c + 0.5);
    if (val < targetP) lo = mid;
    else hi = mid;
  }
  return (lo + hi) * 0.5;
}

window.addEventListener("focusin", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const actEl = target.closest("[data-sc-act]");
  if (!actEl) return;
  const kind = actEl.getAttribute("data-sc-act");

  // Case A: Focus inside a pinned act cue that is currently faded
  if (kind === "pin" || kind === "scrub") {
    const cueEl = target.closest("[data-sc-cue]");
    if (!cueEl) return;
    const op = parseFloat(getComputedStyle(cueEl).opacity || "1");
    if (op >= 0.9) return;
    const parts = (cueEl.getAttribute("data-sc-cue") || "0 1").trim().split(/\s+/).map(parseFloat);
    const from = isNaN(parts[0]) ? 0 : parts[0];
    const to = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 1;
    const midP = (from + to) * 0.5;
    const L = parseFloat(actEl.getAttribute("data-sc-dwell") || "0") || 0;
    const raw = invertDwell(midP, L);
    const actTop = actEl.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(actEl.offsetHeight - window.innerHeight, 1);
    window.scrollTo({ top: Math.round(actTop + raw * travel), behavior: "instant" });
    sc.read();
    updateThermalFromScroll();
  }

  // Case B: Focus inside Horizontal Pan Rail -> scroll page so card enters viewport horizontally
  if (kind === "pan" && !reduceMotion) {
    const railEl = actEl.querySelector("[data-sc-pan]");
    const cardEl = target.closest(".bw-dish, .bw-rail__lead, .bw-rail__tail");
    if (!railEl || !cardEl) return;
    const rect = cardEl.getBoundingClientRect();
    const minLeft = parseFloat(getComputedStyle(document.querySelector(".bw-main") || document.body).paddingLeft) || 0;
    if (rect.left >= minLeft + 16 && rect.right <= window.innerWidth - 16) return;

    const over = railEl.scrollWidth - window.innerWidth;
    if (over <= 0) return;
    const extra = over * (parseFloat(railEl.getAttribute("data-sc-pan") || "0") || 0);
    const desiredShift = Math.max(0, Math.min(over + extra, cardEl.offsetLeft - (minLeft + 64)));
    const p = desiredShift / (over + extra);
    const actTop = actEl.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(actEl.offsetHeight - window.innerHeight, 1);
    window.scrollTo({ top: Math.round(actTop + p * travel), behavior: "instant" });
    sc.read();
  }
});

syncCarnetUI();
updateThermalFromScroll();
updateFolioOnScroll();

/*
 * Persistência local (LocalStorage).
 * Toda a leitura/escrita passa por aqui — no futuro, basta trocar
 * esta camada por uma API/banco de dados sem mexer no resto do app.
 */
(function () {
  const KEY = "sereia-esposa-trofeu:v1";

  function blank() {
    return {
      version: 1,
      profile: { name: "" },
      checked: {},            // { [objectiveId]: ISO date de conclusão }
      finance: {},            // { [fieldId]: number }
      reserveGoal: window.CHALLENGE.defaultReserveGoal,
      financeHistory: [],     // [{ id, date, values }]
      diary: [],              // [{ id, date, phase, events, achievements, difficulties, notes, createdAt, updatedAt }]
      completedPhases: {}     // { [phaseId]: ISO } — para celebrar só uma vez
    };
  }

  let available = true;
  try {
    const t = "__sereia_test__";
    localStorage.setItem(t, t);
    localStorage.removeItem(t);
  } catch (e) {
    available = false;
  }

  function normalize(raw) {
    const base = blank();
    if (!raw || typeof raw !== "object") return base;
    return {
      ...base,
      ...raw,
      profile: { ...base.profile, ...(raw.profile || {}) },
      checked: raw.checked && typeof raw.checked === "object" ? raw.checked : {},
      finance: raw.finance && typeof raw.finance === "object" ? raw.finance : {},
      financeHistory: Array.isArray(raw.financeHistory) ? raw.financeHistory : [],
      diary: Array.isArray(raw.diary) ? raw.diary : [],
      completedPhases: raw.completedPhases && typeof raw.completedPhases === "object" ? raw.completedPhases : {}
    };
  }

  window.Store = {
    KEY,
    available,
    blank,
    normalize,
    load() {
      if (!available) return blank();
      try {
        return normalize(JSON.parse(localStorage.getItem(KEY)));
      } catch (e) {
        return blank();
      }
    },
    save(state) {
      if (!available) return false;
      try {
        localStorage.setItem(KEY, JSON.stringify({ ...state, savedAt: new Date().toISOString() }));
        return true;
      } catch (e) {
        return false;
      }
    }
  };
})();

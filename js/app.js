/* ============================================================
   A Sereia Esposa-Troféu — aplicação
   ============================================================ */
(function () {
  "use strict";

  const C = window.CHALLENGE;
  const PHASES = C.phases;
  let state = Store.load();

  /* ---------- utilidades ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const fmtNum = (n) => Math.round(num(n)).toLocaleString("pt-BR");
  const money = (n) => "§ " + fmtNum(n);
  const moneyShort = (n) => {
    n = num(n);
    if (Math.abs(n) >= 1e6) return "§ " + (n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
    if (Math.abs(n) >= 1e4) return "§ " + (n / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil";
    return money(n);
  };
  const todayISO = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const fmtDate = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.slice(0, 10).split("-");
    return d + "/" + m + "/" + y;
  };
  const fmtDateShort = (iso) => fmtDate(iso).slice(0, 5);
  const fmtDateLong = (iso) => {
    if (!iso) return "";
    const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  };

  function save() {
    if (!Store.save(state) && !save.warned) {
      save.warned = true;
      toast({ title: "Não foi possível salvar", text: "O navegador bloqueou o armazenamento local. Use “Exportar” para guardar um backup.", type: "warn", icon: "info" });
    }
  }

  /* ---------- progresso ---------- */
  function phaseStats(phase) {
    const total = phase.objectives.length;
    const done = phase.objectives.filter((o) => state.checked[o.id]).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0, complete: total > 0 && done === total };
  }
  function isUnlocked(i) {
    for (let k = 0; k < i; k++) if (!phaseStats(PHASES[k]).complete) return false;
    return true;
  }
  function currentPhaseIndex() {
    const i = PHASES.findIndex((p) => !phaseStats(p).complete);
    return i === -1 ? PHASES.length : i;
  }
  function overall() {
    let done = 0, total = 0;
    PHASES.forEach((p) => {
      const s = phaseStats(p);
      done += s.done;
      total += s.total;
    });
    return { done, total, remaining: total - done, pct: total ? Math.round((done / total) * 100) : 0 };
  }
  // Critérios de conclusão (calculados a partir dos objetivos e do patrimônio)
  function criteriaStatus() {
    return (C.criteria || []).map((c) => {
      let done = false, detail = "";
      if (c.objectives) done = c.objectives.every((id) => state.checked[id]);
      if (c.wealth) {
        const t = finTotals();
        const best = Math.max(t.family, t.own + t.spouse);
        done = best >= c.wealth;
        detail = money(best) + " de " + money(c.wealth);
      }
      return { ...c, done, detail };
    });
  }
  function criteriaCard() {
    const list = criteriaStatus();
    if (!list.length) return "";
    const req = list.filter((c) => !c.optional);
    const ok = req.filter((c) => c.done).length;
    return (
      '<section class="card criteria">' +
      '<div class="criteria__head"><div class="criteria__trophy">' + icon("trophy") + "</div><div>" +
      '<h2 class="card__title" style="margin:0">Critérios para concluir o desafio</h2>' +
      '<p class="tiny" style="margin:2px 0 0">Atualizados automaticamente pelos objetivos e pelo Patrimônio · ' + ok + " de " + req.length + " obrigatórios</p></div></div>" +
      '<ul class="criteria__list">' +
      list.map((c) =>
        '<li class="' + (c.done ? "is-done" : "") + '"><span class="criteria__box">' + icon("check") + "</span><span>" + esc(c.text) +
        (c.optional ? ' <span class="chip chip--optional">opcional</span>' : "") +
        (c.detail ? '<small class="tiny" style="display:block">' + c.detail + "</small>" : "") + "</span></li>"
      ).join("") +
      "</ul></section>"
    );
  }

  function phaseStatus(i) {
    const s = phaseStats(PHASES[i]);
    if (s.complete) return "done";
    if (!isUnlocked(i)) return "locked";
    return "active";
  }
  const statusChip = (st) =>
    st === "done"
      ? '<span class="chip chip--done">' + icon("check") + "Concluída</span>"
      : st === "locked"
      ? '<span class="chip chip--locked">' + icon("lock") + "Bloqueada</span>"
      : '<span class="chip chip--active">' + icon("wave") + "Em andamento</span>";

  /* ---------- componentes ---------- */
  const bar = (key, pct, cls) =>
    '<div class="bar ' + (cls || "") + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
    '<div class="bar__fill" data-anim="' + key + '" data-to="' + pct + '"></div></div>';

  function ring(key, pct, size, stroke, color, label, sub) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const gid = "rg-" + key;
    return (
      '<div class="ring" style="width:' + size + "px;height:" + size + 'px;font-size:' + size / 6 + 'px">' +
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + (color || "#3fd0c9") + '"/><stop offset="1" stop-color="' + (color ? "#ffffff" : "#ff8fb8") + '" stop-opacity="' + (color ? ".85" : "1") + '"/></linearGradient></defs>' +
      '<circle class="ring__track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '"/>' +
      '<circle class="ring__fill" data-ring="' + key + '" data-to="' + pct + '" data-c="' + c + '" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="url(#' + gid + ')" stroke-width="' + stroke + '" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '"/>' +
      "</svg>" +
      '<div class="ring__label"><strong>' + (label != null ? label : pct + "%") + "</strong>" + (sub ? "<span>" + sub + "</span>" : "") + "</div></div>"
    );
  }

  // Anima barras e anéis do valor anterior para o novo
  const prevAnim = {};
  function animate(root) {
    $$("[data-anim]", root).forEach((el) => {
      const k = el.dataset.anim, to = num(el.dataset.to), from = prevAnim[k] != null ? prevAnim[k] : 0;
      el.style.width = from + "%";
      el.getBoundingClientRect();
      requestAnimationFrame(() => (el.style.width = to + "%"));
      prevAnim[k] = to;
    });
    $$("[data-ring]", root).forEach((el) => {
      const k = "ring:" + el.dataset.ring, to = num(el.dataset.to), c = num(el.dataset.c);
      const from = prevAnim[k] != null ? prevAnim[k] : 0;
      el.style.strokeDashoffset = c * (1 - from / 100);
      el.getBoundingClientRect();
      requestAnimationFrame(() => (el.style.strokeDashoffset = c * (1 - to / 100)));
      prevAnim[k] = to;
    });
  }

  /* ---------- toasts ---------- */
  function toast({ title, text, type, icon: ic, action, duration }) {
    const box = $("#toasts");
    const el = document.createElement("div");
    el.className = "toast" + (type ? " toast--" + type : "");
    el.innerHTML =
      '<div class="toast__icon">' + icon(ic || "check") + "</div><div><strong>" + esc(title) + "</strong>" +
      (text ? "<span>" + esc(text) + "</span>" : "") +
      (action ? '<br><button class="link-btn" type="button">' + esc(action.label) + "</button>" : "") +
      "</div>";
    const close = () => {
      if (!el.isConnected) return;
      el.classList.add("out");
      setTimeout(() => el.remove(), 350);
    };
    if (action) $(".link-btn", el).addEventListener("click", () => { action.run(); close(); });
    el.addEventListener("dblclick", close);
    box.appendChild(el);
    while (box.children.length > 4) box.firstElementChild.remove();
    setTimeout(close, duration || 4200);
  }

  /* ---------- modais ---------- */
  const openModals = new Set();
  function openModal(html, { celebrate, color } = {}) {
    const root = $("#modalRoot");
    const back = document.createElement("div");
    back.className = "modal-backdrop";
    back.innerHTML = '<div class="modal' + (celebrate ? " modal--celebrate" : "") + '" role="dialog" aria-modal="true"' + (color ? ' style="--c:' + color + '"' : "") + ">" + html + "</div>";
    const prevFocus = document.activeElement;
    const close = () => {
      openModals.delete(close);
      back.remove();
      document.removeEventListener("keydown", onKey);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    back.addEventListener("click", (e) => { if (e.target === back) close(); });
    document.addEventListener("keydown", onKey);
    root.appendChild(back);
    openModals.add(close);
    const f = $(".modal [data-autofocus]", back) || $(".modal button", back);
    if (f) f.focus();
    return { el: back, close };
  }

  function confirmModal({ title, text, confirm = "Confirmar", danger }) {
    return new Promise((resolve) => {
      const m = openModal(
        "<h2>" + esc(title) + "</h2><p>" + esc(text) + "</p>" +
        '<div class="modal__actions"><button class="btn btn--ghost" data-no data-autofocus>Cancelar</button>' +
        '<button class="btn ' + (danger ? "btn--danger" : "") + '" data-yes>' + esc(confirm) + "</button></div>"
      );
      let answered = false;
      const done = (v) => { if (!answered) { answered = true; m.close(); resolve(v); } };
      $("[data-no]", m.el).onclick = () => done(false);
      $("[data-yes]", m.el).onclick = () => done(true);
      const obs = new MutationObserver(() => { if (!m.el.isConnected) { obs.disconnect(); if (!answered) resolve(false); } });
      obs.observe($("#modalRoot"), { childList: true });
    });
  }

  function confetti(colors) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div");
    box.className = "confetti";
    const palette = colors || ["#3fd0c9", "#9b8cff", "#ff8fb8", "#f2c46d", "#ffffff", "#8ff0dd"];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement("i");
      const s = 6 + Math.random() * 10;
      if (Math.random() < 0.35) p.className = "star";
      const col = palette[i % palette.length];
      p.style.cssText =
        "left:" + Math.random() * 100 + "%;width:" + s + "px;height:" + s + "px;" +
        "background:radial-gradient(circle at 35% 30%,#fff," + col + " 65%);" +
        "animation-duration:" + (2.4 + Math.random() * 2.2) + "s;animation-delay:" + Math.random() * 0.6 + "s;" +
        "--dx:" + (Math.random() * 160 - 80) + "px;--rot:" + Math.random() * 720 + "deg";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 5200);
  }

  function openArt() {
    const m = openModal(
      '<button class="icon-btn lightbox__close" data-close aria-label="Fechar">' + icon("close") + "</button>" +
      '<img src="' + C.officialArt + '" alt="Arte oficial do desafio A Sereia Esposa-Troféu, com as quatro fases, regras gerais e critérios de conclusão">'
    );
    m.el.classList.add("lightbox");
    $("[data-close]", m.el).addEventListener("click", m.close);
  }

  // Se uma imagem não carregar, volta para a ilustração em SVG
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t.tagName !== "IMG") return;
    if (t.hasAttribute("data-fallback-art")) t.closest(".portrait").outerHTML = $("#tpl-mermaid").innerHTML;
    else if (t.closest(".phase-card__img")) t.closest(".phase-card__img").remove();
    else if (t.classList.contains("phase-hero__bg")) t.remove();
  }, true);

  function celebratePhase(i) {
    const p = PHASES[i];
    const next = PHASES[i + 1];
    confetti();
    if (!next) {
      const name = state.profile.name || "Sua sereia";
      const m = openModal(
        '<div class="celebrate__icon">' + icon("crown") + "</div>" +
        "<span class=\"eyebrow\">Desafio concluído</span><h2>Uma lenda do oceano!</h2>" +
        "<p>" + esc(name) + " saiu do fundo do mar e chegou ao topo da sociedade — sem perder a cauda nem o próprio tesouro. Que tal registrar esse momento no Diário?</p>" +
        '<div class="modal__actions"><button class="btn btn--ghost" data-close>Fechar</button><a class="btn btn--gold" href="#diario" data-close>' + icon("book") + "Registrar no Diário</a></div>",
        { celebrate: true, color: "#f2c46d" }
      );
      $$("[data-close]", m.el).forEach((b) => b.addEventListener("click", m.close));
      setTimeout(() => confetti(["#f2c46d", "#ffe7a3", "#ffffff"]), 900);
      return;
    }
    const m = openModal(
      '<div class="celebrate__icon">' + icon(p.icon) + "</div>" +
      '<span class="eyebrow">Fase ' + p.number + " concluída</span><h2>" + esc(p.title) + "</h2>" +
      "<p>Todos os objetivos foram cumpridos. A próxima etapa da jornada foi desbloqueada: <strong>Fase " + next.number + " — " + esc(next.title) + "</strong>.</p>" +
      '<div class="modal__actions"><button class="btn btn--ghost" data-close>Continuar aqui</button><a class="btn" href="#' + next.id + '" data-close>' + icon("unlock") + "Ir para a Fase " + next.number + "</a></div>",
      { celebrate: true, color: p.color }
    );
    $$("[data-close]", m.el).forEach((b) => b.addEventListener("click", m.close));
  }

  /* ---------- checklist ---------- */
  function setObjective(id, value, opts = {}) {
    const pi = PHASES.findIndex((p) => p.objectives.some((o) => o.id === id));
    if (pi < 0) return;
    if (!isUnlocked(pi)) {
      toast({ title: "Fase bloqueada", text: "Conclua a Fase " + pi + " para liberar estes objetivos.", type: "warn", icon: "lock" });
      return render();
    }
    const phase = PHASES[pi];
    const obj = phase.objectives.find((o) => o.id === id);
    const wasComplete = phaseStats(phase).complete;
    const prevDate = state.checked[id];

    if (value) state.checked[id] = new Date().toISOString();
    else delete state.checked[id];

    const nowComplete = phaseStats(phase).complete;
    if (nowComplete && !wasComplete) state.completedPhases[phase.id] = new Date().toISOString();
    if (!nowComplete) delete state.completedPhases[phase.id];
    save();
    render({ pop: value ? id : null });

    if (opts.silent) return;
    if (value) {
      if (nowComplete && !wasComplete) celebratePhase(pi);
      else
        toast({
          title: "Objetivo concluído!",
          text: obj.text,
          icon: "star",
          action: { label: "Desfazer", run: () => setObjective(id, false, { silent: true }) }
        });
    } else {
      const laterProgress = PHASES.slice(pi + 1).some((p) => phaseStats(p).done > 0);
      toast({
        title: "Objetivo desmarcado",
        text: wasComplete && laterProgress ? "As fases seguintes voltaram a ficar bloqueadas (as marcações delas foram mantidas)." : obj.text,
        type: wasComplete && laterProgress ? "warn" : null,
        icon: "undo",
        action: { label: "Desfazer", run: () => { state.checked[id] = prevDate || new Date().toISOString(); if (phaseStats(phase).complete) state.completedPhases[phase.id] = state.completedPhases[phase.id] || new Date().toISOString(); save(); render(); } }
      });
    }
  }

  async function clearPhase(pi) {
    const p = PHASES[pi];
    if (!phaseStats(p).done) return toast({ title: "Nada para desmarcar", text: "Nenhum objetivo desta fase está marcado.", icon: "info" });
    const ok = await confirmModal({
      title: "Desmarcar a Fase " + p.number + "?",
      text: "Todos os objetivos de “" + p.title + "” voltarão a ficar pendentes. As demais fases não serão apagadas.",
      confirm: "Desmarcar todos",
      danger: true
    });
    if (!ok) return;
    const backup = {};
    p.objectives.forEach((o) => { if (state.checked[o.id]) backup[o.id] = state.checked[o.id]; delete state.checked[o.id]; });
    const backupDone = state.completedPhases[p.id];
    delete state.completedPhases[p.id];
    save();
    render();
    toast({
      title: "Fase " + p.number + " desmarcada",
      icon: "undo",
      action: { label: "Desfazer", run: () => { Object.assign(state.checked, backup); if (backupDone) state.completedPhases[p.id] = backupDone; save(); render(); } },
      duration: 7000
    });
  }

  /* ---------- reiniciar / backup ---------- */
  function resetFlow() {
    const m = openModal(
      "<h2>Reiniciar o desafio?</h2>" +
      "<p>Escolha o que apagar. Essa ação não pode ser desfeita — se quiser, exporte um backup antes.</p>" +
      '<div class="check-list">' +
      '<label class="check-row"><input type="checkbox" data-r="checked" checked> Objetivos marcados de todas as fases</label>' +
      '<label class="check-row"><input type="checkbox" data-r="finance" checked> Patrimônio da Sereia (valores e histórico)</label>' +
      '<label class="check-row"><input type="checkbox" data-r="diary" checked> Diário da Sereia</label>' +
      '<label class="check-row"><input type="checkbox" data-r="profile"> Nome da sereia</label>' +
      "</div>" +
      '<div class="modal__actions"><button class="btn btn--ghost btn--sm" data-export>' + icon("download") + "Exportar backup</button>" +
      '<span style="flex:1"></span><button class="btn btn--ghost" data-no data-autofocus>Cancelar</button><button class="btn btn--danger" data-yes>' + icon("reset") + "Apagar e reiniciar</button></div>"
    );
    $("[data-export]", m.el).onclick = exportBackup;
    $("[data-no]", m.el).onclick = m.close;
    $("[data-yes]", m.el).onclick = () => {
      const pick = (k) => $('[data-r="' + k + '"]', m.el).checked;
      const fresh = Store.blank();
      if (pick("checked")) { state.checked = {}; state.completedPhases = {}; }
      if (pick("finance")) { state.finance = {}; state.financeHistory = []; state.reserveGoal = fresh.reserveGoal; }
      if (pick("diary")) state.diary = [];
      if (pick("profile")) state.profile = fresh.profile;
      save();
      m.close();
      for (const k in prevAnim) delete prevAnim[k];
      location.hash = "#inicio";
      render();
      toast({ title: "Desafio reiniciado", text: "Uma nova sereia acaba de chegar à praia.", icon: "wave" });
    };
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString(), app: "sereia-esposa-trofeu" }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sereia-backup-" + todayISO() + ".json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast({ title: "Backup exportado", text: a.download, icon: "download" });
  }

  function importBackup(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      let data;
      try {
        data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || !("checked" in data)) throw new Error("formato");
      } catch (e) {
        return toast({ title: "Arquivo inválido", text: "Escolha um backup exportado por este site.", type: "warn", icon: "info" });
      }
      const ok = await confirmModal({
        title: "Importar backup?",
        text: "O progresso atual será substituído pelo conteúdo do arquivo “" + file.name + "”.",
        confirm: "Importar"
      });
      if (!ok) return;
      delete data.exportedAt;
      delete data.app;
      state = Store.normalize(data);
      save();
      render();
      toast({ title: "Backup importado", text: "Seu progresso foi restaurado.", icon: "upload" });
    };
    reader.readAsText(file);
  }

  /* ============================================================
     VIEWS
     ============================================================ */
  const view = $("#view");

  /* ---------- Início ---------- */
  function finTotals(values) {
    const v = values || state.finance;
    return {
      family: num(v.familia) + num(v.residencia) + num(v.bens),
      own: num(v.sereia) + num(v.reserva),
      spouse: num(v.conjuge),
      reserve: num(v.reserva)
    };
  }

  function viewHome() {
    const o = overall();
    const ci = currentPhaseIndex();
    const cur = PHASES[ci];
    const t = finTotals();
    const goal = num(state.reserveGoal) || 1;
    const last = sortedDiary()[0];

    const stats = [
      { icon: cur ? cur.icon : "crown", c: cur ? cur.color : "#f2c46d", value: cur ? "Fase " + cur.number : "Lenda", label: cur ? cur.title : "Desafio concluído" },
      { icon: "check", c: "#3fd0c9", value: o.done, label: "Objetivos concluídos" },
      { icon: "target", c: "#9b8cff", value: o.remaining, label: "Objetivos restantes" },
      { icon: "sparkle", c: "#f2c46d", value: o.pct + "%", label: "Do desafio completo" }
    ];

    return (
      '<section class="card hero">' +
      "<div>" +
      '<span class="eyebrow">' + icon("tail") + "Desafio de The Sims 4</span>" +
      '<h1 class="hero__title">' + esc(C.title) + "</h1>" +
      '<p class="hero__subtitle">' + esc(C.subtitle) + "</p>" +
      '<p class="hero__intro">' + esc(C.intro) + "</p>" +
      '<div class="hero__actions">' +
      (cur
        ? '<a class="btn" href="#' + cur.id + '">' + icon("wave") + (o.done ? "Continuar na Fase " : "Começar pela Fase ") + cur.number + "</a>"
        : '<a class="btn btn--gold" href="#diario">' + icon("crown") + "Ver o Diário da lenda</a>") +
      '<label class="hero__name">' + icon("pearl") + 'Sereia:<input id="simName" maxlength="40" placeholder="Nome da sua Sim" value="' + esc(state.profile.name) + '"></label>' +
      "</div></div>" +
      '<div class="hero__art">' +
      (C.heroImage
        ? '<figure class="portrait"><img src="' + C.heroImage + '" alt="A sereia da arte oficial do desafio, com cabelos ruivos e cauda lilás, emergindo do mar" data-fallback-art></figure>'
        : $("#tpl-mermaid").innerHTML) +
      (C.officialArt ? '<button class="btn btn--ghost btn--sm art-btn" data-art>' + icon("sparkle") + "Ver arte oficial</button>" : "") +
      "</div>" +
      "</section>" +

      '<section class="stats">' +
      stats.map((s) =>
        '<div class="card stat" style="--c:' + s.c + '"><div class="stat__icon">' + icon(s.icon) + '</div><div><div class="stat__value">' + esc(s.value) + '</div><div class="stat__label">' + esc(s.label) + "</div></div></div>"
      ).join("") +
      "</section>" +

      '<section class="card overall">' +
      ring("overall-home", o.pct, 132, 12, null, o.pct + "%", "geral") +
      "<div>" +
      '<div class="overall__meta"><strong>Progresso da jornada</strong><span class="muted">' + o.done + " de " + o.total + " objetivos</span></div>" +
      bar("overall-home-bar", o.pct, "bar--lg") +
      '<div class="overall__meta" style="margin-top:14px;margin-bottom:0">' +
      PHASES.map((p, i) => '<span class="tiny" style="color:' + (phaseStatus(i) === "locked" ? "var(--text-3)" : p.color) + '">' + icon(phaseStatus(i) === "done" ? "check" : phaseStatus(i) === "locked" ? "lock" : p.icon) + " Fase " + p.number + " · " + phaseStats(p).pct + "%</span>").join("") +
      "</div></div></section>" +

      '<div class="section-title"><div><span class="eyebrow">' + icon("anchor") + "A jornada</span><h2>Do recife à mansão</h2></div></div>" +
      '<section class="journey">' +
      PHASES.map((p, i) => {
        const s = phaseStats(p), st = phaseStatus(i);
        return (
          '<a class="card phase-card is-' + st + '" href="#' + p.id + '" style="--c:' + p.color + '">' +
          (p.image ? '<div class="phase-card__img"><img src="' + p.image + '" alt="" loading="lazy"></div>' : "") +
          '<div class="phase-card__top"><span class="phase-card__badge">' + icon(st === "locked" ? "lock" : st === "done" ? "check" : p.icon) + "</span>" + statusChip(st) + "</div>" +
          '<span class="phase-card__num">Fase ' + p.number + "</span>" +
          "<h3>" + esc(p.title) + "</h3><p>" + esc(p.tagline) + "</p>" +
          bar("home-" + p.id, s.pct, "bar--sm") +
          '<div class="phase-card__foot"><span>' + s.done + "/" + s.total + " objetivos</span><span>" + s.pct + "%</span></div></a>"
        );
      }).join("") +
      "</section>" +

      '<div style="margin-top:18px">' + criteriaCard() + "</div>" +

      '<section class="home-grid">' +
      '<div class="card"><h2 class="card__title">' + icon("chest") + "Patrimônio da Sereia</h2>" +
      '<ul class="mini-list">' +
      "<li><span>Patrimônio da família</span><strong>" + money(t.family) + "</strong></li>" +
      "<li><span>Patrimônio próprio da sereia</span><strong>" + money(t.own) + "</strong></li>" +
      "<li><span>Patrimônio do cônjuge</span><strong>" + money(t.spouse) + "</strong></li>" +
      "</ul>" +
      '<div style="margin:16px 0 6px" class="overall__meta"><span class="tiny">Meta da reserva própria</span><span class="tiny">' + money(t.reserve) + " / " + money(goal) + "</span></div>" +
      bar("home-reserve", Math.min(100, Math.round((t.reserve / goal) * 100)), "bar--sm") +
      '<div style="margin-top:16px"><a class="btn btn--ghost btn--sm" href="#patrimonio">' + icon("coins") + "Atualizar valores</a></div></div>" +

      '<div class="card"><h2 class="card__title">' + icon("book") + "Último registro do Diário</h2>" +
      (last
        ? '<p class="tiny" style="margin:0 0 6px">' + fmtDateLong(last.date) + " · Fase " + esc(last.phase) + "</p>" +
          '<p class="story" style="font-size:1.15rem">' + esc(truncate(last.events || last.achievements || last.notes || last.difficulties, 220)) + "</p>"
        : '<div class="empty">' + icon("book") + "Nenhum registro ainda. Conte como foi a primeira jogatina!</div>") +
      '<div style="margin-top:16px"><a class="btn btn--ghost btn--sm" href="#diario">' + icon("edit") + (last ? "Abrir o Diário" : "Escrever no Diário") + "</a></div></div>" +
      "</section>"
    );
  }
  const truncate = (s, n) => (s && s.length > n ? s.slice(0, n).trim() + "…" : s || "");

  /* ---------- Fase ---------- */
  function viewPhase(pi) {
    const p = PHASES[pi];
    const s = phaseStats(p);
    const st = phaseStatus(pi);
    const locked = st === "locked";
    const prev = PHASES[pi - 1], next = PHASES[pi + 1];
    const doneAt = state.completedPhases[p.id];

    return (
      '<div style="--c:' + p.color + '">' +
      '<section class="card phase-hero' + (p.image ? " has-img" : "") + '">' +
      (p.image ? '<img class="phase-hero__bg" src="' + p.image + '" alt="">' : "") +
      '<div class="phase-hero__icon">' + icon(locked ? "lock" : p.icon) + "</div>" +
      '<div class="phase-hero__body">' +
      '<span class="eyebrow">' + icon("wave") + "Fase " + p.number + " de " + PHASES.length + "</span> " + statusChip(st) +
      "<h1>" + esc(p.title) + "</h1>" +
      '<p class="tagline">' + esc(p.tagline) + "</p>" +
      bar("phase-" + p.id, s.pct) +
      "</div>" +
      ring("phase-" + p.id, s.pct, 120, 11, p.color, s.done + "/" + s.total, "objetivos") +
      "</section>" +

      (locked
        ? '<div class="lock-banner">' + icon("lock") + "<div><strong>Fase bloqueada.</strong> Conclua a <a href=\"#" + prev.id + '">Fase ' + prev.number + " — " + esc(prev.title) + "</a> para liberar estes objetivos. Você já pode ler a história, as dicas e as <a href=\"#regras\">regras</a>.</div></div>"
        : "") +
      (st === "done"
        ? '<div class="done-banner">' + icon("crown") + "<div><strong>Fase concluída" + (doneAt ? " em " + fmtDate(doneAt) : "") + "!</strong><br><span class=\"muted\">" +
          (next ? "A Fase " + next.number + " — " + esc(next.title) + " está liberada." : "Você completou o desafio inteiro. Uma verdadeira lenda!") + "</span></div>" +
          (next ? '<a class="btn btn--sm" href="#' + next.id + '">' + icon("unlock") + "Ir para a Fase " + next.number + "</a>" : "") + "</div>"
        : "") +

      '<div class="phase-layout">' +
      '<section class="card">' +
      '<div class="checklist-head"><h2 class="card__title">' + icon("shell") + "Objetivos</h2><span class=\"tiny\">" + s.done + " de " + s.total + " concluídos</span></div>" +
      '<ul class="checklist' + (locked ? " is-locked" : "") + '">' +
      p.objectives.map((o) => {
        const on = !!state.checked[o.id];
        return (
          '<li><label class="objective' + (on ? " is-checked" : "") + '" data-oid="' + o.id + '">' +
          '<input type="checkbox" data-obj="' + o.id + '"' + (on ? " checked" : "") + (locked ? " disabled" : "") + ">" +
          '<span class="objective__box">' + icon("check") + "</span>" +
          '<span class="objective__text">' + esc(o.text) + "</span>" +
          '<span class="objective__meta">' +
          (o.optional ? '<span class="chip chip--optional">opcional</span>' : "") +
          (on ? '<span class="objective__date">' + icon("check") + " " + fmtDate(state.checked[o.id]) + "</span>" : "") +
          "</span></label></li>"
        );
      }).join("") +
      "</ul>" +
      '<div class="checklist-foot"><span class="tiny">' + (locked ? icon("lock") + " Marcações liberadas após a fase anterior." : "Clique em um objetivo para marcar ou desmarcar. Tudo é salvo automaticamente.") + "</span>" +
      (locked ? "" : '<button class="btn btn--ghost btn--sm" data-clear="' + pi + '">' + icon("undo") + "Desmarcar todos</button>") +
      "</div></section>" +

      '<div class="side-stack">' +
      (p.goal ? '<section class="card goal-card"><h2 class="card__title">' + icon("target") + "Objetivo da fase</h2><p class=\"goal-card__text\">" + esc(p.goal) + "</p></section>" : "") +
      '<section class="card"><h2 class="card__title">' + icon("book") + "A história</h2><p class=\"story\">“" + esc(p.story) + "”</p></section>" +
      (p.tips && p.tips.length
        ? '<section class="card"><h2 class="card__title">' + icon("sparkle") + "Dicas da maré</h2><ul class=\"tips\">" +
          p.tips.map((t) => "<li>" + icon("star") + "<span>" + esc(t) + "</span></li>").join("") + "</ul></section>"
        : "") +
      '<section class="card"><h2 class="card__title">' + icon("rules") + "Lembrete das regras</h2>" +
      '<p class="muted" style="margin:0 0 14px">Sem cheats de dinheiro, sem mods de vantagem financeira e progressão sempre na ordem das fases.</p>' +
      '<a class="btn btn--ghost btn--sm" href="#regras">' + icon("rules") + "Ver todas as regras</a></section>" +
      "</div></div>" +

      '<nav class="phase-nav" aria-label="Navegação entre fases">' +
      (prev ? '<a class="btn btn--ghost" href="#' + prev.id + '">← Fase ' + prev.number + "</a>" : '<a class="btn btn--ghost" href="#inicio">← Início</a>') +
      (next ? '<a class="btn btn--ghost" href="#' + next.id + '">Fase ' + next.number + " →</a>" : '<a class="btn btn--ghost" href="#diario">Diário →</a>') +
      "</nav></div>"
    );
  }

  /* ---------- Regras ---------- */
  function viewRules() {
    return (
      '<header class="page-head"><span class="eyebrow">' + icon("rules") + "Código das marés</span><h1>Regras gerais</h1>" +
      "<p>As regras valem para todas as fases e estão sempre disponíveis para consulta — mesmo quando uma fase ainda está bloqueada.</p></header>" +
      '<section class="rules-grid">' +
      C.rules.map((r, i) => '<div class="card rule"><div class="rule__num">' + icon(r.icon) + "</div><div><small>Regra " + (i + 1) + "</small><p>" + esc(r.text) + "</p></div></div>").join("") +
      "</section>" +
      '<div class="section-title"><div><span class="eyebrow">' + icon("steps") + "Progressão</span><h2>A ordem das fases</h2></div></div>" +
      '<section class="card"><p class="muted" style="margin-top:0">Cada fase só libera seus objetivos quando a anterior estiver 100% concluída. Se você desmarcar um objetivo de uma fase já concluída, as fases seguintes voltam a ficar bloqueadas — mas nada do que foi marcado nelas é apagado.</p>' +
      '<div class="order">' +
      PHASES.map((p, i) => '<a href="#' + p.id + '" style="--c:' + p.color + '">' + icon(phaseStatus(i) === "done" ? "check" : phaseStatus(i) === "locked" ? "lock" : p.icon) + "<span>" + p.number + ". " + esc(p.title) + "</span></a>").join("") +
      "</div></section>" +
      (C.officialArt
        ? '<div style="margin-top:18px">' + criteriaCard() + '</div><section class="card art-card" style="margin-top:18px"><button class="art-thumb" data-art aria-label="Abrir a arte oficial em tela cheia"><img src="' + C.officialArt + '" alt="" loading="lazy"><span>' + icon("sparkle") + "Ampliar</span></button>" +
          '<div><h2 class="card__title">' + icon("star") + "Arte oficial do desafio</h2><p class=\"muted\" style=\"margin:0 0 14px\">O pôster com as quatro fases, as regras gerais e os critérios de conclusão. Clique para ver em tela cheia.</p>" +
          '<button class="btn btn--ghost btn--sm" data-art>' + icon("sparkle") + "Ver arte oficial</button></div></section>"
        : "") +
      '<section class="card" style="margin-top:18px"><h2 class="card__title">' + icon("info") + "Sobre o dinheiro do casamento</h2>" +
      '<p class="muted" style="margin:0">Quando a sereia se casa, os Simoleons do cônjuge entram na conta da família. Para manter o desafio honesto, registre esse valor como <strong>patrimônio do cônjuge</strong> no painel <a href="#patrimonio">Patrimônio da Sereia</a>. O patrimônio próprio e a reserva só crescem com o que ela conquistar.</p></section>'
    );
  }

  /* ---------- Patrimônio ---------- */
  function viewFinance() {
    return (
      '<header class="page-head"><span class="eyebrow">' + icon("chest") + "Tesouro</span><h1>Patrimônio da Sereia</h1>" +
      "<p>Preencha os valores conforme aparecem no jogo. Tudo é salvo automaticamente; use “Registrar no histórico” para guardar um retrato da evolução.</p></header>" +
      '<section class="finance-grid">' +
      C.financeFields.map((f) =>
        '<div class="card fin-field"><div class="fin-field__head"><div class="stat__icon">' + icon(f.icon) + "</div><div><strong>" + esc(f.label) + "</strong><small>" + esc(f.hint) + "</small></div></div>" +
        '<div class="money"><input class="input" type="number" inputmode="numeric" min="0" step="1" placeholder="0" data-fin="' + f.id + '" aria-label="' + esc(f.label) + '" value="' + (state.finance[f.id] != null && state.finance[f.id] !== "" ? num(state.finance[f.id]) : "") + '"></div></div>'
      ).join("") +
      "</section>" +
      '<div class="checklist-foot" style="margin-top:16px">' +
      '<div class="field" style="flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap"><label for="goal" class="label">Meta da reserva própria</label><div class="money" style="width:180px"><input class="input" id="goal" type="number" min="0" step="1" value="' + num(state.reserveGoal) + '"></div></div>' +
      '<button class="btn btn--gold" id="snapBtn">' + icon("chart") + "Registrar no histórico</button></div>" +
      '<div id="finIndicators"></div>'
    );
  }

  function finIndicators() {
    const t = finTotals();
    const hist = state.financeHistory.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    // compara com o último registro de um dia anterior (ou o de hoje, se for o único)
    const before = hist.filter((h) => h.date < todayISO());
    const lastSnap = before[before.length - 1] || hist[hist.length - 1];
    const lt = lastSnap ? finTotals(lastSnap.values) : null;
    const delta = (now, before) => {
      if (!lt) return '<div class="kpi__delta tiny">Registre no histórico para comparar</div>';
      const d = now - before;
      if (!d) return '<div class="kpi__delta tiny">Sem variação desde ' + fmtDate(lastSnap.date) + "</div>";
      return '<div class="kpi__delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "▲ +" : "▼ −") + money(Math.abs(d)).replace("§ ", "§ ") + " desde " + fmtDate(lastSnap.date) + "</div>";
    };
    const goal = num(state.reserveGoal);
    const reservePct = goal ? Math.min(100, Math.round((t.reserve / goal) * 100)) : 0;
    const splitTotal = t.own + t.spouse;
    const ownPct = splitTotal ? Math.round((t.own / splitTotal) * 100) : 0;
    const maxField = Math.max(1, ...C.financeFields.map((f) => num(state.finance[f.id])));

    return (
      '<section class="kpis">' +
      '<div class="card"><div class="kpi__label">Patrimônio da família</div><div class="kpi__value">' + money(t.family) + '</div><div class="tiny">Dinheiro + residência + bens</div>' + delta(t.family, lt && lt.family) + "</div>" +
      '<div class="card"><div class="kpi__label">Patrimônio próprio da sereia</div><div class="kpi__value" style="color:var(--aqua)">' + money(t.own) + '</div><div class="tiny">Individual + reserva própria</div>' + delta(t.own, lt && lt.own) + "</div>" +
      '<div class="card"><div class="kpi__label">Patrimônio do cônjuge</div><div class="kpi__value" style="color:#cfc7ff">' + money(t.spouse) + '</div><div class="tiny">Contabilizado separadamente</div>' + delta(t.spouse, lt && lt.spouse) + "</div>" +
      "</section>" +

      '<section class="two-col" style="margin-top:0">' +
      '<div class="card"><h2 class="card__title">' + icon("ring") + "Próprio × conjugal</h2>" +
      (splitTotal
        ? '<div class="split"><div style="width:' + ownPct + '%;background:linear-gradient(90deg,#3fd0c9,#8ff0dd)"></div><div style="width:' + (100 - ownPct) + '%;background:linear-gradient(90deg,#9b8cff,#cfc7ff)"></div></div>' +
          '<div class="legend"><span><i style="background:#3fd0c9"></i>Sereia ' + ownPct + "% · " + money(t.own) + '</span><span><i style="background:#9b8cff"></i>Cônjuge ' + (100 - ownPct) + "% · " + money(t.spouse) + "</span></div>" +
          '<p class="tiny" style="margin:12px 0 0">' + (ownPct >= 50 ? "A sereia tem o próprio tesouro — independência garantida." : "Continue construindo o patrimônio próprio para não depender do casamento.") + "</p>"
        : '<div class="empty">' + icon("ring") + "Preencha o patrimônio da sereia e do cônjuge para ver a divisão.</div>") +
      '<h3 style="margin:22px 0 8px;font-size:1rem">Meta da reserva própria</h3>' +
      '<div class="overall__meta" style="margin-bottom:8px"><span class="tiny">' + money(t.reserve) + " de " + money(goal) + '</span><span class="tiny">' + reservePct + "%</span></div>" +
      bar("fin-reserve", reservePct) +
      "</div>" +

      '<div class="card"><h2 class="card__title">' + icon("gem") + "Composição</h2><div class=\"hbars\">" +
      C.financeFields.map((f) => {
        const v = num(state.finance[f.id]);
        return '<div class="hbar"><span>' + esc(f.label) + "</span>" + bar("fin-" + f.id, Math.round((v / maxField) * 100), "bar--sm") + "<strong>" + moneyShort(v) + "</strong></div>";
      }).join("") +
      "</div></div></section>" +

      '<section class="two-col">' +
      '<div class="card"><h2 class="card__title">' + icon("chart") + "Evolução</h2>" + lineChart(hist) + "</div>" +
      '<div class="card"><h2 class="card__title">' + icon("calendar") + "Histórico</h2>" +
      (hist.length
        ? '<ul class="history">' +
          hist.slice().reverse().map((h) => {
            const ht = finTotals(h.values);
            return "<li><div><strong>" + fmtDate(h.date) + '</strong><div class="tiny">Família ' + money(ht.family) + " · Sereia " + money(ht.own) + "</div></div>" +
              '<button class="icon-btn icon-btn--danger" data-del-snap="' + h.id + '" aria-label="Excluir registro de ' + fmtDate(h.date) + '">' + icon("trash") + "</button></li>";
          }).join("") + "</ul>"
        : '<div class="empty">' + icon("calendar") + "Nenhum registro ainda. Clique em “Registrar no histórico” ao fim de cada sessão de jogo.</div>") +
      "</div></section>"
    );
  }

  function lineChart(hist) {
    if (hist.length < 2) return '<div class="empty">' + icon("chart") + "O gráfico aparece a partir de 2 registros no histórico.</div>";
    const W = 600, H = 240, L = 56, R = 16, T = 16, B = 34;
    const series = [
      { key: "family", color: "#f2c46d", label: "Família" },
      { key: "own", color: "#3fd0c9", label: "Sereia" },
      { key: "spouse", color: "#9b8cff", label: "Cônjuge" }
    ];
    const pts = hist.map((h) => finTotals(h.values));
    const max = Math.max(1, ...pts.flatMap((p) => series.map((s) => p[s.key])));
    const x = (i) => L + (i * (W - L - R)) / (hist.length - 1);
    const y = (v) => T + (H - T - B) * (1 - v / max);
    let svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Gráfico da evolução do patrimônio">';
    for (let g = 0; g <= 4; g++) {
      const v = (max * g) / 4, yy = y(v);
      svg += '<line class="chart-axis" x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '"/>';
      svg += '<text class="chart-label" x="' + (L - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + moneyShort(v).replace("§ ", "§") + "</text>";
    }
    const step = Math.ceil(hist.length / 6);
    hist.forEach((h, i) => {
      if (i % step === 0 || i === hist.length - 1)
        svg += '<text class="chart-label" x="' + x(i) + '" y="' + (H - 10) + '" text-anchor="middle">' + fmtDateShort(h.date) + "</text>";
    });
    series.forEach((s) => {
      const d = pts.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p[s.key]).toFixed(1)).join(" ");
      svg += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      pts.forEach((p, i) => {
        svg += '<circle cx="' + x(i) + '" cy="' + y(p[s.key]) + '" r="3.5" fill="' + s.color + '"><title>' + s.label + " · " + fmtDate(hist[i].date) + ": " + money(p[s.key]) + "</title></circle>";
      });
    });
    svg += "</svg>";
    return '<div class="chart-wrap">' + svg + '</div><div class="legend">' + series.map((s) => '<span><i style="background:' + s.color + '"></i>' + s.label + "</span>").join("") + "</div>";
  }

  function refreshFinance() {
    const box = $("#finIndicators");
    if (!box) return;
    box.innerHTML = finIndicators();
    animate(box);
  }

  /* ---------- Diário ---------- */
  let editingId = null;
  let diaryFilter = "all";
  const sortedDiary = () =>
    state.diary.slice().sort((a, b) => (a.date === b.date ? (b.createdAt || "").localeCompare(a.createdAt || "") : a.date < b.date ? 1 : -1));
  const DIARY_FIELDS = [
    { id: "events", label: "Acontecimentos importantes", icon: "wave", ph: "O que aconteceu nesta sessão?" },
    { id: "achievements", label: "Conquistas desbloqueadas", icon: "star", ph: "Habilidades, relacionamentos, objetivos…" },
    { id: "difficulties", label: "Dificuldades encontradas", icon: "anchor", ph: "Contas, imprevistos, rivais…" },
    { id: "notes", label: "Observações pessoais", icon: "pearl", ph: "Ideias, planos, sentimentos…" }
  ];

  function viewDiary() {
    const e = editingId ? state.diary.find((d) => d.id === editingId) : null;
    const ci = Math.min(currentPhaseIndex(), PHASES.length - 1);
    const val = (k) => (e ? esc(e[k] || "") : "");
    return (
      '<header class="page-head"><span class="eyebrow">' + icon("book") + "Memórias do oceano</span><h1>Diário da Sereia</h1>" +
      "<p>Registre cada sessão de jogo: o que aconteceu, o que foi conquistado e o que ficou difícil. Os registros ficam salvos neste navegador.</p></header>" +
      '<div class="diary-layout">' +
      '<form class="card diary-form" id="diaryForm" autocomplete="off">' +
      '<h2 class="card__title" style="margin:0">' + icon(e ? "edit" : "plus") + (e ? "Editar registro" : "Novo registro") + "</h2>" +
      '<div class="row">' +
      '<div class="field"><label for="d-date">Data da atualização</label><input class="input" type="date" id="d-date" name="date" required value="' + (e ? e.date : todayISO()) + '"></div>' +
      '<div class="field"><label for="d-phase">Fase atual</label><select class="select" id="d-phase" name="phase">' +
      PHASES.map((p) => '<option value="' + p.number + '"' + ((e ? String(e.phase) === String(p.number) : ci === p.number - 1) ? " selected" : "") + ">Fase " + p.number + " — " + esc(p.title) + "</option>").join("") +
      "</select></div></div>" +
      DIARY_FIELDS.map((f) =>
        '<div class="field"><div class="label-row"><label for="d-' + f.id + '">' + f.label + "</label>" +
        (f.id === "achievements" ? '<button type="button" class="link-btn" id="fillAch">+ objetivos concluídos</button>' : "") +
        '</div><textarea class="textarea" id="d-' + f.id + '" name="' + f.id + '" placeholder="' + f.ph + '">' + val(f.id) + "</textarea></div>"
      ).join("") +
      '<div class="actions"><button class="btn" type="submit">' + icon("check") + (e ? "Salvar alterações" : "Adicionar ao diário") + "</button>" +
      (e ? '<button class="btn btn--ghost" type="button" id="cancelEdit">Cancelar</button>' : "") + "</div>" +
      "</form>" +

      "<section>" +
      '<div class="filters" role="group" aria-label="Filtrar por fase">' +
      '<button class="filter' + (diaryFilter === "all" ? " is-active" : "") + '" data-filter="all">Todas (' + state.diary.length + ")</button>" +
      PHASES.map((p) => {
        const n = state.diary.filter((d) => String(d.phase) === String(p.number)).length;
        return '<button class="filter' + (diaryFilter === String(p.number) ? " is-active" : "") + '" data-filter="' + p.number + '">Fase ' + p.number + " (" + n + ")</button>";
      }).join("") +
      "</div>" +
      '<div class="entries">' + diaryEntries() + "</div>" +
      "</section></div>"
    );
  }

  function diaryEntries() {
    const list = sortedDiary().filter((d) => diaryFilter === "all" || String(d.phase) === diaryFilter);
    if (!list.length)
      return '<div class="card empty">' + icon("book") + (state.diary.length ? "Nenhum registro nesta fase." : "Seu diário ainda está em branco. Que tal escrever sobre a chegada da sereia à praia?") + "</div>";
    return list.map((d) => {
      const p = PHASES[num(d.phase) - 1] || PHASES[0];
      return (
        '<article class="card entry' + (d.id === editingId ? " is-editing" : "") + '" style="--c:' + p.color + '">' +
        '<div class="entry__head"><div><div class="entry__date">' + fmtDateLong(d.date) + '</div><span class="chip" style="margin-top:6px;color:' + p.color + '">' + icon(p.icon) + "Fase " + p.number + " · " + esc(p.title) + "</span></div>" +
        '<div class="entry__actions"><button class="icon-btn" data-edit="' + d.id + '" aria-label="Editar registro">' + icon("edit") + '</button><button class="icon-btn icon-btn--danger" data-del="' + d.id + '" aria-label="Excluir registro">' + icon("trash") + "</button></div></div>" +
        DIARY_FIELDS.filter((f) => d[f.id]).map((f) => '<div class="entry__block"><h4>' + icon(f.icon) + f.label + "</h4><p>" + esc(d[f.id]) + "</p></div>").join("") +
        "</article>"
      );
    }).join("");
  }

  /* ============================================================
     NAVEGAÇÃO / RENDER
     ============================================================ */
  const ROUTES = ["inicio", ...PHASES.map((p) => p.id), "regras", "patrimonio", "diario"];
  const route = () => {
    const h = location.hash.replace("#", "");
    return ROUTES.includes(h) ? h : "inicio";
  };

  function renderNav() {
    const r = route();
    const link = (href, ic, text, sub, extra, color) =>
      '<a class="nav__link' + (r === href ? " is-active" : "") + '" href="#' + href + '"' + (r === href ? ' aria-current="page"' : "") + (color ? ' style="--c:' + color + '"' : "") + ">" +
      '<span class="nav__icon">' + icon(ic) + '</span><span class="nav__text">' + text + (sub ? "<small>" + sub + "</small>" : "") + "</span>" + (extra || "") + "</a>";

    $("#nav").innerHTML =
      link("inicio", "home", "Início") +
      '<div class="nav__label">A jornada</div>' +
      PHASES.map((p, i) => {
        const st = phaseStatus(i), s = phaseStats(p);
        return link(p.id, p.icon, "Fase " + p.number, esc(p.title),
          '<span class="nav__state' + (st === "done" ? " is-done" : "") + '" title="' + s.done + "/" + s.total + '">' +
          (st === "done" ? icon("check") : st === "locked" ? icon("lock") : '<span class="tiny">' + s.pct + "%</span>") + "</span>", p.color);
      }).join("") +
      '<div class="nav__label">Consulta</div>' +
      link("regras", "rules", "Regras gerais", null, null, "#f2c46d") +
      link("patrimonio", "chest", "Patrimônio da Sereia", null, null, "#f2c46d") +
      link("diario", "book", "Diário da Sereia", state.diary.length ? state.diary.length + " registro" + (state.diary.length > 1 ? "s" : "") : null, null, "#ff8fb8");

    const o = overall();
    $("#sidebarProgress").innerHTML =
      '<div class="row"><span>Progresso geral</span><strong>' + o.pct + "%</strong></div>" + bar("sidebar", o.pct, "bar--sm") +
      '<div class="row" style="margin:8px 0 0"><span class="tiny">' + o.done + " concluídos</span><span class=\"tiny\">" + o.remaining + " restantes</span></div>";
    $("#topbarPct").textContent = o.pct + "%";
  }

  let lastRoute = null;
  function render(opts = {}) {
    const r = route();
    const changed = r !== lastRoute;
    lastRoute = r;
    if (r !== "diario") editingId = null;

    let html;
    if (r === "inicio") html = viewHome();
    else if (r === "regras") html = viewRules();
    else if (r === "patrimonio") html = viewFinance();
    else if (r === "diario") html = viewDiary();
    else html = viewPhase(PHASES.findIndex((p) => p.id === r));

    view.innerHTML = '<div class="' + (changed ? "view-enter" : "") + '">' + html + '<p class="footer-note">Progresso salvo automaticamente neste navegador · Desafio pessoal de The Sims 4</p></div>';
    renderNav();
    if (r === "patrimonio") refreshFinance();
    animate(document);

    if (opts.pop) {
      const el = $('[data-oid="' + opts.pop + '"]', view);
      if (el) el.classList.add("pop");
    }
    const titles = { inicio: "Início", regras: "Regras", patrimonio: "Patrimônio", diario: "Diário" };
    const ph = PHASES.find((p) => p.id === r);
    document.title = (ph ? "Fase " + ph.number + " · " + ph.title : titles[r]) + " — A Sereia Esposa-Troféu";

    if (changed) {
      openModals.forEach((close) => close());
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
      closeMenu();
    }
  }

  /* ---------- eventos (delegados) ---------- */
  view.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-obj]")) setObjective(t.dataset.obj, t.checked);
  });

  view.addEventListener("click", async (e) => {
    const t = e.target.closest("button, [data-filter]");
    if (!t) return;

    if (t.hasAttribute("data-art")) return openArt();
    if (t.dataset.clear != null) return clearPhase(num(t.dataset.clear));

    if (t.id === "snapBtn") {
      const today = todayISO();
      const existing = state.financeHistory.find((h) => h.date === today);
      const values = {};
      C.financeFields.forEach((f) => (values[f.id] = num(state.finance[f.id])));
      if (existing) existing.values = values;
      else state.financeHistory.push({ id: uid(), date: today, values });
      save();
      refreshFinance();
      return toast({ title: existing ? "Registro de hoje atualizado" : "Patrimônio registrado", text: "Família " + money(finTotals(values).family) + " · Sereia " + money(finTotals(values).own), icon: "chart", type: "gold" });
    }
    if (t.dataset.delSnap) {
      const h = state.financeHistory.find((x) => x.id === t.dataset.delSnap);
      const ok = await confirmModal({ title: "Excluir registro?", text: "O registro do histórico de " + fmtDate(h.date) + " será removido.", confirm: "Excluir", danger: true });
      if (!ok) return;
      state.financeHistory = state.financeHistory.filter((x) => x.id !== h.id);
      save();
      refreshFinance();
      return toast({ title: "Registro excluído", icon: "trash" });
    }

    if (t.dataset.filter) {
      diaryFilter = t.dataset.filter;
      return render();
    }
    if (t.dataset.edit) {
      editingId = t.dataset.edit;
      render();
      const f = $("#diaryForm");
      f.scrollIntoView({ behavior: "smooth", block: "start" });
      $("#d-events").focus({ preventScroll: true });
      return;
    }
    if (t.dataset.del) {
      const d = state.diary.find((x) => x.id === t.dataset.del);
      const ok = await confirmModal({ title: "Excluir registro?", text: "O registro de " + fmtDateLong(d.date) + " será apagado do diário.", confirm: "Excluir", danger: true });
      if (!ok) return;
      const idx = state.diary.indexOf(d);
      state.diary.splice(idx, 1);
      if (editingId === d.id) editingId = null;
      save();
      render();
      return toast({ title: "Registro excluído", icon: "trash", action: { label: "Desfazer", run: () => { state.diary.splice(idx, 0, d); save(); render(); } } });
    }
    if (t.id === "cancelEdit") {
      editingId = null;
      return render();
    }
    if (t.id === "fillAch") {
      const lastEntry = state.diary.slice().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))[0];
      const since = editingId ? "" : lastEntry ? lastEntry.createdAt : "";
      const items = [];
      PHASES.forEach((p) => p.objectives.forEach((o) => { const at = state.checked[o.id]; if (at && at > since) items.push({ at, text: o.text }); }));
      items.sort((a, b) => a.at.localeCompare(b.at));
      if (!items.length) return toast({ title: "Nada novo por aqui", text: "Nenhum objetivo concluído desde o último registro.", icon: "info" });
      const ta = $("#d-achievements");
      const lines = items.map((i) => "✦ " + i.text).filter((l) => !ta.value.includes(l));
      ta.value = (ta.value.trim() ? ta.value.trim() + "\n" : "") + lines.join("\n");
      return toast({ title: lines.length + " conquista(s) adicionada(s)", icon: "star" });
    }
  });

  view.addEventListener("submit", (e) => {
    if (e.target.id !== "diaryForm") return;
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {};
    ["date", "phase", ...DIARY_FIELDS.map((f) => f.id)].forEach((k) => (data[k] = String(fd.get(k) || "").trim()));
    if (!data.date) return toast({ title: "Informe a data", type: "warn", icon: "calendar" });
    if (!DIARY_FIELDS.some((f) => data[f.id])) return toast({ title: "Registro vazio", text: "Escreva pelo menos um dos campos.", type: "warn", icon: "info" });
    const now = new Date().toISOString();
    if (editingId) {
      const d = state.diary.find((x) => x.id === editingId);
      Object.assign(d, data, { updatedAt: now });
      editingId = null;
      toast({ title: "Registro atualizado", icon: "edit" });
    } else {
      state.diary.push({ id: uid(), ...data, createdAt: now, updatedAt: now });
      toast({ title: "Registro adicionado ao diário", text: fmtDateLong(data.date), icon: "book", type: "gold" });
    }
    save();
    render();
  });

  view.addEventListener("input", (e) => {
    const t = e.target;
    if (t.id === "simName") {
      state.profile.name = t.value.slice(0, 40);
      save();
    } else if (t.dataset.fin) {
      state.finance[t.dataset.fin] = t.value === "" ? "" : Math.max(0, num(t.value));
      save();
      clearTimeout(view._finT);
      view._finT = setTimeout(refreshFinance, 250);
    } else if (t.id === "goal") {
      state.reserveGoal = Math.max(0, num(t.value));
      save();
      clearTimeout(view._finT);
      view._finT = setTimeout(refreshFinance, 250);
    }
  });

  /* ---------- menu (celular) ---------- */
  const sidebar = $("#sidebar"), scrim = $("#scrim"), menuBtn = $("#menuBtn");
  function openMenu() { sidebar.classList.add("is-open"); scrim.classList.add("is-open"); menuBtn.setAttribute("aria-expanded", "true"); menuBtn.innerHTML = icon("close"); }
  function closeMenu() { sidebar.classList.remove("is-open"); scrim.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.innerHTML = icon("menu"); }
  menuBtn.addEventListener("click", () => (sidebar.classList.contains("is-open") ? closeMenu() : openMenu()));
  scrim.addEventListener("click", closeMenu);
  $("#nav").addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });

  /* ---------- ferramentas ---------- */
  $("#exportBtn").innerHTML = icon("download") + "Exportar";
  $("#importLabel").insertAdjacentHTML("afterbegin", icon("upload") + "Importar");
  $("#resetBtn").innerHTML = icon("reset") + "Reiniciar desafio";
  $("#exportBtn").addEventListener("click", exportBackup);
  $("#importInput").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) importBackup(f);
    e.target.value = "";
  });
  $("#resetBtn").addEventListener("click", resetFlow);
  $$("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));

  /* ---------- bolhas ---------- */
  (function bubbles() {
    const box = $("#bubbles");
    const n = window.innerWidth < 640 ? 10 : 20;
    for (let i = 0; i < n; i++) {
      const b = document.createElement("span");
      const s = 4 + Math.random() * 18;
      b.style.cssText = "left:" + Math.random() * 100 + "%;width:" + s + "px;height:" + s + "px;animation-duration:" + (12 + Math.random() * 18) + "s;animation-delay:" + -Math.random() * 30 + "s";
      box.appendChild(b);
    }
  })();

  /* ---------- sincroniza entre abas ---------- */
  window.addEventListener("storage", (e) => {
    if (e.key !== Store.KEY) return;
    state = Store.load();
    render();
  });

  window.addEventListener("hashchange", () => render());
  if (!Store.available)
    setTimeout(() => toast({ title: "Armazenamento indisponível", text: "Seu progresso não será salvo neste modo do navegador. Use “Exportar” para guardar um backup.", type: "warn", icon: "info", duration: 8000 }), 600);
  render();
})();

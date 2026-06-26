const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const NAV = [
  { id: "home", icon: "🏠", label: "Главная" },
  { id: "battles", icon: "📊", label: "Бои" },
  { id: "opponents", icon: "🎯", label: "Соперники" },
  { id: "winrate", icon: "📈", label: "Винрейт" },
  { id: "counter", icon: "⚔️", label: "Контр" },
  { id: "customize", icon: "🔧", label: "Кастом" },
  { id: "synergy", icon: "✨", label: "Синергии" },
  { id: "stats", icon: "📋", label: "Стат" },
];

let profile = null;
let route = { page: "home", param: null };

async function api(path) {
  const res = await fetch(path, {
    headers: { "X-Telegram-Init-Data": tg?.initData || "" },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || res.statusText);
  return body;
}

function el(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.firstElementChild || d;
}

function deck(cards) {
  return `<div class="card"><p>${(cards || []).join(", ")}</p></div>`;
}

function gate(msg, code) {
  return `<div class="gate"><h2>${msg}</h2><code>${code}</code></div>`;
}

function checkAccess() {
  if (!profile?.player_tag) return gate("Тег не привязан", "/link #ВАШТЕГ");
  if (!profile.subscription?.active) return gate("Нужна подписка", "/subscribe");
  return null;
}

async function renderHome() {
  const c = document.getElementById("content");
  c.innerHTML = `<h1>👑 CR Coach</h1>
    ${profile?.player_name ? `<p class="meta">${profile.player_name} · ${profile.trophies} 🏆 · ${profile.arena_name || ""}</p>` : ""}
    <p>Выберите раздел в меню ниже.</p>`;
}

async function renderBattles() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Загружаю бои...</div>`;
  try {
    const data = await api("/api/battles");
    let html = `<h1>📊 Анализ боёв</h1>`;
    if (data.cached_total != null) html += `<p class="meta">Сохранено: ${data.cached_total} боёв, WR ${data.cached_winrate}%</p>`;
    data.battles.forEach((b) => {
      html += `<div class="card ${b.won ? "win" : "loss"}" data-battle="${b.index}" style="cursor:pointer">
        <strong>${b.won ? "🏆 Победа" : "💔 Поражение"}</strong> vs ${b.opponent_name}
        <p class="meta">${b.trophy_change >= 0 ? "+" : ""}${b.trophy_change} 🏆 · Матчап ${b.matchup_score}/100</p>
      </div>`;
    });
    document.getElementById("content").innerHTML = html;
    document.querySelectorAll("[data-battle]").forEach((node) => {
      node.onclick = () => { route = { page: "battle", param: node.dataset.battle }; render(); };
    });
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderBattleDetail(idx) {
  document.getElementById("content").innerHTML = `<div class="loading">Загрузка...</div>`;
  try {
    const b = await api(`/api/battles/${idx}`);
    document.getElementById("content").innerHTML = `
      <span class="back" id="back-battles">← Назад</span>
      <h1>${b.won ? "🏆 Победа" : "💔 Поражение"} vs ${b.opponent_name}</h1>
      <p class="meta">${b.trophy_change >= 0 ? "+" : ""}${b.trophy_change} 🏆 · Матчап ${b.matchup_score}/100</p>
      <h3>Ваша колода (${b.user_stats.avg_elixir} ⚗️)</h3>${deck(b.user_deck)}
      <h3>Колода соперника (${b.opponent_stats.avg_elixir} ⚗️)</h3>${deck(b.opponent_deck)}
      <h3>Анализ</h3><ul class="reasons">${b.reasons.map((r) => `<li>${r}</li>`).join("")}</ul>
      ${b.opponent_threats.length ? `<p class="meta">⚠️ ${b.opponent_threats.join(", ")}</p>` : ""}`;
    document.getElementById("back-battles").onclick = () => { route = { page: "battles", param: null }; render(); };
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderOpponents() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Загрузка...</div>`;
  try {
    const list = await api("/api/opponents");
    let html = `<h1>🎯 Колоды соперников</h1>`;
    list.forEach((o) => {
      html += `<div class="card">
        <strong>${o.name}</strong> ${o.won_against ? "✅" : "❌"}
        <p class="meta">⚗️ ${o.avg_elixir} · ⚠️ ${o.threats.join(", ") || "нет WC"}</p>
        ${deck(o.deck)}
        <button class="btn" data-counter="${o.index}">⚔️ Контр-колода</button>
      </div>`;
    });
    document.getElementById("content").innerHTML = html;
    document.querySelectorAll("[data-counter]").forEach((btn) => {
      btn.onclick = () => { route = { page: "counterDetail", param: btn.dataset.counter }; render(); };
    });
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderCounterList() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Загрузка...</div>`;
  try {
    const list = await api("/api/opponents");
    let html = `<h1>⚔️ Контр-колоды</h1><p class="meta">Выберите соперника</p>`;
    list.forEach((o) => {
      html += `<button class="btn card" data-counter="${o.index}" style="width:100%;text-align:left">${o.name} ${o.won_against ? "✅" : "❌"}</button>`;
    });
    document.getElementById("content").innerHTML = html;
    document.querySelectorAll("[data-counter]").forEach((btn) => {
      btn.onclick = () => { route = { page: "counterDetail", param: btn.dataset.counter }; render(); };
    });
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderCounterDetail(idx) {
  document.getElementById("content").innerHTML = `<div class="loading">Подбор...</div>`;
  try {
    const d = await api(`/api/opponents/${idx}/counter`);
    document.getElementById("content").innerHTML = `
      <span class="back" id="back-counter">← Назад</span>
      <h1>⚔️ Контр vs ${d.opponent_name}</h1>
      <h3>Колода соперника</h3>${deck(d.opponent_deck)}
      <h3>Рекомендуемая колода</h3>${deck(d.counter_deck)}
      <p class="meta">Счётчики: ${d.threats.join(", ") || "универсальный пул"}</p>`;
    document.getElementById("back-counter").onclick = () => { route = { page: "counter", param: null }; render(); };
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderWinrate() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Считаю...</div>`;
  try {
    const list = await api("/api/winrates");
    let html = `<h1>📈 Винрейт колод</h1>`;
    list.forEach((e) => {
      const emoji = e.winrate >= 55 ? "🟢" : e.winrate >= 45 ? "🟡" : "🔴";
      html += `<div class="card">${emoji} <strong>${e.winrate}%</strong> (${e.wins}W/${e.losses}L)${deck(e.cards)}</div>`;
    });
    document.getElementById("content").innerHTML = html || `<p>Недостаточно данных.</p>`;
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderCustomize() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Анализ...</div>`;
  try {
    const d = await api("/api/customize");
    document.getElementById("content").innerHTML = `
      <h1>🔧 Кастомизация</h1><p class="meta">⚗️ ${d.avg_elixir}</p>
      <h3>Было</h3>${deck(d.original)}<h3>Стало</h3>${deck(d.customized)}
      <ul class="reasons">${(d.issues.length ? d.issues : ["✅ Колода оптимальна"]).map((i) => `<li>${i}</li>`).join("")}</ul>`;
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderSynergy() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Строю колоду...</div>`;
  try {
    const d = await api("/api/synergy");
    const syn = Object.entries(d.synergies).filter(([, v]) => v.length).map(([k, v]) => `<li>${k} → ${v.join(", ")}</li>`).join("");
    document.getElementById("content").innerHTML = `
      <h1>✨ Синергии</h1><p class="meta">⭐ ${d.core.join(", ")} · ⚗️ ${d.avg_elixir}</p>
      <h3>Колода</h3>${deck(d.deck)}<ul class="reasons">${syn}</ul>`;
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

async function renderStats() {
  const blocked = checkAccess();
  if (blocked) { document.getElementById("content").innerHTML = blocked; return; }
  document.getElementById("content").innerHTML = `<div class="loading">Загрузка...</div>`;
  try {
    const d = await api("/api/stats");
    let decks = d.top_decks.map((x) => `<div class="card">${x.cards.join(", ")}<p class="meta">${x.total} игр · ${x.winrate}%</p></div>`).join("");
    let cards = d.top_cards.map((c) => `<li>${c.name} — ${c.count} раз</li>`).join("");
    document.getElementById("content").innerHTML = `
      <h1>📊 Статистика</h1><p class="meta">${d.player_tag}</p>
      <div class="stats-grid">
        <div class="stat-box"><b>${d.total}</b> боёв</div>
        <div class="stat-box"><b>${d.wins}W</b>/${d.losses}L</div>
        <div class="stat-box"><b>${d.winrate}%</b> WR</div>
      </div>
      <h3>Топ колод</h3>${decks}<h3>Частые карты</h3><ul class="reasons">${cards}</ul>`;
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>${e.message}</p>`;
  }
}

function renderNav() {
  const nav = document.getElementById("nav");
  nav.innerHTML = NAV.map((n) =>
    `<button type="button" data-page="${n.id}" class="${route.page === n.id || (route.page === "battle" && n.id === "battles") || (route.page === "counterDetail" && n.id === "counter") ? "active" : ""}" title="${n.label}">${n.icon}</button>`
  ).join("");
  nav.querySelectorAll("[data-page]").forEach((btn) => {
    btn.onclick = () => { route = { page: btn.dataset.page, param: null }; render(); };
  });
}

async function render() {
  renderNav();
  const { page, param } = route;
  if (page === "home") return renderHome();
  if (page === "battles") return renderBattles();
  if (page === "battle") return renderBattleDetail(param);
  if (page === "opponents") return renderOpponents();
  if (page === "counter") return renderCounterList();
  if (page === "counterDetail") return renderCounterDetail(param);
  if (page === "winrate") return renderWinrate();
  if (page === "customize") return renderCustomize();
  if (page === "synergy") return renderSynergy();
  if (page === "stats") return renderStats();
}

async function init() {
  document.getElementById("content").innerHTML = `<div class="loading">Загрузка профиля...</div>`;
  try {
    profile = await api("/api/me");
  } catch (e) {
    document.getElementById("content").innerHTML = `<p>Ошибка авторизации: ${e.message}</p>`;
    renderNav();
    return;
  }
  await render();
}

init();

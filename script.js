// ==========================================================
// Конфигурация поисковых систем и ИИ-ассистентов
// ==========================================================
const SEARCH_ENGINES = {
  duckduckgo: { name: "DuckDuckGo", url: q => `https://duckduckgo.com/?q=${encodeURIComponent(q)}` },
  google:     { name: "Google",     url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
  bing:       { name: "Bing",       url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}` },
  yandex:     { name: "Яндекс",     url: q => `https://yandex.ru/search/?text=${encodeURIComponent(q)}` }
};

const AI_ASSISTANTS = {
  gemini:  { name: "Gemini",       host: "gemini.google.com", dot: "gemini-dot",  url: q => `https://gemini.google.com/app` },
  chatgpt: { name: "ChatGPT.com",  host: "chat.openai.com",   dot: "chatgpt-dot", url: q => `https://chat.openai.com/${q ? "?q=" + encodeURIComponent(q) : ""}` },
  claude:  { name: "claude.ai",    host: "claude.ai",         dot: "claude-dot",  url: q => `https://claude.ai/new${q ? "?q=" + encodeURIComponent(q) : ""}` }
};

let currentAI = "claude";

// ==========================================================
// Элементы DOM
// ==========================================================
const engineSelect   = document.getElementById("engineSelect");
const changeSearchLk = document.getElementById("changeSearchLink");
const searchForm     = document.getElementById("searchForm");
const searchInput    = document.getElementById("searchInput");

const tabs        = document.querySelectorAll(".tab");
const panels      = {
  answer: document.getElementById("panel-answer"),
  links:  document.getElementById("panel-links"),
  images: document.getElementById("panel-images")
};

const aiButtons   = document.querySelectorAll(".ai-btn");
const answerCard  = document.getElementById("answerCard");
const answerText  = document.getElementById("answerText");

const linksEmpty  = document.getElementById("linksEmpty");
const linksList   = document.getElementById("linksList");

const imagesEmpty = document.getElementById("imagesEmpty");
const imagesGrid  = document.getElementById("imagesGrid");

// ==========================================================
// Переключение поисковой системы по умолчанию
// ==========================================================
// "сменить поиск" циклически переключает select на следующую систему
changeSearchLk.addEventListener("click", () => {
  const keys = Object.keys(SEARCH_ENGINES);
  const currentIndex = keys.indexOf(engineSelect.value);
  const nextIndex = (currentIndex + 1) % keys.length;
  engineSelect.value = keys[nextIndex];
});

// ==========================================================
// Переключение вкладок: Ответ / Ссылки / Изображения
// ==========================================================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    Object.values(panels).forEach(p => p.classList.add("hidden"));
    const target = tab.dataset.tab;
    panels[target].classList.remove("hidden");
  });
});

// ==========================================================
// Переключение ИИ внутри вкладки "Ответ"
// ==========================================================
aiButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    aiButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentAI = btn.dataset.ai;
    updateAnswerCard();
  });
});

function updateAnswerCard() {
  const ai = AI_ASSISTANTS[currentAI];
  const query = searchInput.value.trim();

  answerCard.querySelector(".source-icon").className = `source-icon ${ai.dot}`;
  answerCard.querySelector(".source-title").textContent = ai.name;
  answerCard.querySelector(".source-url").textContent = `https://${ai.host}`;

  if (query) {
    answerText.innerHTML = `Запрос «<b>${escapeHtml(query)}</b>» будет открыт в <b>${ai.name}</b>. Нажмите «Искать», чтобы перейти к ответу.`;
  } else {
    answerText.innerHTML = `Введите запрос выше, чтобы получить ответ от выбранного ИИ. Сейчас выбран <b>${ai.name}</b> — нажмите «Искать», и запрос откроется в новой вкладке у выбранного ассистента.`;
  }
}

// ==========================================================
// Обработка отправки поискового запроса
// ==========================================================
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  const activeTab = document.querySelector(".tab.active").dataset.tab;

  if (activeTab === "answer") {
    handleAnswerSearch(query);
  } else if (activeTab === "links") {
    handleLinksSearch(query);
  } else if (activeTab === "images") {
    handleImagesSearch(query);
  }
});

// Также обновляем превью ответа при вводе текста (без отправки)
searchInput.addEventListener("input", () => {
  if (!document.getElementById("panel-answer").classList.contains("hidden")) {
    updateAnswerCard();
  }
});

// ---- Вкладка "Ответ": открыть выбранный ИИ с запросом ----
function handleAnswerSearch(query) {
  const ai = AI_ASSISTANTS[currentAI];
  updateAnswerCard();
  window.open(ai.url(query), "_blank");
}

// ---- Вкладка "Ссылки": открыть выбранную поисковую систему ----
function handleLinksSearch(query) {
  const engineKey = engineSelect.value;
  const engine = SEARCH_ENGINES[engineKey];
  const url = engine.url(query);

  linksEmpty.classList.add("hidden");
  linksList.innerHTML = "";

  const item = document.createElement("a");
  item.className = "link-item";
  item.href = url;
  item.target = "_blank";
  item.rel = "noopener noreferrer";
  item.innerHTML = `
    <div class="link-source">🔍 ${engine.name}</div>
    <div class="link-title">Результаты по запросу «${escapeHtml(query)}»</div>
    <div class="link-desc">Открыть результаты поиска в ${engine.name} в новой вкладке.</div>
  `;
  linksList.appendChild(item);

  window.open(url, "_blank");
}

// ---- Вкладка "Изображения": показать сетку изображений ----
function handleImagesSearch(query) {
  imagesEmpty.classList.add("hidden");
  imagesGrid.innerHTML = "";

  const count = 9;
  for (let i = 0; i < count; i++) {
    const seed = `${query}-${i}`;
    const tile = document.createElement("a");
    tile.className = "image-tile";
    tile.href = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    tile.target = "_blank";
    tile.rel = "noopener noreferrer";
    tile.innerHTML = `
      <img src="https://picsum.photos/seed/${encodeURIComponent(seed)}/400/400" alt="${escapeHtml(query)}" loading="lazy">
      <div class="image-caption">${escapeHtml(query)}</div>
    `;
    imagesGrid.appendChild(tile);
  }
}

// ==========================================================
// Утилита
// ==========================================================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================================
// Имитация адресной строки и заголовка вкладки Firefox
// ==========================================================
const ffAddressText = document.getElementById("ffAddressText");
const ffAddressBar  = document.getElementById("ffAddressBar");
const ffTabTitle    = document.querySelector(".ff-tab-title");

function updateBrowserChrome() {
  const query = searchInput.value.trim();
  const activeTab = document.querySelector(".tab.active").dataset.tab;

  if (!query) {
    ffAddressText.textContent = "поиск.local/начало";
    ffTabTitle.textContent = "Поиск";
    return;
  }

  if (activeTab === "answer") {
    const ai = AI_ASSISTANTS[currentAI];
    ffAddressText.textContent = `${ai.host}/…?q=${query}`;
  } else if (activeTab === "links") {
    const engine = SEARCH_ENGINES[engineSelect.value];
    ffAddressText.textContent = `${engine.name.toLowerCase()}.com/search?q=${query}`;
  } else if (activeTab === "images") {
    ffAddressText.textContent = `поиск.local/изображения?q=${query}`;
  }
  ffTabTitle.textContent = `${query} — Поиск`;
}

searchInput.addEventListener("input", updateBrowserChrome);
searchForm.addEventListener("submit", updateBrowserChrome);
tabs.forEach(tab => tab.addEventListener("click", updateBrowserChrome));
aiButtons.forEach(btn => btn.addEventListener("click", updateBrowserChrome));
engineSelect.addEventListener("change", updateBrowserChrome);

// Инициализация
updateAnswerCard();
updateBrowserChrome();
  

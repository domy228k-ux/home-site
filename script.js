/* =====================================================
   ДАННЫЕ — меняй названия, темы, видео и комнаты здесь
   ===================================================== */

// Кнопки верхнего меню (id секции в index.html = "page-" + id)
const TOP_PAGES = [
  { id: "home",     label: "Главная" },
  { id: "reviews",  label: "Отзывы"  },
  { id: "news",     label: "Новости" },
  { id: "about",    label: "О нас"   },
  { id: "account",  label: "Войти"   }
];

// Сколько цифр в левом меню
const SIDEBAR_COUNT = 15;

// Темы-блоки. cat — категория для фильтра, emoji — значок на блоке,
// color — цвет верхней части блока, src — ссылка на видео (можно свой файл: "video/my.mp4")
const THEMES = [
  { name: "Цветы",       cat: "Природа",  emoji: "🌸", color: ["#d9ecd0", "#f3efc9"], src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { name: "Лес",         cat: "Природа",  emoji: "🌲", color: ["#cfe5d2", "#e6f1d4"], src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { name: "Горы",        cat: "Природа",  emoji: "🏔️", color: ["#dbe8e0", "#f0eedb"], src: "https://www.w3schools.com/html/movie.mp4" },
  { name: "Мультфильм",  cat: "Анимация", emoji: "🐰", color: ["#f3e7c9", "#e4efcf"], src: "https://www.w3schools.com/html/mov_bbb.mp4" },
  { name: "Приключения", cat: "Анимация", emoji: "🎈", color: ["#f6e3cf", "#e8efd2"], src: "https://www.w3schools.com/html/movie.mp4" },
  { name: "Сказки",      cat: "Анимация", emoji: "✨", color: ["#efe8cf", "#dcebd3"], src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { name: "Спокойствие", cat: "Релакс",   emoji: "🍃", color: ["#d6ead9", "#eef3d6"], src: "https://www.w3schools.com/html/movie.mp4" },
  { name: "Волны",       cat: "Релакс",   emoji: "🌊", color: ["#d3e9e0", "#ecf2dc"], src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" },
  { name: "Вечер",       cat: "Релакс",   emoji: "🌙", color: ["#e3e8d2", "#f1ecd3"], src: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

// Стартовые комнаты лобби (size — от 2 до 4)
let rooms = [
  { name: "Спокойный вечер", goal: "Просто пообщаться",     age: "Любой", size: 2, taken: 1 },
  { name: "Кино вместе",     goal: "Смотреть видео вместе", age: "12+",   size: 3, taken: 2 },
  { name: "Командная игра",  goal: "Играть",                age: "16+",   size: 4, taken: 3 },
  { name: "Учимся вместе",   goal: "Учиться",               age: "Любой", size: 4, taken: 1 },
  { name: "Чай и разговор",  goal: "Просто пообщаться",     age: "18+",   size: 3, taken: 1 }
];

/* =====================================================
   ЛОГИКА
   ===================================================== */
const $ = (s) => document.querySelector(s);
const restart = (el) => { el.style.animation = "none"; el.offsetHeight; el.style.animation = ""; };

let section = null;      // null = главное меню, иначе номер цифры (0..14)
let filter = "Все";      // выбранная категория
let currentTheme = 0;
let sizeFilter = 0;      // 0 = все

/* ---------- Верхнее меню и страницы ---------- */
function showPage(id) {
  TOP_PAGES.forEach((p) => { $("#page-" + p.id).hidden = p.id !== id; });
  document.querySelectorAll("#topnav button").forEach((b) =>
    b.classList.toggle("active", b.dataset.id === id));
  restart($("#page-" + id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() { showPage("home"); showBlocks(null); }

TOP_PAGES.forEach((p) => {
  const b = document.createElement("button");
  b.textContent = p.label;
  b.dataset.id = p.id;
  b.onclick = () => (p.id === "home" ? goHome() : showPage(p.id));
  $("#topnav").appendChild(b);
});
$("#logo").onclick = goHome;

/* ---------- Хлебные крошки: [{t: текст, cls: "now"|"link"|"", fn}] ---------- */
function renderCrumbs(box, parts) {
  box.innerHTML = "";
  parts.forEach((p, i) => {
    if (i) { const s = document.createElement("span"); s.className = "sep"; s.textContent = "›"; box.appendChild(s); }
    const el = document.createElement("span");
    el.className = p.cls || "";
    el.textContent = p.t;
    if (p.fn) el.onclick = p.fn;
    box.appendChild(el);
  });
}

/* ---------- Левое меню (цифры) ---------- */
for (let i = 0; i < SIDEBAR_COUNT; i++) {
  const b = document.createElement("button");
  b.textContent = i + 1;
  b.style.animationDelay = i * 0.04 + "s";
  b.onclick = () => showBlocks(i);
  $("#sidebar").appendChild(b);
}

function markSidebar() {
  document.querySelectorAll("#sidebar button").forEach((b, n) => b.classList.toggle("active", n === section));
}

/* ---------- Экран 1: блоки с темами ---------- */
function renderFilter() {
  const box = $("#filter-chips");
  box.innerHTML = "";
  ["Все", ...new Set(THEMES.map((t) => t.cat))].forEach((cat) => {
    const c = document.createElement("button");
    c.className = "chip" + (cat === filter ? " active" : "");
    c.textContent = cat;
    c.onclick = () => { filter = cat; renderFilter(); renderBlocks(); };
    box.appendChild(c);
  });
}

function renderBlocks() {
  const box = $("#blocks");
  box.innerHTML = "";
  THEMES.forEach((t, i) => {
    if (filter !== "Все" && t.cat !== filter) return;
    const b = document.createElement("button");
    b.className = "block";
    b.style.animationDelay = box.children.length * 0.05 + "s";
    b.innerHTML = `
      <div class="block-cover" style="background:linear-gradient(135deg, ${t.color[0]}, ${t.color[1]})">${t.emoji}</div>
      <div class="block-info"><div class="block-name">${t.name}</div><div class="block-cat">${t.cat}</div></div>`;
    b.onclick = () => openVideo(i);
    box.appendChild(b);
  });
}

function showBlocks(i) {
  section = i;
  $("#player").pause();
  $("#home-grid").classList.remove("collapsed");   // левое меню разворачивается
  $("#panel-video").hidden = true;
  $("#panel-blocks").hidden = false;
  markSidebar();
  renderCrumbs($("#crumbs-blocks"), [
    { t: i === null ? "Главное меню" : String(i + 1), cls: "now" },
    { t: "Тема" },
    { t: "Видео" }
  ]);
  renderFilter();
  renderBlocks();
  restart($("#panel-blocks"));
}

/* ---------- Экран 2: видео ---------- */
const likes = {};

function openVideo(i) {
  currentTheme = i;
  const t = THEMES[i];
  $("#home-grid").classList.add("collapsed");       // левое меню сворачивается
  $("#panel-blocks").hidden = true;
  $("#panel-video").hidden = false;
  $("#video-title").textContent = t.name;
  $("#player").src = t.src;
  renderCrumbs($("#crumbs-video"), [
    { t: section === null ? "Главное меню" : String(section + 1), cls: "link", fn: () => showBlocks(section) },
    { t: t.name },
    { t: "Видео", cls: "now" }
  ]);
  updateLike();
  restart($("#panel-video"));
}

$("#menu-toggle").onclick = () => $("#home-grid").classList.toggle("collapsed");

function updateLike() {
  const l = likes[currentTheme] || { count: 0, liked: false };
  $("#like-count").textContent = l.count;
  $("#like-btn").classList.toggle("liked", l.liked);
}

$("#like-btn").onclick = () => {
  const l = likes[currentTheme] || (likes[currentTheme] = { count: 0, liked: false });
  l.liked = !l.liked;
  l.count += l.liked ? 1 : -1;
  updateLike();
};
$("#dislike-btn").onclick = () => alert("Спасибо за отзыв!");
$("#share-btn").onclick = () => navigator.clipboard?.writeText(location.href);

/* ---------- Выбор размера лобби (2–4) ---------- */
function renderSizes() {
  const box = $("#size-chips");
  box.innerHTML = "";
  [0, 2, 3, 4].forEach((n) => {
    const c = document.createElement("button");
    c.className = "chip" + (n === sizeFilter ? " active" : "");
    c.textContent = n === 0 ? "Любые" : n + " человека";
    c.onclick = () => { sizeFilter = n; renderSizes(); };
    box.appendChild(c);
  });
}

/* ---------- Окно лобби ---------- */
function renderRooms() {
  const box = $("#rooms");
  box.innerHTML = "";

  const create = document.createElement("div");
  create.className = "room create";
  create.innerHTML = "＋<br>Создать свою";
  create.onclick = () => openCreate(true);
  box.appendChild(create);

  rooms
    .filter((r) => !sizeFilter || r.size === sizeFilter)
    .forEach((r, i) => {
      const d = document.createElement("div");
      d.className = "room";
      d.style.animationDelay = i * 0.05 + "s";
      d.innerHTML = `
        <h3>${r.name}</h3>
        <div class="muted">${r.goal}</div>
        <div class="tags"><span class="tag">${r.age}</span><span class="tag">${r.taken}/${r.size} мест</span></div>
        <button class="btn primary">Войти</button>`;
      d.querySelector("button").onclick = () => alert("Вы вошли в «" + r.name + "»");
      box.appendChild(d);
    });
}

function openCreate(show) {
  $("#rooms-view").hidden = show;
  $("#create-view").hidden = !show;
  $("#modal-title").textContent = show ? "Создать комнату" : "Лобби и комнаты";
}

$("#open-lobby").onclick = () => { renderRooms(); openCreate(false); $("#lobby-overlay").hidden = false; };
$("#close-lobby").onclick = () => ($("#lobby-overlay").hidden = true);
$("#lobby-overlay").onclick = (e) => { if (e.target.id === "lobby-overlay") e.currentTarget.hidden = true; };
$("#cancel-create").onclick = () => openCreate(false);

$("#create-view").onsubmit = (e) => {
  e.preventDefault();
  rooms.unshift({
    name: $("#f-name").value,
    goal: $("#f-goal").value,
    age: $("#f-age").value,
    size: +$("#f-size").value,
    taken: 1
  });
  e.target.reset();
  renderRooms();
  openCreate(false);
};

/* ---------- Аккаунт (демо: хранится в браузере) ---------- */
let creating = true;
const getUsers = () => { try { return JSON.parse(localStorage.getItem("users") || "{}"); } catch (e) { return {}; } };

function setAuthMode(create) {
  creating = create;
  $("#auth-title").textContent = create ? "Создать аккаунт" : "Вход";
  $("#auth-btn").textContent = create ? "Создать аккаунт" : "Войти";
  $("#auth-switch").innerHTML = create
    ? 'Уже есть аккаунт? <a id="auth-toggle">Войти</a>'
    : 'Нет аккаунта? <a id="auth-toggle">Создать</a>';
  $("#auth-toggle").onclick = () => setAuthMode(!creating);
  $("#auth-msg").textContent = "";
}

function authMsg(text, error) {
  const m = $("#auth-msg");
  m.textContent = text;
  m.classList.toggle("error", !!error);
}

$("#auth-form").onsubmit = (e) => {
  e.preventDefault();
  const email = $("#a-email").value.trim().toLowerCase();
  const pass = $("#a-pass").value;
  const users = getUsers();
  if (creating) {
    if (users[email]) return authMsg("Такая почта уже есть", true);
    users[email] = pass;
    localStorage.setItem("users", JSON.stringify(users));
    authMsg("Аккаунт создан ✓");
  } else {
    if (users[email] !== pass) return authMsg("Неверная почта или пароль", true);
    authMsg("Вы вошли ✓");
  }
  document.querySelector('#topnav button[data-id="account"]').textContent = email;
};
setAuthMode(true);

/* ---------- Старт ---------- */
renderSizes();
goHome();

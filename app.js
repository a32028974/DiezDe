/* ==========================
   DIEZ DE - app.js (FINAL)
   - PIN Adulto + 1 adulta por ronda
   - Música ON/OFF + fade + recuerda ON/OFF
   - Volumen SIEMPRE arranca en 15%
   - Fullscreen opcional
   - Terminar ahora
   - Sugerencias + aprobadas por JSONP (sin CORS)
========================== */

// ====== CONFIG ======
const TIEMPO_ESCRITURA = 80;
const PAUSA_LECTURA_MS = 800;
const PAUSA_REPASO_MS = 600;

const ADULTO_PIN = "1971";

// ✅ PEGÁ TU WEBAPP /exec AQUÍ
const SUGERENCIAS_API_URL = "https://script.google.com/macros/s/AKfycbw_PA0H-NzujxdJwRvykqc_IAlBPLW0lhne0zpgFOTGUn1Fw-G1UYRJ0m4QsSYZQzhEfQ/exec";

// ✅ Volumen default SIEMPRE
const DEFAULT_VOL = 0.15;

// ====== DATA base (consignas.js) ======
let CONSIGNAS_GENERALES = Array.isArray(window.CONSIGNAS_GENERALES) ? window.CONSIGNAS_GENERALES : [];
let CONSIGNAS_ADULTO    = Array.isArray(window.CONSIGNAS_ADULTO)    ? window.CONSIGNAS_ADULTO    : [];

// Fallback (por si te olvidás de cargar consignas.js)
if (CONSIGNAS_GENERALES.length === 0) {
  CONSIGNAS_GENERALES = [
    "Un color",
    "Un animal",
    "Algo de la cocina",
    "Una marca",
    "Un país",
    "Una película",
    "Una comida",
    "Un deporte",
    "Algo que te haga reír",
    "Algo que se use para limpiar"
  ];
}
if (CONSIGNAS_ADULTO.length === 0) {
  CONSIGNAS_ADULTO = [
    "Una palabra prohibida",
    "Algo que se hace a escondidas",
    "Una excusa para salir",
    "Un lugar ‘peligroso’",
    "Algo que te da vergüenza decir"
  ];
}

// ====== STATE ======
let adultoON = false;
let musicaON = false;

let rondaActiva = false;
let listaActual = [];
let ultimaLista = [];
let mostrarLista = true; // si "Escuchá y mirá" está ON

// ====== DOM ======
const $ = (sel) => document.querySelector(sel);

const btnAdulto = $("#btnAdulto");
const btnFullscreen = $("#btnFullscreen");
const btnMusica = $("#btnMusica");
const vol = $("#vol");
const volLabel = $("#volLabel");
const bgm = $("#bgm");

const btnIniciar = $("#btnIniciar");
const btnRepetir = $("#btnRepetir");
const btnSugerir = $("#btnSugerir");
const btnMostrar = $("#btnMostrar");
const btnTerminar = $("#btnTerminar");

const status = $("#status");
const substatus = $("#substatus");
const lista = $("#lista");

// ====== INIT ======
init();

function init() {
  // Música: recuerda ON/OFF
  musicaON = localStorage.getItem("diezde_musica_on") === "1";
  setMusicaUI(musicaON);

  // ✅ Volumen SIEMPRE 15% al cargar
  setVolume(DEFAULT_VOL);

  // Botones
  btnIniciar.addEventListener("click", iniciarRonda);
  btnRepetir.addEventListener("click", repetirConsignas);
  btnSugerir.addEventListener("click", sugerirConsigna);
  btnMostrar.addEventListener("click", toggleMostrar);
  btnTerminar.addEventListener("click", terminarAhora);

  btnAdulto.addEventListener("click", toggleAdultoPIN);
  btnFullscreen.addEventListener("click", toggleFullscreen);
  btnMusica.addEventListener("click", toggleMusica);

  vol.addEventListener("input", () => {
    const v = clamp(parseInt(vol.value, 10) / 100, 0, 1);
    bgm.volume = v;
    volLabel.textContent = `${Math.round(v * 100)}%`;
  });

  // Estado inicial UI
  setStatus("Listos para jugar", "Escuchá…");
  renderLista([]);
  setGameButtons(false);

  // Si música estaba ON, la prendemos con fade al entrar
  if (musicaON) {
    playMusicWithFadeIn();
  }
}

// ====== UI HELPERS ======
function setStatus(line1, line2) {
  status.textContent = line1;
  substatus.textContent = line2;
}

function setGameButtons(active) {
  btnRepetir.disabled = !active;
  btnSugerir.disabled = !active;
  btnTerminar.disabled = !active;
  btnMostrar.disabled = !active;
}

function renderLista(items) {
  lista.innerHTML = "";
  if (!items || items.length === 0) return;

  items.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    lista.appendChild(li);
  });
}

function toggleMostrar() {
  mostrarLista = !mostrarLista;
  btnMostrar.classList.toggle("on", mostrarLista);
  btnMostrar.textContent = mostrarLista ? "👀 Escuchá y mirá" : "🙈 Solo escuchá";

  // si hay ronda, refrescamos
  if (rondaActiva) {
    renderLista(mostrarLista ? listaActual : []);
  }
}

function setMusicaUI(on) {
  btnMusica.classList.toggle("on", on);
  btnMusica.innerHTML = on ? "🎵 <span>Música</span>" : "🎵 <span>Música</span>";
}

function setAdultoUI(on) {
  btnAdulto.classList.toggle("on", on);
}

// ====== VOLUME ======
function setVolume(v) {
  const vv = clamp(v, 0, 1);
  bgm.volume = vv;
  vol.value = String(Math.round(vv * 100));
  volLabel.textContent = `${Math.round(vv * 100)}%`;
}

// ====== ROUND ======
async function iniciarRonda() {
  if (rondaActiva) return;

  rondaActiva = true;
  btnIniciar.disabled = true;
  setGameButtons(true);

  setStatus("Ronda en curso", "Prepará lápiz y hoja…");
  await sleep(250);

  // Elegimos 10 consignas
  listaActual = elegirDiez();
  ultimaLista = [...listaActual];

  // Mostramos o escondemos según modo
  renderLista(mostrarLista ? listaActual : []);

  // Leemos en voz
  await leerLista(listaActual);

  setStatus("¡Tiempo!", "Podés repetir o sugerir.");
  btnIniciar.disabled = false;
}

async function repetirConsignas() {
  if (!rondaActiva || ultimaLista.length === 0) return;
  setStatus("Repasando", "Escuchá…");
  await leerLista(ultimaLista, true);
  setStatus("Listo", "Podés sugerir otra o iniciar otra ronda.");
}

async function sugerirConsigna() {
  // JSONP: trae una sugerencia aprobada desde tu Apps Script
  setStatus("Buscando sugerencia…", "Un segundo…");

  try {
    const sug = await jsonpFetch(`${SUGERENCIAS_API_URL}?action=random&adulto=${adultoON ? "1" : "0"}`);
    const texto = (sug && (sug.texto || sug.sugerencia || sug.text)) ? String(sug.texto || sug.sugerencia || sug.text) : "";

    if (!texto) throw new Error("Sin texto en respuesta");

    // reemplaza una al azar
    if (!listaActual || listaActual.length !== 10) listaActual = elegirDiez();

    const idx = randInt(0, 9);
    listaActual[idx] = texto;

    ultimaLista = [...listaActual];
    renderLista(mostrarLista ? listaActual : []);

    setStatus("Sugerencia lista", "La leemos al final.");
    await speak(`Sugerencia: ${texto}`);

    setStatus("Ok", "Podés repetir o iniciar otra ronda.");
  } catch (e) {
    console.log(e);
    setStatus("No se pudo traer sugerencia", "Revisá tu /exec o internet.");
    await sleep(900);
    setStatus("Listos para jugar", "Probá de nuevo cuando quieras.");
  }
}

function terminarAhora() {
  if (!rondaActiva) return;
  rondaActiva = false;
  btnIniciar.disabled = false;
  setGameButtons(false);

  // mostramos lista final para corregir
  renderLista(listaActual);

  setStatus("Ronda terminada", "Podés iniciar otra cuando quieras.");
}

// ====== PICKING LOGIC ======
function elegirDiez() {
  const poolGeneral = shuffle([...CONSIGNAS_GENERALES]);

  // Evitar repetir cosas de la ronda anterior (en lo posible)
  const prev = new Set(ultimaLista.map((x) => String(x).toLowerCase().trim()));

  let selected = [];
  for (const item of poolGeneral) {
    const norm = String(item).toLowerCase().trim();
    if (!prev.has(norm)) selected.push(item);
    if (selected.length === 10) break;
  }

  // si no alcanza, completamos sin filtro
  if (selected.length < 10) {
    for (const item of poolGeneral) {
      selected.push(item);
      if (selected.length === 10) break;
    }
  }

  // ✅ 1 adulta por ronda si adultoON
  if (adultoON && CONSIGNAS_ADULTO.length > 0) {
    const adulta = CONSIGNAS_ADULTO[randInt(0, CONSIGNAS_ADULTO.length - 1)];
    const pos = randInt(0, 9);
    selected[pos] = adulta;
  }

  return selected.slice(0, 10);
}

// ====== VOICE ======
async function leerLista(items, esRepaso = false) {
  // Cancela lectura anterior
  window.speechSynthesis?.cancel?.();

  const intro = esRepaso ? "Repaso." : "Arranca la ronda.";
  await speak(intro);
  await sleep(200);

  for (let i = 0; i < items.length; i++) {
    const n = i + 1;
    const t = String(items[i]);
    await speak(`${n}. ${t}`);
    await sleep(PAUSA_LECTURA_MS);
  }

  await sleep(PAUSA_REPASO_MS);
}

function speak(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) return resolve();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-AR";
    u.rate = 1.02;
    u.pitch = 1.0;

    u.onend = () => resolve();
    u.onerror = () => resolve();

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  });
}

// ====== ADULTO (PIN) ======
function toggleAdultoPIN() {
  if (adultoON) {
    adultoON = false;
    setAdultoUI(false);
    setStatus("Modo Adulto", "Desactivado.");
    return;
  }

  const pin = prompt("Ingresá PIN para Modo Adulto:");
  if (pin === null) return;

  if (String(pin).trim() === ADULTO_PIN) {
    adultoON = true;
    setAdultoUI(true);
    setStatus("Modo Adulto", "Activado (1 por ronda).");
  } else {
    setStatus("PIN incorrecto", "Modo Adulto no se activó.");
  }
}

// ====== FULLSCREEN ======
function toggleFullscreen() {
  const doc = document;
  const el = document.documentElement;

  const isFs = doc.fullscreenElement || doc.webkitFullscreenElement;

  if (!isFs) {
    (el.requestFullscreen || el.webkitRequestFullscreen || (()=>Promise.resolve()))?.call(el);
  } else {
    (doc.exitFullscreen || doc.webkitExitFullscreen || (()=>Promise.resolve()))?.call(doc);
  }
}

// ====== MUSIC ======
async function toggleMusica() {
  musicaON = !musicaON;
  localStorage.setItem("diezde_musica_on", musicaON ? "1" : "0");
  setMusicaUI(musicaON);

  if (musicaON) {
    await playMusicWithFadeIn();
    setStatus("Música", "Activada.");
  } else {
    await fadeOutAndPause();
    setStatus("Música", "Desactivada.");
  }
}

async function playMusicWithFadeIn() {
  try {
    // ✅ cada carga arranca en 15% igualmente
    setVolume(DEFAULT_VOL);

    // en móviles, play puede fallar hasta interacción: acá ya hubo click
    await bgm.play();

    // fade in desde 0 hasta el volumen actual (DEFAULT_VOL o slider)
    const target = clamp(parseInt(vol.value, 10) / 100, 0, 1);
    bgm.volume = 0;
    await fadeVolume(0, target, 450);
  } catch (e) {
    console.log("No se pudo reproducir música:", e);
  }
}

async function fadeOutAndPause() {
  try {
    const current = clamp(bgm.volume, 0, 1);
    await fadeVolume(current, 0, 350);
    bgm.pause();
  } catch (e) {
    // nada
  }
}

function fadeVolume(from, to, ms) {
  return new Promise((resolve) => {
    const steps = 18;
    const stepMs = Math.max(10, Math.floor(ms / steps));
    let i = 0;

    const tick = () => {
      i++;
      const t = i / steps;
      const v = from + (to - from) * t;
      bgm.volume = clamp(v, 0, 1);
      if (i >= steps) return resolve();
      setTimeout(tick, stepMs);
    };

    tick();
  });
}

// ====== JSONP ======
function jsonpFetch(url) {
  return new Promise((resolve, reject) => {
    const cbName = "cb_" + Math.random().toString(16).slice(2);

    const script = document.createElement("script");
    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${cbName}`;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("JSONP timeout"));
    }, 9000);

    window[cbName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("JSONP error"));
    };

    function cleanup() {
      clearTimeout(timeout);
      delete window[cbName];
      script.remove();
    }

    document.body.appendChild(script);
  });
}

// ====== UTILS ======
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

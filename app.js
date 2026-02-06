/* ==========================
   DIEZ DE - app.js (PRO)
   - Playlist continua /musica
   - Música: default 40% + slider + ON/OFF
   - Voz: siempre 100% (speech volume=1)
   - Offline + Update banner (service worker)
   - Sugerencias por JSONP (sin CORS)
========================== */

// ===== CONFIG =====
const TIEMPO_ESCRITURA = 70;
const PAUSA_LECTURA_MS = 700;
const PAUSA_REPASO_MS = 450;

// Si tu modo adulto usa PIN, dejalo. Si no, podés borrar.
const ADULTO_PIN = "1971";

// ✅ TU WEBAPP /exec (la que ya tenés)
const SUGERENCIAS_API_URL = "https://script.google.com/macros/s/AKfycbw_PA0H-NzujxdJwRvykqc_IAlBPLW0lhne0zpgFOTGUn1Fw-G1UYRJ0m4QsSYZQzhEfQ/exec";

// Música: carpeta /musica (playlist continua)
const PLAYLIST = [
  "musica/track1.mp3",
  "musica/track2.mp3",
  "musica/track3.mp3",
  "musica/track4.mp3"
];

// ===== DATA base (consignas.js) =====
let CONSIGNAS_GENERALES = Array.isArray(window.CONSIGNAS_GENERALES) ? window.CONSIGNAS_GENERALES : [];
let CONSIGNAS_ADULTO   = Array.isArray(window.CONSIGNAS_ADULTO) ? window.CONSIGNAS_ADULTO : [];

// ===== DOM =====
const elStatus = document.getElementById("status");
const elListaBox = document.getElementById("listaBox");
const elLista = document.getElementById("listaConsignas");
const btnIniciar = document.getElementById("btnIniciar");
const btnRepetir = document.getElementById("btnRepetir");
const btnFullscreen = document.getElementById("btnFullscreen");
const btnAdulto = document.getElementById("btnAdulto");
const btnMusica = document.getElementById("btnMusica");
const musicVolume = document.getElementById("musicVolume");
const musicVolumeLabel = document.getElementById("musicVolumeLabel");

const modal = document.getElementById("modalSugerir");
const btnSugOpen = document.getElementById("btnSugerirOpen");
const btnSugClose = document.getElementById("btnSugerirClose");
const btnSugSend = document.getElementById("btnSugerirSend");
const sugTexto = document.getElementById("sugTexto");
const sugCategoria = document.getElementById("sugCategoria");
const sugMsg = document.getElementById("sugMsg");

// Update banner
const updateBanner = document.getElementById("updateBanner");
const btnUpdateNow = document.getElementById("btnUpdateNow");

// ===== STATE =====
let modoAdulto = (localStorage.getItem("modoAdulto") === "1");
let ultimaRondaIds = []; // para no repetir ronda anterior
let consignasActuales = [];
let isReading = false;

// ===== AUDIO (música) =====
const MUSIC_KEY_ON = "musicOn";
const MUSIC_KEY_VOL = "musicVol";

let musicOn = (localStorage.getItem(MUSIC_KEY_ON) ?? "1") === "1"; // auto ON
let musicVol = Number(localStorage.getItem(MUSIC_KEY_VOL) ?? 0.40); // 40% default

// Audio player (playlist continua)
const bgm = new Audio();
bgm.preload = "auto";
bgm.loop = false; // NO loop: es playlist continua
bgm.volume = clamp(musicVol, 0, 1);

let playlistIndex = Math.floor(Math.random() * PLAYLIST.length);
let userGestureUnlocked = false;

function loadTrack(i){
  playlistIndex = (i + PLAYLIST.length) % PLAYLIST.length;
  bgm.src = PLAYLIST[playlistIndex];
}

bgm.addEventListener("ended", () => {
  loadTrack(playlistIndex + 1);
  if (musicOn && userGestureUnlocked) {
    bgm.play().catch(()=>{});
  }
});

// ===== SPEECH (voz consignas) =====
function speak(text){
  // voz siempre al 100% (el volumen final lo manda el celu)
  return new Promise((resolve) => {
    try{
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = "es-AR";
      ut.rate = 1.02;     // un toque ágil
      ut.pitch = 1.0;
      ut.volume = 1.0;    // 100%
      ut.onend = resolve;
      ut.onerror = resolve;
      window.speechSynthesis.speak(ut);
    }catch(e){
      resolve();
    }
  });
}

// ===== INIT UI =====
setAdultoUI();
setMusicUI();

// Slider música
musicVolume.value = String(Math.round(bgm.volume * 100));
musicVolumeLabel.textContent = `${musicVolume.value}%`;

musicVolume.addEventListener("input", () => {
  const v = clamp(Number(musicVolume.value) / 100, 0, 1);
  bgm.volume = v;
  musicVolumeLabel.textContent = `${Math.round(v*100)}%`;
  localStorage.setItem(MUSIC_KEY_VOL, String(v));
});

// Botón música ON/OFF
btnMusica.addEventListener("click", async () => {
  unlockAudioByGesture();
  musicOn = !musicOn;
  localStorage.setItem(MUSIC_KEY_ON, musicOn ? "1" : "0");
  setMusicUI();

  if (musicOn) {
    ensureBgmReady();
    bgm.play().catch(()=>{});
  } else {
    bgm.pause();
  }
});

// Fullscreen
btnFullscreen.addEventListener("click", () => {
  unlockAudioByGesture();
  toggleFullscreen();
});

// Adulto
btnAdulto.addEventListener("click", () => {
  unlockAudioByGesture();
  if (!modoAdulto) {
    const pin = prompt("PIN modo adulto:");
    if (pin !== ADULTO_PIN) {
      alert("PIN incorrecto.");
      return;
    }
    modoAdulto = true;
  } else {
    modoAdulto = false;
  }
  localStorage.setItem("modoAdulto", modoAdulto ? "1" : "0");
  setAdultoUI();
});

// Iniciar ronda
btnIniciar.addEventListener("click", async () => {
  unlockAudioByGesture();
  if (isReading) return;

  // Música automática: si está ON, intentamos arrancar al iniciar ronda
  if (musicOn) {
    ensureBgmReady();
    bgm.play().catch(()=>{});
  }

  await iniciarRonda();
});

// Repetir consignas
btnRepetir.addEventListener("click", async () => {
  unlockAudioByGesture();
  if (isReading) return;
  await leerConsignasActuales();
});

// Modal sugerir
btnSugOpen.addEventListener("click", () => openModal(true));
btnSugClose.addEventListener("click", () => openModal(false));
modal.addEventListener("click", (e) => { if (e.target === modal) openModal(false); });

btnSugSend.addEventListener("click", async () => {
  unlockAudioByGesture();
  await enviarSugerencia();
});

// ===== FUNCTIONS =====
function setAdultoUI(){
  btnAdulto.textContent = modoAdulto ? "🔓 Adulto" : "🔒 Adulto";
}

function setMusicUI(){
  btnMusica.classList.toggle("btn-green", musicOn);
  btnMusica.textContent = musicOn ? "🎵 Música ON" : "🎵 Música OFF";
}

function ensureBgmReady(){
  if (!bgm.src) loadTrack(playlistIndex);
  bgm.volume = clamp(Number(localStorage.getItem(MUSIC_KEY_VOL) ?? bgm.volume), 0, 1);
}

function unlockAudioByGesture(){
  // Chrome móvil: audio sólo después de gesto del usuario
  if (!userGestureUnlocked) {
    userGestureUnlocked = true;
    try { bgm.muted = false; } catch(e){}
  }
}

async function iniciarRonda(){
  const poolGeneral = CONSIGNAS_GENERALES.slice();
  const poolAdulto = CONSIGNAS_ADULTO.slice();

  if (!poolGeneral.length) {
    setStatus("No hay consignas. Revisá consignas.js");
    return;
  }

  // Elegimos 10 generales
  const elegidas = pickRandomUnique(poolGeneral, 10, ultimaRondaIds);

  // Si modo adulto, metemos 1 adulta por ronda (si hay)
  if (modoAdulto && poolAdulto.length) {
    const adulta = pickRandomUnique(poolAdulto, 1, ultimaRondaIds)[0];
    // la metemos en una posición random
    const pos = Math.floor(Math.random() * (elegidas.length + 1));
    elegidas.splice(pos, 0, adulta);
    // y dejamos 10 total -> sacamos una general random si quedamos en 11
    if (elegidas.length > 10) {
      const idxToRemove = pos === 0 ? elegidas.length - 1 : 0;
      elegidas.splice(idxToRemove, 1);
    }
  }

  consignasActuales = elegidas;
  ultimaRondaIds = elegidas.map(x => x.id);

  renderLista(elegidas);
  await leerConsignasActuales();
}

function renderLista(arr){
  elLista.innerHTML = "";
  arr.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = c.texto;
    elLista.appendChild(li);
  });
  elListaBox.classList.remove("hidden");
  setStatus("Ronda lista.");
}

async function leerConsignasActuales(){
  if (!consignasActuales.length) return;

  isReading = true;
  setStatus("Escuchá...");

  for (let i=0; i<consignasActuales.length; i++){
    const n = i + 1;
    const t = consignasActuales[i].texto;
    // lectura ágil
    await speak(`${n}. ${t}`);
    await sleep(PAUSA_LECTURA_MS);
  }

  setStatus("Listo ✅");
  isReading = false;
}

function setStatus(msg){
  elStatus.textContent = msg;
}

function openModal(show){
  if (show) {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    sugMsg.className = "msg";
    sugMsg.textContent = "";
    sugTexto.focus();
  } else {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }
}

// ===== SUGERENCIAS (JSONP) =====
async function enviarSugerencia(){
  const texto = (sugTexto.value || "").trim();
  const categoria = (sugCategoria.value || "GENERAL").trim();

  sugMsg.className = "msg";
  sugMsg.textContent = "";

  if (texto.length < 3) {
    sugMsg.classList.add("err");
    sugMsg.textContent = "Escribí una consigna (mínimo 3 caracteres).";
    return;
  }

  btnSugSend.disabled = true;
  btnSugSend.textContent = "Enviando...";

  try{
    // JSONP: crea <script> y espera callback
    const res = await jsonp(SUGERENCIAS_API_URL, {
      action: "sugerir",
      texto,
      categoria
    }, 12000);

    // Esperamos {ok:true} o {status:"ok"} etc
    const ok = !!(res && (res.ok === true || res.status === "ok" || res.result === "ok"));

    if (ok) {
      sugMsg.className = "msg ok";
      sugMsg.textContent = "¡Gracias por la sugerencia! 🙌 La vamos a revisar.";
      sugTexto.value = "";
      setTimeout(() => openModal(false), 600);
    } else {
      sugMsg.className = "msg err";
      sugMsg.textContent = "No se pudo enviar. Revisá el endpoint /exec (ver explicación abajo).";
    }
  }catch(e){
    sugMsg.className = "msg err";
    sugMsg.textContent = "No se pudo enviar ahora 😕. Probá de nuevo en un momento.";
  }finally{
    btnSugSend.disabled = false;
    btnSugSend.textContent = "Enviar";
  }
}

function jsonp(url, params={}, timeoutMs=8000){
  return new Promise((resolve, reject) => {
    const cbName = "__cb_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    const sep = url.includes("?") ? "&" : "?";

    const query = new URLSearchParams({
      ...params,
      callback: cbName
    }).toString();

    let timer = setTimeout(() => {
      cleanup();
      reject(new Error("timeout"));
    }, timeoutMs);

    function cleanup(){
      if (timer) clearTimeout(timer);
      timer = null;
      try{ delete window[cbName]; }catch(e){}
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[cbName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("script error"));
    };

    script.src = url + sep + query;
    document.body.appendChild(script);
  });
}

// ===== UTIL =====
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

function pickRandomUnique(arr, count, avoidIds=[]){
  const avoidSet = new Set(avoidIds || []);
  const filtered = arr.filter(x => !avoidSet.has(x.id));
  const src = (filtered.length >= count) ? filtered : arr.slice(); // si no alcanza, permitimos repetir

  // shuffle simple
  for (let i = src.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [src[i], src[j]] = [src[j], src[i]];
  }

  return src.slice(0, Math.min(count, src.length));
}

function toggleFullscreen(){
  const doc = document;
  const el = document.documentElement;
  if (!doc.fullscreenElement) {
    el.requestFullscreen?.();
  } else {
    doc.exitFullscreen?.();
  }
}

// ===== SERVICE WORKER + UPDATE BANNER =====
let newSW = null;

function showUpdateBanner(){
  if (!updateBanner || !btnUpdateNow) return;
  updateBanner.classList.remove("hidden");
  btnUpdateNow.onclick = () => {
    if (newSW) newSW.postMessage({ type: "SKIP_WAITING" });
    location.reload();
  };
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try{
      const reg = await navigator.serviceWorker.register("./sw.js");

      // Si hay uno waiting, ya hay update
      if (reg.waiting) {
        newSW = reg.waiting;
        showUpdateBanner();
      }

      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;

        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            newSW = sw;
            showUpdateBanner();
          }
        });
      });

      // Opcional: chequea updates cada 5 min si la app queda abierta
      setInterval(() => reg.update(), 5 * 60 * 1000);

    }catch(e){
      // sin drama
    }
  });
}

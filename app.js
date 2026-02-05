/* ==========================
   DIEZ DE - app.js (FINAL)
   - PIN Adulto + 1 adulta por ronda
   - Música espera ON/OFF + fade + recuerda estado
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

// ====== DATA base (consignas.js) ======
let CONSIGNAS_GENERALES = Array.isArray(window.CONSIGNAS_GENERALES) ? window.CONSIGNAS_GENERALES : [];
let CONSIGNAS_ADULTO = Array.isArray(window.CONSIGNAS_ADULTO) ? window.CONSIGNAS_ADULTO : [];

// ====== UI ======
const btnIniciar = document.getElementById("btnIniciar");
const btnRepetir = document.getElementById("btnRepetir");
const btnTerminar = document.getElementById("btnTerminar");
const btnFullscreen = document.getElementById("btnFullscreen");
const btnAdulto = document.getElementById("btnAdulto");
const btnMusica = document.getElementById("btnMusica");

const estado = document.getElementById("estado");
const timerEl = document.getElementById("timer");
const vistaLectura = document.getElementById("vistaLectura");
const vistaRespuesta = document.getElementById("vistaRespuesta");
const listaEl = document.getElementById("listaConsignas");

const musicaFondo = document.getElementById("musicaFondo");

// Sugerencias (modal)
const btnSugerirAbrir = document.getElementById("btnSugerirAbrir");
const modalSugerencia = document.getElementById("modalSugerencia");
const btnSugerirCerrar = document.getElementById("btnSugerirCerrar");
const inputSugerencia = document.getElementById("inputSugerencia");
const selectCategoria = document.getElementById("selectCategoria");
const btnEnviarSugerencia = document.getElementById("btnEnviarSugerencia");
const sugerenciaMsg = document.getElementById("sugerenciaMsg");

// ====== STATE ======
let ronda = [];
let ultimaRondaIDs = [];
let timerId = null;
let wakeLock = null;

let modoAdultoActivo = false;
let musicaActiva = false;

let fadeInterval = null;

// ====== helpers ======
function show(el){ if(el) el.classList.remove("hidden"); }
function hide(el){ if(el) el.classList.add("hidden"); }
function limpiarTexto(t){ return String(t || "").replace(/\s+/g," ").trim(); }

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function cancelarVoz(){
  try{ if("speechSynthesis" in window) speechSynthesis.cancel(); }catch(e){}
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function hablar(texto){
  return new Promise(res=>{
    if(!("speechSynthesis" in window)){ res(); return; }
    const u = new SpeechSynthesisUtterance(limpiarTexto(texto));
    u.lang = "es-AR";
    u.rate = 1;
    u.onend = res;
    u.onerror = res;
    speechSynthesis.speak(u);
  });
}

function renderLectura(items){
  if(!listaEl) return;
  listaEl.innerHTML = "";
  items.forEach(c=>{
    const li = document.createElement("li");
    li.textContent = c.texto;
    listaEl.appendChild(li);
  });
}

// ====== WakeLock ======
async function activarWakeLock(){
  try{
    if("wakeLock" in navigator){
      wakeLock = await navigator.wakeLock.request("screen");
    }
  }catch(e){}
}
function liberarWakeLock(){
  try{
    if(wakeLock){
      wakeLock.release();
      wakeLock = null;
    }
  }catch(e){}
}

// ====== Fullscreen (opcional) ======
async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }else{
      await document.exitFullscreen();
    }
  }catch(e){}
}
function setBtnFullscreenUI(){
  if(!btnFullscreen) return;
  const enFS = !!document.fullscreenElement;
  btnFullscreen.innerHTML = `
    <span class="fs-ico" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M14 4h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M20 4l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 20H4v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M4 20l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </span>
    ${enFS ? "Salir Fullscreen" : "Fullscreen"}
  `;
}

// ====== Música (espera) + fade + recuerda estado ======
function setBtnMusicaUI(){
  if(!btnMusica) return;
  btnMusica.setAttribute("aria-pressed", musicaActiva ? "true" : "false");
  btnMusica.textContent = musicaActiva ? "🔊 Música" : "🎵 Música";
}

function fadeTo(target, ms = 350){
  if(!musicaFondo) return;
  clearInterval(fadeInterval);

  const start = typeof musicaFondo.volume === "number" ? musicaFondo.volume : 0;
  const steps = 18;
  const stepMs = Math.max(12, Math.floor(ms / steps));
  let i = 0;

  fadeInterval = setInterval(()=>{
    i++;
    const v = start + (target - start) * (i / steps);
    musicaFondo.volume = Math.max(0, Math.min(1, v));

    if(i >= steps){
      clearInterval(fadeInterval);
      fadeInterval = null;
      if(target === 0) musicaFondo.pause();
    }
  }, stepMs);
}

function playMusica(){
  if(!musicaFondo) return;
  musicaFondo.volume = 0;
  musicaFondo.play().catch(()=>{});
  fadeTo(0.25, 450);
}
function pauseMusica(){
  if(!musicaFondo) return;
  fadeTo(0, 250);
}

function toggleMusica(){
  musicaActiva = !musicaActiva;
  localStorage.setItem("diezde_musica", musicaActiva ? "1" : "0");
  setBtnMusicaUI();
  if(musicaActiva) playMusica();
  else pauseMusica();
}

function restoreMusicaPref(){
  musicaActiva = localStorage.getItem("diezde_musica") === "1";
  setBtnMusicaUI();
  // Ojo: por políticas del celu, solo va a sonar cuando el usuario toque algo alguna vez.
  // Igual lo dejamos listo.
}

// ====== Modo Adulto con PIN ======
function setAdultoUI(){
  if(!btnAdulto) return;
  btnAdulto.setAttribute("aria-pressed", modoAdultoActivo ? "true" : "false");
  btnAdulto.textContent = modoAdultoActivo ? "🔥 Adulto" : "🔒 Adulto";
}
function pedirPINyToggleAdulto(){
  const pin = prompt("Ingresá PIN para Modo Adulto:");
  if(pin === null) return;

  if(pin.trim() === ADULTO_PIN){
    modoAdultoActivo = !modoAdultoActivo;
    setAdultoUI();
    if(estado){
      estado.textContent = modoAdultoActivo
        ? "Modo Adulto ACTIVADO (1 por ronda)"
        : "Modo Adulto DESACTIVADO";
    }
  }else{
    if(estado) estado.textContent = "PIN incorrecto ❌";
  }
}

// ====== Selección ronda ======
function normalizarLista(base, categoria){
  return (Array.isArray(base)? base : [])
    .map(x => ({
      id: Number(x.id),
      texto: limpiarTexto(x.texto),
      categoria
    }))
    .filter(x => x.id && x.texto.length > 0);
}

function seleccionarRonda(){
  const generales = normalizarLista(CONSIGNAS_GENERALES, "GENERAL");
  const adultas = normalizarLista(CONSIGNAS_ADULTO, "ADULTO");

  const cantGeneral = modoAdultoActivo ? 9 : 10;
  const cantAdulto = modoAdultoActivo ? 1 : 0;

  let poolGeneral = generales.filter(c => !ultimaRondaIDs.includes(c.id));
  if(poolGeneral.length < cantGeneral) poolGeneral = generales;

  let seleccion = shuffle(poolGeneral).slice(0, cantGeneral);

  if(cantAdulto === 1 && adultas.length > 0){
    const una = shuffle(adultas).slice(0,1);
    seleccion = [...seleccion, ...una];
  }

  seleccion = shuffle(seleccion);
  ultimaRondaIDs = seleccion.map(c => c.id);
  return seleccion;
}

// ====== Timer ======
function detenerTimer(){
  if(timerId){
    clearInterval(timerId);
    timerId = null;
  }
}

function iniciarTimer(){
  detenerTimer();
  let t = TIEMPO_ESCRITURA;
  if(timerEl) timerEl.textContent = t;

  timerId = setInterval(()=>{
    t--;
    if(timerEl) timerEl.textContent = t;
    if(t <= 0){
      detenerTimer();
      terminarRonda();
    }
  }, 1000);
}

// ====== Flujo ======
async function iniciarRonda(){
  if(!Array.isArray(CONSIGNAS_GENERALES) || CONSIGNAS_GENERALES.length < 10){
    if(estado) estado.textContent = "Faltan consignas generales (revisá consignas.js)";
    return;
  }

  cancelarVoz();
  pauseMusica();

  await activarWakeLock();

  ronda = seleccionarRonda();
  renderLectura(ronda);

  show(vistaLectura);
  hide(vistaRespuesta);
  show(timerEl);
  hide(btnTerminar);

  if(estado) estado.textContent = "Escuchá…";

  for(let i=0;i<ronda.length;i++){
    await hablar(`${i+1}. ${ronda[i].texto}`);
    await sleep(PAUSA_LECTURA_MS);
  }

  await hablar("Repasamos");
  for(const c of ronda){
    await hablar(c.texto);
    await sleep(PAUSA_REPASO_MS);
  }

  hide(vistaLectura);
  show(vistaRespuesta);
  show(btnTerminar);
  if(estado) estado.textContent = "¡A escribir de memoria!";
  iniciarTimer();
}

function terminarRonda(){
  detenerTimer();
  cancelarVoz();

  hide(vistaRespuesta);
  show(vistaLectura);
  renderLectura(ronda);

  hide(btnTerminar);
  if(estado) estado.textContent = "Tiempo – corrigen respuestas";

  liberarWakeLock();

  if(musicaActiva) playMusica();
  hablar("Tiempo");
}

async function repetirConsignas(){
  if(!ronda || ronda.length === 0) return;
  cancelarVoz();
  pauseMusica();

  await hablar("Repasamos");
  for(const c of ronda){
    await hablar(c.texto);
    await sleep(PAUSA_REPASO_MS);
  }
}

// ====== JSONP (SIN CORS) ======
function jsonp(url, timeoutMs = 9000){
  return new Promise((resolve, reject)=>{
    const cb = `cb_${Date.now()}_${Math.floor(Math.random()*99999)}`;

    const cleanup = ()=>{
      try{ delete window[cb]; }catch(e){}
      if(script && script.parentNode) script.parentNode.removeChild(script);
      clearTimeout(to);
    };

    window[cb] = (data)=>{
      cleanup();
      resolve(data);
    };

    const script = document.createElement("script");
    script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + encodeURIComponent(cb);
    script.onerror = ()=>{
      cleanup();
      reject(new Error("jsonp_error"));
    };

    const to = setTimeout(()=>{
      cleanup();
      reject(new Error("jsonp_timeout"));
    }, timeoutMs);

    document.head.appendChild(script);
  });
}

// ====== Sugerencias ======
function abrirSugerencias(){
  if(!modalSugerencia) return;
  if(inputSugerencia) inputSugerencia.value = "";
  if(selectCategoria) selectCategoria.value = "GENERAL";
  if(sugerenciaMsg) { sugerenciaMsg.classList.add("hidden"); sugerenciaMsg.textContent=""; }
  show(modalSugerencia);
  setTimeout(()=>{ try{ inputSugerencia?.focus(); }catch(e){} }, 50);
}

function cerrarSugerencias(){
  hide(modalSugerencia);
}

function msgSugerencia(texto){
  if(!sugerenciaMsg) return;
  sugerenciaMsg.textContent = texto;
  sugerenciaMsg.classList.remove("hidden");
}

async function enviarSugerencia(){
  const texto = limpiarTexto(inputSugerencia?.value);
  const categoria = (selectCategoria?.value || "GENERAL").toUpperCase();

  if(texto.length < 4){
    msgSugerencia("Escribí una consigna un poquito más larga 🙂");
    return;
  }

  if(!SUGERENCIAS_API_URL || SUGERENCIAS_API_URL.includes("PEGAR_ACA")){
    msgSugerencia("Falta configurar la URL de sugerencias (Apps Script).");
    return;
  }

  msgSugerencia("Enviando…");

  const url =
    `${SUGERENCIAS_API_URL}?action=sugerir` +
    `&texto=${encodeURIComponent(texto)}` +
    `&categoria=${encodeURIComponent(categoria)}`;

  try{
    const data = await jsonp(url);
    if(data && data.ok){
      msgSugerencia("¡Listo! Te llegó para aprobar ✅");
      if(inputSugerencia) inputSugerencia.value = "";
    }else{
      msgSugerencia("No se pudo enviar. Probá otra vez.");
    }
  }catch(e){
    msgSugerencia("Error de conexión. Probá otra vez.");
  }
}

// ====== Cargar aprobadas ======
async function cargarAprobadas(){
  if(!SUGERENCIAS_API_URL || SUGERENCIAS_API_URL.includes("PEGAR_ACA")) return;

  try{
    const urlG = `${SUGERENCIAS_API_URL}?action=aprobadas&cat=GENERAL`;
    const urlA = `${SUGERENCIAS_API_URL}?action=aprobadas&cat=ADULTO`;

    const [g,a] = await Promise.all([
      jsonp(urlG).catch(()=>[]),
      jsonp(urlA).catch(()=>[])
    ]);

    // merge sin duplicar
    const baseG = new Map((CONSIGNAS_GENERALES||[]).map(x => [Number(x.id), x]));
    (Array.isArray(g)?g:[]).forEach(x=>{
      const id = Number(x.id);
      const texto = limpiarTexto(x.texto);
      if(id && texto && !baseG.has(id)) baseG.set(id, {id, texto});
    });
    CONSIGNAS_GENERALES = Array.from(baseG.values());

    const baseA = new Map((CONSIGNAS_ADULTO||[]).map(x => [Number(x.id), x]));
    (Array.isArray(a)?a:[]).forEach(x=>{
      const id = Number(x.id);
      const texto = limpiarTexto(x.texto);
      if(id && texto && !baseA.has(id)) baseA.set(id, {id, texto});
    });
    CONSIGNAS_ADULTO = Array.from(baseA.values());

  }catch(e){}
}

// ====== INIT ======
(function init(){
  if(timerEl) timerEl.textContent = TIEMPO_ESCRITURA;
  setAdultoUI();
  setBtnFullscreenUI();
  restoreMusicaPref();
  setBtnMusicaUI();

  // carga aprobadas al entrar
  cargarAprobadas();

  // modal: cerrar tocando el fondo
  modalSugerencia?.addEventListener("click", (ev)=>{
    if(ev.target === modalSugerencia) cerrarSugerencias();
  });
})();

// ====== EVENTS ======
btnIniciar?.addEventListener("click", iniciarRonda);
btnRepetir?.addEventListener("click", repetirConsignas);
btnTerminar?.addEventListener("click", terminarRonda);

btnAdulto?.addEventListener("click", pedirPINyToggleAdulto);

btnFullscreen?.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", setBtnFullscreenUI);

btnMusica?.addEventListener("click", toggleMusica);

// para que si el usuario ya dejó música ON, se active al primer toque en la pantalla
document.addEventListener("click", ()=>{
  if(musicaActiva && musicaFondo && musicaFondo.paused){
    playMusica();
  }
},{ once:true });

btnSugerirAbrir?.addEventListener("click", abrirSugerencias);
btnSugerirCerrar?.addEventListener("click", cerrarSugerencias);
btnEnviarSugerencia?.addEventListener("click", enviarSugerencia);

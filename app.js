/* ==========================
   DIEZ DE - app.js (NUEVO)
   - Consignas en consignas.js (window.CONSIGNAS_GENERALES / window.CONSIGNAS_ADULTO)
   - 10 por ronda
     * Normal: 10 generales
     * Adulto (PIN): 9 generales + 1 adulta
   - Evita repetir la ronda anterior si se puede
   - Fullscreen opcional (botón)
   - Botón terminar tiempo
   - WakeLock (mantener pantalla encendida)
========================== */

// ====== CONFIG ======
const TIEMPO_ESCRITURA = 90;
const PAUSA_LECTURA_MS = 900;
const PAUSA_REPASO_MS = 700;

// PIN modo adulto (cambiá acá)
const ADULTO_PIN = "1971";

// ====== DATA (desde consignas.js) ======
const consignasGenerales = Array.isArray(window.CONSIGNAS_GENERALES) ? window.CONSIGNAS_GENERALES : [];
const consignasAdulto = Array.isArray(window.CONSIGNAS_ADULTO) ? window.CONSIGNAS_ADULTO : [];

// ====== UI ======
const btnIniciar = document.getElementById("btnIniciar");
const btnRepetir = document.getElementById("btnRepetir");
const btnTerminar = document.getElementById("btnTerminar");
const btnFullscreen = document.getElementById("btnFullscreen");
const btnAdulto = document.getElementById("btnAdulto");

const estado = document.getElementById("estado");
const timerEl = document.getElementById("timer");
const vistaLectura = document.getElementById("vistaLectura");
const vistaRespuesta = document.getElementById("vistaRespuesta");
const listaEl = document.getElementById("listaConsignas");

// ====== STATE ======
let ronda = [];
let ultimaRondaIDs = [];
let timerId = null;
let wakeLock = null;
let modoAdultoActivo = false;

// ====== DOM helpers ======
function show(el){ if(el) el.classList.remove("hidden"); }
function hide(el){ if(el) el.classList.add("hidden"); }

// ====== Seguridad básica ======
function limpiarTexto(t){
  return String(t || "").replace(/\s+/g, " ").trim();
}

// ====== Shuffle Fisher–Yates ======
function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ====== Render ======
function renderLectura(items){
  if(!listaEl) return;
  listaEl.innerHTML = "";
  items.forEach(c=>{
    const li = document.createElement("li");
    li.textContent = limpiarTexto(c.texto);
    listaEl.appendChild(li);
  });
}

// ====== Selección de ronda ======
function seleccionarRonda(){
  const generales = consignasGenerales
    .filter(c => limpiarTexto(c.texto).length > 0)
    .map(c => ({ id: c.id, texto: limpiarTexto(c.texto), categoria: "GENERAL" }));

  const adultas = consignasAdulto
    .filter(c => limpiarTexto(c.texto).length > 0)
    .map(c => ({ id: c.id, texto: limpiarTexto(c.texto), categoria: "ADULTO" }));

  const cantGeneral = modoAdultoActivo ? 9 : 10;
  const cantAdulto = modoAdultoActivo ? 1 : 0;

  // pool sin repetir la ronda anterior (si alcanza)
  let poolGeneral = generales.filter(c => !ultimaRondaIDs.includes(c.id));
  if(poolGeneral.length < cantGeneral){
    poolGeneral = generales;
  }

  let seleccion = shuffle(poolGeneral).slice(0, cantGeneral);

  if(cantAdulto === 1 && adultas.length > 0){
    // 1 adulta al azar
    const una = shuffle(adultas).slice(0, 1);
    seleccion = [...seleccion, ...una];
  }

  // Mezclar orden final
  seleccion = shuffle(seleccion);

  // guardar ids de esta ronda para evitar repetir
  ultimaRondaIDs = seleccion.map(c => c.id);

  return seleccion;
}

// ====== VOZ ======
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function cancelarVoz(){
  try{
    if("speechSynthesis" in window) speechSynthesis.cancel();
  }catch(e){}
}

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

// ====== Fullscreen opcional ======
function setBtnFullscreenUI(){
  if(!btnFullscreen) return;

  const enFS = !!document.fullscreenElement;

  // Reconstruyo contenido para mantener iconito siempre
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

async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }else{
      await document.exitFullscreen();
    }
  }catch(e){}
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

// ====== TIMER ======
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

// ====== Flujo del juego ======
function resetUIParaInicio(){
  hide(vistaLectura);
  hide(vistaRespuesta);
  hide(timerEl);
  hide(btnTerminar);
}

async function iniciarRonda(){
  // Validación básica: si no hay consignas
  if(consignasGenerales.length < 10){
    if(estado) estado.textContent = "Faltan consignas generales (revisá consignas.js)";
    return;
  }

  cancelarVoz();
  await activarWakeLock();

  ronda = seleccionarRonda();
  renderLectura(ronda);

  show(vistaLectura);
  hide(vistaRespuesta);
  show(timerEl);
  hide(btnTerminar);

  if(estado) estado.textContent = "Escuchá…";

  // Lectura numerada
  for(let i = 0; i < ronda.length; i++){
    await hablar(`${i+1}. ${ronda[i].texto}`);
    await sleep(PAUSA_LECTURA_MS);
  }

  // Repaso
  await hablar("Repasamos");
  for(const c of ronda){
    await hablar(c.texto);
    await sleep(PAUSA_REPASO_MS);
  }

  // Pasar a escritura
  hide(vistaLectura);
  show(vistaRespuesta);
  show(btnTerminar);
  if(estado) estado.textContent = "¡A escribir de memoria!";
  iniciarTimer();
}

function terminarRonda(){
  // corta timer y voz
  detenerTimer();
  cancelarVoz();

  // Mostrar consignas para corregir
  hide(vistaRespuesta);
  show(vistaLectura);
  renderLectura(ronda);

  hide(btnTerminar);
  if(estado) estado.textContent = "Tiempo – corrigen respuestas";

  liberarWakeLock();
  hablar("Tiempo");
}

async function repetirConsignas(){
  if(!ronda || ronda.length === 0) return;

  // Solo repetir si estamos en lectura (porque si están escribiendo, sería trampa)
  // Igual lo dejamos habilitado, pero sin mostrar consignas: solo voz.
  cancelarVoz();

  await hablar("Repasamos");
  for(const c of ronda){
    await hablar(c.texto);
    await sleep(PAUSA_REPASO_MS);
  }
}

// ====== INIT ======
(function init(){
  // Estado inicial
  if(estado) estado.textContent = "Listos para jugar";
  if(timerEl) timerEl.textContent = TIEMPO_ESCRITURA;

  setAdultoUI();
  setBtnFullscreenUI();
  resetUIParaInicio();
  show(vistaLectura); // opcional: si querés empezar sin panel, sacalo
  hide(vistaLectura);
})();

// ====== EVENTS ======
if(btnIniciar) btnIniciar.addEventListener("click", iniciarRonda);
if(btnRepetir) btnRepetir.addEventListener("click", repetirConsignas);
if(btnTerminar) btnTerminar.addEventListener("click", terminarRonda);

if(btnAdulto) btnAdulto.addEventListener("click", pedirPINyToggleAdulto);

if(btnFullscreen){
  btnFullscreen.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", setBtnFullscreenUI);
}

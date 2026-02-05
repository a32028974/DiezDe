/* ==========================
   DIEZ COSAS - APP.JS
   - Generales: 180
   - Adultas: (suaves) opcional con PIN
   - 10 por ronda (9 general + 1 adulta si está activo)
   - Evita repetir la ronda anterior (si hay suficientes)
   - Fullscreen opcional (botón)
   - Botón terminar tiempo
========================== */

// ====== CONFIG ======
const TIEMPO_ESCRITURA = 80;
const PAUSA_LECTURA_MS = 800;
const PAUSA_REPASO_MS = 620;

// PIN modo adulto (cambiá acá si querés)
const ADULTO_PIN = "1971";

// ====== DATA (180 GENERALES) ======
const consignas = [
  { id: 1, texto: "Un color", categoria: "GENERAL" },
  { id: 2, texto: "Un animal", categoria: "GENERAL" },
  { id: 3, texto: "Algo que esté en la cocina", categoria: "GENERAL" },
  { id: 4, texto: "Algo que tenga ruedas", categoria: "GENERAL" },
  { id: 5, texto: "Una fruta", categoria: "GENERAL" },
  { id: 6, texto: "Una prenda de vestir", categoria: "GENERAL" },
  { id: 7, texto: "Algo que se use cuando llueve", categoria: "GENERAL" },
  { id: 8, texto: "Algo que se pueda guardar", categoria: "GENERAL" },
  { id: 9, texto: "Algo que se rompa fácil", categoria: "GENERAL" },
  { id: 10, texto: "Una bebida", categoria: "GENERAL" },

  { id: 11, texto: "Una ciudad", categoria: "GENERAL" },
  { id: 12, texto: "Un país", categoria: "GENERAL" },
  { id: 13, texto: "Un famoso", categoria: "GENERAL" },
  { id: 14, texto: "Un deporte", categoria: "GENERAL" },
  { id: 15, texto: "Un juego", categoria: "GENERAL" },
  { id: 16, texto: "Una marca", categoria: "GENERAL" },
  { id: 17, texto: "Un vehículo", categoria: "GENERAL" },
  { id: 18, texto: "Un medio de transporte", categoria: "GENERAL" },
  { id: 19, texto: "Algo que vuele", categoria: "GENERAL" },
  { id: 20, texto: "Algo que flote", categoria: "GENERAL" },

  { id: 21, texto: "Algo que se encuentre en el baño", categoria: "GENERAL" },
  { id: 22, texto: "Algo que se encuentre en un dormitorio", categoria: "GENERAL" },
  { id: 23, texto: "Algo que se encuentre en una oficina", categoria: "GENERAL" },
  { id: 24, texto: "Algo que se encuentre en una escuela", categoria: "GENERAL" },
  { id: 25, texto: "Algo que se encuentre en una plaza", categoria: "GENERAL" },
  { id: 26, texto: "Algo que se encuentre en una farmacia", categoria: "GENERAL" },
  { id: 27, texto: "Algo que se encuentre en un supermercado", categoria: "GENERAL" },
  { id: 28, texto: "Algo que se encuentre en un hospital", categoria: "GENERAL" },
  { id: 29, texto: "Algo que se encuentre en una ferretería", categoria: "GENERAL" },
  { id: 30, texto: "Algo que se encuentre en una librería", categoria: "GENERAL" },

  { id: 31, texto: "Un objeto de vidrio", categoria: "GENERAL" },
  { id: 32, texto: "Un objeto de madera", categoria: "GENERAL" },
  { id: 33, texto: "Un objeto de metal", categoria: "GENERAL" },
  { id: 34, texto: "Un objeto de plástico", categoria: "GENERAL" },
  { id: 35, texto: "Un objeto de tela", categoria: "GENERAL" },
  { id: 36, texto: "Algo redondo", categoria: "GENERAL" },
  { id: 37, texto: "Algo cuadrado", categoria: "GENERAL" },
  { id: 38, texto: "Algo que tenga botones", categoria: "GENERAL" },
  { id: 39, texto: "Algo que tenga pantalla", categoria: "GENERAL" },
  { id: 40, texto: "Algo que tenga cable", categoria: "GENERAL" },

  { id: 41, texto: "Un electrodoméstico", categoria: "GENERAL" },
  { id: 42, texto: "Un mueble", categoria: "GENERAL" },
  { id: 43, texto: "Algo que se enchufe", categoria: "GENERAL" },
  { id: 44, texto: "Algo que use pilas", categoria: "GENERAL" },
  { id: 45, texto: "Algo que haga ruido", categoria: "GENERAL" },
  { id: 46, texto: "Algo que huela rico", categoria: "GENERAL" },
  { id: 47, texto: "Algo que huela feo", categoria: "GENERAL" },
  { id: 48, texto: "Algo frío", categoria: "GENERAL" },
  { id: 49, texto: "Algo caliente", categoria: "GENERAL" },
  { id: 50, texto: "Algo dulce", categoria: "GENERAL" },

  { id: 51, texto: "Algo salado", categoria: "GENERAL" },
  { id: 52, texto: "Un postre", categoria: "GENERAL" },
  { id: 53, texto: "Una comida", categoria: "GENERAL" },
  { id: 54, texto: "Una verdura", categoria: "GENERAL" },
  { id: 55, texto: "Un condimento", categoria: "GENERAL" },
  { id: 56, texto: "Una salsa", categoria: "GENERAL" },
  { id: 57, texto: "Algo que se come con cuchara", categoria: "GENERAL" },
  { id: 58, texto: "Algo que se come con la mano", categoria: "GENERAL" },
  { id: 59, texto: "Algo que se corta", categoria: "GENERAL" },
  { id: 60, texto: "Algo que se pela", categoria: "GENERAL" },

  { id: 61, texto: "Algo que se derrite", categoria: "GENERAL" },
  { id: 62, texto: "Algo que se congela", categoria: "GENERAL" },
  { id: 63, texto: "Algo que se hornea", categoria: "GENERAL" },
  { id: 64, texto: "Algo que se hierve", categoria: "GENERAL" },
  { id: 65, texto: "Algo que se fríe", categoria: "GENERAL" },
  { id: 66, texto: "Algo que sea pegajoso", categoria: "GENERAL" },
  { id: 67, texto: "Algo que sea áspero", categoria: "GENERAL" },
  { id: 68, texto: "Algo que sea suave", categoria: "GENERAL" },
  { id: 69, texto: "Algo que sea pesado", categoria: "GENERAL" },
  { id: 70, texto: "Algo liviano", categoria: "GENERAL" },

  { id: 71, texto: "Un instrumento musical", categoria: "GENERAL" },
  { id: 72, texto: "Una canción", categoria: "GENERAL" },
  { id: 73, texto: "Un género musical", categoria: "GENERAL" },
  { id: 74, texto: "Un artista", categoria: "GENERAL" },
  { id: 75, texto: "Una película", categoria: "GENERAL" },
  { id: 76, texto: "Una serie", categoria: "GENERAL" },
  { id: 77, texto: "Un personaje", categoria: "GENERAL" },
  { id: 78, texto: "Un libro", categoria: "GENERAL" },
  { id: 79, texto: "Un autor", categoria: "GENERAL" },
  { id: 80, texto: "Una app", categoria: "GENERAL" },

  { id: 81, texto: "Una red social", categoria: "GENERAL" },
  { id: 82, texto: "Un sitio web", categoria: "GENERAL" },
  { id: 83, texto: "Una palabra en inglés", categoria: "GENERAL" },
  { id: 84, texto: "Una palabra en francés", categoria: "GENERAL" },
  { id: 85, texto: "Una profesión", categoria: "GENERAL" },
  { id: 86, texto: "Un oficio", categoria: "GENERAL" },
  { id: 87, texto: "Algo que se haga en vacaciones", categoria: "GENERAL" },
  { id: 88, texto: "Algo que se haga en un cumpleaños", categoria: "GENERAL" },
  { id: 89, texto: "Algo que se haga en una fiesta", categoria: "GENERAL" },
  { id: 90, texto: "Algo que se haga un domingo", categoria: "GENERAL" },

  { id: 91, texto: "Algo que se haga a la mañana", categoria: "GENERAL" },
  { id: 92, texto: "Algo que se haga a la noche", categoria: "GENERAL" },
  { id: 93, texto: "Algo que te da sueño", categoria: "GENERAL" },
  { id: 94, texto: "Algo que te da energía", categoria: "GENERAL" },
  { id: 95, texto: "Algo que te da miedo", categoria: "GENERAL" },
  { id: 96, texto: "Algo que te hace reír", categoria: "GENERAL" },
  { id: 97, texto: "Algo que te hace llorar", categoria: "GENERAL" },
  { id: 98, texto: "Algo que te da vergüenza", categoria: "GENERAL" },
  { id: 99, texto: "Algo que te da orgullo", categoria: "GENERAL" },
  { id: 100, texto: "Algo que te enoja", categoria: "GENERAL" },

  { id: 101, texto: "Un animal marino", categoria: "GENERAL" },
  { id: 102, texto: "Un animal del campo", categoria: "GENERAL" },
  { id: 103, texto: "Un ave", categoria: "GENERAL" },
  { id: 104, texto: "Un insecto", categoria: "GENERAL" },
  { id: 105, texto: "Un árbol", categoria: "GENERAL" },
  { id: 106, texto: "Una flor", categoria: "GENERAL" },
  { id: 107, texto: "Una planta", categoria: "GENERAL" },
  { id: 108, texto: "Algo que haya en la playa", categoria: "GENERAL" },
  { id: 109, texto: "Algo que haya en la montaña", categoria: "GENERAL" },
  { id: 110, texto: "Algo que haya en el río", categoria: "GENERAL" },

  { id: 111, texto: "Algo que haya en el cielo", categoria: "GENERAL" },
  { id: 112, texto: "Algo que haya en el espacio", categoria: "GENERAL" },
  { id: 113, texto: "Un planeta", categoria: "GENERAL" },
  { id: 114, texto: "Una estrella", categoria: "GENERAL" },
  { id: 115, texto: "Un fenómeno del clima", categoria: "GENERAL" },
  { id: 116, texto: "Algo que se use en invierno", categoria: "GENERAL" },
  { id: 117, texto: "Algo que se use en verano", categoria: "GENERAL" },
  { id: 118, texto: "Algo que se use en otoño", categoria: "GENERAL" },
  { id: 119, texto: "Algo que se use en primavera", categoria: "GENERAL" },
  { id: 120, texto: "Algo que se use para limpiar", categoria: "GENERAL" },

  { id: 121, texto: "Algo que se use para cocinar", categoria: "GENERAL" },
  { id: 122, texto: "Algo que se use para escribir", categoria: "GENERAL" },
  { id: 123, texto: "Algo que se use para pintar", categoria: "GENERAL" },
  { id: 124, texto: "Algo que se use para medir", categoria: "GENERAL" },
  { id: 125, texto: "Algo que se use para cortar", categoria: "GENERAL" },
  { id: 126, texto: "Algo que se use para pegar", categoria: "GENERAL" },
  { id: 127, texto: "Algo que se use para atornillar", categoria: "GENERAL" },
  { id: 128, texto: "Algo que se use para coser", categoria: "GENERAL" },
  { id: 129, texto: "Algo que se use para secar", categoria: "GENERAL" },
  { id: 130, texto: "Algo que se use para protegerse", categoria: "GENERAL" },

  { id: 131, texto: "Un animal que tenga manchas", categoria: "GENERAL" },
  { id: 132, texto: "Un animal que tenga rayas", categoria: "GENERAL" },
  { id: 133, texto: "Un animal que salte", categoria: "GENERAL" },
  { id: 134, texto: "Un animal que sea rápido", categoria: "GENERAL" },
  { id: 135, texto: "Un animal que sea lento", categoria: "GENERAL" },
  { id: 136, texto: "Algo que se encuentre en un auto", categoria: "GENERAL" },
  { id: 137, texto: "Algo que se encuentre en un colectivo", categoria: "GENERAL" },
  { id: 138, texto: "Algo que se encuentre en un tren", categoria: "GENERAL" },
  { id: 139, texto: "Algo que se encuentre en un avión", categoria: "GENERAL" },
  { id: 140, texto: "Algo que se encuentre en una estación de servicio", categoria: "GENERAL" },

  { id: 141, texto: "Algo que sea transparente", categoria: "GENERAL" },
  { id: 142, texto: "Algo que sea brillante", categoria: "GENERAL" },
  { id: 143, texto: "Algo que sea oscuro", categoria: "GENERAL" },
  { id: 144, texto: "Algo que sea colorido", categoria: "GENERAL" },
  { id: 145, texto: "Algo que sea caro", categoria: "GENERAL" },
  { id: 146, texto: "Algo que sea barato", categoria: "GENERAL" },
  { id: 147, texto: "Algo que sea nuevo", categoria: "GENERAL" },
  { id: 148, texto: "Algo que sea viejo", categoria: "GENERAL" },
  { id: 149, texto: "Algo que sea frágil", categoria: "GENERAL" },
  { id: 150, texto: "Algo que sea resistente", categoria: "GENERAL" },

  { id: 151, texto: "Un objeto que se use todos los días", categoria: "GENERAL" },
  { id: 152, texto: "Un objeto que uses una vez por mes", categoria: "GENERAL" },
  { id: 153, texto: "Algo que tenga números", categoria: "GENERAL" },
  { id: 154, texto: "Algo que tenga letras", categoria: "GENERAL" },
  { id: 155, texto: "Algo que se encuentre en una mochila", categoria: "GENERAL" },
  { id: 156, texto: "Algo que se encuentre en una cartera", categoria: "GENERAL" },
  { id: 157, texto: "Algo que se encuentre en una heladera", categoria: "GENERAL" },
  { id: 158, texto: "Algo que se encuentre en un freezer", categoria: "GENERAL" },
  { id: 159, texto: "Algo que se encuentre en un placard", categoria: "GENERAL" },
  { id: 160, texto: "Algo que se encuentre en un cajón", categoria: "GENERAL" },

  { id: 161, texto: "Una herramienta", categoria: "GENERAL" },
  { id: 162, texto: "Un objeto que se use en un taller", categoria: "GENERAL" },
  { id: 163, texto: "Algo que se use para arreglar algo", categoria: "GENERAL" },
  { id: 164, texto: "Algo que se use para decorar", categoria: "GENERAL" },
  { id: 165, texto: "Algo que se use para transportar", categoria: "GENERAL" },
  { id: 166, texto: "Algo que se use para jugar", categoria: "GENERAL" },
  { id: 167, texto: "Algo que se use para estudiar", categoria: "GENERAL" },
  { id: 168, texto: "Algo que se use para trabajar", categoria: "GENERAL" },
  { id: 169, texto: "Algo que se use para hacer ejercicio", categoria: "GENERAL" },
  { id: 170, texto: "Algo que se use para descansar", categoria: "GENERAL" },

  { id: 171, texto: "Un lugar turístico", categoria: "GENERAL" },
  { id: 172, texto: "Un edificio famoso", categoria: "GENERAL" },
  { id: 173, texto: "Un monumento", categoria: "GENERAL" },
  { id: 174, texto: "Una comida típica", categoria: "GENERAL" },
  { id: 175, texto: "Una bebida caliente", categoria: "GENERAL" },
  { id: 176, texto: "Una bebida fría", categoria: "GENERAL" },
  { id: 177, texto: "Algo que se use en un cumpleaños infantil", categoria: "GENERAL" },
  { id: 178, texto: "Algo que se use para sacar fotos", categoria: "GENERAL" },
  { id: 179, texto: "Algo que se use para escuchar música", categoria: "GENERAL" },
  { id: 180, texto: "Algo que se use para llamar por teléfono", categoria: "GENERAL" },
];

// ====== ADULTAS (suaves, no zarpadas) ======
const consignasAdulto = [
  { id: 1001, texto: "Algo que te da vergüenza admitir", categoria: "ADULTO" },
  { id: 1002, texto: "Una excusa típica para zafar", categoria: "ADULTO" },
  { id: 1003, texto: "Un lugar del cuerpo donde darías un beso", categoria: "ADULTO" },
  { id: 1004, texto: "Una frase de chamuyo", categoria: "ADULTO" },
  { id: 1005, texto: "Una cosa que harías si nadie se entera", categoria: "ADULTO" },
  { id: 1006, texto: "Algo que te resulta sexy (sin decir personas)", categoria: "ADULTO" },
  { id: 1007, texto: "Una situación incómoda de pareja", categoria: "ADULTO" },
  { id: 1008, texto: "Un secreto “chiquito”", categoria: "ADULTO" },
  { id: 1009, texto: "Algo que te pone nervioso/a", categoria: "ADULTO" },
  { id: 1010, texto: "Una posición en la cama", categoria: "ADULTO" },
];

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

// ====== HELPERS ======
function show(el){ if(el) el.classList.remove("hidden"); }
function hide(el){ if(el) el.classList.add("hidden"); }

function setAdultoUI(){
  if(!btnAdulto) return;
  btnAdulto.setAttribute("aria-pressed", modoAdultoActivo ? "true" : "false");
  btnAdulto.textContent = modoAdultoActivo ? "🔥 Adulto" : "🔒 Adulto";
}

// Fisher–Yates shuffle
function shuffle(arr){
  const a = [...arr];
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seleccionarRonda(){
  const generales = consignas.filter(c => c.categoria === "GENERAL");

  // Queremos 10 total: si adulto activo => 9 general + 1 adulto
  const cantGeneral = modoAdultoActivo ? 9 : 10;
  const cantAdulto = modoAdultoActivo ? 1 : 0;

  // Evitar repetir la ronda anterior si se puede
  let poolGeneral = generales.filter(c => !ultimaRondaIDs.includes(c.id));
  if(poolGeneral.length < cantGeneral){
    poolGeneral = generales;
  }

  let seleccion = shuffle(poolGeneral).slice(0, cantGeneral);

  if(cantAdulto === 1){
    const poolAdulto = consignasAdulto;
    const unoAdulto = shuffle(poolAdulto).slice(0,1);
    seleccion = [...seleccion, ...unoAdulto];
  }

  seleccion = shuffle(seleccion);

  ultimaRondaIDs = seleccion.map(c => c.id);
  return seleccion;
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

// ====== VOZ ======
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function hablar(texto){
  return new Promise(res=>{
    if(!("speechSynthesis" in window)){ res(); return; }
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-AR";
    u.rate = 1;
    u.onend = res;
    speechSynthesis.speak(u);
  });
}

// ====== FULLSCREEN (OPCIONAL) ======
async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){
      await document.documentElement.requestFullscreen();
    }else{
      await document.exitFullscreen();
    }
  }catch(e){}
}

function actualizarTextoFS(){
  if(!btnFullscreen) return;
  const enFS = !!document.fullscreenElement;
  btnFullscreen.textContent = enFS ? "Salir Fullscreen" : "Fullscreen";
  // mantener icono: lo regenero simple
  const span = document.createElement("span");
  span.className = "fs-ico";
  span.setAttribute("aria-hidden","true");
  span.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M14 4h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M20 4l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M10 20H4v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M4 20l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  btnFullscreen.prepend(span);
}

// ====== WAKELOCK ======
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

// ====== TIMER ======
function iniciarTimer(){
  let t = TIEMPO_ESCRITURA;
  if(timerEl) timerEl.textContent = t;

  if(timerId) clearInterval(timerId);

  timerId = setInterval(()=>{
    t--;
    if(timerEl) timerEl.textContent = t;

    if(t <= 0){
      clearInterval(timerId);
      timerId = null;
      terminar();
    }
  }, 1000);
}

// ====== FLUJO ======
async function iniciarRonda(){
  if("speechSynthesis" in window) speechSynthesis.cancel();

  activarWakeLock();

  ronda = seleccionarRonda();
  renderLectura(ronda);

  show(vistaLectura);
  hide(vistaRespuesta);
  show(timerEl);
  hide(btnTerminar);
  if(estado) estado.textContent = "Escuchá…";

  for(let i = 0; i < ronda.length; i++){
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

function terminar(){
  // cortar timer si estaba corriendo
  if(timerId){
    clearInterval(timerId);
    timerId = null;
  }

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
  await hablar("Repasamos");
  for(const c of ronda){
    await hablar(c.texto);
    await sleep(PAUSA_REPASO_MS);
  }
}

// ====== MODO ADULTO CON PIN ======
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

// ====== EVENTS ======
if(btnIniciar) btnIniciar.addEventListener("click", iniciarRonda);
if(btnRepetir) btnRepetir.addEventListener("click", repetirConsignas);

if(btnTerminar){
  btnTerminar.addEventListener("click", terminar);
}

if(btnFullscreen){
  btnFullscreen.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", actualizarTextoFS);
  actualizarTextoFS();
}

if(btnAdulto){
  btnAdulto.addEventListener("click", pedirPINyToggleAdulto);
  setAdultoUI();
}

/* =========================
   DIEZ COSAS - app.js
   - Muestra consignas durante lectura
   - Luego las oculta durante escritura (en papel)
   - Voz: 1ra pasada con números + pausas ~2s
   - Dice "Repasamos..." y repite sin números + pausas ~1s
   - Luego arranca timer
========================= */

// ====== DATA (PEGAR ACÁ LAS 200 DESPUÉS) ======
const consignas = [
  { id: 1, texto: "Un color", categoria: "GENERAL" },
  { id: 2, texto: "Un animal", categoria: "GENERAL" },
  { id: 3, texto: "Algo que esté en la cocina", categoria: "GENERAL" },
  { id: 4, texto: "Algo que tenga ruedas", categoria: "GENERAL" },
  { id: 5, texto: "Una fruta", categoria: "GENERAL" },
  { id: 6, texto: "Una prenda de vestir", categoria: "GENERAL" },
  { id: 7, texto: "Algo que se use cuando llueve", categoria: "GENERAL" },
  { id: 8, texto: "Algo que se pueda guardar", categoria: "GENERAL" },
  { id: 9, texto: "Algo que se rompe fácil", categoria: "GENERAL" },
  { id: 10, texto: "Una bebida", categoria: "GENERAL" },
  { id: 181, texto: "Un juguete sexual", categoria: "ADULTO" },
  { id: 188, texto: "Una posición en la cama", categoria: "ADULTO" },
];

// ====== CONFIG ======
const TIEMPO_ESCRITURA = 60;     // segundos
const PAUSA_LECTURA_MS = 2000;   // entre consignas con números
const PAUSA_REPASO_MS = 1000;    // entre consignas sin números

// ====== UI ======
const modoAdulto = document.getElementById("modoAdulto");
const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");

const estado = document.getElementById("estado");
const timerEl = document.getElementById("timer");

const vistaLectura = document.getElementById("vistaLectura");
const vistaRespuesta = document.getElementById("vistaRespuesta");
const finalEl = document.getElementById("final");

const listaEl = document.getElementById("listaConsignas");

let ronda = [];
let timerId = null;
let tiempo = TIEMPO_ESCRITURA;
let enEjecucion = false;

// ====== helpers UI ======
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function seleccionar10(){
  const pool = consignas.filter(c => {
    if (modoAdulto.checked) return true;
    return c.categoria === "GENERAL";
  });

  // seguridad: si hay menos de 10, toma lo que haya
  return shuffle(pool).slice(0, 10);
}

function renderLectura(items){
  listaEl.innerHTML = "";
  items.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = c.texto;
    listaEl.appendChild(li);
  });
}

function resetUI(){
  hide(vistaLectura);
  hide(vistaRespuesta);
  hide(finalEl);
  hide(timerEl);
  estado.textContent = "Listos para jugar";

  if (timerId) clearInterval(timerId);
  timerId = null;

  // cortar voz si estaba hablando
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  enEjecucion = false;
}

// ====== VOZ (Text-to-Speech) ======
function sleep(ms){
  return new Promise(res => setTimeout(res, ms));
}

function getSpanishVoice(){
  if (!("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices() || [];

  // Prioridad: voces es-AR / es-ES / es-*
  const prefer = [
    v => v.lang && v.lang.toLowerCase().startsWith("es-ar"),
    v => v.lang && v.lang.toLowerCase().startsWith("es-es"),
    v => v.lang && v.lang.toLowerCase().startsWith("es"),
  ];

  for (const rule of prefer){
    const found = voices.find(rule);
    if (found) return found;
  }
  return voices[0] || null;
}

function hablar(texto, {rate=1, pitch=1, volume=1} = {}){
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      // si no hay voz, resolvemos igual
      resolve();
      return;
    }

    const u = new SpeechSynthesisUtterance(texto);
    const voice = getSpanishVoice();
    if (voice) u.voice = voice;

    u.lang = (voice && voice.lang) ? voice.lang : "es-AR";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;

    u.onend = () => resolve();
    u.onerror = () => resolve();

    window.speechSynthesis.speak(u);
  });
}

// ====== TIMER ======
function iniciarTimer(segundos){
  tiempo = segundos;
  timerEl.textContent = tiempo;

  timerId = setInterval(() => {
    tiempo--;
    timerEl.textContent = tiempo;

    if (tiempo <= 0){
      clearInterval(timerId);
      timerId = null;
      terminar();
    }
  }, 1000);
}

// ====== FLUJO PRINCIPAL ======
async function iniciarRonda(){
  if (enEjecucion) return; // evita doble click
  enEjecucion = true;

  // Reset + preparar ronda
  resetUI();
  enEjecucion = true;

  ronda = seleccionar10();

  // Vista lectura (SE VE)
  show(vistaLectura);
  renderLectura(ronda);

  hide(vistaRespuesta);
  hide(finalEl);
  hide(timerEl);

  estado.textContent = "Escuchá… (se lee en voz alta)";

  // IMPORTANTE:
  // en Chrome/Android la voz suele requerir gesto del usuario (click) => ok, porque sale del botón.
  // También hay veces que getVoices() llega tarde:
  if ("speechSynthesis" in window) {
    // fuerza carga de voces (algunos navegadores las cargan async)
    window.speechSynthesis.getVoices();
  }

  // ===== 1RA PASADA: con números + pausa ~2s =====
  for (let i = 0; i < ronda.length; i++){
    const t = `${i+1}. ${ronda[i].texto}`;
    await hablar(t, { rate: 1, pitch: 1 });
    await sleep(PAUSA_LECTURA_MS);
  }

  // ===== “Repasamos…” =====
  await hablar("Repasamos…", { rate: 1, pitch: 1 });
  await sleep(400);

  // ===== REPASO: sin números + pausa ~1s =====
  for (let i = 0; i < ronda.length; i++){
    await hablar(ronda[i].texto, { rate: 1.02, pitch: 1 });
    await sleep(PAUSA_REPASO_MS);
  }

  // ===== PASAR A ESCRITURA: OCULTAR CONSIGNAS =====
  hide(vistaLectura);
  show(vistaRespuesta);
  show(timerEl);

  estado.textContent = "¡A escribir de memoria!";
  iniciarTimer(TIEMPO_ESCRITURA);

  enEjecucion = false;
}

function terminar(){
  // Oculta escritura + timer
  hide(vistaRespuesta);
  hide(timerEl);

  // Mostrar final
  show(finalEl);
  estado.textContent = "Tiempo terminado";

  // corta voz por las dudas
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// ====== EVENTOS ======
btnIniciar.addEventListener("click", iniciarRonda);
btnReiniciar.addEventListener("click", iniciarRonda);

// Init
resetUI();

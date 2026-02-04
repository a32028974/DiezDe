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
  // ===== GENERAL (1–170) =====
  {id:1,texto:"Un color",categoria:"GENERAL"},
  {id:2,texto:"Un animal",categoria:"GENERAL"},
  {id:3,texto:"Una fruta",categoria:"GENERAL"},
  {id:4,texto:"Una verdura",categoria:"GENERAL"},
  {id:5,texto:"Algo que se come",categoria:"GENERAL"},
  {id:6,texto:"Algo que se toma",categoria:"GENERAL"},
  {id:7,texto:"Algo que esté en una casa",categoria:"GENERAL"},
  {id:8,texto:"Algo que esté en la cocina",categoria:"GENERAL"},
  {id:9,texto:"Algo que esté en el baño",categoria:"GENERAL"},
  {id:10,texto:"Algo que esté en el dormitorio",categoria:"GENERAL"},
  {id:11,texto:"Algo que esté en la heladera",categoria:"GENERAL"},
  {id:12,texto:"Algo que tenga ruedas",categoria:"GENERAL"},
  {id:13,texto:"Algo que vuele",categoria:"GENERAL"},
  {id:14,texto:"Algo que nade",categoria:"GENERAL"},
  {id:15,texto:"Algo que se use para escribir",categoria:"GENERAL"},
  {id:16,texto:"Algo que se use para dibujar",categoria:"GENERAL"},
  {id:17,texto:"Algo que se use para limpiar",categoria:"GENERAL"},
  {id:18,texto:"Algo que se use para cocinar",categoria:"GENERAL"},
  {id:19,texto:"Algo que se rompa fácil",categoria:"GENERAL"},
  {id:20,texto:"Algo duro",categoria:"GENERAL"},
  {id:21,texto:"Algo blando",categoria:"GENERAL"},
  {id:22,texto:"Algo frío",categoria:"GENERAL"},
  {id:23,texto:"Algo caliente",categoria:"GENERAL"},
  {id:24,texto:"Algo redondo",categoria:"GENERAL"},
  {id:25,texto:"Algo cuadrado",categoria:"GENERAL"},
  {id:26,texto:"Algo que haga ruido",categoria:"GENERAL"},
  {id:27,texto:"Algo que tenga botones",categoria:"GENERAL"},
  {id:28,texto:"Algo que tenga pantalla",categoria:"GENERAL"},
  {id:29,texto:"Algo que se enchufe",categoria:"GENERAL"},
  {id:30,texto:"Algo que funcione con pilas",categoria:"GENERAL"},
  {id:31,texto:"Algo que se pueda abrir",categoria:"GENERAL"},
  {id:32,texto:"Algo que se pueda cerrar",categoria:"GENERAL"},
  {id:33,texto:"Algo que se pueda perder",categoria:"GENERAL"},
  {id:34,texto:"Algo que se pueda guardar",categoria:"GENERAL"},
  {id:35,texto:"Algo que se use todos los días",categoria:"GENERAL"},
  {id:36,texto:"Algo que se use a veces",categoria:"GENERAL"},
  {id:37,texto:"Algo que se use de noche",categoria:"GENERAL"},
  {id:38,texto:"Algo que se use de día",categoria:"GENERAL"},
  {id:39,texto:"Algo que esté en la escuela",categoria:"GENERAL"},
  {id:40,texto:"Algo que esté en una mochila",categoria:"GENERAL"},
  {id:41,texto:"Algo que esté en un bolsillo",categoria:"GENERAL"},
  {id:42,texto:"Algo que se use cuando llueve",categoria:"GENERAL"},
  {id:43,texto:"Algo que se use cuando hace frío",categoria:"GENERAL"},
  {id:44,texto:"Algo que se use cuando hace calor",categoria:"GENERAL"},
  {id:45,texto:"Una prenda de vestir",categoria:"GENERAL"},
  {id:46,texto:"Un calzado",categoria:"GENERAL"},
  {id:47,texto:"Algo que se use en la cabeza",categoria:"GENERAL"},
  {id:48,texto:"Algo que se use en las manos",categoria:"GENERAL"},
  {id:49,texto:"Algo que se use en los pies",categoria:"GENERAL"},
  {id:50,texto:"Algo que tenga agua",categoria:"GENERAL"},
  {id:51,texto:"Algo que tenga luz",categoria:"GENERAL"},
  {id:52,texto:"Algo que esté en la calle",categoria:"GENERAL"},
  {id:53,texto:"Algo que esté en una plaza",categoria:"GENERAL"},
  {id:54,texto:"Algo que esté en el cielo",categoria:"GENERAL"},
  {id:55,texto:"Algo que esté en el piso",categoria:"GENERAL"},
  {id:56,texto:"Algo que esté colgado",categoria:"GENERAL"},
  {id:57,texto:"Algo que se pueda contar",categoria:"GENERAL"},
  {id:58,texto:"Algo que tenga números",categoria:"GENERAL"},
  {id:59,texto:"Algo que tenga letras",categoria:"GENERAL"},
  {id:60,texto:"Algo liviano",categoria:"GENERAL"},
  {id:61,texto:"Algo pesado",categoria:"GENERAL"},
  {id:62,texto:"Algo que se mueva",categoria:"GENERAL"},
  {id:63,texto:"Algo quieto",categoria:"GENERAL"},
  {id:64,texto:"Algo que te guste",categoria:"GENERAL"},
  {id:65,texto:"Algo que no te guste",categoria:"GENERAL"},
  {id:66,texto:"Algo que te haga reír",categoria:"GENERAL"},
  {id:67,texto:"Algo que te dé hambre",categoria:"GENERAL"},
  {id:68,texto:"Algo que te dé sed",categoria:"GENERAL"},
  {id:69,texto:"Algo que te dé sueño",categoria:"GENERAL"},
  {id:70,texto:"Algo que se use para jugar",categoria:"GENERAL"},
  {id:71,texto:"Un juego",categoria:"GENERAL"},
  {id:72,texto:"Un juguete",categoria:"GENERAL"},
  {id:73,texto:"Algo que se use al aire libre",categoria:"GENERAL"},
  {id:74,texto:"Algo que se use adentro",categoria:"GENERAL"},
  {id:75,texto:"Algo que esté en una mesa",categoria:"GENERAL"},
  {id:76,texto:"Algo que esté en una silla",categoria:"GENERAL"},
  {id:77,texto:"Algo que esté en una cama",categoria:"GENERAL"},
  {id:78,texto:"Algo que se use para dormir",categoria:"GENERAL"},
  {id:79,texto:"Algo que se use para viajar",categoria:"GENERAL"},
  {id:80,texto:"Un medio de transporte",categoria:"GENERAL"},
  // … (continúa hasta 170, ya tenés variedad de sobra para jugar)
  
  // ===== ADULTO (171–200) =====
  {id:171,texto:"Algo que solo usás cuando estás a solas",categoria:"ADULTO"},
  {id:172,texto:"Algo que te da vergüenza comprar",categoria:"ADULTO"},
  {id:173,texto:"Algo que no mostrarías a cualquiera",categoria:"ADULTO"},
  {id:174,texto:"Algo que se usa en la intimidad",categoria:"ADULTO"},
  {id:175,texto:"Algo que preferís hacer con la luz apagada",categoria:"ADULTO"},
  {id:176,texto:"Algo que no contarías en una reunión familiar",categoria:"ADULTO"},
  {id:177,texto:"Algo que se guarda en un cajón",categoria:"ADULTO"},
  {id:178,texto:"Algo que se disfruta más de noche",categoria:"ADULTO"},
  {id:179,texto:"Algo que te pone nervioso",categoria:"ADULTO"},
  {id:180,texto:"Algo que te da placer",categoria:"ADULTO"},
  {id:181,texto:"Un juguete sexual",categoria:"ADULTO"},
  {id:182,texto:"Una parte del cuerpo que te gusta mucho",categoria:"ADULTO"},
  {id:183,texto:"Algo que te prende",categoria:"ADULTO"},
  {id:184,texto:"Algo que harías con tiempo y sin apuro",categoria:"ADULTO"},
  {id:185,texto:"Algo que mejora con música",categoria:"ADULTO"},
  {id:186,texto:"Algo que se comparte en pareja",categoria:"ADULTO"},
  {id:187,texto:"Algo que te hace decir mmm",categoria:"ADULTO"},
  {id:188,texto:"Una posición en la cama",categoria:"ADULTO"},
  {id:189,texto:"Algo que te excita",categoria:"ADULTO"},
  {id:190,texto:"Algo que solo harías con alguien de confianza",categoria:"ADULTO"},
  {id:191,texto:"Algo que no usarías con ropa puesta",categoria:"ADULTO"},
  {id:192,texto:"Algo que se compra en una sex shop",categoria:"ADULTO"},
  {id:193,texto:"Algo que preferís que no te vean hacer",categoria:"ADULTO"},
  {id:194,texto:"Algo que te da mucho placer",categoria:"ADULTO"},
  {id:195,texto:"Algo que te gusta pero no lo decís siempre",categoria:"ADULTO"},
  {id:196,texto:"Algo que te daría vergüenza decir en voz alta",categoria:"ADULTO"},
  {id:197,texto:"Algo que solo pasa puertas adentro",categoria:"ADULTO"},
  {id:198,texto:"Algo que se hace en la cama",categoria:"ADULTO"},
  {id:199,texto:"Algo que se disfruta sin apuro",categoria:"ADULTO"},
  {id:200,texto:"Algo que se disfruta de a dos",categoria:"ADULTO"}
];


// ====== CONFIG ======
const TIEMPO_ESCRITURA = 60;     // segundos
const PAUSA_LECTURA_MS = 1500;   // entre consignas con números
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
      ();
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
  hide(vistaRespuesta);
  hide(timerEl);
  hide(finalEl);

  // volver a mostrar consignas para corregir
  show(vistaLectura);
  renderLectura(ronda);

  estado.textContent = "Tiempo terminado – corrigen respuestas";

  // opcional: decir “Tiempo”
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance("Tiempo");
    u.lang = "es-AR";
    u.rate = 1;
    window.speechSynthesis.speak(u);
  }
}


// ====== EVENTOS ======
btnIniciar.addEventListener("click", iniciarRonda);
btnReiniciar.addEventListener("click", iniciarRonda);

// Init
resetUI();

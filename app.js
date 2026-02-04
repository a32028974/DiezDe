/* ==========================
   DIEZ COSAS - APP.JS
========================== */

// ====== CONFIG ======
const TIEMPO_ESCRITURA = 60;
const PAUSA_LECTURA_MS = 1500;
const PAUSA_REPASO_MS = 1000;

// ====== DATA ======
const consignas = [
  // GENERALES (ejemplo, podés pegar todas las 170 acá)
  {id:1,texto:"Un color",categoria:"GENERAL"},
  {id:2,texto:"Un animal",categoria:"GENERAL"},
  {id:3,texto:"Algo que esté en la cocina",categoria:"GENERAL"},
  {id:4,texto:"Algo que tenga ruedas",categoria:"GENERAL"},
  {id:5,texto:"Una fruta",categoria:"GENERAL"},
  {id:6,texto:"Una prenda de vestir",categoria:"GENERAL"},
  {id:7,texto:"Algo que se use cuando llueve",categoria:"GENERAL"},
  {id:8,texto:"Algo que se pueda guardar",categoria:"GENERAL"},
  {id:9,texto:"Algo que se rompa fácil",categoria:"GENERAL"},
  {id:10,texto:"Una bebida",categoria:"GENERAL"},

  // ADULTO
  {id:171,texto:"Algo que solo usás cuando estás a solas",categoria:"ADULTO"},
  {id:172,texto:"Algo que te da vergüenza comprar",categoria:"ADULTO"},
  {id:173,texto:"Un juguete sexual",categoria:"ADULTO"},
  {id:174,texto:"Una posición en la cama",categoria:"ADULTO"},
  {id:175,texto:"Algo que se usa en la intimidad",categoria:"ADULTO"}
];

// ====== UI ======
const modoAdulto = document.getElementById("modoAdulto");
const btnIniciar = document.getElementById("btnIniciar");
const btnRepetir = document.getElementById("btnRepetir");

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

// ====== HELPERS ======
function show(el){el.classList.remove("hidden")}
function hide(el){el.classList.add("hidden")}

function shuffle(arr){
  return [...arr].sort(()=>Math.random()-0.5);
}

function seleccionar10(){
  const generales = consignas.filter(c=>c.categoria==="GENERAL");
  const adultos = consignas.filter(c=>c.categoria==="ADULTO");

  let seleccion = shuffle(generales)
    .filter(c=>!ultimaRondaIDs.includes(c.id))
    .slice(0, modoAdulto.checked ? 9 : 10);

  if(modoAdulto.checked){
    const adulto = shuffle(adultos)[0];
    seleccion.push(adulto);
  }

  seleccion = shuffle(seleccion);
  ultimaRondaIDs = seleccion.map(c=>c.id);
  return seleccion;
}

function renderLectura(items){
  listaEl.innerHTML="";
  items.forEach(c=>{
    const li=document.createElement("li");
    li.textContent=c.texto;
    listaEl.appendChild(li);
  });
}

// ====== VOZ ======
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}

function hablar(texto){
  return new Promise(res=>{
    if(!("speechSynthesis" in window)){res();return;}
    const u=new SpeechSynthesisUtterance(texto);
    u.lang="es-AR";
    u.onend=res;
    speechSynthesis.speak(u);
  });
}

// ====== FULLSCREEN + WAKELOCK ======
function activarPantallaCompleta(){
  const el=document.documentElement;
  if(el.requestFullscreen) el.requestFullscreen();
}

async function activarWakeLock(){
  try{
    if("wakeLock" in navigator){
      wakeLock=await navigator.wakeLock.request("screen");
    }
  }catch(e){}
}

function liberarWakeLock(){
  if(wakeLock){wakeLock.release();wakeLock=null;}
}

// ====== TIMER ======
function iniciarTimer(){
  let t=TIEMPO_ESCRITURA;
  timerEl.textContent=t;
  timerId=setInterval(()=>{
    t--;
    timerEl.textContent=t;
    if(t<=0){
      clearInterval(timerId);
      terminar();
    }
  },1000);
}

// ====== FLUJO ======
async function iniciarRonda(){
  speechSynthesis.cancel();
  activarPantallaCompleta();
  activarWakeLock();

  ronda=seleccionar10();
  renderLectura(ronda);

  show(vistaLectura);
  hide(vistaRespuesta);
  show(timerEl);
  estado.textContent="Escuchá…";

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
  estado.textContent="¡A escribir de memoria!";
  iniciarTimer();
}

function terminar(){
  hide(vistaRespuesta);
  show(vistaLectura);
  renderLectura(ronda);
  estado.textContent="Tiempo – corrigen respuestas";
  liberarWakeLock();
  hablar("Tiempo");
}

async function repetirConsignas(){
  await hablar("Repasamos");
  for(const c of ronda){
    await hablar(c.texto);
    await sleep(PAUSA_REPASO_MS);
  }
}

// ====== EVENTS ======
btnIniciar.addEventListener("click", iniciarRonda);
btnRepetir.addEventListener("click", repetirConsignas);

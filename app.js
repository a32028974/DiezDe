// ====== DATA (después pegamos las 200) ======
const consignas = [
  { id: 1, texto: "Un color", categoria: "GENERAL" },
  { id: 2, texto: "Un animal", categoria: "GENERAL" },
  { id: 181, texto: "Un juguete sexual", categoria: "ADULTO" },
];

// ====== UI ======
const modoAdulto = document.getElementById("modoAdulto");
const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnTermine = document.getElementById("btnTermine");

const estado = document.getElementById("estado");
const timerEl = document.getElementById("timer");

const vistaLectura = document.getElementById("vistaLectura");
const vistaRespuesta = document.getElementById("vistaRespuesta");
const finalEl = document.getElementById("final");

const listaEl = document.getElementById("listaConsignas");

let ronda = [];
let timerId = null;
let tiempo = 60;

// ====== helpers ======
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
  return shuffle(pool).slice(0, 10);
}

function renderLectura(items){
  listaEl.innerHTML = "";
  items.forEach((c, i) => {
    const li = document.createElement("li");
    li.textContent = c.texto;
    listaEl.appendChild(li);
  });
}

// ====== flujo ======
function resetUI(){
  hide(vistaLectura);
  hide(vistaRespuesta);
  hide(finalEl);
  hide(timerEl);
  estado.textContent = "Listos para jugar";
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function iniciarRonda(){
  resetUI();
  ronda = seleccionar10();

  // 1) Se ven durante lectura
  show(vistaLectura);
  renderLectura(ronda);

  estado.textContent = "Leyendo consignas…";

  // 2) ACÁ después metemos: voz con números + pausas + “repasamos” sin números
  // Por ahora, simulamos que termina la lectura en 6 segundos:
  setTimeout(() => {
    pasarARespuesta();
  }, 6000);
}

function pasarARespuesta(){
  // Ocultar consignas
  hide(vistaLectura);

  // Mostrar respuesta + timer
  show(vistaRespuesta);
  show(timerEl);

  estado.textContent = "¡A escribir de memoria!";
  iniciarTimer(60);
}

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

function terminar(){
  hide(vistaRespuesta);
  hide(timerEl);
  show(finalEl);
  estado.textContent = "Tiempo terminado";
}

// ====== eventos ======
btnIniciar.addEventListener("click", iniciarRonda);
btnReiniciar.addEventListener("click", iniciarRonda);
btnTermine?.addEventListener("click", terminar);

// Init
resetUI();

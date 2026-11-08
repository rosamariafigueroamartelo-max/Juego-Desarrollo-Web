// Berry & Friends Picnic - Taller 2: videojuego con Vanilla JS y DOM
// Juego de 1 o 2 jugadores con 5 niveles. Reglas del PDF que usé: B (el viento) y C (el mapache).
// No uso canvas, ni setTimeout/setInterval, ni promesas, ni localStorage, ni librerías, ni innerHTML.
// El estado del juego vive en variables, arreglos y objetos; el DOM solo se usa para mostrarlo.

// 1. Variables y tipos primitivos (number, boolean, string y null)
const PUNTOS_ENTREGA = 10;
const VIDAS_INICIALES = 3;
const VIDAS_MAX = 6;
const CADA_VIENTO = 4;
const TAM = 5;

let modo = 1;
let nivel = 0;
let turno = 0;
let siguiente = 0;
let jugadasExitosas = 0;
let enModal = false;
let juegoTerminado = false;
let silencio = false;
let personaje = null;
let eligiendo = 0;
let elegidos = [];
let jugadores = [];
let activo = 0;
let invitados = [];
let celdasCambiadas = [];
let indiceSel = 0;
let tarjetasDOM = [];
let accionesModal = [];
let pantallaActual = "menu";

// 3. Arreglos y 4. Objetos literales
// NIVELES es un arreglo de objetos y cada nivel trae su tablero 5x5 como arreglo de strings.
// Letras del tablero: "." prado, "J" salida, "G" invitado, "C" cesta, "A" charco, "H" hormiguero, "M" mapache
const NIVELES = [
  { nombre: "El prado", pasto: ["#b7e88f", "#8fd36b"],
    desc: "Un prado tranquilo para empezar. Lleva la merienda a 3 amigos.",
    mapa: ["G...G",
           ".A.H.",
           "..C..",
           "H..M.",
           "J.A.G"] },
  { nombre: "El bosque", pasto: ["#a6d98c", "#5fae5a"],
    desc: "Entre los árboles hay más hormigueros. ¡Mira bien por dónde caminas!",
    mapa: ["G..HG",
           ".H.A.",
           "..C..",
           "AM.H.",
           "J..AG"] },
  { nombre: "El arroyo", pasto: ["#bfeadb", "#7cc9b5"],
    desc: "El arroyo se desbordó y dejó charcos por todas partes.",
    mapa: ["GA..G",
           ".A.A.",
           "..CA.",
           "A..M.",
           "J.A.G"] },
  { nombre: "La colina", pasto: ["#e2f0a0", "#a9cf63"],
    desc: "Ahora son 4 invitados... ¡y hay 2 mapaches escondidos!",
    mapa: ["G.H.G",
           "..M..",
           "A.C.G",
           "..HM.",
           "J.A.G"] },
  { nombre: "La tarde del picnic", pasto: ["#ffd9c2", "#f3a6a0"],
    desc: "El último pedido antes del atardecer: 4 invitados, 2 mapaches y caminos cerrados.",
    mapa: ["GH.AG",
           "...M.",
           "GAC..",
           ".H.A.",
           "J.M.G"] }
];
let MAPA = NIVELES[0].mapa.map((fila) => [...fila]);

// Objeto con el dibujo de cada casilla especial
const TERRENO = {
  A: { img: "charco", nombre: "charco" },
  H: { img: "hormiguero", nombre: "hormiguero" },
  M: { img: "mapache_i", nombre: "mapache" },
  C: { img: "cesta", nombre: "cesta" },
  J: { img: "huella", nombre: "salida" }
};

// Arreglo de objetos con los siete personajes, su historia y su habilidad
const PERSONAJES = [
  { id: "fresita", nombre: "Fresita", animal: "Conejita", img: "img/fresita.png", favorito: "fresa", color: "#ffc2dc",
    desc: "Una conejita alegre que siempre carga fresitas y una tajada de sandía. A ella se le ocurrió armar el picnic y es la que más se preocupa porque nadie se quede sin merienda. Guarda la fresa más roja para alguien con gorrito de limón.",
    dato: "Cuando se pone nerviosa le tiemblan las orejas, sobre todo si Limón la saluda.",
    habilidad: "Dulzura: +5 puntos extra en cada entrega.", bono: 5 },
  { id: "limon", nombre: "Limón", animal: "Patito", img: "img/pato_limon.png", favorito: "limon", color: "#f4f7b5",
    desc: "Un patito tranquilo con gorrito de limón que prepara la mejor limonada del bosque. Habla poquito, pero siempre llega primero a extender la manta. Nadie sabe por qué su limonada últimamente sabe a fresa.",
    dato: "Ensaya en secreto lo que le quiere decir a alguien, pero siempre termina ofreciéndole limonada.",
    habilidad: "Cítrico: empieza con 1 vida extra.", vidasExtra: 1 },
  { id: "bao", nombre: "Bao", animal: "Panda", img: "img/bao.png", favorito: "uvas", color: "#e6dcff",
    desc: "Una panda que nunca se quita sus audífonos morados. Creció en un bambú al otro lado del arroyo y llegó al prado siguiendo la guitarra de Rocky. Dice que cada merienda tiene su canción y es la que arma la música de todos los picnics. Si ve a alguien triste, le presta un audífono.",
    dato: "Tiene una lista de canciones para cada amigo. La de Tutti es para dormir la siesta.",
    habilidad: "Ritmo: +3 puntos extra en cada entrega.", bono: 3 },
  { id: "tutti", nombre: "Tutti", animal: "Gatita", img: "img/tutti.png", favorito: "mango", color: "#ffe6c4",
    desc: "Una gatita dormilona que anda en sandalias para todo lado y ama el sol del mediodía. Vive en una casita de techo naranja al borde del prado y siempre llega tarde porque se queda dormida en el camino. Trae un mango a cada picnic porque jura que es la fruta más dulce del mundo.",
    dato: "Es la mejor amiga de Bao y una vez durmió tres horas seguidas con sus audífonos puestos.",
    habilidad: "Mango: +3 puntos extra en cada entrega.", bono: 3 },
  { id: "capitan", nombre: "Capitán Osito", animal: "Osito marinero", img: "img/capitan.png", favorito: "pez", color: "#d4ecff",
    desc: "Un osito que soñaba con navegar el mar y, como en el prado no hay mar, se volvió el capitán del arroyo. Construyó su propio barquito con cajas de fruta y se sabe todos los caminos de memoria. Cuando el viento desordena el picnic, es el primero en organizar a todos.",
    dato: "No se quita el gorrito ni para dormir y le pone nombre a cada nube que pasa.",
    habilidad: "Marinero: empieza con 1 vida extra.", vidasExtra: 1 },
  { id: "rocky", nombre: "Rocky", animal: "Ranita", img: "img/rocky.png", favorito: "naranja", color: "#d6f5c8",
    desc: "Una ranita que toca guitarra a la orilla del arroyo desde que era renacuaja. Le compone una canción a cada amigo y los sábados ensaya con Bao para el concierto del picnic. Es tranquila y paciente: la que pone calma cuando todos se alborotan.",
    dato: "Es la única que ha logrado calmar al mapache travieso, cantándole una canción de cuna.",
    habilidad: "Guitarra: el mapache no te congela la primera vez en cada nivel.", escudo: true },
  { id: "nopalito", nombre: "Nopalito", animal: "Gatita mexicana", img: "img/nopalito.png", favorito: "taco", color: "#ffd9c7",
    desc: "Una gatita que llegó de México con su sombrero, sus flores y los colores de su bandera. Aprendió a cocinar con su abuela y prepara los tacos más ricos del picnic, siempre con la salsa aparte para Tutti, que no aguanta el picante. Les enseñó a todos a decir ¡órale!",
    dato: "Cuando suena la música es la primera en bailar, y su sombrero ha servido de sombrilla para tres amigos a la vez.",
    habilidad: "Sombrero: el mapache no te congela la primera vez en cada nivel.", escudo: true }
];

const FRUTAS = ["fresa", "sandia", "limon", "mango", "manzana"];
const ICONOS = [...FRUTAS, "uvas", "taco", "pez", "naranja"];
const NOMBRE = { fresa: "fresa", sandia: "sandía", limon: "limón", mango: "mango", manzana: "manzana",
                 uvas: "uvas", taco: "taco", pez: "pescadito", naranja: "naranja" };
const PLURAL = { fresa: "fresas", sandia: "rodajas de sandía", limon: "limones", mango: "mangos", manzana: "manzanas" };
const FEMENINO = { fresa: true, sandia: true, manzana: true, limon: false, mango: false };
const ALIMENTOS = [...FRUTAS, "uvas", "naranja"];
const PATRONES = ["AB", "ABC", "AAB", "ABCB", "AABC"];
const NOMBRE_CASILLA = { ".": "un tronquito vacío", A: "un charco", H: "un hormiguero", M: "el mapache" };
const COLORES_JUGADOR = ["j1", "j2"];

// Las cuatro direcciones; con este arreglo se crean los botones y se lee el teclado
const DIRECCIONES = [
  { clase: "arriba",    texto: "Arriba",    df: -1, dc: 0, wasd: ["w", "W"], flecha: "ArrowUp" },
  { clase: "izquierda", texto: "Izquierda", df: 0, dc: -1, wasd: ["a", "A"], flecha: "ArrowLeft" },
  { clase: "derecha",   texto: "Derecha",   df: 0, dc: 1,  wasd: ["d", "D"], flecha: "ArrowRight" },
  { clase: "abajo",     texto: "Abajo",     df: 1, dc: 0,  wasd: ["s", "S"], flecha: "ArrowDown" }
];

// Controles de cada jugador: en modo 2 jugadores el 1 usa W A S D y el 2 las flechas
const CONTROLES = [
  { teclado: "W A S D", tactil: "cruceta rosada", teclas: (d) => d.wasd },
  { teclado: "Flechas", tactil: "cruceta azul", teclas: (d) => [d.flecha] }
];

let GPOS = [];
const buscarInvitados = (mapa) => {
  const lista = [];
  mapa.forEach((fila, f) => [...fila].forEach((t, c) => { if (t === "G") lista.push({ f, c }); }));
  return lista;
};

const musica = document.getElementById("musica");
musica.volume = 0.35;
const sonidos = { pop: new Audio("pop.wav"), mal: new Audio("mal.wav"), gana: new Audio("gana.wav") };

// 5. Funciones (flecha y declaradas)
const $ = (id) => document.getElementById(id);
const azar = (n) => Math.floor(Math.random() * n);
const buscarPersonaje = (id) => PERSONAJES.find((p) => p.id === id);
const J = () => jugadores[activo];
const vivos = () => jugadores.filter((j) => j.vidas > 0);
const quien = () => (modo === 2 ? J().p.nombre + ": " : "");
const decir = (texto) => { $("burbuja").textContent = quien() + texto; };
const mismaCelda = (a, b) => a.f === b.f && a.c === b.c;

function sonar(nombre) {
  if (silencio) return;
  sonidos[nombre].currentTime = 0;
  sonidos[nombre].play();
}

// 7. Manipulación del DOM: crea etiquetas con createElement en vez de usar innerHTML
function crear(etiqueta, clase, texto) {
  const e = document.createElement(etiqueta);
  if (clase) e.className = clase;
  if (texto) e.textContent = texto;
  return e;
}

function retrato(p, clase) {
  const i = crear("img", clase || "retrato");
  i.src = p.img;
  i.alt = p.nombre;
  return i;
}

function icono(id) {
  const i = crear("img", "ico");
  i.src = "img/" + id + ".png";
  i.alt = NOMBRE[id] || id;
  return i;
}

const ficha = (t) => (ICONOS.includes(t) ? icono(t) : crear("span", "txt", t));

function mezclar(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = azar(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function mostrarPantalla(id) {
  pantallaActual = id;
  document.querySelectorAll(".pantalla").forEach((s) => { s.hidden = s.id !== id; });
  if (id !== "final") document.querySelectorAll(".confeti").forEach((x) => x.remove());
}

// Ventana reutilizable para los avisos de nivel, el mapache y los retos
function abrirModal({ titulo, texto, img, visual, botones, tipo }) {
  enModal = true;
  $("modal").className = tipo || "";
  $("mTitulo").textContent = titulo;
  $("mTexto").textContent = texto;
  $("mVisual").replaceChildren(...(visual || []).map(ficha));
  $("mVisual").hidden = !visual;
  $("mImg").hidden = !img;
  if (img) $("mImg").src = img;
  $("mBotones").replaceChildren();
  accionesModal = botones.map((b) => b.fn);
  botones.forEach((b) => {
    const x = crear("button", "boton" + (b.fichas ? " opcion" : ""), b.texto);
    if (b.fichas) b.fichas.forEach((t) => x.append(ficha(t)));
    x.addEventListener("click", b.fn);
    $("mBotones").append(x);
  });
  $("modal").hidden = false;
}

function cerrarModal() {
  $("modal").hidden = true;
  enModal = false;
}

function dibujarAmigos() {
  $("amigos").replaceChildren(...PERSONAJES.map((p) => {
    const a = crear("div", "amigo");
    a.style.background = p.color;
    a.append(retrato(p), crear("strong", "", p.nombre), crear("small", "", "(" + p.animal + ")"));
    return a;
  }));
}

// Posición de cada amigo y de la comida en la escena del picnic (en computador y en celular)
const ESCENA_MENU = [
  { id: "bao",      fila: "atras",  pc: { x: 15, abajo: 26, alto: 50 }, movil: { x: 4,  abajo: 40, alto: 37 } },
  { id: "tutti",    fila: "atras",  pc: { x: 31, abajo: 29, alto: 47 }, movil: { x: 25, abajo: 43, alto: 35 } },
  { id: "capitan",  fila: "atras",  pc: { x: 53, abajo: 29, alto: 51 }, movil: { x: 49, abajo: 43, alto: 38 } },
  { id: "rocky",    fila: "atras",  pc: { x: 69, abajo: 26, alto: 44 }, movil: { x: 72, abajo: 40, alto: 33 } },
  { id: "nopalito", fila: "frente", pc: { x: 5,  abajo: 3,  alto: 56 }, movil: { x: 1,  abajo: 6,  alto: 44 } },
  { id: "fresita",  fila: "frente", pc: { x: 37, abajo: 1,  alto: 53 }, movil: { x: 33, abajo: 2,  alto: 47 } },
  { id: "limon",    fila: "frente", pc: { x: 58, abajo: 3,  alto: 47 }, movil: { x: 61, abajo: 6,  alto: 41 } }
];
const COMIDA_MENU = [
  { img: "sandia",  pc: { x: 26, abajo: 25, ancho: 6 },   movil: { x: 25, abajo: 37, ancho: 10 } },
  { img: "uvas",    pc: { x: 48, abajo: 31, ancho: 4.5 }, movil: { x: 48, abajo: 41, ancho: 7 } },
  { img: "fresa",   pc: { x: 32, abajo: 17, ancho: 3.5 }, movil: { x: 30, abajo: 30, ancho: 6 } },
  { img: "limon",   pc: { x: 53, abajo: 23, ancho: 4.5 }, movil: { x: 60, abajo: 33, ancho: 7 } },
  { img: "mango",   pc: { x: 22, abajo: 10, ancho: 4.5 }, movil: { x: 27, abajo: 22, ancho: 7 } },
  { img: "manzana", pc: { x: 74, abajo: 18, ancho: 4.5 }, movil: { x: 86, abajo: 36, ancho: 7 } },
  { img: "cesta",   pc: { x: 80, abajo: 4,  ancho: 13 },  movil: { x: 83, abajo: 2,  ancho: 16 } }
];
let piezasPicnic = [];
const esMovil = () => window.matchMedia("(max-width: 700px)").matches;
const esTactil = () => window.matchMedia("(hover: none)").matches;
const nombreControl = (n) => (esTactil() ? CONTROLES[n].tactil : CONTROLES[n].teclado);

// 2. Condiciones: el ternario elige las posiciones de computador o de celular
function ubicarPicnic() {
  const tam = esMovil() ? "movil" : "pc";
  piezasPicnic.forEach(({ el, datos, tipo }) => {
    const p = datos[tam];
    el.style.left = p.x + "%";
    el.style.bottom = p.abajo + "%";
    if (tipo === "amigo") el.style.height = p.alto + "%";
    else el.style.width = p.ancho + "%";
  });
}

function dibujarPicnic(escena) {
  COMIDA_MENU.forEach((c) => {
    const i = icono(c.img);
    i.className = "comida-picnic" + (c.img === "cesta" ? " cesta-picnic" : "");
    escena.append(i);
    piezasPicnic.push({ el: i, datos: c, tipo: "comida" });
  });
  ESCENA_MENU.forEach((m, n) => {
    const p = buscarPersonaje(m.id);
    const i = crear("img", "amigo-picnic " + m.fila + (m.id === "fresita" ? " centro" : ""));
    i.src = "img/picnic/" + m.id + ".png";
    i.alt = p.nombre;
    i.title = p.nombre;
    i.style.animationDelay = (n * 0.2).toFixed(1) + "s";
    escena.append(i);
    piezasPicnic.push({ el: i, datos: m, tipo: "amigo" });
  });
  ubicarPicnic();
}

function irASeleccion(cuantos) {
  arrancarMusica();
  modo = cuantos;
  eligiendo = 0;
  elegidos = [];
  dibujarSeleccion();
  mostrarPantalla("seleccion");
}

function dibujarSeleccion() {
  $("tituloSeleccion").textContent = modo === 1 ? "Elige tu personaje" : "Jugador " + (eligiendo + 1) + ", elige tu personaje";
  $("btnComenzar").textContent = modo === 2 && eligiendo === 0 ? "Listo, sigue el Jugador 2" : "¡Comenzar!";
  $("tarjetas").replaceChildren();
  tarjetasDOM = [];

  PERSONAJES.forEach((p, i) => {
    const t = crear("button", "tarjeta");
    t.style.setProperty("--fondo", p.color);
    const placa = crear("span", "nombre", p.nombre);
    placa.append(icono(p.favorito));
    t.append(retrato(p), placa);
    if (elegidos.includes(p)) {
      t.classList.add("tomada");
      t.append(crear("span", "sello", "J1"));
    }
    t.addEventListener("click", () => elegirPersonaje(i, true));
    tarjetasDOM.push(t);
    $("tarjetas").append(t);
  });
  const primera = PERSONAJES.findIndex((p) => !elegidos.includes(p));
  elegirPersonaje(primera, false);
}

function elegirPersonaje(i, conSonido) {
  const p = PERSONAJES[i];
  if (elegidos.includes(p)) return;
  indiceSel = i;
  personaje = p;
  if (conSonido) sonar("pop");
  tarjetasDOM.forEach((t, j) => t.classList.toggle("activa", j === i));
  tarjetasDOM[i].focus();

  const pide = crear("p", "pide", "Su merienda favorita: " + NOMBRE[p.favorito] + " ");
  pide.append(icono(p.favorito));
  $("detalle").replaceChildren(
    crear("h3", "etiqueta", p.nombre),
    retrato(p, "retrato-grande"),
    crear("p", "animal", p.animal),
    crear("p", "desc", p.desc),
    crear("p", "dato", "Dato curioso: " + p.dato),
    pide,
    crear("p", "habilidad", p.habilidad)
  );
}

function moverSeleccion(salto) {
  let nuevo = indiceSel + salto;
  if (nuevo >= 0 && nuevo < PERSONAJES.length && elegidos.includes(PERSONAJES[nuevo])) nuevo += Math.sign(salto);
  if (nuevo >= 0 && nuevo < PERSONAJES.length) elegirPersonaje(nuevo, true);
}

function confirmarPersonaje() {
  elegidos.push(personaje);
  if (elegidos.length < modo) {
    eligiendo = 1;
    sonar("pop");
    dibujarSeleccion();
    return;
  }
  iniciarPartida();
}

// Cada jugador es un objeto con su personaje, vidas, puntos, posición y canasta
function nuevoJugador(p, n) {
  return { p, n, vidas: VIDAS_INICIALES + (p.vidasExtra || 0), puntos: 0, turnos: 0,
           pos: { f: 4, c: 0 }, llevaPedido: false, congelado: false, pierdeTurno: false, escudoUsado: false };
}

function iniciarPartida() {
  jugadores = elegidos.map((p, n) => nuevoJugador(p, n));
  activo = 0;
  turno = 0;
  jugadasExitosas = 0;
  celdasCambiadas = [];
  juegoTerminado = false;
  enModal = false;
  document.body.classList.toggle("dos-jugadores", modo === 2);
  mostrarPantalla("juego");
  cargarNivel(0);
  anunciarNivel("");
}

// Fresita y Limón siempre se buscan: si ninguno juega, Limón es el invitado especial (puntos dobles)
function elegirInvitados(cuantos) {
  const ids = jugadores.map((j) => j.p.id);
  const especial = !ids.includes("limon") ? "limon" : !ids.includes("fresita") ? "fresita" : null;
  const libres = PERSONAJES.filter((p) => !ids.includes(p.id) && p.id !== especial);
  const lista = especial ? [buscarPersonaje(especial), ...mezclar(libres).slice(0, cuantos - 1)] : mezclar(libres).slice(0, cuantos);
  return mezclar(lista).map((p, i) => ({ ...p, atendido: false, especial: p.id === especial, pos: GPOS[i] }));
}

// Prepara un nivel: copia el tablero, ubica a los invitados y pone a los jugadores en la salida
function cargarNivel(n) {
  nivel = n;
  MAPA = NIVELES[n].mapa.map((fila) => [...fila]);
  GPOS = buscarInvitados(MAPA);
  invitados = elegirInvitados(GPOS.length);
  siguiente = 0;
  activo = jugadores.findIndex((j) => j.vidas > 0);
  celdasCambiadas = [];
  jugadores.forEach((j) => {
    j.pos = { f: 4, c: 0 };
    j.llevaPedido = false;
    j.congelado = false;
    j.escudoUsado = false;
    j.pierdeTurno = false;
  });
  actualizarAlerta();
  $("tablero").style.setProperty("--pasto1", NIVELES[n].pasto[0]);
  $("tablero").style.setProperty("--pasto2", NIVELES[n].pasto[1]);
  decir("Ve a la cesta para preparar el pedido de " + invitados[0].nombre + ".");
  dibujarTodo();
}

function anunciarNivel(aviso) {
  const datos = NIVELES[nivel];
  const empieza = modo === 2 ? " Empieza " + J().p.nombre + "." : "";
  abrirModal({
    tipo: "nivel",
    titulo: "Nivel " + (nivel + 1) + ": " + datos.nombre,
    texto: aviso + datos.desc + empieza,
    img: J().p.img,
    botones: [{ texto: "¡Vamos!", fn: cerrarModal }]
  });
}

function actualizarAlerta() {
  document.body.classList.toggle("alerta", jugadores.some((j) => j.congelado || j.pierdeTurno));
}

function dibujarTodo() {
  dibujarTablero();
  actualizarHUD();
}

function actualizarHUD() {
  const yo = J();
  const atendidos = invitados.filter((i) => i.atendido).length;
  $("hPuntos").textContent = yo.puntos;
  $("hVidas").textContent = yo.vidas;
  $("hTurno").textContent = turno;
  $("hPedidos").textContent = atendidos + "/" + invitados.length;
  $("hNivel").textContent = (nivel + 1) + "/" + NIVELES.length;
  const faltanViento = CADA_VIENTO - (jugadasExitosas % CADA_VIENTO);
  $("hViento").textContent = faltanViento;
  $("hVientoM").textContent = faltanViento;

  $("heroe").src = yo.p.img;
  $("heroe").alt = yo.p.nombre;
  $("nombreHeroe").textContent = modo === 2 ? "Turno de " + yo.p.nombre : yo.p.nombre;
  $("heroe").className = "heroe " + COLORES_JUGADOR[yo.n];

  $("marcador2").replaceChildren(...jugadores.map((j) => {
    const sinTurno = j.congelado || j.pierdeTurno;
    const m = crear("div", "marca " + COLORES_JUGADOR[j.n] + (j === yo && !juegoTerminado ? " turno" : "") + (j.vidas <= 0 ? " fuera" : "") + (sinTurno ? " sin-turno" : ""));
    const datos = crear("span", "marca-datos");
    datos.append(crear("strong", "", j.p.nombre),
      crear("span", "", "★" + j.puntos + "  ♥" + Math.max(j.vidas, 0) + "  " + j.turnos + " turnos"));
    if (sinTurno) m.append(crear("span", "aviso-turno", "pierde turno"));
    m.append(retrato(j.p), datos);
    return m;
  }));

  const turnoDe = modo === 2 ? "Turno de " + yo.p.nombre + " (" + nombreControl(yo.n) + ") · " : "";
  document.querySelectorAll(".control").forEach((c, n) => c.classList.toggle("espera", modo === 2 && n !== activo));
  $("paso").textContent = juegoTerminado ? ""
    : turnoDe + (yo.congelado ? "Turno congelado: pulsa cualquier flecha para esperar"
    : yo.llevaPedido ? "Entrega: lleva el pedido a " + invitados[siguiente].nombre
    : "Recoge: pasa por la cesta");

  $("invitados").replaceChildren();
  invitados.forEach((inv, i) => {
    const chip = crear("div", "chip");
    const textos = crear("div", "chip-texto");
    textos.append(crear("strong", "", inv.nombre),
      crear("small", "", inv.atendido ? "¡Ya comió!" : "Pide " + NOMBRE[inv.favorito]));
    chip.append(retrato(inv), textos, icono(inv.atendido ? "corazon" : inv.favorito));
    if (i === siguiente && !juegoTerminado) chip.classList.add("ahora");
    if (inv.atendido) chip.classList.add("listo");
    $("invitados").append(chip);
  });
}

function fichaJugador(j) {
  const caja = crear("span", "ficha-jugador " + COLORES_JUGADOR[j.n] + (j === J() ? " activa" : ""));
  caja.append(retrato(j.p));
  if (j.llevaPedido) {
    const globo = crear("span", "globo");
    globo.append(icono("cesta"));
    caja.append(globo);
  }
  return caja;
}

// 7. DOM: dibuja el tablero recorriendo el arreglo MAPA
function dibujarTablero() {
  const celdas = [];
  MAPA.forEach((fila, f) => fila.forEach((t, c) => {
    const celda = crear("div", "celda");
    const aqui = { f, c };
    const inv = invitados.find((i) => mismaCelda(i.pos, aqui));
    const enCelda = vivos().filter((j) => mismaCelda(j.pos, aqui));
    if (t === "C") celda.classList.add("manta");
    if (celdasCambiadas.some((p) => mismaCelda(p, aqui))) celda.classList.add("cambio");

    if (enCelda.length > 0) {
      celda.classList.add("jugador");
      if (enCelda.length > 1) celda.classList.add("juntos");
      enCelda.sort((a, b) => (a === J() ? 1 : 0) - (b === J() ? 1 : 0)).forEach((j) => celda.append(fichaJugador(j)));
    } else if (inv) {
      celda.classList.add("invitado");
      celda.append(retrato(inv));
      const globo = crear("span", "globo");
      globo.append(icono(inv.atendido ? "corazon" : inv.favorito));
      celda.append(globo);
      if (inv.atendido) celda.classList.add("listo");
      if (inv === invitados[siguiente] && !juegoTerminado) celda.classList.add("siguiente");
      if (inv === invitados[siguiente] && J().llevaPedido && !juegoTerminado) celda.classList.add("objetivo");
    } else if (TERRENO[t]) {
      celda.append(icono(TERRENO[t].img));
      if (t === "C" && !J().llevaPedido && !juegoTerminado) celda.classList.add("objetivo");
    }
    celdas.push(celda);
  }));
  $("tablero").replaceChildren(...celdas);
}

// En modo 2 jugadores el turno pasa al otro después de cada jugada
// Regla C en modo 2 jugadores: si al otro le toca pero está congelado, pierde ese turno
// y el jugador actual juega dos veces seguidas. El fondo sigue rojo durante esa ronda.
function finTurno() {
  if (juegoTerminado) return;
  if (modo === 2) {
    const yo = J();
    const otro = jugadores[1 - activo];
    if (otro.vidas <= 0) {
      actualizarAlerta();
      dibujarTodo();
      return;
    }
    if (otro.congelado && yo.congelado) {
      otro.congelado = false;
      yo.congelado = false;
      activo = otro.n;
      $("burbuja").textContent += " Los dos pisaron un mapache, así que se cancela. Le toca a " + otro.p.nombre + ".";
    } else if (otro.congelado) {
      otro.congelado = false;
      otro.pierdeTurno = true;
      $("burbuja").textContent += " " + otro.p.nombre + " tiene el turno congelado, así que " + yo.p.nombre + " juega otra vez.";
    } else {
      otro.pierdeTurno = false;
      activo = otro.n;
      $("burbuja").textContent += " Ahora le toca a " + otro.p.nombre + ".";
    }
  }
  actualizarAlerta();
  dibujarTodo();
}

// En modo 2 jugadores solo se mueve quien tiene el turno, cada uno con sus controles
function moverJugador(n, df, dc) {
  if (juegoTerminado || enModal) return;
  if (modo === 2 && n !== activo) {
    $("burbuja").textContent = "Espera, " + jugadores[n].p.nombre + ": es el turno de " + J().p.nombre + " (" + nombreControl(activo) + ").";
    return;
  }
  mover(df, dc);
}

// 2. Condiciones: según la casilla que pisa el jugador pasa algo distinto
function mover(df, dc) {
  if (juegoTerminado || enModal) return;
  const yo = J();
  celdasCambiadas = [];

  if (yo.congelado) {
    yo.congelado = false;
    turno++;
    yo.turnos++;
    decir("Turno congelado... ¡el mapache ya se fue!");
    finTurno();
    return;
  }

  const f = yo.pos.f + df;
  const c = yo.pos.c + dc;
  if (f < 0 || c < 0 || f >= TAM || c >= TAM) {
    decir("Ahí no hay camino, prueba otra dirección.");
    return;
  }

  yo.pos = { f, c };
  turno++;
  yo.turnos++;
  const t = MAPA[f][c];
  let esperaVentana = false;

  if (t === "A" || t === "H") perderVida(t === "A" ? "¡Splash, un charco!" : "¡Auch, un hormiguero!");
  else if (t === "M") esperaVentana = encontrarMapache();
  else if (t === "C") recogerPedido();
  else if (t === "G") esperaVentana = llegarAInvitado();
  else decir(yo.llevaPedido ? "Llevas el pedido de " + invitados[siguiente].nombre + ". ¡Sigue!" : "Ve a la cesta para preparar el pedido.");

  if (juegoTerminado) return;
  if (esperaVentana) dibujarTodo();
  else finTurno();
}

function perderVida(mensaje) {
  const yo = J();
  yo.vidas--;
  sonar("mal");
  decir(mensaje + " Pierdes 1 vida.");
  if (yo.vidas <= 0) jugadorSinVidas();
}

function jugadorSinVidas() {
  terminar();
}

// Regla C: el mapache no da puntos, congela el siguiente turno del jugador activo y pone el fondo rojo
function encontrarMapache() {
  const yo = J();
  if (yo.p.escudo && !yo.escudoUsado) {
    yo.escudoUsado = true;
    sonar("pop");
    decir("¡Tu habilidad calmó al mapache! Esta vez te salvaste.");
    return false;
  }
  yo.congelado = true;
  sonar("mal");
  actualizarAlerta();
  decir("¡Mapache travieso! Tu siguiente turno estará congelado.");
  abrirModal({
    tipo: "rojo",
    titulo: "¡Oh no!",
    texto: modo === 2
      ? yo.p.nombre + " encontró un mapache travieso... Pierde su próximo turno y " + jugadores[1 - activo].p.nombre + " va a jugar dos veces seguidas."
      : "Encontraste un mapache travieso... ¡Tu siguiente turno estará congelado!",
    img: "img/mapache.png",
    botones: [{ texto: "¡Sigue jugando!", fn: () => { cerrarModal(); finTurno(); } }]
  });
  return true;
}

function recogerPedido() {
  const yo = J();
  const actual = invitados[siguiente];
  if (!yo.llevaPedido) {
    yo.llevaPedido = true;
    sonar("pop");
    decir("¡Pedido listo! Llévale " + NOMBRE[actual.favorito] + " a " + actual.nombre + "." + jugadaExitosa(true));
  } else {
    decir("Ya tienes el pedido. ¡Corre con " + actual.nombre + "!");
  }
}

function llegarAInvitado() {
  const yo = J();
  const inv = invitados.find((i) => mismaCelda(i.pos, yo.pos));
  const actual = invitados[siguiente];
  if (inv.atendido) decir(inv.nombre + " ya comió. ¡Ve con " + actual.nombre + "!");
  else if (inv !== actual) decir("Todavía no: ahora toca atender a " + actual.nombre + ".");
  else if (!yo.llevaPedido) decir("Primero pasa por la cesta a preparar el pedido.");
  else {
    abrirReto(inv, "");
    return true;
  }
  return false;
}

// Regla B: cada 4 jugadas exitosas (recoger o entregar bien) sopla el viento
function jugadaExitosa(puedeSoplar) {
  jugadasExitosas++;
  if (jugadasExitosas % CADA_VIENTO !== 0 || !puedeSoplar) return "";
  return soplarViento();
}

// Busca si queda un camino sin obstáculos, para que el viento no deje el nivel imposible
function hayCaminoSeguro(desde, hasta) {
  const vistos = [desde.f + "," + desde.c];
  const cola = [desde];
  while (cola.length > 0) {
    const actual = cola.shift();
    if (mismaCelda(actual, hasta)) return true;
    for (const d of DIRECCIONES) {
      const f = actual.f + d.df;
      const c = actual.c + d.dc;
      const clave = f + "," + c;
      if (f >= 0 && c >= 0 && f < TAM && c < TAM && !vistos.includes(clave) && ".JCG".includes(MAPA[f][c])) {
        vistos.push(clave);
        cola.push({ f, c });
      }
    }
  }
  return false;
}

function tableroJugable() {
  const cesta = { f: 2, c: 2 };
  const pendientes = invitados.filter((i) => !i.atendido);
  const caminosJugadores = vivos().every((j) => hayCaminoSeguro(j.pos, j.llevaPedido ? invitados[siguiente].pos : cesta));
  return caminosJugadores && pendientes.every((i) => hayCaminoSeguro(cesta, i.pos));
}

// Regla B: intercambia dos casillas al azar en el arreglo MAPA y luego se redibuja el tablero
function soplarViento() {
  const libres = [];
  MAPA.forEach((fila, f) => fila.forEach((t, c) => {
    const ocupada = jugadores.some((j) => mismaCelda(j.pos, { f, c }));
    if (".AHM".includes(t) && !ocupada) libres.push({ f, c });
  }));

  for (let intento = 0; intento < 60; intento++) {
    const [a, b] = mezclar([...libres]);
    const ta = MAPA[a.f][a.c];
    const tb = MAPA[b.f][b.c];
    if (ta === tb) continue;
    MAPA[a.f][a.c] = tb;
    MAPA[b.f][b.c] = ta;
    if (tableroJugable()) {
      celdasCambiadas = [a, b];
      return " ¡Ráfaga de viento! " + NOMBRE_CASILLA[ta] + " y " + NOMBRE_CASILLA[tb] + " cambiaron de lugar.";
    }
    MAPA[a.f][a.c] = ta;
    MAPA[b.f][b.c] = tb;
  }
  return " Sopló el viento, pero esta vez no movió nada.";
}

function opcionesNumero(correcta, cantidad) {
  const lista = [correcta];
  const saltos = mezclar([1, -1, 2, -2, 3]);
  for (const s of saltos) {
    const n = correcta + s;
    if (lista.length < cantidad && n > 0 && !lista.includes(n)) lista.push(n);
  }
  return mezclar(lista).map((n) => [String(n)]);
}

// Tres tipos de reto; los números, las secuencias y las opciones se vuelven más difíciles con el nivel
function crearReto(inv) {
  const tipo = azar(3);
  const d = nivel;
  const cantidad = d < 3 ? 3 : 4;

  if (tipo === 0) {
    const f = FRUTAS[azar(FRUTAS.length)];
    const pregunta = FEMENINO[f] ? "¿Cuántas faltan?" : "¿Cuántos faltan?";
    if (d < 2) {
      const tiene = d === 0 ? 1 + azar(3) : 2 + azar(4);
      const falta = d === 0 ? 1 + azar(4) : 2 + azar(5);
      const pide = tiene + falta;
      return {
        titulo: "Pedido perfecto",
        texto: inv.nombre + " quiere " + pide + " " + PLURAL[f] + ". Ya tienes " + tiene + ". " + pregunta,
        visual: [...Array(tiene).fill(f), "+", "?", "=", String(pide)],
        opciones: opcionesNumero(falta, cantidad),
        correcta: [String(falta)]
      };
    }
    const bandejas = d === 2 ? 2 + azar(2) : 3 + azar(3);
    const porBandeja = d === 2 ? 2 + azar(3) : 3 + azar(4);
    const pide = bandejas * porBandeja;
    const tiene = 1 + azar(pide - 2);
    const falta = pide - tiene;
    return {
      titulo: "Pedido perfecto",
      texto: inv.nombre + " quiere " + bandejas + " bandejas con " + porBandeja + " " + PLURAL[f] + " cada una. Ya tienes " + tiene + ". " + pregunta,
      visual: [String(bandejas), "×", String(porBandeja), f, "−", String(tiene), "=", "?"],
      opciones: opcionesNumero(falta, cantidad),
      correcta: [String(falta)]
    };
  }

  if (tipo === 1) {
    const patron = PATRONES[d];
    const letras = [...new Set(patron)];
    const frutas = mezclar([...FRUTAS]);
    const equivalencia = {};
    letras.forEach((l, i) => { equivalencia[l] = frutas[i]; });
    const largo = d < 2 ? 6 : 8;
    const secuencia = [];
    for (let i = 0; i < largo; i++) secuencia.push(equivalencia[patron[i % patron.length]]);
    const hueco = d < 2 ? largo - 1 : 2 + azar(largo - 2);
    const correcta = secuencia[hueco];
    const otras = mezclar(frutas.filter((x) => x !== correcta)).slice(0, cantidad - 1);
    const visual = secuencia.slice();
    visual[hueco] = "?";
    return {
      titulo: "La merienda incompleta",
      texto: d < 2 ? "¿Qué alimento sigue en la secuencia?" : "Esta secuencia tiene un hueco. ¿Qué alimento va donde está el signo?",
      visual,
      opciones: mezclar([[correcta], ...otras.map((x) => [x])]),
      correcta: [correcta]
    };
  }

  const tamano = d === 0 ? 2 : d < 3 ? 3 : 4;
  const base = ALIMENTOS.includes(inv.favorito) ? [] : [inv.favorito];
  const disponibles = mezclar([...new Set([...base, ...ALIMENTOS])].filter((x) => x !== inv.favorito));
  const bandeja = [inv.favorito, ...disponibles.slice(0, tamano - 1)];
  const sobrantes = disponibles.slice(tamano - 1);
  const opciones = [mezclar(bandeja.slice())];
  for (let i = 0; i < cantidad - 1; i++) {
    const otra = bandeja.slice();
    otra[1 + azar(tamano - 1)] = sobrantes[i];
    opciones.push(mezclar(otra));
  }
  const visual = [];
  bandeja.forEach((x, i) => { if (i > 0) visual.push("+"); visual.push(x); });
  return {
    titulo: "El picnic desordenado",
    texto: inv.nombre + " pidió esta bandeja, pero el viento la desordenó. ¿Cuál tiene los mismos alimentos?",
    visual,
    opciones: mezclar(opciones),
    correcta: bandeja
  };
}

function abrirReto(inv, aviso) {
  const reto = crearReto(inv);
  abrirModal({
    titulo: (modo === 2 ? J().p.nombre + " · " : "") + reto.titulo,
    texto: aviso + reto.texto,
    img: inv.img,
    visual: reto.visual,
    botones: reto.opciones.map((op) => ({ fichas: op, fn: () => responder(inv, reto, op) }))
  });
}

function responder(inv, reto, op) {
  cerrarModal();
  const yo = J();
  const acerto = op.slice().sort().join() === reto.correcta.slice().sort().join();

  if (!acerto) {
    yo.vidas--;
    sonar("mal");
    if (yo.vidas <= 0) {
      jugadorSinVidas();
      return;
    }
    abrirReto(inv, "¡Casi! Pierdes 1 vida. Nuevo reto: ");
    dibujarTodo();
    return;
  }

  const pts = (PUNTOS_ENTREGA + 5 * nivel + (yo.p.bono || 0)) * (inv.especial ? 2 : 1);
  yo.puntos += pts;
  inv.atendido = true;
  yo.llevaPedido = false;
  siguiente++;
  sonar("pop");
  const ultimoDelNivel = siguiente === invitados.length;
  const viento = jugadaExitosa(!ultimoDelNivel);

  if (ultimoDelNivel) {
    if (nivel === NIVELES.length - 1) {
      terminar();
    } else {
      vivos().forEach((j) => { j.vidas = Math.min(j.vidas + 1, VIDAS_MAX); });
      sonar("gana");
      cargarNivel(nivel + 1);
      anunciarNivel("¡Superaste el nivel " + nivel + (modo === 2 ? " y cada uno ganó" : " y ganaste") + " 1 vida! ");
    }
    return;
  }
  const extra = inv.especial ? " ¡Limonada Rosa, puntos dobles!" : "";
  decir("¡Correcto! +" + pts + " puntos." + extra + " Ahora toca el pedido de " + invitados[siguiente].nombre + "." + viento);
  finTurno();
}

function textoBrindis() {
  const ids = jugadores.map((j) => j.p.id);
  if (ids.includes("fresita") && ids.includes("limon")) return "Fresita y Limón terminaron el picnic brindando juntos con una Limonada Rosa.";
  if (ids.includes("fresita")) return modo === 2 ? "Limón le tenía a Fresita una Limonada Rosa... con fresa, como a ella le gusta." : "Limón te esperaba con una Limonada Rosa... con fresa, como a ti te gusta.";
  if (ids.includes("limon")) return modo === 2 ? "Fresita le guardó a Limón la fresa más roja para su Limonada Rosa." : "Fresita te guardó la fresa más roja para tu Limonada Rosa.";
  return modo === 2 ? "Fresita y Limón brindan por ustedes con una Limonada Rosa." : "Fresita y Limón brindan por ti con una Limonada Rosa.";
}

// Pantalla final: en modo 2 jugadores gana quien tenga más puntos; si empatan, el que usó menos turnos.
// Si uno se queda sin vidas, gana el otro.
function terminar() {
  juegoTerminado = true;
  jugadores.forEach((j) => { j.congelado = false; });
  actualizarAlerta();
  const completo = siguiente === invitados.length && nivel === NIVELES.length - 1;
  let gano = completo;
  let titulo = completo ? "¡Lo lograste!" : "¡Oh no!";
  let sub = completo
    ? "Completaste los " + NIVELES.length + " niveles. Gracias por acompañarnos en este picnic"
    : "Te quedaste sin vidas en el nivel " + (nivel + 1) + " (" + NIVELES[nivel].nombre + "). ¡El picnic te espera otra vez!";
  let puntosFinales = jugadores[0].puntos;

  if (modo === 2) {
    const [a, b] = jugadores;
    const sinVidas = jugadores.find((j) => j.vidas <= 0);
    let ganador = null;
    if (sinVidas) ganador = jugadores.find((j) => j !== sinVidas);
    else if (a.puntos !== b.puntos) ganador = a.puntos > b.puntos ? a : b;
    else if (a.turnos !== b.turnos) ganador = a.turnos < b.turnos ? a : b;
    gano = true;
    titulo = ganador ? "¡Ganó " + ganador.p.nombre + "!" : "¡Empate!";
    sub = (sinVidas ? sinVidas.p.nombre + " se quedó sin vidas en el nivel " + (nivel + 1) + ". " : "Terminaron los " + NIVELES.length + " niveles. ")
      + a.p.nombre + ": " + a.puntos + " pts en " + a.turnos + " turnos · " + b.p.nombre + ": " + b.puntos + " pts en " + b.turnos + " turnos";
    puntosFinales = ganador ? ganador.puntos : a.puntos;
  }

  sonar(gano ? "gana" : "mal");
  if (gano) confeti();
  $("fTitulo").textContent = titulo;
  $("fSub").textContent = sub;
  $("fPuntos").textContent = puntosFinales;
  $("picnicFinal").hidden = !gano;
  $("fImg").hidden = gano;
  $("fBrindis").textContent = textoBrindis();
  $("brindis").hidden = !gano;
  mostrarPantalla("final");
}

// 6. Eventos del navegador: clics, teclado y cambio de tamaño de la ventana
function arrancarMusica() {
  if (!silencio && musica.paused) musica.play();
}
document.addEventListener("pointerdown", arrancarMusica);
document.addEventListener("keydown", arrancarMusica);

$("btnJugar").addEventListener("click", () => irASeleccion(1));
$("btnDos").addEventListener("click", () => irASeleccion(2));
window.addEventListener("resize", ubicarPicnic);
$("btnInstr").addEventListener("click", () => mostrarPantalla("instrucciones"));
$("btnVolver").addEventListener("click", () => mostrarPantalla("menu"));
$("btnAtras").addEventListener("click", () => mostrarPantalla("menu"));
$("btnComenzar").addEventListener("click", confirmarPersonaje);
$("btnOtra").addEventListener("click", () => irASeleccion(modo));
$("btnMenu").addEventListener("click", () => mostrarPantalla("menu"));

$("sonido").addEventListener("click", () => {
  silencio = !silencio;
  $("sonido").classList.toggle("off", silencio);
  if (silencio) musica.pause();
  else musica.play();
});

// 7. DOM: una cruceta por jugador, creada desde los arreglos CONTROLES y DIRECCIONES
CONTROLES.forEach((control, n) => {
  const caja = crear("div", "control " + COLORES_JUGADOR[n]);
  const etiqueta = crear("span", "etiqueta-control", esTactil() ? "Jugador " + (n + 1) : "J" + (n + 1) + " · " + control.teclado);
  const cruceta = crear("div", "flechas");
  DIRECCIONES.forEach((d) => {
    const b = crear("button", "flecha " + d.clase);
    b.setAttribute("aria-label", d.texto + " jugador " + (n + 1));
    b.addEventListener("click", () => moverJugador(n, d.df, d.dc));
    cruceta.append(b);
  });
  caja.append(etiqueta, cruceta);
  $("controles").append(caja);
});

// Busca qué dirección y qué jugador corresponden a la tecla que se presionó
function leerTecla(tecla) {
  for (let n = 0; n < CONTROLES.length; n++) {
    const d = DIRECCIONES.find((x) => CONTROLES[n].teclas(x).includes(tecla));
    if (d) return { d, n };
  }
  return null;
}

const visible = (id) => pantallaActual === id;

const COLUMNAS_TARJETAS = 4;

// Teclado: flechas o WASD para moverse y Enter para confirmar; depende de la pantalla visible
document.addEventListener("keydown", (e) => {
  const tecla = leerTecla(e.key);
  const d = tecla ? tecla.d : null;
  const enter = e.key === "Enter" || e.key === " ";

  if (enModal) {
    const n = Number(e.key);
    if (n >= 1 && n <= accionesModal.length && accionesModal.length > 1) accionesModal[n - 1]();
    else if (enter && accionesModal.length === 1) { e.preventDefault(); accionesModal[0](); }
    return;
  }

  if (visible("seleccion")) {
    if (d) {
      e.preventDefault();
      moverSeleccion(d.dc !== 0 ? d.dc : d.df * COLUMNAS_TARJETAS);
    } else if (enter) {
      e.preventDefault();
      confirmarPersonaje();
    } else if (e.key === "Escape") {
      mostrarPantalla("menu");
    }
  } else if (visible("juego")) {
    if (d) { e.preventDefault(); moverJugador(tecla.n, d.df, d.dc); }
  } else if (visible("menu") && enter) {
    e.preventDefault();
    irASeleccion(1);
  } else if (visible("instrucciones") && (enter || e.key === "Escape")) {
    e.preventDefault();
    mostrarPantalla("menu");
  } else if (visible("final") && enter) {
    e.preventDefault();
    irASeleccion(modo);
  }
});

// 7. DOM: confeti y pétalos creados desde JS y animados con CSS
function confeti() {
  const colores = ["#ff7eb6", "#ffd84d", "#8fd36b", "#7ec8ff", "#c79bff"];
  for (let i = 0; i < 40; i++) {
    const c = crear("i", "confeti");
    c.style.left = azar(100) + "%";
    c.style.background = colores[azar(colores.length)];
    c.style.animationDelay = (Math.random() * 2).toFixed(2) + "s";
    c.style.animationDuration = (3 + Math.random() * 3).toFixed(2) + "s";
    $("escena").append(c);
  }
}

for (let i = 0; i < 10; i++) {
  const p = crear("i", "petalo");
  p.style.left = azar(100) + "%";
  p.style.animationDelay = (Math.random() * 8).toFixed(1) + "s";
  p.style.animationDuration = (8 + Math.random() * 6).toFixed(1) + "s";
  $("escena").append(p);
}

dibujarAmigos();
dibujarPicnic($("picnicMenu"));
dibujarPicnic($("picnicFinal"));

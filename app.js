
//Elementos del DOM
const entradaBusqueda = document.getElementById("entradaBusqueda");
const botonBuscar = document.getElementById("botonBuscar");
const tarjetaPokemon = document.getElementById("tarjetaPokemon");
const botonFavorito = document.getElementById("botonFavorito");
const listaRecientesEl = document.getElementById("listaRecientes");
const listaFavoritosEl = document.getElementById("listaFavoritos");
const listaPokemonesEl = document.getElementById("listaPokemones");
const paginacionEl = document.getElementById("paginacion");

//Datos locales
let busquedasRecientes = JSON.parse(localStorage.getItem("busquedasRecientes")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let cachePokemones = JSON.parse(localStorage.getItem("cachePokemones")) || {};

const POKEMONES_POR_PAGINA = 24;
let paginaActual = 1;
let totalPokemones = 0;

//---------------------- OBTENER POKÉMON ----------------------
async function obtenerPokemon(nombre) {
  const nombreMinuscula = nombre.toLowerCase();
  if (cachePokemones[nombreMinuscula]) {
    mostrarPokemon(cachePokemones[nombreMinuscula], true);
    return cachePokemones[nombreMinuscula];
  }
  try {
    tarjetaPokemon.innerHTML = "Buscando...";
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombreMinuscula}`);
    if (!res.ok) throw new Error("No encontrado");
    const datos = await res.json();
    cachePokemones[nombreMinuscula] = datos;
    localStorage.setItem("cachePokemones", JSON.stringify(cachePokemones));
    mostrarPokemon(datos);
    return datos;
  } catch (err) {
    tarjetaPokemon.innerHTML = `<p style="color:red">Error: Pokémon no encontrado</p>`;
    botonFavorito.classList.add("oculto");
  }
}

//---------------------- MOSTRAR POKÉMON ----------------------
function mostrarPokemon(datos, desdeCache = false) {
  if (!datos) return;
  const { id, name, height, weight, types, abilities } = datos;
  const imagen = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  tarjetaPokemon.innerHTML = `
    <h3>${name ? name.toUpperCase() : "Desconocido"}</h3>
    <img src="${imagen}" alt="Imagen de ${name}" />
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>Altura:</strong> ${height}</p>
    <p><strong>Peso:</strong> ${weight}</p>
    <p><strong>Tipos:</strong> ${types.map(t => t.type.name).join(", ")}</p>
    <p><strong>Habilidades:</strong> ${abilities.map(a => a.ability.name).join(", ")}</p>
    ${desdeCache ? "<small>Desde caché ✅</small>" : ""}
  `;

  botonFavorito.classList.remove("oculto");
  botonFavorito.onclick = () => agregarFavorito(name);
}

//---------------------- BUSCADOR ----------------------
botonBuscar.addEventListener("click", manejarBusqueda);
entradaBusqueda.addEventListener("keypress", (e) => {
  if (e.key === "Enter") manejarBusqueda();
});

function manejarBusqueda() {
  const nombre = entradaBusqueda.value.trim();
  if (!nombre) return;
  obtenerPokemon(nombre).then((datos) => {
    if (datos && datos.name) actualizarBusquedasRecientes(datos.name);
  });
}

//---------------------- LISTADO DE POKÉMON ----------------------
async function obtenerListaPokemones(pagina = 1) {
  paginaActual = pagina;
  const offset = (pagina - 1) * POKEMONES_POR_PAGINA;
  listaPokemonesEl.innerHTML = "Cargando lista...";

  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${POKEMONES_POR_PAGINA}`
  );
  const datos = await res.json();
  totalPokemones = datos.count;

  mostrarListaPokemones(datos.results);
  mostrarPaginacion();
}

function mostrarListaPokemones(lista) {
  listaPokemonesEl.innerHTML = "";
  lista.forEach((p) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "card";
    const partesUrl = p.url.split("/").filter(Boolean);
    const id = partesUrl[partesUrl.length - 1];
    const imagenSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    tarjeta.innerHTML = `
      <img src="${imagenSrc}" alt="${p.name}" />
      <p>${p.name.toUpperCase()}</p>
    `;
    tarjeta.onclick = () => obtenerPokemon(p.name).then(() => actualizarBusquedasRecientes(p.name));
    listaPokemonesEl.appendChild(tarjeta);
  });
}

//---------------------- PAGINACIÓN ----------------------
function mostrarPaginacion() {
  const totalPaginas = Math.ceil(totalPokemones / POKEMONES_POR_PAGINA);
  paginacionEl.innerHTML = "";

  const crearBoton = (texto, pagina) => {
    const boton = document.createElement("button");
    boton.textContent = texto;
    boton.onclick = () => obtenerListaPokemones(pagina);
    return boton;
  };

  paginacionEl.appendChild(crearBoton("Primero", 1));
  paginacionEl.appendChild(crearBoton("Anterior", Math.max(1, paginaActual - 1)));

  for (let i = 1; i <= totalPaginas; i++) {
    if (i <= 3 || i > totalPaginas - 3 || Math.abs(i - paginaActual) <= 1) {
      const boton = crearBoton(i, i);
      if (i === paginaActual) boton.style.fontWeight = "bold";
      paginacionEl.appendChild(boton);
    }
  }

  paginacionEl.appendChild(crearBoton("Siguiente", Math.min(totalPaginas, paginaActual + 1)));
  paginacionEl.appendChild(crearBoton("Último", totalPaginas));
}

//---------------------- ÚLTIMAS BÚSQUEDAS ----------------------
function actualizarBusquedasRecientes(nombre) {
  if (!busquedasRecientes.includes(nombre)) {
    busquedasRecientes.unshift(nombre);
  } else {
    busquedasRecientes = [nombre, ...busquedasRecientes.filter(n => n !== nombre)];
  }
  busquedasRecientes = busquedasRecientes.slice(0, 10);
  localStorage.setItem("busquedasRecientes", JSON.stringify(busquedasRecientes));
  mostrarBusquedasRecientes();
}

function mostrarBusquedasRecientes() {
  listaRecientesEl.innerHTML = "";
  busquedasRecientes.forEach((nombre) => {
    const li = document.createElement("li");
    li.textContent = nombre.toUpperCase();
    li.onclick = () => obtenerPokemon(nombre);
    listaRecientesEl.appendChild(li);
  });
}

//---------------------- FAVORITOS ----------------------
function agregarFavorito(nombre) {
  if (!favoritos.includes(nombre)) {
    favoritos.unshift(nombre);
    favoritos = favoritos.slice(0, 50);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarFavoritos();
  }
}

function mostrarFavoritos() {
  listaFavoritosEl.innerHTML = "";
  favoritos.forEach((nombre) => {
    const li = document.createElement("li");
    li.textContent = nombre.toUpperCase();
    li.onclick = () => obtenerPokemon(nombre);
    listaFavoritosEl.appendChild(li);
  });
}

//---------------------- FILTRO CLIENT-SIDE ----------------------
entradaBusqueda.addEventListener("input", manejarFiltroLista);

function manejarFiltroLista() {
  const filtro = entradaBusqueda.value.trim().toLowerCase();
  const tarjetas = listaPokemonesEl.querySelectorAll(".card");

  tarjetas.forEach((tarjeta) => {
    const nombre = tarjeta.querySelector("p").textContent.toLowerCase();
    tarjeta.style.display = nombre.includes(filtro) ? "block" : "none";
  });
}

//---------------------- INICIO ----------------------
mostrarBusquedasRecientes();
mostrarFavoritos();
obtenerListaPokemones();

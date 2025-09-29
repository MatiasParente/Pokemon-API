// Elementos del DOM
const inputBuscar = document.getElementById("input-buscar");
const btnBuscar = document.getElementById("btn-buscar");
const fichaPokemon = document.getElementById("ficha-pokemon");
const listaPokemon = document.getElementById("lista-pokemon");
const ultimasBusquedasEl = document.getElementById("ultimas-busquedas");
const favoritosEl = document.getElementById("favoritos");
const mensajeEstado = document.getElementById("mensaje-estado");
const paginacionArriba = document.getElementById("paginacion-arriba");
const paginacionAbajo = document.getElementById("paginacion-abajo");

// Variables
let paginaActual = 1;
const limitePorPagina = 24;
let totalPokemon = 0;

// Cargar datos guardados
let ultimasBusquedas = JSON.parse(localStorage.getItem("ultimasBusquedas")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// Eventos
btnBuscar.addEventListener("click", () => buscarPokemon(inputBuscar.value.trim().toLowerCase()));
inputBuscar.addEventListener("keypress", e => {
  if (e.key === "Enter") buscarPokemon(inputBuscar.value.trim().toLowerCase());
});

// Mostrar listas guardadas
renderUltimasBusquedas();
renderFavoritos();

// ---------------------------
// Función para buscar Pokémon
// ---------------------------
async function buscarPokemon(nombre) {
  if (!nombre) return;

  mensajeEstado.textContent = "Buscando Pokémon...";
  fichaPokemon.innerHTML = "";

  try {
    const cacheKey = `pokemon-${nombre}`;
    let data = JSON.parse(localStorage.getItem(cacheKey));

    if (!data) {
      const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre}`);
      if (!resp.ok) throw new Error("Pokémon no encontrado");
      data = await resp.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      mensajeEstado.textContent = "Encontrado ✅";
    } else {
      mensajeEstado.textContent = "Desde caché ✅";
    }

    mostrarFicha(data);
    agregarUltimaBusqueda(nombre);

  } catch (error) {
    mensajeEstado.textContent = error.message;
  }
}

// ---------------------------
// Mostrar ficha de Pokémon
// ---------------------------
function mostrarFicha(p) {
  fichaPokemon.innerHTML = `
    <h2>${p.name.toUpperCase()} (#${p.id})</h2>
    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png" alt="${p.name}">
    <p><strong>Tipo:</strong> ${p.types.map(t => t.type.name).join(", ")}</p>
    <p><strong>Altura:</strong> ${p.height / 10} m</p>
    <p><strong>Peso:</strong> ${p.weight / 10} kg</p>
    <p><strong>Habilidades:</strong> ${p.abilities.map(a => a.ability.name).join(", ")}</p>
    <button onclick="agregarFavorito('${p.name}')">Agregar a Favoritos ⭐</button>
  `;
}

// ---------------------------
// Últimas búsquedas
// ---------------------------
function agregarUltimaBusqueda(nombre) {
  ultimasBusquedas = [nombre, ...ultimasBusquedas.filter(n => n !== nombre)].slice(0, 10);
  localStorage.setItem("ultimasBusquedas", JSON.stringify(ultimasBusquedas));
  renderUltimasBusquedas();
}

function renderUltimasBusquedas() {
  ultimasBusquedasEl.innerHTML = "";
  ultimasBusquedas.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    li.onclick = () => buscarPokemon(n);
    ultimasBusquedasEl.appendChild(li);
  });
}

// ---------------------------
// Favoritos
// ---------------------------
function agregarFavorito(nombre) {
  if (!favoritos.includes(nombre)) {
    favoritos.unshift(nombre);
    if (favoritos.length > 50) favoritos.pop();
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    renderFavoritos();
  }
}

function renderFavoritos() {
  favoritosEl.innerHTML = "";
  favoritos.forEach(n => {
    const li = document.createElement("li");
    li.textContent = n;
    li.onclick = () => buscarPokemon(n);
    favoritosEl.appendChild(li);
  });
}

// ---------------------------
// Listado con paginación
// ---------------------------
async function cargarListado(pagina = 1) {
  paginaActual = pagina;
  const offset = (pagina - 1) * limitePorPagina;

  mensajeEstado.textContent = "Cargando lista...";
  listaPokemon.innerHTML = "";

  try {
    const resp = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limitePorPagina}`);
    const data = await resp.json();
    totalPokemon = data.count;

    mensajeEstado.textContent = "Lista cargada ✅";
    renderLista(data.results);
    renderPaginacion();

  } catch {
    mensajeEstado.textContent = "Error al cargar la lista.";
  }
}

function renderLista(lista) {
  listaPokemon.innerHTML = "";
  lista.forEach(p => {
    const id = p.url.split("/")[6];
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${p.name}">
      <p>${p.name}</p>
    `;
    card.onclick = () => buscarPokemon(p.name);
    listaPokemon.appendChild(card);
  });
}

function renderPaginacion() {
  const totalPaginas = Math.ceil(totalPokemon / limitePorPagina);
  const pagHTML = `
    <button onclick="cargarListado(1)">Primero</button>
    <button onclick="cargarListado(${Math.max(1, paginaActual - 1)})">Anterior</button>
    <span>Página ${paginaActual} de ${totalPaginas}</span>
    <button onclick="cargarListado(${Math.min(totalPaginas, paginaActual + 1)})">Siguiente</button>
    <button onclick="cargarListado(${totalPaginas})">Último</button>
  `;
  paginacionArriba.innerHTML = pagHTML;
  paginacionAbajo.innerHTML = pagHTML;
}

// Cargar lista inicial
cargarListado();

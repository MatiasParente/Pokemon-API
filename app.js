
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const pokemonCard = document.getElementById("pokemonCard");
const addToFav = document.getElementById("addToFav");
const recentSearchesEl = document.getElementById("recentSearches");
const favoritesEl = document.getElementById("favorites");
const pokemonListEl = document.getElementById("pokemonList");
const paginationEl = document.getElementById("pagination");

let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let cache = JSON.parse(localStorage.getItem("cache")) || {};

const POKEMONS_PER_PAGE = 24;
let currentPage = 1;
let totalPokemons = 0;

// ---------------------- FETCH ----------------------
async function fetchPokemon(name) {
  const lower = name.toLowerCase();

  if (cache[lower]) {
    renderPokemon(cache[lower], true);
    return cache[lower];
  }

  try {
    pokemonCard.innerHTML = "Buscando...";
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${lower}`);
    if (!res.ok) throw new Error("No encontrado");
    const data = await res.json();
    cache[lower] = data;
    localStorage.setItem("cache", JSON.stringify(cache));
    renderPokemon(data);
    return data;
  } catch (err) {
    pokemonCard.innerHTML = `<p style="color:red">Error: Pokémon no encontrado</p>`;
    addToFav.classList.add("hidden");
  }
}

// ---------------------- RENDER FICHA ----------------------
function renderPokemon(data, fromCache = false) {
  if (!data) return;

  const { id, name, height, weight, types, abilities } = data;
  const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

  pokemonCard.innerHTML = `
    <h3>${name ? name.toUpperCase() : "Desconocido"}</h3>
    <img src="${img}" alt="Imagen de ${name}" />
    <p><strong>ID:</strong> ${id}</p>
    <p><strong>Altura:</strong> ${height}</p>
    <p><strong>Peso:</strong> ${weight}</p>
    <p><strong>Tipos:</strong> ${types.map(t => t.type.name).join(", ")}</p>
    <p><strong>Habilidades:</strong> ${abilities.map(a => a.ability.name).join(", ")}</p>
    ${fromCache ? "<small>Desde caché ✅</small>" : ""}
  `;

  addToFav.classList.remove("hidden");
  addToFav.onclick = () => addFavorite(name);
}

// ---------------------- BUSCADOR ----------------------
searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

function handleSearch() {
  const name = searchInput.value.trim();
  if (!name) return;
  fetchPokemon(name).then((data) => {
    if (data && data.name) updateRecentSearches(data.name);
  });
}

// ---------------------- LISTADO ----------------------
async function fetchPokemonList(page = 1) {
  currentPage = page;
  const offset = (page - 1) * POKEMONS_PER_PAGE;
  pokemonListEl.innerHTML = "Cargando lista...";
  const res = await fetch(
    `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${POKEMONS_PER_PAGE}`
  );
  const data = await res.json();
  totalPokemons = data.count;
  renderPokemonList(data.results);
  renderPagination();
}

function renderPokemonList(list) {
  pokemonListEl.innerHTML = "";

  list.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    // crear imagen oficial usando ID extraído de la URL
    const urlParts = p.url.split("/").filter(Boolean);
    const id = urlParts[urlParts.length - 1];
    const imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.name}" />
      <p>${p.name.toUpperCase()}</p>
    `;

    card.onclick = () => fetchPokemon(p.name).then(() => updateRecentSearches(p.name));
    pokemonListEl.appendChild(card);
  });
}


// ---------------------- PAGINACIÓN ----------------------
function renderPagination() {
  const totalPages = Math.ceil(totalPokemons / POKEMONS_PER_PAGE);
  paginationEl.innerHTML = "";

  const createBtn = (text, page) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.onclick = () => fetchPokemonList(page);
    return btn;
  };

  paginationEl.appendChild(createBtn("Primero", 1));
  paginationEl.appendChild(
    createBtn("Anterior", Math.max(1, currentPage - 1))
  );

  for (let i = 1; i <= totalPages; i++) {
    if (i <= 3 || i > totalPages - 3 || Math.abs(i - currentPage) <= 1) {
      const btn = createBtn(i, i);
      if (i === currentPage) btn.style.fontWeight = "bold";
      paginationEl.appendChild(btn);
    }
  }

  paginationEl.appendChild(
    createBtn("Siguiente", Math.min(totalPages, currentPage + 1))
  );
  paginationEl.appendChild(createBtn("Último", totalPages));
}

// ---------------------- ÚLTIMAS BÚSQUEDAS ----------------------
function updateRecentSearches(name) {
  if (!recentSearches.includes(name)) {
    recentSearches.unshift(name);
  } else {
    recentSearches = [name, ...recentSearches.filter(n => n !== name)];
  }
  recentSearches = recentSearches.slice(0, 10);
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  recentSearchesEl.innerHTML = "";
  recentSearches.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name.toUpperCase();
    li.onclick = () => fetchPokemon(name);
    recentSearchesEl.appendChild(li);
  });
}

// ---------------------- FAVORITOS ----------------------
function addFavorite(name) {
  if (!favorites.includes(name)) {
    favorites.unshift(name);
    favorites = favorites.slice(0, 50);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  favoritesEl.innerHTML = "";
  favorites.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name.toUpperCase();
    li.onclick = () => fetchPokemon(name);
    favoritesEl.appendChild(li);
  });
}

// ---------------------- INICIO ----------------------
renderRecentSearches();
renderFavorites();
fetchPokemonList();
=======
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

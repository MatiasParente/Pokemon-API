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

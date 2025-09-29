// Cuando la página carga, seleccionamos el botón y le agregamos el evento de clic
document.getElementById("btnBuscar").addEventListener("click", buscarPokemon);

// Función para buscar Pokémon usando la PokéAPI
function buscarPokemon() {
    // Obtenemos el valor que el usuario ingresó
    const nombrePokemon = document.getElementById("nombrePokemon").value.toLowerCase();

    // Verificamos si el usuario escribió algo
    if (nombrePokemon === "") {
        alert("Por favor, escribe el nombre o número de un Pokémon.");
        return;
    }

    // URL de la PokéAPI
    const url = `https://pokeapi.co/api/v2/pokemon/${nombrePokemon}`;

    // Hacemos la petición a la API
    fetch(url)
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error("Pokémon no encontrado");
            }
            return respuesta.json();
        })
        .then(datos => mostrarPokemon(datos))
        .catch(error => {
            document.getElementById("resultado").innerHTML = `<p>${error.message}</p>`;
        });
}

// Función para mostrar los datos del Pokémon
function mostrarPokemon(pokemon) {
    const contenedor = document.getElementById("resultado");

    // Mostramos imagen, nombre, ID y tipo del Pokémon
    contenedor.innerHTML = `
        <h2>${pokemon.name.toUpperCase()}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(", ")}</p>
    `;
}

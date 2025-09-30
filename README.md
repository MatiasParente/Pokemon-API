# Pokemon-API

El sitio web está creado con HTML, CSS y JavaScript utilizando una PokeAPI para:

- Buscar un Pokémon por nombre y mostrar su ficha con información como ID, altura, peso, tipos, habilidades e imagen oficial.
- Listar todos los Pokémon en un grid con paginación.
- Guardar resultados en caché usando localStorage.
- Mostrar Últimas búsquedas y Favoritos (posiblidad de clickearlos para acceder a la informacion mas rapido).
- Filtrar Pokémon en el listado mientras se escribe (Filtra entre los 24 pokémons que se encuentran en pantalla en ese momento).

## Decisiones tomadas

- 24 Pokémon por página: Para que la carga sea rápida y la interfaz sea más cómoda de navegar, evitando mostrar demasiados elementos a la vez.
  
- Filtro client-side: Se aplica solo a los Pokémon visibles en la página actual, para mantener la paginacion y simplificar la codificacion.  

- Uso de caché: Las fichas consultadas se almacenan en localStorage para que las búsquedas repetidas sean instantáneas y se reduzcan llamadas innecesarias a la API. 

- Últimas búsquedas y favoritos: También se guardan en localStorage para que los usuarios puedan acceder a Pokémon ya consultados o favoritos, incluso después de cerrar el navegador.  

- Diseño simple y intuitivo: Se utilizó grid y flexbox para que el sitio se vea bien en diferentes tamaños de pantalla y sea fácil de navegar.

- Error en busqueda: Si al buscar el pokemon este no se encuentra se mostra un mensaje de error indicando que no se encontro el pokémon.
# Portafolio-John-Guaman

Portafolio interactivo hecho con **three.js** y **Vite**. Todo el sitio es una escena 3D: un cristal con defectos escondidos, una galería de proyectos que se recorre con el scroll y una constelación de habilidades.

**Demo:** https://j1h23jp.github.io/portafolio-3d/

## El concepto

El portafolio es un laboratorio de pruebas, porque ese es el trabajo: encontrar lo que se rompe antes de que lo encuentre un usuario.

- **Inicio y Sobre mí.** Un cristal procedural (shader propio) con cinco defectos magenta repartidos por su superficie. Se gira arrastrando y cada defecto se corrige con un clic. Al corregir los cinco, el sistema muestra "Build verde" y lanza una onda expansiva.
- **Proyectos.** Láminas 3D en arco. La cámara se detiene en cada una mientras haces scroll. Se puede pasar el cursor, hacer clic, usar los botones o las flechas del teclado.
- **Habilidades.** Constelación de nodos con etiquetas. Cada color es un grupo: desarrollo, calidad e inteligencia artificial.
- **Contacto.** Un nudo con el mismo material del cristal, ya sin defectos.

## Tecnología

| Pieza | Uso |
| --- | --- |
| three.js | Escena, shaders GLSL propios, raycasting y postproceso (bloom, aberración cromática, viñeta y grano) |
| Vite | Servidor de desarrollo y build de producción |
| Fontsource | Tipografías autoalojadas: Unbounded (títulos) e Instrument Sans (texto) |
| GitHub Actions | Despliegue automático en GitHub Pages |

No hay framework de interfaz: el HTML se genera desde `src/ui.js` y la escena vive en módulos de `src/scene/`.

## Cómo ejecutarlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # servidor local con recarga en caliente
npm run build     # genera la carpeta dist/
npm run preview   # sirve dist/ para probar el build
```

## Cómo editar el contenido

Todo el texto, los proyectos y las habilidades están en un solo archivo: [`src/data/content.js`](src/data/content.js).

- `profile`: nombre, titular, enlaces. Completa `email` y `linkedin` para que aparezcan en la sección de contacto.
- `about`: título, párrafos y datos de la sección "Sobre mí".
- `projects`: cada proyecto se convierte en una lámina 3D. Cambia el título, la descripción, las etiquetas, el enlace y el tono (`hue`, de 0 a 1).
- `skills`: cada habilidad es un nodo. El campo `group` (`code`, `qa` o `ai`) decide su color.

Si agregas o quitas proyectos, la galería y el recorrido de la cámara se ajustan solos.

## Estructura

```
src/
  main.js              Renderer, postproceso, interacción y bucle principal
  ui.js                HTML de las secciones, HUD y avisos
  style.css            Sistema visual y diseño responsive
  data/content.js      Contenido editable
  scene/
    crystal.js         Cristal con shader, defectos, esquirlas y onda
    gallery.js         Láminas de proyectos y suelo circular
    constellation.js   Nodos de habilidades
    knot.js            Nudo de la sección de contacto
    stars.js           Campo de partículas con repulsión del cursor
    backdrop.js        Fondo con nebulosa procedural
    director.js        Cámara guiada por el scroll
```

## Despliegue en GitHub Pages

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila y publica el sitio en cada push a `main`.

1. En el repositorio, entra a **Settings > Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Haz push a `main`. La URL final queda en `https://<usuario>.github.io/<repositorio>/`.

`vite.config.js` usa `base: './'`, así que el build funciona en cualquier subruta o hosting estático sin cambios.

## Rendimiento y accesibilidad

- Resolución adaptable: si el equipo va lento, baja la densidad de píxeles automáticamente.
- Los objetos lejanos de la cámara no se dibujan.
- Se respeta `prefers-reduced-motion`: sin giro automático, sin aberración y con cámara directa.
- Foco visible con teclado, enlace para saltar al contenido y navegación por flechas en los proyectos.
- Sin WebGL, la página muestra el contenido como texto normal.

## Licencia

Código bajo licencia MIT. El contenido personal (textos y enlaces) es de su autor.

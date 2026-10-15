# Portafolio-John-Guaman

Portafolio interactivo hecho con **three.js** y **Vite**. Todo el sitio es una escena 3D: un cristal con defectos escondidos, una galería de proyectos que se recorre con el scroll, una constelación de habilidades y un globo terráqueo de red.

**Demo:** https://j1h23jp.github.io/johnguaman/

## El concepto

El portafolio de John Guaman, graduado en Ingeniería en Tecnologías de la Información por la Universidad Nacional de Chimborazo y desarrollador de agentes de IA. La escena funciona como un laboratorio: un cristal con defectos que se corrigen, una imagen de la confiabilidad que busca en la IA (guardrails y revisión humana).

- **Inicio y Sobre mí.** Un cristal procedural (shader propio) con cinco defectos magenta repartidos por su superficie. Se gira arrastrando y cada defecto se corrige con un clic. Al corregir los cinco, el sistema muestra "Build verde" y lanza una onda expansiva.
- **Proyectos.** Láminas 3D en arco. La cámara se detiene en cada una mientras haces scroll. Se puede pasar el cursor, hacer clic, usar los botones o las flechas del teclado.
- **Habilidades.** Constelación de nodos con etiquetas. Cada color es un grupo: lenguajes y herramientas, nube e integración, e inteligencia artificial.
- **Trayectoria.** Línea de tiempo con la experiencia y la formación. El scroll avanza paso a paso (también se puede hacer clic en cada paso) mientras la cámara se acerca a Ecuador en el globo.
- **Contacto.** Un globo terráqueo de puntos con paquetes de datos que viajan desde distintas ciudades hasta Quito. Incluye un formulario que envía el mensaje al correo del autor (al enviarlo, un paquete cruza la pantalla hasta Quito) y un apartado para descargar el CV en PDF.

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

- `profile`: nombre, titular y enlaces. `formTo` es el correo que recibe el formulario de contacto. `email` y `linkedin` son opcionales y agregan botones junto al formulario.
- `about`: título, párrafos y datos de la sección "Sobre mí".
- `journey`: pasos de la trayectoria (experiencia y formación). Cada paso lleva organización, enfoque, periodo, puntos (con enlaces opcionales) y etiquetas opcionales.
- `projects`: cada proyecto se convierte en una lámina 3D. Cambia el título, la descripción, las etiquetas, el enlace y el tono (`hue`, de 0 a 1).
- `skills`: cada habilidad es un nodo. El campo `group` (`code`, `cloud` o `ai`) decide su color.

Si agregas o quitas proyectos, la galería y el recorrido de la cámara se ajustan solos.

## Cómo actualizar el CV

El PDF que se descarga es [`public/CV-John-Guaman.pdf`](public/CV-John-Guaman.pdf). Para actualizarlo, reemplaza ese archivo conservando el nombre (o cambia `profile.cv` en `src/data/content.js`). Ten en cuenta que el CV queda publicado: cualquier dato que contenga (teléfono, correo) será accesible para quien abra la página.

## Formulario de contacto

El formulario no necesita backend: usa [FormSubmit](https://formsubmit.co), un servicio gratuito que reenvía cada mensaje al correo definido en `profile.formTo` (`src/data/content.js`).

- **Activación (una sola vez):** el primer mensaje que se envíe dispara un correo de activación a esa dirección. Hay que abrirlo y confirmar; los mensajes siguientes llegan directo. Hasta confirmar, los envíos fallan.
- **Anti-spam:** incluye un campo trampa oculto para bots. Además, FormSubmit ofrece un alias en lugar del correo real; está en el correo de activación.
- **Privacidad:** el correo de destino queda visible en el código del sitio. Si eso importa, usa el alias que entrega FormSubmit en `formTo` (`https://formsubmit.co/ajax/<alias>`).
- **Cambiar de servicio:** la lógica está en `setupContactForm()` de `src/ui.js`; basta con cambiar el endpoint y el formato del cuerpo.

## Estructura

```
src/
  main.js              Renderer, postproceso, interacción y bucle principal
  ui.js                HTML de las secciones, HUD y avisos
  style.css            Sistema visual y diseño responsive
  data/content.js      Contenido editable
  data/landmask.js     Máscara de tierra firme del globo (Natural Earth, dominio público)
  scene/
    crystal.js         Cristal con shader, defectos, esquirlas y onda
    gallery.js         Láminas de proyectos y suelo circular
    constellation.js   Nodos de habilidades
    globe.js           Globo de red: continentes de puntos, arcos y paquetes hacia Quito
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

## Créditos de datos

La silueta de los continentes del globo sale de [Natural Earth](https://www.naturalearthdata.com) (dominio público), procesada a una máscara de 1 grado a partir del paquete npm `world-atlas`.

## Licencia

Código bajo licencia MIT. El contenido personal (textos y enlaces) es de su autor.

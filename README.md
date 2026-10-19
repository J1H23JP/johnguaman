# Portafolio-John-Guaman

Portafolio interactivo hecho con **three.js** y **Vite**. Todo el sitio es una escena 3D: un cristal con defectos escondidos, una galería de proyectos que se recorre con el scroll, una constelación de habilidades y un globo terráqueo de red.

**Demo:** https://j1h23jp.github.io/johnguaman/

## El concepto

El portafolio de John Guaman, graduado en Ingeniería en Tecnologías de la Información por la Universidad Nacional de Chimborazo y desarrollador de agentes de IA. La escena funciona como un laboratorio: un cristal con defectos que se corrigen, una imagen de la confiabilidad que busca en la IA (guardrails y revisión humana).

- **Inicio y Sobre mí.** Un cristal procedural (shader propio) con cinco defectos magenta repartidos por su superficie. Se gira arrastrando y cada defecto se corrige con un clic. Al corregir los cinco, el sistema muestra "Build verde" y lanza una onda expansiva.
- **Proyectos.** Láminas 3D en arco. La cámara se detiene en cada una mientras haces scroll. Se puede pasar el cursor, hacer clic, usar los botones o las flechas del teclado.
- **Habilidades.** Constelación de nodos con etiquetas. Cada color es un grupo: lenguajes y herramientas, nube e integración, e inteligencia artificial. Cada habilidad tiene de 1 a 3 años de experiencia: el tamaño del nodo y la cantidad de anillos con satélite que lo orbitan lo reflejan. Al pasar el cursor (o tocar), se resaltan sus conexiones, el resto se atenúa y aparece una tarjeta con los años, el resumen y dónde la usé.
- **Certificaciones.** Una tarjeta por certificado, con su insignia oficial, fecha de obtención y una marca de vigencia ("Vigente hasta...", "Vence pronto", "Venció" o "No vence") calculada con la fecha real de quien abre la página. Al hacer clic en el bloque se abre la imagen del certificado ampliada. Si todavía no hay imagen, se muestra una insignia generada.
- **Agente demo.** Un chat que responde preguntas sobre John solo con lo que está en el portafolio, sin modelo de lenguaje ni servidor. Divide la pregunta en términos, los busca en una base de conocimiento armada con los mismos datos de la página (búsqueda BM25), calcula la confiabilidad (cuánto de la pregunta pudo cubrir), cita la fuente y muestra cómo decidió. Si la cobertura es baja, o la pregunta es privada, fuera de tema o un intento de cambiarle las reglas, no inventa: pasa la pregunta a John con un botón que la copia al formulario de contacto. Además:
  - **Comparar con una oferta de trabajo.** Se pega la descripción de un puesto; el agente busca en ella tecnologías (de una lista de más de 100 comunes), años de experiencia, nivel de inglés y formación, y muestra qué aparece en el CV de John (con los años de cada habilidad), qué no aparece (y qué hay cercano) y qué conviene confirmar con él. Lo que no aparece se marca como "no está en su CV", nunca como "no sabe". Puede abrir el formulario con el resultado ya escrito.
  - **Voz.** Botón de micrófono para dictar la pregunta y botón "Escuchar" para leer cada respuesta en voz alta. La lectura es local (`speechSynthesis`). El dictado usa el reconocimiento de voz del navegador: en Chrome el audio lo procesa Google, y el chat lo avisa la primera vez. Si el navegador no lo soporta (por ejemplo Firefox), el botón no aparece.
  - **Chat.** Botón para copiar cada respuesta, preguntas sugeridas según la sección donde está la persona, y un historial que se conserva al recargar o cambiar de idioma mientras la pestaña siga abierta (`sessionStorage`; las respuestas se vuelven a calcular en el idioma activo). El botón de reinicio lo borra.
  - Está en `src/agent.js`; los textos del agente están al inicio de ese archivo, en español e inglés. La lista de tecnologías de la comparación (`TECH`) está en el mismo archivo: agrega ahí las que necesites, con su patrón de búsqueda.
- **Paleta de comandos (Ctrl + K, o Cmd + K en Mac).** Escribiendo unas letras se salta a una sección, un proyecto o un certificado, o se ejecuta una acción: abrir el agente, comparar con una oferta, cambiar idioma o tema, descargar el CV, imprimir, escribir a John, instalar la app. Código en `src/palette.js`.
- **Idioma y tema.** Botones en la barra superior: español o inglés, y tema oscuro o claro. Ambos se recuerdan en el navegador. El tema claro invierte el lienzo 3D con un filtro CSS; el cambio de idioma recarga la página para reconstruir la escena con los textos nuevos.
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

Todo el contenido está en `src/data/`: [`content.es.js`](src/data/content.es.js) tiene los datos y los textos en español, y [`content.en.js`](src/data/content.en.js) solo los textos en inglés (mismo orden de elementos). `content.js` elige el idioma activo. Los textos de la interfaz (botones, avisos) están en [`src/i18n.js`](src/i18n.js).

- `profile`: nombre, titular y enlaces. `formTo` es el correo que recibe el formulario de contacto. `email` y `linkedin` son opcionales y agregan botones junto al formulario.
- `about`: título, párrafos y datos de la sección "Sobre mí".
- `journey`: pasos de la trayectoria (experiencia y formación). Cada paso lleva organización, enfoque, periodo, puntos (con enlaces opcionales) y etiquetas opcionales.
- `certifications`: cada certificación lleva `code`, `issuer`, `title`, `kind` (color), `date`, `expires` (fecha de vencimiento, opcional), `noExpiry: true` (si no vence, opcional), `image` (foto del certificado) y `badge` (insignia recortada, opcional). La marca de vigencia solo se muestra si hay `expires` o `noExpiry`; sin ninguno de los dos no se afirma nada. Las certificaciones Fundamentals de Microsoft no vencen ([fuente](https://learn.microsoft.com/certifications/renew-your-microsoft-certification)). Copia las imágenes a `public/certs/` con el nombre indicado. Para agregar una nueva, añade su entrada en ambos archivos de contenido.
- `projects`: cada proyecto se convierte en una lámina 3D. Cambia el título, la descripción, las etiquetas, el enlace y el tono (`hue`, de 0 a 1).
- `skills`: cada habilidad es un nodo. `group` (`code`, `cloud` o `ai`) decide su color; `years` (1 a 3) el tamaño y los anillos; `since` el año de inicio aproximado; `summary` la frase principal y `used` la lista de dónde la apliqué. Los años son una estimación: ajústalos a tu experiencia real.

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
  agent.js             Agente demo: base de conocimiento, búsqueda, comparación con ofertas, decisión y chat
  voice.js             Dictado y lectura en voz alta (APIs del navegador)
  palette.js           Paleta de comandos (Ctrl + K)
  print.js             Documento limpio para imprimir o guardar como PDF
  pwa.js               Registro del service worker, instalación y aviso de conexión
  i18n.js              Idioma, tema y textos de la interfaz
  style.css            Sistema visual y diseño responsive
  data/content.js      Contenido editable
  data/landmask.js     Máscara de tierra firme del globo (Natural Earth, dominio público)
  scene/
    crystal.js         Cristal con shader, defectos, esquirlas y onda
    gallery.js         Láminas de proyectos y suelo circular
    constellation.js   Nodos de habilidades con anillos por año de experiencia
    globe.js           Globo de red: continentes de puntos, arcos y paquetes hacia Quito
    stars.js           Campo de partículas con repulsión del cursor
    backdrop.js        Fondo con nebulosa procedural
    director.js        Cámara guiada por el scroll
pwa/sw.template.js     Plantilla del service worker (el build la completa)
public/                CV, certificados, íconos de la app y manifest
vite.config.js         Build, datos estructurados para buscadores, sitemap y service worker
```

## Despliegue en GitHub Pages

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila y publica el sitio en cada push a `main`.

1. En el repositorio, entra a **Settings > Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Haz push a `main`. La URL final queda en `https://<usuario>.github.io/<repositorio>/`.

`vite.config.js` usa `base: './'`, así que el build funciona en cualquier subruta o hosting estático sin cambios.

## Responsive

Probado desde 320 px hasta 1920 px de ancho, en vertical y horizontal. Por debajo de 1400 px de ancho (también cuando el navegador tiene zoom o escala de pantalla) el menú pasa a un desplegable; en pantallas muy bajas se compactan los textos para que cada sección quepa sin desplazarse.

## Vista previa al compartir

Al compartir el enlace (LinkedIn, WhatsApp), la tarjeta usa `public/og.jpg` (1200x630). Para cambiarla, reemplaza ese archivo.

## Imprimir o guardar como PDF

El botón "Imprimir / PDF" (sección Contacto), la paleta de comandos o `Ctrl + P` abren una versión limpia, sin el 3D, con el perfil, la experiencia, las habilidades con sus años, los proyectos con su enlace y las certificaciones con su vigencia. Se arma desde los mismos datos (`src/print.js`) y sale en blanco y negro sobre papel, sin importar el tema. Los estilos de impresión están al final de `src/style.css`.

## App instalable y sin conexión

El sitio es una PWA: tiene `public/manifest.webmanifest`, íconos y un service worker (`pwa/sw.template.js`, que `vite.config.js` completa en cada build con la lista de archivos). Después de la primera visita funciona sin internet y se puede instalar (Chrome y Edge, o "Agregar a pantalla de inicio" en el celular).

- Las páginas se piden primero a la red (siempre la versión nueva) y, si no hay conexión, se usa la copia guardada. Los archivos con hash se sirven desde la copia; el CV y los certificados se refrescan en segundo plano.
- Al publicar una versión nueva, la anterior se descarta sola. Si cambias solo el CV o una foto de `public/`, la versión también cambia.
- El service worker solo atiende peticiones GET del mismo sitio: el formulario de contacto nunca pasa por él y necesita internet.
- Solo se registra en el sitio publicado (`npm run build`), no en `npm run dev`.

## Visibilidad en buscadores

`index.html` y `vite.config.js` agregan dirección canónica, `robots`, etiquetas Open Graph y Twitter, y datos estructurados de schema.org (`Person` y `WebSite`) generados desde `content.es.js`: nombre, cargo, enlaces, empleador, universidad, habilidades y certificaciones con fecha. No incluyen correo ni teléfono. El build también publica `sitemap.xml`. La dirección pública está en la constante `SITE` de `vite.config.js`: cámbiala si usas dominio propio.

Esto ayuda a que los buscadores entiendan la página, pero no garantiza posición. Para acelerarlo, da de alta el sitio en [Google Search Console](https://search.google.com/search-console) y envía el `sitemap.xml`. Ten en cuenta que `robots.txt` solo se respeta en la raíz del dominio, por eso en una página de proyecto de GitHub Pages no se genera.

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

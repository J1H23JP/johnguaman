// Todo el contenido del portafolio vive aquí.
// Edita este archivo y la página se actualiza sola (texto, proyectos y habilidades).

export const profile = {
  name: 'John Guaman',
  role: 'Desarrollo y calidad de software',
  headline: 'Encuentro el defecto antes de que lo encuentre un usuario.',
  intro:
    'Desarrollo software y lo pruebo con el mismo cuidado. Me interesan las pruebas, la automatización y las aplicaciones con IA que se pueden confiar en producción.',
  github: 'https://github.com/J1H23JP',
  // Correo que recibe los mensajes del formulario de contacto (servicio FormSubmit).
  formTo: 'johnguaman2003@gmail.com',
  // Opcionales: si los completas, aparecen como botones junto al formulario.
  email: '',
  linkedin: '',
};

export const about = {
  title: 'Construyo y rompo para que nada se rompa solo',
  paragraphs: [
    'Trabajo en el cruce entre desarrollo y aseguramiento de calidad. Escribo código, diseño casos de prueba y automatizo lo repetitivo para que el equipo pueda avanzar sin miedo a romper algo.',
    'Últimamente exploro agentes con modelos de lenguaje y componentes de interfaz que se conectan a herramientas externas.',
  ],
  facts: [
    { term: 'Enfoque', detail: 'Pruebas manuales y automatizadas' },
    { term: 'Explorando', detail: 'Agentes con IA y MCP' },
    { term: 'Ubicación', detail: 'Ecuador' },
  ],
};

// Cada proyecto aparece como una lámina 3D en la galería.
export const projects = [
  {
    title: 'Proyecto integrador',
    description: 'Trabajo integrador de aplicación completa, con interfaz, lógica y pruebas.',
    stack: ['Aplicación web', 'Pruebas'],
    url: 'https://github.com/J1H23JP/PROYECTO-INTEGRADOR',
    hue: 0.52,
  },
  {
    title: 'Agentes v2',
    description: 'Experimentos con agentes basados en modelos de lenguaje y flujos de varios pasos.',
    stack: ['IA generativa', 'Agentes'],
    url: 'https://github.com/J1H23JP/AGENTESV2',
    hue: 0.75,
  },
  {
    title: 'MCP UI components',
    description: 'Componentes de interfaz pensados para integrarse con servidores MCP.',
    stack: ['Componentes', 'MCP'],
    url: 'https://github.com/J1H23JP/mcp-ui-components',
    hue: 0.9,
  },
  {
    title: 'Wakka Tattoes',
    description: 'Sitio web para un estudio de tatuajes, con enfoque visual y de contacto.',
    stack: ['Sitio web', 'Diseño'],
    url: 'https://github.com/J1H23JP/Wakka-Tattoes',
    hue: 0.05,
  },
  {
    title: 'QA ejemplo',
    description: 'Repositorio de práctica con casos de prueba y ejemplos de aseguramiento de calidad.',
    stack: ['QA', 'Casos de prueba'],
    url: 'https://github.com/J1H23JP/QA-EJEMPLO',
    hue: 0.38,
  },
];

// Cada habilidad es un nodo en la constelación. "group" decide el color.
export const skills = [
  { name: 'JavaScript', group: 'code', note: 'Lenguaje principal para web y herramientas.' },
  { name: 'Python', group: 'code', note: 'Scripts, automatización y trabajo con datos.' },
  { name: 'React', group: 'code', note: 'Interfaces web por componentes.' },
  { name: 'Node.js', group: 'code', note: 'Servicios y herramientas de línea de comandos.' },
  { name: 'React Native', group: 'code', note: 'Aplicaciones móviles con Expo.' },
  { name: 'SQL', group: 'code', note: 'Consultas y modelado de datos.' },
  { name: 'Git', group: 'code', note: 'Control de versiones y trabajo en equipo.' },
  { name: 'Pruebas manuales', group: 'qa', note: 'Exploración y diseño de casos de prueba.' },
  { name: 'Automatización', group: 'qa', note: 'Pruebas automáticas que corren solas.' },
  { name: 'Pruebas de API', group: 'qa', note: 'Validación de servicios y contratos.' },
  { name: 'IA generativa', group: 'ai', note: 'Aplicaciones con modelos de lenguaje.' },
  { name: 'Agentes', group: 'ai', note: 'Flujos donde el modelo usa herramientas.' },
  { name: 'MCP', group: 'ai', note: 'Conexión entre modelos y herramientas externas.' },
];

export const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'contacto', label: 'Contacto' },
];

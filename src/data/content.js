// Todo el contenido del portafolio vive aquí.
// Edita este archivo y la página se actualiza sola (texto, trayectoria, proyectos y habilidades).
// Los datos de formación, experiencia y habilidades salen del CV de John Guaman.

export const profile = {
  name: 'John Guaman',
  role: 'Agentes de IA y desarrollo de software',
  headline: 'Diseño agentes de IA que automatizan procesos y saben cuándo pasar el control a una persona.',
  github: 'https://github.com/J1H23JP',
  // Correo que recibe los mensajes del formulario de contacto (servicio FormSubmit).
  formTo: 'johnguaman2003@gmail.com',
  // Opcionales: si los completas, aparecen como botones junto al formulario.
  email: '',
  linkedin: '',
  // PDF que se descarga desde la sección de contacto (archivo en la carpeta public/).
  cv: './CV-John-Guaman.pdf',
};

export const about = {
  title: 'Agentes de IA en los que se puede confiar',
  paragraphs: [
    'Soy graduado en Ingeniería en Tecnologías de la Información por la Universidad Nacional de Chimborazo. Hoy diseño agentes de IA para automatizar la gestión de incidentes en banca, en Tata Consultancy Services.',
    'Me importa que la IA sea confiable: respuestas ancladas a una base de conocimiento, puntuación de confiabilidad y revisión humana cuando hace falta.',
  ],
  facts: [
    { term: 'Hoy', detail: 'Agentes de IA en Tata Consultancy Services' },
    { term: 'Formación', detail: 'Ingeniería en TI, UNACH' },
    { term: 'Ubicación', detail: 'Quito, Ecuador' },
  ],
};

// Trayectoria: cada elemento es un paso del recorrido (el scroll avanza de uno en uno).
export const journey = [
  {
    org: 'Tata Consultancy Services',
    focus: 'Agentes de IA para el sector bancario',
    period: 'Mar 2026 - actualidad',
    points: [
      'Agentes de IA que automatizan la gestión de incidentes: clasifican, escalan y recomiendan una resolución.',
      'Soluciones RAG en Azure (AI Search, OpenAI, Logic Apps) integradas con ServiceNow y Microsoft Teams.',
      'Agentes con arquitectura MCP, y evaluación de RAG, CAG, GraphRAG y Azure AI Foundry según costo, control y escalabilidad.',
      'Guardrails: respuestas ancladas a la base de conocimiento, puntuación de confiabilidad y revisión humana.',
      'Demos de IA agéntica ante equipos ejecutivos y toda la organización de TCS Ecuador.',
    ],
  },
  {
    org: 'Dirección de Gestión de la Calidad, Universidad Nacional de Chimborazo',
    focus: 'Documentación, automatización y auditoría interna',
    period: 'Abr 2025 - Jul 2025',
    points: [
      'Levantamiento, revisión y actualización de la documentación de procesos: formatos, registros y evidencias.',
      {
        text: 'Automatización de procesos y publicación en un sitio web:',
        link: { label: 'usgc.unach.edu.ec', url: 'https://usgc.unach.edu.ec' },
      },
      'Apoyo en la auditoría interna a cada departamento de la universidad, con procesamiento e interpretación de los datos obtenidos.',
    ],
  },
  {
    org: 'GAD Municipal de Puela',
    focus: 'Soporte técnico y desarrollo web',
    period: 'Oct 2024 - Feb 2025',
    points: [
      'Soporte técnico a usuarios: instalación, configuración y solución de incidencias en equipos y software.',
      {
        text: 'Desarrollo del sitio web de la parroquia para difundir su información:',
        link: { label: 'puela.gob.ec', url: 'https://puela.gob.ec' },
      },
    ],
  },
  {
    org: 'Universidad Nacional de Chimborazo',
    focus: 'Graduado en Ingeniería en Tecnologías de la Información',
    period: '2022 - 2026',
    points: [
      'Proyecto de titulación: prototipo móvil y web para gestionar la disponibilidad y alertar intrusiones con autenticación facial en los parqueaderos de la Cooperativa "Señor del Buen Suceso". Lo expuse en un congreso.',
      'Ganador del concurso al mejor proyecto de tecnología de la universidad, con un prototipo que traduce lenguaje natural a lenguaje de señas y viceversa.',
    ],
    tags: ['Microsoft AZ-900', 'Microsoft IA-901', 'Microsoft GH-300', 'Microsoft DP-900', 'Databricks Fundamentals', 'Inglés B1'],
  },
];

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

// Cada habilidad es un nodo en la constelación. "group" decide el color: code, cloud o ai.
export const skills = [
  { name: 'Python', group: 'code', note: 'Lenguaje de programación.' },
  { name: 'SQL', group: 'code', note: 'Lenguaje de consulta de datos.' },
  { name: 'JavaScript', group: 'code', note: 'Lenguaje de programación para web.' },
  { name: 'Git y GitHub', group: 'code', note: 'Control de versiones. También uso GitHub Copilot.' },
  { name: 'Azure', group: 'cloud', note: 'AI Foundry, AI Search, Logic Apps y Functions.' },
  { name: 'Databricks', group: 'cloud', note: 'Certificación Databricks Fundamentals.' },
  { name: 'ServiceNow', group: 'cloud', note: 'Integrado con agentes de IA para la gestión de incidentes.' },
  { name: 'APIs REST', group: 'cloud', note: 'Integración entre servicios y herramientas.' },
  { name: 'Azure OpenAI', group: 'ai', note: 'Modelos GPT-4o en soluciones RAG y agentes.' },
  { name: 'RAG', group: 'ai', note: 'Soluciones sobre Azure AI Search y OpenAI, integradas con ServiceNow y Teams.' },
  { name: 'Agentes', group: 'ai', note: 'Con uso de herramientas y guardrails para automatizar incidentes en banca.' },
  { name: 'MCP', group: 'ai', note: 'Agentes con arquitectura MCP para automatizar flujos de datos y reportes.' },
  { name: 'LangChain', group: 'ai', note: 'Framework para aplicaciones con modelos de lenguaje.' },
  { name: 'LangGraph', group: 'ai', note: 'Framework para flujos de agentes.' },
  { name: 'Semantic Kernel', group: 'ai', note: 'SDK de Microsoft para orquestar modelos de lenguaje.' },
];

export const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'contacto', label: 'Contacto' },
];

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
  linkedin: 'https://www.linkedin.com/in/john-guaman-a62728221',
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
    tags: ['Microsoft AZ-900', 'Microsoft IA-901', 'Microsoft GH-300', 'Microsoft DP-900', 'Databricks Generative AI', 'Inglés B1'],
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
// Habilidades: `years` (1 a 3) define el tamaño del nodo y los satélites que lo orbitan.
// `since` es el inicio aproximado, `summary` la frase principal y `used` dónde lo apliqué.
export const skills = [
  {
    name: 'Python', group: 'code', years: 3, since: '2023',
    note: 'Lenguaje de programación.',
    summary: 'Mi lenguaje base desde la carrera, hoy para agentes de IA y automatización.',
    used: ['Estudios de Ingeniería en TI en la UNACH', 'Agentes y flujos de datos en Tata Consultancy Services'],
  },
  {
    name: 'SQL', group: 'code', years: 3, since: '2023',
    note: 'Lenguaje de consulta de datos.',
    summary: 'Consulta y análisis de datos, desde la formación académica hasta el trabajo con datos.',
    used: ['Formación en bases de datos en la UNACH', 'Procesamiento de datos de auditoría interna'],
  },
  {
    name: 'JavaScript', group: 'code', years: 2, since: '2024',
    note: 'Lenguaje de programación para web.',
    summary: 'Desarrollo web de interfaces, incluido este portafolio en three.js.',
    used: ['Sitio web del GAD Municipal de Puela', 'Este portafolio 3D'],
  },
  {
    name: 'Git y GitHub', group: 'code', years: 3, since: '2023',
    note: 'Control de versiones. También uso GitHub Copilot.',
    summary: 'Control de versiones y publicación de proyectos, con apoyo de GitHub Copilot.',
    used: ['Repositorios de proyectos personales', 'Despliegue de este sitio con GitHub Actions'],
  },
  {
    name: 'Azure', group: 'cloud', years: 1, since: '2025',
    note: 'AI Foundry, AI Search, Logic Apps y Functions.',
    summary: 'Plataforma donde construyo las soluciones de IA del sector bancario.',
    used: ['Azure AI Search y Azure AI Foundry', 'Logic Apps y Functions para integraciones'],
  },
  {
    name: 'Databricks', group: 'cloud', years: 1, since: '2025',
    note: 'Acreditación Databricks Generative AI Fundamentals.',
    summary: 'Fundamentos de IA generativa en la plataforma de datos, con acreditación obtenida en marzo de 2026.',
    used: ['Acreditación Databricks Generative AI Fundamentals'],
  },
  {
    name: 'ServiceNow', group: 'cloud', years: 1, since: '2026',
    note: 'Integrado con agentes de IA para la gestión de incidentes.',
    summary: 'Gestión de incidentes conectada a agentes de IA.',
    used: ['Agentes que clasifican, escalan y recomiendan resolución', 'Integración con Microsoft Teams'],
  },
  {
    name: 'APIs REST', group: 'cloud', years: 2, since: '2024',
    note: 'Integración entre servicios y herramientas.',
    summary: 'Conexión entre servicios, herramientas y agentes.',
    used: ['Integraciones entre ServiceNow, Teams y Azure', 'Automatización de procesos en la UNACH'],
  },
  {
    name: 'Azure OpenAI', group: 'ai', years: 1, since: '2025',
    note: 'Modelos GPT-4o en soluciones RAG y agentes.',
    summary: 'Modelos GPT-4o como motor de las soluciones RAG y de los agentes.',
    used: ['Soluciones RAG con Azure AI Search', 'Agentes de gestión de incidentes'],
  },
  {
    name: 'RAG', group: 'ai', years: 1, since: '2025',
    note: 'Soluciones sobre Azure AI Search y OpenAI, integradas con ServiceNow y Teams.',
    summary: 'Respuestas ancladas a una base de conocimiento, con evaluación frente a CAG y GraphRAG.',
    used: ['Soluciones sobre Azure AI Search y OpenAI', 'Integración con ServiceNow y Microsoft Teams'],
  },
  {
    name: 'Agentes', group: 'ai', years: 1, since: '2026',
    note: 'Con uso de herramientas y guardrails para automatizar incidentes en banca.',
    summary: 'Agentes con herramientas, guardrails y revisión humana para el sector bancario.',
    used: ['Automatización de incidentes en banca', 'Demos ante equipos ejecutivos de TCS Ecuador'],
  },
  {
    name: 'MCP', group: 'ai', years: 1, since: '2026',
    note: 'Agentes con arquitectura MCP para automatizar flujos de datos y reportes.',
    summary: 'Arquitectura MCP para conectar agentes con datos y generar reportes.',
    used: ['Agentes MCP para flujos de datos y reportes'],
  },
  {
    name: 'LangChain', group: 'ai', years: 1, since: '2025',
    note: 'Framework para aplicaciones con modelos de lenguaje.',
    summary: 'Framework para construir aplicaciones con modelos de lenguaje.',
    used: ['Prototipos de agentes y cadenas de herramientas'],
  },
  {
    name: 'LangGraph', group: 'ai', years: 1, since: '2026',
    note: 'Framework para flujos de agentes.',
    summary: 'Flujos de agentes con estado y control explícito.',
    used: ['Prototipos de flujos de agentes'],
  },
  {
    name: 'Semantic Kernel', group: 'ai', years: 1, since: '2026',
    note: 'SDK de Microsoft para orquestar modelos de lenguaje.',
    summary: 'SDK de Microsoft para orquestar modelos de lenguaje.',
    used: ['Evaluación de orquestación para agentes en Azure'],
  },
];

// Certificaciones. `image` es la foto del certificado (carpeta public/certs/) y `badge` la insignia recortada.
// `expires` (fecha de vencimiento) o `noExpiry: true` activan la marca de vigencia. Las Fundamentals de Microsoft no vencen.
// Si el archivo de `image` no existe todavia, la tarjeta muestra una insignia generada y se abre sin foto.
// Las fechas salen de los certificados. Agrega aqui los que falten, con el mismo formato.
export const certifications = [
  {
    id: 'titulo', code: 'ING', kind: 'code',
    issuer: 'Universidad Nacional de Chimborazo',
    title: 'Título de Ingeniería en Tecnologías de la Información',
    image: './certs/titulo-unach.jpg',
  },
  {
    id: 'az-900', noExpiry: true, code: 'AZ-900', kind: 'cloud',
    issuer: 'Microsoft',
    title: 'Aspectos básicos de Azure',
    date: '2026-04-29',
    image: './certs/az-900.jpg', badge: './certs/az-900-badge.png',
  },
  {
    id: 'ia-901', noExpiry: true, code: 'IA-901', kind: 'ai',
    issuer: 'Microsoft',
    title: 'Aspectos básicos de la inteligencia artificial de Azure',
    date: '2026-09-07',
    image: './certs/ia-901.jpg', badge: './certs/ia-901-badge.png',
  },
  {
    id: 'gh-300', code: 'GH-300', kind: 'code',
    issuer: 'Microsoft',
    title: 'GitHub Copilot',
    date: '2026-06-30', expires: '2028-06-30',
    image: './certs/gh-300.jpg', badge: './certs/gh-300-badge.png',
  },
  {
    id: 'dp-900', noExpiry: true, code: 'DP-900', kind: 'cloud',
    issuer: 'Microsoft',
    title: 'Aspectos básicos de los datos de Azure',
    date: '2026-08-03',
    image: './certs/dp-900.jpg', badge: './certs/dp-900-badge.png',
  },
  {
    id: 'databricks', code: 'DBX', kind: 'ai',
    issuer: 'Databricks Academy',
    title: 'Databricks Generative AI Fundamentals',
    date: '2026-03-17',
    image: './certs/databricks.jpg', badge: './certs/databricks-badge.png',
  },
  {
    id: 'ingles-b1', code: 'B1', kind: 'code',
    issuer: 'Idioma inglés',
    title: 'Suficiencia en inglés, nivel B1',
    image: './certs/ingles-b1.jpg',
  },
  {
    id: 'congreso', code: 'CONG', kind: 'cloud',
    issuer: 'Congreso',
    title: 'Congreso Andino de Ingeniería, Construcción, Tecnología e Innovación',
    image: './certs/congreso-andino.jpg',
  },
  {
    id: 'innovasoft', code: '2025', kind: 'ai',
    issuer: 'Concurso',
    title: 'Innovasoft 2025: Tecnologías que conectan, ideas que transforman',
    image: './certs/innovasoft-2025.jpg',
  },
];

export const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre mí' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'certificaciones', label: 'Certificaciones' },
  { id: 'trayectoria', label: 'Trayectoria' },
  { id: 'contacto', label: 'Contacto' },
];

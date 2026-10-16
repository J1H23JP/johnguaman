// Idioma y tema. Ambos se recuerdan en el navegador (localStorage) y, si falla, se usan los valores por defecto.

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
};

export const lang = (() => {
  const saved = read('lang');
  if (saved === 'es' || saved === 'en') return saved;
  return String(navigator.language || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
})();

// El cambio de idioma recarga la página: toda la escena (láminas, etiquetas) se reconstruye con los textos nuevos.
export function setLang(next) {
  write('lang', next);
  location.reload();
}

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(next) {
  document.documentElement.dataset.theme = next;
  write('theme', next);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', next === 'light' ? '#e9edfb' : '#070b1f');
  window.dispatchEvent(new CustomEvent('theme:change', { detail: next }));
}

const STR = {
  es: {
    skip: 'Saltar al contenido',
    loader: 'Calibrando el laboratorio',
    home: 'Ir al inicio',
    sections: 'Secciones',
    cv: 'Descargar CV',
    cvFull: 'Descargar CV completo',
    viewProjects: 'Ver proyectos',
    contact: 'Contacto',
    projects: 'Proyectos',
    skills: 'Habilidades',
    certs: 'Certificaciones',
    path: 'Trayectoria',
    contactTitle: 'Si algo no funciona, hablemos',
    contactCopy: 'Cuéntame qué estás construyendo. Te respondo por correo.',
    fName: 'Nombre',
    fEmail: 'Correo',
    fMessage: 'Mensaje',
    send: 'Enviar mensaje',
    cvTitle: 'Currículum',
    cvSub: 'Descárgalo en PDF si lo necesitas.',
    copyMail: 'Copiar correo',
    mailCopied: 'Correo copiado',
    openRepo: 'Abrir repositorio',
    openRepoOf: (n) => `Abrir repositorio de ${n}`,
    prevProject: 'Proyecto anterior',
    nextProject: 'Proyecto siguiente',
    countOf: (i, n) => `${i} de ${n}`,
    groups: { code: 'Lenguajes y herramientas', cloud: 'Nube e integración', ai: 'Inteligencia artificial' },
    defectsDone: 'Build verde. Todos los defectos corregidos.',
    defectsProgress: (f, n) => `Defectos corregidos: ${f} de ${n}`,
    defectsHintDone: 'Sigue bajando para ver mi trabajo.',
    defectsHint: 'Gira el cristal arrastrando. Toca cada defecto magenta para corregirlo.',
    toastGreen: 'Build verde: todos los defectos corregidos',
    toastFixed: (c, n) => `Defecto corregido: ${c} de ${n}`,
    skillHintTitle: 'Elige un nodo',
    skillHint: 'Pasa el cursor o toca una habilidad. Cada anillo que la orbita es un año de experiencia (de 1 a 3).',
    years: (n) => `${n} ${n === 1 ? 'año' : 'años'}`,
    yearsAria: (n) => `${n} ${n === 1 ? 'año' : 'años'} de experiencia`,
    since: 'desde',
    certView: (title) => `Ver certificado: ${title}`,
    certAlt: (title) => `Certificado: ${title}`,
    close: 'Cerrar',
    earned: 'Obtenida',
    expires: 'Vence',
    pendingPhoto: 'La imagen del certificado se agregará pronto.',
    errName: 'Escribe tu nombre.',
    errEmail: 'Revisa tu correo: parece incompleto.',
    errMessage: 'El mensaje es muy corto. Cuéntame un poco más.',
    sending: 'Enviando...',
    sent: 'Mensaje enviado. Gracias, te respondo pronto.',
    sentToast: 'Mensaje enviado',
    sendFail: 'No se pudo enviar. Inténtalo de nuevo en un momento o escríbeme por GitHub.',
    subject: (name) => `Nuevo mensaje de ${name} desde Portafolio-John-Guaman`,
    toLight: 'Cambiar a tema claro',
    toDark: 'Cambiar a tema oscuro',
    menu: 'Abrir menú',
    toLang: 'Cambiar idioma a inglés',
    langBtn: 'EN',
    metaDescription: 'Portafolio 3D interactivo de John Guaman: agentes de IA y desarrollo de software.',
    ogDescription: 'Gira el cristal, corrige los defectos y recorre mis proyectos en 3D.',
    noscript: 'Este portafolio necesita JavaScript para mostrar la escena 3D. Mi GitHub:',
    locale: 'es-EC',
  },
  en: {
    skip: 'Skip to content',
    loader: 'Calibrating the lab',
    home: 'Go to home',
    sections: 'Sections',
    cv: 'Download CV',
    cvFull: 'Download full CV',
    viewProjects: 'View projects',
    contact: 'Contact',
    projects: 'Projects',
    skills: 'Skills',
    certs: 'Certifications',
    path: 'Career',
    contactTitle: 'If something breaks, let’s talk',
    contactCopy: 'Tell me what you are building. I reply by email.',
    fName: 'Name',
    fEmail: 'Email',
    fMessage: 'Message',
    send: 'Send message',
    cvTitle: 'Resume',
    cvSub: 'Download it as a PDF if you need it.',
    copyMail: 'Copy email',
    mailCopied: 'Email copied',
    openRepo: 'Open repository',
    openRepoOf: (n) => `Open repository of ${n}`,
    prevProject: 'Previous project',
    nextProject: 'Next project',
    countOf: (i, n) => `${i} of ${n}`,
    groups: { code: 'Languages and tools', cloud: 'Cloud and integration', ai: 'Artificial intelligence' },
    defectsDone: 'Green build. All defects fixed.',
    defectsProgress: (f, n) => `Defects fixed: ${f} of ${n}`,
    defectsHintDone: 'Keep scrolling to see my work.',
    defectsHint: 'Drag to rotate the crystal. Tap each magenta defect to fix it.',
    toastGreen: 'Green build: all defects fixed',
    toastFixed: (c, n) => `Defect fixed: ${c} of ${n}`,
    skillHintTitle: 'Pick a node',
    skillHint: 'Hover or tap a skill. Each ring orbiting it is one year of experience (1 to 3).',
    years: (n) => `${n} ${n === 1 ? 'year' : 'years'}`,
    yearsAria: (n) => `${n} ${n === 1 ? 'year' : 'years'} of experience`,
    since: 'since',
    certView: (title) => `View certificate: ${title}`,
    certAlt: (title) => `Certificate: ${title}`,
    close: 'Close',
    earned: 'Earned',
    expires: 'Expires',
    pendingPhoto: 'The certificate image will be added soon.',
    errName: 'Enter your name.',
    errEmail: 'Check your email: it looks incomplete.',
    errMessage: 'The message is too short. Tell me a bit more.',
    sending: 'Sending...',
    sent: 'Message sent. Thank you, I will reply soon.',
    sentToast: 'Message sent',
    sendFail: 'Could not send. Try again in a moment or reach me on GitHub.',
    subject: (name) => `New message from ${name} via Portafolio-John-Guaman`,
    toLight: 'Switch to light theme',
    toDark: 'Switch to dark theme',
    menu: 'Open menu',
    toLang: 'Switch language to Spanish',
    langBtn: 'ES',
    metaDescription: 'Interactive 3D portfolio of John Guaman: AI agents and software development.',
    ogDescription: 'Spin the crystal, fix the defects and tour my projects in 3D.',
    noscript: 'This portfolio needs JavaScript to show the 3D scene. My GitHub:',
    locale: 'en-US',
  },
};

export const t = STR[lang];

// Textos fijos del documento (título de la pestaña y metadatos).
export function applyDocumentLanguage() {
  document.documentElement.lang = lang;
  const set = (sel, attr, value) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', 'content', t.metaDescription);
  set('meta[property="og:description"]', 'content', t.ogDescription);
  const skip = document.querySelector('.skip');
  if (skip) skip.textContent = t.skip;
  const loader = document.querySelector('.loader__text');
  if (loader) loader.textContent = t.loader;
  const ns = document.querySelector('.noscript');
  if (ns && ns.firstChild) ns.firstChild.textContent = `${t.noscript} `;
}

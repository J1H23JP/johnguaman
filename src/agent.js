// Agente demo: responde preguntas sobre John usando solo el contenido del portafolio.
// No usa modelo de lenguaje ni servidor. Hace recuperacion de fragmentos (BM25) sobre una base de
// conocimiento armada con los mismos datos de la pagina, calcula la cobertura de la pregunta (confiabilidad),
// cita la fuente y, si no sabe o no le corresponde responder, pasa la pregunta a John por el formulario.

import { profile, about, journey, projects, skills, certifications, sections } from './data/content.js';
import { t, lang } from './i18n.js';
import { toast, certStatus } from './ui.js';
import { ttsSupported, sttSupported, speak, stopSpeaking, createDictation } from './voice.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ----------------------------------------------------------------------------- Textos

const STR = {
  es: {
    launcher: 'Agente',
    heroBtn: 'Pregúntale a mi agente',
    title: 'Agente de John',
    sub: 'Demo sin modelo de lenguaje: busca en el CV de John, cita la fuente y dice qué tan seguro está. Si no sabe, te pasa con él.',
    hello:
      'Hola, soy el agente de John. Respondo solo con lo que está en su CV y portafolio. Pregúntame por su experiencia, habilidades, proyectos o certificaciones.',
    placeholder: 'Escribe tu pregunta...',
    send: 'Enviar',
    close: 'Cerrar agente',
    // Preguntas sugeridas segun la seccion donde esta la persona.
    bySection: {
      inicio: ['¿Qué hace John en TCS?', '¿Qué certificaciones tiene?', '¿Qué tecnologías domina?', '¿Cómo lo contacto?'],
      'sobre-mi': ['¿Quién es John?', '¿Dónde estudió?', '¿Dónde vive?', '¿Cómo funciona este agente?'],
      proyectos: ['¿Qué proyectos tiene?', '¿De qué trata Agentes v2?', '¿Qué es MCP UI components?', '¿Tiene algún proyecto de QA?'],
      habilidades: ['¿Qué sabe de IA?', '¿Cuántos años de Python tiene?', '¿Qué usa de Azure?', '¿Qué es RAG para John?'],
      certificaciones: ['¿Qué certificaciones tiene?', '¿Siguen vigentes sus certificaciones?', '¿Qué nivel de inglés tiene?', '¿Qué ganó en la universidad?'],
      trayectoria: ['¿Qué hace John en TCS?', '¿Qué hizo en la UNACH?', '¿Qué hizo en Puela?', '¿Qué ganó en la universidad?'],
      contacto: ['¿Cómo lo contacto?', '¿Tiene LinkedIn?', '¿Dónde descargo su CV?', '¿Cómo funciona este agente?'],
    },
    jobOpen: 'Comparar con una oferta',
    jobBack: 'Volver a las preguntas',
    jobPlaceholder: 'Pega aquí la descripción del puesto (tecnologías, años de experiencia, idioma)...',
    jobAnalyze: 'Analizar oferta',
    jobIntro:
      'Pega la descripción de una oferta. Busco en ella tecnologías, años de experiencia, idioma y formación, y las comparo con el CV de John. Lo que no aparezca lo marco como "no está en su CV", no como "no sabe": puede existir y no estar escrito.',
    jobPasted: (n) => `Oferta pegada (${n} caracteres)`,
    jobTitle: 'Comparación con la oferta',
    jobSummary: (n, total) =>
      `Reconocí ${total} ${total === 1 ? 'requisito técnico' : 'requisitos técnicos'} en la oferta. ${n} ${n === 1 ? 'aparece' : 'aparecen'} en el CV de John.`,
    jobNoMatch: 'No encontré coincidencias directas con el CV. Puede que falten datos en el CV, así que conviene consultarlo con John.',
    jobMatched: 'Aparecen en su CV',
    jobGaps: 'No aparecen en su CV',
    jobRelated: (list) => `cercano en su CV: ${list}`,
    jobVerify: 'Para confirmar con John',
    jobMatchLabel: 'Coincidencia',
    jobNote: 'Es una comparación por palabras clave sobre una lista de tecnologías comunes: no mide capacidad ni reemplaza una entrevista.',
    jobTooFew:
      'No pude reconocer suficientes requisitos técnicos en ese texto (busco una lista de tecnologías comunes). Puedes pasarle la oferta a John para que la revise él.',
    jobDegreeOk: 'La oferta pide formación universitaria: John tiene el título de Ingeniería en Tecnologías de la Información (UNACH).',
    jobYearsOk: (n) => `La oferta pide ${n} años de experiencia: las habilidades de John llevan de 1 a 3 años en su CV.`,
    jobYearsHigh: (n, max) => `La oferta pide ${n} años de experiencia; la habilidad más larga en su CV lleva ${max}.`,
    jobEnglishOk: 'La oferta menciona inglés: John tiene nivel B1.',
    jobEnglishHigh: 'La oferta pide un nivel de inglés alto; John tiene nivel B1.',
    jobHandoff: 'Escribirle a John sobre esta oferta',
    jobPrefill: (matched, gaps, excerpt) =>
      `Hola John, comparé tu portafolio con esta oferta:\n\n"${excerpt}"\n\nCoincide en: ${matched.join(', ') || 'nada reconocido'}.\nNo aparece en tu CV: ${gaps.join(', ') || 'nada'}.\n\nMe gustaría hablar contigo.\n\n`,
    jobHint: 'Si tienes la descripción de una oferta, pulsa "Comparar con una oferta" y pégala: la comparo con el CV de John.',
    listen: 'Escuchar',
    stopListen: 'Detener lectura',
    mic: 'Dictar la pregunta',
    micStop: 'Detener dictado',
    micNotice:
      'Dictado por voz: tu navegador procesa el audio (en Chrome, con el servicio de reconocimiento de voz de Google). John no recibe tu audio ni lo guarda.',
    micDenied: 'No tengo permiso para usar el micrófono. Revísalo en la configuración del navegador.',
    micNoSpeech: 'No te escuché. Inténtalo de nuevo.',
    micFail: 'El dictado no está disponible ahora. Puedes escribir tu pregunta.',
    copy: 'Copiar respuesta',
    copied: 'Respuesta copiada',
    clear: 'Nueva conversación',
    cleared: 'Conversación reiniciada',
    steps: ['Buscando en el CV...', 'Verificando fuentes...'],
    conf: 'Confiabilidad',
    levels: { high: 'alta', mid: 'media', low: 'baja' },
    sources: 'Fuentes',
    how: 'Cómo decidí',
    howLines: {
      query: 'Pregunta',
      terms: 'Términos buscados',
      none: 'ninguno',
      best: 'Mejor coincidencia',
      coverage: 'Cobertura',
      decision: 'Decisión',
    },
    decisions: {
      answer: 'responder con fuente',
      hedge: 'responder con reservas',
      handoff: 'pasar a una persona',
      refuse: 'no responder y pasar a una persona',
    },
    caveatTerms: (terms) => `No encontré información sobre ${terms.join(', ')}. Esto es lo más cercano que hay en su CV:`,
    caveat: 'No estoy del todo seguro de que esto responda tu pregunta. Esto es lo más cercano que hay en su CV:',
    noInfo: 'Eso no está en el CV ni en el portafolio de John, y prefiero no inventarlo. Puedo pasarle tu pregunta para que te responda él.',
    isPrivate: 'Esa información la decide John, no yo. Puedo pasarle tu pregunta para que te responda él.',
    injection: 'No tengo instrucciones ocultas que se puedan cambiar: solo busco en el CV de John y cito la fuente. Si quieres, pregúntame por su trabajo.',
    offTopic: 'Solo respondo sobre John: su experiencia, habilidades, proyectos y certificaciones. Para otra cosa, mejor habla con él.',
    greet: 'Hola. ¿Qué te gustaría saber de John?',
    thanks: 'De nada. Si quieres saber algo más, aquí sigo.',
    empty: 'Escribe una pregunta sobre John.',
    handoffBtn: 'Escribirle a John con mi pregunta',
    handoffToast: 'Pregunta añadida al formulario',
    prefill: (q) => `Hola John, le hice esta pregunta a tu agente y no pudo responderla:\n\n"${q}"\n\n`,
    openLink: 'Abrir',
    kb: {
      who: 'Quién es John',
      location: 'Ubicación',
      english: 'Idioma',
      contact: 'Cómo contactarlo',
      site: 'Este portafolio',
      agent: 'Cómo funciona este agente',
      locationText: 'Su ubicación es Quito, Ecuador.',
      englishText: 'Tiene suficiencia en inglés, nivel B1.',
      contactText:
        'La mejor forma de contactarlo es el formulario de la sección Contacto: su mensaje le llega por correo. También puedes escribirle por LinkedIn, revisar su GitHub y descargar su CV.',
      siteText:
        'Este portafolio está hecho con three.js y Vite. El cristal con defectos, la constelación de habilidades y el globo de red son escenas 3D propias.',
      agentText:
        'Soy una demo sin modelo de lenguaje ni servidor. Separo tu pregunta en términos, los busco en el CV y el portafolio, calculo cuánta de tu pregunta pude cubrir (la confiabilidad) y cito la fuente. Si la cobertura es baja, no respondo: te paso con John.',
      jobTitle: 'Comparar con una oferta',
      jobText:
        'Puedo comparar una oferta de trabajo con el perfil de John: pega la descripción con el botón "Comparar con una oferta" y te digo qué tecnologías coinciden y cuáles no aparecen.',
      printTitle: 'Imprimir o guardar en PDF',
      printText:
        'Puedes imprimir el portafolio o guardarlo como PDF con el botón "Imprimir / PDF" de la sección Contacto o desde la paleta de comandos. Sale una versión limpia, sin el 3D, con el perfil, la experiencia, las habilidades, los proyectos y las certificaciones.',
      paletteTitle: 'Paleta de comandos',
      paletteText:
        'Con Ctrl + K (Cmd + K en Mac) se abre una paleta para ir a una sección, cambiar el idioma o el tema, abrir el agente, descargar el CV o escribirle a John.',
      installTitle: 'App instalable y sin conexión',
      installText:
        'El portafolio se puede instalar como app en el celular o la computadora y abrir sin conexión, después de haberlo visitado una vez. El formulario de contacto sí necesita internet.',
      voiceTitle: 'Voz',
      voiceText: 'Puedes dictar tu pregunta con el micrófono y escuchar las respuestas en voz alta, si tu navegador lo permite.',
      validTitle: 'Vigencia',
      validNoExpiry: 'no vencen (Fundamentals de Microsoft)',
      validRest: 'Las demás no tienen fecha de vencimiento registrada.',
      eduTitle: 'Formación',
      eduText: 'Estudió Ingeniería en Tecnologías de la Información en la Universidad Nacional de Chimborazo (UNACH), de 2022 a 2026, y ya tiene el título.',
      expTitle: 'Experiencia',
      skillsTitle: 'Habilidades',
      certsTitle: 'Certificaciones',
      projectsTitle: 'Proyectos',
    },
  },
  en: {
    launcher: 'Agent',
    heroBtn: 'Ask my agent',
    title: 'John’s agent',
    sub: 'A demo without a language model: it searches John’s CV, cites its source and says how sure it is. If it does not know, it hands you over to him.',
    hello:
      'Hi, I am John’s agent. I only answer with what is in his CV and portfolio. Ask me about his experience, skills, projects or certifications.',
    placeholder: 'Type your question...',
    send: 'Send',
    close: 'Close agent',
    bySection: {
      inicio: ['What does John do at TCS?', 'Which certifications does he have?', 'Which technologies does he know?', 'How can I contact him?'],
      'sobre-mi': ['Who is John?', 'Where did he study?', 'Where does he live?', 'How does this agent work?'],
      proyectos: ['Which projects does he have?', 'What is Agentes v2 about?', 'What is MCP UI components?', 'Does he have a QA project?'],
      habilidades: ['What does he know about AI?', 'How many years of Python does he have?', 'What does he use from Azure?', 'What is RAG for John?'],
      certificaciones: ['Which certifications does he have?', 'Are his certifications still valid?', 'What is his English level?', 'What did he win at university?'],
      trayectoria: ['What does John do at TCS?', 'What did he do at UNACH?', 'What did he do at Puela?', 'What did he win at university?'],
      contacto: ['How can I contact him?', 'Is he on LinkedIn?', 'Where can I download his CV?', 'How does this agent work?'],
    },
    jobOpen: 'Compare with a job offer',
    jobBack: 'Back to questions',
    jobPlaceholder: 'Paste the job description here (technologies, years of experience, language)...',
    jobAnalyze: 'Analyze offer',
    jobIntro:
      'Paste a job description. I look for technologies, years of experience, language and education, and compare them with John’s CV. Whatever does not appear I mark as "not in his CV", not as "does not know": it may exist without being written down.',
    jobPasted: (n) => `Offer pasted (${n} characters)`,
    jobTitle: 'Comparison with the offer',
    jobSummary: (n, total) =>
      `I recognized ${total} technical ${total === 1 ? 'requirement' : 'requirements'} in the offer. ${n} ${n === 1 ? 'appears' : 'appear'} in John’s CV.`,
    jobNoMatch: 'I found no direct matches with the CV. The CV may be missing information, so it is worth asking John.',
    jobMatched: 'Appear in his CV',
    jobGaps: 'Do not appear in his CV',
    jobRelated: (list) => `close in his CV: ${list}`,
    jobVerify: 'To confirm with John',
    jobMatchLabel: 'Match',
    jobNote: 'This is a keyword comparison over a list of common technologies: it does not measure ability or replace an interview.',
    jobTooFew:
      'I could not recognize enough technical requirements in that text (I look for a list of common technologies). You can pass the offer to John so he reviews it.',
    jobDegreeOk: 'The offer asks for a university degree: John holds a degree in Information Technology Engineering (UNACH).',
    jobYearsOk: (n) => `The offer asks for ${n} years of experience: John’s skills cover 1 to 3 years in his CV.`,
    jobYearsHigh: (n, max) => `The offer asks for ${n} years of experience; the longest skill in his CV covers ${max}.`,
    jobEnglishOk: 'The offer mentions English: John has level B1.',
    jobEnglishHigh: 'The offer asks for a high English level; John has level B1.',
    jobHandoff: 'Write to John about this offer',
    jobPrefill: (matched, gaps, excerpt) =>
      `Hi John, I compared your portfolio with this offer:\n\n"${excerpt}"\n\nMatches: ${matched.join(', ') || 'nothing recognized'}.\nNot in your CV: ${gaps.join(', ') || 'nothing'}.\n\nI would like to talk to you.\n\n`,
    jobHint: 'If you have a job description, press "Compare with a job offer" and paste it: I compare it with John’s CV.',
    listen: 'Listen',
    stopListen: 'Stop reading',
    mic: 'Dictate the question',
    micStop: 'Stop dictation',
    micNotice:
      'Voice dictation: your browser processes the audio (in Chrome, through Google’s speech recognition service). John does not receive or store your audio.',
    micDenied: 'I do not have permission to use the microphone. Check your browser settings.',
    micNoSpeech: 'I did not hear you. Try again.',
    micFail: 'Dictation is not available right now. You can type your question.',
    copy: 'Copy answer',
    copied: 'Answer copied',
    clear: 'New conversation',
    cleared: 'Conversation reset',
    steps: ['Searching the CV...', 'Checking sources...'],
    conf: 'Confidence',
    levels: { high: 'high', mid: 'medium', low: 'low' },
    sources: 'Sources',
    how: 'How I decided',
    howLines: {
      query: 'Question',
      terms: 'Search terms',
      none: 'none',
      best: 'Best match',
      coverage: 'Coverage',
      decision: 'Decision',
    },
    decisions: {
      answer: 'answer with a source',
      hedge: 'answer with reservations',
      handoff: 'hand over to a person',
      refuse: 'do not answer and hand over to a person',
    },
    caveatTerms: (terms) => `I found nothing about ${terms.join(', ')}. This is the closest thing in his CV:`,
    caveat: 'I am not fully sure this answers your question. This is the closest thing in his CV:',
    noInfo: 'That is not in John’s CV or portfolio, and I would rather not make it up. I can pass your question to him so he answers you.',
    isPrivate: 'That is for John to decide, not me. I can pass your question to him so he answers you.',
    injection: 'I have no hidden instructions to change: I only search John’s CV and cite the source. If you like, ask me about his work.',
    offTopic: 'I only answer about John: his experience, skills, projects and certifications. For anything else, better talk to him.',
    greet: 'Hi. What would you like to know about John?',
    thanks: 'You are welcome. If you want to know anything else, I am here.',
    empty: 'Type a question about John.',
    handoffBtn: 'Write to John with my question',
    handoffToast: 'Question added to the form',
    prefill: (q) => `Hi John, I asked your agent this question and it could not answer it:\n\n"${q}"\n\n`,
    openLink: 'Open',
    kb: {
      who: 'Who John is',
      location: 'Location',
      english: 'Language',
      contact: 'How to contact him',
      site: 'This portfolio',
      agent: 'How this agent works',
      locationText: 'He is based in Quito, Ecuador.',
      englishText: 'He has English proficiency at level B1.',
      contactText:
        'The best way to contact him is the form in the Contact section: his message arrives by email. You can also write to him on LinkedIn, check his GitHub and download his CV.',
      siteText:
        'This portfolio is built with three.js and Vite. The crystal with defects, the skills constellation and the network globe are custom 3D scenes.',
      agentText:
        'I am a demo with no language model and no server. I split your question into terms, search them in the CV and portfolio, compute how much of your question I could cover (the confidence) and cite the source. If coverage is low, I do not answer: I hand you over to John.',
      jobTitle: 'Compare with a job offer',
      jobText:
        'I can compare a job offer with John’s profile: paste the description with the "Compare with a job offer" button and I tell you which technologies match and which do not appear.',
      printTitle: 'Print or save as PDF',
      printText:
        'You can print the portfolio or save it as a PDF with the "Print / PDF" button in the Contact section or from the command palette. It comes out as a clean version, without the 3D, with the profile, experience, skills, projects and certifications.',
      paletteTitle: 'Command palette',
      paletteText:
        'Ctrl + K (Cmd + K on Mac) opens a palette to jump to a section, switch language or theme, open the agent, download the CV or write to John.',
      installTitle: 'Installable and offline',
      installText:
        'The portfolio can be installed as an app on your phone or computer and opened offline, after visiting it once. The contact form does need internet.',
      voiceTitle: 'Voice',
      voiceText: 'You can dictate your question with the microphone and listen to the answers out loud, if your browser allows it.',
      validTitle: 'Expiration and validity',
      validNoExpiry: 'do not expire (Microsoft Fundamentals)',
      validRest: 'The others have no expiration date on record.',
      eduTitle: 'Education',
      eduText: 'He studied Information Technology Engineering at Universidad Nacional de Chimborazo (UNACH), from 2022 to 2026, and already holds the degree.',
      expTitle: 'Experience',
      skillsTitle: 'Skills',
      certsTitle: 'Certifications',
      projectsTitle: 'Projects',
    },
  },
};
const S = STR[lang];

// ----------------------------------------------------------------------------- Texto

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
const words = (s) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
const stem = (w) => {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (/(ciones|siones|dades)$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  return w;
};

const STOP = new Set(
  (
    'a al algo ante como con cual cuales cuando cuanto cuantos cuanta de del desde donde el ella ellos en entre es esta estan este esto ' +
    'la las le les lo los me mi mis mas muy no o para pero por que se ser si sin sobre su sus te tu tus un una uno unas unos y ya hay fue son ' +
    'algun alguna alguno algunos tiene tienen tienes hace hacen hizo puede pueden poder ha han he dime cuentame quiero quisiera favor usted ' +
    'and are as at be by can could did do does for from has have he her him his how i in is it its me of on or please she tell that the ' +
    'some their them they this to us was we were what when where which why will with would you your about also any all do john guaman trata tratan many much siguen sigue'
  ).split(' ')
);

// Grupos de sinonimos (es/en) para ampliar la pregunta.
const GROUPS = [
  'trabaja trabajo trabajar empleo empresa laboral experiencia work job employer company experience career',
  'estudio estudia estudiar estudios universidad carrera titulo grado graduado educacion study studies degree university education graduate',
  'habilidad tecnologia herramienta stack sabe domina dominar lenguaje skill technology tool language',
  'certificacion certificado certificate certification credencial badge curso',
  'proyecto repositorio repo github project repository',
  'contacto contactar contactarlo escribir correo email mensaje formulario linkedin contact reach message',
  'ia ai agente agentes agent agents llm rag mcp',
  'vive ubicacion ciudad pais live location city country',
].map((g) => g.split(' ').map((w) => stem(norm(w))));
const GROUP_OF = new Map();
GROUPS.forEach((g, i) => g.forEach((w) => GROUP_OF.set(w, i)));
// Palabras genericas (excepto las de IA): no cuentan para dar prioridad por coincidencia en el titulo.
const GENERIC = new Set([...GROUP_OF].filter(([, i]) => i !== 6).map(([w]) => w));

// ----------------------------------------------------------------------------- Base de conocimiento

const KW = {
  job: 'trabaja trabajo trabajar empleo empresa laboral experiencia carrera work job employer company experience career',
  edu: 'estudio estudia estudiar estudios universidad titulo grado graduado educacion carrera study studies degree university education graduate',
  skills: 'habilidad habilidades tecnologia tecnologias herramienta herramientas stack sabe domina dominar lenguaje skill skills technology tools know',
  certs: 'certificacion certificaciones certificado certificados credencial curso certificate certification badge',
  projects: 'proyecto proyectos repositorio repo github portafolio project projects repository built build made created construyo creo hecho',
  ai: 'ia ai agente agentes agent agents llm rag mcp inteligencia artificial',
};

function buildKB() {
  const kb = [];
  const add = (c) => kb.push({ kw: '', links: [], ...c });
  const solo = true;
  const label = (id) => (sections.find((s) => s.id === id) || {}).label || id;
  const fmt = (iso) => new Intl.DateTimeFormat(t.locale, { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(iso));

  add({
    section: 'sobre-mi',
    title: S.kb.who,
    solo,
    noBoost: true,
    text: `${profile.name}: ${profile.role}. ${profile.headline}`,
    kw: 'quien quienes persona perfil presentacion sobre about who profile introduce',
  });
  about.paragraphs.forEach((p) =>
    add({ section: 'sobre-mi', title: about.title, text: p, kw: 'confiable confiabilidad guardrails revision humana trust trustworthy ' + KW.ai })
  );
  add({ section: 'trayectoria', title: S.kb.eduTitle, solo, text: S.kb.eduText, kw: KW.edu + ' unach donde estudio estudia estudio where studied' });
  add({ section: 'sobre-mi', title: S.kb.location, solo, text: S.kb.locationText, kw: 'donde vive ubicacion ciudad pais ecuador quito where live location city country based' });
  add({ section: 'certificaciones', title: S.kb.english, solo, text: S.kb.englishText, kw: 'ingles idioma idiomas habla hablar english language speak b1 nivel level' });
  add({
    section: 'contacto',
    title: S.kb.contact,
    solo,
    text: S.kb.contactText,
    kw: 'contacto contactar contactarlo correo email escribir mensaje formulario linkedin hablar contratar cv curriculum resume descargar descargo descarga bajar download contact reach message form hire talk',
    links: [
      { label: 'LinkedIn', url: profile.linkedin },
      { label: 'GitHub', url: profile.github },
      { label: t.cv, url: profile.cv },
    ].filter((l) => l.url),
  });
  add({ section: 'sobre-mi', title: S.kb.site, solo, noEvidence: true, text: S.kb.siteText, kw: 'portafolio sitio web pagina hecho construido threejs vite 3d portfolio website site built made technology' });
  add({ section: 'sobre-mi', title: S.kb.agent, solo, noEvidence: true, text: S.kb.agentText, kw: 'agente demo funciona funcionamiento chatbot modelo servidor agent works chatbot model llm server trust confianza' });
  add({
    section: 'sobre-mi',
    title: S.kb.jobTitle,
    solo,
    noEvidence: true,
    text: S.kb.jobText,
    kw: 'oferta ofertas vacante vacantes comparar compatibilidad compatible encaja requisitos puesto trabajo job offer vacancy compare match fit requirements position',
  });
  add({
    section: 'contacto',
    title: S.kb.printTitle,
    solo,
    noEvidence: true,
    text: S.kb.printText,
    kw: 'imprimir impresion pdf guardar papel hoja imprime print printing save paper page document',
  });
  add({
    section: 'sobre-mi',
    title: S.kb.paletteTitle,
    solo,
    noEvidence: true,
    text: S.kb.paletteText,
    kw: 'atajo atajos teclado paleta comandos ctrl buscar shortcut shortcuts keyboard palette command commands search',
  });
  add({
    section: 'sobre-mi',
    title: S.kb.installTitle,
    solo,
    noEvidence: true,
    text: S.kb.installText,
    kw: 'instalar instalable app aplicacion offline conexion internet pwa celular movil install installable connection phone mobile',
  });
  add({
    section: 'sobre-mi',
    title: S.kb.voiceTitle,
    solo,
    noEvidence: true,
    text: S.kb.voiceText,
    kw: 'voz microfono dictar dictado escuchar audio hablar leer voice microphone dictate listen speak speech read aloud',
  });

  // Experiencia y formacion.
  add({
    section: 'trayectoria',
    title: S.kb.expTitle,
    solo,
    noEvidence: true,
    text: journey.map((s) => `${s.org} (${s.period})`).join('; ') + '.',
    kw: KW.job + ' ' + KW.edu,
  });
  const ALIAS = { 'Tata Consultancy': 'tcs tata', 'Calidad': 'unach calidad', 'Quality': 'unach quality', 'Puela': 'gad puela', 'Universidad Nacional de Chimborazo': 'unach' };
  const ACHIEVE = /ganador|winner|congres|demos?\b/i;
  journey.forEach((step, gi) => {
    const alias = Object.entries(ALIAS).filter(([k]) => step.org.includes(k)).map(([, v]) => v).join(' ');
    add({ section: 'trayectoria', title: step.org, alias, group: gi, text: `${step.focus}. ${step.period}.`, kw: KW.job + ' ' + alias });
    step.points.forEach((p) => {
      const text = typeof p === 'string' ? p : p.text;
      const links = typeof p === 'object' && p.link ? [{ label: p.link.label, url: p.link.url }] : [];
      const extra = ACHIEVE.test(text) ? ' logro logros ganador gano concurso premio reconocimiento achievement achievements win won winner award contest congress' : '';
      add({ section: 'trayectoria', title: step.org, alias, group: gi, text, links, kw: extra });
    });
  });

  // Habilidades.
  const groups = [...new Set(skills.map((s) => s.group))];
  groups.forEach((g) =>
    add({
      section: 'habilidades',
      title: `${S.kb.skillsTitle}: ${t.groups[g]}`,
      text: skills.filter((s) => s.group === g).map((s) => s.name).join(', ') + '.',
      alias: g === 'ai' ? 'ia ai' : '',
      kw: KW.skills + ' ' + (g === 'ai' ? KW.ai : ''),
    })
  );
  skills.forEach((s) =>
    add({
      section: 'habilidades',
      title: s.name,
      text: `${t.years(s.years)} ${t.since} ${s.since}. ${s.summary} ${s.used.join('. ')}.`,
      kw: 'experiencia experience usa usar utiliza uses use used ' + (s.group === 'ai' ? KW.ai : ''),
    })
  );

  // Certificaciones.
  add({
    section: 'certificaciones',
    title: S.kb.certsTitle,
    solo,
    noEvidence: true,
    text: certifications.map((c) => c.title).join('; ') + '.',
    kw: KW.certs + ' ' + KW.edu,
  });
  certifications.forEach((c) => {
    const st = certStatus(c);
    add({
      section: 'certificaciones',
      title: c.title,
      text: `${c.issuer}${c.date ? `, ${fmt(c.date)}` : ''}. ${c.code}.${st ? ` ${st.label}.` : ''}`,
      kw: c.code,
    });
  });
  // Vigencia: solo se afirma lo que los datos registran (fecha de vencimiento o "no vence").
  const withStatus = certifications.filter((c) => certStatus(c));
  if (withStatus.length) {
    const dated = withStatus.filter((c) => !c.noExpiry).map((c) => `${c.code}: ${certStatus(c).label.toLowerCase()}`);
    const forever = withStatus.filter((c) => c.noExpiry).map((c) => c.code);
    const parts = [...dated];
    if (forever.length) parts.push(`${forever.join(', ')}: ${S.kb.validNoExpiry}`);
    add({
      section: 'certificaciones',
      title: S.kb.validTitle,
      solo,
      noEvidence: true,
      text: `${parts.join('. ')}. ${S.kb.validRest}`,
      kw: 'vigente vigentes vigencia vence vencen vencimiento expira expiran caduca caducan actuales certificacion certificaciones certificate certification valid validity current expire expires expiry expiration still',
    });
  }

  // Proyectos.
  add({ section: 'proyectos', title: S.kb.projectsTitle, solo, noEvidence: true, text: projects.map((p) => p.title).join(', ') + '.', kw: KW.projects });
  projects.forEach((p) =>
    add({
      section: 'proyectos',
      title: p.title,
      text: `${p.description} (${p.stack.join(', ')}).`,
      links: [{ label: 'GitHub', url: p.url }],
    })
  );

  return kb.map((c, i) => ({ ...c, id: i, sectionLabel: label(c.section) }));
}

// ----------------------------------------------------------------------------- Recuperacion (BM25)

const KB = buildKB();
const K1 = 1.2;
const B = 0.75;
let avgLen = 0;
const df = new Map();
KB.forEach((c) => {
  const toks = words(`${c.title} ${c.text} ${c.kw}`).filter((w) => !STOP.has(w)).map(stem);
  c.tf = new Map();
  toks.forEach((w) => c.tf.set(w, (c.tf.get(w) || 0) + 1));
  c.len = toks.length;
  c.titleSet = new Set(words(`${c.title} ${c.alias || ''}`).filter((w) => !STOP.has(w)).map(stem));
  avgLen += toks.length;
  c.tf.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1));
});
avgLen /= KB.length;
const idf = (w) => Math.log(1 + (KB.length - (df.get(w) || 0) + 0.5) / ((df.get(w) || 0) + 0.5));

function analyze(query) {
  const original = new Map(); // tallo -> palabra escrita por la persona
  words(query).forEach((w) => {
    if (STOP.has(w)) return;
    const s = stem(w);
    if (!original.has(s)) original.set(s, w);
  });
  return original;
}

function scoreChunk(c, q) {
  let score = 0;
  let total = 0;
  let matched = 0;
  const unmatched = [];
  q.forEach((word, s) => {
    const w = idf(s);
    total += w;
    let weight = 0;
    if (c.tf.has(s)) weight = 1;
    else {
      const g = GROUP_OF.get(s);
      if (g !== undefined && GROUPS[g].some((m) => c.tf.has(m))) weight = 0.6;
    }
    if (weight) {
      matched += w * Math.min(1, weight + 0.2);
      const tf = c.tf.get(s) || 1;
      score += weight * w * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * c.len) / avgLen)));
    } else {
      unmatched.push(word);
    }
  });
  const titleHit = [...q.keys()].some((k) => c.titleSet.has(k) && !GENERIC.has(k));
  const boost = (titleHit ? 1.5 : 1) * (c.solo && !c.noBoost ? 1.3 : 1);
  return { chunk: c, score: score * boost, titleHit, coverage: total ? Math.min(1, matched / total) : 0, unmatched };
}

// ----------------------------------------------------------------------------- Decision

const RX = {
  greet: /^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|hi|hello|good morning|good afternoon)\b/,
  thanks: /\b(gracias|muchas gracias|thanks|thank you)\b/,
  injection:
    /(ignora|ignore|olvida|forget|omite).{0,40}(instrucciones|instructions|prompt|reglas|rules)|system prompt|prompt del sistema|jailbreak|modo desarrollador|developer mode|actua como|act as|finge ser|pretend (to be|you)/,
  private:
    /(sueldo|salario|pretension salarial|expectativa salarial|cuanto (cobra|gana)|salary|how much (does|do|would) .{0,20}(earn|make|charge|cost)|pay expectation|rate per)|(disponible|disponibilidad|contratar|contratarlo|busca trabajo|esta buscando|open to work|available for|availability|hire him|looking for (a )?(job|work))/,
  sensitive:
    /(telefono|celular|whatsapp|phone|direccion|address|edad|cuantos anos tiene|how old|cedula|dni|pareja|novia|esposa|religion|politic|salud|health|contrasena|password)/,
  offTopic:
    /((escribe|escribeme|genera|crea|redacta|write|generate|create|draft).{0,30}(codigo|code|script|programa|funcion|ensayo|poema|poem|essay|correo|email))|(resuelve|solve|traduce|translate|resume este|summarize this)/,
  job: /(job (offer|description|posting|ad)|vacancy|oferta (de trabajo|laboral|de empleo)|vacante|descripcion del puesto|compar\w+ .{0,25}(oferta|vacante|puesto|offer|vacancy))/,
};

function respond(question) {
  const q = norm(question).trim();
  const trace = { question, terms: [], best: null, coverage: 0, decision: 'answer' };

  if (!q) return { kind: 'text', text: S.empty, trace: null };
  if (RX.injection.test(q)) return { kind: 'text', text: S.injection, trace: { ...trace, decision: 'refuse' }, confidence: null };
  if (RX.greet.test(q) && words(q).length <= 4) return { kind: 'text', text: S.greet, trace: null };
  if (RX.thanks.test(q) && words(q).length <= 5) return { kind: 'text', text: S.thanks, trace: null };
  if (RX.private.test(q) || RX.sensitive.test(q))
    return { kind: 'handoff', text: S.isPrivate, question, trace: { ...trace, decision: 'refuse' } };
  if (RX.offTopic.test(q)) return { kind: 'handoff', text: S.offTopic, question, trace: { ...trace, decision: 'refuse' } };
  if (RX.job.test(q) && words(q).length <= 14) return { kind: 'text', text: S.jobHint, jobButton: true, trace: null };

  const terms = analyze(question);
  trace.terms = [...terms.values()];
  if (!terms.size) return { kind: 'text', text: S.empty, trace: null };

  const ranked = KB.map((c) => scoreChunk(c, terms))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score * (0.5 + 0.5 * b.coverage) - a.score * (0.5 + 0.5 * a.coverage));

  if (!ranked.length) return { kind: 'handoff', text: S.noInfo, question, confidence: 0, trace: { ...trace, decision: 'handoff' } };

  const top = ranked[0];
  const coverage = top.coverage;
  trace.best = `${top.chunk.title} (${top.chunk.sectionLabel})`;
  trace.coverage = coverage;

  if (coverage < 0.35) return { kind: 'handoff', text: S.noInfo, question, confidence: coverage, trace: { ...trace, decision: 'handoff' } };

  // Fragmentos a mostrar: el mejor y los que se le acercan, maximo tres.
  let picked;
  if (top.chunk.solo) {
    picked = [top];
  } else if (top.chunk.group !== undefined && top.titleHit) {
    // Pregunta sobre un empleo o estudio concreto: se muestra el paso completo.
    picked = KB.filter((c) => c.group === top.chunk.group).map((chunk) => ({ chunk }));
  } else {
    picked = ranked.filter((r, i) => i === 0 || (r.score >= top.score * 0.6 && r.coverage >= coverage * 0.8)).slice(0, 3);
  }
  const hedge = coverage < 0.6;
  const caveat = hedge ? (top.unmatched.length ? S.caveatTerms(top.unmatched.slice(0, 3)) : S.caveat) : '';
  trace.decision = hedge ? 'hedge' : 'answer';

  // Agrupa por titulo para no repetir encabezados.
  const groups = [];
  picked.forEach((r) => {
    let g = groups.find((x) => x.title === r.chunk.title);
    if (!g) groups.push((g = { title: r.chunk.title, items: [] }));
    g.items.push(r.chunk);
  });
  const sources = [...new Map(picked.map((r) => [r.chunk.section, r.chunk.sectionLabel])).entries()];
  return { kind: 'answer', caveat, groups, sources, confidence: coverage, trace };
}

// ----------------------------------------------------------------------------- Comparacion con una oferta
// Sin modelo de lenguaje: se buscan en la oferta tecnologias de una lista conocida y se comprueba, con el mismo patron,
// si aparecen en el CV/portafolio. Lo que no aparece se marca como "no esta en su CV", no como "no sabe".

// [etiqueta ('es|en' si cambia de idioma), patron en texto normalizado (minusculas, sin tildes), relacionadas, patron alterno para el CV, distingue mayusculas]
// Con 'distingue mayusculas' el patron se escribe tal como va en la oferta (React, Swift...) y evita falsos positivos de palabras comunes.
const TECH = [
  // Lenguajes
  ['Python', 'python'],
  ['Java', 'java'],
  ['JavaScript', 'javascript|ecmascript|js', ['TypeScript']],
  ['TypeScript', 'typescript', ['JavaScript']],
  ['C#', 'c#'],
  ['.NET', '\\.net|dotnet|asp\\.net'],
  ['C++', 'c\\+\\+'],
  ['PHP', 'php'],
  ['Go', 'golang'],
  ['Ruby', 'Ruby', [], null, true],
  ['Kotlin', 'kotlin'],
  ['Swift', 'Swift', [], null, true],
  ['Rust', 'Rust', [], null, true],
  // Web
  ['HTML y CSS|HTML and CSS', 'html5?|css3?'],
  ['React', 'React(\\.?js)?', ['JavaScript'], null, true],
  ['Angular', 'angular', ['JavaScript']],
  ['Vue', 'Vue(\\.?js)?', ['JavaScript'], null, true],
  ['Node.js', 'node(\\.?js)?', ['JavaScript']],
  ['Next.js', 'next\\.?js', ['JavaScript']],
  ['Tailwind', 'tailwind'],
  ['Frontend', 'front-?end', ['JavaScript']],
  ['Backend', 'back-?end'],
  ['Desarrollo web|Web development', 'desarrollo web|web development|web developer|desarrollador web|sitios? web|web ?sites?'],
  ['Spring Boot', 'Spring( Boot| Framework| MVC| Cloud)?', [], null, true],
  ['Django', 'django', ['Python']],
  ['Flask', 'flask', ['Python']],
  ['FastAPI', 'fastapi', ['Python']],
  ['Laravel', 'laravel'],
  // Datos
  ['SQL', 'sql|t-sql|pl/sql'],
  ['MySQL', 'mysql', ['SQL']],
  ['PostgreSQL', 'postgres(ql)?', ['SQL']],
  ['SQL Server', 'sql server|mssql|transact-sql', ['SQL']],
  ['Oracle', 'oracle', ['SQL']],
  ['MongoDB', 'mongo(db)?'],
  ['Redis', 'redis'],
  ['Bases de datos|Databases', 'bases? de datos|databases?|dba'],
  ['Power BI', 'power ?bi'],
  ['Tableau', 'tableau'],
  ['Excel', 'Excel', [], null, true],
  ['ETL', 'etl|data pipelines?|pipelines? de datos'],
  ['Spark', 'Spark|PySpark|Apache Spark', [], null, true],
  ['Airflow', 'airflow'],
  ['Pandas', 'pandas'],
  ['Análisis de datos|Data analysis', 'analisis de datos|data analysis|analytics|analitica|data analyst|analista de datos'],
  ['Databricks', 'databricks'],
  ['Kafka', 'kafka'],
  // Nube y DevOps
  ['Azure', 'azure', [], 'azure'],
  ['AWS', 'aws|amazon web services', ['Azure']],
  ['Google Cloud', 'gcp|google cloud', ['Azure']],
  ['Nube (cloud)|Cloud', 'cloud|nube', [], 'azure|cloud|nube'],
  ['Docker', 'docker'],
  ['Kubernetes', 'kubernetes|k8s'],
  ['Terraform', 'terraform'],
  ['Linux', 'linux|ubuntu'],
  ['Git', 'git|github'],
  ['GitLab', 'gitlab', ['Git']],
  ['CI/CD', 'ci/?cd|cicd|pipelines?|github actions|continuous (integration|delivery|deployment)|integracion continua|despliegue continuo'],
  ['Jenkins', 'jenkins', ['CI/CD']],
  ['DevOps', 'devops', ['CI/CD', 'Git']],
  ['Azure DevOps', 'azure devops', ['Azure']],
  ['Microservicios|Microservices', 'microservic\\w+|microservices'],
  ['APIs REST|REST APIs', 'restful|rest ?apis?|apis? ?rest|apis?|web services|servicios web|servicios rest'],
  ['GraphQL', 'graphql', ['APIs REST']],
  ['Logic Apps', 'logic apps?'],
  ['Power Automate', 'power automate|power apps|power platform', ['Logic Apps']],
  // Inteligencia artificial
  ['IA / inteligencia artificial|AI / artificial intelligence', 'ia|ai|inteligencia artificial|artificial intelligence'],
  ['IA generativa y LLM|Generative AI and LLMs', 'llms?|large language models?|modelos? de lenguaje|generative ai|ia generativa|genai|gpt|chatgpt'],
  ['OpenAI', 'openai|gpt-?\\d\\w*|chatgpt', ['Azure OpenAI']],
  ['RAG', 'rag|retrieval[- ]augmented( generation)?'],
  ['Agentes de IA|AI agents', 'agentic|agentica|agenticas?|ai agents?|agentes? de ia|agentes? (de )?inteligencia|agentes? autonomos?|llm agents?|multi-?agents?', [], 'agent\\w*'],
  ['MCP', 'mcp|model context protocol'],
  ['LangChain', 'langchain'],
  ['LangGraph', 'langgraph'],
  ['Semantic Kernel', 'semantic kernel'],
  ['AutoGen / CrewAI', 'autogen|crewai|crew ai', ['Agentes de IA', 'LangChain']],
  ['Prompt engineering', 'prompts?|prompt engineering|ingenieria de prompts'],
  ['Chatbots', 'chatbots?|asistentes? virtuales?|virtual assistants?|conversational ai|ia conversacional', ['Agentes de IA']],
  ['Machine learning', 'machine learning|aprendizaje automatico'],
  ['Deep learning', 'deep learning|aprendizaje profundo|redes neuronales|neural networks?'],
  ['NLP', 'nlp|natural language processing|procesamiento de lenguaje natural'],
  ['TensorFlow', 'tensorflow', ['Python']],
  ['PyTorch', 'pytorch', ['Python']],
  ['Hugging Face', 'hugging ?face', ['IA generativa y LLM']],
  ['Copilot', 'copilot'],
  // Herramientas y procesos
  ['ServiceNow', 'servicenow'],
  ['Jira', 'jira', ['ServiceNow']],
  ['Microsoft Teams', 'microsoft teams|ms teams'],
  ['SAP', 'SAP', [], null, true],
  ['Salesforce', 'salesforce'],
  ['RPA', 'rpa|uipath|blue prism|automation anywhere', ['Automatización']],
  ['Automatización|Automation', 'automat\\w+|automation'],
  ['Pruebas y QA|QA and testing', 'qa|testing|tests?|pruebas|quality assurance|aseguramiento de (la )?calidad|testers?|casos de prueba'],
  ['Selenium', 'selenium', ['Pruebas y QA']],
  ['Cypress', 'cypress', ['Pruebas y QA']],
  ['Playwright', 'playwright', ['Pruebas y QA']],
  ['Postman', 'postman', ['APIs REST']],
  ['Metodologías ágiles|Agile methodologies', 'agil(e|es)?|scrum|kanban|sprints?'],
  ['Soporte técnico|Technical support', 'soporte tecnico|help ?desk|technical support|it support|service desk|mesa de ayuda'],
  ['Gestión de incidentes|Incident management', 'incidentes?|incidents?|itil|itsm'],
  ['Ciberseguridad|Cybersecurity', 'ciberseguridad|cybersecurity|seguridad informatica|infosec|pentest\\w*'],
  ['Redes|Networking', 'redes de (computadoras|datos|comunicaciones)|administracion de redes|networking|cisco|tcp/?ip'],
  ['Desarrollo móvil|Mobile development', 'mobile|movil(es)?'],
  ['Android', 'android'],
  ['iOS', 'ios'],
  ['Flutter', 'flutter'],
  ['React Native', 'react native'],
  ['Figma', 'figma'],
];

// Patrones: sin retrocesos (lookbehind) para que funcionen tambien en navegadores viejos.
const mkRx = (p) => new RegExp(`(?:^|[^a-z0-9])(?:${p})(?![a-z0-9])`);
const TECH_RX = TECH.map(([label, p, rel = [], mine, cs]) => ({
  key: label.split('|')[0], // las relacionadas se nombran por su clave en español
  label: lang === 'en' && label.includes('|') ? label.split('|')[1] : label.split('|')[0],
  rel,
  cs: !!cs,
  rx: cs ? new RegExp(`(?:^|[^A-Za-z0-9])(?:${p})(?![A-Za-z0-9])`) : mkRx(p),
  mine: mkRx(mine || p.toLowerCase()),
}));

const EVIDENCE_ORDER = ['habilidades', 'trayectoria', 'proyectos', 'certificaciones', 'sobre-mi', 'contacto'];
const JOHN = KB.filter((c) => !c.noEvidence).map((c) => ({ c, text: norm(`${c.title} ${c.text}`) }));
JOHN.sort((a, b) => EVIDENCE_ORDER.indexOf(a.c.section) - EVIDENCE_ORDER.indexOf(b.c.section));
const SKILL_TEXT = skills.map((s) => ({ s, name: norm(s.name), text: norm(`${s.name} ${s.note || ''} ${s.summary || ''} ${s.used.join(' ')}`) }));
const MAX_YEARS = Math.max(...skills.map((s) => s.years));

// Donde aparece en el CV: una habilidad (con sus años) o el fragmento que lo menciona.
function findEvidence(entry) {
  let bySkill = SKILL_TEXT.find((x) => entry.mine.test(x.name));
  if (!bySkill) {
    // Sin coincidencia por nombre: la habilidad que mas veces lo menciona.
    const g = new RegExp(entry.mine.source, 'g');
    const counted = SKILL_TEXT.map((x) => ({ x, n: (x.text.match(g) || []).length })).filter((r) => r.n);
    bySkill = counted.sort((a, b) => b.n - a.n)[0]?.x;
  }
  if (bySkill) {
    // Si la habilidad se llama igual que el requisito, basta con los años.
    const same = norm(bySkill.s.name) === norm(entry.label);
    return same ? t.years(bySkill.s.years) : `${bySkill.s.name} · ${t.years(bySkill.s.years)}`;
  }
  // Fragmento que mas veces lo menciona (a igualdad, el primero segun EVIDENCE_ORDER).
  const g = new RegExp(entry.mine.source, 'g');
  let hit = null;
  let best = 0;
  JOHN.forEach((x) => {
    const n = (x.text.match(g) || []).length;
    if (n > best) {
      best = n;
      hit = x;
    }
  });
  return hit ? `${hit.c.title} (${hit.c.sectionLabel})` : null;
}

function yearsAsked(q) {
  let min = 0;
  const range = /(\d{1,2})\s*(?:-|a|to)\s*\d{1,2}\s*\+?\s*(?:anos|years?|yrs?)/g;
  const single = /(\d{1,2})\s*\+?\s*(?:o mas\s*)?(?:anos|years?|yrs?)/g;
  const near = (m) => /experien|experience|trabaj|work|minimo|minimum|at least|al menos|require/.test(q.slice(Math.max(0, m.index - 60), m.index + 90));
  let m;
  while ((m = range.exec(q))) if (near(m)) min = Math.max(min, +m[1]);
  while ((m = single.exec(q))) if (near(m)) min = Math.max(min, +m[1]);
  return min;
}

const RX_DEGREE =
  /(titulo|titulado|egresad|graduad|licenciatur|bachelor|degree|carrera|universitari|estudios superiores|ingenieria (en|de) (sistemas|software|informatica|tecnologias|computacion)|computer science|ciencias de la computacion)/;
const RX_ENGLISH = /(ingles|english)/;
const RX_ENGLISH_HIGH = /(avanzado|advanced|fluido|fluent|c1|c2|b2|upper|nativo|native|bilingue|bilingual|proficien)/;

function analyzeOffer(text) {
  const offer = String(text).slice(0, 6000);
  const q = norm(offer).replace(/\s+/g, ' ');
  const found = TECH_RX.filter((e) => e.rx.test(e.cs ? offer : q));
  const mineOf = (e) => findEvidence(e);

  const matched = [];
  const gaps = [];
  found.forEach((e) => {
    const where = mineOf(e);
    if (where) matched.push({ label: e.label, detail: where });
    else {
      const related = e.rel
        .filter((l) => {
        const other = TECH_RX.find((x) => x.key === l);
        return other && findEvidence(other);
      })
        .map((l) => TECH_RX.find((x) => x.key === l).label);
      gaps.push({ label: e.label, related });
    }
  });

  const notes = [];
  const verify = [];
  const asked = yearsAsked(q);
  if (asked) (asked > MAX_YEARS ? verify : notes).push(asked > MAX_YEARS ? S.jobYearsHigh(asked, MAX_YEARS) : S.jobYearsOk(asked));
  if (RX_ENGLISH.test(q)) {
    const i = q.search(RX_ENGLISH);
    const around = q.slice(Math.max(0, i - 50), i + 70);
    (RX_ENGLISH_HIGH.test(around) ? verify : notes).push(RX_ENGLISH_HIGH.test(around) ? S.jobEnglishHigh : S.jobEnglishOk);
  }
  if (RX_DEGREE.test(q)) notes.push(S.jobDegreeOk);

  const total = found.length;
  const ratio = total ? matched.length / total : 0;
  const enough = total >= 3;

  const names = (list) => list.map((x) => x.label);
  const lines = [S.jobSummary(matched.length, total)];
  if (!matched.length) lines.push(S.jobNoMatch);
  if (matched.length) lines.push(`${S.jobMatched}: ${matched.map((m) => `${m.label} (${m.detail})`).join(', ')}.`);
  if (gaps.length) lines.push(`${S.jobGaps}: ${names(gaps).join(', ')}.`);
  if (notes.length || verify.length) lines.push(...notes, ...verify);
  lines.push(S.jobNote);

  return {
    kind: enough ? 'job' : 'handoff',
    text: S.jobTooFew,
    question: offer,
    job: { matched, gaps, notes, verify, total, ratio, excerpt: offer.replace(/\s+/g, ' ').trim().slice(0, 500), id: ++jobSeq },
    plain: `${S.jobTitle}. ${lines.join(' ')}`,
    confidence: enough ? ratio : 0,
    trace: null,
  };
}
let jobSeq = 0;
const jobsById = new Map();

// ----------------------------------------------------------------------------- Interfaz

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let panel;
let log;
let input;
let offerBox;
let chipsEl;
let micBtn;
let backBtn;
let launcher;
let lastFocus = null;
let section = 'inicio';
let mode = 'ask';
let introShown = false;
let dictation = null;
const plainOf = new WeakMap();

const HKEY = 'agent:history';
let hist = [];

function loadHist() {
  try {
    const v = JSON.parse(sessionStorage.getItem(HKEY) || '[]');
    return Array.isArray(v) ? v.filter((e) => e && (e.t === 'q' || e.t === 'job') && typeof e.v === 'string').slice(-30) : [];
  } catch {
    return [];
  }
}
function saveHist() {
  try {
    sessionStorage.setItem(HKEY, JSON.stringify(hist));
  } catch {
    /* sin almacenamiento: el historial vive solo mientras la pagina siga abierta */
  }
}

const ICON = {
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  listen:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h4l5 4V6L8 10Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  clear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v4h4"/></svg>',
  back: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>',
};

function level(conf) {
  return conf >= 0.6 ? 'high' : conf >= 0.35 ? 'mid' : 'low';
}

function renderTrace(trace) {
  if (!trace || !trace.question) return '';
  const L = S.howLines;
  const lines = [
    `${L.query}: "${esc(trace.question)}"`,
    `${L.terms}: ${trace.terms.length ? esc(trace.terms.join(', ')) : L.none}`,
    trace.best ? `${L.best}: ${esc(trace.best)}` : '',
    trace.best ? `${L.coverage}: ${Math.round(trace.coverage * 100)}%` : '',
    `${L.decision}: ${S.decisions[trace.decision]}`,
  ].filter(Boolean);
  return `<details class="msg__trace"><summary>${S.how}</summary><ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul></details>`;
}

function renderConfidence(conf, label = S.conf, extra = '') {
  if (conf == null) return '';
  const pct = Math.min(99, Math.round(conf * 100));
  const lv = level(conf);
  return `<span class="msg__conf msg__conf--${lv}" title="${label}: ${pct}%"><i style="--v:${pct}%"></i><b>${label} ${S.levels[lv]} · ${pct}%${extra}</b></span>`;
}

function renderLinks(links) {
  if (!links || !links.length) return '';
  return `<span class="msg__links">${links
    .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join('')}</span>`;
}

function renderJob(r) {
  const j = r.job;
  const chips = (list, cls) => `<ul class="job__chips ${cls}">${list.join('')}</ul>`;
  const matched = j.matched.map((m) => `<li><b>${esc(m.label)}</b><small>${esc(m.detail)}</small></li>`);
  const gaps = j.gaps.map(
    (g) => `<li><b>${esc(g.label)}</b>${g.related.length ? `<small>${esc(S.jobRelated(g.related.join(', ')))}</small>` : ''}</li>`
  );
  jobsById.set(j.id, r);
  return `<p class="msg__title">${S.jobTitle}</p>
    <p>${esc(S.jobSummary(j.matched.length, j.total))}</p>
    ${!j.matched.length ? `<p class="msg__caveat">${esc(S.jobNoMatch)}</p>` : ''}
    ${matched.length ? `<div class="job__block"><p class="job__label">${S.jobMatched}</p>${chips(matched, 'job__chips--yes')}</div>` : ''}
    ${gaps.length ? `<div class="job__block"><p class="job__label">${S.jobGaps}</p>${chips(gaps, 'job__chips--no')}</div>` : ''}
    ${j.notes.length ? `<ul class="job__notes">${j.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    ${j.verify.length ? `<div class="job__block"><p class="job__label">${S.jobVerify}</p><ul class="job__notes job__notes--warn">${j.verify.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
    <button class="btn btn--solid agent__handoff" type="button" data-handoff-job="${j.id}">${S.jobHandoff}</button>
    <div class="msg__meta">${renderConfidence(r.confidence, S.jobMatchLabel, ` (${j.matched.length}/${j.total})`)}</div>
    <p class="job__note">${S.jobNote}</p>`;
}

function renderResponse(r) {
  if (r.kind === 'text') {
    return `<p>${esc(r.text)}</p>${
      r.jobButton ? `<button class="btn agent__handoff" type="button" data-job-open>${S.jobOpen}</button>` : ''
    }${r.trace ? renderTrace(r.trace) : ''}`;
  }
  if (r.kind === 'job') return renderJob(r);
  if (r.kind === 'handoff') {
    if (r.job) {
      jobsById.set(r.job.id, r);
      return `<p>${esc(r.text)}</p>
        <button class="btn btn--solid agent__handoff" type="button" data-handoff-job="${r.job.id}">${S.jobHandoff}</button>`;
    }
    return `<p>${esc(r.text)}</p>
      <button class="btn btn--solid agent__handoff" type="button" data-handoff="${esc(r.question)}">${S.handoffBtn}</button>
      <div class="msg__meta">${renderConfidence(r.confidence)}</div>
      ${renderTrace(r.trace)}`;
  }
  const body = r.groups
    .map(
      (g) => `<div class="msg__group"><p class="msg__title">${esc(g.title)}</p><ul>${g.items
        .map((c) => `<li>${esc(c.text)}${renderLinks(c.links)}</li>`)
        .join('')}</ul></div>`
    )
    .join('');
  const src = r.sources
    .map(([id, name]) => `<button type="button" class="msg__src" data-agent-nav="${esc(id)}">${esc(name)}</button>`)
    .join('');
  return `${r.caveat ? `<p class="msg__caveat">${esc(r.caveat)}</p>` : ''}${body}
    <div class="msg__meta">${renderConfidence(r.confidence)}<span class="msg__sources">${S.sources}: ${src}</span></div>
    ${renderTrace(r.trace)}`;
}

// Texto plano de una respuesta: sirve para copiarla y para leerla en voz alta.
function plainText(r) {
  if (r.kind === 'job') return r.plain;
  if (r.kind === 'text' || r.kind === 'handoff') return r.text;
  const parts = [];
  if (r.caveat) parts.push(r.caveat);
  r.groups.forEach((g) => {
    parts.push(`${g.title}.`);
    g.items.forEach((c) => parts.push(c.text));
  });
  parts.push(`${S.conf} ${S.levels[level(r.confidence)]}.`);
  return parts.join(' ');
}

function actionsMarkup(r) {
  if (r.kind === 'text') return '';
  return `<div class="msg__actions">
    <button type="button" data-copy title="${S.copy}" aria-label="${S.copy}">${ICON.copy}</button>
    ${ttsSupported ? `<button type="button" data-listen data-label="${S.listen}" title="${S.listen}" aria-label="${S.listen}">${ICON.listen}<span>${S.listen}</span></button>` : ''}
  </div>`;
}

function addMessage(kind, html) {
  const el = document.createElement('div');
  el.className = `msg msg--${kind}`;
  el.innerHTML = html;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function resetListenButtons() {
  panel.querySelectorAll('[data-listen].is-on').forEach((b) => {
    b.classList.remove('is-on');
    b.setAttribute('aria-label', S.listen);
    b.title = S.listen;
    b.querySelector('span').textContent = S.listen;
  });
}

function copyText(text) {
  const done = () => toast(S.copied);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } catch {
    /* sin portapapeles */
  }
  ta.remove();
}

function userHtml(entry) {
  if (entry.t === 'job') {
    const preview = entry.v.replace(/\s+/g, ' ').trim();
    return `<p>${esc(S.jobPasted(entry.v.length))}</p><p class="msg__offer">${esc(preview.slice(0, 160))}${preview.length > 160 ? '…' : ''}</p>`;
  }
  return `<p>${esc(entry.v)}</p>`;
}

// Un turno: pregunta de la persona y respuesta del agente. `instant` omite la animacion (al restaurar el historial).
function turn(entry, { instant = false, persist = true } = {}) {
  addMessage('user', userHtml(entry));
  if (persist) {
    hist.push(entry);
    hist = hist.slice(-30);
    saveHist();
  }
  const result = entry.t === 'job' ? analyzeOffer(entry.v) : respond(entry.v);
  const wait = addMessage('bot', `<p class="msg__wait"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${S.steps[0]}</span></p>`);
  const label = wait.querySelector('.msg__wait span:last-child');
  const finish = () => {
    wait.innerHTML = renderResponse(result) + actionsMarkup(result);
    plainOf.set(wait, plainText(result));
    // La respuesta se lee desde arriba, no desde su final.
    log.scrollTop = Math.max(0, wait.offsetTop - log.offsetTop - 8);
  };
  if (instant || reducedMotion) return finish();
  setTimeout(() => (label.textContent = S.steps[1]), 450);
  setTimeout(finish, 950);
}

function ask(question) {
  const text = question.trim().slice(0, 200);
  if (!text) return;
  turn({ t: 'q', v: text });
}

function askJob(text) {
  const offer = text.trim().slice(0, 6000);
  if (!offer) return;
  setMode('ask');
  turn({ t: 'job', v: offer });
}

// ---- Modo: preguntas o comparacion con una oferta

function setMode(next) {
  mode = next;
  panel.dataset.mode = next;
  const job = next === 'job';
  input.hidden = job;
  offerBox.hidden = !job;
  chipsEl.hidden = job;
  backBtn.hidden = !job;
  if (micBtn) micBtn.hidden = job;
  if (dictation && job) dictation.stop();
  const send = panel.querySelector('.agent__send');
  send.setAttribute('aria-label', job ? S.jobAnalyze : S.send);
  send.classList.toggle('agent__send--wide', job);
  send.querySelector('.agent__send-label').textContent = job ? S.jobAnalyze : '';
  if (job && !introShown) {
    introShown = true;
    addMessage('bot', `<p>${esc(S.jobIntro)}</p>`);
  }
  setTimeout(() => (job ? offerBox : input).focus({ preventScroll: true }), 60);
}

function renderChips() {
  const list = S.bySection[section] || S.bySection.inicio;
  chipsEl.innerHTML =
    list.map((q) => `<button type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join('') +
    `<button type="button" class="chip--job" data-job-open>${S.jobOpen}</button>`;
}

function resetConversation() {
  stopSpeaking();
  if (dictation) dictation.stop();
  hist = [];
  saveHist();
  log.innerHTML = '';
  introShown = false;
  addMessage('bot', `<p>${esc(S.hello)}</p>`);
  setMode('ask');
  toast(S.cleared);
}

// ---- Apertura y cierre

function open(nextMode) {
  lastFocus = document.activeElement;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('is-open'));
  launcher.setAttribute('aria-expanded', 'true');
  renderChips();
  if (nextMode === 'job') setMode('job');
  else setTimeout(() => input.focus({ preventScroll: true }), 120);
}

function close() {
  stopSpeaking();
  resetListenButtons();
  if (dictation) dictation.stop();
  panel.classList.remove('is-open');
  launcher.setAttribute('aria-expanded', 'false');
  setTimeout(() => {
    if (!panel.classList.contains('is-open')) panel.hidden = true;
  }, 300);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

// Para otros modulos (paleta de comandos).
export function openAgent(nextMode) {
  if (panel && panel.hidden) open(nextMode);
  else if (panel && nextMode === 'job') setMode('job');
}

function goContact(prefillText) {
  close();
  const nav = document.querySelector('[data-nav="contacto"]');
  if (nav) nav.click();
  setTimeout(() => {
    const field = document.querySelector('#contact-form textarea[name="message"]');
    if (!field) return;
    field.value = prefillText + field.value;
    field.focus({ preventScroll: true });
    toast(S.handoffToast);
  }, 1100);
}

function handoff(question) {
  goContact(S.prefill(question));
}

function handoffJob(id) {
  const r = jobsById.get(Number(id));
  if (!r) return;
  const { matched, gaps, excerpt } = r.job;
  goContact(S.jobPrefill(matched.map((m) => m.label), gaps.map((g) => g.label), excerpt));
}

// ---- Dictado

function setupDictation() {
  micBtn = panel.querySelector('.agent__mic');
  if (!sttSupported) return;
  dictation = createDictation({
    onText: (text, final) => {
      input.value = text.slice(0, 200);
      if (final && text) setTimeout(() => panel.querySelector('.agent__form').requestSubmit(), 250);
    },
    onState: (on) => {
      micBtn.classList.toggle('is-rec', on);
      micBtn.setAttribute('aria-pressed', String(on));
      const label = on ? S.micStop : S.mic;
      micBtn.setAttribute('aria-label', label);
      micBtn.title = label;
    },
    onError: (code) => {
      if (code === 'not-allowed' || code === 'service-not-allowed') toast(S.micDenied);
      else if (code === 'no-speech') toast(S.micNoSpeech);
      else if (code !== 'aborted') toast(S.micFail);
    },
  });
  micBtn.hidden = false;
  micBtn.addEventListener('click', () => {
    if (dictation.isActive()) return dictation.stop();
    let told = false;
    try {
      told = sessionStorage.getItem('agent:mic-notice') === '1';
      if (!told) sessionStorage.setItem('agent:mic-notice', '1');
    } catch {
      /* sin almacenamiento */
    }
    if (!told) addMessage('bot', `<p class="msg__caveat">${esc(S.micNotice)}</p>`);
    input.value = '';
    dictation.start();
  });
}

function launcherMarkup() {
  return `<button class="tool tool--agent" id="btn-agent" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="agent" title="${S.heroBtn}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v3M5 9a7 7 0 0 1 14 0v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><circle cx="9.5" cy="11" r="1"/><circle cx="14.5" cy="11" r="1"/><path d="M9 21h6"/></svg>
    <span>${S.launcher}</span>
  </button>`;
}

export function setupAgent() {
  // Boton en la barra (antes del selector de idioma) y boton en la portada.
  const tools = document.querySelector('.tools');
  if (tools) tools.insertAdjacentHTML('afterbegin', launcherMarkup());
  const hero = document.querySelector('.hero__actions');
  if (hero) hero.insertAdjacentHTML('beforeend', `<button class="btn btn--agent" type="button" data-agent-open>${S.heroBtn}</button>`);

  panel = document.createElement('aside');
  panel.id = 'agent';
  panel.className = 'agent';
  panel.hidden = true;
  panel.dataset.mode = 'ask';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'agent-title');
  panel.innerHTML = `
    <header class="agent__head">
      <div>
        <strong id="agent-title">${S.title}</strong>
        <p>${S.sub}</p>
      </div>
      <div class="agent__head-btns">
        <button class="agent__icon" type="button" data-clear title="${S.clear}" aria-label="${S.clear}">${ICON.clear}</button>
        <button class="agent__close" type="button" aria-label="${S.close}">&times;</button>
      </div>
    </header>
    <div class="agent__log" id="agent-log" role="log" aria-live="polite"></div>
    <div class="agent__chips" id="agent-chips"></div>
    <button class="agent__back" type="button" hidden>${ICON.back}<span>${S.jobBack}</span></button>
    <form class="agent__form" autocomplete="off">
      <button class="agent__mic" type="button" aria-pressed="false" aria-label="${S.mic}" title="${S.mic}" hidden>${ICON.mic}</button>
      <input id="agent-input" type="text" maxlength="200" placeholder="${S.placeholder}" aria-label="${S.placeholder}" />
      <textarea id="agent-offer" rows="5" maxlength="6000" placeholder="${S.jobPlaceholder}" aria-label="${S.jobPlaceholder}" hidden></textarea>
      <button class="agent__send" type="submit" aria-label="${S.send}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 14-7-5 14-2-6Z"/></svg>
        <span class="agent__send-label"></span>
      </button>
    </form>`;
  document.body.appendChild(panel);
  log = panel.querySelector('#agent-log');
  input = panel.querySelector('#agent-input');
  offerBox = panel.querySelector('#agent-offer');
  chipsEl = panel.querySelector('#agent-chips');
  backBtn = panel.querySelector('.agent__back');
  launcher = document.querySelector('#btn-agent');
  renderChips();
  setupDictation();

  // Conversacion: saludo y, si la hay, la de esta sesion (se vuelve a responder en el idioma actual).
  addMessage('bot', `<p>${esc(S.hello)}</p>`);
  hist = loadHist();
  hist.forEach((e) => turn(e, { instant: true, persist: false }));
  log.scrollTop = log.scrollHeight;

  panel.querySelector('.agent__form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (mode === 'job') {
      const text = offerBox.value;
      offerBox.value = '';
      return askJob(text);
    }
    const q = input.value;
    input.value = '';
    ask(q);
  });
  offerBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      panel.querySelector('.agent__form').requestSubmit();
    }
  });
  backBtn.addEventListener('click', () => setMode('ask'));
  panel.querySelector('.agent__close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  });

  window.addEventListener('section:change', (e) => {
    section = e.detail;
    if (mode === 'ask') renderChips();
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-agent')) return panel.hidden ? open() : close();
    if (e.target.closest('[data-agent-open]')) return open();
    if (e.target.closest('[data-job-open]')) {
      if (panel.hidden) open('job');
      else setMode('job');
      return;
    }
    if (e.target.closest('[data-clear]')) return resetConversation();
    const chip = e.target.closest('[data-ask]');
    if (chip) return ask(chip.dataset.ask);
    const h = e.target.closest('[data-handoff]');
    if (h) return handoff(h.dataset.handoff);
    const hj = e.target.closest('[data-handoff-job]');
    if (hj) return handoffJob(hj.dataset.handoffJob);
    const cp = e.target.closest('[data-copy]');
    if (cp) {
      const text = plainOf.get(cp.closest('.msg'));
      if (text) copyText(text);
      return;
    }
    const ls = e.target.closest('[data-listen]');
    if (ls) {
      if (ls.classList.contains('is-on')) {
        stopSpeaking();
        return resetListenButtons();
      }
      const text = plainOf.get(ls.closest('.msg'));
      if (!text) return;
      resetListenButtons();
      ls.classList.add('is-on');
      ls.setAttribute('aria-label', S.stopListen);
      ls.title = S.stopListen;
      ls.querySelector('span').textContent = S.stopListen;
      speak(text, resetListenButtons);
      return;
    }
    const nav = e.target.closest('[data-agent-nav]');
    if (nav) {
      const link = document.querySelector(`[data-nav="${nav.dataset.agentNav}"]`);
      close();
      if (link) link.click();
    }
  });
}

export { respond as __respond, analyzeOffer as __analyzeOffer, S as __S };

// Agente demo: responde preguntas sobre John usando solo el contenido del portafolio.
// No usa modelo de lenguaje ni servidor. Hace recuperacion de fragmentos (BM25) sobre una base de
// conocimiento armada con los mismos datos de la pagina, calcula la cobertura de la pregunta (confiabilidad),
// cita la fuente y, si no sabe o no le corresponde responder, pasa la pregunta a John por el formulario.

import { profile, about, journey, projects, skills, certifications, sections } from './data/content.js';
import { t, lang } from './i18n.js';
import { toast } from './ui.js';

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
    starters: ['¿Qué hace John en TCS?', '¿Qué certificaciones tiene?', '¿Qué tecnologías domina?', '¿Dónde estudió?', '¿Cómo lo contacto?'],
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
    starters: ['What does John do at TCS?', 'Which certifications does he have?', 'Which technologies does he know?', 'Where did he study?', 'How can I contact him?'],
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
    'some their them they this to us was we were what when where which why will with would you your about also any all do john guaman'
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
    kw: 'contacto contactar contactarlo correo email escribir mensaje formulario linkedin hablar contratar cv curriculum resume contact reach message form hire talk',
    links: [
      { label: 'LinkedIn', url: profile.linkedin },
      { label: 'GitHub', url: profile.github },
      { label: t.cv, url: profile.cv },
    ].filter((l) => l.url),
  });
  add({ section: 'sobre-mi', title: S.kb.site, solo, text: S.kb.siteText, kw: 'portafolio sitio web pagina hecho construido threejs vite 3d portfolio website site built made technology' });
  add({ section: 'sobre-mi', title: S.kb.agent, solo, text: S.kb.agentText, kw: 'agente demo funciona funcionamiento chatbot modelo servidor agent works chatbot model llm server trust confianza' });

  // Experiencia y formacion.
  add({
    section: 'trayectoria',
    title: S.kb.expTitle,
    solo,
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
      kw: KW.skills + ' ' + (g === 'ai' ? KW.ai : ''),
    })
  );
  skills.forEach((s) =>
    add({
      section: 'habilidades',
      title: s.name,
      text: `${t.years(s.years)} ${t.since} ${s.since}. ${s.summary} ${s.used.join('. ')}.`,
      kw: 'experiencia experience ' + (s.group === 'ai' ? KW.ai : ''),
    })
  );

  // Certificaciones.
  add({
    section: 'certificaciones',
    title: S.kb.certsTitle,
    solo,
    text: certifications.map((c) => c.title).join('; ') + '.',
    kw: KW.certs + ' ' + KW.edu,
  });
  certifications.forEach((c) =>
    add({
      section: 'certificaciones',
      title: c.title,
      text: `${c.issuer}${c.date ? `, ${fmt(c.date)}` : ''}. ${c.code}.`,
      kw: c.code,
    })
  );

  // Proyectos.
  add({ section: 'proyectos', title: S.kb.projectsTitle, solo, text: projects.map((p) => p.title).join(', ') + '.', kw: KW.projects });
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
  const boost = (titleHit ? 1.5 : 1) * (c.solo ? 1.3 : 1);
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

// ----------------------------------------------------------------------------- Interfaz

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let panel;
let log;
let input;
let launcher;
let lastFocus = null;

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

function renderConfidence(conf) {
  if (conf == null) return '';
  const pct = Math.min(99, Math.round(conf * 100));
  const lv = level(conf);
  return `<span class="msg__conf msg__conf--${lv}" title="${S.conf}: ${pct}%"><i style="--v:${pct}%"></i><b>${S.conf} ${S.levels[lv]} · ${pct}%</b></span>`;
}

function renderLinks(links) {
  if (!links || !links.length) return '';
  return `<span class="msg__links">${links
    .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join('')}</span>`;
}

function renderResponse(r) {
  if (r.kind === 'text') {
    return `<p>${esc(r.text)}</p>${r.trace ? renderTrace(r.trace) : ''}`;
  }
  if (r.kind === 'handoff') {
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

function addMessage(kind, html) {
  const el = document.createElement('div');
  el.className = `msg msg--${kind}`;
  el.innerHTML = html;
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function ask(question) {
  const text = question.trim().slice(0, 200);
  if (!text) return;
  addMessage('user', `<p>${esc(text)}</p>`);
  const wait = addMessage('bot', `<p class="msg__wait"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${S.steps[0]}</span></p>`);
  const label = wait.querySelector('.msg__wait span:last-child');
  const result = respond(text);
  const finish = () => {
    wait.innerHTML = renderResponse(result);
    // La respuesta se lee desde arriba, no desde su final.
    log.scrollTop = Math.max(0, wait.offsetTop - log.offsetTop - 8);
  };
  if (reducedMotion) return finish();
  setTimeout(() => (label.textContent = S.steps[1]), 450);
  setTimeout(finish, 950);
}

function open() {
  lastFocus = document.activeElement;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('is-open'));
  launcher.setAttribute('aria-expanded', 'true');
  setTimeout(() => input.focus({ preventScroll: true }), 120);
}

function close() {
  panel.classList.remove('is-open');
  launcher.setAttribute('aria-expanded', 'false');
  setTimeout(() => {
    if (!panel.classList.contains('is-open')) panel.hidden = true;
  }, 300);
  if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
}

function handoff(question) {
  close();
  const nav = document.querySelector('[data-nav="contacto"]');
  if (nav) nav.click();
  setTimeout(() => {
    const field = document.querySelector('#contact-form textarea[name="message"]');
    if (!field) return;
    field.value = S.prefill(question) + field.value;
    field.focus({ preventScroll: true });
    toast(S.handoffToast);
  }, 1100);
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
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'agent-title');
  panel.innerHTML = `
    <header class="agent__head">
      <div>
        <strong id="agent-title">${S.title}</strong>
        <p>${S.sub}</p>
      </div>
      <button class="agent__close" type="button" aria-label="${S.close}">&times;</button>
    </header>
    <div class="agent__log" id="agent-log" role="log" aria-live="polite"></div>
    <div class="agent__chips" id="agent-chips">${S.starters.map((q) => `<button type="button" data-ask="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="agent__form" autocomplete="off">
      <input id="agent-input" type="text" maxlength="200" placeholder="${S.placeholder}" aria-label="${S.placeholder}" />
      <button class="agent__send" type="submit" aria-label="${S.send}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 14-7-5 14-2-6Z"/></svg>
      </button>
    </form>`;
  document.body.appendChild(panel);
  log = panel.querySelector('#agent-log');
  input = panel.querySelector('#agent-input');
  launcher = document.querySelector('#btn-agent');
  addMessage('bot', `<p>${esc(S.hello)}</p>`);

  panel.querySelector('.agent__form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = '';
    ask(q);
  });
  panel.querySelector('.agent__close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#btn-agent')) return panel.hidden ? open() : close();
    if (e.target.closest('[data-agent-open]')) return open();
    const chip = e.target.closest('[data-ask]');
    if (chip) return ask(chip.dataset.ask);
    const h = e.target.closest('[data-handoff]');
    if (h) return handoff(h.dataset.handoff);
    const nav = e.target.closest('[data-agent-nav]');
    if (nav) {
      const link = document.querySelector(`[data-nav="${nav.dataset.agentNav}"]`);
      close();
      if (link) link.click();
    }
  });
}

export { respond as __respond };

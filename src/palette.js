// Paleta de comandos (Ctrl + K o Cmd + K): salta a una seccion o ejecuta una accion escribiendo unas letras.

import { profile, projects, certifications, sections } from './data/content.js';
import { t } from './i18n.js';
import { toast } from './ui.js';
import { openAgent } from './agent.js';
import { isStandalone, promptInstall } from './pwa.js';

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const ICONS = {
  nav: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  agent: '<path d="M12 3v3M5 9a7 7 0 0 1 14 0v4a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4Z"/><circle cx="9.5" cy="11" r="1"/><circle cx="14.5" cy="11" r="1"/>',
  job: '<path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/>',
  lang: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  theme: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"/>',
  cv: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  print: '<path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v6H7Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  install: '<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M12 8v6M9.5 12 12 14.5 14.5 12"/>',
  project: '<path d="M4 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/>',
  cert: '<circle cx="12" cy="9" r="5"/><path d="m9 13-1.5 7L12 18l4.5 2L15 13"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const clickNav = (id) => {
  const a = document.querySelector(`#rail [data-nav="${id}"]`) || document.querySelector(`[data-nav="${id}"]`);
  if (a) a.click();
};

function buildCommands() {
  const cmds = [];
  const add = (c) => cmds.push({ keys: '', ...c });

  sections.forEach((s) =>
    add({ group: 'nav', icon: 'nav', label: t.palGoTo(s.label), keys: `${s.id} ${s.label}`, run: () => clickNav(s.id) })
  );

  add({ group: 'actions', icon: 'agent', label: t.palAgent, keys: 'agente agent chat preguntar ask ia ai', run: () => openAgent() });
  add({
    group: 'actions',
    icon: 'job',
    label: t.palJob,
    keys: 'oferta vacante empleo trabajo compatibilidad job offer vacancy compare match fit',
    run: () => openAgent('job'),
  });
  add({ group: 'actions', icon: 'lang', label: t.palLang, keys: 'idioma lenguaje language english ingles espanol spanish', run: () => document.querySelector('#btn-lang')?.click() });
  add({ group: 'actions', icon: 'theme', label: t.palTheme, keys: 'tema claro oscuro modo dark light theme mode', run: () => document.querySelector('#btn-theme')?.click() });
  add({
    group: 'actions',
    icon: 'cv',
    label: t.palCv,
    keys: 'cv curriculum resume pdf descargar download',
    run: () => {
      const a = document.createElement('a');
      a.href = profile.cv;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
  });
  add({ group: 'actions', icon: 'print', label: t.palPrint, keys: 'imprimir print pdf guardar save pagina page', run: () => window.print() });
  add({ group: 'actions', icon: 'mail', label: t.palContact, keys: 'contacto contact mensaje message escribir write formulario form correo email', run: () => clickNav('contacto') });
  if (profile.email) {
    add({
      group: 'actions',
      icon: 'mail',
      label: t.palCopyMail,
      keys: 'correo email copiar copy',
      run: () => navigator.clipboard?.writeText(profile.email).then(() => toast(t.mailCopied)).catch(() => toast(profile.email)),
    });
  }
  if (!isStandalone()) {
    add({ group: 'actions', icon: 'install', label: t.palInstall, keys: 'instalar app install pwa aplicacion', run: () => promptInstall() });
  }

  add({ group: 'links', icon: 'link', label: 'GitHub', keys: 'github codigo code repos', run: () => window.open(profile.github, '_blank', 'noopener') });
  if (profile.linkedin) {
    add({ group: 'links', icon: 'link', label: 'LinkedIn', keys: 'linkedin red social network', run: () => window.open(profile.linkedin, '_blank', 'noopener') });
  }

  // Contenido: solo aparece al buscar.
  projects.forEach((p, i) =>
    add({
      group: 'content',
      icon: 'project',
      label: t.palProject(p.title),
      keys: `${p.stack.join(' ')} proyecto project`,
      onlySearch: true,
      run: () => {
        clickNav('proyectos');
        setTimeout(() => window.__portfolio?.goToProject(i), 400);
      },
    })
  );
  certifications.forEach((c) =>
    add({
      group: 'content',
      icon: 'cert',
      label: t.palCert(c.title),
      keys: `${c.code} ${c.issuer} certificado certificate certificacion`,
      onlySearch: true,
      run: () => document.querySelector(`[data-cert="${c.id}"]`)?.click(),
    })
  );
  return cmds;
}

const GROUP_LABEL = () => ({ nav: t.palGroupNav, actions: t.palGroupActions, links: t.palGroupLinks, content: t.palGroupContent });

function filter(cmds, query) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return cmds.filter((c) => !c.onlySearch);
  const scored = [];
  cmds.forEach((c, order) => {
    const label = norm(c.label);
    const hay = `${label} ${norm(c.keys)}`;
    if (!tokens.every((tk) => hay.includes(tk))) return;
    let score = 0;
    tokens.forEach((tk) => {
      const i = label.indexOf(tk);
      score += i === 0 ? 3 : label.split(/\s+/).some((w) => w.startsWith(tk)) ? 2 : i > 0 ? 1 : 0.5;
    });
    scored.push({ c, score, order });
  });
  return scored.sort((a, b) => b.score - a.score || a.order - b.order).map((x) => x.c);
}

let dlg;
let inputEl;
let listEl;
let items = [];
let active = 0;
let all = [];

function render() {
  const query = inputEl.value;
  items = filter(all, query);
  active = Math.min(active, Math.max(0, items.length - 1));
  const labels = GROUP_LABEL();
  let html = '';
  let lastGroup = '';
  items.forEach((c, i) => {
    if (c.group !== lastGroup) {
      lastGroup = c.group;
      html += `<li class="palette__group" role="presentation">${esc(labels[c.group])}</li>`;
    }
    html += `<li class="palette__item${i === active ? ' is-active' : ''}" role="option" id="pal-${i}" data-i="${i}" aria-selected="${i === active}">${icon(c.icon)}<span>${esc(c.label)}</span></li>`;
  });
  if (!items.length) html = `<li class="palette__empty" role="presentation">${esc(t.palEmpty)}</li>`;
  listEl.innerHTML = html;
  inputEl.setAttribute('aria-activedescendant', items.length ? `pal-${active}` : '');
  const cur = listEl.querySelector('.is-active');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}

function move(delta) {
  if (!items.length) return;
  active = (active + delta + items.length) % items.length;
  render();
}

function run(i) {
  const c = items[i];
  if (!c) return;
  dlg.close();
  setTimeout(() => c.run(), 80);
}

function open() {
  if (dlg.open) return;
  if (document.querySelector('dialog[open]')) return; // otro dialogo (por ejemplo un certificado) ya esta abierto
  all = buildCommands();
  inputEl.value = '';
  active = 0;
  render();
  dlg.showModal();
  inputEl.focus();
}

export function setupPalette() {
  dlg = document.createElement('dialog');
  dlg.className = 'palette';
  dlg.setAttribute('aria-label', t.palLabel);
  dlg.innerHTML = `
    <div class="palette__box">
      <input class="palette__input" type="text" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="${esc(t.palPlaceholder)}" aria-label="${esc(t.palLabel)}" />
      <ul class="palette__list" id="palette-list" role="listbox"></ul>
      <p class="palette__hint">${esc(t.palHint)}</p>
    </div>`;
  document.body.appendChild(dlg);
  inputEl = dlg.querySelector('.palette__input');
  listEl = dlg.querySelector('.palette__list');

  inputEl.addEventListener('input', () => {
    active = 0;
    render();
  });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(active);
    }
  });
  listEl.addEventListener('click', (e) => {
    const li = e.target.closest('[data-i]');
    if (li) run(Number(li.dataset.i));
  });
  listEl.addEventListener('mousemove', (e) => {
    const li = e.target.closest('[data-i]');
    if (!li) return;
    const i = Number(li.dataset.i);
    if (i === active) return;
    listEl.querySelector('.is-active')?.classList.remove('is-active');
    active = i;
    li.classList.add('is-active');
    inputEl.setAttribute('aria-activedescendant', `pal-${i}`);
  });
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dlg.open) dlg.close();
      else open();
    }
  });
}


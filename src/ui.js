import { profile, about, projects, skills, sections } from './data/content.js';

const $ = (sel, root = document) => root.querySelector(sel);

const ICON_PREV =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
const ICON_NEXT =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';

export const GROUP_COLORS = {
  code: '#4df3e0',
  qa: '#ff3d8b',
  ai: '#8e7cff',
};
const GROUP_LABELS = {
  code: 'Desarrollo',
  qa: 'Calidad',
  ai: 'Inteligencia artificial',
};

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function buildUI() {
  // Barra superior
  $('#bar').innerHTML = `
    <a class="brand" href="#inicio" data-nav="inicio" aria-label="Ir al inicio">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 6 54 22 47 50 17 54 8 26Z" fill="none" stroke="#4df3e0" stroke-width="4" stroke-linejoin="round"/>
        <path d="M32 6 30 32 47 50M30 32 8 26M30 32 17 54" fill="none" stroke="#8e7cff" stroke-width="3" stroke-linejoin="round"/>
        <circle cx="45" cy="20" r="5" fill="#ff3d8b"/>
      </svg>
      <span>${esc(profile.name)}</span>
    </a>
    <ul class="menu">
      ${sections
        .slice(1)
        .map((s) => `<li><a href="#${s.id}" data-nav="${s.id}">${esc(s.label)}</a></li>`)
        .join('')}
    </ul>`;

  // Riel lateral de puntos
  $('#rail').innerHTML = sections
    .map((s) => `<a href="#${s.id}" data-nav="${s.id}" aria-label="${esc(s.label)}" title="${esc(s.label)}"></a>`)
    .join('');

  const contactLinks = [
    profile.email &&
      `<button class="btn btn--solid" type="button" id="copy-mail" data-mail="${esc(profile.email)}">Copiar correo</button>`,
    `<a class="btn ${profile.email ? '' : 'btn--solid'}" href="${esc(profile.github)}" target="_blank" rel="noopener">GitHub</a>`,
    profile.linkedin &&
      `<a class="btn" href="${esc(profile.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`,
  ]
    .filter(Boolean)
    .join('');

  const groups = [...new Set(skills.map((s) => s.group))];

  $('#contenido').innerHTML = `
    <section class="sec sec--inicio" id="inicio" data-sec>
      <div class="stage">
        <div class="hero">
          <p class="hero__role">${esc(profile.role)}</p>
          <h1><span>John</span><span>Guaman</span></h1>
          <p class="lede">${esc(profile.headline)}</p>
          <div class="hero__actions">
            <a class="btn btn--solid" href="#proyectos" data-nav="proyectos">Ver proyectos</a>
            <a class="btn" href="#contacto" data-nav="contacto">Contacto</a>
          </div>
        </div>
      </div>
    </section>

    <section class="sec sec--sobre-mi" id="sobre-mi" data-sec>
      <div class="stage">
        <div class="about">
          <h2>${esc(about.title)}</h2>
          ${about.paragraphs.map((p) => `<p class="copy">${esc(p)}</p>`).join('')}
          <dl class="facts">
            ${about.facts
              .map((f) => `<div><dt>${esc(f.term)}</dt><dd>${esc(f.detail)}</dd></div>`)
              .join('')}
          </dl>
        </div>
      </div>
    </section>

    <section class="sec sec--proyectos" id="proyectos" data-sec>
      <div class="stage stage--proyectos">
        <h2 class="section-title">Proyectos</h2>
      </div>
    </section>

    <section class="sec sec--habilidades" id="habilidades" data-sec>
      <div class="stage">
        <div>
          <h2 class="section-title">Habilidades</h2>
          <ul class="legend">
            ${groups
              .map((g) => `<li><i style="--c:${GROUP_COLORS[g]}"></i>${esc(GROUP_LABELS[g])}</li>`)
              .join('')}
          </ul>
        </div>
      </div>
    </section>

    <section class="sec sec--contacto" id="contacto" data-sec>
      <div class="stage">
        <div class="contact">
          <h2>Si algo no funciona, hablemos</h2>
          <p class="copy">Cuéntame qué estás construyendo y qué debería funcionar sin fallos.</p>
          <div class="links">${contactLinks}</div>
        </div>
        <p class="foot">${esc(profile.name)}, ${new Date().getFullYear()}. Hecho con three.js y Vite.</p>
      </div>
    </section>`;

  const total = projects.length;
  $('#hud-project').innerHTML = `
    <h3 id="hp-title"></h3>
    <p id="hp-desc"></p>
    <ul class="tags" id="hp-tags"></ul>
    <div class="hud__row">
      <a class="btn btn--solid" id="hp-link" href="#" target="_blank" rel="noopener">Abrir repositorio</a>
      <div class="hud__nav">
        <button class="round" type="button" id="hp-prev" aria-label="Proyecto anterior">${ICON_PREV}</button>
        <span id="hp-count" aria-live="polite">1 de ${total}</span>
        <button class="round" type="button" id="hp-next" aria-label="Proyecto siguiente">${ICON_NEXT}</button>
      </div>
    </div>`;

  $('#hud-skill').innerHTML = `<strong>Elige un nodo</strong><span>Pasa el cursor o toca una habilidad de la constelación.</span>`;

  buildDefectsHud(0, 0);
}

export function buildDefectsHud(fixed, total) {
  const hud = $('#hud-defects');
  if (!total) {
    hud.innerHTML = '';
    return;
  }
  const done = fixed >= total;
  hud.innerHTML = `
    <div class="pips" aria-hidden="true">${Array.from({ length: total }, (_, i) =>
      `<i class="${i < fixed ? 'is-fixed' : 'is-open'}"></i>`
    ).join('')}</div>
    <p>${
      done
        ? 'Build verde. Todos los defectos corregidos.'
        : `Defectos corregidos: ${fixed} de ${total}`
    }</p>
    <p class="hint">${
      done ? 'Sigue bajando para ver mi trabajo.' : 'Gira el cristal arrastrando. Toca cada defecto magenta para corregirlo.'
    }</p>`;
}

export function setProject(i) {
  const p = projects[i];
  $('#hp-title').textContent = p.title;
  $('#hp-desc').textContent = p.description;
  $('#hp-tags').innerHTML = p.stack.map((t) => `<li>${esc(t)}</li>`).join('');
  $('#hp-link').href = p.url;
  $('#hp-link').setAttribute('aria-label', `Abrir repositorio de ${p.title}`);
  $('#hp-count').textContent = `${i + 1} de ${projects.length}`;
  $('#hp-prev').disabled = i === 0;
  $('#hp-next').disabled = i === projects.length - 1;
}

export function setSkill(skill) {
  const hud = $('#hud-skill');
  if (!skill) {
    hud.style.setProperty('--skill-color', '#4df3e0');
    hud.innerHTML = `<strong>Elige un nodo</strong><span>Pasa el cursor o toca una habilidad de la constelación.</span>`;
    return;
  }
  hud.style.setProperty('--skill-color', GROUP_COLORS[skill.group]);
  hud.innerHTML = `<strong>${esc(skill.name)}</strong><span>${esc(skill.note)}</span>`;
}

let toastTimer;
export function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

export function toggleHud(id, on) {
  $(id).classList.toggle('is-on', on);
}

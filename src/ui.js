import { profile, about, journey, projects, skills, sections, certifications } from './data/content.js';

const $ = (sel, root = document) => root.querySelector(sel);

const ICON_PREV =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
const ICON_NEXT =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';

export const GROUP_COLORS = {
  code: '#4df3e0',
  cloud: '#ff3d8b',
  ai: '#8e7cff',
};
const GROUP_LABELS = {
  code: 'Lenguajes y herramientas',
  cloud: 'Nube e integración',
  ai: 'Inteligencia artificial',
};

function renderPoint(p) {
  if (typeof p === 'string') return `<li>${esc(p)}</li>`;
  const link = p.link
    ? ` <a href="${esc(p.link.url)}" target="_blank" rel="noopener">${esc(p.link.label)}</a>`
    : '';
  return `<li>${esc(p.text)}${link}</li>`;
}

function renderStep(item, i) {
  const tags = item.tags
    ? `<ul class="tags">${item.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`
    : '';
  return `
    <li class="step${i === 0 ? ' is-open' : ''}">
      <button class="step__head" type="button" data-step="${i}" aria-expanded="${i === 0}" aria-controls="step-body-${i}">
        <span class="step__dot" aria-hidden="true"></span>
        <span class="step__title">
          <strong>${esc(item.org)}</strong>
          <span class="step__period">${esc(item.period)}</span>
        </span>
      </button>
      <div class="step__body" id="step-body-${i}">
        <div class="step__inner">
          <p class="step__focus">${esc(item.focus)}</p>
          <ul>${item.points.map(renderPoint).join('')}</ul>
          ${tags}
        </div>
      </div>
    </li>`;
}

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
      <li><a class="menu__cv" href="${esc(profile.cv)}" download>Descargar CV</a></li>
    </ul>`;

  // Riel lateral de puntos
  $('#rail').innerHTML = sections
    .map((s) => `<a href="#${s.id}" data-nav="${s.id}" aria-label="${esc(s.label)}" title="${esc(s.label)}"></a>`)
    .join('');

  const contactLinks = [
    profile.email &&
      `<button class="btn" type="button" id="copy-mail" data-mail="${esc(profile.email)}">Copiar correo</button>`,
    `<a class="btn" href="${esc(profile.github)}" target="_blank" rel="noopener">GitHub</a>`,
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

    <section class="sec sec--certificaciones" id="certificaciones" data-sec>
      <div class="stage stage--certs">
        <div class="certs">
          <h2 class="section-title">Certificaciones</h2>
          <ul class="certs__grid">${certifications.map(renderCert).join('')}</ul>
        </div>
      </div>
    </section>

    <section class="sec sec--trayectoria" id="trayectoria" data-sec>
      <div class="stage stage--path">
        <div class="path">
          <h2 class="section-title">Trayectoria</h2>
          <ol class="steps" id="steps">${journey.map(renderStep).join('')}</ol>
          <a class="btn path__cv" href="${esc(profile.cv)}" download>Descargar CV completo</a>
        </div>
      </div>
    </section>

    <section class="sec sec--contacto" id="contacto" data-sec>
      <div class="stage">
        <div class="contact">
          <h2>Si algo no funciona, hablemos</h2>
          <p class="copy">Cuéntame qué estás construyendo. Te respondo por correo.</p>
          <form class="form" id="contact-form" novalidate>
            <div class="form__row">
              <label class="field">
                <span>Nombre</span>
                <input name="name" type="text" autocomplete="name" required maxlength="80" />
              </label>
              <label class="field">
                <span>Correo</span>
                <input name="email" type="email" autocomplete="email" required maxlength="120" />
              </label>
            </div>
            <label class="field">
              <span>Mensaje</span>
              <textarea name="message" rows="4" required minlength="10" maxlength="2000"></textarea>
            </label>
            <input class="form__trap" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <div class="form__actions">
              <button class="btn btn--solid" type="submit" id="form-submit">Enviar mensaje</button>
              <p class="form__status" id="form-status" role="status" aria-live="polite"></p>
            </div>
          </form>
          <div class="cv">
            <p class="cv__text"><strong>Currículum</strong><span>Descárgalo en PDF si lo necesitas.</span></p>
            <div class="cv__btns">
              <a class="btn" href="${esc(profile.cv)}" download>Descargar CV</a>
              ${contactLinks}
            </div>
          </div>
        </div>
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

  $('#hud-skill').innerHTML = SKILL_HINT;

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

const SKILL_HINT = `<strong>Elige un nodo</strong><span>Pasa el cursor o toca una habilidad. Cada anillo que la orbita es un año de experiencia (de 1 a 3).</span>`;

function badgeSVG(c) {
  const col = GROUP_COLORS[c.kind] || GROUP_COLORS.code;
  const code = esc(c.code);
  const size = code.length > 4 ? 30 : 38;
  return `<svg viewBox="0 0 200 140" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="g-${c.id}" cx="50%" cy="50%" r="60%">
        <stop offset="0" stop-color="${col}" stop-opacity="0.38"/>
        <stop offset="1" stop-color="${col}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="200" height="140" fill="url(#g-${c.id})"/>
    <ellipse cx="100" cy="70" rx="86" ry="30" fill="none" stroke="${col}" stroke-opacity="0.35" transform="rotate(-18 100 70)"/>
    <ellipse cx="100" cy="70" rx="86" ry="30" fill="none" stroke="${col}" stroke-opacity="0.2" transform="rotate(24 100 70)"/>
    <polygon points="100,18 144,43 144,97 100,122 56,97 56,43" fill="rgba(7,11,31,0.7)" stroke="${col}" stroke-width="2"/>
    <polygon points="100,30 134,49 134,91 100,110 66,91 66,49" fill="none" stroke="${col}" stroke-opacity="0.4"/>
    <text x="100" y="78" text-anchor="middle" font-family="Unbounded Variable, sans-serif" font-weight="600" font-size="${size}" fill="#e8ecff">${code}</text>
    <circle cx="144" cy="43" r="4" fill="${col}"/>
  </svg>`;
}

function renderCert(c) {
  return `<li class="cert" style="--c:${GROUP_COLORS[c.kind] || GROUP_COLORS.code}">
    <button class="cert__btn" type="button" data-cert="${esc(c.id)}" aria-label="Ver certificado: ${esc(c.title)}">
      <span class="cert__photo">
        ${badgeSVG(c)}
        ${c.image ? `<img src="${esc(c.image)}" alt="Certificado: ${esc(c.title)}" loading="lazy" onload="this.parentNode.classList.add('has-photo')" onerror="this.remove()" />` : ''}
      </span>
      <span class="cert__meta"><em>${esc(c.issuer)}</em><strong>${esc(c.title)}</strong></span>
    </button>
  </li>`;
}

export function setupCerts() {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = '<form method="dialog"><button class="lightbox__close" aria-label="Cerrar">Cerrar</button></form><div class="lightbox__body"></div>';
  document.body.appendChild(dlg);
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cert]');
    if (!b) return;
    const c = certifications.find((x) => x.id === b.dataset.cert);
    const photo = b.querySelector('.cert__photo');
    const img = photo.classList.contains('has-photo') ? photo.querySelector('img') : null;
    dlg.querySelector('.lightbox__body').innerHTML =
      (img ? `<img src="${esc(img.getAttribute('src'))}" alt="${esc(img.alt)}" />` : `<div class="lightbox__badge">${badgeSVG(c)}</div>`) +
      `<p><em>${esc(c.issuer)}</em> ${esc(c.title)}</p>`;
    dlg.showModal();
  });
}

export function setSkill(skill) {
  const hud = $('#hud-skill');
  hud.classList.toggle('is-detail', !!skill);
  if (!skill) {
    hud.style.setProperty('--skill-color', '#4df3e0');
    hud.innerHTML = SKILL_HINT;
    return;
  }
  const years = Math.min(3, Math.max(1, skill.years || 1));
  hud.style.setProperty('--skill-color', GROUP_COLORS[skill.group]);
  hud.innerHTML = `
    <div class="sk__head">
      <strong>${esc(skill.name)}</strong>
      <span class="sk__group">${esc(GROUP_LABELS[skill.group] || '')}</span>
    </div>
    <div class="sk__years" role="img" aria-label="${years} ${years === 1 ? 'año' : 'años'} de experiencia">
      <div class="sk__bars">${[1, 2, 3].map((n) => `<i class="${n <= years ? 'is-on' : ''}"></i>`).join('')}</div>
      <b>${years} ${years === 1 ? 'año' : 'años'}</b>
      ${skill.since ? `<em>desde ${esc(skill.since)}</em>` : ''}
    </div>
    <p class="sk__summary">${esc(skill.summary || skill.note)}</p>
    ${
      skill.used && skill.used.length
        ? `<ul class="sk__used">${skill.used.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>`
        : ''
    }`;
}

let toastTimer;
export function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

// Formulario de contacto sin backend: FormSubmit reenvia el mensaje al correo configurado.
export function setupContactForm() {
  const form = $('#contact-form');
  if (!form || !profile.formTo) return;
  const button = $('#form-submit');
  const status = $('#form-status');
  const endpoint = `https://formsubmit.co/ajax/${profile.formTo}`;

  const say = (text, kind = '') => {
    status.textContent = text;
    status.dataset.kind = kind;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    // Campo trampa: los bots lo llenan, las personas no lo ven.
    if (data.get('_honey')) return;

    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (!name) return say('Escribe tu nombre.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say('Revisa tu correo: parece incompleto.', 'error');
    if (message.length < 10) return say('El mensaje es muy corto. Cuéntame un poco más.', 'error');

    button.disabled = true;
    say('Enviando...');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: `Nuevo mensaje de ${name} desde Portafolio-John-Guaman`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === 'false') throw new Error(json.message || 'Error de envío');
      form.reset();
      say('Mensaje enviado. Gracias, te respondo pronto.', 'ok');
      toast('Mensaje enviado');
      window.dispatchEvent(new CustomEvent('contact:sent'));
    } catch (err) {
      console.warn('Formulario de contacto:', err);
      say('No se pudo enviar. Inténtalo de nuevo en un momento o escríbeme por GitHub.', 'error');
    } finally {
      button.disabled = false;
    }
  });
}

export function setPathStep(i) {
  document.querySelectorAll('#steps .step').forEach((el, k) => {
    const open = k === i;
    el.classList.toggle('is-open', open);
    el.querySelector('.step__head').setAttribute('aria-expanded', String(open));
  });
}

export function toggleHud(id, on) {
  $(id).classList.toggle('is-on', on);
}

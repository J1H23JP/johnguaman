import { profile, about, journey, projects, skills, sections, certifications } from './data/content.js';
import { t, lang, setLang, getTheme, setTheme } from './i18n.js';

const $ = (sel, root = document) => root.querySelector(sel);

const ICON_PREV =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>';
const ICON_NEXT =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 3 5 5-5 5"/></svg>';

// Colores de grupo como variables CSS: cambian solos con el tema claro u oscuro.
export const GROUP_COLORS = {
  code: 'var(--g-code)',
  cloud: 'var(--g-cloud)',
  ai: 'var(--g-ai)',
};
const GROUP_LABELS = t.groups;

const ICON_SUN =
  '<svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON =
  '<svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>';

const dateFmt = (iso, opts) => new Intl.DateTimeFormat(t.locale, { timeZone: 'UTC', ...opts }).format(new Date(iso));

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
    <a class="brand" href="#inicio" data-nav="inicio" aria-label="${t.home}">
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
      <li><a class="menu__cv" href="${esc(profile.cv)}" download>${t.cv}</a></li>
    </ul>
    <div class="tools">
      <button class="tool tool--lang" id="btn-lang" type="button" aria-label="${t.toLang}" title="${t.toLang}">${t.langBtn}</button>
      <button class="tool tool--theme" id="btn-theme" type="button">${ICON_SUN}${ICON_MOON}</button>
    </div>`;
  updateThemeButton();

  // Riel lateral de puntos
  $('#rail').setAttribute('aria-label', t.sections);
  $('#rail').innerHTML = sections
    .map((s) => `<a href="#${s.id}" data-nav="${s.id}" aria-label="${esc(s.label)}" title="${esc(s.label)}"></a>`)
    .join('');

  const contactLinks = [
    profile.email &&
      `<button class="btn" type="button" id="copy-mail" data-mail="${esc(profile.email)}">${t.copyMail}</button>`,
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
            <a class="btn btn--solid" href="#proyectos" data-nav="proyectos">${t.viewProjects}</a>
            <a class="btn" href="#contacto" data-nav="contacto">${t.contact}</a>
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
        <h2 class="section-title">${t.projects}</h2>
      </div>
    </section>

    <section class="sec sec--habilidades" id="habilidades" data-sec>
      <div class="stage">
        <div>
          <h2 class="section-title">${t.skills}</h2>
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
          <h2 class="section-title">${t.certs}</h2>
          <ul class="certs__grid">${certifications.map(renderCert).join('')}</ul>
        </div>
      </div>
    </section>

    <section class="sec sec--trayectoria" id="trayectoria" data-sec>
      <div class="stage stage--path">
        <div class="path">
          <h2 class="section-title">${t.path}</h2>
          <ol class="steps" id="steps">${journey.map(renderStep).join('')}</ol>
          <a class="btn path__cv" href="${esc(profile.cv)}" download>${t.cvFull}</a>
        </div>
      </div>
    </section>

    <section class="sec sec--contacto" id="contacto" data-sec>
      <div class="stage">
        <div class="contact">
          <h2>${t.contactTitle}</h2>
          <p class="copy">${t.contactCopy}</p>
          <form class="form" id="contact-form" novalidate>
            <div class="form__row">
              <label class="field">
                <span>${t.fName}</span>
                <input name="name" type="text" autocomplete="name" required maxlength="80" />
              </label>
              <label class="field">
                <span>${t.fEmail}</span>
                <input name="email" type="email" autocomplete="email" required maxlength="120" />
              </label>
            </div>
            <label class="field">
              <span>${t.fMessage}</span>
              <textarea name="message" rows="4" required minlength="10" maxlength="2000"></textarea>
            </label>
            <input class="form__trap" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <div class="form__actions">
              <button class="btn btn--solid" type="submit" id="form-submit">${t.send}</button>
              <p class="form__status" id="form-status" role="status" aria-live="polite"></p>
            </div>
          </form>
          <div class="cv">
            <p class="cv__text"><strong>${t.cvTitle}</strong><span>${t.cvSub}</span></p>
            <div class="cv__btns">
              <a class="btn" href="${esc(profile.cv)}" download>${t.cv}</a>
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
      <a class="btn btn--solid" id="hp-link" href="#" target="_blank" rel="noopener">${t.openRepo}</a>
      <div class="hud__nav">
        <button class="round" type="button" id="hp-prev" aria-label="${t.prevProject}">${ICON_PREV}</button>
        <span id="hp-count" aria-live="polite">${t.countOf(1, total)}</span>
        <button class="round" type="button" id="hp-next" aria-label="${t.nextProject}">${ICON_NEXT}</button>
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
        ? t.defectsDone
        : t.defectsProgress(fixed, total)
    }</p>
    <p class="hint">${
      done ? t.defectsHintDone : t.defectsHint
    }</p>`;
}

export function setProject(i) {
  const p = projects[i];
  $('#hp-title').textContent = p.title;
  $('#hp-desc').textContent = p.description;
  $('#hp-tags').innerHTML = p.stack.map((t) => `<li>${esc(t)}</li>`).join('');
  $('#hp-link').href = p.url;
  $('#hp-link').setAttribute('aria-label', t.openRepoOf(p.title));
  $('#hp-count').textContent = t.countOf(i + 1, projects.length);
  $('#hp-prev').disabled = i === 0;
  $('#hp-next').disabled = i === projects.length - 1;
}

const SKILL_HINT = `<strong>${t.skillHintTitle}</strong><span>${t.skillHint}</span>`;

// Insignia generada (solo para certificados sin insignia propia). Usa currentColor para seguir al tema.
function badgeSVG(c, hex = true) {
  const code = esc(c.code);
  const size = code.length > 4 ? 30 : 38;
  return `<svg viewBox="0 0 200 140" aria-hidden="true" focusable="false" style="color:var(--c)">
    <defs>
      <radialGradient id="g-${c.id}" cx="50%" cy="50%" r="60%">
        <stop offset="0" stop-color="currentColor" stop-opacity="0.38"/>
        <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="200" height="140" fill="url(#g-${c.id})"/>
    <ellipse cx="100" cy="70" rx="86" ry="30" fill="none" stroke="currentColor" stroke-opacity="0.35" transform="rotate(-18 100 70)"/>
    <ellipse cx="100" cy="70" rx="86" ry="30" fill="none" stroke="currentColor" stroke-opacity="0.2" transform="rotate(24 100 70)"/>
    ${
      hex
        ? `<polygon class="bd-fill" points="100,18 144,43 144,97 100,122 56,97 56,43" stroke="currentColor" stroke-width="2"/>
    <polygon points="100,30 134,49 134,91 100,110 66,91 66,49" fill="none" stroke="currentColor" stroke-opacity="0.4"/>
    <text class="bd-text" x="100" y="78" text-anchor="middle" font-family="Unbounded Variable, sans-serif" font-weight="600" font-size="${size}">${code}</text>
    <circle cx="144" cy="43" r="4" fill="currentColor"/>`
        : ''
    }
  </svg>`;
}

function certDates(c) {
  if (!c.date) return '';
  const parts = [`${t.earned}: ${dateFmt(c.date, { day: 'numeric', month: 'long', year: 'numeric' })}`];
  if (c.expires) parts.push(`${t.expires}: ${dateFmt(c.expires, { day: 'numeric', month: 'long', year: 'numeric' })}`);
  return parts.join(' · ');
}

function renderCert(c) {
  const colorVar = GROUP_COLORS[c.kind] || GROUP_COLORS.code;
  // Con insignia propia se muestra la insignia; sin ella, la insignia generada (y la foto si ya existe).
  const visual = c.badge
    ? `${badgeSVG(c, false)}<img class="cert__badge" src="${esc(c.badge)}" alt="" loading="lazy" /><i class="cert__code">${esc(c.code)}</i>`
    : `${badgeSVG(c)}${
        c.image
          ? `<img class="cert__img" src="${esc(c.image)}" alt="${esc(t.certAlt(c.title))}" loading="lazy" onload="this.parentNode.classList.add('has-photo')" onerror="this.remove()" />`
          : ''
      }`;
  return `<li class="cert" style="--c:${colorVar}">
    <button class="cert__btn" type="button" data-cert="${esc(c.id)}" aria-label="${esc(t.certView(c.title))}">
      <span class="cert__photo">${visual}</span>
      <span class="cert__meta">
        <em>${esc(c.issuer)}</em>
        <strong>${esc(c.title)}</strong>
        ${c.date ? `<small>${esc(dateFmt(c.date, { month: 'short', year: 'numeric' }))}</small>` : ''}
      </span>
    </button>
  </li>`;
}

export function setupCerts() {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = `<form method="dialog"><button class="lightbox__close" aria-label="${t.close}">${t.close}</button></form><div class="lightbox__body"></div>`;
  document.body.appendChild(dlg);
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  const body = dlg.querySelector('.lightbox__body');

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cert]');
    if (!b) return;
    const c = certifications.find((x) => x.id === b.dataset.cert);
    if (!c) return;
    dlg.style.setProperty('--c', GROUP_COLORS[c.kind] || GROUP_COLORS.code);
    const dates = certDates(c);
    body.innerHTML = `
      <div class="lightbox__media"></div>
      <p class="lightbox__cap"><em>${esc(c.issuer)}</em> <strong>${esc(c.title)}</strong>${dates ? `<span>${esc(dates)}</span>` : ''}</p>`;
    const media = body.querySelector('.lightbox__media');
    const fallback = () => {
      media.innerHTML = `<div class="lightbox__badge">${badgeSVG(c)}</div><p class="lightbox__pending">${t.pendingPhoto}</p>`;
    };
    if (c.image) {
      const img = new Image();
      img.alt = t.certAlt(c.title);
      img.onerror = fallback;
      img.src = c.image;
      media.appendChild(img);
    } else {
      fallback();
    }
    dlg.showModal();
  });
}

export function setupTools() {
  $('#btn-lang').addEventListener('click', () => setLang(lang === 'es' ? 'en' : 'es'));
  $('#btn-theme').addEventListener('click', () => {
    setTheme(getTheme() === 'light' ? 'dark' : 'light');
    updateThemeButton();
  });
}

function updateThemeButton() {
  const btn = $('#btn-theme');
  if (!btn) return;
  const label = getTheme() === 'light' ? t.toDark : t.toLight;
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}

export function setSkill(skill) {
  const hud = $('#hud-skill');
  hud.classList.toggle('is-detail', !!skill);
  if (!skill) {
    hud.style.setProperty('--skill-color', 'var(--g-code)');
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
    <div class="sk__years" role="img" aria-label="${t.yearsAria(years)}">
      <div class="sk__bars">${[1, 2, 3].map((n) => `<i class="${n <= years ? 'is-on' : ''}"></i>`).join('')}</div>
      <b>${t.years(years)}</b>
      ${skill.since ? `<em>${t.since} ${esc(skill.since)}</em>` : ''}
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

    if (!name) return say(t.errName, 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say(t.errEmail, 'error');
    if (message.length < 10) return say(t.errMessage, 'error');

    button.disabled = true;
    say(t.sending);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
          _subject: t.subject(name),
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || String(json.success) === 'false') throw new Error(json.message || 'Error de envío');
      form.reset();
      say(t.sent, 'ok');
      toast(t.sentToast);
      window.dispatchEvent(new CustomEvent('contact:sent'));
    } catch (err) {
      console.warn('Formulario de contacto:', err);
      say(t.sendFail, 'error');
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

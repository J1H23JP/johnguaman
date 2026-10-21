// Enlace personalizado por empresa: ?para=Acme&stack=Azure,Python&resumen=1
// - Muestra un saludo con el nombre y resalta habilidades que YA estan en el portafolio.
// - Todo se valida y se escribe con textContent: un enlace manipulado no puede inyectar codigo ni habilidades falsas.
// - Tambien incluye el creador de enlaces (para John), que se abre desde la paleta de comandos.

import { skills } from './data/content.js';
import { t } from './i18n.js';
import { track } from './analytics.js';
import { openRecruiter } from './recruiter.js';

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const MAX_NAME = 40;
const MAX_SKILLS = 8;

function cleanName(raw) {
  const v = String(raw || '')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N} .&'_-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME);
  return v || '';
}

// Devuelve los nombres EXACTOS de habilidades del portafolio que coinciden con el texto pedido.
export function matchSkills(raw) {
  const wanted = String(raw || '')
    .split(/[,;]/)
    .map(norm)
    .filter(Boolean)
    .slice(0, 20);
  const found = [];
  const unknown = [];
  wanted.forEach((w) => {
    const hit = skills.find((s) => norm(s.name) === w) || skills.find((s) => norm(s.name).split(/[^a-z0-9+#.]+/).includes(w));
    if (hit) {
      if (!found.includes(hit.name)) found.push(hit.name);
    } else unknown.push(w);
  });
  return { found: found.slice(0, MAX_SKILLS), unknown };
}

let current = null;
export const getCampaign = () => current;

export function readCampaign() {
  let params;
  try {
    params = new URLSearchParams(location.search);
  } catch {
    return null;
  }
  const company = cleanName(params.get('para'));
  if (!company) return null;
  const { found } = matchSkills(params.get('stack'));
  current = { company, skills: found, summary: params.get('resumen') === '1' };
  return current;
}

const list = (arr) => arr.join(', ');

function showBanner(c) {
  let closed = false;
  try {
    closed = sessionStorage.getItem('campaign:closed') === '1';
  } catch {
    /* sin almacenamiento */
  }
  if (closed) return;
  const el = document.createElement('aside');
  el.className = 'campaign';
  el.setAttribute('role', 'note');
  const text = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = t.campHello(c.company);
  text.append(strong, document.createTextNode(` ${t.campSub}`));
  if (c.skills.length) {
    const small = document.createElement('span');
    small.textContent = ` ${t.campFeatured(list(c.skills))}`;
    text.append(small);
  }
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'btn btn--solid campaign__open';
  open.textContent = t.recruiterBtn;
  open.addEventListener('click', () => openRecruiter());
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'campaign__close';
  close.setAttribute('aria-label', t.campClose);
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  close.addEventListener('click', () => {
    el.remove();
    try {
      sessionStorage.setItem('campaign:closed', '1');
    } catch {
      /* igual */
    }
  });
  el.append(text, open, close);
  document.body.appendChild(el);
}

export function setupCampaign() {
  const c = readCampaign();
  if (!c) return;
  const slug = norm(c.company).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'empresa';
  track(`enlace/${slug}`, `Enlace de empresa: ${c.company}`, { unique: true });
  showBanner(c);
  if (c.summary) setTimeout(() => openRecruiter(), 1600);
}

// ---------------------------------------------------------------- Creador de enlaces (para John)

let dlg;

function baseUrl() {
  return `${location.origin}${location.pathname}`;
}

export function buildLink(company, stack, summary) {
  const name = cleanName(company);
  if (!name) return '';
  const q = new URLSearchParams();
  q.set('para', name);
  const { found } = matchSkills(stack);
  if (found.length) q.set('stack', found.join(','));
  if (summary) q.set('resumen', '1');
  return `${baseUrl()}?${q.toString()}`;
}

export function openLinkMaker() {
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.className = 'tool-dialog';
    dlg.setAttribute('aria-labelledby', 'lm-title');
    dlg.innerHTML = `
      <form method="dialog" class="tool-dialog__box" id="lm-form">
        <div class="tool-dialog__head">
          <h2 id="lm-title">${t.linkTitle}</h2>
          <button type="button" class="tool-dialog__x" data-lm-close aria-label="${t.recClose}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <label class="field"><span>${t.linkCompany}</span><input id="lm-company" type="text" maxlength="${MAX_NAME}" autocomplete="off" placeholder="${t.linkCompanyPh}" /></label>
        <label class="field"><span>${t.linkStack}</span><input id="lm-stack" type="text" maxlength="120" autocomplete="off" placeholder="${t.linkStackPh}" /></label>
        <label class="check"><input id="lm-summary" type="checkbox" /> <span>${t.linkSummary}</span></label>
        <p class="tool-dialog__hint" id="lm-hint">${t.linkHint}</p>
        <label class="field"><span>${t.linkResult}</span><input id="lm-out" type="text" readonly /></label>
        <div class="tool-dialog__btns"><button type="button" class="btn btn--solid" id="lm-copy">${t.linkCopy}</button></div>
      </form>`;
    document.body.appendChild(dlg);
    const $ = (id) => dlg.querySelector(id);
    const refresh = () => {
      const company = $('#lm-company').value;
      const stack = $('#lm-stack').value;
      const { unknown } = matchSkills(stack);
      $('#lm-hint').textContent = unknown.length ? t.linkUnknown(unknown.join(', ')) : t.linkHint;
      $('#lm-out').value = buildLink(company, stack, $('#lm-summary').checked) || '';
      $('#lm-out').placeholder = t.linkNeedName;
    };
    ['#lm-company', '#lm-stack', '#lm-summary'].forEach((id) => $(id).addEventListener('input', refresh));
    $('#lm-copy').addEventListener('click', () => {
      const v = $('#lm-out').value;
      if (!v) return $('#lm-company').focus();
      navigator.clipboard
        ?.writeText(v)
        .then(() => {
          const b = $('#lm-copy');
          b.textContent = t.recLinkCopied;
          setTimeout(() => (b.textContent = t.linkCopy), 1800);
        })
        .catch(() => $('#lm-out').select());
    });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-lm-close]')) dlg.close();
    });
    refresh();
  }
  dlg.showModal();
  dlg.querySelector('#lm-company').focus();
}

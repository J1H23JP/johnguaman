// Resumen rapido para quien tiene 30 segundos: rol, experiencia, habilidades con anos, certificaciones y contacto.
// Se arma con los mismos datos del portafolio, asi nunca se desactualiza.

import { profile, about, journey, skills, certifications } from './data/content.js';
import { t } from './i18n.js';
import { certStatus } from './ui.js';
import { track } from './analytics.js';
import { getCampaign } from './campaign.js';
import { openAgent } from './agent.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let dlg;

function build() {
  const camp = getCampaign();
  const featured = new Set(camp ? camp.skills : []);
  const groups = [...new Set(skills.map((s) => s.group))];

  const skillBlock = groups
    .map((g) => {
      const items = skills
        .filter((s) => s.group === g)
        .sort((a, b) => b.years - a.years)
        .map(
          (s) =>
            `<li class="rec__skill${featured.has(s.name) ? ' is-featured' : ''}"><b>${esc(s.name)}</b><span>${esc(t.years(s.years))}</span></li>`
        )
        .join('');
      return `<div class="rec__group"><h4>${esc(t.groups[g])}</h4><ul class="rec__skills">${items}</ul></div>`;
    })
    .join('');

  const certs = certifications
    .map((c) => {
      const st = certStatus(c);
      return `<li><span>${esc(c.issuer)}: ${esc(c.title)}</span>${
        st ? `<em class="cert__status cert__status--${st.kind}">${esc(st.label)}</em>` : ''
      }</li>`;
    })
    .join('');

  const exp = journey
    .slice(0, 3)
    .map((s) => `<li><b>${esc(s.org)}</b><span>${esc(s.focus)} · ${esc(s.period)}</span></li>`)
    .join('');

  const facts = about.facts.map((f) => `<li><b>${esc(f.term)}</b><span>${esc(f.detail)}</span></li>`).join('');
  const avail = profile.availability ? `<li><b>${esc(t.recAvail)}</b><span>${esc(profile.availability)}</span></li>` : '';

  return `
    <div class="tool-dialog__box rec">
      <div class="tool-dialog__head">
        <div>
          <p class="rec__role">${esc(profile.role)}</p>
          <h2 id="rec-title">${esc(profile.name)} <small>${esc(t.recTitle)}</small></h2>
        </div>
        <button type="button" class="tool-dialog__x" data-rec-close aria-label="${t.recClose}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
      </div>
      <p class="rec__lede">${esc(profile.headline)}</p>
      ${camp && camp.skills.length ? `<p class="rec__feat">${esc(t.recFeatured(camp.skills.join(', ')))}</p>` : ''}
      <ul class="rec__facts">${facts}${avail}</ul>
      <h3>${esc(t.recExp)}</h3>
      <ul class="rec__list">${exp}</ul>
      <h3>${esc(t.recSkills)}</h3>
      ${skillBlock}
      <h3>${esc(t.recCerts)}</h3>
      <ul class="rec__certs">${certs}</ul>
      <div class="tool-dialog__btns">
        <a class="btn btn--solid" href="${esc(profile.cv)}" download>${esc(t.cv)}</a>
        <button type="button" class="btn" data-rec-contact>${esc(t.recContact)}</button>
        <button type="button" class="btn" data-rec-job>${esc(t.recCompare)}</button>
        <button type="button" class="btn" data-rec-copy>${esc(t.recCopyLink)}</button>
        ${profile.linkedin ? `<a class="btn" href="${esc(profile.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>` : ''}
        <a class="btn" href="${esc(profile.github)}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </div>`;
}

export function openRecruiter() {
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.className = 'tool-dialog tool-dialog--wide';
    dlg.setAttribute('aria-labelledby', 'rec-title');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.closest('[data-rec-close]')) return dlg.close();
      const go = (fn) => {
        dlg.close();
        setTimeout(fn, 80);
      };
      if (e.target.closest('[data-rec-contact]')) return go(() => document.querySelector('[data-nav="contacto"]')?.click());
      if (e.target.closest('[data-rec-job]')) return go(() => openAgent('job'));
      const copy = e.target.closest('[data-rec-copy]');
      if (copy) {
        const url = `${location.origin}${location.pathname}${location.search}`;
        navigator.clipboard
          ?.writeText(url)
          .then(() => {
            copy.textContent = t.recLinkCopied;
            setTimeout(() => (copy.textContent = t.recCopyLink), 1800);
          })
          .catch(() => {});
      }
    });
  }
  if (dlg.open) return;
  if (document.querySelector('dialog[open]')) return;
  dlg.innerHTML = build(); // al abrir: la vigencia de certificados siempre esta al dia
  track('resumen/abrir', 'Resumen rápido abierto');
  dlg.showModal();
  dlg.querySelector('.tool-dialog__x')?.focus();
}

export function setupRecruiter() {
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('[data-recruiter]')) openRecruiter();
  });
}

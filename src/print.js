// Version para imprimir o guardar como PDF.
// El portafolio es 3D y con scroll: no se imprime tal cual. Aqui se arma un documento limpio con los mismos datos,
// oculto en pantalla y visible solo al imprimir (ver @media print en style.css).

import { profile, about, journey, projects, skills, certifications } from './data/content.js';
import { t } from './i18n.js';
import { certStatus } from './ui.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fmt = (iso, opts) => new Intl.DateTimeFormat(t.locale, { timeZone: 'UTC', ...opts }).format(new Date(iso));

function point(p) {
  if (typeof p === 'string') return `<li>${esc(p)}</li>`;
  return `<li>${esc(p.text)}${p.link ? ` ${esc(p.link.label)} (${esc(p.link.url)})` : ''}</li>`;
}

function build() {
  const url = `${location.origin}${location.pathname}`;
  const groups = [...new Set(skills.map((s) => s.group))];
  const links = [url, profile.github, profile.linkedin, profile.email].filter(Boolean);
  return `
    <header>
      <h1>${esc(profile.name)}</h1>
      <p class="pd__role">${esc(profile.role)}</p>
      <p>${esc(profile.headline)}</p>
      <p class="pd__links">${links.map(esc).join(' &nbsp;·&nbsp; ')}</p>
    </header>

    <section>
      <h2>${t.printProfile}</h2>
      ${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}
      <p class="pd__facts">${about.facts.map((f) => `<span><b>${esc(f.term)}:</b> ${esc(f.detail)}</span>`).join('')}</p>
    </section>

    <section>
      <h2>${t.printExperience}</h2>
      ${journey
        .map(
          (s) => `<div class="pd__entry">
            <h3>${esc(s.org)} <span>${esc(s.period)}</span></h3>
            <p class="pd__focus">${esc(s.focus)}</p>
            <ul>${s.points.map(point).join('')}</ul>
          </div>`
        )
        .join('')}
    </section>

    <section>
      <h2>${t.printSkills}</h2>
      ${groups
        .map(
          (g) => `<p class="pd__skills"><b>${esc(t.groups[g])}:</b> ${skills
            .filter((s) => s.group === g)
            .map((s) => `${esc(s.name)} (${esc(t.years(s.years))})`)
            .join(', ')}.</p>`
        )
        .join('')}
    </section>

    <section>
      <h2>${t.printProjects}</h2>
      ${projects
        .map(
          (p) => `<div class="pd__entry">
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.description)} <i>${esc(p.stack.join(', '))}</i></p>
            <p class="pd__url">${esc(p.url)}</p>
          </div>`
        )
        .join('')}
    </section>

    <section>
      <h2>${t.printCerts}</h2>
      <ul>${certifications
        .map((c) => {
          const st = certStatus(c);
          const bits = [c.date ? fmt(c.date, { month: 'long', year: 'numeric' }) : '', st ? st.label : ''].filter(Boolean);
          return `<li><b>${esc(c.issuer)}</b>: ${esc(c.title)}${bits.length ? ` (${esc(bits.join(' · '))})` : ''}</li>`;
        })
        .join('')}</ul>
    </section>

    <footer>${t.printFooter} ${esc(url)}</footer>`;
}

export function setupPrint() {
  const doc = document.createElement('article');
  doc.id = 'print-doc';
  doc.setAttribute('aria-hidden', 'true');
  document.body.appendChild(doc);
  // Se arma justo antes de imprimir: asi la fecha de vigencia y la direccion siempre estan al dia.
  const fill = () => {
    doc.innerHTML = build();
  };
  fill();
  window.addEventListener('beforeprint', fill);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-print]')) window.print();
  });
}

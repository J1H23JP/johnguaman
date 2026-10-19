import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { profile, about, journey, skills, certifications } from './src/data/content.es.js';

// Direccion publica del sitio (GitHub Pages). Si lo mueves a un dominio propio, cambia solo esta linea.
const SITE = 'https://j1h23jp.github.io/johnguaman/';

// Datos estructurados (schema.org) para buscadores. Salen de los mismos datos de la pagina, sin correo ni telefono.
function structuredData() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE}#john`,
    name: profile.name,
    url: SITE,
    jobTitle: profile.role,
    description: profile.headline,
    sameAs: [profile.github, profile.linkedin].filter(Boolean),
    address: { '@type': 'PostalAddress', addressLocality: 'Quito', addressCountry: 'EC' },
    worksFor: { '@type': 'Organization', name: journey[0].org },
    alumniOf: { '@type': 'CollegeOrUniversity', name: journey[journey.length - 1].org },
    knowsAbout: skills.map((s) => s.name),
    // Solo las certificaciones con fecha de emision (las que tienen certificado verificable).
    hasCredential: certifications
      .filter((c) => c.date)
      .map((c) => ({
        '@type': 'EducationalOccupationalCredential',
        name: c.title,
        credentialCategory: c.code,
        recognizedBy: { '@type': 'Organization', name: c.issuer },
      })),
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE}#web`,
    url: SITE,
    name: 'Portafolio-John-Guaman',
    inLanguage: 'es',
    about: { '@id': `${SITE}#john` },
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [person, website] }).replace(/</g, '\\u003c');
}

function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const full = path.join(dir, d.name);
    return d.isDirectory() ? listFiles(full, base) : [path.relative(base, full).split(path.sep).join('/')];
  });
}

// SEO (datos estructurados, direccion canonica, sitemap) y PWA (service worker con la lista de archivos del build).
function portfolioPlugin() {
  let publicDir = 'public';
  return {
    name: 'portfolio-seo-pwa',
    configResolved(config) {
      publicDir = config.publicDir;
    },
    transformIndexHtml(html) {
      const ld = `<script type="application/ld+json">${structuredData()}</script>`;
      return html.replaceAll('%SITE%', SITE).replace('</head>', `    ${ld}\n  </head>`);
    },
    generateBundle(_, bundle) {
      const publicFiles = listFiles(publicDir).filter((f) => !['og.jpg', '.gitkeep'].includes(f) && !f.endsWith('/.gitkeep'));
      const built = Object.keys(bundle).filter((f) => !f.endsWith('.map'));
      // index.html se agrega a mano: Vite lo emite despues de este paso.
      const precache = ['./', 'index.html', ...new Set([...built, ...publicFiles])].sort();

      // La version cambia si cambia cualquier archivo del build o de public/ (por ejemplo, el CV nuevo).
      const hash = crypto.createHash('md5');
      built.forEach((f) => hash.update(f));
      publicFiles.forEach((f) => hash.update(f).update(fs.readFileSync(path.join(publicDir, f))));
      const version = hash.digest('hex').slice(0, 10);

      const template = fs.readFileSync(new URL('./pwa/sw.template.js', import.meta.url), 'utf8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(precache)),
      });

      const day = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE}</loc>\n    <lastmod>${day}</lastmod>\n  </url>\n</urlset>\n`,
      });
    },
  };
}

// base relativa: el sitio funciona en https://usuario.github.io/portafolio-3d/
// y también en cualquier otro hosting estático sin tocar nada.
export default defineConfig({
  base: './',
  plugins: [portfolioPlugin()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
});

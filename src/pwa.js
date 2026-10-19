// App instalable y sin conexion: registra el service worker (solo en la version publicada),
// guarda el aviso de instalacion del navegador y avisa cuando se pierde o vuelve la conexion.

import { t } from './i18n.js';
import { toast } from './ui.js';

let deferred = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferred = e;
});
window.addEventListener('appinstalled', () => {
  deferred = null;
  toast(t.installed);
});

export const canInstall = () => !!deferred;
export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export async function promptInstall() {
  if (!deferred) return toast(t.installTip);
  deferred.prompt();
  try {
    await deferred.userChoice;
  } catch {
    /* el usuario cerro el aviso */
  }
  deferred = null;
}

export function setupPwa() {
  window.addEventListener('offline', () => toast(t.wentOffline));
  window.addEventListener('online', () => toast(t.backOnline));

  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker:', err));
  });
}

/**
 * Resolve POI code from path /poi/CODE or query ?code=
 */
export function getPoiCodeFromLocation() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get('code');
  if (q && q.trim()) return q.trim();

  const parts = url.pathname.split('/').filter(Boolean);
  const i = parts.findIndex((p) => p.toLowerCase() === 'poi');
  if (i >= 0 && parts[i + 1]) return parts[i + 1];

  return '';
}

export function getLangFromLocation() {
  const url = new URL(window.location.href);
  const lang = (url.searchParams.get('lang') || 'vi').toLowerCase();
  return lang === 'en' ? 'en' : 'vi';
}

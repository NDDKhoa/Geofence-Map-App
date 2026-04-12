/**
 * Public POI API (read-only). Backend returns:
 * 200: { success: true, data: { id, code, location, content: string, isPremiumOnly } }
 * 404: { error: { code, message } }
 */

function apiRoot() {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env && String(env).trim()) {
    return String(env).replace(/\/$/, '');
  }
  return '';
}

/**
 * @param {string} code
 * @param {string} [lang] 'vi' | 'en'
 * @returns {Promise<{ ok: true, data: object } | { ok: false, status: number, message: string }>}
 */
export async function fetchPoiByCode(code, lang = 'vi') {
  const root = apiRoot();
  const path = `/api/v1/pois/code/${encodeURIComponent(code)}?lang=${encodeURIComponent(lang)}`;
  const url = root ? `${root}${path}` : path;

  let res;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    return {
      ok: false,
      status: 0,
      message:
        'Khong ket noi duoc may chu. Kiem tra mang, CORS, hoac chay web dev voi proxy /api (xem README).',
    };
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.ok && body && body.success && body.data) {
    return { ok: true, data: body.data };
  }

  const message =
    body?.error?.message ||
    body?.message ||
    (res.status === 404 ? 'Khong tim thay diem tham quan.' : `Loi ${res.status}`);

  return { ok: false, status: res.status, message };
}

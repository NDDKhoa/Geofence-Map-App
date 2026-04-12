import './styles.css';
import { fetchPoiByCode } from './api.js';
import { getPoiCodeFromLocation, getLangFromLocation } from './router.js';
import { poiCustomSchemeUrl, androidIntentUrl, playStoreUrl } from './deepLink.js';

const app = document.getElementById('app');

function normalizeCode(raw) {
  if (!raw || !String(raw).trim()) return '';
  return String(raw).trim().toUpperCase();
}

function renderLoading() {
  app.innerHTML = `
    <div class="wrap">
      <div class="brand">VN GO Travel</div>
      <div class="skeleton" style="width:70%;height:2rem"></div>
      <div class="skeleton" style="width:40%"></div>
      <div class="card">
        <div class="skeleton"></div>
        <div class="skeleton"></div>
        <div class="skeleton" style="width:85%"></div>
      </div>
    </div>
  `;
}

function renderError(title, message, codeHint) {
  app.innerHTML = `
    <div class="wrap">
      <div class="brand">VN GO Travel</div>
      <div class="card error-card">
        <h1>${escapeHtml(title)}</h1>
        <p class="body-text">${escapeHtml(message)}</p>
        ${
          codeHint
            ? `<p class="body-text" style="margin-top:1rem">Ma: <strong>${escapeHtml(codeHint)}</strong></p>`
            : ''
        }
      </div>
      <div class="actions">
        <a class="btn btn-secondary" href="./">Ve trang chu</a>
        <a class="btn btn-primary" href="${playStoreUrl()}" target="_blank" rel="noopener">Tai ung dung VN GO Travel</a>
      </div>
    </div>
  `;
}

function renderPoi(data, _lang, code) {
  const title = data.code || code;
  const body = typeof data.content === 'string' ? data.content : '';

  const isAndroid = /Android/i.test(navigator.userAgent);
  const openHref = isAndroid ? androidIntentUrl(code) : poiCustomSchemeUrl(code);

  app.innerHTML = `
    <div class="wrap">
      <div class="brand">VN GO Travel</div>
      <span class="code-pill">${escapeHtml(code)}</span>
      <h1>${escapeHtml(title)}</h1>
      <div class="lang-toggle">
        <span style="color:var(--muted)">Ngon ngu:</span>
        <a href="/poi/${encodeURIComponent(code)}?lang=vi">Tieng Viet</a>
        <a href="/poi/${encodeURIComponent(code)}?lang=en">English</a>
      </div>
      <div class="card">
        <div class="body-text">${escapeHtml(body) || '—'}</div>
        ${
          data.location
            ? `<p class="body-text" style="margin-top:1rem;font-size:0.9rem">GPS: ${Number(data.location.lat).toFixed(5)}, ${Number(data.location.lng).toFixed(5)}</p>`
            : ''
        }
      </div>
      <div class="actions">
        <a class="btn btn-primary" href="${escapeAttr(openHref)}">Mo trong ung dung</a>
        <a class="btn btn-secondary" href="${playStoreUrl()}" target="_blank" rel="noopener">Tai ung dung VN GO Travel</a>
      </div>
      <p class="footer-note">Cai ung dung de co ban do, thuyet minh va trai nghiem day du.</p>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

async function main() {
  const code = normalizeCode(getPoiCodeFromLocation());
  const lang = getLangFromLocation();

  if (!code) {
    renderError(
      'Thieu ma dia diem',
      'Dung URL dang /poi/MA_CODE hoac ?code=MA_CODE',
      ''
    );
    return;
  }

  renderLoading();
  const result = await fetchPoiByCode(code, lang);

  if (!result.ok) {
    const is404 = result.status === 404;
    renderError(
      is404 ? 'Khong tim thay diem tham quan' : 'Khong tai duoc noi dung',
      result.message || 'Vui long thu lai sau.',
      code
    );
    return;
  }

  renderPoi(result.data, lang, code);
}

main();

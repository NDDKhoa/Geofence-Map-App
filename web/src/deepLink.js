/**
 * Deep links aligned with MAUI QrResolver: poi://CODE (host = CODE)
 * Package id from MauiApp1.csproj ApplicationId
 */
export const ANDROID_PACKAGE_ID = 'com.companyname.mauiapp1';

/** @param {string} code normalized uppercase */
export function poiCustomSchemeUrl(code) {
  const safe = encodeURIComponent(code);
  return `poi://${safe}`;
}

/**
 * Android Chrome: open app via intent; S.browser_fallback_url when app missing.
 * @param {string} code
 */
export function androidIntentUrl(code) {
  const safe = encodeURIComponent(code);
  const fallback = encodeURIComponent(playStoreUrl());
  return `intent://${safe}#Intent;scheme=poi;package=${ANDROID_PACKAGE_ID};S.browser_fallback_url=${fallback};end`;
}

export function playStoreUrl() {
  return `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
}

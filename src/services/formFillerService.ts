import { FiscalData } from '../types';

/**
 * Builds a JavaScript string to inject into a WebView.
 * The script attempts to fill RFC, nombre, email and CP fields
 * using common selector patterns found in Mexican invoice portals.
 *
 * The script must end with `true;` — required by React Native WebView's
 * injectJavaScript() API.
 *
 * Results are sent back via window.ReactNativeWebView.postMessage()
 * as JSON: { type: 'FILL_RESULT', results: AutoFillResult }
 */
export function buildFillScript(fiscalData: FiscalData): string {
  // Escape the data safely for inline JS embedding
  const safeData = JSON.stringify({
    rfc: fiscalData.rfc,
    nombre: fiscalData.nombre,
    email: fiscalData.email,
    codigoPostal: fiscalData.codigoPostal,
    direccion: fiscalData.direccion,
  });

  return `
(function() {
  try {
    var data = ${safeData};

    /**
     * Tries each selector in order, fills the first matching
     * non-disabled, non-readonly input, dispatches React-compatible events.
     */
    function fillInput(selectors, value) {
      for (var i = 0; i < selectors.length; i++) {
        var el = document.querySelector(selectors[i]);
        if (el && !el.disabled && !el.readOnly && el.offsetParent !== null) {
          try {
            // Support React-controlled inputs that intercept .value setter
            var descriptor = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype, 'value'
            );
            if (descriptor && descriptor.set) {
              descriptor.set.call(el, value);
            } else {
              el.value = value;
            }
          } catch(e) {
            el.value = value;
          }
          el.dispatchEvent(new Event('input',  { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur',   { bubbles: true }));
          return true;
        }
      }
      return false;
    }

    var results = {
      rfc: fillInput([
        'input[name="rfc"]', 'input[id="rfc"]',
        'input[name="RFC"]', 'input[id="RFC"]',
        'input[name*="rfc" i]', 'input[id*="rfc" i]',
        'input[placeholder*="RFC"]', 'input[placeholder*="Rfc"]',
        'input[aria-label*="RFC" i]', 'input[autocomplete="organization-title"]'
      ], data.rfc),

      nombre: fillInput([
        'input[name*="razon" i]', 'input[id*="razon" i]',
        'input[name*="nombre" i]', 'input[id*="nombre" i]',
        'input[name*="social" i]', 'input[id*="social" i]',
        'input[placeholder*="razón" i]', 'input[placeholder*="razon" i]',
        'input[placeholder*="Nombre"]', 'input[placeholder*="nombre"]',
        'input[aria-label*="nombre" i]', 'input[autocomplete="organization"]'
      ], data.nombre),

      email: fillInput([
        'input[type="email"]',
        'input[name*="email" i]', 'input[id*="email" i]',
        'input[placeholder*="email" i]', 'input[placeholder*="correo" i]',
        'input[name*="correo" i]', 'input[id*="correo" i]',
        'input[aria-label*="email" i]', 'input[autocomplete="email"]'
      ], data.email),

      codigoPostal: fillInput([
        'input[name*="postal" i]', 'input[name*="cp" i]',
        'input[id*="postal" i]', 'input[id*="cp" i]',
        'input[placeholder*="Postal" i]', 'input[placeholder*="C.P" i]',
        'input[placeholder*="código postal" i]',
        'input[maxlength="5"][type="text"]',
        'input[maxlength="5"][type="number"]',
        'input[aria-label*="postal" i]'
      ], data.codigoPostal),

      hasCaptcha: !!(
        document.querySelector(
          '.g-recaptcha, [data-sitekey], iframe[src*="recaptcha"], .cf-turnstile, [class*="captcha"]'
        )
      ),
      pageTitle: document.title || '',
    };

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'FILL_RESULT',
      results: results
    }));
  } catch(err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'FILL_ERROR',
      message: err.toString()
    }));
  }
})();
true;
`;
}

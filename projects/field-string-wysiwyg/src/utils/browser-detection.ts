/**
 * Browser detection utilities for handling browser-specific issues
 */

/**
 * Detects if the browser is Safari or WebKit-based (including Safari on iOS)
 * TinyMCE on Safari/WebKit has issues with Shadow DOM context and fixed containers
 * See: https://github.com/2sic/2sxc/issues/3753
 */
export function isSafariOrWebKit(): boolean {
  const ua = navigator.userAgent;
  
  // Safari detection: WebKit but NOT Chrome, Edge, Opera, or Brave
  // Chrome/Edge/Opera/Brave all use "Chrome" in their user agent
  const isWebKit = /Safari|WebKit/i.test(ua);
  const isChromeBased = /Chrome|Edg|OPR|Brave/i.test(ua);
  
  return isWebKit && !isChromeBased;
}

/**
 * Detects if the browser is Safari on iOS
 */
export function isSafariIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent);
}

/**
 * Detects if the browser is Safari on macOS
 */
export function isSafariMacOS(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !/^((?!chrome|android).)*chrome/i.test(navigator.userAgent);
}

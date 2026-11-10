/**
 * Utility to inject TinyMCE skin CSS into the document head
 * This is needed for Safari/WebKit when using split UI mode outside of Shadow DOM
 */

/** Cache to prevent injecting the same skin multiple times */
const injectedSkins = new Set<string>();

/**
 * Injects TinyMCE skin CSS into the document head
 * Required for Safari/WebKit workaround when using split UI mode
 * 
 * @param skinName - Name of the TinyMCE skin to inject (e.g., '2sxc-tinymce-skin')
 * @param baseUrl - Base URL for TinyMCE assets
 */
export function injectTinyMceSkinCSS(skinName: string, baseUrl: string): void {
  // Prevent duplicate injections
  if (injectedSkins.has(skinName)) {
    return;
  }

  // Construct the skin CSS URL
  const skinCssUrl = `${baseUrl}/skins/ui/${skinName}/skin.min.css`;

  // Create a link element for the skin CSS
  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = skinCssUrl;
  linkElement.type = 'text/css';
  linkElement.id = `tinymce-skin-${skinName}`;

  // Add to document head
  document.head.appendChild(linkElement);

  // Mark as injected
  injectedSkins.add(skinName);

  console.debug(`TinyMCE skin '${skinName}' CSS injected into document head`);
}

/**
 * Injects TinyMCE content CSS into the document head
 * Needed for proper content styling outside of Shadow DOM
 * 
 * @param contentCssUrl - URL of the content CSS file
 */
export function injectTinyMceContentCSS(contentCssUrl: string): void {
  // Check if already injected
  const existingLink = document.querySelector(`link[href="${contentCssUrl}"]`);
  if (existingLink) {
    return;
  }

  const linkElement = document.createElement('link');
  linkElement.rel = 'stylesheet';
  linkElement.href = contentCssUrl;
  linkElement.type = 'text/css';

  document.head.appendChild(linkElement);

  console.debug(`TinyMCE content CSS injected into document head: ${contentCssUrl}`);
}

/**
 * Injects Safari-specific CSS fixes for TinyMCE
 * On Safari, the floating toolbar needs padding to prevent it from overlaying content
 */
export function injectSafariTinyMceStyles(): void {
  // Check if already injected
  if (document.getElementById('tinymce-safari-fixes')) {
    return;
  }

  // Create a style element with Safari-specific fixes
  const styleElement = document.createElement('style');
  styleElement.id = 'tinymce-safari-fixes';
  styleElement.type = 'text/css';
  styleElement.textContent = `
    /* Safari/WebKit TinyMCE split UI mode fixes */
    .tinymce-container {
      padding-top: 37px !important;
    }
  `;

  document.head.appendChild(styleElement);

  console.debug('Safari TinyMCE CSS fixes injected into document head');
}

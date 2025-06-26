import { EavEntityBundleDto } from "../shared/models/json-format-v1";

/**
 * Replaces the Adam portal URL in all <img> tags within the content fields with the given orgAdamPortalUrl (if it differs).
 * @param data Array of EavEntityBundleDto objects containing HTML content.
 * @param orgAdamPortalUrl The desired Adam portal URL to be used.
 * @returns The modified array with the correct Adam portal URLs.
 */
export function correctAdamFolderBasePath(
    data: EavEntityBundleDto[],
    orgAdamPortalUrl: string
): EavEntityBundleDto[] {
    const imgTagRegex = /<img\b[^>]*?\bdata-cmsid=["'][^"']+["'][^>]*?>/gi;

    data.forEach(entityBundle => {
        const content = entityBundle.Entity.Attributes.String.Content;
        if (typeof content !== 'object') return;

        Object.entries(content).forEach(([lang, htmlValue]) => {
            let html = decodeHtml(htmlValue as string); // Unescape HTML if needed

            // Replace all <img> tags that have a different Adam portal URL
            html = html.replace(imgTagRegex, imgTag => {
                const srcMatch = imgTag.match(/\bsrc=["']([^"']+)["']/);
                if (!srcMatch) return imgTag;

                const imgSrc = srcMatch[1];
                const currentAdamUrl = extractAdamPortalUrl(imgSrc);

                // Only replace if the Adam portal URL actually differs
                if (currentAdamUrl && currentAdamUrl !== orgAdamPortalUrl) {
                    const updatedSrc = imgSrc.replace(currentAdamUrl, orgAdamPortalUrl);
                    return imgTag.replace(imgSrc, updatedSrc);
                }
                return imgTag;
            });

            // Write the potentially modified HTML code back to the object
            (entityBundle.Entity.Attributes.String.Content as Record<string, string>)[lang] = html;
        });
    });

    return data;
}

/**
 * Decodes HTML entities to normal characters.
 * @param html A string that may contain HTML entities.
 * @returns The decoded string.
 */
export function decodeHtml(html: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}

/**
 * Extracts the Adam portal URL prefix up to and including "/adam/" from an image source URL.
 * @param src The full image source (e.g. https://example.org/adam/xyz/abc.jpg)
 * @returns The Adam portal URL prefix or null if not found.
 */
export function extractAdamPortalUrl(src: string): string | null {
    const adamSegment = '/adam/';
    const idx = src.indexOf(adamSegment);
    return idx !== -1
        ? src.substring(0, idx + adamSegment.length)
        : null;
}
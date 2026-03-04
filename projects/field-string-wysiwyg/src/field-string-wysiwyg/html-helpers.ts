export function buildHtmlAndStyles(template: string, styles: string): string {
  return `${template}<style>\n${styles}\n</style>`;
}

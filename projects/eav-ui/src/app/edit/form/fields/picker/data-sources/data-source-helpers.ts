
export class DataSourceHelpers {
  /**
   * remove HTML tags from a string, which possibly was created in a WYSIWYG
   */
  public stripHtml(stringWithHtml: string): string {
    if (!stringWithHtml) return '';
    if (!stringWithHtml.includes('<')) return stringWithHtml;
    const div = document.createElement("div");
    div.innerHTML = stringWithHtml ?? '';
    return div.innerText || '';
  }
}
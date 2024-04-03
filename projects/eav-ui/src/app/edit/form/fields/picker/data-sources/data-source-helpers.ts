
export class DataSourceHelpers {
  /** remove HTML tags that come from WYSIWYG */
  public cleanStringFromWysiwyg(wysiwygString: string): string {
    const div = document.createElement("div");
    div.innerHTML = wysiwygString ?? '';
    return div.innerText || '';
  }
}
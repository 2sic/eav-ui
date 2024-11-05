export class AgGridHelper {
  public static cellLink(link: string, body: string, classes?: string): string {
    return `<a class="default-link fill-cell ${classes}" href="${link}">${body}</a>`;
  }
}
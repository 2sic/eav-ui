/**
 * @internal
 */
export class ParamEncoder {
  /** Encodes characters in URL parameter to not mess up routing. Don't forget to decode it! :) */
  static encode(text: string) {
    return (text ?? '')
      .replace(/\//g, '%2F')
      .replace(/\:/g, '%3A')
      .replace(/\&/g, '%26')
      .replace(/\~/g, '%7E')
      .replace(/\,/g, '%2C');
  }

  static decode(text: string) {
    return (text ?? '')
      .replace(/%2F/g, '/')
      .replace(/%3A/g, ':')
      .replace(/%26/g, '&')
      .replace(/%7E/g, '~')
      .replace(/%2C/g, ',');
  }
}

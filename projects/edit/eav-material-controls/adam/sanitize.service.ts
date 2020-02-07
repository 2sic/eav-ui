import { Injectable } from '@angular/core';

@Injectable()
export class SanitizeService {

  constructor() { }

  private removeFromStart(sanitized: string, charToRemove: string) {
    // check for undefined
    if (!sanitized) { return sanitized; }

    while (sanitized.substring(0, 1) === charToRemove) {
      sanitized = sanitized.substring(1);
    }
    return sanitized;
  }

  private removeFromEnd(sanitized: string, charToRemove: string) {
    // check for undefined
    if (!sanitized) { return sanitized; }

    while (sanitized.substring(sanitized.length - 1, sanitized.length) === charToRemove) {
      sanitized = sanitized.substring(0, sanitized.length - 1);
    }
    return sanitized;
  }

  private cleanBadPath = function (sanitized: string) {
    // check for undefined
    if (!sanitized) { return sanitized; }

    const goodChar = '_';
    const illegalRe = /[\?<>\\:\*\|":]/g;
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    const reservedRe = /^\.+$/;
    const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    const windowsTrailingRe = /[\. ]+$/;
    return sanitized
      .replace(illegalRe, goodChar)
      .replace(controlRe, goodChar)
      .replace(reservedRe, goodChar)
      .replace(windowsReservedRe, goodChar)
      .replace(windowsTrailingRe, goodChar);
  };

  // sanitize path
  public sanitizePath(sanitized: string) {
    // check for undefined
    if (!sanitized) { return sanitized; }

    // remove slashes form start of path
    sanitized = this.removeFromStart(sanitized, '\/');

    // remove slashed form end of path
    sanitized = this.removeFromEnd(sanitized, '\/');

    // remove backslashes form start of path
    sanitized = this.removeFromStart(sanitized, '\\');

    // remove backslashes form end of path
    sanitized = this.removeFromEnd(sanitized, '\\');

    // replace bad
    sanitized = this.cleanBadPath(sanitized);

    return sanitized;
  }

  // sanitize file or folder name
  public sanitizeName(sanitized: string) {
    // check for undefined
    if (!sanitized) { return sanitized; }

    // in addition to all path validation rules
    // slashes are not valid in file or folder name
    const replacement = '_';
    const illegalRe = /\//g;
    return this.sanitizePath(sanitized)
      .replace(illegalRe, replacement);
  }

}

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Pipe({
    name: 'depthPadding',
    standalone: true
})
export class DepthPaddingPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(depth: number, isFolder: boolean): SafeStyle {
    let padding: number;
    if (isFolder) {
      padding = depth * 8;
    } else {
      padding = (depth === 0) ? 8 : (depth * 8 + 16);
    }
    return this.sanitizer.bypassSecurityTrustStyle(`padding-left: ${padding}px;`);
  }
}

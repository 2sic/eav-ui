import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeResourceUrl' })
export class SafeResourceUrlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(resourceUrl: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl);
  }
}

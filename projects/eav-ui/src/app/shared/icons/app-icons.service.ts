import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { iconsFontAwesome } from '.';

@Injectable()
export class AppIconsService {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) { }

  load() {
    // v18.01 - changing to Material Symbols
    // this.matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    Object.entries(iconsFontAwesome).forEach(([name, svg]) => {
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(svg));
    });
  }
}

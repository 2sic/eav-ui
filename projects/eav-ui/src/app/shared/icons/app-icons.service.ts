import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { iconsFontAwesome } from '.';


@Injectable()
export class AppIconsService {
  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) { }

  load() {
    // this.matIconRegistry.setDefaultFontSetClass('material-icons-outlined');
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');

    Object.entries(iconsFontAwesome).forEach(([name, svg]) => {
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(svg));
    });
    // Object.entries(iconsMaterial).forEach(([name, svg]) => {
    //   this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(svg));
    // });

    // 2dm: New api with object syntax
    // Object.entries(iconLib).forEach(([name, svg]) => {
    //   this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(svg));
    // });
  }
}

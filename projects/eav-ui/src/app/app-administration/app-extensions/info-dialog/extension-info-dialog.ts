import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ExtensionConfiguration } from '../extension.model';

@Component({
  selector: 'app-extension-info-dialog',
  templateUrl: './extension-info-dialog.html',
  styleUrls: ['./extension-info-dialog.scss'],
  imports: [
    CommonModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatToolbarModule,
  ]
})
export class ExtensionInfoDialog {
  dialog = inject(MatDialogRef<void>);
  #sanitizer = inject(DomSanitizer);

  data = inject(MAT_DIALOG_DATA) as {
    name: string;
    configuration: ExtensionConfiguration;
  };

  get config(): ExtensionConfiguration {
    return this.data.configuration;
  }

  get configJson(): string {
    return JSON.stringify(this.data.configuration, null, 2);
  }

  getSafeHtml(html: string): SafeHtml {
    return this.#sanitizer.sanitize(1, html) ? this.#sanitizer.bypassSecurityTrustHtml(html) : '';
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.configJson);
  }

  getVersionRequirements() {
    const config = this.config;
    return [
      { platform: 'DNN', version: config.dnnVersionMin, supported: config.dnnSupported },
      { platform: 'Oqtane', version: config.oqtVersionMin, supported: config.oqtSupported },
      { platform: 'EAV/2sxc', version: config.sxcVersionMin, supported: config.sxcSupported },
    ];
  }

  getFeatures() {
    const config = this.config;
    const features = [
      { name: 'Fields', value: config.hasFields },
      { name: 'App Code', value: config.hasAppCode },
      { name: 'Web API', value: config.hasWebApi },
      { name: 'Razor', value: config.hasRazor },
      { name: 'Data Bundles', value: config.hasDataBundles },
      { name: 'Content Types', value: config.hasContentTypes },
      { name: 'Queries', value: config.hasQueries },
      { name: 'Views', value: config.hasViews },
      { name: 'Entities', value: config.hasEntities },
    ];
    return features.sort((a, b) => +b.value - +a.value);
  }

  getReleaseNotes() {
    return this.config.releases || [];
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SnippetsSets } from '../models/snippet.model';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { KeyValuePipe } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../shared/shared-components.module';
import { ClickStopPropagationDirective } from '../../shared/directives/click-stop-propagation.directive';
import { ArrayHelpers } from '../../shared/helpers/array.helpers';

@Component({
    selector: 'app-code-snippets',
    templateUrl: './code-snippets.component.html',
    styleUrls: ['./code-snippets.component.scss'],
    standalone: true,
    imports: [
        SharedComponentsModule,
        MatIconModule,
        MatRippleModule,
        KeyValuePipe,
        TranslateModule,
        ObjectToArrayPipe,
        ClickStopPropagationDirective
    ],
})
export class CodeSnippetsComponent {
  @Input() snippets: SnippetsSets;
  @Output() insertSnippet: EventEmitter<string> = new EventEmitter();
  toggledSections: string[] = [];
  toggledFolders: string[] = [];
  toggledInfos: string[] = [];
  toggledMores: string[] = [];

  constructor() { }

  addSnippet(snippet: string): void {
    this.insertSnippet.emit(snippet);
  }

  toggleSection(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledSections);
  }

  toggleFolder(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledFolders);
  }

  toggleInfo(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledInfos);
  }

  toggleMore(key: string): void {
    ArrayHelpers.toggleInArray(key, this.toggledMores);
  }
}

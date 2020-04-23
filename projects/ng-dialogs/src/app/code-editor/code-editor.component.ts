import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import 'brace';
import 'brace/mode/text';
import 'brace/mode/csharp';
import 'brace/mode/razor';
import 'brace/theme/sqlserver';
import 'brace/ext/language_tools';
import 'brace/snippets/text';
import 'brace/snippets/csharp';
import 'brace/snippets/razor';

import { Context } from '../shared/services/context';
import { keyItems } from '../shared/constants/sessions-keys';
import { SourceService } from './services/source.service';
import { EditItem, SourceItem, EditForm } from '../app-administration/shared/models/edit-form.model';
import { SourceView } from './models/source-view';
import { aceConfig } from './ace-config';
import { ElementEventListener } from '../../../../shared/element-event-listener-model';
import { DialogService } from '../shared/services/dialog.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  view: SourceView;
  templates: string[];
  aceConfig = aceConfig;
  explorer = {
    templates: 'templates',
    snippets: 'snippets'
  };
  activeExplorer: string;

  private viewKey: number | string; // templateId or path
  private eventListeners: ElementEventListener[] = [];
  private savedCode: string;

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private sourceService: SourceService,
    private dialogService: DialogService,
  ) {
    this.context.init(this.route);
    this.calculateViewKey();
    this.attachListeners();
  }

  ngOnInit() {
    this.sourceService.get(this.viewKey).subscribe(view => {
      this.aceConfig.mode = this.sourceService.calculateAceMode(view.Extension);
      this.view = view;
      this.savedCode = view.Code;
    });
    this.sourceService.getTemplates().subscribe(templates => {
      this.templates = templates;
    });
  }

  ngOnDestroy() {
    this.eventListeners.forEach(listener => {
      listener.element.removeEventListener(listener.type, listener.listener);
    });
    this.eventListeners = null;
  }

  toggleExplorer(explorer: string) {
    if (this.activeExplorer === explorer) {
      this.activeExplorer = null;
    } else {
      this.activeExplorer = explorer;
    }
  }

  openTemplate(path: string) {
    const form: EditForm = {
      items: [
        { Path: path }
      ]
    };
    this.dialogService.openCode(form);
  }

  save() {
    this.snackBar.open('Saving...');
    let codeToSave = this.view.Code;
    this.sourceService.save(this.viewKey, this.view).subscribe({
      next: res => {
        if (!res) {
          this.snackBar.open('Failed', null, { duration: 2000 });
          return;
        }
        this.savedCode = codeToSave;
        codeToSave = null;
        this.snackBar.open('Saved', null, { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed', null, { duration: 2000 });
      }
    });
  }

  private calculateViewKey() {
    const itemsRaw = sessionStorage.getItem(keyItems);
    const editItems: EditItem[] | SourceItem[] = JSON.parse(itemsRaw);
    const item = editItems[0];
    this.viewKey = (item as EditItem).EntityId || (item as SourceItem).Path;
  }

  private attachListeners() {
    const closing = this.stopClose.bind(this);
    window.addEventListener('beforeunload', closing);
    this.eventListeners.push({ element: window, type: 'beforeunload', listener: closing });

    const save = this.keyboardSave.bind(this);
    window.addEventListener('keydown', save);
    this.eventListeners.push({ element: window, type: 'keydown', listener: save });
  }

  private stopClose(e: BeforeUnloadEvent) {
    if (this.savedCode === this.view.Code) { return; }
    e.preventDefault(); // Cancel the event
    e.returnValue = ''; // Chrome requires returnValue to be set
  }

  private keyboardSave(e: KeyboardEvent) {
    const CTRL_S = e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey);
    if (!CTRL_S) { return; }
    e.preventDefault();
    this.save();
  }

}

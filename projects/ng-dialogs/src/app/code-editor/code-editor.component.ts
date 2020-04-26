import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Context } from '../shared/services/context';
import { keyItems } from '../shared/constants/sessions-keys';
import { SourceService } from './services/source.service';
import { EditItem, SourceItem, } from '../app-administration/shared/models/edit-form.model';
import { SourceView } from './models/source-view.model';
import { ElementEventListener } from '../../../../shared/element-event-listener-model';
import { SnippetsService } from './services/snippets.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  explorer = {
    templates: 'templates',
    snippets: 'snippets'
  };
  activeExplorer: string;
  view: SourceView;
  templates: string[];
  explorerSnipps: any;
  editorSnipps: any;
  insertSnipp: any;

  private viewKey: number | string; // templateId or path
  private eventListeners: ElementEventListener[] = [];
  private savedCode: string;

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private sourceService: SourceService,
    private snippetsService: SnippetsService,
    private zone: NgZone,
    private titleService: Title,
  ) {
    this.context.init(this.route);
    this.calculateViewKey();
    this.attachListeners();
  }

  ngOnInit() {
    this.sourceService.get(this.viewKey).subscribe(view => {
      this.view = view;
      this.savedCode = this.view.Code;
      this.titleService.setTitle(`Code Editor - ${this.view.FileName}`);

      this.snippetsService.getSnippets(this.view).then((res: any) => {
        this.explorerSnipps = res.sets;
        this.editorSnipps = res.list;
      });
    });
    this.sourceService.getTemplates().subscribe(templates => {
      this.templates = templates;
    });
  }

  ngOnDestroy() {
    this.detachListeners();
  }

  toggleExplorer(explorer: string) {
    if (this.activeExplorer === explorer) {
      this.activeExplorer = null;
    } else {
      this.activeExplorer = explorer;
    }
  }

  changeInsertSnipp(snippet: any) {
    this.insertSnipp = snippet;
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
    this.zone.runOutsideAngular(() => {
      const closing = this.stopClose.bind(this);
      const save = this.keyboardSave.bind(this);
      window.addEventListener('beforeunload', closing);
      window.addEventListener('keydown', save);
      this.eventListeners.push({ element: window, type: 'beforeunload', listener: closing });
      this.eventListeners.push({ element: window, type: 'keydown', listener: save });
    });
  }

  private detachListeners() {
    this.zone.runOutsideAngular(() => {
      this.eventListeners.forEach(listener => {
        listener.element.removeEventListener(listener.type, listener.listener);
      });
      this.eventListeners = null;
    });
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
    this.zone.run(() => { this.save(); });
  }

}

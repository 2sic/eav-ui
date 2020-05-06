import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { share } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

import { Context } from '../shared/services/context';
import { keyItems } from '../shared/constants/session.constants';
import { SourceService } from './services/source.service';
import { EditItem, SourceItem, } from '../app-administration/shared/models/edit-form.model';
import { SourceView } from './models/source-view.model';
import { ElementEventListener } from '../../../../shared/element-event-listener.model';
import { SnippetsService } from './services/snippets.service';
import { SnackbarStackService } from '../shared/services/snackbar-stack.service';
import { DialogService } from '../shared/services/dialog.service';
import { SanitizeService } from '../../../../edit/eav-material-controls/adam/sanitize.service';

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
  activeExplorer = this.explorer.templates;
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
    private snackBarStack: SnackbarStackService,
    private sourceService: SourceService,
    private snippetsService: SnippetsService,
    private zone: NgZone,
    private titleService: Title,
    private dialogService: DialogService,
    private sanitizeService: SanitizeService,
  ) {
    this.context.init(this.route);
    this.calculateViewKey();
    this.attachListeners();
  }

  ngOnInit() {
    // TODO: spm - pls review if my sharing services is ok like this
    // if you don't like it, then best put your code iside my combine-latest
    const getView = this.sourceService.get(this.viewKey).pipe(share());
    const getFiles = this.sourceService.getTemplates().pipe(share());
    // this.sourceService.get(this.viewKey)
    getView.subscribe(view => {
      this.view = view;
      this.savedCode = this.view.Code;
      this.titleService.setTitle(`${this.view.FileName} - Code Editor`);

      this.snippetsService.getSnippets(this.view).then((res: any) => {
        this.explorerSnipps = res.sets;
        this.editorSnipps = res.list;
      });
    });
    // this.sourceService.getTemplates()
    getFiles.subscribe(files => {
      this.templates = files;
    });
    combineLatest([getView, getFiles]).subscribe(([view, files]) => this.showCodeAndEditionWarnings(view, files));
  }

  /**
   * try to show an info about editions if other files with the same name exist
   */
  showCodeAndEditionWarnings(view: SourceView, files: string[]) {
    const pathAndName = view.FileName;
    const pathSeparator = pathAndName.indexOf('/') > -1 ? pathAndName.lastIndexOf('/') + 1 : 0;
    const pathWithSlash = pathSeparator === 0 ? '' : pathAndName.substr(0, pathSeparator);
    const fullName = pathAndName.substr(pathSeparator);
    const name = fullName.substr(0, fullName.length - view.Extension.length);
    const nameCode = name + '.code' + view.Extension;
    // find out if we also have a code file
    const codeFile = files.find(f => f === pathWithSlash + nameCode);
    const otherEditions = files.filter(f => f.endsWith(fullName)).length - 1;

    if (codeFile) {
      this.snackBarStack
        .add(`This template also has a code-behind file '${codeFile}'.`, 'Open')
        .subscribe(x => this.dialogService.openCodeFile(codeFile));
    }
    if (otherEditions) {
      this.snackBarStack
        .add(`There are ${otherEditions} other editions of this. You may be editing an edition which is not the one you see.`, 'Help')
        .subscribe(x => window.open('https://r.2sxc.org/polymorphism', '_blank'));
    }
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

  createTemplate() {
    let name = prompt('File name:', '_MyFile.cshtml');
    if (name === null || name.length === 0) { return; }

    name = this.sanitizeService.sanitizeName(name);
    this.sourceService.createTemplate(name).subscribe(res => {
      this.sourceService.getTemplates().subscribe(files => {
        this.templates = files;
      });
    });
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

import { Component, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, fromEvent, Observable, Subscription } from 'rxjs';
import { map, mergeMap, share } from 'rxjs/operators';
import { SanitizeHelper } from '../../../../edit/shared/helpers';
import { GlobalConfigService } from '../../../../edit/shared/store/ngrx-data';
import { MonacoEditorComponent } from '../monaco-editor';
import { defaultControllerName, defaultTemplateName } from '../shared/constants/file-names.constants';
import { keyItems } from '../shared/constants/session.constants';
import { EditItem, SourceItem, } from '../shared/models/edit-form.model';
import { Context } from '../shared/services/context';
import { DialogService } from '../shared/services/dialog.service';
import { SnackBarStackService } from '../shared/services/snack-bar-stack.service';
import { AceEditorComponent } from './ace-editor/ace-editor.component';
import { CodeEditorTemplateVars, EditorOption, Editors, ExplorerOption, Explorers } from './code-editor.models';
import { Snippet, SnippetsSets } from './models/snippet.model';
import { SourceView } from './models/source-view.model';
import { SnippetsService } from './services/snippets.service';
import { SourceService } from './services/source.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  @ViewChild(AceEditorComponent) private aceEditorRef: AceEditorComponent;
  @ViewChild(MonacoEditorComponent) private monacoEditorRef: MonacoEditorComponent;

  Explorers = Explorers;
  activeExplorer: ExplorerOption = Explorers.Templates;
  Editors = Editors;
  activeEditor: EditorOption = Editors.Ace;
  monacoOptions = {
    theme: '2sxc-dark',
    tabSize: 2,
  };
  templateVars$: Observable<CodeEditorTemplateVars>;

  private view$: BehaviorSubject<SourceView>;
  private templates$: BehaviorSubject<string[]>;
  private explorerSnipps$: BehaviorSubject<SnippetsSets>;
  private editorSnipps$: BehaviorSubject<Snippet[]>;
  private viewKey: number | string; // templateId or path
  private savedCode: string;
  private subscription: Subscription;

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private snackBarStack: SnackBarStackService,
    private sourceService: SourceService,
    private snippetsService: SnippetsService,
    private zone: NgZone,
    private titleService: Title,
    private dialogService: DialogService,
    private globalConfigService: GlobalConfigService,
  ) {
    this.context.init(this.route);
  }

  ngOnInit(): void {
    this.subscription = new Subscription();
    this.view$ = new BehaviorSubject(null);
    this.templates$ = new BehaviorSubject(null);
    this.explorerSnipps$ = new BehaviorSubject(null);
    this.editorSnipps$ = new BehaviorSubject(null);

    this.calculateViewKey();
    this.attachListeners();

    const view$ = this.sourceService.get(this.viewKey).pipe(share());
    const templates$ = this.sourceService.getTemplates();
    const snippets$ = view$.pipe(mergeMap(view => this.snippetsService.getSnippets(view)));
    forkJoin([view$, templates$, snippets$]).subscribe(([view, templates, snippets]) => {
      this.view$.next(view);
      this.templates$.next(templates);
      this.explorerSnipps$.next(snippets.sets);
      this.editorSnipps$.next(snippets.list);

      this.savedCode = this.view$.value.Code;
      this.titleService.setTitle(`${this.view$.value.FileName} - Code Editor`);
      this.showCodeAndEditionWarnings(view, templates);
    });
    const debugEnabled$ = this.globalConfigService.getDebugEnabled$();

    this.templateVars$ = combineLatest([this.view$, this.templates$, this.explorerSnipps$, this.editorSnipps$, debugEnabled$]).pipe(
      map(([view, templates, explorerSnipps, editorSnipps, debugEnabled]) => {
        const templateVars: CodeEditorTemplateVars = {
          debugEnabled,
          view,
          templates,
          explorerSnipps,
          editorSnipps,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy(): void {
    this.view$.complete();
    this.templates$.complete();
    this.explorerSnipps$.complete();
    this.editorSnipps$.complete();
    this.subscription.unsubscribe();
  }

  toggleExplorer(explorer: ExplorerOption): void {
    this.activeExplorer = (this.activeExplorer !== explorer) ? explorer : null;
  }

  toggleEditor(): void {
    switch (this.activeEditor) {
      case Editors.Ace:
        this.activeEditor = Editors.Monaco;
        break;
      case Editors.Monaco:
        this.activeEditor = Editors.Ace;
        break;
      default:
        this.activeEditor = Editors.Ace;
    }
  }

  createTemplate(folder?: string): void {
    let question = 'File name:';
    let suggestion = defaultTemplateName;
    if (folder === 'api' || folder?.startsWith('api/')) {
      question = 'Controller name:';
      suggestion = defaultControllerName;
    }
    let name = prompt(question, suggestion);
    if (name === null || name.length === 0) { return; }

    name = SanitizeHelper.sanitizePath(name);
    if (folder != null) {
      name = `${folder}/${name}`;
    }
    this.sourceService.createTemplate(name).subscribe(res => {
      this.sourceService.getTemplates().subscribe(files => {
        this.templates$.next(files);
      });
    });
  }

  insertSnippet(snippet: string): void {
    if (this.aceEditorRef != null) {
      this.aceEditorRef.insertSnippet(snippet);
    } else if (this.monacoEditorRef != null) {
      this.monacoEditorRef.insertSnippet(snippet);
    }
  }

  codeChanged(code: string): void {
    this.view$.next({ ...this.view$.value, Code: code });
  }

  save(): void {
    this.snackBar.open('Saving...');
    let codeToSave = this.view$.value.Code;
    this.sourceService.save(this.viewKey, this.view$.value).subscribe({
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

  private calculateViewKey(): void {
    // spm TODO: Move items for code-editor to the url?
    const itemsRaw = sessionStorage.getItem(keyItems);
    const editItems: EditItem[] | SourceItem[] = JSON.parse(itemsRaw);
    const item = editItems[0];
    this.viewKey = (item as EditItem).EntityId || (item as SourceItem).Path;
  }

  /** Show info about editions if other files with the same name exist */
  private showCodeAndEditionWarnings(view: SourceView, files: string[]): void {
    const pathAndName = view.FileName;
    const pathSeparator = pathAndName.indexOf('/') > -1 ? pathAndName.lastIndexOf('/') + 1 : 0;
    const pathWithSlash = pathSeparator === 0 ? '' : pathAndName.substring(0, pathSeparator);
    const fullName = pathAndName.substring(pathSeparator);
    const name = fullName.substring(0, fullName.length - view.Extension.length);
    const nameCode = name + '.code' + view.Extension;
    // find out if we also have a code file
    const codeFile = files.find(file => file === pathWithSlash + nameCode);
    const otherEditions = files.filter(file => file.endsWith(fullName)).length - 1;

    if (codeFile) {
      this.snackBarStack
        .add(`This template also has a code-behind file '${codeFile}'.`, 'Open')
        .subscribe(() => {
          this.dialogService.openCodeFile(codeFile);
        });
    }
    if (otherEditions) {
      this.snackBarStack
        .add(`There are ${otherEditions} other editions of this. You may be editing an edition which is not the one you see.`, 'Help')
        .subscribe(() => {
          window.open('http://r.2sxc.org/polymorphism', '_blank');
        });
    }
  }

  private attachListeners(): void {
    this.zone.runOutsideAngular(() => {
      this.subscription.add(
        fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
          if (this.savedCode === this.view$.value.Code) { return; }
          event.preventDefault();
          event.returnValue = ''; // fix for Chrome
        })
      );
      this.subscription.add(
        fromEvent<KeyboardEvent>(window, 'keydown').subscribe(event => {
          const CTRL_S = event.keyCode === 83 && (navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey);
          if (!CTRL_S) { return; }
          event.preventDefault();
          this.zone.run(() => { this.save(); });
        })
      );
    });
  }
}

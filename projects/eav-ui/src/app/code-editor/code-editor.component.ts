import { Component, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import type * as Monaco from 'monaco-editor';
import { BehaviorSubject, combineLatest, forkJoin, fromEvent, map, Observable, of, share, Subscription, switchMap } from 'rxjs';
// tslint:disable-next-line:max-line-length
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult, FileLocationDialogComponent } from '../create-file-dialog';
import { GeneralHelpers } from '../edit/shared/helpers';
import { MonacoEditorComponent } from '../monaco-editor';
import { BaseComponent } from '../shared/components/base.component';
import { keyIsShared, keyItems } from '../shared/constants/session.constants';
import { ViewOrFileIdentifier } from '../shared/models/edit-form.model';
import { Context } from '../shared/services/context';
import { CodeAndEditionWarningsComponent } from './code-and-edition-warnings/code-and-edition-warnings.component';
import { CodeAndEditionWarningsSnackBarData } from './code-and-edition-warnings/code-and-edition-warnings.models';
import { CodeEditorViewModel, ExplorerOption, Explorers, Tab, ViewInfo, ViewKey } from './code-editor.models';
import { CreateTemplateParams } from './code-templates/code-templates.models';
import { FileAsset } from './models/file-asset.model';
import { SourceView } from './models/source-view.model';
import { SnippetsService } from './services/snippets.service';
import { SourceService } from './services/source.service';
import { MatButtonModule } from '@angular/material/button';
import { MonacoEditorComponent as MonacoEditorComponent_1 } from '../monaco-editor/monaco-editor.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
import { CodeTemplatesComponent } from './code-templates/code-templates.component';
import { MatIconModule } from '@angular/material/icon';
import { NgClass, AsyncPipe } from '@angular/common';
import { SharedComponentsModule } from '../shared/shared-components.module';

@Component({
    selector: 'app-code-editor',
    templateUrl: './code-editor.component.html',
    styleUrls: ['./code-editor.component.scss'],
    standalone: true,
    imports: [
        SharedComponentsModule,
        NgClass,
        MatIconModule,
        CodeTemplatesComponent,
        CodeSnippetsComponent,
        MatProgressSpinnerModule,
        MonacoEditorComponent_1,
        MatButtonModule,
        AsyncPipe,
    ],
})
export class CodeEditorComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(MonacoEditorComponent) private monacoEditorRef: MonacoEditorComponent;

  Explorers = Explorers;
  activeExplorer: ExplorerOption = Explorers.Templates;
  monacoOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: '2sxc-dark',
    tabSize: 2,
    fixedOverflowWidgets: true,
  };
  viewModel$: Observable<CodeEditorViewModel>;

  private templates$: BehaviorSubject<FileAsset[]>;
  private activeView$: BehaviorSubject<ViewKey>;
  private openViews$: BehaviorSubject<ViewKey[]>;
  private viewInfos$: BehaviorSubject<ViewInfo[]>;
  private urlItems: ViewOrFileIdentifier[];

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private sourceService: SourceService,
    private snippetsService: SnippetsService,
    private zone: NgZone,
    private titleService: Title,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
    super();
    this.context.init(this.route);
    const codeItems: ViewOrFileIdentifier[] = JSON.parse(sessionStorage.getItem(keyItems));
    const isShared = sessionStorage.getItem(keyIsShared) === 'true' ?? false;
    codeItems.forEach(codeItem => {
      // remove leading "/" from path
      if (codeItem.Path.startsWith('/')) {
        codeItem.Path = codeItem.Path.substring(1);
      }
      codeItem.IsShared ??= isShared;
    });
    this.urlItems = codeItems;
  }

  ngOnInit(): void {
    this.templates$ = new BehaviorSubject<FileAsset[]>([]);
    const initialViews = this.urlItems.map(item => {
      const viewKey: ViewKey = { key: item.EntityId?.toString() ?? item.Path, shared: item.IsShared };
      return viewKey;
    });
    this.activeView$ = new BehaviorSubject<ViewKey>(initialViews[0]);
    this.openViews$ = new BehaviorSubject<ViewKey[]>(initialViews);
    this.viewInfos$ = new BehaviorSubject<ViewInfo[]>([]);

    this.attachListeners();

    this.sourceService.getAll().subscribe(templates => {
      this.templates$.next(templates);
    });

    this.subscription.add(
      combineLatest([this.templates$, this.openViews$]).subscribe(([templates, openViews]) => {
        if (templates.length === 0) { return; }

        let viewInfos = this.viewInfos$.value;
        const notLoaded = openViews.filter(viewKey => !viewInfos.some(v => GeneralHelpers.objectsEqual(v.viewKey, viewKey)));
        if (notLoaded.length === 0) { return; }

        forkJoin(
          notLoaded.map(viewKey => {
            // set viewKey in viewInfos to mark that view is being fetched
            const newViewInfo: ViewInfo = {
              viewKey,
            };
            viewInfos = [...viewInfos, newViewInfo];

            const view$ = this.sourceService.get(viewKey.key, viewKey.shared, this.urlItems).pipe(share());
            const snippets$ = view$.pipe(switchMap(view => this.snippetsService.getSnippets(view)));
            const tooltips$ = view$.pipe(switchMap(view => this.snippetsService.getTooltips(view.Extension.substring(1))));
            return forkJoin([of(viewKey), view$, snippets$, tooltips$]);
          })
        ).subscribe(results => {
          let viewInfos1 = this.viewInfos$.value;

          results.forEach(([viewKey, view, snippets, tooltips]) => {
            const selectedIndex = viewInfos1.findIndex(v => GeneralHelpers.objectsEqual(v.viewKey, viewKey));
            if (selectedIndex < 0) { return; }

            const newViewInfo: ViewInfo = {
              viewKey,
              view,
              explorerSnipps: snippets.sets,
              editorSnipps: snippets.list,
              tooltips,
              savedCode: view.Code,
            };
            viewInfos1 = [...viewInfos1.slice(0, selectedIndex), newViewInfo, ...viewInfos1.slice(selectedIndex + 1)];
            this.showCodeAndEditionWarnings(viewKey, view, templates);
          });

          this.viewInfos$.next(viewInfos1);
        });

        this.viewInfos$.next(viewInfos);
      })
    );

    this.subscription.add(
      combineLatest([this.activeView$, this.viewInfos$]).subscribe(([activeView, viewInfos]) => {
        const active = viewInfos.find(v => GeneralHelpers.objectsEqual(v.viewKey, activeView));
        const defaultTitle = 'Code Editor';
        const newTitle = active == null ? defaultTitle : `${active.view?.FileName} - ${defaultTitle}`;
        const oldTitle = this.titleService.getTitle();
        if (newTitle !== oldTitle) {
          this.titleService.setTitle(newTitle);
        }
      })
    );

    this.viewModel$ = combineLatest([this.templates$, this.activeView$, this.openViews$, this.viewInfos$]).pipe(
      map(([templates, activeView, openViews, viewInfos]) => {
        const tabs = openViews.map(viewKey => {
          const viewInfo = viewInfos.find(v => GeneralHelpers.objectsEqual(v.viewKey, viewKey));
          const label: Tab = {
            viewKey,
            label: viewInfo?.view?.FileName ?? viewKey.key,
            isActive: GeneralHelpers.objectsEqual(viewKey, activeView),
            isModified: viewInfo?.view?.Code !== viewInfo?.savedCode,
            isLoading: viewInfo?.view == null,
          };
          return label;
        });
        const activeViewInfo = viewInfos.find(v => GeneralHelpers.objectsEqual(v.viewKey, activeView));

        const viewModel: CodeEditorViewModel = {
          activeView,
          tabs,
          viewKey: activeViewInfo?.viewKey,
          view: activeViewInfo?.view,
          templates,
          explorerSnipps: activeViewInfo?.explorerSnipps,
          editorSnipps: activeViewInfo?.editorSnipps,
          tooltips: activeViewInfo?.tooltips,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy(): void {
    this.templates$.complete();
    this.activeView$.complete();
    this.openViews$.complete();
    this.viewInfos$.complete();
    super.ngOnDestroy();
  }

  toggleExplorer(explorer: ExplorerOption): void {
    this.activeExplorer = (this.activeExplorer !== explorer) ? explorer : null;
  }

  createTemplate(params: CreateTemplateParams): void {
    // This FileLocationDialogComponent dialog is currently never going to be opened because it has been replaced by mat-menu
    // in the code-templates.component.html template. If you want to use the dialog instead of the menu, you need to remove the
    // mat-menu and replace it with a button that opens the dialog with empty parameters.
    // Dialog has been replaced by menu because from update to Angular 16 CreateFileDialogComponent wasn't opening anymore if 
    // FileLocationDialogComponent dialog was used.
    // if (params.isShared == null) {
    //   const fileLocationDialogRef = this.dialog.open(FileLocationDialogComponent, {
    //     autoFocus: false,
    //     viewContainerRef: this.viewContainerRef,
    //     width: '650px',
    //   });
    //   fileLocationDialogRef.afterClosed().subscribe((isShared?: boolean) => {
    //     if (isShared == null) { return; }
    //     params.isShared = isShared;
    //     this.createTemplate(params);
    //   });
    //   return;
    // }

    const createFileDialogData: CreateFileDialogData = {
      folder: params.folder,
      global: params.isShared,
      purpose: params.folder === 'api' || params.folder?.startsWith('api/') ? 'Api' : undefined,
    };
    const createFileDialogRef = this.dialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data: createFileDialogData,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });

    createFileDialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) { return; }

      this.sourceService.create(result.name, params.isShared, result.templateKey).subscribe(() => {
        this.sourceService.getAll().subscribe(files => {
          this.templates$.next(files);
        });
      });
    });
  }

  insertSnippet(snippet: string): void {
    this.monacoEditorRef?.insertSnippet(snippet);
  }

  codeChanged(code: string, viewKey: ViewKey): void {
    let viewInfos = this.viewInfos$.value;
    const selectedIndex = viewInfos.findIndex(v => GeneralHelpers.objectsEqual(v.viewKey, viewKey));
    const selectedViewInfo = viewInfos[selectedIndex];
    const newViewInfo: ViewInfo = {
      ...selectedViewInfo,
      view: {
        ...selectedViewInfo.view,
        Code: code,
      },
    };
    viewInfos = [...viewInfos.slice(0, selectedIndex), newViewInfo, ...viewInfos.slice(selectedIndex + 1)];
    this.viewInfos$.next(viewInfos);
  }

  openView(viewKey: ViewKey): void {
    // fix viewKey because it can be a templateId or a path, and file might already be open
    viewKey = this.viewInfos$.value.find(
      v => !GeneralHelpers.objectsEqual(v.viewKey, viewKey) && v.view?.FileName === viewKey.key && v.view?.IsShared === viewKey.shared
    )?.viewKey ?? viewKey;

    const oldActiveView = this.activeView$.value;
    if (!GeneralHelpers.objectsEqual(oldActiveView, viewKey)) {
      this.activeView$.next(viewKey);
    }
    const oldOpenViews = this.openViews$.value;
    if (!oldOpenViews.some(v => GeneralHelpers.objectsEqual(v, viewKey))) {
      const newOpenViews = [...oldOpenViews, viewKey];
      this.openViews$.next(newOpenViews);
    }
  }

  closeEditor(viewKey: ViewKey): void {
    const oldOpenViews = this.openViews$.value;
    const newOpenViews = oldOpenViews.filter(key => !GeneralHelpers.objectsEqual(key, viewKey));

    const oldActiveView = this.activeView$.value;
    if (GeneralHelpers.objectsEqual(oldActiveView, viewKey)) {
      const newActiveView = oldOpenViews[oldOpenViews.findIndex(v => GeneralHelpers.objectsEqual(v, oldActiveView)) - 1] ?? newOpenViews[0];
      this.activeView$.next(newActiveView);
    }

    this.openViews$.next(newOpenViews);
  }

  save(viewKey?: ViewKey): void {
    viewKey ??= this.activeView$.value;
    const viewInfo = this.viewInfos$.value.find(v => GeneralHelpers.objectsEqual(v.viewKey, viewKey));
    if (viewInfo?.view == null) { return; }

    this.snackBar.open('Saving...');
    const codeToSave = viewInfo.view.Code;
    this.sourceService.save(viewKey.key, viewKey.shared, viewInfo.view, this.urlItems).subscribe({
      next: res => {
        if (!res) {
          this.snackBar.open('Failed', null, { duration: 2000 });
          return;
        }

        let newViewInfos = [...this.viewInfos$.value];
        const selectedIndex = newViewInfos.findIndex(v => GeneralHelpers.objectsEqual(v.viewKey, viewKey));
        if (selectedIndex < 0) { return; }

        const selectedViewInfo = newViewInfos[selectedIndex];
        const newViewInfo: ViewInfo = {
          ...selectedViewInfo,
          savedCode: codeToSave,
        };
        newViewInfos = [...newViewInfos.slice(0, selectedIndex), newViewInfo, ...newViewInfos.slice(selectedIndex + 1)];
        this.viewInfos$.next(newViewInfos);
        this.snackBar.open('Saved', null, { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed', null, { duration: 2000 });
      }
    });
  }

  /** Show info about editions if other files with the same name exist */
  private showCodeAndEditionWarnings(viewKey: ViewKey, view: SourceView, files: FileAsset[]): void {
    const pathAndName = view.FileName;
    const pathSeparator = pathAndName.indexOf('/') > -1 ? pathAndName.lastIndexOf('/') + 1 : 0;
    const pathWithSlash = pathSeparator === 0 ? '' : pathAndName.substring(0, pathSeparator);
    const fullName = pathAndName.substring(pathSeparator);
    const name = fullName.substring(0, fullName.length - view.Extension.length);
    const nameCode = name + '.code' + view.Extension;
    // find out if we also have a code file
    const codeFile = files.find(file => file.Path === pathWithSlash + nameCode && file.Shared === view.IsShared);
    const otherEditions = files.filter(file => file.Path.endsWith(fullName) && file.Shared === view.IsShared).length - 1;

    if (codeFile || otherEditions) {
      const snackBarData: CodeAndEditionWarningsSnackBarData = {
        fileName: fullName,
        codeFile: codeFile?.Path,
        edition: this.urlItems
          .find(i => i.EntityId?.toString() === viewKey.key && i.IsShared === view.IsShared && i.Path === view.FileName)?.Edition,
        otherEditions,
        openCodeBehind: false,
      };
      const snackBarRef = this.snackBar.openFromComponent(CodeAndEditionWarningsComponent, {
        data: snackBarData,
        duration: 10000,
      });

      snackBarRef.onAction().subscribe(() => {
        if ((snackBarRef.containerInstance.snackBarConfig.data as CodeAndEditionWarningsSnackBarData).openCodeBehind) {
          const openViewKey: ViewKey = { key: codeFile?.Path, shared: codeFile?.Shared };
          this.openView(openViewKey);
        }
      });
    }
  }

  private attachListeners(): void {
    this.zone.runOutsideAngular(() => {
      this.subscription.add(
        fromEvent<BeforeUnloadEvent>(window, 'beforeunload').subscribe(event => {
          const allSaved = !this.viewInfos$.value.some(v => v.view != null && v.view.Code !== v.savedCode);
          if (allSaved) { return; }
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

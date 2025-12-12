import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, NgZone, OnDestroy, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import type * as Monaco from 'monaco-editor';
import { forkJoin, fromEvent, of, share, switchMap } from 'rxjs';
import { Of, transient } from '../../../../core';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../create-file-dialog';
import { isCtrlS } from '../edit/dialog/main/keyboard-shortcuts';
import { MonacoEditorComponent } from '../monaco-editor';
import { MonacoEditorComponent as MonacoEditorComponent_1 } from '../monaco-editor/monaco-editor.component';
import { BaseComponent } from '../shared/components/base';
import { keyIsShared, keyItems } from '../shared/constants/session.constants';
import { ClickStopPropagationDirective } from '../shared/directives/click-stop-propagation.directive';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { ToggleDebugDirective } from '../shared/directives/toggle-debug.directive';
import { ViewOrFileIdentifier } from '../shared/models/edit-form.model';
import { RxHelpers } from '../shared/rxJs/rx.helpers';
import { Context } from '../shared/services/context';
import { CodeAndEditionWarningsComponent } from './code-and-edition-warnings/code-and-edition-warnings.component';
import { CodeAndEditionWarningsSnackBarData } from './code-and-edition-warnings/code-and-edition-warnings.models';
import { translateLoaderFactoryCode } from './code-editor-translate-loader-factory';
import { CodeEditorHelper } from './code-editor.helper';
import { Explorers, Tab, ViewInfo, ViewKey } from './code-editor.models';
import { CodeSnippetsComponent } from './code-snippets/code-snippets.component';
import { CodeTemplatesComponent } from './code-templates/code-templates.component';
import { CreateTemplateParams } from './code-templates/code-templates.models';
import { FileAsset } from './models/file-asset.model';
import { SourceView } from './models/source-view.model';
import { SnippetsService } from './services/snippets.service';
import { SourceService } from './services/source.service';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss'],
  imports: [
    NgClass,
    MatIconModule,
    CodeTemplatesComponent,
    CodeSnippetsComponent,
    MatProgressSpinnerModule,
    MonacoEditorComponent_1,
    MatButtonModule,
    ClickStopPropagationDirective,
    TippyDirective,
    ToggleDebugDirective,
    TranslateModule,
  ],
  providers: [
    {
      provide: TranslateLoader,
      useFactory: translateLoaderFactoryCode,
      deps: [HttpClient],
    },
    TranslateService,
  ]
})
export class CodeEditorComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(MonacoEditorComponent) private monacoEditorRef: MonacoEditorComponent;

  Explorers = Explorers;
  activeExplorer: Of<typeof Explorers> = Explorers.Templates;
  monacoOptions: Monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: '2sxc-dark',
    tabSize: 2,
    fixedOverflowWidgets: true,
  };

  #sourceSvc = transient(SourceService);
  #snippetSvc = transient(SnippetsService);
  #titleSvc = transient(Title);

  templates = signal<FileAsset[]>([]);
  activeView = signal<ViewKey>(undefined);
  #openViews = signal<ViewKey[]>([]);
  #viewInfos = signal<ViewInfo[]>([]);

  // Computed signal that finds the active view information from the list of viewInfos.
  // It checks if the activeView signal matches any viewKey in the viewInfos list using objectsEqual.
  active = computed(() => {
    const activeView = this.activeView();
    return this.#viewInfos().find(v => RxHelpers.objectsEqual(v.viewKey, activeView));
  })

  // Each tab object includes the viewKey, label (file name or key), active state,
  // modified state (if the view's code differs from the saved code), and loading state.
  // It checks for matching view information in viewInfos using objectsEqual.
  tabs = computed(() => {
    const openViews = this.#openViews();
    const activeView = this.activeView();
    const viewInfos = this.#viewInfos();
    return openViews.map(viewKey => {
      const viewInfo = viewInfos.find(v => RxHelpers.objectsEqual(v.viewKey, viewKey));
      return {
        viewKey,
        label: viewInfo?.view?.FileName ?? viewKey.key,
        isActive: RxHelpers.objectsEqual(viewKey, activeView),
        isModified: viewInfo?.view?.Code !== viewInfo?.savedCode,
        isLoading: viewInfo?.view == null,
      } satisfies Tab;
    })
  });

  #urlItems: ViewOrFileIdentifier[];

  /**
 * Computed property for the current document title
 */
  #documentTitle = computed(() => {
    const activeViewKey = this.activeView();
    const viewInfos = this.#viewInfos() || [];
    const activeViewInfo = viewInfos.find(v => RxHelpers.objectsEqual(v.viewKey, activeViewKey));

    return activeViewInfo?.view?.FileName
      ? `${activeViewInfo.view.FileName} - Code Editor`
      : 'Code Editor';
  });

  /**
   * Computed property that identifies views that need to be loaded.
   * Returns an array of ViewKey objects that exist in openViews but are not yet loaded in viewInfos.
   */
  #notLoadedViews = computed(() => {
    const openViews = this.#openViews();
    const viewInfos = this.#viewInfos();

    // Filter open views to find those not yet loaded in viewInfos
    return openViews.filter(viewKey =>
      !viewInfos.some(v => RxHelpers.objectsEqual(v.viewKey, viewKey))
    );
  });

  /**
   * Creates a set of observables for loading a view and its related data.
   * @returns A forkJoin observable that emits the viewKey, view, snippets, and tooltips when all are loaded
   */
  #createViewObservables(viewKey: ViewKey) {
    // Get the view content and share the observable
    const view$ = this.#sourceSvc.get(viewKey.key, viewKey.shared, this.#urlItems).pipe(share());
    // Create dependent observables for snippets and tooltips
    const snippets$ = view$.pipe(switchMap(view => this.#snippetSvc.getSnippets(view)));
    const tooltips$ = view$.pipe(switchMap(view =>
      this.#snippetSvc.getTooltips(view.Extension.substring(1))
    ));

    // Combine all observables to emit results together
    return forkJoin([of(viewKey), view$, snippets$, tooltips$]);
  }

  constructor(
    private context: Context,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
    super();
    this.context.init(this.route);
    const codeItems: ViewOrFileIdentifier[] = JSON.parse(sessionStorage.getItem(keyItems));
    const isShared = (sessionStorage.getItem(keyIsShared) ?? 'false') === 'true';
    codeItems.forEach(codeItem => {
      // remove leading "/" from path
      if (codeItem.Path.startsWith('/')) {
        codeItem.Path = codeItem.Path.substring(1);
      }
      codeItem.IsShared ??= isShared;
    });
    this.#urlItems = codeItems;

    /**
 * Main effect responsible for loading views that are open but not yet loaded.
 */
    effect(() => {
      const templates = this.templates();
      if (templates.length === 0) return; // Exit early if no templates are available
      const notLoaded = this.#notLoadedViews();
      if (notLoaded.length === 0) return; // Exit early if all views are already loaded

      // Mark all not-yet-loaded views as "loading" in viewInfos
      let viewInfos = this.#viewInfos();
      notLoaded.forEach(viewKey => {
        viewInfos = CodeEditorHelper.updateSingleViewInfo(viewInfos, viewKey);
      });
      this.#viewInfos.set(viewInfos);

      // Start data requests for all not-yet-loaded views in parallel
      forkJoin(
        notLoaded.map(viewKey => this.#createViewObservables(viewKey))
      ).subscribe(results => {
        let updatedViewInfos = this.#viewInfos();

        // Process each result and update the viewInfos incrementally
        results.forEach(([viewKey, view, snippets, tooltips]) => {
          updatedViewInfos = CodeEditorHelper.processLoadedView(
            updatedViewInfos, viewKey, view, snippets, tooltips, this.#showCodeAndEditionWarnings.bind(this), templates
          );
        });

        this.#viewInfos.set(updatedViewInfos); // Update the viewInfos signal with all processed results
      });

      this.#viewInfos.set(viewInfos);  // Set the initial viewInfos with loading indicators before actual data is loaded
    }); 


    /**
    * Effect that updates the document title when it changes
    */
    effect(() => {
      const newTitle = this.#documentTitle();
      if (this.#titleSvc.getTitle() !== newTitle) {
        this.#titleSvc.setTitle(newTitle);
      }
    });
  }

  ngOnInit(): void {
    const initialViews = this.#urlItems.map(item => {
      const viewKey: ViewKey = { key: item.EntityId?.toString() ?? item.Path, shared: item.IsShared };
      return viewKey;
    });

    this.activeView.set(initialViews[0]);
    this.#openViews.set(initialViews);

    this.#attachListeners();

    // Load templates
    this.#sourceSvc.getAllPromise().then(templates => {
      this.templates.set(templates);
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  toggleExplorer(explorer: Of<typeof Explorers>): void {
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
    //     if (isShared == null) return;
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
    const createFileDialogRef = this.matDialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data: createFileDialogData,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });

    createFileDialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) return;

      this.#sourceSvc.create(result.name, params.isShared, result.templateKey).subscribe(() => {
        this.#sourceSvc.getAllPromise().then(files => {
          this.templates.set(files);
        });
      });
    });
  }

  insertSnippet(snippet: string): void {
    this.monacoEditorRef?.insertSnippet(snippet);
  }

  codeChanged(code: string, viewKey: ViewKey): void {
    let viewInfos = this.#viewInfos();
    const selectedIndex = viewInfos.findIndex(v => RxHelpers.objectsEqual(v.viewKey, viewKey));
    const selectedViewInfo = viewInfos[selectedIndex];
    const newViewInfo: ViewInfo = {
      ...selectedViewInfo,
      view: {
        ...selectedViewInfo.view,
        Code: code,
      },
    };
    viewInfos = [...viewInfos.slice(0, selectedIndex), newViewInfo, ...viewInfos.slice(selectedIndex + 1)];
    this.#viewInfos.set(viewInfos);
  }

  openView(viewKey: ViewKey): void {
    // fix viewKey because it can be a templateId or a path, and file might already be open
    viewKey = this.#viewInfos().find(
      v => !RxHelpers.objectsEqual(v.viewKey, viewKey) && v.view?.FileName === viewKey.key && v.view?.IsShared === viewKey.shared
    )?.viewKey ?? viewKey;

    const oldActiveView = this.activeView();
    if (!RxHelpers.objectsEqual(oldActiveView, viewKey)) {
      this.activeView.set(viewKey);
    }
    const oldOpenViews = this.#openViews();
    if (!oldOpenViews.some(v => RxHelpers.objectsEqual(v, viewKey))) {
      const newOpenViews = [...oldOpenViews, viewKey];
      this.#openViews.set(newOpenViews);
    }
  }

  closeEditor(viewKey: ViewKey): void {
    const oldOpenViews = this.#openViews();
    const newOpenViews = oldOpenViews.filter(key => !RxHelpers.objectsEqual(key, viewKey));

    const oldActiveView = this.activeView();
    if (RxHelpers.objectsEqual(oldActiveView, viewKey)) {
      const newActiveView = oldOpenViews[oldOpenViews.findIndex(v => RxHelpers.objectsEqual(v, oldActiveView)) - 1] ?? newOpenViews[0];
      this.activeView.set(newActiveView);
    }
    this.#openViews.set(newOpenViews);
  }

  save(viewKey?: ViewKey): void {
    viewKey ??= this.activeView();
    const viewInfo = this.#viewInfos().find(v => RxHelpers.objectsEqual(v.viewKey, viewKey));
    if (viewInfo?.view == null) return;

    this.snackBar.open('Saving...');
    const codeToSave = viewInfo.view.Code;
    this.#sourceSvc.save(viewKey.key, viewKey.shared, viewInfo.view, this.#urlItems).subscribe({
      next: res => {
        if (!res) {
          this.snackBar.open('Failed', null, { duration: 2000 });
          return;
        }

        let newViewInfos = [...this.#viewInfos()];
        const selectedIndex = newViewInfos.findIndex(v => RxHelpers.objectsEqual(v.viewKey, viewKey));
        if (selectedIndex < 0) return;

        const selectedViewInfo = newViewInfos[selectedIndex];
        const newViewInfo: ViewInfo = {
          ...selectedViewInfo,
          savedCode: codeToSave,
        };
        newViewInfos = [...newViewInfos.slice(0, selectedIndex), newViewInfo, ...newViewInfos.slice(selectedIndex + 1)];
        this.#viewInfos.set(newViewInfos);
        this.snackBar.open('Saved', null, { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed', null, { duration: 2000 }),
    });
  }

  /** Show info about editions if other files with the same name exist */
  #showCodeAndEditionWarnings(viewKey: ViewKey, view: SourceView, files: FileAsset[]): void {
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
        edition: this.#urlItems
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

  #attachListeners(): void {
    this.zone.runOutsideAngular(() => {
      this.subscriptions.add(
        fromEvent<BeforeUnloadEvent>(window, 'beforeunload')
          .subscribe(event => {
            const allSaved = !this.#viewInfos().some(v => v.view != null && v.view.Code !== v.savedCode);
            if (allSaved) return;
            event.preventDefault();
            event.returnValue = ''; // fix for Chrome
          })
      );
      this.subscriptions.add(
        fromEvent<KeyboardEvent>(window, 'keydown')
          .subscribe(event => {
            if (!isCtrlS(event)) return;
            event.preventDefault();
            this.zone.run(() => this.save());
          })
      );
    });
  }
}

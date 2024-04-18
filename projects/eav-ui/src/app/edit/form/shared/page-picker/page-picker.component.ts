import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { FieldValue, PagePickerResult } from '../../../../../../../edit-types';
import { GeneralHelpers } from '../../../shared/helpers';
import { QueryService } from '../../../shared/services';
import { buildPageSearch, buildPageTree } from './page-picker.helpers';
import { PageEntity, PagePickerDialogData, PagePickerViewModel, PageSearchItem, PageTreeItem } from './page-picker.models';
import { SharedComponentsModule } from '../../../../shared/shared-components.module';
import { MatIconModule } from '@angular/material/icon';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgTemplateOutlet, NgClass, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-page-picker',
    templateUrl: './page-picker.component.html',
    styleUrls: ['./page-picker.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        NgTemplateOutlet,
        NgClass,
        ExtendedModule,
        MatIconModule,
        SharedComponentsModule,
        MatDialogActions,
        AsyncPipe,
        TranslateModule,
    ],
})
export class PagePickerComponent implements OnInit, OnDestroy {
  selected: number;
  toggled: number[];
  viewModel$: Observable<PagePickerViewModel>;

  private filterText$: BehaviorSubject<string>;
  private searchItems$: BehaviorSubject<PageSearchItem[]>;
  private tree$: BehaviorSubject<PageTreeItem[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: PagePickerDialogData,
    private dialogRef: MatDialogRef<PagePickerComponent>,
    private queryService: QueryService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.selected = this.parseSelectedPageId();
    this.toggled = [];
    this.filterText$ = new BehaviorSubject('');
    this.searchItems$ = new BehaviorSubject([]);
    this.tree$ = new BehaviorSubject([]);

    const filteredSearch$ = combineLatest([this.filterText$, this.searchItems$]).pipe(
      map(([filterText, searchItems]) =>
        searchItems.filter(item => item.name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()))
      ),
    );
    this.viewModel$ = combineLatest([this.filterText$, filteredSearch$, this.tree$]).pipe(
      map(([filterText, filteredSearch, tree]) => {
        const viewModel: PagePickerViewModel = {
          filterText,
          filteredSearch,
          tree,
        };
        return viewModel;
      }),
    );

    this.fetchPages();
  }

  ngOnDestroy(): void {
    this.filterText$.complete();
    this.searchItems$.complete();
    this.tree$.complete();
  }

  setFilter(filterText: string): void {
    this.filterText$.next(filterText);
  }

  select(page: PageTreeItem | PageSearchItem): void {
    // filters out pages without parent (broken)
    if (page.id == null) { return; }
    if (!page.isClickable || !page.isVisible) {
      const ok = window.confirm(this.translate.instant('Fields.Hyperlink.PagePicker.HiddenOrSystemPageWarning'));
      if (!ok) { return; }
    }
    this.closeDialog(page.id);
  }

  toggle(pageId: number): void {
    GeneralHelpers.toggleInArray(pageId, this.toggled);
  }

  private closeDialog(pageId?: number): void {
    if (pageId == null) {
      this.dialogRef.close();
      return;
    }

    const page = this.searchItems$.value.find(i => i.id === pageId);
    const result: PagePickerResult = {
      id: page.id.toString(),
      name: page.name,
    };
    this.dialogRef.close(result);
  }

  private fetchPages(): void {
    const stream = 'Default';
    const params = 'includehidden=true';
    this.queryService.getAvailableEntities(`System.Pages/Default`, true, params, null).subscribe({
      next: (data) => {
        if (!data) {
          console.error(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[stream]) {
          console.error(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + stream);
          return;
        }
        const pages = data[stream] as PageEntity[];
        const searchItems = buildPageSearch(pages);
        this.searchItems$.next(searchItems);
        const tree = buildPageTree(pages);
        this.tree$.next(tree);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    });
  }

  private parseSelectedPageId(): number {
    const prefix = 'page:';
    let fieldValue: FieldValue = this.dialogData.group.controls[this.dialogData.config.fieldName].value;
    if (typeof fieldValue !== 'string') { return; }

    fieldValue = fieldValue.trim().toLocaleLowerCase();
    if (!fieldValue.startsWith(prefix)) { return; }

    try {
      const id = parseInt(fieldValue.split(prefix)[1], 10);
      return id;
    } catch {
      return;
    }
  }
}

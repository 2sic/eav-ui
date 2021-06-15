import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldValue, PagePickerResult } from '../../../../edit-types';
import { GeneralHelpers } from '../../../shared/helpers';
import { QueryService } from '../../../shared/services';
import { buildPageSearch, buildPageTree } from './page-picker.helpers';
import { PageEntity, PagePickerDialogData, PagePickerTemplateVars, PageSearchItem, PageTreeItem } from './page-picker.models';

@Component({
  selector: 'app-page-picker',
  templateUrl: './page-picker.component.html',
  styleUrls: ['./page-picker.component.scss'],
})
export class PagePickerComponent implements OnInit, OnDestroy {
  selected: number;
  toggled: number[];
  templateVars$: Observable<PagePickerTemplateVars>;

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
    this.templateVars$ = combineLatest([this.filterText$, filteredSearch$, this.tree$]).pipe(
      map(([filterText, filteredSearch, tree]) => {
        const templateVars: PagePickerTemplateVars = {
          filterText,
          filteredSearch,
          tree,
        };
        return templateVars;
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

  select(pageId: number): void {
    // filters out pages without parent (broken)
    if (pageId == null) { return; }
    this.closeDialog(pageId);
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
    const query = 'Eav.Queries.Global.Pages';
    const stream = 'Default';
    this.queryService.getAvailableEntities(`${query}/${stream}`, true, null, null).subscribe({
      next: (data) => {
        if (!data) {
          console.error(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[stream]) {
          console.error(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + stream);
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

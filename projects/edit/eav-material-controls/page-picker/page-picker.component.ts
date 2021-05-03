import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PagePickerResult } from '../../../edit-types';
import { GeneralHelpers } from '../../shared/helpers';
import { QueryService } from '../../shared/services';
import { buildPageSearch, buildPageTree } from './page-picker.helpers';
import { PagePickerTemplateVars, PageSearchItem, PageTreeItem } from './page-picker.models';

@Component({
  selector: 'app-page-picker',
  templateUrl: './page-picker.component.html',
  styleUrls: ['./page-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagePickerComponent implements OnInit, OnDestroy {
  templateVars$: Observable<PagePickerTemplateVars>;
  toggled: number[];

  private filterText$: BehaviorSubject<string>;
  private searchItems$: BehaviorSubject<PageSearchItem[]>;
  private tree$: BehaviorSubject<PageTreeItem[]>;

  constructor(
    private dialogRef: MatDialogRef<PagePickerComponent>,
    private queryService: QueryService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
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
    this.queryService.getAvailableEntities('Eav.Queries.Global.Pages/Default', true, null, null).subscribe({
      next: (data) => {
        if (!data) {
          console.error(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data.Default) {
          console.error(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + 'Default');
          return;
        }
        const pages = data.Default;
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
}

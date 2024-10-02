import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, Inject, OnInit, signal } from '@angular/core';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FieldValue, PagePickerResult } from '../../../../../../edit-types';
import { transient } from '../../../core';
import { TippyDirective } from '../../../shared/directives/tippy.directive';
import { ArrayHelpers } from '../../../shared/helpers/array.helpers';
import { QueryService } from '../../../shared/services/query.service';
import { buildPageSearch, buildPageTree } from './page-picker.helpers';
import { PageEntity, PagePickerDialogData, PageSearchItem, PageTreeItem } from './page-picker.models';

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
    MatDialogActions,
    TranslateModule,
    TippyDirective,
  ],
})
export class PagePickerComponent implements OnInit {
  selected: number;
  toggled: number[];

  filterText = signal<string>('');
  searchItems = signal<PageSearchItem[]>([]);
  tree = signal<PageTreeItem[]>([]);

  filteredSearch = computed(() => {
    const filterText = this.filterText();
    const searchItems = this.searchItems();
    return searchItems.filter(item => item.name.toLocaleLowerCase().includes(filterText.toLocaleLowerCase()));
  });

  private queryService = transient(QueryService);

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: PagePickerDialogData,
    private dialog: MatDialogRef<PagePickerComponent>,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.selected = this.parseSelectedPageId();
    this.toggled = [];

    this.fetchPages();
  }

  setFilter(filterText: string): void {
    this.filterText.set(filterText);
  }

  select(page: PageTreeItem | PageSearchItem): void {
    // filters out pages without parent (broken)
    if (page.id == null) return;
    if (!page.isClickable || !page.isVisible) {
      const ok = window.confirm(this.translate.instant('Fields.Hyperlink.PagePicker.HiddenOrSystemPageWarning'));
      if (!ok) return;
    }
    this.closeDialog(page.id);
  }

  toggle(pageId: number): void {
    ArrayHelpers.toggleInArray(pageId, this.toggled);
  }

  private closeDialog(pageId?: number): void {
    if (pageId == null) {
      this.dialog.close();
      return;
    }

    const page = this.searchItems().find(i => i.id === pageId);
    const result: PagePickerResult = {
      id: page.id.toString(),
      name: page.name,
    };
    this.dialog.close(result);
  }

  private fetchPages(): void {
    const stream = 'Default';
    const params = 'includehidden=true';
    this.queryService.getFromQuery(`System.Pages/Default`, params, null).subscribe({
      next: (data) => {
        if (!data) {
          console.error(this.translate.instant('Fields.Picker.QueryErrorNoData'));
          return;
        }
        if (!data[stream]) {
          console.error(this.translate.instant('Fields.Picker.QueryStreamNotFound') + ' ' + stream);
          return;
        }
        const pages = data[stream] as PageEntity[];
        const searchItems = buildPageSearch(pages);
        this.searchItems.set(searchItems);
        const tree = buildPageTree(pages);
        this.tree.set(tree);
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.Picker.QueryError')} - ${error.data}`);
      }
    });
  }

  private parseSelectedPageId(): number {
    const prefix = 'page:';
    let fieldValue: FieldValue = this.dialogData.group.controls[this.dialogData.config.fieldName].value;
    if (typeof fieldValue !== 'string') return;

    fieldValue = fieldValue.trim().toLocaleLowerCase();
    if (!fieldValue.startsWith(prefix)) return;

    try {
      const id = parseInt(fieldValue.split(prefix)[1], 10);
      return id;
    } catch {
      return;
    }
  }
}

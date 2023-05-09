import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, tap } from 'rxjs';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { ContentGroupService } from './services/content-group.service';
import { AppDialogConfigService } from '../app-administration/services';
import { TranslateService } from '@ngx-translate/core';
import { BaseComponent } from '../shared/components/base-component/base.component';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss'],
})
export class ManageContentListComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  private items$ = new BehaviorSubject<GroupHeader[]>(null);
  private header$ = new BehaviorSubject<GroupHeader>(null);
  templateVars$ = combineLatest([this.items$, this.header$]).pipe(
    map(([items, header]) => ({ items, header })),
  );

  private contentGroup: ContentGroup = {
    id: null,
    guid: this.route.snapshot.paramMap.get('guid'),
    part: this.route.snapshot.paramMap.get('part'),
    index: parseInt(this.route.snapshot.paramMap.get('index'), 10),
  };
  reordered = false;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private dialogRef: MatDialogRef<ManageContentListComponent>,
    private contentGroupService: ContentGroupService,

    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private appDialogConfigService: AppDialogConfigService,
  ) {
    super(router, route);
   }

  ngOnInit() {
    this.fetchList();
    this.fetchHeader();
    this.fetchDialogSettings();
    this.subscription.add(this.refreshOnChildClosedShallow().subscribe(() => { 
      this.fetchList(true);
      this.fetchHeader();
    }));
  }

  ngOnDestroy() {
    this.items$.complete();
    this.header$.complete();
    super.ngOnDestroy();
  }

  private fetchDialogSettings() {
    this.appDialogConfigService.getShared$() /*.getDialogSettings() */ .pipe(
      tap(
        dialogSettings => {
          this.translate.setDefaultLang(dialogSettings.Context.Language.Primary.split('-')[0]);
          this.translate.use(dialogSettings.Context.Language.Current.split('-')[0]);
        })
    ).subscribe();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveList() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveList(this.contentGroup, this.items$.value).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchList();
      this.fetchHeader();
    });
  }

  saveAndCloseList() {
    this.snackBar.open('Saving...');
    this.contentGroupService.saveList(this.contentGroup, this.items$.value).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  editHeader() {
    const form: EditForm = {
      items: [
        {
          Add: this.header$.value.Id === 0,
          Index: 0,
          Parent: this.contentGroup.guid,
          Field: 'listcontent',
        },
        {
          Add: this.header$.value.Id === 0,
          Index: 0,
          Parent: this.contentGroup.guid,
          Field: 'listpresentation',
        },
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  editItem(id: number) {
    const form: EditForm = {
      items: [{ EntityId: id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  addFromExisting(index: number) {
    const queryParams = { add: true };
    this.router.navigate([`${this.contentGroup.guid}/${this.contentGroup.part}/${index + 1}/replace`], { relativeTo: this.route, queryParams });
  }

  addBelow(index: number) {
    const form: EditForm = {
      items: [{ Add: true, Index: index + 1, Parent: this.contentGroup.guid, Field: this.contentGroup.part }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  remove(item: GroupHeader) {
    if (!confirm(this.translate.instant('ManageContentList.ConfirmRemove'))) { return; }
    this.snackBar.open('Removing...');
    this.contentGroupService.removeItem(this.contentGroup, item.Index).subscribe(() => { 
      this.snackBar.open('Removed', null, { duration: 2000 });
      this.fetchList();
    });
  }

  drop(event: CdkDragDrop<GroupHeader[]>) {
    const items = [...this.items$.value];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.items$.next(items);
    this.reordered = true;
  }

  trackByFn(index: number, item: GroupHeader) {
    // we use both Index and Id because all demo items have Id=0
    return `${item.Index}+${item.Id}`;
  }

  private fetchList(keepOrder = false) {
    this.contentGroupService.getList(this.contentGroup).subscribe(items => {
      if (this.reordered) {
        const oldIds = this.items$.value.map(item => item.Id);
        const idsChanged = this.items$.value.length !== items.length || items.some(item => !oldIds.includes(item.Id));
        // for usecase where list is fetched on child closed and wasn't changed in the meantime keeps the order before child was opened
        if (!idsChanged && keepOrder) {
          const sortOrder = this.items$.value.map(item => item.Index);
          items.sort((a, b) => {
            const aIndex = sortOrder.indexOf(a.Index);
            const bIndex = sortOrder.indexOf(b.Index);
            if (aIndex === -1 || bIndex === -1) { return 0; }
            return aIndex - bIndex;
          });
        } else if (keepOrder) {
          this.snackBar.open('List was changed from somewhere else. Order of items is reset', null, { duration: 5000 });
        }
      }
      this.items$.next(items);
      this.reordered = false;
    });
  }

  private fetchHeader() {
    this.contentGroupService.getHeader(this.contentGroup).subscribe(header => {
      this.header$.next(header);
    });
  }
}

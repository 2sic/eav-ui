import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { ContentGroupService } from './services/content-group.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { MousedownStopPropagationDirective } from '../shared/directives/mousedown-stop-propagation.directive';
import { transient } from '../core';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.component.html',
  styleUrls: ['./manage-content-list.component.scss'],
  standalone: true,
  imports: [
    RouterOutlet,
    CdkScrollable,
    MatButtonModule,
    MatIconModule,
    CdkDropList,
    CdkDrag,
    MatDialogActions,
    AsyncPipe,
    TranslateModule,
    MatDialogModule,
    TippyDirective,
    MousedownStopPropagationDirective,
  ],
})
export class ManageContentListComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  #dialogRoutes = transient(DialogRoutingService);

  #items$ = new BehaviorSubject<GroupHeader[]>(null);
  #header$ = new BehaviorSubject<GroupHeader>(null);
  // TODO: @2dg - this should be easy to get rid of #remove-observables
  viewModel$ = combineLatest([this.#items$, this.#header$]).pipe(
    map(([items, header]) => ({ items, header })),
  );

  #contentGroup: ContentGroup = {
    id: null,
    guid: this.#dialogRoutes.snapshot.paramMap.get('guid'),
    part: this.#dialogRoutes.snapshot.paramMap.get('part'),
    index: parseInt(this.#dialogRoutes.snapshot.paramMap.get('index'), 10),
  };
  reordered = false;

  #contentGroupSvc = transient(ContentGroupService);
  #dialogConfigSvc = transient(AppDialogConfigService);

  constructor(
    private dialogRef: MatDialogRef<ManageContentListComponent>,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.fetchList();
    this.fetchHeader();
    this.fetchDialogSettings();
    this.#dialogRoutes.doOnDialogClosed(() => {
      this.fetchList(true);
      this.fetchHeader();
    });
  }

  ngOnDestroy() {
    this.#items$.complete();
    this.#header$.complete();
  }

  private fetchDialogSettings() {
    this.#dialogConfigSvc.getCurrent$().subscribe(dialogSettings => {
      this.translate.setDefaultLang(dialogSettings.Context.Language.Primary.split('-')[0]);
      this.translate.use(dialogSettings.Context.Language.Current.split('-')[0]);
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  saveList() {
    this.snackBar.open('Saving...');
    this.#contentGroupSvc.saveList(this.#contentGroup, this.#items$.value).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.fetchList();
      this.fetchHeader();
    });
  }

  saveAndCloseList() {
    this.snackBar.open('Saving...');
    this.#contentGroupSvc.saveList(this.#contentGroup, this.#items$.value).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  editHeader() {
    const form: EditForm = {
      items: [
        EditPrep.relationship(this.#contentGroup.guid, 'listcontent', 0, this.#header$.value.Id === 0),
        EditPrep.relationship(this.#contentGroup.guid, 'listpresentation', 0, this.#header$.value.Id === 0),
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  editItem(id: number) {
    const form: EditForm = {
      items: [EditPrep.editId(id)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  addFromExisting(index: number) {
    const queryParams = { add: true };
    this.#dialogRoutes.navRelative([`${this.#contentGroup.guid}/${this.#contentGroup.part}/${index + 1}/replace`], { queryParams });
  }

  addBelow(index: number) {
    const form: EditForm = {
      items: [ EditPrep.relationship(this.#contentGroup.guid, this.#contentGroup.part, index + 1, true) ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  remove(item: GroupHeader) {
    if (!confirm(this.translate.instant('ManageContentList.ConfirmRemove'))) return;
    this.snackBar.open('Removing...');
    this.#contentGroupSvc.removeItem(this.#contentGroup, item.Index).subscribe(() => {
      this.snackBar.open('Removed', null, { duration: 2000 });
      this.fetchList();
    });
  }

  drop(event: CdkDragDrop<GroupHeader[]>) {
    const items = [...this.#items$.value];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.#items$.next(items);
    this.reordered = true;
  }

  trackByFn(index: number, item: GroupHeader) {
    // we use both Index and Id because all demo items have Id=0
    return `${item.Index}+${item.Id}`;
  }

  private fetchList(keepOrder = false) {
    this.#contentGroupSvc.getList(this.#contentGroup).subscribe(items => {
      if (this.reordered) {
        const oldIds = this.#items$.value.map(item => item.Id);
        const idsChanged = this.#items$.value.length !== items.length || items.some(item => !oldIds.includes(item.Id));
        // for usecase where list is fetched on child closed and wasn't changed in the meantime keeps the order before child was opened
        if (!idsChanged && keepOrder) {
          const sortOrder = this.#items$.value.map(item => item.Index);
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
      this.#items$.next(items);
      this.reordered = false;
    });
  }

  private fetchHeader() {
    this.#contentGroupSvc.getHeader(this.#contentGroup).subscribe(header => {
      this.#header$.next(header);
    });
  }
}

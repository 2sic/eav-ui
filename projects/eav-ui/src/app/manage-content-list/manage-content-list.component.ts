import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, HostBinding, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { ContentGroupService } from './services/content-group.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { MousedownStopPropagationDirective } from '../shared/directives/mousedown-stop-propagation.directive';
import { transient } from '../core';
import { AppDialogConfigService } from '../app-administration/services/app-dialog-config.service';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { signalObj } from '../shared/signals/signal.utilities';

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
    TranslateModule,
    MatDialogModule,
    TippyDirective,
    MousedownStopPropagationDirective,
  ],
})
export class ManageContentListComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  #dialogRoutes = transient(DialogRoutingService);
  #contentGroupSvc = transient(ContentGroupService);
  #dialogConfigSvc = transient(AppDialogConfigService);

  constructor(
    private dialogRef: MatDialogRef<ManageContentListComponent>,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) { }

  protected items = signalObj<GroupHeader[]>('items', null);
  protected header = signalObj<GroupHeader>('header', null);

  #contentGroup: ContentGroup = {
    id: null,
    guid: this.#dialogRoutes.snapshot.paramMap.get('guid'),
    part: this.#dialogRoutes.snapshot.paramMap.get('part'),
    index: parseInt(this.#dialogRoutes.snapshot.paramMap.get('index'), 10),
  };
  protected reordered = signalObj('reordered', false);

  ngOnInit() {
    this.#fetchList();
    this.#fetchHeader();
    this.#fetchDialogSettings();
    this.#dialogRoutes.doOnDialogClosed(() => {
      this.#fetchList(true);
      this.#fetchHeader();
    });
  }

  #fetchDialogSettings() {
    this.#dialogConfigSvc.getCurrent$().subscribe(dialogSettings => {
      this.translate.setDefaultLang(dialogSettings.Context.Language.Primary.split('-')[0]);
      this.translate.use(dialogSettings.Context.Language.Current.split('-')[0]);
    });
  }

  protected closeDialog() {
    this.dialogRef.close();
  }

  protected saveList() {
    this.snackBar.open('Saving...');
    this.#contentGroupSvc.saveList(this.#contentGroup, this.items()).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.#fetchList();
      this.#fetchHeader();
    });
  }

  protected saveAndCloseList() {
    this.snackBar.open('Saving...');
    this.#contentGroupSvc.saveList(this.#contentGroup, this.items()).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  protected editHeader() {
    const form: EditForm = {
      items: [
        EditPrep.relationship(this.#contentGroup.guid, 'listcontent', 0, this.header().Id === 0),
        EditPrep.relationship(this.#contentGroup.guid, 'listpresentation', 0, this.header().Id === 0),
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  protected editItem(id: number) {
    const form: EditForm = {
      items: [EditPrep.editId(id)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  protected addFromExisting(index: number) {
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

  protected remove(item: GroupHeader) {
    if (!confirm(this.translate.instant('ManageContentList.ConfirmRemove'))) return;
    this.snackBar.open('Removing...');
    this.#contentGroupSvc.removeItem(this.#contentGroup, item.Index).subscribe(() => {
      this.snackBar.open('Removed', null, { duration: 2000 });
      this.#fetchList();
    });
  }

  protected drop(event: CdkDragDrop<GroupHeader[]>) {
    const items = [...this.items()];
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    this.items.set(items);
    this.reordered.set(true);
  }

  #fetchList(keepOrder = false) {
    this.#contentGroupSvc.getList(this.#contentGroup).subscribe(items => {
      if (this.reordered()) {
        const oldIds = this.items().map(item => item.Id);
        const idsChanged = this.items().length !== items.length || items.some(item => !oldIds.includes(item.Id));
        // for usecase where list is fetched on child closed and wasn't changed in the meantime keeps the order before child was opened
        if (!idsChanged && keepOrder) {
          const sortOrder = this.items().map(item => item.Index);
          items.sort((a, b) => {
            const aIndex = sortOrder.indexOf(a.Index);
            const bIndex = sortOrder.indexOf(b.Index);
            if (aIndex === -1 || bIndex === -1) { return 0; }
            return aIndex - bIndex;
          });
        } else if (keepOrder)
          this.snackBar.open('List was changed from somewhere else. Order of items is reset', null, { duration: 5000 });
      }
      this.items.set(items);
      this.reordered.set(false);
    });
  }

  #fetchHeader() {
    this.#contentGroupSvc.getHeader(this.#contentGroup)
      .subscribe(header => this.header.set(header));
  }
}

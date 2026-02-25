import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, HostBinding, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { convert, transient } from '../../../../core';
import { DialogConfigAppService } from '../app-administration/services/dialog-config-app.service';
import { isCtrlEnter, isCtrlS } from '../edit/dialog/main/keyboard-shortcuts';
import { DialogHeaderComponent } from "../shared/dialog-header/dialog-header";
import { MousedownStopPropagationDirective } from '../shared/directives/mousedown-stop-propagation.directive';
import { TippyDirective } from '../shared/directives/tippy.directive';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ItemIdHelper } from '../shared/models/item-id-helper';
import { ExtendedFabSpeedDialImports } from '../shared/modules/extended-fab-speed-dial/extended-fab-speed-dial.imports';
import { SaveCloseButtonComponent } from '../shared/modules/save-close-button/save-close-button';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { signalObj } from '../shared/signals/signal.utilities';
import { ContentGroup } from './models/content-group.model';
import { GroupHeader } from './models/group-header.model';
import { ContentGroupService } from './services/content-group.service';

@Component({
  selector: 'app-manage-content-list',
  templateUrl: './manage-content-list.html',
  styleUrls: ['./manage-content-list.scss'],
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
    ...ExtendedFabSpeedDialImports,
    SaveCloseButtonComponent,
    DialogHeaderComponent,
  ]
})
export class ManageContentListComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  #dialogRoutes = transient(DialogRoutingService);
  #contentGroupSvc = transient(ContentGroupService);
  #dialogConfigSvc = transient(DialogConfigAppService);

  constructor(
    private dialog: MatDialogRef<ManageContentListComponent>,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) { }

  protected items = signalObj<GroupHeader[]>('items', null);

  #contentGroup = convert(this.#dialogRoutes.getParams(['guid', 'part', 'index']), p => ({
    id: null as number,
    guid: p.guid,
    part: p.part,
    index: parseInt(p.index, 10),
  } satisfies ContentGroup));

  #refresh = signal(0);
  header = this.#contentGroupSvc.getAllLive(this.#contentGroup, this.#refresh).value;

  protected reordered = signalObj('reordered', false);

  ngOnInit() {
    this.#watchKeyboardShortcuts();

    this.#fetchList();
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
    this.dialog.close();
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

  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {

      if (isCtrlS(event)) {
        event.preventDefault();
        this.saveList();
      }

      if (isCtrlEnter(event)) {
        event.preventDefault();
        this.saveAndCloseList();
      }
    });
  }

  protected editHeader() {
    const form: EditForm = {
      items: [
        ItemIdHelper.relationship(this.#contentGroup.guid, 'listcontent', 0, this.header().Id === 0),
        ItemIdHelper.relationship(this.#contentGroup.guid, 'listpresentation', 0, this.header().Id === 0),
      ],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  protected editItem(id: number) {
    const form: EditForm = {
      items: [ItemIdHelper.editId(id)],
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
      items: [ItemIdHelper.relationship(this.#contentGroup.guid, this.#contentGroup.part, index + 1, true)],
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
    this.#contentGroupSvc.getListPromise(this.#contentGroup).then(items => {
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
    this.#refresh.set(this.#refresh() + 1);
  }

  protected toPlainText(value: string | null | undefined): string {
    if (!value) 
      return '';

    const temp = document.createElement('div');
    temp.innerHTML = value;
    return temp.textContent?.trim() ?? '';
  }
}

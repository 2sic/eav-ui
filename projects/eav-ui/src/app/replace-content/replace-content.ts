import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Component, HostBinding, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterOutlet } from '@angular/router';
import { convert, transient } from '../../../../core';
import { isCtrlEnter } from '../edit/dialog/main/keyboard-shortcuts';
import { ContentGroupAdd, ParentReference } from '../manage-content-list/models/content-group.model';
import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { DialogHeaderComponent } from "../shared/dialog-header/dialog-header";
import { TippyDirective } from '../shared/directives/tippy.directive';
import { EditForm } from '../shared/models/edit-form.model';
import { ItemIdHelper } from '../shared/models/item-id-helper';
import { SaveCloseButtonFabComponent } from '../shared/modules/save-close-button-fab/save-close-button-fab';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { computedObj, signalObj } from '../shared/signals/signal.utilities';
import { convertFormToUrl } from '../shared/url/url-converter';
import { ReplaceOption } from './replace-config.model';

@Component({
    selector: 'app-replace-content',
    templateUrl: './replace-content.html',
    styleUrls: ['./replace-content.scss'],
    imports: [
    RouterOutlet,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    FormsModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    MatOptionModule,
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    TippyDirective,
    SaveCloseButtonFabComponent,
    DialogHeaderComponent,
]
})
export class ReplaceContentComponent implements OnInit {
  @HostBinding('className') hostClass = 'dialog-component';

  #contentGroupSvc = transient(ContentGroupService);
  #dialogRoutes = transient(DialogRoutingService);

  constructor(
    private dialog: MatDialogRef<ReplaceContentComponent>,
    private snackBar: MatSnackBar,
  ) { }

  #parentIdentifiers = convert(this.#dialogRoutes.getParams(['guid', 'part', 'index']), p => ({
    guid: p.guid,
    part: p.part,
    index: parseInt(p.index, 10),
  } satisfies ParentReference));

  // #contentTypeName: string;
  
  /** Mode is adding the to-be-selected item, not replace */
  protected isAddMode = signalObj('isAddMode', !!this.#dialogRoutes.getQueryParam('add'));
  #contentTypesFilter = signalObj('contentType', this.#dialogRoutes.getQueryParam('contentType'));

  /** The text being searched for */
  filterText = model<string>('');

  /** The options which could be used */
  #optionsRaw = signalObj<ReplaceOption[]>('options', []);

  /** The options after filtering */
  options = computedObj<ReplaceOption[]>('filteredOptions', () => {
    const filter = this.filterText().toLocaleLowerCase();
    return this.#optionsRaw()
      .filter(o => o.title.toLocaleLowerCase().includes(filter));
  });

  /** The system has a selected item, when the text exactly matches the label of an option */
  canSave = computedObj<boolean>('isMatch', () => this.options().map(o => o.title).includes(this.filterText()));

  ngOnInit() {
    this.#watchKeyboardShortcuts();

    this.#fetchConfig(false, null);

    this.#dialogRoutes.doOnDialogClosed(() => {
      const navigation = this.#dialogRoutes.router.currentNavigation();
      const editResult = navigation?.extras?.state;
      const cloneId: number = editResult?.[Object.keys(editResult)[0]];
      this.#fetchConfig(true, cloneId);
    });
  }

  closeDialog() {
    this.dialog.close();
  }

  select(event: MatAutocompleteSelectedEvent) {
    this.filterText.set(event.option.value);
  }

  copySelected() {
    // WIP 2dm
    const contentGroup = this.#optionsRaw().find(o => o.title === this.filterText())!; // this.#buildContentGroup();
    const form: EditForm = {
      items: [ItemIdHelper.copy(contentGroup.contentType, contentGroup.id)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  #fetchConfig(isRefresh: boolean, cloneId: number | null) {
    this.#contentGroupSvc.getItemsPromise(this.#parentIdentifiers, this.#contentTypesFilter()).then(replaceConfig => {
      const options = replaceConfig.items
        .map((item) => ({
          ...item,
          title: `${item.title} (${item.contentType} - ${item.id})`,
        } satisfies ReplaceOption));
      this.#optionsRaw.set(options);

      // don't set selected option if dialog should be in add-mode and don't change selected option on refresh unless it's cloneId
      if ((!this.isAddMode() && !isRefresh) || cloneId != null) {
        const newId = !isRefresh ? replaceConfig.selectedId : cloneId;
        const newFilter = this.#optionsRaw().find(o => o.id === newId)?.title || '';
        this.filterText.set(newFilter);
      }
    });
  }

  #buildContentGroup(): ContentGroupAdd {
    const filter = this.filterText();
    const selected = this.#optionsRaw().find(o => o.title === filter)!; //?.id ?? null;

    // const contentType = this.#contentTypeFilter();
    // console.log('2dm, buildContentGroup', { filter, id, contentType, params: this.#params });
    const contentGroup = {
      ...selected,
      ...this.#parentIdentifiers,
      add: this.isAddMode(),
    } satisfies ContentGroupAdd;
    return contentGroup;
  }
  
  saveAndClose() {
    this.snackBar.open('Saving...');
    const contentGroup = this.#buildContentGroup();
    this.#contentGroupSvc.saveItem(contentGroup).subscribe(() => {
      this.snackBar.open('Saved', undefined, { duration: 2000 });
      this.closeDialog();
    });
  }
  
  #watchKeyboardShortcuts(): void {
    this.dialog.keydownEvents().subscribe(event => {
      if (isCtrlEnter(event) && this.canSave()) {
        event.preventDefault();
        this.saveAndClose();
      }
    });
  }
}


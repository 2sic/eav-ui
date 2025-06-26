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
import { ContentGroupAdd } from '../manage-content-list/models/content-group.model';
import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm, EditPrep } from '../shared/models/edit-form.model';
import { DialogRoutingService } from '../shared/routing/dialog-routing.service';
import { computedObj, signalObj } from '../shared/signals/signal.utilities';

@Component({
    selector: 'app-replace-content',
    templateUrl: './replace-content.component.html',
    styleUrls: ['./replace-content.component.scss'],
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

  #params = convert(this.#dialogRoutes.getParams(['guid', 'part', 'index']), p => ({
    guid: p.guid,
    part: p.part,
    index: parseInt(p.index, 10),
  }));

  #contentTypeName: string;
  
  /** Mode is adding the to-be-selected item, not replace */
  protected isAddMode = signalObj('isAddMode', !!this.#dialogRoutes.getQueryParam('add'));

  /** The text being searched for */
  filterText = model<string>('');

  /** The options which could be used */
  #optionsRaw = signalObj<ReplaceOption[]>('options', []);

  /** The options after filtering */
  options = computedObj<ReplaceOption[]>('filteredOptions', () => {
    const filter = this.filterText().toLocaleLowerCase();
    return this.#optionsRaw()
      .filter(o => o.label.toLocaleLowerCase().includes(filter));
  });

  /** The system has a selected item, when the text exactly matches the label of an option */
  hasSelection = computedObj<boolean>('isMatch', () => this.options().map(o => o.label).includes(this.filterText()));

  ngOnInit() {
    this.#fetchConfig(false, null);

    this.#dialogRoutes.doOnDialogClosed(() => {
      const navigation = this.#dialogRoutes.router.getCurrentNavigation();
      const editResult = navigation.extras?.state;
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
    const contentGroup = this.#buildContentGroup();
    const form: EditForm = {
      items: [EditPrep.copy(this.#contentTypeName, contentGroup.id)],
    };
    const formUrl = convertFormToUrl(form);
    this.#dialogRoutes.navRelative([`edit/${formUrl}`]);
  }

  save() {
    this.snackBar.open('Saving...');
    const contentGroup = this.#buildContentGroup();
    this.#contentGroupSvc.saveItem(contentGroup).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  #fetchConfig(isRefresh: boolean, cloneId: number) {


    const contentGroup = this.#buildContentGroup();
    this.#contentGroupSvc.getItemsPromise(contentGroup).then(replaceConfig => {
      const options = Object.entries(replaceConfig.Items)
        .map(([itemId, itemName]) => ({
          id: parseInt(itemId, 10),
          label: `${itemName} (${itemId})`,
        } satisfies ReplaceOption));
      this.#optionsRaw.set(options);

      // don't set selected option if dialog should be in add-mode and don't change selected option on refresh unless it's cloneId
      if ((!contentGroup.add && !isRefresh) || cloneId != null) {
        const newId = !isRefresh ? replaceConfig.SelectedId : cloneId;
        const newFilter = this.#optionsRaw().find(o => o.id === newId)?.label || '';
        this.filterText.set(newFilter);
      }
      this.#contentTypeName = replaceConfig.ContentTypeName;
    });
  }

  #buildContentGroup() {
    const filter = this.filterText();
    const id = this.#optionsRaw().find(o => o.label === filter)?.id ?? null;

    const contentGroup: ContentGroupAdd = {
      id,
      ...this.#params,
      add: this.isAddMode(),
    };
    return contentGroup;
  }
}


interface ReplaceOption {
  id: number;
  label: string;
}

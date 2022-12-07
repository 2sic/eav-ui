import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ContentGroupAdd } from '../manage-content-list/models/content-group.model';
import { ContentGroupService } from '../manage-content-list/services/content-group.service';
import { BaseComponent } from '../shared/components/base-component/base.component';
import { convertFormToUrl } from '../shared/helpers/url-prep.helper';
import { EditForm } from '../shared/models/edit-form.model';
import { ReplaceOption } from './models/replace-option.model';
import { ReplaceContentTemplateVars } from './replace-content.models';

@Component({
  selector: 'app-replace-content',
  templateUrl: './replace-content.component.html',
  styleUrls: ['./replace-content.component.scss'],
})
export class ReplaceContentComponent extends BaseComponent implements OnInit, OnDestroy {
  @HostBinding('className') hostClass = 'dialog-component';

  templateVars$: Observable<ReplaceContentTemplateVars>;

  private guid: string;
  private part: string;
  private index: number;
  private add: boolean;
  private filterText$: BehaviorSubject<string>;
  private options$: BehaviorSubject<ReplaceOption[]>;
  private contentTypeName: string;

  constructor(
    private dialogRef: MatDialogRef<ReplaceContentComponent>,
    private contentGroupService: ContentGroupService,
    router: Router,
    route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { 
    super(router, route);
  }

  ngOnInit() {
    this.guid = this.route.snapshot.paramMap.get('guid');
    this.part = this.route.snapshot.paramMap.get('part');
    this.index = parseInt(this.route.snapshot.paramMap.get('index'), 10);
    this.add = !!this.route.snapshot.queryParamMap.get('add');

    this.filterText$ = new BehaviorSubject('');
    this.options$ = new BehaviorSubject([]);

    const filteredOptions$ = combineLatest([this.filterText$, this.options$]).pipe(
      map(([filterText, options]) =>
        options.filter(option => option.label.toLocaleLowerCase().includes(filterText.toLocaleLowerCase())).map(option => option.label)
      ),
    );
    this.templateVars$ = combineLatest([this.filterText$, filteredOptions$]).pipe(
      map(([filterText, filteredOptions]) => {
        const templateVars: ReplaceContentTemplateVars = {
          filterText,
          filteredOptions,
          isAddMode: this.add,
          isMatch: filteredOptions.includes(filterText),
        };
        return templateVars;
      }),
    );

    this.fetchConfig(false, null);
    this.subscription.add(this.refreshOnChildClosed().subscribe(() => { 
      const navigation = this.router.getCurrentNavigation();
      const editResult = navigation.extras?.state;
      const cloneId: number = editResult?.[Object.keys(editResult)[0]];
      this.fetchConfig(true, cloneId);
     }));
  }

  ngOnDestroy() {
    this.filterText$.complete();
    this.options$.complete();
    super.ngOnDestroy();
  }

  closeDialog() {
    this.dialogRef.close();
  }

  setFilter(filterText: string) {
    this.filterText$.next(filterText);
  }

  select(event: MatAutocompleteSelectedEvent) {
    this.filterText$.next(event.option.value);
  }

  copySelected() {
    const contentGroup = this.buildContentGroup();
    const form: EditForm = {
      items: [{ ContentTypeName: this.contentTypeName, DuplicateEntity: contentGroup.id }],
    };
    const formUrl = convertFormToUrl(form);
    this.router.navigate([`edit/${formUrl}`], { relativeTo: this.route });
  }

  save() {
    this.snackBar.open('Saving...');
    const contentGroup = this.buildContentGroup();
    this.contentGroupService.saveItem(contentGroup).subscribe(() => {
      this.snackBar.open('Saved', null, { duration: 2000 });
      this.closeDialog();
    });
  }

  private fetchConfig(isRefresh: boolean, cloneId: number) {
    const contentGroup = this.buildContentGroup();
    this.contentGroupService.getItems(contentGroup).subscribe(replaceConfig => {
      const options = Object.entries(replaceConfig.Items).map(([itemId, itemName]) => {
        const option: ReplaceOption = {
          id: parseInt(itemId, 10),
          label: `${itemName} (${itemId})`,
        };
        return option;
      });
      this.options$.next(options);

      // don't set selected option if dialog should be in add-mode and don't change selected option on refresh unless it's cloneId
      if ((!contentGroup.add && !isRefresh) || cloneId != null) {
        const newId = !isRefresh ? replaceConfig.SelectedId : cloneId;
        const newFilter = this.options$.value.find(option => option.id === newId)?.label || '';
        this.filterText$.next(newFilter);
      }
      this.contentTypeName = replaceConfig.ContentTypeName;
    });
  }

  private buildContentGroup() {
    const id = this.options$.value.find(option => option.label === this.filterText$.value)?.id ?? null;

    const contentGroup: ContentGroupAdd = {
      id,
      guid: this.guid,
      part: this.part,
      index: this.index,
      add: this.add,
    };
    return contentGroup;
  }
}

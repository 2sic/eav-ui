import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, take, filter } from 'rxjs/operators';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { EntityService } from '../../../../shared/services/entity.service';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { BaseComponent } from '../../base/base.component';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { FieldSettings } from '../../../../../edit-types';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { SelectedEntity } from './entity-default.models';
import { EditForm } from '../../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { paramEncode } from '../../../../../ng-dialogs/src/app/shared/helpers/url-prep.helper';
import { ReorderIndexes } from '../entity-default-list/entity-default-list.models';
import { EntityDefaultSearchComponent } from '../entity-default-search/entity-default-search.component';
import { Helper } from '../../../../shared/helpers/helper';
import { ExpandableFieldService } from '../../../../shared/services/expandable-field.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@InputType({})
export class EntityDefaultComponent extends BaseComponent<string | string[]> implements OnInit, OnDestroy {
  @ViewChild(EntityDefaultSearchComponent) private entitySearchComponent: EntityDefaultSearchComponent;

  useQuery = false;
  contentTypeMask: FieldMaskService;
  error$ = new BehaviorSubject<string>('');
  freeTextMode$ = new BehaviorSubject<boolean>(false);
  disableAddNew$ = new BehaviorSubject<boolean>(true);
  isExpanded$: Observable<boolean>;
  selectedEntities$: Observable<SelectedEntity[]>;
  eavConfig: EavConfiguration;
  subscription = new Subscription();
  private hasChild: boolean;
  private separator: string;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private entityService: EntityService,
    public translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private expandableFieldService: ExpandableFieldService,
    private snackBar: MatSnackBar,
  ) {
    super(eavService, validationMessagesService);
    this.eavConfig = eavService.getEavConfiguration();
    this.hasChild = !!this.route.snapshot.firstChild;
  }

  ngOnInit() {
    super.ngOnInit();
    this.config.entityCache$ = new BehaviorSubject<EntityInfo[]>([]);

    this.settings$ = this.settings$.pipe(map(settings => this.calculateSettings(settings)));
    this.separator = this.config.field.settings$.value.Separator;
    this.selectedEntities$ = combineLatest([this.value$, this.config.entityCache$]).pipe(map(combined => {
      const fieldValue = combined[0];
      const availableEntities = combined[1];
      let selectedEntities: SelectedEntity[];

      if (typeof fieldValue === 'string') {
        const names = Helper.convertValueToArray(fieldValue, this.separator);
        selectedEntities = names.map(name => {
          const selectedEntity: SelectedEntity = {
            value: name,
            label: name,
            tooltip: `${name} (${name})`,
            isFreeTextOrNotFound: true,
          };
          return selectedEntity;
        });
      } else {
        selectedEntities = fieldValue.map(guid => {
          const entity = availableEntities.find(e => e.Value === guid);
          const label = (guid == null) ? 'empty slot' : entity?.Text || this.translate.instant('Fields.Entity.EntityNotFound');
          const selectedEntity: SelectedEntity = {
            value: guid,
            label,
            tooltip: `${label} (${guid})`,
            isFreeTextOrNotFound: !entity,
          };
          return selectedEntity;
        });
      }

      return selectedEntities;
    }));

    this.isExpanded$ = this.expandableFieldService
      .getObservable()
      .pipe(map(expandedFieldId => this.config.field.index === expandedFieldId));

    this.subscription.add(this.settings$.subscribe(settings => {
      this.contentTypeMask?.destroy();
      this.contentTypeMask = new FieldMaskService(
        settings.EntityType,
        this.group.controls,
        !this.useQuery ? this.fetchAvailableEntities.bind(this) : this.updateAddNew.bind(this),
        null,
        this.eavConfig,
      );
    }));

    if (!this.useQuery) {
      this.fetchAvailableEntities();
    } else {
      this.updateAddNew();
    }

    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.error$.complete();
    this.freeTextMode$.complete();
    this.disableAddNew$.complete();
    this.config.entityCache$.complete();
    this.contentTypeMask.destroy();
    this.subscription.unsubscribe();
  }

  toggleFreeTextMode() {
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }

  /** Overridden in subclass */
  calculateSettings(settings: FieldSettings) {
    const fixedSettings = { ...settings };
    if (fixedSettings.EntityType == null) { fixedSettings.EntityType = ''; }
    if (fixedSettings.AllowMultiValue == null) { fixedSettings.AllowMultiValue = false; }
    if (fixedSettings.EnableEdit == null) { fixedSettings.EnableEdit = true; }
    if (fixedSettings.EnableCreate == null) { fixedSettings.EnableCreate = true; }
    if (fixedSettings.EnableAddExisting == null) { fixedSettings.EnableAddExisting = true; }
    if (fixedSettings.EnableRemove == null) { fixedSettings.EnableRemove = true; }
    if (fixedSettings.EnableDelete == null) { fixedSettings.EnableDelete = false; }
    return fixedSettings;
  }

  /** Overridden in subclass */
  fetchAvailableEntities() {
    this.updateAddNew();
    const contentTypeName = this.contentTypeMask.resolve();
    let enableAddExisting: boolean;
    this.settings$.pipe(take(1)).subscribe(settings => {
      enableAddExisting = settings.EnableAddExisting;
    });
    // spm TODO: Should this work like this?
    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    const filterText = enableAddExisting ? null : this.control.value;
    this.entityService.getAvailableEntities(filterText, contentTypeName).subscribe(items => {
      this.config.cache = items;
      this.config.entityCache$.next(items);
    });
  }

  updateAddNew() {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  reorder(reorderIndexes: ReorderIndexes) {
    this.updateValue('reorder', reorderIndexes);
  }

  addSelected(guid: string) {
    this.updateValue('add', guid);
  }

  removeSelected(index: number) {
    this.updateValue('delete', index);
  }

  editEntity(entityGuid: string) {
    if (entityGuid == null) {
      const contentTypeName = this.contentTypeMask.resolve();
      const form: EditForm = {
        items: [{ ContentTypeName: contentTypeName }],
      };
      this.expandableFieldService.openWithUpdate(this.config.field.index, form);
    } else {
      let availableEntities: EntityInfo[];
      this.config.entityCache$.pipe(take(1)).subscribe(entities => {
        availableEntities = entities;
      });
      const entity = availableEntities.find(e => e.Value === entityGuid);
      const form: EditForm = {
        items: [{ EntityId: entity.Id.toString() }],
      };
      this.router.navigate([`edit/${paramEncode(JSON.stringify(form))}`], { relativeTo: this.route });
    }
  }

  deleteEntity(entityGuid: string) {
    const entity = this.config.entityCache$.value.find(e => e.Value === entityGuid);
    const id = entity.Id.toString();
    const title = entity.Text;
    const contentType = this.contentTypeMask.resolve();
    let selected: SelectedEntity[];
    this.selectedEntities$.pipe(take(1)).subscribe(entities => {
      selected = entities;
    });
    const index = selected.findIndex(e => e.value === entityGuid);

    if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
    this.snackBar.open('Deleting...');
    this.entityService.delete(contentType, id, false).subscribe({
      next: () => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.removeSelected(index);
        this.fetchAvailableEntities();
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open('Deleting...');
        this.entityService.delete(contentType, id, true).subscribe(res2 => {
          this.snackBar.open('Deleted', null, { duration: 2000 });
          this.removeSelected(index);
          this.fetchAvailableEntities();
        });
      }
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
      const hadChild = this.hasChild;
      this.hasChild = !!this.route.snapshot.firstChild;
      if (!this.hasChild && hadChild) {
        const expandedFieldId = this.route.snapshot.paramMap.get('expandedFieldId');
        const updateFieldId = this.route.snapshot.paramMap.get('updateFieldId');
        const thisId = this.config.field.index.toString();

        if (expandedFieldId != null && expandedFieldId !== thisId) { return; }
        if (updateFieldId != null && updateFieldId !== thisId) { return; }

        const navigation = this.router.getCurrentNavigation();
        const editResult = navigation.extras?.state;
        if (editResult) {
          const newItemGuid = Object.keys(editResult)[0];
          this.addSelected(newItemGuid);
        }
        this.fetchAvailableEntities();

        if (updateFieldId != null && updateFieldId === thisId) {
          this.expandableFieldService.openWithUpdate(this.config.field.index, null);
        }
      }
    }));
  }

  private updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes) {
    const valueArray: string[] = (typeof this.control.value === 'string')
      ? Helper.convertValueToArray(this.control.value, this.separator)
      : [...this.control.value];

    switch (action) {
      case 'add':
        const guid = value as string;
        valueArray.push(guid);
        break;
      case 'delete':
        const index = value as number;
        valueArray.splice(index, 1);
        break;
      case 'reorder':
        const reorderIndexes = value as ReorderIndexes;
        moveItemInArray(valueArray, reorderIndexes.previousIndex, reorderIndexes.currentIndex);
        break;
    }

    if (typeof this.control.value === 'string') {
      const valueString = Helper.convertArrayToString(valueArray, this.separator);
      this.control.patchValue(valueString);
    } else {
      this.control.patchValue(valueArray);
    }

    if (!this.control.dirty) {
      this.control.markAsDirty();
    }

    if (action === 'delete' && !valueArray.length) {
      setTimeout(() => {
        this.entitySearchComponent.autocompleteRef?.nativeElement.focus();
      }, 0);
    }
  }

}

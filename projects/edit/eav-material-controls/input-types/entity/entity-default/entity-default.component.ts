import { moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { EditForm } from '../../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { FieldMask } from '../../../../shared/helpers';
import { EntityInfo } from '../../../../shared/models';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { ReorderIndexes } from '../entity-default-list/entity-default-list.models';
import { EntityDefaultSearchComponent } from '../entity-default-search/entity-default-search.component';
import { EntityDefaultLogic } from './entity-default-logic';
import { calculateSelectedEntities, convertArrayToString, convertValueToArray } from './entity-default.helpers';
import { DeleteEntityProps, EntityTemplateVars, SelectedEntity } from './entity-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.scss'],
})
@ComponentMetadata({})
export class EntityDefaultComponent extends BaseComponent<string | string[]> implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(EntityDefaultSearchComponent) private entitySearchComponent: EntityDefaultSearchComponent;

  isQuery: boolean;
  isStringQuery: boolean;
  contentTypeMask?: FieldMask;

  error$: BehaviorSubject<string>;
  freeTextMode$: BehaviorSubject<boolean>;
  disableAddNew$: BehaviorSubject<boolean>;
  isExpanded$: Observable<boolean>;
  selectedEntities$: Observable<SelectedEntity[]>;
  availableEntities$: BehaviorSubject<EntityInfo[]>;
  templateVars$: Observable<EntityTemplateVars>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
    private entityService: EntityService,
    public translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private snackBar: MatSnackBar,
    public entityCacheService: EntityCacheService,
    public stringQueryCacheService: StringQueryCacheService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    EntityDefaultLogic.importMe();
    this.isQuery = false;
    this.isStringQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.error$ = new BehaviorSubject('');
    this.freeTextMode$ = new BehaviorSubject(false);
    this.disableAddNew$ = new BehaviorSubject(true);
    this.availableEntities$ = new BehaviorSubject<EntityInfo[]>(null);

    const separator$ = this.settings$.pipe(map(settings => settings.Separator), distinctUntilChanged());
    const stringQueryLabel$ = this.settings$.pipe(map(settings => settings.Label), distinctUntilChanged());
    this.selectedEntities$ = combineLatest([
      this.value$,
      separator$,
      this.entityCacheService.getEntities$(),
      this.stringQueryCacheService.getEntities$(),
      stringQueryLabel$,
    ]).pipe(
      map(([value, separator, entityCache, stringQueryCache, stringQueryLabel]) =>
        calculateSelectedEntities(value, separator, entityCache, stringQueryCache, stringQueryLabel, this.translate)
      ),
    );

    this.isExpanded$ = this.editRoutingService.isExpanded$(this.config.index, this.config.entityGuid);

    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.EntityType),
        distinctUntilChanged(),
      ).subscribe(entityType => {
        this.contentTypeMask?.destroy();
        this.contentTypeMask = new FieldMask(
          entityType,
          this.group.controls,
          () => {
            // for EntityQuery we don't have to refetch entities because entities come from settings.Query, not settings.EntityType
            if (!this.isQuery) {
              this.availableEntities$.next(null);
            }
            this.updateAddNew();
          },
          null,
          this.eavService.eavConfig,
        );

        this.availableEntities$.next(null);
        this.updateAddNew();
      })
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.label$, this.placeholder$, this.required$, this.invalid$, this.freeTextMode$, this.settings$]),
      combineLatest([this.selectedEntities$, this.availableEntities$, this.disableAddNew$, this.isExpanded$, this.error$]),
      combineLatest([this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [label, placeholder, required, invalid, freeTextMode, settings],
        [selectedEntities, availableEntities, disableAddNew, isExpanded, error],
        [disabled, touched],
      ]) => {
        const templateVars: EntityTemplateVars = {
          label,
          placeholder,
          required,
          invalid,
          freeTextMode,
          settings,
          selectedEntities,
          availableEntities,
          disableAddNew,
          isExpanded,
          error,
          disabled,
          touched,
        };
        return templateVars;
      }),
    );

    this.refreshOnChildClosed();
  }

  ngAfterViewInit() {
    this.fixPrefillAndStringQueryCache();
  }

  ngOnDestroy(): void {
    this.error$.complete();
    this.freeTextMode$.complete();
    this.disableAddNew$.complete();
    this.availableEntities$.complete();
    this.contentTypeMask?.destroy();
    super.ngOnDestroy();
  }

  toggleFreeTextMode(): void {
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }

  /**
   * WARNING! Overridden in subclass.
   * @param clearAvailableEntitiesAndOnlyUpdateCache - clears availableEntities and fetches only items which are selected
   * to update names in entityCache
   */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.availableEntities$.next(null);
    }

    const contentTypeName = this.contentTypeMask.resolve();
    const entitiesFilter: string[] = (clearAvailableEntitiesAndOnlyUpdateCache || !this.settings$.value.EnableAddExisting)
      ? (this.control.value as string[]).filter(guid => guid)
      : null;

    this.entityService.getAvailableEntities(contentTypeName, entitiesFilter).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      if (!clearAvailableEntitiesAndOnlyUpdateCache) {
        this.availableEntities$.next(items);
      }
    });
  }

  private updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  reorder(reorderIndexes: ReorderIndexes): void {
    this.updateValue('reorder', reorderIndexes);
  }

  addSelected(guid: string): void {
    this.updateValue('add', guid);
  }

  removeSelected(index: number): void {
    this.updateValue('delete', index);
  }

  editEntity(entityGuid: string): void {
    let form: EditForm;
    if (entityGuid == null) {
      const contentTypeName = this.contentTypeMask.resolve();
      const prefill = this.getPrefill();
      form = {
        items: [{ ContentTypeName: contentTypeName, Prefill: prefill }],
      };
    } else {
      const entity = this.entityCacheService.getEntity(entityGuid);
      form = {
        items: [{ EntityId: entity.Id }],
      };
    }
    this.editRoutingService.open(this.config.index, this.config.entityGuid, form);
  }

  /**
   * Will create a prefill object (if configured) which is based on a field-mask.
   * This allows create-entity to use add prefills.
   * ATM just normal values (text/number) or placeholders like [Title] work.
   * In future we may add more features like dates etc.
   * new 11.11.03
   */
  private getPrefill(): Record<string, string> {
    // still very experimental, and to avoid errors try to catch any mistakes
    try {
      const prefillMask = new FieldMask(this.settings$.value.Prefill, this.group.controls, null, null, this.eavService.eavConfig);
      const prefill = prefillMask.resolve();
      prefillMask.destroy();
      if (!prefill || !prefill.trim()) { return null; }
      const result: Record<string, string> = {};
      prefill.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length === 2 && parts[0] && parts[1]) {
          result[parts[0]] = parts[1];
        }
      });
      return result;
    } catch {
      console.error('Error in getting Prefill for new entity. Will skip prefill.');
      return null;
    }
  }

  deleteEntity(props: DeleteEntityProps): void {
    const entity = this.entityCacheService.getEntity(props.entityGuid);
    const id = entity.Id;
    const title = entity.Text;
    const contentType = this.contentTypeMask.resolve();

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.snackBar.open(this.translate.instant('Message.Deleting'));
    this.entityService.delete(contentType, id, false).subscribe({
      next: () => {
        this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
        this.removeSelected(props.index);
        this.fetchEntities(true);
      },
      error: (error1: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open(this.translate.instant('Message.Deleting'));
        this.entityService.delete(contentType, id, true).subscribe({
          next: () => {
            this.snackBar.open(this.translate.instant('Message.Deleted'), null, { duration: 2000 });
            this.removeSelected(props.index);
            this.fetchEntities(true);
          },
          error: (error2: HttpErrorResponse) => {
            this.snackBar.open(this.translate.instant('Message.DeleteError'), null, { duration: 2000 });
          }
        });
      }
    });
  }

  /**
   * If guid is initially in value, but not in cache, it is either prefilled or entity is deleted,
   * or in case of StringDropdownQuery, backend doesn't provide entities initially.
   * This will fetch data once to figure out missing guids.
   */
  private fixPrefillAndStringQueryCache() {
    // filter out null items
    const guids = convertValueToArray(this.control.value, this.settings$.value.Separator).filter(guid => guid);
    if (guids.length === 0) { return; }
    const cached = this.entityCacheService.getEntities(guids);
    if (guids.length !== cached.length) {
      this.fetchEntities(true);
    }
  }

  private refreshOnChildClosed(): void {
    this.subscription.add(
      this.editRoutingService.childFormResult(this.config.index, this.config.entityGuid).subscribe(result => {
        const newItemGuid = Object.keys(result)[0];
        this.addSelected(newItemGuid);
      })
    );
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchEntities(true);
      })
    );
  }

  private updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes): void {
    const valueArray: string[] = (typeof this.control.value === 'string')
      ? convertValueToArray(this.control.value, this.settings$.value.Separator)
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
      const valueString = convertArrayToString(valueArray, this.settings$.value.Separator);
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
      });
    }
  }

}

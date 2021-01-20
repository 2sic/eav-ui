import { moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldSettings } from '../../../../../edit-types';
import { EditForm } from '../../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { Helper } from '../../../../shared/helpers/helper';
import { EntityInfo } from '../../../../shared/models';
import { EavService } from '../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { ReorderIndexes } from '../entity-default-list/entity-default-list.models';
import { EntityDefaultSearchComponent } from '../entity-default-search/entity-default-search.component';
import { EntityDefaultLogic } from './entity-default-logic';
import { calculateSelectedEntities } from './entity-default.helpers';
import { DeleteEntityProps, EntityTemplateVars, SelectedEntity } from './entity-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'entity-default',
  templateUrl: './entity-default.component.html',
  styleUrls: ['./entity-default.component.scss'],
})
@ComponentMetadata({})
export class EntityDefaultComponent extends BaseComponent<string | string[]> implements OnInit, OnDestroy {
  @ViewChild(EntityDefaultSearchComponent) private entitySearchComponent: EntityDefaultSearchComponent;

  templateVars$: Observable<EntityTemplateVars>;

  useQuery = false;
  contentTypeMask: FieldMaskService;

  /** New in 11.11.03 - Prefill feature to add prefill to new entities */
  prefillMask: FieldMaskService;

  error$ = new BehaviorSubject('');
  freeTextMode$ = new BehaviorSubject(false);
  disableAddNew$ = new BehaviorSubject(true);
  isExpanded$: Observable<boolean>;
  selectedEntities$: Observable<SelectedEntity[]>;
  settingsLogic = new EntityDefaultLogic();

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private entityService: EntityService,
    public translate: TranslateService,
    private editRoutingService: EditRoutingService,
    private snackBar: MatSnackBar,
  ) {
    super(eavService, validationMessagesService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.config.entityCache$ = new BehaviorSubject<EntityInfo[]>([]);

    this.settings$ = new BehaviorSubject<FieldSettings>(null);
    this.subscription.add(
      this.config.field.settings$.pipe(map(settings => this.settingsLogic.init(settings))).subscribe(settings => {
        this.settings$.next(settings);
      })
    );
    this.selectedEntities$ = combineLatest([this.value$, this.settings$, this.config.entityCache$]).pipe(
      map(([fieldValue, settings, availableEntities]) => {
        const selected = calculateSelectedEntities(fieldValue, settings.Separator, availableEntities, this.translate);
        return selected;
      }),
    );

    this.isExpanded$ = this.editRoutingService.isExpanded(this.config.field.index, this.config.entity.entityGuid);

    this.subscription.add(
      this.settings$.subscribe(settings => {
        this.contentTypeMask?.destroy();
        this.contentTypeMask = new FieldMaskService(
          settings.EntityType,
          this.group.controls,
          !this.useQuery ? this.fetchAvailableEntities.bind(this) : this.updateAddNew.bind(this),
          null,
          this.eavService.eavConfig,
        );

        // new in 11.11.03 - similar to contentTypeMask
        // not exactly sure what each piece does, must ask SPM to finalize
        this.prefillMask?.destroy();
        this.prefillMask = new FieldMaskService(
          settings.Prefill,
          this.group.controls,
          !this.useQuery ? this.fetchAvailableEntities.bind(this) : this.updateAddNew.bind(this),
          null,
          this.eavService.eavConfig,
        );

      })
    );

    if (!this.useQuery) {
      this.fetchAvailableEntities();
    } else {
      this.updateAddNew();
    }

    this.refreshOnChildClosed();
    this.buildTemplateVars();
  }

  ngOnDestroy() {
    this.settings$.complete();
    this.error$.complete();
    this.freeTextMode$.complete();
    this.disableAddNew$.complete();
    this.config.entityCache$.complete();
    this.contentTypeMask.destroy();
    this.prefillMask?.destroy();
    super.ngOnDestroy();
  }

  buildTemplateVars() {
    this.templateVars$ = combineLatest([
      combineLatest([this.label$, this.placeholder$, this.required$, this.invalid$, this.freeTextMode$, this.settings$]),
      combineLatest([this.selectedEntities$, this.config.entityCache$, this.disableAddNew$, this.isExpanded$, this.error$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [label, placeholder, required, invalid, freeTextMode, settings],
        [selectedEntities, availableEntities, disableAddNew, isExpanded, error],
        [disabled, showValidation],
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
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  toggleFreeTextMode() {
    this.freeTextMode$.next(!this.freeTextMode$.value);
  }

  /** Overridden in subclass */
  fetchAvailableEntities() {
    this.updateAddNew();
    const contentTypeName = this.contentTypeMask.resolve();
    const enableAddExisting = this.settings$.value.EnableAddExisting;
    // spm TODO: Should this work like this?
    // check if we should get all or only the selected ones...
    // if we can't add, then we only need one...
    const filterText = enableAddExisting ? null : this.control.value;
    this.entityService.getAvailableEntities(filterText, contentTypeName).subscribe(items => {
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
    let form: EditForm;
    if (entityGuid == null) {
      const contentTypeName = this.contentTypeMask.resolve();

      const prefill = this.getPrefill();
      form = {
        items: [{ ContentTypeName: contentTypeName, Prefill: prefill }],
      };
    } else {
      const entity = this.config.entityCache$.value.find(e => e.Value === entityGuid);
      form = {
        items: [{ EntityId: entity.Id }],
      };
    }
    this.editRoutingService.open(this.config.field.index, this.config.entity.entityGuid, form);
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
      const prefill = this.prefillMask.resolve();
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

  deleteEntity(props: DeleteEntityProps) {
    const entity = this.config.entityCache$.value.find(e => e.Value === props.entityGuid);
    const id = entity.Id.toString();
    const title = entity.Text;
    const contentType = this.contentTypeMask.resolve();

    const confirmed = confirm(this.translate.instant('Data.Delete.Question', { title, id }));
    if (!confirmed) { return; }

    this.snackBar.open('Deleting...');
    this.entityService.delete(contentType, id, false).subscribe({
      next: () => {
        this.snackBar.open('Deleted', null, { duration: 2000 });
        this.removeSelected(props.index);
        this.fetchAvailableEntities();
      },
      error: (err: HttpErrorResponse) => {
        this.snackBar.dismiss();
        if (!confirm(this.translate.instant('Data.Delete.Question', { title, id }))) { return; }
        this.snackBar.open('Deleting...');
        this.entityService.delete(contentType, id, true).subscribe(res2 => {
          this.snackBar.open('Deleted', null, { duration: 2000 });
          this.removeSelected(props.index);
          this.fetchAvailableEntities();
        });
      }
    });
  }

  private refreshOnChildClosed() {
    this.subscription.add(
      this.editRoutingService.childFormClosed().subscribe(() => {
        this.fetchAvailableEntities();
      })
    );
    this.subscription.add(
      this.editRoutingService.childFormResult(this.config.field.index, this.config.entity.entityGuid).subscribe(result => {
        const newItemGuid = Object.keys(result)[0];
        this.addSelected(newItemGuid);
      })
    );
  }

  private updateValue(action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes) {
    const valueArray: string[] = (typeof this.control.value === 'string')
      ? Helper.convertValueToArray(this.control.value, this.settings$.value.Separator)
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
      const valueString = Helper.convertArrayToString(valueArray, this.settings$.value.Separator);
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

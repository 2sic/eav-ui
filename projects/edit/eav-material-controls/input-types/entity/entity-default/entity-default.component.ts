import { moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldSettings } from '../../../../../edit-types';
import { EditForm } from '../../../../../ng-dialogs/src/app/shared/models/edit-form.model';
import { FieldMaskService } from '../../../../../shared/field-mask.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { Helper } from '../../../../shared/helpers/helper';
import { EntityInfo } from '../../../../shared/models/eav/entity-info';
import { EavService } from '../../../../shared/services/eav.service';
import { EditRoutingService } from '../../../../shared/services/edit-routing.service';
import { EntityService } from '../../../../shared/services/entity.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { ReorderIndexes } from '../entity-default-list/entity-default-list.models';
import { EntityDefaultSearchComponent } from '../entity-default-search/entity-default-search.component';
import { EntityDefaultLogic } from './entity-default-logic';
import { calculateSelectedEntities } from './entity-default.helpers';
import { DeleteEntityProps, SelectedEntity } from './entity-default.models';

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
      })
    );

    if (!this.useQuery) {
      this.fetchAvailableEntities();
    } else {
      this.updateAddNew();
    }

    this.refreshOnChildClosed();
  }

  ngOnDestroy() {
    this.settings$.complete();
    this.error$.complete();
    this.freeTextMode$.complete();
    this.disableAddNew$.complete();
    this.config.entityCache$.complete();
    this.contentTypeMask.destroy();
    super.ngOnDestroy();
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
      form = {
        items: [{ ContentTypeName: contentTypeName }],
      };
    } else {
      const entity = this.config.entityCache$.value.find(e => e.Value === entityGuid);
      form = {
        items: [{ EntityId: entity.Id }],
      };
    }
    this.editRoutingService.open(this.config.field.index, this.config.entity.entityGuid, form);
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

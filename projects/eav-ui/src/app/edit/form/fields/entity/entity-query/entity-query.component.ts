import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map } from 'rxjs';
import { EntityForPicker, EntityInfo } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldMask, GeneralHelpers } from '../../../../shared/helpers';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerSourceAdapterFactoryService } from '../../picker/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/picker-state-adapter-factory.service';
import { PickerComponent } from '../../picker/picker.component';
import { filterGuids } from '../../picker/picker.helpers';
import { EntityQueryLogic } from './entity-query-logic';
import { QueryEntity } from './entity-query.models';

@Component({
  selector: InputTypeConstants.EntityQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class EntityQueryComponent extends PickerComponent implements OnInit, OnDestroy {
  private paramsMask: FieldMask;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private queryService: QueryService,
    protected pickerSourceAdapterFactoryService: PickerSourceAdapterFactoryService,
    protected pickerStateAdapterFactoryService: PickerStateAdapterFactoryService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      entityCacheService,
      stringQueryCacheService,
    );
    EntityQueryLogic.importMe();
    this.isQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.createPickerAdapters();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.UrlParameters),
        distinctUntilChanged(),
      ).subscribe(urlParameters => {
        this.paramsMask?.destroy();
        this.paramsMask = new FieldMask(
          urlParameters,
          this.group.controls,
          () => { this.pickerSourceAdapter.availableEntities$.next(null); },
          null,
          this.eavService.eavConfig,
        );

        this.pickerSourceAdapter.availableEntities$.next(null);
      })
    );

    this.subscription.add(
      this.settings$.pipe(
        map(settings => ({
          Query: settings.Query,
          StreamName: settings.StreamName,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(() => {
        this.pickerSourceAdapter.availableEntities$.next(null);
      })
    );

    this.createTemplateVariables();
  }

  ngOnDestroy(): void {
    this.pickerSourceAdapter.destroy();
    this.pickerStateAdapter.destroy();
    this.paramsMask?.destroy();
    super.ngOnDestroy();
  }

  protected createPickerAdapters(): void {
    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.fillPickerSourceAdapter(
      this.editRoutingService,
      this.group,
      false,
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache)
    );

    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.fillPickerStateAdapter(
      this.editRoutingService,
      this.config,
      this.control,
      this.entitySearchComponent,
      this.settings$,
      this.controlStatus$,
      this.label$,
      this.placeholder$,
      this.required$,
    );

    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.getDataFromPickerStateAdapter(
      this.pickerSourceAdapter,
      this.pickerStateAdapter
    );

    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.getDataFromPickerSourceAdapter(
      this.pickerStateAdapter,
      this.pickerSourceAdapter
    );

    this.pickerSourceAdapterFactoryService.init(this.pickerSourceAdapter);
    this.pickerStateAdapterFactoryService.init(this.pickerStateAdapter);
  }

  /** WARNING! Overrides function in superclass */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.pickerSourceAdapter.availableEntities$.next(null);
    }

    const settings = this.settings$.value;
    if (!settings.Query) {
      alert(`No query defined for ${this.config.fieldName} - can't load entities`);
      this.pickerSourceAdapter.availableEntities$.next([]);
      return;
    }

    const streamName = settings.StreamName;
    const queryUrl = settings.Query.includes('/') ? settings.Query : `${settings.Query}/${streamName}`;
    const params = this.paramsMask.resolve();
    const entitiesFilter: string[] = clearAvailableEntitiesAndOnlyUpdateCache && !this.isStringQuery
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;

    this.queryService.getAvailableEntities(queryUrl, true, params, entitiesFilter).subscribe({
      next: (data) => {
        if (!data) {
          this.pickerStateAdapter.error$.next(this.translate.instant('Fields.EntityQuery.QueryError'));
          return;
        }
        if (!data[streamName]) {
          this.pickerStateAdapter.error$.next(this.translate.instant('Fields.EntityQuery.QueryStreamNotFound') + ' ' + streamName);
          return;
        }
        const items: EntityInfo[] = data[streamName].map(entity => this.queryEntityMapping(entity));
        if (!this.isStringQuery) {
          const entities = this.setDisableEdit(items);
          this.entityCacheService.loadEntities(entities);
        } else {
          // If the data belongs to another app, mark it as not editable
          const entities = this.setDisableEdit(data[streamName]);
          this.stringQueryCacheService.loadEntities(this.config.entityGuid, this.config.fieldName, entities);
        }
        if (!clearAvailableEntitiesAndOnlyUpdateCache) {
          this.pickerSourceAdapter.availableEntities$.next(items);
        }
      },
      error: (error) => {
        console.error(error);
        console.error(`${this.translate.instant('Fields.EntityQuery.QueryError')} - ${error.data}`);
      }
    });
  }

  private setDisableEdit<T extends EntityForPicker>(queryEntities: T[]): T[] {
    if (queryEntities)
      queryEntities.forEach(e => e._disableEdit = e.AppId != null && e.AppId.toString() !== this.eavService.eavConfig.appId);
    // console.log('2dm queryEntities', queryEntities, this.eavService.eavConfig.appId);
    return queryEntities;
  }

  /** WARNING! Overridden in subclass */
  queryEntityMapping(entity: QueryEntity): EntityInfo {
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity.Guid,
      Text: entity.Title,
    };
    return entityInfo;
  }
}

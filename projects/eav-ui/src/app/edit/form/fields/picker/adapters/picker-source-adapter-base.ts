import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeleteEntityProps } from '../picker.models';
import { PickerSourceAdapter } from './picker-source-adapter';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { TranslateService } from '@ngx-translate/core';

export abstract class PickerSourceAdapterBase extends ServiceBase implements PickerSourceAdapter {
  public availableItems$ = new BehaviorSubject<PickerItem[]>(null);
  public editEntityGuid$ = new BehaviorSubject<string>(null);

  public deleteCallback: (props: DeleteEntityProps) => void;

  constructor(logSpecs: EavLogger) {
    super(logSpecs);
  }

  protected setup(deleteCallback: (props: DeleteEntityProps) => void): void { 
    this.deleteCallback = deleteCallback;
  }

  init(callerName: string) {
    this.log.add(`init(${callerName})`);
  }

  onAfterViewInit(): void { }

  destroy() {
    this.availableItems$.complete();
    this.editEntityGuid$.complete();
    super.destroy();
  }

  getDataFromSource(): Observable<PickerItem[]> { return null; }

  abstract setPrefetchData(missingData: string[]): void;

  abstract forceReloadData(missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;

  abstract fetchItems(): void;
}

/** Generate a placeholder item to show in the menu in case of error or loading */
export function placeholderPickerItem(translate: TranslateService, i18nLabel: string, suffix?: string): PickerItem {
  const item: PickerItem = {
    Text: translate.instant(i18nLabel) + (suffix ?? ''),
    Value: null,
    _disableSelect: true,
    _disableDelete: true,
    _disableEdit: true,
  };
  return item;
}
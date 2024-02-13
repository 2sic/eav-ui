import { PickerItem } from 'projects/edit-types';
import { BehaviorSubject, Observable } from 'rxjs';
import { DeleteEntityProps } from '../picker.models';
import { PickerSourceAdapter } from './picker-source-adapter';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

export abstract class PickerSourceAdapterBase extends ServiceBase implements PickerSourceAdapter {
  public availableItems$ = new BehaviorSubject<PickerItem[]>(null);
  public editEntityGuid$ = new BehaviorSubject<string>(null);

  constructor(
    public deleteCallback: (props: DeleteEntityProps) => void,
    logSpecs: EavLogger,
  ) {
    super(logSpecs);
  }

  init(callerName: string) {
    this.logger.add(`init(${callerName})`);
  }

  onAfterViewInit(): void { }

  destroy() {
    this.availableItems$.complete();
    this.editEntityGuid$.complete();
    super.destroy();
  }

  getDataFromSource(): Observable<PickerItem[]> { return null; }

  abstract setPrefetchData(missingData: string[]): void;

  abstract setOverrideData(missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;

  abstract fetchItems(): void;
}

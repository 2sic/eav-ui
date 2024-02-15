import { PickerItem } from 'projects/edit-types/src/EntityInfo';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GeneralHelpers } from '../../../../shared/helpers';
import { FieldSettings } from 'projects/edit-types';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

export abstract class DataSourceBase extends ServiceBase {
  public data$: Observable<PickerItem[]>;
  public loading$: Observable<boolean>;

  protected getAll$ = new BehaviorSubject<boolean>(false);
  protected entityGuids$ = new BehaviorSubject<string[]>([]);
  protected prefetchEntityGuids$ = new BehaviorSubject<string[]>([]);
  protected subscriptions = new Subscription();

  constructor(
    protected settings$: BehaviorSubject<FieldSettings>,
    logSpecs: EavLogger,
  ) {
    super(logSpecs);
  }

  destroy(): void { 
    this.prefetchEntityGuids$.complete();
    this.entityGuids$.complete();
    this.getAll$.complete();
    this.subscriptions.unsubscribe();
  }

  getAll(): void {
    this.getAll$.next(true);
  }

  forceLoadGuids(entityGuids: string[]): void {
    this.entityGuids$.next(entityGuids);
  }

  prefetchEntityGuids(entityGuids: string[]): void {
    const guids = entityGuids.filter(GeneralHelpers.distinct);
    this.prefetchEntityGuids$.next(guids);
  }

  /** fill additional properties */
  protected fillEntityInfoMoreFields(entity: QueryEntity): PickerItem {
    // Check if we have masks, if yes
    const masks = this.getMasks();

    // Figure out Title Value if we don't use masks
    const tempOfTitleKey = entity[masks.label];
    let valueOfTitleKey = tempOfTitleKey ? `${tempOfTitleKey}` : tempOfTitleKey;
    valueOfTitleKey = !!valueOfTitleKey ? valueOfTitleKey : entity.Title;

    // Figure out Value to store if we don't use masks
    const tempOfValueKey = entity[masks.value];
    let valueOfValueKey = tempOfValueKey ? `${tempOfValueKey}` : tempOfValueKey;
    valueOfValueKey = !!valueOfValueKey ? valueOfValueKey : entity.Guid;

    // If we don't have masks, we are done
    if (!masks.hasMask)
      return {
        Id: entity.Id,
        data: entity,
        Value: valueOfValueKey,
        Text: valueOfTitleKey,
        _tooltip: masks.tooltip,
        _information: masks.info,
        _helpLink: masks.link,
      };

    // Prepare the masks
    let tooltip = masks.tooltip;
    let information = masks.info;
    let helpLink = masks.link;
    let title = masks.label;

    Object.keys(entity).forEach(key => {
      // must check for null and use '' instead
      const value = entity[key] ?? '';

      // replace all occurrences of [Item:Key] with value - should be case insensitive
      const search = new RegExp(`\\[Item:${key}\\]`, 'gi');
      
      tooltip = tooltip.replace(search, value);
      information = information.replace(search, value);
      helpLink = helpLink.replace(search, value);
      title = title.replace(search, value);
    });

    // If the original was not a mask, look up the field
    if (!masks.label.includes('['))
      title = valueOfTitleKey;

    return {
      Id: entity.Id,
      data: entity,
      Value: valueOfValueKey,
      Text: title,
      _tooltip: tooltip,
      _information: information,
      _helpLink: helpLink,
    } as PickerItem;
  }

  private getMasks() {
    if (!!this.masks) return this.masks;
    const settings = this.settings$.value;
    const tooltipMask = !!settings.ItemTooltip ? this.cleanStringFromWysiwyg(settings.ItemTooltip) : '';
    const infoMask = !!settings.ItemInformation ? this.cleanStringFromWysiwyg(settings.ItemInformation) : '';
    const linkMask = settings.ItemLink ?? '';
    const labelMask = settings.Label ?? '';
    const valueMask = settings.Value ?? '';
    const hasMask = (tooltipMask + infoMask + linkMask + labelMask).includes('[');
    return this.masks = {
      hasMask,
      tooltip: tooltipMask,
      info: infoMask,
      link: linkMask,
      label: labelMask,
      value: valueMask,
    }
  }

  private masks: {
    hasMask: boolean;
    tooltip: string;
    info: string;
    link: string;
    label: string;
    value: string;
  };

  /** remove HTML tags that come from WYSIWYG */
  protected cleanStringFromWysiwyg(wysiwygString: string): string {
    const div = document.createElement("div");
    div.innerHTML = wysiwygString ?? '';
    return div.innerText || '';
  }

  protected calculateMoreFields(): string {
    const settings = this.settings$.value;
    const treeConfig = settings.PickerTreeConfiguration;
    const moreFields = settings.MoreFields?.split(',') ?? [];
    const queryFields = [settings.Value, settings.Label];
    const treeFields = [
      treeConfig?.TreeChildIdField,
      treeConfig?.TreeParentIdField,
      treeConfig?.TreeChildParentRefField,
      treeConfig?.TreeParentChildRefField,
    ];
    const allFields = [...['Title', 'Id', 'Guid'], ...moreFields, ...queryFields, ...treeFields].filter(x => x?.length > 0).filter(GeneralHelpers.distinct);
    return allFields.join(',');
  }
}
import { FieldSettings, PickerItem } from 'projects/edit-types';
import { DataSourceHelpers } from './data-source-helpers';
import { DataSourceMasks } from './data-source-masks.model';
import { ServiceBase } from 'projects/eav-ui/src/app/shared/services/service-base';
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';

const logThis = false;
/**
 * Helper class to process masks for a DataSource.
 * Masks are strings with placeholders, vs. just the name of the field to show.
 */
export class DataSourceMasksHelper extends ServiceBase {
  constructor(private settings: FieldSettings, parentLog: EavLogger, enableLog?: boolean) {
    super(new EavLogger('DataSourceMasksHelper', enableLog ?? parentLog.enableChildren));
    this.log.a('constructor - settings', [settings]);
  }

  private helpers = new DataSourceHelpers();

  private masks: DataSourceMasks;

  /** Convert an Entity data to Picker-Item, processing any masks */
  entity2PickerItem({ entity, streamName, mustUseGuid }
    : { entity: EntityBasicWithFields; streamName: string | undefined; mustUseGuid: boolean; }
  ): PickerItem {
    // Check if we have masks, if yes
    const masks = this.getMasks();

    // Figure out Value to use if we don't use masks - fallback is to use the Guid
    const maybeValue = entity[masks.value];
    let valueFieldValue = maybeValue ? `${maybeValue}` : maybeValue;
    valueFieldValue = !!valueFieldValue ? valueFieldValue : entity.Guid;
    if (mustUseGuid)
      valueFieldValue = entity.Guid; // If we must use the Guid, use the Guid

    // Figure out Title Value if we don't use masks - fallback is to use the title, or the value with asterisk
    const maybeTitle = entity[masks.label];
    let titleFieldValue = maybeTitle ? `${maybeTitle}` : maybeTitle;
    titleFieldValue = !!titleFieldValue
      ? titleFieldValue
      : entity.Title !== ''
        ? entity.Title
        : valueFieldValue + ' *'; // If there is not even a title, use the value with asterisk

    // If we don't have masks, we are done
    if (!masks.hasPlaceholders) {
      const result: PickerItem = {
        id: entity.Id,
        data: entity,
        value: valueFieldValue,
        label: titleFieldValue,
        tooltip: masks.tooltip,
        infoBox: masks.info,
        helpLink: masks.link,
        sourceStreamName: streamName ?? null,
      };
      this.log.a('entity2PickerItem - no masks', [result]);
      return result;
    }

    // Prepare the masks
    const { title, tooltip, information, helpLink } = this.parseMasks(masks, entity);

    // If the original was not a mask, look up the field
    const finalTitle = masks.label.includes('[') ? title : titleFieldValue;

    return {
      id: entity.Id,
      data: entity,
      value: valueFieldValue,
      label: finalTitle,
      tooltip: tooltip,
      infoBox: information,
      helpLink: helpLink,
      sourceStreamName: streamName ?? null,
    } as PickerItem;
  }

  /** Process all placeholders in all masks to get tooltip, info, link and title */
  private parseMasks(masks: DataSourceMasks, data: Record<string, any>) {
    let tooltip = masks.tooltip;
    let information = masks.info;
    let helpLink = masks.link;
    let title = masks.label;

    Object.keys(data).forEach(key => {
      // must check for null and use '' instead
      const value = data[key] ?? '';

      // replace all occurrences of [Item:Key] with value - should be case insensitive
      const search = new RegExp(`\\[Item:${key}\\]`, 'gi');

      tooltip = tooltip.replace(search, value);
      information = information.replace(search, value);
      helpLink = helpLink.replace(search, value);
      title = title.replace(search, value);
    });
    return { title, tooltip, information, helpLink };
  }

  /** Get the mask - if possibly from current objects cache */
  public getMasks() {
    if (!!this.masks) return this.masks;
    this.masks = this.buildMasks(this.settings);
    this.log.a('getMasks', [this.masks]);
    return this.masks;
  }

  /** modify/patch the current objects mask */
  public patchMasks(patch: Partial<DataSourceMasks>) {
    this.masks = { ...this.getMasks(), ...patch };
    this.log.a('patchMasks', [this.masks]);
  }

  private buildMasks(settings: FieldSettings): DataSourceMasks {
    this.log.a('buildMasks settings', [settings]);
    const tooltipMask = !!settings.ItemTooltip ? this.helpers.stripHtml(settings.ItemTooltip) : '';
    const infoMask = !!settings.ItemInformation ? this.helpers.stripHtml(settings.ItemInformation) : '';
    const linkMask = settings.ItemLink ?? '';
    const labelMask = settings.Label ?? '';
    const valueMask = settings.Value ?? '';
    const hasPlaceholders = (tooltipMask + infoMask + linkMask + labelMask).includes('[');
    const result: DataSourceMasks = {
      hasPlaceholders,
      tooltip: tooltipMask,
      info: infoMask,
      link: linkMask,
      label: labelMask,
      value: valueMask,
    };
    this.log.a('buildMasks result', [result]);
    return result;
  }
}

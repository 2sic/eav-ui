import { FieldSettings, PickerItem } from 'projects/edit-types';
import { DataSourceHelpers } from './data-source-helpers';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { DataSourceMasks } from './data-source-masks';

/**
 * Helper class to process masks for a DataSource.
 * Masks are strings with placeholders, vs. just the name of the field to show.
 */
export class DataSourceMasksHelper {
  constructor(private settings: FieldSettings) { }

  private helpers = new DataSourceHelpers();

  private masks: DataSourceMasks;

  /** Convert an Entity data to Picker-Item, processing any masks */
  entity2PickerItem(entity: QueryEntity, streamName?: string): PickerItem {
    // Check if we have masks, if yes
    const masks = this.getMasks(this.settings);

    // Figure out Value to use if we don't use masks - fallback is to use the Guid
    const maybeValue = entity[masks.value];
    let valueFieldValue = maybeValue ? `${maybeValue}` : maybeValue;
    valueFieldValue = !!valueFieldValue ? valueFieldValue : entity.Guid;

    // Figure out Title Value if we don't use masks - fallback is to use the title, or the value with asterisk
    const maybeTitle = entity[masks.label];
    let titleFieldValue = maybeTitle ? `${maybeTitle}` : maybeTitle;
    titleFieldValue = !!titleFieldValue
      ? titleFieldValue
      : entity.Title !== ''
        ? entity.Title
        : valueFieldValue + ' *'; // If there is not even a title, use the value with asterisk

    // If we don't have masks, we are done
    if (!masks.hasMask)
      return {
        Id: entity.Id,
        data: entity,
        Value: valueFieldValue,
        Text: titleFieldValue,
        _tooltip: masks.tooltip,
        _information: masks.info,
        _helpLink: masks.link,
        _streamName: streamName ?? null,
      };

    // Prepare the masks
    const { title, tooltip, information, helpLink } = this.parseMasks(masks, entity);

    // If the original was not a mask, look up the field
    const finalTitle = masks.label.includes('[') ? title : titleFieldValue;

    return {
      Id: entity.Id,
      data: entity,
      Value: valueFieldValue,
      Text: finalTitle,
      _tooltip: tooltip,
      _information: information,
      _helpLink: helpLink,
      _streamName: streamName ?? null,
    } as PickerItem;
  }

  /** Process all placeholders in all masks to get tooltip, info, link and title */
  private parseMasks(masks: DataSourceMasks, entity: QueryEntity) {
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
    return { title, tooltip, information, helpLink };
  }

  getMasks(settings: FieldSettings) {
    if (!!this.masks) return this.masks;
    return this.masks = this.buildMasks(settings);
  }

  private buildMasks(settings: FieldSettings): DataSourceMasks {
    const tooltipMask = !!settings.ItemTooltip ? this.helpers.cleanStringFromWysiwyg(settings.ItemTooltip) : '';
    const infoMask = !!settings.ItemInformation ? this.helpers.cleanStringFromWysiwyg(settings.ItemInformation) : '';
    const linkMask = settings.ItemLink ?? '';
    const labelMask = settings.Label ?? '';
    const valueMask = settings.Value ?? '';
    const hasMask = (tooltipMask + infoMask + linkMask + labelMask).includes('[');
    return {
      hasMask,
      tooltip: tooltipMask,
      info: infoMask,
      link: linkMask,
      label: labelMask,
      value: valueMask,
    } as DataSourceMasks;
  }
}

import { DataSourceHelpers } from './data-source-helpers';
import { DataSourceMasks } from './data-source-masks.model';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';
import { EntityBasicWithFields } from '../../../../shared/models/entity-basic';
import { classLog } from '../../../../shared/logging/logging';

const logSpecs = {
  all: true,
  entity2PickerItem: false,
  getMasks: false,
  patchMasks: false,
  parseMasks: false,
  buildMasks: false,
}

/**
 * Helper class to process masks for a DataSource.
 * Masks are strings with placeholders, vs. just the name of the field to show.
 */
export class DataSourceMasksHelper {
  
  log = classLog({DataSourceMasksHelper}, logSpecs);
  
  constructor(private settings: DataSourceMaskSettings, parentLog: { enableChildren: boolean }, enableLog?: boolean) {
    this.log.forceEnable(enableLog ?? parentLog.enableChildren ?? false);
    this.log.a('constructor - settings', { settings });
  }

  #helpers = new DataSourceHelpers();

  #masks: DataSourceMasks;

  /** Convert an Entity data to Picker-Item, processing any masks */
  entity2PickerItem({ entity, streamName, mustUseGuid }
    : { entity: EntityBasicWithFields; streamName: string | undefined; mustUseGuid: boolean; }
  ): PickerItem {
    const l = this.log.fnIf('entity2PickerItem', { entity, streamName, mustUseGuid });
    // Check if we have masks, if yes
    const masks = this.getMasks();

    // Figure out Value to use if we don't use masks - fallback is to use the Guid
    const value = (() => {
      if (mustUseGuid) return entity.Guid;
      const maybe = entity[masks.value];
      // the value could be an empty string (pickers); not sure if it can be null though
      return maybe !== undefined ? `${maybe}` : entity.Guid;
    })();

    // Figure out Title Value if we don't use masks - fallback is to use the title, or the value with asterisk
    const label = (() => {
      const maybeTitle = entity[masks.label];
      return maybeTitle ? `${maybeTitle}` : entity.Title ? `${entity.Title}` : `${value} *`; // If there is no title, use value with '*'
    })();

    // If we don't have masks, we are done
    if (!masks.hasPlaceholders) {
      const result: PickerItem = {
        id: entity.Id,
        data: entity,
        value,
        label,
        tooltip: masks.tooltip,
        info: masks.info,
        link: masks.link,
        sourceStreamName: streamName ?? null,
      };
      return l.r(result, 'no masks');
    }

    // Prepare the masks
    const { title, tooltip, info, helpLink } = this.#parseMasks(masks, entity);

    // If the original was not a mask, look up the field
    const finalLabel = masks.label.includes('[') ? title : label;

    return l.r({
      id: entity.Id,
      data: entity,
      value,
      label: finalLabel,
      tooltip,
      info: info,
      link: helpLink,
      sourceStreamName: streamName ?? null,
    } as PickerItem, 'with masks');
  }

  /** Process all placeholders in all masks to get tooltip, info, link and title */
  #parseMasks(masks: DataSourceMasks, data: Record<string, any>) {
    const l = this.log.fnIf('parseMasks', { masks, data });
    let tooltip = masks.tooltip;
    let info = masks.info;
    let helpLink = masks.link;
    let title = masks.label;

    Object.keys(data).forEach(key => {
      // must check for null and use '' instead
      const value = data[key] ?? '';

      // replace all occurrences of [Item:Key] with value - should be case insensitive
      const search = new RegExp(`\\[Item:${key}\\]`, 'gi');

      tooltip = tooltip.replace(search, value);
      info = info.replace(search, value);
      helpLink = helpLink.replace(search, value);
      title = title.replace(search, value);
    });
    return l.r({ title, tooltip, info, helpLink });
  }

  /** Get the mask - if possibly from current objects cache */
  public getMasks() {
    if (!!this.#masks) return this.#masks;
    this.#masks = this.#buildMasks();
    this.log.aIf('getMasks', { masks: this.#masks });
    return this.#masks;
  }

  /** modify/patch the current objects mask */
  public patchMasks(patch: Partial<DataSourceMasks>) {
    this.#masks = { ...this.getMasks(), ...patch };
    this.log.aIf('patchMasks', { masks: this.#masks });
  }

  #buildMasks(): DataSourceMasks {
    const settings = this.settings;
    const l = this.log.fnIf('buildMasks', { settings });
    const tooltipMask = !!settings.ItemTooltip ? this.#helpers.stripHtml(settings.ItemTooltip) : '';
    const infoMask = !!settings.ItemInformation ? this.#helpers.stripHtml(settings.ItemInformation) : '';
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
    return l.r(result, 'result');
  }

  static maskSettings(settings: FieldSettings): DataSourceMaskSettings {
    return {
      ItemTooltip: settings.ItemTooltip,
      ItemInformation: settings.ItemInformation,
      ItemLink: settings.ItemLink,
      Label: settings.Label,
      Value: settings.Value,
    };
  }
}

interface DataSourceMaskSettings {
  ItemTooltip: string;
  ItemInformation: string;
  ItemLink: string;
  Label: string;
  Value: string;
}
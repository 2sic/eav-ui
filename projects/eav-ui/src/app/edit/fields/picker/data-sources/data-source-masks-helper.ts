import { EntityLight } from '../../../../../../../edit-types/src/EntityLight';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesService } from '../../../../features/features.service';
import { classLog } from '../../../../shared/logging';
import { FormConfigService } from '../../../form/form-config.service';
import { PickerItem } from '../models/picker-item.model';
import { DataSourceHelpers } from './data-source-helpers';
import { DataSourceMasks } from './data-source-masks.model';

const logSpecs = {
  all: false,
  data2PickerItem: false,
  getMasks: false,
  patchMasks: false,
  parseMasks: false,
  buildMasks: false,
}

type MaskedPickerParts = Pick<PickerItem, 'label' | 'tooltip' | 'info' | 'link' | 'previewValue'>;

/**
 * Helper class to process masks for a DataSource.
 * Masks are strings with placeholders, vs. just the name of the field to show.
 */
export class DataSourceMasksHelper {

  log = classLog({ DataSourceMasksHelper }, logSpecs);

  constructor(
    private name: string,
    private settings: DataSourceMaskSettings,
    features: FeaturesService,
    private formConfig: FormConfigService,
    parentLog: { enableChildren: boolean }, enableLog?: boolean
  ) {
    this.log.forceEnable(enableLog ?? parentLog.enableChildren ?? false);
    this.#featInfoEnabled = features.allowUse[FeatureNames.PickerUiMoreInfo]();
    this.#isDeveloper = formConfig.config.dialogContext.User?.IsSystemAdmin;
    this.log.a('constructor - settings', { settings, infoEnabled: this.#featInfoEnabled });
  }

  #featInfoEnabled = false;
  #featInfoWarned = false;
  #isDeveloper = false;

  #helpers = new DataSourceHelpers();

  #masks: DataSourceMasks;

  /** Convert an Entity data to Picker-Item, processing any masks */
  data2PickerItem({ entity, streamName, valueMustUseGuid, valueDefaultsToGuid = false }
    : { entity: EntityLight; streamName: string | undefined; valueMustUseGuid: boolean; valueDefaultsToGuid?: boolean; }
  ): PickerItem {

    const l = this.log.fnIf('data2PickerItem', { entity, streamName, valueMustUseGuid });
    // Check if we have masks, if yes
    const masks = this.#getMasks();

    // Figure out Value to use if we don't use masks - fallback is to use the Guid
    const value = (() => {
      if (valueMustUseGuid || (valueDefaultsToGuid && !masks.value))
        return entity.Guid;
      if (entity[masks.value] === undefined)
        return entity.Value;
      const maybe = entity[masks.value];
      // the value could be an empty string (pickers); not sure if it can be null though
      return maybe !== undefined ? `${maybe}` : entity.Guid;
    })();

    // Figure out Title Value if we don't use masks - fallback is to use the title, or the value with asterisk
    const label = (() => {
      const maybeTitle = entity[masks.label];
      return maybeTitle ? `${maybeTitle}` : entity.Title ? `${entity.Title}` : `${value}`; // If there is no title, use value with '*'
    })();

    const previewValue = (() => {
      const maybePreview = entity[masks.previewValue];
      if (maybePreview) return maybePreview;
      return value;
    })();

    l.a('debug values', { masks, value, label, previewValue, hasPlaceholders: masks.hasPlaceholders });

    // If we don't have masks, we are done
    if (!masks.hasPlaceholders) {
      const result: PickerItem = {
        id: entity.Id,
        data: entity,
        value,
        previewValue,
        label,
        tooltip: masks.tooltip,
        info: masks.info,
        link: masks.link,
        sourceStreamName: streamName ?? null,
        rules: entity["Rules"],
      };
      return l.r(result, 'no masks');
    }

    // Prepare the masks
    const fromMasks = this.#parseMasks(masks, entity);

    // If the original was not a mask, look up the field
    const finalLabel = masks.label.includes('[') ? fromMasks.label : label;

    return l.r({
      id: entity.Id,
      data: entity,
      ...fromMasks,
      value,
      label: finalLabel,
      sourceStreamName: streamName ?? null,
      rules: entity["Rules"],
    } satisfies PickerItem, 'with masks');
  }

  /** Process all placeholders in all masks to get tooltip, info, link and title */
  #parseMasks(masks: DataSourceMasks, data: Record<string, any>): MaskedPickerParts {
    const l = this.log.fnIf('parseMasks', { masks, data });
    let label = masks.label;

    // If we have placeholders, but the feature is not enabled, warn about it
    if (!this.#featInfoWarned && !this.#featInfoEnabled && `${masks.tooltip}${masks.info}${masks.link}`.length > 0) {
      const msgAddOn = this.#isDeveloper
        ? `It is enabled for developers, but will be disabled for normal users until it's licensed.`
        : '';
      this.#featInfoWarned = true;
    }
    const useInfos = this.#featInfoEnabled || this.#isDeveloper;
    let tooltip = useInfos ? masks.tooltip : '';
    let info = useInfos ? masks.info : '';
    let link = useInfos ? masks.link : '';
    let previewValue = masks.previewValue;

    Object.keys(data).forEach(key => {
      // must check for null and use '' instead
      const valueItem = data[key] ?? '';

      // replace all occurrences of [Item:Key] with value - should be case insensitive
      const search = new RegExp(`\\[Item:${key}\\]`, 'gi');

      if (previewValue.includes("App:Path")) {
        // var x = ScriptsLoaderService.resolveUrlTokens(previewValue, this.formConfig.config)
        const portalRoot = (this.formConfig.config.portalRoot).replace(/\/$/, '');
        const appUrl = portalRoot + this.formConfig.config.appRoot;
        previewValue = previewValue.replace("[App:Path]", appUrl);
      }

      tooltip = tooltip.replace(search, valueItem);
      info = info.replace(search, valueItem);
      link = link.replace(search, valueItem);
      label = label.replace(search, valueItem);
      previewValue = previewValue.replace(search, valueItem);
    });

    return l.r({ label, tooltip, info, link, previewValue } satisfies MaskedPickerParts, 'result');
  }

  /** Get the mask - if possibly from current objects cache */
  #getMasks() {
    if (!!this.#masks) return this.#masks;
    this.#masks = this.#buildMasks();
    this.log.aIf('getMasks', { masks: this.#masks });
    return this.#masks;
  }

  #buildMasks(): DataSourceMasks {
    const settings = this.settings;
    const l = this.log.fnIf('buildMasks', { settings });
    // Figure out the masks
    const tooltip = !!settings.ItemTooltip ? this.#helpers.stripHtml(settings.ItemTooltip) : '';
    const info = !!settings.ItemInformation ? this.#helpers.stripHtml(settings.ItemInformation) : '';
    const link = settings.ItemLink ?? '';
    const label = settings.Label ?? '';
    const value = settings.Value ?? '';
    const previewValue = settings.PreviewValue ?? '';
    const hasPlaceholders = (tooltip + info + link + label + previewValue).includes('[');
    const result: DataSourceMasks = {
      hasPlaceholders,
      tooltip,
      info,
      link,
      label,
      value,
      previewValue,
    };

    return l.r(result, 'result');
  }

}

interface DataSourceMaskSettings {
  ItemTooltip: string;
  ItemInformation: string;
  ItemLink: string;
  Label: string;
  Value: string;
  PreviewValue: string;
}

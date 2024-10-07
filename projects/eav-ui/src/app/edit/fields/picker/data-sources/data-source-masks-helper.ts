import { FieldSettingsWithPickerSource } from '../../../../../../../edit-types/src/PickerSources';
import { FeatureNames } from '../../../../features/feature-names';
import { FeaturesScopedService } from '../../../../features/features-scoped.service';
import { classLog } from '../../../../shared/logging';
import { EntityLight } from '../../../../shared/models/entity-basic';
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

/**
 * Helper class to process masks for a DataSource.
 * Masks are strings with placeholders, vs. just the name of the field to show.
 */
export class DataSourceMasksHelper {

  log = classLog({DataSourceMasksHelper}, logSpecs);

  constructor(
    private name: string,
    private settings: DataSourceMaskSettings,
    features: FeaturesScopedService,
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
  data2PickerItem({ entity, streamName, valueMustUseGuid }
    : { entity: EntityLight; streamName: string | undefined; valueMustUseGuid: boolean; }
  ): PickerItem {

    const l = this.log.fnIf('data2PickerItem', { entity, streamName, valueMustUseGuid });
    // Check if we have masks, if yes
    const masks = this.#getMasks();

    // Figure out Value to use if we don't use masks - fallback is to use the Guid
    const value = (() => {
      if (valueMustUseGuid) return entity.Guid;

      // @2dg, not tested in all use case
      if (entity[masks.value] === undefined) return entity.Value;

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

    // If we don't have masks, we are done
    if (!masks.hasPlaceholders) {
      const result: PickerItem = {
        id: entity.Id,
        entity: entity,
        value,
        previewValue,
        label,
        tooltip: masks.tooltip,
        info: masks.info,
        link: masks.link,
        sourceStreamName: streamName ?? null,
      };
      return l.r(result, 'no masks');
    }

    // Prepare the masks
    const fromMasks = this.#parseMasks(masks, entity);

    // If the original was not a mask, look up the field
    const finalLabel = masks.label.includes('[') ? fromMasks.label : label;

    return l.r({
      id: entity.Id,
      entity: entity,
      ...fromMasks,
      value,
      label: finalLabel,
      sourceStreamName: streamName ?? null,
    } as PickerItem, 'with masks');
  }

  /** Process all placeholders in all masks to get tooltip, info, link and title */
  #parseMasks(masks: DataSourceMasks, data: Record<string, any>): Partial<PickerItem> {
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
    // let value = masks.value; // @2dg remove

    Object.keys(data).forEach(key => {
      // must check for null and use '' instead
      const valueItem = data[key] ?? '';

      // replace all occurrences of [Item:Key] with value - should be case insensitive
      const search = new RegExp(`\\[Item:${key}\\]`, 'gi');

      // TODO:: @2dm, check if this are the correct or use
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
      // value = valueItem.replace(search, valueItem); // @2dg remove
    });

    return l.r({ label, tooltip, info, link, previewValue } satisfies Partial<PickerItem>, 'result');
  }

  /** Get the mask - if possibly from current objects cache */
  #getMasks() {
    if (!!this.#masks) return this.#masks;
    this.#masks = this.#buildMasks();
    this.log.aIf('getMasks', { masks: this.#masks });
    return this.#masks;
  }

  /** modify/patch the current objects mask */
  public patchMasks(patch: Partial<DataSourceMasks>) {
    this.#masks = { ...this.#getMasks(), ...patch };
    this.log.aIf('patchMasks', { masks: this.#masks });
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

  static maskSettings(settings: FieldSettingsWithPickerSource): DataSourceMaskSettings {
    return {
      ItemTooltip: settings.ItemTooltip,
      ItemInformation: settings.ItemInformation,
      ItemLink: settings.ItemLink,
      Label: settings.Label,
      Value: settings.Value,
      PreviewValue: settings.PreviewValue,
    };
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

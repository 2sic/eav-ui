import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog, ClassLogger } from '../../../../../../../shared/logging';
import { FieldMask } from '../../../shared/helpers/field-mask.helper';
import { DataSourceQuery } from "../data-sources/data-source-query";
import { PickerItemFactory } from '../models/picker-item.model';
import { DataAdapterBase } from './data-adapter-base';
import { DataAdapterEntityBase, logSpecsDataAdapterEntityBase } from "./data-adapter-entity-base";

@Injectable()
export class DataAdapterQuery extends DataAdapterEntityBase {

  log = classLog({DataAdapterQuery}, logSpecsDataAdapterEntityBase) as ClassLogger<typeof DataAdapterBase.logSpecs> & ClassLogger<typeof logSpecsDataAdapterEntityBase>;

  protected dataSourceRaw = transient(DataSourceQuery);

  constructor() { super(); }

  /**
   * Url Parameters - often mask - from settings
   * This is a text or mask containing all query parameters.
   * Since it's a mask, it can also contain values from the current item
   */
  #paramsMaskLazy = transient(FieldMask).initSignal(this.log.name, this.fieldState.settingExt('UrlParameters'));

  override syncParams(): void {
    this.dataSourceRaw.setParams(this.#paramsMaskLazy?.result());
  }

  fetchItems(): void {
    const l = this.log.fnIfInFields('fetchItems', this.name);
    this.syncParams();
    // note: it's kind of hard to produce this error, because the config won't save without a query
    if (!this.fieldState.settings().Query) {
      const errors = [PickerItemFactory.placeholder(this.translate, 'Fields.Picker.QueryNotDefined')];
      this.errorOptions.set(errors);
      return;
    }
    this.dataSourceRaw.triggerGetAll();
  }

}

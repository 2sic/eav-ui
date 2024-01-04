import { FieldSettings, UiPickerModeTree } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';
import { PickerSources } from '../../picker/constants/picker-source.constants';

export class EntityPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.WIPEntityPicker;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const fs: FieldSettings = { ...settings };

    /** Entity Default logic */
    fs.EntityType ??= '';
    fs.AllowMultiValue ??= false;
    fs.EnableEdit ??= true;
    fs.EnableCreate ??= true;
    fs.EnableAddExisting ??= true;
    fs.EnableRemove ??= true;
    fs.EnableDelete ??= false;
    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // fixedSettings.IncludeParentApps ??= false;

    fs.Information ??= '';
    fs.Tooltip ??= '';
    fs.MoreFields ??= '';
    fs.Label ??= '';

    if (tools.eavConfig.overrideEditRestrictions && tools.debug) {
      // tslint:disable-next-line: max-line-length
      console.log('SystemAdmin + Debug: Overriding edit restrictions for field \'' + settings.Name + '\' (EntityType: \'' + settings.EntityType + '\').');
      fs.EnableEdit = true;
      fs.EnableCreate = true;
      fs.EnableAddExisting = true;
      fs.EnableRemove = true;
      fs.EnableDelete = true;
    }

    const dataSources = tools.contentTypeItemService.getContentTypeItems(fs.DataSources);
    const dsAttributes = dataSources[0]?.Attributes;

    console.log('SDV StringPickerLogic dataSources', dataSources);

    /** Query datasource */
    if (dataSources[0].Type.Name === PickerSources.UiPickerSourceQuery) {
      fs.DataSourceType = PickerSources.UiPickerSourceQuery;

      fs.Query = dsAttributes['Query'].Values[0].Value ?? '';
      fs.StreamName = dsAttributes['StreamName'].Values[0].Value ?? 'Default';
      fs.UrlParameters = dsAttributes['QueryParameters'].Values[0].Value ?? '';

      fs.Value = dsAttributes['Value'].Values[0].Value ?? '';
      fs.Label = dsAttributes['Label'].Values[0].Value ?? '';
      fs.EntityType = dsAttributes['CreateTypes'].Values[0].Value ?? '';
    }

    /** Entity datasource */
    if (dataSources[0].Type.Name === PickerSources.UiPickerSourceEntity) {
      fs.DataSourceType = PickerSources.UiPickerSourceEntity;

      fs.EntityType = dsAttributes['ContentTypeNames'].Values[0].Value ?? '';
    }

    /** WIP functionalities */
    // If AllowMultiValue is false then EnableReselect must be false
    fs.AllowMultiValue ? fs.EnableReselect ??= false : fs.EnableReselect = false;
    // If AllowMultiValue is false then AllowMultiMin and AllowMultiMax must be 0 so we don't trigger the validation
    if (fs.AllowMultiValue) {
      fs.AllowMultiMin ??= 0;
      fs.AllowMultiMax ??= 0;
    } else {
      fs.AllowMultiMin = 0;
      fs.AllowMultiMax = 0;
    }

    // fixedSettings.PickerDisplayMode ??= 'list';
    // fixedSettings.PickerDisplayConfiguration ??= [];

    // USE CONTENT TYPE ITEM SERVICE TO GET THE SUBENTITIES
    // if (fixedSettings.PickerDisplayMode === 'tree') {
    //   const pickerTreeConfiguration: UiPickerModeTree = {
    //     Title: 'Tree Picker Configuration',// nothing to implement
    //     TreeRelationship: 'child-parent',
    //     TreeBranchStream: 'Default',
    //     TreeLeavesStream: 'Default',
    //     TreeParentIdField: 'Id',
    //     TreeChildIdField: 'Id',
    //     TreeParentChildRefField: 'children',
    //     TreeChildParentRefField: 'parent',
    //     TreeShowRoot: true,
    //     TreeDepthMax: 10,
    //     TreeAllowSelectRoot: true,// implemented
    //     TreeAllowSelectBranch: true,// implemented
    //     TreeAllowSelectLeaves: true,// implemented
    //   };
    //   fixedSettings.PickerTreeConfiguration = pickerTreeConfiguration;
    // }

    return fs;
  }
}

FieldLogicBase.add(EntityPickerLogic);

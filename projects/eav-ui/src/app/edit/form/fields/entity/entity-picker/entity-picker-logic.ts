import { FieldSettings, UiPickerModeTree } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldLogicBase } from '../../../shared/field-logic/field-logic-base';
import { FieldLogicTools } from '../../../shared/field-logic/field-logic-tools';

export class EntityPickerLogic extends FieldLogicBase {
  name = InputTypeConstants.WIPEntityPicker;

  update(settings: FieldSettings, value: string[], tools: FieldLogicTools): FieldSettings {
    const fixedSettings: FieldSettings = { ...settings };

    /** Entity Default logic */
    fixedSettings.EntityType ??= '';
    fixedSettings.AllowMultiValue ??= false;
    fixedSettings.EnableEdit ??= true;
    fixedSettings.EnableCreate ??= true;
    fixedSettings.EnableAddExisting ??= true;
    fixedSettings.EnableRemove ??= true;
    fixedSettings.EnableDelete ??= false;
    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // fixedSettings.IncludeParentApps ??= false;

    fixedSettings.Information ??= '';
    fixedSettings.Tooltip ??= '';
    fixedSettings.MoreFields ??= '';
    fixedSettings.Label ??= '';

    if (tools.eavConfig.overrideEditRestrictions && tools.debug) {
      // tslint:disable-next-line: max-line-length
      console.log('SystemAdmin + Debug: Overriding edit restrictions for field \'' + settings.Name + '\' (EntityType: \'' + settings.EntityType + '\').');
      fixedSettings.EnableEdit = true;
      fixedSettings.EnableCreate = true;
      fixedSettings.EnableAddExisting = true;
      fixedSettings.EnableRemove = true;
      fixedSettings.EnableDelete = true;
    }

    // const dataSources = tools.contentTypeItemService.getContentTypeItems(fixedSettings.DataSources);
    // console.log('SDV dataSources', dataSources);

    // if (dataSources.length > 0) {
    //   dataSources.forEach((dataSource) => { 
    //     // TODO: @SDV - Add all this datasource types into enum
    //     if (dataSource.Type.Name === 'UiPickerSourceQuery') {
    //       const attributes = dataSource.Attributes;
          
    //       const uiPickerSourceQuery = {
    //         Title: attributes['Title'].Values[0].Value,
    //         Query: attributes['Query'].Values[0].Value,
    //         QueryParameters: attributes['QueryParameters'].Values[0].Value,
    //         StreamName: attributes['StreamName'].Values[0].Value,
    //         Value: attributes['Value'].Values[0].Value,
    //         Label: attributes['Label'].Values[0].Value,
    //         CreateTypes: attributes['CreateTypes'].Values[0].Value,
    //         MoreFields: attributes['MoreFields'].Values[0].Value,
    //       }
    //       fixedSettings.UiPickerSourceQuery = uiPickerSourceQuery;
    //     } else if (dataSource.Type.Name === 'UiPickerSourceEntity') {

    //     } else if (dataSource.Type.Name === 'UiPickerSourceCustomList') {

    //     } else if (dataSource.Type.Name === 'UiPickerModeTree') {

    //     }
    //   });
    // }

    /** Entity Query logic */
    fixedSettings.Query ??= '';
    fixedSettings.StreamName ||= 'Default';
    fixedSettings.UrlParameters ??= '';

    fixedSettings.Information ??= '';
    fixedSettings.Tooltip ??= '';
    fixedSettings.MoreFields ??= '';
    fixedSettings.Label ??= '';

    /** WIP functionalities */
    // If AllowMultiValue is false then EnableReselect must be false
    fixedSettings.AllowMultiValue ? fixedSettings.EnableReselect ??= false : fixedSettings.EnableReselect = false;
    // If AllowMultiValue is false then AllowMultiMin and AllowMultiMax must be 0 so we don't trigger the validation
    if (fixedSettings.AllowMultiValue) {
      fixedSettings.AllowMultiMin ??= 0;
      fixedSettings.AllowMultiMax ??= 0;
    } else {
      fixedSettings.AllowMultiMin = 0;
      fixedSettings.AllowMultiMax = 0;
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

    return fixedSettings;
  }
}

FieldLogicBase.add(EntityPickerLogic);

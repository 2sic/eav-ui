# 2sxc Picker Documentation

This is an internal documentation which helps us keep track of all the features, configurations etc.


## New Configuration with Picker

1. All the inputs _must_ have a config which says what configs are expected.
    1. @string-picker ✅
    1. @entity-picker TODO:
    1. @number-picker TODO:

1. Configuration Template Object `SysPickerSharedFields`
    1. GroupDataSources
    1. `DataSources`
    1. GroupUiFeatures
    1. `EnableEdit`
    1. `EnableCreate`
    1. `EnableAddExisting`
    1. `EnableRemove`
    1. `EnableDelete` TODO:
    1. `EnableTextEntry`
    1. GroupMultiSelect
    1. `AllowMultiValue`
    1. `EnableReselect` NEW!
    1. `Separator`
    1. `AllowMultiMin` NEW!
    1. `AllowMultiMax` NEW!
    1. GroupDisplay
    1. `PickerDisplayMode` - list/tree NEW!
    1. `PickerDisplayConfiguration` - additional config for display NEW!
    1. GroupEditDialog
    1. `CreatePrefill` NEW! - prefill for new entities, should use **FieldMask**
    1. `CreateParameters` NEW! - additional URL parameters, should use **FieldMask**
    1. `EditParameters` NEW! - additional URL parameters, should use **FieldMask**

1. Configuration `@string-picker` (basically all definitions inherited)
    1. `DataSources` 👩‍👦
    1. GroupUiFeatures 👩‍👦
    1. `EnableEdit` 👩‍👦
    1. `EnableCreate` 👩‍👦
    1. `EnableAddExisting` 👩‍👦
    1. `EnableRemove` 👩‍👦
    1. `EnableDelete` (not available in `string-picker` - TODO: probably will be available)
    1. `EnableTextEntry` 👩‍👦
    1. GroupMultiSelect 👩‍👦
    1. `AllowMultiValue` 👩‍👦
    1. `EnableReselect` 👩‍👦
    1. `Separator` 👩‍👦
    1. `AllowMultiMin` 👩‍👦
    1. `AllowMultiMax` 👩‍👦
    1. GroupDisplay 👩‍👦
    1. `PickerDisplayMode` 👩‍👦
    1. `PickerDisplayConfiguration` 👩‍👦
    1. GroupEditDialog 👩‍👦
    1. `CreatePrefill` 👩‍👦
    1. `CreateParameters` 👩‍👦
    1. `EditParameters` 👩‍👦

1. Configuration `@entity-picker` (basically all definitions inherited) TODO:

1. Configuration `@number-picker` (basically all definitions inherited) TODO:


## Data Source Configurations TODO:



## Old Configurations before the Picker

This is documented so we don't forget any old features when testing.

1. String-Dropdown (Text Picker with pre-defined values)
    1. Configuration: Very old setup - used in 2sxc ? (ca. before v7),  
       Configuration stored in `@String`; fields are all invisible as of now
        1. `InputType` - set the input to be dropdown
        1. `DropdownValues` - listed the values for selecting
    1. Configuration till v16 - configuration stored in `@string-dropdown`
        1. the input to be dropdown is now stored in `@All` field `InputType`
        1. `DropdownValues` the values to select; additional helper
        1. `DropdownValuesFormat` is a helper to choose if it's `key:value` or `value:key`
        1. `EnableTextEntry` Allow text entry
        1. `AllowMultiSelect` Allow multiple selection
        1. `Separator` separation character if multiple selection
    1. Formulas TODO:
    1. UI features such as `required` etc. TODO:
1. String-Query
    1. Configuration on `@string-dropdown-query`
        1. `Query` Basic query config
        1. `StreamName`
        1. `Value` - the value field
        1. `Label` - the label field
        1. ~~MoreFields~~ - never published; experimental, doesn't need to be supported
        1. `UiParameters` - additional URL parameters, uses **FieldMask**
        1. `EnableTextEntry`
        1. `EnableEdit`
        1. `EnableRemove`
        1. `AllowMultiValue`
        1. `Separator`
        1. ~~EntityType~~ - never published; experimental, doesn't need to be supported
        1. ~~EnableCreate~~ - never published; experimental, doesn't need to be supported
1. Entity-Default
    1. Configuration on `@Entity`
        1. `EntityType` - the entity type to use
        1. `AllowMultiValue`
        1. `EnableEdit`
        1. `EnableCreate`
        1. `EnableAddExisting`
        1. `EnableRemove`
        1. `EnableDelete`
        1. `Prefill` - prefill for new entities
        1. `IncludeParentApps` - experimental, don't think it's used ATM but not sure! TODO:
        1. ~~MoreFields~~ - never published; experimental, doesn't need to be supported
        1. ~~Label~~ - never published; experimental, doesn't need to be supported
1. Entity-Query
    1. Configuration on `@entity-query` - uses all from `@Entity`
        1. `Query` - the query to use
        1. `StreamName`
        1. `UiParameters` - additional URL parameters, uses **FieldMask**

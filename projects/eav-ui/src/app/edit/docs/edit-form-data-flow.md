# Edit Form Data Flow

This should document the data flow of the edit form.

2024-08-20 2dm

## Concerns

1. Loading data into memory
2. Initializing the reactive form data
3. Creating the user controls in the dynamic UI
4. Running formulas and updating the reactive form data and settings based on formula changes

## Main Component Hierarchy

1. `EditEntryComponent` (dialog) > `EditInitializerService` (load data for all entities)
    1. `EditDialogMainComponent` (main form, multi-entity)
        1. `FormBuilderComponent` (single Entity) > `FieldsSettingsService` (prepare and keep updated/formulas)
            1. `EntityWrapperComponent`
                1. `FieldsBuilderDirective` (generate controls)

## Overall Flow

1. Data load is triggered in the `EditEntryComponent` and is loaded with the `EditInitializerService`
2. The `FieldsSettingsService` is then initialized, which generates a list of fields with value & settings
    1. To do this, it will also run formulas and make sure settings are always according to specs
3. The `FormBuilderComponent` will pick up `getFieldProps$()` to create the angular-form-data
    1. It will also propagate ongoing value / settings changes from the field-settings service to the angular form
4. The `FormBuilderComponent` control will then use the `FieldsBuilderDirective` to generate the dynamic controls

## Communication of External Components

_This is still Work-In-Progress_

* `connector: Connector<T>` - the object which communications between the form and the field 
  * `data: ConnectorData<T>` - the data which the field has
    * `value: T` - the value as is
    * `value$: Observable<T>` - an observable with the value - so you get change notifications
    * `onValueChange(yourCallback)` - another way to hear about value changes - if you don't understand observables
      TODO: unclear if we really need 2 ways to get notified about changes
  * `field` --> unclear if we should have 2 interfaces
  * `field$` - observable stream of field configuration
    * `name; string`
    * `index: number`
    * `label: string`
    * `placeholder: string`
    * `inputType: string`
    * `type: string` 
    * `required: boolean`
    * `disabled: boolean`
    * `settings: Dictionary<any>` - field settings as they were configured
  * `form` - supporting API for common operations and talking with the form
    * `loadScript(...)` make sure a Js or css is loaded
    * `isFeatureEnabled(nameId: string): boolean` - check if a feature is enabled
    * `translator` - the translation service
  * `item` - anything related to the item that's currently being edited
    * `guid`
    * `fields` --> should replace the use of `allInputTypeNames`
  * `ui` - interactions with the form ui
    * `dialog(boolean [, name])` - open / close a dialog with a component having the same name just `-dialog` suffix unless you specify a name
    * `dialog$` - an observable reporting `{open: boolean, name: string}` - only fires for the current field

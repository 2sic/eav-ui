# Router

Angular Router is used for navigation within in app.
`AppModule` imports `AppRoutingModule` and bootstrap `AppComponent` that contains **RouterOutlet**.

## AppRoutingModule

Root router module, that is lazy loading other modules like:

- [EditModule](edit-ui.md)
- RefreshEditModule
- AppsManagementModule
- ImportAppModule
- AppAdministrationModule
- CodeEditorModule
- VisualQueryModule
- ReplaceContentModule
- ManageContentListModule
- ContentItemsModule
- ContentTypeFieldsModule
- ItemHistoryModule

# Router

Angular Router is used for navigation within in app.
Now, we use the routers directly (xxx.routing.ts) without any Module

<!-- Old Router Readme, after update to Standalone it's not correctly -->
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

# Store

Implemented with `@ngrx/*`.

Located in: `./edit/shared/store`.

AppModule imports:

- StoreModule
- EffectsModule
- StoreDevtoolsModule
- EntityDataModule

## Reducers

- `ActionReducerMap<EavState>`
- MetaReducers

## Ngrx-data

`projects\eav-ui\src\app\edit\shared\store\ngrx-data\entity-metadata.ts`

- GlobalConfig
- Item
- Feature
- Language
- LanguageInstance - changed to FormLanguageInStore
- ContentType
- ContentTypeItem
- InputType
- PublishStatus
- Prefetch
- EntityCache
- AdamCache
- LinkCache
- StringQueryCache

## More Info

- [NGRX reactive state for Angular](https://ngrx.io/)

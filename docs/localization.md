# Localization

Implemented with `@ngx-translate`.

App root `AppModule` imports `TranslationModule.forRoot()`.

Lazy loaded modules imports `TranslateModule.forChild(...)` with config factory.

Localizations are stored in `/i18n/` folder as `*.js` files (json structure) that are loaded with [http-loader](https://github.com/ngx-translate/http-loader).

## More Info

- [NGX-Translate is an internationalization (i18n) library for Angular](http://www.ngx-translate.com/)

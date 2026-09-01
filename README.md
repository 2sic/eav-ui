# 2sxc / EAV UI - the Admin and Edit Dialogs

This is part of [2sxc](https://2sxc.org) - an awesome extension for DNN :)

It's built using Angular 20+.

For detailed architecture, development guidelines, and contribution documentation, see the official [docs](https://docs.2sxc.org/abyss/contribute/code/frontend/eav-ui/index.html)

## Projects

1. **eav-ui** main Angular project. Build using `ng`
1. **field-custom-gps** an extension field with gps-picker & map. Build using `esbuild`
1. **field-string-wysiwyg** an extension field for wysiwyg. Build using `esbuild`

The main application uses Angular's application builder; the extension fields use esbuild.

## Building the Main Angular Project

First make sure you run `npm ci`.

To build, use the normal `ng` syntax, like `ng build` or `ng build --watch`

For more guidance on building and deploying to Dnn/Oqtane, see <https://go.2sxc.org/build>

## Building extension projects

Run `node ./build-helpers/build-parts.js --parts=PARTNAME`, where PARTNAME is `wysiwyg`, `gps`, `all`, or a comma-separated combination.

Add `--watch` for continuous builds, for example `node ./build-helpers/build-parts.js --parts=all --watch`.

Add `--production` for minified output with externally hosted source maps.

## Dev info

- [Edit-UI](./docs/edit-ui.md)
- [form builder](./docs/form-builder.md)
- [router](./docs/router.md)
- [store](./docs/store.md)
- [localization](./docs/localization.md)

# 2sxc / EAV UI - the Admin and Edit Dialogs

This is part of [2sxc](https://2sxc.org) - an awesome extension for DNN :)

It's built using Angular 13.

## Projects

1. **eav-ui** main Angular project. Build using `ng`
1. **field-custom-gps** an extension field with gps-picker & map. Build using `webpack`
1. **field-string-wysiwyg** an extension field for wysiwyg. Build using `webpack`

There are various projects in here, some building with angular `ng build` and others directly with webpack.

## Building the Main Angular Project

Use the normal `ng` syntax, like `ng build` or `ng build --watch`

## Building Webpack projects

Just run `webpack --env parts=PARTNAME` where PARTNAME is `wysiwyg`, `gps`, `all` (which is like using `'wysiwyg,gps'`).

You can also use `--watch` like `webpack --env parts=all --watch`

You can also use `--mode=production` like `webpack --env parts=wysiwyg --mode=production`

## Dev info

- [Edit-UI](./docs/edit-ui.md)
- [form builder](./docs/form-builder.md)
- [router](./docs/router.md)
- [store](./docs/store.md)
- [localization](./docs/localization.md)

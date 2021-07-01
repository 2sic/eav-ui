# 2sxc / EAV UI - the Admin and Edit Dialogs

This is part of [2sxc](https://2sxc.org) - an awesome extension for DNN :)

It's built using Angular 12. 

## Projects

1. **edit** part of the main Angular project, but historically an own component. Build using `ng`
1. **field-custom-gps** an extension field with gps-picker & map. Build using `webpack`
1. **field-string-wysiwyg** an extension field for wysiwyg. Build using `webpack`

There are various projects in here, some building with angular `ng build` and others directly with webpack. 

## Building the Main Angular Project

Use the normal `ng` syntax, like `ng build` or `ng build --watch`

## Building Webpack projects

Just run `webpack --parts=PARTNAME` where PARTNAME is `wysiwyg`, `gps`, `all` (which is like using `'wysiwyg gps'`).

You can also use `--watch` like `webpack --parts all --watch`

You can also use `--mode=production` like `webpack --parts=wysiwyg --mode=production`

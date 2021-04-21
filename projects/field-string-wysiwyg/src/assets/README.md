Steps to update TinyMCE skin:
1. go to [TinyMCE skin tool](http://skin.tiny.cloud/t5/) and upload `"skintool.json"` from `"src/assets/2sxc-tinymce-skin"`
1. change skin parameters
1. download skin, extract contents and replace `"src/assets/2sxc-tinymce-skin"` with a new one
1. carefully copy styles from `"src/assets/2sxc-tinymce-skin/content/content.css"` to `"src/editor/tinymce-content.scss"`. Check comments
1. skin will differ from what you see on the web because skintool uses full/iframe mode and some parts of the skin end up broken in inline mode
1. fix what you don't like in `"src/editor/skin-overrides.scss"`

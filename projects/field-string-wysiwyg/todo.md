
## TODO: SPM discuss

1. wysiwyg is actually broken ATM - dialog doesn't work
1. production mode just kills the console.log - that makes any work really hard - especially for component makers - not good - better alternatives?
1. host is type any, and there is some really funny stuff happening with .adam
  1. host should be moved to experimental properly
  1. adam should be a sub-object with a normal type
1. icons come from a very different folder, but they are probably only for here - we should move them
1. languages - it seems that we both add resources from angular, and also tell tinymce to pick up files from elsewhere - not ideal
1. atm the folder for this is still '.../elements/...' which isn't good, because anything inheriting this must know the folder - so it shouldn't change! let's change to something clearer like
  * components/string-wysiwyg/index.js or something!
1. the main.ts has some todo-quick-fix notes on focus of tinymce

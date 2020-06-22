
## TODO: SPM discuss

1. adam should be a sub-object with a normal type
1. icons come from a very different folder, but they are probably only for here - we should move them
1. languages - it seems that we both add resources from angular, and also tell tinymce to pick up files from elsewhere - not ideal
1. the main.ts has some todo-quick-fix notes on focus of tinymce


## 2dm 2020-06-20 discoveries

1. many toolbar main buttons have type='choiceitem' but this doesn't do anything for primary buttons, it's only used in sub-buttons. but I assume it was copy pasted everywhere without meaning. Should be removed

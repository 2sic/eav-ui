import * as Buttons from '../../constants/buttons';
import { ImageFormats } from '../../shared/models';
import * as IMG from '../public';
import { AddToRegistryBase, AddToRegistryParams } from './add-to-registry-base';

export class TinyButtonsImg extends AddToRegistryBase {
  constructor(makerParams: AddToRegistryParams) {
    super(makerParams, 'img');
  }

  register(): void {
    const imgSizes = this.field.configurator.addOnSettings.imgSizes;
    this.registerBasicFormats(imgSizes);
    this.registerEnhancedFormats();
    this.registerFormattingWidths(imgSizes);
    this.registerEnhancedFormattingRatios();
    this.buttonsEnhancedAlignment();
    this.contextMenus();
    this.groupImages();
    this.pasteImageButton();
  }

  private pasteImageButton() {
    this.editor.ui.registry.addButton(Buttons.PasteImage, {
      icon: 'paste-row-after',
      tooltip: 'Image.PasteImage.Tooltip',
      onAction: () => alert(this.editor.translate('Image.PasteImage.Message')),
    });
  }

  /** Images menu */
  private groupImages(): void {
    const thisForLater = this;
    const btns = this.getButtons();

    // Group with images (adam) - only in PRO mode
    this.editor.ui.registry.addSplitButton(IMG.ImagesGroupPro, {
      ...this.splitButtonSpecs(() => thisForLater.toggleAdam(false, true)),
      columns: 3,
      icon: btns.image.icon,
      presets: 'listpreview',
      tooltip: 'Image.AdamImage.Tooltip',
      fetch: (callback) => {
        callback([
          this.splitButtonItem(btns.image.icon, 'Image.AdamImage.Tooltip', () => thisForLater.toggleAdam(false, true)),
          this.splitButtonItem('custom-file-dnn', 'Image.DnnImage.Tooltip', () => thisForLater.toggleAdam(true, true)),
          this.splitButtonItem(btns.link.icon, btns.link.tooltip, 'mceImage'),
          // TODO: MAKE BEHAVE differently depending on the WysiwygMode
          this.splitButtonItem(btns.alignleft.icon, btns.alignleft.tooltip, 'JustifyLeft'),
          this.splitButtonItem(btns.aligncenter.icon, btns.aligncenter.tooltip, 'JustifyCenter'),
          this.splitButtonItem(btns.alignright.icon, btns.alignright.tooltip, 'JustifyRight'),
        ]);
      },
    });
  }


  /** Add Context toolbars */
  private contextMenus(): void {
    const rangeSelected = () => document.getSelection().rangeCount > 0 && !document.getSelection().getRangeAt(0).collapsed;

    // Different behavior depending on WysiwygMode
    const imgAlign = this.options.eavConfig.features.responsiveImages
      ? `${IMG.ImgEnhancedLeft} ${IMG.ImgEnhancedCenter} ${IMG.ImgEnhancedRight} ${IMG.ImgButtonGroupRatios}`
      : `alignleft aligncenter alignright ${IMG.ImgButtonGroupWidth}`;

    this.editor.ui.registry.addContextToolbar('imgContextToolbar', {
      items: `image | ${imgAlign} | removeformat | remove`,
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'img' && rangeSelected(),
    });
  }

  /** Image alignment / size buttons in context menu */
  private registerFormattingWidths(imgSizes: number[]): void {
    const formatter = this.editor.formatter;
    const sButItem = this.splitButtonItem;
    this.editor.ui.registry.addSplitButton(IMG.ImgButtonGroupWidth, {
      ...this.splitButtonSpecs(() => formatter.apply(`${IMG.ImgWidthPrefix}100`)),
      icon: 'resize',
      tooltip: '100%',
      fetch: (callback) => {
        callback(
          imgSizes.map(imgSize => sButItem('resize', `${imgSize}%`,
            (() => { formatter.apply(`${IMG.ImgWidthPrefix}${imgSize}`); }))),
        );
      },
    });
  }

  /** Image alignment / size buttons in context menu */
  private registerEnhancedFormattingRatios(): void {
    const sButItem = this.splitButtonItem;
    const tog = (current: IMG.FormatDefinition) => this.toggleOneOfClassList(IMG.ImgEnhancedRatios, current);
    this.editor.ui.registry.addSplitButton(IMG.ImgButtonGroupRatios, {
      ...this.splitButtonSpecs(() => tog(IMG.ImgEnhancedRatioDefault)),
      icon: 'resize',
      tooltip: IMG.ImgEnhancedRatioDefault.name, // TODO: i18n
      fetch: (callback) => {
        callback(
          IMG.ImgEnhancedRatios.map(imgR => sButItem('resize', `${imgR.name}`, // TODO: i18n
            () => { tog(imgR); })),
        );
      },
    });
  }

  private toggleOneOfClassList(all: IMG.FormatDefinition[], current: IMG.FormatDefinition) {
    const formatter = this.editor.formatter;
    all.filter((v) => v.name !== current.name).forEach((v) => formatter.remove(v.name));
    formatter.toggle(current.name);
  }

  // New wysiwyg alignments
  private buttonsEnhancedAlignment(): void {
    const btns = this.getButtons();
    IMG.ImgEnhancedAlignments.forEach((ai) => {
      this.regBtn(ai.name,
        ai.icon ?? btns[ai.inherit]?.icon,
        ai.tooltip ?? btns[ai.inherit]?.tooltip,
        () => { this.toggleOneOfClassList(IMG.ImgEnhancedAlignments, ai); });
    });
  }


  /** Register all formats - like img-sizes */
  registerBasicFormats(imgSizes: number[]): void {
    const editor = this.editor;
    // TODO: @SDV - rewrite as imgSizes.map(...)
    const imageFormats: ImageFormats = {};
    for (const imgSize of imgSizes) {
      imageFormats[`${IMG.ImgWidthPrefix}${imgSize}`] = [
        {
          selector: 'img',
          collapsed: false,
          styles: {
            width: `${imgSize}%`,
          },
        },
      ];
    }
    editor.formatter.register(imageFormats);
  }

  /** Register all formats for enhanced modes - like img-sizes */
  registerEnhancedFormats(): void {
    const formatter = this.editor.formatter;
    [IMG.ImgEnhancedAlignments, IMG.ImgEnhancedRatios, IMG.ImgEnhancedWidths]
      .map(set => set.forEach(def => {
        formatter.register(def.name, { selector: 'img', classes: def.class });
      }));
  }
}

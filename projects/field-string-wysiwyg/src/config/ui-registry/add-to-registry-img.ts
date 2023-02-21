import * as Buttons from '../../constants/buttons';
import * as RichSpecs from '../../constants/rich-wysiwyg';
import { ImageFormats } from '../../shared/models';
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
    this.editor.ui.registry.addSplitButton(Buttons.ImagesCmsGroup, {
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
          // TODO: MAKE BEHAVE differently depending on the responsiveImages mode
          this.splitButtonItem(btns.alignleft.icon, btns.alignleft.tooltip, 'JustifyLeft'),
          this.splitButtonItem(btns.aligncenter.icon, btns.aligncenter.tooltip, 'JustifyCenter'),
          this.splitButtonItem(btns.alignright.icon, btns.alignright.tooltip, 'JustifyRight'),
        ]);
      },
    });
  }


  /** Add Context toolbars */
  private contextMenus(): void {
    const rangeSelected = this.rangeSelected;

    // Different behavior depending on responsiveImages mode
    const imgAlign = this.options.configManager.current.features.responsiveImages
      ? `${RichSpecs.ImgLeftClass} ${RichSpecs.ImgCenterClass} ${RichSpecs.ImgRightClass} ${Buttons.ImgRatiosGroup}`
      : `alignleft aligncenter alignright ${Buttons.ImgWidthsGroup}`;

    this.editor.ui.registry.addContextToolbar('imgContextToolbar', {
      items: `image | ${imgAlign} | removeformat | remove`,
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'img' && rangeSelected(),
    });
  }

  /** Image alignment / size buttons in context menu */
  private registerFormattingWidths(imgSizes: number[]): void {
    const formatter = this.editor.formatter;
    const sButItem = this.splitButtonItem;
    this.editor.ui.registry.addSplitButton(Buttons.ImgWidthsGroup, {
      ...this.splitButtonSpecs(() => formatter.apply(`${RichSpecs.ImgWidthPrefix}100`)),
      icon: 'resize',
      tooltip: '100%',
      fetch: (callback) => {
        callback(
          imgSizes.map(imgSize => sButItem('resize', `${imgSize}%`,
            (() => { formatter.apply(`${RichSpecs.ImgWidthPrefix}${imgSize}`); }))),
        );
      },
    });
  }

  /** Image alignment / size buttons in context menu */
  private registerEnhancedFormattingRatios(): void {
    const that = this;
    const main = RichSpecs.ImgRatioDefault;
    const tog = (current: RichSpecs.ImageFormatDefinition) => this.toggleOneImgFormatDefinition(RichSpecs.ImgRatios, current);
    this.editor.ui.registry.addSplitButton(Buttons.ImgRatiosGroup, {
      ...that.splitButtonSpecs(() => tog(main)),
      icon: 'resize',
      tooltip: this.editor.translate([main.tooltip, main.fraction, main.fractionOf]),
      fetch: (callback) => {
        callback(
          RichSpecs.ImgRatios.map(imgR => that.splitButtonItemTipped('resize',
            this.editor.translate([imgR.label, imgR.fraction, imgR.fractionOf]),
            this.editor.translate([imgR.tooltip, imgR.fraction, imgR.fractionOf]),
            () => { tog(imgR); })),
        );
      },
    });
  }

  private toggleOneImgFormatDefinition(all: RichSpecs.ImageFormatDefinition[], current: RichSpecs.ImageFormatDefinition) {
    this.toggleOneClassFromList(current.name, all.map((v) => v.name));
  }


  // New wysiwyg alignments
  private buttonsEnhancedAlignment(): void {
    const btns = this.getButtons();
    const editor = this.editor;
    RichSpecs.ImgAlignments.forEach((ai) => {
      this.regBtn(ai.name,
        ai.icon ?? btns[ai.inherit]?.icon,
        editor.translate([ai.tooltip ?? btns[ai.inherit]?.tooltip]),
        () => { this.toggleOneImgFormatDefinition(RichSpecs.ImgAlignments, ai); });
    });
  }


  /** Register all formats - like img-sizes */
  registerBasicFormats(imgSizes: number[]): void {
    const editor = this.editor;
    const imageFormats: ImageFormats = {};
    imgSizes.map((imgSize) => {
      imageFormats[`${RichSpecs.ImgWidthPrefix}${imgSize}`] = [{
        selector: 'img',
        collapsed: false,
        styles: {
          width: `${imgSize}%`,
        },
      }];
    });
    editor.formatter.register(imageFormats);
  }

  /** Register all formats for enhanced modes - like img-sizes */
  registerEnhancedFormats(): void {
    const formatter = this.editor.formatter;
    [
      RichSpecs.ImgAlignments,
      RichSpecs.ImgRatios,
    ].map(set => set.forEach(def => {
        formatter.register(def.name, { selector: 'img', classes: def.class });
      }));
  }
}

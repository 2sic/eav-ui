import { ImageFormats } from '../shared/models';
import { ImgEnhancedAlignCenter, ImgEnhancedAlignLeft, ImgEnhancedAlignRight, ImgResponsive, SxcImages } from './public';
import { ButtonsMakerParams, TinyButtonsBase } from './tiny-buttons-base';

// New wysiwyg alignments
const ImgAligmentsEnhanced = [
  ImgEnhancedAlignLeft,
  ImgEnhancedAlignCenter,
  ImgEnhancedAlignRight,
];

export class TinyButtonsImg extends TinyButtonsBase {
  constructor(makerParams: ButtonsMakerParams) {
    super(makerParams);
  }

  register(): void {
    const imgSizes = this.field.configurator.addOnSettings.imgSizes;
    this.registerTinyMceFormats(imgSizes);
    this.imageContextMenu(imgSizes);
    this.contextMenus();
    this.images();
  }

  /** Images menu */
  private images(): void {
    const adam = this.adam;
    const btns = this.getButtons();

    // Group with images (adam) - only in PRO mode
    this.editor.ui.registry.addSplitButton(SxcImages, {
      ...this.splitButtonSpecs(() => adam.toggle(false, true)),
      columns: 3,
      icon: btns.image.icon,
      presets: 'listpreview',
      tooltip: 'Image.AdamImage.Tooltip',
      fetch: (callback) => {
        callback([
          this.splitButtonItem(btns.image.icon, 'Image.AdamImage.Tooltip', () => adam.toggle(false, true)),
          this.splitButtonItem('custom-file-dnn', 'Image.DnnImage.Tooltip', () => adam.toggle(true, true)),
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
    const imgAlign = this.options.eavConfig.features.wysiwygEnhanced
      ? `${ImgEnhancedAlignLeft} ${ImgEnhancedAlignCenter} ${ImgEnhancedAlignRight}`
      : 'alignleft aligncenter alignright';

    this.editor.ui.registry.addContextToolbar('imgContextToolbar', {
      items: `image | ${imgAlign} ${ImgResponsive} | removeformat | remove`,
      predicate: (elem) => elem.nodeName.toLocaleLowerCase() === 'img' && rangeSelected(),
    });
  }

  /** Image alignment / size buttons in context menu */
  private imageContextMenu(imgSizes: number[]): void {
    const reg = this.editor.ui.registry;
    const formatter = this.editor.formatter;
    reg.addSplitButton(ImgResponsive, {
      ...this.splitButtonSpecs(() => this.editor.formatter.apply('imgwidth100')),
      icon: 'resize',
      tooltip: '100%',
      fetch: (callback) => {
        callback(
          // WARNING! This part is not fully type safe
          imgSizes.map(imgSize => ({
            icon: 'resize',
            text: `${imgSize}%`,
            type: 'choiceitem',
            value: (() => { formatter.apply(`imgwidth${imgSize}`); }) as any,
          })),
        );
      },
    });

    // New wysiwyg alignments
    const tglImgAlign = (alignment: string) => {
      ImgAligmentsEnhanced.filter((v) => v !== alignment).forEach((v) => formatter.remove(v));
      formatter.toggle(alignment);
    };
    const btns = this.getButtons();
    this.regBtn(ImgEnhancedAlignLeft, btns.alignleft?.icon, btns.alignleft?.tooltip, () => { tglImgAlign(ImgEnhancedAlignLeft); });
    this.regBtn(ImgEnhancedAlignCenter, btns.aligncenter?.icon, btns.aligncenter?.tooltip, () => { tglImgAlign(ImgEnhancedAlignCenter); });
    this.regBtn(ImgEnhancedAlignRight, btns.alignright?.icon, btns.alignright?.tooltip, () => { tglImgAlign(ImgEnhancedAlignRight); });
  }

  /** Register all formats - like img-sizes */
  registerTinyMceFormats(imgSizes: number[]): void {
    const editor = this.editor;
    const imageFormats: ImageFormats = {};
    for (const imgSize of imgSizes) {
      imageFormats[`imgwidth${imgSize}`] = [
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

    // New enhanced mode
    editor.formatter.register(ImgEnhancedAlignLeft, { selector: 'img', classes: 'wysiwyg-left'  });
    editor.formatter.register(ImgEnhancedAlignCenter, { selector: 'img', classes: 'wysiwyg-center'  });
    editor.formatter.register(ImgEnhancedAlignRight, { selector: 'img', classes: 'wysiwyg-right'  });
  }
}

import type { RawEditorOptions } from 'tinymce';
import { classLog } from '../../../../../projects/eav-ui/src/app/shared/logging';
import { Adam } from '../../../../edit-types/src/Adam';
import { AdamItem } from '../../../../edit-types/src/AdamItem';
import { Dropzone } from '../../../../edit-types/src/Dropzone';

export class DefaultPaste {

  /** Paste formatted text, e.g. text copied from MS Word */
  static formattedText: RawEditorOptions = (() => {
    const log = classLog({DefaultPaste});
    return {
      // strips pasted formatting by default
      // experimentally turned on, but it seems that off seems to be the better choice.
      paste_as_text: false,
      // paste_enable_default_filters: true,
      paste_create_paragraphs: true,
      paste_create_linebreaks: false,
      paste_force_cleanup_wordpaste: true,
      paste_use_dialog: true,
      paste_auto_cleanup_on_paste: true,
      paste_convert_middot_lists: true,
      paste_convert_headers_to_strong: false,
      paste_remove_spans: true,
      paste_remove_styles: true,
      paste_preprocess(plugin: any, args: any) {
        log.a('TinyMCE paste_preprocess', {plugin, args});
      },
      paste_postprocess(plugin: any, args: any) {
        log.a('TinyMCE paste_postprocess', {plugin, args});
        try {
          const anchors = (args.node as HTMLElement).getElementsByTagName('a');
          for (const anchor of Array.from(anchors)) {
            if (!anchor.target)
              anchor.target = '_blank';
          }
        } catch (error) {
          console.error('Error in paste postprocess:', error);
        }
      }
    }
  })();

  /** Paste image */
  static images(dropzone: Dropzone, adam: Adam): RawEditorOptions {
    const imageUploadSettings: RawEditorOptions = {
      automatic_uploads: true,
      images_reuse_filename: true,
      paste_data_images: true,
      // paste_filter_drop: false,
      paste_block_drop: false,
      images_upload_handler: (blobInfo, progress) => this.imagesUploadHandler(blobInfo, progress, dropzone, adam)
    };
    return imageUploadSettings;
  }

  private static imagesUploadHandler(
    blobInfo: Parameters<RawEditorOptions['images_upload_handler']>[0],
    progress: Parameters<RawEditorOptions['images_upload_handler']>[1],
    dropzone: Dropzone,
    adam: Adam,
  ): Promise<string> {

    const l = classLog({DefaultPaste}).fn('imagesUploadHandler');
    l.a('TinyMCE upload');

    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    const dropzoneConfig = dropzone.getConfig();
    progress(0);
    return fetch(dropzoneConfig.url as string, {
      method: 'POST',
      // mode: 'cors',
      headers: dropzoneConfig.headers,
      body: formData,
    }).then(response => {
      progress(50);
      return response.json();
    }).then((response: AdamItem) => {
      l.a('TinyMCE upload data', {response});
      if (response.Error) {
        alert(`Upload failed because: ${response.Error}`);
        return response.Error;
      }
      progress(100);
      adam.refresh();
      //tododata... is added so onChange it can be changed to special data-cmsid attribute which containes reference id
      return response.Url + `?tododata-cmsid=${response.Name}`;
    }).catch(error => {
      l.a('TinyMCE upload error:', error);
      return error;
    });
  }
}

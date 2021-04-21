import { RawEditorSettings } from 'tinymce';
import { Adam, AdamPostResponse, Dropzone } from '../../../../edit-types';
import { consoleLogWebpack } from '../../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { BlobInfo } from '../../shared/models';

export class DefaultPaste {

  /** Paste formatted text, e.g. text copied from MS Word */
  static formattedText: RawEditorSettings = {
    paste_as_text: false,
    paste_enable_default_filters: true,
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
    },
    paste_postprocess(plugin: any, args: any) {
      try {
        const anchors = (args.node as HTMLElement).getElementsByTagName('a');
        for (const anchor of Array.from(anchors)) {
          if (!anchor.target) {
            anchor.target = '_blank';
          }
        }
      } catch (error) {
        console.error('Error in paste postprocess:', error);
      }
    }
  };

  /** Paste image */
  static images(dropzone: Dropzone, adam: Adam): RawEditorSettings {
    const imageUploadSettings: RawEditorSettings = {
      automatic_uploads: true,
      images_reuse_filename: true,
      paste_data_images: true,
      paste_filter_drop: false,
      paste_block_drop: false,
      images_upload_handler: (blobInfo: BlobInfo, success: (url: string) => void, failure: (err: string) => void) => {
        this.imagesUploadHandler(blobInfo, success, failure, dropzone, adam);
      },
    };
    return imageUploadSettings;
  }

  private static imagesUploadHandler(
    blobInfo: BlobInfo,
    success: (url: string) => void,
    failure: (err: string) => void,
    dropzone: Dropzone,
    adam: Adam,
  ): void {
    consoleLogWebpack('TinyMCE upload');

    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    const dropzoneConfig = dropzone.getConfig();

    fetch(dropzoneConfig.url as string, {
      method: 'POST',
      // mode: 'cors',
      headers: dropzoneConfig.headers,
      body: formData,
    }).then(response =>
      response.json()
    ).then((response: AdamPostResponse) => {
      consoleLogWebpack('TinyMCE upload data', response);
      if (!response.Success) {
        alert(`Upload failed because: ${response.Error}`);
        return;
      }
      success(response.Path);
      adam.refresh();
    }).catch(error => {
      consoleLogWebpack('TinyMCE upload error:', error);
    });
  }
}

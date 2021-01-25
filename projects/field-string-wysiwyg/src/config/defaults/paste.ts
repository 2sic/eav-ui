import { Adam, AdamPostResponse, Dropzone } from '../../../../edit-types';
import { webpackConsoleLog } from '../../../../shared/webpack-console-log.helper';

export class DefaultPaste {

  /** Paste formatted text, e.g. text copied from MS Word */
  static formattedText = {
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
    paste_preprocess(e: any, args: any) {
      webpackConsoleLog('paste preprocess', e, args);
    },
    paste_postprocess(plugin: any, args: any) {
      try {
        const anchors = args.node.getElementsByTagName('a');
        for (const anchor of anchors) {
          if (anchor.hasAttribute('target') === false) {
            anchor.setAttribute('target', '_blank');
          }
        }
      } catch (e) {
        console.error('error in paste postprocess - will only log but not throw', e);
      }
    }
  };

  /** Paste image */
  static images(dropzone: Dropzone, adam: Adam) {
    return {
      automatic_uploads: true,
      images_reuse_filename: true,
      paste_data_images: true,
      paste_filter_drop: false,
      paste_block_drop: false,
      images_upload_handler: (blobInfo: any, success: (imgPath: string) => any, failure: () => any) => {
        DefaultPaste.imagesUploadHandler(blobInfo, success, failure, dropzone, adam);
      },
    };
  }

  private static imagesUploadHandler(blobInfo: any, success: (imgPath: string) => any, failure: () => any, dropzone: Dropzone, adam: Adam) {
    webpackConsoleLog('TinyMCE upload');

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
      webpackConsoleLog('TinyMCE upload data', response);
      if (!response.Success) {
        alert(`Upload failed because: ${response.Error}`);
        return;
      }

      success(response.Path);
      adam.refresh();
    }).catch(error => {
      webpackConsoleLog('TinyMCE upload error:', error);
    });

  }
}

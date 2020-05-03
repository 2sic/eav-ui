import { webpackConsoleLog } from '../../../../shared/webpack-console-log';

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
  static images(uploadUrl: string, headers: any) {
    return {
      automatic_uploads: true,
      images_reuse_filename: true,
      paste_data_images: true,
      paste_filter_drop: false,
      paste_block_drop: false,
      images_upload_url: uploadUrl,
      images_upload_base_path: '/images_upload_base_path/',
      images_upload_handler: DefaultPaste.imagesUploadHandler,
      upload_headers: headers,
    };
  }

  private static imagesUploadHandler(blobInfo: any, success: (imgPath: string) => any, failure: () => any) {
    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    const settings = (window as any).tinymce.activeEditor.settings;
    webpackConsoleLog('TinyMCE upload settings', settings);

    fetch(settings.images_upload_url, {
      method: 'POST',
      // mode: 'cors',
      headers: settings.upload_headers,
      body: formData,
    }).then(response =>
      response.json()
    ).then(data => {
      webpackConsoleLog('TinyMCE upload data', data);
      success(data.Path);
    }).catch(error => {
      webpackConsoleLog('TinyMCE upload error:', error);
    });

  }
}

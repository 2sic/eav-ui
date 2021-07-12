/** spm TODO: find a way to detect language automatically */
export function monacoDetectLanguage(filename: string): string {
  const extIndex = filename.lastIndexOf('.');
  if (extIndex < 0) { return filename; }

  const ext = filename.substring(extIndex + 1).toLocaleLowerCase();
  switch (ext) {
    case 'cs':
      return 'csharp';
    case 'cshtml':
      return 'razor';
    case 'js':
      return 'javascript';
    case 'css':
      return 'css';
    default:
      return 'plain';
  }
}

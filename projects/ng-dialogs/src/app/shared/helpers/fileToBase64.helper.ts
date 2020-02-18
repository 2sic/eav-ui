export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((<string>reader.result).split(',')[1]);
    reader.onerror = error => reject(error);
  });
}

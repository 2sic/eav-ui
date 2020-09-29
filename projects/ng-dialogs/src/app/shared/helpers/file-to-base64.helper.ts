export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve((reader.result as string).split(',')[1]);
    };
    reader.onerror = error => {
      reject(error);
    };
  });
}

export function toString(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = error => {
      reject(error);
    };
  });
}

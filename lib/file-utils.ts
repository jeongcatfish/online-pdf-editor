const PDF_MIME_TYPE = "application/pdf";
const PDF_EXTENSIONS = [".pdf"];
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg"];
const IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

function hasExtension(file: File, extensions: string[]) {
  const lowerName = file.name.toLowerCase();
  return extensions.some((ext) => lowerName.endsWith(ext));
}

export function isPdfFile(file: File) {
  return file.type === PDF_MIME_TYPE || hasExtension(file, PDF_EXTENSIONS);
}

export function isImageFile(file: File) {
  return IMAGE_MIME_TYPES.includes(file.type) || hasExtension(file, IMAGE_EXTENSIONS);
}

export function isSupportedFile(file: File) {
  return isPdfFile(file) || isImageFile(file);
}

const SUPPORTED_MIME_TYPES = [PDF_MIME_TYPE, ...IMAGE_MIME_TYPES];
const SUPPORTED_EXTENSIONS = [...PDF_EXTENSIONS, ...IMAGE_EXTENSIONS];

export const SUPPORTED_INPUT_ACCEPT = [...SUPPORTED_MIME_TYPES, ...SUPPORTED_EXTENSIONS].join(",");

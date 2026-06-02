/**
 * Image helpers for the screenshot-based features.
 * The Gemini key stays server-side; the frontend only converts files to data URLs
 * and POSTs them to /api/generate.
 */

/** Read a File into a base64 data URL (`data:<mime>;base64,...`). */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

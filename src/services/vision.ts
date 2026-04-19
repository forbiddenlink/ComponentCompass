/**
 * Vision analysis via server-side proxy
 * OpenAI API key stays on the server — frontend never touches it
 */

interface VisionAnalysisResult {
  components: Array<{
    name: string;
    description: string;
    confidence: number;
  }>;
  layout: string;
  designStyle: string;
  suggestions: string[];
}

export async function analyzeDesignScreenshot(
  imageUrl: string
): Promise<VisionAnalysisResult> {
  const response = await fetch('/api/vision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Vision analysis failed' }));
    throw new Error(error.error || `Vision API error (${response.status})`);
  }

  return response.json();
}

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

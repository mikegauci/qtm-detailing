import { debugLog } from "@/lib/debug-log";
import { enhanceImageBuffer } from "@/lib/openai/enhance-image";
import { buildImageProcessingPrompt } from "@/lib/openai/image-config";
import { optimizeCmsImage } from "@/lib/cms/upload-cms-asset";

export type ImageProcessingOptions = {
  enhance?: boolean;
  blankPlate?: boolean;
};

export async function processImageBuffer(
  buffer: Buffer,
  options?: ImageProcessingOptions,
): Promise<Buffer> {
  const shouldEnhance = options?.enhance === true;
  const shouldBlankPlate = options?.blankPlate === true;
  const prompt = buildImageProcessingPrompt({
    enhance: shouldEnhance,
    blankPlate: shouldBlankPlate,
  });

  debugLog("[processImageBuffer]", {
    inputBytes: buffer.length,
    enhance: shouldEnhance,
    blankPlate: shouldBlankPlate,
    combined: shouldEnhance && shouldBlankPlate,
    prompt,
  });

  let current = buffer;

  if (prompt) {
    current = await enhanceImageBuffer(current, prompt);
  }

  const optimized = await optimizeCmsImage(current);
  debugLog("[processImageBuffer] done", { outputBytes: optimized.length });

  return optimized;
}

export const ENHANCE_PROMPT = `Enhance the existing image while preserving the original vehicle, composition, camera angle, background, proportions, colors, reflections, and all visible details.

Make the image look cleaner, sharper, and slightly more refined, with realistic professional lighting, improved clarity, cleaner surfaces, and subtle detail enhancement. Keep the result natural and believable. Do not over-polish, over-sharpen, add excessive gloss, or make the image look AI-generated or heavily edited.

Do not add, remove, reposition, redesign, or alter anything else in the image.`;

export const BLANK_PLATE_PROMPT = `If a vehicle registration/number plate is visible, remove all letters, numbers, logos, and markings from it and replace them with a clean, plain white blank plate while keeping the original plate shape, size, position, perspective, and lighting.

Do not add, remove, reposition, redesign, or alter anything else in the image.`;

export const COMBINED_PROMPT = `Enhance the existing image while preserving the original vehicle, composition, camera angle, background, proportions, colors, reflections, and all visible details.

Make the image look cleaner, sharper, and slightly more refined, with realistic professional lighting, improved clarity, cleaner surfaces, and subtle detail enhancement. Keep the result natural and believable. Do not over-polish, over-sharpen, add excessive gloss, or make the image look AI-generated or heavily edited.

If a vehicle registration/number plate is visible, remove all letters, numbers, logos, and markings from it and replace them with a clean, plain white blank plate while keeping the original plate shape, size, position, perspective, and lighting.

Do not add, remove, reposition, redesign, or alter anything else in the image.`;

export const openAiImageConfig = {
  model: "gpt-image-2",
  quality: "low" as "high" | "medium" | "low",
  /** Fixed square output — cheaper than portrait/landscape 1536px sides; Sharp upscales after. */
  outputSize: "1024x1024" as "auto" | "1024x1024" | "1536x1024" | "1024x1536",
  maxInputWidth: 1024,
  enhancePrompt: ENHANCE_PROMPT,
  blankPlatePrompt: BLANK_PLATE_PROMPT,
  combinedPrompt: COMBINED_PROMPT,
} as const;

export function buildImageProcessingPrompt(options: {
  enhance?: boolean;
  blankPlate?: boolean;
}): string | null {
  const enhance = options.enhance === true;
  const blankPlate = options.blankPlate === true;

  if (!enhance && !blankPlate) {
    return null;
  }

  if (enhance && blankPlate) {
    return openAiImageConfig.combinedPrompt;
  }

  if (enhance) {
    return openAiImageConfig.enhancePrompt;
  }

  return openAiImageConfig.blankPlatePrompt;
}

export function resolveOutputSize(
  width?: number,
  height?: number,
): string {
  const configured = openAiImageConfig.outputSize;
  if (configured !== "auto") {
    return configured;
  }

  if (!width || !height) {
    return "1024x1024";
  }

  if (height > width * 1.1) {
    return "1024x1536";
  }

  if (width > height * 1.1) {
    return "1536x1024";
  }

  return "1024x1024";
}

export const ENHANCE_PROMPT =
  "Enhance image by making it look cleaner and detailed with professional lighting, do not exaggerate and make it look fake.";

export const BLANK_PLATE_PROMPT =
  "If there is a vehicle number plate, replace it with a clean blank white plate. Keep everything else in the image unchanged.";

export const COMBINED_PROMPT = `${ENHANCE_PROMPT} ${BLANK_PLATE_PROMPT}`;

export const openAiImageConfig = {
  model: "gpt-image-2",
  quality: "medium" as "high" | "medium" | "low",
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

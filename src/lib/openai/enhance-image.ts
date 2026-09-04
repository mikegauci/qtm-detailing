import OpenAI, { toFile } from "openai";
import sharp from "sharp";
import { debugError, debugLog } from "@/lib/debug-log";
import { openAiImageConfig, resolveOutputSize } from "@/lib/openai/image-config";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OpenAI API key is not configured. Add OPENAI_API_KEY to your environment.",
    );
  }
  return new OpenAI({ apiKey });
}

function modelSupportsInputFidelity(model: string): boolean {
  return model.includes("gpt-image-1");
}

async function prepareImageFile(buffer: Buffer) {
  const maxInputWidth = openAiImageConfig.maxInputWidth;
  const jpegBuffer = await sharp(buffer)
    .rotate()
    .resize({
      width: maxInputWidth,
      height: maxInputWidth,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();

  const metadata = await sharp(jpegBuffer).metadata();

  return {
    file: await toFile(jpegBuffer, "image.jpg", { type: "image/jpeg" }),
    preparedBytes: jpegBuffer.length,
    width: metadata.width,
    height: metadata.height,
    maxInputWidth,
  };
}

export async function enhanceImageBuffer(
  buffer: Buffer,
  prompt: string,
): Promise<Buffer> {
  const trimmedPrompt = prompt.trim();
  if (!trimmedPrompt) {
    throw new Error("Enhancement prompt cannot be empty.");
  }

  const client = getOpenAIClient();
  const { model, quality } = openAiImageConfig;
  const useInputFidelity = modelSupportsInputFidelity(model);

  const { file: imageFile, preparedBytes, width, height, maxInputWidth } =
    await prepareImageFile(buffer);
  const size = resolveOutputSize(width, height);
  const startedAt = Date.now();

  debugLog("[enhanceImageBuffer] calling OpenAI images.edit", {
    model,
    quality,
    size,
    maxInputWidth,
    preparedDimensions: width && height ? `${width}x${height}` : null,
    inputFidelity: useInputFidelity ? "high" : null,
    inputBytes: buffer.length,
    preparedBytes,
    prompt: trimmedPrompt,
  });

  const response = await client.images.edit({
    model,
    image: imageFile,
    prompt: trimmedPrompt,
    ...(useInputFidelity ? { input_fidelity: "high" as const } : {}),
    quality,
    size,
    output_format: "jpeg",
  });

  debugLog("[enhanceImageBuffer] OpenAI response", {
    durationMs: Date.now() - startedAt,
    created: response.created,
    usage: response.usage,
    hasImage: Boolean(response.data?.[0]?.b64_json),
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    debugError("[enhanceImageBuffer] no image in response", response);
    throw new Error("OpenAI did not return an enhanced image.");
  }

  const outputBuffer = Buffer.from(b64, "base64");
  debugLog("[enhanceImageBuffer] enhanced", { outputBytes: outputBuffer.length });

  return outputBuffer;
}

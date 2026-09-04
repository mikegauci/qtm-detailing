export type ActionResult<T = object> = {
  success: boolean;
  message: string;
} & T;

export type UploadActionResult = ActionResult<{ url?: string }>;

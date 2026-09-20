export type DriveFolder = {
  id: string;
  name: string;
};

export type DriveImage = {
  id: string;
  name: string;
  mimeType?: string;
  thumbnailLink?: string;
};

export type DriveQueryResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; expired?: boolean };

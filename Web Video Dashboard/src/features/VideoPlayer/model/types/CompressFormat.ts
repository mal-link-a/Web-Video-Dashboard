export enum VideoFormat {
  mp4 = "mp4",
  mkv = "mkv",
  ogg = "ogg",
  flv = "flv",
  wmv = "wmv",
}

export interface CompressFormat {
  format: VideoFormat;
  customFormatting: boolean;
}

export type CompressFormats = CompressFormat[];

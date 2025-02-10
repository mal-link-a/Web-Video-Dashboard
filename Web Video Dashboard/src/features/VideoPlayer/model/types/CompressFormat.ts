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
  codec?: string;
  codecLib?: string;
}

export type CompressFormats = CompressFormat[];

import { CompressFormats, VideoFormat } from "./types/CompressFormat";

export const compressFormats: CompressFormats = [
  {
    format: VideoFormat.mp4,
    customFormatting: false,
    codec: "х264",
    codecLib: "libx264",
  },
  {
    format: VideoFormat.mkv,
    customFormatting: true,
  },
  {
    format: VideoFormat.ogg,
    customFormatting: false,
  },
  {
    format: VideoFormat.wmv,
    customFormatting: true,
  },
  {
    format: VideoFormat.flv,
    customFormatting: true,
  },
];

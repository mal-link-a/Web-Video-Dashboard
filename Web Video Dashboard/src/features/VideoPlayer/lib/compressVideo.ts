import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { VideoFormat } from "../model/types/CompressFormat";
import { downloadBlob } from "./downloadBlob";

export const compressVideo = async (
  ffmpegRef: FFmpeg,
  file: File,
  format: VideoFormat,
  newName: string,
  customFormatting: boolean
) => {
  await ffmpegRef.writeFile(file.name, await fetchFile(file));
  await ffmpegRef.exec(["-i", file.name, `${newName}.${format}`]);
  const data = (await ffmpegRef.readFile(`${newName}.${format}`)) as Uint8Array;
  if (customFormatting) {
    downloadBlob(
      new Blob([data.buffer], { type: `video/${format}` }),
      `.${format}`
    );
  } else {
    downloadBlob(new Blob([data.buffer], { type: `video/${format}` }));
  }
};
//mp4
//flv (lossy) плохой
//wmv (lossy) плохой
//hevc не справляется
//mkv
//ogg (lossy) плохой

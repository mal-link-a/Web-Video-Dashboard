import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { VideoCompressFormat } from "../model/types/VideoCompressFormat";

export const compressVideo = async (
  ffmpegRef: FFmpeg,
  file: File,
  format: VideoCompressFormat,
  fileName: string,
  newName: string
) => {
  await ffmpegRef.writeFile(fileName, await fetchFile(file));
  await ffmpegRef.exec(["-i", fileName, `${newName}.${format}`]);
  const data = (await ffmpegRef.readFile(`${newName}.${format}`)) as Uint8Array;
  return data;
};

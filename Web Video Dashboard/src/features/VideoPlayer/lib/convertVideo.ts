import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export const convertVideo = async (
  ffmpegRef: FFmpeg,
  file: File,
  fileName: string,
  newName: string
) => {
  await ffmpegRef.writeFile(fileName, await fetchFile(file));
  await ffmpegRef.exec(["-i", fileName, "output.mp4"]);
  const data = (await ffmpegRef.readFile(`${newName}.mp4`)) as Uint8Array;
  return data;
};

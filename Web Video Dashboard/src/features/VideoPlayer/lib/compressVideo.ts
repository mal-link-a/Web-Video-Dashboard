import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { VideoFormat } from "../model/types/CompressFormat";
import { downloadBlob } from "./downloadBlob";

export const compressVideo = async (
  ffmpegRef: FFmpeg,
  file: File,
  format: VideoFormat,
  newName: string,
  customFormatting: boolean,
  codecLib: string | null
) => {
  await ffmpegRef.writeFile(file.name, await fetchFile(file));
  const params: string[] = ["-i", file.name];
  if (codecLib != null) {
    params.push("-c:v");
    params.push(codecLib);
  }
  params.push(`${newName}.${format}`);
  await ffmpegRef.exec(params);

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
// libx264
// libx265 не справляется

// libvpx-vp9 не справляется
// Форматы
//flv (lossy)
//wmv (lossy)
//mkv
//ogg (lossy)

//Итог таков, что ffmpeg.wasm удовлетворит необходимые требования для таски
// и при этом обладает никакой документацией
//Приходится опытным путём определять, что он может конвертировать, а что не может

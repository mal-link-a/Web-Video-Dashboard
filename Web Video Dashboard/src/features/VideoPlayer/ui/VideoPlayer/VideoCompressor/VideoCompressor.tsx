import { compressVideo } from "@/features/VideoPlayer/lib/compressVideo";
import { VideoFormat } from "@/features/VideoPlayer/model/types/CompressFormat";
import {
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Text,
  Progress,
} from "@chakra-ui/react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useState } from "react";

import { compressFormats } from "../../../../VideoPlayer/model/compressFormats";

interface Props {
  ffmpegRef: FFmpeg;
  videoFile: File | null;
}

export const VideoCompressor = ({ ffmpegRef, videoFile }: Props) => {
  const [progress, setProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>("");

  const onCompress = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const format = e.currentTarget.getAttribute("data-type") as VideoFormat;
    const customFormatting =
      e.currentTarget.getAttribute("data-customFormatting") === "true";
    if (videoFile != null) {
      await compressVideo(
        ffmpegRef,
        videoFile,
        format,
        "output",
        customFormatting
      );
    }
  };

  //Слушатель на время загрузки файла
  ffmpegRef.on("progress", ({ progress, time }) => {
    setProgress(progress);
    setProgressMsg(
      `${Math.floor(progress * 10000) / 100} %, transcoded time: ${
        time / 1000000
      } s`
    );
  });

  return (
    <>
      <Menu>
        <MenuButton as={Button}>Конвертировать и скачать</MenuButton>
        <MenuList>
          {compressFormats.map(({ format, customFormatting }) => (
            <MenuItem
              key={format}
              data-type={format}
              data-customFormatting={customFormatting}
              onClick={onCompress}
            >
              {format}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Progress hasStripe value={progress * 100} />
      <Text>{progressMsg}</Text>
    </>
  );
};

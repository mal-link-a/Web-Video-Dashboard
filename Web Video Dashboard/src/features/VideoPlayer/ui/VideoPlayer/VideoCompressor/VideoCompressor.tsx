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
      e.currentTarget.getAttribute("data-customformatting") === "true";
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
  //В документации указано, что прогресс - экспериментальная функция, и на самом деле она показывает время неправильно
  ffmpegRef.on("progress", ({ progress }) => {
    setProgress(progress);
    setProgressMsg(`${Math.floor(progress * 10000) / 100}%`);
  });

  return (
    <>
      <Menu>
        <MenuButton
          _active={{ background: "transparent" }}
          variant="outline"
          color="white"
          zIndex={1000}
          position="absolute"
          left="20px"
          top="20px"
          size={["xs", "sm", "md"]}
          bg="transparent"
          _hover={{ bg: "transparent" }}
          as={Button}
          value={["Сжать", "Конвертировать", " Конвертировать и скачать"]}
        >
          Конвертировать и загрузить
        </MenuButton>
        <MenuList>
          {compressFormats.map(({ format, customFormatting }) => (
            <MenuItem
              key={format}
              data-type={format}
              data-customformatting={customFormatting}
              onClick={onCompress}
            >
              {format}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Progress hasStripe value={progress * 100} />
      <Text
        position="absolute"
        right="0px"
        bottom="0px"
        fontSize={["xs", "sm", "xs"]}
      >
        {progressMsg}
      </Text>
    </>
  );
};

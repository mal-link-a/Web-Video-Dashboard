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
  const [convProgress, setProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [isCompressing, setCompressing] = useState<boolean>(false);

  const onCompress = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const format = e.currentTarget.getAttribute("data-type") as VideoFormat;
    const customFormatting =
      e.currentTarget.getAttribute("data-customformatting") === "true";
    const codecLib = e.currentTarget.getAttribute("data-codeclib");
    console.log(codecLib);

    if (videoFile != null) {
      await compressVideo(
        ffmpegRef,
        videoFile,
        format,
        "output",
        customFormatting,
        codecLib
      );
    }
  };

  //Слушатель на время загрузки файла
  //В документации указано, что прогресс - экспериментальная функция, и на самом деле она показывает время неправильно
  ffmpegRef.on("progress", ({ progress }) => {
    setProgress(progress);
    if (progress < 1) {
      setProgressMsg(`${Math.floor(progress * 10000) / 100}%`);
    } else {
      setProgressMsg(``);
    }

    if (progress > 1) {
      setCompressing(false);
    } else {
      setCompressing(true);
    }
  });

  return (
    <>
      <Menu>
        <MenuButton
          colorScheme="blackAlpha"
          zIndex={1000}
          position="absolute"
          left="20px"
          top="20px"
          size={["xs", "sm", "md"]}
          as={Button}
          value={["Сжать", "Конвертировать", " Конвертировать и скачать"]}
        >
          Конвертировать и загрузить
        </MenuButton>
        <MenuList>
          {compressFormats.map(
            ({ format, customFormatting, codec, codecLib }) => (
              <MenuItem
                key={`${format}_${codec}`}
                data-type={format}
                data-customformatting={customFormatting}
                data-codeclib={codecLib}
                onClick={onCompress}
              >
                {`${format} ${codec ?? ""}`}
              </MenuItem>
            )
          )}
        </MenuList>
      </Menu>
      <Progress
        visibility={isCompressing ? "visible" : "hidden"}
        hasStripe
        value={convProgress * 100}
      />
      <Text
        color="white"
        bg="black"
        position="absolute"
        left="0px"
        top="0px"
        fontSize={["xs", "sm", "xs"]}
      >
        {progressMsg}
      </Text>
    </>
  );
};

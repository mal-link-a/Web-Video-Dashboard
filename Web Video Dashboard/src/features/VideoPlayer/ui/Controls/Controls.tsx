import { CustomSlider } from "@/shared/components/CustomSlider";
import { SpeedIcon } from "@/shared/components/Icons/SpeedIcon";
import { VolumeIcon } from "@/shared/components/Icons/VolumeIcon";
import { Box, HStack, VStack, Text, Button } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { PlaybackProgress } from "../PlaybackProgress/PlaybackProgress";
import { PauseIcon } from "@/shared/components/Icons/PauseIcon";
import { PlayIcon } from "@/shared/components/Icons/PlayIcon";
import FilePlayer from "react-player/file";
import { Screenshoter } from "../Screenshoter/Screenshoter";
import { VideoCompressor } from "../VideoPlayer/VideoCompressor/VideoCompressor";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FullscreenIcon } from "@/shared/components/Icons/FullscreenIcon";

interface Props {
  onPauseSwitch: () => void;
  onChangeVolume: (val: number) => void;
  onChangePlaybackRate: (val: number) => void;
  onChangeSeekStart: () => void;
  onChangeSeek: (val: number) => void;
  onChangeSeekEnd: () => void;
  seekValue: number;
  seekMin: number;
  seekMax: number;
  videoDiration: string;
  videoPlayed: string;
  isPlaying: boolean;
  reactPlayer: FilePlayer | null;
  ffmpeg: FFmpeg;
  videoFile: File;
  isConverterLoaded: boolean;
  volume: number;
  onClickFullscreen: () => void;
}

export const Controls = ({
  onPauseSwitch,
  onChangeVolume,
  onChangePlaybackRate,
  onChangeSeekStart,
  onChangeSeek,
  onChangeSeekEnd,
  seekValue,
  seekMin,
  seekMax,
  videoDiration,
  videoPlayed,
  isPlaying,
  reactPlayer,
  ffmpeg,
  videoFile,
  isConverterLoaded,
  volume,
  onClickFullscreen,
}: Props) => {
  const pauseRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<boolean>(false);
  const timer = useRef<NodeJS.Timeout>(null);

  //Клик по области видео меняет воспроизведение/паузу
  const onClick = () => {
    onPauseSwitch();
  };
  //Движение мышки по области активирует видимость меню
  const onMouseMove = () => {
    setVisibility(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setVisibility(false);
    }, 1200);
  };

  //Подписываемся на ивенты и создаем таймер
  //По логике если не двигать мышкой, сработает таймер и спрячет меню
  //Надо бы проверить работу на мобилках
  useEffect(() => {
    timer.current = setTimeout(() => {
      setVisibility(false);
    }, 1200);
    const mRef = mainRef.current;
    const pRef = pauseRef.current;
    if (mRef != null) {
      mRef.addEventListener("mousemove", onMouseMove);
    }
    if (pRef != null) pRef.addEventListener("click", onClick);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (mRef != null) {
        mRef.removeEventListener("mousemove", onMouseMove);
      }
      if (pRef != null) pRef.removeEventListener("click", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      ref={mainRef}
      w="100%"
      h="100%"
      position="absolute"
      top="50%"
      left="50%"
      mr="-50%"
      transform="translate(-50%, -50%)"
    >
      <Box
        position="absolute"
        ref={mainRef}
        w="100%"
        h="100%"
        boxShadow={"0px -150px 80px -80px rgb(255, 255, 255) inset"}
        visibility={visibility ? "visible" : "hidden"}
      >
        <HStack
          zIndex={1000}
          gap="2%"
          position="absolute"
          left="0px"
          bottom="0px"
          w="100%"
          alignItems={"flex-end"}
          bg="transparent"
          pl={["12px", "20px"]}
          pr={["5px", "12px", "20px"]}
          pb={["14px", "20px"]}
        >
          <VStack h={["50px", "100px"]}>
            <CustomSlider
              orientation="vertical"
              onChangeProp={onChangeVolume}
              minVal={0}
              maxVal={1}
              step={0.01}
              valFormat={(num) => `${Math.round(num * 100)}%`}
              controlledValue={volume}
            />
            <VolumeIcon />
          </VStack>
          <VStack h={["50px", "100px"]}>
            <CustomSlider
              orientation="vertical"
              onChangeProp={onChangePlaybackRate}
              minVal={0.1}
              maxVal={1}
              step={0.01}
              valFormat={(num) => `х${num}`}
            />
            <SpeedIcon />
          </VStack>
          <VStack gap="0px" h={["30px", "45px"]} w="100%">
            <HStack w="100%" justifyContent={"space-between"}>
              <Text fontSize={["xs", "lg", "lg"]}>{videoPlayed}</Text>
              <Text fontSize={["xs", "lg", "lg"]}>{videoDiration}</Text>
            </HStack>
            <PlaybackProgress
              onChangeStart={onChangeSeekStart}
              onChange={onChangeSeek}
              onChangeEnd={onChangeSeekEnd}
              value={seekValue}
              min={seekMin}
              max={seekMax}
            />
          </VStack>
          <HStack>
            <Button
              variant="outline"
              size={["xs", "md", "md"]}
              onClick={onClickFullscreen}
            >
              <FullscreenIcon />
            </Button>
            <Button
              size={["xs", "md", "md"]}
              variant="outline"
              onClick={onPauseSwitch}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Screenshoter
              reactPlayer={reactPlayer}
              isVisible={!isPlaying && visibility}
            />{" "}
          </HStack>
        </HStack>
      </Box>
      {isConverterLoaded && visibility ? (
        <VideoCompressor ffmpegRef={ffmpeg} videoFile={videoFile} />
      ) : null}
      <Box position="absolute" ref={pauseRef} w="100%" h="80%" />
      {/* По сути полотно для остановки видео */}
    </Box>
  );
};

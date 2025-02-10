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
import { VideoCompressor } from "../VideoCompressor/VideoCompressor";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { FullscreenIcon } from "@/shared/components/Icons/FullscreenIcon";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setPlaybackRate,
  setVolume,
  switchPlaying,
} from "../../model/store/videoPlayerSlice";
import { secondsToTime } from "../../lib/secondsToTime";

interface Props {
  player: FilePlayer | null;
  ffmpeg: FFmpeg;
  videoFile: File;
  isConverterLoaded: boolean;
  onClickFullscreen: () => void;
}

export const Controls = ({
  player,
  ffmpeg,
  videoFile,
  isConverterLoaded,
  onClickFullscreen,
}: Props) => {
  const dispatch = useAppDispatch();
  const { volume, playedSec, duration, isPlaying } = useAppSelector(
    (state) => state.videoPlayer
  );

  const pauseRef = useRef<HTMLDivElement>(null); //Объект, который ловит клики на видеоокно для остановки видео
  const mainRef = useRef<HTMLDivElement>(null); //Объект, который ловит ивенты поинтера для работы интерфейса
  const [visibility, setVisibility] = useState<boolean>(false); //Видимость интерфейса
  const timer = useRef<NodeJS.Timeout>(null); //Таймер для интерфейса

  const onPauseSwitch = () => {
    dispatch(switchPlaying());
  };
  //Меняем громкость
  const onChangeVolume = (val: number) => {
    dispatch(setVolume(val));
    //setVolume(val);
  };
  //Меняем скорость воспроизведения
  const onChangePlaybackRate = (val: number) => {
    dispatch(setPlaybackRate(val));
    //setPlaybackRate(val);
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
    if (pRef != null) pRef.addEventListener("click", onPauseSwitch);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (mRef != null) {
        mRef.removeEventListener("mousemove", onMouseMove);
      }
      if (pRef != null) pRef.removeEventListener("click", onPauseSwitch);
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
              <Text fontSize={["xs", "lg", "lg"]}>
                {secondsToTime(playedSec)}
              </Text>
              <Text fontSize={["xs", "lg", "lg"]}>
                {secondsToTime(duration)}
              </Text>
            </HStack>
            <PlaybackProgress player={player} />
          </VStack>
          <HStack>
            <Button
              colorScheme="whiteAlpha"
              size={["xs", "md", "md"]}
              onClick={onClickFullscreen}
            >
              <FullscreenIcon />
            </Button>
            <Button
              size={["xs", "md", "md"]}
              colorScheme="whiteAlpha"
              onClick={onPauseSwitch}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Screenshoter
              reactPlayer={player}
              isVisible={!isPlaying && visibility}
            />{" "}
          </HStack>
        </HStack>
      </Box>
      {isConverterLoaded && visibility ? (
        <VideoCompressor ffmpeg={ffmpeg} videoFile={videoFile} />
      ) : null}
      <Box position="absolute" ref={pauseRef} w="100%" h="80%" />
      {/* По сути полотно для остановки видео */}
    </Box>
  );
};

import ReactPlayer from "react-player";
import { captureVideoFrame } from "capture-video-frame";

import { FFmpeg } from "@ffmpeg/ffmpeg";

import { BellIcon, DownloadIcon, TimeIcon } from "@chakra-ui/icons";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  HStack,
  Text,
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import { MdGraphicEq } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { PlayerProgress } from "../../model/types/PlayerProgress";
import { secondsToTime } from "../../lib/secondsToTime";
import { PauseIcon } from "../../../../shared/components/PauseIcon";
import { PlayIcon } from "../../../../shared/components/PlayIcon";
import { VideoFrame, VideoFrameFormat } from "../../model/types/VideoFrame";
import { downloadBlob } from "../../lib/downloadBlob";
import { ffmpegLoad } from "../../lib/ffmpegLoad";
import { CustomSlider } from "../../../../shared/components/CustomSlider";
import { VideoCompressor } from "./VideoCompressor/VideoCompressor";

//Документация React Player https://www.npmjs.com/package/react-player
//Документация capture-video-frame https://www.npmjs.com/package/capture-video-frame
//Документация Chakra UI v2 https://v2.chakra-ui.com/
//ffmpeg.wasm https://github.com/ffmpegwasm/ffmpeg.wasm

//FFMPEG на Vite не работает без правки конфига Vite https://github.com/ffmpegwasm/ffmpeg.wasm/issues/532#issuecomment-1676237863

//Захват скриншота https://github.com/CookPete/react-player/issues/341

export const VideoPlayer = () => {
  useEffect(() => {
    console.log("render VideoPlayer" + new Date());
  });
  //Инициируем FFMPEG
  useEffect(() => {
    const loadConverter = async () => {
      const isLoad = await ffmpegLoad(ffmpegRef.current);
      if (isLoad) {
        setConverterLoaded(isLoad);
      } else {
        //Обрабатываем
      }
    };
    loadConverter();
  }, []);

  const videoFile = useRef<File | null>(null);

  const [videoFilePath, setVideoFilePath] = useState<string>("");
  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setVideoFilePath(URL.createObjectURL(event.target.files[0]));
      videoFile.current = event.target.files[0];
    }
  };

  const [converterLoaded, setConverterLoaded] = useState<boolean>(false); //флаг загрузки ffmpeg
  const ffmpegRef = useRef(new FFmpeg());

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const player = useRef<ReactPlayer>(null);

  const [volume, setVolume] = useState<number>(1); //Громкость
  const [playbackRate, setPlaybackRate] = useState<number>(1); //Скорость воспроизведения
  const [played, setPlayed] = useState<number>(0); //Место проигрывания сейчас

  const [duration, setDuration] = useState<number>(0); //Длительность видео в секундах
  const [durationFormatted, setDurationFormatted] = useState<string>(""); //Визуальное отображение длительности видео (Формат MM:SS)

  //Стартовая точка для слайдера воспроизведения видео. Мы обрезаем видео на пяти минутах, поэтому она нужна.
  const [startPlaybackPoint, setStartPlaybactPoint] = useState<number>(0);

  const [playing, setPlaying] = useState<boolean>(false); // Воспроизведение/пауза

  const videoFrame = useRef<VideoFrame | boolean>(false); // Реф для захвата картинки для скриншотов

  const downloadMessage = useRef<string>("");
  //Меняем громкость
  const onChangeVolume = (val: number) => {
    setVolume(val);
  };

  const onChangeStartSeek = () => {
    setPlaying(false);
  };
  const onChangeSeek = (val: number) => {
    if (player.current) player.current.seekTo(val, "seconds");
    setPlayed(val);
  };

  //Выбрали перенос времени
  const onChangeEndSeek = () => {
    setPlaying(true);
  };

  //Меняем скорость воспроизведения
  const onChangePlaybackRate = (val: number) => {
    setPlaybackRate(val);
  };

  const onPause = () => {
    setPlaying((prev) => !prev);
  };

  //Загружаем картинку по клику. Инициируем ссылку, нажатие на неё и загрузку.
  const onTakeScreenshot = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const format = e.currentTarget.getAttribute("data-type");
    //Получаем изображение с помощью библиотеки capture-video-frame
    if (player.current !== null) {
      videoFrame.current = await captureVideoFrame(
        player.current.getInternalPlayer(),
        format,
        1
      );
      //Сохраняем
      if (typeof videoFrame.current != "boolean") {
        downloadBlob(videoFrame.current.blob);
      }
      //captureVideoFrame возвращает false, если не сработает
      else {
        throw new Error("captureVideoFrame не смог захватить изображение");
      }
    }
  };

  //cb плеера, вызывается на получении видео, возвращает длительность видео
  const onDuration = (val: number) => {
    //Если длительность видео боьше 5 минут, обрезаем начало и переносим произведение на 5 минут.
    if (val > 300) {
      console.log("duration > 300");
      const startPoint = val - 300;
      setStartPlaybactPoint(startPoint);
      setPlayed(startPoint);
    }
    setDuration(val);
    setDurationFormatted(secondsToTime(val));
    setPlaying(true);
  };
  //cb плеера вызывается, когда начинает играть медиа
  const onStart = () => {
    if (player.current) player.current.seekTo(duration - 300, "seconds");
  };

  //cb плеера, вызывается по интервалу, возвращает объект с данными проигрывания и загрузки видео
  const onProgress = (obj: PlayerProgress) => {
    setPlayed(obj.playedSeconds);
  };
  const ffmpeg = ffmpegRef.current;
  // Listen to progress event instead of log.
  ffmpeg.on("progress", ({ progress, time }) => {
    downloadMessage.current = `${progress * 100} % (transcoded time: ${
      time / 1000000
    } s)`;
  });

  return (
    <>
      <Input type="file" onChange={handleVideoUpload} size="md" mb="40px" />
      <ReactPlayer
        playing={playing}
        ref={player}
        volume={volume}
        playbackRate={playbackRate}
        controls={false}
        onProgress={onProgress}
        onDuration={onDuration}
        onStart={onStart}
        progressInterval={1000 / playbackRate}
        url={videoFilePath}
        config={{
          file: {
            attributes: {
              crossOrigin: "anonymous",
            },
          },
        }}
      />
      <Box p={4} pt={6}>
        <Text>{`${secondsToTime(played)} из ${durationFormatted}`}</Text>
        <Slider
          mb="40px"
          aria-label="slider-ex-4"
          min={startPlaybackPoint}
          max={duration}
          value={played}
          onChangeStart={onChangeStartSeek}
          onChange={onChangeSeek}
          onChangeEnd={onChangeEndSeek}
        >
          <SliderTrack bg="red.100">
            <SliderFilledTrack bg="tomato" />
          </SliderTrack>
          <SliderThumb boxSize={6}>
            <Box color="tomato" as={MdGraphicEq} />
          </SliderThumb>
        </Slider>

        <HStack mb="40px">
          <BellIcon />
          <CustomSlider
            onChangeProp={onChangeVolume}
            minVal={0}
            maxVal={1}
            step={0.01}
            valFormat={(num) => `${Math.round(num * 100)}%`}
          />
        </HStack>
        <HStack>
          <TimeIcon />
          <CustomSlider
            onChangeProp={onChangePlaybackRate}
            minVal={0.1}
            maxVal={1}
            step={0.01}
            valFormat={(num) => `х${num}`}
          />
        </HStack>

        <HStack mt="30px" gap="10px">
          <Button onClick={onPause}>
            {videoFile.current != null ? (
              playing ? (
                <PauseIcon />
              ) : (
                <PlayIcon />
              )
            ) : null}
          </Button>
          {!playing && videoFile.current != null ? (
            <Menu>
              <MenuButton as={Button}>
                <DownloadIcon />
              </MenuButton>
              <MenuList>
                {Object.entries(VideoFrameFormat).map(([key, value]) => (
                  <MenuItem
                    key={key}
                    data-type={value}
                    onClick={onTakeScreenshot}
                  >
                    {key}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          ) : null}
        </HStack>
        {converterLoaded && videoFile.current != null ? (
          <VideoCompressor
            ffmpegRef={ffmpegRef.current}
            videoFile={videoFile.current}
          />
        ) : null}
      </Box>
    </>
  );
};

//https://github.com/CookPete/react-player/issues/638

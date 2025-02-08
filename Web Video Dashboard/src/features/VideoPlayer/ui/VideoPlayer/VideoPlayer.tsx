import ReactPlayer from "react-player";
import { captureVideoFrame } from "capture-video-frame";

import { BellIcon, DownloadIcon, TimeIcon } from "@chakra-ui/icons";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  HStack,
  Tooltip,
  Text,
  Input,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";

import { MdGraphicEq } from "react-icons/md";
import { useRef, useState } from "react";
import { PlayerProgress } from "../../model/types/PlayerProgress";
import { secondsToTime } from "../../lib/secondsToTime";
import { PauseIcon } from "../../../../shared/components/PauseIcon";
import { PlayIcon } from "../../../../shared/components/PlayIcon";
import { VideoFrame, VideoFrameFormat } from "../../model/types/VideoFrame";
import { downloadScreenshot } from "../../lib/downloadScreenshot";

//Документация React Player https://www.npmjs.com/package/react-player
//Документация capture-video-frame https://www.npmjs.com/package/capture-video-frame
//Документация Chakra UI v2 https://v2.chakra-ui.com/

//ЗАХВАТ СКРИНШОТА
// https://github.com/CookPete/react-player/issues/341

export const VideoPlayer = () => {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~~~Создадим путь~~~~~~~~~~~~~~~~~~~~~~~~
  //https://stackoverflow.com/questions/60794257/react-js-react-player-how-to-play-local-video
  const [videoFilePath, setVideoFilePath] = useState<string>("");
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files)
      setVideoFilePath(URL.createObjectURL(event.target.files[0]));
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const player = useRef<ReactPlayer>(null);

  const [volume, setVolume] = useState<number>(1); //Громкость
  const [playbackRate, setPlaybackRate] = useState<number>(1); //Скорость воспроизведения
  const [played, setPlayed] = useState<number>(0); //Место проигрывания сейчас

  const [duration, setDuration] = useState<number>(0);
  const [durationFormatted, setDurationFormatted] = useState<string>(""); //Визуальное отображение длительности видео

  const [startPlaybackPoint, setStartPlaybactPoint] = useState<number>(0);

  const [volumeTooltip, setVolumeTooltip] = useState(false); //Отображение текущих значений при наведении на слайдеры
  const [playbackRateTooltip, setPlaybackRateTooltip] = useState(false); //Отображение текущих значений при наведении на слайдеры

  const [playing, setPlaying] = useState<boolean>(false); // Воспроизведение/пауза

  const videoFrame = useRef<VideoFrame | boolean>(false);
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
  const onTakeScreenshot = async (format: VideoFrameFormat) => {
    //Получаем изображение с помощью библиотеки capture-video-frame
    if (player.current !== null) {
      videoFrame.current = await captureVideoFrame(
        player.current.getInternalPlayer(),
        format,
        1
      );

      //Сохраняем

      if (typeof videoFrame.current != "boolean") {
        downloadScreenshot(videoFrame.current.blob);
      }
      //captureVideoFrame возвращает false, если не сработает
      else {
        throw new Error("captureVideoFrame не смог захватить изображение");
      }
    }
  };

  //cb плеера, вызывается на получении видео, возвращает длительность видео
  const onDuration = (val: number) => {
    console.log("Длительность " + val);
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
  const onStart = () => {
    if (player.current) player.current.seekTo(duration - 300, "seconds");
  };

  //cb плеера, вызывается раз в секунду, возвращает объект с данными проигрывания и загрузки видео
  const onProgress = (obj: PlayerProgress) => {
    setPlayed(obj.playedSeconds);
  };

  //Запихать его в отдельный компонент,
  const timeLabel = (value: number) => {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value - minutes * 60);
    if (seconds < 10) return `${minutes}:0${seconds}`;
    return `${minutes}:${seconds}`;
  };

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
        <Text>{`${timeLabel(played)} из ${durationFormatted}`}</Text>
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
          <Slider
            max={1}
            min={0}
            step={0.01}
            aria-label="slider-ex-4"
            defaultValue={30}
            onChange={onChangeVolume}
            onMouseEnter={() => setVolumeTooltip(true)}
            onMouseLeave={() => setVolumeTooltip(false)}
          >
            <Tooltip
              hasArrow
              bg="teal.500"
              color="white"
              placement="top"
              isOpen={volumeTooltip}
              label={`${Math.round(volume * 100)}%`}
            >
              <SliderThumb />
            </Tooltip>
            <SliderTrack bg="red.100">
              <SliderFilledTrack bg="tomato" />
            </SliderTrack>
            <SliderThumb boxSize={6}>
              <Box color="tomato" as={MdGraphicEq} />
            </SliderThumb>
          </Slider>
        </HStack>
        <HStack>
          <TimeIcon />
          <Slider
            max={2}
            min={0.25}
            step={0.01}
            aria-label="slider-ex-4"
            defaultValue={1}
            onMouseEnter={() => setPlaybackRateTooltip(true)}
            onMouseLeave={() => setPlaybackRateTooltip(false)}
            onChange={onChangePlaybackRate}
          >
            <Tooltip
              hasArrow
              bg="teal.500"
              color="white"
              placement="top"
              isOpen={playbackRateTooltip}
              label={`x${playbackRate}`}
            >
              <SliderThumb />
            </Tooltip>
            <SliderTrack bg="red.100">
              <SliderFilledTrack bg="tomato" />
            </SliderTrack>
            <SliderThumb boxSize={6}>
              <Box color="tomato" as={MdGraphicEq} />
            </SliderThumb>
          </Slider>
        </HStack>

        <HStack mt="30px" gap="10px">
          <Button onClick={onPause}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </Button>

          <Menu>
            <MenuButton as={Button}>
              <DownloadIcon />
            </MenuButton>
            <MenuList>
              <MenuItem
                onClick={() => {
                  onTakeScreenshot(VideoFrameFormat.jpg);
                }}
              >
                {VideoFrameFormat.jpg}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onTakeScreenshot(VideoFrameFormat.png);
                }}
              >
                {VideoFrameFormat.png}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>
    </>
  );
};

//https://github.com/CookPete/react-player/issues/638

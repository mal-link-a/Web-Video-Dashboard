import ReactPlayer from "react-player/file";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Box, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { PlayerProgress } from "../../model/types/PlayerProgress";
import { secondsToTime } from "../../lib/secondsToTime";
import { ffmpegLoad } from "../../lib/ffmpegLoad";
import { Controls } from "../Controls/Controls";
import { useToast } from "@chakra-ui/react";
import { DownloadIcon } from "@/shared/components/Icons/DownloadIcon";
import screenfull from "screenfull";

//Документация React Player https://www.npmjs.com/package/react-player
//Документация capture-video-frame https://www.npmjs.com/package/capture-video-frame
//Документация Chakra UI v2 https://v2.chakra-ui.com/
//ffmpeg.wasm https://github.com/ffmpegwasm/ffmpeg.wasm
//Документация screenfull https://www.npmjs.com/package/screenfull
//Захват скриншота https://github.com/CookPete/react-player/issues/341

//FFMPEG.wasm на Vite не работает без правки конфига Vite https://github.com/ffmpegwasm/ffmpeg.wasm/issues/532#issuecomment-1676237863
//Иии FFMPEG.wasm не позволяет выбрать самостоятельно кодек для компрессии видео
//С одной стороны FFMPEG.wasm занимаются люди, погужённые в работу с видеофайлами,
//С другой - нельзя самостоятельно выбрать кодеки, только форматы.
//Если хотим сами выбирать кодеки, то нужно пробовать разворачивать в воркерах основной FFMPEG.

export const VideoPlayer = () => {
  const toast = useToast(); //Всплывающее окно. Используем на обработку ошибок

  const videoFile = useRef<File | null>(null); //Реф текущего выюранного видеофайла
  //Инициируем FFMPEG.wasm
  useEffect(() => {
    const loadConverter = async () => {
      const isLoad = await ffmpegLoad(ffmpegRef.current);
      if (isLoad) {
        setConverterLoaded(isLoad);
      } else {
        //Обрабатываем
        //Показываем всплывающее окно об ошибке.
        toast({
          title: `Не удалось запустить FFMPEG.wasm. Компрессия видео будет недоступна`,
          status: "error",
          isClosable: true,
        });
      }
    };
    loadConverter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    if (key === " ") {
      onPauseSwitch();
    } else if (key === "+") {
      setVolume((prev) => Math.min(1, prev + 0.05));
    } else if (key === "-") {
      setVolume((prev) => Math.max(0, prev - 0.05));
    }
  };

  const [videoFilePath, setVideoFilePath] = useState<string>("");
  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      setVideoFilePath(URL.createObjectURL(event.target.files[0]));
      videoFile.current = event.target.files[0];
    }
  };

  const [isConverterLoaded, setConverterLoaded] = useState<boolean>(false); //флаг загрузки ffmpeg
  const ffmpegRef = useRef(new FFmpeg());

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const player = useRef<ReactPlayer>(null);
  const fulscreenRef = useRef<HTMLDivElement>(null);

  const [volume, setVolume] = useState<number>(1); //Громкость
  const [playbackRate, setPlaybackRate] = useState<number>(1); //Скорость воспроизведения
  const [played, setPlayed] = useState<number>(0); //Место проигрывания сейчас

  const [duration, setDuration] = useState<number>(0); //Длительность видео в секундах
  const [durationFormatted, setDurationFormatted] = useState<string>(""); //Визуальное отображение длительности видео (Формат MM:SS)

  //Стартовая точка для слайдера воспроизведения видео. Мы обрезаем видео на пяти минутах, поэтому она нужна.
  const [startPlaybackPoint, setStartPlaybactPoint] = useState<number>(0);

  const [isPlaying, setPlaying] = useState<boolean>(false); // Воспроизведение/пауза

  const downloadMessage = useRef<string>("");
  //Меняем громкость
  const onChangeVolume = (val: number) => {
    setVolume(val);
  };

  const onChangeSeekStart = () => {
    setPlaying(false);
  };
  const onChangeSeek = (val: number) => {
    if (player.current) player.current.seekTo(val, "seconds");
    setPlayed(val);
  };

  //Выбрали перенос времени
  const onChangeSeekEnd = () => {
    setPlaying(true);
  };

  //Меняем скорость воспроизведения
  const onChangePlaybackRate = (val: number) => {
    setPlaybackRate(val);
  };

  const onPauseSwitch = () => {
    setPlaying((prev) => !prev);
  };

  const onClickFullscreen = () => {
    if (screenfull.isFullscreen) {
      screenfull.exit();
    } else {
      if (fulscreenRef.current) screenfull.request(fulscreenRef.current);
    }
  };

  //cb плеера, вызывается на получении видео, возвращает длительность видео
  const onDuration = (val: number) => {
    //Если длительность видео боьше 5 минут, обрезаем начало и переносим произведение на 5 минут.
    if (val > 300) {
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
      <label>
        <Input
          position="absolute"
          visibility="hidden"
          type="file"
          onChange={handleVideoUpload}
          size="md"
          mb="40px"
        />
        <DownloadIcon size="48px" />
      </label>

      <Box ref={fulscreenRef} position="relative" w="100%">
        <ReactPlayer
          width="100%"
          height="100%"
          playing={isPlaying}
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
            attributes: {
              crossOrigin: "anonymous",
            },
          }}
        ></ReactPlayer>
        {videoFile.current != null ? (
          <Controls
            onPauseSwitch={onPauseSwitch}
            onChangeVolume={onChangeVolume}
            onChangePlaybackRate={onChangePlaybackRate}
            onChangeSeekStart={onChangeSeekStart}
            onChangeSeek={onChangeSeek}
            onChangeSeekEnd={onChangeSeekEnd}
            seekValue={played}
            seekMin={startPlaybackPoint}
            seekMax={duration}
            videoDiration={durationFormatted}
            videoPlayed={secondsToTime(played)}
            isPlaying={isPlaying}
            reactPlayer={player.current}
            ffmpeg={ffmpegRef.current}
            videoFile={videoFile.current}
            isConverterLoaded={isConverterLoaded}
            volume={volume}
            onClickFullscreen={onClickFullscreen}
          />
        ) : null}
      </Box>
    </>
  );
};

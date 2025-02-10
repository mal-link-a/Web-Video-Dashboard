import ReactPlayer from "react-player/file";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Box, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { PlayerProgress } from "../../model/types/PlayerProgress";
import { ffmpegLoad } from "../../lib/ffmpegLoad";
import { Controls } from "../Controls/Controls";
import { useToast } from "@chakra-ui/react";
import { DownloadIcon } from "@/shared/components/Icons/DownloadIcon";
import screenfull from "screenfull";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import {
  minusVolume,
  plusVolume,
  setDuration,
  setPlaying,
  setStartPoint,
  setVideoPlayed,
  switchPlaying,
} from "../../model/store/videoPlayerSlice";
//Документация React Player https://www.npmjs.com/package/react-player
//Документация capture-video-frame https://www.npmjs.com/package/capture-video-frame
//Документация Chakra UI v2 https://v2.chakra-ui.com/
//Документация ffmpeg.wasm https://github.com/ffmpegwasm/ffmpeg.wasm
//Документация Ffmpeg https://www.ffmpeg.org/ffmpeg.html
//Документация screenfull https://www.npmjs.com/package/screenfull
//Документация Redux Toolkit https://redux-toolkit.js.org/
//Захват скриншота https://github.com/CookPete/react-player/issues/341

//FFMPEG.wasm на Vite не работает без правки конфига Vite https://github.com/ffmpegwasm/ffmpeg.wasm/issues/532#issuecomment-1676237863
//Иии FFMPEG.wasm не позволяет выбрать самостоятельно кодек для компрессии видео
//С одной стороны FFMPEG.wasm занимаются люди, погужённые в работу с видеофайлами,
//С другой - нельзя адекватно самостоятельно выбрать кодеки, только форматы.
//Если хотим сами выбирать кодеки, то нужно разворачивать что-то другое

export const VideoPlayer = () => {
  const { volume, playbackRate, duration, isPlaying } = useAppSelector(
    (state) => state.videoPlayer
  );
  const dispatch = useAppDispatch();

  const fulscreenRef = useRef<HTMLDivElement>(null); //Итем для показа в полноэкранном режиме
  const [videoFilePath, setVideoFilePath] = useState<string>("");
  const [isConverterLoaded, setConverterLoaded] = useState<boolean>(false); //флаг загрузки ffmpeg
  const ffmpegRef = useRef(new FFmpeg());
  const player = useRef<ReactPlayer>(null); //Проигрыватель
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
          position: "top",
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

  //Простенькие способы управления с клавиатуры
  const onKeyDown = (e: KeyboardEvent) => {
    const key = e.key;
    if (key === " ") {
      onPauseSwitch();
    } else if (key === "+") {
      dispatch(plusVolume());
    } else if (key === "-") {
      dispatch(minusVolume());
    }
  };

  //Загрузка видео в проигрыватель
  const onVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setVideoFilePath(URL.createObjectURL(event.target.files[0]));
      videoFile.current = event.target.files[0];
    }
  };

  //Воспроизведение/Пауза
  const onPauseSwitch = () => {
    dispatch(switchPlaying());
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
      dispatch(setStartPoint(startPoint));
      toast({
        position: "top",
        title: `Будут показаны последние 5 минут видеофайла`,
        status: "info",
        isClosable: true,
      });
    }
    dispatch(setDuration(val));
    dispatch(setPlaying(true));
  };
  //cb плеера вызывается, когда начинает играть медиа
  const onStart = () => {
    if (player.current) player.current.seekTo(duration - 300, "seconds");
  };

  //cb плеера, вызывается по интервалу, возвращает объект с данными проигрывания и загрузки видео
  const onProgress = (obj: PlayerProgress) => {
    const { played, playedSeconds } = obj;
    dispatch(setVideoPlayed([played, playedSeconds]));
  };

  return (
    <>
      <label>
        <Input
          position="absolute"
          visibility="hidden"
          type="file"
          onChange={onVideoUpload}
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
          progressInterval={250 / playbackRate} //Время обновления плеера и по сути ререндеры компонента
          url={videoFilePath}
          config={{
            attributes: {
              crossOrigin: "anonymous",
            },
          }}
        ></ReactPlayer>
        {videoFile.current != null ? (
          <Controls
            player={player.current}
            ffmpeg={ffmpegRef.current}
            videoFile={videoFile.current}
            isConverterLoaded={isConverterLoaded}
            onClickFullscreen={onClickFullscreen}
          />
        ) : null}
      </Box>
    </>
  );
};

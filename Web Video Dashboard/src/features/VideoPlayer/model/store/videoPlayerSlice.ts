import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store/store";

interface VideoPlayerSlice {
  videoFile: File | null; //Файл для проигрывателя
  volume: number; //Громкость проигрывателя
  playbackRate: number; //Скорость воспроизведения
  duration: number; //Длительность видео в секундах
  startPlaybackPoint: number; //Стартовая точка для слайдера воспроизведения видео. Мы обрезаем видео на пяти минутах, поэтому она нужна.
  isPlaying: boolean; // Воспроизведение/пауза
  playedSec: number; // Текущее место проигрывания видео в отображаемом формате
  played: number; //текущее место проигрывания от 0 до 1
}

const initialState: VideoPlayerSlice = {
  videoFile: null,
  volume: 1,
  playbackRate: 1,
  duration: 0,
  startPlaybackPoint: 0,
  isPlaying: false,
  playedSec: 0,
  played: 0,
};

export const videoPlayerSlice = createSlice({
  name: "videoPlayer",
  initialState,
  reducers: {
    setVideoFile: (state, action: PayloadAction<File>) => {
      state.videoFile = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    plusVolume: (state) => {
      state.volume = Math.min(1, state.volume + 0.05);
    },
    minusVolume: (state) => {
      state.volume = Math.max(0, state.volume - 0.05);
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setStartPoint: (state, action: PayloadAction<number>) => {
      state.startPlaybackPoint = action.payload;
    },
    switchPlaying: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setVideoPlayed: (state, action: PayloadAction<[number, number]>) => {
      state.playedSec = action.payload[1];
      state.played = action.payload[0];
    },
  },
});

export const {
  setVideoFile,
  setVolume,
  plusVolume,
  minusVolume,
  setPlaybackRate,
  setDuration,
  setStartPoint,
  switchPlaying,
  setPlaying,
  setVideoPlayed,
} = videoPlayerSlice.actions;
export const selectVideoPlayerVolume = (state: RootState) =>
  state.videoPlayer.volume;
export default videoPlayerSlice.reducer;

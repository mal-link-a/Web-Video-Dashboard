import videoPlayerSlice from "@/features/VideoPlayer/model/store/videoPlayerSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    videoPlayer: videoPlayerSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

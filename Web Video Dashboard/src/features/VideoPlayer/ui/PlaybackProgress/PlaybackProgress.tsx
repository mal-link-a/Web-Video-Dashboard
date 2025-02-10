import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
} from "@chakra-ui/react";
import { MdGraphicEq } from "react-icons/md";
import { setPlaying, setVideoPlayed } from "../../model/store/videoPlayerSlice";
import FilePlayer from "react-player/file";

interface Props {
  player: FilePlayer | null;
}

export const PlaybackProgress = ({ player }: Props) => {
  const dispatch = useAppDispatch();
  const { played, duration, startPlaybackPoint } = useAppSelector(
    (state) => state.videoPlayer
  );

  //Перематываем видео
  const onChangeStart = () => {
    dispatch(setPlaying(false));
    //setPlaying(false);
  };
  const onChange = (val: number) => {
    if (player) {
      player.seekTo(val, "seconds");
      dispatch(setVideoPlayed([val / duration, val]));
    }
  };
  //Выбрали перенос времени
  const onChangeEnd = () => {
    dispatch(setPlaying(true));
    //setPlaying(true);
  };

  return (
    <Slider
      mb="40px"
      aria-label="slider-ex-4"
      min={startPlaybackPoint}
      max={duration}
      value={played * (300 - (300 - duration))}
      onChangeStart={onChangeStart}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
    >
      <SliderTrack bg="red.100">
        <SliderFilledTrack bg="tomato" />
      </SliderTrack>
      <SliderThumb boxSize={5}>
        <Box color="tomato" as={MdGraphicEq} />
      </SliderThumb>
    </Slider>
  );
};

import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
} from "@chakra-ui/react";
import { MdGraphicEq } from "react-icons/md";

interface Props {
  onChangeStart: () => void;
  onChange: (val: number) => void;
  onChangeEnd: () => void;
  value: number;
  min: number;
  max: number;
}

export const PlaybackProgress = ({
  onChangeStart,
  onChange,
  onChangeEnd,
  value,
  min,
  max,
}: Props) => {
  return (
    <Slider
      mb="40px"
      aria-label="slider-ex-4"
      min={min}
      max={max}
      value={value}
      onChangeStart={onChangeStart}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
    >
      <SliderTrack bg="red.100">
        <SliderFilledTrack bg="tomato" />
      </SliderTrack>
      <SliderThumb boxSize={6}>
        <Box color="tomato" as={MdGraphicEq} />
      </SliderThumb>
    </Slider>
  );
};

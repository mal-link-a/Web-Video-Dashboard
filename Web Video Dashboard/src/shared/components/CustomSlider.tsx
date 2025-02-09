import {
  Box,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdGraphicEq } from "react-icons/md";

interface Props {
  onChangeProp: (value: number) => void; //Колбэк на изменение значения
  minVal: number; //Минимальное значение в слайдере
  maxVal: number; //Максимальное
  step: number; //Шаг изменения
  defaultVal?: number; //Стандартное значение. Если не указываем, то 1
  valFormat: (value: number) => string; //Функция, форматирующая отображение текущего значения в тултипе
  orientation?: "horizontal" | "vertical";
  controlledValue?: number; //При необходимости превращаем слайдер в контролируемый компонент.
}

export const CustomSlider = ({
  onChangeProp,
  minVal,
  maxVal,
  step,
  defaultVal,
  valFormat,
  orientation,
  controlledValue,
}: Props) => {
  const [value, setValue] = useState<number>(1);
  const [valueLabel, setValueLabel] = useState<string>("");
  const [tooltipVisiblity, setTooltipVisiblity] = useState<boolean>(false); //Отображение текущих значений при наведении на слайдеры

  useEffect(() => {
    setValue(defaultVal ?? 1);
    setValueLabel(valFormat(defaultVal ?? 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (_value: number) => {
    setValue(_value);
    setValueLabel(valFormat(_value));
    onChangeProp(_value);
  };

  return (
    <Slider
      orientation={orientation ?? "horizontal"}
      max={maxVal}
      min={minVal}
      step={step}
      defaultValue={defaultVal ?? 1}
      aria-label="slider-ex-4"
      value={controlledValue ?? value}
      onChange={onChange}
      onMouseEnter={() => setTooltipVisiblity(true)}
      onMouseLeave={() => setTooltipVisiblity(false)}
    >
      <Tooltip
        hasArrow
        bg="teal.500"
        color="white"
        placement="top"
        isOpen={tooltipVisiblity}
        label={valueLabel}
      >
        <SliderThumb />
      </Tooltip>
      <SliderTrack bg="red.100">
        <SliderFilledTrack bg="tomato" />
      </SliderTrack>
      <SliderThumb boxSize={4}>
        <Box color="tomato" as={MdGraphicEq} />
      </SliderThumb>
    </Slider>
  );
};
